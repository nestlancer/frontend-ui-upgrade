# Nestlancer Proto — Prompt v3.1 (rewritten) · CLIENT PORTAL

**File:** `ai-prompt-v3.1.md` · **Part 2 of 3** · Previous: `ai-prompt-v3.md` (public) · Next: `ai-prompt-v3.2.md` (admin)
**Repo:** https://github.com/nestlancer/frontend-ui-upgrade.git
**Read before coding:** `verified-backups/direction.md` (§3, §4 client column, §5 Ⓑ) → `research/LINEAR_UI_RESEARCH.md` → this file.
**Scope:** `proto/apps/web/**` (52 pages). Do **not** edit landing or admin HTML. Reuse shared `assets/v3/` files; add client rules only in `nl-client.css`.

> **Run:** "Execute `ai-prompt-v3.1.md`. Rebuild every client portal page to the v3 Linear-teal system, pass all gates in `tools/v3/gate.py`, update `PAGE_REVIEW.md`, commit per family, push."

---

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

Make the client portal feel like a **calm, welcoming, Linear-quality workspace for a client of a product studio**: *what needs me, where is my project, what do I owe.* It must feel friendlier and airier than the admin console but share the same system.

Formula (direction.md §5 Ⓑ + Copilot/Midday/Linear): **light default · bento home that leads with the one action that matters · progressive disclosure · designed empty states · money you can read at a glance.**

**Visible outcome a stakeholder must notice in 3 seconds:**

| Now (baseline) | After |
|---|---|
| Mint-tinted sidebar + topbar + tall page intro ("● ANANYA IYER / Overview / One action…") | Linear-style shell: neutral sidebar on bg-0, **content in a floating white panel** (inset 8px, radius 12), compact 52px header |
| Dashboard = five KPI tiles + bar list + tabs ("Live workbench") | **Bento home:** greeting + single urgent action, active project with milestone track, pay-next money tile, messages, quotes (designed empty), billing bar, activity |
| Mono numerals (`₹14,400.00` in mono) | Sans tabular numerals, units lighter, money right-aligned |
| Generic tables/cards everywhere | Archetype layouts: list rows, record pages with tabs + summary rail, **paper-style quote/invoice documents**, settings with sub-nav |
| Empty sections = faint zeros | Every zero/empty is a designed onboarding surface |

---

## 2. Inputs

- Live screenshots: `Nestlancer-clients-screenshots/clients/*.webp` (map: `screenshot-manifest.csv`).
- API truth: `backend-api-swagger/projects`, `requests`, `quotes`, `payments`, `messaging`, `notifications`, `users`, `media` `.openapi.json`. Status names, money fields, milestone structure come from here.
- Demo user: Ananya Iyer (`resource.md`). Keep all names, ₹ amounts, IDs, dates.

## 3. References: borrow these patterns (rebuild in static HTML)

| Reference | Signal | Take exactly this |
|---|---|---|
| **Copilot / Assembly** client portal | **G2 4.8/5 (294 reviews)**, top-rated portal for service businesses | Portal IA: Home = "needs you" + activity; Messages, Files, Contracts/Quotes, Billing in a short left nav; friendly empty states |
| **Midday** | **15.1k★**, finance/invoicing for freelancers | Invoice document view, money summary bar, calm monochrome finance tables |
| **HoneyBook Smart Files** | **G2 4.5/5** | Quote = one linear document: scope → milestones/payment schedule → terms → accept → pay deposit |
| **Linear** (light theme) | benchmark | Dim sidebar, floating content panel, compact headers, list rows, keyboard hints |
| **shadcn `dashboard-01` / settings layout** | 125.7k★ lib | Section cards, settings with left sub-nav and row-based fields |

---

## 4. The Nestlancer v3 design system ("Linear-teal"), shared by all three surfaces

> **Single source of truth.** `proto/shared/assets/v3/nl-tokens.css` and `nl-base.css` are shared by public, client and admin.
> **If they already exist** (another v3 prompt ran first): **do not rewrite or fork them.** Diff against the spec below and only *add* what's missing. Surface-specific rules go in your surface file only.

### 4.1 File architecture (create exactly this)

```
proto/shared/assets/v3/
  nl-tokens.css    # tokens (light + dark) + LEGACY TOKEN REMAP (shared)
  nl-base.css      # reset, type, focus, primitives: btn, input, select, field, status, badge,
                   # table, list-row, card, kbd, tabs, chip, empty, skeleton, toast, dialog,
                   # avatar, progress, kpi, disclosure (shared)
  nl-public.css    # public marketing + auth layouts            (v3   / ai-prompt-v3.md)
  nl-client.css    # client portal shell + archetypes           (v3.1 / ai-prompt-v3.1.md)
  nl-admin.css     # operator console shell + archetypes        (v3.2 / ai-prompt-v3.2.md)
  nl-v3.js         # per-surface theme, sidebar collapse, ⌘K, scroll-reveal, row-link, copy (shared)
```

**`<head>` order on every migrated page** (paths relative to the page):

```html
<script>/* theme boot — must be first, prevents flash */
(function(){var k='nl-theme-client',d='light',t=null;
try{t=localStorage.getItem(k)}catch(e){}
var r=document.documentElement;r.setAttribute('data-theme',t||d);r.setAttribute('data-surface','client');r.setAttribute('data-theme-key',k);})();</script>
<link rel="stylesheet" href="…/shared/assets/proto.css">          <!-- legacy fallback only, temporary -->
<link rel="stylesheet" href="…/shared/assets/v3/nl-tokens.css">
<link rel="stylesheet" href="…/shared/assets/v3/nl-base.css">
<link rel="stylesheet" href="…/shared/assets/v3/nl-client.css">
<script defer src="…/shared/assets/v3/nl-v3.js"></script>
<!-- keep existing JS behaviour files (ui.js, workbench.js, studio.js, operator.js, …) if the page uses their data-* hooks -->
```

**Remove from migrated pages:** `studio.css`, `workbench.css`, `operator.css`, `public-flow.css`, `editorial.css`, `inbox.css` links (the residue gate fails if they remain), and the body classes `upgrade-v2 studio-v2 workbench-v2 workbench-admin workbench-client operator-v2 flow-v2 auth-v2 batch-*`. New body class: `class="nl nl-client"` (keep `data-page` / `data-surface`).
**Theme toggle:** update `ui.js` so the toggle reads/writes `document.documentElement.dataset.themeKey` (fall back to `'nl-theme'`). Per-surface keys: `nl-theme-public`, `nl-theme-client`, `nl-theme-admin`. Defaults: **public = dark, client = light, admin = dark**.

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
11. **Offline-safe.** No CDNs, no external fonts or images. Use `assets/fonts/Geist-Variable.woff2` (supports weights 400/510/590) and inline SVG.
12. **Vercel web-interface checklist** (`research/LINEAR_UI_RESEARCH.md` §2): `…` character, curly quotes, `aria-label` on icon buttons, labels on every control, `touch-action:manipulation` on controls, `scroll-margin-top` on anchors, `<meta name="theme-color">` matching bg-0, `color-scheme` set.


---

## 5. Client shell (`nl-client.css`)

**Theme default:** light (`nl-theme-client`). Dark must be equally finished.

**Overrides for client** (in `nl-client.css` under `.nl-client`): `--nl-row:44px; --nl-sidebar:248px;` body 14px; KPI value 28px.

```
┌──────────────┬───────────────────────────────────────────────────────────┐
│ Sidebar 248  │ ┌───────────────────────────────────────────────────────┐ │
│ on bg-0      │ │ Header 52px: Title 15/590 · [secondary] [primary]     │ │
│              │ ├───────────────────────────────────────────────────────┤ │
│ Workspace    │ │ Content: max-width 1120, padding 32 (mobile 16)       │ │
│ ⌘K Search    │ │                                                       │ │
│ Home         │ │       (floating panel: bg-1, border-1, radius 12,     │ │
│ Projects     │ │        inset 8px from viewport top/right/bottom)      │ │
│ Requests     │ │                                                       │ │
│ Quotes       │ │                                                       │ │
│ Messages  6  │ │                                                       │ │
│ Billing      │ │                                                       │ │
│ ──────────── │ │                                                       │ │
│ Notifications│ │                                                       │ │
│ Settings     │ └───────────────────────────────────────────────────────┘ │
│ [AI] Ananya ▾│                                                           │
└──────────────┴───────────────────────────────────────────────────────────┘
```

- **Sidebar:** bg-0 (no border). Top: workspace row (24px avatar "AI" bg-3 text-2 + "Ananya Iyer" 13/510 + company 12 text-3 + chevron). Then a search button (32px, border-1, text-3 "Search…" + `⌘K` kbd) that opens the existing search. Nav items 32px, radius 6, 14/510, **text-3 inactive → text-1 active with bg-3 fill**, icon 16 text-3 (active text-1), count right-aligned 12 text-4 (no pill). Group label "Explore" 12/510 text-4 sentence case (Blog, Portfolio), collapsed by default via `<details>`. Bottom: Notifications, Settings, theme toggle (icon), Sign out in the user menu. Collapses to a 64px rail at 1024–1279px (labels on tooltip), becomes an off-canvas sheet ≤1023px with a 48px top bar (menu button, page title, avatar).
- **Merge nav:** "Billing" + "Invoices" + "Payments" become one **Billing** item whose page has tabs (Payments · Invoices · Methods). Keep all routes working: the old pages stay and render with the Billing tab set active.
- **Header (52px)** inside the panel: optional breadcrumb (13 text-3 › 13 text-1) or page title 15/590; right: max one primary + one secondary action; border-bottom border-1.
- **Remove:** topbar bell/chat red count pills (move counts into the sidebar), page-intro eyebrow blocks, "Live · 30s" ornaments, the "Prototype" FAB styling (restyle per §4.4).

## 6. Archetype recipes (follow literally)

### C1 · Home (`web/dashboard`): the flagship
Content max 1120. 12-col grid, gap 16.
1. **Greeting row** (no card): "Good afternoon, Ananya" 28/590 −0.02em text-1 + sub 15 text-3 "1 thing needs you today" (computed from existing data). Right: the **single** primary action = most urgent existing action (`Complete checkout · ₹19,200.00`).
2. **Bento** (tiles: bg-1, border-1, radius 12, padding 20, header 13/590 text-1 + "View all →" 13 text-3):
   - **A · Active project** (8 cols × 2 rows): "Corporate LMS for 200 Employees" 20/590, NL-204 id, status. A **horizontal milestone track**: nodes for each milestone (done = ok-dot filled, current = accent ring, upcoming = border-3), labels under nodes 12 text-3, current milestone details below (name, due date, `2/2 milestones approved`, `40%` progress 4px bar). Footer: "Next: Mid-project payment · ₹20,880.00 · due Oct 14" + "Open project →".
   - **B · Pay next** (4 cols): label "Pending payment" 12 text-3, `₹19,200.00` 32/590 tabular (₹ lighter), due/context line, primary-secondary button "Pay now", small 12 text-3 "Razorpay / UPI · receipts in Billing".
   - **C · Messages** (4 cols): "6 unread" + 2 latest message rows (avatar 24, name 13/510, 1-line preview 13 text-3, time 12 text-4).
   - **D · Quotes** (4 cols): if 0 → **designed empty state**: icon, "No quotes waiting", "When the studio sends a quote, you'll review and accept it here.", link "How quotes work".
   - **E · Billing** (4 cols): Invoiced `₹14,400.00` collected vs `₹19,200.00` pending as **one 8px stacked bar** (ok / warn-soft) + 2-row legend with tabular values.
   - **F · Requests** (4 cols): open count + latest request row with status; empty-state copy if none.
   - **G · Recent activity** (8 cols): timeline list, 6 items, 40px rows: 16px icon text-3, sentence 13 text-2 with bold object, time 12 text-4 right.
   - **H · Notifications** (4 cols): 32 total → "3 important" list + "View all".
3. Everything else from the old dashboard (vitals, pulse bars, "Live workbench" tabs) is **progressively disclosed**: keep the data in a `<details class="nl-disclosure">` "Workspace details" at the bottom (closed by default) so the data gate passes.
- Mobile 390: greeting → primary action full-width → A → B → C → D → E → F → G → H stacked; milestone track scrolls horizontally with snap.

### C2 · List / hub (`projects`, `requests`, `quotes`, `payments`, `invoices`, `notifications`, `messages`, + archive/completed/drafts/templates/threads/invoices variants)
Header: title + count (e.g. "Projects 3") + primary action if one exists. Below: tabs (Active · Completed · Archive, mapped to existing routes as links) + search input (32px, 280px) + status filter chip. Then **list rows** (not dense tables): 64px, left 32px object icon (bg-3 radius 8, 16px icon text-3) · title 14/510 text-1 + meta line 13 text-3 (ID mono · dates) · right: status + money (tabular) + chevron. Hover bg-3; whole row is a link. Optional mini KPI strip (max 4, hairline-divided, 56px tall) above the list **only** if the page already had stats. **Empty/sparse:** when < 3 rows, show the rows + a designed hint block ("Completed projects will appear here once milestones are approved"). Notifications: grouped by day (sticky 12/510 text-3 day labels), unread dot accent, "Mark all read" ghost.

### C3 · Record detail (`projects/[id]` + uuid + `nl-lms`, `requests/[id]` + 2, `payments/[id]` + 3)
- Header: breadcrumb (Projects › Corporate LMS…) + actions.
- Title block: 24/590 title, status, ID mono, key dates; progress bar for projects.
- Tabs (32px): **Overview · Milestones · Files · Messages · Payments** for projects (link to existing routes/anchors; keep `data-tab-*` hooks); requests: Overview · Activity; payments: none.
- Body 2-col (8/4): main = sections in panels (description, **milestone ledger**: each milestone row shows status, due, amount, payment state, linked invoice; this ₹-milestone ledger is Nestlancer's signature component); right rail 320px sticky = Summary (budget, paid, remaining as stacked bar; dates; studio contact with message button; IDs with copy).
- **payments/[id]**: Stripe-style: amount 32/590 tabular + status pill, then 2-col definition list (method, UTR/reference mono, date, invoice link, project link), then **timeline** (created → authorized → captured/settled) with timestamps; states designed for completed, not-due-yet, failed.

### C4 · Document (`quotes/[id]` + uuid, `invoices/[id]` + `NL-INV-2026-000009`, `payments/invoice/[id]` + `NL-INV-2026-000008`)
- Canvas bg-0; a centered **paper** 800px (bg-1, border-1, radius 12, padding 48, shadow-card), with a sticky action panel on the right (≥1280px) or bottom bar (mobile): primary = the document's real action (**Accept quote** / **Pay ₹…**), secondary Download PDF / Print.
- Paper layout: header row (Nestlancer mark + legal name | doc type 13/510 text-3 + number mono 15 text-1 + issue/due dates) → bill-to / from 2-col → line items table (description, qty, rate, amount right, tabular, rows 44px) → totals block right-aligned 280px (subtotal, GST/tax, total 20/590) → payment schedule (quotes: milestone rows with % and ₹) → terms 13 text-3 → footer note.
- **Quote** follows the HoneyBook linear flow with numbered section headers: ① Scope ② Milestones & payment schedule ③ Terms ④ Accept. Accept area = checkbox "I agree to the terms" + primary button; accepted state designed (ok seal row + date).
- `@media print` styles: hide shell, paper full-width, no shadows.

### C5 · Conversation (`messages/inbox`, `messages/[conversationId]`, `messages/thread/*`)
2-pane inside the panel: thread list 320px (search 32px; rows 64px: avatar 32, name 14/510, preview 13 text-3 1-line, time 12 text-4, unread accent dot) | conversation (header 52px: name + project link + menu; messages grouped by day; others' messages bg-3 radius 12 (top-left 4), own messages **accent-soft bg + text-1** radius 12 (top-right 4), max 68ch; attachments as file rows; composer: auto-grow textarea in a bordered box, attach icon, send primary sm, hint "⌘↵ to send" 12 text-4). Mobile: list → thread push navigation with back button. Empty thread state designed.

### C6 · Settings & forms (`profile`, `profile/edit`, `settings/*` (8), `payments/methods`, `requests/new`, `messages/new`, `messages/new/direct`)
- **Settings layout:** inside the panel, left sub-nav 200px (Account, Security, Sessions, Notifications, Billing, Files, Activity; 32px items like the sidebar) + content max 720. Each section: title 15/590 + description 13 text-3, then **rows** (label/description left 1/2, control right 1/2) separated by border-1 hairlines, 64px min height. Toggle switches 32×18. Dirty state shows a sticky bottom save bar (bg-2, shadow-pop, "Unsaved changes · Discard · Save").
- `settings/sessions` / `activity`: table rows with device/location/time, current session tagged. `settings/notifications`: matrix (event × Email/In-app) with switches.
- **Forms** (`requests/new`, `messages/new*`, `profile/edit`, `payments/methods`): single 640px column, grouped sections with section titles, field help, inline validation, primary action bottom-right in a sticky footer. `requests/new` is a 3-step stepper (Basics → Scope & budget → Review), all on one page with anchors; keep every field.

### C7 · Explainer / empty (`projects/new`, `quotes/new`)
Centered in the panel (max 480): 40px icon text-4 → title 20/590 (keep existing headline, e.g. "Projects are born from accepted quotes") → 2 lines text-3 → primary CTA to the real next step (Review quotes / Start a request) → secondary text link. Below: a 3-step mini diagram (Request → Quote → Project) with the current step highlighted.

## 7. Page map: every in-scope file (52)

| Archetype | Pages (under `web/`) |
|---|---|
| C1 Home | `dashboard` |
| C2 List/hub (15) | `projects`, `projects/completed`, `projects/archive`, `requests`, `requests/archive`, `quotes`, `quotes/drafts`, `quotes/templates`, `payments`, `payments/invoices`, `invoices`, `notifications`, `messages`, `messages/threads`, `messages/archived` |
| C3 Record detail (10) | `projects/[id]`, `projects/01a10a2c-5cfb-71fa-854b-d88f4481e3e8`, `projects/nl-lms`, `requests/[id]`, `requests/01a10a2c-530e-7354-b21b-f5ecdab54f7a`, `requests/4b8110f3-1d0e-4f8c-a111-3e0a1`, `payments/[id]`, `payments/01a10a2c-2d0e-7499-b769-967d17a42197`, `payments/01a10a2c-5d1c-73fa-8a13-ae6621f9c1c2`, `payments/01a10a2c-5d1c-73fa-8a13-b5a4b5e610a5` |
| C4 Document (6) | `quotes/[id]`, `quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9`, `invoices/[id]`, `invoices/NL-INV-2026-000009`, `payments/invoice/[id]`, `payments/invoice/NL-INV-2026-000008` |
| C5 Conversation (4) | `messages/inbox`, `messages/[conversationId]`, `messages/thread/[threadId]`, `messages/thread/01a10a2e-42f8-70c9-95f7-0d05d4fd738a` |
| C6 Settings/forms (14) | `profile`, `profile/edit`, `settings`, `settings/account`, `settings/security`, `settings/sessions`, `settings/notifications`, `settings/billing`, `settings/files`, `settings/activity`, `payments/methods`, `requests/new`, `messages/new`, `messages/new/direct` |
| C7 Explainer (2) | `projects/new`, `quotes/new` |

**UUID / `[id]` twins** must render identically (same template, their own data). Build one, then generate the twins from it with a script, preserving each file's data.

**Families / commit order:** ① system + shell script across all 52 → ② C1 dashboard → ③ projects (C2/C3/C7) → ④ requests + quotes (C2/C3/C4/C7) → ⑤ billing (payments, invoices, methods: C2/C3/C4/C6) → ⑥ messages (C2/C5/C6) → ⑦ notifications, profile, settings (C2/C6).

### Execution protocol
1. **Phase 0:** setup + baseline (§8). Commit baseline + `PAGE_COVERAGE.csv` (52 rows).
2. **Phase 1, system:** ensure shared `nl-tokens.css` / `nl-base.css` / `nl-v3.js` exist (create from §4 if v3 public hasn't run; else only add missing). Write `nl-client.css`.
3. **Phase 2, scripted shell:** `tools/v3/migrate_client.py`: rewrite `<head>` (§4.1), body class `nl nl-client`, replace sidebar + topbar with the single template `tools/v3/shell/client-shell.html` (active item computed from path; Billing merge), wrap content in the panel, remove the page-intro eyebrow block, list inline styles. Run, render all 52, fix.
4. **Phase 3:** build C1, then one exemplar per archetype, screenshot them into `upgrade-v3/client/templates/`, then apply per family. Strip inline styles. Gates. Commit per family.
5. **Phase 4:** dark-theme capture (`--theme dark` → `after-dark/`) eyeball 8 flagship pages; `PAGE_REVIEW.md`; push.

---

## 8. Gates: the only definition of "done"

Tools already exist in the repo: `tools/v3/capture.py`, `tools/v3/gate.py`. Do not weaken them. You may only *add* checks.

**Setup (once per sandbox):**
```bash
pip install playwright pillow && python3 -m playwright install --with-deps chromium
```

**Phase 0 — before touching any HTML (commit these files):**
```bash
python3 tools/v3/gate.py snapshot --surface web --out upgrade-v3/client/data-baseline.json
python3 tools/v3/capture.py      --surface web --out upgrade-v3/client/baseline --theme light
python3 tools/v3/capture.py      --surface web --out upgrade-v3/client/baseline-full --full --theme light
```

**After each family / before every commit:**
```bash
python3 tools/v3/capture.py --surface web --out upgrade-v3/client/after --theme light
python3 tools/v3/gate.py check --surface web --min-change 0.30 \
  --data upgrade-v3/client/data-baseline.json \
  --before upgrade-v3/client/baseline --after upgrade-v3/client/after \
  --report upgrade-v3/client/GATE_REPORT.md --compare upgrade-v3/client/compare
python3 tools/v3/gate.py links --surface web
```
**Dark theme (eyeball + console check):** `python3 tools/v3/capture.py --surface web --out upgrade-v3/client/after-dark --theme dark`

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
- ❌ Claiming COMPLETE while any gate fails; self-assigned grades.

## 10. Ledger, `PAGE_REVIEW.md`, git

**Ledger** in `upgrade-v3/client/`:
- `PAGE_COVERAGE.csv`: `path,archetype,family,status(todo|wip|verified),visual_change,data_ok,residue_ok,notes`
- `PROGRESS.md`: phase log + one honest line per page
- `DIRECTION_CONTRACT.md`: table mapping each `direction.md` item for this surface → the concrete selector/component that implements it
- `baseline/`, `after/`, `compare/`, `GATE_REPORT.md`, `data-baseline.json`

**`PAGE_REVIEW.md`:** for each page in scope, update its row/card: set *Build / commit reviewed*, paste the gate result (Visual Δ %, Data ok, Residue ok), the archetype, and link `upgrade-v3/client/compare/<page>.png`. Leave *Reviewer* fields and grades blank for the human.

**Git:**
- Branch `v3-client` from the current default branch.
- **Commit per family** after its gates pass, e.g. `v3(client): bento dashboard + client shell`. Each commit message body includes the family's gate summary line.
- Push at the end (and after big families). If push fails due to credentials, report `PUSH: BLOCKED (credentials)` and keep local commits. Never force-push.
- Do not commit `upgrade-v3/**/after/` if > 50 MB total; always commit `compare/` (thumbnails) and `GATE_REPORT.md`.


---

## 11. Final response format

```text
STATUS: COMPLETE | PARTIAL | BLOCKED
Part: v3.1 CLIENT (52 pages)
Gates: VERIFIED N/52 · median visual Δ X% (light vs light) · data misses 0 · residue 0 · broken links 0
Families committed: ① ② ③ ④ ⑤ ⑥ ⑦ (✓/✗ + SHA)
Dashboard bento shipped: Y/N · Documents (quote/invoice) paper layout: Y/N · Empty states designed: list
Weakest 3 pages + why:
PAGE_REVIEW updated: Y/N
Git: branch v3-client · last commit · PUSH: ok | BLOCKED (reason)
NEXT: ai-prompt-v3.2.md (admin) | remaining client pages
```

## Resume

> Continue `ai-prompt-v3.1.md`. Read `upgrade-v3/client/PROGRESS.md`, `PAGE_COVERAGE.csv`, latest `GATE_REPORT.md`. Keep VERIFIED pages. Continue at the first failing family. Same rules, same gates.
