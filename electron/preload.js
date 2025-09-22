const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

function walkDirectory(startDir, extensions) {
    const results = [];
    try {
        const entries = fs.readdirSync(startDir);
        for (const entry of entries) {
            const fullPath = path.join(startDir, entry);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                results.push(...walkDirectory(fullPath, extensions));
            } else if (extensions.includes(path.extname(entry).toLowerCase())) {
                results.push(fullPath);
            }
        }
    } catch (err) {
        console.error(err);
    }
    return results;
}

contextBridge.exposeInMainWorld('leakedsongs', {
    scanMusic() {
        const exts = ['.mp3', '.m4a', '.wav', '.ogg'];
        // Resolve to the project music directory next to electron/
        const dir = path.resolve(path.join(__dirname, '..', 'music'));
        return walkDirectory(dir, exts).map(p => ({
            path: p,
            relative: path.relative(path.join(__dirname, '..'), p)
        }));
    },
    installUpdate: () => ipcRenderer.invoke('install-update'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback)
});


