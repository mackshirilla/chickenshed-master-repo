// Isolated sandbox integration only; never publish/promote this pack.
query "registration/start" verb=GET {
 api_group = "Unified Registration Sandbox"
 auth = "users"
 input {

 }
 stack {
function.run summer_bridge_fixture_guard { input = {} } as $sandbox_guard
function.run registration_context_v1 { input = {actor_id:$auth.id} } as $base
api.lambda {
 code = """
  const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.filter(s=>[1,3,10,13].includes(s.Parent_program)&&(s.Parent_program!==10||(Number(s.Start_Date)>0&&Number(s.End_Date)>=Date.now()))).map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · '),program_id:s.Parent_program,start_date:s.Start_Date,end_date:s.End_Date,program_name:b.programs.find(p=>p.id===s.Parent_program)?.name||'',workshop_id:s.Parent_workshop,workshop_name:b.workshops.find(w=>w.id===s.Parent_workshop)?.Name||s.Name,payment_options:s.Parent_program===13?['full']:['full',...(b.products.find(p=>p.id===s.Tuition_product)?.Semester_price_id?['semester']:[]),...(b.products.find(p=>p.id===s.Deposit_product)?.Single_sale_price_id?['monthly']:[])]})),aid_rates:[10,20,35,50,75]};
  """
 timeout = 30
} as $result
 }
 response = $result
 guid = "pkA1a4wnNNxJZuiL_fFvEZpQD2k"
}