!function(e,t,r,n,o){var s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i="function"==typeof s[n]&&s[n],l=i.cache||{},a="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function p(t,r){if(!l[t]){if(!e[t]){var o="function"==typeof s[n]&&s[n];if(!r&&o)return o(t,!0);if(i)return i(t,!0);if(a&&"string"==typeof t)return a(t);var u=Error("Cannot find module '"+t+"'");throw u.code="MODULE_NOT_FOUND",u}c.resolve=function(r){var n=e[t][1][r];return null!=n?n:r},c.cache={};var d=l[t]=new p.Module(t);e[t][0].call(d.exports,c,d,d.exports,this)}return l[t].exports;function c(e){var t=c.resolve(e);return!1===t?{}:p(t)}}p.isParcelRequire=!0,p.Module=function(e){this.id=e,this.bundle=p,this.exports={}},p.modules=e,p.cache=l,p.parent=i,p.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(p,"root",{get:function(){return s[n]}}),s[n]=p;for(var u=0;u<t.length;u++)p(t[u])}({Vd1jl:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"initializeAccountDetailsPage",()=>l);var o=e("./getUserDetails"),s=e("./edituserDialog"),i=e("./deleteUser");let l=async()=>{await (0,o.getUserDetails)(),(0,s.initializeEditUserDialog)(),(0,i.initializeDeleteUser)(),window.addEventListener("beforeunload",()=>{localStorage.removeItem("current_user")})}},{"./getUserDetails":"lg4FD","./edituserDialog":"MM8O6","./deleteUser":"b1pjg","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],lg4FD:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"getUserDetails",()=>l);var o=e("../../../api/apiConfig"),s=e("@xatom/core"),i=e("@xatom/image");let l=async()=>{let e=new s.WFComponent(".dashboard_loading_wall");e.setStyle({display:"flex"});try{let e=await (0,o.apiClient).get("/dashboard/account").fetch();if(e){a(".success_trigger"),new s.WFComponent("#userFullName").setText(`${e.first_name} ${e.last_name}`);let t=new i.WFImage("#userProfilePicture");e.profile_pic&&e.profile_pic.url?t.setImage(e.profile_pic.url):t.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"),new s.WFComponent("#userEmail").setText(e.email||"N/A"),new s.WFComponent("#userPhone").setText(e.phone||"N/A"),new s.WFComponent("#userAddressLineOne").setText(e.address_line_1||"N/A"),new s.WFComponent("#userAddressLineTwo").setText(e.address_line_2||"N/A"),new s.WFComponent("#userCity").setText(e.city||"N/A"),new s.WFComponent("#userState").setText(e.state||"N/A"),new s.WFComponent("#userZip").setText(e.zip||"N/A");let r=new s.WFComponent("#userTextTrue"),n=new s.WFComponent("#userTextFalse");e.send_texts?(r.setStyle({display:"block"}),n.setStyle({display:"none"})):(r.setStyle({display:"none"}),n.setStyle({display:"block"}));let o=new s.WFComponent("#userYTrue"),l=new s.WFComponent("#userYFalse");e.is_y_member?(o.setStyle({display:"block"}),l.setStyle({display:"none"})):(o.setStyle({display:"none"}),l.setStyle({display:"block"})),new s.WFComponent("#userYMembershipNumber").setText(e.y_membership_id||"N/A"),localStorage.setItem("current_user",JSON.stringify(e))}else alert("Error: Received null response from the server."),console.error("Received null response from the server."),window.history.back()}catch(e){console.error("Error fetching user details:",e),alert(`Error fetching user details: ${e.message||e}`),window.history.back()}finally{e.setStyle({display:"none"})}},a=e=>{let t=document.querySelector(e);t instanceof HTMLElement&&t.click()}},{"../../../api/apiConfig":"dUmIV","@xatom/core":"65YBq","@xatom/image":"bavwf","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,r){var n,o=e("d023971cccd819e3"),s={};Object.defineProperty(s,"WFImage",{get:()=>i,set:void 0,enumerable:!0,configurable:!0});class i extends o.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}n=t.exports,Object.keys(s).forEach(function(e){"default"===e||"__esModule"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return s[e]}})})},{d023971cccd819e3:"65YBq"}],MM8O6:[function(e,t,r){let n,o,s,i;var l=e("@parcel/transformer-js/src/esmodule-helpers.js");l.defineInteropFlag(r),l.export(r,"initializeEditUserDialog",()=>f);var a=e("@xatom/core"),p=e("@xatom/image"),u=e("../../../api/apiConfig"),d=e("../../../utils/formUtils"),c=e("../../../utils/validationUtils"),m=e("./getUserDetails");let f=()=>{let e=new a.WFComponent("#openEditUserDialog"),t=document.getElementById("editUserDialog"),r=new a.WFComponent("#close-dialog-btn");e.on("click",()=>{g(),t&&t.showModal()}),r.on("click",()=>{t&&t.close()});let l=new a.WFFormComponent("#editUserForm"),p=new a.WFComponent("#editUserSubmitError"),f=[{input:new a.WFComponent("#firstNameInput"),error:new a.WFComponent("#firstNameInputError"),validationFn:c.validateNotEmpty,message:"First name is required"},{input:new a.WFComponent("#lastNameInput"),error:new a.WFComponent("#lastNameInputError"),validationFn:c.validateNotEmpty,message:"Last name is required"},{input:new a.WFComponent("#emailInput"),error:new a.WFComponent("#emailInputError"),validationFn:c.validateEmail,message:"Invalid email format"},{input:new a.WFComponent("#phoneNumberInput"),error:new a.WFComponent("#phoneNumberInputError"),validationFn:c.validatePhoneNumber,message:"Phone number must be in the format (xxx) xxx-xxxx"}];f.forEach(({input:e,error:t,validationFn:r,message:n})=>{(0,d.setupValidation)(e,t,(0,d.createValidationFunction)(e,r,n),p)}),n=new a.WFComponent("#isYMemberInput"),o=new a.WFComponent("#hiddenyMemberWrapper"),s=new a.WFComponent("#yMemberIdInput"),i=new a.WFComponent("#yMemberIdInputError");let y=()=>{n.getElement().checked?o.removeCssClass("g-hide"):(o.addCssClass("g-hide"),s.getElement().value="")};y(),n.on("change",()=>{y()}),l.onFormSubmit(async(e,r)=>{r.preventDefault();let n=new a.WFComponent("#requestingAnimationEditUser");n.setStyle({display:"block"});let o=!0;if(f.forEach(({input:e,error:t,validationFn:r,message:n})=>{let s=(0,d.createValidationFunction)(e,r,n)();s?((0,d.toggleError)(t,s,!0),o=!1):(0,d.toggleError)(t,"",!1)}),(0,d.toggleError)(i,"",!1),o)(0,d.toggleError)(p,"",!1);else{(0,d.toggleError)(p,"Please correct all errors above.",!0),n.setStyle({display:"none"});return}let s=new a.WFComponent("#editUserSubmitButton");s.setAttribute("disabled","true");let l={...e};try{let e=await (0,u.apiClient).post("/profiles/update_profile",{data:l}).fetch();if("success"===e.status)await (0,m.getUserDetails)(),g(),t&&t.close();else throw Error(e.message||"Update failed")}catch(e){console.error("Error updating user profile:",e),(0,d.toggleError)(p,e.message||"An error occurred",!0)}finally{n.setStyle({display:"none"}),s.removeAttribute("disabled")}});let h=new a.WFComponent("#profilePictureInput"),b=new a.WFComponent("#profilePictureInputError"),w=new a.WFComponent("#profilePictureInputSuccess");(0,d.setupFileUpload)(h,b,w,"/profiles/image-upload")},g=()=>{let e;let t=localStorage.getItem("current_user");if(!t){console.error("No user data found");return}try{e=JSON.parse(t)}catch(e){console.error("Error parsing user data from localStorage:",e);return}let r=(e,t,r=!1)=>{let n=document.querySelector(e);n&&(r&&n instanceof HTMLInputElement?n.checked=!!t:n.value=String(t))};r("#firstNameInput",e.first_name),r("#lastNameInput",e.last_name),r("#emailInput",e.email),r("#phoneNumberInput",e.phone),r("#sendTextsInput",e.send_texts,!0),r("#addressLineOneInput",e.address_line_1),r("#addressLineTwoInput",e.address_line_2),r("#cityInput",e.city),r("#stateInput",e.state),r("#zipInput",e.zip),r("#referralInput",e.referred_by),r("#isYMemberInput",e.is_y_member,!0),r("#yMemberIdInput",e.y_membership_id);let i=new p.WFImage("#profilePictureImage");e.profile_pic&&e.profile_pic.url?i.setImage(e.profile_pic.url):i.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"),n.getElement().checked?o.removeCssClass("g-hide"):(o.addCssClass("g-hide"),s.getElement().value="")}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../../api/apiConfig":"dUmIV","../../../utils/formUtils":"gepHz","../../../utils/validationUtils":"gu2z7","./getUserDetails":"lg4FD","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gepHz:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"toggleError",()=>a),n.export(r,"setupValidation",()=>p),n.export(r,"createValidationFunction",()=>u),n.export(r,"createCheckboxValidationFunction",()=>d),n.export(r,"setupCheckboxValidation",()=>c),n.export(r,"validateSelectedSessions",()=>m),n.export(r,"setProfilePicUrl",()=>f),n.export(r,"setupFileUpload",()=>g),n.export(r,"formatPhoneNumber",()=>y);var o=e("@xatom/core"),s=e("@xatom/image"),i=e("../api/apiConfig"),l=e("../auth/authConfig");function a(e,t,r){e.updateTextViaAttrVar({text:r?t:""}),e.setStyle({display:r?"flex":"none"})}function p(e,t,r,n){let o=()=>{let e=r();a(t,e,!!e),n&&""===e&&a(n,"",!1)};e.on("input",o),e.on("blur",o),e.on("change",o)}function u(e,t,r){return()=>t(e.getElement().value)?"":r}function d(e,t){return()=>e.getElement().checked?"":t}function c(e,t,r){let n=d(e,r);p(e,t,n)}function m(e,t,r){let n=e.length>0&&e.some(e=>e.studentIds.length>0);return n?a(t,"",!1):a(t,r,!0),n}function f(e){let t=(0,l.userAuth).getUser();t&&t.profile&&(t.profile.profile_pic=t.profile.profile_pic||{url:""},t.profile.profile_pic.url=e,(0,l.userAuth).setUser(t),localStorage.setItem("auth_user",JSON.stringify(t)))}function g(e,t,r,n){let l=new s.WFImage("#profilePictureImage"),p=new o.WFComponent("#uploadAnimation"),u=new o.WFComponent(".drop-zone"),d=0;return new Promise(o=>{let s=s=>{if(!["image/jpeg","image/jpg"].includes(s.type)&&!/\.(jpg|jpeg)$/i.test(s.name)){a(t,"Only JPEG images are allowed.",!0),e.getElement().value="";return}if(s.size>2097152){a(t,"File size must be less than 2 MB.",!0),e.getElement().value="";return}p.setStyle({display:"flex"}),t.setStyle({display:"none"}),r.setStyle({display:"none"});let c=new FileReader;c.onload=e=>{let t=e.target?.result;l.setImage(t),u.setStyle({display:"none"})},c.readAsDataURL(s);let m=new FormData;m.append("profile_picture",s);let g=localStorage.getItem("current_student");if(g){let e=JSON.parse(g);m.append("student_profile_id",e.id.toString())}let y=(0,i.apiClient).post(n,{data:m});y.onData(n=>{if("success"===n.status){let e=n.url.profile_pic.url;f(e),l.setImage(e),localStorage.setItem("image_upload",e),r.setStyle({display:"flex"}),p.setStyle({display:"none"}),o(e)}else a(t,"Failed to upload profile picture.",!0),p.setStyle({display:"none"}),u.setStyle({display:"none"}),d=0,e.getElement().value=""}),y.onError(r=>{let n="An error occurred during image upload.";r.response&&r.response.data?n=r.response.data.message||n:r.message&&(n=r.message),a(t,n,!0),p.setStyle({display:"none"}),u.setStyle({display:"none"}),d=0,e.getElement().value=""}),y.fetch()};e.on("change",()=>{let t=e.getElement().files?.[0];t&&s(t)});let c=document.body;c.addEventListener("dragenter",e=>{e.preventDefault(),1==++d&&u.setStyle({display:"flex"})}),c.addEventListener("dragleave",()=>{--d<=0&&(u.setStyle({display:"none"}),d=0)}),c.addEventListener("dragover",e=>{e.preventDefault()}),c.addEventListener("drop",e=>{e.preventDefault();let t=e.dataTransfer?.files;t?.length&&s(t[0]),u.setStyle({display:"none"}),d=0})})}let y=e=>{let t=e.replace(/\D/g,"");return t.length<=3?t:t.length<=6?`(${t.slice(0,3)}) ${t.slice(3)}`:t.length<=10?`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6)}`:`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6,10)}`}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../api/apiConfig":"dUmIV","../auth/authConfig":"dHwPR","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gu2z7:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");function o(e){return void 0!==e&&""!==e.trim()}function s(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}n.defineInteropFlag(r),n.export(r,"validateNotEmpty",()=>o),n.export(r,"validateEmail",()=>s),n.export(r,"validateEmailOptional",()=>i),n.export(r,"validatePasswordRequirements",()=>l),n.export(r,"validateCheckbox",()=>a),n.export(r,"validatePasswordsMatch",()=>p),n.export(r,"validateSelectField",()=>u),n.export(r,"validatePhoneNumber",()=>d);let i=e=>""===e.trim()||s(e);function l(e){let t=/[a-z]/.test(e),r=/[A-Z]/.test(e),n=/\d/.test(e),o=/[!@#$%^&*(),.?":{}|<>]/.test(e),s=e.length>=8;return t&&r&&n&&o&&s}function a(e){return e}function p(e,t){return e===t}function u(e){return void 0!==e&&"N/A"!==e}function d(e){return/^\(\d{3}\)\s\d{3}-\d{4}$/.test(e)}},{"@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],b1pjg:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"initializeDeleteUser",()=>i);var o=e("@xatom/core"),s=e("../../../api/apiConfig");function i(){let e=new o.WFComponent("#openDeleteDialog"),t=document.getElementById("deleteUserDialog"),r=new o.WFComponent("#close-delete-dialog-btn"),n=new o.WFComponent("#deleteUserFinal"),i=new o.WFComponent("#deleteUserError"),l=new o.WFComponent(".page_main"),a=new o.WFComponent("#deleteRequestingAnimation");a.setStyle({display:"none"});let p=async()=>{try{i.setStyle({display:"none"}),a.setStyle({display:"flex"}),n.setAttribute("disabled","true");let e=await (0,s.apiClient).delete("/profiles").fetch();if(a.setStyle({display:"none"}),n.removeAttribute("disabled"),e&&200===e.status)window.location.href="/login";else throw Error("Unexpected response from the server.")}catch(e){console.error("Error deleting user account:",e),a.setStyle({display:"none"}),n.removeAttribute("disabled"),i.setStyle({display:"flex"}),i.getChildAsComponent(".error-text").setText(e.response?.data?.message||"An unexpected error occurred while deleting your account.")}};e.on("click",()=>{t&&l&&(t.showModal(),l.setAttribute("data-brand","6"))}),r.on("click",()=>{t&&l&&i&&(t.close(),l.setAttribute("data-brand","2"),i.setStyle({display:"none"}))}),n.on("click",p)}},{"@xatom/core":"65YBq","../../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=accountProfile.d64a0120.js.map
