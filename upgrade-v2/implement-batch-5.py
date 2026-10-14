"""Batch 5 — public lane (20 pages). One-shot, route-specific transformations.

Run from the repo root: python3 upgrade-v2/implement-batch-5.py
Never copies landing bodies; every page keeps its own text, data and links.
"""
import json
import re
import shutil
from pathlib import Path

exec(Path('upgrade-v2/implement-launch.py').read_text().split('# Home')[0])

LOG = []


def setup(route, kind, page, extra=()):
    p, s, rel = load('proto/apps/' + route + '/index.html', kind)
    cls(s.body, 'flow-v2', 'batch-five', *extra)
    s.body['data-page'] = page
    add(s.head, f'<link rel="stylesheet" href="{rel}/public-flow.css"><script defer src="{rel}/public-flow.js"></script>')
    if kind == 'studio-v2':
        for e in s.select('.mkt-hero'):
            e.attrs.pop('style', None)
    return p, s, rel


def figure(rel, art, alt, caption, klass='flow-figure', w=760, h=520):
    return fragment(f'<figure class="{klass}" data-signature><img src="{rel}/art/{art}.svg" width="{w}" height="{h}" alt="{alt}"><figcaption>{caption}</figcaption></figure>').figure


def scope_tables(s):
    for th in s.select('main thead th'):
        th['scope'] = 'col'


def finish(p, s, notes):
    scope_tables(s)
    save(p, s)
    LOG.append({'path': str(p), 'notes': notes})


def top_child(node, parent):
    while node.parent is not parent:
        node = node.parent
    return node


def wrap_auth_form(s, message, next_label, note_id):
    """Move the fields that precede the original action-only form into it."""
    main = s.main
    old = main.select_one('form')
    first = main.select_one('.field, .flex.gap-2.mb-4')
    start = top_child(first, main)
    form = s.new_tag('form', attrs={'action': old['action'], 'method': 'get', 'class': 'flow-auth-form', 'data-flow-form': message, 'data-flow-next': next_label, 'aria-describedby': note_id})
    start.insert_before(form)
    node = start
    while node is not None and node is not old:
        nxt = node.next_sibling
        form.append(node.extract())
        node = nxt
    for n in list(old.contents):
        form.append(n.extract())
    old.decompose()
    submit = form.select_one('[type="submit"]')
    submit['disabled'] = ''
    add(form, f'<p id="{note_id}" class="demo-note">Local prototype only. Use sample details; nothing is sent, stored or authenticated. Requires JavaScript.</p><p class="form-feedback" role="status" tabindex="-1" data-flow-result></p>')
    return form


def reveal(s, input_el):
    input_el['data-revealable'] = ''
    btn = fragment(f'<button class="reveal-toggle" type="button" data-flow-reveal aria-controls="{input_el["id"]}" aria-pressed="false" aria-label="Show password" disabled>Show</button>').button
    input_el.insert_after(btn)
    # Keep a stable name while the visible text toggles.
    btn['aria-label'] = 'Show ' + (s.find('label', attrs={'for': input_el['id']}).get_text(' ', strip=True).replace('*', '').strip().lower())


def require_marked(form):
    for lab in form.select('label.label'):
        if lab.select_one('.req'):
            el = form.find(id=lab.get('for'))
            if el:
                el['required'] = ''


def auth_rail(s, rel, art, alt, caption):
    rail = s.select_one('.auth-rail-inner')
    demo = rail.select_one('.demo-card')
    cls(demo, 'auth-preview')
    demo.insert_before(figure(rel, art, alt, caption, 'auth-art'))
    det = s.new_tag('details', attrs={'class': 'auth-preview-details'})
    summ = s.new_tag('summary')
    summ.string = 'Project Hub preview'
    det.append(summ)
    demo.insert_before(det)
    det.append(demo.extract())


def steps(labels, current):
    cur = ' aria-current="step"'
    items = ''.join('<li' + (cur if i == current else '') + '>' + t + '</li>' for i, t in enumerate(labels))
    return fragment(f'<ol class="flow-steps" aria-label="Progress">{items}</ol>').ol


def otp_fieldset(s, row, label):
    fs = s.new_tag('fieldset', attrs={'data-otp': '', 'class': 'otp-group'})
    leg = s.new_tag('legend')
    leg.string = label
    fs.append(leg)
    for i, inp in enumerate(row.select('input')):
        inp.attrs.pop('style', None)
        inp['inputmode'] = 'numeric'
        inp['pattern'] = '[0-9]'
        inp['autocomplete'] = 'one-time-code' if i == 0 else 'off'
        inp['required'] = ''
        fs.append(inp.extract())
    row.replace_with(fs)
    return fs


def resend_button(s, link, status_id):
    b = s.new_tag('button', attrs={'type': 'button', 'class': 'link', 'data-flow-resend': '', 'disabled': '', 'aria-describedby': status_id})
    b.string = link.get_text(strip=True)
    link.replace_with(b)
    return b


# ===================================================================== AUTH
SIGNUP = ['Account', 'Verify email', 'Workspace']
RESET = ['Request link', 'New password', 'Sign in']

# REGISTER — the original action (verify-email) is retained as the next step.
p, s, rel = setup('web/register', 'auth-v2', 'register')
form = wrap_auth_form(s, 'Prototype only: no account was created and nothing was sent.', 'Continue to the sample email verification step', 'register-note')
require_marked(form)
s.find(id='nl-password')['autocomplete'] = 'new-password'
s.find(id='nl-confirm-password')['autocomplete'] = 'new-password'
s.find(id='nl-confirm-password')['data-match'] = 'nl-password'
s.find(id='nl-first-name')['autocomplete'] = 'given-name'
s.find(id='nl-last-name')['autocomplete'] = 'family-name'
s.find(id='nl-email')['autocomplete'] = 'email'
for pid in ['nl-password', 'nl-confirm-password']:
    reveal(s, s.find(id=pid))
terms = form.select('label.check input')[0]
terms['required'] = ''
terms['id'] = 'register-terms'
form.select('label.check input')[1]['id'] = 'register-updates'
s.main.select_one('.mb-7').insert_before(steps(SIGNUP, 0))
auth_rail(s, rel, 'account-access', 'Illustration of a client account being set up: identity card, key and a protected workspace panel.', 'Illustrative account setup · local prototype')
finish(p, s, ['form wraps fields; required/autocomplete; password match; reveal toggles; steps; account-access art'])

# FORGOT PASSWORD
p, s, rel = setup('web/forgot-password', 'auth-v2', 'forgot-password')
form = wrap_auth_form(s, 'Prototype only: no reset email was sent.', 'Continue to the sample new-password step', 'forgot-note')
em = s.find(id='nl-email')
em['required'] = ''
em['autocomplete'] = 'email'
s.main.select_one('.mb-7').insert_before(steps(RESET, 0))
auth_rail(s, rel, 'account-access', 'Illustration of account recovery: identity card, key and a protected workspace panel.', 'Illustrative account recovery · local prototype')
finish(p, s, ['form wraps email; required; steps; account-access art'])

# RESET PASSWORD — enforce only the requirements this page states.
p, s, rel = setup('web/reset-password', 'auth-v2', 'reset-password')
form = wrap_auth_form(s, 'Prototype only: no password was changed.', 'Return to sign in', 'reset-note')
req = [d for d in form.select('.panel') if 'Password requirements' in d.get_text()][0]
req['id'] = 'password-requirements'
newp = s.find(id='nl-new-password')
for k, v in {'required': '', 'minlength': '10', 'autocomplete': 'new-password', 'pattern': '(?=.*[A-Z])(?=.*[0-9]).{10,}', 'title': '10+ characters with one uppercase letter and one number', 'aria-describedby': 'password-requirements'}.items():
    newp[k] = v
conf = s.find(id='nl-confirm-new-password')
for k, v in {'required': '', 'autocomplete': 'new-password', 'data-match': 'nl-new-password'}.items():
    conf[k] = v
for pid in ['nl-new-password', 'nl-confirm-new-password']:
    reveal(s, s.find(id=pid))
s.main.select_one('.mb-7').insert_before(steps(RESET, 1))
auth_rail(s, rel, 'account-access', 'Illustration of a new password protecting a client workspace.', 'Illustrative password reset · local prototype')
finish(p, s, ['form; minlength/pattern from stated requirements; match; reveal; steps; art'])

# VERIFY EMAIL — six digits, resend cooldown, original dashboard action.
p, s, rel = setup('web/verify-email', 'auth-v2', 'verify-email')
form = wrap_auth_form(s, 'Prototype only: the code was not checked.', 'Open the sample client dashboard', 'verify-email-note')
otp_fieldset(s, form.select_one('.flex.gap-2.mb-4'), 'Verification code')
form.insert_after(fragment('<p class="flow-status" id="verify-email-resend" role="status" tabindex="-1"></p>').p)
resend_button(s, s.main.find('a', string='Resend code'), 'verify-email-resend')
s.main.select_one('.mb-7').insert_before(steps(SIGNUP, 1))
auth_rail(s, rel, 'verification-seal', 'Illustration of a verification seal over an envelope and a six-digit code.', 'Illustrative verification · local prototype')
finish(p, s, ['otp fieldset with advance/paste; resend cooldown; steps; verification-seal art'])

# ===================================================================== PUBLIC FLOWS
# VERIFY (public) — the button had no form; verification leads to the same
# client dashboard as the sibling verify-email route.
p, s, rel = setup('web/verify', 'studio-v2', 'verify')
card = s.main.select_one('.mkt-card')
wrapper = card.parent
wrapper.attrs.pop('style', None)
cls(wrapper, 'verify-layout')
row = card.select_one('.flex.gap-2.justify-center')
btn = card.select_one('button.btn-primary')
form = s.new_tag('form', attrs={'action': '../dashboard/index.html', 'method': 'get', 'class': 'flow-auth-form', 'data-flow-form': 'Prototype only: the code was not checked and no account was activated.', 'data-flow-next': 'Open the sample client dashboard', 'aria-describedby': 'verify-note'})
row.insert_before(form)
form.append(row.extract())
fs = otp_fieldset(s, row, 'Verification code')
btn['type'] = 'submit'
btn['disabled'] = ''
form.append(btn.extract())
add(form, '<p id="verify-note" class="demo-note">Local prototype only. The sample code is pre-filled; nothing is sent or checked. Requires JavaScript.</p><p class="form-feedback" role="status" tabindex="-1" data-flow-result></p>')
resend_button(s, card.find('a', string='Resend code'), 'verify-resend')
form.insert_after(fragment('<p class="flow-status" id="verify-resend" role="status" tabindex="-1"></p>').p)
wrapper.append(figure(rel, 'verification-seal', 'Illustration of a verification seal over an envelope and a six-digit code.', 'Illustrative verification · local prototype'))
finish(p, s, ['otp form with original prefilled digits; resend; verification-seal art'])

# VERIFY DOCUMENT — local lookup against the single sample record on the page.
p, s, rel = setup('web/verify-document', 'studio-v2', 'verify-document')
hero = s.select_one('.mkt-hero .mkt-wrap')
copy = s.new_tag('div', attrs={'class': 'doc-hero-copy'})
for el in list(hero.contents):
    copy.append(el.extract())
hero.append(copy)
cls(hero, 'doc-hero')
hero.append(figure(rel, 'verification-seal', 'Illustration of a document with a verification seal and hash lines.', 'Illustrative signature check · not a live service'))
grid = s.find(id='nl-document-reference').find_parent(class_='grid')
grid.attrs.pop('style', None)
grid['class'] = ['doc-lookup']
form = s.new_tag('form', attrs={'data-doc-verify': 'doc-result', 'role': 'search', 'aria-label': 'Verify a document reference'})
grid.insert_before(form)
form.append(grid.extract())
vb = grid.select_one('button')
vb['type'] = 'submit'
vb['disabled'] = ''
s.find(id='nl-document-reference')['aria-describedby'] = 'doc-ref-help'
s.find(id='nl-document-reference')['autocomplete'] = 'off'
s.find(id='nl-document-reference')['spellcheck'] = 'false'
help_ = form.find_next_sibling('div')
help_['id'] = 'doc-ref-help'
add(form, '<p class="flow-status" role="status" tabindex="-1" data-doc-status></p>')
panel = s.find('h2', string=re.compile('Authentic')).find_parent(class_='panel')
panel['id'] = 'doc-result'
panel['data-doc-ref'] = 'NL-INV-2026-000008'
panel['aria-live'] = 'polite'
cls(panel.select_one('.note'), 'hash-line')
form.parent.insert_after(fragment('<p class="demo-note">Prototype lookup: only the sample invoice reference above is included. No request is sent; checks run in this browser.</p>').p)
finish(p, s, ['doc lookup form with local result/format checks; hero art'])

# IMPERSONATE — facts become a description list; art shows the operator boundary.
p, s, rel = setup('web/impersonate', 'studio-v2', 'impersonate')
card = s.main.select_one('.mkt-card')
wrapper = card.parent
wrapper.attrs.pop('style', None)
cls(wrapper, 'session-layout')
facts = card.select_one('.grid.gap-3.mt-5')
facts.name = 'dl'
facts.attrs.pop('style', None)
facts['class'] = ['session-facts', 'mt-5']
for el in facts.find_all(recursive=False):
    el.name = 'dt' if el.name == 'span' else 'dd'
note = card.select_one('.note.warn')
note['role'] = 'note'
wrapper.append(figure(rel, 'operator-console', 'Illustration of an operator console beside a restricted client view.', 'Illustrative restricted session · audit logged'))
finish(p, s, ['facts dl; restricted note role; operator-console art'])

# SHARE — read-only quote snapshot.
p, s, rel = setup('web/share/[token]', 'studio-v2', 'share')
wrap = s.select_one('.mkt-hero .mkt-wrap')
wrap.attrs.pop('style', None)
cls(wrap, 'share-wrap')
top = wrap.select_one('.flex.items-center.gap-3.mb-5')
head = s.new_tag('div', attrs={'class': 'share-head'})
top.insert_before(head)
head.append(top.extract())
head.append(figure(rel, 'shared-quote', 'Illustration of a read-only shared quote with a lock and expiry tag.', 'Illustrative read-only snapshot', 'flow-figure share-figure'))
tbl = wrap.select_one('table')
tbl['aria-label'] = 'Quote NL-QTO-2026-000116 line items'
finish(p, s, ['share head with art; table caption/scope'])

# ===================================================================== CONTENT
# HOME — delivery system illustration beside the original three promises.
p, s, rel = setup('web', 'studio-v2', 'web-home')
for i, sec in enumerate(s.select('main > section')):
    cls(sec, 'section-' + str(i))
    if i:
        sec['data-section-reveal'] = ''
vit = s.main.select_one('[style*="repeat(5,1fr)"]')
vit.attrs.pop('style', None)
cls(vit, 'home-vitals')
second = s.select('main > section')[1].select_one('.mkt-wrap')
cards = second.select_one('.grid.g3')
system = s.new_tag('div', attrs={'class': 'home-system'})
cards.insert_before(system)
system.append(figure(rel, 'delivery-system', 'An illustrated Nestlancer delivery system: a brief and code connect to a layered nest, a product interface, and a completion check.', 'FIG 01 · Brief → build → deliver', w=760, h=660))
system.append(cards.extract())
cls(cards, 'home-promises')
finish(p, s, ['delivery-system art; responsive vitals; section reveal'])

# ABOUT
p, s, rel = setup('web/about', 'studio-v2', 'web-about')
hero = s.select_one('.mkt-hero .mkt-wrap')
copy = s.new_tag('div', attrs={'class': 'flow-hero-copy'})
for el in list(hero.contents):
    copy.append(el.extract())
hero.append(copy)
cls(hero, 'flow-hero')
hero.append(figure(rel, 'studio-collaboration', 'Illustration of a product studio collaborating around a shared delivery board.', 'Illustrative studio collaboration · not a team photo'))
finish(p, s, ['hero art'])

# PORTFOLIO — local search + sector filter over the eight original cards.
p, s, rel = setup('web/portfolio', 'studio-v2', 'web-portfolio')
covers(s, rel)
timeline = s.select_one('.pj-timeline')
timeline['id'] = 'portfolio-list'
timeline['data-flow-list'] = ''
timeline['data-flow-noun'] = 'case studies'
items = timeline.select(':scope > article')
texts = [i.get_text(' ', strip=True).lower() for i in items]
for it in items:
    it['data-flow-item'] = ''
fb = s.select_one('form.filterbar')
search = fb.select_one('input[type="search"]')
for k, v in {'data-flow-search': 'portfolio-list', 'aria-controls': 'portfolio-list', 'disabled': '', 'aria-label': 'Search case studies'}.items():
    search[k] = v
sel = s.find(id='pf-sector')
for k, v in {'data-flow-select': 'portfolio-list', 'aria-controls': 'portfolio-list', 'disabled': '', 'aria-describedby': 'portfolio-filter-note'}.items():
    sel[k] = v
unmatched = []
for o in sel.select('option')[1:]:
    if not any(o.get_text(strip=True).lower() in t for t in texts):
        o['disabled'] = ''
        unmatched.append(o.get_text(strip=True))
fb.insert_after(fragment(f'<div class="flow-filter-meta"><span role="status" data-flow-result-for="portfolio-list">All {len(items)} case studies shown.</span><button class="btn btn-ghost btn-sm" type="button" data-flow-clear="portfolio-list" disabled>Clear filters</button></div>').div)
fb.insert_after(fragment(f'<p class="demo-note" id="portfolio-filter-note">Filters run in this browser over the eight cards on this page. Sectors without a matching sample ({", ".join(unmatched)}) are shown but unavailable.</p>').p)
timeline.insert_after(fragment('<div class="flow-empty" data-flow-empty="portfolio-list" hidden><b>No matching case studies on this page.</b>Try another sector or <button class="link" type="button" data-flow-clear="portfolio-list" disabled>clear the filters</button>.</div>').div)
add(timeline.find_parent(class_='mkt-wrap'), '<p class="art-caption">Illustrative product concepts — not customer screenshots.</p>')
finish(p, s, ['work art covers; local search + sector filter; unmatched sectors disabled: ' + ', '.join(unmatched)])

# WORK
p, s, rel = setup('web/work', 'studio-v2', 'web-work')
covers(s, rel)
grid = s.main.select_one('.grid.g3')
grid.insert_after(fragment('<p class="art-caption">Illustrative product concepts — not customer screenshots.</p>').p)
finish(p, s, ['work art covers + caption'])

# EDITORIAL LISTS
JOURNAL_ART = ['deployment-pipeline', 'payment-flow', 'work-analytics', 'work-workspace', 'delivery-process', 'work-commerce']


def journal(route, page, alt_caption):
    p, s, rel = setup(route, 'studio-v2', page)
    add(s.head, f'<link rel="stylesheet" href="{rel}/editorial.css">')
    hero = s.select_one('.mkt-hero .mkt-wrap')
    copy = s.new_tag('div', attrs={'class': 'list-hero-copy'})
    for el in list(hero.contents):
        copy.append(el.extract())
    hero.append(copy)
    cls(hero, 'list-hero')
    hero.append(figure(rel, 'editorial-journal', 'Illustration of an editorial journal with stacked article cards and a bookmark ribbon.', alt_caption))
    for i, cover in enumerate(s.select('main .cover')):
        cover.attrs.pop('style', None)
        cls(cover, 'journal-cover')
        add(cover, f'<img src="{rel}/art/{JOURNAL_ART[i % len(JOURNAL_ART)]}.svg" width="960" height="440" alt="" loading="lazy">')
    return p, s, rel


for route, page in [('web/blog/category/[slug]', 'blog-category'), ('web/blog/tag/[slug]', 'blog-tag')]:
    p, s, rel = journal(route, page, 'Illustrative journal · article art is decorative')
    rss = s.select_one('aside a.rail-link[href="#"]')
    del rss['href']
    rss['aria-disabled'] = 'true'
    rss['role'] = 'link'
    add(rss, ' <small>not connected</small>')
    aside = rss.find_parent('aside')
    aside['aria-label'] = 'Journal navigation'
    finish(p, s, ['hero art; journal covers; RSS disclosed as not connected'])

p, s, rel = journal('web/blog/bookmarks', 'blog-bookmarks', 'Illustrative reading list')
lst = s.main.select_one('.flex-col.gap-4')
lst['data-bookmark-list'] = ''
lst['data-bookmark-status'] = 'bookmark-status'
lst['aria-label'] = 'Saved articles'
for card in lst.select(':scope > .mkt-card'):
    title = card.select_one('b').get_text(strip=True)
    card.attrs.pop('style', None)
    cls(card, 'bookmark-card')
    card['data-bookmark'] = title
    rm = card.select_one('button')
    rm.attrs.pop('title', None)
    rm['type'] = 'button'
    rm['aria-label'] = 'Remove bookmark: ' + title
    rm['data-bookmark-remove'] = ''
    rm['disabled'] = ''
    card.select_one('a')['aria-label'] = 'Read ' + title
lst.insert_after(fragment('<p class="demo-note">Removing a bookmark only hides it in this preview; nothing is stored. Requires JavaScript.</p>').p)
lst.insert_after(fragment('<p class="flow-status" id="bookmark-status" role="status" tabindex="-1"></p>').p)
finish(p, s, ['hero art; journal covers; local remove with undo'])

# LEGAL — rail links map to real section ids; missing sections are disclosed.
for route, page in [('web/terms', 'terms'), ('web/privacy', 'privacy')]:
    p, s, rel = setup(route, 'studio-v2', page)
    aside = s.select_one('.doc-layout aside')
    heads = s.select('.doc-layout .prose h2[id]')
    links = aside.select('a.rail-link')
    nav = s.new_tag('nav', attrs={'aria-label': 'Sections of this document'})
    for a in links:
        nav.append(a.extract())
    aside.append(nav)
    aside['data-reading-rail'] = ''
    aside.attrs.pop('style', None)
    cls(aside, 'legal-rail')
    missing = []
    by_text = {h.get_text(strip=True).lower(): h['id'] for h in heads}
    for i, a in enumerate(links):
        t = a.get_text(strip=True).lower()
        target = by_text.get(t)
        if target is None and len(links) == len(heads):
            target = heads[i]['id']  # e.g. "Liability" → "7. Limitation of liability"
        if target:
            a['href'] = '#' + target
        else:
            del a['href']
            a['aria-disabled'] = 'true'
            a['role'] = 'link'
            add(a.span, ' <small>not in this version</small>')
            missing.append(a.get_text(' ', strip=True))
    if missing:
        nav.insert_after(fragment('<p class="demo-note">Sections marked “not in this version” are listed in the outline but not yet published in this document.</p>').p)
    finish(p, s, ['rail anchors + active section; missing: ' + ', '.join(missing)])

# ===================================================================== OPERATOR SIGN-IN
p, s, rel = setup('admin/login', 'operator-auth-v2', 'admin-login')
left = s.select_one('.auth-left')
grid = left.select_one('.grid.g2')
grid.insert_before(figure(rel, 'operator-console', 'Illustration of an operator console behind an identity check with a shield and audit trail.', 'Illustrative operator boundary · local prototype', 'flow-figure operator-art'))
form = s.select_one('main form')
form['data-flow-form'] = 'Prototype only: operator credentials were not checked and no session was created.'
form['data-flow-next'] = 'Open the sample command center'
form['aria-describedby'] = 'operator-note'
form['class'] = ['flow-auth-form']
for i in ['op-email', 'op-pass']:
    s.find(id=i)['required'] = ''
show = form.find('span', string='Show')
show.name = 'button'
show['type'] = 'button'
show['class'] = ['reveal-inline', 'mono', 'text-xs']
show['data-flow-reveal'] = ''
show['aria-controls'] = 'op-pass'
show['aria-pressed'] = 'false'
show['aria-label'] = 'Show password'
show['disabled'] = ''
form.select_one('label.check input')['id'] = 'op-trust'
sub = form.select_one('[type="submit"]')
sub['disabled'] = ''
add(form, '<p id="operator-note" class="demo-note">Local prototype only. Sample values are pre-filled; nothing is sent, stored or authenticated. Requires JavaScript.</p><p class="form-feedback" role="status" tabindex="-1" data-flow-result></p>')
finish(p, s, ['operator-console art; reveal; required; local result'])

# ===================================================================== DETAIL ROUTES
# These dynamic routes are byte-identical at baseline (dfc0f42) to the already
# upgraded sibling routes at the same depth, so the deterministic Batch 3
# transform yields identical output. Copy rather than re-implement.
for dyn, src in [('web/blog/[slug]', 'web/blog/cutting-deploy-time-from-45-minutes-to-five'), ('web/portfolio/[id]', 'web/portfolio/fintech-payments-hub')]:
    d = Path('proto/apps/' + dyn + '/index.html')
    if 'upgrade-v2' in d.read_text():
        raise RuntimeError('One-shot migration already applied: ' + str(d))
    shutil.copyfile('proto/apps/' + src + '/index.html', d)
    LOG.append({'path': str(d), 'notes': ['baseline-identical to ' + src + '; upgraded output reused']})

Path('upgrade-v2/evidence/batch-5-wiring.json').write_text(json.dumps(LOG, indent=1))
print(len(LOG), 'pages')
for x in LOG:
    print(x['path'], '·', '; '.join(x['notes']))
