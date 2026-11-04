query "sales/payment-succeeded" verb=POST {
  api_group = "Noloco"

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
  }

  response = {
    response: $save_payment_method.response
    payload : $save_default_payment_payload
  }

  history = "all"
}