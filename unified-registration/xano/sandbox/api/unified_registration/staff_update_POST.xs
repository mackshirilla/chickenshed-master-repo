// Isolated sandbox integration only; never publish/promote this pack.
query "registration/staff-update" verb=POST {
 api_group = "Unified Registration Sandbox"
 auth = "users"
 input {
  int order_id
  bool handled
  text staff_notes?=""
 }
 stack {
function.run summer_bridge_fixture_guard { input = {} } as $sandbox_guard
api.lambda {
 code = """
  try { let ids=[];try{ids=JSON.parse($env.summer_staff_user_ids||'[]')}catch{}requireValue(Array.isArray(ids)&&ids.includes($auth.id),'FORBIDDEN','Staff access is not configured for this sandbox.',403);return {ok:true}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $staff_guard
precondition ($staff_guard.ok === true) { error = "Staff access required." }
precondition (($input.staff_notes|strlen) <= 2000) { error = "Staff notes are too long." }
var $result { value = null }
db.transaction {
 stack {
  db.query registration_orders {
   lock = true
   where = $db.registration_orders.id == $input.order_id && ($db.registration_orders.status == "paid" || $db.registration_orders.status == "review")
   return = {type:"single"}
  } as $order
  precondition ($order != null) {
 error_type = "notfound"
 error = "Order not found." }
  db.edit registration_orders {
   field_name = "id"
   field_value = $order.id
   data = {handled:$input.handled,staff_notes:$input.staff_notes}
  } as $updated
  var.update $result { value = {order_id:$updated.id,handled:$updated.handled,staff_notes:$updated.staff_notes} }
 }
}
 }
 response = $result
 guid = "eNlgMGOUVYbVnd8KGF22emPC2sY"
}