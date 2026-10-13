#!/usr/bin/env python3
# ============================================================================
# pass2_polish.py — PASS 2 polish (runs after pass2_wire.py). Layout/typography
# only; text order, numbers, IDs and links never change (data_guard.py proves it).
#
#   1  empty-state routes   back link + centred card whose <h1> lives inside the
#                           card → the <h1> moves up into a .pband header (it is
#                           the first text after the back link, so text order is
#                           identical) and takes the page-title style
#   2  type scale           every inline font-size (1,581 declarations, 27 values)
#                           snaps to the token scale and becomes an fs-* class:
#                           11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 · 30 · 36 ·
#                           display — the declaration is removed from style=""
#
# Idempotent.  run: python3 tools/proto/upgrade/pass2_polish.py [--dry]
# ============================================================================
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pass2_wire import Editor, parse, walk  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
PROTO = REPO / "proto"

STEPS = [11, 12, 13, 14, 15, 16, 18, 20, 24, 30, 36]
EXPLICIT = {11: 11, 11.5: 12, 12: 12, 12.5: 13, 12.8: 13, 13: 13, 13.5: 14, 14: 14, 14.5: 15,
            15: 15, 15.5: 16, 16: 16, 16.5: 16, 17: 18, 18: 18, 19: 20, 20: 20, 21: 20,
            22: 24, 24: 24, 26: 24, 28: 30, 30: 30, 34: 36}
FS_DECL = re.compile(r"(?:^|;)\s*font-size\s*:\s*([^;]+?)\s*(?=;|$)")


def snap(value):
    v = value.strip()
    if v.startswith("clamp("):
        return "fs-display"
    m = re.fullmatch(r"([\d.]+)px", v)
    if not m:
        return None
    px = float(m.group(1))
    px = int(px) if px.is_integer() else px
    if px in EXPLICIT:
        return f"fs-{EXPLICIT[px]}"
    best = min(STEPS, key=lambda s: (abs(s - px), -s))
    return f"fs-{best}"


def in_svg(n):
    p = n.parent
    while p is not None:
        if p.tag == "svg":
            return True
        p = p.parent
    return False


def set_style(ed, n, new_style):
    t = ed.open_tag(n)
    if new_style:
        t = re.sub(r'\sstyle="[^"]*"', f' style="{new_style}"', t, count=1)
    else:
        t = re.sub(r'\sstyle="[^"]*"', "", t, count=1)
    ed.set_open(n, t)


# ------------------------------------------------------------ 1 empty states
def hoist_empty_title(html):
    root = parse(html)
    main = next((n for n in walk(root) if n.tag == "main" and "content" in n.cls()), None)
    if main is None:
        return html, 0
    kids = [c for c in main.children if c.tag not in ("script", "style", "dialog", "template")]
    if len(kids) < 2 or any("pband" in c.cls() or "phead" in c.cls() for c in kids):
        return html, 0
    link, card = kids[0], kids[1]
    if "link-arrow" not in link.cls() or "panel" not in card.cls():
        return html, 0
    empty = next((x for x in walk(card) if "empty" in x.cls()), None)
    h1 = next((x for x in walk(card) if x.tag == "h1"), None) if empty else None
    if h1 is None or h1.close is None:
        return html, 0
    # the h1 must be the first text inside the card (keeps text order identical)
    before = re.sub(r"<[^>]+>", "", html[card.e:h1.s]).strip()
    if before:
        return html, 0
    ed = Editor(html)
    open_tag = html[h1.s:h1.e]
    open_tag = re.sub(r'\sstyle="[^"]*"', "", open_tag)
    open_tag = re.sub(r'\sclass="[^"]*"', "", open_tag)
    open_tag = open_tag.replace("<h1", '<h1 class="ptitle"', 1)
    new_h1 = open_tag + html[h1.e:h1.close[0]] + "</h1>"
    ed.remove_class(link, "reveal")
    ed.inserts.append((link.s, '<div class="pband">'))
    ed.inserts.append((link.close[1], '<div class="phead anim-in"><div class="min-w-0">' + new_h1 + "</div></div></div>"))
    ed.replaces.append((h1.s, h1.close[1], ""))
    ed.add_class(card, "empty-card")
    return ed.result(), 1


# ------------------------------------------------------------ 1b band spill
# header_group() keys on an <h1>. On two layouts that h1 sits deep inside a big
# block, so the band swallowed real content:
#   A  a form column that opens with its own .phead (web/requests/new)
#      -> lift that .phead into the band; the form grid follows the band
#   B  a 3-pane messenger whose h1 is the chat-pane title (web/messages/[id])
#      -> close the band after the back link; the messenger follows the band
# Both keep the document's text order identical.
def fix_band_spill(html):
    root = parse(html)
    band = next((n for n in walk(root) if "pband" in n.cls()), None)
    if band is None or band.close is None or not band.children:
        return html, 0
    last = band.children[-1]
    if last.close is None or "phead" in last.cls() or html[last.close[1]:band.close[0]].strip():
        return html, 0
    ed = Editor(html)
    inner = next((x for x in walk(last) if x is not last and "phead" in x.cls()), None)
    if inner is not None and inner.close is not None:
        if re.sub(r"<[^>]+>", "", html[last.e:inner.s]).strip():
            return html, 0
        ph = html[inner.s:inner.close[1]]
        if "anim-in" not in inner.cls():
            ph = re.sub(r'class="([^"]*)"', lambda m: f'class="{m.group(1)} anim-in"', ph, count=1)
        rest = html[last.s:inner.s] + html[inner.close[1]:last.close[1]]
        ed.replaces.append((last.s, band.close[1], ph + "\n</div>\n" + rest))
        return ed.result(), 1
    if "chat-grid" in last.cls():
        ed.replaces.append((last.s, band.close[1], "</div>\n" + html[last.s:last.close[1]]))
        return ed.result(), 1
    return html, 0


# ------------------------------------------------------------ 2 type scale
def tokenize_type(html):
    root = parse(html)
    ed = Editor(html)
    count = 0
    for n in walk(root):
        if n.tag in ("#root", "svg", "text", "tspan") or 'style="' not in n.attrs or in_svg(n):
            continue
        style = n.style()
        m = FS_DECL.search(style)
        if not m:
            continue
        cls = snap(m.group(1))
        if not cls:
            continue
        rest = FS_DECL.sub("", style).strip().strip(";").strip()
        rest = re.sub(r"\s*;\s*", ";", rest)
        set_style(ed, n, rest)
        ed.add_class(n, cls)
        count += 1
    return ed.result(), count


def main():
    dry = "--dry" in sys.argv
    totals = {"hoist": 0, "spill": 0, "type": 0}
    changed = 0
    for f in sorted(PROTO.rglob("*.html")):
        html = f.read_text(encoding="utf-8")
        new, a = hoist_empty_title(html)
        new, c = fix_band_spill(new)
        new, b = tokenize_type(new)
        if new != html:
            changed += 1
            totals["hoist"] += a
            totals["spill"] += c
            totals["type"] += b
            if not dry:
                f.write_text(new, encoding="utf-8")
    print(f"pass2_polish: {changed} pages {'would change' if dry else 'polished'} · "
          f"{totals['hoist']} empty-state titles moved into header bands · "
          f"{totals['spill']} over-grown bands trimmed · "
          f"{totals['type']} inline font-sizes → fs-* tokens")


if __name__ == "__main__":
    main()
