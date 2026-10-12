# UI grade pipeline (screenshot vs proto)

Regenerates tools/proto/UI_GRADE_REPORT.md. Renders go to a scratch folder and are not committed.

1. python3 map_pairs.py  - maps each screenshot to its proto page (exact or parent route).
2. Serve proto/ on port 8765 after node tools/proto/build.mjs.
3. node render.mjs  - renders each proto page at 1440px and 390px; collects DOM metrics and text.
4. python3 score2.py  - fidelity (audit-note content coverage, length, density), health, UX.
5. python3 report.py  - writes the report.

Scratch paths assume /home/user/grade; browser is @sparticuz/chromium + puppeteer-core.
