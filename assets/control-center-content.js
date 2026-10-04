import {mountCrateGallery} from './crate-gallery.js?v=20261004-2';
import {mountMovie} from './movie-player.js';
import {youtubeId, mountYouTube} from './video-embeds.js';
import {mountHighlights} from './catalog-highlights.js';
import './audio-player.js';
import {config} from './control-center-config.js';
const mapping={'music.html':'music','remixes.html':'remixes','crates.html':'dj-crates','juggling.html':'unorthodox-juggling','beats.html':'beats','releases.html':'releases','radio.html':'radio','videos.html':'videos','movies.html':'movies','services.html':'services','graphic-design.html':'graphic-design'};
const profileArtists={'artist-waynekastro.html':'Wayne Kastro','artist-dracodon17.html':'Draco Don17','artist-goldenrama440.html':'Golden Rama'};
const profileArtist=profileArtists[location.pathname.split('/').pop()];
const category=profileArtist?'music':mapping[location.pathname.split('/').pop()];
// Start with Wayne, then rotate the rest of the roster between Wayne selections.
function featuredRosterOrder(records){
 const wayne=records.filter(r=>r.artist==='Wayne Kastro');
 const artists=new Map();
 for(const r of records)if(r.artist!=='Wayne Kastro'){const name=r.artist||'More music';if(!artists.has(name))artists.set(name,[]);artists.get(name).push(r);}
 const guests=[];while([...artists.values()].some(q=>q.length)){for(const q of artists.values())if(q.length)guests.push(q.shift());}
 const result=wayne.splice(0,12);
 // Spread remaining Wayne tracks evenly through the entire mixed roster.
 while(guests.length){const count=Math.ceil(wayne.length/guests.length);result.push(guests.shift(),...wayne.splice(0,count));}
 return result.concat(wayne);
}
const categories=location.pathname.split('/').pop()==='team.html'?['dj-crates','unorthodox-juggling','remixes']:[category];
for(const category of categories)if(category&&config.supabaseUrl&&config.publishableKey){
 const section=document.createElement('section');section.id='rich-row-published-'+category;
 const heading=document.createElement('h2');heading.textContent=(location.pathname.endsWith('team.html')?'':'Latest ')+({'dj-crates':'DJ Crates','unorthodox-juggling':'Unorthodox Juggling','graphic-design':'Graphic Design'}[category]||category);
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Loading the latest from Rich Row…';
 section.append(heading,status);document.querySelector('main')?.append(section);
 async function load(){
  try{
   const base=new URL(config.supabaseUrl);if(base.protocol!=='https:')throw Error('HTTPS required');
   const params=new URLSearchParams({website_id:'eq.'+config.websiteId,category:'eq.'+category,status:'eq.published',select:'id,title,description,link,artist,genre,display_order,cover_url,video_url,highlight,highlight_until',order:'display_order.asc,created_at.desc,id.asc',limit:'200'});
   const response=await fetch(base.origin+'/rest/v1/rr_content?'+params,{headers:{apikey:config.publishableKey},cache:'no-store'});
   if(!response.ok)throw Error('Content unavailable');const records=await response.json();
   if(!Array.isArray(records))throw Error('Invalid response');
   if(category==='music'&&!profileArtist)records.splice(0,records.length,...featuredRosterOrder(records));
   if(profileArtist)records.splice(0,records.length,...records.filter(r=>r.artist===profileArtist));
   if(['movies','dj-crates','unorthodox-juggling','remixes'].includes(category)){let page=records;while(page.length===200){params.set('offset',String(records.length));const more=await fetch(base.origin+'/rest/v1/rr_content?'+params,{headers:{apikey:config.publishableKey},cache:'no-store'});if(!more.ok)throw Error('Movies unavailable');page=await more.json();if(!Array.isArray(page))throw Error('Invalid movies');records.push(...page);}}
   section.querySelector('.catalog-groups')?.remove();section.querySelector('.catalog-filter')?.remove();mountHighlights(section,records);
   if(!records.length){status.textContent=category==='movies'?'Our films and stories will appear here when published.':'New releases and updates are coming soon.';return;}
   status.textContent=records.length+' releases';const groups=document.createElement('div');groups.className='catalog-groups';const genreGrids=new Map();
   for(const record of records){
    const genre=category==='music'&&profileArtist?profileArtist:'';
    if(!genreGrids.has(genre)){const group=document.createElement('section');if(genre){const label=document.createElement('h3');label.textContent=genre;group.append(label);}const grid=document.createElement('div');grid.className='grid';if(['videos','movies'].includes(category))grid.style.gridTemplateColumns='repeat(auto-fit,minmax(min(100%,420px),1fr))';group.append(grid);groups.append(group);genreGrids.set(genre,grid);}
    const grid=genreGrids.get(genre);
    const card=document.createElement('article');card.className='card';card.dataset.artist=record.artist||'More music';
    const movie=category==='movies'&&mountMovie(card,record.link,record.title);
    const watch=youtubeId(record.video_url);
    const yt=category==='videos'?(watch||youtubeId(record.link)):null;
    if(yt)mountYouTube(card,yt,record.title);
    for(const [key,tag] of [['cover_url','img'],['video_url','video']]){if((key==='video_url'&&watch)||movie||!record[key]||(yt&&(key==='cover_url'||youtubeId(record[key]))))continue;try{const u=new URL(record[key]);if(u.protocol!=='https:'||u.username||u.password)continue;const media=document.createElement(tag);media.src=u.href;media.style.cssText='width:100%;border-radius:12px;'+(tag==='img'?'aspect-ratio:1;object-fit:cover;':'');if(tag==='img'){media.alt=record.title+' cover art';media.loading='lazy';}else{media.controls=true;media.playsInline=true;media.preload='none';}card.append(media);}catch{}}
    const title=document.createElement('h3');title.textContent=record.title;
    const description=document.createElement('p');description.textContent=record.description;description.style.whiteSpace='pre-wrap';
    const artist=document.createElement('p');artist.textContent=record.artist||'';card.append(title,artist,description);
    if(category==='dj-crates'&&!record.link){const availability=document.createElement('p');availability.textContent='Downloads coming soon';card.append(availability);}
    if(category!=='dj-crates'&&!record.link&&['music','remixes','beats','releases','dj-crates','unorthodox-juggling','radio'].includes(category)){
     const play=document.createElement('button');play.textContent='Listen to full song';
     const audioStatus=document.createElement('p');audioStatus.setAttribute('role','status');
     card.append(play,audioStatus);
     play.onclick=async()=>{
      play.disabled=true;audioStatus.textContent='Loading audio…';
      try{
       const query=new URLSearchParams({content_id:'eq.'+record.id,select:'object_path'});
       const metadata=await fetch(base.origin+'/rest/v1/rr_audio_assets?'+query,{headers:{apikey:config.publishableKey},cache:'no-store'});
       if(!metadata.ok)throw Error();const assets=await metadata.json();
       if(!assets[0]){audioStatus.textContent='Audio is not available for this track yet.';return;}
       const signed=await fetch(base.origin+'/storage/v1/object/sign/rr-audio-private/'+assets[0].object_path.split('/').map(encodeURIComponent).join('/'),{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})});
       if(!signed.ok)throw Error();const data=await signed.json();
       if(!data.signedURL)throw Error();
       const audioUrl=new URL(data.signedURL.startsWith('/storage/v1/')?data.signedURL:'/storage/v1/'+data.signedURL.replace(/^\//,''),base);
       if(audioUrl.origin!==base.origin)throw Error();
       const player=document.createElement('rr-audio-player');player.setAttribute('track-title',record.title);player.setAttribute('src',audioUrl.href);
       card.querySelector('rr-audio-player')?.remove();card.append(player);audioStatus.textContent='Press play below. Streaming is free.';play.textContent='Reload player';
      }catch{audioStatus.textContent='Audio could not load. Please try again later.';}finally{play.disabled=false;}
     };
    }
    if(record.link){try{const url=new URL(record.link);if(url.protocol==='https:'&&!url.username&&!url.password){const a=document.createElement('a');a.href=url.href;a.textContent=['services','graphic-design'].includes(category)?(url.hostname==='buy.stripe.com'?'Pay securely →':url.pathname.includes('/addons/booking')?'Choose a time →':'View service →'):['videos','movies'].includes(category)?'Watch →':category==='dj-crates'?'Buy crate — $49.99 →':'Listen →';a.target='_blank';a.rel='noopener noreferrer';if(url.hostname==='console.richrowmusic.com'&&url.pathname==='/addons/cart'&&url.searchParams.has('service')){a.textContent='Add to cart';a.removeAttribute('target');a.onclick=event=>{event.preventDefault();window.dispatchEvent(new CustomEvent('rr-cart-add',{detail:{item:{kind:'service',service:url.searchParams.get('service')},complete:error=>{let status=card.querySelector('[data-cart-status]');if(!status){status=document.createElement('p');status.dataset.cartStatus='';status.setAttribute('role','status');card.append(status)}status.textContent=error||'Added to your cart.';}}}))};const buy=document.createElement('a');const direct=new URL(url);direct.searchParams.set('buyNow','1');buy.href=direct.href;buy.textContent='Purchase now';card.append(a,buy);}else card.append(a);}}catch{}}
    if(watch&&category!=='videos'){const a=document.createElement('a');a.href='https://www.youtube.com/watch?v='+watch;a.textContent='Watch →';a.target='_blank';a.rel='noopener noreferrer';a.style.marginLeft='16px';card.append(a);}
    if(category==='dj-crates')mountCrateGallery(card,record);
    grid.append(card);
   }if(category==='music'&&!profileArtist){const label=document.createElement('label');label.className='catalog-filter';label.textContent='Artist ';const select=document.createElement('select');select.setAttribute('aria-label','Filter catalog by artist');for(const name of ['All artists',...new Set(records.map(r=>r.artist||'More music'))]){const option=document.createElement('option');option.textContent=name;select.append(option);}select.onchange=()=>{for(const card of groups.querySelectorAll('article'))card.hidden=select.value!=='All artists'&&card.dataset.artist!==select.value;};label.append(select);section.append(label);}section.append(groups);
  }catch{status.textContent='Updates are temporarily unavailable. Please try again later.';}
 }
 load();
 // Recheck on returning to the page. No realtime subscription or background polling.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
}
