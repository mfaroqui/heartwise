// ===== MATCH DASHBOARD — Student-Focused Homepage =====
// Replaces the generic hero card for students/residents/IMGs with a
// persistent, actionable dashboard centered on matching.
// Depends on: U, U.toolHistory, U.careerProfile, mccResidencyData,
//   mccFellowshipData, openFramework(), showUpdateProfile()

function renderMatchDashboard(){
  var el=document.getElementById('home-hero-card');
  if(!el||!U)return false;
  var stage=U.role||U.stage||(U.careerProfile||{}).stage||'student';
  // Only render for pre-attending stages
  if(['attending','admin'].indexOf(stage)!==-1)return false;

  var cp=U.careerProfile||{};
  var hist=(U.toolHistory||[]);
  var matchHist=hist.filter(function(t){return t.tool==='Match Probability Calculator'});
  var hasProfile=cp.lastUpdated&&(cp.specialty||cp.step2);
  var name=U.name?'Dr. '+U.name.split(' ').pop():'';
  var hour=new Date().getHours();
  var greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';

  var h='<div style="background:#111318;border-radius:18px;padding:24px 22px;color:#EDEBE7;position:relative;overflow:hidden">';
  h+='<div style="position:absolute;top:-30%;right:-10%;width:200px;height:200px;background:radial-gradient(circle,rgba(198,168,94,.12),transparent 60%);border-radius:50%"></div>';
  h+='<div style="position:relative">';

  // ─── NO PROFILE YET ───
  if(!hasProfile){
    h+='<div style="font-family:var(--font-serif);font-size:20px;font-weight:600;line-height:1.3;margin-bottom:6px">';
    h+=name?greeting+', '+name+'.':greeting+'. Welcome to HeartWise.';
    h+='</div>';
    h+='<div style="font-size:13px;color:rgba(237,235,231,.65);line-height:1.6;margin-bottom:20px">Set up your career profile to get a personalized Match Dashboard with your score, benchmarks, and monthly action plan.</div>';
    h+='<div onclick="showUpdateProfile()" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:rgba(198,168,94,.08);border:1px solid rgba(198,168,94,.2);border-radius:12px;cursor:pointer;transition:all .15s" onmouseenter="this.style.background=\'rgba(198,168,94,.12)\'" onmouseleave="this.style.background=\'rgba(198,168,94,.08)\'">';
    h+='<div style="width:32px;height:32px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#1C1A17;flex-shrink:0">1</div>';
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#EDEBE7">Set Up Your Career Profile</div>';
    h+='<div style="font-size:11px;color:rgba(237,235,231,.5)">2 minutes — unlocks your Match Dashboard</div></div>';
    h+='<span style="font-size:12px;color:var(--accent);font-weight:600">Start →</span></div>';
    h+='</div></div>';
    el.innerHTML=h;
    return true;
  }

  // ─── HAS PROFILE — FULL DASHBOARD ───
  var lastMatch=matchHist.length>0?matchHist[matchHist.length-1]:null;
  var firstMatch=matchHist.length>0?matchHist[0]:null;
  var lastScore=lastMatch?_dashParseScore(lastMatch.score):null;
  var firstScore=firstMatch?_dashParseScore(firstMatch.score):null;
  var delta=(lastScore!==null&&firstScore!==null&&matchHist.length>1)?lastScore-firstScore:null;

  var specKey=cp.specialty||'';
  var sdName=specKey;
  // Try to get benchmark data
  var sd=null;
  if(typeof mccResidencyData!=='undefined'){
    // Search by value or key
    for(var k in mccResidencyData){if(mccResidencyData[k].name===specKey||k===specKey){sd=mccResidencyData[k];break}}
  }

  // ─── SECTION 1: Score Summary ───
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  h+='<div>';
  h+='<div style="font-family:var(--font-serif);font-size:17px;font-weight:600;color:#EDEBE7;line-height:1.3">'+(name?greeting+', '+name:greeting)+'</div>';
  h+='<div style="font-size:11px;color:rgba(237,235,231,.5);margin-top:2px">'+(cp.specialty||'Undecided')+' · '+(stage.charAt(0).toUpperCase()+stage.slice(1))+'</div>';
  h+='</div>';

  // Score ring
  if(lastScore!==null){
    var sc=lastScore;
    var ringColor=sc>=75?'#5E8B6F':sc>=55?'#C6A85E':'#B85C5C';
    var circ=2*Math.PI*30;
    var offset=circ-(sc/100)*circ;
    h+='<div style="position:relative;width:72px;height:72px;flex-shrink:0">';
    h+='<svg viewBox="0 0 72 72" style="transform:rotate(-90deg)"><circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="5"/><circle cx="36" cy="36" r="30" fill="none" stroke="'+ringColor+'" stroke-width="5" stroke-dasharray="'+Math.round(sc*circ/100)+' '+Math.round(circ)+'" stroke-linecap="round"/></svg>';
    h+='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center"><div style="font-size:22px;font-weight:700;color:'+ringColor+';font-family:var(--font-serif)">'+sc+'</div><div style="font-size:8px;color:rgba(237,235,231,.4)">MATCH</div></div>';
    h+='</div>';
  }else{
    h+='<div onclick="openFramework(\'v14\')" style="width:72px;height:72px;flex-shrink:0;border-radius:50%;border:2px dashed rgba(198,168,94,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s" onmouseenter="this.style.borderColor=\'rgba(198,168,94,.6)\'" onmouseleave="this.style.borderColor=\'rgba(198,168,94,.3)\'">';
    h+='<div style="text-align:center"><div style="font-size:9px;color:var(--accent);font-weight:600">RUN</div><div style="font-size:8px;color:rgba(237,235,231,.4)">MATCH</div></div></div>';
  }
  h+='</div>';

  // Delta line
  if(delta!==null&&delta!==0){
    var dColor=delta>0?'#5E8B6F':'#B85C5C';
    var dSign=delta>0?'+':'';
    h+='<div style="font-size:11px;color:'+dColor+';margin-bottom:14px">'+dSign+delta+' points since first run ('+(matchHist.length)+' runs)</div>';
  }else if(lastScore!==null){
    h+='<div style="font-size:11px;color:rgba(237,235,231,.4);margin-bottom:14px">Run again after making improvements to track your progress</div>';
  }

  // ─── SECTION 2: This Month's Actions ───
  var actions=_dashGetActions(cp,stage,hist,sd);
  if(actions.length>0){
    h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">This Month</div>';
    U.dashActions=U.dashActions||{};
    for(var i=0;i<Math.min(actions.length,3);i++){
      var a=actions[i];
      var done=U.dashActions[a.id]||false;
      h+='<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 14px;background:'+(done?'rgba(94,139,111,.06)':'rgba(255,255,255,.03)')+';border:1px solid '+(done?'rgba(94,139,111,.15)':'rgba(255,255,255,.06)')+';border-radius:10px;margin-bottom:6px;'+(done?'opacity:.6':'')+'">';
      // Checkbox
      h+='<div onclick="toggleDashAction(\''+a.id+'\');event.stopPropagation()" style="width:22px;height:22px;flex-shrink:0;border-radius:6px;border:1.5px solid '+(done?'#5E8B6F':'rgba(198,168,94,.4)')+';display:flex;align-items:center;justify-content:center;cursor:pointer;background:'+(done?'rgba(94,139,111,.15)':'none')+';margin-top:1px">';
      if(done)h+='<span style="color:#5E8B6F;font-size:12px;font-weight:700">✓</span>';
      h+='</div>';
      // Content
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:13px;font-weight:600;color:#EDEBE7;'+(done?'text-decoration:line-through':'')+'">'+a.title+'</div>';
      h+='<div style="font-size:11px;color:rgba(237,235,231,.45);line-height:1.5;margin-top:2px">'+a.why+'</div>';
      h+='</div>';
      if(a.tool&&!done){
        h+='<div onclick="openFramework(\''+a.tool+'\')" style="flex-shrink:0;font-size:10px;font-weight:600;color:var(--accent);cursor:pointer;padding:4px 0;white-space:nowrap">Run →</div>';
      }
      h+='</div>';
    }
  }

  // ─── SECTION 3: Peer Benchmarks ───
  if(sd&&cp.step2){
    h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin:16px 0 10px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">How You Compare</div>';
    var benchmarks=_dashBenchmarks(cp,sd);
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    for(var b=0;b<benchmarks.length;b++){
      var bm=benchmarks[b];
      var bmColor=bm.status==='ahead'?'#5E8B6F':bm.status==='close'?'#C6A85E':'#B85C5C';
      var bmIcon=bm.status==='ahead'?'✓':bm.status==='close'?'~':'⚠';
      h+='<div style="padding:10px 12px;background:rgba(255,255,255,.03);border-radius:8px;border:1px solid rgba(255,255,255,.04)">';
      h+='<div style="font-size:10px;color:rgba(237,235,231,.45);margin-bottom:4px">'+bm.label+'</div>';
      h+='<div style="display:flex;align-items:baseline;gap:6px">';
      h+='<span style="font-size:16px;font-weight:700;color:'+bmColor+'">'+bm.yours+'</span>';
      h+='<span style="font-size:10px;color:rgba(237,235,231,.35)">/ '+bm.benchmark+' avg</span>';
      h+='</div></div>';
    }
    h+='</div>';
  }

  // ─── SECTION 4: Progress Timeline (sparkline) ───
  if(matchHist.length>=2){
    var scores=matchHist.map(function(m){return _dashParseScore(m.score)}).filter(function(s){return s!==null});
    if(scores.length>=2){
      h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin:16px 0 10px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">Score Trend</div>';
      h+=_dashSparkline(scores,260,40);
    }
  }

  // ─── SECTION 5: Next Step ───
  var nextTool=_dashNextStep(cp,hist);
  if(nextTool){
    h+='<div onclick="openFramework(\''+nextTool.id+'\')" style="margin-top:14px;padding:14px 16px;background:rgba(198,168,94,.08);border:1px solid rgba(198,168,94,.15);border-radius:12px;cursor:pointer;transition:all .15s" onmouseenter="this.style.background=\'rgba(198,168,94,.12)\'" onmouseleave="this.style.background=\'rgba(198,168,94,.08)\'">';
    h+='<div style="display:flex;align-items:center;gap:10px">';
    h+='<span style="font-size:14px">→</span>';
    h+='<div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--accent)">Next: '+nextTool.label+'</div>';
    h+='<div style="font-size:11px;color:rgba(237,235,231,.5);margin-top:2px">'+nextTool.why+'</div></div></div></div>';
  }

  // ─── SECTION 6: Re-run prompt ───
  if(lastMatch){
    var daysSince=Math.floor((Date.now()-new Date(lastMatch.date).getTime())/86400000);
    if(daysSince>=14){
      h+='<div onclick="openFramework(\'v14\')" style="margin-top:10px;padding:12px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;cursor:pointer;text-align:center">';
      h+='<div style="font-size:11px;color:rgba(237,235,231,.5)">You last ran Match Calculator <strong style="color:#EDEBE7">'+daysSince+' days ago</strong> (score: '+lastScore+'). Has anything changed?</div>';
      h+='<div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:4px">Re-run to see your updated score →</div></div>';
    }
  }

  h+='</div></div>';
  el.innerHTML=h;
  return true;
}

// ===== CHECKBOX FOR MONTHLY ACTIONS =====
function toggleDashAction(id){
  if(!U)return;
  U.dashActions=U.dashActions||{};
  U.dashActions[id]=!U.dashActions[id];
  localStorage.setItem('hw_session',JSON.stringify(U));
  renderHome();
}

// ===== PARSE SCORE FROM MIXED FORMATS =====
function _dashParseScore(v){
  if(typeof v==='number')return v;
  if(!v)return null;
  var n=parseInt(String(v).replace(/[^0-9]/g,''));
  return isNaN(n)?null:n;
}

// ===== GENERATE MONTHLY ACTIONS =====
function _dashGetActions(cp,stage,hist,sd){
  var actions=[];
  var toolsUsed=hist.map(function(t){return t.tool});
  var hasMatch=toolsUsed.indexOf('Match Probability Calculator')!==-1;
  var hasSpecFit=toolsUsed.indexOf('Specialty Fit Assessment')!==-1;
  var hasResearch=toolsUsed.indexOf('Research Impact Calculator')!==-1;
  var hasRoadmap=toolsUsed.indexOf('Career Roadmap Tool')!==-1;

  // Profile gaps
  var step2=parseInt(cp.step2)||0;
  var pubs=parseInt(cp.pubs)||0;
  var firstAuthor=parseInt(cp.firstAuthor)||0;
  var lorStr=cp.lorStrength||'';
  var isImg=stage==='img'||cp.img;
  var usce=cp.usce||'';
  var spec=cp.specialty||'';

  // Benchmark thresholds (from specialty data or generic)
  var avgStep=sd?sd.avgStep:235;
  var avgPubs=sd?(sd.avgPubs||3):3;

  // No specialty chosen yet
  if(!spec){
    actions.push({id:'pick-specialty',title:'Choose a Target Specialty',why:'Everything else — your research strategy, your applications, your timeline — depends on this decision.',tool:'v13'});
  }

  // Haven't run Match Calculator
  if(!hasMatch){
    actions.push({id:'first-match',title:'Run the Match Calculator',why:'Get your baseline score and see exactly where you stand against other applicants.',tool:'v14'});
  }

  // LOR weakness
  if(!lorStr||lorStr==='none'||lorStr==='weak'){
    actions.push({id:'lors',title:'Lock Down Your LOR Writers',why:'Strong letters take months to develop. Start the relationship now, not 2 weeks before the deadline.'});
  }

  // Step 2 below average
  if(step2>0&&step2<avgStep){
    actions.push({id:'step2',title:'Improve Your Step 2 CK Score',why:'Your score ('+step2+') is below the matched average ('+(avgStep)+') for '+(spec||'your specialty')+'.'});
  }

  // Low publications
  if(pubs<avgPubs){
    actions.push({id:'research',title:'Start a Research Project',why:'You have '+pubs+' publication'+(pubs!==1?'s':'')+'. The benchmark for '+(spec||'competitive specialties')+' is '+avgPubs+'+ publications.',tool:'v7'});
  }

  // IMG without USCE
  if(isImg&&(!usce||usce==='none'||usce==='0')){
    actions.push({id:'usce',title:'Apply for US Clinical Experience',why:'Without USCE, programs will screen you out before reading your application.',tool:'v17'});
  }

  // Haven't built a roadmap
  if(hasMatch&&!hasRoadmap){
    actions.push({id:'roadmap',title:'Build Your Career Roadmap',why:'Turn your match score into a month-by-month action plan with real deadlines.',tool:'v15'});
  }

  // No Step 2 score entered
  if(!step2&&stage!=='attending'){
    actions.push({id:'schedule-step2',title:'Schedule Step 2 CK',why:'Programs screen on this score. The sooner you take it, the sooner you can strengthen weak areas.'});
  }

  return actions;
}

// ===== PEER BENCHMARKS =====
function _dashBenchmarks(cp,sd){
  var benchmarks=[];
  var step2=parseInt(cp.step2)||0;
  var pubs=parseInt(cp.pubs)||0;

  if(step2>0&&sd.avgStep){
    var diff=step2-sd.avgStep;
    benchmarks.push({label:'Step 2 CK',yours:String(step2),benchmark:String(sd.avgStep),status:diff>=5?'ahead':diff>=-5?'close':'behind'});
  }
  if(sd.avgPubs!==undefined){
    var pubDiff=pubs-(sd.avgPubs||3);
    benchmarks.push({label:'Publications',yours:String(pubs),benchmark:String(sd.avgPubs||3),status:pubDiff>=0?'ahead':pubDiff>=-1?'close':'behind'});
  }
  if(sd.compLevel){
    var compLabels={low:'Low',moderate:'Moderate',high:'High',very_high:'Very High'};
    benchmarks.push({label:'Competition',yours:compLabels[sd.compLevel]||sd.compLevel,benchmark:'—',status:sd.compLevel==='low'?'ahead':sd.compLevel==='moderate'?'close':'behind'});
  }
  if(sd.positions&&sd.applicants){
    var ratio=Math.round(sd.applicants/sd.positions*10)/10;
    benchmarks.push({label:'Applicants/Spot',yours:ratio+'x',benchmark:'—',status:ratio<2?'ahead':ratio<4?'close':'behind'});
  }
  return benchmarks;
}

// ===== SVG SPARKLINE =====
function _dashSparkline(scores,w,h){
  if(!scores||scores.length<2)return '';
  var min=Math.min.apply(null,scores);
  var max=Math.max.apply(null,scores);
  var range=max-min||1;
  var pad=4;
  var points=[];
  for(var i=0;i<scores.length;i++){
    var x=pad+(i/(scores.length-1))*(w-2*pad);
    var y=pad+((max-scores[i])/range)*(h-2*pad);
    points.push(Math.round(x)+','+Math.round(y));
  }
  var svg='<svg viewBox="0 0 '+w+' '+(h+20)+'" style="width:100%;max-width:'+w+'px;height:auto;display:block;margin:0 auto">';
  // Line
  svg+='<polyline points="'+points.join(' ')+'" fill="none" stroke="#C6A85E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  // Dots + labels
  for(var j=0;j<scores.length;j++){
    var pt=points[j].split(',');
    var px=parseFloat(pt[0]),py=parseFloat(pt[1]);
    svg+='<circle cx="'+px+'" cy="'+py+'" r="3" fill="#C6A85E"/>';
    // Label every point if <=7, else first+last
    if(scores.length<=7||j===0||j===scores.length-1){
      svg+='<text x="'+px+'" y="'+(h+14)+'" fill="rgba(237,235,231,.45)" font-size="9" text-anchor="middle">'+scores[j]+'</text>';
    }
  }
  svg+='</svg>';
  return svg;
}

// ===== NEXT STEP RECOMMENDATION =====
function _dashNextStep(cp,hist){
  var toolsUsed=hist.map(function(t){return t.tool});
  var hasMatch=toolsUsed.indexOf('Match Probability Calculator')!==-1;
  var hasResearch=toolsUsed.indexOf('Research Impact Calculator')!==-1;
  var hasSpecFit=toolsUsed.indexOf('Specialty Fit Assessment')!==-1;
  var hasRoadmap=toolsUsed.indexOf('Career Roadmap Tool')!==-1;
  var hasFinancial=toolsUsed.indexOf('Financial Planner')!==-1;
  var spec=cp.specialty||'';
  var pubs=parseInt(cp.pubs)||0;

  if(!spec&&!hasSpecFit)return{id:'v13',label:'Specialty Fit Assessment',why:'Find the specialty that fits your priorities and strengths.'};
  if(!hasMatch)return{id:'v14',label:'Match Calculator',why:'Get your competitiveness score and see where you stand.'};
  if(pubs<3&&!hasResearch)return{id:'v7',label:'Research Impact Calculator',why:'Your research is your biggest gap. Get a specific improvement plan.'};
  if(!hasRoadmap)return{id:'v15',label:'Career Roadmap',why:'Build a month-by-month action plan with real deadlines.'};
  if(!hasFinancial)return{id:'v11',label:'Financial Planner',why:'Plan your finances alongside your career — debt strategy, PSLF, savings.'};
  // Default: re-run match
  return{id:'v14',label:'Match Calculator',why:'Re-run to track your progress as you strengthen your profile.'};
}
