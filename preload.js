// preload.js — Ponte sicuro tra finestra e processo principale (config, apri impostazioni, esci).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pixel', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  onConfig: (cb) => ipcRenderer.on('config', (_e, cfg) => cb(cfg)),
  openConfig: () => ipcRenderer.send('open-config'),
  quit: () => ipcRenderer.send('quit'),
});
