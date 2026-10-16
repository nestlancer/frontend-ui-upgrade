# Nestlancer Proto — Prompt v3.1 · CLIENT PORTAL

**Filename:** `ai-prompt-v3.1.md`  
**Part:** **2 of 3** — Client pages  
**Previous:** `ai-prompt-v3.md` (Public) · **Next:** `ai-prompt-v3.2.md` (Admin)  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Design north star:** `verified-backups/direction.md` §3 Client Dashboard + §5 Ⓑ Client Dashboard  
**Review source:** `PAGE_REVIEW.md`

> **Scope of this file only:** `proto/apps/web/**` (client portal).  
> Do **not** redesign landing/auth (`ai-prompt-v3.md`) or admin (`ai-prompt-v3.2.md`) unless the user explicitly expands scope.

> Say: **“Execute `ai-prompt-v3.1.md`. Redesign all client portal HTML to A+, update `PAGE_REVIEW.md`, commit, and push.”**

---

## Operator guide

1. Read **`verified-backups/direction.md`** (Section 3 + Section 5 Ⓑ + Master Trend Table client columns) before coding.
2. Prefer running **after** public v3 if brand tokens/motion were updated — reuse shared tokens; do not regress landing.
3. Screenshots: `Nestlancer-clients-screenshots/`. OpenAPI: `requests`, `projects`, `quotes`, `payments`, `messaging`, `users`, etc. under `backend-api-swagger/`.
4. Ledger: `upgrade-v3/client/` (`PAGE_COVERAGE.csv`, `PROGRESS.md`, `DIRECTION_CONTRACT.md`).
5. Most client pages are **Grade B (~80)** in `PAGE_REVIEW.md` — treat that as the queue. `web/messages/inbox` is **A** — still raise to **A+**.

### In-scope HTML (~52)

All `proto/apps/web/**/index.html`, including:

| Priority | Families |
|---|---|
| P0 | `web/dashboard` (flagship) |
| P1 | `projects`, `requests`, `quotes` (list + detail + new/archive/completed) |
| P2 | `messages/**`, `payments/**`, `invoices/**` |
| P3 | `notifications`, `profile`, `settings/**` |

Shared CSS/JS focus: `workbench.css`, `workbench.js`, `operator.css` only if shared primitives are required — keep client tone **welcoming**, not operator-dense.

---

# IMPLEMENTATION PROMPT — START (CLIENT)

## 1. Mission

Redesign the **client portal** to **A+ (≥95)** so it feels **customer-facing and welcoming**, not like a technical admin clone.

Direction formula (§5 Ⓑ):

> **Bento Grid + Personalization + Welcoming Tone**  
> Activation-focused home · progressive disclosure · designed empty states · light default + dark toggle.

Keep Nestlancer routes, labels, and mock money/IDs. Static HTML only.

### Required outputs

1. Upgraded `proto/apps/web/**` HTML.  
2. Shared client shell improvements (`workbench.*`, shared tokens in `proto.css` as needed).  
3. `PAGE_REVIEW.md` updates for client rows.  
4. `upgrade-v3/client/` ledger.  
5. Commit + push when the client batch (or claimed sub-batch) is real.

---

## 2. Design mandate — from `direction.md` §3 & §5 Ⓑ

### Do this

| Trend | Nestlancer client application |
|---|---|
| **Activation-focused home** | Dashboard leads with **value proof** and next actions (active projects, pending approvals, payables) — not a wall of every chart |
| **Bento grid** | Modular card grid for mixed data types on dashboard + overview surfaces |
| **Progressive disclosure** | Summary first → detail on demand (lists → detail pages; collapse secondary metrics) |
| **Empty / pending states** | Design zeros, empty inboxes, “no invoices” as onboarding surfaces |
| **Welcoming tone** | Calmer type, clearer hierarchy, friendlier empty copy than admin |
| **Expressive minimalism** | Quiet chrome; hierarchy from type + space |
| **Micro-interactions** | Useful hover/focus/toast/progress — restrained |
| **Dark mode** | Toggle + readable dark; **light mode default** for client |
| **Mobile-first** | 390 usable (sidebar collapse, stacked bento, money wrap) |

### Avoid

Chart walls on the home screen · admin-level density everywhere · color used as decoration in data · noisy animation · purple glow SaaS kitsch · treating empty states as blank white voids.

### Optional secondary craft references

If helpful after direction.md is applied: modern SaaS portals with bento homes (study patterns only; do not install kits). Nestlancer teal remains brand truth.

---

## 3. Work order

1. Baseline coverage CSV for all `proto/apps/web/**`.  
2. `DIRECTION_CONTRACT.md` — map §3/§5 Ⓑ → shell + dashboard selectors.  
3. **Shared client shell** (sidebar/topbar/bento primitives) → Nestlancer teal.  
4. **`web/dashboard`** flagship (must feel activation-first + bento).  
5. Projects / requests / quotes → messages → payments/invoices → profile/settings/notifications.  
6. Create/edit flows: clear sections, primary CTA, empty/error states.  
7. Update review → commit → push → hand off to **v3.2** if admin remains.

---

## 4. KEEP / CHANGE / DO NOT

**KEEP:** routes (including UUID demos), mock data, Nestlancer IA/labels, theme toggle hooks.  
**CHANGE:** dashboard composition (bento + activation), shell chrome, table/toolbars, empty states, forgettable B-grade sameness.  
**DO NOT:** redesign landing/auth or admin; replace proto with React; invent metrics; claim A+ without 1440 + 390 check.

---

## 5. Grade bar

Ship = **A+ ≥95**. Client pages that still read as “old workbench with teal” fail even if spacing improved.

Dimensions: Hierarchy · Density · Type · Brand/atmosphere · Motion · Responsive 390 · A11y · Components · Anti-slop.

---

## 6. Verification + ship

`VERIFIED` when: rendered 1440 + 390; ≥95; dashboard shows activation + bento intent; empty states designed where relevant; data intact; `PAGE_REVIEW.md` updated.

Commit example:

```text
Redesign client portal to A+ (prompt v3.1)

Apply direction.md bento + activation-focused home, progressive
disclosure, and welcoming empty states across proto/apps/web.
```

Stage: `proto/apps/web/**`, client shared assets, `PAGE_REVIEW.md`, `upgrade-v3/client/`.

---

## 7. Final response format

```text
STATUS: COMPLETE / PARTIAL / BLOCKED
Part: v3.1 CLIENT
Dashboard flagship A+: Y/N
Client pages A+: N / ~52
Shared assets:
PAGE_REVIEW updated: Y/N
Git: branch / commit / pushed
NEXT: execute ai-prompt-v3.2.md (Admin) | remaining client paths
```

# IMPLEMENTATION PROMPT — END

---

## Resume

> Continue `ai-prompt-v3.1.md` (client only). Read `upgrade-v3/client/PROGRESS.md`. Keep VERIFIED pages. Finish remaining `proto/apps/web/**` to A+ using `direction.md` §3/§5 Ⓑ. Do not start admin until client scope is COMPLETE or user redirects to v3.2.

## Pipeline

| Prompt | Surface | Direction.md |
|---|---|---|
| v3 | Public / Landing / Auth | §1 + §5 Ⓐ |
| **v3.1** (this) | Client portal | §3 + §5 Ⓑ |
| v3.2 | Admin console | §2 + §5 Ⓒ |
)
