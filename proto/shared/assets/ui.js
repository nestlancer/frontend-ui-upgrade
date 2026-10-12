// ============================================================================
// Nestlancer prototype — shared runtime (offline-safe, no dependencies)
//   1. theme toggle (light/dark, persisted)
//   2. off-canvas navigation for <=900px (replaces the old "sidebar: none")
//   3. tab / segmented panel switching ([data-tab-target])
//   4. topbar back button
//   5. "/" focuses the top search
//   6. scroll reveal for .reveal, reduced-motion safe
// ============================================================================
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- theme */
  try { var t = localStorage.getItem('nl-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  function syncLabel() {
    document.querySelectorAll('[data-theme-label]').forEach(function (n) {
      n.textContent = root.getAttribute('data-theme') === 'dark' ? 'Dark' : 'Light';
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var dark = root.getAttribute('data-theme') === 'dark';
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      b.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  syncLabel();

  /* ------------------------------------------------- off-canvas navigation */
  var shell = document.getElementById('app-shell');
  var navOpener = null;
  var navMedia = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
  function syncNavInert(open) {
    if (!shell || !navMedia) return;
    var aside = shell.querySelector('.sidebar');
    if (!aside) return;
    if (navMedia.matches && !open) aside.setAttribute('inert', '');
    else aside.removeAttribute('inert');
  }
  function setNav(open, opener) {
    if (!shell) return;
    shell.classList.toggle('sb-open', open);
    syncNavInert(open);
    document.querySelectorAll('[data-sb-toggle]').forEach(function (b) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    if (open) {
      navOpener = opener || document.activeElement || shell.querySelector('[data-sb-toggle]');
      var first = shell.querySelector('.sb-item');
      if (first) first.focus({ preventScroll: true });
    } else {
      var restore = navOpener || shell.querySelector('[data-sb-toggle]');
      navOpener = null;
      if (restore && restore.isConnected) restore.focus({ preventScroll: true });
    }
  }
  var isOpen = function () { return shell && shell.classList.contains('sb-open'); };
  if (shell) {
    syncNavInert(isOpen());
    if (navMedia) {
      var syncNavBreakpoint = function () {
        var aside = shell.querySelector('.sidebar');
        // At desktop width the sidebar is the permanent navigation rail; if a
        // phone drawer was open during rotation, leave focus in that visible rail.
        if (!navMedia.matches && isOpen()) {
          shell.classList.remove('sb-open');
          document.querySelectorAll('[data-sb-toggle]').forEach(function (b) {
            b.setAttribute('aria-expanded', 'false');
            b.setAttribute('aria-label', 'Open navigation');
          });
          navOpener = null;
        }
        // When a desktop rail becomes a closed phone drawer, move focus out
        // before making the off-canvas navigation inert.
        if (navMedia.matches && !isOpen() && aside && aside.contains(document.activeElement)) {
          var mobileToggle = shell.querySelector('[data-sb-toggle]');
          if (mobileToggle) mobileToggle.focus({ preventScroll: true });
        }
        syncNavInert(isOpen());
      };
      if (navMedia.addEventListener) navMedia.addEventListener('change', syncNavBreakpoint);
      else if (navMedia.addListener) navMedia.addListener(syncNavBreakpoint);
    }
  }

  /* ------------------------------------------------------------ delegation */
  document.addEventListener('click', function (ev) {
    var theme = ev.target.closest('[data-theme-toggle]');
    if (theme) {
      var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', cur);
      try { localStorage.setItem('nl-theme', cur); } catch (e) {}
      syncLabel();
      return;
    }

    var navToggle = ev.target.closest('[data-sb-toggle]');
    if (navToggle) {
      if (isOpen()) setNav(false);
      else setNav(true, navToggle);
      return;
    }
    if (ev.target.closest('[data-sb-close]')) { setNav(false); return; }
    if (shell && isOpen() && ev.target.closest('.sidebar a')) { setNav(false); }

    var back = ev.target.closest('.topbar .btn-icon[title="Back"], [data-back]');
    if (back) { history.length > 1 ? history.back() : back.blur(); }

    var tab = ev.target.closest('[data-tab-target]');
    if (tab) {
      var group = tab.parentElement;
      var id = tab.getAttribute('data-tab-target');
      var panels = document.querySelectorAll('[data-tab-panel]');
      var hasPanels = false;
      panels.forEach(function (p) { if (p.getAttribute('data-tab-panel') === id) hasPanels = true; });
      group.querySelectorAll('[data-tab-target]').forEach(function (a) {
        a.classList.toggle('active', a === tab);
        a.setAttribute('aria-selected', a === tab ? 'true' : 'false');
      });
      if (hasPanels) {
        ev.preventDefault();
        panels.forEach(function (p) { p.hidden = p.getAttribute('data-tab-panel') !== id; });
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      } else {
        /* section navigation: every panel stays visible for sign-off */
        var target = document.getElementById(id);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#' + id);
        }
      }
      return;
    }

    var fab = document.getElementById('fab');
    if (fab && !ev.target.closest('#fab')) fab.classList.remove('open');
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && isOpen()) { setNav(false); }
    if (ev.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName) && !ev.target.isContentEditable) {
      var s = document.querySelector('.topsearch input');
      if (s) { ev.preventDefault(); s.focus(); }
    }
  });

  /* ------------------------------------------------------------- tab state */
  var panels = document.querySelectorAll('[data-tab-panel]');
  if (panels.length) {
    var shown = document.querySelector('[data-tab-panel]:not([hidden])');
    if (!shown) panels[0].hidden = false;
    var hash = (location.hash || '').replace('#', '');
    var wanted = hash && document.querySelector('[data-tab-target="' + hash + '"]');
    if (wanted && wanted.getAttribute('data-tab-target') !== ((shown || panels[0]).getAttribute('data-tab-panel'))) wanted.click();
  }

  /* ---------------------------------------------------------- scroll reveal */
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------- dialogs */
  document.addEventListener('click', function (ev) {
    var opener = ev.target.closest ? ev.target.closest('[data-dialog-open]') : null;
    if (opener) {
      var d = document.getElementById(opener.getAttribute('data-dialog-open'));
      if (d && typeof d.showModal === 'function') d.showModal();
      return;
    }
    var closer = ev.target.closest ? ev.target.closest('[data-dialog-close]') : null;
    if (closer) {
      var host = closer.closest('dialog');
      if (host) host.close();
    }
  });
  document.addEventListener('click', function (ev) {
    // click on the backdrop closes the dialog
    if (ev.target.tagName === 'DIALOG') ev.target.close();
  });

  /* ------------------------------------------------- collapsed <details> */
  /* Deep links and in-page buttons should still land on content inside a
     collapsed disclosure, so open any <details> on the path to the target. */
  function openAncestors(el) {
    for (var n = el; n; n = n.parentElement) {
      if (n.tagName === 'DETAILS') n.open = true;
    }
  }
  function revealFromHash() {
    var id = (location.hash || '').replace('#', '');
    if (!id) return;
    var t = document.getElementById(id);
    if (t) openAncestors(t);
  }
  revealFromHash();
  window.addEventListener('hashchange', revealFromHash);
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) openAncestors(t);
  });

  window.__nl = { version: 'dir-html/2.0' };
})();
