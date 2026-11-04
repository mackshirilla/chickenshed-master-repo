table session_registrations {
  auth = false

  schema {
    int id
    enum status? {
      values = [
        "Active"
        "Cancelled"
        "Deposit Paid"
        "Waitlist"
        "Pending"
        "Draft"
        "Paused"
        "Trial"
        "Archived"
      ]
    }
  
    enum update_status? {
      values = [
        "Active"
        "Cancelled"
        "Deposit Paid"
        "Waitlist"
        "Pending"
        "Draft"
        "Paused"
        "Trial"
        "Archived"
      ]
    }
  
    int student_id? {
      table = "student_profiles"
    }
  
    text program_name? filters=trim
    text? workshop_name? filters=trim
    text weekday? filters=trim
    text time_block? filters=trim
    text location? filters=trim
    int parent_user_id? {
      table = "users"
    }
  
    int subscription_id? {
      table = "subscriptions"
    }
  
    int program_id? {
      table = "Programs"
    }
  
    int? workshop_id?=0 {
      table = "Workshops"
    }
  
    int session_id? {
      table = "Sessions"
    }
  
    int location_id? {
      table = "Locations"
    }
  
    timestamp created_at?=now {
      visibility = "private"
    }
  
    int? move_to?=0 {
      table = "Sessions"
    }
  
    int? product_id?=0 {
      table = "Products"
    }
  
    int? update_product_id?=0 {
      table = "Products"
    }
  
    text cancellation_reason? filters=trim
    timestamp? cancelled_at?
    text checkout_session_id? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "gin", field: [{name: "xdo", op: "jsonb_path_op"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}