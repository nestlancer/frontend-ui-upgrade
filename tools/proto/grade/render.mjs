import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:8765/';
const pairs = JSON.parse(fs.readFileSync('/home/user/grade/pairs.json','utf8'));
const protos = [...new Set(pairs.map(p=>p.proto))].filter(Boolean);
const only = process.argv[2] ? process.argv[2].split(',') : null;
const list = only ? protos.filter(p=>only.some(o=>p.includes(o))) : protos;
const exe = await chromium.executablePath();
const browser = await puppeteer.launch({ executablePath: exe, args: chromium.args, headless: true, defaultViewport: {width:1440,height:900} });
const results = {};
const slug = p => p.replace(/[\/:]/g,'_');
for (const p of list) {
  const r = { proto: p, errors: [], pageErrors: [] };
  const page = await browser.newPage();
  page.on('console', m => { if (m.type()==='error') r.errors.push(m.text().slice(0,160)); });
  page.on('pageerror', e => r.pageErrors.push(String(e.message).slice(0,160)));
  try {
    const resp = await page.goto(BASE + p + '/', { waitUntil: 'networkidle0', timeout: 20000 });
    r.status = resp ? resp.status() : 0;
    await new Promise(res=>setTimeout(res,250));
    r.dom = await page.evaluate(() => {
      const vis = el => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display!=='none' && s.visibility!=='hidden' && b.width>0 && b.height>0; };
      const txt = document.body.innerText || '';
      const fonts = [...document.querySelectorAll('body *')].filter(vis).slice(0,4000).map(el => parseFloat(getComputedStyle(el).fontSize)).filter(n=>!isNaN(n));
      const headings = [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().replace(/\s+/g,' ').slice(0,80)).filter(Boolean);
      const primary = [...document.querySelectorAll('.btn-primary, button.primary, a.btn-primary')].filter(vis).map(b=>b.innerText.trim().replace(/\s+/g,' ').slice(0,40));
      const navLinks = [...document.querySelectorAll('nav a, aside a, .sidebar a, header a')].filter(vis).map(a=>a.innerText.trim()).filter(Boolean);
      const imgs=[...document.images]; const broken = imgs.filter(i=>i.complete && i.naturalWidth===0).length;
      const brandVars = getComputedStyle(document.documentElement).getPropertyValue('--brand-11').trim();
      return {
        title: document.title, hasDesc: !!document.querySelector('meta[name=description]'),
        h1: [...document.querySelectorAll('h1')].map(h=>h.innerText.trim()).slice(0,2),
        headings: headings.slice(0,14), headingCount: headings.length,
        primary: primary.slice(0,4), navCount: navLinks.length, navSample: [...new Set(navLinks)].slice(0,14),
        buttons: document.querySelectorAll('button, .btn, [role=button]').length,
        links: document.querySelectorAll('a[href]').length,
        inputs: document.querySelectorAll('input, select, textarea').length,
        tables: document.querySelectorAll('table').length, tableRows: document.querySelectorAll('tbody tr').length,
        tabs: document.querySelectorAll('[role=tab], .tab, .tabs a').length,
        imgs: imgs.length, broken,
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        minFont: fonts.length ? Math.min(...fonts) : 0, medFont: fonts.length ? fonts.sort((a,b)=>a-b)[Math.floor(fonts.length/2)] : 0,
        textLen: txt.length, badText: (txt.match(/lorem ipsum|undefined|NaN|\[object Object\]|TODO|xxx/gi)||[]).slice(0,5),
        hasTheme: !!document.querySelector('[data-theme-toggle]'), hasFab: !!document.getElementById('fab'),
        hasBreadcrumb: !!document.querySelector('.crumbs, .breadcrumb, nav[aria-label=breadcrumb]'),
        hasSkipLink: !!document.querySelector('a[href="#main"], .skip-link'),
        elements: document.querySelectorAll('body *').length,
        brandVar: brandVars, sample: txt.replace(/\s+/g,' ').slice(0,400),
      };
    });
    r.fullText = await page.evaluate(()=>document.body.innerText||'');
    fs.writeFileSync('/home/user/grade/text/'+slug(p)+'.txt', r.fullText);
    const h = Math.min(await page.evaluate(()=>document.documentElement.scrollHeight), 7000);
    await page.screenshot({ path: `/home/user/grade/renders/d_${slug(p)}.png`, clip:{x:0,y:0,width:1440,height:h} });
    await page.setViewport({width:390,height:844});
    await new Promise(res=>setTimeout(res,200));
    r.mobileOverflowX = await page.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    await page.setViewport({width:1440,height:900});
  } catch (e) { r.fatal = String(e.message).slice(0,200); }
  await page.close();
  delete r.fullText; results[p] = r;
  process.stdout.write('.');
}
await browser.close();
fs.writeFileSync(only ? '/home/user/grade/render_partial.json' : '/home/user/grade/render.json', JSON.stringify(results,null,1));
console.log('\ndone', Object.keys(results).length);
