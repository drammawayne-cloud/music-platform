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
    if(record.link){try{const url=new URL(record.link);if(url.protocol==='https:'&&!url.username&&!url.password){const a=document.createElement('a');a.href=url.href;a.textContent='Open →';a.target='_blank';a.rel='noopener noreferrer';card.append(a);}}catch{}}
    grid.append(card);
   }section.append(grid);
  }catch{status.textContent='Updates are temporarily unavailable. Please try again later.';}
 }
 load();
 // Recheck on returning to the page. No realtime subscription or background polling.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
}
