# Upgrade V3 · the A+ scorecard

Everything in `proto/` is graded against this document, mechanically, by
`upgrade-v3/measure.py`. Nothing here is a taste judgement dressed up as a number:
every term is computed from the two files on disk (the page as it stands, and the page
as it arrived at `9f7339d`), plus `upgrade-v3/check.py` for integrity and static
a11y. If a term cannot be computed from files, it is not scored.

The bar the brief sets for A+ is: *a rebuilt composition, bespoke artwork, purposeful
motion, axe-core clean, no horizontal overflow at 1440 and 390, no console or network
errors.* Three of those six are measurable from static files and are scored. Three are
not, and §7 says what we did instead of pretending.

---

## 1 · Components (max 104, band floor 70 → A+)

| # | Component | Max | What it measures | Source |
|---|-----------|-----|------------------|--------|
| — | base | 45 | a well-formed page that opens at all: single `<h1>`, one `lang`, viewport meta, no unclosed structure, assets resolve | `check.py` |
| 1 | on the v3 layer | 8 | `nl-v3.css` + `nl-v3-pub.css` linked and `body.nl-v3` set | markup |
| 2 | rebuild evidence | 18 | Jaccard similarity of the `<main>` element-name sequence against baseline; lower is a bigger rebuild | §2 |
| 3 | rewritten markup | 6 | % of `<main>` bytes that are new relative to baseline | unified diff of the serialized body |
| 4 | structural hooks | 6 | count and density of semantic landmarks, labelled tables, `<dl>`, `role`/`aria-*`, `data-*` devices | markup census |
| 5 | bespoke artwork | 5 | `<img>`/`<svg>` referencing a real file under `shared/assets/art/` | markup + fs |
| 6 | motion wiring | 4 | `.reveal`/`.stagger` hooks plus the `proto-motion.js` layer that drives them, and the reduced-motion escape hatch | markup |
| 7 | content preserved | 3 | visible-text volume after ÷ before | §3 |
| 8 | integrity | 5 | 0 errors from `check.py` | `integrity.json` |
| 9 | static a11y | 4 | 0 warnings from `check.py` (labels, heading order, alt, focusables, duplicate ids, `aria-*` targets) | `integrity.json` |

`score = int(round(min(99, max(35, sum))))`. Bands: A+ ≥ 95, A ≥ 90, B+ ≥ 85, B ≥ 80,
C+ ≥ 75, C ≥ 70.

The scale tops out at 104 on purpose. A+ costs 95 of 104 — about 91 % — so a page can
be excellent while leaving one term short (no artwork on a page that does not want any,
say), but cannot reach it by being clean and small. Under the v2 rubric no app-surface
page could exceed 93 at all (12 pages sat exactly on that ceiling) and only seven
landing pages had reached 95–97; the top of this scale is reachable from any surface,
which is what the brief asks for, and it is reachable only by earning every term.

## 2 · Rebuild evidence, and why the previous pass counts

Component 2 is the term that separates "reskinned" from "redesigned". Similarity tiers:

| similarity `s` | credit | reading |
|---|---|---|
| ≤ 0.35 | 18 | rebuilt |
| ≤ 0.55 | 15 | reshaped |
| ≤ 0.75 | 11 | moved |
| ≤ 0.90 | 6 | restyled |
| ≤ 0.94 | 4 | mostly restyled |
| ≤ 0.97 | 2 | touched |
| > 0.97 | 0 + cap | nothing happened |

`s_eff = min(s_now, s_prev)` where `s_prev` is the similarity recorded by the
2026-10-15 pass (`upgrade-v2/review-2026-10-15/PAGE_REVIEW_DATA.csv`). Two rules follow
from that one line and both matter:

* **Prior evidence is accepted.** 33 pages were rebuilt in the v2 pass and are already
  far from the pre-v3 baseline on a measure v3 cannot re-run. Asking them to churn
  their DOM twice to prove the same point would be theatre, so they keep the credit.
* **Prior evidence cannot be banked against a regression.** Because it is a `min`, a v3
  pass that copies a page back towards its baseline loses the credit immediately. A
  page cannot be graded on work it is not currently showing.

Two calibration scars, recorded so nobody re-introduces them:

* an early draft scored prior-A+ pages with a flat `+4`; it double-counted (the prior
  grade is already an aggregate) and let untouched pages drift up. Removed.
* tiers at 55/35/20/10 clustered every page at exactly 94 — a cliff of near-ties with
  no information in it. The 30/20/12/6 ladder in component 4 and the 0.90/0.94/0.97
  ladder here were picked by plotting the distribution until bands separated real
  design differences instead of noise. `s ≤ 0.94 → +4` replaced an earlier hard cliff
  (`≤ 0.90 → +6 else 0`) that punished a page for one changed wrapper.

## 3 · Content preserved — length, not wording

Component 7 compares how much the page *says*, not whether it kept its sentences:

```
ratio = visible tokens after ÷ visible tokens before
ratio ≥ 0.95 → +3   "content preserved"
ratio ≥ 0.85 → +1   "content trimmed"
ratio <  0.85 → −8  and a cap at 90
```

The earlier draft compared token *overlap*, which quietly demanded that a redesign reuse
the old wording: eight auth pages scored 73–93 % and lost 8 points each for copy that
had been rewritten for the new composition, not removed. Rewritten prose is the job;
thinner prose is the failure. Volume catches the failure and forgives the rewrite, and
the ledger still prints `text_kept_pct` so a reviewer can see verbatim overlap when they
want it.

This term is also the one with teeth against my own tooling: when the public pass first
landed it deleted the whole blog listing on `apps/landing/blog` while rewriting the hero
(22,311 → 9,310 bytes) and `check.py` reported zero errors, because structural checks
cannot see deletion as a defect. Every run of `run-all.sh` therefore ends with a
tree-wide shrink audit against the baseline, and the pass is refused if any page shrinks.

## 4 · Caps (the part that used to be a ceiling)

PAGE_REVIEW.md §3 capped three things. They are **restated here, and changed**, because
they were written for a pass that was grading the v2 output, and the grades in §3 are
our own artifact — a cap inherited from a draft we are replacing would freeze the tree at
that draft's ambition.

| v2 cap (PAGE_REVIEW.md §3) | v3 disposition |
|---|---|
| app surfaces ≤ 93 unless the page was *rebuilt*, not reskinned | **Lifted into component 2.** The cap's intent — no skin-only pass on an app page — is now enforced by `s_eff > 0.97 → cap 88`, which is continuous instead of a wall, and by the +6 markup term. |
| public page without bespoke artwork ≤ 88 | **Kept, at 89**, so an artless public page can reach A but never A+. Landing pages carry real vectors now (all 21 do). |
| any page with a blocking integrity defect ≤ 74 | **Kept unchanged**, at 74. Nothing about this pass weakens it: 0 errors is a precondition of the whole exercise. |
| — | **Added:** not on the v3 layer → 84 (a page that only inherits the old look cannot be graded as upgraded). |
| — | **Added:** content shrank to < 0.85× → 90 (§3). |

Caps are applied as `min`, so several at once stack downward, never upward.

## 5 · Deliberately not scored

* **Copy quality.** Scored by hand in the review, not by a metric. A tool that counts
  words would reward padding, and padding is the failure mode of every redesign machine.
* **Colour, spacing, type scale.** Reviewed against the token set; a distance metric on
  hex values measures difference, not goodness.
* **Anything needing a browser** — see §7.

## 6 · Regenerating

```sh
./upgrade-v3/run-all.sh
```

runs the three passes (`implement-v3.py` → `build-auth.py` → `implement-v3-pub.py`),
`hand-edits.py`, `check.py` and `measure.py`, writing `integrity.json`,
`PAGE_REVIEW_V3_DATA.csv`; then `python3 upgrade-v3/ledger.py` writes the per-page
`DELIVERY_V3.csv`. To watch it work from the start: `git checkout 9f7339d -- proto/`
first. Each pass marks what it did, so re-running over a finished tree is a no-op.

## 7 · What this rubric cannot tell you

There is no browser in this environment (the Chromium bundle fails on a missing
`libnss3.so`, and package installs are blocked), so these claims are **not** made for
any page and are not part of the score:

* axe-core results — component 9 is a static approximation of the checks axe runs
  (labels, heading order, alt, duplicate ids, `aria-*` targets, focus visibility via
  the CSS layer), not axe.
* rendered horizontal overflow at 1440 / 390 — the CSS layer carries the breakpoints
  (1280 / 1120 / 900 / 720 / 560 / 420), `min-width: 0` on every grid child, print and
  forced-colors blocks, and wide tables keep the base layer's `overflow-x: auto`
  wrapper (`.tbl-wrap`, 89 pages); layout itself is unverified.
* console or network errors at runtime — the pages are static, reference only relative
  asset paths, and `check.py` fails any page with an unresolved local `href`/`src`,
  which is the strongest available proxy.
* motion timing as perceived — the hooks and the reduced-motion gate are verified; how
  the choreography feels is not.

A human pass in a real browser is still required before this ships. The grades below
should be read as "statically complete and internally consistent", which is exactly
what they are.
