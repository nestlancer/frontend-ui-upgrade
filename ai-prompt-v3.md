# Nestlancer Proto — Prompt v3 (rewritten) · PUBLIC / LANDING + AUTH

**File:** `ai-prompt-v3.md` · **Part 1 of 3** · Next: `ai-prompt-v3.1.md` (client) → `ai-prompt-v3.2.md` (admin)
**Repo:** https://github.com/nestlancer/frontend-ui-upgrade.git
**Read before coding:** `verified-backups/direction.md` (Exec summary, §1, §4 landing column, §5 Ⓐ) → `research/LINEAR_UI_RESEARCH.md` (all) → this file.
**Scope:** `proto/apps/landing/**` (21 pages) + optional `proto/index.html` hub. Do **not** edit `proto/apps/web/**` or `proto/apps/admin/**` HTML. Shared files (`assets/v3/nl-tokens.css`, `nl-base.css`, `nl-v3.js`, `ui.js` theme key) are created here and reused by v3.1/v3.2.

> **Run:** "Execute `ai-prompt-v3.md`. Rebuild every public + auth page to the v3 Linear-teal system, pass all gates in `tools/v3/gate.py`, update `PAGE_REVIEW.md`, commit per family, push."

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

Turn the public site + auth into a **Linear-grade marketing surface** for Nestlancer, a product studio with a delivery OS (fixed-price quotes, milestone payments, Project Hub, Razorpay/UPI).

Formula (direction.md §5 Ⓐ + Linear marketing): **dark-first · expressive minimalism · oversized type · one CTA per screen · the real product UI as the hero visual · bento proof · purposeful motion.**

**Visible outcome a stakeholder must notice in 3 seconds:**

| Now (baseline) | After |
|---|---|
| Cream/mint light canvas, grid-paper background | **Dark canvas `#08090A`** by default (light theme fully designed + toggle) |
| Left headline + illustrative SVG card (abstract leaf art) | **Centered oversized headline** + **HTML product frame** of the Nestlancer Project Hub built from real mock data |
| Teal mono eyebrows ("● INTAKE OPEN"), teal headline fragments | One neutral pill; headline in text-1 with a subtle text-1→text-3 gradient; teal only on the CTA |
| Two equal hero buttons | **One** primary CTA + one quiet text link |
| Equal 3-column feature rows | **Bento grid** with mini real-UI snippets |
| Auth: left form + right illustration rail | **Centered Linear-style auth card** on dark canvas, role-distinct operator variant |

---

## 2. Inputs

- Screenshots of the live site: `Nestlancer-public-screenshots/public/*.webp` (map: `screenshot-manifest.csv`).
- API truth for forms/fields: `backend-api-swagger/auth.openapi.json`, `contact.openapi.json`, `blog.openapi.json`, `portfolio.openapi.json`.
- Existing art in `proto/shared/assets/art/*.svg` may be reused **only** as small figure illustrations in articles/case studies, never as hero art.

## 3. References: borrow these patterns (rebuild in static HTML; never copy code)

| Reference | Signal | Take exactly this |
|---|---|---|
| **Linear homepage** | design benchmark | Dark canvas, centered display headline, product UI frame below hero, FIG-style technical captions, generous 128px section spacing, quiet nav |
| **Tailwind Plus Radiant** | "gold standard" (study only, paid) | Bento feature cards with live mini-UI, logo/testimonial rhythm, pricing layout |
| **Ramp** | bento-system pioneer | Strict bento grid rules: same gutters, size = importance, real UI in tiles, counted numbers |
| **Stripe** | trust benchmark | Short specific trust copy near CTAs; numbers as proof |
| **shadcn `login-03/04`** (125.7k★ lib) | auth blocks | Centered auth card, 40px inputs, divider, secondary link row |

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
(function(){var k='nl-theme-public',d='dark',t=null;
try{t=localStorage.getItem(k)}catch(e){}
var r=document.documentElement;r.setAttribute('data-theme',t||d);r.setAttribute('data-surface','public');r.setAttribute('data-theme-key',k);})();</script>
<link rel="stylesheet" href="…/shared/assets/proto.css">          <!-- legacy fallback only, temporary -->
<link rel="stylesheet" href="…/shared/assets/v3/nl-tokens.css">
<link rel="stylesheet" href="…/shared/assets/v3/nl-base.css">
<link rel="stylesheet" href="…/shared/assets/v3/nl-public.css">
<script defer src="…/shared/assets/v3/nl-v3.js"></script>
<!-- keep existing JS behaviour files (ui.js, workbench.js, studio.js, operator.js, …) if the page uses their data-* hooks -->
```

**Remove from migrated pages:** `studio.css`, `workbench.css`, `operator.css`, `public-flow.css`, `editorial.css`, `inbox.css` links (the residue gate fails if they remain), and the body classes `upgrade-v2 studio-v2 workbench-v2 workbench-admin workbench-client operator-v2 flow-v2 auth-v2 batch-*`. New body class: `class="nl nl-public"` (keep `data-page` / `data-surface`).
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

## 5. Public shell (`nl-public.css`)

**Theme default:** dark (`nl-theme-public`, default `dark`). Light theme must be equally finished (test both).

**Container:** max-width 1200px, padding-inline 24px (≤640px: 20px). Reading column 680px.

**Nav (64px):** sticky; bg-0 at 80% + `backdrop-filter: blur(12px)` only after scroll (add `.is-scrolled` via `nl-v3.js`), 1px border-1 bottom after scroll. Left: logo mark (existing 3-leaf SVG, 22px) + "Nestlancer" 15/590 text-1. Center: Product, Services, Portfolio, Pricing, Blog, About (14/510 text-3 → hover text-1, current page text-1). Right: theme toggle (icon-only 32px ghost, `aria-label`), "Sign in" (ghost sm), "Start a project" (primary sm 32px). ≤900px: links collapse into a full-height sheet (bg-0, links 24/590 stacked, CTA at bottom, focus-trapped, Esc closes).

**Section rhythm:** section padding-block 128px desktop / 80px mobile. Section head: H2 40/590 −0.02em text-1 (mobile 30) + 1-line sub 18 text-3, max 56ch. Max **one** CTA per section.

**Footer:** 4 link columns (Product, Company, Resources, Legal) 13px text-3, small brand line, theme toggle, © line. Border-top border-1. No newsletter box unless one existed.

**Motion (max 3 signatures site-wide):**
1. Hero entrance: headline + sub + CTA fade/rise 8px, 300ms ease-out, 60ms stagger; product frame fades in 150ms later.
2. Scroll reveal: sections fade/rise 8px once at 15% visibility (IntersectionObserver in `nl-v3.js`).
3. Bento tiles: hover lifts the inner mini-UI by 2px and brightens its border to border-3 (150ms).
No parallax, no autoplay video, no cursor trails. All disabled under reduced motion.

## 6. Archetype recipes (follow literally)

### P1 · Home (`landing/index.html`)
1. **Hero** (padding-top 120px, centered):
   - One pill: `● Intake open · Q4 2026`. 26px tall, border-2, radius pill, 12/510 text-2, 6px ok-dot. Use the existing intake copy.
   - H1 `var(--nl-fs-display)` / 1.02 / −0.035em / 590, max 14ch, `background:linear-gradient(180deg,var(--nl-text-1) 55%,var(--nl-text-3)); -webkit-background-clip:text; color:transparent`. **Keep the existing headline text** ("Ship with clients in the loop — and money under control.").
   - Sub 18/1.55 text-3, max 52ch (shorten the existing paragraph to ≤ 2 lines; move detail lower).
   - CTA row: primary lg "Start a project →" + text link "Tour the product" (text-2, underline on hover). Under it, a 13px text-3 trust line from existing copy (e.g. "Fixed-price quotes · Milestone payments · Razorpay / UPI").
2. **Product frame** (margin-top 64px, full container width): a static HTML/CSS mock of the **Nestlancer Project Hub in dark app style**, built from existing mock data (NL-204, "Frontend development — SaaS Landing Redesign", milestone 3, "Due Fri · ₹48,000", 68%, status checklist). Frame: bg-1, border-2, radius 12, inner mini-sidebar 180px + list rows 32px + right detail panel. Behind it: one radial glow `radial-gradient(60% 50% at 50% 0%, rgba(60,196,178,.12), transparent)`. Caption below in mono 12 text-4: `FIG 01 — Project Hub · Brief → build → deliver` (keep the existing FIG language).
3. **Proof strip:** 4 figures already present in the page/site data (e.g. milestones, delivery cadence). Value 40/590 tabular text-1, label 13 text-3, hairline dividers. No invented numbers. If fewer than 4 real figures exist, use 3.
4. **How it works:** 3 steps Brief → Fixed quote → Milestone payments, laid out as a horizontal track (1px border-2 line with 3 nodes), each with FIG label, 20/590 title, 2-line copy, and a tiny real-UI chip (quote total, milestone row, UPI receipt). Mobile: vertical.
5. **Bento** (12-col, gap 16, tiles radius 12, bg-1, border-1, padding 24): A 8×2 "Project Hub" (mini board), B 4×1 "Milestone payments" (₹ ledger rows), C 4×1 "Razorpay / UPI" (receipt), D 4×1 "Threads" (2 message rows), E 4×1 "Verified documents" (verification seal row), F 4×1 "Fixed quotes" (quote total). Each tile: title 15/590 text-1 + 1 line text-3 + mini UI. **No icon-in-circle headers.**
6. **Featured case study** (from portfolio data): large row with metric line + "Read case study" link.
7. **Final CTA band:** H2 48/590 centered + one primary CTA. Then footer.

### P2 · Marketing pages (`about`, `services`, `pricing`, `contact`, `contact-alt`)
Shared top: page hero (padding-top 96): H1 clamp(40px,5.5vw,64px)/1.05/−0.03em, sub 18 text-3, optional one CTA. Then:
- **services:** service bento (each service = tile with scope bullets + "from ₹…" only if price exists) → engagement process (reuse P1 track) → CTA band.
- **pricing:** 3 engagement cards in a row (equal height, bg-1, border-1, radius 12, padding 28). The recommended one gets border accent-line + "Most chosen" neutral pill, **not** a filled teal card. Price 40/590 tabular with unit lighter. Feature list 14 text-2 with 14px check icons text-3. Below: comparison table (rows 44px, sticky first column on mobile) → FAQ as `<details>` accordion (border-bottom border-1, 56px rows, chevron rotates 150ms).
- **about:** statement section (32/1.3 text-1, max 28ch, one sentence) → principles 2×2 grid (title 18/590 + 2 lines) → studio facts row (tabular figures that exist) → CTA.
- **contact / contact-alt:** 2 columns (5/7): left H1 + contact methods as list rows (icon 16 text-3, label, value), response-time note; right form card (bg-1, border-1, radius 12, padding 28, fields 40px, primary full-width submit, inline validation states designed and demoable). Keep both variants' content; contact-alt may use the stacked single-column version.

### P3 · Index (`blog`, `portfolio`)
- **blog:** header (H1 48 + sub) → category chips row (26px chips, active = bg-3 text-1) → featured post (2-col: text left, cover right from existing art, radius 12) → post list as rows (date mono 12 text-4 left column 120px · title 20/590 text-1 · excerpt 15 text-3 · reading time), border-bottom border-1, row hover title underline. (Linear changelog/blog feel.)
- **portfolio:** header → filter chips → 2-col grid of case cards: cover (existing art, 16:10, radius 8, border-1) → client · year text-3 13 → title 20/590 → one outcome metric line in text-1 tabular. Hover: cover border-3 + title underline.

### P3b · Article / case (`blog/[slug]`, `portfolio/[id]`, `portfolio/fintech-payments-hub`)
- Article: back link → meta (category · date · read time) 13 text-3 → H1 48/1.08 −0.03em (mobile 34) → lede 20 text-2 → body 17/1.7 text-2 in a 680px column, h2 24/590 with `scroll-margin-top:96px`, figures with mono FIG captions, code blocks bg-2 radius 8 mono 13, blockquote 1px left border-3 text-1. Optional sticky TOC (≥1200px) on the right in 13 text-3.
- Case study: hero (title + one-line outcome) → facts rail (client, timeline, stack, team, outcomes as tabular figures) in a 4-col strip → Challenge / Approach / Result sections with real metrics → next case link → CTA.

### P4 · Legal (`terms`, `privacy`)
2-col: sticky TOC 220px (13 text-3, current section text-1 via IntersectionObserver) + 720px content; H1 40, "Last updated" 13 text-3, body 15/1.75 text-2, numbered h2 20/590. Mobile: TOC becomes a `<details>` "On this page".

### P5 · Auth (`login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `verify`, `admin-login`)
Treat as a **new access system** (stakeholder override: current = B).
- Full-viewport bg-0 (dark default), faint radial glow at top (same as hero, 8%). Top-left logo link home; top-right theme toggle.
- **Centered card column 380px**: logo mark 28px → H1 24/590 text-1 ("Sign in to Nestlancer") → 14 text-3 sub (1 line) → fields (40px, labels above) → primary lg full width → helper row (Remember me checkbox + "Forgot password?" link) → divider "or" (only if an alternate method exists in API/copy) → footer line "Don't have an account? Sign up".
- **States to design and make demoable via existing JS hooks:** default, focus, invalid (field-level message), submitting (button spinner + "Signing in…"), server error banner (bad-soft bg, 13px), success (verify-email). Password show/hide as an icon button inside the input (`aria-label`). OTP (`verify-email`, `verify`): 6 boxes 44×52, mono 20, auto-advance + paste.
- **register:** same column, may widen to 420px; group name/company/email/password; password-strength meter (4 segments, tone colours + text label); terms checkbox.
- **admin-login (operator):** same frame but role-distinct: label above H1 `Operator console`, 12/510 text-3 in a neutral pill with a lock icon; card gets a 1px border-2 and bg-1 (client auth is frameless); a warn-soft notice "Restricted · actions are audited"; keep the existing identity/MFA step copy. Client vs operator must be distinguishable at a glance without new colours.
- Remove the right illustration rail and the "Project Hub preview" collapsible from auth pages (move nothing; that content already lives on marketing pages). **Keep all existing copy that explains client vs operator access.**

### P6 · Utility (`verify-document`)
Centered 520px card: H1 28/590, explanation 14 text-3, input (mono, 40px) + Verify button; result area with three designed states shown via existing hooks: valid (ok seal row with document facts in a 2-col definition list), not found (bad-soft), malformed (field error).

### Hub (`proto/index.html`, optional)
Only if time remains: restyle with v3 tokens (dark), keep every link. Do not restructure.

## 7. Page map — every in-scope file (21 + hub)

| Archetype | Pages |
|---|---|
| P1 Home | `landing/index.html` |
| P2 Marketing | `about`, `services`, `pricing`, `contact`, `contact-alt` |
| P3 Index | `blog`, `portfolio` |
| P3b Article/Case | `blog/[slug]`, `portfolio/[id]`, `portfolio/fintech-payments-hub` |
| P4 Legal | `terms`, `privacy` |
| P5 Auth | `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `verify`, `admin-login` |
| P6 Utility | `verify-document` |
| Hub (optional) | `proto/index.html` |

**Families / commit order:** ① system + shell (nav/footer script across all 21) → ② P1 home → ③ P5 auth (7) → ④ P2 marketing (5) → ⑤ P3 + P3b (5) → ⑥ P4 + P6 (3) → ⑦ hub (optional).

### Execution protocol
1. **Phase 0:** setup + baseline (§8). Commit `upgrade-v3/public/` baseline + `PAGE_COVERAGE.csv` (all 21 rows `todo`).
2. **Phase 1, system:** write `nl-tokens.css` (verbatim §4.2), `nl-base.css` (§4.3), `nl-public.css`, `nl-v3.js` (theme boot helpers, toggle w/ per-surface key, nav scroll state, mobile sheet, reveal, copy). Patch `ui.js` theme key (§4.1).
3. **Phase 2, scripted migration:** write `tools/v3/migrate_public.py` (Python + `beautifulsoup4` or careful regex) that, for each landing page: rewrites `<head>` per §4.1, sets `<body class="nl nl-public">`, replaces header/nav and footer with the single template in `tools/v3/shell/public-nav.html` / `public-footer.html` (current link marked `aria-current="page"`), and lists inline styles for manual conversion. Run it, render, fix.
4. **Phase 3:** rebuild page bodies family by family using §6 recipes. Strip inline styles. Run gates. Commit per family.
5. **Phase 4:** dark-default capture → `after-dark/` (§8); eyeball the 6 flagship pages in both themes; `PAGE_REVIEW.md`; push.

---

## 8. Gates: the only definition of "done"

Tools already exist in the repo: `tools/v3/capture.py`, `tools/v3/gate.py`. Do not weaken them. You may only *add* checks.

**Setup (once per sandbox):**
```bash
pip install playwright pillow && python3 -m playwright install --with-deps chromium
```

**Phase 0 — before touching any HTML (commit these files):**
```bash
python3 tools/v3/gate.py snapshot --surface landing --out upgrade-v3/public/data-baseline.json
python3 tools/v3/capture.py      --surface landing --out upgrade-v3/public/baseline --theme light
python3 tools/v3/capture.py      --surface landing --out upgrade-v3/public/baseline-full --full --theme light
```

**After each family / before every commit:**
```bash
python3 tools/v3/capture.py --surface landing --out upgrade-v3/public/after --theme light
python3 tools/v3/gate.py check --surface landing --min-change 0.30 \
  --data upgrade-v3/public/data-baseline.json \
  --before upgrade-v3/public/baseline --after upgrade-v3/public/after \
  --report upgrade-v3/public/GATE_REPORT.md --compare upgrade-v3/public/compare
python3 tools/v3/gate.py links --surface landing
```
**Dark default (eyeball + console check):** `python3 tools/v3/capture.py --surface landing --out upgrade-v3/public/after-dark --theme dark`

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

**Ledger** in `upgrade-v3/public/`:
- `PAGE_COVERAGE.csv`: `path,archetype,family,status(todo|wip|verified),visual_change,data_ok,residue_ok,notes`
- `PROGRESS.md`: phase log + one honest line per page
- `DIRECTION_CONTRACT.md`: table mapping each `direction.md` item for this surface → the concrete selector/component that implements it
- `baseline/`, `after/`, `compare/`, `GATE_REPORT.md`, `data-baseline.json`

**`PAGE_REVIEW.md`:** for each page in scope, update its row/card: set *Build / commit reviewed*, paste the gate result (Visual Δ %, Data ok, Residue ok), the archetype, and link `upgrade-v3/public/compare/<page>.png`. Leave *Reviewer* fields and grades blank for the human.

**Git:**
- Branch `v3-public` from the current default branch.
- **Commit per family** after its gates pass, e.g. `v3(public): rebuild auth access system (7 pages) on v3 tokens`. Each commit message body includes the family's gate summary line.
- Push at the end (and after big families). If push fails due to credentials, report `PUSH: BLOCKED (credentials)` and keep local commits. Never force-push.
- Do not commit `upgrade-v3/**/after/` if > 50 MB total; always commit `compare/` (thumbnails) and `GATE_REPORT.md`.


---

## 11. Final response format

```text
STATUS: COMPLETE | PARTIAL | BLOCKED
Part: v3 PUBLIC (21 pages + hub)
Gates: VERIFIED N/21 · median visual Δ X% (light vs light) · data misses 0 · residue 0 · broken links 0
Families committed: ① ② ③ ④ ⑤ ⑥ ⑦ (✓/✗ each, with commit SHA)
Shared system created: nl-tokens.css / nl-base.css / nl-v3.js / ui.js key (Y/N)
Weakest 3 pages + why:
PAGE_REVIEW updated: Y/N
Git: branch v3-public · last commit · PUSH: ok | BLOCKED (reason)
NEXT: ai-prompt-v3.1.md (client) | remaining public pages
```

## Resume

> Continue `ai-prompt-v3.md`. Read `upgrade-v3/public/PROGRESS.md` + `PAGE_COVERAGE.csv` + latest `GATE_REPORT.md`. Do not redo VERIFIED pages. Continue at the first family with failing gates. Same rules, same gates.
