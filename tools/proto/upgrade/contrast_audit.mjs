/**
 * contrast_audit.mjs — WCAG AA contrast + dark-theme surface audit.
 *
 * Opens a sample of proto pages in both themes and reports, for every visible
 * text node, the contrast ratio between its colour and its effective
 * background (walking up the tree through transparent backgrounds).
 *
 * Flags:
 *   rule < 4.5   normal text below AA
 *   rule < 3.0   large text (>=24px, or >=18.66px bold) below AA
 *   surface      a light background (luminance > 150) rendered in dark theme
 *
 * Usage (run from the scratch dir that owns node_modules, with a copy of this
 * file, because ESM resolves bare imports relative to the importing file):
 *   cp tools/proto/upgrade/contrast_audit.mjs /tmp/shot/
 *   cd /tmp/shot && LD_LIBRARY_PATH=/tmp/nsswrap node contrast_audit.mjs [pages...]
 *
 * With no arguments it audits a representative spread of both surfaces.
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE = process.env.PROTO_BASE || 'http://127.0.0.1:8080/';
const DEFAULT_PAGES = [
  'apps/admin/dashboard/',
  'apps/admin/projects/',
  'apps/admin/payments/',
  'apps/admin/messages/',
  'apps/web/portfolio/',
  'apps/web/messages/inbox/',
  'apps/web/quotes/',
  'apps/landing/pricing/',
  'apps/landing/index.html',
  'apps/web/privacy/',
];
const pages = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;

const probe = `(() => {
  const lum = (r, g, b) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = c => {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const blend = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  });
  // Effective background: walk up to the first *opaque* background, then
  // composite any translucent layers found on the way back down. A translucent
  // layer over an assumed white base would report a light surface that does not
  // exist on screen, so the base is the opaque ancestor (or the document
  // background when there is none).
  const bgOf = el => {
    const layers = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;   // gradient/image: unmeasurable
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        if (c.a >= 0.999) {
          let base = c;
          for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
          return base;
        }
        layers.push(c);
      }
      n = n.parentElement;
    }
    const doc = parse(getComputedStyle(document.documentElement).backgroundColor);
    let base = doc && doc.a >= 0.999 ? doc : { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  };

  const ratio = (a, b) => {
    const l1 = lum(a.r, a.g, a.b), l2 = lum(b.r, b.g, b.b);
    return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
  };
  const label = el => {
    const cls = (el.className || '').toString().trim().split(/\\s+/).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  };
  const out = { low: [], surfaces: [], checked: 0 };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim();
    if (text.length < 2) continue;
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) < 0.9) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (el.closest('[aria-hidden="true"], .sr-only, .skip')) continue;
    const fg0 = parse(cs.color);
    if (!fg0 || fg0.a === 0) continue;               // gradient-clipped text
    const bg = bgOf(el);
    if (!bg) continue;                              // unmeasurable gradient surface
    const fg = fg0.a < 1 ? blend(fg0, bg) : fg0;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bg);
    out.checked++;
    const key = label(el) + '|' + size + '|' + Math.round(cr * 10);
    if (cr < need && !seen.has(key)) {
      seen.add(key);
      out.low.push({ el: label(el), size: Math.round(size * 10) / 10, weight,
        cr: Math.round(cr * 100) / 100, need, text: text.slice(0, 46),
        fg: cs.color, bg: 'rgb(' + [bg.r, bg.g, bg.b].map(v => Math.round(v)).join(', ') + ')' });
    }
    if (lum(bg.r, bg.g, bg.b) > 0.55) {
      const k2 = 'surf|' + label(el);
      if (!seen.has(k2)) { seen.add(k2); out.surfaces.push({ el: label(el), bg: 'rgb(' + [bg.r, bg.g, bg.b].map(v => Math.round(v)).join(', ') + ')', text: text.slice(0, 40) }); }
    }
  }
  return out;
})()`;

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args, headless: true,
  defaultViewport: { width: 1440, height: 900 },
});

let totalLow = 0, totalSurf = 0, totalChecked = 0;
for (const theme of ['light', 'dark']) {
  for (const page of pages) {
    const pg = await browser.newPage();
    await pg.goto(BASE + page, { waitUntil: 'networkidle0' });
    if (theme === 'dark') await pg.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await new Promise(r => setTimeout(r, 450));
    // poll for scroll-independent content, then the whole document height
    const res = await pg.evaluate(probe);
    const low = theme === 'dark' ? res.low.filter(l => {
      const m = l.bg.match(/\d+/g); const L = (Number(m[0]) * 0.299 + Number(m[1]) * 0.587 + Number(m[2]) * 0.114);
      return L < 150; // light-theme widgets that failed to flip
    }) : res.low;
    const surfaces = theme === 'dark' ? res.surfaces : [];
    totalLow += low.length; totalSurf += surfaces.length; totalChecked += res.checked;
    if (low.length || surfaces.length) {
      console.log(`\n${theme.toUpperCase()}  ${page}   (${res.checked} text nodes)`);
      for (const l of low) console.log(`  low  ${l.cr.toFixed(2)} < ${l.need}  ${l.el} ${l.size}px/${l.weight}  "${l.text}"  ${l.fg} on ${l.bg}`);
      for (const s of surfaces.slice(0, 6)) console.log(`  surf light bg in ${theme}: ${s.el} ${s.bg}  "${s.text}"`);
    }
    await pg.close();
  }
}
await browser.close();
console.log(`\n===== ${totalChecked} text nodes checked · ${totalLow} below AA · ${totalSurf} light surfaces in dark =====`);
