/* ══════════════════════════════════════
   CONFIG — update GNM_BASE with your repo
   ══════════════════════════════════════ */
var CORRECT_CODE = 'idontknowhowtocode';

var GNM_BASE = 'https://cdn.jsdelivr.net/gh/Lowelldf/13-game-assets@tree/main/Game-filess/';

var CLOAK_MAP = {none:{title:null,favicon:null},classroom:{title:'Stream - Google Classroom',favicon:'https://ssl.gstatic.com/classroom/favicon.png'},docs:{title:'Document - Google Docs',favicon:'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'},khan:{title:'Math | Khan Academy',favicon:'https://cdn.kastatic.org/images/favicon.ico'},duolingo:{title:'Duolingo',favicon:'https://d35aaqx5ub95lt.cloudfront.net/favicon.ico'},desmos:{title:'Desmos | Graphing Calculator',favicon:'https://www.desmos.com/assets/img/favicon.ico'}};
var S = {theme:'black',name:localStorage.getItem('s_name')||'mizumath copy',proxy:localStorage.getItem('s_proxy')||'uv',cloak:localStorage.getItem('s_cloak')||'none',navPlace:localStorage.getItem('s_navplace')||'bottom'};

var GNM_GAMES = [
  {id:179,name:'Slope'},{id:27,name:'1v1.LOL'},{id:34,name:'Minecraft Classic'},
  {id:45,name:'Cookie Clicker'},{id:12,name:'Run 3'},{id:88,name:'Retro Bowl'},
  {id:55,name:'Drift Boss'},{id:67,name:'Snake'},{id:23,name:'Paper.io 2'},
  {id:91,name:'2048'},{id:14,name:'Geometry Dash'},{id:38,name:'Krunker.io'},
  {id:72,name:'Bullet Force'},{id:19,name:'Eggy Car'},{id:103,name:'Drift Hunters'},
  {id:61,name:'Stickman Hook'},{id:44,name:'Shell Shockers'},{id:57,name:'Minesweeper'},
  {id:82,name:'Among Us'},{id:31,name:'Tetris'},{id:29,name:'Flappy Bird'},
  {id:16,name:'Doodle Jump'},{id:21,name:'Basketball Stars'},{id:50,name:'Rooftop Snipers'},
  {id:63,name:'Boxing Random'},{id:77,name:'Traffic Rider'},{id:9,name:'Smash Karts'},
  {id:18,name:'Vex 5'},{id:42,name:'Tank Trouble'},{id:66,name:'Bloons TD 5'}
];
var ALL = GNM_GAMES.map(function(g){return {name:g.name, url:GNM_BASE+g.id+'.html', id:g.id};});
var GLIB = JSON.parse(localStorage.getItem('gamelibv2')||'[]');
var selectedGame = null;
var proxyHistory = [], proxyHistoryIndex = -1;
var weatherLoaded = false, moviesLoaded = false, navHidden = false;
var curGSGame = null;

/* ── GATE ── */
(function(){if(localStorage.getItem('gate_passed')==='1'){document.getElementById('gate').style.display='none';if(!localStorage.getItem('gamertag'))setTimeout(openTagModal,300);}})();
document.getElementById('gate-btn').addEventListener('click',checkGate);
document.getElementById('gate-input').addEventListener('keydown',function(e){if(e.key==='Enter')checkGate();});
function checkGate(){var v=document.getElementById('gate-input').value.toLowerCase(),err=document.getElementById('gate-err');if(v===CORRECT_CODE){localStorage.setItem('gate_passed','1');var g=document.getElementById('gate');g.style.transition='opacity .4s';g.style.opacity='0';setTimeout(function(){g.style.display='none';},400);if(!localStorage.getItem('gamertag'))setTimeout(openTagModal,500);}else{err.textContent='Wrong code.';var i=document.getElementById('gate-input');i.value='';i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');setTimeout(function(){err.textContent='';},2000);}}

/* ── GAMERTAG ── */
document.getElementById('status-bar').addEventListener('click',openTagModal);
document.getElementById('tag-close-btn').addEventListener('click',closeTagModal);
document.getElementById('tag-save-btn').addEventListener('click',saveTag);
document.getElementById('tag-overlay').addEventListener('click',function(e){if(e.target===this)closeTagModal();});
function openTagModal(){var t=localStorage.getItem('gamertag')||'';document.getElementById('tag-input').value=t;document.getElementById('tag-err').textContent='';updateTagModalDisplay(t);document.getElementById('tag-overlay').classList.add('open');}
function closeTagModal(){document.getElementById('tag-overlay').classList.remove('open');}
function updateTagModalDisplay(t){document.getElementById('tag-name-display').textContent=t||'No tag set';document.getElementById('tag-avatar-big').textContent=t?t[0].toUpperCase():'?';}
function saveTag(){var v=document.getElementById('tag-input').value.trim(),err=document.getElementById('tag-err');if(!v){err.textContent='Enter a gamertag.';return;}if(v.length<2){err.textContent='Min 2 chars.';return;}if(!/^[a-zA-Z0-9_\-]+$/.test(v)){err.textContent='Letters, numbers, _ - only.';return;}localStorage.setItem('gamertag',v);updateStatusBar();updateTagModalDisplay(v);closeTagModal();showToast('Gamertag: '+v);}
function updateStatusBar(){var t=localStorage.getItem('gamertag')||'',u=document.getElementById('status-username-text'),a=document.getElementById('status-avatar-text');if(t){u.textContent=t;u.className='status-username';a.textContent=t[0].toUpperCase();}else{u.textContent='Guest';u.className='status-username guest';a.textContent='?';}}

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
function applyName(n){var l=n||'mizumath copy';document.getElementById('home-title-text').textContent=l;document.getElementById('nav-logo-text').textContent='13';if(S.cloak==='none')document.getElementById('page-title').textContent=l;document.querySelectorAll('.name-pill').forEach(function(b){b.classList.toggle('active',b.dataset.name===l);});document.getElementById('settings-version').textContent='v3.6  '+l;}
function pickName(n){S.name=n;localStorage.setItem('s_name',n);applyName(n);}
document.getElementById('place-bottom').addEventListener('click',function(){setNavPlacement('bottom');});
document.getElementById('place-left').addEventListener('click',function(){setNavPlacement('left');});
function applyNavPlacement(p){document.body.setAttribute('data-nav',p);document.getElementById('place-bottom').classList.toggle('active',p==='bottom');document.getElementById('place-left').classList.toggle('active',p==='left');}
function setNavPlacement(p){S.navPlace=p;localStorage.setItem('s_navplace',p);applyNavPlacement(p);showToast('Bar: '+p);}
document.querySelectorAll('.proxy-opt').forEach(function(o){o.addEventListener('click',function(){setProxy(this.id.replace('proxy-',''));});});
function setProxy(p){S.proxy=p;localStorage.setItem('s_proxy',p);document.querySelectorAll('.proxy-opt').forEach(function(o){o.classList.remove('active');});var el=document.getElementById('proxy-'+p);if(el)el.classList.add('active');}
document.querySelectorAll('.cloak-opt').forEach(function(o){o.addEventListener('click',function(){setCloak(this.dataset.cloak);});});
function applyCloak(c){var cfg=CLOAK_MAP[c]||CLOAK_MAP.none;document.getElementById('page-title').textContent=cfg.title||(S.name||'mizumath copy');var lk=document.querySelector("link[rel~='icon']");if(!lk){lk=document.createElement('link');lk.rel='icon';document.head.appendChild(lk);}lk.href=cfg.favicon||'/favicon.ico';document.querySelectorAll('.cloak-opt').forEach(function(el){el.classList.toggle('active',el.dataset.cloak===c);});}
function setCloak(c){S.cloak=c;localStorage.setItem('s_cloak',c);applyCloak(c);showToast(c==='none'?'Cloak off':'Tab cloaked!');}

/* ── TOAST ── */
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}

/* ── GREETING ── */
(function(){var h=new Date().getHours();document.getElementById('home-greeting').textContent=h>=5&&h<12?'good morning':h>=12&&h<17?'good afternoon':h>=17&&h<21?'good evening':'good night';})();

/* ── BG PARTICLES ── */
var bgC=document.getElementById('bg'),bgX=bgC.getContext('2d'),pts=[];
function seedParticles(){pts=[];for(var i=0;i<90;i++)pts.push({x:Math.random()*bgC.width,y:Math.random()*bgC.height,r:.3+Math.random()*1.3,dx:(Math.random()-.5)*.07,dy:(Math.random()-.5)*.07,o:.04+Math.random()*.2,hue:240+Math.random()*40-20});}
function resizeBg(){bgC.width=innerWidth;bgC.height=innerHeight;seedParticles();}
resizeBg();window.addEventListener('resize',resizeBg);

/* ── GAMES CANVAS BG ── */
var gCvs=document.getElementById('g-canvas'),gCtx=gCvs&&gCvs.getContext('2d'),gOrbs=[];
function initGBg(){if(!gCvs)return;gCvs.width=gCvs.offsetWidth||innerWidth;gCvs.height=gCvs.offsetHeight||innerHeight;gOrbs=[{ox:.12,oy:.18,r:.52,h:255,s:.0004,a:.17},{ox:.8,oy:.12,r:.42,h:305,s:.00028,a:.13},{ox:.48,oy:.72,r:.58,h:195,s:.00022,a:.11},{ox:.88,oy:.62,r:.36,h:162,s:.00042,a:.12},{ox:.08,oy:.82,r:.3,h:345,s:.00033,a:.09}];}
function drawGBg(t){if(!gCtx)return;var sec=document.getElementById('games-section');if(!sec||!sec.classList.contains('active'))return;var w=gCvs.width,h=gCvs.height;gCtx.fillStyle='#030110';gCtx.fillRect(0,0,w,h);gOrbs.forEach(function(o){var x=(o.ox+Math.sin(t*o.s*1.7+o.h)*.1)*w,y=(o.oy+Math.cos(t*o.s+o.h*.5)*.08)*h,r=o.r*Math.min(w,h),hue=(o.h+t*o.s*25)%360,g2=gCtx.createRadialGradient(x,y,0,x,y,r);g2.addColorStop(0,'hsla('+hue+',55%,40%,'+o.a+')');g2.addColorStop(.5,'hsla('+((hue+40)%360)+',45%,25%,'+(o.a*.35)+')');g2.addColorStop(1,'transparent');gCtx.beginPath();gCtx.arc(x,y,r,0,Math.PI*2);gCtx.fillStyle=g2;gCtx.fill();});}
initGBg();window.addEventListener('resize',initGBg);

/* ── MAIN LOOP ── */
function loop(t){bgX.clearRect(0,0,bgC.width,bgC.height);pts.forEach(function(p){bgX.beginPath();bgX.arc(p.x,p.y,p.r,0,6.28);bgX.fillStyle='hsla('+p.hue+',20%,80%,'+p.o+')';bgX.fill();p.x+=p.dx;p.y+=p.dy;if(p.x<0)p.x=bgC.width;if(p.x>bgC.width)p.x=0;if(p.y<0)p.y=bgC.height;if(p.y>bgC.height)p.y=0;});drawGBg(t);requestAnimationFrame(loop);} 
requestAnimationFrame(loop);

/* ══════════════════════════════════
   GAME LIBRARY — gn-math only
   ══════════════════════════════════ */

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
    item.innerHTML='<div class="lib-thumb">'+g.name[0].toUpperCase()+'</div>'+
      '<div><div class="lib-item-name">'+g.name+'</div><div class="lib-item-src">gn-math</div></div>';
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
  document.getElementById('g-feat-src').textContent='gn-math · Free';
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
    el.innerHTML='<div class="gsc-art-ph">'+g.name[0].toUpperCase()+'</div>'+
      '<div class="gsc-body"><div class="gsc-name">'+g.name+'</div><div class="gsc-src">gn-math</div>'+ 
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
  rowAll.innerHTML='';rowShuffle.innerHTML='';
  ALL.forEach(function(g){rowAll.appendChild(mkCard(g));});
  ALL.slice().sort(function(){return Math.random()-.5;}).slice(0,16).forEach(function(g){rowShuffle.appendChild(mkCard(g));});
}
function mkCard(game){
  var el=document.createElement('div');el.className='gc';
  el.innerHTML='<div class="gc-ph"><div class="gc-ph-l">'+game.name[0].toUpperCase()+'</div></div>'+
    '<div class="gc-glow"></div>'+
    '<div class="gc-info"><div class="gc-name">'+game.name+'</div></div>';
  el.addEventListener('click',function(){openGS(game);});
  return el;
}

/* ── game detail sheet (store only: add, no play) ── */
function openGS(game){
  curGSGame=game;
  var inLib=GLIB.indexOf(game.url)>=0;
  document.getElementById('gs-title').textContent=game.name;
  document.getElementById('gs-meta').textContent='gn-math · Free';
  document.getElementById('gs-desc').textContent=inLib?'Already in your Library. Switch to the Library tab to play.':'Add this game to your Library, then play it from the Library tab.';
  document.getElementById('gs-art-ph').textContent=game.name[0].toUpperCase();
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
function buildProxyUrl(url){if(!url||url==='about:blank')return url;if(url.startsWith('https://cdn.jsdelivr.net/'))return url;return'/proxy?url='+encodeURIComponent(url);}
document.getElementById('proxy-back-btn').addEventListener('click',function(){if(proxyHistoryIndex>0){proxyHistoryIndex--;var u=proxyHistory[proxyHistoryIndex];document.getElementById('proxy-url-bar').value=u;document.getElementById('game-overlay-iframe').src=buildProxyUrl(u);updateProxyNav();}});
document.getElementById('proxy-fwd-btn').addEventListener('click',function(){if(proxyHistoryIndex<proxyHistory.length-1){proxyHistoryIndex++;var u=proxyHistory[proxyHistoryIndex];document.getElementById('proxy-url-bar').value=u;document.getElementById('game-overlay-iframe').src=buildProxyUrl(u);updateProxyNav();}});
document.getElementById('proxy-refresh-btn').addEventListener('click',function(){var iframe=document.getElementById('game-overlay-iframe'),src=iframe.src;iframe.src='about:blank';setTimeout(function(){iframe.src=src;},50);});
document.getElementById('game-exit-btn').addEventListener('click',closeGame);
document.getElementById('proxy-url-bar').addEventListener('keydown',function(e){if(e.key==='Enter')proxyNavigate(this.value);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.getElementById('game-overlay').classList.contains('open'))closeGame();});
function openGameOverlay(url,label){if(!url)return;proxyHistory=[url];proxyHistoryIndex=0;document.getElementById('proxy-url-bar').value=url;document.getElementById('game-overlay').classList.add('open');document.getElementById('topnav').style.display='none';document.getElementById('status-bar').style.display='none';updateProxyNav();document.getElementById('game-overlay-iframe').src=buildProxyUrl(url);}
function proxyNavigate(input){var url=input.trim();if(!url)return;if(!url.startsWith('http://')&&!url.startsWith('https://')){url=(url.indexOf('.')>=0&&url.indexOf(' ')<0)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url);}document.getElementById('proxy-url-bar').value=url;proxyHistory=proxyHistory.slice(0,proxyHistoryIndex+1);proxyHistory.push(url);proxyHistoryIndex=proxyHistory.length-1;document.getElementById('game-overlay-iframe').src='/proxy?url='+encodeURIComponent(url);updateProxyNav();}
function updateProxyNav(){document.getElementById('proxy-back-btn').disabled=proxyHistoryIndex<=0;document.getElementById('proxy-fwd-btn').disabled=proxyHistoryIndex>=proxyHistory.length-1;}
function closeGame(){document.getElementById('game-overlay').classList.remove('open');document.getElementById('game-overlay-iframe').src='about:blank';if(!navHidden){document.getElementById('topnav').style.display='';document.getElementById('status-bar').style.display='flex';}proxyHistory=[];proxyHistoryIndex=-1;}

/* ── home search ── */
document.getElementById('home-search-btn').addEventListener('click',homeSearchGo);
document.getElementById('home-search-input').addEventListener('keydown',function(e){if(e.key==='Enter')homeSearchGo();});
function homeSearchGo(){var val=document.getElementById('home-search-input').value.trim();if(!val)return;document.getElementById('home-search-input').value='';var url;if(val.startsWith('http://')||val.startsWith('https://'))url=val;else if(val.indexOf('.')>=0&&val.indexOf(' ')<0)url='https://'+val;else url='https://www.google.com/search?q='+encodeURIComponent(val);openGameOverlay(url,url);}

/* ── APPS panel system ── */
document.querySelectorAll('.app-icon-btn').forEach(function(btn){btn.addEventListener('click',function(){openAppPanel(this.dataset.app);});});
document.querySelectorAll('.panel-back').forEach(function(btn){btn.addEventListener('click',function(){closeAppPanel(this.dataset.panel);});});
function openAppPanel(name){var p=document.getElementById('panel-'+name);if(p)p.classList.add('open');if(name==='weather'&&!weatherLoaded)loadWeather();}
function closeAppPanel(name){var p=document.getElementById('panel-'+name);if(p)p.classList.remove('open');}

/* ── music ── */
document.querySelectorAll('.music-opt').forEach(function(btn){btn.addEventListener('click',function(){document.getElementById('music-picker').style.display='none';document.getElementById('music-frame-wrap').style.display='flex';document.getElementById('music-frame').src=this.dataset.url;});});
document.getElementById('music-back-btn').addEventListener('click',function(){document.getElementById('music-frame').src='about:blank';document.getElementById('music-frame-wrap').style.display='none';document.getElementById('music-picker').style.display='flex';});

/* ── dictionary ── */
document.getElementById('dict-go').addEventListener('click',lookupWord);
document.getElementById('dict-input').addEventListener('keydown',function(e){if(e.key==='Enter')lookupWord();});
async function lookupWord(){var word=document.getElementById('dict-input').value.trim();if(!word)return;var out=document.getElementById('dict-result');out.innerHTML='<span style="color:var(--muted)">Looking up…</span>';try{var r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word));if(!r.ok)throw new Error();var data=await r.json();var entry=data[0];var html='<strong>'+entry.word+'</strong>';if(entry.phonetic)html+='<em>'+entry.phonetic+'</em>';entry.meanings.slice(0,3).forEach(function(m){html+='<div style="margin:6px 0 3px;font-size:.7rem;color:var(--accent);font-weight:700">'+m.partOfSpeech+'</div>';m.definitions.slice(0,3).forEach(function(d,i){html+='<div class="def">'+(i+1)+'. '+d.definition+'</div>';if(d.example)html+='<div style="color:var(--muted);font-size:.66rem;padding-left:10px">"'+d.example+'"</div>';});});out.innerHTML=html;}catch(e){out.innerHTML='<span style="color:var(--muted)">No definition found for "<strong style="color:var(--text)">'+word+'</strong>".</span>';}}

/* ── weather ── */
function loadWeather(){var wd=document.getElementById('weather-display');wd.innerHTML='<span style="color:var(--muted2)">Fetching weather…</span>';if(!navigator.geolocation){fetchWeatherByIP(wd);return;}navigator.geolocation.getCurrentPosition(function(pos){fetchWeather(pos.coords.latitude,pos.coords.longitude,wd);},function(){fetchWeatherByIP(wd);},{timeout:6000});}
async function fetchWeatherByIP(el){try{var ip=await fetch('https://ipapi.co/json/').then(function(r){return r.json();});if(ip.latitude){fetchWeather(ip.latitude,ip.longitude,el,ip.city);return;}}catch(e){}try{var ip2=await fetch('https://freeipapi.com/api/json').then(function(r){return r.json();});if(ip2.latitude){fetchWeather(ip2.latitude,ip2.longitude,el,ip2.cityName);return;}}catch(e){}el.innerHTML='<span style="color:var(--muted2)">Weather unavailable.</span>';}
async function fetchWeather(lat,lon,el,city){try{var r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current_weather=true&timezone=auto');var d=await r.json();var w=d.current_weather;var codes={0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',80:'Slight showers',81:'Moderate showers',82:'Violent showers',95:'Thunderstorm',99:'Thunderstorm hail'};var desc=codes[w.weathercode]||'Unknown',tempC=Math.round(w.temperature),tempF=Math.round(tempC*9/5+32),wind=Math.round(w.windspeed),loc=city||(lat.toFixed(1)+'°, '+lon.toFixed(1)+'°');el.innerHTML='<div class="weather-big">'+tempC+'°C <span style="font-size:.9rem;color:var(--muted);font-weight:400">'+tempF+'°F</span></div><div class="weather-desc">'+desc+'</div><div class="weather-meta">Wind: '+wind+' km/h · '+loc+'</div>';weatherLoaded=true;}catch(e){el.innerHTML='<span style="color:var(--muted2)">Weather unavailable.</span>';}}

/* ── notes ── */
var notesArea=document.getElementById('notes-area');notesArea.value=localStorage.getItem('notes')||'';notesArea.addEventListener('input',function(){localStorage.setItem('notes',notesArea.value);});

/* ── clock ── */
function updateClock(){var n=new Date(),t=n.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});document.getElementById('clock-time').textContent=t;document.getElementById('clock-date').textContent=n.toLocaleDateString([],{month:'numeric',day:'numeric',year:'2-digit'});document.getElementById('clock-popup-time').textContent=t;document.getElementById('clock-popup-date').textContent=n.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'});} 
updateClock();setInterval(updateClock,1000);

/* ── INIT ── */
applyName(S.name);setProxy(S.proxy);applyCloak(S.cloak);applyNavPlacement(S.navPlace);updateStatusBar();
(function(){var h=new Date().getHours();document.getElementById('home-greeting').textContent=h>=5&&h<12?'good morning':h>=12&&h<17?'good afternoon':h>=17&&h<21?'good evening':'good night';})();
renderStoreGrid('');
showNoGame();
