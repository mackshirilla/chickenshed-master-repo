import test from 'node:test';import assert from 'node:assert/strict';
import {currentRegistrationEntry,repairRegistrationEntryLinks} from '../../src/modules/registration-orders/entry-links.mjs';
test('Webflow links following the rollback page reach canonical registration without changing other links',()=>{
 const origin='https://www.chickenshednyc.org';
 assert.equal(currentRegistrationEntry('/program-registration-legacy',origin),'/program-registration');
 for(const path of ['/program-registration-old','/lab-registration','/summer-camp-registration'])assert.equal(currentRegistrationEntry(path+'?program=3',origin),'/program-registration?program=3');
 assert.equal(currentRegistrationEntry(origin+'/program-registration-legacy/?program=players#registration',origin),'/program-registration?program=players#registration');
 for(const href of ['/program-registration','/checkout-success/summer-camp-success?session_id=existing','https://other.example/program-registration-legacy'])assert.equal(currentRegistrationEntry(href,origin),null);
 let redirected=null;assert.equal(repairRegistrationEntryLinks({querySelectorAll(){throw Error('No page setup during redirect');}},{origin,href:origin+'/program-registration-legacy?session=3',replace(value){redirected=value;}}),true);assert.equal(redirected,'/program-registration?session=3');
});
