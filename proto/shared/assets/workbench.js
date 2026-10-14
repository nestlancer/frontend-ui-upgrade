/* Client + operator workbench interactions (upgrade v2).
 * Local prototype only: no fetch, no storage, no credentials, no data mutation.
 * Every control receives an explicit role in the HTML (data-wb-*); JS-only
 * controls ship disabled and are enabled here, so no-JS users never meet a
 * button that silently does nothing. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const status = $('#wb-status');
  let statusTimer;
  function announce(message) {
    if (!status) return;
    clearTimeout(statusTimer);
    status.textContent = '';
    // A frame between clear and set makes repeated messages re-announce.
    requestAnimationFrame(() => {
      status.textContent = message;
      status.classList.add('is-visible');
      statusTimer = setTimeout(() => status.classList.remove('is-visible'), 5200);
    });
  }
  const clean = text => (text || '').replace(/\s+/g, ' ').trim();
  function contextOf(el) {
    const row = el.closest('tr, .panel-row, [data-wb-item], li, .conv');
    if (row) {
      const first = row.matches('tr') ? row.querySelector('td') : row.querySelector('b, strong, .font-semibold, .font-bold, h3') || row;
      const text = clean(first && first.textContent);
      if (text && text.length < 120) return text;
    }
    const panel = el.closest('.panel, .dialog-surface, section, form');
    const title = panel && panel.querySelector('.panel-title, h2, h3');
    if (title) return clean(title.textContent);
    const h1 = $('main h1');
    return h1 ? clean(h1.textContent) : '';
  }
  function fieldsNear(el) {
    const host = el.closest('form, .dialog-surface, .panel, .card, section') || $('main');
    return $$('input:not([type=hidden]):not([type=search]):not([disabled]), select:not([disabled]), textarea:not([disabled])', host)
      .filter(f => !f.closest('.filterbar, [data-wb-filters]'));
  }

  /* ------------------------------------------------------ action dialog */
  const dialog = $('#wb-action');
  let opener = null, pending = null;
  if (dialog && typeof dialog.showModal === 'function') {
    const title = $('#wb-action-title', dialog), desc = $('#wb-action-desc', dialog);
    const ctx = $('[data-wb-context]', dialog), result = $('[data-wb-outcome]', dialog);
    const confirm = $('[data-wb-confirm]', dialog), keep = $('[data-wb-keep]', dialog);
    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); dialog.close(); return; }
      if (e.key !== 'Tab') return;
      const items = $$('button:not([disabled])', dialog).filter(b => b.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus({ preventScroll: true }); dialog.classList.remove('is-danger'); });
    keep.addEventListener('click', () => dialog.close());
    confirm.addEventListener('click', () => {
      if (!pending) { dialog.close(); return; }
      result.textContent = pending.danger
        ? `Preview complete — “${pending.label}” was not executed. ${pending.context ? pending.context + ' is' : 'The record is'} unchanged.`
        : `Preview complete — “${pending.label}” is not connected in this prototype. Nothing was sent, saved or changed.`;
      pending = null;
      confirm.textContent = 'Done';
      keep.hidden = true;
      result.focus();
    });
    window.__wbOpen = (button, label, danger) => {
      opener = button;
      const context = contextOf(button);
      pending = { label, danger, context };
      title.textContent = label;
      desc.textContent = danger
        ? 'In the live console this changes or removes data. This prototype has no backend, so you can only preview the outcome.'
        : 'This action needs the live service. In this prototype you can preview the outcome; nothing is sent or saved.';
      ctx.textContent = context ? `Applies to: ${context}` : '';
      ctx.hidden = !context;
      result.textContent = '';
      confirm.textContent = danger ? 'Preview outcome' : 'Preview';
      keep.hidden = false;
      keep.textContent = danger ? 'Keep as is' : 'Close';
      dialog.classList.toggle('is-danger', !!danger);
      dialog.showModal();
      keep.focus();
    };
  }

  /* ----------------------------------------------------------- actions */
  function copyText(text, button) {
    const done = () => announce('Copied to the clipboard.');
    const fail = () => {
      announce('Clipboard unavailable — the value is selected so you can copy it manually.');
      const target = button.closest('.panel-row, .field, tr, .kv, div');
      const code = target && target.querySelector('code, .mono, input');
      if (code && code.select) code.select();
      else if (code) { const r = document.createRange(); r.selectNodeContents(code); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
    else fail();
  }
  function copySource(button) {
    const explicit = button.getAttribute('data-wb-copy');
    if (explicit) return explicit;
    const host = button.closest('.panel-row, .field, tr, .kv, .flex, div');
    const node = host && (host.querySelector('code, input[readonly], .mono') || host);
    const value = node && (node.value || node.textContent);
    return clean(value).replace(/\s*copy\s*$/i, '');
  }
  function exportCsv(button) {
    const scope = button.closest('.panel, section, main') || document;
    const table = scope.querySelector('table') || $('main table');
    if (!table) { announce('No table on this page to export.'); return; }
    const esc = v => `"${clean(v).replace(/"/g, '""')}"`;
    const rows = [...table.rows].filter(r => !r.hidden && r.getClientRects().length);
    const csv = rows.map(r => [...r.cells].map(c => esc(c.textContent)).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (clean($('main h1') && $('main h1').textContent) || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-sample.csv';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    announce(`Exported ${Math.max(rows.length - 1, 0)} visible sample rows as CSV from this page.`);
  }
  function checkFields(button, label) {
    const fields = fieldsNear(button);
    const invalid = fields.filter(f => !f.checkValidity());
    fields.forEach(f => f.setAttribute('aria-invalid', String(!f.checkValidity())));
    if (invalid.length) {
      invalid[0].focus();
      if (invalid[0].reportValidity) invalid[0].reportValidity();
      announce(`Please complete the highlighted field${invalid.length > 1 ? 's' : ''}. Nothing was ${/send|post|reply/i.test(label) ? 'sent' : 'saved'}.`);
      return;
    }
    announce(`Checked locally — “${label}” is not connected in this prototype. Nothing was sent or saved.`);
  }
  function resetFields(button, label) {
    const fields = fieldsNear(button);
    fields.forEach(f => {
      if (f.type === 'checkbox' || f.type === 'radio') f.checked = f.defaultChecked;
      else if (f.tagName === 'SELECT') [...f.options].forEach(o => { o.selected = o.defaultSelected; });
      else f.value = /clear/i.test(label) ? '' : f.defaultValue;
      f.removeAttribute('aria-invalid');
    });
    announce(/clear/i.test(label) ? 'Fields cleared on this page. Nothing was saved.' : 'Local edits discarded. The original values are restored.');
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-wb-action]');
    if (!button || button.disabled) return;
    const kind = button.getAttribute('data-wb-action');
    const label = button.getAttribute('data-wb-label') || clean(button.textContent) || button.getAttribute('aria-label') || 'Action';
    if (button.tagName === 'A') event.preventDefault();
    if (kind === 'copy') copyText(copySource(button), button);
    else if (kind === 'csv') exportCsv(button);
    else if (kind === 'print') { announce('Opening the print dialog — choose “Save as PDF” to keep a copy of this page.'); setTimeout(() => window.print(), 60); }
    else if (kind === 'check') checkFields(button, label);
    else if (kind === 'reset') resetFields(button, label);
    else if (kind === 'go') { const href = button.getAttribute('data-wb-href'); if (href) location.href = href; }
    else if (kind === 'file') announce('File downloads are not included in this prototype. The file name and size above are the original record.');
    else if (window.__wbOpen) window.__wbOpen(button, label, kind === 'danger');
  });

  /* ------------------------------------------------------- local filters */
  $$('[data-wb-list]').forEach(list => {
    const id = list.id;
    const items = $$('[data-wb-item]', list);
    const search = $(`[data-wb-search][aria-controls="${id}"]`);
    const selects = $$(`[data-wb-filter][aria-controls="${id}"]`);
    const chips = $$(`[data-wb-chip][data-wb-for="${id}"]`);
    const result = $(`[data-wb-result="${id}"]`);
    const empty = $(`[data-wb-empty="${id}"]`);
    if (!items.length) return;
    let chip = '';
    function apply() {
      const q = clean(search && search.value).toLocaleLowerCase();
      const terms = selects.map(s => s.value.toLocaleLowerCase()).filter(Boolean);
      if (chip) terms.push(chip.toLocaleLowerCase());
      let shown = 0;
      items.forEach(item => {
        const text = clean(item.textContent).toLocaleLowerCase();
        const match = (!q || text.includes(q)) && terms.every(t => text.includes(t));
        item.hidden = !match; if (match) shown++;
      });
      const filtered = q || terms.length;
      if (result) result.textContent = filtered ? (shown ? `${shown} of ${items.length} sample rows on this page match.` : '') : '';
      if (empty) empty.hidden = !!shown || !filtered;
    }
    if (search) { search.disabled = false; search.addEventListener('input', apply); }
    selects.forEach(s => { s.disabled = false; s.addEventListener('change', apply); });
    chips.forEach(c => {
      c.disabled = false;
      c.addEventListener('click', () => {
        chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
        chips.forEach(x => x.classList.toggle('active', x === c));
        chip = c.getAttribute('data-wb-chip');
        apply();
      });
    });
    $$(`[data-wb-clear="${id}"]`).forEach(b => {
      b.disabled = false;
      b.addEventListener('click', () => {
        if (search) search.value = '';
        selects.forEach(s => { s.value = ''; });
        chip = '';
        chips.forEach((x, i) => { x.setAttribute('aria-pressed', String(i === 0)); x.classList.toggle('active', i === 0); });
        apply();
        (search || selects[0] || b).focus();
      });
    });
  });

  /* ------------------------------------------------- section navigation */
  $$('[data-wb-sections]').forEach(nav => {
    const links = $$('a[href^="#"]', nav);
    nav.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      links.forEach(x => { x.classList.toggle('active', x === a); if (x === a) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
    });
  });

  /* Links acting as buttons respond to Space like native buttons. */
  document.addEventListener('keydown', e => {
    const a = e.target.closest && e.target.closest('a[role="button"][data-wb-action]');
    if (a && (e.key === ' ' || e.key === 'Spacebar')) { e.preventDefault(); a.click(); }
  });

  /* Scroll containers without focusable content become named, focusable
     regions so keyboard users can scroll them (only while they overflow). */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function scrollRegions() {
    $$('main .tbl-wrap, main [style*="overflow-y:auto"], main [style*="overflow:auto"]').forEach(el => {
      const managed = el.hasAttribute('data-wb-scroll');
      const scrolls = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      const inner = el.querySelector(FOCUSABLE);
      if (scrolls && !inner && !managed && !el.hasAttribute('tabindex')) {
        el.setAttribute('data-wb-scroll', '');
        el.tabIndex = 0;
        if (!el.getAttribute('role')) { el.setAttribute('role', 'region'); el.setAttribute('data-wb-scroll-role', ''); }
        if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
          const table = el.querySelector('table');
          const by = table && table.getAttribute('aria-labelledby');
          if (by) el.setAttribute('aria-labelledby', by);
          else el.setAttribute('aria-label', (table && table.getAttribute('aria-label')) || (el.querySelector('.bubble, .msg, .chat-msg') ? 'Conversation messages' : 'Scrollable content'));
          el.setAttribute('data-wb-scroll-label', '');
        }
      } else if (managed && (!scrolls || inner)) {
        el.removeAttribute('data-wb-scroll');
        el.removeAttribute('tabindex');
        if (el.hasAttribute('data-wb-scroll-role')) { el.removeAttribute('role'); el.removeAttribute('data-wb-scroll-role'); }
        if (el.hasAttribute('data-wb-scroll-label')) { el.removeAttribute('aria-label'); el.removeAttribute('aria-labelledby'); el.removeAttribute('data-wb-scroll-label'); }
      }
    });
  }
  let scrollTimer;
  window.addEventListener('resize', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(scrollRegions, 150); });

  /* ----------------------------------------------------- enable controls */
  $$('[data-wb-action][data-wb-js]').forEach(b => { b.disabled = false; b.removeAttribute('data-wb-js'); });
  scrollRegions();
  document.documentElement.classList.add('wb-ready');
})();
