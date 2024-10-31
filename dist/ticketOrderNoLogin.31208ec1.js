!function(e,t,r,n,o){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof i[n]&&i[n],s=a.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function l(t,r){if(!s[t]){if(!e[t]){var o="function"==typeof i[n]&&i[n];if(!r&&o)return o(t,!0);if(a)return a(t,!0);if(c&&"string"==typeof t)return c(t);var d=Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}u.resolve=function(r){var n=e[t][1][r];return null!=n?n:r},u.cache={};var m=s[t]=new l.Module(t);e[t][0].call(m.exports,u,m,m.exports,this)}return s[t].exports;function u(e){var t=u.resolve(e);return!1===t?{}:l(t)}}l.isParcelRequire=!0,l.Module=function(e){this.id=e,this.bundle=l,this.exports={}},l.modules=e,l.cache=s,l.parent=a,l.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(l,"root",{get:function(){return i[n]}}),i[n]=l;for(var d=0;d<t.length;d++)l(t[d])}({"3n7Fz":[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"fetchTickets",()=>s),n.export(r,"initializeTicketOrderNoLoginPage",()=>d);var o=e("@xatom/core"),i=e("@xatom/image"),a=e("../../api/apiConfig");async function s(e){try{let t=(0,a.apiClient).get(`/tickets/get_tickets/${encodeURIComponent(e)}`);return await t.fetch()}catch(e){return console.error("Error fetching tickets:",e),null}}let c=()=>({uuid:new URLSearchParams(window.location.search).get("uuid")}),l=e=>{let t=document.querySelector(e);t instanceof HTMLElement&&t.click()};async function d(){let{uuid:e}=c();if(!e){console.error("Invalid or missing uuid in URL"),alert("Invalid or missing order UUID. Please check your link and try again.");return}try{let t=await s(e);if(!t){console.error("Failed to fetch ticket details"),alert("Failed to retrieve ticket details. Please try again later.");return}l(".success_trigger");let{tickets:r,order:n,sale:a,performance:c}=t;new o.WFComponent("#productionName").setText(n.production_name),new o.WFComponent("#performanceName").setText(n.performance_name),new o.WFComponent("#performanceLocation").setText(n.location);let d=new o.WFComponent("#performanceDate"),m=new Date(n.performance_date_time);d.setText(m.toLocaleDateString([],{month:"2-digit",day:"2-digit",year:"2-digit"})),new o.WFComponent("#performanceTime").setText(m.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})),new o.WFComponent("#performanceLocationMap").getElement().innerHTML=c.location.response.result.fieldData["map-embed"];let u=document.querySelector("#performanceLocationMap figure"),g=document.querySelector("#performanceLocationMap iframe"),p=document.querySelector("#performanceLocationMap figure > div");u&&(u.style.width="100%",u.style.height="100%",u.style.padding="0",u.style.margin="0"),p&&(p.style.height="100%"),g&&(g.style.width="100%",g.style.height="100%",g.style.border="0"),new o.WFComponent("#performanceShortDescription").setText(c.performance.response.result.fieldData["short-description"]||"Description not available.");let f=new o.WFComponent("#assistanceRequestedTrue"),h=new o.WFComponent("#assistanceRequestedFalse");n.assistance_required?(f.setStyle({display:"block"}),h.setStyle({display:"none"})):(f.setStyle({display:"none"}),h.setStyle({display:"block"})),new o.WFComponent("#assistanceMessage").setText(n.assistance_message||"N/A");let y=new o.WFComponent("#invoiceDate"),b=new Date(a.created_at);y.setText(b.toLocaleDateString([],{month:"2-digit",day:"2-digit",year:"2-digit"})),new o.WFComponent("#invoiceAmount").setText(`$${a.amount_total.toFixed(2)}`),new o.WFComponent("#receiptButton").getElement().setAttribute("href",a.reciept_url);let w=new o.WFDynamicList("#ticketList",{rowSelector:"#ticketItem"});r.sort((e,t)=>e.id-t.id),w.rowRenderer(({rowData:e,rowElement:t})=>{let r=new o.WFComponent(t);new i.WFImage(r.getChildAsComponent(".ticket_qr").getElement()).setImage(e.qr_code.url),r.getChildAsComponent("#ticketProductionName").setText(e.production_name),r.getChildAsComponent("#ticketPerformanceName").setText(e.performance_name);let n=r.getChildAsComponent("#ticketPerformanceDate"),a=new Date(e.performance_date_time);return n.setText(`${a.toLocaleDateString([],{month:"2-digit",day:"2-digit",year:"2-digit"})} at ${a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`),r.getChildAsComponent("#ticketTicketTier").setText(e.ticket_tier_name),r.getChildAsComponent("#ticketSeatingAssignment").setText(e.seating_assignment),t}),w.setData(r),new o.WFComponent("#printTickets").on("click",()=>{let e=document.querySelector("#ticketList");if(e){let t=window.open("","_blank","width=800,height=600");if(t){let r=Array.from(document.styleSheets).map(e=>{try{return e.href?`<link rel="stylesheet" href="${e.href}">`:""}catch(e){return console.error("Error accessing stylesheet:",e),""}}).join(""),n=document.querySelector("#productionName")?.innerText||"Production Name",o=document.querySelector("#performanceName")?.innerText||"Performance Name",i=document.querySelector("#performanceDate")?.innerText||"Performance Date",a=document.querySelector("#performanceTime")?.innerText||"Performance Time";t.document.write(`
            <html>
              <head>
                <title>Print Tickets</title>
                ${r}
                <style>
                  /* Additional print-specific styling to handle layout and formatting */
                  body {
                    background-color: var(--theme--background);
                    font-family: var(--text-main--font-family);
                    color: #121331;
                    font-size: var(--text-main--font-size);
                    line-height: var(--text-main--line-height);
                    letter-spacing: var(--text-main--letter-spacing);
                    overscroll-behavior: none;
                    font-weight: var(--text--font-weight);
                    text-transform: var(--text--text-transform);
                    padding: 1rem 3rem; 
                  }
                  
                  #ticketList {
                    display: grid; /* Set display to grid */
                    grid-template-columns: repeat(3, 1fr); /* Create 3 columns */
                    gap: 20px; /* Add some spacing between the grid items */
                    color: black; /* Set color to black for ticket list */
                  }

                  .ticket_wrap {
                    page-break-inside: avoid; /* Avoid breaking ticket content across pages */
                  }

                  * {
                    box-sizing: border-box;
                  }

                  .hero-section {
                    text-align: center;
                    margin-bottom: 2rem;
                  }

                  .hero-section h1 {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: bold;
                  }

                  .hero-section p {
                    margin: 0.5rem 0;
                    font-size: 1.25rem;
                  }
                </style>
              </head>
              <body>
                <div class="hero-section">
                  <h1>${n}</h1>
                  <p><strong>${o}</strong></p>
                  <p>${i} at ${a}</p>
                </div>
                ${e.outerHTML}
              </body>
            </html>
          `),t.document.close(),t.print()}}})}catch(e){console.error("Error initializing ticket order page:",e),alert("An error occurred while loading your ticket order. Please try again later.")}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,r){var n,o=e("d023971cccd819e3"),i={};Object.defineProperty(i,"WFImage",{get:()=>a,set:void 0,enumerable:!0,configurable:!0});class a extends o.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}n=t.exports,Object.keys(i).forEach(function(e){"default"===e||"__esModule"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return i[e]}})})},{d023971cccd819e3:"65YBq"}]},[],0,"parcelRequired346");
//# sourceMappingURL=ticketOrderNoLogin.31208ec1.js.map
