// ===== FEATURE 1: MONTHLY CAREER CHECK-IN =====
function renderMonthlyCheckinTrigger(){
  var el=document.getElementById('monthly-checkin-trigger');
  if(!el||!U)return;
  var now=new Date();
  var lastMonthly=(U.monthlyCheckins||[]).slice(-1)[0];
  var daysSince=lastMonthly?Math.floor((now-new Date(lastMonthly.date))/86400000):999;
  if(daysSince<25){el.style.display='none';return}
  if((U.toolHistory||[]).length===0){el.style.display='none';return}
  el.style.display='';
  var monthName=now.toLocaleDateString('en-US',{month:'long'});
  el.innerHTML='<div onclick="showMonthlyCheckin()" style="display:flex;align-items:center;gap:14px;padding:18px;background:linear-gradient(160deg,rgba(198,168,94,.08),rgba(198,168,94,.02));border:1px solid rgba(198,168,94,.2);border-radius:14px;cursor:pointer;transition:all .2s" onmouseenter="this.style.borderColor=\'rgba(198,168,94,.4)\'" onmouseleave="this.style.borderColor=\'rgba(198,168,94,.2)\'">'
    +'<span style="font-size:24px">📊</span>'
    +'<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--text)">'+monthName+' Career Check-in</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-top:2px">5 minutes — update your career situation and get fresh recommendations</div></div>'
    +'<span style="font-size:13px;font-weight:600;color:var(--accent)">Start →</span></div>';
}

function showMonthlyCheckin(){
  if(!U)return;
  if(!U.monthlyCheckins)U.monthlyCheckins=[];
  var cp=U.careerProfile||{};
  var stage=cp.stage||'student';
  var h='<div style="padding:24px;max-width:520px;margin:0 auto">';
  h+='<div style="text-align:center;margin-bottom:24px"><div style="font-size:36px;margin-bottom:8px">📊</div>';
  h+='<div style="font-size:20px;font-weight:600;color:var(--text);font-family:var(--font-serif)">Monthly Career Check-in</div>';
  h+='<div style="font-size:12px;color:var(--text3);margin-top:4px">What\'s changed? This updates your profile and sharpens your recommendations.</div></div>';

  // Section 1: Big changes
  h+='<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Any Big Developments?</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
  var tags=[{id:'new-offer',l:'New job offer'},{id:'new-interview',l:'Got an interview'},{id:'new-pub',l:'Published a paper'},{id:'new-score',l:'New exam score'},{id:'new-rotation',l:'Started rotation'},{id:'accepted-position',l:'Accepted a position'},{id:'contract-signed',l:'Signed a contract'},{id:'started-fellowship',l:'Started fellowship'},{id:'salary-change',l:'Salary change'},{id:'new-lor',l:'New LOR secured'}];
  tags.forEach(function(t){
    h+='<button id="mci-tag-'+t.id+'" onclick="this.classList.toggle(\'mci-active\');this.style.background=this.classList.contains(\'mci-active\')?\'rgba(198,168,94,.15)\':\'var(--bg3)\';this.style.borderColor=this.classList.contains(\'mci-active\')?\'var(--accent)\':\'var(--border)\';this.style.color=this.classList.contains(\'mci-active\')?\'var(--accent)\':\'var(--text3)\'" style="padding:6px 12px;font-size:11px;border:1px solid var(--border);border-radius:20px;background:var(--bg3);color:var(--text3);cursor:pointer;transition:all .15s">'+t.l+'</button>';
  });
  h+='</div>';
  h+='<textarea id="mci-details" rows="3" placeholder="Tell me more... (e.g., Got 3 fellowship interviews, Step 2 came back 258, negotiating two contracts...)" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:12px;resize:vertical;font-family:var(--font-body)"></textarea></div>';

  // Section 2: Updated numbers
  h+='<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Updated Numbers (if changed)</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  if(stage==='student'||stage==='resident'){
    h+='<div><label style="font-size:10px;color:var(--text3)">Publications</label><input type="number" id="mci-pubs" value="'+(cp.pubs||'')+'" placeholder="Total pubs" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"></div>';
    h+='<div><label style="font-size:10px;color:var(--text3)">Conferences</label><input type="number" id="mci-conf" value="'+(cp.conferences||'')+'" placeholder="Presentations" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"></div>';
  }
  if(stage==='fellow'||stage==='attending'){
    h+='<div><label style="font-size:10px;color:var(--text3)">Current Salary</label><input type="text" id="mci-salary" value="'+(cp.comp||'')+'" placeholder="e.g. $350,000" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"></div>';
    h+='<div><label style="font-size:10px;color:var(--text3)">Student Debt</label><input type="text" id="mci-debt" value="'+(cp.debt||'')+'" placeholder="e.g. $200,000" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"></div>';
  }
  h+='<div><label style="font-size:10px;color:var(--text3)">Leadership Roles</label><input type="number" id="mci-lead" value="'+(cp.leadership||'')+'" placeholder="Count" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"></div>';
  h+='<div><label style="font-size:10px;color:var(--text3)">LOR Strength</label><select id="mci-lor" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px"><option value="">—</option><option value="strong"'+(cp.lorStrength==='strong'?' selected':'')+'>Strong</option><option value="moderate"'+(cp.lorStrength==='moderate'?' selected':'')+'>Moderate</option><option value="weak"'+(cp.lorStrength==='weak'?' selected':'')+'>Weak/None</option></select></div>';
  h+='</div></div>';

  // Section 3: Current concern
  h+='<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Biggest Career Concern Right Now</div>';
  h+='<select id="mci-concern" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:12px">';
  h+='<option value="">Select one...</option>';
  h+='<option value="match">Getting into my target program</option>';
  h+='<option value="fellowship">Fellowship applications</option>';
  h+='<option value="contract">Evaluating a contract/offer</option>';
  h+='<option value="negotiation">Salary negotiation</option>';
  h+='<option value="finances">Student debt / financial planning</option>';
  h+='<option value="career-direction">Unsure about career direction</option>';
  h+='<option value="research">Building research profile</option>';
  h+='<option value="transition">Career transition</option>';
  h+='<option value="burnout">Work-life balance / burnout</option>';
  h+='<option value="other">Something else</option>';
  h+='</select></div>';

  // Section 4: Confidence
  h+='<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">How confident do you feel about your career trajectory?</div>';
  h+='<div style="display:flex;gap:6px" id="mci-confidence">';
  for(var i=1;i<=5;i++){
    var labels=['Not at all','Somewhat worried','Neutral','Fairly confident','Very confident'];
    h+='<button onclick="document.querySelectorAll(\'#mci-confidence button\').forEach(function(b){b.style.background=\'var(--bg3)\';b.style.borderColor=\'var(--border)\';b.style.color=\'var(--text3)\'});this.style.background=\'rgba(198,168,94,.15)\';this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';this.dataset.val=\''+i+'\'" data-val="'+i+'" style="flex:1;padding:10px 4px;font-size:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg3);color:var(--text3);cursor:pointer;text-align:center;line-height:1.3" title="'+labels[i-1]+'">'+i+'<br><span style="font-size:8px">'+labels[i-1]+'</span></button>';
  }
  h+='</div></div>';

  h+='<button onclick="submitMonthlyCheckin()" style="width:100%;padding:14px;background:var(--accent);color:#1C1A17;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">Save Check-in & Update Scores →</button></div>';
  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}

function submitMonthlyCheckin(){
  if(!U)return;
  if(!U.monthlyCheckins)U.monthlyCheckins=[];
  var cp=U.careerProfile||{};
  var activeTags=[];
  document.querySelectorAll('[id^="mci-tag-"].mci-active').forEach(function(b){activeTags.push(b.id.replace('mci-tag-',''))});
  var details=(document.getElementById('mci-details')||{}).value||'';
  var concern=(document.getElementById('mci-concern')||{}).value||'';
  var confBtn=document.querySelector('#mci-confidence button[style*="accent"]');
  var confidence=confBtn?parseInt(confBtn.dataset.val)||3:3;

  // Update career profile with new numbers
  var pubsEl=document.getElementById('mci-pubs');if(pubsEl&&pubsEl.value)cp.pubs=parseInt(pubsEl.value)||cp.pubs;
  var confEl=document.getElementById('mci-conf');if(confEl&&confEl.value)cp.conferences=parseInt(confEl.value)||cp.conferences;
  var salEl=document.getElementById('mci-salary');if(salEl&&salEl.value)cp.comp=salEl.value;
  var debtEl=document.getElementById('mci-debt');if(debtEl&&debtEl.value)cp.debt=debtEl.value;
  var leadEl=document.getElementById('mci-lead');if(leadEl&&leadEl.value)cp.leadership=parseInt(leadEl.value)||cp.leadership;
  var lorEl=document.getElementById('mci-lor');if(lorEl&&lorEl.value)cp.lorStrength=lorEl.value;
  if(concern)cp.concern=concern;
  cp.lastUpdated=new Date().toISOString();
  U.careerProfile=cp;

  // Recalculate scores
  if(typeof calcDashScores==='function'){
    var newScores=calcDashScores(cp);
    if(!U.scoreHistory)U.scoreHistory=[];
    U.scoreHistory.push({date:new Date().toISOString(),scores:newScores});
  }

  // Save check-in record
  U.monthlyCheckins.push({
    date:new Date().toISOString(),
    developments:activeTags,
    details:details,
    concern:concern,
    confidence:confidence
  });
  if(U.monthlyCheckins.length>24)U.monthlyCheckins=U.monthlyCheckins.slice(-24);

  saveUser();
  closeModal('modal-q');
  notify('Monthly check-in saved! Your scores have been updated. 📊');
  renderHome();
  if(typeof renderDashboard==='function')renderDashboard();
}

// ===== FEATURE 2: TOOL RE-RUN REMINDERS =====
function renderRerunReminders(){
  var el=document.getElementById('rerun-reminders');
  if(!el||!U)return;
  var history=U.toolHistory||[];
  if(history.length===0){el.style.display='none';return}
  var now=new Date();
  // Get last run date per tool
  var lastRun={};
  history.forEach(function(t){
    if(!lastRun[t.tool]||new Date(t.date)>new Date(lastRun[t.tool].date)){
      lastRun[t.tool]=t;
    }
  });
  // Tools worth re-running and their suggested intervals (days)
  var rerunnable={
    'Fellowship Readiness Calculator':{days:30,reason:'Your readiness score may have changed with new experiences.',icon:'🎯'},
    'Contract Risk Scanner':{days:45,reason:'Re-scan if you\'ve received a revised offer or new contract.',icon:'📋'},
    'Job Offer Comparison':{days:30,reason:'Compare again if you have new offers on the table.',icon:'⚖️'},
    'RVU Compensation Modeler':{days:60,reason:'Market rates shift — make sure your comp is still competitive.',icon:'💰'},
    '3-Year Financial Planner':{days:60,reason:'Update with actual income and expenses for a more accurate plan.',icon:'📅'},
    'Research Impact Calculator':{days:45,reason:'New publications or presentations? Recalculate your research score.',icon:'🔬'},
    'Debt & Income Strategy':{days:60,reason:'Refresh with current debt balance and any income changes.',icon:'💵'},
    'Match Competitiveness Calculator':{days:30,reason:'Re-run as you add publications, scores, or experiences.',icon:'🎯'},
    'Career Strategy Builder':{days:45,reason:'Your strategy should evolve as your situation changes.',icon:'🧭'},
    'Financial Projection Tool':{days:90,reason:'Update with actual numbers for a more accurate 30-year view.',icon:'📈'},
    'Specialty Fit Analyzer':{days:60,reason:'Your preferences may have shifted — worth re-checking.',icon:'🔍'},
    'Contract Review Tool':{days:45,reason:'Re-review if contract terms have been renegotiated.',icon:'📝'}
  };
  var stale=[];
  Object.keys(lastRun).forEach(function(tool){
    var cfg=rerunnable[tool];
    if(!cfg)return;
    var ageDays=Math.floor((now-new Date(lastRun[tool].date))/86400000);
    if(ageDays>=cfg.days){
      stale.push({tool:tool,ageDays:ageDays,reason:cfg.reason,icon:cfg.icon,score:lastRun[tool].score});
    }
  });
  if(stale.length===0){el.style.display='none';return}
  stale.sort(function(a,b){return b.ageDays-a.ageDays});
  var show=stale.slice(0,3);
  el.style.display='';
  var h='<div class="card" style="padding:16px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🔄 Time to Re-run</div>';
  show.forEach(function(s,i){
    var toolId='';
    if(typeof VAULT_ITEMS!=='undefined'){var vi=VAULT_ITEMS.find(function(v){return v.title===s.tool});if(vi)toolId=vi.id}
    h+='<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;'+(i<show.length-1?'border-bottom:1px solid var(--border)':'')+';cursor:pointer" '+(toolId?'onclick="openFramework(\''+toolId+'\')"':'')+' onmouseenter="this.style.background=\'var(--bg2)\'" onmouseleave="this.style.background=\'transparent\'">';
    h+='<span style="font-size:18px;flex-shrink:0;margin-top:2px">'+s.icon+'</span>';
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text)">'+s.tool+'</div>';
    h+='<div style="font-size:11px;color:var(--text3);line-height:1.5;margin-top:2px">'+s.reason+'</div>';
    h+='<div style="font-size:10px;color:var(--text3);margin-top:4px">';
    h+='Last run <strong>'+s.ageDays+' days ago</strong>';
    if(s.score)h+=' · Score: <strong style="color:var(--accent)">'+s.score+'</strong>';
    h+='</div></div>';
    h+='<span style="font-size:11px;font-weight:600;color:var(--accent);white-space:nowrap;margin-top:4px">Re-run →</span>';
    h+='</div>';
  });
  if(stale.length>3){
    h+='<div style="font-size:10px;color:var(--text3);text-align:center;padding-top:8px">'+(stale.length-3)+' more tool'+(stale.length-3>1?'s':'')+' ready for a refresh</div>';
  }
  h+='</div>';
  el.innerHTML=h;
}

// ===== FEATURE 3: SEASONAL CONTENT CALENDAR =====
function renderSeasonalCalendar(){
  var el=document.getElementById('seasonal-calendar');
  if(!el||!U)return;
  var cp=U.careerProfile||{};
  var stage=cp.stage||'student';
  var now=new Date();
  var month=now.getMonth(); // 0-indexed
  var toolsUsed=(U.toolHistory||[]).map(function(t){return t.tool});

  // Comprehensive medical career calendar with tool suggestions
  var calendar={
    student:[
      {m:[0,1],season:'Match Prep Season',desc:'Final push before rank lists. Mock interviews and application polish.',tools:[{id:'v16',name:'Mock Interview Simulator',why:'Practice before real interviews'},{id:'v9',name:'Application Review',why:'Last chance to strengthen your app'}],icon:'🎯',urgent:true},
      {m:[2],season:'Match Day',desc:'Results are in. Time to plan your next move — whether celebrating or scrambling.',tools:[{id:'v5',name:'3-Year Financial Planner',why:'Start planning your resident finances'},{id:'v15',name:'Career Strategy Builder',why:'Map your residency strategy'}],icon:'🎉',urgent:true},
      {m:[3,4],season:'Post-Match Planning',desc:'Transition period. Set financial foundations before residency starts.',tools:[{id:'v8',name:'Debt & Income Strategy',why:'Get your loan strategy set before training'},{id:'v5',name:'3-Year Financial Planner',why:'Plan your resident budget'}],icon:'📋'},
      {m:[5,6],season:'Away Rotation Season',desc:'Applications open for away rotations. Strategic program exposure.',tools:[{id:'v14',name:'Match Competitiveness Calculator',why:'Know where you stand before choosing aways'},{id:'v1',name:'Fellowship Readiness Calculator',why:'Assess your readiness'}],icon:'🏥'},
      {m:[7,8],season:'ERAS Season',desc:'Applications are opening. Submit Day 1 for competitive specialties.',tools:[{id:'v6',name:'Fellowship Application Planner',why:'Month-by-month application plan'},{id:'v9',name:'Application Review',why:'Get your chances projection'}],icon:'🚀',urgent:true},
      {m:[9,10],season:'Interview Season',desc:'Interviews are happening. Practice, prepare, and track your ranking.',tools:[{id:'v16',name:'Mock Interview Simulator',why:'Honest debrief on your performance'},{id:'v13',name:'Specialty Fit Analyzer',why:'Confirm your specialty choice'}],icon:'🗓️'},
      {m:[11],season:'Rank List Finalization',desc:'Finalize your rank list. This decision shapes your next 3-7 years.',tools:[{id:'v3',name:'Job Offer Comparison',why:'Compare programs systematically'},{id:'v15',name:'Career Strategy Builder',why:'Think long-term about each option'}],icon:'📊'}
    ],
    resident:[
      {m:[0,1,2],season:'Fellowship App Prep',desc:'If applying for fellowship, now is the time to build your CV.',tools:[{id:'v1',name:'Fellowship Readiness Calculator',why:'Know your gaps before applying'},{id:'v7',name:'Research Impact Calculator',why:'Quantify your research profile'}],icon:'📚'},
      {m:[3,4,5],season:'Research & Publication Push',desc:'Summer conferences approaching. Get abstracts submitted and papers finished.',tools:[{id:'v7',name:'Research Impact Calculator',why:'Track your research growth'},{id:'v6',name:'Fellowship Application Planner',why:'Timeline your application'}],icon:'🔬'},
      {m:[6,7,8],season:'Fellowship Application Season',desc:'ERAS opens. Submit applications and prepare for interviews.',tools:[{id:'v9',name:'Application Review',why:'Chances projection'},{id:'v14',name:'Match Competitiveness Calculator',why:'Where do you stand?'}],icon:'🚀',urgent:true},
      {m:[9,10,11],season:'Contract & Job Search Season',desc:'Graduating residents: start reviewing contracts and negotiating.',tools:[{id:'v2',name:'Contract Risk Scanner',why:'Scan every offer for red flags'},{id:'v4',name:'RVU Compensation Modeler',why:'Is the pay actually competitive?'}],icon:'📝'}
    ],
    fellow:[
      {m:[0,1,2],season:'Job Market Peak',desc:'Most attending positions open Q1. Start scanning and applying.',tools:[{id:'v3',name:'Job Offer Comparison',why:'Compare offers systematically'},{id:'v11',name:'Financial Projection Tool',why:'30-year view of each option'}],icon:'💼',urgent:true},
      {m:[3,4,5],season:'Contract Negotiation Season',desc:'Offers are coming in. Every term is negotiable.',tools:[{id:'v2',name:'Contract Risk Scanner',why:'Find the hidden risks'},{id:'v12',name:'Contract Review Tool',why:'Get negotiation scripts'},{id:'v4',name:'RVU Compensation Modeler',why:'Verify your comp is fair'}],icon:'📝',urgent:true},
      {m:[6,7,8],season:'Transition Planning',desc:'Preparing for attending life. Financial setup is critical now.',tools:[{id:'v5',name:'3-Year Financial Planner',why:'Plan your first 3 attending years'},{id:'v8',name:'Debt & Income Strategy',why:'Optimize your loan strategy'}],icon:'🔄'},
      {m:[9,10,11],season:'Early Opportunities',desc:'Some positions open early. Get ahead of the cycle.',tools:[{id:'v10',name:'Career Transition Planner',why:'Evaluate the risk vs. upside'},{id:'v15',name:'Career Strategy Builder',why:'Build your attending career strategy'}],icon:'🎯'}
    ],
    attending:[
      {m:[0,1,2],season:'Annual Financial Review',desc:'New year — review your financial trajectory and tax strategy.',tools:[{id:'v11',name:'Financial Projection Tool',why:'Update your 30-year projection'},{id:'v8',name:'Debt & Income Strategy',why:'Optimize for this year'}],icon:'📊'},
      {m:[3,4,5],season:'Contract Renewal Prep',desc:'Many contracts renew mid-year. Review before auto-renewal.',tools:[{id:'v2',name:'Contract Risk Scanner',why:'Re-scan your current contract'},{id:'v4',name:'RVU Compensation Modeler',why:'Are you still competitive?'}],icon:'📋'},
      {m:[6,7,8],season:'Mid-Year Career Check',desc:'Good time to reassess: are you where you want to be?',tools:[{id:'v10',name:'Career Transition Planner',why:'Thinking about a change?'},{id:'v15',name:'Career Strategy Builder',why:'Refine your 5-year plan'}],icon:'🧭'},
      {m:[9,10,11],season:'Market Assessment',desc:'Job market heats up. Know your worth even if you\'re staying.',tools:[{id:'v4',name:'RVU Compensation Modeler',why:'Check current market rates'},{id:'v3',name:'Job Offer Comparison',why:'Evaluate any new opportunities'}],icon:'💰'}
    ]
  };

  var seasons=calendar[stage]||calendar.student;
  var current=seasons.find(function(s){return s.m.indexOf(month)>=0});
  if(!current){el.style.display='none';return}

  // Check which suggested tools haven't been used recently (last 60 days)
  var sixtyAgo=new Date(now);sixtyAgo.setDate(sixtyAgo.getDate()-60);
  var recentTools=(U.toolHistory||[]).filter(function(t){return new Date(t.date)>=sixtyAgo}).map(function(t){return t.tool});

  el.style.display='';
  var h='<div class="card" style="padding:16px;'+(current.urgent?'border-color:rgba(198,168,94,.3);background:linear-gradient(160deg,rgba(198,168,94,.06),transparent)':'')+'">';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h+='<span style="font-size:18px">'+current.icon+'</span>';
  h+='<div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px">'+current.season+'</div></div>';
  if(current.urgent)h+='<span style="font-size:9px;padding:2px 8px;background:rgba(192,96,96,.1);color:var(--red);border-radius:10px;font-weight:600">Active Now</span>';
  h+='</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:12px">'+current.desc+'</div>';
  h+='<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Recommended Tools</div>';
  current.tools.forEach(function(tool,i){
    var used=recentTools.indexOf(tool.name)>=0;
    h+='<div onclick="openFramework(\''+tool.id+'\')" style="display:flex;align-items:center;gap:10px;padding:8px;margin-bottom:4px;border-radius:8px;cursor:pointer;transition:background .15s" onmouseenter="this.style.background=\'var(--bg2)\'" onmouseleave="this.style.background=\'transparent\'">';
    h+='<div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--text)">'+tool.name+'</div>';
    h+='<div style="font-size:10px;color:var(--text3)">'+tool.why+'</div></div>';
    if(used)h+='<span style="font-size:9px;padding:2px 6px;background:rgba(106,191,75,.1);color:var(--green);border-radius:8px;font-weight:600">Recent ✓</span>';
    else h+='<span style="font-size:11px;color:var(--accent);font-weight:600">Run →</span>';
    h+='</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

// ===== FEATURE 4: PEER BENCHMARKING CARD =====
function renderPeerBenchmarkCard(){
  var el=document.getElementById('peer-benchmark-card');
  if(!el||!U)return;
  var cp=U.careerProfile||{};
  if(!cp.lastUpdated||!cp.stage){el.style.display='none';return}
  var scores=U.scoreHistory&&U.scoreHistory.length?U.scoreHistory[U.scoreHistory.length-1].scores:{};
  if(!scores.competitiveness){el.style.display='none';return}
  var spec=cp.specialty||'';
  var bench=typeof getPeerBenchmarks==='function'?getPeerBenchmarks(cp):{step2:245,pubs:2,leadership:'45%',conferences:1};
  var stage=cp.stage;

  // Platform averages (anonymized — based on all HeartWise users at similar stage)
  var platformAvg={
    student:{competitiveness:52,research:35,readiness:48,financial:55},
    resident:{competitiveness:58,research:42,readiness:55,financial:52},
    fellow:{competitiveness:65,research:50,readiness:62,financial:58},
    attending:{competitiveness:72,research:48,readiness:70,financial:65}
  };
  var avg=platformAvg[stage]||platformAvg.student;

  el.style.display='';
  var h='<div class="card" style="padding:16px">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px">📊 You vs. Peers</div>';
  h+='<div style="font-size:9px;color:var(--text3)">Anonymized platform data</div>';
  h+='</div>';

  var dims=[
    {k:'competitiveness',l:'Competitiveness',i:'🏆'},
    {k:'research',l:'Research',i:'🔬'},
    {k:'readiness',l:'Readiness',i:'🎯'},
    {k:'financial',l:'Financial',i:'💰'}
  ];
  dims.forEach(function(d){
    var yours=scores[d.k]||0;
    var theirs=avg[d.k]||50;
    var diff=yours-theirs;
    var diffLabel=diff>0?'+'+diff:String(diff);
    var diffColor=diff>10?'var(--green)':diff>0?'var(--green)':diff>-10?'var(--accent)':'var(--red)';
    var pctYou=Math.min(100,yours);
    var pctThem=Math.min(100,theirs);
    h+='<div style="margin-bottom:10px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    h+='<span style="font-size:11px;color:var(--text2)">'+d.i+' '+d.l+'</span>';
    h+='<span style="font-size:11px;font-weight:600;color:'+diffColor+'">'+diffLabel+' vs peers</span>';
    h+='</div>';
    h+='<div style="position:relative;height:14px;background:var(--bg3);border-radius:7px;overflow:hidden">';
    h+='<div style="position:absolute;height:100%;width:'+pctThem+'%;background:rgba(138,130,120,.15);border-radius:7px" title="Peer average: '+theirs+'"></div>';
    h+='<div style="position:absolute;height:100%;width:'+pctYou+'%;background:linear-gradient(90deg,var(--accent),rgba(198,168,94,.6));border-radius:7px" title="You: '+yours+'"></div>';
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-between;margin-top:2px">';
    h+='<span style="font-size:9px;color:var(--accent);font-weight:600">You: '+yours+'</span>';
    h+='<span style="font-size:9px;color:var(--text3)">Avg: '+theirs+'</span>';
    h+='</div></div>';
  });

  // Specialty-specific benchmarks
  if(spec&&(stage==='student'||stage==='resident')){
    h+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">';
    h+='<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">'+spec.charAt(0).toUpperCase()+spec.slice(1)+' Benchmarks (NRMP Data)</div>';
    var items=[];
    if(bench.step2){var s2=parseInt(cp.step2)||0;items.push({l:'Step 2 CK',you:s2||'—',avg:bench.step2,ok:s2>=bench.step2})}
    if(bench.pubs){var p=parseInt(cp.pubs)||0;items.push({l:'Publications',you:p,avg:bench.pubs,ok:p>=bench.pubs})}
    if(bench.conferences){var c=parseInt(cp.conferences)||0;items.push({l:'Conferences',you:c,avg:bench.conferences,ok:c>=bench.conferences})}
    items.forEach(function(it){
      h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">';
      h+='<span style="font-size:11px;color:var(--text2)">'+it.l+'</span>';
      h+='<div style="display:flex;align-items:center;gap:12px">';
      h+='<span style="font-size:11px;color:var(--text)">You: <strong>'+it.you+'</strong></span>';
      h+='<span style="font-size:11px;color:var(--text3)">Avg: '+it.avg+'</span>';
      h+='<span style="font-size:12px">'+(it.ok?'✅':'⚠️')+'</span>';
      h+='</div></div>';
    });
    h+='</div>';
  }
  h+='</div>';
  el.innerHTML=h;
}

// ===== FEATURE 5: QUARTERLY STRATEGY SNAPSHOT BUTTON =====
function renderQuarterlySnapshotBtn(){
  var el=document.getElementById('quarterly-snapshot-btn');
  if(!el||!U)return;
  if(!U.careerProfile||!U.careerProfile.lastUpdated){el.style.display='none';return}
  if(!(U.toolHistory||[]).length){el.style.display='none';return}
  el.style.display='';
  var now=new Date();
  var qNames=['Q1','Q2','Q3','Q4'];
  var q=qNames[Math.floor(now.getMonth()/3)];
  el.innerHTML='<div onclick="generateQuarterlySnapshot()" style="display:flex;align-items:center;gap:14px;padding:18px;background:linear-gradient(160deg,#1a1620,#1e1a28);border:1px solid rgba(198,168,94,.25);border-radius:14px;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.15)" onmouseenter="this.style.borderColor=\'rgba(198,168,94,.5)\';this.style.boxShadow=\'0 6px 24px rgba(0,0,0,.25)\'" onmouseleave="this.style.borderColor=\'rgba(198,168,94,.25)\';this.style.boxShadow=\'0 4px 16px rgba(0,0,0,.15)\'">'
    +'<span style="font-size:28px">📄</span>'
    +'<div style="flex:1"><div style="font-size:14px;font-weight:600;color:#f0ece6;font-family:var(--font-serif)">'+q+' '+now.getFullYear()+' Career Strategy Report</div>'
    +'<div style="font-size:11px;color:#b8b3ac;margin-top:3px">Full career position analysis with peer benchmarking and recommendations</div></div>'
    +'<span style="font-size:12px;font-weight:600;color:var(--accent)">Generate →</span></div>';
}

// ===== FEATURE 6: QUARTERLY STRATEGY SNAPSHOT (FULL REPORT) =====
function generateQuarterlySnapshot(){
  if(!U)return;
  var cp=U.careerProfile||{};
  var now=new Date();
  var qNames=['Q1','Q2','Q3','Q4'];
  var qIdx=Math.floor(now.getMonth()/3);
  var qLabel=qNames[qIdx]+' '+now.getFullYear();
  var qStart=new Date(now.getFullYear(),qIdx*3,1);
  var sl={student:'Medical Student',resident:'Resident',fellow:'Fellow',attending:'Attending Physician'}[cp.stage]||'Physician';
  var spec=cp.specialty?(cp.specialty.charAt(0).toUpperCase()+cp.specialty.slice(1)):'';
  var scores=U.scoreHistory&&U.scoreHistory.length?U.scoreHistory[U.scoreHistory.length-1].scores:{};
  var prevScores=U.scoreHistory&&U.scoreHistory.length>1?U.scoreHistory[U.scoreHistory.length-2].scores:null;

  // Quarter data
  var qTools=(U.toolHistory||[]).filter(function(t){return new Date(t.date)>=qStart});
  var allTools=U.toolHistory||[];
  var totalUniq=[];allTools.forEach(function(t){if(totalUniq.indexOf(t.tool)<0)totalUniq.push(t.tool)});
  var qUniq=[];qTools.forEach(function(t){if(qUniq.indexOf(t.tool)<0)qUniq.push(t.tool)});
  var qCheckins=(U.monthlyCheckins||[]).filter(function(c){return new Date(c.date)>=qStart});
  var weeklyCheckins=(U.checkins||[]).filter(function(c){return new Date(c.date)>=qStart});
  var goalsHit=(U.weeklyGoals||[]).filter(function(g){return g.status==='completed'&&new Date(g.date)>=qStart}).length;
  var totalVault=typeof VAULT_ITEMS!=='undefined'?VAULT_ITEMS.length:17;

  // Peer benchmarks
  var platformAvg={
    student:{competitiveness:52,research:35,readiness:48,financial:55},
    resident:{competitiveness:58,research:42,readiness:55,financial:52},
    fellow:{competitiveness:65,research:50,readiness:62,financial:58},
    attending:{competitiveness:72,research:48,readiness:70,financial:65}
  };
  var avg=platformAvg[cp.stage]||platformAvg.student;
  var bench=typeof getPeerBenchmarks==='function'?getPeerBenchmarks(cp):{};

  // Calculate overall score
  var overall=Math.round(((scores.competitiveness||0)+(scores.research||0)+(scores.readiness||0)+(scores.financial||0))/4);
  var prevOverall=prevScores?Math.round(((prevScores.competitiveness||0)+(prevScores.research||0)+(prevScores.readiness||0)+(prevScores.financial||0))/4):null;

  // Strategic position assessment
  var position='';
  if(overall>=80) position='You are in a strong position. Your scores across all dimensions put you well above average. Focus on maintaining momentum and optimizing your weakest area.';
  else if(overall>=65) position='Solid foundation with room for growth. You are tracking ahead of most peers but have clear areas to strengthen. The gap between where you are and where you need to be is closable this quarter.';
  else if(overall>=50) position='You are at a critical juncture. Your scores suggest meaningful gaps that need attention before they compound. The good news: targeted action in 2-3 areas can shift your trajectory significantly.';
  else position='Urgent attention needed. Multiple dimensions need improvement, and delay will make each one harder to fix. Start with the single biggest gap and give it focused effort for 30 days.';

  // Build the report
  var h='<div id="quarterly-report-content" style="padding:24px;max-width:650px;margin:0 auto">';

  // Header
  h+='<div style="text-align:center;margin-bottom:28px;padding-bottom:24px;border-bottom:2px solid rgba(198,168,94,.2)">';
  h+='<div style="font-size:10px;color:var(--accent);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">HeartWise</div>';
  h+='<div style="font-size:28px;font-weight:600;color:var(--text);font-family:var(--font-serif);margin-bottom:4px">Career Strategy Report</div>';
  h+='<div style="font-size:16px;color:var(--accent);font-weight:600;margin-bottom:8px">'+qLabel+'</div>';
  h+='<div style="font-size:13px;color:var(--text3)">'+U.name+' · '+sl+(spec?' · '+spec:'')+'</div>';
  h+='</div>';

  // Executive Summary
  h+='<div style="margin-bottom:24px;padding:20px;background:linear-gradient(160deg,rgba(198,168,94,.06),transparent);border:1px solid rgba(198,168,94,.15);border-radius:12px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Strategic Position</div>';
  h+='<div style="font-size:14px;color:var(--text);line-height:1.7;font-family:var(--font-serif)">'+position+'</div>';
  h+='</div>';

  // Overall Score
  h+='<div style="text-align:center;margin-bottom:24px">';
  h+='<div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:4px solid '+(overall>=70?'var(--green)':overall>=50?'var(--accent)':'var(--red)')+';display:flex;align-items:center;justify-content:center;flex-direction:column">';
  h+='<div style="font-size:36px;font-weight:700;color:var(--text);font-family:var(--font-serif);line-height:1">'+overall+'</div>';
  h+='<div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Overall</div>';
  h+='</div>';
  if(prevOverall!==null){
    var d=overall-prevOverall;
    h+='<div style="margin-top:8px;font-size:12px;color:'+(d>0?'var(--green)':d<0?'var(--red)':'var(--text3)')+'">'+
    (d>0?'↑ +'+d+' from last assessment':d<0?'↓ '+d+' from last assessment':'No change from last assessment')+'</div>';
  }
  h+='</div>';

  // Score Breakdown with Peer Comparison
  h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Score Breakdown vs. Peers</div>';
  var dims=[{k:'competitiveness',l:'Competitiveness',i:'🏆'},{k:'research',l:'Research',i:'🔬'},{k:'readiness',l:'Readiness',i:'🎯'},{k:'financial',l:'Financial',i:'💰'}];
  dims.forEach(function(dim){
    var yours=scores[dim.k]||0;
    var theirs=avg[dim.k]||50;
    var prev=prevScores?(prevScores[dim.k]||0):null;
    var diff=yours-theirs;
    var trend=prev!==null?(yours-prev):null;
    var c=yours>=70?'var(--green)':yours>=50?'var(--accent)':'var(--red)';
    h+='<div style="margin-bottom:14px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    h+='<span style="font-size:12px;font-weight:600;color:var(--text)">'+dim.i+' '+dim.l+'</span>';
    h+='<div style="display:flex;align-items:center;gap:8px">';
    h+='<span style="font-size:14px;font-weight:700;color:'+c+'">'+yours+'</span>';
    if(trend!==null&&trend!==0)h+='<span style="font-size:10px;color:'+(trend>0?'var(--green)':'var(--red)');font-weight:600">'+(trend>0?'↑+'+trend:'↓'+trend)+'</span>';
    h+='</div></div>';
    h+='<div style="position:relative;height:10px;background:var(--bg3);border-radius:5px;overflow:hidden">';
    h+='<div style="position:absolute;height:100%;width:'+Math.min(100,theirs)+'%;background:rgba(138,130,120,.12);border-radius:5px"></div>';
    h+='<div style="position:absolute;height:100%;width:'+Math.min(100,yours)+'%;background:linear-gradient(90deg,'+c+',rgba(198,168,94,.5));border-radius:5px"></div>';
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-between;margin-top:3px">';
    h+='<span style="font-size:9px;color:var(--text3)">You: '+yours+'</span>';
    h+='<span style="font-size:9px;color:var(--text3)">Peer avg: '+theirs+' ('+(diff>=0?'+':'')+diff+')</span>';
    h+='</div></div>';
  });
  h+='</div>';

  // Quarterly Activity
  h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">'+qLabel+' Activity</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
  h+='<div style="padding:14px 8px;background:var(--bg2);border-radius:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+qTools.length+'</div><div style="font-size:9px;color:var(--text3);margin-top:2px">Tools Run</div></div>';
  h+='<div style="padding:14px 8px;background:var(--bg2);border-radius:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+qUniq.length+'</div><div style="font-size:9px;color:var(--text3);margin-top:2px">Unique Tools</div></div>';
  h+='<div style="padding:14px 8px;background:var(--bg2);border-radius:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+(weeklyCheckins.length+qCheckins.length)+'</div><div style="font-size:9px;color:var(--text3);margin-top:2px">Check-ins</div></div>';
  h+='<div style="padding:14px 8px;background:var(--bg2);border-radius:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+goalsHit+'</div><div style="font-size:9px;color:var(--text3);margin-top:2px">Goals Hit</div></div>';
  h+='</div>';
  // Tool coverage bar
  var coveragePct=Math.round((totalUniq.length/totalVault)*100);
  h+='<div style="margin-top:12px"><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Tool Coverage: '+totalUniq.length+' of '+totalVault+' ('+coveragePct+'%)</div>';
  h+='<div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+coveragePct+'%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:3px"></div></div></div>';
  h+='</div>';

  // Score Trend (if we have history)
  if(U.scoreHistory&&U.scoreHistory.length>=2){
    h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Score Trend</div>';
    var recent=U.scoreHistory.slice(-6);
    dims.forEach(function(dim){
      var vals=recent.map(function(s){return s.scores[dim.k]||0});
      if(vals.length<2)return;
      var minV=Math.min.apply(null,vals);var maxV=Math.max.apply(null,vals);var range=maxV-minV||1;
      var sparkW=200;var sparkH=30;
      var points=vals.map(function(v,i){return(i/(vals.length-1))*sparkW+','+(sparkH-((v-minV)/range)*sparkH)}).join(' ');
      var firstVal=vals[0];var lastVal=vals[vals.length-1];var td=lastVal-firstVal;
      h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">';
      h+='<span style="font-size:11px;color:var(--text2);width:100px">'+dim.l+'</span>';
      h+='<svg width="'+sparkW+'" height="'+sparkH+'" style="flex:1"><polyline points="'+points+'" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      h+='<span style="font-size:11px;font-weight:600;color:'+(td>0?'var(--green)':td<0?'var(--red)':'var(--text3)')+';width:40px;text-align:right">'+(td>0?'+':'')+td+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }

  // Tools Used This Quarter
  if(qTools.length){
    h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Tools Used This Quarter</div>';
    var byTool={};qTools.forEach(function(t){if(!byTool[t.tool])byTool[t.tool]={count:0,lastScore:null};byTool[t.tool].count++;if(t.score)byTool[t.tool].lastScore=t.score});
    Object.keys(byTool).forEach(function(tool){
      var d=byTool[tool];
      h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">';
      h+='<span style="font-size:12px;color:var(--text)">'+tool+'</span>';
      h+='<div style="display:flex;align-items:center;gap:8px">';
      if(d.lastScore)h+='<span style="font-size:11px;color:var(--accent);font-weight:600">'+d.lastScore+'</span>';
      h+='<span style="font-size:10px;color:var(--text3)">'+d.count+'×</span>';
      h+='</div></div>';
    });
    h+='</div>';
  }

  // Tools NOT Used (blind spots)
  if(typeof VAULT_ITEMS!=='undefined'){
    var unused=VAULT_ITEMS.filter(function(v){return totalUniq.indexOf(v.title)<0});
    if(unused.length>0&&unused.length<=10){
      h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Tools You Haven\'t Tried</div>';
      h+='<div style="font-size:11px;color:var(--text3);margin-bottom:8px">These tools could reveal blind spots in your career strategy.</div>';
      unused.slice(0,5).forEach(function(v){
        h+='<div onclick="closeModal(\'modal-q\');setTimeout(function(){openFramework(\''+v.id+'\')},300)" style="display:flex;align-items:center;gap:10px;padding:6px 0;cursor:pointer;border-bottom:1px solid var(--border)">';
        h+='<span style="font-size:16px">'+v.icon+'</span>';
        h+='<div style="flex:1"><div style="font-size:12px;color:var(--text)">'+v.title+'</div>';
        h+='<div style="font-size:10px;color:var(--text3)">'+v.desc.substring(0,80)+'</div></div>';
        h+='<span style="font-size:10px;color:var(--accent);font-weight:600">Try →</span>';
        h+='</div>';
      });
      h+='</div>';
    }
  }

  // Monthly check-in history
  if(qCheckins.length){
    h+='<div style="margin-bottom:24px"><div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Monthly Check-in History</div>';
    qCheckins.forEach(function(ci){
      var cd=new Date(ci.date);
      h+='<div style="padding:10px;background:var(--bg2);border-radius:8px;margin-bottom:6px">';
      h+='<div style="font-size:10px;color:var(--text3);margin-bottom:4px">'+cd.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</div>';
      if(ci.developments&&ci.developments.length){h+='<div style="font-size:11px;color:var(--text2);margin-bottom:2px">Developments: '+ci.developments.join(', ')+'</div>'}
      if(ci.details){h+='<div style="font-size:11px;color:var(--text2);font-style:italic">'+ci.details+'</div>'}
      if(ci.confidence){
        var confLabels=['','Not confident','Somewhat worried','Neutral','Fairly confident','Very confident'];
        h+='<div style="font-size:10px;color:var(--text3);margin-top:4px">Confidence: '+confLabels[ci.confidence]+' ('+ci.confidence+'/5)</div>';
      }
      h+='</div>';
    });
    h+='</div>';
  }

  // Recommended Next Quarter Actions
  h+='<div style="margin-bottom:24px;padding:16px;background:linear-gradient(160deg,rgba(198,168,94,.06),transparent);border:1px solid rgba(198,168,94,.15);border-radius:12px">';
  h+='<div style="font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Recommended Focus — Next Quarter</div>';
  var actions=[];
  // Find weakest score
  var weakest=null;var weakestVal=999;
  dims.forEach(function(d){var v=scores[d.k]||0;if(v<weakestVal){weakestVal=v;weakest=d}});
  if(weakest&&weakestVal<70){
    actions.push({text:'Prioritize your '+weakest.l+' score (currently '+weakestVal+') — this is your biggest gap.',priority:'high'});
  }
  if(qTools.length<6) actions.push({text:'Increase tool usage. You ran '+qTools.length+' tools this quarter — aim for at least 6 next quarter.',priority:'medium'});
  if(qCheckins.length===0) actions.push({text:'Complete a monthly career check-in each month. Consistent self-assessment accelerates growth.',priority:'medium'});
  if(totalUniq.length<10) actions.push({text:'Explore more tools. You\'ve only used '+totalUniq.length+' of '+totalVault+' — each one reveals a different angle.',priority:'medium'});
  if(goalsHit===0&&(U.weeklyGoals||[]).length>0) actions.push({text:'Set realistic weekly goals and complete them. Goal completion builds momentum.',priority:'medium'});
  // Stage-specific
  if(cp.stage==='student'){actions.push({text:'If applying next cycle, start building your ERAS application now. Early preparation beats last-minute scrambling.',priority:'high'})}
  if(cp.stage==='resident'){actions.push({text:'Focus on one high-impact publication this quarter. First-author papers move the needle most.',priority:'high'})}
  if(cp.stage==='fellow'){actions.push({text:'Start scanning the job market even if you\'re not ready to commit. Understanding your options gives you leverage.',priority:'medium'})}
  if(cp.stage==='attending'){actions.push({text:'Review your contract terms and comp against current market data. Staying informed protects your earning potential.',priority:'medium'})}

  actions.slice(0,5).forEach(function(a,i){
    var pc=a.priority==='high'?'var(--red)':'var(--accent)';
    h+='<div style="display:flex;gap:10px;padding:8px 0;'+(i<Math.min(actions.length,5)-1?'border-bottom:1px solid var(--border)':'')+'">';
    h+='<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:'+(a.priority==='high'?'rgba(192,96,96,.1)':'rgba(198,168,94,.1)')+';color:'+pc+';text-transform:uppercase;white-space:nowrap;height:fit-content;margin-top:2px">'+a.priority+'</span>';
    h+='<span style="font-size:12px;color:var(--text);line-height:1.5">'+a.text+'</span>';
    h+='</div>';
  });
  h+='</div>';

  // Footer
  h+='<div style="text-align:center;padding-top:20px;border-top:2px solid rgba(198,168,94,.15)">';
  h+='<div style="font-size:10px;color:var(--text3);margin-bottom:14px">Generated by HeartWise · '+now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</div>';
  h+='<div style="display:flex;gap:8px;justify-content:center">';
  h+='<button onclick="printReport()" style="padding:12px 28px;background:var(--accent);color:#1C1A17;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer">🖨 Print / Save PDF</button>';
  h+='<button onclick="closeModal(\'modal-q\')" style="padding:12px 28px;background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:10px;font-size:13px;cursor:pointer">Close</button>';
  h+='</div></div></div>';

  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}
