from pathlib import Path
from bs4 import BeautifulSoup
import os
BASE=Path('proto/shared/assets')
def fragment(html): return BeautifulSoup(html,'html.parser')
def add(parent,html):
 for el in list(fragment(html).contents): parent.append(el)
def cls(el,*names): el['class']=el.get('class',[])+list(names)
def load(path,kind):
 p=Path(path); s=BeautifulSoup(p.read_text(),'html.parser')
 if 'upgrade-v2' in s.body.get('class',[]): raise RuntimeError('One-shot migration already applied: '+path)
 cls(s.body,'upgrade-v2',kind)
 rel=os.path.relpath(BASE,p.parent)
 add(s.head,f'<link rel="stylesheet" href="{rel}/studio.css"><script src="{rel}/studio.js" defer></script>')
 # Offline-safe font fallbacks; remove remote font requests on implemented pages.
 for el in list(s.select('link[href*="fonts.googleapis"],link[href*="fonts.gstatic"]')): el.decompose()
 if kind=='studio-v2':
  nav=s.select_one('.mkt-links'); nav['id']='public-nav'
  nav.insert_before(fragment('<button class="btn btn-secondary menu-toggle" type="button" aria-expanded="false" aria-controls="public-nav" data-public-menu>Menu</button>').button)
  for a in nav.select('a'):
   if (p.parent/a['href'].split('#')[0]).resolve()==p.resolve(): a['aria-current']='page'
 return p,s,rel
def save(p,s): p.write_text(str(s).replace('viewbox=','viewBox=').replace('preserveaspectratio=','preserveAspectRatio='))
def covers(s,rel):
 for i,cover in enumerate(s.select('main .cover')):
  kind=['workspace','mobile','commerce','workspace','analytics','analytics','commerce','analytics'][i%8]
  cover.attrs.pop('style',None); cls(cover,'work-cover'); cover.insert(0,fragment(f'<img src="{rel}/art/work-{kind}.svg" width="640" height="420" alt="" loading="lazy">').img)
  cover['aria-label']='Illustrative product concept'
# Home
p,s,rel=load('proto/apps/landing/index.html','studio-v2'); s.body['data-page']='home'
hero=s.select_one('.mkt-hero'); hero.attrs.pop('style',None); wrap=hero.select_one('.mkt-wrap')
copy=wrap.select_one('.anim-in'); copy.attrs.pop('style',None); copy['class']=['hero-copy','anim-in']; copy.select_one('p').attrs.pop('style',None)
copy.select_one('h1')['class']=['h-display']; copy.select_one('.justify-center')['class']=['hero-actions']
split=s.new_tag('div',attrs={'class':'hero-layout'}); copy.insert_before(split); split.append(copy.extract())
add(split,f'''<figure class="delivery-art" data-signature><img src="{rel}/art/delivery-system.svg" width="760" height="660" alt="An illustrated Nestlancer delivery system: a brief and code connect to a layered nest, a product interface, and a completion check."><figcaption><span>FIG 01 / THE DELIVERY SYSTEM</span><span>Brief → build → deliver</span></figcaption><svg class="art-trace" data-artwork aria-hidden="true" viewBox="0 0 760 660"><path d="M150 181H260Q290 181 290 211V274M589 471H510Q474 471 474 435V387" pathLength="1"/></svg></figure>''')
preview=wrap.select_one(':scope > .mt-10'); cls(preview,'hub-preview'); preview['id']='project-preview'
for el in preview.select('[style*="grid-template-columns"]'): el.attrs.pop('style',None); cls(el,'hub-layout')
# Existing content in larger editorial sections; project cards retained verbatim.
covers(s,rel)
for i,sec in enumerate(s.select('main > section')):
 cls(sec,'section-'+str(i))
 if i>0: sec['data-section-reveal']=''
work=s.select_one('main .work-cover')
if work: add(work.find_parent('section').select_one('.mkt-wrap'),'<p class="art-caption">Illustrative product concepts — not customer screenshots.</p>')
save(p,s)
# Services
p,s,rel=load('proto/apps/landing/services/index.html','studio-v2'); s.body['data-page']='services'
hero=s.select_one('.mkt-hero'); hero.attrs.pop('style',None)
add(hero.select_one('.mkt-wrap'),f'''<figure class="process-map" data-signature><img src="{rel}/art/delivery-process.svg" width="960" height="290" alt="Four stages of delivery: discovery, design, development, and handoff."><figcaption><span>Discovery</span><span>Design</span><span>Development</span><span>Handoff</span></figcaption></figure>''')
cardgrid=s.select_one('main .grid.g3'); cls(cardgrid,'service-grid')
for i,card in enumerate(cardgrid.select(':scope > .mkt-card')):
 card.attrs.pop('style',None); card.name='article'; h=card.select_one('.h3'); h.name='h2'; card['id']='service-'+str(i+1)
 features=card.select(':scope > .flex.gap-2.mb-2'); details=s.new_tag('details',attrs={'class':'service-details','open':''}); summary=s.new_tag('summary'); summary.string='Included in this engagement'; details.append(summary)
 features[0].insert_before(details)
 for f in features: details.append(f.extract())
 add(card,'<a class="compare-link" href="../pricing/index.html#compare-engagements">Compare engagements ↗</a>')
for sec in s.select('main > .mkt-section'): sec['data-section-reveal']=''
save(p,s)
# Pricing
p,s,rel=load('proto/apps/landing/pricing/index.html','studio-v2'); s.body['data-page']='pricing'
s.select_one('.mkt-hero').attrs.pop('style',None)
add(s.select_one('.mkt-hero .mkt-wrap'),'<a class="link-arrow compare-jump" href="#compare-engagements">Compare engagements ↓</a>')
grid=s.select_one('main .grid.g3'); cls(grid,'engagements'); grid['data-signature']=''
for i,card in enumerate(grid.select(':scope > .mkt-card')):
 card.attrs.pop('style',None); card.name='article'; card['id']='engagement-'+str(i+1)
 h=card.select_one('.h3'); h.name='h2'
 price=card.select_one('.fs-30'); cls(price,'package-price'); price.attrs.pop('style',None)
 cta=card.select_one('a'); cta['class']=['btn','btn-primary' if i==0 else 'btn-secondary','package-cta']; cta.attrs.pop('style',None)
 if i==0: cls(card,'featured-engagement')
# Existing FAQ cards -> accessible native details (retain every word).
for sec in s.select('main > section'):
 if 'Pricing questions' in sec.get_text():
  cls(sec,'pricing-faq')
  for card in sec.select('.mkt-card'):
   title=card.find(['h3','h4']) or card.select_one('.font-semibold') or card.select_one('.font-bold')
   if not title: title=card.find('div',recursive=False)
   if title:
    card.name='details'; cls(card,'faq-item'); card.attrs.pop('style',None); title.name='summary'; title.attrs.pop('style',None)
 if 'What each package includes.' in sec.get_text(): sec['id']='compare-engagements'
 if 'mkt-section' in sec.get('class',[]): sec['data-section-reveal']=''
save(p,s)
# Login — whole form wraps actual fields, no credential transmission.
p,s,rel=load('proto/apps/landing/login/index.html','auth-v2'); s.body['data-page']='login'
main=s.select_one('main'); start=main.select_one('.field'); oldform=main.select_one('form'); form=s.new_tag('form',attrs={'action':oldform['action'],'method':'get','data-demo-login':'','aria-describedby':'login-note'})
start.insert_before(form)
node=start
while node and node!=oldform:
 nxt=node.next_sibling; form.append(node.extract()); node=nxt
for n in list(oldform.contents): form.append(n.extract())
oldform.decompose()
for el in form.select('input[type="email"],input[type="password"]'): el['required']=''; el['aria-describedby']='login-note'
show=form.select_one('.in-kbd'); show.name='button'; show['type']='button'; show['class']=['password-toggle']; show.attrs.pop('style',None); show['data-password-toggle']=''; show['aria-controls']='nl-password'; show['aria-pressed']='false'; show['aria-label']='Show password'
add(form,'<p id="login-note" class="demo-note">Local prototype only. Use sample details; nothing is sent or authenticated.</p><p id="login-result" class="form-feedback" role="status" tabindex="-1"></p>')
rail=s.select_one('.auth-rail-inner'); demo=rail.select_one('.demo-card'); cls(demo,'auth-preview')
art=fragment(f'<figure class="auth-art" data-signature><img src="{rel}/art/work-workspace.svg" width="640" height="420" alt="Illustrative client workspace with project panels."><figcaption>Illustrative workspace · local prototype</figcaption></figure>').figure
demo.insert_before(art)
# Keep original preview content within a native disclosure rather than duplicate a dominant UI.
detail=s.new_tag('details',attrs={'class':'auth-preview-details'}); summary=s.new_tag('summary'); summary.string='Project Hub preview'; detail.append(summary); demo.insert_before(detail); detail.append(demo.extract())
save(p,s)
# Admin payment: preserve all source content including contradictory records; don't imply operations executed.
p,s,rel=load('proto/apps/admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/index.html','payment-v2'); s.body['data-page']='payment'
main=s.select_one('main'); band=main.select_one('.pband'); add(band,'<p class="fixture-warning">Prototype fixture: the summary and bank-transfer context contain different records. Review them separately; actions below do not change any payment.</p>')
for grid in main.select('[style*="grid-template-columns:7fr"]'): grid.attrs.pop('style',None); cls(grid,'payment-layout')
for node in main.select('[style*="position:sticky"]'): node.attrs.pop('style',None); cls(node,'payment-context')
# Preserve title exactly; responsive line breaks via text wrapping, not changed money.
forms=main.select_one('#nl-refund-amount').find_parent('section'); forms['id']='payment-form-reference'
for b in main.select('button'):
 label=b.get_text(' ',strip=True); b['type']='button'; b['data-payment-action']=label
 # All buttons get a meaningful local review; no production status mutations.
add(s.body,'''<dialog class="action-dialog" data-proto-dialog id="payment-action-dialog" aria-labelledby="payment-dialog-title" aria-describedby="payment-dialog-note"><form method="dialog" data-payment-review><div class="dialog-heading"><h2 id="payment-dialog-title">Review action</h2><button class="btn btn-secondary" value="cancel" formnovalidate aria-label="Close action dialog">Close</button></div><p id="payment-dialog-note" class="demo-note">Local review only. No refund, payment, email, or ledger entry will be created.</p><div class="field" data-refund-field><label class="label" for="review-refund">Amount (₹)</label><input class="input mono" id="review-refund" type="number" min="0.01" max="3000" step="0.01" value="3000"></div><div class="field"><label class="label" for="review-note">Reason / Notes</label><textarea class="input" id="review-note" rows="3" placeholder="Add a note for this local review"></textarea></div><p class="form-feedback" role="status" data-review-result></p><div class="dialog-actions"><button class="btn btn-secondary" value="cancel" formnovalidate>Cancel</button><button class="btn btn-primary" type="button" data-review-action>Preview action</button></div></form></dialog>''')
save(p,s)
