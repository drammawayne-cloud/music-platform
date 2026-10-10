import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tokenPattern=/^[a-f0-9]{64}$/;
export function selectedCrate(rows,offeringId){
 if(!uuid.test(offeringId||''))throw Error('Choose a DJ crate from Team Unstoppable Music.');
 const p=rows.find(p=>p.id===offeringId&&p.published===true&&p.kind==='digital'&&p.category==='DJ Crates');
 if(!p||p.currency!=='usd'||!Number.isSafeInteger(p.price_cents)||p.price_cents<99)throw Error('This DJ crate is not available.');
 return p;
}
export function stripeCheckoutURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='checkout.stripe.com'||u.port||u.username||u.password||u.pathname==='/')throw Error('Secure checkout could not open.');return u.href;}
function checkoutProof(offeringId){const key='rr-guest-crate-'+offeringId;let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}if(!saved||!uuid.test(saved.id)||!tokenPattern.test(saved.token)){const bytes=crypto.getRandomValues(new Uint8Array(32));saved={id:crypto.randomUUID(),token:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};sessionStorage.setItem(key,JSON.stringify(saved));}return saved;}
export async function teamCrateCheckout({main,el,api,button,title,configured}){
 const params=new URLSearchParams(location.search),p=selectedCrate(await api('offerings'),params.get('offering'));
 title('TEAM UNSTOPPABLE / GUEST CHECKOUT',p.title,'Buy without creating an account. Enter your email at secure checkout to receive your download.');
 const status=el('p',{role:'status'}),price=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.price_cents/100)+' USD';let pending=false;
 const checkout=async()=>{if(pending)return;if(!configured){status.textContent='Guest checkout is being connected. Please try again later.';return;}pending=true;status.textContent='Opening secure Stripe checkout…';try{const proof=checkoutProof(p.id);const order=await api('guest-crate-checkout',{...proof,offering_id:p.id});location.assign(stripeCheckoutURL(order.url));}catch(error){status.textContent=error.message;if(/ended/.test(error.message))sessionStorage.removeItem('rr-guest-crate-'+p.id);throw error;}finally{pending=false;}};
 const buy=button('Continue as guest',checkout);buy.disabled=!configured;
 main.append(el('article',{class:'card'},el('p',{},p.description),el('strong',{},price),el('p',{},'No account or password required. Your download becomes available after verified payment, and a private receipt link is emailed to you.'),buy,el('a',{href:'https://1teamunstoppable.com/#music',class:'secondary'},'Back to Team Unstoppable Music'),status));
 if(!configured)status.textContent='Guest checkout is being connected. Please try again later.';
 if(params.get('buyNow')==='1'&&configured){try{await checkout();}catch{}}
}
export async function teamCrateReceipt({main,el,api,button,title}){
 const params=new URLSearchParams(location.search),orderId=params.get('id');if(!uuid.test(orderId||''))throw Error('This receipt link is invalid.');
 const key='rr-guest-receipt-'+orderId;let token=params.get('receipt')||sessionStorage.getItem(key);if(!tokenPattern.test(token||''))throw Error('Open the private receipt link from your purchase email.');
 sessionStorage.setItem(key,token);if(params.has('receipt')){const u=new URL(location.href);u.searchParams.delete('receipt');history.replaceState(null,'',u);}
 const proof={id:orderId,token};const row=await api('guest-crate-receipt',proof);
 title('TEAM UNSTOPPABLE / YOUR PURCHASE',row.title,'Your private purchase receipt. No account required.');
 const card=el('article',{class:'card'},el('p',{},'Payment status: '+row.status));
 if(row.download_available){card.append(el('p',{},'Your payment is verified. Your protected download is ready.'),el('p',{},row.delivery_notes),button('Download DJ crate',async()=>{const result=await api('guest-crate-download',proof);const u=new URL(result.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Download could not open.');location.assign(u.href);}));}
 else card.append(el('p',{},'Your download will become available after payment is confirmed.'),button('Check payment again',()=>location.reload()));
 card.append(el('a',{href:'https://1teamunstoppable.com/#music',class:'secondary'},'Back to Team Unstoppable Music'));main.append(card);
}
export async function guestCrateOwnerPage({area,el,api,button}){
 const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)/100);
 let month='',offset=0;
 async function draw(){const report=await api('admin/guest-crate-orders?'+new URLSearchParams({month,offset:String(offset)}));
 const filter=el('input',{type:'month',value:month,'aria-label':'Sales month'});filter.onchange=()=>{month=filter.value;offset=0;draw()};
 area.replaceChildren(el('h2',{},'Guest DJ crate sales'),el('p',{},'All guest purchases, payment amounts and delivery status. Monthly reporting uses New York time.'),filter,button('All months',()=>{month='';offset=0;draw()}));
 area.append(el('div',{class:'scroll'},el('table',{},el('thead',{},el('tr',{},['Month','Paid orders','Paid sales','Refunded'].map(v=>el('th',{},v)))),el('tbody',{},report.months.map(r=>el('tr',{},[r.month,r.paid_orders,money(r.paid_sales_cents),money(r.refunded_cents)].map(v=>el('td',{},String(v)))))))));
 for(const row of report.orders){const card=el('article',{class:'card'},el('h3',{},row.title),el('p',{},row.email||'Email collected at checkout'),el('p',{},money(row.amount)+' · '+row.status),el('p',{},'Order: '+row.id),el('p',{},new Date(row.created_at).toLocaleString()),el('p',{},row.email_sent_at?'Receipt emailed':'Receipt email pending'),el('p',{},row.delivery_notes));const u=new URL(row.delivery_url);if(u.protocol==='https:')card.append(el('a',{href:u.href,target:'_blank',rel:'noopener noreferrer'},'Open delivery file'));area.append(card)}
 if(offset)area.append(button('Previous orders',()=>{offset=Math.max(0,offset-100);draw()}));if(report.has_more)area.append(button('Next orders',()=>{offset=report.next_offset;draw()}));if(!report.orders.length)area.append(el('p',{},'No guest purchases in this period.'));
 }await draw();
}

