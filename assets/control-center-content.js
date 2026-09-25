import './audio-player.js';
import {config} from './control-center-config.js';
const mapping={'music.html':'music','remixes.html':'remixes','crates.html':'dj-crates','juggling.html':'unorthodox-juggling','beats.html':'beats','releases.html':'releases','radio.html':'radio','videos.html':'videos','services.html':'services','graphic-design.html':'graphic-design'};
const category=mapping[location.pathname.split('/').pop()];
if(category&&config.supabaseUrl&&config.publishableKey){
 const section=document.createElement('section');section.id='rich-row-published';
 const heading=document.createElement('h2');heading.textContent='Latest '+({'dj-crates':'DJ Crates','unorthodox-juggling':'Unorthodox Juggling','graphic-design':'Graphic Design'}[category]||category);
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Loading the latest from Rich Row…';
 section.append(heading,status);document.querySelector('main')?.append(section);
 async function load(){
  try{
   const base=new URL(config.supabaseUrl);if(base.protocol!=='https:')throw Error('HTTPS required');
   const params=new URLSearchParams({website_id:'eq.'+config.websiteId,category:'eq.'+category,status:'eq.published',select:'id,title,description,link',order:'created_at.desc',limit:'200'});
   const response=await fetch(base.origin+'/rest/v1/rr_content?'+params,{headers:{apikey:config.publishableKey},cache:'no-store'});
   if(!response.ok)throw Error('Content unavailable');const records=await response.json();
   if(!Array.isArray(records))throw Error('Invalid response');
   section.querySelector('.grid')?.remove();
   if(!records.length){status.textContent='New releases and updates are coming soon.';return;}
   status.textContent='';const grid=document.createElement('div');grid.className='grid';
   for(const record of records){
    const card=document.createElement('article');card.className='card';
    const title=document.createElement('h3');title.textContent=record.title;
    const description=document.createElement('p');description.textContent=record.description;description.style.whiteSpace='pre-wrap';
    card.append(title,description);
    if(['music','remixes','beats','releases','dj-crates','unorthodox-juggling','radio'].includes(category)){
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
    if(record.link){try{const url=new URL(record.link);if(url.protocol==='https:'&&!url.username&&!url.password){const a=document.createElement('a');a.href=url.href;a.textContent='Open →';a.target='_blank';a.rel='noopener noreferrer';card.append(a);}}catch{}}
    grid.append(card);
   }section.append(grid);
  }catch{status.textContent='Updates are temporarily unavailable. Please try again later.';}
 }
 load();
 // Recheck on returning to the page. No realtime subscription or background polling.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
}
