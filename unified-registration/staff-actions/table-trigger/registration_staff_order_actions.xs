table_trigger registration_staff_order_actions {
table = "registration_orders"
actions = {insert:true,update:true,delete:false,truncate:false}
datasources = ["live"]
active = false
input { json new
json old
enum action { values = ["insert","update","delete","truncate"] }
text datasource }
stack {
api.lambda {
 code = """
const n=$input.new||{},o=$input.old||{},manual=n.checkout_policy==='staff_manual_v1',keys=['manual_parent_id','owner_user_id','manual_total_amount','manual_paid_amount','manual_payment_method','manual_payment_reference','manual_created_by','staff_balance_amount','staff_balance_note','staff_balance_updated_by'];return {id:n.id,sync:manual?($input.action==='insert'||keys.some(k=>n[k]!==o[k])):(JSON.stringify(n.quote)!==JSON.stringify(o.quote)||['staff_balance_amount','staff_balance_note','staff_balance_updated_by'].some(k=>n[k]!==o[k])),send:n.resend_requested===true&&o.resend_requested!==true};
 """
 timeout = 30
} as $event
conditional { if ($event.sync === true) { function.run registration_staff_sync_v1 {input={order_id:$event.id}} as $synced } }
conditional { if ($event.send === true) { function.run registration_staff_send_confirmation_v1 {input={order_id:$event.id}} as $sent } }
}
history = 100
}
