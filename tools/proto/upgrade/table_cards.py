#!/usr/bin/env python3
"""table_cards.py — make every proto table readable at phone width.

The shared sheet already converts `table.tbl.tbl-cards` into labelled card rows
below 760px (see proto.css, "Mobile: tables become labelled card rows"). 69
pages were authored with that contract; the remaining tables were not, so at
390px they clip their right-hand columns and the values become unreachable.

This script brings the stragglers onto the same contract, mechanically:
  * add `tbl-cards` to the table's class list (right after `tbl`)
  * copy each column label from `<thead><th>` onto every `<tr><td>` as
    `data-label`, which the CSS prints with `content: attr(data-label)`
  * rows whose cell count does not match the header, or that use colspan,
    are left untouched (they are summary/empty rows, not data rows)

Nothing but attributes is added: every value, name, rupee amount and id stays
byte-identical. Idempotent — a table that already has data-label is skipped.

Usage:  python3 tools/proto/upgrade/table_cards.py [--dry-run]
"""
import glob
import re
import sys

DRY = '--dry-run' in sys.argv

TABLE_RE = re.compile(r'<table\b([^>]*)>(.*?)</table>', re.S)
TR_RE = re.compile(r'<tr\b[^>]*>.*?</tr>', re.S)
TH_RE = re.compile(r'<th\b[^>]*>(.*?)</th>', re.S)
TD_RE = re.compile(r'<td\b([^>]*)>', re.S)
TAG_RE = re.compile(r'<[^>]+>')
WS_RE = re.compile(r'\s+')


def label_of(cell_html):
    """Header text with any inner markup and entities flattened."""
    txt = TAG_RE.sub(' ', cell_html)
    txt = (txt.replace('&amp;', '&').replace('&nbsp;', ' ')
              .replace('&rarr;', '>').replace('&times;', 'x'))
    return WS_RE.sub(' ', txt).strip()


def convert_table(attrs, body):
    """Return (new_attrs, new_body, cells_labelled) or None when nothing to do."""
    if 'data-label=' in body:
        return None
    thead = re.search(r'<thead\b.*?</thead>', body, re.S)
    tbody = re.search(r'<tbody\b.*?</tbody>', body, re.S)
    if not thead or not tbody:
        return None
    labels = [label_of(m.group(1)) for m in TH_RE.finditer(thead.group(0))]
    if not labels:
        return None

    done = 0

    def fix_row(row):
        nonlocal done
        cells = TD_RE.findall(row)
        if len(cells) != len(labels):
            return row
        if any('colspan' in a or 'rowspan' in a for a in cells):
            return row
        idx = 0
        out = []
        pos = 0
        for m in TD_RE.finditer(row):
            # insert inside the tag: everything up to the closing '>' ...
            out.append(row[pos:m.end() - 1])
            lab = labels[idx]
            idx += 1
            if lab:
                out.append(f' data-label="{lab}"')
                done += 1
            out.append('>')          # ... then close it
            pos = m.end()
        out.append(row[pos:])
        return ''.join(out)

    new_tbody = TR_RE.sub(lambda m: fix_row(m.group(0)), tbody.group(0))
    new_body = body.replace(tbody.group(0), new_tbody, 1)
    if not done:
        return None
    if 'tbl-cards' not in attrs:
        attrs = re.sub(r'(class="[^"]*?\btbl\b)', r'\1 tbl-cards', attrs, count=1)
        if 'tbl-cards' not in attrs:      # class attribute spelled differently
            return None
    return attrs, new_body, done


def main():
    pages = 0
    tables = 0
    cells = 0
    for path in sorted(glob.glob('proto/apps/**/*.html', recursive=True)):
        src = open(path, encoding='utf8').read()
        changed = False
        out = []
        pos = 0
        for m in TABLE_RE.finditer(src):
            attrs, body = m.group(1), m.group(2)
            if 'tbl' not in attrs:
                continue
            res = convert_table(attrs, body)
            if not res:
                continue
            new_attrs, new_body, done = res
            out.append(src[pos:m.start()])
            out.append(f'<table{new_attrs}>{new_body}</table>')
            pos = m.end()
            changed = True
            tables += 1
            cells += done
        if changed:
            out.append(src[pos:])
            pages += 1
            if not DRY:
                open(path, 'w', encoding='utf8').write(''.join(out))
    verb = 'would convert' if DRY else 'converted'
    print(f'table cards — {verb} {tables} table(s) across {pages} page(s), '
          f'{cells} labelled cell(s)')


if __name__ == '__main__':
    main()
