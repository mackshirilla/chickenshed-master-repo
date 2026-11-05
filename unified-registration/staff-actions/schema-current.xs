// Empty order source for the approved Noloco staff view. Checkout deployment is separate.
table registration_orders {
  auth = false

  schema {
    int id
    text? items_display?
    int? manual_parent_id? {
      table = "users"
    }
  
    decimal? manual_total_amount?
    decimal? manual_paid_amount?
    enum? manual_payment_method? {
      values = [
        "Not yet paid"
        "Cash"
        "Check"
        "External Stripe payment"
        "Bank transfer"
        "Other"
        "No payment required"
      ]
    }
  
    text? manual_payment_reference?
    text? manual_created_by?
    text? manual_record_state?
    text? staff_validation_error?
    json? staff_activity?
    bool? resend_requested?
    text? resend_requested_by?
    text? resend_status?
    timestamp? last_resend_at?
    text? covered_terms?
    text? payment_preference?
    text? billing_followup?
    int? financial_aid_submission_id? {
      table = "financial_aid_submissions"
    }
  
    timestamp created_at?=now
    text? order_reference? filters=trim
    text? attempt_key? filters=trim
    int owner_user_id
    text? parent_email? filters=trim
    int? balance_after_checkout_cents?
    int quote_version?=1
    text status?=pending filters=trim
    text checkout_policy filters=trim
    text? quote_fingerprint?
    json? quote?
    json? aid_intake?
    text? item_summary?
    text? checkout_session_id? filters=trim
    json? session_snapshot?
    int paid_cents?
    text? payment_intent_id? filters=trim
    timestamp? paid_at?
    json? event_ids?
    json? previous_checkouts?
    bool handled?
    text? staff_notes?
    text? checkout_url?
    text? stripe_customer_id?
    json? reservation_payload?
    text? review_reason?
    int? observed_payment_cents?
    text? observed_payment_intent_id?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "attempt_key", op: "asc"}]
    }
    {
      type : "btree|unique"
      field: [{name: "checkout_session_id", op: "asc"}]
    }
    {
      type : "btree|unique"
      field: [{name: "order_reference", op: "asc"}]
    }
    {
      type : "btree|unique"
      field: [{name: "payment_intent_id", op: "asc"}]
    }
    {type: "btree", field: [{name: "owner_user_id", op: "asc"}]}
  ]
}