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


// ===== SECTION 5: ONBOARDING FLOW =====
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
  h += '<button onclick="hwSaveOnboarding()" style="width:100%;padding:14px;background:var(--accent);color:#1C1A17;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.3px">Build My Career Map →</button>';
  h += '</div>';

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


// ===== SECTION 6: CAREER MAP DASHBOARD RENDERER =====
// The main Career Map UI — replaces generic hero card for users with profiles

function renderCareerMap() {
  if (!U) return;
  initCareerProfile();
  var cp = U.careerProfile || {};
  var hasRealProfile = cp.lastUpdated && (cp.specialty || cp.step2 || parseInt(cp.pubs) > 0 || parseInt(cp.comp) > 5000);

  // If no profile, show onboarding
  if (!hasRealProfile) {
    hwShowOnboarding();
    return false; // Signal that we showed onboarding, not the map
  }

  var scores = calcDashScores(cp);
  var stage = cp.stage || 'student';
  var deadlines = hwGetDeadlines(cp);
  var priorities = hwGetMonthlyPriorities(cp, scores, deadlines);
  var progress = hwGetProgressStatus(cp, scores);
  var financial = hwGetFinancialSnapshot(cp);
  var spec = hwFindSpecialty(cp.specialty);
  var specName = cp.specialty ? cp.specialty.charAt(0).toUpperCase() + cp.specialty.slice(1) : '';
  var overall = Math.round((scores.competitiveness + scores.research + scores.readiness + scores.financial) / 4);

  var stageLabels = { student: 'Medical Student', resident: 'Resident', fellow: 'Fellow', attending: 'Attending Physician' };
  var stageIcons = { student: '🎓', resident: '🏥', fellow: '🔬', attending: '👨‍⚕️' };
  var goalLabels = {
    match: stage === 'student' ? 'Match into Residency' : 'Secure Fellowship',
    specialty: 'Choose Specialty',
    contract: stage === 'attending' ? 'Optimize Position' : 'Land Attending Job',
    finance: 'Financial Optimization',
    direction: 'Career Direction'
  };

  var name = U.name ? 'Dr. ' + U.name.split(' ').pop() : '';
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  var el = document.getElementById('home-hero-card');
  if (!el) return false;

  var h = '';

  // ===== HEADER: Greeting + Score Ring =====
  h += '<div style="background:#111318;border-radius:18px;padding:22px 20px 18px;color:#EDEBE7;position:relative;overflow:hidden;margin-bottom:12px">';
  h += '<div style="position:absolute;top:-30%;right:-10%;width:180px;height:180px;background:radial-gradient(circle,rgba(198,168,94,.08),transparent 60%);border-radius:50%"></div>';
  h += '<div style="position:relative">';

  // Row 1: Greeting + Score ring
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h += '<div>';
  h += '<div style="font-family:var(--font-serif);font-size:17px;font-weight:600;color:#EDEBE7;line-height:1.3">' + (name ? greeting + ', ' + name : greeting) + '</div>';
  h += '<div style="font-size:11px;color:rgba(237,235,231,.45);margin-top:2px">' + stageIcons[stage] + ' ' + (stageLabels[stage] || stage) + (specName ? ' · ' + specName : '') + '</div>';
  h += '</div>';

  // Score ring
  var ringColor = overall >= 75 ? '#5E8B6F' : overall >= 55 ? '#C6A85E' : '#B85C5C';
  var r = 28, circ = 2 * Math.PI * r, offset = circ - (overall / 100) * circ;
  h += '<div style="position:relative;width:52px;height:52px;flex-shrink:0">';
  h += '<svg viewBox="0 0 60 60" style="width:52px;height:52px;transform:rotate(-90deg)">';
  h += '<circle cx="30" cy="30" r="' + r + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="3.5"/>';
  h += '<circle cx="30" cy="30" r="' + r + '" fill="none" stroke="' + ringColor + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" style="transition:stroke-dashoffset .8s ease"/>';
  h += '</svg>';
  h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;font-weight:700;color:' + ringColor + ';font-family:var(--font-serif)">' + overall + '</div>';
  h += '</div>';
  h += '</div>';

  // Row 2: Goal banner
  var goalLabel = goalLabels[cp.goal] || 'Build your career';
  h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(198,168,94,.08);border:1px solid rgba(198,168,94,.15);border-radius:10px">';
  h += '<div style="font-size:14px">🎯</div>';
  h += '<div style="flex:1;font-size:12px;color:rgba(237,235,231,.7)">Goal: <strong style="color:#EDEBE7">' + goalLabel + '</strong></div>';
  h += '<span onclick="showUpdateProfile()" style="font-size:10px;color:var(--accent);cursor:pointer;font-weight:600">Edit →</span>';
  h += '</div>';

  h += '</div></div>';

  // ===== COUNTDOWN: Next Critical Deadline =====
  var nextCritical = deadlines.find(function(d) { return !d.isPast && (d.urgency === 'critical' || d.urgency === 'high'); });
  if (nextCritical) {
    var daysColor = nextCritical.daysAway <= 14 ? 'var(--red)' : nextCritical.daysAway <= 30 ? '#C6A85E' : 'var(--green)';
    h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
    h += '<div style="display:flex;align-items:center;gap:14px">';
    h += '<div style="text-align:center;min-width:56px">';
    h += '<div style="font-size:28px;font-weight:800;color:' + daysColor + ';font-family:var(--font-serif);line-height:1">' + Math.max(0, nextCritical.daysAway) + '</div>';
    h += '<div style="font-size:9px;font-weight:600;color:' + daysColor + ';text-transform:uppercase;letter-spacing:.5px">days</div>';
    h += '</div>';
    h += '<div style="flex:1;border-left:2px solid #E8E1D8;padding-left:14px">';
    h += '<div style="font-size:13px;font-weight:600;color:#1C1A17;line-height:1.3">' + nextCritical.title + '</div>';
    h += '<div style="font-size:11px;color:#8A8278;margin-top:2px;line-height:1.4">' + nextCritical.desc + '</div>';
    if (nextCritical.tool) {
      h += '<div onclick="openFramework(\'' + nextCritical.tool + '\')" style="margin-top:6px;font-size:11px;color:#C6A85E;font-weight:600;cursor:pointer">Prepare with tool →</div>';
    }
    h += '</div></div></div>';
  }

  // ===== THIS MONTH'S PRIORITIES =====
  if (priorities.length) {
    h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
    h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px">📋 This Month\'s Priorities</div>';
    priorities.slice(0, 3).forEach(function(p, i) {
      var urgColor = p.urgency === 'critical' ? 'var(--red)' : p.urgency === 'high' ? '#C6A85E' : '#8A8278';
      var barColor = i === 0 ? '#C6A85E' : i === 1 ? '#8BB4A0' : '#8A8278';
      h += '<div style="display:flex;gap:10px;padding:10px 12px;background:#F8F5F0;border-radius:10px;margin-bottom:6px;border-left:3px solid ' + barColor + ';cursor:' + (p.tool ? 'pointer' : 'default') + '"' + (p.tool ? ' onclick="openFramework(\'' + p.tool + '\')"' : '') + '>';
      h += '<div style="font-size:14px;font-weight:700;color:#C6A85E;flex-shrink:0;width:20px;text-align:center">' + (i + 1) + '</div>';
      h += '<div style="flex:1">';
      h += '<div style="font-size:12px;font-weight:600;color:#1C1A17;line-height:1.3">' + p.title + '</div>';
      h += '<div style="font-size:11px;color:#8A8278;margin-top:2px;line-height:1.4">' + p.desc + '</div>';
      h += '</div>';
      if (p.urgency === 'critical') {
        h += '<span style="font-size:8px;padding:2px 6px;background:rgba(192,96,96,.1);color:var(--red);border-radius:6px;font-weight:600;flex-shrink:0;align-self:flex-start;margin-top:2px">URGENT</span>';
      }
      h += '</div>';
    });
    // Show more priorities if available
    if (priorities.length > 3) {
      h += '<div id="cm-more-pri" style="display:none">';
      priorities.slice(3).forEach(function(p, i) {
        h += '<div style="display:flex;gap:10px;padding:10px 12px;background:#F8F5F0;border-radius:10px;margin-bottom:6px;border-left:3px solid #8A8278;cursor:' + (p.tool ? 'pointer' : 'default') + '"' + (p.tool ? ' onclick="openFramework(\'' + p.tool + '\')"' : '') + '>';
        h += '<div style="font-size:14px;font-weight:700;color:#8A8278;flex-shrink:0;width:20px;text-align:center">' + (i + 4) + '</div>';
        h += '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1C1A17;line-height:1.3">' + p.title + '</div>';
        h += '<div style="font-size:11px;color:#8A8278;margin-top:2px;line-height:1.4">' + p.desc + '</div></div></div>';
      });
      h += '</div>';
      h += '<div onclick="var m=document.getElementById(\'cm-more-pri\');m.style.display=m.style.display===\'none\'?\'\':\'none\';this.textContent=m.style.display===\'none\'?\'Show ' + (priorities.length - 3) + ' more →\':\'Show less\'" style="text-align:center;font-size:11px;color:#C6A85E;cursor:pointer;font-weight:600;padding-top:4px">Show ' + (priorities.length - 3) + ' more →</div>';
    }
    h += '</div>';
  }

  // ===== PROGRESS TRACKER =====
  if (progress.length) {
    h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
    h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px">' + (stage === 'attending' ? '💰 Financial Health' : '📊 Where You Stand') + '</div>';
    h += '<span onclick="showUpdateProfile()" style="font-size:10px;color:#C6A85E;cursor:pointer;font-weight:600">Update →</span>';
    h += '</div>';

    progress.forEach(function(p) {
      var statusColors = { 'ahead': '#5E8B6F', 'on-track': '#5E8B6F', 'gap': '#C6A85E', 'behind': '#B85C5C' };
      var statusIcons = { 'ahead': '🟢', 'on-track': '🟢', 'gap': '🟡', 'behind': '🔴' };
      var statusLabels = { 'ahead': 'Ahead', 'on-track': 'On Track', 'gap': 'Gap', 'behind': 'Behind' };
      var col = statusColors[p.status] || '#8A8278';

      h += '<div style="padding:8px 0;border-bottom:1px solid #F0ECE4">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">';
      h += '<div style="font-size:12px;font-weight:600;color:#1C1A17">' + p.label + '</div>';
      h += '<div style="display:flex;align-items:center;gap:6px">';
      h += '<span style="font-size:12px;font-weight:700;color:' + col + '">' + p.you + '</span>';
      h += '<span style="font-size:10px;color:#8A8278">/ ' + p.target + '</span>';
      h += '<span style="font-size:8px;padding:1px 5px;background:' + col + '15;color:' + col + ';border-radius:4px;font-weight:600">' + (statusLabels[p.status] || '') + '</span>';
      h += '</div></div>';
      if (p.detail) {
        h += '<div style="font-size:10px;color:#8A8278;line-height:1.4">' + p.detail + '</div>';
      }
      h += '</div>';
    });
    h += '</div>';
  }

  // ===== FINANCIAL SNAPSHOT =====
  if (financial.hasData) {
    h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
    h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px">💵 Financial Snapshot</div>';
    financial.lines.forEach(function(l) {
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:' + (l.sub ? '2px 0 2px 16px' : '6px 0') + '">';
      h += '<span style="font-size:' + (l.sub ? '10' : '12') + 'px;color:' + (l.sub ? '#8A8278' : '#1C1A17') + '">' + l.label + '</span>';
      h += '<span style="font-size:' + (l.sub ? '10' : '13') + 'px;font-weight:' + (l.sub ? '500' : '700') + ';color:' + l.color + '">' + l.value + '</span>';
      h += '</div>';
    });
    // Link to financial tools
    h += '<div onclick="openFramework(\'v11\')" style="margin-top:8px;text-align:center;font-size:11px;color:#C6A85E;cursor:pointer;font-weight:600">Run Full Financial Projection →</div>';
    h += '</div>';
  }

  // ===== UPCOMING DEADLINES (next 90 days) =====
  var upcoming = deadlines.filter(function(d) { return !d.isPast && d.daysAway <= 90; }).slice(0, 5);
  if (upcoming.length) {
    h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
    h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px">📅 Upcoming Deadlines</div>';
    upcoming.forEach(function(d) {
      var dateStr = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      var urgColor = d.urgency === 'critical' ? 'var(--red)' : d.urgency === 'high' ? '#C6A85E' : '#8A8278';
      var dayColor = d.daysAway <= 14 ? 'var(--red)' : d.daysAway <= 30 ? '#C6A85E' : '#5E8B6F';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #F0ECE4;cursor:' + (d.tool ? 'pointer' : 'default') + '"' + (d.tool ? ' onclick="openFramework(\'' + d.tool + '\')"' : '') + '>';
      h += '<div style="min-width:42px;text-align:center"><span style="font-size:11px;font-weight:700;color:' + dayColor + '">' + d.daysAway + 'd</span></div>';
      h += '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#1C1A17">' + d.title + '</div>';
      h += '<div style="font-size:10px;color:#8A8278">' + dateStr + '</div></div>';
      var catIcons = { application: '📝', exam: '📚', career: '💼', financial: '💰' };
      h += '<span style="font-size:12px">' + (catIcons[d.category] || '📌') + '</span>';
      h += '</div>';
    });

    // Show all deadlines toggle
    var allDeadlines = deadlines.filter(function(d) { return !d.isPast; });
    if (allDeadlines.length > 5) {
      h += '<div id="cm-all-deadlines" style="display:none">';
      allDeadlines.slice(5).forEach(function(d) {
        var dateStr2 = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        var dayColor2 = d.daysAway <= 30 ? '#C6A85E' : '#8A8278';
        h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #F0ECE4">';
        h += '<div style="min-width:42px;text-align:center"><span style="font-size:11px;font-weight:700;color:' + dayColor2 + '">' + d.daysAway + 'd</span></div>';
        h += '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#1C1A17">' + d.title + '</div>';
        h += '<div style="font-size:10px;color:#8A8278">' + dateStr2 + '</div></div></div>';
      });
      h += '</div>';
      h += '<div onclick="var m=document.getElementById(\'cm-all-deadlines\');m.style.display=m.style.display===\'none\'?\'\':\'none\';this.textContent=m.style.display===\'none\'?\'View all ' + allDeadlines.length + ' deadlines →\':\'Show less\'" style="text-align:center;font-size:11px;color:#C6A85E;cursor:pointer;font-weight:600;padding-top:6px">View all ' + allDeadlines.length + ' deadlines →</div>';
    }
    h += '</div>';
  }

  // ===== RERUN REMINDERS =====
  var th = U.toolHistory || [];
  if (th.length > 0) {
    var lastRuns = {};
    th.forEach(function(t) { lastRuns[t.tool] = new Date(t.date); });
    var retoolDays = {
      'Match Competitiveness Calculator': 30,
      'Fellowship Readiness Assessment': 45,
      'RVU Compensation Calculator': 60,
      'Contract Review Tool': 90,
      'Financial Projection Tool': 90,
      'Specialty Fit Assessment': 60,
      'Research Impact Calculator': 45
    };
    var staleTools = [];
    Object.keys(lastRuns).forEach(function(tool) {
      var rec = retoolDays[tool];
      if (rec) {
        var daysSince = Math.floor((new Date() - lastRuns[tool]) / 86400000);
        if (daysSince >= rec) {
          staleTools.push({ tool: tool, daysSince: daysSince, recommended: rec });
        }
      }
    });

    if (staleTools.length) {
      staleTools.sort(function(a, b) { return b.daysSince - a.daysSince; });
      h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
      h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px">🔄 Time to Re-run</div>';
      staleTools.slice(0, 3).forEach(function(s) {
        var toolId = null;
        if (typeof VAULT_ITEMS !== 'undefined') {
          var vi = VAULT_ITEMS.find(function(v) { return v.title === s.tool; });
          if (vi) toolId = vi.id;
        }
        h += '<div' + (toolId ? ' onclick="openFramework(\'' + toolId + '\')"' : '') + ' style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0ECE4;cursor:pointer">';
        h += '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1C1A17">' + s.tool + '</div>';
        h += '<div style="font-size:10px;color:#8A8278">Last run ' + s.daysSince + ' days ago · recommended every ' + s.recommended + ' days</div></div>';
        h += '<span style="font-size:11px;color:#C6A85E;font-weight:600">Re-run →</span>';
        h += '</div>';
      });
      h += '</div>';
    }
  }

  // ===== SCORE BREAKDOWN BARS =====
  var dims = [
    { k: 'competitiveness', l: 'Competitiveness', icon: '🏆', desc: stage === 'attending' ? 'Market position' : 'Match/fellowship readiness' },
    { k: 'research', l: 'Research', icon: '🔬', desc: 'Publications & scholarly activity' },
    { k: 'readiness', l: 'Readiness', icon: '🎯', desc: stage === 'attending' ? 'Career optimization' : 'Application strength' },
    { k: 'financial', l: 'Financial', icon: '💰', desc: 'Financial health & planning' }
  ];
  h += '<div style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)">';
  h += '<div style="font-size:10px;font-weight:600;color:#C6A85E;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px">📈 Career Score Breakdown</div>';
  dims.forEach(function(dim) {
    var val = scores[dim.k] || 0;
    var barColor = val >= 75 ? '#5E8B6F' : val >= 55 ? '#C6A85E' : '#B85C5C';
    h += '<div style="margin-bottom:10px">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">';
    h += '<span style="font-size:11px;color:#1C1A17">' + dim.icon + ' ' + dim.l + '</span>';
    h += '<span style="font-size:12px;font-weight:700;color:' + barColor + '">' + val + '</span>';
    h += '</div>';
    h += '<div style="height:6px;background:#F0ECE4;border-radius:3px;overflow:hidden">';
    h += '<div style="height:100%;width:' + val + '%;background:' + barColor + ';border-radius:3px;transition:width .6s ease"></div>';
    h += '</div>';
    h += '<div style="font-size:9px;color:#8A8278;margin-top:1px">' + dim.desc + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // ===== QUICK ACTIONS =====
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
  h += '<div onclick="navTo(\'scr-ask\')" style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:14px;text-align:center;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.04);transition:border-color .15s" onmouseenter="this.style.borderColor=\'#C6A85E\'" onmouseleave="this.style.borderColor=\'#E8E1D8\'">';
  h += '<div style="font-size:20px;margin-bottom:4px">🧠</div>';
  h += '<div style="font-size:11px;font-weight:600;color:#1C1A17">Ask a Question</div>';
  h += '</div>';
  h += '<div onclick="navTo(\'scr-vault\')" style="background:#fff;border:1px solid #E8E1D8;border-radius:14px;padding:14px;text-align:center;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.04);transition:border-color .15s" onmouseenter="this.style.borderColor=\'#C6A85E\'" onmouseleave="this.style.borderColor=\'#E8E1D8\'">';
  h += '<div style="font-size:20px;margin-bottom:4px">🔧</div>';
  h += '<div style="font-size:11px;font-weight:600;color:#1C1A17">Career Tools</div>';
  h += '</div>';
  h += '</div>';

  // ===== LAST UPDATED =====
  h += '<div onclick="showUpdateProfile()" style="text-align:center;padding:4px 0;cursor:pointer">';
  h += '<span style="font-size:10px;color:#8A8278">Profile last updated: ' + (cp.lastUpdated ? new Date(cp.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'never') + '</span>';
  h += ' <span style="font-size:10px;color:#C6A85E;font-weight:600">Update →</span>';
  h += '</div>';

  el.innerHTML = h;
  return true; // Signal that we rendered the map
}
