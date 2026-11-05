import test from 'node:test';import assert from 'node:assert/strict';
import {orderedRegistrationOptions,selectableRegistrationSessions} from '../../src/modules/registration-orders/selection-order.mjs';
test('Registration names sort naturally without changing their source order',()=>{
 const rows=[{id:10,label:'Players 10'},{id:4,label:'players 4'},{id:2,label:'Players 2'},{id:1,label:'Labs'}];
 assert.deepEqual(orderedRegistrationOptions(rows).map(r=>r.id),[1,2,4,10]);assert.deepEqual(rows.map(r=>r.id),[10,4,2,1]);
});
test('Ended sessions are not offered as new selections',()=>{const sessions=[{id:1,end_date:99},{id:2,end_date:101},{id:3}];assert.deepEqual(selectableRegistrationSessions(sessions,100).map(s=>s.id),[2,3]);});
