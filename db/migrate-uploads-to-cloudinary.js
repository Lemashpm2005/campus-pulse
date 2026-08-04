// Run with: node db/migrate-uploads-to-cloudinary.js
// Uploads every file in public/uploads/ to Cloudinary, then updates any
// articles.cover_image_url or users.avatar_url that still points at the
// old local /uploads/... path to use the new Cloudinary URL instead.

const fs = require('fs');
const path = require('path');
const db = require('./database');
const cloudinary = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

async function run() {
  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  console.log(`Found ${files.length} local file(s) to migrate.\n`);

  const urlMap = {}; // '/uploads/filename.png' -> 'https://res.cloudinary.com/...'

  for (const filename of files) {
    const localPath = `/uploads/${filename}`;
    const fullPath = path.join(uploadsDir, filename);

    try {
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: 'campus-pulse/migrated'
      });
      urlMap[localPath] = result.secure_url;
      console.log(`Uploaded: ${filename} -> ${result.secure_url}`);
    } catch (err) {
      console.error(`FAILED to upload ${filename}:`, err.message);
    }
  }

  console.log('\nUpdating database records...\n');

  let articleUpdates = 0;
  const articles = db.prepare("SELECT id, cover_image_url FROM articles WHERE cover_image_url LIKE '/uploads/%'").all();
  for (const a of articles) {
    const newUrl = urlMap[a.cover_image_url];
    if (newUrl) {
      db.prepare('UPDATE articles SET cover_image_url = ? WHERE id = ?').run(newUrl, a.id);
      articleUpdates++;
      console.log(`Article #${a.id}: ${a.cover_image_url} -> ${newUrl}`);
    }
  }

  let userUpdates = 0;
  const users = db.prepare("SELECT id, avatar_url FROM users WHERE avatar_url LIKE '/uploads/%'").all();
  for (const u of users) {
    const newUrl = urlMap[u.avatar_url];
    if (newUrl) {
      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(newUrl, u.id);
      userUpdates++;
      console.log(`User #${u.id}: ${u.avatar_url} -> ${newUrl}`);
    }
  }

  console.log(`\nDone. ${Object.keys(urlMap).length} file(s) uploaded to Cloudinary.`);
  console.log(`${articleUpdates} article(s) updated, ${userUpdates} user(s) updated.`);
  console.log('\nYou can now safely delete the old local files with: rm -rf public/uploads/*');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
