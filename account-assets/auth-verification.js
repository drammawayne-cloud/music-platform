import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
// Real email verification: the URL alone never proves verification.
// The account service must accept the token and confirm email_confirmed_at.
export const accountDestination=(site,role)=>(role==='artist'?'/portal.html':'/account.html')+'?site='+encodeURIComponent(currentSite)+'&role='+encodeURIComponent(role);
export function verificationScreen({title,copy,email='',action,actionText='Continue',secondary,secondaryText='Use another email'}){
 document.querySelector('[data-verification-screen]')?.remove();
 const dialog=document.createElement('dialog');dialog.dataset.verificationScreen='';dialog.setAttribute('aria-label',title);Object.assign(dialog.style,{padding:'0',border:'1px solid #b79a64',borderRadius:'18px',background:'#211e18',color:'#f7efdE',maxWidth:'500px',width:'calc(100% - 40px)'});
 const box=document.createElement('section');Object.assign(box.style,{padding:'36px',fontFamily:'system-ui,sans-serif',lineHeight:'1.6'});
 const h=document.createElement('h1');h.textContent=title;h.style.fontSize='26px';const p=document.createElement('p');p.textContent=copy;const address=document.createElement('p');address.textContent=email;address.style.color='#d8bd83';const status=document.createElement('p');status.setAttribute('role','status');
 box.append(h,p,address,status);const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;Object.assign(b.style,{padding:'12px 16px',margin:'8px 8px 0 0',border:'1px solid #b89a61',borderRadius:'8px',background:'#c4a362',color:'#211c14',font:'600 13px system-ui',cursor:'pointer'});b.onclick=async()=>{b.disabled=true;try{await fn(status,dialog);}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};return b;};
 if(action)box.append(button(actionText,action));if(secondary)box.append(button(secondaryText,secondary));dialog.append(box);document.body.append(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());dialog.showModal();return {dialog,box,status,button};
}
export function waitForVerification({email,site,role,resend,onSignIn}){
 try{sessionStorage.setItem('rr_pending_verification',JSON.stringify({email,site,role}));}catch{}
 const retryKey='rr_email_retry_'+email.trim().toLowerCase();let retryAt=Date.now()+60000;try{retryAt=Math.max(retryAt,Number(sessionStorage.getItem(retryKey))||0);}catch{}
 const screen=verificationScreen({title:'Check your email for verification',email,copy:'Open the verification link we sent you. Your private account stays locked until your email is verified. Check your spam folder too.',actionText:'I’ve verified — sign in',action:async(_,d)=>{sessionStorage.removeItem('rr_pending_verification');d.close();d.remove();onSignIn();},secondaryText:'Resend verification email',secondary:async status=>{if(Date.now()<retryAt)throw Error('Please wait '+Math.ceil((retryAt-Date.now())/1000)+' seconds before requesting another email.');if(!resend)throw Error('Email resend is unavailable. Return to Sign In.');try{await resend();retryAt=Date.now()+60000;status.textContent='If this account needs verification, another email is on its way.';}catch(e){retryAt=Date.now()+(/rate.limit/i.test(e.message)?900000:60000);throw e;}finally{try{sessionStorage.setItem(retryKey,String(retryAt));}catch{}}}});
 screen.box.append(screen.button('Use another email',async(_,d)=>{sessionStorage.removeItem('rr_pending_verification');d.close();d.remove();onSignIn();}));
 screen.dialog.style.boxShadow='0 0 0 100vmax #080707e6';return screen;
}
export async function handleAuthCallback(){
 const q=new URLSearchParams(location.search),hash=new URLSearchParams(location.hash.slice(1)),type=hash.get('type');
 if(!hash.has('access_token')&&!q.has('verified')&&!q.has('recovery'))return false;
 const site=currentSite,role=['artist','staff','customer'].includes(q.get('role'))?q.get('role'):'customer';
 const token=hash.get('access_token');history.replaceState(null,'',location.pathname+'?site='+site+'&role='+role);
 const screen=verificationScreen({title:'Checking your verification…',copy:'Confirming your email securely with your account provider.'});
 try{
  if(!token)throw Error(hash.get('error_description')||'This verification link is missing or has expired. Request a new email from Sign In.');
  const config=await(await fetch('/api/addon/config')).json();const response=await fetch(config.supabaseUrl+'/auth/v1/user',{headers:{apikey:config.publishableKey,Authorization:'Bearer '+token}});const user=await response.json();if(!response.ok||!user.email_confirmed_at)throw Error('Your email has not been verified. Please request a new verification link.');
  saveSession({access_token:token,refresh_token:hash.get('refresh_token'),expires_in:Number(hash.get('expires_in')||3600)});sessionStorage.removeItem('rr_pending_verification');screen.dialog.close();screen.dialog.remove();
  const next=()=>location.replace(accountDestination(site,role));
  if(type==='invite'||type==='recovery'||q.has('recovery')){
   const view=verificationScreen({title:type==='invite'?'Email verified. Set your password.':'Choose your new password',copy:'Your account has been verified. Choose a password to finish setting up secure access.'});
   const form=document.createElement('form');for(const [name,label]of [['password','New password'],['confirm','Confirm password']]){const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement('input');Object.assign(input,{name,type:'password',required:true,minLength:8,maxLength:128,autocomplete:'new-password'});Object.assign(input.style,{display:'block',width:'100%',padding:'12px',margin:'8px 0 15px',borderRadius:'8px',border:'1px solid #b69b65'});wrap.append(input);form.append(wrap);}const submit=document.createElement('button');submit.type='submit';submit.textContent='Save password & continue';Object.assign(submit.style,{padding:'12px',borderRadius:'8px',background:'#c4a362',border:'0',cursor:'pointer'});form.append(submit);view.box.append(form);form.onsubmit=async e=>{e.preventDefault();if(form.elements.password.value!==form.elements.confirm.value){view.status.textContent='The passwords do not match.';return;}submit.disabled=true;try{const r=await fetch(config.supabaseUrl+'/auth/v1/user',{method:'PUT',headers:{apikey:config.publishableKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({password:form.elements.password.value})});if(!r.ok)throw Error('Password could not be saved. Request a fresh recovery email.');form.reset();next();}catch(err){view.status.textContent=err.message;submit.disabled=false;}};
  }else if(type==='oauth'){
   if(role!=='artist'){const r=await fetch('/api/addon/account-roles',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Rich-Row-Request':'1'},body:JSON.stringify({site,role})});if(!r.ok){const b=await r.json();throw Error(b.error||'Account access could not be checked.');}}
   next();
  }else verificationScreen({title:'Email successfully verified',copy:role==='customer'?'Your customer account is ready. Continue to your membership.':'Your email is verified. Back-office access requires label approval unless you were already added by the owner.',actionText:'Continue to my portal',action:next});
 }catch(e){screen.dialog.close();screen.dialog.remove();verificationScreen({title:'Verification needs another step',copy:e.message,actionText:'Return to Sign In',action:()=>location.replace(accountDestination(site,role)+'&signin=1')});}
 return true;
}
