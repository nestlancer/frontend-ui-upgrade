/* Public flow runtime (auth, verification, filters, reading rails).
 * Local-only: never fetches, logs, persists, or serialises entered values.
 * Every hook is multi-instance and opt-in via data attributes. */
(() => {
  'use strict';
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const text = (el, value) => { if (el) el.textContent = value; };

  /* ------------------------------------------------ password reveal */
  $$('[data-flow-reveal]').forEach(button => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    if (!input) return;
    button.disabled = false;
    button.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
      button.setAttribute('aria-pressed', String(show));
    });
  });

  /* ------------------------------------------------ one-time codes */
  $$('[data-otp]').forEach(group => {
    const cells = $$('input', group);
    const clean = v => (v || '').replace(/\D/g, '');
    cells.forEach((cell, i) => {
      cell.addEventListener('input', () => {
        const digits = clean(cell.value);
        if (digits.length > 1) { spread(digits, i); return; }
        cell.value = digits;
        cell.setCustomValidity('');
        if (digits && cells[i + 1]) cells[i + 1].focus();
      });
      cell.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !cell.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].select(); }
        else if (e.key === 'ArrowLeft' && cells[i - 1]) { e.preventDefault(); cells[i - 1].focus(); }
        else if (e.key === 'ArrowRight' && cells[i + 1]) { e.preventDefault(); cells[i + 1].focus(); }
      });
      cell.addEventListener('focus', () => cell.select());
      cell.addEventListener('paste', e => {
        const digits = clean((e.clipboardData || window.clipboardData).getData('text'));
        if (!digits) return;
        e.preventDefault();
        spread(digits, i);
      });
    });
    function spread(digits, from) {
      digits.split('').slice(0, cells.length - from).forEach((d, k) => { cells[from + k].value = d; cells[from + k].setCustomValidity(''); });
      (cells[Math.min(from + digits.length, cells.length - 1)]).focus();
    }
  });

  /* ------------------------------------------------ resend cooldown */
  $$('[data-flow-resend]').forEach(button => {
    const status = document.getElementById(button.getAttribute('aria-describedby').split(' ').pop());
    const label = button.textContent;
    let timer;
    button.disabled = false;
    button.addEventListener('click', () => {
      let left = 30;
      button.disabled = true;
      text(status, 'Prototype only: no code was sent. You can try again in 30 seconds.');
      button.textContent = `${label} (30s)`;
      clearInterval(timer);
      timer = setInterval(() => {
        left -= 1;
        button.textContent = left > 0 ? `${label} (${left}s)` : label;
        if (left <= 0) { clearInterval(timer); button.disabled = false; }
      }, 1000);
    });
  });

  /* ------------------------------------------------ local demo forms */
  $$('form[data-flow-form]').forEach(form => {
    const result = form.querySelector('[data-flow-result]');
    const submit = form.querySelector('[type="submit"]');
    const matches = $$('[data-match]', form);
    const otp = form.querySelector('[data-otp]');
    matches.forEach(field => {
      const other = document.getElementById(field.getAttribute('data-match'));
      const check = () => field.setCustomValidity(field.value && other.value !== field.value ? 'Passwords do not match.' : '');
      field.addEventListener('input', check);
      other.addEventListener('input', check);
    });
    form.addEventListener('input', () => { if (result) result.textContent = ''; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (otp) {
        const empty = $$('input', otp).find(c => !/^\d$/.test(c.value));
        if (empty) { empty.setCustomValidity('Enter all 6 digits.'); }
      }
      if (!form.reportValidity()) return;
      // Values are compared in memory only; nothing is read into messages.
      result.replaceChildren(document.createTextNode(form.getAttribute('data-flow-form') + ' '));
      const next = form.getAttribute('action');
      if (next) {
        const a = document.createElement('a');
        a.href = next; a.className = 'link';
        a.textContent = form.getAttribute('data-flow-next') || 'Continue';
        result.append(a);
      }
      result.focus();
    });
    if (submit) submit.disabled = false;
  });

  /* ------------------------------------------------ document lookup */
  $$('form[data-doc-verify]').forEach(form => {
    const input = form.querySelector('input');
    const panel = document.getElementById(form.getAttribute('data-doc-verify'));
    const status = form.querySelector('[data-doc-status]');
    const known = panel.getAttribute('data-doc-ref');
    const formats = /^NL-(INV|QTO|CTR|CN|RCT)-\d{4}-\d{6}$/;
    form.querySelector('[type="submit"]').disabled = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ref = input.value.trim().toUpperCase();
      input.value = ref;
      if (ref === known) {
        panel.hidden = false;
        text(status, `${ref} matches the sample record shown below.`);
      } else if (formats.test(ref)) {
        panel.hidden = true;
        text(status, `${ref} uses a valid reference format, but only ${known} is included in this prototype sample. No lookup was sent.`);
      } else {
        panel.hidden = true;
        text(status, 'That does not look like a Nestlancer reference. Check the document footer for a code such as ' + known + '.');
      }
      status.focus();
    });
  });

  /* ------------------------------------------------ list filters */
  $$('[data-flow-list]').forEach(list => {
    const id = list.id;
    const items = $$('[data-flow-item]', list);
    const search = document.querySelector(`[data-flow-search="${id}"]`);
    const select = document.querySelector(`[data-flow-select="${id}"]`);
    const result = document.querySelector(`[data-flow-result-for="${id}"]`);
    const empty = document.querySelector(`[data-flow-empty="${id}"]`);
    const noun = list.getAttribute('data-flow-noun') || 'items';
    function apply() {
      const q = search ? search.value.trim().toLocaleLowerCase() : '';
      const opt = select && select.selectedIndex > 0 ? select.value.toLocaleLowerCase() : '';
      let shown = 0;
      items.forEach(item => {
        const t = item.textContent.toLocaleLowerCase();
        const ok = (!q || t.includes(q)) && (!opt || t.includes(opt));
        item.hidden = !ok; if (ok) shown++;
      });
      text(result, shown === items.length ? `All ${items.length} ${noun} shown.` : `${shown} of ${items.length} ${noun} shown.`);
      if (empty) empty.hidden = shown !== 0;
    }
    [search, select].forEach(c => { if (c) { c.disabled = false; c.addEventListener(c === search ? 'input' : 'change', apply); } });
    $$(`[data-flow-clear="${id}"]`).forEach(b => { b.disabled = false; b.addEventListener('click', () => { if (search) search.value = ''; if (select) select.selectedIndex = 0; apply(); (search || select).focus(); }); });
    const form = (search || select) && (search || select).closest('form');
    if (form) form.addEventListener('submit', e => e.preventDefault());
    apply();
  });

  /* ------------------------------------------------ local bookmarks */
  $$('[data-bookmark-list]').forEach(list => {
    const status = document.getElementById(list.getAttribute('data-bookmark-status'));
    let last;
    list.addEventListener('click', e => {
      const remove = e.target.closest('[data-bookmark-remove]');
      if (!remove) return;
      last = remove.closest('[data-bookmark]');
      last.hidden = true;
      const title = last.getAttribute('data-bookmark');
      status.replaceChildren(document.createTextNode(`Removed “${title}” from this preview only. `));
      const undo = document.createElement('button');
      undo.type = 'button'; undo.className = 'link'; undo.textContent = 'Undo';
      undo.addEventListener('click', () => { last.hidden = false; status.textContent = `Restored “${title}”.`; last.querySelector('a').focus(); });
      status.append(undo);
      undo.focus();
    });
    $$('[data-bookmark-remove]', list).forEach(b => { b.disabled = false; });
  });

  /* ------------------------------------------------ reading rails */
  $$('[data-reading-rail]').forEach(rail => {
    const links = $$('a[href^="#"]', rail);
    const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const mark = id => links.forEach(a => { const on = a.getAttribute('href') === '#' + id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    // A click wins over scroll-spy while the browser scrolls to the target.
    let lockUntil = 0;
    rail.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) { lockUntil = Date.now() + 1200; mark(a.getAttribute('href').slice(1)); } });
    if (!('IntersectionObserver' in window) || !targets.length) return;
    // Short final sections can never reach the top band: at the page end, mark the last one.
    window.addEventListener('scroll', () => {
      if (Date.now() < lockUntil) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) mark(targets[targets.length - 1].id);
    }, { passive: true });
    const io = new IntersectionObserver(entries => {
      if (Date.now() < lockUntil) return;
      const visible = entries.filter(x => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) mark(visible.target.id);
    }, { rootMargin: '-80px 0px -65% 0px' });
    targets.forEach(t => io.observe(t));
  });

  document.documentElement.classList.add('flow-ready');
})();
