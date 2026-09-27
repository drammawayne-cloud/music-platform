// Existing music-platform shared entry; extends the current site without changing its pages.
import('./control-center-content.js?v=catalog-4').catch(()=>console.warn('Rich Row content connection is unavailable.'));
// Add Distribution to the shared navigation without changing existing page files.
const richRowNav=document.querySelector('header nav');
if(richRowNav&&!richRowNav.querySelector('a[href="distribution.html"]')){
 const distributionLink=document.createElement('a');distributionLink.href=new URL('../distribution.html',document.currentScript?.src||new URL('assets/app.js',location.href)).href;distributionLink.textContent='Distribution';richRowNav.append(distributionLink);
}

const rrScriptBase=new URL('../',document.currentScript.src);
if(richRowNav){const a=document.createElement('a');a.href=new URL('pages/radio.html',rrScriptBase);a.textContent='Radio & Live';richRowNav.append(a);}

// Rich Row add-on public destinations (no private keys).
if(richRowNav){
 const destinations=[['Console','https://console.richrowmusic.com/'],['Distribution','https://console.richrowmusic.com/addons/distribution'],['Music Store','https://console.richrowmusic.com/addons/store'],['Radio & Live','https://console.richrowmusic.com/addons/radio']];
 for(const [label,href] of destinations){let link=[...richRowNav.querySelectorAll('a')].find(a=>a.textContent.trim()===label);if(!link){link=document.createElement('a');link.textContent=label;richRowNav.append(link);}link.href=href;}
}

for(const a of document.querySelectorAll('a[href]')){if(a.href.startsWith('https://rich-row-control-center.onrender.com/'))a.href=a.href.replace('https://rich-row-control-center.onrender.com','https://console.richrowmusic.com');}

import('./music-embeds.js').catch(()=>console.warn('Music players unavailable.'));

import('./cosmic.js?v=4').catch(()=>console.warn('Rich Row theme unavailable.'));

if(richRowNav&&!richRowNav.querySelector('a[href="merch.html"]')){const merch=document.createElement("a");merch.href=new URL("merch.html",rrScriptBase).href;merch.textContent="Merch";const musicLink=[...richRowNav.querySelectorAll("a")].find(a=>a.textContent.trim()==="Music");if(musicLink)musicLink.after(merch);else richRowNav.append(merch);}

if(richRowNav&&!richRowNav.querySelector('a[data-merch-cart]')){const cart=document.createElement('a');cart.href='https://console.richrowmusic.com/addons/merch#cart';cart.textContent='Cart';cart.dataset.merchCart='true';richRowNav.append(cart);}

import('./activity-popups.js').catch(()=>{});

import('./customer-chat-widget.js').catch(()=>{});
