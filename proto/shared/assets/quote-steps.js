/* Quote builder steps: turns the preserved quote-builder preview into a
   working three-step editor (Scope / Pricing / Terms) over the recorded data.
   Local only: nothing is saved or sent. Without JS all three steps stay
   visible as one long form and the step controls remain disabled/hidden. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$('[data-qsteps]').forEach(root => {
    const tabs = $$('[data-qsteps-tab]', root);
    const panels = $$('[data-qsteps-panel]', root);
    const prev = $('[data-qsteps-prev]', root);
    const next = $('[data-qsteps-next]', root);
    const live = $('[data-qsteps-live]', root);
    const names = panels.map(p => ($('.qsteps-h', p).textContent || '').replace(/^\s*\d+\s*/, '').trim());
    let step = 1;

    root.classList.add('qsteps-on');
    $('[data-qsteps-tabs]', root).hidden = false;
    $$('[data-qs-js]', root).forEach(b => { b.disabled = false; });
    panels.forEach((p, i) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tabs[i].id); });

    function show(n, focusTarget) {
      step = Math.min(Math.max(n, 1), panels.length);
      tabs.forEach((t, i) => {
        const on = i + 1 === step;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('active', on);
      });
      panels.forEach((p, i) => { p.hidden = i + 1 !== step; });
      $$('[data-qsteps-prog]', root).forEach((li, i) => {
        li.classList.toggle('done', i + 1 < step);
        if (i + 1 === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      prev.disabled = step === 1;
      next.disabled = step === panels.length;
      next.hidden = step === panels.length;
      live.textContent = `Step ${step} of ${panels.length}: ${names[step - 1]}.`;
      if (focusTarget === 'tab') tabs[step - 1].focus();
      else if (focusTarget === 'heading') $('.qsteps-h', panels[step - 1]).focus();
    }

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i + 1));
      t.addEventListener('keydown', e => {
        const k = e.key;
        let n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = step % tabs.length + 1;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (step + tabs.length - 2) % tabs.length + 1;
        else if (k === 'Home') n = 1;
        else if (k === 'End') n = tabs.length;
        if (n !== null) { e.preventDefault(); show(n, 'tab'); }
      });
    });
    prev.addEventListener('click', () => show(step - 1, 'heading'));
    next.addEventListener('click', () => show(step + 1, 'heading'));

    /* Line-item library: honest disclosure — the fixture has no reusable blocks. */
    const libBtn = $('[data-qsteps-library]', root);
    const lib = $('#qs-library', root);
    libBtn.addEventListener('click', () => {
      const open = lib.hidden;
      lib.hidden = !open;
      libBtn.setAttribute('aria-expanded', String(open));
      libBtn.textContent = open ? 'Hide library' : 'Line-item library';
    });

    /* Pricing: Preset / Custom % mode, synchronised with the original select. */
    const select = $('#payment-schedule', root);
    const modeWrap = $('[data-qsteps-mode]', root);
    const modeBtns = $$('[data-qsteps-mode-btn]', root);
    const custom = $('[data-qsteps-custom]', root);
    const rowsWrap = $('[data-qsteps-rows]', root);
    const totalOut = $('[data-qsteps-total]', root);
    const sched = $('[data-qsteps-sched]', root);
    const preview = $('[data-qsteps-preview]', root);
    const customIdx = [...select.options].findIndex(o => /custom/i.test(o.textContent));
    let lastPreset = select.selectedIndex === customIdx ? 0 : select.selectedIndex;
    modeWrap.hidden = false;

    /* Stored installments read from the page record (Deposit 50% · on accept …). */
    const stored = $$('.kv dt', $('[data-qsteps-panel="2"]', root)).map(dt => {
      const m = dt.textContent.trim().match(/^(.*?)\s+(\d+)%$/);
      const due = (dt.nextElementSibling.textContent.split('·')[1] || '').trim();
      return m ? { name: m[1], pct: +m[2], due } : null;
    }).filter(Boolean);
    const dues = [...new Set(stored.map(s => s.due))];
    let uid = 0;

    function addRow(data) {
      uid += 1;
      const n = uid;
      const row = document.createElement('div');
      row.className = 'qsteps-row';
      row.innerHTML =
        `<label class="wb-sr" for="qs-name-${n}">Installment name</label><input class="input" id="qs-name-${n}" required>` +
        `<label class="wb-sr" for="qs-pct-${n}">Percentage</label><span class="qsteps-pct"><input class="input mono" id="qs-pct-${n}" inputmode="numeric" max="100" min="1" required step="1" type="number"><span aria-hidden="true">%</span></span>` +
        `<label class="wb-sr" for="qs-due-${n}">Due</label><select class="select" id="qs-due-${n}"></select>` +
        `<button class="btn btn-ghost btn-sm" type="button" data-qsteps-remove>Remove</button>`;
      $('input[id^="qs-name"]', row).value = data.name;
      $('input[type="number"]', row).value = data.pct;
      const sel = $('select', row);
      dues.forEach(d => sel.add(new Option(d, d, false, d === data.due)));
      $('[data-qsteps-remove]', row).setAttribute('aria-label', `Remove ${data.name || 'installment'}`);
      rowsWrap.append(row);
      return row;
    }
    function rows() { return $$('.qsteps-row', rowsWrap); }
    function total() {
      const pcts = $$('input[type="number"]', rowsWrap);
      const sum = pcts.reduce((a, i) => a + (parseFloat(i.value) || 0), 0);
      const ok = Math.abs(sum - 100) < 0.001;
      pcts.forEach(i => i.setCustomValidity(ok ? '' : 'Installments must add up to 100%.'));
      pcts.forEach(i => i.setAttribute('aria-invalid', String(!ok)));
      totalOut.textContent = ok ? `Total ${sum}%` : `Total ${sum}% · must equal 100%`;
      totalOut.classList.toggle('bad', !ok);
      $$('[data-qsteps-remove]', rowsWrap).forEach(b => { b.disabled = rows().length < 2; });
      if (custom.hidden === false) sched.textContent = `Custom ${$$('input[type="number"]', rowsWrap).map(i => i.value || 0).join('/')}`;
      return ok;
    }
    stored.forEach(addRow);
    rowsWrap.addEventListener('input', total);
    rowsWrap.addEventListener('click', e => {
      const b = e.target.closest('[data-qsteps-remove]');
      if (!b || b.disabled) return;
      const row = b.closest('.qsteps-row');
      const list = rows();
      const at = list.indexOf(row);
      row.remove();
      total();
      const target = rows()[Math.min(at, rows().length - 1)];
      if (target) $('input', target).focus();
      live.textContent = 'Installment removed. ' + totalOut.textContent + '.';
    });
    $('[data-qsteps-add]', root).addEventListener('click', () => {
      const row = addRow({ name: '', pct: 0, due: dues[dues.length - 1] || '' });
      total();
      $('input', row).focus();
    });

    function presetLabel(i) { return select.options[i].textContent.replace(/\s*\(selected\)\s*/i, '').trim(); }
    function setMode(mode, fromSelect) {
      const isCustom = mode === 'custom';
      modeBtns.forEach(b => {
        const on = b.getAttribute('data-qsteps-mode-btn') === mode;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('btn-primary', on);
        b.classList.toggle('btn-secondary', !on);
      });
      custom.hidden = !isCustom;
      if (!fromSelect) select.selectedIndex = isCustom ? customIdx : lastPreset;
      if (isCustom) { total(); }
      else {
        sched.textContent = presetLabel(select.selectedIndex);
        const stays = select.selectedIndex === 0;
        preview.hidden = stays;
        preview.textContent = stays ? '' : `Preview only: “${presetLabel(select.selectedIndex)}” is selected locally. The stored installments above are unchanged and nothing is saved in this prototype.`;
      }
      if (isCustom) { preview.hidden = false; preview.textContent = 'Preview only: custom percentages are checked here and are not saved in this prototype.'; }
    }
    modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.getAttribute('data-qsteps-mode-btn'))));
    select.addEventListener('change', () => {
      if (select.selectedIndex === customIdx) setMode('custom', true);
      else { lastPreset = select.selectedIndex; setMode('preset', true); }
    });
    setMode(select.selectedIndex === customIdx ? 'custom' : 'preset', true);

    /* Terms: live character count. */
    const terms = $('#qb-terms', root);
    const count = $('[data-qsteps-count]', root);
    const upd = () => { const n = terms.value.length; count.textContent = `${n} character${n === 1 ? '' : 's'}`; };
    terms.addEventListener('input', upd); upd();

    /* Create quote: an invalid custom schedule on a hidden step is surfaced first. */
    const create = $('.dialog-foot [data-wb-action="check"]', root);
    create.addEventListener('click', e => {
      if (custom.hidden) return;
      const sumOk = total();
      const fields = $$('input, select', rowsWrap);
      const bad = fields.find(f => !f.checkValidity());
      if (sumOk && !bad) return;
      e.stopImmediatePropagation();
      show(2);
      fields.forEach(f => { if (f.type !== 'number' || sumOk) f.setAttribute('aria-invalid', String(!f.checkValidity())); });
      if (bad) bad.focus();
      live.textContent = (sumOk ? 'Complete each installment name and percentage (at least 1%)' : 'Custom installments must add up to 100%') + ' before the quote can be checked. Nothing was saved.';
    }, true);

    show(1);
  });
})();
