
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemCertificates: () => ipcRenderer.invoke('get-system-certificates'),
  platform: process.platform,
});
