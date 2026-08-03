const { app } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

app.whenReady().then(() => {
  try {
    const db = new Database(':memory:');
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)');
    db.prepare('INSERT INTO t (name) VALUES (?)').run('hello');
    const row = db.prepare('SELECT * FROM t').get();
    console.log('SQLITE_OK', JSON.stringify(row));
    console.log('ELECTRON', process.versions.electron, 'NODE', process.versions.node, 'CHROME', process.versions.chrome);
    app.exit(0);
  } catch (err) {
    console.error('SMOKE_FAILED', err.message);
    app.exit(1);
  }
});
