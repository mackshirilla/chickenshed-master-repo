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
 const heading='Chickenshed NYC Registration Confirmation',intro=manual?'Chickenshed NYC has recorded your registrations. Payment information below was entered by staff for arrangements made outside our website.':'Your website registrations are confirmed. This copy includes the current balance recorded by Chickenshed NYC. Your original checkout amounts remain on the original order receipt.';
 const labels={Pending:'Awaiting student approval',Active:'Active',Waitlist:'Waitlisted',Paused:'Paused',Trial:'Trial'};
 const lines=rows.map(r=>({student:students.find(s=>s.id===r.student_id)?.full_name||'Student',session:[r.program_name,r.workshop_name,r.weekday,r.time_block].filter(Boolean).join(' · '),status:labels[r.status]||r.status}));
 const summary=`Order: ${values.order_reference}\nOrder tuition: ${money(values.quote.totals.net_tuition_cents??values.quote.totals.tuition_cents)}\n${manual?'Payment recorded by staff':'Amount paid at website checkout'}: ${money(values.paid_cents)}${manual?'\nPayment method: '+order.manual_payment_method:''}${!manual&&values.quote.totals.promotion_discount_cents?'\nCoupon at checkout: '+money(values.quote.totals.promotion_discount_cents):''}\nCurrent balance recorded: ${money(order.current_balance_cents??values.balance_after_checkout_cents)}${order.payment_preference==='semester'?'\nFuture semester payments, if any, are arranged separately.':''}`;
 const body=lines.map(i=>`<div style="padding:18px 0;border-bottom:1px solid #ddd"><h3 style="margin:0 0 8px">${e(i.student)}</h3><p>${e(i.session)}</p><p>${e(i.status)}</p></div>`).join('');
 const html=`<!doctype html><html lang="en"><body style="margin:0;background:#f0f4f4;font-family:Helvetica,Arial,sans-serif;color:#062632;line-height:1.6"><div style="max-width:640px;margin:24px auto;background:#fff;padding:32px;border-radius:16px"><h1 style="font-size:26px">${heading}</h1><p>${intro}</p><p>${e(summary).replace(/\n/g,'<br>')}</p>${body}<p style="margin-top:28px"><a href="https://www.chickenshednyc.org/dashboard/registrations" style="display:inline-block;padding:14px 22px;background:#009fce;color:#fff;text-decoration:none;border-radius:6px">View your registrations</a></p><p>Contact Chickenshed NYC if you need help with these registrations or payment arrangements.</p></div></body></html>`;
 return {recipient:parent.email,subject:heading,html,text:[heading,intro,summary,...lines.map(i=>`${i.student}\n${i.session}\n${i.status}`),'View your registrations: https://www.chickenshednyc.org/dashboard/registrations'].join('\n\n')};
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
