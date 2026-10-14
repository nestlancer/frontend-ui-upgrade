/* ============================================================================
 * Nestlancer prototype — motion runtime (proto-motion.js)
 *
 * Loaded in <head> WITHOUT defer: it only flags <html class="nl-motion"> so the
 * pre-entrance state is applied before first paint (no flash), then does the
 * real work on DOMContentLoaded. Pairs with the "PASS 2 · Motion" layer in
 * proto.css. Never touches text or data — only classes and CSS variables.
 *
 *   1  entrance choreography — every .reveal block in the first viewport plays
 *      in sequence (--rd delays); blocks further down play as they scroll in
 *   2  stagger indices — .stagger children (--i), table rows (--ri), bars (--bi)
 *   3  charts — line strokes draw, areas rise, bars grow, donuts sweep
 *   4  live accents — attention tiles with a non-zero count get a pulsing dot
 *   5  chrome — sidebar hover highlight that glides between items, topbar /
 *      marketing header lift once content scrolls under them
 *   6  cleanup — entrance animations are released on animationend so they never
 *      leave transforms / stacking contexts behind
 *
 * Safety: prefers-reduced-motion → nothing is hidden and nothing animates.
 * If anything throws, every block is revealed immediately. CSS also carries a
 * time-based failsafe for the (unlikely) case this file stops mid-way.
 * ========================================================================== */
(function () {
  var d = document, root = d.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq && mq.matches) root.classList.add('nl-still');
  else root.classList.add('nl-motion');
  var observers = [];
  // Preference changes stop all choreography immediately. Do not replay a page
  // when motion is re-enabled; leave content in its settled, readable state.
  if (mq) mq.addEventListener('change', function () {
    root.classList.remove('nl-motion');
    root.classList.add('nl-still');
    observers.forEach(function (io) { io.disconnect(); });
    revealAll();
  });
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) { revealAll(); root.classList.remove('nl-motion'); }
  });
  window.addEventListener('pagehide', function () {
    observers.forEach(function (io) { io.disconnect(); });
  });
  // Fail open even if initialization is interrupted before nl-live is applied.
  setTimeout(function () { if (!root.classList.contains('nl-live')) { revealAll(); root.classList.remove('nl-motion'); } }, 2500);

  var ENTRANCE = /^nl-(block|rise|row|fill|count|draw|area|grow|sweep|pop|head|hero|tile|ind|pill)/;
  var VIEW_FILL = 0.94;            // share of the viewport treated as "first screen"
  var BASE = 150, STEP = 85, CAP = 700;

  function ready(fn) {
    if (d.readyState !== 'loading') fn();
    else d.addEventListener('DOMContentLoaded', fn);
  }
  function each(sel, scope, fn) { Array.prototype.forEach.call((scope || d).querySelectorAll(sel), fn); }
  function revealAll() { each('.reveal', d, function (el) { el.classList.add('is-in', 'nl-done'); }); }

  ready(function () {
    try { init(); }
    catch (e) { revealAll(); if (window.console) console.warn('[proto-motion]', e); }
    root.classList.add('nl-live');
  });

  /* ---------------------------------------------------------------- init */
  function init() {
    var main = d.querySelector('body.app-body main.content') || d.querySelector('main');

    // Fallback wiring — the HTML already carries .reveal / .stagger; this only
    // covers pages a future build emits without them.
    if (main && main.classList.contains('content')) {
      Array.prototype.forEach.call(main.children, function (el) {
        if (!el.classList.contains('phead') && !/^(SCRIPT|STYLE|DIALOG|TEMPLATE|NOSCRIPT)$/.test(el.tagName)) el.classList.add('reveal');
      });
    }

    indexChildren();
    tagCharts();
    liveAccents();
    choreograph();
    chrome();
    cleanup();
  }

  /* ------------------------------------------------------ stagger indices */
  function indexChildren() {
    each('.stagger', d, function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 11)); });
    });
    each('.tbl tbody', d, function (tb) {
      Array.prototype.forEach.call(tb.rows, function (r, i) { r.style.setProperty('--ri', Math.min(i, 14)); });
    });
    each('.tline', d, function (t) {
      Array.prototype.forEach.call(t.children, function (c, i) { c.style.setProperty('--ri', Math.min(i, 10)); });
    });
    each('.msg-row', d, function (m) {
      var sib = m.parentElement ? Array.prototype.indexOf.call(m.parentElement.children, m) : 0;
      m.style.setProperty('--ri', Math.min(sib, 10));
    });
    each('.panel', d, function (p) {
      var rows = p.querySelectorAll(':scope > .panel-row, :scope > a.panel-row');
      Array.prototype.forEach.call(rows, function (r, i) { r.style.setProperty('--ri', Math.min(i, 10)); });
    });
  }

  /* ---------------------------------------------------------------- charts */
  function tagCharts() {
    each('svg', d, function (svg) {
      if (svg.closest('[data-artwork]')) return; // original artwork is never a chart
      if (svg.getAttribute('stroke') === 'currentColor') return;          // icon
      var vb = svg.getAttribute('viewBox') || '';
      if (vb === '0 0 32 32' || vb === '0 0 24 24') return;              // logo / glyph
      var lines = svg.querySelectorAll('path[fill="none"][stroke], polyline[fill="none"][stroke]');
      var areas = svg.querySelectorAll('path[fill^="url("]');
      var rings = svg.querySelectorAll('circle[stroke-dasharray]');
      var bars = svg.querySelectorAll('rect');
      if (lines.length) {
        svg.classList.add('nl-chart');
        Array.prototype.forEach.call(lines, function (p) {
          var len = 0;
          try { len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 0); } catch (e) { len = 0; }
          if (len > 0) { p.style.setProperty('--len', len); p.classList.add('nl-line'); }
        });
        Array.prototype.forEach.call(areas, function (a) { a.classList.add('nl-area'); });
      } else if (rings.length) {
        svg.classList.add('nl-chart', 'nl-donut');
      } else if (bars.length >= 4) {
        svg.classList.add('nl-chart', 'nl-bars');
        Array.prototype.forEach.call(bars, function (r, i) { r.style.setProperty('--bi', Math.min(i, 40)); });
      }
    });
  }

  /* ---------------------------------------------------------- live accents */
  function liveAccents() {
    each('.att', d, function (t) {
      var v = t.querySelector('.att-v');
      if (v && v.textContent.trim() !== '0') t.classList.add('is-hot');
    });
    each('.badge.tone-success', d, function (b) {
      if (/^(live|system healthy|intake open|online)$/i.test(b.textContent.trim())) b.classList.add('is-live');
    });
  }

  /* --------------------------------------------------------- choreography */
  function choreograph() {
    if (mq && mq.matches) { revealAll(); return; }
    // Only outermost .reveal blocks animate; nested ones play with their parent.
    var blocks = Array.prototype.filter.call(d.querySelectorAll('.reveal'), function (el) {
      return !(el.parentElement && el.parentElement.closest('.reveal'));
    });
    if (!blocks.length) return;
    var vh = window.innerHeight || 900;
    var later = [];
    var n = 0;
    blocks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var onScreen = r.top < vh * VIEW_FILL && r.bottom > 0;
      if (onScreen) {
        el.style.setProperty('--rd', Math.min(BASE + n * STEP, CAP) + 'ms');
        n++;
        el.classList.add('is-in');
      } else {
        later.push(el);
      }
    });
    if (!later.length) return;
    if (!('IntersectionObserver' in window)) { later.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.setProperty('--rd', Math.min(k * 90, 360) + 'ms');
        k++;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { root: (function () { var pane = d.querySelector('body.app-body .main'); return pane && pane.scrollHeight > pane.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(pane).overflowY) ? pane : null; })(), threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    observers.push(io);
    later.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------- chrome */
  function chrome() {
    // Sidebar: a highlight that glides to whichever item is hovered.
    var nav = d.querySelector('.sb-nav');
    if (nav && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      var glow = d.createElement('span');
      glow.className = 'sb-glide';
      glow.setAttribute('aria-hidden', 'true');
      nav.insertBefore(glow, nav.firstChild);
      nav.classList.add('has-glide');
      var place = function (it) {
        glow.style.transform = 'translate3d(0,' + it.offsetTop + 'px,0)';
        glow.style.height = it.offsetHeight + 'px';
        glow.style.width = it.offsetWidth + 'px';
        glow.style.left = it.offsetLeft + 'px';
      };
      nav.addEventListener('mouseover', function (ev) {
        var it = ev.target.closest('.sb-item');
        if (!it || !nav.contains(it)) return;
        if (!glow.classList.contains('on')) {      // first entry: appear in place, then glide
          glow.style.transition = 'none';
          place(it);
          void glow.offsetWidth;
          glow.style.transition = '';
        } else {
          place(it);
        }
        glow.classList.add('on');
      });
      nav.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
    }

    // Topbar / marketing header lift once content scrolls beneath it.
    var pane = d.querySelector('body.app-body .main');
    var bar = d.querySelector('.topbar') || d.querySelector('.mkt-header');
    if (bar) {
      var src = (pane && pane.scrollHeight > pane.clientHeight + 4) ? pane : window;
      var onScroll = function () {
        var y = src === window ? (window.scrollY || root.scrollTop) : src.scrollTop;
        bar.classList.toggle('is-scrolled', y > 6);
      };
      src.addEventListener('scroll', onScroll, { passive: true });
      if (src !== window) window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* -------------------------------------------------------------- cleanup */
  function cleanup() {
    d.addEventListener('animationend', function (ev) {
      if (ev.pseudoElement || !ENTRANCE.test(ev.animationName || '')) return;
      var el = ev.target;
      // release block-level transforms (stacking contexts) once a block has landed
      if (el.classList && el.classList.contains('reveal') && el.classList.contains('is-in')) el.classList.add('nl-done');
    }, true);
  }
})();
