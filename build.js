#!/usr/bin/env node
// Assembles HeartWise app from src/ parts into index.html
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dir = path.join(__dirname, 'src');

const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

// ===== STEP 1: Assemble JS =====
const jsFiles = ['js-data.js', 'observership-data.js', 'js-vault.js', 'js-app.js'];
const jsParts = jsFiles.map(f => read(f));
const combinedJS = jsParts.join('\n');

// ===== STEP 2: Syntax check BEFORE building =====
const tmpFile = path.join(__dirname, '.build-check.tmp.js');
fs.writeFileSync(tmpFile, combinedJS);
try {
  execSync(`node --check "${tmpFile}"`, { stdio: 'pipe' });
  fs.unlinkSync(tmpFile);
} catch (err) {
  fs.unlinkSync(tmpFile);
  const stderr = err.stderr ? err.stderr.toString() : err.message;
  console.error('\n❌ BUILD FAILED — JavaScript syntax error detected!\n');
  console.error(stderr);
  console.error('\nFix the error above before deploying. The old build is untouched.\n');
  process.exit(1);
}
console.log('✅ JavaScript syntax check passed');

// ===== STEP 3: Assemble HTML =====
const html = [
  read('head.html'),
  read('styles.html'),
  read('body-top.html'),
  read('landing.html'),
  read('auth.html'),
  read('screens.html'),
  '\n<script>\n',
  combinedJS,
  '\n<\/script>\n<\/body>\n<\/html>\n'
].join('\n');

// ===== STEP 4: Validate HTML has required elements =====
const checks = [
  { name: 'Supabase init', pattern: 'supabase.createClient' },
  { name: 'Login function', pattern: 'function doLogin(' },
  { name: 'App entry', pattern: 'function enterApp(' },
  { name: 'Database init', pattern: 'function initDB(' }
];
let allGood = true;
checks.forEach(c => {
  if (html.indexOf(c.pattern) === -1) {
    console.error(`❌ Missing required element: ${c.name} (pattern: ${c.pattern})`);
    allGood = false;
  }
});
if (!allGood) {
  console.error('\n❌ BUILD FAILED — Missing required app elements. The old build is untouched.\n');
  process.exit(1);
}
// ===== STEP 4b: Validate screen nesting =====
const screensHtml = read('screens.html');
const scrLines = screensHtml.split('\n');
let scrDepth = 0;
const scrScreens = [];
for (let i = 0; i < scrLines.length; i++) {
  const line = scrLines[i];
  const opens = (line.match(/<div[\s>]/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  scrDepth += opens - closes;
  const scrMatch = line.match(/id="(scr-[^"]+)"/);
  if (scrMatch) scrScreens.push({ scr: scrMatch[1], line: i + 1, depth: scrDepth });
}
// All screens should be at the same depth (inside main-app)
const expectedDepth = scrScreens.length > 0 ? scrScreens[0].depth : null;
let nestingOk = true;
scrScreens.forEach(s => {
  if (s.depth !== expectedDepth) {
    console.error(`❌ Screen ${s.scr} at line ${s.line} has depth ${s.depth} (expected ${expectedDepth}) — broken nesting!`);
    nestingOk = false;
  }
});
if (!nestingOk) {
  console.error('\n❌ BUILD FAILED — Screen div nesting is broken. Navigation will not work.\n');
  process.exit(1);
}
if (scrDepth < 0) {
  console.error(`❌ BUILD FAILED — screens.html has ${Math.abs(scrDepth)} extra </div> tags (final depth: ${scrDepth})\n`);
  process.exit(1);
}
console.log(`✅ Screen nesting check passed (${scrScreens.length} screens, all at depth ${expectedDepth})`);

// ===== STEP 4c: Validate landing page tab nesting =====
const landingHtml = read('landing.html');
const lpLines = landingHtml.split('\n');
let lpDepth = 0;
const lpTabs = [];
for (let i = 0; i < lpLines.length; i++) {
  const line = lpLines[i];
  const opens = (line.match(/<div[\s>]/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  lpDepth += opens - closes;
  // Match lp-tab panel divs (not lp-tab-link nav links)
  const tabMatch = line.match(/class="[^"]*lp-tab[^"]*"[^>]*data-lptab="([^"]+)"/);
  if (tabMatch && !/lp-tab-link/.test(line)) {
    lpTabs.push({ tab: tabMatch[1], line: i + 1, depth: lpDepth });
  }
}
if (lpTabs.length > 0) {
  const lpExpected = lpTabs[0].depth;
  let lpNestOk = true;
  lpTabs.forEach(t => {
    if (t.depth !== lpExpected) {
      console.error(`❌ Landing tab "${t.tab}" at line ${t.line} has depth ${t.depth} (expected ${lpExpected}) — broken nesting!`);
      lpNestOk = false;
    }
  });
  if (!lpNestOk) {
    console.error('\n❌ BUILD FAILED — Landing page tab nesting is broken. Tab navigation will not work.\n');
    process.exit(1);
  }
  console.log(`✅ Landing tab nesting check passed (${lpTabs.length} tabs, all at depth ${lpExpected})`);
} else {
  console.log('⚠️  No landing tabs found (skipping tab nesting check)');
}
if (lpDepth !== 0) {
  console.error(`❌ BUILD FAILED — landing.html has unbalanced divs (final depth: ${lpDepth}, expected 0)`);
  console.error('   This means there are unclosed or extra </div> tags that will break the page layout.\n');
  process.exit(1);
}

console.log('✅ HTML integrity check passed');

// ===== STEP 5: Write output =====
const outPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outPath, html);
console.log('Built index.html:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');

// Copy to 200.html
fs.copyFileSync(outPath, path.join(__dirname, '200.html'));
console.log('Copied to 200.html');

// Sync to deploy/
const deployDir = path.join(__dirname, 'deploy');
if (fs.existsSync(deployDir)) {
  fs.copyFileSync(outPath, path.join(deployDir, 'index.html'));
  fs.copyFileSync(path.join(__dirname, '200.html'), path.join(deployDir, '200.html'));
  console.log('Synced to deploy/');
}
