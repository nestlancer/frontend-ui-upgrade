"""Operator dashboard only; no data/series reconstruction or live endpoints."""
from pathlib import Path
exec(Path('upgrade-v2/implement-launch.py').read_text().split('# Home')[0])
p,s,rel=load('proto/apps/admin/dashboard/index.html','operator-v2')
add(s.head,f'<link rel="stylesheet" href="{rel}/operator.css"><script src="{rel}/operator.js" defer></script>')
main=s.main
main.select_one('.pband').insert_after(fragment('<p class="ops-notice" id="operator-snapshot-note">Prototype snapshot only. The original figures and 30-day period are preserved; live refresh and other date ranges are not connected. Search navigates local prototype pages, not server records.</p>').p)
add(main.select_one('.phead-actions'),'<button class="btn btn-secondary" type="button" data-operator-search-open disabled>Search pages <span class="kbd">⌘K</span></button>')
search=s.select_one('.topsearch input');search['aria-label']='Open local page search';search['readonly']='';search['disabled']='';search['data-operator-search-open']='';search['aria-haspopup']='dialog';search['aria-controls']='operator-search'
notifications=s.select_one('button[title="Notifications"]');notifications.name='a';notifications['href']='../notifications/index.html'
for i,card in enumerate(main.select('.att')):
 card.name='a';card['href']=['../requests/index.html','../quotes/index.html','../payments/index.html','../moderation/index.html','../contact/index.html','../notifications/index.html'][i]
cls(main.select_one('.stats'),'operator-metrics');main.select_one('.stats').attrs.pop('style',None)
for seg in main.select('.seg'):
 seg['aria-label']='Snapshot period';seg['aria-describedby']='operator-snapshot-note'
 for button in seg.select('button'):
  button['type']='button';button['aria-pressed']=str('active' in button.get('class',[])).lower()
  if 'active' not in button.get('class',[]):button['disabled']='';button['title']='Only the original 30-day snapshot is available'
for row in main.select(':scope > .grid'):
 if row.select_one('table'):cls(row,'operator-tables')
 else:cls(row,'operator-charts')
 row.attrs.pop('style',None)
for i,heading in enumerate(main.select('h2.panel-title')):heading['id']='operator-panel-'+str(i+1)
for svg in main.select('svg:not([aria-hidden])'):
 panel=svg.find_parent(class_='panel');heading=panel.select_one('h2') if panel else None
 if heading:svg['role']='img';svg['aria-labelledby']=heading['id'];svg['aria-describedby']='operator-snapshot-note'
for table in main.select('table'):
 table['aria-labelledby']=table.find_parent(class_='panel').select_one('h2')['id']
 for th in table.select('th'):th['scope']='col'
dialog=fragment('''<dialog class="operator-search" id="operator-search" aria-labelledby="operator-search-title" aria-describedby="operator-search-help"><header class="operator-search-head"><div><h2 id="operator-search-title">Search pages</h2><p id="operator-search-help">Jump to a local prototype page. No server or customer-record search.</p></div><button class="btn btn-secondary" type="button" data-operator-search-close aria-label="Close page search">Esc</button></header><div class="operator-search-field"><label class="label" for="operator-search-query">Search or jump to…</label><input class="input" id="operator-search-query" type="search" autocomplete="off" aria-controls="operator-search-results" placeholder="Find a page or action"><p role="status" id="operator-search-status"></p></div><nav id="operator-search-results" aria-label="Matching prototype destinations"></nav><footer>↑ ↓ navigate · Enter open · Escape close</footer></dialog>''').dialog
results=dialog.select_one('nav')
for section in s.select('.sb-nav > .sb-section'):
 group=s.new_tag('section',attrs={'class':'operator-search-group'});h=s.new_tag('h3');h.string=section.select_one('.sb-label').get_text(' ',strip=True);group.append(h)
 for original in section.select('.sb-item'):
  a=s.new_tag('a',href=original['href'],attrs={'data-search-entry':''});a.string=original.select_one('.l').get_text(' ',strip=True);group.append(a)
 if h.string=='Operations':
  for label,href in [('Pipeline · User hub','../pipeline/users/index.html'),('Pipeline · Project hub','../pipeline/projects/index.html'),('Settlement accounts','../payments/accounts/index.html'),('Company legal identity','../payments/company-legal/index.html')]:add(group,f'<a data-search-entry href="{href}">{label}</a>')
 results.append(group)
add(results,'<section class="operator-search-group"><h3>Quick actions</h3><a data-search-entry href="../content/blog/new/index.html">Create blog post</a><a data-search-entry href="../portfolio/new/index.html">New portfolio item</a><a data-search-entry href="../messages/new-direct/index.html">Message client</a><a data-search-entry href="../messages/new-group/index.html">New group chat</a><button type="button" data-search-entry data-theme-toggle>Switch theme · <span data-theme-label>Light</span></button></section>')
s.body.append(dialog)
add(main,'<noscript><p class="ops-notice">Page search requires JavaScript. Use the dashboard queue links and existing navigation instead.</p></noscript>')
save(p,s)
