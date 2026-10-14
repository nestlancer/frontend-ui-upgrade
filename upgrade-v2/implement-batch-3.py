"""One-shot, route-specific transformations. Never copy landing page bodies."""
from pathlib import Path
from bs4 import Tag
exec(Path('upgrade-v2/implement-launch.py').read_text().split('# Home')[0])
def setup(route,kind='studio-v2'):
 p,s,rel=load('proto/apps/'+route+'/index.html',kind);cls(s.body,'batch-three')
 add(s.head,f'<script defer src="{rel}/content-tools.js"></script>')
 if kind=='studio-v2':
  add(s.head,f'<link rel="stylesheet" href="{rel}/editorial.css">')
  for e in s.select('.mkt-hero'): e.attrs.pop('style',None)
 else:add(s.head,f'<link rel="stylesheet" href="{rel}/inbox.css">')
 return p,s,rel
def image(cover,rel,file):
 cover.attrs.pop('style',None);cls(cover,'journal-cover')
 add(cover,f'<img src="{rel}/art/{file}.svg" width="960" height="440" alt="" loading="lazy">')
def reaction(b,key):
 b['type']='button';b['data-content-toggle']=key;b['aria-pressed']='false';b['disabled']='';b['aria-describedby']='content-actions-note'
def action_note(parent):add(parent,'<p class="demo-note" id="content-actions-note">Preview-only reactions require JavaScript. Nothing is saved to an account and original counts do not change.</p><p role="status" data-content-status></p>')
# WEB JOURNAL: its own ten cards and conflicting original totals are retained.
p,s,rel=setup('web/blog');cls(s.body,'web-journal');form=s.select_one('form.filterbar');form['data-content-filter']='';form['data-list-id']='web-articles';form['data-item-name']='articles'
query=form.select_one('input');query['id']='web-article-search';query['data-content-query']='';query['aria-describedby']='web-journal-note';query['disabled']=''
select=form.select_one('select');select['data-content-category']='';select['disabled']=''
for i,opt in enumerate(select.select('option')):opt['value']='' if i==0 else opt.get_text().split(' (')[0]
form.insert(0,fragment('<label class="label" for="web-article-search">Search this preview</label>').label)
form.insert_after(fragment('<p id="web-journal-note" class="demo-note">This route contains 10 local article cards. Original collection totals disagree (110 in the filter, 106 in the rail); they are preserved, not live counts. Other pages and RSS are unavailable; category and article links open shared templates. Covers are illustrations. Filtering requires JavaScript.</p>').p)
layout=s.select_one('.blog-layout');layout['class']=[c for c in layout['class'] if c!='reveal'];cls(layout,'web-journal-layout')
aside=layout.select_one('aside');aside['aria-label']='Browse journal';
# Repair malformed heading wrappers without losing any navigation/text.
for h in list(aside.select('h2')):
 for child in reversed(list(h.children)):
  if isinstance(child,Tag):h.insert_after(child.extract())
listing=layout.select_one(':scope > .min-w-0');listing['id']='web-articles';cls(listing,'web-articles')
listing.insert(0,fragment('<p role="status" class="filter-result" data-content-result></p>').p)
for i,card in enumerate(listing.select('a.mkt-card')):
 card['data-filter-item']='';card['data-category']='Case Studies';cls(card,'journal-card','reveal');card.attrs.pop('style',None)
 title=card.select_one('.h3') or card.select_one('b');title.name='h3';cls(title,'journal-title')
 image(card.select_one('.cover'),rel,['deployment-pipeline','work-workspace','work-workspace','deployment-pipeline','work-analytics','deployment-pipeline','work-analytics','work-commerce','work-analytics','studio-collaboration'][i])
 if i==0:cls(card,'journal-feature')
cls(listing.select_one('.grid'),'journal-grid');listing.select_one('.grid')['class']=[c for c in listing.select_one('.grid')['class'] if c!='stagger']
pagination=listing.select_one('.justify-center');pagination.name='nav';pagination['aria-label']='Article pages';cls(pagination,'journal-pagination')
for i,item in enumerate(pagination.select(':scope > span')):
 if i==0:item['aria-current']='page'
 else:item.name='button';item['type']='button';item['disabled']='';item['aria-describedby']='web-journal-note'
rss=aside.select_one('a[href="#"]');rss['aria-disabled']='true';rss['tabindex']='-1';rss['data-unavailable']='';rss['aria-describedby']='web-journal-note'
save(p,s)
# ARTICLE: keeps this route's 8-min read, 6-engineer team, code/results/comments.
p,s,rel=setup('web/blog/cutting-deploy-time-from-45-minutes-to-five');cls(s.body,'web-article','article-v2')
heading=s.select_one('.mkt-hero .mkt-wrap');heading.attrs.pop('style',None);cls(heading,'article-heading')
wrap=s.select_one('main > .mkt-wrap');wrap.attrs.pop('style',None);cls(wrap,'web-reading-wrap')
cover=wrap.select_one('.cover');image(cover,rel,'deployment-pipeline');cls(cover,'article-cover');cover.select_one('img')['alt']='Illustrative service-level deployment pipeline, not a production architecture diagram.'
cover.insert_after(fragment('<p class="art-caption">Illustrative pipeline sketch · original article figures are retained below.</p>').p)
article=wrap.select_one('.prose');article.name='article';article['class']=['article-body','web-prose']
reading=s.new_tag('div',attrs={'class':'reading-layout web-reading-layout'});article.insert_before(reading);reading.append(article.extract())
reading.insert(0,fragment('<aside class="article-toc"><details open><summary>In this article</summary><nav aria-label="Article contents"></nav></details></aside>').aside)
for i,h in enumerate(article.select('h2')):
 h['id']='read-section-'+str(i+1);h['tabindex']='-1';a=s.new_tag('a',href='#'+h['id']);a.string=h.get_text();reading.nav.append(a)
for b in s.select('main button'):
 title=b.get('title',b.get_text(strip=True))
 if title in ['Bookmark','♥ Like']:reaction(b,'Bookmark' if title=='Bookmark' else 'Like')
 elif title=='Copy link':b['data-copy-page']='';b['disabled']='';b['aria-label']='Copy article link'
 elif title in ['Post comment','RSS feed']:b['disabled']='';b['aria-describedby']='web-comment-note'
for span in wrap.select(':scope > .flex > span.chip'):
 if span.get_text(strip=True)=='Copy link':span.name='button';span['type']='button';span['data-copy-page']='';span['disabled']=''
 elif span.get_text(strip=True) in ['LinkedIn','X / Twitter']:span.name='button';span['type']='button';span['disabled']='';span['title']='External sharing is not connected in this prototype'
comment=s.find(id='nl-comment');comment['disabled']='';comment['aria-describedby']='web-comment-note'
comment.find_parent(class_='field').insert_before(fragment('<p class="demo-note" id="web-comment-note">Original comments are read-only. Comment posting, external sharing and RSS are not connected. <a href="../../login/index.html">Explore the prototype sign-in</a>.</p>').p)
action_note(heading)
add(heading,'<div class="share-output" data-share-output hidden><label class="label" for="article-share-url">Page link</label><input class="input" id="article-share-url" readonly></div>')
# Preserve related self-links, disclosing rather than inventing destinations.
add(wrap,'<p class="demo-note">Related posts currently link back to this prototype article.</p>')
save(p,s)
# CASE STUDY: metric quartet, contract and extended narrative stay route-specific.
p,s,rel=setup('web/portfolio/fintech-payments-hub');cls(s.body,'web-case')
heading=s.select_one('.mkt-hero .mkt-wrap');cls(heading,'web-case-heading')
wrap=s.select_one('main > .mkt-wrap');cls(wrap,'web-case-content');wrap.attrs.pop('style',None)
cover=wrap.select_one('.cover');image(cover,rel,'work-analytics');cls(cover,'web-case-cover');cover.select_one('img')['alt']='Illustrative operations dashboard, not a customer screenshot or measured chart.'
figure=s.new_tag('figure',attrs={'class':'web-case-figure'});heading.append(figure);figure.append(cover.extract());add(figure,'<figcaption class="art-caption">Illustrative operations interface · not a customer screenshot.</figcaption>')
prose=wrap.select_one('.prose');cls(prose,'web-case-prose');prose.attrs.pop('style',None)
for i,h in enumerate(prose.select('h2')):h['id']='case-section-'+str(i+1);h['tabindex']='-1'
add(heading,'<nav class="case-nav" aria-label="Case study sections"><a href="#case-section-1">Overview</a><a href="#case-section-2">Outcomes</a></nav>')
cls(wrap.select_one('.grid.g4'),'case-metrics')
for b in wrap.select('button'):reaction(b,'Like')
action_note(wrap)
gallery=fragment('<figure class="web-case-gallery reveal" aria-labelledby="case-gallery-heading"><h2 class="h3" id="case-gallery-heading">Gallery</h2><img src="'+rel+'/art/payment-flow.svg" width="960" height="300" alt="Illustrative payment flow from webhooks through a queue and reconciliation ledger to an export document." loading="lazy"><ol><li>01 · Razorpay webhooks</li><li>02 · Queues</li><li>03 · Reconciliation ledger</li><li>04 · CSV exports</li></ol><figcaption class="art-caption">Original process illustration based on this case’s description. Not a customer screenshot or a production architecture diagram.</figcaption></figure>').figure
wrap.select_one(':scope > .panel.mt-4').insert_after(gallery)
scope=wrap.select_one('input');scope['id']='case-scope';scope['aria-describedby']='case-scope-note';scope.attrs.pop('style',None)
scope.insert_before(fragment('<label class="label" for="case-scope">Your project note</label>').label)
scope.insert_after(fragment('<p class="demo-note" id="case-scope-note">Local scratchpad only. Copy your note before opening Contact; it is not sent, saved or carried over.</p><button class="btn btn-secondary" type="button" data-copy-note disabled>Copy note</button>').p)
# Add the button separately: fragment.p above intentionally inserts only p.
scope.parent.append(fragment('<button class="btn btn-secondary" type="button" data-copy-note disabled>Copy note</button>').button)
save(p,s)
# CLIENT INBOX: all four original previews and Riya's full thread retained.
p,s,rel=setup('web/messages/inbox','inbox-v2');main=s.main;grid=main.select_one('.chat-grid');grid['class']=['chat-grid','inbox-workspace','reveal'];grid.attrs.pop('style',None)
mail,listing,thread=grid.select(':scope > .chat-col');cls(mail,'inbox-mailbox');cls(listing,'inbox-list');cls(thread,'inbox-thread');thread['id']='inbox-thread';thread.attrs.pop('style',None)
main.select_one('.pband').insert_after(fragment('<p class="demo-note inbox-disclosure">Local message preview. Four conversations are supplied; original mailbox counts are retained. Only Riya’s conversation contains a full thread. Replies are never sent or saved.</p>').p)
listing['data-content-filter']='';listing['data-list-id']='conversation-list';listing['data-item-name']='conversations';listing['id']='conversation-list'
query=listing.select_one('input');query['aria-label']='Search the four local conversation previews';query['id']='conversation-search';query['data-content-query']='';query['type']='search';query['disabled']=''
for i,row in enumerate(listing.select(':scope > .conv')):
 row['data-filter-item']='';row['data-category']=row.select_one('.badge').get_text(strip=True)
 add(row,f'<button type="button" class="conversation-open" data-conversation="{i}" aria-controls="inbox-thread inbox-snippet" aria-pressed="'+('true' if i==1 else 'false')+'" disabled><span class="visually-hidden">Open '+row.select_one('.t').get_text(' ',strip=True)+'</span></button>')
add(listing,'<p class="filter-result" role="status" data-content-result></p>')
preview=fragment('<section class="inbox-snippet" id="inbox-snippet" hidden><button class="btn btn-secondary inbox-back" type="button" data-back-to-list>← Conversations</button><p class="eyebrow mt-5">Conversation preview</p><h2 class="h3 mt-3" id="inbox-snippet-title" tabindex="-1"></h2><blockquote data-snippet-text></blockquote><p class="demo-note">This is the existing list preview. Full messages for this conversation are not included in this prototype.</p></section>').section;grid.append(preview)
thread.insert(0,fragment('<button class="btn btn-secondary inbox-back" type="button" data-back-to-list>← Conversations</button>').button)
thread.select_one('.chat-head b')['id']='inbox-thread-title';thread.select_one('.chat-head b')['tabindex']='-1'
for b in thread.select('.chat-head button'):b['disabled']='';b['title']=b.get('title','')+' — not implemented in this preview'
compose=mail.select_one('button[title="Compose"]');compose.name='a';compose['href']='../new/index.html'
composer=thread.select_one('.composer');composer.name='form';composer['data-local-draft']='';composer['aria-describedby']='draft-note'
textarea=composer.select_one('textarea');textarea['id']='inbox-draft';textarea['aria-label']='Local reply draft';textarea['aria-describedby']='draft-note';textarea['aria-invalid']='false'
for b in composer.select('button'):b['type']='button';b['disabled']=''
composer.select_one('button[title="Attach"]')['title']='Attach — uploads are not connected'
composer.select_one('.btn-primary')['type']='submit'
add(thread,'<p id="draft-note" class="demo-note">Use sample text. Send and Enter only check this draft locally; Shift+Enter adds a line. Nothing is sent or saved. JavaScript is required.</p><p class="form-feedback" role="status" id="draft-result"></p>')
for inp in s.select('.topsearch input'):inp['aria-label']='Global search unavailable; use conversation search';inp['disabled']=''
save(p,s)
