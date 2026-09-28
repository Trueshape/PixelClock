2026-09-28 — Electron — alwaysOnTop + finestra trasparente in una riga
2026-09-28 — Sempre sopra, non dietro le finestre — WorkerW rimandato, richiede API native
2026-09-28 — Griglia 64x16, font 5x7 scalato 2x — look Ulanzi Pixbar
2026-09-28 — Impostazioni via config.json osservato — niente UI da costruire per la v1
2026-09-28 — Exe portatile (electron-builder), config.json accanto all'exe — l'utente vuole programmi self-contained
2026-09-28 — Modulo auto in pixel art, rimbalzo verticale discreto (no sine continuo) — piu' 'da cartone animato'
2026-09-28 — Auto ridisegnata a colori (rosso/arancio/azzurro/giallo) su riferimento utente, sfondo con orizzonte e nuvole
2026-09-29 — Auto rifatta a pixel pieni (drawBlock) con scena completa (cielo/prato/strada), niente sfondo nero; sagoma piu' sportiva e ruote separate dal corpo
2026-09-29 — Pulsante blu 'variante' per modulo: 10 font pixel art per l'orologio (fonts/clockFonts.js), palette colori per il testo, 3 scene giorno/tramonto/notte per l'auto
2026-09-29 — Bug: exe senza fonts/ (files di electron-builder) -> loop bloccato. Fix: fonts/** nel build, try/catch nel frame, test sull'exe impacchettato; font ridimensionati per stare in 64x16
