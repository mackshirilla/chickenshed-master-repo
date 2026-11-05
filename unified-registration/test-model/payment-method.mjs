import {POLICY,requireValue}from'./quote.mjs';
// Stripe stores the card. This helper sees only canonical Stripe IDs and never card numbers/CVC.
export async function saveFamilyPaymentMethod(order,client){
 requireValue(order?.checkout_policy===POLICY&&order.status==='paid','PAYMENT_METHOD_ORDER','A confirmed registration is required.');
 if(!order.payment_intent_id||!order.paid_cents)return {saved:false,reason:'no_payment_collected',default_changed:false};
 const s=await client.request('session',order.checkout_session_id,{expand:['customer','payment_intent.payment_method']});
 const customer=s.customer,pi=s.payment_intent,method=pi?.payment_method;
 requireValue(s.livemode===false&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.checkout_policy===POLICY&&s.metadata.order_reference===order.order_reference&&s.metadata.quote_version===String(order.quote_version)&&customer?.id===order.stripe_customer_id&&pi?.id===order.payment_intent_id&&pi.setup_future_usage==='off_session'&&method?.customer===customer.id&&method.type==='card','PAYMENT_METHOD_MISMATCH','The saved payment method needs staff review.');
 const previous=customer.invoice_settings?.default_payment_method;
 // Existing subscription/customer defaults remain intact. A first saved card becomes the
 // default for staff-created invoices; staff can select another saved card when arranging payments.
 if(previous)return {saved:true,default_changed:false,existing_default_preserved:true};
 const updated=await client.request('customer_update',customer.id,{invoice_settings:{default_payment_method:method.id}},order.order_reference+':default_payment_method');
 requireValue(updated.id===customer.id&&updated.invoice_settings?.default_payment_method===method.id,'PAYMENT_METHOD_UNAVAILABLE','The saved card is attached, but its default setting needs staff review.');
 return {saved:true,default_changed:true,existing_default_preserved:false};
}
