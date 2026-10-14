// Quote builder steps (admin source states 097–101) on the preserved quote/new page.
// Usage: LD_LIBRARY_PATH=/tmp/chromelibs/lib node upgrade-v2/qa-quote-steps.cjs
// Writes upgrade-v2/evidence/batch8-quote-steps.json and batch8-state-<id>-<theme>-<width>.webp
const puppeteer = require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium = require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const { AxePuppeteer } = require('/home/user/.cache/nl-qa/node_modules/@axe-core/puppeteer');
const fs = require('fs');
const BASE = 'http://localhost:8000/';
const URL = BASE + 'apps/admin/requests/01a10a2c-01c3-7079-93e9-9d001541ced8/quote/new/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 200) : '')); };

(async () => {
  const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  const errors = [];
  async function open(theme, width, opts = {}) {
    const p = await browser.newPage();
    await p.setRequestInterception(true);
    p.on('request', q => (q.url().startsWith(BASE) || q.url().startsWith('data:') || q.url().startsWith('blob:')) ? q.continue() : q.abort());
    p.on('pageerror', e => errors.push(e.message));
    p.on('response', q => { if (q.url().startsWith(BASE) && q.status() >= 400) errors.push(q.url() + ' ' + q.status()); });
    if (opts.noJs) await p.setJavaScriptEnabled(false);
    if (opts.reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.evaluateOnNewDocument(t => { try { localStorage.setItem('nl-theme', t); } catch (e) {} }, theme);
    await p.setViewport({ width, height: 900 });
    await p.goto(URL, { waitUntil: 'networkidle0' });
    await p.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await wait(500);
    return p;
  }
  const settle = p => p.evaluate(() => { document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in', 'nl-done')); document.getAnimations().forEach(a => { const t = a.effect && a.effect.getTiming(); if (t && t.iterations !== Infinity) { try { a.finish(); } catch (e) {} } }); });
  const axe = async (p, label) => {
    await settle(p);
    const a = await new AxePuppeteer(p).include('#rq-quote-builder').analyze();
    check(`axe ${label}`, a.violations.length === 0, a.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).join('|')));
  };
  const shot = async (p, id, theme, width) => {
    await settle(p);
    const el = await p.$('#rq-quote-builder');
    await el.scrollIntoView();
    await wait(150);
    await el.screenshot({ path: `upgrade-v2/evidence/batch8-state-${id}-${theme}-${width}.webp`, type: 'webp', quality: 72 });
  };
  const state = p => p.evaluate(() => {
    const r = document.querySelector('#rq-quote-builder');
    const vis = el => !!el && !el.hidden && el.getClientRects().length > 0;
    return {
      tabsVisible: vis(r.querySelector('[role="tablist"]')),
      panels: [...r.querySelectorAll('[data-qsteps-panel]')].map(vis),
      selected: [...r.querySelectorAll('[role="tab"]')].map(t => t.getAttribute('aria-selected')),
      prevDisabled: r.querySelector('[data-qsteps-prev]').disabled,
      nextDisabled: r.querySelector('[data-qsteps-next]').disabled,
      nextHidden: r.querySelector('[data-qsteps-next]').hidden,
      live: r.querySelector('[data-qsteps-live]').textContent,
      active: document.activeElement && (document.activeElement.id || document.activeElement.textContent.trim().slice(0, 30)),
      current: (r.querySelector('[aria-current="step"]') || {}).textContent,
      scroll: document.documentElement.scrollWidth,
    };
  });

  // ---------- Light 1440: walk every state ----------
  let p = await open('light', 1440);
  await p.waitForSelector('#rq-quote-builder [data-qsteps-next]:not([disabled])');
  let s = await state(p);
  check('100 scope: step 1 shown, steps 2–3 hidden, Back disabled', s.tabsVisible && s.panels.join() === 'true,false,false' && s.prevDisabled && !s.nextDisabled, s);
  check('100 scope: recorded data present', await p.evaluate(() => /Phase 1 — Deliverables/.test(document.querySelector('#qs-step-1').textContent) && /Delhivery \+ Blue Dart AWB lookup/.test(document.querySelector('#qs-step-1').textContent)));
  await axe(p, 'light-1440 step1');
  await shot(p, '100-scope', 'light', 1440);

  await p.click('[data-qsteps-library]');
  const lib = await p.evaluate(() => ({ open: !document.querySelector('#qs-library').hidden, expanded: document.querySelector('[data-qsteps-library]').getAttribute('aria-expanded'), label: document.querySelector('[data-qsteps-library]').textContent, text: document.querySelector('#qs-library').textContent }));
  check('098 library: disclosure opens with honest empty-fixture note', lib.open && lib.expanded === 'true' && lib.label === 'Hide library' && /No reusable quote blocks/.test(lib.text), lib);
  await axe(p, 'light-1440 library');
  await shot(p, '098-library', 'light', 1440);
  await p.click('[data-qsteps-library]');

  await p.click('[data-qsteps-next]');
  await wait(250);
  s = await state(p);
  check('099 pricing: Next shows step 2, focus on heading, announced, progress updated', s.panels.join() === 'false,true,false' && s.active === 'qs-step-2-h' && /Step 2 of 3: Pricing & schedule/.test(s.live) && /Pricing/.test(s.current) && !s.prevDisabled, s);
  const preset = await p.evaluate(() => ({ pressed: document.querySelector('[data-qsteps-mode-btn="preset"]').getAttribute('aria-pressed'), customHidden: document.querySelector('[data-qsteps-custom]').hidden, sched: document.querySelector('[data-qsteps-sched]').textContent, sel: document.querySelector('#payment-schedule').value }));
  check('099 pricing: Preset mode, stored 50/50 selected', preset.pressed === 'true' && preset.customHidden && preset.sched === '50/50' && /50\/50/.test(preset.sel), preset);
  await axe(p, 'light-1440 step2 preset');
  await shot(p, '099-pricing', 'light', 1440);

  await p.select('#payment-schedule', '30/70');
  const p37 = await p.evaluate(() => ({ sched: document.querySelector('[data-qsteps-sched]').textContent, prev: document.querySelector('[data-qsteps-preview]').textContent, stored: document.querySelector('#qs-step-2 .kv').textContent }));
  check('preset change: summary updates, preview-only note, stored installments unchanged', p37.sched === '30/70' && /Preview only/.test(p37.prev) && /Deposit 50%/.test(p37.stored), p37);

  await p.click('[data-qsteps-mode-btn="custom"]');
  let c = await p.evaluate(() => ({ hidden: document.querySelector('[data-qsteps-custom]').hidden, sel: document.querySelector('#payment-schedule').value, rows: [...document.querySelectorAll('.qsteps-row')].map(r => [r.querySelector('input').value, r.querySelector('input[type=number]').value, r.querySelector('select').value]), total: document.querySelector('[data-qsteps-total]').textContent }));
  check('097 custom: editor opens from stored installments, select synced, total 100%', !c.hidden && c.sel === 'Custom %' && JSON.stringify(c.rows) === JSON.stringify([['Deposit', '50', 'on accept'], ['Final payment', '50', 'on prior approved']]) && c.total === 'Total 100%', c);
  await axe(p, 'light-1440 step2 custom');
  await shot(p, '097-custom', 'light', 1440);

  const pct = await p.$$('.qsteps-row input[type=number]');
  const setNum = async (el, v) => { await el.focus(); await p.keyboard.down('Control'); await p.keyboard.press('KeyA'); await p.keyboard.up('Control'); await p.keyboard.press('Backspace'); await p.keyboard.type(v); };
  await setNum(pct[0], '40');
  c = await p.evaluate(() => ({ total: document.querySelector('[data-qsteps-total]').textContent, invalid: document.querySelector('.qsteps-row input[type=number]').getAttribute('aria-invalid'), sched: document.querySelector('[data-qsteps-sched]').textContent }));
  check('097 custom: 40/50 reports 90% and marks fields invalid', /Total 90% · must equal 100%/.test(c.total) && c.invalid === 'true' && c.sched === 'Custom 40/50', c);
  await p.click('#qs-tab-3'); await wait(200);
  await p.click('.dialog-foot [data-wb-action="check"]'); await wait(250);
  s = await state(p);
  const status = await p.evaluate(() => (document.querySelector('#wb-status') || {}).textContent || '');
  check('Create quote with invalid custom total: returns to step 2, focuses %, nothing saved', s.panels.join() === 'false,true,false' && /qs-pct-/.test(s.active) && /must add up to 100%/.test(s.live) && !/Checked locally/.test(status), { s, status });
  await setNum(pct[0], '50');
  await p.click('[data-qsteps-add]');
  let n = await p.evaluate(() => ({ rows: document.querySelectorAll('.qsteps-row').length, focus: document.activeElement.id, total: document.querySelector('[data-qsteps-total]').textContent }));
  check('Add installment: third row, focus in name, total flags 100% + 0', n.rows === 3 && /qs-name-/.test(n.focus) && /Total 100% · must equal|Total 100%/.test(n.total), n);
  await p.click('#qs-tab-3'); await wait(150);
  await p.click('.dialog-foot [data-wb-action="check"]'); await wait(250);
  n = await p.evaluate(() => ({ step2: !document.querySelector('#qs-step-2').hidden, focus: document.activeElement.id, live: document.querySelector('[data-qsteps-live]').textContent }));
  check('Create quote with an incomplete new installment: back to step 2, focus on the empty name', n.step2 && /qs-name-3/.test(n.focus) && /Complete each installment/.test(n.live), n);
  await p.click('.qsteps-row:last-child [data-qsteps-remove]');
  n = await p.evaluate(() => ({ rows: document.querySelectorAll('.qsteps-row').length, total: document.querySelector('[data-qsteps-total]').textContent, focus: document.activeElement.id }));
  check('Remove installment: back to 2 rows, total 100%, focus kept in editor', n.rows === 2 && n.total === 'Total 100%' && /qs-/.test(n.focus), n);

  // keyboard tabs
  await p.focus('#qs-tab-2'); await p.keyboard.press('ArrowRight'); await wait(200);
  s = await state(p);
  check('101 terms via ArrowRight: tab 3 selected + focused, Next hidden', s.selected.join() === 'false,false,true' && s.active === 'qs-tab-3' && s.nextHidden && s.panels.join() === 'false,false,true', s);
  await p.keyboard.press('Home'); await wait(100);
  s = await state(p); check('Home key returns to step 1', s.selected[0] === 'true' && s.active === 'qs-tab-1', s.selected);
  await p.keyboard.press('End'); await wait(200);
  await p.type('#qb-terms', 'Two revision rounds.');
  const cnt = await p.evaluate(() => document.querySelector('[data-qsteps-count]').textContent);
  check('101 terms: character count live', cnt === '20 characters', cnt);
  check('101 terms: standard terms + signed agreement present', await p.evaluate(() => /10 Governing law \(India\)/.test(document.querySelector('#qs-step-3').textContent) && document.querySelector('#qs-step-3 input[type=checkbox]').checked));
  await axe(p, 'light-1440 step3');
  await shot(p, '101-terms', 'light', 1440);
  await p.click('[data-qsteps-prev]'); await wait(200);
  s = await state(p); check('Back from step 3 shows step 2 and focuses heading', s.panels.join() === 'false,true,false' && s.active === 'qs-step-2-h', s);
  await p.close();

  // ---------- Dark 390: custom editor on mobile ----------
  p = await open('dark', 390);
  await p.waitForSelector('#rq-quote-builder [data-qsteps-next]:not([disabled])');
  await p.click('#qs-tab-2'); await p.click('[data-qsteps-mode-btn="custom"]'); await wait(250);
  s = await state(p);
  const over = await p.evaluate(() => [...document.querySelectorAll('.qsteps-row > *, .qsteps-tabs > *, .qsteps-mode > *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).length);
  check('dark 390: no page overflow, no clipped step controls', s.scroll <= 390 && over === 0, { scroll: s.scroll, over });
  await axe(p, 'dark-390 step2 custom');
  await shot(p, '097-custom', 'dark', 390);
  await p.close();

  // ---------- Reduced motion ----------
  p = await open('light', 1440, { reduced: true });
  await p.waitForSelector('#rq-quote-builder [data-qsteps-next]:not([disabled])');
  await p.click('[data-qsteps-next]'); await wait(30);
  const anim = await p.evaluate(() => getComputedStyle(document.querySelector('#qs-step-2')).animationName);
  check('reduced motion: step change has no animation', anim === 'none', anim);
  await p.close();

  // ---------- No JS ----------
  p = await open('light', 1440, { noJs: true });
  s = await p.evaluate(() => {
    const r = document.querySelector('#rq-quote-builder');
    return { tabs: r.querySelector('[role="tablist"]').hidden, panels: [...r.querySelectorAll('[data-qsteps-panel]')].map(x => !x.hidden && x.getClientRects().length > 0), disabled: [...r.querySelectorAll('[data-qs-js], [data-wb-js]')].every(b => b.disabled), mode: r.querySelector('[data-qsteps-mode]').hidden };
  });
  check('no-JS: all three steps visible, step controls hidden/disabled', s.tabs && s.panels.join() === 'true,true,true' && s.disabled && s.mode, s);
  await p.close();

  check('no runtime/network errors', errors.length === 0, errors);
  fs.writeFileSync('upgrade-v2/evidence/batch8-quote-steps.json', JSON.stringify({ browser: await browser.version(), url: URL, results }, null, 2));
  console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
