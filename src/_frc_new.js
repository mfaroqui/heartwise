// ===== FELLOWSHIP READINESS CALCULATOR =====
// Specialty benchmarks: weights per category [research, LORs, clinical, boards, leadership, networking, PS]
// Weights sum to 100 for weighted scoring
var FRC_SPECS={
  cardiology:      {name:'Cardiology',           comp:'very_high', w:[22,20,15,15,10,12,6], benchPubs:4, benchStep:250, note:'Cardiology is one of the most competitive fellowships. Research (especially first-author) and strong letters from cardiologists are critical differentiators.'},
  gi:              {name:'Gastroenterology',      comp:'very_high', w:[22,20,15,15,10,12,6], benchPubs:3, benchStep:245, note:'GI is extremely competitive. Programs value procedural aptitude and research productivity heavily.'},
  pulm_crit:       {name:'Pulmonary & Critical Care',comp:'high', w:[18,20,18,14,10,12,8], benchPubs:2, benchStep:240, note:'Pulm/Crit values clinical performance and ICU skills alongside research. Strong ICU evaluations carry significant weight.'},
  heme_onc:        {name:'Hematology/Oncology',   comp:'very_high', w:[24,18,14,14,10,12,8], benchPubs:4, benchStep:245, note:'Heme/Onc is research-heavy. Publications in oncology journals and basic science experience are highly valued.'},
  endo:            {name:'Endocrinology',          comp:'moderate',  w:[16,20,18,14,12,12,8], benchPubs:1, benchStep:230, note:'Endocrinology is moderately competitive. Clinical performance and strong letters matter more than publication count here.'},
  nephro:          {name:'Nephrology',             comp:'moderate',  w:[14,22,20,12,12,12,8], benchPubs:1, benchStep:225, note:'Nephrology values clinical skills and genuine interest in the field. Letters and clinical performance are the primary differentiators.'},
  rheum:           {name:'Rheumatology',           comp:'moderate',  w:[16,20,18,14,12,12,8], benchPubs:1, benchStep:230, note:'Rheumatology programs look for intellectual curiosity and strong clinical reasoning. Research helps but isn\'t the primary filter.'},
  id:              {name:'Infectious Disease',     comp:'low',       w:[14,22,20,12,12,12,8], benchPubs:1, benchStep:220, note:'ID is less competitive numerically, but top programs still expect strong clinical performance and genuine passion for the field.'},
  interventional:  {name:'Interventional Cardiology',comp:'very_high',w:[20,20,18,14,8,14,6], benchPubs:5, benchStep:250, note:'Interventional cardiology requires an existing cardiology fellowship. Case volume, procedural skill, and faculty connections are paramount.'},
  electrophys:     {name:'Electrophysiology',      comp:'high',      w:[20,20,18,14,8,14,6], benchPubs:3, benchStep:245, note:'EP fellowships are small programs. Device experience, research in EP, and strong connections to EP faculty drive match success.'},
  sports:          {name:'Sports Medicine',         comp:'moderate',  w:[14,20,20,12,14,12,8], benchPubs:1, benchStep:230, note:'Sports medicine values clinical experience in MSK, team coverage, and interest in athlete care over pure research.'},
  geri:            {name:'Geriatrics',              comp:'low',       w:[12,22,22,10,14,10,10], benchPubs:0, benchStep:220, note:'Geriatrics values genuine interest and clinical empathy above all. Research expectations are lower, but passion must be authentic.'},
  allergy:         {name:'Allergy/Immunology',      comp:'moderate',  w:[16,20,18,14,12,12,8], benchPubs:1, benchStep:230, note:'Allergy/Immunology values both clinical skill and basic science understanding. Immunology research is a significant plus.'},
  other:           {name:'Other Subspecialty',      comp:'moderate',  w:[16,20,18,14,12,12,8], benchPubs:2, benchStep:235, note:'Competitiveness varies. Use these general weights as a starting framework and adjust expectations based on your specific target.'}
};

function frcUpdate(){
  var fb={
    1:[
      'No research yet. This is your biggest gap — start a case report or abstract this month.',
      'You have 1 abstract — good start, but competitive programs expect publications. Aim for a manuscript.',
      'Solid start with 1-2 publications. For most programs, this puts you in the running.',
      '3+ publications is above the median applicant. You\'re competitive for most programs.',
      'Strong research portfolio. This is a genuine differentiator — make sure your LORs highlight it.',
      'Exceptional scholarly output. You\'re in the top tier of applicants by research alone.'
    ],
    2:[
      'No letter writers identified yet — this should be your top priority. Start building relationships now.',
      'Generic letters won\'t cut it for competitive programs. You need specialty-specific writers who know your clinical work.',
      'One strong letter is a start. Aim for 2-3 specialty-specific writers who can speak to your skills in detail.',
      'Two strong letters puts you in solid shape. Focus on making sure at least one is from a well-known name.',
      '3 specialty-specific letters is the sweet spot. Make sure writers know your target programs.',
      'Outstanding letter support. This is often the #1 factor in competitive matches — you\'re well-positioned.'
    ],
    3:[
      'Clinical performance concerns will flag your application. Seek honest feedback and address gaps urgently.',
      'Average clinical evals are a baseline, not a strength. Ask attendings for specific improvement feedback.',
      'Good clinical performance — solid but won\'t differentiate you. Look for ways to stand out on rotations.',
      'Very good clinical reviews are a real asset. Make sure your letter writers can speak to specific examples.',
      'Outstanding clinical performance makes you memorable. This is what programs remember at rank meetings.',
      'Top of your class clinically — this is your strongest asset. Programs will fight over you.'
    ],
    4:[
      'Board score concerns may limit your program list. Focus on strengthening every other category.',
      'Below average scores are a screening risk. Some programs have hard cutoffs — research which ones.',
      'Average scores won\'t help or hurt. They get you past the screen — your other factors do the rest.',
      'Above average boards give you a comfortable buffer. No program will screen you out.',
      'High scores open doors at any program. This is a clear strength on your application.',
      'Top decile scores are a significant competitive advantage, especially at academic programs.'
    ],
    5:[
      'No leadership roles yet. Even one meaningful role changes your narrative — volunteer for a committee or QI project.',
      'A minor role is better than nothing, but programs want to see initiative. Seek something with visible impact.',
      'One meaningful leadership role is solid. It shows initiative and separates you from passive applicants.',
      '2+ roles demonstrate a pattern of leadership. This reads well on applications and in interviews.',
      'Chief residency or equivalent is a major differentiator. Programs view this as a mark of trust from your program.',
      'Multiple leadership roles at a high level — this is exceptional and tells a clear story of leadership.'
    ],
    6:[
      'No networking yet. This is how programs put a face to your application — start attending conferences.',
      'One conference is a start. But relationships are built over time — plan your next interaction.',
      'One away rotation gives you insider knowledge and face time. Make it count — treat every day like an interview.',
      'Two away rotations significantly improve your chances at those programs. Follow up with thank-you emails.',
      '2+ aways with real faculty connections — you\'re doing this right. These relationships become your advocates.',
      'Strong network across programs. This is the hidden advantage that most applicants underestimate.'
    ],
    7:[
      'Haven\'t started your personal statement. Block 2 hours this week and write the worst first draft you can. Just start.',
      'First draft done — good. It\'s probably not great yet. Get 2-3 people to read it and give honest feedback.',
      'Reviewed once — you\'re on the right track. Most great statements go through 5+ revisions.',
      'Multiple drafts means you\'re taking this seriously. Have someone outside medicine read it for clarity.',
      'Polished statement — you\'re in great shape. Read it one more time for any clichés or generic phrases.',
      'Exceptional personal statement. This will make readers want to meet you. Don\'t touch it anymore.'
    ]
  };

  var catLabels=['Research','Letters','Clinical','Boards','Leadership','Networking','Personal Statement'];
  var catShort=['Research','LORs','Clinical','Boards','Leadership','Network','PS'];

  // Get specialty and weights
  var specEl=document.getElementById('frc-specialty');
  var spec=specEl?specEl.value:'';
  var sData=FRC_SPECS[spec]||null;
  var weights=sData?sData.w:[16,20,18,14,12,12,8]; // default weights

  // Show specialty note
  var noteEl=document.getElementById('frc-spec-note');
  if(noteEl){
    if(sData){noteEl.style.display='';noteEl.innerHTML='<strong>'+sData.name+'</strong> ('+sData.comp.replace('_',' ')+' competitiveness): '+sData.note}
    else{noteEl.style.display='none'}
  }

  // Show benchmarks per category
  if(sData){
    var benchTexts=[
      'Benchmark: '+sData.benchPubs+'+ publications expected for competitive '+sData.name+' applicants',
      'Weight: Letters account for '+weights[1]+'% of your weighted score — the #'+(weights[1]>=20?'1':'2')+' factor',
      'Weight: Clinical performance is '+weights[2]+'% of your score'+((weights[2]>=18)?' — heavily weighted for '+sData.name:''),
      'Benchmark: Step 2 ~'+sData.benchStep+'+ for competitive '+sData.name+' programs',
      'Weight: Leadership accounts for '+weights[4]+'% of your score',
      'Weight: Networking/aways account for '+weights[5]+'% — '+((weights[5]>=14)?'very important':'important')+' for '+sData.name,
      'Weight: Personal statement is '+weights[6]+'% — important but lowest weighted factor'
    ];
    for(var b=0;b<7;b++){var bEl=document.getElementById('frc-bench'+(b+1));if(bEl){bEl.style.display='';bEl.textContent=benchTexts[b]}}
  } else {
    for(var b2=0;b2<7;b2++){var bEl2=document.getElementById('frc-bench'+(b2+1));if(bEl2)bEl2.style.display='none'}
  }

  // Calculate weighted score
  var rawScores=[];
  var weightedTotal=0;
  var gaps=[];
  var strengths=[];
  for(var i=1;i<=7;i++){
    var el=document.getElementById('frc-r'+i);
    if(!el)return;
    var v=parseInt(el.value);
    rawScores.push(v);
    var pct=v/5;
    var catWeighted=pct*weights[i-1];
    weightedTotal+=catWeighted;

    // Color
    var c=v>=4?'var(--green)':v>=2?'var(--accent)':'var(--red)';
    document.getElementById('frc-s'+i).textContent=v+'/5';
    document.getElementById('frc-s'+i).style.color=c;
    document.getElementById('frc-f'+i).innerHTML=fb[i][v];
    document.getElementById('frc-f'+i).style.borderLeft='3px solid '+c;

    // Build bar
    var barEl=document.getElementById('frc-bar-'+i);
    if(barEl){
      barEl.innerHTML='<div style="display:flex;align-items:center;gap:6px"><span style="font-size:9px;color:var(--text3);width:58px;flex-shrink:0">'+catShort[i-1]+'</span><div style="flex:1;height:5px;background:var(--bg);border-radius:3px"><div style="height:100%;width:'+(pct*100)+'%;background:'+c+';border-radius:3px;transition:width .3s"></div></div><span style="font-size:9px;color:'+c+';font-weight:600;width:22px;text-align:right">'+v+'</span></div>';
    }

    // Gaps & strengths
    if(v<=2) gaps.push({cat:catLabels[i-1],score:v,weight:weights[i-1],feedback:fb[i][v]});
    if(v>=4) strengths.push({cat:catLabels[i-1],score:v,weight:weights[i-1]});
  }

  var total=Math.round(weightedTotal);
  document.getElementById('frc-total').textContent=total;

  // Grade
  var gc,gl,gi;
  if(total>=80){
    gc='var(--green)';gl='Strong Candidate';
    gi='<strong style="color:var(--green)">You\'re in a strong position.</strong> Your application is competitive for most programs'+(sData?' in '+sData.name:'')+'. Focus on interview preparation, program fit, and strategic rank list building. Don\'t coast — but the foundation is solid.';
  }else if(total>=60){
    gc='var(--accent)';gl='Competitive With Gaps';
    gi='<strong style="color:var(--accent)">You have a competitive foundation but clear gaps to close.</strong> The difference between a '+total+' and an 80 is often just 2-3 months of focused effort in the right areas. Prioritize your highest-weighted gaps first.';
  }else if(total>=40){
    gc='var(--red)';gl='Needs Significant Work';
    gi='<strong style="color:var(--red)">Honest assessment: you have significant gaps.</strong>'+(sData&&(sData.comp==='very_high'||sData.comp==='high')?' '+sData.name+' is a '+sData.comp.replace('_',' ')+' competitiveness fellowship, which makes these gaps especially urgent.':'')+' Consider whether your current timeline is realistic, or if focused preparation would dramatically improve your chances.';
  }else{
    gc='var(--red)';gl='Reassess Timeline';
    gi='<strong style="color:var(--red)">You need to reassess your timeline.</strong> Applying with this profile puts you at high risk'+(sData?' for '+sData.name:'')+'. A strategic delay is not failure — it\'s the smartest move you can make. Talk honestly with a mentor about building a stronger application.';
  }
  document.getElementById('frc-total').style.color=gc;
  document.getElementById('frc-grade').textContent=gl;
  document.getElementById('frc-grade').style.color=gc;
  document.getElementById('frc-interp').innerHTML=gi;
  applyBlurGate(document.getElementById('frc-interp'));

  // Gap analysis
  var gapDiv=document.getElementById('frc-gaps');
  var gapList=document.getElementById('frc-gap-list');
  if(gapDiv&&gapList){
    gaps.sort(function(a,b){return b.weight-a.weight}); // highest-weight gaps first
    if(gaps.length>0){
      gapDiv.style.display='';
      var gh='';
      gaps.forEach(function(g){
        gh+='<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:var(--red-dim);border-radius:6px;border:1px solid rgba(196,77,86,.12)">';
        gh+='<span style="font-size:11px;color:var(--red);font-weight:600;flex-shrink:0;margin-top:1px">⚡</span>';
        gh+='<div><span style="font-size:11px;font-weight:600;color:var(--red)">'+g.cat+' ('+g.score+'/5 · weight: '+g.weight+'%)</span>';
        gh+='<div style="font-size:11px;color:var(--text3);margin-top:2px">'+g.feedback+'</div></div></div>';
      });
      gapList.innerHTML=gh;
    } else {gapDiv.style.display='none'}
  }

  // Strengths
  var strDiv=document.getElementById('frc-strengths');
  var strList=document.getElementById('frc-strength-list');
  if(strDiv&&strList){
    if(strengths.length>0){
      strDiv.style.display='';
      var sh='';
      strengths.forEach(function(s){
        sh+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--green-dim);border-radius:6px;border:1px solid rgba(139,184,160,.12)">';
        sh+='<span style="font-size:11px;color:var(--green);flex-shrink:0">✓</span>';
        sh+='<span style="font-size:11px;font-weight:500;color:var(--green)">'+s.cat+' ('+s.score+'/5 · weight: '+s.weight+'%)</span></div>';
      });
      strList.innerHTML=sh;
    } else {strDiv.style.display='none'}
  }

  // Action plan
  var actDiv=document.getElementById('frc-actions');
  var actList=document.getElementById('frc-action-list');
  if(actDiv&&actList&&gaps.length>0){
    actDiv.style.display='';
    var actions=[];
    gaps.slice(0,3).forEach(function(g,idx){
      var actionText='';
      if(g.cat==='Research') actionText='<strong>Priority '+(idx+1)+':</strong> Start a case report or abstract within 2 weeks. Target 1 submission per month. First-author papers carry 3x the weight of co-authored work.';
      else if(g.cat==='Letters') actionText='<strong>Priority '+(idx+1)+':</strong> Identify 2 specialty-specific attendings this week. Schedule dedicated time with them — clinic days, research meetings, or procedures. Writers need specific stories about you.';
      else if(g.cat==='Clinical') actionText='<strong>Priority '+(idx+1)+':</strong> Request honest feedback from your attending this week. Volunteer for complex patients. Ask to present at rounds. Small visible improvements compound quickly.';
      else if(g.cat==='Boards') actionText='<strong>Priority '+(idx+1)+':</strong> If retaking, dedicate structured daily study blocks. If scores are final, focus on making every other category as strong as possible to compensate.';
      else if(g.cat==='Leadership') actionText='<strong>Priority '+(idx+1)+':</strong> Volunteer for a QI project or committee role this month. Chief resident applications open months in advance — plan ahead if that\'s your target.';
      else if(g.cat==='Networking') actionText='<strong>Priority '+(idx+1)+':</strong> Register for the next national conference in your field. Apply for away rotations 6-9 months out. Cold-email 2 faculty at target programs — most will respond.';
      else if(g.cat==='Personal Statement') actionText='<strong>Priority '+(idx+1)+':</strong> Block 2 hours this week to write a first draft. Don\'t edit — just write. Get 3 people to review it within 2 weeks. Great statements take 5+ drafts.';
      actions.push('<div>'+actionText+'</div>');
    });
    actList.innerHTML=actions.join('');
  } else if(actDiv){
    if(total>=80){
      actDiv.style.display='';
      actList.innerHTML='<div><strong>You\'re in strong shape.</strong> Focus on interview preparation, program research, and building your rank list strategically. Consider reaching out to current fellows at your top programs for insider perspective.</div>';
    } else {actDiv.style.display='none'}
  }

  // Timeline warning
  var tlEl=document.getElementById('frc-timeline');
  var tlWarn=document.getElementById('frc-timeline-warn');
  var tlMsg=document.getElementById('frc-timeline-msg');
  var tl=tlEl?tlEl.value:'';
  if(tlWarn&&tlMsg&&tl){
    if(tl==='applying'&&total<60){
      tlWarn.style.display='';
      tlMsg.innerHTML='<strong>⚠️ Timeline concern:</strong> You\'re applying this cycle with a score of '+total+'/100. '+(gaps.length>=3?'With '+gaps.length+' significant gaps, ':'')+'consider whether a strategic delay would meaningfully improve your chances. One strong cycle beats two weak ones.';
    }else if(tl==='1yr'&&total<40){
      tlWarn.style.display='';
      tlMsg.innerHTML='<strong>⚠️ Timeline concern:</strong> With 1 year and a score of '+total+'/100, you have time to improve — but it requires urgency. Focus exclusively on your top 2 weighted gaps starting this week.';
    }else{tlWarn.style.display='none'}
  }else if(tlWarn){tlWarn.style.display='none'}

  // Record
  var frcInputs={};var frcHL=[];
  var frcLabels={1:'Research',2:'Letters',3:'Clinical',4:'Boards',5:'Leadership',6:'Networking',7:'Personal Statement'};
  for(var fi=1;fi<=7;fi++){var fv=parseInt(document.getElementById('frc-r'+fi).value)||0;frcInputs[frcLabels[fi]]=fv+'/5 (weight: '+weights[fi-1]+'%)';if(fv<=2)frcHL.push(frcLabels[fi]+': needs work ('+fv+'/5)')}
  if(spec&&sData)frcInputs['Target Fellowship']=sData.name;
  if(tl)frcInputs['Timeline']=tl;
  frcHL.unshift(gl+' — '+total+'/100'+(sData?' ('+sData.name+')':''));
  recordToolUse('Fellowship Readiness Calculator',total+'/100',gl,{inputs:frcInputs,highlights:frcHL});
}
