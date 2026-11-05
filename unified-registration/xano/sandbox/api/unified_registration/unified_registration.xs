api_group "Unified Registration Sandbox" {
 canonical = "registration26"
 description = "Authenticated Registration Shed sandbox adapter. Never promote fixtures or test configuration."
 swagger = {active:false}
 cors = {mode:"custom",origins:["http://127.0.0.1:4817","https://chickenshednyc2024.webflow.io"],methods:["GET","POST"],headers:["Content-Type","Authorization","X-Tenant"],credentials:false,max_age:60}
 guid = "ZRVKruQb1Qa8l8j-0orX91xRWLE"
}