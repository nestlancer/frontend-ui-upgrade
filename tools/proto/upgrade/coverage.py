#!/usr/bin/env python3
# ============================================================================
# Coverage check — how much of each screenshot's recorded data appears in the
# rendered proto text. Mirrors the grader's method (tools/proto/grade/score2.py)
# so this can be run without a browser:
#
#   python3 tools/proto/upgrade/coverage.py            # current working tree
#   python3 tools/proto/upgrade/coverage.py --rev HEAD  # against a git revision
# ============================================================================
import csv
import html
import json
import os
import re
import subprocess
import sys
from urllib.parse import urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
STOP = set('''should would could there their these those which where while about after before quote screen
page shows shown show visible section panel state button form dialog header footer label labels column
columns status rows table list items item click checked matches match verify verified check open text
sample detail details with from into that this have does only also more than like when then they them
been being other each both used using over under such very just where what'''.split())
ID_RE = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|01a1[0-9a-f]{4}[0-9a-f-]{20,}')


def norm(s):
    s = ID_RE.sub(':id', s.strip('/'))
    return re.sub(r'/{2,}', '/', s)


def tokens(t):
    t = t.lower().replace(',', '')
    return (set(w for w in re.findall(r"[a-z][a-z'\-]{4,}", t) if w not in STOP),
            set(re.findall(r'\d{3,}(?:\.\d+)?', t)))


def notes():
    out = {}
    for line in open(os.path.join(ROOT, 'tools/proto/DATA_AUDIT.md'), encoding='utf-8'):
        m = re.match(r'\| \d+ \| `([^`]+)` \|.*?\| (checked|fixed|todo|n/a) \| (.*) \|\s*$', line.rstrip())
        if m:
            out[m.group(1)] = m.group(3)
    return out


def strip_tags(src):
    src = re.sub(r'<script.*?</script>|<style.*?</style>|<svg.*?</svg>', ' ', src, flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>', ' ', src)).lower().replace(',', '')


def load(rev, route):
    path = route + 'index.html'
    if rev is None:
        full = os.path.join(ROOT, 'proto', path)
        return open(full, encoding='utf-8').read() if os.path.exists(full) else ''
    r = subprocess.run(['git', 'show', f'{rev}:proto/{path}'], cwd=ROOT,
                       capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else ''


def dir_map():
    """normalised route → best real directory (canonical :id dir preferred)."""
    m = {}
    for dp, _, fs in os.walk(os.path.join(ROOT, 'proto')):
        if 'index.html' not in fs:
            continue
        rel = os.path.relpath(dp, os.path.join(ROOT, 'proto')).replace(os.sep, '/')
        key = norm(re.sub(r'\[[^/\]]+\]', ':id', rel))
        alias = '[' in rel
        if key not in m or (m[key][1] and not alias):
            m[key] = (rel + '/', alias)
    return {k: v[0] for k, v in m.items()}


DIRS = dir_map()


def resolve(route_key):
    """proto route key (':id' normalised) → real directory present on disk."""
    for cand in (norm(route_key), '/'.join(route_key.split('/')[:-1])):
        if norm(cand) in DIRS:
            return DIRS[norm(cand)]
    parts = norm(route_key).split('/')
    while parts and '/'.join(parts) not in DIRS:
        parts = parts[:-1]
    return (DIRS['/'.join(parts)] if parts else '')


def main():
    rev = None
    if '--rev' in sys.argv:
        rev = sys.argv[sys.argv.index('--rev') + 1]
    N = notes()
    rows = list(csv.DictReader(open(os.path.join(ROOT, 'screenshot-manifest.csv'), encoding='utf-8')))
    out = []
    for row in rows:
        note = N.get(row['file'])
        if not note:
            continue
        p = urlparse(row['url'])
        base = {'nestlancer.com': 'apps/landing', 'app.nestlancer.com': 'apps/web',
                'admin.nestlancer.com': 'apps/admin'}.get(p.netloc, '?')
        route = resolve(norm(base + '/' + p.path)).replace('//', '/')
        text = strip_tags(load(rev, route))
        W, Ns = tokens(note)
        miss = sorted(w for w in W if w not in text)
        missn = sorted(n for n in Ns if n not in text.replace(',', ''))
        total = max(1, len(W) + len(Ns))
        out.append({'file': row['file'], 'proto': route,
                    'cov': round(1 - (len(miss) + len(missn)) / total, 3),
                    'miss': miss[:10], 'missn': missn[:6]})
    out.sort(key=lambda x: x['cov'])
    covs = [x['cov'] for x in out]
    label = 'working tree' if rev is None else rev
    print(f'{label}: {len(out)} screens · median {sorted(covs)[len(covs)//2]:.3f} · mean {sum(covs)/len(covs):.3f}')
    bands = [(0.6, sum(1 for c in covs if c < 0.6)), (0.8, sum(1 for c in covs if 0.6 <= c < 0.8)),
             (0.95, sum(1 for c in covs if 0.8 <= c < 0.95)), (1.01, sum(1 for c in covs if c >= 0.95))]
    print('bands:', ' · '.join(f'<{b:.2f}: {n}' for b, n in bands))
    for x in out[:12]:
        print(f"  {x['cov']:.2f} {x['file'][:50]:52s} {', '.join(x['miss'][:5])} {', '.join(x['missn'][:3])}")
    json.dump(out, open(os.path.join(ROOT, 'tools/proto/upgrade/coverage.json'), 'w'), indent=0)


if __name__ == '__main__':
    main()
