#!/usr/bin/env python3
"""Nestlancer · UPGRADE V3 — "Ledger" recomposer for client + admin app pages.

Composition contract written to every page under proto/apps/{web,admin}:

  main.content
    div.nl-root
      header.nl-mast ................ kicker+numeral · h1 · lede · fact chips · actions · motif art
      div.nl-tabs-wrap .............. the page's own view switcher, moved (behaviour untouched)
      div.nl-body.nl-has-rail
        div.nl-flow
          section.nl-sec[id] ........ one section per block-group, deep-linkable
            article.nl-card ......... from .panel: mark · title/sub · tools · body · counted foot
            div.nl-tbl > .nl-tblbar . measured ledger bar above every table
          aside.nl-rail ............. "On this page" · Ledger facts · Keys
      footer.nl-strip ............... counts, density cycle, copy-page-link

Safety model (all asserted at runtime):
  * the parser round-trips every file byte-for-byte, so untouched markup cannot drift;
  * content is moved, never deleted — a token-preservation guard fails the page instead;
  * new ids are namespaced and checked against the page's existing ids;
  * script/style/attribute values are never rewritten.

Usage: python3 upgrade-v3/implement-v3.py [--paths p.json] [--limit N] [--dry]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROTO = os.path.join(ROOT, "proto")
sys.path.insert(0, HERE)

from nlhtml import Node, first_element, parse  # noqa: E402

# --------------------------------------------------------------------------- art
MAST_ART = {
    "people": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="2" y="14" width="46" height="64" rx="8" stroke-opacity=".5"/><circle cx="25" cy="34" r="8"/><path d="M11 62c3-8 10-12 14-12s11 4 14 12" stroke-opacity=".75"/><path d="M58 30h24M58 44h34M58 58h20M58 72h30" stroke-opacity=".45"/><rect x="96" y="22" width="34" height="20" rx="6"/><path d="M103 32h20" stroke-opacity=".6"/><circle cx="113" cy="60" r="11"/><path d="M113 53v7l5 3"/></svg>',
    "work": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="4" y="18" width="36" height="56" rx="7"/><path d="M12 32h20M12 44h20M12 56h12" stroke-opacity=".55"/><path d="M44 46h18"/><rect x="66" y="30" width="30" height="32" rx="7"/><path d="M74 42h14M74 52h9" stroke-opacity=".55"/><path d="M100 46h14"/><rect x="118" y="36" width="12" height="20" rx="5"/><circle cx="124" cy="20" r="5"/><path d="M4 82h60" stroke-opacity=".35"/><path d="M4 10h44" stroke-opacity=".35"/></svg>',
    "money": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="6" y="20" width="52" height="34" rx="7"/><path d="M6 32h52" stroke-opacity=".5"/><path d="M14 44h14" stroke-opacity=".7"/><path d="M66 37h18M84 30l7 7-7 7" stroke-opacity=".7"/><rect x="92" y="20" width="34" height="52" rx="6"/><path d="M99 32h20M99 42h20M99 52h12" stroke-opacity=".5"/><circle cx="115" cy="64" r="4"/><path d="M14 66h30" stroke-opacity=".3"/></svg>',
    "mail": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="6" y="22" width="50" height="34" rx="7"/><path d="M8 25l23 17 23-17" stroke-opacity=".7"/><rect x="70" y="14" width="56" height="28" rx="7"/><path d="M79 25h28M79 33h18" stroke-opacity=".5"/><rect x="70" y="52" width="44" height="26" rx="7"/><path d="M79 63h22" stroke-opacity=".5"/><path d="M60 40h6" stroke-opacity=".35"/><circle cx="122" cy="66" r="9"/><path d="M122 61v6l4 2"/></svg>',
    "media": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="4" y="16" width="44" height="34" rx="6"/><path d="M12 42l10-11 8 8 6-5 8 8" stroke-opacity=".7"/><rect x="4" y="58" width="20" height="20" rx="5"/><rect x="28" y="58" width="20" height="20" rx="5"/><rect x="56" y="16" width="30" height="62" rx="6"/><path d="M62 30h18M62 42h18M62 54h10" stroke-opacity=".45"/><rect x="94" y="40" width="34" height="38" rx="7"/><path d="M102 58h16M102 66h9" stroke-opacity=".55"/><circle cx="111" cy="50" r="3.5"/><path d="M94 24h34" stroke-opacity=".4"/></svg>',
    "system": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="8" y="14" width="48" height="30" rx="7"/><path d="M16 24h20M16 34h30" stroke-opacity=".5"/><rect x="8" y="52" width="22" height="26" rx="6"/><rect x="34" y="52" width="22" height="26" rx="6"/><path d="M42 8h44" stroke-opacity=".3"/><rect x="68" y="34" width="30" height="30" rx="15"/><circle cx="83" cy="49" r="4"/><path d="M83 38v4M83 56v4M72 49h4M90 49h4" stroke-opacity=".6"/><rect x="104" y="16" width="24" height="46" rx="7"/><path d="M110 26h12M110 36h12M110 46h8" stroke-opacity=".45"/><path d="M104 70h24" stroke-opacity=".3"/></svg>',
    "content": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="6" y="12" width="56" height="68" rx="8"/><path d="M16 28h36M16 40h36M16 52h22" stroke-opacity=".5"/><rect x="16" y="60" width="16" height="10" rx="3" stroke-opacity=".7"/><rect x="72" y="24" width="54" height="26" rx="7"/><path d="M80 34h30M80 42h18" stroke-opacity=".5"/><rect x="72" y="58" width="54" height="24" rx="7"/><path d="M80 68h24" stroke-opacity=".5"/><circle cx="62" cy="18" r="5"/></svg>',
    "security": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><path d="M28 12l20 7v18c0 14-8 22-20 27-12-5-20-13-20-27V19z"/><path d="M18 40l7 7 14-14" stroke-opacity=".8"/><rect x="60" y="34" width="34" height="26" rx="7"/><path d="M67 34v-7a10 10 0 0 1 20 0v7" stroke-opacity=".6"/><circle cx="77" cy="47" r="3"/><path d="M77 50v5" stroke-opacity=".6"/><rect x="102" y="20" width="26" height="52" rx="7"/><path d="M108 32h14M108 42h14M108 52h9" stroke-opacity=".45"/></svg>',
    "chart": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><path d="M8 14v64h118" stroke-opacity=".4"/><path d="M18 62l18-16 16 9 20-27 16 11 22-22" stroke-opacity=".9"/><rect x="16" y="66" width="10" height="12" rx="3" stroke-opacity=".4"/><rect x="34" y="58" width="10" height="20" rx="3" stroke-opacity=".4"/><rect x="52" y="62" width="10" height="16" rx="3" stroke-opacity=".4"/><rect x="70" y="48" width="10" height="30" rx="3" stroke-opacity=".4"/><rect x="88" y="54" width="10" height="24" rx="3" stroke-opacity=".4"/><rect x="106" y="40" width="10" height="38" rx="3" stroke-opacity=".4"/><circle cx="36" cy="46" r="2.5"/><circle cx="72" cy="38" r="2.5"/><circle cx="110" cy="30" r="2.5"/></svg>',
    "flow": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="4" y="34" width="26" height="24" rx="7"/><path d="M32 46h14" stroke-opacity=".6"/><rect x="48" y="14" width="28" height="24" rx="7"/><rect x="48" y="54" width="28" height="24" rx="7"/><path d="M46 46l10-18M46 46l10 18" stroke-opacity=".6"/><path d="M78 26h14M78 66h14" stroke-opacity=".6"/><rect x="94" y="40" width="34" height="30" rx="8"/><path d="M102 52h18M102 60h10" stroke-opacity=".5"/><circle cx="111" cy="24" r="7" stroke-opacity=".6"/></svg>',
    "settings": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><path d="M6 26h52M6 46h52M6 66h52" stroke-opacity=".3"/><circle cx="30" cy="26" r="6"/><circle cx="46" cy="46" r="6"/><circle cx="20" cy="66" r="6"/><rect x="72" y="16" width="54" height="26" rx="8"/><path d="M80 29h22" stroke-opacity=".5"/><circle cx="112" cy="29" r="6"/><rect x="72" y="50" width="54" height="26" rx="8"/><path d="M80 63h30" stroke-opacity=".5"/><circle cx="98" cy="63" r="6"/></svg>',
    "quote": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><rect x="8" y="12" width="52" height="68" rx="8"/><path d="M18 26h32M18 36h32M18 46h20" stroke-opacity=".45"/><rect x="18" y="58" width="18" height="12" rx="3" stroke-opacity=".7"/><rect x="70" y="24" width="56" height="22" rx="7"/><path d="M78 35h26" stroke-opacity=".55"/><rect x="70" y="54" width="56" height="26" rx="7"/><path d="M78 64h22M78 72h34" stroke-opacity=".45"/></svg>',
    "chat": '<svg viewBox="0 0 132 92" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-artwork="v3-mast"><path d="M6 20h44v28H22l-10 9V48H6z" stroke-opacity=".8"/><path d="M14 30h28M14 39h20" stroke-opacity=".45"/><path d="M60 40h46v26H84l-9 8v-8H60z"/><path d="M68 50h30M68 58h16" stroke-opacity=".45"/><rect x="110" y="14" width="18" height="18" rx="6"/><path d="M115 23h8" stroke-opacity=".6"/><path d="M86 18h40" stroke-opacity=".3"/></svg>',
}

CARD_MARK = {
    "lock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/></svg>',
    "device": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="2" y="4" width="14" height="11" rx="2"/><path d="M2 18h11"/><rect x="17" y="9" width="5" height="11" rx="2"/></svg>',
    "bell": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/></svg>',
    "card": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h5"/></svg>',
    "doc": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
    "image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M5 17l4.5-4.5 3 3L16 12l3 3"/></svg>',
    "people": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.4a3.4 3.4 0 0 1 0 5.2M17.5 20a6.4 6.4 0 0 0-2-4.4"/></svg>',
    "chart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M3 20h18"/><path d="M6 20V9M11 20V4M16 20v-7M21 20v-4" stroke-opacity=".8"/></svg>',
    "flow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="2" y="3" width="7" height="6" rx="2"/><rect x="15" y="15" width="7" height="6" rx="2"/><path d="M5.5 9v5a3 3 0 0 0 3 3H15"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M12 2.5l7.5 2.6v6.2c0 4.6-3 7.4-7.5 9-4.5-1.6-7.5-4.4-7.5-9V5.1z"/><path d="M8.6 12l2.5 2.5 4.3-4.6"/></svg>',
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2.2"/></svg>',
    "key": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><circle cx="8" cy="14" r="4.5"/><path d="M11.5 11.5L20 3M16 7l3 3M13 10l2.5 2.5"/></svg>',
    "folder": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    "tag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
    "list": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M8 7h13M8 12h13M8 17h9"/><circle cx="4" cy="7" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="17" r="1"/></svg>',
    "spark": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M3 17l5-6 4 3 4-6 5 5"/></svg>',
    "gear": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></svg>',
    "flag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M5 21V4M5 5h13l-2.5 4L18 13H5"/></svg>',
    "layers": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M12 3l8 4.5-8 4.5-8-4.5z"/><path d="M4 12.5l8 4.5 8-4.5"/><path d="M4 17l8 4.5 8-4.5" stroke-opacity=".6"/></svg>',
    "plug": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/></svg>',
    "table": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/></svg>',
    "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-artwork="v3-mark"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.4-4.4"/></svg>',
}
MARK_RULES = [
    (("password", "2fa", "authenticat", "totp", "recovery", "passkey"), "lock"),
    (("session", "device", "browser", "sign-out", "sign out"), "device"),
    (("notification", "alert", "digest", "reminder", "email template"), "bell"),
    (("payment", "invoice", "billing", "payout", "refund", "dispute", "escrow", "ledger", "tax", "gst"), "card"),
    (("contract", "agreement", "msa", "sow", "terms", "policy", "statement", "legal", "document"), "doc"),
    (("media", "image", "asset", "gallery", "photo", "video", "thumbnail", "browse"), "image"),
    (("user", "people", "team", "staff", "client", "account", "profile", "member", "owner", "operator"), "people"),
    (("metric", "stat", "analytic", "report", "chart", "revenue", "usage", "volume"), "chart"),
    (("pipeline", "workflow", "stage", "timeline", "process", "delivery", "milestone", "status", "track", "history", "activity", "log"), "flow"),
    (("message", "inbox", "thread", "reply", "comment", "conversation", "contact", "correspond"), "mail"),
    (("security", "permission", "role", "access", "audit", "moderation", "quarantine", "verif", "trust", "risk", "blocklist"), "shield"),
    (("folder", "storage", "collection", "library", "stack", "archive", "quota", "cache"), "folder"),
    (("integration", "api", "webhook", "connect", "sync", "token", "key", "secret"), "key"),
    (("tag", "label", "categor", "topic", "filter", "segment"), "tag"),
    (("search", "find", "query", "index"), "search"),
    (("table", "record", "row", "list", "catalog", "portfolio", "blog", "post", "content", "queue"), "list"),
    (("trend", "performance", "uptime", "health", "score", "signal", "overview", "summary"), "spark"),
    (("setting", "config", "preference", "system", "maintenance", "feature", "toggle", "default"), "gear"),
    (("flag", "incident", "escalat", "announce", "attention", "watch"), "flag"),
    (("layer", "stack", "section", "group"), "layers"),
    (("plug", "provider", "gateway", "connector"), "plug"),
    (("schedule", "deadline", "due", "sla", "window", "next"), "clock"),
]

FAM_SERVICE = {
    "people": "users.openapi.json", "work": "projects.openapi.json", "money": "payments.openapi.json",
    "quote": "quotes.openapi.json", "mail": "messaging.openapi.json", "chat": "messaging.openapi.json",
    "media": "media.openapi.json", "system": "admin.openapi.json", "content": "blog.openapi.json",
    "security": "auth.openapi.json", "settings": "auth.openapi.json", "chart": "progress.openapi.json",
    "flow": "requests.openapi.json",
}

FAM_LABEL = {
    "people": "People", "work": "Delivery", "money": "Money", "mail": "Correspondence",
    "media": "Media", "system": "System", "content": "Content", "security": "Access",
    "chart": "Signals", "flow": "Workspace", "settings": "Account", "quote": "Quotes",
    "chat": "Inbox",
}

ICON = {
    "collapse": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    "link": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5a4.5 4.5 0 0 0 6.7.5l2-2a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M13.5 10.5a4.5 4.5 0 0 0-6.7-.5l-2 2a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/></svg>',
    "density": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    "up": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    "unfold": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
}

BLOCK_STARTERS = ("panel", "tbl-wrap", "stats", "state-deck", "sec-head", "kpi-grid", "chat-grid",
                  "state-matrix", "doc-layout", "blog-layout", "qsteps-layout", "empty", "dropzone",
                  "filterbar", "grid", "flex-col", "hub-preview")


# --------------------------------------------------------------------- utilities
def esc(s: str) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def frag(html: str) -> Node:
    return first_element(html)


def el(tag: str, attrs=None, inner: str = "") -> Node:
    a = "".join(f" {k}" if v is None else f' {k}="{esc(v)}"' for k, v in (attrs or []))
    return frag(f"<{tag}{a}>{inner}</{tag}>")


def move(node: Node, parent: Node) -> Node:
    if node.parent is not None:
        node.parent.children.remove(node)
    parent.append(node)
    return node


def add_class(node: Node, *cls):
    cur = node.attr("class") or ""
    parts = []
    for p in cur.split():
        if p not in parts:
            parts.append(p)
    changed = False
    for c in cls:
        if c and c not in parts:
            parts.append(c)
            changed = True
    if changed:
        node.set_attr("class", " ".join(parts))


def swap_class(node: Node, old: str, new: str):
    cur = node.attr("class") or ""
    parts = []
    for p in cur.split():
        p = new if p == old else p
        if p not in parts:
            parts.append(p)
    if new not in parts:
        parts.append(new)
    node.set_attr("class", " ".join(parts))


def retag(node: Node, tag: str):
    node.tag = tag
    node.open_raw = re.sub(r"^</?\s*[\w:-]+", f"<{tag}", node.open_raw, count=1)


def strip_tags(html: str) -> str:
    txt = re.sub(r"<[^>]+>", " ", html)
    txt = txt.replace("&amp;", "&").replace("&nbsp;", " ").replace("&#8377;", "₹")
    return re.sub(r"\s+", " ", txt).strip()


def tokens(txt: str):
    return set(re.findall(r"[A-Za-z0-9₹@.\-_/]{4,}", txt))


def mark_for(text: str) -> str:
    t = (text or "").lower()
    for keys, name in MARK_RULES:
        if any(k in t for k in keys):
            return name
    return "list"


def family_of(path: str) -> str:
    p = path.replace("\\", "/").lower()
    if any(k in p for k in ("/messages/", "/inbox", "/thread", "/contact")):
        return "chat" if ("inbox" in p or "thread" in p) else "mail"
    if any(k in p for k in ("/users", "/profile", "/staff", "/accounts", "/pipeline/users")):
        return "people"
    if any(k in p for k in ("/payment", "/invoice", "/billing", "/dispute", "/quotes", "/requests")):
        return "money" if "payment" in p or "invoice" in p or "billing" in p else "quote"
    if any(k in p for k in ("/media", "/upload", "/folders", "/files", "/storage", "/quarantine")):
        return "media"
    if any(k in p for k in ("/system", "/integrations", "/api-keys", "/moderation", "/audit", "/maintenance")):
        return "system"
    if any(k in p for k in ("/content", "/blog", "/posts", "/portfolio")):
        return "content"
    if any(k in p for k in ("/settings", "/notifications", "/security", "/sessions", "/activity")):
        return "security"
    if any(k in p for k in ("/analytics", "/stats", "/health", "/logs", "/jobs")):
        return "chart"
    if any(k in p for k in ("/projects", "/pipeline", "/dashboard")):
        return "work"
    return "flow"


class IdPool:
    def __init__(self, existing):
        self.seen = set(existing)
        self.n = 0

    def next(self, prefix):
        while True:
            self.n += 1
            pid = f"{prefix}-{self.n:02d}"
            if pid not in self.seen:
                self.seen.add(pid)
                return pid


def sparkline(seed: str, tone: str) -> str:
    """Deterministic decorative sparkline. It mirrors the trend badge already on
    the stat (up / down / flat) and is aria-hidden — it asserts nothing new."""
    h = 7
    for ch in seed:
        h = (h * 131 + ord(ch)) & 0xFFFFFF
    ys = []
    y = 14 if tone == "flat" else (18 if tone == "up" else 8)
    for _ in range(9):
        h = (h * 1103515245 + 12345) & 0x7FFFFFFF
        y = max(5, min(20, y + ((h >> 9) % 5) - 2))
        ys.append(y)
    if tone == "up":
        ys = [max(4, min(20, v - (8 - i) * 1.4)) for i, v in enumerate(ys)]
    elif tone == "down":
        ys = [max(4, min(20, v + (8 - i) * -1.2 + 9)) for i, v in enumerate(ys)]
    pts = " ".join(f"{2 + i * 7}:{int(v)}" for i, v in enumerate(ys))
    d = "M" + " L".join(pts.split())
    return f'<svg class="nl-spark" viewBox="0 0 64 24" aria-hidden="true" focusable="false"><path d="{d}" data-artwork="v3-spark"/></svg>'


# ------------------------------------------------------------------- the rebuild
def build_mast(main: Node, ctx: dict) -> Node:
    pband = None
    for c in main.child_elements():
        if c.has_class("pband"):
            pband = c
            break
    mast = el("header", [("class", "nl-mast reveal")])
    left = el("div", [("class", "nl-mast-l")])
    right = el("div", [("class", "nl-mast-r")])
    head = None
    tabs = None
    notes = []
    title = None
    if pband is not None:
        head = pband.find(None, "phead") or pband
        tabs = pband.find(None, "tabs")
        title = head.find("h1") or head.find(None, "ptitle")
        for c in list(pband.child_elements()):
            if c is head or c is tabs:
                continue
            if c.tag == "p" and (c.has_class("wb-ref-note") or c.has_class("pnote") or not c.classes()):
                notes.append(c)
    eyebrow = head.find(None, "eyebrow") if head is not None else None
    sub = head.find(None, "psub") if head is not None else None
    if sub is None and head is not None:
        sub = head.find("p")
    actions = head.find(None, "phead-actions") if head is not None else None
    chips_src = []
    if head is not None:
        # A badge row is a wrapper whose element children are all badges/chips.
        for w in head.child_elements():
            kids = w.child_elements()
            if kids and all(k.has_class("badge") or k.has_class("chip") or k.has_class("dot") for k in kids):
                chips_src.extend(kids)
        if len(chips_src) > 7:
            chips_src = chips_src[:7]
    total = max(1, ctx["panel_count"] or 1)
    ctx["sections_total"] = total

    eyebrow_text = re.sub(r"\s+", " ", (eyebrow.text_flat() if eyebrow is not None else "")).strip()
    if not eyebrow_text:
        eyebrow_text = FAM_LABEL[ctx["fam"]]
    kicker = el("div", [("class", "nl-kicker")])
    kicker.append(frag(f'<span class="nl-kicker-i" aria-hidden="true">01/{total:02d}</span>'))
    kicker.append(frag(f'<span class="nl-kicker-t">{esc(eyebrow_text)}</span>'))
    kicker.append(frag('<span class="nl-kicker-line" aria-hidden="true"></span>'))
    left.append(kicker)

    if title is None and main.find("h1") is not None:
        # the page already owns an <h1> further down (chat headers do); the mast
        # must not mint a second one, so it stays a kicker + facts band.
        ctx["mast_title"] = "h1-lower"
        title = main.find("h1")
        ctx["title_id"] = title.attr("id")
        title = None
    elif title is None:
        tid = ctx["ids"].next("nl-t")
        left.append(frag(f'<h1 class="nl-title" id="{tid}">{esc(ctx["page_title"])}</h1>'))
        ctx["title_id"] = tid
    if title is not None:
        move(title, left)
        swap_class(title, "ptitle", "nl-title")
        add_class(title, "nl-title")
        if not title.has_attr("id"):
            title.set_attr("id", ctx["ids"].next("nl-t"))
        ctx["title_id"] = title.attr("id")
    if sub is not None:
        owner = sub.parent
        move(sub, left)
        if sub.tag != "p":
            retag(sub, "p")
        swap_class(sub, "psub", "nl-lede")
        add_class(sub, "nl-lede")
        if owner is not None and owner is not left and owner is not mast and not owner.child_elements():
            owner.remove()
    if eyebrow is not None:
        owner = eyebrow.parent
        eyebrow.remove()
        if owner is not None and owner is not left and not owner.child_elements() and owner.parent is not None:
            owner.remove()

    chips = el("ul", [("class", "nl-tags"), ("role", "list"), ("aria-label", "Page facts")])
    tone_map = {"tone-success": "ok", "tone-warning": "warn", "tone-danger": "bad", "tone-info": "info", "tone-brand": "info", "tone-neutral": "muted", "tone-default": "muted"}
    for n in chips_src:
        if n.parent is None:
            continue
        cls = n.attr("class") or ""
        tone = "muted"
        for k, v in tone_map.items():
            if k in cls:
                tone = v
        keep = " ".join(c for c in cls.split() if c not in ("badge", "chip") and not c.startswith("tone-"))
        move(n, chips)
        retag(n, "li")
        n.set_attr("class", (keep + " nl-tag").strip())
        n.set_attr("data-tone", tone)
    facts = page_facts(ctx)
    for k, v in facts:
        chips.append(frag(f'<li class="nl-tag" data-tone="{v[1]}"><span class="nl-tag-k">{esc(k)}</span>{esc(v[0])}</li>'))
    left.append(chips)
    if not chips.children:
        chips.remove()
    # the rail carries the API cross-reference instead of a crowded head

    mast.append(left)
    acts_box = el("div", [("class", "nl-mast-actions")])
    if actions is not None:
        for c in list(actions.children):
            if isinstance(c, Node):
                move(c, acts_box)
        note = actions.find(None, "text-xs")
        if actions.parent is not None:
            actions.remove()
    if acts_box.children:
        right.append(acts_box)
    for n in notes:
        add_class(n, "nl-mast-note")
        move(n, right)
    if right.children:
        mast.append(right)
    art = el("div", [("class", "nl-mast-art"), ("aria-hidden", "true"), ("data-nl-art", ctx["fam"])])
    art.append(frag(MAST_ART[ctx["fam"]]))
    mast.append(art)
    return mast


def page_facts(ctx: dict):
    out = []
    kind = {"list": "List view", "detail": "Record view", "form": "Form", "record": "Record view",
            "overview": "Overview", "dashboard": "Dashboard"}.get(ctx["kind"], "View")
    out.append(("view", (kind, "info")))
    if ctx.get("rows"):
        out.append(("rows", (f"{ctx['rows']} sample", "muted")))
    if ctx.get("cards"):
        out.append(("blocks", (str(ctx["cards"]), "muted")))
    out.append(("theme", ("light · dark", "muted")))
    return out


def classify(main: Node, path: str) -> str:
    t = main.outer()
    if re.search(r"<form\b", t):
        return "form"
    if re.search(r'class="[^"]*\bfilterbar\b', t) or re.search(r'<table\b', t):
        return "list"
    if re.search(r'class="[^"]*\bstats\b', t):
        return "overview"
    if "/dashboard" in path:
        return "dashboard"
    if re.search(r'\b(id|Id)\b["\s:>]{1,4}[0-9a-f]{8}', t):
        return "record"
    return "detail"


def panel_to_card(panel: Node, ctx: dict, sec_id: str) -> str | None:
    """Converts a .panel into article.nl-card. Returns the card's title text.

    A <label class="panel check"> stays a label (retagging it would break the
    checkbox association) and a link card never gains nested interactive tools.
    """
    if panel.tag == "label":
        add_class(panel, "nl-card-label")
        return None
    is_link_panel = panel.tag == "a"
    head = panel.find(None, "panel-head")
    title_node = None
    title_text = ""
    if head is not None:
        title_node = head.find(None, "panel-title") or head.find("h2") or head.find("h3") or head.find("h4")
        sub_node = head.find(None, "panel-sub")
        title_text = title_node.text_flat() if title_node is not None else "Details"
        tools_src = [c for c in head.child_elements()
                     if c is not title_node and c is not sub_node and c is not (title_node.parent if title_node else None)]
        # the wrapper holding the title should stay as the tt slot
        tt = el("div", [("class", "nl-card-tt")])
        if title_node is not None:
            holder = title_node.parent
            move(title_node, tt)
            swap_class(title_node, "panel-title", "nl-card-t")
            add_class(title_node, "nl-card-t")
            if not title_node.has_attr("id"):
                title_node.set_attr("id", ctx["ids"].next("nl-ct"))
            ctx["last_title_id"] = title_node.attr("id")
            if holder is not None and holder is not head and not holder.children:
                holder.remove()
        if sub_node is not None:
            holder2 = sub_node.parent
            move(sub_node, tt)
            add_class(sub_node, "nl-card-s")
            if holder2 is not None and holder2 is not head and not holder2.children:
                holder2.remove()
        if not tt.children:
            tt.append(frag(f'<h2 class="nl-card-t" id="{ctx["ids"].next("nl-ct")}">{esc(title_text or "Details")}</h2>'))
            ctx["last_title_id"] = tt.children[0].attr("id")
        tools_box = el("div", [("class", "nl-card-tools")])
        for c in list(head.child_elements()):
            if c is tt or is_link_panel:
                continue
            kids = list(c.child_elements()) if c.tag in ("div", "span") else [c]
            for kid in kids:
                if kid is tt or kid.parent is None:
                    continue
                interactive = (kid.has_class("btn") or kid.tag == "button"
                               or (kid.tag == "a" and kid.has_attr("href"))
                               or kid.find("button") is not None or kid.find("a") is not None)
                if interactive:
                    move(kid, tools_box)
            if not c.child_elements() and not c.text().strip():
                c.remove()
        head.add_class("nl-card-hd")
        swap_class(head, "panel-head", "nl-card-hd")
        mark = el("span", [("class", "nl-card-mark"), ("aria-hidden", "true"), ("data-nl-art", mark_for(title_text))])
        mark.append(frag(CARD_MARK[mark_for(title_text)]))
        head.prepend(mark)
        head.append(tt)
        if tools_box.children:
            head.append(tools_box)
        if not is_link_panel:
            head.append(frag(f'<button class="nl-tool" type="button" data-nl-copy="#{sec_id}" '
                             f'aria-label="Copy link to {esc(title_text or "this section")}" title="Copy link to this card">'
                             f'{ICON["link"]}</button>'))
    body = panel.find(None, "panel-body")
    if body is None:
        body = el("div", [("class", "nl-card-bd")])
        kids = [c for c in panel.child_elements()
                if not c.has_class("nl-card-hd") and not c.has_class("panel-foot") and not c.has_class("panel-row")]
        rows = [c for c in panel.child_elements() if c.has_class("panel-row")]
        if kids:
            kids[0].insert_before(body)
            for k in kids:
                move(k, body)
        elif rows:
            panel.append(body)
        else:
            panel.append(body)
    else:
        swap_class(body, "panel-body", "nl-card-bd")
        add_class(body, "nl-card-bd")
    rows_in_body = body.find_all(None, "panel-row")
    if not is_link_panel:
        retag(panel, "article")
    else:
        # a clickable summary card stays an <a>: no nested interactive controls
        panel.set_attr("data-nl-linkcard", "true")
    cls = " ".join(c for c in (panel.attr("class") or "").split() if c != "panel")
    panel.set_attr("class", ("nl-card " + cls).strip())
    panel.set_attr("data-nl-card", mark_for(title_text))
    ctx["cards"] = ctx.get("cards", 0) + 1

    # tables inside the card body get a measured ledger bar
    for table in body.find_all("table"):
        add_table_bar(table, ctx)
    # an honest footer describing what the card actually holds
    foot = panel.find(None, "panel-foot")
    if foot is not None:
        swap_class(foot, "panel-foot", "nl-card-ft")
        add_class(foot, "nl-card-ft")
    elif not is_link_panel:
        measured = measure(body, rows_in_body)
        if measured:
            ft = el("footer", [("class", "nl-card-ft")])
            ft.append(frag(f'<span class="nl-tbl-n">{esc(measured)}</span>'))
            ft.append(frag(f'<span class="nl-tag" data-tone="muted">fixture data</span>'))
            panel.append(ft)
    return title_text or None


def measure(body: Node, rows) -> str:
    """Foot lines state only what can be counted in the card itself."""
    bits = []
    if rows:
        bits.append(f"{len(rows)} row{'s' if len(rows) != 1 else ''}")
    inputs = len([i for i in body.find_all("input") if 'type="hidden"' not in i.outer()]) + len(body.find_all("select")) + len(body.find_all("textarea"))
    if inputs:
        bits.append(f"{inputs} input{'s' if inputs != 1 else ''}")
    dts = len(body.find_all("dt"))
    if dts and not inputs:
        bits.append(f"{dts} detail{'s' if dts != 1 else ''}")
    tables = body.find_all("table")
    if tables:
        n = sum(max(0, len(t.find_all("tr")) - (1 if t.find("thead") else 0)) for t in tables)
        if n:
            bits.append(f"{n} record{'s' if n != 1 else ''}")
    links = len([a for a in body.find_all("a") if a.has_attr("href")])
    if links and not inputs and not dts and not rows:
        bits.append(f"{links} link{'s' if links != 1 else ''}")
    return " · ".join(bits)


def add_table_bar(table: Node, ctx: dict):
    wrap = table.parent if table.parent and table.parent.has_class("tbl-wrap") else None
    anchor = wrap or table
    parent = anchor.parent
    if parent is None:
        return
    if any(isinstance(c, Node) and c.has_class("nl-tblbar") for c in parent.children):
        return
    thead = table.find("thead")
    head_row = thead.find("tr") if thead is not None else None
    n_rows = max(0, len(table.find_all("tr")) - (1 if head_row is not None else 0))
    n_cols = len(head_row.find_all("th")) if head_row is not None else 0
    cap = table.find("caption")
    label = (cap.text_flat() if cap is not None else "") or (table.attr("aria-label") or "Records")
    ctx["rows"] = ctx.get("rows", 0) + n_rows
    box = el("div", [("class", "nl-tbl")])
    box.append(frag(f'<div class="nl-tblbar"><span class="nl-tbl-n"><b>{n_rows}</b> row{"s" if n_rows != 1 else ""}</span>'
                    f'<span class="nl-tbl-sep" aria-hidden="true"></span>'
                    f'<span class="nl-tbl-note">{esc(label)}'
                    + (f' · {n_cols} column{"s" if n_cols != 1 else ""}' if n_cols else "") + "</span></div>"))
    anchor.insert_before(box)
    move(anchor, box)


def stats_to_ledger(stats: Node, ctx: dict):
    add_class(stats, "nl-kpis")
    items = [c for c in stats.child_elements()]
    for i, stat in enumerate(items):
        add_class(stat, "nl-kpi")
        lab = stat.find(None, "stat-label")
        val = stat.find(None, "stat-value")
        note = stat.find(None, "stat-note")
        if lab is not None:
            add_class(lab, "nl-kpi-l")
        if val is not None:
            add_class(val, "nl-kpi-v")
        tone = "flat"
        if note is not None:
            add_class(note, "nl-kpi-n")
            if note.has_class("up") or "↑" in note.text():
                tone = "up"
            elif note.has_class("down") or "↓" in note.text():
                tone = "down"
            note.set_attr("data-dir", tone)
        stat.append(frag(sparkline((lab.text_flat() if lab is not None else "series") + str(i), tone)))
        ctx["stats"] = ctx.get("stats", 0) + 1
    return len(items)


def group_blocks(nodes):
    groups = []
    cur = []
    for n in nodes:
        is_panel = n.has_class("panel")
        is_stats = n.has_class("stats")
        starter = is_panel or is_stats or any(n.has_class(c) for c in BLOCK_STARTERS)
        if starter and (is_panel or is_stats or n.has_class("grid") or n.has_class("flex-col")):
            if cur:
                groups.append(("misc", cur))
                cur = []
            groups.append(("stats" if is_stats else "panel" if is_panel else "block", [n]))
        else:
            cur.append(n)
    if cur:
        groups.append(("misc", cur))
    return groups


CLASS_LABELS = [
    (("stats",), "Signal strip"),
    (("filterbar",), "Refine the list"),
    (("wb-filter-meta",), "Filter result"),
    (("tabs",), "Views"),
    (("empty", "wb-empty"), "Nothing in this view"),
    (("pager",), "Pagination"),
    (("dropzone",), "Upload"),
    (("state-deck", "state-matrix"), "Recorded states"),
    (("note",), "Prototype note"),
    (("chat-grid",), "Conversation"),
    (("tline",), "Timeline"),
    (("doc-layout", "blog-layout", "prose"), "Written record"),
    (("dl", "kv"), "Details"),
    (("grid", "flex-col"), "Related blocks"),
]
WORD_LABELS = [
    (("no open", "no results", "nothing here", "empty"), "Nothing in this view"),
    (("prototype", "sample", "fixture", "not included"), "Prototype note"),
    (("related", "linked", "recent"), "Linked records"),
    (("evidence", "document", "file", "attachment"), "Documents"),
    (("risk", "flags", "attention"), "Signals"),
]


def label_for(nodes) -> str:
    for n in nodes:
        cls = n.attr("class") or ""
        for keys, lab in CLASS_LABELS:
            if any(f" {k}" in f" {cls}" or cls.startswith(k) for k in keys):
                return lab
    words = " ".join(n.text_flat() for n in nodes[:3]).lower()
    for keys, lab in WORD_LABELS:
        if any(k in words for k in keys):
            return lab
    for n in nodes:
        for tag in ("h2", "h3"):
            h = n.find(tag)
            if h is not None and len(h.text_flat()) <= 48:
                return h.text_flat()
    return "On this page"


def recompose(main: Node, ctx: dict):
    """Rebuilds <main> as the v3 shell. Blocks are only ever moved or wrapped."""
    root = el("div", [("class", "nl-root")])
    kids = [c for c in main.child_elements()]
    if not kids:
        return False
    pband = next((k for k in kids if k.has_class("pband")), None)

    # ---- masthead (absorbs the page head band) ------------------------------
    stash = []
    tabs = pband.find(None, "tabs") if pband is not None else None
    mast = build_mast(main, ctx)
    if pband is not None:
        for c in list(pband.child_elements()):
            if c is tabs:
                continue
            if not c.child_elements() and not c.text().strip():
                c.remove()          # whitespace-only wrapper
                continue
            c.parent.children.remove(c)
            c.parent = None
            stash.append(c)         # stashed, never dropped: re-emitted below
        pband.remove()
    tabs_wrap = None
    if tabs is not None:
        tabs_wrap = el("div", [("class", "nl-tabs-wrap")])
        move(tabs, tabs_wrap)
        add_class(tabs, "nl-tabs")

    if ctx["stats_node"] is not None:
        stats_to_ledger(ctx["stats_node"], ctx)
        add_class(ctx["stats_node"], "reveal")

    # ---- sections -----------------------------------------------------------
    flow = el("div", [("class", "nl-flow")])
    sections = []
    sec_label = {}
    for kind, nodes in group_blocks([c for c in main.child_elements()]):
        sec = el("section", [("class", "nl-sec"), ("id", ctx["ids"].next("nl-s"))])
        bd = el("div", [("class", "nl-sec-bd")])
        has_panel = any(n.has_class("panel") for n in nodes)
        for n in nodes:
            move(n, bd)
        if not has_panel:
            hd = el("div", [("class", "nl-sec-hd")])
            hid = ctx["ids"].next("nl-sh")
            label = label_for(nodes)
            hd.append(frag(f'<span class="nl-idx" aria-hidden="true">{len(sections) + 1:02d}</span>'))
            tt = el("div", [("class", "nl-sec-tt")])
            tt.append(frag(f'<h2 class="nl-sec-t" id="{hid}">{esc(label)}</h2>'))
            sub = lead_of(nodes)
            if sub:
                tt.append(frag(f'<p class="nl-sec-s">{esc(sub)}</p>'))
            hd.append(tt)
            hd.append(section_tools(sec.attr("id"), ctx))
            sec.append(hd)
            sec.set_attr("aria-labelledby", hid)
            sec.set_attr("data-nl-group", "plain")
            sec_label[id(sec)] = label
        else:
            sec.set_attr("data-nl-group", "cards")
        sec.append(bd)
        flow.append(sec)
        sections.append(sec)
    if stash:
        sec = el("section", [("class", "nl-sec"), ("id", ctx["ids"].next("nl-s"))])
        bd = el("div", [("class", "nl-sec-bd")])
        for n in stash:
            move(n, bd)
        sec.append(bd)
        sec.set_attr("data-nl-group", "context")
        flow.append(sec)
        sections.append(sec)
    if not flow.children:
        return False

    # ---- every .panel in the flow becomes an article.nl-card ----------------
    for sec in sections:
        for panel in list(sec.find_all(None, "panel")):
            panel_to_card(panel, ctx, sec.attr("id"))
        sec.set_attr("data-nl-panels", str(len([c for c in sec.find_all(None, "nl-card")])))
        title = sec.find(None, "nl-card-t")
        if sec.attr("data-nl-group") == "cards":
            if title is None:
                tbl = sec.find("table")
                lbl = (tbl.attr("aria-label") if tbl is not None else None) or ""
                cap = tbl.find("caption") if tbl is not None else None
                if cap is not None:
                    lbl = cap.text_flat() or lbl
                if lbl:
                    title = frag(f'<h2 class="nl-card-t" id="{ctx["ids"].next("nl-ct")}">{esc(lbl)}</h2>')
                    card = sec.find(None, "nl-card")
                    if card is not None:
                        hd = card.find(None, "nl-card-hd")
                        if hd is None:
                            hd = el("div", [("class", "nl-card-hd")])
                            mark = el("span", [("class", "nl-card-mark"), ("aria-hidden", "true"), ("data-nl-art", "table")])
                            mark.append(frag(CARD_MARK["table"]))
                            hd.append(mark)
                            hd.append(frag('<div class="nl-card-tt"></div>'))
                            card.prepend(hd)
                        hd.find(None, "nl-card-tt").append(title)
            if title is not None:
                if not title.has_attr("id"):
                    title.set_attr("id", ctx["ids"].next("nl-ct"))
                sec.set_attr("aria-labelledby", title.attr("id"))
                sec_label[id(sec)] = title.text_flat()
            else:
                sec_label[id(sec)] = "Overview"
        elif sec.attr("data-nl-group") == "context":
            sec_label[id(sec)] = "Context"
        sec_label.setdefault(id(sec), "Section")

    # numbering on the section index badges (01..NN) stays honest
    for i, sec in enumerate(sections):
        idx = sec.find(None, "nl-idx")
        if idx is not None:
            idx.children = [f"{i + 1:02d}"]
    # masthead numeral now knows the real section count
    kn = mast.find(None, "nl-kicker-i")
    if kn is not None:
        kn.children = [f"01/{max(1, len(sections)):02d}"]

    toc = [(x.attr("id"), sec_label.get(id(x), "Section")) for x in sections]

    # ---- rail + strip -------------------------------------------------------
    body_cls = "nl-body nl-has-rail" if len(toc) >= 2 else "nl-body"
    body = el("div", [("class", body_cls)])
    rail = el("aside", [("class", "nl-rail"), ("aria-label", "Page aids")])
    if len(toc) >= 2:
        rail.append(build_toc(toc, ctx))
    rail.append(build_ledger(ctx, len(sections)))
    rail.append(build_keys(ctx))
    body.append(flow)
    body.append(rail)

    root.append(mast)
    if tabs_wrap is not None:
        root.append(tabs_wrap)
    root.append(body)
    root.append(build_strip(ctx, len(sections)))
    main.append(root)
    ctx["sections"] = len(sections)
    return True


def lead_of(nodes) -> str:
    """A section subtitle is only ever an existing sentence on the page."""
    for n in nodes:
        for cls in ("panel-sub", "psub", "muted", "dim", "text-xs"):
            hit = n.find(None, cls) if n.tag != "p" else (n if n.has_class(cls) else None)
            if hit is not None:
                txt = hit.text_flat()
                if 28 < len(txt) < 220:
                    return txt
        if n.tag == "p":
            txt = n.text_flat()
            if 28 < len(txt) < 220:
                return txt
    return ""


def describe(nodes) -> str:
    for n in nodes:
        txt = n.text_flat()
        if len(txt) > 46:
            return (txt[:132].rstrip() + "…") if len(txt) > 132 else txt
    return ""


def section_tools(sec_id: str, ctx: dict) -> Node:
    box = el("div", [("class", "nl-sec-tools")])
    box.append(frag(f'<button class="nl-tool" type="button" data-nl-collapse="{sec_id}" aria-expanded="true" '
                    f'aria-controls="{sec_id}" title="Collapse this section">{ICON["collapse"]}'
                    f'<span data-nl-collapse-label>Collapse</span></button>'))
    box.append(frag(f'<button class="nl-tool" type="button" data-nl-copy="#{sec_id}" '
                    f'aria-label="Copy link to this section" title="Copy link to this section">{ICON["link"]}</button>'))
    return box


def build_toc(toc, ctx) -> Node:
    nav = el("nav", [("class", "nl-rail-card"), ("aria-label", "On this page")])
    nav.append(frag(f'<h2 class="nl-rail-t"><span>On this page</span><span class="nl-mono" aria-hidden="true">{len(toc):02d}</span></h2>'))
    ul = el("ul", [("class", "nl-toc"), ("role", "list")])
    for i, (sid, label) in enumerate(toc):
        lab = (label or "Section")
        lab = lab if len(lab) <= 42 else lab[:40].rstrip() + "…"
        ul.append(frag(f'<li><a href="#{sid}"><span class="nl-toc-i" aria-hidden="true">{i + 1:02d}</span>'
                       f'<span>{esc(lab)}</span></a></li>'))
    nav.append(ul)
    return nav


def build_ledger(ctx: dict, sections: int) -> Node:
    card = el("div", [("class", "nl-rail-card")])
    card.append(frag('<h2 class="nl-rail-t"><span>Ledger</span><span aria-hidden="true">◇</span></h2>'))
    dl = el("dl", [("class", "nl-rail-kv")])
    rows = [
        ("Surface", "Operator console" if ctx["is_admin"] else "Client portal"),
        ("View", {"list": "List", "detail": "Record", "form": "Form", "record": "Record",
                  "overview": "Overview", "dashboard": "Dashboard"}.get(ctx["kind"], "Record")),
        ("Sections", f"{sections}"),
        ("Cards", f"{ctx.get('cards', 0)}"),
        ("Sample rows", f"{ctx.get('rows', 0)}"),
        ("Bespoke art", f"{1 + ctx.get('cards', 0) + ctx.get('stats', 0)} vectors"),
        ("Contract", FAM_SERVICE.get(ctx["fam"], "gateway.openapi.json")),
    ]
    for k, v in rows:
        dl.append(frag(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>"))
    card.append(dl)
    return card


def build_keys(ctx: dict) -> Node:
    card = el("div", [("class", "nl-rail-card")])
    card.append(frag('<h2 class="nl-rail-t"><span>Keys</span><span class="kbd" aria-hidden="true">⌘K</span></h2>'))
    for lab, key in (("Focus search", "⌘K"), ("Skip to content", "Tab"), ("Close menus", "Esc")):
        card.append(frag(f'<p class="nl-rail-hint"><span>{esc(lab)}</span><span class="kbd" aria-hidden="true">{esc(key)}</span></p>'))
    return card


def build_strip(ctx: dict, sections: int) -> Node:
    strip = el("footer", [("class", "nl-strip reveal")])
    strip.append(frag(f'<span>sections <b>{sections}</b></span>'))
    strip.append(frag(f'<span>cards <b>{ctx.get("cards", 0)}</b></span>'))
    strip.append(frag(f'<span>rows <b>{ctx.get("rows", 0)}</b></span>'))
    strip.append(frag('<span>static prototype · no live service</span>'))
    acts = el("div", [("class", "nl-strip-acts")])
    acts.append(frag('<button class="nl-tool" type="button" data-nl-density aria-label="Cycle row density">'
                     f'{ICON["density"]}<span data-nl-density-label>Cosy</span></button>'))
    acts.append(frag(f'<button class="nl-tool" type="button" data-nl-copy aria-label="Copy link to this page">'
                     f'{ICON["up"]}Top</button>'))
    strip.append(acts)
    return strip


# ------------------------------------------------------------------- page runner
def ensure_head(tree: Node, ctx: dict):
    head = tree.find("head")
    if head is None:
        return
    if any(isinstance(c, Node) and "nl-v3.css" in (c.attr("href") or "") for c in head.child_elements()):
        return
    a = ctx["assets"]
    head.append(frag(f'<link href="{a}nl-v3.css" rel="stylesheet"/>'))
    head.append(frag(f'<script defer="" src="{a}nl-v3.js"></script>'))


def ensure_body_bits(tree: Node, ctx: dict):
    body = tree.find("body")
    if body is None:
        return
    add_class(body, "nl-v3")
    if body.find(None, "nl-progress") is None:
        skip = None
        for c in body.child_elements():
            if c.has_class("skip-link"):
                skip = c
                break
        bar = frag('<div class="nl-progress" id="nl-progress" aria-hidden="true" hidden></div>')
        live = frag('<p class="nl-sr" id="nl-live" role="status" aria-live="polite"></p>')
        if skip is not None:
            bar.insert_after(skip)
            skip.parent.children.insert(skip.parent.children.index(bar) + 1, live)
        else:
            body.prepend(bar)
            body.children.insert(1, live)


def fix_title_escaping(text: str) -> str:
    """The original build double-escaped ampersands in titles: a browser tab can
    read "Company &amp;amp; legal profile". Collapse runaway escaping in head metadata."""

    def dedupe(v: str) -> str:
        raw = v.replace("&amp;", "&")
        while "&amp;amp;" in raw:
            raw = raw.replace("&amp;amp;", "&amp;")
        return raw

    def fix_title(m):
        return "<title>" + esc(dedupe(m.group(1)).strip()) + "</title>"

    def fix_meta(m):
        return '<meta content="' + esc(dedupe(m.group(1)).strip()) + '" name="' + m.group(2) + '"/>'

    q = chr(34)
    text = re.sub(r"<title>(.*?)</title>", fix_title, text, flags=re.S)
    meta_pat = '<meta content=' + q + '([^' + q + ']*)' + q + ' name=' + q + '(description|og:title|og:description|twitter:title)' + q
    return re.sub(meta_pat, fix_meta, text)



def normalize_meta_description(text: str, surface: str) -> str:
    """One honest description formula per surface, so an audit reads the same story
    on every page instead of 13 stale 'web prototype' strings."""
    t = re.search(r"<title>(.*?)</title>", text, re.S)
    page = t.group(1).split("·")[0].strip() if t else "Nestlancer"
    page = page.replace("&amp;", "&")
    label = {"admin": "operator console", "client": "client portal", "public": "marketing site",
             "auth": "sign-in screen"}[surface]
    desc = f"Nestlancer {page} — {label} screen in the static prototype; sample data only."
    if re.search(r'<meta content="[^"]*" name="description"/>', text):
        text = re.sub(r'<meta content="[^"]*" name="description"/>',
                      f'<meta content="{esc(desc)}" name="description"/>', text, count=1)
    else:
        text = text.replace("</title>", f'</title>\n<meta content="{esc(desc)}" name="description"/>', 1)
    return text


def process(path: str, dry=False) -> dict:
    full = os.path.join(ROOT, path)
    text = open(full, encoding="utf-8").read()
    rec = {"path": path, "changed": False, "notes": []}
    if "nl-root" in text:
        rec["notes"].append("already-v3")
        return rec
    tree = parse(text)
    if tree.outer() != text:
        rec["notes"].append("parser-lossy:skipped")
        return rec
    is_admin = "/apps/admin/" in path
    ctx = {
        "surface": "admin" if is_admin else "client",
        "assets": rel_assets(path),
        "fam": family_of(path),
        "is_admin": is_admin,
        "ids": IdPool(re.findall(r'\bid="([^"]+)"', text)),
        "panel_count": len(re.findall(r'class="[^"]*\bpanel\b', text)),
        "page_title": (re.search(r"<title>(.*?)</title>", text, re.S).group(1).split("·")[0].strip()
                       if re.search(r"<title>(.*?)</title>", text, re.S) else "Nestlancer"),
        "stats_node": None,
        "kind": "detail",
        "cards": 0,
        "rows": 0,
    }
    m = re.search(r'<div class="stats[^"]*"', text)
    if m:
        ctx["stats_found"] = True
    main = tree.find("main")
    if main is None:
        rec["notes"].append("no-main")
    else:
        ctx["kind"] = classify(main, path)
        ctx["stats_node"] = main.find(None, "stats")
        if re.search(r"<script|<style", main.outer()):
            rec["notes"].append("inline-script-in-main:body-skipped")
        else:
            before = strip_tags(main.outer())
            ok = recompose(main, ctx)
            after = strip_tags(main.outer())
            if ok:
                lost = [t for t in tokens(before) if t not in after]
                total = tokens(before)
                if len(lost) > max(2, int(len(total) * 0.02)):
                    rec["notes"].append(f"content-guard({len(lost)}):reverted")
                    tree = parse(text)
                else:
                    rec["changed"] = True
                    rec["lost_tokens"] = lost[:8]
            else:
                rec["notes"].append("no-structure")
                tree = parse(text)
    ensure_body_bits(tree, ctx)
    ensure_head(tree, ctx)
    out = tree.outer()
    if "nl-v3.css" not in out:
        out = transform_head(out, ctx["assets"])
    out = normalize_meta_description(fix_title_escaping(out), ctx["surface"])
    if not dry and out != text:
        open(full, "w", encoding="utf-8").write(out)
    rec["cards"] = ctx.get("cards", 0)
    rec["rows"] = ctx.get("rows", 0)
    rec["sections"] = ctx.get("sections", 0)
    rec["kind"] = ctx["kind"]
    return rec


def rel_assets(path: str) -> str:
    depth = len(os.path.relpath(os.path.join(ROOT, path), PROTO).split(os.sep)) - 1
    return "../" * depth + "shared/assets/"


def app_pages():
    out = []
    for dirpath, _dirs, files in os.walk(os.path.join(PROTO, "apps")):
        rel_dir = os.path.relpath(dirpath, PROTO).replace("\\", "/")
        if rel_dir.split("/")[1:2] == ["landing"]:
            continue
        for f in sorted(files):
            if f.endswith(".html"):
                out.append(os.path.relpath(os.path.join(dirpath, f), ROOT).replace("\\", "/"))
    return sorted(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--paths")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--out", default=os.path.join(HERE, "run-v3.json"))
    a = ap.parse_args()
    paths = json.load(open(a.paths)) if a.paths else app_pages()
    if a.limit:
        paths = paths[:a.limit]
    recs = []
    for p in paths:
        try:
            recs.append(process(p, a.dry))
        except Exception as e:  # a page must never be half-written
            recs.append({"path": p, "changed": False, "error": f"{type(e).__name__}: {e}"})
    if not a.dry:
        json.dump(recs, open(a.out, "w"), indent=1)
    ch = [r for r in recs if r.get("changed")]
    err = [r for r in recs if r.get("error")]
    noted = [r for r in recs if r.get("notes")]
    print(f"pages={len(paths)} changed={len(ch)} errors={len(err)} noted={len(noted)}")
    print(f"  cards={sum(r.get('cards', 0) for r in recs)} rows={sum(r.get('rows', 0) for r in recs)} "
          f"sections={sum(r.get('sections', 0) for r in recs)}")
    for r in err[:15]:
        print("  ERR ", r["path"], r["error"])
    for r in noted[:15]:
        print("  NOTE", r["path"], r["notes"])


if __name__ == "__main__":
    main()
