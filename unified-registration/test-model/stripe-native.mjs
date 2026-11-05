import { requireValue, POLICY, SummerError, AID_RATES } from './quote.mjs';

export const STRIPE_ACCOUNT = 'acct_1LYZ6CDK5b8P0zFQ';
// Match the existing test destinations; this does not change the account API version.
export const STRIPE_API_VERSION = '2025-01-27.acacia';
export const PAYMENT_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired', 'checkout.session.async_payment_failed'];
const idOf = value => typeof value === 'string' ? value : value?.id || null;
const integer = value => Number.isSafeInteger(value) && value >= 0;
export function normalizeSession(session, lines) {
  requireValue(session?.object === 'checkout.session' && session.livemode === false && session.mode === 'payment' &&
    /^cs_test_/.test(session.id) && ['open','complete','expired'].includes(session.status) &&
    ['unpaid','paid','no_payment_required'].includes(session.payment_status) &&
    Array.isArray(lines?.data) && lines.has_more === false && lines.data.length <= 30,
  'STRIPE_RESPONSE', 'Payment details are unavailable.', 503);
  const normalized = lines.data.map(line => {
    requireValue(line.price?.id && idOf(line.price.product) && Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
      [line.amount_subtotal,line.amount_discount,line.amount_total].every(integer) && (line.amount_tax || 0) === 0,
    'STRIPE_RESPONSE', 'Payment items are unavailable.', 503);
    return {price:line.price.id,product:idOf(line.price.product),quantity:line.quantity,
      amount_subtotal:line.amount_subtotal,amount_discount:line.amount_discount,amount_total:line.amount_total};
  });
  requireValue([session.amount_subtotal,session.amount_total,session.total_details?.amount_discount].every(integer) &&
    (session.total_details?.amount_tax || 0) === 0 && (session.total_details?.amount_shipping || 0) === 0,
  'STRIPE_RESPONSE', 'Payment amount is unavailable.', 503);
  return {id:session.id,mode:session.mode,livemode:session.livemode,currency:session.currency,status:session.status,
    payment_status:session.payment_status,customer:idOf(session.customer),payment_intent:idOf(session.payment_intent),
    metadata:session.metadata || {},amount_subtotal:session.amount_subtotal,amount_total:session.amount_total,
    total_details:{amount_discount:session.total_details.amount_discount},line_items:normalized,
    expires_at:session.expires_at,url:session.url || null};
}
export function validateCanonical(order, session) {
  requireValue(session?.livemode === false && session.mode === 'payment' && session.currency === 'usd' &&
    session.metadata?.checkout_policy === POLICY && session.metadata.order_reference === order.order_reference &&
    session.metadata.quote_version === String(order.quote_version) &&
    (order.stripe_customer_id?session.customer===order.stripe_customer_id:
      order.reservation_payload?.customer_creation==='always'?(/^cus_[A-Za-z0-9_]+$/.test(session.customer||'')||!isSettledSession(session)&&session.customer===null):session.customer===null) &&
    (!order.checkout_session_id || order.checkout_session_id === session.id),
  'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
  const promotions = order.reservation_payload?.allow_promotion_codes === true && order.quote.aid_percent === 0;
  if (promotions) {
    const expected = [...order.quote.lines].sort((a,b)=>a.price.localeCompare(b.price));
    const actual = [...session.line_items].sort((a,b)=>a.price.localeCompare(b.price));
    requireValue(actual.length === expected.length && actual.every((line,index)=>{
      const baseline=expected[index];
      return line.price===baseline.price && line.product===baseline.product && line.quantity===baseline.quantity &&
        line.amount_subtotal===baseline.amount_subtotal && integer(line.amount_discount) &&
        line.amount_discount<=line.amount_subtotal && line.amount_total===line.amount_subtotal-line.amount_discount;
    }) && session.amount_subtotal===order.quote.totals.checkout_gross_cents &&
      session.amount_subtotal===actual.reduce((n,l)=>n+l.amount_subtotal,0) &&
      session.amount_total===actual.reduce((n,l)=>n+l.amount_total,0) &&
      session.total_details.amount_discount===actual.reduce((n,l)=>n+l.amount_discount,0),
    'PAYMENT_MISMATCH','Payment discount needs staff review.',409);
    return;
  }
  requireValue(session.amount_total === order.quote.totals.due_now_cents &&
    session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
    session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
  'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
  const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
    [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
  requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
    'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
}
export function isSettledSession(session) {
  return session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required';
}
export function settlementQuote(order,session) {
  validateCanonical(order,session);
  const quote=JSON.parse(JSON.stringify(order.quote));
  if (!(order.reservation_payload?.allow_promotion_codes===true && quote.aid_percent===0)) return quote;
  const discount=session.total_details.amount_discount;
  if (!discount || quote.promotion_discount_cents===discount) return quote;
  for (const line of session.line_items) {
    const items=quote.items.filter(item=>item.charge_price===line.price);
    requireValue(items.length===line.quantity,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
    const each=Math.floor(line.amount_discount/items.length),remainder=line.amount_discount%items.length;
    items.forEach((item,index)=>{
      const amount=each+(index<remainder?1:0);
      requireValue(amount<=item.due_now_cents,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
      item.promotion_discount_cents=amount;
      item.checkout_discount_cents+=amount;
      item.due_now_cents-=amount;
      item.net_tuition_cents-=amount;
    });
  }
  quote.lines=JSON.parse(JSON.stringify(session.line_items));
  quote.promotion_discount_cents=discount;
  quote.totals.promotion_discount_cents=discount;
  quote.totals.checkout_discount_cents=discount;
  quote.totals.due_now_cents=session.amount_total;
  quote.totals.net_tuition_cents-=discount;
  return quote;
}
export function formBody(input) {
  const body = new URLSearchParams();
  const visit = (key,value) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) value.forEach((item,index)=>visit(`${key}[${index}]`,item));
    else if (typeof value === 'object') Object.entries(value).forEach(([name,item])=>visit(key ? `${key}[${name}]` : name,item));
    else body.append(key,String(value));
  };
  Object.entries(input || {}).forEach(([key,value])=>visit(key,value)); return body;
}
export class StripeTestClient {
  constructor({key,fetcher=fetch}) {
    requireValue(typeof key === 'string' && /^(rk|sk)_test_/.test(key), 'TEST_SETUP_REQUIRED', 'Stripe test setup is incomplete.', 503);
    this.key=key;this.fetcher=fetcher;
  }
  async request(action,id,params={},idempotencyKey) {
    const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
    const routes = {
      price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
      coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
      coupon_create:['POST','/v1/coupons'],
      customer_update:['POST',`/v1/customers/${safeId?id:''}`],
      lines:['GET',`/v1/checkout/sessions/${safeId?id:''}/line_items`],
      create:['POST','/v1/checkout/sessions'],expire:['POST',`/v1/checkout/sessions/${safeId?id:''}/expire`]
    };
    requireValue(routes[action] && (['create','coupon_create'].includes(action) || safeId), 'STRIPE_OPERATION', 'Unsupported payment request.', 400);
    const [method,path]=routes[action], url=new URL('https://api.stripe.com'+path);
    const headers={Authorization:`Bearer ${this.key}`,'Stripe-Version':STRIPE_API_VERSION};
    if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
    const body=formBody(params);if(method==='GET')url.search=body.toString();else headers['Content-Type']='application/x-www-form-urlencoded';
    let response,data;
    try {response=await this.fetcher(url.href,{method,headers,...(method==='POST'?{body:body.toString()}:{}),redirect:'error',signal:AbortSignal.timeout(15000)});data=await response.json();}
    catch {requireValue(false,'STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);}
    if(!response.ok||data.error||data.livemode===true){const error=new SummerError('STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);error.stripe_operation=action;error.provider_status=response.status;error.provider_code=data.error?.code||null;throw error;}
    return data;
  }
  async retrieve(id) {const s=await this.request('session',id);return normalizeSession(s,await this.request('lines',id,{limit:100}));}
}
export function signatureHeader(headers) {
  if(typeof headers==='string') {try{headers=JSON.parse(headers);}catch{headers=Object.fromEntries(headers.split(/\r?\n/).map(line=>{const i=line.indexOf(':');return [line.slice(0,i),line.slice(i+1).trim()];}));}}
  if(Array.isArray(headers))headers=Object.fromEntries(headers.map(entry=>Array.isArray(entry)?entry:typeof entry==='string'?(()=>{const i=entry.indexOf(':');return [entry.slice(0,i),entry.slice(i+1).trim()];})():[entry.name||entry.key,entry.value]));
  const matches=Object.entries(headers||{}).filter(([key])=>key.toLowerCase().replace(/^http[_-]/,'').replace(/_/g,'-')==='stripe-signature');
  const value=Array.isArray(matches[0]?.[1])&&matches[0][1].length===1?matches[0][1][0]:matches[0]?.[1];
  requireValue(matches.length===1 && typeof value==='string','SIGNATURE_INVALID','Invalid payment event.',400);
  return value;
}
export async function verifyNativeEvent(rawBody,header,secret,now=Math.floor(Date.now()/1000)) {
  const bad=()=>requireValue(false,'SIGNATURE_INVALID','Invalid payment event.',400);
  if(typeof rawBody!=='string'||new TextEncoder().encode(rawBody).length>262144||typeof header!=='string'||typeof secret!=='string'||!secret)bad();
  const parts=header.split(',').map(p=>p.trim().split('='));const times=parts.filter(([k])=>k==='t').map(([,v])=>v);
  const signatures=parts.filter(([k,v])=>k==='v1'&&/^[0-9a-f]{64}$/i.test(v||'')).map(([,v])=>v.toLowerCase());
  if(times.length!==1||!/^\d+$/.test(times[0])||!Number.isSafeInteger(Number(times[0]))||Math.abs(now-Number(times[0]))>300||!signatures.length)bad();
  const encoder=new TextEncoder(),key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const expected=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${times[0]}.${rawBody}`)));
  let matched=0;for(const value of signatures){let difference=0;for(let i=0;i<32;i++)difference|=expected[i]^parseInt(value.slice(i*2,i*2+2),16);matched|=Number(difference===0);}if(!matched)bad();
  let event;try{event=JSON.parse(rawBody);}catch{bad();}
  if(!event||typeof event.id!=='string'||!event.id.startsWith('evt_')||typeof event.type!=='string'||!event.data?.object?.id||event.livemode!==false||(event.account&&event.account!==STRIPE_ACCOUNT))bad();
  return {ok:true,event_id:event.id,event_type:event.type,object_id:event.data.object.id,
    order_reference:event.data.object.metadata?.order_reference||'',policy:event.data.object.metadata?.checkout_policy||'',
    supported:PAYMENT_EVENTS.includes(event.type)};
}

// Automatic tuition aid follows the actual cart; no maintained product allowlist.
// The deterministic ID makes equivalent carts reuse the same immutable discount.
export async function aidCouponSpec(percent,products) {
  const ids=[...new Set(products)].sort();
  requireValue(AID_RATES.includes(percent)&&percent>0&&ids.length>0&&ids.length<=30&&ids.every(id=>/^prod_[a-zA-Z0-9_]+$/.test(id)), 'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([POLICY,'usd',percent,ids])));
  const hash=[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,24);
  return {id:`reg_aid_v2_${percent}_${hash}`,name:`Chickenshed NYC tuition aid ${percent}%`,duration:'once',percent_off:percent,applies_to:{products:ids},metadata:{checkout_policy:POLICY,scope:'cart_tuition_v1'}};
}
export async function ensureAidCoupon(client,spec) {
  const read=()=>client.request('coupon',spec.id,{expand:['applies_to']});
  let coupon;
  try{coupon=await read();}catch(e){
    if(e.provider_status!==404)throw e;
    try{await client.request('coupon_create',null,spec,spec.id);}catch(createError){
      // Another checkout may be creating this same deterministic coupon.
      if(![409].includes(createError.provider_status)&&!['resource_already_exists','idempotency_key_in_use'].includes(createError.provider_code))throw createError;
    }
    for(let attempt=0;attempt<3;attempt++){
      try{coupon=await read();break;}catch(e){if(e.provider_status!==404||attempt===2)throw e;await new Promise(resolve=>setTimeout(resolve,100*(attempt+1)));}
    }
  }
  requireValue(coupon?.valid===true&&coupon.id===spec.id&&coupon.duration==='once'&&coupon.percent_off===spec.percent_off&&JSON.stringify([...(coupon.applies_to?.products||[])].sort())===JSON.stringify(spec.applies_to.products),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);
  return {id:coupon.id,valid:true,duration:coupon.duration,percent_off:coupon.percent_off,products:coupon.applies_to.products};
}
