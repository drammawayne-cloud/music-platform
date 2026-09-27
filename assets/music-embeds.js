// Official provider players. Playback and reporting are controlled by each provider.
export function embedFor(value){
 let u;try{u=new URL(value);}catch{return null;}if(u.protocol!=='https:'||u.username||u.password)return null;
 if(u.hostname==='open.spotify.com'){const m=u.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([A-Za-z0-9]{22})\/?$/);if(m)return {src:'https://open.spotify.com/embed/'+m[1]+'/'+m[2],title:'Spotify player',height:m[1]==='track'?152:352};}
 if(['music.apple.com','embed.music.apple.com','itunes.apple.com'].includes(u.hostname)&&/^\/[a-z]{2}\/(album|song|playlist)\//.test(u.pathname)){u.hostname='embed.music.apple.com';return {src:u.origin+u.pathname+(u.searchParams.has('i')?'?i='+encodeURIComponent(u.searchParams.get('i')):''),title:'Apple Music player',height:u.searchParams.has('i')||u.pathname.includes('/song/')?175:450};}
 return null;
}
export function enhanceMusicLinks(root=document){
 for(const a of root.querySelectorAll('a[href]')){if(a.dataset.rrPlayer)continue;const info=embedFor(a.href);if(!info)continue;a.dataset.rrPlayer='1';const box=document.createElement('div');box.className='rr-provider-player';box.style.cssText='width:100%;margin:14px 0';const frame=document.createElement('iframe');frame.src=info.src;frame.title=info.title;frame.height=String(info.height);frame.style.cssText='width:100%;border:0;border-radius:12px';frame.loading='lazy';frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;box.append(frame);a.after(box);}
}
if(typeof document!=='undefined'){enhanceMusicLinks();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;enhanceMusicLinks();});}).observe(document.body,{childList:true,subtree:true});}
