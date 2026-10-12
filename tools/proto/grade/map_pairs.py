import csv, re, json, os
from urllib.parse import urlparse
ROOT='/home/user/frontend-ui-upgrade'
U=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|01a1[0-9a-f]{4}-[0-9a-f-]{20,}')
def norm(s): return U.sub(':id',s).strip('/')
protos=[]
for dp,_,fs in os.walk(os.path.join(ROOT,'proto')):
    if 'index.html' in fs: protos.append(os.path.relpath(dp,os.path.join(ROOT,'proto')))
pn={}
for p in protos: pn.setdefault(norm(p),p)
rows=list(csv.DictReader(open(os.path.join(ROOT,'screenshot-manifest.csv'),encoding='utf-8')))
out=[]
for r in rows:
    p=urlparse(r['url']); base={'nestlancer.com':'apps/landing','app.nestlancer.com':'apps/web','admin.nestlancer.com':'apps/admin'}.get(p.netloc,'?')
    key=norm(base+'/'+p.path.strip('/'))
    if key in pn: proto,mt=pn[key],'exact'
    else:
        parts=key.split('/'); proto=None
        while len(parts)>1:
            parts=parts[:-1]; k='/'.join(parts)
            if k in pn: proto=pn[k]; break
        mt='parent' if proto else 'none'
    if proto is None and key.rstrip('/') in pn: proto,mt=pn[key.rstrip('/')],'exact'
    out.append(dict(file=r['file'],url=r['url'],title=r['title'],area=r['area'],proto=proto,match=mt,pixel_w=int(r['pixel_width']),pixel_h=int(r['pixel_height'])))
json.dump(out,open('/home/user/grade/pairs.json','w'),indent=1)
from collections import Counter
print(Counter(o['match'] for o in out))
for o in out:
    if o['match']!='exact': print(o['match'],o['file'],'->',o['proto'])
