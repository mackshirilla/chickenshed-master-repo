// Internal delivery validation only. SendGrid sandbox mode never delivers an email.
function registration_staff_validate_delivery_v1 {
input {int order_id
bool dry_run?=true}
stack {
function.run registration_orders_live_guard_v1 {input={}} as $guard
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

  const POLICY='registration_order_v2';
  const AID_RATES=Object.freeze([0,10,20,35,50,75]);
  const PAYMENT_PREFERENCES=Object.freeze(['full','semester','monthly']);
  class SummerError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
  function requireValue(condition,code,message,status=400){if(!condition)throw new SummerError(code,message,status);}
  const isLab = session => Number(session.program_id ?? session.Parent_program) === 10;
  const isQualifyingPlayers = session => Number(session.program_id ?? session.Parent_program) === 1 && [2,3,4].includes(Number(session.workshop_id ?? session.Parent_workshop));
  const positiveId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
  function coverageFor(session,preference,now=Date.now()){
   if(session.program_id===13)return {key:`summer:${session.id}`,label:'Summer package',period:'package'};
   if(isLab(session)){const start=Number(session.start_date),end=Number(session.end_date);requireValue(start>0&&end>=start&&end>=now,'TERM_UNAVAILABLE','This Lab’s dates need to be confirmed or the Lab has ended. Please contact Chickenshed NYC.',409);return {key:`lab:${session.id}`,label:session.name,period:preference==='semester'?'semester':'lab',start,end};}
   // Semester is a payment arrangement, not a separately dated enrollment.
   // Eligibility follows the actual registered session for every payment choice.
   const start=Number(session.start_date??session.season_start),end=Number(session.end_date??session.season_end);
   requireValue(start>0&&end>start,'TERM_UNAVAILABLE','This session’s dates need to be confirmed. Please contact Chickenshed NYC.',503);
   const year=new Date(start).getUTCFullYear(),season=`${year}–${String(year+1).slice(-2)}`;
   requireValue(now<=end,'TERM_UNAVAILABLE','This session has ended. Please contact Chickenshed NYC.',409);
   return {key:`session:${session.id}`,label:`${season} season`,period:preference==='semester'?'semester':'season',start,end};
  }
  // Only server-owned registration/session/order data enters this normalizer. Profile approval is not membership.
  function enrollmentCoverage(enrollments, {sessions,orders=[],subscriptions=[]}) {
   return enrollments.map(row=>{
    const session=sessions.find(s=>s.id===row.session_id);
    if(!session||Number(session.Parent_program??session.program_id)!==row.program_id||Number(session.Parent_workshop??session.workshop_id)!==row.workshop_id)return {...row,coverage_start:null,coverage_end:null};
    let start=null,end=null;
    if(row.registration_order_id){
     const order=orders.find(o=>o.id===row.registration_order_id&&o.owner_user_id===row.parent_user_id);
     if(order?.checkout_policy==='staff_manual_v1'&&order.status==='manual'&&order.manual_parent_id===row.parent_user_id&&!order.staff_validation_error){
      start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;
     }else{
      const item=order?.status==='paid'?order?.quote?.items?.find(i=>i.student_id===row.student_id&&i.session_id===row.session_id&&i.program_id===row.program_id):null;
      start=item?.coverage_start;end=item?.coverage_end;
     }
    }else{
     const subscription=subscriptions.find(s=>s.id===row.subscription_id&&s.user_id===row.parent_user_id);
     // Billing cadence does not shorten an Active registration's session coverage.
     if(!row.subscription_id||subscription){start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;}
    }
    return {...row,coverage_start:Number(start)||null,coverage_end:Number(end)||null};
   });
  }
  function labEligibility(studentId, lab, {actorId,enrollments=[],cart=[]}) {
   const start=Number(lab.coverage_start??lab.start_date),end=Number(lab.coverage_end??lab.end_date);
   if(!(start>0&&end>=start))return false;
   const covers=r=>Number(r.coverage_start)>0&&Number(r.coverage_start)<=start&&Number(r.coverage_end)>=end;
   return enrollments.some(r=>r.parent_user_id===actorId&&r.student_id===studentId&&r.status==='Active'&&isQualifyingPlayers(r)&&covers(r))||
    cart.some(i=>i.student_id===studentId&&i.will_be_active===true&&isQualifyingPlayers(i)&&covers(i));
  }
  // Payment options are derived from assigned catalog fields, never legacy recurring prices.
  // Summer retains its current package/deposit flow without offering payment plans.
  function paymentOptions(session) {
   if(session.program_id===13)return ['full'];
   if(Array.isArray(session.payment_options))return PAYMENT_PREFERENCES.filter(p=>session.payment_options.includes(p));
   return ['full',...(session.semester?.price_id?['semester']:[]),...(session.deposit?.price_id?['monthly']:[])];
  }
  function quoteFamily(request,{actorId,students,sessions,coupons,enrollments=[],now=Date.now()}){
   requireValue(Array.isArray(request.items)&&request.items.length>0&&request.items.length<=30,'ITEMS_REQUIRED','Add at least one student and session.');
   const aidPercent=Number(request.aid_percent??0);requireValue(AID_RATES.includes(aidPercent),'INVALID_AID','Choose an available financial aid percentage.');
   const selected=request.items.map(input=>{requireValue(positiveId(input.student_id)&&positiveId(input.session_id),'INVALID_ITEM','Select a student and session for every row.');const student=students.find(s=>s.id===Number(input.student_id)&&s.parent_user_id===actorId),session=sessions.find(s=>s.id===Number(input.session_id)&&[1,3,10,13].includes(s.program_id)&&(!s.add_on||isLab(s))&&!s.draft&&!s.archived);requireValue(student&&['Approved','Pending'].includes(student.Status),'STUDENT_UNAVAILABLE','A selected student is unavailable.',403);requireValue(session,'SESSION_UNAVAILABLE','A selected session is unavailable.');return {student,session};});
   const planned=selected.filter(({session})=>paymentOptions(session).length>1),regular=planned.length>0,preference=regular?request.payment_preference:null;
   requireValue(!regular||PAYMENT_PREFERENCES.includes(preference),'PAYMENT_PREFERENCE','Choose how you would like to pay before continuing.');
   requireValue(!regular||planned.every(({session})=>paymentOptions(session).includes(preference)),'PAYMENT_UNAVAILABLE','This payment option is not available for every selected item with payment plans. Choose another option.',409);
   const seen=new Set();const validPrice=p=>p?.price_id&&p?.product_id&&Number.isSafeInteger(p.cents)&&p.cents>0&&p.active===true&&p.currency==='usd'&&p.type==='one_time';
   const items=selected.map(({student,session})=>{
    const key=`${student.id}:${session.id}`;requireValue(!seen.has(key),'DUPLICATE_ITEM','This student and session are already in your registration.');seen.add(key);
    requireValue(!enrollments.some(e=>e.student_id===student.id&&e.session_id===session.id&&['Active','Pending','Waitlist','Paused'].includes(e.status)),'ALREADY_REGISTERED','This student already has a registration for this session. Contact Chickenshed NYC about changes or later semester payments.',409);
    const lab=isLab(session),paymentPreference=paymentOptions(session).length>1?preference:'full',coverage=coverageFor(session,paymentPreference,now),tuition=paymentPreference==='semester'?session.semester:session.tuition;
    requireValue(validPrice(tuition),'CATALOG_INVALID','Pricing is temporarily unavailable for this session.',503);
    const tuitionCents=tuition.cents,lineAid=aidPercent,aidCents=Math.round(tuitionCents*lineAid/100),net=tuitionCents-aidCents;
    const pending=student.Status==='Pending',monthly=paymentPreference==='monthly',deposit=pending&&Boolean(session.deposit?.price_id)||monthly;
    requireValue(!deposit||(validPrice(session.deposit)&&tuition.product_id!==session.deposit.product_id),'DEPOSIT_UNAVAILABLE','The assigned deposit price needs to be configured for this session. Please contact Chickenshed NYC.',503);
    const gross=deposit?session.deposit.cents:tuitionCents,discount=deposit?0:aidCents,due=gross-discount;
    requireValue(net>=due,'CATALOG_INVALID','Please contact Chickenshed NYC about this session’s deposit.',503);
    return {student_id:student.id,student_name:student.full_name,student_status:student.Status,session_id:session.id,package_name:session.name,session_time:session.time||'',program_id:session.program_id,program_name:session.program_name,workshop_name:session.workshop_name||'',workshop_id:session.workshop_id,registration_kind:lab?'lab':'program',payment_preference:paymentPreference,coverage_key:coverage.key,coverage_label:coverage.label,coverage_start:coverage.start||null,coverage_end:coverage.end||null,tuition_period:coverage.period,deposit_reason:!deposit?null:pending?(monthly?'review_and_monthly':'student_review'):(monthly?'monthly':null),tuition_product:tuition.product_id,tuition_price:tuition.price_id,deposit_product:session.deposit?.product_id||null,deposit_price:session.deposit?.price_id||null,payment_option:deposit?'deposit':'full',aid_percent:lineAid,tuition_cents:tuitionCents,aid_cents:aidCents,net_tuition_cents:net,checkout_gross_cents:gross,checkout_discount_cents:discount,due_now_cents:due,paid_cents:0,balance_after_checkout_cents:net-due,charge_price:deposit?session.deposit.price_id:tuition.price_id,charge_product:deposit?session.deposit.product_id:tuition.product_id};
   }).sort((a,b)=>a.student_id-b.student_id||a.session_id-b.session_id);
   const cart=items.map(i=>({...i,will_be_active:i.student_status==='Approved'}));
   for(const item of items.filter(isLab))requireValue(labEligibility(item.student_id,item,{actorId,enrollments,cart}),'LAB_ELIGIBILITY','Labs require this student to have an Active Players 2, 3 or 4 registration covering the Lab’s dates. You may add a qualifying Players registration for an Approved student in this checkout.',409);
   const effectiveAid=aidPercent;
   const sum=f=>items.reduce((n,i)=>n+i[f],0),totals=Object.fromEntries(['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(f=>[f,sum(f)]));
   const lines=new Map();for(const item of items){const line=lines.get(item.charge_price)||{price:item.charge_price,product:item.charge_product,quantity:0,amount_subtotal:0,amount_discount:0,amount_total:0};line.quantity++;line.amount_subtotal+=item.checkout_gross_cents;line.amount_discount+=item.checkout_discount_cents;line.amount_total+=item.due_now_cents;lines.set(line.price,line);}
   let couponId=null;if(totals.checkout_discount_cents>0){const coupon=coupons.find(c=>c.percent_off===aidPercent),eligible=[...new Set(sessions.flatMap(s=>[s.tuition?.product_id,s.semester?.product_id]).filter(Boolean))].sort();requireValue(coupon?.valid&&coupon.duration==='once'&&Array.isArray(coupon.products)&&JSON.stringify([...coupon.products].sort())===JSON.stringify(eligible),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);couponId=coupon.id;}
   return {policy:POLICY,currency:'usd',payment_preference:preference,aid_percent:effectiveAid,items,totals,lines:[...lines.values()].sort((a,b)=>a.price.localeCompare(b.price)),coupon_id:couponId};
  }
  function quoteIdentity(q){return JSON.stringify({policy:q.policy,preference:q.payment_preference,coupon:q.coupon_id,items:q.items.map(i=>[i.student_id,i.session_id,i.student_status,i.tuition_price,i.deposit_price,i.payment_preference,i.coverage_key,i.coverage_start,i.coverage_end,i.workshop_id,i.payment_option,i.aid_percent,i.tuition_cents,i.aid_cents,i.net_tuition_cents,i.checkout_gross_cents,i.checkout_discount_cents,i.due_now_cents,i.balance_after_checkout_cents])});}

  function validateAidIntake(percent, input) {
    if (percent === 0) return null;
    const data = input || {};
    requireValue(['Parent', 'Guardian', 'Grandparent', 'Other'].includes(data.relationship), 'AID_DETAILS', 'Please complete your financial aid details.');
    const dollars = value => Number(String(value ?? '').replace(/,/g, ''));
    requireValue(String(data.annualIncome ?? '').trim() !== '' && String(data.monthlyExpense ?? '').trim() !== '' &&
      Number.isFinite(dollars(data.annualIncome)) && dollars(data.annualIncome) >= 0 &&
      Number.isFinite(dollars(data.monthlyExpense)) && dollars(data.monthlyExpense) >= 0 &&
      ['Yes', 'No'].includes(data.previousParticipant), 'AID_DETAILS', 'Please complete your financial aid details.');
    return { relationship: data.relationship, annualIncome: dollars(data.annualIncome), monthlyExpense: dollars(data.monthlyExpense), previousParticipant: data.previousParticipant };
  }

  const SUMMER_TEMPLATE_ID='d-f98e8a8a23824ce1bf2625798ce6f7c5';
  function confirmationIdentity(order){return `Registration confirmation: ${order.order_reference}`;}
  function confirmationData(order,{testMode=false,origin}){
   requireValue(order?.status==='paid'&&order.checkout_policy===POLICY&&order.paid_cents===order.quote?.totals?.due_now_cents&&order.checkout_session_id&&
    (order.payment_intent_id||order.paid_cents===0&&['paid','no_payment_required'].includes(order.session_snapshot?.payment_status)&&order.session_snapshot?.status==='complete'),'MAIL_ORDER','A confirmed Registration payment is required.',409);
   requireValue(['https://www.chickenshednyc.org'].includes(origin),'MAIL_ORIGIN','Registration confirmation is unavailable.',503);
   const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100),q=order.quote,t=q.totals;
   const path='/checkout-success/registration-order';
   return {testMode,emailSubject:(testMode?'[TEST] ':'')+'Chickenshed NYC Registration Confirmation ✅',orderNumber:String(order.id),orderReference:order.order_reference,paidToday:money(order.paid_cents),hasSemester:q.items.some(i=>i.payment_preference==='semester'),tuitionLabel:q.items.some(i=>i.payment_preference==='semester')?'Tuition in this checkout':'Total tuition',balanceLabel:q.items.some(i=>i.payment_preference==='semester')?'Balance on this order':'Balance after registration',totalTuition:money(t.tuition_cents),hasAid:q.aid_percent>0,
    aidPercent:q.aid_percent?`${q.aid_percent}%`:null,aidAmount:q.aid_percent?money(t.aid_cents):null,netTuition:q.aid_percent?money(t.net_tuition_cents):null,
    hasBalance:t.balance_after_checkout_cents>0,remainingBalance:money(t.balance_after_checkout_cents),paymentPreference:q.payment_preference||'full',needsArrangement:q.items.some(i=>i.payment_preference==='monthly'&&i.balance_after_checkout_cents>0),coveredTerms:[...new Set(q.items.map(i=>i.coverage_label))].join('; '),pendingStudents:q.items.some(i=>i.student_status==='Pending'),
    receiptUrl:origin+path+'?session_id='+encodeURIComponent(order.checkout_session_id),
    items:q.items.map(i=>({studentName:i.student_name,packageName:i.package_name,coverageLabel:i.coverage_label,paymentPreference:i.payment_preference,sessionTime:i.session_time||i.time||'',paymentLabel:(i.payment_option==='deposit'?(i.promotion_discount_cents&&i.due_now_cents===0?(i.student_status==='Pending'?'Deposit covered by coupon · student review pending':'Deposit covered by coupon · monthly payments arranged by staff'):(i.student_status==='Pending'?'Deposit received · student review pending':'Deposit received · monthly payments arranged by staff')):(i.promotion_discount_cents&&i.due_now_cents===0?'Tuition covered by coupon':(i.tuition_period==='semester'?'Semester tuition paid':'Tuition paid in full')))+(i.promotion_discount_cents?' · Coupon '+money(i.promotion_discount_cents):''),paidToday:money(i.paid_cents??i.due_now_cents),hasBalance:i.balance_after_checkout_cents>0,remainingBalance:money(i.balance_after_checkout_cents)}))};
  }
  async function sendConfirmation({key,fromEmail,recipient,data,validateOnly=false,fetcher=fetch}){
   requireValue(typeof key==='string'&&key.length>20&&/^[^\s@]+@chickenshednyc\.org$/i.test(fromEmail)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient),'MAIL_SETUP','Registration email is not configured.',503);
   try{
    const response=await fetcher('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000),
     body:JSON.stringify({from:{email:fromEmail,name:'Chickenshed NYC'},personalizations:[{to:[{email:recipient}],dynamic_template_data:data}],template_id:SUMMER_TEMPLATE_ID,categories:['registration-orders'],custom_args:{registration_order_reference:data.orderReference},tracking_settings:{click_tracking:{enable:false,enable_text:false}},...(validateOnly?{mail_settings:{sandbox_mode:{enable:true}}}:{})})});
    return {accepted:!validateOnly&&response.status===202,validated:validateOnly&&response.status===200,http_status:response.status,message_id:response.headers.get('x-message-id')||null,uncertain:false};
   }catch{return {accepted:false,http_status:null,message_id:null,uncertain:true};}
  }


const LEGACY_POLICY="summer_family_v1";
const LEGACY_TEMPLATE_ID='d-71675df1534941f6b62ad88f59aac3ce';
function legacyIdentity(order){return `Summer confirmation: ${order.order_reference}`;}
function legacyConfirmationData(order,{testMode=false,origin}){
 requireValue(order?.status==='paid'&&order.checkout_policy===LEGACY_POLICY&&order.paid_cents===order.quote?.totals?.due_now_cents&&order.checkout_session_id&&
  (order.payment_intent_id||order.paid_cents===0&&['paid','no_payment_required'].includes(order.session_snapshot?.payment_status)&&order.session_snapshot?.status==='complete'),'MAIL_ORDER','A confirmed Summer payment is required.',409);
 requireValue(['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io','https://www.chickenshednyc.org'].includes(origin),'MAIL_ORIGIN','Summer confirmation is unavailable.',503);
 const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100),q=order.quote,t=q.totals;
 const path=origin==='http://127.0.0.1:4817'?'/summer-registration-success':'/checkout-success/summer-camp-success';
 return {testMode,emailSubject:(testMode?'[TEST] ':'')+'Summer Shed Registration Confirmation ✅',orderNumber:String(order.id),orderReference:order.order_reference,paidToday:money(order.paid_cents),totalTuition:money(t.tuition_cents),hasAid:q.aid_percent>0,
  aidPercent:q.aid_percent?`${q.aid_percent}%`:null,aidAmount:q.aid_percent?money(t.aid_cents):null,netTuition:q.aid_percent?money(t.net_tuition_cents):null,
  hasBalance:t.balance_after_checkout_cents>0,remainingBalance:money(t.balance_after_checkout_cents),pendingStudents:q.items.some(i=>i.student_status==='Pending'),
  receiptUrl:origin+path+'?session_id='+encodeURIComponent(order.checkout_session_id),
  items:q.items.map(i=>({studentName:i.student_name,packageName:i.package_name,sessionTime:i.session_time||i.time||'',paymentLabel:(i.student_status==='Pending'?(i.promotion_discount_cents&&i.due_now_cents===0?'Deposit covered by coupon · student review pending':'Deposit paid · student review pending'):(i.promotion_discount_cents&&i.due_now_cents===0?'Tuition covered by coupon':'Tuition paid in full'))+(i.promotion_discount_cents?' · Coupon '+money(i.promotion_discount_cents):''),paidToday:money(i.paid_cents??i.due_now_cents),hasBalance:i.balance_after_checkout_cents>0,remainingBalance:money(i.balance_after_checkout_cents)}))};
}

try{const o=$var.order;need($env.registration_confirmation_email_enabled==='true','Registration email is not enabled.');if(!$input.dry_run)resendCheck(o);else resendCheck({...o,resend_requested:true,resend_requested_by:'validation@chickenshednyc.org'});const manual=o.checkout_policy===MANUAL_POLICY;if(!manual)(o.checkout_policy===LEGACY_POLICY?legacyConfirmationData:confirmationData)(o,{origin:'https://www.chickenshednyc.org'});const result={...staffMessage({...o,current_balance_cents:balanceValues(o).current_balance_cents},$var.parent,$var.registrations,$var.students),raw_message:true};if(!manual)need(o.session_snapshot?.livemode===true&&o.checkout_session_id?.startsWith('cs_live_'),'A confirmed live checkout is required.');need(result.recipient&&result.recipient===$var.parent?.email,'Parent account email is required.');return {ok:true,manual,...result};}catch(e){return {ok:false,message:e.message,label:['Sending','Delivery needs review'].includes($var.order?.resend_status)?$var.order.resend_status:e.message};}
 """
 timeout = 30
} as $prepared
var $result {value={ok:false,validated:false,message:$prepared.message}}
conditional {if ($prepared.ok === true) {
api.lambda {
 code = """
const p=$var.prepared,key=$env.sendgrid_api_key||$env.workspace?.sendgrid_api_key,from=$env.sendgrid_from_email||$env.workspace?.sendgrid_from_email;const payload={from:{email:from,name:'Chickenshed NYC'},personalizations:[{to:[{email:p.recipient}],...(p.raw_message?{}:{dynamic_template_data:p.data})}],...(p.raw_message?{subject:p.subject,content:[{type:'text/plain',value:p.text},{type:'text/html',value:p.html}]}:{template_id:p.template_id}),mail_settings:{sandbox_mode:{enable:true}}};const r=await fetch('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000),redirect:'error'});return {ok:r.status===200,validated:r.status===200,http_status:r.status,delivered:false};
 """
 timeout = 30
} as $validation
var.update $result {value=$validation}
}}
}
response=$result
}
