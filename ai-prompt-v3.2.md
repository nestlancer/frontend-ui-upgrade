# Nestlancer Proto — Prompt v3.2 · ADMIN / OPERATOR CONSOLE

**Filename:** `ai-prompt-v3.2.md`  
**Part:** **3 of 3** — Admin pages  
**Previous:** `ai-prompt-v3.md` (Public) · `ai-prompt-v3.1.md` (Client)  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Design north star:** `verified-backups/direction.md` §2 Admin Dashboard + §5 Ⓒ Admin Dashboard  
**Review source:** `PAGE_REVIEW.md`

> **Scope of this file only:** `proto/apps/admin/**`.  
> Do **not** redesign landing/auth or client portal here unless the user explicitly expands scope.  
> Note: `landing/admin-login` belongs to **v3 (public/auth)**, not this file.

> Say: **“Execute `ai-prompt-v3.2.md`. Redesign all admin HTML to A+, update `PAGE_REVIEW.md`, commit, and push.”**

---

## Operator guide

1. Read **`verified-backups/direction.md`** (Section 2 + Section 5 Ⓒ + Master Trend Table admin columns) before coding.
2. Prefer running after v3 / v3.1 so public brand + client shell decisions are stable; admin may share tokens but must feel like a **power tool**, not the marketing site or the welcoming client portal.
3. Screenshots: `Nestlancer-admin-screenshots/`. OpenAPI: full set under `backend-api-swagger/` as needed per module.
4. Ledger: `upgrade-v3/admin/` (`PAGE_COVERAGE.csv`, `PROGRESS.md`, `DIRECTION_CONTRACT.md`).
5. Almost all admin pages are **Grade B (~80)**; `admin/dashboard` is **A (~92)** — still raise to **A+**.

### In-scope HTML (~101)

All `proto/apps/admin/**/index.html`, including:

| Priority | Families |
|---|---|
| P0 | Shared operator shell + `admin/dashboard` + `admin/index.html` |
| P1 | `pipeline/**`, `requests/**`, `quotes/**`, `projects/**` |
| P2 | `payments/**`, `users/**`, `messages/**` |
| P3 | `media/**`, `content/**`, `portfolio/**` |
| P4 | `system/**`, `analytics`, `audit`, `integrations`, `api-keys`, `moderation`, `notifications`, `contact`, `profile` |

Shared CSS/JS focus: `operator.css`, `operator.js`, `workbench.css` primitives for tables/toolbars — **quiet chrome, high density**.

---

# IMPLEMENTATION PROMPT — START (ADMIN)

## 1. Mission

Redesign the **operator console** to **A+ (≥95)** as a **decision-making surface**: high density, low decoration, table-first, color as signal only.

Direction formula (§5 Ⓒ):

> **Sidebar + KPI Strip + Tables + Dark Mode**  
> Fixed collapsible sidebar · 4–6 KPIs above the fold · tables over chart walls · progressive disclosure · dark mode for power users.

Industry craft bar cited in the report (study principles, do not clone products): **Linear** (quiet chrome), **Stripe** (tables as UI), **Vercel** (monochrome; color = meaning), **Attio** (AI summary as a designed component).

Keep Nestlancer IA, routes, and mock operational data. Static HTML only.

### Required outputs

1. Upgraded `proto/apps/admin/**` HTML.  
2. Shared admin shell improvements (`operator.*`, table/toolbar systems).  
3. `PAGE_REVIEW.md` updates for admin rows.  
4. `upgrade-v3/admin/` ledger.  
5. Commit + push when the admin batch (or claimed sub-batch) is real.

---

## 2. Design mandate — from `direction.md` §2 & §5 Ⓒ

### Do this

| Trend | Nestlancer admin application |
|---|---|
| **Proven layout** | ~256px sidebar collapsing toward icon rail; **4–6 KPI cards** above the fold on dashboards; 12-col grid / consistent gutters; panels grow instead of nested scroll traps |
| **Quiet chrome** | Fewer borders/shadows; density up; hierarchy from type weight + spacing |
| **Tables over chart walls** | Lists/ledgers first; charts only where a trend needs a shape |
| **Color = signal** | Green/amber/red (and brand teal in chrome) — **never paint data rows in brand for decoration** |
| **Dark mode standard** | Full dark support; prefer dark-friendly defaults for dense ops; keep theme toggle |
| **Progressive disclosure** | Dashboard = decisions/alerts; deep numbers on inner pages |
| **Tabular numerals** | Consistent money/ID precision; units lighter than values |
| **AI as component (optional)** | If you add a summary strip, design it as a first-class block — not a bolted chat widget with fake claims |
| **Micro-interactions** | Restrained: row hover, filter chips, toasts — not marketing motion |

### Avoid

Chart-wall dashboards · colorful data decoration · marketing glass/beams on every grid · client bento “cuteness” on operator tables · purple-indigo ThemeWagon skins · inventing AI insights that look like real production intelligence without clear prototype labeling.

---

## 3. Work order

1. Baseline coverage CSV for all `proto/apps/admin/**`.  
2. `DIRECTION_CONTRACT.md` — map §2/§5 Ⓒ → sidebar, KPI strip, table toolbar, dark tokens.  
3. **Shared admin shell** → quiet chrome + collapsible sidebar behavior.  
4. **`admin/dashboard`** (+ `admin/index.html`) flagship — KPI strip + table/decision modules.  
5. Pipeline / requests / quotes / projects → payments → users / messages → media / content / portfolio → system & utilities.  
6. Create/edit forms: dense but clear sections, sticky primary actions, validation/empty states.  
7. Update review → commit → push. Pipeline COMPLETE when admin scope is A+.

---

## 4. KEEP / CHANGE / DO NOT

**KEEP:** routes (including UUID demos), mock operational data, Nestlancer module names, existing JS hooks.  
**CHANGE:** shell density, KPI strip, table-first layouts, status color discipline, dark-mode quality, B-grade generic workbench look.  
**DO NOT:** redesign landing/client; install dashboard kits; copy Linear/Stripe branding; fabricate live AI; claim A+ without rendering 1440 + 390.

---

## 5. Grade bar

Ship = **A+ ≥95**. Admin pages that still feel like “old workbench + teal” fail the direction mandate.

Dimensions: Hierarchy · Density · Type · Brand/atmosphere · Motion · Responsive 390 · A11y · Components · Anti-slop.

---

## 6. Verification + ship

`VERIFIED` when: rendered 1440 + 390; ≥95; dashboard shows KPI strip + quiet chrome + table-first intent; color used as signal; data intact; `PAGE_REVIEW.md` updated.

Commit example:

```text
Redesign admin console to A+ (prompt v3.2)

Apply direction.md quiet chrome, KPI strip, table-first layouts,
and dark-mode-ready operator density across proto/apps/admin.
```

Stage: `proto/apps/admin/**`, admin shared assets, `PAGE_REVIEW.md`, `upgrade-v3/admin/`.

---

## 7. Final response format

```text
STATUS: COMPLETE / PARTIAL / BLOCKED
Part: v3.2 ADMIN
Dashboard flagship A+: Y/N
Admin pages A+: N / ~101
Shared assets:
PAGE_REVIEW updated: Y/N
Git: branch / commit / pushed
NEXT: remaining admin paths | full v3 pipeline complete
```

# IMPLEMENTATION PROMPT — END

---

## Resume

> Continue `ai-prompt-v3.2.md` (admin only). Read `upgrade-v3/admin/PROGRESS.md`. Keep VERIFIED pages. Finish remaining `proto/apps/admin/**` to A+ using `direction.md` §2/§5 Ⓒ.

## Pipeline

| Prompt | Surface | Direction.md |
|---|---|---|
| v3 | Public / Landing / Auth | §1 + §5 Ⓐ |
| v3.1 | Client portal | §3 + §5 Ⓑ |
| **v3.2** (this) | Admin console | §2 + §5 Ⓒ |
)
