query "registration/resources" verb=GET {
 api_group = "Unified Registration Sandbox"
 auth = "users"
 input { int registration_id }
 stack {
 function.run summer_bridge_fixture_guard { input = {} } as $guard
 db.query session_registrations {
 where = $db.session_registrations.id == $input.registration_id && $db.session_registrations.parent_user_id == $auth.id && $db.session_registrations.registration_order_id > 0 && $db.session_registrations.status == "Active"
 return = {type:"single"}
 } as $registration
 precondition ($registration != null) { error_type = "notfound"
 error = "Registration resources are unavailable." }
 db.query student_files {
 where = $db.student_files.program_id == $registration.program_id || $db.student_files.workshop_id == $registration.workshop_id || $db.student_files.session_id == $registration.session_id || $db.student_files.student_id == $registration.student_id
 return = {type:"list"}
 } as $files
 api.lambda { code = """
const r=$var.registration;return $var.files.filter(f=>(!f.user_id||f.user_id===$auth.id)&&(!f.student_id||f.student_id===r.student_id)&&[f.program_id,f.workshop_id,f.session_id,f.student_id].some(Number)&&['program_id','workshop_id','session_id','student_id'].every(k=>!Number(f[k])||Number(f[k])===Number(r[k]))).map(({id,file_name,file_url})=>({id,name:file_name,url:file_url}));
"""
 timeout = 10 } as $result
 }
 response = $result
 guid = "KiotJ42uRblkdWHcM-xX2n6dLsc"
}
