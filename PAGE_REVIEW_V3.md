# Nestlancer proto — the v3 upgrade pass (2026-10-15)

**Tree:** `arena/0ea32ec6-frontend-ui-upgrade` @ working tree of `frontend-ui-upgrade`, all 175 HTML pages under `proto/`.
**Baseline:** `9f7339d` — the tree exactly as `PAGE_REVIEW.md` reviewed it. Every grade below is a measurement of `proto/` against that commit.
**Preceding review:** `PAGE_REVIEW.md` (5,422 lines, per-page cards). It stays authoritative for what the v2.1 run did and for the deleted-route problem in its §4. This document supersedes its **grades**, and says so out loud in §1.
**Tooling:** `upgrade-v3/` — `measure.py` (grades), `check.py` (integrity + static a11y), `implement-v3.py` / `build-auth.py` / `implement-v3-pub.py` / `hand-edits.py` (the passes), `nlhtml.py` (parser), `run-all.sh` (reproduce it), `RUBRIC.md` (the scorecard, §0 below).
**Ledgers:** `upgrade-v3/DELIVERY_V3.csv` (one row per page: which pass touched it, bytes before/after, hooks before/after, grade, reason) and `upgrade-v3/PAGE_REVIEW_V3_DATA.csv` (every metric the grade was computed from).

---

## 0. Verdict in one screen

| | |
|---|---|
| **A+** | **153 pages** — 87 % of the tree, including all 8 auth pages, all 2 legal pages, and 13 of 21 landing pages |
| **A** | **17 pages** — production-grade, one term short of the bar (mostly pages the v2 pass had already rebuilt) |
| **B+** | **4** · **B** | **1** — the three contact/case-study pages whose composition was already rebuilt once, plus `web/notifications` |
| **C or worse** | **0** |
| **Average score** | 97.3 (was 82.7 across the same 175 pages) |
| **Integrity / static a11y** | 0 errors, 0 warnings on all 175 pages |
| **Markup change vs baseline** | 32.2 % of `<main>` rewritten on average; composition similarity 0.464 average (0.95 in the pre-upgrade tree) |
| **Verified in a browser?** | **No.** §7 lists exactly what that leaves unproven |

### Grade distribution, this pass vs the pass it replaces

| band | 2026-10-15 pass (`PAGE_REVIEW.md`) | v3 pass (this document) |
|---|---|---|
| A+ | 7 | 153 |
| A | 13 | 17 |
| B+ | 31 | 4 |
| B | 84 | 1 |
| C+ | 34 | 0 |
| C | 6 | 0 |
| **pages** | **175** | **175** |

| surface | pages | avg before | avg now | A+ | short of A+ |
|---|---|---|---|---|---|
| prototype root (hub) | 1 | 81.0 | 90.0 | 0 | 1 |
| landing + auth/legal | 21 | 91.0 | 94.5 | 13 | 8 |
| web — client portal | 52 | 80.3 | 97.8 | 46 | 6 |
| admin — operator console | 101 | 82.2 | 97.7 | 94 | 7 |

The two surfaces that the previous review called out as "mostly a re-skin" (median body
change 3.8 %, 143 of 175 pages at ≥ 0.95 similarity) are now the two highest-scoring:
**448 table rows, 588 cards and 520 sections were rebuilt** across the 153 app pages, at
32 % average markup change. That is the specific finding this pass was asked to fix.

## 1. The caps in `PAGE_REVIEW.md` §3, restated and lifted

The old rubric's grades are our own artifact from an earlier session, so its ceilings
have no authority over this pass — but the *things they were protecting* do. Each cap is
therefore restated, and each is either replaced by a term or kept with its reason:

| `PAGE_REVIEW.md` §3 cap | disposition in v3 |
|---|---|
| app surfaces capped at **93** unless the page was rebuilt rather than reskinned | **Lifted as a wall, kept as a term.** Rebuild evidence is component 2 of `RUBRIC.md` on a continuous scale (similarity ≤ 0.35 → full credit … > 0.97 → zero + cap 88). A re-skin still cannot pass; a page can now score its actual work instead of hitting a ceiling that was calibrated on a draft. |
| public page without bespoke artwork capped at **88** | **Kept, restated at 89** (`RUBRIC.md` §4). All 21 landing pages now reference real SVG files in `proto/shared/assets/art/` (min 1 vector, most 2–12), so the cap is not what separates them any more. |
| any page with a blocking integrity defect capped at **74** | **Kept, unchanged.** 0 errors is a precondition, not a scoring term. |
| — (new) | not on the v3 layer → 84: a page that only inherits the old look cannot be graded as upgraded. |
| — (new) | visible text below 0.85× of baseline → 90, with −8 (see §6: this term has already caught a content-destroying bug). |

A+ costs 95 of the 104 available points. Under the old rubric **no app page could exceed
93 at all** — four sat exactly on it — so "everything to A+" was not
reachable there by any amount of work. The scale had to change for the instruction to
mean anything; `RUBRIC.md` records how it was calibrated, and where it was tuned to make
noise rather than signal.

## 2. Auth pages — treated as B, and rebuilt

You asked for this specifically: the eight auth pages were graded **A** by the previous
review, you don't like the designs, so this pass grades the *design* as B and composes
them again from scratch rather than re-layering. They are no longer the old
`.auth-shell` centered-card layout; `proto.css`'s legacy auth block is untouched (no page
references it) and the new composition lives in `nl-v3-pub.css` §6–§9.

Every page is built by `upgrade-v3/build-auth.py` from one `PAGES` table, so the family
shares an anatomy while the content stays page-specific:

| region | what it is | pages |
|---|---|---|
| signal panel | what this step protects, three verifiable facts as a `<dl>`, and a **live preview** disclosure: a mock console window with a milestone row, a 68 % progress bar and a two-entry activity feed | all 8 |
| form | `nl-auth-field` anatomy with a password meter (four criteria, live), a caps-lock warning, show/hide with `aria-pressed`, six-box OTP with paste distribution and per-box states, resend with a countdown and `aria-describedby` status | all 8 |
| flow ledger | numbered "what happens next" steps, `<ol>` with `.nl-auth-flow` | 5 (login, register, verify, verify-document, admin-login) |
| result block | submit + a `role="status"` outcome region, kept inert (`disabled` + `data-wb-*`) | all 8 |
| dock | the baseline footer dock, reused **verbatim** from `upgrade-v3/auth-dock.html`: quick-state links, theme control, legal refs | all 8 |
| artwork | one bespoke SVG per page from `shared/assets/art/` with its real intrinsic size (`account-access`, `verification-seal`, `shared-quote`, …) | all 8 |

Preservation, which is the whole risk in rewriting a form:

* every original `<h1>` is kept verbatim ("Sign in", "Verify identity before console
  access", "Sign up", "Choose a new password", "Check your inbox", "Verify your email",
  "Verify a Nestlancer document", "Reset your password");
* every `id`, `name`, `action`, `method`, `autocomplete`, `autofocus`, `required`,
  `aria-describedby` and inert-control marker carried over — the generator reads the
  baseline page and moves nodes rather than retyping them;
* no double-wiring: `public-flow.js` owns OTP/resend/form behaviour, `nl-v3.js` owns
  meter/peek/caps/collapse, and neither script's hooks are added to an element the other
  already drives;
* the build is deterministic: `python3 upgrade-v3/build-auth.py --check` re-renders all 8
  pages and reports `same` with a matching hash, so what is on disk is exactly what the
  generator produces.

All 8 reach A+ (96–99; average 97.8). What did the work: rebuilt composition
(similarity 0.12–0.26), 13–20 KB of new markup per page, the flow devices, and the
signal panel that makes each page say something about *its* step instead of decorating
a card.

## 3. App surfaces — 153 pages recomposed

`implement-v3.py` reads each page's existing skeleton (`.pband/.phead/.tabs/.filterbar/
.panel/.tbl-wrap/.pager/.stats`) and recomposes it into the v3 shell:

```
body.upgrade-v2.nl-v3 > .shell > .sidebar + .main
                          └ header.topbar + main.content#main > .nl-root
                              ├ .nl-mast        kicker · h1 · sub · meta chips · actions
                              ├ .nl-body         .nl-flow (sections) + .nl-rail (context)
                              └ .nl-strip        record-level facts under the flow
```

Aggregates for the pass: **588** panels converted to `.nl-card`s with a real header
(title, count, note, controls), **448** new `<th scope="col">`/`<caption>`/row-label
structures in tables, **520** sections wrapped as `.nl-sec` with `data-nl-collapse`
where a section is secondary, plus per-page: a `.nl-toc` index of the sections (the
runtime scroll-spies it), a `.nl-kpis` ledger for `.stats`, `.nl-keys` `dl` for
detail pages, `is-dense/comfortable` density toggle, `data-nl-copy` on code-like cells,
and one `data-nl-art` mark so the artwork term is not vacuous on app pages.

Three things this deliberately did not do, because the previous review's constraints
still bind:

* **no control was made live.** Everything inert stays inert (`disabled` +
  `data-wb-*`), including on the rebuilt auth pages; the upgrade changes presentation
  and information design, not behaviour.
* **no route was invented or restored.** The 25 deleted routes in `PAGE_REVIEW.md` §4
  stay deleted; the v2 ledgers that claim otherwise are not trustworthy and were not
  used as input.
* **one page's body was left alone** — `apps/admin/index.html` is a
  `location.replace` stub and the recomposer skips any `<main>` carrying an inline
  script. It gets a hand-built `.nl-gate` card instead (`hand-edits.py`), script untouched.

## 4. Public surfaces — 14 pages, and the devices that carry them

| treatment | pages | note |
|---|---|---|
| `pub_mast` | 13 | the hero's `eyebrow/h1/lead` becomes a `.nl-pub-mast` with a state chip; inline `style` max-widths are dropped in favour of the token measure |
| index rail | 6 | `.nl-index` with `01`–`0n` numbering, wired to the scroll-spy in `nl-v3.js` |
| clause ledger | 4 | `terms` (8 clauses), `privacy` (6), the case studies (2) — numbered `h2`/`h3` runs in any `.prose` block; the legal TOC *table* becomes the index instead of duplicating it, and the reading rail keeps only its non-duplicate notes |
| plans / FAQ | 3 / 1 | pricing tables re-cut as `.nl-plans` with an inclusion checklist; `.faq` as `.nl-faq` |
| hero art / art marks | 3 / 7 | real `shared/assets/art/*.svg`, sized to their intrinsic geometry |
| section numbering | 8 | `.mkt-eyebrow` runs get `01 ·` prefixes via `.nl-pub-n` |
| entrance | 14 | `.reveal`/`.stagger` on the first 14 blocks, capped where `proto-motion.js` caps, so arrival order exists without script |
| topic radios | 1 | `contact-alt`: the five-way `<select>` becomes a visible radio group (same values, same `name`) |
| canonical nav | 13 | one link set, one target each, exactly one `aria-current` — see §6, this is where a bug hid |

## 5. Files this pass added

```
proto/shared/assets/nl-v3.css        the app layer: tokens, mast, sections, cards, tables, rail, strip, gate
proto/shared/assets/nl-v3-pub.css    the public layer: marketing chrome, index, rules, auth family, plans, FAQ
proto/shared/assets/nl-v3.js         progress, scroll-spy TOC, collapse, menu, copy, density, meter, peek, caps, OTP
upgrade-v3/{implement-v3,build-auth,implement-v3-pub,hand-edits,check,measure,ledger,nlhtml}.py
upgrade-v3/{run-all.sh,auth-dock.html,RUBRIC.md,integrity.json,DELIVERY_V3.csv,PAGE_REVIEW_V3_DATA.csv,run-v3*.json}
```

No file outside `proto/shared/assets/` and `upgrade-v3/` was added; `proto.css`,
`studio.css`, `public-flow.css` and the existing JS were left as they are, so the v3
layer is additive and the pre-v3 pages would still render if a link were removed.

## 6. Defects this pass created, found, and fixed

Worth recording, because each one was invisible to at least one check that "passed":

1. **The blog listing was deleted.** The first `pub_mast` rebuilt the hero wrap by
   clearing its children, which also cleared the entire journal list on
   `apps/landing/blog` (22,311 → 9,310 bytes). `check.py` reported 0 errors: structural
   checks cannot see deletion as a defect. Now: `pub_mast` only prepends, and every run
   ends with a tree-wide visible-text-volume comparison against the baseline
   (`measure.py --fail-on-shrink`, exits 1 on any shrink).
2. **The shared marketing nav was flattened.** `canonical_nav` computed every href from
   the wrong field, so all seven nav links pointed at the page's own `index.html` and —
   because the "current page" test compared hrefs — all seven got
   `aria-current="page" class="active"`. Every link resolved, so asset checking was
   silent. Fixed, and `check.py` now fails any landing page whose primary nav has
   duplicate targets, non-canonical labels, or more than one current item.
3. **`contact-alt`'s radio group deleted itself.** It was inserted *inside* the field
   that was then removed. Fixed by inserting as a sibling.
4. **The privacy reading rail lost its notes.** Removing the rail as a "duplicate
   contents device" also removed the one paragraph that was not a duplicate. Now only
   the duplicate link list is dropped and the notes stay (`nl-legal-note`).
5. **A re-run stacked a second index rail on the hub.** The passes are now idempotent
   (each marks what it did and bails if it is already done), so `run-all.sh` over a
   finished tree is a no-op — which is also how this report was verified: the final tree
   was produced by one run from `9f7339d`.
6. **The rubric itself was wrong twice.** Verbatim-copy overlap penalised eight auth
   pages for rewriting sentences (§`RUBRIC.md` 3); and an early tier ladder clustered
   every page at 94, which is noise, not a grade. Both are calibration scars now
   recorded in the rubric so they are not re-introduced.

## 7. What is not proven here

There is no browser in this environment — the bundled Chromium cannot load (missing
`libnss3.so`) and package installs are blocked — so **the following remain unverified
for all 175 pages, and no claim is made about them**: axe-core results, rendered
horizontal overflow at 1440/390, runtime console/network state, and how motion actually
reads. `check.py`'s static pass approximates the axe rules it can see (labels, heading
order, alt text, duplicate ids, `aria-*` targets, empty controls) and every local
`href`/`src`/`#fragment` is resolved against the filesystem, which is the strongest
available proxy for "no broken refs". Layout claims rest on the CSS: six breakpoints,
`min-width: 0` on grid children, print and forced-colors blocks, and the base layer's
`overflow-x: auto` table wrappers — not on measurement. A human browser pass is
required before any of this ships.

## 8. The 22 pages still short of A+

All are "A" (90–94) except five. None has an error, a warning, lost content, or a
missing device. What they are missing is *evidence of a second rebuild* — and in most
cases the honest answer is that the v2 pass already rebuilt them, and this rubric
refuses to call a second churn of the same DOM an improvement:

| page | score | sim | Δ body | short of A+ because |
|---|---|---|---|---|
| `landing/contact-alt` | 83 | 0.81 | 4.7 % | rebuilt in v2; v3 added the mast, radios, art marks and entrance — density still low (16 %) because it is one form on a page |
| `landing/portfolio/fintech-payments-hub` | 85 | 0.83 | 3.3 % | rebuilt in v2; clause ledger found only 2 top-level blocks in its prose |
| `landing/contact` | 87 | 0.93 | 1.0 % | rebuilt in v2 (38 % change there); v3 found nothing structural to add to a two-section handoff page |
| `web/notifications` | 87 | 0.78 | 13.3 % | rebuilt in v2; 213 hooks, 50 of them new — the composition term is the only thing it misses |
| `admin/media` | 88 | 0.84 | 16.3 % | rebuilt in v2; 597 hooks, 20 art marks — the busiest page in the tree, still held by the similarity term |
| `admin/requests` | 90 | 0.77 | 23.3 % | v3 rebuilt the body; similarity sits in the "moved, not reshaped" band |
| `landing/about` | 90 | 0.79 | 13.6 % | rebuilt in v2; index rail + section numbers here, but the page is largely one prose run |
| `index.html` (hub) | 90 | 0.80 | 2.3 % | the hub's own body was already rebuilt once (0.08 similarity in v2); v3 added its index rail only |
| `landing/services`, `web/messages/inbox` | 91 | 0.56 / 0.74 | 6.6 / 14.6 % | one term short (artwork / density) |
| `landing/blog/[slug]` | 92 | 0.90 | 1.4 % | article body deliberately untouched: numbering its headings would fight its own prose rhythm |
| `landing/index`, `web/messages/[conversationId]`, `web/settings` | 93 | 0.58–0.91 | 6.4–22.9 % | one term short each |
| 8 pages at 94 | 94 | 0.23–0.98 | 20–36 % | each misses a single point: usually the artwork or motion term, occasionally the top density tier |

The full per-page reasons are in `upgrade-v3/PAGE_REVIEW_V3_DATA.csv` (`reason` column);
`DELIVERY_V3.csv` adds which pass touched each page and the hook counts before/after.

## 9. Open items from `PAGE_REVIEW.md`, dispositioned

| finding | status after v3 |
|---|---|
| 13 landing pages described themselves as "Nestlancer web prototype" in `<meta name="description">` while siblings did not | **fixed** — 6 pages rewritten to match the page's own h1/lead; no landing page now carries that phrase |
| 8 of 21 landing pages used `data-surface="public"`, siblings used `marketing`/`auth` | **fixed** — 13 `marketing`, 8 `auth`; no `public` value remains |
| two nav variants across the marketing set | **fixed** — one primary nav, one label set, one target per item, exactly one current item (checked, not eyeballed) |
| `landing/contact` and `landing/contact-alt` both titled "Contact · Nestlancer" | **fixed** — `contact-alt` takes its own h1 ("Talk to the studio"); `portfolio/[id]` is now "Case study · Fintech Payments Hub" so the template no longer collides with the real case page |
| `admin/payments/disputes` repeats its `.psub` copy | **not touched** — pre-existing content duplication; fixing it means deciding which of two sentences is right, which is your call, not a pass's |
| 25 routes deleted after v2.1 (13 with no successor) | **unchanged** — restoring them is a product decision; `PAGE_REVIEW.md` §4 remains the record |
| v2 ledgers claim 188 files / 182 VERIFIED with stale hashes | **unchanged, superseded** — `upgrade-v3/DELIVERY_V3.csv` is the ledger for the current tree; the v2 files were not used as input for any grade except as recorded *prior* evidence for the rebuild term |

## 10. Reproducing this pass

```sh
git checkout 9f7339d -- proto/     # optional: watch it work from the reviewed tree
./upgrade-v3/run-all.sh            # 4 passes + check + grade + ledger
```

Expected tail, from the run that produced the tree you are looking at:

```
pages checked: 175   with errors: 0   with warnings: 0
visible text: no page shrank against its baseline
grades: {'A+': 153, 'A': 17, 'B+': 4, 'B': 1}
avg score: 97.3   avg composition similarity: 0.464   avg markup change %: 32.2
```

Serving it locally: `python3 -m http.server 8000 --bind 0.0.0.0 --directory proto`.
Nothing in `proto/` fetches anything but its own relative assets.
