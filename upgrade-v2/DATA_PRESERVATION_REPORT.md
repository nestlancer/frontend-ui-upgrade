# Data preservation — 2026-10-14

**Result: no unexplained removals or changes detected in protected extracted content.** This is not screenshot-fixture equivalence.

## Method
`baseline.py` captured all 188 original HTML files before application changes. `data-baseline.json` contains normalized text-node multisets, local/external href/src/action mappings, input defaults/types, relevant data attributes, original commit, and hashes of the three original shared files. Password input values are excluded; `resource.md` was not read.

`validate.py` compares semantic text and atomic attribute/value multisets, not whole-file hashes. Reordering, whitespace and decorative/semantic wrappers do not count as content loss. Independently checks percentage-bearing progress styles against the original clean Git commit. It writes `evidence/data-comparison.json`. Coverage hashes verify actual HTML edits separately.

### Results
- 188 original pages compared; all still exist at their original routes.
- Eight HTML files changed; no original text nodes lost on any of the 188 pages.
- No original progress-bar business styles removed.
- Every original business link, form action, source image, input value, and domain data attribute retained. Original route/fragment validation reports zero missing targets.
- The only removed resource mappings are Google Fonts/preconnect links on the eight edited pages. Same font family now loads from local OFL-licensed WOFF2 assets through shared CSS.
- Original ₹59,000 plan, ≈30 days, 2 revision rounds, custom quote / free consult semantics remain intact.
- Original NL-204 68% public preview, 40% client completion, ₹20,880 next payment and all admin payment amounts/IDs remain verbatim. Counters never animate through fabricated values.

## Deliberate interface additions (not new business claims)
Full additions are enumerated by page in `evidence/data-comparison.json`:
- Original-illustration descriptions/captions; delivery-stage labels grounded in existing MVP deliverables.
- Services process-stage buttons, disclosure summaries, comparison anchors.
- Pricing comparison anchor and native FAQ structure; no billing toggle or invented calculator.
- Portfolio local search/discipline labels, computed visible-result count and shared-fixture disclaimer.
- Login local-demo warning, toggle accessible name, local-only result and sample-dashboard link. No credential names/serialization, transmission, logging, storage, or real authentication.
- Admin fixture warning, native action-review dialog labels, notes, local-preview outcome. Existing amount default 3000 reused; no mutation to payment/status/ledger.
- Client “Active delivery” heading, real local filters, empty-state guidance, payment-list navigation.
- Entry hub partial-delivery notice and quick links; historical directory counts retained rather than silently rewriting business/source content.
- Global search and notification controls on the edited operator/client pages are explicitly disabled with explanations where their corresponding state is not implemented.

## Known fixture mismatches, preserved instead of overwritten
- Admin `040-payments-details.webp`: screenshot has ₹14,400 / Ananya Iyer / reconciliation project, whereas the mapped HTML contains a ₹3,000 completed fixture and ₹36,000 Karthik Menon UTR context.
- Admin `081-payment-details-awaiting-payment.webp`: screenshot has ₹30,000 payment due / Khandesh Spice D2C E-Commerce Store, not this page's current fixtures.
- Client `014-projects.webp`: screenshot project is Razorpay Settlement Reconciliation Engine; HTML project is Corporate LMS for 200 Employees.

Source screenshots are available and inspected. The unresolved issue is separate state/fixture reconstruction and provenance—not permission to replace the current record. These three mapped states are not verified; their pages remain IMPLEMENTED_UNVERIFIED despite passing base-page browser checks. No record has been invented to close this gap.

## Limits
Text-node preservation can establish retained facts, not their original correctness or live-system validity. Full screenshot-state data reconstruction, endpoint behavior, and production authentication are outside the delivered partial slice. Remaining page-specific accessibility/data associations need implementation, not just preservation.
