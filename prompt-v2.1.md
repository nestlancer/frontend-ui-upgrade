# Nestlancer UI Upgrade — Detailed Implementation Prompt v2.1

**Requested filename:** `ai-prompt-v2.md`  
**Repository:** https://github.com/nestlancer/frontend-ui-upgrade.git  
**Prepared:** 13 October 2026  
**Purpose:** Replace the execution instructions in `prompt-v2.md` with an implementation-first, research-backed prompt that actually upgrades the existing HTML, public-page artwork, interactions, and animation.

> This file was prepared by reviewing the repository and existing prompts. Preparing it did **not** execute prompt v1, prompt 1.1, or prompt v2, and did **not** redesign application files. The implementation instructions below are for a future run that you explicitly authorize.

---

## Operator guide — read before running

1. Open the repository in an agent environment with filesystem access, web search/fetch, and preferably a browser automation tool or Playwright.
2. Keep the existing ranking reports: prompt v1 and prompt 1.1 have already been run. Do **not** rerun them automatically.
3. Give the agent this file and say: **“Execute the IMPLEMENTATION PROMPT below. Implement in the existing `proto/` files; do not only produce a plan. Use the public-first balanced work order. Report partial progress honestly if interrupted.”**
4. The complete default scope is the existing prototype, not only the first batch. Large scope may need multiple execution turns. Use the persistent progress ledger and the resume instruction at the end of this file.
5. A completed plan, a shared CSS update, or a screenshot of one page is **not** completion of the requested redesign.
6. Do not expect one prompt to guarantee an A+ design from every model. This prompt makes the evidence and acceptance conditions explicit; actual visual quality still requires rendered inspection.

### Short assessment of the old v2

The old prompt has useful KEEP/CHANGE rules, brand guidance, reference categories, and reduced-motion intentions. It is **not sufficiently reliable as an execution contract** for your reported failures.

| Issue found | Why it can fail | Correction in this prompt |
|---|---|---|
| Start command hardcodes P0; fallback asks for three P0 pages | Current report has no P0 pages | Skip empty batches; use real ranking data |
| Public marketing homepage is near the end of the ranking | Strict worst-first can consume the session on operator screens | Mandatory public launch slice, then balanced surface lanes |
| Shared CSS can count as the main deliverable | Existing HTML stays structurally generic or unwired | Per-HTML coverage ledger and substantive page-level diffs |
| “One signature animation” is not wired to a specific selector and trigger | Keyframes can exist without ever running | Per-page motion register, browser playback evidence, trigger checks |
| Atmosphere is described, but art assets are optional/vague | Output remains gradients and plain cards | Mandatory original/local artwork on core public pages, art register, real asset wiring |
| Reference fallback permits snippets plus known patterns | Agent can act from memory instead of studying components | Separate DISCOVERED/FETCHED/VISUALLY_INSPECTED/APPLIED states; no false research claims |
| Expected A+ can be reported without rendered proof | A self-assessment is mistaken for verified quality | Explicit verification status and measured versus subjective results |
| Screenshot count is treated as page count | Repeated states share HTML; unranked routes disappear from scope | Inventory all HTML separately from all screenshot/state pairs |
| Instructions imply `/home/...` bash work is not downloadable | In Arena, files under `/home/user` are the shared persisted workspace | Work directly in the documented shared workspace; verify real paths |
| Can automatically rerun prompt 1.1 | Unnecessary audit instead of the requested implementation | Read existing reports; ask if genuinely missing |
| Earlier decision document conflicts with motion/art instructions | Agent can suppress art and motion by following old recommendations | Explicit instruction precedence |
| Grade-by-grade workflow has no durable restart state | Interrupted runs repeatedly plan and redo a few files | CSV ledger, next exact paths, persisted evidence |

### Repository snapshot — facts, not execution results

Reviewed checkout: `153017db450b460e7b180fff09d9645a06cb0c5c`.

- Existing HTML: **188 files**: admin **102**, web **76**, landing **9**, plus `proto/index.html` **1**.
- Existing screenshot/ranking rows: **181**: admin **119**, clients **45**, public **17**.
- Current ranking batches: **P0=0**, **P1=23**, **P2=124**, **P3=34**, **P4=0**.
- Ranking CSV includes `verdict` in addition to the earlier prompt's proposed columns.
- The three shared runtime/style files exist: `proto/shared/assets/proto.css`, `proto/shared/assets/proto-motion.js`, `proto/shared/assets/ui.js`.
- Existing CSS already contains a substantial PASS 2 motion layer. The problem is not solved by claiming “motion file exists.” Inspect selector coverage, actual playback, and public-page composition.
- The repository is a static HTML prototype, not the production Next.js app described in older decision notes.
- `tools/proto/UI_GRADE_REPORT.md` and `tools/proto/DATA_AUDIT.md` are not present in the reviewed working tree. Do not make them prerequisites or recreate history without need.
- These counts are snapshot facts. The implementing agent must refresh them if the checkout changes.

---

# IMPLEMENTATION PROMPT — START

## 1. Mission and required output

You are the implementation agent: principal product designer, senior HTML/CSS/JavaScript engineer, motion designer, and frontend QA reviewer.

**Your task is to materially upgrade the existing Nestlancer prototype files in this repository.** Do not stop at an audit, reference list, design proposal, plan HTML, design-system showcase, or shared token changes.

Deliver:

1. Actual upgraded HTML inside the existing `proto/apps/admin/`, `proto/apps/web/`, and `proto/apps/landing/` paths.
2. Cohesive shared CSS/runtime improvements in `proto/shared/assets/`.
3. Locally stored original or appropriately licensed artwork that is visibly integrated into public pages.
4. Working public-page motion and usable interactions, plus restrained app micro-interactions.
5. A complete coverage ledger covering every original HTML file and every screenshot/state pairing.
6. Research, artwork, motion, data-preservation, and browser QA evidence.
7. A final manifest of the real changed files in the persisted workspace.

A valid result improves **composition + component craft + artwork + responsive behavior + motion + interaction**, not only color and spacing.

### Authorization and boundaries

- Execute this implementation prompt only when the user asks you to execute it. If asked only to review or improve a prompt, write the prompt and stop without modifying the application.
- During an authorized implementation run, proceed beyond planning without asking for permission at every phase.
- Do not run prompt v1 or prompt 1.1 again. Treat them as historical/reference documents.
- Do not push, create a PR, publish, log in to production, or call production APIs without separate authorization.
- Do not use account credentials from `resource.md`, reproduce them in documentation, or embed them in client code. The prototype task does not require authentication to live services.
- Do not run destructive git resets/cleans or overwrite unrelated user changes. Record the initial worktree status.

## 2. Instruction precedence and scope

Follow, in descending precedence:

1. The user's latest explicit scope, constraints, and approvals.
2. This implementation prompt.
3. Actual repository files and validated screenshot/route mappings.
4. Existing `RANKING_REPORT.md`, `RANKING_REPORT.csv`, and `RANKING_PRIORITY_BATCHES.md` as work suggestions, not unquestionable facts about a changed checkout.
5. Older prompts and `QUESTIONS.md` for historical context only.

`QUESTIONS.md` contains recommendations such as “no orbs, no glass, no mesh,” “photography only,” and a production-framework migration. Unless the user explicitly confirms those decisions for this run, they do **not** override the current request for public artwork, animation, and a static HTML upgrade. Preserve Nestlancer identity and choose purposeful effects rather than applying every library demo.

### Keep the existing architecture

- Work in `proto/`. Do not create a new React/Next/Vite app instead of editing it.
- Do not install shadcn, Aceternity, or Magic UI React components into static HTML. Study their visual and interaction principles and translate selected patterns into maintainable HTML/CSS/vanilla JS.
- Do not rename existing routes or delete duplicate-looking routes to reduce the coverage count.
- `proto/index.html` is an existing prototype entry point; inspect and improve its navigation/usability where needed. It is not a substitute deliverable for the actual page families.
- New optional styles/runtime must live in `proto/shared/assets/`, be locally referenced from the real target pages, and have a documented reason. Prefer the existing shared files.
- Planning and evidence live under `upgrade-v2/`, not as an alternative application.

## 3. Phase A — establish a factual baseline

Keep this phase concise. Its purpose is to enable implementation, not consume the run with another audit.

### 3.1 Workspace and checkout

Use the existing checkout if present. Otherwise shallow-clone the specified repository into a persisted workspace directory. Do not clone a second copy merely for convenience.

On Arena, the shared persisted filesystem root is `/home/user`; bash and file tools operate on this same filesystem. Files under that root can persist. `/tmp` and other outside paths are scratch and are not deliverables. Respect the environment's actual instructions if running elsewhere.

Record:

- Workspace root and repository root.
- Current commit and initial git status.
- Runtime/tool availability: web search, fetch, browser, image tools, package installation.
- Current file counts and approximate workspace size.
- Whether existing ranking reports and screenshots are available.

Do not describe excluded dependency/cache directories as persisted deliverables. Do not duplicate screenshot trees, browser installations, dependencies, or `.git` directories into the evidence folder. Arena snapshots are best-effort capped around 128 MB/10,000 files, so keep evidence selective and assets optimized.

### 3.2 Read only the inputs needed to start

Read:

- Ranking headline, methodology limits, systemic playbook, and relevant recommendation cards.
- Actual CSV header/rows and batch file.
- Screenshot manifest and screenshot-directory README files for mapping context.
- Shared CSS token/component layers, PASS 2 motion, and runtime event hooks.
- Current HTML and matching screenshot for each page you are about to implement.

If reports are missing, ask for them or ask permission to proceed from a fresh lightweight inventory. Do not automatically launch the full prompt 1.1 audit.

If report recommendations are repeated boilerplate, translate them into concrete page-specific decisions. An invented heading/count is not a legitimate fix for “missing h2.”

### 3.3 Build two separate coverage inventories

Create `upgrade-v2/PAGE_COVERAGE.csv` with **one row per existing HTML file**. Include unranked files and literal bracketed directories such as `[id]`/`[slug]`.

Required columns:

```text
page_path,surface,page_family,ranked,ranking_batch,min_rank,screenshot_paths,baseline_sha256,status,html_changed,shared_only,art_asset_ids,motion_ids,reference_ids,qa_status,blocker,next_action
```

Create `upgrade-v2/STATE_COVERAGE.csv` with one row per screenshot/ranking pairing:

```text
screenshot_path,proto_path,match,verdict,state_name,trigger_or_url,status,evidence,blocker
```

Rules:

- `surface` is based on page purpose, not only folder name. `proto/apps/landing/admin-login/index.html` is public/auth despite the admin path; web includes client and public pages.
- Several screenshots may map to the same HTML. Keep all their state rows while grouping the actual page implementation.
- Ranking rows do not cover all original HTML. Unranked siblings and concrete-ID/template variants must be inspected too.
- Baseline hashes make HTML changes checkable. Do not fake page-level progress based solely on shared CSS.
- Validate every recorded path exists. Treat mismatch/parent/template-only findings as specific implementation issues, not invitations to invent data.

Allowed page statuses:

- `NOT_STARTED`
- `INSPECTED`
- `IN_PROGRESS`
- `IMPLEMENTED_UNVERIFIED`
- `VERIFIED`
- `PROTECTED_NO_CHANGE`
- `BLOCKED`

`VERIFIED` requires page-level review and the applicable browser/QA evidence. `PROTECTED_NO_CHANGE` requires a specific explanation and a rendered check; it cannot be used to excuse generic public pages. A CSS-only inherited improvement is recorded as `shared_only=true`, not as rewritten HTML.

### 3.4 Establish preservation evidence

Before edits, use a read-only script to extract per-page baseline facts into `upgrade-v2/data-baseline.json`:

- Business text in rows, lists, forms, pricing, case studies, and other domain content.
- Amounts, IDs, names, dates, emails, counts, statuses, progress percentages, input defaults, and relevant `data-*` values.
- Existing `href`, `src`, form-action, and state-trigger mappings.

Keep small snapshots/extracted facts, not a duplicate copy of the entire repository. Hash original shared files too. Do not include live account passwords or secrets in this baseline.

Structural markup may change; business values may not. Whitespace normalization and decorative wrappers should not create false failures. Do not hash the entire HTML and call a changed hash a data corruption test.

## 4. Work order — public pages must not be starved

Default mode: **PUBLIC-FIRST BALANCED**. This intentionally replaces the older strict global P0→P4 order because the user specifically reported missing public art and animation.

### 4.1 Shared foundation plus public launch slice

After a compact reference/design contract, implement:

1. Necessary shared token/component/runtime foundations.
2. `proto/apps/landing/index.html` — homepage with a dominant original visual and verified choreography.
3. `proto/apps/landing/services/index.html` — service-specific visual system and interaction.
4. `proto/apps/landing/pricing/index.html` — preserve every price/plan value; improve hierarchy, comparison, and genuine existing controls.
5. `proto/apps/landing/login/index.html` — accessible form, public brand/art relationship, working applicable states.
6. Highest-priority nonempty ranking page, deduplicated by path. In the reviewed report this is `proto/apps/admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/index.html` in P1.

Complete real implementation and QA of each selected page before expanding indiscriminately. Do not spend the entire initial turn generating plans and reference tables. If tools/turn limits prevent this full slice, ship fewer complete pages and clearly report the rest as partial.

### 4.2 Continue with three lanes

Then alternate manageable batches:

- **Public lane:** remaining landing pages, web public/auth/editorial/legal pages, admin login, and relevant unranked public variants.
- **Client lane:** highest-priority unfinished client pages/states from the report, then unranked siblings.
- **Admin lane:** highest-priority unfinished operator pages/states, then unranked siblings.

Within each lane, prioritize P0→P1→P2→P3→P4, skipping empty groups. Group shared parent/state pages and route variants together. Do not implement the same parent page five times for five screenshot rows.

After each lane batch, check the other lanes are progressing. Finish all public routes rather than repeatedly polishing only the homepage.

If the user explicitly selects strict ranking-first or a smaller scope, follow that instruction and document the scope change. Never silently shrink full scope to a few pages.

## 5. Phase R — real web research, with evidence

### 5.1 Research is a tool action, not a claim

Before visual implementation, actually search and fetch reference components. Do not say “inspired by Aceternity” based only on model memory.

Create `upgrade-v2/REFERENCE_RESEARCH.md`. For each reference record:

```text
ID:
Query and search result:
Exact component/demo URL:
Final URL after redirects:
Access date:
Status: DISCOVERED | FETCHED | VISUALLY_INSPECTED | BLOCKED
Evidence: available description/code and/or demo screenshot path
Pattern observed:
Applicability to static HTML:
License/source terms checked: result or UNKNOWN
Nestlancer adaptation:
Target page paths and selectors:
Application status: PLANNED | APPLIED | VERIFIED | DEFERRED
Verification evidence:
```

- Search snippets establish discovery only. They are not fetched source or visual inspection.
- A text fetch may omit dynamically rendered demos or code. Inspect the demo in a browser or use an accessible official source/example if available.
- Fetching a homepage does not prove that a particular component was studied.
- Record redirects, login/paywall/rate-limit failures honestly.
- Do not bypass access restrictions or copy paid templates/source without permission.
- “APPLIED” requires actual local code and the target selector; “VERIFIED” requires rendered/interaction evidence.

### 5.2 Original reference catalog — account for all sites

Make an initial availability/use table for **every site below**. Try opening or fetching each site once; do not claim success based on a link list. You do not need to use all libraries or copy all their patterns. Use the strongest relevant sources and explicitly mark others NOT_SELECTED/BLOCKED with a reason.

| Category | Site | URL | Study for |
|---|---|---|---|
| Code inspiration | CodePen | https://codepen.io | Concrete CSS/SVG motion and composition demos |
| Code inspiration | CodeMyUI | https://codemyui.com | Practical navigation, input, and button patterns |
| Code inspiration | Uiverse | https://uiverse.io | Small themed controls and states |
| Code inspiration | Bootsnipp | https://bootsnipp.com | Table/form composition; reject dated styling |
| Animation | Animate.css | https://animate.style | Entrance vocabulary and reduced-motion behavior |
| Animation | Animista | https://animista.net | Specific keyframes/easing, not wholesale inclusion |
| Animation | GSAP | https://gsap.com | Choreography, matchMedia, cleanup, timeline principles |
| Animation | Hover.css | https://ianlunn.github.io/Hover | Focus/hover/press details |
| Animation | AOS | https://michalsnik.github.io/aos | Scroll trigger/reveal lifecycle |
| Animation | LottieFiles | https://lottiefiles.com | Optional single licensed lightweight illustration |
| Animation | Magic Animations | https://minimamente.com/project/magic | Optional restrained one-shot transitions |
| Animation | Keyframes.app | https://keyframes.app | Keyframe timing tools/examples |
| Modern systems | Magic UI | https://magicui.design | Selected beam, border, bento, and CTA treatments |
| Modern systems | UI Layout | https://ui-layout.com | Layout/gallery/progressive disclosure patterns |
| Modern systems | shadcn/ui | https://ui.shadcn.com | Dialog, table, tab, form, and focus behavior |
| Modern systems | Aceternity UI | https://ui.aceternity.com | Public hero/background/timeline visual principles |
| Surface tools | CSS Gradient | https://cssgradient.io | Controlled brand gradient construction |
| Surface tools | Glassmorphism | https://glassmorphism.com | Selective chrome material and opaque fallback |
| Surface tools | Neumorphism | https://neumorphism.io | Optional subtle inset surfaces only |

### 5.3 Initial research gate

Before the first design edits:

- Run at least **six focused search queries** spanning UI elements, public composition/art, animation, and accessibility.
- Successfully fetch/read at least **five exact component/doc/demo pages** across at least **three sources**, including one motion source and one public-page source.
- Visually inspect at least **two actual reference demos** if a browser is available.
- Inspect current target HTML and corresponding Nestlancer screenshots.
- Write a compact Reference Contract with at least five applied-pattern intentions.

Suggested searches — execute them, do not paste them as proof:

```text
site:magicui.design/docs/components animated beam border beam
site:ui.aceternity.com/components background beams timeline spotlight
site:uiverse.io button input focus CSS
site:codepen.io SVG workflow path animation CSS
site:ui.shadcn.com/docs/components dialog data table accessibility
site:gsap.com/docs matchMedia prefers-reduced-motion
```

Suggested starting URLs — recheck during the actual run:

- https://magicui.design/docs/components/animated-beam
- https://magicui.design/docs/components/border-beam
- https://ui.aceternity.com/components/background-beams
- https://ui.aceternity.com/components/timeline
- https://ui.shadcn.com/docs/components/dialog
- https://ui.shadcn.com/docs/components/data-table
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://ianlunn.github.io/Hover/

These are research leads, not instructions to install the libraries or promises that their URLs/content will stay unchanged.

If a site fails, use another actual accessible component/demo and record the blocked site. Do not use “known patterns from that library” as fabricated inspection evidence. If web search/fetch is entirely unavailable, report `RESEARCH_BLOCKED` and ask whether to proceed with a clearly labeled offline implementation. Do not claim the research gate passed.

### 5.4 Reference Contract

Use a short file/table rather than endless chat:

| Reference ID | Exact pattern | Traits observed | Traits rejected | Nestlancer adaptation | Target HTML + selector | Test |
|---|---|---|---|---|---|---|
| R-... | ... | ... | ... | ... | ... | ... |

Include page composition, artwork relationship, a real control, an app component, and a motion pattern. At least three concrete reference adaptations should be visible on each major redesigned page; reuse a coherent researched system rather than forcing three unrelated effects onto legal/auth pages.

For later batches, reuse validated research and perform at least one focused new lookup when a new component/state needs it. Do not repeat the same research ritual for every route or let research consume implementation time.

## 6. Design direction — one identity, three densities

### 6.1 Brand and hierarchy

- Preserve the Nestlancer name, logo identity, teal family (`#0B7A71`), domain meaning, and existing content.
- Refine Geist Sans/Mono already present. Do not add arbitrary font dependencies; usable fallbacks are allowed and necessary offline.
- Public: expressive but credible studio/product delivery story.
- Client: calm progress, approvals, next action, financial trust.
- Admin: precise dense workbench, readable numbers, efficient controls.
- Do not spread marketing glass/beams/oversized type onto every operator table.
- No purple-indigo rebrand, neon glow everywhere, generic decorative pill clusters, fake accolades, or fabricated testimonials/logos/metrics.

### 6.2 Tokens and CSS discipline

Consolidate surface, type, spacing, radius, shadow, focus, and motion tokens. Prefer editing the relevant existing rules over appending another huge override layer.

- Keep light and dark readable where theme support exists.
- Scope public effects to public surface/family hooks. Do not rely solely on directory paths.
- Use near-opaque data panels; selective glass only where useful and with opaque fallback.
- Body copy at least 14px; public reading text preferably 16–18px; captions/badges at least 11px. Do not call long table cell content a “badge” to evade readability goals.
- Fluid display type via `clamp()`, sane line lengths, meaningful hierarchy and headings.
- One main h1 per page; logical h2/h3 structure based on actual content.
- Eliminate excessive one-off inline layout styles where they prevent responsiveness. Preserve inline business percentages/data until safely mapped to equivalent presentation.
- Never fix overflow by hiding required content or applying blanket `overflow-x:hidden` without addressing its source.

### 6.3 Shared changes do not replace page edits

Each public page and each page needing structural/interaction fixes must receive substantive HTML wiring/composition changes. Typical valid changes include:

- Purposeful hero/art relationship.
- New semantic section structure from existing content.
- Accessible control/label/trigger markup.
- Local illustration integration.
- Correct responsive layout wrappers.
- Working state panels and page-specific motion hooks.

Adding the same class to every page, changing a title, or adding a comment is not a meaningful HTML upgrade. Record protected pages explicitly; do not count inherited CSS as individual HTML implementation.

## 7. Public pages — mandatory artwork and page-specific craft

### 7.1 Core public page checklist

At minimum explicitly cover these existing routes; inventory may discover more:

**Landing family — all nine**

- `proto/apps/landing/index.html`
- `proto/apps/landing/about/index.html`
- `proto/apps/landing/services/index.html`
- `proto/apps/landing/pricing/index.html`
- `proto/apps/landing/contact/index.html`
- `proto/apps/landing/portfolio/index.html`
- `proto/apps/landing/portfolio/[id]/index.html`
- `proto/apps/landing/blog/index.html`
- `proto/apps/landing/blog/[slug]/index.html`

**Web/public/auth — include existing mapped and sibling variants**

- Web homepage, about, contact, portfolio listing/template/concrete case study, blog listing/template/concrete article, category/tag/bookmark routes where relevant.
- Login, register, forgot/reset password, verify-email/verify/verify-document, privacy, terms, work, share, and impersonate routes according to their actual purpose.
- `proto/apps/landing/admin-login/index.html`.

Do not assume every `web/` route is a public marketing page. Protect authentication/security intent on utility routes. A shared public style should not accidentally expose client-only content.

### 7.2 Artwork is an actual deliverable

Do not treat a blank gradient, basic cover rectangle with category text, icon row, or screenshot of the old UI as sufficient artwork.

Create at least **three distinct, coherent original visual assets/compositions** for the core public experience:

1. **Homepage hero:** branded delivery/project-system illustration, sculpted vector scene, or purposeful product/workflow visualization that earns the dominant first-viewport position.
2. **Services/process visual:** custom diagram/illustration communicating the existing service/process story, with progressive motion or usable interaction.
3. **Portfolio/case-study visual system:** meaningful representative covers/device/workflow illustrations suited to the existing projects, not identical colored rectangles.

Additional auth/supporting visuals may reuse this system where appropriate, but no single image should be blindly repeated on all public pages. Legal pages require excellent reading UX, not compulsory spectacle.

Preferred production routes:

- Hand-authored optimized SVG/CSS illustration: strongest offline/static choice; real composition with layers, negative space, consistent strokes/materials, and responsive viewBox.
- Available image generation tool: create an asset for the actual page, save locally, and use it in the HTML. Do not make image generation an excuse to halt implementation awaiting unnecessary style choices.
- Appropriately licensed assets: verify usage terms, download locally, record provenance. No hotlinks or assumption that search thumbnails are free to reuse.

For SVG art, distinguish decorative shapes from meaningful chart/data paths. Prevent the existing motion runtime's generic SVG chart detection from misclassifying artwork; use explicit artwork exclusion hooks or narrowly scoped chart opt-in selectors and test existing charts.

### 7.3 Asset delivery and integration

Store assets under `proto/shared/assets/art/` or another documented local subfolder of shared assets.

Create `upgrade-v2/ART_REGISTER.md`:

| Art ID | File/inline selector | Original/generated/licensed | Provenance/terms | Intended meaning | Pages using it | Mobile treatment | Alt/decorative treatment | Motion ID |
|---|---|---|---|---|---|---|---|---|

Requirements:

- Actually reference/render each delivered asset on the intended existing page.
- Useful informative art gets meaningful alternative text/description; decorative art uses empty alt or `aria-hidden="true"` and never hides business information inside pixels.
- Provide intrinsic dimensions/aspect ratio to avoid layout shifts.
- Prefer SVG for diagrams and optimized WebP/AVIF/PNG as appropriate for raster art.
- Target roughly <=500 KB per ordinary raster asset and <=150 KB per standalone vector when feasible. Log justified exceptions rather than destroying quality to meet a fake absolute limit.
- No enormous embedded base64 image repeated across dozens of files.
- No text baked into generated images when it must remain readable, editable, or localized.
- Do not imply generated artwork is a real customer screenshot, deployed system, team photograph, or evidence of client results. Label illustrative product scenes where needed.

### 7.4 Page-specific design jobs

| Family | Required composition/behavior | Appropriate motion/art |
|---|---|---|
| Homepage | Clear existing headline/support/CTA, dominant hero visual, product/process narrative, existing proof/work, strong closing action | Hero scene reveal, workflow trace, restrained section choreography |
| Services | Scan-friendly service grouping and existing delivery process | Illustrated process, interactive disclosure where content exists |
| Pricing | Exact current plan/price/feature semantics, clear comparison and CTA hierarchy | One-shot emphasis/selection response; no invented calculator or prices |
| About | Existing story/team/process content, credible identity | Studio/process art; no invented people or history |
| Contact | Clear labeled form, details/trust, explicit local submission behavior | Small supporting illustration, field focus/error states |
| Portfolio | Distinct useful project covers, readable existing titles/categories, real navigation | Restrained pointer/focus detail; touch equivalent |
| Case study | Clear existing problem/process/outcome hierarchy and media relationship | Existing progress/data only; illustrative visuals clearly identified |
| Blog listing | Editorial scanning, categories and metadata kept, working existing navigation | Small image/cover response; avoid effect-heavy reading |
| Article | Comfortable reading, headings, code/media, useful anchors if appropriate | Minimal section/image entrance; no animated body paragraphs |
| Auth/recovery | Focused accessible form and true existing workflow purpose | Quiet art/entrance; errors stay readable |
| Legal/verification | Reading or utility clarity, existing content unchanged | Minimal feedback; exempt from decorative signature spectacle |

## 8. Motion — implement, wire, and prove it

The repository already has `.reveal`, `.stagger`, `.anim-in`, `html.nl-motion`, `nl-still`, and `proto-motion.js`. Inspect how they actually work before extending them.

### 8.1 Motion register

Create `upgrade-v2/MOTION_REGISTER.csv`:

```text
motion_id,page_paths,selector,trigger,property,duration_ms,delay_ms,easing,repeat,mobile_behavior,reduced_motion_behavior,owner_file,status,evidence
```

Every major public marketing page requires:

- A visible, intentional first-viewport entrance sequence.
- At least one scroll-triggered section/art reveal if the page is long.
- Hover **and focus-visible** treatment on applicable interactive elements.
- A page-appropriate visual/interaction signature, not just another fade-up.

Auth/reading/legal/utility routes may use lighter motion or a documented no-signature exception. Operator pages need useful feedback, not a decorative loop quota.

### 8.2 Suggested timing palette

| Layer | Starting range | Rules |
|---|---|---|
| Hover/focus/press | 140–200 ms | Small transform or wash, no displaced layout |
| Menu/dialog/tab feedback | 180–280 ms | State changes must stay usable and keyboard-safe |
| Page/section reveal | 420–700 ms | Mostly opacity + 8–16px movement; don't delay essential text excessively |
| Stagger | 50–90 ms | Cap total above-fold delay around 600–700 ms |
| Hero art one-shot | 700–1600 ms | Optional scene stroke/layer progression; readable content arrives first |
| Ambient decorative movement | Slow, bounded | Not compulsory; pause/stop behavior if persistent movement requires it |

Use transform/opacity primarily. SVG stroke-dashoffset may be appropriate for a limited vector signature; measure expensive painting. Avoid animating layout geometry, giant blur fields, and backdrop-filter on scroll. No flashing or scroll hijacking. Never animate financial/business counters through fictitious values.

### 8.3 Runtime correctness

Verify and improve:

- Each page loads the correct local CSS and scripts with correct relative paths.
- Required public selectors are present and match CSS/runtime logic.
- The current pre-paint motion flag, readiness handling, reveal fallback, and cleanup remain safe.
- No duplicate animation on nested reveal blocks or fighting CSS/JS ownership.
- Dynamically opened panels/dialogs get usable initial/final states.
- Browser back/forward cache restore does not leave content invisible.
- No-JS and runtime-error fallback renders all essential content.
- Reduced motion disables translate/scale/path choreography and continuous loops; essential content is instantly present. CSS and JS both respect it.
- Preference changes during the session are handled where supported, not only checked on first load.
- Intersection observers use the actual scroller if the app shell scrolls independently of the window.
- Decorative offscreen/page-hidden effects pause; event listeners/observers are not needlessly duplicated.
- Cleanup does not remove a signature before it can be seen, freeze an invisible state, or leave transform-induced stacking bugs.

If using GSAP or Lottie, justify why native CSS/runtime cannot reasonably handle the requirement, verify licensing, keep a local approved dependency, provide an offline/static fallback, and account for payload. Do not add random CDNs.

### 8.4 Motion evidence, not just static screenshots

Static screenshots show layout, **not proof that animation runs**.

For homepage, services, pricing, at least one auth page, and a representative admin/client page:

1. Load a fresh page with normal motion preference.
2. Observe/capture the early and settled states, or record a short browser video/trace if supported.
3. Scroll to an offscreen reveal and verify its trigger.
4. Hover, focus, press, and open applicable interactive states.
5. Record active animations/transition changes at a suitable time, using browser tooling or `getAnimations()` where supported; do not rely on querying after animations have already finished.
6. Repeat reduced-motion checks and confirm immediate visibility/no loop.
7. Record what was observed, selectors, and evidence paths. If no browser exists, mark motion `UNVERIFIED`, not working by assertion.

Do not slow down the shipped UI merely to make a screenshot catch an animation. Use separate test capture timing or a test-only setting.

## 9. Admin/client craft and state implementation

### Admin

- Preserve operational density and clear primary action.
- Strong page header, functional filters/tabs, readable money and statuses.
- Tables with semantic headers, contained mobile scrolling or faithful card presentation, useful row actions, and sticky header only where it works with the scroll container.
- Distinct detail metadata and activity; no glass beneath small financial numerals.
- Real accessible dialog/menu/editor states for the mapped parent screenshots.

### Client

- Make “what is happening / what needs me / what next” obvious from existing data.
- Calm milestone/progress presentation, approval/file/payment actions, readable messages.
- Touch-accessible controls and no operator-level visual noise.
- Cover dashboard panels, global search, file preview/menu, payment/project/quote states in the state ledger.

### Missing/template/parent states

- Open the screenshot and compare the mapped page first.
- If multiple states belong to one HTML page, implement accessible in-page states with deterministic triggers or hash/query deep links where useful. Preserve the base URL.
- A dedicated state file is optional only when it improves testing/navigation and does not replace existing routes.
- Retain the actual values attached to that state. Do not rewrite template data to match a different record without understanding the mismatch and documenting provenance.
- If correct screenshot data is genuinely unavailable, report the affected state blocked rather than invent names, amounts, records, or status transitions.

## 10. Preserve content; make controls honestly useful

### KEEP

Preserve all business data, existing records, prices/amounts, identifiers, dates, counts, statuses, labels with domain meaning, form defaults, document/legal text, and route identity. Preserve accessibility already correct and theme behavior.

### Permitted changes

Semantic markup, layout, presentation ordering, responsive wrappers, new accessibility descriptions, decorative art, interface-only helper text, headings grounded in existing content, and prototype interaction wiring.

New descriptive/helper copy must not invent business claims. Record material interface-copy additions separately. Preserve all original domain content unless the user explicitly requests a correction.

### Interaction contract

- Real links navigate to existing local destinations.
- Buttons perform a meaningful local prototype action or are clearly disabled with explanation. No success-looking dead buttons.
- Forms have labels, required/error states, correct input types/autocomplete as appropriate, and honest local-demo messaging if no backend is connected.
- Never say a payment, email, account creation, document verification, or file upload succeeded in production when it only changed a prototype state.
- Do not send submitted credentials/files to live endpoints.
- Menus/dialogs: keyboard activation, accessible name, Escape, focus management, and return focus. Prefer native `<dialog>` where suitable; test it rather than assuming accessibility.
- Tabs: state/ARIA coherence and keyboard behavior if they are actual tabs. Anchor section navigation should not be falsely labeled as tab UI.
- Mobile nav must remain operable; essential actions cannot exist only on hover.
- Apply loading/empty/error states where relevant; not every decorative element needs every state.
- Search/filter only actual local data unless clearly labeled as a limited demo.

## 11. QA — rendered evidence and regression prevention

### 11.1 Serve the actual prototype

Use a local static server for browser QA. On Arena, start long-lived servers through the environment's process tool, bind `0.0.0.0`, and accept the proxied preview host/origin. Browser-facing requests must not use localhost to reach a sandbox backend.

Serve the repository or `proto/` consistently and document the URL-to-file mapping. A single workspace HTML preview may not load sibling CSS/scripts or network fonts; a static server is the appropriate full-site test. Provide local assets/fallback fonts so downloadable output remains usable without external network access.

Browser automation packages can be installed if allowed; keep package/browser caches out of deliverables. If no browser is available and installation is blocked, perform static checks but clearly retain `IMPLEMENTED_UNVERIFIED` and list the browser tests still required. Do not self-certify visual A+.

### 11.2 Baseline and after screenshots

Capture baseline before edits for the initial slice and representative shared-component pages, then capture after at the same viewport/theme/state. Avoid duplicating every original screenshot into evidence.

- Every implemented page: viewport checks at **390px and 1440px**.
- Public compositions/shared shells: also sample **768px** and **1920px**, plus a narrow **320px** stress check where practical.
- Every page with theme support: review light and dark; automate both where feasible.
- Every screenshot-defined state: test its actual trigger/deep link and record evidence.
- Review the full page, not just its first viewport.

Use compressed selective screenshots and an index. Page-by-page screenshots can be produced in batches; do not imply a sampled shared regression pass verified every state.

### 11.3 Automated checks

Implement/run read-only validation scripts against the changed prototype and, for shared changes, regression checks across all pages:

- Parse HTML; check local `src`, stylesheet, script, and `href` targets and fragment IDs.
- Treat `[id]` paths as literal prototype directories, not shell globs.
- Check missing assets, browser console errors, failed local network requests, duplicate IDs, headings, input labels, and button semantics.
- At each tested width assert document scroll width <= viewport width + a small rounding tolerance, and inspect clipped content inside containers.
- Check rendered type sizes for applicable body/caption roles.
- Inspect no-JS visibility and reduced-motion visibility.
- Inspect interactions and aria/focus state transitions.
- Run an accessibility checker if available, plus manual contrast, keyboard, focus, alt text, and reading-order checks. Report tool limitations; an automated pass is not full WCAG certification.
- Compare extracted business facts before/after. Allow documented structural/whitespace/accessibility-only differences, not silent content deletion.
- Scan for new placeholder/undefined/NaN strings; distinguish legitimate code/comments from rendered defects.

Do not send credentials, private data, or full project content to online graders just to meet a tool quota. W3C/PageSpeed-style tools are supplementary, not a substitute for local visual/functional tests. Do not report “official” grades from tools that were never run.

### 11.4 Visual critique and fix loop

For each page/family:

1. Render it and inspect at desktop/mobile.
2. Compare with its original structure/content requirements and selected reference traits.
3. Note concrete defects: composition, alignment, content density, art relationship, contrast, broken state, overflow, dead motion.
4. Fix defects in actual HTML/CSS/JS.
5. Re-render and recheck affected siblings.

Budget up to three focused iterations before documenting unresolved work, not before falsely calling it complete.

A+ is the **design aspiration** using the existing rubric. If you provide a score, label it “internal subjective rubric score,” supply per-dimension reasoning and hard-cap findings, and separate it from measured QA. Never write “verified A+” solely because you expect it to look good.

## 12. Persistent deliverables and progress protocol

Keep these compact files under `upgrade-v2/`:

| File | Purpose |
|---|---|
| `IMPLEMENTATION_PLAN.md` | Compact decisions, selected scope, exact work queue; not the final product |
| `PAGE_COVERAGE.csv` | Every original HTML and implementation/QA status |
| `STATE_COVERAGE.csv` | Every screenshot/state mapping and trigger/status |
| `REFERENCE_RESEARCH.md` | Actual research evidence and applied selectors |
| `ART_REGISTER.md` | Integrated assets, provenance, accessibility, mobile treatment |
| `MOTION_REGISTER.csv` | Page-specific motion wiring and evidence |
| `data-baseline.json` | Original protected business facts; no secrets |
| `DATA_PRESERVATION_REPORT.md` | Before/after comparison, intentional interface additions, unresolved differences |
| `QA_REPORT.md` | Tool status, tested pages/states, failures/fixes, verification gaps |
| `PROGRESS.md` | Durable current position and exact next batch |
| `DELIVERY_MANIFEST.csv` | Real new/changed deliverable paths, sizes, hashes |
| `evidence/` | Selective optimized screenshots/videos/traces used as proof |

Do not update historical ranking reports to make your result look better. Add new evaluation/progress separately.

### After each batch

1. Save actual application edits under the persisted repository root.
2. Run focused QA and shared regression checks where needed.
3. Update page/state/reference/art/motion registers.
4. Record count by status and by surface, HTML-changed count, shared-only count, and blocked state count.
5. Record changed paths and outstanding failures.
6. Name the next exact page paths and states.

If interrupted, stop with a useful implementation slice and explicit `PARTIAL` status. Never replace remaining pages with a plan and call the whole upgrade done. A model's context/turn limit is a reason to checkpoint, not silently remove scope.

### Start-of-run response

Keep it short:

- Repository/root and current scope.
- Existing reports located; old prompts will not be rerun.
- Refreshed counts and empty batches skipped.
- Tool availability and real blockers.
- First exact implementation slice and research actions.

Then perform tool actions and implementation. Do not merely print this checklist and end.

## 13. Hard completion gates

A **full completion** claim requires all applicable gates:

### Coverage

- [ ] All original HTML files inventoried; no silent omission of unranked/template/concrete routes.
- [ ] All screenshot/state rows retained and reviewed.
- [ ] Every page has a justified final status; zero NOT_STARTED/IN_PROGRESS/IMPLEMENTED_UNVERIFIED/BLOCKED pages in claimed completed scope.
- [ ] Every state in claimed completed scope is verified or explicitly outside an approved narrower scope.
- [ ] All nine landing HTML pages and mapped/sibling public/auth pages have actual page-level implementation or narrowly justified verified protection.
- [ ] Major public page HTML has substantive composition/art/interaction wiring, not comment/class-only edits.

### Research

- [ ] Original reference sites have honest availability/use statuses.
- [ ] Initial research gate passed with actual successful component/doc fetches.
- [ ] Applied references map to actual local files/selectors and observed output.
- [ ] No fabricated fetches, demo inspections, screenshots, or third-party scores.

### Artwork and motion

- [ ] At least three distinct original/licensed visual compositions integrated into the core public experience.
- [ ] Assets are local, optimized, accessible, and provenance recorded.
- [ ] Homepage/services/pricing and other major public pages have appropriate verified motion and interaction, not dead keyframes.
- [ ] Reduced motion, no-JS/error fallback, mobile, and SVG art/chart isolation tested.
- [ ] Utility/reading exceptions are deliberate and documented rather than forgotten.

### Data, accessibility, and functionality

- [ ] Protected business values compared before/after; no unexplained removals/changes.
- [ ] Existing routes/assets resolve; no new console/runtime failures.
- [ ] Applicable controls work honestly in the local prototype.
- [ ] No document-level horizontal overflow at tested mobile widths; no hidden required content.
- [ ] Keyboard/focus, labels, contrast, and supported themes reviewed.
- [ ] Browser QA evidence identifies what was tested; untested work is not called verified.

### Delivery

- [ ] Changed HTML/CSS/JS/art physically exist in the persisted workspace.
- [ ] Manifest includes actual changed application files, not only reports.
- [ ] No parallel showcase/app substitutes for existing `proto/` routes.
- [ ] Workspace size is reasonable and excluded cache/dependency folders are not claimed as deliverables.
- [ ] No production login/API/publish/push performed without authorization.

If any required gate fails, use **PARTIAL** or **BLOCKED**, specify affected paths/states, and provide the next actions. Useful partial output is acceptable; a misleading full-completion claim is not.

## 14. Final response format

```text
STATUS: COMPLETE / PARTIAL / BLOCKED
Scope requested:
Scope delivered:
Workspace/repository root:

Coverage:
- Original HTML total:
- Substantively edited HTML:
- Shared-only improved:
- Verified protected/no-change:
- Implemented but unverified:
- Not started / blocked:
- Screenshot states verified / total:
- Counts by public / client / admin:

Implementation highlights:
- Public page composition + art:
- Motion observed and tested:
- Admin/client state and responsive fixes:

Research evidence:
- Actual components inspected:
- Files/selectors where applied:
- Blocked/unselected sources:

QA and preservation:
- Browser/viewports/themes/states tested:
- Data comparison result:
- Remaining failures and limits:

DELIVERY CHECK:
- Actual changed HTML/CSS/JS/art paths:
- Manifest path:
- Progress ledger path:
- Approximate workspace size:
- Preview/run instructions:

NEXT BATCH (if partial):
- Exact unfinished paths/states:
- Immediate implementation actions:
```

Present the main deliverable/preview using the environment's file or preview tool when available. Optionally produce a lean ZIP of the changed prototype/evidence if requested or useful and size permits; a ZIP is not necessary if the files are already delivered. Do not invent platform download links. Do not claim a commit/PR exists unless you actually created it with authorization.

## 15. Begin authorized implementation

Once the user authorizes execution:

1. Locate the existing checkout, record initial status, confirm reports, and refresh inventories.
2. Preserve baseline data and file hashes.
3. Perform real web research and record the compact Reference Contract.
4. Implement the shared foundations **and actual public launch HTML slice**; do not stop with a plan.
5. Create/integrate artwork and wire visible motion to existing pages.
6. Render, test, critique, fix, and record evidence.
7. Continue balanced public/client/admin lanes, skipping empty ranking groups.
8. Persist progress after each batch and deliver actual changed files.
9. Claim full completion only when the coverage and evidence gates pass.

# IMPLEMENTATION PROMPT — END

---

## Resume instruction for later turns

Use this if the execution run stops before full scope is finished:

> Continue executing `ai-prompt-v2.md` from the existing repository. Read `upgrade-v2/PROGRESS.md`, `PAGE_COVERAGE.csv`, and `STATE_COVERAGE.csv`. Preserve existing completed work and user edits. Do not rerun prompts v1/1.1, regenerate the entire plan, or repeat all research. Revalidate reused references only if needed. Implement the next exact unfinished paths/states in the balanced work queue, including pending public artwork/motion. Update evidence and report COMPLETE only when all gates for the requested scope pass; otherwise report PARTIAL with the next exact batch.

## Prompt preparation research note

During preparation, the reviewer performed limited read-only web research to improve the research instructions; this was **not** execution of the upgrade prompt. The search surfaced Magic UI's component-level Border Beam reference [1](https://magicui.design/docs/components/border-beam) and Aceternity's component catalog [1](https://ui.aceternity.com/components). The shadcn Dialog documentation and GSAP matchMedia documentation were fetched. No claim is made that every catalog website above was validated, every demo was visually inspected, or any pattern was implemented in the application. The future implementation agent must perform and record its own actual research gate.
