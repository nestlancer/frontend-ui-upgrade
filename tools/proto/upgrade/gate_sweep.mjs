/**
 * gate_sweep.mjs — sweep every manifest page against the verification gates.
 *
 * Checks, per page:
 *   h1            exactly one h1 (the prompt requires one h1 per page)
 *   headings      no skipped heading level (h1 -> h2 -> h3)
 *   minFont       no rendered text below 11px
 *   targets       interactive controls >= 44px at 390px width
 *   images        every <img> has an alt attribute
 *   labels        every input/select/textarea has a label or aria-label
 *   overflow      0 horizontal overflow at 1440px and 390px
 *   reduced       with prefers-reduced-motion: reduce forced, nothing is left
 *                 mid-animation (no non-none animation running on entry)
 *   theme         forcing light and dark changes both --bg-app and the body surface
 *
 * Default scope is the screenshot-mapped pages in pairs.json. `--all` adds
 * every proto index.html, including the sign-off hub and ungraded state routes;
 * `--only=route1,route2` runs a fast targeted regression subset.
 *
 * Usage (from the scratch dir that owns node_modules):
 *   cp tools/proto/upgrade/gate_sweep.mjs /tmp/shot/
 *   cd /tmp/shot && PROTO_BASE=http://127.0.0.1:8765/ LD_LIBRARY_PATH=/tmp/nsswrap/lib node gate_sweep.mjs --all
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.PROTO_BASE || 'http://127.0.0.1:8765/';
// Default: the pages that carry a screenshot (pairs.json). `--all` adds every
// other proto page, so the state/template routes are held to the same gates.
const ROOT = '/home/user/frontend-ui-upgrade/proto';
const pairs = JSON.parse(fs.readFileSync('/home/user/grade/pairs.json', 'utf8'));
const graded = [...new Set(pairs.map(p => p.proto))].filter(Boolean).sort();
let pages = graded;
if (process.argv.includes('--all')) {
  const ROOT_PAGE = '__proto_root__';
  const walk = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) return walk(dir + '/' + e.name, rel);
    return e.name === 'index.html' ? [base || ROOT_PAGE] : [];
  });
  pages = [...new Set([...walk(ROOT), ...graded])].sort();
}
const onlyArg = process.argv.find(arg => arg.startsWith('--only='));
if (onlyArg) {
  const wanted = new Set(onlyArg.slice('--only='.length).split(',').filter(Boolean));
  pages = pages.filter(p => wanted.has(p === '__proto_root__' ? 'index.html' : p));
}


const PROBE = `(() => {
  const vis = el => { const s = getComputedStyle(el); const b = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const out = { h1: 0, skips: [], minFont: 99, small: 0, targets: [], imgs: 0, noAlt: 0, fields: 0, unlabeled: 0,
                ov: document.documentElement.scrollWidth - window.innerWidth };
  const root = document.documentElement;
  const originalTheme = root.getAttribute('data-theme');
  root.setAttribute('data-theme', 'light');
  const lightCanvas = getComputedStyle(root).getPropertyValue('--bg-app').trim();
  const lightSurface = getComputedStyle(document.body).backgroundColor;
  root.setAttribute('data-theme', 'dark');
  const darkCanvas = getComputedStyle(root).getPropertyValue('--bg-app').trim();
  const darkSurface = getComputedStyle(document.body).backgroundColor;
  out.darkTheme = !!darkCanvas && darkCanvas !== lightCanvas && darkSurface !== lightSurface;
  if (originalTheme === null) root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', originalTheme);
  out.h1 = [...document.querySelectorAll('h1')].filter(vis).length;
  let prev = 0;
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis);
  for (const h of hs) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) out.skips.push(prev + '->' + lvl + ' (' + h.innerText.trim().slice(0, 28) + ')');
    prev = lvl;
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
    if (txt && fs) { if (fs < out.minFont) out.minFont = fs; if (fs < 11) out.small++; }
  }
  for (const el of document.querySelectorAll('a.btn, button, .btn, .icobtn, .tab, .chip, input, select, textarea, a.link')) {
    if (!vis(el)) continue;
    // Controls hidden from assistive tech (aria-hidden proxy inputs, tabindex=-1)
    // are not reachable targets; the visible control that drives them is measured.
    if (el.getAttribute('aria-hidden') === 'true' || el.getAttribute('tabindex') === '-1') continue;
    const cs = getComputedStyle(el);
    const r0 = el.getBoundingClientRect();
    // A checkbox/radio is as big as the box that carries it: if it lives inside a
    // label (or has one), measure that, which is what the user actually taps.
    let r = r0;
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
      const carrier = el.closest('label') || (el.id && document.querySelector('label[for="' + el.id + '"]'));
      if (carrier) r = carrier.getBoundingClientRect();
    }
    // WCAG 2.5.8 exempts links that sit inline in a sentence. Rather than
    // guessing from the container's class, test it: a link is inline when the
    // block around it carries other text of its own.
    if (el.tagName === 'A') {
      const host = el.parentElement;
      const mine = (el.innerText || '').trim();
      const theirs = host ? (host.innerText || '').trim() : '';
      if (host && theirs.length > mine.length + 6) continue;
    }
    if (cs.position === 'absolute' && r.width < 3) continue;
    if (r.height < 44 && r.height > 1) out.targets.push(((el.className || '').toString().split(' ').slice(0,2).join('.') || el.tagName.toLowerCase()) + '@' + Math.round(r.height));
  }
  const imgs = [...document.images];
  out.imgs = imgs.length; out.noAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  for (const f of document.querySelectorAll('input, select, textarea')) {
    if (['hidden', 'submit', 'button'].includes(f.type)) continue;
    out.fields++;
    const id = f.id;
    const labelled = (id && document.querySelector('label[for="' + id + '"]'))
      || f.getAttribute('aria-label') || f.getAttribute('aria-labelledby')
      || f.closest('label') || f.getAttribute('title') || f.getAttribute('placeholder');
    if (!labelled) out.unlabeled++;
  }
  return out;
})()`;

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(), args: chromium.args, headless: true,
  defaultViewport: { width: 1440, height: 900 },
});

const fails = [];
let checked = 0;
for (const p of pages) {
  const page = await browser.newPage();
  const pageName = p === '__proto_root__' ? 'index.html' : p;
  const route = p === '__proto_root__' ? '' : p + '/';
  const row = { page: pageName };
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 300));
    const d = await page.evaluate(PROBE);
    Object.assign(row, d);
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 250));
    const m = await page.evaluate(PROBE);
    row.mobileOverflow = m.ov;
    row.mobileTargets = m.targets;
    // reduced motion: force the preference and confirm nothing is animating in
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));
    row.animating = await page.evaluate(() =>
      [...document.querySelectorAll('body *')].filter(el => {
        const s = getComputedStyle(el);
        return s.animationName !== 'none' && s.animationDuration !== '0s';
      }).length);
    checked++;
  } catch (e) { row.error = String(e.message).slice(0, 90); }
  await page.close();

  const problems = [];
  if (row.h1 !== 1) problems.push(`h1=${row.h1}`);
  if (row.skips && row.skips.length) problems.push(`heading skip ${row.skips.slice(0,2).join(',')}`);
  if (row.small > 0) problems.push(`${row.small} text run(s) below 11px (min ${row.minFont}px)`);
  if (row.ov > 2) problems.push(`1440px overflow +${row.ov}px`);
  if (row.mobileOverflow > 2) problems.push(`390px overflow +${row.mobileOverflow}px`);
  if (!row.darkTheme) problems.push('light/dark body surface did not change');
  if (row.mobileTargets && row.mobileTargets.length) problems.push(`${row.mobileTargets.length} control(s) under 44px`);
  if (row.noAlt > 0) problems.push(`${row.noAlt}/${row.imgs} image(s) without alt`);
  if (row.unlabeled > 0) problems.push(`${row.unlabeled}/${row.fields} field(s) unlabeled`);
  if (row.animating > 0) problems.push(`${row.animating} element(s) still animating under reduced-motion`);
  if (row.error) problems.push(row.error);
  if (problems.length) fails.push({ page: pageName, problems, detail: row });
}

console.log(`gate sweep — ${checked}/${pages.length} page(s) checked${pages.length > graded.length ? ' (--all)' : ''}\n`);
if (!fails.length) console.log('all gates pass on every page');
for (const f of fails) {
  console.log(`  ${f.page}`);
  for (const p of f.problems) console.log(`      ${p}`);
  if (f.detail.mobileTargets?.length) console.log(`      targets: ${f.detail.mobileTargets.slice(0, 8).join(', ')}`);
}
const total = fails.reduce((n, f) => n + f.problems.length, 0);
console.log(`\n${fails.length} page(s) with findings · ${total} finding(s)`);
await browser.close();
