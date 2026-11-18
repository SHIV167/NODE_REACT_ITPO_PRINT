import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const db = new DatabaseSync(path.join(__dirname, 'printpass.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    designation TEXT NOT NULL,
    email TEXT,
    company TEXT,
    photo_path TEXT,
    qr_token TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    qr_token TEXT NOT NULL,
    was_valid INTEGER NOT NULL,
    ip_address TEXT,
    verified_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );
`);

// Add new columns if they don't exist (for existing DBs)
try {
  db.exec('ALTER TABLE employees ADD COLUMN email TEXT');
} catch {}
try {
  db.exec('ALTER TABLE employees ADD COLUMN company TEXT');
} catch {}
