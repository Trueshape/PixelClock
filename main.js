// main.js — Processo principale Electron: crea la finestra sempre sopra, legge/osserva config.json.
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const SNAPSHOT = process.argv.includes('--snapshot');

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    return { text: 'config.json non valido', color: '#ff5a36', speed: 20 };
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 560,
    height: 168,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('index.html');

  // Ricarica il testo appena config.json viene salvato
  fs.watchFile(CONFIG_PATH, { interval: 500 }, () => {
    win.webContents.send('config', readConfig());
  });

  if (SNAPSHOT) {
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        const img = await win.webContents.capturePage();
        fs.writeFileSync(path.join(__dirname, 'snapshot.png'), img.toPNG());
        app.quit();
      }, 1500);
    });
  }
}

ipcMain.handle('get-config', () => readConfig());
ipcMain.on('open-config', () => shell.openPath(CONFIG_PATH));
ipcMain.on('quit', () => app.quit());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
