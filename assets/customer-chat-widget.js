// Movable Rich Row chat. Existing Control Center chat handles messages.
(()=>{
 if(document.getElementById('rr-chat-launcher')||location.pathname.endsWith('/addons/chat'))return;
 const site=document.body.dataset.site||'richrowmusic';
 const title=site==='waynekastro'?'Wayne Kastro':site==='dracodon17'?'Draco Don17':'Rich Row';
 const key=`${site}-chat-position`;
 const widget=document.createElement('div');widget.className='rr-chat-widget';widget.setAttribute('aria-label',`Talk to ${title}`);
 const launcher=document.createElement('button');launcher.type='button';launcher.id='rr-chat-launcher';launcher.textContent='Talk to me';launcher.setAttribute('aria-controls','rr-chat-panel');launcher.setAttribute('aria-expanded','false');launcher.title='Drag to move · Tap to chat';
 const panel=document.createElement('section');panel.id='rr-chat-panel';panel.hidden=true;panel.setAttribute('aria-label',`Chat with ${title}`);
 const bar=document.createElement('div');bar.className='rr-chat-drag';bar.tabIndex=0;bar.setAttribute('role','group');bar.setAttribute('aria-label','Move chat window. Drag, or use arrow keys.');
 const label=document.createElement('strong');label.textContent=`Talk to ${title}`;
 const close=document.createElement('button');close.type='button';close.textContent='Close';close.setAttribute('aria-label','Close chat');
 bar.append(label,close);
 const frame=document.createElement('iframe');frame.title=`Private conversation with ${title}`;frame.loading='lazy';frame.referrerPolicy='no-referrer';
 panel.append(bar,frame);widget.append(launcher,panel);document.body.append(widget);
 const clamp=(v,min,max)=>Math.min(Math.max(v,min),Math.max(min,max));
 const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({x:widget.offsetLeft,y:widget.offsetTop}))}catch{}};
 const place=(x,y)=>{widget.style.left=clamp(x,8,innerWidth-widget.offsetWidth-8)+'px';widget.style.top=clamp(y,8,innerHeight-widget.offsetHeight-8)+'px';widget.style.right='auto';widget.style.bottom='auto';};
 const initial=read();requestAnimationFrame(()=>{if(initial&&Number.isFinite(initial.x)&&Number.isFinite(initial.y))place(initial.x,initial.y);});
 const open=()=>{if(!frame.src)frame.src=`https://console.richrowmusic.com/addons/chat?embedded=1&site=${encodeURIComponent(site)}`;panel.hidden=false;widget.classList.add('rr-chat-open');launcher.setAttribute('aria-expanded','true');const rect=widget.getBoundingClientRect();place(rect.left,rect.top);bar.focus();};
 const hide=()=>{panel.hidden=true;widget.classList.remove('rr-chat-open');launcher.setAttribute('aria-expanded','false');place(widget.offsetLeft,widget.offsetTop);save();launcher.focus();};
 let wasDragged=false;
 const drag=handle=>{let start=null;handle.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button')&&e.target!==launcher)return;start={x:e.clientX,y:e.clientY,left:widget.offsetLeft,top:widget.offsetTop};wasDragged=false;handle.setPointerCapture(e.pointerId);});handle.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>5)wasDragged=true;if(wasDragged){place(start.left+dx,start.top+dy);e.preventDefault();}});const end=()=>{if(start&&wasDragged)save();start=null;};handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);};
 drag(launcher);drag(bar);
 launcher.addEventListener('click',e=>{if(wasDragged){e.preventDefault();wasDragged=false;return;}panel.hidden?open():hide();});
 close.addEventListener('click',hide);panel.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 bar.addEventListener('keydown',e=>{const moves={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(!moves[e.key])return;e.preventDefault();place(widget.offsetLeft+moves[e.key][0],widget.offsetTop+moves[e.key][1]);save();});
 addEventListener('resize',()=>{if(widget.style.left){place(widget.offsetLeft,widget.offsetTop);save();}});
 const style=document.createElement('style');style.textContent=`
 .rr-chat-widget{position:fixed;right:18px;bottom:max(18px,env(safe-area-inset-bottom));z-index:90;touch-action:none;font-family:system-ui,sans-serif;color:var(--text,#201b17)}
 #rr-chat-launcher{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:11px 19px;background:var(--accent,#79552c);color:var(--accent-dark,#fffaf0);border:1px solid var(--accent,#79552c);border-radius:999px;box-shadow:0 8px 25px #0004;font-size:13px;font-weight:800;cursor:grab;touch-action:none;user-select:none}
 #rr-chat-launcher:active,.rr-chat-drag:active{cursor:grabbing}
 .rr-chat-widget.rr-chat-open #rr-chat-launcher{display:none}
 #rr-chat-panel{display:flex;flex-direction:column;width:min(390px,calc(100vw - 16px));height:min(560px,calc(100dvh - 16px));overflow:hidden;border:1px solid var(--line,#d4c5ad);border-radius:14px;background:var(--surface,#fffaf0);box-shadow:0 22px 65px #0006}
 #rr-chat-panel[hidden]{display:none}.rr-chat-drag{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:52px;padding:8px 12px 8px 17px;border-bottom:1px solid var(--line,#d4c5ad);cursor:grab;touch-action:none;user-select:none;font-size:14px}
 .rr-chat-drag button{min-height:36px;padding:5px 12px;border:1px solid var(--line,#d4c5ad);border-radius:5px;background:transparent;color:inherit;cursor:pointer}
 #rr-chat-panel iframe{width:100%;flex:1;min-height:0;border:0;background:white}
 @media(max-width:500px){#rr-chat-panel{width:min(350px,calc(100vw - 16px));height:min(490px,calc(100dvh - 16px))}}
 `;document.head.append(style);
})();
