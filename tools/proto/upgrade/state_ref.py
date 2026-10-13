#!/usr/bin/env python3
# ============================================================================
# Nestlancer proto upgrade — remove captured-screen reference panels
#
# Earlier passes injected a "Captured screen reference" <section class="ref-panel">
# on prototype pages for grading/coverage. That block is not product UI and
# distracts from the real page design, so this script strips it.
#
# Idempotent.
#   run: python3 tools/proto/upgrade/state_ref.py
# ============================================================================
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PROTO = os.path.join(ROOT, 'proto')

PANEL_RE = re.compile(
    r'\n?<section class="ref-panel"[^>]*>.*?</section>\n?',
    re.S,
)
MATRIX_RE = re.compile(
    r'\n?(?:<!-- PROTO-UPGRADE-START -->\s*)?<section class="state-matrix"[^>]*>.*?</section>\s*(?:<!-- PROTO-UPGRADE-END -->)?\n?',
    re.S,
)


def main():
    changed = 0
    for dirpath, _, files in os.walk(PROTO):
        if 'index.html' not in files:
            continue
        full = os.path.join(dirpath, 'index.html')
        src = open(full, encoding='utf-8').read()
        if 'ref-panel' not in src and 'state-matrix' not in src:
            continue
        out = PANEL_RE.sub('\n', src)
        out = MATRIX_RE.sub('\n', out)
        out = re.sub(r'\n{3,}', '\n\n', out)
        if out != src:
            open(full, 'w', encoding='utf-8').write(out)
            changed += 1
    print(f'removed captured-screen reference panels from {changed} page(s)')


if __name__ == '__main__':
    main()
