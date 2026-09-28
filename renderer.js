// renderer.js — Disegna la griglia LED 64x16 e fa scorrere il testo da destra a sinistra.
const COLS = 64, ROWS = 16;
const PITCH = 8;          // pixel dello schermo per ogni LED
const SCALE = 2;          // ogni punto del font = 2x2 LED
const Y_OFFSET = 1;       // centra 7*2 = 14 righe su 16

const canvas = document.getElementById('led');
const ctx = canvas.getContext('2d');
canvas.width = COLS * PITCH;
canvas.height = ROWS * PITCH;

let cfg = { text: '', color: '#ff5a36', speed: 20 };
let columns = [];         // una colonna di bit per ogni LED orizzontale del testo
let offset = 0;           // posizione di scorrimento, in LED
let last = performance.now();

// Trasforma il testo in un array di colonne (bitmask a 7 righe), già scalate in orizzontale.
function buildColumns(text) {
  const out = [];
  for (const ch of text) {
    for (const col of glyph(ch)) for (let s = 0; s < SCALE; s++) out.push(col);
    for (let s = 0; s < SCALE; s++) out.push(0); // spazio tra lettere
  }
  return out;
}

function applyConfig(next) {
  cfg = { ...cfg, ...next };
  columns = buildColumns(cfg.text || ' ');
  offset = -COLS; // riparte entrando da destra
}

function drawLed(x, y, on) {
  ctx.fillStyle = on ? cfg.color : '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function frame(now) {
  offset += (cfg.speed * (now - last)) / 1000;
  last = now;
  if (offset > columns.length) offset = -COLS;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const start = Math.floor(offset);
  for (let x = 0; x < COLS; x++) {
    const bits = columns[start + x] || 0;
    for (let y = 0; y < ROWS; y++) {
      const fy = Math.floor((y - Y_OFFSET) / SCALE);
      const on = y >= Y_OFFSET && fy < 7 && (bits >> fy) & 1;
      drawLed(x, y, on);
    }
  }
  requestAnimationFrame(frame);
}

document.getElementById('settings').onclick = () => window.pixel.openConfig();
document.getElementById('close').onclick = () => window.pixel.quit();
window.pixel.onConfig(applyConfig);

window.pixel.getConfig().then((c) => {
  applyConfig(c);
  offset = 0; // al primo avvio mostra subito il testo
  requestAnimationFrame(frame);
});
