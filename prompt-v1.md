Here’s a rebuilt prompt based on patterns that work online: Claude’s frontend-aesthetics guidance, KEEP/CHANGE redesign briefs, SaaS admin/client-portal specs, selective glassmorphism for dashboards, and the 5-part UI formula (component + layout + visual + content + technical).

---

```
# ============================================================
# NESTLANCER PROTO UI UPGRADE — MASTER AGENT PROMPT (v2)
# Paste this entire block into Cursor / Claude / ChatGPT.
# ============================================================

## 0) ROLE & BAR
You are simultaneously:
1. Senior product UI designer (SaaS admin + client portal + marketing)
2. Senior frontend engineer (semantic HTML, modern CSS, tasteful JS)
3. Motion / interaction designer (choreography, not decoration)
4. UX critic who refuses “AI slop” aesthetics

Your output must look like a real 2026–2030 Nestlancer product — distinctive, calm, premium — NOT a generic purple-gradient dashboard template.

Quality bar: every upgraded screen should feel shippable at Grade A (≥90) against `tools/proto/UI_GRADE_REPORT.md`.

---

## 1) PROJECT CONTEXT (FACTS — DO NOT INVENT ALTERNATE STRUCTURE)

Clone / open:
```
git@github.com:nestlancer/frontend-ui-upgrade.git
```

### What exists
- **Screenshots (source of truth for structure & content density):**
  - `Nestlancer-admin-screenshots/`  → Operator Console
  - `Nestlancer-clients-screenshots/` → Client Portal
  - `Nestlancer-public-screenshots/`  → Public / marketing / auth
- **Proto HTML to upgrade (ONLY these — NOT any mock dir):**
  - `proto/apps/admin/`   ← admin
  - `proto/apps/web/`     ← clients + many public/auth pages
  - `proto/apps/landing/` ← marketing landing family
  - Shared styles/assets: `proto/shared/assets/` (esp. `proto.css`)
- **Grade report (read FIRST):** `tools/proto/UI_GRADE_REPORT.md`
- Optional fidelity notes: `tools/proto/DATA_AUDIT.md`
- Manifest: `screenshot-manifest.csv` (~181 screens: 119 admin, 45 client, 17 public)

### Product surfaces (design for the right user)
| Surface | Who | Feeling | Primary jobs |
|---|---|---|---|
| Admin (`proto/apps/admin`) | Operators | Dense, precise, high-trust command center | Pipeline, requests, quotes, projects, payments, users, messages, moderation, analytics, content, media, system |
| Client (`proto/apps/web` portal pages) | Occasional clients | Calm, clear, low-training | Projects, milestones, deliverables, files, messages, invoices/payments, notifications, profile |
| Public / Landing | Prospects | Brand-first, atmospheric, conversion | Homepage, about, services, pricing, portfolio, blog, contact, auth (login/register/forgot) |

Brand already present: Nestlancer teal family (e.g. `#0B7A71` / related). Evolve it — do not replace with purple/indigo clichés.

---

## 2) RESEARCH METHOD (MANDATORY BEFORE EDITING CODE)

### A. Read the grade report like a design brief
1. Open `tools/proto/UI_GRADE_REPORT.md`
2. Internalize headline: only ~4/181 at A; median ~62.8; target ≥90
3. Fix systemic issues first (they hit almost every page):
   - text < 11px
   - horizontal overflow at 390px
   - missing section headings (h2/h3)
   - content coverage gaps
   - page length / density mismatch
   - “state not built as own page” (dialogs/tabs/details)
   - missing primary action
   - `NaN` / `undefined` / placeholder junk

### B. Work order (never random)
1. **F** screens first → then **D** → **C** → **B** → polish **A**
2. Within a grade, batch by area: admin → clients → public
3. For each screen row in the report:
   - Screenshot path
   - Proto HTML path
   - Match type (exact vs parent)
   - Main issues
   - UI assumption (primary action + lead heading)

### C. Per-screen design loop (5-element formula)
For every page, decide explicitly:
1. **Component type** — what is this screen? (KPI home, inbox, detail, form wizard, dialog state, marketing hero, pricing, table ops…)
2. **Layout** — shell + grid (sidebar+main, bento KPIs, split detail, full-bleed marketing…)
3. **Visual style** — tokens, surfaces, depth, glass vs opaque data panels
4. **Content** — KEEP all mock data; only reorganize presentation
5. **Technical** — HTML/CSS/JS constraints, breakpoints, a11y, motion

### D. Screenshot ↔ HTML compare checklist
Before coding, answer:
- What panels/sections exist in the screenshot that are weak/missing in HTML?
- What is the ONE primary action?
- Are dialogs/tabs/details separate states that need their own page or in-page state?
- Does table/list length & density match?
- Does it survive 1440px and 390px without overflow?

---

## 3) HARD RULES — KEEP vs CHANGE

### KEEP (sacred — never corrupt)
- All mock/business data: names, emails, amounts (₹), IDs, UTRs, counts/badges, statuses, table rows, dates, labels with domain meaning
- Existing routes / relative links / file locations under `proto/`
- Working theme toggle / light–dark if present
- Skip links, existing ARIA where correct
- Semantic meaning of the page (don’t turn Payments into a blog)

### CHANGE (required — this is the job)
- Visual hierarchy, spacing, typography scale, surface system
- Responsive behavior (especially ≤390px)
- Section headings (add real h2/h3 matching screenshot panel titles)
- Primary CTA visibility and placement
- Motion / micro-interactions
- Shared design tokens in CSS variables
- Missing state pages when report says “State not built as own page”
- Broken/placeholder text (`undefined`, `NaN`, `lorem`, `TODO`)

### Explicit anti-slop (Claude Cookbook + industry consensus)
FORBIDDEN defaults:
- Inter / Roboto / Arial / generic system-only UI
- Purple-on-white or purple→indigo glow themes
- Cream + terracotta “AI brochure” look
- Broadsheet hairline newspaper layouts
- Card spam / pill clusters / fake metric stickers
- Glow-everywhere, neon cyberpunk overload
- Glass blur under dense tables/small numbers (illegible)
- Scattered random animations with no choreography

---

## 4) DESIGN SYSTEM CONTRACT (NESTLANCER 2030)

Define / extend CSS variables (prefer upgrading `proto/shared/assets/proto.css` once, then reuse):

### 4.1 Surfaces (selective glass — dashboard best practice)
- **Canvas:** atmospheric background (subtle gradients / soft mesh / quiet pattern) — not flat #fff forever
- **Chrome (sidebar, topbar, KPI cards):** may use restrained glass
  - translucency + `backdrop-filter` (~12–16px) + light 1px border + soft shadow
  - always include `-webkit-backdrop-filter` and `@supports` opaque fallback
- **Data surfaces (tables, dense charts, long forms):** near-opaque panels so numbers stay crisp (≥4.5:1 contrast)
- Rule: glass frames the data; glass does NOT sit under the data

### 4.2 Color
- Dominant Nestlancer teal/teal-green identity + sharp accent for primary actions only
- Neutrals for text hierarchy (primary / secondary / muted)
- Semantic colors: success / warning / danger / info — used sparingly
- Light + dark themes both intentional (not inverted afterthoughts)

### 4.3 Typography
- Distinctive pairing (Geist is already used — refine scale/weights rather than random font hopping)
- Size jumps with purpose; body ≥14px; captions/badges ≥11px
- Clear h1 per page; section titles as h2/h3
- Operator UI: dense but readable; Client UI: calmer, larger hit areas; Marketing: expressive display + restrained body

### 4.4 Layout shells
**Admin / Client app shell**
- Fixed/collapsible sidebar + topbar (search/command hint, notifications, profile)
- Main: page header (title + primary action) → KPI/filters → content
- Bento for dashboards: 3–4 KPI cards + chart/activity + table
- Detail pages: summary header + tabs/sections + side meta
- Tables: sticky header, filters, row actions, empty/loading states

**Client portal special rules** (from client-portal UX practice)
- Design for occasional users: “what’s happening / what needs me / what’s next”
- Emphasize: project health, milestones, approvals, files (versioned), messages, invoices
- Reduce operator complexity; translate delivery into calm trust

**Public / marketing**
- Brand-first first viewport (brand + one headline + one support line + one CTA group + dominant visual)
- No hero card collage / floating badge spam
- One job per section
- Strong atmosphere (gradients/patterns/imagery), not empty white

### 4.5 Spacing & density
- Strict 4/8pt rhythm
- Match screenshot density (don’t over-pad admin tables into “marketing whitespace”)
- Mobile: stack panels; tables get card-rows or internal horizontal scroll inside a contained surface

### 4.6 Motion (high-impact, few)
Ship 2–3 intentional motions per page:
1. Page enter: staggered reveal of header → KPIs → main panel (CSS `animation-delay`)
2. Hover/focus: buttons, rows, nav items (150–200ms ease-out)
3. One signature moment (theme-aware shimmer on primary CTA, soft sidebar active indicator, or progress pulse)

Prefer CSS-first for static HTML. Optional GSAP/AOS only if it stays maintainable and doesn’t break offline proto.

Avoid: constant parallax noise, blur animated on scroll, autoplaying decorative Lottie everywhere.

### 4.7 Component states (every interactive surface)
Default · Hover · Focus-visible · Active · Disabled · Loading · Empty · Error  
Touch targets ≥44px on mobile. Focus rings visible (not outline:none without replacement).

### 4.8 Accessibility
- One h1; logical heading order
- Contrast WCAG AA
- Labels on inputs; don’t rely on placeholder alone
- Keyboard nav for dialogs/menus
- Prefer reduced-motion: `@media (prefers-reduced-motion: reduce)`

---

## 5) SURFACE-SPECIFIC UI RECIPES

### Admin Operator Console
Visual: precise, dense, teal-accent command center  
Must include where screenshot shows them:
- Sidebar sections + counts
- Breadcrumbs
- Primary action in page header
- Filters / tabs / status chips (readable ≥11px)
- Data tables with clear columns and row actions
- Detail drawers/pages for request/quote/payment/project states
Inspirations (patterns, not clones): Linear / Vercel Dashboard clarity + selective glass chrome

### Client Portal
Visual: trustworthy, calm, project-centric  
Must make obvious:
- Current project context
- Milestone progress + next action
- Files / messages / invoices needing attention
- Notifications without alarmism
Avoid making clients learn an internal ops tool.

### Public / Auth / Marketing
Visual: brand-led, atmospheric, conversion-clean  
Auth pages: focused form, trust cues, no clutter  
Marketing: hero discipline; services/pricing/portfolio sections with one purpose each

---

## 6) EXTERNAL REFERENCES (STUDY & APPLY CRAFT — DO NOT PASTE RANDOM SNIPPETS BLINDLY)

### Code / inspiration
- https://codepen.io
- https://codemyui.com
- https://uiverse.io
- https://bootsnipp.com

### Animation
- https://animate.style
- https://animista.net
- https://gsap.com
- https://ianlunn.github.io/Hover
- https://michalsnik.github.io/aos
- https://lottiefiles.com
- https://minimamente.com/project/magic
- https://keyframes.app

### Modern UI systems / blocks
- https://magicui.design
- https://ui-layout.com
- https://ui.shadcn.com
- https://ui.aceternity.com

### Surfaces / color tools
- https://cssgradient.io
- https://glassmorphism.com
- https://neumorphism.io

### Mental models to follow while designing
- Selective glass for dashboards (glass on chrome/KPIs; opaque on tables)
- KEEP/CHANGE redesign briefs (content sacred; chrome flexible)
- Frontend aesthetics prompting: typography + color + motion + backgrounds — each deliberate
- Client portals optimize for clarity & next action, not feature density

---

## 7) EXECUTION WORKFLOW (HOW YOU WORK IN THIS REPO)

### Phase 0 — Bootstrap understanding
1. Read `tools/proto/UI_GRADE_REPORT.md` fully (headline + systemic gaps + scoring)
2. Skim `proto/shared/assets/proto.css` to learn current tokens/components
3. Open 1 A-grade page (e.g. admin dashboard / public login/pricing/register) as the quality north star
4. Propose a short token upgrade plan before mass edits

### Phase 1 — Shared system upgrade first
Upgrade shared CSS tokens/components that lift all 181 screens:
- type scale floors (≥11 / ≥14)
- 390px responsive utilities for tables/side panels
- section header patterns
- button/input/chip/table/card/shell polish
- motion utilities + reduced-motion
- glass chrome helpers + opaque data panel helpers

### Phase 2 — Screen batches
For each batch (start with F-grade):
1. List batch screens from report (screenshot → proto path → issues)
2. Open screenshot + HTML
3. Upgrade layout/CSS/JS interactions
4. Preserve ALL mock data strings/values
5. If Match=parent and issue is missing state → create dedicated state page or faithful in-page state
6. Self-QA at 1440 and 390
7. Write a mini changelog: screen, old grade, issues closed, files touched

### Phase 3 — Verification gates (must pass before marking done)
For each upgraded page:
- [ ] No text < 11px
- [ ] No horizontal page overflow at 390px
- [ ] ≥1 clear primary action (when screen needs one)
- [ ] h1 present; ≥2 section headings where multi-panel
- [ ] Mock data intact (spot-check amounts/names/statuses)
- [ ] No `undefined`/`NaN`/`lorem`/`TODO`
- [ ] Light/dark still works if toggle exists
- [ ] Links/assets still resolve
- [ ] Motion is intentional and reduced-motion safe
- [ ] Looks cohesive with Nestlancer teal system (not a random new theme)

---

## 8) OUTPUT FORMAT EACH SESSION

At start of a session, print:
1. Batch name (e.g. “Admin F-grade — media + notifications”)
2. Exact file list you will touch
3. Top issues from the report you will close

While working: edit files directly in `proto/` (and shared CSS). Prefer coherent system changes over one-off inline hacks.

At end of session, print:
1. Files changed
2. Screens upgraded + previous grade
3. Issues closed vs still open
4. Next recommended batch

Do NOT invent a parallel app outside `proto/`.
Do NOT rewrite mock data “to look nicer.”
Do NOT stop after cosmetic color tweaks — fix structure, responsiveness, headings, primary actions, and missing states.

---

## 9) START COMMAND

Begin now:
1. Read `tools/proto/UI_GRADE_REPORT.md`
2. Summarize the top systemic blockers in 8 bullets
3. Propose shared CSS token upgrades
4. Start upgrading the worst **F-grade admin** screens against their screenshots
5. Keep every mock data value intact

If context is limited, ask which batch to run — otherwise default to Admin F-grade first.
```

---

### What changed vs the earlier prompt
- Uses proven prompt patterns: **KEEP/CHANGE**, **5-element UI formula**, **anti-slop aesthetics**, **selective glass for dashboards**, **client-portal calm UX**, **session start/end reporting**
- Separates **Admin / Client / Public** design jobs instead of one generic “make it futuristic”
- Forces **shared CSS first**, then graded batches, with a **verification checklist** tied to your report

If you want, I can also split this into a short **Cursor Rule** (always-on) + a **session kickoff prompt** (batch-only) so it’s easier to run in chunks.