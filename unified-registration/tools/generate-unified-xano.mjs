// Reuse the working Summer native adapter scaffold, emitting NEW sandbox resources only.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),base=new URL('xano/sandbox/',root);await mkdir(base,{recursive:true});
let generator=await readFile(new URL('tools/generate-xano-native.mjs',root),'utf8');
generator=generator.replace("../xano/summer-sandbox/","../xano/sandbox/").replace("'../src/'+name+'.mjs'","'../test-model/'+name+'.mjs'");
generator=generator.replace("'session-registrations','native-order'","'session-registrations','native-order','payment-method'");
generator=generator.replace('../src/sandbox-origin.mjs','../test-model/sandbox-origin.mjs');
generator=generator.replaceAll('summer_','registration_').replaceAll('summerSuccessUrl','registrationSuccessUrl').replaceAll('Summer Bridge Sandbox','Unified Registration Sandbox').replaceAll('registration_bridge_native','unified_registration').replaceAll('summer/','registration/').replaceAll('registration_family_v1','registration_order_v2').replaceAll('Summer ','Registration ').replaceAll('summer26','registration26').replaceAll('summer-camp-registration','registration-preview');
generator=generator.replaceAll('registration_bridge_fixture_guard','summer_bridge_fixture_guard').replaceAll('registration_stripe_test_api_key','summer_stripe_test_api_key').replaceAll('registration_stripe_test_webhook_secret','summer_stripe_test_webhook_secret').replaceAll('registration_staff_user_ids','summer_staff_user_ids');
generator=generator.replace("'observed_payment_intent_id'];","'observed_payment_intent_id','payment_preference','covered_terms','billing_followup'];");
generator=generator.replaceAll('$db.Sessions.Parent_program == 13','($db.Sessions.Parent_program == 1 || $db.Sessions.Parent_program == 3 || $db.Sessions.Parent_program == 10 || $db.Sessions.Parent_program == 13)').replaceAll('$db.Products.id >= 73 && $db.Products.id <= 76','$db.Products.category == "Registration"');
generator=generator.replaceAll("'  json items\\n  int aid_percent?=0'","'  json items\\n  int aid_percent?=0\\n  text? payment_preference?'").replaceAll("['items','aid_percent']","['items','aid_percent','payment_preference']").replaceAll("['items','aid_percent','aid_data','attempt_id','quote_fingerprint']","['items','aid_percent','aid_data','attempt_id','quote_fingerprint','payment_preference']");

generator=generator.replace('db.query Workshops { return = {type:"list"} } as $placement_workshops',`db.query session_registrations {
 where = $db.session_registrations.parent_user_id == $order.owner_user_id
 return = {type:"list"}
} as $placement_enrollments
db.query registration_orders {
 where = $db.registration_orders.owner_user_id == $order.owner_user_id
 return = {type:"list"}
} as $placement_orders
db.query subscriptions {
 where = $db.subscriptions.user_id == $order.owner_user_id
 return = {type:"list"}
} as $placement_subscriptions
db.query Workshops { return = {type:"list"} } as $placement_workshops`);
generator=generator.replace('students:$var.placement_students})','students:$var.placement_students,enrollments:$var.placement_enrollments,orders:$var.placement_orders,subscriptions:$var.placement_subscriptions})');
// Record a settled payment even if membership changed while the customer was in Checkout.
generator=generator.replace("${check('placement_plan','Registration registrations could not be linked. Please retry confirmation or contact Chickenshed.')}\n    foreach ($placement_plan.create)",`var $placement_create { value = [] }
conditional {
 if ($placement_plan.ok === true) {
 var.update $placement_create { value = $placement_plan.create }
 }
 else {
 db.edit registration_orders {
 field_name = "id"
 field_value = $order.id
 data = {status:"review",review_reason:$placement_plan.code}
 } as $review_order
 var.update $order { value = $review_order }
 }
}
    foreach ($placement_create)`);

// Link only the canonical Checkout customer to this authenticated family's existing contact.
// Do not replace a different stored customer or set an invoice/subscription default here.
generator=generator.replace('db.query session_registrations {\n     where = $db.session_registrations.registration_order_id == $order.id',`db.query contacts {
 where = $db.contacts.user_id == $order.owner_user_id
 return = {type:"single"}
} as $payment_contact
conditional {
 if ($payment_contact != null && $order.stripe_customer_id != null && ($payment_contact.stripe_customer_id == null || $payment_contact.stripe_customer_id == "")) {
 db.edit contacts {
 field_name = "id"
 field_value = $payment_contact.id
 data = {stripe_customer_id:$order.stripe_customer_id}
 } as $linked_payment_contact
 }
}
db.query session_registrations {
     where = $db.session_registrations.registration_order_id == $order.id`);

// Base context also supplies program metadata, and existing enrollments to avoid duplicate charges.
generator=generator.replace('${lambda(`const a=$var.actor,c=$var.contact;', 'db.query Programs { return = {type:"list"} } as $programs\ndb.query Workshops { return = {type:"list"} } as $workshops\ndb.query session_registrations {\n where = $db.session_registrations.parent_user_id == $input.actor_id\n return = {type:"list"}\n} as $enrollments\ndb.query Sessions { return = {type:"list"} } as $coverage_sessions\ndb.query registration_orders {\n where = $db.registration_orders.owner_user_id == $input.actor_id\n return = {type:"list"}\n} as $orders\ndb.query subscriptions {\n where = $db.subscriptions.user_id == $input.actor_id\n return = {type:"list"}\n} as $subscriptions\n${lambda(`const a=$var.actor,c=$var.contact;');
generator=generator.replace('students:$var.students,sessions:$var.sessions,products:$var.products','students:$var.students,sessions:$var.sessions,products:$var.products,programs:$var.programs,workshops:$var.workshops,enrollments:$var.enrollments,coverage_sessions:$var.coverage_sessions,orders:$var.orders,subscriptions:$var.subscriptions');
// Replace the Summer-specific catalog normalizer with the audited general catalog implementation.
const start=generator.indexOf('const client=new StripeTestClient({key:$env.summer_stripe_test_api_key}),base=$var.base;');
const end=generator.indexOf("`),'result')}",start);if(start<0||end<0)throw Error('Quote-context scaffold changed');
const code=await readFile(new URL('catalog-context.js.txt',root),'utf8');generator=generator.slice(0,start)+code+generator.slice(end);
// Preserve safe business-validation details instead of masking them as pricing outages.
generator=generator.replace("code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:","code:e.code||'SUMMER_UNAVAILABLE',issues:e.issues||[],message:e.code?e.message:");
generator=generator.replace("${check('result','Registration test pricing is not configured or failed validation.')}",'precondition ($result.ok === true) { error = $result.message\n payload = {registration_code:$result.code,issues:$result.issues} }');
// Only the authenticated checkout route can request coupon provisioning.
generator=generator.replace("fn('registration_quote_context_v1','  int actor_id\\n  json request'","fn('registration_quote_context_v1','  int actor_id\\n  json request\\n  bool ensure_aid_coupon?=false'");
generator=generator.replace("${req(['items','aid_percent','aid_data','attempt_id','quote_fingerprint','payment_preference'])}\n${quoteContext}","${req(['items','aid_percent','aid_data','attempt_id','quote_fingerprint','payment_preference'])}\n${quoteContext.replace('request:$request','request:$request,ensure_aid_coupon:true')}");
const old="const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · ')})),aid_rates:[10,20,35,50,75]};";
const fresh="const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.filter(s=>[1,3,10,13].includes(s.Parent_program)&&(s.Parent_program!==10||(Number(s.Start_Date)>0&&Number(s.End_Date)>=Date.now()))).map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · '),program_id:s.Parent_program,start_date:s.Start_Date,end_date:s.End_Date,program_name:b.programs.find(p=>p.id===s.Parent_program)?.name||'',workshop_id:s.Parent_workshop,workshop_name:b.workshops.find(w=>w.id===s.Parent_workshop)?.Name||s.Name,payment_options:s.Parent_program===13?['full']:['full',...(b.products.find(p=>p.id===s.Tuition_product)?.Semester_price_id?['semester']:[]),...(b.products.find(p=>p.id===s.Deposit_product)?.Single_sale_price_id?['monthly']:[])]})),aid_rates:[10,20,35,50,75]};";
if(!generator.includes(old))throw Error('Start scaffold changed');generator=generator.replace(old,fresh);
generator=generator.replace(/await import\('\.\/generate-xano-email.mjs'\);?/g,'');
await writeFile(new URL('tools/.run-unified-scaffold.mjs',root),generator);await import('./.run-unified-scaffold.mjs');
const quoteSource=(await readFile(new URL('test-model/quote.mjs',root),'utf8')).replace(/^export /gm,'');
await writeFile(new URL('function/registration_quote_v1.xs',base),`function registration_quote_v1 {\n input { json request\n json context }\n stack {\n function.run summer_bridge_fixture_guard { input = {} } as $guard\n api.lambda { code = """\n${quoteSource}\ntry { return {ok:true,...quoteFamily($input.request,$input.context)}; } catch(e) { return {ok:false,code:e.code||'QUOTE_UNAVAILABLE',issues:e.issues||[],message:e.code?e.message:'Pricing is temporarily unavailable.'}; }\n"""\n timeout = 30 } as $quote\n precondition ($quote.ok === true) { error = $quote.message\n payload = {registration_code:$quote.code,issues:$quote.issues} }\n }\n response = $quote\n}\n`);
console.log('Generated new unified sandbox adapter; existing Summer resources unchanged.');

const cardSources=await Promise.all(['quote','stripe-native','payment-method'].map(async name=>(await readFile(new URL('test-model/'+name+'.mjs',root),'utf8')).replace(/^import .*\n/gm,'').replace(/^export /gm,'')));
await writeFile(new URL('function/registration_save_payment_method_v1.xs',base),`function registration_save_payment_method_v1 {
 input { int order_id }
 stack {
 function.run summer_bridge_fixture_guard { input = {} } as $guard
 db.get registration_orders {
 field_name = "id"
 field_value = $input.order_id
 } as $order
 api.lambda { code = """
${cardSources.join('\n')}
try { return {ok:true,...await saveFamilyPaymentMethod($var.order,new StripeTestClient({key:$env.summer_stripe_test_api_key}))}; }catch(e){return {ok:false,saved:null,stripe_operation:e.stripe_operation||null,http_status:e.provider_status||null,provider_code:e.provider_code||null,code:e.code||'PAYMENT_METHOD_UNAVAILABLE',message:e.code?e.message:'Saved payment method needs review.'};}
"""
 timeout = 30 } as $result
 }
 response = $result
}
`);
