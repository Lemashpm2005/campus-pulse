// Run with: node db/seed-kimc.js
// Adds the 26 KIMC stories, split by category between Skylar (Academics + Sports)
// and Brian (Technology + Events). Safe to re-run — skips articles that already exist.

const db = require('./database');

const getUserId = (email) => db.prepare('SELECT id FROM users WHERE email = ?').get(email).id;
const getCategoryId = (name) => db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
const findArticle = db.prepare('SELECT id FROM articles WHERE slug = ?');

const insertArticle = db.prepare(`
  INSERT INTO articles (title, slug, content, snippet, cover_image_url, status, author_id, category_id, published_at)
  VALUES (@title, @slug, @content, @snippet, @cover_image_url, @status, @author_id, @category_id, @published_at)
`);

const SKYLAR = 'skylarbrilliane@gmail.com';
const BRIAN = 'briannyakango27@gmail.com';

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function daysAgoISO(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// status: 'PUBLISHED' (default), 'DRAFT', or 'PENDING_REVIEW'
const stories = [
  // ---------------- ACADEMIC (Skylar) ----------------
  {
    title: 'Final-Year Journalism Students Begin Major Newsroom Project',
    category: 'Academics', author: SKYLAR, daysAgo: 38,
    snippet: 'Final-year students launch a semester-long newsroom simulation producing print, radio, TV and online stories.',
    content: `Final-year journalism students have begun their semester-long newsroom project, a practical exercise that requires them to produce a weekly newspaper, radio bulletin, television package, and online story. The project is designed to simulate the operations of a professional multimedia newsroom.

Students spent Monday morning assigning beats such as politics, business, education, sports, and entertainment before heading into the field to gather stories. Lecturers supervising the exercise said the project tests reporting, interviewing, editing, and deadline-management skills.

"This is the closest students come to working in a real newsroom before graduation," said a senior journalism lecturer.

Many students admitted that meeting multiple deadlines in one week was challenging but said the exercise had improved their confidence.`
  },
  {
    title: 'Broadcasting Department Introduces Live News Production Classes',
    category: 'Academics', author: SKYLAR, daysAgo: 35,
    snippet: 'New live studio sessions push broadcasting students on teleprompter reading, camera switching and live interviewing.',
    content: `The Broadcasting Department has introduced live news production classes aimed at strengthening students' television presentation skills. The sessions involve real-time studio production, teleprompter reading, camera switching, and live interviewing.

During the first class, students produced a 15-minute mock news bulletin under strict timing rules. Instructors paused the broadcast several times to correct voice projection, body posture, and camera contact.

Second-year broadcasting student Mary Wanjiru said the practical approach was more demanding than ordinary classroom lessons. "When the countdown starts, you realize how much concentration a presenter needs," she said.`
  },
  {
    title: 'Film Students Screen Short Documentaries on Nairobi Life',
    category: 'Academics', author: SKYLAR, daysAgo: 32,
    snippet: 'Student documentaries on matatus, street food and youth employment draw crowds from across departments.',
    content: `Film production students screened a collection of short documentaries exploring life in Nairobi, including public transport, street food vendors, youth employment, and urban art. The screening attracted students from several departments.

Lecturers praised the documentaries for strong storytelling and effective camera work, while also encouraging students to improve sound recording and editing.

The best documentary, Voices of the Matatu, will represent the institute at an upcoming student film showcase.`
  },
  {
    title: 'KIMC Launches Academic Writing and Research Clinic',
    category: 'Academics', author: SKYLAR, daysAgo: 29,
    snippet: 'New clinic offers one-on-one help with referencing, proposal writing and research ethics.',
    content: `The institute has launched an academic writing clinic to support students preparing reports, documentaries, research proposals, and final projects. The clinic focuses on referencing, plagiarism avoidance, proposal writing, and research ethics.

Students receive one-on-one consultations from lecturers and librarians. Organizers said many first-year students struggle with academic writing because media training places strong emphasis on practical work.`
  },
  {
    title: 'Photography Students Hold Practical Wildlife Exhibition',
    category: 'Academics', author: SKYLAR, daysAgo: 25,
    snippet: 'Images from a Nairobi National Park field trip go on display, judged for lighting and ethical wildlife practice.',
    content: `Photography students displayed wildlife and environmental photographs captured during a recent field trip to Nairobi National Park. The exhibition featured images of giraffes, zebras, birds, and urban-wildlife interactions.

Visitors voted for their favorite photograph, and winners received certificates from the department. Students said the field trip taught them patience, lighting control, and ethical wildlife photography.`
  },
  {
    title: 'Library Extends Evening Study Hours Ahead of Exams',
    category: 'Academics', author: SKYLAR, daysAgo: 12,
    snippet: 'KIMC Library will now stay open until 10 p.m. on weekdays during the revision period.',
    content: `KIMC Library has extended evening study hours to accommodate students preparing for end-of-semester examinations. The library will now remain open until 10 p.m. on weekdays.

Students welcomed the decision, saying hostel environments are often noisy during revision periods. Library officials urged students to observe silence and return borrowed materials on time.`
  },
  {
    title: 'Student Editors Attend Media Ethics Seminar',
    category: 'Academics', author: SKYLAR, status: 'DRAFT',
    snippet: 'Journalism club editors discuss misinformation, privacy and responsible conflict reporting.',
    content: `Student editors from the journalism club attended a seminar on media ethics and responsible reporting. The discussion covered misinformation, privacy, conflict reporting, and the role of journalists in democratic societies.

Speakers encouraged students to verify information before publishing and to avoid sensationalism in digital journalism.`
  },

  // ---------------- SPORTS (Skylar) ----------------
  {
    title: 'KIMC Football Team Wins Nairobi Colleges Friendly Tournament',
    category: 'Campus Sports', author: SKYLAR, daysAgo: 21,
    snippet: 'A 3–1 win in the final sparks celebrations among students who travelled to support the team.',
    content: `KIMC's football team won the Nairobi Colleges Friendly Tournament after defeating a neighboring college 3–1 in the final. The victory sparked celebrations among students who travelled to support the team.

Coach Peter Mwangi praised the team's discipline and fitness, saying the players had trained consistently for six weeks.`
  },
  {
    title: 'Women\u2019s Volleyball Team Begins Intensive Evening Training',
    category: 'Campus Sports', author: SKYLAR, daysAgo: 18,
    snippet: 'The team eyes its first regional TVET qualification in three years.',
    content: `The women's volleyball team has started an intensive evening training programme ahead of the regional college championships. Training sessions focus on serving accuracy, blocking, and court communication.

Captain Faith Achieng said the team hopes to qualify for the national TVET games for the first time in three years.`
  },
  {
    title: 'Sports Day Draws Large Student Participation',
    category: 'Campus Sports', author: SKYLAR, daysAgo: 15,
    snippet: 'Athletics, volleyball, tug-of-war and relay events drew crowds from across departments.',
    content: `Hundreds of students participated in the annual Sports Day, competing in athletics, football, volleyball, tug-of-war, sack races, and relay events. The event was held on the institute grounds and attracted large crowds.

Organizers said Sports Day promotes physical fitness and interaction among students from different departments.`
  },
  {
    title: 'Athletics Club Organises Early Morning Fitness Challenge',
    category: 'Campus Sports', author: SKYLAR, daysAgo: 9,
    snippet: 'A 5-kilometre sunrise run around South B promotes healthy habits during a busy semester.',
    content: `The athletics club organized a 5-kilometre morning fitness challenge around South B and neighboring roads. Participants gathered before sunrise and completed the run under the supervision of club officials.

Students said the challenge encouraged healthy lifestyles during a busy academic semester.`
  },
  {
    title: 'Chess Championship Attracts Record Number of Competitors',
    category: 'Campus Sports', author: SKYLAR, daysAgo: 6,
    snippet: '96 students competed in this year\u2019s tournament, the largest turnout yet.',
    content: `A record 96 students participated in this year's campus chess championship held at the student centre. Matches lasted throughout the day, with finalists competing in a tense evening showdown.

The winner will represent KIMC in an inter-college chess tournament later this semester.`
  },
  {
    title: 'Basketball Team Targets Regional Qualification',
    category: 'Campus Sports', author: SKYLAR, status: 'PENDING_REVIEW',
    snippet: 'Coaches emphasize defense and fast breaks ahead of this month\u2019s regional qualifiers.',
    content: `KIMC's basketball team has intensified training ahead of regional qualifiers scheduled for later this month. Coaches are emphasizing defensive organization, rebounding, and fast-break transitions.

Players said balancing training with coursework remains their biggest challenge.`
  },

  // ---------------- TECHNOLOGY (Brian) ----------------
  {
    title: 'KIMC Upgrades Campus Wi-Fi to Support Digital Learning',
    category: 'Technology', author: BRIAN, daysAgo: 40,
    snippet: 'Faster, more stable connections now reach lecture halls, studios, hostels and the library.',
    content: `The institute has completed a major Wi-Fi upgrade covering lecture halls, studios, hostels, and the library. Students reported faster internet speeds and more stable connections for online classes and video editing work.

ICT officials said the upgrade was necessary because media students increasingly rely on cloud storage, streaming platforms, and digital production tools.`
  },
  {
    title: 'Media Students Develop Campus News Mobile App',
    category: 'Technology', author: BRIAN, daysAgo: 34,
    snippet: 'A joint ICT-journalism team builds an app for news, timetables and internship alerts.',
    content: `A team of ICT and journalism students has developed a mobile application that aggregates campus news, event notices, examination timetables, and internship opportunities. The app allows students to receive instant notifications.

Developers said the project was inspired by the need for faster communication between departments and students.`
  },
  {
    title: 'New Digital Audio Lab Opens for Radio Production Students',
    category: 'Technology', author: BRIAN, daysAgo: 27,
    snippet: 'Modern consoles and soundproof booths bring the radio program up to industry standard.',
    content: `KIMC has opened a digital audio laboratory equipped with modern recording consoles, studio microphones, editing software, and soundproof booths. The facility will be used for radio production, podcasting, and voice-over training.

Students described the lab as a major improvement over previous facilities and said it would help them meet industry standards.`
  },
  {
    title: 'Cybersecurity Workshop Warns Students About Online Scams',
    category: 'Technology', author: BRIAN, daysAgo: 20,
    snippet: 'Trainers flag phishing emails and fake internship offers, urging two-factor authentication.',
    content: `ICT trainers conducted a cybersecurity workshop focusing on phishing emails, fake internship offers, social media scams, and password security. Students were advised to use two-factor authentication and avoid sharing personal information online.

Organizers said media students are particularly vulnerable because they communicate with many sources and organizations through email and social media.`
  },
  {
    title: 'Drone Journalism Demonstration Excites Broadcasting Students',
    category: 'Technology', author: BRIAN, daysAgo: 14,
    snippet: 'Students get hands-on with aerial photography and safety regulations for the first time.',
    content: `Broadcasting students attended a practical drone journalism demonstration where instructors explained aerial photography, safety regulations, and storytelling techniques. Students practiced basic drone controls under supervision.

The department plans to introduce an elective unit on aerial media production next year.`
  },
  {
    title: 'Editing Marathon Keeps Film Students in Lab Overnight',
    category: 'Technology', author: BRIAN, daysAgo: 8,
    snippet: 'Some students rendered final video files past midnight ahead of submission deadlines.',
    content: `Film students spent nearly twelve hours in editing suites completing documentary projects before submission deadlines. Some students remained in the lab past midnight rendering final video files.

Despite the long hours, students said the experience taught them teamwork and time management.`
  },
  {
    title: 'KIMC Introduces Digital Attendance System',
    category: 'Technology', author: BRIAN, daysAgo: 4,
    snippet: 'ID-card taps replace paper attendance sheets in a new pilot programme.',
    content: `The institute has begun piloting a digital attendance system that records class attendance through student identification cards. Administrators said the system would reduce paperwork and improve record accuracy.

Students expressed support for the new system but requested safeguards for technical failures.`
  },

  // ---------------- EVENTS & STUDENT LIFE (Brian) ----------------
  {
    title: 'Cultural Week Celebrates Kenya\u2019s Diversity Through Media and Art',
    category: 'Events', author: BRIAN, daysAgo: 24,
    snippet: 'Performances from Maasai, Luo, Kikuyu, Luhya, Kamba and coastal student groups filled the afternoon.',
    content: `Students celebrated Cultural Week with traditional attire, music, dance, storytelling, photography exhibitions, and regional food displays. The event highlighted Kenya's cultural diversity and the role of media in preserving heritage.

Crowds gathered throughout the afternoon to watch performances from Maasai, Luo, Kikuyu, Luhya, Kamba, and coastal student groups.`
  },
  {
    title: 'Career Fair Connects Students with Leading Media Houses',
    category: 'Events', author: BRIAN, daysAgo: 19,
    snippet: 'Recruiters reviewed student portfolios and discussed internships and graduate roles.',
    content: `Media houses, production companies, public relations firms, and digital marketing agencies attended the annual career fair to discuss internships and employment opportunities. Recruiters reviewed student portfolios and offered career advice.

Many final-year students used the opportunity to network with editors, producers, and communications officers.`
  },
  {
    title: 'Mental Health Forum Encourages Students to Seek Support Early',
    category: 'Events', author: BRIAN, daysAgo: 13,
    snippet: 'Counsellors addressed academic stress, financial pressure and healthy coping strategies.',
    content: `Counsellors and student leaders hosted a mental health forum focusing on academic stress, financial pressure, anxiety, and healthy coping strategies. Students were encouraged to seek counselling services before problems become severe.

The forum included anonymous question sessions and referrals to support services.`
  },
  {
    title: 'Environmental Club Leads Major Campus Clean-Up Exercise',
    category: 'Events', author: BRIAN, daysAgo: 7,
    snippet: 'Students collected litter, planted flowers and repainted waste bins across campus.',
    content: `The Environmental Club organized a large-scale clean-up exercise covering lecture blocks, studios, hostels, and surrounding roads. Students collected litter, planted flowers, and painted waste bins with environmental messages.

Club officials said the initiative was intended to promote responsible waste management.`
  },
  {
    title: 'Talent Night Reveals New Voices in Music and Spoken Word',
    category: 'Events', author: BRIAN, daysAgo: 3,
    snippet: 'Winners earned studio recording time and invitations to future campus events.',
    content: `Singers, spoken-word artists, dancers, comedians, and instrumentalists entertained students during the annual Talent Night held at the student centre. Judges evaluated creativity, stage presence, and audience engagement.

Winners received certificates, studio recording opportunities, and invitations to perform at future campus events.`
  },
  {
    title: 'Students Raise Funds for Community Media Outreach Project',
    category: 'Events', author: BRIAN, status: 'DRAFT',
    snippet: 'A new campaign will donate radio content, cameras and training materials to rural schools.',
    content: `Students have launched a fundraising campaign to support a community media outreach project in rural schools. The project aims to donate educational radio content, photography equipment, and media training materials.

Organizers said the initiative reflects the institute's commitment to using communication skills for social impact.`
  }
];

let created = 0;
for (const s of stories) {
  const slug = slugify(s.title);
  if (findArticle.get(slug)) continue;

  const status = s.status || 'PUBLISHED';
  const published_at = status === 'PUBLISHED' ? daysAgoISO(s.daysAgo) : null;

  insertArticle.run({
    title: s.title,
    slug,
    content: s.content,
    snippet: s.snippet,
    cover_image_url: `https://picsum.photos/seed/${slug}/900/500`,
    status,
    author_id: getUserId(s.author),
    category_id: getCategoryId(s.category),
    published_at
  });
  created++;
  console.log(`Created (${status}): ${s.title}`);
}

console.log(`\nDone. ${created} new articles created (skipped any that already existed).`);
