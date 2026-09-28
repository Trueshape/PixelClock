# Overview file

- `main.js` — processo Electron: finestra sempre sopra, legge e osserva config.json, modalità --snapshot.
- `preload.js` — ponte sicuro finestra ↔ processo principale.
- `index.html` — cornice, canvas LED, pulsanti ⚙ e ×.
- `renderer.js` — disegna la griglia 64x16 e fa scorrere il testo.
- `font.js` — font pixel 5x7 ASCII.
- `config.json` — testo, colore, velocità.
- \`fonts/clockFonts.js\` — 10 font pixel art per l'orologio (7 segmenti x5 taglie, dot matrix, dot matrix grassetto, dadi, pixel 3x5, arrotondato).
