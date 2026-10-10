import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
export function distinctCameraSources(a,b){
 const first=a?.getSettings?.()||{},second=b?.getSettings?.()||{};
 if(!a||!b||a===b||a.id===b.id)return false;
 if(first.deviceId&&second.deviceId)return first.deviceId!==second.deviceId;
 return ['user','environment'].includes(first.facingMode)&&['user','environment'].includes(second.facingMode)&&first.facingMode!==second.facingMode;
}
export function monitorCameraFrames(video,{now=()=>performance.now()}={}){
 let count=0,lastAt=-Infinity,closed=false,callback,timer,previous;
 const seen=()=>{count++;lastAt=now();};
 if(video.requestVideoFrameCallback){const frame=()=>{if(closed)return;seen();callback=video.requestVideoFrameCallback(frame);};callback=video.requestVideoFrameCallback(frame);}
 else{timer=setInterval(()=>{const current=video.getVideoPlaybackQuality?.().totalVideoFrames??video.webkitDecodedFrameCount;if(Number.isFinite(current)&&current!==previous){if(previous!==undefined)seen();previous=current;}},80);}
 return {sample:()=>({count,lastAt}),close(){closed=true;clearInterval(timer);if(callback!==undefined)video.cancelVideoFrameCallback?.(callback);}};
}
export function cameraFrameHealthy(video,monitor,now=performance.now()){
 const track=video?.srcObject?.getVideoTracks()[0],sample=monitor?.sample();
 return !!(track&&track.readyState==='live'&&!track.muted&&video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0&&sample&&now-sample.lastAt<1500);
}
export async function verifyConcurrentCameras(first,second,monitors,{now=()=>performance.now(),delay=ms=>new Promise(r=>setTimeout(r,ms)),timeout=4000}={}){
 const a=first?.srcObject?.getVideoTracks()[0],b=second?.srcObject?.getVideoTracks()[0];
 if(!distinctCameraSources(a,b))throw Error('Two distinct camera sources are required.');
 const start=now(),initial=monitors.map(m=>m.sample().count);
 while(now()-start<timeout){
  if([a,b].some(t=>t.readyState!=='live'||t.muted))throw Error('Opening the second camera interrupted the first.');
  if(now()-start>=800&&[first,second].every((v,i)=>cameraFrameHealthy(v,monitors[i],now())&&monitors[i].sample().count-initial[i]>=3&&now()-monitors[i].sample().lastAt<400))return;
  await delay(100);
 }
 throw Error('Both cameras must deliver live frames together.');
}
