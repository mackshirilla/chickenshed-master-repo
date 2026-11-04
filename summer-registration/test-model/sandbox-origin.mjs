// The isolated sandbox may return to the unpublished staging page or the
// dedicated loopback test page. Never accept an arbitrary redirect origin.
export function sandboxReturnOrigin(headers) {
  const staging='https://chickenshednyc2024.webflow.io';
  if(typeof headers==='string') {try{headers=JSON.parse(headers);}catch{headers=Object.fromEntries(headers.split(/\r?\n/).map(line=>{const i=line.indexOf(':');return [line.slice(0,i),line.slice(i+1).trim()];}));}}
  if(Array.isArray(headers))headers=Object.fromEntries(headers.map(entry=>Array.isArray(entry)?entry:[entry.name||entry.key,entry.value]));
  const origins=Object.entries(headers||{}).filter(([name])=>name.toLowerCase().replace(/^http[_-]/,'').replace(/_/g,'-')==='origin');
  const value=origins.length?origins[0][1]:staging;
  if(origins.length>1||!['http://127.0.0.1:4817',staging].includes(value)) {
    const error=new Error('Summer sandbox return origin is unavailable.');error.code='ENVIRONMENT';throw error;
  }
  return value;
}
