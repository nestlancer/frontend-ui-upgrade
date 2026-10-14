"""One-shot page edits after first-slice QA. Shared helpers only; no launch replay."""
from pathlib import Path
exec(Path('upgrade-v2/implement-launch.py').read_text().split('# Home')[0])
# Portfolio listing: preserve actual eight records and shared fixture destinations.
p,s,rel=load('proto/apps/landing/portfolio/index.html','studio-v2'); s.body['data-page']='portfolio'
s.select_one('.mkt-hero').attrs.pop('style',None)
covers(s,rel)
grid=s.select_one('main .grid.g3'); cls(grid,'portfolio-grid'); grid['id']='portfolio-results'; grid['data-local-list']=''
for a in grid.select(':scope > a'):
 a['data-local-item']=''; category=a.select_one('.eyebrow').get_text(' ',strip=True); a['data-category']=category
 title=a.select_one('.font-bold'); title.name='h2'; cls(title,'work-title')
filters=fragment('''<div class="portfolio-tools"><div><label class="label" for="work-search">Find a project</label><input class="input" id="work-search" type="search" placeholder="Search the work shown below" data-local-search aria-controls="portfolio-results"></div><div><label class="label" for="work-category">Discipline</label><select class="select" id="work-category" data-local-category aria-controls="portfolio-results"><option value="">All disciplines</option><option>UI/UX DESIGN</option><option>MOBILE APP</option><option>E-COMMERCE</option><option>WEB DEVELOPMENT</option></select></div></div>''').div
grid.insert_before(filters)
add(grid.parent,'<p class="filter-result" role="status" data-local-result></p><p class="art-caption">Illustrative product concepts, not customer screenshots. Case-study links open the shared prototype fixture.</p>')
for sec in s.select('main > .mkt-section'):sec['data-section-reveal']=''
save(p,s)
# Client projects: useful local filters, calmer progress + next action hierarchy.
p,s,rel=load('proto/apps/web/projects/index.html','projects-v2');s.body['data-page']='projects';main=s.select_one('main')
filters=main.select_one('.filterbar'); filters['aria-label']='Filter the projects shown on this page'
sel=filters.select_one('select');sel['id']='project-status';sel['aria-label']='Filter by status';sel['data-local-category']='';sel['aria-controls']='project-results';sel.select_one('option')['value']=''
inp=filters.select_one('input');inp['id']='project-search';inp['type']='search';inp['aria-label']='Search projects shown on this page';inp['data-local-search']='';inp['aria-controls']='project-results'
row=main.select_one('a.panel-row');row['data-local-item']='';row['data-category']='In progress';cls(row,'project-card');row.attrs.pop('style',None)
title=row.select_one('b.fs-14');title.name='h3'; title['class']=['project-title']
row.select_one('.flex.items-center.gap-2')['class']=['project-card-heading']
for prog in row.select('.prog'):prog['role']='progressbar';prog['aria-label']='Corporate LMS completion';prog['aria-valuenow']='40';prog['aria-valuemin']='0';prog['aria-valuemax']='100'
section=s.new_tag('section',attrs={'class':'project-delivery','aria-labelledby':'active-projects-heading'});row.insert_before(section)
add(section,'<h2 id="active-projects-heading" class="h3 mb-4">Active delivery</h2>')
listing=s.new_tag('div',attrs={'id':'project-results','data-local-list':''});section.append(listing);listing.append(row.extract())
add(section,'<p class="filter-result" role="status" data-local-result></p>')
# Separate meaningful next action outside full-card link; real destination already exists.
add(section,'<a class="link-arrow project-next" href="../payments/index.html">Review milestone payments →</a>')
for n in s.select('.topsearch input'):n['aria-label']='Search pages';n['disabled']='';n['title']='Use project search below or sidebar navigation; global search is not implemented here.'
for b in s.select('.topbar button'):
 if b.get('title')=='Notifications':b['disabled']='';b['title']='Notifications preview is not implemented on this page'
save(p,s)
# Entry-point improvement: clearly direct reviewer to real implemented pages.
p,s,rel=load('proto/index.html','hub-v2');main=s.select_one('main > .mkt-wrap')
intro=s.new_tag('section',attrs={'class':'upgrade-quickstart','aria-labelledby':'upgrade-heading'});main.select_one('.grid.g4').insert_before(intro)
add(intro,'<h2 class="h3" id="upgrade-heading">UI upgrade · partial delivery</h2><p class="text-sm muted mt-2">Open the upgraded pages below. The full route directory remains available; other pages are still awaiting page-level implementation.</p><nav class="upgrade-links" aria-label="Upgraded pages"></nav>')
for href,title in [('apps/landing/index.html','Homepage'),('apps/landing/services/index.html','Services'),('apps/landing/pricing/index.html','Pricing'),('apps/landing/portfolio/index.html','Portfolio'),('apps/web/login/index.html','Client sign-in'),('apps/web/projects/index.html','Client projects'),('apps/admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/index.html','Payment review')]:add(intro.nav,f'<a class="btn btn-secondary" href="./{href}">{title} ↗</a>')
save(p,s)
