import {requireValue,POLICY} from './quote.mjs';
export const SUMMER_TEMPLATE_ID='d-f98e8a8a23824ce1bf2625798ce6f7c5';
export function confirmationIdentity(order){return `Registration confirmation: ${order.order_reference}`;}
export function confirmationData(order,{testMode=false,origin}){
 requireValue(order?.status==='paid'&&order.checkout_policy===POLICY&&order.paid_cents===order.quote?.totals?.due_now_cents&&order.checkout_session_id&&
  (order.payment_intent_id||order.paid_cents===0&&['paid','no_payment_required'].includes(order.session_snapshot?.payment_status)&&order.session_snapshot?.status==='complete'),'MAIL_ORDER','A confirmed Registration payment is required.',409);
 requireValue(['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io','https://www.chickenshednyc.org'].includes(origin),'MAIL_ORIGIN','Registration confirmation is unavailable.',503);
 const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100),q=order.quote,t=q.totals;
 const path=origin==='http://127.0.0.1:4817'?'/registration-success-preview':'/checkout-success/registration-order';
 return {testMode,emailSubject:(testMode?'[TEST] ':'')+'Chickenshed NYC Registration Confirmation ✅',orderNumber:String(order.id),orderReference:order.order_reference,paidToday:money(order.paid_cents),hasSemester:q.items.some(i=>i.payment_preference==='semester'),tuitionLabel:q.items.some(i=>i.payment_preference==='semester')?'Tuition in this checkout':'Total tuition',balanceLabel:q.items.some(i=>i.payment_preference==='semester')?'Balance on this order':'Balance after registration',totalTuition:money(t.tuition_cents),hasAid:q.aid_percent>0,
  aidPercent:q.aid_percent?`${q.aid_percent}%`:null,aidAmount:q.aid_percent?money(t.aid_cents):null,netTuition:q.aid_percent?money(t.net_tuition_cents):null,
  hasBalance:t.balance_after_checkout_cents>0,remainingBalance:money(t.balance_after_checkout_cents),paymentPreference:q.payment_preference||'full',needsArrangement:q.items.some(i=>i.payment_preference==='monthly'&&i.balance_after_checkout_cents>0),coveredTerms:[...new Set(q.items.map(i=>i.coverage_label))].join('; '),pendingStudents:q.items.some(i=>i.student_status==='Pending'),
  receiptUrl:origin+path+'?session_id='+encodeURIComponent(order.checkout_session_id),
  items:q.items.map(i=>({studentName:i.student_name,packageName:i.package_name,coverageLabel:i.coverage_label,paymentPreference:i.payment_preference,sessionTime:i.session_time||i.time||'',paymentLabel:(i.payment_option==='deposit'?(i.promotion_discount_cents&&i.due_now_cents===0?(i.student_status==='Pending'?'Deposit covered by coupon · student review pending':'Deposit covered by coupon · monthly payments arranged by staff'):(i.student_status==='Pending'?'Deposit received · student review pending':'Deposit received · monthly payments arranged by staff')):(i.promotion_discount_cents&&i.due_now_cents===0?'Tuition covered by coupon':(i.tuition_period==='semester'?'Semester tuition paid':'Tuition paid in full')))+(i.promotion_discount_cents?' · Coupon '+money(i.promotion_discount_cents):''),paidToday:money(i.paid_cents??i.due_now_cents),hasBalance:i.balance_after_checkout_cents>0,remainingBalance:money(i.balance_after_checkout_cents)}))};
}
export async function sendConfirmation({key,fromEmail,recipient,data,validateOnly=false,fetcher=fetch}){
 requireValue(typeof key==='string'&&key.length>20&&/^[^\s@]+@chickenshednyc\.org$/i.test(fromEmail)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient),'MAIL_SETUP','Registration email is not configured.',503);
 try{
  const response=await fetcher('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000),
   body:JSON.stringify({from:{email:fromEmail,name:'Chickenshed NYC'},personalizations:[{to:[{email:recipient}],dynamic_template_data:data}],template_id:SUMMER_TEMPLATE_ID,categories:['registration-orders'],custom_args:{registration_order_reference:data.orderReference},tracking_settings:{click_tracking:{enable:false,enable_text:false}},...(validateOnly?{mail_settings:{sandbox_mode:{enable:true}}}:{})})});
  return {accepted:!validateOnly&&response.status===202,validated:validateOnly&&response.status===200,http_status:response.status,message_id:response.headers.get('x-message-id')||null,uncertain:false};
 }catch{return {accepted:false,http_status:null,message_id:null,uncertain:true};}
}
