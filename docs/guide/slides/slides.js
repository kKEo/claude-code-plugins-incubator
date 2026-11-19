// Deck helpers: a "Home" icon linking to the landing page, a slide counter, and Space / PageDown to advance.
(function () {
  var left = document.querySelector('#menu-bar .left-buttons, #mdbook-menu-bar .left-buttons');
  if (left) {
    var a = document.createElement('a');
    a.className = 'icon-button';
    a.href = (typeof path_to_root === 'string' ? path_to_root : '') + '../';
    a.title = 'Home';
    a.setAttribute('aria-label', 'Home');
    a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
    left.appendChild(a);
  }

  // Slide counter: position of the current page among the sidebar links.
  function count() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar a[href]')).filter(function (l) {
      return /\.html(#.*)?$/.test(l.getAttribute('href')) && !l.closest('.on-this-page');
    });
    if (!links.length) return false;
    var here = location.pathname.replace(/\/$/, '/index.html');
    var idx = -1;
    links.forEach(function (l, i) {
      if (idx < 0 && new URL(l.href).pathname === here) idx = i;
    });
    if (idx < 0) idx = 0;
    var right = document.querySelector('#menu-bar .right-buttons, #mdbook-menu-bar .right-buttons');
    if (!right) return true;
    var el = document.getElementById('slide-counter') || document.createElement('span');
    el.id = 'slide-counter';
    el.textContent = (idx + 1) + ' / ' + links.length;
    right.insertBefore(el, right.firstChild);
    return true;
  }
  var tries = 0;
  (function retry() { if (!count() && tries++ < 20) setTimeout(retry, 100); })();

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var sel = null;
    if (e.key === ' ' && !e.shiftKey || e.key === 'PageDown') sel = 'a.nav-chapters.next, a.mobile-nav-chapters.next';
    else if (e.key === ' ' && e.shiftKey || e.key === 'PageUp') sel = 'a.nav-chapters.previous, a.mobile-nav-chapters.previous';
    if (!sel) return;
    var link = document.querySelector(sel);
    if (link) { e.preventDefault(); location.href = link.href; }
  });
})();
