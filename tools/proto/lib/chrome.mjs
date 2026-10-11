// ============================================================================
// Nestlancer prototype — page chrome: HTML shell, marketing chrome, app shell
// ============================================================================
import { esc, linkTo, relRoot } from './util.mjs';
import { icon, logoMark } from './icons.mjs';
import { brand, avatar } from './comps.mjs';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;550;600;650;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

// -------------------------------------------------------------- doc shell
export function doc({ route, title, desc = '', body, bodyClass = '', fabApp = '' }) {
  const root = relRoot(route);
  const css = root + 'shared/assets/proto.css';
  const js = root + 'shared/assets/ui.js';
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(desc)}">
<title>${esc(title)}</title>
${FONTS}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M4 14C10 11 16 11 28 7c-1.5 4-4.5 8-9 9.5C15.5 17.7 10.5 17.3 4 14Z' fill='%230B7A71'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${css}">
</head>
<body class="${bodyClass}">
<a href="#main" class="skip-link">Skip to main content</a>
${body}
${fab(route, fabApp)}
<script src="${js}" defer></script>
</body>
</html>`;
}

// ------------------------------------------------------------- fab switcher
function fab(route, hint) {
  const L = (t) => linkTo(route, t);
  return `<div class="fab" id="fab">
<button class="fab-btn" onclick="document.getElementById('fab').classList.toggle('open')" aria-label="Prototype menu"><i class="dot"></i><span>Prototype</span>${icon('chevrons-up-down', 13)}</button>
<div class="fab-menu">
  <div class="fab-lab">Jump to surface</div>
  <a class="fx" href="${L('index.html')}">${icon('grid', 15)} Sign-off hub <small>hub</small></a>
  <a class="fx" href="${L('apps/landing/index.html')}">${icon('globe', 15)} Marketing — nestlancer.com <small>9020</small></a>
  <a class="fx" href="${L('apps/web/index.html')}">${icon('home', 15)} Public app — app.nestlancer.com <small>9000</small></a>
  <a class="fx" href="${L('apps/web/dashboard/index.html')}">${icon('layout', 15)} Client portal <small>web</small></a>
  <a class="fx" href="${L('apps/admin/dashboard/index.html')}">${icon('terminal', 15)} Admin console <small>admin</small></a>
  <div class="fab-sep"></div>
  <div class="fab-lab">Quick states</div>
  <a class="fx" href="${L('apps/web/login/index.html')}">${icon('logIn', 15)} Client sign-in</a>
  <a class="fx" href="${L('apps/admin/login/index.html')}">${icon('shield', 15)} Operator sign-in</a>
  <a class="fx" href="${L('apps/web/quotes/[id]/index.html')}">${icon('receipt', 15)} Quote — sign &amp; accept</a>
  <a class="fx" href="${L('apps/web/payments/[id]/index.html')}">${icon('card', 15)} Checkout — pay milestone</a>
  <div class="fab-sep"></div>
  <button class="fx" data-theme-toggle>${icon('sun', 15)} <span>Theme</span> <small data-theme-label>Light</small></button>
</div></div>`;
}

// -------------------------------------------------------- marketing chrome
export function mktHeader(route, active, app = 'landing') {
  const L = (t) => linkTo(route, t);
  const base = app === 'landing' ? 'apps/landing/' : 'apps/web/';
  // Landing nav — verified order on nestlancer.com: Product, Portfolio, Blog, About, Pricing, Services, Contact
  const links =
    app === 'landing'
      ? [
          ['Product', ''], ['Portfolio', 'portfolio/'], ['Blog', 'blog/'], ['About', 'about/'],
          ['Pricing', 'pricing/'], ['Services', 'services/'], ['Contact', 'contact/'],
        ]
      : [
          ['Home', ''], ['About', 'about/'], ['Work', 'work/'], ['Blog', 'blog/'], ['Contact', 'contact/'],
        ];
  return `<header class="mkt-header"><div class="mkt-wrap mkt-nav">
${brand(L(base))}
<nav class="mkt-links" aria-label="Primary">${links.map(([l, p]) => `<a href="${L(base + p)}"${active === l.toLowerCase() ? ' class="active"' : ''}>${l}</a>`).join('')}</nav>
<div class="flex items-center gap-2">
  ${app === 'web' ? `<a class="btn btn-ghost btn-icon" href="${L('apps/web/blog/bookmarks/')}" title="Bookmarks">${icon('bookmark', 15)}</a>` : ''}
  <a class="btn btn-ghost btn-sm" href="${L('apps/web/login/')}">Sign in</a>
  <a class="btn btn-primary btn-sm" href="${L(base + 'contact/')}">Start a project ${icon('arrow-right', 13)}</a>
</div></div></header>`;
}

export function mktFooter(route, app = 'landing') {
  const L = (t) => linkTo(route, t);
  const base = app === 'landing' ? 'apps/landing/' : 'apps/web/';
  // Footer columns + legal line verified on nestlancer.com (services page footer).
  return `<footer class="footer"><div class="mkt-wrap">
<div class="footer-grid">
  <div class="flex-col gap-3">
    ${brand(L(base))}
    <p class="text-sm muted" style="max-width:32ch;line-height:1.6">Product studio + client portal. Fixed-price quotes, Razorpay milestones, live Project Hub.</p>
  </div>
  <div><h5>Product</h5><a href="${L('apps/web/dashboard/')}">Project Hub</a><a href="${L('apps/landing/pricing/')}">Pricing</a><a href="${L('apps/landing/services/')}">Services</a><a href="${L(base + 'portfolio/')}">Portfolio</a></div>
  <div><h5>Company</h5><a href="${L(base + 'about/')}">About</a><a href="${L(base + 'blog/')}">Blog</a><a href="${L(base + 'contact/')}">Contact</a><a href="${L('apps/web/register/')}">Start a project</a></div>
  <div><h5>Legal</h5><a href="${L('apps/web/terms/')}">Terms</a><a href="${L('apps/web/privacy/')}">Privacy</a><a href="${L('apps/web/verify-document/')}">Verify document</a></div>
</div>
<div class="footer-base"><span>© 2026 Nestlancer. Made in India. All rights reserved.</span></div>
</div></footer>`;
}

export function mktPage({ route, title, desc, body, active, app = 'landing', mainAttrs = '' }) {
  return doc({
    route, title, desc, bodyClass: 'mkt-body',
    body: `${mktHeader(route, active, app)}<main id="main" ${mainAttrs}>${body}</main>${mktFooter(route, app)}`,
    fabApp: app,
  });
}

// ------------------------------------------------------------ app shells
const WEB_NAV = [
  { sec: 'Main' },
  { l: 'Dashboard', i: 'grid', href: 'apps/web/dashboard/' },
  { l: 'Requests', i: 'send', href: 'apps/web/requests/', match: ['apps/web/requests'] },
  { l: 'Projects', i: 'folder', href: 'apps/web/projects/', match: ['apps/web/projects'] },
  { l: 'Quotes', i: 'receipt', href: 'apps/web/quotes/', match: ['apps/web/quotes'] },
  { l: 'Messages', i: 'message', href: 'apps/web/messages/', match: ['apps/web/messages'], count: 6 },
  { l: 'Billing', i: 'card', href: 'apps/web/payments/', match: ['apps/web/payments'] },
  { l: 'Invoices', i: 'file-text', href: 'apps/web/invoices/', match: ['apps/web/invoices'] },
  { l: 'Notifications', i: 'bell', href: 'apps/web/notifications/' },
  { sec: 'Explore' },
  { l: 'Blog', i: 'rss', href: 'apps/web/blog/' },
  { l: 'Portfolio', i: 'image', href: 'apps/web/portfolio/' },
  { sec: 'Account' },
  { l: 'Profile', i: 'user', href: 'apps/web/profile/' },
  { l: 'Settings', i: 'settings', href: 'apps/web/settings/', match: ['apps/web/settings'] },
];

const ADMIN_NAV = [
  { sec: 'Operations' },
  { l: 'Dashboard', i: 'gauge', href: 'apps/admin/dashboard/' },
  { l: 'Pipelines', i: 'layers', href: 'apps/admin/pipeline/', match: ['apps/admin/pipeline'] },
  { l: 'Inquiries', i: 'inbox', href: 'apps/admin/contact/', count: 17 },
  { l: 'Notifications', i: 'bell', href: 'apps/admin/notifications/' },
  { l: 'Requests', i: 'clipboard', href: 'apps/admin/requests/', match: ['apps/admin/requests'] },
  { l: 'Quotes', i: 'receipt', href: 'apps/admin/quotes/', match: ['apps/admin/quotes'] },
  { l: 'Projects', i: 'folder', href: 'apps/admin/projects/', match: ['apps/admin/projects'] },
  { l: 'Payments', i: 'card', href: 'apps/admin/payments/', match: ['apps/admin/payments'], count: 16 },
  { l: 'Users', i: 'users', href: 'apps/admin/users/', match: ['apps/admin/users'] },
  { l: 'Messages', i: 'message', href: 'apps/admin/messages/', match: ['apps/admin/messages'], count: 21 },
  { l: 'Moderation', i: 'shield', href: 'apps/admin/moderation/' },
  { l: 'Analytics', i: 'bar-chart', href: 'apps/admin/analytics/' },
  { sec: 'Content' },
  { l: 'Blog', i: 'pen', href: 'apps/admin/content/', match: ['apps/admin/content'] },
  { l: 'Portfolio', i: 'image', href: 'apps/admin/portfolio/', match: ['apps/admin/portfolio'] },
  { l: 'Media Library', i: 'hardDrive', href: 'apps/admin/media/', match: ['apps/admin/media'] },
  { sec: 'System' },
  { l: 'System Config', i: 'settings', href: 'apps/admin/system/', match: ['apps/admin/system'] },
  { l: 'Webhooks', i: 'webhook', href: 'apps/admin/integrations/' },
  { l: 'API Keys', i: 'key', href: 'apps/admin/api-keys/' },
  { l: 'Audit Logs', i: 'history', href: 'apps/admin/audit/' },
];

function sidebar(route, nav, variant) {
  const L = (t) => linkTo(route, t);
  const isActive = (item) => {
    if (route === item.href.replace(/\/$/, '') + '/' ) return true;
    const pats = item.match || [item.href];
    return pats.some((p) => route.startsWith(p));
  };
  let items = '';
  let open = false;
  for (const n of nav) {
    if (n.sec) {
      if (open) items += '</div>';
      items += `<div class="sb-section"><div class="sb-label"><span>${n.sec}</span>${icon('chevron-down', 11)}</div>`;
      open = true;
      continue;
    }
    items += `<a class="sb-item${isActive(n) ? ' active' : ''}" href="${L(n.href)}"${isActive(n) ? ' aria-current="page"' : ''}>
      <span class="l">${icon(n.i, 15)}<span>${n.l}</span></span>${n.count ? `<span class="sb-count">${n.count}</span>` : ''}</a>`;
  }
  if (open) items += '</div>';
  const foot =
    variant === 'admin'
      ? `<div class="sb-foot">
  <div class="flex items-center gap-2" style="padding:4px 4px 10px">
    <span class="avatar" style="background:var(--brand-9);color:#fff">A</span>
    <div class="min-w-0"><div class="truncate" style="font-size:12px;font-weight:600">admin@nestlancer.com</div><div class="text-xs dim">Administrator</div></div>
  </div>
  <a class="sb-item" href="${L('apps/admin/login/')}"><span class="l">${icon('log-out', 14)}<span>Sign out</span></span></a>
</div>`
      : '';
  return `<aside class="sidebar" aria-label="${variant === 'admin' ? 'Operator console' : 'Client workspace'} navigation">
<div class="sb-head">
  ${brand(L(variant === 'admin' ? 'apps/admin/dashboard/' : 'apps/web/dashboard/'))}
  ${variant === 'admin' ? '<span class="sb-badge">OPERATOR CONSOLE</span>' : ''}
</div>
<nav class="sb-nav">${items}</nav>
${foot}</aside>`;
}

function topbar(route, { crumbs, variant }) {
  const L = (t) => linkTo(route, t);
  const crumbHtml = crumbs
    .map((c, i) => {
      const last = i === crumbs.length - 1;
      return `${i ? icon('chevron-right', 12) : ''}${last ? `<b>${esc(c.l)}</b>` : `<a href="${c.href ? L(c.href) : '#'}">${esc(c.l)}</a>`}`;
    })
    .join('');
  const actions =
    variant === 'admin'
      ? `<div class="topsearch"><span class="in-icon">${icon('search', 13)}</span><input placeholder="Search pages…"><span class="kbd">⌘K</span></div>
    <button class="icobtn" title="Notifications">${icon('bell', 15)}<span class="bdg">33+</span></button>
    <a class="icobtn" href="${L('apps/admin/messages/inbox/')}" title="Messages">${icon('message', 15)}<span class="bdg">21</span></a>
    <a class="icobtn" href="${L('apps/admin/moderation/')}" title="Trust &amp; safety">${icon('shield', 15)}</a>
    <a class="userchip" href="${L('apps/admin/profile/')}"><span class="avatar" style="background:#123A37;color:#fff">RK</span><span class="nm">Riya Kapoor</span>${icon('chevrons-up-down', 12)}</a>
    <button class="icobtn" data-theme-toggle title="Theme">${icon('sun', 15)}</button>`
      : `<div class="topsearch"><span class="in-icon">${icon('search', 13)}</span><input placeholder="Search"><span class="kbd">⌘K</span></div>
    <button class="icobtn" data-theme-toggle title="Theme">${icon('sun', 15)}</button>
    <a class="icobtn" href="${L('apps/web/messages/inbox/')}" title="Messages">${icon('message', 15)}<span class="bdg">9</span></a>
    <a class="icobtn" href="${L('apps/web/notifications/')}" title="Notifications">${icon('bell', 15)}<span class="bdg">32</span></a>
    <a class="userchip" href="${L('apps/web/profile/')}"><span class="avatar" style="background:var(--brand-3);color:var(--brand-11)">AI</span><span class="nm">Ananya Iyer</span>${icon('chevrons-up-down', 12)}</a>`;
  return `<header class="topbar">
  <button class="btn-icon btn sm" title="Back">${icon('chevron-left', 15)}</button>
  <nav class="crumbs" aria-label="Breadcrumb">${crumbHtml}</nav>
  <div class="flex items-center gap-1 ml-auto shrink-0">${actions}</div>
</header>`;
}

export function appPage({ route, title, desc, body, crumbs, app, homeCrumb }) {
  const nav = app === 'admin' ? ADMIN_NAV : WEB_NAV;
  const allCrumbs = crumbs || [{ l: homeCrumb || 'Dashboard', href: app === 'admin' ? 'apps/admin/dashboard/' : 'apps/web/dashboard/' }, { l: title.split('·')[0].trim() }];
  return doc({
    route, title, desc, bodyClass: '',
    body: `<div class="shell">
${sidebar(route, nav, app === 'admin' ? 'admin' : 'web')}
<div class="main">
${topbar(route, { crumbs: allCrumbs, variant: app === 'admin' ? 'admin' : 'web' })}
<main id="main" class="content">${body}</main>
<footer class="page-foot">© 2026 Nestlancer${app === 'admin' ? ' Admin' : ''} · Prototype build dir-html/1.0</footer>
</div></div>`,
    fabApp: app,
  });
}

// --------------------------------------------------------------- auth pages
export function authShowcase(route) {
  return `<aside class="auth-rail"><div class="auth-rail-inner">
<div class="pill" style="align-self:flex-start"><span class="dot"></span> Client portal · live</div>
<div>
  <div class="eyebrow mb-3"><span class="dot"></span> FIG · PORTAL</div>
  <h2 class="h-display" style="font-size:clamp(34px,3.6vw,52px);color:#12302C">Your delivery OS —<br><span class="grad">from brief to payout.</span></h2>
  <p class="lead mt-4" style="max-width:46ch;color:#4E5D58">Same studio surface as the public site: engineered panels, teal signal, and money you can read at a glance — after you sign in.</p>
</div>
<div class="demo-card" style="max-width:520px">
  <div class="dc-top"><i style="background:#F7675D"></i><i style="background:#F5B544"></i><i style="background:#37C262"></i><span class="ml-2">project-hub · NL-204</span><span class="ml-auto mono">68%</span></div>
  <div style="padding:18px 18px 16px">
    <div class="eyebrow">NL-204 · Milestone 3</div>
    <div class="flex items-center justify-between mt-2 mb-2"><b style="font-size:15.5px;letter-spacing:-.02em">Frontend — SaaS Landing Redesign</b></div>
    <div class="flex items-center gap-2 mb-3">
      <span class="badge tone-info">In progress</span><span class="badge tone-success">Deposit paid</span>
      <span class="mono font-semibold ml-auto" style="font-size:13px">₹48,000</span>
    </div>
    <div class="prog grad mb-3"><i style="width:68%"></i></div>
    <div class="flex items-start gap-3" style="padding:10px 0;border-top:1px solid #EDF0EE">
      <span class="avatar" style="background:#DCF3EF;color:#0B6660">NL</span>
      <div><b style="font-size:12.5px">Staging build pushed</b><div class="text-xs dim">14 min ago · deliverable linked</div></div>
    </div>
    <div class="flex items-start gap-3" style="padding:10px 0 0;border-top:1px solid #EDF0EE">
      <span class="avatar" style="background:#F3E8D7;color:#8A5A1D">RH</span>
      <div><b style="font-size:12.5px">Rahul: Hero CTA above the fold?</b><div class="text-xs dim">1h ago · thread</div></div>
    </div>
  </div>
</div>
<div class="auth-mini-grid">
  <div class="auth-mini"><b>Project Hub</b><span>Milestones, files, and threads in one surface.</span></div>
  <div class="auth-mini"><b>Milestone payments</b><span>Pay deposit, mid, and final as work is approved.</span></div>
  <div class="auth-mini"><b>Razorpay / UPI</b><span>Tabular money — deposits and payouts clear.</span></div>
</div>
</div></aside>`;
}

export function authSplitPage({ route, title, desc, form, foot }) {
  const L = (t) => linkTo(route, t);
  return doc({
    route, title, desc, bodyClass: 'mkt-body',
    body: `<div class="auth-split">
<div class="auth-left">
  <div class="flex items-center justify-between">${brand(L('apps/web/'))}<span class="pill">${icon('laptop', 13)}</span></div>
  <div class="auth-form">${form}</div>
  <div class="text-center text-sm dim" style="padding-bottom:6px"><a class="link" href="${L('apps/web/terms/')}">Terms</a> · <a class="link" href="${L('apps/web/privacy/')}">Privacy</a></div>
</div>
${authShowcase(route)}
</div>`,
    fabApp: 'web',
  });
}

export function authCenterPage({ route, title, desc, card, foot }) {
  const L = (t) => linkTo(route, t);
  return doc({
    route, title, desc,
    body: `<div class="auth-center">
<div class="flex-col items-center gap-2 mb-5">${brand(L('apps/admin/login/'))}<span class="sb-badge">OPERATOR CONSOLE</span></div>
${card}
${foot || ''}
</div>`,
    fabApp: 'admin',
  });
}

// ------------------------------------------------------------- page helpers
export function phead({ eyebrow, title, sub, actions, badges = '' }) {
  return `<div class="phead">
<div class="min-w-0">
  ${eyebrow ? `<div class="eyebrow"><span class="dot"></span>${esc(eyebrow)}</div>` : ''}
  ${title ? `<h1 class="ptitle">${title}</h1>` : ''}
  ${sub ? `<p class="psub">${sub}</p>` : ''}
</div>
<div class="phead-actions">${badges}${actions || ''}</div>
</div>`;
}

export const backlink = (route, href, label) =>
  `<a href="${linkTo(route, href)}" class="link-arrow mb-3" style="font-size:12.5px">${icon('arrow-left', 13)} ${esc(label)}</a>`;
