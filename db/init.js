// Run with: npm run init-db
// Creates tables (if not present) and seeds demo data.
// Safe to re-run: it checks before inserting.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./database');

// 1. Create tables
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// 2. Seed users
const TEAM_PASSWORD = 'Pulse2026!';       // password for the 4 real team accounts
const DEMO_PASSWORD = 'CampusDemo2026!';  // password for the demo accounts (per brief)

const users = [
  {
    name: 'Jackline Sopiato',
    email: 'jacklinesopiato6@gmail.com',
    role: 'EDITOR',
    title: 'Group Leader & Chief Editor',
    bio: 'Leads the Campus Pulse team and has final say on everything that goes live.',
    avatar_url: '/img/placeholder-avatar.svg',
    password: TEAM_PASSWORD
  },
  {
    name: 'Eunice Wambui',
    email: 'wambuieunice032@gmail.com',
    role: 'EDITOR',
    title: 'Co-Editor',
    bio: 'Reviews submissions, polishes copy, and manages the publishing queue.',
    avatar_url: '/img/placeholder-avatar.svg',
    password: TEAM_PASSWORD
  },
  {
    name: 'Skylar Brilliane',
    email: 'skylarbrilliane@gmail.com',
    role: 'JOURNALIST',
    title: 'Journalist & Student Reporter',
    bio: 'Covers academics and campus life for Campus Pulse.',
    avatar_url: '/img/placeholder-avatar.svg',
    password: TEAM_PASSWORD
  },
  {
    name: 'Brian Nyakango',
    email: 'briannyakango27@gmail.com',
    role: 'JOURNALIST',
    title: 'Journalist & Student Reporter',
    bio: 'Covers sports and events for Campus Pulse.',
    avatar_url: '/img/placeholder-avatar.svg',
    password: TEAM_PASSWORD
  },
  {
    name: 'Demo Journalist',
    email: 'demo-journalist@campuspulse.test',
    role: 'JOURNALIST',
    title: 'Demo Account',
    bio: 'Guest account for lecturer evaluation (journalist view).',
    avatar_url: '/img/placeholder-avatar.svg',
    password: DEMO_PASSWORD
  },
  {
    name: 'Demo Editor',
    email: 'demo-editor@campuspulse.test',
    role: 'EDITOR',
    title: 'Demo Account',
    bio: 'Guest account for lecturer evaluation (editor view).',
    avatar_url: '/img/placeholder-avatar.svg',
    password: DEMO_PASSWORD
  }
];

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, avatar_url, bio, title)
  VALUES (@name, @email, @password_hash, @role, @avatar_url, @bio, @title)
`);
const findUser = db.prepare('SELECT id FROM users WHERE email = ?');

for (const u of users) {
  if (!findUser.get(u.email)) {
    const password_hash = bcrypt.hashSync(u.password, 10);
    insertUser.run({ ...u, password_hash });
    console.log(`Created user: ${u.email}`);
  }
}

// 3. Seed categories
const categories = ['Academics', 'Campus Sports', 'Technology', 'Events'];
const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
const findCategory = db.prepare('SELECT id FROM categories WHERE name = ?');

for (const name of categories) {
  if (!findCategory.get(name)) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    insertCategory.run(name, slug);
    console.log(`Created category: ${name}`);
  }
}

// 4. Seed a couple of sample articles so the homepage isn't empty
const getUserByEmail = (email) => db.prepare('SELECT id FROM users WHERE email = ?').get(email);
const getCategoryByName = (name) => db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
const findArticle = db.prepare('SELECT id FROM articles WHERE slug = ?');
const insertArticle = db.prepare(`
  INSERT INTO articles (title, slug, content, snippet, cover_image_url, status, author_id, category_id, published_at)
  VALUES (@title, @slug, @content, @snippet, @cover_image_url, @status, @author_id, @category_id, @published_at)
`);

const sampleArticles = [
  {
    title: 'Exam Schedule Announced for This Semester',
    slug: 'exam-schedule-announced',
    snippet: 'The registrar has released the final exam timetable — here is what students need to know.',
    content: 'The registrar\'s office has released the final examination timetable for this semester. Students are advised to check their portals for individual seating arrangements. Academic staff have confirmed that make-up exams will be scheduled two weeks after the main exam period for students with valid documented conflicts.\n\nThe administration has also reminded students that calculators and reference material will not be permitted in any of the core unit exams this term.',
    cover_image_url: 'https://picsum.photos/seed/campuspulse-exams/900/500',
    status: 'PUBLISHED',
    author_email: 'skylarbrilliane@gmail.com',
    category_name: 'Academics',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    title: 'Campus Tech Hackathon Draws Record Turnout',
    slug: 'campus-tech-hackathon-2026',
    snippet: 'Over 120 students competed in this year\'s 24-hour build challenge.',
    content: 'This year\'s Campus Tech Hackathon saw its largest turnout yet, with more than 120 students forming 30 teams to build projects overnight. Judges praised the range of ideas, from campus navigation apps to tools helping students split shared textbook costs.\n\nThe winning team built a tool that helps students find empty study rooms in real time using classroom booking data.',
    cover_image_url: 'https://picsum.photos/seed/campuspulse-hackathon/900/500',
    status: 'PUBLISHED',
    author_email: 'briannyakango27@gmail.com',
    category_name: 'Technology',
    published_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

for (const a of sampleArticles) {
  if (!findArticle.get(a.slug)) {
    const author = getUserByEmail(a.author_email);
    const category = getCategoryByName(a.category_name);
    insertArticle.run({
      title: a.title,
      slug: a.slug,
      content: a.content,
      snippet: a.snippet,
      cover_image_url: a.cover_image_url,
      status: a.status,
      author_id: author.id,
      category_id: category.id,
      published_at: a.published_at
    });
    console.log(`Created article: ${a.title}`);
  }
}

console.log('\nDatabase ready.');
console.log(`Team member login password: ${TEAM_PASSWORD}`);
console.log(`Demo account login password: ${DEMO_PASSWORD}`);
