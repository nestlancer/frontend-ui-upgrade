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
