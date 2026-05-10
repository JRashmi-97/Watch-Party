import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export const initDb = async () => {
  const sqlJsDir = path.dirname(require.resolve('sql.js/package.json'));
  const wasmPath = path.join(sqlJsDir, 'dist', 'sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath).buffer as ArrayBuffer;

  const SQL = await initSqlJs({ wasmBinary });
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      videoId TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      roomId TEXT,
      username TEXT,
      role TEXT,
      joinedAt TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('SQLite (sql.js) Database initialized successfully.');
};

export const getDb = (): Database => {
  if (!db) throw new Error('Database not initialized');
  return db;
};
