#!/usr/bin/env python3
# ============================================================================
# data_guard.py — prove a visual pass did not touch the prototype's data.
#
# For every proto/**/*.html page this compares the working copy with a git
# ref (default HEAD) and fails if anything a reviewer would call "data" moved:
#
#   text   every visible text node, in document order (names, emails, amounts,
#          IDs, counts, statuses, dates, labels, headings, <title>)
#   attrs  data-bearing attributes as a multiset: href, src, placeholder,
#          value, alt, title, aria-label, data-label, name, type, for, action,
#          datetime, content (meta), selected/checked/disabled
#   charts SVG geometry (d, points, cx, cy, r, x/y, x1..y2, width, height,
#          stroke-dasharray, stroke-dashoffset, viewBox) — chart shapes are data
#   bars   every "width: N%" declaration inside a style attribute — progress
#          bars and share bars encode real values
#
# Class names, layout styles, wrappers and new decorative/empty elements are
# allowed to change — that is the point of a design pass.
#
#   run:  python3 tools/proto/upgrade/data_guard.py            (vs HEAD)
#         python3 tools/proto/upgrade/data_guard.py --ref a35d3ea --show 5
# ============================================================================
import argparse
import re
import subprocess
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
PROTO = REPO / "proto"

DATA_ATTRS = {
    "href", "src", "placeholder", "value", "alt", "title", "aria-label",
    "data-label", "name", "type", "for", "action", "datetime", "content",
    "selected", "checked", "disabled",
}
SVG_GEOM = {
    "d", "points", "cx", "cy", "r", "x", "y", "x1", "y1", "x2", "y2",
    "width", "height", "stroke-dasharray", "stroke-dashoffset", "viewbox",
}
PCT_WIDTH = re.compile(r"(?:^|;)\s*width\s*:\s*([0-9.]+%)", re.I)


class Extract(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text, self.attrs, self.geom, self.bars = [], Counter(), Counter(), Counter()
        self._skip = 0
        self._svg = 0

    def handle_starttag(self, tag, attrs):
        t = tag.lower()
        if t in ("script", "style"):
            self._skip += 1
        if t == "svg":
            self._svg += 1
        for k, v in attrs:
            k = (k or "").lower()
            v = "" if v is None else v
            if k in DATA_ATTRS:
                self.attrs[(t, k, v.strip())] += 1
            if self._svg and k in SVG_GEOM:
                self.geom[(t, k, v.strip())] += 1
            if k == "style":
                for m in PCT_WIDTH.finditer(v):
                    self.bars[m.group(1)] += 1

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        t = tag.lower()
        if t in ("script", "style") and self._skip:
            self._skip -= 1
        if t == "svg" and self._svg:
            self._svg -= 1

    def handle_data(self, data):
        if self._skip:
            return
        s = " ".join(data.split())
        if s:
            self.text.append(s)


def extract(html):
    p = Extract()
    p.feed(html)
    p.close()
    return p


def git_show(ref, rel):
    try:
        return subprocess.run(["git", "show", f"{ref}:{rel}"], cwd=REPO, check=True,
                              capture_output=True).stdout.decode("utf-8")
    except subprocess.CalledProcessError:
        return None


def first_text_diff(a, b):
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return i, x, y
    if len(a) != len(b):
        i = min(len(a), len(b))
        return i, (a[i] if i < len(a) else "<end>"), (b[i] if i < len(b) else "<end>")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", default="HEAD")
    ap.add_argument("--show", type=int, default=8, help="print details for the first N failing pages")
    args = ap.parse_args()

    pages = sorted(PROTO.rglob("*.html"))
    bad, new = [], 0
    totals = Counter()
    for f in pages:
        rel = f.relative_to(REPO).as_posix()
        old = git_show(args.ref, rel)
        if old is None:
            new += 1
            continue
        a, b = extract(old), extract(f.read_text(encoding="utf-8"))
        totals["text"] += len(a.text)
        totals["attrs"] += sum(a.attrs.values())
        totals["geom"] += sum(a.geom.values())
        totals["bars"] += sum(a.bars.values())
        problems = []
        d = first_text_diff(a.text, b.text)
        if d:
            problems.append(f"text #{d[0]}: {d[1]!r} -> {d[2]!r}")
        for label, x, y in (("attr", a.attrs, b.attrs), ("chart", a.geom, b.geom), ("bar", a.bars, b.bars)):
            lost = x - y
            if lost:
                problems.append(f"{label} lost/changed: {list(lost.items())[:4]}")
        if problems:
            bad.append((rel, problems))

    checked = len(pages) - new
    print(f"data_guard vs {args.ref}: {checked} pages compared"
          f" · {totals['text']} text nodes · {totals['attrs']} data attributes"
          f" · {totals['geom']} chart geometry values · {totals['bars']} bar widths")
    if new:
        print(f"  ({new} page(s) not in {args.ref}, skipped)")
    if not bad:
        print("  ✓ DATA UNCHANGED on every page")
        return 0
    print(f"  ✗ {len(bad)} page(s) changed data:")
    for rel, probs in bad[: args.show]:
        print(f"    - {rel}")
        for p in probs:
            print(f"        {p}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
