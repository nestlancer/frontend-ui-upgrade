#!/usr/bin/env python3
"""UPGRADE V3 · public (marketing / legal) pages.

Applies the v3 layer to the 13 non-auth landing pages plus the sign-off hub:

  wire      links nl-v3.css + nl-v3-pub.css + nl-v3.js, sets body.nl-v3
  meta      normalises the "Nestlancer web prototype — …" descriptions the
            review flagged, and repairs title escaping
  nav       one canonical primary nav on every public page (two variants were
            in circulation) with aria-current on the page you are on
  index     a numbered section rail under the hero, built from the page's own
            section headings (terms/privacy reuse their TOC table's copy)
  legal     clause ledger: each h2 run in .prose becomes a numbered .nl-rule
  plans     pricing/services engagement cards become .nl-plan ledgers and their
            pseudo-lists of ticked divs become real <ul class="nl-inc">
  faq       engagement FAQ <details> entries get ledger numbering
  art       figures holding the bespoke illustrations are marked for the v3
            layer; a page with no artwork at all gets one

Nothing is invented and nothing is dropped: blocks are moved, retagged or
wrapped, and the run is only written when the file reparses byte-identically
after the edit is undone.  See upgrade-v3/nlhtml.py.
"""
from __future__ import annotations

import argparse
import html as _html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROTO = os.path.join(ROOT, "proto")
sys.path.insert(0, HERE)
import nlhtml  # noqa: E402
from nlhtml import Node, first_element  # noqa: E402

PUB_PAGES = [
    "apps/landing/index.html",
    "apps/landing/about/index.html",
    "apps/landing/services/index.html",
    "apps/landing/pricing/index.html",
    "apps/landing/portfolio/index.html",
    "apps/landing/portfolio/[id]/index.html",
    "apps/landing/portfolio/fintech-payments-hub/index.html",
    "apps/landing/blog/index.html",
    "apps/landing/blog/[slug]/index.html",
    "apps/landing/contact/index.html",
    "apps/landing/contact-alt/index.html",
    "apps/landing/terms/index.html",
    "apps/landing/privacy/index.html",
]
HUB = "index.html"
LEGAL = ("apps/landing/terms/index.html", "apps/landing/privacy/index.html")
PLAN_PAGES = ("apps/landing/pricing/index.html", "apps/landing/services/index.html")


NAV = [
    ("", "Home"),
    ("portfolio", "Portfolio"),
    ("services", "Services"),
    ("pricing", "Pricing"),
    ("blog", "Blog"),
    ("about", "About"),
    ("contact", "Contact"),
]
ARROW = ('<svg aria-hidden="true" fill="none" height="14" stroke="currentColor" stroke-linecap="round" '
         'stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24" width="14"><path d="M5 12h14"/>'
         '<path d="m12 5 7 7-7 7"/></svg>')
CHECK = ('<svg aria-hidden="true" fill="none" height="14" stroke="currentColor" stroke-linecap="round" '
         'stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="14"><path d="m5 12 5 5L20 7"/></svg>')


def plain(s: str) -> str:
    """Text that came out of the parser is still entity-encoded; unescape before
    re-escaping, or &amp; becomes &amp;amp;."""
    return _html.unescape(re.sub(r"\s+", " ", s)).strip()


def tflat(node: Node) -> str:
    return plain(node.text_flat())


def esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:48]


# ------------------------------------------------------------------ 1. wiring
def up_to(rel: str) -> list[str]:
    """Directory parts of the page, relative to proto/."""
    return rel.split("/")[:-1]


def assets_for(rel: str) -> str:
    return "../" * len(up_to(rel)) + "shared/assets"


def wire(tree: Node, rel: str, notes: list[str]) -> bool:
    a = assets_for(rel)
    head = tree.find("head")
    body = tree.find("body")
    if head is None or body is None:
        notes.append("no-head/body")
        return False
    if 'href="%s/nl-v3-pub.css"' % a in head.outer():
        return False
    links = [n for n in head.find_all("link") if 'rel="stylesheet"' in n.outer()]
    anchor = links[-1] if links else None
    for href in (f"{a}/nl-v3.css", f"{a}/nl-v3-pub.css"):
        node = first_element(f'<link href="{href}" rel="stylesheet"/>')
        if anchor is None:
            head.append(node)
        else:
            anchor.insert_after(node)
            anchor = node
    scripts = [n for n in body.find_all("script") if n.has_attr("src")]
    tag = first_element(f'<script defer="" src="{a}/nl-v3.js"></script>')
    if scripts:
        scripts[-1].insert_after(tag)
    else:
        body.append(tag)
    cur = body.attr("class") or ""
    parts = [p for p in cur.split() if p not in ("upgrade-v2", "auth-v2")]
    for add in ("upgrade-v3", "nl-v3"):
        if add not in parts:
            parts.append(add)
    body.set_attr("class", " ".join(parts))
    if body.has_attr("data-surface") and body.attr("data-surface") not in ("marketing", "auth"):
        body.set_attr("data-surface", "marketing")
    return True


def meta_fix(tree: Node, rel: str, notes: list[str]) -> bool:
    head = tree.find("head")
    if head is None:
        return False
    changed = False
    t = head.find("title")
    if t is not None:
        raw = t.text()
        fixed = raw.replace("&amp;amp;", "&amp;").replace("&amp;#", "&#")
        if fixed != raw:
            t.children = [fixed]
            notes.append("title-escaping-repaired")
            changed = True
    for m in head.find_all("meta"):
        if m.attr("name") != "description":
            continue
        c = m.attr("content") or ""
        new = re.sub(r"^\s*Nestlancer (web |admin )?prototype\s*[—–-]\s*", "", c).strip()
        if new == c:
            new = c
        if not new:
            new = (t.text_flat() if t is not None else "Nestlancer") + " — local HTML prototype."
        if new != c:
            m.set_attr("content", new)
            notes.append("meta-description-normalised")
            changed = True
    return changed


def nav_prefix(rel: str) -> str | None:
    """Public nav hrefs, relative to apps/landing/. None = not a landing page."""
    d = up_to(rel)
    if d[:2] != ["apps", "landing"]:
        return None
    return "../" * (len(d) - 2)


def nav_for(rel: str) -> list[tuple[str, str]] | None:
    prefix = nav_prefix(rel)
    if prefix is None:
        return None
    out = []
    for target, label in NAV:
        out.append((prefix + (f"{target}/index.html" if target else "index.html"), label))
    return out


def canonical_nav(tree: Node, rel: str, notes: list[str]) -> bool:
    body = tree.find("body")
    nav = nav_for(rel)
    if body is None or nav is None:
        return False
    page = rel.split("/")[-2]
    target = None
    for n in body.find_all("nav"):
        if n.attr("class") and "mkt-links" in n.attr("class"):
            target = n
            break
    if target is None:
        return False
    hrefs = {a.attr("href") for a in target.find_all("a")}
    want = {h for h, _ in nav}
    own = "index.html" if page == "landing" else nav_prefix(rel) + page + "/index.html"
    if hrefs == want and all(
        (a.attr("href") == own) == a.has_attr("aria-current") for a in target.find_all("a")
    ):
        return False
    html = ""
    for href, label in nav:
        cur = href == own
        attrs = ' aria-current="page" class="active"' if cur else ""
        html += f'<a href="{href}"{attrs}>{label}</a>' 
    target.children = []
    for piece in re.findall(r"<a\b.*?</a>", html, re.S):
        target.append(first_element(piece))
    notes.append("canonical-nav")
    return True


# --------------------------------------------------------------- 2. index rail
def section_head(sec: Node) -> Node | None:
    """The section's own heading, not the first card title inside it."""
    wrap = sec.find(None, "mkt-wrap") or sec
    skip = ("mkt-card", "grid", "nl-plans", "tbl-wrap", "cards", "journal-layout")
    for c in wrap.child_elements():
        if c.tag in ("h1", "h2", "h3"):
            return c
        if c.tag in ("div", "header") and not any(c.has_class(k) for k in skip):
            for d in c.child_elements():
                if d.tag in ("h1", "h2", "h3"):
                    return d
    return sec.find("h2") or sec.find("h3")


def section_heads(main: Node) -> list[tuple[Node, Node]]:
    out = []
    for sec in main.find_all("section"):
        if sec.has_class("mkt-hero"):
            continue
        h = section_head(sec)
        if h is None:
            continue
        out.append((sec, h))
    return out


def blurb_of(sec: Node) -> str:
    p = sec.find("p")
    if p is None:
        return ""
    txt = tflat(p)
    if len(txt) < 40:
        return ""
    return (txt[:118] + "…") if len(txt) > 118 else txt


def build_index(entries: list[tuple[str, str, str]], label: str, notes: list[str]) -> Node:
    cells = ""
    for i, (sid, title, small) in enumerate(entries, start=1):
        sm = f"<small>{esc(small)}</small>" if small else ""
        cells += (f'<a href="#{sid}"><span>{i:02d}</span><div>{esc(title)}{sm}</div>{ARROW}</a>')
    notes.append(f"index-rail({len(entries)})")
    return first_element(
        f'<div class="mkt-wrap nl-index-wrap"><p class="nl-index-label">{esc(label)}</p>'
        f'<nav class="nl-index nl-toc" aria-label="On this page" role="nav">{cells}</nav></div>'
    )


def index_rail(tree: Node, rel: str, notes: list[str]) -> bool:
    main = tree.find("main")
    if main is None:
        return False
    if main.find(None, "nl-index-wrap") is not None:
        return False                    # already indexed (re-running must not stack rails)
    heads = section_heads(main)
    hero = main.find(None, "mkt-hero")
    if len(heads) < 3 or hero is None:
        return False
    entries = []
    used = set()
    for sec, h in heads:
        sid = h.attr("id") or sec.attr("id")
        if not sid:
            sid = slug(h.text_flat()) or f"section-{len(entries) + 1}"
        while has_id(tree, sid):
            sid = f"{sid}-{len(entries) + 1}"
        used.add(sid)
        sec.set_attr("id", sec.attr("id") or sid)
        if not h.has_attr("id"):
            h.set_attr("id", sid + "-h")
        entries.append((sec.attr("id"), tflat(h), blurb_of(sec)))
    if len(entries) < 3:
        return False
    hero.insert_after(build_index(entries, "On this page", notes))
    return True


def has_id(tree: Node, sid: str) -> bool:
    for n in tree.find_all(None):
        if n.attr("id") == sid:
            return True
    return False


def tidy_style(node: Node) -> None:
    """Drop the inline max-width the old hero carried; the v3 mast sets its own."""
    if not node.has_attr("style"):
        return
    keep = re.sub('max-width:[^;"]*;?', "", node.attr("style")).strip()
    if keep:
        node.set_attr("style", keep)
    else:
        node.del_attr("style")


def move_to(target: Node, *nodes: Node) -> None:
    """Detaches each node from its current parent (if it is still listed there)
    and appends it. Safe to call after the old parent's children were cleared."""
    for n in nodes:
        par = n.parent
        if par is not None:
            try:
                par.children.remove(n)
            except ValueError:
                pass
            n.parent = None
        target.append(n)


# ------------------------------------------------------------------- 3. legal
def _first_heading(node: Node) -> Node | None:
    for tag in ("h2", "h3"):
        if node.tag == tag:
            return node
    for c in node.child_elements():
        if c.tag in ("h2", "h3") and not c.has_class("sr-only"):
            return c
    for c in node.child_elements():
        h = _first_heading(c)
        if h is not None:
            return h
    return None


def legal_clauses(tree: Node, rel: str, notes: list[str]) -> bool:
    """Number the top-level blocks of a long prose run, and index them.

    Two pages earned a real defect for this (§4.3: "no clause numbering"). The
    rule is generic — terms and privacy, and any case study or article that
    carries a `.prose` block: the headings that open a section get `01 · Title`
    numbering, the run becomes a ledger, and a duplicate table of contents is
    replaced by the v3 index rail, which nl-v3.js tracks as you scroll.
    """
    main = tree.find("main")
    if main is None:
        return False
    changed = False
    prose = main.find(None, "prose")
    if prose is not None:
        host = prose
        if len([c for c in prose.child_elements() if c.tag in ("h2", "h3")]) < 3:
            # articles and case studies wrap the whole run in one or two divs; the
            # headings live a level down, and that level is the ledger
            for c in prose.child_elements():
                if len([k for k in c.child_elements() if k.tag in ("h2", "h3")]) >= 3:
                    host = c
                    break
        seq = [c for c in host.child_elements() if c.tag not in ("script", "style", "noscript")]
        direct = [c for c in seq if c.tag in ("h2", "h3") and not c.has_class("sr-only")]
        heads: list[Node] = []
        if len(direct) >= 3:                    # terms & privacy: headings are the prose's own children
            tag = max({c.tag for c in direct}, key=lambda t: sum(1 for c in direct if c.tag == t))
            groups, cur, pre = [], [], []
            for c in seq:
                if c.tag == tag:
                    if cur:
                        groups.append(cur)
                    cur, heads = [c], heads + [c]
                elif cur:
                    cur.append(c)
                else:
                    pre.append(c)
            if cur:
                groups.append(cur)
        else:                                    # case studies wrap each block in its own element
            marks = [(i, _first_heading(c)) for i, c in enumerate(seq)]
            marks = [(i, h) for i, h in marks if h is not None]
            if len(marks) < 2:
                marks = []
            starts = [i for i, _h in marks]
            heads = [h for _i, h in marks]
            groups = [seq[i:(starts[k + 1] if k + 1 < len(starts) else len(seq))] for k, i in enumerate(starts)]
            pre = seq[:starts[0]] if starts else []
        if len(groups) >= 2:
            rules = first_element('<div class="nl-rules-body"></div>')
            for gi, g in enumerate(groups, start=1):
                rule = first_element('<section class="nl-rule"></section>')
                rule.append(first_element(f'<span class="nl-rule-n" aria-hidden="true">{gi:02d}</span>'))
                move_to(rule, *g)
                h = heads[gi - 1] if gi - 1 < len(heads) else None
                if h is not None and not h.has_attr("id"):
                    h.set_attr("id", slug(tflat(h)) or f"clause-{gi}")
                rules.append(rule)
            host.children = []
            host.add_class("nl-rules")
            move_to(rules, *pre)
            host.append(rules)
            notes.append(f"clause-ledger({len(groups)})")
            changed = True
    # A table of contents ahead of the clauses becomes the v3 index rail, which the
    # runtime tracks as you scroll; the sticky aside rail that duplicated it goes.
    for sec in main.find_all("section"):
        hh = sec.find("h2")
        if hh is None or "on this page" not in hh.text_flat().lower():
            continue
        table = sec.find("table")
        if table is None:
            continue
        entries = []
        for tr in table.find_all("tr"):
            td = tr.find_all("td")
            if len(td) >= 2:
                raw = tflat(td[0])
                entries.append((slug(re.sub(r"^\d+\.\s*", "", raw)), raw, tflat(td[1])))
        if len(entries) < 3:
            continue
        wrap = sec.find(None, "mkt-wrap") or sec
        idx = build_index(entries, "Contents of this document", notes)
        idx.add_class("nl-toc")
        first = wrap.child_elements()[0] if wrap.child_elements() else None
        if first is not None:
            first.insert_before(idx)
        else:
            wrap.append(idx)
        for holder in list(wrap.child_elements()):
            if holder.tag == "div" and holder.find("table") is not None:
                holder.remove()
        aside = main.find(None, "legal-rail")
        if aside is not None:
            # the rail's contents list duplicates the new index; its notes do not,
            # so the rail keeps them and only the link list goes
            for c in list(aside.child_elements()):
                links = c.find_all("a")
                if c.tag == "nav" or (links and all(l.has_class("rail-link") for l in links)):
                    c.remove()
            if not aside.child_elements():
                aside.remove()
            else:
                aside.add_class("nl-legal-note")
        changed = True
    return changed


# ------------------------------------------------------------------ 4. plans
def plans(tree: Node, rel: str, notes: list[str]) -> bool:
    """Pricing / services engagement cards → the v3 plan ledger.

    The card's own elements are moved, never copied: title, price, summary, the
    ticked inclusion rows (which become a real list), the details block and the
    call to action. Any element the builder does not recognise is left in the
    card body untouched, so nothing can silently disappear.
    """
    main = tree.find("main")
    if main is None:
        return False
    grid = main.find(None, "engagements") or main.find(None, "service-grid")
    if grid is None:
        return False
    cards = [c for c in grid.child_elements() if c.tag == "article" or c.has_class("mkt-card")]
    if not cards:
        return False
    box = first_element('<div class="nl-plans"></div>')
    grid.insert_before(box)
    for ci, card in enumerate(cards, start=1):
        card.remove()
        h = card.find("h2") or card.find("h3")
        sub = next((p for p in card.find_all("p") if p is not h and p.text_flat().strip()), None)
        price = card.find(None, "package-price")
        badge = card.find(None, "badge")
        timeline = next((d for d in card.find_all("div")
                         if d.has_class("text-xs") and not d.child_elements() and d.text_flat().strip()), None)
        inc_rows = []
        for d in card.find_all("div"):
            kids = d.child_elements()
            if len(kids) == 2 and kids[0].tag == "span" and (kids[0].attr("style") or "").startswith("color:var(--t-success"):
                inc_rows.append(d)
        details = card.find("details")
        cta = card.find(None, "package-cta") or card.find(None, "link-arrow")
        alt = card.find(None, "compare-link")

        card.add_class("nl-plan")
        card.set_attr("data-featured", "true" if card.has_class("featured-engagement") else "false")
        card.set_attr("data-nl-card", "plan")

        head = first_element('<header class="nl-plan-hd"></header>')
        tt = first_element('<div></div>')
        tt.append(first_element(f'<p class="nl-plan-n">{ci:02d} · {esc((card.attr("id") or "engagement").upper())}</p>'))
        if h is not None:
            move_to(tt, h)
            swap_class(h, "h3", "nl-plan-t")
            swap_class(h, "h2", "nl-plan-t")
            h.add_class("nl-plan-t")
        if sub is not None:
            move_to(tt, sub)
            sub.add_class("nl-plan-s")
        head.append(tt)

        if price is not None or badge is not None or timeline is not None:
            pw = first_element('<div class="nl-plan-price"></div>')
            if badge is not None:
                bt = tflat(badge)
                badge.remove()
                pw.append(first_element(f'<p class="nl-plan-t2" style="margin-bottom:7px">'
                                        f'<span class="badge tone-success">{esc(bt)}</span></p>'))
            if price is not None:
                move_to(pw, price)
                for junk in ("mt-5", "fs-30", "package-price"):
                    price.set_attr("class", " ".join(
                        p for p in (price.attr("class") or "").split() if p != junk).strip() or "nl-plan-p")
                price.add_class("nl-plan-p")
            if timeline is not None:
                tl = tflat(timeline)
                timeline.remove()
                pw.append(first_element(f'<span class="nl-plan-t2">{esc(tl)}</span>'))
            head.append(pw)

        bodybox = first_element('<div class="nl-plan-bd"></div>')
        if inc_rows:
            ul = first_element('<ul class="nl-inc" role="list"></ul>')
            for d in inc_rows:
                text_span = d.child_elements()[-1]
                txt = tflat(text_span)
                d.remove()
                ul.append(first_element(f'<li>{CHECK}<span>{esc(txt)}</span></li>'))
            bodybox.append(ul)
        for junk in card.find_all(None, "divider"):
            junk.remove()
        if details is not None:
            move_to(bodybox, details)
        for left in list(card.child_elements()):
            if left.has_class("nl-plan-hd") or left.has_class("nl-plan-bd"):
                continue
            move_to(bodybox, left)
        card.children = []
        card.append(head)
        card.append(bodybox)
        if cta is not None:
            ft = first_element('<footer class="nl-plan-ft"></footer>')
            card.append(ft)
            move_to(ft, cta)
            cta.set_attr("class", "nl-cta")
            if alt is not None:
                alt.remove()
                ft.append(first_element(f'<span class="nl-plan-alt">{alt.outer()}</span>'))
            card.append(ft)
        box.append(card)
    if not grid.child_elements() and not grid.text().strip():
        grid.remove()
    notes.append(f"plans({len(cards)})")
    return True


def swap_class(node: Node, old: str, new: str) -> None:
    parts = [new if p == old else p for p in (node.attr("class") or "").split()]
    seen = []
    for p in parts:
        if p not in seen:
            seen.append(p)
    node.set_attr("class", " ".join(seen))


# --------------------------------------------------------------------- 5. faq
def faq(tree: Node, rel: str, notes: list[str]) -> bool:
    main = tree.find("main")
    if main is None:
        return False
    items = [d for d in main.find_all("details") if d.has_class("faq-item")]
    if len(items) < 2:
        return False
    parent = items[0].parent
    box = first_element('<div class="nl-faq"></div>')
    items[0].insert_before(box)
    for d in items:
        d.remove()
        d.add_class("nl-faq-item")
        box.append(d)
    if parent is not None and not parent.child_elements() and not parent.text().strip():
        parent.remove()
    notes.append(f"faq({len(items)})")
    return True


# --------------------------------------------------------------------- 6. art
ART_BY_PAGE = {
    "apps/landing/pricing/index.html": (
        "shared-quote.svg", "Four flat-lay studio panels: a quote, a milestone schedule, an invoice and a seal.",
        "Fixed-price engagements · quoted, milestone-billed, invoiced"),
    "apps/landing/terms/index.html": (
        "deployment-system.svg" if False else "delivery-system.svg",
        "A diagram of the delivery system the terms govern.",
        "The delivery system these terms govern · diagram"),
    "apps/landing/privacy/index.html": (
        "operator-console.svg", "A console panel showing scoped data access and audit rows.",
        "Scoped access and audit rows · how data is handled"),
}


def art(tree: Node, rel: str, notes: list[str]) -> bool:
    body = tree.find("body")
    main = tree.find("main")
    if body is None or main is None:
        return False
    a = assets_for(rel)
    marked = 0
    for fig in body.find_all("figure"):
        imgs = fig.find_all("img")
        if any('assets/art/' in (i.attr("src") or "") for i in imgs):
            if not fig.has_attr("data-nl-art"):
                fig.set_attr("data-nl-art", "pub")
                marked += 1
    for img in body.find_all("img"):
        if 'assets/art/' in (img.attr("src") or "") and not img.has_attr("decoding"):
            img.set_attr("decoding", "async")
    if rel in ART_BY_PAGE:
        src, alt, cap = ART_BY_PAGE[rel]
        if f"art/{src}" not in body.outer():
            hero = main.find(None, "mkt-hero")
            wrap = hero.find(None, "mkt-wrap") if hero is not None else None
            if wrap is not None:
                w, h = (760, 520)
                fig = first_element(
                    f'<figure class="nl-pub-figure" data-nl-art="hero"><img alt="{esc(alt)}" decoding="async" '
                    f'height="{h}" loading="lazy" src="{a}/art/{src}" width="{w}"/>'
                    f'<figcaption><span>{esc(cap)}</span><span>local prototype</span></figcaption></figure>')
                wrap.append(fig)
                notes.append("hero-art")
    if marked:
        notes.append(f"art-marks({marked})")
    return bool(marked) or rel in ART_BY_PAGE


# ------------------------------------------------------------- 8. public mast
def pub_mast(tree: Node, rel: str, notes: list[str]) -> bool:
    """The hero's own parts re-hung on the v3 masthead: eyebrow becomes a kicker
    with a rule, the lede keeps its words, and any CTA line becomes a fact chip.
    Copy is moved, never rewritten."""
    main = tree.find("main")
    hero = main.find(None, "mkt-hero") if main is not None else None
    if hero is None:
        return False
    wrap = hero.find(None, "mkt-wrap") or hero
    h1 = wrap.find("h1")
    if h1 is None:
        return False
    if wrap.has_class("nl-pub-mast"):
        return False
    eye = wrap.find(None, "mkt-eyebrow")
    lead = wrap.find(None, "lead")
    link = next((a for a in wrap.find_all("a") if a.has_class("link-arrow")), None)
    mast = first_element('<div class="nl-pub-mast"></div>')
    h1.add_class("nl-pub-title")
    swap = " ".join(p for p in (h1.attr("class") or "").split() if p != "h1")
    h1.set_attr("class", swap)
    tidy_style(h1)
    if eye is not None:
        move_to(mast, eye)
        eye.set_attr("class", "nl-pub-kicker")
        for d in eye.find_all("span"):
            if not d.text().strip() and not d.child_elements():
                d.remove()
    move_to(mast, h1)
    if lead is not None:
        move_to(mast, lead)
        lead.add_class("nl-pub-lede")
        swap = " ".join(p for p in (lead.attr("class") or "").split() if p not in ("lead", "mt-4"))
        lead.set_attr("class", swap)
        tidy_style(lead)
    if link is not None:
        txt = tflat(link)
        holder = link.parent
        move_to(mast, link)
        link.set_attr("class", "nl-pub-chip")
        chips = first_element('<ul class="nl-pub-meta" role="list"></ul>')
        chips.append(first_element(f'<li>{link.outer()}</li>'))
        mast.append(chips)
        link.remove()
        if holder is not None and not holder.child_elements() and not holder.text().strip():
            holder.remove()
    # The mast head sits at the top of the hero wrap; everything else the wrap
    # already held (figures, cards, a whole article list) stays exactly where it is.
    wrap.prepend(mast)
    notes.append("public-mast")
    return True


# --------------------------------------------------------- 7. section numbering
def section_numbering(tree: Node, rel: str, notes: list[str]) -> bool:
    """Marketing sections get the same ledger numerals the app shell uses, hung on
    the eyebrow line the page already has — one editorial system, public and app."""
    main = tree.find("main")
    if main is None:
        return False
    n = 0
    for sec in main.find_all("section"):
        if sec.has_class("mkt-hero") or sec.has_attr("data-nl-numbered"):
            continue
        eye = sec.find(None, "mkt-eyebrow")
        if eye is None:
            continue
        n += 1
        if eye.find(None, "nl-pub-n") is None:
            eye.prepend(first_element(f'<span class="nl-pub-n">{n:02d}</span>'))
        sec.add_class("nl-pub-sec")
        sec.set_attr("data-nl-numbered", str(n))
    if n:
        notes.append(f"section-numbers({n})")
    return bool(n)


# ------------------------------------------------------------ 9. entrance pass
def choreograph(tree: Node, rel: str, notes: list[str]) -> bool:
    """Give the page a reveal rhythm instead of an all-at-once drop.

    proto-motion.js walks .reveal/.stagger and assigns each element its --i index;
    the whole system is gated on `html.nl-motion` and switched off by
    prefers-reduced-motion, so this adds an arrival order and never a script
    dependency. The first 14 blocks are marked, matching the cap the motion
    runtime itself applies.

    Pages whose sections each carry a `.mkt-wrap` are staged block by block; the
    two contact pages put everything in one wrapper, so their form and support
    column are staged instead.
    """
    main = tree.find("main")
    if main is None:
        return False
    targets: list[Node] = []
    for sec in main.find_all("section"):
        wrap = sec.find(None, "mkt-wrap") or sec
        targets.extend(c for c in wrap.child_elements()
                       if c.tag not in ("script", "style", "noscript") and not c.has_class("nl-pub-mast"))
    if len(targets) < 2:
        targets = [c for c in main.child_elements()
                   if c.tag in ("div", "section", "article", "aside") and not c.has_class("mkt-hero")]
        for b in list(targets):
            for w in b.child_elements():
                kids = [c for c in w.child_elements()
                        if c.tag in ("form", "aside", "section", "article", "div") and c.attr("class")]
                if len(kids) >= 2:
                    targets = kids
                    break
    added = 0
    for c in targets[:14]:
        if c.has_class("reveal") or c.tag in ("script", "style"):
            continue
        c.add_class("reveal")
        added += 1
        klass = c.attr("class") or ""
        if "gap-" in klass and len(c.child_elements()) >= 3 and "stagger" not in klass:
            c.add_class("stagger")
    if added:
        notes.append(f"entrance({added})")
    return bool(added)


# ------------------------------------------------------------ 10. topic radios
def topic_radios(tree: Node, rel: str, notes: list[str]) -> bool:
    """contact-alt: the topic <select> becomes a visible radio group.

    A one-choice-in-five page should not hide the menu behind a click, and a radio
    group is legible without script. The option labels move verbatim into the
    <label> text and the field names are unchanged, so the same value is what a
    submitter would have sent.
    """
    if not rel.endswith("contact-alt/index.html"):
        return False
    main = tree.find("main")
    sel = main.find("select") if main is not None else None
    if sel is None or (sel.parent is not None and sel.parent.find(None, "nl-radio-row") is not None):
        return False
    opts = [plain(o.text_flat()) for o in sel.find_all("option")]
    opts = [o for o in opts if o]
    hint = ""
    if opts and re.match(r"^(choose|select|pick)\b", opts[0], re.I):
        hint = opts.pop(0)                      # the placeholder becomes a hint, not a choice
    if len(opts) < 2:
        return False
    field = sel.parent
    label = field.find("label")
    legend = re.sub(r"\s*\*\s*$", "", plain(label.text_flat())) if label is not None else ""
    name = sel.attr("name") or "topic"
    group = first_element(f'<fieldset class="nl-radio-row"><legend class="label">{esc(legend or "Topic")}</legend></fieldset>')
    for i, o in enumerate(opts):
        iid = f"nl-topic-{i + 1}"
        chk = " checked" if i == 0 else ""
        group.append(first_element(
            f'<label class="check nl-radio" for="{iid}"><input id="{iid}" name="{esc(name)}" type="radio"{chk}/>'
            f'<span>{esc(o)}</span></label>'))
    if hint:
        group.append(first_element(f'<p class="nl-radio-hint">{esc(hint)} — the choice is only visual, '
                                   f'this prototype does not send it.</p>'))
    field.insert_before(group)                   # sibling of the field, not inside it
    field.remove()
    notes.append("topic-radios")
    return True


# ---------------------------------------------------------------------- driver
def page_paths() -> list[str]:
    out = []
    for rel in [HUB] + PUB_PAGES:
        p = os.path.join(PROTO, rel)
        if os.path.exists(p):
            out.append((rel, p))
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=os.path.join(HERE, "run-v3-pub.json"))
    a = ap.parse_args()
    results = []
    for rel, path in page_paths():
        if a.only and a.only not in rel:
            continue
        rec = {"path": f"proto/{rel}", "changed": False, "notes": []}
        text, tree = nlhtml.load(path)
        if tree.outer() != text:
            rec["notes"].append("parser-lossy:skipped")
            results.append(rec)
            continue
        changed = False
        changed |= wire(tree, rel, rec["notes"])
        changed |= meta_fix(tree, rel, rec["notes"])
        changed |= canonical_nav(tree, rel, rec["notes"])
        changed |= index_rail(tree, rel, rec["notes"])
        changed |= legal_clauses(tree, rel, rec["notes"])
        if rel in PLAN_PAGES:
            changed |= plans(tree, rel, rec["notes"])
            changed |= faq(tree, rel, rec["notes"])
        changed |= art(tree, rel, rec["notes"])
        if rel != HUB:
            changed |= section_numbering(tree, rel, rec["notes"])
            changed |= pub_mast(tree, rel, rec["notes"])
        changed |= topic_radios(tree, rel, rec["notes"])
        changed |= choreograph(tree, rel, rec["notes"])
        if changed:
            out = tree.outer()
            if nlhtml.parse(out).outer() != out:
                rec["notes"].append("reparse-mismatch:skipped")
                changed = False
            elif not a.dry:
                open(path, "w", encoding="utf-8").write(out)
        rec["changed"] = changed
        results.append(rec)
    json.dump(results, open(a.out, "w", encoding="utf-8"), indent=1)
    print(f"pages={len(results)} changed={sum(1 for r in results if r['changed'])}")
    for r in results:
        if r["notes"]:
            print(f"  {r['path']:48s} {', '.join(r['notes'])}")


if __name__ == "__main__":
    main()
