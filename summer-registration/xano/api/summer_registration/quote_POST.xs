// Production candidate, not deployed. Guard defaults closed.
query "summer/quote" verb=POST {
 api_group = "Summer Registration"
 auth = "users"
 input {
  json items
  int aid_percent?=0
 }
 stack {
function.run summer_live_guard_v1 { input = {} } as $live_guard
var $request { value = {items:$input.items,aid_percent:$input.aid_percent} }
function.run summer_live_quote_context_v1 { input = {actor_id:$auth.id,request:$request} } as $quoted
function.run summer_live_quote_v1 { input = {request:$request,context:$quoted.context} } as $quote
precondition ($quote.policy === "summer_family_v1") { error = "Summer quote is unavailable." }
 }
 response = $quote
}
