query "registration/account" verb=GET {
 api_group = "Unified Registration"
 auth = "users"
 input {}
 stack {
 function.run registration_orders_live_guard_v1 { input = {} } as $guard
 db.query registration_orders {
 where = $db.registration_orders.owner_user_id == $auth.id
 return = {type:"list"}
 } as $orders
 db.query session_registrations {
 where = $db.session_registrations.parent_user_id == $auth.id && $db.session_registrations.registration_order_id > 0
 return = {type:"list"}
 } as $registrations
 db.query student_profiles { where = $db.student_profiles.parent_user_id == $auth.id
return = {type:"list"} } as $students
 api.lambda { code = """
function requireValue(ok,code,message){if(!ok)throw Error(message);}
function parentAccount(actorId,orders,registrations,students=[]){
 requireValue(Number.isSafeInteger(actorId)&&actorId>0,'UNAUTHORIZED','Please sign in.',401);
 const owned=orders.filter(o=>o.owner_user_id===actorId&&(['summer_family_v1','registration_order_v2'].includes(o.checkout_policy)&&['paid','review'].includes(o.status)||o.checkout_policy==='staff_manual_v1'&&o.status==='manual'&&o.manual_parent_id===actorId&&!o.staff_validation_error));
 const byId=new Map(owned.map(o=>[o.id,o]));const labels={Pending:'Awaiting review',Active:'Active',Waitlist:'Waitlisted',Paused:'Paused',Cancelled:'Cancelled',Canceled:'Cancelled'};
 return {orders:owned.map(o=>({order_id:o.id,order_reference:o.order_reference,manual:o.checkout_policy==='staff_manual_v1',status:o.status,paid_cents:o.paid_cents||0,paid_at:o.paid_at,current_balance_cents:o.current_balance_cents??o.balance_after_checkout_cents??o.quote?.totals?.balance_after_checkout_cents,payment_preference:o.payment_preference||o.quote?.payment_preference||'full',covered_terms:o.covered_terms||[...new Set((o.quote?.items||[]).map(i=>i.coverage_label||'Summer package'))].join('; '),billing_followup:o.billing_followup||null,balance_after_registration_cents:o.balance_after_checkout_cents??o.quote?.totals?.balance_after_checkout_cents,session_id:o.checkout_session_id})),registrations:registrations.filter(r=>r.parent_user_id===actorId&&byId.has(r.registration_order_id)&&!['Draft','Archived'].includes(r.status)).map(r=>{const o=byId.get(r.registration_order_id),manual=o.checkout_policy==='staff_manual_v1',item=(o.quote?.items||[]).find(i=>i.student_id===r.student_id&&i.session_id===r.session_id);return {registration_id:r.id,order_id:o.id,student_id:r.student_id,student_name:item?.student_name||students.find(s=>s.id===r.student_id&&s.parent_user_id===actorId)?.full_name||'',program_name:r.program_name||item?.program_name||'Summer Shed',session_id:r.session_id,session_name:item?.package_name||r.workshop_name,session_time:[r.weekday,r.time_block].filter(Boolean).join(' · '),manual,paid_cents:manual?null:item?.paid_cents??item?.due_now_cents??0,balance_after_registration_cents:item?.balance_after_checkout_cents??0,status:r.status,status_label:labels[r.status]||'Contact Chickenshed NYC',coverage_label:item?.coverage_label||(manual?'Recorded by Chickenshed NYC':'Summer package'),payment_preference:item?.payment_preference||o.payment_preference||'full',receipt_session_id:o.checkout_session_id,resources_available:r.status==='Active'};})};
}

return parentAccount($auth.id,$var.orders,$var.registrations,$var.students);
"""
 timeout = 10 } as $result
 }
 response = $result
}