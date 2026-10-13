#!/usr/bin/env python3
# ============================================================================
# pass2_wire.py — PASS 2 (visual · layout · motion): wire every proto page into
# the shared motion + surface system. ATTRIBUTE-ONLY edits: classes, a data
# attribute on <body>, one <script> tag in <head>, and layout-only inline styles
# on three recurring KPI patterns. Text, numbers, IDs, links never change —
# verify with tools/proto/upgrade/data_guard.py.
#
#   body[data-surface]   admin | client | auth | marketing | public | hub | redirect
#   <head>               + <script src=".../shared/assets/proto-motion.js">
#   main.content > *     + .reveal   (entrance / scroll choreography)
#   .phead               + .anim-in  (header stagger on load)
#   .stats/.kpi-grid/
#   .stat-strip          + .stagger  (KPI cards rise in sequence)
#   attention tiles      div[style*="border-left:3px solid VAR"] → .att (+ --tone)
#   mini KPI panels      .grid > .panel[style="padding:14px 16px"] → .kpi-row/.kpi-cell
#   strip cells          .grid > div[style*="border-right:1px solid var(--line)"] → .kpi-row
#   marketing            hero → .mkt-hero (+ .anim-in on its wrap), sections → .reveal
#   auth                 .auth-form → .anim-in, .auth-rail-inner → .anim-in
#
# Idempotent: re-running adds nothing twice.
#   run: python3 tools/proto/upgrade/pass2_wire.py [--dry]
# ============================================================================
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
PROTO = REPO / "proto"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
TAG = re.compile(r"<!--.*?-->|<!\[CDATA\[.*?\]\]>|<!DOCTYPE[^>]*>|<(/?)([a-zA-Z][\w:-]*)((?:\"[^\"]*\"|'[^']*'|[^'\">])*)>", re.S | re.I)


class Node:
    __slots__ = ("tag", "attrs", "s", "e", "children", "parent", "close")

    def __init__(self, tag, attrs, s, e, parent):
        self.tag, self.attrs, self.s, self.e, self.parent = tag, attrs, s, e, parent
        self.children, self.close = [], None

    def cls(self):
        m = re.search(r'\bclass="([^"]*)"', self.attrs)
        return m.group(1).split() if m else []

    def style(self):
        m = re.search(r'\bstyle="([^"]*)"', self.attrs)
        return m.group(1) if m else ""


def parse(html):
    root = Node("#root", "", 0, 0, None)
    cur = root
    i = 0
    raw_until = None
    for m in TAG.finditer(html):
        if raw_until:
            if m.group(1) == "/" and (m.group(2) or "").lower() == raw_until:
                cur.close = (m.start(), m.end())
                cur = cur.parent
                raw_until = None
            continue
        if not m.group(2):
            continue
        closing, tag, attrs = m.group(1), m.group(2).lower(), m.group(3) or ""
        if closing:
            n = cur
            while n is not root and n.tag != tag:
                n = n.parent
            if n is not root:
                n.close = (m.start(), m.end())
                cur = n.parent
            continue
        node = Node(tag, attrs, m.start(), m.end(), cur)
        cur.children.append(node)
        if tag in VOID or attrs.rstrip().endswith("/"):
            continue
        cur = node
        if tag in ("script", "style"):
            raw_until = tag
    return root


def walk(n):
    yield n
    for c in n.children:
        yield from walk(c)


def text_of(html, n):
    if n.close is None:
        return ""
    inner = html[n.e:n.close[0]]
    return re.sub(r"<[^>]+>", " ", inner)


class Editor:
    def __init__(self, html):
        self.html = html
        self.tag_edits = {}      # node.s -> (node, new_open_tag)
        self.inserts = []        # (pos, text)
        self.replaces = []       # (start, end, text) — whole-range edits (pass2_polish)

    def open_tag(self, n):
        return self.tag_edits.get(n.s, (n, self.html[n.s:n.e]))[1]

    def set_open(self, n, new):
        self.tag_edits[n.s] = (n, new)

    def add_class(self, n, *names):
        t = self.open_tag(n)
        m = re.search(r'\bclass="([^"]*)"', t)
        have = m.group(1).split() if m else []
        add = [c for c in names if c not in have]
        if not add:
            return False
        if m:
            new_val = " ".join(have + add)
            t = t[:m.start(1)] + new_val + t[m.end(1):]
        else:
            t = re.sub(r"^<([a-zA-Z][\w:-]*)", lambda mm: f'<{mm.group(1)} class="{" ".join(add)}"', t, count=1)
        self.set_open(n, t)
        return True

    def remove_class(self, n, *names):
        t = self.open_tag(n)
        m = re.search(r'\bclass="([^"]*)"', t)
        if not m:
            return False
        have = m.group(1).split()
        keep = [c for c in have if c not in names]
        if keep == have:
            return False
        t = t[:m.start(1)] + " ".join(keep) + t[m.end(1):]
        self.set_open(n, t)
        return True

    def set_attr(self, n, name, value):
        t = self.open_tag(n)
        m = re.search(r'\b' + re.escape(name) + r'="([^"]*)"', t)
        if m:
            if m.group(1) == value:
                return False
            t = t[:m.start(1)] + value + t[m.end(1):]
        else:
            t = re.sub(r"^<([a-zA-Z][\w:-]*)", lambda mm: f'<{mm.group(1)} {name}="{value}"', t, count=1)
        self.set_open(n, t)
        return True

    def get_attr(self, n, name):
        m = re.search(r'\b' + re.escape(name) + r'="([^"]*)"', self.open_tag(n))
        return m.group(1) if m else None

    def result(self):
        out = self.html
        edits = [(n.s, n.e, t) for n, t in self.tag_edits.values()] + [(p, p, t) for p, t in self.inserts] \
            + [(s, e, t) for s, e, t in self.replaces]
        for s, e, t in sorted(edits, key=lambda x: (x[0], x[1]), reverse=True):
            out = out[:s] + t + out[e:]
        return out


def _has(n, pred):
    return any(pred(x) for x in walk(n))


def header_group(main):
    """Leading blocks of main.content that form the page header band:
    back link → page head / custom title row (h1) → meta rows → tabs."""
    kids = [c for c in main.children if c.tag not in ("script", "style", "dialog", "template")]
    if not kids or "pband" in kids[0].cls():
        return []
    group, seen_title, via_phead = [], False, False
    for i, c in enumerate(kids):
        cl = c.cls()
        is_h1_row = _has(c, lambda x: x.tag == "h1") and "panel" not in cl
        if "link-arrow" in cl and not seen_title:
            group.append(c); continue
        if "phead" in cl or is_h1_row:
            group.append(c); seen_title = True; via_phead = via_phead or "phead" in cl; continue
        if "tabs" in cl:
            if seen_title:
                group.append(c)
            elif i == 0 and len(kids) > 1 and "phead" in kids[1].cls():
                group.append(c); continue
            break
        if not seen_title:
            # breadcrumb-like row ahead of a custom title
            small = c.tag == "div" and "flex" in cl and not _has(c, lambda x: "panel" in x.cls() or x.tag in ("table", "form"))
            if small and i + 1 < len(kids) and _has(kids[i + 1], lambda x: x.tag == "h1"):
                group.append(c); continue
            break
        if via_phead:
            break
        # meta rows that belong to a custom title (chips, badges, progress, next-action bar)
        if "prog" in cl:
            group.append(c); continue
        if "grid" in cl and c.children and all("chip" in g.cls() for g in c.children):
            group.append(c); continue
        if "panel" in cl and len([g for g in c.children if "panel-row" in g.cls()]) == 1 and len(c.children) == 1 \
                and _has(c, lambda x: "btn" in x.cls()):
            group.append(c); continue
        if c.tag == "div" and "flex" in cl and not _has(c, lambda x: any(k in x.cls() for k in ("panel", "note", "grid")) or x.tag in ("table", "form", "h2", "h3")) \
                and sum(1 for _ in walk(c)) < 40:
            group.append(c); continue
        break
    if not seen_title:
        return []
    return group


def surface_of(rel, html, body_cls):
    p = rel.as_posix()
    if p == "proto/index.html":
        return "hub"
    if "location.replace(" in html and "app-shell" not in html:
        return "redirect"
    if "auth-split" in html or "auth-center" in html or "auth-card" in html:
        return "auth"
    if "app-body" in body_cls:
        return "admin" if "/apps/admin/" in p else "client"
    if "/apps/landing/" in p:
        return "marketing"
    return "public"


def wire(path):
    html = path.read_text(encoding="utf-8")
    rel = path.relative_to(REPO)
    root = parse(html)
    ed = Editor(html)
    stats = {}

    def bump(k):
        stats[k] = stats.get(k, 0) + 1

    body = next((n for n in walk(root) if n.tag == "body"), None)
    head = next((n for n in walk(root) if n.tag == "head"), None)
    if body is None:
        return html, stats
    surf = surface_of(rel, html, " ".join(body.cls()))
    if ed.set_attr(body, "data-surface", surf):
        bump("surface")

    # <head>: motion runtime, same relative prefix as ui.js
    m = re.search(r'<script src="([^"]*?)shared/assets/ui\.js"', html)
    if head is not None and m and "proto-motion.js" not in html:
        prefix = m.group(1)
        link = re.search(r'<link rel="stylesheet" href="[^"]*proto\.css">', html)
        pos = link.end() if link else head.close[0]
        ed.inserts.append((pos, f'\n<script src="{prefix}shared/assets/proto-motion.js"></script>'))
        bump("script")

    nodes = list(walk(root))

    # ---------------------------------------------------------- app pages
    main = next((n for n in nodes if n.tag == "main" and "content" in n.cls()), None)
    if main is not None:
        for c in main.children:
            if c.tag in ("script", "style", "dialog", "template"):
                continue
            if "phead" in c.cls():
                if ed.add_class(c, "anim-in"):
                    bump("anim-in")
                continue
            if "pband" in c.cls():          # header band shows at once; its children animate
                continue
            if ed.add_class(c, "reveal"):
                bump("reveal")

    if main is not None:
        group = header_group(main)
        if group:
            first, last = group[0], group[-1]
            ed.inserts.append((first.s, '<div class="pband">'))
            ed.inserts.append((last.close[1] if last.close else last.e, '</div>'))
            for c in group:
                if "link-arrow" in c.cls():
                    ed.remove_class(c, "reveal")
            bump("pband")

    for n in nodes:
        cl = n.cls()
        if any(k in cl for k in ("stats", "kpi-grid", "stat-strip")):
            if ed.add_class(n, "stagger"):
                bump("stagger")

    # attention tiles: <div style="padding:..;border-left:3px solid var(--x)">
    for n in nodes:
        if n.tag != "div" or "grid" not in n.cls():
            continue
        kids = [c for c in n.children if c.tag == "div"]
        tiles = [c for c in kids if re.search(r"border-left:\s*3px solid (var\(--[\w-]+\))", c.style())]
        if len(tiles) >= 3 and len(tiles) == len(kids):
            if ed.add_class(n, "att-grid", "stagger"):
                bump("att-grid")
            for t in tiles:
                tone = re.search(r"border-left:\s*3px solid (var\(--[\w-]+\))", t.style()).group(1)
                ed.add_class(t, "att")
                ed.set_attr(t, "style", f"--tone:{tone}")
                vals = [c for c in t.children if "mono" in c.cls() or "font-bold" in c.cls()]
                if vals:
                    ed.add_class(vals[-1], "att-v")
                bump("att")

    # mini KPI panels / strip cells → one joined strip
    for n in nodes:
        if n.tag != "div" or "grid" not in n.cls() or "att-grid" in ed.open_tag(n):
            continue
        kids = [c for c in n.children if c.tag in ("div", "a")]
        if len(kids) < 2 or len(kids) != len([c for c in n.children if c.tag not in ("script",)]):
            continue

        def is_metric(c):
            sub = [g for g in c.children if g.tag == "div"]
            if len(sub) < 2:
                return False
            lab = any(("dim" in g.cls() or "text-xs" in g.cls()) for g in sub[:1])
            val = any(("mono" in g.cls() and "font-bold" in g.cls()) or "stat-value" in g.cls() for g in sub[1:3])
            return lab and val

        panels = [c for c in kids if "panel" in c.cls() and re.match(r"^\s*padding:\s*1[2-8]px", c.style()) and is_metric(c)]
        strips = [c for c in kids if re.search(r"border-right:\s*1px solid var\(--line\)", c.style()) and is_metric(c)]
        if len(panels) == len(kids):
            if ed.add_class(n, "kpi-row", "stagger"):
                bump("kpi-row")
            for c in kids:
                ed.add_class(c, "kpi-cell")
        elif len(strips) == len(kids):
            ed.add_class(n, "kpi-row", "kpi-inset", "stagger")
            for c in kids:
                ed.add_class(c, "kpi-cell")
                ed.set_attr(c, "style", re.sub(r";?\s*border-right:\s*1px solid var\(--line\)", "", c.style()).strip(";"))
            bump("kpi-strip")

    # ---------------------------------------------------------- marketing / public
    pmain = next((n for n in nodes if n.tag == "main"), None)
    if surf in ("marketing", "public", "hub") and pmain is not None and "content" not in pmain.cls():
        blocks = [c for c in pmain.children if c.tag not in ("script", "style")]

        def wrap_of(b):
            if "mkt-wrap" in b.cls():
                return b
            return next((c for c in b.children if "mkt-wrap" in c.cls()), b)

        for idx, b in enumerate(blocks):
            w = wrap_of(b)
            if idx == 0:
                # hero: the element that holds the <h1> staggers its children on load
                ed.add_class(b, "mkt-hero")
                h1 = next((n for n in walk(b) if n.tag == "h1"), None)
                holder = h1.parent if h1 is not None else w
                if ed.add_class(holder, "anim-in"):
                    bump("hero")
                if holder is not w:
                    for c in w.children:
                        if c is holder or c.tag in ("script", "style") or holder in list(walk(c)):
                            continue
                        if ed.add_class(c, "reveal"):
                            bump("reveal")
                else:
                    for i, c in enumerate(w.children):
                        if c.tag == "section" or i >= 4:
                            if ed.add_class(c, "reveal"):
                                bump("reveal")
                continue
            for c in w.children:
                if c.tag in ("script", "style"):
                    continue
                if ed.add_class(c, "reveal"):
                    bump("reveal")
        # card grids rise one after another
        for n in nodes:
            if n.tag == "div" and "grid" in n.cls():
                kids = [c for c in n.children if c.tag in ("div", "a", "article")]
                cards = [c for c in kids if any(k in c.cls() for k in ("mkt-card", "panel", "pj-card", "card", "blog-card"))]
                if len(kids) >= 3 and len(cards) == len(kids):
                    if ed.add_class(n, "stagger"):
                        bump("stagger")

    # ---------------------------------------------------------- auth
    for n in nodes:
        cl = n.cls()
        if "auth-form" in cl or "auth-rail-inner" in cl or ("auth-card" in cl and n.tag != "main"):
            if ed.add_class(n, "anim-in"):
                bump("auth")

    return ed.result(), stats


def main():
    dry = "--dry" in sys.argv
    pages = sorted(PROTO.rglob("*.html"))
    total, changed = {}, 0
    for f in pages:
        new, st = wire(f)
        if st:
            changed += 1
            for k, v in st.items():
                total[k] = total.get(k, 0) + v
            if not dry:
                f.write_text(new, encoding="utf-8")
    print(f"pass2_wire: {changed}/{len(pages)} pages {'would change' if dry else 'wired'}")
    for k in sorted(total):
        print(f"  {k:10s} {total[k]}")


if __name__ == "__main__":
    main()
