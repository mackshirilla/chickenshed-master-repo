import {requireValue,POLICY} from './quote.mjs';
export const SUMMER_TEMPLATE_ID='d-71675df1534941f6b62ad88f59aac3ce';
export function confirmationIdentity(order){return `Summer confirmation: ${order.order_reference}`;}
export function confirmationData(order,{testMode=false,origin}){
 requireValue(order?.status==='paid'&&order.checkout_policy===POLICY&&order.paid_cents===order.quote?.totals?.due_now_cents&&order.checkout_session_id&&order.payment_intent_id,'MAIL_ORDER','A confirmed Summer payment is required.',409);
 requireValue(['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io','https://www.chickenshednyc.org'].includes(origin),'MAIL_ORIGIN','Summer confirmation is unavailable.',503);
 const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100),q=order.quote,t=q.totals;
 const path=origin==='http://127.0.0.1:4817'?'/summer-registration-success':'/checkout-success/summer-camp-success';
 return {testMode,emailSubject:(testMode?'[TEST] ':'')+'Summer Shed Registration Confirmation ✅',orderNumber:String(order.id),orderReference:order.order_reference,paidToday:money(order.paid_cents),totalTuition:money(t.tuition_cents),hasAid:q.aid_percent>0,
  aidPercent:q.aid_percent?`${q.aid_percent}%`:null,aidAmount:q.aid_percent?money(t.aid_cents):null,netTuition:q.aid_percent?money(t.net_tuition_cents):null,
  hasBalance:t.balance_after_checkout_cents>0,remainingBalance:money(t.balance_after_checkout_cents),pendingStudents:q.items.some(i=>i.student_status==='Pending'),
  receiptUrl:origin+path+'?session_id='+encodeURIComponent(order.checkout_session_id),
  items:q.items.map(i=>({studentName:i.student_name,packageName:i.package_name,sessionTime:i.session_time||i.time||'',paymentLabel:i.student_status==='Pending'?'Deposit paid · student review pending':'Tuition paid in full',paidToday:money(i.paid_cents??i.due_now_cents),hasBalance:i.balance_after_checkout_cents>0,remainingBalance:money(i.balance_after_checkout_cents)}))};
}
export async function sendConfirmation({key,fromEmail,recipient,data,validateOnly=false,fetcher=fetch}){
 requireValue(typeof key==='string'&&key.length>20&&/^[^\s@]+@chickenshednyc\.org$/i.test(fromEmail)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient),'MAIL_SETUP','Summer email is not configured.',503);
 try{
  const response=await fetcher('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000),
   body:JSON.stringify({from:{email:fromEmail,name:'Chickenshed NYC'},personalizations:[{to:[{email:recipient}],dynamic_template_data:data}],template_id:SUMMER_TEMPLATE_ID,categories:['summer-registration'],custom_args:{summer_order_reference:data.orderReference},tracking_settings:{click_tracking:{enable:false,enable_text:false}},...(validateOnly?{mail_settings:{sandbox_mode:{enable:true}}}:{})})});
  return {accepted:!validateOnly&&response.status===202,validated:validateOnly&&response.status===200,http_status:response.status,message_id:response.headers.get('x-message-id')||null,uncertain:false};
 }catch{return {accepted:false,http_status:null,message_id:null,uncertain:true};}
}
