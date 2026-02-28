// ===== APP STATE =====
let DB,U=null,curFilter='all',curAdminTab='queue';

function initDB(){
  const seed={
    users:[{id:'admin',name:'Dr. Mouzam Faroqui',email:AE,pass:'admin123',role:'admin',tier:'admin',institution:'Houston Medical Center'}],
    questions:SEED_Q.concat(LEGACY_Q).concat(PENDING_Q),
    nextId:300,nextUserId:2
  };
  const saved=localStorage.getItem('hw_db');
  if(saved){const old=JSON.parse(saved);if(old.questions&&old.questions.length>=seed.questions.length){DB=old;return}}
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
  ['pg-landing','pg-login','pg-signup','main-app'].forEach(p=>{
    const el=document.getElementById(p);if(el){el.classList.add('hidden');el.style.display=''}
  });
  const el=document.getElementById(id);if(el){el.classList.remove('hidden');el.style.display=''}
  document.getElementById('main-nav').classList.remove('on');
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

function enterApp(){
  go('main-app');
  document.getElementById('main-nav').classList.add('on');
  if(!U.usage)U.usage={ai:0,credits:TIERS[U.tier]?.credits||0,month:new Date().getMonth()};
  if(U.usage.month!==new Date().getMonth()){U.usage.ai=0;U.usage.credits=TIERS[U.tier]?.credits||0;U.usage.month=new Date().getMonth()}
  const b=document.getElementById('user-badge');
  const bc={free:'b-free',core:'b-core',pro:'b-pro',mentorship:'b-ment',admin:'b-admin'};
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
  h+='<h2 style="font-family:Playfair Display,serif;font-size:20px;margin-bottom:8px">'+q.q+'</h2>';
  h+='<div style="font-size:12px;color:var(--text3);margin-bottom:20px">'+(q.anon?'Anonymous':q.author)+' \u00b7 '+q.role+' \u00b7 '+q.date+'</div>';
  if(q.ai){
    h+='<div class="ai-resp">';
    h+='<h4>\ud83c\udfaf Situation Diagnosis</h4><p>'+q.ai.diag+'</p>';
    h+='<h4>\ud83d\udd0d The Real Bottleneck</h4><p>'+q.ai.bottleneck+'</p>';
    h+='<h4>\ud83d\udcdd Strategic Plan</h4><ol>'+q.ai.plan.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
    h+='<h4>\u26a0\ufe0f Common Mistakes</h4><ul style="list-style:none;padding:0">'+q.ai.mistakes.map(m=>'<li style="padding:4px 0;color:var(--red)">\u2022 '+m+'</li>').join('')+'</ul>';
    h+='<h4>\ud83d\udcc5 30-Day Action Plan</h4><p>'+q.ai.action+'</p>';
    h+='<div class="escalate">'+(q.ai.escalate?'\u2705 Recommended for Doctor Review: ':'\u2796 Doctor Review: ')+(q.ai.ereason||'')+'</div>';
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
    h+='<p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">Upgrade to Core for 20 AI-guided mentorship responses per month and Physician Review credits. High Performer members get monthly guidance modules + framework library.</p>';
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
    career:{diag:'Based on your '+level+' training level, this is a strategic career positioning question requiring structured analysis.',bottleneck:'The real constraint is not qualifications\u2014it is strategic positioning. Differentiation comes from intentional career design.',plan:['Audit CV against successful applicants','Identify 2-3 strategic relationships to build','Start one research project this month','Submit abstract to next major conference','Develop a clear narrative for your application'],mistakes:['Waiting too long to build application','Relying on single mentor','Chasing prestige over fit','Not asking for specific feedback'],action:'Week 1: CV audit. Week 2: Target mentors. Week 3: Start research. Month 2: Conference abstract. Month 3: Feedback from 3 attendings.',escalate:false,ereason:'Career strategy covered by AI.'},
    fellowship:{diag:'Fellowship planning requires systematic approach to timeline, credentials, and networking at the '+level+' level.',bottleneck:'Most underestimate early preparation. The match is decided 12-18 months before application.',plan:['Map timeline backward from target match year','Identify top 15-20 programs','Target 2-3 first-author publications','Secure strong specialty-specific letters','Plan 1-2 away rotations'],mistakes:['Starting too late','Not applying broadly','Weak letters from distant attendings','Ignoring program culture'],action:'This month: program list. Next month: research project. Month 3: letter writers. Month 6: manuscript in progress.',escalate:false,ereason:'Standard fellowship planning.'},
    contract:{diag:'Contract evaluation requires understanding both explicit terms and implicit business model.',bottleneck:'Information asymmetry between you and employer is the primary risk.',plan:['Hire physician contract attorney ($2-3K)','Get MGMA benchmarks','Evaluate: salary, RVU rate, benefits, call','Scrutinize: restrictive covenant, tail coverage, termination','Model total comp over 3-5 years'],mistakes:['Signing without attorney','Focusing on salary, ignoring covenant','Accepting verbal promises','Not understanding comp model'],action:'Week 1: Attorney. Week 2: MGMA data. Week 3: Contract review. Week 4: Counter-offer.',escalate:true,ereason:'Contract specifics need individualized review.'},
    finance:{diag:'Physician finance decisions have outsized impact due to unique income trajectory.',bottleneck:'Primary wealth destroyer: lifestyle inflation during trainee-to-attending transition.',plan:['Emergency fund (3-6 months)','Max tax-advantaged accounts','Determine loan strategy: PSLF vs refinance','Own-occupation disability insurance','Maintain near-resident lifestyle 2-3 years'],mistakes:['Refinancing before PSLF decision','Buying house + car simultaneously','Commission-based financial advisor','Ignoring disability insurance'],action:'This week: HYSA. This month: employer match. Next month: disability quotes. Quarter 1: loan strategy.',escalate:true,ereason:'Financial decisions benefit from personalized analysis.'},
    clinical:{diag:'Clinical mastery requires pattern recognition and systematic decision-making through deliberate practice.',bottleneck:'You need a system for learning from every case, not passive exposure.',plan:['Review relevant ACC/AHA guidelines','Study 3-5 landmark trials','Practice algorithm with real cases','Teach the topic to a peer','Create bedside reference card'],mistakes:['Memorizing without understanding pathophysiology','Not reviewing own cases','Relying on single resource','Not updating as guidelines change'],action:'This week: read guideline. Review 3 cases. Create reference card. Teach within 30 days.',escalate:false,ereason:'Clinical education covered by AI.'},
    productivity:{diag:'Productivity in medicine is about systems design, not working harder.',bottleneck:'You are optimizing tasks when the leverage is in workflow architecture.',plan:['5-day time audit','Identify top 3 time drains','Install time-blocking for deep work','Batch similar tasks','Create templates for recurring work'],mistakes:['Optimizing without auditing','Multitasking','Not protecting deep work blocks','Saying yes to low-leverage requests'],action:'Week 1: time audit. Week 2: identify drains. Week 3: time-blocking. Week 4: create 3 templates.',escalate:false,ereason:'Productivity framework is comprehensive.'},
    wellness:{diag:'Physician wellness is a prerequisite for sustained high performance, not a luxury.',bottleneck:'Treating symptoms instead of root causes: unsustainable workload, lack of boundaries, isolation.',plan:['Identify specific burnout drivers','Protect one non-negotiable personal activity','Build support network','Set boundaries on low-impact obligations','Consider professional support'],mistakes:['Pushing through without addressing root causes','Isolating','Making career decisions while burned out','Comparing internal experience to external appearance'],action:'This week: top 2 burnout drivers. Protect one personal evening. Talk to one peer. Professional support if severe.',escalate:false,ereason:'Wellness framework provided.'}
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
  const canAccess=U.tier==='pro'||U.tier==='mentorship'||U.tier==='admin';
  document.getElementById('vault-list').innerHTML=VAULT_ITEMS.map(v=>{
    const mentOnly=v.tier==='mentorship'&&U.tier!=='mentorship'&&U.tier!=='admin';
    const locked=!canAccess||mentOnly;
    return '<div class="vault-card '+(locked?'':'unlocked')+'" '+(locked?'':'onclick="notify(\'Template downloaded! (Demo)\')"')+'><div class="v-icon">'+v.icon+'</div><div class="v-info"><h3>'+v.title+'</h3><p>'+v.desc+(mentOnly?' \u2022 Mentorship only':'')+'</p></div><div class="v-lock">'+(locked?'\ud83d\udd12':'\u2b07\ufe0f')+'</div></div>';
  }).join('');
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
    const renew=U.tier==='mentorship'?'Renews annually':'Renews monthly';
    document.getElementById('sub-renew').textContent=renew+' \u2022 Auto-renewal on';
    document.getElementById('sub-usage-summary').textContent=t.ai+(t.ai===999?' unlimited':'')+' AI responses / '+t.credits+' review credits per '+(U.tier==='mentorship'?'year':'month');
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
  }else if(plan==='mentorship'){
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
