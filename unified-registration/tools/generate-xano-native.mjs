import {mkdir,readFile,writeFile} from 'node:fs/promises';
const base=new URL('../xano/summer-sandbox/',import.meta.url);
for(const d of ['function','api/summer_bridge_native'])await mkdir(new URL(d+'/',base),{recursive:true});
async function put(name,value){let previous='';try{previous=await readFile(new URL(name,base),'utf8')}catch{}const guid=previous.match(/\n\s*guid\s*=\s*"([^\"]+)"/);if(guid&&!/\n\s*guid\s*=/.test(value))value=value.replace(/}\s*$/,` guid = "${guid[1]}"\n}`);value=value.replace(/db.query ([^\n{]+) \{ where = ([^\n]+?) return = ([^\n]+?) \} as/g,'db.query $1 {\n where = $2\n return = $3\n} as').replaceAll(' { error_type = \"accessdenied\" error =',' {\n error_type = \"accessdenied\"\n error =').replaceAll(' { error_type = \"notfound\" error =',' {\n error_type = \"notfound\"\n error =').replaceAll('encoding = \"none\" exclude_middleware = true','encoding = \"none\"\n exclude_middleware = true');await writeFile(new URL(name,base),value+'\n');}
const sources=await Promise.all(['quote','stripe-native','financial-aid','session-registrations','native-order'].map(async name=>(await readFile(new URL('../src/'+name+'.mjs',import.meta.url),'utf8')).replace(/^import .*\n/gm,'').replace(/^export /gm,'')));
const core=sources.join('\n');
const guard='function.run summer_bridge_fixture_guard { input = {} } as $sandbox_guard';
const lambda=(code,name)=>`api.lambda {\n code = """\n${code.split('\n').map(l=>'  '+l).join('\n')}\n  """\n timeout = 30\n} as $${name}`;
const check=(name,message='Summer sandbox request failed validation.',errorType)=>`precondition ($${name}.ok === true) {${errorType?'\n error_type = "'+errorType+'"\n':''} error = "${message}" }`;
const safe=(code)=>`try { ${code} } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Summer service is temporarily unavailable.'}; }`;
const fn=(name,input,stack,response)=>`// Isolated sandbox integration only. No live credential fallback.\nfunction ${name} {\n input {\n${input}\n }\n stack {\n${guard}\n${stack}\n }\n response = ${response}\n}`;
const query=(path,verb,input,stack,response,auth=true)=>`// Isolated sandbox integration only; never publish/promote this pack.\nquery "${path}" verb=${verb} {\n api_group = "Summer Bridge Sandbox"\n${auth?' auth = "users"\n':''} input {\n${input}\n }\n stack {\n${guard}\n${stack}\n }\n response = ${response}\n}`;
const fields=['order_reference','attempt_key','owner_user_id','parent_email','balance_after_checkout_cents','quote_version','status','checkout_policy','quote_fingerprint','quote','aid_intake','item_summary','checkout_session_id','session_snapshot','paid_cents','payment_intent_id','paid_at','event_ids','previous_checkouts','handled','staff_notes','checkout_url','stripe_customer_id','reservation_payload','review_reason','observed_payment_cents','observed_payment_intent_id'];
const data='{'+fields.map(f=>`${f}: $plan.data.${f}`).join(', ')+'}';
await put('function/summer_order_v1.xs',fn('summer_order_v1','  text phase\n  text order_reference\n  json args',`var $order { value = null }
var $result { value = null }
db.transaction {
 stack {
  db.query registration_orders {
   lock = true
   where = $db.registration_orders.order_reference == $input.order_reference
   return = {type: "single"}
  } as $existing
  ${lambda(core+'\n'+safe(`const plan=planNativeOrder($input.phase,$var.existing,$input.args);const defaults=Object.fromEntries(${JSON.stringify(fields)}.map(k=>[k,null]));if(plan.data)plan.data={...defaults,...($var.existing||{}),...plan.data};return {...plan,message:plan.message||'Summer request failed.'};`),'plan')}
  precondition ($plan.ok === true) { error = $plan.message }
  conditional {
   if ($plan.write == "add") {
    db.add registration_orders { data = ${data} } as $created
    var.update $order { value = $created }
   }
   elseif ($plan.write == "edit") {
    db.edit registration_orders {
     field_name = "id"
     field_value = $existing.id
     data = ${data}
    } as $updated
    var.update $order { value = $updated }
   }
   else { var.update $order { value = $existing } }
  }
  conditional {
   if (($input.phase == "reserve" || $input.phase == "replace") && $order.status != "paid") {
    var $aid_existing { value = null }
    ${lambda(`return $var.order.aid_intake?.financial_aid_submission_id||0;`,'aid_id')}
    conditional {
     if ($aid_id > 0) {
      db.get financial_aid_submissions {
       field_name = "id"
       field_value = $aid_id
      } as $found_aid
      var.update $aid_existing { value = $found_aid }
     }
    }
    db.query contacts {
     where = $db.contacts.user_id == $order.owner_user_id
     return = {type:"single"}
    } as $aid_contact
    ${lambda(core+'\n'+safe(`return {ok:true,...planAidSubmission($input.phase,$var.order,$var.aid_existing,$var.aid_contact?.id)};`),'aid_plan')}
    ${check('aid_plan','Summer financial aid could not be saved. Please retry.')}
    conditional {
     if ($aid_plan.action == "add") {
      db.add financial_aid_submissions {
       data = {record_title:$aid_plan.data.record_title,status:$aid_plan.data.status,annual_income:$aid_plan.data.annual_income,monthly_expenses:$aid_plan.data.monthly_expenses,relationship:$aid_plan.data.relationship,previous_participant:$aid_plan.data.previous_participant,user_id:$aid_plan.data.user_id,contact_id:$aid_plan.data.contact_id,selected_discount:$aid_plan.data.selected_discount,subscription_id:null,ends_on:null}
      } as $created_aid
      ${lambda(`return {...$var.order.aid_intake,financial_aid_submission_id:$var.created_aid.id};`,'aid_link')}
      db.edit registration_orders {
       field_name = "id"
       field_value = $order.id
       data = {aid_intake:$aid_link}
      } as $linked_order
      var.update $order { value = $linked_order }
     }
     elseif ($aid_plan.action == "edit") {
      db.edit financial_aid_submissions {
       field_name = "id"
       field_value = $aid_plan.id
       data = {record_title:$aid_plan.data.record_title,status:$aid_plan.data.status,annual_income:$aid_plan.data.annual_income,monthly_expenses:$aid_plan.data.monthly_expenses,relationship:$aid_plan.data.relationship,previous_participant:$aid_plan.data.previous_participant,user_id:$aid_plan.data.user_id,contact_id:$aid_plan.data.contact_id,selected_discount:$aid_plan.data.selected_discount}
      } as $updated_aid
     }
     elseif ($aid_plan.action == "cancel") {
      db.edit financial_aid_submissions {
       field_name = "id"
       field_value = $aid_plan.id
       data = {status:"Cancelled"}
      } as $cancelled_aid
     }
    }
   }
  }
  conditional {
   if (($input.phase == "event" || $input.phase == "attach") && $order.status == "paid") {
    db.query session_registrations {
     where = $db.session_registrations.registration_order_id == $order.id
     return = {type:"list"}
    } as $placements
    db.query Sessions {
     where = $db.Sessions.Parent_program == 13
     return = {type:"list"}
    } as $placement_sessions
    db.query Workshops { return = {type:"list"} } as $placement_workshops
    db.query Locations { return = {type:"list"} } as $placement_locations
    db.query student_profiles {
     where = $db.student_profiles.parent_user_id == $order.owner_user_id
     return = {type:"list"}
    } as $placement_students
    ${lambda(core+'\n'+safe(`return {ok:true,...planSessionRegistrations($var.order,$var.placements,{sessions:$var.placement_sessions,workshops:$var.placement_workshops,locations:$var.placement_locations,students:$var.placement_students})};`),'placement_plan')}
    ${check('placement_plan','Summer registrations could not be linked. Please retry confirmation or contact Chickenshed.')}
    foreach ($placement_plan.create) {
     each as $placement {
      db.add session_registrations {
       data = {registration_order_id:$placement.registration_order_id,status:$placement.status,update_status:$placement.update_status,student_id:$placement.student_id,parent_user_id:$placement.parent_user_id,session_id:$placement.session_id,program_id:$placement.program_id,program_name:$placement.program_name,subscription_id:null,workshop_id:$placement.workshop_id,workshop_name:$placement.workshop_name,weekday:$placement.weekday,time_block:$placement.time_block,location_id:$placement.location_id,location:$placement.location,product_id:$placement.product_id,update_product_id:$placement.update_product_id,checkout_session_id:$placement.checkout_session_id,move_to:null}
      } as $created_placement
     }
    }
   }
  }
  ${lambda(`return {ok:true,...$var.plan.result,order:$var.order};`,'summer_operation_result')}
  var.update $result { value = $summer_operation_result }
 }
}`,'$result'));
await put('function/summer_context_v1.xs',fn('summer_context_v1','  int actor_id',`db.get users {
 field_name = "id"
 field_value = $input.actor_id
 output = ["id", "email"]
} as $actor
precondition ($actor != null) { error_type = "accessdenied" error = "Please sign in." }
db.query contacts { where = $db.contacts.user_id == $input.actor_id return = {type: "single"} } as $contact
db.query student_profiles { where = $db.student_profiles.parent_user_id == $input.actor_id && $db.student_profiles.Status != "Archived" return = {type: "list"} } as $students
db.query Sessions { where = $db.Sessions.Parent_program == 13 && $db.Sessions.Draft != true && $db.Sessions.Archived != true return = {type: "list"} } as $sessions
db.query Products { where = $db.Products.id >= 73 && $db.Products.id <= 76 return = {type: "list"} } as $products
${lambda(`const a=$var.actor,c=$var.contact;return {ok:true,actor:{id:a.id,email:a.email,stripe_customer_id:c?.stripe_customer_id||null},students:$var.students,sessions:$var.sessions,products:$var.products};`,'context')}`,'$context'));
await put('function/summer_quote_context_v1.xs',fn('summer_quote_context_v1','  int actor_id\n  json request',`function.run summer_context_v1 { input = {actor_id:$input.actor_id} } as $base
${lambda(core+'\n'+safe(`const client=new StripeTestClient({key:$env.summer_stripe_test_api_key}),base=$var.base;requireValue(base.sessions.length===3,'CATALOG_INVALID','Summer test catalog is incomplete.',503);const sessions=[];for(const row of base.sessions){requireValue([64,65,66].includes(row.id),'CATALOG_INVALID','Unexpected summer package.',503);const prices={};for(const kind of ['tuition','deposit']){const p=base.products.find(p=>p.id===row[kind==='tuition'?'Tuition_product':'Deposit_product']);requireValue(p?.Single_sale_price_id&&p.Product_id,'CATALOG_INVALID','Summer test catalog is incomplete.',503);const price=await client.request('price',p.Single_sale_price_id,{expand:['product']});requireValue(price.livemode===false&&price.active===true&&price.type==='one_time'&&price.currency==='usd'&&price.product?.active===true&&price.product.id===p.Product_id&&price.unit_amount===Math.round(Number(p.Single_sale_price_amount)*100),'CATALOG_INVALID','Summer test pricing does not match.',503);prices[kind]={price_id:price.id,product_id:p.Product_id,cents:price.unit_amount,currency:price.currency,type:price.type,active:true};}sessions.push({id:row.id,name:row.Name,time:[row.Weekday,row.Time_block].filter(Boolean).join(' · '),program_id:13,draft:false,archived:false,...prices});}let couponIds={};try{couponIds=JSON.parse($env.summer_stripe_test_coupon_ids||'{}')}catch{}const percent=Number($input.request.aid_percent||0),coupons=[];const approved=($input.request.items||[]).some(item=>base.students.some(s=>s.id===Number(item.student_id)&&s.Status==='Approved'));if(percent&&approved&&couponIds[percent]){const coupon=await client.request('coupon',couponIds[percent],{expand:['applies_to']});coupons.push({id:coupon.id,valid:coupon.valid,duration:coupon.duration,percent_off:coupon.percent_off,products:coupon.applies_to?.products||[]});}return {ok:true,actor:base.actor,context:{actorId:base.actor.id,students:base.students,sessions,coupons}};`),'result')}
${check('result','Summer test pricing is not configured or failed validation.')}`,'$result'));
await put('function/summer_stripe_session_v1.xs',fn('summer_stripe_session_v1','  text action\n  text? session_id?\n  json? payload?\n  text? idempotency_key?',`${lambda(core+'\n'+safe(`const client=new StripeTestClient({key:$env.summer_stripe_test_api_key});if($input.action==='create'){requireValue($input.payload?.mode==='payment'&&$input.payload.metadata?.checkout_policy===POLICY,'STRIPE_OPERATION','Unsupported checkout request.',400);const made=await client.request('create',null,$input.payload,$input.idempotency_key);return {ok:true,session:await client.retrieve(made.id)};}if($input.action==='retrieve')return {ok:true,session:await client.retrieve($input.session_id)};if($input.action==='expire'){try{await client.request('expire',$input.session_id,{},'summer_expire_'+$input.session_id);}catch(e){const latest=await client.retrieve($input.session_id);if(latest.payment_status==='paid'||latest.status==='complete')return {ok:true,session:latest};throw e;}return {ok:true,session:await client.retrieve($input.session_id)};}requireValue(false,'STRIPE_OPERATION','Unsupported payment request.',400);`),'result')}
${check('result','Stripe test service is not configured or is unavailable.')}`,'$result'));
await put('function/summer_verify_event_v1.xs',fn('summer_verify_event_v1','  text raw_body\n  text signature',`${lambda(core+'\n'+safe(`return await verifyNativeEvent($input.raw_body,$input.signature,$env.summer_stripe_test_webhook_secret);`),'verified')}
${check('verified','Invalid payment event.','accessdenied')}`,'$verified'));
const origin='https://chickenshednyc2024.webflow.io';
await put('api/summer_bridge_native/summer_bridge_native.xs',`api_group "Summer Bridge Sandbox" {
 canonical = "summer26"
 description = "Authenticated Summer Shed sandbox adapter. Never promote fixtures or test configuration."
 swagger = {active:false}
 cors = {mode:"custom",origins:["http://127.0.0.1:4817","${origin}"],methods:["GET","POST"],headers:["Content-Type","Authorization","X-Tenant"],credentials:false,max_age:60}
}`);
await put('api/summer_bridge_native/start_GET.xs',query('summer/start','GET','',`function.run summer_context_v1 { input = {actor_id:$auth.id} } as $base
${lambda(`const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · ')})),aid_rates:[10,20,35,50,75]};`,'result')}`,'$result'));
const selection='  json items\n  int aid_percent?=0';
const req=(fields)=>`var $request { value = {${fields.map(n=>n+':$input.'+n).join(',')}} }`;
const quoteContext=`function.run summer_quote_context_v1 { input = {actor_id:$auth.id,request:$request} } as $quoted`;
await put('api/summer_bridge_native/quote_POST.xs',query('summer/quote','POST',selection,`${req(['items','aid_percent'])}
${quoteContext}
function.run summer_quote_v1 { input = {request:$request,context:$quoted.context} } as $quote
precondition ($quote.policy === "summer_family_v1") { error = "Summer quote is unavailable." }`,'$quote'));
const returnOriginCode=(await readFile(new URL('../src/sandbox-origin.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');
const argsCode=returnOriginCode+`\nreturn {ok:true,reference:referenceFor($auth.id,$var.request.attempt_id),args:{actor:$var.quoted.actor,context:$var.quoted.context,request:$var.request,origin:sandboxReturnOrigin($env.$http_headers),now:Date.now()}};`;
await put('api/summer_bridge_native/checkout_POST.xs',query('summer/checkout','POST',selection+'\n  json? aid_data?\n  text attempt_id\n  text quote_fingerprint',`${req(['items','aid_percent','aid_data','attempt_id','quote_fingerprint'])}
${quoteContext}
${lambda(core+'\n'+safe(argsCode),'prepared')}
${check('prepared')}
function.run summer_order_v1 { input = {phase:"reserve",order_reference:$prepared.reference,args:$prepared.args} } as $reserved
var $plan { value = $reserved }
conditional {
 if ($plan.action == "inspect") {
  function.run summer_stripe_session_v1 { input = {action:"retrieve",session_id:$plan.order.checkout_session_id,payload:null,idempotency_key:null} } as $previous
  ${lambda(core+'\n'+safe(`const old=$var.plan.order,s=$var.previous.session;validateCanonical(old,s);if(isSettledSession(s))return {ok:true,action:'event'};requireValue(s.status!=='complete','PAYMENT_PENDING','Payment is still being checked. Please do not pay again.',409);if(!$var.plan.upgrade_promotions&&old.quote_fingerprint===$var.plan.fingerprint&&s.status==='open'&&s.expires_at>Date.now()/1000)return {ok:true,action:'reuse'};return {ok:true,action:s.status==='open'?'expire':'replace'};`),'inspection')}
  ${check('inspection','The previous checkout must finish before another can open.')}
  conditional {
   if ($inspection.action == "expire") {
    function.run summer_stripe_session_v1 { input = {action:"expire",session_id:$previous.session.id,payload:null,idempotency_key:null} } as $expired
    var.update $previous { value = $expired }
   }
  }
  ${lambda(core+'\n'+safe(`const s=$var.previous.session;if(isSettledSession(s))return {ok:true,phase:'event',args:{session:s,origin:'${origin}'}};if($var.inspection.action==='reuse')return {ok:true,phase:'attach',args:{session:s,origin:'${origin}'}};return {ok:true,phase:'replace',args:{...$var.prepared.args,expected_version:$var.plan.order.quote_version,previous_session:s}};`),'next')}
  ${check('next')}
  function.run summer_order_v1 { input = {phase:$next.phase,order_reference:$prepared.reference,args:$next.args} } as $changed
  var.update $plan { value = $changed }
 }
}
conditional {
 if ($plan.action == "create") {
  ${lambda(`const o=$var.plan.order;return {key:o.order_reference+':'+o.quote_version,payload:o.reservation_payload};`,'create')}
  function.run summer_stripe_session_v1 { input = {action:"create",session_id:null,payload:$create.payload,idempotency_key:$create.key} } as $session
  function.run summer_order_v1 { input = {phase:"attach",order_reference:$prepared.reference,args:{session:$session.session,origin:"${origin}"}} } as $attached
  var.update $plan { value = $attached }
 }
}
${lambda(core+'\n'+safe(`const p=$var.plan,o=p.order;requireValue(!p.error,'PAYMENT_MISMATCH','Payment needs staff review.',409);return {ok:true,order_id:o.id,status:o.status,url:o.status==='paid'?summerSuccessUrl($var.prepared.args.origin,o.checkout_session_id):o.checkout_url};`),'result')}
${check('result','Payment needs staff review.')}`,'$result'));
await put('api/summer_bridge_native/receipt_GET.xs',query('summer/receipt','GET','  text session_id filters=trim',`db.query registration_orders { where = $db.registration_orders.checkout_session_id == $input.session_id && $db.registration_orders.owner_user_id == $auth.id return = {type:"single"} } as $order
precondition ($order != null) { error_type = "notfound" error = "Payment not found." }
${lambda(core+'\nreturn publicReceipt($var.order);','result')}`,'$result'));
await put('api/summer_bridge_native/payment_events_POST.xs',query('summer/payment-events','POST','',`util.get_raw_input { encoding = "none" exclude_middleware = true } as $raw
${lambda(core+'\n'+safe(`return {ok:true,signature:signatureHeader($env.$http_headers)};`),'header')}
${check('header','Invalid payment event.','accessdenied')}
function.run summer_verify_event_v1 { input = {raw_body:$raw,signature:$header.signature} } as $event
var $result { value = {ignored:true} }
conditional {
 if ($event.supported && $event.policy == "summer_family_v1") {
  function.run summer_stripe_session_v1 { input = {action:"retrieve",session_id:$event.object_id,payload:null,idempotency_key:null} } as $session
  ${lambda(`const s=$var.session.session,e=$var.event;return {ok:s.metadata?.order_reference===e.order_reference&&s.metadata?.checkout_policy==='summer_family_v1',args:{session:s,event_id:e.event_id}};`,'canonical')}
  ${check('canonical','Payment details do not match.')}
  function.run summer_order_v1 { input = {phase:"event",order_reference:$event.order_reference,args:$canonical.args} } as $fulfilled
  conditional {
   if ($fulfilled.order.status == "paid") {
    function.run summer_send_confirmation_v1 { input = {order_id:$fulfilled.order.id} } as $confirmation_email
   }
  }
  ${lambda(`return {applied:$var.fulfilled.applied||false,review:!!$var.fulfilled.error};`,'public')}
  var.update $result { value = $public }
 }
}`,'$result',false));
const staffGuard=`${lambda(safe(`let ids=[];try{ids=JSON.parse($env.summer_staff_user_ids||'[]')}catch{}requireValue(Array.isArray(ids)&&ids.includes($auth.id),'FORBIDDEN','Staff access is not configured for this sandbox.',403);return {ok:true};`),'staff_guard')}\n${check('staff_guard','Staff access required.')}`;
await put('api/summer_bridge_native/staff_GET.xs',query('summer/staff','GET','',`${staffGuard}
db.query registration_orders { where = $db.registration_orders.status == "paid" || $db.registration_orders.status == "review" return = {type:"list"} } as $orders
${lambda(`return $var.orders.map(o=>({order_id:o.id,status:o.status,paid_cents:o.paid_cents,paid_at:o.paid_at,items:o.quote.items,totals:o.quote.totals,payment_intent_id:o.payment_intent_id,handled:o.handled,staff_notes:o.staff_notes,review_reason:o.review_reason,observed_payment_cents:o.observed_payment_cents}));`,'result')}`,'$result'));
console.log('Generated native sandbox functions and authenticated routes. No secrets, accounts, webhooks, or Stripe calls executed.');
await put('api/summer_bridge_native/staff_update_POST.xs',query('summer/staff-update','POST','  int order_id\n  bool handled\n  text staff_notes?=""',`${staffGuard}
precondition (($input.staff_notes|strlen) <= 2000) { error = "Staff notes are too long." }
var $result { value = null }
db.transaction {
 stack {
  db.query registration_orders {
   lock = true
   where = $db.registration_orders.id == $input.order_id && ($db.registration_orders.status == "paid" || $db.registration_orders.status == "review")
   return = {type:"single"}
  } as $order
  precondition ($order != null) { error_type = "notfound" error = "Order not found." }
  db.edit registration_orders {
   field_name = "id"
   field_value = $order.id
   data = {handled:$input.handled,staff_notes:$input.staff_notes}
  } as $updated
  var.update $result { value = {order_id:$updated.id,handled:$updated.handled,staff_notes:$updated.staff_notes} }
 }
}`,'$result'));

await import('./generate-xano-email.mjs');
