import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const dbPath = process.env.DB_PATH ?? 'data/app.db';

// Ensure the directory exists before opening the database
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath, { create: true });

// Enable WAL mode for better concurrent read performance
db.run('PRAGMA journal_mode = WAL;');

// Notes table — auth tables are created separately via `npx auth@latest migrate`
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content JSON NOT NULL DEFAULT '{}',
    is_public INTEGER NOT NULL DEFAULT 0,
    public_slug TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)`);
