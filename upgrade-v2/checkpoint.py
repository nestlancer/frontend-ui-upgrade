"""Update explicit reviewed-page coverage and a cumulative baseline-relative manifest.
Does not promote shared-only pages or overwrite unknown/future batch decisions.
"""
from pathlib import Path
import csv,json,hashlib,subprocess
from collections import Counter
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'upgrade-v2'
BASE=json.loads((OUT/'data-baseline.json').read_text())['commit']
# Recorded baseline lived on an earlier session branch; main@dfc0f42 has byte-identical originals.
if subprocess.run(['git','cat-file','-e',BASE],cwd=ROOT,capture_output=True).returncode:BASE='dfc0f4296503d2d7946b9126bf7f6782f45fab7e'
def savecsv(path,rows):
 with path.open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)
first=json.loads((OUT/'test-paths.json').read_text());second=json.loads((OUT/'batch-2-paths.json').read_text());third=json.loads((OUT/'batch-3-paths.json').read_text());edited=['proto/'+p for p in first+second+third]
# Base rendering is distinct from exact original screenshot-state equivalence.
blocked={4:'Mapped payment screenshots use different records from the preserved page fixture',6:'Mapped project screenshot uses a different record from the preserved page fixture',13:'Source 004-contact uses Subject / General; preserved HTML has Company and Topic / New project inquiry'}
blocked.update({14:'Source 002 has twelve cards and 110 total; preserved web fixture has ten cards and conflicting 110/106 totals',15:'Source 003 reads 2 min; preserved full article reads 8 min and contains additional source figures',17:'Source 005 shows Samira Patel and two conversation previews; preserved fixture is Ananya Iyer with four previews and a Riya thread'})
arts=['A1;A3;A4;A5;A6','A2','','A3','','A3;A4;A5;A6','','','A7','A8','A6','A3;A5;A6;A7;A9','A9','A8']
refs=['R1;R2;R4;R5','R2;R4;R5','R2;R4;R5','R4;R5','R3;R4;R5','R2;R4;R5;R6','R4;R5;R6','R4;R5','R2;R4;R5','R2;R4;R5','R4;R5','R4;R5;R6','R4;R5','R4;R5;R7']
arts += ['A3;A5;A6;A7;A9','A9','A6;A10','']
refs += ['R4;R5;R6','R4;R5','R4;R5;R7','R4;R6;R7']
qa3=json.loads((OUT/'evidence/batch3-browser-qa.json').read_text())
assert len(qa3['layouts'])==40 and len(qa3['axe'])==16
assert not qa3['errors'] and not any(x['violations'] for x in qa3['axe'])
assert not any(x['hidden'] or ('reduced' in x['mode'] and x['running']) for x in qa3['visibility'])
qa=json.loads((OUT/'evidence/batch2-browser-qa.json').read_text())
assert len(qa['layout'])==60 and len(qa['axe'])==24
assert not qa['errors'] and not any(x['violations'] for x in qa['axe'])
assert not any(x['hidden'] or ('reduced' in x['mode'] and x['running']) for x in qa['visibility'])
pages=list(csv.DictReader((OUT/'PAGE_COVERAGE.csv').open()))
for row in pages:
 changed=hashlib.sha256((ROOT/row['page_path']).read_bytes()).hexdigest()!=row['baseline_sha256'];row['html_changed']=str(changed).lower();row['shared_only']=str(not changed).lower()
 if row['page_path'] not in edited:continue
 i=edited.index(row['page_path']);reason=blocked.get(i,'')
 row.update(status='IMPLEMENTED_UNVERIFIED' if reason else 'VERIFIED',art_asset_ids=arts[i],motion_ids=f'M{i+1}',reference_ids=refs[i],qa_status='BASE_PAGE_PASS;MAPPED_DATA_BLOCKED' if reason else 'BROWSER_REVIEW_PASS',blocker=reason,next_action='Reconstruct the original screenshot state separately without changing current defaults/data' if reason else 'Continue sibling routes; retain regression coverage')
savecsv(OUT/'PAGE_COVERAGE.csv',pages)
states=list(csv.DictReader((OUT/'STATE_COVERAGE.csv').open()))
for row in states:
 if row['proto_path'] not in edited:continue
 i=edited.index(row['proto_path']);reason=blocked.get(i,'');stem=f'final-{i}' if i<8 else f'batch2-after-{i-8}' if i<14 else f'batch3-after-{i-14}'
 row.update(status='BLOCKED' if reason else 'VERIFIED',trigger_or_url='/'+row['proto_path'].removeprefix('proto/'),evidence=f'upgrade-v2/evidence/{stem}-390.webp;upgrade-v2/evidence/{stem}-1440.webp;upgrade-v2/evidence/'+('browser-qa.json' if i<8 else 'batch2-browser-qa.json' if i<14 else 'batch3-browser-qa.json'),blocker=reason+'; base-page QA passes, exact original state remains unimplemented.' if reason else '')
savecsv(OUT/'STATE_COVERAGE.csv',states)
# Retain existing motion records, adding only this reviewed batch.
motions=list(csv.DictReader((OUT/'MOTION_REGISTER.csv').open()));motions=[x for x in motions if x['motion_id'] not in [f'M{i}' for i in range(9,15)]]
spec=[('Collaboration scene + workflow section reveals','.about-art; .studio-workflow; .reveal','load/scroll/hover/focus/anchor','opacity/transform','640-1050','0-160'),('Correspondence scene + native FAQ','.contact-art; .handoff-faq; .reveal','load/scroll/hover/focus/keyboard','opacity/transform','640-900','0-160'),('Case-study scene + section navigation','.case-art; .case-nav; .reveal','load/scroll/hover/focus/anchor','opacity/transform','640-950','0-180'),('Editorial cover response + real local filters','.journal-cover img; [data-blog-list]','load/scroll/hover/focus/input/keyboard','opacity/transform','180-900','0-240'),('Quiet article entrance, static reading body','.article-heading; .article-cover; .article-toc','load/anchor/keyboard','opacity/transform','640-900','0-240'),('Quiet form entrance and correspondence art','.contact-support-art; [data-demo-contact]','load/keyboard/input/submit','opacity/transform','640-900','0-120')]
for j,(purpose,sel,trigger,prop,duration,delay) in enumerate(spec):
 motions.append(dict(motion_id=f'M{j+9}',page_paths=edited[j+8],selector=sel,trigger=trigger,property=prop,duration_ms=duration,delay_ms=delay,easing='var(--ease-out); inherited --ease-expo',repeat='one-shot; no new continuous loops',mobile_behavior='responsive stacking; native touch/keyboard controls',reduced_motion_behavior='immediate readable content; no choreography; preference changes tested',owner_file='proto/shared/assets/editorial.css;proto/shared/assets/studio.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/batch2-browser-qa.json;upgrade-v2/evidence/batch2-after-'+str(j)+'-390.webp'))
motions=[x for x in motions if x['motion_id'] not in ['M15','M16','M17','M18']]
for j,sel in enumerate(['.web-journal .journal-card; [data-content-filter]','.web-article .article-heading; .article-toc; [data-content-toggle]','.web-case-figure; .web-case-gallery; .case-nav','.inbox-workspace; [data-conversation]; [data-local-draft]']):
 motions.append(dict(motion_id=f'M{j+15}',page_paths=edited[j+14],selector=sel,trigger='load/scroll/hover/focus/keyboard/input',property='opacity/transform',duration_ms='180-950',delay_ms='0-240',easing='var(--ease-out/--ease-expo)',repeat='one-shot; no running animations in settled sample',mobile_behavior='responsive stacking; focus and return navigation',reduced_motion_behavior='no running motion; visible content; JS-only controls disabled without JS',owner_file='proto/shared/assets/editorial.css;proto/shared/assets/inbox.css;proto/shared/assets/content-tools.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/batch3-browser-qa.json;upgrade-v2/evidence/batch3-after-'+str(j)+'-390.webp'))
savecsv(OUT/'MOTION_REGISTER.csv',motions)
# Batch 4 (resumed run): admin dashboard + local page-search dialog (source 015 / 072).
qa4=json.loads((OUT/'evidence/batch4-browser-qa.json').read_text())
assert len(qa4['layouts'])==10 and len(qa4['axe'])==8 and not qa4['errors']
assert not any(x['violations'] for x in qa4['axe'])
assert not any(x['hidden'] or ('reduced' in x['mode'] and x['running']) for x in qa4['visibility'])
dash='proto/apps/admin/dashboard/index.html'
for row in pages:
 if row['page_path']==dash:row.update(status='VERIFIED',motion_ids='M19',reference_ids='R4;R5;R7',qa_status='BROWSER_REVIEW_PASS',blocker='',next_action='Continue admin siblings; retain regression coverage')
savecsv(OUT/'PAGE_COVERAGE.csv',pages)
notes={'015-dashboard':'','072-global-search-admin-dialog':'State opened via Search pages button, top search field, Ctrl/Cmd+K or /. Groups and destinations match source; additionally lists Notifications from the existing sidebar.'}
for row in states:
 if row['proto_path']==dash and row['state_name'] in notes:
  dialog=row['state_name'].startswith('072')
  row.update(status='VERIFIED',trigger_or_url='/apps/admin/dashboard/index.html'+(' + click [data-operator-search-open] or Ctrl/Cmd+K' if dialog else ''),evidence='upgrade-v2/evidence/batch4-'+('search-' if dialog else '')+'light-1440.webp;upgrade-v2/evidence/batch4-'+('search-' if dialog else '')+'dark-390.webp;upgrade-v2/evidence/batch4-browser-qa.json',blocker=notes[row['state_name']])
savecsv(OUT/'STATE_COVERAGE.csv',states)
motions=[x for x in motions if x['motion_id']!='M19']
motions.append(dict(motion_id='M19',page_paths=dash,selector='.operator-metrics; .operator-charts svg.nl-chart; #operator-search',trigger='load/scroll/click/keyboard(Ctrl+K,/,Arrow,Escape)',property='opacity/transform; stroke-dashoffset on existing charts',duration_ms='150-1300',delay_ms='0-240',easing='var(--ease-out/--ease-expo)',repeat='one-shot; settled sample has no running animations',mobile_behavior='stacked metrics; full-width dialog inside viewport',reduced_motion_behavior='no running animations incl. dialog; content visible; search disabled without JS',owner_file='proto/shared/assets/operator.css;proto/shared/assets/operator.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/batch4-browser-qa.json'))
savecsv(OUT/'MOTION_REGISTER.csv',motions)
# Batches 5–7 (resumed run): the remaining 169 pages — 20 public (implement-batch-5.py),
# 50 client + 98 admin (implement-workbench.py + implement-workbench-fixes.py) and the
# admin redirect stub. Browser evidence: qa-lanes.cjs shards final-{1,2,3}; public
# interactions: qa-batch-5.cjs.
lane_pages,lane_fail,shot={},{},{}
for k in (1,2,3):
 qa=json.loads((OUT/f'evidence/final-{k}-browser-qa.json').read_text())
 for i,pg in enumerate(qa['pages']):
  lane_pages['proto/'+pg['path']]=pg;shot['proto/'+pg['path']]=(k,i)
 for x in json.loads((OUT/f'evidence/final-{k}-failures.json').read_text()):lane_fail['proto/'+x['path']]=x['f']
assert len(lane_pages)==169
# Targeted rerun after fixing the shard failures (landmarks, wrap, dark/light contrast).
fixqa=json.loads((OUT/'evidence/final-fix-browser-qa.json').read_text());fixfail={'proto/'+x['path'] for x in json.loads((OUT/'evidence/final-fix-failures.json').read_text())}
refixed=set();fixidx={}
for j,pg in enumerate(fixqa['pages']):
 fixidx['proto/'+pg['path']]=j
 p='proto/'+pg['path']
 if p in lane_pages and p not in fixfail:lane_fail.pop(p,None);refixed.add(p)
b5=json.loads((OUT/'evidence/batch-5-interactions.json').read_text());assert b5 and all(x['pass'] for x in b5)
ART5={'landing/register':'A11','landing/forgot-password':'A11','landing/reset-password':'A11','landing/verify-email':'A12','landing/verify':'A12','landing/verify-document':'A12','landing/admin-login':'A13','web/impersonate':'A13','landing/blog':'A14;A2;A3;A5;A6;A9;A10','landing/blog':'A14;A3;A6;A9;A10','landing/blog':'A14;A9;A10','web/share/[token]':'A15','web':'A1','landing/about':'A7','landing/portfolio':'A3;A4;A5;A6','landing/portfolio':'A3;A4;A5;A6','landing/blog/[slug]':'A9','landing/portfolio/[id]':'A6;A10'}
def ev(path):
 if path in refixed:
  j=fixidx[path];return f'upgrade-v2/evidence/final-fix-{j}-light-1440.webp;upgrade-v2/evidence/final-fix-{j}-dark-390.webp;upgrade-v2/evidence/final-fix-browser-qa.json'
 k,i=shot[path];return f'upgrade-v2/evidence/final-{k}-{i}-light-1440.webp;upgrade-v2/evidence/final-{k}-{i}-dark-390.webp;upgrade-v2/evidence/final-{k}-browser-qa.json'
for row in pages:
 path=row['page_path']
 if path not in lane_pages:continue
 f=lane_fail.get(path,[]);route=path.removeprefix('proto/apps/').removesuffix('/index.html').removesuffix('index.html').rstrip('/')
 public=row['surface']=='public';stub=path=='proto/apps/admin/index.html'
 row.update(status='IMPLEMENTED_UNVERIFIED' if f else 'VERIFIED',art_asset_ids=ART5.get(route,''),motion_ids='M21' if public else 'M20' if not stub else '',reference_ids='R4;R5;R6;R7' if public else 'R4;R6;R7',qa_status=('BROWSER_REVIEW_ISSUES' if f else 'BROWSER_REVIEW_PASS')+(';INTERACTIONS_PASS' if public else ';WORKBENCH_INTERACTIONS_PASS' if not stub else ';REDIRECT_STUB'),blocker='; '.join(f)[:400],next_action='Resolve listed QA issues' if f else 'Retain regression coverage; reconstruct mapped screenshot states listed in STATE_COVERAGE where blocked')
savecsv(OUT/'PAGE_COVERAGE.csv',pages)
PARENT={'037-global-search-client-dialog':('VERIFIED',' + click the top search field, Ctrl/Cmd+K or /','Page-search dialog lists this page\'s own sidebar destinations; evidence batch6-state-search-*.webp'),
 '030-dashboard-inbox-panel':('VERIFIED','','Inbox panel is the dashboard default live-workbench view'),
 '031-dashboard-pay-now-panel':('BLOCKED','','Preserved dashboard only contains the Inbox panel; the Pay now tab links to the payments page. In-page panel not reconstructed to avoid inventing layout/data.'),
 '032-dashboard-projects-panel':('BLOCKED','','Preserved dashboard only contains the Inbox panel; the Projects tab links to the projects page. In-page panel not reconstructed.'),
 '033-dashboard-quotes-panel':('BLOCKED','','Preserved dashboard only contains the Inbox panel; the Quotes tab links to the quotes page (0 quotes). In-page panel not reconstructed.'),
 '034-files-archive-preview-dialog':('BLOCKED','','Archive preview dialog is absent from the preserved files fixture; not invented.'),
 '035-files-file-actions-menu':('BLOCKED','','Per-file actions menu is absent from the preserved files fixture; not invented.'),
 '082-portfolio-item-analytics-panel':('VERIFIED','','Item analytics panel is rendered in-page by default')}
for sid in ['097-quote-editor-custom-payment-schedule','098-quote-editor-line-item-library','099-quote-editor-pricing-and-schedule','100-quote-editor-scope-and-line-items','101-quote-editor-terms-and-review']:
 PARENT[sid]=('IMPLEMENTED_UNVERIFIED','','Step content exists in the single-page quote editor (Line items / Library / Payment schedule incl. Custom % / Terms / Send); the stepped-wizard state of the source is not separately reconstructed.')
for row in states:
 path=row['proto_path']
 if path not in lane_pages or row['status']!='NOT_STARTED':continue
 f=lane_fail.get(path,[]);url='/'+path.removeprefix('proto/');name=row['state_name']
 if name in PARENT:
  st,trig,note=PARENT[name]
  extra=';upgrade-v2/evidence/batch6-state-search-light-1440.webp;upgrade-v2/evidence/batch6-state-search-dark-390.webp' if name.startswith('037') else ''
  row.update(status=st if not (f and st=='VERIFIED') else 'IMPLEMENTED_UNVERIFIED',trigger_or_url=url+trig,evidence=ev(path)+extra,blocker=note)
 elif row['verdict']=='DATA-DIFFERS':
  row.update(status='BLOCKED',trigger_or_url=url,evidence=ev(path),blocker='Mapped screenshot record differs from the preserved page fixture; base-page QA passes, exact original state remains unimplemented.')
 else:
  inpage=row['verdict']=='VERIFIED-STATE'
  row.update(status='IMPLEMENTED_UNVERIFIED' if f else 'VERIFIED',trigger_or_url=url,evidence=ev(path),blocker=('; '.join(f)[:300] if f else '')+('In-page state (preview/section) rendered at the page URL.' if inpage and not f else ''))
# Batch 8 (resumed run): quote-builder steps made functional on the preserved quote/new page
# (quote-steps.js). Evidence: qa-quote-steps.cjs → batch8-quote-steps.json + batch8-state-*.webp.
QPATH='proto/apps/admin/requests/01a10a2c-01c3-7079-93e9-9d001541ced8/quote/new/index.html'
b8=json.loads((OUT/'evidence/batch8-quote-steps.json').read_text())['results'];assert b8 and all(x['pass'] for x in b8),[x for x in b8 if not x['pass']]
B8REC=' Interaction state reproduced over the preserved fixture record (Live Shipment Tracking Dashboard, ₹0.00 draft); the source screenshot record (AUDIT-P23 edit, ₹1,250.00) is not substituted.'
B8={'100-quote-editor-scope-and-line-items':('VERIFIED',' → step 1 Scope (default)','100-scope','Step 1 Scope & line items: tablist, summary rail and progress.'+B8REC),
 '099-quote-editor-pricing-and-schedule':('VERIFIED',' → Next / tab 2 Pricing','099-pricing','Step 2 Pricing & schedule in Preset mode with the stored 50/50 installments.'+B8REC),
 '097-quote-editor-custom-payment-schedule':('VERIFIED',' → tab 2 Pricing → Custom %','097-custom','Custom % editor seeded from the stored installments; add/remove rows; live 100% total check blocks Create quote.'+B8REC),
 '101-quote-editor-terms-and-review':('VERIFIED',' → tab 3 Terms','101-terms','Step 3 Terms & review: standard terms snapshot, project-specific terms with live count, signed-agreement option.'+B8REC),
 '098-quote-editor-line-item-library':('BLOCKED',' → step 1 → Line-item library','098-library','Library disclosure opens, but the preserved fixture contains no reusable blocks (source shows six: Discovery & Scoping … Project Management); an honest empty note is shown and no blocks are invented.')}
for row in states:
 if row['state_name'] in B8:
  st,trig,shot,note=B8[row['state_name']]
  row.update(status=st,trigger_or_url='/'+QPATH.removeprefix('proto/')+trig,evidence=f'upgrade-v2/evidence/batch8-state-{shot}-light-1440.webp'+(';upgrade-v2/evidence/batch8-state-097-custom-dark-390.webp' if shot=='097-custom' else '')+';upgrade-v2/evidence/batch8-quote-steps.json',blocker=note)
for row in pages:
 if row['page_path']==QPATH:
  if 'M22' not in row['motion_ids']:row['motion_ids']=(row['motion_ids']+';M22').strip(';')
  if 'QUOTE_STEPS_PASS' not in row['qa_status']:row['qa_status']+=';QUOTE_STEPS_PASS'
savecsv(OUT/'PAGE_COVERAGE.csv',pages)
savecsv(OUT/'STATE_COVERAGE.csv',states)
motions=[x for x in motions if x['motion_id'] not in ('M20','M21','M22')]
client_admin=';'.join(p for p in lane_pages if '/apps/web/' in p or '/apps/admin/' in p if p not in [r['page_path'] for r in pages if r['surface']=='public'] and p!='proto/apps/admin/index.html')
public5=';'.join(r['page_path'] for r in pages if r['surface']=='public' and r['page_path'] in lane_pages)
motions.append(dict(motion_id='M20',page_paths=client_admin,selector='dialog.wb-dialog; #wb-status; [data-wb-sections] a; #operator-search; inherited .reveal/.prog/.nl-chart',trigger='load/scroll/click/keyboard(Ctrl+K,/,Escape,Space)/input',property='opacity/transform (dialog 160ms, toast 180ms); inherited reveal/progress/CTA motion',duration_ms='160-2400',delay_ms='0-1500',easing='var(--ease-out); inherited --ease-expo',repeat='one-shot; inherited bounded nl-shine x2 / nl-cta x3 end <9s; no infinite loops',mobile_behavior='card tables, wrapping tabs/actions, full-width dialogs',reduced_motion_behavior='no dialog/toast animation; inherited motion disabled; content visible; JS-only controls disabled without JS',owner_file='proto/shared/assets/workbench.css;proto/shared/assets/workbench.js;proto/shared/assets/operator.css;proto/shared/assets/operator.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/final-1-browser-qa.json;upgrade-v2/evidence/final-2-browser-qa.json;upgrade-v2/evidence/final-3-browser-qa.json'))
motions.append(dict(motion_id='M21',page_paths=public5,selector='.flow-figure; .auth-art; [data-reading-rail] .rail-link; [data-section-reveal]; inherited .reveal/.anim-in',trigger='load/scroll/click/input/keyboard',property='opacity/transform; color/background on rail active state (160ms)',duration_ms='160-1050',delay_ms='0-240',easing='var(--ease-out); inherited --ease-expo',repeat='one-shot; no running animations in settled sample',mobile_behavior='art stacks or hides below 600px; OTP cells shrink; forms single column',reduced_motion_behavior='rail transition off; inherited choreography off; content visible',owner_file='proto/shared/assets/public-flow.css;proto/shared/assets/public-flow.js;proto/shared/assets/studio.css;proto/shared/assets/studio.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/final-1-browser-qa.json;upgrade-v2/evidence/batch-5-interactions.json'))
motions.append(dict(motion_id='M22',page_paths=QPATH,selector='#rq-quote-builder .qsteps-panel; [role=tab]; .qsteps-progress',trigger='click/keyboard (Arrow/Home/End, Back/Next)',property='opacity/transform on the entering step panel',duration_ms='170',delay_ms='0',easing='var(--ease-out)',repeat='one-shot per step change',mobile_behavior='rail stacks under the steps; custom rows wrap to two lines',reduced_motion_behavior='no panel animation (verified animationName none); focus/announcement unchanged',owner_file='proto/shared/assets/workbench.css;proto/shared/assets/quote-steps.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/batch8-quote-steps.json'))
savecsv(OUT/'MOTION_REGISTER.csv',motions)
counts={'status':dict(Counter(r['status'] for r in pages)),'surfaces':{},'html_changed':sum(r['html_changed']=='true' for r in pages),'shared_only':sum(r['shared_only']=='true' for r in pages),'states':dict(Counter(r['status'] for r in states))}
for surface in ['public','client','admin']:
 selected=[r for r in pages if r['surface']==surface];counts['surfaces'][surface]={'total':len(selected),'edited':sum(r['html_changed']=='true' for r in selected),'status':dict(Counter(r['status'] for r in selected))}
(OUT/'evidence/coverage-summary.json').write_text(json.dumps(counts,indent=2))
# Baseline-relative means committed checkpoint files do not disappear from the
# manifest on the next batch. Exclude only the manifest itself (recursive hash).
tracked=subprocess.check_output(['git','diff','--name-only',BASE,'--'],cwd=ROOT,text=True).splitlines()
new=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines()
original=set(subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines());manifest=[]
for name in sorted(set(tracked+new)):
 p=ROOT/name
 if not p.is_file() or name=='upgrade-v2/DELIVERY_MANIFEST.csv' or '__pycache__' in name:continue
 manifest.append(dict(path=name,kind='application' if name.startswith('proto/') else 'evidence' if '/evidence/' in name else 'documentation/tool',change='MODIFIED' if name in original else 'NEW',size_bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
savecsv(OUT/'DELIVERY_MANIFEST.csv',manifest)
print(json.dumps(counts,indent=2));print('Manifest paths',len(manifest),'bytes',sum(r['size_bytes'] for r in manifest))
