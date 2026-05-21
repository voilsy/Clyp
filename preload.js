const { contextBridge, ipcRenderer, webFrame } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-min'),
  maximizeWindow: () => ipcRenderer.send('window-max'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Управление масштабом интерфейса
  setZoom: (level) => webFrame.setZoomFactor(level),
  
  // Сохранение и загрузка данных
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),

  getVersion: () => ipcRenderer.invoke('get-version'), // <-- Добавить
  downloadUpdate: () => ipcRenderer.send('download-update'), // <-- Добавить

  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_event, percent) => callback(percent))
})