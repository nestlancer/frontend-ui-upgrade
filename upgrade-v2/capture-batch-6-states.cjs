// Captures state 037 (client global search dialog) on the client dashboard.
//   LD_LIBRARY_PATH=/tmp/chromelibs/lib node upgrade-v2/capture-batch-6-states.cjs
const puppeteer = require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium = require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
(async () => {
  const b = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  const p = await b.newPage();
  const out = {};
  for (const [theme, width] of [['light', 1440], ['dark', 390]]) {
    await p.setViewport({ width, height: 900 });
    await p.goto('http://localhost:8000/apps/web/dashboard/index.html', { waitUntil: 'load' });
    await p.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await new Promise(r => setTimeout(r, 1200));
    await p.keyboard.down('Control'); await p.keyboard.press('k'); await p.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 400));
    await p.keyboard.type('inv');
    await new Promise(r => setTimeout(r, 200));
    out[theme + width] = await p.evaluate(() => ({ open: document.getElementById('operator-search').open, focus: document.activeElement.id, visible: [...document.querySelectorAll('[data-search-entry]')].filter(e => !e.hidden && e.getClientRects().length).map(e => e.textContent.trim().replace(/\s+/g, ' ')).slice(0, 6), status: document.getElementById('operator-search-status').textContent }));
    await p.screenshot({ path: `upgrade-v2/evidence/batch6-state-search-${theme}-${width}.webp`, type: 'webp', quality: 60 });
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
