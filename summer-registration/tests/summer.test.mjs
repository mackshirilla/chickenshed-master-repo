import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fixtures } from '../test-model/fixtures.mjs';
import { quoteFamily, quoteIdentity } from '../test-model/quote.mjs';
import { SummerService } from '../test-model/service.mjs';
import { LocalRepository } from '../test-model/repository.mjs';
import { SimulatedStripe } from '../test-model/simulated-stripe.mjs';
import { signFixture } from '../test-model/signature.mjs';
const origin = 'http://127.0.0.1:4817', secret = 'unit-fixture-signing-secret';
const intake = { relationship: 'Parent', annualIncome: 30000, monthlyExpense: 2500, previousParticipant: 'Yes' };
function setup(repository = new LocalRepository()) {
  const catalog = fixtures(), stripe = new SimulatedStripe(repository.state);
  const service = new SummerService({ repository, stripe, catalog, origin, webhookSecret: secret });
  return { catalog, repository, stripe, service, actor: catalog.actor };
}
const selection = (items, aid = 0) => ({ items: items.map(([student_id, session_id]) => ({ student_id, session_id })), aid_percent: aid });
async function checkout(context, request, attempt = 'test_attempt_00000001') {
  const quote = context.service.quote(context.actor, request);
  return context.service.checkout(context.actor, { ...request, aid_data: intake, attempt_id: attempt, quote_fingerprint: quoteIdentity(quote) });
}
async function paidEvent(context, id) {
  const signed = signFixture(context.stripe.paidFixture(id), secret);
  return context.service.webhook(signed.body, signed.signature);
}

test('mixed family: aid discounts tuition only; one combined amount and correct per-child balances', () => {
  const f = fixtures();
  const quote = quoteFamily(selection([[9101,64],[9102,65]], 35), { ...f, actorId: f.actor.id });
  assert.deepEqual(quote.items.map(item => [item.payment_option, item.due_now_cents, item.balance_after_checkout_cents]), [['full',52000,0],['deposit',10000,94000]]);
  assert.deepEqual(quote.totals, { tuition_cents:240000, aid_cents:84000, net_tuition_cents:156000, checkout_gross_cents:90000, checkout_discount_cents:28000, due_now_cents:62000, balance_after_checkout_cents:94000 });
  assert.equal(quote.lines.find(line => line.product.endsWith('deposit')).amount_discount, 0);
});

test('family quantities and statuses: two Pending children each owe a $100 deposit', () => {
  const f = fixtures(); f.students[0].Status = 'Pending';
  const quote = quoteFamily(selection([[9101,66],[9102,65]], 75), { ...f, actorId: f.actor.id });
  assert.equal(quote.totals.due_now_cents, 20000); assert.equal(quote.lines[0].quantity, 2);
  assert.equal(quote.coupon_id, null); assert.equal(quote.totals.balance_after_checkout_cents, 75000);
});

test('all approved family totals retain original package prices and use one aid selection', () => {
  const f = fixtures(); const quote = quoteFamily(selection([[9101,64],[9103,66]], 20), { ...f, actorId: f.actor.id });
  assert.equal(quote.totals.due_now_cents, 240000); assert.equal(quote.totals.balance_after_checkout_cents, 0);
  assert.equal(quote.items.length, 2); assert.equal(quote.lines.length, 2);
});

test('unrestricted shared coupons cannot reduce a mixed cart; ownership and unavailable rows are rejected', () => {
  const f = fixtures(); f.coupons.find(row => row.percent_off === 35).products.push('prod_fixture_deposit');
  assert.throws(() => quoteFamily(selection([[9101,64],[9102,65]],35),{...f,actorId:9001}), { code:'AID_UNAVAILABLE' });
  const g = fixtures();
  for (const items of [[[9201,64]],[[9104,64]],[[9101,999]],[[9101,64],[9101,64]]]) {
    assert.throws(() => quoteFamily(selection(items),{...g,actorId:9001}));
  }
  g.students[0].Status = '';
  assert.throws(() => quoteFamily(selection([[9101,64]]),{...g,actorId:9001}), {code:'STUDENT_STATUS'});
});

test('concurrent submit and cancel/resume reuse one Session; payment event repeats allocate once', async () => {
  const f = setup(); const request = selection([[9101,64],[9102,65]],35);
  const results = await Promise.all([checkout(f,request), checkout(f,request)]);
  assert.equal(results[0].url,results[1].url); assert.equal(f.stripe.createCalls,1);
  const order = f.repository.state.orders[0], id=order.checkout_session_id;
  assert.equal(order.quote.items[1].paid_cents,0);
  const first = await paidEvent(f,id); assert.equal(first.applied,true);
  const repeated = await paidEvent(f,id); assert.equal(repeated.applied,false);
  assert.equal(order.paid_cents,62000); assert.deepEqual(order.quote.items.map(item=>item.paid_cents),[52000,10000]);
  assert.equal(f.catalog.students[1].Status,'Pending'); assert.equal(f.repository.state.orders.length,1);
  assert.deepEqual(f.repository.state.accounting,[],'summer handler must not duplicate existing generic sales writes');
  const retry=await checkout(f,request); assert.equal(retry.status,'paid');assert.equal(f.stripe.createCalls,1);
  const payload=f.repository.state.sessions[id].payload;
  assert.equal(payload.mode,'payment'); assert.equal(payload.line_items.length,2);
  assert.equal(payload.payment_method_types,undefined); assert.equal(payload.invoice_creation,undefined);
  assert.equal(payload.subscription_data,undefined); assert.equal(payload.payment_intent_data.setup_future_usage,undefined);
  assert.equal(payload.allow_promotion_codes,undefined);
});

test('editing an open quote expires old Session before replacing it; old events do not mark new quote paid',async()=>{
  const f=setup(); await checkout(f,selection([[9101,64],[9102,65]],20));
  const order=f.repository.state.orders[0],oldId=order.checkout_session_id;
  await checkout(f,selection([[9101,64],[9102,65]],35));
  assert.equal(f.repository.state.sessions[oldId].status,'expired'); assert.equal(order.version,2);assert.equal(order.previous_checkouts.length,1);
  const event={id:'evt_expired_fixture',type:'checkout.session.expired',livemode:false,data:{object:{id:oldId}}};
  const signed=signFixture(event,secret); assert.equal((await f.service.webhook(signed.body,signed.signature)).ignored,true);
  assert.equal(order.status,'pending'); await paidEvent(f,order.checkout_session_id);assert.equal(order.paid_cents,62000);
});

test('paid-during-expiration race returns original paid order and never creates another Session',async()=>{
  const f=setup();await checkout(f,selection([[9101,64]],20));
  const id=f.repository.state.orders[0].checkout_session_id;
  f.stripe.expire=async current=>{f.stripe.paidFixture(current);throw new Error('completed');};
  const result=await checkout(f,selection([[9101,64]],35));
  assert.equal(result.status,'paid');assert.equal(f.stripe.createCalls,1);assert.equal(f.repository.state.orders[0].paid_cents,64000);
  assert.equal(f.repository.state.orders[0].checkout_session_id,id);
});

test('forged signature and wrong canonical amount never mark an order paid',async()=>{
  const f=setup();await checkout(f,selection([[9101,64],[9102,65]],35));const order=f.repository.state.orders[0];
  const signed=signFixture(f.stripe.paidFixture(order.checkout_session_id),secret);
  await assert.rejects(f.service.webhook(signed.body,signed.signature.replace(/v1=(.)/,(_,first)=>`v1=${first==='0'?'1':'0'}`)), {code:'SIGNATURE_INVALID'});
  f.repository.state.sessions[order.checkout_session_id].amount_total=1;
  await assert.rejects(f.service.webhook(signed.body,signed.signature),{code:'PAYMENT_MISMATCH'});assert.equal(order.status,'review');assert.equal(order.paid_cents,0);
  assert.equal((await f.service.staff({role:'staff'}))[0].observed_payment_cents,1);
});

test('completed but unpaid checkout cannot be replaced while payment may still settle',async()=>{
  const f=setup();await checkout(f,selection([[9101,64]],20));
  f.repository.state.sessions[f.repository.state.orders[0].checkout_session_id].status='complete';
  await assert.rejects(checkout(f,selection([[9101,64]],35)),{code:'PAYMENT_PENDING'});
  assert.equal(f.stripe.createCalls,1);
});

test('receipt and staff views require ownership/role and do not confirm unpaid orders',async()=>{
  const f=setup();await checkout(f,selection([[9101,64],[9102,65]],35));const id=f.repository.state.orders[0].checkout_session_id;
  assert.equal((await f.service.receipt(f.actor,id)).status,'pending');
  await assert.rejects(f.service.receipt({id:9002},id),{code:'NOT_FOUND'});
  await assert.rejects(f.service.staff(f.actor),{code:'FORBIDDEN'});
  await paidEvent(f,id); const staff=await f.service.staff({id:9900,role:'staff'});assert.equal(staff[0].items.length,2);assert.equal(staff[0].paid_cents,62000);
  const update={order_id:staff[0].order_id,handled:true,staff_notes:'Review pending child; arrange balance.',paid_cents:0,status:'pending'};
  await assert.rejects(f.service.staffUpdate(f.actor,update),{code:'FORBIDDEN'});
  await f.service.staffUpdate({id:9900,role:'staff'},update);
  const order=f.repository.state.orders[0];assert.equal(order.handled,true);assert.equal(order.staff_notes,update.staff_notes);
  assert.equal(order.paid_cents,62000);assert.equal(order.status,'paid');
});

test('local order payment survives process restart without a new checkout',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'summer-bridge-'));
  const file=path.join(directory,'orders.json');const repository=await new LocalRepository(file).init();const f=setup(repository);
  const request=selection([[9101,64],[9102,65]],35);await checkout(f,request);await paidEvent(f,repository.state.orders[0].checkout_session_id);
  const next=setup(await new LocalRepository(file).init());const retry=await checkout(next,request);
  assert.equal(retry.status,'paid');assert.equal(next.stripe.createCalls,0);assert.equal(next.repository.state.orders[0].quote.items[1].paid_cents,10000);
});
