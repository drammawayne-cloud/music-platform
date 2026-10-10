import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
export const types=['heading','text','button','divider','spacer','image','gallery','cover','audio','video','youtube','vimeo','instagram','tiktok','facebook','x','release','radio','distribution'];
export function fail(message){throw Object.assign(new Error(message),{status:400});}
export function text(v,max=200,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Enter valid text (maximum '+max+' characters).');return v.trim();}
export function url(v){try{const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password||v.length>2048)throw Error();return u.href;}catch{fail('Enter an HTTPS URL without a password.');}}
export function id(v){if(typeof v!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v))fail('Invalid record ID.');return v;}
export function videoURL(type,value){const u=new URL(url(value));let n;
 if(type==='youtube'){if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname))n=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)$/)?.[1];else if(u.hostname==='youtu.be')n=u.pathname.slice(1);if(!/^[\w-]{11}$/.test(n||''))fail('Enter a YouTube video link, not a channel or playlist.');return 'https://www.youtube-nocookie.com/embed/'+n;}
 if(type==='vimeo'){if(!['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)||!/^\/(?:video\/)?\d+$/.test(u.pathname))fail('Enter a public Vimeo video link.');return 'https://player.vimeo.com/video/'+u.pathname.split('/').pop();}
 const hosts={instagram:['instagram.com','www.instagram.com'],tiktok:['tiktok.com','www.tiktok.com'],facebook:['facebook.com','www.facebook.com','fb.watch'],x:['x.com','www.x.com','twitter.com','www.twitter.com']};
 if(!hosts[type]?.includes(u.hostname)||u.pathname==='/')fail('Enter a '+type+' profile or post URL.');return u.href;
}
export function block(b){if(!b||!types.includes(b.type))fail('Choose an element type.');const o={id:id(b.id),type:b.type,hidden:!!b.hidden,title:text(b.title||'',200),body:text(b.body||'',5000),label:text(b.label||'',80)};
 if(['button','distribution'].includes(b.type)){o.url=url(b.url);if(!o.label)fail('Enter a button label.');}
 if(['youtube','vimeo','instagram','tiktok','facebook','x'].includes(b.type))o.url=videoURL(b.type,b.url);
 if(['image','cover','audio','video','release'].includes(b.type))o.mediaId=id(b.mediaId);
 if(b.type==='release'){o.productId=id(b.productId);o.artist=text(b.artist,120,true);}
 if(b.type==='gallery'){if(!Array.isArray(b.mediaIds)||b.mediaIds.length<1||b.mediaIds.length>20)fail('Select 1–20 images.');o.mediaIds=b.mediaIds.map(id);}
 if(b.type==='spacer'){o.height=Number(b.height);if(!Number.isInteger(o.height)||o.height<8||o.height>160)fail('Spacing must be 8–160 pixels.');}
 if(['heading','text'].includes(b.type)&&!o.title&&!o.body)fail('Enter element text.');return o;
}
export function page(p){const slug=text(p.slug,80,true);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('Use lowercase letters, numbers and hyphens in the page address.');if(!Array.isArray(p.blocks)||p.blocks.length>100)fail('Maximum 100 elements per page.');const blocks=p.blocks.map(block);if(new Set(blocks.map(b=>b.id)).size!==blocks.length)fail('Duplicate element IDs.');return {slug,title:text(p.title,120,true),published:!!p.published,blocks};}

