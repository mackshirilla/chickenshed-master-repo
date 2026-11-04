// Production candidate, not deployed. Guard defaults closed.
query "summer/start" verb=GET {
 api_group = "Summer Registration"
 auth = "users"
 input {

 }
 stack {
function.run summer_live_guard_v1 { input = {} } as $live_guard
function.run summer_live_context_v1 { input = {actor_id:$auth.id} } as $base
api.lambda {
 code = """
  const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · ')})),aid_rates:[10,20,35,50,75]};
  """
 timeout = 30
} as $result
 }
 response = $result
}
