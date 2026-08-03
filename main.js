const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;
let mainWindow = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'perfume.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      price       REAL    NOT NULL DEFAULT 0,
      stock       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function registerIpcHandlers() {
  ipcMain.handle('products:list', () => {
    return db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  });

  ipcMain.handle('products:add', (_event, { name, description = '', price = 0, stock = 0 }) => {
    const result = db
      .prepare('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)')
      .run(name, description, price, stock);
    return db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  });

  ipcMain.handle('products:update', (_event, { id, name, description = '', price = 0, stock = 0 }) => {
    db.prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?')
      .run(name, description, price, stock, id);
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  });

  ipcMain.handle('products:delete', (_event, id) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('app:info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    title: 'متجر العطور',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  if (process.env.SMOKE_TEST) {
    mainWindow.webContents.on('console-message', (_e, _level, message) => {
      console.log('RENDERER:', message);
    });
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('WINDOW_LOADED_OK');
      app.exit(0);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    db = null;
  }
});
