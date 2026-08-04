// Run with: node db/migrate-v4.js
// Adds an "is_chief" column so we can distinguish Chief Editor (Jackline)
// from Co-Editor (Eunice) — both keep role = 'EDITOR', but only the chief
// can approve registrations and deactivate people.

const db = require('./database');

const columns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

if (!columns.includes('is_chief')) {
  db.exec(`ALTER TABLE users ADD COLUMN is_chief INTEGER NOT NULL DEFAULT 0`);
  console.log('Added "is_chief" column to users.');
} else {
  console.log('"is_chief" column already exists.');
}

const result = db.prepare(`
  UPDATE users SET is_chief = 1 WHERE email = 'jacklinesopiato6@gmail.com'
`).run();
console.log(`Marked Jackline as Chief Editor (${result.changes} row updated).`);

// Also mark the Demo Editor as chief so the lecturer sees full functionality
db.prepare(`UPDATE users SET is_chief = 1 WHERE email = 'demo-editor@campuspulse.test'`).run();
console.log('Marked Demo Editor as Chief Editor for full demo access.');
