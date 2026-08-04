// Runs the full setup in order: schema + base accounts, then the KIMC stories,
// then the richer rewrite/new stories. Safe to re-run — every step checks
// before inserting/updating. Used as Render's build-time seed command.

console.log('=== Step 1: init-db ===');
require('./init.js');

console.log('\n=== Step 2: seed-kimc ===');
delete require.cache[require.resolve('./database')];
require('./seed-kimc.js');

console.log('\n=== Step 3: update-batch2 ===');
delete require.cache[require.resolve('./database')];
require('./update-batch2.js');

console.log('\n=== Step 4: migrate-v4 (chief editor flags) ===');
delete require.cache[require.resolve('./database')];
require('./migrate-v4.js');

console.log('\nAll seed steps complete.');
