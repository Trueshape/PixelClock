// Versione web: sostituisce il ponte Electron (window.pixel) con il browser.
// Config = config.json della pagina, sovrascritto dalle modifiche salvate nel browser (localStorage).
(function () {
  var KEY = 'pixelclock-config';
  var listener = function () {};
  function stored() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  window.pixel = {
    getConfig: function () {
      return fetch('config.json').then(function (r) { return r.json(); })
        .catch(function () { return { text: 'PixelClock', color: '#ff5a36', clockColor: '#ffffff', speed: 20 }; })
        .then(function (c) { return Object.assign({}, c, stored() || {}); });
    },
    onConfig: function (cb) { listener = cb; },
    saveConfig: function (c) {
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* non disponibile */ }
      listener(c);
    },
    openConfig: function () {},
    quit: function () {}
  };
  var style = document.createElement('style');
  style.textContent = '#settings, #close { display: none !important; }';
  document.head.appendChild(style);
})();
