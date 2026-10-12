import json, re, os
import numpy as np
from PIL import Image
G='/home/user/grade'; ROOT='/home/user/frontend-ui-upgrade'
pairs=json.load(open(f'{G}/pairs.json')); render=json.load(open(f'{G}/render.json'))
def slug(p): return re.sub(r'[/:]','_',p)
NET=re.compile(r'ERR_CONNECTION|ERR_NAME|ERR_INTERNET|fonts\.g', re.I)
# audit notes per screenshot file
notes={}
for line in open(f'{ROOT}/tools/proto/DATA_AUDIT.md',encoding='utf-8'):
    m=re.match(r'\| \d+ \| `([^`]+)` \|.*?\| (checked|fixed|todo|n/a) \| (.*) \|\s*$',line.rstrip())
    if m: notes[m.group(1)]=m.group(3)
STOP=set('should would could there their these those which where while about after before quote screen page shows shown show visible section panel state button form dialog header footer label labels column columns status rows table list items item click checked matches match verify verified check open text sample detail details with from into that this have does with only also more than like when then they them been being other each both used using over under such very just where what'.split())
def tokens(t):
    t=t.lower().replace(',', '')
    words=set(w for w in re.findall(r"[a-z][a-z'\-]{4,}", t) if w not in STOP)
    nums=set(re.findall(r'\d{3,}(?:\.\d+)?', t))
    return words, nums
def load_shot(f):
    im=Image.open(f'{ROOT}/Nestlancer-{f.split("/")[0]}-screenshots/{f}').convert('RGB')
    return im.resize((1440,int(im.height*1440/im.width)))
def hist(im):
    a=np.asarray(im.resize((288,180)),dtype=int)//32
    idx=a[...,0]*64+a[...,1]*8+a[...,2]
    h=np.bincount(idx.ravel(),minlength=512).astype(float); return h/h.sum()
out=[]; cache={}
for p in pairs:
    row=dict(p); proto=p['proto']; r=render.get(proto)
    if not r or r.get('fatal') or r.get('status')!=200:
        row.update(grade='F',score=0,fid=0,health=0,ux=0,issues=['render failed']); out.append(row); continue
    raw=open(f"{G}/text/{slug(proto)}.txt",encoding='utf-8').read()
    bad=re.findall(r'\b(NaN|NAN|undefined|lorem ipsum|\[object Object\]|TODO|XXX)\b', raw)
    txt=raw.lower().replace(',', '')
    nt=notes.get(p['file'])
    recall=None; missing=[]
    if nt:
        W,N=tokens(nt)
        if W or N:
            found=[w for w in W if w in txt]; missing=sorted(w for w in W if w not in txt)[:8]
            fn=[n for n in N if n in txt.replace(',', '')]
            total=len(W)+len(N); recall=(len(found)+len(fn))/total
    if proto not in cache: cache[proto]=Image.open(f'{G}/renders/d_{slug(proto)}.png').convert('RGB')
    pim=cache[proto]; sim=load_shot(p['file'])
    top_s=sim.crop((0,0,1440,min(900,sim.height))); top_p=pim.crop((0,0,1440,min(900,pim.height)))
    A=np.asarray(top_s.convert('L').resize((288,180)),float); B=np.asarray(top_p.convert('L').resize((288,180)),float)
    corr=float(np.corrcoef(A.ravel(),B.ravel())[0,1]) if A.std()>1 and B.std()>1 else 0.0
    hi=float(np.minimum(hist(top_s),hist(top_p)).sum())
    def ink(X):
        bg=np.bincount(X.astype(int).ravel(),minlength=256).argmax(); return float((np.abs(X-bg)>25).mean())
    ia,ib=ink(A),ink(B); dens=min(ia,ib)/max(ia,ib,1e-6)
    hs=p['pixel_h']/2; hp=pim.height; hr=min(hs,hp)/max(hs,hp)
    # fidelity: content coverage 70 / page length 15 / density 15
    if recall is None:
        fid=(hr*15+dens*15)/30*100*0.7   # no audit notes: capped, flagged
        fidnote='no audit notes; content not measured'
    else:
        fid=recall*70+hr*15+dens*15; fidnote=''
    issues=[]
    hp_=100
    if r.get('pageErrors'): hp_-=15*len(r['pageErrors']); issues.append('JS page error')
    nonnet=[e for e in r.get('errors',[]) if not NET.search(e)]
    if nonnet: hp_-=5*len(nonnet); issues.append('console error')
    d=r.get('dom',{})
    if d.get('broken'): hp_-=10; issues.append(f"{d['broken']} broken image(s)")
    if d.get('overflowX',0)>2: hp_-=10; issues.append('horizontal overflow on desktop')
    if r.get('mobileOverflowX',0)>2: hp_-=10; issues.append('horizontal overflow at 390px')
    if bad: hp_-=10; issues.append('placeholder/broken text: '+', '.join(sorted(set(bad))[:3]))
    if 0<d.get('minFont',0)<11: hp_-=5; issues.append(f"text as small as {d['minFont']}px")
    if not d.get('title') or 'undefined' in d.get('title',''): hp_-=5; issues.append('missing/invalid title')
    if not d.get('h1'): hp_-=5; issues.append('no h1')
    if not d.get('hasDesc'): hp_-=2
    hp_=max(0,hp_)
    ux=0
    if d.get('primary'): ux+=25
    else: issues.append('no primary action')
    if d.get('navCount',0)>=3: ux+=20
    else: issues.append('weak navigation')
    if d.get('hasBreadcrumb') or p['area']=='public': ux+=15
    else: issues.append('no breadcrumb / back path')
    if d.get('headingCount',0)>=2: ux+=15
    else: issues.append('few section headings')
    if d.get('inputs',0)>0 or d.get('tables',0)>0: ux+=10
    if d.get('hasTheme') or d.get('hasFab'): ux+=10
    if recall is not None and recall<0.6: issues.append(f'content coverage {recall:.0%}; missing e.g. '+', '.join(missing[:5]))
    if hr<0.6: issues.append(f'page length differs (proto {hp}px vs screenshot {int(hs)}px)')
    if dens<0.6: issues.append('density differs')
    if p['match']=='parent': issues.insert(0,'screen/state not built as its own page; graded on nearest page (capped below A)')
    score=0.5*fid+0.3*hp_+0.2*ux
    if p['match']=='parent': score=min(score,89.9)
    g='A' if score>=90 else 'B' if score>=80 else 'C' if score>=70 else 'D' if score>=60 else 'F'
    row.update(recall=None if recall is None else round(recall,3), fid=round(fid,1), health=hp_, ux=ux, score=round(score,1), grade=g, corr=round(corr,3), color=round(hi,3), density=round(dens,3), heightRatio=round(hr,3), shotH=int(hs), protoH=int(hp), issues=issues, fidnote=fidnote, primary=d.get('primary',[])[:2], h1=d.get('h1',[]), headings=d.get('headings',[])[:6], nav=d.get('navSample',[])[:8], missing=missing)
    out.append(row)
json.dump(out,open(f'{G}/scores2.json','w'),indent=1,default=str)
from collections import Counter
print(Counter(o['grade'] for o in out)); print(Counter(o.get('match') for o in out))
print('with notes', sum(1 for o in out if o.get('recall') is not None))
