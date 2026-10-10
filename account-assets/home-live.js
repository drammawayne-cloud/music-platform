(()=>{
 const script=document.currentScript,site=script?.dataset.site,origin='https://console.richrowmusic.com';
 if(!['richrow','waynekastro','dracodon17','goldenrama440'].includes(site))return;
 let current='',busy=false;
 function hide(){document.getElementById('rr-live-now')?.remove();current='';}
 async function refresh(){if(busy)return;busy=true;try{
  const response=await fetch(origin+'/api/addon/portal/live-now?site='+site,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();
  const rows=await response.json(),live=Array.isArray(rows)?rows[0]:null;if(!live?.id){hide();return;}if(current===live.id&&document.getElementById('rr-live-now'))return;
  hide();const section=document.createElement('section');section.id='rr-live-now';section.setAttribute('aria-label','Live broadcast');section.style.cssText='display:block;width:min(1100px,calc(100% - 32px));margin:20px auto;padding:0;overflow:hidden;border-radius:18px;background:#0b0b10;color:#fff;box-shadow:0 10px 32px #0003;position:relative;z-index:5';
  const heading=document.createElement('div');heading.style.cssText='display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 18px;font:600 16px system-ui;color:#fff';
  const badge=document.createElement('span');badge.textContent='● LIVE';badge.style.cssText='background:#fe2c55;padding:5px 9px;border-radius:6px;color:white;font:bold 12px system-ui';
  const title=document.createElement('span');title.textContent=(live.artist?live.artist+' · ':'')+(live.title||'Watch live');heading.append(badge,title);section.append(heading);
  const watch=new URL('/live.html',location.origin);watch.searchParams.set('site',live.site);watch.searchParams.set('watch',live.id);
  if(!live.paywall?.enabled){const frame=document.createElement('iframe'),url=new URL('/addons/live-player/',location.origin);url.searchParams.set('id',live.id);url.searchParams.set('site',live.site);frame.src=url.href;frame.title='Live video — '+(live.artist||site);frame.allow='autoplay; fullscreen; picture-in-picture';frame.referrerPolicy='no-referrer';frame.allowFullscreen=true;frame.style.cssText='display:block;width:100%;aspect-ratio:16/9;border:0;background:#000';section.append(frame);}
  const link=document.createElement('a');link.href=live.watch_url||watch.href;link.textContent=live.paywall?.enabled?'Open live access':'Join the live · chat & guests';link.style.cssText='display:block;padding:14px 18px;color:#fff;font:600 15px system-ui;text-decoration:underline';section.append(link);
  const share=document.createElement('a'),shareUrl=new URL(live.watch_url||watch);shareUrl.searchParams.set('share','1');share.href=shareUrl.href;share.target='_blank';share.rel='noopener noreferrer';share.textContent='Share live';share.style.cssText='display:inline-block;margin:0 18px 16px;padding:11px 18px;border:1px solid #ffffff55;border-radius:999px;background:#24242c;color:#fff;font:600 14px system-ui;text-decoration:none';section.append(share);
  const main=document.querySelector('main');if(main)main.prepend(section);else document.body.insertBefore(section,document.querySelector('header')?.nextSibling||document.body.firstChild);current=live.id;
 }catch{hide();}finally{busy=false;}}
 refresh();setInterval(refresh,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
