// ============================================================================
// ROUTES — apps/admin OPERATOR CONSOLE — part 1
// Root · Login · Command center · Requests (5) · Pipeline (5) · Projects (6) · Quotes (6)
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, stats, table, tabs, filterbar, searchInput, sel, pager, progress, timeline, kv, field, input, textarea, switchRow, empty, lineChart, barChart, donut, convItem } from '../lib/comps.mjs';
import { phead, backlink } from '../lib/chrome.mjs';
import { REQ_LIST, CLIENTS } from './data.mjs';

const hexId = (s) => `<span class="mono" style="font-size:11px;color:var(--ink-3)">${s.slice(0, 8)}…</span>`;

const capacityPanel = `
<div class="panel mb-5">
  <div class="panel-head"><div><div class="panel-title">Capacity dashboard</div><div class="panel-sub">Studio load vs configured limits. Adjust thresholds when intake should slow down.</div></div><span class="badge tone-success">Intake open</span></div>
  <div class="panel-body" style="padding-top:4px">
    <div class="grid g4 gap-4 mb-4">
      ${[['Active projects','7'],['Queued requests','16'],['Capacity used','28%'],['Max active','25']].map(([l,v])=>`<div style="padding:12px 14px;border-right:1px solid var(--line)"><div class="text-xs dim">${l}</div><div class="mono font-bold mt-1" style="font-size:19px">${v}</div></div>`).join('')}
    </div>
    <div class="grid g2 gap-4 mb-3">
      <div class="field"><label class="label">Max active projects</label><input class="input sm" value="25"></div>
      <div class="field"><label class="label">Warning threshold</label><input class="input sm" placeholder="e.g. 80%"></div>
    </div>
    <button class="btn btn-primary btn-sm" disabled>Update capacity settings</button>
    <div class="text-xs dim mt-2">Enter a max active count or warning threshold to enable save.</div>
  </div>
</div>`;

const reqRows = REQ_LIST.map((q) => [
  `<span class="mono" style="font-size:11.5px">${q.id.slice(0, 8)}…</span> <button class="btn btn-ghost btn-xs mono" style="height:20px;font-size:9.5px;padding:0 5px">COPY</button>`,
  `<b style="font-size:12.8px">${q.t}</b>`,
  badge(q.status, q.tone),
  `<span class="dim">${q.cat}</span>`,
  `<span style="font-size:12px">${q.client}</span>`,
  `<span class="text-xs dim nowrap">${q.date}</span>`,
  `<a class="link font-semibold" style="font-size:12.5px" href="/REQ/">Review →</a>`,
]);

export default [
  // ------------------------------------------------------------- root redirect
  {
    path: 'apps/admin/', app: 'admin', title: 'Nestlancer Admin', redirect: 'apps/admin/dashboard/',
    body: (r) => `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px"><span class="avatar sq" style="width:48px;height:48px;background:var(--brand-2);color:var(--brand-11)">${icon('gauge',22)}</span><b>Opening command center…</b><a class="link text-sm" href="${LT(r,'apps/admin/dashboard/')}">Continue →</a></div>`,
  },

  // ------------------------------------------------------------- login
  {
    path: 'apps/admin/login/', title: 'Operator sign-in · Admin', auth: 'center', app: 'admin',
    card: (r) => `
<div class="auth-card">
  <div class="flex items-center gap-2 mb-5">${icon('shield',16)}<b style="font-size:14px;letter-spacing:-.01em">Operator sign-in</b></div>
  <div class="field mb-4"><label class="label">Work email <span class="req">*</span></label><input class="input" type="email" placeholder="admin@nestlancer.com" autocomplete="username"></div>
  <div class="field mb-4"><label class="label">Password <span class="req">*</span></label><input class="input" type="password" placeholder="Enter your operator password" autocomplete="current-password"></div>
  <label class="check mb-5"><input type="checkbox"> <span>Trust this device for 12 hours</span></label>
  <form action="${LT(r,'apps/admin/dashboard/')}" method="get"><button class="btn btn-primary w-full" type="submit">Sign in to console</button></form>
  <div class="note warn mt-4" style="font-size:11.5px">${icon('alert-triangle',14)}<div>Staff only. Sign-ins from unrecognized networks require an email challenge. Every session is audit-logged.</div></div>
  <div class="text-center text-xs dim mt-4">Client? <a class="link" href="${LT(r,'apps/web/login/')}">Use the client portal sign-in</a></div>
</div>`,
  },

  // ------------------------------------------------------------- dashboard
  {
    path: 'apps/admin/dashboard/', app: 'admin', title: 'Command center · Admin', crumb: 'Command center',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Command center', sub: 'Live revenue, queues, and what needs action — refreshed every 30s.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/pipeline/')}">Pipelines</a><a class="btn btn-secondary" href="${LT(r,'apps/admin/analytics/')}">Analytics</a><a class="btn btn-primary" href="${LT(r,'apps/admin/messages/inbox/')}">${icon('inbox',14)} Inbox</a>` })}
<div class="panel mb-5">
  <div class="panel-row" style="padding:12px 18px"><span class="font-semibold" style="font-size:13px">${icon('chevron-down',14)} Needs attention</span><span class="badge tone-success">Live</span><span class="badge tone-success ml-auto" style="margin-left:auto">System healthy</span></div>
  <div class="grid g6" style="padding:4px 0">
    ${[['Pending requests','11','var(--t-warning-dot)'],['Open quotes','7','var(--t-info-dot)'],['Pending pay','16','var(--t-warning-dot)'],['Flagged msgs','0','var(--t-success-dot)'],['Contact new','17','var(--brand-8)'],['Alerts','0','var(--t-success-dot)']].map(([l,v,c])=>`
    <div style="padding:12px 16px;border-left:3px solid ${c}"><div class="text-xs dim">${l}</div><div class="mono font-bold" style="font-size:20px">${v}</div></div>`).join('')}
  </div>
</div>
<div class="flex items-center justify-between mb-2">
  <span class="text-xs dim">Period metrics · Sep 11, 2026, 12:00 AM — Oct 10, 2026, 7:26 AM · 30d window</span>
  <div class="seg">${['7 days','30 days','90 days','1 year'].map((d,i)=>`<button class="${i===1?'active':''}">${d}</button>`).join('')}</div>
</div>
${stats([
  { label: 'Revenue (month)', value: '₹7,08,160.00', note: 'INR · ₹2,60,790.00 awaiting', dir: 'up' },
  { label: 'Total users', value: '34', note: '↑ new' },
  { label: 'New users', value: '34', note: 'This window' },
  { label: 'Active projects', value: '4', note: '↑ new' },
  { label: 'Completed projects', value: '10', note: '↑ new' },
  { label: 'Pending requests', value: '11', note: '↑ new' },
], 6)}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Revenue trajectory', sub: 'Sep 11 — Oct 10 · 30d window', actions: `<div class="seg">${['7 days','30 days','90 days','1 year'].map((d,i)=>`<button class="${i===1?'active':''}">${d}</button>`).join('')}</div>`, pad: true, body: lineChart({ seed: 42, data: [8,9,8,10,12,11,10,12,14,13,12,14,15,13,20,88,42,16,14,15,14,13,14,15], labels: ['09-11','09-18','09-26','10-03','10-10'] }) + '<div class="text-xs dim mono mt-2">30 points · latest ₹0.00</div>' })}
  ${panel({ title: 'Project mix', sub: 'Lifecycle share', pad: true, body: donut({ parts: [
    { l: 'In Progress', v: 4, c: 'var(--brand-8)', d: '4 · 24%' },
    { l: 'Pending Payment', v: 3, c: 'var(--t-info-dot)', d: '3 · 18%' },
    { l: 'Completed', v: 10, c: 'var(--t-warning-dot)', d: '10 · 59%' },
  ]}) })}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr">
  ${panel({ title: 'Recent requests', sub: 'Newest inbound work', actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/requests/')}">View all →</a>`, pad: false, body: table({ cols: [{l:'Request'},{l:'Customer'},{l:'Subject'},{l:'Status'}], compact: false, rows: [
    [hexId('01a10fa4-8fd5'),'<b>Arjun Mehta</b>','AUDIT-P23-LINE-20261005-7r0l Request',badge('Submitted','warning')],
    [hexId('01a10fa3-acfd'),'<b>Arjun Mehta</b>','AUDIT-P23-SUPP-20261005-6grw Request',badge('Submitted','warning')],
    [hexId('01a10f87-f3cf'),'<b>Arjun Mehta</b>','AUDIT-P25-20261005-73dhk Project Fixture',badge('Converted To Project','info')],
    [hexId('01a10f84-ddf5'),'<b>Arjun Mehta</b>','AUDIT-P24-20261005-6y6fa-draft Request',badge('Submitted','warning')],
  ]})})}
  ${panel({ title: 'Recent payments', sub: '16 pending · ₹2,60,790.00', actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/payments/')}">View all →</a>`, pad: false, body: table({ cols: [{l:'Client'},{l:'Project'},{l:'Amount',r:1},{l:'Paid'}], rows: [
    ['<b>Sandeep Chopra</b>','GPS Fleet Tracking Portal','<span class="mono">₹21,600.00</span>','<span class="text-xs dim">Oct 5, 2026 AM</span>'],
    ['<b>Karthik Menon</b>','UPI Switch Integration Layer','<span class="mono">₹36,000.00</span>','<span class="text-xs dim">Oct 5, 2026 AM</span>'],
    ['<b>Pooja Kulkarni</b>','Multi-Branch Clinic Booking','<span class="mono">₹19,500.00</span>','<span class="text-xs dim">Oct 5, 2026 AM</span>'],
    ['<b>Pooja Kulkarni</b>','Multi-Branch Clinic Booking','<span class="mono">₹26,000.00</span>','<span class="text-xs dim">Oct 5, 2026 AM</span>'],
  ]})})}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Request volume over time', sub: 'Inbound briefs · last 30 days · live', actions: '<span class="badge tone-info">46 total</span>', pad: true, body: barChart({ data: [3,2,4,3,5,4,3,2,4,6,3,2,4,3,5,22,9,4,3,2,3,4,2,3], labels: ['09-11','09-18','09-26','10-03','10-10'] }) + '<div class="text-xs dim mono mt-2">30 points · latest 0</div>' })}
  <div class="panel"><div class="panel-head"><div><div class="panel-title">Moderation queues</div><div class="panel-sub">Flagged + contact inbox</div></div></div>
    ${[['shield','Flagged messages','0','apps/admin/moderation/'],['inbox','New contact mail','17','apps/admin/contact/'],['clock','Pending settlements','16','apps/admin/payments/'],['message','Message center','→','apps/admin/messages/']].map(([i,t,v,h])=>`
    <a class="panel-row" href="${LT(r,h)}"><span class="avatar sq" style="width:30px;height:30px;background:var(--bg-subtle);color:var(--ink-2)">${icon(i,13)}</span><b style="font-size:13px" class="flex-1">${t}</b><span class="mono font-semibold">${v}</span></a>`).join('')}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- REQUESTS
  {
    path: 'apps/admin/requests/', app: 'admin', title: 'Requests · Admin', crumb: 'Requests',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Requests', sub: 'Review submitted client requests, update status, assign operators, and create quotes. Client drafts are hidden from the default inbox.' })}
${capacityPanel}
<div class="grid g4 gap-4 mb-5">
  ${[['Total','46'],['By Category','6'],['Average Response Time','0 minutes'],['Conversion Rate','43.9%']].map(([l,v])=>`<div class="panel" style="padding:14px 16px"><div class="text-xs dim">${l}</div><div class="mono font-bold mt-1" style="font-size:19px">${v}</div></div>`).join('')}
</div>
${filterbar(`${searchInput('Search requests…', 260)}<span class="text-xs dim">Status</span>${sel(['Inbox (needs review)','Submitted','Under review','Quoted','Converted','All'],'Inbox (needs review)')}<button class="btn btn-ghost btn-sm ml-auto">Clear</button>`)}
<div class="panel">
${table({ cols: [{l:'ID'},{l:'Title'},{l:'Status'},{l:'Category'},{l:'Client'},{l:'Created'},{l:'Actions'}], rows: reqRows.map((row) => row.map((c) => String(c).replace('/REQ/', LT(r, 'apps/admin/requests/[id]/')))) })}
</div>
${pager('Showing 1–13 of 13')}`,
  },

  {
    path: 'apps/admin/requests/capacity/', app: 'admin', title: 'Capacity · Requests · Admin', crumb: 'Capacity',
    body: (r) => `
${backlink(r, 'apps/admin/requests/', 'Back to requests')}
${phead({ eyebrow: 'OPERATIONS', title: 'Capacity planning', sub: 'Studio load, per-operator allocation, and the thresholds that gate new intake.' })}
${capacityPanel}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  ${panel({ title: 'Operator load', sub: 'Active engagements per operator vs soft cap', pad: false, body: table({ cols: [{l:'Operator'},{l:'Active'},{l:'Queued'},{l:'Load'},{l:'State'}], rows: [
    ...[['Riya Kapoor — Admin','4','3',68,'OK','success'],['Arjun Nair — Delivery','2','5',84,'Near cap','warning'],['Dev Malhotra — Eng','1','4',46,'OK','success'],['Sunita Rao — Finance','0','2',12,'OK','success']].map(([o,a,q,load,state,tn])=>
      [`<b>${o}</b>`,`<span class="mono">${a}</span>`,`<span class="mono">${q}</span>`,`<div class="flex items-center gap-2" style="min-width:140px">${progress(load)}<span class="mono text-xs">${load}%</span></div>`,badge(state,tn)])
  ]})})}
</div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Intake gates', body: `
      ${switchRow('Accept new requests','Off shows “capacity full” on the public intake form', true)}
      ${switchRow('Auto-pause at warning threshold','Intake closes when load exceeds the warning %', true)}
      ${switchRow('Priority lane for existing clients','Accounts with active projects skip the queue', true)}
    ` })}
    ${panel({ title: 'SLA targets', body: kv([
      ['First engineer review','<b class="mono">&lt; 24h</b>'],
      ['Quote turnaround','<b class="mono">&lt; 3 business days</b>'],
      ['Breach alerts','#ops-alerts (Slack)'],
    ])})}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/requests/[id]/', app: 'admin', alias: 'apps/admin/requests/6a4110f3-1507-769c-99d0-253425f8a1/', title: 'AUDIT-P23-LINE Request · Admin', crumb: 'Request detail',
    body: (r) => `
${backlink(r, 'apps/admin/requests/', 'Back to requests')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div class="min-w-0"><div class="eyebrow mono mb-1">REQUEST · 01A10FA4-8FD5-712E-97D7-7D3D12F94976</div>
  <h1 class="ptitle" style="font-size:22px">AUDIT-P23-LINE-20261005-7r0l Request</h1>
  <div class="flex gap-2 mt-2">${badge('Submitted','warning')}${badge('Web Development','neutral')}</div></div>
  <div class="flex gap-2"><a class="btn btn-secondary" href="${LT(r,'apps/admin/requests/[id]/quote/edit/')}">Edit draft quote</a><a class="btn btn-primary" href="${LT(r,'apps/admin/requests/[id]/quote/new/')}">${icon('receipt',14)} Create quote</a></div>
</div>
${note('info','zap','<b>Ready to quote.</b> Engineer review notes are complete and capacity is available — this request can be priced now.')}
<div class="grid gap-5 mt-4" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Brief', body: `
      <p class="text-sm" style="line-height:1.7">${'Regression coverage request for the AUDIT-P23 line: the client wants a repeatable test pack for the quote-builder flow before the November pricing change ships.'}</p>
      <div class="grid g2 gap-4 mt-4">${[['Budget signaled','₹1.5L – ₹2.2L'],['Desired start','Oct 20, 2026'],['Hard deadline','Nov 5, 2026'],['Attachments','2 files']].map(([k,v])=>`<div><div class="text-xs dim">${k}</div><b class="mono mt-1 block" style="font-size:13px">${v}</b></div>`).join('')}</div>` })}
    ${panel({ title: 'Engineer review notes', sub: 'Written during triage — visible to operators only', body: `
      <div class="panel" style="padding:12px 14px;background:var(--bg-hover)">
        <div class="flex items-center gap-2 mb-2">${'<span class="avatar hue-2">DN</span>'}<b style="font-size:12.5px">Dev Malhotra</b><span class="text-xs dim">Oct 6, 2026 · triage</span></div>
        <p class="text-sm muted" style="line-height:1.65">Scope is tight and testable: seed script for 3 quote variants, Playwright pack around builder UI, snapshot of pricing math. 4–5 days of work. Recommend fixed quote at ₹1,770 pilot to win the larger November program.</p>
      </div>
      <div class="mt-3">${field('Add internal note', textarea('Note for operators…', '', 3), { req: false })}
      <div class="flex gap-2 mt-3"><button class="btn btn-secondary btn-sm">Save note</button></div></div>` })}
    ${panel({ title: 'Status history', body: timeline([
      { title: 'Submitted', sub: 'Client submitted via portal intake', time: 'Oct 6, 2026, 3:47 AM' },
      { title: 'Under review', sub: 'Assigned to Dev Malhotra for triage', time: 'Oct 6, 2026, 9:12 AM', mut: true },
      { title: 'Ready to quote', sub: 'Triage complete — pricing recommended', time: 'Oct 7, 2026, 11:40 AM' },
    ])})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Client', body: `
      <div class="flex items-center gap-3 mb-3"><span class="avatar hue-3 lg">AM</span><div class="min-w-0"><b style="font-size:14px">Arjun Mehta</b><div class="text-xs dim">Mehta Consulting Group · Mumbai</div></div></div>
      ${kv([['Account age','14 months'],['Lifetime billed','<span class="mono">₹3,18,400</span>'],['Open requests','4'],['Health',badge('Good','success')]])}
      <a class="btn btn-secondary btn-sm w-full mt-3" href="${LT(r,'apps/admin/users/[id]/')}">Open client 360</a>` })}
    ${panel({ title: 'Controls', body: `
      ${field('Status', '<select class="select"><option>Draft</option><option selected>Submitted</option><option>Under review</option><option>Quoted</option><option>Converted to project</option><option>Rejected</option></select>', { req: false })}
      <div class="mt-3">${field('Assign operator', '<select class="select"><option selected>Riya Kapoor</option><option>Arjun Nair</option><option>Dev Malhotra</option></select>', { req: false })}</div>
      <button class="btn btn-primary w-full mt-3">Update request</button>
      <button class="btn btn-danger w-full mt-2">${icon('x',13)} Reject with reason</button>` })}
    ${note('warn','shield','Rejection emails the client your reason verbatim. Operators can&#39;t delete requests — only reject or archive.')}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/requests/[id]/quote/new/', app: 'admin', alias: 'apps/admin/requests/6a4110f3-1507-769c-99d0-253425f8a1/quote/new/', title: 'Quote builder · Admin', crumb: 'New quote',
    body: (r) => `
${backlink(r, 'apps/admin/requests/[id]/', 'Back to request')}
${phead({ eyebrow: 'QUOTE BUILDER', title: 'Create quote', sub: 'Price the request into line items, a schedule, and terms — then send or save a draft.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Line items', actions: `<button class="btn btn-secondary btn-sm">${icon('plus',13)} Add item</button>`, pad: false, body: `
      ${table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Unit price',r:1},{l:'Total',r:1}], rows: [
        [`<input class="input sm" value="Quote-builder regression pack — seed data + Playwright suite">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="1500.00">','<span class="mono">₹1,500.00</span>'],
        [`<input class="input sm" placeholder="Describe another deliverable…">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="0.00">','<span class="mono dim">₹0.00</span>'],
      ], compact: true })}
      <div class="panel-foot">
        ${kv([['Subtotal','<span class="mono">₹1,500.00</span>'],['GST (18%)','<span class="mono">₹270.00</span>'],['Total','<span class="mono font-bold" style="font-size:18px">₹1,770.00</span>']])}
      </div>` })}
    ${panel({ title: 'Payment schedule', body: `
      <div class="flex gap-2 mb-4">${['50 / 50','30 / 40 / 30','100% on completion'].map((s,i)=>`<span class="chip${i===0?' active':''}">${s}</span>`).join('')}</div>
      ${table({ cols: [{l:'Milestone'},{l:'Share',r:1},{l:'Amount',r:1},{l:'Due'}], compact: true, rows: [
        ['<b>Deposit</b>','<span class="mono">50%</span>','<span class="mono">₹885.00</span>','<select class="select sm"><option>Upon acceptance</option></select>'],
        ['<b>Final payment</b>','<span class="mono">50%</span>','<span class="mono">₹885.00</span>','<select class="select sm"><option>Upon milestone approval</option></select>'],
      ]})}` })}
    ${panel({ title: 'Terms', body: `
      ${field('Validity', '<select class="select"><option selected>10 days</option><option>14 days</option><option>30 days</option></select>', { req: false })}
      <div class="mt-3">${field('Project-specific terms', textarea('One term per line — appended after standard terms.', 'AUDIT-P23 project-specific term: client supplies approvals within two business days.', 3), { req: false })}</div>
      <div class="check mt-3"><input type="checkbox" checked> <span>Attach standard Nestlancer terms (v3.2)</span></div>` })}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Context', body: kv([
      ['Client','<b>Arjun Mehta</b>'],
      ['Request','<a class="link mono" style="font-size:11px" href="'+LT(r,'apps/admin/requests/[id]/')+'">01a10fa4…</a>'],
      ['Budget signaled','<span class="mono">₹1.5L – ₹2.2L</span>'],
      ['Quote ID','<span class="mono">#01a10f80 (draft)</span>'],
      ['Engineer rec.','<span class="mono">₹1,770 pilot</span>'],
    ])})}
    <div class="panel"><div class="panel-head"><div class="panel-title">Send</div></div>
      <div class="panel-body">
        <div class="check mb-3"><input type="checkbox" checked> <span>Email client on send</span></div>
        <div class="check mb-4"><input type="checkbox" checked> <span>Attach PDF + service agreement</span></div>
        <button class="btn btn-primary w-full btn-lg">${icon('send',15)} Send quote</button>
        <button class="btn btn-secondary w-full mt-2">Save as draft</button>
        <div class="text-xs dim mt-3">Sending marks the request <b>QUOTED</b> and notifies the client in-app and by email.</div>
      </div>
    </div>
  </div>
</div>`,
  },

  {
    path: 'apps/admin/requests/[id]/quote/edit/', app: 'admin', alias: 'apps/admin/requests/6a4110f3-1507-769c-99d0-253425f8a1/quote/edit/', title: 'Edit quote · Admin', crumb: 'Edit quote',
    body: (r) => `
${backlink(r, 'apps/admin/requests/[id]/', 'Back to request')}
${phead({ eyebrow: 'QUOTE BUILDER', title: 'Edit draft quote #01a10f80', sub: 'Editing a sent quote creates a new version — the client always sees the latest.' })}
${note('warn','history','<b>Versioned edit.</b> v1 was sent Oct 5. Saving creates <b>v2</b>; the audit trail keeps every diff with your operator name attached.')}
<div class="grid gap-5 mt-4" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Line items (v2 draft)', pad: false, body: `
      ${table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Unit price',r:1},{l:'Total',r:1}], rows: [
        [`<input class="input sm" value="AUDIT-P23 edited deliverable: quote builder regression package">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="1500.00">','<span class="mono">₹1,500.00</span>'],
        [`<input class="input sm" value="Added in v2: CI wiring on client runners">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="800.00" style="border-color:var(--t-warning-bd)">','<span class="mono" style="color:var(--t-warning-tx)">+₹800.00</span>'],
      ], compact: true })}
      <div class="panel-foot">${kv([['Subtotal','<span class="mono">₹2,300.00</span>'],['GST (18%)','<span class="mono">₹414.00</span>'],['Total','<span class="mono font-bold" style="font-size:18px">₹2,714.00</span> <span class="badge tone-warning" style="margin-left:6px">v1 ₹1,770</span>']])}</div>` })}
    ${panel({ title: 'Change note (sent to client)', body: `${field('Why the revision?', textarea('Shown in the client notification and stored in audit.', 'Scope grew: CI wiring now includes self-hosted runner setup.', 3), { req: false })}` })}
    <div class="flex gap-2"><button class="btn btn-primary">${icon('send',14)} Send v2</button><button class="btn btn-secondary">Save draft</button><button class="btn btn-ghost" style="color:var(--t-danger-tx)">Discard changes</button></div>
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Version history', pad: false, body: `
      ${[['v2 — draft','Unsaved changes · now','warning'],['v1 — sent','Oct 5, 2026 · viewed by client','info']].map(([t,s,tn])=>`<div class="panel-row">${badge(tn === 'warning' ? 'Draft' : 'Sent', tn)}<div class="min-w-0 flex-1"><b style="font-size:12.8px">${t}</b><div class="text-xs dim">${s}</div></div><button class="btn btn-ghost btn-xs">Diff</button></div>`).join('')}` })}
    ${panel({ title: 'Recent client activity', body: timeline([
      { title: 'Quote viewed', time: 'Oct 5, 2026, 6:12 PM' },
      { title: 'PDF downloaded', time: 'Oct 5, 2026, 6:14 PM', mut: true },
    ])})}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- PIPELINE
  {
    path: 'apps/admin/pipeline/', app: 'admin', title: 'Pipelines · Admin', crumb: 'Pipelines',
    body: (r) => `
${tabs([
  { l: 'Stage pipeline', active: true }, { l: 'User hub', href: LT(r,'apps/admin/pipeline/users/') }, { l: 'Project hub', href: LT(r,'apps/admin/pipeline/projects/') },
])}
${phead({ eyebrow: 'OPERATIONS', title: 'Pipelines', sub: 'Stage pipeline for platform-wide triage. Use User hub or Project hub to drill into one client or one engagement.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/pipeline/users/')}">User hub</a><a class="btn btn-secondary" href="${LT(r,'apps/admin/pipeline/projects/')}">Project hub</a>` })}
${panel({ title: 'Client delivery', sub: 'End-to-end flow from first contact through paid delivery. Each stage feeds the next — manage the full client journey in order.', pad: true, body: `
  <div class="text-xs dim mb-3">Serves: Clients requesting Nestlancer services</div>
  <div class="grid g6 gap-4">
    ${[['inbox','23','Inquiries','Website contact form leads','Qualify lead and convert to request','apps/admin/contact/'],
       ['clipboard','46','Requests','Scoped service requests','Triage, assign, and prepare quote','apps/admin/requests/'],
       ['receipt','36','Quotes','Pricing proposals','Send quote and track acceptance','apps/admin/quotes/'],
       ['folder','18','Projects','Active delivery work','Manage milestones and deliverables','apps/admin/projects/'],
       ['card','48','Payments','Milestone payments and payouts','Release funds and resolve disputes','apps/admin/payments/'],
       ['message','24','Messages','Project communication','Monitor threads and system broadcasts','apps/admin/messages/']]
      .map(([i,n,t,d,s,h],ix)=>`
      <a class="panel panel-pad" href="${LT(r,h)}" style="display:block;position:relative">
        <div class="flex items-start justify-between"><span class="avatar sq" style="width:32px;height:32px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i,15)}</span><span class="mono font-bold" style="font-size:22px;letter-spacing:-.03em">${n}</span></div>
        <b class="mt-3 block" style="font-size:14.5px;letter-spacing:-.015em">${t}</b>
        <div class="text-sm mt-1" style="color:var(--ink-1)">${d}</div>
        <div class="text-xs dim mt-2" style="line-height:1.5">${s}</div>
        ${ix<5?`<span style="position:absolute;right:-14px;top:44%;color:var(--line-strong)">${icon('chevron-right',18)}</span>`:''}
      </a>`).join('')}
  </div>` })}
${panel({ title: 'Users &amp; trust', sub: 'Manage all client and operator accounts, enforce platform safety, and maintain an audit trail.', pad: true, cls: 'mt-5', body: `
  <div class="text-xs dim mb-3">Serves: Every registered user on the platform</div>
  <div class="grid g3 gap-4">
    ${[['users','34','Users','Accounts, roles, sessions','Review profile, role, and sessions','apps/admin/users/'],
       ['shield-check','—','Moderation','Flagged messages and abuse','Dismiss, escalate, or remove content','apps/admin/moderation/'],
       ['history','—','Audit logs','Auth and admin action history','Investigate security events','apps/admin/audit/']]
      .map(([i,n,t,d,s,h])=>`
      <a class="panel panel-pad" href="${LT(r,h)}" style="display:block">
        <div class="flex items-start justify-between"><span class="avatar sq" style="width:32px;height:32px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i,15)}</span><span class="mono font-bold" style="font-size:22px">${n}</span></div>
        <b class="mt-3 block" style="font-size:14.5px">${t}</b><div class="text-sm mt-1">${d}</div><div class="text-xs dim mt-2">${s}</div>
      </a>`).join('')}
  </div>` })}
${panel({ title: 'Standalone consoles', sub: 'Independent tools — not sequential pipeline stages', pad: true, cls: 'mt-5', body: `
  <div class="grid g4 gap-4">
    ${[['Dashboard','KPIs, revenue, alerts','apps/admin/dashboard/'],['Analytics','Deep metrics and trends','apps/admin/analytics/'],['Blog','Posts, comments, and taxonomy','apps/admin/content/'],['Portfolio','Public showcase items','apps/admin/portfolio/'],['Media','Files and quarantine','apps/admin/media/'],['System','Config, jobs, flags','apps/admin/system/'],['Webhooks','Outbound integrations','apps/admin/integrations/'],['API keys','Scoped programmatic access','apps/admin/api-keys/']]
      .map(([t,d,h])=>`<a class="panel" style="padding:14px 16px;display:block" href="${LT(r,h)}"><b style="font-size:13.5px">${t}</b><div class="text-xs dim mt-1">${d}</div></a>`).join('')}
  </div>` })}
${panel({ title: 'Admin API reference', sub: '157 endpoints across 16 feature areas · base path /api/v1', pad: false, cls: 'mt-5', body: `
  ${[['Inquiries','6'],['Requests','11'],['Quotes','10'],['Projects','20'],['Payments','16'],['Messages','6'],['Users','21'],['Moderation','6'],['Audit logs','14'],['Dashboard','8'],['Analytics','8'],['Blog','16'],['Portfolio','10'],['Media','19'],['System','14'],['Webhooks','14']].map(([a,n])=>`
  <a class="panel-row" href="${LT(r,'apps/admin/api-keys/')}" style="padding:11px 20px"><b style="font-size:13.5px">${a}</b><span class="mono text-xs dim ml-auto">${n} endpoints ›</span></a>`).join('')}`})}`,
  },

  {
    path: 'apps/admin/pipeline/projects/', app: 'admin', title: 'Project hub · Pipeline · Admin', crumb: 'Project hub',
    body: (r) => `
${backlink(r, 'apps/admin/pipeline/', 'Back to pipelines')}
${phead({ eyebrow: 'PROJECT HUB', title: 'Project hub', sub: 'Every engagement with its stage, money state, and review pressure — sorted by what needs an operator today.' })}
${filterbar(`${searchInput('Search projects…', 240)}${sel(['All stages','Discovery','Design','Frontend','QA','Handover'])}${sel(['Financial state','Outstanding > 0','Paid in full'])}`)}
<div class="panel">
${table({ cols: [{l:'Project'},{l:'Client'},{l:'Stage'},{l:'Milestones'},{l:'Outstanding',r:1},{l:'Updated'},{l:''}], rows: [
  ...[['Frontend — SaaS Landing Redesign','NL-204','Priya Nair','Frontend',68,'₹48,000','warning','14 min ago'],
     ['Corporate LMS for 200 Employees','NL-204','Priya Nair','QA',40,'₹20,880','warning','1h ago'],
     ['Razorpay Settlement Reconciliation Engine','NL-198','Ananya Iyer','Handover',92,'₹0','success','3h ago'],
     ['GPS Fleet Tracking Portal','NL-187','Sandeep Chopra','Frontend',54,'₹21,600','warning','Yesterday'],
     ['Multi-Branch Clinic Booking','NL-181','Pooja Kulkarni','Design',34,'₹45,500','warning','Yesterday'],
     ['Freelance Marketplace MVP','NL-166','Amit Verma','Discovery',12,'₹58,000','warning','Oct 8']]
    .map(([p,id,c,st,prog,out,tn,u])=>[
      `<b>${p}</b><div class="text-xs dim mono mt-1">${id}</div>`,c,
      badge(st,'info'),
      `<div class="flex items-center gap-2" style="min-width:130px">${progress(prog)}<span class="mono text-xs">${prog}%</span></div>`,
      `<span class="mono${tn==='warning'?' font-semibold':''}">${out}</span>`,
      `<span class="text-xs dim">${u}</span>`,
      `<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/pipeline/projects/[id]/')}">Open →</a>`])
]})}
</div>
${pager('Showing 1–6 of 18','1/3')}`,
  },

  {
    path: 'apps/admin/pipeline/projects/[id]/', app: 'admin', alias: 'apps/admin/pipeline/projects/nl-lms/', title: 'Project 360 · Pipeline · Admin', crumb: 'Project 360',
    body: (r) => `
${backlink(r, 'apps/admin/pipeline/projects/', 'Back to project hub')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">NL-204 · PROJECT 360</div><h1 class="ptitle" style="font-size:22px">Corporate LMS for 200 Employees</h1>
  <div class="flex gap-2 mt-2">${badge('In progress','info')}${badge('Milestone 3 of 5','neutral')}${badge('On schedule','success')}</div></div>
  <div class="flex gap-2"><a class="btn btn-secondary" href="${LT(r,'apps/admin/messages/project/[projectId]/')}">${icon('message',14)} Project thread</a><a class="btn btn-primary" href="${LT(r,'apps/admin/projects/[id]/')}">Full ops view</a></div>
</div>
${stats([
  { label: 'Contract', value: '₹52,200', note: 'NL-QTO-2026-000098', icon: 'receipt' },
  { label: 'Collected', value: '₹31,320', note: '60% of contract', icon: 'check-circle' },
  { label: 'Outstanding', value: '₹20,880', note: 'Mid-milestone invoice issued', icon: 'clock' },
  { label: 'Days in stage', value: '6', note: 'Frontend · median 9', icon: 'calendar' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Milestones', actions: `<button class="btn btn-secondary btn-sm">${icon('plus',13)} Add milestone</button>`, pad: false, body: table({ cols: [{l:'Milestone'},{l:'Amount',r:1},{l:'State'},{l:'Approval'}], rows: [
      ['<b>Discovery &amp; course architecture</b>','<span class="mono">₹7,830</span>',badge('Approved','success'),'<span class="text-xs dim">Client · Sep 9</span>'],
      ['<b>Platform setup &amp; SAML SSO</b>','<span class="mono">₹7,830</span>',badge('Approved','success'),'<span class="text-xs dim">Client · Sep 26</span>'],
      ['<b>Course builder + quiz engine</b>','<span class="mono">₹15,660</span>',badge('In review','info'),`<button class="btn btn-primary btn-xs">Request approval</button>`],
      ['<b>Reporting &amp; Malayalam tracks</b>','<span class="mono">₹10,440</span>',badge('Queued','neutral'),'<span class="text-xs dim">—</span>'],
      ['<b>UAT &amp; handover</b>','<span class="mono">₹10,440</span>',badge('Queued','neutral'),'<span class="text-xs dim">—</span>'],
    ]})})}
    ${panel({ title: 'Linked finance', pad: false, body: `
      <div class="panel-row">${icon('card',15)}<div class="min-w-0 flex-1"><b style="font-size:13px">Mid-project invoice NL-INV-2026-000009</b><div class="text-xs dim">Issued Oct 8 · due Oct 14</div></div><span class="mono font-semibold">₹19,200.00</span>${badge('Issued','info')}<a class="link text-xs" href="${LT(r,'apps/admin/payments/projects/[id]/')}">Ledger →</a></div>
      <div class="panel-row">${icon('check-circle',15)}<div class="min-w-0 flex-1"><b style="font-size:13px">Deposit</b><div class="text-xs dim">Paid Sep 5 · UTR verified</div></div><span class="mono">₹7,830.00</span>${badge('Paid','success')}</div>` })}
    ${panel({ title: 'Internal activity', body: timeline([
      { title: 'Staging deploy r412', sub: 'quiz-engine@2.4.1 · Preview URL posted', time: 'Today, 9:12 AM' },
      { title: 'Milestone 3 submitted for review', sub: 'Arjun Nair → client', time: 'Yesterday, 6:40 PM' },
      { title: 'SCOPE_LOCKED', sub: 'Malayalam subtitle scope frozen', time: 'Oct 8, 2026', mut: true },
    ])})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Client', body: `
      <div class="flex items-center gap-3 mb-3"><span class="avatar hue-1 lg">PN</span><div><b>Priya Nair</b><div class="text-xs dim">Nair Learning Systems · Kochi</div></div></div>
      ${kv([['Approvals pending','1'],['Avg review time','<b class="mono">1.4 days</b>'],['Contact preference','In-thread'],['Health',badge('Good','success')]])}
      <a class="btn btn-secondary btn-sm w-full mt-3" href="${LT(r,'apps/admin/pipeline/users/[id]/')}">Open client 360</a>` })}
    ${panel({ title: 'Pod', body: kv([
      ['Delivery lead','Arjun Nair'],['Engineering','Dev Malhotra · 1 IC'],['Design','Shared pool'],['QA','Playwright CI + manual pass'],
    ])})}
    ${panel({ title: 'Operator notes', body: `${textarea('Internal context for this engagement…','Client IT moves slowly on Okta metadata — build 2-day buffer into SSO milestones.', 4)}<button class="btn btn-secondary btn-sm mt-3">Save note</button>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/pipeline/users/', app: 'admin', title: 'User hub · Pipeline · Admin', crumb: 'User hub',
    body: (r) => `
${backlink(r, 'apps/admin/pipeline/', 'Back to pipelines')}
${phead({ eyebrow: 'USER HUB', title: 'User hub', sub: 'Per-client rollup: engagement health, outstanding money, and who needs a nudge.' })}
${filterbar(`${searchInput('Search clients…', 260)}${sel(['All states','Healthy','Attention','At risk'])}<a class="btn btn-secondary btn-sm ml-auto" href="${LT(r,'apps/admin/users/')}">Full directory →</a>`)}
<div class="panel">
${table({ cols: [{l:'Client'},{l:'Company'},{l:'Active projects'},{l:'Outstanding',r:1},{l:'Last active'},{l:'Health'},{l:''}], rows: [
  ...CLIENTS.slice(0, 10).map((c, i) => {
    const proj = [2, 1, 1, 2, 3, 0, 1, 1, 0, 1][i];
    const out = ['₹0', '₹6,000', '₹0', '₹19,200', '₹20,880', '₹0', '₹4,500', '₹0', '₹12,000', '₹0'][i];
    const h = ['success', 'success', 'success', 'warning', 'warning', 'muted', 'success', 'success', 'danger', 'success'][i];
    const hl = ['Healthy', 'Healthy', 'Healthy', 'Payment due', 'Milestone review', 'Dormant', 'Healthy', 'Healthy', 'Chase: 2 unpaid', 'Healthy'][i];
    return [
      `<div class="flex items-center gap-2"><span class="avatar hue-${(i % 5) + 1}">${c.name.split(' ').map(w => w[0]).join('')}</span><b>${c.name}</b></div>`,
      `<span class="dim">${c.company}</span>`, `<span class="mono">${proj}</span>`,
      `<span class="mono${h === 'danger' || h === 'warning' ? ' font-semibold' : ''}">${out}</span>`,
      `<span class="text-xs dim">${['2h ago','Today','Yesterday','1h ago','3h ago','Oct 2','Oct 9','Oct 8','Oct 6','5h ago'][i]}</span>`,
      badge(hl, h),
      `<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/pipeline/users/[id]/')}">Open →</a>`,
    ];
  })
]})}
</div>
${pager('Showing 1–10 of 15','1/2')}`,
  },

  {
    path: 'apps/admin/pipeline/users/[id]/', app: 'admin', alias: 'apps/admin/pipeline/users/priya-nair/', title: 'Client 360 · Pipeline · Admin', crumb: 'Client 360',
    body: (r) => `
${backlink(r, 'apps/admin/pipeline/users/', 'Back to user hub')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">CLIENT 360</div><h1 class="ptitle" style="font-size:22px">Priya Nair</h1>
  <div class="flex gap-2 mt-2">${badge('Client','info')}${badge('Verified','success')}<span class="text-xs dim" style="align-self:center">Nair Learning Systems · Kochi · since Sep 2025</span></div></div>
  <div class="flex gap-2"><a class="btn btn-secondary" href="${LT(r,'apps/web/impersonate/')}">${icon('eye',14)} Impersonate</a><a class="btn btn-primary" href="${LT(r,'apps/admin/messages/new/direct/')}">${icon('message',14)} Message</a></div>
</div>
${stats([
  { label: 'Lifetime billed', value: '₹78,400', note: '7 invoices', icon: 'receipt' },
  { label: 'Active projects', value: '3', note: '1 in review', icon: 'folder' },
  { label: 'Outstanding', value: '₹20,880', note: '1 issued invoice', icon: 'clock' },
  { label: 'Avg approval time', value: '1.4d', note: 'Fast payer', icon: 'zap' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Engagements', pad: false, body: table({ cols: [{l:'Project'},{l:'Stage'},{l:'Progress'},{l:'Outstanding',r:1},{l:'State'}], rows: [
      ['<b>Corporate LMS for 200 Employees</b><div class="text-xs dim mono">NL-204</div>','QA',`<div class="flex items-center gap-2" style="min-width:120px">${progress(40)}<span class="mono text-xs">40%</span></div>`,'<span class="mono">₹20,880</span>',badge('Review pending','warning')],
      ['<b>Malayalam–English Bilingual CMS</b>','Discovery',`<div class="flex items-center gap-2" style="min-width:120px">${progress(10)}<span class="mono text-xs">10%</span></div>`,'<span class="mono">₹0</span>',badge('Scoping','info')],
      ['<b>Festive landing pages</b>','Handover',`<div class="flex items-center gap-2" style="min-width:120px">${progress(100)}<span class="mono text-xs">100%</span></div>`,'<span class="mono">₹0</span>',badge('Completed','success')],
    ]})})}
    ${panel({ title: 'Payments &amp; ledger', pad: false, body: table({ cols: [{l:'When'},{l:'Document'},{l:'Amount',r:1},{l:'State'}], rows: [
      ['Oct 8, 2026','NL-INV-2026-000009','<span class="mono">₹19,200.00</span>',badge('Issued','info')],
      ['Oct 5, 2026','NL-INV-2026-000008','<span class="mono">₹14,400.00</span>',badge('Paid','success')],
      ['Sep 12, 2026','NL-INV-2026-000006','<span class="mono">₹6,000.00</span>',badge('Paid','success')],
      ['Sep 5, 2026','NL-RCPT-2026-000031','<span class="mono">₹7,830.00</span>',badge('Receipt','muted')],
    ]})})}
    ${panel({ title: 'Communication log', pad: false, body: `
      ${[['message','Thread: LMS delivery — NL-204','Last reply: you, 2h ago'],['mail','Quote NL-QTO-2026-000098 sent','Sep 28 · opened same day'],['phone','Ops call — Okta metadata walkthrough','Oct 2 · 25 min · notes saved']].map(([i,t,s])=>`<div class="panel-row"><span class="avatar sq" style="width:30px;height:30px;background:var(--bg-subtle);color:var(--ink-2)">${icon(i,13)}</span><div class="min-w-0 flex-1"><b style="font-size:12.8px">${t}</b><div class="text-xs dim mt-1">${s}</div></div></div>`).join('')}` })}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Account', body: kv([
      ['Email','priya.nair@nestlancer.com'],['Phone','+91 98•• ••2210'],['Role',badge('Client','info')],['Status',badge('Active','success')],['Sessions','2 devices'],['2FA',badge('Not enabled','warning')],
    ])})}
    ${panel({ title: 'Operator notes', body: `${textarea('Internal context for support staff…','Prefers in-thread updates over calls. Decision maker; IT sign-off comes from her co-founder (Sandeep Nair).', 4)}<button class="btn btn-secondary btn-sm mt-3">Save note</button>` })}
    ${panel({ title: 'Actions', body: `<div class="flex-col gap-2">
      <a class="btn btn-secondary w-full" href="${LT(r,'apps/web/impersonate/')}">${icon('eye',14)} Impersonate (consent required)</a>
      <button class="btn btn-secondary w-full">${icon('key',13)} Force password reset</button>
      <button class="btn btn-danger w-full">${icon('shield',13)} Suspend account…</button>
    </div>` })}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- PROJECTS (admin)
  {
    path: 'apps/admin/projects/', app: 'admin', title: 'Projects · Admin', crumb: 'Projects',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Projects', sub: 'Active delivery work across every client — stage, health, and money in one table.' })}
${stats([
  { label: 'Active', value: '4', note: '7 with queued work', icon: 'folder' },
  { label: 'In review', value: '2', note: 'Waiting on client approval', icon: 'eye' },
  { label: 'At risk', value: '1', note: 'Multi-Branch Clinic Booking', icon: 'alert-triangle' },
  { label: 'Completed (30d)', value: '10', note: 'On-time rate 88%', icon: 'check-circle' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'Active', count: 4, active: true }, { l: 'Completed', count: 10, href: LT(r,'apps/admin/projects/completed/') },
  { l: 'Archive', count: 3, href: LT(r,'apps/admin/projects/archive/') }, { l: 'Stats', href: LT(r,'apps/admin/projects/stats/') },
])}
${filterbar(`${searchInput('Search projects…', 240)}${sel(['All stages','Discovery','Design','Frontend','QA','Handover'])}${sel(['All clients'])}<a class="btn btn-primary btn-sm ml-auto" href="${LT(r,'apps/admin/projects/new/')}">${icon('plus',13)} New project</a>`)}</div>
<div class="panel">
${table({ cols: [{l:'Project'},{l:'Client'},{l:'Stage'},{l:'Progress'},{l:'Outstanding',r:1},{l:'State'},{l:''}], rows: [
  ...[['Corporate LMS for 200 Employees','NL-204','Priya Nair','QA',40,'₹20,880','Review pending','warning'],
     ['Razorpay Settlement Reconciliation Engine','NL-198','Ananya Iyer','Handover',92,'₹0','Healthy','success'],
     ['GPS Fleet Tracking Portal','NL-187','Sandeep Chopra','Frontend',54,'₹21,600','Payment due','warning'],
     ['Multi-Branch Clinic Booking','NL-181','Pooja Kulkarni','Design',34,'₹45,500','At risk','danger'],
     ['Freelance Marketplace MVP','NL-166','Amit Verma','Discovery',12,'₹58,000','Awaiting deposit','warning']]
    .map(([p,id,c,st,prog,out,hl,tn])=>[
      `<b>${p}</b><div class="text-xs dim mono mt-1">${id}</div>`,c,badge(st,'info'),
      `<div class="flex items-center gap-2" style="min-width:130px">${progress(prog)}<span class="mono text-xs">${prog}%</span></div>`,
      `<span class="mono">${out}</span>`,badge(hl,tn),
      `<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/projects/[id]/')}">Open →</a>`])
]})}
</div>
${pager('Showing 1–5 of 4 stages','1/1')}`,
  },

  {
    path: 'apps/admin/projects/new/', app: 'admin', title: 'New project · Admin', crumb: 'New project',
    body: (r) => `
${backlink(r, 'apps/admin/projects/', 'Back to projects')}
${phead({ eyebrow: 'OPERATIONS', title: 'Create project', sub: 'Manual projects bypass the request → quote flow. Use only for internal or pre-contract work — billing anchors still require a quote.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Basics', body: `
      ${field('Client account', '<select class="select"><option>Ananya Iyer — Iyer FinTech Solutions</option><option>Priya Nair — Nair Learning Systems</option><option>Sandeep Chopra — Chopra Fleet Logistics</option></select>')}
      <div class="mt-4">${field('Project title', input({ ph: 'e.g. Trust-center microsite' }))}</div>
      <div class="grid g2 gap-4 mt-4">
        ${field('Stage', '<select class="select"><option>Discovery</option><option>Design</option><option>Frontend</option><option>QA</option><option>Handover</option></select>', { req: false })}
        ${field('Target end', input({ type: 'date' }), { req: false })}
      </div>
      <div class="mt-4">${field('Source', '<select class="select"><option>Accepted quote (recommended)</option><option>Manual / pre-contract</option><option>Internal</option></select>', { req: false, hint: 'If you pick “Accepted quote”, milestones and schedule are copied from it.' })}</div>
      <div class="mt-4">${field('Delivery pod', '<select class="select"><option>Arjun Nair (lead) + Dev Malhotra</option><option>Arjun Nair (lead) + shared design</option></select>', { req: false })}</div>` })}
    ${panel({ title: 'Milestone skeleton', pad: false, body: table({ cols: [{l:'#'},{l:'Milestone'},{l:'Share',r:1}], rows: [
      ['1','<input class="input sm" value="Discovery">','<input class="input sm mono" style="width:70px" value="15%">'],
      ['2','<input class="input sm" value="Build sprint 1">','<input class="input sm mono" style="width:70px" value="35%">'],
      ['3','<input class="input sm" value="Build sprint 2">','<input class="input sm mono" style="width:70px" value="30%">'],
      ['4','<input class="input sm" value="UAT & handover">','<input class="input sm mono" style="width:70px" value="20%">'],
    ], compact: true })})}
    <div class="flex gap-2"><button class="btn btn-primary">${icon('plus',14)} Create project</button><button class="btn btn-secondary">Save as draft</button></div>
  </div>
  <div class="flex-col gap-5">
    ${note('warn','alert-triangle','Projects created <b>manually</b> start with no payment schedule. Attach a quote before requesting any money from the client.')}
    ${panel({ title: 'After creation', body: `<div class="tline">
      ${[['Client notified in-app','Project appears in their Project Hub immediately.'],['Pod gets a kickoff checklist','Repo, environments, and access spun up per template.'],['Finance anchors','First invoice can be issued once a schedule exists.']].map(([t,d],i)=>`<div class="tline-item${i?' mut':''}"><b class="text-sm">${t}</b><div class="text-xs muted mt-1">${d}</div></div>`).join('')}
    </div>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/projects/[id]/', app: 'admin', alias: 'apps/admin/projects/nl-lms/', title: 'NL-204 · Projects · Admin', crumb: 'Project ops',
    body: (r) => `
${backlink(r, 'apps/admin/projects/', 'Back to projects')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">PROJECT OPS · NL-204</div><h1 class="ptitle" style="font-size:22px">Corporate LMS for 200 Employees</h1></div>
  <div class="flex gap-2">${badge('In progress','info')}<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/pipeline/projects/[id]/')}">Pipeline 360</a><a class="btn btn-primary btn-sm" href="${LT(r,'apps/admin/messages/project/[projectId]/')}">${icon('message',13)} Message pod</a></div>
</div>
${tabs([{ l: 'Overview', active: true }, { l: 'Milestones' }, { l: 'Payments' }, { l: 'Files' }, { l: 'Deliverables' }, { l: 'Activity' }])}
<div class="grid gap-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Delivery velocity', sub: 'Story points closed per week · NL-204', pad: true, body: barChart({ data: [4,6,5,8,9,7,10,11,9,12,8,10], labels: ['W27','W30','W33','W36','W38','W40'] }) })}
  ${panel({ title: 'Blockers', sub: '2 open', pad: false, body: `
    <div class="panel-row">${icon('alert-triangle',14)}<div class="min-w-0 flex-1"><b style="font-size:12.8px">Okta metadata pending</b><div class="text-xs dim">Client IT · since Oct 4</div></div><button class="btn btn-secondary btn-xs">Nudge</button></div>
    <div class="panel-row">${icon('clock',14)}<div class="min-w-0 flex-1"><b style="font-size:12.8px">Malayalam copy review</b><div class="text-xs dim">External reviewer · due Oct 13</div></div>${badge('Watching','warning')}</div>` })}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr 1fr">
  ${panel({ title: 'Money', body: kv([['Contract','<span class="mono">₹52,200</span>'],['Collected','<span class="mono" style="color:var(--t-success-tx)">₹31,320</span>'],['Outstanding','<span class="mono" style="color:var(--t-warning-tx)">₹20,880</span>'],['Next invoice','<span class="mono">M3 approval</span>']]), actions:`<a class="link text-xs" href="${LT(r,'apps/admin/payments/projects/[id]/')}">Ledger →</a>`})}
  ${panel({ title: 'Team', body: kv([['Delivery lead','Arjun Nair'],['Engineering','Dev Malhotra'],['Design','Shared pool'],['Client approver','Priya Nair']])})}
  ${panel({ title: 'Dates', body: kv([['Started','Aug 3, 2026'],['Target','Oct 31, 2026'],['Buffer','<b class="mono" style="color:var(--t-warning-tx)">5 days</b>'],['Defect window','30 days post-handover']])})}
</div>`,
  },

  {
    path: 'apps/admin/projects/completed/', app: 'admin', title: 'Completed projects · Admin', crumb: 'Completed',
    body: (r) => `
${backlink(r, 'apps/admin/projects/', 'Back to projects')}
${phead({ eyebrow: 'DELIVERY HISTORY', title: 'Completed projects', sub: 'Closed engagements with final billing state and client satisfaction.' })}
<div class="panel">
${table({ cols: [{l:'Project'},{l:'Client'},{l:'Closed'},{l:'Contract',r:1},{l:'Collected',r:1},{l:'Review'},{l:''}], rows: [
  ...[['Fintech Payments Hub','Iyer FinTech Solutions','Sep 26, 2026','₹4,20,000','₹4,20,000',5],['Festive Season Campaign Landing Pages','Priya Nair','Sep 12, 2026','₹6,000','₹6,000',5],['SaaS Analytics Platform','Gupta HR Cloud','Aug 30, 2026','₹3,60,000','₹3,54,000',4],['Field-service mobile app','Iyer Agro Supplies','Aug 12, 2026','₹2,80,000','₹2,80,000',5]]
    .map(([p,c,d,k,col,len,stars])=>[`<b>${p}</b>`,c,`<span class="text-xs dim">${d}</span>`,`<span class="mono">${k}</span>`,`<span class="mono" style="color:var(--t-success-tx)">${col}</span>`,`<span style="color:var(--t-warning-dot);letter-spacing:1px;font-size:12px">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</span>`,`<a class="link text-xs" href="${LT(r,'apps/admin/projects/[id]/')}">Open →</a>`])
]})}
</div>
${pager('Showing 1–4 of 10','1/3')}`,
  },

  {
    path: 'apps/admin/projects/archive/', app: 'admin', title: 'Project archive · Admin', crumb: 'Archive',
    body: (r) => `
${backlink(r, 'apps/admin/projects/', 'Back to projects')}
${phead({ eyebrow: 'ARCHIVE', title: 'Project archive', sub: 'Archived work is read-only for clients. Restore puts it back in active planning.' })}
<div class="panel">
${table({ cols: [{l:'Project'},{l:'Client'},{l:'Archived'},{l:'Reason'},{l:''}], rows: [
  ['<b>Vendor Portal Phase 1</b>','Kumar Textiles','Mar 2, 2026','Superseded by phase-2 contract',`<button class="btn btn-ghost btn-xs">Restore</button>`],
  ['<b>Pilot: WhatsApp notifications</b>','Sharma Health Services','Jan 19, 2026','Pilot ended; not renewed',`<button class="btn btn-ghost btn-xs">Restore</button>`],
  ['<b>Landing page audit</b>','Reddy AgroTech','Nov 11, 2025','One-off audit delivered',`<button class="btn btn-ghost btn-xs">Restore</button>`],
]})}
</div>
${pager('Showing 1–3 of 3')}`,
  },

  {
    path: 'apps/admin/projects/stats/', app: 'admin', title: 'Project stats · Admin', crumb: 'Stats',
    body: (r) => `
${backlink(r, 'apps/admin/projects/', 'Back to projects')}
${phead({ eyebrow: 'DELIVERY ANALYTICS', title: 'Project stats', sub: 'Throughput, on-time performance, and stage aging for everything we ship.' })}
${stats([
  { label: 'On-time completion', value: '88%', note: '+4% vs last quarter', dir: 'up', icon: 'check-circle' },
  { label: 'Median cycle time', value: '41d', note: 'Contract → handover', icon: 'clock' },
  { label: 'Throughput / mo', value: '5.2', note: 'Projects closed', icon: 'zap' },
  { label: 'Rework rate', value: '6%', note: 'Deliverables reopened', icon: 'refresh' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Stage aging — where projects sit today', sub: 'Days in current stage · active engagements', pad: true, body: barChart({ data: [6, 11, 14, 9, 22], labels: ['Discovery','Design','Frontend','QA','Handover'], colors: ['var(--t-info-dot)','var(--brand-8)','var(--brand-8)','var(--t-warning-dot)','var(--t-danger-dot)'] }) })}
  ${panel({ title: 'Completions by month', sub: 'FY 2026', pad: true, body: lineChart({ seed: 9, data: [3,4,3,5,6,4,7,5,6,10], labels: ['Jan','Mar','May','Jul','Sep'] }) })}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr">
  ${panel({ title: 'Revenue by project (FY 2026)', pad: false, body: table({ cols: [{l:'Project'},{l:'Collected',r:1},{l:'Share',r:1}], rows: [
    ...[['Fintech Payments Hub','₹4,20,000',31],['SaaS Analytics Platform','₹3,54,000',26],['Field-service mobile app','₹2,80,000',21],['Corporate LMS (to date)','₹31,320',9],['Festive landing pages','₹6,000',2]].map(([p,a,w])=>[`<b>${p}</b>`,`<span class="mono">${a}</span>`,`<div class="flex items-center justify-end gap-2"><div class="prog thin" style="width:90px"><i style="width:${w*3}%"></i></div><span class="mono text-xs dim">${w}%</span></div>`])
  ]})})}
  ${panel({ title: 'Risk register', sub: 'From weekly ops review', pad: false, body: `
    ${[['Multi-Branch Clinic Booking','Client-side reviewer unresponsive 9 days','danger'],['GPS Fleet Tracking Portal','Payment 4 days past issue','warning'],['Freelance Marketplace MVP','Deposit not yet collected','warning']].map(([p,s,tn])=>`
    <div class="panel-row">${badge(tn === 'danger' ? 'High' : 'Watch', tn)}<div class="min-w-0 flex-1"><b style="font-size:12.8px">${p}</b><div class="text-xs dim mt-1">${s}</div></div><button class="btn btn-secondary btn-xs">Assign</button></div>`).join('')}` })}
</div>`,
  },

  // ------------------------------------------------------------- QUOTES (admin)
  {
    path: 'apps/admin/quotes/', app: 'admin', title: 'Quotes · Admin', crumb: 'Quotes',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Quotes', sub: 'Pricing proposals from draft to signature. Conversion and aging, per operator.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/quotes/payment-schedules/')}">Payment schedules</a><a class="btn btn-primary" href="${LT(r,'apps/admin/quotes/new/')}">${icon('plus',14)} New quote</a>` })}
${stats([
  { label: 'Open', value: '7', note: 'Sent &amp; viewed, unsigned', icon: 'receipt' },
  { label: 'Drafts', value: '4', note: 'Being priced', icon: 'edit' },
  { label: 'Accepted (30d)', value: '6', note: 'Conversion 43.9%', icon: 'check-circle' },
  { label: 'Avg time to accept', value: '2.4d', note: 'Send → signature', icon: 'clock' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'All', count: 36, active: true }, { l: 'Drafts', count: 4, href: LT(r,'apps/admin/quotes/drafts/') }, { l: 'Sent', count: 3 }, { l: 'Viewed', count: 4 }, { l: 'Accepted', count: 6 }, { l: 'Expired', count: 2 },
])}
${filterbar(`${searchInput('Search by client, ID, request…', 260)}${sel(['All states','Draft','Sent','Viewed','Accepted','Declined','Expired'])}`)}
<div class="panel">
${table({ cols: [{l:'Quote'},{l:'Client'},{l:'Request'},{l:'Total',r:1},{l:'Updated'},{l:'Status'},{l:''}], rows: [
  ...[['#01a10f80','Arjun Mehta','AUDIT-P23-20261005-6rdsf','₹1,770.00','2h ago','Viewed','warning'],
     ['NL-QTO-2026-000112','Neha Gupta','HR onboarding automation','₹1,44,000.00','5h ago','Sent','info'],
     ['NL-QTO-2026-000109','Rajan Kumar','Vendor portal portal v2','₹2,86,000.00','Oct 8','Viewed','warning'],
     ['NL-QTO-2026-000104','Kavya Reddy','Agro traceability pilot','₹95,000.00','Oct 7','Draft','neutral'],
     ['NL-QTO-2026-000098','Priya Nair','Corporate LMS for 200 Employees','₹52,200.00','Sep 30','Accepted','success'],
     ['NL-QTO-2026-000091','Divya Sharma','Wellness booking suite','₹1,20,000.00','Sep 22','Expired','muted']]
    .map(([q,c,s,a,u,st,tn])=>[
      `<a class="link mono" style="font-size:12px" href="${LT(r,'apps/admin/quotes/[id]/')}">${q}</a>`,
      `<b>${c}</b>`,`<span class="dim" style="max-width:220px;display:inline-block;vertical-align:middle" class="truncate">${s}</span>`,
      `<span class="mono font-semibold">${a}</span>`,`<span class="text-xs dim">${u}</span>`,badge(st,tn),
      `<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/quotes/[id]/')}">View →</a>`])
]})}
</div>
${pager('Showing 1–6 of 36','1/6')}`,
  },

  {
    path: 'apps/admin/quotes/new/', app: 'admin', title: 'New quote · Admin', crumb: 'New quote',
    body: (r) => `
${backlink(r, 'apps/admin/quotes/', 'Back to quotes')}
${phead({ eyebrow: 'QUOTE BUILDER', title: 'New quote', sub: 'Standalone quote — prefer pricing from a request when possible so context flows through.' })}
${note('info','info','Tip: 34 of 36 live quotes came from a request. <a class="link" href="'+LT(r,'apps/admin/requests/')+'">Pick a request</a> to pre-fill client, budget signal, and notes.')}
<div class="grid gap-5 mt-4" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Client &amp; link', body: `
      ${field('Client account', '<select class="select"><option>Neha Gupta — Gupta HR Cloud</option><option>Kavya Reddy — Reddy AgroTech</option><option>Amit Verma — Verma Properties</option></select>')}
      <div class="mt-4">${field('Linked request (optional)', '<select class="select"><option>None</option><option>HR onboarding automation — Neha Gupta</option></select>', { req: false })}</div>` })}
    ${panel({ title: 'Line items', pad: false, body: `
      ${table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Unit price',r:1},{l:'Total',r:1}], compact: true, rows: [
        [`<input class="input sm" placeholder="Deliverable description…">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="0.00">','<span class="mono dim">₹0.00</span>'],
        [`<input class="input sm" placeholder="Deliverable description…">`,'<input class="input sm mono" style="width:56px" value="1">','<input class="input sm mono" style="width:110px" value="0.00">','<span class="mono dim">₹0.00</span>'],
      ]})}
      <div class="panel-foot flex items-center justify-between"><button class="btn btn-secondary btn-sm">${icon('plus',13)} Add item</button>${kv([['Total','<span class="mono font-bold">₹0.00 + GST</span>']])}</div>` })}
    ${panel({ title: 'Schedule &amp; terms', body: `
      <div class="flex gap-2 mb-4">${['50 / 50','30 / 40 / 30','100% on completion'].map((s,i)=>`<span class="chip${i===1?' active':''}">${s}</span>`).join('')}</div>
      ${field('Project-specific terms', textarea('One per line…', '', 3), { req: false })}` })}
    <div class="flex gap-2"><button class="btn btn-primary">${icon('send',14)} Send quote</button><button class="btn btn-secondary">Save draft</button></div>
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Pricing guardrails', body: `
      ${switchRow('Require engineering sign-off before send','Recommended above ₹50k', true)}
      ${switchRow('Require finance review','Auto-on above ₹2L', true)}
      ${switchRow('Allow client negotiation','Client can counter-propose line items')}
    ` })}
    ${panel({ title: 'Reference', body: `<div class="text-xs dim mb-2">Similar accepted quotes</div>${[['HR onboarding automation','₹1,44,000 · 3 milestones','apps/admin/quotes/[id]/'],['Clinic booking pilot','₹45,000 · 2 milestones','apps/admin/quotes/[id]/']].map(([t,s,h])=>`<a class="flex justify-between items-center p-2" href="${LT(r,h)}" style="border:1px solid var(--line);border-radius:8px;margin-bottom:8px;display:flex"><b style="font-size:12.5px">${t}</b><span class="mono text-xs dim">${s}</span></a>`).join('')}` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/quotes/[id]/', app: 'admin', alias: 'apps/admin/quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9/', title: 'Quote #01a10f80 · Admin', crumb: 'Quote detail',
    body: (r) => `
${backlink(r, 'apps/admin/quotes/', 'Back to quotes')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow mono">QUOTE · AUDIT TRAIL LIVE</div><h1 class="ptitle" style="font-size:22px">Quote #01a10f80</h1>
  <p class="psub">For: AUDIT-P23-20261005-6rdsf Request to Quote Builder · Arjun Mehta</p></div>
  <div class="flex gap-2">${badge('Viewed','warning')}<button class="btn btn-secondary btn-sm">${icon('copy',13)} Duplicate</button><a class="btn btn-primary btn-sm" href="${LT(r,'apps/admin/requests/[id]/quote/edit/')}">Revise (v2)</a></div>
</div>
${stats([
  { label: 'Total', value: '₹1,770.00', note: 'Incl. ₹270 GST', icon: 'receipt' },
  { label: 'Sent', value: 'Oct 5', note: '6:11 PM via Riya', icon: 'send' },
  { label: 'Viewed', value: '2×', note: 'Last 41 min ago', icon: 'eye' },
  { label: 'Valid until', value: 'Oct 20', note: '9 days left', icon: 'calendar' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Client view', sub: 'Exactly what the client sees in their portal — signature flow included.', pad: false, body: `
      ${table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Total',r:1}], rows: [
        ['AUDIT-P23 edited deliverable: quote builder regression package','<span class="mono">1</span>','<span class="mono">₹1,500.00</span>'],
        ['<span class="dim">GST (18%)</span>','','<span class="mono">₹270.00</span>'],
        ['<b>Total</b>','','<span class="mono font-bold">₹1,770.00</span>'],
      ]})}
      <div class="panel-foot flex items-center justify-between"><span class="text-xs dim">Schedule: 50% on acceptance · 50% on milestone approval</span><a class="link text-xs" href="${LT(r,'apps/web/quotes/[id]/')}">Open client view →</a></div>` })}
    ${panel({ title: 'Email &amp; notification log', pad: false, body: `
      ${[['send','Sent to arjun.mehta@nestlancer.com','Oct 5, 6:11 PM · Delivered'],['eye','Opened (quote email)','Oct 5, 6:14 PM'],['message','Client comment: “Looks good, checking with our PMO.”','Oct 6, 11:02 AM'],['clock','Reminder scheduled','Oct 14, 9:00 AM — auto']].map(([i,t,s])=>`
      <div class="panel-row"><span style="color:var(--ink-3)">${icon(i,15)}</span><div class="min-w-0 flex-1"><div style="font-size:12.8px;font-weight:600">${t}</div><div class="text-xs dim">${s}</div></div></div>`).join('')}` })}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'State machine', pad: true, body: `
      <div class="tline">
        ${[['Draft','Sep 30 · Riya Kapoor',true],['Sent','Oct 5 · with PDF + agreement',true],['Viewed','Oct 5 · 2 views',true],['Accepted','—',false],['Expired','—',false]].map(([t,s,d])=>`
        <div class="tline-item${d?'':' mut'}"><b class="text-sm">${t}</b><div class="text-xs dim">${s}</div></div>`).join('')}
      </div>` })}
    ${panel({ title: 'Operator actions', body: `<div class="flex-col gap-2">
      <button class="btn btn-secondary w-full">${icon('bell',14)} Send reminder now</button>
      <button class="btn btn-secondary w-full">${icon('download',14)} Download PDF v1</button>
      <button class="btn btn-secondary w-full">${icon('link',14)} Copy share link</button>
      <button class="btn btn-danger w-full">${icon('x',13)} Void quote…</button>
    </div>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/quotes/drafts/', app: 'admin', title: 'Quote drafts · Admin', crumb: 'Drafts',
    body: (r) => `
${backlink(r, 'apps/admin/quotes/', 'Back to quotes')}
${phead({ eyebrow: 'WORK IN PROGRESS', title: 'Quote drafts', sub: 'Unsent quotes across operators — finish or abandon them before they fossilize.' })}
<div class="panel">
${table({ cols: [{l:'Draft'},{l:'Client'},{l:'Owner'},{l:'Total so far',r:1},{l:'Touched'},{l:''}], rows: [
  ['<b>Agro traceability pilot</b>','Kavya Reddy','Riya Kapoor','<span class="mono">₹95,000.00</span>','<span class="text-xs dim">Oct 7</span>',`<a class="btn btn-secondary btn-xs" href="${LT(r,'apps/admin/requests/[id]/quote/edit/')}">Continue</a>`],
  ['<b>Vendor portal v2 — phase A</b>','Rajan Kumar','Arjun Nair','<span class="mono">₹86,000.00</span>','<span class="text-xs dim">Oct 5</span>',`<a class="btn btn-secondary btn-xs" href="${LT(r,'apps/admin/requests/[id]/quote/edit/')}">Continue</a>`],
  ['<b>Clinic telehealth add-on</b>','Divya Sharma','Riya Kapoor','<span class="mono">₹18,500.00</span>','<span class="text-xs dim">Sep 29</span>',`<a class="btn btn-secondary btn-xs" href="${LT(r,'apps/admin/requests/[id]/quote/edit/')}">Continue</a>`],
  ['<b>Untitled — chat import</b>','Vikram Shah','Dev Malhotra','<span class="mono dim">—</span>','<span class="text-xs dim">Sep 21</span>',`<button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Abandon</button>`],
]})}
</div>
${note('warn','clock','Drafts untouched for 14+ days nudge their owner in #ops-alerts.')}`,
  },

  {
    path: 'apps/admin/quotes/payment-schedules/', app: 'admin', title: 'Payment schedules · Admin', crumb: 'Payment schedules',
    body: (r) => `
${backlink(r, 'apps/admin/quotes/', 'Back to quotes')}
${phead({ eyebrow: 'FINANCE', title: 'Payment schedules', sub: 'Every milestone installment across live contracts — what is due, when, and against which approval.' })}
<div class="panel mb-5"><div class="panel-body grid g3 gap-4">
  ${[['Due next 7 days','₹77,600','5 installments'],['Issued, awaiting payment','₹45,500','3 invoices'],['Scheduled (unbilled)','₹2,15,290','across 6 contracts']].map(([l,v,n])=>`
  <div style="padding:14px;border:1px solid var(--line);border-radius:10px"><div class="text-xs dim">${l}</div><div class="mono font-bold mt-1" style="font-size:20px">${v}</div><div class="text-xs dim mt-1">${n}</div></div>`).join('')}
</div></div>
<div class="panel">
${table({ cols: [{l:'Milestone'},{l:'Project / quote'},{l:'Share',r:1},{l:'Amount',r:1},{l:'Due'},{l:'State'}], rows: [
  ...[['Mid-project payment','NL-204 · LMS for 200 Employees','40%','₹19,200.00','Oct 14, 2026','Invoiced','info'],
     ['Deposit','GPS Fleet Tracking Portal','30%','₹21,600.00','Oct 12, 2026','Due','warning'],
     ['Final payment','Razorpay Settlement Engine','30%','₹20,880.00','On milestone approval','Scheduled','neutral'],
     ['Design complete','Multi-Branch Clinic Booking','40%','₹26,000.00','Overdue 4d','Overdue','danger'],
     ['Handover','Freelance Marketplace MVP','30%','₹58,000.00','Pending deposit','Blocked','warning']]
    .map(([m,p,s,a,d,st,tn])=>[`<b>${m}</b>`,`<span class="dim" style="font-size:12px">${p}</span>`,`<span class="mono">${s}</span>`,`<span class="mono font-semibold">${a}</span>`,`<span class="text-xs">${d}</span>`,badge(st,tn)])
]})}
</div>`,
  },

  {
    path: 'apps/admin/quotes/stats/', app: 'admin', title: 'Quote stats · Admin', crumb: 'Stats',
    body: (r) => `
${backlink(r, 'apps/admin/quotes/', 'Back to quotes')}
${phead({ eyebrow: 'CONVERSION ANALYTICS', title: 'Quote stats', sub: 'From first draft to signature — the funnel, the leak points, and per-operator performance.' })}
<div class="grid gap-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: '90-day funnel', sub: 'Quotes in each stage (of 36 created)', pad: true, body: `
    ${[['Drafted','36',100,'var(--line-strong)'],['Sent','29',81,'var(--t-info-dot)'],['Viewed','24',67,'var(--brand-8)'],['Accepted','16',44,'var(--t-success-dot)'],['Declined / expired','7',19,'var(--t-danger-dot)']].map(([l,n,w,c])=>`
    <div class="flex items-center gap-3 mb-3"><span class="text-xs muted" style="width:110px">${l}</span><div class="prog grow"><i style="width:${w}%;background:${c}"></i></div><b class="mono" style="font-size:12.5px;width:30px;text-align:right">${n}</b></div>`).join('')}` })}
  ${panel({ title: 'Time in stage (median)', sub: 'Days', pad: true, body: donut({ parts: [
    { l: 'Draft → sent', v: 1.2, c: 'var(--line-strong)', d: '1.2d' },
    { l: 'Sent → viewed', v: 0.4, c: 'var(--brand-8)', d: '0.4d' },
    { l: 'Viewed → accepted', v: 2.4, c: 'var(--t-success-dot)', d: '2.4d' },
  ]})})}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr">
  ${panel({ title: 'Acceptance trend', sub: 'Rolling 8 weeks', pad: true, body: lineChart({ seed: 21 }) })}
  ${panel({ title: 'Per-operator conversion', pad: false, body: table({ cols: [{l:'Operator'},{l:'Sent'},{l:'Accepted',r:1},{l:'Rate',r:1}], rows: [
    ['<b>Riya Kapoor</b>','16','9','<span class="mono">56%</span>'],
    ['<b>Arjun Nair</b>','9','5','<span class="mono">55%</span>'],
    ['<b>Dev Malhotra</b>','4','2','<span class="mono">50%</span>'],
  ]})})}
</div>`,
  },
];
