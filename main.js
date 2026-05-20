const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Берет путь к папке, где физически лежит запущенный .exe файл
const dataPath = path.join(path.dirname(app.getPath('exe')), 'clyp-vault.json');

// Обработчик сохранения данных (получает данные от интерфейса и пишет в файл)
ipcMain.handle('save-data', async (event, data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("Save error:", err);
    return false;
  }
});

// Обработчик загрузки данных (читает файл и отдает интерфейсу)
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataPath)) {
      const fileData = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Load error:", err);
  }
  return null; // Возвращаем null, если файла нет (первый запуск)
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 850,
    minHeight: 600,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    center: true,
    icon: path.join(__dirname, 'assets/Clyp.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  // Перехватываем все попытки открыть новые окна/ссылки
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Отправляем ссылку в системный браузер
    require('electron').shell.openExternal(url);
    // Блокируем создание нового окна внутри Electron
    return { action: 'deny' };
  });

  ipcMain.on('window-min', () => win.minimize());
  ipcMain.on('window-max', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window-close', () => win.close());
}

// Базовые настройки автообновлятора
autoUpdater.autoDownload = false; // Спрашиваем перед скачиванием
autoUpdater.autoInstallOnAppQuit = true;

// Отправляем статусы обратно в интерфейс
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-status', { status: 'checking', msg: 'Проверка серверов...' });
});
autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-status', { status: 'available', msg: `Найдена версия ${info.version}` });
  // Начинаем скачивание
  autoUpdater.downloadUpdate(); 
});
autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-status', { status: 'latest', msg: 'У вас установлена последняя версия' });
});
autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('update-progress', Math.round(progressObj.percent));
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-status', { status: 'ready', msg: 'Готово к установке' });
  // autoUpdater.quitAndInstall(); // Раскомментируй, чтобы ставить сразу, либо добавь кнопку в UI
});

app.whenReady().then(() => {
  nativeTheme.themeSource = 'system';
  createWindow();
  // Слушаем запрос на проверку обновлений из интерфейса (app.js)
  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})