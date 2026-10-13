// ============================================================================
// Nestlancer prototype — shared runtime (offline-safe, no dependencies)
//   1. theme toggle (light/dark, persisted)
//   2. off-canvas navigation for <=900px (replaces the old "sidebar: none")
//   3. tab / segmented panel switching ([data-tab-target])
//   4. topbar back button
//   5. "/" focuses the top search
//   6. .reveal fallback (motion itself lives in proto-motion.js)
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
  // Entrance + scroll choreography is owned by proto-motion.js (loaded in <head>).
  // Without it (or under reduced motion) nothing is hidden, so only mark blocks.
  if (!root.classList.contains('nl-motion')) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------- segmented controls */
  // Every .seg answers a click: selection moves (aria-pressed + a sliding thumb).
  //  · Write / Split / Preview switch the editor's two columns for real.
  //  · Period ranges (7d · 30d · 90d · 1y) refresh their panel and replay its
  //    figures. The mock only carries the authored 30-day snapshot, so the
  //    numbers themselves stay exactly as written — nothing is invented.
  var PERIOD = /^(7|30|90)\s*d(ays)?$|^1\s*y(ear)?$/i;
  function segInit(seg) {
    var btns = Array.prototype.slice.call(seg.querySelectorAll(':scope > button'));
    if (btns.length < 2 || btns.some(function (b) { return b.hasAttribute('data-tab-target'); })) return;
    var thumb = document.createElement('span');
    thumb.className = 'seg-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    seg.insertBefore(thumb, seg.firstChild);
    function place(b, instant) {
      if (!b) { thumb.style.opacity = '0'; return; }
      if (instant) thumb.style.transition = 'none';
      thumb.style.opacity = '';
      thumb.style.width = b.offsetWidth + 'px';
      thumb.style.height = b.offsetHeight + 'px';
      thumb.style.transform = 'translate3d(' + b.offsetLeft + 'px,' + b.offsetTop + 'px,0)';
      if (instant) { void thumb.offsetWidth; thumb.style.transition = ''; }
    }
    function current() { return btns.filter(function (b) { return b.classList.contains('active'); })[0]; }
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'); });
    place(current(), true);
    seg.classList.add('has-thumb');
    seg._place = function () { place(current(), true); };

    seg.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b || b.parentElement !== seg || b.classList.contains('active')) return;
      btns.forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      place(b, false);
      var label = b.textContent.trim().toLowerCase();

      if (/^(write|split|preview)$/.test(label)) {
        var panel = seg.closest('.panel');
        var grid = panel && panel.querySelector(':scope > .grid.g2');
        if (grid) {                       // edit pages: editor + preview columns exist
          grid.setAttribute('data-view', label);
          restart(grid.children);
        } else {                          // new-post pages: header toggle drives the composer
          compose(label);
        }
        return;
      }
      if (PERIOD.test(label)) {
        var region = seg.closest('.panel');
        if (!region) {
          var row = seg.parentElement;
          region = row && row.nextElementSibling;
        }
        if (!region || reduce) return;
        region.classList.remove('is-refreshing');
        void region.offsetWidth;
        region.classList.add('is-refreshing');
        var useA = !region.classList.contains('nl-replay-a');
        region.classList.toggle('nl-replay-a', useA);
        region.classList.toggle('nl-replay-b', !useA);
        setTimeout(function () { region.classList.remove('is-refreshing'); }, 560);
      }
    });
  }
  function restart(list) {
    Array.prototype.forEach.call(list, function (c) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; });
  }

  // Composer for pages whose markup has no preview pane (new post): Write gives
  // the editor the full width, Split is the authored layout, Preview renders the
  // post from the form itself — what was typed, or the fields' own placeholders.
  function compose(mode) {
    var body = document.querySelector('main textarea[id*="body"], main textarea[id*="content"]');
    var editor = body && body.closest('.panel');
    var grid = editor && editor.closest('.grid');
    if (!grid) return;
    editor.classList.add('nl-compose-editor');
    var pv = grid.querySelector('.nl-preview');
    if (!pv) {
      pv = document.createElement('div');
      pv.className = 'panel nl-preview';
      editor.parentNode.insertBefore(pv, editor.nextSibling);
    }
    if (mode === 'preview') renderPreview(pv, editor);
    grid.setAttribute('data-compose', mode);
    restart(mode === 'preview' ? [pv] : [editor]);
  }
  function field(scope, sel) {
    var el = scope.querySelector(sel);
    if (!el) return { text: '', ghost: false };
    var v = (el.value || '').trim();
    return v ? { text: v, ghost: false } : { text: el.getAttribute('placeholder') || '', ghost: true };
  }
  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function inline(node, text) {            // **bold** only; everything else stays text
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (/^\*\*[^*]+\*\*$/.test(part)) node.appendChild(el('b', part.slice(2, -2)));
      else if (part) node.appendChild(document.createTextNode(part));
    });
  }
  function renderPreview(pv, editor) {
    var t = field(editor, 'input[id*="title"]');
    var x = field(editor, 'textarea[id*="excerpt"]');
    var b = field(editor, 'textarea[id*="body"], textarea[id*="content"]');
    pv.textContent = '';
    var wrap = el('div', null, 'panel-body prose nl-preview-body' + (b.ghost ? ' is-ghost' : ''));
    wrap.appendChild(el('h2', t.text, 'nl-preview-title' + (t.ghost ? ' is-ghost' : '')));
    if (x.text) wrap.appendChild(el('p', x.text, 'nl-preview-excerpt' + (x.ghost ? ' is-ghost' : '')));
    var list = null, para = null;
    b.text.split(/\n/).forEach(function (line) {
      var m = line.match(/^(#{1,3})\s+(.*)$/), li = line.match(/^\s*[-*]\s+(.*)$/);
      if (m) { list = para = null; wrap.appendChild(el('h' + (m[1].length + 2), m[2])); }
      else if (li) { para = null; if (!list) { list = el('ul'); wrap.appendChild(list); } var item = el('li'); inline(item, li[1]); list.appendChild(item); }
      else if (!line.trim()) { list = para = null; }
      else { list = null; if (!para) { para = el('p'); wrap.appendChild(para); } else para.appendChild(document.createTextNode(' ')); inline(para, line.trim()); }
    });
    pv.appendChild(wrap);
  }

  var segs = document.querySelectorAll('.seg');
  segs.forEach(segInit);
  var segTimer;
  window.addEventListener('resize', function () {
    clearTimeout(segTimer);
    segTimer = setTimeout(function () { segs.forEach(function (s) { if (s._place) s._place(); }); }, 120);
  });
  // web fonts can shift button widths after first layout
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { segs.forEach(function (s) { if (s._place) s._place(); }); });

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
