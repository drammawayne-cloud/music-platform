/** Shared player for authorized streaming URLs or local file previews.
 * Decorative motion follows playback state. It is not an audio waveform or paid-play counter.
 * The caller must obtain authorized access before setting src; this component grants no access.
 */
export class RichRowAudioPlayer extends HTMLElement {
 static observedAttributes=['src','track-title'];
 constructor(){
  super();this.attachShadow({mode:'open'});
  this.shadowRoot.innerHTML=`<style>
  :host{display:block;color:#f3f1e9;font-family:system-ui,sans-serif}.player{background:linear-gradient(130deg,#24291e,#111510);border:1px solid #555039;border-radius:14px;padding:22px;overflow:hidden}.top{display:flex;gap:18px;align-items:center}.art{flex-shrink:0;width:76px;height:76px;display:grid;place-items:center;border-radius:50%;background:repeating-radial-gradient(circle,#141611 0 5px,#303525 6px 7px);border:1px solid #6d6540}.art span{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#d9b568;color:#151910;font-weight:800;font-size:12px}.title{font-size:17px;font-weight:600;margin:0;overflow-wrap:anywhere}.label{color:#d9b568;font-size:11px;letter-spacing:2px;margin:0 0 7px}.status{color:#aab29c;font-size:13px;margin:5px 0 0}.motion{display:flex;align-items:center;height:48px;gap:4px;margin:18px 0 5px;overflow:hidden}.motion i{display:block;flex:1;background:linear-gradient(#edcf84,#8a7647);height:var(--height);border-radius:3px;transform:scaleY(.18);transform-origin:center;transition:transform .3s}.playing .motion i{animation:pulse var(--speed) ease-in-out infinite alternate;animation-delay:var(--delay)}.playing .art{animation:spin 9s linear infinite}.error{color:#ffc1a5;font-size:14px;margin:12px 0 0}audio{display:block;width:100%;min-width:0;margin-top:12px;color-scheme:dark}button{font:inherit;background:#d9b568;color:#171b11;border:0;padding:9px 14px;border-radius:5px;margin-top:12px;cursor:pointer}button:focus-visible{outline:2px solid white;outline-offset:3px}[hidden]{display:none!important}@keyframes pulse{from{transform:scaleY(.2)}to{transform:scaleY(1)}}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.playing .motion i{transform:scaleY(.55)}}@media(max-width:420px){.player{padding:16px}.art{width:60px;height:60px}.top{gap:12px}}
  </style><section class="player"><div class="top"><div class="art" aria-hidden="true"><span>RR</span></div><div><p class="label">RICH ROW MUSIC</p><h3 class="title"></h3><p class="status" role="status">Ready to play</p></div></div><div class="motion" aria-hidden="true">${Array.from({length:38},(_,i)=>`<i style="--height:${12+(i*17)%35}px;--speed:${.3+(i%7)*.11}s;--delay:-${i*.08}s"></i>`).join('')}</div><audio controls preload="none" playsinline></audio><p class="error" role="alert" hidden></p><button type="button" hidden>Retry playback</button></section>`;
  this.audio=this.shadowRoot.querySelector('audio');
  this.panel=this.shadowRoot.querySelector('.player');
  this.status=this.shadowRoot.querySelector('.status');
  this.error=this.shadowRoot.querySelector('.error');
  this.retry=this.shadowRoot.querySelector('button');
  this.onOtherPlayback=e=>{if(e.detail!==this)this.audio.pause();};
  for(const event of ['playing','pause','ended','waiting','error','emptied'])this.audio.addEventListener(event,()=>this.updateState(event));
  this.retry.onclick=()=>{this.audio.load();this.audio.play().catch(()=>this.updateState('error'));};
 }
 connectedCallback(){window.addEventListener('rich-row-playback',this.onOtherPlayback);this.sync();}
 disconnectedCallback(){this.audio.pause();window.removeEventListener('rich-row-playback',this.onOtherPlayback);this.audio.removeAttribute('src');this.audio.load();}
 attributeChangedCallback(){if(this.isConnected)this.sync();}
 sync(){
  this.shadowRoot.querySelector('.title').textContent=this.getAttribute('track-title')||'Untitled track';
  this.audio.setAttribute('aria-label','Play '+(this.getAttribute('track-title')||'track'));
  const src=this.getAttribute('src')||'';
  if(src===this.currentSource)return;this.currentSource=src;
  this.audio.pause();this.audio.removeAttribute('src');
  if(src){try{const url=new URL(src,location.href);if(url.protocol!=='https:'&&!(url.protocol==='blob:'&&url.origin===location.origin))throw Error();this.audio.src=url.href;this.error.hidden=true;this.retry.hidden=true;this.status.textContent='Ready to play';}catch{this.error.textContent='This audio source is not supported.';this.error.hidden=false;this.status.textContent='Audio unavailable';}}
  else this.status.textContent='No audio attached';
 }
 updateState(event){
  this.panel.classList.toggle('playing',event==='playing');
  const messages={playing:'Now playing',pause:'Paused',ended:'Finished',waiting:'Buffering…',emptied:'Ready to play',error:'Audio unavailable'};
  this.status.textContent=messages[event];
  if(event==='playing'){window.dispatchEvent(new CustomEvent('rich-row-playback',{detail:this}));this.error.hidden=true;this.retry.hidden=true;}
  if(event==='error'){this.error.textContent='The track could not be played. Its link may have expired or the format may not be supported.';this.error.hidden=false;this.retry.hidden=false;}
 }
}
if(!customElements.get('rr-audio-player'))customElements.define('rr-audio-player',RichRowAudioPlayer);
