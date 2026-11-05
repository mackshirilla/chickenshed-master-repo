// Isolated sandbox integration only; never publish/promote this pack.
query "registration/staff" verb=GET {
 api_group = "Unified Registration Sandbox"
 auth = "users"
 input {

 }
 stack {
function.run summer_bridge_fixture_guard { input = {} } as $sandbox_guard
api.lambda {
 code = """
  try { let ids=[];try{ids=JSON.parse($env.summer_staff_user_ids||'[]')}catch{}requireValue(Array.isArray(ids)&&ids.includes($auth.id),'FORBIDDEN','Staff access is not configured for this sandbox.',403);return {ok:true}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',issues:e.issues||[],message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $staff_guard
precondition ($staff_guard.ok === true) { error = "Staff access required." }
db.query registration_orders {
 where = $db.registration_orders.status == "paid" || $db.registration_orders.status == "review"
 return = {type:"list"}
} as $orders
api.lambda {
 code = """
  return $var.orders.map(o=>({order_id:o.id,status:o.status,paid_cents:o.paid_cents,paid_at:o.paid_at,items:o.quote.items,totals:o.quote.totals,payment_intent_id:o.payment_intent_id,handled:o.handled,staff_notes:o.staff_notes,review_reason:o.review_reason,observed_payment_cents:o.observed_payment_cents}));
  """
 timeout = 30
} as $result
 }
 response = $result
 guid = "XoQaR-ruLnXd1EPbYY6KrO2JWY0"
}