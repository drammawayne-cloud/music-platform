import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
const KEY='rr-shared-cart-v1';
export function readCart(){try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}}
export function writeCart(rows){localStorage.setItem(KEY,JSON.stringify(rows));localStorage.removeItem('rr-shared-checkout-id');window.dispatchEvent(new Event('rr-cart-change'));}
export function addToCart(item){const rows=readCart();if(rows.length>=19)throw Error('Checkout supports up to 19 different items at a time.');if(item.kind==='merch'){const old=rows.find(r=>r.kind==='merch'&&r.product_id===item.product_id&&r.size===item.size&&r.color===item.color);if(old)old.quantity+=item.quantity;else rows.push({...item,key:crypto.randomUUID()});}else if(item.kind==='membership'){if(rows.some(r=>r.kind==='membership'))throw Error('Choose one membership tier for your cart.');rows.push({...item,key:crypto.randomUUID()});}else if(item.kind==='music'||item.kind==='distribution'){if(rows.some(r=>r.kind===item.kind&&r.product_id===item.product_id&&r.submission_id===item.submission_id))throw Error('This item is already in your cart.');rows.push({...item,key:crypto.randomUUID()});}else rows.push({...item,key:crypto.randomUUID()});writeCart(rows);}
export function migrateMerchCart(){try{const old=JSON.parse(localStorage.getItem('rr-merch-cart')||'[]');if(!Array.isArray(old)||!old.length)return;const rows=readCart();for(const line of old)rows.push({...line,kind:'merch',key:crypto.randomUUID()});writeCart(rows);localStorage.removeItem('rr-merch-cart');}catch{}}
export function cartCount(){return readCart().reduce((n,r)=>n+(r.kind==='merch'&&Number.isInteger(r.quantity)?r.quantity:1),0)}
export async function purchaseNow(item,{api,getToken,login}){
 sessionStorage.setItem('rr-buy-now',JSON.stringify(item));
 if(!getToken()){location.assign('/addons/cart?buyNow=1');return;}
 const fingerprint=JSON.stringify(item);let saved;try{saved=JSON.parse(sessionStorage.getItem('rr-buy-now-order')||'null')}catch{}
 if(!saved||saved.fingerprint!==fingerprint){saved={id:crypto.randomUUID(),fingerprint};sessionStorage.setItem('rr-buy-now-order',JSON.stringify(saved));}
 const result=await api('cart-checkout',{id:saved.id,items:[item]});location.assign(result.url);
}

