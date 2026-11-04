// Private Summer mail journal; sandbox only. No automatic resend of pending/failed mail.
function summer_live_confirmation_v1 {
 input {
  text phase
  int order_id
  json args?
 }
 stack {
 function.run summer_live_guard_v1 { input = {} } as $guard
 var $result { value = {claimed:false,mail_id:null,status:null} }
 db.transaction {
 stack {
 db.query registration_orders {
  lock = true
  where = $db.registration_orders.id == $input.order_id
  return = {type:"single"}
 } as $order
 api.lambda {
 code = """
  const POLICY = 'summer_family_v1';
  const AID_RATES = Object.freeze([0, 10, 20, 35, 50, 75]);
  class SummerError extends Error {
    constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
  }
  function requireValue(condition, code, message, status = 400) {
    if (!condition) throw new SummerError(code, message, status);
  }
  const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
  function quoteFamily(request, { actorId, students, sessions, coupons }) {
    requireValue(Array.isArray(request.items) && request.items.length > 0 && request.items.length <= 30,
      'ITEMS_REQUIRED', 'Add at least one child and package.');
    const aidPercent = Number(request.aid_percent ?? 0);
    requireValue(AID_RATES.includes(aidPercent), 'INVALID_AID', 'Choose an available financial aid percentage.');
    const seen = new Set();
    const items = request.items.map(input => {
      requireValue(positiveId(input.student_id) && positiveId(input.session_id), 'INVALID_ITEM', 'Select a child and package for every row.');
      const studentId = Number(input.student_id), sessionId = Number(input.session_id);
      const student = students.find(row => row.id === studentId && row.parent_user_id === actorId);
      requireValue(student && student.Status !== 'Archived', 'STUDENT_UNAVAILABLE', 'A selected student is unavailable.', 403);
      requireValue(['Pending', 'Approved'].includes(student.Status), 'STUDENT_STATUS', 'Please contact Chickenshed about this student’s profile.');
      const session = sessions.find(row => row.id === sessionId && row.program_id === 13 && !row.draft && !row.archived);
      requireValue(session, 'SESSION_UNAVAILABLE', 'A selected summer package is unavailable.');
      const key = `${studentId}:${sessionId}`;
      requireValue(!seen.has(key), 'DUPLICATE_ITEM', 'This child and package are already in your registration.');
      seen.add(key);
      for (const product of [session.tuition, session.deposit]) {
        requireValue(product?.price_id && product?.product_id && Number.isSafeInteger(product.cents) && product.cents > 0 &&
          product.active === true && product.currency === 'usd' && product.type === 'one_time', 'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
      }
      requireValue(session.deposit.cents === 10000 && session.tuition.product_id !== session.deposit.product_id,
        'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
      const tuitionCents = session.tuition.cents;
      const aidCents = Math.round(tuitionCents * aidPercent / 100);
      const netCents = tuitionCents - aidCents;
      const option = student.Status === 'Pending' ? 'deposit' : 'full';
      const grossDueCents = option === 'deposit' ? session.deposit.cents : tuitionCents;
      const checkoutDiscountCents = option === 'full' ? aidCents : 0;
      const dueCents = grossDueCents - checkoutDiscountCents;
      requireValue(netCents >= dueCents, 'CATALOG_INVALID', 'Please contact Chickenshed about this package.', 503);
      return {
        student_id: studentId, student_name: student.full_name, student_status: student.Status,
        session_id: sessionId, package_name: session.name, session_time: String(session.time || '').slice(0,200), program_id: 13,
        tuition_product: session.tuition.product_id, tuition_price: session.tuition.price_id,
        deposit_product: session.deposit.product_id, deposit_price: session.deposit.price_id,
        payment_option: option, aid_percent: aidPercent, tuition_cents: tuitionCents, aid_cents: aidCents,
        net_tuition_cents: netCents, checkout_gross_cents: grossDueCents,
        checkout_discount_cents: checkoutDiscountCents, due_now_cents: dueCents,
        paid_cents: 0, balance_after_checkout_cents: netCents - dueCents,
        charge_price: option === 'deposit' ? session.deposit.price_id : session.tuition.price_id,
        charge_product: option === 'deposit' ? session.deposit.product_id : session.tuition.product_id
      };
    }).sort((a, b) => a.student_id - b.student_id || a.session_id - b.session_id);
    const sum = field => items.reduce((total, row) => total + row[field], 0);
    const totals = {
      tuition_cents: sum('tuition_cents'), aid_cents: sum('aid_cents'), net_tuition_cents: sum('net_tuition_cents'),
      checkout_gross_cents: sum('checkout_gross_cents'), checkout_discount_cents: sum('checkout_discount_cents'),
      due_now_cents: sum('due_now_cents'), balance_after_checkout_cents: sum('balance_after_checkout_cents')
    };
    const lines = new Map();
    for (const row of items) {
      const line = lines.get(row.charge_price) || { price: row.charge_price, product: row.charge_product, quantity: 0, amount_subtotal: 0, amount_discount: 0, amount_total: 0 };
      line.quantity++; line.amount_subtotal += row.checkout_gross_cents;
      line.amount_discount += row.checkout_discount_cents; line.amount_total += row.due_now_cents;
      lines.set(line.price, line);
    }
    let couponId = null;
    if (totals.checkout_discount_cents > 0) {
      const coupon = coupons.find(row => row.percent_off === aidPercent);
      const tuitionProducts = [...new Set(sessions.map(row => row.tuition.product_id))].sort();
      requireValue(coupon?.valid && coupon.duration === 'once' && Array.isArray(coupon.products) &&
        JSON.stringify([...coupon.products].sort()) === JSON.stringify(tuitionProducts),
      'AID_UNAVAILABLE', 'Financial aid pricing is temporarily unavailable.', 503);
      couponId = coupon.id;
    }
    return { policy: POLICY, currency: 'usd', aid_percent: aidPercent, items, totals,
      lines: [...lines.values()].sort((a, b) => a.price.localeCompare(b.price)), coupon_id: couponId };
  }
  
  function quoteIdentity(quote) {
    // Explicit field order survives JSON key reordering by Xano and HTTP serializers.
    return JSON.stringify({ policy: quote.policy, coupon: quote.coupon_id,
      items: quote.items.map(item => [item.student_id, item.session_id, item.student_status,
        item.tuition_price, item.deposit_price, item.payment_option, item.aid_percent,
        item.tuition_cents, item.aid_cents, item.net_tuition_cents, item.checkout_gross_cents,
        item.checkout_discount_cents, item.due_now_cents, item.balance_after_checkout_cents]),
      totals: ['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(key => quote.totals[key]) });
  }
  
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
  
  const SUMMER_TEMPLATE_ID='d-71675df1534941f6b62ad88f59aac3ce';
  function confirmationIdentity(order){return `Summer confirmation: ${order.order_reference}`;}
  function confirmationData(order,{testMode=false,origin}){
   requireValue(order?.status==='paid'&&order.checkout_policy===POLICY&&order.paid_cents===order.quote?.totals?.due_now_cents&&order.checkout_session_id&&
    (order.payment_intent_id||order.paid_cents===0&&['paid','no_payment_required'].includes(order.session_snapshot?.payment_status)&&order.session_snapshot?.status==='complete'),'MAIL_ORDER','A confirmed Summer payment is required.',409);
   requireValue(['https://www.chickenshednyc.org'].includes(origin),'MAIL_ORIGIN','Summer confirmation is unavailable.',503);
   const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100),q=order.quote,t=q.totals;
   const path='/checkout-success/summer-camp-success';
   return {testMode,emailSubject:(testMode?'[TEST] ':'')+'Summer Shed Registration Confirmation ✅',orderNumber:String(order.id),orderReference:order.order_reference,paidToday:money(order.paid_cents),totalTuition:money(t.tuition_cents),hasAid:q.aid_percent>0,
    aidPercent:q.aid_percent?`${q.aid_percent}%`:null,aidAmount:q.aid_percent?money(t.aid_cents):null,netTuition:q.aid_percent?money(t.net_tuition_cents):null,
    hasBalance:t.balance_after_checkout_cents>0,remainingBalance:money(t.balance_after_checkout_cents),pendingStudents:q.items.some(i=>i.student_status==='Pending'),
    receiptUrl:origin+path+'?session_id='+encodeURIComponent(order.checkout_session_id),
    items:q.items.map(i=>({studentName:i.student_name,packageName:i.package_name,sessionTime:i.session_time||i.time||'',paymentLabel:(i.student_status==='Pending'?(i.promotion_discount_cents&&i.due_now_cents===0?'Deposit covered by coupon · student review pending':'Deposit paid · student review pending'):(i.promotion_discount_cents&&i.due_now_cents===0?'Tuition covered by coupon':'Tuition paid in full'))+(i.promotion_discount_cents?' · Coupon '+money(i.promotion_discount_cents):''),paidToday:money(i.paid_cents??i.due_now_cents),hasBalance:i.balance_after_checkout_cents>0,remainingBalance:money(i.balance_after_checkout_cents)}))};
  }
  async function sendConfirmation({key,fromEmail,recipient,data,validateOnly=false,fetcher=fetch}){
   requireValue(typeof key==='string'&&key.length>20&&/^[^\s@]+@chickenshednyc\.org$/i.test(fromEmail)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient),'MAIL_SETUP','Summer email is not configured.',503);
   try{
    const response=await fetcher('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000),
     body:JSON.stringify({from:{email:fromEmail,name:'Chickenshed NYC'},personalizations:[{to:[{email:recipient}],dynamic_template_data:data}],template_id:SUMMER_TEMPLATE_ID,categories:['summer-registration'],custom_args:{summer_order_reference:data.orderReference},tracking_settings:{click_tracking:{enable:false,enable_text:false}},...(validateOnly?{mail_settings:{sandbox_mode:{enable:true}}}:{})})});
    return {accepted:!validateOnly&&response.status===202,validated:validateOnly&&response.status===200,http_status:response.status,message_id:response.headers.get('x-message-id')||null,uncertain:false};
   }catch{return {accepted:false,http_status:null,message_id:null,uncertain:true};}
  }
  
  try {const order=$var.order;const emailOptions={testMode:false,origin:'https://www.chickenshednyc.org'};requireValue(order,'MAIL_ORDER','Summer order not found.');const data=confirmationData(order,emailOptions);requireValue(order.session_snapshot?.livemode===true,'MAIL_ORDER','A live Summer payment is required.');const recipient=order.parent_email;return {ok:true,identity:confirmationIdentity(order),data,recipient};}catch(e){return {ok:false,message:e.code?e.message:'Summer confirmation is unavailable.'};}
 """
 timeout = 30
} as $prepared
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
     api.lambda {
 code = """
  return $var.contact?.id||null;
 """
 timeout = 30
} as $contact_id
     api.lambda {
 code = """
  return {text:JSON.stringify({order_id:$var.order.id,order_reference:$var.order.order_reference,recipient:$var.prepared.recipient,state:'pending',test_mode:false,claimed_at:Date.now()})};
 """
 timeout = 30
} as $journal
     db.add emails_sent {
      data = {template_id:"d-71675df1534941f6b62ad88f59aac3ce",subject:$prepared.identity,text_message:$journal.text,status:"pending",total_recipients:1,successful_sends:0,contact_id:$contact_id,send_text:false}
     } as $mail
     var.update $result { value = {claimed:true,mail_id:$mail.id,recipient:$prepared.recipient,data:$prepared.data} }
    }
    elseif ($input.phase == "complete" && $existing_mail != null) {
     api.lambda {
 code = """
  const row=$var.existing_mail,args=$input.args||{};let journal;try{journal=JSON.parse(row.text_message||'{}')}catch{return {ok:false};}const valid=row.id===args.mail_id&&row.status==='pending'&&[true,false].includes(args.accepted);return {ok:valid,status:args.accepted?'sent':'failed',successful_sends:args.accepted?1:0,journal:JSON.stringify({...journal,state:args.accepted?'accepted':args.uncertain?'uncertain':'failed',http_status:Number.isInteger(args.http_status)?args.http_status:null,message_id:typeof args.message_id==='string'?args.message_id.slice(0,200):null,finished_at:Date.now()})};
 """
 timeout = 30
} as $completion
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
}
