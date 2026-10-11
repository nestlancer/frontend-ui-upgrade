# Nestlancer Frontend Rebuild — Decision Document

**Purpose:** Every decision that must be locked before a single line of the new UI is written.
Each question lists the options, **my recommendation as your UI designer**, why, and **live URLs
you can open right now** so you are choosing from something you have seen, not from adjectives.

**How to use it:** Read Part 0 and Part 1 first (they are the diagnosis). Then go through
Groups A → E. My picks are pre-filled. Overrule anything you disagree with, fill in the answer
sheet at the end, and send it back. I then generate the AI prompt suite against these answers.

**Verified on:** 2026-10-09, by cloning `nestlancer-frontend-public` and `nestlancer-api-public`
and reading the merged OpenAPI spec. Every URL in this file was HTTP-checked the same day.

---

## TL;DR — my recommended stack, on one page

| # | Decision | My pick |
|---|---|---|
| A1 | **Visual direction** | **Linear-class dense app + Stripe-class marketing** (hybrid, one brand, two densities) |
| A2 | Brand color | Single accent, warm-neutral canvas. Kill all 3 current accents |
| A3 | Typography | **Geist Sans + Geist Mono** (Inter is the fallback pick) |
| A4 | Corner radius | **8px** everywhere. One value. No per-surface variance |
| A5 | Density | **Compact by default**, comfortable toggle for clients |
| A6 | Dark mode | Yes, but **light-first**, dark as an equal-cost second skin |
| A7 | Motion | Restrained. 150ms / 220ms. No orbs, no glass, no mesh |
| B1 | Token architecture | **One token file, zero per-app overrides** |
| B2 | Component base | **shadcn/ui (Radix) + Tailwind**, owned in-repo |
| B3 | Icon set | **Lucide**, 20px, 1.75 stroke. One set only |
| B4 | Illustration | None in-app. Photography for marketing only |
| B5 | Charts | **Recharts**, themed once at the wrapper level |
| B6 | Status system | **28 statuses → 6 semantic tones**, one `StatusBadge` |
| C1 | Framework | **Stay on Next 14 App Router** for the rebuild; upgrade later |
| C2 | Tailwind | **Stay on v3** during rebuild; v4 after |
| C3 | Repo shape | **Keep the monorepo.** Rebuild inside it |
| C4 | Data layer | **Keep orval + TanStack Query.** Do not touch |
| C5 | Build order | **Landing → Design system → Client portal → Admin** |
| D1 | Migration | **Strangler fig, screen by screen.** No big-bang rewrite |
| D2 | God components | **Decompose the 6 files over 700 lines** |
| D3 | Sign-off gate | **Static HTML mock approval before any component code** |
| E1 | A11y target | **WCAG 2.2 AA, enforced in CI** |
| E2 | Perf budget | LCP < 2.0s marketing, < 2.5s app; CLS < 0.1 |
| E3 | Design drift guard | **Zero arbitrary values allowed.** CI-enforced |

---

# Part 0 — What is actually wrong

Your client is not wrong, and neither is your professional reviewer. But "we don't like it" is not
a diagnosis. Here is the actual cause, read out of your own source files.

## 0.1 The product contains four different design languages

I found **four token files** that each define their own brand:

| File | Lines | What it is | Accent it defines |
|---|---|---|---|
| `packages/theme/tokens.css` | 142 | Base, "single source of truth" | `--accent-1: 250 100% 52%` → **violet** |
| `apps/web/src/styles/tailadmin-tokens.css` | 40 | *"Ported from TailAdmin/free-nextjs-admin-dashboard"* | `--ta-brand-500: #465fff` → **blue** |
| `apps/web/src/styles/public-editorial-tokens.css` | 211 | *"Nexus Fusion — scoped to public marketing pages only"* | `--accent-1: 175 84% 26%` → **teal** |
| `apps/admin/src/styles/gentelella-tokens.css` | 108 | *"Ported from gentelella/src/scss/v4/_tokens.scss"* | `--accent-1: 168 82% 26%` → **teal-green** |

Two of those are **free admin templates from other products**. `apps/web/src/app/globals.css`
imports all of them at once (lines 1–11). The file's own comment on line 3 of the editorial token
file says it out loud: *"Dashboard keeps TailAdmin blue (`ta-brand-*`)."*

So a single visitor crossing from your homepage into the portal changes brand color mid-session.
That is the #1 reason a professional reviewer calls a UI amateur. It is not a taste problem —
it is a systems failure.

## 0.2 Four typefaces in one application

```
apps/web/src/app/layout.tsx:2     → Fraunces, IBM_Plex_Mono, Instrument_Sans, Outfit
apps/admin/src/app/layout.tsx:2   → IBM_Plex_Mono, Inter
apps/landing/src/app/layout.tsx:2 → IBM_Plex_Mono, Instrument_Sans
```

Four UI/display faces across the platform. `Fraunces` (an expressive serif) and `Outfit` (a
geometric sans) sitting in the same app is a visible clash on every screen.

## 0.3 Even the geometry disagrees

| Token | `tokens.css` | `gentelella-tokens.css` |
|---|---|---|
| `--radius-sm` | `6px` | `4px` |
| `--radius-md` | `10px` | `6px` |
| `--sidebar-width` | `260px` | `228px` |
| `--header-height` | `64px` | `52px` |

Corners, rails and headers are different sizes on web vs admin. Nobody decided this; it
accumulated.

## 0.4 795 escape hatches

Counted across `apps/` and `packages/` (excluding generated code):

- `text-[...]` arbitrary values: **399**
- `w-[...]` / `h-[...]` arbitrary values: **231**
- `bg-[...]` arbitrary values: **111**
- Hard-coded hex colors inside `.tsx`: **50**
- `style={{` inline: **0** (this one is clean — credit where due)

Every one of those is a screen deciding its own spacing or type size instead of using a scale.
This is why no two pages feel related.

## 0.5 Six files that cannot be redesigned

| File | Lines |
|---|---|
| `apps/admin/src/features/system/SystemClient.tsx` | **1,902** |
| `apps/web/src/features/media/MediaLibraryClient.tsx` | 1,459 |
| `apps/admin/src/features/media/AdminMediaStorageBrowser.tsx` | 1,288 |
| `apps/admin/src/features/notifications/AdminNotificationsClient.tsx` | 1,279 |
| `apps/admin/src/features/users/UserDetailClient.tsx` | 1,116 |
| `apps/admin/src/features/payments/PaymentsClient.tsx` | 867 |

A 1,902-line React component is not restyleable. It gets rewritten or it keeps the old look.

## 0.6 What is already good — do not throw this away

I want to be precise, because a rebuild that discards working engineering is a mistake:

- **Contract-first API client.** `orval` generates from the backend OpenAPI, with `pnpm contract:check` in CI. 638 operations typed. This is better than most teams ever achieve.
- **The monorepo boundaries are correct.** 12 shared packages, clean `apps/{web,admin,landing}` split.
- **The deployment model is production-real.** GHCR + Infisical + Compose/K3s, matching the backend.
- **The domain modelling is genuinely rich.** `packages/ui/src/utils/status-registry.tsx` maps 28 distinct statuses across requests/quotes/projects/payments/users. Someone thought about the state machine.
- **Someone already cared about accessibility** — there are `NL-BUG-A11Y-001` fix comments in three token files.

**Conclusion:** your engineering is strong and your design is fragmented. The rebuild should be a
**design-system replacement and a screen-by-screen restyle**, not a rewrite of the plumbing.

---

# Part 1 — What the product actually is

This matters more than any aesthetic choice, because it decides which reference sites are even
valid. From `packages/constants/src/brand.ts`:

> `/** Canonical product positioning for Nestlancer. Single studio + client portal — not a freelancer marketplace. */`

> *"Nestlancer is a dedicated product studio. Clients submit a brief, receive a milestone quote,
> pay on schedule, and track delivery in one workspace."*

- **Tagline:** "Your dedicated studio — from brief to delivery"
- **Locale:** `en_IN`
- **Serves:** `IN`, `US`, `GB`, `AE`, `Worldwide`
- **Payments:** Razorpay (deposit + installments, milestone-based)
- **Offerings:** MVP Development, Web Application Development, Mobile Apps, UI/UX Design

### Why this changes the design brief

You are **not** Upwork, Fiverr or Toptal. Do not let anyone hand you a marketplace design as a
reference — a marketplace optimises for browsing many suppliers. You have **one** supplier: you.

What you actually are is the closest thing to a **client-facing project portal for an agency**:
brief → quote → deposit → milestones → payments → delivery. The correct reference set is therefore
**billing + project-tracking SaaS**, not marketplaces. That is why Mercury, Ramp and Stripe appear
below and Upwork does not.

### Scale of what we are rebuilding

| Surface | Pages | Notes |
|---|---|---|
| `apps/web` (client portal) | **63** | 41 dashboard, 15 public, 7 auth |
| `apps/admin` (console) | **76** | 74 dashboard, 1 login, 1 404 |
| `apps/landing` (marketing) | **9** | home, pricing, services, portfolio×2, blog×2, about, contact |
| **Total** | **148 pages** | 10 API route handlers, ~113k LOC, 674 source files |

Backend contract: **544 paths / 638 operations / 53 tags / 210 schemas**.

---

# Group A — Brand & visual direction

## A1. What visual direction do we commit to? ⭐ *The decision everything else follows*

This is the one your client and professional were reacting to. Pick one. Mixing is what got you here.

### Option A — Linear-class: dense, restrained, mono-accent

Neutral greys, exactly **one** accent colour, tight 4px grid, small radii, no gradients, no
glassmorphism, no decorative shapes. Reads as "serious engineering tool."

| See it live | What to look at specifically |
|---|---|
| https://linear.app | The nav, the button weight, how little colour there is. Scroll the whole page — count the colours. |
| https://linear.app/method | Their own written design principles. Genuinely useful for your client to read. |
| https://vercel.com | Dense SaaS at scale. Note the near-black canvas and single blue. |
| https://vercel.com/geist/introduction | Vercel's published design system — a model for how to document yours. |
| https://vercel.com/geist/colors | Their full colour scale. Compare to your 4 token files. |
| https://vercel.com/design | Component reference. |
| https://cal.com | Open-source, dense, calm. Very close to what your portal needs. |
| https://resend.com | Extreme restraint. Mostly black, white and one accent. |
| https://dub.co | Dense dashboard, excellent tables and empty states. |
| https://railway.com | Dark-first dense app with strong personality but total discipline. |
| https://supabase.com | Dark app UI, one green accent, heavy data. |
| https://clerk.com | Auth screens done properly — you have 7 auth pages to rebuild. |
| https://ui.shadcn.com/examples/dashboard | The literal component density this direction implies. |

**Best for:** your **admin console (76 pages)** and **client portal (41 pages)**.
**Risk:** can feel generic if the marketing site uses the same restraint. A studio that looks
like every other dev-tool loses its pitch.

### Option B — Stripe/Ramp-class: polished SaaS, warm neutral, confident brand

Slightly warmer canvas than pure grey, one strong brand colour used generously, generous whitespace
on marketing, still dense in-app. Reads as "trustworthy with money."

| See it live | What to look at specifically |
|---|---|
| https://stripe.com | The gold standard for money UI. Note the gradient restraint and type hierarchy. |
| https://stripe.com/payments/checkout | Your payment flow's benchmark. You use Razorpay — this is what clients expect. |
| https://ramp.com | Finance app, very high craft, great tables and status colours. |
| https://mercury.com | Banking for startups. Warm neutrals + one deep brand colour. Closest match to your portal. |
| https://mercury.com/blog | Editorial/marketing side of the same brand. Note the continuity. |
| https://wise.com | Money UI, Indian + global, excellent currency handling (relevant: `en_IN`). |
| https://razorpay.com | **Your actual payment provider.** Match their checkout feel so clients feel no seam. |
| https://planetscale.com | Warm, confident, technical without being cold. |
| https://attio.com | CRM-grade data density with a warmer, more human surface. |

**Best for:** a studio handling **client money and milestone payments**. This direction signals
financial trust, which is literally your product.
**Risk:** more work than Option A; the warmth has to be earned through real photography and copy.

### Option C — Editorial studio: big display type, craft-forward

Large serif or expressive display faces, asymmetric layouts, strong art direction, generous scale
contrast. Reads as "we are designers, look at our taste."

| See it live | What to look at specifically |
|---|---|
| https://collins.co | Award-winning studio site. The benchmark for "design studio that looks like one." |
| https://www.basement.studio | Motion + type craft. Extreme end of the spectrum. |
| https://activetheory.net | Award-winning, WebGL-heavy. Look at it, then ask if you can sustain it. |
| https://www.locomotive.ca | Editorial + motion, but disciplined. A realistic target. |
| https://studio.build | Portfolio-led studio site. |
| https://www.awwwards.com/websites/portfolio/ | Gallery of portfolio sites. Browse for tone, don't copy. |
| https://fonts.google.com/specimen/Fraunces | The expressive serif you already load. Look at it isolated — it's beautiful *alone*. |
| https://fonts.google.com/specimen/Instrument+Serif | A calmer, more usable display serif. |
| https://fonts.google.com/specimen/Newsreader | Editorial serif that still works at small sizes. |

**Best for:** your **9 landing pages** and the **15 public/portfolio pages**.
**Risk:** collapses under data density. You cannot render a 74-page admin console of payment tables
in an editorial language. Choosing C for everything guarantees the same failure you have now.

### 🎯 My recommendation: **Hybrid — A for the app, B for marketing, C rejected**

Concretely:

> **One brand, two densities.**
> - **Marketing + public (24 pages):** Stripe/Mercury-class. Warm neutral canvas, one deep brand
>   accent, large type scale, real photography of the studio's work. This is where personality lives.
> - **Portal + admin (117 pages):** Linear-class. Dense, neutral, the *same* brand accent used
>   sparingly, 4px grid, 8px radius, tabular numerals for money.
> - **Shared:** identical colour tokens, identical type family, identical radius, identical icon set.
>   Only *density* and *scale* change between the two.

**Why this and not a single direction:** the reason your current UI fails is not that it lacks
personality — it is that it has four personalities and no referee. A hybrid with **one token set
and an explicit density switch** gets the marketing distinctiveness a studio needs *and* the
in-app seriousness a payment portal needs. The rule that keeps it honest:

> **The marketing site may change scale and whitespace. It may never change colour, family, radius
> or iconography.**

**Why not pure C:** 117 of your 148 pages are dense data. An editorial language cannot survive them.

**Decision owner:** client + professional reviewer. **This must be signed off in writing before
any code.** Everything downstream depends on it.

---

## A2. What is the brand colour?

Today you have **three**: violet `250 100% 52%`, TailAdmin blue `#465fff`, teal `175 84% 26%`.

| Option | Notes |
|---|---|
| Keep the violet | It's your original. Distinctive. Weak on white — already had to be darkened for WCAG (see `NL-BUG-A11Y-001` comment in `tokens.css`). |
| Adopt a deep teal | Your editorial tokens already moved here. Reads calm and technical. |
| **New single accent** (my pick) | Choose one, generate a 12-step scale, verify AA on every step, delete the other two forever. |

**Tools (verified live):**
- https://www.radix-ui.com/colors — 12-step accessible scales. **This is the right tool for this job.**
- https://ui.shadcn.com/colors — theme picker, shows real component previews.
- https://ui.shadcn.com/themes — preset themes to react to.

### 🎯 My recommendation
Pick **one** accent with hue in the 190–250° range (teal→indigo), saturation ≤ 85%, and a base
lightness that passes **4.5:1 on white**. Then:
1. Generate a 12-step scale with Radix Colors.
2. Store **only** the scale in tokens. No `--brand-violet`, no `--brand-coral`, no `--accent-2`.
3. Semantic status colours (success/warning/danger/info) are **not** brand colours — keep them separate and never let them drift into branding.

**Rule to enforce in CI:** exactly one `--brand-*` scale exists in the repo. Any second one fails the build.

---

## A3. Which typefaces?

Today: **four** faces, differently per app.

| Option | Faces | Feel | See it |
|---|---|---|---|
| **A (my pick)** | **Geist Sans + Geist Mono** | Modern, engineered, distinctive without being loud. Free, made for product UI. | https://vercel.com/font · https://fonts.google.com/specimen/Geist |
| B | Inter + JetBrains Mono | The safe default. Excellent, but every product uses it — least distinctive. | https://fonts.google.com/specimen/Inter · https://fonts.google.com/specimen/JetBrains+Mono |
| C | Instrument Sans + IBM Plex Mono | What you already have on landing. Warm, slightly characterful. Keeps continuity. | https://fonts.google.com/specimen/Instrument+Sans · https://fonts.google.com/specimen/IBM+Plex+Mono |
| D | Plus Jakarta Sans + Space Grotesk | Friendlier, more startup. Distinctive letterforms. | https://fonts.google.com/specimen/Plus+Jakarta+Sans · https://fonts.google.com/specimen/Space+Grotesk |

Plus, **for marketing headlines only** (never in-app):
- https://fonts.google.com/specimen/Instrument+Serif — elegant, restrained
- https://fonts.google.com/specimen/Fraunces — expressive (you already load it)
- https://fonts.google.com/specimen/Newsreader — readable editorial

### 🎯 My recommendation
**Geist Sans + Geist Mono everywhere.** Add **one** display serif for marketing H1/H2 only, loaded
in the marketing app alone so the portal never pays for it.

**Hard rules:**
- Maximum **2 families per app**. Never 4.
- **Money, IDs, quantities and timestamps use the mono face with `font-variant-numeric: tabular-nums`.** You render invoices, quotes and milestone payments — non-tabular numerals make columns unreadable.
- Define **7 type steps maximum** (`xs, sm, base, lg, xl, 2xl, display`). Delete every `text-[...]` in the repo (currently 399).

---

## A4. Corner radius

Currently `6px` on web, `4px` on admin, `14px` and `20px` also defined.

### 🎯 My recommendation: **8px, one value, everywhere.**
- `--radius-sm: 6px` (inputs, badges) · `--radius-md: 8px` (cards, buttons, default) · `--radius-lg: 12px` (modals, large panels)
- **Nothing above 12px.** 20px rounded panels are what makes an admin console look like a consumer app.
- Buttons and inputs share the same radius. Cards are never *less* rounded than the buttons inside them.

---

## A5. Information density

Your admin has 74 data-heavy pages. Density is a real product decision, not decoration.

### 🎯 My recommendation: **Compact by default; one comfort toggle.**
- Row height **36px** compact / **44px** comfortable. Tables, lists and sidebars all derive from one `--row-h` token.
- Base font **13px** in-app (Linear-class), **15–16px** marketing.
- Sidebar collapsed **56px** / expanded **232px** — you already landed on these in `tailadmin-tokens.css`, and they are right. Keep them.
- Persist the user's choice in a cookie. Never let density be per-page.

---

## A6. Dark mode

You already ship `.dark` blocks in three token files.

### 🎯 My recommendation: **Yes, but light-first and equal-quality.**
- Design light first. Derive dark from the same 12-step scale — never hand-pick dark hex values (you currently have `rgba(255,255,255,0.03)` panels in `tailadmin-tokens.css`, which is hand-picking).
- `prefers-color-scheme` default + manual override + persisted choice.
- **Rule:** no surface may be `#000` or `#fff`. Pure black/green contrast causes halation on OLED.
- Charts need separate dark tokens or they will look broken.

---

## A7. Motion

Currently: `hero-orb-drift` animations, `MeshBackground`, `GlassPanel`, blur-2px orb gradients
(`globals.css` lines ~105–130).

### 🎯 My recommendation: **Delete all of it.**
- **Delete:** `GlassPanel.tsx`, `MeshBackground.tsx`, `.hero-orbs`, `.warm-editorial`, `hero-orb-drift`.
  Glassmorphism and drifting gradient orbs read as 2021 template. This is very likely a large part
  of what your reviewer reacted to.
- **Keep:** transitions on hover/focus/press at **150ms**, panel/route transitions at **220ms**,
  both `cubic-bezier(0.2, 0, 0, 1)`.
- **Never** animate layout properties (`width`, `height`, `top`, `left`).
- Honour `prefers-reduced-motion` globally — you already do this for the orbs; make it system-wide.
- If you want marketing motion, use https://motion.dev (verified live) and budget it as its own work item.

---

# Group B — Design system architecture

## B1. Token architecture ⭐ *This is the fix for the root cause*

### 🎯 My recommendation: **One file. Zero per-app overrides.**

```
packages/theme/
  tokens.css        ← THE ONLY token file. All 3 apps import this and nothing else.
  motion.css
  print.css         ← keep, you invoice PDFs
  scrollbar.css
```

**Delete outright:**
- `apps/web/src/styles/tailadmin-tokens.css` (40 lines)
- `apps/web/src/styles/public-editorial-tokens.css` (211 lines)
- `apps/admin/src/styles/gentelella-tokens.css` (108 lines)

**Total: 359 lines of competing design deleted.** Replace with a single `--density` and a single
`--surface-scale` variable that marketing bumps and the app does not.

**CI gate:** a script that fails the build if any file under `apps/` defines a `--` custom property
that also exists in `packages/theme/tokens.css`. This is the one check that prevents the problem
from ever coming back.

---

## B2. Component library base

| Option | Notes | Link |
|---|---|---|
| **shadcn/ui + Radix (my pick)** | You own the source. Fully themeable. You already have a `packages/ui` — this formalises it. | https://ui.shadcn.com |
| Keep hand-rolled `packages/ui` | You have ~90 components already. Free, but you maintain every a11y edge case yourself. | — |
| Radix Themes | Faster, but imposes its own look. Less control. | https://www.radix-ui.com/primitives |
| Tailwind Plus blocks | Paid, prebuilt sections. Good for marketing only. | https://tailwindcss.com/plus |

### 🎯 My recommendation
**shadcn/ui on Radix primitives**, vendored into `packages/ui`, themed by your tokens.
Reuse the ~90 components you have where they are sound — audit them, don't delete them blindly.

**Reference blocks worth studying:** https://ui.shadcn.com/blocks · https://ui.shadcn.com/charts

**Target component count:** ~45 primitives. Resist building 90. Every component you don't build is
one you don't have to keep consistent.

---

## B3. Icons

### 🎯 My recommendation: **Lucide only.**
- https://lucide.dev — 1,500+ icons, one visual language, MIT.
- **20px default, 1.75 stroke width, `currentColor` always.**
- Never mix icon sets. Never use emoji as icons. Never use filled + outline variants together.
- Alternative if you prefer more personality: https://phosphoricons.com (also verified live). Pick one.

---

## B4. Illustration & imagery

### 🎯 My recommendation: **No illustration in-app. Photography for marketing.**
- In-app: icons + type + real data. That is it.
- Marketing: **real screenshots of your own product** and **real photos of delivered work**.
  You are a studio — stock illustration actively hurts you, because your portfolio *is* the proof.
- You already have `portfolio` and `media` services in the API with public share endpoints. Use them.
- Every image: explicit `width`/`height`, `next/image`, lazy below the fold.

---

## B5. Charts

You have `packages/ui/src/components/admin/charts.tsx` today.

| Option | Notes |
|---|---|
| **Recharts (my pick)** | You already use it. Declarative, themes cleanly. https://recharts.org |
| Tremor | Prebuilt dashboard blocks on Recharts. Fast, less control. https://tremor.so · https://tremor.so/blocks |
| visx | Maximum control, more code. https://visx.vercel.app |
| ECharts | Most powerful, heaviest. https://echarts.apache.org |

### 🎯 My recommendation: **Stay on Recharts**, but wrap it in **one** `<Chart>` component that
injects tokens for colour, grid, axis and tooltip. No page may pass raw hex to a chart.
Define **exactly 5 series colours** from the brand scale.

---

## B6. Status & badge system ⭐

`packages/ui/src/utils/status-registry.tsx` (135 lines) defines **28 distinct statuses**:
`draft, submitted, under_review, quoted, accepted, rejected, cancelled, created, pending_payment,
in_progress, review, completed, archived, revision_requested, on_hold, active, paused, pending,
sent, viewed, declined, expired, changes_requested, revised, suspended, inactive` (+ `domain`/`status`).

Meanwhile `tokens.css` defines **6 status colours** (success, warning, error, info, purple, neutral).

### 🎯 My recommendation: **Map 28 → 6 semantic tones.**

| Tone | Statuses |
|---|---|
| **Neutral** | draft, created, archived, inactive, pending |
| **Info** | submitted, under_review, sent, viewed, in_progress, review |
| **Success** | quoted, accepted, completed, active, paid |
| **Warning** | pending_payment, on_hold, paused, revision_requested, changes_requested, expired |
| **Danger** | rejected, cancelled, declined, suspended |
| **Muted** | revised (secondary state — always paired with another badge) |

**Rules:**
- **One `<StatusBadge>` component, ever.** No page defines its own badge colours.
- **Colour is never the only signal** — every badge has a text label. (Colourblind users, ~8% of men.)
- Badge + icon + label is the pattern. Not coloured dots alone.

---

# Group C — Technology & architecture

## C1. Framework

### 🎯 My recommendation: **Stay on Next.js 14 App Router for the rebuild.**
Upgrading to Next 15 mid-redesign gives you two simultaneous migrations and doubles the failure
surface. Ship the redesign first; upgrade the framework as a separate, boring task afterwards.
Reference: https://nextjs.org · https://nextjs.org/showcase

---

## C2. Tailwind

You are on v3.4.17. v4 changed the config model significantly (https://tailwindcss.com/docs/theme).

### 🎯 My recommendation: **Stay on v3 during the rebuild.** Same reasoning as C1.

---

## C3. Repo shape

### 🎯 My recommendation: **Keep the monorepo. Rebuild inside it.**
Your 12-package structure is correct. A new repo means re-doing orval, auth, websocket, Infisical,
GHCR and K3s wiring for zero design benefit.

---

## C4. Data layer

### 🎯 My recommendation: **Do not touch it.**
`orval` + TanStack Query + `pnpm contract:check` is the best part of your codebase.
https://tanstack.com/query/latest
The rebuild must consume these hooks unchanged. This is what makes the redesign low-risk.

---

## C5. Build order ⭐

### 🎯 My recommendation: **Landing → Design system → Client portal → Admin**

| Phase | Surface | Pages | Why this order |
|---|---|---|---|
| 0 | Direction mocks | — | Client signs off before code |
| 1 | **Landing** | 9 | Smallest, most visible, proves the direction. Fast win for client morale. |
| 2 | **Design system** | — | Now informed by real marketing needs, not guessed at |
| 3 | **Client portal** | 63 | The actual product. Auth → Dashboard → Requests → Quotes → Projects → Payments → Messages |
| 4 | **Admin** | 76 | Densest. Last, when the system is proven. |

---

# Group D — Execution

## D1. Migration strategy

### 🎯 My recommendation: **Strangler fig, screen by screen. No big-bang rewrite.**
Rewriting 148 pages and cutover in one branch is how redesigns die. Instead:
1. Land the new token file behind the existing structure.
2. Rebuild one screen at a time behind a `?ui=new` flag or per-route.
3. Delete the old screen only after the new one ships.
4. **Freeze new features in old-styled screens** during the rebuild.

---

## D2. The six god components

### 🎯 My recommendation: **Decompose before restyling.**
`SystemClient.tsx` (1,902), `MediaLibraryClient.tsx` (1,459), `AdminMediaStorageBrowser.tsx` (1,288),
`AdminNotificationsClient.tsx` (1,279), `UserDetailClient.tsx` (1,116), `PaymentsClient.tsx` (867).
Each splits into a container + 3–6 presentational components, none over ~250 lines.

---

## D3. Design sign-off gate ⭐

### 🎯 My recommendation: **Static HTML mock approval before any component code.**
Your client rejected a *built* product. Do not repeat that. Produce **static, self-contained HTML
mocks** (inline CSS, no build step) of the 8 highest-stakes screens, get written sign-off, then build.
The 8 screens I'd mock:

1. Marketing homepage
2. Login / register
3. Client dashboard
4. Request detail (brief)
5. Quote detail (milestones + payment schedule) ← **highest business value**
6. Project detail (progress + deliverables)
7. Payment / invoice detail
8. Admin dashboard

---

# Group E — Quality & constraints

## E1. Accessibility

### 🎯 My recommendation: **WCAG 2.2 AA, enforced in CI.**
You already have `NL-BUG-A11Y-001` fixes in your tokens — finish the job properly.
- 4.5:1 body text, 3:1 UI components and large text
- Full keyboard operation on every table, modal and dropdown
- Visible focus rings — **never** `outline: none` without a replacement
- `aria-live` regions for the messaging and notification surfaces
- Automated: `axe-core` in Playwright, run on every route

---

## E2. Performance budget

### 🎯 My recommendation
| Metric | Marketing | Portal | Admin |
|---|---|---|---|
| LCP | < 2.0s | < 2.5s | < 2.5s |
| CLS | < 0.1 | < 0.1 | < 0.1 |
| JS (initial) | < 170 KB | < 250 KB | < 300 KB |
| Fonts | ≤ 2 files | ≤ 2 files | ≤ 2 files |

Enforce with Lighthouse CI. **You currently load 4 webfonts in `apps/web` — that alone blows the budget.**

---

## E3. Design-drift guard ⭐ *The rule that keeps this from happening again*

### 🎯 My recommendation: **Zero arbitrary values, CI-enforced.**
Currently 795 escape hatches. New rules, all machine-checked:
- ❌ No `text-[...]`, `bg-[...]`, `w-[...]`, `h-[...]` arbitrary values
- ❌ No hex colours in `.tsx`
- ❌ No `style={{}}` for visual properties (you're already clean here — keep it)
- ❌ No new token files under `apps/`
- ✅ Every spacing value from the 4px scale
- ✅ Every colour from a token

Add an ESLint rule (`eslint-plugin-tailwindcss` or a custom no-restricted-syntax rule). **Without
this, the rebuild degrades back within six months.** That is the real deliverable.

---

# Part 2 — Things I still need from you

These aren't design preferences — they're facts I cannot read out of the code.

| # | Question | Why it matters |
|---|---|---|
| 1 | **Who signs off, and how?** One person or a committee? Written approval or a meeting? | Determines whether Phase 0 needs 3 options or 1 |
| 2 | **Do you have any existing brand assets?** Logo files, brand guidelines, a Figma library? | If a logo exists, the palette is constrained by it |
| 3 | **Are the reference sites in A1 the right *feeling*?** Open 3 of them and tell me which is closest. | Faster than describing adjectives |
| 4 | **What exactly did the professional reviewer say?** Verbatim if possible. | I can target the specific complaint instead of the general one |
| 5 | **What did the client object to — look, or usability?** | Completely different rebuilds |
| 6 | **Timeline and team size?** | Decides whether the hybrid in A1 is affordable |
| 7 | **Any screen that must NOT change?** (e.g. a Razorpay flow, an invoice PDF) | Protects working integrations |
| 8 | **Is the public share/verify surface (`/share/[token]`, `/verify-document`) client-facing?** | These are trust-critical pages that need the marketing language, not the app language |
| 9 | **Do you want Storybook?** | Costs ~3 days, pays off across 148 pages |
| 10 | **i18n now or later?** Locale is `en_IN` but you serve IN/US/GB/AE. | Affects every layout decision (string length, currency, dates) |

---

# Answer sheet — fill this in and send it back

```
A1 Visual direction        : Hybrid (Linear-dense / Stripe-polished / Editorial / Hybrid [recommended])
A2 Brand colour            : https://www.radix-ui.com/colors/custom?accent-dark=0B7A71&accent-light=0B7A71 [ because we like green color so create custome for it ] (hue or hex, one value)
A3 Typefaces               : Geist Sans + Geist Mono (Geist / Inter / Instrument / Jakarta + one display face)
A4 Radius                  : 8px (8px recommended)
A5 Density                 : compact (compact recommended)
A6 Dark mode               : yes (yes / no / later)
A7 Motion                  : delete all (restrained recommended / delete all / invest in motion)

B1 Token files             : one file (one file, 359 lines deleted — recommended)
B2 Component base          : shadcn/ui (shadcn/ui recommended)
B3 Icons                   : Lucide (Lucide recommended)
B4 Imagery                 : photography (photography recommended)
B5 Charts                  : Recharts (Recharts recommended)
B6 Status tones            : 6 tones (6 tones recommended)

C1 Framework               : stay Next 14 (stay Next 14 recommended)
C2 Tailwind                : stay v3 (stay v3 recommended)
C3 Repo                    : keep monorepo (keep monorepo recommended)
C4 Data layer              : keep orval (keep orval recommended)
C5 Build order             : Landing → Design system → Client portal → Admin (Landing → System → Portal → Admin recommended)

D1 Migration               : recommended (strangler fig recommended)
D2 God components          : decompose (decompose recommended)
D3 Sign-off gate           : static HTML mocks (static HTML mocks recommended)

E1 Accessibility           : WCAG 2.2 AA (WCAG 2.2 AA recommended)
E2 Perf budget             : as tabled (as tabled recommended)
E3 Drift guard             : CI-enforced (CI-enforced, recommended)

Part 2 Q1–Q10              : ___
Q1:: i am the one who will deside all things.
Q2:: yes , i can upload these with this questionare but add temprary any logo.
.3:: dont understadn this question
.4:: say app all public pages can pass as c+ and other admin and clint dashboard pages can give c grade , but we aspect a+
.5:: client object look and approve one few for usability.
.6:: its build and developer by solo developer freelancer
.7:: like pdf which is genrated by backend api and show to frontend and razorpay payment gateway have its ows interface
.8:: these pages are public pages because its trust pages
.9:: yes i want complete story book complete
.10:: you can get reference from old frontend app .
```

---

## Appendix — every URL in this file, HTTP-verified 2026-10-09

**All returned HTTP 200.** Four candidates I checked and **rejected as dead** — do not use them:
`height.app` (timeout), `linerate.app` (timeout), `readymag.com` (timeout), `buildwithbeam.com` (timeout),
`plunk.so` (timeout), `polarsource.com` (timeout). Also 404: `fonts.google.com/specimen/Satoshi`
(not on Google Fonts), `recharts.org/en-US/examples` (moved — use https://recharts.org),
`radix-ui.com/themes/custom-themes` (moved — use https://www.radix-ui.com/colors).

**Your own live surfaces:**
- https://nestlancer.com (marketing) · https://app.nestlancer.com (portal) · https://admin.nestlancer.com (admin) · https://api.nestlancer.com/docs (Swagger) · https://api.nestlancer.com/api/v1/health

**Direction references:** linear.app · linear.app/method · vercel.com · vercel.com/geist/introduction · vercel.com/geist/colors · vercel.com/design · vercel.com/font · cal.com · resend.com · dub.co · railway.com · supabase.com · clerk.com · stripe.com · stripe.com/payments/checkout · stripe.com/docs · ramp.com · mercury.com · mercury.com/blog · wise.com · razorpay.com · planetscale.com · attio.com · collins.co · basement.studio · activetheory.net · locomotive.ca · studio.build · awwwards.com/websites/portfolio

**Tooling:** ui.shadcn.com · ui.shadcn.com/colors · ui.shadcn.com/themes · ui.shadcn.com/blocks · ui.shadcn.com/charts · ui.shadcn.com/examples/dashboard · tailwindcss.com · tailwindcss.com/docs/theme · tailwindcss.com/plus · radix-ui.com/colors · radix-ui.com/primitives · lucide.dev · phosphoricons.com · recharts.org · tremor.so · tremor.so/blocks · visx.vercel.app · echarts.apache.org · d3js.org · nivo.rocks · motion.dev · storybook.js.org · figma.com · figma.com/community · nextjs.org · nextjs.org/showcase · tanstack.com/query/latest

**Type specimens:** Geist · Inter · Instrument Sans · IBM Plex Mono · Plus Jakarta Sans · Space Grotesk · JetBrains Mono · DM Sans · Sora · Bricolage Grotesque · Manrope · Outfit · Fraunces · Instrument Serif · Newsreader (all under `fonts.google.com/specimen/…`)
