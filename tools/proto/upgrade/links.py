#!/usr/bin/env python3
"""links.py — verify that every internal link and asset reference resolves.

The master prompt's verification gate list includes "links resolve". This walks
every HTML page under `proto/`, extracts href/src/srcset references, and checks
that each relative target exists on disk. Placeholder routes are legitimate
parts of this prototype (`./[id]/edit/index.html`, `:id` segments), so those are
checked as written; only genuinely missing targets are reported.

External URLs (http/https/data/mailto/tel/javascript) are ignored.

Usage: python3 tools/proto/upgrade/links.py [--list-ok]
"""
import glob
import os
import re
import sys
from collections import defaultdict
from urllib.parse import unquote, urlsplit

ROOT = 'proto'
OK = '--list-ok' in sys.argv

REF_RE = re.compile(r'(?:href|src)\s*=\s*"([^"]*)"', re.I)
SRCSET_RE = re.compile(r'srcset\s*=\s*"([^"]*)"', re.I)
IGNORE = ('http://', 'https://', 'data:', 'mailto:', 'tel:', 'javascript:', '//')


def targets_of(html):
    for ref in REF_RE.findall(html):
        yield ref
    for set_ in SRCSET_RE.findall(html):
        for part in set_.split(','):
            cand = part.strip().split(' ')[0]
            if cand:
                yield cand


def resolve(page_path, ref):
    """Return the filesystem path a reference should point at, or None."""
    ref = ref.strip()
    if not ref or ref.startswith('#') or ref.startswith(IGNORE):
        return None
    path = unquote(urlsplit(ref).path)
    if not path:
        return None
    if path.startswith('/'):
        return os.path.normpath(ROOT + path)
    return os.path.normpath(os.path.join(os.path.dirname(page_path), path))


def exists(target):
    if os.path.isdir(target):
        return os.path.exists(os.path.join(target, 'index.html'))
    return os.path.exists(target)


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True))
    broken = defaultdict(list)
    total = 0
    for page in pages:
        html = open(page, encoding='utf8').read()
        for ref in targets_of(html):
            target = resolve(page, ref)
            if target is None:
                continue
            total += 1
            if not exists(target):
                broken[page].append((ref, target))
    if broken:
        print(f'MISSING TARGETS — {sum(len(v) for v in broken.values())} '
              f'references across {len(broken)} page(s)\n')
        for page in sorted(broken):
            print(f'  {page}')
            for ref, target in sorted(set(broken[page])):
                print(f'      {ref}   ->  {target}')
    n_broken = sum(len(v) for v in broken.values())
    print(f'\nchecked {total} internal reference(s) across {len(pages)} page(s) · '
          f'{n_broken} missing')
    return 1 if n_broken else 0


if __name__ == '__main__':
    sys.exit(main())
