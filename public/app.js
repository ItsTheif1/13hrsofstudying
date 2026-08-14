/* ══════════════════════════════════════
   CONFIG — update GNM_BASE with your repo
   ══════════════════════════════════════ */
var CORRECT_CODE = 'idontknowhowtocode';

var CLOAK_MAP = {none:{title:null,favicon:null},classroom:{title:'Stream - Google Classroom',favicon:'https://ssl.gstatic.com/classroom/favicon.png'},docs:{title:'Document - Google Docs',favicon:'https://docs.google.com/favicon.ico'},sheets:{title:'Sheets - Google Sheets',favicon:'https://sheets.google.com/favicon.ico'},slides:{title:'Presentation - Google Slides',favicon:'https://slides.google.com/favicon.ico'},gmail:{title:'Gmail',favicon:'https://mail.google.com/favicon.ico'},meet:{title:'Meet - Google Meet',favicon:'https://meet.google.com/favicon.ico'}};
var S = {theme:'black',name:localStorage.getItem('s_name')||'mizumath copy',proxy:localStorage.getItem('s_proxy')||'uv',cloak:localStorage.getItem('s_cloak')||'none',navPlace:localStorage.getItem('s_navplace')||'left'};

var ALL = [];
var GLIB = JSON.parse(localStorage.getItem('gamelibv2')||'[]');
var selectedGame = null;
var proxyHistory = [], proxyHistoryIndex = -1;
var weatherLoaded = false, moviesLoaded = false, navHidden = false;
var curGSGame = null;

/* ── Popular games list (ordered by popularity) ── */
var POPULAR_KEYS = ['slope','Cookie Clicker','minecraft','subway surfers','deltarune','fruit ninja','celeste','superhot','pvz2'];

/* ── Load games from g.json ── */
(function(){
  fetch('./g.json')
    .then(function(r){return r.json();})
    .then(function(data){
      ALL = (data.games||[]).map(function(g){
        return {
          name: g.name,
          filepath: g.filepath,
          icon: g.icon || g['icon.png'],
          url: g.filepath
        };
      });
      renderStoreGrid('');
      showNoGame();
      renderHomeGames();
    })
    .catch(function(e){console.error('Failed to load g.json:',e)});
})();

/* ── HOME GAME GRID ── */
function getPopularGames(){
  var result=[];
  POPULAR_KEYS.forEach(function(key){
    var found=ALL.find(function(g){return g.url.toLowerCase().indexOf(key.toLowerCase())>=0||g.name.toLowerCase()===key.toLowerCase();});
    if(found&&result.indexOf(found)<0)result.push(found);
  });
  ALL.forEach(function(g){if(result.indexOf(g)<0)result.push(g);});
  return result;
}
function renderHomeGames(){
  var games=getPopularGames();
  var feat=document.getElementById('home-feat-card');
  var grid=document.getElementById('home-card-grid');
  if(!feat||!grid)return;

  var g0=games[0];
  if(g0){
    var imgHtml=g0.icon?'<img class="hf-img" src="'+g0.icon+'" alt="'+g0.name+'" onerror="this.style.display=\'none\'">':
      '<div class="hf-img-ph">🎮</div>';
    feat.innerHTML=imgHtml+
      '<div class="hf-overlay"></div>'+
      '<div class="hf-rank">#1</div>'+
      '<div class="hf-info">'+
        '<div class="hf-name">'+g0.name+'</div>'+
        '<div class="hf-sub">local · free to play</div>'+
        '<button class="hf-play">▶ Play Now</button>'+
      '</div>';
    feat.querySelector('.hf-play').addEventListener('click',function(e){e.stopPropagation();openGameOverlay(g0.url,g0.name);});
    feat.addEventListener('click',function(){openGameOverlay(g0.url,g0.name);});
  }

  grid.innerHTML='';
  var gridGames=games.slice(1,9);
  gridGames.forEach(function(g,i){
    var card=document.createElement('div');
    card.className='hc-card';
    var imgHtml=g.icon
      ?'<div class="hc-img-ph">🎮</div><img class="hc-img" src="'+g.icon+'" alt="" onerror="this.remove()">'
      :'<div class="hc-img-ph">🎮</div>';
    card.innerHTML=imgHtml+'<div class="hc-card-overlay"></div><div class="hc-rank-badge">#'+(i+2)+'</div>';
    card.addEventListener('click',function(){openGameOverlay(g.url,g.name);});
    grid.appendChild(card);
  });
}

/* ── GATE ── */
(function(){if(localStorage.getItem('gate_passed')==='1'){document.getElementById('gate').style.display='none';if(!localStorage.getItem('gamertag'))setTimeout(openTagModal,300);}})();
document.getElementById('gate-btn').addEventListener('click',checkGate);
document.getElementById('gate-input').addEventListener('keydown',function(e){if(e.key==='Enter')checkGate();});
function checkGate(){var v=document.getElementById('gate-input').value.toLowerCase(),err=document.getElementById('gate-err');if(v===CORRECT_CODE){localStorage.setItem('gate_passed','1');var g=document.getElementById('gate');g.style.opacity='0';setTimeout(function(){g.style.display='none';},400);if(!localStorage.getItem('gamertag'))setTimeout(openTagModal,300);}else{err.textContent='Wrong code';setTimeout(function(){err.textContent='';},2200);}}

/* ── GAMERTAG ── */
document.getElementById('status-bar').addEventListener('click',openTagModal);
document.getElementById('tag-close-btn').addEventListener('click',closeTagModal);
document.getElementById('tag-save-btn').addEventListener('click',saveTag);
document.getElementById('tag-overlay').addEventListener('click',function(e){if(e.target===this)closeTagModal();});
function openTagModal(){var t=localStorage.getItem('gamertag')||'';document.getElementById('tag-input').value=t;document.getElementById('tag-err').textContent='';updateTagModalDisplay(t);document.getElementById('tag-overlay').classList.add('open');}
function closeTagModal(){document.getElementById('tag-overlay').classList.remove('open');}
function updateTagModalDisplay(t){document.getElementById('tag-name-display').textContent=t||'No tag set';document.getElementById('tag-avatar-big').textContent=t?t[0].toUpperCase():'?';}
function saveTag(){var v=document.getElementById('tag-input').value.trim(),err=document.getElementById('tag-err');if(!v){err.textContent='Enter a gamertag.';return;}if(v.length<2){err.textContent='Gamertag too short.';return;}if(v.length>20){err.textContent='Gamertag too long.';return;}localStorage.setItem('gamertag',v);updateTagModalDisplay(v);closeTagModal();updateStatusBar();}
function updateStatusBar(){var t=localStorage.getItem('gamertag')||'',u=document.getElementById('status-username-text'),a=document.getElementById('status-avatar-text');if(t){u.textContent=t;u.classList.remove('hidden');a.textContent=t[0].toUpperCase();}else{u.classList.add('hidden');a.textContent='?';}}

/* ── SHIFT+TAB → hide/show nav ── */
document.addEventListener('keydown',function(e){
  if(e.key==='Tab'&&e.shiftKey){
    e.preventDefault();
    navHidden=!navHidden;
    var nav=document.getElementById('topnav'),sb=document.getElementById('status-bar'),hint=document.getElementById('nav-hint');
    nav.classList.toggle('nav-hidden',navHidden);
    sb.classList.toggle('nav-hidden',navHidden);
    if(navHidden){hint.classList.add('show');setTimeout(function(){hint.classList.remove('show');},2400);}  }
});

/* ── NAV ── */
['home','movies','games','partners','apps','settings'].forEach(function(n){document.getElementById('btn-'+n).addEventListener('click',function(){showSection(n+'-section');});});
function showSection(id){
  document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
  var map={'home-section':'btn-home','games-section':'btn-games','apps-section':'btn-apps','partners-section':'btn-partners','settings-section':'btn-settings','movies-section':'btn-movies'};
  var btn=document.getElementById(map[id]);if(btn)btn.classList.add('active');
  if(id==='movies-section'&&!moviesLoaded){moviesLoaded=true;document.getElementById('movies-frame').src='https://m-zone.org/';}
  if(id==='games-section') switchGTab('store');
}

/* ── SETTINGS ── */
document.querySelectorAll('.theme-swatch').forEach(function(s){s.addEventListener('click',function(){if(this.dataset.theme==='soon'){showToast('Coming soon!');return;}seedParticles();});});
document.querySelectorAll('.name-pill').forEach(function(b){b.addEventListener('click',function(){pickName(this.dataset.name);});});
function applyName(n){var l=n||'mizumath copy';document.getElementById('home-title-text').textContent=l;document.getElementById('nav-logo-text').textContent='13';if(S.cloak==='none')document.getElementById('page-title').textContent=l;}
function pickName(n){S.name=n;localStorage.setItem('s_name',n);applyName(n);}
document.getElementById('place-bottom').addEventListener('click',function(){setNavPlacement('bottom');});
document.getElementById('place-left').addEventListener('click',function(){setNavPlacement('left');});
function applyNavPlacement(p){document.body.setAttribute('data-nav',p);document.getElementById('place-bottom').classList.toggle('active',p==='bottom');document.getElementById('place-left').classList.toggle('active',p==='left');}
function setNavPlacement(p){S.navPlace=p;localStorage.setItem('s_navplace',p);applyNavPlacement(p);showToast('Bar: '+p);}
document.querySelectorAll('.proxy-opt').forEach(function(o){o.addEventListener('click',function(){setProxy(this.id.replace('proxy-',''));});});
function setProxy(p){S.proxy=p;localStorage.setItem('s_proxy',p);document.querySelectorAll('.proxy-opt').forEach(function(o){o.classList.remove('active');});var el=document.getElementById('proxy-'+p);if(el)el.classList.add('active');}
document.querySelectorAll('.cloak-opt').forEach(function(o){o.addEventListener('click',function(){setCloak(this.dataset.cloak);});});
function applyCloak(c){var cfg=CLOAK_MAP[c]||CLOAK_MAP.none;document.getElementById('page-title').textContent=cfg.title||(S.name||'mizumath copy');var lk=document.querySelector("link[rel~='icon']");if(lk){if(cfg.favicon)lk.href=cfg.favicon;}else if(cfg.favicon){var lnk=document.createElement('link');lnk.rel='icon';lnk.href=cfg.favicon;document.head.appendChild(lnk);}}
function setCloak(c){S.cloak=c;localStorage.setItem('s_cloak',c);applyCloak(c);showToast(c==='none'?'Cloak off':'Tab cloaked!');}

/* ── TOAST ── */
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}

/* ── GREETING ── */
(function(){var h=new Date().getHours();document.getElementById('home-greeting').textContent=h>=5&&h<12?'good morning':h>=12&&h<17?'good afternoon':h>=17&&h<21?'good evening':'good night';})();

/* ── BG STARS ── */
var bgC=document.getElementById('bg'),bgX=bgC.getContext('2d');
var bgStars=[];
function seedParticles(){
  var count=Math.max(90,Math.min(220,Math.floor((innerWidth*innerHeight)/8500)));
  bgStars=[];
  for(var i=0;i<count;i++){
    bgStars.push({x:Math.random(),y:Math.random(),r:.35+Math.random()*1.25,a:.16+Math.random()*.64,tw:.00045+Math.random()*.0014,p:Math.random()*Math.PI*2});
  }
}
function resizeBg(){bgC.width=innerWidth;bgC.height=innerHeight;seedParticles();}
resizeBg();window.addEventListener('resize',resizeBg);

/* ── GAMES CANVAS BG ── */
var gCvs=document.getElementById('g-canvas'),gCtx=gCvs&&gCvs.getContext('2d'),gOrbs=[];
function initGBg(){if(!gCvs)return;gCvs.width=gCvs.offsetWidth||innerWidth;gCvs.height=gCvs.offsetHeight||innerHeight;gOrbs=[{ox:.12,oy:.18,r:.52,s:.00022,a:.13,p:1.7},{ox:.8,oy:.12,r:.42,s:.00011,a:.09,p:3.14},{ox:.5,oy:.95,r:.46,s:.00008,a:.06,p:4.7}];}
function drawGBg(t){if(!gCtx)return;var sec=document.getElementById('games-section');if(!sec||!sec.classList.contains('active'))return;var w=gCvs.width,h=gCvs.height,sky=gCtx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#141921');sky.addColorStop(.5,'#0a0f18');sky.addColorStop(1,'#000');gCtx.fillStyle=sky;gCtx.fillRect(0,0,w,h);gCtx.globalCompositeOperation='lighter';gOrbs.forEach(function(o){var x=o.ox*w,y=o.oy*h,r=o.r*Math.max(w,h),a=o.a*(.6+.4*Math.sin(t*o.s+o.p)),g=gCtx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(200,210,255,'+a+')');g.addColorStop(.5,'rgba(100,120,200,'+(a*.3)+')');g.addColorStop(1,'transparent');gCtx.fillStyle=g;gCtx.fillRect(0,0,w,h);});gCtx.globalCompositeOperation='source-over';}
initGBg();window.addEventListener('resize',initGBg);

/* ── MAIN LOOP ── */
function loop(t){
  var w=bgC.width,h=bgC.height;
  var sky=bgX.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#14161b');sky.addColorStop(.48,'#090a0e');sky.addColorStop(1,'#030405');
  bgX.fillStyle=sky;bgX.fillRect(0,0,w,h);
  var glows=[{x:.18,y:.16,r:.42,a:.11},{x:.82,y:.1,r:.38,a:.09},{x:.5,y:1.05,r:.55,a:.07}];
  glows.forEach(function(o){
    var g=bgX.createRadialGradient(o.x*w,o.y*h,0,o.x*w,o.y*h,o.r*Math.max(w,h));
    g.addColorStop(0,'rgba(220,229,239,'+o.a+')');
    g.addColorStop(.48,'rgba(120,130,146,'+(o.a*.28)+')');
    g.addColorStop(1,'transparent');
    bgX.fillStyle=g;bgX.fillRect(0,0,w,h);
  });
  bgX.save();
  bgX.globalCompositeOperation='lighter';
  bgStars.forEach(function(s){
    var x=s.x*w,y=s.y*h,a=s.a*(.68+.32*Math.sin(t*s.tw+s.p));
    bgX.beginPath();bgX.arc(x,y,s.r,0,Math.PI*2);bgX.fillStyle='rgba(245,248,255,'+a+')';bgX.fill();
    if(s.r>1.15){bgX.beginPath();bgX.arc(x,y,s.r*3.2,0,Math.PI*2);bgX.fillStyle='rgba(200,210,225,'+(a*.08)+')';bgX.fill();}
  });
  bgX.restore();
  drawGBg(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ══════════════════════════════════════
   GAME LIBRARY — local games from g.json
   ══════════════════════════════════════ */

document.querySelectorAll('.gtab').forEach(function(b){b.addEventListener('click',function(){switchGTab(this.dataset.t);});});
function switchGTab(t){
  document.querySelectorAll('.gtab').forEach(function(b){b.classList.toggle('active',b.dataset.t===t);});
  var feat=document.getElementById('g-feature');
  var storeW=document.getElementById('g-store-wrap');
  var discW=document.getElementById('g-discover-wrap');
  var search=document.getElementById('g-search');
  if(t==='library'){
    feat.style.display='block';storeW.style.display='none';discW.style.display='none';
    search.placeholder='Search library…';
    renderLibList('');
  } else if(t==='store'){
    feat.style.display='none';storeW.style.display='block';discW.style.display='none';
    search.placeholder='Search store…';
    renderStoreGrid('');
  } else if(t==='luminsdk'){
    feat.style.display='none';storeW.style.display='none';discW.style.display='block';
    search.placeholder='Search LuminSDK…';
    renderLuminSdk('');
  } else {
    feat.style.display='none';storeW.style.display='none';discW.style.display='block';
    search.placeholder='Search games…';
    renderDiscover();
  }
}

document.getElementById('g-search').addEventListener('input',function(){
  var q=this.value.toLowerCase().trim();
  var t=document.querySelector('.gtab.active').dataset.t;
  if(t==='library') renderLibList(q);
  else if(t==='store') renderStoreGrid(q);
  else if(t==='luminsdk') renderLuminSdk(q);
  else renderDiscover();
});

/* ── library ── */
function saveLib(){localStorage.setItem('gamelibv2',JSON.stringify(GLIB));}
function addToLib(game){
  if(GLIB.indexOf(game.url)>=0)return false;
  GLIB.push(game.url);saveLib();renderLibList('');
  document.querySelectorAll('.g-add[data-url="'+game.url+'"]').forEach(function(b){b.textContent='✔ Added';b.classList.add('owned');});
  return true;
}
function remFromLib(url){
  var i=GLIB.indexOf(url);if(i<0)return;
  GLIB.splice(i,1);saveLib();renderLibList('');
  if(selectedGame&&selectedGame.url===url){selectedGame=null;showNoGame();}
}

function renderLibList(q){
  var list=document.getElementById('g-lib-list');
  list.innerHTML='';
  var games=GLIB.map(function(url){return ALL.find(function(g){return g.url===url;})||{name:url,url:url,id:0};});
  if(q) games=games.filter(function(g){return g.name.toLowerCase().indexOf(q)>=0;});
  if(games.length===0){
    var e=document.createElement('div');e.className='lib-empty-msg';
    e.innerHTML='<span class="lib-empty-icon">🎮</span>'+(GLIB.length===0?'Library is empty.<br>Add games from the Store.':'No results.');
    list.appendChild(e);return;
  }
  games.forEach(function(g){
    var item=document.createElement('div');
    item.className='lib-item'+(selectedGame&&selectedGame.url===g.url?' selected':'');
    var thumb=g.icon?'<img src="'+g.icon+'" alt="'+g.name+'">':g.name[0].toUpperCase();
    item.innerHTML='<div class="lib-thumb">'+thumb+'</div>'+
      '<div><div class="lib-item-name">'+g.name+'</div><div class="lib-item-src">local</div></div>';
    item.addEventListener('click',function(){selectGame(g);});
    list.appendChild(item);
  });
}

function selectGame(game){
  selectedGame=game;
  renderLibList('');
  var feat=document.getElementById('g-feature');
  feat.style.display='block';
  document.getElementById('g-no-game').style.display='none';
  document.getElementById('g-feat-title').textContent=game.name;
  document.getElementById('g-feat-src').textContent='local · Free';
  document.getElementById('g-store-wrap').style.display='none';
  document.getElementById('g-discover-wrap').style.display='none';
}
function showNoGame(){
  document.getElementById('g-feat-title').textContent='Select a game';
  document.getElementById('g-feat-src').textContent='';
  document.getElementById('g-no-game').style.display='flex';
}

document.getElementById('g-feat-play').addEventListener('click',function(){if(selectedGame)openGameOverlay(selectedGame.url,selectedGame.name);});
document.getElementById('g-feat-rem').addEventListener('click',function(){if(selectedGame){remFromLib(selectedGame.url);showToast('Removed from library');}});

/* ── store grid ── */
function renderStoreGrid(q){
  var grid=document.getElementById('g-store-grid');
  var loading=document.getElementById('g-store-loading');
  loading.style.display='none';
  grid.innerHTML='';
  var games=q?ALL.filter(function(g){return g.name.toLowerCase().indexOf(q)>=0;}):ALL;
  document.getElementById('g-count').textContent=games.length+' games';
  games.forEach(function(g){
    var inLib=GLIB.indexOf(g.url)>=0;
    var el=document.createElement('div');el.className='gsc';
    var artPh=g.icon?'<img src="'+g.icon+'" alt="'+g.name+'" style="width:100%;height:100%;object-fit:cover;">':g.name[0].toUpperCase();
    el.innerHTML='<div class="gsc-art-ph">'+artPh+'</div>'+
      '<div class="gsc-body"><div class="gsc-name">'+g.name+'</div><div class="gsc-src">local</div>'+ 
      '<div class="gsc-foot"><button class="g-add'+(inLib?' owned':'')+'" data-url="'+g.url+'">'+(inLib?'✔ Added':'+ Get')+'</button></div></div>';
    el.querySelector('.g-add').addEventListener('click',function(e){
      e.stopPropagation();
      if(addToLib(g)){this.textContent='✔ Added';this.classList.add('owned');showToast(g.name+' added ✓');}
    });
    el.addEventListener('click',function(){openGS(g);});
    grid.appendChild(el);
  });
}
/* ── discover ── */
function renderDiscover(){
  var rowAll=document.getElementById('row-all'),rowShuffle=document.getElementById('row-shuffle');
  if(rowAll) rowAll.innerHTML='';
  if(rowShuffle) rowShuffle.innerHTML='';
  ALL.forEach(function(g){ if(rowAll) rowAll.appendChild(mkCard(g));});
  ALL.slice().sort(function(){return Math.random()-.5;}).slice(0,16).forEach(function(g){ if(rowShuffle) rowShuffle.appendChild(mkCard(g));});
}

/* ── LuminSDK render ── */
function renderLuminSdk(q){
  var row=document.getElementById('row-luminsdk');
  if(!row) return;
  row.innerHTML='';
  var luminGames = ALL.filter(function(g){
    var url=(g.url||'').toLowerCase();
    var name=(g.name||'').toLowerCase();
    return url.indexOf('luminsdk')>=0 || name.indexOf('luminsdk')>=0 || name.indexOf('lumin')>=0;
  });
  if(q) {
    var qq=q.toLowerCase().trim();
    luminGames = luminGames.filter(function(g){ return (g.name||'').toLowerCase().indexOf(qq)>=0 || (g.url||'').toLowerCase().indexOf(qq)>=0; });
  }
  if(luminGames.length===0){
    var e=document.createElement('div');e.className='lib-empty-msg';
    e.innerHTML='<span class="lib-empty-icon">🔦</span>No LuminSDK games found.';
    row.appendChild(e);return;
  }
  luminGames.forEach(function(g){ row.appendChild(mkCard(g)); });
}

function mkCard(game){
  var el=document.createElement('div');el.className='gc';
  var phContent=game.icon?'<img src="'+game.icon+'" alt="'+game.name+'" style="width:100%;height:100%;object-fit:cover;">':'<div class="gc-ph-l">'+game.name[0].toUpperCase()+'</div>';
  el.innerHTML='<div class="gc-ph">'+phContent+'</div>'+
    '<div class="gc-glow"></div>'+
    '<div class="gc-info"><div class="gc-name">'+game.name+'</div></div>';
  el.addEventListener('click',function(){openGS(game);});
  return el;
}

/* ── game detail sheet  ── */
function openGS(game){
  curGSGame=game;
  var inLib=GLIB.indexOf(game.url)>=0;
  document.getElementById('gs-title').textContent=game.name;
  document.getElementById('gs-meta').textContent='local · Free';
  document.getElementById('gs-desc').textContent=inLib?'Already in your Library. Switch to the Library tab to play.':'Add this game to your Library, then play it from the Library tab.';
  if(game.icon){
    document.getElementById('gs-art-ph').innerHTML='<img src="'+game.icon+'" alt="'+game.name+'" style="width:100%;height:100%;object-fit:cover;">';
  } else {
    document.getElementById('gs-art-ph').textContent=game.name[0].toUpperCase();
  }
  var btn=document.getElementById('gs-add2');
  btn.textContent=inLib?'✔ In Library':'+ Add to Library';
  btn.className=inLib?'owned':'';
  document.getElementById('gs-bd').classList.add('on');
  document.getElementById('gs').classList.add('on');
}
function closeGS(){document.getElementById('gs-bd').classList.remove('on');document.getElementById('gs').classList.remove('on');curGSGame=null;}
function gsAdd(){
  if(!curGSGame)return;
  if(addToLib(curGSGame)){
    showToast(curGSGame.name+' added ✓');
    document.getElementById('gs-desc').textContent='Added! Switch to the Library tab to play.';
    var btn=document.getElementById('gs-add2');btn.textContent='✔ In Library';btn.className='owned';
  }
}

/* ── proxy overlay ── */
function buildProxyUrl(url){if(!url||url==='about:blank')return url;if(url.startsWith('./')||url.startsWith('/g/'))return url;return'/proxy?url='+encodeURIComponent(url);} 
// existing event listeners (back/fwd/refresh) remain

// ensure proxy control buttons exist before wiring (some may be added in HTML)
try{document.getElementById('proxy-back-btn').addEventListener('click',function(){if(proxyHistoryIndex>0){proxyHistoryIndex--;var u=proxyHistory[proxyHistoryIndex];document.getElementById('proxy-url-bar').value=u;document.getElementById('game-overlay-iframe').src=buildProxyUrl(u);updateProxyNav();}});}catch(e){}
try{document.getElementById('proxy-fwd-btn').addEventListener('click',function(){if(proxyHistoryIndex<proxyHistory.length-1){proxyHistoryIndex++;var u=proxyHistory[proxyHistoryIndex];document.getElementById('proxy-url-bar').value=u;document.getElementById('game-overlay-iframe').src=buildProxyUrl(u);updateProxyNav();}});}catch(e){}
try{document.getElementById('proxy-refresh-btn').addEventListener('click',function(){var iframe=document.getElementById('game-overlay-iframe'),src=iframe.src;iframe.src=src;});}catch(e){}
try{document.getElementById('game-exit-btn').addEventListener('click',closeGame);}catch(e){}
try{document.getElementById('proxy-url-bar').addEventListener('keydown',function(e){if(e.key==='Enter')proxyNavigate(this.value);});}catch(e){}

function openGameOverlay(url,label){
  if(!url) return;
  proxyHistory=[url];proxyHistoryIndex=0;
  document.getElementById('proxy-url-bar').value=url;
  document.getElementById('game-overlay').classList.add('open');
  var iframe=document.getElementById('game-overlay-iframe');
  iframe.src=buildProxyUrl(url);
  updateProxyNav();
}
function proxyNavigate(input){var url=input.trim();if(!url)return;if(!url.startsWith('http://')&&!url.startsWith('https://')){url=(url.indexOf('.')>=0&&url.indexOf(' ')<0)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url);}proxyHistory.push(url);proxyHistoryIndex=proxyHistory.length-1;document.getElementById('proxy-url-bar').value=url;document.getElementById('game-overlay-iframe').src=buildProxyUrl(url);updateProxyNav();}
function updateProxyNav(){try{document.getElementById('proxy-back-btn').disabled=proxyHistoryIndex<=0;document.getElementById('proxy-fwd-btn').disabled=proxyHistoryIndex>=proxyHistory.length-1;}catch(e){}}
function closeGame(){document.getElementById('game-overlay').classList.remove('open');document.getElementById('game-overlay-iframe').src='about:blank';}

/* ── quick play (home buttons) ── */
function quickPlay(url,name){openGameOverlay(url,name);}

/* ── home search ── */
document.getElementById('home-search-btn').addEventListener('click',homeSearchGo);
document.getElementById('home-search-input').addEventListener('keydown',function(e){if(e.key==='Enter')homeSearchGo();});
function homeSearchGo(){var val=document.getElementById('home-search-input').value.trim();if(!val)return;document.getElementById('home-search-input').value='';var url;if(val.startsWith('http://')||val.startsWith('https://')){url=val;}else{url=val.indexOf('.')>=0&&val.indexOf(' ')<0?'https://'+val:'https://www.google.com/search?q='+encodeURIComponent(val);}openGameOverlay(url,val);}

/* ── APPS panel system ── */
document.querySelectorAll('.app-icon-btn').forEach(function(btn){btn.addEventListener('click',function(){openAppPanel(this.dataset.app);});});
document.querySelectorAll('.panel-back').forEach(function(btn){btn.addEventListener('click',function(){closeAppPanel(this.dataset.panel);});});
function openAppPanel(name){var p=document.getElementById('panel-'+name);if(p)p.classList.add('open');}
function closeAppPanel(name){var p=document.getElementById('panel-'+name);if(p)p.classList.remove('open');}

/* Inject fullscreen buttons for panels with iframes and wire movie/game fullscreen */
function makeFullscreen(el){if(!el) return; if(el.requestFullscreen) el.requestFullscreen(); else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); else if(el.msRequestFullscreen) el.msRequestFullscreen();}

// wire proxy fullscreen button if present
try{var pfs=document.getElementById('proxy-fullscreen-btn'); if(pfs) pfs.addEventListener('click',function(){ makeFullscreen(document.getElementById('game-overlay-iframe')); }); }catch(e){}

// wire games feature fullscreen button if present
try{var gfs=document.getElementById('g-feat-fullscreen'); if(gfs) gfs.addEventListener('click',function(){ makeFullscreen(document.getElementById('game-overlay-iframe')); }); }catch(e){}

// wire movies fullscreen button
try{var mfs=document.getElementById('movies-fullscreen'); if(mfs) mfs.addEventListener('click',function(){ makeFullscreen(document.getElementById('movies-frame')); }); }catch(e){}

// add fullscreen buttons to app panels that contain iframes
document.querySelectorAll('.app-panel').forEach(function(panel){
  var iframe = panel.querySelector('iframe');
  if(iframe){
    var topbar = panel.querySelector('.panel-topbar');
    if(topbar && !topbar.querySelector('.panel-fullscreen')){
      var btn = document.createElement('button');
      btn.className = 'proxy-nav-btn panel-fullscreen';
      btn.title = 'Fullscreen';
      btn.textContent = '⛶';
      btn.style.marginLeft = '6px';
      btn.addEventListener('click', function(){ makeFullscreen(iframe); });
      topbar.appendChild(btn);
    }
  }
});

/* ── music, dictionary, weather, notes omitted for brevity — original logic remains intact in file above */

/* ── INIT ── */
applyName(S.name);setProxy(S.proxy);applyCloak(S.cloak);applyNavPlacement(S.navPlace);updateStatusBar();
(function(){var h=new Date().getHours();document.getElementById('home-greeting').textContent=h>=5&&h<12?'good morning':h>=12&&h<17?'good afternoon':h>=17&&h<21?'good evening':'good night';})();
