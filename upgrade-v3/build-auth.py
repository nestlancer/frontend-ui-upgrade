#!/usr/bin/env python3
"""UPGRADE V3 · auth family builder.

The eight sign-in / account pages were rated A in the v2 pass, but the review note
from the client was blunt: the auth design itself is not liked. So instead of
polishing the v2 "auth-split + rail" composition, this builder re-composes every
page in that family from its own copy and form fields onto the v3 auth layer
(proto/shared/assets/nl-v3-pub.css, section 6-8).

Composition, per page: a dark "signal panel" carrying the brand, one editorial
headline, the facts that make this surface different, the artwork and a live
status line; and a "ledger" card carrying the step rail, the form, honest demo
affordances and the boundary notes. Nothing is invented: every string comes from
the page that already exists, and every JS hook (public-flow.js, studio.js,
ui.js, nl-v3.js) is one the repo already ships.

Run:  python3 upgrade-v3/build-auth.py            # write the 8 pages
      python3 upgrade-v3/build-auth.py --check     # report only
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROTO = os.path.join(ROOT, "proto")
ASSET = "../../../shared/assets"

# Intrinsic sizes of the shared illustrations, so the reserved box matches the
# file (a wrong ratio here shows up as a reflow the instant the image decodes).
ART_SIZE = {
    "account-access.svg": (760, 520), "delivery-process.svg": (960, 290),
    "delivery-system.svg": (760, 660), "deployment-pipeline.svg": (960, 440),
    "editorial-journal.svg": (760, 520), "operator-console.svg": (760, 520),
    "payment-flow.svg": (960, 300), "shared-quote.svg": (760, 520),
    "studio-collaboration.svg": (760, 520), "studio-correspondence.svg": (760, 520),
    "verification-seal.svg": (760, 520), "work-analytics.svg": (640, 420),
    "work-commerce.svg": (640, 420), "work-mobile.svg": (640, 420),
    "work-workspace.svg": (640, 420),
}

# --------------------------------------------------------------------- icons
STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"'


def icon(name: str, size: int = 15) -> str:
    body = {
        "mail": '<rect height="16" rx="2" width="20" x="2" y="4"></rect><path d="m22 7-10 6L2 7"></path>',
        "lock": '<rect height="11" rx="2" width="18" x="3" y="11"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
        "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
        "shield": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>',
        "key": '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3 3-3m-6 0L18 5"></path>',
        "check": '<path d="m5 12 5 5L20 7"></path>',
        "arrow": '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
        "doc": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8M8 17h5"></path>',
        "hash": '<path d="M4 9h16M4 15h16M10 3 8 21"></path>',
        "bolt": '<path d="M13 2 3 14h8l-1 8 10-12h-8z"></path>',
        "alert": '<path d="M12 9v4m0 4h.01"></path><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"></path>',
        "clock": '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
        "sun": '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"></path>',
        "grid": '<rect height="7" rx="1.5" width="7" x="3" y="3"></rect><rect height="7" rx="1.5" width="7" x="14" y="3"></rect><rect height="7" rx="1.5" width="7" x="14" y="14"></rect><rect height="7" rx="1.5" width="7" x="3" y="14"></rect>',
        "globe": '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
        "app": '<rect height="18" rx="2" width="18" x="3" y="3"></rect><path d="M3 9h18M9 21V9"></path>',
        "term": '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line>',
        "quote": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M14 8H8M16 12H8M13 16H8"></path>',
        "card": '<rect height="14" rx="2" width="20" x="2" y="5"></rect><path d="M2 10h20"></path>',
        "login": '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line>',
    }[name]
    return f'<svg aria-hidden="true" height="{size}" viewBox="0 0 24 24" width="{size}" {STROKE}>{body}</svg>'


BRAND_MARK = (
    '<svg aria-hidden="true" height="22" viewBox="0 0 32 32" width="22">'
    '<path d="M4 13.5C10 10.5 16 10.5 28 6c-1.5 4.5-4.5 8.5-9 10-3.5 1.2-8.5.8-15-2.5Z" fill="#0B7A71"></path>'
    '<path d="M4 20c6-3 12-3 24-7.5-1.5 4.5-4.5 8.5-9 10-3.5 1.2-8.5.5-15-2.5Z" fill="#32998C" opacity=".85"></path>'
    '<path d="M4 26.5c6-3 12-3 24-6.5-1 3.5-4 6.5-8 7.8-3.8 1.1-9-.2-16-1.3Z" fill="#86D0C6" opacity=".8"></path></svg>'
)

# Bespoke, page-specific seal. Each page passes a `seal` word list; the ring is
# drawn from three arcs plus tick marks so it reads as an instrument, not a logo.
def seal(items: list[str]) -> str:
    ticks = "".join(
        f'<line x1="60" y1="8" x2="60" y2="{14 if i % 3 else 18}" transform="rotate({i * 30} 60 60)"></line>'
        for i in range(12)
    )
    words = " · ".join(items).upper()
    return (
        '<svg aria-hidden="true" viewBox="0 0 120 120" width="120" height="120" fill="none" '
        'stroke="currentColor" stroke-width="1" opacity=".9">'
        f'<g class="nl-seal-rot" stroke="rgba(127,232,218,.55)">{ticks}'
        '<circle cx="60" cy="60" r="52" stroke-dasharray="3 7"></circle></g>'
        '<circle cx="60" cy="60" r="40" stroke="rgba(127,232,218,.35)"></circle>'
        '<path d="M44 61.5 54 71l23-27" stroke="#7FE8DA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>'
        f'<text x="60" y="106" text-anchor="middle" fill="rgba(230,242,238,.5)" stroke="none" '
        f'font-family="ui-monospace, monospace" font-size="7.5" letter-spacing="1.6">{words}</text></svg>'
    )


# ------------------------------------------------------------------ fragments
def field(label: str, *, inp: str, hint: str = "", link: str = "", lead: str = "mail") -> str:
    lk = f'<span class="nl-auth-lk">{link}</span>' if link else ""
    hp = f'<p class="nl-auth-help">{hint}</p>' if hint else ""
    return (
        f'<div class="nl-auth-field"><label class="nl-auth-lab" for="{_id(inp)}">{label}{lk}</label>'
        f'<div class="nl-auth-inwrap" data-lead="true"><span class="nl-auth-ico">{icon(lead)}</span>{inp}</div>{hp}</div>'
    )


def _id(inp: str) -> str:
    i = inp.find('id="')
    return inp[i + 4:inp.find('"', i + 4)]


def password_field(label: str, *, inp: str, link: str = "", hint: str = "") -> str:
    pid = _id(inp)
    return (
        f'<div class="nl-auth-field"><label class="nl-auth-lab" for="{pid}">{label}'
        f'<span class="nl-auth-lk">{link or "required *"}</span></label>'
        f'<div class="nl-auth-inwrap" data-lead="true"><span class="nl-auth-ico">{icon("lock")}</span>{inp}'
        f'<button class="nl-auth-peek" type="button" data-flow-reveal="" disabled="" aria-controls="{pid}" '
        f'aria-pressed="false" aria-label="Show password">Show</button></div>'
        f'<p class="nl-auth-help">{hint or "Typed locally — this prototype never reads or transmits a credential."}</p></div>'
    )


def meter(reqs: list[tuple[str, str]]) -> str:
    li = "".join(f'<li data-nl-req="{k}">{t}</li>' for k, t in reqs)
    return (
        '<div class="nl-auth-meter" data-nl-meter data-score="0">'
        '<div class="nl-auth-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
        '<p class="nl-auth-meter-t"><span>Password strength</span><span data-nl-meter-score>Awaiting input</span></p>'
        f'<ul class="nl-auth-reqs" role="list">{li}</ul></div>'
    )


def otp(prefix: str, digits: list[str], note: str) -> str:
    cells = ""
    for i, d in enumerate(digits, start=1):
        val = f' value="{d}"' if d else ""
        ac = ' autocomplete="one-time-code"' if i == 1 else ' autocomplete="off"'
        cells += (
            f'<input aria-label="Verification code digit {i} of 6" class="nl-auth-in" inputmode="numeric" '
            f'maxlength="1" pattern="[0-9]" placeholder="·" required="" type="text"{ac}{val}/>'
        )
    return (
        f'<fieldset class="nl-auth-field"><legend class="nl-auth-lab">Verification code'
        f'<span class="nl-auth-lk">six digits</span></legend>'
        f'<div class="nl-auth-codes" data-otp="" id="{prefix}-codes" role="group" '
        f'aria-labelledby="{prefix}-codes-lab"><span class="nl-sr" id="{prefix}-codes-lab">{note}</span>{cells}</div>'
        f'<p class="nl-auth-help">{note}</p></fieldset>'
    )


def demo_box(rows: list[tuple[str, str]], note: str, *, cta: str = "Fill sample values") -> str:
    dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in rows)
    return (
        '<div class="nl-auth-demo"><p class="nl-auth-demo-t">Prototype fixtures</p>'
        f'<dl>{dl}</dl>'
        f'<button class="nl-auth-demo-btn" type="button" data-nl-demo-fill="">{icon("bolt")} {cta}</button>'
        f'<p class="nl-auth-help">{note}</p></div>'
    )


def steps(items: list[str], current: int, done: list[int] = ()) -> str:
    out = ""
    for i, t in enumerate(items, start=1):
        cur = ' aria-current="step"' if i == current else ""
        dn = " is-done" if i in done else ""
        out += (f'<li class="nl-auth-step{dn}"{cur}><span class="nl-as-n">{i:02d}</span>'
                f'<span class="nl-as-t">{t}</span></li>')
    return f'<ol class="nl-auth-steps" role="list">{out}</ol>'


def flow(items: list[tuple[str, str, str, str]]) -> str:
    """(state, marker, title, note) — the status timeline used for recovery + posture."""
    out = ""
    for state, mark, title, note in items:
        out += (f'<li data-state="{state}"><span class="nl-af-i" aria-hidden="true">{mark}</span>'
                f'<div><b>{title}</b><span>{note}</span></div></li>')
    return f'<ul class="nl-auth-flow" role="list">{out}</ul>'


def signal(brand_href: str, eyebrow: str, head: str, sub: str, ledger: list[tuple[str, str, str]],
           art: tuple[str, str, str], status: str, words: list[str], facts: list[str] | None = None) -> str:
    led = "".join(
        f'<li><span class="nl-al-i">{n}</span><span>{t}</span><span class="nl-al-t">{k}</span></li>'
        for n, t, k in ledger
    )
    fc = ""
    if facts:
        fc = '<ul class="nl-auth-facts" role="list">' + "".join(
            f"<li>{icon('check')}<span>{f}</span></li>" for f in facts) + "</ul>"
    src, alt, cap = art
    aw, ah = ART_SIZE.get(src, (760, 520))
    return (
        '<aside class="nl-auth-signal">'
        f'<div><a class="nl-auth-brand" href="{brand_href}">{BRAND_MARK}<span>Nestlancer<span class="tld">.</span></span></a>'
        f'<p class="nl-auth-eyebrow">{eyebrow}</p>'
        f'<div class="nl-auth-head"><p class="nl-auth-head-t">{head}</p><p>{sub}</p></div></div>'
        f'<div class="nl-auth-seal" aria-hidden="true">{seal(words)}</div>'
        '<div>'
        f'<ul class="nl-auth-ledger" role="list">{led}</ul>{fc}'
        f'<figure class="nl-auth-art"><img alt="{alt}" decoding="async" height="{ah}" loading="lazy" src="{ASSET}/art/{src}" width="{aw}"/>'
        f'<figcaption>{cap}</figcaption></figure>'
        f'<p class="nl-auth-status"><span class="dot"></span>{status}</p>'
        '</div></aside>'
    )


def card(kicker: str, ico: str, title: str, lede: str, body: str, foot: str, note: str = "") -> str:
    nt = f'<p class="nl-auth-note">{note}</p>' if note else ""
    return (
        '<section class="nl-auth-card">'
        f'<header class="nl-auth-card-hd"><p class="nl-auth-kicker">{icon(ico)}{kicker}</p>'
        f'<h1>{title}</h1><p>{lede}</p></header>'
        f'<div class="nl-auth-card-bd">{body}{nt}</div>'
        f'<footer class="nl-auth-card-ft">{foot}</footer></section>'
    )


def result(id_: str) -> str:
    return f'<p class="form-feedback nl-auth-result" data-flow-result="" id="{id_}" role="status" tabindex="-1"></p>'


def dock(page: str) -> str:
    """The prototype dock, kept identical to the marketing pages so surfaces stay cross-linked."""
    l = (
        f'<a class="fx" href="../../../index.html">{icon("grid")} Sign-off hub <small>hub</small></a>'
        f'<a class="fx" href="../index.html">{icon("globe")} Marketing — nestlancer.com <small>9020</small></a>'
        f'<a class="fx" href="../../web/dashboard/index.html">{icon("app")} Client portal <small>web</small></a>'
        f'<a class="fx" href="../../admin/dashboard/index.html">{icon("term")} Admin console <small>admin</small></a>'
    )
    return (
        '<div class="fab" id="fab">'
        '<button aria-label="Prototype menu" class="fab-btn" type="button" '
        'onclick="document.getElementById(\'fab\').classList.toggle(\'open\')">'
        f'<i class="dot"></i><span>Prototype</span>{icon("arrow")}</button>'
        '<div class="fab-menu"><div class="fab-lab">Jump to surface</div>' + l +
        '<div class="fab-sep"></div><div class="fab-lab">This page</div>'
        f'<div class="fx is-static"><span>{page}</span></div>'
        '<div class="fab-sep"></div>'
        f'<button class="fx" data-theme-toggle="" type="button">{icon("sun")} <span>Theme</span> '
        '<small data-theme-label="">Light</small></button>'
        '</div></div>'
    )


# ------------------------------------------------------------------- template
TPL = """<!DOCTYPE html>
<!-- Nestlancer · UPGRADE V3 auth surface. Re-composed from the v2 page: same copy,
     same form contracts, new composition (signal panel + ledger card).
     Built by upgrade-v3/build-auth.py — edit that script, not the output. -->
<html data-theme="light" lang="en">
<head>
<meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<meta content="{desc}" name="description"/>
<meta content="#08120F" name="theme-color"/>
<title>{title}</title>
<link href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M4 14C10 11 16 11 28 7c-1.5 4-4.5 8-9 9.5C15.5 17.7 10.5 17.3 4 14Z' fill='%230B7A71'/%3E%3C/svg%3E" rel="icon"/>
<link href="{asset}/proto.css" rel="stylesheet"/>
<link href="{asset}/studio.css" rel="stylesheet"/>
<link href="{asset}/public-flow.css" rel="stylesheet"/>
<link href="{asset}/nl-v3.css" rel="stylesheet"/>
<link href="{asset}/nl-v3-pub.css" rel="stylesheet"/>
<script src="{asset}/proto-motion.js"></script>
</head>
<body class="mkt-body upgrade-v3 auth-v3 nl-v3{body_class}" data-page="{page}" data-surface="auth">
<a class="skip-link" href="#main">Skip to main content</a>
<div class="nl-auth-body{body_class}">
{signal}
<main class="nl-auth-main" id="main" tabindex="-1">
<div class="nl-auth-stage">{steps_}
{card_}
{extra}</div>
<footer class="nl-auth-foot">
<nav aria-label="Account and legal links">{footnav}</nav>
<span class="nl-mono">{stamp}</span>
</footer>
</main>
</div>
{dock}
<script defer="" src="{asset}/ui.js"></script>
<script defer="" src="{asset}/studio.js"></script>
<script defer="" src="{asset}/public-flow.js"></script>
<script defer="" src="{asset}/nl-v3.js"></script>
</body>
</html>
"""


def render(spec: dict) -> str:
    return TPL.format(
        desc=spec["desc"], title=spec["title"], asset=ASSET,
        page=spec["page"], body_class=spec.get("body_class", ""),
        signal=spec["signal"], steps_=spec.get("steps", ""),
        card_=spec["card"], extra=spec.get("extra", ""),
        footnav=spec["footnav"], stamp=spec["stamp"], dock=dock(spec["page"]),
    )


# ------------------------------------------------------------------ the pages
def login() -> dict:
    sig = signal(
        "../index.html", "CLIENT PORTAL · SIGN-IN",
        "Your delivery OS —<br/>from brief to payout.",
        "Same studio surface as the public site: engineered panels, teal signal, and money you can read at a glance — after you sign in.",
        [("01", "Project Hub — milestones, files, and threads in one surface.", "HUB"),
         ("02", "Milestone payments — pay deposit, mid, and final as work is approved.", "MONEY"),
         ("03", "Razorpay / UPI — tabular money, deposits and payouts clear.", "RAIL")],
        ("work-workspace.svg", "Illustrative client workspace with project panels.",
         "Illustrative workspace · local prototype"),
        "Client portal surface · prototype build", ["sign-in", "client"],
        facts=["No account exists in this prototype — sign-in never authenticates.",
               "Operators and administrators use the operator console, not this page."],
    )
    body = (
        '<form action="../../web/dashboard/index.html" aria-describedby="login-note" data-demo-login="" method="get">'
        + field("Email", link="required *", lead="mail",
                inp='<input aria-describedby="login-note" autocomplete="email" class="nl-auth-in" id="nl-email" name="email" placeholder="you@company.com" required="" type="email"/>')
        + password_field("Password", link="required *",
                         inp='<input aria-describedby="login-note" autocomplete="current-password" class="nl-auth-in" data-nl-pw="" id="nl-password" name="password" placeholder="Enter your password" required="" type="password"/>')
        + '<div class="nl-auth-row"><label class="check" for="nl-remember"><input id="nl-remember" type="checkbox"/>'
          '<span>Keep me signed in</span></label>'
          '<a class="link" href="../forgot-password/index.html">Forgot password?</a></div>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" type="submit">Sign in' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="login-note">Local prototype only. Use sample details; nothing is sent or authenticated.</p>'
        + result("login-result")
        + "</form>"
        + demo_box([("sample email", "ananya.iyer@nestlancer.com"), ("sample password", "prototype-demo")],
                   "The button types these values into this page only. Nothing is compared, stored, or sent.")
    )
    foot = ('<p class="nl-auth-switch">Don\'t have an account? <a href="../register/index.html">Sign up</a></p>'
            '<a class="nl-auth-alt" href="../admin-login/index.html">' + icon("shield") + " Operator sign-in</a>")
    return dict(
        page="login", title="Sign in · Nestlancer Client Portal",
        desc="Client sign-in for the Nestlancer portal, on the v3 ledger composition: one signal panel, one form card, sample values you can fill locally.",
        signal=sig,
        card=card("Sign in", "login", "Sign in",
                  "For clients only. Administrator and operator accounts must use the operator console — not this page.",
                  body, foot),
        extra=('<p class="nl-auth-alert is-info">' + icon("alert")
               + "<span>Administrator accounts cannot finish signing in here. Use the operator console so the session is audit-logged.</span></p>"),
        footnav='<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>'
                '<a href="../index.html">Marketing site</a><a href="../../web/dashboard/index.html">Sample dashboard</a>',
        stamp="upgrade v3 · auth ledger",
    )


def admin_login() -> dict:
    sig = signal(
        "../index.html", "OPERATOR IDENTITY BOUNDARY · OPERATOR CONSOLE",
        "Zero-trust gate for the people who run the platform.",
        "Built for internal operators — dense, auditable, and deliberately unfriendly to public portal branding. Credentials alone are not enough when MFA is challenged.",
        [("01", "Operators only — client accounts cannot finish sign-in here.", "ACCESS"),
         ("02", "Session TTL 8h / 30d, re-challenged on role change.", "SESSION"),
         ("03", "Every attempt is written to the audit log with IP and user-agent.", "AUDIT")],
        ("operator-console.svg", "Illustrative operator console with audit panels.",
         "Illustrative operator boundary · local prototype"),
        "admin.nestlancer.com · ADMIN role · MFA when enrolled", ["zero", "trust"],
        facts=["HTTPS + HSTS on the admin host; mixed content blocked.",
               "CSP nonce active; admin cookies scoped HttpOnly / SameSite.",
               "Failed attempts are rate-limited and audited."],
    )
    posture = flow([
        ("done", "✓", "Transport security", "HTTPS + HSTS on admin host. Mixed content blocked."),
        ("done", "✓", "Network policy", "CSP nonce active. Admin cookies scoped HttpOnly / SameSite."),
        ("now", "3", "Operator identity", "Email + password, then TOTP challenge when enrolled."),
    ])
    body = (
        '<form action="../../admin/dashboard/index.html" aria-describedby="operator-note" class="flow-auth-form" '
        'data-flow-form="Prototype only: operator credentials were not checked and no session was created." '
        'data-flow-next="Open the sample console" method="get">'
        + field("Work email", link="required *", lead="user",
                inp='<input autocomplete="username" class="nl-auth-in" id="op-email" name="email" placeholder="you@company.com" required="" type="email" value="admin@nestlancer.com"/>')
        + password_field("Password", link="required *",
                         inp='<input autocomplete="current-password" class="nl-auth-in" data-nl-pw="" id="op-pass" name="password" placeholder="Enter your password" required="" type="password" value="Admin123!@#"/>')
        + '<label class="check" for="op-trust" style="margin-top:16px"><input checked="" id="op-trust" type="checkbox"/>'
          '<span>Keep me signed in · Trust this device for 12 hours</span></label>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Enter console' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="operator-note">Local prototype only. Sample values are pre-filled; nothing is sent, stored or authenticated. Requires JavaScript.</p>'
        + result("operator-result") + "</form>"
        + '<div class="nl-auth-pre"><h2 class="nl-auth-pre-t">' + icon("shield")
          + "Pre-auth posture<span class=\"badge tone-warning\">2 / 3 ready</span></h2>"
        + posture + "</div>"
    )
    foot = ('<p class="nl-auth-switch">Client account? <a href="../login/index.html">Use the client portal sign-in</a></p>'
            '<a class="nl-auth-alt" href="../index.html">' + icon("arrow") + " Back to operator gate</a>")
    return dict(
        page="admin-login", title="Operator sign-in · Nestlancer Admin Console",
        desc="Operator sign-in for the Nestlancer admin console: identity boundary, pre-auth posture ledger, and audit notes — a local prototype that never authenticates.",
        body_class=" is-operator",
        signal=sig,
        steps_=steps(["Credentials", "MFA challenge", "Console"], 1),
        card=card("Internal only", "shield", "Verify <span class=\"nl-auth-hi\">identity</span> before console access",
                  "For Nestlancer administrators and internal operators only. Client accounts use the main app — staff only; sign-ins from unrecognized networks require an email challenge.",
                  body, foot),
        extra=('<p class="nl-auth-alert is-bad">' + icon("alert")
               + "<span><b>Client accounts cannot finish sign-in here.</b> Failed attempts are rate-limited and written to the audit log with IP and user-agent.</span></p>"),
        footnav='<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>'
                '<a href="../login/index.html">Client sign-in</a><a href="../../admin/dashboard/index.html">Sample console</a>',
        stamp="host · admin.nestlancer.com",
    )


def register() -> dict:
    sig = signal(
        "../index.html", "NEW CLIENT ACCOUNT",
        "Start the account that your deliveries run on.",
        "One account covers the quote, the Project Hub, milestone payments and sign-off. Your team invites operators separately — this form is only for new client accounts.",
        [("01", "Fixed-price quotes signed in the portal, not by email ping-pong.", "QUOTE"),
         ("02", "Milestone escrow via Razorpay — deposit, mid, final.", "MONEY"),
         ("03", "A live Project Hub your stakeholders can actually read.", "HUB")],
        ("studio-collaboration.svg", "Illustrative collaboration board with project cards.",
         "Illustrative account setup · local prototype"),
        "Client portal · registration is local only", ["register", "client"],
        facts=["Password policy: 12 characters, mixed case, a number and a symbol.",
               "Verification runs on this page — no email leaves the browser."],
    )
    body = (
        '<form action="../verify-email/index.html" aria-describedby="register-note" class="flow-auth-form" '
        'data-flow-form="Prototype only: no account was created and nothing was sent." '
        'data-flow-next="Continue to the sample email verification step" method="get">'
        + '<div class="nl-auth-grid">'
        + field("First name", link="required *", lead="user",
                inp='<input autocomplete="given-name" class="nl-auth-in" id="nl-first-name" name="first_name" placeholder="Your first name" required=""/>')
        + field("Last name", link="required *", lead="user",
                inp='<input autocomplete="family-name" class="nl-auth-in" id="nl-last-name" name="last_name" placeholder="Your last name" required=""/>')
        + "</div>"
        + field("Email", link="required *", lead="mail",
                inp='<input autocomplete="email" class="nl-auth-in" id="nl-email" name="email" placeholder="you@company.com" required="" type="email"/>')
        + password_field("Password", link="required *",
                         inp='<input autocomplete="new-password" class="nl-auth-in" data-nl-pw="" data-revealable="" id="nl-password" name="password" placeholder="Create a password" required="" type="password"/>')
        + meter([("len", "12 characters or more"), ("mix", "Upper and lower case"),
                 ("digit", "At least one number"), ("symbol", "At least one symbol")])
        + password_field("Confirm password", link="required *",
                         inp='<input autocomplete="new-password" class="nl-auth-in" data-match="nl-password" data-revealable="" id="nl-confirm-password" name="confirm_password" placeholder="Re-enter your password" required="" type="password"/>')
        + '<div class="nl-auth-checks">'
          '<label class="check" for="register-terms"><input id="register-terms" required="" type="checkbox"/>'
          '<span>I agree to the <a class="link" href="../terms/index.html">Terms of Service</a> and <a class="link" href="../privacy/index.html">Privacy Policy</a>.</span></label>'
          '<label class="check" for="register-updates"><input id="register-updates" type="checkbox"/>'
          '<span>Send me product updates and announcements.</span></label></div>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Sign up' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="register-note">Local prototype only. Use sample details; nothing is sent, stored or authenticated. Requires JavaScript.</p>'
        + result("register-result") + "</form>"
        + demo_box([("name", "Ananya Iyer"), ("email", "ananya.iyer@nestlancer.com"), ("password", "prototype-demo")],
                   "Terms still need your tick: a consent box is never pre-checked by the demo fill.")
    )
    foot = ('<p class="nl-auth-switch">Already have an account? <a href="../login/index.html">Sign in</a></p>'
            '<a class="nl-auth-alt" href="../pricing/index.html">' + icon("quote") + " See what a project costs</a>")
    return dict(
        page="register", title="Sign up · Nestlancer Client Portal",
        desc="Create a Nestlancer client account on the v3 composition: stepped ledger, live password strength against the real policy, and demo values you can fill locally.",
        signal=sig,
        steps_=steps(["Account", "Verify email", "Workspace"], 1),
        card=card("Get started", "user", "Sign up", "Create your client account for the Nestlancer studio.", body, foot),
        extra=('<p class="nl-auth-alert is-info">' + icon("alert")
               + "<span>Administrator and operator accounts are issued by your team — this form is only for new client accounts.</span></p>"),
        footnav='<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>'
                '<a href="../login/index.html">Sign in</a><a href="../pricing/index.html">Pricing</a>',
        stamp="step 1 of 3 · account",
    )


def forgot_password() -> dict:
    sig = signal(
        "../index.html", "ACCOUNT RECOVERY",
        "One link, twenty-eight minutes, no phone tag.",
        "Reset links are single-use and short-lived. Nothing in this prototype sends mail — the next step is a sample page, linked from the form.",
        [("01", "The link is bound to the account, not the browser session.", "LINK"),
         ("02", "Requesting a reset invalidates any earlier outstanding link.", "ONCE"),
         ("03", "Sign-ins after a reset require a fresh device trust prompt.", "TRUST")],
        ("studio-correspondence.svg", "Illustrative message threads with reply panels.",
         "Illustrative account recovery · local prototype"),
        "No mail is sent by this prototype", ["recovery", "reset"],
        facts=["If the address exists in our records, mail heads your way.",
               "Nothing arrives in 2 minutes? Check spam, then the allowlist note below."],
    )
    body = (
        '<form action="../reset-password/index.html" aria-describedby="forgot-note" class="flow-auth-form" '
        'data-flow-form="Prototype only: no reset email was sent." data-flow-next="Continue to the sample new-password step" method="get">'
        + field("Email", link="required *", lead="mail", hint="The address on your client account — an admin can reset it for you too.",
                inp='<input autocomplete="email" class="nl-auth-in" id="nl-email" name="email" placeholder="you@company.com" required="" type="email"/>')
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Send reset link' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="forgot-note">Local prototype only. Use sample details; nothing is sent, stored or authenticated. Requires JavaScript.</p>'
        + result("forgot-result") + "</form>"
        + '<div class="nl-auth-next"><b>' + icon("clock") + " What happens next</b>"
        + flow([("now", "1", "Link requested", "A single-use link is prepared for the address you entered."),
                ("", "2", "New password", "The link opens the reset step, which expires in 28 minutes."),
                ("", "3", "Signed in", "You land in the Project Hub with the session marked fresh.")]) + "</div>"
    )
    foot = ('<p class="nl-auth-switch">Remembered it? <a href="../login/index.html">Back to sign in</a></p>'
            '<a class="nl-auth-alt" href="../verify-document/index.html">' + icon("doc") + " Verify a document</a>")
    return dict(
        page="forgot-password", title="Forgot password · Nestlancer Client Portal",
        desc="Request a Nestlancer password reset link on the v3 composition: the request step, the expiry rules, and what happens next — all local prototype behaviour.",
        signal=sig,
        steps_=steps(["Request link", "New password", "Sign in"], 1),
        card=card("Account recovery", "key", "Reset your password",
                  "Enter the email on your client account. We'll send a secure reset link valid for 30 minutes.",
                  body, foot,
                  "If the address exists in our records, mail headed your way — check spam if nothing arrives in 2 minutes."),
        footnav='<a href="../login/index.html">Sign in</a><a href="../register/index.html">Create an account</a>'
                '<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>',
        stamp="step 1 of 3 · request link",
    )


def reset_password() -> dict:
    sig = signal(
        "../index.html", "NEW PASSWORD",
        "The link worked. Now pick something the breach lists have not seen.",
        "Requirements are checked in this browser, live, against the same rules the API enforces — including the k-anonymity lookup that a prototype cannot call.",
        [("01", "12 characters beats 10 typed twice, every time.", "LENGTH"),
         ("02", "Mixed case, a number, a symbol — the meter is honest.", "POLICY"),
         ("03", "Resetting signs the other sessions out.", "SESSIONS")],
        ("account-access.svg", "Illustrative account security panel with access rules.",
         "Illustrative password reset · local prototype"),
        "Link verified · expires in 28 minutes", ["fresh", "password"],
        facts=["Reset links are single-use; reopening one asks for a fresh request.",
               "The old password stays in no log, on no clipboard, in no field."],
    )
    body = (
        '<form action="../login/index.html" aria-describedby="reset-note" class="flow-auth-form" '
        'data-flow-form="Prototype only: no password was changed." data-flow-next="Return to sign in" method="get">'
        + password_field("New password", link="10+ · A-Z · 0-9",
                         inp='<input aria-describedby="password-requirements" autocomplete="new-password" class="nl-auth-in" data-nl-pw="" data-revealable="" id="nl-new-password" minlength="10" name="password" pattern="(?=.*[A-Z])(?=.*[0-9]).{10,}" placeholder="At least 10 characters" required="" type="password"/>')
        + meter([("len", "12 characters or more"), ("mix", "Upper and lower case"),
                 ("digit", "At least one number"), ("symbol", "At least one symbol")])
        + '<p class="nl-auth-help" id="password-requirements">The policy the real API enforces: 10+ characters, one uppercase and one number, not your email name, and not a breached password (k-anonymity check).</p>'
        + password_field("Confirm new password", link="required *",
                         inp='<input autocomplete="new-password" class="nl-auth-in" data-match="nl-new-password" data-revealable="" id="nl-confirm-new-password" name="confirm_password" placeholder="Repeat the new password" required="" type="password"/>')
        + '<label class="check" for="reset-signout" style="margin-top:16px"><input checked="" id="reset-signout" type="checkbox"/>'
          '<span>Sign out every other device on this account.</span></label>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Update password &amp; sign in' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="reset-note">Local prototype only. Use sample details; nothing is sent, stored or authenticated. Requires JavaScript.</p>'
        + result("reset-result") + "</form>"
    )
    foot = ('<p class="nl-auth-switch">Prefer not to change it? <a href="../login/index.html">Cancel — I remembered it</a></p>'
            '<a class="nl-auth-alt" href="../../web/settings/security/index.html">' + icon("shield") + " Security settings</a>")
    return dict(
        page="reset-password", title="Reset password · Nestlancer Client Portal",
        desc="Choose a new Nestlancer password on the v3 composition: a live strength meter wired to the real policy, matching confirmation, and a session-wide sign-out switch.",
        signal=sig,
        steps_=steps(["Request link", "New password", "Sign in"], 2, done=[1]),
        card=card("Link verified", "key", "Choose a new password",
                  "Reset link verified for <b>ananya.iyer@nestlancer.com</b>. This link expires in 28 minutes.",
                  body, foot),
        footnav='<a href="../login/index.html">Sign in</a><a href="../forgot-password/index.html">Request another link</a>'
                '<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>',
        stamp="step 2 of 3 · new password",
    )


def verify_email() -> dict:
    sig = signal(
        "../index.html", "STEP 2 OF 3 · VERIFY EMAIL",
        "Six digits, fourteen minutes, then your workspace.",
        "The code is checked in this browser against nothing at all — the sample below is pre-filled, and the resend button runs the real cooldown you would see.",
        [("01", "Codes rotate every 15 minutes and die with the attempt count.", "TTL"),
         ("02", "Work mailboxes quarantine us — allowlist no-reply@nestlancer.com.", "MAIL"),
         ("03", "Wrong address? Change it before you re-request.", "FIX")],
        ("delivery-process.svg", "Illustrative delivery pipeline with status stages.",
         "Illustrative verification · local prototype"),
        "Code expires in 14:32", ["verify", "email"],
        facts=["Paste works: the six boxes spread themselves.",
               "Nothing is emailed; this prototype has no mail transport."],
    )
    body = (
        '<form action="../../web/dashboard/index.html" aria-describedby="verify-email-resend" class="flow-auth-form" '
        'data-flow-form="Prototype only: the code was not checked." data-flow-next="Open the sample client dashboard" method="get">'
        + otp("ve", ["", "", "", "", "", ""], "Type or paste the six digits from the mail — each box advances on its own.")
        + '<div class="nl-auth-row"><p class="nl-auth-help" id="verify-email-resend" role="status">'
          'Code expires in <b>14:32</b> · no code was sent by this prototype.</p>'
          '<button class="nl-auth-mini" type="button" data-flow-resend="" aria-describedby="verify-email-resend" disabled="">Resend code</button></div>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Verify &amp; continue' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="verify-email-note">Local prototype only. Use sample details; nothing is sent, stored or authenticated. Requires JavaScript.</p>'
        + result("verify-email-result") + "</form>"
        + demo_box([("sample code", "492170")], "The filler types the sample code into the six boxes. No request is sent.")
    )
    foot = ('<p class="nl-auth-switch">Wrong address? <a href="../register/index.html">Go back</a></p>'
            '<a class="nl-auth-alt" href="../login/index.html">' + icon("login") + " Back to sign in</a>")
    return dict(
        page="verify-email", title="Verify your email · Nestlancer Client Portal",
        desc="Enter the six-digit Nestlancer verification code on the v3 composition: segmented entry with paste support, a real resend cooldown, and honest prototype notes.",
        signal=sig,
        steps_=steps(["Account", "Verify email", "Workspace"], 2, done=[1]),
        card=card("One step left", "mail", "Check your inbox",
                  "We sent a 6-digit code to <b>ananya.iyer@nestlancer.com</b>. Enter it to finish creating your client account.",
                  body, foot,
                  "Used a work email? Your IT may quarantine our mail — allowlist <b>no-reply@nestlancer.com</b>."),
        footnav='<a href="../register/index.html">Back to account</a><a href="../login/index.html">Sign in</a>'
                '<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>',
        stamp="step 2 of 3 · verify email",
    )


def verify() -> dict:
    sig = signal(
        "../index.html", "ACCOUNT ACTIVATION",
        "Activate the account with the code in your inbox.",
        "This is the public entry point for verification: same six digits, same rules, no marketing navigation between you and the form.",
        [("01", "The code is bound to this address and to no other.", "BOUND"),
         ("02", "Six wrong tries retire the code; a new one is one click away.", "LIMIT"),
         ("03", "Verified accounts land straight in the Project Hub.", "HUB")],
        ("verification-seal.svg", "Illustrative verification seal with signed document marks.",
         "Illustrative verification · local prototype"),
        "Sample code is pre-filled · nothing is checked", ["seal", "verified"],
        facts=["The three digits below are the pre-filled sample; the last three are yours to type.",
               "No account is activated by this prototype."],
    )
    body = (
        '<form action="../../web/dashboard/index.html" aria-describedby="verify-resend" class="flow-auth-form" '
        'data-flow-form="Prototype only: the code was not checked and no account was activated." '
        'data-flow-next="Open the sample client dashboard" method="get">'
        + otp("pv", ["4", "8", "1", "", "", ""], "Sample digits are pre-filled — complete the last three to see the enabled state.")
        + '<div class="nl-auth-row"><p class="nl-auth-help" id="verify-resend" role="status">'
          'Code expires in 14:32 · no code was sent by this prototype.</p>'
          '<button class="nl-auth-mini" type="button" data-flow-resend="" aria-describedby="verify-resend" disabled="">Resend code</button></div>'
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Verify email' + icon("arrow") + "</button></div>"
        + '<p class="demo-note" id="verify-note">Local prototype only. The sample code is pre-filled; nothing is sent or checked. Requires JavaScript.</p>'
        + result("verify-result") + "</form>"
    )
    foot = ('<p class="nl-auth-switch">Wrong address? <a href="../login/index.html">Change email</a></p>'
            '<a class="nl-auth-alt" href="../login/index.html">' + icon("login") + " Back to sign in</a>")
    return dict(
        page="verify", title="Verify email · Nestlancer",
        desc="Public email-verification step for a Nestlancer client account, rebuilt on the v3 auth composition: segmented code entry, resend cooldown, and prototype-honest status lines.",
        signal=sig,
        card=card("Activation", "check", "Verify your email",
                  "We sent a 6-digit code to <b>ananya.iyer@nestlancer.com</b>. Enter it below to activate your client account.",
                  body, foot),
        footnav='<a href="../index.html">Home</a><a href="../login/index.html">Sign in</a>'
                '<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>',
        stamp="client activation · local check",
    )


def verify_document() -> dict:
    sig = signal(
        "../index.html", "TRUST · PUBLIC LOOKUP",
        "Any Nestlancer document can be proven, in one line.",
        "Every quote, contract, invoice, and receipt we issue carries a public reference and a content hash. Paste the reference and the sample record below is re-hashed in this browser.",
        [("01", "Find the reference in the footer of the PDF.", "REF"),
         ("02", "We re-hash the stored copy taken at issue.", "HASH"),
         ("03", "A failed check goes to a human auditor, not a log file.", "AUDIT")],
        ("verification-seal.svg", "Illustrative verification seal with signed document marks.",
         "Illustrative signature check · not a live service"),
        "Checks run in this browser · no lookup sent", ["authentic", "hash"],
        facts=["References look like NL-INV-2026-000008, NL-QTO-2026-000116 or NL-CTR-2026-000005.",
               "Only the sample invoice reference is included in this prototype."],
    )
    body = (
        '<form aria-describedby="doc-status" aria-label="Verify a document reference" data-doc-verify="doc-result" role="search">'
        + field("Document reference", link="paste from the footer", lead="hash",
                hint="Format NL-INV-YYYY-NNNNNN. Uppercasing happens on submit.",
                inp='<input autocomplete="off" class="nl-auth-in nl-auth-mono" id="nl-document-reference" name="reference" placeholder="NL-INV-2026-000008" required="" spellcheck="false" type="text" value="NL-INV-2026-000008"/>')
        + '<div class="nl-auth-submit"><button class="nl-auth-btn" disabled="" type="submit">Verify reference' + icon("arrow") + "</button></div>"
        + '<p class="nl-auth-help" data-doc-status="" id="doc-status" role="status" tabindex="-1">Prototype lookup: only <b>NL-INV-2026-000008</b> is included in this sample. No request is sent; checks run in this browser.</p>'
        + "</form>"
    )
    proof = (
        '<section aria-labelledby="doc-result-h" class="nl-auth-proof" data-doc-ref="NL-INV-2026-000008" id="doc-result">'
        '<header class="nl-auth-proof-hd">' + icon("check")
        + '<span id="doc-result-h">Authentic · issued by Nestlancer</span>'
        '<span class="badge tone-success" style="margin-left:auto">Verified</span></header>'
        '<div class="nl-auth-proof-bd">'
        '<div class="nl-auth-proof-img" aria-hidden="true">'
        '<svg viewBox="0 0 340 108" width="340" height="108" fill="none" stroke="var(--nl-accent)" stroke-width="1.2">'
        '<rect height="72" rx="6" width="120" x="14" y="18"></rect><path d="M28 36h92M28 50h92M28 64h58"></path>'
        '<path d="M178 54h-20" stroke-dasharray="4 4"></path>'
        '<circle cx="232" cy="54" r="36" stroke-dasharray="2 6"></circle><circle cx="232" cy="54" r="27"></circle>'
        '<path d="M220 55.5 228 63l17-19" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>'
        '<path d="M286 44c14 0 20 6 20 10s-6 10-20 10" stroke-dasharray="3 5"></path>'
        '<text x="14" y="104" fill="var(--nl-ink-4)" stroke="none" font-family="ui-monospace, monospace" font-size="8">TAX INVOICE NL-INV-2026-000008 · SHA-256 3d9b227</text>'
        "</svg></div>"
        '<dl class="nl-auth-kv"><div><dt>Document</dt><dd>Tax Invoice NL-INV-2026-000008</dd></div>'
        '<div><dt>Type</dt><dd>GST invoice (SAC 998314)</dd></div>'
        '<div><dt>Issued to</dt><dd>Ananya Iyer — Iyer FinTech Solutions</dd></div>'
        '<div><dt>Amount</dt><dd>₹14,400.00 (incl. 18% GST)</dd></div>'
        '<div><dt>Issued</dt><dd>Oct 5, 2026, 3:49:13 AM IST</dd></div>'
        '<div><dt>Status</dt><dd><span class="badge tone-success">Paid</span></dd></div></dl>'
        '<p class="nl-auth-hash">' + icon("hash") + '<span><b>SHA-256 of this document:</b> '
        '<span class="nl-auth-mono">c30c44bfdec880fc176cfcee304fa9e782ff37b6c71ec26bf2a4ea48133ee9d1</span></span></p>'
        '<p class="nl-auth-help">Signature chain and content hash verified 41 seconds ago.</p>'
        "</div></section>"
    )
    return dict(
        page="verify-document", title="Verify a document · Nestlancer",
        desc="Check that a Nestlancer quote, contract, invoice or receipt is genuine: paste the footer reference and see the sample record, hash and audit trail on the v3 composition.",
        signal=sig,
        card=card("Document trust", "doc", "Verify a Nestlancer document",
                  "Every quote, contract, invoice, and receipt we issue carries a public reference. Paste it here to confirm it is genuine and unaltered.",
                  body, '<p class="nl-auth-switch">Need your own documents? <a href="../index.html">Back to the studio</a></p>'
                        '<a class="nl-auth-alt" href="../contact/index.html">' + icon("mail") + " Report a mismatch</a>",
                  "References are printed in the document footer and listed in your portal under Billing → Invoices."),
        extra=proof,
        footnav='<a href="../index.html">Home</a><a href="../login/index.html">Sign in</a>'
                '<a href="../terms/index.html">Terms</a><a href="../privacy/index.html">Privacy</a>',
        stamp="prototype lookup · in-browser",
    )


PAGES = {
    "login": login,
    "admin-login": admin_login,
    "register": register,
    "forgot-password": forgot_password,
    "reset-password": reset_password,
    "verify-email": verify_email,
    "verify": verify,
    "verify-document": verify_document,
}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    want = [p for p in PAGES if not a.only or p in a.only.split(",")]
    changed = 0
    for slug in want:
        out = render(PAGES[slug]())
        path = os.path.join(PROTO, "apps/landing", slug, "index.html")
        old = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
        h = hashlib.sha256(out.encode()).hexdigest()[:12]
        print(f"{'WRITE' if not a.check and out != old else 'same ' if out == old else 'CHK  '} "
              f"{os.path.relpath(path, ROOT):46s} {len(out):>7,} B  {h}")
        if out != old:
            changed += 1
            if not a.check:
                open(path, "w", encoding="utf-8").write(out)
    print(f"pages={len(want)} changed={changed}")


if __name__ == "__main__":
    sys.exit(main())
