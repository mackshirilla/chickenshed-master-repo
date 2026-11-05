// Webflow page links follow the original page ID when its slug becomes the rollback slug.
// Keep those links on the current registration entry without changing legacy fulfillment.
export function currentRegistrationEntry(href,origin){
 try{const url=new URL(href,origin);if(url.origin!==origin||!['/program-registration-legacy','/program-registration-old','/lab-registration','/summer-camp-registration'].includes(url.pathname.replace(/\/$/,'')))return null;return '/program-registration'+url.search+url.hash;}catch{return null;}
}
export function repairRegistrationEntryLinks(doc=document,loc=window.location){
 const redirect=currentRegistrationEntry(loc.href,loc.origin);
 if(redirect){loc.replace(redirect);return true;}
 doc.querySelectorAll('a[href]').forEach(link=>{const target=currentRegistrationEntry(link.getAttribute('href'),loc.origin);if(target)link.setAttribute('href',target);});
 return false;
}
