// ===== CAREER TIMELINE DASHBOARD =====
// The Career Map — personalized, stage-aware, deadline-driven career dashboard
// Replaces generic home screen with individualized career intelligence

// ===== SECTION 1: SPECIALTY & DEADLINE DATA ENGINE =====

var HW_SPECIALTIES = {
  // Primary Care / Less Competitive
  'family medicine':       { competitiveness: 'low',    avgStep2: 232, avgPubs: 0.8,  residencyYears: 3, fellowshipAvail: false, abbr: 'FM' },
  'internal medicine':     { competitiveness: 'low',    avgStep2: 238, avgPubs: 1.2,  residencyYears: 3, fellowshipAvail: true,  abbr: 'IM' },
  'pediatrics':            { competitiveness: 'low',    avgStep2: 237, avgPubs: 1.1,  residencyYears: 3, fellowshipAvail: true,  abbr: 'Peds' },
  'psychiatry':            { competitiveness: 'low',    avgStep2: 236, avgPubs: 1.0,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Psych' },
  'physical medicine':     { competitiveness: 'low',    avgStep2: 235, avgPubs: 0.9,  residencyYears: 4, fellowshipAvail: true,  abbr: 'PM&R' },
  'pathology':             { competitiveness: 'low',    avgStep2: 237, avgPubs: 1.5,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Path' },

  // Moderate Competitiveness
  'emergency medicine':    { competitiveness: 'moderate', avgStep2: 240, avgPubs: 1.5,  residencyYears: 3, fellowshipAvail: true,  abbr: 'EM' },
  'neurology':             { competitiveness: 'moderate', avgStep2: 244, avgPubs: 2.0,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Neuro' },
  'anesthesiology':        { competitiveness: 'moderate', avgStep2: 244, avgPubs: 1.8,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Anes' },
  'radiology':             { competitiveness: 'moderate', avgStep2: 250, avgPubs: 2.8,  residencyYears: 5, fellowshipAvail: true,  abbr: 'Rads' },
  'obstetrics':            { competitiveness: 'moderate', avgStep2: 242, avgPubs: 1.5,  residencyYears: 4, fellowshipAvail: true,  abbr: 'OB/GYN' },
  'surgery':               { competitiveness: 'high',    avgStep2: 249, avgPubs: 3.0,  residencyYears: 5, fellowshipAvail: true,  abbr: 'GS' },
  'ophthalmology':         { competitiveness: 'high',    avgStep2: 252, avgPubs: 3.5,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Ophtho' },

  // High Competitiveness
  'dermatology':           { competitiveness: 'high',    avgStep2: 256, avgPubs: 4.2,  residencyYears: 4, fellowshipAvail: true,  abbr: 'Derm' },
  'orthopedic surgery':    { competitiveness: 'high',    avgStep2: 254, avgPubs: 4.5,  residencyYears: 5, fellowshipAvail: true,  abbr: 'Ortho' },
  'urology':               { competitiveness: 'high',    avgStep2: 250, avgPubs: 3.2,  residencyYears: 6, fellowshipAvail: true,  abbr: 'Uro' },
  'plastic surgery':       { competitiveness: 'high',    avgStep2: 253, avgPubs: 4.0,  residencyYears: 6, fellowshipAvail: true,  abbr: 'PRS' },
  'neurosurgery':          { competitiveness: 'high',    avgStep2: 252, avgPubs: 5.5,  residencyYears: 7, fellowshipAvail: true,  abbr: 'NSG' },
  'otolaryngology':        { competitiveness: 'high',    avgStep2: 252, avgPubs: 3.8,  residencyYears: 5, fellowshipAvail: true,  abbr: 'ENT' },
  'radiation oncology':    { competitiveness: 'high',    avgStep2: 250, avgPubs: 4.0,  residencyYears: 5, fellowshipAvail: false, abbr: 'RadOnc' },
  'interventional radiology':{ competitiveness: 'high',  avgStep2: 252, avgPubs: 3.5,  residencyYears: 6, fellowshipAvail: false, abbr: 'IR' },
  'vascular surgery':      { competitiveness: 'high',    avgStep2: 248, avgPubs: 3.0,  residencyYears: 5, fellowshipAvail: true,  abbr: 'VascSurg' },
  'thoracic surgery':      { competitiveness: 'high',    avgStep2: 250, avgPubs: 3.5,  residencyYears: 7, fellowshipAvail: true,  abbr: 'CT Surg' },

  // IM Subspecialties (fellowship)
  'cardiology':            { competitiveness: 'high',    avgStep2: 252, avgPubs: 3.7,  residencyYears: 3, fellowshipYears: 3, fellowshipAvail: true, isFellowship: true, abbr: 'Cards' },
  'gastroenterology':      { competitiveness: 'high',    avgStep2: 248, avgPubs: 3.2,  residencyYears: 3, fellowshipYears: 3, fellowshipAvail: true, isFellowship: true, abbr: 'GI' },
  'pulmonary critical care':{ competitiveness: 'moderate',avgStep2: 244, avgPubs: 2.5,  residencyYears: 3, fellowshipYears: 3, fellowshipAvail: true, isFellowship: true, abbr: 'PCC' },
  'hematology oncology':   { competitiveness: 'high',    avgStep2: 248, avgPubs: 3.5,  residencyYears: 3, fellowshipYears: 3, fellowshipAvail: true, isFellowship: true, abbr: 'HemOnc' },
  'endocrinology':         { competitiveness: 'low',     avgStep2: 240, avgPubs: 1.8,  residencyYears: 3, fellowshipYears: 2, fellowshipAvail: true, isFellowship: true, abbr: 'Endo' },
  'nephrology':            { competitiveness: 'low',     avgStep2: 238, avgPubs: 1.5,  residencyYears: 3, fellowshipYears: 2, fellowshipAvail: true, isFellowship: true, abbr: 'Nephro' },
  'rheumatology':          { competitiveness: 'moderate', avgStep2: 242, avgPubs: 2.0,  residencyYears: 3, fellowshipYears: 2, fellowshipAvail: true, isFellowship: true, abbr: 'Rheum' },
  'infectious disease':    { competitiveness: 'low',     avgStep2: 238, avgPubs: 2.0,  residencyYears: 3, fellowshipYears: 2, fellowshipAvail: true, isFellowship: true, abbr: 'ID' },
  'interventional cardiology':{ competitiveness: 'high', avgStep2: 255, avgPubs: 5.0,  residencyYears: 3, fellowshipYears: 4, fellowshipAvail: true, isFellowship: true, abbr: 'IC' },
  'electrophysiology':     { competitiveness: 'high',    avgStep2: 252, avgPubs: 4.5,  residencyYears: 3, fellowshipYears: 4, fellowshipAvail: true, isFellowship: true, abbr: 'EP' },
  'allergy immunology':    { competitiveness: 'low',     avgStep2: 236, avgPubs: 1.0,  residencyYears: 3, fellowshipYears: 2, fellowshipAvail: true, isFellowship: true, abbr: 'AI' },
  'sports medicine':       { competitiveness: 'moderate', avgStep2: 240, avgPubs: 1.5,  residencyYears: 3, fellowshipYears: 1, fellowshipAvail: true, isFellowship: true, abbr: 'Sports' },
  'geriatrics':            { competitiveness: 'low',     avgStep2: 232, avgPubs: 0.5,  residencyYears: 3, fellowshipYears: 1, fellowshipAvail: true, isFellowship: true, abbr: 'Geri' },
  'hospice palliative':    { competitiveness: 'low',     avgStep2: 234, avgPubs: 0.8,  residencyYears: 3, fellowshipYears: 1, fellowshipAvail: true, isFellowship: true, abbr: 'HPM' },
  'critical care':         { competitiveness: 'moderate', avgStep2: 244, avgPubs: 2.2,  residencyYears: 5, fellowshipYears: 1, fellowshipAvail: true, isFellowship: true, abbr: 'CCM' },
  'pain medicine':         { competitiveness: 'moderate', avgStep2: 240, avgPubs: 1.5,  residencyYears: 4, fellowshipYears: 1, fellowshipAvail: true, isFellowship: true, abbr: 'Pain' },

  // Other / fallback
  'hospitalist':           { competitiveness: 'low',    avgStep2: 238, avgPubs: 0.5,  residencyYears: 3, fellowshipAvail: false, abbr: 'Hosp' },
  'obesity medicine':      { competitiveness: 'low',    avgStep2: 234, avgPubs: 0.5,  residencyYears: 3, fellowshipAvail: false, abbr: 'Obesity' }
};

// Find best specialty match from user input
function hwFindSpecialty(input) {
  if (!input) return null;
  var key = input.toLowerCase().trim();
  if (HW_SPECIALTIES[key]) return { key: key, data: HW_SPECIALTIES[key] };
  // Partial match
  for (var k in HW_SPECIALTIES) {
    if (k.indexOf(key) >= 0 || key.indexOf(k) >= 0) return { key: k, data: HW_SPECIALTIES[k] };
    if (HW_SPECIALTIES[k].abbr && HW_SPECIALTIES[k].abbr.toLowerCase() === key) return { key: k, data: HW_SPECIALTIES[k] };
  }
  // Fuzzy: check if any word matches
  var words = key.split(/\s+/);
  for (var k2 in HW_SPECIALTIES) {
    for (var w = 0; w < words.length; w++) {
      if (words[w].length > 3 && k2.indexOf(words[w]) >= 0) return { key: k2, data: HW_SPECIALTIES[k2] };
    }
  }
  return null;
}

// ===== REAL CAREER DEADLINES =====
// Returns array of upcoming deadlines based on stage, specialty, goal, and current date
function hwGetDeadlines(cp) {
  var now = new Date();
  var month = now.getMonth(); // 0-indexed
  var year = now.getFullYear();
  var deadlines = [];
  var stage = cp.stage || 'student';
  var pgy = cp.pgy || '';
  var goal = cp.goal || '';
  var spec = hwFindSpecialty(cp.specialty);

  // Helper: create deadline object
  function dl(date, title, desc, urgency, tool, category) {
    var d = new Date(date);
    var daysAway = Math.ceil((d - now) / 86400000);
    if (daysAway < -30) return; // Skip past deadlines (allow 30 day grace)
    deadlines.push({
      date: d,
      daysAway: daysAway,
      title: title,
      desc: desc,
      urgency: urgency || 'normal', // critical, high, normal, info
      tool: tool || null,
      category: category || 'career',
      isPast: daysAway < 0
    });
  }

  // ===== UNIVERSAL DEADLINES =====
  // Tax deadline
  dl(year + '-04-15', 'Tax Filing Deadline', 'File federal taxes. Review deductions for medical expenses, student loan interest.', 'high', 'v8', 'financial');
  // Backdoor Roth IRA
  dl(year + '-04-15', 'Roth IRA Contribution Deadline', 'Last day to contribute to Roth IRA for previous tax year.', 'normal', 'v11', 'financial');

  // ===== MEDICAL STUDENT DEADLINES =====
  if (stage === 'student') {
    var isMS4 = pgy === 'MS4';
    var isMS3 = pgy === 'MS3';
    var isMS2 = pgy === 'MS2';
    var isMS1 = pgy === 'MS1';

    // ERAS opens — September (for current MS4s or next year for MS3s)
    var erasYear = isMS4 ? year : (isMS3 ? year + 1 : year + 2);
    dl(erasYear + '-09-06', 'ERAS Application Opens', 'Submit Day 1 for competitive specialties. Late applications hurt.', 'critical', 'v9', 'application');

    // NRMP Registration — September-October
    dl(erasYear + '-09-15', 'NRMP Registration Opens', 'Register for the Main Residency Match.', 'high', null, 'application');

    // Interview season — October-January
    dl(erasYear + '-10-15', 'Interview Season Begins', 'Interviews start rolling out. Check email constantly.', 'high', 'v16', 'application');

    // Rank List — late February
    var matchYear = isMS4 ? year + 1 : erasYear + 1;
    dl(matchYear + '-02-25', 'NRMP Rank List Deadline', 'Final rank list must be certified. This is irreversible.', 'critical', null, 'application');

    // Match Day — mid March
    dl(matchYear + '-03-17', 'Match Day', 'Results released at noon. Plan your celebration (or backup).', 'critical', null, 'application');

    // SOAP — March (same week as match)
    dl(matchYear + '-03-14', 'SOAP Begins (if unmatched)', 'Supplemental Offer and Acceptance Program opens Monday of Match Week.', 'info', null, 'application');

    // Step 2 CK — recommend by July of MS3/MS4
    var step2Year = (isMS3 || isMS4) ? year : year + 1;
    if (!cp.step2 || parseInt(cp.step2) === 0) {
      dl(step2Year + '-07-01', 'Step 2 CK Target Completion', 'Complete before ERAS opens for score to be included in application.', 'high', 'v14', 'exam');
    }

    // LOR requests — 3-4 months before ERAS
    dl(erasYear + '-05-15', 'Begin Requesting LORs', 'Faculty need 3-4 months lead time. Do not wait until August.', 'high', null, 'application');

    // Personal statement — start drafting summer
    dl(erasYear + '-06-01', 'Start Personal Statement Drafts', 'Begin writing. Plan for 5+ revision cycles before September.', 'normal', null, 'application');

    // Away rotations — applications typically April-June
    if (isMS3 || isMS2) {
      dl((isMS3 ? year : year + 1) + '-04-01', 'Away Rotation Applications Open', 'Apply early — competitive programs fill fast.', 'high', null, 'application');
    }

    // Financial: disability insurance
    dl(year + '-06-30', 'Review Disability Insurance Options', 'Lock in trainee rates before residency. Costs 40%+ more as attending.', 'normal', 'v8', 'financial');
  }

  // ===== RESIDENT DEADLINES =====
  if (stage === 'resident') {
    var isPGY1 = pgy === 'PGY1';
    var isPGY2 = pgy === 'PGY2';
    var isPGY3 = pgy === 'PGY3';

    // Fellowship application (for those targeting fellowship)
    if (goal === 'match' || goal === 'specialty') {
      // ERAS for fellowship — typically opens July, due September
      var fellYear = isPGY2 ? year : (isPGY1 ? year + 1 : year);
      dl(fellYear + '-07-01', 'Fellowship ERAS Opens', 'Begin entering fellowship applications.', 'critical', 'v6', 'application');
      dl(fellYear + '-09-15', 'Fellowship Applications Due', 'Most competitive fellowships review applications starting mid-September.', 'critical', 'v9', 'application');
      dl(fellYear + '-10-01', 'Fellowship Interview Season', 'Interviews begin. Practice with Mock Interview tool.', 'high', 'v16', 'application');
      dl(fellYear + 1 + '-12-01', 'Fellowship Match Day', 'Results released. Plan celebration or backup strategy.', 'critical', null, 'application');

      // LORs for fellowship
      dl(fellYear + '-04-01', 'Request Fellowship LORs', 'Approach division chiefs and PDs now. They need months of lead time.', 'high', null, 'application');

      // Research push
      dl(fellYear + '-03-01', 'Research Submission Deadline Push', 'Submit abstracts to ACC, AHA, DDW, or specialty meetings.', 'high', 'v7', 'application');
    }

    // Step 3 — typically taken PGY1/PGY2
    if (cp.step3 !== 'yes') {
      dl(year + '-06-30', 'Complete USMLE Step 3', 'Most residents complete by end of PGY-1. Required for state licensure and some fellowship apps.', 'high', null, 'exam');
    }

    // Job search for graduating residents not doing fellowship
    if (goal === 'contract' || goal === 'finance') {
      var gradYear = isPGY1 ? year + 2 : (isPGY2 ? year + 1 : year);
      dl(gradYear + '-01-01', 'Begin Attending Job Search', 'Contracts for July starts are posted now. Start early for best options.', 'high', 'v3', 'career');
      dl(gradYear + '-04-01', 'Target: Contract Signed', 'Aim to have a signed contract 3 months before start date.', 'critical', 'v12', 'career');
    }

    // Annual ITE — typically October/November
    dl(year + '-10-15', 'In-Training Exam (ITE)', 'Annual knowledge assessment. Results affect fellowship competitiveness.', 'normal', null, 'exam');

    // Financial
    dl(year + '-10-01', 'Annual PSLF Certification', 'Submit Employment Certification Form (ECF) annually to track qualifying payments.', 'high', 'v8', 'financial');
    dl(year + '-11-01', 'Open Enrollment — Benefits Review', 'Review health insurance, disability, life insurance options.', 'normal', null, 'financial');
  }

  // ===== FELLOW DEADLINES =====
  if (stage === 'fellow') {
    var isF1 = pgy === 'F1';
    var isF2 = pgy === 'F2';
    var isF3 = pgy === 'F3';

    // Job search timeline
    var jobSearchStart = isF1 ? year + 1 : year;
    dl(jobSearchStart + '-01-01', 'Begin Attending Job Search', 'Peak hiring for academic and private practice positions.', 'critical', 'v3', 'career');
    dl(jobSearchStart + '-03-01', 'Target: Multiple Offers in Hand', 'Compare offers systematically. Do not accept the first offer.', 'high', 'v3', 'career');
    dl(jobSearchStart + '-05-01', 'Target: Contract Signed', 'Allow time for attorney review and negotiation rounds.', 'critical', 'v12', 'career');

    // Advanced fellowship (for interventional/EP after general cardiology)
    if (goal === 'match' || goal === 'specialty') {
      if (spec && spec.data && spec.data.isFellowship) {
        dl(year + '-07-01', 'Advanced Fellowship ERAS Opens', 'Enter application for advanced subspecialty fellowship.', 'critical', 'v9', 'application');
      }
    }

    // Board certification
    dl(year + '-08-01', 'Board Exam Registration Window', 'Register for subspecialty board certification exam.', 'high', null, 'exam');

    // Financial
    dl(year + '-06-01', 'Disability Insurance — Last Chance at Trainee Rate', 'Rates increase 40%+ once you become an attending. Lock in now.', 'critical', 'v8', 'financial');
    dl(year + '-10-01', 'Annual PSLF Certification', 'Continue certifying qualifying payments.', 'high', 'v8', 'financial');

    // Graduating fellow
    var gradYear2 = isF1 ? year + 2 : (isF2 ? year + 1 : year);
    dl(gradYear2 + '-05-01', 'Financial Plan Before Attending Salary', 'Map out debt strategy, savings plan, and budget before big salary starts.', 'critical', 'v5', 'financial');
    dl(gradYear2 + '-06-01', 'Set Up Attending Benefits Package', 'Review employer benefits, negotiate sign-on, relocation, CME funds.', 'high', 'v12', 'career');
  }

  // ===== ATTENDING DEADLINES =====
  if (stage === 'attending') {
    var yearsOut = parseInt(cp.yearsout) || 1;

    // Contract renewal — typically annual
    dl(year + '-06-01', 'Review Contract Before Auto-Renewal', 'Most contracts auto-renew. Review terms and benchmark compensation annually.', 'high', 'v12', 'career');

    // Board recertification — every 10 years, MOC ongoing
    if (cp.boards === 'recert' || cp.boards === 'lapsed') {
      dl(year + '-12-31', 'Board Recertification Due', 'Complete MOC requirements and recertification exam.', 'critical', null, 'career');
    }
    dl(year + '-12-31', 'Complete CME Requirements', 'Ensure all CME credits are logged for the year.', 'normal', null, 'career');

    // Financial milestones based on years out
    if (yearsOut <= 2) {
      dl(year + '-01-15', 'Finalize PSLF vs Refinance Decision', 'You have attending salary now. This decision is worth $100K+.', 'critical', 'v8', 'financial');
      dl(year + '-03-01', 'Max Out Retirement Contributions', 'Prioritize 401k/403b match, then backdoor Roth, then taxable.', 'high', 'v11', 'financial');
    }
    if (yearsOut <= 3) {
      dl(year + '-06-01', 'Build Emergency Fund to 6 Months', 'Before aggressive debt payoff, ensure you have a safety net.', 'normal', 'v5', 'financial');
    }
    if (yearsOut >= 3) {
      dl(year + '-09-01', 'Annual Compensation Benchmark', 'Check MGMA/Doximity data. Know if you are underpaid.', 'high', 'v4', 'career');
    }
    // Partnership track
    if (cp.practice === 'pp_associate') {
      dl(year + '-09-01', 'Partnership Track Review', 'Evaluate partnership terms, buy-in, and timeline.', 'high', 'v12', 'career');
    }

    // Estate planning
    dl(year + '-12-01', 'Annual Estate & Insurance Review', 'Review life insurance, disability, will, trust, beneficiary designations.', 'normal', null, 'financial');

    // Quarterly RVU check
    dl(year + '-04-01', 'Q1 RVU / Productivity Review', 'Check your pace against annual targets.', 'normal', 'v4', 'career');
    dl(year + '-07-01', 'Mid-Year RVU / Productivity Review', 'Halfway point. Are you on track for bonus thresholds?', 'normal', 'v4', 'career');
    dl(year + '-10-01', 'Q3 RVU / Productivity Review', 'Last quarter to make up ground for annual targets.', 'high', 'v4', 'career');
  }

  // Sort by date
  deadlines.sort(function(a, b) { return a.daysAway - b.daysAway; });

  // Filter out far-past deadlines
  return deadlines.filter(function(d) { return d.daysAway >= -7; });
}

// ===== SECTION 2: MONTHLY PRIORITIES ALGORITHM =====
// Generates top 3 actionable priorities based on stage, gaps, deadlines, and timing

function hwGetMonthlyPriorities(cp, scores, deadlines) {
  var priorities = [];
  var stage = cp.stage || 'student';
  var goal = cp.goal || '';
  var spec = hwFindSpecialty(cp.specialty);
  var specData = spec ? spec.data : null;
  var now = new Date();
  var pubs = parseInt(cp.pubs) || 0;
  var conf = parseInt(cp.conferences) || 0;
  var lead = parseInt(cp.leadership) || 0;
  var s2 = parseInt(cp.step2) || 0;
  var research = parseInt(cp.research) || 0;
  var lor = cp.lorStrength || '';
  var aways = parseInt(cp.aways) || 0;
  var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
  var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;

  // Priority helper
  function pri(title, desc, urgency, tool, category) {
    priorities.push({
      title: title,
      desc: desc,
      urgency: urgency || 'high', // critical, high, medium
      tool: tool || null,
      category: category || 'career'
    });
  }

  // DEADLINE-DRIVEN PRIORITIES (always come first)
  var urgentDeadlines = deadlines.filter(function(d) {
    return !d.isPast && d.daysAway <= 60 && (d.urgency === 'critical' || d.urgency === 'high');
  });

  urgentDeadlines.slice(0, 2).forEach(function(d) {
    pri(d.title, d.desc + ' — ' + d.daysAway + ' days away', d.urgency === 'critical' ? 'critical' : 'high', d.tool, d.category);
  });

  // GAP-DRIVEN PRIORITIES
  if (stage === 'student') {
    // Step 2 gap
    if (!s2 && (goal === 'match' || goal === 'specialty')) {
      pri('Schedule Step 2 CK', 'This is the single most important score for match competitiveness. Every week you delay reduces preparation time.', 'critical', 'v14', 'exam');
    } else if (s2 && specData && s2 < specData.avgStep2) {
      pri('Step 2 CK Gap: ' + s2 + ' vs ' + specData.avgStep2 + ' avg', 'Your score is below the average for matched ' + (spec ? spec.key : 'applicants') + '. Consider retake strategy or compensate with research.', 'high', 'v14', 'exam');
    }
    // Research gap
    if (specData && pubs < Math.ceil(specData.avgPubs)) {
      var needed = Math.ceil(specData.avgPubs) - pubs;
      pri('Publish ' + needed + ' more paper' + (needed > 1 ? 's' : ''), 'Average matched ' + (spec ? spec.key : 'applicant') + ' has ' + specData.avgPubs + ' publications. You have ' + pubs + '. Start or join a research project this week.', 'high', 'v7', 'research');
    }
    // LOR gap
    if (lor !== 'strong' && (goal === 'match' || goal === 'specialty')) {
      pri('Secure Strong Letters of Recommendation', 'Weak LORs are an application killer. Identify 3 faculty who can write specific, enthusiastic letters.', 'high', null, 'application');
    }
    // Away rotation
    if (aways < 1 && specData && specData.competitiveness !== 'low') {
      pri('Plan Away Rotation at Target Program', 'Away rotations at competitive programs are critical for building connections and demonstrating interest.', 'medium', null, 'application');
    }
  }

  if (stage === 'resident') {
    // Fellowship-specific gaps
    if (goal === 'match' || goal === 'specialty') {
      if (specData && pubs < Math.ceil(specData.avgPubs)) {
        var needed2 = Math.ceil(specData.avgPubs) - pubs;
        pri('Research Gap: Need ' + needed2 + ' more publication' + (needed2 > 1 ? 's' : ''), 'Competitive ' + (spec ? spec.key : 'fellowship') + ' applicants average ' + specData.avgPubs + ' pubs. Start a project you can complete in 6-9 months.', 'high', 'v7', 'research');
      }
      if (lor !== 'strong') {
        pri('Strengthen LOR Portfolio', 'For competitive fellowships, you need letters from division chiefs or nationally recognized faculty. Build those relationships now.', 'high', null, 'application');
      }
      if (lead < 1) {
        pri('Take on a Leadership Role', 'Chief resident, QI lead, or committee chair. Fellowship programs want to see leadership initiative.', 'medium', null, 'application');
      }
    }
    // Job search for those not doing fellowship
    if (goal === 'contract' || goal === 'finance') {
      if (!comp) {
        pri('Research Attending Salary Benchmarks', 'Know your market value before negotiating. MGMA data shows wide ranges — preparation is worth $30K-$80K.', 'high', 'v4', 'career');
      }
      if (debt > 200000) {
        pri('Evaluate PSLF Eligibility', 'With $' + Math.round(debt / 1000) + 'K in debt, PSLF could save you $200K+. Do NOT refinance without running the numbers.', 'critical', 'v8', 'financial');
      }
    }
    // Financial basics for all residents
    if (debt > 0 && !(cp._pslf_reviewed)) {
      pri('Review Loan Repayment Strategy', 'Your repayment strategy should be set now, not after training. Wrong choices cost $50K-$200K.', 'high', 'v8', 'financial');
    }
  }

  if (stage === 'fellow') {
    // Job search priorities
    if (goal === 'contract' || !goal) {
      pri('Benchmark Attending Compensation', 'Understand RVU models, salary ranges, and total comp packages for your specialty and region.', 'high', 'v4', 'career');
      if (!(typeof U !== 'undefined' && U && U.toolHistory && U.toolHistory.some(function(t) { return t.tool === 'Contract Review Tool'; }))) {
        pri('Learn Contract Red Flags', 'Non-competes, tail coverage, RVU thresholds — most fellows sign their first contract blind. Do not be one of them.', 'critical', 'v12', 'career');
      }
    }
    // Financial
    if (debt > 0) {
      pri('Finalize Debt Strategy Before Attending Salary', 'The transition from fellow to attending is the highest-leverage financial moment. Plan now.', 'high', 'v8', 'financial');
    }
    // Research for advanced fellowship
    if (goal === 'match' || goal === 'specialty') {
      if (pubs < 5) {
        pri('Publish Before Advanced Fellowship Deadline', 'Advanced fellowship applications need a strong CV. Push to get papers submitted and accepted.', 'high', 'v7', 'research');
      }
    }
  }

  if (stage === 'attending') {
    // Financial priorities
    var savingsRate = cp.savingsrate || '';
    if (savingsRate === '<10%' || savingsRate === '10-20%') {
      pri('Increase Savings Rate to 20%+', 'At attending salary, every 5% increase in savings rate compounds to hundreds of thousands over your career.', 'critical', 'v11', 'financial');
    }
    if (debt > 100000) {
      pri('Accelerate Loan Payoff', 'With $' + Math.round(debt / 1000) + 'K remaining, an aggressive payoff plan saves $' + Math.round(debt * 0.15 / 1000) + 'K+ in interest.', 'high', 'v8', 'financial');
    }
    // Contract
    if (goal === 'contract') {
      pri('Benchmark Your Compensation', 'Check MGMA data for your specialty, region, and years out. Many attendings are underpaid by $50K+ without knowing it.', 'critical', 'v4', 'career');
    }
    // Career direction
    if (goal === 'direction') {
      var sat = parseInt(cp.satisfaction) || 0;
      if (sat > 0 && sat <= 5) {
        pri('Your satisfaction is ' + sat + '/10 — Explore Options', 'Low satisfaction compounds into burnout. Run a structured career analysis before it becomes a crisis.', 'critical', 'v10', 'career');
      }
    }
    // Productivity tracking
    if (cp.compmodel === 'rvu' || cp.compmodel === 'hybrid' || cp.compmodel === 'eat') {
      pri('Track RVU Pace Against Annual Target', 'Quarterly productivity reviews prevent year-end surprises. Run the RVU calculator with your current numbers.', 'high', 'v4', 'career');
    }
  }

  // De-duplicate (don't repeat deadline-based items in gap-based)
  var seen = {};
  var unique = [];
  priorities.forEach(function(p) {
    var key = p.title.substring(0, 30);
    if (!seen[key]) { seen[key] = true; unique.push(p); }
  });

  // Sort: critical > high > medium
  var urgOrder = { critical: 0, high: 1, medium: 2 };
  unique.sort(function(a, b) { return (urgOrder[a.urgency] || 1) - (urgOrder[b.urgency] || 1); });

  return unique.slice(0, 5);
}


// ===== SECTION 3: PROGRESS STATUS CALCULATOR =====
// For each key dimension, calculate where the user stands vs where they need to be

function hwGetProgressStatus(cp, scores) {
  var stage = cp.stage || 'student';
  var spec = hwFindSpecialty(cp.specialty);
  var specData = spec ? spec.data : null;
  var items = [];
  var pubs = parseInt(cp.pubs) || 0;
  var s2 = parseInt(cp.step2) || 0;
  var conf = parseInt(cp.conferences) || 0;
  var lead = parseInt(cp.leadership) || 0;
  var lor = cp.lorStrength || '';
  var aways = parseInt(cp.aways) || 0;
  var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
  var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;

  function item(label, you, target, status, detail) {
    items.push({ label: label, you: you, target: target, status: status, detail: detail || '' });
  }

  if (stage === 'student' || stage === 'resident') {
    // Step 2
    if (s2) {
      var targetStep = specData ? specData.avgStep2 : 245;
      var stepStatus = s2 >= targetStep + 5 ? 'ahead' : s2 >= targetStep ? 'on-track' : s2 >= targetStep - 10 ? 'gap' : 'behind';
      item('Step 2 CK', String(s2), targetStep + '+', stepStatus,
        stepStatus === 'ahead' ? 'Above average — strong position' :
        stepStatus === 'on-track' ? 'At target range' :
        stepStatus === 'gap' ? 'Below average — compensate with research/LORs' :
        'Significantly below — consider retake or pivot strategy');
    } else {
      item('Step 2 CK', 'Not taken', specData ? specData.avgStep2 + '+' : '245+', 'behind', 'Complete as soon as possible');
    }

    // Publications
    var targetPubs = specData ? Math.ceil(specData.avgPubs) : 2;
    var pubStatus = pubs >= targetPubs + 2 ? 'ahead' : pubs >= targetPubs ? 'on-track' : pubs >= 1 ? 'gap' : 'behind';
    item('Publications', pubs + ' pub' + (pubs !== 1 ? 's' : ''), targetPubs + '+', pubStatus,
      pubStatus === 'ahead' ? 'Strong publication record' :
      pubStatus === 'on-track' ? 'Meeting the benchmark' :
      pubStatus === 'gap' ? (targetPubs - pubs) + ' more needed to reach average' :
      'No publications — this is your biggest gap');

    // LORs
    var lorStatus = lor === 'strong' ? 'on-track' : lor === 'moderate' ? 'gap' : 'behind';
    item('Letters of Rec', lor === 'strong' ? 'Strong' : lor === 'moderate' ? 'Moderate' : 'Incomplete', 'Strong specialty LORs', lorStatus,
      lorStatus === 'on-track' ? 'Strong letters from known faculty' :
      lorStatus === 'gap' ? 'Need letters from department leaders or nationally known faculty' :
      'Start building faculty relationships immediately');

    // Leadership
    var leadStatus = lead >= 2 ? 'ahead' : lead >= 1 ? 'on-track' : 'behind';
    item('Leadership', lead > 0 ? lead + ' role' + (lead > 1 ? 's' : '') : 'None', '1+ meaningful role', leadStatus,
      leadStatus === 'on-track' || leadStatus === 'ahead' ? 'Good — highlight in application' : 'Seek committee chair, QI lead, or chief role');

    // Conferences (if relevant)
    if (specData && specData.competitiveness !== 'low') {
      var confTarget = Math.max(1, Math.ceil(parseFloat(specData.avgPubs) * 0.5));
      var confStatus = conf >= confTarget ? 'on-track' : conf > 0 ? 'gap' : 'behind';
      item('Conferences', conf + ' presentation' + (conf !== 1 ? 's' : ''), confTarget + '+', confStatus,
        confStatus === 'on-track' ? 'Active conference presence' : 'Submit abstracts to national meetings');
    }
  }

  if (stage === 'fellow') {
    // Publications (higher bar)
    var fellPubTarget = specData ? Math.ceil(specData.avgPubs) + 2 : 5;
    var fellPubStatus = pubs >= fellPubTarget ? 'on-track' : pubs >= fellPubTarget - 2 ? 'gap' : 'behind';
    item('Publications', pubs + ' total', fellPubTarget + '+', fellPubStatus,
      fellPubStatus === 'on-track' ? 'Strong for job applications' : 'Publish more for academic positions');

    // Board certification
    var boardStatus = cp.boards === 'certified' ? 'on-track' : cp.boards === 'eligible' ? 'gap' : 'behind';
    item('Board Certification', cp.boards === 'certified' ? 'Certified' : cp.boards === 'eligible' ? 'Eligible' : 'Pending', 'Certified', boardStatus,
      boardStatus === 'on-track' ? 'Certified — strong for negotiations' : 'Complete before starting job search');

    // Job offers
    var offers = parseInt(cp.offers) || 0;
    if (cp.pgy === 'F2' || cp.pgy === 'F3') {
      item('Job Offers', offers > 0 ? offers + ' offer' + (offers > 1 ? 's' : '') : 'None yet', '2-3 offers', offers >= 2 ? 'on-track' : offers >= 1 ? 'gap' : 'behind',
        offers >= 2 ? 'Good leverage for negotiation' : 'Cast a wider net — more offers means more leverage');
    }
  }

  if (stage === 'attending') {
    // Compensation vs benchmark
    if (comp > 0) {
      var mgmaEst = specData ? (specData.competitiveness === 'high' ? 500000 : specData.competitiveness === 'moderate' ? 380000 : 280000) : 350000;
      var compStatus = comp >= mgmaEst * 1.1 ? 'ahead' : comp >= mgmaEst * 0.9 ? 'on-track' : comp >= mgmaEst * 0.75 ? 'gap' : 'behind';
      item('Compensation', '$' + Math.round(comp / 1000) + 'K', '$' + Math.round(mgmaEst / 1000) + 'K median', compStatus,
        compStatus === 'ahead' ? 'Above market median' :
        compStatus === 'on-track' ? 'Within market range' :
        'Below market — consider renegotiation');
    }

    // Debt-to-income
    if (debt > 0 && comp > 0) {
      var dti = debt / comp;
      var dtiStatus = dti < 0.5 ? 'on-track' : dti < 1 ? 'gap' : 'behind';
      item('Debt-to-Income', (dti * 100).toFixed(0) + '%', '<50%', dtiStatus,
        dtiStatus === 'on-track' ? 'Healthy ratio — focus on wealth building' :
        dtiStatus === 'gap' ? 'Prioritize aggressive payoff' :
        'Debt exceeds annual income — make this your #1 financial priority');
    }

    // Savings rate
    var sr = cp.savingsrate || '';
    var srStatus = sr === '>30%' ? 'ahead' : sr === '20-30%' ? 'on-track' : sr === '10-20%' ? 'gap' : sr ? 'behind' : null;
    if (srStatus) {
      item('Savings Rate', sr, '20%+', srStatus,
        srStatus === 'ahead' || srStatus === 'on-track' ? 'On track for early financial freedom' :
        'Increase savings — even 5% more compounds to hundreds of thousands');
    }

    // Net worth
    if (cp.networth) {
      var nw = parseInt(String(cp.networth).replace(/[^0-9-]/g, '')) || 0;
      var yearsOut = parseInt(cp.yearsout) || 1;
      var nwTarget = yearsOut <= 1 ? 0 : yearsOut * 150000;
      var nwStatus = nw >= nwTarget ? 'on-track' : nw >= 0 ? 'gap' : 'behind';
      item('Net Worth', '$' + Math.round(nw / 1000) + 'K', '$' + Math.round(nwTarget / 1000) + 'K (yr ' + yearsOut + ')', nwStatus,
        nwStatus === 'on-track' ? 'Tracking well for your years out of training' :
        nwStatus === 'gap' ? 'Building — increase savings rate or reduce expenses' :
        'Negative net worth — focus on debt elimination first');
    }
  }

  return items;
}


// ===== SECTION 4: FINANCIAL SNAPSHOT =====
function hwGetFinancialSnapshot(cp) {
  var stage = cp.stage || 'student';
  var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
  var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;
  var nw = cp.networth ? parseInt(String(cp.networth).replace(/[^0-9-]/g, '')) || 0 : null;
  var sr = cp.savingsrate || '';
  var snapshot = { hasData: false, lines: [] };

  if (stage === 'student') {
    if (debt > 0) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Student Loans', value: '$' + Math.round(debt / 1000) + 'K', color: 'var(--red)' });
      snapshot.lines.push({ label: 'Estimated Interest / Year', value: '$' + Math.round(debt * 0.06 / 1000) + 'K', color: 'var(--text3)', sub: true });
    }
    return snapshot;
  }

  if (stage === 'resident') {
    if (comp) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Resident Salary', value: '$' + comp.toLocaleString(), color: 'var(--text)' });
    }
    if (debt > 0) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Student Loans', value: '$' + Math.round(debt / 1000) + 'K', color: 'var(--red)' });
      // PSLF progress
      var pgy = cp.pgy || 'PGY1';
      var pgyNum = parseInt(pgy.replace(/\D/g, '')) || 1;
      var qualPayments = pgyNum * 12;
      snapshot.lines.push({ label: 'PSLF Payments (est.)', value: qualPayments + ' / 120', color: 'var(--accent)', sub: true });
    }
    return snapshot;
  }

  if (stage === 'fellow') {
    if (comp) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Expected Attending Salary', value: '$' + comp.toLocaleString(), color: 'var(--green)' });
    }
    if (debt > 0) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Student Loans', value: '$' + Math.round(debt / 1000) + 'K', color: 'var(--red)' });
      // PSLF estimate
      var fYear = cp.pgy || 'F1';
      var fNum = parseInt(fYear.replace(/\D/g, '')) || 1;
      var resYears = 3; // approximate
      var qualPayments2 = (resYears + fNum) * 12;
      snapshot.lines.push({ label: 'PSLF Payments (est.)', value: qualPayments2 + ' / 120', color: 'var(--accent)', sub: true });
    }
    return snapshot;
  }

  if (stage === 'attending') {
    if (comp) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Total Compensation', value: '$' + comp.toLocaleString(), color: 'var(--text)' });
    }
    if (debt > 0) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Remaining Loans', value: '$' + Math.round(debt / 1000) + 'K', color: 'var(--red)' });
      if (comp > 0) {
        var monthsToPayoff = Math.ceil(debt / (comp * 0.2 / 12));
        snapshot.lines.push({ label: 'Payoff at 20% income', value: Math.round(monthsToPayoff / 12 * 10) / 10 + ' years', color: 'var(--accent)', sub: true });
      }
    } else {
      snapshot.lines.push({ label: 'Student Loans', value: 'Debt Free ✓', color: 'var(--green)' });
    }
    if (nw !== null) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Net Worth', value: (nw < 0 ? '-' : '') + '$' + Math.abs(Math.round(nw / 1000)) + 'K', color: nw >= 0 ? 'var(--green)' : 'var(--red)' });
    }
    if (sr) {
      snapshot.hasData = true;
      snapshot.lines.push({ label: 'Savings Rate', value: sr, color: sr === '>30%' || sr === '20-30%' ? 'var(--green)' : 'var(--red)' });
    }
    return snapshot;
  }

  return snapshot;
}


// ===== SECTION 4b: CONFERENCE DEADLINES =====
// Major specialty conferences with abstract submission deadlines
function hwGetConferenceDeadlines(cp) {
  var now = new Date();
  var year = now.getFullYear();
  var spec = (cp.specialty || '').toLowerCase();
  var dls = [];

  function cdl(date, name, type, deadlineDate) {
    var conf = new Date(date);
    var daysToConf = Math.ceil((conf - now) / 86400000);
    if (daysToConf < -14 || daysToConf > 400) return;
    var dl = deadlineDate ? new Date(deadlineDate) : null;
    var daysToDeadline = dl ? Math.ceil((dl - now) / 86400000) : null;
    dls.push({ name: name, date: conf, daysToConf: daysToConf, type: type, abstractDeadline: dl, daysToAbstract: daysToDeadline });
  }

  // Cardiology
  if (spec.indexOf('cardio') >= 0 || spec.indexOf('heart') >= 0 || spec.indexOf('interventional') >= 0 || spec.indexOf('electro') >= 0) {
    cdl(year + '-03-29', 'ACC Scientific Sessions', 'National', year + '-10-15');
    cdl(year + '-11-15', 'AHA Scientific Sessions', 'National', year + '-06-01');
    cdl(year + '-10-27', 'TCT (Interventional)', 'Subspecialty', year + '-05-15');
    cdl(year + '-05-10', 'Heart Rhythm (HRS)', 'Subspecialty', year + '-01-15');
    cdl((year + 1) + '-03-29', 'ACC Scientific Sessions', 'National', year + '-10-15');
  }
  // GI
  if (spec.indexOf('gastro') >= 0 || spec.indexOf('gi') >= 0 || spec === 'gi') {
    cdl(year + '-05-17', 'DDW (Digestive Disease Week)', 'National', year + '-01-10');
    cdl(year + '-10-25', 'ACG Annual Meeting', 'National', year + '-05-01');
    cdl((year + 1) + '-05-17', 'DDW', 'National', (year + 1) + '-01-10');
  }
  // Surgery
  if (spec.indexOf('surg') >= 0 || spec.indexOf('ortho') >= 0) {
    cdl(year + '-10-22', 'ACS Clinical Congress', 'National', year + '-03-01');
    cdl(year + '-03-11', 'AAOS Annual Meeting', 'National', (year - 1) + '-09-01');
    cdl((year + 1) + '-03-11', 'AAOS Annual Meeting', 'National', year + '-09-01');
  }
  // EM
  if (spec.indexOf('emergency') >= 0 || spec === 'em') {
    cdl(year + '-10-14', 'ACEP Scientific Assembly', 'National', year + '-04-01');
    cdl(year + '-05-19', 'SAEM Annual Meeting', 'National', year + '-01-15');
  }
  // Dermatology
  if (spec.indexOf('derm') >= 0) {
    cdl(year + '-03-14', 'AAD Annual Meeting', 'National', (year - 1) + '-10-01');
    cdl(year + '-07-26', 'AAD Innovation Academy', 'National', year + '-02-01');
    cdl((year + 1) + '-03-14', 'AAD Annual Meeting', 'National', year + '-10-01');
  }
  // Pulm/Critical Care
  if (spec.indexOf('pulm') >= 0 || spec.indexOf('critical') >= 0) {
    cdl(year + '-05-16', 'ATS International Conference', 'National', year + '-11-01');
    cdl(year + '-10-06', 'CHEST Annual Meeting', 'National', year + '-04-15');
  }
  // Oncology
  if (spec.indexOf('oncol') >= 0 || spec.indexOf('hematol') >= 0) {
    cdl(year + '-06-02', 'ASCO Annual Meeting', 'National', year + '-02-01');
    cdl(year + '-12-07', 'ASH Annual Meeting', 'National', year + '-06-01');
  }
  // Neurology
  if (spec.indexOf('neuro') >= 0 && spec.indexOf('surg') < 0) {
    cdl(year + '-04-05', 'AAN Annual Meeting', 'National', (year - 1) + '-10-01');
    cdl((year + 1) + '-04-05', 'AAN Annual Meeting', 'National', year + '-10-01');
  }
  // Psychiatry
  if (spec.indexOf('psych') >= 0) {
    cdl(year + '-05-03', 'APA Annual Meeting', 'National', (year - 1) + '-11-01');
    cdl((year + 1) + '-05-03', 'APA Annual Meeting', 'National', year + '-11-01');
  }
  // Radiology
  if (spec.indexOf('radio') >= 0 && spec.indexOf('oncol') < 0) {
    cdl(year + '-11-26', 'RSNA Annual Meeting', 'National', year + '-04-15');
  }
  // Peds
  if (spec.indexOf('pedi') >= 0) {
    cdl(year + '-10-24', 'AAP National Conference', 'National', year + '-04-01');
  }
  // Internal Medicine (general)
  if (spec.indexOf('internal') >= 0 || spec === 'im' || spec.indexOf('hospitalist') >= 0) {
    cdl(year + '-04-10', 'ACP Internal Medicine Meeting', 'National', (year - 1) + '-10-01');
    cdl(year + '-05-05', 'SHM Converge (Hospitalist)', 'National', year + '-01-01');
  }
  // Family Medicine
  if (spec.indexOf('family') >= 0 || spec === 'fm') {
    cdl(year + '-10-10', 'AAFP FMX Conference', 'National', year + '-03-01');
  }
  // Universal
  cdl(year + '-04-15', 'Tax Filing Deadline', 'Financial', null);

  dls.sort(function(a, b) { return a.daysToConf - b.daysToConf; });
  return dls.filter(function(d) { return d.daysToConf >= -7; });
}


// ===== SECTION 4c: WHAT-IF SIMULATOR =====
// Shows the impact of hypothetical changes on career score
function hwGetWhatIfScenarios(cp, scores) {
  var stage = cp.stage || 'student';
  var scenarios = [];
  var specData = (hwFindSpecialty(cp.specialty) || {}).data;
  var pubs = parseInt(cp.pubs) || 0;
  var s2 = parseInt(cp.step2) || 0;

  function sim(label, changes) {
    var newCp = {};
    for (var k in cp) newCp[k] = cp[k];
    for (var c in changes) newCp[c] = changes[c];
    var newScores = calcDashScores(newCp);
    var newOverall = Math.round((newScores.competitiveness + newScores.research + newScores.readiness + newScores.financial) / 4);
    var oldOverall = Math.round((scores.competitiveness + scores.research + scores.readiness + scores.financial) / 4);
    var delta = newOverall - oldOverall;
    if (delta > 0) scenarios.push({ label: label, delta: delta, newScore: newOverall });
  }

  if (stage === 'student' || stage === 'resident') {
    sim('Publish 1 more paper', { pubs: pubs + 1 });
    sim('Publish 2 more papers', { pubs: pubs + 2 });
    if (s2 > 0 && s2 < 260) sim('Improve Step 2 by 10 pts', { step2: String(s2 + 10) });
    sim('Secure strong LORs', { lorStrength: 'strong' });
    sim('Add a leadership role', { leadership: (parseInt(cp.leadership) || 0) + 1 });
    sim('Present at a conference', { conferences: (parseInt(cp.conferences) || 0) + 1 });
    if (!s2) sim('Complete Step 2 CK (250)', { step2: '250' });
  }
  if (stage === 'fellow') {
    sim('Publish 2 more papers', { pubs: pubs + 2 });
    sim('Get board certified', { boards: 'certified' });
    sim('Add a first-author pub', { firstauthor: (parseInt(cp.firstauthor) || 0) + 1, pubs: pubs + 1 });
  }
  if (stage === 'attending') {
    var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;
    if (comp > 0) sim('Negotiate $50K raise', { comp: String(comp + 50000) });
    var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
    if (debt > 50000) sim('Pay off $50K in debt', { debt: String(debt - 50000) });
    sim('Increase savings to 20%+', { savingsrate: '20-30%' });
    sim('Increase savings to 30%+', { savingsrate: '>30%' });
  }

  scenarios.sort(function(a, b) { return b.delta - a.delta; });
  return scenarios.slice(0, 4);
}


// ===== SECTION 4d: WHAT CHANGED DETECTION =====
// Compares current scores to previous scores and generates change summary
function hwGetWhatChanged(cp, scores) {
  if (!U || !U.scoreHistory || U.scoreHistory.length < 2) return null;
  var prev = U.scoreHistory[U.scoreHistory.length - 2].scores;
  var prevDate = new Date(U.scoreHistory[U.scoreHistory.length - 2].date);
  var daysSince = Math.floor((new Date() - prevDate) / 86400000);
  var dims = ['competitiveness', 'research', 'readiness', 'financial'];
  var dimLabels = { competitiveness: 'Competitiveness', research: 'Research', readiness: 'Readiness', financial: 'Financial' };
  var changes = [];
  var totalDelta = 0;

  dims.forEach(function(d) {
    var delta = (scores[d] || 0) - (prev[d] || 0);
    if (delta !== 0) {
      changes.push({ dim: d, label: dimLabels[d], delta: delta, from: prev[d] || 0, to: scores[d] || 0 });
      totalDelta += delta;
    }
  });

  if (changes.length === 0) return null;
  var overallDelta = Math.round(totalDelta / 4);
  return { changes: changes, overallDelta: overallDelta, daysSince: daysSince, prevDate: prevDate };
}


// ===== SECTION 4e: COST OF WAITING =====
// Financial cost of delaying key actions
function hwGetCostOfWaiting(cp) {
  var costs = [];
  var stage = cp.stage || 'student';
  var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
  var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;

  // Disability insurance
  if (stage === 'fellow' || stage === 'resident') {
    costs.push({ label: 'Delaying disability insurance', cost: '$800–$1,500/yr more as attending', urgency: 'high', tool: 'v8' });
  }
  // PSLF
  if (debt > 100000 && (stage === 'resident' || stage === 'fellow')) {
    var monthlyPayment = Math.round(debt * 0.001);
    costs.push({ label: 'Missing 1 PSLF payment', cost: '$' + monthlyPayment.toLocaleString() + ' lost toward forgiveness', urgency: 'high', tool: 'v8' });
  }
  // Contract negotiation
  if (stage === 'fellow' || (stage === 'resident' && cp.goal === 'contract')) {
    costs.push({ label: 'Not negotiating first contract', cost: '$40K–$80K/yr left on table', urgency: 'critical', tool: 'v12' });
  }
  // Savings rate
  if (stage === 'attending' && (cp.savingsrate === '<10%' || cp.savingsrate === '10-20%')) {
    var annualLoss = Math.round(comp * 0.05 / 1000);
    costs.push({ label: 'Each month at low savings rate', cost: '$' + annualLoss + 'K/yr not compounding', urgency: 'high', tool: 'v11' });
  }
  // Debt interest
  if (debt > 100000 && stage === 'attending') {
    var dailyInterest = Math.round(debt * 0.06 / 365);
    costs.push({ label: 'Your debt accrues daily', cost: '$' + dailyInterest + '/day in interest', urgency: 'medium', tool: 'v8' });
  }
  // Roth IRA
  if (stage === 'resident' || stage === 'fellow' || stage === 'attending') {
    costs.push({ label: 'Missing Roth IRA contribution', cost: '$7,000 in tax-free growth lost per year', urgency: 'medium', tool: 'v11' });
  }

  return costs.slice(0, 3);
}


// ===== SECTION 4f: SMART TOOL RECOMMENDATIONS =====
// Context-aware tool suggestions based on biggest gaps
function hwGetSmartToolRecs(cp, scores, progress) {
  var recs = [];
  var stage = cp.stage || 'student';
  var behindItems = progress.filter(function(p) { return p.status === 'behind'; });
  var gapItems = progress.filter(function(p) { return p.status === 'gap'; });
  var weakest = null;
  var dims = ['competitiveness', 'research', 'readiness', 'financial'];
  var weakVal = 999;
  dims.forEach(function(d) { if ((scores[d] || 0) < weakVal) { weakVal = scores[d] || 0; weakest = d; } });

  // Based on weakest dimension
  if (weakest === 'research' || (behindItems.length && behindItems[0].label === 'Publications')) {
    recs.push({ tool: 'v7', title: 'Research Impact Calculator', reason: 'Your research is your biggest gap. See exactly what type of publication helps most.', urgency: 'high' });
  }
  if (weakest === 'competitiveness' && (stage === 'student' || stage === 'resident')) {
    recs.push({ tool: 'v14', title: 'Match Competitiveness Calculator', reason: 'Your competitiveness score is ' + (scores.competitiveness || 0) + '. Use the ROI Simulator to find what moves your needle most.', urgency: 'high' });
  }
  if (weakest === 'financial') {
    recs.push({ tool: 'v11', title: 'Financial Projection Tool', reason: 'Your financial score is the weakest. Model your 30-year trajectory and find the highest-impact changes.', urgency: 'high' });
  }
  if (weakest === 'readiness' && stage !== 'attending') {
    recs.push({ tool: 'v15', title: 'Career Roadmap Tool', reason: 'Your readiness score needs work. Build a step-by-step plan with dependencies and timelines.', urgency: 'high' });
  }

  // Stage-specific
  if (stage === 'fellow' || (stage === 'resident' && cp.goal === 'contract')) {
    var hasContract = (U.toolHistory || []).some(function(t) { return t.tool === 'Contract Review Tool'; });
    if (!hasContract) {
      recs.push({ tool: 'v12', title: 'Contract Review Tool', reason: 'You haven\'t reviewed a contract yet. Most physicians leave $50K+ on the table by not preparing.', urgency: 'critical' });
    }
  }
  if (stage === 'student' && cp.goal === 'specialty') {
    recs.push({ tool: 'v13', title: 'Specialty Fit Assessment', reason: 'Choosing the right specialty is the most important decision of medical school. Match your values to data.', urgency: 'high' });
  }

  // Don't recommend tools they ran recently
  var recentTools = {};
  (U.toolHistory || []).forEach(function(t) {
    var d = new Date(t.date);
    if (new Date() - d < 30 * 86400000) recentTools[t.tool] = true;
  });
  recs = recs.filter(function(r) {
    var item = (typeof VAULT_ITEMS !== 'undefined') ? VAULT_ITEMS.find(function(v) { return v.id === r.tool; }) : null;
    return !item || !recentTools[item.title];
  });

  return recs.slice(0, 2);
}


// ===== SECTION 4g: PEER PERCENTILE =====
function hwGetPeerPercentile(overall) {
  // Approximate percentile from overall score (based on normal distribution around 50)
  if (overall >= 85) return { pct: 'top 5%', label: 'Exceptional' };
  if (overall >= 75) return { pct: 'top 15%', label: 'Strong' };
  if (overall >= 65) return { pct: 'top 30%', label: 'Competitive' };
  if (overall >= 55) return { pct: 'top 50%', label: 'Building' };
  if (overall >= 45) return { pct: 'top 65%', label: 'Developing' };
  return { pct: 'building', label: 'Early Stage' };
}


// ===== SECTION 4h: PROGRESS SPARKLINES =====
function hwRenderSparkline(history, key, width, height) {
  if (!history || history.length < 2) return '';
  var vals = history.map(function(h) { return h.scores[key] || 0; });
  var min = Math.min.apply(null, vals);
  var max = Math.max.apply(null, vals);
  var range = max - min || 1;
  var w = width || 60;
  var ht = height || 20;
  var pts = vals.map(function(v, i) {
    return Math.round((i / (vals.length - 1)) * w) + ',' + Math.round(ht - ((v - min) / range) * (ht - 4) - 2);
  }).join(' ');
  var lastVal = vals[vals.length - 1];
  var firstVal = vals[0];
  var trendColor = lastVal > firstVal ? '#5E8B6F' : lastVal < firstVal ? '#B85C5C' : '#C6A85E';
  return '<svg width="' + w + '" height="' + ht + '" style="display:inline-block;vertical-align:middle"><polyline points="' + pts + '" fill="none" stroke="' + trendColor + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
// Stage-specific onboarding that captures exactly what's needed

function hwShowOnboarding() {
  if (!U) return;
  var cp = U.careerProfile || {};
  var h = '';
  h += '<div style="background:#111318;border-radius:18px;padding:28px 24px;color:#EDEBE7;position:relative;overflow:hidden">';
  h += '<div style="position:absolute;top:-30%;right:-10%;width:200px;height:200px;background:radial-gradient(circle,rgba(198,168,94,.12),transparent 60%);border-radius:50%"></div>';
  h += '<div style="position:relative">';

  // Greeting
  var name = U.name ? 'Dr. ' + U.name.split(' ').pop() : '';
  h += '<div style="font-family:var(--font-serif);font-size:20px;font-weight:600;color:#EDEBE7;line-height:1.3;margin-bottom:6px">';
  h += name ? 'Welcome, ' + name + '.' : 'Welcome to HeartWise.';
  h += '</div>';
  h += '<div style="font-size:13px;color:rgba(237,235,231,.6);line-height:1.6;margin-bottom:20px">Set up your Career Map in 2 minutes. Every answer personalizes your dashboard, deadlines, and recommendations.</div>';

  // Step 1: Stage
  h += '<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">What stage are you in?</div>';
  h += '<div id="ob-stage-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
  var stages = [
    { val: 'student', label: 'Medical Student', icon: '🎓', sub: 'MS1 through MS4' },
    { val: 'resident', label: 'Resident', icon: '🏥', sub: 'PGY-1 through PGY-7' },
    { val: 'fellow', label: 'Fellow', icon: '🔬', sub: 'Subspecialty training' },
    { val: 'attending', label: 'Attending', icon: '👨‍⚕️', sub: 'Practicing physician' }
  ];
  stages.forEach(function(s) {
    h += '<div onclick="hwOnboardSelect(\'stage\',\'' + s.val + '\',this)" data-val="' + s.val + '" style="padding:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;cursor:pointer;text-align:center;transition:all .15s" onmouseenter="this.style.borderColor=\'rgba(198,168,94,.3)\'" onmouseleave="if(!this.classList.contains(\'ob-sel\'))this.style.borderColor=\'rgba(255,255,255,.08)\'">';
    h += '<div style="font-size:22px;margin-bottom:4px">' + s.icon + '</div>';
    h += '<div style="font-size:13px;font-weight:600;color:#EDEBE7">' + s.label + '</div>';
    h += '<div style="font-size:10px;color:rgba(237,235,231,.4)">' + s.sub + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // Step 2: Dynamic fields (changes based on stage)
  h += '<div id="ob-dynamic" style="display:none"></div>';

  // Submit
  h += '<div id="ob-submit" style="display:none;margin-top:16px">';
  h += '<button onclick="hwSaveOnboarding()" style="width:100%;padding:14px;background:var(--accent);color:#1C1A17;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.3px">Build My Career Map \u2192</button>';
  h += '</div>';

  // Skip / close option
  h += '<div onclick="document.getElementById(\'home-hero-card\').innerHTML=\'\';if(typeof renderHeroCard===\'function\')renderHeroCard()" style="text-align:center;margin-top:14px;font-size:11px;color:rgba(237,235,231,.35);cursor:pointer">Skip for now</div>';

  h += '</div></div>';

  var el = document.getElementById('home-hero-card');
  if (el) el.innerHTML = h;
}

var _obStage = '';
function hwOnboardSelect(field, val, btn) {
  if (field === 'stage') {
    _obStage = val;
    // Highlight selected
    var grid = document.getElementById('ob-stage-grid');
    if (grid) {
      grid.querySelectorAll('div[data-val]').forEach(function(d) {
        d.classList.remove('ob-sel');
        d.style.borderColor = 'rgba(255,255,255,.08)';
        d.style.background = 'rgba(255,255,255,.04)';
      });
    }
    btn.classList.add('ob-sel');
    btn.style.borderColor = 'var(--accent)';
    btn.style.background = 'rgba(198,168,94,.1)';
    // Show dynamic fields
    hwRenderOnboardFields(val);
  }
}

function hwRenderOnboardFields(stage) {
  var cp = U.careerProfile || {};
  var h = '';
  var labelStyle = 'font-size:11px;color:rgba(237,235,231,.6);margin-bottom:4px;display:block';
  var inputStyle = 'width:100%;padding:10px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#EDEBE7;font-size:13px;outline:none;box-sizing:border-box';
  var selectStyle = inputStyle;
  var sectionLabel = 'font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)';

  // GOAL — all stages
  h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">What is your primary goal right now?</label>';
  h += '<select id="ob-goal" style="' + selectStyle + '">';
  if (stage === 'student') {
    h += '<option value="match">Match into my desired residency</option>';
    h += '<option value="specialty">Figure out which specialty</option>';
    h += '<option value="finance">Plan my financial future</option>';
    h += '<option value="direction">Explore my career options</option>';
  } else if (stage === 'resident') {
    h += '<option value="match">Get into a competitive fellowship</option>';
    h += '<option value="contract">Land the right attending job</option>';
    h += '<option value="finance">Optimize my finances</option>';
    h += '<option value="direction">Decide my career direction</option>';
  } else if (stage === 'fellow') {
    h += '<option value="contract">Land the right first attending job</option>';
    h += '<option value="match">Get into advanced subspecialty fellowship</option>';
    h += '<option value="finance">Financial planning for attending life</option>';
    h += '<option value="direction">Explore my career options</option>';
  } else {
    h += '<option value="contract">Optimize my current position & compensation</option>';
    h += '<option value="finance">Financial optimization & wealth building</option>';
    h += '<option value="direction">Explore a career change or pivot</option>';
  }
  h += '</select></div>';

  // SPECIALTY — all stages
  h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">' + (stage === 'attending' ? 'Your specialty' : 'Target specialty') + '</label>';
  h += '<input type="text" id="ob-spec" value="' + (cp.specialty || '') + '" placeholder="e.g., Cardiology, Dermatology, IM" style="' + inputStyle + '"></div>';

  // STAGE-SPECIFIC FIELDS
  if (stage === 'student') {
    h += '<div style="' + sectionLabel + '">Your Current Position</div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Current Year</label>';
    h += '<select id="ob-pgy" style="' + selectStyle + '"><option value="MS1">MS-1</option><option value="MS2">MS-2</option><option value="MS3">MS-3</option><option value="MS4">MS-4</option></select></div>';

    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Step 1 Score</label>';
    h += '<input type="text" id="ob-step1" value="' + (cp.step1 || '') + '" placeholder="e.g., Pass, 230" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Step 2 CK Score</label>';
    h += '<input type="text" id="ob-step2" value="' + (cp.step2 || '') + '" placeholder="e.g., 252" style="' + inputStyle + '"></div>';
    h += '</div>';

    h += '<div style="' + sectionLabel + '">Application Strength</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Publications</label>';
    h += '<input type="number" id="ob-pubs" value="' + (cp.pubs || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Research Projects</label>';
    h += '<input type="number" id="ob-research" value="' + (cp.research || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '</div>';

    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">LOR Strength</label>';
    h += '<select id="ob-lor" style="' + selectStyle + '"><option value="">Select</option><option value="strong">Strong — known faculty</option><option value="moderate">Moderate — good relationship</option><option value="weak">Still securing</option></select></div>';

    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Student Loan Balance</label>';
    h += '<input type="text" id="ob-debt" value="' + (cp.debt || '') + '" placeholder="e.g., $200,000" style="' + inputStyle + '"></div>';
  }

  if (stage === 'resident') {
    h += '<div style="' + sectionLabel + '">Training Details</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">PGY Level</label>';
    h += '<select id="ob-pgy" style="' + selectStyle + '"><option value="PGY1">PGY-1</option><option value="PGY2">PGY-2</option><option value="PGY3">PGY-3</option><option value="PGY4">PGY-4</option><option value="PGY5">PGY-5</option></select></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Step 2 CK Score</label>';
    h += '<input type="text" id="ob-step2" value="' + (cp.step2 || '') + '" placeholder="e.g., 252" style="' + inputStyle + '"></div>';
    h += '</div>';

    h += '<div style="' + sectionLabel + '">Academic Profile</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Publications</label>';
    h += '<input type="number" id="ob-pubs" value="' + (cp.pubs || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Conference Presentations</label>';
    h += '<input type="number" id="ob-conferences" value="' + (cp.conferences || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '</div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">LOR Strength</label>';
    h += '<select id="ob-lor" style="' + selectStyle + '"><option value="">Select</option><option value="strong">Strong — PD, division chief</option><option value="moderate">Moderate — good relationship</option><option value="weak">Still securing</option></select></div>';

    h += '<div style="' + sectionLabel + '">Financial</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Resident Salary</label>';
    h += '<input type="text" id="ob-comp" value="' + (cp.comp || '') + '" placeholder="e.g., $65,000" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Student Loan Balance</label>';
    h += '<input type="text" id="ob-debt" value="' + (cp.debt || '') + '" placeholder="e.g., $280,000" style="' + inputStyle + '"></div>';
    h += '</div>';
  }

  if (stage === 'fellow') {
    h += '<div style="' + sectionLabel + '">Fellowship Details</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Fellowship Year</label>';
    h += '<select id="ob-pgy" style="' + selectStyle + '"><option value="F1">Fellow Year 1</option><option value="F2">Fellow Year 2</option><option value="F3">Fellow Year 3</option></select></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Board Status</label>';
    h += '<select id="ob-boards" style="' + selectStyle + '"><option value="">Select</option><option value="certified">Board Certified</option><option value="eligible">Board Eligible</option><option value="pending">Exam Pending</option></select></div>';
    h += '</div>';

    h += '<div style="' + sectionLabel + '">Academic Profile</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Publications</label>';
    h += '<input type="number" id="ob-pubs" value="' + (cp.pubs || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">First-Author Pubs</label>';
    h += '<input type="number" id="ob-firstauthor" value="' + (cp.firstauthor || 0) + '" min="0" style="' + inputStyle + '"></div>';
    h += '</div>';

    h += '<div style="' + sectionLabel + '">Financial & Career</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Expected Attending Salary</label>';
    h += '<input type="text" id="ob-comp" value="' + (cp.comp || '') + '" placeholder="e.g., $400,000" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Student Loan Balance</label>';
    h += '<input type="text" id="ob-debt" value="' + (cp.debt || '') + '" placeholder="e.g., $250,000" style="' + inputStyle + '"></div>';
    h += '</div>';
  }

  if (stage === 'attending') {
    h += '<div style="' + sectionLabel + '">Current Position</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Years in Practice</label>';
    h += '<input type="number" id="ob-yearsout" value="' + (cp.yearsout || '') + '" min="0" placeholder="e.g., 3" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Practice Setting</label>';
    h += '<select id="ob-practice" style="' + selectStyle + '"><option value="">Select</option><option value="academic">Academic</option><option value="pp_owner">Private — Own</option><option value="pp_partner">Private — Partner</option><option value="pp_associate">Private — Associate</option><option value="employed">Hospital Employed</option></select></div>';
    h += '</div>';

    h += '<div style="' + sectionLabel + '">Financial Profile</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Total Compensation</label>';
    h += '<input type="text" id="ob-comp" value="' + (cp.comp || '') + '" placeholder="e.g., $450,000" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Student Loan Balance</label>';
    h += '<input type="text" id="ob-debt" value="' + (cp.debt || '') + '" placeholder="$0 if paid off" style="' + inputStyle + '"></div>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Estimated Net Worth</label>';
    h += '<input type="text" id="ob-networth" value="' + (cp.networth || '') + '" placeholder="e.g., $500,000" style="' + inputStyle + '"></div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Savings Rate</label>';
    h += '<select id="ob-savingsrate" style="' + selectStyle + '"><option value="">Select</option><option value="<10%">Less than 10%</option><option value="10-20%">10-20%</option><option value="20-30%">20-30%</option><option value=">30%">More than 30%</option></select></div>';
    h += '</div>';
    h += '<div style="margin-bottom:12px"><label style="' + labelStyle + '">Compensation Model</label>';
    h += '<select id="ob-compmodel" style="' + selectStyle + '"><option value="">Select</option><option value="salary">Salary Only</option><option value="rvu">RVU-Based</option><option value="hybrid">Salary + RVU Bonus</option><option value="eat">Eat-What-You-Kill</option></select></div>';
  }

  var dyn = document.getElementById('ob-dynamic');
  if (dyn) { dyn.innerHTML = h; dyn.style.display = ''; }
  var sub = document.getElementById('ob-submit');
  if (sub) sub.style.display = '';
}

function hwSaveOnboarding() {
  if (!U) return;
  if (!_obStage) { notify('Please select your training stage'); return; }
  initCareerProfile();
  var cp = U.careerProfile;
  function gv(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function gi(id) { var el = document.getElementById(id); return el ? parseInt(el.value) || 0 : 0; }

  cp.stage = _obStage;
  cp.goal = gv('ob-goal');
  cp.specialty = gv('ob-spec');
  cp.pgy = gv('ob-pgy');
  cp.step1 = gv('ob-step1');
  cp.step2 = gv('ob-step2');
  cp.pubs = gi('ob-pubs');
  cp.research = gi('ob-research');
  cp.conferences = gi('ob-conferences');
  cp.lorStrength = gv('ob-lor');
  cp.comp = gv('ob-comp');
  cp.debt = gv('ob-debt');
  cp.firstauthor = gi('ob-firstauthor');
  cp.boards = gv('ob-boards');
  cp.yearsout = gv('ob-yearsout');
  cp.practice = gv('ob-practice');
  cp.networth = gv('ob-networth');
  cp.savingsrate = gv('ob-savingsrate');
  cp.compmodel = gv('ob-compmodel');
  cp.leadership = gi('ob-leadership');
  cp.volunteer = gi('ob-volunteer');
  cp.lastUpdated = new Date().toISOString();

  // Calculate initial scores
  var scores = calcDashScores(cp);
  U.scoreHistory.push({ date: cp.lastUpdated, scores: scores });

  // Set milestones
  U.milestones = getDefaultMilestones(cp.stage);

  saveUser();
  notify('Career Map created! Your personalized dashboard is ready.');
  renderHome();
}


// ===== SECTION 5b: HOW-TO GUIDANCE =====
// Actionable step-by-step guidance for every deadline and priority
// Matched by partial title — first match wins

var HW_HOW_TO = [
  // AWAY ROTATIONS
  { match: 'away rotation', steps: ['Search VSLO (Visiting Student Learning Opportunities) at aamc.org/vslo for open positions', 'Contact the coordinator at your top 3 target programs by email — introduce yourself and express interest', 'Ask your home clerkship director for a departmental letter of good standing', 'Apply 4-6 months before your preferred dates — popular programs fill by March/April', 'Treat it as a month-long interview — arrive early, stay late, and get to know the attendings'], tool: null },
  // ERAS
  { match: 'eras application', steps: ['Complete your ERAS profile: personal info, education, experiences, publications, and personal statement', 'Upload your USMLE/COMLEX transcript — request early as processing takes 1-2 weeks', 'Assign letters of recommendation to programs — confirm writers have uploaded by August', 'Finalize your personal statement — have 3 people review it, including someone in your target specialty', 'Submit applications on Day 1 (September 6) for competitive specialties — late submissions are screened last'], tool: 'v9' },
  // NRMP
  { match: 'nrmp registration', steps: ['Go to nrmp.org and create your account', 'Pay the registration fee ($85 for students, additional per program after 20)', 'Link your ERAS and NRMP accounts — this is separate from ERAS submission', 'Verify your medical school is participating in the Main Residency Match'], tool: null },
  // INTERVIEW
  { match: 'interview', steps: ['Research each program: read their website, recent publications by faculty, and GME outcomes', 'Prepare answers for: Why this specialty? Why this program? Tell me about yourself. Biggest weakness?', 'Practice with a mock interview partner or use the HeartWise Mock Interview Tool', 'Prepare 3-5 thoughtful questions for each program — avoid anything easily found online', 'Send a brief thank-you email within 24 hours to your interviewer and program coordinator'], tool: 'v16' },
  // RANK LIST
  { match: 'rank list', steps: ['Rank programs in YOUR true preference order — the algorithm rewards honesty', 'Do NOT rank a program you would not attend under any circumstances', 'Consider: geography, culture, call schedule, fellowship match rate, moonlighting policy', 'Discuss with trusted mentors but make the final decision yourself', 'Certify your list before the deadline — uncertified lists are not submitted'], tool: null },
  // MATCH DAY
  { match: 'match day', steps: ['Results release at noon ET on Match Day — check NRMP website', 'If matched: celebrate, then start planning your move and onboarding paperwork', 'If unmatched: SOAP begins Monday of Match Week — have your application ready to resubmit immediately', 'Contact your dean of students immediately if unmatched — they can advocate on your behalf during SOAP'], tool: null },
  // STEP 2 CK
  { match: 'step 2', steps: ['Register at NBME.org — choose your preferred testing window (slots fill fast in summer)', 'Use UWorld Step 2 CK as your primary question bank — do all questions at least once', 'Take NBME self-assessment exams (Forms 9-12) to predict your score 2-3 weeks before the real exam', 'Score typically correlates: if NBME practice is 245+, you are likely ready', 'Schedule 6-8 weeks of dedicated study — residents may need to negotiate time off'], tool: 'v14' },
  // STEP 3
  { match: 'step 3', steps: ['Register through FSMB.org — you need a medical license or training permit', 'Most residents complete during PGY-1 intern year — schedule during a lighter rotation', 'Use UWorld Step 3 and the NBME practice exams — CCS cases are unique to Step 3', 'The two-day exam includes MCQs and computer-based case simulations (CCS)', 'A passing score is required for medical licensure in all states and for some fellowship applications'], tool: null },
  // LOR
  { match: 'letter', steps: ['Identify faculty who know you well AND are known in the field — both matter', 'Ask in person, not by email: "Would you be able to write me a strong letter of recommendation?"', 'If they hesitate or say "I can write you a letter," that is a red flag — find someone else', 'Provide a CV, personal statement draft, and specific anecdotes you want highlighted', 'Follow up 1 month before the deadline with a polite reminder — faculty are busy'], tool: null },
  { match: 'requesting lor', steps: ['Identify faculty who know you well AND are known in the field — both matter', 'Ask in person, not by email: "Would you be able to write me a strong letter of recommendation?"', 'If they hesitate or say "I can write you a letter," that is a red flag — find someone else', 'Provide a CV, personal statement draft, and specific anecdotes you want highlighted', 'Follow up 1 month before the deadline with a polite reminder — faculty are busy'], tool: null },
  // PERSONAL STATEMENT
  { match: 'personal statement', steps: ['Start with a specific clinical moment or experience that sparked your interest — avoid cliches', 'Structure: opening hook → why this specialty → what you bring → where you are going', 'DO NOT summarize your CV — the statement should reveal who you are, not what you have done', 'Get feedback from 3+ readers: a specialty mentor, a writing-strong friend, and your advisor', 'Plan 5-7 revision cycles over 2-3 months — first drafts are never final drafts'], tool: null },
  // FELLOWSHIP APP
  { match: 'fellowship', steps: ['Check your specialty\u2019s fellowship match timeline — some use NRMP, others use specialty-specific matches', 'Secure 3 strong letters from attending faculty, ideally including your program director', 'Your research portfolio matters more for fellowship than residency — prioritize publications', 'Network at national conferences 12+ months before applications open', 'Apply broadly — fellowship matches are unpredictable and program-specific'], tool: 'v6' },
  // JOB SEARCH
  { match: 'job search', steps: ['Start 12-18 months before your target start date — the best positions fill early', 'Use multiple channels: PracticeLink, AAFP/ACP/specialty job boards, personal networks, recruiters', 'Before interviews, research the group\u2019s finances, call schedule, and physician turnover rate', 'Get at least 2-3 offers before negotiating — leverage requires alternatives', 'Never accept the first offer verbally — say "I\u2019m very interested and want to review the full terms"'], tool: 'v3' },
  // CONTRACT
  { match: 'contract', steps: ['Have a healthcare attorney review your contract — this costs $500-1500 and saves you tens of thousands', 'Key terms to scrutinize: base salary, RVU thresholds, non-compete radius/duration, tail coverage, termination clause', 'Compare your offer against MGMA and Doximity salary data for your specialty and region', 'Negotiate in writing after your verbal discussion — always get counter-offers documented', 'Everything is negotiable: sign-on bonus, relocation, CME funds, call frequency, partnership timeline'], tool: 'v12' },
  // DISABILITY INSURANCE
  { match: 'disability insurance', steps: ['Get "own-occupation" coverage — this pays if you can\u2019t practice YOUR specialty, not just any job', 'Buy during training when rates are 30-40% cheaper — the discount is permanent', 'Get quotes from at least 3 companies: Guardian, MassMutual, Principal, Northwestern Mutual', 'Typical coverage: 60-65% of gross income, with cost-of-living and future-increase riders', 'Do NOT rely on employer group disability alone — it is usually inadequate and not portable'], tool: 'v8' },
  // PSLF
  { match: 'pslf', steps: ['Verify you are on an income-driven repayment plan (PAYE, REPAYE, IBR, or ICR)', 'Confirm your employer qualifies — must be 501(c)(3) or government', 'Submit the Employment Certification Form (ECF) annually at studentaid.gov', 'Track your qualifying payment count — do NOT refinance with a private lender, it resets your count', 'After 120 qualifying payments (10 years), submit the forgiveness application — the remaining balance is tax-free'], tool: 'v8' },
  // TAX
  { match: 'tax filing', steps: ['Gather W-2s, 1099s, and student loan interest statements (Form 1098-E)', 'Deduct student loan interest (up to $2,500) even if you take the standard deduction', 'If moonlighting or doing 1099 work, set aside 30% for self-employment tax', 'Max out pre-tax retirement contributions (401k/403b) to reduce taxable income', 'Consider a CPA who specializes in physicians — they often save more than their fee'], tool: 'v8' },
  // ROTH IRA
  { match: 'roth ira', steps: ['Open a Roth IRA at Vanguard, Fidelity, or Schwab if you don\u2019t have one', 'If your income exceeds the direct contribution limit, use the backdoor Roth method', 'Backdoor: contribute to a traditional IRA (non-deductible), then convert to Roth immediately', 'Max contribution: $7,000/year ($8,000 if age 50+) — deadline is April 15', 'Invest in low-cost index funds (total stock market or target date) — do not try to pick stocks'], tool: 'v11' },
  // BOARD CERTIFICATION / RECERTIFICATION
  { match: 'board', steps: ['Check your specialty board\u2019s website for exam dates and registration windows', 'Most boards require completing residency/fellowship and a certain number of practice months', 'Use board review courses and question banks specific to your specialty', 'MOC (Maintenance of Certification) requires ongoing CME credits and periodic knowledge assessments', 'Board certification is increasingly required by hospitals, insurers, and for medical staff privileges'], tool: null },
  // CME
  { match: 'cme', steps: ['Track your CME credits using an app or your specialty society\u2019s portal', 'Most states require 50 CME credits every 2 years — check your specific state requirements', 'Conferences count, but so do online modules, podcasts, and journal-based CME', 'Your employer likely provides a CME allowance ($2,000-5,000/yr) — use all of it', 'Keep records of all certificates — you will need them for license renewal and hospital credentialing'], tool: null },
  // RVU / PRODUCTIVITY
  { match: 'rvu', steps: ['Request your current RVU report from your practice manager or billing department', 'Compare your RVUs against MGMA benchmarks for your specialty (50th, 75th, 90th percentile)', 'Identify high-RVU procedures you are credentialed for but underperforming — even small changes compound', 'Track monthly, not quarterly — catching a downtrend early prevents year-end surprises', 'If your RVU pace is below target, discuss with your department chair before performance review'], tool: 'v4' },
  // SAVINGS RATE
  { match: 'savings rate', steps: ['Calculate your current rate: (total saved per month) \u00F7 (gross monthly income) \u00D7 100', 'Target 20% minimum — the difference between 10% and 20% over 30 years is over $2 million', 'Automate it: set up direct deposit splits so savings happen before you see the money', 'Priority order: employer 401k match \u2192 backdoor Roth IRA \u2192 max 401k \u2192 taxable brokerage', 'If below 20%, increase by 2-3% every 3 months — gradual increases are sustainable'], tool: 'v11' },
  // LOAN PAYOFF / DEBT
  { match: 'loan', steps: ['List all loans: balance, interest rate, servicer, and repayment plan for each', 'If at a qualifying employer, strongly consider PSLF over refinancing — run the numbers first', 'If NOT pursuing PSLF, refinance to the lowest rate possible (compare SoFi, Laurel Road, Earnest)', 'Avalanche method: pay minimums on all, put extra toward the highest interest rate loan', 'Every $1,000 extra per month toward a $300K loan at 6% saves ~$45K in total interest'], tool: 'v8' },
  // NET WORTH / EMERGENCY FUND
  { match: 'emergency fund', steps: ['Target 3-6 months of essential expenses (rent, food, insurance, minimums on debt)', 'Keep it in a high-yield savings account (4-5% APY) — not invested in the market', 'Build this BEFORE aggressive debt payoff — unexpected expenses without a buffer create new debt', 'For dual-physician households, 3 months may be sufficient; single income, aim for 6'], tool: 'v5' },
  // RESEARCH / PUBLISH
  { match: 'publish', steps: ['Start with a case report or retrospective chart review — these can be completed in 2-4 months', 'Approach faculty who are actively publishing and ask to join an existing project', 'Aim for journals in your target specialty — specialty-specific publications matter more than impact factor', 'Use a reference manager (Zotero, Mendeley) from day one — you will thank yourself later', 'Submit to 2-3 journals simultaneously if allowed, or have your backup journal ready before submitting'], tool: 'v7' },
  // LEADERSHIP
  { match: 'leadership', steps: ['Apply for chief resident, committee chair, or QI project lead positions', 'Start or lead a student/resident interest group in your specialty', 'Volunteer for hospital committees (patient safety, curriculum, wellness)', 'Document your leadership in ERAS/CV with specific outcomes, not just titles', 'Even small roles count: organizing a lecture series, mentoring junior residents, leading a journal club'], tool: null },
  // CONFERENCE
  { match: 'conference', steps: ['Submit abstracts 4-6 months before the conference deadline — check specialty society websites', 'Poster presentations are easier to get accepted than oral presentations — start there', 'Apply for travel grants through your school, department, or the conference itself', 'At the conference: attend sessions, introduce yourself to 3-5 faculty in your field, exchange contact info', 'Follow up within 1 week with anyone you connected with — this is where mentorship relationships start'], tool: 'v7' },
  // COMPENSATION BENCHMARK
  { match: 'compensation', steps: ['Access MGMA data through your hospital library or medical society membership', 'Cross-reference with Doximity salary data and Medscape physician compensation reports', 'Compare your total compensation (base + bonus + benefits) not just base salary', 'Factor in regional cost-of-living — $400K in Manhattan is different from $400K in Mississippi', 'If you are more than 10% below median, prepare a data-backed case for renegotiation'], tool: 'v4' },
  // PARTNERSHIP
  { match: 'partnership', steps: ['Request the partnership agreement and buy-in terms in writing — review with an attorney', 'Understand the buy-in structure: lump sum, payroll deduction over years, or sweat equity', 'Ask for 3 years of the practice\u2019s financial statements — revenue trends matter', 'Clarify what happens if you leave after buying in — look for forced sale provisions', 'Talk to junior partners who recently went through the process — get their honest assessment'], tool: 'v12' },
  // CAREER CHANGE / SATISFACTION
  { match: 'satisfaction', steps: ['Identify whether the issue is burnout, practice model mismatch, or specialty mismatch', 'Talk to physicians who made similar transitions — their experience is your best data', 'Run the financial model before making a move — know the cost of the transition', 'Consider locums as a low-risk way to test a new practice environment', 'Do not make a major change during acute burnout — stabilize first, then plan'], tool: 'v10' }
];

// Find how-to guide matching a title
function hwFindHowTo(title) {
  if (!title) return null;
  var t = title.toLowerCase();
  for (var i = 0; i < HW_HOW_TO.length; i++) {
    if (t.indexOf(HW_HOW_TO[i].match) >= 0) return HW_HOW_TO[i];
  }
  return null;
}

// Render a how-to expandable section (returns HTML string)
function hwRenderHowTo(title, itemId) {
  var guide = hwFindHowTo(title);
  if (!guide) return '';
  var hid = 'cm-howto-' + itemId;
  var h = '';
  h += '<div id="' + hid + '" style="display:none;margin-top:8px;padding:10px 12px;background:#F8F5F0;border-radius:8px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#A89F91">Step-by-step guide</div><div onclick="var e=document.getElementById(\'' + hid + '\');e.style.display=\'none\';document.getElementById(\'' + hid + '-btn\').style.display=\'\';event.stopPropagation()" style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(0,0,0,.06);cursor:pointer;font-size:12px;color:#8A8278;line-height:1">\u00D7</div></div>';
  guide.steps.forEach(function(step, i) {
    h += '<div style="display:flex;gap:8px;padding:4px 0;' + (i < guide.steps.length - 1 ? 'border-bottom:1px solid #EDEAE420;' : '') + '">';
    h += '<span style="font-size:10px;font-weight:700;color:#C6A85E;flex-shrink:0;min-width:14px">' + (i + 1) + '</span>';
    h += '<span style="font-size:10px;color:#5A5549;line-height:1.4">' + step + '</span>';
    h += '</div>';
  });
  if (guide.tool) {
    h += '<div onclick="openFramework(\'' + guide.tool + '\');event.stopPropagation()" style="margin-top:6px;font-size:10px;color:#C6A85E;font-weight:600;cursor:pointer">Use the tool for this \u2192</div>';
  }
  h += '</div>';
  // Toggle button
  var btn = '<div id="' + hid + '-btn" onclick="document.getElementById(\'' + hid + '\').style.display=\'\';this.style.display=\'none\';event.stopPropagation()" style="margin-top:4px;font-size:10px;color:#C6A85E;font-weight:600;cursor:pointer">How to do this \u2192</div>';
  return btn + h;
}

// ===== SECTION 6: CAREER MAP DASHBOARD RENDERER =====
// The main Career Map UI — replaces generic hero card for users with profiles

function renderCareerMap() {
  if (!U) return;
  initCareerProfile();
  var cp = U.careerProfile || {};
  var hasRealProfile = cp.lastUpdated && (cp.specialty || cp.step2 || parseInt(cp.pubs) > 0 || parseInt(cp.comp) > 5000);
  if (!hasRealProfile) { hwShowOnboarding(); return false; }

  var scores = calcDashScores(cp);
  var stage = cp.stage || 'student';
  var deadlines = hwGetDeadlines(cp);
  var priorities = hwGetMonthlyPriorities(cp, scores, deadlines);
  var progress = hwGetProgressStatus(cp, scores);
  var financial = hwGetFinancialSnapshot(cp);
  var spec = hwFindSpecialty(cp.specialty);
  var specName = cp.specialty ? cp.specialty.charAt(0).toUpperCase() + cp.specialty.slice(1) : '';
  var overall = Math.round((scores.competitiveness + scores.research + scores.readiness + scores.financial) / 4);
  var whatChanged = hwGetWhatChanged(cp, scores);
  var peerPct = hwGetPeerPercentile(overall);

  var stageLabels = { student: 'Medical Student', resident: 'Resident', fellow: 'Fellow', attending: 'Attending Physician' };
  var goalLabels = { match: stage === 'student' ? 'Match into Residency' : 'Secure Fellowship', specialty: 'Choose Specialty', contract: stage === 'attending' ? 'Optimize Position' : 'Land Attending Job', finance: 'Financial Optimization', direction: 'Career Direction' };
  var name = U.name ? 'Dr. ' + U.name.split(' ').pop() : '';
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  var el = document.getElementById('home-hero-card');
  if (!el) return false;

  // CSS animation keyframes (inject once)
  if (!document.getElementById('cm-animations')) {
    var style = document.createElement('style');
    style.id = 'cm-animations';
    style.textContent = '@keyframes cmFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes cmSlideDown{from{opacity:0;max-height:0;padding-top:0;padding-bottom:0;margin-top:0}to{opacity:1;max-height:60px;padding-top:8px;padding-bottom:8px;margin-top:8px}}@keyframes cmBarGrow{from{width:0}to{width:var(--bar-w)}}@keyframes cmSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}.cm-card{background:#fff;border-radius:16px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);animation:cmFadeUp .4s ease both}.cm-card:nth-child(2){animation-delay:.08s}.cm-card:nth-child(3){animation-delay:.16s}.cm-card:nth-child(4){animation-delay:.24s}.cm-card:nth-child(5){animation-delay:.32s}.cm-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#A89F91;margin-bottom:10px}.cm-action{font-size:11px;color:#C6A85E;font-weight:600;cursor:pointer}.cm-action:active{opacity:.6}.cm-sheet{position:fixed;top:0;left:0;right:0;bottom:0;z-index:400;display:flex;flex-direction:column;justify-content:flex-end}.cm-sheet-bg{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4)}.cm-sheet-body{position:relative;background:#F5F1EB;border-radius:20px 20px 0 0;max-height:85vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 18px 40px;animation:cmSheetUp .3s ease both}.cm-sheet-handle{width:36px;height:4px;background:#D4C9A8;border-radius:2px;margin:0 auto 16px}';
    document.head.appendChild(style);
  }

  var h = '';

  // ========================================
  // HEADER — Dark card, greeting + score + change
  // ========================================
  h += '<div style="background:#111318;border-radius:16px;padding:20px 18px 16px;color:#EDEBE7;margin-bottom:14px;animation:cmFadeUp .4s ease both">';

  // Row 1: Greeting + Score ring
  h += '<div style="display:flex;align-items:center;justify-content:space-between">';
  h += '<div>';
  h += '<div style="font-family:var(--font-serif);font-size:18px;font-weight:600;line-height:1.3">' + (name ? greeting + ', ' + name + '.' : greeting + '.') + '</div>';
  h += '<div style="font-size:11px;color:rgba(237,235,231,.4);margin-top:3px">' + (stageLabels[stage] || stage) + (specName ? ' \u00B7 ' + specName : '') + '</div>';
  h += '</div>';

  // Score ring — quiet, not screaming
  var ringColor = overall >= 75 ? '#5E8B6F' : overall >= 55 ? '#C6A85E' : '#B85C5C';
  var r = 24, circ = 2 * Math.PI * r, offset = circ - (overall / 100) * circ;
  h += '<div style="display:flex;align-items:center;gap:8px">';
  h += '<div style="text-align:right"><div style="font-size:9px;color:rgba(237,235,231,.35)">' + peerPct.pct + '</div></div>';
  h += '<div style="position:relative;width:46px;height:46px;flex-shrink:0">';
  h += '<svg viewBox="0 0 52 52" style="width:46px;height:46px;transform:rotate(-90deg)">';
  h += '<circle cx="26" cy="26" r="' + r + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="3"/>';
  h += '<circle cx="26" cy="26" r="' + r + '" fill="none" stroke="' + ringColor + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" style="transition:stroke-dashoffset .8s ease"/>';
  h += '</svg>';
  h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;font-weight:700;color:' + ringColor + ';font-family:var(--font-serif)">' + overall + '</div>';
  h += '</div></div>';
  h += '</div>';

  // What Changed banner — slides in
  if (whatChanged && whatChanged.overallDelta !== 0) {
    var wcCol = whatChanged.overallDelta > 0 ? '#5E8B6F' : '#B85C5C';
    var wcArr = whatChanged.overallDelta > 0 ? '\u25B2' : '\u25BC';
    h += '<div style="margin-top:8px;padding:8px 12px;background:' + wcCol + '18;border-radius:10px;animation:cmSlideDown .5s ease both">';
    h += '<div style="font-size:11px;color:' + wcCol + ';font-weight:600">' + wcArr + ' Score ' + (whatChanged.overallDelta > 0 ? 'up' : 'down') + ' ' + Math.abs(whatChanged.overallDelta) + ' since last update</div>';
    var wcParts = whatChanged.changes.slice(0, 3).map(function(c) { return c.label + ' ' + (c.delta > 0 ? '+' : '') + c.delta; });
    h += '<div style="font-size:9px;color:rgba(237,235,231,.4);margin-top:2px">' + wcParts.join(' \u00B7 ') + '</div>';
    h += '</div>';
  }

  // Goal — subtle
  h += '<div style="display:flex;align-items:center;margin-top:10px">';
  h += '<span style="font-size:10px;color:rgba(237,235,231,.35)">\uD83C\uDFAF ' + (goalLabels[cp.goal] || 'Build your career') + '</span>';
  h += '<span onclick="showUpdateProfile()" style="margin-left:auto;font-size:10px;color:rgba(198,168,94,.7);cursor:pointer">Edit</span>';
  h += '</div>';

  h += '</div>';

  // ========================================
  // COUNTDOWN — The visual star
  // ========================================
  var nextCrit = deadlines.find(function(d) { return !d.isPast && (d.urgency === 'critical' || d.urgency === 'high'); });
  if (nextCrit) {
    var dCol = nextCrit.daysAway <= 14 ? '#B85C5C' : nextCrit.daysAway <= 30 ? '#C6A85E' : '#5E8B6F';
    h += '<div class="cm-card">';
    h += '<div style="display:flex;align-items:center;gap:16px">';
    h += '<div style="text-align:center;min-width:60px">';
    h += '<div style="font-size:32px;font-weight:800;color:' + dCol + ';font-family:var(--font-serif);line-height:1">' + Math.max(0, nextCrit.daysAway) + '</div>';
    h += '<div style="font-size:9px;font-weight:700;color:' + dCol + ';text-transform:uppercase;letter-spacing:.5px;margin-top:1px">days</div>';
    h += '</div>';
    h += '<div style="flex:1;border-left:2px solid #E8E1D8;padding-left:14px">';
    h += '<div style="font-size:13px;font-weight:600;color:#1C1A17;line-height:1.3">' + nextCrit.title + '</div>';
    h += '<div style="font-size:11px;color:#8A8278;margin-top:3px;line-height:1.4">' + nextCrit.desc + '</div>';
    // How-to guide or tool link
    var countdownHowTo = hwFindHowTo(nextCrit.title);
    if (countdownHowTo) {
      h += hwRenderHowTo(nextCrit.title, 'countdown');
    } else if (nextCrit.tool) {
      h += '<div onclick="openFramework(\'' + nextCrit.tool + '\');event.stopPropagation()" style="margin-top:6px" class="cm-action">Prepare \u2192</div>';
    }
    h += '</div></div></div>';
  }

  // ========================================
  // CARD 1: DO THIS NOW
  // ========================================
  if (priorities.length) {
    h += '<div class="cm-card">';
    h += '<div class="cm-label">Do This Now</div>';
    priorities.slice(0, 3).forEach(function(p, i) {
      var isUrgent = p.urgency === 'critical';
      var hasHowTo = !!hwFindHowTo(p.title);
      h += '<div style="padding:10px 12px;background:' + (i === 0 ? '#F8F5F0' : 'transparent') + ';border-radius:10px;margin-bottom:' + (i < 2 ? '6' : '0') + 'px">';
      h += '<div style="display:flex;gap:10px">';
      h += '<div style="font-size:14px;font-weight:700;color:' + (i === 0 ? '#C6A85E' : '#A89F91') + ';flex-shrink:0;width:18px;text-align:center;line-height:1.4">' + (i + 1) + '</div>';
      h += '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1C1A17;line-height:1.35">' + p.title + '</div>';
      h += '<div style="font-size:10px;color:#8A8278;margin-top:2px;line-height:1.35">' + p.desc + '</div>';
      // How-to toggle + tool link row
      h += '<div style="display:flex;align-items:center;gap:12px;margin-top:4px">';
      if (hasHowTo) h += hwRenderHowTo(p.title, 'pri' + i);
      else if (p.tool) h += '<div onclick="openFramework(\'' + p.tool + '\');event.stopPropagation()" style="font-size:10px;color:#C6A85E;font-weight:600;cursor:pointer">Use tool \u2192</div>';
      h += '</div>';
      h += '</div>';
      if (isUrgent) h += '<span style="font-size:7px;padding:2px 5px;background:#B85C5C18;color:#B85C5C;border-radius:4px;font-weight:700;flex-shrink:0;align-self:flex-start;margin-top:3px">URGENT</span>';
      h += '</div></div>';
    });
    if (priorities.length > 3 || true) {
      h += '<div style="text-align:right;margin-top:8px"><span onclick="hwOpenSheet(\'priorities\')" class="cm-action">See all priorities \u2192</span></div>';
    }
    h += '</div>';
  }

  // ========================================
  // CARD 2: YOUR PROGRESS
  // ========================================
  if (progress.length || scores.competitiveness) {
    var statusCounts = { 'ahead': 0, 'on-track': 0, 'gap': 0, 'behind': 0 };
    progress.forEach(function(p) { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++; });
    var summaryParts = [];
    var good = statusCounts['ahead'] + statusCounts['on-track'];
    if (good) summaryParts.push(good + ' on track');
    if (statusCounts['gap']) summaryParts.push(statusCounts['gap'] + ' gap' + (statusCounts['gap'] > 1 ? 's' : ''));
    if (statusCounts['behind']) summaryParts.push(statusCounts['behind'] + ' behind');

    h += '<div class="cm-card">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between">';
    h += '<div class="cm-label" style="margin-bottom:0">Your Progress</div>';
    if (summaryParts.length) h += '<div style="font-size:9px;color:#8A8278">' + summaryParts.join(' \u00B7 ') + '</div>';
    h += '</div>';
    h += '<div style="margin-top:10px">';

    // Score dimension bars with sparklines
    var dims = [
      { k: 'competitiveness', l: stage === 'attending' ? 'Market Position' : 'Competitiveness' },
      { k: 'research', l: 'Research' },
      { k: 'readiness', l: stage === 'attending' ? 'Career' : 'Readiness' },
      { k: 'financial', l: 'Financial' }
    ];
    dims.forEach(function(dim) {
      var val = scores[dim.k] || 0;
      var barCol = val >= 75 ? '#5E8B6F' : val >= 55 ? '#C6A85E' : '#B85C5C';
      var spark = (U.scoreHistory && U.scoreHistory.length > 1) ? hwRenderSparkline(U.scoreHistory, dim.k, 44, 14) : '';
      h += '<div style="margin-bottom:8px">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">';
      h += '<span style="font-size:10px;color:#5A5549">' + dim.l + '</span>';
      h += '<div style="display:flex;align-items:center;gap:5px">';
      if (spark) h += spark;
      h += '<span style="font-size:11px;font-weight:700;color:' + barCol + ';min-width:20px;text-align:right">' + val + '</span>';
      h += '</div></div>';
      h += '<div style="height:5px;background:#EDEAE4;border-radius:3px;overflow:hidden">';
      h += '<div style="height:100%;width:' + val + '%;background:' + barCol + ';border-radius:3px;--bar-w:' + val + '%;animation:cmBarGrow .6s ease both"></div>';
      h += '</div></div>';
    });
    h += '</div>';
    h += '<div style="text-align:right;margin-top:4px"><span onclick="hwOpenSheet(\'progress\')" class="cm-action">See details \u2192</span></div>';
    h += '</div>';
  }

  // ========================================
  // CARD 3: COMING UP
  // ========================================
  var upcoming = deadlines.filter(function(d) { return !d.isPast && d.daysAway <= 180; }).slice(0, 3);
  var conferences = hwGetConferenceDeadlines(cp);
  var costWait = hwGetCostOfWaiting(cp);
  // Mix in nearest conference if not already in deadlines
  if (conferences.length && upcoming.length < 3) {
    var nearConf = conferences.find(function(c) { return c.daysToAbstract && c.daysToAbstract > 0 && c.daysToAbstract <= 120; });
    if (nearConf) upcoming.push({ title: nearConf.name + ' Abstract', daysAway: nearConf.daysToAbstract, category: 'application', isPast: false, urgency: nearConf.daysToAbstract <= 30 ? 'high' : 'normal', date: nearConf.abstractDeadline });
    upcoming.sort(function(a, b) { return a.daysAway - b.daysAway; });
    upcoming = upcoming.slice(0, 3);
  }

  if (upcoming.length || costWait.length) {
    h += '<div class="cm-card">';
    h += '<div class="cm-label">Coming Up</div>';
    var catIcons = { application: '\uD83D\uDCDD', exam: '\uD83D\uDCDA', career: '\uD83D\uDCBC', financial: '\uD83D\uDCB0' };
    upcoming.forEach(function(d, i) {
      var dayCol = d.daysAway <= 14 ? '#B85C5C' : d.daysAway <= 30 ? '#C6A85E' : '#5E8B6F';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;' + (i < upcoming.length - 1 || costWait.length ? 'border-bottom:1px solid #EDEAE4;' : '') + '">';
      h += '<span style="font-size:11px;font-weight:700;color:' + dayCol + ';min-width:34px;text-align:center">' + d.daysAway + 'd</span>';
      h += '<span style="font-size:11px;color:#1C1A17;flex:1">' + d.title + '</span>';
      h += '<span style="font-size:11px">' + (catIcons[d.category] || '\uD83D\uDCCC') + '</span>';
      h += '</div>';
    });
    // One cost-of-waiting line (the most impactful)
    if (costWait.length) {
      var topCost = costWait[0];
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0 0;cursor:' + (topCost.tool ? 'pointer' : 'default') + '"' + (topCost.tool ? ' onclick="openFramework(\'' + topCost.tool + '\')"' : '') + '>';
      h += '<span style="font-size:11px;min-width:34px;text-align:center">\u23F0</span>';
      h += '<span style="font-size:10px;color:#5A5549;flex:1">' + topCost.label + '</span>';
      h += '<span style="font-size:10px;font-weight:600;color:#B85C5C">' + topCost.cost + '</span>';
      h += '</div>';
    }
    h += '<div style="text-align:right;margin-top:8px"><span onclick="hwOpenSheet(\'timeline\')" class="cm-action">See timeline \u2192</span></div>';
    h += '</div>';
  }

  // ========================================
  // QUICK ACTIONS
  // ========================================
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;animation:cmFadeUp .4s ease .36s both">';
  h += '<div onclick="navTo(\'scr-ask\')" style="background:#fff;border-radius:16px;padding:14px;text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.06);transition:box-shadow .15s" ontouchstart="this.style.boxShadow=\'0 0 0 2px #C6A85E40\'" ontouchend="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,.06)\'" onmousedown="this.style.boxShadow=\'0 0 0 2px #C6A85E40\'" onmouseup="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,.06)\'">';
  h += '<div style="font-size:18px;margin-bottom:3px">\uD83E\uDDE0</div>';
  h += '<div style="font-size:11px;font-weight:600;color:#1C1A17">Ask</div></div>';
  h += '<div onclick="navTo(\'scr-vault\')" style="background:#fff;border-radius:16px;padding:14px;text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.06);transition:box-shadow .15s" ontouchstart="this.style.boxShadow=\'0 0 0 2px #C6A85E40\'" ontouchend="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,.06)\'" onmousedown="this.style.boxShadow=\'0 0 0 2px #C6A85E40\'" onmouseup="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,.06)\'">';
  h += '<div style="font-size:18px;margin-bottom:3px">\uD83D\uDD27</div>';
  h += '<div style="font-size:11px;font-weight:600;color:#1C1A17">Career Tools</div></div>';
  h += '</div>';

  // Last updated
  h += '<div onclick="showUpdateProfile()" style="text-align:center;padding:2px 0;cursor:pointer;animation:cmFadeUp .4s ease .44s both">';
  h += '<span style="font-size:9px;color:#A89F91">Updated ' + (cp.lastUpdated ? new Date(cp.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'never') + '</span>';
  h += ' <span style="font-size:9px;color:#C6A85E;font-weight:600">Update</span></div>';

  el.innerHTML = h;
  return true;
}


// ===== DETAIL SHEETS =====
// Bottom-sheet modals for each section's deep dive

function hwOpenSheet(type) {
  // Remove existing sheet
  var existing = document.getElementById('cm-sheet');
  if (existing) existing.remove();

  var cp = U.careerProfile || {};
  var scores = calcDashScores(cp);
  var stage = cp.stage || 'student';
  var spec = hwFindSpecialty(cp.specialty);

  var sheet = document.createElement('div');
  sheet.id = 'cm-sheet';
  sheet.className = 'cm-sheet';
  sheet.innerHTML = '<div class="cm-sheet-bg" onclick="hwCloseSheet()"></div><div class="cm-sheet-body"><div class="cm-sheet-handle"></div><div onclick="hwCloseSheet()" style="position:absolute;top:14px;right:16px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(0,0,0,.06);cursor:pointer;font-size:15px;color:#8A8278;line-height:1">\u00D7</div><div id="cm-sheet-content"></div></div>';
  document.body.appendChild(sheet);

  var content = document.getElementById('cm-sheet-content');
  var h = '';

  if (type === 'priorities') {
    h += hwSheetPriorities(cp, scores, spec);
  } else if (type === 'progress') {
    h += hwSheetProgress(cp, scores, spec);
  } else if (type === 'timeline') {
    h += hwSheetTimeline(cp, scores, spec);
  }

  // Close button
  h += '<div style="text-align:center;padding:16px 0 0"><div onclick="hwCloseSheet()" style="display:inline-block;padding:10px 32px;border:1px solid #D4C9A8;border-radius:12px;font-size:12px;font-weight:600;color:#8A8278;cursor:pointer">Close</div></div>';

  content.innerHTML = h;
}

function hwCloseSheet() {
  var sheet = document.getElementById('cm-sheet');
  if (sheet) sheet.remove();
}

// ===== PRIORITIES SHEET =====
function hwSheetPriorities(cp, scores, spec) {
  var deadlines = hwGetDeadlines(cp);
  var priorities = hwGetMonthlyPriorities(cp, scores, deadlines);
  var progress = hwGetProgressStatus(cp, scores);
  var smartRecs = hwGetSmartToolRecs(cp, scores, progress);
  var insight = hwGetKeyInsight(cp, scores, spec, deadlines);
  var h = '';

  h += '<div style="font-family:var(--font-serif);font-size:18px;font-weight:600;color:#1C1A17;margin-bottom:16px">Your Priorities</div>';

  // All priorities
  priorities.forEach(function(p, i) {
    var barCol = i === 0 ? '#C6A85E' : i === 1 ? '#8BB4A0' : '#A89F91';
    var hasHowTo = !!hwFindHowTo(p.title);
    h += '<div style="padding:12px;background:#fff;border-radius:12px;margin-bottom:8px;border-left:3px solid ' + barCol + ';box-shadow:0 1px 3px rgba(0,0,0,.04)">';
    h += '<div style="display:flex;gap:10px">';
    h += '<div style="font-size:14px;font-weight:700;color:' + barCol + ';flex-shrink:0;width:18px;text-align:center">' + (i + 1) + '</div>';
    h += '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1C1A17;line-height:1.35">' + p.title + '</div>';
    h += '<div style="font-size:11px;color:#8A8278;margin-top:2px;line-height:1.4">' + p.desc + '</div>';
    // Action row: how-to guide + tool link
    if (hasHowTo) h += hwRenderHowTo(p.title, 'sheet-pri' + i);
    if (p.tool) h += '<div onclick="openFramework(\'' + p.tool + '\');hwCloseSheet()" style="margin-top:4px;font-size:10px;color:#C6A85E;font-weight:600;cursor:pointer">Open tool \u2192</div>';
    h += '</div>';
    if (p.urgency === 'critical') h += '<span style="font-size:7px;padding:2px 5px;background:#B85C5C18;color:#B85C5C;border-radius:4px;font-weight:700;flex-shrink:0;align-self:flex-start;margin-top:3px">URGENT</span>';
    h += '</div></div>';
  });

  // Smart tool recommendations
  if (smartRecs.length) {
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin:20px 0 10px">Recommended For You</div>';
    smartRecs.forEach(function(rec) {
      h += '<div onclick="openFramework(\'' + rec.tool + '\');hwCloseSheet()" style="padding:12px;background:#fff;border-radius:12px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,.04);cursor:pointer;border-left:3px solid #C6A85E">';
      h += '<div style="font-size:12px;font-weight:600;color:#1C1A17">' + rec.title + '</div>';
      h += '<div style="font-size:11px;color:#8A8278;margin-top:2px;line-height:1.4">' + rec.reason + '</div>';
      h += '<div style="font-size:10px;color:#C6A85E;font-weight:600;margin-top:4px">Run tool \u2192</div>';
      h += '</div>';
    });
  }

  // Key insight
  if (insight) {
    h += '<div style="margin-top:20px;padding:16px;background:#111318;border-radius:14px">';
    h += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C6A85E;margin-bottom:8px">\uD83D\uDCA1 Key Insight</div>';
    h += '<div style="font-size:12px;color:rgba(237,235,231,.85);line-height:1.55">' + insight + '</div>';
    h += '</div>';
  }

  return h;
}

// ===== PROGRESS SHEET =====
function hwSheetProgress(cp, scores, spec) {
  var progress = hwGetProgressStatus(cp, scores);
  var whatIf = hwGetWhatIfScenarios(cp, scores);
  var overall = Math.round((scores.competitiveness + scores.research + scores.readiness + scores.financial) / 4);
  var h = '';

  h += '<div style="font-family:var(--font-serif);font-size:18px;font-weight:600;color:#1C1A17;margin-bottom:16px">Your Progress</div>';

  // Detailed progress table
  if (progress.length) {
    h += '<div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    progress.forEach(function(p, i) {
      var statusColors = { ahead: '#5E8B6F', 'on-track': '#5E8B6F', gap: '#C6A85E', behind: '#B85C5C' };
      var statusLabels = { ahead: 'Ahead', 'on-track': 'On Track', gap: 'Gap', behind: 'Behind' };
      var col = statusColors[p.status] || '#8A8278';
      h += '<div style="padding:10px 0;' + (i < progress.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + '">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">';
      h += '<span style="font-size:12px;font-weight:600;color:#1C1A17">' + p.label + '</span>';
      h += '<div style="display:flex;align-items:center;gap:5px">';
      h += '<span style="font-size:12px;font-weight:700;color:' + col + '">' + p.you + '</span>';
      h += '<span style="font-size:10px;color:#8A8278">/ ' + p.target + '</span>';
      h += '<span style="font-size:8px;padding:2px 6px;background:' + col + '15;color:' + col + ';border-radius:4px;font-weight:600">' + (statusLabels[p.status] || '') + '</span>';
      h += '</div></div>';
      if (p.detail) h += '<div style="font-size:10px;color:#8A8278;line-height:1.4">' + p.detail + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }

  // What-If Simulator
  if (whatIf.length) {
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\uD83D\uDD2E What If You...</div>';
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    whatIf.forEach(function(w, i) {
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;' + (i < whatIf.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + '">';
      h += '<span style="font-size:12px;color:#1C1A17">' + w.label + '</span>';
      h += '<span style="font-size:12px;font-weight:700;color:#5E8B6F">' + overall + ' \u2192 ' + w.newScore + ' <span style="font-size:10px">(+' + w.delta + ')</span></span>';
      h += '</div>';
    });
    h += '<div style="font-size:10px;color:#8A8278;margin-top:8px;text-align:center;line-height:1.4">Update your profile after making progress to watch your score move</div>';
    h += '</div>';
  }

  // Score history (sparkline graph)
  if (U.scoreHistory && U.scoreHistory.length > 1) {
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\uD83D\uDCC8 Score History</div>';
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    U.scoreHistory.forEach(function(sh, i) {
      var ov = Math.round((sh.scores.competitiveness + sh.scores.research + sh.scores.readiness + sh.scores.financial) / 4);
      var dt = new Date(sh.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      var prevOv = i > 0 ? Math.round((U.scoreHistory[i - 1].scores.competitiveness + U.scoreHistory[i - 1].scores.research + U.scoreHistory[i - 1].scores.readiness + U.scoreHistory[i - 1].scores.financial) / 4) : null;
      var delta = prevOv !== null ? ov - prevOv : 0;
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0">';
      h += '<span style="font-size:11px;color:#8A8278">' + dt + '</span>';
      h += '<div style="display:flex;align-items:center;gap:6px">';
      h += '<span style="font-size:12px;font-weight:700;color:#1C1A17">' + ov + '</span>';
      if (delta !== 0) h += '<span style="font-size:10px;color:' + (delta > 0 ? '#5E8B6F' : '#B85C5C') + '">' + (delta > 0 ? '+' : '') + delta + '</span>';
      h += '</div></div>';
    });
    h += '</div>';
  }

  // Milestones
  if (U.milestones && U.milestones.length) {
    var done = U.milestones.filter(function(m) { return m.done; }).length;
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\u2705 Milestones (' + done + '/' + U.milestones.length + ')</div>';
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04)">';
    U.milestones.forEach(function(m, i) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;' + (i < U.milestones.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + 'cursor:pointer" onclick="toggleMilestone(' + i + ');hwCloseSheet();setTimeout(function(){hwOpenSheet(\'progress\')},100)">';
      h += '<div style="width:20px;height:20px;border-radius:6px;border:2px solid ' + (m.done ? '#5E8B6F' : '#D4C9A8') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;background:' + (m.done ? '#5E8B6F18' : 'transparent') + '">' + (m.done ? '\u2713' : '') + '</div>';
      h += '<span style="font-size:12px;color:' + (m.done ? '#8A8278' : '#1C1A17') + ';' + (m.done ? 'text-decoration:line-through' : '') + '">' + m.label + '</span>';
      if (m.done && m.date) h += '<span style="font-size:9px;color:#A89F91;margin-left:auto">' + new Date(m.date).toLocaleDateString('en-US', { month: 'short' }) + '</span>';
      h += '</div>';
    });
    h += '</div>';
  }

  return h;
}

// ===== TIMELINE SHEET =====
function hwSheetTimeline(cp, scores, spec) {
  var deadlines = hwGetDeadlines(cp);
  var conferences = hwGetConferenceDeadlines(cp);
  var financial = hwGetFinancialSnapshot(cp);
  var costWait = hwGetCostOfWaiting(cp);
  var progress = hwGetProgressStatus(cp, scores);
  var h = '';

  h += '<div style="font-family:var(--font-serif);font-size:18px;font-weight:600;color:#1C1A17;margin-bottom:16px">Your Timeline</div>';

  // All deadlines
  var allDl = deadlines.filter(function(d) { return !d.isPast; });
  if (allDl.length) {
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:8px">Deadlines</div>';
    var catIcons = { application: '\uD83D\uDCDD', exam: '\uD83D\uDCDA', career: '\uD83D\uDCBC', financial: '\uD83D\uDCB0' };
    allDl.forEach(function(d, i) {
      var dayCol = d.daysAway <= 14 ? '#B85C5C' : d.daysAway <= 30 ? '#C6A85E' : d.daysAway <= 90 ? '#5E8B6F' : '#8A8278';
      var dateStr = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      var dlHowTo = hwFindHowTo(d.title);
      h += '<div style="padding:7px 0;' + (i < allDl.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + '">';
      h += '<div style="display:flex;align-items:center;gap:10px">';
      h += '<span style="font-size:11px;font-weight:700;color:' + dayCol + ';min-width:36px;text-align:center">' + d.daysAway + 'd</span>';
      h += '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#1C1A17">' + d.title + '</div>';
      h += '<div style="font-size:9px;color:#8A8278">' + dateStr + (d.desc ? ' \u00B7 ' + d.desc.substring(0, 60) : '') + '</div></div>';
      h += '<span style="font-size:11px">' + (catIcons[d.category] || '\uD83D\uDCCC') + '</span>';
      h += '</div>';
      if (dlHowTo) h += '<div style="margin-left:46px">' + hwRenderHowTo(d.title, 'tl-dl' + i) + '</div>';
      else if (d.tool) h += '<div onclick="openFramework(\'' + d.tool + '\');hwCloseSheet()" style="margin-left:46px;margin-top:2px;font-size:10px;color:#C6A85E;font-weight:600;cursor:pointer">Use tool \u2192</div>';
      h += '</div>';
    });
    h += '</div>';
  }

  // Conferences
  if (conferences.length) {
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\uD83C\uDFE5 Specialty Conferences</div>';
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    conferences.forEach(function(c, i) {
      var confDate = c.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;' + (i < conferences.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + '">';
      h += '<div><div style="font-size:11px;font-weight:600;color:#1C1A17">' + c.name + '</div>';
      h += '<div style="font-size:9px;color:#8A8278">' + confDate + ' \u00B7 ' + c.type + '</div></div>';
      if (c.daysToAbstract !== null && c.daysToAbstract > 0) {
        var abCol = c.daysToAbstract <= 30 ? '#B85C5C' : c.daysToAbstract <= 60 ? '#C6A85E' : '#5E8B6F';
        h += '<div style="text-align:right"><div style="font-size:11px;font-weight:700;color:' + abCol + '">' + c.daysToAbstract + 'd</div>';
        h += '<div style="font-size:8px;color:#8A8278">abstract</div></div>';
      } else if (c.daysToConf > 0) {
        h += '<div style="text-align:right"><div style="font-size:11px;font-weight:600;color:#8A8278">In ' + c.daysToConf + 'd</div></div>';
      }
      h += '</div>';
    });
    h += '</div>';
  }

  // Financial + Cost of Waiting
  if (financial.hasData || costWait.length) {
    h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\uD83D\uDCB5 Financial</div>';
    h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px">';
    if (financial.hasData) {
      financial.lines.forEach(function(l) {
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:' + (l.sub ? '2px 0 2px 14px' : '5px 0') + '">';
        h += '<span style="font-size:' + (l.sub ? '10' : '12') + 'px;color:' + (l.sub ? '#8A8278' : '#1C1A17') + '">' + l.label + '</span>';
        h += '<span style="font-size:' + (l.sub ? '10' : '13') + 'px;font-weight:' + (l.sub ? '500' : '700') + ';color:' + l.color + '">' + l.value + '</span>';
        h += '</div>';
      });
    }
    if (costWait.length) {
      h += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #EDEAE4">';
      h += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#B85C5C;margin-bottom:6px">\u23F0 Cost of Waiting</div>';
      costWait.forEach(function(c) {
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;cursor:' + (c.tool ? 'pointer' : 'default') + '"' + (c.tool ? ' onclick="openFramework(\'' + c.tool + '\');hwCloseSheet()"' : '') + '>';
        h += '<span style="font-size:11px;color:#1C1A17">' + c.label + '</span>';
        h += '<span style="font-size:11px;font-weight:600;color:#B85C5C">' + c.cost + '</span>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
  }

  // Re-run reminders
  var th3 = U.toolHistory || [];
  if (th3.length) {
    var lastR = {};
    th3.forEach(function(t) { lastR[t.tool] = new Date(t.date); });
    var retool3 = { 'Match Competitiveness Calculator': 30, 'RVU Compensation Calculator': 60, 'Contract Review Tool': 90, 'Financial Projection Tool': 90, 'Specialty Fit Assessment': 60, 'Research Impact Calculator': 45 };
    var stale3 = [];
    Object.keys(lastR).forEach(function(tool) { var rc = retool3[tool]; if (rc) { var ds3 = Math.floor((new Date() - lastR[tool]) / 86400000); if (ds3 >= rc) stale3.push({ tool: tool, daysSince: ds3, recommended: rc }); } });
    if (stale3.length) {
      stale3.sort(function(a, b) { return b.daysSince - a.daysSince; });
      h += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A89F91;margin-bottom:10px">\uD83D\uDD04 Time to Re-run</div>';
      h += '<div style="background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04)">';
      stale3.forEach(function(s, i) {
        var tid3 = null;
        if (typeof VAULT_ITEMS !== 'undefined') { var vi3 = VAULT_ITEMS.find(function(v) { return v.title === s.tool; }); if (vi3) tid3 = vi3.id; }
        h += '<div' + (tid3 ? ' onclick="openFramework(\'' + tid3 + '\');hwCloseSheet()"' : '') + ' style="display:flex;align-items:center;gap:10px;padding:7px 0;' + (i < stale3.length - 1 ? 'border-bottom:1px solid #EDEAE4;' : '') + 'cursor:pointer">';
        h += '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#1C1A17">' + s.tool + '</div>';
        h += '<div style="font-size:9px;color:#8A8278">Last run ' + s.daysSince + ' days ago \u00B7 Re-run every ' + s.recommended + ' days</div></div>';
        h += '<span style="font-size:10px;color:#C6A85E;font-weight:600">Run \u2192</span></div>';
      });
      h += '</div>';
    }
  }

  return h;
}


// Generate a single high-impact insight based on the user's most critical gap or opportunity
function hwGetKeyInsight(cp, scores, spec, deadlines) {
  var stage = cp.stage || 'student';
  var specData = spec ? spec.data : null;
  var pubs = parseInt(cp.pubs) || 0;
  var s2 = parseInt(cp.step2) || 0;
  var debt = parseInt(String(cp.debt || '0').replace(/[^0-9]/g, '')) || 0;
  var comp = parseInt(String(cp.comp || '0').replace(/[^0-9]/g, '')) || 0;
  var overall = Math.round((scores.competitiveness + scores.research + scores.readiness + scores.financial) / 4);

  if (stage === 'student') {
    if (specData && specData.competitiveness === 'high' && pubs < 2) {
      return 'You\'re targeting a competitive specialty with ' + pubs + ' publications. The average matched applicant in ' + (spec ? spec.key : 'your specialty') + ' has ' + specData.avgPubs + '. <strong style="color:#C6A85E">Research is where you gain the most ground right now.</strong> Even one case report shows initiative — start this week, not next month.';
    }
    if (s2 && specData && s2 < specData.avgStep2 - 10) {
      return 'Your Step 2 CK is ' + (specData.avgStep2 - s2) + ' points below the average for matched ' + (spec ? spec.key : 'applicants') + '. This is a real gap, but not fatal. <strong style="color:#C6A85E">Strong research, compelling LORs, and sub-I performance can compensate</strong> — but only if you build them NOW, not at application time.';
    }
    if (overall >= 75) {
      return 'Your Career Score of ' + overall + ' puts you in a strong position. But competitive applicants plateau when they stop pushing. <strong style="color:#C6A85E">The gap between "competitive" and "guaranteed" is filled by the applicants who keep building.</strong> Don\'t coast — refine your personal statement and lock in your strongest LORs.';
    }
    return 'The decisions you make in the next 12 months will shape the next 30 years of your career. Every publication, every rotation, every relationship is compounding right now. <strong style="color:#C6A85E">The applicants who match their top choice are the ones who started preparing earliest.</strong>';
  }

  if (stage === 'resident') {
    if (cp.goal === 'match' && specData && specData.competitiveness === 'high' && pubs < Math.ceil(specData.avgPubs)) {
      return 'Fellowship in ' + (spec ? spec.key : 'your target') + ' is one of the most competitive matches in medicine. You have ' + pubs + ' publications against an average of ' + specData.avgPubs + '. <strong style="color:#C6A85E">Every month you delay starting a research project is a month you can\'t get back.</strong> Talk to your PD about protected research time this week.';
    }
    if (cp.goal === 'contract' && !comp) {
      return 'You\'re approaching the job market without compensation data. <strong style="color:#C6A85E">Physicians who negotiate earn $40K-$80K more per year</strong> than those who accept first offers. Over a 30-year career, that\'s $1.2M-$2.4M. Run the RVU Calculator and Contract Review Tool before your first interview.';
    }
    if (debt > 200000) {
      return 'With $' + Math.round(debt / 1000) + 'K in student loans, your repayment strategy is a six-figure decision. <strong style="color:#C6A85E">The wrong choice between PSLF and refinancing can cost you $100K-$200K.</strong> If you\'re at a qualifying employer, every payment you make during residency counts toward the 120 needed for forgiveness.';
    }
    return 'Residency is the narrowest window for career positioning. Fellowships, job offers, and financial foundations are all being set right now. <strong style="color:#C6A85E">What you do in the next 6 months has more impact than the next 6 years after training.</strong>';
  }

  if (stage === 'fellow') {
    if (cp.goal === 'contract') {
      return 'Your first attending contract is the single most important financial document you\'ll sign. <strong style="color:#C6A85E">The average physician leaves $50K-$100K on the table by not negotiating.</strong> Non-competes, tail coverage, productivity thresholds — every clause has dollar signs behind it. Don\'t sign anything without running it through the Contract Review Tool.';
    }
    if (debt > 0 && comp > 0) {
      var ratio = (debt / comp * 100).toFixed(0);
      return 'Your debt-to-expected-income ratio is ' + ratio + '%. When your attending salary starts, <strong style="color:#C6A85E">the temptation to lifestyle-inflate will be enormous.</strong> If you live like a fellow for 2-3 years after graduating, you can eliminate your debt and start building wealth from a position of strength. The physicians who do this are millionaires by 40.';
    }
    return 'The transition from fellow to attending is the highest-leverage financial moment of your career. <strong style="color:#C6A85E">Every major financial decision — PSLF, debt refinancing, disability insurance, contract terms — has a deadline attached to it.</strong> Missing them costs real money.';
  }

  if (stage === 'attending') {
    if (cp.savingsrate === '<10%' || cp.savingsrate === '10-20%') {
      return 'Your savings rate is the single strongest predictor of long-term wealth — stronger than income, investment returns, or specialty choice. <strong style="color:#C6A85E">Physicians who save 20%+ of gross income reach financial independence 10-15 years earlier</strong> than those who save less. At your income level, every 5% increase is worth $' + Math.round(comp * 0.05 / 1000) + 'K/year in saved capital.';
    }
    if (cp.considering === 'active' || (parseInt(cp.satisfaction) > 0 && parseInt(cp.satisfaction) <= 5)) {
      return 'You\'re signaling that your current position isn\'t sustainable. <strong style="color:#C6A85E">Burnout doesn\'t fix itself — it compounds.</strong> The physicians who make successful transitions do it with a plan, not in a crisis. Use the Career Transition Planner to model the financial and professional impact of a change while you still have leverage.';
    }
    if (debt === 0 && comp > 300000) {
      return 'Debt-free with a strong income — you\'re in the position most physicians dream about. <strong style="color:#C6A85E">Now is when the wealth-building accelerates.</strong> Max your tax-advantaged accounts, ensure your investment allocation matches your timeline, and make sure your estate plan is current. The next decade of compounding is worth millions.';
    }
    return 'As an attending, the biggest financial risk isn\'t market volatility — it\'s complacency. <strong style="color:#C6A85E">Most physicians never benchmark their compensation, review their contracts, or optimize their tax strategy.</strong> An hour of planning per quarter is worth more than any financial advisor fee.';
  }

  return null;
}
