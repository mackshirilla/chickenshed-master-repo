import test from 'node:test';import assert from 'node:assert/strict';
import {fixtures} from '../test-model/fixtures.mjs';
import {quoteFamily} from '../test-model/quote.mjs';
import {aidCouponSpec,ensureAidCoupon,StripeTestClient} from '../test-model/stripe-native.mjs';
test('cart order survives mixed status, same-cart Lab qualification and confirmation data',()=>{
 const f=fixtures(),items=[{student_id:9102,session_id:8},{student_id:9101,session_id:21},{student_id:9101,session_id:102}];
 const q=quoteFamily({items,payment_preference:'full',aid_percent:20},f);
 assert.deepEqual(q.items.map(i=>[i.student_id,i.session_id]),items.map(i=>[i.student_id,i.session_id]));
 assert.equal(q.items[0].student_status,'Pending');assert.equal(q.items[0].checkout_discount_cents,0);
});
test('aid follows newly added tuition products automatically and rejects discounts on deposits',async()=>{
 const f=fixtures(),s=f.sessions[0];s.tuition={...s.tuition,price_id:'price_new',product_id:'prod_new'};
 const spec=await aidCouponSpec(20,[s.tuition.product_id]);
 f.coupons=[{...spec,valid:true,products:spec.applies_to.products}];
 const q=quoteFamily({items:[{student_id:9101,session_id:1},{student_id:9102,session_id:8}],payment_preference:'full',aid_percent:20},f);
 assert.equal(q.items[0].due_now_cents,93000);assert.equal(q.items[1].due_now_cents,2500);assert.equal(q.coupon_id,spec.id);
 f.coupons[0].products.push(q.items[1].charge_product);
 assert.throws(()=>quoteFamily({items:[{student_id:9101,session_id:1},{student_id:9102,session_id:8}],payment_preference:'full',aid_percent:20},f),{code:'AID_UNAVAILABLE'});
 const a=await aidCouponSpec(20,['prod_b','prod_a','prod_b']),b=await aidCouponSpec(20,['prod_a','prod_b']);assert.deepEqual(a,b);assert.notEqual(a.id,spec.id);
});
test('grouped quantity discounts allocate fractional cents without changing cart order',()=>{
 const f=fixtures();f.students.push({...f.students[0],id:9104});
 const q=quoteFamily({items:[{student_id:9104,session_id:1},{student_id:9101,session_id:1}],payment_preference:'full',aid_percent:35},f);
 assert.equal(q.totals.checkout_discount_cents,81375);assert.equal(q.lines[0].quantity,2);assert.equal(q.lines[0].amount_discount,81375);
 assert.deepEqual(q.items.map(i=>i.checkout_discount_cents),[40688,40687]);assert.deepEqual(q.items.map(i=>i.student_id),[9104,9101]);
});
test('coupon provisioning reuses exact scope, creates only on 404, and never hides access errors',async()=>{
 const spec=await aidCouponSpec(20,['prod_new']),coupon={...spec,valid:true},actions=[];let exists=false;
 const client={async request(action,id,params,key){actions.push(action);if(action==='coupon_create'){assert.equal(key,spec.id);exists=true;return coupon;}if(!exists)throw Object.assign(Error(),{provider_status:404});return coupon;}};
 assert.equal((await ensureAidCoupon(client,spec)).id,spec.id);assert.deepEqual(actions,['coupon','coupon_create','coupon']);actions.length=0;
 await ensureAidCoupon(client,spec);assert.deepEqual(actions,['coupon']);
 let calls=0;await assert.rejects(()=>ensureAidCoupon({async request(){calls++;throw Object.assign(Error(),{provider_status:403});}},spec));assert.equal(calls,1);
 await assert.rejects(()=>ensureAidCoupon({async request(){return {...coupon,applies_to:{products:['prod_wrong']}};}},spec),{code:'AID_UNAVAILABLE'});
});
test('coupon create uses only the expected Stripe route and encoded request',async()=>{
 const client=new StripeTestClient({key:'rk_test_fictional',fetcher:async(url,options)=>{assert.equal(url,'https://api.stripe.com/v1/coupons');assert.equal(options.method,'POST');const form=new URLSearchParams(options.body);assert.equal(form.get('applies_to[products][0]'),'prod_new');return {ok:true,status:200,json:async()=>({id:'coupon_test',livemode:false})};}});
 await client.request('coupon_create',null,await aidCouponSpec(20,['prod_new']),'fictional-idempotency');
});
