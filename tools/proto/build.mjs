#!/usr/bin/env node
// ============================================================================
// Nestlancer static prototype — directory-based HTML build
// Emits plain HTML into `proto/` at the repo root: one folder per route,
// each with its own index.html, mirroring the route map:
//   proto/
//     index.html                       prototype sign-off hub
//     apps/landing/...                 marketing site  (port 9020 surface)
//     apps/web/...                     public + auth + client portal (9000)
//     apps/admin/...                   operator console
//     shared/assets/proto.css|ui.js
// Run:  node tools/proto/build.mjs
// ============================================================================
import { copyFileSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { linkTo as LT, relRoot } from './lib/util.mjs';
import { icon } from './lib/icons.mjs';
import { doc, mktPage, appPage, authSplitPage, authCenterPage } from './lib/chrome.mjs';
import { badge, avatar } from './lib/comps.mjs';

import landing from './routes/landing.mjs';
import webPublic from './routes/webPublic.mjs';
import webAuth from './routes/webAuth.mjs';
import client1 from './routes/client1.mjs';
import client2 from './routes/client2.mjs';
import admin1 from './routes/admin1.mjs';
import admin2 from './routes/admin2.mjs';
import admin3 from './routes/admin3.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));          // tools/proto
const REPO = join(HERE, '..', '..');                            // repo root
const OUT = join(REPO, 'proto');

const routes = [
  ...landing,
  ...webPublic,
  ...webAuth,
  ...client1,
  ...client2,
  ...admin1,
  ...admin2,
  ...admin3,
];

// ------------------------------------------------------------------ helpers
const written = new Set();

function emit(rel, html) {
  const abs = join(OUT, rel.replace(/^\//, ''));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
  written.add(rel.replace(/^\//, '').replace(/\\/g, '/'));
}

const dashHome = (app) =>
  app === 'admin' ? 'apps/admin/dashboard/' : 'apps/web/dashboard/';

const appOf = (e) => {
  if (e.app) return e.app;
  return e.path.startsWith('apps/landing') ? 'landing' : 'web';
};

// Design rule: every screen carries one primary action. When a page header action
// row has no primary button, promote its last secondary action (label/href unchanged).
function promotePrimary(body) {
  if (/btn-primary/.test(body)) return body;
  const at = body.indexOf('class="phead-actions"');
  if (at < 0) return body;
  const end = body.indexOf('</div>', at);
  if (end < 0) return body;
  const seg = body.slice(at, end);
  const k = seg.lastIndexOf('btn btn-secondary');
  if (k < 0) return body;
  const seg2 = seg.slice(0, k) + 'btn btn-primary' + seg.slice(k + 'btn btn-secondary'.length);
  return body.slice(0, at) + seg2 + body.slice(end);
}

function render(e) {
  const route = e.path;
  const desc = e.desc || `Nestlancer ${appOf(e)} prototype — ${e.title}`;
  let html;
  if (e.redirect) {
    const target = LT(route, e.redirect);
    html = doc({
      route, title: e.title, desc,
      body: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px">
        <span class="avatar" style="width:46px;height:46px;background:var(--brand-2);color:var(--brand-11);border-radius:12px">${icon('gauge', 20)}</span>
        <b>Opening command center…</b>
        <a class="link" href="${target}">Continue →</a>
        <script>location.replace(${JSON.stringify(target)});</script>
      </div>`,
      fabApp: appOf(e),
    });
  } else if (e.auth === 'split') {
    html = authSplitPage({ route, title: e.title, desc, form: e.form(e), foot: e.foot ? e.foot(e) : '' });
  } else if (e.auth === 'center') {
    html = authCenterPage({ route, title: e.title, desc, card: e.card(e), foot: e.foot ? e.foot(e) : '' });
  } else if (e.app) {
    html = appPage({
      route, title: e.title, desc, body: promotePrimary(e.body(e)), app: e.app,
      crumbs: [
        { l: 'Dashboard', href: dashHome(e.app) },
        { l: e.crumb || e.title.split('·')[0].trim() },
      ],
    });
  } else {
    html = mktPage({
      route, title: e.title, desc, body: e.body(e), app: appOf(e), active: e.active || '',
    });
  }
  return html;
}

// ------------------------------------------------------------------ build
const t0 = Date.now();
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// shared assets
mkdirSync(join(OUT, 'shared/assets'), { recursive: true });
copyFileSync(join(HERE, 'css/proto.css'), join(OUT, 'shared/assets/proto.css'));

const UI_JS = `// Nestlancer prototype — tiny interactivity
(function () {
  var root = document.documentElement;
  try { var t = localStorage.getItem('nl-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  function syncLabel() {
    document.querySelectorAll('[data-theme-label]').forEach(function (n) {
      n.textContent = root.getAttribute('data-theme') === 'dark' ? 'Dark' : 'Light';
    });
  }
  syncLabel();
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-theme-toggle]');
    if (t) {
      var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', cur);
      try { localStorage.setItem('nl-theme', cur); } catch (e) {}
      syncLabel(); return;
    }
    var fab = document.getElementById('fab');
    if (fab && !ev.target.closest('#fab')) fab.classList.remove('open');
  });
  // scroll reveal — elements with .reveal fade/rise in once they enter the viewport
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  window.__nl = { version: 'dir-html/1.1' };
})();
`;
writeFileSync(join(OUT, 'shared/assets/ui.js'), UI_JS);
written.add('shared/assets/proto.css');
written.add('shared/assets/ui.js');

// pages — rendered once per emitted path so relative links resolve per directory depth
let pages = 0;
const errors = [];
for (const e of routes) {
  for (const p of [e.path, ...(e.alias ? [e.alias] : [])]) {
    try {
      emit(p + 'index.html', render({ ...e, path: p, alias: undefined }));
      pages++;
    } catch (err) {
      errors.push({ path: p, error: err.message });
      console.error(`✕ ${p}: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------- hub page
const groups = [
  {
    name: 'apps/landing', sub: 'Marketing site — nestlancer.com · port 9020', accent: '#0B7A71',
    match: (p) => p.startsWith('apps/landing'),
  },
  {
    name: 'apps/web — public', sub: 'app.nestlancer.com · public surface + legal + verify/share', accent: '#3FA9F5',
    match: (p) => p.startsWith('apps/web') && !routes.find(r => r.path === p)?.app && !routes.find(r => r.path === p)?.auth,
  },
  {
    name: 'apps/web — client portal', sub: 'Dashboard, requests, projects, quotes, messages, billing, settings', accent: '#02CED1',
    match: (p) => routes.find(r => r.path === p)?.app === 'web',
  },
  {
    name: 'auth', sub: 'Sign-in flows — client (card rail) + operator (centered)', accent: '#8A5A1D',
    match: (p) => !!routes.find(r => r.path === p)?.auth,
  },
  {
    name: 'apps/admin — operator console', sub: 'Command center, pipelines, finance, content, system', accent: '#B65A52',
    match: (p) => !routes.find(r => r.path === p)?.auth && routes.find(r => r.path === p)?.app === 'admin',
  },
];

const seen = new Set();
const hubSections = groups.map((g) => {
  const items = routes.filter((r) => !seen.has(r.path) && g.match(r.path));
  items.forEach((r) => seen.add(r.path));
  const list = items.map((r) => {
    const href = r.path + 'index.html';
    const bracket = r.path.includes('[');
    return `<a class="hub-row" href="./${href}"><span class="hub-dot" style="background:${g.accent}"></span><code class="mono hub-p">/${r.path}</code><span class="hub-t">${r.crumb || r.title.replace(' · Nestlancer', '').replace(' · Admin', ' · Admin')}</span>${bracket ? '<span class="hub-tag">[param]</span>' : ''}</a>`;
  }).join('');
  return `<section style="margin:34px 0">
  <div class="flex items-baseline justify-between mb-3">
    <h2 class="h3" style="display:flex;align-items:center;gap:10px"><i style="width:10px;height:10px;border-radius:3px;background:${g.accent};display:inline-block"></i>${g.name}</h2>
    <span class="mono text-xs dim">${items.length} routes</span>
  </div>
  <p class="text-xs dim" style="margin:-6px 0 10px">${g.sub}</p>
  <div class="panel hub-list">${list}</div>
</section>`;
}).join('');

const hubHtml = mktPage({
  route: '', title: 'Nestlancer UI prototype — sign-off hub', desc: 'Directory-based static prototype index',
  app: 'web', active: '',
  body: `<div class="mkt-wrap" style="max-width:880px;padding-top:60px;padding-bottom:60px">
  <div class="eyebrow"><span class="dot"></span>PROTOTYPE · DIRECTORY BUILD</div>
  <h1 class="h-display" style="margin-top:14px">Nestlancer UI prototype.</h1>
  <p class="lead mt-4" style="max-width:60ch">Plain HTML, one folder per route, shared local CSS — the whole app surface you can click through without a build server. Every bracket route also ships with a readable alias URL.</p>
  <div class="grid g4 gap-4 mt-6">
    ${[['Landing pages', groups[0].match && routes.filter(r => groups[0].match(r.path)).length, 'apps/landing/index.html'],
       ['Client portal', routes.filter(r => r.app === 'web').length, 'apps/web/dashboard/index.html'],
       ['Operator console', routes.filter(r => r.app === 'admin').length, 'apps/admin/dashboard/index.html'],
       ['Auth flows', routes.filter(r => r.auth).length, 'apps/web/login/index.html']]
      .map(([t, n, h]) => `<a class="panel panel-pad" href="./${h}" style="display:block"><b class="h3" style="font-size:14px">${t}</b><div class="mono mt-2" style="font-size:22px;font-weight:700;letter-spacing:-.03em">${n}</div><div class="text-xs dim">routes →</div></a>`).join('')}
  </div>
  ${hubSections}
  <style>
    .hub-list{padding:6px 8px}.hub-row{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px}
    .hub-row:hover{background:var(--bg-hover)}.hub-dot{width:6px;height:6px;border-radius:99px;flex-shrink:0}
    .hub-p{font-size:11.5px;color:var(--ink-1);min-width:280px}.hub-t{font-size:11.5px;color:var(--ink-3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hub-tag{font-size:11px;font-family:var(--font-mono);color:var(--brand-11);background:var(--brand-1);border:1px solid var(--brand-4);padding:1px 6px;border-radius:5px}
  @media (max-width:720px){.hub-p{min-width:0;font-size:11px}.hub-t{display:none}}
  </style>
</div>`,
});
emit('index.html', hubHtml);
pages++;

// ---------------------------------------------------------------- link audit
const HREF = /(?:href|action)="([^"#][^"]*)"/g;
const missing = [];
for (const rel of [...written]) {
  if (!rel.endsWith('.html')) continue;
  const absFile = join(OUT, rel);
  let src;
  try { src = readFileSync(absFile, 'utf8'); } catch { continue; }
  let m;
  while ((m = HREF.exec(src))) {
    const url = m[1];
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('data:') || url.startsWith('javascript:')) continue;
    if (url === '#') continue;
    const base = '/' + dirname(rel).replace(/\\/g, '/');
    let abs;
    if (url.startsWith('/')) abs = url.slice(1);
    else {
      const parts = base.split('/').filter((x) => x && x !== '.');
      for (const seg of url.split('/')) {
        if (seg === '.') continue;
        if (seg === '..') parts.pop(); else parts.push(seg);
      }
      abs = parts.join('/');
    }
    if (!written.has(abs) && !missing.find((x) => x.to === abs)) missing.push({ from: '/' + rel, to: abs });
  }
  if (/href="\/[A-Z_]+\/"/.test(src)) missing.push({ from: '/' + rel, to: 'UNREWRITTEN PLACEHOLDER' });
}

// ---------------------------------------------------------------- summary
const s = (p) => routes.filter((r) => r.path.startsWith(p)).length;
console.log(`\n✓ Nestlancer prototype built → ${OUT}`);
console.log(`  ${pages} files (${routes.length} routes · aliases duplicated)`);
console.log(`  apps/landing ${s('apps/landing')} · apps/web ${s('apps/web')} · apps/admin ${s('apps/admin')}`);
if (errors.length) {
  console.error(`\n✕ ${errors.length} route(s) failed — build aborted.`);
  process.exit(1);
}
if (missing.length) {
  console.log(`\n⚠ ${missing.length} unmatched internal link(s):`);
  for (const x of missing.slice(0, 30)) console.log(`   ${x.from} → ${x.to}`);
} else {
  console.log('  all internal links resolve ✓');
}
console.log(`  ${Date.now() - t0}ms`);
