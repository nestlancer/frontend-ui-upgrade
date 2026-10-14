# Browser QA — PARTIAL implementation, measured results

Date 2026-10-14. Real local Chromium (version in `evidence/browser-qa.json`), Puppeteer and axe-core. No online grader or WCAG certification. All traffic to production was avoided; browser QA intercepted external requests. Static server serves **only `proto/`**, not reports/credentials/repository root.

## Run / preview
Live process: **Nestlancer prototype**, port 8000, bound to 0.0.0.0.
- `/` → `proto/index.html` with links to the actual upgraded pages.
- `/apps/landing/index.html` → homepage.
- Remaining URLs retain original directory/index.html structure, including literal brackets.
- Restart: `python3 -m http.server 8000 --bind 0.0.0.0 --directory proto` from repository root, using the environment's long-running process tool.
- No browser-facing localhost API URLs were added. Localhost URLs in the QA scripts are sandbox-side browser automation only.

## Initial slice matrix: eight pages (rerun after batch 2)
`evidence/browser-qa.json`: **62 viewport/theme combinations**, zero measured document overflow, zero measured clipping in sampled text/action/money elements, zero local network/JS errors. 32 axe runs (eight pages × 390/1440 × light/dark) reported zero violations in the final main pass.

| Index | Actual page | Browser widths | Themes | Page/state outcome |
|---|---|---|---|---|
| 0 | landing/index.html | 320,390,768,1440,1920 | light/dark | Base/public state verified |
| 1 | landing/services/index.html | 320,390,768,1440,1920 | light/dark | Native disclosure and stage buttons verified |
| 2 | landing/pricing/index.html | 320,390,768,1440,1920 | light/dark | FAQ/comparison and original values verified |
| 3 | web/login/index.html | 390,1440 | light/dark | Required fields, show/hide and honest local result verified |
| 4 | admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/index.html | 390,1440 | light/dark | Base layout/actions pass; two mapped data states blocked |
| 5 | landing/portfolio/index.html | 320,390,768,1440,1920 | light/dark | Covers/filter/empty state verified; shared-template destination disclosed |
| 6 | web/projects/index.html | 390,1440 | light/dark | Local search/status/reset pass; mapped screenshot record differs |
| 7 | proto/index.html | 320,390,768,1440,1920 | light/dark | Quick navigation reviewed; no page-family substitution |

Additional `final-focused-qa.json`: 12 checks on services/client projects/admin payment after final mobile/footer refinements, all zero axe violations and no document overflow. One transient axe “Page/Frame is not ready” error occurred during a test run; the rerun completed. Test tool retry does not alter shipped code.

### Screenshots and inspection
- Original mapped screenshots inspected; selected resized copies `original-*.webp`. Originals retained in their existing trees.
- Initial five-page baseline at matching 390/1440: `baseline-{0..4}-{width}.webp`.
- Portfolio/client baseline: `baseline-extra-{0,1}-{width}.webp`. Entry hub lacks a dedicated before render; original HTML/data baseline exists.
- Current full-page captures: `final-{0..7}-{390,1440}.webp`. App desktop main panes scroll independently, so supplement admin with `payment-desktop-bottom.webp` (scrollTop 465, no unrevealed blocks).
- Theme viewport captures: `qa-{index}-{light,dark}-{390,1440}.webp`.
- State captures: pricing-faq-state, login-local-state, payment-dialog-state, projects-empty-state.
- Superseding detail captures: footer-final-mobile.webp and client-final-mobile.webp.
- Rendered critique fixed: gradient word background specificity; faint sector captions; auth eyebrow contrast/landmarks; 320px CTA shrink; mobile footer links running together; client metrics consuming an entire phone screen; dialog focus escaping at Tab boundary.

## Batch 2 matrix and tested interactions
`evidence/batch2-browser-qa.json`: **60 layouts** (6 pages × 320/390/768/1440/1920 × light/dark); **24 axe checks** at 390/1440; final results: no measured overflow, sampled clipping, broken eager images, local HTTP errors, JS errors or axe violations. Local screenshot review covered all six pages at 390/1440, plus six selected dark-theme viewports.

Indices from `batch-2-paths.json`:
0 About; 1 marketing Contact; 2 landing case-study template; 3 landing blog listing; 4 landing article template; 5 app Contact.

- Before/after full-page scroll captures: `batch2-before-{0..5}-{390,1440}.webp`, `batch2-after-{0..5}-{390,1440}.webp`. Source reference extracts: `batch2-original-*`.
- Theme viewports: `batch2-qa-{0..5}-{light,dark}-{390,1440}.webp`.
- Actual assertions: workflow anchor; Contact FAQ via Enter; marketing handoff destination; three required-field errors and first-invalid focus; invalid email; local-only result focus; no document/fetch/XHR/non-GET requests or web-storage changes during form interaction; one-result Kubernetes search; empty Business category; reset to 12; article Results anchor; Bookmark toggle and reset on reload; case Outcomes anchor.
- `batch2-contact-errors.webp` and `batch2-contact-local-result.webp` capture the form states. They are not delivery success states.
- All original headline/value/default text was compared independently against the 188-page baseline.
- Source public 004 uses Subject/General; existing app Contact uses Company plus Topic/New project inquiry. Base page passes; exact source state remains **BLOCKED** and page **IMPLEMENTED_UNVERIFIED**. Public 014/015 states are verified. Public 002/003/008 map to separate web siblings and remain NOT_STARTED, despite related landing templates being upgraded.

### Batch 2 defects found and fixed
Dark-theme inline pricing/services links on marketing Contact relied only on color. Explicit underlines now distinguish them; final axe rerun has no link-in-text-block violations. The first attempted selector targeted a paragraph but the links actually lived inside a div; the corrected selector was tested, not just assumed.

One immediate-load fresh-reduced sample caught three unnamed CSS transitions. The batch-level reduction now includes the body itself as well as descendants, and the fresh-load sample runs after two committed animation frames rather than before style/frame settlement. Final 18 visibility samples have no hidden essential targets; both fresh/live reduced samples report no running animations. This is a post-frame measurement, not a claim about every pre-paint engine event.

The final batch-2 QA runner uses assertions and returns nonzero on failed layout/accessibility/visibility/interaction checks. Earlier failed attempts were fixed and rerun; raw final evidence is not presented as an all-attempts success history.

## Motion evidence (not inferred from screenshots)
Fresh-load `getAnimations()` sampled at approximately 100ms; settled sample at approximately 2300ms. Offscreen `.reveal` class/animations measured after scrolling. See raw named animations in browser-qa.json and MOTION_REGISTER.csv.
- Home: **studio-scene + studio-trace**, inherited hero/section reveal.
- Services: **studio-scene**, staggered stages and actual stage/disclosure interaction.
- Pricing: **studio-emphasis** on the featured engagement; FAQ keyboard and section reveal.
- Auth: quiet inherited nl-head/nl-rise; nl-grad one-shot lasts beyond the 2300ms sample (not a continuous loop).
- Admin: **studio-dialog** while open; existing compact header/timeline motion.
- Client: existing progress/header response without changing displayed numbers.
- Portfolio: restrained artwork hover/focus response; local filters do not fabricate rows.
- 24 visibility checks (8 pages × live preference change / fresh reduced motion / no-JS): zero hidden essential targets, zero running animations under reduced motion.
- Missing motion-runtime test initially hit browser cache and therefore did not actually block the runtime; rerun with cache disabled confirms root `studio-js`, zero hidden targets. See final-focused-qa.json.
- Existing charts: three SVG charts still tagged on admin dashboard; original artwork excluded from chart detection.
- Hover/focus/press: 3px outline, -2px focus lift, restrained pressed scale observed in shared-regression.json.
- Native dialog Escape/return-focus passed. Initial Tab containment failed at a browser-chrome edge; explicit wrapping implemented and retested **true** across 12 Tab presses.
- Prototype-menu aria-expanded and Escape focus restoration passed.
- Persisted `pageshow` event simulation produces no hidden blocks. **A real browser back/forward-cache restore was not exercised**; do not claim otherwise.

### Batch 2 motion / quiet reading
- About: `studio-unfold` scene entrance, inherited hero/scroll reveal; working workflow anchor.
- Marketing Contact: `studio-letter` entrance, existing section reveals and native FAQ interaction.
- Case template: `studio-unfold`, section links, existing lower-section reveals.
- Journal: inherited title/stagger/reveal, restrained cover response, actual-data filters.
- Article: title/media entrance only; prose paragraphs are deliberately static. Contents links and local reactions are actual controls, not animations.
- App Contact: quiet hero/form reveal and `studio-letter`; validation changes do not move the entire form.
- Six normal-motion early/settled samples, five offscreen-reveal samples (form fits near the initial viewport, so none claimed there), and **18 live/fresh-reduced/no-JS checks**. No new continuous loop.
- No-JS app form submission stays disabled. Existing content and native anchors/disclosures remain readable/usable. JavaScript-only search/reaction behavior is not claimed to operate without its runtime.

## Shared regression, separate from page completion
`regression.cjs` was rerun after batch 2 on **all 188 pages at 390 and 1440** under reduced motion, **376 rendered checks**: zero document overflow, zero local network/JS errors. This is a smoke test, not visual/state verification of 188 pages.

`validate.py` parsed all 188 HTML files and checked local href/src/action targets, fragments, literal bracket directories, duplicate IDs, input labeling, h1 count, missing alt, text/default/data preservation and original progress styles:
- Zero missing local targets or fragments.
- Zero static issues on all fourteen edited pages.
- Remaining inherited issues elsewhere: **208 unlabeled controls**, **six duplicate-ID groups across three files**, **one h1-count issue**. Exact paths/selectors in `static-validation.json`.
- Original headings/data preserved; no new rendered undefined/NaN or lorem-ipsum text was introduced by the implementation. Existing placeholder attributes remain legitimate form hints.

## Limits / failed completion gates
- **174 pages have no page-level implementation**; shared changes do not close those pages.
- 6 of 181 original screenshot states verified; 4 fixture-mismatched states blocked from sign-off; 171 not implemented/reviewed for state sign-off.
- No full A+ score, official grade, or WCAG compliance claim. Human review used local screenshots/DOM, not a screen-reader session or physical mobile device.
- Remote reference demo browser access failed. Actual search/doc fetch research succeeded; remote visual-reference gate remains incomplete.
- Outstanding pages/states, theme/a11y problems on untouched pages, and exact screenshot-data reconstruction remain real work.

## Tools / rerun
Tool dependencies are installed outside the repository at `/home/user/.cache/nl-qa/`, deliberately not deliverables. Chromium shared libraries extracted from its npm package are cache-only.

```sh
/home/user/.cache/nl-qa/venv/bin/python upgrade-v2/validate.py
LD_LIBRARY_PATH=/home/user/.cache/nl-qa/libs/lib node upgrade-v2/qa.cjs
LD_LIBRARY_PATH=/home/user/.cache/nl-qa/libs/lib node upgrade-v2/qa-batch-2.cjs
PATHS=upgrade-v2/batch-2-paths.json LD_LIBRARY_PATH=/home/user/.cache/nl-qa/libs/lib node upgrade-v2/capture.cjs batch2-after
LD_LIBRARY_PATH=/home/user/.cache/nl-qa/libs/lib node upgrade-v2/regression.cjs
LD_LIBRARY_PATH=/home/user/.cache/nl-qa/libs/lib node upgrade-v2/final-check.cjs
```

If caches are absent, install `puppeteer-core`, `@sparticuz/chromium`, `@axe-core/puppeteer` under a local excluded cache; Python venv uses beautifulsoup4/Pillow. On this minimal environment the Chromium package's `al2023.tar.br` supplies missing NSS/NSPR libraries. Application preview itself needs only Python's static server, no Node dependencies or build step.
