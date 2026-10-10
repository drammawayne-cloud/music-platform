import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
const root=document.documentElement;
const key='rr-console-theme';
const membership=location.pathname==='/addons/membership';
if(membership){
 root.dataset.theme='light';
 try{localStorage.setItem(key,'light');}catch{}
}else{
 try{root.dataset.theme=localStorage.getItem(key)==='dark'?'dark':'light';}catch{root.dataset.theme='light';}
}
if(root.dataset.goldenChat!=='true'&&!membership){
 const button=document.createElement('button');button.type='button';button.className='rr-theme-toggle';
 const update=()=>{button.textContent=root.dataset.theme==='dark'?'Light mode':'Dark mode';button.setAttribute('aria-label',button.textContent);};
 update();button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,root.dataset.theme);}catch{}update();});
 document.querySelector('header')?.append(button);
}

