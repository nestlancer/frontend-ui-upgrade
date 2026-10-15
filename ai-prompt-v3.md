# Nestlancer Proto — Visual Craft Prompt v3 (PAGE_REVIEW → A+)

**Filename:** `ai-prompt-v3.md`  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Prepared:** 16 October 2026  
**Pipeline position:** After `prompt-v2` / `prompt-v2.1` upgrades and the filled `PAGE_REVIEW.md` worksheet.

> **Why v3 exists:** v1/v2 produced a full `proto/` tree and a per-page review in `PAGE_REVIEW.md`. Most admin/client pages still sit at **Grade B (~80)** — clean workbench chrome, forgettable craft. Auth pages were auto-scored **A / A+**, but stakeholders **reject that design** and want them treated as **Grade B** and redesigned. v3’s job is: **read the review, fix every non–A+ page (including auth), ship A+ craft, commit, and push.**

> Preparing this file does **not** by itself redesign pages. Paste the **IMPLEMENTATION PROMPT** below into an agent session and say: **“Execute `ai-prompt-v3.md`. Upgrade `proto/` HTML to A+, update `PAGE_REVIEW.md`, commit, and push.”**

---

## Operator guide — read before running

1. Work in a clone of `nestlancer/frontend-ui-upgrade` with filesystem + git + preferably browser tools.
2. Do **not** re-run `prompt1.1.md` or rebuild `RANKING_REPORT.*` unless those files are missing and you need historical context. **Primary source of truth for v3 is `PAGE_REVIEW.md`.**
3. Use screenshots + OpenAPI only to preserve structure, density, and field meaning — not to freeze a mediocre look.
4. Large scope (~175 HTML files). Use the progress ledger under `upgrade-v3/` and resume across turns. Partial honest progress beats fake “all A+”.
5. When the user authorizes push: commit upgraded `proto/` + review updates + this prompt’s ledgers, then `git push` to the tracking remote branch.
6. Do not treat shared CSS-only tweaks as “every page upgraded.” Substantive pages need visible composition / component / motion improvements.

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

**Upgrade every Nestlancer proto HTML page to visual-craft Grade A+ (≥95).** Keep mock/business data correct. Redesign surfaces that feel generic. **Especially redesign the entire auth family**, even though `PAGE_REVIEW.md` currently rates them A+.

### Required outputs

1. Upgraded HTML under `proto/apps/landing/`, `proto/apps/web/`, `proto/apps/admin/`, and `proto/index.html` as needed.
2. Cohesive shared CSS/JS improvements in `proto/shared/assets/` (extend existing systems; do not invent a parallel app).
3. Updated `PAGE_REVIEW.md` summary tables + per-page cards (new grades, notes, status).
4. Progress ledger under `upgrade-v3/` (`PAGE_COVERAGE.csv`, `PROGRESS.md`, optional evidence).
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
| **Auth (P0 redesign)** | login, register, forgot-password, reset-password, verify-email, admin-login (+ related verify flows if they share the auth shell) | Distinctive Nestlancer access ritual — **not** the current split-rail template fatigue | sign-in, sign-up, recovery, operator gate |
| Client portal | `proto/apps/web/**` | Calm trust, clear next action, money-readable | dashboard, requests, projects, quotes, messages, payments, invoices, settings, profile |
| Admin | `proto/apps/admin/**` | Dense precise command center | dashboard, pipeline, requests, quotes, projects, payments, users, messages, media, system, … |

Brand: Nestlancer teal (`#0B7A71` family). No purple-indigo glow slop, no cream+terracotta cliché, no broadsheet hairline newspaper look.

---

## 3. Instruction precedence

1. User’s latest explicit scope / stop / push instructions  
2. This file (`ai-prompt-v3.md`)  
3. Actual files on disk + matching screenshots + OpenAPI field meaning  
4. `PAGE_REVIEW.md` grades and “Required fixes” — **except auth override below**  
5. Older prompts (`prompt-v2.1.md`, `prompt-v2.md`, `prompt-v1.md`, `prompt1.1.md`) for KEEP/CHANGE and research catalogs only  

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

## 6. Work order (strict)

### Phase 0 — Baseline (short)

1. `git status` / branch / HEAD; list `proto/**/index.html` count.  
2. Parse `PAGE_REVIEW.md` summary tables → build `upgrade-v3/PAGE_COVERAGE.csv` with columns:

```text
page_path,surface,page_family,review_grade,review_score,effective_grade,status,html_changed,notes
```

3. Set `effective_grade = B` for all auth override pages even if `review_grade = A+`.  
4. Sort work queue: **P0 auth → remaining B/A → polish any fragile A+ marketing pages → root hub**.  
5. Read OpenAPI files relevant to the batch (e.g. `auth.openapi.json` before auth forms) so labels/fields stay coherent.

### Phase 1 — P0 Auth redesign (complete before mass admin)

Finish the full auth family to A+ with browser checks at 1440 and 390. Update shared auth CSS in `studio.css` / `public-flow.css` / new scoped `auth-v3` layer if needed — wire it from the auth HTML files.

### Phase 2 — Client portal B → A+

Prioritize high-traffic shells first, then variants:

1. `web/dashboard`  
2. Projects / requests / quotes list+detail  
3. Messages (inbox already A — raise to A+; lift siblings)  
4. Payments / invoices  
5. Profile / settings / notifications  

Prefer improving shared `workbench.css` + selective HTML composition over 150 one-off skins. Still touch HTML where the page is structurally generic.

### Phase 3 — Admin B/A → A+

1. `admin/dashboard` (A → A+) and `admin/index.html`  
2. Pipeline / requests / quotes / projects  
3. Payments family  
4. Users / messages / media / content / portfolio  
5. System / analytics / audit / integrations / api-keys / moderation / notifications / profile  

Dense tables stay dense — elevate hierarchy, toolbar craft, empty/loading/selected states, and one signature motion per major family — not marketing beams on every grid.

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
- Generic workbench sameness on client/admin pages.  
- Weak motion (same fade everywhere) → purposeful choreography.  
- Broken 390px layouts, missing focus/labels, empty states that look unfinished.  
- `PAGE_REVIEW.md` grades after real upgrades.

### DO NOT

- Replace the static proto with a new React/Next app.  
- Install shadcn/Magic UI/Aceternity as packages; **study and translate** patterns into local HTML/CSS/JS.  
- Delete “duplicate” routes to shrink scope.  
- Fabricate testimonials, metrics, or logos.  
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

Admin/client: apply the spirit (hierarchy, anti-generic, motion restraint) without turning operator tables into marketing landing pages.

---

## 9. Reference gate (compact, real)

Before the first visual batch:

1. Run ≥4 live searches / fetches across form/auth UI, dashboard density, and motion.  
2. Inspect Nestlancer screenshots for the batch.  
3. Write `upgrade-v3/REFERENCE_CONTRACT.md` with ≥5 concrete pattern adaptations (source → selector → what changed).  

Suggested study targets (translate, don’t npm-install): Uiverse / CodePen forms, shadcn form+table behavior, Magic UI / Aceternity **public** ideas (restrain on admin), Animista / GSAP thinking → CSS + `proto-motion.js`.

If network is blocked, record `RESEARCH_BLOCKED` and proceed with screenshot-driven Nestlancer-specific craft — do not fake citations.

---

## 10. Verification gate (per page / family)

Mark `VERIFIED` only when:

1. Opened at **1440** and **390**.  
2. Self-scored ≥95 on the PAGE_REVIEW dimensions (honest).  
3. Auth/public: brand test passes (removing nav would still feel Nestlancer).  
4. No horizontal clip of primary content; focus visible; labels present.  
5. Mock data unchanged (spot-check IDs/amounts).  
6. `PAGE_REVIEW.md` row/card updated.

Optional tools from `review.md` (PageSpeed, W3C, Nibbler mindset) may inform notes; they do not replace visual A+ judgment.

---

## 11. Progress ledger

Create/update:

| File | Role |
|---|---|
| `upgrade-v3/PAGE_COVERAGE.csv` | One row per HTML path |
| `upgrade-v3/PROGRESS.md` | Batch log, blockers, next paths |
| `upgrade-v3/REFERENCE_CONTRACT.md` | Patterns applied |
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

Redesign auth family under stakeholder B-override and lift client/admin
B-grade workbench pages; refresh PAGE_REVIEW grades and v3 ledger.
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
2. Reference contract.  
3. Redesign auth family → verify → update review.  
4. Client lane batches → Admin lane batches → public leftovers.  
5. Final review pass + commit + push.

# IMPLEMENTATION PROMPT — END

---

## Resume instruction

> Continue executing `ai-prompt-v3.md`. Read `upgrade-v3/PROGRESS.md` and `PAGE_COVERAGE.csv`. Keep finished VERIFIED pages. Re-apply the **auth grade override** until those pages are truly redesigned to A+. Implement the next unfinished paths, update `PAGE_REVIEW.md`, then commit and push when the batch is real.

---

## Prompt-prep note

This prompt was written by reading `PAGE_REVIEW.md`, sampling auth/client HTML under `proto/`, and confirming screenshot + `backend-api-swagger/` layout. It did **not** execute the full A+ upgrade. The implementing agent must perform research, redesign, verification, commit, and push.
)
