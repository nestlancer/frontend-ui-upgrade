#!/usr/bin/env python3
# ============================================================================
# Nestlancer proto upgrade — state composition kit
#
# Small, dependency-free helpers that render the design system's components as
# plain HTML strings, so missing screen states (dialogs, tables, KPI rows,
# timelines) can be authored as data instead of hand-written markup.
#
#   run: python3 tools/proto/upgrade/apply_states.py
#
# Every helper keeps mock data intact — it only decides presentation.
# ============================================================================
import html
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PROTO = os.path.join(ROOT, 'proto')


def esc(t):
    return html.escape(str(t), quote=True)


# --------------------------------------------------------------------- fields
def f_text(label, value=None, ph=None, req=False, hint=None, mono=False, fid=None):
    fid = fid or re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
    val = f' value="{esc(value)}"' if value is not None else ''
    pha = f' placeholder="{esc(ph)}"' if ph else ''
    cls = 'input mono' if mono else 'input'
    req_mark = " <span class='req'>*</span>" if req else ""
    h = f'<div class="field"><label class="label" for="{fid}">{esc(label)}{req_mark}</label>'
    h += f'<input class="{cls}" id="{fid}"{val}{pha}>'
    if hint:
        h += f'<div class="hint">{esc(hint)}</div>'
    return h + '</div>'


def f_select(label, options, selected=0, fid=None):
    fid = fid or re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
    opts = ''.join(f'<option{" selected" if i == selected else ""}>{esc(o)}</option>'
                   for i, o in enumerate(options))
    return (f'<div class="field"><label class="label" for="{fid}">{esc(label)}</label>'
            f'<select class="select" id="{fid}">{opts}</select></div>')


def f_area(label, value=None, rows=3, ph=None, fid=None):
    fid = fid or re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
    inner = esc(value) if value else ''
    pha = f' placeholder="{esc(ph)}"' if ph else ''
    return (f'<div class="field"><label class="label" for="{fid}">{esc(label)}</label>'
            f'<textarea class="textarea" id="{fid}" rows="{rows}"{pha}>{inner}</textarea></div>')


def f_check(label, checked=True):
    return f'<label class="check"><input type="checkbox"{" checked" if checked else ""}> {esc(label)}</label>'


def f_file(label, hint=None, fid=None):
    fid = fid or re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
    onclick = "document.getElementById('" + fid + "').click()"
    h = (f'<div class="field"><label class="label" for="{fid}">{esc(label)}</label>'
         f'<div class="dropzone" style="padding:14px"><b class="text-sm">Drop files or choose from the media library</b>'
         f'<span class="text-xs">{esc(hint or "Multiple files supported")}</span>'
         f'<input id="{fid}" type="file" multiple tabindex="-1" aria-hidden="true">'
         f'<button class="btn btn-secondary btn-sm dz-pick" type="button" onclick="{onclick}">Choose files</button>'
         f'</div></div>')
    return h


def f_row(*cells, cols=2):
    """Grid of fields."""
    return f'<div class="grid g{cols} gap-3">' + ''.join(cells) + '</div>'


def f_kv(pairs):
    items = ''.join(f'<div><dt>{esc(k)}</dt><dd>{v}</dd></div>' for k, v in pairs)
    return f'<dl class="dl">{items}</dl>'


def f_kv_mini(pairs):
    items = ''.join(f'<dt>{esc(k)}</dt><dd>{v}</dd>' for k, v in pairs)
    return f'<dl class="kv">{items}</dl>'


def f_note(text, tone='', icon=True):
    cls = 'note' + (f' {tone}' if tone else '')
    return f'<div class="{cls}"><span class="text-xs">{text}</span></div>'


def f_tbl(headers, rows, cards=True, sticky=False, mono_cols=()):
    cls = 'tbl' + (' tbl-cards' if cards else '') + (' tbl-compact' if len(headers) > 4 else '')
    head = ''.join(f'<th>{h}</th>' for h in headers)
    body = ''
    for r in rows:
        cells = ''
        for i, c in enumerate(r):
            m = ' mono' if i in mono_cols else ''
            cells += f'<td data-label="{esc(headers[i])}" class="min-w-0{m}">{c}</td>'
        body += f'<tr>{cells}</tr>'
    wrap = 'tbl-wrap tbl-sticky' if sticky else 'tbl-wrap'
    return f'<div class="{wrap}"><table class="{cls}"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def f_tl(items):
    """items: (title, meta, body_html|None, muted_bool)"""
    out = []
    for it in items:
        title, meta = it[0], it[1]
        body = it[2] if len(it) > 2 else None
        mut = ' mut' if len(it) > 3 and it[3] else ''
        h = f'<div class="tline-item{mut}"><div class="tline-card"><b class="text-sm">{title}</b>'
        if meta:
            h += f'<div class="text-xs dim mono mt-1">{meta}</div>'
        if body:
            h += f'<div class="text-xs muted mt-1">{body}</div>'
        out.append(h + '</div></div>')
    return '<div class="tline">' + ''.join(out) + '</div>'


def f_kpis(items):
    """items: (label, value, note, tone)"""
    out = []
    for it in items:
        label, value = it[0], it[1]
        note = it[2] if len(it) > 2 else ''
        tone = it[3] if len(it) > 3 else ''
        out.append(f'<div class="kpi"><div class="k-label">{label}</div>'
                   f'<div class="k-value">{value}</div>'
                   f'<div class="k-delta {tone}">{note}</div></div>')
    return '<div class="kpi-grid">' + ''.join(out) + '</div>'


def f_chips(items, active=0):
    return '<div class="flex items-center gap-2 flex-wrap">' + ''.join(
        f'<span class="chip{" active" if i == active else ""}">{t}</span>' for i, t in enumerate(items)) + '</div>'


def f_btn(label, cls='btn btn-secondary btn-sm', disabled=False, href=None):
    if href:
        return f'<a class="{cls}" href="{href}">{label}</a>'
    d = ' disabled aria-disabled="true"' if disabled else ''
    return f'<button class="{cls}" type="button"{d}>{label}</button>'


def dlg(did, code, title, sub, body, foot_left='', buttons=None):
    """A dialog surface — the shape the design system uses for modal states."""
    buttons = buttons or []
    foot = ''.join(buttons)
    left = f'<span class="text-xs dim mr-auto">{foot_left}</span>' if foot_left else ''
    codebadge = f'<span class="badge tone-neutral mono">{esc(code)}</span>' if code else ''
    return f'''<section class="dialog-surface" id="{did}" aria-labelledby="{did}-h">
  <div class="dialog-head">
    <div class="min-w-0">
      <h3 class="panel-title" id="{did}-h">{title}</h3>
      <div class="panel-sub">{sub}</div>
    </div>
    {codebadge}
  </div>
  <div class="dialog-body">{body}</div>
  {f'<div class="dialog-foot">{left}{foot}</div>' if (foot or left) else ''}
</section>'''


def section(sid, title, sub='', eyebrow='', chips=None, body='', code=None, aside=''):
    chip_html = ''
    if chips:
        chip_html = '<div class="flex items-center gap-2 flex-wrap">' + ''.join(
            f'<span class="badge tone-neutral mono">{c}</span>' for c in chips) + '</div>'
    head = f'''<div class="sec-head">
    <div class="min-w-0">
      {f'<div class="sec-eyebrow">{eyebrow}</div>' if eyebrow else ''}
      <h2 class="sec-title" id="{sid}-h">{title}</h2>
      {f'<p class="sec-sub">{sub}</p>' if sub else ''}
    </div>
    {aside or chip_html}
  </div>'''
    return f'<section id="{sid}" class="mb-5" aria-labelledby="{sid}-h">{head}{body}</section>'


def deck(items):
    return '<div class="state-deck">' + ''.join(items) + '</div>'


# ------------------------------------------------------------------- patching
def page_path(route):
    return os.path.join(PROTO, route.strip('/'), 'index.html')


def insert_before_main_end(route, html_block, marker):
    """Insert html_block before </main>, once. Idempotent via marker comment."""
    p = page_path(route)
    src = open(p, encoding='utf-8').read()
    if marker in src:
        return False
    src = src.replace('</main>', f'<!-- {marker} -->\n{html_block}\n</main>', 1)
    open(p, 'w', encoding='utf-8').write(src)
    return True
