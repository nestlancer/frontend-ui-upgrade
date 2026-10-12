// ============================================================================
// Nestlancer prototype — reusable HTML components (server-rendered strings)
// ============================================================================
import { esc, initials, rng } from './util.mjs';
import { icon, logoMark } from './icons.mjs';

export const brand = (href) =>
  `<a href="${href}" class="brand">${logoMark(22)}<span>Nestlancer<span class="tld">.</span></span></a>`;

export const badge = (label, tone = 'neutral', opts = {}) =>
  `<span class="badge tone-${tone}${opts.noDot ? ' no-dot' : ''}">${esc(label)}</span>`;

export const avatar = (name, cls = '') =>
  `<span class="avatar ${cls}" title="${esc(name)}">${initials(name)}</span>`;

export const avBy = (name, hue = 2, cls = '') => `<span class="avatar hue-${hue} ${cls}">${initials(name)}</span>`;

// ------------------------------------------------------------------ buttons
export const btn = (label, { href = '#', variant = 'primary', size = '', i, ir, cls = '' } = {}) =>
  `<a href="${href}" class="btn btn-${variant} ${size ? 'btn-' + size : ''} ${cls}">${i ? icon(i, size === 'xs' ? 12 : 14) : ''}<span>${esc(label)}</span>${ir ? icon(ir, 14) : ''}</a>`;

// ------------------------------------------------------------------- panel
export const panel = ({ title, sub, actions, body, foot, pad = true, cls = '' }) => `
<div class="panel ${cls}">
  ${title ? `<div class="panel-head"><div class="min-w-0"><h3 class="panel-title">${title}</h3>${sub ? `<div class="panel-sub">${sub}</div>` : ''}</div>${actions ? `<div class="flex items-center gap-2 shrink-0">${actions}</div>` : ''}</div>` : ''}
  <div class="${pad ? 'panel-body' : ''}">${body}</div>
  ${foot ? `<div class="panel-foot">${foot}</div>` : ''}
</div>`;

// ------------------------------------------------------------------ tables
export function table({ cols, rows, cls = '', compact = false }) {
  return `<div class="tbl-wrap"><table class="tbl ${compact ? 'tbl-compact' : ''} ${cls}">
<thead><tr>${cols.map((c) => `<th${c.r ? ' style="text-align:right"' : ''}>${esc(c.l ?? c)}</th>`).join('')}</tr></thead>
<tbody>${rows
    .map(
      (r) =>
        `<tr>${r
          .map((c, i) => {
            const align = cols[i] && cols[i].r ? ' style="text-align:right"' : '';
            return `<td${align}>${c}</td>`;
          })
          .join('')}</tr>`
    )
    .join('')}</tbody></table></div>`;
}

// ------------------------------------------------------------------- stats
export function stats(items, cols = items.length) {
  return `<div class="stats" style="grid-template-columns:repeat(${cols},1fr)">${items
    .map(
      (s) => `<div class="stat">
  <div class="stat-label">${s.icon ? icon(s.icon, 13) : ''}${esc(s.label)}</div>
  <div class="stat-value">${s.value}</div>
  ${s.note ? `<div class="stat-note ${s.dir || ''}">${s.note}</div>` : ''}
</div>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------- filter + pager
export const filterbar = (inner) => `<div class="filterbar mb-4">${inner}</div>`;
export const searchInput = (ph = 'Search…', w = 280) =>
  `<div class="input-wrap" style="width:${w}px"><span class="in-icon">${icon('search', 14)}</span><input class="input" placeholder="${esc(ph)}"></div>`;
export const sel = (opts, cur) =>
  `<select class="select sm">${opts.map((o) => `<option${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;

export const pager = (text = 'Showing 1–10 of 10', pages = '1/1') => `
<div class="pager mt-4"><span>${esc(text)}</span>
<div class="pager-btns">
  <button class="btn btn-ghost btn-sm" disabled>${icon('chevron-left', 13)} <span>Prev</span></button>
  <span class="page-cur">${esc(pages.split('/')[0])}</span>
  <button class="btn btn-ghost btn-sm"${pages === '1/1' ? ' disabled' : ''}><span>Next</span> ${icon('chevron-right', 13)}</button>
</div></div>`;

// -------------------------------------------------------------------- tabs
export const tabs = (items) =>
  `<div class="tabs mb-5">${items.map((t) => `<a class="tab${t.active ? ' active' : ''}" href="${t.href || '#'}">${esc(t.l)}${t.count != null ? ` <span class="count">${t.count}</span>` : ''}</a>`).join('')}</div>`;

// ------------------------------------------------------------------- misc
export const progress = (pct, cls = '') =>
  `<div class="prog ${cls}"><i style="width:${pct}%"></i></div>`;

export const kv = (pairs) =>
  `<dl class="kv">${pairs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;

export const dl2 = (pairs) =>
  `<dl class="dl">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;

export const field = (label, inner, { hint, req = true } = {}) => `
<div class="field">
  <label class="label">${esc(label)}${req ? ' <span class="req">*</span>' : ''} ${icon('help-circle', 12)}</label>
  ${inner}
  ${hint ? `<span class="hint">${hint}</span>` : ''}
</div>`;

export const input = (props = {}) => {
  const { type = 'text', ph = '', val = '', cls = '' } = props;
  return `<input class="input ${cls}" type="${type}" placeholder="${esc(ph)}"${val ? ` value="${esc(val)}"` : ''}>`;
};

export const textarea = (ph, val = '', rows = 4) =>
  `<textarea class="textarea" rows="${rows}" placeholder="${esc(ph)}">${esc(val)}</textarea>`;

export const switchRow = (title, note, on = false) => `
<div class="switch-row">
  <div class="min-w-0"><div class="font-semibold" style="font-size:13px">${esc(title)}</div>${note ? `<div class="text-xs dim mt-1">${esc(note)}</div>` : ''}</div>
  <label class="switch"><input type="checkbox"${on ? ' checked' : ''}><i></i></label>
</div>`;

export const note = (kind, i, html) =>
  `<div class="note ${kind}">${icon(i, 15)}<div>${html}</div></div>`;

export const empty = (i, title, sub, action = '') => `
<div class="empty"><div class="e-icon">${icon(i, 20)}</div><b>${esc(title)}</b><span class="text-xs" style="max-width:42ch">${sub}</span>${action}</div>`;

// --------------------------------------------------------------- timeline
export const timeline = (items) => `
<div class="tline">${items
    .map(
      (t) => `<div class="tline-item${t.mut ? ' mut' : ''}">
  <div class="flex items-center gap-2 mb-1"><span class="font-semibold" style="font-size:13px">${t.title}</span>${t.badge || ''}</div>
  ${t.sub ? `<div class="text-xs muted">${t.sub}</div>` : ''}
  <div class="text-xs dim mono mt-1">${t.time ?? '—'}</div>
</div>`
    )
    .join('')}</div>`;

// ----------------------------------------------------------------- charts
export function lineChart({ w = 560, h = 170, data, seed = 7, fill = true, labels = [], stroke = 'var(--brand-8)' }) {
  const r = rng(seed);
  const pts = data || Array.from({ length: 24 }, (_, i) => 20 + r() * 60 + Math.sin(i / 3) * 16 + (i > 15 ? 26 : 0));
  const max = Math.max(...pts) * 1.12, min = Math.min(...pts) * 0.85;
  const X = (i) => (i / (pts.length - 1)) * (w - 8) + 4;
  const Y = (v) => h - 6 - ((v - min) / (max - min)) * (h - 16);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
  const area = `${path} L${X(pts.length - 1).toFixed(1)},${h - 2} L4,${h - 2} Z`;
  const id = 'g' + seed;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stroke}" stop-opacity=".22"/><stop offset="1" stop-color="${stroke}" stop-opacity="0"/></linearGradient></defs>
  ${[0.25, 0.5, 0.75].map((f) => `<line x1="4" x2="${w - 4}" y1="${h * f}" y2="${h * f}" stroke="var(--line)" stroke-dasharray="3 4" stroke-width="1"/>`).join('')}
  ${fill ? `<path d="${area}" fill="url(#${id})"/>` : ''}
  <path d="${path}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${X(pts.length - 1)}" cy="${Y(pts[pts.length - 1])}" r="3.5" fill="${stroke}"/>
</svg>${labels.length ? `<div class="flex justify-between text-xs dim mono" style="padding:2px 4px 0">${labels.map((l) => `<span>${l}</span>`).join('')}</div>` : ''}`;
}

export function barChart({ w = 560, h = 170, data, labels, colors }) {
  const max = Math.max(...data) * 1.15;
  const bw = (w - 8) / data.length;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" style="display:block">
  ${data
    .map((v, i) => {
      const bh = (v / max) * (h - 26);
      const c = (colors && colors[i]) || 'var(--brand-8)';
      return `<rect x="${(8 + i * bw + bw * 0.18).toFixed(1)}" y="${(h - bh - 18).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${c}"/>`;
    })
    .join('')}
</svg>${labels ? `<div class="flex justify-between text-xs dim mono">${labels.map((l) => `<span style="width:${100 / labels.length}%;text-align:center">${l}</span>`).join('')}</div>` : ''}`;
}

export function donut({ size = 120, parts }) {
  const total = parts.reduce((a, p) => a + p.v, 0);
  const C = 2 * Math.PI * 40;
  let off = 0;
  const segs = parts
    .map((p) => {
      const len = (p.v / total) * C;
      const s = `<circle r="40" cx="60" cy="60" fill="transparent" stroke="${p.c}" stroke-width="14" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;
      off += len;
      return s;
    })
    .join('');
  return `<div class="flex items-center gap-5">
<svg width="${size}" height="${size}" viewBox="0 0 120 120"><circle r="40" cx="60" cy="60" fill="transparent" stroke="var(--bg-subtle)" stroke-width="14"/>${segs}</svg>
<div class="flex-col gap-2">${parts
    .map(
      (p) => `<div class="flex items-center gap-2" style="font-size:12px"><i class="dot" style="background:${p.c};width:8px;height:8px"></i><span class="muted">${p.l}</span><b class="mono ml-auto" style="font-size:12px">${p.d ?? p.v}</b></div>`
    )
    .join('')}</div></div>`;
}

export const spark = (seed, stroke = 'var(--t-success-dot)') =>
  lineChart({ w: 120, h: 34, seed, stroke, fill: true });

// -------------------------------------------------------------- messages
export const convItem = (name, kind, snippet, time, { active = false, unread = false, hue = 2, av } = {}) => `
<div class="conv${active ? ' active' : ''}">
  ${av || avBy(name, hue, 'lg')}
  <div class="flex-1 min-w-0">
    <div class="flex items-center justify-between gap-2"><div class="t truncate">${esc(name)}${kind ? ` <span class="badge tone-${kind === 'GROUP' ? 'info' : 'neutral'} no-dot" style="height:16px;padding:0 5px;font-size:11px">${kind}</span>` : ''}</div><span class="tm">${time}</span></div>
    <div class="s">${esc(snippet)}</div>
  </div>
  ${unread ? '<i class="dot" style="background:var(--brand-9);width:8px;height:8px;margin-top:8px"></i>' : ''}
</div>`;

export const msgRow = (name, text, time, { me = false, hue = 2 } = {}) => `
<div class="msg-row${me ? ' me' : ''}">
  ${me ? '' : avBy(name, hue)}
  <div class="min-w-0" style="max-width:100%">
    <div class="bubble">${text}</div>
    <div class="msg-meta${me ? ' text-right' : ''}">${me ? 'You' : esc(name)} · ${time}</div>
  </div>
</div>`;

export const composer = (ph = 'Write a message…') => `
<div class="composer">
  <button class="btn btn-ghost btn-icon" title="Attach">${icon('paperclip', 16)}</button>
  <textarea class="textarea flex-1" rows="1" placeholder="${esc(ph)}"></textarea>
  <button class="btn btn-primary">${icon('send', 14)}<span>Send</span></button>
</div>`;

// --------------------------------------------------------------- cover art
export const cover = (cap, v = 1, ratio = 'padding-top:52%', big = '') =>
  `<div class="cover${v > 1 ? ' v' + v : ''}" style="${ratio}"><span>${esc(cap)}</span>${big ? `<b class="cap-big">${esc(big)}</b>` : ''}</div>`;
