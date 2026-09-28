// Shared Rich Row presentation. Content integrations continue to live in app.js.
const header = document.querySelector('header');
const nav = header?.querySelector('nav');
if (header && nav) {
  const skip = document.createElement('a');
  skip.className = 'rr-skip'; skip.href = '#main-content'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);
  const main = document.querySelector('main');
  if (main) main.id = 'main-content';
  nav.id = 'rr-navigation'; nav.setAttribute('aria-label', 'Main navigation');
  const base = new URL('../', import.meta.url);
  const add = (label, path) => {
    if (![...nav.querySelectorAll('a')].some(a => a.textContent.trim() === label)) {
      const a = document.createElement('a'); a.href = new URL(path, base); a.textContent = label; nav.append(a);
    }
  };
  add('Radio & Live', 'radio.html');
  add('Releases', 'releases.html');
  add('Distribution', 'distribution.html');
  add('Merch', 'merch.html');
  add('Movies', 'movies.html');
  const links = [...nav.querySelectorAll('a')];
  // Deduplicate legacy navigation additions, preserving the first working destination.
  const seen = new Set();
  for (const link of links) {
    const key = link.textContent.trim().toLowerCase();
    if (seen.has(key)) link.remove(); else seen.add(key);
  }
  const currentPath = new URL(location.href).pathname.replace(/\/$/, '/index.html');
  for (const link of nav.querySelectorAll('a')) {
    if (new URL(link.href).pathname === currentPath) link.setAttribute('aria-current', 'page');
  }
  const primary = new Set(['Home','Music','Artists','Radio & Live','Videos','Services']);
  const extra = document.createElement('div'); extra.className = 'rr-nav-extra';
  const extraButton = document.createElement('button'); extraButton.type = 'button';
  extraButton.textContent = 'Explore +'; extraButton.setAttribute('aria-expanded','false');
  extraButton.setAttribute('aria-controls','rr-extra-links');
  const extraList = document.createElement('div'); extraList.id = 'rr-extra-links';
  extraList.className = 'rr-nav-extra-list'; extraList.hidden = true;
  for (const link of [...nav.querySelectorAll('a')]) if (!primary.has(link.textContent.trim())) extraList.append(link);
  extra.append(extraButton, extraList); nav.append(extra);
  const actions = document.createElement('div'); actions.className = 'rr-header-actions';
  const themeButton=document.createElement('button');themeButton.type='button';themeButton.className='rr-theme-toggle';
  const setTheme=mode=>{document.documentElement.dataset.theme=mode;themeButton.textContent=mode==='dark'?'☀ Light':'◐ Dark';themeButton.setAttribute('aria-label',mode==='dark'?'Switch to light mode':'Switch to dark mode');themeButton.setAttribute('aria-pressed',String(mode==='dark'));try{localStorage.setItem('richrow-theme',mode)}catch{}};
  let saved='light';try{saved=localStorage.getItem('richrow-theme')==='dark'?'dark':'light'}catch{}setTheme(saved);themeButton.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  actions.append(themeButton);
  const cart = document.createElement('a'); cart.className = 'rr-cart-icon';
  cart.href = 'https://console.richrowmusic.com/addons/cart';
  cart.setAttribute('aria-label','Shopping cart'); cart.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.2 11.5a2 2 0 0 0 2 1.6h10.3a2 2 0 0 0 2-1.6L22 7H5"/></svg>';
  const menu = document.createElement('button'); menu.className = 'rr-menu-toggle';
  menu.type = 'button'; menu.setAttribute('aria-controls', nav.id);
  const setMenu = open => { nav.classList.toggle('rr-open',open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label',open?'Close menu':'Open menu'); menu.textContent=open?'✕':'☰'; };
  const setExtra = open => { extraList.hidden = !open; extraButton.setAttribute('aria-expanded',String(open)); };
  setMenu(false); actions.append(cart,menu); header.append(actions);
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  extraButton.addEventListener('click',()=>setExtra(extraList.hidden));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){setMenu(false);setExtra(false);menu.focus();}});
  document.addEventListener('click',event=>{if(!header.contains(event.target)){setMenu(false);setExtra(false);}else if(!extra.contains(event.target))setExtra(false);});
  nav.addEventListener('click',event=>{if(event.target.closest('a')){setMenu(false);setExtra(false);}});
  for (const card of document.querySelectorAll('.grid > .card')) {
    if (!card.querySelector('.rr-card-index')) {
      const index = document.createElement('span'); index.className = 'rr-card-index';
      index.textContent = String([...card.parentElement.children].indexOf(card)+1).padStart(2,'0');
      card.prepend(index);
    }
  }
}
