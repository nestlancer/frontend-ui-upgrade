# Nestlancer Proto UI Upgrade — Master Agent Prompt (v2)

> **Why v2 exists:** `prompt-v1.md` listed reference sites (CodePen, Uiverse, Magic UI, Aceternity, GSAP, etc.) but agents treated them as optional reading and shipped generic SaaS chrome. Mock data stayed correct; **visual craft stayed ~Grade C**.  
> v2 makes reference study **mandatory**, requires a written **Reference Contract** before CSS, raises the bar to **A+** for UI / design / creativity / animation, and forces a **screenshot critique loop**.
>
> **Arena Agent Mode update:** Agents often do real work only inside an **isolated bash/sandbox** and never sync files into the **session User Workspace** (right-hand panel → Download ZIP / `/download-workspace`). That wastes the whole run. v2 now treats **workspace delivery** as a hard completion gate (≈**128 MB** user workspace budget).
>
> **Ranking prerequisite (prompt 1.1):** Run `prompt1.1.md` first. It rates every screenshot in the 3 dirs against proto HTML (using graders/validators from `review.md`) and writes `RANKING_REPORT.md` + `RANKING_REPORT.csv` with per-page **A+ recommendations**. v2 must **read that report** and upgrade in **P0→P4 batch order** — not random pages.

**Pipeline:** `review.md` tools → **`prompt1.1.md` (rank)** → **`prompt-v2.md` (upgrade to A+)**.  
**Where to run:** [Arena Agent Mode](https://arena.ai/agent) (also works in Cursor). Paste everything below the line.

---

```
# ============================================================
# NESTLANCER PROTO UI UPGRADE — MASTER AGENT PROMPT (v2)
# Target: A+ visual craft on every proto HTML page
# Data: KEEP. Design / motion / interface: UPGRADE hard.
# Runtime: Arena.ai Agent Mode (user workspace = downloadable)
# Prerequisite: prompt1.1 → RANKING_REPORT.md (+ .csv)
# ============================================================

## 0B) RANKING REPORT GATE (FROM prompt1.1.md) — READ BEFORE DESIGN

You must **not** start Phase R / CSS upgrades until you have a ranking report.

### Required inputs (User Workspace)
| File | Role |
|---|---|
| `RANKING_REPORT.md` | Full ranks, tool scores, per-page A+ recommendation cards |
| `RANKING_REPORT.csv` | Machine table: rank, grades, batch, short actions |
| `RANKING_PRIORITY_BATCHES.md` | Optional P0–P4 lists |
| `review.md` | Tool catalog that 1.1 used (HubSpot, Nibbler, W3C, PageSpeed, Capian/Marker mindset, etc.) |
| `prompt1.1.md` | How the ranking was produced — follow its grade bands |

If these files are **missing**:
1. STOP upgrading.
2. Tell the user to run `prompt1.1.md` first, OR run prompt 1.1 yourself in this session and write the report into User Workspace, THEN continue v2.
3. Do not invent ranks from memory.

### How to use the ranking report
1. Open `RANKING_REPORT.md` § Headline + § Recommended batches.
2. Work **strictly** in batch order: **P0 (F) → P1 (D) → P2 (C) → P3 (B) → P4 (A polish)**.
3. For each page you touch, copy its **A+ Recommendations** card into your plan — those actions are the checklist; Phase R supplies visual references to execute them.
4. After upgrading a page, update a local note: old `Grade_html` → expected new grade (target **A+ ≥95**).
5. Prefer shared `proto.css` / motion fixes listed in report § Systemic A+ playbook before one-off page hacks.
6. Keep mock data sacred (report will say KEEP).

### Re-score mindset (light)
You are not re-running full 1.1, but before marking a page done, self-check against the same dimensions: hierarchy, density, type, brand/atmosphere, motion, 390px, a11y/health, component craft, anti-slop. If it would still score **C**, it is not done.

---

## 0A) ARENA.AI AGENT MODE — USER WORKSPACE DELIVERY (CRITICAL)

You are running in **Arena Agent Mode** (arena.ai/agent). Per Arena Help:
- The user recovers files from the **session Workspace** (right panel → **Download** ZIP), or by appending `/download-workspace` to the chat URL.
- With **no GitHub connected**, ONLY files that exist in the **session user workspace** are downloadable.
- You also have a **bash/sandbox** for testing. That sandbox is often **isolated**. Work left only there is **GONE** when the turn ends — the user cannot download it.

### The failure you must not cause
Agents commonly:
1. Clone / edit / “finish” the upgrade only under `/tmp`, `/home/...`, scratch dirs, or a private sandbox clone.
2. Print “done” in chat.
3. Leave the **User Workspace panel empty or stale**.
4. User downloads ZIP → **no upgraded HTML/CSS** → entire prompt run wasted.

### Hard rules (non-negotiable)
1. **User Workspace = source of truth for deliverables.** Every file the user must keep MUST exist in the downloadable session workspace before you claim completion.
2. **Edit in-place** on files already present in the user workspace when the user uploaded / mounted the Nestlancer tree. Prefer paths like:
   - `proto/apps/...`
   - `proto/shared/assets/proto.css`
   - `proto/shared/assets/proto-motion.js`
   - `tools/proto/UI_GRADE_REPORT.md` (read-only unless asked)
3. If you must use an isolated sandbox/tmp for experiments:
   - Treat it as **scratch only**.
   - When a file is “done”, **immediately copy/sync** it into the User Workspace tree (same relative paths).
   - Never end a turn with upgraded content only in scratch.
4. **After every batch (and before “done”):** run a **Workspace Sync Gate**:
   - `pwd` and identify the User Workspace root (often the cwd that mirrors uploaded files / the panel tree).
   - `ls` / `find` the upgraded paths under that root.
   - Print a **Deliverable Manifest** (paths + byte sizes) of files that WILL appear in Download ZIP.
   - If a file is missing from User Workspace, COPY it now — do not chat-apologize later.
5. **Do not claim the task complete** unless the Deliverable Manifest lists the real upgraded files in User Workspace. Chat-only HTML dumps do **not** count as delivery.
6. Prefer writing/updating files via the platform’s **file write tools** into the workspace, not only `cat` into sandbox-only paths.
7. If GitHub connector is ON: also commit/push/PR so Diff tab shows changes — AND still keep User Workspace files consistent when ZIP download is expected.

### 128 MB user workspace budget
- User workspace is small (~**128 MB**). Stay lean.
- DO NOT re-upload / re-copy huge screenshot trees, `node_modules`, full `.git` objects, browser caches, or duplicate entire repos “for convenience.”
- Prefer editing existing `proto/` HTML + shared CSS/JS only.
- If cloning the GitHub repo: shallow clone, then copy **only** needed `proto/` (+ shared assets) into User Workspace — or better, work directly on the uploaded workspace tree.
- Delete scratch clones/tmp trees after syncing deliverables.
- If approaching the limit: prioritize `proto/shared/assets/*` + highest-impact HTML pages; ship a clear partial manifest rather than filling the workspace with junk.

### Required end-of-turn block (print every time you stop)
```
## WORKSPACE DELIVERY CHECK
User workspace root: <path>
Synced this turn: YES/NO
Deliverable files (path — size):
- ...
Download expectation: These files MUST appear in Arena Workspace panel / Download ZIP.
Scratch-only leftovers cleaned: YES/NO
Approx workspace use: <estimate> / 128MB
```

A run with great design talk but an empty Download ZIP is a **FAILED** run.

---

## 0) FAILURE MODE YOU MUST NOT REPEAT

Previous pass (prompt-v1) failed because:
1. Reference URLs were listed but NEVER opened, studied, or applied.
2. Output looked like “safe SaaS template + teal accents” — Grade C craft.
3. Motion existed as light CSS classes but not as designed choreography borrowed from real inspiration libraries.
4. Agents optimized for “looks cleaned up” instead of “portfolio-grade / Awwwards-adjacent product UI.”
5. **(Arena)** Agents finished work in an isolated sandbox and never updated the downloadable User Workspace.
6. **(Order)** Agents upgraded random pages without a ranking report, so worst screens never got A+ recommendations applied.

### v2 non-negotiable
- You MAY NOT design-upgrade until **§0B Ranking Report Gate** passes (`RANKING_REPORT.md` from `prompt1.1.md`).
- You MAY NOT edit visual CSS/HTML until you complete **Phase R (Reference Gate)** and print a **Reference Contract**.
- Listing a URL without fetching it does NOT count.
- If you cannot fetch a site, say so, use WebSearch snippets + known patterns from that library, and still name the exact pattern borrowed.
- Every upgraded screen must cite ≥3 concrete patterns applied (site → component → what you copied: motion / surface / hierarchy / interaction).
- Follow ranking **P0→P4** order and each page’s **A+ recommendation card**.
- You MAY NOT mark the task complete until **§0A Workspace Sync Gate** passes (Deliverable Manifest in User Workspace).

---

## 1) ROLE & QUALITY BAR

You are:
1. Principal product designer (SaaS admin + client portal + marketing)
2. Senior frontend engineer (semantic HTML, modern CSS, restrained JS)
3. Motion designer (choreography with timing, easing, stagger — not decoration)
4. Design director who rejects AI-slop and Grade-C “cleaned Bootstrap”

### Grade scale for THIS job (visual craft — independent of data fidelity)
| Grade | Meaning |
|---|---|
| F–D | Broken / empty / unusable |
| C | Data correct, layout OK, looks generic — **CURRENT STATE TO ESCAPE** |
| B | Clean system, still forgettable |
| A | Production Nestlancer — distinct, cohesive, responsive, intentional motion |
| **A+** | Memorable craft: reference-informed surfaces, hierarchy, micro-interactions, atmosphere — still readable & trustworthy |

**Ship standard = A+.** Do not stop at “health checklist green.”

Mock/user data is already correct. Do **not** change it. Spend your budget on UI, interface, design creativity, and animation.

---

## 2) REPO FACTS (DO NOT INVENT STRUCTURE)

Repo: `https://github.com/nestlancer/frontend-ui-upgrade.git` clone it and fix its html files

### Screenshots (structure + density truth)
- `Nestlancer-admin-screenshots/` → Operator Console
- `Nestlancer-clients-screenshots/` → Client Portal
- `Nestlancer-public-screenshots/` → Public / marketing / auth

### HTML to upgrade (ONLY `proto/` — never mock dirs)
- `proto/apps/admin/`
- `proto/apps/web/`
- `proto/apps/landing/`
- Shared: `proto/shared/assets/proto.css`, `proto-motion.js`, `ui.js`

### Briefs (priority order)
1. **`RANKING_REPORT.md` + `RANKING_REPORT.csv`** ← from `prompt1.1.md` (PRIMARY work order + A+ actions)
2. `RANKING_PRIORITY_BATCHES.md` if present
3. `tools/proto/UI_GRADE_REPORT.md` — secondary fidelity/health history
4. `tools/proto/DATA_AUDIT.md` — content notes
5. `review.md` — grader/validator tool list used in ranking
6. `prompt1.1.md` — ranking method / rubric
7. `prompt-v1.md` — KEEP/CHANGE + shells only (references superseded by v2 Phase R)

### Surfaces
| Surface | Path | Feel | Jobs |
|---|---|---|---|
| Admin | `proto/apps/admin` | Dense, precise command center | pipeline, requests, quotes, projects, payments, users, messages, moderation, analytics, content, media, system |
| Client | `proto/apps/web` portal pages | Calm, low-training trust | projects, milestones, files, messages, invoices/payments, notifications, profile |
| Public | `proto/apps/landing` + auth/marketing in web | Brand-first, atmospheric | homepage, about, services, pricing, portfolio, blog, contact, login/register |

Brand: Nestlancer teal (`#0B7A71` family). Evolve — never purple-indigo glow slop.

Existing motion runtime: `proto-motion.js` + PASS 2 layer in `proto.css` (`.reveal`, `.stagger`, `html.nl-motion`). **Extend and elevate** this system; do not rip it out for random CDN spam.

---

## 3) PHASE R — REFERENCE GATE (MANDATORY BEFORE ANY DESIGN EDIT)

### 3.1 You must actually use these libraries

#### Category A — Code snippets & inspiration (fetch / search live)
| # | Site | URL | Steal for |
|---|---|---|---|
| 1 | CodePen | https://codepen.io | dashboard shells, chart hover, table row motion, auth cards |
| 2 | CodeMyUI | https://codemyui.com | practical CSS patterns, buttons, forms, nav |
| 3 | Uiverse.io | https://uiverse.io | buttons, inputs, cards, toggles, loaders (copy HTML/CSS recipes, re-theme) |
| 4 | Bootsnipp | https://bootsnipp.com | classic admin/table/form composition ideas |

#### Category B — CSS animation libraries (fetch / study patterns)
| # | Site | URL | Steal for |
|---|---|---|---|
| 1 | Animate.css | https://animate.style | named entrance vocab (adapt, don’t dump whole lib) |
| 2 | Animista | https://animista.net | exact keyframes + timing for one signature move |
| 3 | GSAP | https://gsap.com | timeline thinking; prefer CSS port unless JS timeline is justified |
| 4 | Hover.css | https://ianlunn.github.io/Hover | button/link hover recipes |
| 5 | AOS | https://michalsnik.github.io/aos | scroll-reveal philosophy → map to existing `.reveal` |
| 6 | LottieFiles | https://lottiefiles.com | optional empty/success moments — use sparingly |
| 7 | Magic Animations | https://minimamente.com/project/magic | punchy one-shot transitions |
| 8 | Keyframes.app | https://keyframes.app | craft custom keyframes with precise curves |

#### Category C — Modern UI systems / blocks
| # | Site | URL | Steal for |
|---|---|---|---|
| 1 | Magic UI | https://magicui.design | marquee, shimmer buttons, animated beams, bento, particles (restrain for admin) |
| 2 | UI Layout | https://ui-layout.com | layout blocks, galleries, progressive disclosure |
| 3 | shadcn/ui | https://ui.shadcn.com | density, focus rings, table/toolbar/dialog patterns |
| 4 | Aceternity UI | https://ui.aceternity.com | marketing heroes, cards, backgrounds, spotlight — public pages first |

#### Category D — Surface / color tools
| # | Site | URL | Steal for |
|---|---|---|---|
| 1 | CSS Gradient | https://cssgradient.io | canvas atmosphere for light/dark |
| 2 | Glassmorphism | https://glassmorphism.com | chrome glass tokens (sidebar/topbar/KPI only) |
| 3 | Neumorphism | https://neumorphism.io | use ONLY as soft inset wells for inputs/toggles — never full neo UI |

### 3.2 Required tool actions (do this for real)
Before editing CSS for a batch:
1. **WebSearch** at least 4 queries, e.g.:
   - `site:uiverse.io glass button teal dashboard`
   - `site:magicui.design bento grid dashboard`
   - `site:ui.aceternity.com background beams hero`
   - `CodePen saas admin dashboard sidebar glass 2025`
   - `Animista fade-up stagger entrance CSS`
2. **WebFetch** at least 3 live pages from Categories A–C (docs/examples, not just homepages).
3. Open 1–2 matching **Nestlancer screenshots** for the batch + current HTML.

### 3.3 Reference Contract (print BEFORE coding)

Use this exact template:

```
## Reference Contract — [batch name]
Date/context: ...

| Nestlancer UI piece | Source site | Exact pattern / component | Traits to copy | Traits to NOT copy | How adapted to Nestlancer teal |
|---|---|---|---|---|---|
| Primary button | Uiverse / Hover.css | … | shine, press scale, focus ring | neon purple | brand-8 fill |
| KPI cards | Magic UI / Glassmorphism | … | frosted edge, hover lift | heavy glow | opaque numbers |
| Table rows | shadcn / CodePen | … | hover wash, sticky head | zebra circus | --line tokens |
| Page entrance | Animista / AOS→.reveal | … | stagger 60–90ms | bounce spam | proto-motion |
| Marketing hero | Aceternity / CSS Gradient | … | mesh/spotlight atmosphere | particle overload | brand mesh |
| Sidebar active | CodeMyUI / CodePen | … | sliding indicator | emoji icons | existing SVG set |

Motion palette for this batch:
- Enter: … (ms, easing, stagger)
- Hover: … (ms)
- Signature: … (one only)
- Reduced motion: instant opacity / no transform

A+ definition for this batch (3 bullets):
1. …
2. …
3. …

Screens in batch: [paths]
```

**Hard gate:** If the Reference Contract table has fewer than 5 rows, you are not allowed to edit files yet.

---

## 4) KEEP vs CHANGE

### KEEP (sacred)
- All mock/business data: names, emails, ₹ amounts, IDs, UTRs, counts, statuses, row text, dates, domain labels
- Routes, relative links, file paths under `proto/`
- Theme toggle behavior
- Skip links / correct ARIA
- Page purpose (don’t turn Payments into a blog)

### CHANGE (required for A+)
- Atmosphere (canvas gradients/mesh — not flat dead white/gray)
- Surface system (selective glass chrome + opaque data panels)
- Type hierarchy & optical rhythm
- Component craft (buttons, chips, inputs, tables, dialogs, empty states)
- Responsive behavior @390 and @1440
- Motion choreography via `proto.css` + `proto-motion.js`
- Missing dialog/tab/detail states called out in the grade report
- Anything that still “reads as Grade C template”

### Forbidden (anti-slop)
- Inter / Roboto / Arial as the design voice
- Purple→indigo glow themes; cream+terracotta brochure; newspaper broadsheet
- Glass under dense tables / small numerals
- Card spam, pill clusters, fake trophy metrics
- Dumping entire Animate.css / Magic UI kits unthemed
- Changing numbers/names “for prettier demo data”
- Declaring done after only spacing tweaks

---

## 5) A+ DESIGN SYSTEM CONTRACT (NESTLANCER 2030)

Prefer upgrading shared tokens once in `proto/shared/assets/proto.css`, then reuse.

### 5.1 Surfaces (selective glass — dashboard industry rule)
- **Canvas:** layered atmosphere (CSS gradients / quiet mesh). Use CSS Gradient + Aceternity-style backgrounds for public; quieter for admin.
- **Chrome** (sidebar, topbar, KPI shells): restrained glass  
  `backdrop-filter: blur(12–16px) saturate(150%+)` + light border + soft shadow  
  Always `-webkit-backdrop-filter` + `@supports` opaque fallback (Glassmorphism.com recipe).
- **Data panels** (tables, long forms, dense charts): **near-opaque** — numbers must stay crisp.
- Rule: **glass frames data; glass does not sit under data.**

### 5.2 Color & type
- Teal dominant + one sharp accent for primary CTAs only
- Neutrals for text ladder; semantic colors sparingly
- Light AND dark both designed
- Body ≥14px; badges/captions ≥11px
- One h1; real h2/h3 section titles matching screenshot panels
- Keep Geist family unless a deliberate reference-driven pairing is documented in the Contract

### 5.3 Layout recipes
**Admin:** sidebar + topbar → page head (title + primary) → KPI/filters → content. Bento for command center. Sticky table headers. Row actions.
**Client:** “what’s happening / what needs me / what’s next” — milestones, files, messages, invoices calm and obvious.
**Public:** brand-first hero (brand + 1 headline + 1 line + CTA group + dominant visual). One job per section. Aceternity/Magic UI energy allowed here more than in admin.

### 5.4 Motion spec (must be designed, not accidental)

Build on `proto-motion.js` / `.reveal` / `.stagger`.

| Layer | Spec | Inspiration |
|---|---|---|
| Page enter | First-viewport blocks stagger 60–90ms; ease-out; opacity+translateY(8–14px); max delay ~700ms | AOS / Animista / Animate.css fade-up |
| Stagger children | KPI tiles, table rows (`--i` / `--ri`), list items | Magic UI / GSAP timeline thinking |
| Hover | 140–180ms ease-out; lift 1–2px OR background wash; buttons press scale ~0.98 | Hover.css / Uiverse |
| Focus | Visible ring using brand; never `outline: none` without replacement | shadcn |
| Signature (1 per page) | e.g. CTA shine, sidebar active glide, chart draw, live pulse on non-zero attention | Keyframes.app / Magic Animations |
| Charts | Line draw / area rise / bar grow / donut sweep already in motion runtime — ensure markup triggers them | GSAP mental model |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` + existing `nl-still` path — no transforms |

Do **not** animate `backdrop-filter` on scroll. Do **not** autoplay loud Lottie on every page.

### 5.5 Component states
Every control: default · hover · focus-visible · active · disabled · loading · empty · error.  
Touch targets ≥44px on mobile.

### 5.6 Accessibility
WCAG AA contrast; labeled inputs; keyboard dialogs; reduced motion respected.

---

## 6) COMPONENT ←→ REFERENCE MAP (APPLY LITERALLY)

When upgrading, pick from this map (or better finds from Phase R) and name them in the Contract:

| Component | Prefer studying | A+ craft goal |
|---|---|---|
| Buttons / CTA | Uiverse, Hover.css, Magic UI shimmer (public) | Press depth, shine once, focus ring, no purple |
| Inputs / selects | shadcn, CodeMyUI, soft inset from Neumorphism (subtle) | Clear focus, error, success |
| KPI / stat cards | Magic UI bento, Glassmorphism demos, CodePen | Glass shell, opaque value, hover lift |
| Tables | shadcn data-table patterns, Bootsnipp/CodePen admin tables | Sticky head, row hover, compact actions, 390 scroll-inside |
| Sidebar / nav | CodePen dashboards, UI Layout | Active indicator motion, section labels, counts |
| Dialogs / sheets | shadcn dialog, Animista dialog-in | Overlay blur light, enter animation, focus trap if present |
| Empty / loading | Uiverse loaders, Lottie (rare), skeleton shimmer in proto.css | Helpful empty, not blank void |
| Marketing hero | Aceternity, Magic UI, CSS Gradient | Atmosphere + brand hierarchy |
| Auth card | Uiverse cards, Aceternity subtle bg | Focused form, trust, no clutter |
| Charts | CodePen chart CSS/SVG, GSAP draw ideas | Motion via existing chart hooks |
| Toasts / badges | Animate.css / Magic Animations (one-shot) | Status readable ≥11px |

---

## 7) EXECUTION WORKFLOW

### Phase 0 — Orient + ranking gate
1. Confirm `RANKING_REPORT.md` / `.csv` exist in User Workspace (§0B). If missing → run `prompt1.1.md` or stop.
2. Read ranking Headline, Systemic playbook, and **P0 batch file list**.
3. Skim `proto/shared/assets/proto.css` + `proto-motion.js`.
4. Open one high-ranked HTML (A/A+) AND one P0 (F) page + their screenshots — feel the gap.
5. Read Phase R fully.

### Phase R — Reference Gate (per batch from ranking)
Complete §3 searches/fetches + print Reference Contract (≥5 rows).  
Map Contract rows to the **A+ Recommendations** on the ranking cards for this batch.

### Phase 1 — Shared craft upgrade (do early — from ranking § Systemic playbook)
Upgrade `proto.css` / motion helpers so ALL pages inherit A+ primitives:
- richer canvas tokens (light/dark)
- glass chrome utilities + opaque data panel utilities
- button/input/chip/table/toolbar polish inspired by Contract
- stronger `.reveal` / stagger / hover / signature keyframes
- 390px table/sidebar behaviors
- type floors (≥11 / ≥14)
- Any systemic items listed in `RANKING_REPORT.md`

### Phase 2 — Screen batches (from RANKING_REPORT only)
Order: **P0 → P1 → P2 → P3 → P4** from the ranking report (not random, not only old UI_GRADE_REPORT).
For each page in the batch:
1. Read that page’s **A+ recommendation card** in `RANKING_REPORT.md`
2. Screenshot + HTML side-by-side
3. Apply Contract patterns to execute those recommendations
4. KEEP all mock strings/values
5. Build missing states if match=parent / ranking says so
6. Self-QA 1440 + 390 against ranking dimensions
7. **Screenshot critique loop** (below)
8. Tick the recommendation checklist; note old Grade_html → expected A+

### Phase 3 — Screenshot critique loop (mandatory)
If browser / DevTools / screenshot tools exist:
1. Capture page at **1440px** and **390px**
2. Critique as a harsh design director:
   - hierarchy, spacing rhythm, type scale, alignment
   - “does this look like Uiverse/Magic/Aceternity craft or Grade C template?”
   - motion: is entrance choreography visible? are hovers dead?
3. Fix issues
4. Repeat until you would put it in a portfolio (max 3 loops, then report leftovers)

If no browser tool: open HTML files, reason from computed structure, and still run a written critique against the Contract.

### Phase 4 — Done gates (ALL must pass)
- [ ] `RANKING_REPORT.md` was read; this batch matches its P0–P4 list
- [ ] Each upgraded page’s ranking **A+ recommendation** items addressed (or explicitly deferred with reason)
- [ ] Reference Contract filed this batch (≥5 patterned rows)
- [ ] ≥3 named reference applications visible in the CSS/HTML diff
- [ ] Mock data unchanged (spot-check ₹, names, statuses)
- [ ] No text < 11px; body ≥ 14px
- [ ] No page-level horizontal overflow at 390px
- [ ] Primary action obvious where needed
- [ ] h1 + section headings on multi-panel pages
- [ ] Selective glass only on chrome/KPIs; tables opaque
- [ ] Entrance + hover + one signature motion working (or reduced-motion safe skip)
- [ ] Light/dark still coherent
- [ ] Looks **A+** (would rescore ≥95 on prompt1.1 rubric), not “tidy C”
- [ ] **§0A WORKSPACE DELIVERY CHECK printed** — Deliverable Manifest lists real paths in User Workspace
- [ ] Scratch/tmp-only copies synced or deleted; Download ZIP would contain the upgrades
- [ ] Workspace size still sane under ~128 MB (no node_modules / full screenshot dumps)

---

## 8) SESSION I/O FORMAT

### Start of session
1. Confirm `RANKING_REPORT.md` present (or run prompt1.1 first)
2. Batch name = ranking batch id (e.g. **P0**) + area
3. Confirm User Workspace root path (where Download ZIP will come from)
4. Paste the ranking A+ recommendation bullets for files in this batch
5. Files you will touch **inside that workspace**
6. Phase R Reference Contract (full table)
7. A+ definition for this batch (target rescore ≥95)

### Mid / after each file batch
- Sync any sandbox edits → User Workspace immediately
- Quick `ls` proof that paths exist in User Workspace
- Check off ranking recommendation items per file

### End of session
1. Files changed (User Workspace paths only)
2. Per screen: ranking Grade_html before → expected after; reference patterns landed
3. Critique loop notes (what looked C, what became A+)
4. **WORKSPACE DELIVERY CHECK** block (§0A) — mandatory
5. Remaining P-batches from ranking report
6. Next batch = next P# from `RANKING_REPORT.md`

### Refusal rules
- Do not invent a parallel app outside `proto/`
- Do not “finish” with only color variable tweaks
- Do not skip Phase R
- Do not skip / ignore `RANKING_REPORT.md` when it exists
- Do not replace teal identity with purple systems from Aceternity demos — **re-theme** patterns to Nestlancer
- Do not declare success if upgraded files exist only in isolated sandbox/tmp
- Do not fill the 128 MB workspace with clones, caches, or duplicate media

---

## 9) START COMMAND

Begin now:
1. Confirm: **data is fine; craft must reach A+; ranking report drives order.**
2. Confirm Arena rule: **User Workspace downloadable files = only deliverable that counts.**
3. Locate User Workspace; verify `RANKING_REPORT.md` + `.csv`. If missing → run `prompt1.1.md` (or stop and ask user).
4. Read ranking **P0** list + Systemic playbook.
5. Locate `proto/` tree; estimate free space vs ~128 MB.
6. Run Phase R for **P0 + shared system** (search Uiverse, Magic UI, Aceternity, Animista/GSAP, Glassmorphism, shadcn).
7. Print Reference Contract (≥5 rows) mapped to P0 recommendation cards.
8. Upgrade `proto/shared/assets/proto.css` (+ motion) **in User Workspace** per systemic playbook.
9. Upgrade every **P0** HTML page listed in the ranking report (or as many as context allows), executing each card’s A+ actions.
10. Screenshot critique loop; self-check would-rescore ≥95.
11. Print **WORKSPACE DELIVERY CHECK** with Deliverable Manifest.
12. Keep every mock data value intact.

If context is limited: finish systemic CSS + at least the worst **3 P0 pages** synced to User Workspace, then stop with next-P0 remainder listed from the ranking CSV.
```

---

## How to use (operator notes)

### Full pipeline
1. Run **`prompt1.1.md`** → download `RANKING_REPORT.md` + `RANKING_REPORT.csv`.
2. Put reports in the workspace/repo root (or `tools/proto/`).
3. Run **`prompt-v2.md`** → agent upgrades P0→P4 using recommendation cards + design references.
4. Re-run prompt1.1 later (optional) to verify grades moved to A+.

### On Arena Agent Mode (arena.ai/agent)
1. Upload lean set: `proto/`, ranking reports, `prompt-v2.md`, screenshots only as needed for the batch — stay under ~128 MB.
2. Paste the fenced master prompt.
3. Watch the **Workspace** panel. If files never appear/update: *“Sync deliverables to User Workspace now — sandbox-only does not count.”*
4. Download ZIP (or `/download-workspace`) when finished.

### General
1. Do **not** skip ranking gate or Phase R.
2. Batches come from the ranking report, not guesswork.
3. v1 KEEP/CHANGE still applies; v2 adds Reference Gate + A+ bar + critique loop + Arena delivery + **prompt1.1 ranking dependency**.

## What v2 fixes vs v1

| v1 weakness | v2 fix |
|---|---|
| URLs listed as optional inspiration | **Mandatory fetch/search + Reference Contract gate** |
| Stopped at “clean / healthy” ~C | Explicit **A+ craft bar** + portfolio critique |
| Motion mentioned vaguely | **Timing table** wired to `proto-motion.js` |
| No proof references were used | Diff must show **≥3 named pattern applications** |
| No visual feedback loop | **Screenshot critique loop** at 1440 / 390 |
| Arena sandbox work lost (empty Download ZIP) | **§0A User Workspace Sync Gate + Deliverable Manifest + 128 MB budget** |
| Random page order / vague “fix UI” | **`prompt1.1` RANKING_REPORT → P0–P4 + per-page A+ action cards** |
