const { contextBridge, ipcRenderer, webFrame } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-min'),
  maximizeWindow: () => ipcRenderer.send('window-max'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  setZoom: (level) => webFrame.setZoomFactor(level),
  
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  writeBackup: (filename, data) => ipcRenderer.invoke('write-backup', { filename, data }),

  getVersion: () => ipcRenderer.invoke('get-version'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_event, percent) => callback(percent))
})