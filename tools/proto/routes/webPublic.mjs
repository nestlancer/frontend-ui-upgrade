// ============================================================================
// ROUTES — apps/web (port 9000) — public surface (marketing-app chrome)
// Home · About · Work · Contact · Portfolio · Blog (+cat/tag/bookmarks)
// Legal (Privacy/Terms) · Verify · Share · Impersonate
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';
import { badge, panel, note, cover, table, stats, convItem } from '../lib/comps.mjs';
import { POSTS, WORKS } from './data.mjs';

const hero = (fig, title, lead) => `
<section style="padding:52px 0 34px"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>${fig}</div>
  <h1 class="h1">${title}</h1>
  ${lead ? `<p class="lead mt-4" style="max-width:60ch">${lead}</p>` : ''}
</div></section>`;

const blogRail = (r, activeCat) => `
<aside>
  <h5 class="rail-title">Categories</h5>
  ${[['All articles','106','apps/web/blog/'],['Business','27','apps/web/blog/category/[slug]/'],['Case Studies','26','apps/web/blog/category/[slug]/'],['Design','27','apps/web/blog/category/[slug]/'],['Technology','26','apps/web/blog/category/[slug]/']].map(([l,c,h])=>`<a class="rail-link${l===activeCat?' active':''}" href="${LT(r,h)}"><span>${l}</span><span class="c">${c}</span></a>`).join('')}
  <h5 class="rail-title mt-6">Tools</h5>
  <a class="rail-link" href="#"><span class="flex items-center gap-2">${icon('rss',13)} RSS</span></a>
  <a class="rail-link" href="${LT(r,'apps/web/blog/bookmarks/')}"><span class="flex items-center gap-2">${icon('bookmark',13)} Bookmarks</span></a>
</aside>`;

const postCard = (r,p,i) => `
<a href="${LT(r,'apps/web/blog/[slug]/')}" class="mkt-card" style="overflow:hidden;display:block">
  ${cover(p.cat.toUpperCase(),(i%6)+1,'padding-top:44%')}
  <div style="padding:14px 16px">
    <div class="eyebrow" style="font-size:9.5px">${p.cat.toUpperCase()}</div>
    <b style="font-size:13.5px;letter-spacing:-.015em;line-height:1.35;display:block;margin-top:4px">${p.t}</b>
    <div class="text-xs dim mono mt-2">Nestlancer Editorial · ${p.min} min</div>
  </div>
</a>`;

export default [
  // ------------------------------------------------------------- home
  {
    path: 'apps/web/', title: 'Nestlancer — Client portal for a senior product studio', active: 'home',
    body: (r) => `
<section class="mkt-section" style="padding-top:60px"><div class="mkt-wrap">
  <div class="grid g2 gap-10 items-center">
    <div>
      <div class="pill mb-5"><span class="dot"></span> Client portal · live</div>
      <h1 class="h-display" style="font-size:clamp(36px,4.2vw,54px)">Your delivery OS —<br><span class="grad">from brief to payout.</span></h1>
      <p class="lead mt-5" style="max-width:48ch">Submit a brief, review a line-item quote, fund milestones via Razorpay or bank rails, and approve deliverables in one auditable surface.</p>
      <div class="flex gap-3 mt-6 flex-wrap">
        <a class="btn btn-primary btn-lg" href="${LT(r,'apps/web/register/')}">Create client account ${icon('arrow-right',15)}</a>
        <a class="btn btn-secondary btn-lg" href="${LT(r,'apps/web/login/')}">Sign in</a>
      </div>
      <div class="flex gap-5 mt-6 mono text-xs dim" style="letter-spacing:.05em"><span>↳ Fixed-price quotes</span><span>↳ Milestone escrow</span><span>↳ GST invoices</span></div>
    </div>
    <div class="mkt-card" style="overflow:hidden">
      <div style="padding:16px 18px;border-bottom:1px solid var(--paper-line)" class="flex items-center justify-between">
        <div class="eyebrow">WORKSPACE VITALS</div><span class="mono text-xs brand-text">Live · 30s</span>
      </div>
      <div class="grid" style="grid-template-columns:repeat(5,1fr)">
        ${[['Open requests','1','in your pipeline'],['Active projects','1','0 completed'],['Pending quotes','0','awaiting decision'],['Unread messages','6','waiting for you'],['Notifications','32','latest updates']].map(([l,v,n])=>`
        <div style="padding:14px 12px;border-right:1px solid var(--paper-line)"><div class="text-xs dim truncate">${l}</div><div class="mono" style="font-size:21px;font-weight:700;margin-top:2px">${v}</div><div class="text-xs dim" style="font-size:10px">${n}</div></div>`).join('')}
      </div>
      <div class="panel-row" style="border-top:1px solid var(--paper-line)">
        <span class="avatar hue-2">AI</span>
        <div class="min-w-0"><b style="font-size:13px">Ananya Iyer — Nair Learning Systems</b><div class="text-xs dim">Dashboard · Client workspace preview</div></div>
        <a class="btn btn-secondary btn-sm ml-auto" href="${LT(r,'apps/web/dashboard/')}">Open demo workspace</a>
      </div>
    </div>
  </div>
</div></section>
<section class="mkt-section" style="padding-top:24px"><div class="mkt-wrap">
  <div class="grid g3 gap-6">
    ${[['Submitted brief → quote in days','Briefs become line-item quotes with acceptance criteria — sign electronically in the portal.','send'],
       ['Milestones funded in escrow','Deposit, mid-project, final. Funds move when you approve work, never before.','card'],
       ['One auditable thread','Files, messages, decisions, and invoices share the same project timeline.','activity']]
      .map(([t,d,i])=>`<div class="mkt-card" style="padding:22px"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i,16)}</span><div class="h3 mt-4" style="font-size:16.5px">${t}</div><p class="text-sm muted mt-2" style="line-height:1.65">${d}</p></div>`).join('')}
  </div>
  <div class="mkt-card mt-6" style="padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
    <div><b class="h3">Looking for the marketing site?</b><p class="text-sm muted mt-1">nestlancer.com covers services, pricing, and the studio story.</p></div>
    <a class="btn btn-secondary" href="${LT(r,'apps/landing/')}">Visit nestlancer.com ${icon('external',13)}</a>
  </div>
</div></section>`,
  },

  // ------------------------------------------------------------- about
  {
    path: 'apps/web/about/', title: 'About · Nestlancer', active: 'about',
    body: (r) => `
${hero('ABOUT','The studio behind your Project Hub.','14 engineers, designers, and product leads in Hyderabad — shipping fixed-price platforms for clients across IN / US / GB / AE since 2019.')}
<div class="mkt-wrap" style="padding-bottom:72px">
  <div class="grid g3 gap-6 mb-8">
    ${[['Everything is auditable','Quotes, payments, approvals, and deploys all carry a history you can export.','file-check'],['Seniors on the account','No pod ships without a lead. Our median engineer has 8 years in.','user-check'],['India-built, tax-clean','GST invoices, Indian contracts, Razorpay escrow — enterprise paperwork, startup speed.','scale']]
      .map(([t,d,i])=>`<div class="mkt-card" style="padding:22px"><span class="avatar sq" style="width:36px;height:36px;border-radius:10px;background:var(--brand-2);color:var(--brand-11)">${icon(i,16)}</span><div class="h3 mt-4">${t}</div><p class="text-sm muted mt-2" style="line-height:1.65">${d}</p></div>`).join('')}
  </div>
  <div class="mkt-card" style="padding:26px 28px"><div class="grid g4 gap-6 text-center">
    ${[['2019','Founded'],['140+','Projects shipped'],['₹11Cr+','Client value delivered'],['34','Active accounts']].map(([v,l])=>`<div><div class="mono" style="font-size:28px;font-weight:700;color:var(--brand-11);letter-spacing:-.03em">${v}</div><div class="text-xs dim uppercase mt-1" style="letter-spacing:.1em">${l}</div></div>`).join('')}
  </div></div>
</div>`,
  },

  // ------------------------------------------------------------- work (2 variants: list + detail)
  {
    path: 'apps/web/work/', title: 'Work · Nestlancer', active: 'work',
    body: (r) => `
${hero('WORK','Selected engagements.','Every card below shipped under a fixed-price, milestone-gated contract — the same mechanics your account uses.')}
<div class="mkt-wrap" style="padding-bottom:72px">
  <div class="grid g3 gap-5">
    ${WORKS.map(w=>`
    <a href="${LT(r,'apps/web/portfolio/[id]/')}" class="mkt-card" style="overflow:hidden;display:block">
      ${cover(w.sector.toUpperCase()+' · '+w.date, w.v, 'padding-top:52%')}
      <div style="padding:18px">
        <div class="flex items-center justify-between"><div class="font-bold" style="font-size:15px;letter-spacing:-.02em">${w.t}</div><span class="mono text-xs dim">${w.date}</span></div>
        <div class="text-sm muted mt-2" style="line-height:1.55">${w.result}</div>
        <div class="flex gap-2 mt-3 flex-wrap">${w.tags.map(t=>`<span class="chip" style="height:22px;font-size:11px">${t}</span>`).join('')}</div>
      </div>
    </a>`).join('')}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- contact
  {
    path: 'apps/web/contact/', title: 'Contact · Nestlancer', active: 'contact',
    body: (r) => `
${hero('CONTACT','Talk to the studio.','New engagements, existing projects, or press — one inbox, triaged daily by operators.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="grid gap-8" style="grid-template-columns:7fr 5fr">
  <div class="mkt-card" style="padding:26px">
    <div class="grid g2 gap-4 mb-4">
      <div class="field"><label class="label">Your name <span class="req">*</span></label><input class="input" placeholder="Arjun Mehta"></div>
      <div class="field"><label class="label">Email <span class="req">*</span></label><input class="input" placeholder="arjun@company.com"></div>
    </div>
    <div class="grid g2 gap-4 mb-4">
      <div class="field"><label class="label">Company</label><input class="input" placeholder="Mehta Consulting Group"></div>
      <div class="field"><label class="label">Topic</label><select class="select"><option>New project inquiry</option><option>Existing project</option><option>Partnership</option><option>Press</option></select></div>
    </div>
    <div class="field mb-4"><label class="label">Message <span class="req">*</span></label><textarea class="textarea" rows="5" placeholder="What should we know before replying?"></textarea></div>
    <div class="flex items-center gap-3"><button class="btn btn-primary">Send message ${icon('send',14)}</button><span class="text-xs dim">Replies within 1 business day</span></div>
  </div>
  <div class="flex-col gap-5">
    ${panel({title:'Response times', body:`<dl class="kv"><dt>New inquiries</dt><dd>&lt; 24h</dd><dt>Client threads</dt><dd>&lt; 2h on workdays</dd><dt>Production defects</dt><dd>24h SLA (care plans)</dd></dl>`})}
    ${note('info','info','Clients get faster answers inside <b>Project Hub messaging</b> — the public inbox is for everyone else.')}
    ${panel({title:'Prefer the portal?', sub:'Already a client?', body:`<a class="btn btn-secondary w-full" href="${LT(r,'apps/web/login/')}">Sign in to message us</a>`})}
  </div>
</div></div>`,
  },

  // ------------------------------------------------------------- portfolio
  {
    path: 'apps/web/portfolio/', title: 'Portfolio · Nestlancer', active: 'work',
    body: (r) => `
${hero('PORTFOLIO','Case studies with receipts.','Filter by sector. Metrics are client-approved; engagement letters available under NDA.')}
<div class="mkt-wrap" style="padding-bottom:72px">
  <div class="flex gap-2 mb-7 flex-wrap">${['All','Fintech','SaaS','Retail','HealthTech','Logistics','Education'].map((c,i)=>`<span class="chip${i===0?' active':''}">${c}</span>`).join('')}</div>
  <div class="grid g3 gap-5">
    ${WORKS.map(w=>`
    <a href="${LT(r,'apps/web/portfolio/[id]/')}" class="mkt-card" style="overflow:hidden;display:block">
      ${cover(w.sector.toUpperCase()+' · '+w.date, w.v, 'padding-top:52%')}
      <div style="padding:18px">
        <div class="font-bold" style="font-size:15px;letter-spacing:-.02em">${w.t}</div>
        <div class="text-sm muted mt-2" style="line-height:1.55">${w.result}</div>
        <div class="text-xs dim mono mt-3 uppercase" style="letter-spacing:.08em">${w.tags.join(' · ')}</div>
      </div>
    </a>`).join('')}
  </div>
</div>`,
  },

  {
    path: 'apps/web/portfolio/[id]/', title: 'Fintech Payments Hub · Nestlancer', active: 'work',
    body: (r) => `
<section style="padding:44px 0 24px"><div class="mkt-wrap">
  <div class="mkt-eyebrow mb-3"><span class="dot"></span>PORTFOLIO · FINTECH · 2026</div>
  <h1 class="h1">Fintech Payments Hub</h1>
  <p class="lead mt-4" style="max-width:56ch">One reconciliation ledger for a lending firm drowning in settlement spreadsheets. 14 weeks, fixed price, 30/40/30 milestones.</p>
</div></section>
<div class="mkt-wrap" style="padding-bottom:72px">
  ${cover('FINTECH PAYMENTS HUB',1,'padding-top:34%;margin-bottom:24px')}
  <div class="grid g4 gap-5 mb-8">
    ${[['42%','fewer settlement errors'],['₹6.2Cr','reconciled monthly'],['11 days','UAT → production'],['0','findings in last audit']].map(([v,l])=>`<div class="mkt-card text-center" style="padding:18px"><div class="mono" style="font-size:24px;font-weight:700;color:var(--brand-11)">${v}</div><div class="text-xs dim uppercase mt-1" style="letter-spacing:.08em">${l}</div></div>`).join('')}
  </div>
  <div class="prose" style="max-width:70ch">
    <h2>Outcome</h2>
    <p>Settlement day went from a three-person spreadsheet recon to a queue where mismatches surface in four minutes with suggested resolutions. The CFO signs off day-end summaries from her phone.</p>
    <p>Delivered under NL-CTR-2026-000031 with a 30-day defect window; the client renewed on a care retainer.</p>
  </div>
  <a class="btn btn-primary btn-lg mt-6" href="${LT(r,'apps/web/contact/')}">Start a similar project ${icon('arrow-right',15)}</a>
</div>`,
  },

  // ------------------------------------------------------------- blog
  {
    path: 'apps/web/blog/', title: 'Blog · Nestlancer', active: 'blog',
    body: (r) => `
${hero('NESTLANCER JOURNAL','Latest articles','Hiring playbooks, engineering deep-dives, and studio insights — filtered by category.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="blog-layout">
  ${blogRail(r,'All articles')}
  <div class="min-w-0">
    <a href="${LT(r,'apps/web/blog/[slug]/')}" class="mkt-card" style="overflow:hidden;display:block;margin-bottom:22px">
      ${cover('FEATURED',6,'padding-top:28%')}
      <div style="padding:22px">
        <span class="badge tone-warning mb-2">Featured</span>
        <div class="h3 mt-2" style="font-size:19px">${POSTS[0].t}</div>
        <p class="text-sm muted mt-2" style="line-height:1.6">${POSTS[0].excerpt}</p>
        <div class="flex items-center justify-between mt-3 text-xs dim"><span>Nestlancer Editorial</span><span class="mono">${POSTS[0].min} min read · 4 views</span></div>
      </div>
    </a>
    <div class="grid g3 gap-4">${POSTS.slice(1,10).map((p,i)=>postCard(r,p,i)).join('')}</div>
    <div class="flex items-center justify-center gap-2 mt-8">
      <span class="page-cur">1</span>${[2,3,4,5,6,7].map(n=>`<span class="btn btn-ghost btn-sm mono">${n}</span>`).join('')}<span class="btn btn-ghost btn-sm">Next ${icon('chevron-right',12)}</span>
    </div>
  </div>
  <aside>
    ${panel({title:'Ready to start a project?', sub:'Create a client account and submit your brief to the Nestlancer studio.', body:`<a class="btn btn-primary w-full" href="${LT(r,'apps/web/contact/')}">Contact us ${icon('arrow-right',13)}</a>`})}
    <div class="mt-6"><h5 class="rail-title">Reading now</h5>
    ${POSTS.slice(0,4).map(p=>`<a class="rail-link" href="${LT(r,'apps/web/blog/[slug]/')}"><span class="truncate" style="max-width:180px">${p.t}</span></a>`).join('')}</div>
    ${note('success','check-circle','<b>Stay in the loop.</b> Get practical playbooks on hiring, delivery, and growing your practice — sparingly.')}
  </aside>
</div></div>`,
  },

  {
    path: 'apps/web/blog/[slug]/', title: 'Cutting Deploy Time from 45 Minutes to Five · Nestlancer Blog', active: 'blog',
    body: (r) => `
<section style="padding:48px 0 24px"><div class="mkt-wrap" style="max-width:880px">
  <a href="${LT(r,'apps/web/blog/')}" class="link-arrow mb-4" style="font-size:12.5px">${icon('arrow-left',13)} Blog</a>
  <div class="eyebrow mb-3">CASE STUDIES · OCT 5, 2026</div>
  <h1 class="h1">Cutting Deploy Time from 45 Minutes to Five</h1>
  <div class="flex items-center gap-3 mt-5">
    <span class="avatar hue-2 lg">NE</span>
    <div><b style="font-size:13.5px">Nestlancer Editorial</b><div class="text-xs dim">8 min read · Engineering practice</div></div>
    <div class="ml-auto flex gap-2"><button class="btn-icon btn sm" title="Bookmark">${icon('bookmark',15)}</button><button class="btn-icon btn sm" title="Copy link">${icon('link',15)}</button></div>
  </div>
</div></section>
<div class="mkt-wrap" style="max-width:880px;padding-bottom:72px">
  ${cover('DEPLOY PIPELINE · BEFORE/AFTER',1,'padding-top:34%;margin-bottom:32px')}
  <div class="prose">
    <p>A 45-minute deploy is not a tooling problem — it is a feedback problem. Here is how we took a NestJS monolith from 45 minutes to five, in the order that actually mattered.</p>
    <h2>Profile before you optimize</h2>
    <p>19 minutes in dependency install, 14 compiling, 8 minutes building a Docker image containing the world, 4 rolling out. Optimizing rollout first would have saved nothing.</p>
    <div class="codeblk"><span class="c1"># the two lines that saved 19 minutes</span><br>- uses: actions/setup-node@v4<span class="c1"> # cache: pnpm</span><br>- run: pnpm fetch <span class="c1"># warm store; offline install after</span></div>
    <div class="pullquote">Ten engineers regained roughly eleven hours of waiting — every single week.</div>
    <h2>Results after six weeks</h2>
    <ul class="dot-list"><li>Median deploy: <b>4m 40s</b> (p95: 6m 10s)</li><li>Deploys per week: 9 → 34</li><li>Change-failure rate: down 31%</li></ul>
    <p>Once deploys are cheap, review becomes the bottleneck — which is exactly where a senior team should spend its minutes.</p>
  </div>
  <div class="divider my-8"></div>
  <div class="grid g3 gap-4">${POSTS.slice(1,4).map((p,i)=>`
    <a class="mkt-card" style="padding:16px;display:block" href="${LT(r,'apps/web/blog/[slug]/')}">
    <div class="eyebrow" style="font-size:9.5px">${p.cat.toUpperCase()}</div>
    <b style="font-size:13px;line-height:1.4;display:block;margin-top:4px">${p.t}</b>
    <div class="text-xs dim mono mt-2">${p.min} min read</div></a>`).join('')}
  </div>
</div>`,
  },

  {
    path: 'apps/web/blog/category/[slug]/', title: 'Case studies · Nestlancer Blog', active: 'blog',
    body: (r) => `
${hero('CATEGORY','Case studies','Engineering and delivery write-ups from real Nestlancer engagements.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="blog-layout">
  ${blogRail(r,'Case Studies')}
  <div class="min-w-0" style="grid-column:span 2">
    <div class="flex gap-2 mb-5"><span class="chip active">${icon('folder',12)} Case Studies</span><span class="dim text-sm" style="align-self:center">26 articles</span></div>
    <div class="grid g3 gap-4">${POSTS.filter(p=>p.cat==='Case Studies').slice(0,9).map((p,i)=>postCard(r,p,i)).join('')}</div>
    <div class="flex items-center justify-center gap-2 mt-8"><span class="page-cur">1</span><span class="btn btn-ghost btn-sm mono">2</span><span class="btn btn-ghost btn-sm mono">3</span><span class="btn btn-ghost btn-sm">Next ${icon('chevron-right',12)}</span></div>
  </div>
</div></div>`,
  },

  {
    path: 'apps/web/blog/tag/[slug]/', title: 'Tag: deployment · Nestlancer Blog', active: 'blog',
    body: (r) => `
${hero('TAG','#deployment','Articles filed under a single tag across categories.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="blog-layout">
  ${blogRail(r,'')}
  <div class="min-w-0" style="grid-column:span 2">
    <div class="flex gap-2 mb-5"><span class="chip active">${icon('tag',12)} deployment</span><span class="chip">14 articles</span></div>
    <div class="grid g3 gap-4">${POSTS.slice(0,6).map((p,i)=>postCard(r,p,i)).join('')}</div>
  </div>
</div></div>`,
  },

  {
    path: 'apps/web/blog/bookmarks/', title: 'Bookmarks · Nestlancer Blog', active: 'blog',
    body: (r) => `
${hero('READING LIST','Your bookmarks','Saved articles sync to your client account. Saved locally when signed out.')}
<div class="mkt-wrap" style="padding-bottom:72px;max-width:860px">
  ${note('info','bookmark','<b>Signed-out mode.</b> These 2 bookmarks live in this browser. <a class="link" href="'+LT(r,'apps/web/login/')+'">Sign in</a> to sync them to your account.')}
  <div class="flex-col gap-4 mt-6">
    ${POSTS.slice(0,2).map((p,i)=>`
    <div class="mkt-card" style="padding:18px;display:flex;gap:16px;align-items:center">
      ${cover(p.cat.toUpperCase(),(i%6)+1,'width:120px;height:76px;flex-shrink:0')}
      <div class="min-w-0 flex-1">
        <div class="eyebrow" style="font-size:9.5px">${p.cat.toUpperCase()}</div>
        <b style="font-size:14px;letter-spacing:-.015em">${p.t}</b>
        <div class="text-xs dim mono mt-1">Saved Oct 9, 2026 · ${p.min} min read</div>
      </div>
      <a class="btn btn-secondary btn-sm" href="${LT(r,'apps/web/blog/[slug]/')}">Read</a>
      <button class="btn-icon btn sm" title="Remove">${icon('trash',14)}</button>
    </div>`).join('')}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- legal
  {
    path: 'apps/web/privacy/', title: 'Privacy Policy · Nestlancer', active: '',
    body: (r) => `
${hero('LEGAL','Privacy Policy','How Nestlancer Studio Private Limited collects, uses, and protects personal data.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="doc-layout">
  <aside class="panel" style="padding:12px;position:sticky;top:80px">
    ${['Who we are','Data we collect','How we use it','Payment data','Cookies','Your rights','Retention','Contact the DPO'].map(s=>`<a class="rail-link" href="#"><span>${s}</span></a>`).join('')}
  </aside>
  <div class="prose">
    <div class="mono text-xs dim mb-5 uppercase" style="letter-spacing:.1em">Last updated: October 5, 2026 · Version 3.2</div>
    <h2>Who we are</h2>
    <p>Nestlancer Studio Private Limited ("Nestlancer", "we") is a product studio registered in Hyderabad, India. This policy covers nestlancer.com, app.nestlancer.com, and admin.nestlancer.com.</p>
    <h2>Data we collect</h2>
    <ul class="dot-list"><li><b>Account data</b> — name, email, company, and credentials for client and operator accounts.</li><li><b>Project data</b> — briefs, quotes, files, messages, and approvals you place in the portal.</li><li><b>Payment metadata</b> — amounts, UTR references, and Razorpay order IDs. Card and UPI credentials are processed by Razorpay; we never see them.</li><li><b>Usage data</b> — pages visited, features used, and device/browser signatures used for security sessions.</li></ul>
    <h2>How we use it</h2>
    <p>Strictly to deliver contracted studio work: operating your Project Hub, issuing quotes and GST invoices, processing milestone payments, and preventing abuse. We do not sell personal data, and we do not run third-party ad trackers in the portal.</p>
    <h2>Payment data</h2>
    <p>Payments are processed by Razorpay under their PCI-DSS certification. Bank-transfer payments are reconciled against UTR references you submit; those references are stored as financial records for the period required by Indian tax law.</p>
    <h2>Your rights</h2>
    <p>You may export your account data (Settings → Account → Data export), correct it, or request deletion. Deletion schedules immediately and completes within 30 days unless an open payment or Indian retention law requires a longer hold.</p>
    <h2>Contact the DPO</h2>
    <p>privacy@nestlancer.com · Grievance officer response within 48 hours.</p>
  </div>
</div></div>`,
  },

  {
    path: 'apps/web/terms/', title: 'Terms of Service · Nestlancer', active: '',
    body: (r) => `
${hero('LEGAL','Terms of Service','The contract that governs the public site and the client portal.')}
<div class="mkt-wrap" style="padding-bottom:72px"><div class="doc-layout">
  <aside class="panel" style="padding:12px;position:sticky;top:80px">
    ${['Acceptance','Accounts','Quotes & payments','Delivery & acceptance','Intellectual property','Confidentiality','Liability','Governing law'].map(s=>`<a class="rail-link" href="#"><span>${s}</span></a>`).join('')}
  </aside>
  <div class="prose">
    <div class="mono text-xs dim mb-5 uppercase" style="letter-spacing:.1em">Last updated: October 5, 2026 · Version 3.2</div>
    <h2>1. Acceptance</h2><p>By creating an account or signing a quote you accept these terms. Individual quotes may add project-specific terms; where they conflict, the quote wins.</p>
    <h2>2. Accounts</h2><p>Client accounts are self-serve. Operator accounts are issued by Nestlancer and cannot be created from the public portal. You are responsible for credential hygiene; sessions are revocable under Settings → Security.</p>
    <h2>3. Quotes & payments</h2>
    <ul class="dot-list"><li>Quotes are fixed-price and valid for the period shown on them (typically 10 days).</li><li>Electronic acceptance signs the Nestlancer service agreement for that project.</li><li>Payments follow the milestone schedule in the quote; late payment may pause work.</li><li>Refunds for undelivered milestones are issued to the original rail within 7 business days.</li></ul>
    <h2>4. Delivery & acceptance</h2><p>Deliverables are accepted through the portal's approval gates. Silence for 10 business days after a delivery note counts as acceptance, unless the quote says otherwise.</p>
    <h2>5. Intellectual property</h2><p>On full payment, final deliverables transfer to you. Nestlancer retains ownership of pre-existing tools, libraries, and generic components.</p>
    <h2>6. Confidentiality</h2><p>Both parties keep non-public project information confidential for 3 years after project close.</p>
    <h2>7. Limitation of liability</h2><p>Aggregate liability is limited to fees paid under the relevant quote, except where law forbids such limitation.</p>
    <h2>8. Governing law</h2><p>These terms are governed by the laws of India; courts at Hyderabad have exclusive jurisdiction unless otherwise agreed in writing.</p>
  </div>
</div></div>`,
  },

  // ------------------------------------------------------------- verify
  {
    path: 'apps/web/verify/', title: 'Verify your email · Nestlancer', active: '',
    body: (r) => `
<section style="padding:72px 0"><div class="mkt-wrap" style="max-width:520px">
  <div class="mkt-card text-center" style="padding:34px 30px">
    <span class="avatar sq mx-auto" style="width:52px;height:52px;border-radius:14px;background:var(--brand-2);color:var(--brand-11)">${icon('mail',22)}</span>
    <h1 class="h2 mt-4">Verify your email</h1>
    <p class="text-sm muted mt-2" style="line-height:1.6">We sent a 6-digit code to <b>ananya.iyer@nestlancer.com</b>. Enter it below to activate your client account.</p>
    <div class="flex gap-2 justify-center mt-5 mb-4">
      ${['4','8','1','','',''].map((d,i)=>`<input class="input mono text-center" maxlength="1" style="width:52px;height:56px;font-size:22px;font-weight:600" value="${d}">`).join('')}
    </div>
    <button class="btn btn-primary w-full btn-lg">Verify email</button>
    <div class="text-xs dim mt-4">Code expires in 14:32 · <a class="link" href="#">Resend code</a></div>
    <div class="divider my-5"></div>
    <div class="text-xs dim">Wrong address? <a class="link" href="${LT(r,'apps/web/profile/edit/')}">Change email</a> · <a class="link" href="${LT(r,'apps/web/login/')}">Back to sign in</a></div>
  </div>
</div></section>`,
  },

  {
    path: 'apps/web/verify-document/', title: 'Verify Document · Nestlancer', active: '',
    body: (r) => `
${hero('TRUST','Verify a Nestlancer document','Every quote, contract, invoice, and receipt we issue carries a public reference. Paste it here to confirm it is genuine and unaltered.')}
<div class="mkt-wrap" style="padding-bottom:72px;max-width:760px">
  <div class="mkt-card mb-6" style="padding:24px">
    <div class="grid gap-4" style="grid-template-columns:1fr auto;align-items:end">
      <div class="field"><label class="label">Document reference</label><input class="input mono" placeholder="NL-INV-2026-000008" value="NL-INV-2026-000008"></div>
      <button class="btn btn-primary">${icon('shield-check',15)} Verify</button>
    </div>
    <div class="text-xs dim mt-3">References look like <span class="mono">NL-INV-2026-000008</span>, <span class="mono">NL-QTO-2026-000116</span>, or <span class="mono">NL-CTR-2026-000005</span> — printed in the document footer.</div>
  </div>
  <div class="panel mb-6" style="border-color:var(--t-success-bd)">
    <div class="panel-head" style="background:var(--t-success-bg);border-bottom-color:var(--t-success-bd)">
      <div class="flex items-center gap-3"><span class="avatar sq" style="background:#fff;color:var(--t-success-tx)">${icon('check-circle',18)}</span>
      <div><div class="panel-title" style="color:var(--t-success-tx)">Authentic · issued by Nestlancer</div><div class="panel-sub">Signature chain and content hash verified 41 seconds ago.</div></div></div>
      <span class="badge tone-success">Verified</span>
    </div>
    <div class="panel-body">
      ${`<dl class="dl">
<div><dt>Document</dt><dd>Tax Invoice NL-INV-2026-000008</dd></div>
<div><dt>Type</dt><dd>GST invoice (SAC 998314)</dd></div>
<div><dt>Issued to</dt><dd>Ananya Iyer — Iyer FinTech Solutions</dd></div>
<div><dt>Amount</dt><dd class="mono">₹14,400.00 (incl. 18% GST)</dd></div>
<div><dt>Issued</dt><dd>Oct 5, 2026, 3:49:13 AM IST</dd></div>
<div><dt>Status</dt><dd><span class="badge tone-success">Paid</span></dd></div>
</dl>`}
      <div class="mt-4 p-3 note" style="font-family:var(--font-mono);font-size:11px;word-break:break-all">SHA-256 · 3d9b227 to this document: <span class="brand-text">c30c44bfdec880fc176cfcee304fa9e782ff37b6c71ec26bf2a4ea48133ee9d1</span></div>
    </div>
  </div>
  <div class="grid g3 gap-5">
    ${[['1 · Find the reference','It lives in the footer of the PDF and in your portal under Billing → Invoices.','file-text'],['2 · We re-hash the file','The stored copy is hashed at issue; any tampering breaks verification.','lock'],['3 · Report mismatches','A failed check goes straight to a human auditor, not a log file.','flag']]
      .map(([t,d,i])=>`<div class="mkt-card" style="padding:18px"><span class="avatar sq" style="width:32px;height:32px;border-radius:9px;background:var(--brand-2);color:var(--brand-11)">${icon(i,14)}</span><b class="mt-3 block" style="font-size:13px">${t}</b><div class="text-xs muted mt-1" style="line-height:1.6">${d}</div></div>`).join('')}
  </div>
</div>`,
  },

  // ------------------------------------------------------------- share / impersonate
  {
    path: 'apps/web/share/[token]/', title: 'Shared quote · Nestlancer', active: '',
    body: (r) => `
<section style="padding:56px 0 72px"><div class="mkt-wrap" style="max-width:820px">
  <div class="flex items-center gap-3 mb-5"><span class="pill">${icon('lock',12)} Shared securely · read-only snapshot</span><span class="mono text-xs dim">Token sh_b18f7c…4d21 · expires Oct 19, 2026</span></div>
  <div class="mkt-card mb-5" style="overflow:hidden">
    <div style="padding:22px 26px;border-bottom:1px solid var(--paper-line)">
      <div class="eyebrow">QUOTE · NL-QTO-2026-000116</div>
      <div class="flex items-end justify-between mt-2 flex-wrap gap-3">
        <div><h1 class="h2">Website redesign — Patel Digital Agency</h1><div class="text-sm muted mt-1">Prepared by Nestlancer Studio · Oct 8, 2026 · valid until Oct 20, 2026</div></div>
        <span class="badge tone-warning">Awaiting signature</span>
      </div>
    </div>
    <div class="panel-body">
      ${table({cols:[{l:'Line item'},{l:'Qty',r:1},{l:'Amount',r:1}],rows:[
        ['Design system + 12 marketing pages','1','<span class="mono">₹2,40,000.00</span>'],
        ['CMS wiring + content migration','1','<span class="mono">₹90,000.00</span>'],
        ['Performance &amp; SEO pass','1','<span class="mono">₹60,000.00</span>'],
        ['<b>Subtotal</b>','','<span class="mono"><b>₹3,90,000.00</b></span>'],
        ['GST (18%)','18%','<span class="mono">₹70,200.00</span>'],
        ['<b>Total</b>','','<span class="mono text-lg"><b>₹4,60,200.00</b></span>'],
      ]})}
    </div>
    <div class="panel-foot flex items-center justify-between flex-wrap gap-3">
      <span class="text-xs dim">Schedule: 30% deposit · 40% mid · 30% final — Razorpay or bank transfer</span>
      <a class="btn btn-primary" href="${LT(r,'apps/web/register/')}">Accept in the portal ${icon('arrow-right',13)}</a>
    </div>
  </div>
  ${note('info','info','This is a snapshot shared by <b>Nestlancer Studio</b>. The live, signable version is in your client portal. Verify the reference at <a class="link" href="'+LT(r,'apps/web/verify-document/')+'">nestlancer.com/verify-document</a>.')}
</div></section>`,
  },

  {
    path: 'apps/web/impersonate/', title: 'Impersonation session · Nestlancer', active: '',
    body: (r) => `
<section style="padding:72px 0"><div class="mkt-wrap" style="max-width:560px">
  <div class="mkt-card" style="padding:30px;border-color:var(--t-warning-bd)">
    <div class="flex items-center gap-3 mb-4"><span class="avatar sq" style="width:44px;height:44px;border-radius:12px;background:var(--t-warning-bg);color:var(--t-warning-tx)">${icon('alert-triangle',20)}</span>
    <div><h1 class="h3">Operator impersonation</h1><div class="text-xs dim">You are viewing the portal as a client.</div></div></div>
    ${note('warn','shield','<b>Restricted session.</b> Form submissions, confirmations, payments, and account actions are disabled while impersonating. Every page view is written to the audit log.')}
    <div class="grid gap-3 mt-5" style="grid-template-columns:auto 1fr">
      <span class="text-xs dim">Operator</span><b style="font-size:13px">Riya Kapoor (admin)</b>
      <span class="text-xs dim">Viewing as</span><b style="font-size:13px">Priya Nair — Nair Learning Systems</b>
      <span class="text-xs dim">Started</span><b style="font-size:13px" class="mono">Oct 10, 2026, 8:12 AM IST</b>
      <span class="text-xs dim">Reason</span><b style="font-size:13px">Support ticket #4821 — "invoice PDF won't open"</b>
    </div>
    <div class="flex gap-2 mt-6">
      <a class="btn btn-primary" href="${LT(r,'apps/web/dashboard/')}">Continue to portal ${icon('arrow-right',13)}</a>
      <a class="btn btn-secondary" href="${LT(r,'apps/admin/users/[id]/')}">End session</a>
    </div>
    <div class="text-xs dim mt-4">Impersonation was granted by the account holder via support consent · Logged as IMPERSONATION_STARTED</div>
  </div>
</div></section>`,
  },
];
