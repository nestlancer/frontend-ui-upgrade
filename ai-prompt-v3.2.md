# Nestlancer Proto — Prompt v3.2 (rewritten) · ADMIN / OPERATOR CONSOLE

**File:** `ai-prompt-v3.2.md` · **Part 3 of 3** · Previous: `ai-prompt-v3.md` (public), `ai-prompt-v3.1.md` (client)
**Repo:** https://github.com/nestlancer/frontend-ui-upgrade.git
**Read before coding:** `verified-backups/direction.md` (§2, §4 admin column, §5 Ⓒ) → `research/LINEAR_UI_RESEARCH.md` → this file.
**Scope:** `prototype/admin/**` (101 pages). `prototype/public/admin-login` belongs to v3 (public). Do **not** edit `prototype/public/**`, `prototype/web/**`, or **anything under `proto/`**. Reuse shared `prototype/shared/assets/v3/` (tokens/base/theme only); admin rules only in `prototype/admin/assets/nl-admin.css`.

> **Run:** "Execute `ai-prompt-v3.2.md`. Seed `prototype/admin/` from `proto/apps/admin/` if needed, rebuild every admin page under `prototype/admin/` to the v3 Linear-teal operator system, pass all gates in `tools/v3/gate.py`, update `PAGE_REVIEW.md`, commit per family, push."

---

## Isolation — work only under `prototype/` (non-negotiable)

`proto/` is the live shared tree: public/landing HTML, the client dashboard, and the admin console all load the same `proto/shared/assets/*` (CSS + JS). Editing public pages or shared stylesheets there breaks client and admin.

**Therefore:**

| Rule | Detail |
|---|---|
| **Write only** | `prototype/**` |
| **Never edit** | anything under `proto/` (HTML, CSS, JS, fonts, art) |
| **Never link** | prototype pages must not `href`/`src` into `proto/` — only `prototype/shared/` |
| **Seed once** | copy from `proto/` into `prototype/`, then redesign the copy |
| **Shared v3** | Only cross-surface files in `prototype/shared/assets/v3/` (tokens, base, theme JS). Surface CSS/JS live under each surface's `assets/` |

### Tree (create exactly this)

```
prototype/
  index.html                 # optional hub (was proto/index.html)
  public/                    # was proto/apps/landing/**  → ai-prompt-v3.md
    assets/
      nl-public.css          # public-only layouts, hero, auth, marketing motion
      nl-public.js           # public-only behaviour (optional; omit if unused)
  web/                       # was proto/apps/web/**      → ai-prompt-v3.1.md
    assets/
      nl-client.css          # client shell + archetypes only
      nl-client.js           # client-only behaviour (optional)
  admin/                     # was proto/apps/admin/**    → ai-prompt-v3.2.md
    assets/
      nl-admin.css           # admin shell + archetypes only
      nl-admin.js            # admin-only behaviour (optional)
  shared/
    assets/
      v3/
        nl-tokens.css        # SHARED — light/dark tokens + legacy remap
        nl-base.css          # SHARED — reset, type, focus, primitives (btn, input, table…)
        nl-v3.js             # SHARED — theme helpers only (+ tiny cross-surface utils)
      fonts/                 # SHARED — Geist (used by all surfaces)
      art/                   # only art used by ≥2 surfaces; else keep under the surface
      proto.css, ui.js, …    # seeded COPIES for fallback/behaviour — patch only these copies
```


### Shared vs surface-specific assets (do not dump everything in `shared/`)

`shared/` is **only** for things that truly apply to **all three** surfaces (public + client + admin). If something is unique to one surface, keep it under that surface — never park it in `shared/` "just in case."

| Goes in `prototype/shared/` | Stays on the surface (`public/` · `web/` · `admin/`) |
|---|---|
| Theme system: light / dark tokens, `data-theme`, theme toggle helpers | Public home hero animation, scroll-reveal, marketing nav sheet |
| Design tokens + base primitives used by every surface (`nl-tokens.css`, `nl-base.css`) | Client shell, bento dashboard, quote-paper layout (`nl-client.css`) |
| Fonts used across surfaces; art reused by ≥2 surfaces | Admin table density, ⌘K palette chrome, view-bar filters (`nl-admin.css`) |
| Tiny shared JS: theme boot/read, copy-ID, focus helpers (`nl-v3.js` shared core only) | Surface-only JS: public motion, client sidebar collapse UX, admin peek panel |

**Examples**
- ✅ Theme (dark/light) → `shared/assets/v3/` — one system, all three surfaces.
- ✅ Button / input / status primitives → `shared/assets/v3/nl-base.css`.
- ❌ Public homepage-specific animation → `prototype/public/assets/nl-public.css` (and/or `nl-public.js`), **not** shared.
- ❌ Client billing strip or admin 36px table rows → surface CSS only.
- ❌ Do **not** put `nl-public.css` + `nl-client.css` + `nl-admin.css` logic into one mega shared stylesheet. Each surface loads **only** its own surface file plus the shared tokens/base.

**Rule of thumb:** if removing a file would break only one surface, it does not belong in `shared/`.


### Seed protocol (Phase 0, before baseline / before any redesign)

If `prototype/` is missing or this surface is not seeded yet:

```bash
mkdir -p prototype
# shared once — do not overwrite files already seeded by another surface
rsync -a --ignore-existing proto/shared/ prototype/shared/
# this surface only (admin ← operator console)
rsync -a proto/apps/admin/ prototype/admin/
cp -n proto/index.html prototype/index.html 2>/dev/null || true
```

Then **rewrite asset paths** in the seeded HTML. Under `proto/apps/<surface>/` links were `../../shared/` (or deeper). Under `prototype/public|web|admin/` there is no `apps/` level — every `../` chain to `shared/` is **one level shorter** (e.g. `../../shared/` → `../shared/`, `../../../shared/` → `../../shared/`). Fix with a script across the seeded surface. Confirm no page still points at `proto/`.

`tools/v3` already roots at `prototype/`. Gates use `--surface public|web|admin` (alias: `landing` → `public`).


## 0. Read this first — why earlier runs "changed nothing"

Earlier v3 runs produced pages that look almost identical to the baseline. Root causes (full analysis: `research/LINEAR_UI_RESEARCH.md` §0):

1. Prompts gave **trend words, not values**, so tiny tweaks "satisfied" them.
2. The agent **graded itself** ("A+ ≥95") with no measurement.
3. New CSS was **layered on top** of `proto.css` (130 KB, 68 `!important`) + `studio/workbench/operator/public-flow/editorial/inbox.css`, so it lost the specificity fight.
4. **3,083 inline `style=""` attributes** override any stylesheet.
5. The **shell (sidebar/topbar) is copy-pasted into every page**, so it was never rebuilt.
6. The baseline is already a clean light-teal "B". **Small edits to a clean page are invisible.**
   *Measured (Oct 16, 2026):* applying this prompt's full new token palette **alone** to `admin/requests` changed **0.4%** of pixels and `web/dashboard` **2.4%**. A palette/spacing refresh is not a redesign. The ≥30% gate can only be met by rebuilding the **shell and layout** per the recipes below.

**Therefore this prompt is different:**

- You get **exact tokens, dimensions and a layout recipe per page archetype**. Follow them literally. Where this prompt gives a number, use that number.
- "Done" is decided by **`tools/v3/gate.py`** (data preserved + **≥ 30% of pixels visibly changed** + no legacy residue + no broken links), not by your opinion.
- You **replace** styling (new `assets/v3/` system + unlink legacy surface sheets + strip inline styles); you do not append overrides.
- You rebuild the shell **with a script across all pages of the surface**, not by hand.
- **Expect a big diff.** If a page's before/after looks similar, it is not done.


---

## 1. Mission

Turn the operator console into a **Linear × Stripe power tool**: dark by default, quiet chrome, keyboard-first, **tables as the interface**, colour only for state, and a dashboard that is a **decision surface**.

Formula (direction.md §5 Ⓒ): **256px collapsible sidebar · 4–6 KPI strip · table-first · colour = meaning · dark default · AI summary as a designed (and honestly labelled) component.**

**Visible outcome a stakeholder must notice in 3 seconds:**

| Now (baseline) | After |
|---|---|
| Light mint console; "OPERATOR CONSOLE" teal badge; "● OPERATIONS" eyebrow + 32px H1 + paragraph = ~140px intro on every page | **Dark `#08090A` canvas**, dim sidebar, **content in a floating `#0F1011` panel**; **44px view header** (breadcrumb + title + actions) and a 40px view bar (saved views, filter chips, display, ⌘K) |
| Separate KPI cards with coloured left borders; capacity form + 4 stat cards above every table | One **hairline KPI strip** (5 values, deltas) on dashboards/hubs; list pages lead with the table. Secondary stats/settings collapse into a disclosure or move to their own page |
| 54px table rows, uppercase table heads, "COPY" text links, mono numbers | **36px rows**, sentence-case 12px heads, icon copy on hover, tabular sans money right-aligned, status dot + label |
| Record pages = stacked cards | **Linear issue / Stripe payment layout**: main column + 300px properties rail + activity timeline |

---

## 2. Inputs

- Live screenshots: `Nestlancer-admin-screenshots/*/*.webp` (map: `screenshot-manifest.csv`).
- API truth (status enums, fields, actions): all of `backend-api-swagger/*.openapi.json` (esp. `admin`, `requests`, `quotes`, `projects`, `payments`, `users`, `messaging`, `media`, `blog`, `portfolio`, `notifications`, `webhooks`, `health`).
- Operator: Riya Kapoor / `admin@nestlancer.com` (`resource.md`). Keep every name, ₹ amount, ID, UUID, date, %.

## 3. References: borrow these patterns (rebuild in static HTML)

| Reference | Signal | Take exactly this |
|---|---|---|
| **Linear app** (2024 redesign + Mar 2026 "calmer interface") | benchmark in direction.md | Dim sidebar, floating main panel, 44px header + view bar, filter chips ("Status is …"), 36px rows with status icons, ⌘K, peek panel, compact tabs, fewer/smaller icons, soft borders |
| **Stripe Dashboard** | benchmark in direction.md | Table-first lists, right-aligned tabular money, payment detail (amount hero + timeline + metadata), status colour discipline, designed empty states |
| **shadcn-admin** (satnaing) | **15.8k★**, most-starred free shadcn admin | Shell structure, tasks table (status/priority icons, row actions menu, faceted filters, pagination), settings sub-nav, command palette |
| **shadcn `sidebar-07` / `dashboard-01`** | **125.7k★** lib | Sidebar collapsing to 64px icon rail; section cards → one chart → data table |
| **Twenty CRM** | **58.4k★** | Record page: fields rail + activity timeline + related-records tables |
| **Plane** | **60.9k★** | Peek overview side panel from list rows; progress per cycle |
| **Vercel** | benchmark in direction.md | Status dots, monochrome lists, health/jobs boards |

---

## 4. The Nestlancer v3 design system ("Linear-teal"), shared by all three surfaces

> **Single source of truth for cross-surface design:** `prototype/shared/assets/v3/nl-tokens.css` and `nl-base.css` (theme + primitives).
> **If they already exist** (another v3 prompt ran first): **do not rewrite or fork them.** Diff against the spec below and only *add* what's missing.
> **Surface-specific rules** go only in that surface's own file under `prototype/{public|web|admin}/assets/` — never into shared tokens/base.

### 4.1 File architecture (create exactly this)

> **Shared folder = cross-surface only.** Surface CSS/JS live under `prototype/{public|web|admin}/assets/`. See § Isolation → *Shared vs surface-specific*.

```
prototype/shared/assets/v3/          # SHARED only (all 3 surfaces)
  nl-tokens.css    # tokens (light + dark) + LEGACY TOKEN REMAP
  nl-base.css      # reset, type, focus, primitives: btn, input, select, field, status, badge,
                   # table, list-row, card, kbd, tabs, chip, empty, skeleton, toast, dialog,
                   # avatar, progress, kpi, disclosure
  nl-v3.js         # theme boot helpers, per-surface theme key, copy-ID, focus — NO surface-only motion

prototype/public/assets/             # PUBLIC only (v3)
  nl-public.css    # marketing + auth layouts, hero, bento, public motion
  nl-public.js     # optional public-only scripts

prototype/web/assets/                # CLIENT only (v3.1)
  nl-client.css    # client portal shell + archetypes
  nl-client.js     # optional client-only scripts

prototype/admin/assets/              # ADMIN only (v3.2)
  nl-admin.css     # operator console shell + archetypes
  nl-admin.js      # optional admin-only scripts
```

**`<head>` order on every migrated page** (paths relative to the page):

```html
<script>/* theme boot — must be first, prevents flash */
(function(){var k='nl-theme-admin',d='dark',t=null;
try{t=localStorage.getItem(k)}catch(e){}
var r=document.documentElement;r.setAttribute('data-theme',t||d);r.setAttribute('data-surface','admin');r.setAttribute('data-theme-key',k);})();</script>
<link rel="stylesheet" href="…/shared/assets/proto.css">          <!-- legacy fallback from prototype/shared copy only, temporary -->
<link rel="stylesheet" href="…/shared/assets/v3/nl-tokens.css">   <!-- SHARED -->
<link rel="stylesheet" href="…/shared/assets/v3/nl-base.css">     <!-- SHARED -->
<link rel="stylesheet" href="…/assets/nl-admin.css">              <!-- ADMIN only — not in shared/ -->
<script defer src="…/shared/assets/v3/nl-v3.js"></script>         <!-- SHARED theme helpers -->
<script defer src="…/assets/nl-admin.js"></script>                <!-- ADMIN only if needed -->
<!-- keep existing JS behaviour files (ui.js, workbench.js, studio.js, operator.js, …) from prototype/shared copies if the page uses their data-* hooks -->
```


**Remove from migrated pages:** `studio.css`, `workbench.css`, `operator.css`, `public-flow.css`, `editorial.css`, `inbox.css` links (the residue gate fails if they remain), and the body classes `upgrade-v2 studio-v2 workbench-v2 workbench-admin workbench-client operator-v2 flow-v2 auth-v2 batch-*`. New body class: `class="nl nl-admin"` (keep `data-page` / `data-surface`).
**Theme toggle:** update **`prototype/shared/assets/ui.js` only** (never `proto/…/ui.js`) so the toggle reads/writes `document.documentElement.dataset.themeKey` (fall back to `'nl-theme'`). Per-surface keys: `nl-theme-public`, `nl-theme-client`, `nl-theme-admin`. Defaults: **public = dark, client = light, admin = dark**.

### 4.2 Tokens (write verbatim into `nl-tokens.css`)

```css
/* Nestlancer v3 — "Linear-teal". One accent (teal). Neutral warm greys. Hairlines over shadows. */
html:root, html:root[data-theme="light"] {
  color-scheme: light;
  --nl-bg-0:#F7F7F6; --nl-bg-1:#FFFFFF; --nl-bg-2:#FFFFFF; --nl-bg-3:#F1F1F0; --nl-bg-4:#E9E9E7;
  --nl-border-1:rgba(0,0,0,.05); --nl-border-2:rgba(0,0,0,.08); --nl-border-3:rgba(0,0,0,.14);
  --nl-text-1:#0B0C0D; --nl-text-2:#3C3F44; --nl-text-3:#6B6F76; --nl-text-4:#8E9299; /* text-4 = placeholder/disabled only */
  --nl-accent:#0B7A71; --nl-accent-hover:#08655D; --nl-accent-text:#0B7A71; --nl-on-accent:#FFFFFF;
  --nl-accent-soft:rgba(11,122,113,.08); --nl-accent-line:rgba(11,122,113,.35);
  --nl-ok:#0F6A42; --nl-ok-dot:#12A164; --nl-ok-soft:rgba(18,161,100,.10);
  --nl-warn:#A15C07; --nl-warn-dot:#D88B1D; --nl-warn-soft:rgba(216,139,29,.12);
  --nl-bad:#B42318; --nl-bad-dot:#D93838; --nl-bad-soft:rgba(217,56,56,.10);
  --nl-info:#1D5FBF; --nl-info-dot:#2E74C9; --nl-info-soft:rgba(46,116,201,.10);
  --nl-neutral-dot:#8E9299;
  --nl-shadow-card:0 1px 2px rgba(0,0,0,.04);
  --nl-shadow-pop:0 0 0 1px var(--nl-border-2),0 12px 32px -12px rgba(0,0,0,.22),0 2px 6px -2px rgba(0,0,0,.08);
  --nl-focus:0 0 0 2px var(--nl-bg-1),0 0 0 4px rgba(11,122,113,.55);
  --nl-font:'Geist',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  --nl-mono:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --nl-w-400:400; --nl-w-510:510; --nl-w-590:590;               /* never use > 590 */
  --nl-fs-11:11px; --nl-fs-12:12px; --nl-fs-13:13px; --nl-fs-14:14px; --nl-fs-15:15px; --nl-fs-16:16px;
  --nl-fs-18:18px; --nl-fs-20:20px; --nl-fs-24:24px; --nl-fs-32:32px; --nl-fs-40:40px; --nl-fs-48:48px;
  --nl-fs-display:clamp(44px,7.2vw,84px);
  --nl-s-1:4px; --nl-s-2:8px; --nl-s-3:12px; --nl-s-4:16px; --nl-s-5:20px; --nl-s-6:24px; --nl-s-8:32px;
  --nl-s-10:40px; --nl-s-12:48px; --nl-s-16:64px; --nl-s-20:80px; --nl-s-24:96px; --nl-s-32:128px;
  --nl-r-xs:4px; --nl-r-sm:6px; --nl-r-md:8px; --nl-r-lg:12px; --nl-r-pill:999px;  /* never > 12 except pills */
  --nl-ease:cubic-bezier(.25,.46,.45,.94); --nl-ease-out:cubic-bezier(.165,.84,.44,1);
  --nl-dur-1:120ms; --nl-dur-2:150ms; --nl-dur-3:300ms;
  --nl-sidebar:256px; --nl-rail:64px; --nl-header:44px; --nl-viewbar:40px; --nl-row:36px;
}
html:root[data-theme="dark"] {
  color-scheme: dark;
  --nl-bg-0:#08090A; --nl-bg-1:#0F1011; --nl-bg-2:#151618; --nl-bg-3:#1C1D20; --nl-bg-4:#25262A;
  --nl-border-1:rgba(255,255,255,.05); --nl-border-2:rgba(255,255,255,.08); --nl-border-3:rgba(255,255,255,.14);
  --nl-text-1:#F7F8F8; --nl-text-2:#CFD2D6; --nl-text-3:#8A8F98; --nl-text-4:#62666D;
  --nl-accent:#0B7A71; --nl-accent-hover:#0E8A7F; --nl-accent-text:#3CC4B2; --nl-on-accent:#FFFFFF;
  --nl-accent-soft:rgba(60,196,178,.10); --nl-accent-line:rgba(60,196,178,.35);
  --nl-ok:#4CC38A; --nl-ok-dot:#29C47D; --nl-ok-soft:rgba(41,196,125,.12);
  --nl-warn:#E5A93A; --nl-warn-dot:#F0A429; --nl-warn-soft:rgba(240,164,41,.12);
  --nl-bad:#F07373; --nl-bad-dot:#EF5350; --nl-bad-soft:rgba(239,83,80,.12);
  --nl-info:#6AA7FF; --nl-info-dot:#4B96F3; --nl-info-soft:rgba(75,150,243,.12);
  --nl-neutral-dot:#62666D;
  --nl-shadow-card:none;
  --nl-shadow-pop:0 0 0 1px var(--nl-border-2),0 16px 40px -12px rgba(0,0,0,.7);
  --nl-focus:0 0 0 2px var(--nl-bg-1),0 0 0 4px rgba(60,196,178,.55);
}

/* LEGACY TOKEN REMAP — instantly moves every un-migrated page onto the new palette.
   Specificity 0,2,1 beats proto.css :root[data-theme] (0,2,0). Do not delete. */
html:root, html:root[data-theme] {
  --bg-app:var(--nl-bg-0); --bg-card:var(--nl-bg-1); --bg-elev:var(--nl-bg-2); --bg-subtle:var(--nl-bg-3);
  --bg-hover:var(--nl-bg-3); --bg-sidebar:var(--nl-bg-0); --bg-glass:var(--nl-bg-1);
  --paper:var(--nl-bg-0); --paper-2:var(--nl-bg-3); --paper-line:var(--nl-border-2);
  --ink-1:var(--nl-text-1); --ink-2:var(--nl-text-2); --ink-3:var(--nl-text-3); --ink-4:var(--nl-text-3); --ink-inv:var(--nl-bg-1);
  --line:var(--nl-border-2); --line-strong:var(--nl-border-3); --line-glass:var(--nl-border-1);
  --brand-1:var(--nl-bg-3); --brand-2:var(--nl-bg-3); --brand-3:var(--nl-accent-soft); --brand-4:var(--nl-accent-line);
  --brand-6:var(--nl-accent-text); --brand-7:var(--nl-accent-text); --brand-8:var(--nl-accent); --brand-9:var(--nl-accent);
  --brand-10:var(--nl-accent-hover); --brand-11:var(--nl-accent-text); --brand-glow:transparent;
  --t-success-bg:var(--nl-ok-soft); --t-success-tx:var(--nl-ok); --t-success-bd:transparent; --t-success-dot:var(--nl-ok-dot);
  --t-warning-bg:var(--nl-warn-soft); --t-warning-tx:var(--nl-warn); --t-warning-bd:transparent; --t-warning-dot:var(--nl-warn-dot);
  --t-danger-bg:var(--nl-bad-soft); --t-danger-tx:var(--nl-bad); --t-danger-bd:transparent; --t-danger-dot:var(--nl-bad-dot);
  --t-info-bg:var(--nl-info-soft); --t-info-tx:var(--nl-info); --t-info-bd:transparent; --t-info-dot:var(--nl-info-dot);
  --t-neutral-bg:var(--nl-bg-3); --t-neutral-tx:var(--nl-text-2); --t-neutral-bd:transparent; --t-neutral-dot:var(--nl-neutral-dot);
  --sh-xs:none; --sh-sm:var(--nl-shadow-card); --sh-md:var(--nl-shadow-card); --sh-lg:var(--nl-shadow-pop); --sh-inset:none;
  --r-xs:var(--nl-r-xs); --r-sm:var(--nl-r-sm); --r-md:var(--nl-r-sm); --r-lg:var(--nl-r-md); --r-xl:var(--nl-r-lg);
  --font-sans:var(--nl-font); --font-mono:var(--nl-mono);
  --mesh-1:transparent; --mesh-2:transparent; --mesh-3:transparent; --grid-line:transparent;
  --glass-chrome:var(--nl-bg-1); --glass-chrome-strong:var(--nl-bg-1); --glass-blur:0px;
}
```

### 4.3 Primitive specs for `nl-base.css` (exact values)

| Primitive | Spec |
|---|---|
| Body | `font: 400 var(--nl-fs-14)/1.5 var(--nl-font); letter-spacing:-0.006em; color:var(--nl-text-2); background:var(--nl-bg-0); -webkit-font-smoothing:antialiased; font-feature-settings:"ss01","cv11"` (if unsupported, harmless) |
| Headings | weight 590 (h1/h2) or 510 (h3+); color text-1; tracking: ≥48px −0.03em · 24–40px −0.02em · 15–20px −0.012em |
| Numbers | `.nl-num{font-variant-numeric:tabular-nums}`, **sans, not mono**. Currency symbol and units in `<span class="nl-unit">` = text-3, 0.85em. Money in tables is right-aligned. |
| IDs / keys / code | `.nl-id{font:500 12px/1 var(--nl-mono); color:var(--nl-text-3)}`, truncated with a copy button that appears on row hover (icon only + `aria-label="Copy ID"`). **No visible "COPY" text.** |
| Button | height sm 28 / md 32 / lg 40; padding-x 10/12/16; radius 6; font 13/510 (lg 14/510). `--primary` accent bg + on-accent text, hover accent-hover; `--secondary` bg-1 + border-2 + text-1, hover bg-3; `--ghost` transparent, text-2, hover bg-3; `--danger` bad text, hover bad-soft. Transition `background-color,border-color,color var(--nl-dur-2) var(--nl-ease)`. Loading state keeps label + 12px spinner. |
| Input / select / textarea | height 32 (app) / 40 (public + auth); radius 6; bg-1 (dark: bg-2); border-2; hover border-3; focus `box-shadow:var(--nl-focus)` + border accent-line; placeholder text-4 ending with "…"; font 14 (**16 on ≤640px** to stop iOS zoom). Error: border bad-dot + 12px message below in bad. |
| Field | label 13/510 text-1, 6px gap, help 12 text-3 |
| Status | `.nl-status[data-tone=ok|warn|bad|info|neutral|accent]` = 6px dot (tone-dot) + label 13 text-2. Optional `.is-soft` variant: tone-soft bg, radius pill, padding 2px 8px. **Never colour without a text label.** |
| Badge / count | 11/510, text-3, bg-3, radius 4, padding 1px 5px, tabular. Nav counts have no pill: just text-4 right-aligned. |
| Card / panel | bg-1, border 1px border-1 (light) / border-2 (dark), radius 12 (panel) or 8 (card), no shadow in dark, shadow-card in light. Header row 44px: title 13/590 text-1 + right actions. |
| Table | header row 32px: 12/510 **text-3, sentence case (no uppercase tracking)**, bottom border-1, sticky. Body rows `var(--nl-row)` (36 admin / 44 client), 13px, border-bottom border-1, hover bg-3, whole row is a link target (`data-row-href`, real `<a>` on the primary cell). Numeric columns right-aligned + tabular. First column may be a 16px checkbox revealed on hover. |
| List row (client) | 56–64px, title 14/510 text-1, meta 13 text-3, status + amount right |
| Tabs | 32px, 13/510, text-3 → text-1 active, active indicator = bg-3 pill (Linear) **or** 2px text-1 underline; compact, never full-width |
| Chip (filter) | 26px, radius 6, border-2 dashed when empty ("+ Filter"), solid bg-3 when set: `Status is Submitted ×` |
| Kbd | 11/510 mono, 18px tall, radius 4, border-2, text-3 |
| KPI | label 12/510 text-3 · value 24/590 text-1 tabular (client 28) · delta 12/510 ok/bad + arrow + "vs prev 30d" text-4. KPIs sit in **one strip divided by hairlines**, not separate floating cards. |
| Progress | 4px track bg-3, fill accent (or tone), radius pill, value label tabular to the right |
| Empty state | centered in its container: 32px line icon text-4 → title 14/590 text-1 → 1–2 lines 13 text-3 (max 44ch) → one action (secondary btn). Never a blank white box. |
| Skeleton | bg-3 blocks shaped exactly like final content, shimmer 1.2s, disabled under reduced-motion |
| Toast | bottom-right, bg-2, shadow-pop, radius 8, 13px, 4s, `aria-live="polite"` |
| Dialog / menu / popover | bg-2, shadow-pop, radius 12 / 8, enter: opacity + `translateY(4px)` → 0 over 150ms ease-out |
| Focus | `:focus-visible{outline:none;box-shadow:var(--nl-focus)}` everywhere; hit targets ≥ 24px (44px on touch) |
| Motion | state changes 150ms; one entrance per view ≤ 300ms (opacity + 8px rise); `@media (prefers-reduced-motion: reduce)` disables all; **never `transition: all`** |
| Icons | existing inline SVG line icons, 14px (dense) / 16px, stroke 1.75, colour text-3 (active text-1). Fewer icons: drop decorative icons beside every label. |

### 4.4 Global rules (all surfaces)

1. **One accent.** Teal only on: primary button, active nav item marker, focus ring, links, the single key highlight per view. **Never** on headings, card borders, eyebrow labels, table rows, big fills, or decorative dots.
2. **Kill the eyebrow pattern.** Remove the teal mono uppercase "● OPERATIONS / ● ANANYA IYER / ● INTAKE OPEN" labels above headings everywhere (public hero may keep **one** neutral pill).
3. **No uppercase-tracked mono labels** for section titles or table heads. Sentence case, 12–13px, text-3.
4. **Weights 400/510/590 only.** Hierarchy = size + colour.
5. **Hairlines over shadows** inside apps; shadows only on overlays.
6. **Numbers are sans tabular**, not mono. Units lighter.
7. **All states designed:** empty, loading, error, disabled, selected, hover, focus.
8. **Strip inline `style=""`.** Convert to classes. Only CSS custom-property hooks are allowed (`style="--progress:40%"`).
9. **Do not lose data.** Every ₹ amount, ID, email, name, date and % in the baseline stays in the page's visible HTML (it may move, collapse into `<details>`, or change style). Keep date strings literally (e.g. `Oct 6, 2026`), not converted to "6d".
10. **Prototype honesty.** Keep the prototype notes and the "Prototype" FAB (restyle: neutral, 28px, bg-2, text-2, bottom-right, no teal). Any "AI summary" must be labelled *Prototype summary · derived from figures on this page* and only restate on-page numbers.
11. **Offline-safe.** No CDNs, no external fonts or images. Use `prototype/shared/assets/fonts/Geist-Variable.woff2` (seeded copy) (supports weights 400/510/590) and inline SVG.
12. **Vercel web-interface checklist** (`research/LINEAR_UI_RESEARCH.md` §2): `…` character, curly quotes, `aria-label` on icon buttons, labels on every control, `touch-action:manipulation` on controls, `scroll-margin-top` on anchors, `<meta name="theme-color">` matching bg-0, `color-scheme` set.


---

## 5. Admin shell (`prototype/admin/assets/nl-admin.css`)

**Theme default:** dark (`nl-theme-admin`). Light theme must be finished too (Linear light: canvas `#F7F7F6`, panel white).

```
┌──────────────┬─────────────────────────────────────────────────────────────┐
│ Sidebar 256  │ ┌─────────────────────────────────────────────────────────┐ │
│ bg-0         │ │ Header 44: ‹ › Requests                 [Export] [+ New]│ │
│ [N] Nestlancer│ ├─────────────────────────────────────────────────────────┤ │
│     Ops ▾    │ │ View bar 40: Inbox·All·Submitted·Quoted  [+ Filter] ⌕ ⚙ │ │
│ ⌕ Search ⌘K  │ ├─────────────────────────────────────────────────────────┤ │
│ Inbox     17 │ │ Content (panel bg-1, border-1, radius 12, inset 8px)    │ │
│ Dashboard    │ │  table rows 36px …                                      │ │
│ ── Workflow  │ │                                                         │ │
│ Requests     │ │                                                         │ │
│ Quotes       │ │                                                         │ │
│ Projects     │ │                                                         │ │
│ Pipelines    │ │                                                         │ │
│ Payments  16 │ │                                                         │ │
│ ── People    │ │                                                         │ │
│ Users        │ │                                                         │ │
│ Messages  21 │ │                                                         │ │
│ ── Content ▸ │ │                                                         │ │
│ ── System ▸  │ │                                                         │ │
│ [RK] Riya ▾  │ └─────────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

- **Sidebar (256 → 64 rail):** bg-0, no border, **dimmer than content** (Linear 2026): items 28px, radius 6, 13/510 **text-3** inactive; active = text-1 + bg-3; icons 14px text-4 (active text-2); counts 11 text-4 right-aligned, no pills; group labels 12/510 text-4 sentence case with collapse chevrons (`<details>`; Content + System collapsed by default unless the current page is inside). Top: workspace switcher (20px square mark + "Nestlancer Ops" 13/590 + chevron), then **Search ⌘K** button (28px, text-3). Bottom: user row (avatar 24 + name + role 12 text-4) with menu (Profile, Theme, Sign out). Collapse toggle (`[`) persists in `localStorage('nl-admin-sidebar')`. 1024–1279px default rail; ≤1023px off-canvas sheet + 48px top bar.
- **Group the existing items** (keep every route): Inbox (Inquiries → `contact`) · Dashboard · Notifications · *Workflow:* Requests, Quotes, Projects, Pipelines, Payments · *People:* Users, Messages, Moderation · *Insights:* Analytics, Audit Logs · *Content:* Blog, Portfolio, Media Library · *System:* System Config, Webhooks/Integrations, API Keys, Staff, Health, Jobs, Logs, Cache, Features, Maintenance, Templates, Announcements.
- **Remove:** "OPERATOR CONSOLE" badge, topbar with bell/chat red pills (counts move to sidebar), "● OPERATIONS" eyebrows, the 140px page intro, the prototype banner as a full-width teal box (→ a 28px neutral notice row inside the view bar: `ⓘ Prototype snapshot` with a popover holding the original text).
- **Header (44px):** back/forward chevrons (ghost 24px) · breadcrumb 13 text-3 › current 13/510 text-1 (the page `<h1>` lives here, visually 13–14px) · right: ≤ 1 primary (sm 28px) + secondary/ghost actions + overflow menu `⋯`.
- **View bar (40px, list pages):** saved views as compact tabs (map existing filter options/routes) · `+ Filter` dashed chip opening a menu of existing filters (status, category, client, date) · active filters as chips `Status is Submitted ×` · right: search (28px, 220px, `/` shortcut) · Display menu (density comfortable 44 / compact 36; visible columns) · results count 12 text-4.
- **⌘K palette** (`nl-v3.js`): dialog 640px, input 48px, grouped results from the existing operator search entries (`data-search-entry`), arrow-key navigation, Enter opens, Esc closes. Shortcut hints `G then R` (requests) etc. shown in palette only.

## 6. Archetype recipes (follow literally)

### A1 · Command center (`admin/dashboard`, `admin/index.html` redirect)
Header: "Command center" + period segmented control (7d · 30d · 90d · 1y, existing) + "Inbox" secondary.
1. **KPI strip** (one panel, 5 equal cells divided by border-1, 88px tall): Pending requests `11`, Open quotes `7`, Pending payments (count + ₹ if present), Revenue (month) `₹7,08,160.00` with "₹2,60,790.00 awaiting" sub, Flagged / alerts. Label 12/510 text-3 · value 24/590 tabular · delta/sub 12 (ok/bad only when it's a real signal).
2. **Ops brief** (AI summary as a component): panel with a 14px sparkle icon text-3, title "Ops brief" 13/590, tag `Prototype summary · derived from figures on this page` (11 text-4), 3 bullets max (13 text-2) that only restate on-page numbers, each ending in a link (e.g. "11 requests awaiting review → Requests"). No chat box.
3. **Grid 12-col, gap 16, rows `minmax(200px,auto)`:**
   - **Needs action** (8 cols): table, 36px rows: type icon · item title · client · amount (right, tabular) · age/date · owner avatar · `→`. Merge existing "needs attention" items (pending requests, open quotes, pending pay, flagged msgs, new contact).
   - **Revenue trajectory** (4 cols): the **only chart**: 1-series line/area SVG (stroke accent-text 1.5px, fill accent-soft→transparent), no gridlines except baseline, value + delta in header, period from existing data.
   - **Project mix** (4 cols): **one** horizontal stacked bar (8px) + legend rows with tabular count and % (In progress / Pending payment / Completed…). No donut.
   - **System health** (4 cols): list rows with status dots (API, Payments webhook, Jobs, Cache) + "System healthy" status.
   - **Recent activity** (8 cols): audit-style rows 32px: actor avatar 20 · sentence 13 text-2 · object link · time 12 text-4.
4. Remaining old modules → `<details class="nl-disclosure">` "More metrics" at the bottom (data preserved).
Mobile: KPI strip becomes a 2-col grid; modules stack; tables → stacked rows.

### A2 · Table / list (38 pages, see map)
Header (title + count, primary action) → View bar → **table panel** filling the content (no outer page padding beyond 0; panel edges are the table edges).
- Columns per page come from the existing table; order: [checkbox on hover] · ID (`.nl-id` mono 12, 96px, truncated, copy icon on hover) · **primary text** (13/510 text-1, link) · status (`.nl-status`) · secondary columns (13 text-2) · money (right, tabular) · date (12 text-3, literal string) · row menu `⋯` (on hover).
- Rows 36px (compact) / 44px (comfortable); header 32px sentence case 12/510 text-3, sticky; group-by headers (optional, when a page already groups) 32px bg-0 13/590 with count.
- **Stats/forms that sat above tables** (e.g. Requests' capacity dashboard + 4 stat cards): convert to a slim **inline stat line** in the view bar right side ("46 total · 6 categories · 43.9% conversion") **and** a `<details>` "Capacity" disclosure (closed) holding the original form. `requests/capacity` page keeps the full form.
- Footer row 40px: "1–25 of 46" 12 text-3 + prev/next ghost buttons + rows-per-page select.
- Row click → existing detail route. Optional **peek panel** (Plane/Linear): `Space` on a focused row opens a 480px right drawer with the row's key fields + "Open full page".
- Empty state designed per page ("No disputes. Chargebacks raised by Razorpay land here."). Loading skeleton = 8 rows of the real column widths.
- System pages (`health`, `jobs`, `logs`, `cache`, `features`, `staff`, templates, announcements): same table archetype; health/jobs use Vercel-style status dots and durations (tabular); logs = mono 12 rows 28px with level dot, timestamp, message, expandable JSON (`<details>`); features = rows with switch + description + scope.

### A3 · Hub / analytics (`analytics`, `projects/stats`, `quotes/stats`, `media/analytics`, `media`, `messages`, `pipeline`, `system`, `requests/capacity`)
Header + period control → KPI strip (4–6) → **max two charts** (only for trends that need a shape: line for time series, single stacked bar for composition) → breakdown tables (e.g. by category/status/client) in panels with 36px rows → links to the detailed list pages. Hub pages (`media`, `messages`, `pipeline`, `system`) = KPI strip + a grid of "section" panels each showing a top-5 table + "Open {section} →". `requests/capacity`: KPI strip + settings form (A5 row layout) + capacity bar.

### A4 · Record detail (22 pages, see map)
Header: breadcrumb (`Requests › AUDIT-P23-LINE-…`) + prev/next record arrows + actions (one primary: the next workflow step, e.g. **Create quote**, **Record payment**, **Approve milestone**; others in `⋯`).
Body: **main column (flex 1, max 820) + properties rail 300px** (border-left border-1, bg-1, sticky).
- Main: title 20/590 text-1 → status row (status, priority/category chips) → description (14/1.6 text-2) → sections as panels: line items / milestones table, related records (quotes, payments, projects, messages) as compact 36px tables, **activity timeline** (Linear issue style: 20px avatars, 13px sentences, timestamps 12 text-4, system events with 14px icons, comment composer at the end).
- Rail: "Properties" list of 32px rows (label 12 text-3 / value 13 text-1): Status, Client (avatar + name link), Owner, Amount (tabular), Created/Updated (literal dates), IDs/UUIDs (`.nl-id` + copy), tags. Then "Actions" danger zone at the bottom for destructive items with confirmation dialogs.
- **Payments detail** (`payments/[id]` + uuid, `payments/projects/*`): Stripe pattern: amount `₹3,000.00` 32/590 + status `Completed` + "of ₹36,000.00" context; UTR/reference mono with copy; timeline (created → captured → settled/refunded); breakdown table; refund action (dialog with amount field + reason, using existing `data-refund-field` hooks).
- **User detail** (`users/*`, `pipeline/users/*`): header with avatar 40 + name 20/590 + email mono + status; tabs (Overview · Requests · Projects · Payments · Activity) using existing `data-tab-*`; safeguards (e.g. "sole administrator") shown as warn-soft notice rows.

### A5 · Editor / form (25 pages, see map)
- **Settings-style forms** (`profile`, `payments/company-legal`, `media/storage`, `system/maintenance`, `integrations`): sections with left description column (1/3: title 14/590 + help 13 text-3) and right fields (2/3), hairline separators; sticky bottom action bar (bg-2, border-top border-1, 52px: "Cancel" ghost + "Save" primary, dirty indicator).
- **Composer editors** (`content/blog/*`, `content/posts/*`, `portfolio/*`): 2-col: editor canvas (title input 28/590 borderless, toolbar 36px, body textarea/rich area 16/1.7) + right settings rail 300px (status, slug, category, cover, SEO fields, publish/schedule). Preview toggle uses existing `data-preview-toggle`.
- **Quote builder** (`requests/*/quote/new|edit`, `quotes/new`, `projects/new`): main = sections (client & request summary, scope, **line-items editable table** with add-row, **milestone/payment schedule** rows with % ↔ ₹ and a validation that totals 100%) + sticky right **totals card** (subtotal, tax, total 20/590 tabular, deposit) + primary "Send quote" / "Save draft". Keep `quote-steps.js` hooks and all fields.
- **Messages new / media upload / folders:** focused single column 640; recipient pickers as chips; upload = dashed dropzone (border-3 dashed, radius 12, 160px) + file rows with progress.
- Validation inline, first error focused on submit, destructive actions confirmed.

### A6 · Conversation (`messages/inbox`, `messages/[id]`, `messages/thread/*`, `messages/project/[projectId]`)
3 panes: thread list 320 (filters: All · Unread · Flagged; rows 56px: avatar 28, name 13/510, preview 13 text-3, time 12 text-4, unread accent dot, flag icon) | conversation (header 44: participants + project link + actions; Linear comment style, **no colour bubbles**: avatar 24 + name 13/510 + time + body 14 text-2; operator's own messages get a subtle bg-3 band; internal notes in warn-soft with "Internal" tag) | context rail 280 (client card, project, open quotes/payments with amounts, quick actions). Composer with `⌘↵`, attachments, canned replies menu. Mobile: single pane with back.

## 7. Page map: every in-scope file (101)

| Archetype | Pages (under `prototype/admin/`) |
|---|---|
| A1 Command center (2) | `dashboard`, `index.html` (redirect: keep redirect, style the interstitial) |
| A2 Table/list (34) | `requests`, `quotes`, `quotes/drafts`, `quotes/payment-schedules`, `projects`, `projects/completed`, `projects/archive`, `payments`, `payments/disputes`, `payments/accounts`, `users`, `users/search`, `contact`, `moderation`, `audit`, `api-keys`, `notifications`, `content`, `portfolio`, `media/browse`, `media/quarantine`, `messages/threads`, `messages/archived`, `pipeline/projects`, `pipeline/users`, `system/announcements`, `system/cache`, `system/email-templates`, `system/features`, `system/health`, `system/jobs`, `system/logs`, `system/notification-templates`, `system/staff` |
| A3 Hub/analytics (9) | `analytics`, `projects/stats`, `quotes/stats`, `media/analytics`, `media`, `messages`, `pipeline`, `system`, `requests/capacity` |
| A4 Record detail (22) | `requests/[id]`, `requests/01a10a2c-1a04-75bb-8e80-fc143257fa02`, `requests/6a4110f3-1507-769c-99d0-253425f8a1`, `quotes/[id]`, `quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9`, `projects/[id]`, `projects/01a10a2b-5eaa-769e-a5d9-0d58fcca6924`, `projects/nl-lms`, `payments/[id]`, `payments/01a10a2c-2d0e-7499-b769-967d17a42197`, `payments/projects/[id]`, `payments/projects/01a10a2b-5eaa-769e-a5d9-0d58fcca6924`, `payments/projects/nl-lms`, `pipeline/projects/[id]`, `pipeline/projects/01a10a2b-5eaa-769e-a5d9-0d58fcca6924`, `pipeline/projects/nl-lms`, `pipeline/users/[id]`, `pipeline/users/01a10a2a-a99a-7578-825a-c7de8bce4d2b`, `pipeline/users/priya-nair`, `users/[id]`, `users/01a10a2a-a99a-7578-825a-c7de8bce4d2b`, `users/arjun-mehta` |
| A5 Editor/form (29) | `requests/[id]/quote/new`, `requests/[id]/quote/edit`, `requests/01a10a2c-01c3-7079-93e9-9d001541ced8/quote/new`, `requests/6a4110f3-1507-769c-99d0-253425f8a1/quote/new`, `requests/6a4110f3-1507-769c-99d0-253425f8a1/quote/edit`, `quotes/new`, `projects/new`, `content/blog/new`, `content/blog/[id]`, `content/blog/post-custom-crm`, `content/posts/new`, `content/posts/[id]/edit`, `content/posts/01a10a2a-361c-758f-a218-fb673fd3b9d2/edit`, `portfolio/new`, `portfolio/[id]/edit`, `portfolio/01a10a2a-544e-757a-8806-721a7b8591dd/edit`, `portfolio/banking-dashboard.edit`, `messages/new`, `messages/new/direct`, `messages/new/group`, `messages/new-direct`, `messages/new-group`, `media/upload`, `media/folders`, `media/storage`, `payments/company-legal`, `integrations`, `system/maintenance`, `profile` |
| A6 Conversation (5) | `messages/inbox`, `messages/[id]`, `messages/thread/[threadId]`, `messages/thread/01a10a2e-42f8-70c9-95f7-0d05d4fd738a`, `messages/project/[projectId]` |

**UUID / `[id]` / slug twins** must share one template with their own data: build one, generate the others with a script that preserves each file's data tokens.

**Families / commit order:** ① system + shell script across all 101 → ② A1 dashboard + index → ③ requests + quotes (list, detail, builder, stats, capacity, drafts, schedules) → ④ projects + pipeline → ⑤ payments → ⑥ users + messages + moderation + contact + notifications → ⑦ content + portfolio + media → ⑧ system + analytics + audit + api-keys + integrations + profile.

### Execution protocol
1. **Phase 0:** seed `prototype/` (§ Isolation) — `rsync -a proto/apps/admin/ prototype/admin/`, shared assets with `--ignore-existing`, fix `../shared` path depth. Then setup + baseline (§8; baseline is captured in light so the visual gate compares light vs light). Commit seed + baseline + `PAGE_COVERAGE.csv` (101 rows). **Do not modify `proto/`.**
2. **Phase 1, system:** ensure shared files under `prototype/shared/assets/v3/` (§4 tokens/base/theme JS only); write **admin-only** `prototype/admin/assets/nl-admin.css` (+ optional `nl-admin.js`) for shell, view bar, table, rail, palette.
3. **Phase 2, scripted shell:** `tools/v3/migrate_admin.py`: `<head>` (§4.1, default dark), body `nl nl-admin`, replace sidebar + topbar with `tools/v3/shell/admin-shell.html` (grouping above; active item from path), wrap content in panel + 44px header (move existing `<h1>` text into the header breadcrumb), delete eyebrow/intro paragraph (move the paragraph into the header's `title` attribute or a `<details>` help popover so text is preserved), list inline styles. Operate only on `prototype/admin/**`. Run on all 101, render, fix.
4. **Phase 3:** build A1, then one exemplar per archetype (A2 = `requests`, A3 = `analytics`, A4 = `requests/[id]` and `payments/[id]`, A5 = `requests/[id]/quote/new`, A6 = `messages/inbox`); save screenshots to `upgrade-v3/admin/templates/`; then apply per family. Gates. Commit per family.
5. **Phase 4:** dark-default capture → `after-dark/` (§8); eyeball 10 flagship pages in both themes; `PAGE_REVIEW.md`; push.

---

## 8. Gates: the only definition of "done"

Tools already exist in the repo: `tools/v3/capture.py`, `tools/v3/gate.py`. Do not weaken them. You may only *add* checks.

**Setup (once per sandbox):**
```bash
pip install playwright pillow && python3 -m playwright install --with-deps chromium
```

**Phase 0 — before touching any HTML (commit these files):**
```bash
python3 tools/v3/gate.py snapshot --surface admin --out upgrade-v3/admin/data-baseline.json
python3 tools/v3/capture.py      --surface admin --out upgrade-v3/admin/baseline --theme light
python3 tools/v3/capture.py      --surface admin --out upgrade-v3/admin/baseline-full --full --theme light
```

**After each family / before every commit:**
```bash
python3 tools/v3/capture.py --surface admin --out upgrade-v3/admin/after --theme light
python3 tools/v3/gate.py check --surface admin --min-change 0.30 \
  --data upgrade-v3/admin/data-baseline.json \
  --before upgrade-v3/admin/baseline --after upgrade-v3/admin/after \
  --report upgrade-v3/admin/GATE_REPORT.md --compare upgrade-v3/admin/compare
python3 tools/v3/gate.py links --surface admin
```
**Dark default (eyeball + console check):** `python3 tools/v3/capture.py --surface admin --out upgrade-v3/admin/after-dark --theme dark`

| Gate | Pass condition |
|---|---|
| **DATA** | 0 missing tokens vs `data-baseline.json` |
| **VISUAL** | ≥ 30% of pixels changed in the 1440 first viewport (comparing the same theme) |
| **RESIDUE** | v3 CSS loaded · legacy surface CSS unlinked · no legacy body classes · no inline styles (custom properties OK) |
| **LINKS** | 0 broken relative links (baseline is 0) |
| **CONSOLE** | `_console-errors-*.txt` absent or empty in `after/` |
| **EYEBALL** | You opened `compare/<page>.png` for every flagship page, and for ≥1 page per family at 390px, and wrote one honest line per page in `PROGRESS.md` (what changed, what is still weak) |

A page is **VERIFIED** only when every gate passes. **Never** write "A+", "≥95" or similar self-scores. `PAGE_REVIEW.md` gets the gate results (see §10). Human reviewers grade.


---

## 9. Forbidden: these patterns are what caused the "no change" result

- ❌ Adding a new override file or body class on top of the legacy sheets instead of unlinking them.
- ❌ Editing only colours/spacing in CSS and calling a page redesigned (layout must follow the archetype recipe).
- ❌ Leaving the old shell markup (sidebar, topbar, page-intro block) in place.
- ❌ Teal mono eyebrows, uppercase tracked labels, mint-tinted surfaces, teal-bordered KPI cards, gradient glows on app pages, glassmorphism in apps.
- ❌ Separate floating KPI cards with coloured left borders (use one hairline-divided strip).
- ❌ Mono font for numbers/money (mono only for IDs/keys).
- ❌ Font weights 600/700/800; radii > 12px (except pills); `transition: all`; more than one entrance animation per view.
- ❌ Inventing data, logos, testimonials, metrics or "live" AI. Removing routes or pages.
- ❌ Installing React/Tailwind/component kits, or copying code from paid templates (Tailwind Plus is study-only).
- ❌ Editing anything under `proto/` or linking prototype pages to `proto/shared/` assets.
- ❌ Dumping surface-only CSS/JS into `prototype/shared/` (public animations, client shell, admin tables belong under that surface's `assets/`).
- ❌ Claiming COMPLETE while any gate fails; self-assigned grades.

## 10. Ledger, `PAGE_REVIEW.md`, git

**Ledger** in `upgrade-v3/admin/`:
- `PAGE_COVERAGE.csv`: `path,archetype,family,status(todo|wip|verified),visual_change,data_ok,residue_ok,notes`
- `PROGRESS.md`: phase log + one honest line per page
- `DIRECTION_CONTRACT.md`: table mapping each `direction.md` item for this surface → the concrete selector/component that implements it
- `baseline/`, `after/`, `compare/`, `GATE_REPORT.md`, `data-baseline.json`

**`PAGE_REVIEW.md`:** for each page in scope, update its row/card: set *Build / commit reviewed*, paste the gate result (Visual Δ %, Data ok, Residue ok), the archetype, and link `upgrade-v3/admin/compare/<page>.png`. Leave *Reviewer* fields and grades blank for the human.

**Git:**
- Branch `v3-admin` from the current default branch.
- **Commit per family** after its gates pass, e.g. `v3(admin): requests + quotes family on table/record/builder archetypes`. Each commit message body includes the family's gate summary line.
- Push at the end (and after big families). If push fails due to credentials, report `PUSH: BLOCKED (credentials)` and keep local commits. Never force-push.
- Do not commit `upgrade-v3/**/after/` if > 50 MB total; always commit `compare/` (thumbnails) and `GATE_REPORT.md`.


---

## 11. Final response format

```text
STATUS: COMPLETE | PARTIAL | BLOCKED
Part: v3.2 ADMIN (101 pages)
Gates: VERIFIED N/101 · median visual Δ X% (light vs light) · data misses 0 · residue 0 · broken links 0
Families committed: ① ② ③ ④ ⑤ ⑥ ⑦ ⑧ (✓/✗ + SHA)
Shell: sidebar 256→64 rail Y/N · ⌘K palette Y/N · view bar + filter chips Y/N · dark default Y/N
Weakest 3 pages + why:
PAGE_REVIEW updated: Y/N
Git: branch v3-admin · last commit · PUSH: ok | BLOCKED (reason)
NEXT: remaining admin families | v3 pipeline complete
```

## Resume

> Continue `ai-prompt-v3.2.md`. Read `upgrade-v3/admin/PROGRESS.md`, `PAGE_COVERAGE.csv`, latest `GATE_REPORT.md`. Keep VERIFIED pages. Continue at the first failing family. Same rules, same gates.
