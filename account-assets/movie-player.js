import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
export function movieSource(value){
 try{
  const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;
  const host=u.hostname.toLowerCase(),parts=u.pathname.split('/').filter(Boolean);let id;
  if(host==='youtu.be')id=parts[0];
  else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host))id=u.pathname==='/watch'?u.searchParams.get('v'):['embed','shorts','live'].includes(parts[0])?parts[1]:null;
  if(/^[\w-]{11}$/.test(id||''))return{kind:'iframe',provider:'YouTube',url:'https://www.youtube-nocookie.com/embed/'+id};
  if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)){
   id=host==='player.vimeo.com'&&parts[0]==='video'?parts[1]:parts[0];
   if(!/^\d+$/.test(id||''))return null;
   const hash=u.searchParams.get('h')||(host!=='player.vimeo.com'?parts[1]:null);
   if(hash&&!/^[a-zA-Z0-9]+$/.test(hash))return null;
   return{kind:'iframe',provider:'Vimeo',url:'https://player.vimeo.com/video/'+id+(hash?'?h='+hash:'')};
  }
  if(/\.(mp4|webm)$/i.test(u.pathname))return{kind:'video',provider:'Direct video',url:u.href};
  return null;
 }catch{return null;}
}
export function mountMovie(parent,source,title){
 const parsed=movieSource(source);if(!parsed)return false;
 const player=document.createElement(parsed.kind);player.src=parsed.url;player.title=title;player.style.cssText='width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000';
 if(parsed.kind==='iframe'){player.loading='lazy';player.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';player.allowFullscreen=true;player.referrerPolicy='strict-origin-when-cross-origin';}
 else{player.controls=true;player.playsInline=true;player.preload='metadata';player.addEventListener('error',()=>{const p=document.createElement('p');p.textContent='This video is unavailable. Its source link may have expired or require permission.';parent.append(p);},{once:true});}
 parent.append(player);return true;
}

