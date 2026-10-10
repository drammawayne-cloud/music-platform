import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
// MediaRecorder may batch many seconds into one Blob. Preserve every byte in order,
// split transport frames, and wait for backpressure instead of ending a healthy live.
export function createMediaSender({socket,onError,interval=setInterval,clear=clearInterval}){
 const queue=[];let queued=0,closed=false;
 function close(){if(closed)return;closed=true;clear(timer);queue.length=0;queued=0;}
 function fail(message){close();onError(message);}
 function flush(){
  if(closed||!queue.length)return;
  if(socket.readyState!==1){fail('The live connection was interrupted. Open a new studio to reconnect.');return;}
  if(socket.bufferedAmount>1024*1024)return;
  const item=queue[0],end=Math.min(item.offset+256*1024,item.blob.size);
  try{socket.send(item.blob.slice(item.offset,end));}catch{fail('The live connection was interrupted. Open a new studio to reconnect.');return;}
  queued-=end-item.offset;item.offset=end;if(end===item.blob.size)queue.shift();
 }
 const timer=interval(flush,25);
 function push(blob){if(closed||!blob.size)return;if(queued+blob.size>32*1024*1024){fail('Your upload connection cannot keep up with the live video. Check the connection and open a new studio.');return;}queue.push({blob,offset:0});queued+=blob.size;flush();}
 return {push,close};
}
