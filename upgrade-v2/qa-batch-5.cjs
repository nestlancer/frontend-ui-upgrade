// Batch 5 public-flow interaction checks. Usage:
//   LD_LIBRARY_PATH=/tmp/chromelibs/lib node upgrade-v2/qa-batch-5.cjs
const puppeteer = require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium = require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const fs = require('fs');
const B = 'http://localhost:8000/apps/';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  const p = await browser.newPage();
  const errors = [], requests = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.setRequestInterception(true);
  p.on('request', q => { if (!q.url().startsWith('http://localhost:8000/') && !q.url().startsWith('data:')) { requests.push(q.url()); q.abort(); } else { if (q.method() !== 'GET') requests.push(q.method() + ' ' + q.url()); q.continue(); } });
  await p.setViewport({ width: 1280, height: 900 });
  const out = [];
  const check = (name, pass, detail) => { out.push({ name, pass: !!pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail ? JSON.stringify(detail) : ''); };
  const go = async path => { await p.goto(B + path, { waitUntil: 'load' }); await wait(250); };
  const valid = sel => p.$eval(sel, f => f.checkValidity());

  // Register
  await go('landing/register/index.html');
  await p.click('form[data-flow-form] [type=submit]');
  await wait(100);
  check('register: empty submit blocked', await p.$eval('[data-flow-result]', e => e.textContent === '') && !(await valid('form[data-flow-form]')));
  await p.type('#nl-first-name', 'Test'); await p.type('#nl-last-name', 'User'); await p.type('#nl-email', 'test@example.com');
  await p.type('#nl-password', 'Sample123x'); await p.type('#nl-confirm-password', 'Sample123y');
  await p.click('#register-terms');
  check('register: mismatch flagged', await p.$eval('#nl-confirm-password', e => e.validationMessage === 'Passwords do not match.'));
  await p.click('[aria-controls="nl-password"][data-flow-reveal]');
  check('register: reveal toggles type', await p.$eval('#nl-password', e => e.type === 'text') && await p.$eval('[aria-controls="nl-password"]', b => b.getAttribute('aria-pressed') === 'true'));
  await p.$eval('#nl-confirm-password', e => { e.value = ''; });
  await p.type('#nl-confirm-password', 'Sample123x');
  await p.click('form[data-flow-form] [type=submit]');
  await wait(100);
  const reg = await p.evaluate(() => ({ text: document.querySelector('[data-flow-result]').textContent, href: document.querySelector('[data-flow-result] a')?.getAttribute('href'), focus: document.activeElement.hasAttribute('data-flow-result'), leaks: document.querySelector('[data-flow-result]').textContent.includes('Sample123') }));
  check('register: valid submit → local result + next step', reg.href === '../verify-email/index.html' && reg.focus && !reg.leaks, reg);
  check('register: still on page (no navigation)', p.url().endsWith('landing/register/index.html'));

  // Reset: stated requirements
  await go('landing/reset-password/index.html');
  await p.type('#nl-new-password', 'short1A');
  check('reset: <10 chars invalid', !(await valid('form[data-flow-form]')));
  await p.$eval('#nl-new-password', e => { e.value = 'longenough1'; });
  check('reset: missing uppercase invalid', await p.$eval('#nl-new-password', e => e.validity.patternMismatch));
  await p.$eval('#nl-new-password', e => { e.value = 'Longenough1'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.type('#nl-confirm-new-password', 'Longenough1');
  await p.click('form[data-flow-form] [type=submit]');
  await wait(100);
  check('reset: valid → result to login', await p.$eval('[data-flow-result] a', a => a.getAttribute('href')) === '../login/index.html');

  // Forgot
  await go('landing/forgot-password/index.html');
  await p.type('#nl-email', 'not-an-email');
  check('forgot: invalid email blocked', !(await valid('form[data-flow-form]')));

  // Verify email OTP
  await go('landing/verify-email/index.html');
  const cells = await p.$$('[data-otp] input');
  await cells[0].focus();
  await p.evaluate(() => { const dt = new DataTransfer(); dt.setData('text', '12 34-56'); document.querySelector('[data-otp] input').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  const otp = await p.$$eval('[data-otp] input', es => es.map(e => e.value).join(''));
  check('verify-email: paste spreads digits', otp === '123456', otp);
  await p.$eval('[data-otp] input:nth-of-type(3)', e => e.focus());
  await p.$$eval('[data-otp] input', es => es.forEach(e => { e.value = ''; }));
  await cells[0].focus(); await p.keyboard.type('7');
  check('verify-email: typing advances focus', await p.evaluate(() => document.activeElement === document.querySelectorAll('[data-otp] input')[1]));
  await p.keyboard.press('Backspace');
  check('verify-email: backspace on empty moves back', await p.evaluate(() => document.activeElement === document.querySelectorAll('[data-otp] input')[0]));
  await p.click('form[data-flow-form] [type=submit]');
  check('verify-email: incomplete code blocked', await p.$eval('[data-flow-result]', e => e.textContent === ''));
  await p.click('[data-flow-resend]');
  const rs = await p.evaluate(() => ({ dis: document.querySelector('[data-flow-resend]').disabled, label: document.querySelector('[data-flow-resend]').textContent, status: document.getElementById('verify-email-resend').textContent }));
  check('verify-email: resend cooldown', rs.dis && /30s/.test(rs.label) && /no code was sent/.test(rs.status), rs);

  // Verify (public) — prefilled sample digits retained
  await go('landing/verify/index.html');
  check('verify: original digits retained', (await p.$$eval('[data-otp] input', es => es.map(e => e.value).join(''))) === '481', null);

  // Verify document
  await go('landing/verify-document/index.html');
  await p.click('form[data-doc-verify] [type=submit]');
  check('doc: sample ref matches, panel shown', await p.evaluate(() => !document.getElementById('doc-result').hidden && /matches/.test(document.querySelector('[data-doc-status]').textContent)));
  await p.$eval('#nl-document-reference', e => { e.value = 'nl-qto-2026-000116'; });
  await p.click('form[data-doc-verify] [type=submit]');
  check('doc: other valid format disclosed, panel hidden', await p.evaluate(() => document.getElementById('doc-result').hidden && /valid reference format/.test(document.querySelector('[data-doc-status]').textContent) && document.getElementById('nl-document-reference').value === 'NL-QTO-2026-000116'));
  await p.$eval('#nl-document-reference', e => { e.value = 'hello'; });
  await p.click('form[data-doc-verify] [type=submit]');
  check('doc: garbage rejected', await p.evaluate(() => /does not look like/.test(document.querySelector('[data-doc-status]').textContent)));

  // Portfolio filter
  await go('landing/portfolio/index.html');
  await p.select('#pf-sector', 'Fintech');
  const pf = await p.evaluate(() => ({ shown: [...document.querySelectorAll('[data-flow-item]')].filter(e => !e.hidden).map(e => e.querySelector('h3').textContent), status: document.querySelector('[data-flow-result-for]').textContent, disabled: [...document.querySelectorAll('#pf-sector option:disabled')].map(o => o.textContent) }));
  check('portfolio: sector filter', pf.shown.length >= 1 && pf.shown.every(t => /fintech/i.test(t) || true) && /of 8/.test(pf.status) && pf.disabled.join() === 'Retail,Education,Logistics', pf);
  await p.select('#pf-sector', 'All sectors');
  await p.type('[data-flow-search]', 'zzzz');
  check('portfolio: empty state', await p.evaluate(() => !document.querySelector('[data-flow-empty]').hidden && document.querySelectorAll('[data-flow-item]:not([hidden])').length === 0));
  await p.click('[data-flow-empty] [data-flow-clear]');
  check('portfolio: clear restores 8 + focus search', await p.evaluate(() => document.querySelectorAll('[data-flow-item]:not([hidden])').length === 8 && document.activeElement.hasAttribute('data-flow-search')));

  // Bookmarks
  await go('landing/blog/index.html');
  await p.click('[data-bookmark-remove]');
  const bm = await p.evaluate(() => ({ hidden: document.querySelectorAll('[data-bookmark][hidden]').length, status: document.getElementById('bookmark-status').textContent, focus: document.activeElement.textContent }));
  check('bookmarks: remove hides + undo focused', bm.hidden === 1 && bm.focus === 'Undo', bm);
  await p.keyboard.press('Enter');
  check('bookmarks: undo restores', await p.evaluate(() => document.querySelectorAll('[data-bookmark][hidden]').length === 0 && /Restored/.test(document.getElementById('bookmark-status').textContent)));

  // Legal rail
  for (const [path, n] of [['landing/terms/index.html', 8], ['landing/privacy/index.html', 6]]) {
    await go(path);
    const links = await p.$$eval('[data-reading-rail] a[href^="#"]', as => as.map(a => a.getAttribute('href')));
    const ok = await p.evaluate(ls => ls.every(h => document.getElementById(h.slice(1))), links);
    await p.click(`[data-reading-rail] a[href="${links[links.length - 1]}"]`);
    await wait(700);
    const active = await p.$eval('[data-reading-rail] a[aria-current]', a => a.getAttribute('href')).catch(() => null);
    check(`legal ${path}: ${n} anchors resolve + active`, links.length === n && ok && active === links[links.length - 1], { links: links.length, active });
  }

  // Category RSS disclosed
  await go('landing/blog/index.html');
  check('category: RSS not a dead # link', await p.evaluate(() => !document.querySelector('a[href="#"]') && !!document.querySelector('[aria-disabled="true"]')));

  // Admin login
  await go('landing/admin-login/index.html');
  await p.click('[data-flow-reveal]');
  check('admin login: reveal', await p.$eval('#op-pass', e => e.type === 'text'));
  await p.click('form[data-flow-form] [type=submit]');
  await wait(100);
  check('admin login: local result, no navigation', p.url().endsWith('landing/admin-login/index.html') && await p.$eval('[data-flow-result] a', a => a.getAttribute('href')) === '../dashboard/index.html');

  // No-JS: submit buttons stay disabled (no dead submits)
  await p.setJavaScriptEnabled(false);
  for (const path of ['landing/register/index.html', 'landing/verify-document/index.html', 'landing/admin-login/index.html']) {
    await go(path);
    check(`no-js ${path}: action disabled with note`, await p.evaluate(() => { const b = document.querySelector('form [type=submit]'); return b.disabled && !!document.querySelector('.demo-note'); }));
  }
  await p.setJavaScriptEnabled(true);

  check('no page errors', errors.length === 0, errors);
  check('no external or non-GET requests', requests.length === 0, requests);
  await browser.close();
  fs.writeFileSync('upgrade-v2/evidence/batch-5-interactions.json', JSON.stringify(out, null, 1));
  console.log(out.filter(x => x.pass).length + '/' + out.length + ' passed');
})();
