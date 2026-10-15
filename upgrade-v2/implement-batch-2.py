"""One-shot batch 2 HTML transformations; preserves existing domain text/links."""
from pathlib import Path
exec(Path('upgrade-v2/implement-launch.py').read_text().split('# Home')[0])
def setup(route,page):
 p,s,rel=load('proto/apps/'+route+'/index.html','studio-v2');s.body['data-page']=page;cls(s.body,'batch-two')
 s.head.append(s.new_tag('link',rel='stylesheet',href=rel+'/editorial.css'))
 for hero in s.select('.mkt-hero'): hero.attrs.pop('style',None)
 return p,s,rel
def art(rel,file,alt,caption,klass):
 return f'<figure class="{klass}"><img src="{rel}/art/{file}.svg" width="760" height="520" alt="{alt}"><figcaption>{caption}</figcaption></figure>'
# ABOUT: actual story with a distinctive collaboration visual, not invented team photos.
p,s,rel=setup('landing/about','about')
hero=s.select_one('.mkt-hero .mkt-wrap');hero['class']=['mkt-wrap','about-hero'];copy=s.new_tag('div',attrs={'class':'about-copy anim-in'})
for n in list(hero.contents):copy.append(n.extract())
hero.append(copy)
add(copy,'<a class="btn btn-primary mt-6" href="#studio-workflow">Explore the workflow ↓</a>')
add(hero,art(rel,'studio-collaboration','Two notes connected to a shared product workspace.','An illustration of a shared studio workspace.','about-art'))
for section in s.select('main > .mkt-section'):
 section['data-section-reveal']=''
 heading=section.select_one('h2')
 if heading and heading.get_text(strip=True)=='From brief to handoff':
  section['id']='studio-workflow';cls(section,'studio-workflow');grid=section.select_one('.grid');grid.name='ol';cls(grid,'about-steps')
  for card in grid.select(':scope > .mkt-card'):
   card.name='li';card.attrs.pop('style',None);title=card.select_one('.font-bold');title.name='h3';cls(title,'step-title')
 if heading and heading.get_text(strip=True)=='What we believe':
  cls(section,'studio-values')
  for title in section.select('.mkt-card > .h3'):title.name='h3'
 for title in section.select('.mkt-card > .font-bold'): title.name='h3'
save(p,s)
# CONTACT HANDOFF: preserve existing routing, do not introduce a duplicate form.
p,s,rel=setup('landing/contact','contact-handoff');hero=s.select_one('.mkt-hero .mkt-wrap');hero['class']=['mkt-wrap','contact-hero'];copy=s.new_tag('div',attrs={'class':'anim-in'})
for n in list(hero.contents):copy.append(n.extract())
hero.append(copy);add(hero,art(rel,'studio-correspondence','A project brief being placed into an envelope.','Illustrative correspondence · no message is sent here.','contact-art'))
maincard=s.select_one('main .grid.g2 > .mkt-card');cls(maincard,'contact-brief');maincard.select_one('.h3').name='h2'
for el in maincard.select('.flex.gap-2.mb-2'):
 el.name='li'
listnode=s.new_tag('ul',attrs={'class':'brief-checklist'})
first=maincard.select_one('li');first.insert_before(listnode)
for n in maincard.select(':scope > li'):listnode.append(n.extract())
faq=s.select_one('main .grid.g2 > .flex-col > .mkt-card:last-child');cls(faq,'contact-faq')
for box in faq.select(':scope > div'):
 box.name='details';cls(box,'handoff-faq');title=box.find('b');title.name='summary'
add(maincard,'<p class="demo-note">Prototype note: the next page is a local form preview. Spam checks, file attachments and message delivery are not connected.</p>')
for sec in s.select('main > .mkt-section'):sec['data-section-reveal']=''
save(p,s)
# CASE STUDY: retain exact supplied outcomes and quote, add illustrative media.
p,s,rel=setup('landing/portfolio/[id]','case-study')
hero=s.select_one('.mkt-hero .mkt-wrap');hero.attrs.pop('style',None);cls(hero,'case-heading')
add(hero,'<nav class="case-nav" aria-label="Case study sections"><a href="#case-overview">Overview</a><a href="#case-outcomes">Outcomes</a><a href="#case-review">Client review</a></nav>')
add(hero,f'<figure class="case-art"><img src="{rel}/art/work-analytics.svg" width="640" height="420" alt="Abstract financial dashboard with a line chart, bars and a summary panel."><figcaption>Illustrative interface concept — not a customer screenshot or measured chart.</figcaption></figure>')
wrap=s.select_one('main > .mkt-section .mkt-wrap');wrap.attrs.pop('style',None);cls(wrap,'case-content')
overview=wrap.select_one('.mkt-card');cls(overview,'case-overview');overview.attrs.pop('style',None)
for i,h in enumerate(overview.select('h2')):h['id']='case-overview' if i==0 else 'case-outcomes';h['tabindex']='-1'
review=wrap.select_one('.grid.g2 > .mkt-card');review['id']='case-review';review.select_one('p').name='blockquote';cls(review,'case-review')
for sec in s.select('main > .mkt-section'):sec['data-section-reveal']=''
save(p,s)
# BLOG: actual local data search and honest unavailable controls, editorial layout.
p,s,rel=setup('landing/blog','journal')
wrap=s.select_one('main .mkt-wrap');wrap.attrs.pop('style',None);cls(wrap,'journal-layout')
aside=wrap.select_one('aside');cls(aside,'journal-sidebar');aside['aria-label']='Article categories'
for n in aside.select(':scope > .flex.justify-between'):
 n.name='button';n.attrs.pop('style',None);n['type']='button';n['data-blog-category']=n.span.get_text(strip=True);n['aria-pressed']='true' if n['data-blog-category']=='All articles' else 'false';n['aria-controls']='journal-posts'
for n in aside.select('span.chip'):
 n.name='button';n['type']='button';n['disabled']='';n['aria-describedby']='journal-limit'
body=wrap.select_one(':scope > div');cls(body,'journal-main')
search=body.select_one('input');search['id']='journal-search';search['type']='search';search['data-blog-search']='';search['aria-controls']='journal-posts';search['aria-describedby']='journal-limit';search.attrs.pop('style',None)
label=s.new_tag('label',attrs={'for':'journal-search','class':'journal-search-label'});label.string='Search these articles';search.insert_before(label);label.append(search.extract())
header=body.select_one('h2').parent;labelnode=header.select_one('span');labelnode['data-blog-summary']=''
# New grouping retains feature and every original card.
feature=header.find_next_sibling('a');grid=feature.find_next_sibling('div',class_='grid');listing=s.new_tag('div',attrs={'id':'journal-posts','data-blog-list':''});feature.insert_before(listing);listing.append(feature.extract());listing.append(grid.extract());cls(feature,'journal-feature');cls(grid,'journal-grid')
for i,card in enumerate(listing.select('a.mkt-card')):
 cls(card,'journal-card');card['data-blog-item']='';card.attrs.pop('style',None)
 title=card.select_one('.h2') or card.select_one('.font-bold');title.name='h3';cls(title,'journal-title')
 cover=card.select_one('.cover');cover.attrs.pop('style',None);cls(cover,'journal-cover')
 file=['deployment-pipeline','work-workspace','work-workspace','deployment-pipeline','work-analytics','deployment-pipeline','work-analytics','work-commerce','work-analytics','studio-collaboration','deployment-pipeline','work-workspace'][i]
 add(cover,f'<img src="{rel}/art/{file}.svg" width="960" height="440" alt="" loading="lazy">')
limit=fragment('<p id="journal-limit" class="demo-note">The category totals describe the full collection. This local preview contains the 12 articles shown here; other pages and RSS are not available. Article links open a shared article template. Covers are illustrations.</p>').p
listing.insert_before(limit)
result=fragment('<p class="filter-result" role="status" data-blog-result></p>').p;listing.insert_before(result)
pagination=body.select_one('.justify-center');pagination.name='nav';pagination['aria-label']='Article pages';cls(pagination,'journal-pagination')
for i,item in enumerate(pagination.select('span')):
 item.attrs.pop('style',None)
 if i==0:item['aria-current']='page'
 else:item.name='button';item['type']='button';item['disabled']='';item['aria-describedby']='journal-limit'
for item in body.select('span.btn'):
 if item.get_text(strip=True)=='RSS feed':item.name='button';item['type']='button';item['disabled']='';item['aria-describedby']='journal-limit'
newsletter=body.select_one('.mkt-card.mt-10');newsletter.select_one('.h2').name='h2'
save(p,s)
# ARTICLE: no moving body paragraphs, comfortable reading + actual heading anchors.
p,s,rel=setup('landing/blog/[slug]','article');cls(s.body,'article-v2')
hero=s.select_one('.mkt-hero .mkt-wrap');hero.attrs.pop('style',None);cls(hero,'article-heading')
cover=hero.select_one('.cover');cover.attrs.pop('style',None);cls(cover,'article-cover')
add(cover,f'<img src="{rel}/art/deployment-pipeline.svg" width="960" height="440" alt="Illustrative pipeline sketch: one coupled build separates into service-level pipelines and a release gate.">')
add(hero,'<p class="art-caption">Illustrative pipeline sketch, not a production architecture diagram.</p>')
article=s.select_one('article');article.attrs.pop('style',None);article['class']=['article-body']
for n in article.select('.reveal'):n['class']=[c for c in n.get('class',[]) if c!='reveal']
layout=s.new_tag('div',attrs={'class':'mkt-wrap reading-layout'});article.insert_before(layout);layout.append(article.extract())
toc=s.new_tag('aside',attrs={'class':'article-toc'});layout.insert(0,toc);add(toc,'<details open><summary>In this article</summary><nav aria-label="Article contents"></nav></details>')
for i,h in enumerate(article.select('h2')):
 h['id']='article-section-'+str(i+1);h['tabindex']='-1';a=s.new_tag('a',href='#'+h['id']);a.string=h.get_text(strip=True);toc.nav.append(a)
for n in article.select('.flex.mt-6 > span'):
 if n.get_text(strip=True) in ['Like','Bookmark']:
  n.name='button';n['type']='button';n['class']=['btn','btn-secondary'];n['data-preview-toggle']=n.get_text(strip=True);n['aria-pressed']='false';n['aria-describedby']='article-actions-note'
add(article,'<p id="article-actions-note" class="demo-note">Preview-only reactions. Nothing is saved to an account.</p><p class="form-feedback" role="status" data-reaction-result></p>')
related=s.select_one('main > .mkt-section:last-child');add(related.select_one('.mkt-wrap'),'<p class="demo-note">Related links currently use the same prototype article template.</p>')
for title in related.select('.font-bold'):title.name='h3'
save(p,s)
# WEB CONTACT: the actual form destination, secure local-only demo behavior.
p,s,rel=setup('landing/contact-alt','contact-form');main=s.select_one('main');grid=main.select_one('.mkt-wrap > .grid');grid.attrs.pop('style',None);cls(grid,'contact-form-layout')
card=grid.select_one(':scope > .mkt-card');card.name='form';card['data-demo-contact']='';card['aria-describedby']='contact-demo-note';card['id']='contact-form';card.attrs.pop('style',None);cls(card,'contact-form-card')
card.insert(0,fragment('<h2 class="h3 mb-3">Your message</h2><p id="contact-demo-note" class="demo-note">Local prototype only. Use sample details. Nothing is sent, uploaded or saved; spam protection and delivery are not connected.</p>').h2)
# Insert note independently (the heading extraction above intentionally only takes h2).
card.select_one('h2').insert_after(fragment('<p id="contact-demo-note" class="demo-note">Local prototype only. Use sample details. Nothing is sent, uploaded or saved; spam protection and delivery are not connected.</p>').p)
for id,typ,auto in [('nl-your-name','text','name'),('nl-email','email','email'),('nl-company','text','organization')]:
 inp=s.find(id=id);inp['type']=typ;inp['autocomplete']=auto
for id in ['nl-your-name','nl-email','nl-message']:
 inp=s.find(id=id);inp['required']='';inp['aria-describedby']=id+'-error';inp['aria-invalid']='false';inp.insert_after(fragment(f'<p class="field-error" id="{id}-error"></p>').p)
button=card.select_one('button');button['type']='submit';button['disabled']='';button['aria-describedby']='contact-demo-note'
add(card,'<noscript><p class="demo-note">JavaScript is needed for local validation. Sending is disabled; no message can be submitted from this prototype.</p></noscript><p class="form-feedback" id="contact-result" role="status" tabindex="-1"></p>')
sidebar=grid.select_one(':scope > .flex-col');cls(sidebar,'contact-support');sidebar.insert(0,fragment(art(rel,'studio-correspondence','A brief and envelope, illustrating studio correspondence.','A local form preview — not a sent message.','contact-support-art')).figure)
save(p,s)
