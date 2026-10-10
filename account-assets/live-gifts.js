import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
const catalog={like:{emoji:'👍',name:'Like',count:3},heart:{emoji:'❤️',name:'Heart',count:5},diamond:{emoji:'💎',name:'Diamond',count:8},money_rain:{emoji:'💸',name:'Money Rain',count:14},big_money_rain:{emoji:'💸',name:'Bigger Money Rain',count:26}};
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(c/100);
export function mountLiveGifts({stage,container,api,id,site,signedIn,onSignIn=()=>{},receiveOnly=false}){
 if(!document.querySelector('[data-live-gifts-style]')){const css=node('link');css.rel='stylesheet';css.href='/account-assets/live-gifts.css?v=20261010-gifts';css.dataset.liveGiftsStyle='1';document.head.append(css);}
 const layer=node('div',null,'rr-gift-effects'),notice=node('p',null,'rr-gift-notice');layer.setAttribute('aria-hidden','true');notice.setAttribute('role','status');stage.classList.add('rr-gift-stage');stage.append(layer);
 const panel=node('section',null,'rr-gifts'),buttons=node('div',null,'rr-gift-buttons');panel.append(node('h3','Send a live gift'),buttons,notice);if(!receiveOnly)container.append(panel);
 const methods=node('select');methods.setAttribute('aria-label','Payment method for gifts');const methodLabel=node('label','Pay with ');methodLabel.append(methods);if(!receiveOnly)panel.insertBefore(methodLabel,buttons);methodLabel.hidden=true;
 let stopped=false,busy=false,sending=false,awaiting=false,cursor='0',timer,requestId,pendingCode,pendingGift,seen=new Set(),animations=new Set();
 function clear(){layer.replaceChildren();for(const a of animations)a.cancel();animations.clear();}
 function effect(event){
  if(stopped||seen.has(event.order_id)||!catalog[event.code])return;seen.add(event.order_id);if(seen.size>300)seen=new Set([...seen].slice(-150));
  const gift=catalog[event.code];if(layer.childElementCount>40)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count=reduced?1:gift.count;
  for(let i=0;i<count;i++){
   const particle=node('span',gift.emoji,'rr-gift-particle');particle.style.left=(8+(i*37%84))+'%';layer.append(particle);
   if(reduced){particle.classList.add('still');const timeout=setTimeout(()=>particle.remove(),1800);continue;}
   const rain=event.code.includes('money_rain');
   const animation=particle.animate(rain?[{transform:'translateY(-30px) rotate(-10deg)',opacity:0},{opacity:1,offset:.12},{transform:'translateY(260px) rotate(20deg)',opacity:0}]:[{transform:'translateY(0) scale(.7)',opacity:0},{opacity:1,offset:.12},{transform:'translateY(-240px) scale(1.2)',opacity:0}],{duration:2400+i*24,delay:i*34,easing:'ease-out'});
   particle.classList.toggle('rain',rain);animations.add(animation);animation.onfinish=()=>{animations.delete(animation);particle.remove();};
  }
 }
 async function poll(){if(stopped||busy||document.hidden)return;busy=true;try{const data=await api('gift-events?id='+id+'&after='+cursor);if(stopped)return;if(data.state!=='live'){stop();return;}for(const e of data.events||[]){cursor=String(e.seq);effect(e);}if(awaiting&&requestId){const order=await api('gift-order?id='+requestId);if(stopped)return;if(order.delivered||order.status!=='pending'){awaiting=false;requestId=null;notice.textContent=order.delivered?'Gift sent.':order.status==='refund_pending'?'Your refund is being processed.':'Gift status: '+order.status;await load(false);}}}catch(e){notice.textContent=e.message;clear();}finally{busy=false;}}
 function stop(){if(stopped)return;stopped=true;clearInterval(timer);clear();for(const b of buttons.querySelectorAll('button'))b.disabled=true;notice.textContent='Gifts are closed for this live.';}
 async function send(g,checkoutOnly=false){
  if(stopped||sending||awaiting)return;sending=true;pendingGift=g;
  if(!requestId||pendingCode!==g.code){requestId=crypto.randomUUID();pendingCode=g.code;}
  for(const b of buttons.querySelectorAll('button'))b.disabled=true;
  const saved=!checkoutOnly&&methods.value;
  notice.textContent=g.amount_cents?(saved?'Sending gift — '+money(g.amount_cents)+'…':'Opening secure checkout…'):'Sending your complimentary gift…';
  try{
   const result=await api('gift-checkout',{stream_id:id,site,code:g.code,request_id:requestId,expected_amount_cents:g.amount_cents,...(saved?{payment_method_id:saved}:{})});
   if(result.url){location.assign(result.url);return;}
   if(result.retry_checkout){requestId=null;notice.textContent=result.message;const fallback=node('button','Use secure checkout — '+money(g.amount_cents));fallback.type='button';fallback.onclick=()=>{fallback.remove();void send(g,true);};notice.append(' ',fallback);return;}
   awaiting=result.status==='pending';notice.textContent=result.delivered?'Gift sent.':awaiting?'Waiting for payment confirmation…':'Gift status: '+result.status;
   if(!awaiting)requestId=null;await poll();
  }catch(e){notice.textContent=e.message;}finally{sending=false;if(!stopped)await load(false);}
 }
 async function load(initial=true){
  if(!signedIn){const b=node('button','Sign in to send gifts');b.type='button';b.onclick=onSignIn;buttons.replaceChildren(b);notice.textContent='Use your approved account to react, send gifts, or join the live.';return;}
  try{
   const data=await api('gifts?id='+id);if(stopped)return;if(data.state!=='live'){stop();return;}
   if(!receiveOnly){const chosen=methods.value;methods.replaceChildren(...[{id:'',label:'Secure checkout'},...(data.saved_methods||[]).map(m=>({id:m.id,label:m.brand+' •••• '+m.last4}))].map(m=>{const option=node('option',m.label);option.value=m.id;return option;}));if([...methods.options].some(o=>o.value===chosen))methods.value=chosen;else methods.value=data.saved_methods?.[0]?.id||'';if(initial&&data.saved_methods?.length)methods.value=data.saved_methods[0].id;methodLabel.hidden=!data.saved_methods?.length||data.benefit==='complimentary';buttons.replaceChildren(...data.gifts.map(g=>{const b=node('button',g.emoji+' '+g.name+' · '+(g.amount_cents===0?'Complimentary':money(g.amount_cents)));b.type='button';b.disabled=awaiting||sending||g.amount_cents>0&&!data.paid_enabled;b.onclick=()=>send(g);return b;}));
   if(initial)notice.textContent=data.benefit==='complimentary'?'Your approved account has complimentary gifts.':!data.paid_enabled?'Paid gifts are being connected. No payment is taken.':data.benefit==='half'?'Your approved 50% discount is included in these USD prices.':data.saved_methods?.length?'Each tap purchases one gift using the selected saved card. Your bank may require secure checkout.':'Prices are in USD. Each gift is a separate purchase. You can choose to save your card at secure checkout.';
   if(data.paid_enabled&&data.benefit!=='complimentary'&&!panel.querySelector('.rr-gift-terms'))panel.append(node('p','If the live ends before delivery, your card authorization is cancelled or the payment is refunded. A refund can take time to appear.','rr-gift-terms'));
   }
   if(initial){await poll();if(!stopped)timer=setInterval(poll,2000);}
  }catch(e){notice.textContent=e.message;}
 }
 const returned=new URLSearchParams(location.search).get('gift_order');if(/^[a-f0-9-]{36}$/i.test(returned||'')&&signedIn){requestId=returned;awaiting=true;}
 void load();
 return {stop,destroy(){stop();layer.remove();panel.remove();stage.classList.remove('rr-gift-stage');}};
}
