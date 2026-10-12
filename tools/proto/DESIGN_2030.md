# Nestlancer prototype — 2030 futures pass

Scope: every route in `tools/proto/routes/` (167 emitted pages, 149 routes + aliases) rebuilt into `proto/`.
Source of truth is `tools/proto/{css,lib,routes,build.mjs}`; regenerate with `node tools/proto/build.mjs`.

## What changed
- **Design system (`css/proto.css`, "2030 futures layer")**
  - Holo-teal signal gradient, cool mist canvas with a drifting signal grid (`body::before`).
  - Frosted glass panels, topbar and sidebar; luminous focus rings; holo hairline on every panel.
  - Light-sweep primary buttons, pulsing live dots, flowing progress fills, holographic cover plates.
  - Night-glass dark skin (toggle in the prototype menu) with cyan signal.
  - Motion is short (≤ 0.7s) and fully disabled under `prefers-reduced-motion`.
- **Readability:** no text below 11px in CSS or inline styles (was 9–10.5px on most screens).
- **Responsive (390px):** the app sidebar becomes a horizontal scrolling nav; the topbar sheds search and
  name; inline multi-column grids fold to one column (stat strips to two); badges wrap; marketing nav scrolls.
  No prototype page overflows horizontally at 390px.
- **Structure:** panel titles are real `h3` headings; the timeline shows `—` when a time is missing (was
  `undefined`); the operator sign-in title is the page `h1`; every header action row has one primary action.

## Mock data
Copy and mock values are unchanged. A text-level diff against the previous build shows exactly two
intentional differences: the `undefined` timeline stamp on the admin payment detail page is now `—`.

## Grade (tools/proto/grade pipeline, same scoring as UI_GRADE_REPORT.md)
| | Before | After |
|---|---|---|
| Median score | 62.7 | 69.4 |
| A / B / C / D / F | 4 / 13 / 19 / 93 / 52 | 13 / 13 / 55 / 90 / 10 |
| Pages with overflow at 390px | 177 | 0 |
| Text under 11px | 181 | 0 |
| No primary action | 43 | 25 |

## Remaining gaps (need content or new routes, not styling)
- Content coverage under 60% (151): the screenshot copy is not in the mock data, and the mock data must not change.
- Few section headings (91): these pages have a single panel or table; adding titles means adding copy.
- Page length differs >40% (81) and density differs (55): structural, follows the screenshot's full length.
- State not built as its own page (59): dialogs and tabs need their own proto routes.
