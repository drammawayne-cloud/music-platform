// Network-first navigation keeps prices and published content current.
// No account, payment, customer-chat or music-download responses are cached.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rich Row is offline</title><body style="background:#0b0912;color:#f3eefb;font:20px system-ui;padding:40px"><h1>Reconnect to Rich Row</h1><p>An internet connection is needed for music, your account and checkout.</p><a style="color:#edc16b" href="/">Try again</a></body>',{headers:{'Content-Type':'text/html; charset=utf-8'}})))});
