query "checkout/success" verb=POST {
  api_group = "Frontend"

  input {
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $data
  
    conditional {
      if ($data.data.object.customer != null) {
        db.get contacts {
          field_name = "stripe_customer_id"
          field_value = $data.data.object.customer
        } as $get_contact
      }
    
      else {
        db.get contacts {
          field_name = "email"
          field_value = $data.data.object.customer_details.email
        } as $get_contact
      }
    }
  
    function.run stripe_get_checkout_session {
      input = {checkout_session_id: $data.data.object.id}
    } as $checkout_session
  
    function.run stripe_get_line_items {
      input = {session_id: $data.data.object.id}
    } as $get_line_items
  
    db.get subscriptions {
      field_name = "checkout_session_id"
      field_value = $checkout_session.id
      addon = [
        {
          name : "subscription_sessions"
          input: {subscription_id: $output.id}
          as   : "sessions"
        }
      ]
    } as $get_subscription
  
    db.get ticket_orders {
      field_name = "checkout_session_id"
      field_value = $checkout_session.id
      addon = [
        {
          name : "ticket_records_by_order"
          input: {ticket_order_id: $output.id}
          as   : "ticket_records"
        }
        {
          name  : "Production"
          output: ["id", "Name"]
          input : {Productions_id: $output.production_id}
          as    : "production_details"
        }
        {
          name  : "Performance"
          output: ["Main_Image", "Date_Time"]
          input : {Performances_id: $output.performance_id}
          as    : "performance_details"
        }
      ]
    } as $get_ticket_order
  
    db.get donations {
      field_name = "checkout_session_id"
      field_value = $checkout_session.id
    } as $get_donation
  
    db.query session_registrations {
      where = $db.session_registrations.checkout_session_id == $checkout_session.id
      return = {type: "list"}
    } as $get_add_on_registrations
  
    foreach ($get_add_on_registrations) {
      each as $registration {
        db.edit session_registrations {
          field_name = "id"
          field_value = $registration.id
          enforce_hidden_fields = false
          data = {status: "Active", update_status: "Active"}
        } as $activate_registration
      }
    }
  
    conditional {
      if ($get_subscription != null) {
        api.lambda {
          code = """
            // Xano Lambda – Update Subscription Object Based on Checkout Session Payment
            
            // Extract variables from Xano.
            let data = $var.data;
            let subscription = $var.get_subscription;
            
            // Extract the checkout session object and the amount paid.
            let checkoutSession = data.data.object;
            let amountPaid = checkoutSession.amount_total;
            
            // If early registration or pending students are true, the user is paying a deposit.
            if (subscription.early_registration || subscription.pending_students) {
              subscription.status = "Deposit Paid";
              // Convert amount from cents to dollars.
              subscription.deposit_amount = amountPaid / 100;
            } else {
              subscription.status = "Active";
            }
            
            // Optionally update the checkout_session_id (if needed).
            subscription.checkout_session_id = checkoutSession.id;
            
            // **NEW**: capture the Stripe subscription ID (or null if absent)
            subscription.stripe_subscription_id = checkoutSession.subscription ?? null;
            
            // Return the updated subscription object.
            return subscription;
            """
          timeout = 10
        } as $subscription
      
        db.edit subscriptions {
          field_name = "id"
          field_value = $subscription.id
          enforce_hidden_fields = false
          data = {
            status                : $subscription.status
            stripe_subscription_id: $subscription.stripe_subscription_id
            deposit_amount        : $subscription.deposit_amount
          }
        
          addon = [
            {
              name  : "session_registrations_by_subscription"
              output: [
                "id"
                "status"
                "program_name"
                "workshop_name"
                "weekday"
                "time_block"
                "location"
              ]
              input : {subscription_id: $output.id}
              addon : [
                {
                  name  : "Programs"
                  output: ["id", "name", "Main_Image"]
                  input : {Programs_id: $output.program_id}
                  as    : "program_details"
                }
                {
                  name  : "Student_profile"
                  output: ["id", "full_name", "Status"]
                  input : {student_profiles_id: $output.student_id}
                  as    : "student_profile"
                }
              ]
              as    : "registrations"
            }
            {
              name  : "financial_aid_submission"
              output: ["id", "status", "selected_discount"]
              input : {financial_aid_submissions_id: $output.current_finaid_id}
              as    : "financial_aid_submission"
            }
          ]
        } as $update_subscription
      
        conditional {
          if ($subscription.status != "Deposit Paid") {
            db.edit subscriptions {
              field_name = "id"
              field_value = $subscription.id
              enforce_hidden_fields = false
              data = {
                subscription_subtotal       : $checkout_session.amount_subtotal|divide:100
                subscription_total          : $checkout_session.amount_total|divide:100
                subscription_amount_discount: $checkout_session.total_details.amount_discount|divide:100
              }
            
              addon = [
                {
                  name  : "session_registrations_by_subscription"
                  output: [
                    "id"
                    "status"
                    "program_name"
                    "workshop_name"
                    "weekday"
                    "time_block"
                    "location"
                  ]
                  input : {subscription_id: $output.id}
                  addon : [
                    {
                      name  : "Programs"
                      output: ["id", "name", "Main_Image"]
                      input : {Programs_id: $output.program_id}
                      as    : "program_details"
                    }
                    {
                      name  : "Student_profile"
                      output: ["id", "full_name", "Status"]
                      input : {student_profiles_id: $output.student_id}
                      as    : "student_profile"
                    }
                  ]
                  as    : "registrations"
                }
                {
                  name  : "financial_aid_submission"
                  output: ["id", "status", "selected_discount"]
                  input : {financial_aid_submissions_id: $output.current_finaid_id}
                  as    : "financial_aid_submission"
                }
              ]
            } as $update_subscription
          }
        }
      
        db.bulk.update session_registrations {
          items = $get_subscription.sessions
            |set:"status":$subscription.status
            |set:"update_status":$subscription.status
        } as $update_registrations
      
        api.lambda {
          code = """
            // Xano Lambda: build_sendgrid_payload.js
            
            function main() {
              const subscription = $var.update_subscription;
              const contact      = $var.get_contact;
            
              if (!subscription || !contact) {
                return { error: "Missing subscription or contact data." };
              }
            
              // 1) filter out waitlist/cancelled registrations
              const rawRegs = Array.isArray(subscription.registrations)
                ? subscription.registrations
                : [];
              const regs = rawRegs.filter(r => {
                const st = (r.status || "").toUpperCase();
                return st !== "WAITLIST" && st !== "CANCELLED";
              });
            
              // 2) group by program.id
              const groupsMap = {};
              regs.forEach(r => {
                const progId = r.program_details.id;
                if (!groupsMap[progId]) {
                  groupsMap[progId] = {
                    programName:  r.program_name,
                    programImage: r.program_details.Main_Image,
                    registrations: []
                  };
                }
                groupsMap[progId].registrations.push({
                  workshopName: r.workshop_name || "",
                  weekday:      r.weekday,
                  timeBlock:    r.time_block,
                  location:     r.location || "",
                  studentName:  r.student_profile.full_name
                });
              });
              const groups = Object.values(groupsMap);
            
              // currency‐formatter
              function fmtAmt(val) {
                const n = Number(val) || 0;
                return n === 0 ? "" : `$${n.toFixed(2)}`;
              }
            
              // format a date in NY time (e.g. "9/1/2025")
              function fmtDate(ts) {
                if (!ts) return "";
                return new Date(ts).toLocaleDateString("en-US", {
                  timeZone: "America/New_York"
                });
              }
            
              // 3) deposit & sale
              const depositAmount = fmtAmt(subscription.deposit_amount);
              const saleDetails   = subscription.sale_id
                ? { id: subscription.sale_id }
                : null;
            
              // 4) financial aid
              const fa = subscription.financial_aid_submission;
              const hasFinaid = fa && Number(fa.selected_discount) > 0;
              const financialAid       = hasFinaid;
              const financialAidAmount = hasFinaid
                ? `${fa.selected_discount}%`
                : "";
            
              // 5) contact snippet
              const contactInfo = {
                fullName: contact.full_name,
                email:    contact.email,
                phone:    contact.phone
              };
            
              // 6) subtotal/discount/total
              const subscriptionSubtotal        = fmtAmt(subscription.subscription_subtotal);
              const subscriptionAmountDiscount  = fmtAmt(subscription.subscription_amount_discount);
              const subscriptionTotal           = fmtAmt(subscription.subscription_total);
            
              // 6a) due upon approval (only when status is Deposit Paid)
              const dueUponApproval = subscription.status === "Deposit Paid"
                ? fmtAmt(subscription.subscription_total - subscription.deposit_amount)
                : "";
            
              // 7) assemble everything
              return {
                dynamic_template_data: {
                  subscriptionName:      subscription.subscription_name,
                  status:                subscription.status,
                  subscriptionType:      subscription.subscription_type.charAt(0).toUpperCase()
                                         + subscription.subscription_type.slice(1).toLowerCase(),
            
                  // capitalized string flags
                  pendingStudents:       subscription.pending_students   ? "True" : "",
                  earlyRegistration:     subscription.early_registration ? "True" : "",
            
                  freeTrialEnd:          fmtDate(subscription.free_trial_end),
                  depositAmount,
                  sale:                  saleDetails,
            
                  // financial aid as True/"" and percent string
                  financialAid:          financialAid ? "True" : "",
                  financialAidAmount,
            
                  subscriptionSubtotal,
                  subscriptionAmountDiscount,
                  subscriptionTotal,
                  dueUponApproval,      // ← new field
            
                  contact:               contactInfo,
                  groups
                }
              };
            }
            
            return main();
            """
          timeout = 10
        } as $dynamic_fields
      
        function.run sendgrid_dynamic_send {
          input = {
            to_email   : $get_contact.email
            template_id: "d-f35c44f2578149e2bdff7cf1cd6af960"
            data       : $dynamic_fields.dynamic_template_data
            from_email : ""
          }
        } as $send_confirmation_email
      }
    }
  
    conditional {
      if ($get_ticket_order != null) {
        db.edit ticket_orders {
          field_name = "id"
          field_value = $get_ticket_order.id
          enforce_hidden_fields = false
          data = {
            name  : $get_contact.full_name|concat:($get_ticket_order.performance_details.Date_Time|format_timestamp:"n/j/Y g:i A\n":"America/New_York"):" - "
            status: "sold"
          }
        } as $edit_ticket_order
      
        foreach ($get_ticket_order.ticket_records) {
          each as $ticket {
            db.edit ticket_records {
              field_name = "id"
              field_value = $ticket.id
              enforce_hidden_fields = false
              data = {status: "sold"}
            } as $ticket_records1
          }
        }
      
        db.query tickets_available {
          where = $db.tickets_available.Parent_Performance == $get_ticket_order.performance_id
          return = {type: "list"}
        } as $get_tickets_available
      
        api.lambda {
          code = """
            // Inputs
            const ticketOrder = $var.get_ticket_order || {};
            const availability = Array.isArray($var.get_tickets_available) ? $var.get_tickets_available : [];
            
            // Step 1: Tally up sold ticket counts by ticket_tier_id
            const soldCountByTier = {};
            (ticketOrder.ticket_records || []).forEach(record => {
              const tierId = record.ticket_tier_id;
              soldCountByTier[tierId] = (soldCountByTier[tierId] || 0) + 1;
            });
            
            // Step 2: Update availability array
            const updatedAvailability = availability.map(record => {
              const soldForThisTier = soldCountByTier[record.Ticket_Tier] || 0;
              return {
                ...record,
                Reserved_Quantity: Math.max(0, record.Reserved_Quantity - soldForThisTier),
                Sold_Quantity: record.Sold_Quantity + soldForThisTier,
              };
            });
            
            // Output
            return updatedAvailability;
            """
          timeout = 10
        } as $tickets_available
      
        db.bulk.update tickets_available {
          items = $tickets_available
        } as $update_tickets_available
      
        api.lambda {
          code = """
            // Xano Lambda: build_sendgrid_ticket_order_simple_payload.js
            
            function main() {
              const order   = $var.get_ticket_order;
              const contact = $var.get_contact;
            
              if (!order || !contact) {
                return { error: "Missing ticket order or contact data." };
              }
            
              // count tickets
              const rawRecs      = Array.isArray(order.ticket_records) ? order.ticket_records : [];
              const ticketQuantity = rawRecs.length;
            
              // format NY date+time
              function fmtDateTimeNY(ts) {
                if (!ts) return "";
                return new Date(ts).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  month:   "numeric",
                  day:     "numeric",
                  year:    "numeric",
                  hour:    "numeric",
                  minute:  "2-digit",
                  hour12:  true
                });
              }
            
              return {
                dynamic_template_data: {
                  contact: {
                    fullName: contact.full_name,
                    email:    contact.email,
                    phone:    contact.phone
                  },
            
                  productionName:      order.production_details?.Name || "",
                  performanceDateTime: fmtDateTimeNY(order.performance_date_time),
                  ticketQuantity:      ticketQuantity,
                  orderUuid:           order.order_uuid,
                  performanceImage:    order.performance_details?.Main_Image || ""
                }
              };
            }
            
            return main();
            """
          timeout = 10
        } as $dynamic_fields
      
        function.run sendgrid_dynamic_send {
          input = {
            to_email   : $get_contact.email
            template_id: "d-1778496852a147bd9269f579945220ab"
            data       : $dynamic_fields.dynamic_template_data
            from_email : ""
          }
        } as $send_confirmation_email
      }
    }
  
    conditional {
      if ($get_donation != null) {
        db.edit donations {
          field_name = "id"
          field_value = $get_donation.id
          enforce_hidden_fields = false
          data = {
            status: "completed"
            amount: $checkout_session.amount_total|divide:100
          }
        } as $update_donation
      
        conditional {
          if ($checkout_session.subscription != null) {
            db.add donation_subscriptions {
              enforce_hidden_fields = false
              data = {
                created_at            : "now"
                status                : "Active"
                name                  : $get_contact.full_name|concat:"$":" - "|concat:$update_donation.amount:""|concat:$checkout_session.metadata.donation_type:" "
                contact_id            : $get_contact.id
                user_id               : $var.get_contact.user_id ? $var.get_contact.user_id : null
                amount                : $update_donation.amount
                subscription_type     : $checkout_session.metadata.donation_type
                stripe_subscription_id: $checkout_session.subscription
              }
            } as $add_donation_subscription
          
            db.edit donations {
              field_name = "id"
              field_value = $update_donation.id
              enforce_hidden_fields = false
              data = {donation_subscription_id: $add_donation_subscription.id}
            } as $update_donation
          }
        }
      
        api.lambda {
          code = """
            // Xano Lambda - format dynamic donation confirmation payload
            
            function main() {
              const donation = $var.update_donation ?? {};
              const subscription = $var.add_donation_subscription ?? {};
              const contact = $var.get_contact ?? {};
            
              // Defensive checks
              const subscriptionType = (subscription.subscription_type || "").toLowerCase();
              const donationType = subscriptionType === "month"
                ? "monthly"
                : subscriptionType === "year"
                  ? "annual"
                  : "one-time";
            
              const formattedDate = donation.created_at
                ? new Date(donation.created_at).toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  })
                : "";
            
              return {
                dynamic_template_data: {
                  donorName: contact.first_name ?? "",
                  donorFullName: contact.full_name ?? "",
                  email: contact.email ?? "",
                  amount: donation.amount ?? 0,
                  donationType,
                  donationDate: formattedDate,
                  donationUuid: donation.uuid ?? "",
                  campaignName: donation.campaign_name ?? "",
                  inNameOf: donation.in_name_of ?? "",
                  keepAnonymous: donation.keep_anonymous ?? false,
                  profileImage: contact.profile_pic?.url ?? null
                }
              };
            }
            
            return main();
            """
          timeout = 10
        } as $dynamic_fields
      
        function.run sendgrid_dynamic_send {
          input = {
            to_email   : $get_contact.email
            template_id: "d-ec0ec883453e4aafb02d3674db7bfd46"
            data       : $dynamic_fields.dynamic_template_data
            from_email : ""
          }
        } as $send_confirmation_email
      }
    }
  
    db.add sales_checkout {
      enforce_hidden_fields = false
      data = {
        created_at         : "now"
        checkout_session_id: $checkout_session.id
        amount_subtotal    : $checkout_session.amount_subtotal|divide:100
        amount_discount    : $checkout_session.total_details.amount_discount|divide:100
        payment_intent_id  : $checkout_session.payment_intent
        subscription_id    : $var.get_subscription.id ? $var.get_subscription.id : null
        ticket_order_id    : $var.get_ticket_order.id ? $var.get_ticket_order.id : null
        donation_id        : $var.get_donation.id ? $var.get_donation.id : null
      }
    } as $add_checkout_record
  
    conditional {
      if ($data.data.object|has:"payment_intent") {
        db.query sales_line_items {
          where = $db.sales_line_items.payment_intent_id == $checkout_session.payment_intent
          return = {type: "list"}
        } as $line_items_found
      
        conditional {
          if (($line_items_found|count) == 0) {
            api.lambda {
              code = """
                function main() {
                  const session = $var.checkout_session;
                  const lineItems = $var.get_line_items;
                  const checkout = $var.add_checkout_record;
                
                  if (!Array.isArray(lineItems) || !session || !checkout) {
                    return { error: "Missing required input data." };
                  }
                
                  const paymentIntentId = session.payment_intent || null;
                  const saleId = checkout.sales_id || 0;
                
                  const formatted = lineItems.map(item => {
                    const subtotal = (item.amount_subtotal || 0) / 100;
                    const total = (item.amount_total || 0) / 100;
                    const discount = (item.amount_discount || 0) / 100;
                    const priceId = item.price?.id || null;
                
                    return {
                      sale_id: saleId,
                      product_name: item.description || "Unknown Item",
                      quantity: item.quantity || 1,
                      item_amount_subtotal: subtotal,
                      item_amount_total: total,
                      item_amount_discount: discount,
                      payment_intent_id: paymentIntentId,
                      stripe_price_id: priceId,
                      source: "checkout"
                    };
                  });
                
                  return {
                    line_items: formatted
                  };
                }
                
                return main();
                """
              timeout = 10
            } as $format_line_items
          
            db.bulk.add sales_line_items {
              allow_id_field = false
              items = $format_line_items.line_items
            } as $add_line_items
          }
        }
      }
    }
  }

  response = $add_checkout_record
  history = 1000
}