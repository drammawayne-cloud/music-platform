import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
const link=document.createElement('a');link.href='/addons/admin';link.textContent='Open Page Builder & Studio ↗';link.style.cssText='position:fixed;bottom:18px;right:18px;z-index:15;background:#edc16b;color:#17130d;padding:12px 18px;border-radius:10px;font:600 14px system-ui;text-decoration:none;box-shadow:0 3px 20px #0008';document.body.append(link);

