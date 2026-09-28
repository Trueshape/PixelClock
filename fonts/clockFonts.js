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

// --- Font "codice a barre": l'altezza della barra segue il valore della cifra -------
function buildBarCodeFont(name, scale) {
  const rows = 7;
  const glyphs = {};
  for (let d = 0; d <= 9; d++) {
    const h = Math.max(1, Math.round((d / 9) * rows));
    const bits = ((1 << h) - 1) << (rows - h);
    glyphs[String(d)] = [bits, bits, bits];
  }
  glyphs[':'] = [(1 << 1) | (1 << 5)];
  return { name, rows, scale, glyphs };
}

// --- Font "Braille": celle a 6 punti, i numerali standard Braille -------------------
function buildBrailleFont(name, scale) {
  // dot1=(0,0) dot2=(0,1) dot3=(0,2) dot4=(1,0) dot5=(1,1) dot6=(1,2)
  const DOTS = {
    1: [[0, 0]],
    2: [[0, 0], [0, 1]],
    3: [[0, 0], [1, 0]],
    4: [[0, 0], [1, 0], [1, 1]],
    5: [[0, 0], [1, 1]],
    6: [[0, 0], [0, 1], [1, 0]],
    7: [[0, 0], [0, 1], [1, 0], [1, 1]],
    8: [[0, 0], [0, 1], [1, 1]],
    9: [[0, 1], [1, 0]],
    0: [[0, 1], [1, 0], [1, 1]],
  };
  const glyphs = {};
  for (const d of Object.keys(DOTS)) {
    const g = [[false, false], [false, false], [false, false]];
    for (const [x, y] of DOTS[d]) g[y][x] = true;
    glyphs[d] = [0, 1].map((x) => (g[0][x] ? 1 : 0) | (g[1][x] ? 2 : 0) | (g[2][x] ? 4 : 0));
  }
  glyphs[':'] = [0b101];
  return { name, rows: 3, scale, glyphs };
}

// prettier-ignore
const CLOCK_FONTS = [
  buildSevenSegFont('7 segmenti mini', 3, 5, 2),
  buildSevenSegFont('7 segmenti piccolo', 5, 7, 2),
  buildSevenSegFont('7 segmenti medio', 7, 9, 2),
  buildSevenSegFont('7 segmenti alto', 7, 11, 2),
  buildSevenSegFont('7 segmenti largo', 9, 7, 2),
  buildDotMatrixFont('Dot matrix classico', 2),
  buildDotMatrixFont('Dot matrix grassetto', 3),
  buildDicePipsFont('Dadi', 3),
  buildBarCodeFont('Codice a barre', 3),
  buildBrailleFont('Braille', 3),
];
