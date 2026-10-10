let catalog;
async function artCatalog(){if(!catalog)catalog=fetch(new URL('./crate-catalog.js?v=20261010-coveron',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Artwork unavailable');return r.json();});return catalog;}
export async function mountCrateGallery(card,record){
 const front=card.querySelector('img');if(!front)return;
 try{
  const entry=(await artCatalog()).find(e=>e.title===record.title);if(!entry)return;
  const controls=document.createElement('div');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:12px 0';
  const frontButton=document.createElement('button');frontButton.type='button';frontButton.textContent='Front cover';frontButton.setAttribute('aria-pressed','true');
  const backButton=document.createElement('button');backButton.type='button';backButton.textContent='Back / song list';backButton.setAttribute('aria-pressed','false');
  const back=document.createElement('div');back.hidden=true;
  const backImage=document.createElement('img');backImage.src=entry.back;backImage.alt=record.title+' back cover — complete numbered track list';backImage.loading='lazy';backImage.style.cssText='width:100%;border-radius:12px;';
  const full=document.createElement('a');full.href=entry.back;full.target='_blank';full.rel='noopener';full.textContent='Open full-size back cover ↗';
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Read all '+entry.tracks.length+' songs';details.append(summary);
  const list=document.createElement('ol');list.style.cssText='max-height:400px;overflow:auto;line-height:1.6;padding-left:30px';
  for(const track of entry.tracks){const li=document.createElement('li');li.textContent=(track.artist?track.artist+' — ':'')+track.title;list.append(li);}details.append(list);back.append(backImage,full,details);
  const show=isBack=>{front.hidden=isBack;front.style.display=isBack?'none':'block';back.hidden=!isBack;frontButton.setAttribute('aria-pressed',String(!isBack));backButton.setAttribute('aria-pressed',String(isBack));};
  frontButton.onclick=()=>show(false);backButton.onclick=()=>show(true);controls.append(frontButton,backButton);front.after(controls,back);
 }catch{ /* The existing front artwork and purchase link remain usable. */ }
}
