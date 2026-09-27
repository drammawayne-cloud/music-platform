const installStyle=document.createElement('style');installStyle.textContent='#install-rich-row[hidden]{display:none!important}';document.head.append(installStyle);
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
let promptEvent;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;const button=document.querySelector('#install-rich-row');if(button)button.hidden=false;});
const button=document.querySelector('#install-rich-row');if(button)button.onclick=async()=>{if(promptEvent){await promptEvent.prompt();promptEvent=null;button.hidden=true;}};
window.addEventListener('appinstalled',()=>{if(button)button.hidden=true;});
