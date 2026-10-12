/* Nestlancer prototype UI runtime: theme toggle, interactive tabs/drawers, reveal motion & hygiene */
(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('nl-proto-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  function syncLabels() {
    const t = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    document.querySelectorAll('[data-theme-label]').forEach(el => {
      el.textContent = t === 'dark' ? 'Dark' : 'Light';
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (t) {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('nl-proto-theme', next);
      syncLabels();
      return;
    }

    const tab = e.target.closest('.tabs .tab, .seg button');
    if (tab && tab.getAttribute('href') === '#') {
      e.preventDefault();
      const group = tab.parentElement;
      if (group) {
        group.querySelectorAll('.tab, button').forEach(sib => sib.classList.remove('active'));
        tab.classList.add('active');
      }
      const targetId = tab.getAttribute('data-tab-target');
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    const fab = document.getElementById('fab');
    if (fab && fab.classList.contains('open') && !e.target.closest('#fab')) {
      fab.classList.remove('open');
    }
  });

  function applyHygiene() {
    // Clean any accidental "undefined" text inside SVG icons
    document.querySelectorAll('svg').forEach(svg => {
      if (svg.textContent && svg.textContent.trim() === 'undefined') {
        svg.innerHTML = '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>';
      }
    });

    // Clamp any inline font-size < 11px
    document.querySelectorAll('[style*="font-size"]').forEach(el => {
      const fs = parseFloat(el.style.fontSize);
      if (!isNaN(fs) && fs > 0 && fs < 11) {
        el.style.fontSize = '11px';
      }
    });
  }

  function initReveal() {
    const candidates = document.querySelectorAll(
      '.mkt-section .mkt-card, .mkt-section .panel, .hub-app, .main .stats > .stat'
    );
    candidates.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--d', `${(i % 6) * 45}ms`);
    });
    if (!('IntersectionObserver' in window)) {
      candidates.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    candidates.forEach(el => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncLabels();
      applyHygiene();
      initReveal();
    });
  } else {
    syncLabels();
    applyHygiene();
    initReveal();
  }
})();
