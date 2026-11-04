import test from 'node:test';
import assert from 'node:assert/strict';
import {fixtures} from '../test-model/fixtures.mjs';
import {quoteFamily} from '../test-model/quote.mjs';
import {planSessionRegistrations} from '../test-model/session-registrations.mjs';

function setup(){
 const f=fixtures(),quote=quoteFamily({items:[{student_id:9101,session_id:64},{student_id:9102,session_id:65}],aid_percent:35},{...f,actorId:f.actor.id});
 quote.items.forEach(item=>{item.paid_cents=item.due_now_cents;});
 return {order:{id:42,owner_user_id:f.actor.id,checkout_policy:quote.policy,status:'paid',checkout_session_id:'cs_test_fixture_links',paid_cents:62000,quote},catalog:{students:f.students,sessions:f.sessions.map((s,i)=>({id:s.id,Parent_program:13,Parent_workshop:70,Location:5,Tuition_product:73+i,Weekday:'Monday–Friday',Time_block:'9:00 AM–3:00 PM'})),workshops:[{id:70,Name:'Summer Camp'}],locations:[{id:5,Name:'Camp location'}]}};
}
test('paid mixed family produces linked Pending placements; replay preserves staff status and unpaid creates none',()=>{
 const {order,catalog}=setup(),first=planSessionRegistrations(order,[],catalog);
 assert.equal(first.create.length,2);assert.deepEqual(first.create.map(r=>r.student_id),[9101,9102]);
 for(const row of first.create){assert.equal(row.registration_order_id,42);assert.equal(row.parent_user_id,9001);assert.equal(row.status,'Pending');assert.equal(row.subscription_id,null);assert.equal(row.program_name,'Summer Shed');assert.equal(row.workshop_id,70);assert.equal(row.location_id,5);assert.ok(!('paid_cents' in row));}
 const edited=first.create.map((r,i)=>({...r,id:i+1,status:i?'Cancelled':'Active',update_status:i?'Cancelled':'Active'}));
 const copy=structuredClone(edited),replay=planSessionRegistrations(order,edited,{students:[],sessions:[],workshops:[],locations:[]});
 assert.deepEqual(replay,{create:[],reused:2});assert.deepEqual(edited,copy);
 assert.equal(planSessionRegistrations({...order,status:'pending'},[],catalog).create.length,0);
 assert.equal(planSessionRegistrations({...order,status:'review'},[],catalog).create.length,0);
 const partial=planSessionRegistrations(order,edited.slice(0,1),catalog);assert.equal(partial.create.length,1);assert.equal(partial.reused,1);
});
test('registration links reject foreign students, wrong programs, mismatched payments and duplicate existing links',()=>{
 const {order,catalog}=setup();
 assert.throws(()=>planSessionRegistrations({...order,paid_cents:1},[],catalog),/review/);
 assert.throws(()=>planSessionRegistrations(order,[],{...catalog,students:[]}),/review/);
 assert.throws(()=>planSessionRegistrations(order,[],{...catalog,sessions:catalog.sessions.map(s=>({...s,Parent_program:3}))}),/review/);
 const row=planSessionRegistrations(order,[],catalog).create[0];
 assert.throws(()=>planSessionRegistrations(order,[row,row],catalog),/review/);
 assert.throws(()=>planSessionRegistrations(order,[{...row,registration_order_id:43}],catalog),/review/);
});
