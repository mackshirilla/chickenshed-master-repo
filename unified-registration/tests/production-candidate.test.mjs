import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash,createHmac} from 'node:crypto';
import {fixtures} from '../test-model/fixtures.mjs';
import {quoteFamily,quoteIdentity,planNativeOrder,StripeLiveClient,verifyNativeEvent,confirmationData} from '../xano/production-candidate/runtime-core.mjs';
const base=new URL('../xano/production-candidate/',import.meta.url);
test('unpublished production pack parses, matches manifest, and gates new checkout separately from fulfillment',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));assert.equal(manifest.deployed,false);
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 for(const entry of [...manifest.functions,...manifest.apis]){
  const s=await readFile(new URL(entry.path,base),'utf8');assert.equal(createHash('sha256').update(s).digest('hex'),entry.sha256);
  assert.doesNotMatch(s,/spgm-3uz8-a402|summer_bridge_fixture_guard|http:\/\/127\.0\.0\.1|mack@bigstachedesign\.com|cs_test_|unified_test_aid_/);
  if(!entry.path.endsWith('registration_orders_live_guard_v1.xs'))assert.match(s,/function.run registration_orders_live_guard_v1/);
  for(const m of s.matchAll(/code\s*=\s*"""([\s\S]*?)"""/g))new AsyncFunction('$input','$var','$env','$auth',m[1]);
 }
 const checkout=await readFile(new URL('api/unified_registration/checkout_POST.xs',base),'utf8'),events=await readFile(new URL('api/unified_registration/payment_events_POST.xs',base),'utf8');
 assert.match(checkout,/registration_checkout_enabled === 'true'/);assert.doesNotMatch(events,/registration_checkout_enabled/);
 const mail=await readFile(new URL('function/registration_live_confirmation_v1.xs',base),'utf8');assert.match(mail,/const recipient=order.parent_email/);assert.match(mail,/testMode:false/);
});
test('production runtime uses canonical live URLs, preserves semester pricing and rejects test credentials/events',async()=>{
 const f=fixtures(),req={items:[{student_id:9101,session_id:102},{student_id:9101,session_id:21}],payment_preference:'semester',aid_percent:0,attempt_id:'offline_release_candidate_001'};req.quote_fingerprint=quoteIdentity(quoteFamily(req,f));
 const order={id:90,...planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req,origin:'https://www.chickenshednyc.org'}).data};
 assert.equal(order.reservation_payload.mode,'payment');assert.equal(order.reservation_payload.success_url,'https://www.chickenshednyc.org/checkout-success/registration-order?session_id={CHECKOUT_SESSION_ID}');assert.equal(order.reservation_payload.cancel_url,'https://www.chickenshednyc.org/program-registration');assert.equal(order.billing_followup,'Needs arrangement');
 assert.throws(()=>planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req,origin:'http://127.0.0.1:4817'}),{code:'ENVIRONMENT'});
 assert.throws(()=>new StripeLiveClient({key:'rk_test_offline_placeholder'}),{code:'PAYMENT_SETUP_REQUIRED'});
 const secret='offline-hmac-fixture-only',now=Math.floor(Date.now()/1000),event={id:'evt_offline_candidate',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_offline',metadata:{checkout_policy:'registration_order_v2',order_reference:order.order_reference}}}};
 const sign=raw=>'t='+now+',v1='+createHmac('sha256',secret).update(now+'.'+raw).digest('hex');let raw=JSON.stringify(event);
 await assert.rejects(()=>verifyNativeEvent(raw,sign(raw),secret,now),{code:'SIGNATURE_INVALID'});
 event.livemode=true;event.data.object.id='cs_live_offline_fixture';raw=JSON.stringify(event);assert.equal((await verifyNativeEvent(raw,sign(raw),secret,now)).supported,true);
 const session={id:'cs_live_offline_fixture',livemode:true,mode:'payment',currency:'usd',status:'complete',payment_status:'paid',customer:'cus_offline_fixture',payment_intent:'pi_offline_fixture',metadata:{checkout_policy:order.checkout_policy,order_reference:order.order_reference,quote_version:String(order.quote_version)},line_items:order.quote.lines,amount_subtotal:order.quote.totals.checkout_gross_cents,amount_total:order.quote.totals.due_now_cents,total_details:{amount_discount:0}};
 const done={...order,...planNativeOrder('event',order,{session}).data},mail=confirmationData(done,{origin:'https://www.chickenshednyc.org'});
 assert.equal(mail.testMode,false);assert.equal(mail.hasSemester,true);assert.doesNotMatch(mail.emailSubject,/TEST/);assert.match(mail.receiptUrl,/^https:\/\/www.chickenshednyc.org\/checkout-success\/registration-order/);
});
