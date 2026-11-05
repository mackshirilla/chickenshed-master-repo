// Summer-only mail journal and secure sender. Existing legacy sender is untouched.
import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('../xano/summer-sandbox/function/',import.meta.url);
const core=(await Promise.all(['quote','confirmation'].map(async n=>(await readFile(new URL('../src/'+n+'.mjs',import.meta.url),'utf8')).replace(/^import .*\n/gm,'').replace(/^export /gm,'')))).join('\n');
const lambda=(code,name)=>`api.lambda {\n code = """\n${code.split('\n').map(l=>'  '+l).join('\n')}\n """\n timeout = 30\n} as $${name}`;
async function put(name,s){let old='';try{old=await readFile(new URL(name+'.xs',base),'utf8')}catch{}const guid=old.match(/\n\s*guid\s*=\s*"([^"]+)"/);if(guid)s=s.replace(/}\s*$/,` guid = "${guid[1]}"\n}`);await writeFile(new URL(name+'.xs',base),s+'\n');}
await put('summer_confirmation_v1',`// Private Summer mail journal; sandbox only. No automatic resend of pending/failed mail.
function summer_confirmation_v1 {
 input {
  text phase
  int order_id
  json args?
 }
 stack {
 function.run summer_bridge_fixture_guard { input = {} } as $guard
 var $result { value = {claimed:false,mail_id:null,status:null} }
 db.transaction {
 stack {
 db.query registration_orders {
  lock = true
  where = $db.registration_orders.id == $input.order_id
  return = {type:"single"}
 } as $order
 ${lambda(core+`\ntry {const order=$var.order;const emailOptions={testMode:true,origin:'http://127.0.0.1:4817'};requireValue(order,'MAIL_ORDER','Summer order not found.');const data=confirmationData(order,emailOptions);if(emailOptions.testMode)requireValue(order.owner_user_id===1&&order.id>Number($env.summer_confirmation_min_order_id||2147483647)&&order.session_snapshot?.livemode===false&&order.checkout_session_id.startsWith('cs_test_'),'MAIL_ORDER','Only the approved new test checkout can send.');const recipient=emailOptions.testMode?'mack@bigstachedesign.com':order.parent_email;return {ok:true,identity:confirmationIdentity(order),data,recipient};}catch(e){return {ok:false,message:e.code?e.message:'Summer confirmation is unavailable.'};}`,'prepared')}
 conditional {
  if ($prepared.ok === true) {
   db.query emails_sent {
    where = $db.emails_sent.subject == $prepared.identity
    return = {type:"single"}
   } as $existing_mail
   conditional {
    if ($input.phase == "claim" && $existing_mail == null) {
     db.query contacts {
      where = $db.contacts.user_id == $order.owner_user_id
      return = {type:"single"}
     } as $contact
     ${lambda(`return $var.contact?.id||null;`,'contact_id')}
     ${lambda(`return {text:JSON.stringify({order_id:$var.order.id,order_reference:$var.order.order_reference,recipient:$var.prepared.recipient,state:'pending',test_mode:true,claimed_at:Date.now()})};`,'journal')}
     db.add emails_sent {
      data = {template_id:"d-71675df1534941f6b62ad88f59aac3ce",subject:$prepared.identity,text_message:$journal.text,status:"pending",total_recipients:1,successful_sends:0,contact_id:$contact_id,send_text:false}
     } as $mail
     var.update $result { value = {claimed:true,mail_id:$mail.id,recipient:$prepared.recipient,data:$prepared.data} }
    }
    elseif ($input.phase == "complete" && $existing_mail != null) {
     ${lambda(`const row=$var.existing_mail,args=$input.args||{};let journal;try{journal=JSON.parse(row.text_message||'{}')}catch{return {ok:false};}const valid=row.id===args.mail_id&&row.status==='pending'&&[true,false].includes(args.accepted);return {ok:valid,status:args.accepted?'sent':'failed',successful_sends:args.accepted?1:0,journal:JSON.stringify({...journal,state:args.accepted?'accepted':args.uncertain?'uncertain':'failed',http_status:Number.isInteger(args.http_status)?args.http_status:null,message_id:typeof args.message_id==='string'?args.message_id.slice(0,200):null,finished_at:Date.now()})};`,'completion')}
     conditional {
      if ($completion.ok === true) {
       db.edit emails_sent {
        field_name = "id"
        field_value = $existing_mail.id
        data = {status:$completion.status,successful_sends:$completion.successful_sends,text_message:$completion.journal}
       } as $updated_mail
       var.update $result { value = {claimed:false,mail_id:$updated_mail.id,status:$updated_mail.status} }
      }
     }
    }
    elseif ($existing_mail != null) {
     var.update $result { value = {claimed:false,mail_id:$existing_mail.id,status:$existing_mail.status} }
    }
   }
  }
 }
 }
 }
 }
 response = $result
}`);
await put('summer_send_confirmation_v1',`// Isolated Summer confirmation sender; runtime default is disabled.
function summer_send_confirmation_v1 {
 input {
  int order_id
 }
 stack {
 function.run summer_bridge_fixture_guard { input = {} } as $guard
 ${lambda(`const key=$env.sendgrid_api_key||$env.workspace?.sendgrid_api_key,from=$env.sendgrid_from_email||$env.workspace?.sendgrid_from_email;return {enabled:$env.summer_confirmation_email_enabled==='true',key_available:typeof key==='string'&&key.length>20,from_available:typeof from==='string'&&/^[^\\s@]+@chickenshednyc\\.org$/i.test(from)};`,'configuration')}
 var $result { value = {attempted:false,configuration:$configuration} }
 conditional {
  if ($configuration.enabled && $configuration.key_available && $configuration.from_available) {
   function.run summer_confirmation_v1 { input = {phase:"claim",order_id:$input.order_id,args:{}} } as $claim
   conditional {
    if ($claim.claimed === true) {
     ${lambda(core+`\nreturn await sendConfirmation({key:$env.sendgrid_api_key||$env.workspace?.sendgrid_api_key,fromEmail:$env.sendgrid_from_email||$env.workspace?.sendgrid_from_email,recipient:$var.claim.recipient,data:$var.claim.data});`,'sent')}
     function.run summer_confirmation_v1 { input = {phase:"complete",order_id:$input.order_id,args:{mail_id:$claim.mail_id,accepted:$sent.accepted,http_status:$sent.http_status,message_id:$sent.message_id,uncertain:$sent.uncertain}} } as $completed
     var.update $result { value = {attempted:true,accepted:$sent.accepted,mail_id:$claim.mail_id,http_status:$sent.http_status,uncertain:$sent.uncertain} }
    }
    else { var.update $result { value = {attempted:false,mail_id:$claim.mail_id,status:$claim.status} } }
   }
  }
 }
 }
 response = $result
}`);
console.log('Generated isolated Summer confirmation journal/sender; sends stay disabled until explicit sandbox setup.');

await put('summer_validate_confirmation_setup',`// Private sandbox-mode SendGrid validation only. It cannot deliver an email.
function summer_validate_confirmation_setup {
 input {}
 stack {
 function.run summer_bridge_fixture_guard { input = {} } as $guard
 ${lambda(core+`\nreturn await sendConfirmation({key:$env.sendgrid_api_key,fromEmail:$env.sendgrid_from_email,recipient:'mack@bigstachedesign.com',validateOnly:true,data:{emailSubject:'[TEST] Summer setup validation — no send',testMode:true,orderReference:'TEST_SETUP_NO_SEND'}});`,'validation')}
 }
 response = $validation
}`);
