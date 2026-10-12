#!/usr/bin/env python3
"""fix_links.py — resolve the broken internal references found by links.py.

Two kinds of breakage showed up across `proto/`:

1. Depth drift (149 refs, 4 pages). Pages cloned into a deeper folder
   (`admin/messages/new/direct/`, `admin/messages/new/group/`,
   `admin/messages/[id]/`, `admin/content/blog/[id]/`) kept the relative paths of
   the page they were copied from, so every ref is exactly one `../` short. The
   repair is mechanical: if prepending one `../` makes the target exist, apply it
   (and the reverse, if a ref overshoots).

2. Three refs that point at routes this prototype does not build, on pages that
   *are* part of the manifest:

   | Page | Ref | Fix | Why |
   |---|---|---|---|
   | `apps/admin/login/` | `../blog/index.html` | `../content/index.html` | admin has no blog listing; its own sidebar points at the Content hub for blog work |
   | `requests/01a10a2c-1a04-…/` | `./quote/{new,edit}/index.html` | `../[id]/quote/{new,edit}/index.html` | no capture shows a quote flow for this request; the repo convention (see `requests/index.html`) is to link the template route where a concrete one is not required |
   | `requests/01a10a2c-01c3-…/quote/new/` | `../../index.html` | `../../../[id]/index.html` | the parent request detail page was never built; link the template detail route instead of inventing a screen. Anchor text is untouched, so no recorded value changes |

Anchor text, visible copy and mock data are never modified — only `href`/`src`
targets. Idempotent: a second run finds nothing to do.

Usage: python3 tools/proto/upgrade/fix_links.py [--dry-run]
"""
import glob
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('links', os.path.join(HERE, 'links.py'))
links = importlib.util.module_from_spec(spec)
spec.loader.exec_module(links)

DRY = '--dry-run' in sys.argv

MANUAL = {
    'proto/apps/admin/login/index.html': {
        # admin has no blog listing page; the console's own sidebar points at the
        # Content hub for blog work (see apps/admin/dashboard)
        '../blog/index.html': '../content/index.html',
    },
    'proto/apps/admin/requests/01a10a2c-1a04-75bb-8e80-fc143257fa02/index.html': {
        './quote/new/index.html': '../[id]/quote/new/index.html',
        './quote/edit/index.html': '../[id]/quote/edit/index.html',
    },
    'proto/apps/admin/requests/01a10a2c-01c3-7079-93e9-9d001541ced8/quote/new/index.html': {
        '../../index.html': '../../../[id]/index.html',
    },
}


def candidates(ref, page_path):
    """Ref variants to try, in order of preference."""
    out = []
    if ref.startswith('../'):
        out.append('../' + ref)          # one level shallower
        out.append(ref[3:])              # one level deeper
    elif ref.startswith('./'):
        out.append('../' + ref[2:])      # one level shallower
        out.append('./../' + ref[2:])
    return out


def main():
    changed = 0
    pages_touched = 0
    for page in sorted(glob.glob('proto/**/*.html', recursive=True)):
        html = open(page, encoding='utf8').read()
        fixes = {}

        for ref in links.targets_of(html):
            target = links.resolve(page, ref)
            if target is None or links.exists(target):
                continue
            manual = MANUAL.get(page, {}).get(ref)
            if manual and links.exists(links.resolve(page, manual)):
                fixes[ref] = manual
                continue
            for cand in candidates(ref, page):
                t = links.resolve(page, cand)
                if t and links.exists(t):
                    fixes[ref] = cand
                    break

        if not fixes:
            continue
        out = html
        for ref, new in sorted(fixes.items(), key=lambda kv: -len(kv[0])):
            out = out.replace(f'"{ref}"', f'"{new}"')
        n = len(re.findall('|'.join(re.escape(f'"{v}"') for v in fixes.values()), out))
        if not DRY:
            open(page, 'w', encoding='utf8').write(out)
        changed += len(fixes)
        pages_touched += 1
        print(f'  {page}  {len(fixes)} ref(s)')
        for ref, new in sorted(fixes.items()):
            print(f'      {ref}  ->  {new}')

    verb = 'would fix' if DRY else 'fixed'
    print(f'\nfix_links — {verb} {changed} reference(s) across {pages_touched} page(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
