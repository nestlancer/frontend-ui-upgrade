// ============================================================================
// ROUTES — apps/web CLIENT PORTAL (signed-in surface) — part 1
// Dashboard · Requests (list/new/detail/archive) · Projects (list/new/detail/
// completed/archive) · Quotes (list/new/detail/drafts/templates)
// ============================================================================
import { linkTo as LT, inr } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, stats, table, tabs, filterbar, searchInput, sel, pager, progress, timeline, kv, dl2, field, input, textarea, switchRow, empty } from '../lib/comps.mjs';
import { phead, backlink } from '../lib/chrome.mjs';
import { PRIYA } from './data.mjs';

const reqIcon = `<span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--t-warning-bg);color:var(--t-warning-tx)">${icon('send',15)}</span>`;
const projIcon = `<span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon('folder',15)}</span>`;

const workRow = (r, href, iconHtml, title, meta, badgeHtml) => `
<a class="panel-row" href="${href}" style="align-items:center">
  ${iconHtml}
  <div class="min-w-0 flex-1"><b style="font-size:13.5px">${title}</b><div class="text-xs dim mt-1">${meta}</div></div>
  ${badgeHtml}${icon('chevron-right',14)}
</a>`;

export default [
  // ================================================================ DASHBOARD
  {
    path: 'apps/web/dashboard/', app: 'web', title: 'Overview · Nestlancer', crumb: 'Overview',
    body: (r) => `
${phead({ eyebrow: 'ANANYA IYER', title: 'Overview', sub: 'One action will unblock your workspace.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/web/payments/01a10a2c-2d0e-7499-b769-967d17a42197/')}">Complete checkout ${icon('arrow-right',14)}</a><a class="btn btn-secondary" href="${LT(r,'apps/web/projects/')}">Projects</a>` })}
<div class="flex items-center justify-between mb-3" style="font-size:12.5px">
  <div class="flex items-center gap-2"><b>Invoiced</b><span class="mono muted">₹14,400.00</span><span class="dim">·</span><span class="mono muted">₹19,200.00 pending</span></div>
  <a class="link" href="${LT(r,'apps/web/invoices/')}">Billing history</a>
</div>
<div class="flex items-center justify-between mb-2"><b style="font-size:14.5px;letter-spacing:-.015em">Workspace vitals</b><span class="text-xs dim">Live · 30s</span></div>
${stats([
  { label: 'Open requests', value: '1', note: 'In your pipeline', icon: 'send' },
  { label: 'Active projects', value: '1', note: '0 completed', icon: 'folder' },
  { label: 'Pending quotes', value: '0', note: 'Awaiting your decision', icon: 'receipt' },
  { label: 'Unread messages', value: '6', note: 'Messages waiting for you', icon: 'message' },
  { label: 'Notifications', value: '32', note: 'Latest updates', icon: 'bell' },
], 5)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr">
  ${panel({ title: 'WORKSPACE PULSE — Pipeline &amp; billing', pad: true, body: `
    ${[['Active','var(--brand-8)',82,1],['Done','var(--brand-5)',8,0],['Requests','var(--t-warning-dot)',64,1],['Quotes','var(--line-strong)',14,0]].map(([l,c,w,n])=>`
    <div class="flex items-center gap-3 mb-3"><span class="text-xs muted" style="width:62px">${l}</span><div class="prog flex-1"><i style="width:${w}%;background:${c}"></i></div><b class="mono" style="font-size:12.5px">${n}</b></div>`).join('')}
    <div class="flex gap-10 mt-5">
      <div><div class="eyebrow" style="font-size:9.5px">COLLECTED</div><div class="mono font-semibold mt-1" style="color:var(--brand-11);font-size:16px">₹14,400.00</div></div>
      <div class="p-3" style="background:var(--t-warning-bg);border:1px solid var(--t-warning-bd);border-radius:8px">
        <div class="eyebrow" style="font-size:9.5px;color:var(--t-warning-tx)">PENDING</div>
        <div class="mono font-semibold mt-1" style="color:var(--t-warning-tx);font-size:16px">₹19,200.00</div>
        <a class="link text-xs" href="${LT(r,'apps/web/payments/01a10a2c-2d0e-7499-b769-967d17a42197/')}" style="color:var(--t-warning-tx)">Complete checkout →</a>
      </div>
    </div>` })}
  <div class="panel"><div class="panel-head"><div class="panel-title">Awaiting you</div></div>
    ${[['card','Pending payment','₹19,200.00','apps/web/payments/01a10a2c-2d0e-7499-b769-967d17a42197/'],['message','Unread messages','6 messages','apps/web/messages/inbox/'],['bell','Notifications','32 new','apps/web/notifications/']].map(([i,t,s,h])=>`
    <a class="panel-row" href="${LT(r,h)}"><span class="avatar sq" style="width:30px;height:30px;background:var(--bg-subtle);color:var(--ink-2)">${icon(i,13)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs dim">${s}</div></div>${icon('chevron-right',14)}</a>`).join('')}
  </div>
</div>
<div class="mt-6">
  <div class="flex items-center justify-between mb-2"><b style="font-size:14.5px;letter-spacing:-.015em">Live workbench</b><span class="text-xs dim">One queue at a time</span></div>
  ${tabs([
    { l: 'Quotes', count: 0, href: LT(r,'apps/web/quotes/') },
    { l: 'Pay now', count: 1, href: LT(r,'apps/web/payments/') },
    { l: 'Projects', count: 1, href: LT(r,'apps/web/projects/') },
    { l: 'Inbox', count: 2, href: LT(r,'apps/web/messages/inbox/'), active: true },
  ])}
  <div class="panel">
    <div class="panel-row flex justify-between"><div class="flex items-center gap-2"><span class="avatar sq" style="width:30px;height:30px;background:var(--bg-subtle);color:var(--ink-2)">${icon('inbox',13)}</span><b style="font-size:13.5px">Inbox</b></div><a class="link text-xs" href="${LT(r,'apps/web/messages/inbox/')}">View all</a></div>
    ${[['Payments ops — Razorpay settlement and webhooks',"I'll post the shared retry checklist here after tomorrow's reconciliation review. Production changes still go through each project milestone.",'5d'],
       ['Riya Kapoor',"Thanks. Our finance team confirmed the duplicate NEFT on their end too. Replay UI remains the priority for month-end.",'5d']].map(([t,s,ago])=>`
    <div class="panel-row" style="align-items:flex-start"><div class="min-w-0 flex-1"><b style="font-size:13.5px">${t}</b><div class="text-xs muted mt-1" style="line-height:1.55">${s}</div></div><span class="text-xs dim mono shrink-0">${ago}</span></div>`).join('')}
  </div>
</div>
<div class="mt-6">
  <div class="flex items-center justify-between mb-2"><b style="font-size:14.5px;letter-spacing:-.015em">Recent activity</b><a class="link text-xs" href="${LT(r,'apps/web/notifications/')}">View all</a></div>
  <div class="panel">
    ${[['receipt','Invoice','Your invoice for Razorpay Settlement Reconciliation Engine (₹14,400.00) is ready to download.','5d ago'],
       ['message','New message in Payments ops — Razorpay settlement and webhooks','Riya Kapoor sent a message in Payments ops — Razorpay settlement and webhooks: "I&#39;ll…','5d ago'],
       ['message','New message in Payments ops — Razorpay settlement and webhooks','Karthik Menon sent a message in Payments ops — Razorpay settlement and webhooks: "…','5d ago'],
       ['check-circle','Project status updated','Razorpay Settlement Reconciliation Engine status changed to In Progress.','5d ago']]
      .map(([i,t,s,ago])=>`<div class="panel-row"><i class="dot shrink-0"></i><div class="min-w-0 flex-1"><b style="font-size:12.8px">${t}</b> <span class="text-xs muted">— ${s}</span></div><span class="text-xs dim shrink-0">${ago}</span></div>`).join('')}
  </div>
</div>`,
  },

  // ================================================================ REQUESTS
  {
    path: 'apps/web/requests/', app: 'web', title: 'Work Hub · Nestlancer', crumb: 'Requests',
    body: (r) => `
${phead({ title: 'Work Hub', sub: 'All your service requests and active projects in one place.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/web/requests/new/')}">${icon('plus',14)} New request</a>` })}
${stats([
  { label: 'Total requests', value: '3' }, { label: 'Under review', value: '0' },
  { label: 'Quoted', value: '0' }, { label: 'Projects', value: '1' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'All', count: 4, href: '#' },
  { l: 'Requests', count: 3, href: LT(r,'apps/web/requests/'), active: true },
  { l: 'Projects', count: 1, href: LT(r,'apps/web/projects/') },
])}</div>
${filterbar(`${sel(['All statuses','Draft','Submitted','Under review','Quoted','Converted to project','Rejected'],'All statuses')}<div class="input-wrap grow"><span class="in-icon">${icon('search',14)}</span><input class="input" placeholder="Search work items…"></div>`)}
<div class="panel">
  ${workRow(r, LT(r,'apps/web/requests/[id]/'), reqIcon, 'Corporate LMS for 200 Employees', 'Request · Custom · Oct 5, 2026', badge('Converted To Project','info'))}
  ${workRow(r, LT(r,'apps/web/requests/[id]/'), reqIcon, 'Blockchain-Based Skill Credential Platform', 'Request · Custom · Oct 5, 2026', badge('Rejected','danger'))}
  ${workRow(r, LT(r,'apps/web/requests/[id]/'), reqIcon, 'Malayalam–English Bilingual CMS', 'Draft · Web Development · Oct 5, 2026', badge('Draft','warning'))}
</div>
<div class="flex items-center justify-between mt-4">
  <span class="text-xs dim">Showing 1–3 of 3</span>
  <div class="pager-btns"><button class="btn btn-ghost btn-sm" disabled>${icon('chevron-left',13)} Prev</button><span class="page-cur">1</span><button class="btn btn-ghost btn-sm" disabled>Next ${icon('chevron-right',13)}</button></div>
</div>
<div class="mt-6">${note('info','archive','Looking for closed work? <a class="link" href="'+LT(r,'apps/web/requests/archive/')+'">Open the request archive</a> — 4 completed or withdrawn requests live there.')}</div>`,
  },

  {
    path: 'apps/web/requests/new/', app: 'web', title: 'New request · Nestlancer', crumb: 'New request',
    body: (r) => `
${backlink(r, 'apps/web/requests/', 'Back to Work Hub')}
<div class="grid gap-6" style="grid-template-columns:7fr 5fr;align-items:start">
  <div>
    ${phead({ eyebrow: 'INTAKE', title: 'New request', sub: 'Tell the studio what to scope. An engineer reviews every brief before we quote.' })}
    ${panel({ title: 'Brief', body: `
      ${field('Project title', input({ ph: 'e.g. Corporate LMS for 200 employees' }))}
      <div class="grid g2 gap-4 mt-4">
        ${field('Category', '<select class="select"><option>Web Development</option><option>Mobile App</option><option>Design</option><option selected>Custom</option></select>')}
        ${field('Budget range', '<select class="select"><option>₹1.8L – ₹3L</option><option>₹3L – ₹6L</option><option selected>₹6L – ₹15L</option><option>₹15L+</option></select>')}
      </div>
      <div class="mt-4">${field('What are you building?', textarea('Describe the current product, the problem, users, and must-haves. 3–6 sentences is plenty.', '', 6), { hint: 'Requirements become line items in your quote — write the outcomes, not the tech stack.' })}</div>
      <div class="grid g2 gap-4 mt-4">
        ${field('Preferred start', input({ type: 'date', val: '2026-08-01' }))}
        ${field('Hard deadline', input({ type: 'date', val: '2026-10-31' }))}
      </div>` })}
    ${panel({ title: 'Attachments', cls: 'mt-4', body: `<div class="dropzone">${icon('upload',18)}<b>Drop a brief, brand kit, or screenshots</b><span>PDF, PNG, ZIP up to 25 MB each — shared only with the studio</span><button class="btn btn-secondary btn-sm mt-2">Browse files</button></div>` })}
    <div class="flex items-center gap-3 mt-5">
      <a class="btn btn-primary btn-lg" href="${LT(r,'apps/web/requests/[id]/')}">Submit for review ${icon('send',14)}</a>
      <button class="btn btn-secondary">Save draft</button>
      <span class="text-xs dim">Drafts autosave · nothing is billed at this step</span>
    </div>
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'What happens next', body: `<div class="tline">
      ${[['Engineer review','We read the brief within 1 business day; expect clarifying questions in Messages.'],['Scoped quote','Line items, acceptance criteria, and a payment schedule arrive in Quotes.'],['You sign electronically','Acceptance signs the service agreement and schedules the deposit.'],['Kickoff','Pod assigned; the project hub opens the same day.']].map(([t,d],i)=>`
      <div class="tline-item${i?' mut':''}"><b style="font-size:13px">${t}</b><div class="text-xs muted mt-1">${d}</div></div>`).join('')}
    </div>` })}
    ${note('success','shield-check','<b>Free scoping, no obligation.</b> A quote is a document — you pay only after you accept it.')}
    ${panel({ title: 'Good briefs include', body: `<div class="flex-col gap-2">${['The deadline that actually hurts','Screenshots of what exists today','Who approves deliverables on your side','Anything you hated about a previous vendor'].map(s=>`<div class="flex gap-2 text-sm muted"><span style="color:var(--brand-8)">${icon('check',13)}</span>${s}</div>`).join('')}</div>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/web/requests/[id]/', app: 'web', alias: 'apps/web/requests/4b8110f3-1d0e-4f8c-a111-3e0a1/', title: 'Corporate LMS for 200 Employees · Request', crumb: 'Request detail',
    body: (r) => `
<div class="flex items-start justify-between gap-4 flex-wrap mb-1">
  <div class="min-w-0">
    <div class="eyebrow mono mb-2">REQUEST ${PRIYA.request.id}</div>
    <h1 class="ptitle">${PRIYA.request.title}</h1>
    <p class="psub">${PRIYA.request.sub}</p>
  </div>
  ${badge('Converted To Project','info')}
</div>
<div class="flex gap-2 mt-3 mb-5 flex-wrap">
  ${[['Tag','Category · Custom'],['calendar','Created Oct 5, 2026'],['send','Submitted Oct 5, 2026'],['clock','Updated Oct 5, 2026']].map(([i,t])=>`<span class="chip" style="height:26px;font-size:12px">${icon(i,12)} ${t}</span>`).join('')}
</div>
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Request details', body: `
      <p class="text-sm" style="line-height:1.7">${PRIYA.request.desc}</p>
      <div class="grid g2 gap-4 mt-5">${[['Budget',PRIYA.request.budget],['Preferred start',PRIYA.request.start],['Deadline',PRIYA.request.deadline],['Timeline',PRIYA.request.timeline]].map(([k,v])=>`<div><div class="text-xs dim">${k}</div><div class="font-semibold mono mt-1" style="font-size:13px">${v}</div></div>`).join('')}</div>` })}
    ${panel({ title: 'Requirements', body: `<div class="flex flex-wrap gap-2">${PRIYA.request.reqs.map(x=>`<span class="chip">${x}</span>`).join('')}</div>` })}
    ${panel({ title: 'Attachments', body: `<a class="flex items-center gap-2 link font-semibold" href="#">${icon('paperclip',14)} request-brief.pdf</a><span class="text-xs dim ml-auto mono" style="margin-left:auto">1 KB</span>` })}
    ${panel({ title: 'Status history', pad: true, body: timeline([
        { title: 'Draft', sub: 'Request created', time: 'Oct 5, 2026, 3:47 AM' },
        { title: 'Submitted', sub: 'Submitted for review', time: 'Oct 5, 2026, 3:47 AM' },
        { title: 'Under Review', sub: "LMS requirements reviewed — Okta SAML metadata received from Priya's IT team.", time: 'Oct 5, 2026, 3:47 AM' },
        { title: 'Quoted', sub: 'Quote sent — request updated from UNDER_REVIEW', time: 'Oct 5, 2026, 3:47 AM' },
        { title: 'Quoted', sub: 'Quote sent — request updated from CHANGES_REQUESTED', time: 'Oct 5, 2026, 3:47 AM' },
        { title: 'Converted To Project', sub: 'Converted to project from accepted quote', time: 'Oct 5, 2026, 3:47 AM' },
      ])})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Linked quote', actions: badge('Accepted','success'), body: `
      <div class="mono font-bold" style="font-size:24px;letter-spacing:-.03em">₹52,200.00</div>
      <a class="btn btn-primary w-full mt-4" href="${LT(r,'apps/web/quotes/[id]/')}">Review quote</a>` })}
    ${panel({ title: 'Actions', body: `
      <p class="text-xs muted mb-3" style="line-height:1.6">This request was converted to a project. Track delivery, milestones, and files in Projects.</p>
      <a class="btn btn-primary w-full" href="${LT(r,'apps/web/projects/[id]/')}">Open projects</a>
      <a class="btn btn-ghost w-full mt-2" href="${LT(r,'apps/web/requests/')}">← Back to Work Hub</a>` })}
    ${panel({ title: 'All quotes', body: `
      <div class="flex items-center justify-between">${badge('Accepted','success')}<span class="mono font-bold">₹52,200.00</span></div>
      <a class="link text-sm mt-2 inline-flex" href="${LT(r,'apps/web/quotes/[id]/')}">View quote →</a>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/web/requests/archive/', app: 'web', title: 'Request archive · Nestlancer', crumb: 'Archive',
    body: (r) => `
${backlink(r, 'apps/web/requests/', 'Back to Work Hub')}
${phead({ eyebrow: 'ARCHIVE', title: 'Request archive', sub: 'Closed, converted, and withdrawn requests — kept for reference and re-activation.' })}
${filterbar(`${searchInput('Search archived requests…', 260)}${sel(['All outcomes','Converted','Withdrawn','Declined'])}`)}
<div class="panel">
  ${[['Festive Season Campaign Landing Pages','Converted to project · Sep 12, 2026','success','archive'],['Q2 analytics dashboard','Completed &amp; billed · Jul 28, 2026','muted','check-circle'],['Vendor portal v2 exploration','Withdrawn by you · Jun 3, 2026','muted','x'],['Legacy ERP data export','Declined by studio (capacity) · Apr 17, 2026','neutral','clock']].map(([t,m,tn,i])=>`
  <div class="panel-row"><span class="avatar sq" style="width:32px;height:32px;background:var(--bg-subtle);color:var(--ink-3)">${icon(i,13)}</span>
  <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs dim mt-1">${m}</div></div>
  ${badge(tn === 'success' ? 'Converted' : 'Archived', tn)}
  <button class="btn btn-ghost btn-sm">Restore</button></div>`).join('')}
</div>
${pager('Showing 1–4 of 4')}`,
  },

  // ================================================================ PROJECTS
  {
    path: 'apps/web/projects/', app: 'web', title: 'Projects · Nestlancer', crumb: 'Projects',
    body: (r) => `
${phead({ title: 'Projects', sub: 'Delivery, milestones, and files for every engagement.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/web/requests/new/')}">${icon('plus',14)} Start new work</a>` })}
${stats([
  { label: 'Active', value: '1', note: 'NL-204 · LMS', icon: 'folder' },
  { label: 'Completed', value: '2', note: 'Lifetime', icon: 'check-circle' },
  { label: 'Avg. approval time', value: '1.6d', note: 'Your reviews', icon: 'clock' },
  { label: 'Next payment', value: '₹20,880', note: 'Mid-project · due Oct 14', icon: 'card' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'Active', count: 1, href: LT(r,'apps/web/projects/'), active: true },
  { l: 'Completed', count: 2, href: LT(r,'apps/web/projects/completed/') },
  { l: 'Archive', count: 1, href: LT(r,'apps/web/projects/archive/') },
])}</div>
${filterbar(`${sel(['All statuses','In progress','On hold','Review'])}${searchInput('Search projects…')}`)}
<a class="panel-row" style="align-items:flex-start" href="${LT(r,'apps/web/projects/[id]/')}">
  ${projIcon}
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2"><b style="font-size:13.5px">Corporate LMS for 200 Employees</b>${badge('In progress','info')}${badge('40% complete','neutral')}</div>
    <div class="text-xs muted mt-1">NL-204 · Custom · Started Aug 3, 2026 · Due Oct 31, 2026</div>
    <div class="flex items-center gap-3 mt-2" style="max-width:420px">${progress(40,'grad')}<span class="mono text-xs dim">40%</span></div>
    <div class="text-xs muted mt-2">Next: <b>Mid-project payment</b> · ₹20,880.00 · 2/2 milestones approved</div>
  </div>
  ${icon('chevron-right',14)}
</a>
<div class="text-xs dim mt-4">Showing 1–1 of 1 · <a class="link" href="${LT(r,'apps/web/projects/completed/')}">View 2 completed</a></div>`,
  },

  {
    path: 'apps/web/projects/new/', app: 'web', title: 'New project · Nestlancer', crumb: 'New project',
    body: (r) => `
${backlink(r, 'apps/web/projects/', 'Back to Projects')}
<div class="panel" style="max-width:720px;margin:0 auto">
  <div class="empty" style="padding:56px 30px">
    <div class="e-icon">${icon('sparkles',20)}</div>
    <b>Projects are born from accepted quotes</b>
    <span class="text-xs" style="max-width:48ch">You don't create projects by hand. When you accept and electronically sign a quote, the studio converts it into a project with milestones, a payment schedule, and a delivery pod — usually the same day.</span>
    <div class="flex gap-3 mt-3">
      <a class="btn btn-primary" href="${LT(r,'apps/web/quotes/')}">${icon('receipt',14)} Review open quotes</a>
      <a class="btn btn-secondary" href="${LT(r,'apps/web/requests/new/')}">Or start a new request</a>
    </div>
  </div>
</div>
<div class="mt-6" style="max-width:720px;margin:0 auto">${note('info','info','Last conversion: <b>Corporate LMS for 200 Employees</b> — request → quote NL-QTO-2026-000098 → project NL-204, in one afternoon.')}</div>`,
  },

  {
    path: 'apps/web/projects/[id]/', app: 'web', alias: 'apps/web/projects/nl-lms/', title: 'Corporate LMS for 200 Employees · Project', crumb: 'Project detail',
    body: (r) => `
<div class="flex items-start justify-between gap-4 flex-wrap">
  <div class="min-w-0" style="max-width:76ch">
    <h1 class="ptitle" style="font-size:24px">Corporate LMS for 200 Employees</h1>
    <p class="psub" style="font-size:12.8px">Internal learning platform for Nair Learning Systems staff across Kochi, Bangalore, and Chennai — course builder with video modules, quiz engine, completion tracking, PDF certificate generation, and SAML SSO via our existing Okta tenant. Must support Malayalam subtitles on select compliance courses.</p>
  </div>
  <div class="flex gap-2">${badge('In progress','info')}${badge('40% complete','neutral')}</div>
</div>
<div class="grid g3 gap-4 mt-4" style="max-width:760px">
  <div class="chip" style="height:44px;border-radius:10px">${icon('layers',14)}<div class="text-left"><div class="text-xs dim" style="font-size:10px;line-height:1.2">Delivery milestones</div><b class="mono" style="font-size:13px">2/2 completed</b></div></div>
  <div class="chip" style="height:44px;border-radius:10px">${icon('check-circle',14)}<div class="text-left"><div class="text-xs dim" style="font-size:10px;line-height:1.2">Deliverables approved</div><b class="mono" style="font-size:13px">1/1</b></div></div>
  <div class="chip" style="height:44px;border-radius:10px">${icon('clock',14)}<div class="text-left"><div class="text-xs dim" style="font-size:10px;line-height:1.2">Started</div><b class="mono" style="font-size:13px">Aug 3, 2026</b></div></div>
</div>
<div class="flex items-center justify-between mt-4 mb-1"><span class="text-xs muted font-semibold">Overall progress</span><span class="mono text-xs dim">40%</span></div>
${progress(40,'grad')}
<div class="panel mt-4"><div class="panel-row" style="gap:14px">
  ${badge('In progress','info')}<span class="mono text-xs dim">40% complete</span><span class="dim">·</span>
  <span class="text-sm">Next: <b>Mid-project payment</b></span><span class="mono text-sm muted">₹20,880.00</span>
  <div class="ml-auto flex gap-2">
    <a class="btn btn-primary btn-sm" href="${LT(r,'apps/web/payments/01a10a2c-2d0e-7499-b769-967d17a42197/')}">Pay now</a>
    <a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/messages/thread/[threadId]/')}">${icon('message',13)} Message</a>
    <button class="btn btn-primary btn-sm">View milestones</button>
  </div>
</div></div>
${tabs([
  { l: 'Overview', href: LT(r,'apps/web/projects/[id]/'), active: true },
  { l: 'Progress' }, { l: 'Milestones' }, { l: 'Deliverables' }, { l: 'Messages' }, { l: 'Files' },
])}
<div class="flex-col gap-5">
  ${panel({ title: 'Project status', sub: 'Overall contract status, milestone delivery, and file reviews are tracked separately.', pad: true, body: `
    <div class="grid g3 gap-4">
      ${[['FOLDER','PROJECT',badge('In progress','info'),'Set by your delivery team for the whole engagement.',''],
         ['LAYERS','MILESTONES','<b class="mono" style="font-size:16px">2/2 approved</b>','Delivery milestones (payment schedule excluded) — All delivery milestones approved','View all milestones'],
         ['CHECK','DELIVERABLES','<b class="mono" style="font-size:16px">1/1 approved</b>','','View deliverables']]
        .map(([ix,t,v,d,lnk])=>`<div class="panel" style="padding:14px"><div class="eyebrow" style="font-size:9.5px">${t}</div><div class="mt-2 mb-2">${v}</div>${d?`<div class="text-xs muted" style="line-height:1.5">${d}</div>`:''}${lnk?`<a class="link text-xs mt-2 inline-block" href="#">${lnk}</a>`:''}</div>`).join('')}
    </div>
    <div class="panel mt-4" style="padding:14px"><div class="eyebrow" style="font-size:9.5px">DAILY PROGRESS</div><b class="mt-2 block" style="font-size:14px">Team updates</b><div class="text-xs muted mt-1">End-of-day work logs and delivery notes from your team.</div><a class="link text-xs mt-2 inline-block" href="#">View progress timeline</a></div>` })}
  ${panel({ title: 'Latest progress', sub: 'Recent daily updates from your delivery team.', actions: `<a class="link text-xs" href="#">View all progress</a>`, pad: false, body: `
    ${[['check-circle','Milestone Approved',badge('Daily update','info'),'Milestone: Okta SAML &amp; HR Dashboard','Reconciled after deliverable approval'],
       ['check-circle','Milestone Approved',badge('Daily update','info'),'Milestone: LMS Platform Setup','Reconciled after deliverable approval'],
       ['refresh','Daily update — course builder and video pipeline',badge('Daily update','muted'),'Milestone: LMS Platform Setup','Course builder with SCORM import scaffolded. Video upload pipeline supports Malayalam subtitle track on compliance modules.']]
      .map(([i,t,b,m,s])=>`<div class="panel-row" style="align-items:flex-start">
        <span style="color:var(--brand-8);margin-top:2px">${icon(i,15)}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2"><b style="font-size:13px">${t}</b>${b}</div>
          <div class="text-xs muted mt-1">${m}</div>
          <div class="text-xs dim mt-1" style="line-height:1.55">${s}</div>
          <div class="text-xs dim mono mt-1">Oct 5, 2026, 3:47 AM</div>
        </div></div>`).join('')}` })}
  <div class="grid gap-5" style="grid-template-columns:3fr 2fr">
    ${panel({ title: 'Recent updates', sub: 'Summary from the progress feed.', pad: false, body: `
      ${[['Milestone Approved','Reconciled after deliverable approval','10/5/26, 3:47 AM'],['Milestone Approved','Reconciled after deliverable approval','10/5/26, 3:47 AM'],['Daily update — course builder and video pipeline','Course builder with SCORM import scaffolded. Video upload pipeline supports Malayalam subtitle tracks.','10/5/26, 3:47 AM']].map(([t,s,dt])=>`
      <div class="panel-row" style="align-items:flex-start"><div class="min-w-0"><b style="font-size:12.8px">${t}</b><div class="text-xs dim mt-1" style="line-height:1.5">${s}</div><div class="text-xs dim mono mt-1">${dt}</div></div></div>`).join('')}` })}
    ${panel({ title: 'Submit feedback', sub: 'Share notes with your delivery team', body: `
      <div class="field"><label class="label">Your feedback ${icon('help-circle',12)}</label>${textarea('Share your feedback…','',4)}</div>
      <button class="btn btn-primary mt-3" disabled>Submit feedback</button>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/web/projects/completed/', app: 'web', title: 'Completed projects · Nestlancer', crumb: 'Completed',
    body: (r) => `
${backlink(r, 'apps/web/projects/', 'Back to Projects')}
${phead({ eyebrow: 'ARCHIVE', title: 'Completed projects', sub: 'Delivered, accepted, and closed engagements. Defect windows and care retainers tracked here.' })}
<div class="panel">
  ${[['Festive Season Campaign Landing Pages','Sep 12, 2026 · Accepted with 5 perfect reviews','₹6,000.00 · Paid in full','100'],
     ['Analytics Dashboard Q2','Jul 28, 2026 · Defect window closed','₹1,20,000.00 · Paid in full','100']].map(([t,m,a,p])=>`
  <a class="panel-row" href="${LT(r,'apps/web/projects/[id]/')}" style="align-items:flex-start">
    <span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--t-success-bg);color:var(--t-success-tx)">${icon('check-circle',15)}</span>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2"><b style="font-size:13.5px">${t}</b>${badge('Completed','success')}</div>
      <div class="text-xs muted mt-1">${m}</div>
      <div class="flex items-center gap-3 mt-2" style="max-width:320px">${progress(100,'grad')}<span class="mono text-xs dim">${p}%</span></div>
      <div class="text-xs dim mono mt-2">${a}</div>
    </div>${icon('chevron-right',14)}</a>`).join('')}
</div>
${pager('Showing 1–2 of 2')}`,
  },

  {
    path: 'apps/web/projects/archive/', app: 'web', title: 'Project archive · Nestlancer', crumb: 'Archive',
    body: (r) => `
${backlink(r, 'apps/web/projects/', 'Back to Projects')}
${phead({ eyebrow: 'ARCHIVE', title: 'Project archive', sub: 'Archived projects are read-only. Restore to reopen files and messaging.' })}
<div class="panel">
  <div class="panel-row"><span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--bg-subtle);color:var(--ink-3)">${icon('archive',15)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13.5px">Vendor Portal Phase 1</b><div class="text-xs dim mt-1">Archived Mar 2, 2026 · ₹2,40,000.00 collected · 12 files retained</div></div>
    ${badge('Archived','muted')}<button class="btn btn-ghost btn-sm">Restore</button></div>
</div>
${pager('Showing 1–1 of 1')}`,
  },

  // ================================================================ QUOTES
  {
    path: 'apps/web/quotes/', app: 'web', title: 'Quotes · Nestlancer', crumb: 'Quotes',
    body: (r) => `
${phead({ title: 'Quotes', sub: 'Fixed-price proposals from the studio. Review, negotiate, sign — all here.' })}
${stats([
  { label: 'Open', value: '1', note: 'Awaiting your decision', icon: 'receipt' },
  { label: 'Accepted', value: '2', note: 'Lifetime', icon: 'check-circle' },
  { label: 'Drafts', value: '1', note: 'Being prepared', icon: 'edit' },
  { label: 'Template library', value: '4', note: 'Common scopes', icon: 'layers' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'All', count: 3, active: true }, { l: 'Open', count: 1 }, { l: 'Accepted', count: 2 },
  { l: 'Drafts', count: 1, href: LT(r,'apps/web/quotes/drafts/') }, { l: 'Templates', count: 4, href: LT(r,'apps/web/quotes/templates/') },
])}</div>
${filterbar(`${searchInput('Search quotes…', 240)}${sel(['All statuses','Sent','Viewed','Accepted','Declined','Expired'])}`)}
<div class="panel">
  ${[['Quote #01a10f80','For: AUDIT-P23-20261005-6rdsf Request to Quote Builder','₹1,770.00','Viewed','warning','Oct 5, 2026','Valid until Oct 20, 2026'],
     ['Quote NL-QTO-2026-000098','Corporate LMS for 200 Employees — Custom build','₹52,200.00','Accepted','success','Sep 30, 2026','Converted to NL-204'],
     ['Quote NL-QTO-2026-000077','Festive Season Campaign Landing Pages','₹6,000.00','Completed','muted','Sep 2, 2026','Fully delivered &amp; billed']].map(([t,s,a,st,tn,d,v])=>`
  <a class="panel-row" href="${LT(r,'apps/web/quotes/[id]/')}" style="align-items:flex-start">
    <span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon('receipt',15)}</span>
    <div class="min-w-0 flex-1">
      <b style="font-size:13.5px">${t}</b>
      <div class="text-xs muted mt-1">${s}</div>
      <div class="text-xs dim mono mt-1">${d} · ${v}</div>
    </div>
    <div class="text-right shrink-0"><div class="mono font-bold" style="font-size:15px">${a}</div><div class="mt-1">${badge(st,tn)}</div></div>
  </a>`).join('')}
</div>
${pager('Showing 1–3 of 3')}`,
  },

  {
    path: 'apps/web/quotes/new/', app: 'web', title: 'Request a quote · Nestlancer', crumb: 'New quote',
    body: (r) => `
${backlink(r, 'apps/web/quotes/', 'Back to Quotes')}
<div class="panel" style="max-width:720px;margin:0 auto"><div class="empty" style="padding:56px 30px">
  <div class="e-icon">${icon('receipt',20)}</div>
  <b>Quotes are prepared by the studio</b>
  <span class="text-xs" style="max-width:48ch">Submit a request and an engineer will scope it into a line-item quote. There is no self-serve quote creation — pricing without engineering eyes is how projects die.</span>
  <div class="flex gap-3 mt-3">
    <a class="btn btn-primary" href="${LT(r,'apps/web/requests/new/')}">${icon('send',14)} Submit a request</a>
    <a class="btn btn-secondary" href="${LT(r,'apps/web/quotes/templates/')}">Browse scope templates</a>
  </div>
</div></div>`,
  },

  {
    path: 'apps/web/quotes/[id]/', app: 'web', alias: 'apps/web/quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9/', title: 'Quote #01a10f80 · Nestlancer', crumb: 'Quote detail',
    body: (r) => `
<div class="flex items-center gap-3 mb-3 text-sm">
  <a class="link-arrow" style="font-size:12.5px" href="${LT(r,'apps/web/quotes/')}">${icon('arrow-left',12)} Back to quotes</a><span class="dim">·</span><a class="link text-sm" href="${LT(r,'apps/web/requests/[id]/')}">View request</a>
</div>
<div class="flex items-start justify-between gap-4 flex-wrap">
  <div><div class="eyebrow">QUOTE</div><h1 class="ptitle">Quote #01a10f80</h1>
  <p class="psub">For: AUDIT-P23-20261005-6rdsf Request to Quote Builder</p></div>
  ${badge('Viewed','warning')}
</div>
<div class="flex-col gap-5 mt-5">
  ${panel({ title: 'Line items', actions: `<span class="mono font-bold" style="font-size:22px;color:var(--brand-11);letter-spacing:-.03em">₹1,770.00</span>`, pad: false, body: table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Unit price',r:1},{l:'Total',r:1}], rows: [
    ['AUDIT-P23 edited deliverable: quote builder regression package','1','<span class="mono">₹1,500.00</span>','<span class="mono font-semibold">₹1,500.00</span>'],
    ['<span class="dim">Subtotal</span>','','','<span class="mono muted">₹1,500.00</span>'],
    ['<span class="dim">GST (18%)</span>','','','<span class="mono muted">₹270.00</span>'],
    ['<b>Total</b>','','','<span class="mono font-bold" style="font-size:16px">₹1,770.00</span>'],
  ]})})}
  ${panel({ title: 'Payment schedule', sub: 'Installments due over the life of this engagement', pad: false, body: table({ cols: [{l:'Milestone'},{l:'Share',r:1},{l:'Amount',r:1},{l:'Due',r:1}], rows: [
    ['Deposit','<span class="mono">50%</span>','<span class="mono">₹885.00</span>','<span class="dim">Upon acceptance</span>'],
    ['Final payment','<span class="mono">50%</span>','<span class="mono">₹885.00</span>','<span class="dim">Upon prior milestone approval</span>'],
  ]})})}
  ${panel({ title: 'Documents', sub: 'Download the latest quote PDF and service agreement.', body: `
    <div class="flex gap-3 flex-wrap">
      <button class="btn btn-primary">${icon('download',14)} Download quote PDF</button>
      <button class="btn btn-primary btn-secondary">${icon('download',14)} Preview service agreement (draft)</button>
    </div>` })}
  ${panel({ title: 'Service agreement', sub: 'Review the draft service agreement before accepting. Acceptance electronically signs the Nestlancer service agreement for this project.', body: `
    <div class="panel" style="padding:16px;background:var(--bg-hover)">
      <div class="eyebrow mb-3">ACCEPT &amp; SIGN</div>
      <label class="check mb-4"><input type="checkbox"> <span>I have read the service agreement and agree to the terms &amp; conditions for this project.</span></label>
      <div class="field mb-4"><label class="label">Legal name (e-signature) ${icon('help-circle',12)}</label><input class="input" placeholder="Type your full legal name"></div>
      <button class="btn btn-primary" disabled>Accept quote &amp; sign agreement ${icon('arrow-right',14)}</button>
      <div class="text-xs dim mt-3">Check the agreement box below to continue.</div>
    </div>` })}
  ${panel({ title: 'Terms &amp; conditions', body: `
    <div class="prose" style="font-size:12.8px">
      <b class="eyebrow block mb-2">STANDARD TERMS</b>
      <ol style="padding-left:18px;list-style:decimal;color:var(--ink-2)">${[
        'Validity — This quote remains valid until the date shown above unless extended in writing by Nestlancer.',
        'Acceptance — Engagement begins when the client accepts this quote in the Nestlancer dashboard and, where applicable, completes the first scheduled payment.',
        'Payment — Fees follow the payment schedule in this quote. Late payment may pause work until the account is current.',
        'Scope — Deliverables are limited to the line items and description in this quote. Additional work requires a written change order.',
        'Revisions — Included revision rounds are as stated in this quote; extra rounds may be billed at the rate shown or as mutually agreed.',
        'Client responsibilities — Timely feedback, content, credentials, and approvals are required so delivery dates can be met.',
        'Intellectual property — Upon full payment of all amounts due, the client receives the agreed rights to final deliverables. Nestlancer retains ownership of pre-existing tools, libraries, and generic components.',
        'Confidentiality — Both parties will keep non-public information shared during the project confidential.',
        'Limitation of liability — Nestlancer&#39;s total liability under this quote is limited to fees paid hereunder, except where applicable law does not permit such limitation.',
        'Governing law — These terms are governed by the laws of India; courts at Nestlancer&#39;s principal place of business have exclusive jurisdiction unless otherwise agreed in writing.',
      ].map(t=>`<li style="margin-bottom:6px;line-height:1.6">${t}</li>`).join('')}</ol>
      <b class="eyebrow block mt-5 mb-2">PROJECT-SPECIFIC TERMS</b>
      <p class="text-sm muted">AUDIT-P23 project-specific term: client supplies approvals within two business days.</p>
      <p class="text-sm mt-4">Valid until: <b>Oct 20, 2026</b></p>
    </div>` })}
</div>
<div class="actionbar">
  <button class="btn btn-secondary btn-lg">Negotiate</button>
  <button class="btn btn-danger-soft btn-lg">${icon('x',14)} Decline</button>
  <span class="text-xs dim mr-auto ml-2">Complete the agreement section above to accept</span>
  <button class="btn btn-primary btn-lg" disabled>Complete agreement to accept</button>
</div>`,
  },

  {
    path: 'apps/web/quotes/drafts/', app: 'web', title: 'Quote drafts · Nestlancer', crumb: 'Drafts',
    body: (r) => `
${backlink(r, 'apps/web/quotes/', 'Back to Quotes')}
${phead({ eyebrow: 'WORK IN PROGRESS', title: 'Quote drafts', sub: 'The studio is still preparing these proposals. You&#39;ll be notified the moment one is sent.' })}
<div class="panel">
  <div class="panel-row"><span class="avatar sq" style="width:34px;height:34px;border-radius:9px;background:var(--bg-subtle);color:var(--ink-3)">${icon('edit',15)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13.5px">HR onboarding automation — scope in review</b><div class="text-xs dim mt-1">Requested Oct 9, 2026 · Operator: Riya Kapoor · comments visible in Messages</div></div>
    ${badge('Drafting','neutral')}<button class="btn btn-ghost btn-sm">Nudge studio</button></div>
</div>
${note('info','info','Drafts show intent, not price. Amounts appear when the quote is formally <b>sent</b>.')}`,
  },

  {
    path: 'apps/web/quotes/templates/', app: 'web', title: 'Quote templates · Nestlancer', crumb: 'Templates',
    body: (r) => `
${backlink(r, 'apps/web/quotes/', 'Back to Quotes')}
${phead({ eyebrow: 'SCOPE LIBRARY', title: 'Scope templates', sub: 'Pre-engineered scopes for common jobs. Pick one as the seed for your next request — line items arrive pre-drafted.' })}
<div class="grid gap-4" style="grid-template-columns:1fr 1fr">
  ${[['Marketing site rebuild','Design + 8–12 pages + CMS + SEO pass','₹2.4L – ₹4.6L','12 line items'],
     ['Internal dashboard','Role-based admin + reports + exports','₹1.8L – ₹3.2L','9 line items'],
     ['Payment integration','Razorpay/UPI + reconciliation webhooks','₹0.9L – ₹1.6L','7 line items'],
     ['Mobile app MVP','React Native, one platform, auth + core loop','₹3.5L – ₹6.0L','14 line items']].map(([t,s,p,n])=>`
  <div class="panel panel-pad">
    <div class="flex items-center justify-between mb-2"><b class="h3" style="font-size:15px">${t}</b><span class="mono text-xs brand-text">${p}</span></div>
    <div class="text-sm muted mb-4" style="line-height:1.6">${s}</div>
    <div class="flex items-center justify-between">
      <span class="text-xs dim mono">${n}</span>
      <a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/requests/new/')}">Start from this ${icon('arrow-right',12)}</a>
    </div>
  </div>`).join('')}
</div>`,
  },
];
