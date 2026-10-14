"""Read-only all-page validation and semantic before/after preservation comparison."""
from pathlib import Path
from bs4 import BeautifulSoup
from collections import Counter
from urllib.parse import urlsplit,unquote
from baseline import ROOT,facts,sha
import json,re,subprocess
base=json.loads((ROOT/'upgrade-v2/data-baseline.json').read_text()); results=[]; preservation=[]
for path,old in base['pages'].items():
 p=ROOT/path; s=BeautifulSoup(p.read_text(),'html.parser'); issues=[]
 for n in s.select('[href],[src],[action]'):
  for attr in ['href','src','action']:
   raw=n.get(attr,''); u=urlsplit(raw)
   if not raw or u.scheme or u.netloc or raw.startswith('//'):continue
   dest=((ROOT/'proto'/unquote(u.path).lstrip('/')) if raw.startswith('/') else (p.parent/unquote(u.path))) if u.path else p
   dest=dest.resolve()
   if dest.is_dir(): dest=dest/'index.html'
   if not dest.exists():issues.append({'kind':'missing-target','attribute':attr,'value':raw})
   elif u.fragment and dest.suffix=='.html':
    target=s if dest==p else BeautifulSoup(dest.read_text(),'html.parser')
    if not target.find(id=unquote(u.fragment)):issues.append({'kind':'missing-fragment','value':raw})
 ids=Counter(n['id'] for n in s.select('[id]'))
 for id,count in ids.items():
  if count>1:issues.append({'kind':'duplicate-id','id':id,'count':count})
 for inp in s.select('input:not([type=hidden]),select,textarea'):
  if not (inp.get('aria-label') or inp.get('aria-labelledby') or inp.find_parent('label') or (inp.get('id') and s.find('label',attrs={'for':inp['id']}))): issues.append({'kind':'unlabeled-control','tag':inp.name,'placeholder':inp.get('placeholder')})
 if len(s.select('h1'))!=1:issues.append({'kind':'h1-count','count':len(s.select('h1'))})
 for img in s.select('img:not([alt])'):issues.append({'kind':'missing-alt','src':img.get('src')})
 results.append({'page':path,'issues':issues})
 now=facts(p)
 # Multiset text nodes ignores whitespace/reordering and permits semantic wrappers.
 missing=Counter(old['text'])-Counter(now['text']); added=Counter(now['text'])-Counter(old['text'])
 def atoms(items):
  return Counter(json.dumps({'tag':a['tag'],'attribute':k,'value':v},sort_keys=True,ensure_ascii=False) for a in items for k,v in a['attrs'].items())
 attrs_old=atoms(old['attributes']); attrs_now=atoms(now['attributes'])
 # Original percentage-bearing inline business styles independently recovered from
 # the clean starting commit; presentation-only cover padding is not business data.
 original_html=subprocess.check_output(['git','show',base['commit']+':'+path],cwd=ROOT,text=True)
 original_dom=BeautifulSoup(original_html,'html.parser')
 def percentages(dom):
  return Counter(n.get('style','') for n in dom.select('.prog [style],.bar[style],[role=progressbar][style]'))
 lost_progress=dict(percentages(original_dom)-percentages(s))
 if missing or added or attrs_old!=attrs_now or lost_progress:
  preservation.append({'page':path,'missing_text':dict(missing),'missing_business_progress_styles':lost_progress,'added_text':dict(added),'removed_attributes':[json.loads(a) for a in (attrs_old-attrs_now).elements()],'added_attributes':[json.loads(a) for a in (attrs_now-attrs_old).elements()]})
(ROOT/'upgrade-v2/evidence/static-validation.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
(ROOT/'upgrade-v2/evidence/data-comparison.json').write_text(json.dumps(preservation,indent=2,ensure_ascii=False))
print('Pages:',len(results),'issues:',dict(Counter(i['kind'] for p in results for i in p['issues'])))
print('New rendered placeholder defects:',[(x['page'],t) for x in preservation for t in x['added_text'] if re.search(r'\b(undefined|NaN|lorem ipsum)\b',t,re.I)])
print('Missing protected text:',[(x['page'],x['missing_text']) for x in preservation if x['missing_text']])
changed=subprocess.check_output(['git','diff','--name-only'],cwd=ROOT,text=True).splitlines()
print('Changed-page issues:',[(x['page'],x['issues']) for x in results if x['page'] in changed and x['issues']])
