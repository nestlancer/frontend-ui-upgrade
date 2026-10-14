/* Opt-in tools for the independently authored web content and inbox routes.
   Local state only. Never transmit/store drafts or mutate source fixture counts. */
(() => {
  'use strict';
  document.querySelectorAll('[data-content-filter]').forEach(filter => {
    const list = document.getElementById(filter.dataset.listId);
    const query = filter.querySelector('[data-content-query]');
    const category = filter.querySelector('[data-content-category]');
    const items = [...list.querySelectorAll('[data-filter-item]')];
    const status = list.querySelector('[data-content-result]');
    const apply = () => {
      let count = 0;
      const text = query.value.trim().toLocaleLowerCase();
      items.forEach(item => {
        item.hidden = !(item.textContent.toLocaleLowerCase().includes(text) && (!category || !category.value || item.dataset.category === category.value));
        if (!item.hidden) count++;
      });
      status.textContent = count ? `${count} of ${items.length} local ${filter.dataset.itemName} shown.` : `No matching ${filter.dataset.itemName}. Clear the search or choose another category.`;
    };
    filter.addEventListener('submit', event => event.preventDefault());
    query.addEventListener('input', apply); query.disabled = false;
    if (category) { category.addEventListener('change', apply); category.disabled = false; }
    apply();
  });
  document.querySelectorAll('[data-unavailable]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  const status = document.querySelector('[data-content-status]');
  const toggles = [...document.querySelectorAll('[data-content-toggle]')];
  toggles.forEach(button => {
    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') !== 'true';
      toggles.filter(other => other.dataset.contentToggle === button.dataset.contentToggle).forEach(other => other.setAttribute('aria-pressed', String(pressed)));
      status.textContent = `${button.dataset.contentToggle} ${pressed ? 'selected' : 'cleared'} for this preview only. Nothing was saved to an account.`;
    });
    button.disabled = false;
  });
  document.querySelectorAll('[data-copy-page]').forEach(button => {
    button.addEventListener('click', async () => {
      const output = document.querySelector('[data-share-output]');
      const input = output.querySelector('input');
      input.value = location.href; output.hidden = false;
      try {
        await navigator.clipboard.writeText(input.value);
        status.textContent = 'Page link copied.';
      } catch (_) {
        input.focus(); input.select();
        status.textContent = 'Clipboard unavailable. Select and copy the page link above.';
      }
    });
    button.disabled = false;
  });
  const copyNote = document.querySelector('[data-copy-note]');
  if (copyNote) {
    copyNote.addEventListener('click', async () => {
      const input = document.getElementById('case-scope');
      if (!input.value.trim()) { status.textContent = 'Write a project note first.'; input.focus(); return; }
      try { await navigator.clipboard.writeText(input.value); status.textContent = 'Note copied. Paste it into the contact form yourself; nothing was sent or saved.'; }
      catch (_) { input.focus(); input.select(); status.textContent = 'Clipboard unavailable. Select and copy your note manually.'; }
    });
    copyNote.disabled = false;
  }
  const conversations = [...document.querySelectorAll('[data-conversation]')];
  if (conversations.length) {
    const thread = document.getElementById('inbox-thread');
    const preview = document.getElementById('inbox-snippet');
    let selected = conversations.find(button => button.getAttribute('aria-pressed') === 'true');
    conversations.forEach(button => {
      button.addEventListener('click', () => {
        selected = button;
        conversations.forEach(other => {
          const current = other === button;
          other.setAttribute('aria-pressed', String(current));
          other.closest('.conv').classList.toggle('active', current);
        });
        const full = button.dataset.conversation === '1';
        thread.hidden = !full; preview.hidden = full;
        let heading = document.getElementById('inbox-thread-title');
        if (!full) {
          const row = button.closest('.conv');
          heading = document.getElementById('inbox-snippet-title');
          heading.textContent = row.querySelector('.t').textContent.trim();
          preview.querySelector('[data-snippet-text]').textContent = row.querySelector('.s').textContent;
        }
        heading.focus({preventScroll:true});
        if (matchMedia('(max-width: 760px)').matches) (full ? thread : preview).scrollIntoView({block:'start'});
      });
      button.disabled = false;
    });
    document.querySelectorAll('[data-back-to-list]').forEach(button => button.addEventListener('click', () => {
      if (selected && !selected.closest('.conv').hidden) selected.focus();
      else document.getElementById('conversation-search').focus();
    }));
    const draft = document.querySelector('[data-local-draft]');
    const input = document.getElementById('inbox-draft');
    const result = document.getElementById('draft-result');
    const checkDraft = () => {
      const empty = !input.value.trim();
      input.setAttribute('aria-invalid', String(empty));
      result.textContent = empty ? 'Write a sample draft first. Nothing was sent.' : 'Draft checked locally. Nothing was sent or saved; the original conversation is unchanged.';
      if (empty) input.focus();
    };
    draft.addEventListener('submit', event => { event.preventDefault(); checkDraft(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); checkDraft(); }
    });
    input.addEventListener('input', () => { result.textContent = ''; input.setAttribute('aria-invalid','false'); });
    draft.querySelector('[type="submit"]').disabled = false;
  }
})();
