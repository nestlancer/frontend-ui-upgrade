# tools/v3: verification for the v3 prompts

Used by `ai-prompt-v3.md` (public), `ai-prompt-v3.1.md` (client) and `ai-prompt-v3.2.md` (admin).

```bash
pip install playwright pillow && python3 -m playwright install --with-deps chromium
```

| Command | What it does |
|---|---|
| `python3 tools/v3/capture.py --surface landing\|web\|admin --out <dir> [--theme light\|dark] [--full]` | Screenshots every page at 1440×900 and 390×844 (animations frozen, reveal content forced visible). Writes `_console-errors-*.txt` if pages throw. |
| `python3 tools/v3/gate.py snapshot --surface <s> --out <json>` | Records the mock-data tokens per page (₹ amounts, NL-/UUID IDs, emails, dates, %, seed names). |
| `python3 tools/v3/gate.py check --surface <s> --data <json> --before <dir> --after <dir> [--min-change 0.30] [--report md] [--compare dir]` | DATA + VISUAL + RESIDUE gates, per page. Exit code 1 if any page fails. `--compare` writes before/after side-by-side PNGs. |
| `python3 tools/v3/gate.py links --surface <s>` | Every relative `href`/`src` resolves (baseline: 0 broken on all surfaces). |

Baseline facts (2026-10-16): data tokens: landing 47, web 294, admin 1,150. A palette-only change measured 0.4–2.4% visual change, so the 30% threshold requires real shell and layout work.
