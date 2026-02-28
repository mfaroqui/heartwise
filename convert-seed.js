#!/usr/bin/env node
// Converts old seed-data.js Q&As into new structured AI format
// and merges with existing js-data.js seed questions

const fs = require('fs');
const path = require('path');

// Read old seed data
const seedSrc = fs.readFileSync(path.join(__dirname, 'seed-data.js'), 'utf8');
const arrStart = seedSrc.indexOf('[');
const arrEnd = seedSrc.indexOf('];');
let QA;
eval('QA = ' + seedSrc.substring(arrStart, arrEnd + 1));
console.log('Old Q&As loaded:', QA.length);

// Read current js-data.js to get existing IDs
const curData = fs.readFileSync(path.join(__dirname, 'src/js-data.js'), 'utf8');
const existingIds = new Set();
for (const m of curData.matchAll(/id:(\d+),cat:/g)) existingIds.add(parseInt(m[1]));
console.log('Existing structured Qs:', existingIds.size);

// Map old categories to new
const catMap = { education: 'clinical', clinical: 'clinical', finance: 'finance', career: 'career', wellness: 'wellness' };
// More specific mapping
function mapCat(c, q) {
  if (c === 'education') {
    if (/fellowship|match|apply|program/i.test(q)) return 'fellowship';
    if (/contract|salary|RVU|negotiat/i.test(q)) return 'contract';
    return 'clinical';
  }
  if (c === 'career') {
    if (/fellowship|match|apply/i.test(q)) return 'fellowship';
    if (/contract|salary|offer|RVU/i.test(q)) return 'contract';
    return 'career';
  }
  if (c === 'finance') {
    if (/contract|negotiat|salary|RVU/i.test(q)) return 'contract';
    return 'finance';
  }
  return c;
}

// Seed users for author names
const AUTHORS = {
  student: ['Anonymous', 'Priya K.', 'Anonymous', 'Marcus T.', 'Anonymous', 'Emily C.', 'Anonymous', 'David L.'],
  resident: ['Sarah M.', 'Anonymous', 'Jason W.', 'Anonymous', 'Aisha N.', 'Anonymous', 'Chris B.', 'Anonymous'],
  fellow: ['Anonymous', 'Rachel P.', 'Anonymous', 'Omar H.', 'Anonymous', 'Lisa G.', 'Anonymous', 'Kevin D.']
};

// Generate structured AI response from old Q&A
function makeAI(q) {
  // Extract key sentences from answer for structured format
  const sentences = q.a.split(/\.\s+/).filter(s => s.length > 20);
  const diag = sentences.slice(0, 2).join('. ') + '.';
  
  // Find the "but" or "key" or "real" insight for bottleneck
  const bottleneckSentence = sentences.find(s => /but |key |real |most important|critical|biggest/i.test(s)) || sentences[2] || sentences[1];
  const bottleneck = bottleneckSentence ? bottleneckSentence.trim() + '.' : 'Focus on the fundamentals first.';
  
  // Extract actionable items for plan
  const plan = [];
  const numbered = q.a.match(/\d\)\s*[^.]+/g);
  if (numbered) {
    numbered.forEach(n => plan.push(n.replace(/^\d\)\s*/, '').trim()));
  }
  if (plan.length < 3) {
    // Extract sentences that sound like advice
    sentences.forEach(s => {
      if (plan.length < 6 && /should|focus|start|aim|get|do |try|make sure|consider/i.test(s) && s.length < 200) {
        plan.push(s.trim());
      }
    });
  }
  if (plan.length < 3) {
    plan.push(...sentences.slice(1, 4).map(s => s.trim()));
  }
  
  // Extract mistakes/warnings
  const mistakes = [];
  sentences.forEach(s => {
    if (mistakes.length < 4 && /don't|avoid|never|mistake|worst|bad idea|not worth/i.test(s) && s.length < 200) {
      mistakes.push(s.trim());
    }
  });
  if (mistakes.length < 2) {
    mistakes.push('Not starting early enough', 'Relying on a single source or mentor');
  }
  
  // Action plan from last sentences
  const action = sentences.slice(-2).join('. ').trim() + '.';
  
  // Escalation
  const escalate = /contract|salary|financial|loan|PSLF|negotiat|invest|insurance/i.test(q.q);
  
  return {
    diag,
    bottleneck,
    plan: plan.slice(0, 6),
    mistakes: mistakes.slice(0, 4),
    action,
    escalate,
    ereason: escalate ? 'High-impact decision may benefit from Doctor Review.' : 'AI framework covers this topic.'
  };
}

// Date generator spread over 6 months
function makeDate(i) {
  const base = new Date('2026-02-28');
  // Spread evenly: most recent first
  const daysBack = Math.floor((i / QA.length) * 180) + 1;
  const d = new Date(base);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split('T')[0];
}

// Build new questions, skip if ID already exists in structured set
const newQs = [];
let nextId = 500; // start high to avoid conflicts

QA.forEach((q, i) => {
  const cat = mapCat(q.c, q.q);
  const authors = AUTHORS[q.r] || AUTHORS.student;
  const author = authors[i % authors.length];
  const isAnon = author === 'Anonymous';
  
  // Check if this exact question already exists (fuzzy match first 50 chars)
  const qStart = q.q.substring(0, 50).toLowerCase();
  const alreadyExists = curData.toLowerCase().includes(qStart);
  if (alreadyExists) return;
  
  const ai = makeAI(q);
  
  // ~30% get doctor review notes
  const hasReview = i % 3 === 0;
  const reviewNote = hasReview ? q.a.split(/\.\s+/).slice(0, 2).join('. ').trim() + '. \u2014 MF' : undefined;
  
  newQs.push({
    id: nextId++,
    cat,
    role: q.r,
    q: q.q,
    ai,
    status: 'reviewed',
    date: makeDate(i),
    author: isAnon ? 'Anonymous' : author,
    anon: isAnon,
    reviewNote
  });
});

console.log('New Qs to add (non-duplicate):', newQs.length);

// Generate the JS code
let code = '\n// ===== CONVERTED FROM SEED-DATA (109 original Q&As) =====\nconst LEGACY_Q=[\n';
newQs.forEach((q, i) => {
  code += JSON.stringify(q);
  if (i < newQs.length - 1) code += ',\n';
});
code += '\n];\n';

// Now patch js-data.js to include LEGACY_Q in the questions array
let jsData = fs.readFileSync(path.join(__dirname, 'src/js-data.js'), 'utf8');

// Insert LEGACY_Q definition before VAULT_ITEMS
jsData = jsData.replace(
  'const VAULT_ITEMS=[',
  code + '\nconst VAULT_ITEMS=['
);

// Update PENDING_Q to have more items
const pendingSection = jsData.match(/const PENDING_Q=\[[\s\S]*?\];/);
if (pendingSection) {
  const newPending = `const PENDING_Q=[
{id:200,cat:'career',role:'student',q:'Best strategy for choosing between academic and community IM residency if my goal is cardiology fellowship?',status:'pending',date:'2026-02-27',author:'Marcus T.',anon:false,wantsReview:true},
{id:201,cat:'finance',role:'fellow',q:'Should I buy a house during fellowship or wait? $50K saved, spouse works.',status:'pending',date:'2026-02-27',author:'Anonymous',anon:true,wantsReview:true},
{id:202,cat:'contract',role:'fellow',q:'Contract has 2-year restrictive covenant, 30-mile radius. Standard? How to negotiate down?',status:'pending',date:'2026-02-28',author:'Anonymous',anon:true,wantsReview:true},
{id:203,cat:'wellness',role:'resident',q:'Getting married during PGY-3 while applying for fellowship. How to manage both?',status:'pending',date:'2026-02-28',author:'Jason W.',anon:false,wantsReview:false},
{id:204,cat:'career',role:'fellow',q:'Should I pursue advanced heart failure fellowship or interventional? Genuinely interested in both.',status:'pending',date:'2026-02-28',author:'Anonymous',anon:true,wantsReview:true},
{id:205,cat:'finance',role:'attending',q:'First attending year. Wife wants a $600K house, I have $350K in loans. Can we afford this?',status:'pending',date:'2026-02-28',author:'Anonymous',anon:true,wantsReview:true},
{id:206,cat:'clinical',role:'student',q:'How do you systematically read an ECG? What is your step-by-step approach?',status:'pending',date:'2026-02-27',author:'David L.',anon:false,wantsReview:false},
{id:207,cat:'productivity',role:'resident',q:'I spend 3 hours on notes every day after rounds. How do attendings chart so fast?',status:'pending',date:'2026-02-27',author:'Anonymous',anon:true,wantsReview:false}
];`;
  jsData = jsData.replace(pendingSection[0], newPending);
}

fs.writeFileSync(path.join(__dirname, 'src/js-data.js'), jsData);
console.log('Updated js-data.js');

// Now update js-app.js to include LEGACY_Q in DB init
let jsApp = fs.readFileSync(path.join(__dirname, 'src/js-app.js'), 'utf8');
jsApp = jsApp.replace(
  'questions:SEED_Q.concat(PENDING_Q)',
  'questions:SEED_Q.concat(LEGACY_Q).concat(PENDING_Q)'
);
fs.writeFileSync(path.join(__dirname, 'src/js-app.js'), jsApp);
console.log('Updated js-app.js');

// Now build
require('./build.js');
