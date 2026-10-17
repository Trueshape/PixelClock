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

// Pulsante di riserva: visibile in modalità testo scorrevole, apre lo stesso editor.
(function () {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '✎ Modifica testo';
  btn.setAttribute('aria-label', 'Modifica testo scorrevole');
  btn.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;font:14px system-ui,sans-serif;padding:8px 14px;border-radius:8px;border:1px solid #eceae4;background:transparent;color:#eceae4;cursor:pointer;z-index:5';
  btn.addEventListener('click', function () {
    if (window.pixelMode && window.pixelMode() !== 0) return;
    document.getElementById('led').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  });
  document.body.appendChild(btn);
  setInterval(function () {
    btn.style.display = (window.pixelMode && window.pixelMode() === 0) ? '' : 'none';
  }, 300);
})();
