import {quoteFamily,quoteIdentity,validateAidIntake,requireValue,POLICY} from './quote.mjs';
import {validateCanonical,isSettledSession,settlementQuote} from './stripe-native.mjs';
import {linkedAidIntake} from './financial-aid.mjs';

export function referenceFor(actorId,attempt) {
  requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
    'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
  return `summer_${actorId}_${attempt}`;
}
export function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,items:order.quote.items,totals:order.quote.totals};}
const unchanged = result => ({ok:true,write:'none',result});
const update = (data,result) => ({ok:true,write:'edit',data,result});
export function summerSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
  requireValue(['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io'].includes(origin),
    'ENVIRONMENT','Summer sandbox return URLs are not configured.',503);
  const path = origin === 'https://chickenshednyc2024.webflow.io' ? '/checkout-success/summer-camp-success' : '/summer-registration-success';
  return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
}
function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
  response:{order_id:order.id,status:order.status,url:order.status==='paid'?summerSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
function reservation(actor,request,quote,reference,version,origin,now) {
  requireValue(['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io'].includes(origin),
    'ENVIRONMENT','Summer sandbox return URLs are not configured.',503);
  const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
  const payload={mode:'payment',line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
    payment_intent_data:{metadata,receipt_email:actor.email},success_url:summerSuccessUrl(origin),
    cancel_url:`${origin}/summer-camp-registration`,expires_at:Math.floor(now/1000)+1800};
  if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else payload.customer_email=actor.email;
  if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
  if(quote.aid_percent===0)payload.allow_promotion_codes=true;
  return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
    status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
    checkout_session_id:null,checkout_url:null,session_snapshot:null,reservation_payload:payload,stripe_customer_id:actor.stripe_customer_id||null,
    paid_cents:0,payment_intent_id:null,paid_at:null,event_ids:[],handled:false,
    item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.student_status} | ${i.aid_percent}% aid | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n')};
}
export function planNativeOrder(phase,old,args) {
  const now=args.now||Date.now(),origin=args.origin||'http://127.0.0.1:4817';
  if(['reserve','replace'].includes(phase)) {
    const {actor,request,context}=args;
    requireValue(actor?.id===context?.actorId&&typeof actor.email==='string'&&actor.email.includes('@'),'UNAUTHORIZED','Please sign in.',401);
    const reference=referenceFor(actor.id,request.attempt_id);
    requireValue(!old||old.owner_user_id===actor.id,'FORBIDDEN','This order is unavailable.',403);
    if(old?.status==='paid')return unchanged(resultFor(old,origin));
    const quote=quoteFamily(request,context),fingerprint=quoteIdentity(quote);
    requireValue(request.quote_fingerprint===fingerprint,'QUOTE_CHANGED','Review the updated payment before continuing.',409);
    const intake=linkedAidIntake(validateAidIntake(quote.aid_percent,request.aid_data),old?.aid_intake);
    if(phase==='reserve'&&old?.checkout_session_id){
      const result={action:'inspect',order:old,fingerprint,upgrade_promotions:quote.aid_percent===0&&old.reservation_payload?.allow_promotion_codes!==true};
      return old.quote_fingerprint===fingerprint&&JSON.stringify(old.aid_intake)!==JSON.stringify(intake)?update({aid_intake:intake},result):unchanged(result);
    }
    if(phase==='reserve'&&old) {
      requireValue(old.status==='creating'&&old.quote_fingerprint===fingerprint,'CHECKOUT_IN_PROGRESS','Retry your previous checkout before changing it.',409);
      const result={action:'create',order:old};
      return JSON.stringify(old.aid_intake)!==JSON.stringify(intake)?update({aid_intake:intake},result):unchanged(result);
    }
    if(phase==='replace') {
      requireValue(old&&old.checkout_session_id===args.previous_session?.id&&old.quote_version===args.expected_version,
        'CHECKOUT_CHANGED','Checkout changed; refresh before continuing.',409);
      validateCanonical(old,args.previous_session);
      requireValue(args.previous_session.status==='expired'&&args.previous_session.payment_status==='unpaid',
        'PAYMENT_PENDING','The previous checkout must finish before another can open.',409);
    }
    const version=old?old.quote_version+1:1;
    const data=reservation(actor,request,quote,reference,version,origin,now);
    data.aid_intake=intake;
    data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote,allow_promotion_codes:old.reservation_payload?.allow_promotion_codes===true}]:[];
    return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
  }
  requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
  if(phase==='attach'||phase==='event') {
    const session=args.session;
    const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
    if(phase==='event'&&previous) {
      validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote,reservation_payload:{allow_promotion_codes:previous.allow_promotion_codes===true}},session);
      if(isSettledSession(session))return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
        observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
      return unchanged({ignored:true,applied:false});
    }
    try{validateCanonical(old,session);}catch(error){
      if(isSettledSession(session)&&old.status!=='paid')return update({status:'review',review_reason:error.code,
        observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
      throw error;
    }
    if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
    if(isSettledSession(session)) {
      requireValue(session.status==='complete' && (session.payment_status==='paid' && session.amount_total>0 && session.payment_intent ||
        isSettledSession(session) && session.amount_total===0 && !session.payment_intent),
      'PAYMENT_PENDING','Payment is still processing.',409);
      const quote=settlementQuote(old,session);quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
      return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
        balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,
        item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)}${i.promotion_discount_cents?' | coupon $'+(i.promotion_discount_cents/100).toFixed(2):''} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n'),
        paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
        event_ids:[...(old.event_ids||[]),...(args.event_id?[args.event_id]:[])]},{action:'done',applied:true});
    }
    requireValue(session.status!=='complete'||phase==='event','PAYMENT_PENDING','Payment is still being checked. Please do not pay again.',409);
    if(phase==='attach')requireValue(session.status==='open'&&typeof session.url==='string'&&new URL(session.url).protocol==='https:'&&new URL(session.url).hostname==='checkout.stripe.com',
      'STRIPE_RESPONSE','Checkout is unavailable.',503);
    return update({status:session.status==='expired'?'expired':'pending',checkout_session_id:session.id,
      checkout_url:session.url||old.checkout_url,session_snapshot:session},{action:'done',applied:false});
  }
  if(phase==='receipt') {requireValue(old.owner_user_id===args.actor_id,'NOT_FOUND','Payment not found.',404);return unchanged(publicReceipt(old));}
  requireValue(false,'ORDER_OPERATION','Unsupported order request.',400);
}
