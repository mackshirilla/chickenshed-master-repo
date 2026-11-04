// Production candidate. Do not deploy until reviewed and approved.
api_group "Summer Registration" {
 canonical = "summer26"
 description = "Isolated Summer family checkout with linked session registrations; no subscriptions."
 swagger = {active:false}
 cors = {mode:"custom",origins:["https://www.chickenshednyc.org"],methods:["GET","POST"],headers:["Content-Type","Authorization"],credentials:false,max_age:60}
}
