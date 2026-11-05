import test from 'node:test';import assert from 'node:assert/strict';
import {staffAidReference} from '../test-model/financial-aid.mjs';import {publicReceipt} from '../test-model/native-order.mjs';
test('staff aid reference reuses only the existing same-parent order aid submission',()=>{
 const order={id:21,owner_user_id:1,checkout_policy:'registration_order_v2',aid_intake:{financial_aid_submission_id:10,annualIncome:50000},quote:{items:[],totals:{}}},aid={id:10,user_id:1,subscription_id:null,status:'Active'};
 assert.equal(staffAidReference(order,aid),10);assert.equal(staffAidReference({...order,financial_aid_submission_id:10},aid),10);assert.equal(staffAidReference({...order,checkout_policy:'summer_family_v1'},aid),10);
 for(const [o,a] of [[order,{...aid,user_id:2}],[order,{...aid,id:11}],[order,{...aid,subscription_id:20}],[{...order,financial_aid_submission_id:11},aid]])assert.throws(()=>staffAidReference(o,a),{code:'AID_RECORD'});
 assert.equal(staffAidReference({...order,aid_intake:null},null),null);
 assert.equal(publicReceipt({...order,financial_aid_submission_id:10}).financial_aid_submission_id,undefined);assert.equal(publicReceipt(order).aid_intake,undefined);
});
