"""Idempotent post-pass for the Batch 6/7 workbench pages (after implement-workbench.py).

Fixes found by upgrade-v2/qa-lanes.cjs:
- empty <th> (row-action columns) get a visually hidden "Actions" name.
- tab links to other pages use aria-current="true" instead of "page".
- state-preview region landmarks that duplicate a live region name get "(state preview)".
Run from the repo root: python3 upgrade-v2/implement-workbench-fixes.py
"""
import csv
import json
from pathlib import Path
from bs4 import BeautifulSoup

rows = list(csv.DictReader(open('upgrade-v2/PAGE_COVERAGE.csv')))
paths = [r['page_path'] for r in rows if r['surface'] in ('client', 'admin') and r['status'] == 'NOT_STARTED' and r['page_path'] != 'proto/apps/admin/index.html']
log = []
for path in paths:
    p = Path(path)
    s = BeautifulSoup(p.read_text(), 'html.parser')
    if 'workbench-v2' not in s.body.get('class', []):
        continue
    changed = 0
    for th in s.select('table thead th'):
        if not th.get_text(strip=True) and not th.select('input, button, select') and not th.get('aria-label'):
            span = s.new_tag('span', attrs={'class': 'wb-sr'})
            span.string = 'Actions'
            th.append(span)
            changed += 1
    # Tab links: aria-current="page" only when the link targets this page itself.
    for a in s.select('main .tabs a[aria-current="page"]'):
        href = a.get('href', '').split('#')[0]
        if href and (p.parent / href).resolve() != p.resolve():
            a['aria-current'] = 'true'
            changed += 1
    # Region landmarks: state-preview copies must not share a name with the live surface.
    def name(el):
        if el.get('aria-label'):
            return el['aria-label'].strip()
        ref = el.get('aria-labelledby')
        target = s.find(id=ref) if ref else None
        return target.get_text(' ', strip=True) if target else None
    regions = [e for e in s.select('main section[aria-label], main section[aria-labelledby]')]
    seen = {}
    for e in regions:
        n = name(e)
        if n:
            seen.setdefault(n.lower(), []).append(e)
    for n, els in seen.items():
        if len(els) < 2:
            continue
        # Keep the first id-bearing (link target) region; rename the other copies.
        keep = next((e for e in els if e.get('id')), els[0])
        for e in els:
            if e is not keep and e.find_parent(class_='state-deck') and not e.get('aria-label', '').endswith('(state preview)'):
                e['aria-label'] = name(e) + ' (state preview)'
                e.attrs.pop('aria-labelledby', None)
                changed += 1
    if changed:
        p.write_text(str(s).replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio='))
        log.append({'path': path, 'fixes': changed})
Path('upgrade-v2/evidence/workbench-fixes.json').write_text(json.dumps(log, indent=1))
print(len(log), 'pages fixed', sum(x['fixes'] for x in log), 'fixes')
