
// Rich Row add-on public destinations (no private keys).
if(richRowNav){
 const destinations=[['Distribution','https://rich-row-control-center.onrender.com/addons/distribution'],['Music Store','https://rich-row-control-center.onrender.com/addons/store'],['Radio & Live','https://rich-row-control-center.onrender.com/addons/radio']];
 for(const [label,href] of destinations){let link=[...richRowNav.querySelectorAll('a')].find(a=>a.textContent.trim()===label);if(!link){link=document.createElement('a');link.textContent=label;richRowNav.append(link);}link.href=href;}
}
