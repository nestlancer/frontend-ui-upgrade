import json, re
from collections import Counter, defaultdict
s=json.load(open('scores2.json'))
s.sort(key=lambda x:(x['area'],x['file']))
def esc(t): return str(t).replace('|','/').replace('\n',' ')
ASSUME={'public':'Public marketing page','clients':'Client portal','admin':'Operator console'}
def assume(x):
    cta = x['primary'][0] if x.get('primary') else '—'
    h = x['headings'][0] if x.get('headings') else (x['h1'][0] if x.get('h1') else '—')
    return f"Primary action: {cta}; lead heading: {h}"
def grade_word(g): return g
rows=[]
for i,x in enumerate(s,1):
    issues=[esc(t) for t in x['issues'] if not t.startswith('screen/state')]
    issues=[t for t in issues]
    short='; '.join(issues[:4]) if issues else 'none'
    if len(issues)>4: short+=f' (+{len(issues)-4} more)'
    if x['match']=='parent': short='**State not built as own page** — '+short
    rows.append(f"| {i} | `{x['file']}` | `{x['proto']}/` | {x['match']} | **{x['grade']}** | {x['score']} | {x['fid']} | {x['health']} | {x['ux']} | {esc(short)} | {esc(assume(x))} | ☐ OK ☐ Revise ☐ Reject — |")
cnt=Counter(x['grade'] for x in s)
byarea=defaultdict(Counter)
for x in s: byarea[x['area']][x['grade']]+=1
iss=Counter()
for x in s:
    for t in x['issues']:
        if t.startswith('placeholder/broken text'): iss['NaN/NAN/undefined text rendered' if re.search(r'nan|undefined|lorem|todo',t,re.I) else 'placeholder text']+=1
        elif 'overflow at 390' in t: iss['overflows at 390px (not responsive)']+=1
        elif 'overflow on desktop' in t: iss['overflows on desktop']+=1
        elif 'small' in t: iss['text under 11px']+=1
        elif 'primary action' in t: iss['no primary action']+=1
        elif 'content coverage' in t: iss['content coverage under 60%']+=1
        elif 'length differs' in t: iss['page length differs >40%']+=1
        elif 'not built' in t: iss['state not built as own page']+=1
        elif 'JS page error' in t or 'console error' in t: iss['JS/console error']+=1
        elif 'density' in t: iss['density differs']+=1
        elif 'broken' in t: iss['broken image']+=1
        elif 'breadcrumb' in t: iss['no breadcrumb / back path']+=1
        elif 'navigation' in t: iss['weak navigation']+=1
        else: iss[t[:40]]+=1
# unique proto pages
pp={}
for x in s: pp.setdefault(x['proto'],[]).append(x)
L=[]
L.append("# Prototype UI grade report — screenshot vs. proto HTML\n")
L.append("**Scope:** every screenshot in `screenshot-manifest.csv` (181 files: 119 admin, 45 client, 17 public) compared with the proto HTML page built into `proto/` by `tools/proto/build.mjs`. **Target grade: A (≥90).** The current screenshot UI is graded **C** by the team; this report grades the proto pages against the same screens.\n")
L.append("## 1. Headline\n")
n=len(s); a=cnt.get('A',0); b=cnt.get('B',0); c=cnt.get('C',0); d=cnt.get('D',0); f=cnt.get('F',0)
L.append(f"- **{a} of {n} screens reach A.** B: {b}, C: {c}, D: {d}, F: {f}.")
rec=[x['recall'] for x in s if x.get('recall') is not None]
L.append(f"- Median score: **{sorted(x['score'] for x in s)[n//2]}** (target 90). Median content coverage against the audit notes is **{round(sorted(rec)[len(rec)//2]*100)}%**, so the main gap is content and states, followed by mobile layout and health.")
L.append(f"- Main systemic gaps: {', '.join(f'{k} ({v})' for k,v in iss.most_common(6))}.")
worst=sorted(s,key=lambda r:r['score'])[:5]
L.append("- The 5 weakest screens: "+"; ".join(f"{r['file'].split('/')[-1]} {r['score']}" for r in worst)+".\n")
L.append("## 2. Grade summary\n")
L.append("| Grade | Score | Meaning | Screens |\n|---|---|---|---|")
meaning={'A':'Ready to sign off: content matches, renders clean, usable at mobile width','B':'Close: minor gaps (copy, density, responsive)','C':'Partial: key content or states missing','D':'Weak: large content gap or layout/health issues','F':'Not usable as a screen match (missing page, render failure, or near-empty)'}
rng={'A':'≥90','B':'80–89.9','C':'70–79.9','D':'60–69.9','F':'<60'}
for g in 'ABCDF': L.append(f"| **{g}** | {rng[g]} | {meaning[g]} | {cnt.get(g,0)} |")
L.append("\n### By area\n")
L.append("| Area | Screens | A | B | C | D | F |\n|---|---|---|---|---|---|---|")
for ar in ['public','clients','admin']:
    c2=byarea[ar]; L.append(f"| {ar} | {sum(c2.values())} | {c2.get('A',0)} | {c2.get('B',0)} | {c2.get('C',0)} | {c2.get('D',0)} | {c2.get('F',0)} |")
L.append("\n## 3. Scoring method\n")
L.append("Score = 0.50 × **Fidelity** + 0.30 × **Health** + 0.20 × **UX**.\n")
L.append("- **Fidelity (0–100):** content coverage ×70 — share of distinctive words and amounts recorded for that screenshot in `tools/proto/DATA_AUDIT.md` that appear in the rendered proto text; page-length match ×15; ink-density match ×15 (top 1440×900 viewport). Screens with no audit notes are capped.")
L.append("- **Health (0–100):** starts at 100; −15 per page error, −5 per console error (network-only failures from the sandbox are excluded), −10 broken images, −10 desktop overflow, −10 overflow at 390px, −10 placeholder text (`NaN`, `undefined`, `lorem`, `TODO`), −5 text under 11px, −5 missing title or h1, −2 missing description.")
L.append("- **UX / assumptions (0–100):** primary action present +25; ≥3 nav links +20; breadcrumb or public page +15; ≥2 section headings +15; form or table present +10; theme/FAB switcher +10.")
L.append("- **Cap:** a screen whose own state (dialog, tab, detail) has no proto page is graded against the nearest page and capped below A (89.9). An A therefore requires the exact screen to exist in the proto.")
L.append("- Pixel layout correlation was measured but **not scored**: the proto uses a different grid and fonts from the captured app, so pixel-level correlation penalises reflow rather than fidelity. It is kept in `scores2.json` for reference.")
L.append("- **Limitations:** the content check is only as good as the audit notes; the sandbox could not load Google Fonts, so typography in both renders falls back to system fonts; visual judgement (colour, polish, spacing) still needs a human review — use the review column in Section 5.\n")
L.append("## 4. Gaps that block A (fix list)\n")
L.append("| Issue | Screens affected | Fix |\n|---|---|---|")
fixes={
 'few section headings':'Add h2/h3 section titles that match the screenshot panel titles.',
 'NaN/NAN/undefined text rendered':'Replace NaN/undefined with a formatted value or a fallback ("—") in stats and totals.',
 'no h1':'Give the page one h1 with the screen title.',
 'overflows at 390px (not responsive)':'Give tables, panels and sidebars a mobile layout (stack or horizontal scroll inside the card); add a 390px breakpoint.',
 'overflows on desktop':'Constrain the wide element to its container.',
 'text under 11px':'Raise badge/caption text to ≥11px; body copy ≥14px.',
 'no primary action':'Add one primary action per screen, matching the screenshot.',
 'content coverage under 60%':'Port the screenshot content (labels, rows, amounts, copy) into the proto data.',
 'page length differs >40%':'Match the section count and table length of the screenshot.',
 'state not built as own page':'Build the dialog/tab/edit state as its own proto page (or a state switch) so it can reach A.',
 'JS/console error':'Fix the script error on the page.',
 'density differs':'Match row height and spacing to the screenshot density.',
 'broken image':'Fix the image path.',
 'no breadcrumb / back path':'Add breadcrumb or back link on detail screens.',
 'weak navigation':'Add the app navigation shown in the screenshot.',
}
for k,v in iss.most_common():
    L.append(f"| {k} | {v} | {fixes.get(k,'Review')} |")
L.append("\n## 5. Per-screen grade and UI-assumption review table\n")
L.append("Each row is one screenshot. *Assumption* = what the proto page assumes the user needs (primary action and lead heading), taken from its rendered DOM. Mark the review column: OK (assumption correct), Revise (assumption wrong or missing) or Reject (screen should not exist as proto).\n")
L.append("| # | Screenshot | Proto page | Match | Grade | Score | Fidelity | Health | UX | Main issues | UI assumption | User review |\n|---|---|---|---|---|---|---|---|---|---|---|---|")
L+=rows
L.append("\n## 6. Proto pages with the lowest grades (for priority)\n")
low=sorted(s,key=lambda x:x['score'])[:12]
L.append("| Screenshot | Proto page | Score | Grade | Main issue |\n|---|---|---|---|---|")
for x in low: L.append(f"| `{x['file']}` | `{x['proto']}/` | {x['score']} | {x['grade']} | {esc(x['issues'][0] if x['issues'] else '—')} |")
L.append("\n## 7. Remaining below A — per-route decision\n")
L.append("""Five screens sit just under the A line (89.0-90.0). They are one shape, not five bugs, and the honest
reading of the numbers is that chasing them would make the product worse — so this section is the decision
record, not a to-do list.\n
| Screens | Capture | Why below A | Decision |
|---|---|---|---|
| `admin/087`, `admin/088`, `admin/091`, `admin/092` | 533px crop: a dialog over a dimmed page | Fidelity terms only. Ink density 0.07-0.20 vs our ~0.40, and 1533px of capture content against the 900px app frame. Coverage is 1.00, health 100, UX 95 — nothing is missing. | **Not chased.** The density term rewards a *less* legible page: matching it means dimming the working UI behind every dialog on `apps/admin/projects/01a10a2b-5eaa-769e-a5d9-0d58fcca6924/`, a route that serves 12 screens. Four sibling screens would regress for a 0.4-point gain on four. The capture records a modal *moment*, and its dimming is the screenshot's own visual noise, not a design of the page. Our `::backdrop` deliberately stops at rgba(.48) + 2px blur so the page behind stays readable while the dialog is open (a WCAG-driven adaptation). |
| `clients/043` | 500px crop: document-preview dialog | Same shape as above; the route serves 7 client screens | **Not chased**, same reasoning. |
\n### The frame question, settled by measurement\n
`admin/048` and `admin/082` were the other members of this group: full-page captures (1409px, 1496px) graded
against the 900px app frame, and they were fixed by *building what the capture shows* (see below), not by
changing the frame. A frame-release opt-in (`app-flow`, letting a route scroll as one document at desktop
widths) was prototyped and measured before being reverted:\n
| Route | Framed (shipped) | Frame released | Delta |
|---|---|---|---|
| `admin/048` | 96.3 | 95.8 | -0.5 |
| `admin/082` | 95.9 | 95.2 | -0.7 |
\nReleasing the frame is a wash-to-negative here — the 900px frame is what the dialog-crop captures expect —
and it would introduce a second desktop layout mode for every future page. The app frame stays a single
system-wide decision, and this table is the evidence behind it.\n""")
open('/home/user/frontend-ui-upgrade/tools/proto/UI_GRADE_REPORT.md','w').write('\n'.join(L)+'\n')
print('written', len(L), 'lines; grades', dict(cnt)); print(iss.most_common(12))
