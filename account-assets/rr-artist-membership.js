import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
const names={dracodon17:'Draco Don17',waynekastro:'Wayne Kastro',goldenrama440:'Golden Rama 440'};
const tiers=[['c','C',15,'This artist’s gallery + live broadcasts, with existing listening previews. One membership. No music downloads.'],['b','B',49.99,'Listen and download songs selected by the artist.'],['a','A',99.99,'Full access to this artist’s published member catalog and downloads.']];
export async function artistMembershipPage({main,el,api,button,field,submit,login,getToken,title,say,authRequest}){
 const site=new URLSearchParams(location.search).get('site');if(!Object.hasOwn(names,site))throw Error('Choose an artist site.');const artist=names[site];
 title(artist.toUpperCase()+' / MEMBERSHIP','Be part of '+artist+'.','');
 const cards=el('div',{class:'grid artist-tier-grid'},tiers.map(([id,name,price,description])=>el('article',{class:'card artist-tier'},el('p',{class:'eyebrow'},artist+' / TIER '+name),el('h2',{},'Tier '+name),el('p',{class:'artist-price'},'$'+price+' / month'),el('p',{},description),button('Choose Tier '+name,async()=>{
  if(!getToken()){document.getElementById('artist-signup')?.scrollIntoView({behavior:'smooth'});say('Create an account or sign in first.');return;}
  const profile=await api('artist-profile?site='+site);if(!profile){document.getElementById('artist-profile')?.scrollIntoView({behavior:'smooth'});say('Complete your name, phone and SMS choice before checkout.');return;}
  location.assign((await api('artist-membership-checkout',{site,plan:id})).url);
 }))));main.append(cards);
 if(!getToken()){main.append(el('section',{class:'panel',id:'artist-signup'},el('h2',{},artist+' customer account'),el('p',{},'Sign in or create your customer account. Your membership profile is saved separately for this artist site.'),button('Customer Sign In / Register',login)));return;}
 const state=await api('artist-membership?site='+site);main.append(el('section',{class:'panel'},el('h2',{},'Your '+artist+' membership'),el('p',{},state.plan?'Active Tier '+state.plan.toUpperCase()+' · $'+((state.membership?.amount||0)/100).toFixed(2)+'/month':'No active plan yet.')));
 if(state.membership?.customer_id)main.append(button('Manage billing or cancel renewal',async()=>location.assign((await api('artist-member-portal',{site})).url),'secondary'));
 let profile=await api('artist-profile?site='+site);if(!profile){try{const saved=JSON.parse(sessionStorage.getItem('artist-profile-'+site)||'null');if(saved){profile=await api('artist-profile',{...saved,site});sessionStorage.removeItem('artist-profile-'+site);}}catch(err){say(err.message);}}if(!profile){let draft={};try{draft=JSON.parse(sessionStorage.getItem('artist-profile-'+site)||'{}');}catch{}
  const section=el('section',{class:'panel',id:'artist-profile'},el('h2',{},'Complete your '+artist+' profile'));
  const form=el('form',{},field('first_name','First name',draft.first_name||'','text',true),field('last_name','Last name',draft.last_name||'','text',true),field('phone','Phone number',draft.phone||'','tel',true));
  form.append(el('label',{class:'artist-consent'},el('input',{type:'checkbox',name:'sms_opt_in',required:true,checked:draft.sms_opt_in===true}),'I allow '+artist+' membership SMS updates at this phone number.'));
  submit(form,'Save profile',async d=>{profile=await api('artist-profile',{...d,site});sessionStorage.removeItem('artist-profile-'+site);say('Profile saved. Choose your tier.');section.remove();});section.append(form);main.append(section);
 }
 if(!state.plan)return;
 const library=await api('artist-member-library?site='+site);main.append(el('h2',{},artist+' member library'));
 if(!library.items.length)main.append(el('p',{},artist+' releases will appear here when published.'));
 for(const p of library.items){const card=el('article',{class:'card artist-release'},p.cover?el('img',{src:p.cover.url,alt:p.title+' cover',loading:'lazy'}):null,el('h3',{},p.title),el('p',{},p.description||''));
  if(p.can_stream){const audio=el('audio',{controls:true,preload:'none'});card.append(button('Listen',async()=>{audio.src=(await api('artist-member-stream',{site,product_id:p.id})).url;await audio.play();}),audio);}else if(p.preview)card.append(el('audio',{src:p.preview.url,controls:true,preload:'none'}));
  if(p.can_download)card.append(button('Download',async()=>location.assign((await api('artist-member-download',{site,product_id:p.id})).url),'secondary'));
  if(state.plan==='c')card.append(el('p',{class:'muted'},'Tier C has listening and viewing access only.'));
  if(state.plan==='b'&&!p.allow_b)card.append(el('p',{class:'muted'},'This song has not been selected for Tier B.'));
  main.append(card);
 }
}


