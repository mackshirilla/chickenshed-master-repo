// Production candidate. No key/secret is read before this explicit runtime gate.
function summer_live_guard_v1 {
 input {}
 stack {
  api.lambda {
   code = "return $env.summer_runtime_mode === 'live';"
   timeout = 5
  } as $runtime_enabled
  precondition ($runtime_enabled === true) {
   error_type = "accessdenied"
   error = "Summer registration is not configured."
  }
 }
 response = {configured:true}
}
