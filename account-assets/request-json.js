import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
// Bound the complete request, including reading the response body.
export async function requestJSON(url,options={},timeoutMs=20000){
 const attempts=(options.method||'GET').toUpperCase()==='GET'?2:1;
 for(let attempt=0;attempt<attempts;attempt++){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(url,{...options,signal:controller.signal});
  let data;try{data=await response.json();}catch(e){if(controller.signal.aborted)throw e;throw Error('The server returned an incomplete response. Please try again.');}
  if(attempt+1<attempts&&[502,503,504].includes(response.status))continue;
  return {response,data};
 }catch(e){if(attempt+1<attempts)continue;if(controller.signal.aborted)throw Error('The connection took too long. Please try again.');throw e;}
 finally{clearTimeout(timer);}
 }
}

