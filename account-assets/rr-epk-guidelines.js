import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js';
export function epkGuidelines(el){
 const box=el('section',{class:'card'},el('h3',{},'EPK guidelines — read before publishing'),el('p',{},'An Electronic Press Kit introduces an artist to promoters, venues and media. Requirements vary by recipient; there is no single universal EPK rulebook. The checklist below is Rich Row’s publishing review, not an industry certification.'));
 const items=[
 ['Artist identity & biography','Use the correct stage name and a clear introduction to the sound, background and current project. Prepare short and longer versions for different recipients.'],
 ['Press photos','Include clear, current high-resolution portraits and performance images where available. Offer useful crops and identify photo credits.'],
 ['Music & video','Lead with your strongest representative tracks and working listening links. Add an official video; for booking, a good live performance clip is useful.'],
 ['Evidence & contact','Include genuine press links, sourced quotations, achievements, current social links and a business contact for booking or media. Omit claims you cannot substantiate.'],
 ['How to build it here','Upload public images in Media Library. Use Add Element for text, images, audio, HTTPS buttons and YouTube/Vimeo videos. Arrange them under the section headings. Save with Publish unchecked while unfinished. Preview, review, then publish.'],
 ['Before sharing','Follow the recipient’s requested format and limits. Check spelling, credits, permissions, links and mobile layout. Keep private addresses and financial information out. Recheck the public URL after publishing; update the kit when your music or contact details change.']
 ];for(const [title,body] of items)box.append(el('h4',{},title),el('p',{},body));
 box.append(el('p',{},'Publishing displays the EPK on the artist’s Biography page and separate EPK page. It does not send an email or submit an application. The EPK page offers Print / save as PDF; use the web link for playable media.'),el('p',{},'Further guidance: ',el('a',{href:'https://bandzoogle.com/blog/the-8-things-that-should-be-in-every-band-s-digital-press-kit',target:'_blank',rel:'noopener'},'Bandzoogle EPK essentials'),' · ',el('a',{href:'https://bandzoogle.com/help/articles/379-creating-an-epk',target:'_blank',rel:'noopener'},'Creating an EPK')));return box;
}
export function epkChecklist(el){const box=el('fieldset',{'data-epk-review':''},el('legend',{},'Required review before publishing'));
 for(const text of ['I reviewed the EPK guidelines and any recipient-specific requirements.','The artist identity and biography are correct, and photos are ready with permission and credits.','Music/video links work, the booking contact is current, and all claims are accurate.','I previewed the layout and removed unfinished placeholders or private information.'])box.append(el('label',{},el('input',{type:'checkbox'}),text));return box;}
export function requireEpkReview(form){if([...form.querySelectorAll('[data-epk-review] input')].some(x=>!x.checked))throw Error('Complete the EPK review checklist before publishing. You can save an unchecked draft at any time.');}

