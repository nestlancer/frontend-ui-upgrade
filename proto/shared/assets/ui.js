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
  // top-right progress on long pages
  window.__nl = { version: 'dir-html/1.0' };
})();
