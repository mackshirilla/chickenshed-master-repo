table Sessions {
  auth = false

  schema {
    int id

    // Allow monthly arrangements separately from Pending-student deposits.
    bool Offer_monthly_payments?

    text Name?
    text Slug?
    text Collection_ID?
    text Locale_ID?
    text Item_ID?
    timestamp? Created_On?
    timestamp? Updated_On?
    timestamp? Published_On?
    bool Archived?
    bool Draft?
    text? Weekday?
    text? Time_block?
    timestamp? Start_Date?
    timestamp? End_Date?
    int? Location?=0 {
      table = "Locations"
    }

    int? Parent_workshop?=0 {
      table = "Workshops"
    }

    int? Parent_program?=0 {
      table = "Programs"
    }

    int Tuition_product? {
      table = "Products"
    }

    int Deposit_product? {
      table = "Products"
    }

    int email_to_send? {
      table = "emails_sent"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "gin", field: [{name: "xdo", op: "jsonb_path_op"}]}
  ]
}
