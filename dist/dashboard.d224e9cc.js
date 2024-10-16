!function(e,t,r,n,o){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof i[n]&&i[n],l=a.cache||{},s="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function c(t,r){if(!l[t]){if(!e[t]){var o="function"==typeof i[n]&&i[n];if(!r&&o)return o(t,!0);if(a)return a(t,!0);if(s&&"string"==typeof t)return s(t);var d=Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}m.resolve=function(r){var n=e[t][1][r];return null!=n?n:r},m.cache={};var g=l[t]=new c.Module(t);e[t][0].call(g.exports,m,g,g.exports,this)}return l[t].exports;function m(e){var t=m.resolve(e);return!1===t?{}:c(t)}}c.isParcelRequire=!0,c.Module=function(e){this.id=e,this.bundle=c,this.exports={}},c.modules=e,c.cache=l,c.parent=a,c.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(c,"root",{get:function(){return i[n]}}),i[n]=c;for(var d=0;d<t.length;d++)c(t[d])}({"5D5Dr":[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"fetchStudentProfiles",()=>l),n.export(r,"initializeDynamicStudentList",()=>s);var o=e("@xatom/core"),i=e("@xatom/image"),a=e("../../api/apiConfig");async function l(){try{let e=(0,a.apiClient).get("/profiles/student_profiles");return(await e.fetch()).students}catch(e){throw console.error("Error fetching student profiles:",e),e}}async function s(e){let t=new o.WFDynamicList(e,{rowSelector:"#listStudentCard",loaderSelector:"#listStudentProfilesloading",emptySelector:"#listStudentProfilesEmpty"});t.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),t.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),t.rowRenderer(({rowData:e,rowElement:t})=>{let r;let n=new o.WFComponent(t),a=n.getAttribute("href")||"#";try{let t=window.location.origin,n=new URL(a,t);n.searchParams.set("id",e.id.toString()),r=n.pathname+n.search+n.hash}catch(t){console.error("Error parsing URL:",t),r=`${a}?id=${e.id}`}n.setAttribute("href",r);let l=new i.WFImage(n.getChildAsComponent("#listStudentCardImage").getElement()),s=n.getChildAsComponent("#studentName");return e.profile_pic&&e.profile_pic.url?l.setImage(e.profile_pic.url):l.setImage("https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"),s.setText(`${e.first_name} ${e.last_name}`),t.setStyle({display:"block"}),t});try{t.changeLoadingStatus(!0);let e=await l();e.sort((e,t)=>e.last_name.localeCompare(t.last_name)),t.setData(e),t.changeLoadingStatus(!1)}catch(e){console.error("Error loading student profiles:",e),t.setData([]),t.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"3njZO":[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"fetchAdditionalStudentProfiles",()=>s),n.export(r,"initializeDynamicAdditionalStudentList",()=>c),n.export(r,"reloadAdditionalStudentList",()=>d);var o=e("@xatom/core"),i=e("@xatom/image"),a=e("../../api/apiConfig");let l=null;async function s(){try{let e=(0,a.apiClient).get("/profiles/additional_students");return(await e.fetch()).additional_students}catch(e){throw console.error("Error fetching additional student profiles:",e),e}}async function c(e){if(!l){(l=new o.WFDynamicList(e,{rowSelector:"#listAdditionalStudentCard",loaderSelector:"#listAdditionalStudentProfilesloading",emptySelector:"#listAdditionalStudentProfilesEmpty"})).loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),l.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),l.rowRenderer(({rowData:e,rowElement:t})=>{let r;let n=new o.WFComponent(t),a=n.getAttribute("href")||"#";try{let t=window.location.origin,n=new URL(a,t);n.searchParams.set("id",e.id.toString()),r=n.pathname+n.search+n.hash}catch(t){console.error("Error parsing URL:",t),r=`${a}?id=${e.id}`}n.setAttribute("href",r);let l=new i.WFImage(n.getChildAsComponent("#listAdditionalStudentCardImage").getElement());return e.profile_pic&&e.profile_pic.url?l.setImage(e.profile_pic.url):l.setImage("https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"),n.getChildAsComponent("#additionalStudentName").setText(`${e.first_name} ${e.last_name}`),n.getChildAsComponent("#parentName").setText(e.parent_name),t.setStyle({display:"flex"}),t});try{l.changeLoadingStatus(!0);let e=await s();e.sort((e,t)=>e.last_name.localeCompare(t.last_name)),l.setData(e),l.changeLoadingStatus(!1)}catch(e){console.error("Error loading additional student profiles:",e),l.setData([]),l.changeLoadingStatus(!1)}}}async function d(){if(!l){console.error("Additional student list is not initialized.");return}try{l.changeLoadingStatus(!0);let e=await s();e.sort((e,t)=>e.last_name.localeCompare(t.last_name)),l.setData(e),l.changeLoadingStatus(!1)}catch(e){console.error("Error reloading additional student profiles:",e),l.setData([]),l.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],A7Qq7:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"fetchCaregiverProfiles",()=>E),n.export(r,"initializeDynamicCaregiverList",()=>b),n.export(r,"reloadCaregiverList",()=>F);var o=e("@xatom/core"),i=e("../../api/apiConfig"),a=e("../../utils/recaptchaUtils"),l=e("../../utils/formUtils"),s=e("../../utils/validationUtils"),c=e("./listAdditionalStudents");let d=new o.WFFormComponent("#resendCaregiverInviteForm"),g=new o.WFFormComponent("#deleteCaregiverForm"),m=new o.WFFormComponent("#inviteCaregiverForm"),u=new o.WFComponent("#resetCaregiverForm"),p=new o.WFComponent("#resetDeleteCaregiverForm"),f=new o.WFComponent("#resetResendCaregiverInviteForm"),v=new o.WFComponent("#resendCaregiverInviteSuccessTrigger"),y=new o.WFComponent("#deleteCaregiverSuccessTrigger"),h=new o.WFComponent("#inviteCaregiverSuccessTrigger"),w=!1,C=!1,S=!1;async function E(){try{let e=(0,i.apiClient).get("/caregivers"),t=await e.fetch();if(console.log("API response:",t),t.caregivers&&Array.isArray(t.caregivers))return t.caregivers;throw Error("Invalid response structure")}catch(e){throw console.error("Error fetching caregiver profiles:",e),e}}async function b(e){if(!document.querySelector(e)){console.error("Container not found for selector:",e);return}let t=new o.WFDynamicList(e,{rowSelector:"#caregiverCard",loaderSelector:"#caregiversLoading",emptySelector:"#caregiversEmpty"});(0,c.initializeDynamicAdditionalStudentList)("#listAdditionalStudentProfiles");let r=null,n=null;t.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),t.emptyRenderer(e=>(e.setStyle({display:"block"}),e)),t.rowRenderer(({rowData:e,rowElement:t})=>{let i=new o.WFComponent(t),a=i.getChildAsComponent("#caregiverEmail"),l=e.name?e.name:e.email;a.setText(l);let s=i.getChildAsComponent("#caregiverStatus"),c=i.getChildAsComponent(".resend-invite-btn"),d=i.getChildAsComponent(".delete-caregiver-btn");s.setText(e.status),"Active"===e.status&&c.setStyle({display:"none"}),c.on("click",()=>{let t=document.getElementById("resendCaregiverInviteDialog");if(t){console.log("Selected email:",r=e.email),t.showModal(),document.body.style.overflow="hidden";let n=()=>{t.close(),document.body.style.overflow="auto",f.getElement().click()},o=e=>{e.target===t&&n()};t.addEventListener("click",o);let i=e=>{"Escape"===e.key&&t.open&&n()};document.addEventListener("keydown",i);let a=t.querySelector("#close-dialog-btn");a&&a.addEventListener("click",()=>{n()}),t.addEventListener("close",()=>{t.removeEventListener("click",o),document.removeEventListener("keydown",i)},{once:!0})}else console.error("Dialog element not found")});let g=new o.WFComponent(".page_main");return d.on("click",()=>{g.setAttribute("data-brand","6");let t=document.getElementById("deleteCaregiverDialog");if(t){console.log("Selected caregiver ID:",n=e.id),t.showModal(),document.body.style.overflow="hidden";let r=()=>{t.close(),document.body.style.overflow="auto",p.getElement().click(),g.setAttribute("data-brand","2")},o=e=>{e.target===t&&(r(),g.setAttribute("data-brand","2"))};t.addEventListener("click",o);let i=e=>{"Escape"===e.key&&t.open&&(r(),g.setAttribute("data-brand","2"))};document.addEventListener("keydown",i);let a=t.querySelector("#close-dialog-btn");a&&a.addEventListener("click",()=>{r(),g.setAttribute("data-brand","2")},{once:!0}),t.addEventListener("close",()=>{t.removeEventListener("click",o),document.removeEventListener("keydown",i)},{once:!0})}else console.error("Dialog element not found")}),t.setStyle({display:"block"}),t});let v=new o.WFComponent("#caregiverRequestingAnimation"),y=new o.WFComponent("#submitCaregiverError"),h=new o.WFComponent("#resendCaregiverInviteSuccessTrigger");d.onFormSubmit(async(e,n)=>{if(n.preventDefault(),v.setStyle({display:"block"}),!r){console.error("No email selected"),(0,l.toggleError)(y,"No email selected. Please try again.",!0),v.setStyle({display:"none"});return}if(console.log("Selected email before sending:",r),!await (0,a.handleRecaptcha)("resend_caregiver_invite")){(0,l.toggleError)(y,"reCAPTCHA verification failed. Please try again.",!0),v.setStyle({display:"none"});return}try{console.log("Sending request to /caregivers/invite with data:",{caregiver_email:r});let e=await (0,i.apiClient).post("/caregivers/invite",{data:{caregiver_email:r}}).fetch();console.log("Invite sent successfully:",e),d.showSuccessState(),w=!0,h.getElement().click(),v.setStyle({display:"none"}),await F(t),await (0,c.reloadAdditionalStudentList)()}catch(e){console.error("Error sending invite:",e),(0,l.toggleError)(y,e.response?.data?.message||"Failed to send invite.",!0),v.setStyle({display:"none"})}});let E=new o.WFComponent("#caregiverDeletingAnimation"),b=new o.WFComponent("#submitDeleteCaregiverError"),A=new o.WFComponent("#deleteCaregiverSuccessTrigger");g.onFormSubmit(async(e,r)=>{if(r.preventDefault(),E.setStyle({display:"block"}),!n){console.error("No caregiver ID selected"),(0,l.toggleError)(b,"No caregiver ID selected. Please try again.",!0),E.setStyle({display:"none"});return}if(console.log("Selected caregiver ID before deleting:",n),!await (0,a.handleRecaptcha)("delete_caregiver")){(0,l.toggleError)(b,"reCAPTCHA verification failed. Please try again.",!0),E.setStyle({display:"none"});return}try{console.log(`Sending delete request to /caregivers/${n}`);let e=await (0,i.apiClient).delete(`/caregivers/${n}`).fetch();console.log("Caregiver deleted successfully:",e),g.showSuccessState(),C=!0,A.getElement().click(),E.setStyle({display:"none"}),await F(t),await (0,c.reloadAdditionalStudentList)()}catch(e){console.error("Error deleting caregiver:",e),(0,l.toggleError)(b,e.response?.data?.message||"Failed to delete caregiver.",!0),E.setStyle({display:"none"})}});let L=[{input:new o.WFComponent("#caregiverEmailInput"),error:new o.WFComponent("#caregiverEmailInputError"),validationFn:s.validateEmail,message:"Please enter a valid email address"}],k=new o.WFComponent("#caregiverRequestingAnimation"),D=new o.WFComponent("#submitInviteCaregiverError"),I=new o.WFComponent("#inviteCaregiverSuccessTrigger");m.onFormSubmit(async(e,r)=>{r.preventDefault(),k.setStyle({display:"block"});let n=!0;if(L.forEach(({input:e,error:t,validationFn:r,message:o})=>{let i=(0,l.createValidationFunction)(e,r,o)();i?((0,l.toggleError)(t,i,!0),n=!1):(0,l.toggleError)(t,"",!1)}),!n){console.log("Validation failed:",e),(0,l.toggleError)(D,"Please correct all errors above.",!0),k.setStyle({display:"none"});return}if(!await (0,a.handleRecaptcha)("invite_caregiver")){(0,l.toggleError)(D,"reCAPTCHA verification failed. Please try again.",!0),k.setStyle({display:"none"});return}try{console.log("Sending request to /caregivers/invite with data:",e);let r=await (0,i.apiClient).post("/caregivers/invite",{data:e}).fetch();"success"===r.status&&(m.showSuccessState(),S=!0,I.getElement().click(),k.setStyle({display:"none"}),await F(t),await (0,c.reloadAdditionalStudentList)())}catch(e){(0,l.toggleError)(D,e.response?.data?.message||"Failed to send invite.",!0),k.setStyle({display:"none"})}});try{await F(t)}catch(e){console.error("Error loading caregiver profiles:",e)}let x=document.getElementById("inviteCaregiver");x?x.addEventListener("click",()=>{let e=document.getElementById("inviteCaregiverDialog");if(e){e.showModal(),document.body.style.overflow="hidden";let t=()=>{e.close(),document.body.style.overflow="auto",u.getElement().click()},r=r=>{r.target===e&&t()};e.addEventListener("click",r);let n=r=>{"Escape"===r.key&&e.open&&t()};document.addEventListener("keydown",n);let o=e.querySelector("#close-dialog-btn");o&&o.addEventListener("click",()=>{t()},{once:!0}),e.addEventListener("close",()=>{e.removeEventListener("click",r),document.removeEventListener("keydown",n)},{once:!0})}else console.error("Dialog element not found")}):console.error("Invite caregiver button not found")}async function F(e){try{let t=await E();console.log("Fetched caregivers:",t),t.sort((e,t)=>e.email.localeCompare(t.email)),e.setData(t);let r=e.getElement().querySelectorAll(".resend-invite-btn");console.log("Resend buttons found:",r);let n=e.getElement().querySelectorAll(".delete-caregiver-btn");console.log("Delete buttons found:",n)}catch(e){console.error("Error reloading caregiver profiles:",e)}}u.on("click",()=>{console.log("Reset Caregiver Form clicked"),m.resetForm(),m.showForm(),S&&(h.getElement().click(),S=!1)}),p.on("click",()=>{console.log("Reset Delete Caregiver Form clicked"),g.resetForm(),g.showForm(),C&&(y.getElement().click(),C=!1)}),f.on("click",()=>{console.log("Reset Resend Invite Form clicked"),d.resetForm(),d.showForm(),w&&(v.getElement().click(),w=!1)})},{"@xatom/core":"65YBq","../../api/apiConfig":"dUmIV","../../utils/recaptchaUtils":"Jsdel","../../utils/formUtils":"gepHz","../../utils/validationUtils":"gu2z7","./listAdditionalStudents":"3njZO","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=dashboard.d224e9cc.js.map