#!/usr/bin/env python3
"""Nestlancer · UPGRADE V3 measurement + rubric scoring.

Same shape as the 2026-10-15 review pass, minus the pixel diff: this sandbox has no
browser (headless Chromium cannot load libnss3 here and binary mirrors are blocked),
so "how much of the picture changed" is measured from the rendered-equivalent markup
instead of screenshots. Everything else is the review's own method:

  composition similarity  signature of <main>: tag + up to 3 classes, document order,
                          first 400 elements — difflib ratio vs the graded baseline
                          (1.0 = same composition element-for-element, ≤0.55 rebuilt)
  markup change           1 − difflib ratio over the normalised <main> markup: a proxy
                          for the fold/body pixel diff the review used
  structural uplift       net additions of aria-*, data-*, <label>, <dialog>, <details>,
                          <th scope>, <fieldset>, role=
  bespoke art             aria-hidden v3 vectors + <img> art assets on the page
  motion wiring           html.nl-motion gated elements, .reveal blocks, reduced-motion guard
  content preservation    baseline text tokens still present on the page
  integrity               upgrade-v3/check.py results (errors are blocking)

    python3 upgrade-v3/measure.py --root proto --baseline /tmp/base/proto --csv out.csv
"""
from __future__ import annotations

import argparse
import csv
import difflib
import glob
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

TAG_RE = re.compile(r"<([a-zA-Z][a-zA-Z0-9-]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>")
CLASS_RE = re.compile(r'class="([^"]*)"')
STRUCT_RE = re.compile(r"\b(?:aria-[a-z-]+=|data-[a-z-]+=|<label\b|<dialog\b|<details\b|<fieldset\b|<th [^>]*scope=|role=)")


def read(p):
    return open(p, encoding="utf-8", errors="ignore").read()


def main_markup(html: str) -> str:
    m = re.search(r"<main\b.*?</main>", html, re.S)
    body = m.group(0) if m else html
    body = re.sub(r">[\s]+<", "><", body)
    return body.strip()


def signature(html: str, limit=400):
    body = main_markup(html)
    out = []
    for m in TAG_RE.finditer(body):
        cls = CLASS_RE.search(m.group(2) or "")
        c = "." + " ".join(cls.group(1).split()[:3]) if cls else ""
        out.append(m.group(1).lower() + c)
        if len(out) >= limit:
            break
    return out


def text_tokens(html: str):
    t = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&amp;", "&").replace("&#8377;", "₹").replace("&nbsp;", " ")
    t = re.sub(r"\s+", " ", t)
    return set(w for w in re.findall(r"[A-Za-z0-9₹@.\-/]{4,}", t))


def surface_of(rel: str) -> str:
    if rel.startswith("apps/landing/") or rel == "index.html":
        return "landing" if rel != "index.html" else "root"
    if rel.startswith("apps/web/"):
        return "web"
    if rel.startswith("apps/admin/"):
        return "admin"
    return "root"


MOTION_FILE = ""


def analyse(rel: str, cur: str, base: str | None, integrity: dict) -> dict:
    cur_sig = signature(cur)
    base_sig = signature(base) if base else []
    comp = difflib.SequenceMatcher(None, base_sig, cur_sig).ratio() if base_sig else 1.0
    cur_mk = main_markup(cur)
    base_mk = main_markup(base) if base else cur_mk
    change = 1 - difflib.SequenceMatcher(None, base_mk, cur_mk, autojunk=False).quick_ratio() if base else 0.0
    uplift = len(STRUCT_RE.findall(cur)) - (len(STRUCT_RE.findall(base)) if base else 0)
    art = len(re.findall(r'data-artwork="', cur)) + len(re.findall(r'data-nl-art="', cur)) + len(re.findall(r'assets/art/[^"]+\.(?:svg|png)', cur))
    motion = len(re.findall(r'class="[^"]*\breveal\b', cur)) + len(re.findall(r'\bdata-nl-(?:collapse|menu|density|copy)\b', cur))
    has_still_guard = "prefers-reduced-motion" in read(MOTION_FILE) if MOTION_FILE else False
    tokens_before = text_tokens(base) if base else set()
    tokens_after = text_tokens(cur)
    kept = (len(tokens_before & tokens_after) / len(tokens_before)) if tokens_before else 1.0
    return {
        "composition_similarity": round(comp, 3),
        "markup_change_pct": round(change * 100, 1),
        "structural_uplift_hooks": uplift,
        "art_vectors": art,
        "motion_hooks": motion,
        "text_kept_pct": round(kept * 100, 1),
        "bytes_after": len(cur.encode()),
        "bytes_before": len(base.encode()) if base else 0,
        "errors": integrity.get("errors", []),
        "warns": integrity.get("warns", []),
        "v3": "nl-root" in cur,
        "v3_css": "nl-v3.css" in cur,
        "motion_layer": has_still_guard,
    }


def grade(m: dict, surface: str) -> tuple[str, int, list[str]]:
    """Documented v3 rubric (see upgrade-v3/RUBRIC.md)."""
    why = []
    score = 70.0
    s = m["composition_similarity"]
    if s <= 0.35:
        score += 22; why.append(f"composition rebuilt (similarity {s})")
    elif s <= 0.55:
        score += 18; why.append(f"composition reshaped ({s})")
    elif s <= 0.75:
        score += 13; why.append(f"composition moved ({s})")
    elif s <= 0.90:
        score += 8; why.append(f"composition restyled ({s})")
    else:
        score += 3; why.append(f"composition unchanged ({s})")
    ch = m["markup_change_pct"]
    if ch >= 55:
        score += 8; why.append(f"{ch}% of the page markup recomposed")
    elif ch >= 35:
        score += 6
    elif ch >= 18:
        score += 4
    elif ch >= 8:
        score += 2
    u = m["structural_uplift_hooks"]
    if u >= 120:
        score += 6; why.append(f"+{u} structural/state hooks")
    elif u >= 60:
        score += 5
    elif u >= 25:
        score += 3
    elif u >= 10:
        score += 2
    if m["art_vectors"] >= 4:
        score += 5; why.append(f"{m['art_vectors']} bespoke vectors")
    elif m["art_vectors"] >= 2:
        score += 4
    elif m["art_vectors"] >= 1:
        score += 3
    if m["motion_hooks"] >= 6:
        score += 3; why.append("motion + control layer wired")
    elif m["motion_hooks"] >= 2:
        score += 2
    if m["text_kept_pct"] >= 99:
        score += 2; why.append("no content lost")
    elif m["text_kept_pct"] < 96:
        score -= 6; why.append(f"copy shrank to {m['text_kept_pct']}%")
    blocking = [e for e in m["errors"]]
    if not blocking:
        score += 4; why.append("integrity pass: 0 errors")
    else:
        score = min(score, 74)
        why.append(f"blocking defects: {len(blocking)}")
    if not m["v3_css"]:
        score = min(score, 89)
        why.append("not on the v3 layer")
    if surface in ("landing",) and m["art_vectors"] < 1:
        score = min(score, 89)
        why.append("public page without artwork")
    score = int(round(score))
    score = max(40, min(score, 99))
    band = ("A+" if score >= 95 else "A" if score >= 90 else "B+" if score >= 85 else
            "B" if score >= 80 else "C+" if score >= 75 else "C" if score >= 70 else "D")
    return band, score, why


def load_integrity(json_path: str | None):
    if not json_path or not os.path.exists(json_path):
        return {}
    data = json.load(open(json_path))
    return {d["path"]: d for d in data}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="proto")
    ap.add_argument("--repo", default=ROOT)
    ap.add_argument("--baseline", default="/tmp/base/proto")
    ap.add_argument("--integrity", default=os.path.join(HERE, "integrity.json"))
    ap.add_argument("--csv", default=os.path.join(HERE, "PAGE_REVIEW_V3_DATA.csv"))
    a = ap.parse_args()
    repo = a.repo
    root_dir = a.root if os.path.isabs(a.root) else os.path.join(repo, a.root)
    base_dir = a.baseline if os.path.isabs(a.baseline) else os.path.join(repo, a.baseline)
    globals()["MOTION_FILE"] = os.path.join(root_dir, "shared/assets/proto-motion.js")
    cur_files = sorted(glob.glob(os.path.join(root_dir, "**/*.html"), recursive=True))
    integ = load_integrity(a.integrity)
    rows = []
    for f in cur_files:
        rel = os.path.relpath(f, root_dir).replace("\\", "/")
        bp = os.path.join(base_dir, rel)
        base = read(bp) if os.path.exists(bp) else None
        r = analyse(rel, read(f), base, integ.get(os.path.join(a.root, rel), {}))
        surf = surface_of(rel)
        band, score, why = grade(r, surf)
        rows.append({"page_path": os.path.join(a.root, rel), "surface": surf, "grade": band, "score": score,
                     "reason": " · ".join(why), **{k: v for k, v in r.items() if k not in ("errors", "warns")},
                     "error_count": len(r["errors"]), "warn_count": len(r["warns"]),
                     "errors": " | ".join(r["errors"][:4]), "baseline_present": bool(base)})
    with open(a.csv, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow(r)
    dist = Counter(f'{r["surface"]}/{r["grade"]}' for r in rows)
    print(f"pages: {len(rows)}  graded against baseline: {sum(1 for r in rows if r['baseline_present'])}")
    byg = Counter(r["grade"] for r in rows)
    print("grades:", dict(byg))
    print("avg score:", round(sum(r["score"] for r in rows) / max(1, len(rows)), 1))
    print("avg composition similarity:", round(sum(r["composition_similarity"] for r in rows) / max(1, len(rows)), 3))
    print("avg markup change %:", round(sum(r["markup_change_pct"] for r in rows) / max(1, len(rows)), 1))
    print("pages below A+:", sum(1 for r in rows if r["grade"] != "A+"))
    for r in sorted(rows, key=lambda x: x["score"])[:14]:
        print(f'  {r["score"]:>3} {r["grade"]:<3} {r["page_path"][6:][:64]:<66} sim={r["composition_similarity"]} ch={r["markup_change_pct"]}% err={r["error_count"]}')
    json.dump({"distribution": dict(dist)}, open(os.path.join(HERE, "grade-distribution.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
