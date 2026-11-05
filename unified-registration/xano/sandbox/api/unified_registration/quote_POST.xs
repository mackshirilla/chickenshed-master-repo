// Isolated sandbox integration only; never publish/promote this pack.
query "registration/quote" verb=POST {
 api_group = "Unified Registration Sandbox"
 auth = "users"
 input {
  json items
  int aid_percent?=0
  text? payment_preference?
 }
 stack {
function.run summer_bridge_fixture_guard { input = {} } as $sandbox_guard
var $request { value = {items:$input.items,aid_percent:$input.aid_percent,payment_preference:$input.payment_preference} }
function.run registration_quote_context_v1 { input = {actor_id:$auth.id,request:$request} } as $quoted
function.run registration_quote_v1 { input = {request:$request,context:$quoted.context} } as $quote
precondition ($quote.policy === "registration_order_v2") { error = "Registration quote is unavailable." }
 }
 response = $quote
 guid = "xF9ga9PDvVXPt-9O6KN3sUHahX8"
}