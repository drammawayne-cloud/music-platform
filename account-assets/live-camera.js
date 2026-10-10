import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
import {monitorCameraFrames,cameraFrameHealthy,verifyConcurrentCameras} from './live-camera-health.js?v=20261010-camera';
export function liveLayout(count,width=640,height=360,orientation='side'){
 if(count<=1)return [{x:0,y:0,w:width,h:height}];
 if(count===2)return orientation==='stack'?[{x:0,y:0,w:width,h:height/2},{x:0,y:height/2,w:width,h:height/2}]:[{x:0,y:0,w:width/2,h:height},{x:width/2,y:0,w:width/2,h:height}];
 return Array.from({length:Math.min(count,4)},(_,i)=>({x:count===3&&i===2?width/4:(i%2)*width/2,y:Math.floor(i/2)*height/2,w:width/2,h:height/2}));
}
function videoFor(stream){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.autoplay=true;v.srcObject=stream;v.play().catch(()=>{});return v;}
function drawVideo(ctx,v,rect,label=''){
 ctx.fillStyle='#14141b';ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
 if(v?.readyState>=2&&v.videoWidth&&v.videoHeight){const scale=Math.min(rect.w/v.videoWidth,rect.h/v.videoHeight),w=v.videoWidth*scale,h=v.videoHeight*scale;ctx.drawImage(v,rect.x+(rect.w-w)/2,rect.y+(rect.h-h)/2,w,h);}
 if(label){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(rect.x+8,rect.y+rect.h-30,Math.min(rect.w-16,Math.max(75,label.length*8+16)),23);ctx.fillStyle='#fff';ctx.font='14px system-ui';ctx.fillText(label.slice(0,28),rect.x+15,rect.y+rect.h-13);}
}
export function createCamera({onNotice=()=>{}}={}){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
 const ctx=canvas.getContext('2d');if(!canvas.captureStream)throw Error('This browser cannot use the live studio. Please use an updated Safari or Chrome.');
 const output=canvas.captureStream(24);let primary,secondary,mic,mode='front',orientation='stack',dual=false,closed=false,muted=false,hidden=false;
 const monitors=new WeakMap();
 const live=v=>cameraFrameHealthy(v,monitors.get(v));
 const modeFor=(v,fallback)=>v?.srcObject?.getVideoTracks()[0]?.getSettings().facingMode==='environment'?'back':v?.srcObject?.getVideoTracks()[0]?.getSettings().facingMode==='user'?'front':fallback;
 function observe(stream){const v=videoFor(stream);monitors.set(v,monitorCameraFrames(v));return v;}
 function collapse(){dual=false;if(!live(primary)&&live(secondary)){stopVideo(primary);primary=secondary;secondary=null;}else{stopVideo(secondary);secondary=null;}mode=modeFor(primary,mode==='back'?'back':'front');}
 const timer=setInterval(()=>{
  if(closed)return;ctx.fillStyle='#08080d';ctx.fillRect(0,0,640,360);
  if(dual&&!hidden&&(!live(primary)||!live(secondary))){collapse();onNotice('One camera paused or stopped. The working camera now fills the screen.');}
  const feeds=dual&&live(primary)&&live(secondary)?[primary,secondary]:live(primary)?[primary]:live(secondary)?[secondary]:[];
  if(!hidden)feeds.forEach((v,i)=>drawVideo(ctx,v,liveLayout(feeds.length,640,360,orientation)[i]));
 },1000/24);
 const stopVideo=v=>{monitors.get(v)?.close();v?.srcObject?.getVideoTracks().forEach(t=>t.stop());if(v){v.pause();v.srcObject=null;}};
 async function capture(facing,audio=false,deviceId,exactFacing=false){return navigator.mediaDevices.getUserMedia({video:{...(deviceId?{deviceId:{exact:deviceId}}:{facingMode:{ideal:facing}}),...(exactFacing?{facingMode:{exact:facing}}:{}),width:{ideal:640},height:{ideal:360},frameRate:{ideal:24,max:30}},audio:audio?{echoCancellation:true,noiseSuppression:true,autoGainControl:true}:false});}
 async function ready(v){await v.play();const end=performance.now()+6000;while(!live(v)){if(closed||v.srcObject?.getVideoTracks()[0]?.readyState==='ended'||performance.now()>end)throw Error('Camera did not start.');await new Promise(r=>setTimeout(r,80));}}

 async function single(next='front'){
  dual=false;stopVideo(secondary);secondary=null;stopVideo(primary);primary=null;
  const stream=await capture(next==='back'?'environment':'user',!mic);
  if(closed){stream.getTracks().forEach(t=>t.stop());return;}
  if(!mic){mic=stream.getAudioTracks()[0];if(mic){mic.enabled=!muted;output.addTrack(mic);}}
  stream.getVideoTracks().forEach(t=>t.enabled=!hidden);primary=observe(stream);await ready(primary);mode=modeFor(primary,next);
 }
 async function start(){if(closed)throw Error('This studio is closed.');if(!navigator.mediaDevices?.getUserMedia)throw Error('Open the studio in Safari or Chrome over HTTPS.');if(!live(primary))await single(mode==='back'?'back':'front');return output;}
 async function apply(next,nextOrientation='stack'){
  if(closed)throw Error('This studio is closed.');orientation=nextOrientation==='side'?'side':'stack';
  if(next!=='both'){await single(next==='back'?'back':'front');return {mode,dual:false};}
  if(hidden)throw Error('Turn Camera on before choosing Both cameras.');
  if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&/Version\/.*Safari/.test(navigator.userAgent))throw Error('Safari on this iPhone or iPad supports one camera at a time. Choose Front or Back. Your current camera stays full screen.');
  await start();if(dual&&live(primary)&&live(secondary))return {mode:'both',dual:true};
  const previousMode=mode,first=primary.srcObject.getVideoTracks()[0],settings=first.getSettings();
  const facing=settings.facingMode==='environment'?'user':'environment';
  const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput'&&d.deviceId&&d.deviceId!==settings.deviceId);
  const labels=facing==='user'?/front|user|facetime/i:/back|rear|environment/i;
  const other=devices.find(d=>labels.test(d.label))||devices[0];
  if(!other)throw Error('This browser only exposes one camera. You can invite a second device for another angle.');
  onNotice('Checking both cameras… Your screen splits only when both are live.');
  try{
   const stream=await capture(facing,false,other.deviceId,['user','environment'].includes(settings.facingMode));
   if(closed){stream.getTracks().forEach(t=>t.stop());throw Error('Studio closed.');}
   secondary=observe(stream);await ready(secondary);
   await verifyConcurrentCameras(primary,secondary,[monitors.get(primary),monitors.get(secondary)]);
   // Put the front feed above the back feed when the browser identifies them.
   if(settings.facingMode==='environment'){const swap=primary;primary=secondary;secondary=swap;}
   dual=true;mode='both';return {mode,dual:true};
  }catch(e){
   if(closed)throw Error('Studio closed.');
   collapse();if(!live(primary))try{await single(previousMode==='back'?'back':'front');}catch{throw Error('The browser paused the camera. Choose Front camera or Back camera to reconnect it.');}
   throw Error('This phone or browser could not keep both cameras live together. '+(mode==='back'?'The back camera':'One camera')+' stays full screen. Invite a second device for another angle.');
  }
 }

 function mute(value){muted=value;if(mic)mic.enabled=!value;}
 function hide(value){hidden=value;for(const v of [primary,secondary])v?.srcObject?.getVideoTracks().forEach(t=>t.enabled=!value);}
 function dispose(){closed=true;clearInterval(timer);stopVideo(primary);stopVideo(secondary);mic?.stop();output.getTracks().forEach(t=>t.stop());}
 return {canvas,stream:output,start,apply,mute,hide,dispose,state:()=>({mode,dual})};
}
export function createLiveMixer(){
 const audio=new (window.AudioContext||window.webkitAudioContext)();const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
 const ctx=canvas.getContext('2d'),video=canvas.captureStream(24),destination=audio.createMediaStreamDestination(),compressor=audio.createDynamicsCompressor();compressor.connect(destination);
 const output=new MediaStream([...video.getVideoTracks(),...destination.stream.getAudioTracks()]);const feeds=new Map(),returns=new Map();let disposed=false;
 function wire(feed){if(feed.source||!feed.stream.getAudioTracks().length)return;feed.source=audio.createMediaStreamSource(feed.stream);feed.gain=audio.createGain();feed.gain.gain.value=feed.muted?0:1;feed.source.connect(feed.gain);feed.gain.connect(compressor);if(feed.id!=='host')feed.gain.connect(audio.destination);for(const [id,dest]of returns)if(id!==feed.id)feed.gain.connect(dest);}
 function set(id,stream,label){let feed=feeds.get(id);if(feed?.stream!==stream){remove(id);feed={id,stream,label,video:videoFor(stream),muted:false};feeds.set(id,feed);}wire(feed);}
 function remove(id){const feed=feeds.get(id);if(!feed)return;feed.source?.disconnect();feed.gain?.disconnect();feed.video.pause();feed.video.srcObject=null;feeds.delete(id);}
 function mute(id,value){const feed=feeds.get(id);if(feed){feed.muted=value;if(feed.gain)feed.gain.gain.value=value?0:1;}}
 function forGuest(id){let dest=returns.get(id);if(!dest){dest=audio.createMediaStreamDestination();returns.set(id,dest);for(const feed of feeds.values())if(feed.id!==id)feed.gain?.connect(dest);}return new MediaStream([...output.getVideoTracks(),...dest.stream.getAudioTracks()]);}
 function removeGuest(id){remove(id);const dest=returns.get(id);if(dest){for(const feed of feeds.values())try{feed.gain?.disconnect(dest);}catch{}dest.stream.getTracks().forEach(t=>t.stop());returns.delete(id);}}
 const timer=setInterval(()=>{const active=[...feeds.values()].filter(f=>f.video.readyState>=2&&f.stream.getVideoTracks().some(t=>t.readyState==='live'&&!t.muted)).slice(0,4);ctx.fillStyle='#08080d';ctx.fillRect(0,0,640,360);const rects=liveLayout(active.length);active.forEach((feed,i)=>drawVideo(ctx,feed.video,rects[i],active.length>1?feed.label:''));},1000/24);
 async function dispose(){if(disposed)return;disposed=true;clearInterval(timer);for(const id of [...feeds.keys()])remove(id);for(const id of [...returns.keys()])removeGuest(id);output.getTracks().forEach(t=>t.stop());await audio.close();}
 return {canvas,stream:output,set,remove:removeGuest,mute,forGuest,resume:()=>audio.resume(),dispose};
}
