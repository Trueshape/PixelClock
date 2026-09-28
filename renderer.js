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

// Pixel pieno (quadrato, senza spazi), per scene tipo la scheda "auto": nessun nero di fondo.
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PITCH, y * PITCH, PITCH, PITCH);
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

// Sagoma auto vista di lato, ASIMMETRICA: muso basso e paraurti a sinistra (fronte),
// cofano, abitacolo e alettone a destra (retro). Disegnata a pixel pieni (drawBlock),
// non a pallini, su uno sfondo che riempie tutta la griglia (niente nero).
// Ogni riga: elenco di [colonna inizio, colonna fine, colore]. Colonne locali 0-39.
const CAR_COLORS = {
  body: '#d81e2c',    // carrozzeria rossa
  bodyDark: '#a3121e',// ombra sotto la carrozzeria
  stripe: '#f2f2f2',  // fascia chiara decorativa
  glass: '#a7e6f5',   // vetro
  pillar: '#1a1a1a',  // montante tra i vetri
  bumper: '#2a2a2a',  // paraurti
  light: '#ffe066',   // fari
  wheel: '#161616',   // ruota
  hub: '#c9c9c9',     // mozzo
};
const CAR_SHAPE = [
  [[16, 27, 'body'], [33, 35, 'bumper']],                                    // tettuccio + alettone
  [[14, 15, 'body'], [16, 20, 'glass'], [21, 22, 'pillar'], [23, 26, 'glass'], [27, 28, 'body'], [31, 36, 'body']],
  [[6, 31, 'body'], [32, 37, 'body']],                                       // cofano + baule
  [[2, 37, 'body'], [38, 39, 'bumper']],                                     // il muso sale
  [[0, 1, 'light'], [2, 39, 'body']],                                        // faro anteriore, muso pieno
  [[0, 39, 'body']],                                                         // fiancata (skirt)
  [[6, 13, 'wheel'], [26, 33, 'wheel']],                                     // passaruota: le ruote spuntano qui
  [[6, 7, 'wheel'], [8, 11, 'hub'], [12, 13, 'wheel'],
   [26, 27, 'wheel'], [28, 31, 'hub'], [32, 33, 'wheel']],                   // ruote con mozzo
  [[6, 13, 'wheel'], [26, 33, 'wheel']],                                     // ruote (sotto)
];
const CAR_W = 40, CAR_H = CAR_SHAPE.length;
const CAR_X = Math.floor((COLS - CAR_W) / 2);
const CAR_Y = 2;

// Scena di sfondo che riempie OGNI pixel della griglia: cielo a bande, sole, nuvole, prato e strada.
const SKY_BANDS = ['#1f6fb2', '#3f93d6', '#7fc4ef', '#bfe6fb'];
function drawCarBackground() {
  for (let y = 0; y < ROWS; y++) {
    let color;
    if (y < 8) color = SKY_BANDS[Math.floor(y / 2)];
    else if (y < 10) color = '#4f8f3a'; // prato
    else color = '#3a3a3a';             // strada
    for (let x = 0; x < COLS; x++) drawBlock(x, y, color);
  }
  // strisce della strada
  for (let x = 0; x < COLS; x += 6) {
    drawBlock(x, 12, '#e8c94a');
    drawBlock(x + 1, 12, '#e8c94a');
  }
  // sole
  const sun = (x, y) => drawBlock(x, y, '#ffe066');
  sun(3, 1); sun(4, 1); sun(3, 2); sun(4, 2);
  // nuvole
  const cloud = (x, y) => { drawBlock(x, y, '#ffffff'); drawBlock(x + 1, y, '#ffffff'); drawBlock(x + 1, y - 1, '#ffffff'); drawBlock(x + 2, y, '#ffffff'); };
  cloud(46, 2);
  cloud(56, 4);
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
        for (let col = c0; col <= c1; col++) drawBlock(CAR_X + col, y, CAR_COLORS[key]);
      }
    }
    if (grounded) {
      const dustY = CAR_Y + CAR_H;
      if (dustY < ROWS) {
        drawBlock(CAR_X + 9, dustY, '#8a8a8a');
        drawBlock(CAR_X + 29, dustY, '#8a8a8a');
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
