/* ============================================================================
   Nestlancer · UPGRADE V3 runtime — "Ledger" shell behaviours
   Dependency-free, offline-safe, progressive: every page renders complete
   without this file. Each behaviour is guarded, so a missing hook is a no-op
   and no interaction ever leaves the current page or mutates data.
     1  scroll read-out on the topbar hairline
     2  "on this page" rail: active-section tracking
     3  section collapse ([data-nl-collapse])
     4  card/section tool menus ([data-nl-menu] + .nl-menu)
     5  copy-link buttons ([data-nl-copy]) with a polite live region
     6  density cycle ([data-nl-density]) persisted in localStorage
     7  entrance choreography indices (--nl-i / --ri) + sparkline priming
     8  auth helpers: strength meter, OTP advance, caps-lock, password peek
   ========================================================================== */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var still = root.classList.contains('nl-still') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function all(sel, scope) { return Array.prototype.slice.call((scope || d).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* private mode: preferences simply do not persist */ }
    return null;
  }

  function ready(fn) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(function () {
    var host = d.querySelector('.nl-root') || d.querySelector('main.content') || d.body;
    if (!host) return;

    /* ------------------------------------------------- 1. scroll read-out */
    var bar = d.getElementById('nl-progress');
    if (bar && !still) {
      var doc = d.scrollingElement || d.documentElement;
      var paint = function () {
        var max = doc.scrollHeight - doc.clientHeight;
        var p = max > 40 ? Math.min(1, Math.max(0, (doc.scrollTop || 0) / max)) : 0;
        bar.style.setProperty('--nl-p', p.toFixed(4));
        bar.hidden = p <= 0.001;
      };
      var tick = false;
      window.addEventListener('scroll', function () {
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () { tick = false; paint(); });
      }, { passive: true });
      window.addEventListener('resize', paint, { passive: true });
      paint();
    }

    /* -------------------------------------- 2. rail: active section track */
    var tocLinks = all('.nl-toc a[href^="#"]');
    if (tocLinks.length) {
      var byId = {};
      var targets = [];
      tocLinks.forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        var el = d.getElementById(id);
        if (el) { byId[id] = a; targets.push(el); }
      });
      var setCurrent = function (id) {
        tocLinks.forEach(function (a) { a.classList.remove('is-here'); a.removeAttribute('aria-current'); });
        if (id && byId[id]) { byId[id].classList.add('is-here'); byId[id].setAttribute('aria-current', 'true'); }
      };
      if ('IntersectionObserver' in window && targets.length) {
        var visible = {};
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
          var best = null, bestV = 0;
          targets.forEach(function (t) {
            var v = visible[t.id] || 0;
            if (v > bestV) { bestV = v; best = t.id; }
          });
          if (best) setCurrent(best);
          else if (!all('.nl-toc a.is-here').length && targets[0]) setCurrent(targets[0].id);
        }, { rootMargin: '-84px 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
        targets.forEach(function (t) { io.observe(t); });
      }
      // Anchor clicks jump the hash AND keep the rail honest on manual activation.
      tocLinks.forEach(function (a) {
        a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); }, { passive: true });
      });
      // Deep link on load: focus the referenced section (already native jump).
      if (location.hash && byId[location.hash.slice(1)]) setCurrent(location.hash.slice(1));
    }

    /* ------------------------------------------------- 3. collapse toggle */
    all('[data-nl-collapse]').forEach(function (btn) {
      var target = d.getElementById(btn.getAttribute('data-nl-collapse'));
      if (!target) { btn.disabled = true; return; }
      var state = store('nl-fold:' + location.pathname + '#' + target.id);
      if (state === '1') { target.setAttribute('data-nl-collapsed', 'true'); btn.setAttribute('aria-expanded', 'false'); }
      btn.addEventListener('click', function () {
        var open = target.getAttribute('data-nl-collapsed') !== 'true';
        if (open) { target.setAttribute('data-nl-collapsed', 'true'); } else { target.removeAttribute('data-nl-collapsed'); }
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.setAttribute('title', open ? 'Expand this section' : 'Collapse this section');
        store('nl-fold:' + location.pathname + '#' + target.id, open ? '1' : '0');
        var label = btn.querySelector('[data-nl-collapse-label]');
        if (label) label.textContent = open ? 'Expand' : 'Collapse';
      });
    });

    /* -------------------------------------------------------- 4. tool menus */
    var openMenu = null;
    function closeMenu(opener) {
      if (!openMenu) return;
      var menu = openMenu.menu;
      menu.hidden = true;
      menu.style.position = '';
      menu.style.top = '';
      menu.style.left = '';
      openMenu.opener.setAttribute('aria-expanded', 'false');
      if (opener !== 'key' && openMenu.opener.isConnected) openMenu.opener.focus({ preventScroll: true });
      openMenu = null;
    }
    all('[data-nl-menu]').forEach(function (btn) {
      var menu = d.getElementById(btn.getAttribute('data-nl-menu'));
      if (!menu || !menu.classList.contains('nl-menu')) { btn.disabled = true; return; }
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      function place() {
        var r = btn.getBoundingClientRect();
        menu.hidden = false;
        menu.style.position = 'fixed';
        var w = menu.offsetWidth || 208;
        var left = Math.max(10, Math.min(r.right - w, window.innerWidth - w - 10));
        var top = r.bottom + 6;
        if (top + menu.offsetHeight > window.innerHeight - 10) top = Math.max(10, r.top - menu.offsetHeight - 6);
        menu.style.top = Math.round(top) + 'px';
        menu.style.left = Math.round(left) + 'px';
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (openMenu && openMenu.opener === btn) { closeMenu(); return; }
        closeMenu();
        btn.setAttribute('aria-expanded', 'true');
        openMenu = { opener: btn, menu: menu };
        place();
        var first = menu.querySelector('a[href], button:not([disabled])');
        if (first) first.focus({ preventScroll: true });
      });
      menu.addEventListener('click', function (e) { if (e.target.closest('a,button')) closeMenu('key'); });
      window.addEventListener('resize', function () { if (openMenu && openMenu.opener === btn) place(); }, { passive: true });
      menu.addEventListener('keydown', function (e) {
        var items = all('a[href], button:not([disabled])', menu);
        var i = items.indexOf(d.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1 + items.length) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Tab') { closeMenu('key'); }
      });
    });
    if (openMenu !== null) { /* no-op guard for older bundlers */ }
    d.addEventListener('click', function (e) {
      if (openMenu && !e.target.closest('.nl-menu') && !e.target.closest('[data-nl-menu]')) closeMenu('key');
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openMenu) closeMenu(); });

    /* -------------------------------------------------- 5. copy a deep link */
    var live = d.getElementById('nl-live');
    if (!live) {
      live = d.createElement('p');
      live.id = 'nl-live';
      live.className = 'nl-sr';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      (d.body || d.documentElement).appendChild(live);
    }
    function say(msg) { if (live) live.textContent = msg; }
    all('[data-nl-copy]').forEach(function (btn) {
      var target = btn.getAttribute('data-nl-copy');
      btn.addEventListener('click', function () {
        var id = target.charAt(0) === '#' ? target.slice(1) : target;
        var url = location.href.split('#')[0] + (id ? '#' + id : '');
        var done = function (ok) {
          say(ok ? 'Link copied to the clipboard.' : 'Copying is unavailable here — the link is shown instead.');
          var out = btn.closest('.nl-card, .nl-sec, .nl-strip, form');
          var slot = out && out.querySelector('[data-nl-copy-out]');
          if (!ok && slot) { slot.hidden = false; slot.textContent = url; }
          var prev = btn.textContent;
          btn.textContent = ok ? 'Copied' : 'Shown below';
          window.setTimeout(function () { btn.textContent = prev; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
        } else { done(false); }
      });
    });

    /* ---------------------------------------------------- 6. density cycle */
    var ORDER = ['cosy', 'compact', 'roomy'];
    var densBtn = d.querySelector('[data-nl-density]');
    if (densBtn) {
      var saved = store('nl-density');
      function apply(mode) {
        if (mode === 'cosy') host.removeAttribute('data-nl-density');
        else host.setAttribute('data-nl-density', mode);
        densBtn.setAttribute('aria-label', 'Row density: ' + mode + '. Activate to change.');
        var slot = densBtn.querySelector('[data-nl-density-label]');
        if (slot) slot.textContent = mode === 'cosy' ? 'Cosy' : mode.charAt(0).toUpperCase() + mode.slice(1);
      }
      if (saved && ORDER.indexOf(saved) > -1) apply(saved);
      else apply(host.getAttribute('data-nl-density') || 'cosy');
      densBtn.addEventListener('click', function () {
        var cur = host.getAttribute('data-nl-density') || 'cosy';
        var next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
        apply(next);
        store('nl-density', next);
        say('Density set to ' + (next === 'cosy' ? 'cosy' : next) + '.');
      });
    }

    /* --------------------------------- 7. choreography + sparkline priming */
    if (!still) {
      all('.nl-sec', host).forEach(function (s, i) { s.style.setProperty('--nl-i', Math.min(i, 8)); });
      all('.nl-kpis .nl-kpi, .nl-kpis .stat', host).forEach(function (k, i) { k.style.setProperty('--ri', Math.min(i, 10)); });
      all('.nl-spark path', host).forEach(function (p) {
        try {
          var len = p.getTotalLength ? p.getTotalLength() : 0;
          if (len > 0) p.style.setProperty('--len', Math.round(len));
        } catch (e) { /* non-geometry path: static stroke, no animation */ }
      });
    }

    /* ------------------------------------------------------ 8. auth helpers */
    var pw = d.querySelector('[data-nl-pw]');
    var meter = d.querySelector('[data-nl-meter]');
    if (pw && meter) {
      var reqs = all('[data-nl-req]', meter);
      var RULES = {
        len: function (v) { return v.length >= 12; },
        mix: function (v) { return /[a-z]/.test(v) && /[A-Z]/.test(v); },
        digit: function (v) { return /\d/.test(v); },
        symbol: function (v) { return /[^A-Za-z0-9]/.test(v); }
      };
      var paintPw = function () {
        var v = pw.value;
        var met = 0;
        reqs.forEach(function (li) {
          var fn = RULES[li.getAttribute('data-nl-req')];
          var ok = !!fn && fn(v);
          li.setAttribute('data-met', ok ? 'true' : 'false');
          if (ok) met += 1;
        });
        meter.setAttribute('data-score', v.length ? String(Math.max(1, met)) : '0');
        var score = meter.querySelector('[data-nl-meter-score]');
        if (score) score.textContent = !v.length ? 'Awaiting input' : met >= 4 ? 'Strong — 4 of 4 checks' : met + ' of 4 checks met';
      };
      pw.addEventListener('input', paintPw);
      paintPw();
      var peek = d.querySelector('[data-nl-peek]');
      if (peek) {
        var peekLabel = peek.querySelector('[data-nl-peek-label]');
        peek.addEventListener('click', function () {
          var show = pw.type === 'password';
          pw.type = show ? 'text' : 'password';
          peek.setAttribute('aria-pressed', show ? 'true' : 'false');
          if (peekLabel) peekLabel.textContent = show ? 'Hide' : 'Show';
          pw.focus({ preventScroll: true });
        });
      }
      var caps = d.querySelector('[data-nl-caps]');
      if (caps) {
        var capsField = d.querySelector(caps.getAttribute('data-nl-caps')) || pw;
        capsField.addEventListener('keyup', function (e) {
          var on = typeof e.getModifierState === 'function' && e.getModifierState('CapsLock');
          var msg = caps.querySelector('[data-nl-caps-msg]');
          caps.hidden = !on;
          if (msg) msg.textContent = on ? 'Caps Lock is on — passwords are case sensitive.' : '';
        });
      }
    }
    // 6-digit code fields: advance, backspace back, paste spreads, submit on completion.
    var codes = all('[data-nl-code]');
    if (codes.length > 1) {
      codes.forEach(function (inp, idx) {
        inp.addEventListener('input', function () {
          inp.value = inp.value.replace(/[^0-9A-Za-z]/g, '').slice(-1);
          if (inp.value && idx < codes.length - 1) codes[idx + 1].focus();
          if (codes.every(function (c) { return c.value; })) {
            var form = inp.form;
            var hint = d.querySelector('[data-nl-code-hint]');
            if (hint) hint.textContent = 'All six digits entered — the code can be checked.';
            if (form && form.hasAttribute('data-nl-autosubmit')) {
              var go = d.querySelector('[data-nl-code-submit]');
              if (go) go.click();
            }
          }
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !inp.value && idx > 0) { codes[idx - 1].focus(); codes[idx - 1].value = ''; e.preventDefault(); }
          if (e.key === 'ArrowLeft' && idx > 0) { codes[idx - 1].focus(); e.preventDefault(); }
          if (e.key === 'ArrowRight' && idx < codes.length - 1) { codes[idx + 1].focus(); e.preventDefault(); }
        });
        inp.addEventListener('paste', function (e) {
          var txt = ((e.clipboardData || window.clipboardData) || {}).getData ? e.clipboardData.getData('text') : '';
          var chars = String(txt || '').replace(/[^0-9A-Za-z]/g, '').split('');
          if (!chars.length) return;
          e.preventDefault();
          chars.slice(0, codes.length).forEach(function (c, i) { codes[i].value = c; });
          codes[Math.min(chars.length, codes.length) - 1].focus();
        });
      });
    }
    // Demo credential filler: fills this page's own fields, no network call.
    all('[data-nl-demo-fill]').forEach(function (btn) {
      var scope = btn.closest('.nl-auth-card') || host;
      var data = { email: 'ananya.iyer@nestlancer.com', password: 'prototype-demo', code: '492170', name: 'Ananya Iyer', org: 'Iyer FinTech Solutions' };
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        all('input, select, textarea', scope).forEach(function (f) {
          if (f.disabled || f.readOnly) return;
          var kind = (f.getAttribute('name') || f.id || '') + ' ' + (f.type || '') + ' ' + (f.getAttribute('autocomplete') || '');
          if (/password/i.test(kind)) f.value = data.password;
          else if (/email/i.test(kind)) f.value = data.email;
          else if (/code|otp|token/i.test(kind)) f.value = '1'.length ? (f.getAttribute('data-nl-code') !== null ? '4' : '492170') : '';
          else if (/name/i.test(kind) && !/hidden/i.test(kind)) f.value = data.name;
          else if (/org|company|organisation/i.test(kind)) f.value = data.org;
          else if (/hidden/i.test(kind)) return;
          f.dispatchEvent(new Event('input', { bubbles: true }));
          f.dispatchEvent(new Event('change', { bubbles: true }));
        });
        codes.forEach(function (c, i) { c.value = '492170'[i] || ''; c.dispatchEvent(new Event('input', { bubbles: true })); });
        all('input[type="checkbox"]', scope).forEach(function (c) { if (!c.disabled) c.checked = true; });
        say('Demo values entered locally. Nothing was sent anywhere.');
        btn.setAttribute('data-nl-demo-filled', 'true');
      });
    });
  });
})();
