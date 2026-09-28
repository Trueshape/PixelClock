// fonts/clockFonts.js — 10 font pixel art per l'orologio (solo cifre 0-9 e ':').
// Ogni font: { name, rows, scale, glyphs }. glyphs[ch] è un array di colonne:
// un intero per colonna, bit 0 = riga più in alto (stesso formato di font.js).
// Nessun font di sistema: sono tutti disegnati pixel per pixel o generati da regole.

// --- Generatore "a 7 segmenti", usato per 5 font di taglie diverse -------------------
const SEG = {
  0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc',
  5: 'afgcd', 6: 'afgecd', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg',
};

function buildSevenSegFont(name, W, H, scale) {
  const mid = Math.floor(H / 2);
  function digitGrid(segs) {
    const g = Array.from({ length: H }, () => Array(W).fill(false));
    const has = (s) => segs.includes(s);
    if (has('a')) for (let x = 0; x < W; x++) g[0][x] = true;
    if (has('d')) for (let x = 0; x < W; x++) g[H - 1][x] = true;
    if (has('g')) for (let x = 0; x < W; x++) g[mid][x] = true;
    if (has('f')) for (let y = 1; y < mid; y++) g[y][0] = true;
    if (has('e')) for (let y = mid + 1; y < H - 1; y++) g[y][0] = true;
    if (has('b')) for (let y = 1; y < mid; y++) g[y][W - 1] = true;
    if (has('c')) for (let y = mid + 1; y < H - 1; y++) g[y][W - 1] = true;
    return g;
  }
  function gridToCols(g, w) {
    const cols = [];
    for (let x = 0; x < w; x++) {
      let bits = 0;
      for (let y = 0; y < H; y++) if (g[y][x]) bits |= 1 << y;
      cols.push(bits);
    }
    return cols;
  }
  const glyphs = {};
  for (const d of Object.keys(SEG)) glyphs[d] = gridToCols(digitGrid(SEG[d]), W);
  const colonW = 1;
  const cg = Array.from({ length: H }, () => Array(colonW).fill(false));
  cg[Math.round(H * 0.3)][0] = true;
  cg[Math.round(H * 0.7)][0] = true;
  glyphs[':'] = gridToCols(cg, colonW);
  return { name, rows: H, scale, glyphs };
}

// --- Font "dot matrix classico" e "grassetto", presi dal font 5x7 di font.js --------
function buildDotMatrixFont(name, scale) {
  const glyphs = {};
  for (const d of '0123456789') glyphs[d] = glyph(d).slice();
  glyphs[':'] = glyph(':').slice(1, 4).filter((c) => c);
  return { name, rows: 7, scale, glyphs };
}

// Grassetto: stesso disegno del dot matrix, ma ogni tratto è ispessito di una colonna.
function buildBoldFont(name, scale) {
  const base = buildDotMatrixFont(name, scale);
  for (const ch of Object.keys(base.glyphs)) {
    const c = base.glyphs[ch];
    base.glyphs[ch] = [...c, 0].map((bits, i) => bits | (c[i - 1] || 0));
  }
  return base;
}

// --- Font "dadi": ogni cifra come i pallini di un dado/domino, griglia 3x3 ----------
function buildDicePipsFont(name, scale) {
  const PIPS = {
    0: [[1, 0], [0, 1], [2, 1], [1, 2]],
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
    7: [[0, 0], [2, 0], [1, 0], [1, 1], [0, 2], [2, 2]],
    8: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2], [1, 1]],
    9: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  };
  const glyphs = {};
  for (const d of Object.keys(PIPS)) {
    const g = [[false, false, false], [false, false, false], [false, false, false]];
    for (const [x, y] of PIPS[d]) g[y][x] = true;
    glyphs[d] = [0, 1, 2].map((x) => (g[0][x] ? 1 : 0) | (g[1][x] ? 2 : 0) | (g[2][x] ? 4 : 0));
  }
  glyphs[':'] = [0b101]; // due puntini, riga di mezzo spenta
  return { name, rows: 3, scale, glyphs };
}

// --- Font disegnati a mano: ogni cifra come righe di testo ('#' = acceso) --------------
function buildRowFont(name, scale, rowsByChar) {
  const glyphs = {};
  let rows = 0;
  for (const [ch, lines] of Object.entries(rowsByChar)) {
    rows = lines.length;
    const w = lines[0].length;
    glyphs[ch] = [];
    for (let x = 0; x < w; x++) {
      let bits = 0;
      lines.forEach((line, y) => { if (line[x] === '#') bits |= 1 << y; });
      glyphs[ch].push(bits);
    }
  }
  return { name, rows, scale, glyphs };
}

const PIXEL_3X5 = {
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['###', '..#', '###', '#..', '###'], 3: ['###', '..#', '.##', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '###'],
  ':': ['.', '#', '.', '#', '.'],
};

const ROUNDED_4X7 = {
  0: ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  1: ['..#.', '.##.', '..#.', '..#.', '..#.', '..#.', '.###'],
  2: ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
  3: ['.##.', '#..#', '...#', '..#.', '...#', '#..#', '.##.'],
  4: ['...#', '..##', '.#.#', '#..#', '####', '...#', '...#'],
  5: ['####', '#...', '###.', '...#', '...#', '#..#', '.##.'],
  6: ['.##.', '#...', '#...', '###.', '#..#', '#..#', '.##.'],
  7: ['####', '...#', '..#.', '..#.', '.#..', '.#..', '.#..'],
  8: ['.##.', '#..#', '#..#', '.##.', '#..#', '#..#', '.##.'],
  9: ['.##.', '#..#', '#..#', '.###', '...#', '...#', '.##.'],
  ':': ['.', '.', '#', '.', '#', '.', '.'],
};

// prettier-ignore
const CLOCK_FONTS = [
  // Vincolo: rows*scale <= 16 e 4 cifre + ':' larghe al massimo 64 LED.
  buildSevenSegFont('7 segmenti mini', 3, 5, 2),
  buildSevenSegFont('7 segmenti piccolo', 5, 7, 2),
  buildSevenSegFont('7 segmenti medio', 7, 13, 1),
  buildSevenSegFont('7 segmenti alto', 9, 15, 1),
  buildSevenSegFont('7 segmenti largo', 12, 9, 1),
  buildDotMatrixFont('Dot matrix classico', 2),
  buildBoldFont('Dot matrix grassetto', 2),
  buildDicePipsFont('Dadi', 3),
  buildRowFont('Pixel 3x5', 3, PIXEL_3X5),
  buildRowFont('Arrotondato', 2, ROUNDED_4X7),
];
