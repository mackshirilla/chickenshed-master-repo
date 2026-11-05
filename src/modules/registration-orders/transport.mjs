// Explicitly gated production or local sandbox transport. No ambient tenant fallback.
export function transport(root){
 let config;try{config=JSON.parse(document.querySelector('#registration-orders-config')?.textContent||'{}');}catch{}
 if(config?.enabled!==true)throw Error('Registration is not open yet.');
 const production=location.hostname==='www.chickenshednyc.org',local=location.origin==='http://127.0.0.1:4817';
 const fixed='https://xszy-vp96-kdkh.n7c.xano.io/api:registration26/registration';
 if(!production&&!local||production&&(config.apiBase!==fixed||config.tenant)||local&&config.tenant!=='spgm-3uz8-a402')throw Error('Registration is unavailable.');
 const base=local?'/api/unified':fixed;
 return async(path,input)=>{let token;try{token=JSON.parse(localStorage.getItem('auth_config')||'{}').token;}catch{}if(!token)throw Error('Please sign in to continue.');const response=await fetch(base+'/'+path,{method:input===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,...(input===undefined?{}:{'Content-Type':'application/json'})},...(input===undefined?{}:{body:JSON.stringify(input)}),cache:'no-store'});const result=await response.json();if(!response.ok||result.ok===false){const failure=new Error(result.message||'Registration is temporarily unavailable.');failure.code=result.payload?.registration_code||result.code||'REQUEST_FAILED';failure.issues=Array.isArray(result.payload?.issues)?result.payload.issues:Array.isArray(result.issues)?result.issues:[];failure.httpStatus=response.status;throw failure;}return result;};
}
export const dollars=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
export function textElement(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
