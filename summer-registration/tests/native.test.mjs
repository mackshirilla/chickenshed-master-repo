import test from 'node:test';
import assert from 'node:assert/strict';
import {fixtures} from '../test-model/fixtures.mjs';
import {quoteFamily,quoteIdentity} from '../test-model/quote.mjs';
import {StripeTestClient,normalizeSession,verifyNativeEvent,signatureHeader} from '../test-model/stripe-native.mjs';
import {planNativeOrder,referenceFor,summerSuccessUrl} from '../test-model/native-order.mjs';
import {signFixture} from '../test-model/signature.mjs';
import {sandboxReturnOrigin} from '../test-model/sandbox-origin.mjs';
const now=1800000000000;
test('sandbox return origin permits only the staging host and exact loopback test origin',()=>{
 assert.equal(sandboxReturnOrigin({Origin:'http://127.0.0.1:4817'}),'http://127.0.0.1:4817');
 assert.equal(sandboxReturnOrigin({http_origin:'https://chickenshednyc2024.webflow.io'}),'https://chickenshednyc2024.webflow.io');
 assert.equal(sandboxReturnOrigin({}),'https://chickenshednyc2024.webflow.io');
 assert.equal(summerSuccessUrl('https://chickenshednyc2024.webflow.io'),'https://chickenshednyc2024.webflow.io/checkout-success/summer-camp-success?session_id={CHECKOUT_SESSION_ID}');
 assert.equal(summerSuccessUrl('http://127.0.0.1:4817','cs_test_local'),'http://127.0.0.1:4817/summer-registration-success?session_id=cs_test_local');
 for(const headers of [{Origin:'https://example.com'},{Origin:'http://127.0.0.1:4818'},{Origin:['http://127.0.0.1:4817']},{Origin:'http://127.0.0.1:4817',origin:'https://chickenshednyc2024.webflow.io'}])assert.throws(()=>sandboxReturnOrigin(headers),{code:'ENVIRONMENT'});
});
function setup(){const f=fixtures(),context={...f,actorId:9001};const request={items:[{student_id:9101,session_id:64},{student_id:9102,session_id:65}],aid_percent:35,
 aid_data:{relationship:'Parent',annualIncome:30000,monthlyExpense:2500,previousParticipant:'Yes'},attempt_id:'native_family_attempt_0001'};
 request.quote_fingerprint=quoteIdentity(quoteFamily(request,context));return {actor:f.actor,context,request,now};}
function canonical(order,status='open',paid=false){return normalizeSession({object:'checkout.session',id:'cs_test_native_family',livemode:false,mode:'payment',currency:'usd',status,
 payment_status:paid?'paid':'unpaid',customer:order.stripe_customer_id||null,payment_intent:paid?'pi_native_fixture':null,url:status==='open'?'https://checkout.stripe.com/c/pay/cs_test_native_family':null,
 metadata:{checkout_policy:'summer_family_v1',order_reference:order.order_reference,quote_version:String(order.quote_version)},
 amount_subtotal:order.quote.totals.checkout_gross_cents,amount_total:order.quote.totals.due_now_cents,total_details:{amount_discount:order.quote.totals.checkout_discount_cents},expires_at:now/1000+1800},
 {has_more:false,data:order.quote.lines.map(l=>({...l,price:{id:l.price,product:l.product}}))});}
test('native transition: reserve immutable payload, attach canonical items, fulfill once, and hide intake from owned receipt',()=>{
 const args=setup();const plan=planNativeOrder('reserve',null,args),order={id:1,...plan.data};
 assert.equal(order.status,'creating');assert.equal(order.reservation_payload.expires_at,now/1000+1800);
 assert.equal(order.parent_email,args.actor.email);assert.equal(order.balance_after_checkout_cents,94000);
 assert.equal(order.reservation_payload.success_url,summerSuccessUrl('http://127.0.0.1:4817'));
 assert.equal(planNativeOrder('reserve',null,{...args,origin:'https://chickenshednyc2024.webflow.io'}).data.reservation_payload.success_url,summerSuccessUrl('https://chickenshednyc2024.webflow.io'));
 assert.equal(order.reservation_payload.payment_method_types,undefined);assert.equal(order.reservation_payload.subscription_data,undefined);
 const retry=planNativeOrder('reserve',order,{...args,now:now+1000});assert.deepEqual(retry.result.order.reservation_payload,order.reservation_payload);
 Object.assign(order,planNativeOrder('attach',order,{session:canonical(order),now}).data);
 const paid=canonical(order,'complete',true),applied=planNativeOrder('event',order,{session:paid,event_id:'evt_native_fixture',now});
 Object.assign(order,applied.data);assert.equal(order.paid_cents,62000);assert.deepEqual(order.quote.items.map(i=>i.paid_cents),[52000,10000]);
 assert.equal(planNativeOrder('reserve',order,{...args,origin:'https://chickenshednyc2024.webflow.io'}).result.response.url,summerSuccessUrl('https://chickenshednyc2024.webflow.io',order.checkout_session_id));
 assert.equal(planNativeOrder('event',order,{session:paid,event_id:'evt_native_fixture',now}).write,'none');
 const receipt=planNativeOrder('receipt',order,{actor_id:9001}).result;assert.equal(receipt.aid_intake,undefined);
 assert.throws(()=>planNativeOrder('receipt',order,{actor_id:9002}),{code:'NOT_FOUND'});
 assert.equal(referenceFor(9001,args.request.attempt_id),order.order_reference);
});
test('native transition: canonical mismatch enters review; open checkout must expire before quote replacement',()=>{
 const args=setup(),order={id:2,...planNativeOrder('reserve',null,args).data};Object.assign(order,planNativeOrder('attach',order,{session:canonical(order),now}).data);
 const wrong=canonical(order,'complete',true);wrong.amount_total=100;
 assert.equal(planNativeOrder('event',order,{session:wrong,now}).data.status,'review');
 const changed={...args,request:{...args.request,aid_percent:20}};changed.request.quote_fingerprint=quoteIdentity(quoteFamily(changed.request,args.context));
 assert.throws(()=>planNativeOrder('replace',order,{...changed,previous_session:canonical(order),expected_version:1}),{code:'PAYMENT_PENDING'});
 const expired=canonical(order,'expired');const replacement=planNativeOrder('replace',order,{...changed,previous_session:expired,expected_version:1});
 const next={...order,...replacement.data};assert.equal(next.quote_version,2);assert.equal(next.previous_checkouts.length,1);
 assert.equal(planNativeOrder('event',next,{session:expired,now}).result.ignored,true);
});
test('portable signed receiver: verify raw bytes, reject changed/stale/live/wrong-account events before canonical fetch',async()=>{
 const event={id:'evt_native_fixture',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_native_family',metadata:{checkout_policy:'summer_family_v1',order_reference:'summer_fixture'}}}};
 const secret='synthetic-signing-fixture-not-a-Stripe-credential';const signed=signFixture(event,secret,now/1000);
 assert.equal((await verifyNativeEvent(signed.body.toString(),signatureHeader({'Stripe-Signature':signed.signature}),secret,now/1000)).ok,true);
 await assert.rejects(verifyNativeEvent(signed.body.toString()+' ',signed.signature,secret,now/1000),{code:'SIGNATURE_INVALID'});
 await assert.rejects(verifyNativeEvent(signed.body.toString(),signed.signature,secret,now/1000+301),{code:'SIGNATURE_INVALID'});
 for(const extra of [{livemode:true},{account:'acct_other'}]){const s=signFixture({...event,...extra},secret,now/1000);await assert.rejects(verifyNativeEvent(s.body.toString(),s.signature,secret,now/1000),{code:'SIGNATURE_INVALID'});}
});
test('native HTTP adapter: test-only keys, fixed Stripe origin, encoded nested fields, and complete line retrieval',async()=>{
 let calls=[];const args=setup(),order={id:1,...planNativeOrder('reserve',null,args).data};const raw=canonical(order);
 const rawSession={...raw,object:'checkout.session'},rawLines={has_more:false,data:order.quote.lines.map(l=>({...l,price:{id:l.price,product:l.product}}))};
 const client=new StripeTestClient({key:'rk_test_synthetic_fixture_not_a_credential',fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.includes('/line_items')?rawLines:rawSession};}});
 await client.request('create',null,order.reservation_payload,'summer:fixed:1');const body=new URLSearchParams(calls[0].options.body);
 assert.equal(body.get('payment_intent_data[metadata][checkout_policy]'),'summer_family_v1');assert.equal(body.get('line_items[0][quantity]'),'1');
 assert.equal(calls[0].options.headers['Idempotency-Key'],'summer:fixed:1');
 assert.deepEqual((await client.retrieve(raw.id)).line_items,raw.line_items);
 assert.equal(calls.length,3);assert.ok(calls.every(c=>new URL(c.url).origin==='https://api.stripe.com'));
 assert.throws(()=>new StripeTestClient({key:'rk_live_not_a_credential'}),{code:'TEST_SETUP_REQUIRED'});
 await assert.rejects(client.request('product','https://invalid.test'),{code:'STRIPE_OPERATION'});
 assert.throws(()=>normalizeSession(rawSession,{...rawLines,has_more:true}),{code:'STRIPE_RESPONSE'});
});
