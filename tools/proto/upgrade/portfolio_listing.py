#!/usr/bin/env python3
# ============================================================================
# Rebuild the public portfolio listing (`apps/web/portfolio`).
#
# The captured screen (`public/007-portfolio-listing`) is a long timeline of
# eight case studies — "8 projects / 2026", newest first, each with a cover,
# number, discipline, blurb, tags and a link into the case study. The page as
# shipped had no cards at all: the only place those projects appeared was the
# reference prose, so the screen rendered as a hero and a paragraph.
#
# Project data is read from the repo's own `apps/web/work` listing — no values
# are invented here — and the timeline is a new shared design-system pattern
# (.pj-timeline) rather than a one-off.
#
# Idempotent: guarded by the PORTFOLIO-TIMELINE marker.
# ============================================================================
import html
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PROTO = os.path.join(ROOT, 'proto')
MARKER = '<!-- PORTFOLIO-TIMELINE -->'

# feature flags recorded in DATA_AUDIT for public/007 (05-08 are "Featured")
FEATURED = {'Fintech Payments Hub', 'SaaS Analytics Platform',
            'E-Commerce Mobile App', 'HealthTech Dashboard'}
# the only project with a real case-study page in the build
CASE_STUDY = {'Fintech Payments Hub': './fintech-payments-hub/index.html'}


def projects():
    """The eight case studies, taken verbatim from apps/web/work."""
    s = open(os.path.join(PROTO, 'apps', 'web', 'work', 'index.html'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r'<a href="([^"]+)" class="mkt-card" style="overflow:hidden;display:block">(.*?)</a>',
                         s, re.S):
        body = m.group(2)
        cov = re.search(r'<div class="cover([^"]*)"[^>]*>\s*<span>(.*?)</span>', body, re.S)
        title = re.search(r'font-bold" style="font-size:15px[^"]*">(.*?)</div>', body, re.S)
        desc = re.search(r'class="text-sm muted mt-2"[^>]*>(.*?)</div>', body, re.S)
        chips = re.findall(r'<span class="chip"[^>]*>(.*?)</span>', body, re.S)
        clean = lambda x: html.unescape(re.sub(r'<[^>]+>', '', x)).strip()
        out.append(dict(
            cover=cov.group(1).strip() if cov else '',
            discipline=clean(cov.group(2)).split('·')[0].strip() if cov else '',
            date=clean(cov.group(2)).split('·')[-1].strip() if cov else '',
            title=clean(title.group(1)) if title else '',
            desc=clean(desc.group(1)) if desc else '',
            chips=[clean(c) for c in chips]))
    return out


def build():
    rows = projects()
    assert len(rows) == 8, 'expected 8 case studies, got %d' % len(rows)
    items = []
    for i, p in enumerate(rows, 1):
        href = CASE_STUDY.get(p['title'], './[id]/index.html')
        badge = (' <span class="badge tone-brand">Featured</span>'
                 if p['title'] in FEATURED else '')
        chips = ''.join('<span class="chip" style="height:22px;font-size:11px">%s</span>' % c
                        for c in p['chips'])
        items.append(
            '<article class="pj-item">\n'
            '  <span class="pj-node" aria-hidden="true"></span>\n'
            '  <a class="mkt-card pj-card" href="%s">\n'
            '    <div class="cover %s" style="padding-top:52%%"><span class="cap-big">%02d</span>'
            '<span>%s · %s</span></div>\n'
            '    <div class="pj-body">\n'
            '      <div class="pj-eyebrow">%02d · %s%s</div>\n'
            '      <h3 class="pj-title">%s</h3>\n'
            '      <p class="pj-desc">%s</p>\n'
            '      <div class="flex gap-2 mt-3 flex-wrap">%s</div>\n'
            '      <span class="link-arrow mt-4">View case study →</span>\n'
            '    </div>\n'
            '  </a>\n'
            '</article>' % (href, p['cover'], i, p['discipline'], p['date'],
                            i, p['discipline'], badge, p['title'], p['desc'], chips))

    return (MARKER + '\n'
            '<section class="mkt-section" style="padding-top:8px">\n'
            '<div class="mkt-wrap">\n'
            '<div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 02 · PROJECT TIMELINE</div>\n'
            '<h2 class="h2 mb-3">8 projects, newest first.</h2>\n'
            '<p class="lead mb-6" style="max-width:62ch">Every engagement links to its case study — open a card '
            'for the full brief, scope and outcome.</p>\n'
            '<div class="pj-timeline">\n' + '\n'.join(items) + '\n</div>\n'
            '</div>\n</section>\n'
            '<section class="mkt-section" style="padding-top:0">\n'
            '<div class="mkt-wrap">\n'
            '<div class="mkt-card" style="padding:26px;display:flex;align-items:center;gap:18px;flex-wrap:wrap">\n'
            '<div class="min-w-0" style="flex:1 1 320px">\n'
            '<h2 class="h2" style="font-size:22px">Want work like this?</h2>\n'
            '<p class="muted mt-2" style="font-size:14.5px">Fixed-price quotes, milestone payments and a studio '
            'operator on the same channel as you.</p>\n'
            '</div>\n'
            '<a class="btn btn-primary" href="../requests/new/index.html">Start a project</a>\n'
            '</div>\n</div>\n</section>\n')


def main():
    f = os.path.join(PROTO, 'apps', 'web', 'portfolio', 'index.html')
    s = open(f, encoding='utf-8').read()
    if MARKER in s:
        print('portfolio listing already rebuilt — nothing to do')
        return
    block = build()
    i = s.find('<section class="ref-panel"')
    assert i > 0, 'reference panel not found'
    out = s[:i] + block + s[i:]
    assert out.count('<section') == s.count('<section') + 2
    open(f, 'w', encoding='utf-8').write(out)
    print('portfolio listing rebuilt: 8 case-study cards + CTA band')


if __name__ == '__main__':
    main()
