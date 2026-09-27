const cleanURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const cleanups=new WeakMap();
export function mountHighlights(parent,records){
 cleanups.get(parent)?.();parent.querySelector('.catalog-highlights')?.remove();
 const items=records.filter(r=>r.highlight&&(!r.highlight_until||Date.parse(r.highlight_until)>Date.now())&&(cleanURL(r.cover_url)||cleanURL(r.video_url)));
 if(!items.length)return;
 const section=document.createElement('section');section.className='catalog-highlights';section.style.cssText='margin:24px 0;padding:20px;border:1px solid #555;border-radius:16px';section.setAttribute('aria-label','Release highlights');
 const heading=document.createElement('h2');heading.textContent='Highlights';
 const stage=document.createElement('div');stage.style.cssText='max-width:620px;margin:16px auto;text-align:center';
 const bar=document.createElement('div');bar.style.cssText='display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap';
 const count=document.createElement('span');count.setAttribute('aria-live','off');
 let index=0,timer=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,video=null;
 const clear=()=>{clearTimeout(timer);timer=null;};
 const later=()=>{clear();if(playing&&!document.hidden&&!video)timer=setTimeout(()=>draw(index+1),6000);};
 const button=(text,run)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=run;bar.append(b);return b;};
 button('Previous',()=>draw(index-1));const pause=button(playing?'Pause':'Play',()=>{playing=!playing;pause.textContent=playing?'Pause':'Play';if(video){if(playing)video.play().catch(()=>{playing=false;pause.textContent='Play';});else video.pause();}else later();});button('Next',()=>draw(index+1));bar.append(count);
 function draw(next){clear();video?.pause();video=null;index=(next+items.length)%items.length;const r=items[index];stage.replaceChildren();const url=cleanURL(r.video_url)||cleanURL(r.cover_url);const media=document.createElement(cleanURL(r.video_url)?'video':'img');media.src=url;media.style.cssText='width:100%;max-height:65vh;object-fit:contain;border-radius:12px;background:#111';if(media.tagName==='VIDEO'){video=media;media.controls=true;media.playsInline=true;media.muted=true;media.onended=()=>{if(playing)draw(index+1);};if(playing&&!document.hidden)media.play().catch(()=>{playing=false;pause.textContent='Play';});}else{media.alt=r.title+' cover art';later();}const title=document.createElement('h3');title.textContent=r.title;const artist=document.createElement('p');artist.textContent=r.artist||'';stage.append(media,title,artist);if(cleanURL(r.link)){const link=document.createElement('a');link.href=cleanURL(r.link);link.textContent='Listen to this release →';link.target='_blank';link.rel='noopener noreferrer';stage.append(link);}count.textContent=(index+1)+' of '+items.length;}
 const visibility=()=>{if(document.hidden){clear();video?.pause();}else if(playing){if(video)video.play().catch(()=>{playing=false;pause.textContent='Play';});else later();}};
 document.addEventListener('visibilitychange',visibility);cleanups.set(parent,()=>{clear();video?.pause();document.removeEventListener('visibilitychange',visibility);});
 section.append(heading,stage,bar);parent.prepend(section);draw(0);
}
