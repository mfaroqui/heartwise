// ===== TOPBAR SCROLL EFFECT =====
(function(){
  const lp=document.getElementById('pg-landing');
  const tb=document.getElementById('topbar');
  if(lp&&tb){
    lp.addEventListener('scroll',function(){tb.classList.toggle('solid',lp.scrollTop>60)});
    window.addEventListener('scroll',function(){tb.classList.toggle('solid',window.scrollY>60)});
  }
})();

// ===== LANDING MENU =====
function toggleLandingMenu(e){
  e.stopPropagation();
  const m=document.getElementById('landing-menu');
  m.classList.toggle('hidden');
}
function closeLandingMenu(){
  const m=document.getElementById('landing-menu');
  if(m)m.classList.add('hidden');
}
function landingNav(id){
  closeLandingMenu();
  if(id==='pg-landing'){document.getElementById('pg-landing').scrollTo({top:0,behavior:'smooth'});return}
  const el=document.getElementById(id);
  if(el)el.scrollIntoView({behavior:'smooth'});
}
document.addEventListener('click',function(e){
  const m=document.getElementById('landing-menu');
  if(m&&!m.classList.contains('hidden')){
    if(!e.target.closest('.topbar-logo'))closeLandingMenu();
  }
});

// ===== SCROLL REVEAL =====
(function(){
  const obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el)});
  });
  // Also observe after page navigations
  window._observeReveals=function(){document.querySelectorAll('.reveal:not(.visible)').forEach(function(el){obs.observe(el)})};
})();

// ===== APP STATE =====
let DB,U=null,curFilter='all',curAdminTab='queue';

function initDB(){
  const seed={
    users:[{id:'admin',name:'Dr. Mouzam Faroqui',email:AE,pass:'admin123',role:'admin',tier:'admin',institution:'Houston Medical Center'}],
    questions:SEED_Q.concat(LEGACY_Q).concat(PENDING_Q),
    nextId:300,nextUserId:2
  };
  const saved=localStorage.getItem('hw_db');
  if(saved){const old=JSON.parse(saved);if(old.questions&&old.questions.length===seed.questions.length){DB=old;return}}
  DB=seed;saveDB();
}
function saveDB(){localStorage.setItem('hw_db',JSON.stringify(DB))}

window.onload=function(){
  initDB();
  document.getElementById('disc-check').addEventListener('change',function(){
    const b=document.getElementById('disc-btn');
    b.style.opacity=this.checked?'1':'.5';
    b.style.pointerEvents=this.checked?'auto':'none';
  });
  setTimeout(()=>{
    document.getElementById('splash').classList.add('out');
    setTimeout(()=>{
      document.getElementById('splash').style.display='none';
      const s=localStorage.getItem('hw_session');
      if(s){U=JSON.parse(s);handleCheckoutReturn();enterApp()}else{go('pg-landing')}
    },500);
  },1600);
};

// ===== NAV =====
function go(id){
  ['pg-landing','pg-login','pg-signup','pg-onboard','pg-forgot','main-app'].forEach(p=>{
    const el=document.getElementById(p);if(el){el.classList.add('hidden');el.style.display=''}
  });
  const el=document.getElementById(id);if(el){el.classList.remove('hidden');el.style.display=''}
  if(id==='pg-signup'){go('pg-onboard');return}
  document.getElementById('main-nav').classList.remove('on');
  // Show/hide topbar
  const tb=document.getElementById('topbar');
  if(tb)tb.style.display=(id==='pg-landing')?'':'none';
}

function navTo(scr,btn){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  document.getElementById(scr).classList.add('on');
  if(btn){document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));btn.classList.add('on')}
  else{
    const map={home:0,ask:1,archive:2,vault:3,profile:4,admin:5};
    const key=scr.replace('scr-','');
    const btns=document.querySelectorAll('.ni');
    btns.forEach(n=>n.classList.remove('on'));
    if(map[key]!==undefined&&btns[map[key]])btns[map[key]].classList.add('on');
  }
  if(scr==='scr-home')renderHome();
  if(scr==='scr-archive')renderArchive();
  if(scr==='scr-vault')renderVault();
  if(scr==='scr-admin')renderAdmin();
  if(scr==='scr-ask')updateAskScreen();
  if(scr==='scr-profile')renderProfile();
}

// ===== AUTH =====
function doLogin(e){
  e.preventDefault();
  const email=document.getElementById('l-email').value.trim().toLowerCase();
  const pass=document.getElementById('l-pass').value;
  const user=DB.users.find(u=>u.email.toLowerCase()===email&&u.pass===pass);
  if(!user){notify('Invalid email or password',1);return}
  U=user;if(!U.usage)U.usage={ai:0,credits:TIERS[U.tier]?.credits||0,month:new Date().getMonth()};
  localStorage.setItem('hw_session',JSON.stringify(U));
  if(!localStorage.getItem('hw_disc_'+U.id)){enterApp();showDisc()}else{enterApp()}
}

function doSignup(e){
  e.preventDefault();
  const name=document.getElementById('s-name').value.trim();
  const email=document.getElementById('s-email').value.trim().toLowerCase();
  const pass=document.getElementById('s-pass').value;
  const role=document.getElementById('s-role').value;
  const inst=document.getElementById('s-inst').value.trim();
  if(DB.users.find(u=>u.email.toLowerCase()===email)){notify('Email already registered',1);return}
  const user={id:'u'+DB.nextUserId++,name,email,pass,role,tier:'free',institution:inst,usage:{ai:0,credits:0,month:new Date().getMonth()}};
  DB.users.push(user);saveDB();
  U=user;localStorage.setItem('hw_session',JSON.stringify(U));
  enterApp();showDisc();
}

function doLogout(){U=null;localStorage.removeItem('hw_session');go('pg-landing')}

function doResetPassword(e){
  e.preventDefault();
  const email=document.getElementById('r-email').value.trim().toLowerCase();
  const pass=document.getElementById('r-pass').value;
  const pass2=document.getElementById('r-pass2').value;
  if(pass!==pass2){notify('Passwords do not match',1);return}
  if(pass.length<8){notify('Password must be at least 8 characters',1);return}
  const user=DB.users.find(u=>u.email.toLowerCase()===email);
  if(!user){notify('No account found with that email',1);return}
  user.pass=pass;saveDB();
  notify('Password updated! You can now sign in.');
  go('pg-login');
}

function enterApp(){
  go('main-app');
  document.getElementById('main-nav').classList.add('on');
  if(!U.usage)U.usage={ai:0,credits:TIERS[U.tier]?.credits||0,month:new Date().getMonth()};
  if(U.usage.month!==new Date().getMonth()){U.usage.ai=0;U.usage.credits=TIERS[U.tier]?.credits||0;U.usage.month=new Date().getMonth()}
  const b=document.getElementById('user-badge');
  const bc={free:'b-free',core:'b-core',elite:'b-pro',admin:'b-admin'};
  b.className='badge '+(bc[U.tier]||'b-free');
  b.textContent=U.tier==='admin'?'MENTOR':TIERS[U.tier]?.name?.toUpperCase()||'FREE';
  document.getElementById('welcome-msg').textContent='Welcome, '+U.name.split(' ')[0]+' \ud83d\udc4b';
  document.getElementById('nav-admin').style.display=U.tier==='admin'?'':'none';
  document.getElementById('upgrade-prompt').style.display=U.tier==='free'?'':'none';
  renderHome();
}

// ===== RENDER HOME =====
function renderHome(){
  if(!U)return;
  const t=TIERS[U.tier]||TIERS.free;
  const used=U.usage?.ai||0;const max=t.ai;
  const pct=max===999?0:Math.min(100,Math.round(used/max*100));
  document.getElementById('usage-ai').textContent=max===999?used+' / \u221e':used+' / '+max;
  document.getElementById('usage-bar').style.width=max===999?'0%':pct+'%';
  document.getElementById('usage-credits').textContent=U.usage?.credits||0;
  document.getElementById('usage-tier').textContent=t.name+' plan';
  // Reviewed This Week = reviewed in last 7 days (or latest 5 if none recent)
  const now=new Date();const weekAgo=new Date(now);weekAgo.setDate(weekAgo.getDate()-7);const weekStr=weekAgo.toISOString().split('T')[0];
  let reviewed=DB.questions.filter(q=>q.status==='reviewed'&&q.reviewNote).sort((a,b)=>b.date.localeCompare(a.date));
  const thisWeek=reviewed.filter(q=>(q.reviewDate||q.date)>=weekStr);
  const featured=thisWeek.length>=3?thisWeek.slice(0,5):reviewed.slice(0,5);
  document.getElementById('home-feed').innerHTML=featured.length?featured.map(renderQCard).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)"><p>No reviewed questions yet.</p></div>';
}

function renderQCard(q){
  const rc={student:'t-student',resident:'t-resident',fellow:'t-fellow',attending:'t-fellow'};
  const cat=CATS[q.cat]||q.cat;
  const st=q.status==='reviewed'?'t-reviewed':'t-pending';
  return '<div class="qc" onclick="showQuestion('+q.id+')"><div class="qc-top"><span class="qc-author">'+(q.anon?'Anonymous':q.author)+'</span><span class="tag '+(rc[q.role]||'')+'">'+q.role+'</span></div><span class="tag t-cat" style="margin-bottom:10px">'+cat+'</span><div class="qc-q">'+q.q+'</div><div class="qc-meta"><span>'+q.date+'</span><span class="tag '+st+'">'+q.status+'</span>'+(q.reviewNote?' <span class="tag t-reviewed">DR. REVIEWED</span>':'')+'</div></div>';
}

function showQuestion(id){
  const q=DB.questions.find(x=>x.id===id);if(!q)return;
  let h='<span class="tag t-cat" style="margin-bottom:12px;display:inline-block">'+(CATS[q.cat]||q.cat)+'</span>';
  h+='<h2 style="font-family:Cormorant Garamond,serif;font-size:20px;margin-bottom:8px">'+q.q+'</h2>';
  h+='<div style="font-size:12px;color:var(--text3);margin-bottom:20px">'+(q.anon?'Anonymous':q.author)+' \u00b7 '+q.role+' \u00b7 '+q.date+'</div>';
  if(q.ai){
    h+='<div class="ai-resp">';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)"><span style="font-size:11px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:1px">AI-Assisted Guidance</span><span style="font-size:10px;color:var(--text3)">•</span><span style="font-size:10px;color:var(--text3)">Powered by evidence-based frameworks</span></div>';
    h+='<h4>📋 Assessment</h4><p>'+q.ai.diag+'</p>';
    h+='<h4>🔍 Key Considerations</h4><p>'+q.ai.bottleneck+'</p>';
    h+='<h4>📝 Recommended Approach</h4><ol>'+q.ai.plan.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
    h+='<h4>⚠️ Common Pitfalls</h4><ul style="list-style:none;padding:0">'+q.ai.mistakes.map(m=>'<li style="padding:4px 0;color:var(--red)">• '+m+'</li>').join('')+'</ul>';
    h+='<h4>📅 30-Day Action Plan</h4><p>'+q.ai.action+'</p>';
    if(q.ai.refs){h+='<div style="margin-top:16px;padding:12px;border-radius:var(--r2);background:rgba(100,149,237,.06);border:1px solid rgba(100,149,237,.15)"><div style="font-size:10px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📚 References & Sources</div><p style="font-size:11px;color:var(--text3);line-height:1.6">'+q.ai.refs+'</p></div>'}
    h+='<div class="escalate" style="margin-top:12px">'+(q.ai.escalate?'✅ Physician review recommended: ':'ℹ️ Physician review: ')+(q.ai.ereason||'')+'</div>';
    h+='<div style="margin-top:12px;font-size:10px;color:var(--text3);font-style:italic;line-height:1.5">This response is AI-generated educational guidance, not medical or legal advice. For individualized decisions, consult appropriate professionals. References current as of the date shown.</div>';
    h+='</div>';
  }
  if(q.reviewNote){
    h+='<div style="margin-top:16px;padding:16px;border-radius:var(--r2);background:var(--green-dim);border:1px solid rgba(92,184,154,.2)">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\ud83e\uddd1\u200d\u2695\ufe0f Doctor\'s Review</div>';
    h+='<p style="font-size:14px;color:var(--text2);line-height:1.7">'+q.reviewNote+'</p></div>';
  }
  // Upgrade prompt for free users
  if(U&&U.tier==='free'){
    h+='<div style="margin-top:20px;padding:18px;border-radius:var(--r2);background:linear-gradient(135deg,var(--accent-dim),rgba(200,168,124,.06));border:1px solid rgba(200,168,124,.2)">';
    h+='<div style="font-size:14px;font-weight:600;color:var(--accent);margin-bottom:6px">⚡ Want more structured guidance?</div>';
    h+='<p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">Upgrade to Core for unlimited strategic assessments, financial modeling tools, and scenario simulations.</p>';
    h+='<button class="btn btn-a btn-sm" onclick="closeModal(\'modal-q\');navTo(\'scr-profile\');showUpgrade()" style="max-width:200px">View Plans \u2192</button></div>';
  }
  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}
function closeModal(id){document.getElementById(id).classList.add('hidden')}

// ===== ASK =====
function toggleFinance(){document.getElementById('q-finance-box').style.display=document.getElementById('q-cat').value==='finance'?'':'none'}
function togReview(){
  const t=document.getElementById('q-review-tog');
  if(!t.classList.contains('on')&&(U.usage?.credits||0)<=0){notify('No review credits. Upgrade your plan.',1);return}
  t.classList.toggle('on');
}
function updateAskScreen(){document.getElementById('ask-credits').textContent=U.usage?.credits||0}

function submitQ(){
  const level=document.getElementById('q-level').value;
  const cat=document.getElementById('q-cat').value;
  const core=document.getElementById('q-core').value.trim();
  if(!level){notify('Select your training level',1);return}
  if(!cat){notify('Select a category',1);return}
  if(!core||core.length<10){notify('Enter your core question (min 10 chars)',1);return}
  const t=TIERS[U.tier]||TIERS.free;
  if(U.usage.ai>=t.ai&&t.ai!==999){notify('AI responses used up this month. Upgrade for more.',1);return}
  const anon=document.getElementById('q-anon-tog').classList.contains('on');
  const wantsReview=document.getElementById('q-review-tog').classList.contains('on');
  const context=document.getElementById('q-context').value.trim();
  let fullQ=core;if(context)fullQ+=' '+context;
  const aiResp=genAI(cat,core,level);
  const q={id:DB.nextId++,userId:U.id,cat,role:U.role||'student',q:fullQ,author:anon?'Anonymous':U.name,anon,date:new Date().toISOString().split('T')[0],status:wantsReview?'pending':'answered',ai:aiResp,wantsReview};
  if(wantsReview&&U.usage.credits>0)U.usage.credits--;
  U.usage.ai++;
  DB.questions.push(q);saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
  ['q-level','q-cat','q-core','q-constraints','q-tried','q-context'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  document.getElementById('q-review-tog').classList.remove('on');
  document.getElementById('q-anon-tog').classList.remove('on');
  notify(wantsReview?'Submitted for Doctor Review':'AI response generated!');
  if(!wantsReview)showQuestion(q.id);else navTo('scr-home');
}

function genAI(cat,core,level){
  const T={
    career:{
      diag:'At the '+level+' level, career positioning is less about credentials and more about how intentionally you design your trajectory. The data consistently shows that physicians who approach career decisions with structured frameworks — rather than defaulting to the next available step — report higher satisfaction and better long-term outcomes (Shanafelt et al., Mayo Clinic Proceedings, 2019).',
      bottleneck:'Here\'s what I see most often: the constraint isn\'t your qualifications. It\'s clarity. Most trainees have similar CVs — what separates those who land their target positions is a coherent narrative and strategic relationships built 12-18 months before they need them.',
      plan:['Audit your CV against 3-5 successful applicants in your target field — look for gaps in research, leadership, or clinical breadth','Identify 2-3 physicians whose career path you want to emulate and request a 15-minute informational conversation','Commit to one scholarly project this month — even a case report puts you ahead of those still "thinking about it"','Draft your personal statement narrative now, even if applications are a year away — iteration takes time','Get specific feedback from attendings who have served on selection committees'],
      mistakes:['Waiting until application season to build your portfolio — most successful candidates start 18+ months early','Over-relying on a single mentor — one perspective creates blind spots','Choosing prestige over program fit — the "best" program isn\'t always best for your specific goals','Avoiding direct feedback — vague encouragement doesn\'t help you improve'],
      action:'Week 1: Pull your CV and compare against 3 successful applicants. Week 2: Reach out to 2 potential mentors. Week 3: Identify and start a scholarly project. By 90 days: first draft of personal statement and 1 abstract submitted.',
      refs:'Shanafelt TD, et al. "Career Fit and Burnout Among Academic Faculty." Mayo Clin Proc. 2019;94(4):678-689. • Dyrbye LN, et al. "Physician Satisfaction and Burnout at Different Career Stages." Mayo Clin Proc. 2013;88(12):1358-1367. • AAMC Careers in Medicine Framework, 2024.',
      escalate:false,ereason:'This is well-covered by structured career planning frameworks. Physician review recommended if you have a specific program list or unusual circumstances.'},
    fellowship:{
      diag:'Fellowship preparation at the '+level+' level requires reverse-engineering a timeline. The NRMP data shows that match success correlates most strongly with (1) letters of recommendation quality, (2) research productivity, and (3) away rotation performance — in roughly that order for most subspecialties.',
      bottleneck:'The biggest mistake I see is underestimating how early the match is effectively decided. Program directors are forming impressions 12-18 months before rank lists are due. By the time you\'re filling out ERAS, most of the meaningful work should already be done.',
      plan:['Map backward from your target match year — identify every deadline and work 3 months ahead of each','Build a target list of 15-20 programs, tiered by reach / target / safety based on program data and your application strength','Aim for 2-3 first-author publications or manuscripts in preparation — per NRMP Charting Outcomes, this significantly moves the needle','Secure specialty-specific letters early — a strong letter from a recognized name in your field is worth more than 5 generic ones','Plan 1-2 away rotations at programs where you could realistically match, ideally by end of PGY-2 or early PGY-3'],
      mistakes:['Starting preparation in application year — by then you\'re managing damage, not building strength','Applying too narrowly — NRMP data consistently shows broader applications improve match rates','Getting letters from attendings who barely know your work — a lukewarm letter from a big name hurts more than a strong one from a lesser-known mentor','Ignoring program culture — fellowship is 3-6 years; fit matters as much as reputation'],
      action:'This month: finalize program list and rank tiers. Next month: identify letter writers and start a research project. Month 3: submit abstract to ACC/AHA meeting. Month 6: manuscript in progress. Month 9: away rotations scheduled.',
      refs:'NRMP Charting Outcomes in the Match: Specialties Matching Service, 2024. • ACC Cardiology Fellowship Application Guide, 2024-2025. • Baskaran L, et al. "Factors Influencing Cardiology Fellowship Match." JACC. 2020;76(3):346-348.',
      escalate:false,ereason:'Standard fellowship preparation is well-structured. Request physician review if you need help with program-specific strategy or have a non-traditional application path.'},
    contract:{
      diag:'Contract evaluation is one of the highest-stakes financial decisions in a physician\'s career — often involving $250K-$500K+ in total compensation over the initial term. The literature on physician contract literacy is sobering: a Medical Economics survey found that over 60% of physicians did not fully understand their first contract before signing.',
      bottleneck:'The core problem is information asymmetry. The employer has done this hundreds of times. You\'re doing it for the first or second time. A physician contract attorney ($2,000-$3,500) typically pays for itself many times over through negotiated improvements.',
      plan:['Before anything else, hire a physician-specific contract attorney — not a general lawyer, not your uncle who does real estate','Pull MGMA and AMGA compensation benchmarks for your specialty, region, and practice type','Evaluate the full compensation picture: base salary, RVU rate and threshold, benefits value, call burden, partnership track, signing bonus clawback terms','Scrutinize the restrictive covenant (non-compete), tail insurance coverage, termination clauses (with-cause vs without-cause), and ramp-up provisions','Model total compensation over 3-5 years, not just year one — many contracts are structured to look good initially and flatten'],
      mistakes:['Signing without attorney review — this is a six-figure decision; $3K for legal review is not optional','Fixating on base salary while ignoring the non-compete radius, tail coverage gaps, or unfavorable termination terms','Accepting verbal promises that aren\'t in writing — if it\'s not in the contract, it doesn\'t exist','Not understanding whether you\'re in a production-based (RVU) model vs. salary guarantee — these have very different long-term trajectories'],
      action:'Week 1: Identify and engage a physician contract attorney. Week 2: Request MGMA data for your specialty and region. Week 3: Complete attorney review of all contract terms. Week 4: Prepare and submit a structured counter-offer with supporting data.',
      refs:'MGMA DataDive Provider Compensation Report, 2024. • Medical Economics Physician Compensation Survey, 2024. • AMA Physician Practice Benchmark Survey, 2023. • Erickson SM, et al. "Physician Employment Contracts." JAMA Internal Medicine, 2021.',
      escalate:true,ereason:'Contracts are highly individual. This framework covers the process, but your specific terms deserve physician review for nuanced guidance.'},
    finance:{
      diag:'Physician financial planning is uniquely complex because of the delayed income curve, high student debt load (median $200K+, per AAMC data), and the "attending lifestyle" transition that often derails long-term wealth building. The good news: physician income, when managed well, creates significant financial leverage over a 20-30 year career.',
      bottleneck:'The #1 wealth destroyer for new attendings isn\'t bad investments — it\'s lifestyle inflation during the trainee-to-attending transition. Going from $65K to $350K+ feels like unlimited money. Physicians who maintain near-resident spending for 2-3 years post-training build a financial foundation that compounds for decades.',
      plan:['Establish 3-6 month emergency fund in a high-yield savings account before anything else','Maximize tax-advantaged retirement contributions: 401(k)/403(b) employer match first, then backdoor Roth IRA, then max out pre-tax contributions','Make your student loan strategy decision: PSLF (if qualifying employment) vs. refinance — this is a six-figure decision that should not be made casually','Secure own-occupation disability insurance during residency/fellowship when premiums are lowest — this protects your most valuable asset (your income)','Maintain near-resident spending for 2-3 years post-training — invest the delta aggressively into index funds and loan repayment'],
      mistakes:['Refinancing federal loans before ruling out PSLF — this is irreversible and can cost $50K-$200K in forgiveness','Buying a house and a luxury car simultaneously upon attending salary — overleveraging in year one','Using a commission-based financial advisor without understanding fee structures — fee-only fiduciary advisors align better with your interests','Skipping disability insurance — a 35-year-old physician has roughly a 25% chance of a disability lasting 90+ days before age 65 (Council for Disability Awareness)'],
      action:'This week: Open a high-yield savings account and start emergency fund. This month: Enroll in employer retirement match. Next month: Get 3 disability insurance quotes. Within 90 days: Make your PSLF vs. refinance decision with full modeling.',
      refs:'AAMC Medical Student Education: Debt, Costs, and Loan Repayment Fact Card, 2024. • White Coat Investor, "Financial Literacy Curriculum for Medical Residents." • Council for Disability Awareness, Long-Term Disability Claims Review, 2023. • Physician on FIRE, "Live Like a Resident" framework.',
      escalate:true,ereason:'Financial planning is deeply personal. This framework covers fundamentals, but your specific debt load, family situation, and practice model affect the right strategy. Consider physician review.'},
    clinical:{
      diag:'Clinical skill development at the '+level+' level benefits most from deliberate, structured practice rather than passive case exposure. Evidence from medical education research (Ericsson, 2004; McGaghie et al., 2011) consistently shows that targeted, feedback-driven practice produces measurably better clinical outcomes than experience alone.',
      bottleneck:'The real gap isn\'t knowledge — it\'s having a system for turning every clinical encounter into a learning opportunity. Most trainees passively accumulate cases. The ones who accelerate fastest are those who actively review, teach, and self-assess after every shift.',
      plan:['Start with the current ACC/AHA guidelines relevant to your question — these are the evidence-based foundation everything else builds on','Identify 3-5 landmark trials in the topic area (check ACC.org CardioSmart, NEJM Journal Watch, or OpenEvidence for curated trial summaries)','Practice applying the guidelines to 3-5 real cases you\'ve seen — abstract knowledge doesn\'t stick without clinical application','Teach the topic to a peer or medical student within 2 weeks — the "teaching effect" significantly improves retention (Nestojko et al., Memory & Cognition, 2014)','Create a pocket reference card or decision algorithm you can use at the bedside — synthesis forces deeper understanding'],
      mistakes:['Memorizing guidelines without understanding the underlying pathophysiology — when patients don\'t fit the algorithm, you need to reason from first principles','Not reviewing your own outcomes — tracking your diagnostic accuracy and treatment decisions over time is the fastest path to improvement','Relying on a single resource — cross-reference UpToDate with primary literature and guidelines','Not keeping up with guideline updates — ACC/AHA guidelines are living documents; check focused updates annually'],
      action:'This week: Read the relevant ACC/AHA guideline in full. Next week: Review 3 landmark trials. Week 3: Apply to 3 real cases and document your reasoning. By day 30: Teach the topic and create a bedside reference card.',
      refs:'Ericsson KA. "Deliberate Practice and the Acquisition of Expert Performance." Academic Medicine. 2004;79(10). • McGaghie WC, et al. "A Critical Review of Simulation-Based Medical Education Research." Med Educ. 2010;44(1):50-63. • ACC/AHA Clinical Practice Guidelines, acc.org. • OpenEvidence clinical decision support, openevidence.com.',
      escalate:false,ereason:'Clinical education questions are well-served by evidence-based frameworks. Request physician review for complex diagnostic dilemmas or management decisions.'},
    productivity:{
      diag:'Physician productivity research (Sinsky et al., Annals of Internal Medicine, 2016) shows that physicians spend nearly 2 hours on EHR and administrative tasks for every 1 hour of direct patient care. The leverage isn\'t in working harder — it\'s in redesigning how you work.',
      bottleneck:'Most physicians try to optimize individual tasks when the real leverage is in workflow architecture. You don\'t need a better to-do list — you need a system that eliminates, automates, or batches the tasks that drain your energy without producing proportional value.',
      plan:['Conduct a 5-day time audit: track every 30-minute block to identify where your time actually goes vs. where you think it goes','Identify your top 3 time drains — these are usually documentation, inbox management, and context-switching between clinical and administrative work','Implement time-blocking for deep work (research, reading, career development) — protect these blocks like you would a procedure','Batch similar administrative tasks into 2-3 dedicated windows per day rather than handling them in real-time','Create templates and macros for recurring documentation — every note you write from scratch that could be templated is wasted cognitive energy'],
      mistakes:['Trying to optimize without first auditing — you can\'t improve what you haven\'t measured','Multitasking — cognitive science consistently shows it reduces both quality and speed (Monsell, 2003)','Not protecting deep work time — if your calendar doesn\'t reflect your priorities, other people\'s priorities will fill it','Saying yes to low-leverage commitments out of obligation — every yes to something unimportant is a no to something that matters'],
      action:'Week 1: Complete a 5-day time audit. Week 2: Identify top 3 time drains and design solutions. Week 3: Implement time-blocking system. Week 4: Create 3 documentation templates.',
      refs:'Sinsky C, et al. "Allocation of Physician Time in Ambulatory Practice." Annals of Internal Medicine. 2016;165(11):753-760. • Monsell S. "Task Switching." Trends in Cognitive Sciences. 2003;7(3):134-140. • Newport C. "Deep Work: Rules for Focused Success in a Distracted World." 2016.',
      escalate:false,ereason:'Productivity systems are well-structured by frameworks. Physician review available if you need help designing a system specific to your clinical role.'},
    wellness:{
      diag:'Physician burnout affects approximately 44% of practicing physicians (Shanafelt et al., Mayo Clinic Proceedings, 2022), and the drivers are primarily systemic — not personal weakness. At the '+level+' level, addressing wellness proactively is both a professional obligation and a practical necessity for career longevity.',
      bottleneck:'The root cause is almost never "not enough self-care." It\'s structural: unsustainable workload, loss of autonomy, moral injury from administrative burden, or isolation. Treating burnout with yoga while ignoring these drivers is like treating hypertension with aspirin.',
      plan:['Identify your specific burnout drivers — use the Maslach Burnout Inventory dimensions (emotional exhaustion, depersonalization, reduced personal accomplishment) to pinpoint which domain is affected','Protect one non-negotiable personal activity per week — research shows that maintaining one meaningful non-work commitment significantly reduces burnout risk','Build or maintain a peer support network — regular connection with 2-3 colleagues who understand your experience provides both perspective and validation','Set explicit boundaries on low-impact professional obligations — committee work, optional meetings, and administrative tasks that don\'t align with your core role drain energy disproportionately','If you\'re scoring high on emotional exhaustion or depersonalization, seek confidential professional support — most physician assistance programs are free and fully confidential'],
      mistakes:['Pushing through without addressing root causes — burnout doesn\'t resolve with willpower; it escalates','Isolating from colleagues and support — this is the most dangerous response and the most common','Making major career decisions while actively burned out — your decision-making is compromised; stabilize first, then decide','Comparing your internal experience to others\' external presentation — every colleague who "seems fine" is managing their own version of this'],
      action:'This week: Write down your top 2 burnout drivers — be specific. This weekend: Do one thing purely for yourself. Next week: Have an honest conversation with one trusted colleague. Within 30 days: If symptoms persist, contact your institution\'s physician wellness program or a confidential therapist.',
      refs:'Shanafelt TD, et al. "Changes in Burnout and Satisfaction With Work-Life Integration in Physicians During the First 2 Years of COVID-19." Mayo Clin Proc. 2022;97(12):2248-2258. • West CP, et al. "Interventions to Prevent and Reduce Physician Burnout." The Lancet. 2016;388(10057):2272-2281. • National Academy of Medicine Action Collaborative on Clinician Well-Being, nam.edu.',
      escalate:false,ereason:'Wellness frameworks are evidence-based and well-structured. Request physician review if you\'re in acute distress or facing a specific workplace situation.'}
  };
  return T[cat]||T.career;
}

// ===== ARCHIVE =====
function renderArchive(){
  const reviewed=DB.questions.filter(q=>q.status==='reviewed').sort((a,b)=>b.date.localeCompare(a.date));
  const search=document.getElementById('search-input').value.toLowerCase();
  let filtered=reviewed;
  if(search)filtered=filtered.filter(q=>q.q.toLowerCase().includes(search));
  if(curFilter!=='all')filtered=filtered.filter(q=>q.cat===curFilter);
  const featured=reviewed.filter(q=>q.reviewNote).slice(0,3);
  document.getElementById('archive-featured').innerHTML=featured.length?featured.map(renderQCard).join(''):'<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">No featured reviews this week.</div>';
  document.getElementById('archive-list').innerHTML=filtered.length?filtered.map(renderQCard).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)">No questions found.</div>';
}
function filterArchive(){renderArchive()}
function setFilter(f,btn){curFilter=f;document.querySelectorAll('.fc .chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');renderArchive()}

// ===== VAULT =====
function renderVault(){
  const canAccess=U.tier==='core'||U.tier==='elite'||U.tier==='admin';
  document.getElementById('vault-list').innerHTML=VAULT_ITEMS.map(v=>{
    const mentOnly=v.tier==='elite'&&U.tier!=='elite'&&U.tier!=='admin';
    const locked=!canAccess||mentOnly;
    return '<div class="vault-card '+(locked?'':'unlocked')+'" '+(locked?'onclick="notify(\'Upgrade to access this framework\',1)"':'onclick="openFramework(\''+v.id+'\')"')+'><div class="v-icon">'+v.icon+'</div><div class="v-info"><h3>'+v.title+'</h3><p>'+v.desc+(mentOnly?' \u2022 Private Strategy only':'')+'</p></div><div class="v-lock">'+(locked?'\ud83d\udd12':'\ud83d\udcc4')+'</div></div>';
  }).join('');
}
function openFramework(id){
  const content=VAULT_CONTENT[id];
  if(!content){notify('Framework content loading...',1);return}
  document.getElementById('modal-q-content').innerHTML=content;
  document.getElementById('modal-q').classList.remove('hidden');
}

// ===== PROFILE =====
function renderProfile(){
  if(!U)return;
  document.getElementById('prof-av').textContent=U.name.charAt(0).toUpperCase();
  document.getElementById('prof-name').textContent=U.name;
  const rl={student:'Medical Student',resident:'IM Resident',fellow:'Cardiology Fellow',attending:'Early Career Attending',admin:'Interventional Cardiologist',other:'Member'};
  document.getElementById('prof-role').textContent=rl[U.role]||'Member';
  const t=TIERS[U.tier]||TIERS.free;
  document.getElementById('ps-used').textContent=U.usage?.ai||0;
  document.getElementById('ps-remain').textContent=t.ai===999?'\u221e':Math.max(0,t.ai-(U.usage?.ai||0));
  document.getElementById('ps-credits').textContent=U.usage?.credits||0;
  document.getElementById('prof-plan-label').textContent=t.name+(U.tier==='free'?'':' \u2022 Active');
  document.getElementById('prof-plan-label').style.color=U.tier==='free'?'var(--text3)':'var(--accent)';
}
function showMyQ(){
  navTo('scr-archive');
  const mine=DB.questions.filter(q=>q.userId===U.id);
  document.getElementById('archive-featured').innerHTML='';
  document.getElementById('archive-list').innerHTML=mine.length?mine.map(renderQCard).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)">No questions yet.</div>';
}
function showUpgrade(){
  document.getElementById('upgrade-section').classList.toggle('hidden');
  // Update subscription management display
  if(U&&U.tier!=='free'&&U.tier!=='admin'){
    const m=document.getElementById('sub-manage');m.classList.remove('hidden');
    const t=TIERS[U.tier];
    document.getElementById('sub-plan-name').textContent=t.name;
    document.getElementById('sub-status').textContent='Active';
    const renew=U.tier==='elite'?'Renews monthly':'Renews monthly';
    document.getElementById('sub-renew').textContent=renew+' \u2022 Auto-renewal on';
    document.getElementById('sub-usage-summary').textContent='Unlimited AI assessments / '+t.credits+' review credits per month';
  }else{document.getElementById('sub-manage').classList.add('hidden')}
}
function toggleNotifSettings(){document.getElementById('notif-settings').classList.toggle('hidden')}
// ===== STRIPE CONFIG =====
const STRIPE_PK='pk_test_51T5mX3PXNQA0ks87KmMtyTYTQZKBLJ6dE5U15eSBf97sK2ecqdU1DYjcJYpevRpdJnE1Xyi0Uow6PG2J8b4A8UCq004h8agh3H';
const STRIPE_PRICES={
  core:'price_1T5rG5PXNQA0ks87NtjJVnYi',
  pro:'price_1T5rGQPXNQA0ks87WdzaewtE',
  audit:'price_1T5rGtPXNQA0ks8758d20r97',
  intensive:'price_1T5rHJPXNQA0ks87dGsOMuWM'
};
let stripeLoaded=false,stripeObj=null;

function loadStripe(){
  if(stripeLoaded)return Promise.resolve(stripeObj);
  return new Promise((resolve)=>{
    const s=document.createElement('script');
    s.src='https://js.stripe.com/v3/';
    s.onload=()=>{stripeObj=Stripe(STRIPE_PK);stripeLoaded=true;resolve(stripeObj)};
    s.onerror=()=>{notify('Failed to load payment system. Try again.',1);resolve(null)};
    document.head.appendChild(s);
  });
}

async function startCheckout(priceId,mode){
  const stripe=await loadStripe();
  if(!stripe){notify('Payment system unavailable.',1);return}
  const {error}=await stripe.redirectToCheckout({
    lineItems:[{price:priceId,quantity:1}],
    mode:mode||'subscription',
    successUrl:window.location.origin+'?checkout=success&plan='+encodeURIComponent(priceId),
    cancelUrl:window.location.origin+'?checkout=cancel',
    customerEmail:U?.email||undefined
  });
  if(error)notify(error.message,1);
}

function subPlan(plan){
  if(!U){notify('Please sign in first.',1);return}
  if(plan==='core'){
    startCheckout(STRIPE_PRICES.core,'subscription');
  }else if(plan==='pro'){
    startCheckout(STRIPE_PRICES.pro,'subscription');
  }else if(plan==='elite'){
    // Private Strategy - show options
    showPrivateStrategyModal();
  }else if(plan==='audit'){
    startCheckout(STRIPE_PRICES.audit,'payment');
  }else if(plan==='intensive'){
    startCheckout(STRIPE_PRICES.intensive,'payment');
  }else{
    // Free plan or fallback
    U.tier='free';U.usage.credits=0;
    const u=DB.users.find(u=>u.id===U.id);if(u)u.tier='free';
    saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
    notify('Switched to Free plan.');enterApp();
  }
}

function showPrivateStrategyModal(){
  const html='<h2 class="serif" style="font-size:20px;margin-bottom:16px">Private Strategy</h2>'+
    '<p style="font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.6">High-stakes, structured intervention during major career decisions. Select your engagement:</p>'+
    '<div class="card" style="cursor:pointer;margin-bottom:12px;padding:20px" onclick="closeModal(\'modal-q\');startCheckout(STRIPE_PRICES.audit,\'payment\')">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:14px;font-weight:600;color:var(--accent)">Strategic Audit</span><span style="font-size:16px;font-weight:700">$1,250\u2013$1,750</span></div>'+
    '<p style="font-size:12px;color:var(--text3);line-height:1.5">Structured intake, CV/offer review, 20-30 min recorded strategic breakdown, written execution roadmap. Delivered within 7 days. No live call.</p></div>'+
    '<div class="card" style="cursor:pointer;margin-bottom:12px;padding:20px" onclick="closeModal(\'modal-q\');startCheckout(STRIPE_PRICES.intensive,\'payment\')">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:14px;font-weight:600;color:var(--accent2)">Strategic Intensive</span><span style="font-size:16px;font-weight:700">$2,500</span></div>'+
    '<p style="font-size:12px;color:var(--text3);line-height:1.5">Structured intake, 30-60 min focused strategy session, written roadmap, 14-day limited follow-up window. Capped monthly.</p></div>'+
    '<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Not ongoing mentorship, contract legal markup, tax planning, or unlimited messaging. Defined strategic intervention.</p>';
  document.getElementById('modal-q-content').innerHTML=html;
  document.getElementById('modal-q').classList.remove('hidden');
}

// Handle checkout return
function handleCheckoutReturn(){
  const params=new URLSearchParams(window.location.search);
  const checkout=params.get('checkout');
  if(checkout==='success'){
    const priceId=params.get('plan');
    // Map price back to tier
    if(priceId===STRIPE_PRICES.core){if(U){U.tier='core';U.usage.credits=TIERS.core.credits}}
    else if(priceId===STRIPE_PRICES.pro){if(U){U.tier='pro';U.usage.credits=TIERS.pro.credits}}
    else{if(U)notify('Payment received! We will be in touch within 48 hours to begin your strategic engagement.')}
    if(U){
      const u=DB.users.find(u=>u.id===U.id);if(u)u.tier=U.tier;
      saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
    }
    notify('Payment successful! \u2728');
    window.history.replaceState({},'',window.location.pathname);
  }else if(checkout==='cancel'){
    notify('Checkout cancelled.',1);
    window.history.replaceState({},'',window.location.pathname);
  }
}

// ===== ADMIN =====
function renderAdmin(){
  const c=document.getElementById('admin-content');
  const reviewedThisWeek=DB.questions.filter(q=>q.status==='reviewed'&&q.reviewDate).length;
  document.getElementById('admin-info').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span>Select up to 10 questions per week for review.</span><span style="color:var(--accent);font-weight:600">'+reviewedThisWeek+' / 10 this week</span></div>';
  if(curAdminTab==='queue'){
    const pending=DB.questions.filter(q=>q.status==='pending');
    c.innerHTML=pending.length?pending.map(q=>'<div class="card" style="margin-bottom:12px"><div class="qc-top"><span class="qc-author">'+(q.anon?'Anonymous':q.author)+'</span><span class="tag '+(({student:'t-student',resident:'t-resident',fellow:'t-fellow'})[q.role]||'')+'">'+q.role+'</span></div><span class="tag t-cat">'+q.cat+'</span><div class="qc-q" style="margin:10px 0">'+q.q+'</div><div style="font-size:11px;color:var(--text3);margin-bottom:12px">'+q.date+(q.wantsReview?' \u2022 \u2b50 Review Requested':'')+'</div>'+(q.ai?'<details style="margin-bottom:12px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">View AI Draft</summary><div class="ai-resp" style="margin-top:8px;font-size:13px"><p>'+q.ai.diag+'</p></div></details>':'')+'<div class="abox"><textarea id="rev-'+q.id+'" placeholder="Add review commentary..."></textarea><div style="display:flex;align-items:center;gap:12px;margin-top:12px"><label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px"><input type="checkbox" id="share-'+q.id+'" checked> Share in archive</label><div style="flex:1"></div><button class="btn btn-a btn-sm" onclick="publishReview('+q.id+')">Publish</button></div></div></div>').join(''):'<div style="text-align:center;padding:40px;color:var(--text3)">\u2705 All caught up!</div>';
  }else if(curAdminTab==='reviewed'){
    const reviewed=DB.questions.filter(q=>q.status==='reviewed').sort((a,b)=>b.date.localeCompare(a.date));
    c.innerHTML=reviewed.length?reviewed.map(renderQCard).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)">No reviewed questions.</div>';
  }else{
    const total=DB.questions.length,ans=DB.questions.filter(q=>q.status==='reviewed').length,pend=DB.questions.filter(q=>q.status==='pending').length;
    const cats={};DB.questions.forEach(q=>{cats[q.cat]=(cats[q.cat]||0)+1});
    c.innerHTML='<div class="stats" style="padding:0"><div class="st"><div class="st-n">'+total+'</div><div class="st-l">Total</div></div><div class="st"><div class="st-n">'+ans+'</div><div class="st-l">Reviewed</div></div><div class="st"><div class="st-n">'+pend+'</div><div class="st-l">Pending</div></div><div class="st"><div class="st-n">'+DB.users.length+'</div><div class="st-l">Members</div></div></div><div class="sec" style="padding:20px 0 14px">By Category</div>'+Object.entries(cats).map(([k,v])=>'<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>'+(CATS[k]||k)+'</span><span style="color:var(--text3)">'+v+'</span></div>').join('');
  }
}
function adminTab(tab,btn){curAdminTab=tab;document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));btn.classList.add('on');renderAdmin()}

function publishReview(id){
  const ta=document.getElementById('rev-'+id);
  if(!ta||!ta.value.trim()){notify('Add review commentary',1);return}
  const q=DB.questions.find(q=>q.id===id);
  if(q){
    q.reviewNote=ta.value.trim();
    q.status='reviewed';
    q.reviewDate=new Date().toISOString().split('T')[0];
    // Content flywheel: check share toggle
    const shareBox=document.getElementById('share-'+id);
    q.shareInArchive=shareBox?shareBox.checked:true;
    saveDB();notify('Review published! \u2728');renderAdmin();
  }
}

// ===== ONBOARDING =====
let obStage='',obProfile={};
function obSelectStage(el,stage){
  obStage=stage;
  document.querySelectorAll('#ob-step1 .ob-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  const b=document.getElementById('ob-next1');b.style.opacity='1';b.style.pointerEvents='auto';
}
function obToStep2(){
  if(!obStage){notify('Select your stage',1);return}
  document.getElementById('ob-step1').classList.add('hidden');
  document.getElementById('ob-step2').classList.remove('hidden');
  // Dynamic fields based on stage
  const df=document.getElementById('ob-dynamic-fields');
  let h='';
  if(obStage==='student'){
    h+='<div class="fg"><label>USMLE Step 1 Score (or Pass/Fail)</label><input type="text" id="ob-score1" placeholder="e.g., 245 or Pass"></div>';
    h+='<div class="fg"><label>Research Publications</label><input type="number" id="ob-pubs" placeholder="0" min="0"></div>';
    h+='<div class="fg"><label>Leadership Roles</label><input type="number" id="ob-lead" placeholder="0" min="0"></div>';
  }else if(obStage==='resident'){
    h+='<div class="fg"><label>Step 2 CK Score</label><input type="text" id="ob-score2" placeholder="e.g., 255"></div>';
    h+='<div class="fg"><label>Publications / Abstracts</label><input type="number" id="ob-pubs" placeholder="0" min="0"></div>';
    h+='<div class="fg"><label>PGY Year</label><select id="ob-pgy"><option value="1">PGY-1</option><option value="2">PGY-2</option><option value="3">PGY-3</option></select></div>';
  }else if(obStage==='fellow'){
    h+='<div class="fg"><label>Publications (First Author)</label><input type="number" id="ob-pubs" placeholder="0" min="0"></div>';
    h+='<div class="fg"><label>Presentations (ACC/AHA/TCT)</label><input type="number" id="ob-present" placeholder="0" min="0"></div>';
  }else if(obStage==='attending'){
    h+='<div class="fg"><label>Current Compensation</label><input type="text" id="ob-comp" placeholder="e.g., $350,000"></div>';
    h+='<div class="fg"><label>Student Loan Balance</label><input type="text" id="ob-debt" placeholder="e.g., $280,000"></div>';
    h+='<div class="fg"><label>Practice Model</label><select id="ob-practice"><option value="">Select</option><option value="academic">Academic</option><option value="private">Private</option><option value="employed">Hospital Employed</option><option value="unsure">Unsure/Exploring</option></select></div>';
  }
  df.innerHTML=h;
}
function obToStep3(){
  const name=document.getElementById('ob-name').value.trim();
  const email=document.getElementById('ob-email').value.trim();
  const pass=document.getElementById('ob-pass').value;
  if(!name||!email||!pass){notify('Fill in name, email, and password.',1);return}
  if(pass.length<8){notify('Password must be at least 8 characters.',1);return}
  if(DB.users.find(u=>u.email.toLowerCase()===email.toLowerCase())){notify('Email already registered. Sign in instead.',1);return}
  obProfile={name,email,pass,stage:obStage,spec:document.getElementById('ob-spec').value,inst:document.getElementById('ob-inst').value.trim(),goal:document.getElementById('ob-goal').value};
  // Collect dynamic fields
  const df=['ob-score1','ob-score2','ob-pubs','ob-lead','ob-pgy','ob-present','ob-comp','ob-debt','ob-practice'];
  df.forEach(id=>{const el=document.getElementById(id);if(el)obProfile[id.replace('ob-','')]=el.value});
  // Generate report
  genReport();
  document.getElementById('ob-step2').classList.add('hidden');
  document.getElementById('ob-step3').classList.remove('hidden');
}
function genReport(){
  const p=obProfile;
  // Calculate competitiveness score (0-100)
  let score=50;
  const pubs=parseInt(p.pubs)||0;
  const lead=parseInt(p.lead)||0;
  if(pubs>=3)score+=15;else if(pubs>=1)score+=8;
  if(lead>=2)score+=10;else if(lead>=1)score+=5;
  if(p.spec&&p.spec!=='Undecided')score+=5;
  if(p.goal)score+=5;
  if(p.score1){const s=parseInt(p.score1);if(s>=250)score+=15;else if(s>=240)score+=10;else if(s>=230)score+=5}
  if(p.score2){const s=parseInt(p.score2);if(s>=260)score+=15;else if(s>=250)score+=10;else if(s>=240)score+=5}
  score=Math.min(95,Math.max(20,score));
  // Score color
  const sc=score>=70?'var(--green)':score>=45?'var(--accent)':'var(--red)';
  const sl=score>=70?'Strong':score>=45?'Developing':'Needs Focus';
  // Gaps
  let gaps=[],strengths=[];
  if(pubs<2)gaps.push({label:'Research Output',val:pubs<1?20:45,note:'Aim for 2+ publications before application'});
  else strengths.push({label:'Research Output',val:Math.min(85,40+pubs*15),note:pubs+' publications — solid foundation'});
  if(lead<1)gaps.push({label:'Leadership',val:15,note:'One meaningful leadership role changes your narrative'});
  else strengths.push({label:'Leadership',val:Math.min(80,30+lead*20),note:lead+' role(s) — demonstrates initiative'});
  if(!p.spec||p.spec==='Undecided')gaps.push({label:'Specialty Clarity',val:25,note:'Narrowing focus allows targeted positioning'});
  else strengths.push({label:'Specialty Clarity',val:70,note:p.spec+' — clear direction'});
  if(!p.goal)gaps.push({label:'Strategic Goal',val:20,note:'Define a specific 12-month objective'});
  else strengths.push({label:'Strategic Goal',val:65,note:'Goal identified — framework can optimize execution'});
  // Plan
  const plans={
    student:['Map target programs and required credentials (this month)','Start or join a research project with publication potential','Secure a meaningful leadership role or community engagement position','Request informational meetings with 2 attendings in your target specialty','Draft a personal narrative that connects your background to your specialty choice'],
    resident:['Compare your CV against 3 successful fellowship applicants','Identify letter writers who can speak to your clinical skills specifically','Submit an abstract to a national meeting within 90 days','Schedule 1-2 away rotations at target programs','Build relationships with attendings in your subspecialty of interest'],
    fellow:['Map your post-fellowship job market: academic vs. private vs. employed','Start networking at conferences with potential future employers','Review 3 recent contracts in your specialty to understand market terms','Begin financial modeling: PSLF eligibility, loan repayment timeline','Identify your clinical niche and start building that reputation now'],
    attending:['Get your current contract reviewed by a physician contract attorney','Run PSLF vs. refinance calculations with actual numbers','Compare your compensation against MGMA benchmarks for your specialty/region','Establish disability insurance if not already in place','Model your 5-year financial trajectory under current terms'],
    premed:['Identify 3-5 specialties that align with your interests and lifestyle goals','Build meaningful clinical exposure — quality over quantity','Start a research project or get involved in scholarly activity','Develop your narrative: what drives you toward medicine specifically?','Talk to physicians in specialties you\'re considering — book informational conversations'],
    switching:['Research the feasibility and timeline of your target specialty','Identify bridge programs, additional training, or experience requirements','Connect with physicians who have successfully made a similar switch','Model the financial impact: retraining cost, income gap, long-term ROI','Document transferable skills that make your transition logical']
  };
  const myPlan=plans[p.stage]||plans.student;

  let h='';
  // Score ring
  h+='<div style="text-align:center;margin-bottom:32px">';
  h+='<div class="score-ring" style="border-color:'+sc+'"><div class="score-val" style="color:'+sc+'">'+score+'</div><div class="score-label">'+sl+'</div></div>';
  h+='<p style="font-size:13px;color:var(--text2);font-weight:300">Competitive Position Score</p>';
  h+='</div>';
  // Strengths
  if(strengths.length){
    h+='<div class="report-sec" style="border-color:rgba(139,184,160,.15)"><h4 style="color:var(--green)">✦ Strengths</h4>';
    strengths.forEach(s=>{h+='<div class="metric-bar"><div class="mb-top"><span class="mb-label">'+s.label+'</span><span class="mb-val" style="color:var(--green)">'+s.val+'%</span></div><div class="mb-track"><div class="mb-fill" style="width:'+s.val+'%;background:var(--green)"></div></div><p style="font-size:11px;color:var(--text3);margin-top:3px">'+s.note+'</p></div>'});
    h+='</div>';
  }
  // Gaps
  if(gaps.length){
    h+='<div class="report-sec" style="border-color:rgba(196,77,86,.15)"><h4 style="color:var(--red)">⚡ Gap Analysis</h4>';
    gaps.forEach(g=>{h+='<div class="metric-bar"><div class="mb-top"><span class="mb-label">'+g.label+'</span><span class="mb-val" style="color:var(--red)">'+g.val+'%</span></div><div class="mb-track"><div class="mb-fill" style="width:'+g.val+'%;background:var(--red)"></div></div><p style="font-size:11px;color:var(--text3);margin-top:3px">'+g.note+'</p></div>'});
    h+='</div>';
  }
  // 6-month plan
  h+='<div class="report-sec"><h4>📅 6-Month Strategic Focus</h4><ol style="padding-left:18px">';
  myPlan.forEach(step=>{h+='<li style="padding:4px 0">'+step+'</li>'});
  h+='</ol></div>';
  // Risk
  h+='<div class="report-sec" style="border-color:rgba(200,168,124,.15)"><h4>⚠️ Key Risk Areas</h4>';
  if(pubs<2)h+='<p>• Low research output limits competitiveness for selective programs</p>';
  if(!p.goal)h+='<p>• No defined strategic goal — decisions without direction lead to drift</p>';
  if(p.stage==='attending'&&!p.debt)h+='<p>• Loan strategy undefined — every month of delay has compounding cost</p>';
  if(p.stage==='fellow'&&pubs<3)h+='<p>• Below median publication count for competitive fellowship tracks</p>';
  h+='<p>• Without structured follow-through, initial assessment loses value within 30 days</p>';
  h+='</div>';

  document.getElementById('ob-report').innerHTML=h;
  // Animate bars after render
  setTimeout(()=>{document.querySelectorAll('.mb-fill').forEach(b=>{const w=b.style.width;b.style.width='0%';setTimeout(()=>b.style.width=w,50)})},100);
}
function obComplete(){
  const p=obProfile;
  // Create user with trial
  const roleMap={premed:'student',student:'student',resident:'resident',fellow:'fellow',attending:'attending',switching:'other'};
  const trialEnd=new Date();trialEnd.setDate(trialEnd.getDate()+7);
  const user={id:'u'+DB.nextUserId++,name:p.name,email:p.email.toLowerCase(),pass:p.pass,role:roleMap[p.stage]||'student',tier:'core',trialEnd:trialEnd.toISOString().split('T')[0],institution:p.inst,usage:{ai:0,credits:0,month:new Date().getMonth()},profile:p};
  DB.users.push(user);saveDB();
  U=user;localStorage.setItem('hw_session',JSON.stringify(U));
  enterApp();showDisc();
  notify('Welcome! Your 7-day strategic access is active. ⚡');
}

// ===== DISCLAIMER =====
function showDisc(){document.getElementById('modal-disc').classList.remove('hidden')}
function acceptDisc(){document.getElementById('modal-disc').classList.add('hidden');if(U)localStorage.setItem('hw_disc_'+U.id,'1')}

// ===== NOTIFY =====
function notify(msg,err){
  const el=document.getElementById('notif');
  document.getElementById('ni-icon').textContent=err?'\u2715':'\u2726';
  document.getElementById('ni-text').textContent=msg;
  el.className='notif show'+(err?' err':'');
  setTimeout(()=>el.classList.remove('show'),3000);
}
