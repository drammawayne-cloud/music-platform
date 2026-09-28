const station = 'https://richrow-radio.129-213-164-255.sslip.io/public/rich_row_radio';
for (const root of document.querySelectorAll('[data-radio]')) {
 const title=document.createElement('h2');title.textContent='Highlife Radio';
 const frame=document.createElement('iframe');frame.src=station+'/embed?theme=dark';frame.title='Highlife Radio live player';frame.allow='autoplay';frame.style.cssText='width:100%;height:330px;border:0;border-radius:12px';
 const link=document.createElement('a');link.href=station;link.textContent='Open radio player';link.target='_blank';link.rel='noopener';
 root.replaceChildren(title,frame,link);
}
