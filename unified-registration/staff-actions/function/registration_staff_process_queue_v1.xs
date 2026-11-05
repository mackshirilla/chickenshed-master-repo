function registration_staff_process_queue_v1 {
input {bool send?=true}
stack {
function.run registration_orders_live_guard_v1 {input={}} as $guard
db.query registration_orders {
where = ($db.registration_orders.checkout_policy == "staff_manual_v1" || $db.registration_orders.checkout_policy == "registration_order_v2" || $db.registration_orders.checkout_policy == "summer_family_v1") && ($db.registration_orders.status == "paid" || $db.registration_orders.status == "review" || $db.registration_orders.status == "manual" || $db.registration_orders.status == "manual_review")
return={type:"list"}
} as $orders
foreach ($orders) {each as $order {
try_catch {try {
function.run registration_staff_sync_v1 {input={order_id:$order.id}} as $sync
conditional {if ($input.send === true && $order.resend_requested === true) {
function.run registration_staff_send_confirmation_v1 {input={order_id:$order.id}} as $mail
}}
}
 catch {debug.log {value="Staff registration request needs review"}}}
}}
}
response={checked:true}
}
