import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
const GROUP_PATH='/api/addon/group-live/socket';
async function connect(session,onMessage,onClose){
 const url=new URL(session.path,apiOrigin);if(url.origin!==apiOrigin||url.pathname!==GROUP_PATH)throw Error('Invalid guest connection.');url.protocol='wss:';
 const ws=new WebSocket(url);const ready=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{ws.close();reject(Error('Guest connection timed out.'));},15000);
  ws.onopen=()=>ws.send(JSON.stringify({ticket:session.ticket}));
  ws.onerror=()=>{clearTimeout(timeout);reject(Error('Guest connection failed.'));};
  ws.onclose=()=>{clearTimeout(timeout);reject(Error('Guest connection closed.'));onClose?.();};
  ws.onmessage=e=>{let message;try{message=JSON.parse(e.data);}catch{return;}if(message.type==='ready'){clearTimeout(timeout);resolve(message);}else onMessage(message);};
 });
 const send=message=>{if(ws.readyState!==1)throw Error('Guest connection closed.');ws.send(JSON.stringify(message));};
 return {ready,send,close:()=>{ws.onclose=null;ws.close();}};
}
function peer({iceServers,outgoing,send,to,onStream,onFailure}){
 const pc=new RTCPeerConnection({iceServers,iceTransportPolicy:'relay',bundlePolicy:'max-bundle'}),incoming=new MediaStream(),candidates=[];
 let chain=Promise.resolve(),closed=false,disconnectTimer;
 for(const track of outgoing.getTracks())pc.addTrack(track,outgoing);
 pc.onicecandidate=e=>{if(e.candidate&&!closed)try{send({type:'signal',to,kind:'candidate',payload:e.candidate.toJSON()});}catch{onFailure();}};
 pc.ontrack=e=>{if(!incoming.getTracks().some(t=>t.id===e.track.id))incoming.addTrack(e.track);onStream(incoming);e.track.onended=()=>{incoming.removeTrack(e.track);onStream(incoming);};};
 pc.onconnectionstatechange=()=>{clearTimeout(disconnectTimer);if(pc.connectionState==='failed')onFailure();else if(pc.connectionState==='disconnected'){disconnectTimer=setTimeout(onFailure,10000);}};
 const limits=()=>{for(const sender of pc.getSenders())if(sender.track?.kind==='video'){const p=sender.getParameters();if(!p.encodings?.length)p.encodings=[{}];p.encodings[0].maxBitrate=700000;p.encodings[0].maxFramerate=24;sender.setParameters(p).catch(()=>{});}};
 async function offer(restart=false){await pc.setLocalDescription(await pc.createOffer({iceRestart:restart}));limits();send({type:'signal',to,kind:'offer',payload:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});}
 function receive(message){chain=chain.then(async()=>{
  if(closed)return;
  if(message.kind==='candidate'){if(pc.remoteDescription)await pc.addIceCandidate(message.payload);else candidates.push(message.payload);return;}
  if(!['offer','answer'].includes(message.kind)||message.payload?.type!==message.kind)throw Error('Invalid guest signal');
  await pc.setRemoteDescription(message.payload);for(const candidate of candidates.splice(0))await pc.addIceCandidate(candidate);
  if(message.kind==='offer'){await pc.setLocalDescription(await pc.createAnswer());limits();send({type:'signal',to,kind:'answer',payload:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});}
 }).catch(()=>{if(!closed)onFailure();});}
 return {offer,receive,renew:async(iceServers,restart=false)=>{pc.setConfiguration({...pc.getConfiguration(),iceServers});if(restart)await offer(true);},close:()=>{closed=true;clearTimeout(disconnectTimer);pc.close();}};
}
export async function openHostGuests({record,api,mixer,onPeople,onNotice,onClosed}){
 const peers=new Map();let transport,closed=false,inviteResolve,inviteTimer;
 function remove(id){peers.get(id)?.close();peers.delete(id);mixer.remove(id);}
 const session=await api('group-create',{id:record.id});
 try{transport=await connect(session,async message=>{
  if(closed)return;
  if(message.type==='people')onPeople(message.people);
  if(message.type==='notice')onNotice(message.message);
  if(message.type==='invite'){clearTimeout(inviteTimer);inviteResolve?.(({richrow:'https://richrowmusic.com',waynekastro:'https://waynekastro.com',dracodon17:'https://dracodon17.com',goldenrama440:'https://goldenrama440.com'}[record.site])+'/live.html?site='+record.site+'&guest=1#invite='+encodeURIComponent(message.invite));inviteResolve=null;}
  if(message.type==='accepted'){
   const fail=()=>{remove(message.id);try{transport.send({type:'remove',id:message.id});}catch{}onNotice('A guest disconnected. Their panel has been removed.');};
   const connection=peer({iceServers:message.iceServers||transport.ready.iceServers,outgoing:mixer.forGuest(message.id),send:transport.send,to:message.id,onStream:stream=>mixer.set(message.id,stream,message.name),onFailure:fail});peers.set(message.id,connection);try{await connection.offer();}catch{fail();}
  }
  if(message.type==='ice'){try{await peers.get(message.id)?.renew(message.iceServers,true);}catch{onNotice('A guest connection needs to reconnect.');}}
  if(message.type==='signal')peers.get(message.from)?.receive(message);
  if(message.type==='left')remove(message.id);
  if(message.type==='muted')mixer.mute(message.id,message.muted);
  if(message.type==='closed'){for(const id of [...peers.keys()])remove(id);onClosed?.();}
 },()=>{for(const id of [...peers.keys()])remove(id);if(!closed)onClosed?.();});}
 catch(e){await api('group-close',{id:record.id}).catch(()=>{});throw e;}
 return {
  act:(type,id,muted)=>transport.send({type,id,muted}),
  invite:()=>new Promise((resolve,reject)=>{if(inviteResolve){reject(Error('Please wait for the current invitation.'));return;}inviteResolve=resolve;inviteTimer=setTimeout(()=>{inviteResolve=null;reject(Error('Invitation timed out. Please try again.'));},10000);transport.send({type:'invite'});}),
  close:async()=>{closed=true;clearTimeout(inviteTimer);transport.close();for(const id of [...peers.keys()])remove(id);await api('group-close',{id:record.id}).catch(()=>{});}
 };
}
export async function openGuestConnection({session,camera,onStream,onNotice,onAccepted,onClosed}){
 let connection,transport,closed=false;
 transport=await connect(session,async message=>{
  if(closed)return;
  if(message.type==='accepted'){
   connection=peer({iceServers:message.iceServers,outgoing:camera.stream,send:transport.send,to:'host',onStream,onFailure:()=>{onNotice('The guest connection ended. Leave and request to join again.');connection?.close();}});onAccepted();
  }
  if(message.type==='ice'){try{await connection?.renew(message.iceServers);transport.send({type:'ice-ready',nonce:message.nonce});}catch{onNotice('Please reconnect your guest camera.');}}
  if(message.type==='signal')connection?.receive(message);
  if(message.type==='muted')onNotice(message.muted?'The host muted you on the live.':'The host unmuted you.');
  if(message.type==='removed'||message.type==='closed'){onNotice(message.message||'The host closed the studio.');connection?.close();onClosed();}
 },()=>{if(!closed){connection?.close();onNotice('Guest connection closed.');onClosed();}});
 return {close:()=>{closed=true;connection?.close();transport.close();}};
}
