#!/usr/bin/env python3
# ============================================================================
# Unfold recorded state dialogs so they render as visible text.
#
# Also strips any leftover "Captured screen reference" <section class="ref-panel">
# blocks — those are audit/reference chrome, not product UI.
#
# Idempotent: a page with no matching shapes is skipped.
# ============================================================================
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PROTO = os.path.join(ROOT, 'proto')

PANEL_RE = re.compile(r'\n?<section class="ref-panel"[^>]*>.*?</section>\n?', re.S)


def strip_panels(src):
    n = len(PANEL_RE.findall(src))
    return PANEL_RE.sub('\n', src), n


def unfold_harness(src):
    n = 0
    out, pos = [], 0
    while True:
        i = src.find('<details class="state-harness">', pos)
        if i < 0:
            out.append(src[pos:])
            break
        out.append(src[pos:i])
        j = src.find('<div class="state-deck">', i)
        depth, k = 0, j
        for m in re.finditer(r'<div\b|</div>', src[j:]):
            depth += 1 if m.group(0) != '</div>' else -1
            if depth == 0:
                k = j + m.end()
                break
        closing = src.find('</details>', k)
        assert closing >= 0 and src[k:closing].strip() == '', 'unexpected harness shape'
        out.append(src[j:k])
        n += 1
        pos = closing + len('</details>')
    return ''.join(out), n


def main():
    panels = harness = pages = 0
    for dp, _, fs in os.walk(PROTO):
        if 'index.html' not in fs:
            continue
        full = os.path.join(dp, 'index.html')
        src = open(full, encoding='utf-8').read()
        if 'ref-panel' not in src and 'state-harness' not in src:
            continue
        a, p = strip_panels(src)
        b, h = unfold_harness(a)
        b = re.sub(r'\n{3,}', '\n\n', b)
        if b != src:
            open(full, 'w', encoding='utf-8').write(b)
            panels += p
            harness += h
            pages += 1
    print('removed %d reference panel(s) and unfolded %d state deck(s) across %d page(s)'
          % (panels, harness, pages))


if __name__ == '__main__':
    main()
