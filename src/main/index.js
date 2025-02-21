const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const db = require('../database/db');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 1024,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, '../../node_modules', '.bin', 'electron')
        });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers for database operations
ipcMain.handle('save-log', async (event, logData) => {
    try {
        const id = await db.savelog(logData);
        return { success: true, id };
    } catch (error) {
        console.error('Error saving log:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-log', async (event, logData) => {
    try {
        await db.updateLog(logData);
        return { success: true };
    } catch (error) {
        console.error('Error updating log:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-logs', async (event, page = 1) => {
    try {
        const logs = await db.getLogs(page);
        const total = await db.getLogsCount();
        return { logs, total };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { logs: [], total: 0 };
    }
});

ipcMain.handle('get-today-log', async () => {
    try {
        const log = await db.getTodayLog();
        return log;
    } catch (error) {
        console.error('Error fetching today\'s log:', error);
        return null;
    }
});

ipcMain.handle('delete-log', async (event, id) => {
    try {
        await db.deleteLog(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting log:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('reset-database', async () => {
    try {
        await db.resetDatabase();
        return { success: true };
    } catch (error) {
        console.error('Error resetting database:', error);
    }
}); 