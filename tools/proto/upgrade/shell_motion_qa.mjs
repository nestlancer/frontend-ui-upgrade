#!/usr/bin/env node
/* ============================================================================
 * shell_motion_qa.mjs — browser QA for the visual/layout/motion pass.
 *
 * Serves nothing itself: run the proto first
 *     cd proto && python3 -m http.server 8000 --bind 0.0.0.0
 *
 * Modes
 *   sweep (default)   every proto page:
 *       · 1440×900, normal motion  → running animations shortly after load
 *       · 1440×900, reduced motion → horizontal overflow (document + app pane)
 *       · 1920×1080                → app pages: content width ÷ main pane width
 *                                    (full-bleed check — no centred column)
 *       · 390×844                  → phone overflow
 *   shots   --paths a,b,c [--w 1440 --h 900 --full 0 --delay 1400 --theme dark]
 *   film    --paths a [--frames 6 --rate 0.1]  frames of the entrance, slowed
 *
 * Browser: puppeteer-core + @sparticuz/chromium, resolved from NL_BROWSER_MODULES
 * (default /tmp/nlb/node_modules — `npm i puppeteer-core@23 @sparticuz/chromium@131`).
 * ========================================================================== */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODS = process.env.NL_BROWSER_MODULES || '/tmp/nlb/node_modules/';
const require = createRequire(MODS.endsWith('/') ? MODS : MODS + '/');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = join(HERE, '..', '..', '..', 'proto');
const BASE = process.env.NL_BASE || 'http://127.0.0.1:8000';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const mode = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'sweep';
const OUT = opt('out', '/tmp/qa');
mkdirSync(OUT, { recursive: true });

function allPages() {
  const out = [];
  (function walk(d) {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (n === 'index.html') out.push('/' + relative(PROTO, dirname(p)).split('\\').join('/') + (dirname(p) === PROTO ? '' : '/'));
    }
  })(PROTO);
  return out.map((p) => (p === '//' ? '/' : p)).sort();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  return puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars'],
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });
}

async function open(page, path, { w, h, reduce = false, theme = '' }) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }]);
  await page.evaluateOnNewDocument((t) => { try { if (t) localStorage.setItem('nl-theme', t); else localStorage.removeItem('nl-theme'); } catch (e) {} }, theme);
  await page.goto(BASE + path, { waitUntil: 'load' });
}

/* ------------------------------------------------------------------ sweep */
async function sweep() {
  const filter = opt('only', '');
  const pages = allPages().filter((p) => !filter || p.includes(filter));
  const browser = await launch();
  const page = await browser.newPage();
  const errs = {};
  let cur = '';
  page.on('pageerror', (e) => { (errs[cur] ||= []).push('pageerror: ' + e.message); });
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/.test(m.text())) (errs[cur] ||= []).push('console: ' + m.text()); });

  const rows = [];
  for (const p of pages) {
    cur = p;
    const r = { path: p };
    try {
      // 1 — motion on load (normal)
      await open(page, p, { w: 1440, h: 900 });
      await sleep(60);
      Object.assign(r, await page.evaluate(() => {
        const anims = document.getAnimations();
        const targets = new Set(anims.map((a) => a.effect && a.effect.target).filter(Boolean));
        const names = new Set(anims.map((a) => a.animationName || (a.transitionProperty ? 'transition:' + a.transitionProperty : 'js')));
        const body = document.body;
        return {
          surface: body.getAttribute('data-surface') || body.className || '-',
          anims: anims.length,
          animTargets: targets.size,
          animNames: [...names].slice(0, 12),
          motionLive: document.documentElement.classList.contains('nl-live'),
        };
      }));
      // 2 — overflow at 1440 (reduced motion = final layout)
      await open(page, p, { w: 1440, h: 900, reduce: true });
      r.overflow1440 = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector('body.app-body .main');
        const docOver = de.scrollWidth - window.innerWidth;
        const paneOver = main ? main.scrollWidth - main.clientWidth : 0;
        return Math.max(docOver, paneOver);
      });
      // 3 — full-bleed at 1920
      await open(page, p, { w: 1920, h: 1080, reduce: true });
      Object.assign(r, await page.evaluate(() => {
        const main = document.querySelector('body.app-body .main');
        const content = document.querySelector('body.app-body main.content');
        if (!main || !content) return { bleed: null };
        const mw = main.clientWidth;
        const cs = getComputedStyle(content);
        const left = content.offsetLeft - main.offsetLeft;
        const usable = content.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        // widest direct child block (what the eye reads as "the page")
        let widest = 0;
        for (const c of content.children) widest = Math.max(widest, c.offsetWidth);
        return { bleed: +(content.offsetWidth / mw).toFixed(3), gutterL: Math.round(left + parseFloat(cs.paddingLeft)), usable: Math.round(usable), widest, paneW: mw };
      }));
      // 4 — phone overflow
      await open(page, p, { w: 390, h: 844, reduce: true });
      r.overflow390 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    } catch (e) {
      r.error = String(e.message || e);
    }
    r.errors = errs[p] || [];
    rows.push(r);
    process.stdout.write('.');
  }
  await browser.close();
  process.stdout.write('\n');

  const app = rows.filter((r) => r.bleed !== null && r.bleed !== undefined);
  const notBleed = app.filter((r) => r.bleed < 0.985);
  const over1440 = rows.filter((r) => r.overflow1440 > 1);
  const over390 = rows.filter((r) => r.overflow390 > 1);
  const noMotion = rows.filter((r) => !r.redirect && (r.anims || 0) < 3);
  const withErr = rows.filter((r) => r.errors.length || r.error);
  const animsSorted = rows.map((r) => r.anims || 0).sort((a, b) => a - b);
  const med = animsSorted[Math.floor(animsSorted.length / 2)];
  const summary = {
    pages: rows.length,
    appPages: app.length,
    fullBleedApp: app.length - notBleed.length,
    minBleed: app.length ? Math.min(...app.map((r) => r.bleed)) : null,
    overflow1440: over1440.length,
    overflow390: over390.length,
    pagesWithUnder3Anims: noMotion.length,
    medianAnimsOnLoad: med,
    minAnimsOnLoad: animsSorted[0],
    pagesWithErrors: withErr.length,
  };
  writeFileSync(join(OUT, 'sweep.json'), JSON.stringify({ summary, rows }, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  const show = (label, list, f) => { if (list.length) console.log(label + ':\n  ' + list.slice(0, 25).map(f).join('\n  ')); };
  show('NOT full-bleed (content/main < 0.985 @1920)', notBleed, (r) => `${r.path}  bleed=${r.bleed} usable=${r.usable}`);
  show('overflow @1440', over1440, (r) => `${r.path}  +${r.overflow1440}px`);
  show('overflow @390', over390, (r) => `${r.path}  +${r.overflow390}px`);
  show('fewer than 3 animations on load', noMotion, (r) => `${r.path}  anims=${r.anims}`);
  show('errors', withErr, (r) => `${r.path}  ${(r.error || '') + r.errors.join(' | ')}`);
}

/* ------------------------------------------------------------------ shots */
async function shots() {
  const paths = opt('paths', '/apps/admin/dashboard/').split(',');
  const w = +opt('w', 1440), h = +opt('h', 900), full = opt('full', '0') === '1';
  const delay = +opt('delay', 1400), theme = opt('theme', ''), prefix = opt('prefix', 'shot');
  const browser = await launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const p of paths) {
    await open(page, p, { w, h, theme });
    await sleep(delay);
    if (opt('scroll', '')) { await page.evaluate((y) => { const m = document.querySelector('body.app-body .main'); (m || window).scrollTo(0, +y); }, opt('scroll')); await sleep(900); }
    const name = `${prefix}-${p.replace(/^\/|\/$/g, '').replace(/[\/\[\]]+/g, '_') || 'root'}-${w}${theme ? '-' + theme : ''}.png`;
    await page.screenshot({ path: join(OUT, name), fullPage: full });
    console.log(join(OUT, name));
  }
  if (errors.length) console.log('page errors:', errors);
  await browser.close();
}

/* ------------------------------------------------------------------- film */
async function film() {
  const p = opt('paths', '/apps/admin/dashboard/').split(',')[0];
  const frames = +opt('frames', 6), rate = +opt('rate', 0.1), step = +opt('step', 110);
  const w = +opt('w', 1440), h = +opt('h', 900);
  const browser = await launch();
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const cdp = await page.createCDPSession();
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: rate });
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  const files = [];
  for (let i = 0; i < frames; i++) {
    const f = join(OUT, `film-${i}.png`);
    await page.screenshot({ path: f });
    files.push(f);
    await sleep(step / rate / 10);
  }
  console.log(files.join('\n'));
  await browser.close();
}

if (mode === 'sweep') await sweep();
else if (mode === 'shots') await shots();
else if (mode === 'film') await film();
