import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
export async function customerChat({main,el,api,button,field,submit,login,getToken,title,say}){
 const golden=new URLSearchParams(location.search).get('site')==='goldenrama440';
 title(golden?'GOLDEN RAMA 440':'RICH ROW / CHAT',golden?'Live Chat':'Chat with us',golden?'Leave a message for Bomb Shop Music. Replies appear here; response times vary.':'Leave a message for the Rich Row team. Replies appear here; response times vary.');
 if(!getToken()){main.append(button('Sign in to start your conversation',login));return;}
 const log=el('div',{class:'panel','aria-live':'polite',role:'log','aria-label':golden?'Live Chat':'Conversation with Rich Row'});const form=el('form',{},field('body','Your message','','textarea',true));form.elements.body.maxLength=2000;main.append(log,form);let signature='';
 async function refresh(){const rows=(await api('chat')).reverse();const next=rows.map(r=>r.id).join();if(next===signature&&log.children.length)return;signature=next;log.replaceChildren(...rows.map(r=>el('article',{class:'card'},el('strong',{},r.sender==='team'?(golden?'Live Chat team':'Rich Row team'):'You'),el('p',{style:'white-space:pre-wrap'},r.body),el('small',{},new Date(r.created_at).toLocaleString()))));if(!rows.length)log.append(el('p',{},'Send your question or project details below. Please leave out passwords and payment information.'));}
 submit(form,'Send message',async d=>{await api('chat',d);form.reset();say('Message sent.');await refresh();});await refresh();const timer=setInterval(()=>{if(!log.isConnected){clearInterval(timer);return;}if(!document.hidden)refresh().catch(()=>{});},10000);
}
export async function chatInbox(area,{el,api,button,field,submit,say}){
 const threads=await api('admin/chat');area.replaceChildren(el('h2',{},'Customer messages'),el('p',{},'Private conversations. Customers see replies here when they return to Chat with us.'),button('Refresh inbox',()=>chatInbox(area,{el,api,button,field,submit,say})));
 if(!threads.length)area.append(el('p',{},'No customer messages yet.'));
 for(const t of threads)area.append(el('article',{class:'card'},el('h3',{},t.email),el('p',{},t.last_message),button('Open conversation',()=>open(t))));
 async function open(t){const pane=el('div');area.replaceChildren(button('Back to inbox',()=>chatInbox(area,{el,api,button,field,submit,say})),el('h2',{},t.email),pane);const form=el('form',{},field('body','Reply','','textarea',true));form.elements.body.maxLength=2000;area.append(form);let signature='';
 async function refresh(){const rows=(await api('admin/chat-history?owner='+encodeURIComponent(t.owner_id))).reverse();const next=rows.map(r=>r.id).join();if(next===signature&&pane.children.length)return;signature=next;pane.replaceChildren(...rows.map(r=>el('article',{class:'card'},el('strong',{},r.sender==='team'?'Rich Row team':'Customer'),el('p',{style:'white-space:pre-wrap'},r.body),el('small',{},new Date(r.created_at).toLocaleString()))));}
 submit(form,'Send reply',async d=>{await api('admin/chat-reply',{...d,owner_id:t.owner_id});form.reset();say('Reply sent.');await refresh();});await refresh();const timer=setInterval(()=>{if(!pane.isConnected){clearInterval(timer);return;}if(!document.hidden)refresh().catch(()=>{});},10000);
 }
}

