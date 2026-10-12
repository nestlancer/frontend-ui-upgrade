#!/usr/bin/env python3
# ============================================================================
# Nestlancer proto upgrade — state-reference tidy pass
#
# The tree shipped a machine-generated "Interactive Screen States & Reference
# Specifications" panel on 106 pages: repeated generic headings, raw audit
# prose in one line, and a final "Audit Token Index" card full of loose
# keywords (visible keyword soup — the opposite of shippable UI).
#
# This pass rewrites that panel into an honest, collapsed, scannable
# reference: one row per captured screenshot, named by the state it shows,
# with the recorded values kept as short labelled facts.
#
# Idempotent: pages already carrying the new markup are skipped.
#   run: python3 tools/proto/upgrade/state_ref.py
# ============================================================================
import csv, html, json, os, re, sys
from urllib.parse import urlparse

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
ROOT = os.path.abspath(ROOT)
PROTO = os.path.join(ROOT, 'proto')
MANIFEST = os.path.join(ROOT, 'screenshot-manifest.csv')
AUDIT = os.path.join(ROOT, 'tools', 'proto', 'DATA_AUDIT.md')

ID_RE = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|01a1[0-9a-f]{4}[0-9a-f-]{20,}')
norm = lambda s: ID_RE.sub(':id', s.strip('/'))

MATRIX = re.compile(
    r'<!-- PROTO-UPGRADE-START -->\s*<section class="state-matrix".*?</section>\s*<!-- PROTO-UPGRADE-END -->',
    re.S)
LOOSE_CARDS = re.compile(r'<section class="state-matrix".*?</section>', re.S)


def audit_notes():
    notes = {}
    for line in open(AUDIT, encoding='utf-8'):
        m = re.match(r'\| \d+ \| `([^`]+)` \|.*?\| (checked|fixed|todo|n/a) \| (.*) \|\s*$', line.rstrip())
        if m:
            notes[m.group(1)] = m.group(3).strip()
    return notes


def manifest_rows():
    return list(csv.DictReader(open(MANIFEST, encoding='utf-8')))


def proto_of(row):
    p = urlparse(row['url'])
    base = {'nestlancer.com': 'apps/landing', 'app.nestlancer.com': 'apps/web',
            'admin.nestlancer.com': 'apps/admin'}.get(p.netloc, '?')
    key = base + '/' + p.path.strip('/')
    key = re.sub(r'/{2,}', '/', key)
    return norm(key) + '/'


def state_name(row, note):
    """Readable name for the captured state — URL tail + label, not 'Admin · Admin'."""
    p = urlparse(row['url'])
    tail = p.path.strip('/')
    q = p.query
    label = (row.get('label') or '').strip()
    if tail:
        tail = ID_RE.sub('…', tail)
    name = tail or (p.netloc.replace('.nestlancer.com', '') + ' home')
    if q:
        name += ' · ' + q.replace('tab=', '').replace('&', ' · ')
    if label and label.lower() not in name.lower() and len(label) < 46:
        name = f'{name} — {label}'
    n = row['file'].split('/')[-1].split('-')[0]
    return name, n


SPLIT = re.compile(r'\s*(?:;|\||·)\s+')


def facts(note):
    """Every recorded fact, chunked for readability. Nothing is dropped —
    this panel is the written record of what each captured screen contained."""
    if not note:
        return []
    parts = [p.strip(' .') for p in SPLIT.split(note) if len(p.strip()) > 3]
    out, buf = [], ''
    for p in parts:
        if len(buf) + len(p) < 190:
            buf = (buf + '; ' + p) if buf else p
        else:
            out.append(buf)
            buf = p
    if buf:
        out.append(buf)
    return out


def card(name, num, note, area):
    items = facts(note)
    body = ''.join(f'<li>{html.escape(f)}</li>' for f in items) or '<li>State captured; no extra values recorded.</li>'
    return (
        f'<li class="ref-row">'
        f'<div class="ref-head"><b>{html.escape(name)}</b>'
        f'<span class="ref-tag mono">{html.escape(num)}</span></div>'
        f'<ul class="ref-facts">{body}</ul></li>'
    )


def panel(rows_for_page, notes):
    cards, seen = [], set()
    for row in rows_for_page:
        if row['file'] in seen:
            continue
        seen.add(row['file'])
        name, num = state_name(row, notes.get(row['file']))
        cards.append(card(name, num, notes.get(row['file'], ''), row['area']))
    area = rows_for_page[0]['area'] if rows_for_page else ''
    return f'''<section class="ref-panel" id="proto-state-matrix" aria-labelledby="ref-h">
  <details>
    <summary>
      <span class="ref-sum-title" id="ref-h">Captured screen reference</span>
      <span class="ref-sum-sub">{len(cards)} states recorded for this route — values as captured in the {html.escape(area)} screenshots</span>
      <span class="ref-caret" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
    </summary>
    <ul class="ref-list">{''.join(cards)}</ul>
  </details>
</section>'''


def main():
    notes = audit_notes()
    per_page = {}
    for row in manifest_rows():
        per_page.setdefault(proto_of(row), []).append(row)

    changed = skipped = 0
    for dirpath, _, files in os.walk(PROTO):
        if 'index.html' not in files:
            continue
        full = os.path.join(dirpath, 'index.html')
        rel = os.path.relpath(dirpath, PROTO).replace('\\', '/')
        # alias dirs ([id], [threadId]…) describe the same screens as their canonical route
        rel = re.sub(r'\[[^\]/]+\]', ':id', rel)
        key = norm(rel + '/') + '/'
        key = re.sub(r'/{2,}', '/', key)
        src = open(full, encoding='utf-8').read()
        if 'ref-panel' in src:
            skipped += 1
            continue
        rows = per_page.get(key) or per_page.get(key.rstrip('/') + '/') or []
        if not rows:
            continue
        new_panel = panel(rows, notes)
        if MATRIX.search(src):
            src2 = MATRIX.sub(lambda _: new_panel, src, count=1)
        elif LOOSE_CARDS.search(src):
            src2 = LOOSE_CARDS.sub(lambda _: new_panel, src, count=1)
        else:
            # append before the closing </main>
            src2 = src.replace('</main>', new_panel + '\n</main>', 1)
        if src2 != src:
            open(full, 'w', encoding='utf-8').write(src2)
            changed += 1
    print(f'state reference rewritten on {changed} pages ({skipped} already done)')


if __name__ == '__main__':
    main()
