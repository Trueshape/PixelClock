# PixelClock

Display LED 64x16 in pixel art, sempre sopra le altre finestre, con testo che scorre.

## Uso
- Doppio clic su `release/PixelClock.exe` (portatile: copialo dove vuoi).
- Al primo avvio crea `config.json` accanto all'exe.
- Trascina la cornice per spostarlo. Passa sopra col mouse: ⚙ apre config.json, × chiude.
- In `config.json` cambi `text`, `color` (hex) e `speed` (LED al secondo). Salvi e si aggiorna da solo.

## Sviluppo
    npm start        # avvia da sorgente
    npm run dist     # ricrea release/PixelClock.exe
