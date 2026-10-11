// ============================================================================
// ROUTES — apps/admin OPERATOR CONSOLE — part 3
// Content CMS (3) · Portfolio CRUD (3) · Media (7) · Moderation · Analytics ·
// Integrations · API keys · Audit · Profile · System (11)
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, stats, table, tabs, filterbar, searchInput, sel, pager, progress, timeline, kv, field, input, textarea, switchRow, empty, lineChart, barChart, donut, cover } from '../lib/comps.mjs';
import { phead, backlink } from '../lib/chrome.mjs';

// ==================================================================== SYSTEM
const sysGrid = (r, items) => `
<div class="grid g4 gap-4">
${items.map(([i,t,d,state,tn,h])=>`
  <a class="panel panel-pad" href="${LT(r,h)}" style="display:block">
    <div class="flex items-center justify-between mb-3">
      <span class="avatar sq" style="width:34px;height:34px;border-radius:10px;background:${tn==='danger'?'var(--t-danger-bg)':tn==='warning'?'var(--t-warning-bg)':'var(--brand-2)'};color:${tn==='danger'?'var(--t-danger-tx)':tn==='warning'?'var(--t-warning-tx)':'var(--brand-11)'}">${icon(i,15)}</span>
      ${state?badge(state,tn):''}
    </div>
    <b class="h3" style="font-size:14px">${t}</b>
    <div class="text-xs dim mt-1 mb-3">${d}</div>
    <span class="link text-sm inline-flex items-center gap-1">Open ${icon('chevron-right',12)}</span>
  </a>`).join('')}
</div>`;

export default [
  // ================================================================ CONTENT / BLOG CMS
  {
    path: 'apps/admin/content/', app: 'admin', title: 'Content · Admin', crumb: 'Content',
    body: (r) => `
${phead({ eyebrow: 'CMS', title: 'Content', sub: 'Blog CMS for both public sites. Search engines read from here — ship carefully.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/admin/content/blog/new/')}">${icon('plus',14)} New post</a>` })}
${tabs([{ l: 'Blog posts', count: 8, active: true }, { l: 'Categories', count: 5 }, { l: 'Tags', count: 32 }, { l: 'Comments', count: 12 }])}
${filterbar(`${searchInput('Search posts…', 240)}${sel(['All states','Published','Draft','Scheduled','Archived'])}${sel(['All categories','Engineering','Design','Finance','Guides','Lifestyle'])}`)}
<div class="panel">
${table({ cols: [{l:'Post'},{l:'Category'},{l:'Status'},{l:'Views'},{l:'Updated'},{l:''}], rows: [
  ...[['Why Your Business Needs a Custom CRM in 2025','Engineering','Published','<span class="mono">1,420</span>','Oct 12, 2025'],
     ['How Mallimuthu Connects Artisans to Global Markets','Guides','Published','<span class="mono">486</span>','Nov 15, 2025'],
     ['AI-Driven Analytics: Data → Decisions','Engineering','Published','<span class="mono">82</span>','Nov 18, 2025'],
     ['Best Investment Apps for Beginners in India (2025)','Finance','Published','<span class="mono">20</span>','Nov 19, 2025'],
     ['The Rise of Mobile Transaction Approvals','Insights','Published','<span class="mono">0</span>','Feb 15, 2026'],
     ['Productivity Tips for Modern Freelance Teams','Lifestyle','Published','<span class="mono">0</span>','Feb 12, 2026'],
     ['Designing for Trust in Fintech Checkout Flows','Design','Draft','<span class="mono dim">—</span>','Oct 8, 2026'],
     ['Q3 Studio Retrospective: What We Shipped','Culture','Scheduled','<span class="mono dim">—</span>','Oct 14, 2026']]
    .map(([t,c,st,v,u])=>[
      `<b style="font-size:12.8px">${t}</b>`,
      badge(c,'neutral'),
      badge(st, st==='Published'?'success':st==='Draft'?'neutral':'info'),
      v, `<span class="text-xs dim">${u}</span>`,
      `<div class="flex gap-1"><a class="btn btn-ghost btn-xs" href="${LT(r,'apps/admin/content/blog/[id]/')}">Edit</a><a class="btn btn-ghost btn-xs" href="${LT(r,'apps/web/blog/[slug]/')}" target="_blank">View</a></div>`])
]})}
</div>
${pager('Showing 1–8 of 8')}`,
  },

  {
    path: 'apps/admin/content/blog/new/', app: 'admin', title: 'New blog post · Admin', crumb: 'New post',
    body: (r) => `
${backlink(r, 'apps/admin/content/', 'Back to content')}
${phead({ eyebrow: 'CMS', title: 'New blog post', sub: 'Editorial pipeline: draft → review → schedule → publish. Footnotes supported, GIFs discouraged.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ body: `
      ${field('Title', input({ ph: 'Sentence case, no trailing period…' }))}
      <div class="mt-4">${field('Slug', '<div class="input-wrap"><span class="in-icon text-xs dim" style="width:auto;padding:0 10px">/blog/</span><input class="input mono" style="padding-left:64px" placeholder="designing-for-trust"></div>', { req: false, hint: 'Auto-generated from title; must stay unique.' })}</div>
      <div class="mt-4">${field('Excerpt', textarea('Shown in cards, SEO description, and social shares.', '', 2), { req: false })}</div>
      <div class="mt-4">${field('Body (markdown)', textarea('# Heading\n\nWrite here…', '', 14), { req: false })}</div>` })}
    ${note('info','edit','Footnotes: use numbered refs like <span class="mono">[1]</span> — the renderer builds the notes block at the bottom automatically.')}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Publish', body: `
      ${field('Category', '<select class="select"><option>Engineering</option><option>Design</option><option>Finance</option><option>Guides</option><option>Lifestyle</option><option>Insights</option></select>', { req: false })}
      <div class="mt-3">${field('Tags', input({ ph: 'comma, separated, tags' }), { req: false })}</div>
      <div class="mt-3">${field('Author', '<select class="select"><option>Nestlancer Team</option><option>Riya Kapoor</option><option>Arjun Nair</option></select>', { req: false })}</div>
      <div class="mt-3">${field('Schedule', input({ type: 'date' }), { req: false })}</div>
      <div class="mt-4">${switchRow('Allow comments','Moderated — new comments land in the comments queue', true)}</div>
      ${switchRow('Feature on home','One featured slot per site')}
      <div class="flex gap-2 mt-4"><button class="btn btn-primary">${icon('send',14)} Publish</button><button class="btn btn-secondary">Save draft</button></div>` })}
    ${panel({ title: 'SEO check', body: `
      ${[['Title length','ok'],['Meta excerpt','missing'],['Slug unique','ok'],['OG image','missing']].map(([c,s])=>`
      <div class="flex items-center gap-2 py-2" style="border-bottom:1px solid var(--line)"><span style="color:${s==='ok'?'var(--t-success-dot)':'var(--t-warning-dot)'}">${icon(s==='ok'?'check-circle':'alert-triangle',13)}</span><span class="text-xs">${c}</span><span class="text-xs dim ml-auto">${s}</span></div>`).join('')}` })}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/content/blog/[id]/', app: 'admin', alias: 'apps/admin/content/blog/post-custom-crm/', title: 'Edit post · Admin', crumb: 'Edit post',
    body: (r) => `
${backlink(r, 'apps/admin/content/', 'Back to content')}
${phead({ eyebrow: 'CMS', title: 'Edit post', sub: '“Why Your Business Needs a Custom CRM in 2025” — published Oct 12, 2025 · v14',
  actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/blog/[slug]/')}" target="_blank">${icon('eye',13)} View public</a><button class="btn btn-primary btn-sm">Save changes</button>` })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ body: `
      ${field('Title', input({ val: 'Why Your Business Needs a Custom CRM in 2025' }))}
      <div class="mt-4">${field('Slug', input({ val: 'custom-crm-benefits-2025', cls: 'mono' }), { req: false })}</div>
      <div class="mt-4">${field('Excerpt', textarea('', 'Off-the-shelf CRMs drown small teams in features they never use. A custom CRM mirrors your actual workflow…', 3), { req: false })}</div>
      <div class="mt-4">${field('Body (markdown)', textarea('', 'In 2025, the distance between "good enough" software and software that fits is the distance between growth and churn. [1]\n\n## The hidden cost of generic tools…', 12), { req: false })}</div>` })}
    ${panel({ title: 'Footnotes', pad: false, body: `
      <div class="panel-row"><span class="mono text-xs dim" style="width:26px">[1]</span><input class="input sm mono flex-1" value="https://example.com/industry-report-2025"><button class="btn-icon btn sm">${icon('x',12)}</button></div>
      <div class="panel-row"><span class="mono text-xs dim" style="width:26px">[2]</span><input class="input sm mono flex-1" value="https://example.com/sales-benchmarks"><button class="btn-icon btn sm">${icon('x',12)}</button></div>
      <div class="panel-foot"><button class="btn btn-secondary btn-sm">${icon('plus',12)} Add reference</button><span class="text-xs dim ml-auto">Auto-rendered under References</span></div>` })}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'State', body: kv([
      ['Status',badge('Published','success')],['Category',badge('Engineering','neutral')],['Views','<span class="mono">1,420</span>'],['Comments','<span class="mono">3 open · 9 approved</span>'],['Updated','<span class="dim">Oct 12, 2025</span>'],
    ])})}
    ${panel({ title: 'Revision history', pad: false, body: `
      ${[['v14','Oct 12 — publish: title case fix',true],['v13','Oct 11 — add references block',false],['v9','Sep 30 — SEO excerpt rewrite',false]].map(([v,d,cur])=>`
      <div class="panel-row"><span class="mono text-xs font-bold" style="width:34px">${v}</span><span class="text-xs flex-1" style="color:var(--ink-2)">${d}</span>${cur?badge('Live','success'):'<button class="btn btn-ghost btn-xs">Restore</button>'}</div>`).join('')}` })}
    <button class="btn btn-danger w-full">${icon('archive',13)} Unpublish &amp; archive</button>
  </div>
</div>`,
  },

  // ================================================================ PORTFOLIO
  {
    path: 'apps/admin/portfolio/', app: 'admin', title: 'Portfolio · Admin', crumb: 'Portfolio',
    body: (r) => `
${phead({ eyebrow: 'SHOWCASE', title: 'Portfolio', sub: 'Public work shown on nestlancer.com and the marketing site. Featured drives the Home grid.',
  actions: `<a class="btn btn-primary" href="${LT(r,'apps/admin/portfolio/new/')}">${icon('plus',14)} New project</a>` })}
${stats([
  { label: 'Published', value: '6', note: 'Public on both sites', icon: 'eye' },
  { label: 'Featured', value: '3', note: 'Home showcase grid', icon: 'check-circle' },
  { label: 'Drafts', value: '2', note: 'Awaiting media or copy', icon: 'edit' },
], 3)}
<div class="grid g3 gap-5 mt-5">
  ${[['E-Commerce Platform','Published','Featured',24,'var(--grad-a)'],['Laundry Everywhere','Published','',95,'var(--grad-c)'],['Chopsticks MKT','Published','Featured',12,'var(--grad-b)'],['Banking Dashboard','Draft','',0,'var(--grad-d)'],['EdTech Platform','Published','',372,'var(--grad-e)'],['Homely AI Real Estate','Draft','',0,'var(--grad-f)']]
  .map(([t,st,fe,views,g])=>`
  <a class="panel" href="${LT(r,'apps/admin/portfolio/[id]/edit/')}" style="display:block;overflow:hidden;position:relative">
    ${cover('CASE STUDY · ' + t.toUpperCase(), (t.length % 6) + 1, 'padding-top:56%')}
    <span class="badge tone-default" style="position:absolute;top:10px;left:10px;background:var(--bg-card)">${st}</span>
    ${fe?`<span class="badge tone-info" style="position:absolute;top:10px;right:10px">Featured</span>`:''}
    <div class="panel-body">
      <b style="font-size:14px">${t}</b>
      <div class="text-xs dim mt-1 mono">${views} views · Case study ${st === 'Published' ? 'live' : 'hidden'}</div>
    </div>
  </a>`).join('')}
</div>`,
  },

  {
    path: 'apps/admin/portfolio/new/', app: 'admin', title: 'New portfolio project · Admin', crumb: 'New project',
    body: (r) => `
${backlink(r, 'apps/admin/portfolio/', 'Back to portfolio')}
${phead({ eyebrow: 'SHOWCASE', title: 'New portfolio project', sub: 'Publish a case study with cover media, stack badges, and result metrics.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ body: `
      ${field('Title', input({ ph: 'e.g. Fintech Payments Hub' }))}
      <div class="mt-4">${field('Tagline', input({ ph: 'Result-oriented 1-liner for cards' }), { req: false })}</div>
      <div class="mt-4">${field('Case study (markdown)', textarea('Problem → approach → outcome. Write like a journal entry, not an ad.', '', 12), { req: false })}</div>` })}
    ${panel({ title: 'Result metrics', pad: false, body: table({ cols: [{l:'Metric'},{l:'Value'}], compact: true, rows: [
      [`<input class="input sm" value="Checkout conversion">`,'<input class="input sm mono" value="+31%">'],
      [`<input class="input sm" value="Page loads (LCP)">`,'<input class="input sm mono" value="1.1s p75">'],
      [`<input class="input sm" placeholder="New metric…">`,'<input class="input sm mono" placeholder="Value">'],
    ]})})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Cover media', body: `
      <div style="border:2px dashed var(--line-strong);border-radius:12px;padding:26px;text-align:center">
        ${icon('upload',22)}<div class="text-xs muted mt-2">Drop a cover image — 1600×1000 recommended<br><a class="link" href="${LT(r,'apps/admin/media/browse/')}">or pick from media library</a></div>
      </div>` })}
    ${panel({ title: 'Placement', body: `
      ${field('Category', '<select class="select"><option>Fintech</option><option>Commerce</option><option>EdTech</option><option>Marketplace</option></select>', { req: false })}
      <div class="mt-3">${field('Stack badges', input({ ph: 'React, NestJS, PostgreSQL…' }), { req: false })}</div>
      <div class="mt-3">${switchRow('Featured on home','Max 3 live at a time')}</div>
      ${switchRow('Publish immediately','Otherwise saved as draft')}
      <div class="flex gap-2 mt-4"><button class="btn btn-primary">${icon('eye',14)} Publish</button><button class="btn btn-secondary">Save draft</button></div>` })}
  </div>
</div>`,
  },
  {
    path: 'apps/admin/portfolio/[id]/edit/', app: 'admin', alias: 'apps/admin/portfolio/banking-dashboard.edit/', title: 'Edit portfolio item · Admin', crumb: 'Edit project',
    body: (r) => `
${backlink(r, 'apps/admin/portfolio/', 'Back to portfolio')}
${phead({ eyebrow: 'SHOWCASE', title: 'Edit: Banking Dashboard', sub: 'Published Nov 2025 · 142 views · featured on Home',
  actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/portfolio/[id]/')}" target="_blank">${icon('eye',13)} View public</a><button class="btn btn-primary btn-sm">Save changes</button>` })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ body: `
      ${field('Title', input({ val: 'Banking Dashboard' }))}
      <div class="mt-4">${field('Tagline', input({ val: 'Corporate treasury views for a mid-size private bank.' }), { req: false })}</div>
      <div class="mt-4">${field('Case study', textarea('', 'The treasury team approved inter-account sweeps through a tangle of batch files. We put the whole book on one screen…', 10), { req: false })}</div>` })}
    ${panel({ title: 'Result metrics', pad: false, body: table({ cols: [{l:'Metric'},{l:'Value'}], compact: true, rows: [
      ['<input class="input sm" value="Sweep approvals / day">','<input class="input sm mono" value="3.4×">'],
      ['<input class="input sm" value="Recon time">','<input class="input sm mono" value="−72%">'],
    ]})})}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'Cover', body: `
      <div style="position:relative;margin-bottom:10px">
        ${cover('BANKING DASHBOARD · COVER', 4, 'padding-top:52%')}
        <span class="badge tone-default" style="position:absolute;top:10px;left:10px;background:var(--bg-card)">Current cover</span>
      </div>
      <button class="btn btn-secondary btn-sm">${icon('upload',13)} Replace</button>` })}
    ${panel({ title: 'Visibility', body: `
      ${switchRow('Published','', true)}
      ${switchRow('Featured on home','', true)}
      <div class="text-xs dim mt-3">Removing “Featured” frees a home slot instantly — the case study remains live.</div>` })}
    <button class="btn btn-danger w-full">${icon('archive',13)} Unpublish</button>
  </div>
</div>`,
  },

  // ================================================================ MEDIA
  {
    path: 'apps/admin/media/', app: 'admin', title: 'Media center · Admin', crumb: 'Media center',
    body: (r) => `
${phead({ eyebrow: 'ASSETS', title: 'Media center', sub: 'File browser, storage analytics, and quarantine controls for every upload across the platform.',
  actions: `<a class="btn btn-secondary" href="${LT(r,'apps/admin/media/browse/')}">${icon('grid',14)} Browse all</a><a class="btn btn-secondary" href="${LT(r,'apps/admin/media/folders/')}">${icon('folder-plus',14)} New folder</a>` })}
${stats([
  { label: 'Files', value: '80', note: '11.5 MB library', icon: 'file-text' },
  { label: 'Storage used', value: '11.5 MB', note: 'of 5 GB workspace', icon: 'hardDrive' },
  { label: 'Quarantined', value: '1', note: 'Awaiting review — 12d', icon: 'shield-alert' },
  { label: 'Scanned clean', value: '79', note: 'ClamAV on every upload', icon: 'shield-check' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Storage · last 30 days', pad: true, body: lineChart({ seed: 17, h: 240 }) + '<div class="text-xs dim mono mt-2">30 points · latest 0 B</div>' })}
  ${panel({ title: 'By file type', pad: true, body: donut({ parts: [
    { l: 'PDF', v: 28, c: '#4CE0B3', d: '23 files' },
    { l: 'PNG', v: 24, c: '#02CED1', d: '18 files' },
    { l: 'ZIP', v: 12, c: '#3FA9F5', d: '17 files' },
    { l: 'VIDEO', v: 10, c: '#FDEB92', d: '10 files' },
    { l: 'JPG', v: 16, c: '#FF9DDA', d: '12 files' },
  ]}) + '<div class="text-xs dim mono mt-2">Across File &amp; Media · last week</div>' })}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Top files by storage', sub: 'Largest single files', actions: `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/media/browse/')}">Browse all →</a>`, pad: false, body: `
    <div class="flex flex-wrap gap-2" style="padding:14px 18px;border-bottom:1px solid var(--line)">${['All','Documents','Archives','Images','Code','Spreadsheets','Text','Video','Audio','Other'].map((c,i)=>`<span class="chip${i===0?' active':''}" style="font-size:11px">${c}</span>`).join('')}</div>
    ${table({ cols: [{l:'File'},{l:'Kind'},{l:'Uploader'},{l:'Size',r:1},{l:'Views',r:1}], compact: true, rows: [
      ...[['1_GTSiMaCAderv0Xi6AyOtmw.webp','Code','Sandeep Chopra','1.0 MB','6'],['RentFair_Architecture_Diagram (9).png','PNG file','Priya Nair','950.0 KB','3'],['Nestlancer Services Content.png','PNG file','Riya Kapoor','581.3 KB','4'],['ContractTemplatePreview.tsx','Code','Ananya Iyer','309.4 KB','2'],['SEO_ANALYSIS.md','Text file','Arjun Nair','196.4 KB','3']]
      .map(([f,k,u,s,v])=>[`<div class="flex items-center gap-2"><span class="avatar sq" style="width:26px;height:26px;background:var(--bg-subtle);color:var(--ink-3)">${icon('file-text',12)}</span><span class="mono truncate" style="max-width:230px;font-size:11.5px">${f}</span></div>`,`${badge(k,'neutral')}`,`${u}`,`${s}`,`${v}`])
    ]})}` })}
  ${panel({ title: 'Activity · last 7 days', sub: 'Media · last week', pad: false, body: barChart({ data: [8,14,6,10,12,9,15], labels: ['Sat','Mon','Wed','Fri','Sun','Tue','Thu'] }) })}
</div>`,
  },

  {
    path: 'apps/admin/media/browse/', app: 'admin', title: 'Browse · Media · Admin', crumb: 'Browse',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'ASSETS', title: 'Browse', sub: '80 files across 6 folders. Select files to move, delete, or regenerate URLs.' })}
${tabs([{ l: 'Inbox (unfiled)', count: 10, active: true }, { l: 'blog-assets', count: 35 }, { l: 'case-studies', count: 8 }, { l: 'brand', count: 12 }, { l: 'documents', count: 9 }, { l: 'avatars', count: 5 }, { l: 'Trash', count: 1 }])}
${filterbar(`${searchInput('Search by filename, type, tag, or description…', 280)}${sel(['All types','Images','Videos','Documents','Audio','Other'])}${sel(['Sort: Newest','Oldest','Name A–Z','Largest first','Most viewed'])}<a class="btn btn-primary btn-sm ml-auto" href="${LT(r,'apps/admin/media/upload/')}">${icon('upload',13)} Upload</a>`)}</div>
<div class="panel">
${table({ cols: [{l:'File'},{l:'Type'},{l:'Folder'},{l:'Size',r:1},{l:'Views',r:1},{l:'Visibility'},{l:'Modified'}], compact: true, rows: [
  ...([['01webresearchwebsearch-2025…', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&q=80','WEBP image','documents','1.7 MB','28'],
  ['03webresearchwebsearch-2025…','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=80','WEBP image','documents','1.7 MB','2'],
  ['07webresearchwebsearch-2025…','https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&q=80','WEBP image','documents','1.5 MB','3'],
  ['a1be3ffc-24c1-409e-a208-a9b29…','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80','WAV audio','documents','1.5 MB','2'],
  ['a1be3ffc-24c1-409e-a208-a9b30…','https://images.unsplash.com/photo-1556155092-490a1ba16284?w=200&q=80','WAV audio','documents','1.5 MB','1'],
  ['Brand Identity Design 10-29-2025.webp','https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&q=80','WEBP image','brand','1.3 MB','5'],
  ['Case Study_BuidDesignDec2025.webp','https://images.unsplash.com/photo-1545235617-9465d2a55698?w=200&q=80','WEBP image','case-studies','1.2 MB','11'],
  ['Case Study_FintechPayJan2026.webp','https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&q=80','WEBP image','case-studies','1.1 MB','14']]
    .map(([f,src,t,fo,s,v],ix)=>[
      `<label class="flex items-center gap-3"><input type="checkbox"><img src="${src}" alt="" style="width:34px;height:34px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'"><span class="mono truncate" style="max-width:220px;font-size:11.5px">${f}</span></label>`,
      badge(t,'neutral'),`<span class="dim">${fo}</span>`,`<span class="mono">${s}</span>`,`<span class="mono">${v}</span>`,
      badge(ix%3===0?'Private':'Workspace', ix%3===0?'default':'neutral'),
      `<span class="text-xs dim">Oct ${10-(ix%5)}, 2026</span>`]) )
]})}
</div>
${pager('Showing 1–8 of 80', '1/8·Inbox (unfiled)')}`,
  },

  {
    path: 'apps/admin/media/folders/', app: 'admin', title: 'Folders · Media · Admin', crumb: 'Folders',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'ASSETS', title: 'Folders', sub: 'How the library is organized. Unfiled uploads land in Inbox.',
  actions: `<button class="btn btn-primary">${icon('folder-plus',14)} New folder</button>` })}
<div class="grid g3 gap-5">
  ${[['inbox','Inbox (unfiled)','10 files','Everything new until curated',true],['image','blog-assets','35 files','Covers, diagrams for posts'],['trending','case-studies','8 files','Before/after shots for portfolio'],['sparkles','brand','12 files','Logos, marks, social kits'],['file-text','documents','9 files','Contracts, spec PDFs'],['user','avatars','5 files','Team & pod headshots'],['trash-2','Trash','1 file','Purge after 30 days']]
  .map(([i,t,n,d,mark])=>`
  <a class="panel panel-pad" href="${LT(r,'apps/admin/media/browse/')}" style="display:block">
    <div class="flex items-center gap-3 mb-3"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i,16)}</span><div class="mono text-xs dim ml-auto">${icon('lock',11)} private</div></div>
    <b class="block ${mark?'brand-text':''}" style="font-size:14px">${t}</b>
    <div class="text-xs dim mt-1">${d}</div>
    <div class="text-xs dim mono mt-3">${n}</div>
  </a>`).join('')}
</div>`,
  },

  {
    path: 'apps/admin/media/upload/', app: 'admin', title: 'Upload · Media · Admin', crumb: 'Upload',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'ASSETS', title: 'Upload', sub: '7 of 20 uploads left this hour · 100 MB per file · scans before publish.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    <div style="border:2px dashed var(--line-strong);border-radius:16px;padding:46px;text-align:center;background:var(--bg-hover)">
      <div class="avatar sq mx-auto" style="width:46px;height:46px;border-radius:12px;background:var(--brand-2);color:var(--brand-11)">${icon('upload',20)}</div>
      <div class="mt-3 font-semibold">Drag &amp; drop files here</div>
      <div class="text-xs dim mt-1">or</div>
      <button class="btn btn-primary mt-3">${icon('paperclip',14)} Browse files</button>
    </div>
    ${panel({ title: 'Queue', pad: false, body: `
      <div class="panel-row">${icon('image',15)}<span class="mono flex-1 truncate" style="font-size:12px">cover-fintech-dashboard.png</span><span class="mono text-xs dim">2.4 MB</span><div class="prog thin w-24"><i style="width:72%"></i></div><span class="text-xs dim">72%</span></div>
      <div class="panel-row">${icon('file-text',15)}<span class="mono flex-1 truncate" style="font-size:12px">milestone-3-spec.pdf</span><span class="mono text-xs dim">856 KB</span>${badge('Scanning','info')}</div>` })}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Destination', body: `
      ${field('Folder', '<select class="select"><option>Inbox (unfiled)</option><option>blog-assets</option><option>case-studies</option><option>brand</option><option>documents</option></select>', { req: false })}
      <div class="mt-3">${field('Tags', input({ ph: 'cover, fintech, hero' }), { req: false })}</div>
      <div class="mt-3">${field('Visibility', '<select class="select"><option>Workspace (internal)</option><option>Private (you only)</option><option>Public URL</option></select>', { req: false, hint: 'Public URLs are fast to leak — prefer Signed URLs for client docs.' })}</div>` })}
    ${note('info','shield-check','Executables and password-protected archives are rejected outright. Everything else goes through ClamAV before it can be shared.')}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/media/storage/', app: 'admin', title: 'Storage · Media · Admin', crumb: 'Storage',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'ASSETS', title: 'Storage settings', sub: 'Quota behavior and retention. Applies to the workspace buckets, not API surfaces.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Quota & behavior', body: `
      ${field('Workspace cap', '<div class="input-wrap"><input class="input mono" value="5"><span class="text-xs dim" style="padding:0 12px;display:flex;align-items:center">GB</span></div>', { req: false })}
      <div class="mt-3">${field('Uploads per hour (per user)', input({ val: '20', cls: 'mono' }), { req: false })}</div>
      <div class="mt-3">${field('Max file size', input({ val: '100 MB', cls: 'mono' }), { req: false })}</div>
      <div class="mt-4">${switchRow('Reject at cap','Soft-warn at 90%, hard reject at 100%', true)}</div>
      ${switchRow('Regenerate URLs on move','Moves create fresh signed URLs — old ones expire in 24h', true)}
      ${switchRow('Version replaced files','Keep previous uploads as versions')}
    ` })}
    <button class="btn btn-primary btn-sm">Save storage settings</button>
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Current usage', body: `
      <div class="flex items-baseline justify-between mb-2"><b style="font-size:13px">11.5 MB of 5 GB</b><span class="mono text-xs dim">0.23%</span></div>
      ${progress(3, 'grad')}
      <div class="grid gap-2 mt-4">${[['blog-assets','4.1 MB'],['case-studies','2.8 MB'],['documents','2.2 MB'],['brand','1.7 MB'],['other','0.7 MB']].map(([f,s],i)=>`
      <div class="flex items-center gap-3"><span class="text-xs" style="width:90px">${f}</span><div class="prog thin grow"><i style="width:${[90,64,50,38,16][i]}%"></i></div><span class="mono text-xs dim" style="width:64px;text-align:right">${s}</span></div>`).join('')}</div>` })}
    ${panel({ title: 'Retention', body: kv([
      ['Trash purge','<span class="mono">30 days</span>'],['Version retention','<span class="mono">90 days</span>'],['Deleted user media','<span class="mono">Held 1 year, then purged</span>'],
    ])})}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/media/quarantine/', app: 'admin', title: 'Quarantine · Media · Admin', crumb: 'Quarantine',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'SAFETY', title: 'Quarantine', sub: 'Uploads held by the scanner until an operator clears or deletes them. They cannot be served anywhere.' })}
${empty('shield-alert', '1 file in quarantine', 'Held 12 days — review or it auto-purges at day 30.', `<button class="btn btn-secondary btn-sm">Notify uploader</button>`)}
<div class="panel mt-5">
  <div class="panel-head"><div class="panel-title">Held files</div><span class="badge tone-warning">1 pending</span></div>
  <div class="panel-row" style="align-items:flex-start">
    <span class="avatar sq shrink-0" style="width:40px;height:40px;background:var(--t-danger-bg);color:var(--t-danger-tx)">${icon('file-text',17)}</span>
    <div class="min-w-0 flex-1">
      <b class="mono" style="font-size:12px">setup-helper_v2 (1).zip</b>
      <div class="text-xs dim mt-1">Uploaded by Priya Nair · Sep 29, 2026 · 42.9 KB · Source: message attachment</div>
      <div class="note danger mt-3" style="font-size:11.5px">${icon('alert-triangle',14)}<div><b>ClamAV: Win.Malware.Agent-28671205-0</b><br>Known trojan signature inside an archive. File never touched disk shares — held in the scan bucket only.</div></div>
    </div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-danger-solid btn-sm">${icon('trash-2',13)} Delete permanently</button>
      <button class="btn btn-ghost btn-sm">Override &amp; release</button>
    </div>
  </div>
</div>
${note('warn','shield','Override requires a typed reason and goes to the audit log under <span class="mono">MEDIA_QUARANTINE_RELEASE</span>.')}`,
  },

  {
    path: 'apps/admin/media/analytics/', app: 'admin', title: 'Analytics · Media · Admin', crumb: 'Analytics',
    body: (r) => `
${backlink(r, 'apps/admin/media/', 'Media center')}
${phead({ eyebrow: 'ASSETS', title: 'Media analytics', sub: 'What files are actually in flight — views, storage churn, and hot folders.' })}
${stats([
  { label: 'Views (7d)', value: '1,284', note: '+12% week over week', dir: 'up', icon: 'eye' },
  { label: 'Bandwidth (7d)', value: '2.9 GB', note: 'Public + signed URLs', icon: 'zap' },
  { label: 'Uploads (7d)', value: '48', note: '96% scanned clean', icon: 'upload' },
  { label: 'Folders in use', value: '6', note: 'avg 13 files', icon: 'folder' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Views · last 30 days', sub: 'Daily', pad: true, body: lineChart({ seed: 31, h: 260 }) })}
  <div class="flex-col gap-5">
    ${panel({ title: 'Hot folders', sub: 'Views', pad: true, body: barChart({ data: [62, 45, 38, 21, 12, 8], labels: ['case-studies', 'blog-assets', 'brand', 'documents', 'avatars', 'Inbox'], colors: ['var(--brand-8)','var(--t-info-dot)','var(--t-warning-dot)','var(--t-success-dot)','var(--line-strong)','var(--line-strong)'] }) })}
    ${panel({ title: 'Type breakdown', pad: true, body: donut({ parts: [
      { l: 'Images', v: 48, c: '#4CE0B3', d: '48%' }, { l: 'Documents', v: 22, c: '#02CED1', d: '22%' },
      { l: 'Archives', v: 14, c: '#3FA9F5', d: '14%' }, { l: 'Video', v: 10, c: '#FDEB92', d: '10%' }, { l: 'Audio', v: 6, c: '#FF9DDA', d: '6%' },
    ]})})}
  </div>
</div>
${panel({ title: 'Most viewed (7d)', pad: false, cls: 'mt-5', body: table({ cols: [{l:'File'},{l:'Folder'},{l:'Views',r:1},{l:'Trend'}], rows: [
  ...[['Case Study_FintechPayJan2026.webp','case-studies','142','▲'],['Nestlancer Services Content.png','brand','98','▲'],['RentFair_Architecture_Diagram.png','documents','61','■'],['1_GTSiMaCAderv0Xi6AyOtmw.webp','documents','34','▼'],['mark-full.png','brand','21','■']].map(([f,fo,v,t])=>[
  `<span class="mono" style="font-size:11.5px">${f}</span>`,`<span class="dim">${fo}</span>`,`<span class="mono">${v}</span>`,`<span style="color:${t==='▼'?'var(--t-danger-tx)':t==='▲'?'var(--t-success-tx)':'var(--ink-3)'}">${t}</span>`])
]})})}`,
  },

  // ================================================================ MODERATION
  {
    path: 'apps/admin/moderation/', app: 'admin', title: 'Moderation · Admin', crumb: 'Moderation',
    body: (r) => `
${phead({ eyebrow: 'TRUST & SAFETY', title: 'Moderation', sub: 'Flags from clients, operators, and automated filters. Decide fast — clients are watching the same thread.' })}
${stats([
  { label: 'Open flags', value: '0', note: 'Nothing awaiting your call', icon: 'flag' },
  { label: 'Auto-held (7d)', value: '3', note: 'Link spam in contact inbox', icon: 'shield-check' },
  { label: 'Avg decision time', value: '2.1h', note: 'Last 30d', icon: 'zap' },
], 3)}
<div class="panel mt-5">
  ${empty('check-circle', 'Inbox zero', 'No open flags. Auto-held contact spam clears nightly; escalations arrive as operator notifications + #ops-alerts.', `<a class="btn btn-secondary btn-sm" href="${LT(r,'apps/admin/messages/inbox/')}">Open operator inbox</a>`)}
</div>
${panel({ title: 'Recently decided', pad: false, cls: 'mt-5', body: table({ cols: [{l:'Case'},{l:'Type'},{l:'Decision'},{l:'By'},{l:'When'}], rows: [
  ['<b>Flag #0142</b>','Message link spam',badge('Dismissed','muted'),'Auto-filter','Oct 9'],
  ['<b>Flag #0138</b>','Abusive language (client thread)',badge('Removed','danger'),'Riya Kapoor','Oct 6'],
  ['<b>Flag #0131</b>','Off-topic contact pitch',badge('Archived','neutral'),'Riya Kapoor','Oct 2'],
]})})}
${note('warn','alert-triangle','Content removal in a client thread inserts a visible “removed by moderation” tombstone — there is no silent deletion.')}`,
  },

  // ================================================================ ANALYTICS
  {
    path: 'apps/admin/analytics/', app: 'admin', title: 'Analytics · Admin', crumb: 'Analytics',
    body: (r) => `
${phead({ eyebrow: 'INTELLIGENCE', title: 'Analytics', sub: 'Revenue, funnel, and delivery health — refreshed nightly, last run 2:00 AM IST.',
  actions: `<button class="btn btn-secondary">${icon('download',14)} Export CSV</button><button class="btn btn-primary">Schedule report…</button>` })}
${stats([
  { label: 'MRR', value: '₹7,08,160', note: '+8.2% vs Sep', dir: 'up', icon: 'trending' },
  { label: 'Pipeline value', value: '₹11.4L', note: '12 open quotes', icon: 'receipt' },
  { label: 'Avg deal size', value: '₹1.23L', note: 'Rolling 90d', icon: 'zap' },
  { label: 'Churn (rolling 6m)', value: '4.1%', note: '1 client paused', icon: 'users' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Revenue by month', sub: 'FY 2025–26 · collected (GST incl.)', pad: true, body: barChart({ data: [42, 55, 48, 61, 72, 68, 81, 63, 70], labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }) })}
  ${panel({ title: 'Revenue mix', sub: 'By service line', pad: true, body: donut({ parts: [
    { l: 'Web platforms', v: 38, c: 'var(--brand-8)', d: '38%' }, { l: 'Mobile apps', v: 21, c: '#3FA9F5', d: '21%' },
    { l: 'Design & UX', v: 17, c: '#4CE0B3', d: '17%' }, { l: 'Data & audit', v: 14, c: '#FDEB92', d: '14%' }, { l: 'Advisory', v: 10, c: '#FF9DDA', d: '10%' },
  ]})})}
</div>
<div class="grid gap-5 mt-5" style="grid-template-columns:1fr 1fr 1fr">
  ${panel({ title: 'Acquisition funnel (30d)', pad: true, body: `
    ${[['Inquiries','23'],['Qualified','9'],['Quoted','6'],['Accepted','4']].map(([l,v],i)=>`
    <div class="mb-3"><div class="flex justify-between text-xs mb-1"><span>${l}</span><b class="mono">${v}</b></div><div class="prog"><i style="width:${[100,39,26,17][i]}%;background:${['var(--line-strong)','var(--t-info-dot)','var(--brand-8)','var(--t-success-dot)'][i]}"></i></div></div>`).join('')}` })}
  ${panel({ title: 'Client cohort retention', sub: 'First-year, monthly', pad: true, body: `
    <div class="grid" style="grid-template-columns:auto repeat(5,1fr);gap:3px;font-size:10px;font-family:var(--font-mono)">
      ${['Cohort','M1','M2','M3','M4','M5','2025-Q2','100%','95%','91%','91%','88%','2025-Q3','100%','97%','94%','92%','—','2025-Q4','100%','96%','96%','—','—','2026-Q1','100%','98%','—','—','—'].map((c,i)=>{
        const head = i<6; const pct = /^[\d—]/.test(c) && c!=='2025-Q2'&&c!=='2025-Q3'&&c!=='2025-Q4'&&c!=='2026-Q1';
        const n = parseInt(c); const strong = pct && !isNaN(n) && n>=95;
        return `<div style="padding:6px 8px;background:${head?'transparent':pct?(isNaN(n)?'var(--bg-hover)':n>=95?'var(--t-success-bg)':n>90?'var(--t-warning-bg)':'var(--t-danger-bg)'):'transparent'};color:${head?'var(--ink-3)':strong?'var(--t-success-tx)':'var(--ink-2)'};border-radius:4px;text-align:center">${c}</div>`;
      }).join('')}
    </div>` })}
  ${panel({ title: 'Delivery health', sub: 'Trailing 90d', pad: true, body: `
    ${[['On-time milestones','94%',94],['First-response < 2h','88%',88],['Quote acceptance','44%',44],['NPS (client exit)','72',72]].map(([l,v,w])=>`
    <div class="mb-3"><div class="flex justify-between text-xs mb-1"><span>${l}</span><b class="mono">${v}</b></div><div class="prog"><i style="width:${w}%"></i></div></div>`).join('')}` })}
</div>`,
  },

  // ================================================================ INTEGRATIONS
  {
    path: 'apps/admin/integrations/', app: 'admin', title: 'Integrations · Admin', crumb: 'Integrations',
    body: (r) => `
${phead({ eyebrow: 'PLATFORM', title: 'Integrations', sub: 'Where the platform talks to the outside world — payments, email, LLMs, and notifications.' })}
<div class="panel mb-5">
  <div class="panel-row">
    <span class="avatar sq" style="width:38px;height:38px;background:var(--t-info-bg);color:#3FA9F5">${icon('send',16)}</span>
    <div class="flex-1"><b style="font-size:13.5px">Slack bot</b><div class="text-xs dim mt-1">Posting to <span class="mono">#nl-ops</span>, <span class="mono">#nl-leads</span></div></div>
    ${badge('Live','success')}
  </div>
</div>
<div class="grid g3 gap-5">
  ${[['card','Razorpay','Payments gateway','Test keys active · flip before GA','warning'],
     ['mail','Resend','Transactional & marketing email','Verified domain: nestlancer.com','success'],
     ['sparkles','Anthropic','Intake summaries, auto-tagging','Claude Haiku · 12k req/mo','success'],
     ['shield-check','Google Drive','External deliverable archive','Service account scoped to /deliverables','success'],
     ['hardDrive','S3 — uploads bucket','Media origin for the CDN','Lifecycle: quarantine bucket is private','success'],
     ['zap','Sentry','Error tracking + release health','0 unresolved · native tracing on','success'],
     ['clock','Vercel Cron','Hourly jobs + digests','us-east · 21 routes','success'],
     ['message','SMS Gupshup','India SMS for payment nudges','Sender ID NSTLAN · DLT registered','success'],
     ['key','Webhooks','Outbound events to client systems','14 active endpoints','info']]
  .map(([i,t,d,s,tn])=>`
  <div class="panel panel-pad">
    <div class="flex items-center justify-between mb-3"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:${tn==='warning'?'var(--t-warning-bg)':'var(--brand-2)'};color:${tn==='warning'?'var(--t-warning-tx)':'var(--brand-11)'}">${icon(i,16)}</span>${badge(tn==='warning'?'Attention':'Connected',tn==='warning'?'warning':'success')}</div>
    <b class="h3" style="font-size:14px">${t}</b><div class="text-xs dim mt-1">${d}</div>
    <div class="text-xs dim mono mt-3" style="line-height:1.5">${s}</div>
    <div class="flex gap-1 mt-3"><button class="btn btn-secondary btn-xs">Configure</button><button class="btn btn-ghost btn-xs">Docs</button></div>
  </div>`).join('')}
</div>
${note('warn','alert-triangle','Razorpay is in <b>test mode</b>. No real money moves until production keys replace the current test pair — keep client comms aligned.')}`,
  },

  // ================================================================ API KEYS
  {
    path: 'apps/admin/api-keys/', app: 'admin', title: 'API keys · Admin', crumb: 'API keys',
    body: (r) => `
${phead({ eyebrow: 'PLATFORM', title: 'API keys', sub: 'Scoped access for automation and client-side jobs. Keys are shown once at creation — store them in vaults.',
  actions: `<button class="btn btn-primary">${icon('plus',14)} Create key</button>` })}
${stats([
  { label: 'Active keys', value: '5', note: '2 used in the last hour', icon: 'key' },
  { label: 'Requests today', value: '8,412', note: '99.1% success rate', icon: 'zap' },
  { label: 'Rotations due', value: '1', note: 'Read-only reporting key', icon: 'clock' },
], 3)}
<div class="panel mt-5">
  <div class="panel-head"><div class="panel-title">Keys</div><span class="text-xs dim">5 active · 2 revoked</span></div>
  ${table({ cols: [{l:'Key'},{l:'Scope'},{l:'Created by'},{l:'Last used'},{l:'State'},{l:''}], rows: [
    ...[['nl_live_reports_…3f8a','read:collections, read:users','Sunita Rao','37 min ago','Rotating in 6d','warning'],
       ['nl_live_etl_…9c21','read:collections, write:audit','System','Live now','Active','success'],
       ['nl_test_ghactions_…77aa','full (ci-sandbox env only)','Dev Malhotra','Oct 9','Active','success'],
       ['nl_live_slackbot_…b41e','write:notifications','Riya Kapoor','2h ago','Active','success'],
       ['nl_test_pentest_…e884','read-only (expires Oct 30)','External auditor','Oct 3','Expires soon','warning'],
       ['nl_live_legacycrm_…5502','read:collections','Ananya Iyer','Aug 14','Revoked','muted']]
    .map(([k,sc,cr,lu,st,tn])=>{
      const eyeIcon = icon('eye',12);
      return [`<span class="mono" style="font-size:11.5px">${k}</span> <button class="btn-icon btn sm" title="Reveal" onclick="void 0" style="vertical-align:middle">${eyeIcon}</button>`,
      `<span class="mono" style="font-size:10.5px">${sc}</span>`,`<span class="dim">${cr}</span>`,
      `<span class="text-xs${lu.startsWith('Live')?' brand-text font-semibold':' dim'}">${lu}</span>`,
      badge(st,tn),
      `<div class="flex gap-1"><button class="btn btn-ghost btn-xs">Rotate</button><button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Revoke</button></div>`];
    })
  ]})}
</div>
${note('danger','key','Keys grant API access with the issuer&#39;s scopes. Revoking takes effect immediately — there is no grace period.')}`,
  },

  // ================================================================ AUDIT
  {
    path: 'apps/admin/audit/', app: 'admin', title: 'Audit log · Admin', crumb: 'Audit log',
    body: (r) => `
${phead({ eyebrow: 'GOVERNANCE', title: 'Audit log', sub: 'Every authenticated mutation across the platform. Immutable, exportable, and your first stop for “who did what”.',
  actions: `<button class="btn btn-secondary">${icon('download',14)} Export CSV</button>` })}
${filterbar(`${searchInput('Search actor, meta, id…', 240)}${sel(['All categories','Auth','Admin','Billing','Content','Media','Messaging'])}${sel(['All levels','Info','Warning','Critical'])}<input class="input sm" type="date" style="width:150px">`)}
<div class="panel">
  ${table({ cols: [{l:'Time'},{l:'Action'},{l:'Actor'},{l:'Category'},{l:'Entity'},{l:'IP'}], compact: true, rows: [
    ...[['18:10:2','LOGIN_SUCCESS','riya@nestlancer…','auth','user:f8e12…','103.210.51.14'],
       ['18:04:56','PAYMENT_RECEIVED','system','billing','invoice:NL-INV-2026-000008','—'],
       ['17:58:31','REQUEST_STATUS_CHANGED','riya@nestlancer…','admin','request:6a4110f3…','103.210.51.14'],
       ['17:52:10','MEDIA_UPLOADED','priya.nair@…','media','file:41b2c9…','49.36.188.10'],
       ['17:41:02','QUOTE_SENT','riya@nestlancer…','billing','quote:01a10f80…','103.210.51.14'],
       ['17:22:44','CACHE_CLEARED','sunita@nestlanc…','system','cache:post-lists','—'],
       ['17:18:05','LOGIN_FAILURE','—','auth','user:8b3f1c…','185.220.101.4'],
       ['17:02:39','REQUEST_SUBMITTED','arjun.mehta@…','requests','request:6a4110f3…','103.220.18.14'],
       ['16:55:12','EMAIL_TEMPLATE_UPDATED','riya@nestlancer…','system','template:quote-sent','103.210.51.14'],
       ['16:40:55','USER_ROLE_CHANGED','riya@nestlancer…','admin','user:dc2a90…','103.210.51.14']]
    .map(([t,a,act,c,e,ip],ix)=>[
      `<span class="mono" style="font-size:11px;color:var(--ink-3)">Oct 10 ${t}</span>`,
      `<span class="mono font-semibold" style="font-size:11px;letter-spacing:.01em">${a}</span>`,
      `<span class="text-xs dim">${act}</span>`,
      badge(c, a.startsWith('LOGIN_FAILURE')?'danger':c==='system'?'neutral':c==='billing'?'warning':'info'),
      `<span class="mono text-xs" style="font-family:var(--font-mono);color:var(--ink-2)">${e}</span>`,
      `<span class="mono text-xs dim">${ip}</span>`])
  ]})}
</div>
${pager('Showing 1–10 of 128', '1/13')}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Events per hour', sub: 'Today', pad: true, body: lineChart({ seed: 3, data: [4,2,3,5,6,4,9,12,15,11,13,18,14,10,6] }) })}
  ${panel({ title: 'Top categories', pad: true, body: barChart({ data: [48, 22, 16, 12, 9, 5], labels: ['auth','billing','admin','media','messaging','system'], colors: ['var(--brand-8)','var(--t-warning-dot)','var(--t-info-dot)','var(--line-strong)','var(--line-strong)','var(--t-danger-dot)'] }) })}
</div>
${note('warn','lock','Reads of PII-heavy records (user 360s, payment 360s, message controllers) are also logged under <span class="mono">VIEW_*</span> actions — that is the surveillance boundary. Operators can&#39;t mute it.')}`,
  },

  // ================================================================ PROFILE
  {
    path: 'apps/admin/profile/', app: 'admin', title: 'Profile · Admin', crumb: 'Profile',
    body: (r) => `
${phead({ eyebrow: 'OPERATOR', title: 'Your profile', sub: 'Client-facing identity and internal operator details.',
  actions: `<button class="btn btn-primary">${icon('edit',14)} Edit profile</button>` })}
<div class="grid gap-5" style="grid-template-columns:5fr 7fr;align-items:start">
  <div class="panel">
    <div class="panel-body text-center" style="padding:28px">
      <span class="avatar hue-2 xl mx-auto">RK</span>
      <h2 class="h3 mt-3">Riya Kapoor</h2>
      <div class="text-sm muted">Admin &amp; support intake</div>
      <div class="flex gap-2 justify-center mt-3">${badge('Operator — admin','danger')}${badge('TOTP enabled','success')}</div>
      <div class="divider my-4"></div>
      ${kv([['Email','riya@nestlancer.com'],['Pod','Operations'],['Since','Jan 2025'],['Shift','09:30–18:30 IST'],['On-call','Wk 50–51']])}
    </div>
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'Client-facing card', sub: 'Shown on messages and signature blocks', body: `
      <div class="panel" style="padding:16px;background:var(--bg-hover)">
        <div class="flex items-center gap-3"><span class="avatar hue-2 lg">RK</span><div><b>Riya Kapoor</b><div class="text-xs dim">Support &amp; finance · Nestlancer</div><div class="text-xs brand-text mt-1">Replies under 2 hours on workdays</div></div></div>
      </div>` })}
    ${panel({ title: 'Security', body: kv([
      ['Password','Changed 21 days ago'],['Two-factor',badge('TOTP + 4 recovery codes','success')],[ 'Sessions','2 devices (revoke any)'],['API access',badge('Admin scope','danger')],
    ])})}
    ${note('info','shield','Operator sign-ins require TOTP. Recovery codes are single-use — regenerate after two are spent.')}
  </div>
</div>`,
  },

  // ================================================================ SYSTEM
  {
    path: 'apps/admin/system/', app: 'admin', title: 'System · Admin', crumb: 'System',
    body: (r) => `
${phead({ eyebrow: 'ADMINISTRATION', title: 'System', sub: 'Config, feature flags, jobs, logs, templates — the whole back office.' })}
${sysGrid(r, [
  ['shield','Staff & roles','Who can do what in this console','4 staff','neutral','apps/admin/system/staff/'],
  ['flag','Feature flags','Kill-switches and staged rollouts','2 flags on','success','apps/admin/system/features/'],
  ['activity','Health','DB, cache, queues, edge','Degraded: jobs-Q','warning','apps/admin/system/health/'],
  ['clock','Jobs','Cron, retries, dead-letters','1 failing','danger','apps/admin/system/jobs/'],
  ['layers','Cache','Fast paths for reads','Warm: 96.8% hits','success','apps/admin/system/cache/'],
  ['file-text','Logs','Recent runtime output','—','neutral','apps/admin/system/logs/'],
  ['power','Maintenance','Read-only & offline modes','Off','muted','apps/admin/system/maintenance/'],
  ['megaphone','Announcements','Site-wide banners and digest copy','1 scheduled','info','apps/admin/system/announcements/'],
  ['mail','Email templates','Every transactional email','6 live','neutral','apps/admin/system/email-templates/'],
  ['bell','Notification templates','In-app event copy','24 events','info','apps/admin/system/notification-templates/'],
  ['key','API keys','Scoped programmatic access','5 active','neutral','apps/admin/api-keys/'],
  ['globe','Integrations','Payment, email, LLM, storage','1 attention','warning','apps/admin/integrations/'],
])}`,
  },

  {
    path: 'apps/admin/system/staff/', app: 'admin', title: 'Staff &amp; roles · Admin', crumb: 'Staff & roles',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Staff &amp; roles', sub: 'Operators are expensive credentials — least privilege by default, escalation with reason.',
  actions: `<button class="btn btn-primary">${icon('plus',14)} Invite operator</button>` })}
<div class="grid g4 gap-4 mb-5">
  ${[['admins','2','Full access incl. system config'],['delivery','1','Projects, quotes, messages'],['engineering','1','Deployments, media, logs'],['finance','1 (vacancy)','Payments, invoices, legal profile']].map(([i,t,d])=>`
  <div class="panel panel-pad"><span class="avatar sq" style="width:32px;height:32px;background:var(--brand-2);color:var(--brand-11)">${icon('users',14)}</span>
  <b class="mt-2 block" style="font-size:13.5px;text-transform:capitalize">${t}</b><div class="text-xs dim mt-1">${d}</div></div>`).join('')}
</div>
${panel({ title: 'Operators', pad: false, body: table({ cols: [{l:'Person'},{l:'Role'},{l:'Scope'},{l:'Last active'},{l:'State'},{l:''}], rows: [
  ...[['Riya Kapoor','Admin — Operations','Full access','3 min ago','Active','success'],
     ['Sunita Rao','Admin — Operations','Full access','1h ago','Active','success'],
     ['Arjun Nair','Operator — Delivery','Projects, quotes, messages','22 min ago','Active','success'],
     ['Dev Malhotra','Operator — Engineering','Deployments, media, logs','2h ago','Active','success'],
     ['Ananya Iyer','Operator — CX (trial)','Contacts and contact-messages','Oct 4','Suspended','danger']]
    .map(([n,ro,sc,la,st,tn])=>[
      `<div class="flex items-center gap-2"><span class="avatar hue-${(n.length%5)+1}">${n.split(' ').map(w=>w[0]).join('')}</span><b>${n}</b></div>`,
      badge(ro, tn==='danger'?'danger':ro.startsWith('Admin')?'warning':'info'),
      `<span class="dim">${sc}</span>`,`<span class="text-xs dim">${la}</span>`,badge(st,tn==='danger'?'danger':'success'),
      `<div class="flex gap-1"><button class="btn btn-ghost btn-xs">Edit</button><button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">${tn==='danger'?'Reactivate':'Suspend'}</button></div>`])
]})})}
${note('warn','shield','Promotions to <b>Admin</b> require a second existing admin to approve before they take effect — and they are audit-logged twice.')}`,
  },

  {
    path: 'apps/admin/system/features/', app: 'admin', title: 'Feature flags · Admin', crumb: 'Feature flags',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Feature flags', sub: 'Kill-switches for every shipped surface. Changes propagate in under 60 seconds.' })}
${panel({ pad: false, body: table({ cols: [{l:'Flag'},{l:'Owner'},{l:'Rollout'},{l:'State'},{l:'Notes'}], rows: [
  ...[['FLAG_MESSAGES_V2','Platform','100% clients',true,'3-pane chat, project pings, search'],
     ['FLAG_PAYMENTS_UPI_COLLECT','Finance','100% clients',true,'Razorpay UPI intent flow'],
     ['FLAG_QUOTES_V2','Finance','Internal only',false,'New builder — shipping after dispute window'],
     ['FLAG_COPILOT_BRIEF','AI','0% — paused',false,'Summarizes briefs into draft requests'],
     ['FLAG_ADMIN_TASKS','Ops','Staff only',true,'Queue cleanup and cross-links'],
     ['FLAG_PUBLIC_BETA','Marketing','Marketing site only',false,'Waits on Razorpay production keys']]
    .map(([f,own,roll,on,d])=>[
      `<span class="mono font-semibold" style="font-size:11.5px">${f}</span>`,
      `<span class="dim">${own}</span>`,
      `<span class="mono text-xs${roll.includes('0%')?' dim':''}">${roll}</span>`,
      `<span class="badge ${on?'tone-success':'tone-muted'}">${on?'On':'Off'}</span> <label class="switch" style="vertical-align:middle;margin-left:6px"><input type="checkbox"${on?' checked':''}><i></i></label>`,
      `<span class="dim text-xs">${d}</span>`])
]})})}
${note('danger','alert-triangle','Flipping a flag mid-incident is a <b>mutation</b> — it lands in the audit log with your name, the reason you must type, and a 60s rollout timer.')}`,
  },

  {
    path: 'apps/admin/system/health/', app: 'admin', title: 'Health · Admin', crumb: 'Health',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Health', sub: 'What the platform actually is doing, per subsystem. Green is good; anything else earns a page.' })}
<div class="grid g4 gap-4 mb-5">
  ${[['Database — Postgres 16','Healthy','1.2 ms median q','success'],['Redis — cache/queues','Healthy','12k ops/s','success'],['Job queue — jobs-Q','Degraded','1 route stuck 18m','warning'],['Edge — Vercel','Healthy','42 ms p95 TTFB','success']].map(([t,st,meta,tn])=>`
  <div class="panel panel-pad">
    <div class="flex items-center justify-between"><b style="font-size:13px">${t}</b>${badge(st,tn)}</div>
    <div class="mono text-xs dim mt-2">${meta}</div>
    <div class="prog thin mt-3"><i style="width:${tn==='warning'?64:99}%;background:${tn==='warning'?'var(--t-warning-dot)':'var(--t-success-dot)'}"></i></div>
  </div>`).join('')}
</div>
<div class="grid gap-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'API latency (p95)', sub: 'Last 6 hours · all routes', pad: true, body: lineChart({ seed: 11, data: [180,175,190,420,230,185,178,182,175,180,178,181], labels: ['12:00','14:00','16:00','18:00'] }) })}
  ${panel({ title: 'Subsystem table', pad: false, body: table({ cols: [{l:'Check'},{l:'Status'}], compact: true, rows: [
    ['<span class="mono" style="font-size:11px">auth-sessions</span>',badge('Passing','success')],
    ['<span class="mono" style="font-size:11px">quote-signatures</span>',badge('Passing','success')],
    ['<span class="mono" style="font-size:11px">settlement-cron</span>',badge('Slow (18m)','warning')],
    ['<span class="mono" style="font-size:11px">clamav-worker</span>',badge('Passing','success')],
    ['<span class="mono" style="font-size:11px">cdn-origins</span>',badge('Passing','success')],
  ]})})}
</div>
${note('warn','activity','Settlement cron has been slow for 18 minutes. It retries on its own; if it crosses 30 minutes, <span class="mono">#nl-ops</span> gets paged and a banner appears in client Billing.')}`,
  },

  {
    path: 'apps/admin/system/jobs/', app: 'admin', title: 'Jobs · Admin', crumb: 'Jobs',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Jobs', sub: 'Cron schedules, retries, and dead letters. Fix the data, not the router.' })}
${panel({ pad: false, body: table({ cols: [{l:'Job'},{l:'Schedule'},{l:'Last run'},{l:'Duration'},{l:'Status'},{l:''}], rows: [
  ...[['settlement-reconciliation','0 2 * * *','18m ago (running)','18m 12s','Stuck','warning'],
     ['notification-digest','0 7 * * 1-5','11h ago','41s','OK','success'],
     ['media-clamav-sweep','*/15 * * * *','4m ago','8s','OK','success'],
     ['quote-expiry-check','*/10 * * * *','6m ago','2s','OK','success'],
     ['audit-log-archive','0 3 * * 0','5d ago','2m 04s','OK','success'],
     ['request-nudge-unreviewed','0 9 * * *','9h ago','1s','OK','success']]
    .map(([j,s,lr,d,st,tn])=>[
      `<span class="mono font-semibold" style="font-size:11.5px">${j}</span>`,
      `<span class="mono text-xs dim">${s}</span>`,`<span class="dim">${lr}</span>`,
      `<span class="mono text-xs">${d}</span>`,badge(st,tn),
      `<div class="flex gap-1"><button class="btn btn-ghost btn-xs">Logs</button>${tn==='warning'?'<button class="btn btn-primary btn-xs">Retry</button>':''}</div>`])
]})})}
<div class="grid gap-5 mt-5" style="grid-template-columns:2fr 1fr">
  ${panel({ title: 'Dead-letter queue', sub: '2 entries — automatic retries exhausted', pad: false, body: table({ cols: [{l:'Job'},{l:'Payload'},{l:'Failed'},{l:''}], compact: true, rows: [
    ['<span class="mono" style="font-size:11px">email-send</span>','<span class="mono text-xs">template:payment-received · user:dc2a90</span>','Oct 9, 4:12 PM','<button class="btn btn-secondary btn-xs">Replay</button>'],
    ['<span class="mono" style="font-size:11px">webhook-deliver</span>','<span class="mono text-xs">ep:9f1c · event:project.milestone.approved</span>','Oct 8, 9:41 AM','<button class="btn btn-secondary btn-xs">Replay</button>'],
  ]})})}
  ${panel({ title: 'Runtime profile', pad: true, body: donut({ parts: [
    { l: 'Healthy', v: 5, c: 'var(--t-success-dot)', d: '5 jobs' },
    { l: 'Slow', v: 1, c: 'var(--t-warning-dot)', d: '1 job' },
    { l: 'Failed', v: 0, c: 'var(--t-danger-dot)', d: '0 jobs' },
  ]})})}
</div>`,
  },

  {
    path: 'apps/admin/system/cache/', app: 'admin', title: 'Cache · Admin', crumb: 'Cache',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Cache', sub: 'Reads are fast only because of this layer. Clear entries when the data overrides are wrong.' })}
${stats([
  { label: 'Hit rate', value: '96.8%', note: '7-day rolling', icon: 'zap' },
  { label: 'Entries', value: '4,214', note: 'across 6 namespaces', icon: 'layers' },
  { label: 'Memory', value: '168 MB', note: 'of 512 MB', icon: 'hardDrive' },
  { label: 'Stuck keys', value: '3', note: 'set:* since Oct 8', icon: 'clock' },
], 4)}
<div class="grid gap-5 mt-5" style="grid-template-columns:7fr 5fr;align-items:start">
  ${panel({ title: 'Namespaces', pad: false, body: table({ cols: [{l:'Namespace'},{l:'Entries',r:1},{l:'Hit rate',r:1},{l:''}], rows: [
    ...[['quote:','412','98.2%'],['project:','891','97.4%'],['blog:','1,240','99.1%'],['user-sessions:','1,402','96.6%'],['media-urls:','231','91.2%'],['misc:','38','84.1%']].map(([n,e,h])=>[
      `<span class="mono font-semibold" style="font-size:11.5px">${n}</span>`,`<span class="mono">${e}</span>`,`<span class="mono">${h}</span>`,
      `<div class="flex gap-1"><button class="btn btn-ghost btn-xs">Inspect</button><button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Clear</button></div>`])
  ]})})}
  <div class="flex-col gap-5">
    ${panel({ title: 'Dangerous actions', body: `
      <div class="text-xs dim mb-3" style="line-height:1.6">Clearing large namespaces is cheap; clearing <b>user-sessions</b> logs everyone out immediately.</div>
      <div class="flex flex-col gap-2">
        <button class="btn btn-secondary w-full">${icon('refresh',13)} Warm public page cache</button>
        <button class="btn btn-danger w-full">${icon('trash-2',13)} Flush everything…</button>
      </div>` })}
    ${note('info','clock','Stuck keys: <span class="mono">set:sync-requests-backfill</span> caught in a lock since Oct 8. Unlocking requires restart-safe mode from the Jobs page.')}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/system/logs/', app: 'admin', title: 'Logs · Admin', crumb: 'Logs',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Logs', sub: 'Server output streamed live. Filter by service, level, and route.' })}
${filterbar(`${searchInput('Search message, request id, user…', 260)}${sel(['All services','api','web','admin','jobs','cron'])}${sel(['All levels','info','warn','error'])}<button class="btn btn-secondary btn-sm ml-auto">${icon('download',13)} Export 1k lines</button>`)}</div>
<div class="panel" style="background:var(--bg-sunken)">
  <div class="panel-body mono" style="font-size:11px;line-height:1.85;color:var(--ink-2);padding:16px 20px">
    ${[['18:10:22.114','info','api','POST /api/v1/payments/verify 200 14ms · rid:req_9f2ac1'],
      ['18:10:19.842','info','web','GET /billing/invoice/[id] 200 · user:8b3f1c · rt:22ms'],
      ['18:10:14.201','warn','jobs','[settlement-reconciliation] progress=68% elapsed=1070s threshold=900s'],
      ['18:09:58.733','info','admin','CACHE_CLEARED ns=misc by user:f8e12 · keys=38'],
      ['18:09:41.020','error','api','POST /api/v1/webhooks/razorpay 401 · reason=invalid_signature · ip:52.66.177.12'],
      ['18:09:33.554','info','web','GET /quotes/[id] 200 · user:8b3f1c · rt:18ms'],
      ['18:09:21.877','warn','cron','quote-expiry-check: 2 quotes expired → notifications queued'],
      ['18:08:59.112','info','jobs','archive completed: 128 rows → s3://audit/2026/10/…'],
      ['18:08:44.903','info','api','GET /api/v1/health 200 3ms',
      ]].map(([t,l,s,m])=>{
      const col = l==='error'?'var(--t-danger-tx)':l==='warn'?'var(--t-warning-tx)':'var(--t-success-tx)';
      return `<div><span style="color:var(--ink-3)">${t}</span> <span style="color:${col};font-weight:600">${l.toUpperCase()}</span> <span style="color:#3FA9F5">[${s}]</span> ${m}</div>`;
    }).join('')}${''}
  </div>
</div>
${pager('Live tail · Oct 10, 2026 · IST')}`,
  },

  {
    path: 'apps/admin/system/maintenance/', app: 'admin', title: 'Maintenance · Admin', crumb: 'Maintenance',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Maintenance mode', sub: 'Read-only browsing or full standstill — chosen deliberately, announced clearly.' })}
<div class="grid gap-5" style="grid-template-columns:7fr 5fr;align-items:start">
  <div class="flex-col gap-5">
    ${panel({ title: 'Current state', actions: badge('All systems live','success'), body: `
      <div class="flex items-center gap-3 py-2">
        <span style="width:10px;height:10px;border-radius:99px;background:var(--t-success-dot);box-shadow:0 0 0 4px var(--t-success-bg)"></span>
        <div><b>Platform is live</b><div class="text-xs dim mt-1">Last maintenance: Sept 14, 2026 · 02:00–02:22 IST · planned, zero-downtime</div></div>
      </div>` })}
    ${panel({ title: 'Engage maintenance mode', body: `
      ${field('Mode', '<select class="select"><option>Read-only (browsing works, writes blocked)</option><option>Full standstill (everything except this console pauses)</option></select>', { req: false })}
      <div class="mt-3">${field('Public message', textarea('Shown on the platform-wide banner…', 'We are upgrading our payment stack. Everything is safe — quoting, messaging, and uploads pause for about 30 minutes starting 02:00 IST on Oct 18.', 3), { req: false })}</div>
      <div class="mt-3">${field('Planned window', '<div class="grid g2 gap-3"><input class="input" type="datetime-local"><input class="input" type="datetime-local"></div>', { req: false })}</div>
      <div class="flex gap-2 mt-4"><button class="btn btn-primary">${icon('megaphone',14)} Schedule announcement + window</button><button class="btn btn-danger">Engage now</button></div>
      <div class="text-xs dim mt-3">Engaging “Full standstill” requires a typed reason and boots background queues safely before pausing.</div>` })}
  </div>
  <div class="flex-col gap-5">
    ${panel({ title: 'What clients see', pad: true, body: `
      <div class="panel" style="padding:16px">
        <div class="note info brand" style="box-shadow:none">${icon('megaphone',15)}<div><b>Scheduled maintenance — Oct 18, 02:00–02:30 IST.</b><br>Quoting, messaging, and uploads pause briefly. Browsing stays read-only.</div></div>
        <div class="text-xs dim mt-3 text-center" style="padding:8px;border:1px dashed var(--line-strong);border-radius:8px">(portal otherwise reachable, navigation disabled)</div>
      </div>` })}
    ${panel({ title: 'History', pad: false, body: table({ cols: [{l:'When'},{l:'Mode'},{l:'Duration'},{l:'Outcome'}], compact: true, rows: [
      ['Sep 14, 2026','Read-only','22 min','<span class="text-xs">No incidents</span>'],
      ['Jul 30, 2026','Full','38 min','<span class="text-xs">1 retry on payout lock</span>'],
      ['May 02, 2026','Read-only','14 min','<span class="text-xs">Smooth</span>'],
    ]})})}
  </div>
</div>`,
  },

  {
    path: 'apps/admin/system/announcements/', app: 'admin', title: 'Announcements · Admin', crumb: 'Announcements',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Announcements', sub: 'Platform-wide banners, broadcast messages, and digest copy that reaches every audience it should.',
  actions: `<button class="btn btn-primary">${icon('plus',14)} New announcement</button>` })}
${tabs([{ l: 'Scheduled', count: 1, active: true }, { l: 'Live', count: 0 }, { l: 'Past', count: 12 }])}
${panel({ title: 'Scheduled announcement', pad: false, body: `
  <div class="panel-row" style="align-items:flex-start">
    <span class="avatar sq shrink-0" style="width:36px;height:36px;background:var(--t-info-bg);color:var(--t-info-tx)">${icon('clock',15)}</span>
    <div class="min-w-0 flex-1">
      <b style="font-size:13.5px">Scheduled maintenance — Oct 18, 02:00–02:30 IST</b>
      <div class="text-xs muted mt-1" style="line-height:1.6">Quoting, messaging, and uploads pause briefly. Browsing stays read-only. Auto-removes when the window ends.</div>
      <div class="flex gap-3 mt-2 text-xs dim"><span>${icon('users',12)} Audience: all clients + operators</span><span>${icon('calendar',12)} Posts Oct 17, 9:00 AM IST → expires Oct 18, 02:32 AM IST</span></div>
    </div>
    ${badge('Scheduled','info')}
    <div class="flex gap-1"><button class="btn btn-ghost btn-xs">Edit</button><button class="btn btn-ghost btn-xs" style="color:var(--t-danger-tx)">Cancel</button></div>
  </div>` })}
${empty('megaphone', 'Nothing live right now')}
${panel({ title: 'Recent announcements', pad: false, cls: 'mt-5', body: table({ cols: [{l:'Message'},{l:'Audience'},{l:'Window'},{l:'Outcome'}], rows: [
  ['<b>New: project milestones in your dashboard</b>','All clients','Oct 1 – Oct 7','<span class="dim text-xs">Seen by 33</span>'],
  ['<b>Docs center updated: payment flows</b>','All clients','Sep 22 – Sep 28','<span class="dim text-xs">Clicked 41%</span>'],
  ['<b>September service bulletin</b>','All users','Sep 1 – Sep 9','<span class="dim text-xs">Emailed + banner</span>'],
]})})}`,
  },

  {
    path: 'apps/admin/system/email-templates/', app: 'admin', title: 'Email templates · Admin', crumb: 'Email templates',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Email templates', sub: 'Every transactional email, versioned. Template changes render against the newest event shape before save.' })}
<div class="grid gap-5" style="grid-template-columns:5fr 7fr;align-items:start">
  <div class="flex-col gap-3">
    ${[['welcome','Welcome to Nestlancer','On signup · verified email','v9'],['quote-sent','Quote sent to client','Operator action · quote','v14'],['payment-received','Payment received','System event · billing','v11'],['password-reset','Password reset','Auth · expiring link','v6'],['weekly-digest','Weekly project digest','Cron Mon 8 AM · client','v4'],['verify-email','Verify your email','Onboarding','v3']]
    .map(([slug,t,d,v],ix)=>`
    <a class="panel-row" href="#" style="border:1px solid var(--line);border-radius:10px;padding:13px 16px;${ix===1?'border-color:var(--brand-7);background:var(--brand-1)':''}">
      <div class="min-w-0 flex-1"><b style="font-size:13px">${t}</b><div class="text-xs dim mt-1">${d}</div></div>
      ${ix===1?badge('Editing','info'):`<span class="mono text-xs dim">${v}</span>`}
      ${icon('chevron-right',14)}
    </a>`).join('')}
  </div>
  <div class="flex-col gap-5" style="position:sticky;top:76px">
    ${panel({ title: 'quote-sent · v14', actions: badge('Live','success'), body: `
      ${field('Subject line', input({ val: 'Your quote from Nestlancer Studio — {{quote.id}}' }), { req: false })}
      <div class="mt-3">${field('Preview text', input({ val: 'Regards from {{operator.name}} — quote total {{quote.total}}.' }), { req: false })}</div>
      <div class="mt-3">${field('Body (markdown)', textarea('', 'Hi {{client.first_name}},\n\n{{operator.name}} has prepared your quote for **{{request.title}}**.\n\n**Total: {{quote.total}}** (valid until {{quote.valid_until}})\n\n[Review and sign]({{quote.url}})\n\n— The Nestlancer studio', 9), { req: false })}</div>
      <div class="flex gap-2 mt-4"><button class="btn btn-primary">Save template</button><button class="btn btn-secondary">Send test to self</button></div>` })}
    <div class="panel"><div class="panel-head"><div class="panel-title">Preview · latest event payload</div></div>
      <div class="panel-body mono" style="font-size:11.5px;background:var(--bg-sunken)">
        <span style="color:var(--t-success-tx)">Subject:</span> Your quote from Nestlancer Studio — Q-2026-000112<br><br>
        Hi Neha,<br><br>Riya Kapoor has prepared your quote for <b>HR onboarding automation</b>.<br><br><b>Total: ₹1,44,000.00</b> (valid until Oct 24, 2026)<br><br><span style="color:#3FA9F5">[Review and sign]</span><br><br><span style="color:var(--ink-3)">— The Nestlancer studio</span>
      </div>
    </div>
  </div>
</div>`,
  },

  {
    path: 'apps/admin/system/notification-templates/', app: 'admin', title: 'Notification templates · Admin', crumb: 'Notification templates',
    body: (r) => `
${backlink(r, 'apps/admin/system/', 'System')}
${phead({ eyebrow: 'ADMINISTRATION', title: 'Notification templates', sub: 'In-app copy per event — the exact lines that appear in the bell menu and notifications page.' })}
${filterbar(`${searchInput('Search events…', 240)}${sel(['All categories','Auth','Billing','Content','Projects','Quotes','System'])}`)}
${panel({ pad: false, body: table({ cols: [{l:'Event'},{l:'Title copy'},{l:'Body copy'},{l:'Channels'},{l:''}], rows: [
  ...[['quote.sent','Your Quote PDF is ready','{{operator}} sent a quote for {{request_title}} — {{total}}.','In-app · Email'],
     ['quote.viewed','Your quote was viewed','{{client}} opened your quote for the 1st time.','In-app'],
     ['payment.received','Payment received: {{amount}}','{{payment_ref}} was recorded for {{project_title}}.','In-app · Push'],
     ['project.status_changed','Project status updated','{{project_title}} moved to {{new_status}}.','In-app · Email'],
     ['message.received','New message in {{thread}}','{{sender}}: “{{excerpt}}”','In-app · Email'],
     ['user.suspended','Account suspended','Your sign-in was disabled by an operator.','Email only']]
    .map(([ev,t,b,ch])=>[
      `<span class="mono font-semibold" style="font-size:11px">${ev}</span>`,
      `<span class="text-xs">${t}</span>`,
      `<span class="text-xs dim">${b}</span>`,
      `<span class="mono text-xs dim">${ch}</span>`,
      `<button class="btn btn-ghost btn-xs">Edit</button>`])
]})})}
${note('info','edit',`Templates support <span class="mono">{{variables}}</span> from the event payload. Unknown variables fail validation before save — the event registry rejects unknown keys everywhere else.`)}
<button class="btn btn-primary mt-5">${icon('plus',14)} Register new event</button>`,
  },
];
