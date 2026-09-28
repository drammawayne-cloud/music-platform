import {mountSpeakerRadio} from './radio-player.js?v=cover3';
const station='https://richrow-radio.129-213-164-255.sslip.io/public/rich_row_radio';
const stream='https://richrow-radio.129-213-164-255.sslip.io/listen/rich_row_radio/radio.mp3';
for(const root of document.querySelectorAll('[data-radio]')){
 const home=location.pathname==='/'||location.pathname.endsWith('/index.html');
 const title=document.createElement(home?'strong':'h2');title.textContent='Highlife Radio';
 const link=document.createElement('a');link.href=station;link.textContent='Open radio player';link.target='_blank';link.rel='noopener';
 if(home){
  mountSpeakerRadio(root);document.querySelector('main')?.prepend(root);
 }else{
  const frame=document.createElement('iframe');frame.src=station+'/embed?theme=dark';frame.title='Highlife Radio live player';frame.allow='autoplay';frame.style.cssText='width:100%;height:330px;border:0;border-radius:12px';root.replaceChildren(title,frame,link);
 }
}
