#!/usr/bin/env node
// Assembles HeartWise app from src/ parts into index.html
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');

const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

const html = [
  read('head.html'),
  read('styles.html'),
  read('body-top.html'),
  read('landing.html'),
  read('auth.html'),
  read('screens.html'),
  '\n<script>\n',
  read('js-data.js'),
  '\n',
  read('js-vault.js'),
  '\n',
  read('js-app.js'),
  '\n<\/script>\n<\/body>\n<\/html>\n'
].join('\n');

const outPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outPath, html);
console.log('Built index.html:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');

// Copy to 200.html
fs.copyFileSync(outPath, path.join(__dirname, '200.html'));
console.log('Copied to 200.html');
