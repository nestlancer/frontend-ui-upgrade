#!/usr/bin/env python3
"""UPGRADE V3 · the two pages a generic pass cannot reach.

Both are exceptions, so they are scripted here rather than hand-edited, to keep
"re-run the whole upgrade" honest:

  proto/apps/admin/index.html
      A `location.replace` stub, not a page. The app recomposer deliberately skips
      any <main> that carries an inline script (rewriting around one is how you
      break a redirect), which left the stub on the v2 look. Here it gets the v3
      gate card: what this entry point is, where it goes, and the two facts that
      decide whether you belong here — while the redirect script stays untouched.

  proto/apps/landing/contact-alt/index.html
      Its own review note was that the composition had already been rebuilt once,
      so v3 only re-layers it; the topic <select> → radio group is the one change
      worth making by hand. See implement-v3-pub.py::topic_radios.
"""
from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.join(os.path.dirname(HERE), "proto")
sys.path.insert(0, HERE)
import nlhtml  # noqa: E402

GATE = '''<main class="nl-gate" id="main" tabindex="-1">
<div class="nl-gate-card">
<p class="nl-gate-kicker"><svg aria-hidden="true" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24" width="14"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> Operator console</p>
<h1 class="nl-gate-title">Opening the command center</h1>
<p class="nl-gate-sub">This entry point only forwards signed-in operators to the console dashboard. If you were not sent here, use the operator sign-in instead.</p>
<div class="nl-gate-prog" role="img" aria-label="Redirect in progress"></div>
<div class="nl-gate-actions">
<a class="nl-gate-btn" href="./dashboard/index.html">Continue to dashboard <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24" width="14"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
<a class="nl-gate-link" href="../landing/admin-login/index.html">Operator sign-in</a>
</div>
<dl class="nl-gate-facts">
<div><dt>Console</dt><dd>admin · 101 pages</dd></div>
<div><dt>Requires</dt><dd>ADMIN role · MFA when enrolled</dd></div>
<div><dt>Prototype</dt><dd>local files · no request sent</dd></div>
</dl>
</div>
<script>location.replace("./dashboard/index.html");</script>
</main>'''


def admin_gate() -> bool:
    path = os.path.join(PROTO, "apps/admin/index.html")
    text = open(path, encoding="utf-8").read()
    if "nl-gate-card" in text:
        return False
    head = text.find('<main id="main"')
    tail = text.find("</main>", head)
    if head < 0 or tail < 0:
        print("  ! admin/index.html: no main to replace")
        return False
    out = text[:head] + GATE + text[tail + len("</main>"):]
    out = out.replace('<link rel="stylesheet" href="../../shared/assets/proto.css">',
                      '<link rel="stylesheet" href="../../shared/assets/proto.css">\n'
                      '<link rel="stylesheet" href="../../shared/assets/nl-v3.css">\n'
                      '<link rel="stylesheet" href="../../shared/assets/nl-v3-pub.css">')
    out = out.replace('class="upgrade-v2" data-page="redirect"', 'class="upgrade-v3 nl-v3" data-page="redirect"')
    if 'data-surface="redirect"' not in out:
        print("  ! admin/index.html: surface attr missing, wrote anyway")
    open(path, "w", encoding="utf-8").write(out)
    assert nlhtml.roundtrip(path), "admin/index.html no longer round-trips"
    print("  wrote proto/apps/admin/index.html (v3 gate card, redirect untouched)")
    return True


# Two pairs of landing pages carried the same <title>, which the review flagged as
# P3 (§4.3): `contact` and `contact-alt` both claimed "Contact", and the case-study
# template `portfolio/[id]` was titled identically to the real page it renders.
# The variant takes the more specific title; the canonical route keeps its own.
TITLES = {
    "apps/landing/contact-alt/index.html": "Talk to the studio \u00b7 Nestlancer",
    "apps/landing/portfolio/[id]/index.html": "Case study \u00b7 Fintech Payments Hub \u00b7 Nestlancer",
}


def title_collisions() -> int:
    import re
    n = 0
    for rel, want in TITLES.items():
        path = os.path.join(PROTO, rel)
        text = open(path, encoding="utf-8").read()
        m = re.search(r"<title>([^<]*)</title>", text)
        if m is None or m.group(1).strip() == want:
            continue
        out = text[: m.start(1)] + want + text[m.end(1) :]
        open(path, "w", encoding="utf-8").write(out)
        print(f"  {rel}: <title> \u2192 {want!r}")
        n += 1
    return n


def main() -> None:
    n = 0
    n += admin_gate()
    n += title_collisions()
    print(f"hand-edits applied: {n}")


if __name__ == "__main__":
    main()
