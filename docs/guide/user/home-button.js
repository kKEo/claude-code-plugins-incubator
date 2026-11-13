// Adds a "Home" icon to the menu bar that links to the landing page.
(function () {
  var bar = document.querySelector('#menu-bar .left-buttons');
  if (!bar) return;
  var a = document.createElement('a');
  a.className = 'icon-button';
  a.href = (typeof path_to_root === 'string' ? path_to_root : '') + '../';
  a.title = 'Home';
  a.setAttribute('aria-label', 'Home');
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
  bar.appendChild(a);
})();
