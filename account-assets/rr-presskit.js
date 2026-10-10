import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
import {page} from './rr-addon-validation.js';
export const pressArtists={waynekastro:{name:'Wayne Kastro',url:'https://waynekastro.com'},dracodon17:{name:'Draco Don17',url:'https://dracodon17.com'},goldenrama440:{name:'Golden Rama',url:'https://goldenrama440.com'},qdon:{"name": "Q Don", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=qdon", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=qdon#artist-epk"},chinachellz:{"name": "China Chellz", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=chinachellz", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=chinachellz#artist-epk"},bobbioneda:{"name": "Bobbi Oneda", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=bobbioneda", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=bobbioneda#artist-epk"},kathaart:{"name": "Kat Haart", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=kathaart", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=kathaart#artist-epk"},shortstemper:{"name": "Shorts Temper", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=shortstemper", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=shortstemper#artist-epk"},rimstooclean:{"name": "Rims Too Clean", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=rimstooclean", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=rimstooclean#artist-epk"},jessbless:{"name": "Jess Bless", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=jessbless", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=jessbless#artist-epk"},jojosinga:{"name": "JoJo Singa", "url": "https://richrowmusic.com", "bioUrl": "https://richrowmusic.com/artist-biography.html?artist=jojosinga", "epkUrl": "https://richrowmusic.com/artist-biography.html?artist=jojosinga#artist-epk"}};
export function biographyPage(site,form,previous={},newId=()=>crypto.randomUUID()){
 const artist=pressArtists[site];if(!artist)throw Error('Choose a supported artist.');
 const blocks=[];const add=(type,title,body='',extra={})=>blocks.push({id:newId(),type,title,body,...extra});
 if(form.photo)add('image',artist.name+' portrait','',{mediaId:form.photo});
 if(form.summary?.trim())add('text','Artist introduction',form.summary);
 if(form.biography?.trim())add('text','Biography',form.biography);
 return {...previous,...page({title:artist.name+' — Biography',slug:site+'-biography',published:!!form.published,blocks})};
}
export async function pressKitAdmin(ctx){
 const {area,el,api,button,field,choose,upload,say,editPage}=ctx;
 const pages=await api('admin/pages');
 area.replaceChildren(el('h2',{},'Artist profiles, biographies & EPKs'),el('p',{},'Add each artist’s photo and biography here. Save drafts while you work, then publish when ready. Published profiles appear on Rich Row and on the artist’s separate website where one is connected. EPKs have their own separate publish setting.'));
 for(const [site,artist] of Object.entries(pressArtists)){
 const bio=pages.find(p=>p.slug===site+'-biography'),epk=pages.find(p=>p.slug===site+'-epk');
 area.append(el('article',{class:'card'},el('h3',{},artist.name),el('p',{},'Biography: '+(bio?(bio.published?'Published':'Draft'):'Blank')+' · EPK: '+(epk?(epk.published?'Published':'Draft'):'Not started')),button('Edit photo & biography',()=>editBiography(site,bio)),button('Build / edit EPK',async()=>{
 const blocks=['Biography','Press photos','Music & releases','Videos','Press & achievements','Booking & contact'].map(title=>({id:crypto.randomUUID(),type:'heading',title,body:''}));
 await editPage(area,epk||{title:artist.name+' — Electronic Press Kit',slug:site+'-epk',published:false,blocks});
 say('EPK: add text, images, music links and videos with Add Element. Preview it, save with Publish unchecked for a draft, then check Publish and Save Page when ready. Keep the page address '+site+'-epk. The public page is '+(artist.epkUrl||artist.url+'/epk.html')+'.');
 }),el('a',{href:(artist.bioUrl||artist.url+'/biography.html'),target:'_blank',rel:'noopener'},'View biography'),epk?.published?el('a',{href:(artist.epkUrl||artist.url+'/epk.html'),target:'_blank',rel:'noopener'},'View published EPK'):null));
 }
 async function editBiography(site,previous={}){
 const artist=pressArtists[site],media=await api('admin/media');let photo=previous.blocks?.find(b=>b.type==='image')?.mediaId||'';
 const f=el('form',{},field('summary','Short description (blank until ready)',previous.blocks?.find(b=>b.title==='Artist introduction')?.body||'','textarea'),field('biography','Full biography (blank until ready)',previous.blocks?.find(b=>b.title==='Biography')?.body||'','textarea'));
 f.elements.summary.maxLength=5000;f.elements.biography.maxLength=5000;
 const picker=choose('photo','Artist portrait',[['','Leave photo blank'],...media.filter(m=>m.purpose==='public'&&m.mime.startsWith('image/')).map(m=>[m.id,m.name])],photo);
 f.prepend(picker);const file=field('portraitFile','Upload a portrait (PNG or JPEG)','','file');file.querySelector('input').accept='image/png,image/jpeg';
 const uploadButton=button('Upload selected portrait',async()=>{const uploaded=await upload(file.querySelector('input').files[0],'public');const option=el('option',{value:uploaded.id},uploaded.name);picker.querySelector('select').append(option);picker.querySelector('select').value=uploaded.id;say('Portrait uploaded to the public Media Library. Save or publish the biography to place it on the site.');});
 const save=async published=>{if(!f.reportValidity())return;const data=Object.fromEntries(new FormData(f));const next=biographyPage(site,{...data,published},previous);await api('admin/pages',next);say(published?'Biography published to the artist website and Rich Row.':'Biography saved as a private draft.');await pressKitAdmin(ctx);};
 f.addEventListener('submit',e=>e.preventDefault());f.append(file,uploadButton,el('p',{},'Uploaded portraits are stored as public website media. Draft biography text stays private. Saving a published biography as a draft removes it from the public pages.'),el('div',{class:'toolbar'},button('Save draft',()=>save(false)),button('Publish biography',()=>save(true)),button('Back',()=>pressKitAdmin(ctx),'secondary')));
 area.replaceChildren(el('h2',{},artist.name+' — Photo & biography'),f);
 }
}

