// ===== TOOL FLOW CONNECTIONS =====
// Adds "What to Do Next" cards after every tool result.
// Loaded AFTER js-app.js. Does NOT modify existing files.
// Uses MutationObserver to detect tool completions and inject flow cards.

var HW_TOOL_FLOWS = {
  'v14': {
    next: [
      {id:'v7', label:'Research Impact Calculator', why:'Your research score affects 20% of your match probability. Get a specific research strategy.'},
      {id:'v15', label:'Career Roadmap', why:'Turn your match score into a month-by-month action plan.'},
      {id:'v9', label:'Application Review', why:'Get your personal statement and LOR strategy reviewed.'}
    ]
  },
  'v7': {
    next: [
      {id:'v14', label:'Match Calculator', why:'See how your research improvements move your match probability.'},
      {id:'v15', label:'Career Roadmap', why:'Build a timeline that includes your research milestones.'}
    ]
  },
  'v13': {
    next: [
      {id:'v14', label:'Match Calculator', why:'Now check your competitiveness for your top specialty.'},
      {id:'v15', label:'Career Roadmap', why:'Map out the path to your chosen specialty.'}
    ]
  },
  'v15': {
    next: [
      {id:'v14', label:'Match Calculator', why:'Track your competitiveness as you execute your roadmap.'},
      {id:'v11', label:'Financial Planner', why:'Plan the financial side of your career transition.'}
    ]
  },
  'v11': {
    next: [
      {id:'v12', label:'Contract Analyzer', why:'Make sure your next contract aligns with your financial plan.'},
      {id:'v4', label:'RVU Calculator', why:'Understand your compensation structure.'}
    ]
  },
  'v12': {
    next: [
      {id:'v4', label:'RVU Calculator', why:'Compare your RVU rate against national benchmarks.'},
      {id:'v11', label:'Financial Planner', why:'See how this contract affects your long-term wealth.'}
    ]
  },
  'v4': {
    next: [
      {id:'v12', label:'Contract Analyzer', why:'Analyze your full contract terms, not just compensation.'},
      {id:'v11', label:'Financial Planner', why:'Model your long-term financial trajectory.'}
    ]
  },
  'v9': {
    next: [
      {id:'v14', label:'Match Calculator', why:'See your updated match probability with improvements.'},
      {id:'v16', label:'Interview Practice', why:'Prepare for the interviews your application will earn you.'}
    ]
  },
  'v16': {
    next: [
      {id:'v14', label:'Match Calculator', why:'Check your overall competitiveness one more time.'},
      {id:'v13', label:'Specialty Fit', why:'Make sure you are interviewing at the right programs.'}
    ]
  },
  'v17': {
    next: [
      {id:'v14', label:'Match Calculator', why:'See how US clinical experience will boost your match odds.'},
      {id:'v7', label:'Research Impact', why:'Strengthen your research profile while observing.'}
    ]
  }
};

// Map result container IDs → tool IDs
// These are the elements that get populated when a tool finishes
var HW_FLOW_RESULT_ELS = {
  'mcc-results':    'v14',
  'crs-results':    'v12',
  'ocm-results':    'v12',
  'sfa-results':    'v13',
  'bmd-results':    'v13',
  'csb-results':    'v15',
  'fyp-results':    'v11',
  'ilp-results':    'v11',
  'frc-results':    'v14',
  'frc-pathway':    'v14',
  'roi-results':    'v7',
  'ci-output':      'v12',
  'mis-feedback':   'v16',
  'obs-results':    'v17',
  'obs-plan-results':'v17',
  'rvu-scenarios':  'v4'
};

// ===== RENDER: Flow Card =====
function renderToolFlowCard(toolId, targetEl) {
  var flow = HW_TOOL_FLOWS[toolId];
  if (!flow || !flow.next || !flow.next.length) return;
  if (!targetEl) return;
  // Don't double-inject
  if (targetEl.getAttribute('data-flows-injected')) return;
  targetEl.setAttribute('data-flows-injected', '1');

  var wrapper = document.createElement('div');
  wrapper.className = 'hw-flow-card';
  wrapper.setAttribute('data-flow-tool', toolId);

  var h = '';
  // Divider + header
  h += '<div style="margin-top:28px;padding-top:24px;border-top:2px solid rgba(198,168,94,.3)">';
  h += '<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent,#C6A85E);margin-bottom:16px">What to Do Next</div>';

  // Next-tool cards
  flow.next.forEach(function(item) {
    h += '<div onclick="openFramework(\'' + item.id + '\')" style="';
    h += 'display:flex;align-items:flex-start;gap:14px;';
    h += 'padding:16px 18px;margin-bottom:10px;';
    h += 'background:var(--bg2,#fff);border:1px solid var(--border,#E8E1D8);border-radius:12px;';
    h += 'cursor:pointer;transition:all .2s;';
    h += '" ';
    h += 'onmouseenter="this.style.borderColor=\'rgba(198,168,94,.5)\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,.06)\'" ';
    h += 'onmouseleave="this.style.borderColor=\'var(--border,#E8E1D8)\';this.style.boxShadow=\'none\'">';

    // Arrow icon
    h += '<div style="flex-shrink:0;width:32px;height:32px;border-radius:8px;background:rgba(198,168,94,.08);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--accent,#C6A85E)">→</div>';

    // Text
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:13px;font-weight:600;color:var(--text,#1C1A17);margin-bottom:3px">' + item.label + '</div>';
    h += '<div style="font-size:12px;color:var(--text2,#8A8478);line-height:1.5;font-family:var(--font-serif,Georgia,serif)">' + item.why + '</div>';
    h += '</div>';

    h += '</div>';
  });

  // Feedback row
  h += renderToolFeedback(toolId);

  h += '</div>'; // close wrapper div

  wrapper.innerHTML = h;
  targetEl.appendChild(wrapper);
}

// ===== RENDER: Feedback =====
function renderToolFeedback(toolId) {
  var fbId = 'hw-fb-' + toolId + '-' + Date.now();
  var h = '';
  h += '<div id="' + fbId + '" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border,#E8E1D8);display:flex;align-items:center;gap:10px">';
  h += '<span style="font-size:11px;color:var(--text3,#AAA5A0)">Was this helpful?</span>';

  // Thumbs up
  h += '<button onclick="hwRecordFeedback(\'' + toolId + '\',true,\'' + fbId + '\')" style="';
  h += 'border:none;background:none;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:background .15s;';
  h += '" onmouseenter="this.style.background=\'rgba(198,168,94,.1)\'" onmouseleave="this.style.background=\'none\'"';
  h += ' title="Yes">👍</button>';

  // Thumbs down
  h += '<button onclick="hwRecordFeedback(\'' + toolId + '\',false,\'' + fbId + '\')" style="';
  h += 'border:none;background:none;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:background .15s;';
  h += '" onmouseenter="this.style.background=\'rgba(198,168,94,.1)\'" onmouseleave="this.style.background=\'none\'"';
  h += ' title="No">👎</button>';

  h += '</div>';
  return h;
}

// ===== RECORD FEEDBACK =====
function hwRecordFeedback(toolId, helpful, fbElId) {
  // Store in user object
  if (typeof U !== 'undefined' && U) {
    if (!U.toolFeedback) U.toolFeedback = {};
    U.toolFeedback[toolId] = { helpful: helpful, date: new Date().toISOString() };
    // Persist if save function exists
    if (typeof saveProfile === 'function') {
      try { saveProfile(); } catch(e) {}
    }
  }
  // Show confirmation
  var el = document.getElementById(fbElId);
  if (el) {
    el.innerHTML = '<div style="font-size:12px;color:var(--accent,#C6A85E);display:flex;align-items:center;gap:6px">'
      + '<span>✓</span><span>Thanks for the feedback!</span></div>';
    // Fade after 3 seconds
    setTimeout(function() {
      el.style.transition = 'opacity .5s';
      el.style.opacity = '0.4';
    }, 3000);
  }
}

// ===== AUTO-DETECTION via MutationObserver =====
// Watches for tool result containers getting populated and injects flow cards

var _hwFlowsActive = false;
var _hwFlowDebounce = {};

function hwFlowsInit() {
  if (_hwFlowsActive) return;
  _hwFlowsActive = true;

  // Target: the modal that holds all tool content
  var modalContent = document.getElementById('modal-q-content');
  var mainApp = document.getElementById('main-app');

  var targets = [];
  if (modalContent) targets.push(modalContent);
  if (mainApp) targets.push(mainApp);

  // Fallback: observe body if modal not yet in DOM
  if (!targets.length) targets.push(document.body);

  var observer = new MutationObserver(function(mutations) {
    // Batch — only scan once per animation frame
    if (_hwFlowDebounce._raf) return;
    _hwFlowDebounce._raf = requestAnimationFrame(function() {
      _hwFlowDebounce._raf = null;
      hwScanForResults();
    });
  });

  targets.forEach(function(target) {
    observer.observe(target, { childList: true, subtree: true });
  });

  // Also do an initial scan
  setTimeout(hwScanForResults, 1000);
}

function hwScanForResults() {
  var ids = Object.keys(HW_FLOW_RESULT_ELS);
  for (var i = 0; i < ids.length; i++) {
    var elId = ids[i];
    var toolId = HW_FLOW_RESULT_ELS[elId];
    var el = document.getElementById(elId);
    if (!el) continue;
    // Must have visible content (not empty, not hidden)
    if (!el.innerHTML || el.innerHTML.length < 50) continue;
    if (el.style.display === 'none') continue;
    if (el.offsetParent === null) continue;
    // Don't inject if already done
    if (el.getAttribute('data-flows-injected')) continue;
    // Don't inject into blurred/gated content
    if (el.querySelector('.blur-gate-overlay')) continue;
    // Don't inject if result is just a loading/queued state
    if (el.innerHTML.indexOf('Assessment in progress') !== -1) continue;
    if (el.innerHTML.indexOf('putting together') !== -1) continue;

    renderToolFlowCard(toolId, el);
  }
}

// ===== HOOK: openFramework override =====
// When a user navigates to a new tool, clear flow-injected flags
// so returning to a tool can re-inject if needed
(function() {
  var _origOpen = typeof openFramework === 'function' ? openFramework : null;
  if (!_origOpen) {
    // If openFramework isn't defined yet, try again after load
    var _retries = 0;
    var _waitForOpen = setInterval(function() {
      _retries++;
      if (typeof openFramework === 'function' && openFramework !== hwWrappedOpenFramework) {
        _origOpen = openFramework;
        openFramework = hwWrappedOpenFramework;
        clearInterval(_waitForOpen);
      }
      if (_retries > 40) clearInterval(_waitForOpen); // give up after 20s
    }, 500);
  } else {
    openFramework = hwWrappedOpenFramework;
  }

  function hwWrappedOpenFramework(id) {
    // Clear injection flags so flow cards appear fresh on re-runs
    var els = document.querySelectorAll('[data-flows-injected]');
    for (var j = 0; j < els.length; j++) {
      els[j].removeAttribute('data-flows-injected');
      // Remove old flow cards
      var oldCards = els[j].querySelectorAll('.hw-flow-card');
      for (var k = 0; k < oldCards.length; k++) {
        oldCards[k].parentNode.removeChild(oldCards[k]);
      }
    }
    // Call original
    if (_origOpen) _origOpen.call(this, id);
  }
})();

// ===== BOOT =====
// Start observing once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hwFlowsInit);
} else {
  // Small delay to let js-app.js finish initializing
  setTimeout(hwFlowsInit, 500);
}
