/**
 * Electron Main Process – EyeAI Desktop
 * ======================================
 * Opens a window loading index.html (the UI).
 * The UI calls the Flask backend at http://localhost:5001.
 * Make sure to start the Flask server before opening the desktop app.
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1100,
    height: 750,
    minWidth:  800,
    minHeight: 600,
    title: 'EyeAI – Eye Disease Detector',
    backgroundColor: '#04060f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Try to use icon if available
    ...(fs.existsSync(path.join(__dirname, 'icon.ico')) ? { icon: path.join(__dirname, 'icon.ico') } : {}),
  });

  mainWindow.loadFile('index.html');

  // Custom menu
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Open Image', accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.executeJavaScript('document.getElementById("file-input").click()') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Open Backend Docs', click: () => shell.openExternal('http://localhost:5001/health') },
        { label: 'GitHub / Kaggle Dataset', click: () => shell.openExternal('https://www.kaggle.com/datasets/gunavenkatdoddi/eye-diseases-classification') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC: Open file dialog from renderer
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'] }],
  });
  return result.canceled ? null : result.filePaths[0];
});
