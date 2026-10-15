# Reference research — 2026-10-14

Six focused web_search calls executed before design changes:
- `site:magicui.design/docs/components animated beam border beam`
- `site:ui.aceternity.com/components background beams timeline spotlight`
- `site:uiverse.io button input focus CSS`
- `site:codepen.io SVG workflow path animation CSS`
- `site:ui.shadcn.com/docs/components dialog data table accessibility`
- `site:gsap.com/docs matchMedia prefers-reduced-motion`

Search results established discovery only. Results included Magic UI Border Beam (v3), Aceternity Timeline, Uiverse strange-goose-48, CodePen CMA-Designer/ByovJoR, shadcn base Data Table/Field, and GSAP matchMedia. No source code copied.

## Exact successful fetches
| ID | Requested URL | Final URL | Evidence read | Adaptation status | License |
|---|---|---|---|---|---|
| R1 | https://magicui.design/docs/components/animated-beam | same | description: path of light connects integrations; examples include multiple inputs/outputs; dynamic code empty in text response | APPLIED: home .delivery-art | UNKNOWN; principles only, no code copied |
| R2 | https://ui.aceternity.com/components/timeline | same | sticky header, scroll beam, date/content entries and images; TimelineEntry props | APPLIED: services .process-map | UNKNOWN; original implementation |
| R3 | https://ui.shadcn.com/docs/components/dialog | https://ui.shadcn.com/docs/components/base/dialog | overlay makes background inert; composition and custom close; dynamic code omitted | APPLIED: payment dialog[data-proto-dialog] | UNKNOWN; native dialog, no copied source |
| R4 | https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ | same | conditions object with reduceMotion, cleanup/revert on media change; actual JS example read | APPLIED: proto-motion.js preference lifecycle | UNKNOWN; GSAP not installed |
| R5 | https://ianlunn.github.io/Hover/ | same | Float, Underline from Left, Icon Forward and press examples listed | APPLIED: studio controls | Copyright Ian Lunn displayed; no library copied |

All five references are FETCHED, not VISUALLY_INSPECTED. Search/fetch tools can access pages but sandbox Chromium navigation to two real demos failed with ERR_CONNECTION_CLOSED. See evidence/reference-browser-attempts.json. The numeric search/fetch gate is met; visual reference-demo gate remains BLOCKED. Local implementation/browser QA can proceed; do not claim full research completion.

## Complete catalog availability
Every catalog URL was actually attempted once with sandbox urllib. Its result is independent of the successful fetch-tool results above. Raw results: evidence/catalog-access.json.

| URL | Direct access | Use |
|---|---|---|
| https://codepen.io | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://codemyui.com | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://uiverse.io | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://bootsnipp.com | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://animate.style | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://animista.net | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://gsap.com | BLOCKED: TLS connection closed | Selected exact doc fetched through fetch tool; see above |
| https://ianlunn.github.io/Hover | BLOCKED: TLS connection closed | Selected exact doc fetched through fetch tool; see above |
| https://michalsnik.github.io/aos | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://lottiefiles.com | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://minimamente.com/project/magic | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://keyframes.app | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://magicui.design | BLOCKED: TLS connection closed | Selected exact doc fetched through fetch tool; see above |
| https://ui-layout.com | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://ui.shadcn.com | BLOCKED: TLS connection closed | Selected exact doc fetched through fetch tool; see above |
| https://ui.aceternity.com | BLOCKED: TLS connection closed | Selected exact doc fetched through fetch tool; see above |
| https://cssgradient.io | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://glassmorphism.com | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |
| https://neumorphism.io | BLOCKED: TLS connection closed | NOT_SELECTED: use focused sources above; no library import |

Reference contract with selectors and tests: IMPLEMENTATION_PLAN.md. No claim of third-party visual inspection or licensed source import.

## Later client / portfolio lookup (R6)
- Query executed: `site:ui.shadcn.com/docs/components data table filtering accessible input status empty results`.
- Search discovery: [1](https://ui.shadcn.com/docs/components/base/data-table).
- Exact/final URL: https://ui.shadcn.com/docs/components/base/data-table (no redirect).
- Access date: 2026-10-14. Status: FETCHED, chunks 1 and 2 read. Visual demo inspection NOT performed.
- Observed: opt-in data-table features, explicit local filter state, named-column filtering, filtered row counts. Dynamic code blocks omitted by text fetch; no implementation code copied.
- Rejected: React/TanStack install, synthetic rows, server-side search claims.
- Adaptation: existing-record-only case-insensitive text/category filters, `data-local-list` / `data-local-search` / `data-local-category`, native select/input, live result count, honest empty state.
- Targets: `proto/apps/landing/portfolio/index.html`, `proto/apps/web/projects/index.html`, `proto/shared/assets/studio.js`.
- Terms: UNKNOWN; conceptual adaptation, original vanilla implementation. Application VERIFIED locally: browser-qa.json portfolio-filter, project-empty-filter, project-filter-reset.

## Local application verification (not remote demo visual inspection)
| Ref | Actual local application | Evidence | Application status |
|---|---|---|---|
| R1 | landing/index.html .delivery-art + .art-trace; art/delivery-system.svg | final-0-1440.webp; browser-qa.json early studio-trace + studio-scene | VERIFIED locally |
| R2 | services .process-map and .service-details; pricing .faq-item / comparison section | final-1/2 screenshots; keyboard and process-stage assertions in browser-qa.json | VERIFIED locally |
| R3 | payment dialog[data-proto-dialog], studio.js | payment-dialog-state.webp; shared-regression.json Tab containment true; Escape/return focus | VERIFIED locally |
| R4 | proto-motion.js matchMedia change/page lifecycle | browser-qa.json 24 visibility checks; shared-regression.json persisted event; final-focused-qa.json missing runtime | VERIFIED locally (real bfcache restoration not exercised) |
| R5 | studio.css .btn / :focus-visible / .work-cover | shared-regression.json 3px outline, -2px focus lift and press matrix | VERIFIED locally |
| R6 | portfolio and projects authored-record filters | browser-qa.json deterministic filter assertions | VERIFIED locally |

Initial search-result discovery links (not proof of fetch/render):
- Magic UI: [1](https://v3.magicui.design/docs/components/border-beam)
- Aceternity: [2](https://ui.aceternity.com/components/timeline)
- Uiverse: [2](https://uiverse.io/eslam-hany/strange-goose-48)
- CodePen: [1](https://codepen.io/CMA-Designer/pen/ByovJoR)
- shadcn: [2](https://ui.shadcn.com/docs/components/base/data-table)
- GSAP: [1](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)

## Batch 2 accessible field reference (R7)
- Focused search executed before design edits: `site:ui.shadcn.com/docs/components field description validation error accessible form`.
- Exact/final fetched URL: https://ui.shadcn.com/docs/components/base/field (chunk 1 read), 2026-10-14. Status: FETCHED; remote visual inspection not claimed.
- Observed patterns: label/control association, adjacent descriptions and errors, `aria-invalid`, responsive field layouts, optional semantic field grouping.
- Applied native subset: original name/email/company/topic/message controls remain, with required semantics, descriptive associations, adjacent validation errors, first-invalid focus and a local-only result. No fieldset was added for unrelated fields; no React/shadcn code or dependency was copied.
- Target: `proto/apps/landing/contact-alt/index.html`, `[data-demo-contact]`, `.field-error`, `studio.js`, `editorial.css`.
- Rejected: fabricated submission success, live endpoint, credential/PII persistence, duplicate form on marketing Contact.
- License: UNKNOWN; conceptual adaptation only, original native implementation.
- Local evidence: `batch2-browser-qa.json` contact-empty-errors, contact-invalid-email, contact-local-only-result, contact-no-network-or-storage, no-js-contact-submit-disabled; corresponding state captures.

### Batch 2 reference contract / verification
| Pattern | Adaptation | Local evidence |
|---|---|---|
| R2 staged workflow | About ordered steps and existing four-step table; native Contact FAQ | About full-page capture; workflow anchor and keyboard FAQ assertions |
| R4 conditional motion | One-shot illustration entry, inherited reduced-motion lifecycle; quiet article body | Early/settled animation samples and 18 visibility checks |
| R5 restrained response | Journal-cover hover/focus, contact CTA and native details | Actual controls + light/dark screenshots; no perpetual movement |
| R6 actual-data filtering | 12 preserved local cards; category totals kept, unavailable collection pages disclosed | Search → Kubernetes, empty Business, All reset → 12 |
| R7 accessible errors | Labeled original fields, error relationships and honest local result | Empty/email validation + focus + no transmission/storage |

Original screenshot inspection includes 014/015 marketing pages and 004 contact. 002/003/008 are visual references for sibling content, **not** state verification of the unedited web blog/case-study routes. Every batch-2 original HTML was inspected and captured before editing.

## Batch 3 application of established references
No new framework/source-code import. Reuse of previously fetched patterns: R4 native reduced-motion lifecycle (settled/no-JS tests); R5 restrained cover/control response; R6 supplied-record-only filters for ten articles and four conversation previews; R7 labeled input, adjacent explanatory/error text, focusable feedback. Article contents links and inbox previews use native links/buttons, not a simulated tab widget. Copy handlers catch permission/secure-context failures and reveal manually selectable content.

All four route HTML bodies and 390/1440 before renders were inspected independently. Existing compact public 002/003/008 source references and full client 005 source screenshot were reviewed; no landing-page body was copied into a web sibling. Local evidence: `batch3-browser-qa.json`, `batch3-before-*`, `batch3-after-*`. Remote visual-reference gate remains blocked; no additional remote visual inspection claim.

## Batches 5–7 (resumed session) — application of established references
No new external fetch (sandbox egress is limited to package/GitHub hosts). Patterns reused, adapted natively without copied components:
| Ref | Applied to | Verified by |
|---|---|---|
| R4 native reduced-motion lifecycle | `workbench.css`/`public-flow.css` reduced-motion rules; JS-only controls ship `disabled` and are enabled by script | `qa-lanes.cjs` live/fresh reduced-motion + no-JS passes per page |
| R5 restrained control response | Work/journal covers, rail active state, dialog/toast 160–180 ms | settled-motion checks (no infinite loops, finite motion ends < 9 s) |
| R6 supplied-record-only filters | Client/admin list search/filters/chips and web portfolio filter operate only over records on the page; options without sample matches are disabled with a note | interaction checks: zero-match empty state, Clear restores all, select results contain the option |
| R7 labelled fields + honest local result | Auth/verification forms (required, password match, stated reset rules, OTP fieldset), operator sign-in, document lookup, workbench action dialog ("Preview action… nothing changed") | `qa-batch-5.cjs` 33/33; `validate.py` 0 unlabeled controls across 188 pages |
