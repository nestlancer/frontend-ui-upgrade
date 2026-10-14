"""Read-only prototype extraction; baseline created once, never overwritten."""
from pathlib import Path
from bs4 import BeautifulSoup, Comment
import csv, json, hashlib, re, subprocess
ROOT=Path(__file__).resolve().parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def facts(p):
 s=BeautifulSoup(p.read_text(),'html.parser')
 for n in s.select('script,style'): n.decompose()
 text=[re.sub(r'\s+',' ',str(n)).strip() for n in s.find_all(string=True) if not isinstance(n,Comment) and str(n).strip()]
 attrs=[]
 for n in s.find_all(True):
  a={k:v for k,v in n.attrs.items() if k in ['href','src','action','value','checked','selected','type','name','placeholder'] or k.startswith('data-')}
  if n.get('type')=='password': a.pop('value',None)
  if a: attrs.append({'tag':n.name,'attrs':a})
 return {'text':text,'attributes':attrs}
def writecsv(p,fields,rows):
 with p.open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
if __name__=='__main__':
 out=ROOT/'upgrade-v2'; target=out/'data-baseline.json'
 if target.exists(): raise SystemExit('Baseline exists; refusing to overwrite')
 pages=sorted((ROOT/'proto').rglob('*.html')); ranking=list(csv.DictReader((ROOT/'RANKING_REPORT.csv').open()))
 baseline={'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'pages':{str(p.relative_to(ROOT)):facts(p) for p in pages},'shared_hashes':{str(p.relative_to(ROOT)):sha(p) for p in (ROOT/'proto/shared/assets').glob('*') if p.is_file()}}
 target.write_text(json.dumps(baseline,ensure_ascii=False,indent=1))
 rows=[]
 public={'about','blog','bookmarks','contact','forgot-password','impersonate','index.html','login','portfolio','privacy','register','reset-password','share','terms','verify','verify-document','verify-email','work'}
 for p in pages:
  path=str(p.relative_to(ROOT)); rel=p.relative_to(ROOT/'proto'); parts=rel.parts; rank=[r for r in ranking if r['proto_path']==path]
  family=parts[2] if len(parts)>2 else 'entry'
  surface='admin' if '/admin/' in path and family!='login' else 'client' if '/web/' in path and family not in public else 'public'
  rows.append(dict(page_path=path,surface=surface,page_family=family,ranked=str(bool(rank)).lower(),ranking_batch=';'.join(sorted(set(r['batch'] for r in rank))),min_rank=min([int(r['rank']) for r in rank],default=''),screenshot_paths=';'.join(r['screenshot_path'] for r in rank),baseline_sha256=sha(p),status='NOT_STARTED',html_changed='false',shared_only='false',art_asset_ids='',motion_ids='',reference_ids='',qa_status='NOT_TESTED',blocker='',next_action='Inspect original page and mapped states'))
 writecsv(out/'PAGE_COVERAGE.csv',list(rows[0]),rows)
 states=[]
 for r in ranking:
  assert (ROOT/r['proto_path']).exists(),r
  assert (ROOT/r['screenshot_path']).exists(),r
  states.append(dict(screenshot_path=r['screenshot_path'],proto_path=r['proto_path'],match=r['match'],verdict=r['verdict'],state_name=Path(r['screenshot_path']).stem,trigger_or_url='',status='NOT_STARTED',evidence='',blocker='Record differs from screenshot; preserve current facts until provenance reviewed' if r['verdict']=='DATA-DIFFERS' else ''))
 writecsv(out/'STATE_COVERAGE.csv',list(states[0]),states)
 print(len(pages),'pages',len(states),'states')
