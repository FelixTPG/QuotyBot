import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(join(dataDir, 'quotes.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    text         TEXT NOT NULL,
    author       TEXT NOT NULL DEFAULT 'Unknown',
    submitted_by TEXT NOT NULL DEFAULT 'system',
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT DEFAULT (datetime('now'))
  )
`);

// Migration for databases created before the review system existed:
// add the status column and treat all pre-existing quotes as approved.
try {
  db.exec("ALTER TABLE quotes ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'");
} catch {
  // column already exists — nothing to do
}

const { count } = db.prepare('SELECT COUNT(*) AS count FROM quotes').get();

if (count === 0) {
  db.exec('BEGIN');
  const insert = db.prepare(
    "INSERT INTO quotes (text, author, submitted_by, status) VALUES (?, ?, 'system', 'approved')",
  );
  for (const [text, author] of [
    ['The unexamined life is not worth living.', 'Socrates'],
    ['We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Aristotle'],
    ['In the middle of difficulty lies opportunity.', 'Albert Einstein'],
    ['The only true wisdom is in knowing you know nothing.', 'Socrates'],
    ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
  ]) {
    insert.run(text, author);
  }
  db.exec('COMMIT');
}

export const getRandom = () =>
  db.prepare("SELECT * FROM quotes WHERE status = 'approved' ORDER BY RANDOM() LIMIT 1").get();

export const getById = id =>
  db.prepare("SELECT * FROM quotes WHERE id = ? AND status = 'approved'").get(id);

export const getAnyById = id =>
  db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);

export const getCount = () =>
  db.prepare("SELECT COUNT(*) AS count FROM quotes WHERE status = 'approved'").get().count;

export const addPending = (text, author, submittedBy) => {
  const info = db
    .prepare("INSERT INTO quotes (text, author, submitted_by, status) VALUES (?, ?, ?, 'pending')")
    .run(text, author, submittedBy);
  return Number(info.lastInsertRowid);
};

export const setStatus = (id, status) =>
  db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id);

// --- Dashboard / moderation helpers ---------------------------------------

export const getAll = (status = null) =>
  status
    ? db.prepare('SELECT * FROM quotes WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT * FROM quotes ORDER BY id DESC').all();

export const countByStatus = () =>
  Object.fromEntries(
    db.prepare('SELECT status, COUNT(*) AS n FROM quotes GROUP BY status').all().map(r => [r.status, r.n]),
  );

export const addApproved = (text, author, submittedBy) =>
  Number(
    db
      .prepare("INSERT INTO quotes (text, author, submitted_by, status) VALUES (?, ?, ?, 'approved')")
      .run(text, author, submittedBy).lastInsertRowid,
  );

export const updateQuote = (id, text, author) =>
  db.prepare('UPDATE quotes SET text = ?, author = ? WHERE id = ?').run(text, author, id);

export const deleteQuote = id =>
  db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
