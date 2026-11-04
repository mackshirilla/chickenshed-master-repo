query "registration/start_registration" verb=POST {
  api_group = "Frontend"
  auth = "users"

  input {
  }

  stack {
    db.query subscriptions {
      where = $db.subscriptions.user_id == $auth.id && ($db.subscriptions.status == "Active" || $db.subscriptions.status == "Deposit Paid" || $db.subscriptions.status == "Trial" || $db.subscriptions.status == "Paused")
      return = {type: "list"}
    } as $get_current_subscriptions
  
    db.query Sessions {
      where = $db.Sessions.Draft != true && $db.Sessions.Archived != true && $db.Sessions.Tuition_product != 0
      return = {type: "list"}
      output = [
        "id"
        "Name"
        "Archived"
        "Draft"
        "Weekday"
        "Time_block"
        "Start_Date"
        "End_Date"
        "Location"
        "Tuition_product"
        "Deposit_product"
      ]
    
      addon = [
        {
          name  : "Programs"
          output: ["id", "name", "Add_On_Program", "1st_Semester_Start_Date"]
          input : {Programs_id: $output.Parent_program}
          as    : "program"
        }
        {
          name  : "Workshops"
          output: ["id", "Name"]
          input : {Workshops_id: $output.Parent_workshop}
          as    : "workshop"
        }
        {
          name  : "Tuition_Products"
          output: [
            "id"
            "Product_name"
            "Annual_price_id"
            "Monthly_price_id"
            "Semester_price_id"
            "Single_sale_price_id"
            "Displayed_annual_price"
            "Displayed_monthly_price"
            "Displayed_semester_price"
            "Displayed_single_sale_price"
            "Annual_price_amount"
            "Monthly_price_amount"
            "Semester_price_amount"
            "Single_sale_price_amount"
          ]
          input : {Products_id: $output.Tuition_product}
          as    : "tuition_product"
        }
        {
          name  : "Deposit_product"
          output: [
            "id"
            "Product_name"
            "Annual_price_id"
            "Monthly_price_id"
            "Semester_price_id"
            "Single_sale_price_id"
            "Displayed_annual_price"
            "Displayed_monthly_price"
            "Displayed_semester_price"
            "Displayed_single_sale_price"
            "Annual_price_amount"
            "Monthly_price_amount"
            "Semester_price_amount"
            "Single_sale_price_amount"
          ]
          input : {Products_id: $output.Deposit_product}
          as    : "deposit_product"
        }
      ]
    } as $get_all_sessions
  
    db.query student_profiles {
      where = $db.student_profiles.parent_user_id == $auth.id && $db.student_profiles.Status != "Archived"
      return = {type: "list"}
    } as $get_student_profiles
  
    var $data {
      value = {}
        |set:"student_profiles":$get_student_profiles
        |set:"sessions":$get_all_sessions
        |set:"has_active_subscription":($var.get_current_subscriptions.0 ? true : false)
    }
  }

  response = $data
}