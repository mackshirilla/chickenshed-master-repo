// Production candidate, not deployed. Guard defaults closed.
function summer_live_context_v1 {
 input {
  int actor_id
 }
 stack {
function.run summer_live_guard_v1 { input = {} } as $live_guard
db.get users {
 field_name = "id"
 field_value = $input.actor_id
 output = ["id", "email"]
} as $actor
precondition ($actor != null) {
 error_type = "accessdenied"
 error = "Please sign in." }
db.query contacts {
 where = $db.contacts.user_id == $input.actor_id
 return = {type: "single"}
} as $contact
db.query student_profiles {
 where = $db.student_profiles.parent_user_id == $input.actor_id && $db.student_profiles.Status != "Archived"
 return = {type: "list"}
} as $students
db.query Sessions {
 where = $db.Sessions.Parent_program == 13 && $db.Sessions.Draft != true && $db.Sessions.Archived != true
 return = {type: "list"}
} as $sessions
db.query Products {
 where = $db.Products.id >= 73 && $db.Products.id <= 76
 return = {type: "list"}
} as $products
api.lambda {
 code = """
  const a=$var.actor,c=$var.contact;return {ok:true,actor:{id:a.id,email:a.email,stripe_customer_id:c?.stripe_customer_id||null},students:$var.students,sessions:$var.sessions,products:$var.products};
  """
 timeout = 30
} as $context
 }
 response = $context
}
