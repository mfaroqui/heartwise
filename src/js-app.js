// ===== TOPBAR SCROLL EFFECT =====
(function(){
  const lp=document.getElementById('pg-landing');
  const tb=document.getElementById('topbar');
  if(lp&&tb){
    function updateTopbar(scrollY){
      tb.classList.toggle('solid',scrollY>60);
      var heroEl=document.querySelector('.hero-lux');
      if(heroEl){
        var heroH=heroEl.offsetHeight;
        tb.classList.toggle('on-light',scrollY<heroH-80);
      }
    }
    lp.addEventListener('scroll',function(){updateTopbar(lp.scrollTop)});
    window.addEventListener('scroll',function(){updateTopbar(window.scrollY)});
    updateTopbar(0);
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
var _lastPage='';var _lastScr='';var _skipPush=false;
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
  if(!_skipPush&&id!==_lastPage){history.pushState({page:id},'',null);_lastPage=id}
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
  if(scr==='scr-admin'){if(_supaClient){loadAdminDataFromSupabase(curAdminTab)}else{renderAdmin()}}
  if(scr==='scr-ask')updateAskScreen();
  if(scr==='scr-profile')renderProfile();
  // Close any open modals
  var modal=document.getElementById('modal-q');if(modal&&!modal.classList.contains('hidden')){modal.classList.add('hidden')}
  if(!_skipPush&&scr!==_lastScr){history.pushState({page:'main-app',scr:scr},'',null);_lastScr=scr}
}

window.addEventListener('popstate',function(e){
  // Close modal first if open
  var modal=document.getElementById('modal-q');
  if(modal&&!modal.classList.contains('hidden')){modal.classList.add('hidden');return}
  _skipPush=true;
  if(e.state&&e.state.scr){
    go('main-app');navTo(e.state.scr);_lastScr=e.state.scr;_lastPage='main-app';
  }else if(e.state&&e.state.page){
    go(e.state.page);_lastPage=e.state.page;
  }else{
    // Default: if logged in go home, else landing
    if(U){go('main-app');navTo('scr-home');_lastPage='main-app';_lastScr='scr-home'}
    else{go('pg-landing');_lastPage='pg-landing'}
  }
  _skipPush=false;
});

// Push state when modal opens so back button closes it
(function(){
  var modal=document.getElementById('modal-q');
  if(!modal)return;
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.attributeName==='class'&&!modal.classList.contains('hidden')){
        history.pushState({modal:true},'',null);
      }
    });
  });
  obs.observe(modal,{attributes:true});
})();

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
          const isAdmin=email===AE.toLowerCase();
          user={id:isAdmin?'admin':'u'+DB.nextUserId++,name:sbUser.user_metadata?.name||email.split('@')[0],email,pass:'__supabase__',role:isAdmin?'admin':'student',tier:isAdmin?'admin':'free',institution:'',usage:{ai:0,credits:isAdmin?999:0,month:new Date().getMonth()}};
          DB.users.push(user);saveDB();
        }
        // Ensure admin tier is always set for admin email
        if(email===AE.toLowerCase()&&user.tier!=='admin'){user.tier='admin';user.role='admin';saveDB()}
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
  // Ensure admin tier
  if(email===AE.toLowerCase()&&user.tier!=='admin'){user.tier='admin';user.role='admin';saveDB()}
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
  // Check trial expiration
  if(U.isTrial&&U.trialEnd){
    const now=new Date();const end=new Date(U.trialEnd);
    if(now>=end){
      U.tier='free';U.isTrial=false;
      const u=DB.users.find(u=>u.id===U.id);if(u){u.tier='free';u.isTrial=false}
      saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
      notify('Your trial has ended. Upgrade to keep full access.',1);
    }
  }
  const b=document.getElementById('user-badge');
  const bc={free:'b-free',core:'b-core',elite:'b-pro',admin:'b-admin'};
  b.className='badge '+(bc[U.tier]||'b-free');
  b.textContent=U.tier==='admin'?'MENTOR':TIERS[U.tier]?.name?.toUpperCase()||'FREE';
  document.getElementById('welcome-msg').textContent='Welcome, Dr. '+U.name.split(' ').pop();
  document.getElementById('nav-admin').style.display=U.tier==='admin'?'':'none';
  document.getElementById('upgrade-prompt').style.display=U.tier==='free'?'':'none';
  // Check for pending plan from landing page
  const pendingPlan=sessionStorage.getItem('hw_pending_plan');
  if(pendingPlan){
    sessionStorage.removeItem('hw_pending_plan');
    setTimeout(()=>subPlan(pendingPlan),500);
  }
  // Start trial countdown if active
  if(U.isTrial&&U.trialEnd)startTrialCountdown();
  renderHome();
  navTo('scr-home');
  // Check for unread notifications
  checkNotifBadge();
}

// ===== RENDER HOME =====
// ===== DAILY QUOTES =====
const _dailyQuotes=[
  {text:"The best time to plant a tree was 20 years ago. The second best time is now.",author:"Chinese Proverb"},
  {text:"Medicine is not only a science; it is also an art. It does not consist of compounding pills and plasters; it deals with the very processes of life.",author:"Paracelsus"},
  {text:"Success is not final, failure is not fatal: it is the courage to continue that counts.",author:"Winston Churchill"},
  {text:"The physician must be able to tell the antecedents, know the present, and foretell the future.",author:"Hippocrates"},
  {text:"Your career is a marathon, not a sprint. The decisions you make in training compound for decades.",author:"HeartWise"},
  {text:"Don't let the noise of others' opinions drown out your own inner voice.",author:"Steve Jobs"},
  {text:"Wherever the art of medicine is loved, there is also a love of humanity.",author:"Hippocrates"},
  {text:"The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",author:"Steve Jobs"},
  {text:"Strategy without execution is a daydream. Execution without strategy is a nightmare.",author:"Japanese Proverb"},
  {text:"It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.",author:"Charles Darwin"},
  {text:"In the middle of difficulty lies opportunity.",author:"Albert Einstein"},
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain"},
  {text:"Every expert was once a beginner. Every attending was once an intern who didn't know where the supply closet was.",author:"HeartWise"},
  {text:"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",author:"Albert Einstein"},
  {text:"The best investment you can make is in yourself.",author:"Warren Buffett"},
  {text:"Do not go where the path may lead, go instead where there is no path and leave a trail.",author:"Ralph Waldo Emerson"},
  {text:"Clarity precedes success. Know where you're going before you optimize how to get there.",author:"HeartWise"},
  {text:"The greatest wealth is health.",author:"Virgil"},
  {text:"What lies behind us and what lies before us are tiny matters compared to what lies within us.",author:"Ralph Waldo Emerson"},
  {text:"You are never too old to set another goal or to dream a new dream.",author:"C.S. Lewis"},
  {text:"The future belongs to those who prepare for it today.",author:"Malcolm X"},
  {text:"A good physician treats the disease; a great physician treats the patient who has the disease.",author:"William Osler"},
  {text:"Don't compare your beginning to someone else's middle.",author:"Jon Acuff"},
  {text:"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will.",author:"Vince Lombardi"},
  {text:"Your network is your net worth — especially in medicine. Build relationships before you need them.",author:"HeartWise"},
  {text:"Excellence is not a singular act, but a habit. You are what you repeatedly do.",author:"Shaquille O'Neal (via Aristotle)"},
  {text:"The impediment to action advances action. What stands in the way becomes the way.",author:"Marcus Aurelius"},
  {text:"Financial freedom is available to those who learn about it and work for it.",author:"Robert Kiyosaki"},
  {text:"To study the phenomena of disease without books is to sail an uncharted sea, while to study books without patients is not to go to sea at all.",author:"William Osler"},
  {text:"Burnout is not a badge of honor. Protect your energy like you protect your patients.",author:"HeartWise"},
  {text:"The way to get started is to quit talking and begin doing.",author:"Walt Disney"}
];

function setDailyQuote(){
  var el=document.getElementById('quote-text');
  var auth=document.getElementById('quote-author');
  if(!el||!auth)return;
  // Use day of year as index so it changes daily
  var now=new Date();
  var start=new Date(now.getFullYear(),0,0);
  var dayOfYear=Math.floor((now-start)/86400000);
  var q=_dailyQuotes[dayOfYear%_dailyQuotes.length];
  el.textContent='"'+q.text+'"';
  auth.textContent='— '+q.author;
}

// ===== TRIAL COUNTDOWN =====
var _trialInterval=null;
function startTrialCountdown(){
  if(_trialInterval)clearInterval(_trialInterval);
  updateTrialBanner();
  _trialInterval=setInterval(updateTrialBanner,60000); // update every minute
}
function updateTrialBanner(){
  var el=document.getElementById('trial-countdown-banner');
  if(!el||!U||!U.isTrial||!U.trialEnd)return;
  var now=new Date();var end=new Date(U.trialEnd);
  var diff=end-now;
  if(diff<=0){
    // Trial expired
    U.tier='free';U.isTrial=false;
    var u=DB.users.find(function(u){return u.id===U.id});if(u){u.tier='free';u.isTrial=false}
    saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
    el.innerHTML='<div style="display:flex;align-items:center;gap:12px"><span style="font-size:18px">⏰</span><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--red)">Your trial has ended</div><div style="font-size:11px;color:var(--text2);margin-top:2px">Subscribe now to keep full access to every tool.</div></div><button class="btn btn-a btn-sm" onclick="navTo(\'scr-profile\');showUpgrade()" style="flex-shrink:0;width:auto">Subscribe →</button></div>';
    if(_trialInterval){clearInterval(_trialInterval);_trialInterval=null}
    enterApp();
    return;
  }
  var hours=Math.floor(diff/3600000);
  var mins=Math.floor((diff%3600000)/60000);
  var urgency=hours<6?'var(--red)':hours<12?'var(--accent)':'var(--green)';
  var urgencyBg=hours<6?'var(--red-dim)':hours<12?'var(--accent-dim)':'var(--green-dim)';
  var urgencyBorder=hours<6?'rgba(196,77,86,.2)':hours<12?'rgba(200,168,124,.2)':'rgba(139,184,160,.2)';
  el.style.background=urgencyBg;
  el.style.borderColor=urgencyBorder;
  el.innerHTML='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:18px">⚡</span><div style="flex:1;min-width:180px"><div style="font-size:13px;font-weight:600;color:'+urgency+'">Full Access Trial — '+hours+'h '+mins+'m remaining</div><div style="font-size:11px;color:var(--text2);margin-top:2px">Every tool unlocked. Explore everything before time runs out.</div></div><button class="btn btn-a btn-sm" onclick="navTo(\'scr-profile\');showUpgrade()" style="flex-shrink:0;width:auto;padding:8px 18px">Keep Access →</button></div>';
}

function renderHome(){
  if(!U)return;
  setDailyQuote();
  const t=TIERS[U.tier]||TIERS.free;
  const used=U.usage?.ai||0;const max=t.ai;
  const pct=max===999?0:Math.min(100,Math.round(used/max*100));
  document.getElementById('usage-ai').textContent=max===999?used+' / \u221e':used+' / '+max;
  document.getElementById('usage-bar').style.width=max===999?'0%':pct+'%';
  document.getElementById('usage-credits').textContent=U.usage?.credits||0;
  document.getElementById('usage-tier').textContent=t.name+(U.isTrial?' (trial)':' plan');
  // Show/hide trial elements
  var trialBanner=document.getElementById('trial-countdown-banner');
  var trialNote=document.getElementById('trial-review-note');
  if(trialBanner)trialBanner.style.display=U.isTrial&&U.trialEnd?'':'none';
  if(trialNote)trialNote.style.display=U.isTrial?'':'none';
  if(U.isTrial&&U.trialEnd)updateTrialBanner();
  // Reviewed This Week = reviewed in last 7 days (or latest 5 if none recent)
  const now=new Date();const weekAgo=new Date(now);weekAgo.setDate(weekAgo.getDate()-7);const weekStr=weekAgo.toISOString().split('T')[0];
  let reviewed=DB.questions.filter(q=>q.status==='reviewed'&&q.reviewNote).sort((a,b)=>b.date.localeCompare(a.date));
  const thisWeek=reviewed.filter(q=>(q.reviewDate||q.date)>=weekStr);
  const featured=thisWeek.length>=3?thisWeek.slice(0,5):reviewed.slice(0,5);
  document.getElementById('home-feed').innerHTML=featured.length?featured.map(renderQCard).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)"><p>No reviewed questions yet.</p></div>';
  // Animate How It Works steps on scroll
  setTimeout(function(){
    var steps=document.querySelectorAll('.hiw-step');
    if(!steps.length)return;
    if('IntersectionObserver' in window){
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
      },{threshold:0.2});
      steps.forEach(function(s){obs.observe(s)});
    }else{
      steps.forEach(function(s){s.classList.add('visible')});
    }
  },100);
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
  if(U.isTrial){notify('Physician reviews are available with paid plans. Explore all tools now — subscribe to unlock direct physician access.',1);return}
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
  const q={id:DB.nextId++,userId:U.id,userEmail:U.email,cat,role:U.role||'student',q:fullQ,author:anon?'Anonymous':U.name,anon,date:new Date().toISOString().split('T')[0],status:wantsReview?'pending':'answered',ai:aiResp,wantsReview};
  if(wantsReview&&U.usage.credits>0)U.usage.credits--;
  U.usage.ai++;
  DB.questions.push(q);saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
  // Sync to Supabase
  if(_supaClient){
    _supaClient.from('questions').insert([{
      user_id:U.id,user_email:U.email,author:anon?'Anonymous':U.name,
      role:U.role||'student',cat:cat,question:fullQ,
      ai_response:aiResp,status:wantsReview?'pending':'answered',
      wants_review:wantsReview,anon:anon
    }]).then(function(res){if(res.error)console.warn('Question sync error',res.error)});
  }
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

// ===== FELLOWSHIP POSITIONING ROADMAP (v6) =====
var FPR_PHASES=[
  {id:'p1',label:'18-24 Months Before Match',icon:'\ud83c\udfaf',items:[
    {id:'t1',text:'Identify target subspecialty with conviction'},
    {id:'t2',text:'Start first research project (aim for first-author)'},
    {id:'t3',text:'Build relationships with 3-4 potential letter writers'},
    {id:'t4',text:'Attend first subspecialty national conference'},
    {id:'t5',text:'Join relevant subspecialty society (ACC, AGA, CHEST, etc.)'},
    {id:'t6',text:'Shadow faculty in your target specialty at your institution'}
  ]},
  {id:'p2',label:'12-18 Months Before',icon:'\ud83d\udcdd',items:[
    {id:'t7',text:'Submit first abstract to national conference'},
    {id:'t8',text:'Get informal feedback on application competitiveness'},
    {id:'t9',text:'Build initial program list (15-20 programs, tiered)'},
    {id:'t10',text:'Take on a leadership role (chief, committee, QI lead)'},
    {id:'t11',text:'Start second research project or case series'},
    {id:'t12',text:'Begin networking with fellows at target programs'}
  ]},
  {id:'p3',label:'6-12 Months Before',icon:'\ud83c\udfe5',items:[
    {id:'t13',text:'Complete away rotation #1 at a target program'},
    {id:'t14',text:'Complete away rotation #2 (if applicable)'},
    {id:'t15',text:'Formally ask letter writers (give them 8+ weeks)'},
    {id:'t16',text:'Submit or have manuscript in final revision'},
    {id:'t17',text:'Draft personal statement (first version)'},
    {id:'t18',text:'Finalize program list based on away rotation intel'}
  ]},
  {id:'p4',label:'3-6 Months Before',icon:'\u270d\ufe0f',items:[
    {id:'t19',text:'Finalize personal statement (5+ drafts minimum)'},
    {id:'t20',text:'Confirm all letters are submitted'},
    {id:'t21',text:'Research each program specifically (recent pubs, faculty interests)'},
    {id:'t22',text:'Practice interview questions with attendings'},
    {id:'t23',text:'ERAS application submitted'},
    {id:'t24',text:'Prepare 2-3 specific questions for each program interview'}
  ]},
  {id:'p5',label:'0-3 Months Before Match',icon:'\ud83c\udfc1',items:[
    {id:'t25',text:'Send thank-you emails within 24 hours of each interview'},
    {id:'t26',text:'Track interview impressions immediately after each one'},
    {id:'t27',text:'Schedule second-look visits at top 2-3 programs'},
    {id:'t28',text:'Build rank list based on fit, not just reputation'},
    {id:'t29',text:'Get input from trusted mentors on rank list'},
    {id:'t30',text:'Submit final rank list before deadline'}
  ]}
];

var FPR_MOCK_QUESTIONS={
  cardiology:[
    {q:'Tell me about a complex cardiac case that challenged your clinical reasoning.',type:'clinical',tip:'Use a specific patient. Walk through your differential, workup, and what you learned. PDs want to see how you think, not just what you know.'},
    {q:'What area of cardiology research are you most passionate about and why?',type:'research',tip:'Connect your research to a real clinical problem. Show trajectory \u2014 where you\u2019ve been, where you\u2019re going.'},
    {q:'How do you handle disagreements with supervising attendings about patient management?',type:'behavioral',tip:'Give a real example. Show diplomacy AND backbone. They want fellows who can push back respectfully when patient safety is at stake.'},
    {q:'Where do you see yourself 10 years after fellowship?',type:'career',tip:'Be specific but realistic. Academic vs private? Interventional vs imaging? Show you\u2019ve thought about this \u2014 vague answers signal you\u2019re applying without conviction.'},
    {q:'A 55-year-old presents with chest pain, troponin positive, and new ST depressions in V4-V6. Walk me through your approach.',type:'clinical',tip:'This tests your algorithm AND your clinical judgment. Don\u2019t just recite guidelines \u2014 discuss nuances like timing of cath, anticoagulation considerations, and what would make you deviate from standard protocol.'},
    {q:'What would you do if you witnessed a co-fellow making a medical error?',type:'behavioral',tip:'Balance is key: patient safety first, then direct communication with the co-fellow, then escalation if needed. They\u2019re testing your professionalism and courage.'},
    {q:'Why our program specifically?',type:'fit',tip:'This is where your research pays off. Reference specific faculty, recent publications, unique rotations, or program structure. Generic answers are an immediate red flag.'},
    {q:'Describe your experience with cardiac catheterization. How many cases have you been involved in?',type:'clinical',tip:'Be honest about numbers. If your exposure is limited, show enthusiasm and a plan to build skills. Overstating experience is career-ending if caught.'}
  ],
  interventional:[
    {q:'Walk me through your approach to a patient with a chronic total occlusion. When do you intervene vs. manage medically?',type:'clinical',tip:'This tests nuance. Discuss viability assessment, symptom burden, operator experience, and shared decision-making. Not every CTO needs opening.'},
    {q:'What\u2019s your experience with structural heart procedures? Where do you see the field going?',type:'research',tip:'TAVR, MitraClip, LAAO \u2014 show you follow the trials and understand which patients benefit. Bonus points for mentioning ongoing trials by name.'},
    {q:'Tell me about a complication you\u2019ve managed or witnessed in the cath lab.',type:'clinical',tip:'Complications happen. They want to see composure, systematic response, and learning \u2014 not that you\u2019ve never seen one.'},
    {q:'How do you balance volume/efficiency with teaching in a busy cath lab?',type:'behavioral',tip:'Show that you value both. Reference specific teaching moments and how you\u2019ve created efficiency without compromising education.'},
    {q:'Why interventional cardiology over other subspecialties?',type:'fit',tip:'Go beyond "I like procedures." Talk about the specific intellectual challenges, the immediate impact on patients, and the evolving technology.'},
    {q:'Describe a situation where you had to advocate for a patient against the recommendations of a more senior physician.',type:'behavioral',tip:'This happens in IC \u2014 the senior wants to intervene, you think medical management is right (or vice versa). Show you can advocate with data and respect.'}
  ],
  electrophysiology:[
    {q:'Explain your approach to a patient with recurrent syncope and a structurally normal heart.',type:'clinical',tip:'Systematic workup: Holter/event monitor, tilt table, EP study indications. Show you can risk-stratify and avoid unnecessary invasive testing.'},
    {q:'What interests you about catheter ablation technology and where do you see it evolving?',type:'research',tip:'Discuss PFA vs RF vs cryo. Reference recent trials (ADVENT, MANIFEST-PF). Show you understand the limitations, not just the hype.'},
    {q:'How do you explain the risks and benefits of an ICD to a patient who is hesitant?',type:'behavioral',tip:'Shared decision-making in action. Show empathy, clear communication without jargon, and respect for patient autonomy \u2014 even if you disagree with their choice.'},
    {q:'Walk me through the interpretation of this EP study showing dual AV nodal physiology.',type:'clinical',tip:'Describe AH jump, echo beats, and the decision to proceed with ablation. Show you understand the electrophysiology, not just the button-pushing.'},
    {q:'Why EP over interventional or imaging?',type:'fit',tip:'EP attracts a specific personality \u2014 systematic thinkers who love puzzles and technology. Be authentic about what drew you in.'},
    {q:'Describe your experience managing device complications.',type:'clinical',tip:'Lead dislodgement, pocket infection, inappropriate shocks \u2014 show you\u2019ve seen the full spectrum and know when to escalate.'}
  ],
  gi:[
    {q:'A 45-year-old presents with acute upper GI bleeding. Walk me through your management.',type:'clinical',tip:'Resuscitation first, then risk stratification (Glasgow-Blatchford), timing of endoscopy, and post-procedure management. Show you think systematically.'},
    {q:'What area of GI are you most interested in pursuing after fellowship?',type:'career',tip:'Advanced endoscopy, hepatology, IBD, motility \u2014 show you\u2019ve explored the options and have early conviction.'},
    {q:'Tell me about a challenging endoscopic procedure you\u2019ve observed or assisted with.',type:'clinical',tip:'Describe the complexity, the decision-making, and what you learned. Show respect for the difficulty and honesty about your current skill level.'},
    {q:'How would you handle a patient who is non-compliant with their IBD medications and presents with a flare?',type:'behavioral',tip:'Explore why they\u2019re non-compliant before judging. Cost? Side effects? Misunderstanding? This tests your patient-centeredness.'},
    {q:'Discuss a recent advance in GI that excites you.',type:'research',tip:'AI-assisted polyp detection, third-space endoscopy, FMT for C. diff \u2014 pick something you\u2019ve actually read about and can discuss intelligently.'},
    {q:'Why GI over other IM subspecialties?',type:'fit',tip:'The combination of procedures and longitudinal patient relationships is unique. Be specific about what that means to you personally.'}
  ],
  pulm_crit:[
    {q:'Describe your approach to managing a patient with severe ARDS on the ventilator.',type:'clinical',tip:'ARDSNet protocol, prone positioning, PEEP titration, neuromuscular blockade. But also discuss the human side \u2014 family communication, goals of care.'},
    {q:'How do you approach ventilator liberation in a patient who has failed multiple SBTs?',type:'clinical',tip:'Systematic assessment of failure causes: cardiac, diaphragmatic weakness, secretions, anxiety. Show you don\u2019t just retry the same thing.'},
    {q:'Tell me about a goals-of-care conversation that was particularly challenging.',type:'behavioral',tip:'ICU medicine is full of these. Show empathy, clarity, and comfort with uncertainty. The best answers include what you learned about yourself.'},
    {q:'What research in pulmonary or critical care are you most interested in pursuing?',type:'research',tip:'ARDS phenotyping, ECMO utilization, ICU survivorship, lung cancer screening \u2014 show depth in one area rather than surface across many.'},
    {q:'How do you manage disagreements about code status between family members?',type:'behavioral',tip:'Family meetings, identifying the decision-maker, exploring values rather than medical details. Show you can navigate family dynamics under pressure.'},
    {q:'Why pulm/crit over hospitalist medicine or other subspecialties?',type:'fit',tip:'The intensity, the procedures, the immediate impact \u2014 but also the longitudinal pulmonary clinic. Show you want both sides.'}
  ],
  hemonc:[
    {q:'How do you approach breaking bad news to a patient about a new cancer diagnosis?',type:'behavioral',tip:'SPIKES framework is a start, but show that you\u2019ve done this and know it\u2019s never formulaic. Each patient processes differently.'},
    {q:'Discuss a recent immunotherapy trial that has changed clinical practice.',type:'research',tip:'Pick a specific trial (CheckMate, KEYNOTE series). Show you understand the mechanism, the population, and the limitations.'},
    {q:'A patient with metastatic disease wants to pursue aggressive treatment despite poor performance status. How do you counsel them?',type:'clinical',tip:'This tests your ability to be honest without being paternalistic. Discuss realistic expectations, toxicity, and what matters to the patient.'},
    {q:'Where do you see yourself in hematology vs. oncology, or both?',type:'career',tip:'Many programs want to know if you\u2019ll pursue both or sub-specialize further. Be honest about your trajectory.'},
    {q:'How do you manage your own emotional well-being given the nature of oncology?',type:'behavioral',tip:'Burnout is real in this field. Showing self-awareness about coping strategies demonstrates maturity, not weakness.'},
    {q:'Why heme/onc?',type:'fit',tip:'The therapeutic revolution, the patient relationships, the science \u2014 but be authentic. They\u2019ve heard the generic version.'}
  ],
  other:[
    {q:'Tell me about a case that solidified your interest in this specialty.',type:'fit',tip:'Specific patient, specific moment. The best answers connect clinical experience to personal values.'},
    {q:'What research are you most proud of and why?',type:'research',tip:'Not your highest-impact publication, but the work that taught you the most. PDs can spot genuine passion.'},
    {q:'Describe a time you received constructive criticism. How did you respond?',type:'behavioral',tip:'Show growth, not defensiveness. The best fellows are coachable. Give a real example with a real outcome.'},
    {q:'How do you prioritize when you have competing clinical and academic demands?',type:'behavioral',tip:'Time management is critical in fellowship. Show a system, not just "I work hard." Real examples beat abstract strategies.'},
    {q:'Where do you see yourself practicing in 10 years?',type:'career',tip:'Academic vs community? Research-heavy vs clinical? Geographic preferences? Show you\u2019ve thought about the full picture.'},
    {q:'What questions do you have for us?',type:'fit',tip:'Have 3-5 specific questions ready. Ask about fellow autonomy, research mentorship, and recent changes to the program. Never ask about things you could have found on the website.'}
  ]
};
FPR_MOCK_QUESTIONS.rheum=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.endo=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.neph=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.id=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.allergy=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.sports=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.geri=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.pain=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.ortho=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.ctsx=FPR_MOCK_QUESTIONS.other;
FPR_MOCK_QUESTIONS.vasc=FPR_MOCK_QUESTIONS.other;

function fprGetProgress(){
  try{return JSON.parse(localStorage.getItem('fpr_progress')||'{}');}catch(e){return {};}
}
function fprSaveProgress(data){
  localStorage.setItem('fpr_progress',JSON.stringify(data));
}

function fprInit(){
  var spec=document.getElementById('fpr-spec').value;
  var months=document.getElementById('fpr-months').value;
  if(!spec||!months){document.getElementById('fpr-phases').innerHTML='';document.getElementById('fpr-mock').innerHTML='';document.getElementById('fpr-progress-wrap').style.display='none';return;}

  var progress=fprGetProgress();
  var monthsNum=parseInt(months);
  var phaseMonths=[24,18,12,6,3];
  var h='';

  FPR_PHASES.forEach(function(phase,pi){
    var phaseThreshold=phaseMonths[pi];
    var nextThreshold=phaseMonths[pi+1]||0;
    var isActive=monthsNum<=phaseThreshold&&monthsNum>nextThreshold;
    if(pi===FPR_PHASES.length-1&&monthsNum<=3) isActive=true;
    var isPast=monthsNum<=nextThreshold&&pi<FPR_PHASES.length-1;
    var isFuture=monthsNum>phaseThreshold;

    var borderColor=isActive?'var(--accent)':isPast?'var(--green)':'var(--border)';
    var opacity=isFuture?'0.5':'1';

    h+='<div style="margin-bottom:16px;padding:16px;border:1px solid '+borderColor+';border-radius:12px;opacity:'+opacity+';background:'+(isActive?'rgba(200,168,124,.03)':'var(--bg)')+';">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:6px">';
    h+='<div style="font-size:13px;font-weight:600;color:'+(isActive?'var(--accent)':isPast?'var(--green)':'var(--text3)')+'">'+phase.icon+' '+phase.label+'</div>';
    h+='<div style="display:flex;align-items:center;gap:6px">';

    var done=0;
    phase.items.forEach(function(item){if(progress[item.id])done++});
    if(done>0) h+='<span style="font-size:10px;color:'+(done===phase.items.length?'var(--green)':'var(--accent)')+';font-weight:600">'+done+'/'+phase.items.length+'</span>';
    if(isActive) h+='<span style="font-size:9px;padding:2px 8px;border-radius:100px;background:var(--accent);color:white;font-weight:600">CURRENT</span>';
    if(isPast&&done<phase.items.length) h+='<span style="font-size:9px;padding:2px 8px;border-radius:100px;background:rgba(239,68,68,.1);color:var(--red);font-weight:600">CATCH UP</span>';
    h+='</div></div>';

    phase.items.forEach(function(item){
      var checked=progress[item.id]?true:false;
      h+='<div onclick="fprToggle(\''+item.id+'\')" style="display:flex;align-items:flex-start;gap:10px;padding:8px 4px;cursor:pointer;border-bottom:1px solid var(--bg3)">';
      h+='<div style="min-width:20px;height:20px;border-radius:4px;border:2px solid '+(checked?'var(--green)':'var(--border)')+';background:'+(checked?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;margin-top:1px;flex-shrink:0">';
      if(checked) h+='<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" fill="none"/></svg>';
      h+='</div>';
      h+='<span style="font-size:12px;color:'+(checked?'var(--text3)':'var(--text2)')+';line-height:1.5;'+(checked?'text-decoration:line-through;':'')+'">'+item.text+'</span>';
      h+='</div>';
    });
    h+='</div>';
  });

  document.getElementById('fpr-phases').innerHTML=h;
  document.getElementById('fpr-progress-wrap').style.display='block';
  fprUpdateBar();

  if(monthsNum<=3){fprShowMockInterview(spec)}else{document.getElementById('fpr-mock').innerHTML=''}
}

function fprToggle(itemId){
  var progress=fprGetProgress();
  if(progress[itemId]){delete progress[itemId]}else{progress[itemId]=Date.now()}
  fprSaveProgress(progress);
  fprInit();
}

function fprUpdateBar(){
  var progress=fprGetProgress();
  var total=0;var done=0;
  FPR_PHASES.forEach(function(phase){phase.items.forEach(function(item){total++;if(progress[item.id])done++})});
  var pct=total?Math.round(done/total*100):0;
  document.getElementById('fpr-pct').textContent=pct+'%';
  document.getElementById('fpr-bar').style.width=pct+'%';
  document.getElementById('fpr-bar').style.background=pct>=80?'var(--green)':'var(--accent)';
  document.getElementById('fpr-stat').textContent=done+' of '+total+' milestones completed';
}

function fprShowMockInterview(spec){
  var questions=FPR_MOCK_QUESTIONS[spec]||FPR_MOCK_QUESTIONS.other;
  var specNames={cardiology:'Cardiology',interventional:'Interventional Cardiology',electrophysiology:'Electrophysiology',gi:'Gastroenterology',pulm_crit:'Pulmonology/Critical Care',hemonc:'Hematology/Oncology',rheum:'Rheumatology',endo:'Endocrinology',neph:'Nephrology',id:'Infectious Disease',allergy:'Allergy/Immunology',sports:'Sports Medicine',geri:'Geriatrics',pain:'Pain Medicine',ortho:'Orthopedic Surgery',ctsx:'Cardiothoracic Surgery',vasc:'Vascular Surgery',other:'Your Specialty'};
  var specName=specNames[spec]||'Your Specialty';
  var shuffled=questions.slice().sort(function(){return 0.5-Math.random()});
  var selected=shuffled.slice(0,4);
  window._fprMockQuestions=questions;
  window._fprMockSpec=spec;

  var h='<div style="margin-top:24px;padding:20px;background:linear-gradient(160deg,rgba(200,168,124,.06),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.15);border-radius:12px">';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">';
  h+='<div style="font-size:24px">\ud83c\udf99\ufe0f</div>';
  h+='<div><div style="font-size:15px;font-weight:600;color:var(--accent);font-family:var(--font-serif)">Mock Interview: '+specName+'</div>';
  h+='<div style="font-size:11px;color:var(--text3)">Real questions asked by program directors. Practice these out loud.</div></div>';
  h+='</div>';
  h+=fprRenderMockCards(selected);
  h+='</div>';
  document.getElementById('fpr-mock').innerHTML=h;
}

function fprRenderMockCards(selected){
  var typeBadge={clinical:'\ud83e\ude7a Clinical',research:'\ud83d\udd2c Research',behavioral:'\ud83e\udde0 Behavioral',career:'\ud83c\udfaf Career',fit:'\ud83c\udfe5 Program Fit'};
  var typeColor={clinical:'#3B82F6',research:'var(--green)',behavioral:'var(--accent)',career:'#8B5CF6',fit:'#E67E22'};
  var h='';

  selected.forEach(function(q,i){
    h+='<div style="margin-bottom:14px;padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:10px">';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    h+='<span style="font-size:14px;font-weight:700;color:var(--accent)">Q'+(i+1)+'</span>';
    h+='<span style="font-size:9px;padding:2px 8px;border-radius:100px;background:rgba(0,0,0,.04);color:'+(typeColor[q.type]||'var(--text3)')+';font-weight:600;letter-spacing:.5px">'+(typeBadge[q.type]||q.type)+'</span>';
    h+='</div>';
    h+='<div style="font-size:13px;font-weight:500;color:var(--text);line-height:1.6;margin-bottom:10px">\u201c'+q.q+'\u201d</div>';
    h+='<details style="margin-top:4px"><summary style="font-size:11px;color:var(--accent);cursor:pointer;font-weight:600;user-select:none">\ud83d\udca1 Coaching Tip</summary>';
    h+='<div style="font-size:11px;color:var(--text2);line-height:1.7;margin-top:8px;padding:10px;background:var(--bg2);border-radius:6px">'+q.tip+'</div>';
    h+='</details>';
    h+='<details style="margin-top:8px"><summary style="font-size:11px;color:var(--text3);cursor:pointer;font-weight:500;user-select:none">\u270d\ufe0f Draft Your Answer</summary>';
    h+='<textarea placeholder="Write your answer here. Practice saying it out loud \u2014 aim for 60-90 seconds." style="width:100%;min-height:80px;margin-top:8px;font-size:12px;line-height:1.6;border:1px solid var(--border);border-radius:6px;padding:10px;resize:vertical;box-sizing:border-box;background:var(--bg)"></textarea>';
    h+='</details>';
    h+='</div>';
  });

  h+='<div style="display:flex;gap:10px;margin-top:16px">';
  h+='<button onclick="fprNewSet()" class="btn btn-g" style="flex:1;padding:10px;font-size:12px">\ud83d\udd00 New Question Set</button>';
  h+='<button onclick="fprShowAll()" class="btn btn-g" style="flex:1;padding:10px;font-size:12px">\ud83d\udccb All Questions</button>';
  h+='</div>';

  h+='<div style="margin-top:14px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:6px">\ud83c\udfaf Interview Prep Tips</div>';
  h+='<div style="font-size:11px;color:var(--text2);line-height:1.8">';
  h+='\u2022 Practice each answer out loud (aim for 60-90 seconds)<br>';
  h+='\u2022 Record yourself and watch it back \u2014 painful but effective<br>';
  h+='\u2022 Do at least 2 mock interviews with attendings before the real thing<br>';
  h+='\u2022 Prepare 3 specific questions per program (not things on their website)<br>';
  h+='\u2022 Have your 30-second career story ready \u2014 why this specialty, why now, where you\u2019re going';
  h+='</div></div>';

  return h;
}

function fprNewSet(){
  var spec=window._fprMockSpec||'other';
  fprShowMockInterview(spec);
}

function fprShowAll(){
  var questions=window._fprMockQuestions||FPR_MOCK_QUESTIONS.other;
  var spec=window._fprMockSpec||'other';
  var specNames={cardiology:'Cardiology',interventional:'Interventional Cardiology',electrophysiology:'Electrophysiology',gi:'Gastroenterology',pulm_crit:'Pulm/Crit',hemonc:'Heme/Onc',rheum:'Rheumatology',endo:'Endocrinology',neph:'Nephrology',id:'ID',allergy:'Allergy',sports:'Sports Med',geri:'Geriatrics',pain:'Pain',ortho:'Ortho',ctsx:'CT Surgery',vasc:'Vascular',other:'Fellowship'};
  var typeBadge={clinical:'\ud83e\ude7a Clinical',research:'\ud83d\udd2c Research',behavioral:'\ud83e\udde0 Behavioral',career:'\ud83c\udfaf Career',fit:'\ud83c\udfe5 Fit'};
  var typeColor={clinical:'#3B82F6',research:'var(--green)',behavioral:'var(--accent)',career:'#8B5CF6',fit:'#E67E22'};

  var h='<div style="margin-top:24px;padding:20px;background:var(--bg2);border:1px solid var(--border);border-radius:12px">';
  h+='<div style="font-size:14px;font-weight:600;color:var(--accent);margin-bottom:14px;font-family:var(--font-serif)">\ud83d\udccb All '+(specNames[spec]||'Fellowship')+' Interview Questions ('+questions.length+')</div>';
  questions.forEach(function(q,i){
    h+='<div style="padding:12px 0;border-bottom:1px solid var(--border)">';
    h+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:9px;padding:2px 6px;border-radius:100px;background:rgba(0,0,0,.04);color:'+(typeColor[q.type]||'var(--text3)')+';font-weight:600">'+(typeBadge[q.type]||q.type)+'</span></div>';
    h+='<div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:4px">\u201c'+q.q+'\u201d</div>';
    h+='<div style="font-size:10px;color:var(--text3);line-height:1.6">\ud83d\udca1 '+q.tip+'</div>';
    h+='</div>';
  });
  h+='<button onclick="fprShowMockInterview(\''+spec+'\')" class="btn btn-g" style="width:100%;margin-top:14px;padding:10px;font-size:12px">\u2190 Back to Mock Interview</button>';
  h+='</div>';
  document.getElementById('fpr-mock').innerHTML=h;
}

// ===== CONTRACT RISK SCORECARD (v2) =====
function crsVal(id){var el=document.getElementById(id);return el?el.value:'';}

function crsCalc(){
  var flags=[];  // {cat,severity:'red'|'yellow'|'green',text,detail,points}
  var maxPoints=0;
  var earnedPoints=0;
  var answered=0;
  var total=16; // total questions

  // Helper
  function score(id,cat,greenPts,mapping){
    // mapping: {value:{sev,pts,text,detail}}
    var v=crsVal(id);
    maxPoints+=greenPts;
    if(!v)return;
    answered++;
    var m=mapping[v];
    if(m){
      earnedPoints+=m.pts;
      flags.push({cat:cat,severity:m.sev,text:m.text,detail:m.detail||'',points:m.pts,max:greenPts});
    }
  }

  // 1. Compensation
  score('crs-comp-base','Compensation',10,{
    'yes':{sev:'green',pts:10,text:'Base salary clearly defined',detail:'This is what you want — a guaranteed floor regardless of volume.'},
    'partial':{sev:'yellow',pts:6,text:'Income guarantee is temporary',detail:'After the guarantee period ends, you\u2019re fully at risk. What\u2019s the fallback if volume is low? Get the post-guarantee formula in writing now.'},
    'no':{sev:'red',pts:2,text:'No guaranteed base — pure production from day 1',detail:'You\u2019re building a practice with zero safety net. Unless you\u2019re joining an established group with guaranteed referrals, this is high-risk. Most new attendings take 12-18 months to ramp up.'}
  });
  score('crs-comp-rvu','Compensation',10,{
    'yes':{sev:'green',pts:10,text:'Bonus formula clearly defined',detail:'You can model your actual income. Run the numbers through the RVU Calculator to verify.'},
    'partial':{sev:'yellow',pts:5,text:'Bonus structure is vague',detail:'If they can\u2019t define the formula before you sign, they can define it after — and it won\u2019t be in your favor. Get specific $/wRVU rate and threshold in the contract.'},
    'no':{sev:'red',pts:1,text:'No defined bonus formula',detail:'You have no way to predict your actual compensation. This is a negotiation point — don\u2019t leave it unresolved.'}
  });

  // 2. Non-compete
  score('crs-nc-radius','Non-Compete',10,{
    'none':{sev:'green',pts:10,text:'No non-compete clause',detail:'This is increasingly rare and extremely valuable. You have full career mobility.'},
    'small':{sev:'green',pts:8,text:'Non-compete \u2264 10 miles',detail:'Reasonable for most markets. You can likely find a position nearby if things don\u2019t work out.'},
    'medium':{sev:'yellow',pts:5,text:'Non-compete 11-20 miles',detail:'Manageable in urban areas, potentially restrictive in suburban/rural markets. Consider your commute tolerance and family situation.'},
    'large':{sev:'red',pts:3,text:'Non-compete 21-30 miles',detail:'This could force a full relocation if you leave. In a metro area this might cover the entire city. Negotiate this down aggressively.'},
    'extreme':{sev:'red',pts:0,text:'Non-compete 30+ miles',detail:'This is designed to make leaving extremely painful. You\u2019d likely have to move your family. This should be a dealbreaker unless the rest of the contract is exceptional.'}
  });
  score('crs-nc-dur','Non-Compete',8,{
    'none':{sev:'green',pts:8,text:'No duration restriction'},
    '1yr':{sev:'green',pts:7,text:'1-year non-compete',detail:'Standard and generally enforceable. One year is survivable.'},
    '2yr':{sev:'yellow',pts:4,text:'2-year non-compete',detail:'Two years is a long time to be locked out. Your referral network and patient relationships will erode. Push for 1 year.'},
    '3yr':{sev:'red',pts:1,text:'3+ year non-compete',detail:'Excessively punitive. Few courts enforce this length, but fighting it costs $20-50K in legal fees. Don\u2019t rely on unenforceability — negotiate it out.'}
  });
  score('crs-nc-term','Non-Compete',8,{
    'na':{sev:'green',pts:8,text:'No non-compete'},
    'waived':{sev:'green',pts:8,text:'Non-compete waived if terminated without cause',detail:'This is the fair standard. You shouldn\u2019t be penalized for their decision to let you go.'},
    'always':{sev:'red',pts:1,text:'Non-compete applies even if THEY fire you',detail:'This is one of the biggest red flags in physician contracts. They can fire you and simultaneously prevent you from working nearby. Negotiate this clause specifically — it\u2019s often the easiest to change because it\u2019s so obviously unfair.'}
  });

  // 3. Tail coverage
  score('crs-mal-type','Malpractice',6,{
    'occurrence':{sev:'green',pts:6,text:'Occurrence-based policy — no tail needed',detail:'Best case scenario. You\u2019re covered for incidents that happened during employment regardless of when the claim is filed.'},
    'claims':{sev:'yellow',pts:3,text:'Claims-made policy',detail:'You\u2019ll need tail coverage when you leave. The cost depends on your specialty and years of coverage — typically $20K-$80K. Make sure the contract addresses who pays.'},
    'unknown':{sev:'red',pts:1,text:'Policy type not specified',detail:'You need to know this before signing. If it\u2019s claims-made and you\u2019re responsible for tail, that\u2019s a five-figure hidden cost. Ask.'}
  });
  score('crs-tail-pay','Malpractice',10,{
    'na':{sev:'green',pts:10,text:'No tail needed (occurrence policy)'},
    'employer':{sev:'green',pts:10,text:'Employer pays tail coverage',detail:'This is worth $30-80K depending on specialty. It\u2019s real money and a significant contract benefit.'},
    'shared':{sev:'yellow',pts:5,text:'Shared tail cost',detail:'Get the exact split in writing. A 50/50 split on a $60K tail is still a $30K expense you need to budget for.'},
    'you':{sev:'red',pts:1,text:'You pay full tail coverage',detail:'Budget $30-80K for this. Many physicians don\u2019t realize this cost until they try to leave. It\u2019s essentially a financial anchor keeping you in the position. Negotiate employer-paid tail, especially for without-cause termination.'},
    'unknown':{sev:'red',pts:0,text:'Tail coverage not addressed in contract',detail:'This is a major omission. If the contract is silent on tail, you\u2019re almost certainly on the hook for it. Clarify this in writing before signing.'}
  });

  // 4. Termination
  score('crs-term-notice','Termination',8,{
    '180':{sev:'green',pts:8,text:'180-day notice period',detail:'Six months gives you real time to job search, relocate, and transition patients. This is physician-friendly.'},
    '90':{sev:'green',pts:6,text:'90-day notice period',detail:'Standard and workable. Three months is tight but manageable for a job search.'},
    '60':{sev:'yellow',pts:4,text:'60-day notice period',detail:'Two months is short to find a new position, especially with credentialing timelines. Try to negotiate 90 days.'},
    '30':{sev:'red',pts:1,text:'30-day notice or less',detail:'One month is not enough time to find a physician position, get credentialed, and transition patients. This gives the employer all the power. Push back hard.'}
  });
  score('crs-term-sev','Termination',6,{
    'yes':{sev:'green',pts:6,text:'Severance defined in writing',detail:'Knowing what you get if terminated without cause lets you plan. Typical physician severance is 3-6 months of base salary.'},
    'no':{sev:'red',pts:1,text:'No severance mentioned',detail:'If they can fire you with 30-90 days notice and zero severance, you have no financial cushion. Negotiate at least 3 months of base salary as severance for without-cause termination.'}
  });
  score('crs-term-cause','Termination',8,{
    'narrow':{sev:'green',pts:8,text:'"For cause" narrowly defined',detail:'Limited to objective, serious offenses. This protects you from being fired "for cause" (and losing severance/benefits) over subjective performance disputes.'},
    'broad':{sev:'red',pts:2,text:'"For cause" includes subjective criteria',detail:'If "cause" includes "failure to meet productivity standards" or "conduct detrimental to the practice," they can fire you for cause, deny severance, and potentially enforce the non-compete — all for not hitting a number. This is one of the most dangerous clauses in physician contracts.'},
    'unclear':{sev:'red',pts:1,text:'"For cause" not clearly defined',detail:'Ambiguity in termination provisions always favors the employer. Get specific language — if they won\u2019t define it, assume it\u2019s broad.'}
  });

  // 5. Benefits
  score('crs-ben-detail','Benefits',6,{
    'yes':{sev:'green',pts:6,text:'Benefits specified with amounts',detail:'You can model your true total compensation. This is how it should be done.'},
    'partial':{sev:'yellow',pts:3,text:'Benefits referenced but not detailed',detail:'\"Benefits available\" is meaningless without amounts. A 2% retirement match vs 6% is a $10-20K/year difference. Get the numbers.'},
    'no':{sev:'red',pts:1,text:'Benefits reference a separate handbook',detail:'Benefit handbooks can be changed unilaterally. If the retirement match, CME budget, or disability coverage matters to you, get the key numbers in the contract itself.'}
  });
  score('crs-ben-call','Benefits',6,{
    'na':{sev:'green',pts:6,text:'No call requirement'},
    'yes':{sev:'green',pts:6,text:'Call is compensated',detail:'Paid call is increasingly standard. Your time has value whether it\u2019s 2 AM or 2 PM.'},
    'partial':{sev:'yellow',pts:3,text:'Shared call pool, no extra pay',detail:'Uncompensated call is effectively a pay cut proportional to frequency. Calculate what your nights and weekends are actually worth.'},
    'no':{sev:'red',pts:1,text:'Uncompensated call',detail:'If you\u2019re taking 4-6 call nights per month with no additional compensation, that\u2019s potentially $20-40K/year in free labor. This is a clear negotiation point.'}
  });

  // 6. Signing bonus / loan clawback
  score('crs-sign-claw','Financial Traps',6,{
    'na':{sev:'green',pts:6,text:'No signing bonus (no clawback risk)'},
    'prorated':{sev:'green',pts:6,text:'Signing bonus clawback is pro-rated',detail:'Fair and standard. If you leave after 2 of 3 years, you repay 1/3. Reasonable.'},
    'full':{sev:'red',pts:1,text:'Full clawback of signing bonus',detail:'If you leave (or are fired without cause) in year 2 of 3, you repay the entire bonus. This is punitive and creates a golden handcuff. Negotiate pro-rated repayment at minimum.'}
  });
  score('crs-loan-claw','Financial Traps',6,{
    'na':{sev:'green',pts:6,text:'No loan repayment (no clawback risk)'},
    'prorated':{sev:'green',pts:6,text:'Loan repayment vests over time',detail:'Standard and fair. Make sure vesting starts immediately, not after a cliff period.'},
    'full':{sev:'red',pts:1,text:'Full loan repayment clawback',detail:'If they paid $100K toward your loans and you leave in year 2, you owe it all back. Combined with a non-compete, this makes leaving financially devastating. Negotiate pro-rated vesting.'}
  });

  // 7. Partnership
  score('crs-partner','Partnership',4,{
    'na':{sev:'green',pts:4,text:'Employed position (N/A)'},
    'no':{sev:'green',pts:4,text:'No partnership track (employed position)'},
    'defined':{sev:'green',pts:4,text:'Partnership terms defined in writing',detail:'Timeline, buy-in cost, and criteria are clear. Verify: what happens if you meet criteria but partnership is denied?'},
    'vague':{sev:'yellow',pts:2,text:'Partnership mentioned but not defined',detail:'\u201cEligible after X years\u201d means nothing without defined criteria, buy-in structure, and what \u201cpartner\u201d actually means in the operating agreement. People spend 3-5 years waiting for a partnership that never materializes. Get it in writing or treat this as an employed position.'}
  });

  // 8. Scope
  score('crs-scope','Scope & Duties',5,{
    'yes':{sev:'green',pts:5,text:'Clinical duties clearly defined',detail:'You know what you\u2019re signing up for. Changes require mutual agreement.'},
    'broad':{sev:'yellow',pts:2,text:'Duties vaguely defined',detail:'\u201cDuties as assigned\u201d gives them the ability to change your role, add administrative responsibilities, or shift you to less desirable work without renegotiating your contract.'}
  });
  score('crs-reassign','Scope & Duties',5,{
    'no':{sev:'green',pts:5,text:'Location and scope fixed in contract',detail:'You can\u2019t be moved to a satellite office 45 minutes away without your consent. This matters.'},
    'yes':{sev:'red',pts:1,text:'Employer can reassign location/duties unilaterally',detail:'You could sign up for a suburban practice and end up at a rural outpost. If location matters to your family, negotiate this out.'},
    'unclear':{sev:'yellow',pts:2,text:'Reassignment rights not addressed',detail:'Silence usually means they can. Add a clause fixing your primary practice location.'}
  });

  // Calculate score
  if(answered===0){
    document.getElementById('crs-score').textContent='\u2014';
    document.getElementById('crs-grade').textContent='Answer the questions above';
    document.getElementById('crs-grade').style.color='var(--text3)';
    document.getElementById('crs-bar').style.width='0%';
    document.getElementById('crs-bar').style.background='var(--border)';
    document.getElementById('crs-results').innerHTML='';
    return;
  }

  var pct=Math.round((earnedPoints/maxPoints)*100);

  // Grade
  var grade,gradeColor,gradeDetail;
  if(pct>=85){grade='LOW RISK';gradeColor='var(--green)';gradeDetail='This contract is well-structured with strong physician protections. Review the details below, but the fundamentals are solid.';}
  else if(pct>=70){grade='MODERATE RISK';gradeColor='var(--accent)';gradeDetail='Decent foundation but has specific areas that need attention before signing. Address the yellow and red flags below.';}
  else if(pct>=50){grade='ELEVATED RISK';gradeColor='#E67E22';gradeDetail='Multiple concerning provisions. Do not sign without addressing the red flags. Consider having a healthcare attorney review the full document ($2-3.5K — it\u2019s worth it).';}
  else{grade='HIGH RISK';gradeColor='var(--red)';gradeDetail='This contract has serious structural problems that could cost you tens of thousands of dollars or trap you in a bad situation. Get an attorney involved before proceeding.';}

  // Update score display
  document.getElementById('crs-score').textContent=pct;
  document.getElementById('crs-score').style.color=gradeColor;
  document.getElementById('crs-grade').textContent=grade;
  document.getElementById('crs-grade').style.color=gradeColor;
  document.getElementById('crs-bar').style.width=pct+'%';
  document.getElementById('crs-bar').style.background=gradeColor;

  // Build results
  var h='';

  // Grade summary
  h+='<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:16px">';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.7">'+gradeDetail+'</div>';
  h+='</div>';

  // Red flags first
  var reds=flags.filter(function(f){return f.severity==='red'});
  var yellows=flags.filter(function(f){return f.severity==='yellow'});
  var greens=flags.filter(function(f){return f.severity==='green'});

  if(reds.length){
    h+='<div style="margin-bottom:16px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\ud83d\udea9 RED FLAGS — Negotiate These ('+reds.length+')</div>';
    reds.forEach(function(f){
      h+='<div style="padding:12px 14px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.12);border-radius:8px;margin-bottom:8px">';
      h+='<div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:4px">'+f.cat+': '+f.text+'</div>';
      if(f.detail) h+='<div style="font-size:11px;color:var(--text2);line-height:1.7">'+f.detail+'</div>';
      h+='</div>';
    });
    h+='</div>';
  }

  if(yellows.length){
    h+='<div style="margin-bottom:16px">';
    h+='<div style="font-size:11px;font-weight:600;color:#E67E22;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\u26a0\ufe0f CAUTION — Review These ('+yellows.length+')</div>';
    yellows.forEach(function(f){
      h+='<div style="padding:12px 14px;background:rgba(230,126,34,.04);border:1px solid rgba(230,126,34,.10);border-radius:8px;margin-bottom:8px">';
      h+='<div style="font-size:12px;font-weight:600;color:#E67E22;margin-bottom:4px">'+f.cat+': '+f.text+'</div>';
      if(f.detail) h+='<div style="font-size:11px;color:var(--text2);line-height:1.7">'+f.detail+'</div>';
      h+='</div>';
    });
    h+='</div>';
  }

  if(greens.length){
    h+='<div style="margin-bottom:16px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\u2705 STRONG PROVISIONS ('+greens.length+')</div>';
    greens.forEach(function(f){
      h+='<div style="padding:10px 14px;background:rgba(106,191,75,.04);border-left:2px solid var(--green);margin-bottom:6px;border-radius:4px">';
      h+='<div style="font-size:12px;font-weight:500;color:var(--text)">'+f.cat+': '+f.text+'</div>';
      if(f.detail) h+='<div style="font-size:11px;color:var(--text3);line-height:1.6;margin-top:2px">'+f.detail+'</div>';
      h+='</div>';
    });
    h+='</div>';
  }

  // Financial exposure estimate
  var exposure=0;
  if(crsVal('crs-tail-pay')==='you'||crsVal('crs-tail-pay')==='unknown') exposure+=50000;
  if(crsVal('crs-tail-pay')==='shared') exposure+=25000;
  if(crsVal('crs-sign-claw')==='full') exposure+=30000;
  if(crsVal('crs-loan-claw')==='full') exposure+=50000;
  if(crsVal('crs-nc-radius')==='large'||crsVal('crs-nc-radius')==='extreme') exposure+=40000;
  if(crsVal('crs-term-sev')==='no') exposure+=60000;
  if(crsVal('crs-ben-call')==='no') exposure+=30000;

  if(exposure>0){
    h+='<div style="padding:16px;background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.10);border-radius:12px;margin-bottom:16px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\ud83d\udcb8 Estimated Financial Exposure</div>';
    h+='<div style="font-size:28px;font-weight:700;font-family:var(--font-serif);color:var(--red);margin-bottom:8px">$'+(exposure/1000).toFixed(0)+'K+</div>';
    h+='<div style="font-size:11px;color:var(--text2);line-height:1.7">This is a rough estimate of what the red-flag provisions could cost you if you leave this position. It includes potential tail coverage, clawback obligations, lost severance, lost call compensation, and relocation costs from an aggressive non-compete. An attorney review ($2-3.5K) that fixes even one of these issues would pay for itself many times over.</div>';
    h+='</div>';
  }

  // Bottom line
  h+='<div style="padding:16px;background:linear-gradient(160deg,rgba(200,168,124,.06),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.15);border-radius:12px">';
  h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px">\ud83e\udde0 What to Do Next</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.8">';
  if(reds.length>=3) h+='<p style="margin-bottom:8px"><strong>'+reds.length+' red flags</strong> is too many to negotiate alone. Hire a healthcare contract attorney ($2-3.5K). They typically save physicians $20-50K+ in improved terms. This is not optional — it\u2019s a financial investment with a clear ROI.</p>';
  else if(reds.length>=1) h+='<p style="margin-bottom:8px">You have <strong>'+reds.length+' red flag'+(reds.length>1?'s':'')+'</strong>. These are specific, addressable issues. You can negotiate them yourself, but consider attorney review if the non-compete or tail provisions are involved.</p>';
  else if(yellows.length>=2) h+='<p style="margin-bottom:8px">No red flags, but <strong>'+yellows.length+' caution areas</strong>. Raise these in negotiation — they\u2019re reasonable asks that most employers will address.</p>';
  else h+='<p style="margin-bottom:8px">This contract scores well. Do a final read with fresh eyes, verify the numbers match what was discussed verbally, and make sure nothing is referenced in a \u201cseparate document\u201d that you haven\u2019t seen.</p>';
  h+='<p style="margin:0">Use the <strong>Offer Comparison Matrix</strong> to compare this against other offers, or the <strong>RVU Calculator</strong> to model your actual take-home based on the compensation structure.</p>';
  h+='</div></div>';

  // Completion indicator
  if(answered<total){
    h+='<div style="text-align:center;margin-top:12px;font-size:11px;color:var(--text3)">'+answered+' of '+total+' questions answered. Complete all for the most accurate score.</div>';
  }

  document.getElementById('crs-results').innerHTML=h;
}

// ===== OFFER COMPARISON MATRIX (v3) =====
function ocmVal(id){return document.getElementById(id)?document.getElementById(id).value:'';}
function ocmNum(id){return parseFloat(document.getElementById(id)?.value)||0;}

function ocmCompare(){
  var aN=ocmVal('ocm-a-name')||'Offer A';
  var bN=ocmVal('ocm-b-name')||'Offer B';
  var a={name:aN,salary:ocmNum('ocm-a-salary'),sign:ocmNum('ocm-a-sign'),rvu:ocmNum('ocm-a-rvu'),wrvus:ocmNum('ocm-a-wrvus'),loan:ocmNum('ocm-a-loan'),retire:ocmNum('ocm-a-retire'),call:ocmNum('ocm-a-call'),calltype:ocmVal('ocm-a-calltype'),schedule:ocmVal('ocm-a-schedule'),hours:ocmNum('ocm-a-hours'),weekend:ocmVal('ocm-a-weekend'),pto:ocmNum('ocm-a-pto'),cme:ocmNum('ocm-a-cme'),noncomp:ocmNum('ocm-a-noncomp'),tail:ocmVal('ocm-a-tail'),partner:ocmVal('ocm-a-partner'),pslf:ocmVal('ocm-a-pslf'),loc:ocmVal('ocm-a-loc')};
  var b={name:bN,salary:ocmNum('ocm-b-salary'),sign:ocmNum('ocm-b-sign'),rvu:ocmNum('ocm-b-rvu'),wrvus:ocmNum('ocm-b-wrvus'),loan:ocmNum('ocm-b-loan'),retire:ocmNum('ocm-b-retire'),call:ocmNum('ocm-b-call'),calltype:ocmVal('ocm-b-calltype'),schedule:ocmVal('ocm-b-schedule'),hours:ocmNum('ocm-b-hours'),weekend:ocmVal('ocm-b-weekend'),pto:ocmNum('ocm-b-pto'),cme:ocmNum('ocm-b-cme'),noncomp:ocmNum('ocm-b-noncomp'),tail:ocmVal('ocm-b-tail'),partner:ocmVal('ocm-b-partner'),pslf:ocmVal('ocm-b-pslf'),loc:ocmVal('ocm-b-loc')};

  if(!a.salary&&!b.salary){notify('Enter at least base salary for both offers',1);return}

  // Calculate total comp
  function totalComp(o){
    var base=o.salary;
    var rvuComp=(o.rvu&&o.wrvus)?o.rvu*o.wrvus:0;
    var total=Math.max(base,rvuComp)+o.sign+o.loan;
    var retireVal=base*(o.retire/100);
    return {base:base,rvuComp:rvuComp,gross:Math.max(base,rvuComp),total:total,yr3:Math.max(base,rvuComp)*3+o.loan,retire:retireVal,totalWithRetire:total+retireVal};
  }
  var cA=totalComp(a);
  var cB=totalComp(b);

  // Build pros/cons for each
  function buildAnalysis(offer,comp,other,otherComp,label,otherLabel){
    var pros=[];
    var cons=[];
    var warnings=[];

    // Compensation
    if(comp.gross>otherComp.gross){
      var diff=comp.gross-otherComp.gross;
      pros.push('\ud83d\udcb0 Higher gross compensation by $'+(diff/1000).toFixed(0)+'K/year ($'+(diff*3/1000).toFixed(0)+'K over 3 years)');
    }else if(comp.gross<otherComp.gross){
      var diff=otherComp.gross-comp.gross;
      cons.push('\ud83d\udcb0 Lower gross compensation by $'+(diff/1000).toFixed(0)+'K/year \u2014 that\u2019s $'+(diff*3/1000).toFixed(0)+'K less over 3 years');
    }

    // Signing bonus
    if(offer.sign>other.sign&&offer.sign>0) pros.push('\ud83c\udf81 Signing bonus: $'+(offer.sign/1000).toFixed(0)+'K'+(other.sign>0?' vs $'+(other.sign/1000).toFixed(0)+'K':'')+' \u2014 but check clawback terms');
    if(offer.sign<other.sign&&other.sign>0) cons.push('\ud83c\udf81 No signing bonus'+(offer.sign>0?' (lower: $'+(offer.sign/1000).toFixed(0)+'K vs $'+(other.sign/1000).toFixed(0)+'K)':''));

    // Loan repayment
    if(offer.loan>other.loan&&offer.loan>0) pros.push('\ud83c\udf93 Loan repayment: $'+(offer.loan/1000).toFixed(0)+'K \u2014 verify vesting schedule and what happens if you leave early');
    if(offer.loan<other.loan&&other.loan>0) cons.push('\ud83c\udf93 No loan repayment benefit'+(other.loan>0?' ('+otherLabel+' offers $'+(other.loan/1000).toFixed(0)+'K)':''));

    // RVU rate
    if(offer.rvu>0&&other.rvu>0){
      if(offer.rvu>other.rvu) pros.push('\ud83d\udcc8 Higher RVU rate: $'+offer.rvu+'/wRVU vs $'+other.rvu+' \u2014 compounds significantly with volume');
      if(offer.rvu<other.rvu) cons.push('\ud83d\udcc8 Lower RVU rate: $'+offer.rvu+'/wRVU vs $'+other.rvu+' \u2014 you\u2019re being paid less per unit of work');
    }

    // Retirement
    if(offer.retire>other.retire) pros.push('\ud83c\udfe6 Better retirement match: '+offer.retire+'% vs '+other.retire+'% \u2014 that\u2019s ~$'+(comp.retire/1000).toFixed(0)+'K/year of free money');
    if(offer.retire<other.retire&&other.retire>0) cons.push('\ud83c\udfe6 Weaker retirement: '+offer.retire+'% vs '+other.retire+'% match \u2014 you\u2019re leaving $'+((otherComp.retire-comp.retire)/1000).toFixed(0)+'K/year on the table');

    // Call
    if(offer.call<other.call&&other.call>0) pros.push('\ud83c\udf19 Less call: '+offer.call+' days/month vs '+other.call+' \u2014 '+(other.call-offer.call)*12+' fewer call days per year');
    if(offer.call>other.call) cons.push('\ud83c\udf19 Heavier call burden: '+offer.call+' days/month vs '+other.call+' \u2014 that\u2019s '+(offer.call-other.call)*12+' more call days per year. Is the extra comp worth the lifestyle cost?');

    // Call type
    var callSeverity={none:0,phone:1,home:2,home_backup:3,inhouse:4};
    var callLabels={none:'no call',phone:'phone-only call',home:'home call',home_backup:'home call with in-house backup',inhouse:'24-hour in-house call'};
    var mySev=callSeverity[offer.calltype]||0;
    var theirSev=callSeverity[other.calltype]||0;
    if(mySev<theirSev&&theirSev>=2) pros.push('\ud83d\udcde Lighter call type: '+callLabels[offer.calltype]+' vs '+callLabels[other.calltype]+'. The type of call matters as much as the frequency \u2014 phone call from your couch is not the same as sleeping in the hospital.');
    if(mySev>theirSev&&mySev>=3) cons.push('\ud83d\udcde Heavier call type: '+callLabels[offer.calltype]+' vs '+callLabels[other.calltype]+'. In-house call destroys your recovery time and compounds into burnout. Factor this into the real hourly rate.');
    if(mySev>=4) warnings.push('\ud83d\udea9 24-hour in-house call is the most demanding call structure. Confirm frequency, post-call expectations, and whether you get a post-call day off. This is a sustainability issue, not just a preference.');

    // Weekly schedule
    var schedLabels={'5day':'5 days/week','4day':'4 days/week','4.5day':'4.5 days/week','7on7off':'7-on/7-off','shift':'shift-based','other':'other schedule'};
    var schedDays={'5day':5,'4day':4,'4.5day':4.5,'7on7off':3.5,'shift':4,'other':5};
    var myDays=schedDays[offer.schedule]||5;
    var theirDays=schedDays[other.schedule]||5;
    if(myDays<theirDays) pros.push('\ud83d\udcc5 Better weekly schedule: '+(schedLabels[offer.schedule]||offer.schedule)+' vs '+(schedLabels[other.schedule]||other.schedule)+'. Fewer clinic days means more personal time, CME, or side income. Over 48 weeks, that\u2019s ~'+Math.round((theirDays-myDays)*48)+' fewer workdays per year.');
    if(myDays>theirDays) cons.push('\ud83d\udcc5 More demanding schedule: '+(schedLabels[offer.schedule]||offer.schedule)+' vs '+(schedLabels[other.schedule]||other.schedule)+'. That\u2019s ~'+Math.round((myDays-theirDays)*48)+' extra workdays per year \u2014 think about what that means for your family and longevity.');
    if(offer.schedule==='7on7off') pros.push('\ud83c\udfe0 7-on/7-off gives you 26 full weeks off per year \u2014 more total days off than most 5-day/week jobs with 4 weeks PTO. The trade-off: your "on" weeks are intense and you have less schedule flexibility.');
    if(offer.schedule==='4day'&&other.schedule==='5day') pros.push('\u2728 4-day weeks are increasingly common in specialties like heme/onc, derm, and ophthalmology. That extra day compounds: it\u2019s 48+ free days per year for research, family, or building something on the side.');

    // Clinical hours
    if(offer.hours>0&&other.hours>0){
      if(offer.hours<other.hours) pros.push('\u23f0 Fewer clinical hours: '+offer.hours+'h/week vs '+other.hours+'h \u2014 '+(other.hours-offer.hours)+' fewer hours weekly adds up to '+Math.round((other.hours-offer.hours)*48)+' hours/year. That\u2019s real life back.');
      if(offer.hours>other.hours) cons.push('\u23f0 More clinical hours: '+offer.hours+'h/week vs '+other.hours+'h \u2014 '+(offer.hours-other.hours)+' extra hours weekly. Calculate your effective hourly rate \u2014 sometimes the "higher salary" job pays less per hour.');
      if(offer.hours>0&&offer.salary>0){
        var effectiveRate=Math.round(offer.salary/(offer.hours*48));
        if(effectiveRate>0) pros.push('\ud83d\udcb2 Effective hourly rate at '+label+': ~$'+effectiveRate+'/hour (based on '+offer.hours+'h/week \u00d7 48 weeks)');
      }
    }

    // Weekend rounding
    var wkndSeverity={none:0,'1-2':1,eow:2,every:3};
    var wkndLabels={none:'no weekend rounding','1-2':'1-2 weekends/month',eow:'every other weekend',every:'every weekend'};
    var myWknd=wkndSeverity[offer.weekend]||0;
    var theirWknd=wkndSeverity[other.weekend]||0;
    if(myWknd<theirWknd&&theirWknd>=2) pros.push('\ud83d\udcc6 Less weekend work: '+(wkndLabels[offer.weekend]||'none')+' vs '+(wkndLabels[other.weekend]||other.weekend)+'. Weekends with your family aren\u2019t a perk \u2014 they\u2019re what makes a career sustainable.');
    if(myWknd>theirWknd&&myWknd>=2) cons.push('\ud83d\udcc6 More weekend rounding: '+(wkndLabels[offer.weekend]||offer.weekend)+' vs '+(wkndLabels[other.weekend]||'none')+'. Every-other-weekend rounding is ~26 Saturdays or Sundays per year you\u2019re not home.');
    if(myWknd>=3) warnings.push('\u26a0\ufe0f Every-weekend rounding is a significant lifestyle burden. Confirm: is it full rounding or just check-ins? Does it come with extra comp or call pay? This is a leading cause of early career dissatisfaction.');

    // PTO
    var totalTimeOff=offer.pto+(offer.cme||0);
    var otherTimeOff=other.pto+(other.cme||0);
    if(offer.pto>other.pto) pros.push('\ud83c\udfd6\ufe0f More PTO: '+offer.pto+' days vs '+other.pto+' \u2014 '+(offer.pto-other.pto)+' extra days matters for longevity and burnout');
    if(offer.pto<other.pto) cons.push('\ud83c\udfd6\ufe0f Less PTO: '+offer.pto+' days vs '+other.pto+' \u2014 fewer vacation days compounds into resentment over years');
    if(offer.cme>0&&other.cme>0&&offer.cme>other.cme) pros.push('\ud83d\udcda More CME days: '+offer.cme+' vs '+other.cme+' \u2014 plus CME days are often on top of PTO, giving you '+totalTimeOff+' total days off vs '+otherTimeOff);
    if(offer.cme>0&&other.cme>0&&offer.cme<other.cme) cons.push('\ud83d\udcda Fewer CME days: '+offer.cme+' vs '+other.cme);
    if(totalTimeOff<20&&offer.pto>0) warnings.push('\u26a0\ufe0f '+totalTimeOff+' total days off (PTO + CME) is below the physician average of 25-30 days. This will catch up with you. Negotiate more PTO before signing.');

    // Non-compete
    if(offer.noncomp===0&&other.noncomp>0) pros.push('\u2705 No non-compete \u2014 this is a major advantage. You can leave without relocating');
    if(offer.noncomp>0&&offer.noncomp<=other.noncomp&&other.noncomp>0) pros.push('\ud83d\udccd Tighter non-compete: '+offer.noncomp+' miles vs '+other.noncomp+' miles');
    if(offer.noncomp>0){
      if(offer.noncomp>=20) warnings.push('\ud83d\udea9 '+offer.noncomp+'-mile non-compete is aggressive. If this doesn\u2019t work out, you may have to uproot your family. Negotiate this down or get it removed if terminated without cause.');
      else if(offer.noncomp>0) cons.push('\ud83d\udccd Non-compete: '+offer.noncomp+' miles \u2014 understand exactly what triggers it');
    }

    // Tail coverage
    if(offer.tail==='employer') pros.push('\ud83d\udee1\ufe0f Employer-paid tail coverage \u2014 this can be worth $30-80K. This is a real financial advantage');
    if(offer.tail==='you') warnings.push('\ud83d\udea9 You pay tail coverage. Budget $30-80K for this. It\u2019s a hidden cost that most trainees don\u2019t account for until it\u2019s too late.');
    if(offer.tail==='none') warnings.push('\u26a0\ufe0f No tail coverage mentioned. Clarify this before signing \u2014 it\u2019s one of the most expensive oversights in physician contracts.');
    if(offer.tail==='shared') cons.push('\ud83d\udee1\ufe0f Shared tail coverage \u2014 get the exact split in writing');

    // Partnership
    if(offer.partner==='yes'&&other.partner==='no') pros.push('\ud83e\udd1d Partnership track \u2014 this is the highest-ceiling path long-term, but verify: buy-in cost, timeline, and what \u201cpartner\u201d actually means in the operating agreement');
    if(offer.partner==='no'&&other.partner==='yes') cons.push('\ud83e\udd1d No partnership track \u2014 you\u2019re an employee with a ceiling. '+otherLabel+' has a path to ownership.');

    // PSLF
    if(offer.pslf==='yes'&&other.pslf==='no') pros.push('\ud83c\udf93 PSLF eligible \u2014 if you have >$200K in federal loans, this can be worth $100-300K in forgiveness over 10 years. This is a massive financial lever.');
    if(offer.pslf==='no'&&other.pslf==='yes') cons.push('\ud83c\udf93 Not PSLF eligible \u2014 if you have significant federal loans, '+otherLabel+'\u2019s PSLF eligibility could be worth six figures');

    return {pros:pros,cons:cons,warnings:warnings};
  }

  var aAnalysis=buildAnalysis(a,cA,b,cB,aN,bN);
  var bAnalysis=buildAnalysis(b,cB,a,cA,bN,aN);

  // Render results
  var h='';

  // Summary header
  var winner=cA.totalWithRetire>cB.totalWithRetire?aN:bN;
  var loser=cA.totalWithRetire>cB.totalWithRetire?bN:aN;
  var totalDiff=Math.abs(cA.totalWithRetire-cB.totalWithRetire);
  h+='<div style="padding:20px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:20px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">Year 1 Total Compensation</div>';
  h+='<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center">';
  h+='<div style="text-align:center"><div style="font-size:11px;color:var(--accent);font-weight:600;margin-bottom:4px">'+aN+'</div><div style="font-size:24px;font-weight:700;color:var(--text);font-family:var(--font-serif)">$'+(cA.totalWithRetire/1000).toFixed(0)+'K</div></div>';
  h+='<div style="font-size:12px;color:var(--text3)">vs</div>';
  h+='<div style="text-align:center"><div style="font-size:11px;color:var(--green);font-weight:600;margin-bottom:4px">'+bN+'</div><div style="font-size:24px;font-weight:700;color:var(--text);font-family:var(--font-serif)">$'+(cB.totalWithRetire/1000).toFixed(0)+'K</div></div>';
  h+='</div>';
  if(totalDiff>5000){
    h+='<div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text2)"><strong>'+winner+'</strong> pays <strong style="color:var(--accent)">$'+(totalDiff/1000).toFixed(0)+'K more</strong> in Year 1'+(totalDiff>30000?' \u2014 but money isn\u2019t everything. Read the full analysis.':' \u2014 keep reading for the full picture.')+'</div>';
  }
  h+='</div>';

  // 3-Year projection
  h+='<div style="padding:14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:20px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">3-Year Earnings Projection</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">';
  h+='<div><span style="color:var(--accent);font-weight:600">'+aN+':</span> <strong>$'+(cA.yr3/1000).toFixed(0)+'K</strong></div>';
  h+='<div><span style="color:var(--green);font-weight:600">'+bN+':</span> <strong>$'+(cB.yr3/1000).toFixed(0)+'K</strong></div>';
  h+='</div>';
  var yr3Diff=Math.abs(cA.yr3-cB.yr3);
  if(yr3Diff>10000){
    var yr3Winner=cA.yr3>cB.yr3?aN:bN;
    h+='<div style="font-size:11px;color:var(--text3);margin-top:8px">3-year gap: <strong>$'+(yr3Diff/1000).toFixed(0)+'K</strong> in favor of '+yr3Winner+'</div>';
  }
  h+='</div>';

  // Schedule & Lifestyle Comparison
  var schedLabelsMap={'5day':'5 days/wk','4day':'4 days/wk','4.5day':'4.5 days/wk','7on7off':'7-on / 7-off','shift':'Shift-based','other':'Other'};
  var callLabelsMap={none:'No call',phone:'Phone only',home:'Home call',home_backup:'Home + backup',inhouse:'In-house 24hr'};
  var wkndLabelsMap={none:'None','1-2':'1-2x/month',eow:'Every other',every:'Every weekend'};
  var schedDaysMap={'5day':5,'4day':4,'4.5day':4.5,'7on7off':3.5,'shift':4,'other':5};
  var callSeverityMap={none:0,phone:1,home:2,home_backup:3,inhouse:4};

  h+='<div style="padding:14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:20px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">\ud83d\udcc5 Schedule & Lifestyle</div>';
  h+='<div style="display:grid;grid-template-columns:auto 1fr 1fr;gap:0;font-size:12px">';

  function schedRow(label,aVal,bVal,better){
    var ac=better==='a'?'color:var(--green);font-weight:600':'';
    var bc=better==='b'?'color:var(--green);font-weight:600':'';
    var s='border-bottom:1px solid var(--border);padding:8px 10px;';
    return '<div style="'+s+'color:var(--text3);font-size:11px">'+label+'</div><div style="'+s+'text-align:center;'+ac+'">'+aVal+'</div><div style="'+s+'text-align:center;'+bc+'">'+bVal+'</div>';
  }

  // Header row
  h+='<div style="border-bottom:2px solid var(--border);padding:6px 10px;font-size:10px;color:var(--text3)"></div>';
  h+='<div style="border-bottom:2px solid var(--border);padding:6px 10px;text-align:center;font-weight:600;color:var(--accent);font-size:11px">'+aN+'</div>';
  h+='<div style="border-bottom:2px solid var(--border);padding:6px 10px;text-align:center;font-weight:600;color:var(--green);font-size:11px">'+bN+'</div>';

  // Schedule
  var aSched=schedLabelsMap[a.schedule]||'-';
  var bSched=schedLabelsMap[b.schedule]||'-';
  var schedBetter=(schedDaysMap[a.schedule]||5)<(schedDaysMap[b.schedule]||5)?'a':(schedDaysMap[b.schedule]||5)<(schedDaysMap[a.schedule]||5)?'b':'';
  h+=schedRow('Weekly Schedule',aSched,bSched,schedBetter);

  // Clinical hours
  var aHrs=a.hours?a.hours+'h':'-';
  var bHrs=b.hours?b.hours+'h':'-';
  var hrsBetter=(a.hours&&b.hours)?(a.hours<b.hours?'a':b.hours<a.hours?'b':''):'';
  h+=schedRow('Clinical Hours/Wk',aHrs,bHrs,hrsBetter);

  // Call
  var aCall=a.call?a.call+' days/mo':'-';
  var bCall=b.call?b.call+' days/mo':'-';
  var callBetter=a.call<b.call?'a':b.call<a.call?'b':'';
  h+=schedRow('Call Frequency',aCall,bCall,callBetter);

  // Call type
  var aCallT=callLabelsMap[a.calltype]||'-';
  var bCallT=callLabelsMap[b.calltype]||'-';
  var ctBetter=(callSeverityMap[a.calltype]||0)<(callSeverityMap[b.calltype]||0)?'a':(callSeverityMap[b.calltype]||0)<(callSeverityMap[a.calltype]||0)?'b':'';
  h+=schedRow('Call Type',aCallT,bCallT,ctBetter);

  // Weekend
  var aWknd=wkndLabelsMap[a.weekend]||'-';
  var bWknd=wkndLabelsMap[b.weekend]||'-';
  var wkndSev={none:0,'1-2':1,eow:2,every:3};
  var wBetter=(wkndSev[a.weekend]||0)<(wkndSev[b.weekend]||0)?'a':(wkndSev[b.weekend]||0)<(wkndSev[a.weekend]||0)?'b':'';
  h+=schedRow('Weekend Rounding',aWknd,bWknd,wBetter);

  // PTO
  var aPto=a.pto?a.pto+' days':'-';
  var bPto=b.pto?b.pto+' days':'-';
  var ptoBetter=a.pto>b.pto?'a':b.pto>a.pto?'b':'';
  h+=schedRow('PTO / Year',aPto,bPto,ptoBetter);

  // CME
  var aCme=a.cme?a.cme+' days':'-';
  var bCme=b.cme?b.cme+' days':'-';
  var cmeBetter=a.cme>b.cme?'a':b.cme>a.cme?'b':'';
  h+=schedRow('CME Days',aCme,bCme,cmeBetter);

  // Total time off
  var aTotalOff=(a.pto||0)+(a.cme||0);
  var bTotalOff=(b.pto||0)+(b.cme||0);
  if(aTotalOff>0||bTotalOff>0){
    var toBetter=aTotalOff>bTotalOff?'a':bTotalOff>aTotalOff?'b':'';
    h+=schedRow('\u2728 Total Days Off',aTotalOff?aTotalOff+' days':'-',bTotalOff?bTotalOff+' days':'-',toBetter);
  }

  h+='</div></div>';

  // Offer A analysis
  h+=renderOfferAnalysis(aN,'var(--accent)',aAnalysis);
  // Offer B analysis
  h+=renderOfferAnalysis(bN,'var(--green)',bAnalysis);

  // Bottom line
  h+='<div style="padding:18px;background:linear-gradient(160deg,rgba(200,168,124,.06),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.15);border-radius:12px;margin-top:4px">';
  h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px">\ud83e\udde0 The Honest Bottom Line</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.8">';

  var aWarnings=aAnalysis.warnings.length;
  var bWarnings=bAnalysis.warnings.length;
  if(aWarnings>bWarnings&&totalDiff<50000) h+='<p style="margin-bottom:8px"><strong>'+aN+'</strong> has more structural red flags ('+aWarnings+' warnings). A higher salary doesn\u2019t help if the contract traps you or costs you on the back end.</p>';
  else if(bWarnings>aWarnings&&totalDiff<50000) h+='<p style="margin-bottom:8px"><strong>'+bN+'</strong> has more structural red flags ('+bWarnings+' warnings). Don\u2019t let a bigger number blind you to bad contract terms.</p>';

  if(a.pslf==='yes'&&b.pslf==='no') h+='<p style="margin-bottom:8px">PSLF eligibility at '+aN+' could be worth $100-300K in loan forgiveness. If you have significant federal debt, this may outweigh a salary gap.</p>';
  if(b.pslf==='yes'&&a.pslf==='no') h+='<p style="margin-bottom:8px">PSLF eligibility at '+bN+' could be worth $100-300K in loan forgiveness. If you have significant federal debt, this may outweigh a salary gap.</p>';

  if(a.partner==='yes'&&b.partner==='no') h+='<p style="margin-bottom:8px">'+aN+'\u2019s partnership track means your income ceiling is much higher \u2014 but verify the buy-in, timeline, and what happens if partnership is denied.</p>';
  if(b.partner==='yes'&&a.partner==='no') h+='<p style="margin-bottom:8px">'+bN+'\u2019s partnership track means your income ceiling is much higher \u2014 but verify the buy-in, timeline, and what happens if partnership is denied.</p>';

  var callDiff=Math.abs(a.call-b.call);
  if(callDiff>=3) h+='<p style="margin-bottom:8px">The call difference is '+(callDiff*12)+' days/year. That\u2019s not a minor lifestyle detail \u2014 it\u2019s the difference between burnout at year 3 and a sustainable career. Price your time honestly.</p>';

  // Schedule/lifestyle summary
  var schedDaysMap={'5day':5,'4day':4,'4.5day':4.5,'7on7off':3.5,'shift':4,'other':5};
  var aWorkdays=(schedDaysMap[a.schedule]||5)*48;
  var bWorkdays=(schedDaysMap[b.schedule]||5)*48;
  if(Math.abs(aWorkdays-bWorkdays)>=20){
    var fewerSched=aWorkdays<bWorkdays?aN:bN;
    var moreSched=aWorkdays<bWorkdays?bN:aN;
    h+='<p style="margin-bottom:8px"><strong>'+fewerSched+'</strong> has ~'+Math.round(Math.abs(aWorkdays-bWorkdays))+' fewer workdays/year than '+moreSched+'. Run the numbers: divide each salary by annual workdays to see your true daily rate. The "lower salary" job might actually pay more per day of your life.</p>';
  }
  if((a.hours>0&&b.hours>0)&&Math.abs(a.hours-b.hours)>=5){
    var lessHrs=a.hours<b.hours?aN:bN;
    var moreHrs=a.hours<b.hours?bN:aN;
    var hDiff=Math.abs(a.hours-b.hours);
    h+='<p style="margin-bottom:8px">'+moreHrs+' asks for '+hDiff+' more clinical hours per week. That\u2019s '+Math.round(hDiff*48)+' extra hours per year. Before choosing the higher comp, calculate your effective hourly rate for both.</p>';
  }

  h+='<p style="margin:0">The best offer is the one that aligns with where you want to be in 5 years, not just what looks best on paper today. If you\u2019re unsure, submit both offers through the <strong>Contract Intelligence Tool</strong> for a full risk analysis.</p>';
  h+='</div></div>';

  document.getElementById('ocm-results').innerHTML=h;
  document.getElementById('ocm-results').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderOfferAnalysis(name,color,analysis){
  var h='<div style="margin-bottom:16px">';
  h+='<div style="font-size:13px;font-weight:600;color:'+color+';margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid '+color+'">'+name+'</div>';

  // Warnings first
  if(analysis.warnings.length){
    analysis.warnings.forEach(function(w){
      h+='<div style="padding:10px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.12);border-radius:8px;margin-bottom:8px;font-size:12px;color:var(--red);line-height:1.6">'+w+'</div>';
    });
  }
  // Pros
  if(analysis.pros.length){
    h+='<div style="font-size:10px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;margin-top:8px">ADVANTAGES</div>';
    analysis.pros.forEach(function(p){
      h+='<div style="padding:8px 12px;background:rgba(106,191,75,.04);border-left:2px solid var(--green);margin-bottom:6px;font-size:12px;color:var(--text2);line-height:1.6">'+p+'</div>';
    });
  }
  // Cons
  if(analysis.cons.length){
    h+='<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;margin-top:12px">TRADE-OFFS</div>';
    analysis.cons.forEach(function(c){
      h+='<div style="padding:8px 12px;background:var(--bg2);border-left:2px solid var(--border);margin-bottom:6px;font-size:12px;color:var(--text2);line-height:1.6">'+c+'</div>';
    });
  }
  if(!analysis.pros.length&&!analysis.cons.length&&!analysis.warnings.length){
    h+='<div style="font-size:12px;color:var(--text3);padding:12px 0">Enter more details to see analysis.</div>';
  }
  h+='</div>';
  return h;
}

// ===== SPECIALTY FIT ANALYZER (v13) =====
function sfaUpdate(){
  var q1=document.getElementById('sfa-q1').value;
  var q2=document.getElementById('sfa-q2').value;
  var q3=document.getElementById('sfa-q3').value;
  var q4=document.getElementById('sfa-q4').value;
  var q5=document.getElementById('sfa-q5').value;
  var q6=document.getElementById('sfa-q6').value;
  if(!q1||!q2||!q3||!q4||!q5||!q6)return;

  var specs=[
    {name:'Interventional Cardiology',icon:'\ud83e\udec0',fit:0,comp:'$600-800K',hours:'55-65h/wk',train:'IM 3yr + Cards 3yr + IC 1yr',path:'Heavily procedural, high-stakes, excellent compensation'},
    {name:'General Cardiology',icon:'\u2764\ufe0f',fit:0,comp:'$450-600K',hours:'50-60h/wk',train:'IM 3yr + Cards 3yr',path:'Mix of procedures and cognitive work'},
    {name:'Gastroenterology',icon:'\ud83e\ude7a',fit:0,comp:'$450-700K',hours:'45-55h/wk',train:'IM 3yr + GI 3yr',path:'Procedural with good lifestyle'},
    {name:'Dermatology',icon:'\ud83e\uddb4',fit:0,comp:'$400-600K',hours:'40-50h/wk',train:'1yr prelim + 3yr derm',path:'Lifestyle specialty, very competitive match'},
    {name:'Radiology',icon:'\ud83d\udcf7',fit:0,comp:'$400-550K',hours:'40-55h/wk',train:'1yr prelim + 4yr rads',path:'Cognitive, image-based, minimal patient contact'},
    {name:'Emergency Medicine',icon:'\ud83d\ude91',fit:0,comp:'$350-450K',hours:'36-42h/wk shift',train:'3-4yr EM',path:'Shift-based, high acuity, no follow-up'},
    {name:'Orthopedic Surgery',icon:'\ud83e\uddb4',fit:0,comp:'$500-800K',hours:'55-70h/wk',train:'5yr ortho',path:'Heavily procedural, sports/trauma'},
    {name:'Psychiatry',icon:'\ud83e\udde0',fit:0,comp:'$250-350K',hours:'40-50h/wk',train:'4yr psych',path:'Cognitive, long-term relationships, growing demand'},
    {name:'Hospitalist Medicine',icon:'\ud83c\udfe5',fit:0,comp:'$280-380K',hours:'7-on/7-off',train:'IM 3yr',path:'Flexible scheduling, no clinic overhead, inpatient acute care'},
    {name:'Outpatient IM / Primary Care',icon:'\ud83e\ude7a',fit:0,comp:'$250-320K',hours:'40-50h/wk',train:'IM 3yr',path:'Longitudinal patient relationships, clinic-based, growing demand for internists'},
    {name:'Pulm/Critical Care',icon:'\ud83c\udf2c\ufe0f',fit:0,comp:'$350-500K',hours:'50-60h/wk',train:'IM 3yr + PCCM 3yr',path:'ICU-based, procedures + cognitive'}
  ];

  // Scoring logic
  specs.forEach(function(s){
    // Patient interaction
    if(q1==='long'&&(s.name.includes('Cardiology')||s.name.includes('Psychiatry')||s.name.includes('Outpatient')))s.fit+=20;
    if(q1==='episode'&&(s.name.includes('Gastro')||s.name.includes('Hospitalist')||s.name.includes('Pulm')))s.fit+=20;
    if(q1==='acute'&&(s.name.includes('Emergency')||s.name.includes('Surgery')||s.name.includes('Interventional')))s.fit+=20;
    if(q1==='minimal'&&(s.name.includes('Radiology')||s.name.includes('Pathology')))s.fit+=20;
    // Procedural
    if(q2==='heavy'&&(s.name.includes('Interventional')||s.name.includes('Surgery')))s.fit+=25;
    if(q2==='mix'&&(s.name.includes('General Cardiology')||s.name.includes('Gastro')||s.name.includes('Pulm')))s.fit+=25;
    if(q2==='cognitive'&&(s.name.includes('Psychiatry')||s.name.includes('Hospitalist')||s.name.includes('Outpatient')))s.fit+=25;
    if(q2==='none'&&(s.name.includes('Radiology')||s.name.includes('Dermatology')||s.name.includes('Psychiatry')||s.name.includes('Outpatient')))s.fit+=25;
    // Lifestyle
    if(q3==='lifestyle'&&(s.name.includes('Dermatology')||s.name.includes('Psychiatry')||s.name.includes('Emergency')||s.name.includes('Radiology')||s.name.includes('Outpatient')))s.fit+=20;
    if(q3==='balanced'&&(s.name.includes('Gastro')||s.name.includes('General Cardiology')||s.name.includes('Hospitalist')))s.fit+=20;
    if(q3==='income'&&(s.name.includes('Interventional')||s.name.includes('Surgery')||s.name.includes('Gastro')))s.fit+=20;
    if(q3==='mission'&&(s.name.includes('Psychiatry')||s.name.includes('Emergency')||s.name.includes('Pulm')||s.name.includes('Outpatient')))s.fit+=20;
    // Intellectual style
    if(q4==='complex'&&(s.name.includes('Cardiology')||s.name.includes('Pulm')))s.fit+=15;
    if(q4==='systems'&&(s.name.includes('Hospitalist')||s.name.includes('Emergency')))s.fit+=15;
    if(q4==='technical'&&(s.name.includes('Interventional')||s.name.includes('Surgery')||s.name.includes('Radiology')))s.fit+=15;
    if(q4==='breadth'&&(s.name.includes('Emergency')||s.name.includes('Hospitalist')||s.name.includes('Outpatient')))s.fit+=15;
    // Practice setting
    if(q5==='academic'&&(s.name.includes('Cardiology')||s.name.includes('Pulm')||s.name.includes('Surgery')))s.fit+=10;
    if(q5==='private'&&(s.name.includes('Dermatology')||s.name.includes('Gastro')||s.name.includes('Orthopedic')||s.name.includes('Outpatient')))s.fit+=10;
    if(q5==='community'&&(s.name.includes('Hospitalist')||s.name.includes('Emergency')||s.name.includes('Outpatient')))s.fit+=10;
    if(q5==='flexible')s.fit+=5;
    // Uncertainty tolerance
    if(q6==='high'&&(s.name.includes('Emergency')||s.name.includes('Surgery')||s.name.includes('Interventional')||s.name.includes('Pulm')))s.fit+=10;
    if(q6==='moderate'&&(s.name.includes('Cardiology')||s.name.includes('Gastro')||s.name.includes('Hospitalist')||s.name.includes('Outpatient')))s.fit+=10;
    if(q6==='low'&&(s.name.includes('Dermatology')||s.name.includes('Radiology')||s.name.includes('Psychiatry')))s.fit+=10;
  });

  // Sort and show top 3
  specs.sort(function(a,b){return b.fit-a.fit});
  var top=specs.slice(0,3);
  var maxFit=top[0].fit||1;
  var h='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">\u2728 Your Top Specialty Matches</div>';
  top.forEach(function(s,i){
    var pct=Math.round((s.fit/maxFit)*100);
    var border=i===0?'rgba(200,168,124,.3)':'var(--border)';
    h+='<div style="padding:16px;background:var(--bg2);border:1px solid '+border+';border-radius:10px;margin-bottom:10px'+(i===0?';box-shadow:0 0 20px rgba(200,168,124,.06)':'')+'">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h+='<span style="font-size:14px;font-weight:600;color:var(--text)">'+s.icon+' '+s.name+'</span>';
    if(i===0)h+='<span style="font-size:9px;padding:3px 8px;border-radius:100px;background:var(--accent-dim);color:var(--accent);font-weight:600">#1 FIT</span>';
    h+='</div>';
    h+='<div style="height:4px;background:var(--bg3);border-radius:2px;margin-bottom:10px"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:2px"></div></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;color:var(--text2)">';
    h+='<div>\ud83d\udcb0 <strong>Comp:</strong> '+s.comp+'</div>';
    h+='<div>\u23f0 <strong>Hours:</strong> '+s.hours+'</div>';
    h+='<div>\ud83c\udf93 <strong>Training:</strong> '+s.train+'</div>';
    h+='</div>';
    h+='<p style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5">'+s.path+'</p>';
    h+='</div>';
  });
  h+='<p style="font-size:10px;color:var(--text3);font-style:italic;margin-top:12px">This analysis is directional guidance based on your preferences. Shadow, rotate, and talk to physicians in each field before committing.</p>';
  document.getElementById('sfa-results').innerHTML=h;
}

// ===== MATCH COMPETITIVENESS CALCULATOR (v14) =====
function mccUpdate(){
  var spec=document.getElementById('mcc-spec').value;
  var step2=parseInt(document.getElementById('mcc-step2').value)||0;
  var pubs=parseInt(document.getElementById('mcc-pubs').value)||0;
  var school=document.getElementById('mcc-school').value;
  var programs=parseInt(document.getElementById('mcc-programs').value)||0;
  var aways=parseInt(document.getElementById('mcc-aways').value)||0;
  if(!spec||!step2||!school)return;

  // Specialty competitiveness data (approximate match rates and thresholds)
  var specData={
    im:{name:'Internal Medicine',matchRate:94,avgStep:235,compLevel:'low'},
    fm:{name:'Family Medicine',matchRate:93,avgStep:227,compLevel:'low'},
    peds:{name:'Pediatrics',matchRate:88,avgStep:233,compLevel:'low'},
    em:{name:'Emergency Medicine',matchRate:82,avgStep:240,compLevel:'moderate'},
    psych:{name:'Psychiatry',matchRate:87,avgStep:233,compLevel:'moderate'},
    neuro:{name:'Neurology',matchRate:90,avgStep:237,compLevel:'moderate'},
    rads:{name:'Radiology',matchRate:85,avgStep:248,compLevel:'moderate'},
    anes:{name:'Anesthesiology',matchRate:87,avgStep:242,compLevel:'moderate'},
    path:{name:'Pathology',matchRate:85,avgStep:240,compLevel:'low'},
    gen_surg:{name:'General Surgery',matchRate:83,avgStep:245,compLevel:'moderate'},
    ortho:{name:'Orthopedic Surgery',matchRate:75,avgStep:252,compLevel:'high'},
    uro:{name:'Urology',matchRate:78,avgStep:250,compLevel:'high'},
    ent:{name:'ENT',matchRate:76,avgStep:252,compLevel:'high'},
    ophtho:{name:'Ophthalmology',matchRate:72,avgStep:252,compLevel:'very_high'},
    derm:{name:'Dermatology',matchRate:68,avgStep:255,compLevel:'very_high'},
    plastics:{name:'Plastic Surgery',matchRate:70,avgStep:254,compLevel:'very_high'},
    nsurg:{name:'Neurosurgery',matchRate:72,avgStep:250,compLevel:'very_high'},
    ir:{name:'Interventional Radiology',matchRate:80,avgStep:250,compLevel:'high'}
  };

  var sd=specData[spec];
  if(!sd)return;

  // Calculate score
  var score=50;
  // Step 2 scoring
  var stepDiff=step2-sd.avgStep;
  if(stepDiff>=20)score+=25;
  else if(stepDiff>=10)score+=20;
  else if(stepDiff>=0)score+=12;
  else if(stepDiff>=-10)score+=5;
  else score-=10;

  // Research
  score+=pubs*7;

  // School tier
  if(school==='top20')score+=15;
  else if(school==='top50')score+=10;
  else if(school==='mid')score+=5;
  else if(school==='do')score-=5;
  else if(school==='img')score-=10;

  // Programs applied
  if(programs>=30)score+=5;
  else if(programs>=20)score+=3;
  else if(programs<10)score-=5;

  // Aways
  score+=aways*4;

  score=Math.max(10,Math.min(98,score));

  var color=score>=75?'var(--green)':score>=50?'var(--accent)':'var(--red)';
  var label=score>=80?'Strong Candidate':score>=65?'Competitive':score>=50?'Average':score>=35?'Below Average':'At Risk';

  var h='<div style="text-align:center;padding:24px;background:var(--bg2);border:1px solid '+color+';border-radius:14px;margin-bottom:16px">';
  h+='<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">'+sd.name+' Match Likelihood</div>';
  h+='<div style="font-size:48px;font-weight:700;color:'+color+';font-family:var(--font-serif)">'+score+'<span style="font-size:18px">%</span></div>';
  h+='<div style="font-size:13px;font-weight:600;color:'+color+'">'+label+'</div>';
  h+='</div>';

  // Breakdown
  h+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Factor Analysis</div>';

  var stepColor=stepDiff>=10?'var(--green)':stepDiff>=0?'var(--accent)':'var(--red)';
  h+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span>Step 2 CK ('+step2+' vs avg '+sd.avgStep+')</span><span style="color:'+stepColor+';font-weight:600">'+(stepDiff>=0?'+':'')+stepDiff+'</span></div>';

  var pubLabel=['None','1-2 abstracts','3-5 pubs','6-10 pubs','10+ pubs'];
  var pubColor=pubs>=2?'var(--green)':pubs>=1?'var(--accent)':'var(--red)';
  h+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span>Research ('+pubLabel[pubs]+')</span><span style="color:'+pubColor+';font-weight:600">'+(pubs>=2?'Strong':pubs>=1?'Adequate':'Weak')+'</span></div>';

  var schoolLabel={top20:'Top 20',top50:'Top 50',mid:'Mid-tier MD',do:'DO',img:'IMG'};
  h+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span>School ('+(schoolLabel[school])+')</span><span style="color:var(--text2)">'+(school==='top20'||school==='top50'?'Advantage':'Neutral to disadvantage')+'</span></div>';

  // Strategic recommendations
  h+='<div style="margin-top:16px;padding:14px;background:var(--bg2);border-radius:10px;border-left:3px solid var(--accent)">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px">\ud83c\udfaf Strategic Recommendations</div>';
  h+='<ul style="font-size:12px;color:var(--text2);line-height:1.8;padding-left:16px;margin:0">';
  if(stepDiff<0)h+='<li>Your Step 2 CK is below the specialty average \u2014 consider retaking if >10 points below</li>';
  if(pubs<2)h+='<li>Increase research output \u2014 aim for 2-3 first-author publications for competitive specialties</li>';
  if(aways<2)h+='<li>Plan 1-2 away rotations at target programs \u2014 this significantly improves rank list position</li>';
  if(programs<15)h+='<li>Apply broadly \u2014 15-25 programs minimum for competitive specialties</li>';
  if(school==='img')h+='<li>As an IMG, strong Step scores and research are critical differentiators</li>';
  if(score>=75)h+='<li>Strong position \u2014 focus on interview performance and rank list strategy</li>';
  h+='</ul></div>';

  h+='<p style="font-size:10px;color:var(--text3);font-style:italic;margin-top:12px">Based on NRMP Charting Outcomes data. This is directional guidance, not a guarantee. Individual circumstances vary significantly.</p>';
  document.getElementById('mcc-results').innerHTML=h;
}

// ===== CAREER STRATEGY BUILDER (v15) =====
function csbUpdate(){}
function csbGenerate(){
  var now=document.getElementById('csb-now').value;
  var target=document.getElementById('csb-target').value;
  var research=parseInt(document.getElementById('csb-research').value)||0;
  var urgency=document.getElementById('csb-urgency').value;
  if(!now||!target||!urgency){notify('Complete all fields to build your roadmap',1);return}

  var targetNames={cards:'Cardiology',ic:'Interventional Cardiology',gi:'Gastroenterology',pulm:'Pulmonary/Critical Care',heme:'Hematology/Oncology',endo:'Endocrinology',rheum:'Rheumatology',neph:'Nephrology',id:'Infectious Disease',ortho:'Orthopedic Surgery',nsurg:'Neurosurgery',derm:'Dermatology',ophtho:'Ophthalmology',rads:'Radiology',gen_surg:'General Surgery',em:'Emergency Medicine',academic:'Academic Medicine',private:'Private Practice',admin:'Healthcare Administration'};

  var tName=targetNames[target]||target;

  // Generate timeline phases
  var phases=[];
  if(now==='ms1'||now==='ms2'){
    phases.push({time:'Now \u2013 6 months',title:'Build Your Foundation',items:['Excel in pre-clinical coursework \u2014 build habits that carry through','Join 1-2 interest groups related to '+tName,'Find a research mentor in the field','Start reading about '+tName+' career paths']});
    phases.push({time:'6 \u2013 12 months',title:'Start Building Evidence',items:['Begin a research project (case report or QI project)','Shadow physicians in '+tName+' \u2014 2-3 different settings','Take leadership in a relevant student organization','Prepare for Step 1 with discipline']});
    phases.push({time:'12 \u2013 24 months',title:'Strengthen Your Application',items:['Submit first abstract to a national conference','Get involved in clinical experiences related to '+tName,'Build relationships with 2-3 potential letter writers','Start personal statement brainstorming']});
  }else if(now==='ms3'){
    phases.push({time:'Now \u2013 3 months',title:'Clinical Excellence',items:['Honor key clinical rotations \u2014 especially relevant to '+tName,'Begin or continue research project with publication timeline','Identify and cultivate 3 letter writers','Prepare for Step 2 CK']});
    phases.push({time:'3 \u2013 6 months',title:'Application Assembly',items:['Draft personal statement (aim for 5+ revisions)','Build tiered program list (reach/target/safety)','Submit abstracts to relevant society meetings','Schedule away rotations at 1-2 target programs']});
    phases.push({time:'6 \u2013 12 months',title:'Application & Interview Season',items:['Submit ERAS application early','Prepare for interviews with mock sessions','Send thank-you/interest emails strategically','Finalize rank list with honest self-assessment']});
  }else if(now==='intern'||now==='resident'){
    phases.push({time:'Now \u2013 3 months',title:'Position Yourself',items:['Declare your interest in '+tName+' to your PD','Start or accelerate research in '+tName,'Identify specialty-specific letter writers','Network at department events and conferences']});
    if(urgency==='1'){
      phases.push({time:'3 \u2013 6 months',title:'Execute Rapidly',items:['Submit at least 1 abstract to ACC, AHA, DDW, or relevant society','Finalize all letters of recommendation','Complete personal statement (5+ drafts)','Schedule away rotations']});
      phases.push({time:'6 \u2013 9 months',title:'Application Window',items:['Submit ERAS on day 1','Interview strategically \u2014 15-20+ programs','Send focused interest emails after interviews','Build your rank list thoughtfully']});
    }else{
      phases.push({time:'3 \u2013 12 months',title:'Build Deliberately',items:['Aim for 2-3 first-author publications in '+tName,'Present at 1-2 national conferences','Complete 1-2 away rotations at target programs','Mentor-match with someone who matched where you want to go']});
      phases.push({time:'12 \u2013 18 months',title:'Application Year',items:['Submit a competitive application with strong research portfolio','Interview broadly but with intention','Personal statement should tell a clear narrative','Have 3-4 strong, specialty-specific letters']});
    }
  }else if(now==='fellow'){
    phases.push({time:'Now \u2013 6 months',title:'Define Your Attending Path',items:['Clarify: academic vs private vs employed','Research compensation benchmarks (MGMA) for '+tName,'Network at conferences for job opportunities','Start conversations with potential employers']});
    phases.push({time:'6 \u2013 12 months',title:'Contract & Position Search',items:['Use the Contract Intelligence Tool on any offers','Compare offers systematically','Negotiate with MGMA data as leverage','Plan your post-fellowship financial strategy']});
  }else{
    phases.push({time:'Now \u2013 3 months',title:'Strategic Assessment',items:['Evaluate your current position honestly','Benchmark your compensation against MGMA data','Identify what needs to change \u2014 role, setting, or specialty','Talk to 2-3 physicians who\u2019ve made similar moves']});
    phases.push({time:'3 \u2013 6 months',title:'Build Your Plan',items:['Calculate the financial impact of any transition','Test the new direction \u2014 moonlight, consult, or shadow','Build a 12-month financial bridge if pivoting','Strengthen your network in the target area']});
    phases.push({time:'6 \u2013 12 months',title:'Execute',items:['Make a decision with a clear timeline','Negotiate your next position with data','Set up your financial foundation for the transition','Submit a Strategic Audit if you need structured guidance']});
  }

  // Research gap warning
  var researchGap='';
  if(research<2&&(target==='cards'||target==='ic'||target==='gi'||target==='derm'||target==='ortho'||target==='nsurg'||target==='ophtho')){
    researchGap='<div style="padding:12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--red)"><strong>\u26a0\ufe0f Research Gap:</strong> '+tName+' is research-heavy. With your current output, prioritize getting at least 2-3 publications before applying.</div>';
  }

  var h='<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px">\ud83d\udccd Roadmap to '+tName+'</div>';
  h+='<p style="font-size:11px;color:var(--text3);margin-bottom:16px">From '+now.toUpperCase()+' \u2192 '+tName+' \u2022 '+(urgency==='1'?'Applying this cycle':'Timeline: '+urgency+' year(s)')+'</p>';
  h+=researchGap;

  phases.forEach(function(phase,i){
    h+='<div style="position:relative;padding-left:28px;padding-bottom:'+(i<phases.length-1?'20px':'0')+'">';
    if(i<phases.length-1)h+='<div style="position:absolute;left:8px;top:20px;bottom:0;width:2px;background:var(--border)"></div>';
    h+='<div style="position:absolute;left:0;top:2px;width:18px;height:18px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:10px;color:#0a0a0f;font-weight:700">'+(i+1)+'</div>';
    h+='<div style="font-size:10px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+phase.time+'</div>';
    h+='<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">'+phase.title+'</div>';
    h+='<ul style="font-size:12px;color:var(--text2);line-height:1.8;padding-left:16px;margin:0">';
    phase.items.forEach(function(item){h+='<li>'+item+'</li>'});
    h+='</ul></div>';
  });

  h+='<div style="margin-top:20px;padding:14px;background:var(--accent-dim);border:1px solid rgba(200,168,124,.15);border-radius:10px;text-align:center">';
  h+='<div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:4px">Want expert review of your roadmap?</div>';
  h+='<div style="font-size:11px;color:var(--text3)">Submit a Strategic Audit for Dr. Faroqui\u2019s personalized assessment.</div></div>';

  document.getElementById('csb-results').innerHTML=h;
}

// ===== TOOLKIT QUIZ =====
var quizAnswers={stage:null,goal:null,urgency:null};

// Recommendation engine: maps (stage, goal) → ordered tool IDs with rationale
var QUIZ_RECS={
  // STUDENT
  'student_fellowship':  [{id:'v14',why:'See your real match probability based on scores and research'},{id:'v16',why:'Practice the exact questions program directors will ask you'},{id:'v15',why:'Build a step-by-step roadmap to your target specialty'},{id:'v1',why:'Score your application against successful profiles'},{id:'v7',why:'Know which research activities move the needle most'}],
  'student_contract':    [{id:'v3',why:'Learn what to look for before you ever see an offer'},{id:'v2',why:'Know the red flags before you need to negotiate'},{id:'v5',why:'Plan your first 3 years of attending income'},{id:'v8',why:'PSLF vs refinance — make this decision early'}],
  'student_finance':     [{id:'v11',why:'See how specialty choice impacts lifetime wealth'},{id:'v8',why:'The 5 financial decisions worth millions'},{id:'v5',why:'Map your post-training financial trajectory'},{id:'v4',why:'Understand how RVU compensation actually works'}],
  'student_direction':   [{id:'v13',why:'Discover which specialties fit your personality and goals'},{id:'v14',why:'Check your competitiveness for each target specialty'},{id:'v15',why:'Build a roadmap once you choose'},{id:'v11',why:'Compare financial trajectories side by side'}],

  // RESIDENT
  'resident_fellowship': [{id:'v14',why:'See your real match probability with current stats'},{id:'v16',why:'Practice real fellowship interview questions with honest feedback'},{id:'v15',why:'Build your personalized fellowship roadmap'},{id:'v1',why:'Score your application against successful profiles'},{id:'v7',why:'Maximize research ROI with limited time'}],
  'resident_contract':   [{id:'v2',why:'Identify red flags in any contract'},{id:'v16',why:'Practice your negotiation pitch and job interview answers'},{id:'v3',why:'Compare offers systematically'},{id:'v4',why:'Model your real compensation by RVU volume'},{id:'v12',why:'Full contract analysis with risk scoring'}],
  'resident_finance':    [{id:'v5',why:'Your first 3 years determine the next 20'},{id:'v8',why:'PSLF, disability, tax strategy — get these right'},{id:'v11',why:'30-year wealth projection by career path'},{id:'v4',why:'Model what you\'ll actually earn'}],
  'resident_direction':  [{id:'v13',why:'Find which specialties actually fit you'},{id:'v10',why:'Should you pivot? Structured decision engine'},{id:'v15',why:'Build a roadmap to the new target'},{id:'v11',why:'Compare financial trajectories across paths'}],

  // FELLOW
  'fellow_fellowship':   [{id:'v1',why:'Benchmark yourself for advanced fellowship'},{id:'v16',why:'Practice the questions fellowship directors actually ask'},{id:'v7',why:'Optimize your research portfolio for the next step'},{id:'v6',why:'Position for advanced subspecialty programs'},{id:'v9',why:'Get a strategic assessment from Dr. Faroqui'}],
  'fellow_contract':     [{id:'v12',why:'Score your first attending contract'},{id:'v16',why:'Practice your job interview and salary negotiation answers'},{id:'v2',why:'Catch red flags before you sign'},{id:'v3',why:'Compare multiple offers with real data'},{id:'v4',why:'Model your actual take-home compensation'}],
  'fellow_finance':      [{id:'v11',why:'Visualize your lifetime wealth trajectory'},{id:'v5',why:'Plan your first 3 years strategically'},{id:'v8',why:'PSLF decision, disability insurance, tax optimization'},{id:'v4',why:'Understand your future compensation structure'}],
  'fellow_direction':    [{id:'v10',why:'Evaluating a pivot? Use this framework'},{id:'v11',why:'Compare career paths financially'},{id:'v9',why:'Get Dr. Faroqui\'s strategic assessment'},{id:'v3',why:'Weigh your options systematically'}],

  // ATTENDING
  'attending_fellowship':[{id:'v1',why:'Assess competitiveness for additional training'},{id:'v7',why:'Build a research portfolio strategically'},{id:'v6',why:'Timeline planning for fellowship re-entry'},{id:'v11',why:'Financial impact of more training'}],
  'attending_contract':  [{id:'v12',why:'Full contract intelligence with benchmarks'},{id:'v16',why:'Practice salary negotiation and job interview answers'},{id:'v2',why:'Risk scorecard for your contract terms'},{id:'v4',why:'Model compensation scenarios'},{id:'v3',why:'Compare offers side by side'}],
  'attending_finance':   [{id:'v11',why:'30-year trajectory — are you on track?'},{id:'v5',why:'Leverage planner for wealth acceleration'},{id:'v8',why:'Tax strategy, disability, advisor selection'},{id:'v4',why:'Are you being paid fairly? RVU benchmarks'}],
  'attending_direction': [{id:'v10',why:'Career pivot decision engine with financial modeling'},{id:'v9',why:'Submit for Dr. Faroqui\'s strategic review'},{id:'v11',why:'What does a pivot cost over 30 years?'},{id:'v3',why:'Compare your options objectively'}]
};

function quizPick(q,val,btn){
  // Highlight selected option
  var parent=btn.parentElement;
  parent.querySelectorAll('.quiz-opt').forEach(function(b){
    b.style.borderColor='var(--border)';
    b.style.background='var(--bg2)';
  });
  btn.style.borderColor='var(--accent)';
  btn.style.background='var(--accent-dim)';

  if(q===1){
    quizAnswers.stage=val;
    quizAnswers.goal=null;
    quizAnswers.urgency=null;
    document.getElementById('quiz-q2').classList.remove('hidden');
    document.getElementById('quiz-q3').classList.add('hidden');
    document.getElementById('vault-quiz-results').classList.add('hidden');
    // Reset Q2 and Q3 selections
    document.querySelectorAll('#quiz-q2 .quiz-opt, #quiz-q3 .quiz-opt').forEach(function(b){
      b.style.borderColor='var(--border)';b.style.background='var(--bg2)';
    });
    document.getElementById('quiz-q2').scrollIntoView({behavior:'smooth',block:'nearest'});
  }else if(q===2){
    quizAnswers.goal=val;
    quizAnswers.urgency=null;
    document.getElementById('quiz-q3').classList.remove('hidden');
    document.querySelectorAll('#quiz-q3 .quiz-opt').forEach(function(b){
      b.style.borderColor='var(--border)';b.style.background='var(--bg2)';
    });
    document.getElementById('vault-quiz-results').classList.add('hidden');
    document.getElementById('quiz-q3').scrollIntoView({behavior:'smooth',block:'nearest'});
  }else if(q===3){
    quizAnswers.urgency=val;
    quizShowResults();
  }
}

function quizShowResults(){
  var key=quizAnswers.stage+'_'+quizAnswers.goal;
  var recs=QUIZ_RECS[key]||QUIZ_RECS['resident_fellowship'];
  var canAccess=U&&(U.tier==='core'||U.tier==='elite'||U.tier==='admin');

  // Build urgency message
  var urgMsg='';
  if(quizAnswers.urgency==='now') urgMsg='<div style="padding:10px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);border-radius:8px;margin-bottom:14px;font-size:11px;color:var(--red);display:flex;align-items:center;gap:8px"><span style="font-size:14px">🔥</span> <span>You need to act now — start with <strong>'+findVaultTitle(recs[0].id)+'</strong> today.</span></div>';
  else if(quizAnswers.urgency==='soon') urgMsg='<div style="padding:10px 14px;background:rgba(200,168,124,.08);border:1px solid rgba(200,168,124,.15);border-radius:8px;margin-bottom:14px;font-size:11px;color:var(--accent);display:flex;align-items:center;gap:8px"><span style="font-size:14px">📅</span> <span>You have time to plan. Work through these in order over the next few weeks.</span></div>';
  else urgMsg='<div style="padding:10px 14px;background:rgba(139,173,196,.08);border:1px solid rgba(139,173,196,.15);border-radius:8px;margin-bottom:14px;font-size:11px;color:var(--blue);display:flex;align-items:center;gap:8px"><span style="font-size:14px">🗺️</span> <span>Great time to build your strategy. Explore these tools at your own pace.</span></div>';

  var html=urgMsg;
  recs.forEach(function(rec,i){
    var item=VAULT_ITEMS.find(function(v){return v.id===rec.id});
    if(!item) return;
    var mentOnly=item.tier==='elite'&&U.tier!=='elite'&&U.tier!=='admin';
    var locked=!canAccess||mentOnly;
    var onclick;
    if(locked&&mentOnly&&canAccess) onclick='previewEliteFramework(\''+item.id+'\')';
    else if(locked) onclick='notify(\'Upgrade to access this framework\',1)';
    else onclick='openFramework(\''+item.id+'\')';

    html+='<div onclick="'+onclick+'" style="display:flex;gap:14px;padding:14px;background:var(--bg2);border:1px solid '+(i===0?'rgba(200,168,124,.3)':'var(--border)')+';border-radius:10px;margin-bottom:8px;cursor:pointer;position:relative;transition:border-color .2s'+(i===0?';box-shadow:0 0 20px rgba(200,168,124,.06)':'')+'">';
    html+='<div style="flex-shrink:0;width:38px;height:38px;border-radius:10px;background:'+(i===0?'linear-gradient(135deg,var(--accent),var(--accent2))':'var(--bg3)')+';display:flex;align-items:center;justify-content:center;font-size:18px'+(i===0?';color:#0a0a0f':'')+'">'+item.icon+'</div>';
    html+='<div style="flex:1;min-width:0">';
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:13px;font-weight:600;color:var(--text)">'+item.title+'</span>';
    if(mentOnly) html+='<span style="font-size:8px;padding:2px 6px;border-radius:100px;background:var(--accent-dim);color:var(--accent);font-weight:600;letter-spacing:.5px">ELITE</span>';
    if(locked) html+='<span style="font-size:12px">🔒</span>';
    html+='</div>';
    html+='<div style="font-size:11px;color:var(--accent);line-height:1.5">'+rec.why+'</div>';
    html+='</div>';
    if(i===0) html+='<div style="position:absolute;top:6px;right:10px;font-size:8px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.8px">#1 Pick</div>';
    html+='</div>';
  });

  document.getElementById('vault-quiz-recs').innerHTML=html;
  document.getElementById('vault-quiz-results').classList.remove('hidden');
  // Collapse quiz
  document.getElementById('vault-quiz').style.display='none';
  // Scroll to results
  setTimeout(function(){
    document.getElementById('vault-quiz-results').scrollIntoView({behavior:'smooth',block:'start'});
  },100);
}

function findVaultTitle(id){
  var item=VAULT_ITEMS.find(function(v){return v.id===id});
  return item?item.title:'this tool';
}

function quizReset(){
  quizAnswers={stage:null,goal:null,urgency:null};
  document.getElementById('vault-quiz').style.display='';
  document.getElementById('vault-quiz-results').classList.add('hidden');
  document.getElementById('quiz-q2').classList.add('hidden');
  document.getElementById('quiz-q3').classList.add('hidden');
  // Reset all selections
  document.querySelectorAll('#vault-quiz .quiz-opt').forEach(function(b){
    b.style.borderColor='var(--border)';b.style.background='var(--bg2)';
  });
  document.getElementById('vault-quiz').scrollIntoView({behavior:'smooth',block:'start'});
}

// ===== VAULT =====
function renderVault(){
  const canAccess=U.tier==='core'||U.tier==='elite'||U.tier==='admin';

  var VAULT_CATEGORIES=[
    {
      key:'discover',
      title:'Discover Your Fit',
      icon:'🧬',
      goal:'Understand which specialties align with your personality, interests, and lifestyle goals.',
      tools:['v13']
    },
    {
      key:'evaluate',
      title:'Evaluate Competitiveness',
      icon:'🏆',
      goal:'Assess whether you\'re competitive for your desired specialty or next career move.',
      tools:['v1','v14','v7']
    },
    {
      key:'simulate',
      title:'Simulate the Future',
      icon:'🔮',
      goal:'See realistic long-term outcomes of different career and financial paths.',
      tools:['v11','v4','v5','v8']
    },
    {
      key:'decide',
      title:'Decision Intelligence',
      icon:'⚖️',
      goal:'Compare options and make strategic, data-driven career decisions.',
      tools:['v3','v2','v12','v10']
    },
    {
      key:'execute',
      title:'Execute the Strategy',
      icon:'🚀',
      goal:'Implement your career plan with structured roadmaps, interview prep, and expert review.',
      tools:['v15','v6','v16','v9']
    }
  ];

  function renderCard(v){
    const mentOnly=v.tier==='elite'&&U.tier!=='elite'&&U.tier!=='admin';
    const locked=!canAccess||mentOnly;
    var onclick;
    if(locked&&mentOnly&&canAccess){
      onclick='onclick="previewEliteFramework(\''+v.id+'\')"';
    }else if(locked){
      onclick='onclick="notify(\'Upgrade to access this framework\',1)"';
    }else{
      onclick='onclick="openFramework(\''+v.id+'\')"';
    }
    var tierBadge='';
    if(v.tier==='elite') tierBadge=' <span style="font-size:8px;padding:2px 6px;border-radius:100px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#0a0a0f;font-weight:700;letter-spacing:.5px;vertical-align:middle">ELITE</span>';
    return '<div class="vault-card '+(locked?'':'unlocked')+'" '+onclick+'><div class="v-icon">'+v.icon+'</div><div class="v-info"><h3>'+v.title+tierBadge+'</h3><p>'+v.desc+'</p></div><div class="v-lock">'+(locked?'\ud83d\udd12':'\ud83d\udcc4')+'</div></div>';
  }

  var h='';
  VAULT_CATEGORIES.forEach(function(cat){
    h+='<div style="padding:0 24px 8px">';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    h+='<span style="font-size:18px">'+cat.icon+'</span>';
    h+='<div style="font-size:13px;font-weight:600;color:var(--text);letter-spacing:.3px">'+cat.title+'</div>';
    h+='</div>';
    h+='<p style="font-size:11px;color:var(--text3);line-height:1.5;margin-bottom:12px;padding-left:26px">'+cat.goal+'</p>';
    h+='</div>';

    cat.tools.forEach(function(toolId){
      var v=VAULT_ITEMS.find(function(item){return item.id===toolId});
      if(v) h+='<div style="padding:0 24px">'+renderCard(v)+'</div>';
    });

    h+='<div style="height:20px"></div>';
  });

  document.getElementById('vault-categories').innerHTML=h;
}
function openFramework(id){
  const content=VAULT_CONTENT[id];
  if(!content){notify('Framework content loading...',1);return}
  document.getElementById('modal-q-content').innerHTML=content;
  document.getElementById('modal-q').classList.remove('hidden');
  if(id==='v1')setTimeout(frcUpdate,50);
  if(id==='v4')setTimeout(function(){rvuModelChange();rvuUpdate()},50);
  if(id==='v7')setTimeout(roiUpdate,50);
  if(id==='v11')setTimeout(ftInit,50);
  if(id==='v12')setTimeout(ciInit,50);
  if(id==='v16')setTimeout(misInit,50);
}

var ELITE_PREVIEWS={
v9:{
  title:'Strategic Audit Template',
  icon:'\ud83d\udcdd',
  desc:'The exact intake framework used in Elite Strategy sessions. Complete every section and submit directly to Dr. Faroqui for a structured strategic review.',
  sections:[
    {name:'Part 1: Current Position',items:['Current training level / position','Institution strengths and limitations','Financial situation (debt, savings, obligations)','CV snapshot (publications, scores, leadership)','What are you known for?']},
    {name:'Part 2: The Decision',items:['What specific decision are you facing?','What are all your options?','What is the timeline?','What have you already tried?','What\'s holding you back?']},
    {name:'Part 3: Constraints & Priorities',items:['Non-negotiables','What are you willing to sacrifice?','Who else is affected?','Success in 1 year? 5 years?','What would you regret not doing?']},
    {name:'Part 4: Information Gaps',items:['What info would make this easier?','Who have you talked to?','Worst realistic outcome?','Best realistic outcome?','Is this decision reversible?']}
  ]
},
v10:{
  title:'Career Pivot Decision Engine',
  icon:'\u26a1',
  desc:'An interactive, step-by-step framework for evaluating specialty switches, practice model changes, or non-clinical transitions — with your answers compiled into a report for Dr. Faroqui.',
  sections:[
    {name:'Step 1: Diagnose the Dissatisfaction',items:['Multiple-choice core issue identifier with pros & cons analysis','Free-text reflection on what you dislike','Burnout vs. misalignment assessment with personalized feedback']},
    {name:'Step 2: Map the Options',items:['Rate 4 paths across feasibility, financial impact, timeline, satisfaction','Auto-calculated scores highlight your strongest option','Stay + Modify, Adjacent Pivot, Full Pivot, Hybrid']},
    {name:'Step 3: Financial Reality Check',items:['Debt and obligations assessment','Training Cost Calculator — total transition cost breakdown','Income sustainability and emergency fund evaluation']},
    {name:'Step 4: Test Before Committing',items:['Validation checklist (shadowing, interviews, side projects)','5-year regret test with guided feedback','Full report submitted to Dr. Faroqui for review']}
  ]
},
v11:{
  title:'Financial Trajectory Simulator',
  icon:'\ud83d\udcb0',
  desc:'Compare up to 3 career paths with a 30-year wealth projection. See how specialty choice, fellowship training, and savings strategy impact lifetime earnings and net worth.',
  sections:[
    {name:'Scenario Builder',items:['28 specialties with MGMA salary data','Academic vs employed vs private practice','Savings rate modeling (10-40%)','Training stage adjustment']},
    {name:'30-Year Projection',items:['Interactive canvas-drawn trajectory graph','Net worth and lifetime earnings per scenario','Investment compounding with 7% annual return']},
    {name:'Strategic Insights',items:['Auto-generated comparison analysis','Earnings gap quantification','Savings rate impact assessment','Practice type risk/reward evaluation']}
  ]
},
v12:{
  title:'Contract Intelligence Tool',
  icon:'\ud83d\udcdd',
  desc:'Input your actual offer details and get an instant competitiveness score out of 100, MGMA salary benchmarking, risk flag identification, and specific negotiation recommendations.',
  sections:[
    {name:'Offer Input',items:['Specialty-specific MGMA benchmarking','Base salary, RVU rate, signing bonus','28 specialties with percentile data']},
    {name:'Risk Analysis',items:['Non-compete radius and duration scoring','Tail coverage assessment','Termination notice evaluation','Call burden and compensation analysis']},
    {name:'Score Report',items:['Overall competitiveness score /100','7-category breakdown with color-coded ratings','MGMA percentile positioning chart']},
    {name:'Negotiation Strategy',items:['Specific dollar-amount recommendations','Red flag identification and response strategy','Attorney review triggers']}
  ]
}
};

function previewEliteFramework(id){
  var preview=ELITE_PREVIEWS[id];
  if(!preview)return;
  var h='<div style="position:relative">';
  
  // Hero header with gradient background
  h+='<div style="text-align:center;padding:32px 20px;margin:-20px -20px 24px;background:linear-gradient(160deg,rgba(200,168,124,.1),rgba(200,168,124,.03));border-radius:12px 12px 0 0;border-bottom:1px solid rgba(200,168,124,.15)">';
  h+='<div style="font-size:44px;margin-bottom:12px">'+preview.icon+'</div>';
  h+='<h3 class="serif" style="font-size:22px;font-weight:600;margin-bottom:10px;color:var(--text)">'+preview.title+'</h3>';
  h+='<div style="display:inline-block;padding:4px 12px;background:linear-gradient(135deg,var(--accent2),var(--accent));border-radius:20px;font-size:10px;font-weight:600;color:#0a0a0f;letter-spacing:.5px;text-transform:uppercase">Elite Strategy</div>';
  h+='</div>';

  h+='<p style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:24px;text-align:center">'+preview.desc+'</p>';

  // What you get section
  h+='<div style="margin-bottom:24px">';
  h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px">What\'s Inside</div>';
  
  preview.sections.forEach(function(sec,i){
    var isBlurred=i>=4;
    h+='<div style="margin-bottom:12px;padding:14px;background:var(--bg2);border-radius:10px;border:1px solid rgba(200,168,124,.12);transition:all .2s;">';
    h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px">'+sec.name+'</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px">';
    sec.items.forEach(function(item){
      h+='<span style="font-size:10px;padding:4px 10px;border-radius:20px;background:rgba(200,168,124,.06);color:var(--text2);border:1px solid var(--border)">'+item+'</span>';
    });
    h+='</div></div>';
  });
  h+='</div>';

  // Social proof / stats
  h+='<div style="display:flex;gap:1px;margin-bottom:24px;border-radius:10px;overflow:hidden">';
  if(id==='v9'){
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">20</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Intake Fields</div></div>';
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">4</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Strategic Sections</div></div>';
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">7d</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Response Time</div></div>';
  }else{
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">4</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Decision Steps</div></div>';
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">\u2696\ufe0f</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Pros & Cons AI</div></div>';
    h+='<div style="flex:1;background:var(--bg2);padding:14px;text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">$</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Cost Calculator</div></div>';
  }
  h+='</div>';

  // Value proposition
  h+='<div style="padding:16px;background:linear-gradient(135deg,rgba(200,168,124,.06),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.15);border-radius:10px;margin-bottom:20px">';
  h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px">\u2728 Why Elite members use this</div>';
  if(id==='v9'){
    h+='<p style="font-size:12px;color:var(--text2);line-height:1.7;margin:0">The Strategic Audit eliminates guesswork from career decisions. Instead of a vague email to a mentor, you get a structured analysis reviewed by a physician who\'s navigated these exact crossroads. Most members say it\'s the single most valuable tool on the platform.</p>';
  }else{
    h+='<p style="font-size:12px;color:var(--text2);line-height:1.7;margin:0">Career pivots carry six-figure consequences. This engine walks you through the financial, emotional, and strategic dimensions before you make a move \u2014 then sends your complete analysis to Dr. Faroqui for a reality check. No other platform offers this.</p>';
  }
  h+='</div>';

  // CTA
  h+='<div style="text-align:center">';
  h+='<button class="btn btn-a" onclick="closeModal(\'modal-q\');navTo(\'scr-profile\');showUpgrade()" style="width:100%;padding:14px;font-size:14px;font-weight:600">Unlock Elite Strategy \u2014 $99/mo</button>';
  h+='<p style="font-size:11px;color:var(--text3);margin-top:10px">Includes 2 physician review credits, all frameworks, and direct access to Dr. Faroqui.</p>';
  h+='</div></div>';
  
  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}

// ===== FELLOWSHIP READINESS CALCULATOR =====
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
  var total=0;
  for(var i=1;i<=7;i++){
    var el=document.getElementById('frc-r'+i);
    if(!el)return;
    var v=parseInt(el.value);
    total+=v;
    var c=v>=4?'var(--green)':v>=2?'var(--accent)':'var(--red)';
    document.getElementById('frc-s'+i).textContent=v+'/5';
    document.getElementById('frc-s'+i).style.color=c;
    document.getElementById('frc-f'+i).innerHTML=fb[i][v];
    document.getElementById('frc-f'+i).style.borderLeft='3px solid '+c;
  }
  document.getElementById('frc-total').textContent=total;
  var gc,gl,gi;
  if(total>=28){
    gc='var(--green)';gl='Strong Candidate';
    gi='<strong style="color:var(--green)">You\'re in a strong position.</strong> Your application is competitive for most programs. Focus now on program fit, interview prep, and strategic rank list building. Don\'t coast — but you\'ve done the hard work. Make sure your weakest 1-2 areas don\'t become the reason a program passes.';
  }else if(total>=21){
    gc='var(--accent)';gl='Solid With Gaps';
    gi='<strong style="color:var(--accent)">You have a solid foundation but clear gaps.</strong> Look at your lowest 2 scores — those are where your time should go right now. The difference between a 22 and a 28 is often just 2-3 months of focused effort in the right areas. You have the raw material; now it\'s about execution.';
  }else if(total>=14){
    gc='var(--red)';gl='Needs Significant Work';
    gi='<strong style="color:var(--red)">Honest assessment: you have significant gaps.</strong> This isn\'t a death sentence — but it requires urgency and a realistic timeline. Consider whether your current match timeline is feasible, or if an extra year of preparation would dramatically improve your chances. Focus on the categories where you scored 0-1 first.';
  }else{
    gc='var(--red)';gl='Reassess Timeline';
    gi='<strong style="color:var(--red)">You need to reassess your timeline.</strong> Applying with this profile puts you at high risk of not matching. That\'s not a judgment — it\'s data. Talk honestly with a mentor about whether to delay and build a stronger application, or adjust your program targets. A strategic delay is not failure — it\'s wisdom.';
  }
  document.getElementById('frc-total').style.color=gc;
  document.getElementById('frc-grade').textContent=gl;
  document.getElementById('frc-grade').style.color=gc;
  document.getElementById('frc-interp').innerHTML=gi;
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
  renderProgressDashboard();
  renderGoalTracker();
  // Show admin tier switcher
  var sw=document.getElementById('admin-tier-switcher');
  if(sw){sw.classList.toggle('hidden',U.email.toLowerCase()!==AE.toLowerCase())}
}

function adminSwitchTier(tier){
  if(!U||U.email.toLowerCase()!==AE.toLowerCase())return;
  U.tier=tier;
  var t=TIERS[tier]||TIERS.free;
  U.usage.credits=t.credits||0;
  var user=DB.users.find(function(u){return u.id===U.id});
  if(user){user.tier=tier;user.usage=U.usage}
  saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
  // Keep admin nav visible regardless of tier
  document.getElementById('nav-admin').style.display='';
  enterApp();
  navTo('scr-profile');
  var note=document.getElementById('admin-tier-note');
  if(note)note.textContent=tier==='admin'?'Reset to full admin access.':'Now viewing as '+t.name+'. Admin panel still accessible.';
  notify('Switched to '+t.name);
}
function showMyQ(){
  const mine=DB.questions.filter(q=>q.userId===U.id).slice().reverse();
  if(!mine.length){
    var h='<div class="hdr"><button class="hdr-back" onclick="navTo(\'scr-profile\')">← Profile</button><div class="hdr-t serif" style="font-size:18px">My Questions</div></div>';
    h+='<div style="padding:40px 24px;text-align:center;color:var(--text3)"><p style="font-size:40px;margin-bottom:12px">📋</p><p style="font-size:14px">No questions yet.</p><p style="font-size:12px;margin-top:8px">Submit your first question to start building your history.</p></div>';
    document.getElementById('modal-q-content').innerHTML=h;
    document.getElementById('modal-q').classList.remove('hidden');
    return;
  }
  var cats={};
  mine.forEach(function(q){cats[q.cat]=(cats[q.cat]||0)+1});
  var h='<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="serif" style="font-size:18px;font-weight:600">My Questions</span><span style="font-size:12px;color:var(--text3)">'+mine.length+' total</span></div>';
  // Category filter pills
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">';
  h+='<span class="tag t-cat" style="cursor:pointer;font-size:10px" onclick="filterMyQ(\'all\')">All ('+mine.length+')</span>';
  var CATS_MAP={career:'Career',fellowship:'Fellowship',finance:'Finance',contract:'Contracts',research:'Research',clinical:'Clinical',wellness:'Wellness'};
  Object.keys(cats).forEach(function(c){
    h+='<span class="tag" style="cursor:pointer;font-size:10px" onclick="filterMyQ(\''+c+'\')">'+((CATS_MAP[c])||c)+' ('+cats[c]+')</span>';
  });
  h+='</div></div>';
  h+='<div id="myq-list">';
  mine.forEach(function(q){
    var catLabel=(CATS_MAP[q.cat])||q.cat;
    h+='<div class="card myq-item" data-cat="'+q.cat+'" style="margin-bottom:10px;padding:16px;cursor:pointer" onclick="showQDetail('+q.id+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">';
    h+='<span class="tag t-cat" style="font-size:10px">'+catLabel+'</span>';
    h+='<span style="font-size:10px;color:var(--text3)">'+q.date+'</span></div>';
    h+='<p style="font-size:13px;color:var(--text);line-height:1.5;margin:0">'+q.q.substring(0,120)+(q.q.length>120?'...':'')+'</p>';
    if(q.ai){h+='<p style="font-size:11px;color:var(--text3);margin:6px 0 0;line-height:1.5">'+q.ai.diag.substring(0,80)+'...</p>'}
    if(q.status==='reviewed'){h+='<span style="font-size:10px;color:var(--green);margin-top:6px;display:inline-block">✓ Physician Reviewed</span>'}
    else if(q.wantsReview&&q.status==='pending'){h+='<span style="font-size:10px;color:var(--accent);margin-top:6px;display:inline-block">⏳ Review Pending</span>'}
    h+='</div>';
  });
  h+='</div>';
  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}

function filterMyQ(cat){
  var items=document.querySelectorAll('.myq-item');
  items.forEach(function(el){
    if(cat==='all'||el.dataset.cat===cat){el.style.display=''}
    else{el.style.display='none'}
  });
}

function showQDetail(qid){
  var q=DB.questions.find(function(x){return x.id===qid});
  if(!q)return;
  var h='<div style="margin-bottom:16px"><button class="btn btn-sm" onclick="showMyQ()" style="font-size:11px;padding:6px 12px;border:1px solid var(--border);border-radius:6px;color:var(--text3);margin-bottom:12px">← Back to Questions</button></div>';
  h+='<span class="tag t-cat" style="margin-bottom:8px;display:inline-block">'+q.cat+'</span>';
  h+='<span style="font-size:10px;color:var(--text3);margin-left:8px">'+q.date+'</span>';
  h+='<p style="font-size:14px;font-weight:500;color:var(--text);line-height:1.6;margin:12px 0">'+q.q+'</p>';
  if(q.ai){
    h+='<div style="border-top:1px solid var(--border);padding-top:16px;margin-top:16px">';
    h+='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">AI Strategic Assessment</div>';
    h+='<h4 style="font-size:12px;color:var(--text3);margin-bottom:6px">📋 Assessment</h4><p style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:14px">'+q.ai.diag+'</p>';
    h+='<h4 style="font-size:12px;color:var(--text3);margin-bottom:6px">🔍 Key Considerations</h4><p style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:14px">'+q.ai.bottleneck+'</p>';
    h+='<h4 style="font-size:12px;color:var(--text3);margin-bottom:6px">📝 Recommended Approach</h4><ol style="padding-left:20px;margin-bottom:14px">'+q.ai.plan.map(function(s){return '<li style="font-size:13px;color:var(--text2);line-height:1.7;padding:2px 0">'+s+'</li>'}).join('')+'</ol>';
    h+='<h4 style="font-size:12px;color:var(--text3);margin-bottom:6px">⚠️ Common Pitfalls</h4><ul style="list-style:none;padding:0;margin-bottom:14px">'+q.ai.mistakes.map(function(m){return '<li style="padding:3px 0;color:var(--red);font-size:13px">• '+m+'</li>'}).join('')+'</ul>';
    h+='<h4 style="font-size:12px;color:var(--text3);margin-bottom:6px">📅 30-Day Action Plan</h4><p style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:14px">'+q.ai.action+'</p>';
    if(q.ai.refs){h+='<div style="margin-top:12px;padding:12px;border-radius:var(--r2);background:rgba(100,149,237,.06);border:1px solid rgba(100,149,237,.15)"><div style="font-size:10px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📚 References</div><p style="font-size:11px;color:var(--text3);line-height:1.6">'+q.ai.refs+'</p></div>'}
    h+='</div>';
  }
  if(q.reviewNote||q.review){
    var revText=q.reviewNote||q.review;
    h+='<div style="margin-top:16px;padding:16px;border-radius:var(--r2);background:rgba(106,191,75,.06);border:1px solid rgba(106,191,75,.15)">';
    h+='<div style="font-size:10px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✓ Physician Review — Dr. Faroqui</div>';
    h+='<p style="font-size:13px;color:var(--text2);line-height:1.7">'+revText+'</p>';
    if(q.reviewDate){h+='<div style="font-size:10px;color:var(--text3);margin-top:8px">Reviewed '+q.reviewDate+'</div>'}
    h+='</div>';
  }
  document.getElementById('modal-q-content').innerHTML=h;
}

function showMyReport(){
  var user=DB.users.find(function(u){return u.id===U.id});
  var report=user?user.report:null;
  var profile=user?user.profile:null;
  var h='<div style="margin-bottom:16px"><span class="serif" style="font-size:18px;font-weight:600">My Strategic Report</span></div>';
  if(!report){
    h+='<div style="text-align:center;padding:40px;color:var(--text3)"><p style="font-size:40px;margin-bottom:12px">📊</p><p style="font-size:14px">No report available yet.</p><p style="font-size:12px;margin-top:8px">Your strategic assessment is generated during signup.</p></div>';
    document.getElementById('modal-q-content').innerHTML=h;
    document.getElementById('modal-q').classList.remove('hidden');
    return;
  }
  // Score display
  var sc=report.score>=70?'var(--green)':report.score>=45?'var(--accent)':'var(--red)';
  h+='<div style="text-align:center;margin-bottom:24px">';
  h+='<div style="width:100px;height:100px;border-radius:50%;border:3px solid '+sc+';display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 12px">';
  h+='<div style="font-size:28px;font-weight:700;color:'+sc+'">'+report.score+'</div>';
  h+='<div style="font-size:10px;color:var(--text3)">/95</div></div>';
  h+='<div style="font-size:16px;font-weight:600;color:'+sc+'">'+report.grade+'</div>';
  h+='<div style="font-size:11px;color:var(--text3);margin-top:4px">Captured '+new Date(report.capturedAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</div>';
  h+='</div>';
  // Strengths & Gaps
  if(report.strengths&&report.strengths.length){
    h+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:var(--green);margin-bottom:8px">✦ STRENGTHS</div>';
    report.strengths.forEach(function(s){
      h+='<div style="padding:8px 12px;background:rgba(106,191,75,.06);border-radius:6px;margin-bottom:4px;font-size:12px;color:var(--text2)">'+s+'</div>';
    });
    h+='</div>';
  }
  if(report.gaps&&report.gaps.length){
    h+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:8px">⚡ GAPS TO ADDRESS</div>';
    report.gaps.forEach(function(g){
      h+='<div style="padding:8px 12px;background:rgba(239,68,68,.06);border-radius:6px;margin-bottom:4px;font-size:12px;color:var(--text2)">'+g+'</div>';
    });
    h+='</div>';
  }
  // Profile snapshot
  if(profile){
    h+='<details style="margin-top:16px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">Profile Snapshot</summary>';
    h+='<div style="margin-top:10px;padding:14px;background:var(--bg2);border-radius:8px;font-size:12px;color:var(--text2);line-height:1.8">';
    if(profile.stage)h+='<div><strong>Stage:</strong> '+profile.stage+'</div>';
    if(profile.spec)h+='<div><strong>Specialty:</strong> '+profile.spec+'</div>';
    if(profile.goal)h+='<div><strong>Goal:</strong> '+profile.goal+'</div>';
    if(profile.inst)h+='<div><strong>Institution:</strong> '+profile.inst+'</div>';
    if(profile.pubs)h+='<div><strong>Publications:</strong> '+profile.pubs+'</div>';
    if(profile.lead)h+='<div><strong>Leadership Roles:</strong> '+profile.lead+'</div>';
    if(profile.comp)h+='<div><strong>Compensation:</strong> '+profile.comp+'</div>';
    if(profile.practice)h+='<div><strong>Practice Model:</strong> '+profile.practice+'</div>';
    if(profile.debt)h+='<div><strong>Loan Balance:</strong> '+profile.debt+'</div>';
    h+='</div></details>';
  }
  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
}

function renderProgressDashboard(){
  var el=document.getElementById('progress-dashboard');
  if(!el||!U)return;
  var mine=DB.questions.filter(function(q){return q.userId===U.id});
  if(mine.length<1){el.innerHTML='';return}
  var cats={};var reviewed=0;var total=mine.length;
  mine.forEach(function(q){
    cats[q.cat]=(cats[q.cat]||0)+1;
    if(q.status==='reviewed')reviewed++;
  });
  var CATS_MAP={career:'Career Strategy',fellowship:'Fellowship',finance:'Financial Planning',contract:'Contracts',research:'Research',clinical:'Clinical',wellness:'Wellness'};
  var CATS_ICON={career:'🎯',fellowship:'🏥',finance:'💰',contract:'📄',research:'🔬',clinical:'🧠',wellness:'🌿'};
  // Sort by count descending
  var sorted=Object.entries(cats).sort(function(a,b){return b[1]-a[1]});
  var maxCount=sorted[0]?sorted[0][1]:1;
  var h='<div class="card" style="padding:18px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h+='<span style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Progress Tracker</span>';
  h+='<span style="font-size:11px;color:var(--text3)">'+total+' question'+(total!==1?'s':'')+'</span></div>';
  // Category breakdown bars
  sorted.forEach(function(pair){
    var cat=pair[0],cnt=pair[1];
    var pct=Math.round((cnt/maxCount)*100);
    h+='<div style="margin-bottom:10px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    h+='<span style="font-size:12px;color:var(--text2)">'+(CATS_ICON[cat]||'📌')+' '+(CATS_MAP[cat]||cat)+'</span>';
    h+='<span style="font-size:11px;color:var(--accent);font-weight:600">'+cnt+'</span></div>';
    h+='<div style="height:4px;background:var(--bg2);border-radius:2px;overflow:hidden">';
    h+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:2px;transition:width .3s"></div>';
    h+='</div></div>';
  });
  // Stats row
  h+='<div style="display:flex;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">';
  h+='<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--accent)">'+total+'</div><div style="font-size:10px;color:var(--text3)">Asked</div></div>';
  h+='<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--green)">'+reviewed+'</div><div style="font-size:10px;color:var(--text3)">Reviewed</div></div>';
  h+='<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--text2)">'+Object.keys(cats).length+'</div><div style="font-size:10px;color:var(--text3)">Categories</div></div>';
  h+='</div></div>';
  el.innerHTML=h;
}

// ===== GOAL TRACKER (Core + Elite) =====

var GOAL_TEMPLATES={
  // stage_goal → monthly goal sets
  student_match:{
    title:'Fellowship Match Prep',
    months:[
      {label:'Month 1',goals:['Identify target specialty with conviction','Start one research project (case report or abstract)','Build relationships with 2 potential letter writers','Create a tiered program list (reach/target/safety)']},
      {label:'Month 2',goals:['Submit first abstract to a national conference','Get informal feedback on application strength from a mentor','Draft personal statement outline','Complete one away rotation application']},
      {label:'Month 3',goals:['Finish first draft of personal statement','Have 3+ letter writers confirmed','Manuscript in progress or submitted','Attend a subspecialty conference or networking event']}
    ]
  },
  student_finance:{
    title:'Financial Foundation',
    months:[
      {label:'Month 1',goals:['Calculate total projected debt at graduation','Research PSLF eligibility for target employers','Open a Roth IRA if you have earned income','Create a basic budget tracking your spending']},
      {label:'Month 2',goals:['Compare income-driven repayment plans (IBR, PAYE, REPAYE)','Get a disability insurance quote (trainee discount)','Set up automatic savings — even $50/month builds the habit','Read White Coat Investor\'s student guide']},
      {label:'Month 3',goals:['Build a 1-month emergency fund','Map out your loan repayment strategy (PSLF vs refinance)','Understand your future contract compensation models (RVU, salary, hybrid)','Connect with a fee-only financial advisor for a one-time consultation']}
    ]
  },
  resident_match:{
    title:'Fellowship Positioning',
    months:[
      {label:'Month 1',goals:['Finalize subspecialty decision and tell your PD','Start or accelerate a first-author research project','Identify 3 specialty-specific letter writers','Build tiered program list of 15-20 programs']},
      {label:'Month 2',goals:['Submit abstract to ACC, AHA, or relevant society','Schedule away rotations at 1-2 target programs','Get honest CV review from a mentor in your target field','Begin personal statement — 3+ drafts minimum']},
      {label:'Month 3',goals:['First-author manuscript submitted or near completion','Confirm all letter writers and give them your CV + personal statement','Personal statement polished (5+ revisions)','Research each target program specifically (PD name, research focus, culture)']}
    ]
  },
  resident_contract:{
    title:'Contract & Job Search',
    months:[
      {label:'Month 1',goals:['Research MGMA median compensation for your specialty','Understand RVU-based vs salary-based compensation models','Learn the 7 key contract red flags (non-compete, tail, termination)','Talk to 2 attendings about their contract negotiation experience']},
      {label:'Month 2',goals:['Use the Contract Risk Scorecard on a sample contract','Start building a list of target employers/practices','Get an introduction to a healthcare attorney (for when you need one)','Understand your geographic flexibility and non-negotiables']},
      {label:'Month 3',goals:['Compare at least 2 real or sample offers using the Comparison Matrix','Calculate your true compensation (base + RVU + benefits + call)','Draft your negotiation priorities list','Determine your PSLF eligibility — this affects which employers to target']}
    ]
  },
  resident_finance:{
    title:'Financial Strategy',
    months:[
      {label:'Month 1',goals:['Calculate your total student loan balance and interest rate','Make the PSLF vs refinance decision (or know what info you still need)','Get own-occupation disability insurance quotes — buy during training','Open and max your Roth IRA ($7,000)']},
      {label:'Month 2',goals:['Create a post-training budget that maintains near-resident spending','Map your employer retirement plan options and match percentage','Build a 3-month emergency fund plan','Understand your tax bracket and basic tax-advantaged account strategy']},
      {label:'Month 3',goals:['Set up automatic investments — index funds, target date, or robo-advisor','Get term life insurance if you have dependents','Review your attending contract for financial red flags','Build a 3-year financial projection (Year 1: foundation, Year 2: acceleration, Year 3: leverage)']}
    ]
  },
  resident_direction:{
    title:'Career Direction',
    months:[
      {label:'Month 1',goals:['Diagnose your dissatisfaction: specialty, setting, job, or burnout?','Shadow or talk to 2 physicians in a potential new path','Take stock: what energizes you vs what drains you in your current role','Journal for 2 weeks — track daily satisfaction and frustration triggers']},
      {label:'Month 2',goals:['Informational interviews with 3 people who made a similar pivot','Calculate the financial cost of a pivot (use the Career Pivot Decision Engine)','Test the new direction: moonlight, volunteer, or take an elective','Discuss your thinking with a trusted mentor — get honest feedback']},
      {label:'Month 3',goals:['Make a provisional decision and set a 90-day trial period','If staying: identify 2 concrete changes to improve your current situation','If pivoting: map the timeline, training requirements, and financial bridge','Submit a Strategic Audit to Dr. Faroqui for structured guidance']}
    ]
  },
  fellow_contract:{
    title:'First Attending Contract',
    months:[
      {label:'Month 1',goals:['Research MGMA compensation benchmarks for your subspecialty','Understand the 7 contract red flags and how to negotiate each one','Start networking with potential employers — conferences, alumni, faculty contacts','Define your non-negotiables: geography, practice type, call, compensation floor']},
      {label:'Month 2',goals:['Use the Contract Intelligence Tool to score any offers you receive','Compare offers side-by-side using the Offer Comparison Matrix','Get a healthcare attorney recommendation from your program','Understand tail coverage, non-competes, and clawback terms in detail']},
      {label:'Month 3',goals:['Negotiate your top offer — use specific MGMA data as leverage','Finalize your PSLF vs refinance decision based on employer type','Review the 3-Year Leverage Planner — map your first 3 attending years','Sign with confidence — or walk away if the deal isn\'t right']}
    ]
  },
  fellow_finance:{
    title:'Wealth Building',
    months:[
      {label:'Month 1',goals:['Model your attending compensation using the RVU Calculator','Make the PSLF vs refinance decision — this is a $50K-$200K decision','Secure own-occupation disability insurance before finishing training','Plan your post-fellowship budget: live on resident salary for Year 1']},
      {label:'Month 2',goals:['Max your Roth IRA and understand backdoor Roth strategy','Map out all tax-advantaged accounts: 401k, HSA, mega backdoor Roth','Build 6-month emergency fund plan on attending salary','Get a fee-only fiduciary financial advisor consultation']},
      {label:'Month 3',goals:['Set up automatic investment plan — index funds on autopilot','Use the Financial Trajectory Simulator to model your 30-year wealth','Term life insurance if you have dependents','Create your personal "Year 1 financial playbook" — specific dollar amounts for each goal']}
    ]
  },
  attending_contract:{
    title:'Contract Optimization',
    months:[
      {label:'Month 1',goals:['Benchmark your current compensation against MGMA data for your specialty','Identify the 3 weakest terms in your current contract','Research what top-performing physicians in your specialty are earning','List your leverage points: productivity, patient satisfaction, unique skills']},
      {label:'Month 2',goals:['Prepare your renegotiation case with specific data and comparables','Use the Contract Intelligence Tool to score your current deal','Talk to a healthcare attorney about your non-compete and termination terms','Explore alternative opportunities — even if you\'re not planning to leave']},
      {label:'Month 3',goals:['Have the renegotiation conversation — or start interviewing','Compare any new offers using the Offer Comparison Matrix','Evaluate partnership/equity track if applicable','Make a decision: renegotiate, move, or stay with clarity']}
    ]
  },
  attending_finance:{
    title:'Wealth Acceleration',
    months:[
      {label:'Month 1',goals:['Run your 30-year projection in the Financial Trajectory Simulator','Audit your savings rate — are you hitting 20%+ of gross income?','Review all tax-advantaged accounts: are you maxing everything?','Check your disability and life insurance coverage — still adequate?']},
      {label:'Month 2',goals:['Evaluate your investment allocation — too conservative? Too concentrated?','Calculate your net worth and set a 12-month target','Review your student loan strategy — PSLF on track? Refinance rate competitive?','Consider real estate, side income, or practice ownership opportunities']},
      {label:'Month 3',goals:['Meet with your financial advisor for annual review','Optimize your tax strategy — charitable giving, retirement contributions, entity structure','Set your next 12-month financial goals with specific dollar amounts','Build or update your estate plan (will, trust, beneficiaries)']}
    ]
  },
  attending_direction:{
    title:'Career Reinvention',
    months:[
      {label:'Month 1',goals:['Complete the Career Pivot Decision Engine — diagnose before you prescribe','Talk to 3 physicians who\'ve made the pivot you\'re considering','Calculate the true financial cost of transition','Assess: is this burnout (temporary) or misalignment (structural)?']},
      {label:'Month 2',goals:['Test the new direction without quitting: moonlight, consult, teach, or volunteer','Build a 12-month financial bridge plan','Identify skills that transfer and gaps that need filling','Submit a Strategic Audit to Dr. Faroqui for structured review']},
      {label:'Month 3',goals:['Make a provisional decision with a clear timeline','If staying clinical: negotiate specific changes to your current role','If pivoting: set a start date and announce to key stakeholders','Build your support system — mentors, peers, family alignment']}
    ]
  }
};

// Fallback goals for combinations not explicitly defined
var GOAL_DEFAULTS={
  student:{title:'Medical Student Goals',goals:['Set a clear career direction and target specialty','Start one research or scholarly project','Build relationships with 2-3 potential mentors','Create a financial plan for your remaining training']},
  resident:{title:'Resident Goals',goals:['Advance your primary career objective this month','Complete one scholarly activity (abstract, case report, or QI project)','Strengthen a key mentor relationship','Review your financial plan — loans, insurance, savings']},
  fellow:{title:'Fellow Goals',goals:['Progress toward your first attending position','Submit or advance a research project','Network with 2 potential employers or collaborators','Finalize your post-fellowship financial strategy']},
  attending:{title:'Attending Goals',goals:['Review and optimize your current contract terms','Advance one professional development goal','Check your financial trajectory — savings rate, investments, debt','Invest in one relationship that will matter in 5 years']}
};

function getGoalTemplate(){
  if(!U)return null;
  var stage=U.stage||(U.profile&&U.profile.stage)||U.role||'resident';
  var goal=U.goal||(U.profile&&U.profile.goal)||'';
  // Normalize stage
  if(stage==='switching')stage='attending';
  if(stage==='other')stage='resident';
  // Map user goal to template key
  var goalKey='';
  if(goal==='match'||goal==='fellowship')goalKey='match';
  else if(goal==='contract'||goal==='job'||goal==='jobs')goalKey='contract';
  else if(goal==='finance'||goal==='financial'||goal==='wealth')goalKey='finance';
  else if(goal==='direction'||goal==='pivot'||goal==='career')goalKey='direction';
  else goalKey='finance'; // default

  var key=stage+'_'+goalKey;
  return GOAL_TEMPLATES[key]||null;
}

function getCurrentMonth(){
  if(_goalMonthOverride!==null)return _goalMonthOverride;
  if(!U)return 0;
  var signup=U.signupDate||U.created_at||(U.profile&&U.profile.signupDate)||null;
  if(!signup)return 0;
  var d=new Date(signup);
  var now=new Date();
  var months=Math.floor((now-d)/(30*24*60*60*1000));
  return Math.min(months,2); // 0, 1, or 2
}

async function renderGoalTracker(){
  var el=document.getElementById('goal-tracker');
  if(!el||!U)return;
  // Only for core and elite
  if(U.tier!=='core'&&U.tier!=='elite'&&U.tier!=='admin'){el.innerHTML='';return}

  var template=getGoalTemplate();
  if(!template){
    // Use stage defaults
    var stage=U.stage||U.role||'resident';
    if(stage==='switching')stage='attending';
    var def=GOAL_DEFAULTS[stage]||GOAL_DEFAULTS.resident;
    template={title:def.title,months:[{label:'This Month',goals:def.goals}]};
  }

  // Load saved progress from Supabase
  var savedProgress=await loadGoalProgress();
  var monthIdx=getCurrentMonth();
  var currentGoals=template.months[Math.min(monthIdx,template.months.length-1)];

  var h='<div class="card" style="padding:20px;border-color:rgba(200,168,124,.2)">';

  // Header
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
  h+='<div style="display:flex;align-items:center;gap:8px">';
  h+='<span style="font-size:18px">\ud83c\udfaf</span>';
  h+='<span style="font-size:14px;font-weight:600;color:var(--text)">'+template.title+'</span>';
  h+='</div>';
  h+='<span class="tag" style="background:var(--accent-dim);color:var(--accent);font-size:10px">'+currentGoals.label+'</span>';
  h+='</div>';
  h+='<p style="font-size:11px;color:var(--text3);margin-bottom:16px">Track your progress. Dr. Faroqui reviews your updates.</p>';

  // Progress bar
  var completed=0;
  var totalGoals=currentGoals.goals.length;
  currentGoals.goals.forEach(function(g,i){
    var goalId=monthIdx+'_'+i;
    if(savedProgress[goalId]&&savedProgress[goalId].status==='done')completed++;
  });
  var pctDone=totalGoals>0?Math.round((completed/totalGoals)*100):0;
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h+='<span style="font-size:11px;color:var(--text3)">'+completed+' of '+totalGoals+' completed</span>';
  h+='<span style="font-size:12px;font-weight:600;color:var(--accent)">'+pctDone+'%</span></div>';
  h+='<div style="height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;margin-bottom:18px">';
  h+='<div style="height:100%;width:'+pctDone+'%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:3px;transition:width .4s"></div></div>';

  // Goal checklist
  currentGoals.goals.forEach(function(g,i){
    var goalId=monthIdx+'_'+i;
    var progress=savedProgress[goalId]||{};
    var isDone=progress.status==='done';
    var isBlocked=progress.status==='blocked';

    h+='<div style="padding:12px;background:'+(isDone?'rgba(106,191,75,.04)':'var(--bg2)')+';border:1px solid '+(isDone?'rgba(106,191,75,.2)':isBlocked?'rgba(239,68,68,.2)':'var(--border)')+';border-radius:10px;margin-bottom:8px">';
    h+='<div style="display:flex;gap:10px;align-items:flex-start">';

    // Checkbox
    h+='<button onclick="toggleGoal(\''+goalId+'\')" style="flex-shrink:0;width:22px;height:22px;border-radius:6px;border:2px solid '+(isDone?'var(--green)':'var(--border)')+';background:'+(isDone?'var(--green)':'transparent')+';cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:1px;transition:all .2s">';
    if(isDone)h+='<span style="color:#fff;font-size:12px;font-weight:700">\u2713</span>';
    h+='</button>';

    h+='<div style="flex:1;min-width:0">';
    h+='<div style="font-size:12px;color:'+(isDone?'var(--green)':'var(--text)')+';line-height:1.5;'+(isDone?'text-decoration:line-through;opacity:.7':'')+'">'+g+'</div>';

    // Show blocker if marked
    if(isBlocked&&progress.blocker){
      h+='<div style="margin-top:6px;padding:8px 10px;background:rgba(239,68,68,.06);border-radius:6px;border-left:2px solid var(--red)">';
      h+='<div style="font-size:10px;font-weight:600;color:var(--red);margin-bottom:2px">BLOCKER</div>';
      h+='<div style="font-size:11px;color:var(--text2)">'+progress.blocker+'</div></div>';
    }

    // Action buttons (only if not done)
    if(!isDone){
      h+='<div style="display:flex;gap:6px;margin-top:8px">';
      h+='<button onclick="markGoalBlocked(\''+goalId+'\')" style="font-size:10px;padding:4px 10px;border:1px solid '+(isBlocked?'var(--red)':'var(--border)')+';border-radius:6px;color:'+(isBlocked?'var(--red)':'var(--text3)')+';background:transparent;cursor:pointer">'+(isBlocked?'\ud83d\udea9 Blocked':'Report Blocker')+'</button>';
      h+='</div>';
    }

    h+='</div></div></div>';
  });

  // Month navigation
  if(template.months.length>1){
    h+='<div style="display:flex;gap:6px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">';
    template.months.forEach(function(m,i){
      var isActive=i===Math.min(monthIdx,template.months.length-1);
      h+='<button onclick="switchGoalMonth('+i+')" style="flex:1;padding:8px;font-size:11px;border:1px solid '+(isActive?'var(--accent)':'var(--border)')+';border-radius:6px;background:'+(isActive?'var(--accent-dim)':'transparent')+';color:'+(isActive?'var(--accent)':'var(--text3)')+';cursor:pointer;font-weight:'+(isActive?'600':'400')+'">'+m.label+'</button>';
    });
    h+='</div>';
  }

  // Weekly check-in prompt
  var lastCheckin=savedProgress._lastCheckin||'';
  var daysSince=lastCheckin?Math.floor((Date.now()-new Date(lastCheckin))/(24*60*60*1000)):999;
  if(daysSince>=7){
    h+='<div style="margin-top:14px;padding:14px;background:linear-gradient(135deg,rgba(200,168,124,.08),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.15);border-radius:10px">';
    h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:6px">\ud83d\udcac Weekly Check-In</div>';
    h+='<p style="font-size:11px;color:var(--text3);margin-bottom:10px">How\'s this '+(currentGoals.label||'month')+' going? Your update goes directly to Dr. Faroqui.</p>';
    h+='<textarea id="goal-checkin-text" rows="3" placeholder="What progress did you make this week? What\'s blocking you?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical;margin-bottom:8px;box-sizing:border-box"></textarea>';
    h+='<button class="btn btn-a btn-sm" onclick="submitGoalCheckin()" style="width:100%;padding:10px">Submit Check-In</button>';
    h+='</div>';
  }

  h+='</div>';
  el.innerHTML=h;
}

// Goal month view state
var _goalMonthOverride=null;

function switchGoalMonth(idx){
  _goalMonthOverride=idx;
  renderGoalTracker();
}

// Load goal progress from Supabase or localStorage
async function loadGoalProgress(){
  var key='hw_goals_'+(U?U.email:'');
  var local=localStorage.getItem(key);
  var progress=local?JSON.parse(local):{};

  // Also try Supabase
  if(_supaClient&&U&&U.email){
    try{
      var{data}=await _supaClient.from('profiles').select('notes').eq('email',U.email).single();
      if(data&&data.notes){
        // Find goal progress in notes
        var goalNote=data.notes.find(function(n){return n.type==='goal_progress'});
        if(goalNote&&goalNote.data){
          progress=goalNote.data;
          localStorage.setItem(key,JSON.stringify(progress));
        }
      }
    }catch(ex){}
  }
  return progress;
}

// Save goal progress
async function saveGoalProgress(progress){
  var key='hw_goals_'+(U?U.email:'');
  localStorage.setItem(key,JSON.stringify(progress));

  // Sync to Supabase
  if(_supaClient&&U&&U.email){
    try{
      var{data}=await _supaClient.from('profiles').select('notes').eq('email',U.email).single();
      if(data){
        var notes=data.notes||[];
        // Remove old goal progress note
        notes=notes.filter(function(n){return n.type!=='goal_progress'});
        // Add updated progress
        notes.push({type:'goal_progress',data:progress,updated:new Date().toISOString()});
        await _supaClient.from('profiles').update({notes:notes}).eq('email',U.email);
      }
    }catch(ex){console.warn('Goal sync error',ex)}
  }
}

async function toggleGoal(goalId){
  var progress=await loadGoalProgress();
  if(progress[goalId]&&progress[goalId].status==='done'){
    // Undo
    delete progress[goalId];
  }else{
    progress[goalId]={status:'done',date:new Date().toISOString()};
    // Send progress update to admin
    reportGoalUpdate(goalId,'completed');
  }
  await saveGoalProgress(progress);
  renderGoalTracker();
}

async function markGoalBlocked(goalId){
  var blocker=prompt('What\'s preventing you from completing this goal?');
  if(!blocker||!blocker.trim())return;
  var progress=await loadGoalProgress();
  progress[goalId]={status:'blocked',blocker:blocker.trim(),date:new Date().toISOString()};
  await saveGoalProgress(progress);
  // Report blocker to admin
  reportGoalUpdate(goalId,'blocked',blocker.trim());
  notify('Blocker reported \u2014 Dr. Faroqui will review');
  renderGoalTracker();
}

async function submitGoalCheckin(){
  var text=document.getElementById('goal-checkin-text');
  if(!text||!text.value.trim()){notify('Write something about your progress',1);return}
  var checkinText=text.value.trim();

  // Save last checkin timestamp
  var progress=await loadGoalProgress();
  progress._lastCheckin=new Date().toISOString();
  await saveGoalProgress(progress);

  // Get current goals for context
  var template=getGoalTemplate();
  var monthIdx=getCurrentMonth();
  var currentGoals=template?template.months[Math.min(monthIdx,template.months.length-1)]:null;
  var completed=0;var total=0;
  if(currentGoals){
    total=currentGoals.goals.length;
    currentGoals.goals.forEach(function(g,i){
      var gid=monthIdx+'_'+i;
      if(progress[gid]&&progress[gid].status==='done')completed++;
    });
  }

  // Send to admin via messages table
  var payload={
    user_name:U.name||'Unknown',
    user_email:U.email,
    type:'progress',
    message:'WEEKLY CHECK-IN \u2014 '+(template?template.title:'Goals')+' ('+completed+'/'+total+' completed)\n\n'+checkinText,
    read:false,
    date:new Date().toISOString()
  };
  if(_supaClient){
    await _supaClient.from('messages').insert([payload]).catch(function(){});
  }
  if(!DB.messages)DB.messages=[];
  DB.messages.push(payload);
  saveDB();

  notify('Check-in submitted! Dr. Faroqui will review your progress \ud83d\udcaa');
  renderGoalTracker();
}

// Report individual goal updates to admin
function reportGoalUpdate(goalId,action,detail){
  var template=getGoalTemplate();
  if(!template)return;
  var parts=goalId.split('_');
  var monthIdx=parseInt(parts[0]);
  var goalIdx=parseInt(parts[1]);
  var month=template.months[monthIdx];
  var goalText=month?month.goals[goalIdx]:'';

  var msg=action==='completed'
    ? 'GOAL COMPLETED: "'+goalText+'" ('+month.label+')'
    : 'BLOCKER: "'+goalText+'" ('+month.label+')\nIssue: '+detail;

  var payload={
    user_name:U.name||'Unknown',
    user_email:U.email,
    type:'progress',
    message:msg,
    read:false,
    date:new Date().toISOString()
  };
  if(_supaClient){
    _supaClient.from('messages').insert([payload]).then(function(){}).catch(function(){});
  }
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

function toggleContactForm(){document.getElementById('contact-form').classList.toggle('hidden')}

// Email notification to admin via Supabase Edge Function
function notifyAdmin(payload){
  if(!_supaClient)return;
  _supaClient.functions.invoke('notify-email',{body:{
    user_name:payload.user_name||'Unknown',
    user_email:payload.user_email||'',
    type:payload.type||'other',
    message:payload.message||''
  }}).catch(function(){});
}

async function sendContactMessage(e){
  e.preventDefault();
  var type=document.getElementById('contact-type').value;
  var msg=document.getElementById('contact-msg').value.trim();
  if(!msg){notify('Please enter a message',1);return}

  // Career/finance/contract messages require physician review credits
  var needsCredit=type==='career'||type==='finance'||type==='contract';
  if(needsCredit){
    if(!U||!U.usage||(U.usage.credits||0)<=0){
      notify('You need physician review credits to send career, finance, or contract questions. Upgrade your plan to get credits.',1);
      return;
    }
    U.usage.credits--;
    localStorage.setItem('hw_session',JSON.stringify(U));saveDB();
    renderHome();
  }

  var payload={
    user_name:U?U.name:'Unknown',
    user_email:U?U.email:'Unknown',
    type:type,
    message:msg,
    date:new Date().toISOString()
  };
  // Store in Supabase
  if(_supaClient){
    try{
      await _supaClient.from('messages').insert([payload]);
    }catch(ex){console.warn('Message store failed',ex)}
  }
  // Also store locally
  if(!DB.messages)DB.messages=[];
  DB.messages.push(payload);saveDB();
  document.getElementById('contact-msg').value='';
  document.getElementById('contact-form').classList.add('hidden');
  notify('Message sent! Thank you for your feedback. 🙏');
  // Email notification to admin
  notifyAdmin(payload);
}

function toggleAccountSettings(){
  const s=document.getElementById('account-settings');
  s.classList.toggle('hidden');
  if(!s.classList.contains('hidden')&&U){
    document.getElementById('acc-name').value=U.name||'';
    document.getElementById('acc-email').value=U.email||'';
    document.getElementById('acc-pass').value='';
    document.getElementById('acc-pass2').value='';
  }
}

async function saveAccountSettings(e){
  e.preventDefault();
  const name=document.getElementById('acc-name').value.trim();
  const email=document.getElementById('acc-email').value.trim().toLowerCase();
  const pass=document.getElementById('acc-pass').value;
  const pass2=document.getElementById('acc-pass2').value;
  if(!name){notify('Name cannot be empty',1);return}
  if(!email){notify('Email cannot be empty',1);return}
  if(pass&&pass!==pass2){notify('Passwords do not match',1);return}
  if(pass&&pass.length<8){notify('Password must be at least 8 characters',1);return}
  // Check if email changed and not taken by another user
  if(email!==U.email.toLowerCase()){
    const taken=DB.users.find(u=>u.email.toLowerCase()===email&&u.id!==U.id);
    if(taken){notify('Email already in use',1);return}
  }
  // Update local DB
  U.name=name;
  U.email=email;
  if(pass)U.pass=pass;
  saveDB();localStorage.setItem('hw_session',JSON.stringify(U));
  // Update Supabase if available
  if(_supaClient){
    try{
      const updates={};
      if(email!==U.email)updates.email=email;
      if(pass)updates.password=pass;
      updates.data={name};
      await _supaClient.auth.updateUser(updates);
    }catch(ex){}
  }
  renderProfile();
  notify('Account updated!');
  document.getElementById('account-settings').classList.add('hidden');
}
// ===== CONTRACT INTELLIGENCE TOOL =====
var CI_MGMA={
  im:{p25:235,p50:265,p75:305},hosp:{p25:270,p50:310,p75:365},cards:{p25:450,p50:520,p75:610},
  ic:{p25:550,p50:660,p75:800},ep:{p25:500,p50:620,p75:740},ct_surg:{p25:480,p50:600,p75:760},
  gi:{p25:400,p50:480,p75:570},pulm:{p25:340,p50:400,p75:460},heme_onc:{p25:380,p50:460,p75:540},
  nephro:{p25:290,p50:340,p75:390},rheum:{p25:270,p50:310,p75:360},endo:{p25:250,p50:290,p75:330},
  id:{p25:250,p50:290,p75:330},gen_surg:{p25:350,p50:410,p75:500},ortho:{p25:490,p50:580,p75:720},
  uro:{p25:400,p50:480,p75:580},ent:{p25:360,p50:430,p75:530},derm:{p25:370,p50:430,p75:540},
  rad:{p25:380,p50:460,p75:550},anes:{p25:350,p50:410,p75:480},er:{p25:300,p50:340,p75:390},
  fm:{p25:215,p50:255,p75:300},psych:{p25:260,p50:300,p75:360},pm_r:{p25:280,p50:330,p75:390},
  neuro:{p25:280,p50:330,p75:390},path:{p25:290,p50:340,p75:390},ophtho:{p25:320,p50:400,p75:520},
  peds:{p25:210,p50:250,p75:290}
};

function ciInit(){ciCalc()}

function ciCalc(){
  var spec=document.getElementById('ci-spec').value;
  var salary=parseFloat(document.getElementById('ci-salary').value)||0;
  var rvu=parseFloat(document.getElementById('ci-rvu').value)||0;
  var ncRadius=parseFloat(document.getElementById('ci-nc-radius').value)||0;
  var ncYears=parseFloat(document.getElementById('ci-nc-years').value)||0;
  var tail=document.getElementById('ci-tail').value;
  var termNotice=parseFloat(document.getElementById('ci-term-notice').value)||0;
  var callFreq=document.getElementById('ci-call').value;
  var callComp=document.getElementById('ci-call-comp').value;
  var signing=parseFloat(document.getElementById('ci-signing').value)||0;
  var clawback=parseFloat(document.getElementById('ci-clawback').value)||0;
  var retMatch=parseFloat(document.getElementById('ci-ret').value)||0;
  var cme=parseFloat(document.getElementById('ci-cme').value)||0;

  var mgma=CI_MGMA[spec]||CI_MGMA.im;
  var salaryK=salary;

  // Score components (out of 100 total)
  var score=0;var maxScore=100;
  var details=[];

  // 1. Salary vs MGMA (0-30 pts)
  var salPts=0;
  if(salaryK>=mgma.p75){salPts=30;details.push({label:'Base Salary',pts:30,max:30,note:'Above 75th percentile — excellent',color:'var(--green)'})}
  else if(salaryK>=mgma.p50){salPts=22;details.push({label:'Base Salary',pts:22,max:30,note:'At or above median — solid',color:'var(--green)'})}
  else if(salaryK>=mgma.p25){salPts=14;details.push({label:'Base Salary',pts:14,max:30,note:'Below median — room to negotiate',color:'var(--accent)'})}
  else{salPts=6;details.push({label:'Base Salary',pts:6,max:30,note:'Below 25th percentile — significant concern',color:'var(--red)'})}
  score+=salPts;

  // 2. RVU Rate (0-15 pts)
  var rvuPts=0;
  if(rvu===0){rvuPts=8;details.push({label:'RVU Rate',pts:8,max:15,note:'No RVU structure (salary only)',color:'var(--text3)'})}
  else if(rvu>=55){rvuPts=15;details.push({label:'RVU Rate',pts:15,max:15,note:'Strong RVU rate ($55+)',color:'var(--green)'})}
  else if(rvu>=45){rvuPts=11;details.push({label:'RVU Rate',pts:11,max:15,note:'Competitive RVU rate',color:'var(--green)'})}
  else if(rvu>=35){rvuPts=7;details.push({label:'RVU Rate',pts:7,max:15,note:'Below average RVU rate — negotiate up',color:'var(--accent)'})}
  else{rvuPts=3;details.push({label:'RVU Rate',pts:3,max:15,note:'Low RVU rate — red flag',color:'var(--red)'})}
  score+=rvuPts;

  // 3. Non-compete (0-15 pts)
  var ncPts=0;
  if(ncRadius===0&&ncYears===0){ncPts=15;details.push({label:'Non-Compete',pts:15,max:15,note:'No restrictive covenant — ideal',color:'var(--green)'})}
  else if(ncRadius<=15&&ncYears<=1){ncPts=12;details.push({label:'Non-Compete',pts:12,max:15,note:'Reasonable (≤15mi, ≤1yr)',color:'var(--green)'})}
  else if(ncRadius<=25&&ncYears<=2){ncPts=7;details.push({label:'Non-Compete',pts:7,max:15,note:'Moderate risk ('+ncRadius+'mi, '+ncYears+'yr)',color:'var(--accent)'})}
  else{ncPts=2;details.push({label:'Non-Compete',pts:2,max:15,note:'Aggressive covenant — major risk',color:'var(--red)'})}
  score+=ncPts;

  // 4. Tail insurance (0-10 pts)
  var tailPts=0;
  if(tail==='employer'){tailPts=10;details.push({label:'Tail Coverage',pts:10,max:10,note:'Employer pays — excellent',color:'var(--green)'})}
  else if(tail==='occurrence'){tailPts=10;details.push({label:'Tail Coverage',pts:10,max:10,note:'Occurrence policy — no tail needed',color:'var(--green)'})}
  else if(tail==='split'){tailPts=6;details.push({label:'Tail Coverage',pts:6,max:10,note:'Split cost — negotiate for full employer coverage',color:'var(--accent)'})}
  else{tailPts=1;details.push({label:'Tail Coverage',pts:1,max:10,note:'You pay full tail ($20-50K+) — negotiate',color:'var(--red)'})}
  score+=tailPts;

  // 5. Termination (0-10 pts)
  var termPts=0;
  if(termNotice>=120){termPts=10;details.push({label:'Termination Notice',pts:10,max:10,note:'120+ days — strong protection',color:'var(--green)'})}
  else if(termNotice>=90){termPts=8;details.push({label:'Termination Notice',pts:8,max:10,note:'90 days — standard',color:'var(--green)'})}
  else if(termNotice>=60){termPts=5;details.push({label:'Termination Notice',pts:5,max:10,note:'60 days — short, negotiate up',color:'var(--accent)'})}
  else{termPts=2;details.push({label:'Termination Notice',pts:2,max:10,note:'<60 days — inadequate, push for 90+',color:'var(--red)'})}
  score+=termPts;

  // 6. Call (0-10 pts)
  var callPts=0;
  if(callFreq==='none'){callPts=10;details.push({label:'Call Burden',pts:10,max:10,note:'No call — ideal',color:'var(--green)'})}
  else if(callFreq==='1in6'&&callComp==='yes'){callPts=8;details.push({label:'Call Burden',pts:8,max:10,note:'1:6 or less, compensated — reasonable',color:'var(--green)'})}
  else if(callComp==='yes'){callPts=6;details.push({label:'Call Burden',pts:6,max:10,note:'Compensated call — acceptable',color:'var(--green)'})}
  else if(callFreq==='1in4'){callPts=3;details.push({label:'Call Burden',pts:3,max:10,note:'1:4 uncompensated — negotiate stipend',color:'var(--accent)'})}
  else{callPts=2;details.push({label:'Call Burden',pts:2,max:10,note:'Heavy uncompensated call — red flag',color:'var(--red)'})}
  score+=callPts;

  // 7. Benefits (0-10 pts)
  var benPts=0;
  var benScore=0;
  if(retMatch>=4)benScore+=3;else if(retMatch>=2)benScore+=2;else benScore+=1;
  if(cme>=3000)benScore+=3;else if(cme>=1500)benScore+=2;else benScore+=1;
  if(signing>=30)benScore+=4;else if(signing>=15)benScore+=3;else if(signing>0)benScore+=2;else benScore+=1;
  benPts=Math.min(10,benScore);
  var benNote=benPts>=8?'Strong benefits package':'Benefits could be improved — negotiate CME, match, or signing bonus';
  var benColor=benPts>=8?'var(--green)':benPts>=5?'var(--accent)':'var(--red)';
  details.push({label:'Benefits Package',pts:benPts,max:10,note:benNote,color:benColor});
  score+=benPts;

  // Render
  var scoreColor=score>=80?'var(--green)':score>=60?'var(--accent)':'var(--red)';
  var scoreLabel=score>=80?'Strong Offer':score>=60?'Competitive — Negotiate Specifics':score>=40?'Below Average — Significant Negotiation Needed':'Weak Offer — Major Concerns';

  var out=document.getElementById('ci-output');
  out.innerHTML='<div style="text-align:center;margin-bottom:20px">'+
    '<div style="width:90px;height:90px;border-radius:50%;border:4px solid '+scoreColor+';display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px">'+
    '<span style="font-size:32px;font-weight:700;color:'+scoreColor+'">'+score+'</span></div>'+
    '<div style="font-size:14px;font-weight:600;color:var(--text)">'+scoreLabel+'</div>'+
    '<div style="font-size:11px;color:var(--text3)">Offer Competitiveness Score</div></div>';

  // MGMA comparison bar
  out.innerHTML+='<div style="background:var(--bg3);border-radius:8px;padding:14px;margin-bottom:16px">'+
    '<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Salary vs MGMA Benchmarks — '+FT_SPEC_NAMES[spec]+'</div>'+
    '<div style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:6px">'+
    '<span style="color:var(--text3);width:32px">25th</span>'+
    '<div style="flex:1;height:6px;background:var(--bg);border-radius:3px;position:relative;overflow:visible">'+
    '<div style="position:absolute;left:0;top:0;height:100%;width:100%;background:linear-gradient(90deg,var(--red),var(--accent),var(--green));border-radius:3px;opacity:.3"></div>'+
    '<div style="position:absolute;top:-4px;width:3px;height:14px;background:var(--accent);border-radius:2px;left:'+Math.max(0,Math.min(100,(salaryK-mgma.p25)/(mgma.p75-mgma.p25)*100))+'%"></div>'+
    '</div>'+
    '<span style="color:var(--text3);width:32px;text-align:right">75th</span></div>'+
    '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)">'+
    '<span>$'+mgma.p25+'K</span><span>$'+mgma.p50+'K (median)</span><span>$'+mgma.p75+'K</span></div>'+
    '<div style="text-align:center;margin-top:8px;font-size:12px;font-weight:600;color:var(--text)">Your offer: $'+salaryK+'K</div></div>';

  // Detail breakdown
  out.innerHTML+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Score Breakdown</div>';
  details.forEach(function(d){
    var pct=Math.round(d.pts/d.max*100);
    out.innerHTML+='<div style="margin-bottom:10px">'+
      '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:var(--text2);font-weight:500">'+d.label+'</span><span style="color:'+d.color+';font-weight:600">'+d.pts+'/'+d.max+'</span></div>'+
      '<div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+d.color+';border-radius:2px"></div></div>'+
      '<div style="font-size:10px;color:'+d.color+';margin-top:2px">'+d.note+'</div></div>';
  });

  // Negotiation recommendations
  var recs=[];
  if(salPts<22)recs.push('Request salary increase to at least $'+mgma.p50+'K (MGMA median). Present market data from MGMA and AMGA benchmarks.');
  if(rvuPts<11&&rvu>0)recs.push('Negotiate RVU rate to $55+ per wRVU. Your current rate of $'+rvu+' is below competitive range.');
  if(ncPts<12)recs.push('Push to reduce non-compete to ≤15 miles / ≤1 year, or waive if terminated without cause.');
  if(tailPts<10)recs.push('Negotiate full employer-paid tail coverage. This can save you $20,000–$50,000+.');
  if(termPts<8)recs.push('Request 90+ day termination notice period with defined severance.');
  if(callPts<6)recs.push('Negotiate call compensation: per-diem stipend or reduced frequency.');
  if(benPts<8){
    if(retMatch<4)recs.push('Push retirement match to 4%+ ($'+Math.round(salaryK*0.04)+'K/yr value).');
    if(cme<3000)recs.push('Request CME allowance of $3,000+ with dedicated CME days.');
  }
  if(recs.length){
    out.innerHTML+='<div style="margin-top:16px;font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">\ud83c\udfaf Recommended Negotiation Points</div>'+
      '<div style="background:var(--bg3);border:1px solid rgba(200,168,124,.15);border-radius:8px;padding:14px;font-size:12px;color:var(--text2);line-height:1.8">'+
      recs.map(function(r,i){return '<div style="margin-bottom:6px">'+(i+1)+'. '+r+'</div>'}).join('')+'</div>';
  }

  // Red flags summary
  var flags=details.filter(function(d){return d.color==='var(--red)'});
  if(flags.length){
    out.innerHTML+='<div style="margin-top:16px;padding:14px;background:rgba(255,100,100,.05);border:1px solid rgba(255,100,100,.15);border-radius:8px">'+
      '<div style="font-size:10px;font-weight:600;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">\ud83d\udea9 '+flags.length+' Red Flag'+(flags.length>1?'s':'')+'</div>'+
      flags.map(function(f){return '<div style="font-size:11px;color:var(--red);margin-bottom:4px">\u2022 '+f.label+': '+f.note+'</div>'}).join('')+
      '<div style="margin-top:8px;font-size:11px;color:var(--text2);font-weight:500">\u2192 Strongly recommend physician contract attorney review ($2-3.5K).</div></div>';
  }

  out.innerHTML+='<p style="font-size:10px;color:var(--text3);margin-top:16px;line-height:1.6;font-style:italic">Based on MGMA 2024 Provider Compensation Report. This is a modeling tool \u2014 not legal advice. Always have a physician contract attorney review your specific contract terms.</p>';
}

// ===== FINANCIAL TRAJECTORY SIMULATOR =====
var FT_SALARY={
  // [academic, employed, private] - based on MGMA 2024 median data (in thousands)
  im:[230,260,280],hosp:[280,310,340],cards:[430,500,580],ic:[550,650,780],ep:[520,610,720],
  ct_surg:[500,600,750],gi:[420,480,560],pulm:[350,400,440],heme_onc:[400,460,530],
  nephro:[300,340,370],rheum:[280,310,340],endo:[260,290,310],id:[260,290,310],
  gen_surg:[370,410,480],ortho:[520,580,700],uro:[420,480,570],ent:[380,430,510],
  derm:[380,430,520],rad:[400,460,530],anes:[370,410,460],er:[310,340,370],
  fm:[220,250,280],psych:[270,300,340],pm_r:[290,330,370],neuro:[290,330,370],
  path:[300,340,370],ophtho:[350,400,500],peds:[220,250,275]
};
var FT_TRAIN_YRS={
  im:3,hosp:3,cards:6,ic:8,ep:8,ct_surg:9,gi:6,pulm:6,heme_onc:6,nephro:5,rheum:5,endo:5,id:5,
  gen_surg:5,ortho:5,uro:5,ent:5,derm:4,rad:5,anes:4,er:3,fm:3,psych:4,pm_r:4,neuro:4,path:4,ophtho:4,peds:3
};
var FT_SPEC_NAMES={
  im:'IM — Outpatient',hosp:'IM — Hospitalist',cards:'Gen Cardiology',ic:'Interventional Cardiology',
  ep:'Electrophysiology',ct_surg:'CT Surgery',gi:'GI',pulm:'Pulm/CC',heme_onc:'Heme/Onc',
  nephro:'Nephrology',rheum:'Rheumatology',endo:'Endocrinology',id:'Infectious Disease',
  gen_surg:'General Surgery',ortho:'Ortho',uro:'Urology',ent:'ENT',derm:'Dermatology',
  rad:'Radiology',anes:'Anesthesiology',er:'Emergency Med',fm:'Family Medicine',
  psych:'Psychiatry',pm_r:'PM&R',neuro:'Neurology',path:'Pathology',ophtho:'Ophthalmology',peds:'Pediatrics'
};
var FT_COLORS=['rgba(200,168,124,1)','rgba(139,173,196,1)','rgba(139,184,160,1)'];

function ftInit(){ftCalc()}

function ftGetScenario(suffix){
  var spec=document.getElementById('ft-spec-'+suffix);
  var prac=document.getElementById('ft-prac-'+suffix);
  var save=document.getElementById('ft-save-'+suffix);
  var stage=document.getElementById('ft-stage-'+suffix);
  if(!spec)return null;
  var fields=document.getElementById('ft-fields-'+suffix);
  if(fields&&fields.classList.contains('hidden'))return null;
  var pracIdx={academic:0,employed:1,private:2}[prac.value]||1;
  var salary=(FT_SALARY[spec.value]||[300,350,400])[pracIdx]*1000;
  var trainYrs=FT_TRAIN_YRS[spec.value]||5;
  var stageOffset={ms:0,res:2,fellow:Math.max(trainYrs-1,3),attending:trainYrs}[stage.value]||0;
  return{spec:spec.value,salary:salary,trainYrs:trainYrs,saveRate:parseFloat(save.value),stageOffset:stageOffset,pracType:prac.value,label:FT_SPEC_NAMES[spec.value]+' ('+prac.value+')'};
}

function ftProject(sc){
  var years=30;var data=[];var netWorth=-250000;// start with student debt
  var residentPay=65000;var annualReturn=0.07;var salaryGrowth=0.03;
  var curSalary=sc.salary;
  for(var y=0;y<=years;y++){
    var actualYear=y+sc.stageOffset;
    var income;
    if(actualYear<sc.trainYrs){income=residentPay}
    else{income=curSalary;curSalary*=(1+salaryGrowth)}
    var saved=income*sc.saveRate;
    netWorth=netWorth*(1+annualReturn)+saved;
    data.push({year:y,netWorth:Math.round(netWorth),income:Math.round(income),cumEarnings:0});
  }
  // calc cumulative earnings
  var cum=0;var rp=residentPay;var cs=sc.salary;
  for(var y=0;y<=years;y++){
    var ay=y+sc.stageOffset;
    if(ay<sc.trainYrs){cum+=rp}else{cum+=cs;cs*=(1+salaryGrowth)}
    data[y].cumEarnings=Math.round(cum);
  }
  return data;
}

function ftCalc(){
  var scenarios=[];
  var a=ftGetScenario('a');if(a)scenarios.push(a);
  var b=ftGetScenario('b');if(b)scenarios.push(b);
  var c=ftGetScenario('c');if(c)scenarios.push(c);
  if(!scenarios.length)return;
  var projections=scenarios.map(ftProject);

  // Draw chart
  var canvas=document.getElementById('ft-chart');
  if(!canvas)return;
  var dpr=window.devicePixelRatio||1;
  canvas.width=canvas.offsetWidth*dpr;
  canvas.height=canvas.offsetHeight*dpr;
  var ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  var W=canvas.offsetWidth,H=canvas.offsetHeight;
  var pad={t:20,r:20,b:36,l:60};
  var gW=W-pad.l-pad.r,gH=H-pad.t-pad.b;

  // Find max
  var maxNW=0;var minNW=0;
  projections.forEach(function(p){p.forEach(function(d){if(d.netWorth>maxNW)maxNW=d.netWorth;if(d.netWorth<minNW)minNW=d.netWorth})});
  maxNW=Math.ceil(maxNW/1000000)*1000000;
  minNW=Math.floor(minNW/1000000)*1000000;
  var range=maxNW-minNW||1;

  ctx.clearRect(0,0,W,H);

  // Grid
  ctx.strokeStyle='rgba(200,168,124,0.08)';ctx.lineWidth=1;
  var gridSteps=5;
  for(var i=0;i<=gridSteps;i++){
    var y=pad.t+gH-(i/gridSteps)*gH;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+gW,y);ctx.stroke();
    var val=minNW+(i/gridSteps)*range;
    ctx.fillStyle='rgba(200,168,124,0.4)';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';
    ctx.fillText('$'+(val/1000000).toFixed(1)+'M',pad.l-6,y+4);
  }
  // X labels
  for(var x=0;x<=30;x+=5){
    var px=pad.l+(x/30)*gW;
    ctx.fillStyle='rgba(200,168,124,0.4)';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText('Yr '+x,px,H-pad.b+18);
  }
  // Zero line
  var zeroY=pad.t+gH-((0-minNW)/range)*gH;
  ctx.strokeStyle='rgba(200,168,124,0.2)';ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(pad.l,zeroY);ctx.lineTo(pad.l+gW,zeroY);ctx.stroke();
  ctx.setLineDash([]);

  // Lines
  projections.forEach(function(data,idx){
    ctx.strokeStyle=FT_COLORS[idx];ctx.lineWidth=2.5;ctx.lineJoin='round';
    ctx.beginPath();
    data.forEach(function(d,i){
      var px=pad.l+(i/30)*gW;
      var py=pad.t+gH-((d.netWorth-minNW)/range)*gH;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    });
    ctx.stroke();
    // End dot
    var last=data[data.length-1];
    var ex=pad.l+gW;var ey=pad.t+gH-((last.netWorth-minNW)/range)*gH;
    ctx.fillStyle=FT_COLORS[idx];ctx.beginPath();ctx.arc(ex,ey,4,0,Math.PI*2);ctx.fill();
  });

  // Legend
  var legend=document.getElementById('ft-legend');
  legend.innerHTML=scenarios.map(function(s,i){
    return '<span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:3px;border-radius:2px;background:'+FT_COLORS[i]+'"></span>'+s.label+'</span>';
  }).join('');

  // Summary cards
  var sumEl=document.getElementById('ft-summary');
  sumEl.innerHTML='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px">\ud83d\udcca Results at Year 30</div>'+
    '<div style="display:grid;grid-template-columns:repeat('+Math.min(scenarios.length,3)+',1fr);gap:10px">'+
    projections.map(function(data,idx){
      var last=data[data.length-1];
      var labels=['A','B','C'];
      return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center">'+
        '<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Scenario '+labels[idx]+'</div>'+
        '<div style="font-size:10px;color:var(--text3);margin-bottom:8px">'+scenarios[idx].label+'</div>'+
        '<div style="font-size:20px;font-weight:600;color:'+FT_COLORS[idx]+';margin-bottom:4px">$'+(last.netWorth/1000000).toFixed(1)+'M</div>'+
        '<div style="font-size:10px;color:var(--text3)">Net Worth</div>'+
        '<div style="margin-top:8px;font-size:14px;font-weight:600;color:var(--text)">$'+(last.cumEarnings/1000000).toFixed(1)+'M</div>'+
        '<div style="font-size:10px;color:var(--text3)">Lifetime Earnings</div>'+
        '<div style="margin-top:8px;font-size:12px;color:var(--text2)">$'+(scenarios[idx].salary/1000).toFixed(0)+'K/yr</div>'+
        '<div style="font-size:10px;color:var(--text3)">Starting Salary</div>'+
        '</div>';
    }).join('')+'</div>';

  // Insights
  var insEl=document.getElementById('ft-insights');
  if(projections.length>=1){
    // Calculate debt payoff timeline
    var debtTimelines='';
    projections.forEach(function(proj,i){
      var sc=scenarios[i];
      var payoffYear=null;
      for(var y=0;y<proj.length;y++){
        if(proj[y].netWorth>=0){payoffYear=y;break}
      }
      var labels2=['A','B','C'];
      var debtFreeAge=payoffYear?(payoffYear+sc.stageOffset+25):null;
      debtTimelines+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span>Scenario '+labels2[i]+' ('+sc.label+')</span><span style="font-weight:600;color:'+(payoffYear&&payoffYear<=10?'var(--green)':'var(--accent)')+'">Debt-free by year '+(payoffYear||'30+')+(debtFreeAge?' (age ~'+debtFreeAge+')':'')+'</span></div>';
    });

    var debtSection='<div style="margin-top:16px;padding:14px;background:rgba(200,168,124,.04);border:1px solid rgba(200,168,124,.12);border-radius:8px"><div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">\ud83d\udcb3 Debt Payoff Timeline</div>'+debtTimelines+'<p style="font-size:10px;color:var(--text3);margin-top:8px">Assumes $250K starting debt. Higher savings rates and higher income specialties accelerate payoff dramatically.</p></div>';

    if(projections.length>=2){
    var sorted=projections.map(function(p,i){return{idx:i,nw:p[p.length-1].netWorth,earn:p[p.length-1].cumEarnings}}).sort(function(a,b){return b.nw-a.nw});
    var diff=sorted[0].nw-sorted[sorted.length-1].nw;
    var earnDiff=sorted[0].earn-sorted[sorted.length-1].earn;
    var labels=['A','B','C'];
    insEl.innerHTML='<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px">\ud83d\udca1 Strategic Insights</div>'+
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:16px;font-size:13px;line-height:1.7;color:var(--text2)">'+
      '<div style="margin-bottom:10px">1\ufe0f\u20e3 <strong>Scenario '+labels[sorted[0].idx]+'</strong> ('+scenarios[sorted[0].idx].label+') produces <strong style="color:var(--accent)">$'+(diff/1000000).toFixed(1)+'M more</strong> in net worth over 30 years.</div>'+
      '<div style="margin-bottom:10px">2\ufe0f\u20e3 Lifetime earnings difference: <strong>$'+(earnDiff/1000000).toFixed(1)+'M</strong>. '+
      (earnDiff>2000000?'This is a significant career-defining gap.':'The gap narrows when you factor in training length and opportunity cost.')+'</div>'+
      '<div style="margin-bottom:10px">3\ufe0f\u20e3 Increasing savings rate from 10% \u2192 20% roughly doubles retirement assets. The savings rate matters almost as much as the specialty choice.</div>'+
      (scenarios.some(function(s){return s.pracType==='private'})?'<div>4\ufe0f\u20e3 Private practice offers the highest income ceiling but comes with business risk, overhead, and partner dynamics. Factor in your risk tolerance.</div>':'')+
      '</div>'+debtSection;
  }else{
    insEl.innerHTML=debtSection;
  }
  }else{
    insEl.innerHTML='<p style="font-size:12px;color:var(--text3);text-align:center;padding:12px">Configure a scenario to see insights.</p>';
  }
}

// ===== STRIPE CONFIG =====
const STRIPE_PK='pk_test_51T5mX3PXNQA0ks87KmMtyTYTQZKBLJ6dE5U15eSBf97sK2ecqdU1DYjcJYpevRpdJnE1Xyi0Uow6PG2J8b4A8UCq004h8agh3H';
const STRIPE_PRICES={
  core:'price_1T5rG5PXNQA0ks87NtjJVnYi',
  elite:'price_1T5rGQPXNQA0ks87WdzaewtE',
  audit:'price_1T5rGtPXNQA0ks8758d20r97',
  intensive:'price_1T5rHJPXNQA0ks87dGsOMuWM'
};

// Landing page plan signup: if logged in → Stripe, if not → onboard with plan intent
function planSignup(plan){
  if(U){
    subPlan(plan);
  }else{
    sessionStorage.setItem('hw_pending_plan',plan);
    go('pg-onboard');
  }
}
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
  }else if(plan==='elite'){
    startCheckout(STRIPE_PRICES.elite,'subscription');
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
    else if(priceId===STRIPE_PRICES.elite){if(U){U.tier='elite';U.usage.credits=TIERS.elite.credits}}
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

// Merge local + Supabase questions, deduplicate by question text
function getAdminQuestions(){
  var all=[];
  var seen={};
  // Supabase questions first (authoritative)
  if(_sbQuestions&&_sbQuestions.length){
    _sbQuestions.forEach(function(q){
      var key=(q.question||'').substring(0,50).toLowerCase();
      if(!seen[key]){
        seen[key]=true;
        all.push({
          id:q.id,_sbId:q.id,
          userId:q.user_id,userEmail:q.user_email,
          author:q.author,role:q.role||'',
          cat:q.cat||'career',
          q:q.question,question:q.question,
          ai:q.ai_response,ai_response:q.ai_response,
          status:q.status||'pending',
          reviewNote:q.review_note,review_note:q.review_note,
          wantsReview:q.wants_review,wants_review:q.wants_review,
          anon:q.anon,
          date:q.date?q.date.split('T')[0]:'',
          user_email:q.user_email
        });
      }
    });
  }
  // Local questions (if not already in Supabase)
  DB.questions.forEach(function(q){
    var key=(q.q||'').substring(0,50).toLowerCase();
    if(!seen[key]){
      seen[key]=true;
      all.push(q);
    }
  });
  return all;
}

// Publish review — works for both local and Supabase questions
async function publishAdminReview(qId){
  var ta=document.getElementById('rev-'+qId);
  if(!ta||!ta.value.trim()){notify('Add review commentary',1);return}
  var reviewText=ta.value.trim();

  if(typeof qId==='string'&&qId.startsWith('sb_')){
    // Supabase question
    var sbId=parseInt(qId.replace('sb_',''));
    if(_supaClient){
      var{error}=await _supaClient.from('questions').update({
        review_note:reviewText,
        status:'reviewed'
      }).eq('id',sbId);
      if(error){notify('Failed to save review: '+error.message,1);return}
      // Update local cache
      if(_sbQuestions){
        var sq=_sbQuestions.find(function(q){return q.id===sbId});
        if(sq){sq.review_note=reviewText;sq.status='reviewed'}
      }
      // Send notification to user
      var q=_sbQuestions?_sbQuestions.find(function(q){return q.id===sbId}):null;
      if(q&&q.user_email){
        sendUserNotification(q.user_id||'',q.user_email,'review',
          'Dr. Faroqui reviewed your question',
          reviewText.substring(0,200)+(reviewText.length>200?'...':''));
      }
      notify('Review published! \u2728');
      renderAdmin();
    }
  }else{
    // Local question — use existing publishReview
    publishReview(typeof qId==='string'?parseInt(qId):qId);
  }
}

function renderAdmin(){
  const c=document.getElementById('admin-content');
  var allQ=getAdminQuestions();
  const reviewedThisWeek=allQ.filter(q=>q.status==='reviewed').length;
  var pendingCount=allQ.filter(q=>q.status==='pending'||q.status==='answered').length;
  if(curAdminTab==='messages'){
    document.getElementById('admin-info').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span>User messages and feedback.</span><span style="color:var(--accent);font-weight:600">'+(DB.messages?DB.messages.filter(m=>!m.read).length:0)+' unread</span></div>';
  }else if(curAdminTab==='users'){
    var userCount=(_sbProfiles&&_sbProfiles.length)?_sbProfiles.length:DB.users.length;
    document.getElementById('admin-info').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span>All registered users and their strategic reports.</span><span style="color:var(--accent);font-weight:600">'+userCount+' total</span></div>';
  }else if(curAdminTab==='queue'){
    document.getElementById('admin-info').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span>Questions awaiting your review.</span><span style="color:var(--accent);font-weight:600">'+pendingCount+' pending</span></div>';
  }else{
    document.getElementById('admin-info').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span>Published reviews.</span><span style="color:var(--accent);font-weight:600">'+reviewedThisWeek+' reviewed</span></div>';
  }
  if(curAdminTab==='queue'){
    // Merge local + Supabase questions
    var allQ=getAdminQuestions();
    const pending=allQ.filter(q=>q.status==='pending'||q.status==='answered');
    c.innerHTML=pending.length?pending.map(function(q){
      var qId=q._sbId?'sb_'+q._sbId:q.id;
      var ai=q.ai||q.ai_response;
      var h='<div class="card" style="margin-bottom:12px">';
      h+='<div class="qc-top"><span class="qc-author">'+(q.anon?'Anonymous':q.author)+'</span>';
      h+='<span class="tag '+(({student:'t-student',resident:'t-resident',fellow:'t-fellow'})[q.role]||'')+'">'+q.role+'</span>';
      if(q.user_email){h+='<span style="font-size:10px;color:var(--text3);margin-left:8px">'+q.user_email+'</span>'}
      h+='</div>';
      h+='<span class="tag t-cat">'+q.cat+'</span>';
      h+='<div class="qc-q" style="margin:10px 0">'+(q.q||q.question)+'</div>';
      h+='<div style="font-size:11px;color:var(--text3);margin-bottom:12px">'+(q.date||'')+(q.wantsReview||q.wants_review?' \u2022 \u2b50 Review Requested':'')+'</div>';
      if(ai){
        var diag=typeof ai==='object'?ai.diag:ai;
        h+='<details style="margin-bottom:12px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">View AI Draft</summary>';
        h+='<div class="ai-resp" style="margin-top:8px;font-size:13px;max-height:300px;overflow-y:auto"><p>'+diag+'</p></div></details>';
      }
      h+='<div class="abox"><textarea id="rev-'+qId+'" placeholder="Add review commentary..."></textarea>';
      h+='<div style="display:flex;align-items:center;gap:12px;margin-top:12px">';
      h+='<label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px"><input type="checkbox" id="share-'+qId+'" checked> Share in archive</label>';
      h+='<div style="flex:1"></div>';
      h+='<button class="btn btn-a btn-sm" onclick="publishAdminReview(\''+qId+'\')">Publish</button>';
      h+='</div></div></div>';
      return h;
    }).join(''):'<div style="text-align:center;padding:40px;color:var(--text3)">\u2705 All caught up!</div>';
  }else if(curAdminTab==='reviewed'){
    var allQ=getAdminQuestions();
    const reviewed=allQ.filter(q=>q.status==='reviewed').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    if(reviewed.length){
      c.innerHTML=reviewed.map(function(q){
        var ai=q.ai||q.ai_response;
        var revNote=q.reviewNote||q.review_note;
        var h='<div class="card" style="margin-bottom:12px">';
        h+='<div class="qc-top"><span class="qc-author">'+(q.anon?'Anonymous':q.author)+'</span>';
        h+='<span class="tag '+(({student:'t-student',resident:'t-resident',fellow:'t-fellow'})[q.role]||'')+'">'+q.role+'</span></div>';
        h+='<span class="tag t-cat">'+q.cat+'</span>';
        h+='<div class="qc-q" style="margin:10px 0">'+(q.q||q.question)+'</div>';
        h+='<div style="font-size:11px;color:var(--text3);margin-bottom:8px">'+(q.date||'')+'</div>';
        if(revNote){
          h+='<div style="padding:12px;background:rgba(106,191,75,.06);border:1px solid rgba(106,191,75,.15);border-radius:8px;margin-top:8px">';
          h+='<div style="font-size:10px;font-weight:600;color:var(--green);margin-bottom:4px">\u2705 YOUR REVIEW</div>';
          h+='<p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0">'+revNote+'</p></div>';
        }
        h+='</div>';
        return h;
      }).join('');
    }else{
      c.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3)">No reviewed questions.</div>';
    }
  }else if(curAdminTab==='users'){
    // Use Supabase profiles if available, otherwise local
    var users;
    if(_sbProfiles&&_sbProfiles.length){
      users=_sbProfiles;
      c.innerHTML=users.map(function(u){
        var h='<div class="card" style="margin-bottom:14px;padding:18px">';
        var signDate=u.signup_date?new Date(u.signup_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):u.created_at?new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
        var tierColor=u.tier==='core'?'var(--accent)':u.tier==='elite'?'var(--green)':'var(--text3)';
        h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
        h+='<div><div style="font-weight:600;font-size:14px">'+(u.name||'Unknown')+'</div>';
        h+='<div style="font-size:11px;color:var(--text3)">'+(u.email||'')+'</div></div>';
        h+='<div style="text-align:right"><span class="tag" style="color:'+tierColor+';border-color:'+tierColor+'">'+(u.tier||'free').toUpperCase()+'</span>';
        h+='<div style="font-size:10px;color:var(--text3);margin-top:4px">Joined '+signDate+'</div></div></div>';
        // Profile tags
        h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
        if(u.stage)h+='<span class="tag t-cat" style="font-size:10px">'+u.stage+'</span>';
        if(u.specialty)h+='<span class="tag t-cat" style="font-size:10px">'+u.specialty+'</span>';
        if(u.goal)h+='<span class="tag" style="font-size:10px">Goal: '+u.goal+'</span>';
        if(u.institution)h+='<span class="tag" style="font-size:10px">'+u.institution+'</span>';
        h+='</div>';
        // Report
        if(u.score){
          var sc=u.score>=70?'var(--green)':u.score>=45?'var(--accent)':'var(--red)';
          h+='<div style="padding:12px;background:var(--bg2);border-radius:8px;margin-bottom:10px">';
          h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
          h+='<span style="font-size:12px;font-weight:600">Signup Assessment</span>';
          h+='<span style="font-size:14px;font-weight:700;color:'+sc+'">'+u.score+'/95 — '+(u.grade||'')+'</span></div>';
          if(u.strengths&&u.strengths.length){
            h+='<div style="font-size:11px;color:var(--green);margin-bottom:4px">✦ '+u.strengths.join(' • ')+'</div>';
          }
          if(u.gaps&&u.gaps.length){
            h+='<div style="font-size:11px;color:var(--red)">⚡ '+u.gaps.join(' • ')+'</div>';
          }
          h+='</div>';
        }
        // Profile data details
        if(u.profile_data){
          var pd=u.profile_data;
          h+='<details style="margin-bottom:8px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">Full Profile Data</summary>';
          h+='<div style="margin-top:8px;padding:10px;background:var(--bg2);border-radius:6px;font-size:11px;color:var(--text2);line-height:1.8">';
          Object.entries(pd).forEach(function(kv){if(kv[1]&&kv[0]!=='pass')h+='<div><strong>'+kv[0]+':</strong> '+kv[1]+'</div>'});
          h+='</div></details>';
        }
        // Admin notes from Supabase
        var notes=u.notes||[];
        h+='<details style="margin-bottom:8px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">Notes & Progress ('+notes.length+')</summary>';
        h+='<div style="margin-top:10px">';
        if(notes.length){
          notes.forEach(function(n){
            h+='<div style="padding:8px 12px;background:var(--bg2);border-radius:6px;margin-bottom:6px;border-left:2px solid var(--accent)">';
            h+='<p style="font-size:12px;color:var(--text2);margin:0;line-height:1.5">'+n.text+'</p>';
            h+='<span style="font-size:10px;color:var(--text3)">'+new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</span></div>';
          });
        }
        h+='<div style="display:flex;gap:8px;margin-top:8px">';
        h+='<input type="text" id="sbnote-'+u.id+'" placeholder="Add a note..." style="flex:1;font-size:12px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text)">';
        h+='<button class="btn btn-a btn-sm" onclick="addSupabaseNote(\''+u.id+'\')">Add</button>';
        h+='</div></div></details>';
        // Goal progress section
        var goalProgress=null;
        if(u.notes){
          var gn=u.notes.find(function(n){return n.type==='goal_progress'});
          if(gn)goalProgress=gn;
        }
        if(goalProgress&&goalProgress.data){
          var gd=goalProgress.data;
          var doneCount=0;var blockedCount=0;var totalTracked=0;
          Object.keys(gd).forEach(function(k){
            if(k.startsWith('_'))return;
            totalTracked++;
            if(gd[k].status==='done')doneCount++;
            if(gd[k].status==='blocked')blockedCount++;
          });
          if(totalTracked>0){
            h+='<div style="padding:10px 14px;background:'+(blockedCount>0?'rgba(239,68,68,.04)':'rgba(106,191,75,.04)')+';border:1px solid '+(blockedCount>0?'rgba(239,68,68,.12)':'rgba(106,191,75,.12)')+';border-radius:8px;margin-bottom:10px">';
            h+='<div style="display:flex;justify-content:space-between;align-items:center">';
            h+='<span style="font-size:11px;font-weight:600;color:var(--text)">📈 Goal Progress</span>';
            h+='<span style="font-size:11px;color:var(--text3)">'+doneCount+' done · '+blockedCount+' blocked · '+(totalTracked-doneCount-blockedCount)+' in progress</span></div>';
            // Show blockers if any
            Object.keys(gd).forEach(function(k){
              if(k.startsWith('_'))return;
              if(gd[k].status==='blocked'&&gd[k].blocker){
                h+='<div style="margin-top:6px;font-size:11px;color:var(--red)">🚩 '+gd[k].blocker+'</div>';
              }
            });
            if(gd._lastCheckin){
              h+='<div style="margin-top:6px;font-size:10px;color:var(--text3)">Last check-in: '+new Date(gd._lastCheckin).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</div>';
            }
            h+='</div>';
          }
        }
        // Message User button + Tier control
        h+='<div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">';
        h+='<button class="btn btn-sm" onclick="adminMessageUser(\''+u.email+'\',\''+(u.name||'').replace(/'/g,"\\'")+'\')" style="font-size:11px;padding:8px 14px;border:1px solid var(--accent);border-radius:6px;color:var(--accent)">\ud83d\udce9 Message</button>';
        h+='<select onchange="adminChangeTier(\''+u.id+'\',this.value)" style="font-size:11px;padding:7px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text)">';
        h+='<option value="" disabled selected>Change Tier</option>';
        h+='<option value="free"'+(u.tier==='free'?' style="font-weight:600"':'')+'>Explorer (Free)</option>';
        h+='<option value="core"'+(u.tier==='core'?' style="font-weight:600"':'')+'>Core ($15/mo)</option>';
        h+='<option value="elite"'+(u.tier==='elite'?' style="font-weight:600"':'')+'>Elite ($99/mo)</option>';
        h+='</select>';
        h+='</div>';
        h+='</div>';
        return h;
      }).join('');
      return;
    }
    // Fallback to local DB
    users=DB.users.filter(u=>u.id!=='admin').sort((a,b)=>(b.signupDate||'').localeCompare(a.signupDate||''));
    if(!users.length){
      c.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3)">No users yet.</div>';
    }else{
      c.innerHTML=users.map(function(u){
        var h='<div class="card" style="margin-bottom:14px;padding:18px">';
        // Header
        var signDate=u.signupDate?new Date(u.signupDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
        var tierColor=u.tier==='core'?'var(--accent)':u.tier==='elite'?'var(--green)':'var(--text3)';
        h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
        h+='<div><div style="font-weight:600;font-size:14px">'+u.name+'</div>';
        h+='<div style="font-size:11px;color:var(--text3)">'+u.email+'</div></div>';
        h+='<div style="text-align:right"><span class="tag" style="color:'+tierColor+';border-color:'+tierColor+'">'+u.tier.toUpperCase()+'</span>';
        h+='<div style="font-size:10px;color:var(--text3);margin-top:4px">Joined '+signDate+'</div></div></div>';
        // Profile info
        var p=u.profile||{};
        h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
        if(p.stage)h+='<span class="tag t-cat" style="font-size:10px">'+p.stage+'</span>';
        if(p.spec)h+='<span class="tag t-cat" style="font-size:10px">'+p.spec+'</span>';
        if(p.goal)h+='<span class="tag" style="font-size:10px">Goal: '+p.goal+'</span>';
        if(u.institution)h+='<span class="tag" style="font-size:10px">'+u.institution+'</span>';
        h+='</div>';
        // Report snapshot
        if(u.report){
          var r=u.report;
          var sc=r.score>=70?'var(--green)':r.score>=45?'var(--accent)':'var(--red)';
          h+='<div style="padding:12px;background:var(--bg2);border-radius:8px;margin-bottom:10px">';
          h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
          h+='<span style="font-size:12px;font-weight:600">Signup Assessment</span>';
          h+='<span style="font-size:14px;font-weight:700;color:'+sc+'">'+r.score+'/95 — '+r.grade+'</span></div>';
          if(r.strengths&&r.strengths.length){
            h+='<div style="font-size:11px;color:var(--green);margin-bottom:4px">✦ '+r.strengths.join(' • ')+'</div>';
          }
          if(r.gaps&&r.gaps.length){
            h+='<div style="font-size:11px;color:var(--red)">⚡ '+r.gaps.join(' • ')+'</div>';
          }
          h+='</div>';
        }
        // Usage stats
        var aiUsed=u.usage?u.usage.ai:0;
        var qCount=DB.questions.filter(function(q){return q.userId===u.id}).length;
        h+='<div style="display:flex;gap:16px;font-size:11px;color:var(--text3);margin-bottom:12px">';
        h+='<span>AI Used: <strong style="color:var(--text2)">'+aiUsed+'</strong></span>';
        h+='<span>Questions: <strong style="color:var(--text2)">'+qCount+'</strong></span>';
        if(u.trialEnd)h+='<span>Trial Ends: <strong style="color:var(--text2)">'+new Date(u.trialEnd).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</strong></span>';
        h+='</div>';
        // Admin notes
        h+='<details style="margin-bottom:8px"><summary style="font-size:12px;color:var(--accent);cursor:pointer">Notes & Progress Tracking</summary>';
        h+='<div style="margin-top:10px">';
        if(u.notes&&u.notes.length){
          u.notes.forEach(function(n){
            h+='<div style="padding:8px 12px;background:var(--bg2);border-radius:6px;margin-bottom:6px;border-left:2px solid var(--accent)">';
            h+='<p style="font-size:12px;color:var(--text2);margin:0;line-height:1.5">'+n.text+'</p>';
            h+='<span style="font-size:10px;color:var(--text3)">'+new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</span></div>';
          });
        }
        h+='<div style="display:flex;gap:8px;margin-top:8px">';
        h+='<input type="text" id="unote-'+u.id+'" placeholder="Add a note about this user..." style="flex:1;font-size:12px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text)">';
        h+='<button class="btn btn-a btn-sm" onclick="addUserNote(\''+u.id+'\')">Add</button>';
        h+='</div></div></details>';
        // Tier management
        h+='<div style="display:flex;gap:8px;align-items:center">';
        h+='<select id="tier-'+u.id+'" style="font-size:11px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text)">';
        h+='<option value="free"'+(u.tier==='free'?' selected':'')+'>Free</option>';
        h+='<option value="core"'+(u.tier==='core'?' selected':'')+'>Core</option>';
        h+='<option value="elite"'+(u.tier==='elite'?' selected':'')+'>Elite</option>';
        h+='</select>';
        h+='<button class="btn btn-a btn-sm" onclick="updateUserTier(\''+u.id+'\')" style="font-size:11px">Update Tier</button>';
        h+='</div>';
        h+='</div>';
        return h;
      }).join('');
    }
  }else if(curAdminTab==='messages'){
    // Use Supabase messages if available
    var msgs=_sbMessages&&_sbMessages.length?_sbMessages:(DB.messages||[]).slice().reverse();
    if(!msgs.length){
      c.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3)">📭 No messages yet.</div>';
    }else{
      var isSB=_sbMessages&&_sbMessages.length;
      c.innerHTML=msgs.map(function(m,idx){
        var msgId=isSB?m.id:((DB.messages.length-1)-idx);
        var typeLabel={career:'🎯 Career/Strategy',finance:'💰 Finance/Comp',contract:'📋 Contract/Negotiation','pivot-report':'📊 Pivot Report',audit:'🎯 Strategic Audit',bug:'🐛 Bug',suggestion:'💡 Suggestion',question:'❓ Question',feedback:'📝 Feedback',progress:'📈 Progress Update',other:'📎 Other'};
        var isRead=m.read?'':'border-left:3px solid var(--accent);';
        var d=m.date?new Date(m.date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'';
        var h='<div class="card" style="margin-bottom:12px;'+isRead+'">';
        h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
        h+='<div><span style="font-weight:600;font-size:13px">'+(m.user_name||'Unknown')+'</span><span style="color:var(--text3);font-size:11px;margin-left:8px">'+(m.user_email||'')+'</span></div>';
        h+='<span style="font-size:10px;color:var(--text3)">'+d+'</span></div>';
        h+='<span class="tag t-cat" style="margin-bottom:8px;display:inline-block;font-size:10px">'+(typeLabel[m.type]||m.type)+'</span>';
        // Detect HTML reports vs plain text
        var isHTML=m.message&&m.message.trim().charAt(0)==='<';
        if(isHTML){
          h+='<div style="margin-bottom:12px">'+m.message+'</div>';
        }else{
          h+='<p style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:12px;white-space:pre-wrap">'+m.message+'</p>';
        }
        var replies=m.replies||[];
        if(replies.length){
          replies.forEach(function(r){
            h+='<div style="margin-left:16px;padding:10px 14px;background:var(--bg2);border-radius:8px;margin-bottom:8px;border-left:2px solid var(--green)">';
            h+='<div style="font-size:10px;color:var(--green);font-weight:600;margin-bottom:4px">YOUR REPLY</div>';
            h+='<p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0">'+r.text+'</p>';
            h+='<span style="font-size:10px;color:var(--text3)">'+new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</span></div>';
          });
        }
        h+='<div style="display:flex;gap:8px;align-items:center">';
        h+='<input type="text" id="reply-'+msgId+'" placeholder="Type a reply..." style="flex:1;font-size:12px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text)">';
        if(isSB){
          h+='<button class="btn btn-a btn-sm" onclick="replyToSupabaseMessage('+m.id+')">Reply</button>';
          if(!m.read)h+='<button class="btn btn-sm" onclick="markSupabaseMessageRead('+m.id+')" style="font-size:11px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;color:var(--text3)">✓ Read</button>';
        }else{
          h+='<button class="btn btn-a btn-sm" onclick="replyToMessage('+msgId+')">Reply</button>';
          if(!m.read)h+='<button class="btn btn-sm" onclick="markMessageRead('+msgId+')" style="font-size:11px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;color:var(--text3)">✓ Read</button>';
        }
        h+='</div></div>';
        return h;
      }).join('');
    }
  }else{
    var allQ2=getAdminQuestions();
    const total=allQ2.length,ans=allQ2.filter(q=>q.status==='reviewed').length,pend=allQ2.filter(q=>q.status==='pending'||q.status==='answered').length;
    var userCount2=(_sbProfiles&&_sbProfiles.length)?_sbProfiles.length:DB.users.length;
    const cats={};allQ2.forEach(q=>{cats[q.cat]=(cats[q.cat]||0)+1});
    c.innerHTML='<div class="stats" style="padding:0"><div class="st"><div class="st-n">'+total+'</div><div class="st-l">Total</div></div><div class="st"><div class="st-n">'+ans+'</div><div class="st-l">Reviewed</div></div><div class="st"><div class="st-n">'+pend+'</div><div class="st-l">Pending</div></div><div class="st"><div class="st-n">'+userCount2+'</div><div class="st-l">Members</div></div></div><div class="sec" style="padding:20px 0 14px">By Category</div>'+Object.entries(cats).map(([k,v])=>'<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>'+(CATS[k]||k)+'</span><span style="color:var(--text3)">'+v+'</span></div>').join('');
  }
}
function adminTab(tab,btn){curAdminTab=tab;document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));btn.classList.add('on');
  // Load from Supabase for all admin tabs
  if(_supaClient){loadAdminDataFromSupabase(tab)}else{renderAdmin()}
}

async function loadAdminDataFromSupabase(tab){
  const c=document.getElementById('admin-content');
  c.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3)">Loading...</div>';
  try{
    if(tab==='users'){
      const{data,error}=await _supaClient.from('profiles').select('*').order('created_at',{ascending:false});
      if(!error&&data&&data.length){
        _sbProfiles=data;
      }
    }
    if(tab==='messages'){
      const{data,error}=await _supaClient.from('messages').select('*').neq('type','notification').order('date',{ascending:false});
      if(!error&&data&&data.length){
        _sbMessages=data;
      }
    }
    if(tab==='queue'||tab==='reviewed'){
      const{data,error}=await _supaClient.from('questions').select('*').order('date',{ascending:false});
      if(!error&&data&&data.length){
        _sbQuestions=data;
      }
    }
  }catch(ex){console.warn('Supabase load error',ex)}
  renderAdmin();
}

var _sbProfiles=null;
var _sbMessages=null;
var _sbQuestions=null;

function addUserNote(userId){
  var input=document.getElementById('unote-'+userId);
  if(!input||!input.value.trim())return;
  var user=DB.users.find(function(u){return u.id===userId});
  if(!user)return;
  if(!user.notes)user.notes=[];
  user.notes.push({text:input.value.trim(),date:new Date().toISOString()});
  saveDB();
  notify('Note added');
  renderAdmin();
}

function updateUserTier(userId){
  var sel=document.getElementById('tier-'+userId);
  if(!sel)return;
  var user=DB.users.find(function(u){return u.id===userId});
  if(!user)return;
  user.tier=sel.value;
  saveDB();
  notify('Tier updated to '+sel.value.toUpperCase());
  renderAdmin();
}

function replyToMessage(idx){
  var input=document.getElementById('reply-'+idx);
  if(!input||!input.value.trim())return;
  if(!DB.messages||!DB.messages[idx])return;
  if(!DB.messages[idx].replies)DB.messages[idx].replies=[];
  DB.messages[idx].replies.push({text:input.value.trim(),date:new Date().toISOString()});
  DB.messages[idx].read=true;
  saveDB();
  notify('Reply sent');
  renderAdmin();
}

function markMessageRead(idx){
  if(!DB.messages||!DB.messages[idx])return;
  DB.messages[idx].read=true;
  saveDB();
  renderAdmin();
}

async function addSupabaseNote(profileId){
  var input=document.getElementById('sbnote-'+profileId);
  if(!input||!input.value.trim()||!_supaClient)return;
  var note={text:input.value.trim(),date:new Date().toISOString()};
  // Find profile in cached data and update
  var profile=_sbProfiles?_sbProfiles.find(function(p){return p.id===profileId}):null;
  if(!profile)return;
  var notes=profile.notes||[];
  notes.push(note);
  var{error}=await _supaClient.from('profiles').update({notes:notes}).eq('id',profileId);
  if(error){notify('Failed to save note',1);return}
  profile.notes=notes;
  notify('Note added');
  renderAdmin();
}

async function replyToSupabaseMessage(msgId){
  var input=document.getElementById('reply-'+msgId);
  if(!input||!input.value.trim()||!_supaClient)return;
  var reply={text:input.value.trim(),date:new Date().toISOString()};
  var msg=_sbMessages?_sbMessages.find(function(m){return m.id===msgId}):null;
  if(!msg)return;
  var replies=msg.replies||[];
  replies.push(reply);
  var{error}=await _supaClient.from('messages').update({replies:replies,read:true}).eq('id',msgId);
  if(error){notify('Failed to send reply',1);return}
  msg.replies=replies;
  msg.read=true;
  // Notify user that their message got a reply
  sendUserNotification(msg.user_id||'',msg.user_email||'','direct',
    'Dr. Faroqui replied to your message',
    reply.text.substring(0,200)+(reply.text.length>200?'...':''));
  notify('Reply sent');
  renderAdmin();
}

async function markSupabaseMessageRead(msgId){
  if(!_supaClient)return;
  var{error}=await _supaClient.from('messages').update({read:true}).eq('id',msgId);
  if(!error){
    var msg=_sbMessages?_sbMessages.find(function(m){return m.id===msgId}):null;
    if(msg)msg.read=true;
  }
  renderAdmin();
}

function publishReview(id){
  const ta=document.getElementById('rev-'+id);
  if(!ta||!ta.value.trim()){notify('Add review commentary',1);return}
  const q=DB.questions.find(q=>q.id===id);
  if(q){
    q.reviewNote=ta.value.trim();
    q.status='reviewed';
    q.reviewDate=new Date().toISOString().split('T')[0];
    const shareBox=document.getElementById('share-'+id);
    q.shareInArchive=shareBox?shareBox.checked:true;
    saveDB();notify('Review published! \u2728');renderAdmin();
    // Sync review to Supabase
    if(_supaClient&&q.sbId){
      _supaClient.from('questions').update({
        review_note:q.reviewNote,status:'reviewed'
      }).eq('id',q.sbId).then(function(){}).catch(function(ex){console.warn('Review sync',ex)});
    }
    // Create in-app notification for the user
    sendUserNotification(q.userId,q.userEmail||'','review',
      'Dr. Faroqui reviewed your question',
      q.reviewNote.substring(0,200)+(q.reviewNote.length>200?'...':''));
  }
}

// ===== IN-APP NOTIFICATIONS =====
// Stores notifications in Supabase messages table with type='notification'
// and in local DB.notifications array

function sendUserNotification(userId,userEmail,ntype,title,body){
  var notif={
    user_name:title,
    user_email:userEmail,
    type:'notification',
    message:body,
    read:false,
    date:new Date().toISOString()
  };
  // Store in Supabase
  if(_supaClient){
    _supaClient.from('messages').insert([notif])
    .then(function(){}).catch(function(ex){console.warn('Notif store',ex)});
  }
  // Store locally
  if(!DB.notifications)DB.notifications=[];
  DB.notifications.push(Object.assign({notif_type:ntype,title:title},notif));
  saveDB();
}

// Change user tier from admin panel
async function adminChangeTier(profileId,newTier){
  if(!newTier||!_supaClient)return;
  var tierNames={free:'Explorer',core:'Core',elite:'Elite'};
  if(!confirm('Change this user to '+tierNames[newTier]+' tier?'))return;
  var{error}=await _supaClient.from('profiles').update({tier:newTier}).eq('id',profileId);
  if(error){notify('Failed to update tier: '+error.message,1);return}
  // Update local cache
  if(_sbProfiles){
    var p=_sbProfiles.find(function(u){return u.id===profileId});
    if(p){
      p.tier=newTier;
      // Notify the user
      sendUserNotification('',p.email,'tier',
        'Your plan has been updated',
        'Your HeartWise plan has been changed to '+tierNames[newTier]+'. Log out and back in to see the changes.');
    }
  }
  notify('Tier updated to '+tierNames[newTier]+' \u2728');
  renderAdmin();
}

// Send a direct message to a user from admin
async function adminMessageUser(email,name){
  var msg=prompt('Send a message to '+(name||email)+':');
  if(!msg||!msg.trim())return;
  var payload={
    user_name:'Message from Dr. Faroqui',
    user_email:email,
    type:'notification',
    message:msg.trim(),
    read:false,
    date:new Date().toISOString()
  };
  if(_supaClient){
    var{error}=await _supaClient.from('messages').insert([payload]);
    if(error){notify('Failed to send message',1);return}
  }
  if(!DB.notifications)DB.notifications=[];
  DB.notifications.push(payload);
  saveDB();
  notify('Message sent to '+(name||email)+' \u2728');
}

// Load notifications for current user
async function loadMyNotifications(){
  if(!U||!U.email)return[];
  var notifs=[];
  // Load from Supabase
  if(_supaClient){
    try{
      var{data,error}=await _supaClient.from('messages').select('*')
        .eq('user_email',U.email)
        .eq('type','notification')
        .order('date',{ascending:false})
        .limit(20);
      if(!error&&data)notifs=data;
    }catch(ex){}
  }
  // Fallback: local notifications for this user
  if(!notifs.length&&DB.notifications){
    notifs=DB.notifications.filter(function(n){
      return n.user_email===U.email;
    }).reverse();
  }
  return notifs;
}

async function showMyMessages(){
  var notifs=await loadMyNotifications();
  // Also load contact message replies
  var contactReplies=[];
  if(_supaClient){
    try{
      var{data}=await _supaClient.from('messages').select('*')
        .eq('user_email',U.email)
        .neq('type','notification')
        .order('date',{ascending:false})
        .limit(20);
      if(data)contactReplies=data.filter(function(m){return m.replies&&m.replies.length});
    }catch(ex){}
  }

  var h='<div style="margin-bottom:20px"><span class="serif" style="font-size:18px;font-weight:600">My Messages</span></div>';

  if(!notifs.length&&!contactReplies.length){
    h+='<div style="text-align:center;padding:40px 0;color:var(--text3)"><p style="font-size:36px;margin-bottom:12px">\ud83d\udcec</p><p style="font-size:14px">No messages yet.</p><p style="font-size:12px;margin-top:6px;color:var(--text3)">When Dr. Faroqui reviews your questions or sends you a message, it\u2019ll show up here.</p></div>';
  }else{
    // Show notifications
    notifs.forEach(function(n){
      var title=n.title||n.user_name||'Notification';
      var isReview=title.indexOf('reviewed')>=0;
      var icon=isReview?'\u2705':'\ud83d\udce9';
      var borderColor=n.read?'var(--border)':'rgba(200,168,124,.3)';
      var bg=n.read?'':'background:rgba(200,168,124,.03);';
      h+='<div class="card" style="margin-bottom:10px;border-color:'+borderColor+';'+bg+'">';
      h+='<div style="display:flex;gap:12px;align-items:flex-start">';
      h+='<span style="font-size:20px;flex-shrink:0;margin-top:2px">'+icon+'</span>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
      h+='<span style="font-size:13px;font-weight:600;color:var(--text)">'+title+'</span>';
      var d=n.date?new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):' ';
      h+='<span style="font-size:10px;color:var(--text3)">'+d+'</span></div>';
      h+='<p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0">'+n.message+'</p>';
      h+='</div></div></div>';
      // Mark as read
      if(!n.read&&n.id&&_supaClient){
        _supaClient.from('messages').update({read:true}).eq('id',n.id).then(function(){}).catch(function(){});
      }
    });

    // Show contact message replies
    contactReplies.forEach(function(m){
      h+='<div class="card" style="margin-bottom:10px">';
      h+='<div style="font-size:11px;color:var(--text3);margin-bottom:6px">Your message: "'+m.message.substring(0,80)+(m.message.length>80?'...':'')+'"</div>';
      m.replies.forEach(function(r){
        h+='<div style="padding:10px 14px;background:var(--bg2);border-radius:8px;margin-bottom:6px;border-left:2px solid var(--green)">';
        h+='<div style="font-size:10px;color:var(--green);font-weight:600;margin-bottom:4px">DR. FAROQUI</div>';
        h+='<p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0">'+r.text+'</p>';
        var d=r.date?new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):' ';
        h+='<span style="font-size:10px;color:var(--text3)">'+d+'</span></div>';
      });
      h+='</div>';
    });
  }

  document.getElementById('modal-q-content').innerHTML=h;
  document.getElementById('modal-q').classList.remove('hidden');
  // Clear notification badge
  var badge=document.getElementById('notif-badge');
  if(badge)badge.style.display='none';
}

// Check for unread notifications and show badge
async function checkNotifBadge(){
  if(!U||!U.email)return;
  var count=0;
  if(_supaClient){
    try{
      var{data,error}=await _supaClient.from('messages').select('id',{count:'exact'})
        .eq('user_email',U.email)
        .eq('type','notification')
        .eq('read',false);
      if(!error&&data)count=data.length;
    }catch(ex){}
  }
  if(!count&&DB.notifications){
    count=DB.notifications.filter(function(n){return n.user_email===U.email&&!n.read}).length;
  }
  var badge=document.getElementById('notif-badge');
  if(badge){
    badge.style.display=count>0?'':'none';
    badge.textContent=count>9?'9+':count;
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
  const trialEnd=new Date();trialEnd.setHours(trialEnd.getHours()+48);
  // Capture report snapshot
  const reportSnapshot=captureReportData(p);
  const user={id:'u'+DB.nextUserId++,name:p.name,email:p.email.toLowerCase(),pass:p.pass,role:roleMap[p.stage]||'student',tier:'elite',trialEnd:trialEnd.toISOString(),isTrial:true,institution:p.inst,usage:{ai:0,credits:0,month:new Date().getMonth()},profile:p,signupDate:new Date().toISOString(),report:reportSnapshot,notes:[]};
  DB.users.push(user);saveDB();
  // Sync to Supabase
  if(_supaClient){
    _supaClient.auth.signUp({email:p.email.toLowerCase(),password:p.pass,options:{data:{name:p.name}}}).catch(()=>{});
    _supaClient.from('profiles').insert([{
      user_id:user.id,name:p.name,email:p.email.toLowerCase(),role:roleMap[p.stage]||'student',
      tier:'elite',institution:p.inst||'',stage:p.stage,specialty:p.spec||'',goal:p.goal||'',
      score:reportSnapshot.score,grade:reportSnapshot.grade,
      strengths:reportSnapshot.strengths,gaps:reportSnapshot.gaps,
      trial_end:trialEnd.toISOString(),
      profile_data:p
    }]).then(function(res){if(res.error)console.warn('Profile sync error',res.error)});
  }
  U=user;localStorage.setItem('hw_session',JSON.stringify(U));
  enterApp();showDisc();
  notify('Welcome! Your 48-hour full access is now active. Every tool. Every feature. The clock is ticking. ⚡');
}

function captureReportData(p){
  const hasPubsField=p.stage==='student'||p.stage==='resident'||p.stage==='fellow';
  const hasLeadField=p.stage==='student';
  let score=50;
  const pubs=parseInt(p.pubs)||0;
  const lead=parseInt(p.lead)||0;
  if(hasPubsField){if(pubs>=3)score+=15;else if(pubs>=1)score+=8}
  if(hasLeadField){if(lead>=2)score+=10;else if(lead>=1)score+=5}
  if(p.spec&&p.spec!=='Undecided')score+=5;
  if(p.goal)score+=5;
  if(p.score1){const s=parseInt(p.score1);if(s>=250)score+=15;else if(s>=240)score+=10;else if(s>=230)score+=5}
  if(p.score2){const s=parseInt(p.score2);if(s>=260)score+=15;else if(s>=250)score+=10;else if(s>=240)score+=5}
  if(p.comp)score+=10;
  if(p.practice)score+=5;
  score=Math.min(95,Math.max(20,score));
  let strengths=[],gaps=[];
  if(hasPubsField){
    if(pubs<2)gaps.push('Research Output ('+pubs+' pubs)');
    else strengths.push('Research Output ('+pubs+' pubs)');
  }
  if(hasLeadField){
    if(lead<1)gaps.push('Leadership');
    else strengths.push('Leadership ('+lead+' roles)');
  }
  if(!p.spec||p.spec==='Undecided')gaps.push('Specialty Clarity');
  else strengths.push('Specialty: '+p.spec);
  if(!p.goal)gaps.push('Strategic Goal');
  else strengths.push('Goal: '+p.goal);
  if(p.stage==='attending'){
    if(!p.comp)gaps.push('Compensation Baseline');
    if(!p.practice)gaps.push('Practice Model');
    if(!p.debt)gaps.push('Loan Strategy');
    if(p.comp)strengths.push('Comp: '+p.comp);
    if(p.practice)strengths.push('Practice: '+p.practice);
  }
  const grade=score>=28?'Strong':score>=21?'Solid With Gaps':score>=14?'Needs Work':'Reassess';
  return{score,grade,strengths,gaps,capturedAt:new Date().toISOString()};
}

// ===== DISCLAIMER =====
function showDisc(){
  document.getElementById('disc-welcome').classList.remove('hidden');
  document.getElementById('disc-agree').classList.add('hidden');
  document.getElementById('modal-disc').classList.remove('hidden');
}
function acceptDisc(){
  document.getElementById('modal-disc').classList.add('hidden');
  if(U){
    localStorage.setItem('hw_disc_'+U.id,'1');
    // Store TOS agreement in Supabase for legal compliance
    if(_supaClient){
      var agreement={
        user_id:U.id,
        user_email:U.email||'',
        user_name:U.name||'',
        tos_version:'2026-03-08',
        agreed_at:new Date().toISOString(),
        user_agent:navigator.userAgent||''
      };
      _supaClient.from('tos_agreements').insert([agreement]).catch(function(){
        // Fallback: store in messages table if tos_agreements doesn't exist
        _supaClient.from('messages').insert([{
          user_name:U.name||'Unknown',
          user_email:U.email||'Unknown',
          type:'tos-agreement',
          message:'TOS v2026-03-08 agreed at '+agreement.agreed_at+' | UA: '+agreement.user_agent,
          date:agreement.agreed_at,
          read:true
        }]).catch(function(){});
      });
    }
  }
}

// ===== NOTIFY =====
function notify(msg,err){
  const el=document.getElementById('notif');
  document.getElementById('ni-icon').textContent=err?'\u2715':'\u2726';
  document.getElementById('ni-text').textContent=msg;
  el.className='notif show'+(err?' err':'');
  setTimeout(()=>el.classList.remove('show'),3000);
}

// ===== RVU CALCULATOR =====
var _rvuBenchmarks={
  fm:{name:'Family Medicine',wrvu:4608,rate:52,comp:275000},
  im:{name:'IM — Outpatient / Primary Care',wrvu:4824,rate:55,comp:300000},
  hosp:{name:'IM — Hospitalist',wrvu:4252,rate:65,comp:335000},
  gc:{name:'General Cardiology',wrvu:7247,rate:65,comp:550000},
  ic:{name:'Interventional Cardiology',wrvu:9187,rate:70,comp:700000},
  ep:{name:'Electrophysiology',wrvu:8452,rate:68,comp:600000},
  gi:{name:'Gastroenterology',wrvu:7592,rate:62,comp:530000},
  pulm:{name:'Pulm / Critical Care',wrvu:5986,rate:58,comp:430000},
  neph:{name:'Nephrology',wrvu:5124,rate:54,comp:340000},
  endo:{name:'Endocrinology',wrvu:4512,rate:56,comp:295000},
  rheum:{name:'Rheumatology',wrvu:4368,rate:58,comp:310000},
  ortho:{name:'Orthopedic Surgery',wrvu:8684,rate:72,comp:680000},
  gensurg:{name:'General Surgery',wrvu:6853,rate:60,comp:450000},
  uro:{name:'Urology',wrvu:7845,rate:65,comp:530000},
  em:{name:'Emergency Medicine',wrvu:5148,rate:68,comp:385000},
  anes:{name:'Anesthesiology',wrvu:6012,rate:70,comp:465000},
  derm:{name:'Dermatology',wrvu:6378,rate:68,comp:500000},
  psych:{name:'Psychiatry',wrvu:3824,rate:72,comp:310000}
};

function rvuFillBenchmark(){
  var spec=document.getElementById('rvu-spec');
  if(!spec)return;
  var key=spec.value;
  var b=_rvuBenchmarks[key];
  if(b){
    document.getElementById('rvu-vol').value=b.wrvu;
    document.getElementById('rvu-rate').value=b.rate;
  }
}

function rvuModelChange(){
  var model=document.getElementById('rvu-model');
  var baseFields=document.getElementById('rvu-base-fields');
  if(!model||!baseFields)return;
  baseFields.style.display=(model.value==='base_bonus')?'grid':'none';
}

function rvuUpdate(){
  var modelEl=document.getElementById('rvu-model');
  if(!modelEl)return;
  rvuModelChange();
  var model=modelEl.value;
  var vol=parseFloat(document.getElementById('rvu-vol').value)||0;
  var rate=parseFloat(document.getElementById('rvu-rate').value)||0;
  var base=parseFloat(document.getElementById('rvu-base').value)||0;
  var thresh=parseFloat(document.getElementById('rvu-thresh').value)||0;
  var total=0;
  var breakdown='';

  if(model==='production'){
    total=vol*rate;
    breakdown='<strong>'+vol.toLocaleString()+'</strong> wRVUs × <strong>$'+rate+'</strong>/wRVU';
  }else if(model==='base_bonus'){
    var bonus=Math.max(0,vol-thresh)*rate;
    total=base+bonus;
    breakdown='Base: <strong>$'+base.toLocaleString()+'</strong>';
    if(vol>thresh){
      breakdown+=' + Bonus: <strong>$'+Math.round(bonus).toLocaleString()+'</strong>';
      breakdown+='<br><span style="font-size:11px;color:var(--text3)">('+(vol-thresh).toLocaleString()+' wRVUs above threshold × $'+rate+')</span>';
    }else{
      breakdown+='<br><span style="font-size:11px;color:var(--text3)">Below bonus threshold by '+(thresh-vol).toLocaleString()+' wRVUs</span>';
    }
  }else{
    total=base||vol*rate;
    breakdown='Guaranteed salary (volume-independent year 1)';
  }

  document.getElementById('rvu-total-comp').textContent='$'+Math.round(total).toLocaleString();
  document.getElementById('rvu-breakdown').innerHTML=breakdown;

  // Compare to MGMA
  var specKey=document.getElementById('rvu-spec').value;
  var b=_rvuBenchmarks[specKey];
  var mgmaHtml='';
  if(b&&total>0){
    var diff=total-b.comp;
    var pct=Math.round((diff/b.comp)*100);
    var color=diff>=0?'var(--green)':'var(--red)';
    var arrow=diff>=0?'↑':'↓';
    mgmaHtml='<span style="color:'+color+';font-weight:600">'+arrow+' $'+Math.abs(Math.round(diff)).toLocaleString()+' ('+Math.abs(pct)+'%) '+(diff>=0?'above':'below')+'</span> MGMA median for '+b.name;
    if(vol>0&&b.wrvu>0){
      var volDiff=vol-b.wrvu;
      var volColor=volDiff>=0?'var(--green)':'var(--red)';
      mgmaHtml+='<br><span style="font-size:11px;color:'+volColor+'">Your volume: '+vol.toLocaleString()+' vs median '+b.wrvu.toLocaleString()+' wRVUs</span>';
    }
  }
  document.getElementById('rvu-vs-mgma').innerHTML=mgmaHtml;

  // Scenarios
  if(vol>0&&rate>0){
    var scenarios='';
    var pcts=[0.75,0.9,1.0,1.1,1.25];
    var labels=['75% volume','90% volume','Current','110% volume','125% volume'];
    pcts.forEach(function(p,i){
      var sv=Math.round(vol*p);
      var sc;
      if(model==='production')sc=sv*rate;
      else if(model==='base_bonus')sc=base+Math.max(0,sv-thresh)*rate;
      else sc=total;
      var isCurrent=p===1.0;
      scenarios+='<div style="display:flex;justify-content:space-between;padding:4px 0;'+(isCurrent?'font-weight:600;color:var(--accent)':'')+'"><span>'+labels[i]+' ('+sv.toLocaleString()+' wRVUs)</span><span>$'+Math.round(sc).toLocaleString()+'</span></div>';
    });
    document.getElementById('rvu-scenarios').innerHTML=scenarios;
  }
}

// ===== RESEARCH ROI CALCULATOR =====
function roiUpdate(){
  var first=parseInt(document.getElementById('roi-first').value)||0;
  var cases=parseInt(document.getElementById('roi-case').value)||0;
  var abstracts=parseInt(document.getElementById('roi-abstract').value)||0;
  var reviews=parseInt(document.getElementById('roi-review').value)||0;
  var middle=parseInt(document.getElementById('roi-middle').value)||0;
  var qi=parseInt(document.getElementById('roi-qi').value)||0;

  // Update value displays
  document.getElementById('roi-first-v').textContent=first;
  document.getElementById('roi-case-v').textContent=cases;
  document.getElementById('roi-abstract-v').textContent=abstracts;
  document.getElementById('roi-review-v').textContent=reviews;
  document.getElementById('roi-middle-v').textContent=middle;
  document.getElementById('roi-qi-v').textContent=qi;

  // Point values per item
  var pts={first:15,cases:8,abstracts:5,reviews:6,middle:3,qi:2};
  var userScore=first*pts.first+cases*pts.cases+abstracts*pts.abstracts+reviews*pts.reviews+middle*pts.middle+qi*pts.qi;

  // Optimal benchmark: 2 first-author (30) + 1 case (8) + 3 abstracts (15) + 0 reviews + 0 middle + 0 QI = 53
  var optimalScore=53;
  var pct=Math.min(100,Math.round((userScore/optimalScore)*100));

  // Grade
  var grade,gradeColor;
  if(pct>=90){grade='Excellent — Exceeds Optimal';gradeColor='var(--green)'}
  else if(pct>=70){grade='Strong — Competitive Portfolio';gradeColor='var(--green)'}
  else if(pct>=50){grade='Building — On Track';gradeColor='var(--accent)'}
  else if(pct>=25){grade='Early — Needs More High-Impact Work';gradeColor='var(--accent)'}
  else if(pct>0){grade='Just Starting — Focus on Quick Wins';gradeColor='var(--red)'}
  else{grade='Add your research to begin';gradeColor='var(--text3)'}

  document.getElementById('roi-score').textContent=pct+'%';
  document.getElementById('roi-score').style.color=gradeColor;
  document.getElementById('roi-grade').textContent=grade;
  document.getElementById('roi-grade').style.color=gradeColor;
  document.getElementById('roi-bar').style.width=pct+'%';

  // Breakdown
  var totalItems=first+cases+abstracts+reviews+middle+qi;
  var bd='';
  if(totalItems>0){
    bd+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Total Items</span><strong>'+totalItems+'</strong></div>';
    bd+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Portfolio Score</span><strong>'+userScore+' pts</strong></div>';
    bd+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Optimal Benchmark</span><strong>'+optimalScore+' pts</strong></div>';

    // Weighted contribution breakdown
    var contribs=[];
    if(first)contribs.push({name:'First-Author',pts:first*pts.first,color:'var(--green)'});
    if(cases)contribs.push({name:'Case Reports',pts:cases*pts.cases,color:'var(--green)'});
    if(abstracts)contribs.push({name:'Abstracts',pts:abstracts*pts.abstracts,color:'var(--accent)'});
    if(reviews)contribs.push({name:'Reviews',pts:reviews*pts.reviews,color:'var(--accent)'});
    if(middle)contribs.push({name:'Middle-Author',pts:middle*pts.middle,color:'var(--text3)'});
    if(qi)contribs.push({name:'QI Projects',pts:qi*pts.qi,color:'var(--text3)'});
    contribs.sort(function(a,b){return b.pts-a.pts});

    bd+='<div style="margin-top:10px;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Contribution by Type</div>';
    contribs.forEach(function(c){
      var w=Math.round((c.pts/userScore)*100);
      bd+='<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>'+c.name+'</span><span style="color:'+c.color+'">'+c.pts+' pts ('+w+'%)</span></div>';
      bd+='<div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+w+'%;background:'+c.color+';border-radius:2px"></div></div></div>';
    });
  }
  document.getElementById('roi-breakdown').innerHTML=bd;

  // Advice
  var advice='';
  if(totalItems===0){
    advice='Start with a case report — it\'s the fastest path to your first publication (2-4 months). Then pursue a first-author original research project.';
  }else if(first===0&&pct<50){
    advice='Your most impactful next move: start a first-author original research project. One first-author paper outweighs 5 middle-author papers on your application.';
  }else if(first===1&&abstracts<2){
    advice='Good foundation with your first-author paper. Now submit 2-3 conference abstracts (ACC, AHA, or your specialty meeting) to build visibility with program directors.';
  }else if(first>=2&&cases===0){
    advice='Strong first-author output. Add a case report for portfolio diversity — it shows clinical observation skills and is a quick win (2-4 months).';
  }else if(pct>=70&&pct<90){
    advice='Competitive portfolio. To push to excellent: aim for one more first-author paper or target a higher-impact journal for your next submission.';
  }else if(pct>=90){
    advice='Outstanding research portfolio. You exceed the optimal benchmark. Focus your energy on strong letters of recommendation and interview preparation.';
  }else if(middle>first*2){
    advice='You have more middle-author than first-author papers. PDs weigh first-author work much more heavily. Prioritize driving your own project over contributing to others.';
  }else{
    advice='Keep building. Prioritize first-author work and conference abstracts — these have the highest ROI for your time investment.';
  }
  document.getElementById('roi-next').textContent=advice;
}

// ===== STRATEGIC AUDIT SUBMISSION =====
async function submitAudit(){
  var sections=[
    {title:'Current Position',fields:[
      {id:'audit-1a',label:'Current Position'},
      {id:'audit-1b',label:'Institution Strengths/Limitations'},
      {id:'audit-1c',label:'Financial Situation'},
      {id:'audit-1d',label:'CV Snapshot'},
      {id:'audit-1e',label:'Known For'}
    ]},
    {title:'The Decision',fields:[
      {id:'audit-2a',label:'Decision Facing'},
      {id:'audit-2b',label:'All Options Considered'},
      {id:'audit-2c',label:'Timeline'},
      {id:'audit-2d',label:'Already Tried'},
      {id:'audit-2e',label:'What\'s Holding Back'}
    ]},
    {title:'Values & Priorities',fields:[
      {id:'audit-3a',label:'Non-Negotiables'},
      {id:'audit-3b',label:'Willing to Sacrifice'},
      {id:'audit-3c',label:'Who Else Is Affected'},
      {id:'audit-3d',label:'Success in 1yr / 5yr'},
      {id:'audit-3e',label:'Will Regret Not Doing'}
    ]},
    {title:'Information & Risk',fields:[
      {id:'audit-4a',label:'Information Gaps'},
      {id:'audit-4b',label:'Who They\'ve Consulted'},
      {id:'audit-4c',label:'Worst Possible Outcome'},
      {id:'audit-4d',label:'Best Possible Outcome'},
      {id:'audit-4e',label:'Is It Reversible?'}
    ]}
  ];

  var filled=0;
  sections.forEach(function(s){s.fields.forEach(function(f){
    var el=document.getElementById(f.id);
    if(el&&el.value.trim())filled++;
  })});
  if(filled<3){notify('Please fill out at least a few sections before submitting.',1);return}

  var h='<div style="font-family:system-ui,sans-serif">';
  h+='<div style="font-size:16px;font-weight:700;margin-bottom:16px;color:#c8a87c">🎯 Strategic Audit Report</div>';
  h+='<div style="font-size:11px;color:#7a756e;margin-bottom:16px">'+filled+' of 20 fields completed</div>';

  sections.forEach(function(sec){
    var secFilled=0;
    sec.fields.forEach(function(f){var el=document.getElementById(f.id);if(el&&el.value.trim())secFilled++});
    h+='<div style="margin-bottom:16px;padding:12px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.1);border-radius:8px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    h+='<div style="font-size:11px;font-weight:700;color:#c8a87c;text-transform:uppercase;letter-spacing:1px">'+sec.title+'</div>';
    h+='<div style="font-size:10px;color:#7a756e">'+secFilled+'/'+sec.fields.length+' answered</div>';
    h+='</div>';
    h+='<table style="width:100%;font-size:12px;border-collapse:collapse">';
    sec.fields.forEach(function(f){
      var el=document.getElementById(f.id);
      var val=el?el.value.trim():'';
      h+='<tr style="border-bottom:1px solid rgba(200,168,124,.06)">';
      h+='<td style="padding:6px 8px;color:#7a756e;width:35%;vertical-align:top;font-size:11px">'+f.label+'</td>';
      h+='<td style="padding:6px 8px">'+(val||'<em style="color:#7a756e;font-size:11px">Not answered</em>')+'</td>';
      h+='</tr>';
    });
    h+='</table></div>';
  });

  // Completion summary
  var pct=Math.round((filled/20)*100);
  var completionColor=pct>=80?'#6abf4b':pct>=50?'#c8a87c':'#ef4444';
  h+='<div style="padding:10px 12px;background:rgba(200,168,124,.04);border-radius:6px;display:flex;align-items:center;gap:10px">';
  h+='<div style="width:36px;height:36px;border-radius:50%;border:3px solid '+completionColor+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:'+completionColor+';flex-shrink:0">'+pct+'%</div>';
  h+='<div><div style="font-size:12px;font-weight:600;color:'+completionColor+'">'+(pct>=80?'Comprehensive submission':pct>=50?'Partially complete':'Minimal detail')+'</div>';
  h+='<div style="font-size:10px;color:#7a756e">The more detail provided, the more actionable the review.</div></div></div>';
  h+='</div>';

  var payload={
    user_name:U?U.name:'Unknown',
    user_email:U?U.email:'Unknown',
    type:'audit',
    message:h,
    date:new Date().toISOString(),
    read:false,
    replies:[]
  };
  if(!DB.messages)DB.messages=[];
  DB.messages.push(payload);
  saveDB();
  if(_supaClient){
    try{await _supaClient.from('messages').insert([payload])}catch(ex){console.warn('Audit sync error',ex)}
  }
  document.getElementById('audit-form').classList.add('hidden');
  document.getElementById('audit-success').classList.remove('hidden');
  notify('Strategic audit submitted!');
  notifyAdmin(payload);
}

// ===== CAREER PIVOT DECISION ENGINE =====
var PIVOT_PROS_CONS={
  specialty:{
    title:'The Specialty Itself',
    pros:['Clear signal that a pivot may be warranted','You\'ve given the field a fair shot and can speak to it honestly','Transferable clinical skills remain valuable in adjacent specialties'],
    cons:['Full pivot is the most expensive and time-consuming option','Sunk cost of training years can create psychological resistance','May need to repeat fellowship or complete additional residency']
  },
  setting:{
    title:'The Practice Setting',
    pros:['Easiest to fix — same skills, different environment','No additional training typically required','Can test quickly (locum tenens, moonlighting, telemedicine)'],
    cons:['Risk of carrying the same patterns to a new setting','May need to relocate or accept different compensation','Cultural issues can exist across settings in the same specialty']
  },
  job:{
    title:'The Specific Job / Employer',
    pros:['Most common and most fixable root cause','Job change within specialty preserves all your training investment','Often leads to significant improvement in satisfaction and compensation'],
    cons:['May take 6-12 months to find the right replacement position','Non-compete clauses can limit local options','Risk of "grass is greener" thinking if the issue is deeper']
  },
  burnout:{
    title:'Burnout',
    pros:['Recognition is the first step — most physicians ignore this for years','Treatable with targeted interventions (therapy, boundaries, time off)','Often improves significantly without any career change'],
    cons:['Burnout distorts all decision-making — high risk of impulsive pivots','Can mask underlying structural misalignment','Recovery timeline is unpredictable (months to years)']
  }
};

var PIVOT_BURNOUT_FEEDBACK={
  burnout:{
    title:'Likely Burned Out',
    msg:'If you used to love this work and now feel exhausted or detached, burnout is the most likely explanation. Before making any career moves: take time off if possible, establish firm boundaries, and consider working with a therapist who understands physician burnout. Decisions made during burnout are often regretted.'
  },
  misaligned:{
    title:'Possible Structural Misalignment',
    msg:'If this field never felt right, the issue is likely structural rather than situational. This is a stronger signal that a pivot may be warranted. Focus on Step 2 to map your options carefully and Step 3 to ensure financial readiness.'
  },
  unsure:{
    title:'Unclear — Needs More Data',
    msg:'This is common and honest. Try this: take 2 weeks of vacation (real vacation, no email). If you dread coming back, it\'s likely misalignment. If you feel recharged and ready, it\'s likely burnout. Don\'t make permanent decisions based on temporary feelings.'
  }
};

function pivotSelect(el,group){
  // Highlight selected option
  var container=document.getElementById(group);
  if(container){
    container.querySelectorAll('label').forEach(function(l){l.style.borderColor='var(--border)';l.style.background='var(--bg2)'});
    el.style.borderColor='var(--accent)';el.style.background='rgba(200,168,124,.08)';
  }
  var val=el.querySelector('input').value;
  var fb=document.getElementById(group+'-feedback');
  if(!fb)return;

  if(group==='pivot-cause'){
    // Show/hide other text field
    var otherBox=document.getElementById('pivot-cause-other');
    if(otherBox){otherBox.classList.toggle('hidden',val!=='other')}
    if(PIVOT_PROS_CONS[val]){
      var data=PIVOT_PROS_CONS[val];
    var h='<div style="padding:14px;background:rgba(200,168,124,.04);border:1px solid rgba(200,168,124,.15);border-radius:8px;animation:fadeIn .3s">';
    h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:10px">'+data.title+'</div>';
    h+='<div style="display:flex;gap:12px;flex-wrap:wrap">';
    h+='<div style="flex:1;min-width:140px"><div style="font-size:10px;font-weight:600;color:var(--green);margin-bottom:6px">PROS</div>';
    data.pros.forEach(function(p){h+='<div style="font-size:11px;color:var(--text2);line-height:1.5;padding:2px 0">+ '+p+'</div>'});
    h+='</div>';
    h+='<div style="flex:1;min-width:140px"><div style="font-size:10px;font-weight:600;color:var(--red);margin-bottom:6px">CONS</div>';
    data.cons.forEach(function(c){h+='<div style="font-size:11px;color:var(--text2);line-height:1.5;padding:2px 0">\u2013 '+c+'</div>'});
    h+='</div></div></div>';
    fb.innerHTML=h;
  }else if(val==='other'){
    fb.innerHTML='<div style="padding:10px;background:rgba(200,168,124,.04);border-radius:6px;font-size:11px;color:var(--text2);line-height:1.5;animation:fadeIn .3s">Describe your situation in the field above. Dr. Faroqui will review the full context in your submitted report.</div>';
  }
  }
  if(group==='pivot-burnout'&&PIVOT_BURNOUT_FEEDBACK[val]){
    var d=PIVOT_BURNOUT_FEEDBACK[val];
    fb.innerHTML='<div style="padding:12px;background:rgba(200,168,124,.04);border:1px solid rgba(200,168,124,.15);border-radius:8px;animation:fadeIn .3s"><div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:6px">'+d.title+'</div><p style="font-size:11px;color:var(--text2);line-height:1.6;margin:0">'+d.msg+'</p></div>';
  }
  if(group==='pivot-regret'){
    if(val==='yes'){
      fb.innerHTML='<div style="padding:10px;background:rgba(200,168,124,.04);border-radius:6px;font-size:11px;color:var(--text2);line-height:1.5;animation:fadeIn .3s"><strong style="color:var(--accent)">That\'s a strong signal.</strong> Regret avoidance is one of the most reliable decision-making heuristics. If the financial reality supports it, this pivot deserves serious consideration.</div>';
    }else{
      fb.innerHTML='<div style="padding:10px;background:rgba(200,168,124,.04);border-radius:6px;font-size:11px;color:var(--text2);line-height:1.5;animation:fadeIn .3s"><strong style="color:var(--accent)">Good to know.</strong> If you won\'t regret staying, consider whether smaller adjustments (setting change, boundary changes, role modification) could address your dissatisfaction without a full pivot.</div>';
    }
  }
}

function pivotCalcAvg(){
  var rows=['stay','adj','full','hyb'];
  var dims=['f','i','t','s'];
  var best='';var bestAvg=0;
  var labels={stay:'Stay + Modify',adj:'Adjacent Pivot',full:'Full Pivot',hyb:'Hybrid'};
  rows.forEach(function(r){
    var sum=0;var count=0;
    dims.forEach(function(d){
      var v=parseInt(document.getElementById('pv-'+r+'-'+d).value);
      if(v){sum+=v;count++}
    });
    var avg=count===4?(sum/4).toFixed(1):'\u2014';
    document.getElementById('pv-'+r+'-avg').textContent=avg;
    if(count===4&&parseFloat(avg)>bestAvg){bestAvg=parseFloat(avg);best=r}
  });
  var rec=document.getElementById('pivot-recommendation');
  if(best&&rec){
    var color=bestAvg>=4?'var(--green)':bestAvg>=3?'var(--accent)':'var(--text3)';
    rec.innerHTML='<div style="padding:10px;background:rgba(200,168,124,.04);border-radius:6px;font-size:12px;color:var(--text2);line-height:1.5"><strong style="color:'+color+'">Highest rated: '+labels[best]+' ('+bestAvg.toFixed(1)+'/5.0)</strong></div>';
  }
}

function pivotCalcTraining(){
  var yrs=parseFloat(document.getElementById('pivot-train-yrs').value)||0;
  var tuition=parseFloat(document.getElementById('pivot-train-cost').value)||0;
  var salary=parseFloat(document.getElementById('pivot-train-salary').value)||0;
  var stipend=parseFloat(document.getElementById('pivot-train-stipend').value)||0;
  if(yrs===0){document.getElementById('pivot-train-result').innerHTML='<span style="font-size:12px;color:var(--text3)">Enter values above to calculate total cost</span>';return}
  var directCost=yrs*tuition;
  var opportunityCost=yrs*(salary-stipend);
  var totalCost=directCost+Math.max(0,opportunityCost);
  var el=document.getElementById('pivot-train-result');
  var h='<div style="font-size:11px;color:var(--text2);line-height:1.8;text-align:left">';
  h+='<div style="display:flex;justify-content:space-between"><span>Direct cost (tuition \u00d7 '+yrs+'yr)</span><strong>$'+directCost.toLocaleString()+'</strong></div>';
  h+='<div style="display:flex;justify-content:space-between"><span>Opportunity cost (lost salary \u2013 stipend)</span><strong>$'+Math.max(0,opportunityCost).toLocaleString()+'</strong></div>';
  h+='<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border);margin-top:6px"><span style="font-weight:600">Total cost of transition</span><strong style="color:var(--accent);font-size:14px">$'+totalCost.toLocaleString()+'</strong></div>';
  h+='</div>';
  el.innerHTML=h;
}

async function submitPivot(){
  // Collect structured data
  var cause=document.querySelector('input[name="pivot-cause"]:checked');
  var causeLabel=cause?(PIVOT_PROS_CONS[cause.value]?PIVOT_PROS_CONS[cause.value].title:'Other'):'Not selected';
  var causeOther='';
  if(cause&&cause.value==='other'){var otherText=document.getElementById('pivot-cause-other-text');if(otherText&&otherText.value.trim())causeOther=otherText.value.trim()}
  var burnout=document.querySelector('input[name="pivot-burnout"]:checked');

  var rows=['stay','adj','full','hyb'];
  var labels={stay:'Stay + Modify',adj:'Adjacent Pivot',full:'Full Pivot',hyb:'Hybrid'};
  var dims=['f','i','t','s'];
  var options=[];
  rows.forEach(function(r){
    var vals={};
    dims.forEach(function(d){vals[d]=parseInt(document.getElementById('pv-'+r+'-'+d).value)||0});
    var avg=document.getElementById('pv-'+r+'-avg').textContent;
    options.push({key:r,label:labels[r],f:vals.f,i:vals.i,t:vals.t,s:vals.s,avg:avg});
  });

  var yrs=parseFloat(document.getElementById('pivot-train-yrs').value)||0;
  var cost=parseFloat(document.getElementById('pivot-train-cost').value)||0;
  var sal=parseFloat(document.getElementById('pivot-train-salary').value)||0;
  var stip=parseFloat(document.getElementById('pivot-train-stipend').value)||0;
  var trainCost=yrs>0?Math.round((yrs*cost)+(yrs*Math.max(0,sal-stip))):0;

  var checks=[];
  var checkLabels=['Shadow new role','Informational interviews (3+)','Side project / moonlighting','Decision deadline set'];
  for(var i=1;i<=4;i++){checks.push({label:checkLabels[i-1],done:document.getElementById('pv-check-'+i).checked})}
  var regret=document.querySelector('input[name="pivot-regret"]:checked');
  var readiness=checks.filter(function(c){return c.done}).length;

  // Build clean HTML report
  var h='<div style="font-family:system-ui,sans-serif">';
  h+='<div style="font-size:16px;font-weight:700;margin-bottom:16px;color:#c8a87c">📊 Career Pivot Decision Engine Report</div>';

  // Step 1
  h+='<div style="margin-bottom:16px;padding:12px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.1);border-radius:8px">';
  h+='<div style="font-size:11px;font-weight:700;color:#c8a87c;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 1: Diagnose the Dissatisfaction</div>';
  h+='<table style="width:100%;font-size:12px;border-collapse:collapse">';
  h+='<tr><td style="padding:4px 8px;color:#7a756e;width:40%">Core Issue</td><td style="padding:4px 8px;font-weight:600">'+causeLabel+(causeOther?' — '+causeOther:'')+'</td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">What they dislike</td><td style="padding:4px 8px">'+(document.getElementById('pivot-1a').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">Same specialty, different setting?</td><td style="padding:4px 8px">'+(document.getElementById('pivot-1b').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">Burnout vs Misaligned</td><td style="padding:4px 8px;font-weight:600">'+(burnout?burnout.value:'<em style="color:#7a756e">Not selected</em>')+'</td></tr>';
  h+='</table></div>';

  // Step 2 — Options comparison chart
  h+='<div style="margin-bottom:16px;padding:12px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.1);border-radius:8px">';
  h+='<div style="font-size:11px;font-weight:700;color:#c8a87c;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 2: Options Comparison</div>';
  h+='<table style="width:100%;font-size:11px;border-collapse:collapse;text-align:center">';
  h+='<tr style="border-bottom:2px solid rgba(200,168,124,.15)"><th style="padding:6px;text-align:left;color:#7a756e">Option</th><th style="padding:6px;color:#7a756e">Feasibility</th><th style="padding:6px;color:#7a756e">Financial</th><th style="padding:6px;color:#7a756e">Timeline</th><th style="padding:6px;color:#7a756e">Satisfaction</th><th style="padding:6px;color:#c8a87c;font-weight:700">Avg</th></tr>';
  var bestAvg=0;var bestKey='';
  options.forEach(function(o){var a=parseFloat(o.avg);if(a>bestAvg){bestAvg=a;bestKey=o.key}});
  options.forEach(function(o){
    var isBest=o.key===bestKey&&bestAvg>0;
    var rowStyle=isBest?'background:rgba(106,191,75,.06);':'';
    function scoreColor(v){if(!v||v===0)return'color:#7a756e';if(v>=8)return'color:#6abf4b;font-weight:700';if(v>=5)return'color:#c8a87c';return'color:#ef4444'}
    h+='<tr style="border-bottom:1px solid rgba(200,168,124,.08);'+rowStyle+'">';
    h+='<td style="padding:6px;text-align:left;font-weight:600">'+(isBest?'✦ ':'')+o.label+'</td>';
    h+='<td style="padding:6px;'+scoreColor(o.f)+'">'+(o.f||'—')+'</td>';
    h+='<td style="padding:6px;'+scoreColor(o.i)+'">'+(o.i||'—')+'</td>';
    h+='<td style="padding:6px;'+scoreColor(o.t)+'">'+(o.t||'—')+'</td>';
    h+='<td style="padding:6px;'+scoreColor(o.s)+'">'+(o.s||'—')+'</td>';
    h+='<td style="padding:6px;font-weight:700;color:#c8a87c">'+o.avg+'</td>';
    h+='</tr>';
  });
  h+='</table>';
  if(bestKey&&bestAvg>0) h+='<div style="margin-top:8px;font-size:11px;color:#6abf4b;font-weight:600">✦ Highest scoring: '+labels[bestKey]+' ('+bestAvg.toFixed(1)+')</div>';
  h+='</div>';

  // Step 3
  h+='<div style="margin-bottom:16px;padding:12px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.1);border-radius:8px">';
  h+='<div style="font-size:11px;font-weight:700;color:#c8a87c;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 3: Financial Reality Check</div>';
  h+='<table style="width:100%;font-size:12px;border-collapse:collapse">';
  h+='<tr><td style="padding:4px 8px;color:#7a756e;width:40%">Debt / obligations</td><td style="padding:4px 8px">'+(document.getElementById('pivot-3a').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">Sustain reduced income?</td><td style="padding:4px 8px">'+(document.getElementById('pivot-3b').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">Comparable earning potential?</td><td style="padding:4px 8px">'+(document.getElementById('pivot-3c').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  if(trainCost>0) h+='<tr><td style="padding:4px 8px;color:#7a756e">Retraining cost estimate</td><td style="padding:4px 8px;font-weight:600;color:#ef4444">$'+trainCost.toLocaleString()+' <span style="font-weight:400;color:#7a756e;font-size:11px">('+yrs+' yrs)</span></td></tr>';
  h+='<tr><td style="padding:4px 8px;color:#7a756e">Emergency fund?</td><td style="padding:4px 8px">'+(document.getElementById('pivot-3d').value.trim()||'<em style="color:#7a756e">Not answered</em>')+'</td></tr>';
  h+='</table></div>';

  // Step 4 — Readiness
  h+='<div style="margin-bottom:16px;padding:12px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.1);border-radius:8px">';
  h+='<div style="font-size:11px;font-weight:700;color:#c8a87c;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 4: Readiness Check</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">';
  checks.forEach(function(c){
    var bg=c.done?'rgba(106,191,75,.08)':'rgba(239,68,68,.05)';
    var bdr=c.done?'rgba(106,191,75,.2)':'rgba(239,68,68,.12)';
    var clr=c.done?'#6abf4b':'#ef4444';
    h+='<div style="padding:8px 10px;background:'+bg+';border:1px solid '+bdr+';border-radius:6px;font-size:11px">';
    h+='<span style="color:'+clr+';font-weight:600">'+(c.done?'✅':'❌')+'</span> '+c.label+'</div>';
  });
  h+='</div>';
  var regretVal=regret?regret.value:'not answered';
  h+='<div style="font-size:12px"><span style="color:#7a756e">Will regret not trying in 5 years:</span> <strong>'+(regretVal==='yes'?'Yes — strong signal to act':regretVal==='no'?'No — may not be the right move':regretVal==='unsure'?'Unsure':regretVal)+'</strong></div>';
  // Readiness score
  var readyColor=readiness>=3?'#6abf4b':readiness>=2?'#c8a87c':'#ef4444';
  var readyLabel=readiness>=3?'Ready to decide':readiness>=2?'Almost ready':'More groundwork needed';
  h+='<div style="margin-top:10px;padding:8px 12px;background:rgba(200,168,124,.04);border-radius:6px;display:flex;align-items:center;gap:10px">';
  h+='<div style="width:36px;height:36px;border-radius:50%;border:3px solid '+readyColor+';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:'+readyColor+';flex-shrink:0">'+readiness+'/4</div>';
  h+='<div><div style="font-size:12px;font-weight:600;color:'+readyColor+'">'+readyLabel+'</div><div style="font-size:10px;color:#7a756e">Readiness checklist completion</div></div>';
  h+='</div>';
  h+='</div>';
  h+='</div>';

  var payload={
    user_name:U?U.name:'Unknown',
    user_email:U?U.email:'Unknown',
    type:'pivot-report',
    message:h,
    date:new Date().toISOString(),
    read:false,
    replies:[]
  };
  if(!DB.messages)DB.messages=[];
  DB.messages.push(payload);
  saveDB();
  if(_supaClient){
    try{await _supaClient.from('messages').insert([payload])}catch(ex){console.warn('Pivot sync error',ex)}
  }
  document.getElementById('pivot-form').classList.add('hidden');
  document.getElementById('pivot-success').classList.remove('hidden');
  notify('Decision Engine report submitted!');
  notifyAdmin(payload);
}

// ===== MOCK INTERVIEW SIMULATOR (v16) =====
var MIS_QUESTIONS={
  medschool:{
    general:[
      {q:'Why do you want to be a doctor?',type:'career',what:'The most important question of your life right now — and the easiest to blow. They hear "I want to help people" 50 times a day. They need YOUR story.',ideal:'A specific personal experience that sparked medicine, genuine intellectual curiosity about the science, understanding of what a doctor\'s life actually looks like, not idealized.',red:['Generic "helping people" answer','Only mentioning prestige or money','A parent/family member being sick as the ONLY reason (needs more depth)','No evidence you\'ve explored what being a doctor actually means']},
      {q:'Tell me about yourself.',type:'behavioral',what:'They want the 60-second version of who you are beyond your application. Hobbies, values, what makes you interesting as a human — not a resume recitation.',ideal:'Personal, memorable, shows character beyond academics, connects who you are to why medicine makes sense for you.',red:['Reading back your activities list','Being boring and forgettable','Only talking about academics','Going over 90 seconds']},
      {q:'What will you do if you don\'t get into medical school?',type:'behavioral',what:'A test of resilience, self-awareness, and whether you have a backup plan. "I\'ll just keep applying" is honest but weak.',ideal:'Genuine backup plan that still connects to healthcare/science, shows you\'ve actually thought about it, demonstrates maturity and adaptability.',red:['Saying "that\'s not an option" — it\'s arrogant and unrealistic','Having zero backup plan','Becoming visibly distressed','A backup plan completely unrelated to science/healthcare']},
      {q:'Tell me about a challenge you\'ve overcome.',type:'behavioral',what:'They want resilience and self-awareness. Choose something real — not a humble brag about how hard you studied for the MCAT.',ideal:'Genuine hardship or failure, specific actions you took, what you learned, how it prepared you for the demands of medicine.',red:['Choosing something trivially easy','Making it a humble brag','Not showing vulnerability','No lesson learned — just "it was hard but I did it"']},
      {q:'What is the biggest issue facing healthcare today?',type:'career',what:'They want informed opinions, not a TED talk. Pick one issue, show you understand its complexity, and have a nuanced take.',ideal:'Specific issue (access, cost, burnout, health equity, AI), nuanced understanding of multiple perspectives, connection to your experience or interests.',red:['Having no opinion on healthcare','Giving a surface-level answer from a headline','Being preachy or political without substance','Not connecting it to why you want to practice medicine']},
      {q:'Describe an experience where you worked with someone very different from you.',type:'behavioral',what:'Diversity and cultural competence test. They want evidence you can connect with patients from all backgrounds.',ideal:'Specific situation, what made it challenging, what you learned about yourself, how it changed your perspective.',red:['Tokenizing the other person','Having no cross-cultural experience','Making yourself the hero who "saved" someone','Being patronizing']},
      {q:'What do you do outside of academics?',type:'fit',what:'They\'re checking if you\'re a real human. All-studying-no-living applicants burn out. They want someone with depth and sustainability.',ideal:'Genuine interests with passion and depth, shows you can balance life, bonus if activities reveal character (not just resume padding).',red:['Listing activities purely for the application','Having nothing outside school','Only mentioning things that are obviously resume-builders','Not being able to talk passionately about anything']}
    ],
    specialty:{other:[]}
  },
  residency:{
    general:[
      {q:'Tell me about yourself.',type:'behavioral',what:'They want your 60-second origin story — not your CV recited back to them. Who are you, what drives you, and why medicine? This is the most common opening question and most people blow it by being too long or too generic.',ideal:'Concise (60-90 sec), personal motivation, clear trajectory to this specialty, ends with forward-looking statement.',red:['Reciting your CV line by line','Going over 2 minutes','No personal motivation — sounds like everyone else','Starting with "Well, I was born in..."']},
      {q:'Why this specialty?',type:'career',what:'They want genuine intellectual curiosity and a specific moment or experience that made it click. Not "I like helping people" — every doctor likes helping people.',ideal:'Specific clinical moment or experience, intellectual excitement about the field, understanding of daily attending life, honest about challenges.',red:['Generic answers that could apply to any specialty','Only mentioning lifestyle or money','No specific patient story or clinical experience','Badmouthing other specialties']},
      {q:'Tell me about a time you made a mistake in patient care. What happened and what did you learn?',type:'behavioral',what:'This is a character test. They want honesty, accountability, and evidence that you grew from it. Everyone makes mistakes — the question is whether you own it or hide behind a team.',ideal:'Specific real example, personal accountability (not blaming the system), what you learned, how it changed your practice going forward.',red:['Saying "I\'ve never made a mistake"','Blaming the nurse, the attending, or the EMR','Choosing something trivially small to avoid vulnerability','Not explaining what changed afterward']},
      {q:'Where do you see yourself in 10 years?',type:'career',what:'They want to see ambition that aligns with reality. Academic programs want to hear about research and teaching. Community programs want clinical excellence and leadership.',ideal:'Realistic and specific, shows you\'ve thought about it, aligns with the program\'s mission, mentions both clinical and non-clinical goals.',red:['Being vague — "I\'ll be a great doctor"','Pure money motivation','Having zero idea what you want','Describing a plan that doesn\'t require this residency']},
      {q:'What is your biggest weakness?',type:'behavioral',what:'The oldest trick in the book. Don\'t give a fake weakness ("I work too hard"). Give a real one with a real plan to address it. Self-awareness is the point.',ideal:'Genuine weakness (not a disguised strength), specific steps you\'re taking to improve, evidence of growth.',red:['The classic "I\'m a perfectionist" non-answer','Revealing something genuinely disqualifying','Not having a plan to address it','Getting defensive or dismissive']},
      {q:'Tell me about a conflict you had with a colleague and how you resolved it.',type:'behavioral',what:'They\'re testing emotional intelligence. Medicine is teamwork. They want to know you can disagree without being disagreeable.',ideal:'Specific situation, your role in the conflict (not just the other person\'s fault), steps you took to resolve it, outcome and what you learned.',red:['Trashing the other person','Making yourself the hero who was always right','Avoiding the question with "I don\'t really have conflicts"','No resolution — just a vent session']},
      {q:'What questions do you have for us?',type:'fit',what:'This is not optional. Having no questions signals disinterest. Having great questions signals that you\'ve done your homework and you\'re evaluating them too.',ideal:'2-3 specific questions about the program that show research (not things on the website), questions about culture/mentorship/resident experience.',red:['No questions','Questions answered on the website or in the brochure','Only asking about schedule, vacation, or salary','Asking something that makes them uncomfortable']}
    ],
    specialty:{
      cards:[
        {q:'Walk me through how you would manage a patient presenting with acute chest pain.',type:'clinical',what:'They want systematic thinking under pressure. Not a perfect answer — a structured approach that shows you know the priorities.',ideal:'ABCs first, focused history, ECG within 10 minutes, troponin, risk stratification, clear decision tree for STEMI vs NSTEMI vs other.',red:['Jumping to cath lab without assessment','Forgetting to mention ECG timing','No mention of differential diagnosis','Panicking or freezing']},
        {q:'Why cardiology specifically, and not another IM subspecialty?',type:'career',what:'They want to hear genuine passion for the heart — not just that it\'s competitive or well-paying. What about cardiology specifically excites your brain?',ideal:'Specific clinical moment, what makes cardiology intellectually unique to you, understanding of the daily grind (not just the glamour cases).',red:['Mentioning salary or lifestyle first','Generic answers about "saving lives"','Not being able to name specific aspects of cardiology that excite you','Comparing it negatively to other specialties']}
      ],
      ic:[
        {q:'You\'re doing a PCI and encounter a complication — a perforation. Walk me through your next 60 seconds.',type:'clinical',what:'They want calm, systematic thinking in a crisis. This is life-or-death and they need to know you won\'t freeze.',ideal:'Immediate balloon inflation at site, call for echo, assess hemodynamics, prepare for pericardiocentesis, consider covered stent, notify attending/team.',red:['Freezing or not having a systematic approach','Not mentioning balloon tamponade first','Forgetting to check for tamponade with echo','Not calling for help']},
        {q:'What draws you to interventional cardiology over general cardiology or EP?',type:'career',what:'They want to know you\'ve thought deeply about this and aren\'t just chasing procedures. What about wires, stents, and hemodynamics lights your brain up?',ideal:'Specific procedural experience that clicked, intellectual challenge of complex anatomy, immediate impact on patients, realistic understanding of call/lifestyle.',red:['Only talking about money','Not mentioning any hands-on experience','Being unable to articulate what\'s different about interventional work','Showing no awareness of the call burden']}
      ],
      im:[
        {q:'What area of internal medicine are you most passionate about and why?',type:'career',what:'Even for IM residency, they want to see intellectual curiosity and some direction, while remaining open to the breadth of IM.',ideal:'Specific area with a patient story, genuine curiosity, openness to discovering other areas during residency.',red:['Being so narrowly focused that you seem like you only want fellowship','Having no interests at all — seems apathetic','Choosing something because it\'s "easy" or "good lifestyle"']},
        {q:'How would you approach a patient with multiple comorbidities who is non-adherent to medications?',type:'clinical',what:'This tests empathy, systems thinking, and realistic medicine. There\'s no magic answer — they want to see how you think about complex patients.',ideal:'Explore barriers (cost, health literacy, side effects, beliefs), motivational interviewing approach, simplify regimen, involve pharmacist/social work, follow-up plan.',red:['Blaming the patient','Having no strategy beyond "tell them to take their meds"','Not considering social determinants','Being paternalistic']}
      ],
      gensurg:[
        {q:'Tell me about the most technically challenging case you\'ve been involved in.',type:'clinical',what:'They want to see genuine surgical experience and the ability to reflect on complexity — not bragging.',ideal:'Specific case, your role, what made it challenging, what you learned, honest about what went well and what didn\'t.',red:['Exaggerating your role','Not being able to describe the actual technical challenge','Only mentioning cases you observed, not participated in']},
        {q:'How do you handle the long hours and physical demands of a surgical career?',type:'behavioral',what:'This is a trap question if you dismiss it. They want realistic self-awareness about sustainability.',ideal:'Specific strategies (exercise, relationships, boundaries), acknowledgment that it\'s hard, evidence you\'ve already managed demanding schedules.',red:['Bravado — "I never get tired"','Complaining about hours','Having no actual coping strategy','Seeming unaware of what surgical residency demands']}
      ],
      other:[
        {q:'What do you think is the biggest challenge facing your chosen specialty in the next decade?',type:'career',what:'This tests whether you\'ve thought beyond the training bubble. Do you understand the landscape you\'re entering?',ideal:'Specific, informed answer (AI impact, workforce shortages, burnout, reimbursement changes), your thoughts on solutions or adaptation.',red:['Having no answer','Something vague like "healthcare is changing"','Being overly negative or cynical','Not connecting it to your own career planning']},
        {q:'Describe a patient encounter that challenged your assumptions or changed how you practice.',type:'behavioral',what:'They want humility and growth. Medicine is supposed to change you. Have you let it?',ideal:'Specific patient, what you assumed going in, what actually happened, how it changed your approach permanently.',red:['Not having an example','Choosing something superficial','Making it about you instead of the patient','No evidence of actual change in practice']}
      ]
    }
  },
  fellowship:{
    general:[
      {q:'Tell me about yourself and your path to this fellowship.',type:'behavioral',what:'By fellowship, your story should be tight. They want a clear narrative arc: why medicine → why this specialty → why this subspecialty → why now. No rambling.',ideal:'Under 90 seconds, clear trajectory, specific inflection points that led to this fellowship, forward-looking.',red:['Starting from medical school day one','No clear narrative arc','Sounding rehearsed and robotic','Going over 2 minutes']},
      {q:'What is your research interest and how do you plan to develop it?',type:'research',what:'For academic fellowship programs, this is non-negotiable. Even clinical fellows need a scholarly plan. They want specifics, not "I\'m interested in research."',ideal:'Specific area, why it matters clinically, preliminary work you\'ve done, realistic plan for fellowship, potential mentors you\'ve identified.',red:['No specific research interest','Only wanting to do clinical work (for academic programs)','Naming a mentor at the program without having contacted them','Having unrealistic expectations about what you can accomplish']},
      {q:'Why our program specifically?',type:'fit',what:'This is where homework pays off. They can tell immediately if you\'ve researched them or if you\'re giving a generic answer you give every program.',ideal:'Specific faculty, unique program features, patient population, research strengths, culture fit — things you learned from visiting or talking to current fellows.',red:['Generic answer that applies to any program','Only mentioning ranking or reputation','Not knowing basic facts about the program','Having clearly not talked to any current fellows']},
      {q:'Describe a difficult clinical decision you made during residency.',type:'clinical',what:'They want clinical maturity. Can you handle ambiguity? Do you know when to ask for help? Did you think through the decision systematically?',ideal:'Specific case with genuine complexity, your thought process, who you consulted, outcome, what you learned.',red:['Choosing an easy case to avoid vulnerability','Not consulting anyone — cowboy medicine','Only describing a textbook decision','No reflection on what you\'d do differently']},
      {q:'What do you think you\'ll struggle with most during fellowship?',type:'behavioral',what:'Self-awareness test. They want to see you\'ve thought about the challenges honestly and have a plan.',ideal:'Genuine anticipated challenge (technical skills, research time management, work-life balance), specific plan to address it.',red:['"Nothing, I\'m ready" — overconfidence','Something that suggests you can\'t handle the fellowship','No plan for how you\'ll address it','Getting defensive about the question']}
    ],
    specialty:{
      cards:[
        {q:'A patient is referred to you for heart failure management. Their EF is 25% and they\'re on no guideline-directed therapy. Walk me through your approach.',type:'clinical',what:'This is bread-and-butter cardiology. They want systematic GDMT initiation, not just drug names.',ideal:'Assess volume status first, initiate the four pillars (ACEi/ARB/ARNI, beta-blocker, MRA, SGLT2i), monitoring plan, device evaluation, patient education.',red:['Missing any of the four pillars','Starting everything at once without monitoring','Not mentioning device therapy evaluation','Forgetting to address the patient\'s understanding']},
        {q:'How do you see the field of cardiology evolving in the next 10 years?',type:'career',what:'They want a thoughtful answer showing you\'re paying attention to the field — AI in imaging, structural heart growth, precision medicine, workforce issues.',ideal:'Specific trends with examples, how they affect your planned career, honest about uncertainties.',red:['Having no opinion','Being too focused on one niche','Ignoring technology/AI impact','Being cynically negative about the field']}
      ],
      ic:[
        {q:'You\'re offered two jobs: academic at $450K with research time, and private practice at $700K pure clinical. How do you think about this decision?',type:'career',what:'No right answer — they want your decision-making framework. How do you weigh money vs career development vs lifestyle?',ideal:'Structured comparison (compensation, PSLF implications, career trajectory, research goals, call burden), acknowledgment of tradeoffs, framework not just gut feeling.',red:['Immediately choosing money without analysis','Dismissing the financial difference as irrelevant','Not considering PSLF or long-term wealth','Having no framework — just vibes']},
        {q:'What is your CTO experience and how comfortable are you with complex PCI?',type:'clinical',what:'Be honest about your level. Overselling will get you caught on day one. They want someone who knows their limits and is hungry to learn.',ideal:'Honest case numbers, specific techniques you\'re comfortable with, areas you want to develop, enthusiasm for learning.',red:['Inflating your numbers','Claiming comfort with procedures you\'ve barely done','Not showing eagerness to learn','Being dismissive about the complexity']}
      ],
      other:[
        {q:'How will you balance clinical duties with research during fellowship?',type:'behavioral',what:'Fellowship is a juggling act. They want a realistic plan, not "I\'ll just work harder."',ideal:'Specific time management strategy, understanding of protected research time, willingness to set boundaries, realistic about tradeoffs.',red:['Saying you\'ll do it all perfectly','Not having a plan','Seeming unaware of how demanding fellowship is','Ignoring the clinical load']},
        {q:'Tell me about a patient you\'ll never forget.',type:'behavioral',what:'This reveals what moves you as a physician. Choose someone who changed how you think about medicine.',ideal:'Specific patient, emotional honesty, what you learned, how it shapes your practice today.',red:['Choosing a case purely for the diagnosis, not the human','Being emotionally disconnected','Making it about your cleverness rather than the patient','Not having one — suggests disengagement']}
      ]
    }
  },
  academic:{
    general:[
      {q:'Tell us about your clinical and academic background.',type:'career',what:'This is your executive summary. They want: training pedigree, clinical focus, research productivity, teaching experience, and where you\'re headed.',ideal:'Crisp 90-second summary, clinical expertise clearly defined, research trajectory with publications mentioned, teaching philosophy briefly noted.',red:['Rambling through your entire CV','No mention of teaching (it\'s academic, teaching matters)','No research direction','Being vague about clinical expertise']},
      {q:'What does your 5-year research plan look like? What grants will you pursue?',type:'research',what:'This separates serious candidates from people who just want to be called "professor." They want a funded research trajectory, not vague interest.',ideal:'Specific aims, target funding (K-award, R01 plan, foundation grants), preliminary data, timeline, collaboration strategy.',red:['No specific grant plan','Only planning chart reviews','Not understanding K vs R funding','Having aims too broad to ever get funded']},
      {q:'How do you approach teaching and mentorship?',type:'behavioral',what:'Academic jobs require teaching. They want to know you\'re not just tolerating it — you should genuinely care about developing the next generation.',ideal:'Specific teaching philosophy, examples of past teaching, how you give feedback, how you mentor diverse learners.',red:['Treating teaching as an afterthought','No specific examples','Only lecturing — no mention of bedside teaching or mentorship','Seeming annoyed by trainees']},
      {q:'What would you need from this department to be successful?',type:'fit',what:'Smart question. They\'re testing whether your needs align with what they can offer. It also shows you know what you need.',ideal:'Specific needs (protected research time, mentorship, lab space, startup funding, administrative support), showing you\'ve thought about infrastructure.',red:['Saying "nothing, I\'m self-sufficient" — unrealistic','Only asking about salary','Having needs they clearly can\'t meet','Not having thought about this']},
      {q:'If you get this position, what will you be known for in 10 years?',type:'career',what:'Vision test. They want someone who will put their department on the map, not just occupy a slot.',ideal:'Specific clinical or research niche, realistic but ambitious, explains how it benefits the department and patients.',red:['Being vague — "I\'ll be a good faculty member"','Goals that don\'t need this department','No connection between your goals and their mission','Sounding like you\'re just passing through']}
    ],
    specialty:{other:[]}
  },
  private:{
    general:[
      {q:'Why are you interested in joining our practice?',type:'fit',what:'They want to know you\'ve researched their group and that you\'re not just applying everywhere. Practice culture matters enormously.',ideal:'Specific reasons (reputation, colleagues, patient population, practice model, call structure), evidence you\'ve talked to current physicians.',red:['Generic answer — "it seems like a great group"','Only mentioning compensation','Not knowing basic facts about the practice','Seeming like you\'re just comparison-shopping']},
      {q:'What kind of patient volume do you expect to handle and how do you plan to build your practice?',type:'career',what:'In private practice, you eat what you kill (at least eventually). They want to know you understand the business side.',ideal:'Realistic ramp-up expectations (12-18 months), networking plan, referral development strategy, community engagement.',red:['Expecting full volume from day one','Having no plan to build referrals','Being dismissive of the business side','Not understanding the ramp-up period']},
      {q:'How do you handle difficult patients or patient complaints?',type:'behavioral',what:'In private practice, patient satisfaction directly affects the business. They want emotional intelligence and de-escalation skills.',ideal:'Specific example, empathetic approach, de-escalation technique, follow-up, systemic changes to prevent recurrence.',red:['Getting defensive about complaints','Having no strategy','Dismissing patient concerns','Not taking satisfaction seriously in a private setting']},
      {q:'What are your long-term career goals? Do you see yourself eventually wanting to be a partner?',type:'career',what:'They\'re evaluating retention risk. Training someone who leaves in 2 years is expensive. They want commitment signals.',ideal:'Honest about timeline, interest in partnership/leadership, understanding of partnership track, long-term community commitment.',red:['Being noncommittal about staying','Only focusing on short-term','Not understanding the partnership model','Seeming like you\'re using this as a stepping stone']},
      {q:'Tell me about a time you had to adapt quickly to an unexpected clinical situation.',type:'clinical',what:'Private practice means less backup. They want to know you can handle things when the specialist is 45 minutes away.',ideal:'Specific case, rapid assessment, resourceful problem-solving, good outcome (or honest about a tough one), lessons learned.',red:['Never having faced real clinical pressure','Only describing cases with attending backup','Not showing independent clinical judgment','Freezing or panicking in the story']}
    ],
    specialty:{other:[]}
  },
  employed:{
    general:[
      {q:'What attracted you to hospital-employed practice versus private practice?',type:'career',what:'They want to know you understand the model and that you chose it for real reasons, not just because it was available.',ideal:'Specific reasons (guaranteed salary, benefits, less business management, institutional resources, team), realistic about tradeoffs.',red:['Badmouthing private practice','Only mentioning salary guarantee','Not understanding the employed model\'s limitations','Seeming like you couldn\'t get a private practice job']},
      {q:'How do you approach working within a large healthcare system with administrative requirements?',type:'behavioral',what:'Hospital systems have bureaucracy. They need to know you won\'t fight every policy and can work within the structure.',ideal:'Balanced approach — advocate for patients within the system, examples of navigating bureaucracy effectively, willingness to participate in committees.',red:['Ranting about administrators','Being a pushover with no advocacy','Not understanding that metrics and documentation matter','Seeming like you\'ll be a constant problem']},
      {q:'What is your approach to RVU-based productivity and meeting targets?',type:'career',what:'Employed positions increasingly tie compensation to productivity. They want to know you understand this and can perform.',ideal:'Understanding of RVU model, realistic expectations, strategies for efficiency without cutting corners, willingness to ramp up.',red:['Not knowing what an RVU is','Being hostile to productivity metrics','Having unrealistic volume expectations','Seeming like you\'ll coast on a guaranteed salary']},
      {q:'Describe your ideal work-life balance and how you manage call responsibilities.',type:'behavioral',what:'They need to know your expectations align with reality. Being honest about boundaries while showing flexibility is key.',ideal:'Realistic expectations, specific strategies for call recovery, acknowledgment that call is part of the job, clear boundaries without rigidity.',red:['Demanding no call','Saying you have no limits — unsustainable','Not asking about the actual call schedule','Having expectations that don\'t match the position']},
      {q:'How do you see yourself contributing to the department beyond clinical care?',type:'fit',what:'Employed positions want team players who improve the department — quality committees, teaching, mentoring, community outreach.',ideal:'Specific interests (QI, teaching, program building, community health), examples of past contributions beyond clinical work.',red:['Only wanting to see patients and go home','Having no interest in department life','Overcommitting to everything','Not understanding what the department needs']}
    ],
    specialty:{other:[]}
  },
  salary:{
    general:[
      {q:'Why do you believe a compensation adjustment is appropriate at this time?',type:'career',what:'This is the moment. You need data, not feelings. They want to see you\'ve done the homework with MGMA, wRVU reports, and market data.',ideal:'Specific data points (MGMA percentile, your wRVU production, market comparisons, recent offers), concrete number or range, professional tone.',red:['No data — just "I deserve more"','Being emotional or threatening','Not knowing your MGMA percentile','Comparing yourself to colleagues by name']},
      {q:'What specific contributions have you made that justify this increase?',type:'behavioral',what:'Document your value. Patient satisfaction scores, RVUs above target, program building, revenue generation, quality metrics.',ideal:'Specific metrics and accomplishments, revenue you\'ve generated, programs you\'ve built, patient outcomes, quantifiable impact.',red:['Vague contributions — "I work hard"','Not tracking your metrics','Only listing clinical volume without broader impact','Being unable to quantify your value']},
      {q:'If we can\'t meet your salary expectations, what other forms of compensation would you consider?',type:'career',what:'Smart negotiators have a full picture. Salary is one lever — there\'s also signing bonus, CME, research time, schedule flexibility, partnership acceleration.',ideal:'Prepared list of alternatives (CME budget, research time, schedule modification, bonus structure, title, partnership timeline), prioritized by what matters to you.',red:['Only caring about base salary','Having no alternatives prepared','Not understanding total compensation','Being inflexible']},
      {q:'Where do you see your career here in the next 3-5 years?',type:'fit',what:'They want to know you\'re invested. A raise is an investment in keeping you — they need to believe you\'re staying.',ideal:'Specific growth plans within the organization, leadership interests, program development, commitment signals.',red:['Hinting you might leave','Having no vision for growth','Seeming like the raise is just to stay afloat','Not connecting your future to their organization']},
      {q:'How do you handle the business and administrative side of your practice?',type:'behavioral',what:'Physicians who understand the business side get paid more because they\'re more valuable. Show you understand revenue, efficiency, and operations.',ideal:'Understanding of practice economics, specific examples of improving efficiency or revenue, willingness to take on leadership, data-driven approach.',red:['Being dismissive of business — "I\'m a doctor, not a businessman"','Not understanding how your practice generates revenue','Having no interest in operational improvement','Only seeing medicine through a clinical lens']}
    ],
    specialty:{other:[]}
  }
};

function misInit(){
  // Reset state on open
  document.getElementById('mis-interview').style.display='none';
  document.getElementById('mis-feedback').innerHTML='';
}

function misUpdateSpec(){
  // Optional — show/hide specialty-specific note
}

function misStart(){
  var type=document.getElementById('mis-type').value;
  var spec=document.getElementById('mis-spec').value;
  var setting=document.getElementById('mis-setting').value;
  var years=document.getElementById('mis-years').value;

  if(!type){notify('Select what you\'re interviewing for.',1);return}

  var bank=MIS_QUESTIONS[type];
  if(!bank){notify('Interview type not found.',1);return}

  // Build question pool: 3 general + 2 specialty (or all general if no specialty match)
  var generalPool=bank.general.slice();
  var specPool=[];

  // Map mis-spec values to specialty keys
  var specMap={
    cards:'cards',ic:'ic',ep:'cards',im:'im',im_outpatient:'im',im_hospitalist:'im',fm:'im',
    gi:'other',pulm:'other',hemonc:'other',neph:'other',endo:'other',
    rheum:'other',id:'other',em:'other',anes:'other',
    ortho:'gensurg',gensurg:'gensurg',uro:'gensurg',
    psych:'other',derm:'other',rads:'other',path:'other',
    peds:'other',obgyn:'other',neuro:'other',other:'other'
  };
  var specKey=specMap[spec]||'other';

  if(bank.specialty){
    if(bank.specialty[specKey]&&bank.specialty[specKey].length>0){
      specPool=bank.specialty[specKey].slice();
    }else if(bank.specialty.other&&bank.specialty.other.length>0){
      specPool=bank.specialty.other.slice();
    }
  }

  // Shuffle
  function shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}return arr;}

  shuffle(generalPool);
  shuffle(specPool);

  var questions=[];

  // Pick specialty questions first (up to 2)
  var specCount=Math.min(specPool.length,2);
  for(var i=0;i<specCount;i++) questions.push(specPool[i]);

  // Fill remainder from general (total 5)
  var genNeeded=5-questions.length;
  for(var i=0;i<genNeeded&&i<generalPool.length;i++) questions.push(generalPool[i]);

  // Shuffle final order
  shuffle(questions);

  window._misQuestions=questions;
  window._misType=type;
  window._misSetting=setting;

  // Render interview header
  var typeNames={residency:'Residency Interview',fellowship:'Fellowship Interview',academic:'Academic Faculty Interview',private:'Private Practice Interview',employed:'Hospital-Employed Position Interview',salary:'Salary Renegotiation Meeting'};
  var settingNames={academic:'Academic Medical Center',community:'Community Hospital',private:'Private Group Practice',va:'VA / Government'};

  var hdr='<div style="display:flex;align-items:center;gap:12px">';
  hdr+='<div style="font-size:32px">🎙️</div>';
  hdr+='<div>';
  hdr+='<div style="font-size:15px;font-weight:600;color:var(--accent);font-family:var(--font-serif)">'+(typeNames[type]||'Interview Simulation')+'</div>';
  hdr+='<div style="font-size:11px;color:var(--text3)">'+(settingNames[setting]||setting)+' • 5 Questions • Answer as if you\'re in the room</div>';
  hdr+='</div></div>';
  hdr+='<div style="margin-top:12px;padding:10px;background:rgba(200,168,124,.06);border-radius:8px;border:1px solid rgba(200,168,124,.1)">';
  hdr+='<div style="font-size:11px;color:var(--text2);line-height:1.6">💡 <strong>Treat this like a real interview.</strong> Type your actual answer — the way you\'d say it out loud. Don\'t look anything up. Your natural response is what we need to evaluate.</div>';
  hdr+='</div>';
  document.getElementById('mis-header').innerHTML=hdr;

  // Render questions
  var typeBadge={clinical:'🩺 Clinical',research:'🔬 Research',behavioral:'🧠 Behavioral',career:'🎯 Career',fit:'🏥 Program Fit'};
  var typeColor={clinical:'#3B82F6',research:'var(--green)',behavioral:'var(--accent)',career:'#8B5CF6',fit:'#E67E22'};

  var qh='';
  questions.forEach(function(q,i){
    qh+='<div style="margin-bottom:16px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px">';
    qh+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
    qh+='<span style="font-size:16px;font-weight:700;color:var(--accent)">Q'+(i+1)+'</span>';
    qh+='<span style="font-size:9px;padding:2px 8px;border-radius:100px;background:rgba(200,168,124,.06);color:'+(typeColor[q.type]||'var(--text3)')+';font-weight:600;letter-spacing:.5px">'+(typeBadge[q.type]||q.type)+'</span>';
    qh+='</div>';
    qh+='<div style="font-size:14px;font-weight:500;color:var(--text);line-height:1.6;margin-bottom:4px">"'+q.q+'"</div>';
    qh+='<div style="font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.5;font-style:italic">'+q.what+'</div>';
    qh+='<textarea id="mis-a'+i+'" rows="4" placeholder="Type your answer here... be honest, this is practice." style="width:100%;font-family:inherit;font-size:13px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);resize:vertical;box-sizing:border-box;line-height:1.6"></textarea>';
    qh+='</div>';
  });

  document.getElementById('mis-questions').innerHTML=qh;
  document.getElementById('mis-interview').style.display='block';
  document.getElementById('mis-feedback').innerHTML='';

  // Scroll to interview
  document.getElementById('mis-interview').scrollIntoView({behavior:'smooth',block:'start'});
}

function misGrade(){
  var questions=window._misQuestions;
  if(!questions||!questions.length){notify('Start the interview first.',1);return}

  var answers=[];
  var emptyCount=0;
  for(var i=0;i<questions.length;i++){
    var el=document.getElementById('mis-a'+i);
    var val=el?el.value.trim():'';
    answers.push(val);
    if(!val)emptyCount++;
  }

  if(emptyCount===questions.length){
    notify('Answer at least a few questions before getting feedback.',1);
    return;
  }

  // Grade each answer
  var results=[];
  var overallScore=0;

  questions.forEach(function(q,i){
    var ans=answers[i];
    var grade={score:0,label:'',color:'',strengths:[],concerns:[],advice:'',redFlags:[]};

    if(!ans){
      grade.score=0;
      grade.label='Not Answered';
      grade.color='var(--text3)';
      grade.concerns=['You skipped this question. In a real interview, silence is a red flag.'];
      grade.advice='Even a mediocre answer beats no answer. If you freeze, buy time: "That\'s a great question — let me think about that for a moment." Then give an honest attempt.';
      results.push(grade);
      return;
    }

    var words=ans.split(/\s+/).length;
    var sentences=ans.split(/[.!?]+/).filter(function(s){return s.trim().length>0}).length;
    var lower=ans.toLowerCase();

    // ===== DETECTION FLAGS =====
    // Specificity: real stories, names, cases, concrete details
    var hasSpecific=(/\b(patient|case|example|experience|specifically|instance|time when|I remember|one time|during my|rotation at|while I was|in my (PGY|third|second|first|intern))\b/i).test(ans);
    var hasConcreteDetail=(/\b(Dr\.|hospital|clinic|ICU|ED|floor|cath lab|OR|[A-Z][a-z]+ (Hospital|Medical|University|Center))\b/).test(ans);
    var hasData=(/\b(\d+%|\$[\d,]+|\d+ (year|month|patient|case|publication|hour|week)|MGMA|RVU|wRVU|percentile|score|Step [12]|USMLE)\b/i).test(ans);
    var hasOutcome=(/\b(result|outcome|improved|resolved|discharged|survived|recovered|successful|failed|complication)\b/i).test(ans);

    // Reflection & self-awareness
    var hasReflection=(/\b(learned|realized|changed|grew|taught me|made me|shaped|influenced|understand now|looking back|in hindsight|if I could do it again|what I took away)\b/i).test(ans);
    var hasAccountability=(/\b(my (fault|mistake|responsibility|weakness|limitation)|I should have|I could have done better|I own|I dropped|I missed|I failed|I struggled)\b/i).test(ans);

    // Structure
    var hasStructure=(/\b(first|second|third|additionally|furthermore|finally|in summary|to start|my approach|there are (two|three|four)|the (first|main|key) (thing|reason|point))\b/i).test(ans);
    var hasTransitions=sentences>=3&&(/\b(then|after that|from there|next|subsequently|this led|because of this|as a result)\b/i).test(ans);

    // Red flag patterns — much broader detection
    var hasFiller=(/\b(I think maybe|I guess|sort of|kind of|you know|um+|uh+|like,|basically|honestly I'm not sure|I don't really know|I suppose|whatever|stuff like that|things like that|and stuff|or something)\b/i).test(ans);
    var isGeneric=(/\b(I love helping people|make a difference|passion for medicine|always wanted to be a doctor|great opportunity|I've always been passionate|I really enjoy|I find it rewarding|it's very fulfilling|I like the idea of)\b/i).test(ans);
    var isNegative=(/\b(hate|terrible|worst|stupid|awful|can't stand|never liked|garbage|sucks|ridiculous|waste of time|pointless|boring)\b/i).test(ans);
    var isVague=!hasSpecific&&!hasData&&!hasConcreteDetail&&words>=10; // has words but says nothing concrete
    var isLazy=words<15&&sentences<=2; // barely tried
    var isRambling=words>300&&sentences>8&&!hasStructure;
    var isRepetitive=(function(){var w=lower.split(/\s+/);var seen={};var repeats=0;for(var k=0;k<w.length;k++){var ww=w[k].replace(/[^a-z]/g,'');if(ww.length>4){if(seen[ww])repeats++;seen[ww]=true}}return repeats>words*0.15})();
    var hasNoSubstance=words>=15&&!hasSpecific&&!hasData&&!hasReflection&&!hasStructure&&!hasConcreteDetail;
    var isDismissive=(/\b(I don't know|not sure|no idea|haven't thought about|good question|that's hard|I'll figure it out|we'll see|idk|idc|whatever)\b/i).test(ans);
    var isOverconfident=(/\b(I'm the best|no one else|I never fail|I always succeed|I'm perfect|nothing scares me|I have no weaknesses|I don't make mistakes|everyone says I'm)\b/i).test(ans);
    var mentionsMoney=(/\b(salary|money|pay|compensation|income|rich|wealthy|lucrative|six figures|seven figures)\b/i).test(ans);
    var badmouths=(/\b(my (program|school|hospital|residency|boss|attending|co-resident) (is|was|are|were) (bad|terrible|awful|toxic|incompetent|useless|worst)|I (hate|hated) my|the problem with my)\b/i).test(ans);

    var pts=0;
    var maxPts=100;

    // ===== LENGTH SCORING (15 pts) =====
    if(words>=60&&words<=200){pts+=15;grade.strengths.push('Good length — concise but substantial.')}
    else if(words>=40&&words<60){pts+=10;grade.concerns.push('Slightly short. A strong interview answer runs 60-90 seconds (roughly 100-180 words). Expand with a specific example.')}
    else if(words>=25&&words<40){pts+=6;grade.concerns.push('Too short. This sounds like you\'re dodging the question or haven\'t thought about it. In a real interview, this silence after 15 seconds would be awkward.')}
    else if(words>200&&words<=300){pts+=12;grade.concerns.push('Getting long. Interviewers tune out after 90 seconds. Tighten this up — what\'s the core message?')}
    else if(words>300){pts+=5;grade.concerns.push('Way too long. You\'d lose the interviewer halfway through. Cut this in half. The best answers are tight and memorable.')}
    else if(words<25){pts+=2;grade.concerns.push('Barely an answer. In a real interview, this would signal disinterest or total unpreparedness. You need at least 3-4 solid sentences.')}

    // ===== SPECIFICITY (25 pts) =====
    if(hasSpecific&&hasData&&hasConcreteDetail){pts+=25;grade.strengths.push('Great — specific examples with concrete details and data. This is the kind of answer that sticks with an interviewer.')}
    else if(hasSpecific&&(hasData||hasConcreteDetail)){pts+=20;grade.strengths.push('Good specificity with real examples. Adding one more concrete detail or number would make this even sharper.')}
    else if(hasSpecific){pts+=14;grade.strengths.push('You referenced a specific experience — good. Now anchor it with concrete details: where, when, what exactly happened, what was the outcome.')}
    else if(hasData){pts+=10;grade.concerns.push('You have data but no story. Numbers without context don\'t land. Wrap the data in a specific experience.')}
    else{pts+=2;grade.concerns.push('Too vague and generic. This answer could come from literally any applicant. An interviewer hears this and immediately forgets you. Give a specific patient, case, or situation that only YOU experienced.')}

    // ===== REFLECTION / SELF-AWARENESS (20 pts) =====
    if(hasReflection&&hasAccountability){pts+=20;grade.strengths.push('Excellent self-awareness. Showing growth and accountability is exactly what makes an interviewer lean forward.')}
    else if(hasReflection&&hasOutcome){pts+=16;grade.strengths.push('Good reflection with outcomes mentioned. You show capacity for growth.')}
    else if(hasReflection){pts+=12;grade.strengths.push('Some reflection present. Strengthen it by being more specific about exactly what changed in your thinking or practice.')}
    else if(hasAccountability){pts+=12;grade.strengths.push('Points for owning it. That takes guts and interviewers respect it.')}
    else{pts+=1;grade.concerns.push('No reflection or self-awareness comes through. Every strong interview answer ends with what you learned, how it changed you, or what you\'d do differently. Without this, you\'re just telling a story with no point.')}

    // ===== STRUCTURE & COHERENCE (15 pts) =====
    if(hasStructure&&hasTransitions&&sentences>=3){pts+=15;grade.strengths.push('Well-organized answer with clear structure and flow.')}
    else if(hasStructure&&sentences>=3){pts+=12;grade.strengths.push('Decent structure. Your points are organized.')}
    else if(sentences>=3&&!isRambling){pts+=8}
    else if(sentences>=2){pts+=4;grade.concerns.push('Needs more structure. Try: situation → what you did → result → what you learned. That framework works for 80% of interview questions.')}
    else{pts+=1;grade.concerns.push('This reads like one thought fragment, not a structured answer. Interviewers want to see organized thinking — it signals how you\'ll present at conferences, explain plans to patients, and communicate with teams.')}

    // ===== RED FLAG DETECTION (25 pts — this is where bad answers get punished) =====
    var flagsHit=0;

    // Content quality red flags
    if(isLazy){flagsHit++;grade.redFlags.push('🚩 This barely qualifies as an answer. One or two sentences tells the interviewer you either don\'t care or you\'re completely unprepared. Neither is a good look.')}
    if(isVague&&!isLazy){flagsHit++;grade.redFlags.push('🚩 Vague and unsubstantiated. You made claims without backing them up with anything concrete. Interviewers notice this immediately — it sounds like you\'re making it up on the spot.')}
    if(hasNoSubstance){flagsHit++;grade.redFlags.push('🚩 No substance. You used a lot of words but didn\'t actually say anything specific, reflective, or structured. This is the interview equivalent of writing a paragraph that says nothing.')}
    if(isDismissive){flagsHit++;grade.redFlags.push('🚩 Dismissive language detected. Saying "I don\'t know" or "I haven\'t thought about it" in an interview is a dealbreaker. If you don\'t know, pivot: "I\'m still developing my thinking on this, but here\'s where I am..."')}
    if(isOverconfident){flagsHit++;grade.redFlags.push('🚩 Overconfidence. Claiming you never fail, have no weaknesses, or are the best reads as either delusional or dishonest. Interviewers want self-awareness, not bravado.')}
    if(isRambling){flagsHit++;grade.redFlags.push('🚩 Rambling without direction. This goes on too long without clear structure. An interviewer would be checking their phone by the second paragraph.')}
    if(isRepetitive){flagsHit++;grade.redFlags.push('🚩 Repetitive — you\'re saying the same thing multiple ways. This happens when you don\'t have enough substance, so you fill space by rephrasing. Cut the repetition and add new content.')}

    // Language red flags
    if(hasFiller){flagsHit++;grade.redFlags.push('🚩 Filler language detected ("kind of," "I guess," "sort of," "basically"). This signals uncertainty. In an interview, uncertainty reads as incompetence. Cut every qualifier.')}
    if(isGeneric){flagsHit++;grade.redFlags.push('🚩 Cliché phrasing. "I love helping people" / "I\'ve always been passionate" — every single applicant says this. It\'s meaningless. Replace with the specific moment, case, or experience that actually made this real for you.')}
    if(isNegative){flagsHit++;grade.redFlags.push('🚩 Negative language about people, institutions, or experiences. Even if justified, negativity in an interview makes YOU look bad, not the thing you\'re criticizing. Reframe: what did you learn from a difficult situation?')}
    if(badmouths){flagsHit++;grade.redFlags.push('🚩 Badmouthing your program, school, or colleagues. This is an instant disqualifier at most programs. No matter how bad the situation was, the interviewer wonders: "Will they talk about us like this someday?"')}

    // Context-specific red flags
    if(mentionsMoney&&q.type!=='career'&&window._misType!=='salary'){flagsHit++;grade.redFlags.push('🚩 Mentioning money/salary unprompted. Unless you\'re in a salary negotiation, bringing up compensation signals that money is your primary motivator. Save it for the appropriate conversation.')}

    // Quality-based scoring (not just flag counting)
    if(flagsHit===0&&!isVague&&!isLazy&&!hasNoSubstance){
      pts+=25;
      // Only say "clean answer" if the answer actually has substance
      if(pts>=50){grade.strengths.push('No red flags. Clean, professional answer.')}
    }else if(flagsHit===1){pts+=12}
    else if(flagsHit===2){pts+=4}
    else{pts+=0} // 3+ flags = zero credit

    // ===== CALCULATE FINAL SCORE =====
    grade.score=Math.max(0,Math.min(Math.round(pts),100));

    // Adjust labels to be more honest at the low end
    if(grade.score>=80){grade.label='Strong';grade.color='var(--green)'}
    else if(grade.score>=60){grade.label='Decent';grade.color='var(--accent)'}
    else if(grade.score>=40){grade.label='Needs Work';grade.color='#E67E22'}
    else if(grade.score>=20){grade.label='Weak';grade.color='var(--red)'}
    else{grade.label='Not Ready';grade.color='var(--red)'}

    // ===== GENERATE TARGETED ADVICE =====
    var adviceParts=[];
    if(isLazy) adviceParts.push('You need to actually answer the question. Block 5 minutes, think about what you\'d really say, and write a real response. This isn\'t something you can wing.');
    else if(hasNoSubstance) adviceParts.push('You wrote words but said nothing memorable. Rewrite this starting with: "During my [specific rotation/year/experience] at [specific place], I [specific thing that happened]..."');
    if(!hasSpecific&&!isLazy) adviceParts.push('Start with "Let me tell you about a specific time when..." — stories beat abstractions every time. Name the place, the patient (anonymized), the situation.');
    if(words>=25&&words<60&&!isLazy) adviceParts.push('Flesh this out. Practice saying it out loud for 60-90 seconds. You need at least 4-5 sentences of real content.');
    if(words>250) adviceParts.push('Cut 30-40%. Read it out loud — if you\'re going past 90 seconds, you\'re losing them. What\'s the ONE thing you want them to remember?');
    if(!hasReflection&&!isLazy) adviceParts.push('End with what you learned or how it changed you. That\'s the line they actually remember 10 interviews later.');
    if(hasFiller) adviceParts.push('Remove every filler word. Replace "I think" with a statement. "I believe" or "In my experience" are stronger. "I guess" should never leave your mouth in an interview.');
    if(isGeneric) adviceParts.push('Kill every cliché. Replace "I\'m passionate about helping people" with the exact moment you knew this was your path. What patient? What happened? What did you feel?');
    if(isDismissive) adviceParts.push('Never say "I don\'t know" in an interview. Instead: "That\'s something I\'m actively thinking about. Here\'s where my thinking is so far..." Then give your best honest attempt.');
    if(isRepetitive) adviceParts.push('You\'re circling the same point. State it once, clearly, then move to the next idea. If you don\'t have a next idea, your answer needs more preparation.');
    if(badmouths) adviceParts.push('Rewrite without mentioning anyone negatively. Frame challenges as "I navigated a difficult environment and learned to..." Not "my program was terrible because..."');
    if(adviceParts.length===0){
      if(grade.score>=80) adviceParts.push('This is a strong answer. To go from good to great: practice it out loud 5 times, then record yourself. Watch the recording once. You\'ll immediately see what to tighten.');
      else adviceParts.push('Rewrite this answer from scratch using the STAR method: Situation, Task, Action, Result. Be specific in every section. Then read it out loud — does it sound like something a real person would say?');
    }
    grade.advice=adviceParts.join(' ');

    overallScore+=grade.score;
    results.push(grade);
  });

  var answered=questions.length-emptyCount;
  var avgScore=answered>0?Math.round(overallScore/answered):0;

  // Build feedback HTML
  var h='<div style="margin-top:24px">';

  // Overall score header
  h+='<div style="text-align:center;padding:28px;background:linear-gradient(160deg,rgba(200,168,124,.1),rgba(200,168,124,.03));border:1px solid rgba(200,168,124,.15);border-radius:14px;margin-bottom:20px">';
  h+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Interview Performance</div>';

  var overallColor=avgScore>=80?'var(--green)':avgScore>=60?'var(--accent)':avgScore>=40?'#E67E22':'var(--red)';
  var overallLabel=avgScore>=80?'Interview Ready':avgScore>=60?'Getting There':avgScore>=40?'Needs Practice':'Significant Work Needed';
  var overallMsg=avgScore>=80?'You\'d hold your own in most interviews. Keep practicing the specifics and you\'ll be sharp on game day.'
    :avgScore>=60?'Decent foundation, but you\'re leaving points on the table. The feedback below shows exactly where.'
    :avgScore>=40?'You\'re not ready yet — and that\'s why you\'re practicing here instead of bombing it live. Read every piece of feedback below.'
    :'Real talk: if you interviewed like this today, you\'d be forgotten by lunch. But that\'s fixable. Every strong interviewer was bad at first. Work through the feedback below methodically.';

  h+='<div style="width:80px;height:80px;border-radius:50%;border:4px solid '+overallColor+';display:flex;align-items:center;justify-content:center;margin:0 auto 12px">';
  h+='<span style="font-size:28px;font-weight:700;color:'+overallColor+'">'+avgScore+'</span>';
  h+='</div>';
  h+='<div style="font-size:16px;font-weight:600;color:'+overallColor+';margin-bottom:4px">'+overallLabel+'</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.6;max-width:400px;margin:0 auto">'+overallMsg+'</div>';
  if(emptyCount>0) h+='<div style="margin-top:10px;font-size:11px;color:var(--red)">'+emptyCount+' question'+(emptyCount>1?'s':'')+' left blank. Skipping questions in a real interview is never a good look.</div>';
  h+='</div>';

  // Per-question feedback
  questions.forEach(function(q,i){
    var g=results[i];
    var typeBadge={clinical:'🩺 Clinical',research:'🔬 Research',behavioral:'🧠 Behavioral',career:'🎯 Career',fit:'🏥 Program Fit'};
    var typeColor={clinical:'#3B82F6',research:'var(--green)',behavioral:'var(--accent)',career:'#8B5CF6',fit:'#E67E22'};

    h+='<div style="margin-bottom:16px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;border-left:4px solid '+g.color+'">';

    // Question header
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">';
    h+='<div style="display:flex;align-items:center;gap:8px">';
    h+='<span style="font-size:14px;font-weight:700;color:var(--accent)">Q'+(i+1)+'</span>';
    h+='<span style="font-size:9px;padding:2px 8px;border-radius:100px;background:rgba(200,168,124,.06);color:'+(typeColor[q.type]||'var(--text3)')+';font-weight:600;letter-spacing:.5px">'+(typeBadge[q.type]||q.type)+'</span>';
    h+='</div>';
    h+='<div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;font-weight:700;color:'+g.color+'">'+g.score+'/100</span><span style="font-size:10px;color:'+g.color+';font-weight:600">'+g.label+'</span></div>';
    h+='</div>';

    h+='<div style="font-size:12px;color:var(--text3);margin-bottom:12px;font-style:italic">"'+q.q+'"</div>';

    // Your answer (collapsed)
    if(answers[i]){
      h+='<details style="margin-bottom:12px"><summary style="font-size:11px;color:var(--text3);cursor:pointer;font-weight:600">📝 Your Answer</summary>';
      h+='<div style="font-size:12px;color:var(--text2);line-height:1.6;margin-top:8px;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">'+answers[i].replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>';
      h+='</details>';
    }

    // Strengths
    if(g.strengths.length>0){
      h+='<div style="margin-bottom:10px">';
      g.strengths.forEach(function(s){
        h+='<div style="font-size:11px;color:var(--green);line-height:1.6;padding:4px 0">✅ '+s+'</div>';
      });
      h+='</div>';
    }

    // Concerns
    if(g.concerns.length>0){
      h+='<div style="margin-bottom:10px">';
      g.concerns.forEach(function(c){
        h+='<div style="font-size:11px;color:#E67E22;line-height:1.6;padding:4px 0">⚠️ '+c+'</div>';
      });
      h+='</div>';
    }

    // Red flags
    if(g.redFlags.length>0){
      h+='<div style="margin-bottom:10px;padding:10px;background:rgba(239,68,68,.05);border-radius:6px;border:1px solid rgba(239,68,68,.15)">';
      g.redFlags.forEach(function(rf){
        h+='<div style="font-size:11px;color:var(--red);line-height:1.6;padding:2px 0">'+rf+'</div>';
      });
      h+='</div>';
    }

    // What a great answer looks like
    h+='<details style="margin-bottom:8px"><summary style="font-size:11px;color:var(--accent);cursor:pointer;font-weight:600">💡 What a great answer looks like</summary>';
    h+='<div style="font-size:11px;color:var(--text2);line-height:1.7;margin-top:8px;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">'+q.ideal+'</div>';
    h+='</details>';

    // Coaching advice
    h+='<div style="margin-top:8px;padding:10px;background:rgba(200,168,124,.04);border-radius:6px;border:1px solid rgba(200,168,124,.1)">';
    h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Coaching</div>';
    h+='<div style="font-size:11px;color:var(--text2);line-height:1.7">'+g.advice+'</div>';
    h+='</div>';

    h+='</div>';
  });

  // Bottom section: overall tips
  h+='<div style="padding:20px;background:linear-gradient(160deg,rgba(200,168,124,.06),rgba(200,168,124,.02));border:1px solid rgba(200,168,124,.12);border-radius:12px;margin-bottom:16px">';
  h+='<div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:12px;font-family:var(--font-serif)">🎯 The Honest Debrief</div>';
  h+='<div style="font-size:12px;color:var(--text2);line-height:1.8">';

  // Count red flags across all answers
  var totalRed=0;results.forEach(function(r){totalRed+=r.redFlags.length});
  var strongCount=0;results.forEach(function(r){if(r.score>=80)strongCount++});
  var weakCount=0;results.forEach(function(r){if(r.score<40)weakCount++});

  if(avgScore>=80){
    h+='You\'re in good shape. Your answers show specificity, self-awareness, and structure. Here\'s how to go from good to memorable:<br><br>';
    h+='• <strong>Practice out loud</strong> — reading and speaking are different skills. Record yourself.<br>';
    h+='• <strong>Time yourself</strong> — 60-90 seconds per answer. You know the content; now polish the delivery.<br>';
    h+='• <strong>Prepare 3 specific questions per program</strong> — not things on their website.<br>';
    h+='• <strong>Have your 30-second career story ready</strong> — why this path, why now, where you\'re going.';
  }else if(avgScore>=60){
    h+='You have the foundation, but you\'re not there yet. The gap between "solid" and "memorable" is specificity.<br><br>';
    h+='• <strong>Replace every generic statement with a specific example</strong> — names, numbers, outcomes.<br>';
    h+='• <strong>Add reflection to every answer</strong> — "Here\'s what I learned" is the line they remember.<br>';
    h+='• <strong>Cut filler language ruthlessly</strong> — "I think," "kind of," "sort of" signal insecurity.<br>';
    h+='• <strong>Do 2-3 mock interviews with attendings</strong> — not friends, attendings. You need honest feedback.';
    if(totalRed>2) h+='<br>• <strong>Address the '+totalRed+' red flags above</strong> — any one of them can tank an otherwise decent interview.';
  }else{
    h+='Let\'s be real: you need more practice before the real thing. But that\'s exactly why this tool exists — better to learn this now than in front of a program director.<br><br>';
    h+='• <strong>Start with one question at a time</strong> — master "Tell me about yourself" before moving on.<br>';
    h+='• <strong>Every answer needs a specific story</strong> — if you can\'t name a patient, a case, or a date, it\'s too vague.<br>';
    h+='• <strong>Record yourself and watch it back</strong> — painful but there\'s no faster way to improve.<br>';
    h+='• <strong>Get honest feedback from a mentor</strong> — not someone who will be nice. Someone who will be real.<br>';
    h+='• <strong>Come back and retake this in a week</strong> — track your improvement.';
    if(weakCount>2) h+='<br><br>'+weakCount+' of your 5 answers scored below 40. That\'s not a disaster — it\'s a starting point. Focus on the coaching notes above and rewrite each one.';
  }

  h+='</div></div>';

  // Retake button
  h+='<div style="display:flex;gap:10px">';
  h+='<button onclick="misStart()" class="btn btn-a" style="flex:1;padding:12px;font-size:13px">🔄 Retake Interview</button>';
  h+='<button onclick="misNewType()" class="btn btn-g" style="flex:1;padding:12px;font-size:13px">🔀 Try Different Type</button>';
  h+='</div>';
  h+='</div>';

  document.getElementById('mis-feedback').innerHTML=h;
  document.getElementById('mis-feedback').scrollIntoView({behavior:'smooth',block:'start'});
}

function misNewType(){
  document.getElementById('mis-interview').style.display='none';
  document.getElementById('mis-feedback').innerHTML='';
  document.getElementById('mis-type').value='';
  document.getElementById('mis-tool').scrollIntoView({behavior:'smooth',block:'start'});
}

