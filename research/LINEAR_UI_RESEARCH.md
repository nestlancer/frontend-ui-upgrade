# Linear-style UI Research → Nestlancer v3

**Date:** 2026-10-16 · **Feeds:** `ai-prompt-v3.md` (public), `ai-prompt-v3.1.md` (client), `ai-prompt-v3.2.md` (admin)
**Builds on:** `verified-backups/direction.md` (2026 trend report). This doc turns those trends into **concrete values, layouts, and reference templates**.

---

## 0. Why the previous v3 runs looked "unchanged"

Diagnosed by reading every surface + rendering pages at 1440/390 (Oct 16, 2026):

| # | Root cause | Evidence in repo | Fix in new prompts |
|---|---|---|---|
| 1 | **Prompts were abstract.** Trend words ("expressive minimalism", "quiet chrome") with no pixel values, so an agent can "satisfy" them with tiny tweaks. | Old v3 prompts ≈160 lines, zero tokens/sizes/layouts. | Exact token tables, shell dimensions, and a layout recipe per page archetype. |
| 2 | **Self-grading.** "Claim A+ ≥95" is a vibe score the agent gives itself. | `PAGE_REVIEW.md` grades were self-assigned. | Three **measured** gates (`tools/v3/gate.py`): data preserved, ≥35% visual change, no legacy residue. |
| 3 | **Layered CSS, never replaced.** Each upgrade added a new file + body class on top of the old ones; new rules lost to old specificity/`!important`. | `proto.css` 130 KB / 2,983 lines / 68 `!important`; plus `studio`, `workbench`, `operator`, `public-flow`, `editorial`, `inbox`.css; body classes like `upgrade-v2 workbench-v2 workbench-admin operator-v2 batch-five`. | One new `assets/v3/` system loaded **last**, which also **remaps the old token names**; legacy surface sheets must be unlinked per migrated page. |
| 4 | **3,083 inline `style=""` attributes** across 175 pages override any stylesheet. | grep count. | Residue gate fails any page with inline styles (CSS custom-property hooks allowed). |
| 5 | **Shell markup is duplicated in all 161 app pages** — fixing the sidebar means editing 161 files, so agents skipped it. | `<aside class="sidebar">` inlined per page. | Prompt mandates a scripted shell rewrite (Python) across the surface, not hand edits. |
| 6 | **The baseline is already "clean B".** Light teal-tinted SaaS. Small tweaks to a clean page are invisible. | Renders: light mint canvas, teal everywhere, 140 px page headers, mono numerals. | Explicit change list: neutral (not teal) greys, dark admin default, compact 44 px view headers, Linear row density, tabular sans numerals, product-frame hero. |
| 6b | **Proof:** palette-only change is invisible. | Injecting the full v3 token block (with legacy remap) into current pages changed **0.4%** of pixels on `admin/requests` (dark) and **2.4%** on `web/dashboard` (light), measured with `tools/v3/gate.py`. | Visual gate ≥30% (same theme) forces shell + layout rebuild. |
| 7 | **Tried all ~100 pages at once.** Shallow coverage. | Old prompt: "Redesign all admin HTML to A+". | Phased: system → shell → archetype templates → families; commit per family; gate per family. |

---

## 1. Linear — primary sources

### 1.1 Linear UI redesign (2024) — [linear.app/now/how-we-redesigned-the-linear-ui](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Theme generated in **LCH** from **3 variables: base color, accent color, contrast** (instead of 98 hand-set variables) → perceptually even surfaces/elevations.
- Contrast raised: **darker text/icons in light mode, lighter in dark mode**.
- "Return to a more neutral and timeless appearance" by **limiting how much chrome (brand color) feeds the color system**.
- Rolled out in milestones: stress-test main views → define behaviors for **sidebar, tabs, app headers, view headers** → chrome refresh → beta.

### 1.2 "A calmer interface for a product in motion" (Mar 12, 2026) — [linear.app/now/behind-the-latest-design-refresh](https://linear.app/now/behind-the-latest-design-refresh)
- **"Don't compete for attention you haven't earned."** Sidebar made *a few notches dimmer* so content leads; **muted inactive text, smaller icons, more vertical padding**.
- Tabs **compact**, rounded, smaller icon/text; first items icon-only pills.
- **Fewer icons, smaller icons**, removed colored icon backgrounds.
- **"Structure should be felt not seen."** Fewer separators, softer border contrast, rounded edges.
- Palette moved from cool blue-ish gray **toward a warmer, less saturated gray** that still feels crisp.
- Consistent header layout: actions (share, copy link…) always in predictable places.

### 1.3 Observable Linear constraints (third-party reconstructions — approximate)
Sources: [designmd.cc/benchmarks/linear](https://designmd.cc/benchmarks/linear), [identityforge.io — Linear read as constraints](https://identityforge.io/learn/linear-design-system), [designsystems.one/linear](https://www.designsystems.one/design-systems/linear).

| Aspect | Observed value |
|---|---|
| Canvas (dark) | `#08090a`; panel `#0f1011`; card ≈ `rgba(255,255,255,.05)` |
| Text | primary `#f7f8f8`, secondary `#d0d6e0`, tertiary `#8a8f98` |
| Borders | white alpha `.05` subtle / `.08` standard; hairlines instead of shadows |
| Type | Inter Variable; weights **400 / 510 / 590** (variable-font in-between weights); display 64/1.1/-0.02em, H2 24/510, body 16/400, small 13, caption 12 |
| Tracking | tightens with size: ≥48px −0.022em; 20–32px −0.012em; 13–17px −0.01em; uppercase labels +0.02em |
| Radius | 6 buttons · 8 cards · 12 panels (nothing larger) |
| Accent | **one** accent (indigo `#5e6ad2`) — primary buttons, active nav, focus only |
| Motion | 150 ms `cubic-bezier(.25,.46,.45,.94)` default; 300 ms `cubic-bezier(.165,.84,.44,1)` entrances |
| Focus | `0 0 0 2px accent/40%, 0 0 0 4px accent/20%` |

> Nestlancer translation: keep **teal `#0B7A71` as the one accent** (Linear-style restraint, not Linear's indigo). **Geist Variable is already self-hosted** in `proto/shared/assets/fonts/` and supports any weight 100–900, so 510/590 are available offline, with no external font.

### 1.4 Linear-style marketing — [toimi.pro best SaaS sites 2026](https://toimi.pro/blog/best-saas-website-designs/), [brainy.ink principles](https://brainy.ink/paper/landing-page-design-principles), [LogRocket "Linear design"](https://blog.logrocket.com/ux-design/linear-design/)
- Dark-by-default, one accent, **live/real product UI as the hero visual** (not illustration), bento feature grid, **technical labels (FIG x.x)**, heavy whitespace, single CTA.
- Linearity: no zig-zag content, one-dimensional scroll, consistently aligned text, minimal CTAs.
- Risk: everything looks the same → needs **one owned brand signature** (for Nestlancer: the teal "leaf" mark + FIG labels + ₹ milestone ledger).
- 2026 kill list: equal-weight 3-column feature rows (→ bento), heroes with multiple CTAs.

---

## 2. Template & product scorecard (what's liked, starred, reviewed)

GitHub stars fetched live from the GitHub API on 2026-10-16. Reviews from G2/Capterra as reported in the linked roundups.

| Reference | Signal | Why it fits Nestlancer | Borrow (pattern only — rebuild in static HTML) |
|---|---|---|---|
| **Linear app** | Industry benchmark named in `direction.md` | North star for admin + client chrome | Dim sidebar, 44 px view header, view bar with filter chips, 36 px dense rows, status icons, ⌘K, peek panels |
| **shadcn/ui** blocks | **125.7k★** (`shadcn-ui/ui`) | De-facto 2026 component language; neutral, Linear-adjacent | `sidebar-07` (collapses to icon rail), `dashboard-01` (section cards → chart → data table), data-table toolbar w/ faceted filters, `login-03/04` |
| **shadcn-admin** (satnaing) | **15.8k★** | Most-starred free admin on shadcn; Linear-like tasks table | Admin shell, tasks table (status/priority icons, row actions), settings with left sub-nav, command palette, auth set |
| **next-shadcn-dashboard-starter** (Kiranism) | **7.1k★** | Overview KPI cards + kanban | KPI "section cards" with delta + footnote, kanban for pipeline |
| **Midday** | **15.1k★** — invoicing/time/finance for freelancers | **Same domain as Nestlancer client billing** | Invoice document view, overview with money summary, transactions table, calm monochrome finance UI |
| **Twenty CRM** | **58.4k★** | Linear-grade record pages | Record show: left field list + right activity timeline; table views with chips |
| **Plane** | **60.9k★** — "open-source Linear alternative" | Dense list/board patterns at scale | Issue list rows, peek overview side panel, cycles/progress bars |
| **Stripe Dashboard** | Benchmark in `direction.md`; [925studios breakdown](https://www.925studios.co/blog/stripe-dashboard-design-breakdown) | Payments, payouts, disputes = Nestlancer payments | Table-first, right-aligned tabular numerals, color only for status, payment detail with timeline + metadata rail, designed empty states |
| **Vercel / Geist** | `direction.md`; [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Monochrome + color=meaning; interaction checklist | Status dots, deployment-style lists, the guideline checklist (focus, hit targets, tabular-nums, `…`, all states designed) |
| **Tailwind Plus — Radiant / Salient** | "Gold standard" in 2026 roundups ([Colorlib](https://colorlib.com/wp/tailwind-saas-startup-templates/), [inbuild](https://www.inbuild.io/blog/best-saas-landing-page-templates-2026)) — **paid license: study only, never copy code** | Marketing page rhythm | Animated bento cards, pricing table, testimonial/logo rows |
| **Ramp** | Bento-system pioneer ([toimi](https://toimi.pro/blog/best-saas-website-designs/)) | Finance-trust marketing | Strict bento grid rules, counted numbers, real product UI |
| **Copilot / Assembly** client portal | **G2 4.8/5 (294 reviews)** — highest-rated portal for service businesses ([Plutio roundup](https://www.plutio.com/freelancer-magazine/best-client-onboarding-software-for-freelancers)) | Exactly Nestlancer's client side: messages, files, contracts, invoices in one branded portal | Portal home = "what needs you" + recent activity; simple left nav; friendly empty states |
| **HoneyBook** Smart Files | **G2 4.5/5 (240+ reviews)** | Proposal + contract + pay on one page | Client quote page: scope → milestones → accept → pay deposit as one linear document |

**Selected stack per surface**

| Surface | Primary references | Secondary |
|---|---|---|
| Public / landing / auth | Linear marketing + Tailwind Plus Radiant (rhythm) + Ramp (bento discipline) | Stripe (trust copy), shadcn `login-03/04` |
| Client portal | Copilot/Assembly (portal IA) + Midday (finance docs) + Linear chrome (light) | HoneyBook (quote acceptance), shadcn `dashboard-01` cards |
| Admin console | Linear app (chrome, rows, ⌘K) + Stripe (tables, payment detail) + shadcn-admin (shell, tasks table) | Twenty (record pages), Plane (peek panel), Vercel (status) |

---

## 3. Cross-cutting rules distilled

1. **One accent.** Teal on primary button, active nav, focus ring, links. Never on headings, card borders, big fills, or data rows.
2. **Neutral greys, not teal-tinted greys.** Current tokens tint every surface mint (`#F2F6F5`, `#EAF7F4`) → reads "teal template". Use warm-neutral greys (Linear 2026 direction).
3. **Hierarchy by size + colour, weight ≤ 590.** No 700/800 weights.
4. **Hairlines over shadows** in-app; shadows only for overlays (menus, dialogs, toasts).
5. **Numbers:** `font-variant-numeric: tabular-nums` in Geist **sans**, right-aligned in tables; currency symbol/units set lighter. Mono only for IDs, keys, code.
6. **Status = dot/icon + text label** (never colour alone), muted fill at most.
7. **Compact headers.** App pages: 44 px header row (breadcrumb + title + actions), optional 40 px view bar; no 140 px marketing-style page intros inside the app.
8. **Design every state:** empty, loading (skeleton mirrors final layout), error, disabled, selected, focus.
9. **Motion budget:** 150 ms state transitions; one entrance (≤300 ms) per view; honour `prefers-reduced-motion`.
10. **Mobile:** 390 px first for public/client; admin at 390 must be usable (sidebar → sheet, tables → stacked rows or horizontal scroll with sticky first column).
