// Unpublished production candidate. Runtime gate defaults closed.
function registration_live_context_v1 {
 input {
  int actor_id
 }
 stack {
function.run registration_orders_live_guard_v1 { input = {} } as $sandbox_guard
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
 where = ($db.Sessions.Parent_program == 1 || $db.Sessions.Parent_program == 3 || $db.Sessions.Parent_program == 10 || $db.Sessions.Parent_program == 13) && $db.Sessions.Draft != true && $db.Sessions.Archived != true
 return = {type: "list"}
} as $sessions
db.query Products {
 where = $db.Products.category == "Registration"
 return = {type: "list"}
} as $products
db.query Programs { return = {type:"list"} } as $programs
db.query Workshops { return = {type:"list"} } as $workshops
db.query session_registrations {
 where = $db.session_registrations.parent_user_id == $input.actor_id
 return = {type:"list"}
} as $enrollments
db.query Sessions { return = {type:"list"} } as $coverage_sessions
db.query registration_orders {
 where = $db.registration_orders.owner_user_id == $input.actor_id
 return = {type:"list"}
} as $orders
db.query subscriptions {
 where = $db.subscriptions.user_id == $input.actor_id
 return = {type:"list"}
} as $subscriptions
api.lambda {
 code = """
  const a=$var.actor,c=$var.contact;return {ok:true,actor:{id:a.id,email:a.email,stripe_customer_id:c?.stripe_customer_id||null},students:$var.students,sessions:$var.sessions,products:$var.products,programs:$var.programs,workshops:$var.workshops,enrollments:$var.enrollments,coverage_sessions:$var.coverage_sessions,orders:$var.orders,subscriptions:$var.subscriptions};
  """
 timeout = 30
} as $context
 }
 response = $context
}
