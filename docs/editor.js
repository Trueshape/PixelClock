(function () {
  var canvas = document.getElementById('led');
  var ed = document.getElementById('editor');
  var form = document.getElementById('ed-form');
  var current = {};
  function open() {
    window.pixel.getConfig().then(function (c) {
      current = c;
      document.getElementById('ed-text').value = c.text || '';
      document.getElementById('ed-color').value = c.color || '#ff5a36';
      document.getElementById('ed-speed').value = c.speed || 20;
      ed.classList.add('open');
      document.getElementById('ed-text').focus();
    });
  }
  function close() { ed.classList.remove('open'); }
  canvas.addEventListener('dblclick', function () {
    if (window.pixelMode && window.pixelMode() !== 0) return; // solo in modalità scorrimento testo
    open();
  });
  document.getElementById('ed-cancel').onclick = close;
  ed.addEventListener('click', function (e) { if (e.target === ed) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var next = Object.assign({}, current, {
      text: document.getElementById('ed-text').value.trim() || 'PixelClock',
      color: document.getElementById('ed-color').value,
      speed: Number(document.getElementById('ed-speed').value)
    });
    window.pixel.saveConfig(next);
    close();
  });
})();
