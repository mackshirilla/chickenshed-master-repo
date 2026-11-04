// Query all session_registrations records
query session_registrations verb=GET {
  api_group = "Frontend"
  auth = "users"

  input {
  }

  stack {
    db.query session_registrations {
      where = $db.session_registrations.program_id != 13 && $db.session_registrations.parent_user_id == $auth.id && $db.session_registrations.subscription_id == 0 && $db.session_registrations.status == "Active"
      return = {type: "list"}
      addon = [
        {
          name  : "Programs"
          output: ["id", "name", "slug", "Main_Image"]
          input : {Programs_id: $output.program_id}
          as    : "program_details"
        }
      ]
    } as $session_registrations
  }

  response = $session_registrations
}