// Unpublished production candidate. Runtime gate defaults closed.
query "registration/start" verb=GET {
 api_group = "Unified Registration"
 auth = "users"
 input {

 }
 stack {
function.run registration_orders_live_guard_v1 { input = {} } as $sandbox_guard
function.run registration_live_context_v1 { input = {actor_id:$auth.id} } as $base
api.lambda {
 code = """
  const b=$var.base;return {students:b.students.filter(s=>['Pending','Approved'].includes(s.Status)).map(({id,full_name,Status})=>({id,full_name,Status})),sessions:b.sessions.filter(s=>[1,3,10,13].includes(s.Parent_program)&&(s.Parent_program!==10||(Number(s.Start_Date)>0&&Number(s.End_Date)>=Date.now()))).map(s=>({id:s.id,name:s.Name,time:[s.Weekday,s.Time_block].filter(Boolean).join(' · '),program_id:s.Parent_program,start_date:s.Start_Date,end_date:s.End_Date,program_name:b.programs.find(p=>p.id===s.Parent_program)?.name||'',workshop_id:s.Parent_workshop,workshop_name:b.workshops.find(w=>w.id===s.Parent_workshop)?.Name||s.Name,payment_options:(s.Parent_program===13||(s.Parent_program===3&&s.Parent_workshop===21))?['full']:['full',...(b.products.find(p=>p.id===s.Tuition_product)?.Semester_price_id?['semester']:[]),...(s.Offer_monthly_payments===true&&b.products.find(p=>p.id===s.Deposit_product)?.Single_sale_price_id?['monthly']:[])]})),aid_rates:[10,20,35,50,75]};
  """
 timeout = 30
} as $result
 }
 response = $result
}