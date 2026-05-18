// ============================================================================
// HeartWise Email System — Client-Side Triggers
// Calls Supabase Edge Functions to send transactional emails via Resend
//
// This file handles WHEN to trigger emails. The actual email rendering and
// delivery happens server-side in the Supabase Edge Function (send-email).
//
// Email types:
//   welcome        — after signup, stage-specific onboarding
//   tool_complete   — first time running a specific tool
//   monthly_digest  — once per month on first visit
//   reengagement    — activity ping for dormant user detection
//   deadline_reminder — upcoming career deadlines within 30 days
//
// Frequency cap: max 1 email per type per user per day, max 3 emails/week total
// ============================================================================

var HW_EMAIL_ENDPOINT = 'https://kqyvfykbnboesskxovtw.supabase.co/functions/v1/send-email';

// ===== RATE LIMITING & DUPLICATE PREVENTION =====

// Returns a localStorage key for rate limiting
function _hwEmailKey(type, email) {
  return 'hw_email_' + type + '_' + (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Check if this email type was already sent today for this user
function _hwEmailSentToday(type, email) {
  var key = _hwEmailKey(type, email);
  var last = localStorage.getItem(key);
  if (!last) return false;
  var lastDate = new Date(parseInt(last, 10));
  var now = new Date();
  return lastDate.getFullYear() === now.getFullYear() &&
         lastDate.getMonth() === now.getMonth() &&
         lastDate.getDate() === now.getDate();
}

// Mark this email type as sent today
function _hwEmailMarkSent(type, email) {
  var key = _hwEmailKey(type, email);
  localStorage.setItem(key, String(Date.now()));
}

// Weekly cap: max 3 emails total per user per rolling 7-day window
function _hwEmailWeeklyCap(email) {
  var capKey = 'hw_email_log_' + (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  var raw = localStorage.getItem(capKey);
  var log = [];
  if (raw) {
    try { log = JSON.parse(raw); } catch (e) { log = []; }
  }
  var weekAgo = Date.now() - 7 * 86400000;
  // Prune old entries
  log = log.filter(function(ts) { return ts > weekAgo; });
  localStorage.setItem(capKey, JSON.stringify(log));
  return log.length >= 3; // true = at capacity
}

// Record an email send in the weekly log
function _hwEmailLogSend(email) {
  var capKey = 'hw_email_log_' + (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  var raw = localStorage.getItem(capKey);
  var log = [];
  if (raw) {
    try { log = JSON.parse(raw); } catch (e) { log = []; }
  }
  var weekAgo = Date.now() - 7 * 86400000;
  log = log.filter(function(ts) { return ts > weekAgo; });
  log.push(Date.now());
  localStorage.setItem(capKey, JSON.stringify(log));
}

// Combined rate-limit check: returns true if sending is blocked
function _hwEmailBlocked(type, email) {
  if (!email) return true;
  if (_hwEmailSentToday(type, email)) return true;
  if (_hwEmailWeeklyCap(email)) return true;
  return false;
}


// ===== EMAIL TRIGGERS =====

// 1. Welcome email — called once after signup/onboarding
function hwEmailWelcome(user) {
  if (!user || !user.email) return;
  // Only send once ever
  var onceKey = 'hw_email_welcome_sent_' + user.email.toLowerCase();
  if (localStorage.getItem(onceKey)) return;

  hwSendEmail({
    type: 'welcome',
    to: user.email,
    name: user.name || user.email.split('@')[0],
    stage: (user.careerProfile && user.careerProfile.stage) || user.role || 'student',
    specialty: (user.careerProfile && user.careerProfile.specialty) || '',
    pgy: (user.careerProfile && user.careerProfile.pgy) || '',
    goal: (user.careerProfile && user.careerProfile.goal) || ''
  });
  localStorage.setItem(onceKey, '1');
}


// 2. Tool completion email — called after first time running a tool
function hwEmailToolComplete(user, toolName, score) {
  if (!user || !user.email || !toolName) return;

  // Only trigger on first-ever run of this specific tool
  var history = (user.toolHistory || []).filter(function(t) { return t.tool === toolName; });
  if (history.length > 1) return; // Already ran before

  // Per-tool once-ever check
  var toolKey = 'hw_email_tool_' + toolName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + user.email.toLowerCase();
  if (localStorage.getItem(toolKey)) return;

  if (_hwEmailBlocked('tool_complete', user.email)) return;

  hwSendEmail({
    type: 'tool_complete',
    to: user.email,
    name: user.name || user.email.split('@')[0],
    toolName: toolName,
    score: score || null,
    stage: (user.careerProfile && user.careerProfile.stage) || user.role || 'student'
  });

  localStorage.setItem(toolKey, '1');
  _hwEmailMarkSent('tool_complete', user.email);
  _hwEmailLogSend(user.email);
}


// 3. Re-engagement ping — called on each login to record activity
//    The edge function uses this data to decide if/when to send re-engagement emails
//    to users who STOP logging in (14+ days inactive)
function hwEmailReengagement(user) {
  if (!user || !user.email) return;

  // Only ping once per day
  if (_hwEmailSentToday('activity_ping', user.email)) return;

  var lastActive = user.lastActive || user.lastLogin;
  var daysSince = 0;
  if (lastActive) {
    daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
  }

  // Always send the ping (no weekly cap for pings — they're silent server-side tracking)
  hwSendEmail({
    type: 'activity_ping',
    to: user.email,
    name: user.name || user.email.split('@')[0],
    daysSinceActive: daysSince,
    stage: (user.careerProfile && user.careerProfile.stage) || user.role || 'student',
    specialty: (user.careerProfile && user.careerProfile.specialty) || ''
  });

  _hwEmailMarkSent('activity_ping', user.email);
}


// 4. Monthly progress digest — called from renderHome on first visit of the month
function hwEmailMonthlyDigest(user) {
  if (!user || !user.email) return;

  var now = new Date();
  var monthKey = 'hw_digest_' + user.email.toLowerCase() + '_' + now.getFullYear() + '-' + (now.getMonth() + 1);
  if (localStorage.getItem(monthKey)) return; // Already sent this month

  if (_hwEmailBlocked('monthly_digest', user.email)) return;

  // Gather stats
  var toolRuns = (user.toolHistory || []).length;
  var toolNames = [];
  var seen = {};
  (user.toolHistory || []).forEach(function(t) {
    if (!seen[t.tool]) { toolNames.push(t.tool); seen[t.tool] = true; }
  });

  var lastMatchScore = null;
  var matchHistory = (user.toolHistory || []).filter(function(t) {
    return t.tool === 'Match Probability Calculator';
  });
  if (matchHistory.length > 0) {
    lastMatchScore = matchHistory[matchHistory.length - 1].score;
  }

  var cp = user.careerProfile || {};

  // Get upcoming deadlines count (next 30 days)
  var upcomingDeadlines = 0;
  if (typeof hwGetDeadlines === 'function' && cp.stage) {
    try {
      var deadlines = hwGetDeadlines(cp);
      upcomingDeadlines = deadlines.filter(function(d) {
        return d.daysAway >= 0 && d.daysAway <= 30;
      }).length;
    } catch (e) { /* ignore */ }
  }

  hwSendEmail({
    type: 'monthly_digest',
    to: user.email,
    name: user.name || user.email.split('@')[0],
    stage: cp.stage || user.role || 'student',
    specialty: cp.specialty || '',
    pgy: cp.pgy || '',
    toolRuns: toolRuns,
    toolsUsed: toolNames.slice(0, 5), // top 5 unique tools
    lastMatchScore: lastMatchScore,
    upcomingDeadlines: upcomingDeadlines,
    month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });

  localStorage.setItem(monthKey, '1');
  _hwEmailMarkSent('monthly_digest', user.email);
  _hwEmailLogSend(user.email);
}


// 5. Deadline reminder — called from renderHome, checks for deadlines within 30 days
//    Sends at most one deadline reminder per week
function hwEmailDeadlineReminder(user) {
  if (!user || !user.email) return;

  var cp = user.careerProfile || {};
  if (!cp.stage) return; // No career profile yet

  // Only check once per week
  var weekKey = 'hw_email_deadline_week_' + user.email.toLowerCase();
  var lastCheck = localStorage.getItem(weekKey);
  if (lastCheck && (Date.now() - parseInt(lastCheck, 10)) < 7 * 86400000) return;

  if (_hwEmailBlocked('deadline_reminder', user.email)) return;

  // Requires hwGetDeadlines from js-timeline.js
  if (typeof hwGetDeadlines !== 'function') return;

  var deadlines;
  try {
    deadlines = hwGetDeadlines(cp);
  } catch (e) { return; }

  // Find critical/high deadlines within 30 days
  var urgent = deadlines.filter(function(d) {
    return d.daysAway >= 0 && d.daysAway <= 30 &&
           (d.urgency === 'critical' || d.urgency === 'high');
  });

  if (urgent.length === 0) return;

  // Send top 3 most urgent
  var topDeadlines = urgent.slice(0, 3).map(function(d) {
    return {
      title: d.title,
      daysAway: d.daysAway,
      urgency: d.urgency,
      desc: d.desc,
      category: d.category
    };
  });

  hwSendEmail({
    type: 'deadline_reminder',
    to: user.email,
    name: user.name || user.email.split('@')[0],
    stage: cp.stage,
    specialty: cp.specialty || '',
    pgy: cp.pgy || '',
    deadlines: topDeadlines
  });

  localStorage.setItem(weekKey, String(Date.now()));
  _hwEmailMarkSent('deadline_reminder', user.email);
  _hwEmailLogSend(user.email);
}


// ===== CORE SEND FUNCTION =====

function hwSendEmail(payload) {
  if (!payload || !payload.to) return;

  // Don't send emails to admin/test accounts
  var blocked = ['mfaroqui@gmail.com', 'mfaroqui.llc@gmail.com'];
  if (blocked.indexOf(payload.to.toLowerCase()) !== -1) return;

  // Add timestamp
  payload.sentAt = new Date().toISOString();

  fetch(HW_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY // Uses the global SUPABASE_KEY from js-app.js
    },
    body: JSON.stringify(payload)
  }).then(function(resp) {
    if (!resp.ok) {
      console.warn('HeartWise email API returned ' + resp.status);
    }
  }).catch(function(e) {
    console.warn('HeartWise email send failed:', e);
  });
}


// ===== INTEGRATION HOOKS =====
// Call these from the appropriate places in js-app.js:
//
//   After signup/onboarding complete:
//     hwEmailWelcome(U);
//
//   After a tool finishes (in the tool result handler):
//     hwEmailToolComplete(U, toolName, score);
//
//   In renderHome() near the top:
//     if (U) {
//       hwEmailReengagement(U);
//       hwEmailMonthlyDigest(U);
//       hwEmailDeadlineReminder(U);
//     }
