// Only recognized YouTube URLs can create an embedded player.
export function youtubeId(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;
 const host=u.hostname.toLowerCase();let id;
 if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
 else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
 if(u.pathname==='/watch')id=u.searchParams.get('v');else if(/^\/(embed|shorts|live)\//.test(u.pathname))id=u.pathname.split('/')[2];
 }return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null;}
}
export function mountYouTube(parent,id,title){
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id;
 frame.title=title+' — YouTube video';frame.loading='lazy';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';frame.style.cssText='width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000';parent.append(frame);
}
