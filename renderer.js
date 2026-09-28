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

const TEXT_PALETTE = ['#ff5a36', '#3ba7ff', '#7cff6b', '#ffe066', '#ff6bd6', '#ffffff'];
const scrollText = {
  columns: [], offset: 0, colorIndex: -1, // -1 = usa cfg.color
  enter() { this.columns = buildColumns(cfg.text || ' '); this.offset = 0; },
  variant() { this.colorIndex = (this.colorIndex + 1) % TEXT_PALETTE.length; },
  draw(dt) {
    this.offset += cfg.speed * dt;
    if (this.offset > this.columns.length) this.offset = -COLS;
    const color = this.colorIndex === -1 ? cfg.color : TEXT_PALETTE[this.colorIndex];
    drawColumns(this.columns, Math.floor(this.offset), color);
  },
};

// Costruisce le colonne per un font dell'orologio (variabile per altezza/larghezza/scala)
// a partire da CLOCK_FONTS. Restituisce anche l'intervallo di colonne dei due punti,
// utile per farli lampeggiare senza doverlo ricalcolare al volo.
function buildFontColumns(font, text) {
  const out = [];
  let colonRange = null;
  for (const ch of text) {
    const glyph = font.glyphs[ch] || font.glyphs['0'];
    if (ch === ':') colonRange = [out.length, out.length + glyph.length * font.scale];
    for (const col of glyph) for (let s = 0; s < font.scale; s++) out.push(col);
    for (let s = 0; s < font.scale; s++) out.push(0); // spazio tra caratteri
  }
  return { columns: out, colonRange };
}

function drawFontColumns(font, columns, start, color) {
  const h = font.rows * font.scale;
  const yOffset = Math.floor((ROWS - h) / 2);
  for (let x = 0; x < COLS; x++) {
    const bits = columns[start + x] || 0;
    for (let y = 0; y < ROWS; y++) {
      const fy = Math.floor((y - yOffset) / font.scale);
      const on = y >= yOffset && fy >= 0 && fy < font.rows && (bits >> fy) & 1;
      drawLed(x, y, on ? color : null);
    }
  }
}

const clock = {
  fontIndex: 0,
  enter() {},
  variant() { this.fontIndex = (this.fontIndex + 1) % CLOCK_FONTS.length; },
  draw() {
    const font = CLOCK_FONTS[this.fontIndex];
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const blinkOff = now.getMilliseconds() >= 500; // due punti lampeggianti
    const { columns, colonRange } = buildFontColumns(font, hh + ':' + mm);
    if (blinkOff && colonRange) for (let i = colonRange[0]; i < colonRange[1]; i++) columns[i] = 0;
    const width = columns.length - font.scale; // senza lo spazio finale
    drawFontColumns(font, columns, -Math.floor((COLS - width) / 2), cfg.clockColor);
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

// Scena di sfondo che riempie OGNI pixel della griglia: cielo a bande, sole/luna, nuvole/stelle,
// prato e strada. Tre temi, ciclabili col pulsante blu.
const CAR_THEMES = [
  { name: 'Giorno', sky: ['#1f6fb2', '#3f93d6', '#7fc4ef', '#bfe6fb'], grass: '#4f8f3a', road: '#3a3a3a',
    lane: '#e8c94a', glow: '#ffe066', deco: '#ffffff', body: '#d81e2c' },
  { name: 'Tramonto', sky: ['#7a2a5c', '#c04a4a', '#e8823f', '#f6c15a'], grass: '#3c6e2a', road: '#2e2a33',
    lane: '#ffd27a', glow: '#ffcf4d', deco: '#ffb27a', body: '#e0391c' },
  { name: 'Notte', sky: ['#050818', '#0d1230', '#151c40', '#1f2a55'], grass: '#16321c', road: '#161616',
    lane: '#8a8a55', glow: '#dfe6ff', deco: '#ffffff', body: '#3ba7ff' },
];

function drawCarBackground(theme) {
  for (let y = 0; y < ROWS; y++) {
    let color;
    if (y < 8) color = theme.sky[Math.floor(y / 2)];
    else if (y < 10) color = theme.grass;
    else color = theme.road;
    for (let x = 0; x < COLS; x++) drawBlock(x, y, color);
  }
  for (let x = 0; x < COLS; x += 6) {
    drawBlock(x, 12, theme.lane);
    drawBlock(x + 1, 12, theme.lane);
  }
  // sole/luna
  const glow = (x, y) => drawBlock(x, y, theme.glow);
  glow(3, 1); glow(4, 1); glow(3, 2); glow(4, 2);
  // nuvole/stelle
  const cloud = (x, y) => { drawBlock(x, y, theme.deco); drawBlock(x + 1, y, theme.deco); drawBlock(x + 1, y - 1, theme.deco); drawBlock(x + 2, y, theme.deco); };
  cloud(46, 2);
  cloud(56, 4);
}

const car = {
  phase: 0, themeIndex: 0,
  enter() { this.phase = 0; },
  variant() { this.themeIndex = (this.themeIndex + 1) % CAR_THEMES.length; },
  draw(dt) {
    this.phase += dt;
    const period = 0.5; // secondi per un rimbalzo completo, sul posto
    const t = (this.phase % period) / period;
    const wave = Math.sin(t * Math.PI * 2);
    const bounce = Math.round(wave * 1.4); // -1, 0, 1: su e giù come un cartone
    const grounded = wave < -0.3;          // ruote a terra: mostra la polvere
    const theme = CAR_THEMES[this.themeIndex];
    const colors = { ...CAR_COLORS, body: theme.body };

    drawCarBackground(theme);
    for (let row = 0; row < CAR_H; row++) {
      const y = CAR_Y + row + bounce;
      if (y < 0 || y >= ROWS) continue;
      for (const [c0, c1, key] of CAR_SHAPE[row]) {
        for (let col = c0; col <= c1; col++) drawBlock(CAR_X + col, y, colors[key]);
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

function variantModule() {
  const m = modules[current];
  if (m.variant) m.variant();
}

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  try {
    modules[current].draw(dt);
  } catch (err) {
    console.error('Errore nel modulo', current, err); // non blocca il loop: si vede nero ma i bottoni restano vivi
  }
  requestAnimationFrame(frame);
}

function applyConfig(next) {
  cfg = { ...cfg, ...next };
  modules[current].enter();
}

document.getElementById('next').onclick = nextModule;
document.getElementById('variant').onclick = variantModule;
document.getElementById('settings').onclick = () => window.pixel.openConfig();
document.getElementById('close').onclick = () => window.pixel.quit();
window.pixel.onConfig(applyConfig);

window.pixel.getConfig().then((c) => {
  applyConfig(c);
  requestAnimationFrame(frame);
});
