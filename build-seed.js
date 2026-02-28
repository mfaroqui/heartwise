#!/usr/bin/env node
// Generates seed questions JSON from seed-data.js QA array and injects into index.html

const fs = require('fs');
const path = require('path');

const SEED_USERS = [
  {id:'s1',name:'Anonymous',role:'student'},{id:'s2',name:'Priya K.',role:'student'},
  {id:'s3',name:'Anonymous',role:'student'},{id:'s4',name:'Marcus T.',role:'student'},
  {id:'s5',name:'Anonymous',role:'student'},{id:'s6',name:'Emily C.',role:'student'},
  {id:'s7',name:'Anonymous',role:'student'},{id:'s8',name:'David L.',role:'student'},
  {id:'r1',name:'Sarah M.',role:'resident'},{id:'r2',name:'Anonymous',role:'resident'},
  {id:'r3',name:'Jason W.',role:'resident'},{id:'r4',name:'Anonymous',role:'resident'},
  {id:'r5',name:'Aisha N.',role:'resident'},{id:'r6',name:'Anonymous',role:'resident'},
  {id:'r7',name:'Chris B.',role:'resident'},{id:'r8',name:'Anonymous',role:'resident'},
  {id:'f1',name:'Anonymous',role:'fellow'},{id:'f2',name:'Rachel P.',role:'fellow'},
  {id:'f3',name:'Anonymous',role:'fellow'},{id:'f4',name:'Omar H.',role:'fellow'},
  {id:'f5',name:'Anonymous',role:'fellow'},{id:'f6',name:'Lisa G.',role:'fellow'},
  {id:'f7',name:'Anonymous',role:'fellow'},{id:'f8',name:'Kevin D.',role:'fellow'}
];

// Read seed-data.js, extract the QA array
const seedSrc = fs.readFileSync(path.join(__dirname, 'seed-data.js'), 'utf8');

// Extract just the array contents between first [ and matching ]
const arrStart = seedSrc.indexOf('[');
// Find the closing ] for QA array - it's before the "// Date generator" comment
const arrEnd = seedSrc.indexOf('];');
const arrStr = seedSrc.substring(arrStart, arrEnd + 1);

// Evaluate QA in a safe-ish way
let QA;
eval('QA = ' + arrStr);

console.log(`Found ${QA.length} Q&As`);

// Seeded random for reproducible dates
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rng = seededRandom(42);

// Generate dates spread over last 6 months from 2026-02-28
function randDate() {
  const base = new Date('2026-02-28');
  const daysBack = Math.floor(rng() * 180);
  const d = new Date(base);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split('T')[0];
}

// Build seed users list for DB (excluding admin)
const seedUsersForDB = SEED_USERS.map(u => ({
  id: u.id,
  name: u.name === 'Anonymous' ? ('User ' + u.id) : u.name,
  email: u.id + '@heartwise-seed.com',
  pass: 'demo1234',
  role: u.role,
  tier: 'free',
  institution: 'Medical Center'
}));

// Build questions
const questions = QA.map((q, i) => {
  const users = SEED_USERS.filter(u => u.role === q.r);
  const user = users[i % users.length];
  const isAnon = user.name === 'Anonymous';
  return {
    id: i + 100,
    userId: user.id,
    author: isAnon ? 'Anonymous' : user.name,
    role: q.r,
    category: q.c,
    question: q.q,
    anonymous: isAnon,
    date: randDate(),
    status: 'answered',
    answer: q.a
  };
});

// Sort by date
questions.sort((a, b) => a.date.localeCompare(b.date));

// Add 2 pending questions at the end (most recent)
questions.push({
  id: QA.length + 100,
  userId: 's4',
  author: 'James R.',
  role: 'student',
  category: 'clinical',
  question: 'Can you walk through your approach to evaluating chest pain in the ED? How do you decide who goes to the cath lab?',
  anonymous: false,
  date: '2026-02-27',
  status: 'pending',
  answer: null
});
questions.push({
  id: QA.length + 101,
  userId: 'r2',
  author: 'Anonymous',
  role: 'resident',
  category: 'wellness',
  question: 'How do you deal with burnout during fellowship? The hours are crushing and I\u2019m questioning if this is worth it.',
  anonymous: true,
  date: '2026-02-27',
  status: 'pending',
  answer: null
});

const nextId = QA.length + 102;
const nextUserId = SEED_USERS.length + 2;

console.log(`Generated ${questions.length} questions (${questions.filter(q=>q.status==='answered').length} answered, ${questions.filter(q=>q.status==='pending').length} pending)`);
console.log(`${seedUsersForDB.length} seed users`);

// Now patch index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Build the new DB initialization
const adminUser = `{id:'admin',name:'Dr. Mouzam Faroqui',email:AE,pass:'admin123',role:'admin',tier:'admin',institution:'Houston Medical Center'}`;

// We need to replace the entire DB initialization
// Find: let DB={users:[...],questions:[...],nextId:...,nextUserId:...};
const dbStart = html.indexOf('let DB={');
const dbEnd = html.indexOf('};', dbStart) + 2;
const oldDB = html.substring(dbStart, dbEnd);

// Build new DB - inline the JSON but keep it compact
const questionsJSON = JSON.stringify(questions);
const usersJSON = JSON.stringify(seedUsersForDB);

const newDB = `let DB={users:[${adminUser}].concat(${usersJSON}),\nquestions:${questionsJSON},\nnextId:${nextId},nextUserId:${nextUserId}}`;

html = html.replace(oldDB, newDB);

// Also update home feed limit from 5 to 10
html = html.replace('.slice(0,5)', '.slice(0,10)');

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('✓ index.html updated with seed data');
