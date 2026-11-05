// Closed by default. No provider credential is accessed before this guard.
function registration_orders_live_guard_v1 {
 input {}
 stack {
  api.lambda { code = "return $env.registration_runtime_mode === 'live';"
  timeout = 5 } as $enabled
  precondition ($enabled === true) { error_type = "accessdenied"
  error = "Program registration is not configured." }
 }
 response = {configured:true}
}
