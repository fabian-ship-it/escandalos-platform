import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '..', 'data', 'escandalos.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'verifier' CHECK(role IN ('admin', 'verifier')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scandals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived')),
      color TEXT NOT NULL DEFAULT '#DC2626',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scandal_people (
      id TEXT PRIMARY KEY,
      scandal_id TEXT NOT NULL REFERENCES scandals(id) ON DELETE CASCADE,
      person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      relationship TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(scandal_id, person_id)
    );

    CREATE TABLE IF NOT EXISTS tips (
      id TEXT PRIMARY KEY,
      scandal_id TEXT NOT NULL REFERENCES scandals(id) ON DELETE CASCADE,
      person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
      person_name_suggestion TEXT,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      reviewer_id TEXT REFERENCES users(id),
      review_note TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tip_files (
      id TEXT PRIMARY KEY,
      tip_id TEXT NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      scandal_id TEXT NOT NULL REFERENCES scandals(id) ON DELETE CASCADE,
      person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
      tip_id TEXT REFERENCES tips(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      evidence_type TEXT NOT NULL DEFAULT 'document' CHECK(evidence_type IN ('document', 'image', 'link', 'testimony')),
      file_path TEXT,
      original_file_name TEXT,
      link_url TEXT,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tips_scandal ON tips(scandal_id);
    CREATE INDEX IF NOT EXISTS idx_tips_status ON tips(status);
    CREATE INDEX IF NOT EXISTS idx_evidence_scandal ON evidence(scandal_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_person ON evidence(person_id);
    CREATE INDEX IF NOT EXISTS idx_scandal_people_scandal ON scandal_people(scandal_id);
    CREATE INDEX IF NOT EXISTS idx_scandal_people_person ON scandal_people(person_id);
  `);
}

export default db;
