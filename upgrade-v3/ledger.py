#!/usr/bin/env python3
"""UPGRADE V3 · delivery ledger.

Joins what each pass *did* (run-v3.json, run-v3-pub.json, build-auth.py) with what the
grader measured (PAGE_REVIEW_V3_DATA.csv) into one row per page, so a reviewer can
sort by family or by score without opening 175 files.

    python3 upgrade-v3/ledger.py
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import nlhtml  # noqa: E402


def family(rel: str) -> str:
    if rel == "index.html":
        return "hub"
    if rel.startswith("apps/landing/"):
        rest = rel[len("apps/landing/"):]
        head = rest.split("/")[0]
        if head in {"login", "register", "forgot-password", "reset-password", "verify",
                    "verify-email", "verify-document", "admin-login"}:
            return "auth"
        if head.startswith(("terms", "privacy", "refund", "legal")) or rest.count("/") == 1 and "legal" in rest:
            return "legal"
        if "portfolio" in rest:
            return "case-study"
        if "blog" in rest:
            return "journal"
        return "marketing"
    if rel.startswith("apps/web/"):
        return "web-app"
    if rel.startswith("apps/admin/"):
        return "admin-app"
    return "other"


def notes_for(rel: str, app: dict, pub: dict, auth: set[str]) -> str:
    out = []
    if rel in auth:
        out.append("auth:composed")
    if rel in app:
        n = app[rel]
        det = n.get("detail") or {}
        bits = []
        if det.get("cards"):
            bits.append(f"cards={det['cards']}")
        if det.get("rows"):
            bits.append(f"rows={det['rows']}")
        if det.get("sections"):
            bits.append(f"sections={det['sections']}")
        out.append("app:" + n.get("kind", "recomposed") + (f"({','.join(bits)})" if bits else ""))
    if rel in pub:
        out.append("pub:" + ", ".join(pub[rel].get("notes", [])))
    return " | ".join(out)


def main() -> None:
    app_run = json.load(open(os.path.join(HERE, "run-v3.json"), encoding="utf-8"))
    pub_run = json.load(open(os.path.join(HERE, "run-v3-pub.json"), encoding="utf-8"))
    app, pub = {}, {}
    for r in app_run:
        app[r["path"].replace("proto/", "", 1)] = r
    for r in pub_run:
        pub[r["path"].replace("proto/", "", 1)] = r
    auth = set()
    src = open(os.path.join(HERE, "build-auth.py"), encoding="utf-8").read()
    for m in re.finditer(r'"([^"]+\.html)"', src):
        auth.add("apps/landing/" + m.group(1).lstrip("/"))
    for p in glob_auth():
        auth.add(p)
    grades = {r["page_path"].replace("proto/", "", 1): r
              for r in csv.DictReader(open(os.path.join(HERE, "PAGE_REVIEW_V3_DATA.csv"), encoding="utf-8"))}
    integ = {r["path"].replace("proto/", "", 1): r for r in json.load(open(os.path.join(HERE, "integrity.json"), encoding="utf-8"))}

    rows = []
    for path in sorted(glob_pages()):
        rel = os.path.relpath(path, os.path.join(ROOT, "proto")).replace(os.sep, "/")
        g = grades.get(rel, {})
        now = int(os.path.getsize(path))
        before = int(g.get("bytes_before") or 0)
        hooks = int(g.get("structural_hooks_present") or 0)
        uplift = int(g.get("structural_uplift_hooks") or 0)
        rows.append({
            "page": f"proto/{rel}",
            "surface": g.get("surface", ""),
            "family": family(rel),
            "passes": notes_for(rel, app, pub, auth),
            "bytes_before": before or "",
            "bytes_after": now,
            "delta_pct": f"{(now - before) / before * 100:+.1f}" if before else "",
            "composition_similarity": g.get("composition_similarity", ""),
            "markup_change_pct": g.get("markup_change_pct", ""),
            "hooks_before": max(hooks - uplift, 0),
            "hooks_after": hooks,
            "v3_uplift_hooks": uplift,
            "art_vectors": g.get("art_vectors", ""),
            "motion_hooks": g.get("motion_hooks", ""),
            "text_volume_ratio": g.get("text_volume_ratio", ""),
            "integrity_errors": len(integ.get(rel, {}).get("errors", [])),
            "integrity_warnings": len(integ.get(rel, {}).get("warns", [])),
            "grade": g.get("grade", ""),
            "score": g.get("score", ""),
            "reason": g.get("reason", ""),
        })
    out = os.path.join(HERE, "DELIVERY_V3.csv")
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    import collections
    print(f"rows={len(rows)} → upgrade-v3/DELIVERY_V3.csv")
    print("by family:", dict(collections.Counter(r["family"] for r in rows)))
    print("grades:", dict(collections.Counter(r["grade"] for r in rows)))
    for fam in ("auth", "legal", "case-study", "journal", "marketing", "hub"):
        sel = [r for r in rows if r["family"] == fam]
        if sel:
            print(f"  {fam:11s} n={len(sel):3d} avg={sum(int(r['score']) for r in sel if r['score'])/max(len(sel),1):.1f}"
                  f" A+={sum(1 for r in sel if r['grade']=='A+')}")


def glob_pages():
    import glob
    return glob.glob(os.path.join(ROOT, "proto", "**", "*.html"), recursive=True)


def glob_auth():
    import glob
    out = []
    for p in glob.glob(os.path.join(ROOT, "proto", "apps", "landing", "*", "index.html")):
        rel = os.path.relpath(p, os.path.join(ROOT, "proto")).replace(os.sep, "/")
        t, tree = nlhtml.load(p)
        if tree.find(None, "nl-auth-dock") is not None:
            out.append(rel)
    return out


if __name__ == "__main__":
    main()
