#!/usr/bin/env python3
"""
Nestlancer v3 capture tool — renders proto pages to PNG at 1440x900 and 390x844.

Usage:
  python3 tools/v3/capture.py --surface landing --out upgrade-v3/public/baseline
  python3 tools/v3/capture.py --surface web     --out upgrade-v3/client/after
  python3 tools/v3/capture.py --paths admin/dashboard admin/requests --out upgrade-v3/admin/after
  python3 tools/v3/capture.py --surface admin --theme dark --out upgrade-v3/admin/after-dark

Options:
  --full        capture full page height (default: first viewport only)
  --theme       light|dark|auto (auto = whatever the page defaults to; default auto)

Setup (once per sandbox):
  pip install playwright pillow && python3 -m playwright install --with-deps chromium
"""
import argparse, asyncio, glob, os, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
APPS = os.path.join(REPO, "proto", "apps")
VIEWPORTS = [(1440, 900), (390, 844)]


def page_list(surface, paths):
    if paths:
        out = []
        for p in paths:
            p = p.strip("/").replace("/index.html", "")
            out.append(p)
        return out
    files = sorted(glob.glob(os.path.join(APPS, surface, "**", "index.html"), recursive=True))
    return [os.path.relpath(os.path.dirname(f), APPS) for f in files]


def slug(rel):
    return rel.replace("/", "__").replace("[", "_").replace("]", "_")


async def run(pages, out, full, theme):
    from playwright.async_api import async_playwright
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for w, h in VIEWPORTS:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
            if theme in ("light", "dark"):
                # set every known theme key so per-surface keys are covered too
                await ctx.add_init_script(
                    "try{for(const k of ['nl-theme','nl-theme-public','nl-theme-client','nl-theme-admin'])"
                    f"localStorage.setItem(k,'{theme}')}}catch(e){{}}")
            page = await ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            for rel in pages:
                f = os.path.join(APPS, rel, "index.html")
                if not os.path.exists(f):
                    print("MISSING", rel, file=sys.stderr); continue
                await page.goto("file://" + f, wait_until="load")
                await page.wait_for_timeout(900)
                # force any scroll-reveal content visible so captures are honest
                await page.add_style_tag(content="*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}"
                                                 "[data-reveal],.reveal,[data-animate]{opacity:1!important;transform:none!important}")
                await page.wait_for_timeout(150)
                await page.screenshot(path=os.path.join(out, f"{slug(rel)}-{w}.png"), full_page=full)
            if errors:
                with open(os.path.join(out, f"_console-errors-{w}.txt"), "w") as fh:
                    fh.write("\n".join(errors))
            await ctx.close()
        await browser.close()
    print(f"captured {len(pages)} pages x {len(VIEWPORTS)} viewports -> {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--surface", choices=["landing", "web", "admin"])
    ap.add_argument("--paths", nargs="*")
    ap.add_argument("--out", required=True)
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--theme", default="auto", choices=["auto", "light", "dark"])
    a = ap.parse_args()
    if not a.surface and not a.paths:
        ap.error("give --surface or --paths")
    asyncio.run(run(page_list(a.surface, a.paths), os.path.join(REPO, a.out) if not os.path.isabs(a.out) else a.out, a.full, a.theme))
