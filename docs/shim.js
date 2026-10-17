// Versione web: sostituisce il ponte Electron (window.pixel) con valori statici.
// Config da config.json accanto alla pagina; impostazioni e uscita non esistono nel browser.
(function () {
  var cfg = null;
  window.pixel = {
    getConfig: function () {
      return fetch('config.json').then(function (r) { return r.json(); })
        .catch(function () { return { text: 'PixelClock', color: '#ff5a36', speed: 20 }; })
        .then(function (c) { cfg = c; return c; });
    },
    onConfig: function () {},
    openConfig: function () {},
    quit: function () {}
  };
  var style = document.createElement('style');
  style.textContent = '#settings, #close { display: none !important; }';
  document.head.appendChild(style);
})();
