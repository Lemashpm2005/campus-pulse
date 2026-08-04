// Run with: node db/migrate-v2.js
// Adds an "approved" column to users (existing accounts are auto-approved).
// Safe to re-run.

const db = require('./database');

const columns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

if (!columns.includes('approved')) {
  db.exec(`ALTER TABLE users ADD COLUMN approved INTEGER NOT NULL DEFAULT 1`);
  console.log('Added "approved" column to users (existing accounts set to approved).');
} else {
  console.log('"approved" column already exists — nothing to do.');
}
