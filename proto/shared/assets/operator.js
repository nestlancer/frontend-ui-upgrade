/* Dashboard-only local page navigation. Native modal; no APIs or data mutation. */
(() => {
  'use strict';
  const dialog = document.getElementById('operator-search');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const query = document.getElementById('operator-search-query');
  const result = document.getElementById('operator-search-status');
  const entries = [...dialog.querySelectorAll('[data-search-entry]')];
  const openers = [...document.querySelectorAll('[data-operator-search-open]')];
  let opener;
  function filter() {
    const text = query.value.trim().toLocaleLowerCase();
    entries.forEach(entry => entry.hidden = !entry.textContent.toLocaleLowerCase().includes(text));
    dialog.querySelectorAll('.operator-search-group').forEach(group => group.hidden = !group.querySelector('[data-search-entry]:not([hidden])'));
    const count = entries.filter(entry => !entry.hidden).length;
    // Suggestions come from this page's own destinations (client and admin differ).
    const names = entries.map(entry => entry.textContent.trim()).filter(name => !/^dashboard$/i.test(name)).slice(0, 3);
    const hint = names.length ? ` Try ${names.slice(0, -1).join(', ')}${names.length > 1 ? ' or ' : ''}${names[names.length - 1]}.` : '';
    result.textContent = count ? `${count} local ${count === 1 ? 'destination' : 'destinations and actions'}.` : `No matching page.${hint}`;
  }
  function open(button) {
    if (dialog.open) { query.focus(); return; }
    opener = button || document.activeElement;
    query.value = ''; filter(); dialog.showModal(); query.focus();
  }
  openers.forEach(button => {
    button.addEventListener('click', () => open(button));
    if (button.tagName === 'INPUT') button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(button); }
    });
    button.disabled = false;
  });
  // Capture before shared slash-to-focus behavior, including from result links.
  document.addEventListener('keydown', event => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
    if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing)) {
      event.preventDefault(); event.stopImmediatePropagation();
      open(dialog.open ? opener : document.activeElement);
    }
  }, true);
  query.addEventListener('input', filter);
  dialog.querySelector('[data-operator-search-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (opener && opener.isConnected && opener.getClientRects().length) opener.focus({preventScroll:true});
    else openers.find(button => button.getClientRects().length)?.focus();
  });
  dialog.addEventListener('keydown', event => {
    const visible = entries.filter(entry => !entry.hidden);
    // Explicit Escape: Chromium's close-watcher can ignore Escape after prevented Tab keydowns.
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!visible.length) return;
      const current = visible.indexOf(document.activeElement);
      const index = current < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
      visible[index].focus();
    } else if (event.key === 'Enter' && document.activeElement === query) {
      event.preventDefault(); visible[0]?.click();
    } else if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('input,button,a[href]')].filter(el => !el.disabled && !el.hidden && el.getClientRects().length);
      const first = controls[0],last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
