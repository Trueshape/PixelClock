# PROJECT.md — PixelClock

## 0. Esiste già?

- **Trovato:** Ulanzi U-Clock / Divoom (hardware fisico, a pagamento); skin Rainmeter (solo orologio, niente rotazione pixel art con immagini proprie).
- **Perché lo costruisco comunque:** voglio l'effetto Pixbar sul PC, gratis, con le mie immagini e le mie schermate.

## 1. Scopo

- **Nome:** PixelClock
- **Cosa fa, in una frase:** Questo progetto serve a mostrare sul desktop un display LED in pixel art che cicla tra ora, immagini e timer, per me alla scrivania.
- **Nicchia:** uso personale, setup scrivania estetico.
- **Finito quando:**
  1. Una finestrella senza bordi, sempre sopra, trascinabile, mostra una griglia LED.
  2. Cicla da sola tra ora, immagini mie (convertite in pixel) e timer Pomodoro "BUSY".
  3. Si avvia con un doppio clic (o all'avvio di Windows).
- **Non include:** modalità "dietro le finestre" (WorkerW), app mobile, hardware.

## 2. Tipo di progetto

[x] app desktop

## 3. Stack

**Scelta:** Electron + HTML/Canvas + JavaScript
**Motivo:** `alwaysOnTop` + finestra trasparente in una riga; il canvas disegna la griglia LED.

## 4. Stile

**Riferimento:** Ulanzi U-Clock II Pixbar (video in D:\Video). Griglia LED 64×16 (confermata), pixel tondi, fondo nero, bianco + un accento rosso/arancio.
**File DESIGN.md creato:** [ ] sì

## 5. Piano

**Versione 1:**
- [ ] Finestra Electron sempre sopra, trascinabile, griglia LED
- [ ] Schermata ora (font pixel)
- [ ] Schermata immagini (cartella → pixel art)
- [ ] Timer Pomodoro "BUSY" con conto alla rovescia
- [ ] Testo che scorre (frase personalizzata)
- [x] Pulsante rosso per passare al modulo successivo
- [x] Modulo orologio HH:MM
- [x] Testo che scorre
- [ ] Rotazione automatica

**Dopo (non ora):**
- Meteo, contatore follower
- Modalità desktop (WorkerW)
- Avvio automatico con Windows

## 6. Cartella e sicurezza del lavoro

- [x] Cartella in `D:\AI\Projects\PixelClock`
- [ ] `git init` e repo GitHub privato
- [ ] `README.md`, `CLAUDE.md`, `overview.md`, `decisions.md`

---

## Stato

- **Passo attuale:** v0.1 fatta — testo che scorre funzionante (commit 943ac09)
- **Prossima azione:** provare `npm start` e decidere la prossima schermata (ora, immagini o Pomodoro)
