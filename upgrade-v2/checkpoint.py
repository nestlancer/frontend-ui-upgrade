"""Update explicit reviewed-page coverage and a cumulative baseline-relative manifest.
Does not promote shared-only pages or overwrite unknown/future batch decisions.
"""
from pathlib import Path
import csv,json,hashlib,subprocess
from collections import Counter
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'upgrade-v2'
BASE=json.loads((OUT/'data-baseline.json').read_text())['commit']
def savecsv(path,rows):
 with path.open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)
first=json.loads((OUT/'test-paths.json').read_text());second=json.loads((OUT/'batch-2-paths.json').read_text());edited=['proto/'+p for p in first+second]
# Base rendering is distinct from exact original screenshot-state equivalence.
blocked={4:'Mapped payment screenshots use different records from the preserved page fixture',6:'Mapped project screenshot uses a different record from the preserved page fixture',13:'Source 004-contact uses Subject / General; preserved HTML has Company and Topic / New project inquiry'}
arts=['A1;A3;A4;A5;A6','A2','','A3','','A3;A4;A5;A6','','','A7','A8','A6','A3;A5;A6;A7;A9','A9','A8']
refs=['R1;R2;R4;R5','R2;R4;R5','R2;R4;R5','R4;R5','R3;R4;R5','R2;R4;R5;R6','R4;R5;R6','R4;R5','R2;R4;R5','R2;R4;R5','R4;R5','R4;R5;R6','R4;R5','R4;R5;R7']
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
 i=edited.index(row['proto_path']);reason=blocked.get(i,'');stem=f'final-{i}' if i<8 else f'batch2-after-{i-8}'
 row.update(status='BLOCKED' if reason else 'VERIFIED',trigger_or_url='/'+row['proto_path'].removeprefix('proto/'),evidence=f'upgrade-v2/evidence/{stem}-390.webp;upgrade-v2/evidence/{stem}-1440.webp;upgrade-v2/evidence/'+('browser-qa.json' if i<8 else 'batch2-browser-qa.json'),blocker=reason+'; base-page QA passes, exact original state remains unimplemented.' if reason else '')
savecsv(OUT/'STATE_COVERAGE.csv',states)
# Retain existing motion records, adding only this reviewed batch.
motions=list(csv.DictReader((OUT/'MOTION_REGISTER.csv').open()));motions=[x for x in motions if x['motion_id'] not in [f'M{i}' for i in range(9,15)]]
spec=[('Collaboration scene + workflow section reveals','.about-art; .studio-workflow; .reveal','load/scroll/hover/focus/anchor','opacity/transform','640-1050','0-160'),('Correspondence scene + native FAQ','.contact-art; .handoff-faq; .reveal','load/scroll/hover/focus/keyboard','opacity/transform','640-900','0-160'),('Case-study scene + section navigation','.case-art; .case-nav; .reveal','load/scroll/hover/focus/anchor','opacity/transform','640-950','0-180'),('Editorial cover response + real local filters','.journal-cover img; [data-blog-list]','load/scroll/hover/focus/input/keyboard','opacity/transform','180-900','0-240'),('Quiet article entrance, static reading body','.article-heading; .article-cover; .article-toc','load/anchor/keyboard','opacity/transform','640-900','0-240'),('Quiet form entrance and correspondence art','.contact-support-art; [data-demo-contact]','load/keyboard/input/submit','opacity/transform','640-900','0-120')]
for j,(purpose,sel,trigger,prop,duration,delay) in enumerate(spec):
 motions.append(dict(motion_id=f'M{j+9}',page_paths=edited[j+8],selector=sel,trigger=trigger,property=prop,duration_ms=duration,delay_ms=delay,easing='var(--ease-out); inherited --ease-expo',repeat='one-shot; no new continuous loops',mobile_behavior='responsive stacking; native touch/keyboard controls',reduced_motion_behavior='immediate readable content; no choreography; preference changes tested',owner_file='proto/shared/assets/editorial.css;proto/shared/assets/studio.js;proto/shared/assets/proto-motion.js',status='VERIFIED_BASE_PAGE',evidence='upgrade-v2/evidence/batch2-browser-qa.json;upgrade-v2/evidence/batch2-after-'+str(j)+'-390.webp'))
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
