function registration_staff_sync_v1 {
input { int order_id
bool dry_run?=false }
stack {
function.run registration_orders_live_guard_v1 { input = {} } as $guard
db.get registration_orders { field_name = "id"
field_value = $input.order_id } as $order
db.get users { field_name = "id"
field_value = $order.owner_user_id
output = ["id","email"] } as $parent
db.query session_registrations { where = $db.session_registrations.registration_order_id == $input.order_id
return = {type:"list"} } as $registrations
db.query student_profiles { where = $db.student_profiles.parent_user_id == $order.owner_user_id
return = {type:"list"} } as $students
api.lambda {
 code = """
const MANUAL_POLICY='staff_manual_v1';
function need(ok,message){if(!ok)throw new Error(message);}
function cents(value){const number=Number(value??0),amount=Math.round(number*100);need(Number.isFinite(number)&&number>=0&&amount<=100000000&&Math.abs(number*100-amount)<.00001,'Enter a non-negative amount with at most two decimal places.');return amount;}
function itemDisplay(order,registrations=[],students=[]){
 const items=order.checkout_policy===MANUAL_POLICY?registrations.filter(r=>r.registration_order_id===order.id&&r.status!=='Archived').map(r=>({student_name:students.find(s=>s.id===r.student_id)?.full_name||'Student',package_name:r.workshop_name||r.program_name||'Registration',session_time:[r.weekday,r.time_block].filter(Boolean).join(' · ')})):order.quote?.items||[];
 return items.map(i=>[i.student_name,i.package_name||i.session_name,i.session_time||i.time].filter(Boolean).join(' · ')).join('\n');
}
function manualValues(order,parent,registrations,students,now=Date.now()){
 need(order.checkout_policy===MANUAL_POLICY,'This is not a staff-created order.');
 need(parent&&parent.id===order.manual_parent_id&&parent.id===order.owner_user_id&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email||''),'Select the parent account for this order.');
 const total=cents(order.manual_total_amount),paid=cents(order.manual_paid_amount);need(paid<=total,'Amount recorded as paid cannot exceed the order total.');
 const methods=['Not yet paid','Cash','Check','External Stripe payment','Bank transfer','Other','No payment required'];need(methods.includes(order.manual_payment_method),'Select how payment was received.');
 need(paid===0||!['Not yet paid','No payment required'].includes(order.manual_payment_method),'Choose a payment method for the amount recorded as paid.');
 need(order.manual_payment_method!=='No payment required'||total===0,'No payment required is only for a zero-total order.');
 for(const r of registrations.filter(r=>r.registration_order_id===order.id))need(r.parent_user_id===parent.id&&students.some(s=>s.id===r.student_id&&s.parent_user_id===parent.id),'All linked students must belong to this parent.');
 return {order_reference:order.order_reference||`Manual order #${order.id}`,attempt_key:order.attempt_key||`staff_manual:${order.id}`,parent_email:parent.email,paid_cents:paid,balance_after_checkout_cents:total-paid,items_display:itemDisplay(order,registrations,students),resend_status:order.resend_status||'Ready to send when registrations are added',quote_fingerprint:`staff_manual:${order.id}`,quote:{policy:MANUAL_POLICY,currency:'usd',items:[],totals:{tuition_cents:total,net_tuition_cents:total,due_now_cents:paid,balance_after_checkout_cents:total-paid}},manual_record_state:paid===total?'Payment recorded in full':paid>0?'Partial payment recorded':'Payment not recorded',staff_activity:[...(Array.isArray(order.staff_activity)?order.staff_activity:[]),{action:'manual_order_recorded',at:now,by:order.manual_created_by||'Staff',total_cents:total,paid_cents:paid,method:order.manual_payment_method}].slice(-100)};
}
function resendCheck(order,now=Date.now()){
 need(!order?.staff_validation_error,'Review the order details before sending confirmation.');
 need(order?.resend_requested===true,'No confirmation requested.');
 need(order.resend_status!=='Sending'&&order.resend_status!=='Delivery needs review','A previous send is still being checked. Review its email log before trying again.');
 need(!order.last_resend_at||now-Number(order.last_resend_at)>=60000,'Wait one minute before sending another confirmation.');
 need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.resend_requested_by||''),'A staff requester is required.');
 need(order.checkout_policy===MANUAL_POLICY&&order.status==='manual'||['summer_family_v1','registration_order_v2'].includes(order.checkout_policy)&&order.status==='paid','Only confirmed website orders or valid staff orders can send a confirmation.');
 return true;
}
function balanceValues(order,now=Date.now()){
 const has=order.staff_balance_amount!==null&&order.staff_balance_amount!==undefined,amount=has?cents(order.staff_balance_amount):Number(order.balance_after_checkout_cents||0),applied=order.staff_balance_applied_amount!==null&&order.staff_balance_applied_amount!==undefined,changed=has!==applied||has&&cents(order.staff_balance_applied_amount)!==amount;
 if(changed){need(String(order.staff_balance_note||'').trim().length>0,'Add a reason or payment reference for the balance change.');need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.staff_balance_updated_by||''),'A staff member must record the balance change.');}
 return {current_balance_cents:amount,staff_balance_applied_amount:has?amount/100:null,staff_balance_updated_at:changed?now:order.staff_balance_updated_at||null,staff_activity:changed?[...(order.staff_activity||[]),{action:'balance_updated',at:now,by:order.staff_balance_updated_by,from_cents:order.current_balance_cents??order.balance_after_checkout_cents??0,to_cents:amount,note:String(order.staff_balance_note).trim()}].slice(-100):order.staff_activity||[]};
}
function staffMessage(order,parent,registrations,students){
 const manual=order.checkout_policy===MANUAL_POLICY;
 const values=manual?manualValues(order,parent,registrations,students):{order_reference:order.order_reference,paid_cents:order.paid_cents,balance_after_checkout_cents:order.balance_after_checkout_cents,quote:order.quote};
 const rows=registrations.filter(r=>r.registration_order_id===order.id&&!['Draft','Archived','Cancelled'].includes(r.status));need(rows.length>0,'Add at least one Pending, Active or other current registration before sending confirmation.');
 need(rows.every(r=>r.parent_user_id===parent.id&&students.some(s=>s.id===r.student_id&&s.parent_user_id===parent.id)),'All linked students must belong to this parent.');
 const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
 const heading='Chickenshed NYC Registration Confirmation',intro=manual?'Thank you for registering with Chickenshed NYC! Your registrations have been entered by our team. The payment information below was recorded by staff.':'Thank you for registering with Chickenshed NYC! Below is an updated copy of your registration confirmation. It includes the current balance recorded by our team. Your original payment receipt is separate.';
 const labels={Pending:'Awaiting student approval',Active:'Active',Waitlist:'Waitlisted',Paused:'Paused',Trial:'Trial'};
 const lines=rows.map(r=>{const item=values.quote.items?.find(i=>i.student_id===r.student_id&&i.session_id===r.session_id);return {student:students.find(s=>s.id===r.student_id)?.full_name||'Student',session:[r.program_name,r.workshop_name,r.weekday,r.time_block].filter(Boolean).join(' · '),status:labels[r.status]||r.status,plan:!item?'':item.payment_option==='deposit'?(item.promotion_discount_cents&&item.due_now_cents===0?'Deposit covered by coupon':'Deposit received')+(item.payment_preference==='monthly'?' · Monthly payments arranged with staff':''):item.promotion_discount_cents&&item.due_now_cents===0?'Tuition covered by coupon':item.payment_preference==='semester'?'Semester tuition paid':'Tuition paid in full'};});
 const t=values.quote.totals,currentBalance=order.current_balance_cents??values.balance_after_checkout_cents,hasAid=!manual&&Number(t.aid_cents)>0,hasSemester=!manual&&(order.payment_preference==='semester'||values.quote.items?.some(i=>i.payment_preference==='semester')),hasMonthly=!manual&&values.quote.items?.some(i=>i.payment_preference==='monthly');
 const amounts=[['Total tuition',money(t.tuition_cents??t.net_tuition_cents)],...(hasAid?[['Financial aid applied','−'+money(t.aid_cents)],['Tuition after financial aid',money(t.net_tuition_cents)]]:[]),[manual?'Payment recorded by staff':'Amount paid at website checkout',money(values.paid_cents)],...(manual?[['Payment method',order.manual_payment_method]]:[]),...(!manual&&t.promotion_discount_cents?[['Coupon at checkout',money(t.promotion_discount_cents)]]:[]),['Current balance recorded',money(currentBalance)]];
 const summary=`Order #${order.id}\n${amounts.map(([label,value])=>label+': '+value).join('\n')}${hasSemester?'\nFuture semester payments, if any, are arranged separately.':''}`;
 const body=lines.map(i=>`<div style="padding:16px 0;border-bottom:1px solid #dddddd;"><h3 style="font-size:19px;margin:0 0 4px;color:#1d3e78;">${e(i.student)}</h3><p style="margin:0;">${e(i.session)}</p><p style="margin:8px 0 0;">${e(i.status)}${i.plan?'<br>'+e(i.plan):''}</p></div>`).join('');
 const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Chickenshed NYC registration confirmation</title></head>
<body style="margin:0;padding:0;background:#ffffff;color:#333333;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><table role="presentation" width="768" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:768px;"><tr><td style="padding:24px;">
<p style="text-align:center;margin:0 0 24px;"><img src="https://cdn.mcauto-images-production.sendgrid.net/86f8c4842f4da655/93773c15-7c57-4752-a8e5-34a3bad955ef/1000x297.png" width="350" alt="Chickenshed NYC" style="display:block;width:50%;max-width:350px;height:auto;margin:0 auto;"></p>
<h1 style="font-size:30px;line-height:1.3;text-align:center;color:#1d3e78;margin:24px 0;">Chickenshed NYC<br>Registration Confirmation ✅</h1>
<p>${intro}</p><p style="color:#666666;font-size:14px;">Order #${e(order.id)}</p>
<hr style="border:0;border-top:1px solid #dddddd;margin:28px 0;"><h2 style="font-size:21px;color:#1d3e78;">Payment summary</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0" style="font-size:16px;">${amounts.map(([label,value])=>`<tr><td>${label==='Current balance recorded'?'<strong>'+e(label)+'</strong>':e(label)}</td><td align="right">${label==='Current balance recorded'?'<strong>'+e(value)+'</strong>':e(value)}</td></tr>`).join('')}</table>
${currentBalance>0?'<p>Chickenshed NYC will follow up about the remaining balance. Deposits are credited toward the tuition for each registration line. No automatic payments are scheduled.</p>':''}
${rows.some(r=>r.status==='Pending')?'<p style="background:#f0f4f9;padding:12px 16px;"><strong>Student review pending</strong><br>Some student profiles still require approval. Chickenshed NYC will follow up with next steps.</p>':''}
${hasMonthly?'<p style="background:#f0f4f9;padding:12px 16px;"><strong>Monthly payments</strong><br>Chickenshed NYC will contact you to arrange monthly payments. No automatic payments have been scheduled.</p>':''}
${hasSemester?'<p>You selected pay per semester. Chickenshed NYC will contact you about any remaining or later semester payments. The balance above is for this order and does not include future semester payments.</p>':''}
<hr style="border:0;border-top:1px solid #dddddd;margin:28px 0;"><h2 style="font-size:21px;color:#1d3e78;">Your registrations</h2>${body}
<p style="margin:28px 0;text-align:center;"><a href="https://www.chickenshednyc.org/dashboard/registrations" style="display:inline-block;background:#1d3e78;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 24px;border-radius:4px;">View your registrations</a></p>
<p>Please contact Chickenshed NYC if you need help with your registration.</p><p>Warmly,<br>The Chickenshed NYC Team</p>
</td></tr></table></td></tr></table></body></html>`;
 return {recipient:parent.email,subject:heading,html,text:[heading,intro,summary,...lines.map(i=>`${i.student}\n${i.session}\n${i.status}${i.plan?'\n'+i.plan:''}`),'View your registrations: https://www.chickenshednyc.org/dashboard/registrations'].join('\n\n')};
}
function manualMessage(order,parent,registrations,students){need(order.checkout_policy===MANUAL_POLICY,'This is not a staff-created order.');return staffMessage(order,parent,registrations,students);}

try{need($var.order,'Order not found.');const order=$var.order,manual=order.checkout_policy===MANUAL_POLICY&&!['archived','manual_archived'].includes(order.status);let patch=manual?manualValues(order,$var.parent,$var.registrations,$var.students):{items_display:itemDisplay(order,$var.registrations,$var.students)};patch={...patch,...balanceValues({...order,...patch})};const keys=['order_reference','attempt_key','parent_email','paid_cents','balance_after_checkout_cents','items_display','quote_fingerprint','manual_record_state','current_balance_cents','staff_balance_applied_amount','staff_balance_updated_at'];const skip=keys.every(k=>!(k in patch)||JSON.stringify(order[k]??null)===JSON.stringify(patch[k]??null))&&!order.staff_validation_error&&(!manual||order.status==='manual');return {ok:true,manual,patch,skip};}catch(e){return {ok:false,message:e.message,skip:$var.order?.staff_validation_error===e.message};}
 """
 timeout = 30
} as $prepared
conditional {
 if ($input.dry_run != true && $prepared.ok === true && $prepared.skip != true) {
  conditional {
   if ($prepared.manual === true) {
    db.edit registration_orders { field_name = "id"
field_value = $input.order_id
data = {order_reference:$prepared.patch.order_reference,attempt_key:$prepared.patch.attempt_key,parent_email:$prepared.patch.parent_email,status:"manual",paid_cents:$prepared.patch.paid_cents,balance_after_checkout_cents:$prepared.patch.balance_after_checkout_cents,items_display:$prepared.patch.items_display,quote_fingerprint:$prepared.patch.quote_fingerprint,quote:$prepared.patch.quote,manual_record_state:$prepared.patch.manual_record_state,staff_activity:$prepared.patch.staff_activity,staff_validation_error:null,current_balance_cents:$prepared.patch.current_balance_cents,staff_balance_applied_amount:$prepared.patch.staff_balance_applied_amount,staff_balance_updated_at:$prepared.patch.staff_balance_updated_at,resend_status:$prepared.patch.resend_status} } as $updated
   }
 else {
    db.edit registration_orders { field_name = "id"
field_value = $input.order_id
data = {items_display:$prepared.patch.items_display,current_balance_cents:$prepared.patch.current_balance_cents,staff_balance_applied_amount:$prepared.patch.staff_balance_applied_amount,staff_balance_updated_at:$prepared.patch.staff_balance_updated_at,staff_activity:$prepared.patch.staff_activity,staff_validation_error:null} } as $updated
   }
  }
 }
 elseif ($input.dry_run != true && $prepared.skip != true && $order.checkout_policy == "staff_manual_v1") {
 db.edit registration_orders { field_name = "id"
field_value = $input.order_id
data = {status:"manual_review",staff_validation_error:$prepared.message,resend_requested:false,resend_status:"Order needs attention"} } as $invalid
 }
 elseif ($input.dry_run != true && $prepared.skip != true) {
db.edit registration_orders {field_name="id"
field_value=$input.order_id
data={staff_validation_error:$prepared.message}} as $balance_invalid
 }
}
}
response = $prepared
}
