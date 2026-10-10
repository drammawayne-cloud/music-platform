import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
import {cartCount} from './rr-cart-state.js';
const nav=document.querySelector('header nav');
if(nav){
 const icon=body=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
 const menuIcon=icon('<path d="M4 6h16M4 12h16M4 18h16"/>'),closeIcon=icon('<path d="m6 6 12 12M18 6 6 18"/>');
 const actions=document.createElement('div');actions.className='rr-nav-actions';
 const cart=document.createElement('a');cart.href='/addons/cart';cart.className='rr-icon-control';cart.title='Shopping cart';cart.setAttribute('aria-label','Shopping cart');cart.innerHTML=icon('<path d="M3 3h2l2.4 12h11.2l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>');
 const badge=document.createElement('span');badge.className='rr-cart-count';badge.hidden=true;cart.append(badge);
 function count(){try{const n=cartCount();badge.hidden=n===0;badge.textContent=String(n);cart.setAttribute('aria-label',n?'Shopping cart, '+n+' items':'Shopping cart');}catch{badge.hidden=true;}}
 count();window.addEventListener('storage',count);window.addEventListener('rr-cart-change',count);
 nav.id='rr-addon-nav';const menu=document.createElement('button');menu.type='button';menu.className='rr-icon-control';menu.setAttribute('aria-controls',nav.id);
 function open(value){nav.classList.toggle('rr-nav-open',value);menu.setAttribute('aria-expanded',String(value));menu.setAttribute('aria-label',value?'Close menu':'Open menu');menu.innerHTML=value?closeIcon:menuIcon;}
 open(false);menu.onclick=()=>open(menu.getAttribute('aria-expanded')!=='true');actions.append(cart,menu);nav.before(actions);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){open(false);menu.focus();}});
 document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!actions.contains(e.target))open(false);});
 const style=document.createElement('style');style.textContent='header{flex-wrap:wrap!important;gap:12px!important}.rr-nav-actions{display:flex;gap:8px;margin-left:auto}.rr-icon-control{position:relative;display:inline-flex!important;align-items:center;justify-content:center;width:44px;height:44px;padding:0!important;border:1px solid #ffffff35!important;border-radius:12px!important;background:transparent!important;color:inherit}.rr-icon-control:focus-visible{outline:2px solid #e4c581;outline-offset:3px}header nav{display:none!important;width:100%;order:5;border-top:1px solid #ffffff20;padding-top:12px}header nav.rr-nav-open{display:flex!important;flex-wrap:wrap;gap:12px}header nav a{padding:10px;min-height:44px}.rr-cart-count{position:absolute;top:-5px;right:-5px;min-width:17px;padding:1px 4px;border-radius:12px;background:#dfc58d;color:#12111b;font-size:10px;font-weight:bold}.rr-cart-count[hidden]{display:none}';document.head.append(style);
}

