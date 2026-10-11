// Nestlancer prototype — tiny interactivity
(function () {
  var root = document.documentElement;
  try { var t = localStorage.getItem('nl-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  function syncLabel() {
    document.querySelectorAll('[data-theme-label]').forEach(function (n) {
      n.textContent = root.getAttribute('data-theme') === 'dark' ? 'Dark' : 'Light';
    });
  }
  syncLabel();
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-theme-toggle]');
    if (t) {
      var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', cur);
      try { localStorage.setItem('nl-theme', cur); } catch (e) {}
      syncLabel(); return;
    }
    var fab = document.getElementById('fab');
    if (fab && !ev.target.closest('#fab')) fab.classList.remove('open');
  });
  // scroll reveal — elements with .reveal fade/rise in once they enter the viewport
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  window.__nl = { version: 'dir-html/1.1' };
})();
