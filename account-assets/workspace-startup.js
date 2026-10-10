import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
export async function bootWorkspace({target,moduleUrl,load=()=>import(moduleUrl),timeoutMs=15000}){
 let settled=false;
 function unavailable(){
  if(settled)return;
  const card=document.createElement('section');card.className='card';
  const heading=document.createElement('h1');heading.textContent='Your workspace could not open.';
  const copy=document.createElement('p');copy.textContent='The connection is taking longer than expected. Try opening it again.';copy.setAttribute('role','status');
  const retry=document.createElement('button');retry.type='button';retry.className='primary';retry.textContent='Retry connection';retry.onclick=()=>location.reload();
  card.append(heading,copy,retry);target.replaceChildren(card);
 }
 const timer=setTimeout(()=>{
  if(settled)return;
  const status=document.createElement('p');status.textContent='One moment, please.';status.setAttribute('role','status');target.replaceChildren(status);
 },timeoutMs);
 const deadline=setTimeout(unavailable,45000);
 try{await load();settled=true;}catch{unavailable();settled=true;}
 finally{clearTimeout(timer);clearTimeout(deadline);}
}

