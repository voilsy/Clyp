const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const dataPath = path.join(app.getPath('userData'), 'clyp-vault.json');
let mainWindow;

ipcMain.handle('save-data', async (event, data) => {
  try { fs.writeFileSync(dataPath, JSON.stringify(data)); return true; } 
  catch (err) { return false; }
});

ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataPath)) return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {}
  return null; 
});

ipcMain.handle('get-version', () => app.getVersion());

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1180, height: 760, minWidth: 850, minHeight: 600,
    autoHideMenuBar: true, frame: false, transparent: true, center: true,
    icon: path.join(__dirname, 'assets/Clyp.ico'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'preload.js'), devTools: false }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  ipcMain.on('window-min', () => mainWindow.minimize());
  ipcMain.on('window-max', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());
}

autoUpdater.autoDownload = false; 
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  if(mainWindow) mainWindow.webContents.send('update-status', { status: 'checking', msg: 'Checking updates server...' });
});
autoUpdater.on('update-available', (info) => {
  if(mainWindow) mainWindow.webContents.send('update-status', { 
    status: 'available', 
    msg: `Update found: v${info.version}`,
    version: info.version,
    notes: info.releaseNotes 
  });
});
autoUpdater.on('update-not-available', () => {
  if(mainWindow) mainWindow.webContents.send('update-status', { status: 'latest', msg: 'No updates available. You are on the latest version.' });
});
autoUpdater.on('download-progress', (progressObj) => {
  if(mainWindow) mainWindow.webContents.send('update-progress', Math.round(progressObj.percent));
});
autoUpdater.on('update-downloaded', () => {
  if(mainWindow) mainWindow.webContents.send('update-status', { status: 'ready', msg: 'Update downloaded. Ready to install.' });
});
autoUpdater.on('error', (err) => {
  if(mainWindow) mainWindow.webContents.send('update-status', { status: 'error', msg: `Error: ${err.message}` });
});

app.whenReady().then(() => {
  nativeTheme.themeSource = 'system';
  createWindow();
  
  ipcMain.on('check-for-updates', () => autoUpdater.checkForUpdates());
  ipcMain.on('download-update', () => autoUpdater.downloadUpdate());
  ipcMain.on('install-update', () => autoUpdater.quitAndInstall());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.handle('write-backup', async (event, { filename, data }) => {
  try {
    const backupsDir = path.join(app.getPath('userData'), 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const backupPath = path.join(backupsDir, filename);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Backup error:', err);
    return false;
  }
});