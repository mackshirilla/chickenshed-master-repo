import {saveFamilyPaymentMethod} from '../test-model/payment-method.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import{fixtures}from'../test-model/fixtures.mjs';import{quoteFamily,quoteIdentity,enrollmentCoverage}from'../test-model/quote.mjs';import{planNativeOrder,publicReceipt}from'../test-model/native-order.mjs';import{planSessionRegistrations}from'../test-model/session-registrations.mjs';import{confirmationData}from'../test-model/confirmation.mjs';
const request=(preference,items=[{student_id:9101,session_id:1},{student_id:9102,session_id:8}],aid=0)=>({payment_preference:preference,items,aid_percent:aid,attempt_id:'unified_test_attempt_20261104'});
function reserve(req){const f=fixtures(),q=quoteFamily(req,f);req.quote_fingerprint=quoteIdentity(q);if(req.aid_percent)req.aid_data={relationship:'Parent',annualIncome:50000,monthlyExpense:4000,previousParticipant:'No'};return {f,order:{id:70,...planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req,now:f.now}).data}};}
function canonical(order,discount=false){const lines=order.quote.lines.map(l=>({...l,amount_discount:discount?l.amount_subtotal:l.amount_discount,amount_total:discount?0:l.amount_total})),total=lines.reduce((n,l)=>n+l.amount_total,0);return {id:'cs_test_unified_native',livemode:false,mode:'payment',currency:'usd',status:'complete',payment_status:'paid',payment_intent:total?'pi_unified_test':null,customer:order.stripe_customer_id||'cus_unified_test_customer',metadata:{checkout_policy:'registration_order_v2',order_reference:order.order_reference,quote_version:String(order.quote_version)},line_items:lines,amount_subtotal:lines.reduce((n,l)=>n+l.amount_subtotal,0),amount_total:total,total_details:{amount_discount:lines.reduce((n,l)=>n+l.amount_discount,0)}};}
function catalog(f){return {students:f.students,sessions:f.sessions.map(s=>({id:s.id,Parent_program:s.program_id,Tuition_product:12,Parent_workshop:s.workshop_id||1,Start_Date:s.start_date||s.season_start,End_Date:s.end_date||s.season_end})),workshops:[],locations:[]};}
test('full and semester charge Approved tuition, while Pending pays its assigned per-line deposit',()=>{const f=fixtures();for(const [p,tuition]of[['full',116250],['semester',58125]]){const q=quoteFamily(request(p),f);assert.equal(q.items[0].due_now_cents,tuition);assert.equal(q.items[1].due_now_cents,2500);assert.equal(q.items[0].coverage_label,'2026–27 season');}assert.throws(()=>quoteFamily(request(null),f),{code:'PAYMENT_PREFERENCE'});});
test('checkout rejects a previous payment-plan quote before reserving an order',()=>{
 const f=fixtures(),req=request('full');req.quote_fingerprint=quoteIdentity(quoteFamily(req,f));
 req.payment_preference='monthly';
 assert.throws(()=>planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req}),{code:'QUOTE_CHANGED'});
});
test('monthly uses each assigned deposit once per line, including Pending; mixed Summer keeps its own rules',()=>{const f=fixtures();f.sessions[0].deposit.cents=3700;const q=quoteFamily(request('monthly',[{student_id:9101,session_id:1},{student_id:9101,session_id:8},{student_id:9102,session_id:8},{student_id:9101,session_id:64},{student_id:9102,session_id:65}]),f);assert.equal(q.totals.due_now_cents,98700);assert.equal(q.items.filter(i=>i.program_id!==13).reduce((n,i)=>n+i.due_now_cents,0),8700);assert.equal(q.items.find(i=>i.session_id===64).payment_option,'full');assert.equal(q.items.find(i=>i.student_status==='Pending'&&i.session_id===8).due_now_cents,2500);assert.equal(quoteFamily(request(null,[{student_id:9101,session_id:64}]),f).payment_preference,null);});
test('semester aid affects only purchased semester tuition; aid never discounts deposits and no automatic renewal is requested',()=>{const {order}=reserve(request('semester',undefined,50));assert.equal(order.quote.items[0].tuition_cents,58125);assert.equal(order.quote.items[0].due_now_cents,29062);assert.equal(order.quote.items[0].balance_after_checkout_cents,0);assert.equal(order.quote.items[1].due_now_cents,2500);assert.equal(order.reservation_payload.mode,'payment');assert.equal(order.reservation_payload.allow_promotion_codes,undefined);assert.equal(order.reservation_payload.subscription_data,undefined);assert.equal(order.billing_followup,'Needs arrangement');assert.equal(quoteFamily(request('semester'),{...fixtures(),now:Date.UTC(2027,1,1)}).items[0].coverage_label,'2026–27 season');});
test('foreign/Archived students, unavailable sessions, duplicates and existing enrollments are rejected before payment',()=>{const f=fixtures();assert.throws(()=>quoteFamily(request('full',[{student_id:9103,session_id:1}]),f),{code:'STUDENT_UNAVAILABLE'});assert.throws(()=>quoteFamily(request('full',[{student_id:9101,session_id:1},{student_id:9101,session_id:1}]),f),{code:'DUPLICATE_ITEM'});assert.throws(()=>quoteFamily(request('full'),{...f,actorId:12}),{code:'STUDENT_UNAVAILABLE'});f.sessions[0].program_id=99;assert.throws(()=>quoteFamily(request('full'),f),{code:'SESSION_UNAVAILABLE'});assert.throws(()=>quoteFamily(request('full'),{...fixtures(),enrollments:[{student_id:9101,session_id:1,status:'Active'}]}),{code:'ALREADY_REGISTERED'});});
test('confirmed $0 checkout activates Approved students, leaves Pending students Pending, and preserves staff changes on replay',()=>{const {f,order}=reserve(request('monthly')),s=canonical(order,true),done={...order,...planNativeOrder('event',order,{session:s,event_id:'evt_unified_free'}).data};assert.equal(done.paid_cents,0);assert.equal(done.payment_intent_id,null);assert.equal(done.quote.totals.promotion_discount_cents,5000);const c=catalog(f),rows=planSessionRegistrations(done,[],c).create.map((r,i)=>({...r,id:i+1}));assert.deepEqual(rows.map(r=>r.status),['Active','Pending']);rows[0].status='Waitlist';assert.equal(planSessionRegistrations(done,rows,c).create.length,0);assert.equal(planNativeOrder('event',done,{session:s,event_id:'evt_unified_free'}).write,'none');assert.equal(rows[0].status,'Waitlist');const mail=confirmationData(done,{origin:'http://127.0.0.1:4817',testMode:true});assert.equal(mail.needsArrangement,true);assert.match(mail.items[0].paymentLabel,/monthly payments/);assert.equal(mail.paidToday,'$0.00');});
test('profile approval at fulfillment controls initial placement and owned receipts exclude private intake',()=>{const {f,order}=reserve(request('full')),done={...order,...planNativeOrder('event',order,{session:canonical(order)}).data};f.students[1].Status='Approved';assert.ok(planSessionRegistrations(done,[],catalog(f)).create.every(r=>r.status==='Active'));assert.throws(()=>planNativeOrder('receipt',done,{actor_id:99}),{code:'NOT_FOUND'});const receipt=publicReceipt(done);assert.equal(receipt.aid_intake,undefined);assert.equal(receipt.reservation_payload,undefined);assert.equal(receipt.covered_terms,'2026–27 season');});

const labReq=(items=[{student_id:9101,session_id:21}],preference=null,aid=0)=>request(preference,items,aid);
const active=(overrides={})=>({parent_user_id:9001,student_id:9101,session_id:102,program_id:1,workshop_id:2,status:'Active',coverage_start:Date.UTC(2026,8,1),coverage_end:Date.UTC(2027,5,1),...overrides});
test('Labs require the same student’s Active Players 2, 3 or 4 registration covering the entire Lab',()=>{
 const f=fixtures();for(const workshop_id of [2,3,4])assert.equal(quoteFamily(labReq(),{...f,enrollments:[active({workshop_id})]}).totals.due_now_cents,17500);
 for(const row of [null,active({student_id:9102}),active({parent_user_id:77}),active({workshop_id:1}),active({program_id:3}),active({status:'Pending'}),active({status:'Paused'}),active({coverage_start:Date.UTC(2027,1,1)}),active({coverage_end:Date.UTC(2027,1,1)})])assert.throws(()=>quoteFamily(labReq(),{...f,enrollments:row?[row]:[]}),{code:'LAB_ELIGIBILITY'});
});
test('a same-cart qualifying Players item qualifies only when it will become Active and covers the Lab',()=>{
 const f=fixtures(),items=[{student_id:9101,session_id:102},{student_id:9101,session_id:21}];
 for(const preference of ['full','monthly'])assert.equal(quoteFamily(labReq(items,preference),f).items.length,2);
 assert.equal(quoteFamily(labReq(items,'semester'),f).items.length,2); // Payment cadence does not change enrollment dates.
 assert.equal(quoteFamily(labReq(items,'semester'),{...f,now:Date.UTC(2027,0,2)}).items.length,2);
 for(const denied of [[{student_id:9102,session_id:102},{student_id:9102,session_id:21}],[{student_id:9101,session_id:102},{student_id:9102,session_id:21}],[{student_id:9101,session_id:1},{student_id:9101,session_id:21}]])assert.throws(()=>quoteFamily(labReq(denied,'full'),f),{code:'LAB_ELIGIBILITY'});
});
test('full-pay-only Labs receive aid but never inherit a mixed-cart payment preference',()=>{
 const f=fixtures(),only=quoteFamily(labReq(undefined,'monthly',50),{...f,enrollments:[active()]});
 assert.equal(only.payment_preference,null);assert.equal(only.aid_percent,50);assert.equal(only.items[0].payment_preference,'full');assert.equal(only.items[0].deposit_price,null);assert.equal(only.items[0].aid_cents,8750);assert.equal(only.items[0].due_now_cents,8750);
 const mixed=quoteFamily(labReq([{student_id:9101,session_id:102},{student_id:9101,session_id:21},{student_id:9101,session_id:64}],'monthly',50),f),lab=mixed.items.find(i=>i.program_id===10);
 assert.equal(lab.payment_preference,'full');assert.equal(lab.payment_option,'full');assert.equal(lab.due_now_cents,8750);assert.equal(lab.aid_percent,50);assert.equal(lab.balance_after_checkout_cents,0);assert.equal(mixed.items.find(i=>i.session_id===102).due_now_cents,2500);assert.equal(mixed.items.find(i=>i.session_id===64).due_now_cents,40000);assert.ok(f.coupons[0].products.includes('prod_lab'));
});
test('any product with configured plans uses its explicit Semester and Deposit mappings, including Labs',()=>{
 const f=fixtures(),lab=f.sessions.find(s=>s.program_id===10);lab.semester={...lab.tuition,price_id:'price_explicit_lab_semester',cents:15000};lab.deposit={...f.sessions[0].deposit};
 for(const [preference,due,price]of [['full',8750,'price_lab'],['semester',7500,'price_explicit_lab_semester'],['monthly',2500,lab.deposit.price_id]]){
  const q=quoteFamily(labReq(undefined,preference,50),{...f,enrollments:[active()]});assert.equal(q.payment_preference,preference);assert.equal(q.items[0].due_now_cents,due);assert.equal(q.items[0].charge_price,price);
 }
 assert.throws(()=>quoteFamily(labReq(undefined,null),{...f,enrollments:[active()]}),{code:'PAYMENT_PREFERENCE'});
 delete lab.deposit;lab.payment_options=['full','monthly'];assert.throws(()=>quoteFamily(labReq(undefined,'monthly'),{...f,enrollments:[active()]}),{code:'DEPOSIT_UNAVAILABLE'});
});
test('Lab fulfillment rechecks current eligibility and replays preserve staff changes',()=>{
 const {f,order}=reserve(labReq([{student_id:9101,session_id:102},{student_id:9101,session_id:21}],'monthly')),done={...order,...planNativeOrder('event',order,{session:canonical(order,true)}).data},c=catalog(f);
 const rows=planSessionRegistrations(done,[],c).create.map((row,i)=>({...row,id:i+1}));assert.deepEqual(rows.map(r=>r.status),['Active','Active']);assert.ok(rows.every(r=>r.registration_order_id===70));
 f.students[0].Status='Pending';assert.throws(()=>planSessionRegistrations(done,[],c),{code:'LAB_ELIGIBILITY'});f.students[0].Status='Approved';
 const player=rows.find(r=>r.program_id===1);player.status='Waitlist';assert.throws(()=>planSessionRegistrations(done,[player],c),{code:'LAB_ELIGIBILITY'});
 assert.equal(planSessionRegistrations(done,rows,c).create.length,0);assert.equal(player.status,'Waitlist');
});
test('legacy membership uses actual owned session dates for every billing cadence',()=>{
 const f=fixtures(),sessions=catalog(f).sessions,row=active({coverage_start:null,coverage_end:null,subscription_id:12}),subscriptions=[{id:12,user_id:9001,subscription_type:'year'}];
 assert.equal(enrollmentCoverage([row],{sessions,subscriptions})[0].coverage_start,f.sessions[0].season_start);
 assert.equal(enrollmentCoverage([row],{sessions,subscriptions:[{...subscriptions[0],subscription_type:'semester'}]})[0].coverage_start,f.sessions[0].season_start);
 assert.equal(enrollmentCoverage([{...row,workshop_id:4}],{sessions,subscriptions})[0].coverage_start,null);
 assert.equal(enrollmentCoverage([{...row,registration_order_id:99}],{sessions,subscriptions})[0].coverage_start,null);
});

test('every payment preference saves for off-session reuse and retains the canonical customer, including full pay',()=>{
 for(const preference of ['full','semester','monthly']){
  const {order}=reserve(request(preference));assert.equal(order.reservation_payload.payment_intent_data.setup_future_usage,'off_session');assert.equal(order.reservation_payload.customer_creation,'always');assert.equal(order.reservation_payload.customer_email,'test@example.com');
  const done=planNativeOrder('event',order,{session:canonical(order)}).data;assert.equal(done.stripe_customer_id,'cus_unified_test_customer');
 }
 const f=fixtures();f.actor.stripe_customer_id='cus_existing_family';const req=request('semester');req.quote_fingerprint=quoteIdentity(quoteFamily(req,f));const o={id:77,...planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req,now:f.now}).data};assert.equal(o.reservation_payload.customer,'cus_existing_family');assert.equal(o.reservation_payload.customer_creation,undefined);
 assert.equal(planNativeOrder('event',o,{session:{...canonical(o),customer:'cus_other_family'}}).data.status,'review');
});

test('saved-card handling sets a first invoice default, preserves existing defaults and skips no-payment orders',async()=>{
 const {order}=reserve(request('semester')),settled={...order,...planNativeOrder('event',order,{session:canonical(order)}).data};
 const session={id:settled.checkout_session_id,livemode:false,status:'complete',payment_status:'paid',metadata:{checkout_policy:settled.checkout_policy,order_reference:settled.order_reference,quote_version:String(settled.quote_version)},customer:{id:settled.stripe_customer_id,invoice_settings:{default_payment_method:null}},payment_intent:{id:settled.payment_intent_id,setup_future_usage:'off_session',payment_method:{id:'pm_test_saved',customer:settled.stripe_customer_id,type:'card'}}};
 const actions=[],client={async request(action,id,params){actions.push(action);if(action==='session')return session;assert.equal(action,'customer_update');assert.equal(id,settled.stripe_customer_id);assert.equal(params.invoice_settings.default_payment_method,'pm_test_saved');return {...session.customer,invoice_settings:params.invoice_settings};}};
 assert.equal((await saveFamilyPaymentMethod(settled,client)).default_changed,true);assert.deepEqual(actions,['session','customer_update']);
 session.customer.invoice_settings.default_payment_method='pm_existing_subscription_card';actions.length=0;assert.equal((await saveFamilyPaymentMethod(settled,client)).existing_default_preserved,true);assert.deepEqual(actions,['session']);
 actions.length=0;assert.equal((await saveFamilyPaymentMethod({...settled,paid_cents:0,payment_intent_id:null},client)).reason,'no_payment_collected');assert.deepEqual(actions,[]);
 session.payment_intent.payment_method.customer='cus_another_family';await assert.rejects(()=>saveFamilyPaymentMethod(settled,client),{code:'PAYMENT_METHOD_MISMATCH'});
});

test('semester needs no academic boundary and never claims later payments are included',()=>{
 const f=fixtures();for(const session of f.sessions){delete session.second_semester_start;}
 const req=request('semester',[{student_id:9101,session_id:102},{student_id:9101,session_id:21}]);req.quote_fingerprint=quoteIdentity(quoteFamily(req,f));
 const order={id:78,...planNativeOrder('reserve',null,{actor:f.actor,context:f,request:req}).data};
 assert.equal(order.billing_followup,'Needs arrangement');assert.equal(order.quote.items.find(i=>i.session_id===102).tuition_period,'semester');
 const done={...order,...planNativeOrder('event',order,{session:canonical(order)}).data};
 const mail=confirmationData(done,{origin:'http://127.0.0.1:4817'});assert.equal(mail.hasSemester,true);assert.equal(mail.tuitionLabel,'Tuition in this checkout');assert.equal(mail.balanceLabel,'Balance on this order');assert.doesNotMatch(mail.coveredTerms,/Semester [12]/);
});
