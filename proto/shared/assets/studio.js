/* Opt-in v2 interactions. Local-only; no fetch, credentials, or persistence. */
(() => {
  'use strict';
  const root = document.documentElement;
  const menu = document.querySelector('[data-public-menu]');
  if (menu) {
    const nav = document.getElementById(menu.getAttribute('aria-controls'));
    const setMenu = open => { nav.classList.toggle('menu-open', open); menu.setAttribute('aria-expanded', String(open)); };
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); } });
    nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    root.classList.add('studio-js');
  }
  document.querySelectorAll('[data-process-step]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-process-step]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      document.getElementById('process-detail').textContent = button.getAttribute('data-process-step');
    });
  });
  const passwordToggle = document.querySelector('[data-password-toggle]');
  if (passwordToggle) passwordToggle.addEventListener('click', () => {
    const input = document.getElementById(passwordToggle.getAttribute('aria-controls'));
    const show = input.type === 'password'; input.type = show ? 'text' : 'password';
    passwordToggle.textContent = show ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-pressed', String(show));
    passwordToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
  const login = document.querySelector('[data-demo-login]');
  if (login) login.addEventListener('submit', e => {
    e.preventDefault();
    if (!login.reportValidity()) return;
    // Never read, serialize, log, persist, or send entered credentials.
    const result = document.getElementById('login-result');
    result.replaceChildren(document.createTextNode('This prototype cannot authenticate an account. '));
    const link = document.createElement('a'); link.href = login.getAttribute('action'); link.className = 'link'; link.textContent = 'Explore the sample client dashboard'; result.append(link);
    result.focus();
  });
  const dialog = document.querySelector('[data-proto-dialog]');
  if (dialog) {
    let opener;
    document.querySelectorAll('[data-payment-action]').forEach(button => {
      button.addEventListener('click', () => {
        opener = button;
        const action = button.getAttribute('data-payment-action');
        document.getElementById('payment-dialog-title').textContent = action;
        dialog.querySelector('[data-refund-field]').hidden = action !== 'Issue refund';
        dialog.querySelector('[data-review-result]').textContent = '';
        document.getElementById('review-note').value = '';
        dialog.showModal();
      });
    });
    // Explicit wrap also keeps keyboard focus inside in headless/browser-chrome
    // edge cases where native dialog Tab traversal momentarily targets body.
    dialog.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button, input, textarea, select, a[href], [tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); });
    dialog.querySelector('[data-review-action]').addEventListener('click', () => {
      const amount = document.getElementById('review-refund');
      if (!dialog.querySelector('[data-refund-field]').hidden && !amount.reportValidity()) return;
      dialog.querySelector('[data-review-result]').textContent = 'Local preview reviewed. No action was executed and the original payment data is unchanged.';
    });
  }
  const list = document.querySelector('[data-local-list]');
  if (list) {
    const items = [...list.querySelectorAll('[data-local-item]')];
    const search = document.querySelector('[data-local-search]');
    const category = document.querySelector('[data-local-category]');
    const result = document.querySelector('[data-local-result]');
    function filter() {
      const query = search.value.trim().toLocaleLowerCase();
      let shown = 0;
      items.forEach(item => {
        const match = item.textContent.toLocaleLowerCase().includes(query) && (!category.value || item.dataset.category === category.value);
        item.hidden = !match; if (match) shown++;
      });
      result.textContent = shown ? `${shown} of ${items.length} projects shown on this page.` : 'No matching projects on this page. Clear your search or choose another status or discipline.';
      const summary = document.querySelector('[data-base-summary]');
      if (summary) summary.hidden = shown !== items.length;
    }
    search.addEventListener('input', filter); category.addEventListener('change', filter);
    filter();
  }
  // Supplemental section choreography owns only the outer section. Existing
  // reveal runtime owns its children; do not animate both at once.
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const targets = [...document.querySelectorAll('[data-section-reveal]')];
  function stop() { if (observer) observer.disconnect(); targets.forEach(el => el.classList.remove('section-arrived')); }
  if (!mq.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Only use section animation if the inherited runtime has no reveal children.
      if (!entry.target.querySelector('.reveal')) entry.target.classList.add('section-arrived');
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    targets.forEach(el => observer.observe(el));
  }
  mq.addEventListener('change', stop);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', e => { if (e.persisted) stop(); });
})();
