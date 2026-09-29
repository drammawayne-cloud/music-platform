const artists={waynekastro:{name:'Wayne Kastro',url:'https://waynekastro.com'},dracodon17:{name:'Draco Don17',url:'https://dracodon17.com'},goldenrama440:{name:'Golden Rama',url:'https://goldenrama440.com'}};
const base='https://console.richrowmusic.com';
const node=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;};
const safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
const anchor=(text,url)=>{const a=node('a',text);a.href=url;return a;};
async function published(slug){const r=await fetch(base+'/api/addon/page?slug='+encodeURIComponent(slug),{credentials:'omit',cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw Error('Profile unavailable');const data=await r.json();if(!Array.isArray(data.blocks))throw Error('Profile unavailable');return data;}
function photo(image,artist){const slot=node('div','','artist-photo-slot');slot.setAttribute('aria-label',artist.name+' portrait');if(safe(image?.url)){const img=node('img');img.src=image.url;img.alt=artist.name;img.loading='lazy';slot.append(img);}return slot;}
function renderBlock(b){const box=node('section','','press-block');if(b.title)box.append(node(b.type==='heading'?'h3':'h4',b.title));if(b.body){const p=node('p',b.body);p.style.whiteSpace='pre-wrap';box.append(p);}
 if(['image','cover','gallery'].includes(b.type))for(const m of Array.isArray(b.media)?b.media:[b.media])if(safe(m?.url)){const img=node('img');img.src=m.url;img.alt=b.title||m.name||'Press photo';img.loading='lazy';box.append(img);}
 if(['button','instagram','tiktok','facebook','x','distribution'].includes(b.type)&&safe(b.url))box.append(anchor(b.label||'Open link',b.url));
 if(['youtube','vimeo'].includes(b.type)&&safe(b.url)&&['www.youtube-nocookie.com','player.vimeo.com'].includes(new URL(b.url).hostname)){const frame=node('iframe');frame.src=b.url;frame.title=b.title||'Artist video';frame.loading='lazy';frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;box.append(frame);}
 if(['audio','video'].includes(b.type)&&safe(b.media?.url)){const player=node(b.type);player.src=b.media.url;player.controls=true;player.preload='none';box.append(player);}
 if(b.type==='divider')box.append(node('hr'));return box;
}
for(const root of document.querySelectorAll('[data-artist-profile]')){
 const site=root.dataset.artistProfile||new URLSearchParams(location.search).get('artist');const artist=artists[site];if(!artist){root.replaceChildren(node('p','Choose an artist to view their biography.'));continue;}
 const mode=root.dataset.profileView||'summary';const ownSite=document.body.dataset.site===site;
 const bioUrl=ownSite?'biography.html':'artist-biography.html?artist='+site,epkUrl=artist.url+'/epk.html';
 const portrait=photo(null,artist),copy=node('div','','artist-profile-copy');copy.append(node(mode==='summary'?'h2':'h1',artist.name));const desc=node('p','','artist-description');copy.append(desc);
 const links=node('nav','','artist-profile-links');links.setAttribute('aria-label',artist.name+' profile links');if(mode==='summary')links.append(anchor('Biography',bioUrl));
 const columns=node('div','','artist-profile-columns');columns.append(portrait,copy);root.replaceChildren(columns);copy.append(links);
 async function load(){try{
 const [bio,epk]=await Promise.all([published(site+'-biography'),published(site+'-epk')]);
 const image=bio?.blocks.find(b=>b.type==='image'&&b.media)?.media;if(image)portrait.replaceWith(photo(image,artist));
 desc.textContent=bio?.blocks.find(b=>b.title==='Artist introduction')?.body||'';
 if(epk)links.append(anchor('EPK',mode==='biography'?'#artist-epk':epkUrl));
 if(mode!=='summary'){
  if(mode==='biography'){const biography=node('section','','artist-biography');biography.append(node('h2','Biography'));for(const b of bio?.blocks||[])if(b.type!=='image'&&b.title!=='Artist introduction')biography.append(renderBlock(b));root.append(biography);}
  const press=node('section','','artist-epk');press.id='artist-epk';press.append(node('h2','Electronic Press Kit'));
  if(epk){for(const b of epk.blocks)press.append(renderBlock(b));const print=node('button','Print / save EPK as PDF');print.type='button';print.className='press-print';print.onclick=()=>window.print();press.append(print,anchor('Open shareable EPK',epkUrl));}
  else if(mode==='epk')press.append(node('p','The artist’s press kit has not been published yet.'));
  root.append(press);
 }
 }catch{const message=node('p','Artist information is temporarily unavailable. Please try again later.');message.setAttribute('role','status');root.append(message);}}
 load();
}
