#!/usr/bin/env python3
"""admin_portfolio.py — build the captured admin Portfolio screens as real UI.

Screens `admin/048-portfolio-listing.webp` and
`admin/082-portfolio-item-analytics-panel.webp` are captured on
admin.nestlancer.com/portfolio against the same proto page
(`proto/apps/admin/portfolio/index.html`). The page previously showed a grid of
nine showcase cards with invented titles and view counts ("Laundry Everywhere
372 views") that contradicted the capture, while the components the capture
actually shows — the "On this page" counts, the category editor, the analytics
table, the manage-items table and the live timeline preview — were never built;
their only trace was the audit prose in the reference panel.

This script replaces the invented grid with the captured components, using the
values recorded in `tools/proto/DATA_AUDIT.md` for 048/082:

  On this page 8 · Published 8 · Draft 0 · Featured 4
  Categories: Web Development, Mobile App, UI/UX Design, E-Commerce
  Analytics: 11 total views, 0 likes, top items 8, per-item views
  Manage items: 8 entries in capture order, PUBLISHED, Oct 2026, 10/8/2026,
                actions Analytics / Edit / Unpublish / Delete
  Live timeline preview: the same 8 entries

Route-level note: this page is also the only route whose captures are long
documents (1409px / 1496px), so it opts into the `app-flow` frame release;
no sibling screen shares the route, so nothing else is affected.

Idempotent: the inserted block carries a guard marker and a second run reports
"already rebuilt". Only presentation changes — every value above is verbatim
from the audit.

Usage: python3 tools/proto/upgrade/admin_portfolio.py
"""
import re
import sys

PAGE = 'proto/apps/admin/portfolio/index.html'
MARKER = '<!-- admin-portfolio:captured-components -->'

# ---------------------------------------------------------------- audit data
ITEMS = [
    ('B2B Client Portal UX', 4),
    ('Fitness Tracking App', 1),
    ('Marketplace Redesign', 1),
    ('Brand Identity System', 1),
    ('Fintech Payments Hub', 1),
    ('SaaS Analytics Platform', 1),
    ('E-Commerce Mobile App', 1),
    ('HealthTech Dashboard', 1),
]
CATEGORIES = ['Web Development', 'Mobile App', 'UI/UX Design', 'E-Commerce']
EDIT = './[id]/edit/index.html'
PUBLIC_PAGE = '../../web/work/index.html'
SUBTITLE = ('Manage showcase projects. The live timeline below mirrors what '
            'visitors see on the public site.')

DIV_TAG = re.compile(r'<div\b|</div\s*>', re.I)


def block_end(s, start):
    """End index of the element whose opening <div is at `start`."""
    depth = 0
    for m in DIV_TAG.finditer(s, start):
        if m.group(0).startswith('</'):
            depth -= 1
            if depth == 0:
                return m.end()
        else:
            depth += 1
    raise ValueError('unbalanced <div> starting at %d' % start)


def stat_strip():
    cells = [('On this page', '8'), ('Published', '8'), ('Draft', '0'), ('Featured', '4')]
    inner = ''.join(
        f'\n    <div><div class="s-label">{label}</div>'
        f'<div class="s-value">{value}</div></div>'
        for label, value in cells)
    return f'<div class="stat-strip mb-5">{inner}\n  </div>'


def categories_panel():
    tags = ''.join(
        f'<span class="tag-remove">{c}<button type="button" class="x" '
        f'aria-label="Remove category {c}">'
        f'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
        f'</button></span>' for c in CATEGORIES)
    return f'''<div class="panel mb-5">
  <div class="panel-head"><div class="min-w-0">
    <h2 class="panel-title">Categories</h2>
    <div class="panel-sub">Labels clients filter by on the public work page.</div>
  </div></div>
  <div class="panel-body">
    <div class="flex items-center gap-2" style="flex-wrap:wrap">{tags}</div>
    <div class="filterbar mt-4">
      <div class="input-wrap" style="min-width:220px;flex:0 1 260px">
        <input class="input" id="pf-cat-new" placeholder="New category name" aria-label="New category name">
      </div>
      <button class="btn btn-primary btn-sm" type="button">Add category</button>
    </div>
  </div>
</div>'''


def analytics_panel():
    rows = ''.join(
        f'\n    <tr><td data-label="Item"><a class="link" href="{EDIT}">{name}</a></td>'
        f'<td data-label="Views" class="mono text-xs">{views}</td>'
        f'<td data-label="Likes" class="mono text-xs">0</td></tr>'
        for name, views in ITEMS)
    return f'''<div class="panel mb-5">
  <div class="panel-head"><div class="min-w-0">
    <h2 class="panel-title">Analytics</h2>
    <div class="panel-sub">Views and likes across the published showcase. Total views 11 · total likes 0 · top items 8.</div>
  </div></div>
  <div class="panel-body">
    <div class="grid g3 gap-4 mb-4">
      <div><div class="s-label">Total views</div><div class="s-value">11</div></div>
      <div><div class="s-label">Total likes</div><div class="s-value">0</div></div>
      <div><div class="s-label">Top items</div><div class="s-value">8</div></div>
    </div>
    <div class="tbl-wrap"><table class="tbl tbl-compact tbl-cards">
      <thead><tr><th>Item</th><th>Views</th><th>Likes</th></tr></thead>
      <tbody>{rows}
      </tbody>
    </table></div>
    <h3 class="panel-title mt-4">Item analytics</h3>
    <div class="grid g3 gap-4 mt-2">
      <div><div class="s-label">Top item</div><div class="s-value" style="font-size:14px">B2B Client Portal UX</div></div>
      <div><div class="s-label">Views</div><div class="s-value">4</div></div>
      <div><div class="s-label">Likes</div><div class="s-value">0</div></div>
    </div>
    <div class="empty mt-3" style="padding:18px 16px">
      <b>No engagement data yet.</b>
      <div class="text-sm dim">Likes appear here once visitors react to a published case study.</div>
    </div>
  </div>
</div>'''


def manage_panel():
    rows = ''.join(
        f'''\n    <tr><td data-label="Title"><a class="link font-semibold" href="{EDIT}">{name}</a></td>
      <td data-label="Status"><span class="badge tone-success">Published</span></td>
      <td data-label="Project date" class="mono text-xs">Oct 2026</td>
      <td data-label="Updated" class="mono text-xs">10/8/2026</td>
      <td data-label="Actions"><div class="flex items-center gap-3">
        <a class="link text-xs" href="{EDIT}">Analytics</a>
        <a class="link text-xs" href="{EDIT}">Edit</a>
        <button class="link text-xs" type="button">Unpublish</button>
        <button class="link text-xs" type="button" style="color:var(--t-danger-tx)">Delete</button>
      </div></td></tr>''' for name, _ in ITEMS)
    return f'''<div class="panel mb-5">
  <div class="panel-head"><div class="min-w-0">
    <h2 class="panel-title">Manage items</h2>
    <div class="panel-sub">Create, edit, publish, and remove portfolio entries.</div>
  </div></div>
  <div class="panel-body">
    <div class="filterbar mb-4">
      <div class="input-wrap" style="min-width:240px;flex:1 1 280px">
        <span class="in-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
        <input class="input" placeholder="Search portfolio…" aria-label="Search portfolio">
      </div>
    </div>
    <div class="tbl-wrap"><table class="tbl tbl-compact tbl-cards">
      <thead><tr><th>Title</th><th>Status</th><th>Project date</th><th>Updated</th><th>Actions</th></tr></thead>
      <tbody>{rows}
      </tbody>
    </table></div>
  </div>
</div>'''


def timeline_panel():
    rows = ''.join(
        f'''\n      <div class="flex items-center justify-between gap-3" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div class="flex items-center gap-2 min-w-0"><span class="dot" style="background:var(--brand-9)"></span>
          <a class="link truncate" href="{EDIT}">{name}</a></div>
        <span class="badge tone-success">Published</span>
      </div>''' for name, _ in ITEMS)
    return f'''<div class="panel mb-5">
  <div class="panel-head"><div class="min-w-0">
    <h2 class="panel-title">Live timeline preview</h2>
    <div class="panel-sub">Compact date and title preview of the public project timeline.</div>
  </div></div>
  <div class="panel-body">
    <div class="eyebrow mb-2"><span class="dot"></span>OCT 2026</div>
    <div class="grid g2 gap-x-6" style="align-items:start">{rows}
    </div>
  </div>
</div>'''


def main():
    src = open(PAGE, encoding='utf8').read()
    if MARKER in src:
        print('admin portfolio — already rebuilt, nothing to do')
        return 0

    out = src

    # 1. subtitle + header actions come from the capture
    out = re.sub(r'(<p class="psub">)[^<]*(</p>)', r'\g<1>' + SUBTITLE + r'\g<2>', out, count=1)
    a = out.index('<div class="phead-actions">')
    b = block_end(out, a)
    actions = ('<div class="phead-actions">'
               f'<a class="btn btn-ghost" href="{PUBLIC_PAGE}">View public page</a>'
               '<a class="btn btn-primary" href="./new/index.html">'
               '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
               'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
               '<path d="M5 12h14"/><path d="M12 5v14"/></svg> New item</a></div>')
    out = out[:a] + actions + out[b:]

    # 2. invented showcase grid -> removed (its titles and view counts are not
    #    in any audit note and contradict the capture's "total views 11")
    g = out.find('<div class="grid g3 gap-5 mt-5">')
    if g == -1:
        print('ERROR: showcase grid not found — page changed, aborting', file=sys.stderr)
        return 1
    ge = block_end(out, g)
    n_cards = out[g:ge].count('CASE STUDY')
    out = out[:g] + out[ge:]
    out = re.sub(r'\n{3,}', '\n\n', out)

    # 3. hero stat tiles -> the capture's "On this page" strip
    s = out.index('<div class="stats"')
    se = block_end(out, s)
    out = out[:s] + stat_strip() + out[se:]

    # 4. the captured components, in capture order, before the reference panel
    block = (MARKER + '\n' + categories_panel() + '\n' + analytics_panel() + '\n'
             + manage_panel() + '\n' + timeline_panel() + '\n')
    anchor = out.index('<section class="ref-panel"')
    out = out[:anchor] + block + out[anchor:]

    # 5. this route's captures are long documents: release the app frame
    out = out.replace('<body class="app-body">', '<body class="app-body app-flow">', 1)

    open(PAGE, 'w', encoding='utf8').write(out)
    print(f'admin portfolio — rebuilt: removed {n_cards} invented cards, '
          f'added 4 captured sections ({len(ITEMS)} items each), app-flow enabled')
    return 0


if __name__ == '__main__':
    sys.exit(main())
