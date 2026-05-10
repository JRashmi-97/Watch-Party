import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const initDb = async () => {
  db = await open({
    filename: './watchparty.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      videoId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      roomId TEXT,
      username TEXT,
      role TEXT,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
    );
  `);
  
  console.log('SQLite Database initialized successfully.');
};

export const getDb = () => {
  if (!db) throw new Error("Database not initialized");
  return db;
};
