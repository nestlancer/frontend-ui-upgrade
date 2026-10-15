# Original artwork and local resources

All ten SVGs were hand-authored for this implementation on 2026-10-14. They use only original vector geometry; no stock, scraped, generated-photographic, or third-party template assets. No customer screenshot/result claims. Source generators: `make-art.py` and `batch-2-art.py`. Total SVG payload: 15,385 bytes; largest: 3,398 bytes. No base64 art, external images, or additional animation library.

Paths below are relative to `proto/shared/assets/art/`.

| Art ID | File | Provenance / terms | Intended meaning | Integrated pages | Mobile treatment | Alternative treatment | Motion |
|---|---|---|---|---|---|---|---|
| A1 | delivery-system.svg | Original authored SVG; part of repository implementation | Nest identity as connected brief / build / release system | landing/index.html `.delivery-art` | Fluid viewBox, moves below copy, intrinsic 760×660 | Informative alt; editable HTML caption; overlay SVG `data-artwork` and aria-hidden | M1 |
| A2 | delivery-process.svg | Original authored SVG | Four-stage studio delivery process | landing/services/index.html `.process-map` | Fluid 960×290; keyboard/touch stage controls underneath, live description outside image | Descriptive alt; stage text and source deliverables are real HTML | M2 |
| A3 | work-workspace.svg | Original authored SVG | Workspace / interface panels | landing/index.html, landing/portfolio/index.html, landing/login/index.html | Fluid 640×420; single-column cards on phones | Decorative empty alt on cards; descriptive alt in auth; illustrative caption | M1/M4/M6 |
| A4 | work-mobile.svg | Original authored SVG | Fitness/mobile product concept | landing/index.html, landing/portfolio/index.html | Intrinsic 640×420 | Empty alt alongside project title; clearly illustrative | M1/M6 |
| A5 | work-commerce.svg | Original authored SVG | Product / commerce checkout concept | landing/index.html, landing/portfolio/index.html | Intrinsic 640×420 | Empty alt alongside project title; illustrative, not a deployed storefront | M1/M6 |
| A6 | work-analytics.svg | Original authored SVG | Analytical / operational dashboard concept | landing/index.html, landing/portfolio/index.html | Intrinsic 640×420 | Empty alt alongside project title; paths are decorative, not invented metrics | M1/M6 |

## Batch 2 additions
| Art ID | File | Provenance / terms | Meaning and integration | Mobile / alternative treatment | Motion |
|---|---|---|---|---|---|
| A7 | studio-collaboration.svg | Original hand-authored geometry | Shared product canvas with brief/review notes; About hero and incident-response article cover | Fluid 760×520; descriptive About alt and caption; decorative cover alt next to article title | M9/M12 |
| A8 | studio-correspondence.svg | Original hand-authored geometry | Brief/envelope motif ties marketing Contact to the actual app form | Fluid 760×520; stacked under copy or form, useful alt; no sent-message claim | M10/M14 |
| A9 | deployment-pipeline.svg | Original hand-authored geometry | Coupled build splitting into service pipelines; featured journal item and article hero | Fluid 960×440; explicit illustrative-not-production caption | M12/M13 |

A3/A5/A6 also supply conceptual journal covers. A6 supplies the Fintech Payments Hub cover, with a clear illustrative-not-customer-chart caption and descriptive alt. The supplied client quote/outcomes are original fixture content, not claims inferred from the illustration. New SVGs load through image elements, not inline chart selectors.

Batch-2 artwork payload is **4,523 bytes total**. Local light/dark and 390/1440 captures: `evidence/batch2-after-*` and `batch2-qa-*`. Browser matrix verifies assets; scroll captures load lazy journal covers.

## Resources
Geist Sans and Geist Mono variable WOFF2 fonts copied from the official `geist` npm package fetched from registry.npmjs.org. Copyright Vercel, in collaboration with basement.studio. SIL Open Font License 1.1 checked and retained in `proto/shared/assets/fonts/OFL.txt`. Two font files total about 139 KB. These refine the existing font family, not a new dependency. Shared CSS includes local @font-face definitions; system fallbacks remain.

## Verification
Images render locally in Chromium; width/height attributes reserve space. Lazy covers verified through full-page scroll capture. Final public captures: `evidence/final-{0,1,5}-{390,1440}.webp`; auth: `final-3-*`. Art overlay is excluded from chart detection. `shared-regression.json`: art/chart isolation true; existing admin dashboard still has three tagged charts.

## Batch 3 integration
**A10 — `payment-flow.svg`**: original hand-authored SVG geometry (source is the SVG itself), 960×300. Web case-study Gallery depicts the supplied webhook → queue → reconciliation-ledger → CSV-export narrative. Descriptive alt, visible ordered labels and explicit illustrative-not-production caption. No logos, figures, customer screens or third-party imagery fabricated. Fluid image; labels become two columns on phones. M17; `batch3-after-2-*` and browser QA.

A3/A5/A6/A7/A9 reused as clearly illustrative web journal covers; A9 full-article media; A6 web case-study hero. No new artwork in the client inbox. Ten local SVGs remain small; no animation/image dependency added.

## Batch 5–7 additions (resumed run)
Five further SVGs were hand-authored on 2026-10-14 for the remaining public flows and operator surfaces. Original vector geometry only (no stock, scraped, generated-photographic or third-party template assets; no logos, people, customer screens or invented metrics). 760×520 viewBox, fluid, `width`/`height` reserve space. Payload **12,847 bytes** total.

| Art ID | File | Meaning and integration | Mobile / alternative treatment | Motion |
|---|---|---|---|---|
| A11 | account-access.svg | Identity card, key and protected form panel — account creation / recovery. landing/register, landing/forgot-password, landing/reset-password auth rails (`.auth-art`) | Rail stacks below the form on phones; descriptive alt per route; "Illustrative … · local prototype" caption | M21 |
| A12 | verification-seal.svg | Envelope, six-cell code card and check seal — verification. landing/verify-email rail, landing/verify beside the code card, landing/verify-document hero | Hidden below 600 px on verify (card first), stacked above on verify-document; descriptive alt; "not a live service" caption | M21 |
| A13 | operator-console.svg | Operator console behind a lock — internal boundary. landing/admin-login left column, web/impersonate restricted-session panel | Hidden below 600 px on admin login; stacked on impersonate; descriptive alt | M21 |
| A14 | editorial-journal.svg | Stacked article cards with a bookmark ribbon — reading/journal lists. landing/blog, landing/blog, landing/blog heroes | Stacks below the hero copy; descriptive alt; decorative caption | M21 |
| A15 | shared-quote.svg | Read-only quote sheet with lock and expiry tag. web/share/[token] header | Hidden below 600 px (quote first); descriptive alt; "Illustrative read-only snapshot" caption | M21 |

Reuse: A1 (web home delivery system), A7 (web About hero), A3–A6 (web portfolio/work concept covers with "Illustrative product concepts — not customer screenshots" caption), A3/A5/A6/A9/A2/A10 (decorative journal covers on category/tag/bookmarks; empty alt next to the real article title). Client and admin workbench pages (Batches 6–7) add no artwork — they are dense operational screens where illustration would displace data.
