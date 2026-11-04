query "registration/checkout" verb=POST {
  api_group = "Frontend"
  auth = "users"

  input {
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $data
  
    // Summer isolation: resolve canonical Sessions before any Checkout or order writes.
    api.lambda {
      code = """
        const items = $var.data?.registration_items;
        return Array.isArray(items) && items.length > 0 && items.every(item =>
          item && Number.isSafeInteger(Number(item.session_id)) && Number(item.session_id) > 0);
        """
      timeout = 5
    } as $regular_session_ids_valid

    precondition ($regular_session_ids_valid == true) {
      error = "Please choose a valid registration session and try again."
    }

    foreach ($data.registration_items) {
      each as $summer_check_item {
        db.get Sessions {
          field_name = "id"
          field_value = $summer_check_item.session_id
        } as $summer_check_session

        precondition ($summer_check_session != null) {
          error = "Please choose a valid registration session and try again."
        }

        precondition ($summer_check_session.Parent_program != 13) {
          error = "Please use Summer Camp registration at /summer-camp-registration."
        }
      }
    }

    db.get contacts {
      field_name = "user_id"
      field_value = $auth.id
    } as $get_contact
  
    api.lambda {
      code = """
        // Xano Lambda – Build Stripe Checkout Payload using $var.data and $var.get_contact
        
        // Extract variables from Xano.
        let data = $var.data;
        let contact = $var.get_contact;
        
        // Tell TS this will be a free‐form object:
        let stripePayload: any = {};        // ← change here
        
        // Helper: do we really have a deposit to pay?
        const hasDeposit =
          Array.isArray(data.deposit_line_items) &&
          data.deposit_line_items.length > 0;
        
        // 1) Choose mode and line_items
        if (hasDeposit) {
          stripePayload.mode = "payment";
          stripePayload.line_items = data.deposit_line_items.map(item => ({
            price: item.price,
            quantity: item.quantity,
          }));
        } else {
          const subType = (data.subscription_type || "").toString().toLowerCase();
          if (subType === "year" || subType === "annual" || subType === "month" || subType === "monthly") {
            stripePayload.mode = "subscription";
          } else {
            stripePayload.mode = "payment";
          }
          stripePayload.line_items = data.subscription_line_items.map(item => ({
            price: item.price,
            quantity: item.quantity,
          }));
        }
        
        // 2) Payment-method settings
        if (stripePayload.mode === "subscription") {
          stripePayload.payment_method_collection = "if_required";
        } else {
          stripePayload.payment_intent_data = { setup_future_usage: "off_session" };
        }
        
        // 3) Always card
        stripePayload.payment_method_types = ["card"];
        
        // 4) Success / cancel URLs
        stripePayload.success_url = `${data.base_url}/checkout-success/registration`;
        stripePayload.cancel_url  = `${data.base_url}/program-registration`;
        
        // 5) Customer (if present)
        if (contact?.stripe_customer_id) {
          stripePayload.customer = contact.stripe_customer_id;
        }
        
        // 6) Discounts
        if (!hasDeposit && data.financial_aid?.selected_discount) {
          let couponCode = "FINAID" + data.financial_aid.selected_discount;
          if (stripePayload.mode !== "subscription") couponCode += "INVOICE";
          stripePayload.discounts = [{ coupon: couponCode }];
        } else {
          stripePayload.allow_promotion_codes = "true";
        }
        
        // 7) Expire in 30 min
        stripePayload.expires_at = Math.floor(Date.now() / 1000) + 30 * 60;
        
        // Return the built payload.
        return stripePayload;
        """
      timeout = 10
    } as $stripe_payload
  
    api.request {
      url = "https://api.stripe.com/v1/checkout/sessions"
      method = "POST"
      params = $stripe_payload
      headers = []
        |push:("Authorization: Basic %s"
          |sprintf:($env.stripe_api_secret|base64_encode)
        )
    } as $checkout_session
  
    precondition ($checkout_session.response.status == 200) {
      error = "Checkout Session Failed"
    }
  
    api.lambda {
      code = """
        // Xano Lambda – Build Subscription Object from Registration Data
        
        // Extract variables from Xano.
        let data = $var.data;
        let contact = $var.get_contact;
        
        // Initialize subscription object.
        let subscription = {};
        
        // 1. Set subscription_type and status.
        subscription.subscription_type = data.subscription_type; // "year", "month", or "semester"
        subscription.status = "Pending";
        
        // 2. (Program and workshop fields have been removed)
        
        // 3. Set pending_students.
        subscription.pending_students = data.students_pending;
        
        // 4. Set deposit_amount.
        // If deposit_line_items exist, use data.total_due as the deposit_amount; otherwise, 0.
        if (data.deposit_line_items !== null) {
          subscription.deposit_amount = data.total_due;
        } else {
          subscription.deposit_amount = 0;
        }
        
        // 5. Set coupon.
        // Always apply the financial aid discount if provided.
        if (data.financial_aid && data.financial_aid.selected_discount) {
          subscription.coupon = "FINAID" + data.financial_aid.selected_discount;
        } else {
          subscription.coupon = null;
        }
        
        // 5.1 Set early_registration boolean flag.
        subscription.early_registration = !!data.early_registration;
        
        // 6. Set start_date.
        // For monthly subscriptions that are early, use the provided earliest_start_date; otherwise, leave blank.
        if (data.subscription_type === "month" && data.early_registration && data.earliest_start_date) {
          subscription.start_date = new Date(data.earliest_start_date).toISOString();
        } else {
          subscription.start_date = null;
        }
        
        // 7. Set next_charge_date and next_charge_amount for recurring subscriptions.
        if (data.subscription_type === "year") {
          let now = new Date();
          let nextCharge = new Date(now);
          nextCharge.setDate(nextCharge.getDate() + 365);
          subscription.next_charge_date = nextCharge.toISOString();
          // Use subscription_total (after discount) as the next charge amount.
          subscription.next_charge_amount = data.subscription_total;
        } else if (data.subscription_type === "month") {
          let now = new Date();
          let nextCharge = new Date(now);
          nextCharge.setDate(nextCharge.getDate() + 30);
          subscription.next_charge_date = nextCharge.toISOString();
          subscription.next_charge_amount = data.subscription_total;
        } else {
          // For semester or one-off payments, set these to null/0.
          subscription.next_charge_date = null;
          subscription.next_charge_amount = 0;
        }
        
        // 8. Set next_invoice_id and stripe_subscription_id.
        subscription.next_invoice_id = null;
        subscription.stripe_subscription_id = null;
        
        // 9. Set subscription pricing details.
        // These values are taken from your payload and pertain solely to the subscription pricing.
        subscription.subscription_subtotal = data.subscription_subtotal;
        subscription.subscription_amount_discount = data.subscription_amount_discount;
        subscription.subscription_total = data.subscription_total;
        
        // 10. Set user_id and contact_id from the contact variable.
        subscription.user_id = contact && contact.user_id ? parseInt(contact.user_id, 10) : null;
        subscription.contact_id = contact && contact.id ? parseInt(contact.id, 10) : null;
        
        // 11. Set sale_id and cancellation_reason.
        subscription.sale_id = null;
        subscription.cancellation_reason = "";
        
        // 12. Set created_at.
        subscription.created_at = new Date().toISOString();
        
        // Return the subscription object.
        return subscription;
        """
      timeout = 10
    } as $subscription
  
    db.add subscriptions {
      enforce_hidden_fields = false
      data = {
        subscription_name           : $get_contact.full_name
        status                      : "Pending"
        subscription_type           : $subscription.subscription_type
        update_subscription_type    : ""
        user_id                     : $subscription.user_id
        contact_id                  : $subscription.contact_id
        current_finaid_id           : "0"
        pending_students            : $subscription.pending_students
        early_registration          : $subscription.early_registration
        checkout_session_id         : $checkout_session.response.result.id
        last_invoice_id             : null
        last_invoice_is_draft       : ""
        coupon                      : $subscription.coupon
        subscription_subtotal       : $subscription.subscription_subtotal|round:2
        subscription_total          : $subscription.subscription_total|round:2
        subscription_amount_discount: $subscription.subscription_amount_discount|round:2
        created_at                  : "now"
        invoice_history             : []
        prorate_changes             : ""
        charge_proration            : ""
        free_trial_end              : `var.get_subscription.early_registration == true ? $var.data.earliest_start_date : null`
      }
    } as $add_subscription
  
    var $selected_sessions {
      value = []
    }
  
    foreach ($data.registration_items) {
      each as $item {
        db.get Sessions {
          field_name = "id"
          field_value = $item.session_id
          addon = [
            {
              name  : "Programs"
              output: ["id", "name"]
              input : {Programs_id: $output.Parent_program}
              as    : "program_details"
            }
            {
              name  : "Workshops"
              output: ["id", "Name"]
              input : {Workshops_id: $output.Parent_workshop}
              as    : "workshop_details"
            }
            {
              name  : "Locations"
              output: ["id", "Name"]
              input : {Locations_id: $output.Location}
              as    : "location_details"
            }
          ]
        } as $get_session
      
        var.update $selected_sessions {
          value = $selected_sessions|push:$get_session
        }
      }
    }
  
    api.lambda {
      code = """
        // Xano Lambda – Build Array of Registration Items
        
        // Extract variables from Xano.
        let data = $var.data;                  // Contains: registration_items, etc.
        let selectedSessions = $var.selected_sessions; // Array of session objects.
        let contact = $var.get_contact;        // Contact info.
        let add_subscription = $var.add_subscription;  // Subscription object (with id), if available.
        
        // Initialize an empty array for registration items.
        let registrationItemsOutput = [];
        
        // Ensure registration_items and selectedSessions exist.
        if (data.registration_items && Array.isArray(data.registration_items) &&
            selectedSessions && Array.isArray(selectedSessions)) {
          
          // Loop over each registration item.
          data.registration_items.forEach(item => {
            // Find the matching session from selectedSessions by comparing session IDs.
            let session = selectedSessions.find(s => s.id.toString() === item.session_id);
            
            // If no matching session is found, skip this item.
            if (!session) return;
            
            // Build the registration item object according to your schema.
            let regItem = {
              // id is auto-generated.
              status: "Pending",
              student_id: item.student_id ? parseInt(item.student_id, 10) : null,
              // Use session details for display text.
              program_name: (session.program_details && session.program_details.name) ? session.program_details.name : "",
              workshop_name: (session.workshop_details && session.workshop_details.Name) ? session.workshop_details.Name : "",
              weekday: session.Weekday || "",
              time_block: session.Time_block || "",
              // Use the location details if available; otherwise, fallback to the raw Location value.
              location: (session.location_details && session.location_details.Name) ? session.location_details.Name : (session.Location !== undefined ? session.Location.toString() : ""),
              parent_user_id: contact && contact.user_id ? parseInt(contact.user_id, 10) : null,
              // Set subscription_id from add_subscription if available.
              subscription_id: (add_subscription && add_subscription.id) ? parseInt(add_subscription.id, 10) : null,
              subscription_item_id: null,
              program_id: item.program_id ? parseInt(item.program_id, 10) : null,
              // For workshop_id, use workshop_details if available.
              workshop_id: (session.workshop_details && session.workshop_details.id) ? parseInt(session.workshop_details.id, 10) : null,
              session_id: item.session_id ? parseInt(item.session_id, 10) : null,
              // Use location_details.id if available; otherwise, fallback to session.Location.
              location_id: (session.location_details && session.location_details.id) ? parseInt(session.location_details.id, 10) : (session.Location !== undefined ? parseInt(session.Location, 10) : null),
              // New fields: product_id and update_product_id from Tuition_product.
              product_id: session.Tuition_product ? parseInt(session.Tuition_product, 10) : null,
              update_product_id: session.Tuition_product ? parseInt(session.Tuition_product, 10) : null,
              created_at: new Date().toISOString(),
              move_to: 0
            };
            
            registrationItemsOutput.push(regItem);
          });
        }
        
        return registrationItemsOutput;
        """
      timeout = 10
    } as $registrations
  
    db.bulk.add session_registrations {
      allow_id_field = false
      items = $registrations
    } as $add_registrations
  
    conditional {
      if ($data.financial_aid.requested) {
        db.add financial_aid_submissions {
          enforce_hidden_fields = false
          data = {
            status              : "Pending"
            annual_income       : $data.financial_aid.data.annualIncome|to_decimal
            monthly_expenses    : $data.financial_aid.data.monthlyExpense|to_decimal
            relationship        : $data.financial_aid.data.relationship
            previous_participant: $data.financial_aid.data.previousParticipant
            subscription_id     : $add_subscription.id
            user_id             : $auth.id
            selected_discount   : $data.financial_aid.selected_discount
            ends_on             : null
            created_at          : "now"
          }
        } as $add_fin_aid
      
        db.edit subscriptions {
          field_name = "id"
          field_value = $add_subscription.id
          enforce_hidden_fields = false
          data = {current_finaid_id: $add_fin_aid.id}
        } as $update_subscription
      }
    }
  }

  response = {url: $checkout_session.response.result.url}
}