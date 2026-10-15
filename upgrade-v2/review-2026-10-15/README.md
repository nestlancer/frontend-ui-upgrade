# Review evidence — 2026-10-15 (pre-upgrade baseline vs current tree)

This folder is the **evidence pack** behind `PAGE_REVIEW.md` (repository root). It was produced by an independent review pass on 2026-10-15 that re-rendered the **pre-upgrade** prototype and measured every current page against it — it is not a summary of the implementation run’s own QA.

| Item | Value |
|---|---|
| Reviewed tree | `/home/user/frontend-ui-upgrade` @ `2b061fa9` (branch `arena/4c45be58-frontend-ui-upgrade`), working tree clean |
| Baseline compared against | `5066dcad` — the original 188-page prototype (`baseline_sha256` values in `../PAGE_COVERAGE.csv` match it) |
| Pages covered | **175 current** + **25 removed routes** |
| Tooling | Headless Chromium 153 (puppeteer-core + `@sparticuz/chromium`), axe-core WCAG 2.0/2.1 A+AA, ImageMagick 6.9 `compare`, `difflib` DOM-sequence comparison |
| Viewports | 1440×900 and 390×844 (light theme), plus full-page captures at 1440 |

## Files

| File | What it is |
|---|---|
| `pairs/<page>.webp` | **Before \| after** side-by-side for all 175 pages. **Left = red border (pre-upgrade render), right = green border (today).** Filenames are the route with `/index.html` removed and `/`→`_`, e.g. `apps_landing_pricing.webp`. |
| `removed-routes.webp` | Contact sheet of the 25 routes deleted after the v2.1 run, rendered from the pre-upgrade tree. Tiles are row-major, 5 per row, numbered 1–25 exactly like the ledger in `PAGE_REVIEW.md` §4 (1 = `apps/admin/login`, … 25 = `apps/web/work`). |
| `PAGE_REVIEW_DATA.csv` | One row per page: grade, score, every measured signal, git commit, previous review grade, current SHA-256. |
| `raw/final_grades.json` | Per-page grades with the exact reason string for each score. |
| `raw/visual.json` | Per-page pixel-diff results (viewport). |
| `raw/contentdiff.json` | Per-page **page-body** pixel diff (app shell cropped: 240 px sidebar + 56 px header). |
| `raw/skeleton_sim.json` | Per-page DOM/composition similarity vs baseline (`1.0` = identical composition). |
| `raw/successor_diff.json` | Visual difference between each new `apps/landing/*` page and the `apps/web/*` page it replaced. |
| `raw/successor_content.json` | Sentence-level content carried over for those 12 replacements, plus form-field comparison. |
| `raw/deleted_content.json` | For each removed route: text length, distinctive tokens, and which tokens no longer exist anywhere in the tree. |
| `raw/linkcheck.json` | Static link/fragment check over the current tree. |

## Method (reproducible)

```bash
# 1. baseline copy (read-only, outside the repo)
git worktree add /tmp/base 5066dcad

# 2. serve both trees
python3 -m http.server 8000 --bind 0.0.0.0 --directory proto        # current (live preview)
python3 -m http.server 8010 --bind 127.0.0.1 -d /tmp/base/proto     # pre-upgrade

# 3. render every page in both trees (1440 viewport + full page, and 390 mobile)
#    puppeteer-core + @sparticuz/chromium, 700 ms settle, .reveal blocks force-shown
node render.mjs   --root=<tree> --out=<dir> --port=<port> --mode=after|before
node render-full.mjs <tree> <out-dir> <port>
node render-mobile.mjs <tree> <out-dir> <port>

# 4. pixel diff (fuzz 12%) and page-body diff (crop shell for app pages)
compare -metric AE -fuzz 12% before/<page>.webp after/<page>.webp null:

# 5. composition similarity (DOM signature of <main>) and axe pass
node skeleton.mjs <tree> <out.json> <port>
```

**Noise floor:** five unchanged pages rendered twice differed by **0.00–0.15 %**, so a diff above ~0.5 % is a real change. Full-page captures are made at `deviceScaleFactor 0.6` to stay under the headless capture limit; side-by-side pairs are downscaled to 560 px per side.

## What the measurements mean

- **Fold %** — share of pixels that differ in the 1440×900 screenshot (what you see first).
- **Body %** — same, with the app shell cropped out (client/admin pages), i.e. the page content itself.
- **Composition similarity** — `1.0` means the rendered DOM sequence of `<main>` is unchanged (same elements, same order, same classes): the layout was restyled, not recomposed. Values ≤0.85 indicate a real composition change.
- **Struct +** — net additions of `aria-*`, `data-*` state hooks, `<label>`, `<dialog>`, `<details>`, `<th scope>`, `<fieldset>`, `role`.
- Grade bands, caps and the reasoning for every score are documented in `PAGE_REVIEW.md` §3.

## Known limits

Light theme only at 1440/390 in this pass (dark-theme captures remain in `../evidence/`); no screen-reader or physical-device session; grades are a craft judgement anchored to the measurements above, not an official score; the source screenshots in `Nestlancer-*-screenshots/` were used to sanity-check public pages, while the measurement baseline is the original prototype itself.
