!function(e,t,o,n,r){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof i[n]&&i[n],s=a.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function c(t,o){if(!s[t]){if(!e[t]){var r="function"==typeof i[n]&&i[n];if(!o&&r)return r(t,!0);if(a)return a(t,!0);if(l&&"string"==typeof t)return l(t);var d=Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}g.resolve=function(o){var n=e[t][1][o];return null!=n?n:o},g.cache={};var m=s[t]=new c.Module(t);e[t][0].call(m.exports,g,m,m.exports,this)}return s[t].exports;function g(e){var t=g.resolve(e);return!1===t?{}:c(t)}}c.isParcelRequire=!0,c.Module=function(e){this.id=e,this.bundle=c,this.exports={}},c.modules=e,c.cache=s,c.parent=a,c.register=function(t,o){e[t]=[function(e,t){t.exports=o},{}]},Object.defineProperty(c,"root",{get:function(){return i[n]}}),i[n]=c;for(var d=0;d<t.length;d++)c(t[d])}({cxaZ0:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"fetchWorkshopDetails",()=>c),n.export(o,"initializeWorkshopDetailsPage",()=>d);var r=e("@xatom/core"),i=e("@xatom/image"),a=e("../../../api/apiConfig"),s=e("../registration/components/cancelRegistrationDialog"),l=e("./components/listWorkshopFiles");async function c(e,t,o){try{let n={program:e,subscription:t};o&&(n.workshop_id=o);let r=(0,a.apiClient).get(`/dashboard/registration/workshop/${o||"none"}`,{data:n});return await r.fetch()}catch(t){console.error("Detailed Error Object:",t);let e="An unexpected error occurred. Please try again.";t?.response?.data?.message?e=t.response.data.message:t.message&&(e=t.message),alert(`Error: ${e}`),window.history.length>1?window.history.back():window.location.href="/dashboard/registrations",console.error("Fetch Workshop Details Error:",t);return}}async function d(){(0,l.initializeDynamicWorkshopFileList)("#filesList");let{workshopId:e,programId:t,subscriptionId:o}=(()=>{let e=new URLSearchParams(window.location.search);return{workshopId:e.get("workshop"),programId:e.get("program"),subscriptionId:e.get("subscription")}})();if(!t||!o){alert("Invalid access. Program ID or Subscription ID is missing."),window.history.back();return}try{let n=await c(t,o,e);if(!n)return;let{workshop:a,subscription:l,program:d,sessions:u,invoices:p,caregiver:f}=n,h=d.items.find(e=>e.id===l.program_id);a?function(e,t,o){let n=document.getElementById("workshopImage");if(n){let t=new i.WFImage(n);e.fieldData["main-image"].url?(t.setImage(e.fieldData["main-image"].url),t.getElement().alt=e.fieldData["main-image"].alt||"Workshop Image"):(t.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"),t.getElement().alt="Workshop Image")}let a=document.getElementById("workshopName");a&&new r.WFComponent(a).setText(e.fieldData.name);let s=document.getElementById("workshopBreadcrumb");s&&new r.WFComponent(s).setText(e.fieldData.name),function(e,t){let o=document.getElementById("programBreadcrumb");if(o){let n=new r.WFComponent(o),i=e.items.find(e=>e.id===t.program_id);if(i){n.setText(i.fieldData.name);let e=new URL(o.getAttribute("href")||"#",window.location.origin);e.searchParams.set("program",i.id),n.setAttribute("href",e.toString())}}}(t,o);let l=document.getElementById("programName");if(l){let t=new r.WFComponent(l);e.fieldData&&e.fieldData.name?t.setText(e.fieldData.name):t.setText("Program Name Not Available")}let c=document.getElementById("workshopShortDescription");c&&new r.WFComponent(c).setText(e.fieldData["short-description"])}(a,{items:d.items},l):h&&function(e,t){let o=document.getElementById("workshopImage");if(o){let t=new i.WFImage(o);e.fieldData["main-image"].url?(t.setImage(e.fieldData["main-image"].url),t.getElement().alt=e.fieldData["main-image"].alt||"Program Image"):(t.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"),t.getElement().alt="Program Image")}let n=document.getElementById("workshopName");n&&new r.WFComponent(n).setText(e.fieldData.name);let a=document.getElementById("programName");a&&new r.WFComponent(a).setText(e.fieldData.subheading);let s=document.getElementById("workshopBreadcrumb");s&&new r.WFComponent(s).setText(e.fieldData.name)}(h,0),h&&function(e){let t=document.getElementById("programBreadcrumb");if(t){let o=new r.WFComponent(t);o.setText(e.fieldData.name);let n=new URL(t.getAttribute("href")||"#",window.location.origin);n.searchParams.set("program",e.id),o.setAttribute("href",n.toString())}}(h),function(e){let t=document.getElementById("subscription_type");t&&new r.WFComponent(t).setText(e.subscription_type);let o=document.getElementById("nextInvoiceDate");if(o){let t=new r.WFComponent(o),n=e.next_charge_date;if(n){let e=new Date(n+"T00:00:00Z");if(isNaN(e.getTime()))t.setText("Upon Student Approval");else{let o=e.toLocaleDateString("en-US",{timeZone:"UTC"});t.setText(o)}}else t.setText("Upon Student Approval")}let n=document.getElementById("nextInvoiceAmount");if(n){let t=new r.WFComponent(n),o=e.next_charge_amount;if(0===o||null==o){let e=n.closest(".bento_box.is-dashboard.is-payment-detail");e instanceof HTMLElement&&(e.style.display="none")}else t.setText(`$${o}`)}let i=document.getElementById("finAidCoupon");if(i){let t=new r.WFComponent(i);if(e.coupon&&"None"!==e.coupon){let o=e.coupon.replace(/^FINAID/,"").trim()+"% Discount";t.setText(o)}else t.setText("None")}let a=document.getElementById("finAidDisclaimer");a&&(e.coupon?a.style.display="block":a.style.display="none")}(l);let y=function(e){let t={};return e.forEach(e=>{t[e.session_id]||(t[e.session_id]=e)}),Object.values(t)}(u);if(g("#listRegistration",y,l,f),m(".table_body",p),function(e,t){let o=document.getElementById("userBreadcrumbList"),n=document.getElementById("caregiverBreadcrumbList");if(e){o&&(o.style.display="none"),n&&(n.style.display="flex");let e=localStorage.getItem("caregiver_breadcrumbs");if(e)try{let t=JSON.parse(e),o=document.getElementById("studentBreadcrumb");if(o){let e=new r.WFComponent(o);e.setText(t.student_name);let n=o.getAttribute("href")||"/dashboard/student/profile",i=new URL(n,window.location.origin);i.searchParams.set("id",t.student_id.toString()),e.setAttribute("href",i.toString())}let n=document.getElementById("workshopBreadcrumbCaregiver");if(n){let e=new r.WFComponent(n),o=t.workshop_name||t.program_name||"N/A";e.setText(o)}}catch(e){console.error("Error parsing caregiver_breadcrumbs from localStorage:",e)}else console.warn("No caregiver_breadcrumbs found in localStorage.")}else o&&(o.style.display="flex"),n&&(n.style.display="none")}(f,0),f){let e=document.querySelector("#openCancelDialog");e&&e.remove();let t=document.getElementById("cancelRegistrationDialog");t&&t.remove();let o=document.querySelector(".payment_details_wrap");o&&o.remove()}else new s.CancelRegistrationDialog({containerSelector:".button_group",subscriptionId:l.id.toString(),onCancelSuccess:()=>{window.location.href="/dashboard/registrations"}});!function(e){let t=document.querySelector(e);t instanceof HTMLElement&&t.click()}(".success_trigger")}catch(e){console.error("initializeWorkshopDetailsPage Error:",e)}}async function m(e,t){let o=new r.WFDynamicList(e,{rowSelector:"#invoiceLine"});o.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),o.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),o.rowRenderer(({rowData:e,rowElement:t})=>{let o=new r.WFComponent(t),n=o.getChildAsComponent("#invoiceDate");if(n){let t=new r.WFComponent(n.getElement()),o=new Date(e.created_at).toLocaleDateString();t.setText(o)}let i=o.getChildAsComponent("#invoiceAmount");i&&new r.WFComponent(i.getElement()).setText(`$${e.amount_total}`);let a=o.getChildAsComponent("#receiptButton");return a&&new r.WFComponent(a.getElement()).setAttribute("href",e.reciept_url),t.setStyle({display:"table-row"}),t});try{o.changeLoadingStatus(!0),o.setData(t),o.changeLoadingStatus(!1)}catch(e){console.error("Error initializing past invoices list:",e),o.setData([]),o.changeLoadingStatus(!1)}}async function g(e,t,o,n){let i=new r.WFDynamicList(e,{rowSelector:"#listRegistrationCard",loaderSelector:"#listRegistrationloading",emptySelector:"#listRegistrationEmpty"});i.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),i.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),i.rowRenderer(({rowData:e,rowElement:t})=>{let i=new r.WFComponent(t),a=i.getChildAsComponent("#cardSessionDay");a&&new r.WFComponent(a.getElement()).setText(e.weekday);let s=i.getChildAsComponent("#cardSessionTimeBlock");s&&new r.WFComponent(s.getElement()).setText(e.time_block);let l=i.getChildAsComponent("#cardSessionLocation");l&&new r.WFComponent(l.getElement()).setText(e.location);let c=i.getElement(),d=new URL(c.getAttribute("href")||"#",window.location.origin);return d.searchParams.set("program",o.program_id),d.searchParams.set("workshop",o.workshop_id),d.searchParams.set("session",e.session_id),d.searchParams.set("subscription",o.id.toString()),c.setAttribute("href",d.toString()),n&&c.addEventListener("click",()=>{let t=localStorage.getItem("caregiver_breadcrumbs");if(t)try{let o=JSON.parse(t);o.session_id=e.session_id,o.session_weekday=e.weekday,o.session_time_block=e.time_block,localStorage.setItem("caregiver_breadcrumbs",JSON.stringify(o))}catch(e){console.error("Error updating caregiver_breadcrumbs:",e)}else console.warn("No caregiver_breadcrumbs found in localStorage.")}),t.setStyle({display:"block"}),t});try{i.changeLoadingStatus(!0),i.setData(t),i.changeLoadingStatus(!1)}catch(e){console.error("Error initializing dynamic session list:",e),i.setData([]),i.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../../api/apiConfig":"dUmIV","../registration/components/cancelRegistrationDialog":"9XIwa","./components/listWorkshopFiles":"jnww1","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,o){var n,r=e("d023971cccd819e3"),i={};Object.defineProperty(i,"WFImage",{get:()=>a,set:void 0,enumerable:!0,configurable:!0});class a extends r.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}n=t.exports,Object.keys(i).forEach(function(e){"default"===e||"__esModule"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return i[e]}})})},{d023971cccd819e3:"65YBq"}],"9XIwa":[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"CancelRegistrationDialog",()=>l);var r=e("@xatom/core"),i=e("../../../../api/apiConfig"),a=e("../../../../utils/formUtils"),s=e("../../../../utils/validationUtils");class l{constructor(e){let{containerSelector:t,subscriptionId:o,onCancelSuccess:n}=e;this.container=new r.WFComponent(t),this.subscriptionId=o,this.cancelForm=new r.WFFormComponent("#cancelSubscriptionForm"),this.dialog=new r.WFComponent("#inviteCaregiverDialog"),this.pageMain=new r.WFComponent(".page_main"),this.initialize(n)}initialize(e){if(!this.container.getElement()){console.error("Container element not found for CancelRegistrationDialog");return}let t=new r.WFComponent("#openCancelDialog");t.getElement()?t.on("click",()=>{console.log("Open Cancel Registration button clicked"),this.openDialog()}):console.error("Open Cancel Registration button not found");let o=new r.WFComponent("#close-dialog-btn");o.getElement()?o.on("click",()=>{console.log("Close dialog button clicked"),this.closeDialog()}):console.error("Close dialog button not found"),this.setupFormSubmission(e),this.setupFormValidation()}openDialog(){this.dialog.getElement()&&this.pageMain.getElement()?(console.log("Opening dialog"),this.dialog.getElement().showModal(),console.log("Setting page_main data-brand attribute to 6"),this.pageMain.setAttribute("data-brand","6")):console.error("Dialog or page_main element not found")}closeDialog(){this.dialog.getElement()&&this.pageMain.getElement()?(console.log("Closing dialog"),this.dialog.getElement().close(),console.log("Resetting page_main data-brand attribute to 2"),this.pageMain.setAttribute("data-brand","2")):console.error("Dialog or page_main element not found")}setupFormSubmission(e){this.cancelForm.onFormSubmit(async(t,o)=>{o.preventDefault(),o.stopPropagation(),console.log("Form submission intercepted");let n=t.cancelled_because;if(!(0,s.validateNotEmpty)(n)){let e=new r.WFComponent("#cancelledReasonError");(0,a.toggleError)(e,"Reason for cancelling is required.",!0);return}try{this.setLoadingState(!0),console.log("Submitting cancellation to API for subscription ID:",this.subscriptionId);let t=await (0,i.apiClient).delete(`/subscriptions/${this.subscriptionId}/cancel`,{data:{reason:n}}).fetch();if(t&&"Cancelled"===t.status){console.log("Cancellation successful");let t=new r.WFComponent("#cancelledReasonError");(0,a.toggleError)(t,"",!1),this.closeDialog(),e()}else throw Error(`Unexpected response format or status: ${t.status}`)}catch(e){console.error("Error cancelling registration: ",e),this.showErrorMessage("Oops! Something went wrong while submitting the form.")}finally{this.setLoadingState(!1)}})}setupFormValidation(){let e=new r.WFComponent("#cancelledReason"),t=new r.WFComponent("#cancelledReasonError");if(!e.getElement()||!t.getElement()){console.error("Reason input or error component not found for validation");return}let o=(0,a.createValidationFunction)(e,e=>(0,s.validateNotEmpty)(e),"Reason for cancelling is required.");(0,a.setupValidation)(e,t,o)}setLoadingState(e){let t=new r.WFComponent("#cancelRegistrationRequesting"),o=new r.WFComponent("#cancelRegistration");t.getElement()&&o.getElement()?e?(t.setStyle({display:"block"}),o.setAttribute("disabled","true")):(t.setStyle({display:"none"}),o.removeAttribute("disabled")):console.error("Loading animation or submit button not found for setting loading state")}showErrorMessage(e){let t=new r.WFComponent("#submitInviteCaregiverError");t.getElement()?(t.setText(e),t.setStyle({display:"flex"})):console.error("Error element not found for showing error message")}}},{"@xatom/core":"65YBq","../../../../api/apiConfig":"dUmIV","../../../../utils/formUtils":"gepHz","../../../../utils/validationUtils":"gu2z7","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gepHz:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"toggleError",()=>l),n.export(o,"setupValidation",()=>c),n.export(o,"createValidationFunction",()=>d),n.export(o,"createCheckboxValidationFunction",()=>m),n.export(o,"setupCheckboxValidation",()=>g),n.export(o,"validateSelectedSessions",()=>u),n.export(o,"setProfilePicUrl",()=>p),n.export(o,"setupFileUpload",()=>f),n.export(o,"formatPhoneNumber",()=>h);var r=e("@xatom/core"),i=e("@xatom/image"),a=e("../api/apiConfig"),s=e("../auth/authConfig");function l(e,t,o){e.updateTextViaAttrVar({text:o?t:""}),e.setStyle({display:o?"flex":"none"})}function c(e,t,o,n){let r=()=>{let e=o();l(t,e,!!e),n&&""===e&&l(n,"",!1)};e.on("input",r),e.on("blur",r),e.on("change",r)}function d(e,t,o){return()=>t(e.getElement().value)?"":o}function m(e,t){return()=>e.getElement().checked?"":t}function g(e,t,o){let n=m(e,o);c(e,t,n)}function u(e,t,o){let n=e.length>0&&e.some(e=>e.studentIds.length>0);return n?l(t,"",!1):l(t,o,!0),n}function p(e){let t=(0,s.userAuth).getUser();t&&t.profile&&(t.profile.profile_pic=t.profile.profile_pic||{url:""},t.profile.profile_pic.url=e,(0,s.userAuth).setUser(t),localStorage.setItem("auth_user",JSON.stringify(t)))}function f(e,t,o,n){let s=new i.WFImage("#profilePictureImage"),c=new r.WFComponent("#uploadAnimation"),d=new r.WFComponent(".drop-zone"),m=0;return new Promise(r=>{let i=i=>{if(!["image/jpeg","image/jpg"].includes(i.type)&&!/\.(jpg|jpeg)$/i.test(i.name)){l(t,"Only JPEG images are allowed.",!0),e.getElement().value="";return}if(i.size>2097152){l(t,"File size must be less than 2 MB.",!0),e.getElement().value="";return}c.setStyle({display:"flex"}),t.setStyle({display:"none"}),o.setStyle({display:"none"});let g=new FileReader;g.onload=e=>{let t=e.target?.result;s.setImage(t),d.setStyle({display:"none"})},g.readAsDataURL(i);let u=new FormData;u.append("profile_picture",i);let f=localStorage.getItem("current_student");if(f){let e=JSON.parse(f);u.append("student_profile_id",e.id.toString())}let h=(0,a.apiClient).post(n,{data:u});h.onData(n=>{if("success"===n.status){let e=n.url.profile_pic.url;p(e),s.setImage(e),localStorage.setItem("image_upload",e),o.setStyle({display:"flex"}),c.setStyle({display:"none"}),r(e)}else l(t,"Failed to upload profile picture.",!0),c.setStyle({display:"none"}),d.setStyle({display:"none"}),m=0,e.getElement().value=""}),h.onError(o=>{let n="An error occurred during image upload.";o.response&&o.response.data?n=o.response.data.message||n:o.message&&(n=o.message),l(t,n,!0),c.setStyle({display:"none"}),d.setStyle({display:"none"}),m=0,e.getElement().value=""}),h.fetch()};e.on("change",()=>{let t=e.getElement().files?.[0];t&&i(t)});let g=document.body;g.addEventListener("dragenter",e=>{e.preventDefault(),1==++m&&d.setStyle({display:"flex"})}),g.addEventListener("dragleave",()=>{--m<=0&&(d.setStyle({display:"none"}),m=0)}),g.addEventListener("dragover",e=>{e.preventDefault()}),g.addEventListener("drop",e=>{e.preventDefault();let t=e.dataTransfer?.files;t?.length&&i(t[0]),d.setStyle({display:"none"}),m=0})})}let h=e=>{let t=e.replace(/\D/g,"");return t.length<=3?t:t.length<=6?`(${t.slice(0,3)}) ${t.slice(3)}`:t.length<=10?`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6)}`:`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6,10)}`}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../api/apiConfig":"dUmIV","../auth/authConfig":"dHwPR","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gu2z7:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");function r(e){return void 0!==e&&""!==e.trim()}function i(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}n.defineInteropFlag(o),n.export(o,"validateNotEmpty",()=>r),n.export(o,"validateEmail",()=>i),n.export(o,"validateEmailOptional",()=>a),n.export(o,"validatePasswordRequirements",()=>s),n.export(o,"validateCheckbox",()=>l),n.export(o,"validatePasswordsMatch",()=>c),n.export(o,"validateSelectField",()=>d),n.export(o,"validatePhoneNumber",()=>m);let a=e=>""===e.trim()||i(e);function s(e){let t=/[a-z]/.test(e),o=/[A-Z]/.test(e),n=/\d/.test(e),r=/[!@#$%^&*(),.?":{}|<>]/.test(e),i=e.length>=8;return t&&o&&n&&r&&i}function l(e){return e}function c(e,t){return e===t}function d(e){return void 0!==e&&"N/A"!==e}function m(e){return/^\(\d{3}\)\s\d{3}-\d{4}$/.test(e)}},{"@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],jnww1:[function(e,t,o){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(o),n.export(o,"fetchWorkshopFiles",()=>a),n.export(o,"initializeDynamicWorkshopFileList",()=>s);var r=e("@xatom/core"),i=e("../../../../api/apiConfig");async function a(e){try{let t=(0,i.apiClient).get(`/student_files/workshop/${e}`);return await t.fetch()}catch(e){throw console.error("Error fetching files for student:",e),e}}async function s(e){let t=new URLSearchParams(window.location.search).get("subscription");if(!t){console.error("No student ID provided in URL");return}let o=new r.WFDynamicList(e,{rowSelector:"#fileCard",loaderSelector:"#filesloading",emptySelector:"#filesEmpty"});o.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),o.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),o.rowRenderer(({rowData:e,rowElement:t})=>{let o=new r.WFComponent(t);return o.setAttribute("href",e.file_url),o.getChildAsComponent("#fileName").setText(e.file_name),t.setStyle({display:"block"}),t});try{o.changeLoadingStatus(!0);let e=await a(t);e.sort((e,t)=>e.file_name.localeCompare(t.file_name)),o.setData(e),o.changeLoadingStatus(!1)}catch(e){console.error("Error loading files:",e),o.setData([]),o.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","../../../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=workshopDetails.785d78be.js.map
