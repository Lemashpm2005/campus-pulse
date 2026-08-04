// Run with: node db/update-batch2.js
// Updates existing PUBLISHED stories with richer content + real photos.
// Does NOT touch the 3 draft/pending items (protected explicitly below).
// Also inserts 5 brand-new stories, some authored by the editors.

const db = require('./database');

const PROTECTED_SLUGS = [
  'student-editors-attend-media-ethics-seminar',   // draft - Skylar
  'basketball-team-targets-regional-qualification', // pending - Skylar
  'students-raise-funds-for-community-media-outreach-project' // draft - Brian
];

const getUserId = (email) => db.prepare('SELECT id FROM users WHERE email = ?').get(email).id;
const getCategoryId = (name) => db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
const getArticleBySlug = db.prepare('SELECT * FROM articles WHERE slug = ?');

const JACKLINE = 'jacklinesopiato6@gmail.com';
const EUNICE = 'wambuieunice032@gmail.com';
const SKYLAR = 'skylarbrilliane@gmail.com';
const BRIAN = 'briannyakango27@gmail.com';

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- Part 1: updates to existing published articles ----------
const updates = [
  {
    slug: 'final-year-journalism-students-begin-major-newsroom-project',
    title: 'Final-Year Journalism Students Begin Major Multimedia Newsroom Project',
    author: JACKLINE,
    image: '/img/stories/studio.png',
    snippet: 'Final-year students launch a semester-long newsroom simulation producing print, radio, TV, podcast and online stories.',
    content: `The usually quiet newsroom block at KIMC came alive on Monday morning as final-year journalism students officially launched their semester-long multimedia newsroom project, a practical exercise designed to mirror the pressure and pace of a real media house.

By 8:00 a.m., students were already gathered around editorial desks assigning beats, discussing headline angles, and checking recording equipment. Some rushed to the television studio carrying tripods and microphones, while others headed out to Nairobi's streets to conduct interviews.

"This project is meant to test whether students can think, report, edit, and publish under deadline pressure," said Mr. David Mwangi, a senior journalism lecturer supervising the exercise. "In the industry, you don't have the luxury of waiting for inspiration. News happens and journalists respond immediately."

Students are required to produce a weekly newspaper, a radio bulletin, a television package, a podcast segment, and a digital story for the institute's online platform.

Third-year student Faith Achieng admitted the first day was overwhelming. "I was assigned the education beat and by 10 a.m. I had already conducted three interviews. It feels exciting but also terrifying because every story has a deadline," she said. Her classmate Kevin Mutiso, on the sports desk, said the project had changed how he views journalism: "One missed interview can affect an entire bulletin. Teamwork is everything."

At noon, editors held a tense news conference where students pitched story ideas. Several proposals were rejected for lacking strong sources, forcing reporters back into the field. "Students must learn that a good story needs evidence, voices, and context," said Ms. Jane Wanjiru, the project coordinator.

KIMC says the project was developed with editors from Kenyan media houses to ensure graduates are industry-ready. As evening approached, television students rehearsed a mock 7 p.m. bulletin while radio teams edited sound bites in the digital audio lab, the newsroom lights staying on long after sunset.`
  },
  {
    slug: 'broadcasting-department-introduces-live-news-production-classes',
    title: 'Broadcasting Department Introduces Live Television Production Class',
    author: SKYLAR,
    image: '/img/stories/camera.png',
    snippet: 'Teleprompter reading, live interviewing and floor management put second-year broadcasting students through their first live bulletin.',
    content: `The countdown clock hit ten seconds, the studio lights brightened, and silence fell across the control room. For many second-year broadcasting students, that moment marked their first experience presenting a live television bulletin.

KIMC's Broadcasting Department this week introduced live news production classes, a new practical programme aimed at strengthening students' on-air presentation and studio production skills. The sessions involve teleprompter reading, live interviewing, camera switching, floor management, audio mixing, and real-time editorial decision-making.

Student presenter Mary Wanjiru said the pressure was unlike anything she had experienced before. "When the floor manager counts down from five, your heart starts racing. You can't stop to correct a mistake because the programme is already live," she said after completing a 15-minute mock bulletin.

Samuel Kiptoo, who operated the studio cameras, said the exercise taught him the importance of coordination. "The presenter, camera operator, audio engineer, and producer must work as one team. If one person misses a cue, everyone feels it."

During the session, instructors frequently paused the production to correct voice projection, posture, eye contact, and pronunciation. Mrs. Ruth Muthoni, head of the Broadcasting Department, said the institute wanted students to graduate with confidence in live studio environments. "Media employers are looking for graduates who can walk into a studio and perform from day one," she said.

The control room was just as busy as the studio floor, with producers monitoring scripts, audio levels, graphics, and timing through headsets. By the end of the class, applause broke out as the final bulletin ended successfully.`
  },
  {
    slug: 'film-students-screen-short-documentaries-on-nairobi-life',
    title: 'Film Students Screen Powerful Documentaries on Life in Nairobi',
    author: SKYLAR,
    image: '/img/stories/film.png',
    snippet: 'Voices of the Matatu and other student films draw applause at the KIMC screening hall.',
    content: `Applause echoed through the KIMC screening hall on Friday evening as film production students premiered a series of short documentaries exploring the realities of life in Nairobi, covering public transport, street food vendors, youth unemployment, urban art, and life in informal settlements.

One of the most discussed films, Voices of the Matatu, followed matatu conductors and passengers during the morning rush hour. Student viewer Lilian Atieno said the documentary felt authentic. "I use matatus every day, but I had never thought about the people who work there from dawn to late at night. The film made me see the city differently."

Producer John Karanja said the team spent several weekends filming in Nairobi. "We wanted ordinary Nairobi residents to tell their own stories rather than speaking for them."

Film lecturer Mr. Peter Oloo praised the students' storytelling and camera work but challenged them to improve sound recording and color grading. "The emotional connection in these films is excellent. The next step is achieving stronger technical consistency."

The best documentary from the showcase will represent KIMC at an upcoming student film festival. After the screening, students held a question-and-answer session with the audience, discussing ethical filming, consent, and documentary storytelling.`
  },
  {
    slug: 'kimc-launches-academic-writing-and-research-clinic',
    title: 'KIMC Launches Academic Writing and Research Clinic for Students',
    author: SKYLAR,
    image: '/img/stories/books.png',
    snippet: 'One-on-one sessions with lecturers and librarians target referencing, plagiarism awareness and proposal writing.',
    content: `KIMC has launched a new Academic Writing and Research Clinic aimed at helping students improve report writing, referencing, research proposals, and final project preparation. The clinic, housed inside the institute library, offers one-on-one consultations with lecturers and librarians throughout the semester.

According to library officials, many first-year students struggle with academic writing because media training places heavy emphasis on practical work. "We noticed repeated challenges in referencing, plagiarism awareness, and proposal structure," said Mrs. Grace Wairimu, the chief librarian. "The clinic is meant to support students before they reach final-year project stage."

First-year broadcasting student Anne Nyokabi attended the opening session and described it as reassuring. "I used to fear research assignments because I didn't know how to reference properly. After today, I feel more confident."

Second-year film student Michael Odhiambo said the clinic would save students time. "Instead of guessing whether our work is correct, we can now get direct guidance from lecturers."

During the first workshop, students practiced paraphrasing sources, creating bibliographies, and identifying plagiarism using sample assignments. The institute plans to hold weekly writing workshops and special dissertation support sessions for graduating students.`
  },
  {
    slug: 'library-extends-evening-study-hours-ahead-of-exams',
    title: 'KIMC Library Extends Evening Hours as Examination Fever Grips Campus',
    author: SKYLAR,
    image: '/img/stories/library.png',
    snippet: 'The library will now stay open until 10 p.m. on weekdays, and nearly every seat fills up by 7:30.',
    content: `With end-of-semester examinations only two weeks away, KIMC Library has extended its evening operating hours from 8 p.m. to 10 p.m., a move welcomed by students across the institute. By 7:30 p.m. on Monday, nearly every seat in the reading section was occupied, some students revising in silence while others discussed notes in the group-study areas.

Third-year student Ruth Naliaka said the extension was badly needed. "My hostel gets noisy in the evening. The library is the only place where I can concentrate for several uninterrupted hours."

Film production student Brian Kariuki agreed: "Most editing assignments and research work happen late in the day, so these extra hours are extremely helpful."

Library administrator Mr. Joseph Mutua said the decision followed consultations with student leaders. "We observed increased demand for study space during examination periods. Extending the hours is one way of supporting academic success." Security personnel have also increased patrols around the library to ensure students can leave safely at night.

Outside the library, small study groups occupied benches and corridors, revising with flashcards and printed notes. Despite the pressure, many students said the atmosphere was motivating rather than stressful. "When you see everyone studying, it pushes you to keep going," said Faith Wambui, a second-year student.`
  },
  {
    slug: 'kimc-upgrades-campus-wi-fi-to-support-digital-learning',
    title: 'KIMC Upgrades Campus Wi-Fi as Students Demand Faster Digital Access',
    author: BRIAN,
    image: '/img/stories/wifi.png',
    snippet: 'Uploads that once took hours over a shaky connection now finish in minutes.',
    content: `Students at KIMC are already noticing a significant improvement in internet connectivity following a major campus Wi-Fi upgrade completed this week by the ICT department, covering lecture halls, television studios, computer laboratories, hostels, and the library.

Film production student Brian Kariuki said uploading documentary footage previously took several hours. "Last semester I sometimes carried hard drives between labs because the network was too slow. Yesterday I uploaded a large video project in minutes," he said.

Journalism student Faith Achieng said the stronger connection has improved access to online research materials. "We can now download reports and watch news archives without constant interruptions."

Mr. Samuel Otieno, head of ICT services, said media training increasingly depends on digital platforms. "Television editing, podcast production, graphic design, and online journalism all require reliable internet. The upgrade is part of our digital learning strategy." He added that additional access points would be installed in outdoor study areas later this semester.`
  },
  {
    slug: 'new-digital-audio-lab-opens-for-radio-production-students',
    title: 'New Digital Audio Lab Opens, Giving Radio Students Professional Studio Experience',
    author: BRIAN,
    image: '/img/stories/mic.png',
    snippet: 'Professional consoles and soundproof booths bring student radio production up to industry standard.',
    content: `Excitement filled the broadcasting block as KIMC officially opened its new digital audio laboratory, a facility equipped with professional recording consoles, studio microphones, editing software, and soundproof booths. Students toured the lab shortly after the ribbon-cutting ceremony, many taking photos beside the new equipment.

Second-year radio production student Janet Njeri described the facility as a dream come true. "We used to share limited recording space. Now we can practice presenting, editing, and producing programmes in an environment that feels like a real radio station."

Podcasting student Mark Ochieng said the lab would encourage more independent student productions. "I've wanted to start a campus podcast for months. With this studio, that idea is finally realistic."

Mrs. Ruth Muthoni, head of Broadcasting, said the investment was intended to align student training with industry standards. "Employers expect graduates who understand modern digital audio workflows," she said. Immediately after the launch ceremony, students recorded a short campus bulletin that was played through the studio speakers, drawing applause from those present.`
  },
  {
    slug: 'cybersecurity-workshop-warns-students-about-online-scams',
    title: 'Cybersecurity Workshop Warns Students About Fake Internship Offers and Online Fraud',
    author: BRIAN,
    image: '/img/stories/cyber.png',
    snippet: 'A student\u2019s near-miss with a fake internship email becomes the workshop\u2019s starkest warning.',
    content: `Students packed the ICT lecture hall on Thursday for a cybersecurity workshop that focused on phishing emails, fake internship offers, social media scams, and digital privacy, organized after several students reported receiving suspicious messages claiming to offer paid media internships.

Journalism student Ruth Naliaka told the audience she nearly responded to a fraudulent internship email. "The message looked professional and used the name of a well-known media company. They asked for my ID copy and application fee. After checking carefully, I realized it was fake." Her story prompted murmurs across the hall, with many students admitting they had received similar messages.

ICT trainer Mr. Victor Oloo projected real scam emails on a screen and showed students how to identify warning signs such as suspicious web addresses, urgent payment requests, and grammatical errors. "Fraudsters target students because they know many are looking for internships and jobs," he explained.

The institute urged students to verify opportunities through official company websites and the KIMC career office before sending personal documents. Student leader Lucy Wambui welcomed the workshop: "We spend so much time online that digital safety should be treated as seriously as physical safety." Participants later received a cybersecurity checklist covering password management, two-factor authentication, and safe use of public Wi-Fi networks.`
  },
  {
    slug: 'kimc-football-team-wins-nairobi-colleges-friendly-tournament',
    title: 'KIMC Football Team Wins Nairobi Colleges Tournament After Dramatic Final',
    author: SKYLAR,
    image: '/img/stories/football.png',
    snippet: 'A last-minute goal seals a 3\u20132 win over Eastlands Technical College.',
    content: `The KIMC football team returned to campus to loud cheers on Wednesday evening after winning the Nairobi Colleges Friendly Tournament with a thrilling 3-2 victory over Eastlands Technical College. Students lined the entrance to the sports field waving institute scarves and singing as the players arrived carrying the trophy.

The final, played at City Stadium, was decided in the last five minutes when striker Kevin Otieno scored the winning goal from a low cross delivered by midfielder Samuel Mumo. "It felt unreal," Kevin said moments after the celebrations began. "When the ball went in, all I could hear was our supporters shouting. I knew we had done something special for KIMC."

Head coach Mr. Peter Kariuki said the victory was the result of six weeks of intensive training. "These students balanced lectures, assignments, and training. Their discipline is what won us this tournament." Captain Brian Ochieng dedicated the win to students who travelled to support the team: "Seeing our classmates in the stands gave us energy even when we were tired."

First-year student Faith Wambui described the atmosphere as unforgettable. "I have never seen students celebrate together like this. It felt like a national team victory." The team will now prepare for regional inter-college competitions later this semester.`
  },
  {
    slug: "women-s-volleyball-team-begins-intensive-evening-training",
    title: 'Women\u2019s Volleyball Team Begins Intensive Evening Training Ahead of Regional Games',
    author: SKYLAR,
    image: '/img/stories/volley.png',
    snippet: 'Some players skip the hostel and head straight from class to training, chasing a first regional qualification in three years.',
    content: `Every evening after classes, the KIMC volleyball court comes alive with whistles, bouncing balls, and determined voices as the women's volleyball team prepares for the regional college championships. Coach Jane Njeri has introduced a new training programme focusing on serving accuracy, blocking, court communication, and physical conditioning.

"We are training with purpose this year," she said. "The target is not just participation; the target is qualification."

Team captain Faith Achieng said the players have made personal sacrifices. "Some of us leave class and come straight to training without even going to the hostel first. We believe this team can make history." Outside hitter Lucy Wambui admitted balancing academics and sport is difficult: "After training we still have assignments to complete, but representing KIMC makes the effort worthwhile."

Students have begun attending evening sessions, and the team says the support has boosted morale. The regional championships are scheduled for later this month, and the winners will advance to the national TVET games.`
  },
  {
    slug: 'sports-day-draws-large-student-participation',
    title: 'Sports Day Turns Campus Into a Festival of Competition and Laughter',
    author: SKYLAR,
    image: '/img/stories/race.png',
    snippet: 'A two-minute tug-of-war between Journalism and Broadcasting steals the show.',
    content: `What began as a sports event quickly turned into a full-day festival as hundreds of KIMC students filled the institute grounds for the annual Sports Day. Departments competed in football, volleyball, athletics, tug-of-war, sack races, and relay events while classmates cheered from the sidelines.

The loudest cheers came during the tug-of-war final between the Journalism and Broadcasting departments. After nearly two minutes of pulling, Journalism emerged victorious, sending its supporters into celebration.

First-year broadcasting student Anne Nyokabi said Sports Day helped her meet students from other departments. "I came to watch volleyball but ended up joining the relay race. It was the first time I felt truly part of the KIMC community."

Second-year film student Michael Odhiambo laughed while recalling the sack race. "I fell twice and still finished last, but everyone was laughing together. That's the memory I'll keep."

Student affairs officer Mr. Joseph Mutua said the event promotes wellness and social interaction. "Academic excellence is important, but students also need opportunities to relax, exercise, and build friendships." Music, dance, and food stalls kept the celebration going until late afternoon.`
  },
  {
    slug: 'athletics-club-organises-early-morning-fitness-challenge',
    title: 'Athletics Club Organises Dawn Fitness Challenge Around South B',
    author: SKYLAR,
    image: '/img/stories/run.png',
    snippet: 'More than 70 students beat their alarms for a 5-kilometre sunrise run.',
    content: `More than 70 students gathered outside the main gate before sunrise on Saturday for a 5-kilometre fitness challenge organised by the KIMC Athletics Club. The route passed through South B and neighboring roads before returning to campus.

Journalism student Diana Atieno admitted she almost skipped the run. "When my alarm rang at 5 a.m. I wanted to sleep again, but finishing the run made me feel proud."

Athletics club chairperson Kevin Mutiso said the early start created a unique atmosphere. "Running as the sun rises over Nairobi is motivating. We want students to see fitness as part of their routine, not a punishment."

Physical education instructor Mr. Peter Kariuki reminded participants that regular exercise improves concentration and reduces stress. After the run, students shared fruit, water, and fitness tips while discussing plans for future weekend sessions.`
  },
  {
    slug: 'chess-championship-attracts-record-number-of-competitors',
    title: 'Chess Championship Draws Record Participation as Silent Battles Fill Student Centre',
    author: SKYLAR,
    image: '/img/stories/chess.png',
    snippet: 'A late checkmate in the final decides the largest chess turnout yet, 96 players strong.',
    content: `The usually noisy student centre fell unusually quiet on Friday as a record 96 students participated in the KIMC Chess Championship. Matches began at 9 a.m. and continued throughout the day, with players concentrating intensely over black-and-white boards while spectators whispered from a distance.

The championship final lasted nearly an hour before third-year journalism student Brian Ochieng secured victory with a late checkmate. "Chess teaches patience," he said after receiving the trophy. "One careless move can change everything."

Runner-up Samuel Kiptoo praised the growing popularity of the game. "People think chess is boring until they watch a close match. The tension is real."

Chess club patron Mrs. Ruth Muthoni said participation had doubled compared with last year. "We are seeing interest from journalism, broadcasting, ICT, and film students. It shows that intellectual sports have a place on campus." The winner will represent KIMC at an inter-college chess tournament later this semester.`
  },
  {
    slug: 'cultural-week-celebrates-kenya-s-diversity-through-media-and-art',
    title: 'Cultural Week Fills Campus With Music, Dance and Traditional Dress',
    author: BRIAN,
    image: '/img/stories/week.png',
    snippet: 'Maasai, Luo, Kikuyu, Luhya, Kamba and coastal students share songs, food and stories from home.',
    content: `Colorful traditional attire, drumbeats, songs, and the aroma of regional foods transformed KIMC into a cultural festival during this year's Cultural Week celebrations. Students from different communities performed dances, recited poetry, displayed traditional artifacts, and prepared foods from across Kenya.

Maasai student Kevin Mutiso said the event allowed students to celebrate identity with pride. "Many of us live away from home. Wearing our traditional clothes reminds us where we come from."

Broadcasting student Mary Wanjiru said she enjoyed learning about other communities. "I tasted foods I had never tried before and learned the stories behind them."

Dean of Students Dr. Esther Muthoni said cultural events strengthen unity on campus. "Media professionals must understand Kenya's diversity if they are to tell the nation's stories responsibly." The celebrations ended with a joint performance featuring students from several communities dancing together on stage.`
  },
  {
    slug: 'career-fair-connects-students-with-leading-media-houses',
    title: 'Career Fair Connects Students With Media Houses and Employers',
    author: BRIAN,
    image: '/img/stories/kimc.png',
    snippet: 'Editors and producers review student portfolios and shortlist several for internship interviews.',
    content: `Editors, producers, public relations officers, photographers, and digital marketing managers gathered at KIMC for the annual Career Fair, giving students a rare chance to interact directly with employers.

Final-year journalism student Faith Achieng arrived with three copies of her CV and a portfolio of published articles. "For the first time I was speaking to editors as a future professional, not just a student," she said.

Representatives from media organizations reviewed portfolios, discussed internship opportunities, and offered career advice. Recruiter Ms. Jane Wanjiru encouraged students to build strong personal brands. "Your portfolio speaks before you do. Keep producing quality work even while you are still in college."

The career office reported record attendance and said several students were shortlisted for internship interviews during the event.`
  },
  {
    slug: 'mental-health-forum-encourages-students-to-seek-support-early',
    title: 'Mental Health Forum Encourages Students to Seek Help Early',
    author: BRIAN,
    image: '/img/stories/mental.png',
    snippet: 'Counsellors remind a packed auditorium that asking for help is a sign of strength.',
    content: `The KIMC auditorium fell silent as students listened to counsellors discuss academic stress, financial pressure, loneliness, anxiety, and healthy coping strategies during a campus mental health forum.

Counsellor Mrs. Ruth Muthoni told students that seeking help is a sign of strength, not weakness. "Many students suffer quietly because they fear judgment. Support is available, and no one should struggle alone."

Third-year student Diana Atieno said hearing other students speak openly was comforting. "I realized I am not the only one who feels overwhelmed sometimes."

The session included anonymous questions submitted through a box at the entrance, and counsellors remained behind afterward for private consultations. Student leaders announced plans for monthly peer-support meetings.`
  },
  {
    slug: 'talent-night-reveals-new-voices-in-music-and-spoken-word',
    title: 'Talent Night Discovers New Voices in Music and Spoken Word',
    author: BRIAN,
    image: '/img/stories/stage.png',
    snippet: 'A spoken-word piece about life in Nairobi draws the loudest reaction of the night.',
    content: `Cheers, whistles, and applause echoed through the student centre as singers, dancers, spoken-word artists, comedians, and instrumentalists took to the stage during the annual KIMC Talent Night.

The loudest reaction of the evening came when journalism student Mark Ochieng performed an original spoken-word piece about life in Nairobi. "I was shaking before I went on stage," he admitted afterward. "When the audience started clapping, I forgot my fear."

Music judge Mr. Peter Oloo praised the confidence shown by many performers. "KIMC has extraordinary creative talent. Events like this give students a platform to be seen."

Winners received certificates and invitations to perform at future campus events.`
  },
  {
    slug: 'environmental-club-leads-major-campus-clean-up-exercise',
    title: 'Environmental Club Leads Major Campus Clean-Up Exercise',
    author: BRIAN,
    image: '/img/stories/clean.png',
    snippet: 'Students collect litter and plant flowers, arguing conservation begins with campus itself.',
    content: `Students wearing gloves and carrying litter bags spread across lecture blocks, studios, hostels, and surrounding roads during a large-scale clean-up organized by the KIMC Environmental Club.

Club chairperson Lucy Wambui said the exercise was inspired by concerns about waste disposal around campus. "We cannot produce documentaries about the environment while ignoring our own surroundings."

Students collected plastic bottles, paper waste, and food packaging before planting flowers near the administration block. Institute administrator Mr. Joseph Mutua praised the initiative: "Environmental responsibility begins with small daily actions."

The club plans to introduce monthly clean-up exercises and recycling awareness campaigns.`
  }
];

let updatedCount = 0;
for (const u of updates) {
  if (PROTECTED_SLUGS.includes(u.slug)) {
    console.log(`SKIPPED (protected): ${u.slug}`);
    continue;
  }
  const existing = getArticleBySlug.get(u.slug);
  if (!existing) {
    console.log(`NOT FOUND, skipping: ${u.slug}`);
    continue;
  }
  db.prepare(`
    UPDATE articles
    SET title = ?, content = ?, snippet = ?, cover_image_url = ?, author_id = ?, updated_at = datetime('now')
    WHERE slug = ?
  `).run(u.title, u.content, u.snippet, u.image, getUserId(u.author), u.slug);
  updatedCount++;
  console.log(`Updated: ${u.slug} -> author now ${u.author}`);
}

console.log(`\n${updatedCount} existing articles updated.`);

// ---------- Part 2: brand-new stories (some by editors) ----------
const findArticle = db.prepare('SELECT id FROM articles WHERE slug = ?');
const insertArticle = db.prepare(`
  INSERT INTO articles (title, slug, content, snippet, cover_image_url, status, author_id, category_id, published_at)
  VALUES (@title, @slug, @content, @snippet, @cover_image_url, 'PUBLISHED', @author_id, @category_id, @published_at)
`);

function daysAgoISO(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

const newStories = [
  {
    title: 'Hostel Life After 10 P.M.: How Students Balance Noise, Friendship and Study',
    category: 'Events', author: BRIAN, daysAgo: 11, image: '/img/stories/hostel.png',
    snippet: 'Some rooms fall silent for revision while others stay lively with late-night tea and conversation.',
    content: `As the clock approaches 10 p.m., KIMC hostels begin to transform. Some rooms fall silent as students revise for examinations, while others remain lively with conversations, music, and late-night tea.

Second-year broadcasting student Lucy Wambui said hostel life has taught her time management. "You quickly learn when to study and when to socialize. If you wait for perfect silence, you may never open your books."

Third-year journalism student Brian Ochieng said group discussions often continue past midnight. "Sometimes we revise together and end up helping each other understand difficult topics."

Hostel administrator Mr. Joseph Mutua said the institute encourages students to respect quiet hours while still building a supportive community. "Hostels are not just sleeping spaces; they are learning communities." Despite occasional complaints about noise, many students say hostel friendships become one of the strongest memories of campus life.`
  },
  {
    title: 'Cafeteria Prices Become a Daily Topic Among Students',
    category: 'Events', author: BRIAN, daysAgo: 5, image: '/img/stories/lunch.png',
    snippet: 'A quick Campus Pulse survey finds most students still prefer the campus cafeteria over nearby restaurants.',
    content: `Conversations about tea, chapati, rice, and lunch prices have become almost as common as discussions about assignments at the KIMC cafeteria.

First-year student Anne Nyokabi said budgeting is one of the biggest challenges of campus life. "I now plan my meals for the whole week. If I buy snacks carelessly, my transport money disappears."

Cafeteria manager Mrs. Grace Wairimu said rising food costs have affected suppliers across Nairobi. "We try to keep meals affordable while maintaining quality. Students are our priority."

A quick survey by Campus Pulse found that many students prefer buying lunch on campus because it is cheaper than nearby restaurants. Second-year film student Michael Odhiambo laughed while holding a plate of beans and chapati: "This combination has probably kept half the campus alive."`
  },
  {
    title: 'Student Fashion Showcase Turns Courtyard Into Creative Runway',
    category: 'Events', author: BRIAN, daysAgo: 2, image: '/img/stories/fashion.png',
    snippet: 'Photography, music and costume design students collaborate on an impromptu campus runway.',
    content: `The central courtyard was transformed into a colorful runway as students showcased outfits inspired by contemporary Kenyan fashion, film costumes, and traditional designs.

Broadcasting student Mary Wanjiru said the event allowed students to express creativity beyond the classroom. "Fashion is also communication. What we wear tells a story."

Photography students documented the showcase while music students provided live entertainment. Lecturer Mr. Peter Oloo said creative events encourage collaboration between departments. "Media production involves costume, photography, music, and performance. This showcase brought those disciplines together."

The audience remained in the courtyard long after the final walk, taking photographs with the participants.`
  },
  {
    title: 'Alumni Return to Mentor Students During Media Industry Week',
    category: 'Events', author: EUNICE, daysAgo: 16, image: '/img/stories/alumni.png',
    snippet: 'Graduates now working in TV, radio, PR and film return to share hard-won career lessons.',
    content: `Former KIMC students working in television, radio, public relations, film production, and digital media returned to campus this week to mentor current students during Media Industry Week.

Alumnus Kevin Otieno, now a television reporter, told students that persistence is essential in the media industry. "My first internship application was rejected. I kept improving my portfolio until someone gave me a chance."

Public relations officer Diana Atieno, another alumna, encouraged students to build professional networks early. Students asked questions about salaries, internships, freelancing, and life after graduation during an extended mentorship session.

KIMC officials said alumni engagement helps students understand current industry expectations, and the institute plans to make Media Industry Week an annual fixture on the calendar.`
  },
  {
    title: 'Farewell Bonfire Brings Final-Year Students Together Before Graduation',
    category: 'Events', author: JACKLINE, daysAgo: 1, image: '/img/stories/grad.png',
    snippet: 'Final-year students trade memories of deadlines, productions and friendship around the fire.',
    content: `Laughter, music, and emotional speeches filled the KIMC grounds on Friday night as final-year students gathered for a farewell bonfire ahead of graduation.

Students sat in circles sharing memories of assignments, productions, sports events, hostel life, and friendships formed during their years at the institute.

Journalism student Brian Ochieng admitted the evening felt bittersweet. "We spent years rushing to classes and deadlines. Tonight we finally realized how much these people mean to us."

Broadcasting student Janet Njeri became emotional while addressing her classmates. "KIMC gave us more than certificates. It gave us confidence, friendships, and dreams."

Lecturers also attended the event, with Dr. Esther Muthoni urging students to remain connected as alumni. As the bonfire burned lower, students sang together, exchanged contacts, and posed for photographs, capturing what many described as one of the most memorable nights of their campus life.`
  }
];

let created = 0;
for (const s of newStories) {
  const slug = slugify(s.title);
  if (findArticle.get(slug)) {
    console.log(`Already exists, skipping: ${s.title}`);
    continue;
  }
  insertArticle.run({
    title: s.title,
    slug,
    content: s.content,
    snippet: s.snippet,
    cover_image_url: s.image,
    author_id: getUserId(s.author),
    category_id: getCategoryId(s.category),
    published_at: daysAgoISO(s.daysAgo)
  });
  created++;
  console.log(`Created new story (by ${s.author}): ${s.title}`);
}

console.log(`\n${created} brand-new stories created.`);
console.log('Done.');
