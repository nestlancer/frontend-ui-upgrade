"""Batch 6/7 engine: client + admin workbench pages (one-shot, route-aware).

Run from the repository root:  python3 upgrade-v2/implement-workbench.py [client|admin|all]

Applies page-level HTML wiring derived from each page's own markup:
  * offline fonts, workbench/operator assets, local page-search dialog from the page's sidebar
  * table semantics, labelled charts and progress bars, labelled controls, unique IDs
  * honest local controls: real row filtering, section navigation, disabled-with-reason
    pagination/sort, CSV export of visible rows, print-to-PDF, copy, local validation,
    preview-only confirmation for state-changing actions
Business text, amounts, IDs, defaults and links are never rewritten.
"""
from pathlib import Path
import csv, os, re, sys
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
ASSETS = ROOT / 'proto/shared/assets'
fragment = lambda html: BeautifulSoup(html, 'html.parser')
clean = lambda t: re.sub(r'\s+', ' ', t or '').strip()


def add(parent, html):
    for el in list(fragment(html).contents):
        parent.append(el)


def cls(el, *names):
    el['class'] = list(dict.fromkeys(el.get('class', []) + list(names)))


def save(p, s):
    p.write_text(str(s).replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio='))


class Page:
    def __init__(self, path, surface):
        self.p = ROOT / path
        self.s = BeautifulSoup(self.p.read_text(), 'html.parser')
        self.surface = surface
        self.rel = os.path.relpath(ASSETS, self.p.parent)
        self.main = self.s.select_one('main')
        self.n = 0
        self.notes = []

    def uid(self, prefix):
        self.n += 1
        while self.s.find(id=f'{prefix}-{self.n}'):
            self.n += 1
        return f'{prefix}-{self.n}'

    def ensure_id(self, el, prefix):
        if not el.get('id'):
            el['id'] = self.uid(prefix)
        return el['id']


# ------------------------------------------------------------------ head/body
def setup(pg):
    s = pg.s
    body = s.body
    if 'workbench-v2' in body.get('class', []):
        raise RuntimeError('One-shot workbench migration already applied: ' + str(pg.p))
    cls(body, 'upgrade-v2', 'workbench-v2', 'workbench-' + pg.surface)
    if pg.surface == 'admin':
        cls(body, 'operator-v2')
    for el in list(s.select('link[href*="fonts.googleapis"],link[href*="fonts.gstatic"]')):
        el.decompose()
    head_add = (f'<link rel="stylesheet" href="{pg.rel}/operator.css"><link rel="stylesheet" href="{pg.rel}/workbench.css">'
                f'<script defer src="{pg.rel}/workbench.js"></script>')
    add(s.head, head_add)


# ------------------------------------------------------------- page search
def page_search(pg):
    s = pg.s
    search = s.select_one('.topsearch input')
    nav = s.select('.sb-nav > .sb-section')
    if not search or not nav:
        return False
    add(s.head, f'<script defer src="{pg.rel}/operator.js"></script>')
    search['aria-label'] = 'Open local page search'
    search['readonly'] = ''
    search['disabled'] = ''
    search['data-operator-search-open'] = ''
    search['aria-haspopup'] = 'dialog'
    search['aria-controls'] = 'operator-search'
    scope = 'operator console' if pg.surface == 'admin' else 'client portal'
    dialog = fragment(f'''<dialog class="operator-search" id="operator-search" aria-labelledby="operator-search-title" aria-describedby="operator-search-help"><header class="operator-search-head"><div><h2 id="operator-search-title">Search pages</h2><p id="operator-search-help">Jump to a page in this {scope} prototype. Searches page names only, not server records.</p></div><button class="btn btn-secondary" type="button" data-operator-search-close aria-label="Close page search">Esc</button></header><div class="operator-search-field"><label class="label" for="operator-search-query">Search or jump to…</label><input class="input" id="operator-search-query" type="search" autocomplete="off" aria-controls="operator-search-results" placeholder="Find a page"><p role="status" id="operator-search-status"></p></div><nav id="operator-search-results" aria-label="Matching prototype destinations"></nav><footer>↑ ↓ navigate · Enter open · Escape close</footer></dialog>''').dialog
    results = dialog.select_one('nav')
    for section in nav:
        label = section.select_one('.sb-label')
        group = s.new_tag('section', attrs={'class': 'operator-search-group'})
        h = s.new_tag('h3')
        h.string = clean(label.get_text(' ')) if label else 'Pages'
        group.append(h)
        for item in section.select('a.sb-item[href]'):
            a = s.new_tag('a', href=item['href'], attrs={'data-search-entry': ''})
            text = item.select_one('.l')
            a.string = clean((text or item).get_text(' '))
            group.append(a)
        results.append(group)
    add(results, '<section class="operator-search-group"><h3>Quick actions</h3><button type="button" data-search-entry data-theme-toggle>Switch theme · <span data-theme-label>Light</span></button></section>')
    s.body.append(dialog)
    return True


# --------------------------------------------------------------- semantics
def heading_for(el):
    host = el.find_parent(class_=['panel', 'dialog-surface', 'card']) or el.find_parent('section')
    if host:
        h = host.select_one('.panel-title, h2, h3')
        if h:
            return h
    return None


def semantics(pg):
    m = pg.main
    for t in m.select('table'):
        for th in t.select('thead th'):
            th['scope'] = 'col'
        for th in t.select('tbody th'):
            th['scope'] = 'row'
        h = heading_for(t)
        if h and not t.get('aria-labelledby') and not t.get('aria-label'):
            t['aria-labelledby'] = pg.ensure_id(h, 'wb-heading')
        elif not t.get('aria-labelledby') and not t.get('aria-label') and m.select_one('h1'):
            t['aria-label'] = clean(m.select_one('h1').get_text(' '))
    # Charts: meaningful svgs (not icons) get an accessible name from their panel.
    for svg in m.select('svg'):
        if svg.get('aria-hidden') == 'true' or svg.find_parent(['button', 'a']) or svg.get('role') == 'img':
            continue
        w = svg.get('width', '')
        if w.isdigit() and int(w) <= 28:
            svg['aria-hidden'] = 'true'
            continue
        h = heading_for(svg)
        svg['role'] = 'img'
        if h:
            svg['aria-labelledby'] = pg.ensure_id(h, 'wb-heading')
        else:
            svg['aria-label'] = 'Chart'
    # Progress bars: expose the authored percentage, never change it.
    for prog in m.select('.prog'):
        if prog.get('role'):
            continue
        bar = prog.find(style=re.compile(r'width:\s*[\d.]+%')) or (prog if re.search(r'width:\s*[\d.]+%', prog.get('style', '')) else None)
        if not bar:
            continue
        value = re.search(r'width:\s*([\d.]+)%', bar['style']).group(1)
        row = prog.find_parent(['tr', 'li']) or prog.find_parent(class_=['panel-row', 'field', 'panel', 'card'])
        name = ''
        if row:
            first = row.select_one('td, b, strong, .font-semibold, .label, .panel-title') or row
            name = clean(first.get_text(' '))[:80]
        prog['role'] = 'progressbar'
        prog['aria-valuemin'] = '0'
        prog['aria-valuemax'] = '100'
        prog['aria-valuenow'] = str(round(float(value)))
        prog['aria-label'] = (name + ' progress') if name else 'Progress'


def label_controls(pg):
    s, m = pg.s, pg.main
    controls = m.select('input:not([type=hidden]), select, textarea') + s.select('dialog:not(#operator-search) :is(input,select,textarea)')
    for c in controls:
        if c.get('id') == 'operator-search-query':
            continue
        labelled = c.get('aria-label') or c.get('aria-labelledby') or (c.get('id') and s.find('label', attrs={'for': c['id']}))
        wrap_label = c.find_parent('label')
        if wrap_label and clean(wrap_label.get_text(' ')):
            labelled = True
        field = c.find_parent(class_='field')
        lab = field.select_one('.label') if field else None
        if lab and lab.find_parent(class_='field') is field and not labelled:
            pg.ensure_id(c, 'wb-field')
            if lab.name == 'label':
                if not lab.get('for'):
                    lab['for'] = c['id']
                    labelled = True
            else:
                lab.name = 'label'
                lab['for'] = c['id']
                labelled = True
        if lab and lab.select_one('.req') and c.name != 'select' and c.get('type') not in ('checkbox', 'radio'):
            c['required'] = ''
        if labelled:
            continue
        name = ''
        if c.get('type') in ('checkbox', 'radio') or (wrap_label and 'switch' in wrap_label.get('class', [])):
            row = c.find_parent('tr') or c.find_parent(class_=['switch-row', 'panel-row', 'check', 'field']) or (wrap_label.parent if wrap_label else None)
            if row is not None:
                if row.name == 'tr':
                    cell = next((td for td in row.select('td') if clean(td.get_text(' '))), None)
                    name = ('Select ' + clean(cell.get_text(' '))[:60]) if cell else ''
                else:
                    first = row.select_one('b, strong, .font-semibold, .switch-label, .label, span, div')
                    name = clean((first or row).get_text(' '))[:80]
        if not name and c.get('placeholder'):
            name = clean(c['placeholder']).rstrip('…').rstrip('.')
        if not name and c.name == 'select':
            first = c.select_one('option')
            name = 'Choose ' + clean(first.get_text()).lower() if first else 'Choose an option'
        if not name:
            th = None
            td = c.find_parent('td')
            if td:
                idx = len(td.find_previous_siblings('td'))
                table = td.find_parent('table')
                ths = table.select('thead th') if table else []
                th = ths[idx] if idx < len(ths) else None
            name = clean(th.get_text(' ')) if th else ''
        if not name:
            prev = c.find_previous(string=lambda t: clean(t))
            name = clean(prev)[:60] if prev else 'Input'
        c['aria-label'] = name
    # Fix pluralisation bugs in existing interface-only labels.
    for sel in m.select('select[aria-label]'):
        sel['aria-label'] = re.sub(r'\bstatuse\b', 'status', re.sub(r'\bcategorie\b', 'category', sel['aria-label']))


def unique_ids(pg):
    seen = {}
    for el in pg.s.select('[id]'):
        seen.setdefault(el['id'], []).append(el)
    for ident, els in seen.items():
        if len(els) < 2:
            continue
        for el in els:
            if 'dialog-surface' in el.get('class', []) and el.find_parent(class_='state-deck'):
                el['id'] = ident + '-state'
                pg.notes.append(f'duplicate id {ident} → {ident}-state on state preview')
                break


# ---------------------------------------------------------------- filters
SORTISH = re.compile(r'^(sort\b|newest|oldest|largest|most viewed|name a|joined|last \d+ days|this quarter|all time|financial state|outstanding|paid in full)', re.I)


def list_after(filterbar):
    """Locate the records a filterbar controls: the next table body, else repeated cards."""
    node = filterbar
    for _ in range(8):
        sib = node.find_next_sibling()
        while sib is not None:
            table = sib if sib.name == 'table' else sib.find('table')
            if table and table.find('tbody') and table.tbody.find('tr'):
                return table.tbody, table.tbody.find_all('tr', recursive=False), table
            box = repeated(sib)
            if box:
                return box[0], box[1], None
            sib = sib.find_next_sibling()
        node = node.parent
        if node is None or node.name == 'main':
            break
    return None, [], None


def repeated(el):
    for cand in [el] + el.find_all(['div', 'section', 'ul', 'ol'], recursive=True)[:30]:
        kids = [k for k in cand.find_all(recursive=False) if isinstance(k, Tag)]
        sig = lambda k: (k.name, ' '.join(sorted(c for c in k.get('class', []) if c not in ('reveal', 'active', 'anim-in'))))
        if len(kids) >= 2:
            common = max(set(map(sig, kids)), key=lambda x: sum(sig(k) == x for k in kids))
            items = [k for k in kids if sig(k) == common]
            if len(items) >= 2 and len(items) >= len(kids) * 0.6 and any(c in common[1] for c in ('panel-row', 'panel', 'card', 'conv', 'mkt-card', 'req', 'row')) or (len(items) >= 2 and common[0] in ('a', 'li', 'article')):
                return cand, items
    return None


def filters(pg):
    m = pg.main
    lists = []
    for fb in m.select('.filterbar'):
        box, items, table = list_after(fb)
        if not items:
            pg.notes.append('filterbar without records left unwired')
            for c in fb.select('input, select'):
                c['disabled'] = ''
                c['title'] = 'Filtering is not available for this section of the prototype'
            continue
        lid = pg.uid('wb-list')
        box['id'] = lid
        box['data-wb-list'] = ''
        texts = []
        for it in items:
            it['data-wb-item'] = ''
            texts.append(clean(it.get_text(' ')).lower())
        unavailable = []
        for wrap in fb.select('.input-wrap[style]'):
            if 'width' in wrap['style']:
                del wrap['style']
                cls(wrap, 'wb-search')
        for inp in fb.select('input'):
            inp['type'] = 'search'
            inp['data-wb-search'] = ''
            inp['aria-controls'] = lid
            inp['disabled'] = ''
            if not inp.get('aria-label'):
                inp['aria-label'] = clean(inp.get('placeholder', 'Search this list')).rstrip('…')
            wrap = inp.find_parent(class_='input-wrap')
            if wrap:
                cls(wrap, 'wb-search')
        for sel in fb.select('select'):
            opts = sel.select('option')
            others = opts[1:]
            looks_sort = any(SORTISH.search(clean(o.get_text())) for o in opts)
            matches = [o for o in others if clean(o.get_text()).lower() in ' '.join(texts)]
            if looks_sort or (others and not matches):
                sel['disabled'] = ''
                sel['data-wb-unavailable'] = ''
                note = pg.uid('wb-note')
                sel['aria-describedby'] = note
                unavailable.append((note, clean(opts[0].get_text()) if opts else 'This option'))
                continue
            sel['data-wb-filter'] = ''
            sel['aria-controls'] = lid
            sel['disabled'] = ''
            for o in opts:
                t = clean(o.get_text())
                o['value'] = '' if (o is opts[0] or re.match(r'^(all|any)\b', t, re.I)) else t
            if not sel.get('aria-label'):
                sel['aria-label'] = 'Filter by ' + re.sub(r'^(all|any)\s+', '', clean(opts[0].get_text()), flags=re.I).lower()
        meta = fragment(f'<div class="wb-filter-meta"><span role="status" data-wb-result="{lid}"></span></div>').div
        for note, first in unavailable:
            add(meta, f'<span class="wb-unavailable-note" id="{note}">“{first}” is fixed in this prototype; other sort and date views need the live service.</span>')
        fb.insert_after(meta)
        anchor = table.find_parent(class_='tbl-wrap') if table else None
        anchor = anchor or table or box
        anchor.insert_after(fragment(f'<div class="wb-empty" data-wb-empty="{lid}" hidden><span><b>No matching rows on this page.</b> Only the sample records shown here are searchable.</span><button class="btn btn-secondary btn-sm" type="button" data-wb-clear="{lid}" disabled>Clear filters</button></div>').div)
        lists.append((lid, texts))
    return lists


# ------------------------------------------------------------------ tabs
def tabs(pg, lists):
    s, m = pg.s, pg.main
    for group in m.select('.tabs'):
        kids = group.select(':scope > a.tab, :scope > button.tab')
        if not kids:
            continue
        targets = [k.get('data-tab-target') for k in kids]
        real_links = [k for k in kids if k.name == 'a' and k.get('href') not in (None, '', '#')]
        if real_links and len(real_links) == len(kids):
            for k in kids:
                if 'active' in k.get('class', []):
                    k['aria-current'] = 'page'
            continue
        if all(targets) and all(s.find(id=t) for t in set(targets)):
            group.name = 'nav'
            group['aria-label'] = 'Page sections'
            group['data-wb-sections'] = ''
            group.attrs.pop('role', None)
            for k in kids:
                k.name = 'a'
                k['href'] = '#' + k['data-tab-target']
                del k['data-tab-target']
                for a in ('type', 'role', 'aria-selected'):
                    k.attrs.pop(a, None)
                if 'active' in k.get('class', []):
                    k['aria-current'] = 'true'
            continue
        # Fake tabs: become honest filter chips over this page's records when possible.
        lid, texts = lists[0] if lists else (None, [])
        group.attrs.pop('role', None)
        group['role'] = 'group'
        group['aria-label'] = 'Filter view'
        note = None
        for i, k in enumerate(kids):
            k.name = 'button'
            k['type'] = 'button'
            for a in ('href', 'data-tab-target', 'role', 'aria-selected'):
                k.attrs.pop(a, None)
            label = clean(''.join(t for t in k.find_all(string=True, recursive=False))) or clean(k.get_text(' '))
            label = re.sub(r'\s*\(\d+\)$', '', label)
            active = 'active' in k.get('class', [])
            key = '' if (i == 0 or re.match(r'^(all|any)\b', label, re.I)) else label
            usable = lid and (key == '' or any(key.lower() in t for t in texts))
            if usable:
                k['data-wb-chip'] = key
                k['data-wb-for'] = lid
                k['aria-pressed'] = 'true' if active else 'false'
                k['disabled'] = ''
            else:
                if active:
                    k['aria-pressed'] = 'true'
                    k['disabled'] = ''
                else:
                    if not note:
                        note = pg.uid('wb-note')
                    k['disabled'] = ''
                    k['aria-describedby'] = note
                    k['title'] = f'The “{label}” view is not included in this prototype sample'
        if note:
            group.insert_after(fragment(f'<p class="wb-ref-note" id="{note}">Views without sample records are shown for orientation only.</p>').p)


# ----------------------------------------------------------------- pager
def pagers(pg):
    for pager in pg.main.select('.pager'):
        pager.name = 'nav'
        pager['aria-label'] = 'Pagination'
        txt = clean(pager.get_text(' '))
        mm = re.search(r'(\d+)\s*[–-]\s*(\d+)\s+of\s+([\d,]+)', txt)
        more = mm and int(mm.group(3).replace(',', '')) > int(mm.group(2))
        note = pg.uid('wb-pager')
        for b in pager.select('button'):
            b['type'] = 'button'
            label = clean(b.get_text(' '))
            if label.isdigit() and 'page-cur' not in b.get('class', []):
                b['aria-label'] = f'Page {label}'
            if not b.has_attr('disabled'):
                b['disabled'] = ''
                b['aria-describedby'] = note
        cur = pager.select_one('.page-cur')
        if cur:
            cur['aria-current'] = 'page'
        if more:
            pager.insert_after(fragment(f'<p class="wb-pager-note" id="{note}">Only the first page of sample records is included in this prototype.</p>').p)
        else:
            pager.insert_after(fragment(f'<p class="wb-pager-note" id="{note}">All records are shown on this page.</p>').p)


# --------------------------------------------------------------- actions
DANGER = re.compile(r'^(delete|revoke|suspend|archive|remove|cancel pending|force password|unpublish|rotate|broadcast|refund|issue refund|decline|reject|block|ban|end session|terminate|disable|purge|flush|clear cache|quarantine|deactivate|withdraw|close account|delete account|sign out|log out|reset|void|unfeature|discard draft|mark as spam|escalate|reassign|transfer|move to trash|empty|kill|stop|pause|retry|replay|nudge|cancel quote|expire)', re.I)
CHECK = re.compile(r'^(save|send|post|publish|submit|create|request|reply|add|start|update|invite|schedule|apply|confirm|approve|accept|qualify|upload|attach|generate|record|verify|mark|assign|connect|enable|share|convert|issue|duplicate|use as template|new )', re.I)
GO = re.compile(r'^(details|view|open|edit|inspect|manage|review|logs|docs|preview|diff|configure|history)\b', re.I)


def icon_name(b):
    svg = str(b.svg or '')
    row = b.find_parent(['tr', 'li']) or b.find_parent(class_=['panel-row', 'chip', 'field', 'conv'])
    ctx = ''
    named = row.select_one('input[aria-label], select[aria-label]') if row else None
    if named and not row.select_one('td, b, strong, .font-semibold'):
        ctx = clean(named['aria-label'])[:60]
    elif row:
        first = row.select_one('td, b, strong, .font-semibold') or row
        ctx = clean(first.get_text(' '))[:60]
    if 'M18 6 6 18' in svg:
        verb = 'Remove'
    elif 'cx="19" cy="12"' in svg or 'cx="12" cy="5"' in svg:
        verb = 'More actions for'
    elif 'M21 15v4' in svg:
        verb = 'Download'
    elif 'rect x="9" y="9"' in svg or 'copy' in svg.lower():
        verb = 'Copy'
    else:
        verb = 'Action for'
    return (verb + ' ' + ctx).strip() if ctx else verb


def classify(label, b, has_fields):
    l = label.lower()
    if re.match(r'^copy\b', l) or l == 'copy':
        return 'copy'
    if 'export csv' in l or l == 'csv':
        return 'csv'
    if re.search(r'\bpdf\b|^print', l):
        return 'print'
    if re.match(r'^(download|open file|open)$', l) or l.startswith('download '):
        return 'file'
    if re.match(r'^(cancel|discard|clear)( changes| edits)?$', l):
        return 'reset' if has_fields else 'default'
    if l.startswith('reveal') or b.get('title', '').lower() == 'reveal':
        return 'secret'
    if DANGER.match(l) or label.startswith('Remove') or label.startswith('Delete'):
        return 'danger'
    if GO.match(l):
        row = b.find_parent(['tr', 'li']) or b.find_parent(class_=['panel-row', 'card'])
        link = row and row.find('a', href=lambda h: h and h != '#' and not h.startswith('#'))
        if link:
            return ('go', link['href'])
    if CHECK.match(l) and has_fields:
        return 'check'
    return 'default'


def fields_near(b):
    host = b.find_parent(['form']) or b.find_parent(class_=['dialog-surface', 'panel', 'card']) or b.find_parent('section')
    if not host:
        return False
    return any(not f.find_parent(class_='filterbar') for f in host.select('input:not([type=hidden]):not([type=search]), select, textarea'))


SKIP_ATTRS = ('data-tab-target', 'data-dialog-open', 'data-dialog-close', 'data-theme-toggle', 'data-sb-toggle', 'data-sb-close',
              'data-wb-chip', 'data-wb-clear', 'data-operator-search-open', 'data-operator-search-close', 'data-back')


def actions(pg):
    s = pg.s
    counts = {}
    scope = pg.main.select('button') + s.select('dialog:not(#operator-search):not(#wb-action) button')
    for b in scope:
        if any(b.has_attr(a) for a in SKIP_ATTRS) or b.find_parent(class_=['seg', 'pager']) or b.find_parent('nav', attrs={'data-wb-sections': True}):
            continue
        if b.find_parent(class_='tabs') and (b.has_attr('data-wb-chip') or b.has_attr('aria-pressed')):
            continue
        if any(a.startswith('data-wb-') for a in b.attrs):
            continue
        if b.has_attr('disabled') and str(b.get('aria-describedby', '')).startswith('wb-note'):
            continue  # unavailable views already carry an explanatory note
        if b.get('type') == 'submit' and b.find_parent('form', action=True):
            continue  # existing form navigation stays intact
        b.attrs.pop('onclick', None)
        if b.get('style') == 'vertical-align:middle':
            del b['style']
        text = clean(b.get_text(' '))
        if not text and not b.get('aria-label'):
            b['aria-label'] = b.get('title') or icon_name(b)
        label = text or b.get('aria-label') or b.get('title') or 'Action'
        kind = classify(label, b, fields_near(b))
        if kind == 'secret':
            b['disabled'] = ''
            b['title'] = 'Secret values are not stored in this prototype'
            b['aria-label'] = b.get('aria-label') or 'Reveal value (not available in prototype)'
            counts['secret'] = counts.get('secret', 0) + 1
            continue
        if isinstance(kind, tuple):
            b['data-wb-href'] = kind[1]
            kind = 'go'
        b['type'] = b.get('type') if b.get('type') in ('button',) else 'button'
        b['data-wb-action'] = kind
        if not text:
            b['data-wb-label'] = b['aria-label']
        if not b.has_attr('disabled'):
            b['disabled'] = ''
            b['data-wb-js'] = ''
        counts[kind] = counts.get(kind, 0) + 1
    return counts


def hash_links(pg):
    s, m = pg.s, pg.main
    heads = [(clean(h.get_text(' ')).lower(), h) for h in m.select('h2, h3, .panel-title')]
    for a in m.select('a[href="#"]'):
        if a.find_parent(class_='tabs') or a.find_parent('nav', attrs={'data-wb-sections': True}):
            continue
        label = clean(a.get_text(' '))
        key = re.sub(r'^(view all|view|see all|show all)\s+', '', label.lower()).strip()
        target = None
        if key and key != label.lower():
            for text, h in heads:
                if key.rstrip('s') and key.rstrip('s') in text:
                    target = h
                    break
        if target is not None:
            a['href'] = '#' + pg.ensure_id(target.find_parent(class_='panel') or target, 'wb-section')
            continue
        l = label.lower()
        kind = 'file' if (a.has_attr('download') or re.match(r'^(download|open file|open)\b', l)) else 'default'
        a['role'] = 'button'
        a['data-wb-action'] = kind
        a.attrs.pop('download', None)
        a.attrs.pop('target', None)
        a.attrs.pop('rel', None)
        if not label:
            a['aria-label'] = a.get('title') or 'Open item'
            a['data-wb-label'] = a['aria-label']


def chrome(pg):
    s = pg.s
    for b in s.select('header button, .topbar button'):
        if not clean(b.get_text(' ')) and not b.get('aria-label') and b.get('title'):
            b['aria-label'] = b['title']
    add(s.body, '<div class="wb-status" id="wb-status" role="status" aria-live="polite"></div>')
    add(s.body, '''<dialog class="wb-dialog" id="wb-action" aria-labelledby="wb-action-title" aria-describedby="wb-action-desc"><div class="wb-dialog-body"><p class="wb-dialog-eyebrow">Prototype action</p><h2 id="wb-action-title">Action</h2><p id="wb-action-desc"></p><p data-wb-context></p><p data-wb-outcome tabindex="-1" role="status"></p></div><div class="wb-dialog-foot"><button class="btn btn-secondary" type="button" data-wb-keep>Close</button><button class="btn btn-primary" type="button" data-wb-confirm>Preview</button></div></dialog>''')


def upgrade(path, surface, family):
    pg = Page(path, surface)
    if pg.main is None:
        raise RuntimeError('No <main>: ' + path)
    setup(pg)
    pg.s.body['data-page'] = family
    searchable = page_search(pg)
    semantics(pg)
    unique_ids(pg)
    lists = filters(pg)
    tabs(pg, lists)
    pagers(pg)
    hash_links(pg)
    counts = actions(pg)
    label_controls(pg)
    chrome(pg)
    save(pg.p, pg.s)
    return {'path': path, 'search': searchable, 'lists': len(lists), 'actions': counts, 'notes': pg.notes}


if __name__ == '__main__':
    lane = sys.argv[1] if len(sys.argv) > 1 else 'all'
    rows = [r for r in csv.DictReader(open('upgrade-v2/PAGE_COVERAGE.csv'))
            if r['status'] == 'NOT_STARTED' and r['surface'] in ('client', 'admin') and lane in ('all', r['surface'])]
    skip = {'proto/apps/admin/index.html'}  # redirect stub handled separately
    import json
    out = []
    for r in rows:
        if r['page_path'] in skip:
            continue
        out.append(upgrade(r['page_path'], r['surface'], r['page_family']))
    Path('upgrade-v2/evidence').mkdir(exist_ok=True)
    Path(f'upgrade-v2/evidence/workbench-{lane}-wiring.json').write_text(json.dumps(out, indent=1))
    total = {}
    for o in out:
        for k, v in o['actions'].items():
            total[k] = total.get(k, 0) + v
    print(len(out), 'pages', 'search:', sum(o['search'] for o in out), 'lists:', sum(o['lists'] for o in out), 'actions:', total)
