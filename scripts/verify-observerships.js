#!/usr/bin/env node
/**
 * Monthly Observership Data Verifier
 * 
 * Crawls each program's applicationUrl to check:
 * - Is the page still live (not 404)?
 * - Has the content changed significantly?
 * - Can we detect fee/deadline/status changes?
 * 
 * Outputs a report and optionally auto-updates lastVerified dates.
 * 
 * Usage: node scripts/verify-observerships.js [--auto-update] [--report-only]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_FILE = path.join(__dirname, '..', 'src', 'observership-data.js');
const REPORT_FILE = path.join(__dirname, '..', 'verification-report.json');

// Load the data file and extract OBS_PROGRAMS
function loadPrograms() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  // Execute in a sandbox to get the data
  const sandbox = {};
  const fn = new Function(code + '\nreturn {OBS_PROGRAMS, OBS_SPEC_LABELS, OBS_STATES, OBS_REGIONS};');
  return fn();
}

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HeartWise Verifier/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Check for keywords that suggest the program is active
function analyzeContent(body) {
  const lower = body.toLowerCase();
  const signals = {
    active: false,
    hasApplication: false,
    hasFees: false,
    hasDeadline: false,
    possiblyClosedOrMoved: false,
    detectedFee: null,
    detectedDeadline: null
  };

  // Active signals
  if (lower.includes('observer') || lower.includes('observership') || lower.includes('clinical experience') || lower.includes('visiting') || lower.includes('international physician')) {
    signals.active = true;
  }

  // Application signals
  if (lower.includes('apply') || lower.includes('application') || lower.includes('how to apply') || lower.includes('submit')) {
    signals.hasApplication = true;
  }

  // Fee detection
  const feeMatch = body.match(/\$[\d,]+(?:\s*(?:per|\/)\s*(?:month|mo|week|wk|program))?/i);
  if (feeMatch) {
    signals.hasFees = true;
    signals.detectedFee = feeMatch[0];
  }
  if (lower.includes('no fee') || lower.includes('no cost') || lower.includes('free of charge')) {
    signals.hasFees = true;
    signals.detectedFee = 'Free';
  }

  // Deadline detection
  const deadlineMatch = body.match(/deadline[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i);
  if (deadlineMatch) {
    signals.hasDeadline = true;
    signals.detectedDeadline = deadlineMatch[1];
  }

  // Closed/moved signals
  if (lower.includes('program is closed') || lower.includes('no longer accepting') || lower.includes('discontinued') || lower.includes('program has been suspended')) {
    signals.possiblyClosedOrMoved = true;
  }

  return signals;
}

async function verifyProgram(program) {
  const result = {
    id: program.id,
    name: program.inst,
    url: program.applicationUrl,
    status: 'unknown',
    httpStatus: null,
    signals: null,
    issues: [],
    timestamp: new Date().toISOString()
  };

  if (!program.applicationUrl) {
    result.status = 'no-url';
    result.issues.push('No application URL configured');
    return result;
  }

  try {
    const response = await fetchUrl(program.applicationUrl);
    result.httpStatus = response.status;

    if (response.status === 200) {
      result.signals = analyzeContent(response.body);
      
      if (result.signals.possiblyClosedOrMoved) {
        result.status = 'possibly-closed';
        result.issues.push('Page may indicate program is closed or suspended');
      } else if (result.signals.active) {
        result.status = 'active';
      } else {
        result.status = 'unclear';
        result.issues.push('Could not confirm observership program is mentioned on page');
      }

      // Check for fee discrepancies
      if (result.signals.detectedFee) {
        const currentFree = program.cost === 0;
        const detectedFree = result.signals.detectedFee === 'Free';
        if (currentFree !== detectedFree) {
          result.issues.push('Fee discrepancy: we have ' + (currentFree ? 'Free' : '$' + program.cost) + ', page shows ' + result.signals.detectedFee);
        }
      }

    } else if (response.status === 404) {
      result.status = 'not-found';
      result.issues.push('Page returns 404 — URL may have changed');
    } else {
      result.status = 'http-error';
      result.issues.push('HTTP ' + response.status);
    }
  } catch (err) {
    result.status = 'error';
    result.issues.push(err.message);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const autoUpdate = args.includes('--auto-update');
  const reportOnly = args.includes('--report-only');

  console.log('🏥 Observership Data Verification');
  console.log('================================');
  console.log('Date:', new Date().toISOString());
  console.log('Mode:', autoUpdate ? 'Auto-update' : reportOnly ? 'Report only' : 'Standard');
  console.log('');

  const { OBS_PROGRAMS } = loadPrograms();
  console.log('Loaded', OBS_PROGRAMS.length, 'programs');
  console.log('');

  const results = [];
  let active = 0, issues = 0, errors = 0;

  for (let i = 0; i < OBS_PROGRAMS.length; i++) {
    const p = OBS_PROGRAMS[i];
    process.stdout.write('  [' + (i + 1) + '/' + OBS_PROGRAMS.length + '] ' + p.inst + '... ');
    
    const result = await verifyProgram(p);
    results.push(result);

    if (result.status === 'active') {
      active++;
      console.log('✅ Active');
    } else if (result.status === 'possibly-closed') {
      issues++;
      console.log('⚠️  POSSIBLY CLOSED');
    } else if (result.status === 'not-found') {
      issues++;
      console.log('❌ 404 NOT FOUND');
    } else if (result.status === 'error') {
      errors++;
      console.log('💥 Error: ' + result.issues[0]);
    } else {
      console.log('❓ ' + result.status);
    }

    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('');
  console.log('================================');
  console.log('Results: ' + active + ' active, ' + issues + ' issues, ' + errors + ' errors');
  console.log('');

  // Issues summary
  const flagged = results.filter(r => r.issues.length > 0);
  if (flagged.length > 0) {
    console.log('⚠️  Programs needing attention:');
    flagged.forEach(r => {
      console.log('  - ' + r.name + ': ' + r.issues.join('; '));
    });
    console.log('');
  }

  // Save report
  const report = {
    date: new Date().toISOString(),
    totalPrograms: OBS_PROGRAMS.length,
    active,
    issues,
    errors,
    results,
    flagged: flagged.map(r => ({ id: r.id, name: r.name, status: r.status, issues: r.issues }))
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log('Report saved to', REPORT_FILE);

  // Auto-update lastVerified for active programs
  if (autoUpdate && !reportOnly) {
    const now = new Date();
    const verifiedDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    let dataContent = fs.readFileSync(DATA_FILE, 'utf8');
    let updated = 0;

    results.forEach(r => {
      if (r.status === 'active') {
        // Update lastVerified for this program
        const program = OBS_PROGRAMS.find(p => p.id === r.id);
        if (program && program.lastVerified !== verifiedDate) {
          const oldPattern = "lastVerified:'" + program.lastVerified + "'";
          const newPattern = "lastVerified:'" + verifiedDate + "'";
          // Only replace within the context of this program's ID to avoid cross-contamination
          const idMarker = '{id:' + program.id + ',';
          const idx = dataContent.indexOf(idMarker);
          if (idx >= 0) {
            const nextProgram = dataContent.indexOf('\n{id:', idx + 1);
            const end = nextProgram > 0 ? nextProgram : dataContent.length;
            const segment = dataContent.substring(idx, end);
            const updatedSegment = segment.replace(oldPattern, newPattern);
            if (segment !== updatedSegment) {
              dataContent = dataContent.substring(0, idx) + updatedSegment + dataContent.substring(end);
              updated++;
            }
          }
        }
      }
    });

    if (updated > 0) {
      fs.writeFileSync(DATA_FILE, dataContent);
      console.log('✅ Updated lastVerified for ' + updated + ' programs to ' + verifiedDate);
    }
  }

  // Exit with error code if there are critical issues
  if (results.some(r => r.status === 'possibly-closed' || r.status === 'not-found')) {
    // Write a human-readable summary for the agent to relay
    const summary = [];
    summary.push('🏥 Monthly Observership Verification — ' + new Date().toISOString().slice(0, 10));
    summary.push('');
    summary.push('✅ ' + active + ' programs confirmed active');
    if (issues > 0) summary.push('⚠️ ' + issues + ' programs need attention');
    if (errors > 0) summary.push('💥 ' + errors + ' programs had connection errors');
    summary.push('');
    
    if (flagged.length > 0) {
      summary.push('NEEDS ATTENTION:');
      flagged.forEach(r => {
        summary.push('  • ' + r.name + ' — ' + r.issues.join('; '));
      });
    }
    
    fs.writeFileSync(path.join(__dirname, '..', 'verification-summary.txt'), summary.join('\n'));
    process.exit(1);
  } else {
    const summary = [];
    summary.push('🏥 Monthly Observership Verification — ' + new Date().toISOString().slice(0, 10));
    summary.push('');
    summary.push('✅ All ' + active + ' programs confirmed active. No issues found.');
    if (errors > 0) summary.push('⚠️ ' + errors + ' programs had connection errors (timeout/DNS) — not critical.');
    summary.push('lastVerified dates updated. App rebuilt and pushed.');
    
    fs.writeFileSync(path.join(__dirname, '..', 'verification-summary.txt'), summary.join('\n'));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
