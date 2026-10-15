# Nestlancer Proto — Visual Craft Prompt v3 (PAGE_REVIEW → A+)

**Filename:** `ai-prompt-v3.md`  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Prepared:** 16 October 2026  
**Pipeline position:** After `prompt-v2` / `prompt-v2.1` upgrades and the filled `PAGE_REVIEW.md` worksheet.

> **Why v3 exists:** v1/v2 produced a full `proto/` tree and a per-page review in `PAGE_REVIEW.md`. Most admin/client pages still sit at **Grade B (~80)** — clean but **dated workbench chrome**, forgettable craft. Stakeholders want **client + admin dashboards and app shells rebuilt to the creativity bar of modern ThemeWagon templates** ([Falcon Tailwind](https://prium.github.io/falcon-tailwind/v1.0.0/index.html) + [Phoenix React](https://phoenix-tailwind-react.prium.me/apps/events/create-an-event)), re-themed Nestlancer teal — not a Falcon skin clone. Auth pages were auto-scored **A / A+**, but stakeholders **reject that design** and want them treated as **Grade B** and redesigned. v3’s job is: **read the review, fix every non–A+ page (including auth), lift dashboards to Falcon/Phoenix-class craft, ship A+, commit, and push.**

> Preparing this file does **not** by itself redesign pages. Paste the **IMPLEMENTATION PROMPT** below into an agent session and say: **“Execute `ai-prompt-v3.md`. Upgrade `proto/` HTML to A+, update `PAGE_REVIEW.md`, commit, and push.”**

---

## Operator guide — read before running

1. Work in a clone of `nestlancer/frontend-ui-upgrade` with filesystem + git + preferably browser tools.
2. Do **not** re-run `prompt1.1.md` or rebuild `RANKING_REPORT.*` unless those files are missing and you need historical context. **Primary source of truth for v3 is `PAGE_REVIEW.md`.**
3. Use screenshots + OpenAPI only to preserve structure, density, and field meaning — not to freeze a mediocre look.
4. **Before redesigning client/admin:** open and study the Falcon + Phoenix reference URLs in §5A (browser preferred). Dashboard work without that study is incomplete.
5. Large scope (~175 HTML files). Use the progress ledger under `upgrade-v3/` and resume across turns. Partial honest progress beats fake “all A+”.
6. When the user authorizes push: commit upgraded `proto/` + review updates + this prompt’s ledgers, then `git push` to the tracking remote branch.
7. Do not treat shared CSS-only tweaks as “every page upgraded.” Substantive pages need visible composition / component / motion improvements.

### Snapshot facts (refresh if checkout moved)

Reviewed working tree facts at prompt prep:

| Fact | Value |
|---|---|
| Proto HTML (`**/index.html`) | **175** files |
| `PAGE_REVIEW.md` summary rows | **184** (some pages appear in more than one table) |
| Unique reviewed page names | **~175** |
| Grade mix (unique, last table wins) | **A+ ≈ 19** · **A ≈ 2** · **B ≈ 154** · **C ≈ 0** (after later tables) |
| Auth pages in review | Marked **A+ (96)** — **OVERRIDE TO B for v3** |
| Screenshots | `Nestlancer-admin-screenshots/`, `Nestlancer-clients-screenshots/`, `Nestlancer-public-screenshots/` |
| API contracts | `backend-api-swagger/*.openapi.json` (+ `docs.html`) |
| Shared assets | `proto/shared/assets/` (`proto.css`, `proto-motion.js`, `ui.js`, `studio.*`, `workbench.*`, `operator.*`, `public-flow.*`, `art/`) |

---

# IMPLEMENTATION PROMPT — START

## 1. Mission

You are principal product designer + senior HTML/CSS/JS engineer + motion designer + frontend QA.

**Upgrade every Nestlancer proto HTML page to visual-craft Grade A+ (≥95).** Keep mock/business data correct. Redesign surfaces that feel generic. **Especially redesign the entire auth family**, even though `PAGE_REVIEW.md` currently rates them A+. **Especially rebuild client + admin dashboards and app chrome** so they no longer look old — match the **density, hierarchy, widget craft, form polish, and navigation freshness** of Falcon / Phoenix (§5A), while staying Nestlancer-branded static HTML.

### Required outputs

1. Upgraded HTML under `proto/apps/landing/`, `proto/apps/web/`, `proto/apps/admin/`, and `proto/index.html` as needed.
2. Cohesive shared CSS/JS improvements in `proto/shared/assets/` (extend existing systems; do not invent a parallel app). Client/admin shell upgrades land primarily in `workbench.css` / `operator.css` / `operator.js` / `workbench.js` (+ HTML composition).
3. Updated `PAGE_REVIEW.md` summary tables + per-page cards (new grades, notes, status).
4. Progress ledger under `upgrade-v3/` (`PAGE_COVERAGE.csv`, `PROGRESS.md`, `REFERENCE_CONTRACT.md` with Falcon/Phoenix pattern IDs, optional evidence).
5. **Git commit + push** to the current branch’s remote when the authorized scope batch is deliverable (see §12).

### Authorization

- Execute only when the user asks to run / execute this prompt (or clearly asks to upgrade pages to A+ and push).
- Pushing is **authorized by this prompt** when the user invoked v3 with upgrade+push intent.
- Do not force-push, rewrite history, or skip hooks unless the user explicitly says so.
- Do not call production APIs or embed secrets from `resource.md`.

---

## 2. Repo map (do not invent structure)

```text
frontend-ui-upgrade/
├── PAGE_REVIEW.md                 ← PRIMARY review + target list
├── review.md                      ← grader/validator tool catalog (optional checks)
├── RANKING_REPORT.md|.csv         ← historical; secondary only
├── backend-api-swagger/           ← OpenAPI: field/entity truth for forms & tables
├── Nestlancer-admin-screenshots/  ← old Operator Console UI
├── Nestlancer-clients-screenshots/← old Client Portal UI
├── Nestlancer-public-screenshots/ ← old Public / Auth UI
└── proto/                         ← ONLY HTML tree to upgrade
    ├── index.html
    ├── apps/landing/              ← marketing + auth
    ├── apps/web/                  ← client portal
    ├── apps/admin/                ← operator console
    └── shared/assets/             ← CSS/JS/art
```

### Surfaces

| Surface | Paths | Feel | Jobs |
|---|---|---|---|
| Public / marketing | `proto/apps/landing/**` (non-auth) | Brand-first, atmospheric, one composition per viewport | home, about, services, pricing, portfolio, blog, contact, legal, verify |
| **Auth (P0 redesign)** | login, register, forgot-password, reset-password, verify-email, admin-login (+ related verify flows if they share the auth shell) | Distinctive Nestlancer access ritual — **not** the current split-rail template fatigue; may study Falcon Simple/Card/Split auth for form craft only | sign-in, sign-up, recovery, operator gate |
| **Client portal (Falcon/Phoenix bar)** | `proto/apps/web/**` | Modern SaaS portal: calm trust + Falcon-class KPI cards, toolbars, tables, forms; clear next action; money-readable | dashboard, requests, projects, quotes, messages, payments, invoices, settings, profile |
| **Admin (Falcon/Phoenix bar)** | `proto/apps/admin/**` | Modern operator console: Falcon/Phoenix density, sidebar/topbar chrome, stats, charts-ready panels, advanced tables, create/edit forms | dashboard, pipeline, requests, quotes, projects, payments, users, messages, media, system, … |

Brand: Nestlancer teal (`#0B7A71` family). No purple-indigo glow slop, no cream+terracotta cliché, no broadsheet hairline newspaper look. **Do not ship Falcon’s default blue/indigo skin or “falcon”/ThemeWagon branding** — translate layout craft only.

---

## 3. Instruction precedence

1. User’s latest explicit scope / stop / push instructions  
2. This file (`ai-prompt-v3.md`), including **§5A Falcon / Phoenix dashboard mandate**  
3. Actual files on disk + matching screenshots + OpenAPI field meaning  
4. `PAGE_REVIEW.md` grades and “Required fixes” — **except auth override (§5)**  
5. Older prompts (`prompt-v2.1.md`, `prompt-v2.md`, `prompt-v1.md`, `prompt1.1.md`) for KEEP/CHANGE and secondary research catalogs only  

---

## 4. Grade scale and ship bar

| Grade | Score | Meaning |
|---|---|---|
| F–D | &lt;70 | Broken / empty / unusable |
| C | 70–79 | Data OK, generic layout |
| B | 80–89 | Clean system, forgettable |
| A | 90–94 | Production-cohesive Nestlancer |
| **A+** | **≥95** | Memorable craft: hierarchy, atmosphere, micro-interactions — still trustworthy |

**Ship standard = A+ for every page in scope.** Do not stop at “health green” or “looks tidier.”

### Dimensions (score 1–10 each; used in PAGE_REVIEW)

Hierarchy · Density · Type · Brand/atmosphere · Motion · Responsive (390) · A11y/health · Components · Anti-slop

---

## 5. CRITICAL — Auth grade override

`PAGE_REVIEW.md` currently lists these as **✅ A+ / 96**. **For v3, treat them as ⚠️ Grade B / ~80 — redesign required:**

| Page | Path | Screenshot (if present) |
|---|---|---|
| Client login | `proto/apps/landing/login/index.html` | `Nestlancer-public-screenshots/public/006-login.webp` |
| Register / signup | `proto/apps/landing/register/index.html` | `.../010-register.webp` |
| Forgot password | `proto/apps/landing/forgot-password/index.html` | `.../005-forgot-password.webp` |
| Reset password | `proto/apps/landing/reset-password/index.html` | _ |
| Verify email | `proto/apps/landing/verify-email/index.html` | _ |
| Admin / operator login | `proto/apps/landing/admin-login/index.html` | `.../001-admin-login.webp` |

Also redesign any sibling that shares the same auth shell/classes (`auth-split`, `auth-rail`, `auth-v2`) if it still reads as the same template.

### Auth redesign goals (must change the feel)

1. **One cohesive access system** across login / signup / forgot / reset / verify / admin-login — shared tokens, but **role-distinct** (client vs operator).
2. **Brand-first first viewport:** Nestlancer mark + product name must dominate; headline must not overpower the brand.
3. **Not** another generic left-form / right-marketing-rail SaaS clone. Evolve or replace the split so it feels Nestlancer-specific (studio delivery OS).
4. Strong form craft: labels, focus, errors, password reveal, disabled/enabled submit, success/pending states.
5. Intentional motion (2–3 signatures for the auth family), with `prefers-reduced-motion` respect via existing `proto-motion.js` patterns.
6. 1440px + 390px: no clip, usable taps, stacked composition that still feels designed.
7. Keep all existing demo links, sample copy meanings, and prototype-only notes; do not invent live auth.

After redesign, update `PAGE_REVIEW.md` auth cards to honest new scores (target A+), and note that prior A+ was **revoked by stakeholder override**.

---

## 5A. CRITICAL — Falcon + Phoenix design mandate (client & admin)

Current Nestlancer **client** (`proto/apps/web/**`) and **admin** (`proto/apps/admin/**`) dashboards look **old** relative to modern ThemeWagon product UIs. v3 requires you to **study these live demos and rebuild Nestlancer app shells to that creativity bar** — translated into local static HTML/CSS/JS with Nestlancer teal identity and Nestlancer data.

### Mandatory reference URLs (open for real)

| # | Product | Role in v3 | URL |
|---|---|---|---|
| 1 | **Falcon Tailwind** (ThemeWagon / Prium) | Primary **dashboard + app chrome** north star: KPI cards, sidebar/topbar, notifications, tables, charts panels, e-commerce/CRM density, light/dark, auth variants | https://prium.github.io/falcon-tailwind/v1.0.0/index.html |
| 2 | **Phoenix React** (ThemeWagon / Prium) | Primary **create/edit form + app workflow** north star: polished multi-section forms, event/app create flows, modern spacing, control craft | https://phoenix-tailwind-react.prium.me/apps/events/create-an-event |
| 2b | Phoenix home (fallback) | If the events URL 404s or redirects, open the demo root and navigate to Apps → Events → Create (or closest create-form screen) | https://phoenix-tailwind-react.prium.me/ |

Also useful Falcon deep-links (study patterns; paths may shift — search the demo nav if a link 404s):

- Auth families: Simple / Card / Split under **Pages → Authentication** (login, register, forgot, reset, confirm mail, lock) — craft reference for Nestlancer auth, not a copy of Falcon copy/brand.
- App modules: Chat, Email inbox, E-commerce orders/customers, LMS, Management/SaaS dashboards — map to Nestlancer messages, payments, users, projects.
- Modules: Advance tables, form controls, floating labels, wizard, validation, charts widgets.

### What to steal (patterns) vs what to reject

**Steal / translate**

- Fresh vertical navbar + topbar composition (search, theme, notifications dropdown, account menu density).
- KPI / stat card rhythm (value, delta, sparkline/icon affordance) without fake metrics.
- Card + toolbar + filter + data-table stacks that feel 2024–2026, not flat 2018 admin.
- Create/edit multi-block forms (Phoenix events create): section grouping, sticky actions, clear primary CTA, upload/date/select polish.
- Soft elevation, restrained radius, readable tabular numbers, hover/selected row states.
- Light / dark readiness consistent with existing `data-theme` hooks.
- Micro-interactions: dropdowns, toasts, progress, skeleton/placeholder feel where Nestlancer already has states.

**Reject**

- Falcon/Phoenix logos, “falcon”, ThemeWagon purchase CTAs, demo product names (Raven Pro, Boots4, etc.).
- Shipping their default primary blue/indigo as Nestlancer brand.
- Copying React/Tailwind build — **no** installing Falcon/Phoenix packages. Hand-port selected CSS patterns into `workbench.css` / `operator.css` / page HTML.
- Emoji-heavy notification demo chrome; keep Nestlancer tone professional.
- Replacing Nestlancer IA with Falcon’s e-commerce/LMS nav — keep Nestlancer routes and labels; only upgrade visual/interaction craft.

### Mapping Nestlancer pages → reference screens

| Nestlancer target | Study first on Falcon / Phoenix |
|---|---|
| `web/dashboard`, `admin/dashboard` | Falcon default + Analytics / SaaS / Management dashboards |
| Lists (projects, requests, quotes, users, payments) | Falcon advance tables, order list, customer list |
| Detail pages | Falcon order/customer/course detail density |
| Messages / inbox | Falcon Chat + Email inbox |
| Create/edit (projects new, quotes new, requests, portfolio edit, system forms) | **Phoenix** create-an-event + Falcon wizards/forms |
| Settings / profile | Falcon User → Profile / Settings |
| Auth family | Falcon Simple / Card / Split auth (structure + control craft only) |

### Required evidence before coding client/admin batches

In `upgrade-v3/REFERENCE_CONTRACT.md` (and/or `upgrade-v3/FALCON_PHOENIX.md`), record for **each** batch:

```text
REF-ID | Exact URL opened | Status: FETCHED|VISUALLY_INSPECTED|BLOCKED
Pattern observed | Nestlancer adaptation | Target paths + selectors | Applied Y/N
```

Minimum before Phase 2/3 coding:

1. Visually inspect Falcon dashboard home (browser or fetch + describe honestly).  
2. Visually inspect Phoenix create-an-event (or fallback home → create form).  
3. List ≥8 concrete adaptations you will apply (sidebar, topbar, KPI row, table toolbar, form sections, empty state, dark mode token, one motion).  
4. Confirm Nestlancer teal tokens remain the brand source of truth.

A client/admin page that still reads as “old workbench with teal tweaks” **fails** the Falcon/Phoenix mandate even if spacing improved.

---

## 6. Work order (strict)

### Phase 0 — Baseline (short)

1. `git status` / branch / HEAD; list `proto/**/index.html` count.  
2. Parse `PAGE_REVIEW.md` summary tables → build `upgrade-v3/PAGE_COVERAGE.csv` with columns:

```text
page_path,surface,page_family,review_grade,review_score,effective_grade,status,html_changed,notes
```

3. Set `effective_grade = B` for all auth override pages even if `review_grade = A+`.  
4. Sort work queue: **P0 auth → Falcon/Phoenix shell + dashboards → remaining B/A client/admin → polish fragile A+ marketing → root hub**.  
5. Read OpenAPI files relevant to the batch (e.g. `auth.openapi.json` before auth forms) so labels/fields stay coherent.  
6. Complete §5A reference evidence (Falcon + Phoenix) before Phase 2/3.

### Phase 1 — P0 Auth redesign (complete before mass admin)

Finish the full auth family to A+ with browser checks at 1440 and 390. Update shared auth CSS in `studio.css` / `public-flow.css` / new scoped `auth-v3` layer if needed — wire it from the auth HTML files. Falcon Simple/Card/Split auth may inform control layout; Nestlancer brand + copy stay.

### Phase 2 — Client portal B → A+ (Falcon/Phoenix craft)

**Goal:** `proto/apps/web/**` must stop looking like an old portal. Match Falcon dashboard freshness + Phoenix form craft.

Prioritize:

1. Shared client shell (`workbench.css` / sidebar / topbar / KPI primitives) — Falcon-inspired, Nestlancer-themed  
2. `web/dashboard` (flagship — must pass “not old” side-by-side vs Falcon home)  
3. Projects / requests / quotes list+detail  
4. Messages (inbox already A — raise to A+; lift siblings toward Falcon chat/email density)  
5. Payments / invoices  
6. Profile / settings / notifications  
7. Create/edit flows — study Phoenix create-an-event for sectioning and actions  

Prefer shared shell upgrades + selective HTML composition. Still rewrite HTML where the page is structurally generic.

### Phase 3 — Admin B/A → A+ (Falcon/Phoenix craft)

**Goal:** `proto/apps/admin/**` must feel like a modern operator console (Falcon Management/SaaS/CRM class), not a dated workbench.

1. Shared admin shell (`operator.css` / sidebar / topbar / table toolbar)  
2. `admin/dashboard` (A → A+) and `admin/index.html` — Falcon analytics/SaaS density  
3. Pipeline / requests / quotes / projects  
4. Payments family  
5. Users / messages / media / content / portfolio  
6. System / analytics / audit / integrations / api-keys / moderation / notifications / profile  
7. Heavy create/edit (quotes new, portfolio edit, content posts) — Phoenix form patterns  

Dense tables stay dense — elevate hierarchy, toolbar craft, empty/loading/selected states, and one signature motion per major family. No marketing beams on every grid; Falcon’s widget polish is the bar.

### Phase 4 — Public leftovers + root

Legal (`terms`, `privacy`), verify utilities, `proto/index.html` hub, and any marketing page that fails a fresh visual pass.

### Phase 5 — Review doc + ship

Update `PAGE_REVIEW.md` statuses/grades/scores and progress tracker. Write `upgrade-v3/PROGRESS.md`. Commit and push (§12).

---

## 7. KEEP / CHANGE

### KEEP

- Route paths and filenames (including `[id]`, `[slug]`, concrete UUID demo routes).  
- Business/mock data: amounts, IDs, names, dates, statuses, percentages, table row meanings.  
- Prototype FAB / theme toggle / demo notes where already present (may restyle).  
- Existing shared runtime hooks that pages already call — extend rather than rip out.  
- Nestlancer logo paths / teal identity.

### CHANGE

- Visual composition, type scale, atmosphere, spacing rhythm.  
- Auth shell and marketing of access (mandatory).  
- **Client + admin dashboards and shells** — mandatory lift to Falcon/Phoenix creativity (§5A); current look is considered outdated.  
- Generic workbench sameness on client/admin pages.  
- Weak motion (same fade everywhere) → purposeful choreography.  
- Broken 390px layouts, missing focus/labels, empty states that look unfinished.  
- `PAGE_REVIEW.md` grades after real upgrades.

### DO NOT

- Replace the static proto with a new React/Next app.  
- Install Falcon, Phoenix, shadcn, Magic UI, or Aceternity as packages; **study and translate** patterns into local HTML/CSS/JS.  
- Copy Falcon/Phoenix branding, demo datasets, or default blue/indigo theme.  
- Delete “duplicate” routes to shrink scope.  
- Fabricate testimonials, metrics, or logos.  
- Claim A+ on dashboards without Falcon/Phoenix side-by-side study notes in the ledger.  
- Claim A+ without rendering the page.

---

## 8. Design direction (anti-slop)

Hard rules for visually led / public / auth work:

- First viewport = **one composition**, not a dashboard of widgets (unless the page is a dashboard).  
- Brand/name is a hero-level signal on public/auth.  
- Expressive purposeful type (existing Geist stack OK); avoid Inter/Roboto/Arial defaults.  
- Atmosphere via controlled gradients / artwork / patterns — not flat white SaaS.  
- Full-bleed hero only where the page is promotional; no random floating badge clutter on heroes.  
- Cards only when they contain interaction; strip decorative card chrome elsewhere.  
- One job per section.  
- Ship 2–3 intentional motions on redesigned families.  
- Avoid AI-default looks: purple-indigo gradients; cream+#terracotta serif kitsch; dense broadsheet zero-radius newspaper layouts; emoji garnish; glow soup.

Admin/client: **Falcon + Phoenix are the craft bar** (§5A). Apply hierarchy, widget polish, and form creativity without turning operator tables into marketing landing pages, and without shipping a ThemeWagon reskin.

---

## 9. Reference gate (compact, real)

Before the first visual batch:

1. **Mandatory:** Open/fetch Falcon + Phoenix URLs in §5A; write inspection notes.  
2. Run ≥4 additional live searches / fetches across form/auth UI, dashboard density, and motion if needed.  
3. Inspect Nestlancer screenshots for the batch (structure/data truth — not the visual ceiling).  
4. Write `upgrade-v3/REFERENCE_CONTRACT.md` with ≥8 concrete adaptations; **≥5 must cite Falcon or Phoenix** for any client/admin batch.  

Primary study targets (translate, don’t npm-install):

| Priority | Source | Use for |
|---|---|---|
| **P0** | [Falcon Tailwind demo](https://prium.github.io/falcon-tailwind/v1.0.0/index.html) | Admin/client dashboards, chrome, tables, widgets, auth variants |
| **P0** | [Phoenix create-an-event](https://phoenix-tailwind-react.prium.me/apps/events/create-an-event) (+ [Phoenix home](https://phoenix-tailwind-react.prium.me/) fallback) | Create/edit forms, app workflows |
| P1 | Uiverse / CodePen / shadcn patterns | Small controls, a11y behaviors |
| P1 | Magic UI / Aceternity | **Public/marketing only** — restrain on admin |
| P2 | Animista / GSAP thinking | Motion → CSS + `proto-motion.js` |

If Falcon/Phoenix are blocked, record `RESEARCH_BLOCKED` with the exact URL failure, try mirrors/nav alternatives, and ask the user before guessing ThemeWagon layouts from memory. Do not fake “inspired by Falcon” without evidence.

---

## 10. Verification gate (per page / family)

Mark `VERIFIED` only when:

1. Opened at **1440** and **390**.  
2. Self-scored ≥95 on the PAGE_REVIEW dimensions (honest).  
3. Auth/public: brand test passes (removing nav would still feel Nestlancer).  
4. **Client/admin:** page no longer reads as the old workbench; ledger cites Falcon/Phoenix patterns applied; Nestlancer teal (not Falcon blue) remains.  
5. No horizontal clip of primary content; focus visible; labels present.  
6. Mock data unchanged (spot-check IDs/amounts).  
7. `PAGE_REVIEW.md` row/card updated.

Optional tools from `review.md` (PageSpeed, W3C, Nibbler mindset) may inform notes; they do not replace visual A+ judgment.

---

## 11. Progress ledger

Create/update:

| File | Role |
|---|---|
| `upgrade-v3/PAGE_COVERAGE.csv` | One row per HTML path |
| `upgrade-v3/PROGRESS.md` | Batch log, blockers, next paths |
| `upgrade-v3/REFERENCE_CONTRACT.md` | Patterns applied (must include Falcon/Phoenix IDs for app batches) |
| `upgrade-v3/FALCON_PHOENIX.md` | URL inspection log + Nestlancer mapping |
| `upgrade-v3/AUTH_REDESIGN.md` | Auth system notes (layout, tokens, states) |

Statuses: `NOT_STARTED` · `IN_PROGRESS` · `IMPLEMENTED_UNVERIFIED` · `VERIFIED` · `BLOCKED`

---

## 12. Git commit and push (required when user asked to ship)

When a deliverable batch is ready (at minimum: **auth family A+** + ledger updates; ideally full scope):

1. `git status` / `git diff` / `git log -5 --oneline`  
2. Stage relevant files only (`proto/`, `PAGE_REVIEW.md`, `upgrade-v3/`, `ai-prompt-v3.md`). Do **not** stage secrets.  
3. Commit with a concise why-focused message, e.g.:

```text
Raise proto visual craft to A+ from PAGE_REVIEW v3 queue

Redesign auth under stakeholder B-override; rebuild client/admin shells
to Falcon/Phoenix-class craft with Nestlancer teal; refresh PAGE_REVIEW.
```

4. `git push -u origin HEAD` (or push the current tracking branch).  
5. Report the commit SHA and remote URL / branch.  

If push fails (auth/network), leave the commit local and report exact next command for the user.

Do **not** push incomplete “plan only” turns. Do push when HTML upgrades for the claimed batch exist.

---

## 13. Final response format

```text
STATUS: COMPLETE / PARTIAL / BLOCKED

Scope delivered:
- Auth pages redesigned: Y/N (list)
- Falcon/Phoenix study logged: Y/N (URLs)
- Client/admin dashboards no longer “old”: Y/N (flagship paths)
- HTML substantively edited: N / total
- Shared assets touched:
- PAGE_REVIEW updated: Y/N

Grade movement:
- Auth effective B → new grades
- Client B→A+ count
- Admin B→A+ count

Git:
- Branch:
- Commit:
- Pushed: Y/N (remote URL)

Ledger paths:
- upgrade-v3/...

NEXT (if partial):
- Exact paths for next turn
```

Claim **COMPLETE** only if every in-scope HTML has effective grade A+ and `PAGE_REVIEW.md` reflects that (auth override resolved by real redesign).

---

## 14. Begin

1. Inventory + `PAGE_COVERAGE.csv` with auth override.  
2. Open Falcon + Phoenix (§5A); write `FALCON_PHOENIX.md` + Reference Contract.  
3. Redesign auth family → verify → update review.  
4. Rebuild client shell + `web/dashboard`, then client lane batches.  
5. Rebuild admin shell + `admin/dashboard`, then admin lane batches.  
6. Public leftovers + root hub.  
7. Final review pass + commit + push.

# IMPLEMENTATION PROMPT — END

---

## Resume instruction

> Continue executing `ai-prompt-v3.md`. Read `upgrade-v3/PROGRESS.md`, `PAGE_COVERAGE.csv`, and `FALCON_PHOENIX.md`. Keep finished VERIFIED pages. Re-apply the **auth grade override** until those pages are truly redesigned to A+. For client/admin, keep the **Falcon + Phoenix craft mandate** until dashboards no longer look old. Implement the next unfinished paths, update `PAGE_REVIEW.md`, then commit and push when the batch is real.

---

## Prompt-prep note

This prompt was written by reading `PAGE_REVIEW.md`, sampling auth/client HTML under `proto/`, confirming screenshot + `backend-api-swagger/` layout, and incorporating stakeholder design north stars: [Falcon Tailwind](https://prium.github.io/falcon-tailwind/v1.0.0/index.html) and [Phoenix create-an-event](https://phoenix-tailwind-react.prium.me/apps/events/create-an-event). It did **not** execute the full A+ upgrade. The implementing agent must perform Falcon/Phoenix study, redesign, verification, commit, and push.
)
