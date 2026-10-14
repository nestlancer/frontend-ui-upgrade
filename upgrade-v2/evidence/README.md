# Evidence index

This folder contains selective evidence for the implemented slice, not a second copy of the original screenshot collections. See ../QA_REPORT.md for limits and measured results.

## Page indices used in filenames
0 homepage · 1 services · 2 pricing · 3 client login · 4 admin payment detail · 5 landing portfolio · 6 client projects · 7 prototype entry hub.

- `baseline-{0..4}-{390,1440}.webp`: first five routes before edits.
- `baseline-extra-{0,1}-{390,1440}.webp`: portfolio and client projects before edits.
- `original-*.webp`: selected downscaled source screenshots opened for comparison; originals remain in their original folders.
- `final-{0..7}-{390,1440}.webp`: full-page post-implementation captures. Desktop app shells may have an internal scroll pane: see payment-desktop-bottom.webp.
- `qa-{0..7}-{light,dark}-{390,1440}.webp`: focused viewport/theme checks.
- `after-*.webp`, `home-*-crop.webp`: first iteration, retained as defect/fix evidence (not final).
- `footer-final-mobile.webp`: supersedes early full-page mobile footer spacing.
- `client-final-mobile.webp`, `final-6-390.webp`: final compact client metrics.
- `pricing-faq-state.webp`, `login-local-state.webp`, `payment-dialog-state.webp`, `projects-empty-state.webp`: exercised UI states, not production success claims.

## Machine-readable proof
- `browser-qa.json`: 62 layout/theme results, 32 axe outcomes, sampled active animations, scroll reveal, 24 reduced/no-JS visibility checks and deterministic interaction assertions.
- `shared-regression.json`: all 188 original pages at 390/1440, reduced-motion smoke pass, no per-state sign-off implied; additional focus/press/chart/dialog/lifecycle tests.
- `final-focused-qa.json`: post-fix footer, client layout, payment internal scrolling, prototype menu and disabled-cache missing-runtime checks.
- `static-validation.json`: all-page parse/link/fragment/ID/label/h1/alt results; remaining inherited failures are retained.
- `data-comparison.json`: per-page additive text and atomic attributes; no original text/default/progress loss.
- `coverage-summary.json`: durable counts consistent with both CSV ledgers.
- `catalog-access.json`, `reference-browser-attempts.json`: real failed direct reference requests and demo navigation attempts. Successful fetch-tool research is described in ../REFERENCE_RESEARCH.md; do not treat these failed requests as remote visual inspection.

Baseline/after captures establish composition. Animation proof is in sampled browser animation/state results, not the static images. No videos, online grades or real bfcache trace were produced.

## Batch 2 (separate index namespace)
`batch-2-paths.json` order: **0 About / 1 marketing Contact / 2 landing case-study template / 3 landing journal / 4 landing article / 5 app Contact**.

- `batch2-before-*`, `batch2-after-*`: six routes × 390/1440, full-page before/after scroll captures and dimension JSON.
- `batch2-original-*`: six compact source references inspected. The web 002/003/008 screenshots do not map to the newly edited landing templates; those web sibling states remain unverified.
- `batch2-qa-*`: light/dark viewport captures at 390/1440.
- `batch2-browser-qa.json`: 60 layout/theme measurements, 24 final axe passes, early/settled/scroll motion, 18 visibility checks and asserted interactions. See QA_REPORT for defects found/fixed and measurement timing.
- `batch2-contact-errors.webp`, `batch2-contact-local-result.webp`: local validation/error/result. No actual delivery, uploads, persistence or production success.

Initial-slice `browser-qa.json`, `shared-regression.json`, `final-focused-qa.json` and applicable viewport images were refreshed after the batch-2 runtime changes. Older full-page `final-*` captures remain initial composition evidence (the hub's current quick links are additionally covered by refreshed qa-7 images).
