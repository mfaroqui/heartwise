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

// ===== SUPABASE INIT =====
const SUPABASE_URL='https://kqyvfykbnboesskxovtw.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeXZmeWtibmJvZXNza3hvdnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTQ2MjMsImV4cCI6MjA4Nzk5MDYyM30.OknOG2sY9Z9a6SVwPpqA55oHwgZ5mnRyDwfLrTRFxn0';
let _supaClient=null;
try{_supaClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY)}catch(e){console.warn('Supabase init failed',e)}

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

window.onload=async function(){
  initDB();
  document.getElementById('disc-check').addEventListener('change',function(){
    const b=document.getElementById('disc-btn');
    b.style.opacity=this.checked?'1':'.5';
    b.style.pointerEvents=this.checked?'auto':'none';
  });
  // Handle Supabase password reset redirect
  const hash=window.location.hash;
  if(hash.includes('type=recovery')||hash.includes('reset-password')){
    // Supabase recovery flow — parse tokens from hash
    const params=new URLSearchParams(hash.replace('#',''));
    const accessToken=params.get('access_token');
    const refreshToken=params.get('refresh_token');
    if(accessToken&&_supaClient){
      await _supaClient.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
    }
    // Clean up URL
    history.replaceState(null,'',window.location.pathname);
    document.getElementById('splash').classList.add('out');
    setTimeout(()=>{document.getElementById('splash').style.display='none';go('pg-reset')},500);
    return;
  }
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
  ['pg-landing','pg-login','pg-signup','pg-onboard','pg-forgot','pg-reset','main-app'].forEach(p=>{
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
async function doLogin(e){
  e.preventDefault();
  const email=document.getElementById('l-email').value.trim().toLowerCase();
  const pass=document.getElementById('l-pass').value;
  // Try Supabase auth first
  if(_supaClient){
    try{
      const{data,error}=await _supaClient.auth.signInWithPassword({email,password:pass});
      if(!error){
        const sbUser=data.user;
        let user=DB.users.find(u=>u.email.toLowerCase()===email);
        if(!user){
          user={id:'u'+DB.nextUserId++,name:sbUser.user_metadata?.name||email.split('@')[0],email,pass:'__supabase__',role:'student',tier:'free',institution:'',usage:{ai:0,credits:0,month:new Date().getMonth()}};
          DB.users.push(user);saveDB();
        }
        U=user;if(!U.usage)U.usage={ai:0,credits:TIERS[U.tier]?.credits||0,month:new Date().getMonth()};
        localStorage.setItem('hw_session',JSON.stringify(U));
        if(!localStorage.getItem('hw_disc_'+U.id)){enterApp();showDisc()}else{enterApp()}
        return;
      }
    }catch(ex){}
  }
  // Fallback: check local DB
  const user=DB.users.find(u=>u.email.toLowerCase()===email&&u.pass===pass);
  if(!user){notify('Invalid email or password',1);return}
  if(_supaClient){_supaClient.auth.signUp({email,password:pass,options:{data:{name:user.name}}}).catch(()=>{})}
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
  if(_supaClient){_supaClient.auth.signUp({email,password:pass,options:{data:{name}}}).catch(()=>{})}
  U=user;localStorage.setItem('hw_session',JSON.stringify(U));
  enterApp();showDisc();
}

function doLogout(){
  if(_supaClient){_supaClient.auth.signOut().catch(()=>{})}
  U=null;localStorage.removeItem('hw_session');go('pg-landing');
}

async function doForgotPassword(e){
  e.preventDefault();
  const email=document.getElementById('r-email').value.trim().toLowerCase();
  if(!_supaClient){notify('Password reset is temporarily unavailable.',1);return}
  const siteUrl=window.location.origin+window.location.pathname;
  const{error}=await _supaClient.auth.resetPasswordForEmail(email,{redirectTo:siteUrl+'#reset-password'});
  if(error){notify('Error sending reset email. Please try again.',1);return}
  document.getElementById('reset-sent').classList.remove('hidden');
  notify('Reset link sent! Check your email.');
}

async function doNewPassword(e){
  e.preventDefault();
  const pass=document.getElementById('rp-pass').value;
  const pass2=document.getElementById('rp-pass2').value;
  if(pass!==pass2){notify('Passwords do not match',1);return}
  if(pass.length<8){notify('Password must be at least 8 characters',1);return}
  if(!_supaClient){notify('Password reset is temporarily unavailable.',1);return}
  const{error}=await _supaClient.auth.updateUser({password:pass});
  if(error){notify('Error updating password. Link may have expired.',1);return}
  try{
    const{data:{user}}=await _supaClient.auth.getUser();
    if(user){
      const local=DB.users.find(u=>u.email.toLowerCase()===user.email.toLowerCase());
      if(local){local.pass=pass;saveDB()}
    }
  }catch(ex){}
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
      diag:'Look, I\'ve been through this — and I\'ve watched hundreds of trainees navigate it. At the '+level+' level, the thing nobody tells you is that career positioning isn\'t really about your credentials anymore. It\'s about how intentionally you\'re building your story. The data backs this up too — Shanafelt\'s group at Mayo showed that physicians who make structured, deliberate career decisions report significantly higher satisfaction long-term (Mayo Clin Proc, 2019). Bottom line: stop drifting and start designing.',
      bottleneck:'Here\'s what I keep seeing — and I wish someone had told me this earlier. The constraint isn\'t your qualifications. It\'s clarity. Most trainees at your level have similar CVs. What separates those who land their dream positions from everyone else? A coherent narrative and strategic relationships built 12-18 months before they need them. Not 12 weeks. 12 months.',
      plan:['Pull your CV today and compare it side-by-side against 3-5 successful applicants in your target field — be honest about where the gaps are in research, leadership, or clinical breadth','Find 2-3 physicians whose career path you actually want — not just admire from afar — and ask for a 15-minute conversation. Most will say yes.','Commit to one scholarly project this month. I don\'t care if it\'s a case report. Something on paper puts you ahead of 80% of people who are still "planning to do research"','Start drafting your personal statement now, even if applications are a year out. Good narratives take multiple iterations — you can\'t rush this.','Seek out attendings who\'ve sat on selection committees and ask them specifically what made applicants stand out. Generic advice is useless; you want specifics.'],
      mistakes:['Waiting until application season to start building your portfolio — I see this every year and it\'s heartbreaking. The successful candidates started 18+ months ago.','Putting all your eggs in one mentor\'s basket — love your mentor, but one perspective creates blind spots you can\'t see','Choosing the most prestigious program instead of the best fit for YOUR goals — I\'ve watched people be miserable at "top" programs','Avoiding honest feedback because it\'s uncomfortable — vague encouragement feels nice but doesn\'t move the needle'],
      action:'Here\'s your 90-day game plan: Week 1 — pull your CV and do that honest comparison. Week 2 — reach out to 2 potential mentors (email template: short, specific, respectful of their time). Week 3 — identify and start a scholarly project. By day 90: first draft of personal statement done and 1 abstract submitted. That\'s it. Just execute.',
      refs:'Shanafelt TD, et al. "Career Fit and Burnout Among Academic Faculty." Mayo Clin Proc. 2019;94(4):678-689. • Dyrbye LN, et al. "Physician Satisfaction and Burnout at Different Career Stages." Mayo Clin Proc. 2013;88(12):1358-1367. • AAMC Careers in Medicine Framework, 2024.',
      escalate:false,ereason:'This is well-covered by structured career planning frameworks. Physician review recommended if you have a specific program list or unusual circumstances.'},
    fellowship:{
      diag:'I\'ll be real with you — fellowship prep is a game, and the sooner you understand the rules, the better you\'ll play it. At the '+level+' level, you need to be reverse-engineering your timeline right now. The NRMP data is clear on what matters most: (1) quality of your recommendation letters, (2) research productivity, and (3) how you perform on away rotations. Notice what\'s NOT on that list? Step scores alone don\'t get you in.',
      bottleneck:'The biggest mistake I see — and I made this mistake myself early on — is underestimating how early the match is effectively decided. Program directors start forming impressions 12-18 months before rank lists are due. By the time you\'re clicking through ERAS, the real work should already be done. If you\'re just starting now, you\'re not too late, but you need to move with urgency.',
      plan:['Map backward from your target match year — every single deadline — and work 3 months ahead of each one. Put it in your calendar today.','Build a tiered program list of 15-20 programs: reach / target / safety. Be honest with yourself about where you fall. NRMP data helps here.','Aim for 2-3 first-author publications or manuscripts in progress. Per NRMP Charting Outcomes, this is what actually moves the needle — not the 15th poster nobody reads.','Lock in specialty-specific letters early. A strong, detailed letter from someone who genuinely knows your work beats a generic letter from a famous name every single time.','Plan 1-2 away rotations at programs where you could realistically match. Treat every day there like a month-long interview — because it is.'],
      mistakes:['Starting preparation during application year — by then you\'re in damage control mode, not strength-building mode. I\'ve seen too many talented trainees learn this the hard way.','Applying too narrowly because of ego or geography — NRMP data consistently shows that broader applications improve match rates. Swallow your pride and cast a wider net.','Getting letters from attendings who barely remember you — a lukewarm letter from a department chair hurts more than a strong one from a mid-career mentor who can speak to your specifics','Ignoring program culture because the name is impressive — fellowship is 3-6 years of your life. Fit matters as much as reputation. Trust me.'],
      action:'Here\'s what I want you to do: This month — finalize your program list and tier it honestly. Next month — identify your letter writers and start a research project with a clear timeline. Month 3 — submit an abstract to ACC or AHA. Month 6 — manuscript should be in progress. Month 9 — away rotations scheduled. Write this on your wall.',
      refs:'NRMP Charting Outcomes in the Match: Specialties Matching Service, 2024. • ACC Cardiology Fellowship Application Guide, 2024-2025. • Baskaran L, et al. "Factors Influencing Cardiology Fellowship Match." JACC. 2020;76(3):346-348.',
      escalate:false,ereason:'Standard fellowship preparation is well-structured. Request physician review if you need help with program-specific strategy or have a non-traditional application path.'},
    contract:{
      diag:'Let me be blunt — your first contract negotiation is probably a $250K-$500K+ decision when you add up the full terms. And here\'s the scary part: a Medical Economics survey found that over 60% of physicians didn\'t fully understand their first contract before signing it. I don\'t want you to be one of them.',
      bottleneck:'The core issue is simple: information asymmetry. The hospital or practice has done this hundreds of times. You\'re doing it for the first or second time. That\'s why a physician-specific contract attorney ($2,000-$3,500) isn\'t an expense — it\'s an investment that typically pays for itself 10x over through negotiated improvements. I have yet to meet a physician who regretted hiring one.',
      plan:['First things first: hire a physician-specific contract attorney. Not your family lawyer, not your friend who does real estate. Someone who reviews physician contracts all day. This is non-negotiable.','Pull MGMA and AMGA compensation benchmarks for your exact specialty, region, and practice type. You can\'t negotiate effectively without knowing the market.','Look at the FULL picture: base salary, RVU rate and threshold, benefits value, call burden, partnership track, signing bonus clawback terms. The base salary is often the least important number.','Read the fine print: restrictive covenant (non-compete radius), tail insurance coverage, termination clauses (with-cause vs. without-cause), and ramp-up provisions. These are where employers hide unfavorable terms.','Model total compensation over 3-5 years, not just year one. Many contracts look great initially and flatten hard — understand the trajectory before you sign.'],
      mistakes:['Signing without attorney review — I cannot stress this enough. This is a six-figure decision. $3K for legal review is the best money you\'ll ever spend.','Fixating on base salary while ignoring the non-compete radius that could lock you out of your city if things don\'t work out','Accepting verbal promises — "we\'ll take care of you" means nothing if it\'s not in writing. If it matters, it goes in the contract.','Not understanding whether you\'re in a production-based (RVU) model vs. salary guarantee. These have fundamentally different long-term trajectories and incentive structures.'],
      action:'Week 1: Find and engage a physician contract attorney (ask colleagues for referrals). Week 2: Request MGMA data for your specialty and region. Week 3: Complete attorney review of all contract terms. Week 4: Prepare a structured counter-offer backed by market data. Don\'t be afraid to negotiate — they expect it.',
      refs:'MGMA DataDive Provider Compensation Report, 2024. • Medical Economics Physician Compensation Survey, 2024. • AMA Physician Practice Benchmark Survey, 2023. • Erickson SM, et al. "Physician Employment Contracts." JAMA Internal Medicine, 2021.',
      escalate:true,ereason:'Contracts are highly individual. This framework covers the process, but your specific terms deserve physician review for nuanced guidance.'},
    finance:{
      diag:'Here\'s what nobody prepares you for in medical school: the financial transition from trainee to attending is one of the most dangerous periods of your career. Median student debt is $200K+ (AAMC data), and then suddenly you\'re making $350K-$500K. It feels like you won the lottery. But I\'ve watched colleagues who earn more than most Americans will ever see still end up financially stressed — because the "attending lifestyle" hit them before a financial plan did.',
      bottleneck:'I\'ll tell you the #1 wealth destroyer I\'ve seen among new attendings, and it\'s not bad investments or crypto. It\'s lifestyle inflation during the trainee-to-attending transition. Going from $65K to $350K+ feels like unlimited money. The physicians who maintain near-resident spending for just 2-3 years after training build a financial foundation that compounds for decades. It\'s boring advice. It\'s also the most effective advice you\'ll ever get.',
      plan:['Before anything flashy: build a 3-6 month emergency fund in a high-yield savings account. This is your financial oxygen mask.','Max out tax-advantaged retirement: 401(k)/403(b) employer match first (that\'s free money), then backdoor Roth IRA, then max pre-tax contributions. In that order.','Make your student loan decision carefully: PSLF (if you have qualifying employment) vs. refinance. This is easily a six-figure decision. Run the actual numbers — don\'t just go with what your coresident did.','Get own-occupation disability insurance during training when premiums are lowest. Your income is your most valuable asset — a 35-year-old physician has roughly a 25% chance of a disability lasting 90+ days before age 65.','Live like a resident for 2-3 years post-training. I know it\'s not what you want to hear. But invest the delta aggressively into index funds and loan repayment. Future you will be grateful.'],
      mistakes:['Refinancing federal loans before fully evaluating PSLF — this is irreversible and can cost $50K-$200K in forgiveness. Once you refinance to private, you can\'t go back.','Buying a house AND a luxury car in year one — I\'ve seen this derail so many people. You\'re not behind just because your non-physician friends bought homes 5 years ago.','Using a commission-based financial advisor without understanding their fee structure — they have different incentives than you. Fee-only fiduciary advisors are the way to go.','Skipping disability insurance because "it won\'t happen to me" — the statistics say otherwise, and policies get more expensive every year you wait'],
      action:'This week: Open a high-yield savings account and set up an automatic transfer for your emergency fund. This month: Enroll in your employer\'s retirement match program. Next month: Get 3 disability insurance quotes. Within 90 days: Make your PSLF vs. refinance decision with actual modeling, not guessing.',
      refs:'AAMC Medical Student Education: Debt, Costs, and Loan Repayment Fact Card, 2024. • White Coat Investor, "Financial Literacy Curriculum for Medical Residents." • Council for Disability Awareness, Long-Term Disability Claims Review, 2023. • Physician on FIRE, "Live Like a Resident" framework.',
      escalate:true,ereason:'Financial planning is deeply personal. This framework covers fundamentals, but your specific debt load, family situation, and practice model affect the right strategy. Consider physician review.'},
    clinical:{
      diag:'At the '+level+' level, here\'s what separates good clinicians from great ones: it\'s not who sees the most patients. It\'s who learns the most from every patient they see. The evidence from medical education research is pretty clear — Ericsson (2004) and McGaghie et al. (2011) showed that deliberate, structured practice with targeted feedback produces measurably better outcomes than passive experience accumulation. Translation: 10,000 hours means nothing if you\'re not actively reflecting.',
      bottleneck:'The real gap I see at your level isn\'t knowledge — you have access to UpToDate, ACC guidelines, all of it. The gap is having a system for turning clinical encounters into learning. Most trainees passively accumulate cases and hope wisdom follows. The ones who accelerate fastest are actively reviewing, teaching, and self-assessing after every shift. That\'s the difference.',
      plan:['Start with the current ACC/AHA guidelines for your question — these are your evidence-based foundation. Actually read them, don\'t just skim the summary table.','Identify 3-5 landmark trials in the topic area. Use ACC CardioSmart, NEJM Journal Watch, or OpenEvidence for curated summaries if you\'re short on time.','Apply the guidelines to 3-5 real patients you\'ve managed recently. Abstract knowledge doesn\'t stick without clinical anchoring — you know this from Step 1.','Teach this topic to a medical student or junior resident within 2 weeks. Nestojko et al. (Memory & Cognition, 2014) showed the "teaching effect" significantly boosts retention. Plus, it forces you to identify your own knowledge gaps.','Create a pocket reference card or decision algorithm you can actually use at the bedside. The synthesis process forces deeper understanding than passive reading ever will.'],
      mistakes:['Memorizing guidelines without understanding the underlying pathophysiology — when your patient doesn\'t fit the algorithm (and they won\'t), you need to reason from first principles','Not tracking your own outcomes — reviewing your diagnostic accuracy and treatment decisions over time is the single fastest path to clinical improvement','Relying on one resource (usually UpToDate) — cross-reference with primary literature and guidelines. UpToDate is a starting point, not the final answer.','Not staying current with guideline updates — ACC/AHA guidelines are living documents. A focused update can change your management of a condition you treat every day.'],
      action:'This week: Read the relevant ACC/AHA guideline in full — not just the class I recommendations. Next week: Review 3 landmark trials. Week 3: Apply to 3 real cases and write down your reasoning. By day 30: Teach the topic and create your bedside reference card.',
      refs:'Ericsson KA. "Deliberate Practice and the Acquisition of Expert Performance." Academic Medicine. 2004;79(10). • McGaghie WC, et al. "A Critical Review of Simulation-Based Medical Education Research." Med Educ. 2010;44(1):50-63. • ACC/AHA Clinical Practice Guidelines, acc.org. • OpenEvidence clinical decision support, openevidence.com.',
      escalate:false,ereason:'Clinical education questions are well-served by evidence-based frameworks. Request physician review for complex diagnostic dilemmas or management decisions.'},
    productivity:{
      diag:'I want you to think about this number: for every 1 hour of direct patient care, physicians spend nearly 2 hours on EHR and administrative tasks (Sinsky et al., Annals of Internal Medicine, 2016). That\'s insane. And the answer isn\'t working harder or staying later — it\'s fundamentally redesigning how you work. The leverage is in the system, not in your effort.',
      bottleneck:'Most physicians try to get faster at individual tasks when the real win is in workflow architecture. You don\'t need a better to-do list — you need a system that eliminates, automates, or batches the tasks that drain your energy without producing proportional value. Think about it: how much of your day is spent on things that don\'t actually require a physician?',
      plan:['Do a 5-day time audit — track every 30-minute block. The gap between where you think your time goes and where it actually goes will surprise you. I guarantee it.','Identify your top 3 time drains. For most physicians, it\'s documentation, inbox management, and context-switching between clinical and administrative work.','Implement time-blocking: protect dedicated blocks for deep work (research, reading, career development) like you would a procedure. If it\'s not on your calendar, it doesn\'t exist.','Batch similar administrative tasks into 2-3 dedicated windows per day instead of handling them in real-time. Every context switch costs you 15-25 minutes of cognitive recovery.','Create templates and macros for recurring documentation. Every note you write from scratch that could be templated is wasted cognitive energy. This is low-hanging fruit.'],
      mistakes:['Trying to optimize before auditing — you can\'t improve what you haven\'t measured. Start with data, not assumptions.','Multitasking — I know everyone thinks they\'re good at it. Cognitive science consistently shows it reduces both quality and speed (Monsell, 2003). You\'re not the exception.','Not protecting deep work time — if your calendar doesn\'t reflect your actual priorities, other people\'s priorities will fill it. Every time.','Saying yes to low-leverage commitments out of guilt or obligation — every yes to something unimportant is a no to something that matters for your career'],
      action:'Week 1: Complete a 5-day time audit (use a simple spreadsheet, nothing fancy). Week 2: Identify your top 3 time drains and design specific solutions for each. Week 3: Implement your time-blocking system. Week 4: Create at least 3 documentation templates for your most common note types.',
      refs:'Sinsky C, et al. "Allocation of Physician Time in Ambulatory Practice." Annals of Internal Medicine. 2016;165(11):753-760. • Monsell S. "Task Switching." Trends in Cognitive Sciences. 2003;7(3):134-140. • Newport C. "Deep Work: Rules for Focused Success in a Distracted World." 2016.',
      escalate:false,ereason:'Productivity systems are well-structured by frameworks. Physician review available if you need help designing a system specific to your clinical role.'},
    wellness:{
      diag:'I\'m going to tell you something that took me years to fully accept: burnout isn\'t a personal failure. It affects roughly 44% of practicing physicians (Shanafelt et al., Mayo Clin Proc, 2022), and the primary drivers are systemic — not a lack of resilience or yoga. At the '+level+' level, dealing with this proactively isn\'t just self-care — it\'s a professional necessity for career longevity. You can\'t take care of patients if you\'re running on empty.',
      bottleneck:'Here\'s what frustrates me about how institutions address burnout: they tell you to meditate and build resilience while the root causes — unsustainable workload, loss of autonomy, moral injury from administrative burden, and professional isolation — go completely unaddressed. Treating burnout with a wellness seminar while ignoring these drivers is like treating hypertension with reassurance. You need to address the actual cause.',
      plan:['First, get specific about YOUR burnout drivers. Use the Maslach Burnout Inventory dimensions: emotional exhaustion, depersonalization, reduced personal accomplishment. Which domain is hitting hardest? The treatment is different for each.','Protect one non-negotiable personal activity per week — not "if I have time," but actually blocked on your calendar. Research shows that maintaining even one meaningful non-work commitment significantly reduces burnout risk.','Build or maintain a peer support network. Regular honest conversation with 2-3 colleagues who actually understand your experience provides both perspective and validation. This isn\'t optional — isolation is the most dangerous symptom.','Set explicit boundaries on low-impact professional obligations. Not every committee needs you. Not every optional meeting deserves your evening. Learn to say no to things that drain your energy without advancing your mission.','If you\'re consistently experiencing emotional exhaustion or depersonalization, please seek confidential professional support. Physician assistance programs are free and truly confidential. There\'s no shame in this — it\'s the smart move.'],
      mistakes:['Pushing through and hoping it resolves — burnout doesn\'t get better with willpower. It escalates. Every time.','Isolating from colleagues and support — this is the most dangerous response and unfortunately the most common one I see','Making major career decisions while actively burned out — your judgment is compromised. Stabilize first, then decide. I\'ve watched people quit jobs they actually loved because they made decisions in crisis mode.','Comparing your internal experience to everyone else\'s external presentation — every colleague who "seems fine" is managing their own version of this. I promise you.'],
      action:'This week: Write down your top 2 burnout drivers — be brutally specific. This weekend: Do one thing purely for yourself, no guilt attached. Next week: Have an honest conversation with one trusted colleague about how you\'re really doing. Within 30 days: If symptoms persist, reach out to your institution\'s physician wellness program or a therapist who works with physicians.',
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
  const hasPubsField=p.stage==='student'||p.stage==='resident'||p.stage==='fellow';
  const hasLeadField=p.stage==='student';
  // Calculate competitiveness score (0-100)
  let score=50;
  const pubs=parseInt(p.pubs)||0;
  const lead=parseInt(p.lead)||0;
  if(hasPubsField){if(pubs>=3)score+=15;else if(pubs>=1)score+=8}
  if(hasLeadField){if(lead>=2)score+=10;else if(lead>=1)score+=5}
  if(p.spec&&p.spec!=='Undecided')score+=5;
  if(p.goal)score+=5;
  if(p.score1){const s=parseInt(p.score1);if(s>=250)score+=15;else if(s>=240)score+=10;else if(s>=230)score+=5}
  if(p.score2){const s=parseInt(p.score2);if(s>=260)score+=15;else if(s>=250)score+=10;else if(s>=240)score+=5}
  if(p.comp){score+=10}
  if(p.practice){score+=5}
  score=Math.min(95,Math.max(20,score));
  // Score color
  const sc=score>=70?'var(--green)':score>=45?'var(--accent)':'var(--red)';
  const sl=score>=70?'Strong':score>=45?'Developing':'Needs Focus';
  // Gaps
  let gaps=[],strengths=[];
  if(hasPubsField){
    if(pubs<2)gaps.push({label:'Research Output',val:pubs<1?20:45,note:'Aim for 2+ publications before application'});
    else strengths.push({label:'Research Output',val:Math.min(85,40+pubs*15),note:pubs+' publications — solid foundation'});
  }
  if(hasLeadField){
    if(lead<1)gaps.push({label:'Leadership',val:15,note:'One meaningful leadership role changes your narrative'});
    else strengths.push({label:'Leadership',val:Math.min(80,30+lead*20),note:lead+' role(s) — demonstrates initiative'});
  }
  if(!p.spec||p.spec==='Undecided')gaps.push({label:'Specialty Clarity',val:25,note:'Narrowing focus allows targeted positioning'});
  else strengths.push({label:'Specialty Clarity',val:70,note:p.spec+' — clear direction'});
  if(!p.goal)gaps.push({label:'Strategic Goal',val:20,note:'Define a specific 12-month objective'});
  else strengths.push({label:'Strategic Goal',val:65,note:'Goal identified — framework can optimize execution'});
  if(p.stage==='attending'){
    if(p.comp)strengths.push({label:'Compensation Baseline',val:70,note:'Baseline documented — enables benchmarking and negotiation'});
    else gaps.push({label:'Compensation Baseline',val:30,note:'Knowing your market value is the first step to optimizing it'});
    if(p.practice)strengths.push({label:'Practice Model',val:65,note:p.practice+' — clear practice context'});
    else gaps.push({label:'Practice Model',val:25,note:'Understanding your practice model affects every financial decision'});
    if(p.debt)strengths.push({label:'Loan Awareness',val:60,note:'Loan balance documented — enables strategic repayment planning'});
    else gaps.push({label:'Loan Strategy',val:30,note:'Every month without a loan strategy has compounding cost'});
  }
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
  if(hasPubsField&&pubs<2)h+='<p>• Low research output limits competitiveness for selective programs</p>';
  if(!p.goal)h+='<p>• No defined strategic goal — decisions without direction lead to drift</p>';
  if(p.stage==='attending'&&!p.debt)h+='<p>• Loan strategy undefined — every month of delay has compounding cost</p>';
  if(p.stage==='attending'&&!p.comp)h+='<p>• Compensation baseline unknown — you can\'t negotiate what you can\'t benchmark</p>';
  if(p.stage==='fellow'&&hasPubsField&&pubs<3)h+='<p>• Below median publication count for competitive fellowship tracks</p>';
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
  // Also create in Supabase
  if(_supaClient){_supaClient.auth.signUp({email:p.email.toLowerCase(),password:p.pass,options:{data:{name:p.name}}}).catch(()=>{})}
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
