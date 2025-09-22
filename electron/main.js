const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0a0a0a',
        title: 'Leakso',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.removeMenu();
    win.loadFile(path.join(__dirname, 'app.html'));
}

app.whenReady().then(() => {
    createWindow();
    
    // Check for updates only in packaged builds
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Auto-updater events
autoUpdater.on('update-available', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
        win.webContents.send('update-available');
    }
});

autoUpdater.on('update-downloaded', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
        win.webContents.send('update-downloaded');
    }
});

// IPC handlers
ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('check-for-updates', async () => {
    if (app.isPackaged) {
        try {
            await autoUpdater.checkForUpdatesAndNotify();
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e?.message || String(e) };
        }
    } else {
        return { ok: false, error: 'Updates are only available in packaged builds.' };
    }
});


