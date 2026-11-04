// Production-only transport; uses the existing app's auth_config token contract.
export function transport(root) {
 const base='https://xszy-vp96-kdkh.n7c.xano.io/api:summer26/summer';
 if(location.hostname!=='www.chickenshednyc.org'||root.dataset.summerApiBase!==base||root.dataset.summerApiTenant||root.dataset.summerDemo)throw new Error('Summer registration is unavailable.');
 return async(path,input)=>{
  let token;try{token=JSON.parse(localStorage.getItem('auth_config')||'{}').token;}catch{}
  if(!token)throw new Error('Please sign in to continue.');
  const response=await fetch(base+'/'+path,{method:input===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,...(input===undefined?{}:{'Content-Type':'application/json'})},...(input===undefined?{}:{body:JSON.stringify(input)}),cache:'no-store'});
  const result=await response.json();if(!response.ok)throw new Error(result.message||'Registration is temporarily unavailable.');return result;
 };
}
export const dollars=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
export function textElement(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
