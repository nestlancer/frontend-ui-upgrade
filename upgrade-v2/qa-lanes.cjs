// Lane QA for batches 5–7. Usage:
//   LD_LIBRARY_PATH=/tmp/chromelibs/lib node upgrade-v2/qa-lanes.cjs <paths.json> <name> [--shots]
// Serves expected at http://localhost:8000 → proto/. Writes upgrade-v2/evidence/<name>-browser-qa.json
const puppeteer = require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium = require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const { AxePuppeteer } = require('/home/user/.cache/nl-qa/node_modules/@axe-core/puppeteer');
const fs = require('fs');
const [pathsFile, name] = process.argv.slice(2);
const shots = process.argv.includes('--shots');
const paths = JSON.parse(fs.readFileSync(pathsFile, 'utf8'));
const BASE = 'http://localhost:8000/';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  const r = { browser: await browser.version(), pages: [] };
  let p = await browser.newPage();
  const errors = [];
  async function fresh() {
    try { await p.close(); } catch (e) {}
    p = await browser.newPage();
    await p.setRequestInterception(true);
    p.on('request', q => (q.url().startsWith(BASE) || q.url().startsWith('data:') || q.url().startsWith('blob:')) ? q.continue() : q.abort());
    p.on('pageerror', e => errors.push(e.message));
    p.on('response', q => { if (q.url().startsWith(BASE) && q.status() >= 400) errors.push(q.url() + ' ' + q.status()); });
    p.on('dialog', d => d.dismiss());
    await p.evaluateOnNewDocument(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
  }
  await fresh();
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const res = { path, layouts: [], axe: [], visibility: [], interactions: {}, errors: [] };
    errors.length = 0;
    try {
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      for (const [theme, width] of [['light', 1440], ['dark', 390], ['light', 320], ['light', 768]]) {
        await p.setViewport({ width, height: 900 });
        await p.goto(BASE + path, { waitUntil: 'load' });
        await p.evaluate(t => { document.documentElement.dataset.theme = t; try { localStorage.setItem('nl-theme', t); } catch (e) {} }, theme);
        await p.evaluate(() => document.fonts.ready);
        await wait(450);
        res.layouts.push({ theme, width, ...await p.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          clipped: [...document.querySelectorAll('main h1, main h2, main .stat-value, main .panel-title, main .btn')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && !e.closest('.tbl-wrap,.tabs,[data-wb-sections]')).map(e => e.textContent.trim().slice(0, 60)),
          brokenImages: [...document.images].filter(e => e.complete && !e.naturalWidth && e.loading !== 'lazy').map(e => e.getAttribute('src')),
          remoteFonts: [...document.querySelectorAll('link[href*="fonts.googleapis"]')].length,
          smallText: [...document.querySelectorAll('main p, main td, main li, main label, main .badge')].filter(e => e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11).length,
        })) });
        if ((theme === 'light' && width === 1440) || (theme === 'dark' && width === 390)) {
          await p.evaluate(() => { document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in', 'nl-done')); document.getAnimations().forEach(a => { const t = a.effect && a.effect.getTiming(); if (t && t.iterations !== Infinity) { try { a.finish(); } catch (e) {} } }); });
          await wait(60);
          const a = await new AxePuppeteer(p).analyze();
          res.axe.push({ theme, width, violations: a.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 4).map(n => ({ target: n.target, summary: n.failureSummary && n.failureSummary.slice(0, 200) })) })) });
          if (shots) {
            const file = `upgrade-v2/evidence/${name}-${i}-${theme}-${width}.webp`;
            await p.screenshot({ path: file, type: 'webp', quality: 55 });
          }
        }
      }
      // Motion: early vs settled, then interactions at desktop.
      await p.setViewport({ width: 1440, height: 900 });
      await p.goto(BASE + path, { waitUntil: 'load' });
      await wait(120);
      const early = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
      await wait(2200);
      const late = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect).map(a => { const t = a.effect.getTiming(); const end = t.iterations === Infinity ? Infinity : (t.delay || 0) + (Number(t.duration) || 0) * t.iterations; return { name: a.animationName || a.transitionProperty || 'waapi', end, infinite: t.iterations === Infinity }; }));
      res.motion = { early, runningAt2_3s: late.map(x => x.name), infinite: late.filter(x => x.infinite).map(x => x.name), overNineSeconds: late.filter(x => !x.infinite && x.end > 9000).map(x => x.name) };
      const I = res.interactions;
      // Page search dialog
      if (await p.$('[data-operator-search-open]')) {
        await p.click('.topsearch input[data-operator-search-open], [data-operator-search-open]');
        await wait(120);
        I.search = await p.evaluate(() => ({ open: document.getElementById('operator-search').open, focus: document.activeElement.id, entries: document.querySelectorAll('[data-search-entry]').length }));
        await p.keyboard.press('Escape');
        await wait(80);
        I.search.closed = await p.evaluate(() => !document.getElementById('operator-search').open);
      }
      // Action dialog: first preview/danger action
      const act = await p.$('[data-wb-action="default"]:not([disabled]), [data-wb-action="danger"]:not([disabled])');
      if (act) {
        await act.evaluate(e => e.scrollIntoView({ block: 'center' }));
        await act.click();
        await wait(150);
        I.action = await p.evaluate(() => ({ open: document.getElementById('wb-action').open, title: document.getElementById('wb-action-title').textContent }));
        await p.click('[data-wb-confirm]');
        I.action.outcome = await p.evaluate(() => document.querySelector('[data-wb-outcome]').textContent);
        await p.keyboard.press('Escape');
        await wait(80);
        I.action.closed = await p.evaluate(() => !document.getElementById('wb-action').open);
        I.action.focusReturned = await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-wb-action'));
      }
      // Local check / reset / print / csv smoke
      for (const kind of ['check', 'reset', 'print', 'file', 'copy']) {
        const b = await p.$(`[data-wb-action="${kind}"]:not([disabled])`);
        if (!b) continue;
        await b.evaluate(e => e.scrollIntoView({ block: 'center' }));
        await b.click();
        await wait(250);
        I[kind] = await p.evaluate(() => ({ status: document.getElementById('wb-status').textContent, printed: window.__printed || 0 }));
        await p.keyboard.press('Escape');
      }
      // Filtering
      const list = await p.$('[data-wb-list]');
      if (list) {
        const id = await list.evaluate(e => e.id);
        const total = await p.$$eval(`#${id} [data-wb-item]`, es => es.length);
        const search = await p.$(`[data-wb-search][aria-controls="${id}"]`);
        if (search) {
          await search.evaluate(e => e.scrollIntoView({ block: 'center' }));
          await search.type('zzzz-no-match');
          await wait(80);
          const empty = await p.evaluate(id => ({ shown: document.querySelectorAll(`#${id} [data-wb-item]:not([hidden])`).length, empty: !document.querySelector(`[data-wb-empty="${id}"]`).hidden }), id);
          await p.click(`[data-wb-clear="${id}"]`);
          await wait(80);
          const reset = await p.$$eval(`#${id} [data-wb-item]:not([hidden])`, es => es.length);
          I.filter = { total, ...empty, reset };
        }
        const sel = await p.$(`[data-wb-filter][aria-controls="${id}"]`);
        if (sel) {
          const opt = await sel.evaluate(s => [...s.options].map(o => o.value).find(v => v));
          await p.select(`[data-wb-filter][aria-controls="${id}"]`, opt);
          await wait(80);
          I.select = { option: opt, shown: await p.$$eval(`#${id} [data-wb-item]:not([hidden])`, es => es.length), total, allContain: await p.evaluate((id, opt) => [...document.querySelectorAll(`#${id} [data-wb-item]:not([hidden])`)].every(e => e.textContent.toLowerCase().includes(opt.toLowerCase())), id, opt) };
        }
      }
      // Reduced motion (live + fresh) and no-JS
      const vis = () => p.evaluate(() => ({ hidden: [...document.querySelectorAll('main h1, main .reveal')].filter(e => !e.closest('[hidden],dialog,noscript') && e.getClientRects().length && getComputedStyle(e).opacity === '0').length, running: document.getAnimations().filter(a => a.playState === 'running').length, names: document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName || a.transitionProperty || 'waapi') + '@' + (a.effect && a.effect.target ? (a.effect.target.id || a.effect.target.className || a.effect.target.tagName).toString().slice(0, 30) : '')) }));
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await wait(120);
      res.visibility.push({ mode: 'live-reduced', ...await vis() });
      await p.goto(BASE + path, { waitUntil: 'load' });
      await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      res.visibility.push({ mode: 'fresh-reduced', ...await vis() });
      await p.setJavaScriptEnabled(false);
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await p.goto(BASE + path, { waitUntil: 'load' });
      await wait(900);
      res.visibility.push({ mode: 'no-js', ...await vis(), enabledJsOnly: await p.$$eval('[data-wb-js]:not([disabled]), [data-wb-search]:not([disabled]), [data-operator-search-open]:not([disabled])', es => es.length) });
      await p.setJavaScriptEnabled(true);
    } catch (e) {
      res.crash = e.message;
      await fresh();
    }
    res.errors = [...new Set(errors)];
    r.pages.push(res);
    process.stdout.write(`${i + 1}/${paths.length} ${path} ${res.crash ? 'CRASH ' + res.crash : ''}\n`);
  }
  await browser.close();
  fs.writeFileSync(`upgrade-v2/evidence/${name}-browser-qa.json`, JSON.stringify(r, null, 1));
  // Summary
  const fail = r.pages.map(pg => {
    const f = [];
    if (pg.crash) f.push('crash:' + pg.crash);
    if (pg.errors.length) f.push('errors:' + pg.errors.join('|').slice(0, 200));
    pg.layouts.forEach(l => { if (l.scroll > l.width + 2) f.push(`overflow@${l.width}:${l.scroll}`); if (l.h1 !== 1) f.push('h1=' + l.h1); if (l.clipped.length) f.push(`clipped@${l.width}:${l.clipped.join('/')}`); if (l.brokenImages.length) f.push('img:' + l.brokenImages); if (l.remoteFonts) f.push('remote-fonts'); });
    pg.axe.forEach(a => a.violations.forEach(v => f.push(`axe@${a.theme}${a.width}:${v.id}(${v.nodes.map(n => n.target.join(' ')).join(', ').slice(0, 160)})`)));
    pg.visibility.forEach(v => { if (v.hidden) f.push(`${v.mode}-hidden:${v.hidden}`); if (v.mode.includes('reduced') && v.running) f.push(`${v.mode}-running:${v.names.join(',')}`); if (v.enabledJsOnly) f.push('no-js-enabled-controls:' + v.enabledJsOnly); });
    const I = pg.interactions;
    if (I.search && !(I.search.open && I.search.closed && I.search.focus === 'operator-search-query')) f.push('search:' + JSON.stringify(I.search));
    if (I.action && !(I.action.open && I.action.closed && I.action.focusReturned && I.action.outcome)) f.push('action:' + JSON.stringify(I.action));
    if (I.filter && !(I.filter.shown === 0 && I.filter.empty && I.filter.reset === I.filter.total)) f.push('filter:' + JSON.stringify(I.filter));
    if (I.select && !(I.select.allContain && I.select.shown >= 0)) f.push('select:' + JSON.stringify(I.select));
    if (pg.motion && (pg.motion.infinite.length || pg.motion.overNineSeconds.length)) f.push('motion-unbounded:' + pg.motion.infinite.concat(pg.motion.overNineSeconds).join(','));
    return { path: pg.path, f };
  }).filter(x => x.f.length);
  fs.writeFileSync(`upgrade-v2/evidence/${name}-failures.json`, JSON.stringify(fail, null, 1));
  console.log('PAGES', r.pages.length, 'FAILING', fail.length);
  fail.slice(0, 60).forEach(x => console.log(x.path, '\n   ', x.f.slice(0, 8).join('\n    ')));
})();
