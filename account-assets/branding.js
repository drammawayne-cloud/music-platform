import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
// Logo presentation only; account, checkout and registry logic stay untouched.
const {brand: key='richrow', brandName: name='Rich Row Records', brandOrigin: origin='https://richrowmusic.com'}=document.body.dataset;
const logo=origin+'/brand-logo.png?v=20260929';
function applyBrand(){
 document.querySelectorAll('.brand img:not([data-official-brand])').forEach(img=>{
  img.src=logo;img.alt=name;img.style.objectFit='contain';img.dataset.officialBrand='true';
 });
 const dialog=document.querySelector('dialog[open]');
 if(dialog?.querySelector('input[type="password"]')){
  const heading=dialog.querySelector('h2');
  if(heading&&!heading.querySelector('.brand-logo-image')){
   heading.classList.add('brand-login-slot');const image=document.createElement('img');
   image.className='brand-logo-image';image.src=logo;image.alt=name;heading.append(image);
  }
 }
 // Keep the selected artist's logo on the existing shared admin sign-in route.
 if(key!=='richrow')document.querySelectorAll('a[href="/#/login"]').forEach(a=>a.href='/?site='+encodeURIComponent(key)+'#/login');
}
applyBrand();
new MutationObserver(applyBrand).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});

