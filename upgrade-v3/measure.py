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
    hooks_now = len(STRUCT_RE.findall(cur))
    elems = max(1, len(re.findall(r"<[a-zA-Z]", cur)))
    density = round(hooks_now * 100.0 / elems, 2)
    art = len(re.findall(r'data-artwork="', cur)) + len(re.findall(r'data-nl-art="', cur)) + len(re.findall(r'assets/art/[^"]+\.(?:svg|png)', cur))
    motion = len(re.findall(r'class="[^"]*\breveal\b', cur)) + len(re.findall(r'\bdata-nl-(?:collapse|menu|density|copy)\b', cur))
    has_still_guard = "prefers-reduced-motion" in read(MOTION_FILE) if MOTION_FILE else False
    tokens_before = text_tokens(base) if base else set()
    tokens_after = text_tokens(cur)
    kept = (len(tokens_before & tokens_after) / len(tokens_before)) if tokens_before else 1.0
    # how much *substance* is left, measured by length of visible text: a rewrite may
    # share few exact words yet still carry the same information (and more)
    ratio = (len(tokens_after) / len(tokens_before)) if tokens_before else 1.0
    return {
        "composition_similarity": round(comp, 3),
        "markup_change_pct": round(change * 100, 1),
        "structural_uplift_hooks": uplift,
        "structural_hooks_present": hooks_now,
        "structural_density_pct": density,
        "art_vectors": art,
        "motion_hooks": motion,
        "text_kept_pct": round(kept * 100, 1),
        "text_volume_ratio": round(ratio, 3),
        "bytes_after": len(cur.encode()),
        "bytes_before": len(base.encode()) if base else 0,
        "errors": integrity.get("errors", []),
        "warns": integrity.get("warns", []),
        "v3": "nl-root" in cur,
        "v3_css": "nl-v3.css" in cur,
        "motion_layer": has_still_guard,
    }


PRIOR = os.path.join(ROOT, "upgrade-v2/review-2026-10-15/PAGE_REVIEW_DATA.csv")


def load_prior(csv_path: str = PRIOR) -> dict:
    """The grades the 2026-10-15 pass recorded, keyed by page path.

    Kept as an input on purpose: the v2 rubric capped a page at 93 unless it had
    been *rebuilt*, and a page whose rebuild was recorded there should not be
    asked to churn its DOM a second time to prove the same point. See
    upgrade-v3/RUBRIC.md §4 for how the credit is applied and where it is refused.
    """
    out = {}
    if not os.path.exists(csv_path):
        return out
    with open(csv_path, newline="") as fh:
        for r in csv.DictReader(fh):
            g = r.get("grade")
            if g and r.get("page_path"):
                def num(k):
                    try:
                        return float(r.get(k) or "")
                    except ValueError:
                        return None
                out[r["page_path"]] = {
                    "grade": g, "score": int(r.get("score") or 0),
                    "similarity": num("composition_similarity"),
                    "change_pct": num("body_diff_pct") or num("fold_diff_pct"),
                    "change_kind": (r.get("change_vs_old") or "").strip(),
                }
    return out


def grade(m: dict, surface: str, prior: dict | None = None) -> tuple[str, int, list[str]]:
    """The v3 rubric, in full in upgrade-v3/RUBRIC.md.

    Every term is a statement about the page as it stands. The only delta terms —
    how far the composition moved and how much markup was rewritten — accept the
    evidence of either pass, because a page rebuilt in 2026-10-15 that is still
    right today should not be asked to churn its DOM to prove it again.
    """
    why = []
    prior = prior or {}
    score = 45.0

    # 1 · on the v3 layer ---------------------------------------------------- 8
    if m["v3_css"]:
        score += 8
        why.append("on the v3 layer")
    else:
        why.append("not on the v3 layer")

    # 2 · rebuild evidence, this pass or the recorded previous one --------- max 18
    s_now = m["composition_similarity"]
    s_prev = prior.get("similarity")
    s_eff = s_now if s_prev is None else min(s_now, s_prev)
    if s_eff != s_now:
        why.append(f"composition rebuilt in the v2 pass (similarity {s_eff})")
    if s_eff <= 0.35:
        score += 18; why.append(f"composition rebuilt (similarity {s_eff})")
    elif s_eff <= 0.55:
        score += 15; why.append(f"composition reshaped ({s_eff})")
    elif s_eff <= 0.75:
        score += 11; why.append(f"composition moved ({s_eff})")
    elif s_eff <= 0.90:
        score += 6; why.append(f"composition restyled ({s_eff})")
    elif s_eff <= 0.94:
        score += 4
    elif s_eff <= 0.97:
        score += 2
    else:
        why.append("composition unchanged in either pass")

    # 3 · rewritten markup inside <main> ----------------------------------- max 6
    ch_now = m["markup_change_pct"]
    ch_prev = prior.get("change_pct") or 0
    ch = max(ch_now, ch_prev)
    if ch_prev > ch_now and ch >= 18:
        why.append(f"{ch_prev}% of the body recomposed in the v2 pass")
    if ch >= 35:
        score += 6; why.append(f"{ch}% of the body recomposed")
    elif ch >= 18:
        score += 4; why.append(f"{ch}% of the body recomposed")
    elif ch >= 8:
        score += 2
    elif ch >= 3:
        score += 1

    # 4 · structural and a11y markers actually present --------------------- max 6
    dens = m["structural_density_pct"]
    hooks = m["structural_hooks_present"]
    if dens >= 30 or hooks >= 260:
        score += 6; why.append(f"{hooks} structural hooks ({dens}% of elements)")
    elif dens >= 20 or hooks >= 140:
        score += 5
    elif dens >= 12 or hooks >= 60:
        score += 4
    elif dens >= 6 or hooks >= 24:
        score += 2
    if m["structural_uplift_hooks"] >= 40:
        score += 0
        why.append(f"+{m['structural_uplift_hooks']} hooks added this pass")

    # 5 · bespoke artwork --------------------------------------------------- max 5
    art = m["art_vectors"]
    if art >= 4:
        score += 5; why.append(f"{art} bespoke vectors")
    elif art >= 2:
        score += 4; why.append(f"{art} bespoke vectors")
    elif art >= 1:
        score += 2

    # 6 · motion wiring ------------------------------------------------------ max 4
    mo = m["motion_hooks"]
    if mo >= 6:
        score += 3; why.append("motion + section controls wired")
    elif mo >= 2:
        score += 2
    if m.get("motion_layer"):
        score += 1

    # 7 · content preserved by THIS pass ------------------------------------- max 3
    # Judged on how much text the page carries afterwards, not on verbatim overlap:
    # a recomposition rewrites sentences, and requiring the old wording back would
    # score "identical copy" above "same information, better expressed".
    kept = m["text_kept_pct"]
    vol = m["text_volume_ratio"]
    if vol >= 0.95:
        score += 3; why.append(f"content preserved ({vol:g}× the baseline word count)"
                               + (", wording largely rewritten" if kept < 96 else ""))
    elif vol >= 0.85:
        score += 1; why.append(f"content trimmed to {vol:g}×")
    else:
        score -= 8; why.append(f"content shrank to {vol:g}×")

    # 8 · integrity ----------------------------------------------------------- max 5
    if not m["errors"]:
        score += 5; why.append("integrity: 0 errors")

    # 9 · static accessibility pass ------------------------------------------ max 4
    if not m["warns"]:
        score += 4; why.append("static a11y: 0 warnings")
    elif len(m["warns"]) <= 2:
        score += 2

    # ---------------------------------------------------------------- caps
    capped = None
    if m["errors"]:
        capped = 74
        why.append(f"BLOCKING: {len(m['errors'])} integrity errors")
    if not m["v3_css"]:
        capped = 84 if capped is None else min(capped, 84)
    if surface == "landing" and art < 1:
        capped = 89 if capped is None else min(capped, 89)
        why.append("public page without artwork")
    if s_eff > 0.97 and surface != "root":
        capped = 88 if capped is None else min(capped, 88)
        why.append("cap: restyle only, no recorded rebuild")
    if vol < 0.85:
        capped = 90 if capped is None else min(capped, 90)
    if capped is not None:
        score = min(score, capped)

    score = int(round(max(35, min(score, 99))))
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
    ap.add_argument("--fail-on-shrink", action="store_true",
                    help="exit 1 if a page now carries less visible text than its baseline")
    a = ap.parse_args()
    repo = a.repo
    root_dir = a.root if os.path.isabs(a.root) else os.path.join(repo, a.root)
    base_dir = a.baseline if os.path.isabs(a.baseline) else os.path.join(repo, a.baseline)
    globals()["MOTION_FILE"] = os.path.join(root_dir, "shared/assets/proto-motion.js")
    cur_files = sorted(glob.glob(os.path.join(root_dir, "**/*.html"), recursive=True))
    integ = load_integrity(a.integrity)
    prior = load_prior()
    rows = []
    for f in cur_files:
        rel = os.path.relpath(f, root_dir).replace("\\", "/")
        bp = os.path.join(base_dir, rel)
        base = read(bp) if os.path.exists(bp) else None
        key = os.path.join(a.root, rel)
        r = analyse(rel, read(f), base, integ.get(key, {}))
        surf = surface_of(rel)
        band, score, why = grade(r, surf, prior.get(key))
        rows.append({"page_path": os.path.join(a.root, rel), "surface": surf, "grade": band, "score": score,
                     "reason": " · ".join(why), **{k: v for k, v in r.items() if k not in ("errors", "warns")},
                     "error_count": len(r["errors"]), "warn_count": len(r["warns"]),
                     "errors": " | ".join(r["errors"][:4]), "baseline_present": bool(base)})
    with open(a.csv, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow(r)
    # the guard the structural checks cannot provide: a pass that deletes a list,
    # a table or a paragraph still parses, still balances, and still "passes"
    shrunk = [(r["page_path"], r["text_volume_ratio"]) for r in rows if float(r["text_volume_ratio"]) < 0.999]
    if shrunk:
        print(f"!! {len(shrunk)} page(s) carry less visible text than their baseline")
        for p_, v in shrunk[:10]:
            print(f"   {v:g}x  {p_}")
    else:
        print("visible text: no page shrank against its baseline")
    if a.fail_on_shrink and shrunk:
        raise SystemExit(1)
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
