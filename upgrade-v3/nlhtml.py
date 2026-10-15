#!/usr/bin/env python3
"""Nestlancer v3 · HTML micro-parser used by the recomposer.

The prototype HTML is machine-generated, so a tiny tag-stream parser is enough
and it lets the recomposer re-emit untouched nodes byte-for-byte. The contract
`roundtrip(file) == file` is asserted over the whole tree before any edit runs.
"""
from __future__ import annotations

import re

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
RAWTEXT = {"script", "style"}

TAG_RE = re.compile(r"<(?P<end>/)?(?P<name>[a-zA-Z][a-zA-Z0-9-]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>", re.S)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
DECL_RE = re.compile(r"<[!?][^>]*>")   # <!DOCTYPE html>, <?xml ...?>
ATTR_RE = re.compile(r"(?P<name>[a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?P<q>\"(?P<vq>[^\"]*)\"|'(?P<vqs>[^']*)'|(?P<v>[^\s\"'=<>`]+)))?")


class Node:
    __slots__ = ("tag", "open_raw", "children", "parent", "tail_text", "selfclose")

    def __init__(self, tag=None, open_raw="", parent=None, selfclose=False):
        self.selfclose = selfclose
        self.tag = tag                 # None => document/root fragment
        self.open_raw = open_raw       # exact original opening tag text ("" for root)
        self.children = []             # Node (elements) and str (text) interleaved
        self.parent = parent
        self.tail_text = ""

    # ---- convenience -------------------------------------------------------
    def attr(self, name):
        if not self.open_raw:
            return None
        for m in ATTR_RE.finditer(self.open_raw[1:-1]):
            if m.group("name").lower() == name.lower():
                v = m.group("vq")
                if v is None:
                    v = m.group("vqs")
                if v is None:
                    v = m.group("v")
                return "" if v is None else v
        return None

    def has_attr(self, name):
        if not self.open_raw:
            return False
        for m in ATTR_RE.finditer(self.open_raw[1:-1]):
            if m.group("name").lower() == name.lower():
                return True
        return False

    def set_attr(self, name, value):
        """Set or add an attribute on the opening tag (value=None adds a boolean attr)."""
        m = re.match(r"^<([^>\s]+)(.*?)(/?)>$", self.open_raw, re.S)
        if not m:
            return
        tagname, attrs, sc = m.group(1), m.group(2), m.group(3)
        for am in ATTR_RE.finditer(attrs):
            if am.group("name").lower() == name.lower():
                new = f'{name}="{value}"' if value is not None else name
                attrs = attrs[:am.start()] + new + attrs[am.end():]
                self.open_raw = f"<{tagname}{attrs}{sc}>"
                return
        add = f' {name}="{value}"' if value is not None else f" {name}"
        self.open_raw = f"<{tagname}{attrs}{add}{sc}>"

    def del_attr(self, name):
        """Remove an attribute from the opening tag. No-op when absent."""
        m = re.match(r"^<([^>\s]+)(.*?)(/?)>$", self.open_raw, re.S)
        if not m:
            return
        tagname, attrs, sc = m.group(1), m.group(2), m.group(3)
        for am in ATTR_RE.finditer(attrs):
            if am.group("name").lower() == name.lower():
                attrs = attrs[:am.start()] + attrs[am.end():]
                self.open_raw = f"<{tagname}{attrs}{sc}>"
                return

    def set_attrs(self, pairs):
        for name, value in pairs:
            self.set_attr(name, value)

    def classes(self):
        c = self.attr("class") or ""
        return c.split()

    def has_class(self, name):
        return name in self.classes()

    def add_class(self, *names):
        cur = self.attr("class") or ""
        parts = cur.split()
        for n in names:
            if n not in parts:
                parts.append(n)
        self.set_attr("class", " ".join(parts))

    def text(self):
        out = []
        for ch in self.children:
            if isinstance(ch, str):
                out.append(ch)
            else:
                out.append(ch.text())
        return "".join(out)

    def text_flat(self):
        return re.sub(r"\s+", " ", self.text()).strip()

    def find_all(self, tag=None, cls=None):
        res = []
        for ch in self.children:
            if isinstance(ch, str):
                continue
            if (tag is None or ch.tag == tag) and (cls is None or ch.has_class(cls)):
                res.append(ch)
            res.extend(ch.find_all(tag, cls))
        return res

    def find(self, tag=None, cls=None):
        found = self.find_all(tag, cls)
        return found[0] if found else None

    def child_elements(self):
        return [ch for ch in self.children if isinstance(ch, Node)]

    def index_of(self, node):
        return self.children.index(node)

    def remove(self):
        self.parent.children.remove(self)
        self.parent = None

    def insert_before(self, node):
        self.parent.children.insert(self.parent.children.index(self), node)
        node.parent = self.parent

    def insert_after(self, node):
        self.parent.children.insert(self.parent.children.index(self) + 1, node)
        node.parent = self.parent

    def append(self, node):
        self.children.append(node)
        node.parent = self

    def prepend(self, node):
        self.children.insert(0, node)
        node.parent = self

    def replace_with(self, html_fragment):
        node = parse_fragment(html_fragment)
        first = node.children[0] if len(node.children) == 1 else node
        self.parent.children[self.parent.children.index(self)] = first
        first.parent = self.parent
        return first

    def outer(self):
        """Serialise this element exactly: original opening/closing text + children."""
        if self.tag is None:
            return "".join(ch.outer() if isinstance(ch, Node) else ch for ch in self.children)
        close = "" if (self.tag in VOID or self.selfclose) else f"</{self.tag}>"
        inner = "".join(ch.outer() if isinstance(ch, Node) else ch for ch in self.children)
        return f"{self.open_raw}{inner}{close}"


def parse(html: str) -> Node:
    """Parse an HTML fragment into a Node tree. Unknown/unclosed tags are tolerated
    (a stray close simply pops to the nearest matching open)."""
    root = Node()
    stack = [root]
    i, n = 0, len(html)
    while i < n:
        lt = html.find("<", i)
        if lt < 0:
            stack[-1].children.append(html[i:])
            break
        if lt > i:
            stack[-1].children.append(html[i:lt])
        m = COMMENT_RE.match(html, lt)
        if m:
            stack[-1].children.append(m.group(0))
            i = m.end()
            continue
        m = DECL_RE.match(html, lt)
        if m:
            stack[-1].children.append(m.group(0))
            i = m.end()
            continue
        m = TAG_RE.match(html, lt)
        if not m:
            # a literal '<' in text
            stack[-1].children.append(html[lt:lt + 1])
            i = lt + 1
            continue
        name = m.group("name").lower()
        raw = m.group(0)
        self_closing = raw.rstrip().endswith("/>")
        if m.group("end"):
            # closing tag: pop until matched
            for depth in range(len(stack) - 1, 0, -1):
                if stack[depth].tag == name:
                    node = stack.pop()
                    node.tail_text = raw  # remember exact close text (not used further)
                    while len(stack) > depth:
                        stack.pop()
                    break
            i = m.end()
            continue
        node = Node(name, raw, stack[-1], self_closing)
        stack[-1].children.append(node)
        if name in RAWTEXT:
            end = html.lower().find(f"</{name}", lt)
            if end < 0:
                end = n
            node.children.append(html[m.end():end])
            close_end = html.find(">", end)
            node.tail_text = html[end:close_end + 1] if close_end > 0 else ""
            i = (close_end + 1) if close_end > 0 else n
            continue
        if not self_closing and name not in VOID:
            stack.append(node)
        i = m.end()
    return root


def parse_fragment(html: str) -> Node:
    return parse(html.strip())


def first_element(html: str) -> Node:
    node = parse_fragment(html)
    for ch in node.children:
        if isinstance(ch, Node):
            return ch
    raise ValueError("fragment has no element")


def load(path: str):
    text = open(path, encoding="utf-8").read()
    return text, parse(text)


def roundtrip(path: str) -> bool:
    text, tree = load(path)
    return tree.outer() == text
