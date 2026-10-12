#!/usr/bin/env python3
# ============================================================================
# Nestlancer proto upgrade — state build, batch A (admin operations)
#
# Builds the screen states the grade report flags as "not built as its own
# page". Values come from tools/proto/DATA_AUDIT.md (captured screenshots).
#
#   run: python3 tools/proto/upgrade/apply_states_a.py
# ============================================================================
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from kit import (dlg, section, deck, f_text, f_select, f_area, f_check,
                 f_row, f_kv_mini, f_note, f_tbl, f_tl, f_kpis, f_chips,
                 f_btn, insert_before_main_end)

built = []


def add(route, marker, title, html):
    if insert_before_main_end(route, html, marker):
        built.append((route, title))


BTN = 'btn btn-secondary btn-sm'
PRIMARY = 'btn btn-primary btn-sm'
DANGER = 'btn btn-danger-solid btn-sm'
BTN_XS = 'btn btn-secondary btn-xs'


# ------------------------------------------------------------ users · dialogs
edit_profile = f_row(
    f_text('First name', 'Arjun', fid='up-first'),
    f_text('Last name', 'Mehta', fid='up-last'),
) + '<div class="mt-3">' + f_text('Email', 'arjun.mehta@nestlancer.com', fid='up-email', mono=True) + '</div>'

d_up_edit = dlg('us-edit-profile', '109', 'Edit profile',
                'FirstName, LastName and email are the account keys.',
                edit_profile,
                'Changing the email does not send a verification mail in this build.',
                [f_btn('Cancel', BTN), f_btn('Save', PRIMARY)])

d_up_imp = dlg('us-impersonate', '110', 'Open this client account',
               'Impersonation is audited — a reason is required before the client tab opens.',
               f_text('Reason for this action (audit log)', ph='Reason for this action (audit log)',
                      fid='ui-reason', req=True)
               + '<div class="mt-3">' + f_kv_mini([('Session length', '60 minutes'),
                                                   ('Audited as', 'impersonation_started'),
                                                   ('Client tab', 'opens in a new tab after confirm')]) + '</div>',
               'Open client account stays disabled until a reason is entered.',
               [f_btn('Cancel', BTN), f_btn('Open client account', PRIMARY, disabled=True)])

d_up_pwd = dlg('us-set-password', '113', 'Set new password',
               'Updating the password ends all sessions.',
               f_row(f_text('New password', ph='Minimum 8 characters', fid='sp-new'),
                     f_text('Confirm password', ph='Repeat the new password', fid='sp-conf'))
               + '<div class="mt-3">' + f_note('Minimum 8 characters. Updating the password ends all sessions.', 'warn') + '</div>',
               'Both fields must match before Update password unlocks.',
               [f_btn('Cancel', BTN), f_btn('Update password', PRIMARY)])

d_up_rev = dlg('us-revoke-session', '112', 'Revoke session',
               'This will sign the user out of this device.',
               f_kv_mini([('Device', 'Chrome on Linux'),
                          ('IP', '136.86.144.132'),
                          ('Last active', 'Oct 10, 2026 7:48 AM')])
               + '<div class="mt-3">' + f_note('Revoking ends this device only — the other five sessions stay signed in.') + '</div>',
               '',
               [f_btn('Cancel', BTN), f_btn('Confirm', DANGER)])

d_up_deact = dlg('us-deactivate', '108', 'Deactivate user',
                 'This soft-deletes the account (sets deletedAt). The user can be restored later.',
                 f_area('Internal note', ph='Why is this account being deactivated?', rows=2, fid='ud-note')
                 + '<div class="mt-3">' + f_note('Sessions are revoked, quotes and invoices stay readable, and the client stops receiving notifications.', 'warn') + '</div>',
                 '',
                 [f_btn('Cancel', BTN), f_btn('Deactivate', DANGER)])

rows_sessions = [
    ['Chrome on Linux <span class="badge tone-success"><span class="dot"></span>This device</span>',
     '136.86.144.132', 'Oct 10, 2026 7:48 AM', '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
    ['Chrome on Linux', '34.83.1.1', 'Oct 9, 2026 11:09 AM',
     '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
    ['Web browser', '34.168.44.144', 'Oct 7, 2026 12:44 AM',
     '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
    ['Web browser', '136.86.144.132', 'Oct 7, 2026 12:13 AM',
     '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
    ['Chrome on Android', '34.168.44.144', 'Oct 6, 2026 9:02 PM',
     '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
    ['Chrome on iOS', '34.83.1.1', 'Oct 5, 2026 3:46 AM',
     '<button class="' + BTN_XS + '" type="button">Revoke</button>'],
]

d_up_sess = dlg('us-sessions', '111', 'Active sessions (6 devices)',
                'End all sessions signs the user out everywhere.',
                f_tbl(['Device', 'IP', 'Last active', 'Action'], rows_sessions, mono_cols=(1, 2))
                + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                + f_btn('End all sessions', 'btn btn-danger btn-sm')
                + f_btn('Force password reset', BTN) + '</div>',
                '6 devices · 1 current',
                [f_btn('Close', BTN)])

rows_activity = [
    ['LOGIN', 'User signed in successfully', 'Oct 10, 2026 7:48 AM'],
    ['LOGIN', 'User signed in successfully', 'Oct 9, 2026 11:09 AM'],
    ['LOGOUT', 'User signed out', 'Oct 7, 2026 12:44 AM'],
    ['LOGIN', 'User signed in successfully', 'Oct 7, 2026 12:13 AM'],
]

d_up_act = dlg('us-activity', '111', 'Activity log (602 events)',
               'Page 1 of 61 — authentication and account events only.',
               f_tbl(['Event', 'Detail', 'When'], rows_activity, mono_cols=(2,))
               + '<div class="mt-3">' + f_kv_mini([
                   ('Requests', '26'), ('Projects', '5'),
                   ('Total paid', '₹81,500.00'), ('Lifetime paid', '₹81,500.00'),
                   ('Registered', 'Oct 5, 2026'), ('Last active', '—'),
                   ('Operator notes', 'none on file')]) + '</div>',
               'Role USER · status ACTIVE')

users_deck = deck([d_up_edit, d_up_imp, d_up_pwd, d_up_rev, d_up_deact, d_up_sess, d_up_act])

add('apps/admin/users/01a10a2a-a99a-7578-825a-c7de8bce4d2b', 'PROTO-STATES-USER',
    'user detail states',
    section('states-user', 'Account dialogs',
            'Every captured operator dialog for this client account — real field values and the same disabled logic as the app.',
            eyebrow='Operator states · 5 screens',
            chips=['108 deactivate', '109 edit profile', '110 impersonate', '112 revoke session', '113 set password'],
            body=users_deck))


# ------------------------------------------------------------ quotes · states
rows_docs = [
    ['Service agreement', 'NL-CTR-2026-000005', 'v1 latest',
     '<span class="badge tone-success"><span class="dot"></span>Signed</span>', 'Oct 5, 2026 3:49:42 AM'],
    ['Quote', 'NL-QTE-2026-000006', 'v1 latest',
     '<span class="badge tone-info"><span class="dot"></span>Sent to client</span>', 'Oct 5, 2026 3:49:36 AM'],
]

d_qt_docs = dlg('qt-docs', '055', 'Documents',
                'Generated and signed artefacts for this quote version',
                f_tbl(['Document', 'Number', 'Version', 'Status', 'Sent'], rows_docs, mono_cols=(1,))
                + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                + f_btn('Download quote PDF', BTN)
                + f_btn('Download signed service agreement', BTN)
                + f_btn('Generate &amp; download latest quote PDF', BTN) + '</div>',
                'Accepted by client 10/5/2026 3:49:42 AM')

d_qt_hist = dlg('qt-history', '055', 'History',
                'Read-only for an accepted quote — create a revision to change anything',
                f_tl([('Viewed', 'Oct 10, 2026 7:56 AM'),
                      ('Accepted', 'Oct 5, 2026 3:47 AM'),
                      ('Sent', 'Oct 5, 2026 3:47 AM'),
                      ('Revision created', 'Oct 5, 2026 3:47 AM'),
                      ('Changes requested', 'Oct 5, 2026 3:47 AM'),
                      ('Created', 'Oct 5, 2026 3:47 AM', None, True)]))

d_qt_over = dlg('qt-overview', '055', 'Overview',
                'Corporate LMS for 200 Employees · ACCEPTED',
                f_kv_mini([('Total', '₹52,200.00'), ('Subtotal', '₹52,200.00'),
                           ('Tax 0%', '₹0.00'), ('Valid until', 'Oct 5, 2027'),
                           ('Created', 'Oct 5, 2026 3:47 AM'), ('Status', 'ACCEPTED — read-only')])
                + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                + f_btn('Resend to client', BTN) + f_btn('Duplicate quote', BTN)
                + f_btn('View source request', BTN) + f_btn('Revise (v2)', PRIMARY) + '</div>')

add('apps/admin/quotes/01a10f80-e01a-4d90-bd1c-86a026ad71f9', 'PROTO-STATES-QUOTE',
    'quote documents',
    section('states-quote', 'Quote documents &amp; history',
            'Accepted quotes are read-only: documents, audit trail and the revision path sit together.',
            eyebrow='Operator states · 1 screen', chips=['055 quotes details'],
            body=deck([d_qt_over, d_qt_docs, d_qt_hist])))


# ---------------------------------------------------------- requests · states
req_brief_body = ''
req_brief_body += f_text('Title', 'B2B Wholesale Ordering Portal', fid='rq-title', req=True)
req_brief_body += '<div class="mt-3">' + f_area(
    'Description',
    'Gujarat distributor network, bulk SKU ordering, GST invoicing, credit-limit checks, Razorpay advance payment links, replaces WhatsApp order sheets for 40+ dealers in Ahmedabad and Surat.',
    rows=3, fid='rq-desc') + '</div>'
req_brief_body += '<div class="mt-3">' + f_row(
    f_select('Category', ['Custom', 'Web Development', 'Mobile App', 'E-Commerce', 'UI/UX Design'], 1),
    f_select('Timeline', ['Fixed dates', 'Flexible', 'ASAP'], 0)) + '</div>'
req_brief_body += '<div class="mt-3">' + f_row(
    f_text('Budget min (₹)', '40,00,000.00', fid='rq-bmin', mono=True),
    f_text('Budget max (₹)', '80,00,000.00', fid='rq-bmax', mono=True)) + '</div>'
req_brief_body += '<div class="mt-3">' + f_row(
    f_text('Preferred start', 'Jun 1, 2026', fid='rq-start', mono=True),
    f_text('Deadline', 'Aug 1, 2026', fid='rq-dl', mono=True)) + '</div>'
req_brief_body += '<div class="mt-3">' + f_kv_mini([
    ('Contact', 'Arjun Mehta · arjun.mehta@nestlancer.com'),
    ('Quote (read-only)', 'Accepted ₹59,000.00')]) + '</div>'
req_brief_body += '<div class="mt-3"><div class="sec-eyebrow">Requirements</div><ul class="prose-list">'
req_brief_body += ''.join('<li>' + r + '</li>' for r in [
    'Dealer login with credit-limit visibility',
    'Bulk cart with MOQ rules',
    'GST invoice PDF generation',
    'Razorpay payment links for advance orders',
    'Admin dashboard for order fulfilment'])
req_brief_body += '</ul></div>'

d_rq_edit = dlg('rq-edit', '102', 'Edit request',
                'Converted requests stay editable — the quote keeps its own snapshot',
                req_brief_body,
                'Last updated Oct 5, 2026 3:47 AM',
                [f_btn('Cancel edit', BTN), f_btn('Save changes', PRIMARY)])

d_rq_notes = dlg('rq-notes', '057', 'Internal notes',
                 'Only operators see these — the client never does',
                 f_area('Add a note', ph='What should the next operator know?', rows=3, fid='rq-note')
                 + '<div class="mt-3">' + f_btn('Add note', PRIMARY) + '</div>'
                 + '<div class="mt-4">' + f_tl([
                     ('Okta SAML metadata received — SP config confirmed with client IT',
                      'Oct 5, 2026 3:47 AM · Riya Kapoor'),
                     ('LMS requirements reviewed; quiz thresholds still open with the client',
                      'Oct 5, 2026 3:47 AM · Riya Kapoor', None, True)]) + '</div>')

d_rq_hist = dlg('rq-history', '057', 'Request history',
                'Every status the request passed through',
                f_tl([('Converted To Project', 'Oct 5, 2026 3:47 AM'),
                      ('Quoted ×4 <span class="badge tone-neutral mono">CHANGES_REQUESTED · UNDER_REVIEW</span>',
                       'Oct 5, 2026 3:47 AM'),
                      ('Under Review', 'LMS requirements reviewed; Okta SAML metadata received'),
                      ('Submitted', 'Oct 5, 2026 3:47 AM'),
                      ('Draft', 'Oct 5, 2026 3:47 AM', None, True)]))

qb_body = f_chips(['1 Scope', '2 Pricing', '3 Terms', 'Apply phase template',
                   'Line-item library', 'Add phase'], 0)
qb_body += '<div class="mt-3">' + f_kv_mini([
    ('Client', 'rahul.desai@nestlancer.com'), ('Category', 'Web Development'),
    ('Client budget', '₹30,00,000.00 – ₹60,00,000.00'), ('Deadline', 'Sep 15, 2026'),
    ('Quote total', '₹0.00 · 0 priced lines, 1 phase'), ('Valid until', '10/24/2026'),
    ('Currency / tax', 'INR · 0%')]) + '</div>'
qb_body += '<div class="mt-3"><div class="sec-eyebrow">Brief</div>'
qb_body += '<p class="text-sm muted">Customer-facing and internal shipment dashboard with WebSocket live updates from PostgreSQL dispatch warehouse, RBAC, Delhivery + Blue Dart AWB integration, CSV export.</p></div>'
qb_body += '<div class="mt-3"><div class="sec-eyebrow">Requirements</div><ul class="prose-list">'
qb_body += ''.join('<li>' + r + '</li>' for r in [
    'WebSocket live status updates',
    'Delhivery + Blue Dart AWB lookup',
    'Client portal with shipment history',
    'Daily MIS CSV export',
    'RBAC for ops vs client users'])
qb_body += '</ul></div>'
qb_body += '<div class="mt-3">' + f_row(
    f_select('Payment schedule', ['50/50 (selected)', '30/70', '30/40/30',
                                  '25% × 4 milestones', '100% upfront', 'Custom %'], 0),
    f_text('Valid until', '10/24/2026', fid='qb-valid', mono=True)) + '</div>'
qb_body += f_tbl(['Phase / line', 'Qty', 'Unit', 'Amount'], [
    ['Phase 1 — Deliverables', '1', '₹500', '₹0.00'],
    ['<span class="dim">— blank deliverable row</span>', '1', '₹500', '₹0.00']], mono_cols=(1, 2, 3))
qb_body += '<div class="mt-4">' + f_note(
    'Standard Nestlancer terms (always included) — 10 clauses snapshotted onto the quote: '
    '1 Validity · 2 Acceptance · 3 Payment · 4 Scope · 5 Revisions · 6 Client responsibilities · '
    '7 Intellectual property · 8 Confidentiality · 9 Limitation of liability · 10 Governing law (India).') + '</div>'
qb_body += '<div class="mt-3">' + f_area(
    'Project-specific terms',
    ph='Client provides brand assets within 5 business days of kickoff. Two revision rounds per milestone.',
    rows=2, fid='qb-terms') + '</div>'
qb_body += '<div class="mt-3">' + f_check('Require signed service agreement', True) + '</div>'
qb_body += '<div class="mt-3">' + f_kv_mini([
    ('Deposit 50%', '₹0.00 · on accept'),
    ('Final payment 50%', '₹0.00 · on prior approved')]) + '</div>'

d_qb = dlg('rq-quote-builder', '058 · 095 · 096', 'Quote builder',
           'Live Shipment Tracking Dashboard · step 1 Scope, step 2 Pricing, step 3 Terms',
           qb_body,
           'Presets: 50/50 · 30/70 · 30/40/30 · 25% × 4 · 100% upfront',
           [f_btn('Back', BTN), f_btn('Next', BTN), f_btn('Create quote', PRIMARY)])

add('apps/admin/requests/01a10a2c-1a04-75bb-8e80-fc143257fa02', 'PROTO-STATES-REQUEST',
    'request edit + notes',
    section('states-request', 'Request editing &amp; internal notes',
            'Edit mode, the internal note log, and the status history captured on this request.',
            eyebrow='Operator states · 2 screens',
            chips=['057 requests details', '102 request details edit form'],
            body=deck([d_rq_edit, d_rq_notes, d_rq_hist])))

add('apps/admin/requests/01a10a2c-01c3-7079-93e9-9d001541ced8/quote/new', 'PROTO-STATES-QB',
    'quote builder',
    section('states-quote-builder', 'Quote builder steps',
            'Scope, pricing and terms as captured for the Live Shipment Tracking Dashboard brief — '
            'with the standard clause set snapshotted onto the quote.',
            eyebrow='Operator states · 3 screens',
            chips=['058 scope', '095 pricing', '096 terms'],
            body=deck([d_qb])))


# ----------------------------------------------------- notifications · states
d_nt_send = dlg('nt-send', '034', 'Send notification',
                'Queue a notification to one user — delivery is recorded in the platform log',
                f_row(f_select('Channel', ['In-app', 'Email', 'Push'], 0),
                      f_text('Recipient', 'arjun.mehta@nestlancer.com', fid='nt-to', mono=True))
                + '<div class="mt-3">' + f_text('Title', 'Action required on your quote', fid='nt-title', req=True) + '</div>'
                + '<div class="mt-3">' + f_area(
                    'Message',
                    'Your quote AUDIT-P23-SUPP-20261005-6grw is ready to review. Open the Work Hub to accept or request changes.',
                    rows=3, fid='nt-msg') + '</div>'
                + '<div class="mt-3">' + f_check('Send a copy by email', True) + '</div>',
                'Delivery rate 74.1% · read rate 3.1%',
                [f_btn('Cancel', BTN), f_btn('Send notification', PRIMARY)])

d_nt_bc = dlg('nt-broadcast', '030', 'Broadcast to all users',
              'Queue an in-app notification for every active user. Use sparingly for platform-wide announcements.',
              f_text('Title', 'Scheduled maintenance tonight', fid='nt-b-title', req=True)
              + '<div class="mt-3">' + f_area(
                  'Message',
                  'Short message shown in every user inbox — the platform is read-only between 11:30 PM and 12:15 AM IST.',
                  rows=3, fid='nt-b-msg') + '</div>'
              + '<div class="mt-3">' + f_note('962 sent · 30 read · 306 failed across the last broadcast.') + '</div>',
              'Reaches every active account',
              [f_btn('Cancel', BTN), f_btn('Broadcast to all users', PRIMARY)])

d_nt_seg = dlg('nt-segment', '033', 'Segment broadcast',
               'Target a specific cohort of users',
               f_select('Segment', ['All users', 'Active clients', 'Users with pending quotes',
                                    'Users with overdue payments', 'Administrators'], 2)
               + '<div class="mt-3">' + f_text('Title', 'Action required on your quote', fid='nt-s-title', req=True) + '</div>'
               + '<div class="mt-3">' + f_area('Message',
                                               'Explain what changed and what the user should do next.',
                                               rows=3, fid='nt-s-msg') + '</div>'
               + '<div class="mt-3">' + f_kv_mini([('Matched users', '142'),
                                                   ('Channels', 'In-app + email')]) + '</div>',
               'Segment preview recalculates on change',
               [f_btn('Cancel', BTN), f_btn('Send to segment', PRIMARY)])

rep_body = f_kpis([('Sent', '962', 'in-app queue'), ('Read', '30', '3.1% read rate'),
                   ('Failed', '306', 'retry scheduled', 'down'),
                   ('Delivery rate', '74.1%', 'last 30 days', 'up')])
rep_body += '<div class="mt-3">' + f_tbl(['Channel', 'Sent', 'Read', 'Failed'], [
    ['In-app', '962', '30', '306'],
    ['Email', '268', '12', '41'],
    ['Push', '68', '1', '33']], mono_cols=(1, 2, 3)) + '</div>'

d_nt_rep = dlg('nt-report', '031', 'Delivery report',
               '1298 platform notifications · delivery 74.1% · read 3.1%',
               rep_body, 'Page 1 of 29 (576 items)')

log_rows = [
    ['Oct 10, 2026 7:26 AM', 'in-app', 'arjun.mehta@nestlancer.com',
     '<span class="badge tone-success"><span class="dot"></span>delivered</span>'],
    ['Oct 10, 2026 7:24 AM', 'push', 'karthik.menon@nestlancer.com',
     '<span class="badge tone-danger"><span class="dot"></span>failed · no token</span>'],
    ['Oct 10, 2026 7:19 AM', 'email', 'priya.nair@nestlancer.com',
     '<span class="badge tone-success"><span class="dot"></span>delivered</span>'],
    ['Oct 10, 2026 7:11 AM', 'in-app', 'samira.patel@nestlancer.com',
     '<span class="badge tone-success"><span class="dot"></span>delivered</span>'],
]

d_nt_log = dlg('nt-log', '032', 'Platform log',
               'Every delivery attempt with its provider response',
               f_tbl(['When', 'Channel', 'Recipient', 'Result'], log_rows, mono_cols=(0,)))

add('apps/admin/notifications', 'PROTO-STATES-NOTIFICATIONS', 'notification states',
    section('states-notifications', 'Notification states',
            'Send, broadcast, segment, delivery report and the platform delivery log — the five operator states behind the notifications centre.',
            eyebrow='Operator states · 6 screens',
            chips=['029 my notifications', '030 broadcast', '031 delivery report',
                   '032 platform log', '033 segment', '034 send'],
            body=deck([d_nt_send, d_nt_bc, d_nt_seg, d_nt_rep, d_nt_log])))


# ------------------------------------------------------------ media · states
md_asset = f_kv_mini([
    ('Status', '<span class="badge tone-success"><span class="dot"></span>READY</span>'),
    ('Visibility', '<span class="badge tone-neutral">PRIVATE</span>'),
    ('Size', '353 B'), ('Type', 'application/zip'),
    ('Uploaded', 'Oct 5, 2026 · Sandeep Chopra'),
    ('Source', 'Message attachments')])

d_md_asset = dlg('md-asset', '073', 'Asset details',
                 'sandeep-chopra-gps-fleet-gps-fleet-staging-review.zip',
                 md_asset
                 + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                 + f_btn('Share link', BTN) + f_btn('Edit metadata', BTN)
                 + f_btn('Download', BTN) + f_btn('Quarantine', 'btn btn-danger btn-sm') + '</div>')

d_md_share = dlg('md-share', '075', 'Create share link',
                 'Anyone with the link can download this file',
                 f_row(f_select('Expires', ['24 hours', '7 days', '30 days', 'Never'], 1),
                       f_select('Access', ['Anyone with the link', 'Signed-in clients only',
                                           'Operators only'], 0))
                 + '<div class="mt-3">' + f_text('Link', 'https://app.nestlancer.com/share/8f2a-91c4-77de',
                                                 fid='md-link', mono=True) + '</div>'
                 + '<div class="mt-3">' + f_check('Revoke previous links for this file', True) + '</div>',
                 'Link creation is written to the audit trail',
                 [f_btn('Cancel', BTN), f_btn('Create link', PRIMARY)])

d_md_meta = dlg('md-metadata', '076', 'Edit asset metadata',
                'Alt text and tags feed search and the public site',
                f_text('Title', 'GPS fleet staging review', fid='md-title')
                + '<div class="mt-3">' + f_area(
                    'Alt text / description',
                    'Staging review bundle for the GPS Fleet Tracking Portal dashboards.',
                    rows=2, fid='md-alt') + '</div>'
                + '<div class="mt-3">' + f_row(
                    f_text('Tags (comma separated)', 'gps, fleet, staging', fid='md-tags'),
                    f_select('Folder', ['Unfiled', 'Projects', 'Deliveries', 'Blog', 'Site assets'], 1)) + '</div>',
                'Updating metadata does not change the file',
                [f_btn('Cancel', BTN), f_btn('Save changes', PRIMARY)])

d_md_quar = dlg('md-quarantine', '021', 'Quarantine',
                'Files quarantined here are blocked from delivery until reviewed',
                f_note('No quarantined media.', 'ok')
                + '<div class="mt-3">' + f_tbl(['Reason', 'Files', 'Review'], [
                    ['Malware scan failure', '0', '—'],
                    ['Owner request', '0', '—'],
                    ['Trust &amp; safety action', '0', '—']], mono_cols=(1,)) + '</div>')

md_an = f_kpis([('Total files', '146', 'public 118 · private 28'),
                ('Storage', '19.3 MB', 'of 5 GB'),
                ('Quarantined', '0', 'all clear', 'up'),
                ('Processing', '0', 'queue empty')])
md_an += '<div class="mt-3">' + f_tbl(['Type', 'Files', 'Size'], [
    ['image/jpeg', '118', '19 MB'],
    ['application/pdf', '15', '304.5 KB'],
    ['application/zip', '12', '4.2 KB'],
    ['text/markdown', '1', '431 B']], mono_cols=(1, 2)) + '</div>'
md_an += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
md_an += f_btn('Preview cleanup', BTN) + f_btn('Run cleanup', PRIMARY) + '</div>'

d_md_an = dlg('md-analytics', '019', 'Library analytics',
              'Total files 146 · storage 19.3 MB · quarantined 0 · processing 0',
              md_an, 'Buckets: all storage · public library · private')

md_folders = f_tbl(['Folder', 'Files', 'Size', 'Visibility'], [
    ['Blog', '42', '6.1 MB', '<span class="badge tone-neutral">PUBLIC</span>'],
    ['Portfolio', '38', '9.2 MB', '<span class="badge tone-neutral">PUBLIC</span>'],
    ['Site assets', '38', '3.7 MB', '<span class="badge tone-neutral">PUBLIC</span>'],
    ['Message attachments', '28', '309.1 KB',
     '<span class="badge tone-brand">PRIVATE</span>']], mono_cols=(1, 2))
md_folders += '<div class="mt-3">' + f_chips(['All types', 'Image', 'Document', 'Video', 'Archive'])
md_folders += '<div class="mt-2">' + f_chips(['All sources', 'Message attachments', 'Projects',
                                              'Deliveries', 'Uploads only', 'Folders'], 5) + '</div>'
md_folders += '<div class="mt-3">' + f_note('The folder list loads on demand — the capture shows the loading state.') + '</div>'

d_md_folders = dlg('md-folders', '020', 'Folders',
                   'Private 28 files · 309.1 KB · public 118 files · 19 MB',
                   md_folders)

add('apps/admin/media', 'PROTO-STATES-MEDIA', 'media states',
    section('states-media', 'Library states',
            'Asset detail, share link, metadata, quarantine, analytics and folders — the operator surfaces captured in the media library.',
            eyebrow='Operator states · 8 screens',
            chips=['018 media', '019 analytics', '020 folders', '021 quarantine',
                   '073 asset', '074 browse', '075 share link', '076 metadata', '077 list view'],
            body=deck([d_md_asset, d_md_share, d_md_meta, d_md_quar, d_md_an, d_md_folders])))


# ----------------------------------------------------------- messages · states
d_ms_reply = dlg('ms-reply', '080', 'Reply composer',
                 'Direct conversation with Arjun Mehta · Karthik Menon',
                 f_area('Message', ph='Write a message…', rows=3, fid='ms-reply')
                 + '<div class="mt-3 flex items-center gap-2 flex-wrap">'
                 + f_btn('Attach file', BTN) + f_btn('Insert template', BTN)
                 + f_btn('Send', PRIMARY) + '</div>'
                 + '<div class="mt-3">' + f_chips(['Direct', 'Group', 'Internal note'], 0) + '</div>',
                 'Message is sent to 2 participants')

d_ms_edit = dlg('ms-edit', '078', 'Edit message',
                'Edits are visible to everyone in the thread',
                f_area('Message',
                       'Reconciliation checklist posted to the shared workspace — replay UI is next.',
                       rows=3, fid='ms-edit')
                + '<div class="mt-3">' + f_note('Edited messages keep an “edited” marker; the original text stays in the audit log.') + '</div>',
                'Last edited Oct 5, 2026 3:52 AM',
                [f_btn('Cancel', BTN), f_btn('Save changes', PRIMARY)])

ms_members = f_tbl(['Participant', 'Role', 'Actions'], [
    ['<b>Riya Kapoor</b><div class="text-xs dim">admin@nestlancer.com</div>',
     '<span class="badge tone-brand mono">ADMIN</span>', '<span class="text-xs dim">owner</span>'],
    ['<b>Arjun Mehta</b><div class="text-xs dim">arjun.mehta@nestlancer.com</div>',
     '<span class="badge tone-neutral mono">CLIENT</span>',
     '<button class="' + BTN_XS + '" type="button">Remove</button>'],
    ['<b>Karthik Menon</b><div class="text-xs dim">karthik.menon@nestlancer.com</div>',
     '<span class="badge tone-neutral mono">CLIENT</span>',
     '<button class="' + BTN_XS + '" type="button">Remove</button>']])
ms_members += '<div class="mt-3">' + f_text('Add participant', ph='Search by name or email…', fid='ms-add') + '</div>'

d_ms_members = dlg('ms-members', '079', 'Group members',
                   '3 participants · 1 operator, 2 clients', ms_members)

add('apps/admin/messages/thread/01a10a2e-42f8-70c9-95f7-0d05d4fd738a', 'PROTO-STATES-MSG',
    'thread states',
    section('states-messages', 'Thread states',
            'Reply composer, message editing and group membership for this conversation.',
            eyebrow='Operator states · 3 screens',
            chips=['078 edit message', '079 group members', '080 reply composer'],
            body=deck([d_ms_reply, d_ms_edit, d_ms_members])))


# -------------------------------------------------------- pipeline hub · tabs
pl_pay = f_tbl(['Payment', 'Reference', 'Status', 'Amount'], [
    ['01a10f88-c103-710c-8c8d', 'c28fec9226a8',
     '<span class="badge tone-warning"><span class="dot"></span>pending</span>', '₹30,000.00'],
    ['01a10f88-c103-710c-8c8d', 'be1873c17d44',
     '<span class="badge tone-neutral"><span class="dot"></span>created</span>', '₹15,660.00'],
    ['01a10cbc-edbf-764c-bc51', 'b5debebadc56',
     '<span class="badge tone-warning"><span class="dot"></span>pending</span>', '₹48,000.00'],
    ['01a10cbc-edbf-764c-bc51', 'b35825aea61d',
     '<span class="badge tone-neutral"><span class="dot"></span>created</span>', '₹20,880.00'],
    ['01a10aac-d034-723e-8841', 'eb0ec84d268d',
     '<span class="badge tone-neutral"><span class="dot"></span>created</span>', '₹19,200.00'],
    ['01a10aac-d034-723e-8841', 'ee3e98977730',
     '<span class="badge tone-warning"><span class="dot"></span>pending</span>', '₹52,200.00'],
    ['01a10a2b-663e-7019-87c4', 'f4403da353e0',
     '<span class="badge tone-success"><span class="dot"></span>completed</span>', '₹59,000.00'],
    ['01a10a2b-663e-7019-87c4', 'fa82caf14f0b',
     '<span class="badge tone-success"><span class="dot"></span>completed</span>', '₹22,500.00'],
    ['01a10a2b-5ed2-73bc-8aee', 'd4cdcbb6e6d6',
     '<span class="badge tone-warning"><span class="dot"></span>pending</span>', '₹36,000.00'],
    ['01a10a2b-5ed2-73bc-8aee', 'cf61167d4900',
     '<span class="badge tone-success"><span class="dot"></span>completed</span>', '₹81,500.00']],
    mono_cols=(1, 3))

d_pl_pay = dlg('pl-payments', '115', 'Payments', '5 pending · 3 created · 3 completed', pl_pay)

d_pl_quotes = dlg('pl-quotes', '117', 'Quotes', '10 draft · 7 viewed · 5 accepted · 22 total',
                  f_tbl(['Quote', 'Status', 'Amount'], [
                      ['AUDIT-P23-SUPP-20261005-6grw Request',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,250.00'],
                      ['AUDIT-P25-20261005-73dhk Project Fixture',
                       '<span class="badge tone-success"><span class="dot"></span>Accepted</span>', '₹2,832.00'],
                      ['Copy of AUDIT-P24-20261005-6y6fa-sent Request',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,770.00'],
                      ['AUDIT-P24-20261005-6y6fa-draft Request',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,770.00'],
                      ['Copy of AUDIT-P24-20261005-6v89t-sent',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,250.00'],
                      ['AUDIT-P24-20261005-6y6fa-sent Request',
                       '<span class="badge tone-info"><span class="dot"></span>Viewed</span>', '₹2,832.00'],
                      ['AUDIT-P24-20261005-6v89t-draft',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,250.00'],
                      ['AUDIT-P24-20261005-6v89t-sent',
                       '<span class="badge tone-info"><span class="dot"></span>Viewed</span>', '₹2,832.00'],
                      ['AUDIT-P23-20261005-6rdsf Request to Quote Builder',
                       '<span class="badge tone-info"><span class="dot"></span>Viewed</span>', '₹1,770.00'],
                      ['AUDIT-P23-SUPP-20261005-bwrn Request',
                       '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>', '₹1,250.00']],
                      mono_cols=(2,)))

d_pl_projects = dlg('pl-projects', '116', 'Projects',
                    '3 pending payment · 1 in progress · 1 completed',
                    f_tbl(['Project', 'Status', 'Progress'], [
                        ['AUDIT-P25-20261005-73dhk Project Fixture',
                         '<span class="badge tone-warning"><span class="dot"></span>Pending Payment</span>', '0%'],
                        ['AUDIT-P25-20261005-f611o Project Fixture',
                         '<span class="badge tone-warning"><span class="dot"></span>Pending Payment</span>', '0%'],
                        ['AUDIT-P25-20261005-uk6ic Project Fixture',
                         '<span class="badge tone-warning"><span class="dot"></span>Pending Payment</span>', '0%'],
                        ['B2B Wholesale Ordering Portal',
                         '<span class="badge tone-success"><span class="dot"></span>Completed</span>', '100%'],
                        ['Khandesh Spice D2C E-Commerce Store',
                         '<span class="badge tone-info"><span class="dot"></span>In Progress</span>', '57%']],
                        mono_cols=(2,)))

d_pl_requests = dlg('pl-requests', '118', 'Requests',
                    '10 submitted · 7 quoted · 5 converted · 4 draft · 26 total',
                    f_tbl(['Request', 'Status'], [
                        ['AUDIT-P23-LINE-20261005-7r0l',
                         '<span class="badge tone-info"><span class="dot"></span>Submitted</span>'],
                        ['AUDIT-P23-SUPP-20261005-6grw',
                         '<span class="badge tone-info"><span class="dot"></span>Submitted</span>'],
                        ['AUDIT-P25-20261005-73dhk Project Fixture',
                         '<span class="badge tone-success"><span class="dot"></span>Converted To Project</span>'],
                        ['Copy of AUDIT-P24-20261005-6y6fa-sent',
                         '<span class="badge tone-neutral"><span class="dot"></span>Draft</span>'],
                        ['AUDIT-P24-20261005-6y6fa-draft',
                         '<span class="badge tone-info"><span class="dot"></span>Submitted</span>'],
                        ['AUDIT-P24-20261005-6y6fa-sent',
                         '<span class="badge tone-warning"><span class="dot"></span>Quoted</span>'],
                        ['AUDIT-P24-20261005-6v89t-sent',
                         '<span class="badge tone-warning"><span class="dot"></span>Quoted</span>'],
                        ['AUDIT-P23-20261005-6rdsf Request to Quote Builder',
                         '<span class="badge tone-warning"><span class="dot"></span>Quoted</span>']]))

pl_trust = f_tbl(['Session ID', 'State', 'Last activity'], [
    ['01a125ac-f30a', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 10, 2026'],
    ['01a125a7-698e', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 10, 2026'],
    ['01a12573-fe46', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 9, 2026'],
    ['01a12558-ed84', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 8, 2026'],
    ['01a124e2-5ed7', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 6, 2026'],
    ['01a124c5-8cae', '<span class="badge tone-success"><span class="dot"></span>Active session</span>',
     'LOGIN · Oct 5, 2026']], mono_cols=(0,))
pl_trust += '<div class="mt-3">' + f_kv_mini([
    ('Open requests', '10 (submitted + in review)'), ('Quotes', '22'),
    ('Active projects', '4'), ('Pending payments', '8'),
    ('Cross alerts', '2'), ('Sessions', '6')]) + '</div>'
pl_trust += '<div class="mt-3">' + f_note(
    'Flags: <b>Active project with pending payments</b> · <b>Submitted requests not yet under review</b>',
    'warn') + '</div>'

d_pl_trust = dlg('pl-trust', '119', 'Trust &amp; account',
                 '6 sessions · all active · 2 cross alerts', pl_trust)

pl_funnel = f_tbl(['Stage', 'Count', 'Note'], [
    ['Inquiries', '—', 'no inbound inquiries'],
    ['Requests', '26', '10 submitted, 7 quoted, 5 converted, 4 draft'],
    ['Quotes', '22', '10 draft, 7 viewed, 5 accepted'],
    ['Projects', '4', '3 pending payment, 1 completed'],
    ['Payments', '11', '5 pending, 3 created, 3 completed'],
    ['Messages', '0', 'no records for this user']], mono_cols=(1,))
pl_funnel += '<div class="mt-3 flex items-center gap-2 flex-wrap">'
pl_funnel += f_btn('Open payments console', BTN) + f_btn('Assign operator', PRIMARY) + '</div>'

d_pl_funnel = dlg('pl-funnel', '114', 'Client delivery funnel',
                  'Arjun Mehta · ID 01a10a2a-a99a-7578-825a-c7de8bce4d2b',
                  pl_funnel)

add('apps/admin/pipeline/users/01a10a2a-a99a-7578-825a-c7de8bce4d2b', 'PROTO-STATES-PIPELINE',
    'pipeline hub tabs',
    section('states-pipeline', 'Client pipeline tabs',
            'Payments, quotes, projects and requests for this client, plus the trust &amp; account view — the six tabs captured in the pipeline hub.',
            eyebrow='Operator states · 6 screens',
            chips=['114 messages', '115 payments', '116 projects', '117 quotes',
                   '118 requests', '119 trust &amp; account'],
            body=deck([d_pl_funnel, d_pl_pay, d_pl_quotes, d_pl_projects, d_pl_requests, d_pl_trust])))


print('batch A — built ' + str(len(built)) + ' state blocks')
for r, t in built:
    print('  ▸ ' + r + '  (' + t + ')')
