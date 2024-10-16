!function(e,t,o,n,i){var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},r="function"==typeof a[n]&&a[n],s=r.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function l(t,o){if(!s[t]){if(!e[t]){var i="function"==typeof a[n]&&a[n];if(!o&&i)return i(t,!0);if(r)return r(t,!0);if(c&&"string"==typeof t)return c(t);var d=Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}m.resolve=function(o){var n=e[t][1][o];return null!=n?n:o},m.cache={};var g=s[t]=new l.Module(t);e[t][0].call(g.exports,m,g,g.exports,this)}return s[t].exports;function m(e){var t=m.resolve(e);return!1===t?{}:l(t)}}l.isParcelRequire=!0,l.Module=function(e){this.id=e,this.bundle=l,this.exports={}},l.modules=e,l.cache=s,l.parent=r,l.register=function(t,o){e[t]=[function(e,t){t.exports=o},{}]},Object.defineProperty(l,"root",{get:function(){return a[n]}}),a[n]=l;for(var d=0;d<t.length;d++)l(t[d])}({"6pJZl":[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"initializeSuccessPage",()=>l);var i=e("./registration_success"),a=e("./ticket_success"),r=e("./donation_success");let s=()=>{let e=new URLSearchParams(window.location.search);return{isRegistration:e.has("registration"),isTicketPurchase:e.has("ticket_purchase"),isDonationSuccessful:e.has("donation_successful")}},c=e=>{let t=[];for(let o=0;o<localStorage.length;o++){let n=localStorage.key(o);n&&!e.includes(n)&&t.push(n)}t.forEach(e=>{localStorage.removeItem(e)})},l=()=>{console.log("Initializing success page"),c(["auth_config","auth_role","auth_user"]);let{isRegistration:e,isTicketPurchase:t,isDonationSuccessful:o}=s();e&&(console.log("Handling registration success"),(0,i.handleRegistrationSuccess)()),t&&(console.log("Handling ticket success"),(0,a.handleTicketSuccess)()),o?(console.log("Handling donation success"),(0,r.handleDonationSuccess)()):console.warn("Donation success parameters not found in the URL. Please check your link and try again.")}},{"./registration_success":"ifnoH","./ticket_success":"dXC3Z","./donation_success":"f17tC","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],ifnoH:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"handleRegistrationSuccess",()=>l);var i=e("@xatom/core"),a=e("@xatom/image"),r=e("../../api/apiConfig");class s{constructor(e){let t=document.getElementById(e);if(!t)throw Error(`Element with id '${e}' not found.`);this.card=new i.WFComponent(t),this.image=new a.WFImage(this.card.getChildAsComponent("#cardRegistrationImage").getElement()),this.programName=this.card.getChildAsComponent("#cardProgramName"),this.workshopName=this.card.getChildAsComponent("#cardWorkshopName"),this.subscriptionType=this.card.getChildAsComponent("#cardSubscriptionType"),this.invoiceDate=this.card.getChildAsComponent("#cardInvoiceDate"),this.activePill=this.card.getChildAsComponent("#cardActivePill"),this.depositPill=this.card.getChildAsComponent("#cardDepositPill"),this.successMessage=new i.WFComponent("#successMessage"),this.programId="",this.programName||console.warn("Element with id 'cardProgramName' not found within the registration card."),this.workshopName||console.warn("Element with id 'cardWorkshopName' not found within the registration card."),this.subscriptionType||console.warn("Element with id 'cardSubscriptionType' not found within the registration card."),this.invoiceDate||console.warn("Element with id 'cardInvoiceDate' not found within the registration card."),this.activePill||console.warn("Element with id 'cardActivePill' not found within the registration card."),this.depositPill||console.warn("Element with id 'cardDepositPill' not found within the registration card."),this.image||console.warn("Element with id 'cardRegistrationImage' not found within the registration card."),this.successMessage||console.warn("Element with id 'successMessage' not found on the page.")}populate(e){console.log("Populating registration card with data."),this.programId=e.program_id,console.log("Program ID set to:",this.programId),this.programName.setText(e.program_name),console.log("Set programName:",e.program_name),this.workshopName.setText(e.workshop_name),console.log("Set workshopName:",e.workshop_name),this.subscriptionType.setText(e.subscription_type),console.log("Set subscriptionType:",e.subscription_type);let t=e.next_charge_date?new Date(e.next_charge_date).toLocaleDateString():"Upon Student Approval";this.invoiceDate.setText(t),console.log("Set invoiceDate:",t);let o=e.workshop?e.workshop.fieldData:e.program.response.result.fieldData;o["main-image"].url&&(this.image.setImage(o["main-image"].url),this.image.getElement().alt=o["main-image"].alt||"Workshop Image",console.log("Set registration image URL and alt text.")),o["success-page-message"]&&(this.successMessage.setHTML(o["success-page-message"]),this.successMessage.getElement().style.display="block",console.log("Set and displayed success message."));let n=e.status.toLowerCase();"active"===n?(this.activePill.setText("Active"),this.activePill.getElement().style.display="block",this.depositPill.getElement().style.display="none",console.log("Displayed Active pill.")):"deposit paid"===n?(this.depositPill.setText("Deposit Paid"),this.depositPill.getElement().style.display="block",this.activePill.getElement().style.display="none",console.log("Displayed Deposit Paid pill.")):(this.activePill.getElement().style.display="none",this.depositPill.getElement().style.display="none",console.log("Hid both status pills.")),this.updateRegistrationLink()}updateRegistrationLink(){let e=this.card.getElement();if(!e){console.warn("registrationCard element is not an anchor element.");return}let t=e.getAttribute("href")||"#";console.log("Current href before update:",t);try{let o=new URL(t,window.location.origin);o.searchParams.set("program",this.programId),e.setAttribute("href",o.toString()),console.log("Updated registration link with program parameter:",o.toString())}catch(e){console.error("Invalid URL in registrationCard href:",t,e)}}show(){this.card.getElement().style.display="block",console.log("Displayed registration card.")}}let c=()=>{let e=new URLSearchParams(window.location.search);return{isRegistration:e.has("registration"),subscriptionId:e.get("subscription")}},l=async()=>{console.log("Handling registration success");let{isRegistration:e,subscriptionId:t}=c();if(e&&t)try{console.log("Fetching registration data...");let e=(0,r.apiClient).get(`/success_page/registration/${t}`),o=await new Promise((t,o)=>{e.onData(e=>{console.log("Registration data received:",e.data),t(e.data)}),e.onError(e=>{console.error("API Error:",e),o(e)}),e.fetch()}),n=document.querySelector(".success_trigger");n&&(console.log("Triggering success_trigger element."),n.click());let i=new s("registrationCard");i.populate(o),i.show()}catch(t){console.error("Error fetching registration data:",t);let e=document.getElementById("errorMessage");e&&(e.innerHTML=`
          <p>An error occurred while processing your registration.</p>
          <p>Please contact us for assistance.</p>
        `,e.style.display="block",console.log("Displayed error message."))}else console.log("Registration parameters not found in URL.")}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,o){var n,i=e("d023971cccd819e3"),a={};Object.defineProperty(a,"WFImage",{get:()=>r,set:void 0,enumerable:!0,configurable:!0});class r extends i.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}n=t.exports,Object.keys(a).forEach(function(e){"default"===e||"__esModule"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return a[e]}})})},{d023971cccd819e3:"65YBq"}],dXC3Z:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"handleTicketSuccess",()=>l);var i=e("@xatom/core"),a=e("@xatom/image"),r=e("../../api/apiConfig");class s{constructor(e,t){let o=document.getElementById(e);if(!o)throw Error(`Element with id '${e}' not found.`);this.card=new i.WFComponent(o),this.image=new a.WFImage(this.card.getChildAsComponent("#cardPerformanceImage").getElement()),this.productionName=this.card.getChildAsComponent("#cardProductionName"),this.performanceName=this.card.getChildAsComponent("#cardPerformanceName"),this.performanceDate=this.card.getChildAsComponent("#cardPerformanceDate"),this.quantity=this.card.getChildAsComponent("#quantity"),this.performanceId="",this.orderId=t,this.productionName||console.warn("Element with id 'cardProductionName' not found within the ticket card."),this.quantity||console.warn("Element with id 'quantity' not found within the ticket card."),this.performanceName||console.warn("Element with id 'cardPerformanceName' not found within the ticket card."),this.performanceDate||console.warn("Element with id 'cardPerformanceDate' not found within the ticket card."),this.image||console.warn("Element with id 'cardPerformanceImage' not found within the ticket card.")}populate(e){console.log("Populating ticket card with data."),this.performanceId=e.performance_id,console.log("Performance ID set to:",this.performanceId),this.productionName.setText(e.production_name),console.log("Set productionName:",e.production_name),this.performanceName.setText(e.performance_name),console.log("Set performanceName:",e.performance_name);let t=new Date(e.performance_date_time).toLocaleString();this.performanceDate.setText(t),console.log("Set performanceDate:",t),this.quantity.setText(e.quantity.toString()),console.log("Set ticket quantity:",e.quantity),e.image_url&&(this.image.setImage(e.image_url),this.image.getElement().alt=`${e.production_name} - Performance Image`,console.log("Set performance image URL and alt text."));let o=document.querySelector("#successMessage");o&&o instanceof HTMLElement&&(o.innerHTML=e["success-page-message"],o.style.display="block",console.log("Set and displayed success message.")),this.updateTicketOrderLink()}updateTicketOrderLink(){let e=this.card.getElement();if(!e){console.warn("ticketOrderCard element is not an anchor element.");return}let t=e.getAttribute("href")||"#";console.log("Current href before update:",t);try{let o=new URL(t,window.location.origin);o.searchParams.set("performance",this.performanceId),o.searchParams.set("order",this.orderId),e.setAttribute("href",o.toString()),console.log("Updated ticket order link with performance and order parameters:",o.toString())}catch(e){console.error("Invalid URL in ticketOrderCard href:",t,e),alert("An error occurred while updating the ticket order link.")}}show(){let e=this.card.getElement();e instanceof HTMLElement&&(e.style.display="block",console.log("Displayed ticket card."))}}let c=()=>{let e=new URLSearchParams(window.location.search);return{isTicketPurchase:e.has("ticket_purchase"),orderId:e.get("order")}},l=async()=>{console.log("Handling ticket success");let{isTicketPurchase:e,orderId:t}=c();if(e&&t)try{console.log("Fetching ticket order data...");let e=(0,r.apiClient).get(`/success_page/tickets/${t}`),o=await new Promise((t,o)=>{e.onData(e=>{console.log("Ticket data received:",e.data),t(e.data)}),e.onError(e=>{console.error("API Error:",e),o(e)}),e.fetch()}),n=document.querySelector(".success_trigger");n&&n instanceof HTMLElement&&(console.log("Triggering success_trigger element."),n.click());let i=new s("ticketOrderCard",t);i.populate(o),i.show()}catch(e){console.error("Error fetching ticket data:",e),alert("An error occurred while processing your ticket order. Please contact us for assistance.")}else console.log("Ticket purchase parameters not found in URL."),alert("Ticket purchase parameters not found in the URL. Please check your link and try again.")}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],f17tC:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"handleDonationSuccess",()=>l);var i=e("@xatom/core"),a=e("@xatom/image"),r=e("../../api/apiConfig");class s{constructor(e){let t=document.getElementById(e);if(!t)throw Error(`Element with id '${e}' not found.`);this.card=new i.WFComponent(t),this.image=new a.WFImage(this.card.getChildAsComponent("#cardCampaignImage").getElement()),this.campaignName=this.card.getChildAsComponent("#cardCampaignName"),this.campaignSubtitle=this.card.getChildAsComponent("#cardCampaignSubtitle"),this.donationAmount=this.card.getChildAsComponent("#cardDonationAmount"),this.campaignId="",this.donationId=0,this.campaignName||console.warn("Element with id 'cardCampaignName' not found within the donation card."),this.campaignSubtitle||console.warn("Element with id 'cardCampaignSubtitle' not found within the donation card."),this.donationAmount||console.warn("Element with id 'cardDonationAmount' not found within the donation card."),this.image||console.warn("Element with id 'cardCampaignImage' not found within the donation card.")}populate(e){console.log("Populating donation card with data."),this.campaignId=e.campaign_id,console.log("Campaign ID set to:",this.campaignId),this.donationId=e.id,console.log("Donation ID set to:",this.donationId),this.campaignName.setText(e.campaign_name),console.log("Set campaignName:",e.campaign_name);let t=e.keep_anonymous?"Anonymous Donation":`Thank you, ${e.customer_first_name}!`;this.campaignSubtitle.setText(t),console.log("Set campaignSubtitle:",t),this.donationAmount.setText(`$${e.amount.toFixed(2)}`),console.log("Set donationAmount:",`$${e.amount.toFixed(2)}`),e.image_url&&(this.image.setImage(e.image_url),this.image.getElement().alt=`${e.campaign_name} - Campaign Image`,console.log("Set campaign image URL and alt text."));let o=document.querySelector("#successMessage");o&&o instanceof HTMLElement&&(o.innerHTML=e["success-page-message"],o.style.display="block",console.log("Set and displayed success message.")),this.updateDonationCardLink()}updateDonationCardLink(){let e=this.card.getElement();if(!e){console.warn("donationCard element is not an anchor element.");return}let t=e.getAttribute("href")||"#";console.log("Current href before update:",t);try{let o=new URL(t,window.location.origin);o.searchParams.set("campaign",this.campaignId),o.searchParams.set("donation",this.donationId.toString()),e.setAttribute("href",o.toString()),console.log("Updated donation card link with campaign and donation parameters:",o.toString())}catch(e){console.error("Invalid URL in donationCard href:",t,e),alert("An error occurred while updating the donation card link.")}}show(){let e=this.card.getElement();e instanceof HTMLElement&&(e.style.display="block",console.log("Displayed donation card."))}}let c=()=>{let e=new URLSearchParams(window.location.search);return{isDonationSuccessful:e.has("donation_successful"),donationId:e.get("donation")}},l=async()=>{console.log("Handling donation success");let{isDonationSuccessful:e,donationId:t}=c();if(e&&t)try{console.log("Fetching donation data...");let e=(0,r.apiClient).get(`/success_page/donation/${t}`),o=await new Promise((t,o)=>{e.onData(e=>{console.log("Donation data received:",e.data),t(e.data)}),e.onError(e=>{console.error("API Error:",e),o(e)}),e.fetch()}),n=document.querySelector(".success_trigger");n&&n instanceof HTMLElement&&(console.log("Triggering success_trigger element."),n.click());let i=new s("donationCard");i.populate(o),i.show()}catch(e){console.error("Error fetching donation data:",e),alert("An error occurred while processing your donation. Please contact us for assistance.")}else console.log("Donation parameters not found in URL."),alert("Donation parameters not found in the URL. Please check your link and try again.")}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=success_page.91e91fc4.js.map
