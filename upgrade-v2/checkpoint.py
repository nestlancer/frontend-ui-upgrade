"""Update honest coverage and reproducible file manifest; does not modify proto."""
from pathlib import Path
import csv,json,hashlib,subprocess
from collections import Counter,defaultdict
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'upgrade-v2'
def savecsv(path,rows,fields=None):
 with path.open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)
paths=json.loads((OUT/'test-paths.json').read_text()); edited=['proto/'+p for p in paths]
page_rows=list(csv.DictReader((OUT/'PAGE_COVERAGE.csv').open()))
art=['A1;A3;A4;A5;A6','A2','','A3','','A3;A4;A5;A6','','']
refs=['R1;R2;R4;R5','R2;R4;R5','R2;R4;R5','R4;R5','R3;R4;R5','R2;R4;R5;R6','R4;R5;R6','R4;R5']
for row in page_rows:
 p=ROOT/row['page_path']; changed=hashlib.sha256(p.read_bytes()).hexdigest()!=row['baseline_sha256'];row['html_changed']=str(changed).lower();row['shared_only']=str(not changed).lower()
 if row['page_path'] in edited:
  i=edited.index(row['page_path']);row.update(status='VERIFIED' if i not in [4,6] else 'IMPLEMENTED_UNVERIFIED',art_asset_ids=art[i],motion_ids='M'+str(i+1),reference_ids=refs[i],qa_status='BASE_PAGE_PASS;MAPPED_DATA_BLOCKED' if i in [4,6] else 'BROWSER_REVIEW_PASS',blocker='Mapped screenshot uses a different record from the preserved page fixture' if i in [4,6] else '',next_action='Resolve screenshot fixture provenance; implement exact state separately without replacing current data' if i in [4,6] else 'Continue sibling routes; retain regression coverage')
 else:row.update(status='NOT_STARTED',qa_status='SHARED_SMOKE_ONLY;NOT_PAGE_VERIFIED',next_action='Page-level implementation and mapped-state review still required')
savecsv(OUT/'PAGE_COVERAGE.csv',page_rows)
states=list(csv.DictReader((OUT/'STATE_COVERAGE.csv').open()))
for row in states:
 row['trigger_or_url']='/'+row['proto_path'].removeprefix('proto/')+' (base URL; state trigger pending review)'
 if row['proto_path'] in edited:
  i=edited.index(row['proto_path'])
  row['status']='BLOCKED' if i in [4,6] else 'VERIFIED'
  row['trigger_or_url']='/'+row['proto_path'].removeprefix('proto/')
  row['evidence']=f'upgrade-v2/evidence/final-{i}-390.webp;upgrade-v2/evidence/final-{i}-1440.webp;upgrade-v2/evidence/browser-qa.json'
  if i in [4,6]:row['blocker']='Original screenshot record differs from preserved fixture; rendered base page passes QA, exact screenshot state not reconstructed.'
  else:row['blocker']=''
savecsv(OUT/'STATE_COVERAGE.csv',states)
motions=[]
spec=[('Hero scene and path; existing section reveals','.delivery-art; .art-trace path; .reveal','load/scroll/hover/focus','transform/opacity/stroke-dashoffset','640-1500','0-240'),('Process stage sequence + native disclosures','.process-map; [data-process-step]; .service-details','load/scroll/click/keyboard','transform/opacity/border-color','180-900','90 per stage'),('Popular engagement response and FAQ','.featured-engagement; .faq-item','load/scroll/keyboard','box-shadow/opacity/transform','180-700','0-180'),('Quiet auth entrance; field toggle','.auth-form; .auth-art; [data-password-toggle]','load/click/keyboard','transform/opacity','620-820','60-220'),('Operator review dialog','[data-proto-dialog]','click/keyboard/Escape','opacity/transform','220','0'),('Editorial covers + actual-data filter','.work-cover img; [data-local-list]','load/scroll/hover/focus/input','transform/opacity','200-640','0-150'),('Client progress + local filter','.project-card; .prog; [data-local-list]','load/input/select/keyboard','opacity/transform','190-640','0-240'),('Entry quickstart; existing section reveals','.upgrade-quickstart; .reveal','load/scroll/keyboard','opacity/transform','560-640','0-150')]
for i,(purpose,sel,trigger,prop,duration,delay) in enumerate(spec):
 motions.append(dict(motion_id='M'+str(i+1),page_paths=edited[i],selector=sel,trigger=trigger,property=prop,duration_ms=duration,delay_ms=delay,easing='var(--ease-out/--ease-expo); ease-out',repeat='one-shot; no new continuous loops',mobile_behavior='same content; responsive stacking; touch controls',reduced_motion_behavior='immediate visibility; no translation/scale/path choreography',owner_file='proto/shared/assets/studio.css;proto/shared/assets/proto-motion.js;proto/shared/assets/studio.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/browser-qa.json;upgrade-v2/evidence/shared-regression.json;upgrade-v2/evidence/final-focused-qa.json'))
savecsv(OUT/'MOTION_REGISTER.csv',motions)
counts={'status':dict(Counter(r['status'] for r in page_rows)),'surfaces':{},'html_changed':sum(r['html_changed']=='true' for r in page_rows),'shared_only':sum(r['shared_only']=='true' for r in page_rows),'states':dict(Counter(r['status'] for r in states))}
for surface in ['public','client','admin']:
 selected=[r for r in page_rows if r['surface']==surface];counts['surfaces'][surface]={'total':len(selected),'edited':sum(r['html_changed']=='true' for r in selected),'status':dict(Counter(r['status'] for r in selected))}
(OUT/'evidence/coverage-summary.json').write_text(json.dumps(counts,indent=2))
# Include only actual changed/new deliverables, not caches, git or original assets.
tracked=subprocess.check_output(['git','diff','--name-only'],cwd=ROOT,text=True).splitlines();new=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines();manifest=[]
for name in sorted(set(tracked+new)):
 p=ROOT/name
 if not p.is_file() or name=='upgrade-v2/DELIVERY_MANIFEST.csv' or '__pycache__' in name:continue
 manifest.append(dict(path=name,kind='application' if name.startswith('proto/') else 'evidence' if '/evidence/' in name else 'documentation/tool',change='MODIFIED' if name in tracked else 'NEW',size_bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
savecsv(OUT/'DELIVERY_MANIFEST.csv',manifest)
print(json.dumps(counts,indent=2));print('Manifest paths',len(manifest))
