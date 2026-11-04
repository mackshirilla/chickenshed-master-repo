import test from 'node:test';
import assert from 'node:assert/strict';
import {planAidSubmission,linkedAidIntake} from '../test-model/financial-aid.mjs';
import {planNativeOrder,publicReceipt} from '../test-model/native-order.mjs';
import {fixtures} from '../test-model/fixtures.mjs';
import {quoteFamily,quoteIdentity} from '../test-model/quote.mjs';

function setup(){
 const f=fixtures(),context={...f,actorId:f.actor.id};
 const request={items:[{student_id:9101,session_id:64},{student_id:9102,session_id:65}],aid_percent:35,
  aid_data:{relationship:'Grandparent',annualIncome:30000,monthlyExpense:2500,previousParticipant:'No',financial_aid_submission_id:999},attempt_id:'aid_compatibility_0001'};
 request.quote_fingerprint=quoteIdentity(quoteFamily(request,context));
 const args={actor:f.actor,context,request};
 return {args,order:{id:77,...planNativeOrder('reserve',null,args).data}};
}
test('Summer aid uses the familiar fields, reuses one row, cancels on removal and preserves staff state on retry',()=>{
 const {order}=setup();
 assert.equal(order.aid_intake.financial_aid_submission_id,undefined);
 const made=planAidSubmission('reserve',order,null,10),row={id:88,...made.data};
 assert.equal(made.action,'add');assert.equal(row.status,'Pending');assert.equal(row.subscription_id,null);
 assert.equal(row.user_id,order.owner_user_id);assert.equal(row.contact_id,10);assert.equal(row.selected_discount,35);
 assert.equal(row.previous_participant,false);assert.equal(row.relationship,'Grandparent');assert.match(row.record_title,/^Summer Shed — Order #77/);
 order.aid_intake=linkedAidIntake(order.aid_intake,{financial_aid_submission_id:88});
 assert.equal(planAidSubmission('reserve',order,{...row,status:'Active'},10).action,'none');
 assert.equal(planAidSubmission('reserve',order,{...row,status:'Cancelled'},10).action,'none');
 order.aid_intake.annualIncome=32000;
 assert.equal(planAidSubmission('reserve',order,row,10).data.annual_income,32000);
 const removed={...order,quote:{...order.quote,aid_percent:0},aid_intake:linkedAidIntake(null,order.aid_intake)};
 assert.deepEqual(planAidSubmission('replace',removed,row,10),{action:'cancel',id:88,data:{status:'Cancelled'}});
 assert.equal(planAidSubmission('replace',order,{...row,status:'Cancelled'},10).id,88);
 assert.equal(planAidSubmission('event',order,row,10).action,'none');
 assert.equal(planAidSubmission('reserve',{...order,status:'paid'},row,10).action,'none');
 assert.equal(planAidSubmission('reserve',{...removed,aid_intake:null},null).action,'none');
 assert.equal(publicReceipt(order).aid_intake,undefined);
 assert.throws(()=>planAidSubmission('reserve',order,{...row,user_id:42},10),{code:'AID_RECORD'});
 assert.throws(()=>planAidSubmission('reserve',order,{...row,subscription_id:5},10),{code:'AID_RECORD'});
});
test('same-price checkout retries can update intake without losing the private existing aid link',()=>{
 const {args,order}=setup();order.aid_intake.financial_aid_submission_id=88;
 const updatedArgs={...args,request:{...args.request,aid_data:{...args.request.aid_data,annualIncome:33000}}};
 const updated=planNativeOrder('reserve',order,updatedArgs);
 assert.equal(updated.write,'edit');assert.equal(updated.data.aid_intake.annualIncome,33000);
 assert.equal(updated.data.aid_intake.financial_aid_submission_id,88);
 assert.equal(planNativeOrder('reserve',{...order,...updated.data},updatedArgs).write,'none');
});
