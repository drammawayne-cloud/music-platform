import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
const root=document.documentElement;
const key='rr-console-theme';
try{root.dataset.theme=localStorage.getItem(key)==='dark'?'dark':'light';}catch{root.dataset.theme='light';}
const button=document.createElement('button');button.type='button';button.className='console-theme-toggle';
const update=()=>{button.textContent=root.dataset.theme==='dark'?'Light mode':'Dark mode';button.setAttribute('aria-label',button.textContent);};
update();button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,root.dataset.theme);}catch{}update();});
document.body.append(button);

