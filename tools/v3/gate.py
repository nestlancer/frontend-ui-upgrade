#!/usr/bin/env python3
"""
Nestlancer v3 quality gates. Three hard gates — a page is VERIFIED only if all pass.

  1. DATA gate     — every mock-data token in the baseline HTML (₹ amounts, invoice/quote/
                     project IDs, UUIDs, emails, dates, percentages, person names in the
                     seed list) still exists in the redesigned HTML.
  2. VISUAL gate   — the 1440 first-viewport screenshot differs from baseline by at least
                     --min-change (default 0.30 = 30% of pixels visibly changed, same theme).
                     This exists because earlier runs shipped "redesigns" that changed ~3%.
  3. RESIDUE gate  — redesigned page loads the v3 stylesheet(s), no longer links the
                     legacy surface sheets (studio/workbench/operator/public-flow/
                     editorial/inbox.css), has no legacy batch/upgrade classes on
                     <body>, and no inline style="" except CSS custom-property hooks
                     (style="--progress:40%").

Isolation: gates read prototype/ only — never proto/.

Usage:
  # 1) before touching anything (after seeding prototype/)
  python3 tools/v3/gate.py snapshot --surface public --out upgrade-v3/public/data-baseline.json
  python3 tools/v3/capture.py --surface public --out upgrade-v3/public/baseline

  # 2) after redesign (also: python3 tools/v3/gate.py links --surface public)
  python3 tools/v3/capture.py --surface public --out upgrade-v3/public/after
  python3 tools/v3/gate.py check --surface public \
      --data upgrade-v3/public/data-baseline.json \
      --before upgrade-v3/public/baseline --after upgrade-v3/public/after \
      --report upgrade-v3/public/GATE_REPORT.md --compare upgrade-v3/public/compare
"""
import argparse, glob, html, json, os, re, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PROTO_ROOT = os.path.join(REPO, "prototype")
SURFACE_DIR = {"public": "public", "landing": "public", "web": "web", "admin": "admin"}

NAMES = ["Arjun Mehta", "Samira Patel", "Rahul Desai", "Ananya Iyer", "Priya Nair", "Vikram Shah",
         "Kavya Reddy", "Rajan Kumar", "Divya Sharma", "Amit Verma", "Neha Gupta", "Suresh Iyer",
         "Pooja Kulkarni", "Karthik Menon", "Sandeep Chopra", "Riya Kapoor"]
PATTERNS = [
    r"₹\s?[\d,]+(?:\.\d{2})?",                         # money
    r"\bNL-[A-Z0-9][A-Z0-9-]{2,}\b",                    # NL-204, NL-INV-2026-000009
    r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{6,12}\b",  # uuids
    r"\b[\w.+-]+@nestlancer\.com\b",                    # emails
    r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, 20\d\d\b",  # dates
    r"\b\d{1,3}(?:\.\d)?%",                             # percentages
    r"\bAUDIT-[A-Z0-9-]+\b",                            # fixture titles
]
LEGACY_BODY = re.compile(r"\b(upgrade-v2|batch-(two|three|four|five)|studio-v2|workbench-v2|operator-v2|flow-v2|auth-v2)\b")


def surface_root(surface):
    return os.path.join(PROTO_ROOT, SURFACE_DIR[surface])


def pages(surface):
    root = surface_root(surface)
    label = SURFACE_DIR[surface]
    fs = sorted(glob.glob(os.path.join(root, "**", "index.html"), recursive=True))
    out = []
    for f in fs:
        sub = os.path.relpath(os.path.dirname(f), root)
        out.append(label if sub == "." else os.path.join(label, sub))
    return out


def visible_text(s):
    s = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s))


def tokens(s):
    t = visible_text(s)
    found = set()
    for p in PATTERNS:
        found.update(m.group(0).replace(" ", "") for m in re.finditer(p, t))
    for n in NAMES:
        if n in t:
            found.add(n)
    return found


def snapshot(surface, out):
    data = {}
    for rel in pages(surface):
        s = open(os.path.join(PROTO_ROOT, rel, "index.html"), encoding="utf-8").read()
        data[rel] = sorted(tokens(s))
    os.makedirs(os.path.dirname(os.path.join(REPO, out)), exist_ok=True)
    json.dump(data, open(os.path.join(REPO, out), "w"), indent=1)
    print(f"snapshot: {len(data)} pages, {sum(len(v) for v in data.values())} data tokens -> {out}")


def slug(rel):
    return rel.replace("/", "__").replace("[", "_").replace("]", "_")


def visual_change(a, b):
    from PIL import Image, ImageChops
    A = Image.open(a).convert("RGB"); B = Image.open(b).convert("RGB")
    if A.size != B.size:
        B = B.resize(A.size)
    diff = ImageChops.difference(A, B).convert("L").point(lambda v: 255 if v > 24 else 0)
    hist = diff.histogram()
    return hist[255] / float(A.size[0] * A.size[1])


def compare_image(a, b, out):
    from PIL import Image, ImageDraw
    A = Image.open(a).convert("RGB"); B = Image.open(b).convert("RGB")
    w, h = A.size
    canvas = Image.new("RGB", (w * 2 + 24, h + 40), (24, 24, 24))
    canvas.paste(A, (0, 40)); canvas.paste(B.resize((w, h)), (w + 24, 40))
    d = ImageDraw.Draw(canvas)
    d.text((12, 12), "BEFORE", fill=(230, 230, 230)); d.text((w + 36, 12), "AFTER", fill=(230, 230, 230))
    canvas.thumbnail((1800, 1800)); canvas.save(out)


def residue(s):
    issues = []
    body = re.search(r"<body[^>]*>", s)
    if body and LEGACY_BODY.search(body.group(0)):
        issues.append("legacy body classes: " + ",".join(sorted(set(m.group(0) for m in LEGACY_BODY.finditer(body.group(0))))))
    inline = [m for m in re.findall(r'style="([^"]*)"', s) if not re.fullmatch(r"\s*(--[\w-]+\s*:[^;]+;?\s*)+", m)]
    if inline:
        issues.append(f"{len(inline)} inline style attrs")
    if "assets/v3/" not in s:
        issues.append("v3 stylesheet not loaded")
    legacy_css = re.findall(r'href="[^"]*assets/(studio|workbench|operator|public-flow|editorial|inbox)\.css"', s)
    if legacy_css:
        issues.append("legacy surface css still linked: " + ",".join(sorted(set(legacy_css))))
    return issues


def check(surface, data, before, after, report, compare, min_change):
    base = json.load(open(os.path.join(REPO, data)))
    rows, fails = [], 0
    if compare:
        os.makedirs(os.path.join(REPO, compare), exist_ok=True)
    for rel in pages(surface):
        s = open(os.path.join(PROTO_ROOT, rel, "index.html"), encoding="utf-8").read()
        now = tokens(s)
        missing = [t for t in base.get(rel, []) if t not in now]
        b = os.path.join(REPO, before, f"{slug(rel)}-1440.png"); a = os.path.join(REPO, after, f"{slug(rel)}-1440.png")
        change = visual_change(b, a) if os.path.exists(a) and os.path.exists(b) else None
        if compare and change is not None:
            compare_image(b, a, os.path.join(REPO, compare, f"{slug(rel)}.png"))
        res = residue(s)
        ok_data = not missing
        ok_vis = change is not None and change >= min_change
        ok_res = not res
        ok = ok_data and ok_vis and ok_res
        fails += 0 if ok else 1
        rows.append((rel, ok, ok_data, missing, change, ok_vis, res))
    lines = [f"# Gate report — {surface}", "",
             f"min visual change: {min_change:.0%} · pages: {len(rows)} · PASS: {len(rows)-fails} · FAIL: {fails}", "",
             "| Page | Result | Data | Visual Δ | Residue |", "|---|---|---|---|---|"]
    for rel, ok, okd, miss, ch, okv, res in rows:
        lines.append(f"| `{rel}` | {'✅ PASS' if ok else '❌ FAIL'} | {'ok' if okd else 'missing: ' + ', '.join(miss[:6]) + ('…' if len(miss) > 6 else '')} | "
                     f"{'n/a' if ch is None else f'{ch:.0%}'}{'' if okv else ' ⚠'} | {'clean' if not res else '; '.join(res)} |")
    out = "\n".join(lines) + "\n"
    if report:
        open(os.path.join(REPO, report), "w").write(out)
    print(out)
    sys.exit(1 if fails else 0)


def links(surface):
    """Every relative href/src in the surface must resolve to an existing file."""
    bad = []
    for rel in pages(surface):
        f = os.path.join(PROTO_ROOT, rel, "index.html"); d = os.path.dirname(f)
        s = open(f, encoding="utf-8").read()
        for m in re.finditer(r'(?:href|src)="([^"#?]+)', s):
            u = m.group(1)
            if re.match(r"^(https?:|mailto:|tel:|data:|javascript:|//)", u) or not u.strip():
                continue
            t = os.path.normpath(os.path.join(d, u))
            if os.path.isdir(t):
                t = os.path.join(t, "index.html")
            if not os.path.exists(t):
                bad.append((rel, u))
    for rel, u in bad:
        print(f"BROKEN  {rel}  ->  {u}")
    print(f"links: {len(bad)} broken in {surface}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    s1 = sp.add_parser("snapshot"); s1.add_argument("--surface", required=True); s1.add_argument("--out", required=True)
    s2 = sp.add_parser("check")
    for k in ("surface", "data", "before", "after"):
        s2.add_argument("--" + k, required=True)
    s2.add_argument("--report"); s2.add_argument("--compare"); s2.add_argument("--min-change", type=float, default=0.30)
    s3 = sp.add_parser("links"); s3.add_argument("--surface", required=True)
    a = ap.parse_args()
    if a.cmd == "links":
        links(a.surface)
    elif a.cmd == "snapshot":
        snapshot(a.surface, a.out)
    else:
        check(a.surface, a.data, a.before, a.after, a.report, a.compare, a.min_change)
