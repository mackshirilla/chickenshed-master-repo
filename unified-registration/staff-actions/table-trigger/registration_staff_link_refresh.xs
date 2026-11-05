table_trigger registration_staff_link_refresh {
table = "session_registrations"
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
const n=$input.new||{},o=$input.old||{};return {next:Number(n.registration_order_id)||0,previous:Number(o.registration_order_id)||0};
 """
 timeout = 30
} as $event
conditional { if ($event.next > 0) { db.get registration_orders {field_name="id"
field_value=$event.next} as $next_order
conditional {if ($next_order.checkout_policy == "staff_manual_v1") {function.run registration_staff_sync_v1 {input={order_id:$event.next}} as $next_sync}} } }
conditional {if ($event.previous > 0 && $event.previous != $event.next) { db.get registration_orders {field_name="id"
field_value=$event.previous} as $old_order
conditional {if ($old_order.checkout_policy == "staff_manual_v1") {function.run registration_staff_sync_v1 {input={order_id:$event.previous}} as $previous_sync}} }}
}
history = 100
}
