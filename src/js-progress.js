// ===== PROGRESS TRACKING & SCORE COMPARISON =====
// Renders progress cards, sparklines, score timelines, and "what changed" diffs.
// Depends on: U.toolHistory, openFramework(), localStorage

var PROGRESS_TOOL_MAP = {
  'Match Probability Calculator': 'v14',
  'Specialty Fit Assessment': 'v13',
  'Research Impact Calculator': 'v7',
  'Financial Planner': 'v11',
  'Career Roadmap Tool': 'v15',
  'Contract & Offer Analyzer': 'v12',
  'RVU Compensation Calculator': 'v4',
  'Application Review': 'v9',
  'Interview Practice': 'v16',
  'Observership Finder': 'v17'
};

var PROGRESS_TOOL_SHORT = {
  'Match Probability Calculator': 'Match Calculator',
  'Specialty Fit Assessment': 'Specialty Fit',
  'Research Impact Calculator': 'Research Impact',
  'Financial Planner': 'Financial Planner',
  'Career Roadmap Tool': 'Career Roadmap',
  'Contract & Offer Analyzer': 'Contract Analyzer',
  'RVU Compensation Calculator': 'RVU Calculator',
  'Application Review': 'App Review',
  'Interview Practice': 'Interview Prep',
  'Observership Finder': 'Observership Finder'
};

var PROGRESS_INPUT_LABELS = {
  step2: 'Step 2 CK',
  pubs: 'Publications',
  research: 'Research Experience',
  lors: 'Letters of Recommendation',
  lor: 'LOR Strength',
  usce: 'US Clinical Experience',
  yog: 'Year of Graduation',
  step1: 'Step 1',
  visaRequired: 'Visa Required',
  imgStatus: 'IMG Status',
  specialty: 'Specialty',
  publications: 'Publications',
  totalPubs: 'Total Publications',
  firstAuthor: 'First-Author Papers',
  presentations: 'Presentations',
  salary: 'Salary',
  rvu: 'RVU Target',
  programCount: 'Programs Applied',
  connections: 'Connections',
  volunteerMonths: 'Volunteer Months'
};

// ===== HELPER: Parse numeric score from mixed formats =====
function _progParseNum(v) {
  if (typeof v === 'number') return v;
  if (!v) return null;
  var n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

// ===== HELPER: Format date nicely =====
function _progFmtDate(isoStr) {
  if (!isoStr) return '—';
  var d = new Date(isoStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== HELPER: Days between date and now =====
function _progDaysAgo(isoStr) {
  if (!isoStr) return 0;
  var d = new Date(isoStr);
  if (isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// ===== 5. getToolRunStats(toolName) =====
function getToolRunStats(toolName) {
  var hist = (U && U.toolHistory) ? U.toolHistory : [];
  var runs = hist.filter(function(t) { return t.tool === toolName; });
  if (!runs.length) return null;

  var scored = runs.filter(function(r) { return _progParseNum(r.score) !== null; });
  var allScores = scored.map(function(r) { return _progParseNum(r.score); });

  var firstRun = runs[0];
  var lastRun = runs[runs.length - 1];
  var firstScore = scored.length ? _progParseNum(scored[0].score) : null;
  var bestScore = allScores.length ? Math.max.apply(null, allScores) : null;
  var lastScore = scored.length ? _progParseNum(scored[scored.length - 1].score) : null;

  return {
    totalRuns: runs.length,
    firstRun: { score: firstRun.score, date: firstRun.date },
    lastRun: { score: lastRun.score, date: lastRun.date, data: lastRun.data || null },
    bestScore: bestScore,
    delta: (bestScore !== null && firstScore !== null) ? bestScore - firstScore : null,
    daysSinceLastRun: _progDaysAgo(lastRun.date),
    allScores: allScores,
    allRuns: runs
  };
}

// ===== 1. renderProgressCard(targetEl) =====
function renderProgressCard(targetEl) {
  var el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
  if (!el) return;

  var hist = (U && U.toolHistory) ? U.toolHistory : [];
  var h = '';

  h += '<div style="padding:24px;background:#111318;border:1px solid rgba(198,168,94,.15);border-radius:14px">';
  h += '<div style="font-family:var(--font-serif);font-size:16px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px">Your Progress</div>';

  var toolNames = Object.keys(PROGRESS_TOOL_MAP);
  var anyRun = false;

  toolNames.forEach(function(fullName) {
    var toolId = PROGRESS_TOOL_MAP[fullName];
    var shortName = PROGRESS_TOOL_SHORT[fullName] || fullName;
    var stats = getToolRunStats(fullName);

    h += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">';

    if (stats) {
      anyRun = true;
      var lastScore = stats.lastRun.score;
      var numScore = _progParseNum(lastScore);
      var delta = stats.delta;

      // Tool name
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:13px;font-weight:600;color:#E8E1D8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + shortName + '</div>';
      h += '<div style="font-size:10px;color:rgba(255,255,255,.35)">' + stats.totalRuns + ' run' + (stats.totalRuns > 1 ? 's' : '') + '</div>';
      h += '</div>';

      // Score display
      if (numScore !== null) {
        // Progress bar for 0-100 scale scores
        var pct = Math.min(100, Math.max(0, numScore));
        h += '<div style="width:80px;flex-shrink:0">';
        h += '<div style="font-size:13px;font-weight:700;color:#C6A85E;margin-bottom:3px">' + lastScore + '</div>';
        h += '<div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden">';
        h += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#C6A85E,#D4B96E);border-radius:2px"></div>';
        h += '</div></div>';
      } else {
        // Non-numeric score (e.g. "IM (91% fit)")
        h += '<div style="font-size:12px;font-weight:600;color:#C6A85E;flex-shrink:0;max-width:120px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (lastScore || 'Done') + '</div>';
      }

      // Delta badge
      if (delta !== null && stats.totalRuns > 1) {
        var deltaColor = delta > 0 ? '#5E8B6F' : delta < 0 ? '#B85C5C' : 'rgba(255,255,255,.35)';
        var deltaSign = delta > 0 ? '+' : '';
        h += '<div style="font-size:11px;font-weight:600;color:' + deltaColor + ';min-width:48px;text-align:right">' + deltaSign + delta.toFixed(0) + '</div>';
      } else {
        h += '<div style="min-width:48px"></div>';
      }
    } else {
      // Not yet run
      h += '<div style="flex:1;font-size:13px;color:rgba(255,255,255,.3)">' + shortName + '</div>';
      h += '<div style="flex-shrink:0"><span onclick="openFramework(\'' + toolId + '\')" style="font-size:11px;color:#C6A85E;cursor:pointer;padding:4px 12px;border:1px solid rgba(198,168,94,.25);border-radius:6px;transition:all .15s" onmouseenter="this.style.background=\'rgba(198,168,94,.12)\'" onmouseleave="this.style.background=\'transparent\'">Run now →</span></div>';
      h += '<div style="min-width:48px"></div>';
    }

    h += '</div>';
  });

  // Summary footer
  var totalRuns = hist.length;
  var lastActive = hist.length ? _progFmtDate(hist[hist.length - 1].date) : '—';
  var uniqueTools = [];
  hist.forEach(function(t) { if (uniqueTools.indexOf(t.tool) < 0) uniqueTools.push(t.tool); });

  h += '<div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">';
  h += '<div style="font-size:10px;color:rgba(255,255,255,.35)">Last active: ' + lastActive + '</div>';
  h += '<div style="font-size:10px;color:rgba(255,255,255,.35)">Total runs: ' + totalRuns + ' · ' + uniqueTools.length + ' tool' + (uniqueTools.length !== 1 ? 's' : '') + '</div>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}

// ===== 2. renderScoreTimeline(targetEl) =====
function renderScoreTimeline(targetEl) {
  var el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
  if (!el) return;

  var stats = getToolRunStats('Match Probability Calculator');
  if (!stats || stats.allScores.length < 2) {
    el.innerHTML = '<div style="padding:20px;background:#111318;border:1px solid rgba(198,168,94,.15);border-radius:14px;text-align:center;color:rgba(255,255,255,.35);font-size:12px">Run the Match Calculator at least twice to see your score timeline.</div>';
    return;
  }

  var runs = stats.allRuns.filter(function(r) { return _progParseNum(r.score) !== null; });
  var scores = runs.map(function(r) { return _progParseNum(r.score); });
  var dates = runs.map(function(r) { return r.date; });

  var minS = Math.min.apply(null, scores);
  var maxS = Math.max.apply(null, scores);
  var range = maxS - minS || 1;
  var padBottom = 10;

  // SVG dimensions
  var svgW = 280;
  var svgH = 80;
  var plotH = svgH - padBottom;
  var marginL = 5;
  var marginR = 5;
  var plotW = svgW - marginL - marginR;

  // Calculate points
  var pts = scores.map(function(s, i) {
    var x = marginL + (scores.length === 1 ? plotW / 2 : (i / (scores.length - 1)) * plotW);
    var y = 4 + (plotH - 8) - ((s - minS) / range) * (plotH - 8);
    return { x: x, y: y, score: s };
  });

  var polyline = pts.map(function(p) { return p.x + ',' + p.y; }).join(' ');

  // Build SVG
  var svg = '<svg width="100%" viewBox="0 0 ' + svgW + ' ' + svgH + '" style="display:block;max-width:100%">';
  // Line
  svg += '<polyline points="' + polyline + '" fill="none" stroke="#C6A85E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  // Area fill (subtle)
  var areaPath = 'M' + pts[0].x + ',' + pts[0].y;
  pts.forEach(function(p, i) { if (i > 0) areaPath += ' L' + p.x + ',' + p.y; });
  areaPath += ' L' + pts[pts.length - 1].x + ',' + plotH + ' L' + pts[0].x + ',' + plotH + ' Z';
  svg += '<path d="' + areaPath + '" fill="url(#progGrad)" opacity="0.25"/>';
  svg += '<defs><linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C6A85E"/><stop offset="100%" stop-color="#C6A85E" stop-opacity="0"/></linearGradient></defs>';
  // Data points
  pts.forEach(function(p) {
    svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.5" fill="#111318" stroke="#C6A85E" stroke-width="2"/>';
  });
  svg += '</svg>';

  // Score labels below chart
  var labels = '';
  pts.forEach(function(p, i) {
    var left = (p.x / svgW) * 100;
    var dateStr = new Date(dates[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels += '<div style="position:absolute;left:' + left + '%;transform:translateX(-50%);text-align:center;white-space:nowrap">';
    labels += '<div style="font-size:12px;font-weight:700;color:#E8E1D8">' + p.score + '</div>';
    labels += '<div style="font-size:9px;color:rgba(255,255,255,.35)">' + dateStr + '</div>';
    labels += '</div>';
  });

  var totalDelta = scores[scores.length - 1] - scores[0];
  var deltaColor = totalDelta > 0 ? '#5E8B6F' : totalDelta < 0 ? '#B85C5C' : 'rgba(255,255,255,.35)';
  var deltaSign = totalDelta > 0 ? '+' : '';

  var h = '<div style="padding:20px 24px;background:#111318;border:1px solid rgba(198,168,94,.15);border-radius:14px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h += '<div style="font-family:var(--font-serif);font-size:13px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px">Match Score Over Time</div>';
  h += '<div style="font-size:12px;font-weight:700;color:' + deltaColor + '">' + deltaSign + totalDelta.toFixed(0) + ' from start</div>';
  h += '</div>';
  h += '<div style="margin-bottom:8px">' + svg + '</div>';
  h += '<div style="position:relative;height:32px;margin-top:4px">' + labels + '</div>';
  h += '</div>';

  el.innerHTML = h;
}

// ===== 3. renderWhatChanged(targetEl) =====

function compareToolRuns(current, previous) {
  if (!current || !previous) return [];
  var changes = [];
  var allKeys = {};
  var k;
  for (k in current) { if (current.hasOwnProperty(k)) allKeys[k] = true; }
  for (k in previous) { if (previous.hasOwnProperty(k)) allKeys[k] = true; }

  Object.keys(allKeys).forEach(function(key) {
    var curVal = current[key];
    var prevVal = previous[key];
    if (String(curVal) !== String(prevVal)) {
      var label = PROGRESS_INPUT_LABELS[key] || key;
      var curNum = _progParseNum(curVal);
      var prevNum = _progParseNum(prevVal);
      var numDelta = (curNum !== null && prevNum !== null) ? curNum - prevNum : null;
      changes.push({
        field: label,
        from: prevVal,
        to: curVal,
        numDelta: numDelta
      });
    }
  });

  return changes;
}

function renderWhatChanged(targetEl) {
  var el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
  if (!el) return;

  // Find the most recently used tool with ≥2 runs that have input data
  var hist = (U && U.toolHistory) ? U.toolHistory : [];
  if (hist.length < 2) {
    el.innerHTML = '';
    return;
  }

  // Work backwards to find the latest tool with comparable data
  var latest = hist[hist.length - 1];
  var toolRuns = hist.filter(function(t) { return t.tool === latest.tool; });
  if (toolRuns.length < 2) {
    el.innerHTML = '';
    return;
  }

  var currentRun = toolRuns[toolRuns.length - 1];
  var previousRun = toolRuns[toolRuns.length - 2];
  var currentInputs = (currentRun.data && currentRun.data.inputs) ? currentRun.data.inputs : null;
  var previousInputs = (previousRun.data && previousRun.data.inputs) ? previousRun.data.inputs : null;

  var curScore = _progParseNum(currentRun.score);
  var prevScore = _progParseNum(previousRun.score);
  var scoreDelta = (curScore !== null && prevScore !== null) ? curScore - prevScore : null;

  // If no inputs to compare and no score change, nothing to show
  if (!currentInputs && !previousInputs && scoreDelta === null) {
    el.innerHTML = '';
    return;
  }

  var changes = (currentInputs && previousInputs) ? compareToolRuns(currentInputs, previousInputs) : [];
  var shortName = PROGRESS_TOOL_SHORT[latest.tool] || latest.tool;

  var h = '<div style="padding:20px 24px;background:#111318;border:1px solid rgba(198,168,94,.15);border-radius:14px">';
  h += '<div style="font-family:var(--font-serif);font-size:13px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px">What Changed Since Last Run</div>';

  // Score delta
  if (scoreDelta !== null) {
    var scoreColor = scoreDelta > 0 ? '#5E8B6F' : scoreDelta < 0 ? '#B85C5C' : 'rgba(255,255,255,.5)';
    var scoreSign = scoreDelta > 0 ? '+' : '';
    h += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.03);border-radius:10px;margin-bottom:12px">';
    h += '<div style="font-size:12px;color:rgba(255,255,255,.5)">Score:</div>';
    h += '<div style="font-size:14px;color:#E8E1D8">' + previousRun.score + ' → <strong style="color:' + scoreColor + '">' + currentRun.score + '</strong></div>';
    h += '<div style="font-size:13px;font-weight:700;color:' + scoreColor + ';margin-left:auto">(' + scoreSign + scoreDelta.toFixed(0) + ')</div>';
    h += '</div>';
  }

  // Input changes
  if (changes.length) {
    // Sort: biggest numeric improvements first
    changes.sort(function(a, b) {
      var aD = a.numDelta !== null ? Math.abs(a.numDelta) : 0;
      var bD = b.numDelta !== null ? Math.abs(b.numDelta) : 0;
      return bD - aD;
    });

    var improvements = changes.filter(function(c) { return c.numDelta !== null && c.numDelta > 0; });
    var declines = changes.filter(function(c) { return c.numDelta !== null && c.numDelta < 0; });
    var otherChanges = changes.filter(function(c) { return c.numDelta === null || c.numDelta === 0; });

    if (improvements.length) {
      h += '<div style="font-size:10px;font-weight:600;color:#5E8B6F;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Improvements</div>';
      improvements.forEach(function(c) {
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)">';
        h += '<div style="font-size:12px;color:rgba(255,255,255,.5);flex:1">' + c.field + '</div>';
        h += '<div style="font-size:12px;color:#E8E1D8">' + c.from + ' → ' + c.to + '</div>';
        h += '<div style="font-size:11px;font-weight:600;color:#5E8B6F;min-width:36px;text-align:right">+' + c.numDelta + '</div>';
        h += '</div>';
      });
    }

    if (declines.length) {
      h += '<div style="font-size:10px;font-weight:600;color:#B85C5C;text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">Declined</div>';
      declines.forEach(function(c) {
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)">';
        h += '<div style="font-size:12px;color:rgba(255,255,255,.5);flex:1">' + c.field + '</div>';
        h += '<div style="font-size:12px;color:#E8E1D8">' + c.from + ' → ' + c.to + '</div>';
        h += '<div style="font-size:11px;font-weight:600;color:#B85C5C;min-width:36px;text-align:right">' + c.numDelta + '</div>';
        h += '</div>';
      });
    }

    if (otherChanges.length) {
      h += '<div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">Other Changes</div>';
      otherChanges.forEach(function(c) {
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)">';
        h += '<div style="font-size:12px;color:rgba(255,255,255,.5);flex:1">' + c.field + '</div>';
        h += '<div style="font-size:12px;color:#E8E1D8">' + (c.from || '—') + ' → ' + (c.to || '—') + '</div>';
        h += '</div>';
      });
    }

    // Insight narrative
    if (scoreDelta !== null && scoreDelta > 0 && improvements.length) {
      var biggest = improvements[0];
      h += '<div style="margin-top:14px;padding:12px 14px;background:rgba(94,139,111,.06);border:1px solid rgba(94,139,111,.15);border-radius:10px">';
      h += '<div style="font-size:12px;color:#E8E1D8;line-height:1.6;font-family:var(--font-serif)">';
      h += '💡 Improving <strong style="color:#5E8B6F">' + biggest.field + '</strong> ';
      h += '(' + biggest.from + ' → ' + biggest.to + ') ';
      if (scoreDelta) {
        h += 'helped move your score <strong style="color:#5E8B6F">+' + scoreDelta.toFixed(0) + ' points</strong>. ';
      }
      h += 'Keep building on what\u2019s working.';
      h += '</div></div>';
    } else if (scoreDelta !== null && scoreDelta < 0 && declines.length) {
      var biggestDrop = declines[0];
      h += '<div style="margin-top:14px;padding:12px 14px;background:rgba(184,92,92,.06);border:1px solid rgba(184,92,92,.15);border-radius:10px">';
      h += '<div style="font-size:12px;color:#E8E1D8;line-height:1.6;font-family:var(--font-serif)">';
      h += '⚠️ Your score dipped <strong style="color:#B85C5C">' + scoreDelta.toFixed(0) + ' points</strong>. ';
      h += 'The change in <strong>' + biggestDrop.field + '</strong> may have contributed. ';
      h += 'Review your inputs carefully — small corrections can recover lost ground.';
      h += '</div></div>';
    }
  } else if (scoreDelta !== null && changes.length === 0) {
    // Score changed but we don't have input diffs
    h += '<div style="margin-top:8px;padding:10px 14px;background:rgba(255,255,255,.03);border-radius:8px">';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.4);font-style:italic">Input details not available for comparison. Run the tool again to start tracking changes.</div>';
    h += '</div>';
  }

  h += '</div>';
  el.innerHTML = h;
}

// ===== 4. renderReRunPrompt(toolId, targetEl) =====
function renderReRunPrompt(toolId, targetEl) {
  var el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
  if (!el) return;

  // Reverse-lookup tool name from ID
  var toolName = null;
  var shortName = null;
  Object.keys(PROGRESS_TOOL_MAP).forEach(function(name) {
    if (PROGRESS_TOOL_MAP[name] === toolId) {
      toolName = name;
      shortName = PROGRESS_TOOL_SHORT[name] || name;
    }
  });

  if (!toolName) { el.innerHTML = ''; return; }

  var stats = getToolRunStats(toolName);
  if (!stats) { el.innerHTML = ''; return; }

  var days = stats.daysSinceLastRun;
  var lastScore = stats.lastRun.score;
  var h = '';

  h += '<div style="padding:16px 20px;background:linear-gradient(160deg,#111318,rgba(198,168,94,.04));border:1px solid rgba(198,168,94,.15);border-radius:12px;display:flex;align-items:center;gap:14px">';
  h += '<div style="font-size:22px;flex-shrink:0">📊</div>';
  h += '<div style="flex:1">';
  h += '<div style="font-size:13px;color:#E8E1D8;line-height:1.5">';
  h += 'You last ran <strong style="color:#C6A85E">' + shortName + '</strong> ';

  if (days === 0) {
    h += 'today';
  } else if (days === 1) {
    h += 'yesterday';
  } else {
    h += '<strong>' + days + ' days ago</strong>';
  }

  if (lastScore) h += ' (score: <strong style="color:#C6A85E">' + lastScore + '</strong>)';
  h += '.</div>';

  if (days > 7) {
    h += '<div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">Has anything changed? Re-run to see your updated score.</div>';
  }

  h += '</div>';
  h += '<div onclick="openFramework(\'' + toolId + '\')" style="flex-shrink:0;padding:8px 16px;background:#C6A85E;color:#111318;font-size:11px;font-weight:700;border-radius:8px;cursor:pointer;transition:opacity .15s;white-space:nowrap" onmouseenter="this.style.opacity=\'0.85\'" onmouseleave="this.style.opacity=\'1\'">Re-Run →</div>';
  h += '</div>';

  el.innerHTML = h;
}
