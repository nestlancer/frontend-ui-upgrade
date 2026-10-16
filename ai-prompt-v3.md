# Nestlancer Proto — Prompt v3 · PUBLIC / LANDING (+ Auth)

**Filename:** `ai-prompt-v3.md`  
**Part:** **1 of 3** — Public pages  
**Next:** `ai-prompt-v3.1.md` (Client) → `ai-prompt-v3.2.md` (Admin)  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Design north star:** `verified-backups/direction.md` §1 Landing + §5 Ⓐ Landing Page  
**Review source:** `PAGE_REVIEW.md`

> **Scope of this file only:** `proto/apps/landing/**` (marketing + auth) and optionally `proto/index.html` hub links.  
> Do **not** redesign `proto/apps/web/**` or `proto/apps/admin/**` here — those are v3.1 / v3.2.

> Preparing this file does not redesign pages. Say: **“Execute `ai-prompt-v3.md`. Redesign all public/landing HTML to A+, update `PAGE_REVIEW.md`, commit, and push.”**

---

## Operator guide

1. Read **`verified-backups/direction.md`** (Executive Summary + Section 1 + Section 5 Ⓐ + Master Trend Table landing columns) **before** editing CSS/HTML.
2. Primary grade list: `PAGE_REVIEW.md`. Screenshots: `Nestlancer-public-screenshots/`. API field truth: `backend-api-swagger/` (esp. `auth.openapi.json`, `contact.openapi.json`, `blog.openapi.json`, `portfolio.openapi.json`).
3. Ledger: `upgrade-v3/public/` (`PAGE_COVERAGE.csv`, `PROGRESS.md`, `DIRECTION_CONTRACT.md`).
4. When the public batch is real: commit + push. Then stop or hand off to v3.1.

### In-scope HTML (~21 landing + root hub)

| Family | Paths |
|---|---|
| Marketing | `landing/index`, `about`, `services`, `pricing`, `portfolio` (+ `[id]`, `fintech-payments-hub`), `blog` (+ `[slug]`), `contact`, `contact-alt`, `terms`, `privacy`, `verify`, `verify-document` |
| **Auth (P0 — grade override B)** | `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `admin-login` |
| Hub (optional) | `proto/index.html` — improve only if it blocks public navigation |

---

# IMPLEMENTATION PROMPT — START (PUBLIC)

## 1. Mission

Redesign **every public/landing Nestlancer proto page** to visual-craft **A+ (≥95)** using the 2026 direction report:

> **“2026 marks the end of noisy, overly animated websites.”** — Less noise, more clarity.  
> Landing formula: **Expressive Minimalism + Bold Typography + Single CTA**.

Keep mock/business data. Especially redesign the **auth family** (stakeholder override: treat current A+ as **B**).

### Required outputs

1. Upgraded HTML under `proto/apps/landing/**` (+ `proto/index.html` if touched).  
2. Shared public assets as needed: `studio.css` / `studio.js`, `public-flow.css` / `public-flow.js`, `proto.css`, `proto-motion.js`, `art/`.  
3. Updated `PAGE_REVIEW.md` rows/cards for public + auth pages.  
4. Ledger under `upgrade-v3/public/`.  
5. Commit + push when the public batch is deliverable.

---

## 2. Design mandate — from `direction.md` §1 & §5 Ⓐ

### Do this

| Trend | How it applies to Nestlancer public |
|---|---|
| **Expressive Minimalism** | Clean hierarchy, generous negative space, warmth/texture — not empty void or cluttered SaaS |
| **Bold type + short copy** | Oversized expressive headlines; scannable micro-copy; kill long paragraphs |
| **One CTA per screen** | Single dominant CTA above the fold; extra actions demoted to text links |
| **Micro-interactions** | Subtle scroll/hover/focus motion (2–3 signatures) — not heavy video headers or motion spam |
| **Light + dark** | Both themes readable; respect `data-theme` / system preference where already wired |
| **Mobile-first** | Design 390 first, then 1440; thumb-friendly CTAs |
| **Shorter pages** | Remove friction; visuals as **proof**, not decoration |

### Avoid (landing)

Cluttered layouts · multiple competing CTAs · heavy video headers · fancy decorative visuals without meaning · long copy walls · purple-indigo glow slop · cream+terracotta cliché · broadsheet newspaper kitsch.

### Auth redesign (mandatory)

Treat these as **Grade B** until redesigned, even if `PAGE_REVIEW.md` says A+:

`login` · `register` · `forgot-password` · `reset-password` · `verify-email` · `admin-login`

Goals: cohesive Nestlancer access system; brand-first first viewport; role-distinct client vs operator; excellent form states; intentional motion; 1440 + 390 solid. Not a generic left-form / right-rail clone.

---

## 3. Work order

1. **Baseline:** inventory landing HTML; write `upgrade-v3/public/PAGE_COVERAGE.csv` with auth `effective_grade=B`.  
2. **Direction contract:** `upgrade-v3/public/DIRECTION_CONTRACT.md` — map each §1 trend → concrete selectors you will change.  
3. **P0 Auth** → A+.  
4. **Flagship marketing:** `landing/index` → `services` → `pricing` → `about` → `contact`.  
5. **Portfolio / blog / verify / legal**.  
6. Update `PAGE_REVIEW.md` + `PROGRESS.md` → commit → push.

---

## 4. KEEP / CHANGE / DO NOT

**KEEP:** routes, mock data, Nestlancer teal `#0B7A71`, prototype demo notes/FAB (may restyle).  
**CHANGE:** composition, type, atmosphere, auth shell, CTA focus, motion quality, weak legal/terms pages.  
**DO NOT:** touch `proto/apps/web/**` or `proto/apps/admin/**`; install React UI kits; invent fake logos/metrics; claim A+ without rendering 1440 + 390.

---

## 5. Grade bar

| Grade | Meaning |
|---|---|
| B | Clean but forgettable / old auth |
| A | Cohesive Nestlancer |
| **A+ ≥95** | Memorable expressive-minimal craft — still trustworthy |

Dimensions: Hierarchy · Density · Type · Brand/atmosphere · Motion · Responsive 390 · A11y · Components · Anti-slop.

---

## 6. Verification + ship

`VERIFIED` only if: 1440 + 390 checked; score ≥95; brand test passes on marketing/auth; data intact; `PAGE_REVIEW.md` updated.

Commit example:

```text
Redesign public landing + auth to A+ (prompt v3)

Apply direction.md expressive minimalism, bold type, single-CTA
heroes; rebuild auth under stakeholder B-override.
```

Stage: `proto/apps/landing/**`, touched shared public assets, `PAGE_REVIEW.md`, `upgrade-v3/public/`, this prompt if edited.

---

## 7. Final response format

```text
STATUS: COMPLETE / PARTIAL / BLOCKED
Part: v3 PUBLIC
Auth redesigned: Y/N (list)
Marketing pages A+: N / total
Shared assets:
PAGE_REVIEW updated: Y/N
Git: branch / commit / pushed
NEXT: execute ai-prompt-v3.1.md (Client) | remaining public paths
```

# IMPLEMENTATION PROMPT — END

---

## Resume

> Continue `ai-prompt-v3.md` (public only). Read `upgrade-v3/public/PROGRESS.md`. Finish auth + remaining landing paths to A+. Do not start client/admin until public scope is COMPLETE or user redirects to v3.1 / v3.2.

## Pipeline

| Prompt | Surface | Direction.md |
|---|---|---|
| **v3** (this) | Public / Landing / Auth | §1 + §5 Ⓐ |
| **v3.1** | Client portal | §3 + §5 Ⓑ |
| **v3.2** | Admin console | §2 + §5 Ⓒ |
)
