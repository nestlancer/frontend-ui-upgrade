# Nestlancer UI Rebuild — D3 Static HTML Design Sign-Off Mocks (`html-mocks/`)

> **Grade Target:** **A+ (95+)** · **Architecture:** *One Brand, Two Densities* (Stripe / Mercury-class editorial marketing + Linear / Cal.com-class high-density Client Portal & Operator Console)
> **Deliverable Scope:** Self-contained static HTML5 + CSS3 (`tokens.css`) + zero-dependency Vanilla JS (`ui.js`). No React/Next build pipeline required.

---

## 1. How to Open & Preview

Every page in `html-mocks/` is 100% self-contained and works either by opening the file directly (`file://`) or via any static HTTP server:

```bash
# Option A — Open the Sign-Off Hub directly in your browser
open html-mocks/index.html

# Option B — Serve locally on port 4173
python3 -m http.server 4173 --directory html-mocks
```

### Interactive Prototype Controls (Built into Every Page)
- **Floating Prototype Switcher (bottom-right):** Jump instantly between all **20 screens**, toggle **Light / Dark skin**, and switch **Compact (`36px` rows) / Comfortable (`44px` rows)** density.
- **Persistent State:** Skin (`data-theme="light|dark"`) and density (`data-density="compact|comfortable"`) persist across pages via `localStorage`.
- **Keyboard Shortcuts:** Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> on Client Dashboard (`03`) or Admin Command Center (`08`) to open the Command Palette; press <kbd>Esc</kbd> to dismiss any modal.

---

## 2. Complete HTML Page Set (20 Screens)

| # | File | Surface | Route Represented | Role |
|---|---|---|---|---|
| **00** | [`index.html`](./index.html) | Design System Hub | Sign-off index, token swatches, 28→6 badge matrix, C→A+ audit | Hub |
| **01** | [`01-marketing-home.html`](./01-marketing-home.html) | Marketing | `nestlancer.com/` | **Required D3 #1** |
| **02** | [`02-auth-login-register.html`](./02-auth-login-register.html) | Auth (Client + Admin) | `app.nestlancer.com/login`, `/register`, `/forgot-password`, `admin/login` | **Required D3 #2** |
| **03** | [`03-client-dashboard.html`](./03-client-dashboard.html) | Client Portal | `app.nestlancer.com/dashboard` | **Required D3 #3** |
| **04** | [`04-client-request-detail.html`](./04-client-request-detail.html) | Client Portal | `app.nestlancer.com/requests/[id]` + New Request modal | **Required D3 #4** |
| **05** | [`05-client-quote-detail.html`](./05-client-quote-detail.html) | Client Portal | `app.nestlancer.com/quotes/[id]` (Awaiting e-signature + Accepted contract states) | **Required D3 #5** |
| **06** | [`06-client-project-detail.html`](./06-client-project-detail.html) | Client Portal | `app.nestlancer.com/projects/[id]` (6 tabs: Overview, Progress, Milestones, Deliverables, Messages, Files) | **Required D3 #6** |
| **07** | [`07-client-payment-detail.html`](./07-client-payment-detail.html) | Client Portal | `app.nestlancer.com/payments/[id]` (Razorpay, Bank/NEFT UTR dropzone, Settled GST Invoice states) | **Required D3 #7** |
| **08** | [`08-admin-dashboard.html`](./08-admin-dashboard.html) | Admin Console | `admin.nestlancer.com/dashboard` | **Required D3 #8** |
| **09** | [`09-marketing-pricing.html`](./09-marketing-pricing.html) | Marketing | `nestlancer.com/pricing` | Preferred Addition |
| **10** | [`10-marketing-services.html`](./10-marketing-services.html) | Marketing | `nestlancer.com/services` (4 distinct studio practices) | Preferred Addition |
| **11** | [`11-marketing-about.html`](./11-marketing-about.html) | Marketing | `nestlancer.com/about` | Preferred Addition |
| **12** | [`12-marketing-contact.html`](./12-marketing-contact.html) | Marketing | `nestlancer.com/contact` + `app.nestlancer.com/contact` | Preferred Addition |
| **13** | [`13-public-trust-verify.html`](./13-public-trust-verify.html) | Public Trust | `app.nestlancer.com/verify-document` + `/share/[token]` (Marketing chrome) | Preferred Addition |
| **14** | [`14-client-requests-projects-list.html`](./14-client-requests-projects-list.html) | Client Portal | `app.nestlancer.com/requests` & `/projects` Work Hub | Preferred Addition |
| **15** | [`15-client-quotes-payments-list.html`](./15-client-quotes-payments-list.html) | Client Portal | `app.nestlancer.com/quotes`, `/payments`, `/invoices`, `/payments/methods` | Preferred Addition |
| **16** | [`16-client-messages.html`](./16-client-messages.html) | Client Portal | `app.nestlancer.com/messages` & `/messages/thread/[id]` (3-pane messaging) | Preferred Addition |
| **17** | [`17-client-notifications-settings.html`](./17-client-notifications-settings.html) | Client Portal | `app.nestlancer.com/notifications` & `/settings/{account,security,files,activity}` | Preferred Addition |
| **18** | [`18-admin-users-list.html`](./18-admin-users-list.html) | Admin Console | `admin.nestlancer.com/users` (Dense 10-account directory) | Preferred Addition |
| **19** | [`19-admin-user-detail.html`](./19-admin-user-detail.html) | Admin Console | `admin.nestlancer.com/users/[id]` + `/pipeline/users/[id]` + Impersonate/Suspend modals | Preferred Addition |
| **20** | [`20-admin-payments-ops.html`](./20-admin-payments-ops.html) | Admin Console | `admin.nestlancer.com/payments` + UTR Verification + Quote Builder (`/quotes/new`) | Preferred Addition |

---

## 3. Token Summary (`tokens.css`)

### Primary Accent Scale — Deep Studio Teal (`#0B7A71` Anchor)
Replaces the 4 competing token files (`tokens.css` electric violet `#2500ff`, `tailadmin-tokens.css` TailAdmin blue `#465fff`, `public-editorial-tokens.css` teal `#0B7A71`, and `gentelella-tokens.css` green).

| Step | CSS Variable | Light Hex | Dark Hex | Role |
|---|---|---|---|---|
| 1 | `--brand-1` | `#F4FBF9` | `#071312` | App-level subtle tint |
| 2 | `--brand-2` | `#E8F7F4` | `#0A1B19` | Highlighted row / active message background |
| 3 | `--brand-3` | `#D3F0EA` | `#0E2623` | Badge & chip fill |
| 4 | `--brand-4` | `#B8E5DC` | `#12322E` | Hover chip surface |
| 5 | `--brand-5` | `#96D6CA` | `#17403B` | Active selection surface |
| 6 | `--brand-6` | `#6CC2B3` | `#1E524B` | Subtle brand border |
| 7 | `--brand-7` | `#3DA999` | `#276860` | Strong brand border |
| 8 | `--brand-8` | `#178F82` | `#0F8C81` | Focus ring (`2px`) & interactive border |
| **9** | **`--brand-9`** | **`#0B7A71`** | **`#149E92`** | **Canonical Primary Brand Fill (CTAs, active indicators)** |
| 10 | `--brand-10` | `#08655D` | `#0B7A71` | Primary CTA hover |
| 11 | `--brand-11` | `#06524B` | `#5EEAD4` | Accessible brand text on light/dark |
| 12 | `--brand-12` | `#042F2B` | `#CCFBF1` | High-contrast brand ink |

### Warm-Neutral Scale (12 Steps)
- **Light Mode:** `--neutral-1: #FCFCFA` (warm paper canvas), `--neutral-2: #F7F7F4` (sidebar/subtle), `--neutral-3: #F1F1ED`, `--neutral-6: #DFDFD9` (1px hairline border), `--neutral-11: #5C5E5A` (secondary ink), `--neutral-12: #141514` (primary ink).
- **Dark Mode:** `--neutral-1: #0B0D0E` (carbon canvas), `--surface-elevated: #111416`, `--neutral-6: #262B2E` (1px hairline border), `--neutral-11: #9BA3A9`, `--neutral-12: #F1F3F5`.

### 6 Canonical Status Tones (Collapsing 28 Domain Statuses)
Every badge pairs a `6px` semantic dot + text label (never a color dot alone):
1. **Neutral (`tone-neutral`):** `DRAFT`, `PENDING`, `CREATED`, `NOT DUE YET`
2. **Info (`tone-info`):** `SUBMITTED`, `UNDER_REVIEW`, `SENT`, `VIEWED`, `IN_PROGRESS`, `PROCESSING`
3. **Success (`tone-success`):** `QUOTED`, `ACCEPTED`, `CONVERTED_TO_PROJECT`, `APPROVED`, `COMPLETED`, `ISSUED`, `ACTIVE`
4. **Warning (`tone-warning`):** `CHANGES_REQUESTED`, `REVISION_REQUESTED`, `ON_HOLD`, `PENDING_UTR`
5. **Danger (`tone-danger`):** `REJECTED`, `DECLINED`, `CANCELLED`, `FAILED`, `SUSPENDED`
6. **Muted (`tone-muted`):** `EXPIRED`, `REFUNDED`, `ARCHIVED`, `READ`

### Typography, Geometry & Density
- **Fonts:** `Geist Sans` (UI & headings) + `Geist Mono` with `font-variant-numeric: tabular-nums` (every `₹` currency cell, percentage, ID, SHA-256 digest, and timestamp).
- **Radius:** `--radius-sm: 6px`, `--radius-md: 8px` (default across buttons, inputs, cards, modals, badges), `--radius-lg: 12px`.
- **Density:** `13px` base in-app font (`15px–16px` marketing), `36px` compact table rows (`44px` comfortable), `232px` sidebar (`56px` collapsed), `52px` topbar (`60px` marketing header).
