/* ==========================================================================
   NESTLANCER STATIC HTML MOCKS — MINIMAL UI STATE CONTROLLER (ui.js)
   Zero dependencies. Handles:
     • Light / Dark skin toggle (A6: Light-first default)
     • Compact / Comfortable density toggle (A5: Compact default)
     • Accessible tab panels ([data-tab-group] / [data-tab-target])
     • Modal & Command Palette (⌘K / Ctrl+K + Escape)
     • Prototype Sign-off Quick-Jump Bar
   ========================================================================== */

(function () {
  const html = document.documentElement;

  // 1. Initialize Theme (Light-first default per A6)
  const savedTheme = localStorage.getItem('nl_theme') || 'light';
  html.setAttribute('data-theme', savedTheme);

  // 2. Initialize Density (Compact default per A5)
  const savedDensity = localStorage.getItem('nl_density') || 'compact';
  html.setAttribute('data-density', savedDensity);

  function syncToggles() {
    const theme = html.getAttribute('data-theme') || 'light';
    const density = html.getAttribute('data-density') || 'compact';

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      const label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
    });

    document.querySelectorAll('[data-density-toggle]').forEach((btn) => {
      const label = btn.querySelector('[data-density-label]');
      if (label) label.textContent = density === 'comfortable' ? 'Comfortable' : 'Compact';
    });
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('nl_theme', next);
    syncToggles();
  }

  function toggleDensity() {
    const current = html.getAttribute('data-density') === 'comfortable' ? 'comfortable' : 'compact';
    const next = current === 'comfortable' ? 'compact' : 'comfortable';
    html.setAttribute('data-density', next);
    localStorage.setItem('nl_density', next);
    syncToggles();
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncToggles();

    // Theme & Density Click Handlers
    document.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-theme-toggle]');
      if (themeBtn) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      const densityBtn = e.target.closest('[data-density-toggle]');
      if (densityBtn) {
        e.preventDefault();
        toggleDensity();
        return;
      }

      // Tab Switching ([data-tab-target])
      const tabBtn = e.target.closest('[data-tab-target]');
      if (tabBtn) {
        e.preventDefault();
        const targetId = tabBtn.getAttribute('data-tab-target');
        const group = tabBtn.getAttribute('data-tab-group') || 'default';

        document.querySelectorAll(`[data-tab-target][data-tab-group="${group}"]`).forEach((b) => {
          const active = b === tabBtn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        document.querySelectorAll(`[data-tab-panel][data-tab-group="${group}"]`).forEach((panel) => {
          const show = panel.id === targetId;
          panel.style.display = show ? '' : 'none';
          panel.hidden = !show;
        });
        return;
      }

      // Modal Open
      const modalOpen = e.target.closest('[data-modal-open]');
      if (modalOpen) {
        e.preventDefault();
        const modalId = modalOpen.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('open');
          const firstInput = modal.querySelector('input, select, textarea, button:not([data-modal-close])');
          if (firstInput) setTimeout(() => firstInput.focus(), 30);
        }
        return;
      }

      // Modal Close
      const modalClose = e.target.closest('[data-modal-close]');
      if (modalClose) {
        e.preventDefault();
        const modal = modalClose.closest('.modal-backdrop');
        if (modal) modal.classList.remove('open');
        return;
      }

      // Backdrop Click Close
      if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('open');
      }

      // Mobile Sidebar Toggle
      const mobileToggle = e.target.closest('[data-mobile-nav-toggle]');
      if (mobileToggle) {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');
      }
    });

    // Keyboard Shortcuts: Cmd/Ctrl+K for Command Palette, Escape to close modals
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        const cmdModal = document.getElementById('cmd-palette');
        if (cmdModal) {
          e.preventDefault();
          cmdModal.classList.toggle('open');
          const input = cmdModal.querySelector('input');
          if (cmdModal.classList.contains('open') && input) {
            setTimeout(() => input.focus(), 30);
          }
        }
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach((m) => m.classList.remove('open'));
        const sidebar = document.querySelector('.app-sidebar.mobile-open');
        if (sidebar) sidebar.classList.remove('mobile-open');
      }
    });

    // E-Signature Agreement Checkbox Enablement (Quote Detail Page)
    const sigCheck = document.getElementById('agree-terms-check');
    const sigInput = document.getElementById('legal-signature-input');
    const sigSubmit = document.getElementById('accept-quote-btn');
    if (sigCheck && sigInput && sigSubmit) {
      const updateSigState = () => {
        const valid = sigCheck.checked && sigInput.value.trim().length >= 3;
        sigSubmit.disabled = !valid;
      };
      sigCheck.addEventListener('change', updateSigState);
      sigInput.addEventListener('input', updateSigState);
    }

    // Inject Sign-Off Prototype Bar (bottom-right) so reviewer can jump across all screens & test skin/density
    injectSignOffDock();
  });

  function injectSignOffDock() {
    if (document.getElementById('nl-signoff-dock')) return;
    const pages = [
      { file: 'index.html', label: '00 · Design System & Sign-off Hub' },
      { file: '01-marketing-home.html', label: '01 · Marketing Homepage (D3 #1)' },
      { file: '02-auth-login-register.html', label: '02 · Auth: Login / Register (D3 #2)' },
      { file: '03-client-dashboard.html', label: '03 · Client Dashboard (D3 #3)' },
      { file: '04-client-request-detail.html', label: '04 · Request Detail / Brief (D3 #4)' },
      { file: '05-client-quote-detail.html', label: '05 · Quote Detail ★ Highest Value (D3 #5)' },
      { file: '06-client-project-detail.html', label: '06 · Project Detail (D3 #6)' },
      { file: '07-client-payment-detail.html', label: '07 · Payment & Invoice Detail (D3 #7)' },
      { file: '08-admin-dashboard.html', label: '08 · Admin Command Center (D3 #8)' },
      { file: '09-marketing-pricing.html', label: '09 · Marketing: Pricing' },
      { file: '10-marketing-services.html', label: '10 · Marketing: Services' },
      { file: '11-marketing-about.html', label: '11 · Marketing: About' },
      { file: '12-marketing-contact.html', label: '12 · Marketing: Contact' },
      { file: '13-public-trust-verify.html', label: '13 · Public Trust: Verify & Share' },
      { file: '14-client-requests-projects-list.html', label: '14 · Client: Work Hub (Requests & Projects)' },
      { file: '15-client-quotes-payments-list.html', label: '15 · Client: Quotes, Billing & Invoices' },
      { file: '16-client-messages.html', label: '16 · Client: Messages & Threads' },
      { file: '17-client-notifications-settings.html', label: '17 · Client: Notifications & Settings' },
      { file: '18-admin-users-list.html', label: '18 · Admin: Users Directory' },
      { file: '19-admin-user-detail.html', label: '19 · Admin: User Detail & Pipeline' },
      { file: '20-admin-payments-ops.html', label: '20 · Admin: Payments & Ops' }
    ];

    const currentFile = (window.location.pathname.split('/').pop() || 'index.html');

    const dock = document.createElement('div');
    dock.id = 'nl-signoff-dock';
    dock.setAttribute('role', 'region');
    dock.setAttribute('aria-label', 'Prototype Sign-off Controls');
    dock.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'z-index:95',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'padding:6px 8px',
      'background:var(--surface-elevated)',
      'border:1px solid var(--neutral-7)',
      'border-radius:var(--radius-md)',
      'box-shadow:var(--shadow-md)',
      'font-size:12px'
    ].join(';');

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Jump to mock screen');
    select.style.cssText = [
      'height:28px',
      'padding:0 8px',
      'border-radius:var(--radius-sm)',
      'border:1px solid var(--neutral-6)',
      'background:var(--surface-subtle)',
      'color:var(--neutral-12)',
      'font-family:var(--font-sans)',
      'font-size:12px',
      'font-weight:500',
      'max-width:240px',
      'cursor:pointer'
    ].join(';');

    pages.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.file;
      opt.textContent = p.label;
      if (p.file === currentFile) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      window.location.href = select.value;
    });

    const themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.setAttribute('data-theme-toggle', '');
    themeBtn.className = 'btn btn-secondary btn-sm';
    themeBtn.innerHTML = '<span>Skin:</span> <strong data-theme-label>Light</strong>';

    const densityBtn = document.createElement('button');
    densityBtn.type = 'button';
    densityBtn.setAttribute('data-density-toggle', '');
    densityBtn.className = 'btn btn-secondary btn-sm';
    densityBtn.innerHTML = '<span>Density:</span> <strong data-density-label>Compact</strong>';

    dock.appendChild(select);
    dock.appendChild(themeBtn);
    dock.appendChild(densityBtn);
    document.body.appendChild(dock);
    syncToggles();
  }
})();
