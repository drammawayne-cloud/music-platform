import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261010-cover';
export function el(tag,attrs={},...children){const node=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(v===null||v===undefined)continue;if(k.startsWith('on'))node.addEventListener(k.slice(2),v);else if(k==='href')node.href=localLink(v);else if(k==='class')node.className=v;else if(k in node)node[k]=v;else node.setAttribute(k,String(v));}for(const c of children.flat()){if(c!==null&&c!==undefined)node.append(c instanceof Node?c:document.createTextNode(String(c)));}return node;}
export function renderBlock(b){const box=el('section',{class:'element'});if(b.hidden)return box;
 if(b.title)box.append(el(b.type==='heading'?'h2':'h3',{},b.title));if(b.body)box.append(el('p',{class:'prewrap'},b.body));
 const link=(href,label)=>el('a',{href,class:'cta',...(href.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{})},label);
 if(['button','distribution'].includes(b.type))box.append(link(b.url,b.label||'Submit Music'));
 if(['youtube','vimeo'].includes(b.type))box.append(el('iframe',{src:b.url,title:b.title||'Video player',loading:'lazy',allow:'fullscreen; picture-in-picture',referrerPolicy:'strict-origin-when-cross-origin',allowFullscreen:true}));
 if(['instagram','tiktok','facebook','x'].includes(b.type))box.append(link(b.url,b.label||'View on '+b.type));
 if(['image','cover','release'].includes(b.type)&&b.media)box.append(el('img',{src:b.media.url,alt:b.title||b.media.name,loading:'lazy'}));
 if(b.type==='gallery')box.append(el('div',{class:'grid'},(b.media||[]).map(m=>el('img',{src:m.url,alt:m.name,loading:'lazy'}))));
 if(['audio','video'].includes(b.type)&&b.media)box.append(el(b.type,{src:b.media.url,controls:true,preload:'metadata'}));
 if(b.type==='release')box.append(el('p',{},b.artist),link('/addons/store?product='+b.productId,b.label||'Buy & Download'));
 if(b.type==='radio')box.append(link('/addons/radio',b.label||'Listen Live'));
 if(b.type==='divider')box.append(el('hr'));if(b.type==='spacer')box.style.height=b.height+'px';return box;
}
