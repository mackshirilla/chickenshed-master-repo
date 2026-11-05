query "dashboard/profiles/student/{student_id}/registrations" verb=GET {
  api_group = "Frontend"
  auth = "users"

  input {
    int student_id?
  }

  stack {
    db.query session_registrations {
      where = $db.session_registrations.parent_user_id == $auth.id && ($db.session_registrations.registration_order_id == null || $db.session_registrations.registration_order_id == 0) && $db.session_registrations.program_id != 13 && $db.session_registrations.student_id == $input.student_id && ($db.session_registrations.status == "Active" || $db.session_registrations.status == "Paused")
      return = {type: "list"}
      addon = [
        {
          name : "Session"
          input: {Sessions_id: $output.session_id}
          addon: [
            {
              name  : "Locations"
              output: ["id", "Name"]
              input : {Locations_id: $output.Location}
              as    : "location_details"
            }
            {
              name : "Programs"
              input: {Programs_id: $output.Parent_program}
              as   : "program_details"
            }
            {
              name : "Workshops"
              input: {Workshops_id: $output.Parent_workshop}
              as   : "workshop_details"
            }
          ]
          as   : "session_details"
        }
      ]
    } as $get_registrations
  }

  response = $get_registrations
}