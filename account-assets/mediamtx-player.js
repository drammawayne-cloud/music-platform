import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
let library;
async function loadHls(){
 if(window.Hls)return window.Hls;
 if(!library)library=new Promise((ok,bad)=>{const s=document.createElement('script');s.src=apiOrigin+'/assets/hls-vendor.js?v=1.6.13';s.onload=()=>window.Hls?ok(window.Hls):bad(Error('Live player did not load.'));s.onerror=()=>bad(Error('Live player unavailable. Refresh to retry.'));document.head.append(s);}).catch(e=>{library=null;throw e;});
 return library;
}
export function safePlaybackUrl(value,base){const u=new URL(value,base);if(![new URL(base).origin,'https://console.richrowmusic.com'].includes(u.origin)||(u.search&&!(u.searchParams.size===1&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(u.searchParams.get('access')||'')))||u.hash||!/^\/api\/addon\/portal\/(?:public-hls|hls)\/[a-f0-9-]{36}\/index\.m3u8$/i.test(u.pathname))throw Error('Invalid playback address.');return u.href;}
export async function mountMediaPlayer(stage,{url,title,refresh,onPlaying=()=>{},onMessage=()=>{},onContinuation,documentImpl=document,base=location.href,HlsLoader=loadHls,now=()=>Date.now(),setIntervalImpl=setInterval,clearIntervalImpl=clearInterval}){
 let safe=safePlaybackUrl(url,base);const v=documentImpl.createElement('video');v.controls=true;v.playsInline=true;v.autoplay=false;v.preload='metadata';v.setAttribute('aria-label',title||'Live broadcast');v.style.width='100%';stage.replaceChildren(v);
 let hls,Hls,timer,dead=false,busy=false,recovering=false,wantsPlay=false,nextCheck=now()+45000,nativeRenew=now()+240000;
 function release(){hls?.destroy();hls=null;v.onerror=null;v.pause();v.removeAttribute('src');v.load();onPlaying(false);}
 function destroy(){if(dead)return;dead=true;clearIntervalImpl(timer);v.onplaying=v.onpause=v.onended=null;release();}
 function stop(text){destroy();onMessage(text);const p=documentImpl.createElement('p');p.textContent=text;stage.replaceChildren(p);}
 function retry(text){if(dead)return;recovering=true;release();nextCheck=0;onMessage(text||'Reconnecting to the live… Your access is saved.');}
 function attach(){
  v.onerror=()=>retry();
  if(!Hls){v.src=safe;v.load();nativeRenew=now()+240000;}
  else{hls=new Hls({enableWorker:false,maxBufferLength:15,xhrSetup(xhr,url){const u=new URL(url),current=new URL(safe);if(u.origin===current.origin&&u.pathname.startsWith(new URL('./',current).pathname)&&current.searchParams.has('access')){u.searchParams.set('access',current.searchParams.get('access'));xhr.open('GET',u.href,true);}}});hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)retry();});hls.loadSource(safe);hls.attachMedia(v);}
 }
 v.onplaying=()=>{wantsPlay=true;onPlaying(true);onMessage('');};v.onpause=()=>{if(!recovering)wantsPlay=false;onPlaying(false);};v.onended=()=>retry();
 async function check(){
  if(dead||busy||now()<nextCheck)return;busy=true;
  try{
   const s=await refresh();if(dead)return;
   if(s.locked){stop('Viewing access is required. Refresh to sign in or restore your pass.');return;}
   if(s.event?.open===false){stop('This live event has finished.');return;}
   if(s.continuation_id&&onContinuation&&/^[a-f0-9-]{36}$/i.test(s.continuation_id)){destroy();onContinuation(s.continuation_id);return;}
   if(s.state!=='live'){
    if(s.event?.open||s.state==='preparing'){retry('The artist is reconnecting. Your pass stays with this event.');return;}
    stop('This broadcast has ended.');return;
   }
   const refreshed=s.credentials?.provider==='mediamtx'?safePlaybackUrl(s.credentials.hlsUrl,base):null;if(!refreshed||new URL(refreshed).origin+new URL(refreshed).pathname!==new URL(safe).origin+new URL(safe).pathname){stop('Viewing access changed. Refresh to continue.');return;}
   if(refreshed!==safe){safe=refreshed;if(!Hls&&now()>=nativeRenew)recovering=true;}
   if(recovering){release();attach();recovering=false;if(wantsPlay||v.autoplay){wantsPlay=true;v.play()?.catch(()=>onMessage('Tap play to continue watching.'));}else onMessage('Connected. Tap play to watch.');}
   nextCheck=now()+45000;
  }catch{if(!dead){nextCheck=now()+5000;if(recovering)onMessage('Connection interrupted. Reconnecting safely…');}}
  finally{busy=false;}
 }
 try{
  if(new URL(safe).searchParams.has('access')||!v.canPlayType('application/vnd.apple.mpegurl')){try{Hls=await HlsLoader();if(!Hls.isSupported())Hls=null;}catch(e){if(!v.canPlayType('application/vnd.apple.mpegurl'))throw e;}if(!Hls&&!v.canPlayType('application/vnd.apple.mpegurl'))throw Error('This browser does not support live video.');}
  if(dead)return{destroy,video:v};attach();timer=setIntervalImpl(check,5000);return{destroy,video:v};
 }catch(e){destroy();throw e;}
}
