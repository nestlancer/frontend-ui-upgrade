#!/usr/bin/env python3
"""a11y_fix.py — close the accessibility findings from gate_sweep.mjs.

Four documented passes, each derived from markup that already exists (no
invented copy), and each one idempotent:

1. headings — two structures skip heading levels:
   * the shared marketing footer uses `<h5>Product|Company|Legal</h5>` after an
     `<h2>`, so the level jumps 2 -> 5 on 29 pages. The tag becomes `<h3>`; the
     visual is unchanged because `.footer h5` is a class-scoped rule that now
     also covers `h3` (see proto.css).
   * `.rail-title` sidebar labels (blog/admin rails) are `<h5>` after an `<h1>`
     or `<h2>`; they become `<h3>`, still class-styled.

2. labels — `<label class="label">Title *</label>` sat next to its control with
   no `for`/`id`, so the control had no accessible name. Each pair is linked by
   generating a unique id from the visible label text.

3. check rows — `<div class="check"><input type="checkbox"> <span>Text</span>`
   left the checkbox unlabelled *and* only 16px of target. The wrapper becomes a
   `<label class="check">` (`.check` is display:flex, so nothing moves) and the
   whole row becomes the control's target.

4. filter selects — bare `<select>`s in filter bars get an `aria-label` derived
   from their own first option ("All statuses" -> "Filter by status", sort
   select -> "Sort by"). A short explicit table covers the few that do not
   follow the "All <noun>" shape.

5. table-cell fields — inputs that live inside a `<td>` (portfolio metrics, the
   quote-builder line items) had no name of their own. The table's `<th>` gets an
   id and each field points at it with `aria-labelledby`, so the column header
   ("Metric", "Qty", "Unit price") is what a screen reader announces.

6. indexed panel rows — footnote/reference rows are `<span>[n]</span><input>`
   inside a titled panel. The panel title gives the name ("Footnotes" + 1 ->
   "Footnote 1") and the input gets an `aria-label`.

7. first-section rails — when a `.rail-title` is the first heading after the
   `<h1>` (blog index / category / tag), calling it `<h3>` skips a level. That
   one heading becomes `<h2>`; rails that follow a section heading keep `<h3>`.

8. named fields — the handful of controls whose name cannot be derived from
   markup (a bare date filter) are listed explicitly, keyed to one page so an
   identical tag elsewhere is never mislabelled.

Anything the script cannot classify is reported, never guessed.

Usage: python3 tools/proto/upgrade/a11y_fix.py [--dry-run]
"""
import glob
import re
import sys
from collections import Counter

DRY = '--dry-run' in sys.argv

LABEL_RE = re.compile(r'<label(?P<attr>\s+class="label(?:\s[^"]*)?"[^>]*|(?![^>]*class)[^>]*)>(?P<text>.*?)</label>', re.S)
CTRL_RE = re.compile(r'<(?:input|textarea|select)\b[^>]*>', re.I)
CHECK_RE = re.compile(r'<div(?P<attr>\s+class="check[^"]*"\s*)>')
SELECT_RE = re.compile(r'<select\b(?P<attr>[^>]*)>(?P<body>.*?)</select>', re.S | re.I)
TAG_RE = re.compile(r'<[^>]+>')

SORT_FIRST = {'newest', 'oldest', 'largest', 'smallest', 'recent', 'recently updated'}

TABLE_RE = re.compile(r'<table\b.*?</table>', re.S | re.I)
TH_RE = re.compile(r'<th\b(?P<attr>[^>]*)>(?P<body>.*?)</th>', re.S | re.I)
TROW_RE = re.compile(r'(?P<open><tr\b[^>]*>)(?P<body>.*?)(?P<close></tr>)', re.S | re.I)
TD_RE = re.compile(r'<td\b(?P<attr>[^>]*)>(?P<body>.*?)</td>', re.S | re.I)
PANEL_TITLE_RE = re.compile(r'<h2 class="panel-title">(?P<t>.*?)</h2>', re.S)
INDEX_ROW_RE = re.compile(
    r'<span class="mono text-xs dim"[^>]*>\[(?P<n>\d+)\]</span><input\b(?P<attr>[^>]*)>')

# Fields whose name cannot be derived from the surrounding markup. Keyed to a
# page so an identical tag on another page is never relabelled. The value is
# (exact tag text, aria-label, expected occurrences).
MANUAL_FIELDS = [
    (r'admin/audit/', '<input class="input sm" type="date" style="width:150px">',
     'Filter by date', 1),
]

# A field is already named if any of these apply.
NAME_ATTRS = ('aria-label', 'aria-labelledby', 'title', 'placeholder')


def named(tag):
    return any(a in tag for a in NAME_ATTRS) or bool(re.search(r'\bid="', tag))

# Selects whose first option does not name the field. Keyed by (page pattern,
# first option) so an identical option text on another page is never mislabelled.
MANUAL_SELECTS = [
    (r'admin/contact/', 'All', 'Filter by status'),
    (r'web/payments/invoices/', 'All', 'Filter by status'),
    (r'admin/media/browse/', 'Sort: Newest', 'Sort by'),
    (r'admin/messages/threads/', 'Any assignee', 'Filter by assignee'),
    (r'admin/pipeline/projects/', 'Financial state', 'Filter by financial state'),
    (r'admin/requests/index', 'Inbox (needs review)', 'Filter by status'),
    (r'admin/system/index', 'Info', 'Filter by severity'),
    (r'admin/users/index', 'Joined', 'Sort by'),
    (r'web/messages/threads/', 'Any state', 'Filter by state'),
    (r'web/settings/account/', 'Public', 'Profile visibility'),
    (r'/quote/new/', 'Upon acceptance', 'Payment trigger'),
    (r'/quote/new/', 'Upon milestone approval', 'Payment trigger'),
]


def slug(text, used):
    base = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:32] or 'field'
    cand = 'nl-' + base
    n = 2
    while cand in used:
        cand = f'nl-{base}-{n}'
        n += 1
    used.add(cand)
    return cand


def clean_label(text):
    text = TAG_RE.sub(' ', text)
    text = text.replace('*', ' ')
    return re.sub(r'\s+', ' ', text).strip()


def pass_headings(html):
    n = 0
    def repl(m):
        nonlocal n
        n += 1
        return '<h3' + (m.group(1) or '') + '>'
    html = re.sub(r'<h5>((?:Product|Company|Legal|Resources|Company|Platform)</h5>)', lambda m: '<h3>' + m.group(1), html)
    html = re.sub(r'<h5(\s+class="rail-title[^"]*")>', r'<h3\1>', html)
    # closers for the two patterns above
    html = re.sub(r'(<h3>(?:Product|Company|Legal|Resources|Platform)</h3>)', r'\1', html)
    html = html.replace('</h5>\n<div class="footer-col', '</h3>\n<div class="footer-col')
    return html, n


def fix_headings(html):
    """Return (html, count)."""
    n = 0
    # footer column titles: <h5>Product</h5> in the shared marketing footer
    for word in ('Product', 'Company', 'Legal'):
        pat = f'<h5>{word}</h5>'
        if pat in html:
            html = html.replace(pat, f'<h3>{word}</h3>')
            n += 1
    # sidebar rail labels
    for attr in (' class="rail-title"', ' class="rail-title mt-6"'):
        pat = f'<h5{attr}>'
        if pat in html:
            n += html.count(pat)
            html = html.replace(pat, f'<h3{attr}>')
    # the matching closing tags for rail labels
    if n:
        html = re.sub(r'(<h3 class="rail-title[^"]*">[^<]*)</h5>', r'\1</h3>', html)
    return html, n


def fix_labels(html):
    used = set(re.findall(r'\bid="([^"]+)"', html))
    out = []
    pos = 0
    count = 0
    for m in LABEL_RE.finditer(html):
        attr, text = m.group('attr') or '', m.group('text')
        if 'for=' in attr or 'aria-label' in attr:
            continue
        # the control must be the next input/textarea/select before the field ends
        tail = html[m.end():m.end() + 600]
        stop = tail.find('</div>')
        window = tail[:stop] if stop != -1 else tail
        c = CTRL_RE.search(window)
        if not c:
            continue
        ctrl = c.group(0)
        if re.search(r'\bid=|aria-label|aria-labelledby', ctrl):
            continue
        name = clean_label(text)
        if not name:
            continue
        ident = slug(name, used)
        new_label = m.group(0).replace('<label', f'<label for="{ident}"', 1)
        out.append(html[pos:m.start()])
        out.append(new_label)
        pos = m.end()
        # patch the control inside the window
        cstart = m.end() + c.start()
        cend = m.end() + c.end()
        new_ctrl = ctrl.replace('<' + ctrl.split()[0][1:], f'<{ctrl.split()[0][1:]} id="{ident}"', 1)
        out.append(html[pos:cstart])
        out.append(new_ctrl)
        pos = cend
        count += 1
    out.append(html[pos:])
    return ''.join(out), count


def fix_checks(html):
    """div.check -> label.check, so the row is the target and the box is labelled."""
    parts = []
    pos = 0
    count = 0
    for m in CHECK_RE.finditer(html):
        if m.start() < pos:
            continue
        # find this div's matching close
        depth = 0
        i = m.start()
        end = None
        for t in re.finditer(r'<div\b|</div\s*>', html[m.start():], re.I):
            if t.group(0).startswith('</'):
                depth -= 1
                if depth == 0:
                    end = m.start() + t.end()
                    break
            else:
                depth += 1
        if end is None:
            continue
        block = html[m.start():end]
        if '<input type="checkbox"' not in block and '<input type="radio"' not in block:
            continue
        if '<a ' in block or '<button' in block:      # label must not wrap interactive content
            continue
        new = '<label' + (m.group('attr') or ' ') + '>' + block[len(m.group(0)):]
        new = new[:len(new) - len('</div>')] + '</label>'
        parts.append(html[pos:m.start()])
        parts.append(new)
        pos = end
        count += 1
    parts.append(html[pos:])
    return ''.join(parts), count



def fix_first_rail(html):
    """A rail heading that opens the page's outline is a section (pass 7)."""
    rail = re.search(r'<h3 class="rail-title', html)
    h2 = re.search(r'<h2\b', html)
    if not rail or (h2 and h2.start() < rail.start()):
        return html, 0
    out, pos, count = [], 0, 0
    for m in re.finditer(r'<h3 class="rail-title', html):
        if h2 and h2.start() < m.start():
            break
        out.append(html[pos:m.start()])
        out.append('<h2 class="rail-title')
        pos = m.end()
        count += 1
    out.append(html[pos:])
    return ''.join(out), count


def _field_in(body):
    """The first field tag inside a table cell that still needs a name."""
    for m in CTRL_RE.finditer(body):
        tag = m.group(0)
        if 'type="hidden"' in tag or 'type="button"' in tag or 'type="submit"' in tag:
            continue
        if named(tag):
            continue
        return m
    return None


def fix_table_fields(html):
    """`<td>` inputs take their name from the column header (see pass 5)."""
    count = 0
    counter = [0]

    def do_table(tm):
        nonlocal count
        table = tm.group(0)
        head = re.search(r'<thead\b.*?</thead>', table, re.S | re.I)
        if not head:
            return table
        head_txt = head.group(0)
        ids = []

        def th_repl(hm):
            attr, body = hm.group('attr'), hm.group('body')
            if 'id="' in attr:
                ids.append(re.search(r'id="([^"]+)"', attr).group(1))
                return hm.group(0)
            if not clean_label(body):
                ids.append('')
                return hm.group(0)
            counter[0] += 1
            tid = f'nl-th-{counter[0]}'
            ids.append(tid)
            return f'<th id="{tid}"{attr}>{body}</th>'

        new_head = TH_RE.sub(th_repl, head_txt)
        table = table.replace(head_txt, new_head, 1)
        if not any(ids):
            return table

        body = re.search(r'<tbody\b.*?</tbody>', table, re.S | re.I)
        if not body:
            return table
        body_txt = body.group(0)
        rows = re.sub(r'<thead\b.*?</thead>', '', body_txt, flags=re.S | re.I)
        out, pos = [], 0
        for rm in TROW_RE.finditer(rows):
            col = [0]

            def td_repl(dm):
                nonlocal count
                i = col[0]
                col[0] += 1
                inner = dm.group('body')
                fm = _field_in(inner)
                if not fm or i >= len(ids) or not ids[i]:
                    return dm.group(0)
                tag = fm.group(0)
                count += 1
                return dm.group(0).replace(tag, tag[:-1] + f' aria-labelledby="{ids[i]}">', 1)

            out.append(rows[pos:rm.start()])
            out.append(rm.group('open') + TD_RE.sub(td_repl, rm.group('body')) + rm.group('close'))
            pos = rm.end()
        out.append(rows[pos:])
        return table.replace(body_txt, ''.join(out), 1)

    html = TABLE_RE.sub(do_table, html)
    return html, count


def fix_index_rows(html):
    """Indexed panel rows name their field from the panel title (see pass 6)."""
    count = 0
    skip = 0

    def repl(m):
        nonlocal count, skip
        tag = '<input' + m.group('attr') + '>'
        if named(tag):
            skip += 1
            return m.group(0)
        titles = PANEL_TITLE_RE.findall(html[:m.start()])
        if not titles:
            skip += 1
            return m.group(0)
        title = clean_label(titles[-1])
        noun = title[:-1] if title.endswith('s') else title
        label = f'{noun} {m.group("n")}'
        count += 1
        return m.group(0)[: -len(tag)] + '<input' + m.group('attr') + f' aria-label="{label}">'

    return INDEX_ROW_RE.sub(repl, html), count


def fix_named_fields(html, path):
    """The explicit table for controls markup cannot name (see pass 7)."""
    count = 0
    for pattern, tag, label, expected in MANUAL_FIELDS:
        if not re.search(pattern, path):
            continue
        new_tag = tag[:-1] + f' aria-label="{label}">'
        if html.count(new_tag) == expected:
            continue  # already applied
        if html.count(tag) != expected:
            raise SystemExit(
                f'a11y_fix: {path} — expected {expected} x {tag!r}, found {html.count(tag)}')
        html = html.replace(tag, new_tag, 1)
        count += 1
    return html, count


def fix_selects(html, path):
    count = 0
    unclassified = []

    def repl(m):
        nonlocal count
        attr, body = m.group('attr'), m.group('body')
        if 'aria-label' in attr or 'id=' in attr:
            return m.group(0)
        first = re.search(r'<option[^>]*>(.*?)</option>', body, re.S)
        first_txt = clean_label(first.group(1)) if first else ''
        name = None
        for pattern, opt, label in MANUAL_SELECTS:
            if first_txt == opt and re.search(pattern, path):
                name = label
                break
        if name:
            pass
        elif first_txt.lower() in SORT_FIRST:
            name = 'Sort by'
        elif first_txt.lower().startswith('all ') and len(first_txt) > 4:
            noun = first_txt[4:].strip().rstrip('s')
            name = f'Filter by {noun}'
        if not name:
            unclassified.append(first_txt[:30] or '(no options)')
            return m.group(0)
        count += 1
        return f'<select aria-label="{name}"{attr}>{body}</select>'

    return SELECT_RE.sub(repl, html), count, unclassified


def main():
    totals = Counter()
    leftover = []
    touched = 0
    for path in sorted(glob.glob('proto/**/*.html', recursive=True)):
        src = open(path, encoding='utf8').read()
        html = src
        html, h = fix_headings(html)
        html, l = fix_labels(html)
        html, c = fix_checks(html)
        html, fr = fix_first_rail(html)
        html, tf = fix_table_fields(html)
        html, ir = fix_index_rows(html)
        html, nf = fix_named_fields(html, path)
        html, s, un = fix_selects(html, path)
        if un:
            leftover.append((path, un))
        if html != src:
            touched += 1
            if not DRY:
                open(path, 'w', encoding='utf8').write(html)
        totals['headings'] += h
        totals['label pairs'] += l
        totals['check rows'] += c
        totals['filter selects'] += s
        totals['first-section rails'] += fr
        totals['table fields'] += tf
        totals['indexed rows'] += ir
        totals['named fields'] += nf

    verb = 'would fix' if DRY else 'fixed'
    print(f'a11y_fix — {verb} across {touched} page(s):')
    for k in ('headings', 'label pairs', 'check rows', 'filter selects',
              'first-section rails', 'table fields', 'indexed rows', 'named fields'):
        print(f'    {k:16s} {totals[k]}')
    if leftover:
        print(f'\n  reported for review ({len(leftover)} page(s)) — selects with no derivable name:')
        for path, names in leftover[:12]:
            print(f'    {path}  {names}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
