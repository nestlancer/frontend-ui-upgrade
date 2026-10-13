# Nestlancer UI Ranking Audit — Prompt 1.1

> **Purpose:** Before any design upgrade (`prompt-v2.md`), produce a **complete ranking report** of every screenshot in the 3 screenshot dirs **paired with** its proto HTML page — with letter grades, tool-backed scores, and **concrete A+ recommendations** per page.  
> **Does NOT rewrite UI.** Ranking + recommendations only.  
> **Runtime:** Arena Agent Mode (arena.ai/agent) or Cursor. Deliverables MUST land in the **downloadable User Workspace**.

**Tool inspiration source:** `review.md` (HubSpot Grader, QuickSEO, DareBoost, Nibbler, WooRank, Roast My Web, Capian, Marker.io, W3C, PageSpeed, Applitools-style visual compare).

Paste everything below the line into the agent.

---

```
# ============================================================
# NESTLANCER — PROMPT 1.1 · RANKING + A+ RECOMMENDATION REPORT
# Output: RANKING_REPORT.md (+ optional CSV) in User Workspace
# ============================================================

## 0) ARENA WORKSPACE DELIVERY (CRITICAL)

You are likely on **Arena Agent Mode**. The user downloads results from the **session Workspace** panel (Download ZIP) or `/download-workspace`.

- Write the final report into the **User Workspace**, not only `/tmp` or an isolated sandbox.
- If you draft in scratch, **copy the finished files** into the User Workspace before claiming done.
- Keep under ~**128 MB**: do NOT copy all screenshot binaries into the report folder; **reference paths** instead.
- End with a WORKSPACE DELIVERY CHECK (paths + sizes).

Chat-only ranking without a downloadable `RANKING_REPORT.md` = **FAILED** run.

---

## 1) ROLE

You are a principal design auditor + frontend QA lead. You:
1. Visually review every screenshot in 3 dirs
2. Pair each screenshot to its proto HTML page
3. Score both (screenshot baseline vs current HTML craft)
4. Use multiple online graders / validators where reachable
5. Rank all screens and write **A+ upgrade recommendations** per page

You do **not** redesign HTML in this prompt. Report only.

---

## 2) SCOPE & PATHS

Repo / workspace (clone or use uploaded tree):
`https://github.com/nestlancer/frontend-ui-upgrade.git`

### Screenshot dirs (each file = one UI page)
| Area | Screenshot dir | Proto HTML target |
|---|---|---|
| Admin / Operator | `Nestlancer-admin-screenshots/` (usually `.../admin/`) | `proto/apps/admin/` |
| Client portal | `Nestlancer-clients-screenshots/` (usually `.../clients/`) | `proto/apps/web/` |
| Public / marketing / auth | `Nestlancer-public-screenshots/` (usually `.../public/`) | `proto/apps/landing/` + public/auth under `proto/apps/web/` |

### Mapping helpers (use if present)
- `screenshot-manifest.csv`
- `tools/proto/UI_GRADE_REPORT.md` (prior fidelity/health scores — use as secondary input, do not blindly copy)
- `tools/proto/DATA_AUDIT.md`
- Grade pipeline notes: `tools/proto/grade/README.md`

### Deliverable paths (MUST exist in User Workspace)
1. **`RANKING_REPORT.md`** — full human report (required)
2. **`RANKING_REPORT.csv`** — one row per screenshot (required)
3. Optional: `RANKING_PRIORITY_BATCHES.md` — suggested upgrade order for `prompt-v2.md`

---

## 3) TOOLKIT — USE MULTIPLE TOOLS (from review.md)

You must attempt a **360° stack**, not vibes alone. Prefer live tools; if a tool is blocked, note `BLOCKED` and fall back to local rubric.

### A) Website graders / scores (HTML pages — serve or open file URL when possible)
| Tool | URL | Capture |
|---|---|---|
| HubSpot Website Grader | https://website.grader.com | Overall / mobile / SEO-ish signals if URL reachable |
| QuickSEO Website Grader | https://quickseo.ai/tools/website-grader | Score /100 + category flags |
| DareBoost | https://www.dareboost.com | Quality / a11y / perf signals |
| Nibbler | https://nibbler.silktide.com | Overall, Accessibility, Experience, Marketing, Technology |
| WooRank | https://www.woorank.com | Overall 1–100 if reachable |
| Roast My Web | https://roastmyweb.com | UX / mobile / conversion friction notes |
| Rise Website Grader | https://rise.co/tool/website-grader | Usability / security / marketing / SEO / perf |

**Practical note:** Many graders need a public URL. For local proto HTML:
- If you can start a local static server for `proto/` and the tool accepts it — use it.
- Else: run **local rubric scoring** (Section 4) as primary, and still WebFetch tool docs / attempt any reachable sample pages.
- Record for each tool: `USED` | `PARTIAL` | `BLOCKED` + reason.

### B) Visual / screenshot review (apply Capian / Marker / Applitools mindset)
| Tool / method | URL | How to use here |
|---|---|---|
| Capian-style UX audit | https://capian.co | Heuristic findings on screenshot vs HTML |
| BugHerd / Marker.io mindset | https://bugherd.com · https://marker.io | Pin issues: hierarchy, spacing, CTA, overflow |
| Applitools-style visual AI | https://applitools.com | Structural diff: screenshot layout vs rendered HTML (not pixel-perfect clone) |
| Manual dual view | — | Open screenshot + HTML side-by-side every screen |

### C) HTML / technical validators
| Tool | URL | Capture |
|---|---|---|
| W3C Markup Validator | https://validator.w3.org | Errors / warnings count (paste or file) |
| Google PageSpeed Insights | https://pagespeed.web.dev | Only if public URL; else skip with BLOCKED |
| Screaming Frog mindset | https://www.screamingfrog.co.uk | Check title, h1, meta description presence in HTML |

### D) Local automated checks (ALWAYS run — no network required)
For each paired HTML (or representative sample if batching large sets, then expand):
- Serve `proto/` if possible (`python -m http.server` or similar)
- At **1440px** and **390px**: note overflow, font-size floors, missing h1/h2, primary CTA presence
- Grep for `undefined`, `NaN`, `lorem`, `TODO`
- Note motion hooks: `.reveal`, `.stagger`, `proto-motion.js` presence
- Contrast / type: body ≥14px, badges ≥11px

### Minimum tool proof for the report
In `RANKING_REPORT.md` § Tools used, list ≥6 tools/methods with status. Must include:
1. Local dual visual review (screenshot ↔ HTML) — required
2. Local health checks (390 / 1440) — required
3. W3C Validator attempt — required
4. At least 2 graders from Category A (or BLOCKED with reason)
5. At least 1 visual-annotation methodology (Capian/Marker/Applitools mindset)
6. PageSpeed OR Nibbler/DareBoost-style experience notes

---

## 4) SCORING RUBRIC (A+ target)

Score each screen **twice**:
- **S_shot** — craft of the original screenshot UI (baseline product look)
- **S_html** — craft of current proto HTML (what we will upgrade)

### Letter bands
| Grade | Score | Meaning |
|---|---|---|
| **A+** | 95–100 | Memorable, cohesive, motion intentional, responsive, accessible |
| **A** | 90–94 | Production-ready Nestlancer |
| **B** | 80–89 | Clean but forgettable / minor gaps |
| **C** | 70–79 | Data OK, generic template feel — common today |
| **D** | 60–69 | Weak hierarchy / health / missing states |
| **F** | <60 | Broken, empty, unusable, or near-missing page |

### Weighted dimensions (0–100 each, then weighted sum)
| Dimension | Weight | What “10/10” looks like |
|---|---|---|
| Visual hierarchy & primary action | 20% | One clear job; CTA obvious; scan path instant |
| Layout / density / fidelity to screenshot structure | 15% | Panels/sections match screenshot intent; density right for surface |
| Typography & spacing rhythm | 10% | Type scale clear; ≥14 body / ≥11 captions; 4/8 rhythm |
| Color, brand, atmosphere | 10% | Nestlancer teal system; canvas not dead flat; not purple slop |
| Motion & micro-interactions | 10% | Entrance + hover + one signature; reduced-motion safe |
| Responsiveness (esp. 390px) | 10% | No page overflow; tables contained; touch targets |
| Accessibility & HTML health | 10% | h1, labels, contrast, W3C-ish cleanliness, no NaN |
| Component craft (tables, forms, nav, cards) | 10% | States: hover/focus/empty/loading; shadcn-level polish |
| Creativity / non-generic (anti-slop) | 5% | Would NOT instantly read as “AI SaaS template” |

**Hard caps (apply to S_html):**
- Body text <14px or badges <11px → score capped at **70**
- Horizontal page overflow at 390px → capped at **70**
- Primary text contrast fail → capped at **65**
- Missing page / empty shell / undefined text → **F**

Also record prior report grade from `tools/proto/UI_GRADE_REPORT.md` if present (`PriorGrade`).

---

## 5) WORKFLOW

### Phase 0 — Inventory
1. Count screenshots in all 3 dirs.
2. Build pairing table: Screenshot → Proto HTML path → Match (`exact` | `parent` | `missing`).
3. Reuse mapping from `UI_GRADE_REPORT.md` / manifest when accurate; fix mismatches.

### Phase 1 — Tool pass
1. Attempt Category A/C tools; log USED/PARTIAL/BLOCKED.
2. Run local server checks for a stratified sample first (all A/B candidates + all F + random D/C), then expand toward full coverage.
3. For full 181 screens: you MAY score in batches by area, but the **final CSV must include every screenshot file**.

### Phase 2 — Dual visual audit (every screen)
For each screenshot:
1. Open screenshot image
2. Open paired HTML (or nearest parent)
3. Score S_shot and S_html with rubric
4. List top issues (max 5) blocking A+
5. Write **A+ Recommendations** (specific UI changes — not vague “make it modern”)

### Phase 3 — Rank & prioritize
1. Sort all screens by **S_html ascending** (worst first) within each area, then global.
2. Compute area medians (admin / clients / public).
3. Build upgrade batches for `prompt-v2.md`:
   - Batch P0: S_html F
   - Batch P1: S_html D
   - Batch P2: S_html C
   - Batch P3: S_html B (polish to A+)
   - Batch P4: already A/A+ (protect; only polish motion/atmosphere)

### Phase 4 — Write deliverables into User Workspace
Write `RANKING_REPORT.md` + `RANKING_REPORT.csv` (+ optional batches file).

---

## 6) OUTPUT FORMAT

### A) `RANKING_REPORT.md` structure (required)

```markdown
# Nestlancer Proto UI Ranking Report (Prompt 1.1)

## 0. Headline
- Screens inventoried: N (admin X / clients Y / public Z)
- HTML paired: … exact / parent / missing
- Median S_html: …
- Median S_shot: …
- Count by grade (HTML): A+ / A / B / C / D / F
- Biggest systemic blockers to A+ (top 8)

## 1. Tools used
| Tool | Status | Notes / sample scores |
|---|---|---|
| Local dual visual review | USED | … |
| Local 1440/390 health | USED | … |
| W3C Validator | USED/BLOCKED | … |
| HubSpot Grader | … | … |
| … | … | … |

## 2. Grade summary by area
(table)

## 3. Global ranking table (worst HTML first)
| Rank | Area | Screenshot | Proto HTML | Match | S_shot | Grade_shot | S_html | Grade_html | PriorGrade | Gap (shot−html) | Top blocker | A+ priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

## 4. Per-screen A+ recommendation cards
### [Rank n] `path/to/screenshot.webp`
- Proto: `proto/...`
- Scores: shot … / html … → target A+ (≥95)
- What’s wrong (evidence):
  1. …
- What to change in HTML/CSS (actionable):
  1. Hierarchy: …
  2. Surfaces/motion: …
  3. Responsive: …
  4. Components: …
  5. Keep mock data: YES (list any strings that must stay)
- Suggested references (for prompt-v2 Phase R): Uiverse / Magic UI / Aceternity / Animista / … (name pattern types)
- Estimated effort: S / M / L

## 5. Systemic A+ playbook (shared CSS first)
- Token / proto.css changes that lift many pages
- Motion (`proto-motion.js`) gaps
- 390px patterns

## 6. Recommended batches for prompt-v2.md
- P0 / P1 / P2 / … with file lists

## 7. WORKSPACE DELIVERY CHECK
…
```

### B) `RANKING_REPORT.csv` columns (required)
```
rank,area,screenshot_path,proto_path,match,s_shot,grade_shot,s_html,grade_html,prior_grade,gap,top_blocker,a_plus_actions_short,effort,batch
```

### C) Recommendation quality bar
Each page’s A+ actions must be **specific** enough that `prompt-v2.md` can execute without guessing, e.g.:
- BAD: “Improve UI”
- GOOD: “Add h2 section titles matching screenshot panels ‘Needs attention’ / ‘Revenue trajectory’; raise chip text to 11px; contain `.tbl` overflow at 390 with card-stack; add KPI hover lift 2px/160ms; selective glass on sidebar only.”

---

## 7) START COMMAND

Begin now:
1. Confirm Arena User Workspace root; plan to write `RANKING_REPORT.md` + `.csv` there.
2. Inventory all screenshots in the 3 dirs; build pairing to `proto/` HTML.
3. Run toolkit passes (local required + online graders/validators as available).
4. Score every screen (S_shot + S_html); rank worst-first.
5. Write full recommendation cards + systemic playbook + P0–P4 batches.
6. Print WORKSPACE DELIVERY CHECK with file sizes.
7. Stop. Do not redesign HTML yet — that is `prompt-v2.md`.

If time/context limited: finish **full CSV for all screens** with scores + short actions first, then expand §4 cards for all **F and D** pages before stopping.
```

---

## Operator notes (you)

1. Run **prompt1.1** first → download `RANKING_REPORT.md` + `RANKING_REPORT.csv`.
2. Put those files in the repo root (or `tools/proto/`).
3. Run **prompt-v2** next; it must read the ranking report and upgrade P0→P4.
4. On Arena: if Workspace stays empty, tell the agent to sync deliverables before finishing.
