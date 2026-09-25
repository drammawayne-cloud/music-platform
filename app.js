// Existing music-platform shared entry; extends the current site without changing its pages.
import('./control-center-content.js').catch(()=>console.warn('Rich Row content connection is unavailable.'));
// Add Distribution to the shared navigation without changing existing page files.
const richRowNav=document.querySelector('header nav');
if(richRowNav&&!richRowNav.querySelector('a[href="distribution.html"]')){
 const distributionLink=document.createElement('a');distributionLink.href='distribution.html';distributionLink.textContent='Distribution';richRowNav.append(distributionLink);
}
