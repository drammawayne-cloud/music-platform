// Existing music-platform shared entry; extends the current site without changing its pages.
import('./control-center-content.js').catch(()=>console.warn('Rich Row content connection is unavailable.'));
// Add Distribution to the shared navigation without changing existing page files.
const richRowNav=document.querySelector('header nav');
if(richRowNav&&!richRowNav.querySelector('a[href="distribution.html"]')){
 const distributionLink=document.createElement('a');distributionLink.href=new URL('../distribution.html',document.currentScript?.src||new URL('assets/app.js',location.href)).href;distributionLink.textContent='Distribution';richRowNav.append(distributionLink);
}

const rrScriptBase=new URL('../',document.currentScript.src);
if(richRowNav){const a=document.createElement('a');a.href=new URL('pages/radio.html',rrScriptBase);a.textContent='Radio & Live';richRowNav.append(a);}
