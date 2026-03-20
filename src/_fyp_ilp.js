// ===== 3-YEAR FINANCIAL LEVERAGE PLANNER (v5) =====
function fypCalculate(){
  var salary=parseFloat(document.getElementById('fyp-salary').value)||0;
  var debt=parseFloat(document.getElementById('fyp-debt').value)||0;
  var rate=(parseFloat(document.getElementById('fyp-rate').value)||6.5)/100;
  var expenses=parseFloat(document.getElementById('fyp-expenses').value)||0;
  var inflate=(parseFloat(document.getElementById('fyp-inflate').value)||10)/100;
  var matchPct=(parseFloat(document.getElementById('fyp-match').value)||0)/100;
  var pslf=document.getElementById('fyp-pslf').value;
  var dependents=document.getElementById('fyp-dependents').value;
  if(!salary){notify('Enter your expected salary',1);return}
  if(!expenses){expenses=Math.round(salary*0.3)}
  var effectiveTax=salary>400000?0.35:salary>300000?0.32:salary>200000?0.28:0.24;
  var netSalary=Math.round(salary*(1-effectiveTax));
  var max401k=23500,maxRoth=7000,maxHSA=4150;
  var matchAmt=Math.round(Math.min(salary*matchPct,max401k*0.5));
  var totalTaxAdv=max401k+maxRoth+maxHSA;
  var standardPayment=debt>0?Math.round(debt*(rate/12)*Math.pow(1+rate/12,120)/(Math.pow(1+rate/12,120)-1)):0;
  var refinanceRate=Math.max(0.04,rate-0.015);
  var refiPayment=debt>0?Math.round(debt*(refinanceRate/12)*Math.pow(1+refinanceRate/12,60)/(Math.pow(1+refinanceRate/12,60)-1)):0;
  var idrPayment=debt>0?Math.round(Math.max(0,(salary*0.9-22500)*0.10/12)):0;
  var years=[],cumInvested=0,remainDebt=debt;
  for(var yr=1;yr<=3;yr++){
    var yrSalary=Math.round(salary*Math.pow(1.03,yr-1));
    var yrNet=Math.round(yrSalary*(1-effectiveTax));
    var yrExp=Math.round(expenses*Math.pow(1+inflate,yr-1));
    var yrMatch=Math.round(yrSalary*matchPct);
    var monthlyLoan=0;
    if(remainDebt>0){monthlyLoan=pslf==='yes'?idrPayment:refiPayment}
    var yrLoan=monthlyLoan*12;
    var interest=Math.round(remainDebt*rate);
    var principal=Math.max(0,yrLoan-interest);
    remainDebt=Math.max(0,remainDebt-principal);
    var yrInvestable=Math.max(0,yrNet-yrExp-yrLoan);
    cumInvested+=totalTaxAdv+yrMatch+yrInvestable;
    var growth=Math.round(cumInvested*0.08*(yr*0.5));
    var netWealth=cumInvested+growth-remainDebt;
    var cashFlow=yrNet-yrExp-yrLoan;
    years.push({year:yr,salary:yrSalary,net:yrNet,exp:yrExp,loan:yrLoan,taxAdv:totalTaxAdv,match:yrMatch,investable:yrInvestable,cumInvested:cumInvested,growth:growth,remainDebt:remainDebt,netWealth:netWealth,cashFlow:cashFlow});
  }
  var y3=years[2],yr1Save=years[0].net>0?Math.round(((years[0].taxAdv+years[0].investable)/years[0].net)*100):0;
  var h='';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">';
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;text-align:center"><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:4px">Year 3 Net Wealth</div><div style="font-size:26px;font-weight:700;color:'+(y3.netWealth>=0?'var(--green)':'var(--red)')+';font-family:var(--font-serif)">$'+Math.round(y3.netWealth/1000)+'K</div></div>';
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;text-align:center"><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:4px">Total Invested</div><div style="font-size:26px;font-weight:700;color:var(--accent);font-family:var(--font-serif)">$'+Math.round(y3.cumInvested/1000)+'K</div></div>';
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;text-align:center"><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:4px">Remaining Debt</div><div style="font-size:26px;font-weight:700;color:'+(y3.remainDebt>0?'var(--red)':'var(--green)')+';font-family:var(--font-serif)">'+(y3.remainDebt>0?'$'+Math.round(y3.remainDebt/1000)+'K':'$0')+'</div></div>';
  h+='</div>';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Year-by-Year Breakdown</div>';
  years.forEach(function(y){
    var cfColor=y.cashFlow>=0?'var(--green)':'var(--red)';
    h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:14px;font-weight:700;color:var(--accent);font-family:var(--font-serif)">Year '+y.year+'</div><div style="font-size:11px;color:var(--text3)">Salary: $'+Math.round(y.salary/1000)+'K</div></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">';
    h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Take-Home</span><span style="font-weight:600">$'+Math.round(y.net/1000)+'K</span></div>';
    h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Expenses</span><span style="font-weight:600">-$'+Math.round(y.exp/1000)+'K</span></div>';
    if(y.loan>0) h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Loan Payments</span><span style="color:var(--red);font-weight:600">-$'+Math.round(y.loan/1000)+'K</span></div>';
    h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Tax-Advantaged</span><span style="color:var(--green);font-weight:600">$'+Math.round(y.taxAdv/1000)+'K</span></div>';
    if(y.match>0) h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Employer Match</span><span style="color:var(--green);font-weight:600">+$'+Math.round(y.match/1000)+'K</span></div>';
    h+='<div style="display:flex;justify-content:space-between;padding:5px 0"><span style="color:var(--text3)">Monthly Cash Flow</span><span style="color:'+cfColor+';font-weight:700">$'+Math.round(y.cashFlow/12).toLocaleString()+'/mo</span></div>';
    h+='</div>';
    var wPct=Math.min(100,Math.max(0,Math.round((y.cumInvested/(salary*3))*100)));
    h+='<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:3px"><span>Cumulative Invested</span><span>$'+Math.round(y.cumInvested/1000)+'K</span></div>';
    h+='<div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+wPct+'%;background:var(--accent);border-radius:3px"></div></div></div>';
    h+='</div>';
  });
  if(debt>0){
    h+='<div style="padding:16px;background:var(--bg2);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;margin-bottom:14px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Loan Strategy</div>';
    if(pslf==='yes'){
      h+='<div style="font-size:13px;font-weight:600;margin-bottom:4px">PSLF Path</div>';
      h+='<div style="font-size:12px;color:var(--text2);line-height:1.7">IDR: <strong>$'+idrPayment.toLocaleString()+'/mo</strong> vs standard: <strong>$'+standardPayment.toLocaleString()+'/mo</strong>. Forgiveness: <strong style="color:var(--green)">$'+Math.round(Math.max(0,debt-idrPayment*120)/1000)+'K</strong>. Do NOT refinance.</div>';
    }else{
      h+='<div style="font-size:13px;font-weight:600;margin-bottom:4px">Aggressive Payoff</div>';
      h+='<div style="font-size:12px;color:var(--text2);line-height:1.7">Refinanced: <strong>$'+refiPayment.toLocaleString()+'/mo</strong> × 5yr. Extra $1K/mo saves ~$'+Math.round(debt*rate/12000)+'K interest.</div>';
    }
    h+='</div>';
  }
  h+='<div style="padding:16px;background:var(--bg2);border-radius:10px;margin-bottom:14px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Key Insights</div>';
  var ins=[];
  ins.push('Year 1 savings rate: <strong>'+yr1Save+'%</strong>'+(yr1Save>=30?' — excellent':yr1Save>=20?' — solid, push toward 30%':' — hold expenses flat'));
  if(inflate>0.15) ins.push('<span style="color:var(--red)">'+Math.round(inflate*100)+'% lifestyle inflation is high.</span> Expenses: $'+Math.round(expenses*Math.pow(1+inflate,2)/1000)+'K by Year 3.');
  if(matchPct>0) ins.push('Employer match 3yr value: <strong style="color:var(--green)">$'+Math.round(matchAmt*3/1000)+'K</strong>.');
  if(y3.netWealth>0) ins.push('<strong style="color:var(--green)">Positive net worth by Year 3</strong> — ahead of most physicians.');
  else ins.push('Negative net worth at Year 3 — hold expenses flat years 4-5.');
  ins.forEach(function(i){h+='<div style="font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:6px;padding-left:10px;border-left:2px solid var(--border)">'+i+'</div>'});
  h+='</div>';
  h+='<div style="padding:16px;background:var(--bg2);border-radius:10px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Annual Tax-Advantaged Checklist</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:2">';
  h+='<div>1. 401k/403b — <strong>$'+max401k.toLocaleString()+'</strong>'+(matchPct>0?' (+ $'+matchAmt.toLocaleString()+' match)':'')+'</div>';
  h+='<div>2. Backdoor Roth IRA — <strong>$'+maxRoth.toLocaleString()+'</strong></div>';
  h+='<div>3. HSA (if HDHP) — <strong>$'+maxHSA.toLocaleString()+'</strong></div>';
  h+='<div style="color:var(--text3);font-size:11px;margin-top:4px">Total: $'+totalTaxAdv.toLocaleString()+'/yr</div>';
  h+='</div></div>';
  document.getElementById('fyp-results').innerHTML=h;
  recordToolUse('3-Year Financial Planner',null,'Y3 Wealth: $'+Math.round(y3.netWealth/1000)+'K | Invested: $'+Math.round(y3.cumInvested/1000)+'K',{inputs:{Salary:'$'+salary.toLocaleString(),Debt:'$'+debt.toLocaleString(),Rate:(rate*100).toFixed(1)+'%',Expenses:'$'+expenses.toLocaleString(),PSLF:pslf||'N/A'},highlights:['Year 3 Net Wealth: $'+Math.round(y3.netWealth/1000)+'K','Total Invested: $'+Math.round(y3.cumInvested/1000)+'K','Remaining Debt: $'+Math.round(y3.remainDebt/1000)+'K']});
}

// ===== INCOME LEVERAGE PLAYBOOK (v8) =====
function ilpCalculate(){
  var salary=parseFloat(document.getElementById('ilp-salary').value)||0;
  var debt=parseFloat(document.getElementById('ilp-debt').value)||0;
  var loanRate=(parseFloat(document.getElementById('ilp-rate').value)||6.5)/100;
  var employer=document.getElementById('ilp-employer').value;
  var disability=document.getElementById('ilp-disability').value;
  var spending=parseFloat(document.getElementById('ilp-spending').value)||0;
  var has401k=document.getElementById('ilp-401k').value;
  var hasAdvisor=document.getElementById('ilp-advisor').value;
  if(!salary){notify('Enter your salary',1);return}
  if(!spending) spending=Math.round(salary*0.5);
  var effectiveTax=salary>400000?0.35:salary>300000?0.32:salary>200000?0.28:0.24;
  var netSalary=Math.round(salary*(1-effectiveTax));
  var h='',score=0,maxScore=50,flags=[],wins=[];
  // 1. PSLF vs Refinance
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">1. PSLF vs. Refinance</div>';
  var idr=0,refi5=0,std10=0,pslfForgive=0;
  if(debt>0){
    idr=Math.round(Math.max(0,(salary*0.9-22500)*0.10/12));
    var refiRate=Math.max(0.04,loanRate-0.015);
    refi5=Math.round(debt*(refiRate/12)*Math.pow(1+refiRate/12,60)/(Math.pow(1+refiRate/12,60)-1));
    std10=Math.round(debt*(loanRate/12)*Math.pow(1+loanRate/12,120)/(Math.pow(1+loanRate/12,120)-1));
    pslfForgive=Math.max(0,debt-idr*120);
    if(employer==='nonprofit'||employer==='government'){
      score+=10;wins.push('PSLF-eligible employer');
      h+='<div style="padding:10px;background:rgba(139,184,160,.1);border-radius:8px;margin-bottom:8px"><span style="color:var(--green);font-weight:600">PSLF RECOMMENDED</span> — IDR: <strong>$'+idr.toLocaleString()+'/mo</strong>. Forgiveness: ~<strong>$'+Math.round(pslfForgive/1000)+'K</strong>.</div>';
      h+='<div style="font-size:11px;color:var(--red);font-weight:600">Do NOT refinance federal loans.</div>';
    }else{
      score+=6;
      h+='<div style="padding:10px;background:rgba(200,168,124,.08);border-radius:8px;margin-bottom:8px"><span style="color:var(--accent);font-weight:600">REFINANCE</span> — $'+refi5.toLocaleString()+'/mo x 5yr. Saves ~$'+Math.round((std10*120-refi5*60)/1000)+'K vs standard.</div>';
    }
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;margin-top:8px">';
    h+='<div style="padding:8px;background:var(--bg3);border-radius:6px;text-align:center"><div style="color:var(--text3)">PSLF</div><div style="font-weight:600">$'+idr.toLocaleString()+'/mo</div><div style="color:var(--green);font-size:10px">Forgiven: $'+Math.round(pslfForgive/1000)+'K</div></div>';
    h+='<div style="padding:8px;background:var(--bg3);border-radius:6px;text-align:center"><div style="color:var(--text3)">Refi 5yr</div><div style="font-weight:600">$'+refi5.toLocaleString()+'/mo</div><div style="color:var(--accent);font-size:10px">Total: $'+Math.round(refi5*60/1000)+'K</div></div>';
    h+='</div>';
  }else{score+=10;wins.push('No student debt');h+='<div style="color:var(--green);font-weight:600">No debt — skip to wealth building.</div>'}
  h+='</div>';
  // 2. Disability Insurance
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">2. Disability Insurance</div>';
  var monthBenefit=Math.round(salary*0.6/12);
  if(disability==='own_occ'){score+=10;wins.push('Own-occupation disability');h+='<div style="padding:10px;background:rgba(139,184,160,.1);border-radius:8px"><span style="color:var(--green);font-weight:600">Own-Occupation — Optimal.</span> Benefit: ~$'+monthBenefit.toLocaleString()+'/mo.</div>'}
  else if(disability==='any_occ'){score+=4;flags.push('Upgrade to own-occupation');h+='<div style="padding:10px;background:rgba(200,168,124,.1);border-radius:8px"><span style="color:var(--accent);font-weight:600">Any-Occupation — Upgrade.</span> Won\'t pay if you can work ANY job.</div>'}
  else{flags.push('No disability insurance');h+='<div style="padding:10px;background:rgba(196,77,86,.1);border-radius:8px"><span style="color:var(--red);font-weight:600">No Coverage — Critical Gap.</span> 25% chance of 90+ day disability before 65. Cost: ~$'+Math.round(salary*0.025/1000)+'K/yr for $'+monthBenefit.toLocaleString()+'/mo protection.</div>'}
  h+='</div>';
  // 3. Lifestyle
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">3. Lifestyle vs. Wealth</div>';
  var spendPct=Math.round((spending/netSalary)*100);
  var loanPmt=debt>0?((employer==='nonprofit'||employer==='government')?idr*12:refi5*12):0;
  var investable=Math.max(0,netSalary-spending-loanPmt);
  var wealth3=Math.round(investable*3*1.24);
  var altSpend=Math.round(netSalary*0.4);
  var altInvestable=Math.max(0,netSalary-altSpend-loanPmt);
  var altWealth3=Math.round(altInvestable*3*1.24);
  if(spendPct<=40){score+=10;wins.push('Disciplined spending')}else if(spendPct<=60){score+=6;flags.push('Room to reduce spending')}else{score+=2;flags.push('High spending ('+spendPct+'%)')}
  h+='<div style="font-size:12px;color:var(--text2);margin-bottom:10px">Spending <strong>$'+Math.round(spending/1000)+'K/yr</strong> ('+spendPct+'% of take-home). Investable: <strong>$'+Math.round(investable/1000)+'K/yr</strong>.</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">';
  h+='<div style="padding:10px;background:var(--bg3);border-radius:6px;text-align:center"><div style="color:var(--text3)">Your Plan</div><div style="font-weight:600">Spend $'+Math.round(spending/1000)+'K</div><div style="color:var(--accent);font-size:10px">3yr: $'+Math.round(wealth3/1000)+'K</div></div>';
  h+='<div style="padding:10px;background:var(--bg3);border-radius:6px;text-align:center"><div style="color:var(--text3)">40% Rule</div><div style="font-weight:600">Spend $'+Math.round(altSpend/1000)+'K</div><div style="color:var(--green);font-size:10px">3yr: $'+Math.round(altWealth3/1000)+'K</div></div>';
  h+='</div>';
  var wDiff=altWealth3-wealth3;
  if(wDiff>10000) h+='<div style="font-size:11px;color:var(--accent);margin-top:8px;font-weight:600">Gap: $'+Math.round(wDiff/1000)+'K over 3 years.</div>';
  h+='</div>';
  // 4. Tax-Advantaged
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">4. Tax-Advantaged Accounts</div>';
  if(has401k==='maxed'){score+=10;wins.push('Maxing tax-advantaged');h+='<div style="padding:10px;background:rgba(139,184,160,.1);border-radius:8px"><span style="color:var(--green);font-weight:600">Maxing Out — Saving ~$'+Math.round(34650*effectiveTax/1000)+'K/yr in taxes.</span></div>'}
  else if(has401k==='match'){score+=5;flags.push('Only employer match');h+='<div style="padding:10px;background:rgba(200,168,124,.1);border-radius:8px"><span style="color:var(--accent);font-weight:600">Match Only — Leaving tax savings on the table.</span></div>'}
  else{flags.push('Not contributing');h+='<div style="padding:10px;background:rgba(196,77,86,.1);border-radius:8px"><span style="color:var(--red);font-weight:600">Not Contributing — Missing ~$'+Math.round(34650*effectiveTax/1000)+'K/yr tax savings.</span></div>'}
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.8;margin-top:8px">Priority: Employer match → Backdoor Roth ($7K) → Max 401k ($23.5K) → HSA ($4,150)</div></div>';
  // 5. Advisor
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">5. Financial Advisor</div>';
  if(hasAdvisor==='feeonly'){score+=10;wins.push('Fee-only fiduciary');h+='<div style="padding:10px;background:rgba(139,184,160,.1);border-radius:8px"><span style="color:var(--green);font-weight:600">Fee-Only Fiduciary — Gold standard.</span></div>'}
  else if(hasAdvisor==='feebased'){score+=3;flags.push('Fee-based may have conflicts');h+='<div style="padding:10px;background:rgba(200,168,124,.1);border-radius:8px"><span style="color:var(--accent);font-weight:600">Fee-Based — Can earn commissions. Verify fiduciary or switch (NAPFA.org).</span></div>'}
  else if(hasAdvisor==='none'){score+=4;h+='<div style="padding:10px;background:var(--bg3);border-radius:8px"><span style="font-weight:600">No advisor</span> — Fine if disciplined. Consider fee-only at $250K+ assets.</div>'}
  else{flags.push('Commission-based advisor');h+='<div style="padding:10px;background:rgba(196,77,86,.1);border-radius:8px"><span style="color:var(--red);font-weight:600">Commission-Based — They profit from selling you products. Switch to fee-only (NAPFA.org).</span></div>'}
  h+='</div>';
  // Score
  var scorePct=Math.round((score/maxScore)*100);
  var grade=scorePct>=80?'Excellent':scorePct>=60?'Good':scorePct>=40?'Needs Work':'Critical Gaps';
  var gradeColor=scorePct>=80?'var(--green)':scorePct>=60?'var(--accent)':scorePct>=40?'var(--amber,orange)':'var(--red)';
  h+='<div style="padding:20px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:14px;text-align:center">';
  h+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:6px">Financial Leverage Score</div>';
  h+='<div style="font-size:48px;font-weight:700;color:'+gradeColor+';font-family:var(--font-serif)">'+score+'<span style="font-size:20px;color:var(--text3)">/'+maxScore+'</span></div>';
  h+='<div style="font-size:14px;font-weight:600;color:'+gradeColor+';margin-top:4px">'+grade+'</div>';
  h+='<div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-top:12px"><div style="height:100%;width:'+scorePct+'%;background:'+gradeColor+';border-radius:3px"></div></div>';
  h+='</div>';
  if(wins.length){
    h+='<div style="padding:14px;background:rgba(139,184,160,.06);border-radius:10px;margin-bottom:10px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">What You're Doing Right</div>';
    wins.forEach(function(w){h+='<div style="font-size:12px;color:var(--text2);margin-bottom:4px">✓ '+w+'</div>'});
    h+='</div>';
  }
  if(flags.length){
    h+='<div style="padding:14px;background:rgba(196,77,86,.06);border-radius:10px;margin-bottom:10px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Action Items</div>';
    flags.forEach(function(f){h+='<div style="font-size:12px;color:var(--text2);margin-bottom:4px">→ '+f+'</div>'});
    h+='</div>';
  }
  document.getElementById('ilp-results').innerHTML=h;
  recordToolUse('Income Leverage Playbook',score+'/'+maxScore,grade+' ('+scorePct+'%)',{inputs:{Salary:'$'+salary.toLocaleString(),Debt:'$'+debt.toLocaleString(),Employer:employer,Disability:disability,Spending:'$'+spending.toLocaleString(),'Tax-Advantaged':has401k,Advisor:hasAdvisor},highlights:['Score: '+score+'/'+maxScore+' ('+grade+')'].concat(wins).concat(flags)});
}
