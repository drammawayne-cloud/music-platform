import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
const origins={richrow:'https://richrowmusic.com',waynekastro:'https://waynekastro.com',dracodon17:'https://dracodon17.com',goldenrama440:'https://goldenrama440.com'};
const brands={richrow:'Rich Row Music',waynekastro:'Wayne Kastro',dracodon17:'Draco Don17',goldenrama440:'Golden Rama 440'};
export function liveShareData(record){
 if(!record||record.audience!=='public'||!['live','preparing','scheduled'].includes(record.state)||!Object.hasOwn(brands,record.site)||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(record.id||''))return null;
 // Build the viewer address from validated public fields. Never copy the current
 // page, credentials, guest invitations, or a provider-supplied URL.
 const url=new URL('/live.html',origins[record.site]);url.searchParams.set('site',record.site);url.searchParams.set('watch',record.id);
 const title=String(record.title||record.data?.title||'Live').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,200),brand=brands[record.site],paid=(record.paywall||record.data?.paywall)?.enabled===true;
 const text=`${brand} ${record.state==='live'?'is live':'is going live'}! ${title}\n${paid?'Ticket required. Get access:':'Watch here:'}`;
 return {title:brand+' · '+title,text,url:url.href,caption:text+' '+url.href,paid};
}
export async function copyShareText(text,field,nav=navigator){
 try{if(!nav.clipboard?.writeText)throw Error();await nav.clipboard.writeText(text);return true;}catch{field.focus();field.select();field.setSelectionRange?.(0,field.value.length);return false;}
}
export async function nativeLiveShare(data,nav=navigator){
 const payload={title:data.title,text:data.text,url:data.url};
 if(!nav.share||nav.canShare&&!nav.canShare(payload))return 'unavailable';
 try{await nav.share(payload);return 'opened';}catch(e){return e.name==='AbortError'?'cancelled':'unavailable';}
}
function node(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
function button(text,action,cls=''){const b=node('button',text,cls);b.type='button';b.onclick=action;return b;}
export function openLiveShare(record,{host=false}={}){
 const data=liveShareData(record);if(!data)return null;
 document.querySelector('dialog.rr-share')?.close();
 if(!document.querySelector('link[data-live-share]')){const css=node('link');css.rel='stylesheet';css.href=new URL('./live-share.css?v=20261010-cover',import.meta.url).href;css.dataset.liveShare='1';document.head.append(css);}
 const dialog=node('dialog',null,'rr-share'),header=node('header'),heading=node('h2','Share live'),close=button('✕',()=>dialog.close(),'rr-share-close');close.setAttribute('aria-label','Close sharing');header.append(heading,close);
 const summary=node('p',data.title,'rr-share-title'),status=node('p','Choose an app, or copy your link and caption.','rr-share-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const url=node('input');url.type='text';url.value=data.url;url.readOnly=true;url.setAttribute('aria-label','Public viewer link');
 const caption=node('textarea');caption.value=data.caption;caption.readOnly=true;caption.rows=4;caption.setAttribute('aria-label','Promotional caption');
 const copy=async(text,field,message)=>{status.textContent=await copyShareText(text,field)?message:'Selected below. Press and hold to copy, or use your keyboard’s Copy command.';};
 const actions=node('div',null,'rr-share-actions');
 if(navigator.share)actions.append(button('Share to apps…',async()=>{const result=await nativeLiveShare(data);status.textContent=result==='opened'?'Finish sharing in the app you chose.':result==='cancelled'?'Sharing cancelled. Your live is still open.':'App sharing is unavailable here. Use Copy link or Copy caption.';},'rr-share-native'));
 actions.append(button('Copy link',()=>copy(data.url,url,'Link copied. Paste it wherever you want to promote your live.')),button('Copy caption',()=>copy(data.caption,caption,'Caption and link copied. Paste them into your post.')));
 const help=node('details'),toggle=node('summary','Facebook, Instagram & YouTube'),tips=node('div',null,'rr-share-tips');
 for(const [label,text,value,field]of [
  ['Facebook','Paste the caption and link into your Facebook post.',data.caption,caption],
  ['Instagram','Paste the link into a Story link sticker or your profile links. Use the caption for your post.',data.url,url],
  ['YouTube','Add the link to your channel profile or an eligible long-video description. Links in Shorts descriptions and posts are not clickable.',data.url,url]
 ]){const row=node('div');row.append(button('Copy for '+label,()=>copy(value,field,text)),node('p',text));tips.append(row);}
 help.append(toggle,tips);dialog.append(header,summary,actions,node('label','Viewer link'),url,node('label','Caption'),caption,help);
 if(data.paid)dialog.append(node('p','This link opens the ticket page. Viewers still need access.','rr-share-note'));
 if(host)dialog.append(node('p','Keep your live page open. Switching apps may pause your phone camera; use another device to promote while broadcasting.','rr-share-note'));
 dialog.append(status);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();return {close:()=>dialog.close()};
}
export function liveShareButton({record,getRecord,onNotice=()=>{},host=false,className=''}={}){
 const b=button('Share live',async()=>{if(b.disabled)return;b.disabled=true;try{const current=getRecord?await getRecord():record;if(!liveShareData(current)){onNotice('Sharing is available for public live sessions. Private sessions stay private.');return;}openLiveShare(current,{host});}catch{onNotice('Could not check this live. Please try sharing again.');}finally{b.disabled=false;}},'rr-share-trigger '+className);return b;
}
