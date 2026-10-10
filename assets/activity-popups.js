// Real, anonymous purchase summaries plus clearly identified site promotions.
// No simulated customers, fabricated locations or invented transactions.
if(!location.pathname.includes('/admin'))startActivity();
function startActivity(){
 const key='rr-activity-seen-v1',mute='rr-activity-muted';let seen=new Set(),events=[],timer,stopped=false,promo=0,checks=0;
 try{if(sessionStorage.getItem(mute))return;seen=new Set(JSON.parse(sessionStorage.getItem(key)||'[]'));}catch{}
 const onConsole=location.hostname==='console.richrowmusic.com';
 const base='https://richrowmusic.com/';
 const promos=[['Shop Rich Row merch','Explore the collection',base+'merch.html'],['Discover Rich Row music','Explore the music',base+'music.html'],['Create with Rich Row','Explore studio services',base+'services.html']];
 const box=document.createElement('aside');box.setAttribute('aria-label','Rich Row updates');box.hidden=true;
 box.style.cssText='position:fixed;bottom:22px;left:18px;z-index:900;width:min(330px,calc(100vw - 36px));box-sizing:border-box;padding:16px 48px 16px 18px;border:1px solid var(--line,#d4c5ad);border-radius:6px;background:var(--surface,#fffaf0);box-shadow:0 16px 50px #0003;color:var(--text,#221d18);font:15px/1.45 system-ui,sans-serif;backdrop-filter:blur(18px)';
 const badge=document.createElement('div'),label=document.createElement('div'),link=document.createElement('a'),close=document.createElement('button');
 badge.style.cssText='font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--accent,#765128);margin-bottom:6px';label.style.fontWeight='600';link.style.cssText='display:inline-block;color:var(--accent,#765128);font-size:13px;margin-top:8px;text-underline-offset:3px';close.textContent='×';close.setAttribute('aria-label','Hide updates for this visit');close.style.cssText='position:absolute;right:8px;top:8px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--text,#221d18);font:24px system-ui;cursor:pointer';
 close.onclick=()=>{stopped=true;clearTimeout(timer);box.remove();try{sessionStorage.setItem(mute,'1')}catch{}};box.append(badge,label,link,close);document.body.append(box);
 async function refresh(){try{const r=await fetch('https://console.richrowmusic.com/api/addon/activity',{credentials:'omit',signal:AbortSignal.timeout(8000)});if(!r.ok)return;const data=await r.json();events=Array.isArray(data)?data.filter(e=>/^[a-f0-9]{24}$/.test(e.id)&&['merch','music'].includes(e.category)&&!seen.has(e.id)):[];}catch{}}
 async function show(){if(stopped)return;if(document.hidden){timer=setTimeout(show,15000);return}if(checks++%3===0)await refresh();if(stopped)return;
 const event=events.shift();if(event){badge.textContent='Recent purchase';label.textContent=event.category==='merch'?'A customer purchased Rich Row merchandise.':'A customer purchased music from Rich Row.';link.textContent='Explore '+(event.category==='merch'?'merchandise':'music');link.href=event.category==='merch'?base+'merch.html':(onConsole?'/addons/store':'/addons/store/');seen.add(event.id);try{sessionStorage.setItem(key,JSON.stringify([...seen].slice(-200)))}catch{}}
 else{const p=promos[promo++%promos.length];badge.textContent='Discover Rich Row';label.textContent=p[0];link.textContent=p[1];link.href=p[2];}
 box.hidden=false;
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)box.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
 timer=setTimeout(()=>{if(box.contains(document.activeElement)||box.matches(':hover')){timer=setTimeout(hide,4000)}else hide()},8500);
 }
 function hide(){if(stopped)return;if(box.contains(document.activeElement)||box.matches(':hover')){timer=setTimeout(hide,4000);return}box.hidden=true;timer=setTimeout(show,45000)}
 timer=setTimeout(show,12000);
}
