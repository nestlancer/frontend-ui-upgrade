// ============================================================================
// ROUTES — apps/landing (port 9020) — marketing site
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, stats as statRow, panel, note, cover, tabs, table } from '../lib/comps.mjs';
import { phead } from '../lib/chrome.mjs';
import { POSTS, WORKS } from './data.mjs';

const heroDemo = `
<div class="mkt-card" style="overflow:hidden;border-radius:16px">
  <div style="height:38px;display:flex;align-items:center;gap:6px;padding:0 14px;border-bottom:1px solid var(--paper-line);background:var(--paper)">
    <i class="dot" style="background:#F7675D"></i><i class="dot" style="background:#F5B544"></i><i class="dot" style="background:#37C262"></i>
    <span class="mono text-xs dim ml-2">app.nestlancer.com · project-hub</span>
    <span class="mono text-xs ml-auto brand-text">NL-204 · 68%</span>
  </div>
  <div style="display:grid;grid-template-columns:170px 1fr 220px;min-height:260px">
    <div style="background:#12201F;padding:14px 10px">
      ${['Overview','Milestones','Deliverables','Files','Payments','Messages'].map((l,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;font-size:11.5px;font-weight:550;${i===1?'background:rgba(255,255,255,.12);color:#fff':'color:#9DB4AF'}">${icon(['grid','layers','check-circle','file-text','card','message'][i],12)}<span>${l}</span></div>`).join('')}
    </div>
    <div style="padding:18px;border-right:1px solid var(--paper-line)">
      <div class="eyebrow">NL-204 · Milestone 3</div>
      <div class="font-bold mt-2" style="font-size:15px;letter-spacing:-.02em">Frontend — SaaS Landing Redesign</div>
      <div class="flex gap-2 mt-2 mb-3"><span class="badge tone-info">In progress</span><span class="badge tone-success">Deposit paid</span><span class="mono font-semibold ml-auto">₹48,000</span></div>
      <div class="prog grad mb-4"><i style="width:68%"></i></div>
      <div class="panel-row" style="padding:10px 2px"><span class="avatar" style="width:24px;height:24px;font-size:9px;background:#DCF3EF;color:#0B6660">NL</span><div class="min-w-0"><b style="font-size:12.5px">Staging build pushed</b><div class="text-xs dim">14 min ago · deliverable linked</div></div></div>
      <div class="panel-row" style="padding:10px 2px"><span class="avatar" style="width:24px;height:24px;font-size:9px;background:#F3E8D7;color:#8A5A1D">RH</span><div class="min-w-0"><b style="font-size:12.5px">Rahul: Hero CTA above the fold?</b><div class="text-xs dim">1h ago · thread</div></div></div>
    </div>
    <div style="padding:18px">
      <div class="eyebrow mb-3">Up next</div>
      ${[['Search &amp; filter deploy','Due Oct 14'],['New in review','QA pass today'],['Quotes NL–291','Client viewing'],['Payment term 3','Pending ₹48,000']].map(([a,b])=>`<div class="flex items-center gap-2 mb-3"><i class="dot"></i><div class="min-w-0"><div class="font-semibold truncate" style="font-size:12px">${a}</div><div class="text-xs dim">${b}</div></div></div>`).join('')}
      <div class="divider my-4"></div>
      ${['25 total · HL–204','220 open · clear day','12 in this sprint'].map((s)=>`<div class="text-xs dim mono" style="padding:3px 0">${s}</div>`).join('')}
    </div>
  </div>
</div>`;

const sectors = ['HEALTHTECH','FINTECH','E-COMMERCE','SAAS','B2B PORTALS','MOBILE APPS','DESIGN SYSTEMS','MARKETPLACES','HEALTHTECH','LOGISTICS'];

const workCards = WORKS.slice(0,4).map((w,i)=>`
<a href="/PORTFOLIO_DETAIL/" class="mkt-card" style="overflow:hidden;display:block">
  ${cover(w.sector.toUpperCase()+' · '+w.year, w.v, 'padding-top:46%')}
  <div style="padding:16px 18px">
    <div class="font-bold" style="font-size:15px;letter-spacing:-.02em">${w.t}</div>
    <div class="text-sm muted mt-1" style="line-height:1.55">${w.result}</div>
    <div class="text-xs dim mono mt-3 uppercase" style="letter-spacing:.08em">${w.tags.join(' · ')}</div>
  </div>
</a>`).join('');

const home = (r) => `
<section class="mkt-section" style="padding-top:56px">
  <div class="mkt-wrap">
    <div class="flex-col items-center text-center" style="max-width:820px;margin:0 auto">
      <div class="pill mb-5"><span class="dot"></span> Intake open · Q4 2026</div>
      <h1 class="h-display">Ship with clients <span class="grad">in the loop</span> — and money under control.</h1>
      <p class="lead mt-5" style="max-width:56ch">Nestlancer runs a dedicated product studio with an operating system for delivery: fixed-price quotes, milestone payments, live Project Hub, and Razorpay / UPI.</p>
      <div class="flex gap-3 mt-6 justify-center flex-wrap">
        <a class="btn btn-primary btn-lg" href="/CONTACT/">Start a project ${icon('arrow-right',15)}</a>
        <a class="btn btn-secondary btn-lg" href="/APP_DASH/">Tour the product</a>
      </div>
    </div>
    <div class="mt-10">${heroDemo}</div>
    <div class="flex items-center justify-center gap-6 mt-8 flex-wrap" style="opacity:.75">${sectors.map(s=>`<span class="mono text-xs dim uppercase" style="letter-spacing:.14em">${s}</span>`).join('<span class="dim">·</span>')}</div>
  </div>
</section>

<section class="mkt-section">
  <div class="mkt-wrap">
    <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 03 · DELIVERY SURFACE</div>
    <div class="grid g2 gap-8 items-center">
      <div>
        <h2 class="h2 mb-4">From brief to release — one continuous surface.</h2>
        <p class="muted mb-6" style="font-size:14.5px;line-height:1.65">Every marketing claim is a real Project Hub state your client can open.</p>
        ${[['Scoped intake, not a ticket black hole','Briefs become line-item quotes you can audit','check-circle'],
           ['Fixed-price line items with milestones','Deposits, mid-project, and final — every rupee mapped to approval','receipt'],
           ['Live progress, files, and messages','One URL the whole team checks instead of asking for updates','activity'],
           ['Milestone pay with Razorpay / UPI','GST invoices and receipts generated on every capture','card']]
          .map(([t,d,i],ix)=>`<div class="flex gap-4 mb-5">
            <div class="flex-col items-center"><span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i,15)}</span>${ix<3?'<span style="width:2px;flex:1;background:var(--brand-4);margin-top:6px"></span>':''}</div>
            <div><div class="eyebrow" style="font-size:10px">0${ix+1}</div><b style="font-size:15px;letter-spacing:-.015em">${t}</b><div class="text-sm muted mt-1">${d}</div></div>
          </div>`).join('')}
      </div>
      <div>
        ${panel({cls:'panel', pad:false, body:`<div class="panel-head"><div class="panel-title">Milestones · NL-204</div><span class="mono text-xs dim">3 of 5</span></div>
${[['Discovery &amp; audit','Approved Oct 3','success','check'],['UI Design','Approved Oct 7','success','check'],['Frontend','In progress · 68%','info','clock'],['QA &amp; release','Queued','neutral','minus']].map(([t,s,tn,i])=>`<div class="panel-row"><span class="avatar sq" style="width:30px;height:30px;border-radius:8px;background:var(--t-${tn}-bg);color:var(--t-${tn}-tx)">${icon(i,13)}</span><div class="min-w-0"><b style="font-size:13px">${t}</b><div class="text-xs dim">${s}</div></div><span class="badge tone-${tn} ml-auto">${tn==='success'?'Done':tn==='info'?'Active':'Next'}</span></div>`).join('')}`})}
      </div>
    </div>
  </div>
</section>

<section class="mkt-section" style="background:linear-gradient(180deg,var(--bg-card),var(--paper))" >
  <div class="mkt-wrap">
    <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 04 · MONEY SURFACE</div>
    <h2 class="h2 mb-4" style="max-width:22ch">Financial clarity for every milestone.</h2>
    <div class="grid g2 gap-8 items-start">
      <div class="mkt-card" style="padding:22px">
        <div class="flex justify-between items-center mb-3"><div class="eyebrow">Payments overview</div><span class="mono text-xs dim">PREVIEW · ILLUSTRATIVE</span></div>
        <div class="h2" style="font-size:26px">₹4,28,500 <span class="text-sm muted font-medium">collected</span></div>
        <div class="divider my-4"></div>
        ${[['Milestone 3 — Design','Paid · ₹25,000','success'],['Milestone 3 — Frontend','Pending · ₹48,000','warning'],['Final payout','Due · ₹52,000','neutral']].map(([t,s,tn])=>`<div class="flex justify-between items-center" style="padding:9px 0"><div class="font-semibold" style="font-size:13.5px">${t}</div><span class="badge tone-${tn}">${s}</span></div>`).join('')}
      </div>
      <div class="mkt-card" style="padding:22px;background:linear-gradient(135deg,#0F2B28,#11433D);color:#E7F4F2;border:none">
        <div class="eyebrow" style="color:#9CC8C2">Checkout rail</div>
        <div class="mono mt-3" style="font-size:11px;letter-spacing:.1em">PROVIDED BY RAZORPAY · NL-204-INST2</div>
        <div class="flex items-end justify-between mt-2 mb-4"><b style="font-size:30px;letter-spacing:-.03em">₹48,000</b><span class="badge tone-success">Escrow</span></div>
        <div class="btn btn-primary w-full btn-lg" style="box-shadow:none">Pay ₹48,000 now</div>
        <div class="flex gap-4 mt-4 mono" style="font-size:10px;color:#9CC8C2;letter-spacing:.08em"><span>Razorpay</span><span>UPI</span><span>NetBanking</span><span>Cards</span></div>
      </div>
    </div>
  </div>
</section>

<section class="mkt-section">
  <div class="mkt-wrap">
    <div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 05 · WHY NESTLANCER</div>
    <h2 class="h2 mb-8">Engineered for delivery, not marketplace noise.</h2>
    <div class="grid g2 gap-6 mb-6">
      <div class="mkt-card" style="padding:22px">
        <div class="eyebrow">Precision · auditable</div>
        <div class="font-bold mt-2" style="font-size:15.5px">Milestone payouts</div>
        <div class="mono mt-3" style="font-size:34px;font-weight:700;letter-spacing:-.03em;color:var(--brand-11)">₹4.2L</div>
        <div class="text-sm muted">Median engagement value — deposit, mid, final.</div>
      </div>
      <div class="mkt-card" style="padding:22px;display:flex;flex-direction:column;justify-content:center">
        <div class="font-bold" style="font-size:15.5px">Reply under 2h</div>
        <div class="text-sm muted mt-1">Typical studio response on workday threads.</div>
        <div class="divider my-4"></div>
        <div class="font-bold" style="font-size:15.5px">Fixed-price only</div>
        <div class="text-sm muted mt-1">No hourly blur. Scope locks before we start.</div>
      </div>
    </div>
    <div class="grid g4 gap-6">
      ${[['Command density','Slack-grade project room, always on','layout'],['Deliverable gates','Approval workflow tied to approvals','check-circle'],['Selective intake','Quality over volume — 8 slots/studio/quarter','shield'],['Senior pods','No juniors without a lead on your account','users']].map(([t,d,i])=>`
      <div class="mkt-card" style="padding:18px"><span class="avatar sq" style="width:32px;height:32px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i,14)}</span>
      <div class="font-semibold mt-3" style="font-size:13.5px">${t}</div><div class="text-xs muted mt-1" style="line-height:1.55">${d}</div></div>`).join('')}
    </div>
  </div>
</section>

<section class="mkt-section">
  <div class="mkt-wrap">
    <div class="flex items-end justify-between mb-6">
      <div><div class="mkt-eyebrow mb-3"><span class="dot"></span>FIG 06 · SELECTED WORK</div><h2 class="h2">Work that speaks for itself.</h2></div>
      <a class="link-arrow" href="/PORTFOLIO/">View all ${icon('arrow-right',14)}</a>
    </div>
    <div class="grid g4 gap-5" id="selected-work">${workCards}</div>
  </div>
</section>

<section class="mkt-section" style="padding-bottom:88px">
  <div class="mkt-wrap text-center">
    <div class="mkt-eyebrow mb-4 justify-center"><span class="dot"></span>FIG 09 · START</div>
    <h2 class="h-display" style="font-size:clamp(30px,3.6vw,46px)">Ready to ship with clarity?</h2>
    <p class="lead mt-4" style="max-width:48ch;margin:14px auto 0">Fixed-price studio work. Live Project Hub. Razorpay milestones. Intake is open.</p>
    <div class="flex items-center justify-center gap-4 mt-4 mono text-xs dim" style="letter-spacing:.06em"><span>↳ Reply in 24h</span><span>↳ Fixed-price quotes</span><span>↳ No retainers</span><span>↳ NDA on request</span></div>
    <div class="flex gap-3 justify-center mt-7">
      <a class="btn btn-primary btn-lg" href="/CONTACT/">Start a project ${icon('arrow-right',15)}</a>
      <a class="btn btn-secondary btn-lg" href="/APP_DASH/">Preview the portal</a>
    </div>
  </div>
</section>`;

// --- simple inner page layout helpers -------------------------------------
const pageHero = (fig, title, lead) => `
<section style="padding:56px 0 36px"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-4"><span class="dot"></span>${fig}</div>
  <h1 class="h1" style="max-width:20ch">${title}</h1>
  <p class="lead mt-4" style="max-width:62ch">${lead}</p>
</div></section>`;

export default [
  {
    path: 'apps/landing/', title: 'Nestlancer — Your dedicated studio, from brief to delivery',
    active: 'home',
    body: (r) => home(r)
      .replaceAll('/CONTACT/', LT(r, 'apps/landing/contact/'))
      .replaceAll('/APP_DASH/', LT(r, 'apps/web/dashboard/'))
      .replaceAll('/PORTFOLIO_DETAIL/', LT(r, 'apps/landing/portfolio/[id]/'))
      .replaceAll('/PORTFOLIO/', LT(r, 'apps/landing/portfolio/')),
  },

  {
    path: 'apps/landing/about/', title: 'About · Nestlancer', active: 'about',
    body: (r) => `
${pageHero('FIG 02 · STUDIO', 'A senior product studio with an operating system for delivery.', 'We are 14 engineers, designers, and product leads in Hyderabad. The studio is small on purpose: every engagement gets a named pod, a fixed quote, and a client portal you can audit any day of the week.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid g3 gap-6 mb-10">
    ${[['Ownership','One pod owns your outcome end-to-end. No hand-offs, no account-manager fog.','briefcase'],
       ['Readable money','Every rupee sits on a milestone you approve. GST invoices on every capture.','receipt'],
       ['Built in public-ish','Clients see commits, staging links, and decisions inside their Project Hub daily.','activity']]
      .map(([t,d,i])=>`<div class="mkt-card" style="padding:22px"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i,16)}</span><div class="h3 mt-4">${t}</div><p class="text-sm muted mt-2" style="line-height:1.65">${d}</p></div>`).join('')}
  </div>
  <div class="mkt-card" style="padding:26px 28px;margin-bottom:40px">
    <div class="grid g4 gap-6 text-center">
      ${[['2019','Studio founded'],['140+','Projects shipped'],['34','Active client accounts'],['96%','Milestones paid on time']].map(([v,l])=>`<div><div class="mono" style="font-size:30px;font-weight:700;letter-spacing:-.03em;color:var(--brand-11)">${v}</div><div class="text-xs uppercase dim mt-1" style="letter-spacing:.1em">${l}</div></div>`).join('')}
    </div>
  </div>
  <div class="grid g2 gap-8 items-center">
    <div>
      <div class="mkt-eyebrow mb-3"><span class="dot"></span>HOW WE WORK</div>
      <h2 class="h2 mb-5">Fixed price, weekly proof.</h2>
      ${[['Week 0 — Scoping','We turn your brief into line items, acceptance criteria, and a payment schedule. Nothing starts until you sign.'],['Weekly — Proof of work','Staging links, loom walkthroughs, and a burndown in your portal every Friday.'],['Milestones — Money moves on approval','You approve a deliverable; the scheduled invoice is issued with GST; Razorpay captures it.'],['Handover — You own everything','Repos, design files, runbooks, and a 30-day defect window are included in every quote.']].map((s,i)=>`
      <div class="flex gap-4 mb-5"><span class="avatar sq" style="width:30px;height:30px;background:var(--brand-9);color:#fff;font-size:11px;border-radius:8px">${i+1}</span>
      <div><b style="font-size:14px">${s[0]}</b><p class="text-sm muted mt-1" style="line-height:1.65">${s[1]}</p></div></div>`).join('')}
    </div>
    ${cover('STUDIO · HYDERABAD · IST', 4, 'padding-top:78%', 'NL')}
  </div>
</div></section>`,
  },

  {
    path: 'apps/landing/services/', title: 'Services · Nestlancer', active: 'services',
    body: (r) => `
${pageHero('FIG 02 · CAPABILITIES', 'Four practices. One delivery surface.', 'Every practice quotes fixed scope against milestones. Mix them into one engagement — the pod rearranges, the portal stays the same.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid g2 gap-6">
    ${[['01 · Product engineering','Next.js + NestJS platforms, mobile apps, and the ugly migrations nobody else quotes honestly.',['SaaS platforms & portals','Mobile apps (React Native)','Legacy strangler migrations','API design & integrations'],'code'],
       ['02 · Design systems','Product UI your future team can actually extend — tokens, components, documentation.',['Design audits & rebuilds','Token architecture','Component libraries','Brand-adjacent marketing sites'],'pen'],
       ['03 · Data & integrations','Pipelines, search, payments, and the third-party glue that makes software feel finished.',['Razorpay / UPI / NEFT workflows','Elasticsearch & reporting','CRM / ERP syncs','Webhooks & event buses'],'database'],
       ['04 · Reliability & QA','The boring discipline that keeps Friday releases boring.',['E2E suites & CI gates','Load & failover drills','Observability setup','Incident runbooks'],'shield']]
      .map(([t,d,items,i])=>`<div class="mkt-card" style="padding:24px">
        <div class="flex items-center gap-3 mb-3"><span class="avatar sq" style="width:38px;height:38px;border-radius:10px;background:var(--brand-9);color:#fff">${icon(i,16)}</span><div class="h3">${t}</div></div>
        <p class="text-sm muted mb-4" style="line-height:1.65">${d}</p>
        <div class="flex flex-wrap gap-2">${items.map(x=>`<span class="chip">${x}</span>`).join('')}</div>
      </div>`).join('')}
  </div>
  <div class="mkt-card mt-6" style="padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;background:linear-gradient(135deg,#0F2B28,#11433D);border:none;color:#E7F4F2">
    <div><div class="h3" style="color:#fff">Not sure which practice your problem needs?</div><p class="text-sm mt-1" style="color:#B9DAD5">Send the brief — engineers read it, not sales.</p></div>
    <a class="btn btn-lg" style="background:#fff;color:#0B5C55" href="${LT(r,'apps/landing/contact/')}">Describe your project ${icon('arrow-right',15)}</a>
  </div>
</div></section>`,
  },

  {
    path: 'apps/landing/pricing/', title: 'Pricing · Nestlancer', active: 'pricing',
    body: (r) => `
${pageHero('FIG 03 · ENGAGEMENT MODELS', 'Fixed scope. Fixed price. No hourly blur.', 'Three ways to engage the studio. Every model bills against milestones in your client portal — deposit, mid, final — with GST invoices and Razorpay or bank transfer.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid g3 gap-6 mb-10">
    ${[['Fixed-scope sprint','₹1.8L–₹6L','4–10 weeks', ['Defined brief → line-item quote','Named 3-person pod','Weekly staging + portal updates','30-day defect window'], 'For a single well-scoped build or rebuild.', false],
       ['Dedicated pod','₹3.5L / month','3–12 months', ['Senior pod reserved for your roadmap','Ship continuously, invoice monthly','Quarterly planning with your team','Pause with 4-week notice'], 'For product companies that need a dependable team.', true],
       ['Care retainer','₹40k / month','Ongoing', ['Monitoring, patches, small fixes','24h SLA on production defects','Monthly hardening report','Rollover hours bank'], 'For platforms we shipped (or inherit).', false]]
      .map(([t,p,per,feats,best,hot])=>`
      <div class="mkt-card" style="padding:26px;${hot?'border-color:var(--brand-7);box-shadow:0 10px 30px -12px rgba(11,122,113,.28)':''}">
        ${hot?'<span class="badge tone-success mb-3">Most common</span>':''}
        <div class="h3">${t}</div>
        <div class="mono mt-3" style="font-size:26px;font-weight:700;letter-spacing:-.03em">${p}</div>
        <div class="text-xs dim mono uppercase mt-1" style="letter-spacing:.1em">${per}</div>
        <div class="divider my-4"></div>
        ${feats.map(f=>`<div class="flex gap-2 mb-2" style="font-size:13px"><span style="color:var(--t-success-dot);margin-top:1px">${icon('check',13)}</span><span>${f}</span></div>`).join('')}
        <div class="text-xs muted mt-4 mb-4" style="line-height:1.55">${best}</div>
        <a class="btn ${hot?'btn-primary':'btn-secondary'} w-full" href="${LT(r,'apps/landing/contact/')}">Start with ${t.split(' ')[0].toLowerCase()} ${icon('arrow-right',13)}</a>
      </div>`).join('')}
  </div>
  <div class="grid g2 gap-6">
    ${panel({title:'What a quote looks like', sub:'Sample payment schedule — reproduced from a real engagement (NL-204)', pad:false, body: table({cols:[{l:'Milestone'},{l:'Share',r:1},{l:'Amount',r:1},{l:'Due',r:1}], rows:[
      ['<b>Deposit</b>','<span class="mono">30%</span>','<span class="mono">₹1,56,600</span>','<span class="dim">On signature</span>'],
      ['Mid-project','<span class="mono">40%</span>','<span class="mono">₹2,08,800</span>','<span class="dim">On milestone 2 approval</span>'],
      ['Final','<span class="mono">30%</span>','<span class="mono">₹1,56,600</span>','<span class="dim">On acceptance + handover</span>'],
    ]})})}
    ${panel({title:'Pricing FAQ', pad:true, body:[
      ['Do you bill hourly?','Never on scoped work. Pods bill monthly; everything else is milestone-fixed.'],
      ['What if scope changes?','A written change order re-prices the delta — the original quote stays intact.'],
      ['Which payment rails?','Razorpay (cards, UPI, netbanking) or bank transfer with UTR verification.'],
      ['Do you sign NDAs?','Yes — ours or yours, before the first workshop.']
    ].map(([q,a])=>`<div class="mb-4"><b style="font-size:13.5px">${q}</b><p class="text-sm muted mt-1" style="line-height:1.6">${a}</p></div>`).join('')})}
  </div>
</div></section>`,
  },

  {
    path: 'apps/landing/contact/', title: 'Contact · Nestlancer', active: 'contact',
    body: (r) => `
${pageHero('FIG 05 · INTAKE', 'Tell us what you need shipped.', 'Briefs are read by engineers, not sales. Expect a scoped reply — questions, options, or a quote — within one business day.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="grid gap-8" style="grid-template-columns:7fr 5fr">
    <div class="mkt-card" style="padding:26px">
      <div class="grid g2 gap-4 mb-4">
        <div class="field"><label class="label">Full name <span class="req">*</span></label><input class="input" placeholder="Priya Nair"></div>
        <div class="field"><label class="label">Work email <span class="req">*</span></label><input class="input" placeholder="priya@company.com"></div>
      </div>
      <div class="grid g2 gap-4 mb-4">
        <div class="field"><label class="label">Company</label><input class="input" placeholder="Nair Learning Systems"></div>
        <div class="field"><label class="label">Budget range</label><select class="select"><option>₹1.8L – ₹3L</option><option>₹3L – ₹6L</option><option selected>₹6L – ₹15L</option><option>₹15L+</option><option>Not sure yet</option></select></div>
      </div>
      <div class="field mb-4"><label class="label">What are you building? <span class="req">*</span></label>
        <textarea class="textarea" rows="6" placeholder="Current product, the problem, timeline pressure, links to anything existing…"></textarea>
        <span class="hint">2–3 sentences is plenty. We ask for details on the call.</span>
      </div>
      <div class="check mb-5"><input type="checkbox" id="nda"><label for="nda">Send your standard NDA before we share details.</label></div>
      <div class="flex items-center gap-3"><button class="btn btn-primary">Send brief ${icon('send',14)}</button><span class="text-xs dim">Average first reply: 4h 12m</span></div>
    </div>
    <div class="flex-col gap-5">
      ${panel({title:'Direct lines', pad:true, body:`
        <div class="flex items-center gap-3 mb-3"><span class="avatar sq" style="background:var(--brand-2);color:var(--brand-11)">${icon('mail',14)}</span><div class="min-w-0"><div class="text-xs dim">New business</div><b style="font-size:13.5px">hello@nestlancer.com</b></div></div>
        <div class="flex items-center gap-3 mb-3"><span class="avatar sq" style="background:var(--brand-2);color:var(--brand-11)">${icon('phone',14)}</span><div class="min-w-0"><div class="text-xs dim">Studio desk (IST)</div><b style="font-size:13.5px">+91 40 4890 1204</b></div></div>
        <div class="flex items-center gap-3"><span class="avatar sq" style="background:var(--brand-2);color:var(--brand-11)">${icon('map-pin',14)}</span><div class="min-w-0"><div class="text-xs dim">Studio</div><b style="font-size:13.5px">HITEC City, Hyderabad 500081</b></div></div>`})}
      ${panel({title:'Before you write', body:`
        <div class="flex-col gap-3">
          ${['Attach the ugliest screenshot of your current product — it helps.','Link any existing staging/demo environments.','Name the deadline that actually hurts.'].map(s=>`<div class="flex gap-2" style="font-size:13px"><span style="color:var(--brand-8);margin-top:1px">${icon('check',13)}</span><span class="muted">${s}</span></div>`).join('')}
        </div>`})}
      ${note('success','check-circle','<b>Intake is open.</b> Q4 2026 has 3 of 8 studio slots remaining.')}
    </div>
  </div>
</div></section>`,
  },

  {
    path: 'apps/landing/portfolio/', title: 'Portfolio · Nestlancer', active: 'portfolio',
    body: (r) => `
${pageHero('FIG 06 · SELECTED WORK', 'Proof, with numbers attached.', 'A sample of shipped engagements. Metrics are written with client sign-off; stacks and timelines are real.')}
<section class="mkt-section" style="padding-top:8px"><div class="mkt-wrap">
  <div class="flex gap-2 mb-7 flex-wrap">${['All','Fintech','SaaS','Retail','HealthTech','Logistics','Education'].map((c,i)=>`<span class="chip${i===0?' active':''}">${c}</span>`).join('')}</div>
  <div class="grid g3 gap-5">
    ${WORKS.map(w=>`
    <a href="${LT(r,'apps/landing/portfolio/[id]/')}" class="mkt-card" style="overflow:hidden;display:block">
      ${cover(w.sector.toUpperCase()+' · '+w.year, w.v, 'padding-top:52%')}
      <div style="padding:18px">
        <div class="flex items-center justify-between"><div class="font-bold" style="font-size:15px;letter-spacing:-.02em">${w.t}</div><span class="mono text-xs dim">${w.dur}</span></div>
        <div class="text-sm muted mt-2" style="line-height:1.55">${w.result}</div>
        <div class="flex gap-2 mt-3 flex-wrap">${w.tags.map(t=>`<span class="chip" style="height:22px;font-size:11px">${t}</span>`).join('')}</div>
      </div>
    </a>`).join('')}
  </div>
</div></section>`,
  },

  {
    path: 'apps/landing/portfolio/[id]/', title: 'Fintech Payments Hub · Nestlancer', active: 'portfolio',
    body: (r) => `
<section style="padding:48px 0 28px"><div class="mkt-wrap">
  <a href="${LT(r,'apps/landing/portfolio/')}" class="link-arrow mb-5" style="font-size:12.5px">${icon('arrow-left',13)} All work</a>
  <div class="grid g2 gap-8 items-center">
    <div>
      <div class="mkt-eyebrow mb-3"><span class="dot"></span>FINTECH · 2026 · 14 WEEKS</div>
      <h1 class="h1">Fintech Payments Hub</h1>
      <p class="lead mt-4">A lending firm reconciling 40k monthly transactions by spreadsheet needed one ledger the CFO and the ops team could both trust.</p>
      <div class="flex gap-2 mt-5 flex-wrap">${['Razorpay','UPI','Reconciliation','NestJS','Postgres'].map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    </div>
    ${cover('FINTECH PAYMENTS HUB · 2026', 1, 'padding-top:56%', '₹')}
  </div>
</div></section>
<div class="mkt-wrap"><div class="mkt-card" style="padding:22px 26px;margin-bottom:44px">
  <div class="grid g4 gap-6 text-center">
    ${[['42%','fewer settlement errors'],['11 days','UAT → production'],['₹6.2Cr','reconciled monthly'],['0','regulatory findings since']].map(([v,l])=>`<div><div class="mono" style="font-size:26px;font-weight:700;color:var(--brand-11);letter-spacing:-.03em">${v}</div><div class="text-xs dim mt-1 uppercase" style="letter-spacing:.08em">${l}</div></div>`).join('')}
  </div>
</div>
<div class="grid gap-10" style="grid-template-columns:7fr 5fr;padding-bottom:72px">
  <div class="prose">
    <h2>The problem</h2>
    <p>Four systems of record (Razorpay dashboard, core banking NEFT files, the loan-management suite, and Tally) meant settlement day ran on three people cross-checking spreadsheets. Discrepancies surfaced weeks late, during audits.</p>
    <h2>What we shipped</h2>
    <ul class="dot-list">
      <li>A single reconciliation ledger ingesting Razorpay webhooks, bank statement parsers (NEFT/UTR), and LMS entries — every transaction matched, flagged, or quarantined within 4 minutes.</li>
      <li>Ops console with a verification queue: UTR look-up, partial match suggestions, one-click settlement approval, and an immutable audit trail.</li>
      <li>CFO view: day-end summaries, aging buckets, and GST-ready invoices generated per settlement batch.</li>
    </ul>
    <div class="pullquote">"Audit season used to be six weeks of archaeology. This year it was a folder of links." — CFO, client</div>
    <h2>Stack decisions that mattered</h2>
    <p>Postgres with advisory locks for matcher idempotency; a queue-per-source ingestion design so a bad bank file never stops webhook flow; and Playwright-contract tests against Razorpay's sandbox before every deploy.</p>
  </div>
  <div class="flex-col gap-5">
    ${panel({title:'Engagement sheet', body:`<dl class="dl">
<div><dt>Sector</dt><dd>Fintech / Lending</dd></div>
<div><dt>Duration</dt><dd>14 weeks, fixed price</dd></div>
<div><dt>Pod</dt><dd>1 lead · 2 engineers · 1 designer</dd></div>
<div><dt>Model</dt><dd>30 / 40 / 30 milestones</dd></div>
<div><dt>Stack</dt><dd>Next.js · NestJS · Postgres · BullMQ</dd></div>
<div><dt>Rails</dt><dd>Razorpay · NEFT UTR · Tally export</dd></div>
</dl>`})}
    ${panel({title:'Milestone receipts', body:'<div class="flex-col gap-2">'+
      [['Deposit — 30%','PAID · NL-INV-2026-000031'],['Mid — 40%','PAID · NL-INV-2026-000058'],['Final — 30%','PAID · NL-INV-2026-000077']].map(([a,b])=>`<div class="flex items-center justify-between" style="font-size:12.5px;padding:9px 12px;background:var(--bg-hover);border:1px solid var(--line);border-radius:8px"><b>${a}</b><span class="mono dim">${b}</span></div>`).join('')+'</div>'})}
    ${note('info','info','Client identity and figures anonymized under NDA; metrics reproduced with written permission.')}
    <a class="btn btn-primary btn-lg w-full" href="${LT(r,'apps/landing/contact/')}">Build something like this ${icon('arrow-right',15)}</a>
  </div>
</div></div>`,
  },

  {
    path: 'apps/landing/blog/', title: 'Blog · Nestlancer', active: 'blog',
    body: (r) => `
<section style="padding:48px 0 28px"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>NESTLANCER JOURNAL</div>
  <h1 class="h1">Latest articles</h1>
  <p class="lead mt-3" style="max-width:52ch">Hiring playbooks, engineering deep-dives, and studio insights — filtered by category.</p>
</div></section>
<div class="mkt-wrap" style="padding-bottom:72px"><div class="blog-layout">
  <aside>
    <h5 class="rail-title">Categories</h5>
    ${[['All articles','106','apps/landing/blog/'],['Business','27','apps/landing/blog/'],['Case Studies','26','apps/landing/blog/'],['Design','27','apps/landing/blog/'],['Technology','26','apps/landing/blog/']].map(([l,c,h],i)=>`<a class="rail-link${i===0?' active':''}" href="${LT(r,h)}"><span>${l}</span><span class="c">${c}</span></a>`).join('')}
    <h5 class="rail-title mt-6">Tools</h5>
    <a class="rail-link" href="#"><span class="flex items-center gap-2">${icon('rss',13)} RSS</span></a>
    <a class="rail-link" href="${LT(r,'apps/web/blog/bookmarks/')}"><span class="flex items-center gap-2">${icon('bookmark',13)} Bookmarks</span></a>
  </aside>
  <div class="min-w-0">
    <a href="${LT(r,'apps/landing/blog/[slug]/')}" class="mkt-card" style="overflow:hidden;display:block;margin-bottom:22px">
      ${cover('FEATURED',6,'padding-top:30%')}
      <div style="padding:22px">
        <div class="eyebrow" style="font-size:10px">${POSTS[0].cat.toUpperCase()}</div>
        <div class="h3 mt-2" style="font-size:19px">${POSTS[0].t}</div>
        <p class="text-sm muted mt-2" style="line-height:1.6">${POSTS[0].excerpt}</p>
        <div class="flex items-center justify-between mt-3 text-xs dim"><span>Nestlancer Editorial</span><span class="mono">${POSTS[0].min} min read · 4 views</span></div>
      </div>
    </a>
    <div class="grid g3 gap-4">
      ${POSTS.slice(1,10).map((p,i)=>`
      <a href="${LT(r,'apps/landing/blog/[slug]/')}" class="mkt-card" style="overflow:hidden;display:block">
        ${cover(p.cat.toUpperCase(),(i%6)+1,'padding-top:44%')}
        <div style="padding:14px 16px">
          <div class="eyebrow" style="font-size:9.5px">${p.cat.toUpperCase()}</div>
          <b style="font-size:13.5px;letter-spacing:-.015em;line-height:1.35;display:block;margin-top:4px">${p.t}</b>
          <div class="text-xs dim mono mt-2">Nestlancer Editorial · ${p.min} min</div>
        </div>
      </a>`).join('')}
    </div>
    <div class="flex items-center justify-center gap-2 mt-8">
      <span class="page-cur">1</span>${[2,3,4,5,6,7].map(n=>`<span class="btn btn-ghost btn-sm mono">${n}</span>`).join('')}<span class="btn btn-ghost btn-sm">Next ${icon('chevron-right',12)}</span>
    </div>
  </div>
  <aside>
    ${panel({title:'Ready to start a project?', sub:'Create a client account and submit your brief to the Nestlancer studio.', body:`<a class="btn btn-primary w-full" href="${LT(r,'apps/landing/contact/')}">Contact us ${icon('arrow-right',13)}</a>`, pad:true})}
    <div class="mt-6"><h5 class="rail-title">Reading now</h5>
    ${POSTS.slice(0,4).map(p=>`<a class="rail-link" href="${LT(r,'apps/landing/blog/[slug]/')}"><span class="truncate" style="max-width:180px">${p.t}</span></a>`).join('')}
    </div>
  </aside>
</div></div>`,
  },

  {
    path: 'apps/landing/blog/[slug]/', title: 'Cutting Deploy Time from 45 Minutes to Five · Nestlancer', active: 'blog',
    body: (r) => `
<section style="padding:48px 0 24px"><div class="mkt-wrap" style="max-width:880px">
  <a href="${LT(r,'apps/landing/blog/')}" class="link-arrow mb-4" style="font-size:12.5px">${icon('arrow-left',13)} All articles</a>
  <div class="eyebrow mb-3">${'CASE STUDIES'} · <span>OCT 5, 2026</span></div>
  <h1 class="h1">Cutting Deploy Time from 45 Minutes to Five</h1>
  <div class="flex items-center gap-3 mt-5">
    <span class="avatar hue-2 lg">NE</span>
    <div><b style="font-size:13.5px">Nestlancer Editorial</b><div class="text-xs dim">8 min read · Engineering practice</div></div>
    <div class="ml-auto flex gap-2"><button class="btn-icon btn sm" title="Bookmark">${icon('bookmark',15)}</button><button class="btn-icon btn sm" title="Share">${icon('link',15)}</button></div>
  </div>
</div></section>
<div class="mkt-wrap" style="max-width:880px;padding-bottom:72px">
  ${cover('DEPLOY PIPELINE · BEFORE/AFTER',1,'padding-top:36%;margin-bottom:36px')}
  <div class="prose">
    <p>A 45-minute deploy is not a tooling problem — it is a feedback problem. When a deploy takes three quarters of an hour, nobody ships on Friday, nobody ships after lunch, and "continuous" becomes a slogan. Here is how we took a client's NestJS monolith from 45 minutes to five, in order of what actually mattered.</p>
    <h2>1. Profile before you optimize</h2>
    <p>The pipeline spent 19 minutes in dependency install, 14 minutes compiling TypeScript, 8 minutes building a Docker image containing the world, and 4 minutes on rollout. Optimizing rollout first would have saved nothing that matters.</p>
    <h2>2. Cache like the build depends on it</h2>
    <div class="codeblk"><span class="c1"># .github/workflows/deploy.yml — the two lines that saved 19 minutes</span><br>- uses: actions/setup-node@v4<br>&nbsp;&nbsp;<span class="c2">with:</span> { cache: pnpm, cache-dependency-path: pnpm-lock.yaml }<br>- run: pnpm fetch <span class="c1"># warm store from lockfile, offline install after</span></div>
    <p>Lockfile-keyed pnpm store caching took install from 19 minutes to 90 seconds. The trick is separating <b>fetch</b> (network, cacheable) from <b>install</b> (local, deterministic).</p>
    <h2>3. Split build from bundle</h2>
    <ul class="dot-list"><li>TypeScript compiles in CI once; the Docker stage copies <span class="mono">dist/</span> instead of recompiling.</li><li>Production image went from 1.9 GB to 240 MB (node:22-alpine + pnpm deploy --prod).</li><li>Layer caching keyed on lockfile hash: source-only changes rebuild in ~40s.</li></ul>
    <div class="pullquote">Ten engineers regained roughly eleven hours of waiting — every single week.</div>
    <h2>4. Make rollback boring</h2>
    <p>Five-minute deploys only stay safe when rollback is faster than panic. We pinned every release to an immutable image digest, kept the previous task definition warm, and wired a one-command rollback into the runbook. Friday deploys came back.</p>
    <h3>Results after six weeks</h3>
    <ul class="dot-list"><li>Median deploy: <b>4m 40s</b> (p95: 6m 10s)</li><li>Deploys per week: 9 → 34</li><li>Change-failure rate: down 31% (smaller diffs, more often)</li></ul>
    <p>Speed is a feature of culture as much as tooling: once deploys are cheap, review becomes the bottleneck — which is exactly where a senior team should spend its minutes.</p>
  </div>
  <div class="divider my-8"></div>
  <div class="grid g3 gap-4">
    ${POSTS.slice(1,4).map((p,i)=>`<a class="mkt-card" style="padding:16px;display:block" href="${LT(r,'apps/landing/blog/[slug]/')}">
      <div class="eyebrow" style="font-size:9.5px">${p.cat.toUpperCase()}</div>
      <b style="font-size:13px;line-height:1.4;display:block;margin-top:4px">${p.t}</b>
      <div class="text-xs dim mono mt-2">${p.min} min read</div></a>`).join('')}
  </div>
</div>`,
  },
];
