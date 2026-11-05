// Unpublished production candidate. No staff API or fixture issuer is included.
api_group "Unified Registration" {
 canonical = "registration26"
 description = "Owned program orders, linked registrations, and one-time checkout."
 swagger = {active:false}
 cors = {mode:"custom",origins:["https://www.chickenshednyc.org"],methods:["GET","POST"],headers:["Content-Type","Authorization"],credentials:false,max_age:60}
}
