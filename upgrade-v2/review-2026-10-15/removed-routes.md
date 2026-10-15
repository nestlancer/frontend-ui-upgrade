# Removed routes ledger — 25 files deleted after the v2.1 run

All 25 routes exist and render in the pre-upgrade tree `5066dcad`, and none of them is referenced by any current page (the prototype passes its link check). Sizes/text come from the pre-upgrade file. “Distinctive tokens” counts ₹ amounts, `NL-…` identifiers, `sh_…` tokens and similar strings; “not found now” counts how many of those appear nowhere in the current tree.

| # | Removed route (`proto/apps/…`) | Size | Text | Distinctive tokens | Not found now | Replaced by / equivalent content | Visual change vs the removed page | Content carried over | Baseline blob |
|---:|---|---:|---:|---:|---:|---|---:|---|---|
| 1 | `apps/admin/login` | 10,757 B / 168 lines | 1,607 chars | 2 | 0 | `apps/landing/admin-login` | 19.9% | 20/21 sentences kept, 4 new | `d76d94f8406d` |
| 2 | `apps/web/about` | 12,335 B / 75 lines | 1,211 chars | 4 | 1 | `apps/landing/about` (pre-existing landing page, same copy) | — | — | `a14cafd22a3d` |
| 3 | `apps/web/blog/[slug]` | 19,535 B / 184 lines | 5,603 chars | 9 | 2 | `apps/landing/blog/[slug]` (pre-existing) | — | — | `a6cf86862dec` |
| 4 | `apps/web/blog/bookmarks` | 11,669 B / 93 lines | 1,068 chars | 7 | 3 | **nothing** — feature gone (nav link removed from 21 pages) | — | — | `d0d15e1b4d2a` |
| 5 | `apps/web/blog/category/[slug]` | 16,089 B / 154 lines | 1,734 chars | 14 | 10 | category cards on `apps/landing/blog` | — | — | `4119ac701d3c` |
| 6 | `apps/web/blog/cutting-deploy-time-from-45-minutes-to-five` | 19,535 B / 184 lines | 5,603 chars | 9 | 2 | `apps/landing/blog/[slug]` (pre-existing) | — | — | `a6cf86862dec` |
| 7 | `apps/web/blog` | 18,756 B / 182 lines | 2,379 chars | 16 | 11 | `apps/landing/blog` (pre-existing) | — | — | `a571abac0ad3` |
| 8 | `apps/web/blog/tag/[slug]` | 14,316 B / 129 lines | 1,431 chars | 10 | 6 | tag chips on `apps/landing/blog` | — | — | `15e2844e7ad2` |
| 9 | `apps/web/contact` | 11,903 B / 97 lines | 1,175 chars | 6 | 1 | `apps/landing/contact-alt` | 12.96% | 8/9 sentences kept, 3 new | `35f0786d3880` |
| 10 | `apps/web/forgot-password` | 11,286 B / 91 lines | 1,240 chars | 4 | 0 | `apps/landing/forgot-password` | 15.57% | 10/12 sentences kept, 6 new | `0e9f6154f2e4` |
| 11 | `apps/web/impersonate` | 11,313 B / 79 lines | 1,186 chars | 6 | 2 | **nothing** — screen gone; `admin/users/[id]` keeps a disabled Impersonate button | — | — | `e7f8587559b1` |
| 12 | `apps/web` | 14,957 B / 102 lines | 1,697 chars | 5 | 2 | headline only — inside the auth pages side panel | — | — | `baeddf3c661e` |
| 13 | `apps/web/login` | 11,632 B / 99 lines | 1,294 chars | 4 | 0 | `apps/landing/login` | 16.39% | 12/13 sentences kept, 3 new | `2a526949b7ac` |
| 14 | `apps/web/portfolio/[id]` | 13,463 B / 109 lines | 2,023 chars | 8 | 1 | `apps/landing/portfolio/[id]` (pre-existing) | — | — | `0d65d5b288ab` |
| 15 | `apps/web/portfolio/fintech-payments-hub` | 13,463 B / 109 lines | 2,023 chars | 8 | 1 | `apps/landing/portfolio/fintech-payments-hub` | 41.2% | 15/19 sentences kept, 10 new | `0d65d5b288ab` |
| 16 | `apps/web/portfolio` | 17,893 B / 201 lines | 2,546 chars | 15 | 1 | `apps/landing/portfolio` (pre-existing) | — | — | `12921f8f389a` |
| 17 | `apps/web/privacy` | 13,598 B / 104 lines | 3,016 chars | 6 | 1 | `apps/landing/privacy` | 5.98% | 28/29 sentences kept, 1 new | `ca3f5fa5e87b` |
| 18 | `apps/web/register` | 12,894 B / 100 lines | 1,344 chars | 4 | 0 | `apps/landing/register` | 16.27% | 11/13 sentences kept, 6 new | `b5c437fec38e` |
| 19 | `apps/web/reset-password` | 12,281 B / 93 lines | 1,280 chars | 3 | 0 | `apps/landing/reset-password` | 16.53% | 11/12 sentences kept, 5 new | `2d4e30c7a708` |
| 20 | `apps/web/share/[token]` | 12,663 B / 83 lines | 1,366 chars | 14 | 9 | **nothing** — token snapshot not reproduced | — | — | `51ef15cef1ee` |
| 21 | `apps/web/terms` | 14,216 B / 103 lines | 3,293 chars | 6 | 1 | `apps/landing/terms` | 6.65% | 26/31 sentences kept, 5 new | `65cdf6d39052` |
| 22 | `apps/web/verify-document` | 13,865 B / 98 lines | 1,656 chars | 10 | 1 | `apps/landing/verify-document` | 9.49% | 14/15 sentences kept, 5 new | `d6193591eff6` |
| 23 | `apps/web/verify-email` | 11,725 B / 92 lines | 1,230 chars | 3 | 0 | `apps/landing/verify-email` | 17.38% | 12/13 sentences kept, 4 new | `ab4a3fd7b53c` |
| 24 | `apps/web/verify` | 11,078 B / 75 lines | 876 chars | 4 | 1 | `apps/landing/verify` | 9.97% | 6/8 sentences kept, 4 new | `8ae802d1ae4d` |
| 25 | `apps/web/work` | 15,993 B / 136 lines | 1,938 chars | 14 | 8 | project cards on `apps/landing/portfolio` | — | — | `9e267b6102e1` |

Numbers for the 12 replacements come from rendered page pairs; the “carried over” counts come from sentence-level text comparison (`raw/successor_content.json`).
