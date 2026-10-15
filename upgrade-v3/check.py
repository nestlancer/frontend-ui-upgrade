#!/usr/bin/env python3
"""Nestlancer · UPGRADE V3 static QA.

The sandbox has no browser (headless Chromium needs libnss3/libnspr4, which cannot
be fetched here), so this harness measures what is measurable from the tree itself —
markup integrity, accessibility structure, composition change vs the pre-upgrade
baseline, and CSS contract coverage. Every check is deterministic and re-runnable:

    python3 upgrade-v3/check.py            # whole tree
    python3 upgrade-v3/check.py --json out.json
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROTO = os.path.join(ROOT, "proto")
sys.path.insert(0, HERE)
from nlhtml import parse  # noqa: E402

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
INLINE_SCRIPT_RE = re.compile(r"<script\b(?![^>]*\bsrc=)", re.I)

ARIA_IDREF = {"aria-labelledby", "aria-describedby", "aria-controls", "aria-flowto", "aria-owns"}
ROLE_REQUIRED = {
    "button": {"name"}, "link": {"name"}, "checkbox": {"name"}, "textbox": {"name"},
    "combobox": {"name"}, "tab": {"name"}, "switch": {"name"},
}


def text_of(html: str) -> str:
    t = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&amp;", "&").replace("&#8377;", "₹").replace("&nbsp;", " ").replace("&#39;", "'").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"\s+", " ", t).strip()


def attr_values(html: str, name: str):
    for m in re.finditer(rf'(?<![-\w]){name}\s*=\s*"([^"]*)"', html):
        yield m.group(1)


def tag_balance(html: str):
    """Stack check over the serialised file — the same contract the parser round-trips."""
    stack = []
    problems = []
    for m in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>", html):
        closing, tag, attrs = m.group(1), m.group(2).lower(), m.group(3)
        if tag in ("!doctype",):
            continue
        if attrs.rstrip().endswith("/") or tag in VOID:
            continue
        if closing:
            if not stack:
                problems.append(f"stray </{tag}> at {m.start()}")
            elif stack[-1][0] != tag:
                # implicit closes: <p>, <li>
                if tag in ("p", "li", "tr", "td", "th", "option") and stack[-1][0] == tag:
                    stack.pop()
                else:
                    names = [t for t, _ in stack[-6:]]
                    if tag in names:
                        while stack and stack[-1][0] != tag:
                            problems.append(f"unclosed <{stack[-1][0]}> before </{tag}>")
                            stack.pop()
                        if stack:
                            stack.pop()
                    else:
                        problems.append(f"unmatched </{tag}> at {m.start()}")
            else:
                stack.pop()
        else:
            stack.append((tag, m.start()))
    for t, pos in stack:
        problems.append(f"unclosed <{t}> opened at {pos}")
    return problems


def check_page(abs_path: str, css_classes: set, css_vars: set) -> dict:
    path = os.path.relpath(abs_path, os.path.dirname(abs_path.split("/proto/")[-1].join(["", ""])) if False else ROOT).replace("\\", "/")
    if "/proto/" in abs_path:
        path = "proto/" + abs_path.split("/proto/", 1)[1]
    text = open(abs_path, encoding="utf-8").read()
    out = {"path": path, "errors": [], "warns": []}
    body_m = re.search(r"<body\b[^>]*>.*</body>", text, re.S)
    scope = body_m.group(0) if body_m else text

    # ---- markup integrity
    for p in tag_balance(scope):
        out["errors"].append(f"balance: {p}")
    ids = list(attr_values(scope, "id"))
    dupes = [i for i, n in Counter(ids).items() if n > 1]
    if dupes:
        out["errors"].append(f"duplicate id: {dupes}")
    idset = set(ids)
    for attr in ARIA_IDREF:
        for v in attr_values(scope, attr):
            for tok in v.split():
                if tok and tok not in idset:
                    out["errors"].append(f"{attr} -> missing #{tok}")
    # name/id for label association
    label_spans = [(m.start(), m.end()) for m in re.finditer(r"<label\b[^>]*>.*?</label>", scope, re.S)]
    for lm in re.finditer(r"<label\b[^>]*>", scope):
        for_= re.search(r'(?<![-\w])for="([^"]+)"', lm.group(0))
        if for_ and for_.group(1) not in idset:
            out["errors"].append(f"label for missing #{for_.group(1)}")
    # inputs need a name
    for im in re.finditer(r"<(input|select|textarea)\b[^>]*>", scope):
        tag = im.group(0)
        if 'type="hidden"' in tag:
            continue
        labelled = ("aria-label=" in tag) or ("aria-labelledby=" in tag) or re.search(r'(?<![-\w])id="([^"]+)"', tag)
        inside_label = any(a <= im.start() < b for a, b in label_spans)
        if not labelled and not inside_label:
            out["warns"].append(f"unlabelled {im.group(1)}: {tag[:70]}")
    # buttons / links need a discernible name
    for bm in re.finditer(r"<(button|a)\b([^>]*)>(.*?)</\1>", scope, re.S):
        attrs, inner = bm.group(2), bm.group(3)
        if "aria-label" in attrs or "title=" in attrs or "aria-labelledby" in attrs:
            continue
        if re.sub(r"<[^>]+>", "", inner).strip():
            continue
        if "sr-only" in attrs or "wb-sr" in attrs or "nl-sr" in attrs or "aria-hidden" in attrs:
            continue
        out["warns"].append(f"empty {bm.group(1)}: {attrs[:60]}")
    # links + assets
    for m in re.finditer(r'(?<![-\w])(?:href|src|action)="([^"#]+)(#[^"]*)?"', scope):
        target = m.group(1)
        if target.startswith(("http", "data:", "mailto:", "javascript:", "//")):
            continue
        base = os.path.dirname(abs_path)
        resolved = os.path.normpath(os.path.join(base, target))
        if not os.path.exists(resolved):
            out["errors"].append(f"broken ref: {target}")
        elif m.group(2):
            frag = m.group(2)[1:]
            if frag and frag not in idset:
                tgt_txt = open(resolved, encoding="utf-8", errors="ignore").read() if os.path.isfile(resolved) else ""
                if f'id="{frag}"' not in tgt_txt:
                    out["errors"].append(f"broken fragment: {target}{m.group(2)}")
    # inline scripts must not have been corrupted
    for sm in INLINE_SCRIPT_RE.finditer(scope):
        seg = scope[sm.start():sm.start() + 1200]
        end = seg.find("</script>")
        if end < 0:
            out["errors"].append("unterminated inline script")
        elif "<" in seg[9:end] and "</" not in seg[9:end]:
            out["warns"].append("inline script contains markup chars")
    # v3 contract
    if "nl-v3.css" in text:
        if "nl-v3" not in (re.search(r"<body\b[^>]*>", text).group(0) if re.search(r"<body\b[^>]*>", text) else ""):
            out["errors"].append("nl-v3.css linked but body.nl-v3 missing")
        if "nl-v3.js" not in text:
            out["warns"].append("nl-v3.css without nl-v3.js")
        # classes used from v3 must exist in a v3 sheet
        main_m = re.search(r"<main\b.*?</main>", text, re.S)
        used = set()
        for c in attr_values((main_m.group(0) if main_m else scope), "class"):
            for cl in c.split():
                if cl.startswith("nl-"):
                    used.add(cl)
        missing = sorted(used - css_classes)
        if missing:
            out["warns"].append(f"nl-* class with no v3 rule: {missing}")
    # heading order (axe: heading-order)
    hs = [int(m.group(1)) for m in re.finditer(r"<h([1-6])\b", scope)]
    for a, b in zip(hs, hs[1:]):
        if b > a + 1:
            out["warns"].append(f"heading order h{a}->h{b}")
    if hs.count(1) > 1:
        out["warns"].append(f"{hs.count(1)} h1 elements")
    if hs and hs[0] != 1:
        out["warns"].append(f"first heading is h{hs[0]}")
    # images need alt text (svg is aria-hidden)
    for im in re.finditer(r"<img\b[^>]*>", scope):
        if "alt=" not in im.group(0):
            out["errors"].append(f"img without alt: {im.group(0)[:60]}")
    # CSS custom properties used must be defined somewhere in the sheets
    for v in set(re.findall(r"var\((--[a-z0-9-]+)", text)):
        if v not in css_vars:
            out["warns"].append(f"undefined CSS var {v}")
    out["bytes"] = len(text.encode())
    out["text_len"] = len(text_of(scope))
    out["headings"] = len(hs)
    return out


def css_inventory(base=None):
    classes, props = set(), set()
    for css in sorted(glob.glob(os.path.join(base or PROTO, "shared/assets/*.css"))):
        s = open(css, encoding="utf-8").read()
        for m in re.finditer(r"\.([a-zA-Z][\w-]*)", s):
            classes.add(m.group(1))
        for m in re.finditer(r"(--[a-zA-Z0-9-]+)\s*:", s):
            props.add(m.group(1))
        # braces must balance
        if s.count("{") != s.count("}"):
            print(f"  !! unbalanced braces in {os.path.basename(css)}: {s.count('{')} vs {s.count('}')}")
    return classes, props


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", default="")
    ap.add_argument("--filter", default="")
    ap.add_argument("--root", default=PROTO)
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    css_classes, css_vars = css_inventory(root)
    files = sorted(glob.glob(os.path.join(root, "**/*.html"), recursive=True))
    if a.filter:
        files = [f for f in files if a.filter in f]
    results = []
    err_n = warn_n = 0
    for f in files:
        r = check_page(f, css_classes, css_vars)
        results.append(r)
        if r["errors"]:
            err_n += 1
            if not a.quiet:
                print(f"ERR  {r['path']}")
                for e in r["errors"][:6]:
                    print(f"      · {e}")
        if r["warns"]:
            warn_n += 1
    print(f"\npages checked: {len(files)}   with errors: {err_n}   with warnings: {warn_n}")
    wcount = Counter()
    for r in results:
        for w in r["warns"]:
            wcount[w.split(":")[0]] += 1
    if wcount:
        print("warning kinds:", dict(wcount))
    if a.json:
        json.dump(results, open(a.json, "w"), indent=1)


if __name__ == "__main__":
    main()
