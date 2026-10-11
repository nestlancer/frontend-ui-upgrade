// ============================================================================
// ROUTES — apps/landing (marketing site = nestlancer.com)
// Copy is VERIFIED against the live site (fetched 2026-10-11) and the
// original screenshots in Nestlancer-public-screenshots/. Do not add copy
// that is not on the live pages; mark illustrative previews as such.
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { panel, cover, table } from '../lib/comps.mjs';
import { WORKS, POSTS, BLOG_COUNTS } from './data.mjs';

const pageHero = (fig, title, lead) => `
<section style="padding:56px 0 36px"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-4"><span class="dot"></span>${fig}</div>
  <h1 class="h1" style="max-width:22ch">${title}</h1>
  ${lead ? `<p class="lead mt-4" style="max-width:62ch">${lead}</p>` : ''}
</div></section>`;

const ctaRegister = (r, label = 'Start a project') =>
  `<a class="btn btn-primary btn-lg" href="${LT(r, 'apps/web/register/')}">${label} ${icon('arrow-right', 15)}</a>`;

// Packages — identical on /pricing and /services (live site, verified).
const PACKAGES = [
  { t: 'Web Application MVP', d: 'End-to-end MVP delivery: discovery, design, frontend and backend, QA, and production handoff.',
    price: '₹59,000', sub: '≈ 30 days', items: ['Discovery & requirements workshop', 'UI/UX for core screens', 'Frontend + backend API', 'QA, deployment & handoff', '2 revision rounds included'],
    cta: 'Start this package', popular: true, to: 'apps/web/register/' },
  { t: 'Custom project', d: 'Mobile apps, e-commerce, design systems, and complex product builds — priced after your request.',
    price: 'Custom quote', sub: 'Scoped per brief', items: ['Tailored scope & timeline', 'Milestone payment schedule', 'Dedicated studio delivery', 'Progress tracking in-app', 'Invoices & receipts'],
    cta: 'Request a quote', to: 'apps/web/register/' },
  { t: 'Talk to the studio', d: 'Not sure which engagement fits? Share your goals and we will recommend a package or custom plan.',
    price: 'Free consult', sub: 'Reply in 1 business day', items: ['No subscription required', 'Transparent line-item quotes', 'Razorpay milestone payments', 'Portfolio references'],
    cta: 'Contact us', to: 'apps/landing/contact/' },
];

const packageCard = (r, p) => `
<div class="mkt-card" style="padding:26px;display:flex;flex-direction:column;${p.popular ? 'border-top:3px solid var(--brand-8)' : ''}">
  ${p.popular ? '<span class="badge tone-success mb-3" style="align-self:flex-start">Popular</span>' : ''}
  <div class="h3">${p.t}</div>
  <p class="text-sm muted mt-2" style="line-height:1.65">${p.d}</p>
  <div class="mt-5" style="font-size:30px;font-weight:700;letter-spacing:-.03em">${p.price}</div>
  <div class="text-xs dim mt-1">${p.sub}</div>
  <div class="divider my-4"></div>
  ${p.items.map((f) => `<div class="flex gap-2 mb-2" style="font-size:13.5px"><span style="color:var(--t-success-dot);margin-top:1px">${icon('check', 13)}</span><span>${f}</span></div>`).join('')}
  <a class="link-arrow mt-auto" style="padding-top:18px" href="${LT(r, p.to)}">${p.cta} ${icon('arrow-right', 13)}</a>
</div>`;

const faqs = [
  ['Is Nestlancer a subscription product?', 'No. Nestlancer sells studio engagements — transparent packages and custom quotes with milestone payment schedules, not a recurring SaaS subscription for delivery work.'],
  ['How do milestone payments work?', 'After you submit a request, the studio sends a line-item quote with a deposit / mid / final (or equivalent) schedule. You pay milestones securely via Razorpay and approve deliverables as work ships.'],
  ['What is included in the Web Application MVP package?', 'Discovery and requirements, UI/UX for core screens, frontend and backend API, QA, deployment and handoff, plus revision rounds as listed on the pricing page.'],
  ['Can you work with international clients?', 'Yes. Nestlancer serves clients in India and internationally (including the US, UK, UAE, and worldwide remote engagements), with replies typically within one business day IST.'],
];

// ---------------------------------------------------------------- HOME
const workCard = (r, w, i) => `
<a href="${LT(r, 'apps/landing/portfolio/[id]/')}" class="mkt-card reveal" style="overflow:hidden;display:block;--d:${i * 60}ms">
  ${cover(w.sector.toUpperCase(), w.v, 'padding-top:50%')}
  <div style="padding:16px 18px">
    <div class="eyebrow" style="font-size:10px">${w.sector.toUpperCase()}</div>
    <div class="font-bold mt-1" style="font-size:15px;letter-spacing:-.02em">${w.t}</div>
    <div class="text-sm muted mt-1" style="line-height:1.55">${w.result}</div>
    <div class="text-xs dim mono mt-3" style="letter-spacing:.04em">${w.tags.join(' · ')}</div>
  </div>
</a>`;

const home = (r) => `
<section class="mkt-section" style="padding-top:56px"><div class="mkt-wrap">
  <div class="flex-col items-center text-center" style="max-width:820px;margin:0 auto">
    <div class="pill mb-5"><span class="dot"></span> Intake open</div>
    <h1 class="h-display">Ship with clients <span class="grad">in the loop</span> — and money under control.</h1>
    <p class="lead mt-5" style="max-width:56ch">Nestlancer fuses a dedicated product studio with an operating system for delivery: fixed-price quotes, milestone payments, live Project Hub, and Razorpay / UPI.</p>
    <div class="flex gap-3 mt-6 justify-center flex-wrap">
      ${ctaRegister(r)}
      <a class="btn btn-secondary btn-lg" href="#how-it-works">Tour the product</a>
    </div>
  </div>
  <div class="mt-10 reveal">
    <div class="mkt-card" style="overflow:hidden;border-radius:16px">
      <div style="height:38px;display:flex;align-items:center;gap:6px;padding:0 14px;border-bottom:1px solid var(--paper-line);background:var(--paper)">
        <i class="dot" style="background:#F7675D"></i><i class="dot" style="background:#F5B544"></i><i class="dot" style="background:#37C262"></i>
        <span class="mono text-xs dim ml-2">project-hub · NL-204</span>
        <span class="mono text-xs ml-auto brand-text">68%</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 240px;min-height:260px">
        <div style="padding:18px;border-right:1px solid var(--paper-line)">
          <div class="eyebrow">NL-204 · Milestone 3</div>
          <div class="font-bold mt-2" style="font-size:15px;letter-spacing:-.02em">Frontend development — SaaS Landing Redesign</div>
          <div class="flex gap-2 mt-2 mb-3"><span class="badge tone-info">In progress</span><span class="badge tone-success">Deposit paid</span><span class="mono font-semibold ml-auto">Due Fri · ₹48,000</span></div>
          <div class="prog grad mb-4"><i class="bar" style="width:68%"></i></div>
          <div class="panel-row" style="padding:10px 2px"><span class="avatar" style="width:24px;height:24px;font-size:9px;background:#DCF3EF;color:#0B6660">NL</span><div class="min-w-0"><b style="font-size:12.5px">Staging build pushed</b><div class="text-xs dim">14 min ago · deliverable linked</div></div></div>
          <div class="panel-row" style="padding:10px 2px"><span class="avatar" style="width:24px;height:24px;font-size:9px;background:#F3E8D7;color:#8A5A1D">RH</span><div class="min-w-0"><b style="font-size:12.5px">Rahul: Hero CTA above the fold?</b><div class="text-xs dim">1h ago · thread</div></div></div>
        </div>
        <div style="padding:18px">
          <div class="eyebrow mb-3">nl status — NL-204</div>
          ${[['✓','Discovery complete','success'],['✓','UI Design complete','success'],['→','Frontend 68% active','info'],['○','QA & handoff pending','neutral']].map(([g,t,tn]) => `<div class="flex items-center gap-2 mb-3" style="font-size:13px"><span class="badge tone-${tn}" style="min-width:22px;justify-content:center">${g}</span>${t}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="text-xs dim mono mt-2" style="text-align:right">Illustrative Project Hub preview</div>
  </div>
  <div class="flex items-center justify-center gap-6 mt-8 flex-wrap" style="opacity:.75">${['HealthTech','Fintech','E-commerce','SaaS','B2B portals','Mobile apps','Design systems','Marketplaces'].map((s) => `<span class="mono text-xs dim uppercase" style="letter-spacing:.14em">${s}</span>`).join('<span class="dim">·</span>')}</div>
</div></section>

<section class="mkt-section" id="how-it-works"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 02 · DELIVERY NARRATIVE</div>
  <h2 class="h2 mb-3">From brief to release — one continuous surface.</h2>
  <p class="muted mb-8" style="font-size:14.5px;line-height:1.65">Every marketing claim is a real Project Hub state your client can open.</p>
  <div class="grid g4 gap-5">
    ${[['02.1 Request','Scoped intake, not a ticket black hole','Category, budget band, timeline, and files — structured so quotes aren’t written from Slack archaeology.','send'],
       ['02.2 Quote','Fixed-price line items with milestones','Transparent breakdown. Accept locks scope. Revisions stay attached to the milestone that owns them.','receipt'],
       ['02.3 Build','Live progress, files, and messages','Stakeholders see status without chasing updates. Studio ships; clients approve in context.','activity'],
       ['02.4 Pay & release','Milestone pay with Razorpay / UPI','Deposit → milestone → final. Invoice PDFs at every payment gate.','card']]
      .map(([k, t, d, i], ix) => `<div class="mkt-card reveal" style="padding:22px;--d:${ix * 80}ms"><span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i, 15)}</span><div class="eyebrow mt-4" style="font-size:10px">${k}</div><div class="font-bold mt-2" style="font-size:15px;letter-spacing:-.015em">${t}</div><p class="text-sm muted mt-2" style="line-height:1.6">${d}</p></div>`).join('')}
  </div>
  <div class="grid g2 gap-6 mt-8">
    <div class="mkt-card" style="padding:22px">
      <div class="eyebrow mb-3">Milestone timeline · NL-204</div>
      ${[['Discovery','Brief locked · deposit paid','success'],['UI Design','Approved · files in Hub','success'],['Frontend','68% · in progress','info'],['QA & release','Pending final milestone','neutral']]
        .map(([t, s, tn]) => `<div class="flex justify-between items-center" style="padding:9px 0;border-bottom:1px solid var(--paper-line)"><div><b style="font-size:13.5px">${t}</b><div class="text-xs dim">${s}</div></div><span class="badge tone-${tn}">${tn === 'success' ? 'Done' : tn === 'info' ? 'Active' : 'Queued'}</span></div>`).join('')}
    </div>
    <div class="mkt-card" style="padding:22px">
      <div class="eyebrow mb-1">Money surface</div>
      <div class="text-xs dim mono mb-3">Preview · illustrative</div>
      <div class="h2" style="font-size:24px">Financial clarity for every milestone.</div>
      <p class="text-sm muted mt-2" style="line-height:1.6">Milestone gates, tabular ₹, and India rails — finance your team can audit.</p>
      <div class="divider my-4"></div>
      ${[['Milestone 2 — Design','Paid · ₹29,500','success'],['Milestone 3 — Frontend','Pending · ₹48,000','warning'],['Final payment','Due · ₹62,000','neutral']]
        .map(([t, s, tn]) => `<div class="flex justify-between items-center" style="padding:7px 0"><div class="font-semibold" style="font-size:13.5px">${t}</div><span class="badge tone-${tn}">${s}</span></div>`).join('')}
      <div class="text-xs dim mt-3">Checkout rails: Razorpay · Bank · UPI · Preview, not a live checkout</div>
    </div>
  </div>
</div></section>

<section class="mkt-section"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 04 · WHY NESTLANCER</div>
  <h2 class="h2 mb-2">Engineered for delivery, not marketplace noise.</h2>
  <div class="text-xs dim mono mb-6">Preview · illustrative</div>
  <div class="grid g3 gap-5">
    ${[['Milestone payouts','Razorpay milestones — deposit, mid, final.','₹4.2L'],['Reply under 2m','Typical studio response on active threads.',''],['Fixed-price only','No hourly fog. Scope locks on accept.',''],
       ['Command density','Search jumps across Hub, quotes, pay.',''],['Deliverable gates','Payment gates tied to approvals.',''],['Selective intake','Quality over volume — scoped studio work.','']]
      .map(([t, d, big], ix) => `<div class="mkt-card reveal" style="padding:22px;--d:${ix * 60}ms"><div class="font-bold" style="font-size:15px">${t}</div>${big ? `<div class="mono mt-3" style="font-size:30px;font-weight:700;letter-spacing:-.03em;color:var(--brand-11)">${big}</div>` : ''}<div class="text-sm muted mt-2" style="line-height:1.55">${d}</div></div>`).join('')}
  </div>
</div></section>

<section class="mkt-section"><div class="mkt-wrap">
  <div class="flex items-end justify-between mb-6">
    <div><div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 05 · SELECTED WORK</div><h2 class="h2">Work that speaks for itself.</h2></div>
    <a class="link-arrow" href="${LT(r, 'apps/landing/portfolio/')}">View all ${icon('arrow-right', 14)}</a>
  </div>
  <div class="grid g4 gap-5">${WORKS.slice(0, 8).map((w, i) => workCard(r, w, i)).join('')}</div>
</div></section>

<section class="mkt-section" style="padding-bottom:88px"><div class="mkt-wrap text-center">
  <div class="mkt-eyebrow mb-4 justify-center"><span class="dot"></span>FIG 06 · START</div>
  <h2 class="h-display" style="font-size:clamp(30px,3.6vw,46px)">Ready to ship with clarity?</h2>
  <p class="lead mt-4" style="max-width:48ch;margin:14px auto 0">Fixed-price studio work. Live Project Hub. Razorpay milestones. Intake is open.</p>
  <div class="flex items-center justify-center gap-4 mt-4 mono text-xs dim" style="letter-spacing:.06em"><span>✓ Reply in 24h</span><span>✓ Fixed-price quotes</span><span>✓ No subscription</span><span>✓ Made in India</span></div>
  <div class="flex gap-3 justify-center mt-7">
    ${ctaRegister(r)}
    <a class="btn btn-secondary btn-lg" href="${LT(r, 'apps/web/login/')}">Preview the portal</a>
  </div>
</div></section>`;

// ---------------------------------------------------------------- ABOUT
const about = (r) => `
${pageHero('Human connection', 'Clients &amp; studio, working as one', 'We built Nestlancer because product work deserves a calmer, more transparent way to collaborate with a dedicated studio.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="eyebrow mb-3">About Nestlancer</div>
  <h2 class="h2 mb-4">Nestlancer is a dedicated product studio.</h2>
  <p class="muted" style="font-size:15px;line-height:1.7;max-width:70ch">Clients work with one operator through a single workflow: request, quote, milestone payment, delivery. We believe great work happens when process gets out of the way.</p>
  <div class="grid g3 gap-5 mt-7">
    ${[['Web & apps','Full-stack product delivery','code'],['Design','UI/UX and brand systems','pen'],['One studio','Direct operator collaboration','user']].map(([t, d, i]) => `<div class="mkt-card" style="padding:22px"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i, 16)}</span><div class="eyebrow mt-4">${t}</div><div class="font-bold mt-1">${d}</div></div>`).join('')}
  </div>
</div></section>

<section class="mkt-section"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG · WORKFLOW</div>
  <h2 class="h2 mb-6">From brief to handoff</h2>
  <div class="grid g3 gap-5">
    ${[['01','Request','Share goals, scope, and timeline through the client portal.'],['02','Quote','Receive a line-item proposal with a clear payment schedule.'],['03','Build & pay','Pay milestones via Razorpay, approve deliverables, and track progress.']]
      .map(([n, t, d]) => `<div class="mkt-card" style="padding:24px"><div class="mono" style="font-size:26px;font-weight:700;color:var(--brand-11)">${n}</div><div class="font-bold mt-3" style="font-size:16px">${t}</div><p class="text-sm muted mt-2" style="line-height:1.65">${d}</p></div>`).join('')}
  </div>
</div></section>

<section class="mkt-section"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG · VALUES</div>
  <h2 class="h2 mb-6">What we believe</h2>
  <div class="grid g3 gap-5">
    ${[['Transparency first','Clear quotes, visible milestones, and no surprise fees.'],['Quality over volume','We’d rather deliver fewer projects exceptionally well.'],['Human by design','Technology should connect people, not replace the craft.']]
      .map(([t, d]) => `<div class="mkt-card" style="padding:24px"><div class="h3" style="font-size:17px">${t}</div><p class="text-sm muted mt-2" style="line-height:1.65">${d}</p></div>`).join('')}
  </div>
  <div class="mt-8">${ctaRegister(r)}</div>
</div></section>`;

// ---------------------------------------------------------------- SERVICES
const services = (r) => `
${pageHero('FIG · Services', 'Services', 'The same studio packages as Pricing — price, duration, and deliverables included.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid g3 gap-6">${PACKAGES.map((p) => packageCard(r, p)).join('')}</div>
</div></section>`;

// ---------------------------------------------------------------- PRICING
const pricing = (r) => `
${pageHero('FIG · Engagements', 'Clear engagements. No subscription trap.', 'Transparent studio packages and custom quotes — pay by milestone as work ships.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <p class="text-sm muted mb-8" style="max-width:70ch;line-height:1.7">Nestlancer prices project work — not SaaS seats. Packages and custom quotes use a clear milestone payment schedule (deposit, mid, final).</p>
  <div class="grid g3 gap-6">${PACKAGES.map((p) => packageCard(r, p)).join('')}</div>
</div></section>
<section class="mkt-section"><div class="mkt-wrap" style="max-width:860px">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG · FAQ</div>
  <h2 class="h2 mb-2">Pricing questions</h2>
  <p class="text-sm muted mb-6">How studio packages, milestones, and payments work.</p>
  ${faqs.map(([q, a]) => `<div class="mkt-card mb-4" style="padding:20px 22px"><div class="h3" style="font-size:15.5px">${q}</div><p class="text-sm muted mt-2" style="line-height:1.65">${a}</p></div>`).join('')}
</div></section>`;

// ---------------------------------------------------------------- CONTACT
const contact = (r) => `
${pageHero('FIG · Contact', 'Contact the studio', 'Sales, support, and partnership inquiries. Open the secure form on the Nestlancer app — we typically respond within one business day.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid g2 gap-8">
    <div class="mkt-card" style="padding:26px">
      <div class="h3">Open the secure form</div>
      <p class="text-sm muted mt-2" style="line-height:1.65">The marketing site hands off to the app contact form so spam protection and delivery stay in one place — no duplicate submissions.</p>
      <div class="mt-5"><a class="btn btn-primary btn-lg" href="${LT(r, 'apps/web/contact/')}">Open contact form ${icon('arrow-right', 15)}</a></div>
      <div class="divider my-6"></div>
      <div class="eyebrow mb-3">What to include</div>
      ${['What you want to ship (web, mobile, store, or something else)','Rough timeline and any hard launch date','Budget band, even a range','Links to references, a brief, or an existing product']
        .map((s) => `<div class="flex gap-2 mb-2" style="font-size:13.5px"><span style="color:var(--t-success-dot)">${icon('check', 13)}</span><span>${s}</span></div>`).join('')}
      <div class="flex gap-2 mt-4 flex-wrap"><span class="chip">Reply in 24h</span><span class="chip">Fixed-price</span><span class="chip">Made in India</span></div>
    </div>
    <div class="flex-col gap-5">
      ${panel({ title: 'Studio', pad: true, body: `
        <div class="flex items-center gap-3"><span class="avatar sq" style="background:var(--brand-2);color:var(--brand-11)">${icon('mail', 14)}</span><div><b style="font-size:13.5px">contact@nestlancer.com</b><div class="text-xs dim">Typical reply &lt; 24h · IST</div></div></div>` })}
      <div class="mkt-card" style="padding:22px">
        <div class="text-sm muted" style="line-height:1.6">Prefer to browse first? <a class="link-arrow" href="${LT(r, 'apps/landing/pricing/')}">See pricing</a> or <a class="link-arrow" href="${LT(r, 'apps/landing/services/')}">services</a>.</div>
      </div>
      <div class="mkt-card" style="padding:22px">
        ${[['Why is the form on the app?','The contact form is Turnstile-protected on the app host so spam checks and delivery live in one place. This page hands you off with any selected package already attached.'],
           ['How fast do you reply?','We typically reply within one business day, IST.'],
           ['Do I need an account?','No. You can send a message as a guest. Creating an account is only required when you are ready to request a quote or start a project.']]
          .map(([q, a]) => `<div class="mb-4"><b style="font-size:13.5px">${q}</b><p class="text-sm muted mt-1" style="line-height:1.6">${a}</p></div>`).join('')}
      </div>
    </div>
  </div>
</div></section>`;

// ---------------------------------------------------------------- PORTFOLIO
const portfolio = (r) => `
${pageHero('FIG · Work', 'Selected work', 'Case studies in sequence — product language, stack, and outcomes. Open a card for the full case study.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="text-xs dim mono mb-6">8 projects/2026</div>
  <div class="grid g3 gap-5">
    ${WORKS.map((w, i) => `
    <a href="${LT(r, 'apps/landing/portfolio/[id]/')}" class="mkt-card reveal" style="overflow:hidden;display:block;--d:${(i % 3) * 70}ms">
      ${cover(w.sector.toUpperCase(), w.v, 'padding-top:52%', '0' + (i + 1))}
      <div style="padding:18px">
        <div class="flex items-center justify-between"><span class="eyebrow" style="font-size:10px">${w.sector.toUpperCase()}</span><span class="mono text-xs dim">${w.date}${w.featured ? ' · Featured' : ''}</span></div>
        <div class="font-bold mt-2" style="font-size:15px;letter-spacing:-.02em">${w.t}</div>
        <div class="text-sm muted mt-2" style="line-height:1.55">${w.result}</div>
        <div class="flex gap-2 mt-3 flex-wrap">${w.tags.map((t) => `<span class="chip" style="height:22px;font-size:11px">${t}</span>`).join('')}</div>
        <div class="link-arrow mt-4" style="font-size:13px">View case study ${icon('arrow-right', 13)}</div>
      </div>
    </a>`).join('')}
  </div>
  <div class="mkt-card mt-10" style="padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
    <div><b class="h3">Want work like this?</b><p class="text-sm muted mt-1">Tell us about the product. We will come back with a scoped studio quote.</p></div>
    <a class="btn btn-primary" href="${LT(r, 'apps/landing/contact/')}">Start a project</a>
  </div>
</div></section>`;

// Case study template (verified against the Fintech Payments Hub page).
const caseStudy = (r) => `
<section style="padding:40px 0 20px"><div class="mkt-wrap" style="max-width:920px">
  <a class="link-arrow" href="${LT(r, 'apps/landing/portfolio/')}">← Portfolio</a>
  <div class="eyebrow mt-6">E-Commerce</div>
  <h1 class="h1 mt-2">Fintech Payments Hub</h1>
  <p class="lead mt-3">Unified payouts and reconciliation for a lending platform.</p>
  <div class="text-xs dim mono mt-3">Oct 2026 / PayFlow Lending</div>
  <div class="flex gap-2 mt-4 flex-wrap">${['nestjs', 'razorpay', 'postgresql', 'queues'].map((t) => `<span class="chip">${t}</span>`).join('')}</div>
</div></section>
<section class="mkt-section" style="padding-top:12px"><div class="mkt-wrap" style="max-width:920px">
  <div class="mkt-card" style="padding:28px">
    <div class="eyebrow mb-2">Overview</div>
    <h2 class="h3">What we shipped</h2>
    <p class="muted mt-2" style="line-height:1.7">Designed and shipped a payments hub that normalizes Razorpay webhooks, idempotent payouts, and daily reconciliation exports for finance ops.</p>
    <h2 class="h3 mt-6">Outcomes</h2>
    <ul class="mt-2 muted" style="line-height:1.8;padding-left:18px">
      <li>Zero duplicate payouts under replayed webhooks</li>
      <li>Finance-ready settlement CSV in under 5 minutes</li>
      <li>Clear audit trail for every ledger movement</li>
    </ul>
  </div>
  <div class="grid g2 gap-5 mt-5">
    <div class="mkt-card" style="padding:24px"><div class="eyebrow mb-2">Client review</div><p style="font-size:16px;line-height:1.6">“Reconciliation stopped being a weekly fire drill.”</p><div class="text-xs dim mt-3">VP Engineering, PayFlow</div></div>
    <div class="mkt-card" style="padding:24px"><div class="eyebrow mb-2">Client</div><div class="font-bold">PayFlow Lending</div><div class="text-sm muted mt-1">Fintech</div><div class="eyebrow mt-4 mb-2">Tech stack</div><div class="text-sm muted">NestJS · PostgreSQL · RabbitMQ · Razorpay</div></div>
  </div>
  <div class="mkt-card mt-5" style="padding:24px 28px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
    <div><b class="h3">Interested in similar work?</b><p class="text-sm muted mt-1">Tell us about your project — we can scope something inspired by this case study.</p></div>
    <a class="btn btn-primary" href="${LT(r, 'apps/landing/contact/')}">Start a similar project</a>
  </div>
</div></section>`;

// ---------------------------------------------------------------- BLOG
const cat = (p) => p.cat;
const blogList = (r) => `
<section style="padding:44px 0 24px"><div class="mkt-wrap" style="display:grid;grid-template-columns:200px 1fr;gap:40px">
  <aside>
    <div class="eyebrow mb-3">Categories</div>
    ${[['All articles', BLOG_COUNTS.all], ['Business', BLOG_COUNTS.Business], ['Case Studies', BLOG_COUNTS['Case Studies']], ['Design', BLOG_COUNTS.Design], ['Technology', BLOG_COUNTS.Technology]]
      .map(([l, c], i) => `<div class="flex justify-between text-sm" style="padding:8px 10px;border-radius:8px;${i === 0 ? 'background:var(--brand-1);font-weight:600' : 'color:var(--ink-2)'}"><span>${l}</span><span class="mono text-xs dim">${c}</span></div>`).join('')}
    <div class="eyebrow mt-6 mb-3">Tools</div>
    <div class="flex gap-2"><span class="chip">RSS</span><a class="chip" href="${LT(r, 'apps/web/blog/bookmarks/')}">Bookmarks</a></div>
  </aside>
  <div>
    <div class="flex items-end justify-between flex-wrap gap-4">
      <div><h1 class="h1">Latest articles</h1><p class="lead mt-3" style="max-width:60ch">Hiring playbooks, engineering deep-dives, and studio insights — filtered by category.</p></div>
      <input class="input" placeholder="Search posts…" style="width:260px">
    </div>
    <div class="mkt-card mt-6" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
      <div><b>Ready to start a project?</b><div class="text-sm muted">Create a client account and submit your brief to the Nestlancer studio.</div></div>
      <a class="btn btn-primary" href="${LT(r, 'apps/landing/contact/')}">Contact us →</a>
    </div>
    <div class="flex justify-between items-baseline mt-8 mb-3"><h2 class="h3">Featured &amp; latest</h2><span class="mono text-xs dim">Showing 1–12 of 110</span></div>
    <a href="${LT(r, 'apps/landing/blog/[slug]/')}" class="mkt-card" style="display:block;overflow:hidden;padding:0">
      ${cover('CASE STUDIES', 1, 'padding-top:40%')}
      <div style="padding:22px 24px">
        <span class="badge tone-danger">Featured</span>
        <div class="eyebrow mt-3">${POSTS[0].cat.toUpperCase()}</div>
        <div class="h2 mt-2" style="font-size:24px">${POSTS[0].t}</div>
        <p class="text-sm muted mt-2">${POSTS[0].excerpt}</p>
        <div class="flex justify-between mt-4 text-xs dim"><span>Nestlancer Editorial</span><span class="mono">${POSTS[0].min} min read · ${POSTS[0].views} views</span></div>
      </div>
    </a>
    <div class="grid g3 gap-4 mt-5">
      ${POSTS.slice(1).map((p, i) => `<a href="${LT(r, 'apps/landing/blog/[slug]/')}" class="mkt-card reveal" style="display:block;overflow:hidden;padding:0;--d:${(i % 3) * 60}ms">
        ${cover(p.cat.toUpperCase(), (i % 6) + 1, 'padding-top:50%')}
        <div style="padding:16px 18px">
          <div class="eyebrow" style="font-size:10px">${p.cat.toUpperCase()}</div>
          <div class="font-bold mt-1" style="font-size:15px;line-height:1.35">${p.t}</div>
          <div class="text-sm muted mt-2" style="line-height:1.55">${p.excerpt}</div>
          <div class="flex justify-between mt-3 text-xs dim"><span>Nestlancer Editorial</span><span class="mono">${p.min} min read · ${p.views || 1} views</span></div>
        </div>
      </a>`).join('')}
    </div>
    <div class="flex gap-2 mt-8 justify-center">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<span class="btn btn-secondary btn-sm" style="min-width:36px;${n === 1 ? 'background:var(--brand-9);color:#fff' : ''}">${n}</span>`).join('')}<span class="btn btn-secondary btn-sm">Next</span></div>
    <div class="mkt-card mt-10" style="padding:26px 28px">
      <div class="eyebrow">Stay in the loop</div>
      <div class="h2 mt-2" style="font-size:24px">Ideas for product teams and studio clients</div>
      <p class="text-sm muted mt-2" style="max-width:60ch">Get practical playbooks on hiring, delivery, and growing your practice. We publish sparingly — only when there is something worth your time.</p>
      <div class="flex gap-3 mt-4"><a class="btn btn-primary" href="${LT(r, 'apps/landing/contact/')}">Get in touch</a><span class="btn btn-secondary">RSS feed</span></div>
    </div>
  </div>
</div></section>`;

const article = (r) => `
<section style="padding:40px 0 10px"><div class="mkt-wrap" style="max-width:780px">
  <div class="flex justify-between text-xs dim"><a class="link-arrow" href="${LT(r, 'apps/landing/blog/')}">← Back to articles</a><span class="mono">2 min read · 4 views</span></div>
  <h1 class="h1 mt-6">Cutting Deploy Time from 45 Minutes to Five</h1>
  <p class="lead mt-4">CI caching, smaller artifacts, and service-level pipelines after monolith split.</p>
  <div class="flex items-center gap-3 mt-5"><span class="avatar" style="background:var(--brand-2);color:var(--brand-11)">NE</span><div><b style="font-size:14px">Nestlancer Editorial</b><div class="text-xs dim">Oct 5, 2026 · 2 min read · 2 comments</div></div></div>
  ${cover('CASE STUDIES', 1, 'padding-top:46%', '').replace('class="', 'class="mt-6 ')}
</div></section>
<section class="mkt-section" style="padding-top:8px"><article class="mkt-wrap" style="max-width:780px;line-height:1.75;font-size:16px">
  <p class="muted">The team prioritized <b>operational ownership</b> while migrating on a Nestlancer-style stack — gateway at the edge, domain NestJS services, Prisma on Postgres, async work through RabbitMQ, and media on Backblaze B2.</p>
  <h2 class="h3 mt-8">Where we started</h2>
  <p class="muted">The team inherited a single pipeline building every service on each commit. The triggering incident was clear: hotfix queue depth grew while waiting for unrelated image builds. Leadership funded the refactor when customer-visible latency and support load rose together — not when the diagram looked messy.</p>
  <h2 class="h3 mt-8">Architecture before</h2>
  <ul class="muted"><li>Single deploy artifact coupling unrelated domains</li><li>Synchronous cross-module HTTP with partial timeouts</li><li>Mixed read/write traffic on one database primary</li><li>Ad-hoc file storage complicating virus scan and CDN caching</li></ul>
  <h2 class="h3 mt-8">Migration timeline</h2>
  <p class="muted"><b>Discovery.</b> Mapped the single pipeline and inventoried which routes could move behind the gateway without user-visible changes.</p>
  <p class="muted"><b>Strangler cutover.</b> Routed new traffic through NestJS handlers while legacy paths drained over 12 weeks.</p>
  <p class="muted"><b>Reliability hardening.</b> Added gateway, Prisma with explicit SLOs owned by a 9-engineer platform squad.</p>
  <p class="muted"><b>Stabilize and learn.</b> Ran game days for DLQ replay, replica lag failover, and presigned upload expiry edge cases.</p>
  <h2 class="h3 mt-8">Results</h2>
  <ul class="muted"><li>Path-filtered CI and per-service images cut deploy time to five minutes</li><li>On-call pages for queue backlog fell after outbox lag dashboards went live</li><li>Product teams could ship blog and portfolio changes without redeploying payments</li><li>Support tickets citing 'stale listings' dropped once read paths moved to replicas</li></ul>
  <h2 class="h3 mt-8">Lesson</h2>
  <p class="muted">Microservices did not arrive on day one. The team earned splits by proving <b>operational ownership</b> per domain — not by copying a reference diagram.</p>
  <div class="flex gap-2 mt-6"><span class="chip">#NestJS</span><span class="chip">#Node.js</span></div>
  <div class="flex gap-3 mt-6 text-sm dim"><span>Like</span><span>Bookmark</span></div>
</article></section>
<section class="mkt-section"><div class="mkt-wrap">
  <h2 class="h3 mb-4">Related posts</h2>
  <div class="grid g3 gap-4">${POSTS.slice(1, 4).map((p) => `<a class="mkt-card" style="padding:18px;display:block" href="${LT(r, 'apps/landing/blog/[slug]/')}"><div class="eyebrow" style="font-size:10px">${p.cat.toUpperCase()}</div><div class="font-bold mt-2" style="font-size:14.5px;line-height:1.35">${p.t}</div><div class="text-xs dim mono mt-2">${p.min} min read</div></a>`).join('')}</div>
</div></section>`;

// ---------------------------------------------------------------- export
export default [
  { path: 'apps/landing/', title: 'Nestlancer — Your dedicated studio — from brief to delivery', active: 'home', body: (r) => home(r) },
  { path: 'apps/landing/about/', title: 'About · Nestlancer', active: 'about', body: (r) => about(r) },
  { path: 'apps/landing/services/', title: 'Services · Nestlancer', active: 'services', body: (r) => services(r) },
  { path: 'apps/landing/pricing/', title: 'Pricing · Nestlancer', active: 'pricing', body: (r) => pricing(r) },
  { path: 'apps/landing/contact/', title: 'Contact · Nestlancer', active: 'contact', body: (r) => contact(r) },
  { path: 'apps/landing/portfolio/', title: 'Portfolio · Nestlancer', active: 'portfolio', body: (r) => portfolio(r) },
  { path: 'apps/landing/portfolio/[id]/', title: 'Fintech Payments Hub · Nestlancer', active: 'portfolio', body: (r) => caseStudy(r) },
  { path: 'apps/landing/blog/', title: 'Blog · Nestlancer', active: 'blog', body: (r) => blogList(r) },
  { path: 'apps/landing/blog/[slug]/', title: 'Cutting Deploy Time from 45 Minutes to Five · Nestlancer', active: 'blog', body: (r) => article(r) },
];
