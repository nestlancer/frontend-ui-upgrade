// ============================================================================
// ROUTES — apps/admin OPERATOR CONSOLE — part 2
// Payments (7) · Users (3) · Messages (10) · Contact · Notifications
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, stats, table, tabs, filterbar, searchInput, sel, pager, progress, timeline, kv, field, input, textarea, switchRow, empty, lineChart, barChart, donut, convItem, msgRow, composer } from '../lib/comps.mjs';
import { phead, backlink } from '../lib/chrome.mjs';
import { CLIENTS } from './data.mjs';

const roleTone = { 'Operations': 'warning', 'Delivery': 'info', 'Engineering': 'neutral', 'Finance': 'neutral', 'CX': 'info' };

export default [
  // ================================================================ PAYMENTS
  {
    path: 'apps/admin/payments/', app: 'admin', title: 'Payments · Admin', crumb: 'Payments',
    body: (r) => `
${phead({ eyebrow: 'FINANCE', title: 'Payments', sub: 'Settlements across every contract — verify offline transfers, resolve disputes, watch the money.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/payments/disputes/')}">${icon('alert-triangle',14)} Disputes</a><a class="btn btn-primary" href="${LT(r,'apps/admin/payments/accounts/')}">${icon('bank',14)} Payout accounts</a>` })}
${stats([
  { label: 'Collected (30d)', value: '₹7,08,160', note: 'GST-inclusive', icon: 'check-circle' },
  { label: 'Awaiting verification', value: '₹36,000', note: '2 offline transfers', icon: 'clock' },
  { label: 'Issued, unpaid', value: '₹45,500', note: '3 invoices', icon: 'receipt' },
  { label: 'Open disputes', value: '1', note: '₹4,200 held', icon: 'alert-triangle' },
], 4)}
${filterbar(`${searchInput('Search by UTR, client, invoice…', 260)}${sel(['All states','Paid','Unverified UTR','Issued','Overdue','Refunded','Disputed'])}`)}
<div class="panel">
${table({ cols: [{l:'Payment'},{l:'Client / project'},{l:'Rail'},{l:'Amount',r:1},{l:'When'},{l:'State'},{l:''}], rows: [
  ...[['NEFT · UTR PUNB1023456','Karthik Menon · UPI Switch Integration Layer','Bank transfer','₹36,000.00','Oct 10, 6:58 AM','Unverified UTR','warning'],
     ['NL-INV-2026-000009','Priya Nair · Corporate LMS (NL-204)','Razorpay','₹19,200.00','Issued Oct 8','Awaiting payment','info'],
     ['NEFT · UTR HDFCR5202610058','Iyer FinTech · Settlement Engine','Bank transfer','₹14,400.00','Verified Oct 5','Paid','success'],
     ['Razorpay · pay_PvTXXX','Sandeep Chopra · GPS Fleet Tracking','Card ···· 8811','₹21,600.00','Oct 5','Paid','success'],
     ['NL-INV-2026-000107','Pooja Kulkarni · Clinic Booking','Razorpay','₹45,500.00','Due Oct 6','Overdue','danger']]
    .map(([p,c,rail,a,w,st,tn])=>[
      `<span class="mono" style="font-size:11.5px">${p}</span>`,`<span style="font-size:12px">${c}</span>`,`<span class="dim text-xs">${rail}</span>`,
      `<span class="mono font-semibold">${a}</span>`,`<span class="text-xs dim">${w}</span>`,badge(st,tn),
      `<a class="btn ${tn === 'warning' ? 'btn-primary' : 'btn-ghost'} btn-xs" href="${LT(r,'apps/admin/payments/[id]/')}">${tn === 'warning' ? 'Verify' : 'Viewer'}</a>`])
]})}
</div>
${pager('Showing 1–5 of 28','1/6')}
<div class="mt-5">${note('warn','alert-triangle','<b>Verify before you act.</b> Offline transfers sit in "Unverified UTR" until you match them against the bank statement — invoices only clear after verification.')}</div>`,
  },

  {
    path: 'apps/admin/payments/accounts/', app: 'admin', title: 'Payout accounts · Admin', crumb: 'Payout accounts',
    body: (r) => `
${backlink(r, 'apps/admin/payments/', 'Back to payments')}
${phead({ eyebrow: 'FINANCE', title: 'Payout accounts', sub: 'Where client money settles and how refunds flow out. Changes require two-operator approval.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="panel">
    <div class="panel-head"><h3 class="panel-title">Settlement accounts</h3><span class="badge tone-success">2 active</span></div>
    ${[['HDFC Bank — Current ···· 8821','Primary settlement · Nestlancer Studio Pvt Ltd · HDFC0001232','Primary','success'],
       ['ICICI Bank — Current ···· 7712','Refund float account · ICIC0000442','Refund float','info'],
       ['RazorpayX — VAN 919900001234','Gateway-linked virtual account for NEFT matching','Gateway','neutral']].map(([t,s,l,tn])=>`
    <div class="panel-row"><span class="avatar sq" style="width:36px;height:36px;background:var(--brand-2);color:var(--brand-11)">${icon('bank',15)}</span>
      <div class="min-w-0 flex-1"><b style="font-size:13.5px">${t}</b><div class="text-xs dim mono mt-1">${s}</div></div>${badge(l,tn)}<button class="btn-icon btn sm">${icon('dots',14)}</button></div>`).join('')}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Change request — dual control', body: `
      ${switchRow('Require second operator for account changes','Always on in production', true)}
      <div class="text-xs dim mt-3" style="line-height:1.6">Pending changes (1):</div>
      <div class="panel mt-2" style="padding:12px;background:var(--bg-hover)"><b style="font-size:12px">Add refund float ···· 4410</b><div class="text-xs dim mt-1">Requested by Sunita Rao · Oct 9 · awaiting second approval</div>
      <div class="flex gap-2 mt-2"><button class="btn btn-primary btn-xs">Approve</button><button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Reject</button></div></div>` })}
    ${panel({ title: 'Reconciliation', body: kv([
      ['Last full match','<span class="mono">Today, 2:00 AM IST</span>'],['Unmatched entries','<b class="mono" style="color:var(--t-danger-tx)">2</b>'],['Cadence','Nightly + ad-hoc'],
    ]), actions: `<button class="btn btn-secondary btn-xs">Run now</button>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/payments/projects/[id]/', app: 'admin', alias: 'apps/admin/payments/projects/nl-lms/', title: 'Project ledger · Admin', crumb: 'Project ledger',
    body: (r) => `
${backlink(r, 'apps/admin/payments/', 'Back to payments')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">LEDGER · NL-204</div><h1 class="ptitle" style="font-size:22px">Corporate LMS for 200 Employees</h1><p class="psub">Every money event against this engagement — invoices, captures, refunds.</p></div>
  <div class="flex gap-2"><button class="btn btn-secondary btn-sm">${icon('download',13)} Export CSV</button><button class="btn btn-primary btn-sm">${icon('plus',13)} Record offline payment</button></div>
</div>
${stats([
  { label: 'Contract', value: '₹52,200', note: 'NL-QTO-2026-000098' },
  { label: 'Collected', value: '₹31,320', note: '60%', icon: 'check-circle' },
  { label: 'Outstanding', value: '₹20,880', note: '1 invoice issued', icon: 'clock' },
  { label: 'Refunded', value: '₹0', note: 'No reversals', icon: 'refresh' },
], 4)}
<div class="panel mt-5">
${table({ cols: [{l:'Date'},{l:'Event'},{l:'Document'},{l:'Debit',r:1},{l:'Credit',r:1},{l:'Balance',r:1}], rows: [
  ['<span class="mono text-xs">Sep 05</span>','Deposit captured','NL-RCPT-2026-000031','<span class="mono dim">—</span>','<span class="mono" style="color:var(--t-success-tx)">+₹7,830.00</span>','<span class="mono">₹7,830.00</span>'],
  ['<span class="mono text-xs">Sep 26</span>','M1 payment captured','NL-INV-2026-000005','<span class="mono dim">—</span>','<span class="mono" style="color:var(--t-success-tx)">+₹9,090.00</span>','<span class="mono">₹31,320.00</span>'],
  ['<span class="mono text-xs">Oct 05</span>','Deposit (Recon Engine, cross-ref)','NL-INV-2026-000008','<span class="mono dim">—</span>','<span class="mono" style="color:var(--t-success-tx)">+₹14,400.00</span>','<span class="mono">₹45,720.00</span>'],
  ['<span class="mono text-xs">Oct 08</span>','Mid-project invoice issued','NL-INV-2026-000009','<span class="mono" style="color:var(--t-warning-tx)">₹19,200.00</span>','<span class="mono dim">—</span>','<span class="mono">₹45,720.00 · <b>₹19,200 due</b></span>'],
]})}
</div>
${note('info','info','Ledger entries are immutable — corrections post as new reversal entries with their own reference, never an edit.')}`,
  },

  {
    path: 'apps/admin/payments/[id]/', app: 'admin', alias: 'apps/admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/', title: 'Payment detail · Admin', crumb: 'Payment detail',
    body: (r) => `
${backlink(r, 'apps/admin/payments/', 'Back to payments')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">PAYMENT · OFFLINE TRANSFER</div><h1 class="ptitle" style="font-size:22px">₹36,000.00 — UTR PUNB1023456</h1>
  <p class="psub">Karthik Menon · UPI Switch Integration Layer · reported via payment page</p></div>
  ${badge('Unverified UTR','warning')}
</div>
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${note('warn','alert-triangle','<b>Verification needed.</b> The client reported a bank transfer with UTR <span class="mono">PUNB1023456</span>. Match against the HDFC ···· 8821 statement before marking paid — the client portal shows “Processing” until then.')}
    <div class="panel">
      <div class="panel-head"><h3 class="panel-title">Statement match</h3><span class="text-xs dim">Last sync today, 6:00 AM</span></div>
      <div class="panel-body">
        ${table({ cols: [{l:'Bank entry'},{l:'Date'},{l:'Amount',r:1},{l:'Match'}], rows: [
          [`<span class="mono" style="font-size:11.5px">NEFT PUNB1023456 · KARTHIK MENON SELF</span>`,'<span class="text-xs">Oct 10</span>','<span class="mono font-semibold">₹36,000.00</span>',badge('Exact UTR match','success')],
          [`<span class="mono" style="font-size:11.5px">IMPS 0000342189 · KARTHIK M</span>`,'<span class="text-xs">Oct 8</span>','<span class="mono">₹2,500.00</span>','<span class="dim text-xs">No match</span>'],
        ]})}
        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary">${icon('check-circle',14)} Verify &amp; mark paid</button>
          <button class="btn btn-secondary">Ask client for proof</button>
          <button class="btn btn-ghost" style="color:var(--t-danger-tx)">Reject UTR</button>
        </div>
      </div>
    </div>
    ${panel({ title: 'Timeline', body: timeline([
      { title: 'UTR submitted by client', sub: 'Via checkout page on Oct 10, 6:58 AM' },
      { title: 'Statement sync', sub: 'HDFC ···· 8821 — exact match found', time: '6:00 AM' },
      { title: 'Ops assignment', sub: 'Auto-routed to Sunita Rao (Finance)', time: '7:05 AM' },
    ])})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Context', body: kv([
      ['Client','Karthik Menon'],
      ['Project','<a class="link" href="'+LT(r,'apps/admin/payments/projects/[id]/')+'">UPI Switch Integration Layer</a>'],
      ['Against','Deposit — 30% of ₹1,20,000'],
      ['Rail','NEFT (offline)'],
      ['Reported','<span class="mono text-xs">Oct 10, 6:58 AM</span>'],
    ])})}
    ${panel({ title: 'On verify', body: `<ol style="padding-left:18px;list-style:decimal;font-size:12.8px;color:var(--ink-2);line-height:1.7"><li>Invoice NL-INV-2026-000110 marked paid.</li><li>Client notified in-app + email receipt.</li><li>Ledger posts an immutable credit entry.</li></ol>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/payments/disputes/', app: 'admin', title: 'Disputes · Payments · Admin', crumb: 'Disputes',
    body: (r) => `
${backlink(r, 'apps/admin/payments/', 'Back to payments')}
${phead({ eyebrow: 'FINANCE', title: 'Disputes', sub: 'Chargebacks and contested charges. Funds stay held until resolution.' })}
${stats([
  { label: 'Open', value: '1', note: '₹4,200 held', icon: 'alert-triangle' },
  { label: 'Won (120d)', value: '3', note: '₹31,600 recovered', icon: 'shield-check' },
  { label: 'Lost (120d)', value: '1', note: '₹2,500 reversed', icon: 'x' },
  { label: 'Avg resolution', value: '11d', note: 'Razorpay window: 15d', icon: 'clock' },
], 4)}
<div class="panel mt-5">
  <div class="panel-head"><h3 class="panel-title">Open dispute — ₹4,200.00</h3><span class="badge tone-danger">Response due Oct 14</span></div>
  <div class="panel-body">
    <div class="grid gap-5" style="grid-template-columns:1fr 1fr">
      ${kv([['Reason','Service not rendered (client claims)'],['Charge','NL-RCPT-2026-000011 · card ···· 7712'],['Client','Divya Sharma — Wellness suite'],['Opened','Sep 29, 2026 · Razorpay']])}
      <div class="panel" style="background:var(--bg-hover)"><div class="panel-body text-xs" style="line-height:1.6;color:var(--ink-2)"><b class="block mb-1">Evidence checklist</b>
        <div class="check mb-1"><input type="checkbox" checked> <span>Signed agreement PDF</span></div>
        <div class="check mb-1"><input type="checkbox" checked> <span>Deliverable handoff log</span></div>
        <div class="check mb-1"><input type="checkbox"> <span>Thread export #wellness-booking</span></div>
        <div class="check"><input type="checkbox"> <span>Timeline screenshots</span></div></div></div>
    </div>
    <div class="flex gap-2 mt-4"><button class="btn btn-primary">Submit evidence to Razorpay</button><button class="btn btn-secondary">Contact client</button><button class="btn btn-ghost" style="color:var(--t-danger-tx)">Accept chargeback</button></div>
  </div>
</div>
${empty('shield-check', 'No other disputes', 'Historic cases stay visible for audit under “Resolved”.')}`,
  },

  {
    path: 'apps/admin/payments/company-legal/', app: 'admin', title: 'Company &amp; legal profile · Admin', crumb: 'Company & legal',
    body: (r) => `
${backlink(r, 'apps/admin/payments/', 'Back to payments')}
${phead({ eyebrow: 'FINANCE', title: 'Company &amp; legal profile', sub: 'The identity printed on every invoice, quote PDF, and signed agreement.' })}
<div class="grid gap-5" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Legal entity', body: `
      ${field('Registered name', input({ val: 'Nestlancer Studio Pvt. Ltd.', cls: 'mono' }))}
      <div class="grid g2 gap-4 mt-4">
        ${field('GSTIN', input({ val: '36AAKCN9012E1Z5', cls: 'mono' }))}
        ${field('CIN', input({ val: 'U72900TG2019PTC134822', cls: 'mono' }))}
      </div>
      <div class="mt-4">${field('Registered address', textarea('As on ROC filing', 'HITEC City, Hyderabad 500081, Telangana, IN', 3))}</div>
      <div class="check mt-4"><input type="checkbox" checked> <span>Composition scheme QR not applicable</span></div>` })}
    ${panel({ title: 'Invoice sequence', body: kv([
      ['Proforma prefix','<span class="mono">NL-PFY</span>'],['Invoice prefix','<span class="mono">NL-INV</span>'],['Credit note prefix','<span class="mono">NL-CN</span>'],['Receipt prefix','<span class="mono">NL-RCPT</span>'],['FY counter','<span class="mono">2026-000162 active</span>'],
    ]), body: kv([['Proforma prefix','<span class="mono">NL-PFY</span>'],['Invoice prefix','<span class="mono">NL-INV</span>'],['Credit note prefix','<span class="mono">NL-CN</span>'],['Receipt prefix','<span class="mono">NL-RCPT</span>'],['Next invoice','<span class="mono font-bold">NL-INV-2026-000164</span>']])})}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Tax defaults', body: `
      ${field('Default SAC', '<select class="select"><option selected>998314 — Information technology design & development services</option><option>999293 — Web design services</option></select>', { req: false })}
      <div class="grid g2 gap-4 mt-4">
        ${field('CGST', input({ val: '9%', cls: 'mono' }), { req: false })}
        ${field('SGST', input({ val: '9%', cls: 'mono' }), { req: false })}
      </div>
      <div class="text-xs dim mt-3" style="line-height:1.6">Inter-state supplies auto-switch to IGST at 18% when client GSTIN state ≠ Telangana.</div>` })}
    ${panel({ title: 'Documents on file', pad: false, body: `
      ${[['file-text','Certificate of incorporation (COI)','Uploaded Jan 2025'],['file-check','GST registration certificate','Uploaded Jan 2025'],['bank','Cancelled cheque — HDFC ···· 8821','Uploaded Feb 2025'],['file-check','MSME / Udyam certificate','Uploaded Mar 2025']].map(([i,t,s])=>`
      <div class="panel-row"><span style="color:var(--ink-3)">${icon(i,15)}</span><div class="min-w-0 flex-1"><b style="font-size:12.8px">${t}</b><div class="text-xs dim">${s}</div></div><button class="btn btn-ghost btn-xs">${icon('download',12)}</button></div>`).join('')}` })}
  </div>
</div>
<div class="actionbar"><span class="text-xs dim mr-auto">Changes to the legal profile re-version all future documents</span><button class="btn btn-ghost">Discard</button><button class="btn btn-primary">Save changes</button></div>`,
  },

  // ================================================================ USERS
  {
    path: 'apps/admin/users/', app: 'admin', title: 'Users · Admin', crumb: 'Users',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Users', sub: 'Every account — clients and operators. Search, filter, open a 360.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/admin/users/search/')}">${icon('search',14)} Deep search</a>` })}
${tabs([{ l: 'Clients', count: 15, active: true }, { l: 'Operators', count: 5 }])}
${filterbar(`${searchInput('Search name, email, company…', 280)}${sel(['All states','Active','Suspended','Invited'])}${sel(['Joined','Last 30 days','This quarter','All time'])}`)}
<div class="panel">
${table({ cols: [{l:'User'},{l:'Company'},{l:'Status'},{l:'Requests'},{l:'Projects'},{l:''}], rows: [
  ...CLIENTS.slice(0, 10).map((c, i) => [
    `<div class="flex items-center gap-2"><span class="avatar hue-${(i % 5) + 1}">${c.name.split(' ').map(w => w[0]).join('')}</span><div><b style="font-size:12.8px">${c.name}</b><div class="text-xs dim mono">${c.email}</div></div></div>`,
    `<span class="dim">${c.company}</span>`,
    badge(c.tone === 'ok' ? 'Active' : c.tone === 'warning' ? 'Invited' : 'Suspended', c.tone),
    `<span class="mono">${[4,2,1,3,5,0,2,1,0,2][i]}</span>`,
    `<span class="mono">${[2,1,0,1,3,0,1,1,0,0][i]}</span>`,
    `<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/users/[id]/')}">View →</a>`,
  ])
]})}
</div>
${pager(`Showing 1–10 of 21 — don't see your account? <a class="link" href="${LT(r,'apps/admin/users/search/')}">Search</a>`, '1/3')}`,
  },

  {
    path: 'apps/admin/users/search/', app: 'admin', title: 'User search · Admin', crumb: 'Deep search',
    body: (r) => `
${backlink(r, 'apps/admin/users/', 'Back to users')}
${phead({ eyebrow: 'OPERATIONS', title: 'Deep search', sub: 'Query across emails, names, companies, project IDs, and document numbers.' })}
${panel({ pad: true, body: `
  <div class="grid gap-4" style="grid-template-columns:1fr auto auto">
    <div class="input-wrap"><span class="in-icon">${icon('search',15)}</span><input class="input" placeholder="nair · +91 98410 · NL-204 · mehta@…"></div>
    <select class="select" style="width:150px"><option>All fields</option><option>Email</option><option>Phone</option><option>Document ref</option></select>
    <button class="btn btn-primary">${icon('search',14)} Search</button>
  </div>
  <div class="flex gap-2 mt-3 flex-wrap">${['Role: client','Role: operator','Has: open requests','Has: outstanding dues','Joined < 30d','State: suspended'].map((c,i)=>`<span class="chip${i<2?' active':''}">${c}</span>`).join('')}</div>` })}
<div class="panel mt-5">
  <div class="panel-head"><h3 class="panel-title">Results — “nair”</h3><span class="text-xs dim">2 matches · 30 ms</span></div>
  ${table({ cols: [{l:'User'},{l:'Matched on'},{l:'Status'},{l:''}], rows: [
    [`<div class="flex items-center gap-2"><span class="avatar hue-1">PN</span><b>Priya Nair</b></div>`,'Name · 5 requests · NL-204 active',badge('Active','success'),`<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/users/[id]/')}">View →</a>`],
    [`<div class="flex items-center gap-2"><span class="avatar hue-4">SN</span><b>Sandeep Nair</b></div>`,'Email snair@… · IT approver at NLS',badge('Invited','warning'),`<a class="link text-xs font-semibold" href="${LT(r,'apps/admin/users/[id]/')}">View →</a>`],
  ]})}
</div>`,
  },

  {
    path: 'apps/admin/users/[id]/', app: 'admin', alias: 'apps/admin/users/arjun-mehta/', title: 'Arjun Mehta · Users · Admin', crumb: 'User detail',
    body: (r) => `
${backlink(r, 'apps/admin/users/', 'Back to users')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div class="flex items-center gap-4">
    <span class="avatar hue-3 xl">AM</span>
    <div><h1 class="ptitle" style="font-size:20px">Arjun Mehta</h1>
    <div class="flex gap-2 mt-2">${badge('Client','info')}${badge('Active','success')}<span class="text-xs dim" style="align-self:center">Mehta Consulting Group · Mumbai · arjun.mehta@nestlancer.com</span></div></div>
  </div>
  <div class="flex gap-2"><button class="btn btn-secondary btn-sm">${icon('key',13)} Reset password</button><button class="btn btn-danger btn-sm">${icon('shield',13)} Suspend</button></div>
</div>
${stats([
  { label: 'Lifetime billed', value: '₹3,18,400', note: '12 invoices', icon: 'receipt' },
  { label: 'Open requests', value: '4', note: '2 ready to quote', icon: 'send' },
  { label: 'Projects', value: '2', note: '1 archived', icon: 'folder' },
  { label: 'Outstanding', value: '₹0', note: 'Fast payer (avg 8h)', icon: 'check-circle' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Recent requests', actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/requests/')}">All requests →</a>`, pad: false, body: table({ cols: [{l:'Request'},{l:'Status'},{l:'Updated'}], rows: [
      ['AUDIT-P23-LINE-20261005-7r0l Request',badge('Submitted','warning'),'<span class="text-xs dim">Oct 6</span>'],
      ['AUDIT-P23-SUPP-20261005-6grw Request',badge('Submitted','warning'),'<span class="text-xs dim">Oct 6</span>'],
      ['AUDIT-P25-20261005-73dhk Project Fixture',badge('Converted To Project','info'),'<span class="text-xs dim">Oct 5</span>'],
    ]})})}
    ${panel({ title: 'Sessions &amp; security', pad: false, body: table({ cols: [{l:'Device'},{l:'Location'},{l:'Last seen'},{l:''}], compact: true, rows: [
      ['Chrome 141 · macOS','Mumbai, IN','<span class="mono text-xs">Now</span>',badge('Current','success')],
      ['Safari · iPhone','Mumbai, IN','<span class="mono text-xs">Oct 9</span>',`<button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Revoke</button>`],
      ['Firefox 143 · Windows','Pune, IN','<span class="mono text-xs">Sep 30</span>',`<button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Revoke</button>`],
    ]})})}
    ${panel({ title: 'Audit events', pad: false, body: timeline([
      { title: 'SIGNED_IN', sub: '103.220.18.14 · Chrome · Mumbai', time: 'Today, 8:02 AM' },
      { title: 'REQUEST_SUBMITTED', sub: 'AUDIT-P23-LINE via portal intake', time: 'Oct 6, 3:47 AM' },
      { title: 'QUOTE_VIEWED', sub: '#01a10f80 v1 PDF', time: 'Oct 5, 6:14 PM' },
      { title: 'EMAIL_VERIFIED', sub: 'Onboarding complete', time: 'Aug 12, 2025', mut: true },
    ])})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Controls', body: `
      ${field('Role', '<select class="select"><option selected>Client</option><option>Operator — CX</option></select>', { req: false })}
      ${field('Operator assignment', '<select class="select"><option selected>Riya Kapoor</option><option>Arjun Nair</option></select>', { req: false })}
      <div class="mt-2">${switchRow('Email verified','', true)}</div>
      ${switchRow('Two-factor authentication','Operator-enforced for payouts > ₹1L')}
      <button class="btn btn-primary w-full mt-3">Save changes</button>` })}
    ${note('warn','shield','Suspension blocks sign-in immediately and hides the client from new intake. Their data and documents are never deleted automatically.')}
  </div>
</div>`,
  },

  // ================================================================ MESSAGES (admin)
  {
    path: 'apps/admin/messages/', app: 'admin', title: 'Messages · Admin', crumb: 'Message center',
    body: (r) => `
${phead({ eyebrow: 'SUPPORT', title: 'Message center', sub: 'All studio conversations at a glance — inbox pressure, response health, and where you are standing by.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/messages/new/')}">Compose</a><a class="btn btn-primary" href="${LT(r,'apps/admin/messages/inbox/')}">Open inbox</a>` })}
${stats([
  { label: 'Unread for you', value: '12', note: '4 threads waiting', icon: 'inbox' },
  { label: 'Avg first response', value: '46m', note: 'Target &lt; 2h', icon: 'zap' },
  { label: 'Client satisfaction', value: '4.8', note: 'Post-thread rating', icon: 'check-circle' },
  { label: 'Open threads', value: '21', note: '6 direct · 15 groups', icon: 'message' },
], 4)}
${panel({ title: 'Your queue', sub: 'Threads assigned to you, stale first', actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/messages/inbox/')}">Inbox →</a>`, pad: false, cls: 'mt-5', body: `
  ${[['Priya Nair — LMS delivery','“Confirming Oct 13 review slot works?”','2h ago','warning',1],
     ['Karthik Menon','“UTR posted on the payment page — need ack before weekend.”','4h ago','warning',4],
     ['Agency partner coordination','Samira: “Landing copy freeze moved to Monday.”','Yesterday','neutral',3],
     ['System — settlements digest','2 unmatched transfers, 1 dispute evidence due','Yesterday','muted',2]].map(([t,s,u,tn,h])=>`
  <a class="panel-row" href="${LT(r,'apps/admin/messages/inbox/')}"><span class="avatar hue-${h}">${t.slice(0,1)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs muted truncate mt-1" style="max-width:560px">${s}</div></div>
    <span class="text-xs dim">${u}</span>${badge(tn==='warning'?'Unread':tn==='neutral'?'Active':'System',tn)}</a>`).join('')}` })}
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr">
  ${panel({ title: 'Quick actions', pad: true, body: `<div class="grid g2 gap-3">
    ${[['New direct message','message','apps/admin/messages/new/direct/'],['New group thread','users','apps/admin/messages/new/group/'],['Project thread finder','folder','apps/admin/messages/threads/'],['Archived conversations','archive','apps/admin/messages/archived/']].map(([t,i,h])=>`
    <a class="panel panel-pad" href="${LT(r,h)}" style="display:flex;align-items:center;gap:12px"><span class="avatar sq" style="width:32px;height:32px;background:var(--brand-2);color:var(--brand-11)">${icon(i,14)}</span><b style="font-size:13px">${t}</b></a>`).join('')}
  </div>` })}
  ${panel({ title: 'Response health (7d)', pad: true, body: lineChart({ seed: 5, data: [70, 55, 62, 48, 52, 46, 44, 50, 46, 42, 46, 48, 45, 46] }) + '<div class="text-xs dim mono mt-2">median minutes to first reply · latest 46m</div>' })}
</div>`,
  },

  {
    path: 'apps/admin/messages/inbox/', app: 'admin', title: 'Inbox · Messages · Admin', crumb: 'Inbox',
    body: (r) => `
${phead({ eyebrow: 'SUPPORT', title: 'Operator inbox', sub: 'Triage on the left, the active thread on the right. Client-facing — be precise.',
  actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/messages/')}">Center</a><a class="btn btn-primary btn-sm" href="${LT(r,'apps/admin/messages/new/')}">${icon('plus',13)} New message</a>` })}
<div class="chat-grid pane3" style="margin-top:4px">
  <div class="chat-col">
    <div class="chat-head"><b style="font-size:13px">Mailbox</b><span class="badge tone-danger" style="font-family:var(--font-mono)">12</span></div>
    ${[['inbox','All threads',5,LT(r,'apps/admin/messages/threads/'),false],['user','Direct',2,LT(r,'apps/admin/messages/new/direct/'),false],['users','Groups',2,LT(r,'apps/admin/messages/new/group/'),false],['folder','Project threads',3,LT(r,'apps/admin/messages/project/[projectId]/'),false],['clock','Snoozed',0,'#',false],['archive','Archived',0,LT(r,'apps/admin/messages/archived/'),false]].map(([i,l,c,h,a])=>`
    <a class="conv" href="${h}" style="${a?'background:var(--brand-1)':''}"><span style="color:var(--ink-3);margin-top:2px">${icon(i,15)}</span><div class="flex-1"><div class="t">${l}</div></div>${c?`<span class="sb-count">${c}</span>`:''}</a>`).join('')}
  </div>
  <div class="chat-col">
    <div class="chat-head"><div class="input-wrap grow"><span class="in-icon">${icon('search',13)}</span><input class="input sm" placeholder="Search threads…"></div></div>
    ${[['Priya Nair — LMS delivery · NL-204','“Confirming Oct 13 review slot works?”','2h ago',true,1],['Karthik Menon','“UTR posted on the payment page…”','4h ago',true,4],['Agency partner coordination','“Landing copy freeze moved to Monday.”','Yesterday',false,3],['Pain point capture thread','“Client asked for sandbox keys twice…”','Oct 8',false,5]].map(([t,s,u,uwas,h])=>convItem(t,'Thread',s,u,{unread:uwas,hue:h,active:u==='2h ago'})).join('')}
  </div>
  <div class="chat-col flex-col" style="display:flex">
    <div class="chat-head" style="padding:12px 16px">
      <div class="flex items-center gap-2 min-w-0"><span class="avatar hue-1">PN</span><div class="min-w-0"><b class="block truncate" style="font-size:13.5px">Priya Nair — LMS delivery · NL-204</b><div class="text-xs dim">Project thread · 5 participants</div></div></div>
      <span class="badge tone-warning shrink-0">Client waiting</span>
    </div>
    <div class="grow" style="overflow-y:auto;padding-bottom:12px">
      <div class="msg-day"><span>Oct 10, 2026</span></div>
      ${msgRow('Priya Nair','Confirming Oct 13 review slot works? I have the IT approver (Sandeep) lined up if so.','9:41 AM',{hue:1})}
      ${msgRow('Arjun Nair','Works for delivery. Staging build freezes Sunday night; you will get the preview link in this thread.','9:52 AM',{hue:3})}
      ${msgRow('Priya Nair','Perfect — Sandeep will run Okta flow end-to-end on Monday morning IST. I will log findings here.','10:03 AM',{hue:1})}
      ${msgRow('You','Locked: review slot Oct 13, 10:00–11:30 IST. Calendar invite sent to all five participants.','10:05 AM',{me:true})}
    </div>
    ${composer('Reply to #nl-204…')}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/messages/threads/', app: 'admin', title: 'Threads · Messages · Admin', crumb: 'Threads',
    body: (r) => `
${backlink(r, 'apps/admin/messages/', 'Message center')}
${phead({ eyebrow: 'SUPPORT', title: 'All threads', sub: 'Every conversation in the workspace — filter by type, assignee, or client.' })}
${filterbar(`${searchInput('Search threads…', 240)}${sel(['All types','Direct','Group','Project','System'])}${sel(['Any assignee','You','Riya Kapoor','Arjun Nair','Unassigned'])}`)}
<div class="panel">
${table({ cols: [{l:'Thread'},{l:'Type'},{l:'Assignee'},{l:'Last activity'},{l:'State'},{l:''}], rows: [
  ...[['LMS delivery — NL-204','Project','You','2h ago','Client waiting','warning',1,'apps/admin/messages/project/[projectId]/'],
     ['Priya Nair','Direct','You','2h ago','Unread','warning',1,'apps/admin/messages/[id]/'],
     ['Agency partner coordination','Group','Riya Kapoor','Yesterday','Active','info',3,'apps/admin/messages/[id]/'],
     ['Pain point capture thread','Group','—','Oct 8','Unassigned','neutral',5,'apps/admin/messages/[id]/'],
     ['System — settlements digest','System','—','Yesterday','Automated','muted',2,'apps/admin/messages/[id]/'],
     ['Onboarding welcome imports','System','—','Oct 5','Automated','muted',4,'apps/admin/messages/[id]/']]
    .map(([t,ty,as,la,st,tn,h,line])=>[
      `<div class="flex items-center gap-2"><span class="avatar hue-${h}">${t.slice(0,1)}</span><b style="font-size:12.8px">${t}</b></div>`,
      badge(ty,'neutral'),`<span class="dim">${as}</span>`,`<span class="text-xs dim">${la}</span>`,badge(st,tn),
      `<a class="link text-xs font-semibold" href="${LT(r,line)}">Open →</a>`])
]})}
</div>
${pager('Showing 1–6 of 24','1/4')}`,
  },

  {
    path: 'apps/admin/messages/project/[projectId]/', app: 'admin', title: 'Project thread · Messages · Admin', crumb: 'Project thread',
    body: (r) => `
${backlink(r, 'apps/admin/messages/threads/', 'All threads')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><div class="eyebrow">PROJECT THREAD · NL-204</div><h1 class="ptitle" style="font-size:20px">LMS delivery — NL-204</h1>
  <div class="flex gap-2 mt-2">${badge('Project thread','info')}<span class="chip" style="height:22px;font-size:11.5px">5 participants</span></div></div>
  <div class="flex gap-2"><a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/projects/[id]/')}">Project ops</a><button class="btn btn-ghost btn-sm">${icon('archive',13)} Archive</button></div>
</div>
<div class="chat-grid" style="grid-template-columns:1fr;height:auto">
  <div class="grow" style="max-height:54vh;overflow-y:auto;padding-bottom:12px">
    <div class="msg-day"><span>Oct 8, 2026</span></div>
    ${msgRow('Arjun Nair','Milestone 3 submitted for client review — course builder + quiz engine on staging.','6:40 PM',{hue:3})}
    ${msgRow('You','Noted. Client notified in-app. Reminder scheduled for Oct 13 if no response.','6:42 PM',{me:true})}
    <div class="msg-day"><span>Oct 10, 2026</span></div>
    ${msgRow('Priya Nair','Confirming Oct 13 review slot works? I have the IT approver (Sandeep) lined up if so.','9:41 AM',{hue:1})}
    ${msgRow('Arjun Nair','Works for delivery. Staging build freezes Sunday night; preview link lands here.','9:52 AM',{hue:3})}
    ${msgRow('Priya Nair','Perfect — Sandeep runs Okta end-to-end Monday morning IST. Findings logged here.','10:03 AM',{hue:1})}
  </div>
  ${composer('Reply to #nl-204…')}
</div>`,
  },

  {
    path: 'apps/admin/messages/[id]/', app: 'admin', title: 'Conversation · Messages · Admin', crumb: 'Conversation',
    body: (r) => `
${backlink(r, 'apps/admin/messages/inbox/', 'Inbox')}
${phead({ eyebrow: 'DIRECT', title: 'Karthik Menon', sub: 'Direct conversation · PayTech Systems · Client since Nov 2025' })}
<div class="chat-grid" style="grid-template-columns:1fr;height:auto">
  <div class="grow" style="max-height:52vh;overflow-y:auto;padding-bottom:12px">
    <div class="msg-day"><span>Oct 10, 2026</span></div>
    ${msgRow('Karthik Menon','Morning — UTR posted on the payment page for the deposit (NEFT, PUNB1023456). Need an acknowledgement before weekend payroll.','6:58 AM',{hue:4})}
    ${msgRow('You','Received. Statement match found this morning — verification posts today; the invoice clears automatically when Sunita confirms.','9:12 AM',{me:true})}
    ${msgRow('Karthik Menon','Thanks — while you are here, can we move the design freeze two days earlier?','9:20 AM',{hue:4})}
    ${msgRow('You','Checking with the design pool — expect a date by EOD. If freeze moves, the second milestone invoice date moves with it.','9:26 AM',{me:true})}
  </div>
  ${composer('Reply to Karthik…')}
</div>`,
  },

  {
    path: 'apps/admin/messages/new/', app: 'admin', title: 'New message · Admin', crumb: 'Compose',
    body: (r) => `
${backlink(r, 'apps/admin/messages/', 'Message center')}
${phead({ eyebrow: 'COMPOSE', title: 'New message', sub: 'Start a scoped conversation with any client or pod.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  ${panel({ title: 'Compose', body: `
    ${field('To', '<select class="select"><option>Priya Nair — Nair Learning Systems</option><option>Karthik Menon — PayTech Systems</option><option>Arjun Mehta — Mehta Consulting Group</option><option>Custom email…</option></select>')}
    <div class="mt-4">${field('Context', '<select class="select"><option>None</option><option>NL-204 — Corporate LMS</option><option>UPI Switch Integration Layer</option><option>Payment ₹36,000 verification</option></select>', { req: false })}</div>
    <div class="mt-4">${field('Subject', input({ ph: 'Thread subject…' }))}</div>
    <div class="mt-4">${field('Message', textarea('Write the message…', '', 7))}</div>
    <div class="flex items-center gap-3 mt-4">
      <a class="btn btn-primary" href="${LT(r,'apps/admin/messages/[id]/')}">${icon('send',14)} Send</a>
      <button class="btn btn-ghost btn-sm">Save draft</button>
      <span class="text-xs dim ml-auto">Client replies land in their Messages inbox</span>
    </div>` })}
  <div class="flex-col gap-5">
    ${panel({ title: 'Delivery', body: switchRow('Also email recipient','Thread message mirrored to their email', true)})}
    ${panel({ title: 'Compose folder', body: `<div class="grid gap-2">${[[ 'New direct message','message','apps/admin/messages/new/direct/'],['New group thread','users','apps/admin/messages/new/group/']].map(([t,i,h])=>`<a class="panel-row" style="border:1px solid var(--line);border-radius:9px" href="${LT(r,h)}"><span style="color:var(--brand-9)">${icon(i,14)}</span><b style="font-size:12.8px">${t}</b></a>`).join('')}</div>` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/messages/new/direct/', app: 'admin', title: 'New direct · Messages · Admin', crumb: 'New direct',
    body: (r) => `
${backlink(r, 'apps/admin/messages/', 'Message center')}
${phead({ eyebrow: 'DIRECT MESSAGE', title: 'New direct message', sub: 'One-to-one with a client or an operator. PII visible inline — be mindful.' })}
${panel({ title: 'Pick a person', body: `
  <div class="input-wrap mb-4"><span class="in-icon">${icon('search',14)}</span><input class="input" placeholder="Search clients &amp; staff…"></div>
  <div class="grid gap-3" style="grid-template-columns:1fr 1fr">
    ${[['Priya Nair','Client · Nair Learning Systems · NL-204','Online now',1],['Karthik Menon','Client · PayTech Systems','Last seen 20m ago',4],['Riya Kapoor','Admin &amp; support intake','Online now',2],['Arjun Nair','Delivery lead · NL-204','In review until 3 PM',3],['Dev Malhotra','Engineering · SSO','Idle',2],['Sunita Rao','Finance desk','Workdays 10–18 IST',3]].map(([n,d,o,h])=>`
    <a class="panel-row" href="${LT(r,'apps/admin/messages/[id]/')}" style="border:1px solid var(--line);border-radius:10px;padding:12px 14px">
      <span class="avatar hue-${h} lg">${n.split(' ').map(w=>w[0]).join('')}</span>
      <div class="min-w-0 flex-1"><b style="font-size:13.5px">${n}</b><div class="text-xs dim">${d}</div><div class="text-xs mt-1" style="color:var(--t-success-tx)"><i class="dot" style="background:var(--t-success-dot)"></i> ${o}</div></div>
      ${icon('chevron-right',14)}
    </a>`).join('')}
  </div>` })}`,
  },

  {
    path: 'apps/admin/messages/new/group/', app: 'admin', title: 'New group thread · Admin', crumb: 'New group',
    body: (r) => `
${backlink(r, 'apps/admin/messages/', 'Message center')}
${phead({ eyebrow: 'GROUP', title: 'New group thread', sub: 'Coordinate across clients and pods. Name it after the work, not the people.' })}
${panel({ title: 'Group setup', body: `
  ${field('Thread name', input({ ph: 'e.g. Payments ops — Razorpay settlement and webhooks' }))}
  <div class="mt-4">${field('Purpose (visible to members)', textarea('What belongs here, what does not.', '', 3), { req: false })}</div>
  <div class="mt-4"><label class="label">Members <span class="req">*</span></label>
    <div class="grid g3 gap-2">
      ${[['Riya Kapoor','ops',true],['Arjun Nair','delivery',true],['Dev Malhotra','engineering',false],['Sunita Rao','finance',false],['Priya Nair','client',true],['Sandeep Nair','client IT',false]].map(([n,r,c])=>`
      <label class="check panel" style="padding:10px 12px;margin:0;gap:10px"><input type="checkbox"${c?' checked':''}> <span style="font-size:12.5px"><b>${n}</b> <span class="dim text-xs">· ${r}</span></span></label>`).join('')}
    </div>
  </div>
  <div class="mt-4">${switchRow('Project thread?','Link this group to an active engagement (NL-204…)')}</div>
`})}
<div class="flex gap-2 mt-4"><a class="btn btn-primary" href="${LT(r,'apps/admin/messages/project/[projectId]/')}">${icon('users',14)} Create group</a><button class="btn btn-secondary">Save draft</button></div>`,
  },

  {
    path: 'apps/admin/messages/archived/', app: 'admin', title: 'Archived threads · Admin', crumb: 'Archived',
    body: (r) => `
${backlink(r, 'apps/admin/messages/', 'Message center')}
${phead({ eyebrow: 'ARCHIVE', title: 'Archived conversations', sub: 'Cold storage — searchable, restorable, never deleted.' })}
<div class="panel">
  ${[['Vendor onboarding — Q1','Group · 12 messages','Resolved Feb 2026'],['Onboarding welcome imports','System · 31 messages','Imported Sep 2025'],['Beta feedback — pricing page','Group · 8 messages','Closed Aug 2026'],['Client: Iyer FinTech — ad hoc thread','Direct · 19 messages','Resolved Oct 1']].map(([t,m,c])=>`
  <div class="panel-row"><span class="avatar sq" style="width:32px;height:32px;background:var(--bg-subtle);color:var(--ink-3)">${icon('archive',14)}</span>
  <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs dim mt-1">${m}</div></div>
  <span class="text-xs dim">${c}</span><button class="btn btn-ghost btn-sm">Unarchive</button></div>`).join('')}
</div>
${pager('Showing 1–4 of 23','1/6')}`,
  },

  // ================================================================ CONTACT
  {
    path: 'apps/admin/contact/', app: 'admin', title: 'Contact messages · Admin', crumb: 'Contact inbox',
    body: (r) => `
${phead({ eyebrow: 'OPERATIONS', title: 'Contact inbox', sub: 'Every form submission from the public sites. Qualify into a request or archive.' })}
${stats([
  { label: 'New', value: '17', note: 'Unreplied submissions', icon: 'mail' },
  { label: 'Qualified this week', value: '6', note: 'Converted to requests', icon: 'send' },
  { label: 'Spam auto-filtered', value: '41', note: 'Last 30d', icon: 'shield-check' },
], 3)}
${filterbar(`${searchInput('Search name, email, company…', 260)}${sel(['All','New','Replied','Qualified','Archived'])}`)}
<div class="panel">
${table({ cols: [{l:'When'},{l:'From'},{l:'Message'},{l:'Budget'},{l:'State'},{l:''}], compact: true, rows: [
  ...[['2h ago','Vishal Kapoor · kapoor.studios@…','Looking for a rebranding + storefront build before New Year…','₹2L+','New','warning'],
     ['5h ago','Meera Bhat · meera@brightpath…','Need a tutor booking MVP in 6 weeks — have curriculum ready','₹1–2L','New','warning'],
     ['Yesterday','Omar Sayed · omar@specright.in','Compliance-grade docs portal for LIC brokers','Not sure','Replied','info'],
     ['Yesterday','Tanvi Shah · tanvi@shahlabs…','Can you audit our checkout? Drop-off at UPI step','₹50k–1L','Qualified','success'],
     ['Oct 7','Rohan Iyer · rohan@farmaid…','POS offline mode for 40 pharmacy outlets','₹1–2L','Qualified','success']]
    .map(([w,f,m,b,st,tn])=>[`<span class="text-xs dim nowrap">${w}</span>`,`<b style="font-size:12.5px">${f}</b>`,`<span class="dim truncate" style="max-width:280px;display:inline-block;font-size:12px">${m}</span>`,`<span class="mono text-xs">${b}</span>`,badge(st,tn),
    `<div class="flex gap-1"><button class="btn btn-ghost btn-xs">Reply</button><button class="btn btn-primary btn-xs">Qualify</button></div>`])
]})}
</div>
${note('tip','check-circle','No newsletter here — Nestlancer acquisition is referral-driven. Qualified contact messages convert into requests with the original email attached.')}`,
  },

  // ================================================================ NOTIFICATIONS (admin)
  {
    path: 'apps/admin/notifications/', app: 'admin', title: 'Notifications · Admin', crumb: 'Notifications',
    body: (r) => `
${phead({ eyebrow: 'OPERATOR', title: 'Notifications', sub: 'System events, queue alerts, and mentions aimed at you.',
  actions: `<button class="btn btn-ghost btn-sm">Mark all read</button><button class="btn btn-secondary btn-sm">Clear read</button>` })}
${tabs([
  { l: 'All', active: true }, { l: 'Unread', count: 31 }, { l: 'Requests' }, { l: 'Quotes' }, { l: 'Payments' },
  { l: 'Messages' }, { l: 'Contact' }, { l: 'Users' }, { l: 'System' },
])}
<div class="panel">
  ${[['card','Payment received: ₹41,520.00','A payment of ₹41,520.00 was authorized for Corporate LMS for 200 Employees (NL-204). Group: Agency client coordination.','info'],
     ['message','New group message: UAE per-client exports and handover zone','Riya Kapoor added you to a group conversation: UAE per-client exports and handover zone — quick ind…','warn'],
     ['zap','New project auto-created from audit fixture: AUDIT-P25-20261005-73dhk Project Fixture','System auto-created an active project from the request queue — assigned to Deliv…','info'],
     ['send','Request submitted: AUDIT-P23-20261005-7r0l Request','Arjun Mehta submitted request “AUDIT-P23-LINE-20261005-7r0l Request”.','warn'],
     ['send','Request submitted: AUDIT-P23-20261005-6grw Request','Arjun Mehta submitted request “AUDIT-P23-SUPP-20261005-6grw Request”.','warn'],
     ['mail','New contact message: Rohan Iyer','Rohan Iyer (rohan@farmaid.in) sent a message about POS offline mode for 40 pharmacy outlets.','neu'],
     ['clock','Audit window completed status: 0 rows in audit_inquiries','Background monitoring job wrapped the audit window successfully.','neu'],
     ['message','New system group: System communications for inbox archive','A system thread kept for administrative coordination. Members are imported during onboarding.','neu']]
    .map(([i,t,s,k],ix)=>`
  <div class="panel-row" style="align-items:flex-start">
    <span class="avatar sq shrink-0" style="width:32px;height:32px;background:${k==='warn'?'var(--t-muted-bg)':k==='neu'?'var(--bg-subtle)':'var(--brand-2)'};color:${k==='warn'?'var(--t-muted-tx)':k==='neu'?'var(--ink-3)':'var(--brand-11)'}">${icon(i,14)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs muted mt-1" style="line-height:1.5">${s}</div></div>
    <span class="text-xs dim shrink-0 nowrap">Oct 10, 6:58<br>AM</span>
    <span class="text-xs ${ix<4?'brand-text font-semibold':'dim'} shrink-0">${ix<4?'●':''} ${icon('check',12)}</span>
  </div>`).join('')}
</div>
${pager('Showing 1–8 of 31', '1/4')}`,
  },
];
