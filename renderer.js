// renderer.js — Disegna la griglia LED 64x16 e gestisce i moduli (testo che scorre, orologio).
const COLS = 64, ROWS = 16;
const PITCH = 8;          // pixel dello schermo per ogni LED
const SCALE = 2;          // ogni punto del font = 2x2 LED
const Y_OFFSET = 1;       // centra 7*2 = 14 righe su 16

const canvas = document.getElementById('led');
const ctx = canvas.getContext('2d');
canvas.width = COLS * PITCH;
canvas.height = ROWS * PITCH;

let cfg = { text: '', color: '#ff5a36', clockColor: '#ffffff', speed: 20 };
let last = performance.now();

// Trasforma il testo in un array di colonne (bitmask a 7 righe), già scalate in orizzontale.
function buildColumns(text) {
  const out = [];
  for (const ch of text) {
    const cols = glyph(ch);
    // i due punti occupano solo la colonna centrale, così l'ora sta in 64 LED
    const used = ch === ':' ? cols.slice(1, 4).filter((c) => c) : cols;
    for (const col of used) for (let s = 0; s < SCALE; s++) out.push(col);
    for (let s = 0; s < SCALE; s++) out.push(0); // spazio tra lettere
  }
  return out;
}

function drawLed(x, y, color) {
  ctx.fillStyle = color || '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

// Disegna 64 colonne di testo partendo da `start` (può essere negativo).
function drawColumns(columns, start, color) {
  for (let x = 0; x < COLS; x++) {
    const bits = columns[start + x] || 0;
    for (let y = 0; y < ROWS; y++) {
      const fy = Math.floor((y - Y_OFFSET) / SCALE);
      const on = y >= Y_OFFSET && fy < 7 && (bits >> fy) & 1;
      drawLed(x, y, on ? color : null);
    }
  }
}

// --- Moduli: ognuno ha enter() quando diventa attivo e draw(dt) a ogni frame ---

const scrollText = {
  columns: [], offset: 0,
  enter() { this.columns = buildColumns(cfg.text || ' '); this.offset = 0; },
  draw(dt) {
    this.offset += cfg.speed * dt;
    if (this.offset > this.columns.length) this.offset = -COLS;
    drawColumns(this.columns, Math.floor(this.offset), cfg.color);
  },
};

const clock = {
  enter() {},
  draw() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const sep = now.getMilliseconds() < 500 ? ':' : ' '; // due punti lampeggianti
    const cols = buildColumns(hh + ':' + mm);
    if (sep === ' ') for (let i = 24; i < 28; i++) cols[i] = 0; // spegne i due punti
    const width = cols.length - SCALE; // senza lo spazio finale
    drawColumns(cols, -Math.floor((COLS - width) / 2), cfg.clockColor);
  },
};

// Sagoma auto vista di lato, ispirata a un'auto pixel art con tettuccio, vetri, luci e ruote.
// Ogni riga: elenco di [colonna inizio, colonna fine, colore]. Colonne locali 0-33.
const CAR_COLORS = {
  roof: '#e0391c',   // bordo rosso del tettuccio
  body: '#ff8c3c',   // carrozzeria arancione
  glass: '#8fe3f0',  // vetro
  pillar: '#2a2a2a', // montante tra i vetri
  light: '#ffd23c',  // luci gialle
  trim: '#c23016',   // filo rosso sotto la carrozzeria
  wheel: '#333333',  // ruota
  hub: '#9a9a9a',    // mozzo
};
const CAR_SHAPE = [
  [[13, 20, 'roof']],
  [[11, 12, 'roof'], [13, 20, 'glass'], [21, 22, 'roof']],
  [[9, 10, 'roof'], [11, 15, 'glass'], [16, 17, 'pillar'], [18, 23, 'glass'], [24, 25, 'roof']],
  [[6, 27, 'body']],
  [[3, 30, 'body']],
  [[0, 1, 'light'], [2, 31, 'body'], [32, 33, 'light']],
  [[0, 33, 'trim']],
  [[4, 10, 'wheel'], [23, 29, 'wheel']],
  [[4, 5, 'wheel'], [6, 8, 'hub'], [9, 10, 'wheel'], [23, 24, 'wheel'], [25, 27, 'hub'], [28, 29, 'wheel']],
];
const CAR_W = 34, CAR_H = CAR_SHAPE.length;
const CAR_X = Math.floor((COLS - CAR_W) / 2);
const CAR_Y = Math.floor((ROWS - CAR_H) / 2);

// Sfondo statico dietro l'auto: linea d'orizzonte + un paio di nuvole.
function drawCarBackground() {
  for (let x = 0; x < COLS; x++) drawLed(x, CAR_Y + CAR_H + 1, '#333');
  const cloud = (x, y) => { drawLed(x, y, '#2b2b2b'); drawLed(x + 1, y, '#2b2b2b'); drawLed(x + 1, y - 1, '#2b2b2b'); };
  cloud(4, 2);
  cloud(54, 3);
}

const car = {
  phase: 0,
  enter() { this.phase = 0; },
  draw(dt) {
    this.phase += dt;
    const period = 0.5; // secondi per un rimbalzo completo, sul posto
    const t = (this.phase % period) / period;
    const wave = Math.sin(t * Math.PI * 2);
    const bounce = Math.round(wave * 1.4); // -1, 0, 1: su e giù come un cartone
    const grounded = wave < -0.3;          // ruote a terra: mostra la polvere

    drawCarBackground();
    for (let row = 0; row < CAR_H; row++) {
      const y = CAR_Y + row + bounce;
      if (y < 0 || y >= ROWS) continue;
      for (const [c0, c1, key] of CAR_SHAPE[row]) {
        for (let col = c0; col <= c1; col++) drawLed(CAR_X + col, y, CAR_COLORS[key]);
      }
    }
    if (grounded) {
      const dustY = CAR_Y + CAR_H;
      if (dustY < ROWS) {
        drawLed(CAR_X + 7, dustY, '#555');
        drawLed(CAR_X + 26, dustY, '#555');
      }
    }
  },
};

const modules = [scrollText, clock, car];
let current = 0;

function nextModule() {
  current = (current + 1) % modules.length;
  modules[current].enter();
}

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  modules[current].draw(dt);
  requestAnimationFrame(frame);
}

function applyConfig(next) {
  cfg = { ...cfg, ...next };
  modules[current].enter();
}

document.getElementById('next').onclick = nextModule;
document.getElementById('settings').onclick = () => window.pixel.openConfig();
document.getElementById('close').onclick = () => window.pixel.quit();
window.pixel.onConfig(applyConfig);

window.pixel.getConfig().then((c) => {
  applyConfig(c);
  requestAnimationFrame(frame);
});
