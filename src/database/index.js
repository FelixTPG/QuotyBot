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
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    text        TEXT    NOT NULL,
    author      TEXT    NOT NULL DEFAULT 'Unknown',
    submitted_by TEXT   NOT NULL DEFAULT 'system',
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM quotes').get();

if (count === 0) {
  db.exec('BEGIN');
  const insert = db.prepare('INSERT INTO quotes (text, author, submitted_by) VALUES (?, ?, ?)');
  for (const [text, author] of [
    ['The unexamined life is not worth living.', 'Socrates'],
    ['We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Aristotle'],
    ['In the middle of difficulty lies opportunity.', 'Albert Einstein'],
    ['The only true wisdom is in knowing you know nothing.', 'Socrates'],
    ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
  ]) {
    insert.run(text, author, 'system');
  }
  db.exec('COMMIT');
}

export const getRandom = () => db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1').get();
export const getCount  = () => db.prepare('SELECT COUNT(*) AS count FROM quotes').get().count;
export const addQuote  = (text, author, submittedBy) =>
  db.prepare('INSERT INTO quotes (text, author, submitted_by) VALUES (?, ?, ?)').run(text, author, submittedBy);
