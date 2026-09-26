// Existing music-platform shared entry; extends the current site without changing its pages.
import('./control-center-content.js').catch(()=>console.warn('Rich Row content connection is unavailable.'));
// Add Distribution to the shared navigation without changing existing page files.
const richRowNav=document.querySelector('header nav');
if(richRowNav&&!richRowNav.querySelector('a[href="distribution.html"]')){
 const distributionLink=document.createElement('a');distributionLink.href=new URL('../distribution.html',document.currentScript?.src||new URL('assets/app.js',location.href)).href;distributionLink.textContent='Distribution';richRowNav.append(distributionLink);
}

const rrScriptBase=new URL('../',document.currentScript.src);
if(richRowNav){const a=document.createElement('a');a.href=new URL('pages/radio.html',rrScriptBase);a.textContent='Radio & Live';richRowNav.append(a);}

// Rich Row add-on public destinations (no private keys).
if(richRowNav){
 const destinations=[['Distribution','https://rich-row-control-center.onrender.com/addons/distribution'],['Music Store','https://rich-row-control-center.onrender.com/addons/store'],['Radio & Live','https://rich-row-control-center.onrender.com/addons/radio']];
 for(const [label,href] of destinations){let link=[...richRowNav.querySelectorAll('a')].find(a=>a.textContent.trim()===label);if(!link){link=document.createElement('a');link.textContent=label;richRowNav.append(link);}link.href=href;}
}
