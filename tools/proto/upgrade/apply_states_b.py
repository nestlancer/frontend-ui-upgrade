#!/usr/bin/env python3
# ============================================================================
# Nestlancer proto upgrade — state build, batch B (client portal + content)
#
# Values come from tools/proto/DATA_AUDIT.md (captured screenshots).
#   run: python3 tools/proto/upgrade/apply_states_b.py
# ============================================================================
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from kit import (dlg, section, deck, f_text, f_select, f_area, f_check, f_file,
                 f_row, f_kv_mini, f_note, f_tbl, f_tl, f_kpis, f_chips,
                 f_btn, insert_before_main_end)

built = []
BTN = 'btn btn-secondary btn-sm'
PRIMARY = 'btn btn-primary btn-sm'
BTN_XS = 'btn btn-secondary btn-xs'


def add(route, marker, title, html):
    if insert_before_main_end(route, html, marker):
        built.append((route, title))


# ============================================================================
# CLIENT · PAYMENT DETAIL — checkout, bank/UPI transfer, receipts, dispute
# ============================================================================
pay = []

pay_body = f_kv_mini([
    ('Project', 'Khandesh Spice D2C E-Commerce Store'),
    ('Installment', 'Mid-project payment'),
    ('Amount due', '₹30,000.00'),
    ('Currency', 'INR'),
    ('Reference', '01a10a2b-5ed2-73bc-8aee-d1c6262906e9'),
    ('Created', '10/5/2026, 3:46:16 AM'),
    ('Status', '<span class="badge tone-warning"><span class="dot"></span>Pending</span>'),
])
pay_body += '<div class="mt-3">' + f_chips(['Pay online', 'Bank / UPI transfer'], 1) + '</div>'
pay_body += '<div class="mt-3">' + f_kv_mini([
    ('Primary settlement account', 'Nestlancer Pvt Ltd'),
    ('Bank', 'HDFC Bank'),
    ('A/C', '50200012345678'),
    ('IFSC', 'HDFC0001234'),
    ('UPI', 'nestlancer@hdfcbank'),
]) + '</div>'
pay_body += '<div class="mt-3">' + f_text('UTR / UPI reference', ph='e.g. NEFT UTR 123456789012',
                                          fid='py-utr', mono=True) + '</div>'
pay_body += '<div class="mt-3">' + f_area('Notes', ph='Anything the finance team should know?', rows=2, fid='py-note') + '</div>'
pay_body += '<div class="mt-3">' + f_file('Payment receipt', hint='Optional — screenshot or bank receipt') + '</div>'
pay_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
pay_body += f_btn('Submit for verification', PRIMARY) + f_btn('Cancel pending payment', BTN)
pay_body += f_btn('Download invoice', BTN) + '</div>'
pay_body += '<div class="mt-3">' + f_note('Test mode — this environment uses Razorpay test keys. The primary CTA becomes '
                                          '<b>Proceed to secure checkout</b> when Pay online is selected.') + '</div>'

d_pay_transfer = dlg('py-transfer', '042', 'Bank / UPI transfer',
                     'Pay the settlement account, then submit the reference for verification',
                     pay_body, 'Invoice NL-INV-2026-000001 v1 attached')

pay_steps = f_tl([('Created', '10/5/2026, 3:47:22 AM'),
                  ('Pending', 'waiting on your payment', None),
                  ('Processing', 'verification in progress'),
                  ('Completed', 'receipt issued automatically'),
                  ('Refunded', 'only if the studio cancels', None, True)])

d_pay_status = dlg('py-status', '001', 'Payment status',
                   'Corporate LMS for 200 Employees · Deposit · Completed',
                   f_kv_mini([('Amount due', '₹15,660.00'), ('Currency', 'INR'),
                              ('Reference', '01a10a2c-5d1c-73fa-8a13-ae6621f9c1c2'),
                              ('Created', '10/5/2026, 3:47:22 AM'),
                              ('Recorded payment', 'Yes — offline payment recorded by the studio')])
                   + '<div class="mt-3">' + pay_steps + '</div>'
                   + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                   + f_btn('Download receipt', BTN) + f_btn('Download invoice', BTN)
                   + f_btn('File a payment dispute', BTN) + '</div>')

d_pay_notdue = dlg('py-notdue', '002', 'Not due yet',
                   'Corporate LMS for 200 Employees · Final payment',
                   f_kv_mini([('Amount due', '₹15,660.00'), ('Currency', 'INR'),
                              ('Reference', '01a10a2c-5d1c-73fa-8a13-b5a4b5e610a5'),
                              ('Created', '10/5/2026, 3:47:22 AM'),
                              ('Checkout', 'locked')])
                   + '<div class="mt-3">' + f_note(
                       'Checkout not available yet — complete the current milestone (payment or delivery review) '
                       'before moving to later milestones.', 'warn') + '</div>'
                   + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                   + f_btn('Cancel pending payment', BTN) + f_btn('Cancel payment', BTN) + '</div>')

add('apps/web/payments/01a10a2c-2d0e-7499-b769-967d17a42197', 'PROTO-STATES-PAY',
    'payment states',
    section('states-payment', 'Checkout states',
            'Pay online, bank/UPI transfer, completed and not-due-yet — the four checkout states captured for this payment route.',
            eyebrow='Client states · 4 screens',
            chips=['001 completed', '002 not due yet', '010 checkout pending', '042 bank / UPI transfer'],
            body=deck([d_pay_transfer, d_pay_status, d_pay_notdue])))


# ============================================================================
# CLIENT · QUOTE DETAIL — line items, schedule, agreement, accept & sign
# ============================================================================
qt_body = f_tbl(['Line item', 'Qty', 'Unit', 'Amount'], [
    ['LMS platform setup, course builder, and video hosting', '1', '₹16,800.00', '₹16,800.00'],
    ['Quiz engine, PDF certificates, and Malayalam subtitle support', '1', '₹16,800.00', '₹16,800.00'],
    ['Okta SAML SSO integration (extended timeline) and launch', '1', '₹8,400.00', '₹8,400.00'],
    ['Optional add-on: Malayalam-English bilingual CMS module', '1', '₹6,000.00', '₹6,000.00'],
    ['HR department-wise completion dashboard', '1', '₹4,200.00', '₹4,200.00'],
    ['<b>Subtotal and Total</b>', '', '', '<b>₹52,200.00</b>'],
], mono_cols=(1, 2, 3))
qt_body += '<div class="mt-3">' + f_tbl(['Payment schedule', 'Share', 'Amount', 'Due'], [
    ['Deposit', '30%', '₹15,660.00', 'upon acceptance'],
    ['Mid-project payment', '40%', '₹20,880.00', 'upon prior milestone approval'],
    ['Final payment', '30%', '₹15,660.00', 'upon prior milestone approval'],
], mono_cols=(1, 2)) + '</div>'
qt_body += '<div class="mt-3">' + f_kv_mini([
    ('Service agreement', 'NL-CTR-2026-000005 · signed Oct 5, 2026'),
    ('Valid until', 'Oct 5, 2027'),
    ('Status', '<span class="badge tone-success"><span class="dot"></span>Accepted</span>'),
]) + '</div>'
qt_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
qt_body += f_btn('Download quote PDF', BTN) + f_btn('Preview service agreement', BTN) + '</div>'

d_qt_client = dlg('cq-lines', '022', 'Quote #01a10a2c',
                  'Corporate LMS for 200 Employees · Accepted',
                  qt_body, '10 standard terms apply (validity, acceptance, payment, scope, revisions, '
                           'client responsibilities, IP, confidentiality, liability, governing law)')

sign_body = f_tbl(['Line item', 'Qty', 'Amount'], [
    ['AUDIT-P23 edited deliverable: quote builder regression package safe HTML text '
     '&lt;img src=x onerror=alert(1)&gt;', '1', '₹1,500.00'],
    ['Subtotal', '', '₹1,500.00'],
    ['GST (18%)', '', '₹270.00'],
    ['<b>Total</b>', '', '<b>₹1,770.00</b>'],
], mono_cols=(1, 2))
sign_body += '<div class="mt-3">' + f_kv_mini([
    ('Deposit 50%', '₹885.00 · upon acceptance'),
    ('Final payment 50%', '₹885.00 · upon prior milestone approval'),
    ('Valid until', 'Oct 20, 2026'),
    ('Status', '<span class="badge tone-info"><span class="dot"></span>Viewed</span>'),
]) + '</div>'
sign_body += '<div class="mt-3">' + f_text('Legal name (signature)', ph='Type your full legal name', fid='q-sign') + '</div>'
sign_body += '<div class="mt-3">' + f_check('I have read and accept the service agreement and the 10 standard terms', False) + '</div>'
sign_body += '<div class="mt-3">' + f_note('Project-specific term: client supplies approvals within two business days. '
                                           'The line-item description renders as escaped text — injected markup is never executed.') + '</div>'

d_qt_sign = dlg('cq-sign', '044', 'Accept &amp; sign',
                'Quote #01a10f80 · For AUDIT-P23-20261005-6rdsf Request to Quote Builder',
                sign_body, 'Complete agreement to accept ₹1,770.00',
                [f_btn('Negotiate', BTN), f_btn('Decline', BTN),
                 f_btn('Accept quote &amp; sign agreement', PRIMARY, disabled=True)])

add('apps/web/quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9', 'PROTO-STATES-CQUOTE',
    'client quote states',
    section('states-client-quote', 'Quote states',
            'The accepted quote with its line items and schedule, plus the awaiting-signature state with the accept gate.',
            eyebrow='Client states · 2 screens',
            chips=['022 quotes details', '044 awaiting acceptance and signature'],
            body=deck([d_qt_client, d_qt_sign])))


# ============================================================================
# CLIENT · REQUEST DETAIL — brief, budget, requirements, history, linked quote
# ============================================================================
rq_body = f_kv_mini([
    ('Request', '01a10a2c-530e-7354-b21b-f5ecdab54f7a'),
    ('Category', 'Custom'),
    ('Created / submitted / updated', 'Oct 5, 2026'),
    ('Status', '<span class="badge tone-success"><span class="dot"></span>Converted To Project</span>'),
    ('Budget', '₹35,00,000.00 – ₹50,00,000.00'),
    ('Preferred start', 'Aug 1, 2026'),
    ('Deadline', 'Oct 31, 2026'),
    ('Timeline', 'Fixed dates'),
])
rq_body += '<div class="mt-3"><div class="sec-eyebrow">Requirements</div><ul class="prose-list">'
rq_body += ''.join('<li>' + r + '</li>' for r in [
    'Course builder with video upload',
    'Quiz engine with pass/fail thresholds',
    'SAML SSO via Okta',
    'Admin reporting — completion rates by department',
    'Malayalam subtitles on compliance modules'])
rq_body += '</ul></div>'
rq_body += '<div class="mt-3">' + f_tbl(['Attachment', 'Size', 'Action'], [
    ['request-brief.pdf', '1 KB', '<button class="' + BTN_XS + '" type="button">Preview</button>']],
    mono_cols=(1,)) + '</div>'
rq_body += '<div class="mt-3">' + f_kv_mini([
    ('Linked quote', 'Accepted ₹52,200.00'),
    ('Quote documents', 'NL-QTE-2026-000006 · service agreement NL-CTR-2026-000005'),
]) + '</div>'
rq_body += '<div class="mt-3">' + f_tl([
    ('Converted To Project', 'Oct 5, 2026 3:47 AM'),
    ('Quoted ×3', 'Oct 5, 2026 3:47 AM'),
    ('Under Review', 'Oct 5, 2026 3:47 AM'),
    ('Submitted', 'Oct 5, 2026 3:47 AM'),
    ('Draft', 'Oct 5, 2026 3:47 AM', None, True)]) + '</div>'
rq_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
rq_body += f_btn('Open projects', PRIMARY) + f_btn('Back to Work Hub', BTN) + '</div>'

add('apps/web/requests/01a10a2c-530e-7354-b21b-f5ecdab54f7a', 'PROTO-STATES-CREQ',
    'client request states',
    section('states-request-client', 'Request detail',
            'Brief, budget, requirements, attachment, the linked accepted quote and the full status history.',
            eyebrow='Client states · 1 screen', chips=['024 requests details'],
            body=deck([dlg('cr-detail', '024', 'Corporate LMS for 200 Employees',
                           'Converted To Project · created, submitted and updated Oct 5, 2026', rq_body)])))
rq_body_holder = rq_body


# ============================================================================
# CLIENT · MESSAGES — composer, group members, inline edit
# ============================================================================
ms_body = f_note('<b>Replying to Riya Kapoor</b> — “Karthik, Ananya — this thread is for settlement and webhook '
                 'questions that overlap both engagements. Project files stay in each project.”')
ms_body += '<div class="mt-3">' + f_area('Message', ph='Write a message… mentions: @Riya Kapoor, @Karthik Menon',
                                         rows=3, fid='cm-body') + '</div>'
ms_body += '<div class="mt-3">' + f_chips(['Thanks, I will review this.', 'Can you clarify the timeline?',
                                           'Could we schedule a quick call?']) + '</div>'
ms_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
ms_body += f_btn('Attach file', BTN) + f_btn('Send', PRIMARY) + '</div>'

ms_edit_body = f_area('Message', 'Reconciliation checklist posted to the shared workspace — replay UI is next.',
                      rows=3, fid='cm-edit')
ms_edit_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
ms_edit_body += f_btn('Save', PRIMARY) + f_btn('Cancel', BTN) + '</div>'

ms_members_body = f_tbl(['Member', 'Role', 'Email'], [
    ['Riya Kapoor', '<span class="badge tone-brand mono">ADMIN</span>', 'admin@nestlancer.com'],
    ['Karthik Menon', '<span class="badge tone-neutral mono">CLIENT</span>', 'karthik.menon@nestlancer.com'],
    ['Ananya Iyer', '<span class="badge tone-neutral mono">CLIENT</span>', 'ananya.iyer@nestlancer.com']])
ms_members_body += '<div class="mt-3">' + f_text('Search in conversation', ph='Search this thread…', fid='cm-search') + '</div>'
ms_members_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">' + f_btn('Leave group', BTN) + '</div>'

add('apps/web/messages/thread/01a10a2e-42f8-70c9-95f7-0d05d4fd738a', 'PROTO-STATES-CMSG',
    'client thread states',
    section('states-client-messages', 'Thread states',
            'Reply composer with mentions, the group member panel, and inline message editing in the client message centre.',
            eyebrow='Client states · 3 screens',
            chips=['038 edit message', '039 group members', '040 reply composer'],
            body=deck([
                dlg('cm-reply', '040', 'Reply composer', 'Payments ops — Razorpay settlement and webhooks · 3 members',
                    ms_body, 'Sent to Riya Kapoor and Karthik Menon'),
                dlg('cm-edit', '038', 'Edit message', 'Your message · sent Oct 5, 3:49 AM', ms_edit_body),
                dlg('cm-members', '039', 'Group info', '3 members · Group info panel', ms_members_body)])))


# ============================================================================
# CLIENT · NOTIFICATIONS — categories, unread, mark all read
# ============================================================================
nt_body = f_tbl(['Notification', 'Category', 'When'], [
    ['Your data export is ready <span class="badge tone-info mono">Settings</span>', 'Settings', '5 days ago'],
    ['Payment receipt and Invoice for Festive Season Campaign Landing Pages (₹6,000.00)', 'Payments', '5 days ago'],
    ['Contract PDF and Quote PDF (₹12,000.00) <span class="badge tone-neutral mono">Quotes</span>', 'Quotes', '5 days ago'],
    ['New message from Agency partner coordination — festive campaigns', 'Messages', '5 days ago'],
    ['New message from Riya Kapoor', 'Messages', '5 days ago'],
    ['Project status updated: Festival Season Campaign Landing Pages → Review (₹12,000.00)', 'Projects', '5 days ago'],
    ['Payment refunded ₹500.00', 'Payments', '5 days ago'],
    ['₹6,000.00 recorded for Festive Season Campaign Landing Pages (offline payment)', 'Payments', '5 days ago'],
])
nt_body = f_chips(['All', 'Unread (37)', 'Quotes', 'Payments', 'Messages', 'Projects', 'Requests',
                   'Account', 'Settings'], 1) + '<div class="mt-3">' + nt_body + '</div>'
nt_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
nt_body += f_btn('Mark all read', PRIMARY) + f_btn('Clear read', BTN) + '</div>'

add('apps/web/notifications', 'PROTO-STATES-CNOTIF', 'client notifications',
    section('states-client-notifications', 'Notification categories',
            'The category tabs, unread count and the mark-all-read action for the client notification feed.',
            eyebrow='Client states · 1 screen', chips=['008 notifications'],
            body=deck([dlg('cn-feed', '008', 'Notifications', 'Samira Patel · 37 unread', nt_body,
                           'This week · 8 items on page 1')])))


# ============================================================================
# CONTENT · BLOG EDITOR — write / split / preview modes
# ============================================================================
ed_body = f_row(f_text('Title', 'Cutting Deploy Time from 45 Minutes to Five', fid='ed-title', req=True),
                f_select('Category', ['Business', 'Case Studies', 'Engineering', 'Design'], 1))
ed_body += '<div class="mt-3">' + f_text('Slug', 'cutting-deploy-time-from-45-minutes-to-five', fid='ed-slug', mono=True) + '</div>'
ed_body += '<div class="mt-3">' + f_area('Excerpt',
    'Lessons from incremental AWS migration, chaos engineering, and tooling born from production pain.',
    rows=2, fid='ed-excerpt') + '</div>'
ed_body += '<div class="mt-3">' + f_text('Tags', 'NestJS, Node.js', fid='ed-tags') + '</div>'
ed_body += '<div class="mt-3">' + f_chips(['Write', 'Split', 'Preview'], 0) + '</div>'
ed_body += '<div class="mt-3">' + f_area('Content (Markdown)',
    '## Where we started\n## Architecture before\n## Migration timeline',
    rows=5, fid='ed-content') + '</div>'
ed_body += '<div class="mt-3">' + f_kv_mini([('Words', '411'), ('Read time', '3 min'),
                                            ('Meta description', '97/160 chars'),
                                            ('Status', 'Published'),
                                            ('Unsaved draft', 'yes')]) + '</div>'
ed_body += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
ed_body += f_btn('Save changes', PRIMARY) + f_btn('Cancel', BTN) + '</div>'

ed_split = f_row(
    f_area('Markdown', '**Bold** text and ## headings render instantly on the right.',
           rows=4, fid='ed-left'),
    f'<div class="panel" style="box-shadow:none"><div class="panel-head"><h3 class="panel-title">Instant preview</h3></div>'
    f'<div class="panel-body prose"><h2 style="font-size:17px;margin-top:0">Where we started</h2>'
    f'<p class="text-sm">The pipeline built every service on each commit — hotfix queue depth grew while waiting for it.</p>'
    f'<p class="text-sm"><b>Bold</b> markdown renders here; the split view never needs a save.</p></div></div>')

d_ed_split = dlg('ed-split', '068', 'Split mode', 'Left editor, right instant preview — same post, no save required',
                 ed_split, 'Preview renders Markdown headings, bullets, code sketches and tags',
                 [f_btn('Save changes', PRIMARY)])

d_ed_preview = dlg('ed-preview', '067', 'Preview mode',
                   'Cutting Deploy Time from 45 Minutes to Five · Case Studies · 2 min read',
                   f_note('Unsaved draft — not public until you publish.') + '<div class="mt-3">'
                   + f_kpis([('Words', '383', 'current draft'), ('Meta description', '80', 'chars'),
                             ('Status', 'Published', 'live version'), ('Unsaved draft', 'Yes', 'preview only', 'up')])
                   + '</div><div class="mt-3">' + f_chips(['#NestJS', '#Node.js', 'headings', 'bullets',
                                                           'code sketch · BlogGatewayController']) + '</div>',
                   'Responsive preview · desktop, tablet, phone')

add('apps/admin/content/posts/01a10a2a-361c-758f-a218-fb673fd3b9d2/edit', 'PROTO-STATES-EDITOR',
    'editor modes',
    section('states-editor', 'Editor modes',
            'Write, split and preview — the three editor states captured for this post, including the writing stats and markdown preview contract.',
            eyebrow='Operator states · 3 screens',
            chips=['067 preview mode', '068 split mode', '069 write mode'],
            body=deck([dlg('ed-write', '069', 'Write mode',
                           'Netflix: Seven Years from Monolith to Microservices', ed_body,
                           'Create post stays disabled until title, category and content are filled',
                           [f_btn('Cancel', BTN), f_btn('Create post', PRIMARY, disabled=True)]),
                       d_ed_split, d_ed_preview])))


# ============================================================================
# SYSTEM · CONFIG / HEALTH / FEATURES / JOBS / TEMPLATES / OPERATIONS
# ============================================================================
sys_deck = []

sys_deck.append(dlg(
    'sys-health', '059 · 105', 'Health &amp; diagnostics',
    'Gateway Reachable · service Healthy · maintenance Off · flags 5/12 enabled',
    f_kpis([('Service', 'Healthy', 'admin worker'), ('Config keys', '14', 'all saved'),
            ('Feature flags', '5/12', 'enabled'), ('Templates', '62', '10 email · 52 notification')])
    + '<div class="mt-3">' + f_tbl(['Dependency', 'State'], [
        ['database', '<span class="badge tone-success"><span class="dot"></span>connected: true</span>'],
        ['cache', '<span class="badge tone-success"><span class="dot"></span>connected: true</span>'],
        ['queue', '<span class="badge tone-success"><span class="dot"></span>connected: true</span>'],
    ]) + '</div>'
    + '<div class="mt-3">' + f_kv_mini([
        ('Status / timestamp', 'healthy · 2026-10-10T12:01:22.083Z'),
        ('Flags live', 'newDashboard true · advancedAnalytics false · betaFeatures true')]) + '</div>'
    + '<div class="mt-3">' + f_tbl(['Cache action', 'Scope'], [
        ['Clear all cache', 'every key'],
        ['Clear key', 'exact cache key'],
    ]) + '</div>'
    + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
    + f_btn('Hide diagnostics', BTN) + f_btn('Download logs (CSV)', BTN) + '</div>'))

sys_deck.append(dlg(
    'sys-flags', '060', 'Feature flags', '5 on · 7 off',
    f_tbl(['Flag', 'State'], [
        ['Enforce 2FA for all admin accounts', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable outbound webhook delivery', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable virus scanning for uploaded files', '<span class="badge tone-success"><span class="dot"></span>On</span>'],
        ['Enable system-wide maintenance mode', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable API rate limiting', '<span class="badge tone-success"><span class="dot"></span>On</span>'],
        ['Enable email notification delivery', '<span class="badge tone-success"><span class="dot"></span>On</span>'],
        ['Enable push notification delivery', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable advanced analytics dashboard', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable blog commenting system', '<span class="badge tone-success"><span class="dot"></span>On</span>'],
        ['Make portfolio items publicly visible', '<span class="badge tone-success"><span class="dot"></span>On</span>'],
        ['Enable chunked file upload support', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
        ['Enable CDN processing for media files', '<span class="badge tone-neutral"><span class="dot"></span>Off</span>'],
    ])))

sys_deck.append(dlg(
    'sys-jobs', '061', 'Background jobs', '12 queues · all COMPLETED at 10/10/2026 8:09:54 AM',
    f_tbl(['Queue', 'State', 'Last run', 'Actions'], [
        [q, '<span class="badge tone-success"><span class="dot"></span>COMPLETED</span>', '10/10/2026 8:09:54 AM',
         '<button class="' + BTN_XS + '" type="button">Retry</button> <button class="' + BTN_XS + '" type="button">Cancel</button>']
        for q in ['email', 'notification', 'audit', 'media', 'webhook', 'cdn', 'analytics', 'document',
                  'export', 'payments.webhook', 'system.webhook', 'projects.lifecycle']], mono_cols=(2,))))

sys_deck.append(dlg(
    'sys-ops', '062', 'Operations', 'Announcements and maintenance mode',
    f_text('Announcement title', ph='e.g. Scheduled maintenance tonight', fid='so-title', req=True)
    + '<div class="mt-3">' + f_area('Message body', ph='Maximum 1000 characters', rows=4, fid='so-body') + '</div>'
    + '<div class="mt-3">' + f_row(f_select('Severity', ['Info', 'Warning', 'Critical'], 0),
                                    f_text('Estimated end', ph='optional', fid='so-end', mono=True)) + '</div>'
    + '<div class="mt-3">' + f_check('Users can dismiss the announcement', True) + '</div>'
    + '<div class="mt-3">' + f_note('Maintenance mode is currently <b>Disabled</b>. Banner text: '
                                    '“System is under maintenance. Please check back later.” — no changes to apply.', 'warn') + '</div>'
    + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
    + f_btn('Save announcement', PRIMARY, disabled=True) + f_btn('Cancel', BTN) + '</div>',
    'Send announcement unlocks once the title and body are filled'))

sys_deck.append(dlg(
    'sys-templates', '063 · 106 · 107', 'Templates',
    'Email 10 · notifications 52 — edit and preview without deploying',
    f_tbl(['Key', 'Template', 'Updated'], [
        ['verification', 'Verify your Nestlancer account', 'Edit · Preview'],
        ['welcome', 'Welcome to Nestlancer!', 'Edit · Preview'],
        ['password-reset', 'Reset your Nestlancer password', 'Edit · Preview'],
        ['quote-sent', 'New quote for your project: {{projectTitle}}', 'Edit · Preview'],
        ['payment-receipt', 'Payment receipt for {{amount}}', 'Edit · Preview'],
        ['project-update', 'New update on {{projectTitle}}', 'Edit · Preview'],
        ['milestone-completed', '{{milestoneName}} approved', 'Edit · Preview'],
        ['new-message', 'New message from {{senderName}}', 'Edit · Preview'],
        ['account-suspended', 'Your account has been suspended', 'Edit · Preview'],
        ['contact-received', 'We received your message – Ticket #{{ticketId}}', 'Edit · Preview'],
    ])
    + '<div class="mt-3">' + f_kv_mini([
        ('Email preview', 'From Nestlancer &lt;noreply@nestlancer.com&gt; · To recipient@example.com'),
        ('Notification template', 'account-deleted-user · event account.deleted · title “Account deleted” · body “Your account has been deleted.” · channels [IN_APP]'),
        ('Body sample', 'Hi {{userName}} — thanks for joining Nestlancer. This link expires in 24 hours.')]) + '</div>'
    + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
    + f_btn('Send test', BTN) + f_btn('Save template', PRIMARY) + '</div>'))

add('apps/admin/system', 'PROTO-STATES-SYSTEM', 'system states',
    section('states-system', 'System configuration states',
            'Health and diagnostics, feature flags, background jobs, operations and templates — the six tabs captured in System Config.',
            eyebrow='Operator states · 8 screens',
            chips=['059 health', '060 features', '061 jobs', '062 operations', '063 templates',
                   '104 configuration', '105 diagnostics', '106 email template', '107 notification template'],
            body=deck(sys_deck)))

print('batch B — built ' + str(len(built)) + ' state blocks')
for r, t in built:
    print('  ▸ ' + r + '  (' + t + ')')
