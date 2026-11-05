query "sales/payment-succeeded" verb=POST {
  api_group = "Noloco"

  input {
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $data
  
    // Only the explicit incoming Summer marker takes the additional canonical lookup path.
    // Every ordinary legacy event preserves its original provider and accounting behavior.
    api.lambda {
      code = "return ['summer_family_v1','registration_order_v2'].includes($var.data?.data?.object?.metadata?.checkout_policy) && /^pi_[A-Za-z0-9]+$/.test($var.data?.data?.object?.id || '');"
      timeout = 5
    } as $summer_pi_candidate
  
    var $summer_pi_ignored {
      value = false
    }
  
    conditional {
      if ($summer_pi_candidate) {
        api.request {
          url = "https://api.stripe.com/v1/payment_intents/%s"|sprintf:$data.data.object.id
          method = "GET"
          headers = []
            |push:("Authorization: Basic %s"
              |sprintf:($env.stripe_api_secret|base64_encode)
            )
            |push:"Stripe-Version: 2025-01-27.acacia"
        } as $summer_pi_lookup
      
        api.lambda {
          code = """
              const r=$var.summer_pi_lookup?.response, p=r?.result;
              if(r?.status!==200 || p?.object!=='payment_intent' || p.id!==$var.data.data.object.id) throw new Error('Canonical Summer payment lookup failed; retry delivery.');
              return p.livemode===true && ['summer_family_v1','registration_order_v2'].includes(p.metadata?.checkout_policy);
            """
          timeout = 5
        } as $summer_pi_canonical
      
        var.update $summer_pi_ignored {
          value = $summer_pi_canonical
        }
      }
    }
  
    conditional {
      if ($summer_pi_ignored) {
        var $summer_pi_result {
          value = {
            ignored: true
            reason : "summer_family_v1 handled by dedicated receiver"
          }
        }
      }
    
      else {
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
              field_value = $data.data.object.receipt_email
            } as $get_contact
          }
        }
      
        db.add sales {
          enforce_hidden_fields = false
          data = {
            created_at       : "now"
            status           : "Succeeded"
            contact_id       : $get_contact.id
            amount_total     : $data.data.object.amount|divide:100
            payment_intent_id: $data.data.object.id
          }
        } as $sales1
      
        api.lambda {
          code = """
            // Xano Lambda: build payload from your “data” variable
            // data = {
            //   id: "evt_…",
            //   data: { object: { …payment_intent fields… } },
            //   type: "payment_intent.succeeded",
            //   …
            // }
            
            const evt = $var.data;              // your raw event var
            const pi  = evt.data.object;        // the PaymentIntent object
            
            const customerId      = pi.customer;
            const paymentMethodId = pi.payment_method;
            
            if (!customerId || !paymentMethodId) {
              throw new Error(
                `Missing customer (${customerId}) or payment method (${paymentMethodId}).`
              );
            }
            
            return {
              invoice_settings: {
                default_payment_method: paymentMethodId
              }
            };
            """
          timeout = 10
        } as $save_default_payment_payload
      
        api.request {
          url = "https://api.stripe.com/v1/customers/{customer_id}"
            |replace:"{customer_id}":$get_contact.stripe_customer_id
          method = "POST"
          params = $save_default_payment_payload
          headers = []
            |push:("Authorization: Basic %s"
              |sprintf:($env.stripe_api_secret|base64_encode)
            )
        } as $save_payment_method
      
        var $summer_pi_result {
          value = {
            response: $save_payment_method.response
            payload : $save_default_payment_payload
          }
        }
      }
    }
  }

  response = $summer_pi_result
  history = "all"
}