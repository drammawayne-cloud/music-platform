// Existing music-platform shared entry; extends the current site without changing its pages.
import('./control-center-content.js?v=crate-gallery-20261004-2').catch(()=>console.warn('Rich Row content connection is unavailable.'));
// Add Distribution to the shared navigation without changing existing page files.
const richRowNav=document.querySelector('header nav');
if(richRowNav&&!richRowNav.querySelector('a[href="distribution.html"]')){
 const distributionLink=document.createElement('a');distributionLink.href=new URL('../distribution.html',document.currentScript?.src||new URL('assets/app.js',location.href)).href;distributionLink.textContent='Distribution';richRowNav.append(distributionLink);
}

const rrScriptBase=new URL('../',document.currentScript.src);
if(richRowNav&&!richRowNav.querySelector('a[href="radio.html"]')){const a=document.createElement('a');a.href=new URL('radio.html',rrScriptBase);a.textContent='Radio & Live';richRowNav.append(a);}

// Rich Row add-on public destinations (no private keys).
if(richRowNav){
 const destinations=[['My account','/account.html'],['Distribution','/addons/distribution/'],['Music Store','/addons/store/'],['Radio & Live',new URL('radio.html',rrScriptBase).href]];
 for(const [label,href] of destinations){let link=[...richRowNav.querySelectorAll('a')].find(a=>a.textContent.trim()===label);if(!link){link=document.createElement('a');link.textContent=label;richRowNav.append(link);}link.href=href;}
}

for(const a of document.querySelectorAll('a[href]')){if(a.href.startsWith('https://rich-row-control-center.onrender.com/'))a.href=a.href.replace('https://rich-row-control-center.onrender.com','https://console.richrowmusic.com');}

import('./music-embeds.js').catch(()=>console.warn('Music players unavailable.'));

import('./cart-counter.js').catch(()=>{});

if(richRowNav&&!richRowNav.querySelector('a[href="merch.html"]')){const merch=document.createElement("a");merch.href=new URL("merch.html",rrScriptBase).href;merch.textContent="Merch";const musicLink=[...richRowNav.querySelectorAll("a")].find(a=>a.textContent.trim()==="Music");if(musicLink)musicLink.after(merch);else richRowNav.append(merch);}

if(richRowNav&&!richRowNav.querySelector('a[data-merch-cart]')){const cart=document.createElement('a');cart.href='/addons/cart/';cart.textContent='Cart';cart.dataset.merchCart='true';richRowNav.append(cart);}

import('./activity-popups.js?v=2').catch(()=>{});

import('./customer-chat-widget.js?v=cream1').catch(()=>{});

import('./button-icons.js');

if(richRowNav&&!richRowNav.querySelector('a[href="movies.html"]')){const movies=document.createElement('a');movies.href=new URL('movies.html',rrScriptBase).href;movies.textContent='Movies';richRowNav.append(movies);}

for(const link of document.querySelectorAll('a[href]')){if(link.href==='/addons/radio/')link.href='https://richrowmusic.com/radio.html';}

// Homepage live takeover: it occupies no space while offline or unavailable.
(()=>{
 if(!['/','/index.html'].includes(location.pathname))return;
 const sites={'richrowmusic.com':'richrow','waynekastro.com':'waynekastro','dracodon17.com':'dracodon17','goldenrama440.com':'goldenrama440'};
 const site=sites[location.hostname.replace(/^www\./,'')];if(!site)return;
 const main=document.querySelector('main');if(!main)return;const sdkReady=new Promise(resolve=>{if(window.PlayerSdk)return resolve();const script=document.createElement('script');script.src=site==='richrow'?'/assets/api-video-player.js':'/api-video-player.js';script.onload=resolve;script.onerror=resolve;document.head.append(script);});
 const section=document.createElement('section');section.id='rr-home-live';section.hidden=true;section.setAttribute('aria-label','Live now');
 section.style.cssText='margin:32px 0;padding:24px;border:1px solid #b99a61;border-radius:20px;background:var(--panel,transparent)';
 (main.querySelector('.hero')||main.firstElementChild)?.after(section);
 let current='',players=[],timers=[];const clearPlayers=()=>{players.forEach(p=>p.destroy());players=[];timers.forEach(clearInterval);timers=[];};
 async function refresh(){if(document.hidden){section.hidden=true;return;}try{
  const response=await fetch('https://console.richrowmusic.com/api/addon/portal/live-now?site='+site,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const sessions=await response.json();if(!Array.isArray(sessions)||!sessions.length){section.hidden=true;clearPlayers();section.replaceChildren();current='';return;}
  const key=JSON.stringify(sessions.map(({player_url,...rest})=>({...rest,has_player:!!player_url})));if(key!==current){clearPlayers();section.replaceChildren();for(const live of sessions){const card=document.createElement('article'),badge=document.createElement('p'),title=document.createElement('h2'),description=document.createElement('p'),link=document.createElement('a');badge.textContent='● LIVE NOW · '+live.artist;badge.style.color='#b99a61';title.textContent=live.title;description.textContent=live.description||'';link.textContent='Watch, chat & support';link.href='/portal.html?site='+encodeURIComponent(live.site)+'&watch='+encodeURIComponent(live.id);link.className='btn';card.append(badge,title,description);if(live.player_url){const u=new URL(live.player_url);if(u.origin==='https://embed.api.video'){const frame=document.createElement('iframe');frame.src=u.href;frame.title=live.title;frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.style.cssText='display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px;margin:16px 0';card.append(frame);sdkReady.then(()=>{if(!frame.isConnected||!window.PlayerSdk)return;const p=new window.PlayerSdk(frame);players.push(p);let playing=false,session;p.addEventListener('play',()=>playing=true);p.addEventListener('pause',()=>playing=false);p.addEventListener('ended',()=>playing=false);p.addEventListener('error',()=>playing=false);timers.push(setInterval(async()=>{if(!playing||document.hidden)return;try{const response=await fetch('https://console.richrowmusic.com/api/addon/portal/heartbeat',{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({id:live.id,session})});const result=await response.json();if(response.ok)session=result.session;}catch{}},15000));});}}card.append(link);section.append(card);}current=key;}section.hidden=false;
 }catch{section.hidden=true;clearPlayers();section.replaceChildren();current='';}}
 refresh();setInterval(refresh,15000);document.addEventListener('visibilitychange',refresh);
})();

(()=>{const site=({'richrowmusic.com':'richrow','waynekastro.com':'waynekastro','dracodon17.com':'dracodon17','goldenrama440.com':'goldenrama440'})[location.hostname.replace(/^www\./,'')];if(!site)return;let visit;try{visit=sessionStorage.getItem('rr_stats_visit')||crypto.randomUUID();sessionStorage.setItem('rr_stats_visit',visit);}catch{visit=crypto.randomUUID();}const track=(kind,stream_id)=>fetch('https://console.richrowmusic.com/api/addon/portal/track',{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({site,kind,visit,stream_id:stream_id||null}),keepalive:true}).catch(()=>{});track('page_view');document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;try{const u=new URL(a.href);if(u.searchParams.has('watch')||/live\.html$/.test(u.pathname))track('live_click',u.searchParams.get('watch'));else if(/support\.html$/.test(u.pathname)||u.searchParams.get('support')==='open')track('donate_click');}catch{}});})();
