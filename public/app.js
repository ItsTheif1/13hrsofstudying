/* ══════════════════════════════════════
   SOUR v1.0 - App Controller
   ══════════════════════════════════════ */

var CORRECT_CODE = 'idontknowhowtocode';
var GLIB = JSON.parse(localStorage.getItem('gamelibv2')||'[]');
var ALL = [];
var proxyHistory = [], proxyHistoryIndex = -1;
var selectedSearchSource = 'local';

/* ── UPDATE GREETING ── */
function updateGreeting(){
  var h=new Date().getHours();
  var greeting=h>=5&&h<12?'good morning':h>=12&&h<17?'good afternoon':h>=17&&h<21?'good evening':'good night';
  document.getElementById('greeting').textContent=greeting;
}

/* ── UPDATE USER TAG ── */
function updateUserTag(){
  var tag=localStorage.getItem('gamertag')||'Guest';
  document.getElementById('user-tag').textContent=tag;
  document.getElementById('gamertag-input').value=tag;
}

/* ── SAVE GAMERTAG ── */
function saveGamertag(){
  var tag=document.getElementById('gamertag-input').value.trim();
  if(!tag){alert('Enter a gamertag');return;}
  if(tag.length<2){alert('Gamertag too short');return;}
  localStorage.setItem('gamertag',tag);
  updateUserTag();
  alert('Gamertag saved!');
}

/* ── BACKGROUND MANAGEMENT ── */
function setCustomBg(){
  var url=document.getElementById('bg-url-input').value.trim();
  if(!url){alert('Enter a URL');return;}
  document.getElementById('bg-container').style.backgroundImage='url('+url+')';
  localStorage.setItem('bg-url',url);
}

function resetBg(){
  document.getElementById('bg-container').style.backgroundImage='';
  localStorage.removeItem('bg-url');
  document.getElementById('bg-url-input').value='';
}

function loadSavedBg(){
  var url=localStorage.getItem('bg-url');
  if(url){
    document.getElementById('bg-container').style.backgroundImage='url('+url+')';
    document.getElementById('bg-url-input').value=url;
  }
}

/* ── THEME MANAGEMENT ── */
function changeTheme(){
  var theme=document.getElementById('theme-select').value;
  var colors={
    green:{primary:'#00ff00'},
    blue:{primary:'#00aaff'},
    pink:{primary:'#ff00ff'},
    yellow:{primary:'#ffff00'}
  };
  var c=colors[theme]||colors.green;
  document.documentElement.style.setProperty('--primary',c.primary);
  localStorage.setItem('theme',theme);
}

function loadSavedTheme(){
  var theme=localStorage.getItem('theme')||'green';
  document.getElementById('theme-select').value=theme;
  changeTheme();
}

/* ── SECTION NAVIGATION ── */
function showSection(sectionId){
  document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
  document.getElementById(sectionId+'-section').classList.add('active');
  
  document.querySelectorAll('.topbar-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelector('[data-section="'+sectionId+'"]').classList.add('active');
}

/* ── TOP BAR TAB NAVIGATION ── */
document.querySelectorAll('.topbar-tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    showSection(this.dataset.section);
  });
});

/* ── LOAD GAMES FROM g.json ── */
(function(){
  fetch('./g.json')
    .then(function(r){return r.json();})
    .then(function(data){
      ALL=(data.games||[]).map(function(g){
        return {name:g.name,filepath:g.filepath,icon:g.icon||g['icon.png'],url:g.filepath};
      });
      renderGames();
    })
    .catch(function(e){console.error('Failed to load g.json:',e);});
})();

/* ── RENDER GAMES LIBRARY ── */
function renderGames(){
  var grid=document.getElementById('game-grid');
  grid.innerHTML='';
  
  var games=GLIB.map(function(url){
    return ALL.find(function(g){return g.url===url;})||{name:url,url:url};
  });
  
  if(games.length===0){
    grid.innerHTML='<p style="color:var(--text-muted);padding:20px;">Your library is empty. Add games in settings.</p>';
    return;
  }
  
  games.forEach(function(g){
    var card=document.createElement('div');
    card.className='game-card';
    card.innerHTML='<div class="game-icon">'+(g.icon?'<img src="'+g.icon+'" style="width:100%;height:auto;border-radius:4px;">':'🎮')+'</div>'+
      '<div class="game-name">'+g.name+'</div>';
    card.addEventListener('click',function(){openGame(g.url,g.name);});
    grid.appendChild(card);
  });
}

/* ── SEARCH MODAL ── */
document.getElementById('topbar-search').addEventListener('focus',function(){
  document.getElementById('search-modal').classList.add('show');
});

document.addEventListener('click',function(e){
  if(!e.target.closest('.search-box')&&!e.target.closest('.search-modal')){
    document.getElementById('search-modal').classList.remove('show');
  }
});

document.querySelectorAll('.search-option').forEach(function(opt){
  opt.addEventListener('click',function(){
    selectedSearchSource=this.dataset.source;
    var q=document.getElementById('topbar-search').value.trim();
    if(selectedSearchSource==='luminsdk'){
      loadLuminSDK(q);
      showSection('games');
    } else {
      searchLocalGames(q);
      showSection('games');
    }
    document.getElementById('search-modal').classList.remove('show');
  });
});

/* ── SEARCH LOCAL GAMES ── */
function searchLocalGames(q){
  var grid=document.getElementById('game-grid');
  grid.innerHTML='';
  var games=ALL;
  if(q){
    games=games.filter(function(g){return g.name.toLowerCase().indexOf(q.toLowerCase())>=0;});
  }
  if(games.length===0){
    grid.innerHTML='<p style="color:var(--text-muted);">No games found.</p>';
    return;
  }
  games.forEach(function(g){
    var card=document.createElement('div');
    card.className='game-card';
    card.innerHTML='<div class="game-icon">'+(g.icon?'<img src="'+g.icon+'" style="width:100%;height:auto;border-radius:4px;">':'🎮')+'</div>'+
      '<div class="game-name">'+g.name+'</div>';
    card.addEventListener('click',function(){addToLibrary(g);});
    grid.appendChild(card);
  });
}

/* ── LUMINSDK LOADER ── */
function loadLuminSDK(q){
  var grid=document.getElementById('game-grid');
  grid.innerHTML='<p style="color:var(--primary);padding:20px;">Loading LuminSDK...</p>';
  
  var script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js';
  script.onload=function(){
    grid.innerHTML='';
    if(window.Lumin){
      Lumin.init({
        container:'#game-grid',
        theme:'dark'
      });
    } else {
      grid.innerHTML='<p style="color:var(--text-muted);">Failed to load LuminSDK</p>';
    }
  };
  document.head.appendChild(script);
}

/* ── ADD TO LIBRARY ── */
function addToLibrary(game){
  if(GLIB.indexOf(game.url)<0){
    GLIB.push(game.url);
    localStorage.setItem('gamelibv2',JSON.stringify(GLIB));
    alert(game.name+' added to library!');
    renderGames();
  }
}

/* ── OPEN GAME IN PROXY ── */
function openGame(url,name){
  proxyHistory=[url];
  proxyHistoryIndex=0;
  document.getElementById('proxy-url-bar').value=url;
  document.getElementById('game-frame').src='/proxy?url='+encodeURIComponent(url);
  showSection('proxy');
  updateProxyNav();
}

/* ── PROXY NAVIGATION ── */
document.getElementById('proxy-back-btn').addEventListener('click',function(){
  if(proxyHistoryIndex>0){
    proxyHistoryIndex--;
    var url=proxyHistory[proxyHistoryIndex];
    document.getElementById('game-frame').src='/proxy?url='+encodeURIComponent(url);
    document.getElementById('proxy-url-bar').value=url;
    updateProxyNav();
  }
});

document.getElementById('proxy-fwd-btn').addEventListener('click',function(){
  if(proxyHistoryIndex<proxyHistory.length-1){
    proxyHistoryIndex++;
    var url=proxyHistory[proxyHistoryIndex];
    document.getElementById('game-frame').src='/proxy?url='+encodeURIComponent(url);
    document.getElementById('proxy-url-bar').value=url;
    updateProxyNav();
  }
});

document.getElementById('proxy-refresh-btn').addEventListener('click',function(){
  var iframe=document.getElementById('game-frame');
  var src=iframe.src;
  iframe.src=src;
});

document.getElementById('proxy-close-btn').addEventListener('click',function(){
  showSection('games');
});

document.getElementById('proxy-url-bar').addEventListener('keydown',function(e){
  if(e.key==='Enter'){
    var url=this.value.trim();
    if(!url)return;
    if(!url.startsWith('http://')&&!url.startsWith('https://')){
      url=(url.indexOf('.')>=0&&url.indexOf(' ')<0)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url);
    }
    proxyHistory.push(url);
    proxyHistoryIndex=proxyHistory.length-1;
    document.getElementById('game-frame').src='/proxy?url='+encodeURIComponent(url);
    updateProxyNav();
  }
});

function updateProxyNav(){
  document.getElementById('proxy-back-btn').disabled=proxyHistoryIndex<=0;
  document.getElementById('proxy-fwd-btn').disabled=proxyHistoryIndex>=proxyHistory.length-1;
}

/* ── INIT ── */
updateGreeting();
updateUserTag();
loadSavedBg();
loadSavedTheme();
renderGames();

setInterval(updateGreeting,60000);
