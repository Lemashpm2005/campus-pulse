// Run with: node db/migrate-v3.js
// Adds an "active" column to users so editors can deactivate a journalist
// without deleting their account (which would break authorship on past stories).

const db = require('./database');

const columns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

if (!columns.includes('active')) {
  db.exec(`ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1`);
  console.log('Added "active" column to users (existing accounts set to active).');
} else {
  console.log('"active" column already exists — nothing to do.');
}
