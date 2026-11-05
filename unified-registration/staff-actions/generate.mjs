import{readFile,writeFile as writeGeneratedFile}from'node:fs/promises';
const writeFile=(path,content)=>writeGeneratedFile(path,content.replace(/[ \t]+$/gm,'').trimEnd()+'\n');
const target=new URL('./',import.meta.url),core=(await readFile(new URL('model.mjs',target),'utf8')).replace(/^export /gm,''),old=await readFile(new URL('../xano/production-candidate/function/registration_live_confirmation_v1.xs',import.meta.url),'utf8');
const legacyEmail=(await readFile(new URL('../../summer-registration/test-model/confirmation.mjs',import.meta.url),'utf8')).replace(/^import .*\n/gm,'').split('export async function sendConfirmation')[0].replace(/^export /gm,'').replaceAll('SUMMER_TEMPLATE_ID','LEGACY_TEMPLATE_ID').replaceAll('POLICY','LEGACY_POLICY').replaceAll('confirmationIdentity','legacyIdentity').replaceAll('confirmationData','legacyConfirmationData');
const online=old.match(/code = """\n([\s\S]*?)\n\s*"""/)[1].split('  try {const order=$var.order;')[0];
const lambda=(js,name)=>`api.lambda {\n code = """\n${js}\n """\n timeout = 30\n} as $${name}`;
const reads=`db.get registration_orders { field_name = "id"\nfield_value = $input.order_id } as $order\ndb.get users { field_name = "id"\nfield_value = $order.owner_user_id\noutput = ["id","email"] } as $parent\ndb.query session_registrations { where = $db.session_registrations.registration_order_id == $input.order_id\nreturn = {type:"list"} } as $registrations\ndb.query student_profiles { where = $db.student_profiles.parent_user_id == $order.owner_user_id\nreturn = {type:"list"} } as $students`;
const sync=`function registration_staff_sync_v1 {
input { int order_id\nbool dry_run?=false }
stack {
function.run registration_orders_live_guard_v1 { input = {} } as $guard
${reads}
${lambda(core+`\ntry{need($var.order,'Order not found.');const order=$var.order,manual=order.checkout_policy===MANUAL_POLICY&&!['archived','manual_archived'].includes(order.status);let patch=manual?manualValues(order,$var.parent,$var.registrations,$var.students):{items_display:itemDisplay(order,$var.registrations,$var.students)};patch={...patch,...balanceValues({...order,...patch})};const keys=['order_reference','attempt_key','parent_email','paid_cents','balance_after_checkout_cents','items_display','quote_fingerprint','manual_record_state','current_balance_cents','staff_balance_applied_amount','staff_balance_updated_at'];const skip=keys.every(k=>!(k in patch)||JSON.stringify(order[k]??null)===JSON.stringify(patch[k]??null))&&!order.staff_validation_error&&(!manual||order.status==='manual');return {ok:true,manual,patch,skip};}catch(e){return {ok:false,message:e.message,skip:$var.order?.staff_validation_error===e.message};}`,'prepared')}
conditional {
 if ($input.dry_run != true && $prepared.ok === true && $prepared.skip != true) {
  conditional {
   if ($prepared.manual === true) {
    db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {order_reference:$prepared.patch.order_reference,attempt_key:$prepared.patch.attempt_key,parent_email:$prepared.patch.parent_email,status:"manual",paid_cents:$prepared.patch.paid_cents,balance_after_checkout_cents:$prepared.patch.balance_after_checkout_cents,items_display:$prepared.patch.items_display,quote_fingerprint:$prepared.patch.quote_fingerprint,quote:$prepared.patch.quote,manual_record_state:$prepared.patch.manual_record_state,staff_activity:$prepared.patch.staff_activity,staff_validation_error:null,current_balance_cents:$prepared.patch.current_balance_cents,staff_balance_applied_amount:$prepared.patch.staff_balance_applied_amount,staff_balance_updated_at:$prepared.patch.staff_balance_updated_at,resend_status:$prepared.patch.resend_status} } as $updated
   }
 else {
    db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {items_display:$prepared.patch.items_display,current_balance_cents:$prepared.patch.current_balance_cents,staff_balance_applied_amount:$prepared.patch.staff_balance_applied_amount,staff_balance_updated_at:$prepared.patch.staff_balance_updated_at,staff_activity:$prepared.patch.staff_activity,staff_validation_error:null} } as $updated
   }
  }
 }
 elseif ($input.dry_run != true && $prepared.skip != true && $order.checkout_policy == "staff_manual_v1") {
 db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {status:"manual_review",staff_validation_error:$prepared.message,resend_requested:false,resend_status:"Order needs attention"} } as $invalid
 }
 elseif ($input.dry_run != true && $prepared.skip != true) {
db.edit registration_orders {field_name="id"\nfield_value=$input.order_id\ndata={staff_validation_error:$prepared.message}} as $balance_invalid
 }
}
}
response = $prepared
}`;
await writeFile(new URL('function/registration_staff_sync_v1.xs',target),sync+'\n');
const prepare=core+'\n'+online+'\nconst LEGACY_POLICY="summer_family_v1";\n'+legacyEmail+`\ntry{const o=$var.order;need($env.registration_confirmation_email_enabled==='true','Registration email is not enabled.');if(!$input.dry_run)resendCheck(o);else resendCheck({...o,resend_requested:true,resend_requested_by:'validation@chickenshednyc.org'});const manual=o.checkout_policy===MANUAL_POLICY;if(!manual)(o.checkout_policy===LEGACY_POLICY?legacyConfirmationData:confirmationData)(o,{origin:'https://www.chickenshednyc.org'});const result={...staffMessage({...o,current_balance_cents:balanceValues(o).current_balance_cents},$var.parent,$var.registrations,$var.students),raw_message:true};if(!manual)need(o.session_snapshot?.livemode===true&&o.checkout_session_id?.startsWith('cs_live_'),'A confirmed live checkout is required.');need(result.recipient&&result.recipient===$var.parent?.email,'Parent account email is required.');return {ok:true,manual,...result};}catch(e){return {ok:false,message:e.message,label:['Sending','Delivery needs review'].includes($var.order?.resend_status)?$var.order.resend_status:e.message};}`;
const send=`function registration_staff_send_confirmation_v1 {
input { int order_id\nbool dry_run?=false }
stack {
function.run registration_orders_live_guard_v1 { input = {} } as $guard
${reads}
${lambda(prepare,'prepared')}
var $result { value = {sent:false,ok:$prepared.ok,message:$prepared.message,dry_run:$input.dry_run} }
var $claim { value = {claimed:false} }
conditional {
 if ($prepared.ok === true && $input.dry_run != true) {
 db.transaction { stack {
  db.query registration_orders { lock = true\nwhere = $db.registration_orders.id == $input.order_id\nreturn = {type:"single"} } as $current
  ${lambda(core+`\ntry{resendCheck($var.current);need($var.current.owner_user_id===$var.order.owner_user_id&&$var.current.manual_total_amount===$var.order.manual_total_amount&&$var.current.manual_paid_amount===$var.order.manual_paid_amount&&$var.current.staff_balance_amount===$var.order.staff_balance_amount&&$var.current.current_balance_cents===$var.order.current_balance_cents,'Order details changed. Review and try again.');const at=Date.now();return {ok:true,at,subject:'Registration confirmation resend: '+$var.current.order_reference+' · '+at,journal:JSON.stringify({state:'pending',order_id:$input.order_id,source:$var.current.checkout_policy,requested_by:$var.current.resend_requested_by,recipient:$var.prepared.recipient,requested_at:at}),activity:[...($var.current.staff_activity||[]),{action:'confirmation_requested',at,by:$var.current.resend_requested_by}].slice(-100)};}catch(e){return {ok:false,message:e.message};}`,'checked')}
  conditional { if ($checked.ok === true) {
   db.add emails_sent { data = {subject:$checked.subject,text_message:$checked.journal,status:"pending",total_recipients:1,successful_sends:0,send_text:false} } as $mail
   db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {resend_requested:false,resend_status:"Sending",last_resend_at:$checked.at,staff_activity:$checked.activity} } as $started
   var.update $claim { value = {claimed:true,mail_id:$mail.id,journal:$checked.journal} }
  }
 else { db.edit registration_orders {field_name="id"\nfield_value=$input.order_id\ndata={resend_requested:false}} as $duplicate_request\nvar.update $result { value = {ok:false,sent:false,message:$checked.message} } } }
 } }
 conditional { if ($claim.claimed === true) {
 ${lambda(`const p=$var.prepared,key=$env.sendgrid_api_key||$env.workspace?.sendgrid_api_key,from=$env.sendgrid_from_email||$env.workspace?.sendgrid_from_email;if(typeof key!=='string'||!from)return {accepted:false,uncertain:false,http_status:0};try{const payload={from:{email:from,name:'Chickenshed NYC'},personalizations:[{to:[{email:p.recipient}],...(p.raw_message?{}:{dynamic_template_data:p.data})}],...(p.raw_message?{subject:p.subject,content:[{type:'text/plain',value:p.text},{type:'text/html',value:p.html}]}:{template_id:p.template_id}),categories:['registration-orders','staff-confirmation'],tracking_settings:{click_tracking:{enable:false,enable_text:false}}};const r=await fetch('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000),redirect:'error'});return {accepted:r.status===202,uncertain:false,http_status:r.status,message_id:r.headers.get('x-message-id')};}catch{return {accepted:false,uncertain:true,http_status:null};}`,'delivery')}
 ${lambda(`const d=$var.delivery,j=JSON.parse($var.claim.journal);return {successful:d.accepted?1:0,status:d.accepted?'sent':'failed',label:d.accepted?'Confirmation sent':d.uncertain?'Delivery needs review':'Not sent — check email log',journal:JSON.stringify({...j,state:d.accepted?'accepted':d.uncertain?'uncertain':'failed',finished_at:Date.now(),http_status:d.http_status,message_id:d.message_id||null})};`,'completion')}
 db.edit emails_sent { field_name = "id"\nfield_value = $claim.mail_id\ndata = {status:$completion.status,successful_sends:$completion.successful,text_message:$completion.journal} } as $completed_mail
 db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {resend_status:$completion.label,resend_requested:false} } as $completed_order
 var.update $result { value = {ok:$delivery.accepted,sent:$delivery.accepted,mail_id:$claim.mail_id,status:$completion.label} }
 } }
 }
 elseif ($prepared.ok != true && $input.dry_run != true && $order.resend_requested === true) {
 db.edit registration_orders { field_name = "id"\nfield_value = $input.order_id\ndata = {resend_requested:false,resend_status:$prepared.label} } as $rejected
 }
}
}
response = $result
}`;
await writeFile(new URL('function/registration_staff_send_confirmation_v1.xs',target),send+'\n');
const validation=`// Internal delivery validation only. SendGrid sandbox mode never delivers an email.
function registration_staff_validate_delivery_v1 {
input {int order_id\nbool dry_run?=true}
stack {
function.run registration_orders_live_guard_v1 {input={}} as $guard
${reads}
${lambda(prepare,'prepared')}
var $result {value={ok:false,validated:false,message:$prepared.message}}
conditional {if ($prepared.ok === true) {
${lambda(`const p=$var.prepared,key=$env.sendgrid_api_key||$env.workspace?.sendgrid_api_key,from=$env.sendgrid_from_email||$env.workspace?.sendgrid_from_email;const payload={from:{email:from,name:'Chickenshed NYC'},personalizations:[{to:[{email:p.recipient}],...(p.raw_message?{}:{dynamic_template_data:p.data})}],...(p.raw_message?{subject:p.subject,content:[{type:'text/plain',value:p.text},{type:'text/html',value:p.html}]}:{template_id:p.template_id}),mail_settings:{sandbox_mode:{enable:true}}};const r=await fetch('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000),redirect:'error'});return {ok:r.status===200,validated:r.status===200,http_status:r.status,delivered:false};`,'validation')}
var.update $result {value=$validation}
}}
}
response=$result
}`;
await writeFile(new URL('function/registration_staff_validate_delivery_v1.xs',target),validation+'\n');
const worker="function registration_staff_process_queue_v1 {\ninput {bool send?=true}\nstack {\nfunction.run registration_orders_live_guard_v1 {input={}} as $guard\ndb.query registration_orders {\nwhere = ($db.registration_orders.checkout_policy == \"staff_manual_v1\" || $db.registration_orders.checkout_policy == \"registration_order_v2\" || $db.registration_orders.checkout_policy == \"summer_family_v1\") && ($db.registration_orders.status == \"paid\" || $db.registration_orders.status == \"review\" || $db.registration_orders.status == \"manual\" || $db.registration_orders.status == \"manual_review\") && ($db.registration_orders.resend_requested == true || $db.registration_orders.current_balance_cents == null || $db.registration_orders.items_display == null || $db.registration_orders.staff_validation_error != null || ($db.registration_orders.staff_balance_amount != null && ($db.registration_orders.staff_balance_applied_amount == null || $db.registration_orders.staff_balance_amount != $db.registration_orders.staff_balance_applied_amount)) || ($db.registration_orders.staff_balance_amount == null && $db.registration_orders.staff_balance_applied_amount != null) || ($db.registration_orders.checkout_policy == \"staff_manual_v1\" && $db.registration_orders.handled != true))\nreturn={type:\"list\"}\n} as $orders\nforeach ($orders) {each as $order {\ntry_catch {try {\nfunction.run registration_staff_sync_v1 {input={order_id:$order.id}} as $sync\nconditional {if ($input.send === true && $order.resend_requested === true) {\nfunction.run registration_staff_send_confirmation_v1 {input={order_id:$order.id}} as $mail\n}}\n}\n catch {debug.log {value=\"Staff registration request needs review\"}}}\n}}\n}\nresponse={checked:true,orders_checked:($orders|count)}\n}\n";
await writeFile(new URL('function/registration_staff_process_queue_v1.xs',target),worker+'\n');
await writeFile(new URL('registration_staff_queue.xs',target),`task registration_staff_queue {
 description = "Validate staff order edits and deliver explicitly requested confirmations; no charges."
 stack {function.run registration_staff_process_queue_v1 {input={send:true}} as $processed}
 schedule = [{starts_on: 2026-11-05 00:00:00+0000, freq: 60}]
 history = 10
}
`);
const trigger=(name,table,code,stack)=>`table_trigger ${name} {\ntable = "${table}"\nactions = {insert:true,update:true,delete:false,truncate:false}\ndatasources = ["live"]\nactive = false\ninput { json new\njson old\nenum action { values = ["insert","update","delete","truncate"] }\ntext datasource }\nstack {\n${lambda(code,'event')}\n${stack}\n}\nhistory = 100\n}\n`;
await writeFile(new URL('table-trigger/registration_staff_order_actions.xs',target),trigger('registration_staff_order_actions','registration_orders',`const n=$input.new||{},o=$input.old||{},manual=n.checkout_policy==='staff_manual_v1',keys=['manual_parent_id','owner_user_id','manual_total_amount','manual_paid_amount','manual_payment_method','manual_payment_reference','manual_created_by','staff_balance_amount','staff_balance_note','staff_balance_updated_by'];return {id:n.id,sync:manual?($input.action==='insert'||keys.some(k=>n[k]!==o[k])):(JSON.stringify(n.quote)!==JSON.stringify(o.quote)||['staff_balance_amount','staff_balance_note','staff_balance_updated_by'].some(k=>n[k]!==o[k])),send:n.resend_requested===true&&o.resend_requested!==true};`,`conditional { if ($event.sync === true) { function.run registration_staff_sync_v1 {input={order_id:$event.id}} as $synced } }\nconditional { if ($event.send === true) { function.run registration_staff_send_confirmation_v1 {input={order_id:$event.id}} as $sent } }`));
await writeFile(new URL('table-trigger/registration_staff_link_refresh.xs',target),trigger('registration_staff_link_refresh','session_registrations',`const n=$input.new||{},o=$input.old||{};return {next:Number(n.registration_order_id)||0,previous:Number(o.registration_order_id)||0};`,`conditional { if ($event.next > 0) { db.get registration_orders {field_name="id"\nfield_value=$event.next} as $next_order\nconditional {if ($next_order.checkout_policy == "staff_manual_v1") {function.run registration_staff_sync_v1 {input={order_id:$event.next}} as $next_sync}} } }\nconditional {if ($event.previous > 0 && $event.previous != $event.next) { db.get registration_orders {field_name="id"\nfield_value=$event.previous} as $old_order\nconditional {if ($old_order.checkout_policy == "staff_manual_v1") {function.run registration_staff_sync_v1 {input={order_id:$event.previous}} as $previous_sync}} }} `));
await writeFile(new URL('install.json',target),JSON.stringify([{type:'functions',name:'registration_staff_sync_v1',file:'function/registration_staff_sync_v1.xs'},{type:'functions',name:'registration_staff_send_confirmation_v1',file:'function/registration_staff_send_confirmation_v1.xs'},{type:'functions',name:'registration_staff_validate_delivery_v1',file:'function/registration_staff_validate_delivery_v1.xs'},{type:'functions',name:'registration_staff_process_queue_v1',file:'function/registration_staff_process_queue_v1.xs'},...['registration_staff_order_actions','registration_staff_link_refresh'].map(name=>({type:'triggers',name,file:'table-trigger/'+name+'.xs'}))],null,2)+'\n');
console.log('Generated staff actions; new triggers default inactive.');
