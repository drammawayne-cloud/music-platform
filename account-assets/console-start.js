import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
import {bootWorkspace} from './workspace-startup.js?v=startup-20261001';
const studio=location.pathname.startsWith('/addons/');
await bootWorkspace({target:document.querySelector(studio?'main':'#app'),moduleUrl:new URL(studio?'./rr-addon.js?v=startup-20261001':'../src/app.js?v=startup-20261001',import.meta.url).href});

