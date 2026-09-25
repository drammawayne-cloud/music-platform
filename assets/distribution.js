// This form prepares an email. No server submission or email sending occurs here.
export function buildIntakeEmail(data){
 const fields=[['Artist Name',data.artist_name],['Full Name',data.full_name],['Artist Email',data.email],['Spotify ID (optional)',data.spotify_id||'Not provided'],['Apple Music ID (optional)',data.apple_music_id||'Not provided'],['Soundcloud ID (optional)',data.soundcloud_id||'Not provided'],['Performing rights organization (optional)',data.pro||'Not provided'],['IPI/CAE number (optional)',data.ipi||'Not provided']];
 return 'Hello Rich Row Music,\n\nPlease review my details for a Labelcaster artist invitation.\n\n'+fields.map(([label,value])=>label+': '+String(value).replace(/[\r\n]+/g,' ')).join('\n')+'\n\nThank you.';
}
const form=document.querySelector('#artist-form');
if(form){
 let emailBody='';
 form.addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(form));for(const key of Object.keys(data))data[key]=data[key].trim();emailBody=buildIntakeEmail(data);document.querySelector('#email-summary').textContent=emailBody;document.querySelector('#open-email').href='mailto:richrowrecords@gmail.com?subject='+encodeURIComponent('Rich Row artist invitation details — '+data.artist_name)+'&body='+encodeURIComponent(emailBody);form.hidden=true;document.querySelector('#email-review').hidden=false;document.querySelector('#review-title').focus();});
 document.querySelector('#edit-details').onclick=()=>{document.querySelector('#email-review').hidden=true;form.hidden=false;form.elements.artist_name.focus();};
 document.querySelector('#copy-email').onclick=async()=>{try{await navigator.clipboard.writeText(emailBody);document.querySelector('#copy-status').textContent='Copied. Paste these details into your email.';}catch{document.querySelector('#copy-status').textContent='Copy could not be completed. Select and copy the details above.';}};
}
