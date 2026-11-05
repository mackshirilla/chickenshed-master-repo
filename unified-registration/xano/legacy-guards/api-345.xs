query "registration/checkout_labs" verb=POST {
  api_group = "Frontend"
  auth = "users"

  input {
  }

  stack {
    // Close old creation only when the coordinated unified release is enabled.
    precondition ($env.unified_registration_enabled != "true" && $env.unified_registration_enabled != true) {
      error = "Please use the current Program Registration page to begin checkout."
    }
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $data
  
    db.get contacts {
      field_name = "user_id"
      field_value = $auth.id
    } as $get_contact
  
    api.lambda {
      code = """
        // Xano Lambda – Build Stripe Checkout Payload for LABS (single-sale, no fin-aid, no deposits, no early-reg)
        
        // Inputs from Xano:
        let data = $var.data;           // payload sent from your frontend
        let contact = $var.get_contact; // contact record (may include stripe_customer_id)
        
        // Build payload
        let stripePayload: any = {};
        
        // 1) Always single-sale payment mode. Use subscription_line_items (which hold Single_sale_price_id)
        stripePayload.mode = "payment";
        
        // Safety: ensure we have line_items
        const lineItemsArray = Array.isArray(data.subscription_line_items) ? data.subscription_line_items : [];
        if (lineItemsArray.length === 0) {
          throw new Error("No line items provided for Labs checkout.");
        }
        
        stripePayload.line_items = lineItemsArray.map(item => ({
          price: item.price,
          quantity: item.quantity,
        }));
        
        // 2) Payment Intent prefs
        stripePayload.payment_intent_data = { setup_future_usage: "off_session" };
        
        // 3) Only cards
        stripePayload.payment_method_types = ["card"];
        
        // 4) Success / cancel URLs with embedded {CHECKOUT_SESSION_ID}
        stripePayload.success_url = `${data.base_url}/checkout-success/lab-registration?session_id={CHECKOUT_SESSION_ID}`;
        stripePayload.cancel_url  = `${data.base_url}/lab-registration?session_id={CHECKOUT_SESSION_ID}`;
        
        // 5) Attach existing customer if we have one
        if (contact?.stripe_customer_id) {
          stripePayload.customer = contact.stripe_customer_id;
        }
        
        // 6) Promotions / discounts
        stripePayload.allow_promotion_codes = "true";
        
        // 7) Optional: session expiry (30 minutes)
        stripePayload.expires_at = Math.floor(Date.now() / 1000) + (30 * 60);
        
        // Return to Xano
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
        // Xano Lambda – Build Array of Registration Items (Labs / single-sale)
        
        // Extract variables from Xano.
        let data                = $var.data;                 // Contains: registration_items, etc.
        let selectedSessions    = $var.selected_sessions;    // Array of session objects.
        let contact             = $var.get_contact;          // Contact info.
        // Include the full checkout_session object as provided
        let checkout_session    = $var.checkout_session;     // Contains request/response from Stripe Checkout creation
        
        // Safely extract the Stripe Checkout Session ID
        let checkout_session_id =
          (checkout_session &&
           checkout_session.response &&
           checkout_session.response.result &&
           checkout_session.response.result.id) || null;
        
        // Initialize an empty array for registration items.
        let registrationItemsOutput = [];
        
        // Ensure registration_items and selectedSessions exist.
        if (
          data.registration_items &&
          Array.isArray(data.registration_items) &&
          selectedSessions &&
          Array.isArray(selectedSessions)
        ) {
          // Loop over each registration item.
          data.registration_items.forEach(item => {
            // Find the matching session from selectedSessions by comparing session IDs.
            let session = selectedSessions.find(s => s.id.toString() === item.session_id);
        
            // If no matching session is found, skip this item.
            if (!session) return;
        
            // Build the registration item object according to your schema.
            let regItem = {
              status: "Pending",
              student_id: item.student_id ? parseInt(item.student_id, 10) : null,
        
              program_name:
                (session.program_details && session.program_details.name) ? session.program_details.name : "",
        
              workshop_name:
                (session.workshop_details && session.workshop_details.Name) ? session.workshop_details.Name : "",
        
              weekday: session.Weekday || "",
              time_block: session.Time_block || "",
        
              location:
                (session.location_details && session.location_details.Name)
                  ? session.location_details.Name
                  : (session.Location !== undefined ? session.Location.toString() : ""),
        
              parent_user_id: (contact && contact.user_id) ? parseInt(contact.user_id, 10) : null,
        
              program_id: item.program_id ? parseInt(item.program_id, 10) : null,
        
              workshop_id:
                (session.workshop_details && session.workshop_details.id)
                  ? parseInt(session.workshop_details.id, 10)
                  : null,
        
              session_id: item.session_id ? parseInt(item.session_id, 10) : null,
        
              location_id:
                (session.location_details && session.location_details.id)
                  ? parseInt(session.location_details.id, 10)
                  : (session.Location !== undefined ? parseInt(session.Location, 10) : null),
        
              // From Tuition_product (single-sale still references Tuition_product id)
              product_id: session.Tuition_product ? parseInt(session.Tuition_product, 10) : null,
              update_product_id: session.Tuition_product ? parseInt(session.Tuition_product, 10) : null,
        
              // Attach the Stripe Checkout Session ID from the separate variable
              checkout_session_id: checkout_session_id,
        
              created_at: new Date().toISOString(),
              move_to: 0,
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
  }

  response = {url: $checkout_session.response.result.url}
}