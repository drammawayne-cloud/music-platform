const station='https://richrow-radio.129-213-164-255.sslip.io/public/rich_row_radio';
const stream='https://richrow-radio.129-213-164-255.sslip.io/listen/rich_row_radio/radio.mp3';
for(const root of document.querySelectorAll('[data-radio]')){
 const home=location.pathname==='/'||location.pathname.endsWith('/index.html');
 const title=document.createElement(home?'strong':'h2');title.textContent='Highlife Radio';
 const link=document.createElement('a');link.href=station;link.textContent='Open radio player';link.target='_blank';link.rel='noopener';
 if(home){
  root.setAttribute('aria-label','Highlife Radio live player');root.style.cssText='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:18px 0!important;padding:16px 20px!important;background:#141414;border:1px solid #b6a35d;border-radius:14px';
  const copy=document.createElement('div'),prompt=document.createElement('p');prompt.textContent='Press play to listen to Highlife Radio';prompt.style.cssText='margin:5px 0 0;color:#eee;font-size:14px';copy.append(title,prompt);
  const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.src=stream;audio.setAttribute('aria-label','Play Highlife Radio');audio.style.cssText='width:320px;max-width:100%;height:42px;margin:0';audio.addEventListener('error',()=>{prompt.textContent='The stream is reconnecting. Try the full radio player.'});
  link.textContent='Full player ↗';root.replaceChildren(copy,audio,link);document.querySelector('main')?.prepend(root);
 }else{
  const frame=document.createElement('iframe');frame.src=station+'/embed?theme=dark';frame.title='Highlife Radio live player';frame.allow='autoplay';frame.style.cssText='width:100%;height:330px;border:0;border-radius:12px';root.replaceChildren(title,frame,link);
 }
}
