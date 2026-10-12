#!/usr/bin/env python3
# ============================================================================
# Batch D — public surface.
#
# Nine public screens shipped with no form control and no table at all, which
# is both a real product gap (a blog listing with nothing to filter with, a
# pricing page with no comparison, a contact page with no expectations) and
# the one UX item those screens were missing. Each page gets the element its
# own capture calls for — never a form on a page the capture says has none
# (the marketing contact page deliberately points at the secure in-app form).
#
# Every value written here comes from tools/proto/DATA_AUDIT.md; nothing is
# invented. Section tables are generated from the page's own headings.
#
# Idempotent: each insert carries a marker comment and is skipped on re-run.
# ============================================================================
import html
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PROTO = os.path.join(ROOT, 'proto')

SEARCH_ICON = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
               'stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/>'
               '<path d="m20 20-3.2-3.2"/></svg>')


def read(rel):
    return open(os.path.join(PROTO, rel, 'index.html'), encoding='utf-8').read()


def write(rel, s):
    open(os.path.join(PROTO, rel, 'index.html'), 'w', encoding='utf-8').write(s)


def insert(rel, anchor, block, marker, before=True):
    s = read(rel)
    if marker in s:
        return False
    assert anchor in s, '%s: anchor not found (%s)' % (rel, anchor[:60])
    if marker not in block:                      # the marker is also the guard
        block = marker + '\n' + block
    out = s.replace(anchor, (block + anchor) if before else (anchor + block), 1)
    assert out != s
    write(rel, out)
    return True


def table(headers, rows, caption=None):
    th = ''.join('<th>%s</th>' % h for h in headers)
    body = ''
    for r in rows:
        tds = ''.join('<td data-label="%s" class="min-w-0">%s</td>' % (headers[i], c) for i, c in enumerate(r))
        body += '<tr>%s</tr>\n' % tds
    cap = '<caption class="dim text-xs" style="text-align:left;padding:0 0 10px">%s</caption>' % caption if caption else ''
    return ('<div class="tbl-wrap"><table class="tbl tbl-cards">%s<thead><tr>%s</tr></thead>'
            '<tbody>\n%s</tbody></table></div>\n' % (cap, th, body))


def section(eyebrow, title, lead, inner):
    return ('<section class="mkt-section">\n<div class="mkt-wrap">\n'
            '<div class="mkt-eyebrow mb-3"><span class="dot"></span>%s</div>\n'
            '<h2 class="h2 mb-3">%s</h2>\n<p class="lead mb-6" style="max-width:62ch">%s</p>\n%s'
            '</div>\n</section>\n' % (eyebrow, title, lead, inner))


def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', re.sub(r'<[^>]+>', '', t).lower()).strip('-')


def heading_rows(rel, skip_last=True):
    """Table rows built from the page's own <h2>s — title + first line of body."""
    s = read(rel)
    marks = list(re.finditer(r'<h2([^>]*)>(.*?)</h2>', s, re.S))
    if skip_last:
        marks = [m for m in marks if 'Captured screen reference' not in m.group(2)]
    rows, ids = [], []
    for i, m in enumerate(marks):
        title = html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).strip()
        nxt = marks[i + 1].start() if i + 1 < len(marks) else len(s)
        body = html.unescape(re.sub(r'<[^>]+>', ' ', s[m.end():nxt]))
        body = re.sub(r'\s+', ' ', body).strip()
        first = re.split(r'(?<=[.:])\s', body)[0][:118].rstrip(' ,;')
        i2 = slug(title)
        ids.append((m.start(), m.group(1), i2, title))
        rows.append(('<a href="#%s">%s</a>' % (i2, title), first or '—'))
    # give each heading an id so the table can link to it
    if ids:
        out, prev = '', 0
        for start, attrs, i2, title in ids:
            out += s[prev:start]
            attrs2 = attrs if 'id=' in attrs else attrs + ' id="%s"' % i2
            out += '<h2%s>%s</h2>' % (attrs2, title)
            prev = s.index('</h2>', start) + len('</h2>')
        write(rel, out + s[prev:])
    return rows


def filterbar(label, placeholder, select_label, options, marker, fid):
    opts = ''.join('<option%s>%s</option>' % (' selected' if i == 0 else '', o) for i, o in enumerate(options))
    return ('%s\n<form class="filterbar mb-6" role="search" aria-label="%s">\n'
            '<div class="input-wrap"><span class="in-icon">%s</span>'
            '<input class="input" type="search" placeholder="%s" aria-label="%s"></div>\n'
            '<label class="dim text-xs" for="%s">%s</label>\n'
            '<select class="select" id="%s" aria-label="%s">%s</select>\n'
            '</form>\n' % (marker, label, SEARCH_ICON, placeholder, placeholder,
                           fid, select_label, fid, select_label, opts))


def main():
    done = []

    # ── 1. blog listing: search + category filter over 110 articles ─────────
    if insert('apps/web/blog',
              '<div class="blog-layout">',
              filterbar('Filter articles', 'Search 110 articles…', 'Category',
                        ['All articles (110)', 'Business (27)', 'Case Studies (26)',
                         'Design (27)', 'Technology (30)'],
                        '<!-- PUBLIC-FILTER:blog -->', 'blog-cat'),
              '<!-- PUBLIC-FILTER:blog -->'):
        done.append('apps/web/blog')

    # ── 2. portfolio listing: sector filter over 8 projects ─────────────────
    s = read('apps/web/portfolio')
    if '<!-- PUBLIC-FILTER:portfolio -->' not in s:
        chips = re.search(r'<div class="flex gap-2 mb-7 flex-wrap">.*?</div>\n', s, re.S)
        assert chips, 'portfolio: chip row not found'
        write('apps/web/portfolio',
              s.replace(chips.group(0),
                        filterbar('Filter case studies', 'Search case studies…', 'Sector',
                                  ['All sectors', 'Fintech', 'SaaS', 'Retail', 'HealthTech',
                                   'Education', 'Logistics'],
                                  '<!-- PUBLIC-FILTER:portfolio -->', 'pf-sector'), 1))
        done.append('apps/web/portfolio')

    # ── 3 + 4. privacy and terms: on-this-page tables from their own sections
    for rel, eyebrow in (('apps/web/privacy', 'PRIVACY POLICY'),
                         ('apps/web/terms', 'TERMS OF SERVICE')):
        if '<!-- PUBLIC-TOC -->' in read(rel):
            continue
        rows = heading_rows(rel)
        assert len(rows) >= 5, '%s: only %d headings' % (rel, len(rows))
        block = section(eyebrow, 'On this page', 'Every section of this document, in order.',
                        table(['Section', 'Covers'], rows) + '<!-- PUBLIC-TOC -->\n')
        s = read(rel)
        i = s.find('<section class="ref-panel"')
        assert i > 0, rel
        write(rel, s[:i] + block + s[i:])
        done.append(rel)

    # ── 5. marketing home: the captured payments preview, as a table ────────
    if insert('apps/landing',
              '<section class="ref-panel"',
              section('PAYMENTS PREVIEW', 'Money in one place.',
                      'A preview of the payment schedule clients follow — deposit, milestones, final release. '
                      'Figures below are illustrative, not a live checkout.',
                      table(['Payment', 'State', 'Amount'],
                            [('Milestone 2 · Design', '<span class="badge tone-success">Paid</span>', '₹29,500'),
                             ('Milestone 3 · Frontend', '<span class="badge tone-warning">Pending</span>', '₹48,000'),
                             ('Final payment', '<span class="badge tone-neutral">Due</span>', '₹62,000'),
                             ('<b>Collected to date</b>', '<span class="dim">Razorpay · PCI · India rails</span>',
                              '<b>₹4,28,500</b>')],
                            caption='Preview figures marked illustrative. Pay ₹48,000 now is shown as a preview, '
                                    'not a live checkout.')),
              '<!-- PUBLIC-PREVIEW -->'):
        done.append('apps/landing')

    # ── 6. about: the captured workflow, as a table ─────────────────────────
    if insert('apps/landing/about',
              '<section class="ref-panel"',
              section('HOW WE WORK', 'Request, quote, build, pay.',
                      'One operator, one workflow, four steps — each one visible in your Project Hub.',
                      table(['Step', 'What happens', 'Where it lives'],
                            [('01 Request', 'Brief intake with scope, timeline and a budget band.', 'Client portal'),
                             ('02 Quote', 'Fixed-price proposal with line items and revision rounds.', 'Quotes'),
                             ('03 Build &amp; pay', 'Razorpay milestone payments, deliverables approved at each gate.',
                              'Projects &amp; payments'),
                             ('04 Delivery', 'Final release, invoices and receipts, portfolio-ready handoff.',
                              'Delivery gates')])),
              '<!-- PUBLIC-WORKFLOW -->'):
        done.append('apps/landing/about')

    # ── 7. contact: what to send and how fast we reply (no form here on purpose)
    if insert('apps/landing/contact',
              '<section class="ref-panel"',
              section('WHAT TO SEND', 'Send a brief that can be quoted.',
                      'The secure form opens inside the Nestlancer app — these are the details that turn a brief '
                      'into a fixed-price quote.',
                      table(['Channel', 'What to send', 'Typical reply'],
                            [('Studio email', 'contact@nestlancer.com — what to ship, rough timeline, budget band, links.',
                              '&lt; 24h IST'),
                             ('Secure brief form', 'Full intake inside the app, with file attachments.',
                              '1 business day'),
                             ('International clients', 'India, US, UK, UAE and worldwide studio engagements.',
                              '1 business day IST')])),
              '<!-- PUBLIC-CONTACT -->'):
        done.append('apps/landing/contact')

    # ── 8. pricing: engagement comparison ───────────────────────────────────
    if insert('apps/landing/pricing',
              '<section class="ref-panel"',
              section('COMPARE ENGAGEMENTS', 'What each package includes.',
                      'Web Application MVP is the studio standard; everything else is scoped per brief.',
                      table(['Engagement', 'From', 'Timeline', 'Includes'],
                            [('Web Application MVP <span class="badge tone-brand">POPULAR</span>', '₹59,000',
                              '≈30 days',
                              'Discovery &amp; requirements workshop, UI/UX for core screens, frontend + backend API, '
                              'QA deployment &amp; handoff, 2 revision rounds'),
                             ('Custom project', 'Custom quote', 'Tailored scope &amp; timeline',
                              'Milestone payment schedule, dedicated studio delivery, progress tracking in-app, '
                              'invoices &amp; receipts'),
                             ('Talk to the studio', 'Free consult', 'Reply in 1 business day',
                              'No subscription, transparent line-item quotes, Razorpay milestone payments, '
                              'portfolio references')])),
              '<!-- PUBLIC-COMPARE -->'):
        done.append('apps/landing/pricing')

    # ── 9. services: the same three packages as a scan-friendly table ───────
    if insert('apps/landing/services',
              '<section class="ref-panel"',
              section('SERVICE PACKAGES', 'Pick a starting point.',
                      'The same studio packages as Pricing — request one and the brief becomes a fixed-price quote.',
                      table(['Service', 'From', 'Timeline'],
                            [('Web Application MVP', '₹59,000', '≈30 days'),
                             ('Custom project', 'Custom quote', 'Scoped per brief'),
                             ('Talk to the studio', 'Free consult', 'Reply in 1 business day')])),
              '<!-- PUBLIC-SERVICES -->'):
        done.append('apps/landing/services')

    print('batch D — updated %d pages' % len(done))
    for d in done:
        print('  ▸', d)


if __name__ == '__main__':
    main()
