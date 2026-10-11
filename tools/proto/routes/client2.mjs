// ============================================================================
// ROUTES — apps/web CLIENT PORTAL — part 2
// Messages (8) · Payments (5) · Invoices (2) · Notifications · Profile · Settings (8)
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, stats, table, tabs, filterbar, searchInput, sel, pager, progress, timeline, kv, field, input, textarea, switchRow, empty, convItem, msgRow, composer } from '../lib/comps.mjs';
import { phead, backlink } from '../lib/chrome.mjs';

// ------------------------------------------------------- messaging fragments
const CONVOS = [
  { name: 'Payments ops — Razorpay settlement and webhooks', kind: 'GROUP', s: "I'll post the shared retry checklist here after tomorrow's reconciliation review. Production changes still go through each project milestone.", t: '5 days ago', unread: true, hue: 1 },
  { name: 'Riya Kapoor', kind: 'DIRECT', s: 'Thanks. Our finance team confirmed the duplicate NEFT on their end too. Replay UI remains the priority for month-end.', t: '5 days ago', unread: false, hue: 2 },
  { name: 'LMS delivery — NL-204', kind: 'GROUP', s: 'Quiz engine thresholds deployed to staging. Two question types pending copy review.', t: '2 days ago', unread: true, hue: 4 },
  { name: 'Studio announcements', kind: 'GROUP', s: 'Scheduled maintenance Sun 02:00–03:30 IST. Read-only mode expected for 20 minutes.', t: 'Oct 4', unread: false, hue: 3 },
];

const folderCol = (r, active) => `
<div class="chat-col">
  <div class="chat-head"><b style="font-size:13px">Mailbox</b><button class="btn-icon btn sm" title="Compose">${icon('pen',13)}</button></div>
  ${[['inbox','Inbox','apps/web/messages/inbox/',6],['message','Threads','apps/web/messages/threads/',2],['archive','Archived','apps/web/messages/archived/',0]].map(([i,l,h,c])=>`
  <a class="conv" href="${LT(r,h)}" style="${active===l?'background:var(--brand-1);box-shadow:inset 2.5px 0 0 var(--brand-9)':''}">
    <span style="color:var(--ink-3);margin-top:2px">${icon(i,15)}</span><div class="flex-1"><div class="t">${l}</div></div>${c?`<span class="sb-count">${c}</span>`:''}
  </a>`).join('')}
  <div class="p-3">
    <a class="btn btn-primary btn-sm w-full" href="${LT(r,'apps/web/messages/new/')}">${icon('plus',13)} New message</a>
    <a class="btn btn-ghost btn-sm w-full mt-2" href="${LT(r,'apps/web/messages/new/direct/')}">New direct</a>
  </div>
</div>`;

const listCol = (items) => `
<div class="chat-col">
  <div class="chat-head"><div class="input-wrap grow"><span class="in-icon">${icon('search',13)}</span><input class="input sm" placeholder="Search conversations…"></div></div>
  ${items.map((c) => convItem(c.name, c.kind, c.s, c.t, { active: c.active, unread: c.unread, hue: c.hue })).join('')}
</div>`;

const threadPane = ({ title, kind, rows, online }) => `
<div class="chat-col flex-col" style="display:flex">
  <div class="chat-head" style="padding:12px 16px">
    <div class="flex items-center gap-3 min-w-0">
      <div class="min-w-0"><b class="block truncate" style="font-size:13.5px">${title}</b><div class="text-xs dim">${online ? '<i class="dot" style="background:var(--t-success-dot);display:inline-block;margin-right:4px"></i>Online · replies under 2h' : kind}</div></div>
    </div>
    <div class="flex gap-1"><button class="btn-icon btn sm" title="Details">${icon('users',14)}</button><button class="btn-icon btn sm" title="More">${icon('dots',14)}</button></div>
  </div>
  <div class="grow" style="overflow-y:auto;padding-bottom:14px">
    <div class="msg-day"><span>Oct 5, 2026</span></div>
    ${rows.join('')}
  </div>
  ${composer('Reply… (Enter to send, Shift+Enter for newline)')}
</div>`;

const chatGrid = (r, { active, listItems, pane, three = true }) => `
<div class="chat-grid${three ? ' pane3' : ''}" style="margin-top:4px">
  ${three ? folderCol(r, active) : ''}
  ${listCol(listItems)}
  ${pane}
</div>`;

const msgHubStats = [
  { label: 'Open conversations', value: '2', note: 'Active threads' },
  { label: 'Unread messages', value: '6', note: '1 threads waiting' },
  { label: 'Unread threads', value: '1', note: 'Needs a reply' },
];

const msgHubBody = (r, who = 'client') => `
${phead({ eyebrow: 'SUPPORT', title: 'Messages', sub: 'Review your inbox at a glance, then open the messaging panel to chat.',
  actions: `<span class="pill mr-1"><span class="dot"></span> Live</span><a class="btn btn-secondary" href="${LT(r,'apps/web/messages/new/')}">Message support</a><a class="btn btn-primary" href="${LT(r,'apps/web/messages/inbox/')}">Open messaging panel</a>` })}
${stats(msgHubStats, 3)}
<div class="panel mt-5">
  <div class="panel-head"><div><div class="panel-title">Recent conversations</div><div class="panel-sub">Latest activity in your inbox</div></div><a class="btn btn-primary btn-sm" href="${LT(r,'apps/web/messages/inbox/')}">Open messaging panel</a></div>
  ${CONVOS.slice(0, 3).map((c) => convItem(c.name, c.kind, c.s, c.t, { unread: c.unread, hue: c.hue })).join('')}
</div>`;

// ------------------------------------------------------- settings fragments
const settingsTabs = (r, active) => tabs([
  { l: 'Account', href: LT(r,'apps/web/settings/account/'), active: active === 'account' },
  { l: 'Security', href: LT(r,'apps/web/settings/security/'), active: active === 'security' },
  { l: 'Sessions', href: LT(r,'apps/web/settings/sessions/'), active: active === 'sessions' },
  { l: 'Notifications', href: LT(r,'apps/web/settings/notifications/'), active: active === 'notifications' },
  { l: 'Billing', href: LT(r,'apps/web/settings/billing/'), active: active === 'billing' },
  { l: 'Files', href: LT(r,'apps/web/settings/files/'), active: active === 'files' },
  { l: 'Activity', href: LT(r,'apps/web/settings/activity/'), active: active === 'activity' },
]);

const settingsHead = (title, sub) => phead({ title: 'Settings', sub });
const saveBar = `<div class="actionbar"><span class="text-xs dim mr-auto">Unsaved changes stay local until you save</span><button class="btn btn-ghost">Discard</button><button class="btn btn-primary">Save changes</button></div>`;


// ---------------------------------------------------------------- payment detail
const PAY_PROJECT = 'Corporate LMS for 200 Employees';
const payDetail = (r, state) => {
  const isPaid = state === 'paid';
  const statusBadge = isPaid
    ? '<span class="badge tone-success">Completed</span>'
    : '<span class="badge tone-neutral">Not due yet</span>';
  const steps = isPaid
    ? [['Created', 'done'], ['Pending', 'done'], ['Processing', 'done'], ['Completed', 'cur', 'Current: Completed'], ['Refunded', '']]
    : [['Not due yet', 'done'], ['Pending', 'cur', 'Current: Not due yet'], ['Processing', ''], ['Completed', ''], ['Refunded', '']];
  const stepHtml = steps.map(([t, k, sub]) => `<div class="flex gap-3 mb-4"><span style="width:14px;height:14px;border-radius:99px;margin-top:3px;border:2px solid ${k ? 'var(--brand-9)' : 'var(--line-strong)'};background:${k === 'done' ? 'var(--brand-9)' : 'transparent'}"></span><div><b class="text-sm ${k ? '' : 'dim'}">${t}</b>${sub ? `<div class="text-xs dim">${sub}</div>` : ''}</div></div>`).join('');
  const docs = isPaid
    ? `<div class="flex gap-3 flex-wrap"><button class="btn btn-primary">${icon('download', 14)} Download invoice</button><button class="btn btn-secondary">${icon('download', 14)} Download receipt</button></div>`
    : '';
  return `
${backlink(r, 'apps/web/payments/', 'Back to payments')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-2 mt-4">
  <div><h1 class="ptitle">Payment details</h1><p class="psub">${isPaid ? 'Review this payment and related documents.' : 'This installment is not due yet. Checkout unlocks after you approve delivery or when the studio requests payment.'}</p></div>
  ${statusBadge}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    <div class="panel" style="border-top:3px solid var(--brand-9)"><div class="panel-body">
      <div class="eyebrow">Order summary</div>
      <div class="flex items-start justify-between mt-2 mb-4">
        <div><b class="h3" style="font-size:17px">${PAY_PROJECT}</b><div class="text-sm muted mt-1">${isPaid ? 'Deposit' : 'Final payment'}</div></div>
        ${isPaid ? '<span class="badge tone-success">Paid</span>' : '<span class="badge tone-neutral">Not due yet</span>'}
      </div>
      <div class="flex items-end justify-between py-4" style="border-top:1px solid var(--line)"><span class="text-sm muted">Amount due</span><span class="mono" style="font-size:30px;font-weight:720;letter-spacing:-.03em">₹15,660.00</span></div>
      ${kv([['Currency', 'INR'], ['Reference', `<span class="mono">${isPaid ? '01a10a2c-5d1c-73fa-8a13-ae6621f9c1c2' : '01a10a2c-5d1c-73fa-8a13-b5a4b5e610a5'}</span>`], ['Created', '10/5/2026, 3:47:22 AM']])}
      ${isPaid
        ? `<div class="mt-4 text-sm" style="padding:14px 16px;border-radius:10px;background:var(--t-success-bg);color:var(--t-success-tx)">This payment has been recorded. Download your receipt or invoice below.</div>`
        : `<div class="mt-4" style="padding:14px 16px;border-radius:10px;background:var(--bg-sunken, #f4f4f2)"><b class="text-sm">Checkout not available yet</b><div class="text-sm muted mt-1">Complete the current milestone (payment or delivery review) before moving to later milestones.</div><div class="text-xs dim mt-2">Approve the milestone delivery from your project hub, or wait until Nestlancer requests this installment.</div></div>`}
    </div></div>
    ${isPaid
      ? panel({ title: 'Billing documents', sub: 'Download the latest invoice or receipt for this payment.', body: docs })
      : `<button class="btn btn-secondary" style="align-self:flex-start;color:var(--t-danger-tx)">Cancel payment</button>`}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Status', pad: true, body: stepHtml + (isPaid ? '' : `<button class="btn w-full mt-2" style="color:var(--t-danger-tx)">Cancel pending payment</button>`) })}
    ${panel({ title: 'Payment details', pad: true, body: kv([
      ['Payment ID', `<span class="mono" style="font-size:11px">${isPaid ? '01a10a2c-5d1c-73fa-8a13-ae6621f9c1c2' : '01a10a2c-5d1c-73fa-8a13-b5a4b5e610a5'}</span>`],
      ['Project', `<a class="link" href="${LT(r, 'apps/web/projects/[id]/')}">${PAY_PROJECT}</a>`],
      ['Created', '<span class="mono" style="font-size:11.5px">10/5/2026, 3:47:22 AM</span>'],
    ]) })}
    ${isPaid ? `<a class="link" href="#">File a payment dispute</a>` : ''}
  </div>
</div>`;
};

export default [
  // ================================================================ MESSAGES
  {
    path: 'apps/web/messages/', app: 'web', title: 'Messages · Nestlancer', crumb: 'Messages',
    body: (r) => msgHubBody(r),
  },
  {
    path: 'apps/web/messages/inbox/', app: 'web', title: 'Messaging panel · Nestlancer', crumb: 'Inbox',
    body: (r) => `
${phead({ eyebrow: 'SUPPORT', title: 'Messaging panel', sub: 'Triage on the left, the open thread on the right. Your delivery lead reads everything here.',
  actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/messages/')}">Inbox health</a><a class="btn btn-primary btn-sm" href="${LT(r,'apps/web/messages/new/')}">${icon('plus',13)} New message</a>` })}
${chatGrid(r, { active: 'Inbox', listItems: CONVOS.map((c, i) => ({ ...c, active: i === 1 })),
  pane: threadPane({ title: 'Riya Kapoor', kind: 'DIRECT', online: true, rows: [
    msgRow('Riya Kapoor', 'Good morning Ananya — finance confirmed the duplicate NEFT on their end as well. Reversal reference is in the thread from Tuesday.', '9:41 AM', { hue: 2 }),
    msgRow('Ananya Iyer', 'Perfect. Will the settlement slip reflect it before month-end reconciliation?', '9:44 AM', { me: true }),
    msgRow('Riya Kapoor', 'Yes — replay UI remains the priority for month-end, and the slip regenerates tonight. You will see both entries marked clearly.', '9:46 AM', { hue: 2 }),
    msgRow('Riya Kapoor', 'Sharing the retry checklist PDF here once the review closes tomorrow.', '9:47 AM', { hue: 2 }),
  ]}) })}`,
  },
  {
    path: 'apps/web/messages/threads/', app: 'web', title: 'Threads · Nestlancer', crumb: 'Threads',
    body: (r) => `
${phead({ eyebrow: 'SUPPORT', title: 'Threads', sub: 'Every conversation as a record — participants, scope, and last activity in one table.' })}
${filterbar(`${searchInput('Search threads…', 240)}${sel(['All types','Direct','Group','Project'])}${sel(['Any state','Unread','Awaiting reply','Resolved'])}`)}
<div class="panel">
${table({ cols: [{l:'Thread'},{l:'Type'},{l:'Participants'},{l:'Last activity'},{l:'State'},{l:''}], rows: [
  ['<b>Payments ops — Razorpay settlement and webhooks</b><div class="text-xs dim mono mt-1">th_01a10a2e-42f8</div>', badge('Group','info'),'5','<span class="text-xs dim">5 days ago</span>', badge('Unread 6','warning'), `<a class="link text-xs" href="${LT(r,'apps/web/messages/thread/[threadId]/')}">Open →</a>`],
  ['<b>LMS delivery — NL-204</b><div class="text-xs dim mono mt-1">th_01a0c9d1-77ab</div>', badge('Group','info'),'4','<span class="text-xs dim">2 days ago</span>', badge('Awaiting reply','info'), `<a class="link text-xs" href="${LT(r,'apps/web/messages/thread/[threadId]/')}">Open →</a>`],
  ['<b>Riya Kapoor</b><div class="text-xs dim mono mt-1">dm_01a0f2e4-1c90</div>', badge('Direct','neutral'),'2','<span class="text-xs dim">5 days ago</span>', badge('Read','muted'), `<a class="link text-xs" href="${LT(r,'apps/web/messages/[conversationId]/')}">Open →</a>`],
  ['<b>Studio announcements</b><div class="text-xs dim mono mt-1">th_00f8b2a1-3e55</div>', badge('Group','info'),'34','<span class="text-xs dim">Oct 4</span>', badge('Read','muted'), `<a class="link text-xs" href="${LT(r,'apps/web/messages/thread/[threadId]/')}">Open →</a>`],
]})}
</div>
${pager('Showing 1–4 of 4')}`,
  },
  {
    path: 'apps/web/messages/thread/[threadId]/', app: 'web', title: 'Conversation · Nestlancer', crumb: 'Thread detail',
    body: (r) => `
${backlink(r, 'apps/web/messages/threads/', 'Back to threads')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><h1 class="ptitle" style="font-size:22px">Payments ops — Razorpay settlement and webhooks</h1>
  <div class="flex gap-2 mt-2">${badge('Group','info')}<span class="chip" style="height:22px;font-size:11.5px">${icon('users',12)} 5 participants</span><span class="chip" style="height:22px;font-size:11.5px">Scope: ${icon('folder',12)} Payments</span></div></div>
  <div class="flex gap-2"><button class="btn btn-secondary btn-sm">${icon('user-check',13)} Members</button><button class="btn btn-ghost btn-sm">${icon('archive',13)} Archive</button></div>
</div>
<div class="chat-grid" style="grid-template-columns:1fr;height:auto">
<div class="grow" style="max-height:56vh;overflow-y:auto;padding-bottom:14px">
  <div class="msg-day"><span>Oct 5, 2026</span></div>
  ${msgRow('Riya Kapoor','Morning all — reconciliation review notes are in. Two duplicate NEFT entries from Friday confirmed by the bank side.','8:02 AM',{hue:2})}
  ${msgRow('Karthik Menon','Thanks Riya. From PayTech side we see matching UTRs. The retry checklist draft is attached to the calendar invite.','8:15 AM',{hue:4})}
  ${msgRow('Riya Kapoor',"I'll post the shared retry checklist here after tomorrow's reconciliation review. Production changes still go through each project milestone.",'8:16 AM',{hue:2})}
  <div class="msg-day"><span>Today</span></div>
  ${msgRow('Ananya Iyer','Ack — holding production pushes until the checklist lands. Any objection to scheduling the replay UI patch Thursday?','9:12 AM',{me:true})}
  ${msgRow('Riya Kapoor','None from ops. Thursday 10:00 IST works; I will pin the window.','9:20 AM',{hue:2})}
</div>
${composer('Message #payments-ops…')}
</div>
<div class="panel mt-4"><div class="panel-row" style="gap:12px">${icon('paperclip',15)}<span class="text-sm font-semibold">retry-checklist-v3.pdf</span><span class="text-xs dim">212 KB · shared by Riya Kapoor · 8:16 AM</span><a class="link text-xs ml-auto" href="#">Download</a></div></div>`,
  },
  {
    path: 'apps/web/messages/[conversationId]/', app: 'web', title: 'Riya Kapoor · Direct conversation', crumb: 'Conversation',
    body: (r) => `
${backlink(r, 'apps/web/messages/inbox/', 'Back to inbox')}
<div class="chat-grid pane3" style="margin-top:4px">
  ${folderCol(r, 'Inbox')}
  ${listCol(CONVOS.map((c, i) => ({ ...c, active: i === 1 })))}
  ${threadPane({ title: 'Riya Kapoor', kind: 'DIRECT', online: true, rows: [
    msgRow('Riya Kapoor','Thanks. Our finance team confirmed the duplicate NEFT on their end too. Replay UI remains the priority for month-end.','5 days ago',{hue:2}),
    msgRow('Ananya Iyer','Confirming the reversal shows in the October settlement file?','9:40 AM',{me:true}),
    msgRow('Riya Kapoor','It does — line 18 in tonight&#39;s regenerated slip. Flag it if anything looks off.','9:44 AM',{hue:2}),
  ]})}
</div>`,
  },
  {
    path: 'apps/web/messages/new/', app: 'web', title: 'New message · Nestlancer', crumb: 'New message',
    body: (r) => `
${backlink(r, 'apps/web/messages/', 'Messages')}
${phead({ eyebrow: 'COMPOSE', title: 'New message', sub: 'Start a scoped conversation — the studio routes it to the right pod member.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  ${panel({ title: 'Compose', body: `
    ${field('To', '<select class="select"><option>Studio support (default routing)</option><option>Riya Kapoor — Operations lead</option><option>Arjun — Delivery lead · NL-204</option><option>Finance desk</option></select>')}
    <div class="mt-4">${field('Related work', '<select class="select"><option>None</option><option selected>NL-204 — Corporate LMS</option><option>Quote #01a10f80</option><option>Payment ₹19,200 checkout</option></select>', { req: false })}</div>
    <div class="mt-4">${field('Subject', input({ ph: 'e.g., SSO metadata for Okta — next step?' }))}</div>
    <div class="mt-4">${field('Message', textarea('Write the full context here — files and screenshots welcome via the clip icon.', '', 7))}</div>
    <div class="flex items-center gap-3 mt-4">
      <a class="btn btn-primary" href="${LT(r,'apps/web/messages/thread/[threadId]/')}">${icon('send',14)} Send message</a>
      <button class="btn btn-ghost btn-sm">Save draft</button>
      <span class="text-xs dim ml-auto">Typical first reply: under 2 hours on workdays</span>
    </div>` })}
  <div class="flex-col gap-5">
    ${panel({ title: 'Fastest routes', body: `<div class="flex-col gap-2">
      ${[['Billing question','Finance desk reads these first','card'],['Delivery blocker','Ping your delivery lead directly','zap'],['New scope idea','Submit a request instead — quotes live there','send']].map(([t,d,i])=>`
      <div class="flex items-center gap-3 p-3" style="background:var(--bg-hover);border:1px solid var(--line);border-radius:8px"><span class="avatar sq" style="width:30px;height:30px;background:var(--brand-2);color:var(--brand-11)">${icon(i,13)}</span><div><b style="font-size:12.8px">${t}</b><div class="text-xs dim">${d}</div></div></div>`).join('')}
    </div>` })}
    <a class="btn btn-secondary" href="${LT(r,'apps/web/messages/new/direct/')}">${icon('message',14)} Start a direct message instead</a>
  </div>
</div>`,
  },
  {
    path: 'apps/web/messages/new/direct/', app: 'web', title: 'New direct message · Nestlancer', crumb: 'New direct',
    body: (r) => `
${backlink(r, 'apps/web/messages/', 'Messages')}
${phead({ eyebrow: 'DIRECT MESSAGE', title: 'New direct message', sub: 'Chat one-to-one with a studio member or a workspace user.' })}
${panel({ title: 'Pick a person', body: `
  <div class="input-wrap mb-4"><span class="in-icon">${icon('search',14)}</span><input class="input" placeholder="Search people…"></div>
  <div class="grid gap-3" style="grid-template-columns:1fr 1fr">
    ${[['Riya Kapoor','Operations lead · Studio','Online now',2,'apps/web/messages/[conversationId]/'],
       ['Arjun Nair','Delivery lead · NL-204','Replies under 2h',4,'apps/web/messages/[conversationId]/'],
       ['Sunita Rao','Finance desk','Workdays 10–18 IST',3,'apps/web/messages/[conversationId]/'],
       ['Dev Malhotra','Engineering · SSO &amp; integrations','Currently in review',1,'apps/web/messages/[conversationId]/']].map(([n,d,o,h,href])=>`
    <a class="panel-row" href="${LT(r,href)}" style="border:1px solid var(--line);border-radius:10px;padding:12px 14px">
      <span class="avatar hue-${h} lg">${n.split(' ').map(w=>w[0]).join('')}</span>
      <div class="min-w-0 flex-1"><b style="font-size:13.5px">${n}</b><div class="text-xs dim">${d}</div><div class="text-xs mt-1" style="color:var(--t-success-tx)"><i class="dot" style="background:var(--t-success-dot)"></i> ${o}</div></div>
      ${icon('chevron-right',14)}
    </a>`).join('')}
  </div>` })}
${note('info','shield','Direct messages are still workspace records — operators can audit them for abuse reports.')}`,
  },
  {
    path: 'apps/web/messages/archived/', app: 'web', title: 'Archived conversations · Nestlancer', crumb: 'Archived',
    body: (r) => `
${backlink(r, 'apps/web/messages/', 'Messages')}
${phead({ eyebrow: 'ARCHIVE', title: 'Archived conversations', sub: 'Out of the inbox, never deleted. Unarchive any thread to resume it.' })}
<div class="panel">
  ${[['Vendor onboarding — Q1','Resolved Feb 2026','12 messages'],['Domain migration consult','Resolved Jan 2026','8 messages'],['Kickoff — Analytics Dashboard Q2','Closed Jul 2026','31 messages']].map(([t,m,c])=>`
  <div class="panel-row"><span class="avatar sq" style="width:32px;height:32px;background:var(--bg-subtle);color:var(--ink-3)">${icon('archive',14)}</span>
  <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs dim mt-1">${m} · ${c}</div></div>
  ${badge('Archived','muted')}<button class="btn btn-ghost btn-sm">Unarchive</button></div>`).join('')}
</div>
${pager('Showing 1–3 of 3')}`,
  },

  // ================================================================ PAYMENTS
  {
    path: 'apps/web/payments/', app: 'web', title: 'Billing · Nestlancer', crumb: 'Billing',
    body: (r) => `
${phead({ eyebrow: 'BILLING', title: 'Payments', sub: 'Milestone invoices, their rails, and where your money sits right now.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/web/payments/methods/')}">${icon('card',14)} Payment methods</a><a class="btn btn-primary" href="${LT(r,'apps/web/payments/[id]/')}">Pay due amount</a>` })}
${stats([
  { label: 'Due now', value: '₹19,200.00', note: 'Mid-project · NL-204 checkout', icon: 'clock' },
  { label: 'Collected', value: '₹14,400.00', note: 'Deposit · Oct 5, 2026', icon: 'check-circle' },
  { label: 'Scheduled', value: '₹20,880.00', note: 'Final · on approval', icon: 'calendar' },
  { label: 'Methods on file', value: '2', note: 'Card + UPI', icon: 'card' },
], 4)}
<div class="mt-5">${tabs([
  { l: 'Payments', count: 3, href: LT(r,'apps/web/payments/'), active: true },
  { l: 'Invoices', count: 4, href: LT(r,'apps/web/payments/invoices/') },
  { l: 'Methods', count: 2, href: LT(r,'apps/web/payments/methods/') },
])}</div>
${filterbar(`${searchInput('Search payments…', 240)}${sel(['All statuses','Pending','Processing','Completed','Refunded','Not due yet'])}`)}
<div class="panel">
${table({ cols: [{l:'Payment'},{l:'Project'},{l:'Milestone'},{l:'Amount',r:1},{l:'Due'},{l:'Status'},{l:''}], rows: [
  [`<b class="mono" style="font-size:12px">01a10a2c-2d0e…42197</b>`,'Razorpay Settlement Reconciliation Engine','Mid-project payment','<span class="mono font-semibold">₹19,200.00</span>','<span class="text-xs">Oct 14, 2026</span>',badge('Pending','warning'),`<a class="btn btn-primary btn-xs" href="${LT(r,'apps/web/payments/[id]/')}">Checkout</a>`],
  [`<b class="mono" style="font-size:12px">01a10a2c-73fa…91c1c2</b>`,'Razorpay Settlement Reconciliation Engine','Deposit','<span class="mono font-semibold">₹14,400.00</span>','<span class="text-xs">Paid Oct 5</span>',badge('Completed','success'),`<a class="btn btn-ghost btn-xs" href="${LT(r,'apps/web/payments/[id]/')}">View</a>`],
  [`<b class="mono" style="font-size:12px">01a10a2c-b5a4…610a5</b>`,'Razorpay Settlement Reconciliation Engine','Final payment','<span class="mono font-semibold">₹20,880.00</span>','<span class="text-xs">On approval</span>',badge('Not due yet','neutral'),`<a class="btn btn-ghost btn-xs" href="${LT(r,'apps/web/payments/[id]/')}">View</a>`],
]})}
</div>
${pager('Showing 1–3 of 3')}
<div class="mt-5">${note('info','info','Offline transfers: after a NEFT/UPI bank transfer, post the <b>UTR reference</b> on the payment page — verification usually closes within 4 business hours.')}</div>`,
  },

  // ---- Payment detail — two verified states (original screenshots 001 + 002, Priya Nair, LMS project)
  ...[
    { path: 'apps/web/payments/01a10a2c-5d1c-73fa-8a13-ae6621f9c1c2/', state: 'paid' },
    { path: 'apps/web/payments/01a10a2c-5d1c-73fa-8a13-b5a4b5e610a5/', state: 'notdue' },
    // generic [id] target used by 'Pay now' links until the pending-payment screenshots are verified
    { path: 'apps/web/payments/[id]/', state: 'paid' },
  ].map(({ path, state }) => ({
    path, app: 'web', title: 'Payment details · Nestlancer', crumb: 'Payment details',
    body: (r) => payDetail(r, state),
  })),

  {
    path: 'apps/web/payments/methods/', app: 'web', title: 'Payment methods · Nestlancer', crumb: 'Payment methods',
    body: (r) => `
${backlink(r, 'apps/web/payments/', 'Back to payments')}
${phead({ eyebrow: 'BILLING', title: 'Payment methods', sub: 'Cards, UPI handles, and bank accounts used for milestone payments and refunds.' })}
<div class="grid gap-5" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Saved methods', actions: `<button class="btn btn-primary btn-sm">${icon('plus',13)} Add method</button>`, pad: false, body: `
      <div class="panel-row"><span class="avatar sq" style="width:38px;height:38px;background:#EDEBFF;color:#46399B">${icon('card',16)}</span>
        <div class="min-w-0 flex-1"><b style="font-size:13.5px">HDFC Bank Visa ···· 4492</b><div class="text-xs dim mt-1">Expires 08/29 · Ananya Iyer</div></div>
        ${badge('Default','success')}<button class="btn-icon btn sm">${icon('dots',14)}</button></div>
      <div class="panel-row"><span class="avatar sq" style="width:38px;height:38px;background:var(--brand-2);color:var(--brand-11)">${icon('zap',16)}</span>
        <div class="min-w-0 flex-1"><b style="font-size:13.5px">ananya@okicici</b><div class="text-xs dim mt-1">UPI · verified Sep 2026 · collect requests enabled</div></div>
        ${badge('UPI','info')}<button class="btn-icon btn sm">${icon('dots',14)}</button></div>` })}
    ${panel({ title: 'Bank accounts for transfer &amp; refunds', pad: false, body: `
      <div class="panel-row"><span class="avatar sq" style="width:38px;height:38px;background:var(--bg-subtle);color:var(--ink-2)">${icon('bank',16)}</span>
      <div class="min-w-0 flex-1"><b style="font-size:13.5px">ICICI Bank current ···· 7712</b><div class="text-xs dim mono mt-1">ICIC0000442 · Nair Learning Systems Pvt Ltd</div></div>
      ${badge('Verified','success')}</div>` })}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Add a card', sub: 'Tokenized by Razorpay — numbers never touch Nestlancer servers.', body: `
      ${field('Card number', input({ ph: '4111 1111 1111 1111', cls: 'mono' }))}
      <div class="grid g2 gap-4 mt-4">
        ${field('Expiry', input({ ph: 'MM / YY' }))}
        ${field('Name on card', input({ ph: 'ANANYA IYER' }))}
      </div>
      <div class="check mt-4 mb-4"><input type="checkbox" checked> <span>Set as default for milestone checkouts</span></div>
      <button class="btn btn-primary w-full">${icon('lock',14)} Save card securely</button>` })}
    ${note('info','shield-check','Refunds always return to the <b>original rail</b>. Bank accounts here are only needed for manual NEFT refunds.')}
  </div>
</div>`,
  },

  {
    path: 'apps/web/payments/invoices/', app: 'web', title: 'Invoices · Billing · Nestlancer', crumb: 'Invoices',
    body: (r) => `
${backlink(r, 'apps/web/payments/', 'Back to payments')}
${phead({ eyebrow: 'BILLING', title: 'Invoices', sub: 'GST invoices generated for every capture. Download PDFs or forward to accounts payable.' })}
${filterbar(`${searchInput('Search invoices…', 240)}${sel(['All','Issued','Paid','Overdue','Refunded'])}`)}
<div class="panel">
${table({ cols: [{l:'Invoice'},{l:'Payment'},{l:'Issued'},{l:'Amount',r:1},{l:'GST',r:1},{l:'Status'},{l:''}], rows: [
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/payments/invoice/[id]/')}">NL-INV-2026-000008</a>`,'Deposit · Reconciliation Engine','Oct 5, 2026','<span class="mono font-semibold">₹14,400.00</span>','<span class="mono dim">₹2,196.61</span>',badge('Paid','success'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/payments/invoice/[id]/')}">NL-INV-2026-000009</a>`,'Mid-project · Reconciliation Engine','Oct 8, 2026','<span class="mono font-semibold">₹19,200.00</span>','<span class="mono dim">₹2,928.81</span>',badge('Issued','info'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/payments/invoice/[id]/')}">NL-INV-2026-000006</a>`,'Festive Campaign — final','Sep 12, 2026','<span class="mono font-semibold">₹6,000.00</span>','<span class="mono dim">₹915.25</span>',badge('Paid','success'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/payments/invoice/[id]/')}">NL-INV-2026-000007</a>`,'Credit note · duplicate NEFT','Oct 3, 2026','<span class="mono font-semibold">−₹500.00</span>','<span class="mono dim">—</span>',badge('Refunded','muted'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
]})}
</div>
${pager('Showing 1–4 of 4')}`,
  },

  {
    path: 'apps/web/payments/invoice/[id]/', alias: 'apps/web/payments/invoice/NL-INV-2026-000008/', app: 'web', title: 'Invoice NL-INV-2026-000008 · Nestlancer', crumb: 'Invoice',
    body: (r) => `
${backlink(r, 'apps/web/payments/invoices/', 'Back to invoices')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><h1 class="ptitle" style="font-size:22px">Invoice NL-INV-2026-000008</h1><p class="psub">GST tax invoice · issued Oct 5, 2026 · SAC 998314</p></div>
  <div class="flex gap-2">${badge('Paid','success')}<button class="btn btn-primary btn-sm">${icon('download',13)} Download PDF</button></div>
</div>
<div class="panel" style="max-width:760px">
  <div class="panel-body" style="padding:28px 32px">
    <div class="flex justify-between mb-6">
      <div><b class="h3">Nestlancer Studio Pvt. Ltd.</b><div class="text-xs dim mt-1" style="line-height:1.6">HITEC City, Hyderabad 500081, Telangana, IN<br>GSTIN 36AAKCN9012E1Z5 · CIN U72900TG2019PTC134822<br>billing@nestlancer.com</div></div>
      <div class="text-right"><div class="eyebrow">TAX INVOICE</div><div class="mono font-bold mt-1">NL-INV-2026-000008</div><div class="text-xs dim mt-1">Oct 5, 2026, 3:49 AM IST</div></div>
    </div>
    <div class="panel mb-5" style="padding:12px 16px;background:var(--bg-hover)">
      <span class="text-xs uppercase dim" style="letter-spacing:.08em">Billed to</span>
      <div class="font-semibold mt-1" style="font-size:13.5px">Ananya Iyer — Iyer FinTech Solutions</div>
      <div class="text-xs dim">ananya.iyer@nestlancer.com · Chennai, TN · GSTIN not registered</div>
    </div>
    ${table({ cols: [{l:'Description'},{l:'SAC'},{l:'Qty',r:1},{l:'Rate',r:1},{l:'Amount',r:1}], rows: [
      ['Deposit — Razorpay Settlement Reconciliation Engine (NL-204)','998314','<span class="mono">1</span>','<span class="mono">₹12,203.39</span>','<span class="mono">₹12,203.39</span>'],
      ['<span class="dim">CGST @ 9%</span>','','','','<span class="mono">₹1,098.31</span>'],
      ['<span class="dim">SGST @ 9%</span>','','','','<span class="mono">₹1,098.31</span>'],
      ['<b>Total (INR)</b>','','','','<span class="mono font-bold" style="font-size:16px">₹14,400.00</span>'],
    ]})}
    <div class="text-xs dim mt-4" style="line-height:1.7">Payment received Oct 5, 2026 via manual bank transfer (UTR HDFCR520261005842173). Verify authenticity at <b>nestlancer.com/verify-document</b> with reference <span class="mono">NL-INV-2026-000008</span>.</div>
  </div>
</div>`,
  },

  // ================================================================ INVOICES (top-level)
  {
    path: 'apps/web/invoices/', app: 'web', title: 'Invoices · Nestlancer', crumb: 'Invoices',
    body: (r) => `
${phead({ eyebrow: 'FINANCE', title: 'Invoices', sub: 'Every GST invoice, credit note, and receipt across all your projects.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/web/payments/methods/')}">${icon('card',14)} Methods</a><a class="btn btn-primary" href="${LT(r,'apps/web/payments/[id]/')}">${icon('download',14)} Export for AP</a>` })}
${stats([
  { label: 'This FY billed', value: '₹39,600', note: 'Apr – Oct 2026', icon: 'receipt' },
  { label: 'Outstanding', value: '₹19,200', note: '1 invoice issued', icon: 'clock' },
  { label: 'Credit notes', value: '₹500', note: 'Duplicate NEFT reversal', icon: 'refresh' },
], 3)}
<div class="panel mt-5">
${table({ cols: [{l:'Invoice'},{l:'Project / payment'},{l:'Issued'},{l:'Amount',r:1},{l:'Status'},{l:''}], rows: [
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/invoices/[id]/')}">NL-INV-2026-000008</a>`,'Deposit · Reconciliation Engine','Oct 5, 2026','<span class="mono font-semibold">₹14,400.00</span>',badge('Paid','success'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/invoices/[id]/')}">NL-INV-2026-000009</a>`,'Mid-project · Reconciliation Engine','Oct 8, 2026','<span class="mono font-semibold">₹19,200.00</span>',badge('Issued','info'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/invoices/[id]/')}">NL-INV-2026-000006</a>`,'Festive Campaign — final','Sep 12, 2026','<span class="mono font-semibold">₹6,000.00</span>',badge('Paid','success'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
  [`<a class="link mono" style="font-size:12px" href="${LT(r,'apps/web/invoices/[id]/')}">NL-CN-2026-000003</a>`,'Credit note · duplicate NEFT','Oct 3, 2026','<span class="mono font-semibold">−₹500.00</span>',badge('Refunded','muted'),`<button class="btn btn-ghost btn-xs">${icon('download',12)} PDF</button>`],
]})}
</div>
${pager('Showing 1–4 of 4')}`,
  },
  {
    path: 'apps/web/invoices/[id]/', alias: 'apps/web/invoices/NL-INV-2026-000009/', app: 'web', title: 'Invoice NL-INV-2026-000009 · Nestlancer', crumb: 'Invoice detail',
    body: (r) => `
${backlink(r, 'apps/web/invoices/', 'Back to invoices')}
<div class="flex items-start justify-between flex-wrap gap-3 mb-4">
  <div><h1 class="ptitle" style="font-size:22px">Invoice NL-INV-2026-000009</h1><p class="psub">GST tax invoice · issued Oct 8, 2026 · due Oct 14, 2026</p></div>
  <div class="flex gap-2">${badge('Issued','info')}<a class="btn btn-primary btn-sm" href="${LT(r,'apps/web/payments/[id]/')}">${icon('card',13)} Pay now</a><button class="btn btn-secondary btn-sm">${icon('download',13)} PDF</button></div>
</div>
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="panel"><div class="panel-body" style="padding:26px 30px">
    <div class="flex justify-between mb-5">
      <div><b class="h3">Nestlancer Studio Pvt. Ltd.</b><div class="text-xs dim mt-1" style="line-height:1.6">GSTIN 36AAKCN9012E1Z5 · Hyderabad, IN</div></div>
      <div class="text-right"><div class="eyebrow">TAX INVOICE</div><div class="mono font-bold mt-1">NL-INV-2026-000009</div></div>
    </div>
    ${table({ cols: [{l:'Description'},{l:'Qty',r:1},{l:'Amount',r:1}], rows: [
      ['Mid-project payment — Razorpay Settlement Reconciliation Engine','<span class="mono">1</span>','<span class="mono">₹16,271.19</span>'],
      ['<span class="dim">CGST @ 9%</span>','','<span class="mono">₹1,464.41</span>'],
      ['<span class="dim">SGST @ 9%</span>','','<span class="mono">₹1,464.41</span>'],
      ['<b>Total (INR)</b>','','<span class="mono font-bold" style="font-size:16px">₹19,200.00</span>'],
    ]})}
    <div class="text-xs dim mt-4">Terms: pay against milestone NL-204-M2 via portal checkout (Razorpay) or bank transfer with UTR reference.</div>
  </div></div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Payment state', body: kv([['Status',badge('Awaiting payment','warning')],['Due','<b class="mono">Oct 14, 2026</b>'],['Rails','Razorpay · NEFT / UPI'],['Late policy','Work pauses after day 5']])})}
    ${note('info','info','Paying by bank transfer? Post the UTR on the <a class="link" href="'+LT(r,'apps/web/payments/[id]/')+'">checkout page</a> so reconciliation can verify it.')}
  </div>
</div>`,
  },

  // ================================================================ NOTIFICATIONS
  {
    path: 'apps/web/notifications/', app: 'web', title: 'Notifications · Nestlancer', crumb: 'Notifications',
    body: (r) => `
${phead({ title: 'Notifications', sub: 'Stay updated on your projects and account.',
  actions: `<button class="btn btn-ghost btn-sm">Mark all read</button><button class="btn btn-secondary btn-sm">Clear read</button>` })}
${tabs([
  { l: 'All', active: true }, { l: 'Unread', count: 37 }, { l: 'Quotes' }, { l: 'Payments' },
  { l: 'Messages' }, { l: 'Projects' }, { l: 'Requests' }, { l: 'Account' }, { l: 'Settings' },
])}
<div class="eyebrow mb-2">THIS WEEK</div>
<div class="panel">
  ${[['download','Your data export is ready','Your requested data export is ready to download.','neu',1],
     ['receipt','Payment receipt','Your Payment receipt for Festive Season Campaign Landing Pages (₹6,000.00) is ready to download.','info',1],
     ['file-text','Invoice','Your invoice for Festive Season Campaign Landing Pages (₹6,000.00) is ready to download.','info',1],
     ['file-check','Contract PDF','Your Contract PDF for Festive Season Campaign Landing Pages (₹12,000.00) is ready to download.','info',1],
     ['message','New message in Agency partner coordination — festive campaigns','Riya Kapoor sent a message: "Great — I&#39;ll schedule a joint review of Razorpay UPI checkout patterns that worked across both proj…','warn',2],
     ['user','You were mentioned','Riya Kapoor mentioned you in Agency partner coordination: "Welcome both — this group is for coordinating cross-client festive campaign learnings. @Samira @Pri…','warn',2],
     ['refresh','Project status updated','Festive Season Campaign Landing Pages status changed to Review (₹12,000.00).','info',1],
     ['refresh','Payment refunded','A refund of ₹500.00 has been issued for your payment.','ok',0],
     ['check-circle','₹6,000.00 recorded for Festive Season Campaign Landing Pages','An offline payment of ₹6,000.00 for Festive Season Campaign Landing Pages was recorded on your account.','ok',0],
     ['zap','New deliverable ready','A new deliverable on Festive Season Campaign Landing Pages is ready for review: Final designs and production URLs for all three festive campaigns.','info',0],
     ['flag','Payment requested','Please pay final payment (₹6,000.00) to continue your project.','warn',0],
     ['check-circle','Milestone completed','Milestone of Festive Season Campaign Landing Pages has been completed.','ok',0]]
    .map(([i,t,s,k,unread])=>`
  <div class="panel-row" style="align-items:flex-start;${unread?'':''}">
    <span class="avatar sq shrink-0" style="width:32px;height:32px;background:${k==='warn'?'var(--t-muted-bg)':k==='ok'?'var(--t-success-bg)':'var(--brand-2)'};color:${k==='warn'?'var(--t-muted-tx)':k==='ok'?'var(--t-success-tx)':'var(--brand-11)'}">${icon(i,14)}</span>
    <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs muted mt-1" style="line-height:1.5">${s}</div></div>
    <span class="text-xs dim shrink-0">5 days ago</span>
    <span class="text-xs ${unread?'brand-text font-semibold':'dim'} shrink-0">${unread?'●':''} ${icon('check',12)}</span>
  </div>`).join('')}
</div>
${pager('Showing 1–12 of 32', '1/3')}`,
  },

  // ================================================================ PROFILE
  {
    path: 'apps/web/profile/', app: 'web', title: 'Profile · Nestlancer', crumb: 'Profile',
    body: (r) => `
${phead({ eyebrow: 'ACCOUNT', title: 'Profile', sub: 'How the studio and other workspace members see you.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/web/profile/edit/')}">${icon('edit',14)} Edit profile</a>` })}
<div class="grid gap-5" style="grid-template-columns:5fr 7fr;align-items:start">
  <div class="panel">
    <div class="panel-body text-center" style="padding:28px">
      <span class="avatar hue-1 xl mx-auto">AI</span>
      <h2 class="h3 mt-3">Ananya Iyer</h2>
      <div class="text-sm muted">Founder — Iyer FinTech Solutions</div>
      <div class="flex gap-2 justify-center mt-3">${badge('Client','info')}${badge('Verified email','success')}</div>
      <div class="divider my-4"></div>
      ${kv([['Email','ananya.iyer@…com'],['Phone','+91 98•• ••1204'],['Location','Chennai, IN'],['Timezone','IST (UTC+5:30)'],['Member since','Jun 2025']])}
    </div>
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Public profile preview', sub: 'Visible to studio members on your projects — never on the public internet.', body: `
      <div class="panel" style="padding:16px;background:var(--bg-hover)">
        <div class="flex items-center gap-3 mb-3"><span class="avatar hue-1 lg">AI</span><div><b style="font-size:14px">Ananya Iyer</b><div class="text-xs dim">Founder — Iyer FinTech Solutions · Chennai, IN</div></div></div>
        <p class="text-sm muted" style="line-height:1.65">Fintech founder building settlement tooling for co-op banks. TFino Fridays host, incorrigible filter-coffee person.</p>
        <div class="flex gap-2 mt-3">${['Fintech','Settlement','NestJS','Founder'].map(x=>`<span class="chip" style="height:22px;font-size:11px">${x}</span>`).join('')}</div>
      </div>` })}
    ${panel({ title: 'Account completeness', body: `
      <div class="flex items-center justify-between text-xs mb-2"><b>85% complete</b><span class="dim">Add a phone number for ops calls</span></div>
      ${progress(85,'grad')}` })}
    ${panel({ title: 'Workspace identity', body: kv([
      ['User ID','<span class="mono" style="font-size:11px">8b3f1c02-77e4-4a1d…</span>'],
      ['Auth method','Email + password · TOTP ready'],
      ['Sessions','<a class="link" href="'+LT(r,'apps/web/settings/sessions/')+'">3 active devices</a>'],
    ])})}
  </div>
</div>`,
  },
  {
    path: 'apps/web/profile/edit/', app: 'web', title: 'Edit profile · Nestlancer', crumb: 'Edit profile',
    body: (r) => `
${backlink(r, 'apps/web/profile/', 'Back to profile')}
${phead({ eyebrow: 'ACCOUNT', title: 'Edit profile', sub: 'Names and company appear on quotes, invoices, and messages — keep them formal.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  ${panel({ title: 'Identity', body: `
    <div class="flex items-center gap-4 mb-5">
      <span class="avatar hue-1 xl">AI</span>
      <div><button class="btn btn-secondary btn-sm">${icon('upload',13)} Upload photo</button><div class="text-xs dim mt-2">PNG/JPG up to 2 MB · shown at 56px</div></div>
    </div>
    <div class="grid g2 gap-4">
      ${field('First name', input({ val: 'Ananya' }))}
      ${field('Last name', input({ val: 'Iyer' }))}
    </div>
    <div class="grid g2 gap-4 mt-4">
      ${field('Email', input({ val: 'ananya.iyer@nestlancer.com' }), { hint: 'Changing email re-triggers verification.' })}
      ${field('Phone', input({ val: '+91 98410 51204' }), { req: false })}
    </div>
    <div class="grid g2 gap-4 mt-4">
      ${field('Company', input({ val: 'Iyer FinTech Solutions' }))}
      ${field('Role / title', input({ val: 'Founder' }), { req: false })}
    </div>
    <div class="mt-4">${field('Timezone', '<select class="select"><option selected>IST — India Standard Time (UTC+5:30)</option><option>GMT — London</option><option>EST — New York</option><option>SGT — Singapore</option></select>')}</div>
    <div class="mt-4">${field('Bio', textarea('Shown to studio members on shared threads.', 'Fintech founder building settlement tooling for co-op banks. TFino Fridays host, incorrigible filter-coffee person.', 3), { req: false })}</div>` })}
  <div class="flex-col gap-5">
    ${panel({ title: 'Presence', body: `
      ${switchRow('Show "online" presence','Workspace members see when you are active', true)}
      ${switchRow('Read receipts','Send read marks on direct messages')}
    ` })}
    ${note('info','info','Legal documents (quotes, invoices) use your <b>registered name and company</b> at issue time — editing later does not rewrite signed documents.')}
  </div>
</div>
${saveBar}`,
  },

  // ================================================================ SETTINGS
  {
    path: 'apps/web/settings/', app: 'web', title: 'Settings · Nestlancer', crumb: 'Settings',
    body: (r) => `
${settingsHead('Settings', 'Manage account preferences, security, notifications, files, and activity.')}
<div class="grid g3 gap-5">
  ${[['shield','Security','Password, 2FA, recovery codes','2FA not enabled','warning','apps/web/settings/security/'],
     ['laptop','Sessions','3 active devices, revoke any','1 new this week','info','apps/web/settings/sessions/'],
     ['bell','Notifications','Channels per category','37 unread now','neutral','apps/web/settings/notifications/'],
     ['card','Billing','Default method, GST details','Visa ···· 4492 default','neutral','apps/web/settings/billing/'],
     ['hardDrive','Files','Storage quota and retention','2.1 GB of 5 GB used','neutral','apps/web/settings/files/'],
     ['activity','Activity','Sign-ins and account events','Export available','neutral','apps/web/settings/activity/'],
     ['user','Account','Privacy, data export, deletion','','neutral','apps/web/settings/account/']]
    .map(([i,t,d,s,tn,h])=>`
  <a class="panel panel-pad" href="${LT(r,h)}" style="display:block">
    <div class="flex items-center justify-between mb-3"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i,16)}</span>${s?badge(s,tn):''}</div>
    <b class="h3" style="font-size:15px">${t}</b><div class="text-sm muted mt-1">${d}</div>
    <div class="link text-sm mt-3 inline-flex items-center gap-1">Open ${icon('arrow-right',13)}</div>
  </a>`).join('')}
</div>`,
  },
  {
    path: 'apps/web/settings/account/', app: 'web', title: 'Account settings · Nestlancer', crumb: 'Account',
    body: (r) => `
${settingsHead()}
<div class="text-sm muted mb-5" style="max-width:76ch">Privacy, data export, and account deletion. Delivery channels live under <a class="link" href="${LT(r,'apps/web/settings/notifications/')}">Notification settings</a>. Update your public identity from <a class="link" href="${LT(r,'apps/web/profile/')}">Profile</a>.</div>
${settingsTabs(r, 'account')}
<div class="flex-col gap-5" style="max-width:820px">
  ${panel({ title: 'Privacy ' + icon('help-circle',13), sub: 'Control who can see your profile and contact details.', body: `
    <div class="field mb-2" style="max-width:420px"><label class="label font-semibold">Profile visibility</label><select class="select"><option selected>Public</option><option>Workspace only</option><option>Hidden</option></select></div>
    ${switchRow('Show email on profile','')}
    ${switchRow('Show phone on profile','')}
  ` })}
  <div class="panel" style="border-color:var(--t-danger-bd);background:linear-gradient(180deg,var(--t-danger-bg) 0%,var(--bg-card) 42%)">
    <div class="panel-head" style="border-bottom-color:var(--t-danger-bd)"><div><div class="panel-title" style="color:var(--t-danger-tx)">Danger zone</div><div class="panel-sub">Export your data or permanently delete your account.</div></div></div>
    <div class="panel-body grid gap-6" style="grid-template-columns:1fr 1fr">
      <div><b style="font-size:13.5px">Data export</b><p class="text-xs muted mt-1 mb-3" style="line-height:1.6">Request a copy of your account data. Processing may take a few minutes.</p><button class="btn btn-secondary btn-sm">${icon('download',13)} Request data export</button></div>
      <div><b style="font-size:13.5px">Delete account</b><p class="text-xs muted mt-1 mb-3" style="line-height:1.6">Schedules permanent deletion. You can cancel while it is still pending.</p>
        <div class="field"><label class="label">Password to confirm deletion ${icon('help-circle',12)}</label><input class="input" type="password" placeholder="Enter your password"></div>
        <div class="flex items-center gap-3 mt-3"><button class="btn btn-danger-solid btn-sm" disabled>Delete account</button><a class="link text-xs" href="#">Cancel pending deletion</a></div>
        <div class="text-xs dim mt-2">Enter your password above to enable account deletion.</div>
      </div>
    </div>
  </div>
</div>
${saveBar}`,
  },
  {
    path: 'apps/web/settings/security/', app: 'web', title: 'Security settings · Nestlancer', crumb: 'Security',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'security')}
<div class="flex-col gap-5" style="max-width:820px">
  ${panel({ title: 'Password', actions: badge('Good rotation','success'), body: `
    <div class="grid g2 gap-4">
      ${field('Current password', input({ type: 'password', ph: '••••••••••' }))}
      ${field('New password', input({ type: 'password', ph: '12+ characters' }))}
    </div>
    <div class="text-xs dim mt-3">Last changed 74 days ago · 12+ chars, mixed case + number required</div>
    <button class="btn btn-primary btn-sm mt-3">${icon('key',13)} Update password</button>` })}
  ${panel({ title: 'Two-factor authentication', actions: badge('Not enabled','warning'), body: `
    <div class="grid gap-4" style="grid-template-columns:auto 1fr">
      <div style="width:120px;height:120px;border-radius:12px;background:var(--ink-1);display:flex;align-items:center;justify-content:center"><span class="mono" style="color:#7FE8DA;font-size:10px;letter-spacing:.1em">QR · TOTP</span></div>
      <div><b style="font-size:13.5px">Authenticator app (TOTP)</b>
      <p class="text-xs muted mt-1" style="line-height:1.6">Scan with 1Password, Authy, or Google Authenticator. Required for payouts over ₹1L once enabled.</p>
      <button class="btn btn-primary btn-sm mt-3">${icon('shield-check',13)} Enable 2FA</button></div>
    </div>` })}
  ${panel({ title: 'Recovery codes', sub: 'One-time codes for when your phone is lost. Generated when 2FA is enabled.', body: `
    <div class="flex items-center justify-between"><span class="text-xs dim">8 codes remaining (demo)</span><button class="btn btn-secondary btn-sm" disabled>${icon('refresh',12)} Regenerate</button></div>
    <div class="grid g4 gap-2 mt-3">${['3K9F-2LAD','7HQW-9MZX','P4T8-61CN','X2VB-77QJ','A9D3-K2LR','5W8E-1BBF','M6N4-90XZ','C1T7-4HDF'].map(c=>`<code class="mono chip justify-center" style="font-size:11px">${c}</code>`).join('')}</div>` })}
  ${panel({ title: 'Sign-in alerts', body: switchRow('Email me about new sign-ins','Includes device, IP, and approximate location', true)})}
</div>`,
  },
  {
    path: 'apps/web/settings/sessions/', app: 'web', title: 'Sessions · Nestlancer', crumb: 'Sessions',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'sessions')}
<div class="flex-col gap-5">
  ${panel({ title: 'Active sessions', sub: '3 devices currently signed in. Revoking ends the session within seconds.', actions: `<button class="btn btn-danger btn-sm">${icon('log-out',13)} End all other sessions</button>`, pad: false, body: table({ cols: [{l:'Device'},{l:'Location'},{l:'IP address'},{l:'Started'},{l:''}], rows: [
    [`<div class="flex items-center gap-2">${icon('laptop',15)} <b>MacBook Pro — Chrome 141</b></div>`,'<span class="dim">Chennai, IN</span>','<span class="mono">103.216.44.19</span>','<span class="dim">Current session</span>',badge('This device','success')],
    [`<div class="flex items-center gap-2">${icon('smartphone',15)} <b>iPhone 16 — Safari</b></div>`,'<span class="dim">Chennai, IN</span>','<span class="mono">103.216.44.19</span>','<span class="dim">Oct 9, 2026</span>',`<button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Revoke</button>`],
    [`<div class="flex items-center gap-2">${icon('laptop',15)} <b>Office PC — Edge 140</b></div>`,'<span class="dim">Bengaluru, IN</span>','<span class="mono">49.37.201.6</span>','<span class="dim">Oct 2, 2026</span>',`<button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Revoke</button>`],
  ]})})}
  ${note('warn','alert-triangle','See a device you don&#39;t own? End all sessions, change your password, then enable 2FA — in that order.')}
</div>`,
  },
  {
    path: 'apps/web/settings/notifications/', app: 'web', title: 'Notification settings · Nestlancer', crumb: 'Notifications',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'notifications')}
<div class="flex-col gap-5" style="max-width:880px">
  ${panel({ title: 'Channels by category', sub: 'Quiet where you can afford it, loud where money moves.', pad: false, body: table({ cols: [{l:'Category'},{l:'In-app'},{l:'Email'},{l:'SMS'}], rows: [
    ...[['Quotes &amp; signatures',1,1,0],['Payments &amp; invoices',1,1,1],['Messages &amp; mentions',1,1,0],['Project updates',1,0,0],['Requests &amp; reviews',1,1,0],['Account &amp; security',1,1,1],['Product announcements',0,1,0]].map(([c,a,b,cx])=>
      [`<b style="font-size:13px">${c}</b>`,...([a,b,cx].map(v=>`<label class="switch"><input type="checkbox"${v?' checked':''}><i></i></label>`))])
  ]})})}
  ${panel({ title: 'Digest', body: `
    ${field('Daily summary', '<select class="select"><option>Off</option><option selected>7:00 AM IST — workdays</option><option>7:00 AM IST — daily</option></select>', { req: false })}
    <div class="mt-4">${field('Weekly report', '<select class="select"><option selected>Monday 8:00 AM IST</option><option>Friday 6:00 PM IST</option><option>Off</option></select>', { req: false })}</div>` })}
</div>
${saveBar}`,
  },
  {
    path: 'apps/web/settings/billing/', app: 'web', title: 'Billing settings · Nestlancer', crumb: 'Billing',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'billing')}
<div class="grid gap-5" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Defaults', body: `
      ${field('Default payment method', '<select class="select"><option selected>HDFC Bank Visa ···· 4492</option><option>ananya@okicici (UPI)</option><option>Bank transfer (UTR)</option></select>')}
      <div class="mt-4">${field('Invoice delivery cc', input({ val: 'accounts@iyerfintech.in' }), { req: false })}</div>
      <div class="mt-4">${switchRow('Auto-pay issued invoices','Charge default method when an invoice is issued against an approved milestone', false)}</div>` })}
    ${panel({ title: 'Spending guardrails', body: kv([
      ['Single-checkout cap','<span class="mono">₹1,00,000</span>'],
      ['Above cap requires','2FA + email confirm'],
      ['UPI collect requests',badge('Enabled','success')],
    ])})}
  </div>
  ${panel({ title: 'Tax &amp; invoicing identity', sub: 'Printed on every GST invoice issued to your account.', body: `
    ${field('Registered name', input({ val: 'Iyer FinTech Solutions Pvt Ltd' }))}
    <div class="grid g2 gap-4 mt-4">
      ${field('GSTIN', input({ val: 'Not registered', cls: 'mono' }), { req: false })}
      ${field('PAN', input({ val: 'AAJFI7712K', cls: 'mono' }), { req: false })}
    </div>
    <div class="mt-4">${field('Billing address', textarea('Line 1, city, state, PIN', '3rd Floor, 44 Lattice Bridge Road, Adyar, Chennai 600020', 3))}</div>` })}
</div>
${saveBar}`,
  },
  {
    path: 'apps/web/settings/files/', app: 'web', title: 'Files &amp; storage · Nestlancer', crumb: 'Files',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'files')}
<div class="flex-col gap-5">
  ${panel({ title: 'Storage', actions: `<a class="link text-xs" href="#">Manage in project files</a>`, body: `
    <div class="flex items-center justify-between text-sm mb-2"><b>2.1 GB of 5 GB used</b><span class="dim">shared across all projects</span></div>
    ${progress(42,'grad')}
    <div class="grid g4 gap-3 mt-4">
      ${[['Deliverables','812 MB','var(--brand-8)',34],['Briefs &amp; attachments','512 MB','var(--t-info-dot)',21],['Message files','486 MB','var(--t-warning-dot)',20],['Other','318 MB','var(--line-strong)',13]].map(([l,s,c,w])=>`
      <div><div class="prog thin mb-2"><i style="width:${w}%;background:${c}"></i></div><b style="font-size:12px">${l}</b><div class="text-xs dim mono">${s}</div></div>`).join('')}
    </div>` })}
  <div class="grid gap-5" style="grid-template-columns:1fr 1fr;align-items:start">
    ${panel({ title: 'Retention', body: `
      ${switchRow('Keep project files after close','Files remain downloadable while your account is active', true)}
      ${switchRow('Auto-purge trashed files','Delete 30 days after trash', true)}
      ${switchRow('Version old files','Keep prior versions of replaced deliverables')}
    ` })}
    ${panel({ title: 'Upload rules', body: kv([
      ['Max file size','<b class="mono">256 MB</b>'],
      ['Executable types',badge('Blocked','danger')],
      ['Virus scan','ClamAV on every upload'],
      ['Preview formats','PDF · PNG · MP4 · MD'],
    ])})}
  </div>
</div>
${saveBar}`,
  },
  {
    path: 'apps/web/settings/activity/', app: 'web', title: 'Activity log · Nestlancer', crumb: 'Activity',
    body: (r) => `
${settingsHead()}
${settingsTabs(r, 'activity')}
<div class="flex-col gap-5">
  ${filterbar(`${sel(['All categories','Auth','Billing','Content','Settings'],'All categories')}${searchInput('Search events…', 240)}<button class="btn btn-secondary btn-sm ml-auto">${icon('download',13)} Export CSV</button>`)}
  ${panel({ title: 'Account activity', sub: 'Sign-ins, exports, and sensitive changes on your account. Operators can audit these too.', pad: false, body: table({ cols: [{l:'When'},{l:'Event'},{l:'Category'},{l:'Detail'},{l:'IP'}], rows: [
    ['<span class="mono text-xs">Oct 10, 7:42 AM</span>','<b>SIGNED_IN</b>','auth','Chrome · Chennai','<span class="mono text-xs">103.216.44.19</span>'],
    ['<span class="mono text-xs">Oct 9, 6:15 PM</span>','<b>EXPORT_REQUESTED</b>','data','Account data export queued','<span class="mono text-xs">103.216.44.19</span>'],
    ['<span class="mono text-xs">Oct 8, 10:04 AM</span>','<b>PAYMENT_METHOD_ADDED</b>','billing','UPI ananya@okicici verified','<span class="mono text-xs">103.216.52.8</span>'],
    ['<span class="mono text-xs">Oct 7, 9:31 AM</span>','<b>PASSWORD_CHANGED</b>','auth','Password rotation completed','<span class="mono text-xs">49.37.201.6</span>'],
    ['<span class="mono text-xs">Oct 6, 4:20 PM</span>','<b>PROFILE_UPDATED</b>','account','Company title changed','<span class="mono text-xs">103.216.44.19</span>'],
    ['<span class="mono text-xs">Oct 5, 3:47 AM</span>','<b>LOGIN_FAILED</b>','auth','Failed sign-in (wrong password)','<span class="mono text-xs">185.220.101.4</span>'],
  ]})})}
  ${pager('Showing 1–6 of 128', '1/22')}
</div>`,
  },
];
