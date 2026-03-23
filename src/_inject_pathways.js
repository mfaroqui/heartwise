const fs = require('fs');
let js = fs.readFileSync('/home/ubuntu/.openclaw/workspace/heartwise/src/js-app.js', 'utf8');

// Tool: v2 Contract Risk Assessment - insert before recordToolUse
js = js.replace(
  "  document.getElementById('crs-results').innerHTML=h;\n  applyBlurGate(document.getElementById('crs-results'));\n  // Save scenario for compare\n  var crsHighlights=",
  `  // Pathway
  var crsPosition=pct>=85?'This contract protects you. Sign with confidence after a final attorney review.':pct>=70?'Decent contract, but don\\u2019t sign until you address the yellow and red flags below.':pct>=50?'Do not sign this contract as-is. You have leverage \\u2014 use it.':'Walk away or bring an attorney. This contract is structured against you.';
  var crsActions=[];
  if(reds.length)crsActions.push({text:'Address '+reds[0].cat+' \\u2014 this is your biggest risk: '+reds[0].text+'.',when:'this week'});
  if(reds.length>1)crsActions.push({text:'Fix '+reds[1].cat+': '+reds[1].text+'.',when:'this week'});
  else if(yellows.length)crsActions.push({text:'Negotiate '+yellows[0].cat+': '+yellows[0].text+'.',when:'before signing'});
  crsActions.push({text:'Run your compensation through the RVU Calculator to verify the financial terms.',when:'this week'});
  h+=hwPathway(crsPosition,crsActions,{id:'v4',icon:'\\ud83d\\udcb0',title:'RVU Compensation Calculator',why:'Verify whether the compensation structure in this contract is actually competitive for your specialty and volume.'});
  document.getElementById('crs-results').innerHTML=h;
  applyBlurGate(document.getElementById('crs-results'));
  // Save scenario for compare
  var crsHighlights=`
);

// Tool: v3 Job Offer Comparison - insert before recordToolUse
js = js.replace(
  "  recordToolUse('Job Offer Comparison Tool',null,winner",
  `  // Pathway
  var ocmPosition=cA.totalWithRetire>cB.totalWithRetire?'<strong>Offer A wins</strong> by $'+Math.round(Math.abs(cA.totalWithRetire-cB.totalWithRetire)/1000)+'K in true 10-year value. But money alone doesn\\u2019t make the decision \\u2014 factor in non-compete, call, and location.':'<strong>Offer B wins</strong> by $'+Math.round(Math.abs(cA.totalWithRetire-cB.totalWithRetire)/1000)+'K in true 10-year value. But money alone doesn\\u2019t make the decision \\u2014 factor in non-compete, call, and location.';
  var ocmActions2=[{text:'Run both contracts through the Contract Risk Assessment to catch hidden clauses.',when:'this week'},{text:'Model both salary trajectories in the Financial Projection Tool for the 30-year picture.',when:'this week'},{text:'Negotiate the weaker offer\\u2019s terms up \\u2014 you have leverage with a competing offer.',when:'before signing'}];
  document.getElementById('ocm-result').innerHTML+=hwPathway(ocmPosition,ocmActions2,{id:'v11',icon:'\\ud83d\\udcc8',title:'Financial Projection Tool',why:'See how each offer compounds over 30 years \\u2014 a $50K/year difference becomes millions.'});
  recordToolUse('Job Offer Comparison Tool',null,winner`
);

// Tool: v4 RVU Calc - add after "Your Negotiation Move" section, before recordToolUse
js = js.replace(
  "    recordToolUse('RVU Compensation Calculator','$'+Math.round(total).toLocaleString()",
  `    // Pathway
    var rvuPosition2=diffFromMgma<-20000?'You\\u2019re significantly underpaid. Negotiate before signing.':diffFromMgma<0?'Slightly below market \\u2014 negotiable.':'Compensation is strong. Focus your negotiation on contract terms, not salary.';
    var rvuAct=[{text:'Pull MGMA data for your exact specialty and region to anchor your negotiation.',when:'this week'},{text:diffFromMgma<0?'Counter with specific per-wRVU rate increase \\u2014 employers expect this.':'Review non-compete, tail coverage, and call terms \\u2014 these matter more than salary now.',when:'this week'},{text:'Run the full contract through the Contract Review Tool.',when:'before signing'}];
    var rvuPwHtml=hwPathway(rvuPosition2,rvuAct,diffFromMgma<0?{id:'v3',icon:'\\u2696\\ufe0f',title:'Job Offer Comparison Tool',why:'Compare this offer against others to strengthen your negotiating position.'}:{id:'v12',icon:'\\ud83d\\udcdd',title:'Contract Review Tool',why:'Compensation looks good \\u2014 now make sure the contract terms don\\u2019t have hidden costs.'});
    document.getElementById('rvu-scenarios').insertAdjacentHTML('afterend',rvuPwHtml);
    recordToolUse('RVU Compensation Calculator','$'+Math.round(total).toLocaleString()`
);

// Tool: v13 Specialty Fit - already has "Your Next Move", add pathway connector at end
js = js.replace(
  "  recordToolUse('Specialty Fit Assessment',null,'Top: '+top[0].name",
  `  // Pathway
  var sfaResultEl=document.getElementById('sfa-results');
  if(sfaResultEl)sfaResultEl.innerHTML+=hwPathway('Based on your answers, <strong>'+top[0].name+'</strong> is your strongest fit right now. But a fit score means nothing until you\\u2019ve tested it in the real world.',[{text:'Shadow or rotate in '+top[0].name+' \\u2014 even 2-3 days gives you real signal.',when:'this month'},{text:'Talk to a current PGY-3 or fellow (not an attending) for the unfiltered truth.',when:'this month'},{text:'Check your competitiveness for '+top[0].name+' before you commit.',when:'this month'}],{id:'v14',icon:'\\ud83c\\udfaf',title:'Match Probability Calculator',why:'See if you\\u2019re actually competitive for '+top[0].name+' \\u2014 passion without competitiveness is a recipe for heartbreak.'});
  recordToolUse('Specialty Fit Assessment',null,'Top: '+top[0].name`
);

// Tool: v5 3-Year Planner - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('3-Year Financial Planner',null,'Y3 Wealth:",
  `  // Pathway
  var fypPosition2=y3.netWealth>=0?'You\\u2019ll be positive net worth by Year 3 \\u2014 ahead of most physicians. Now optimize.':'You\\u2019ll still be in the red at Year 3 \\u2014 normal with $'+Math.round(debt/1000)+'K debt, but hold expenses flat.';
  h+='</div>';h+=hwPathway(fypPosition2,[{text:'Set up 401k + backdoor Roth this week. Every paycheck without them costs you.',when:'this week'},{text:(pslf==='yes'?'Certify PSLF employment \\u2014 do not refinance.':'Refinance your loans to lock a lower rate.')+' This is free money.',when:'this week'},{text:'Automate savings at '+yr1Save+'%'+(yr1Save<20?' (push to 20%)':'')+' before lifestyle creep takes over.',when:'this month'}],{id:'v8',icon:'\\ud83d\\udcb5',title:'Debt & Income Strategy Tool',why:'Get a full financial health score \\u2014 disability, tax strategy, advisor quality, and spending optimization.'});
  document.getElementById('fyp-results').innerHTML=h;
  recordToolUse('3-Year Financial Planner',null,'Y3 Wealth:`
);

// Fix: remove the original document.getElementById('fyp-results').innerHTML=h; since we just moved it
js = js.replace(
  "  document.getElementById('fyp-results').innerHTML=h;\n  recordToolUse('3-Year Financial Planner',null,'Y3 Wealth:",
  "  recordToolUse('3-Year Financial Planner',null,'Y3 Wealth:"
);

// Tool: v8 Income Leverage - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('Debt & Income Strategy Tool',score+'/'+maxScore",
  `  // Pathway
  var ilpPosition2=scorePct>=80?'Your financial foundation is excellent. Maintain and optimize.':scorePct>=60?'Good start, but close the gaps below to build real wealth.':'Critical gaps that are costing you real money every month.';
  var ilpNext=debt>100000?{id:'v5',icon:'\\ud83d\\udcc8',title:'3-Year Financial Planner',why:'Model your first 3 years month by month \\u2014 see exactly when you\\u2019ll be debt-free and how much you\\u2019ll build.'}:{id:'v11',icon:'\\ud83d\\udd2e',title:'Financial Projection Tool',why:'Project your 30-year net worth under different career scenarios.'};
  document.getElementById('ilp-results').innerHTML+=hwPathway(ilpPosition2,[{text:flags.length?flags[0]+' \\u2014 fix this first.':'Keep doing what you\\u2019re doing.',when:'this week'},{text:flags.length>1?flags[1]:'Run the Financial Projection Tool to see the 30-year impact.',when:'this month'},{text:'Review your contract \\u2014 your compensation structure directly drives everything above.',when:'this month'}],ilpNext);
  recordToolUse('Debt & Income Strategy Tool',score+'/'+maxScore`
);

// Tool: v7 Research ROI - add pathway before recordToolUse
js = js.replace(
  "    recordToolUse('Research Impact Calculator',pct+'%',grade",
  `    // Pathway
    var roiPosition2=pct>=90?'Your research portfolio is exceptional. Shift focus to interviews and letters.':pct>=70?'Strong portfolio. One more strategic publication pushes you to excellent.':pct>=50?'Building momentum \\u2014 prioritize first-author work over everything else.':'Research is your biggest gap. Start a case report this week.';
    var roiActions2=[];
    if(first===0)roiActions2.push({text:'Start a case report \\u2014 fastest path to your first publication (2-4 months).',when:'this week'});
    else if(first<=2)roiActions2.push({text:'Start your next first-author manuscript. First-author papers are worth 5x middle-author.',when:'this month'});
    else roiActions2.push({text:'Target a higher-impact journal for your next submission.',when:'this month'});
    if(abstracts<2)roiActions2.push({text:'Submit 2 conference abstracts \\u2014 builds visibility with PDs at national meetings.',when:'next 3 months'});
    else roiActions2.push({text:'Present at the next specialty conference \\u2014 poster or podium.',when:'next 3 months'});
    roiActions2.push({text:'Update your CV and share it with your letter writers \\u2014 they need to know your publications.',when:'this month'});
    var roiResultEl=document.getElementById('roi-results');
    if(roiResultEl)roiResultEl.innerHTML+=hwPathway(roiPosition2,roiActions2,{id:'v14',icon:'\\ud83c\\udfaf',title:'Match Probability Calculator',why:'See how your research portfolio impacts your overall competitiveness \\u2014 research is one piece of a bigger picture.'});
    recordToolUse('Research Impact Calculator',pct+'%',grade`
);

// Tool: v12 Contract Review - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('Contract Review Tool',score+'/100',scoreLabel",
  `  // Pathway
  var ciPosition2=score>=80?'This is a well-structured contract. Negotiate the remaining gaps and sign with confidence.':score>=60?'Workable contract, but address the flagged items before signing.':score>=40?'This contract needs serious revision. Do not sign as-is.':'High-risk contract. Bring a healthcare attorney before proceeding.';
  var ciActions2=[{text:'Address the #1 flagged item first \\u2014 highest financial impact.',when:'this week'}];
  ciActions2.push({text:score<60?'Get a healthcare attorney to review ($2-3.5K \\u2014 it\\u2019s worth it).':'Verify compensation with the RVU Calculator.',when:'before signing'});
  ciActions2.push({text:'Compare against other offers if you have them \\u2014 leverage wins negotiations.',when:'this week'});
  var ciResEl=document.getElementById('ci-output');
  if(ciResEl)ciResEl.innerHTML+=hwPathway(ciPosition2,ciActions2,{id:'v3',icon:'\\u2696\\ufe0f',title:'Job Offer Comparison Tool',why:'If you have multiple offers, compare total compensation side-by-side \\u2014 base salary alone is misleading.'});
  recordToolUse('Contract Review Tool',score+'/100',scoreLabel`
);

// Tool: v16 Interview Practice - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('Interview Practice Tool',avgScore+'/100',overallLabel",
  `  // Pathway
  var misPosition2=avgScore>=75?'You\\u2019re interview-ready. Polish the weak spots and you\\u2019ll stand out.':avgScore>=50?'You have a foundation, but specific answers need work. Practice out loud \\u2014 writing is different from speaking.':'Your interview skills need significant preparation. This is fixable, but it takes deliberate practice.';
  var misActions2=[{text:avgScore<75?'Redo the weakest-scoring question above until you can answer it without thinking.':'Run another 5-question session with a different interview type.',when:'this week'},{text:'Practice your answers out loud (not just writing). Record yourself and listen back.',when:'this week'},{text:'Schedule a mock interview with a faculty mentor who will give honest feedback.',when:'this month'}];
  var misResEl=document.getElementById('mis-feedback');
  if(misResEl)misResEl.innerHTML+=hwPathway(misPosition2,misActions2,{id:'v14',icon:'\\ud83c\\udfaf',title:'Match Probability Calculator',why:'Interviews are one piece \\u2014 check your full competitiveness profile to make sure nothing else is a gap.'});
  recordToolUse('Interview Practice Tool',avgScore+'/100',overallLabel`
);

// Tool: v15 Career Roadmap - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('Career Roadmap Tool',null,tName",
  `  // Pathway
  var csbResEl=document.getElementById('csb-output');
  if(csbResEl)csbResEl.innerHTML+=hwPathway('Your roadmap is built. Now execute \\u2014 the difference between physicians who match their top choice and those who don\\u2019t is almost always execution, not talent.',[{text:'Start Phase 1 actions this week \\u2014 momentum compounds.',when:'this week'},{text:'Set calendar reminders for each phase deadline.',when:'this week'},{text:'Identify your 2 strongest letter writers and build those relationships now.',when:'this month'}],{id:'v16',icon:'\\ud83c\\udf99\\ufe0f',title:'Interview Practice Tool',why:'Your roadmap gets you the interview. This tool makes sure you don\\u2019t blow it when you\\u2019re in the room.'});
  recordToolUse('Career Roadmap Tool',null,tName`
);

// Tool: v11 Financial Projection - add pathway to the single-scenario case too
// The multi-scenario case already has "What To Do With This" — just need to add connect-forward to both
// For the single scenario case (else branch that just shows debtSection):
js = js.replace(
  "  }else{\n    insEl.innerHTML=debtSection;\n  }",
  `  }else{
    insEl.innerHTML=debtSection;
    insEl.innerHTML+=hwPathway('You have one scenario modeled. Add a second to see how different choices compare over 30 years.',[{text:'Add a second scenario (different salary, savings rate, or practice type).',when:'now'},{text:'Max your tax-advantaged accounts \\u2014 401k, backdoor Roth, HSA.',when:'this week'},{text:'Run the 3-Year Financial Planner for your detailed first-3-years strategy.',when:'this week'}],{id:'v5',icon:'\\ud83d\\udcc8',title:'3-Year Financial Planner',why:'The 30-year view shows where you\\u2019re going. The 3-Year Planner shows you exactly how to start.'});
  }`
);

// Tool: v10 Career Transition - add pathway before recordToolUse
js = js.replace(
  "  recordToolUse('Career Transition Planner',readiness+'/4'",
  `  // Pathway
  var pivotResEl=document.querySelector('[id$="-pivot-report"]')||document.getElementById('pivot-results');
  // The pivot tool sends to Dr. Faroqui - add pathway to the DOM
  var pivotPw=hwPathway(readiness>=3?'You\\u2019re ready to make this decision. The framework is complete \\u2014 now act.':readiness>=2?'Almost ready. Close the remaining gaps before committing.':'More groundwork needed. Don\\u2019t rush a career-defining decision without the full picture.',[{text:readiness>=3?'Make your decision this week \\u2014 you have enough information.':'Complete your missing readiness checklist items.',when:'this week'},{text:'Model both paths in the Financial Projection Tool \\u2014 see the 30-year difference.',when:'this week'},{text:readiness>=3?'Start networking in your target field immediately.':'Talk to 3 physicians who\\u2019ve made a similar transition.',when:'this month'}],{id:'v11',icon:'\\ud83d\\udd2e',title:'Financial Projection Tool',why:'Model your current path vs. the transition \\u2014 see the real financial impact over 30 years before committing.'});
  notify('Career analysis submitted. Pathway guidance added below.',0);
  recordToolUse('Career Transition Planner',readiness+'/4'`
);

fs.writeFileSync('/home/ubuntu/.openclaw/workspace/heartwise/src/js-app.js', js, 'utf8');
console.log('All pathway blocks injected');
