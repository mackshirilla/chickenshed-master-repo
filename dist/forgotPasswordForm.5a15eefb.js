!function(e,t,r,o,n){var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i="function"==typeof a[o]&&a[o],s=i.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function c(t,r){if(!s[t]){if(!e[t]){var n="function"==typeof a[o]&&a[o];if(!r&&n)return n(t,!0);if(i)return i(t,!0);if(l&&"string"==typeof t)return l(t);var u=Error("Cannot find module '"+t+"'");throw u.code="MODULE_NOT_FOUND",u}d.resolve=function(r){var o=e[t][1][r];return null!=o?o:r},d.cache={};var p=s[t]=new c.Module(t);e[t][0].call(p.exports,d,p,p.exports,this)}return s[t].exports;function d(e){var t=d.resolve(e);return!1===t?{}:c(t)}}c.isParcelRequire=!0,c.Module=function(e){this.id=e,this.bundle=c,this.exports={}},c.modules=e,c.cache=s,c.parent=i,c.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(c,"root",{get:function(){return a[o]}}),a[o]=c;for(var u=0;u<t.length;u++)c(t[u])}({cv0S6:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"forgotPasswordForm",()=>c);var n=e("@xatom/core"),a=e("../../../utils/formUtils"),i=e("../../../utils/validationUtils"),s=e("../../../utils/recaptchaUtils"),l=e("../../../api/apiConfig");let c=()=>{let e=new n.WFFormComponent("#forgotPasswordForm"),t=[{input:new n.WFComponent("#emailInput"),error:new n.WFComponent("#emailInputError"),validationFn:i.validateEmail,message:"Please enter a valid email address."}],r=new n.WFComponent("#requestError"),o=new n.WFComponent("#requestingAnimation");t.slice(0).forEach(({input:e,error:t,validationFn:o,message:n})=>{(0,a.setupValidation)(e,t,(0,a.createValidationFunction)(e,o,n),r)}),e.onFormSubmit(async(i,c)=>{c.preventDefault();let u=!0;if(o.setStyle({display:"flex"}),(0,a.toggleError)(r,"",!1),t.forEach(({input:e,error:t,validationFn:r,message:o})=>{let n=(0,a.createValidationFunction)(e,r,o)();n?((0,a.toggleError)(t,n,!0),u=!1):(0,a.toggleError)(t,"",!1)}),!u){console.log("Validation failed:",i),(0,a.toggleError)(r,"Please correct all errors above.",!0),o.setStyle({display:"none"});return}if(!await (0,s.handleRecaptcha)("forgot_password")){(0,a.toggleError)(r,"reCAPTCHA verification failed.",!0),o.setStyle({display:"none"});return}console.log("Form data:",i=e.getFormData());try{let t=await (0,l.apiClient).post("/auth/forgot-password",{data:i}).fetch();if("success"===t.status){e.showSuccessState();let t=new n.WFComponent("#onSuccessTrigger");t.getElement()?.click()}else throw Error("Failed to create account.")}catch(e){console.error("Account creation failed:",e),(0,a.toggleError)(r,e.response.data.message||"Failed to create account.",!0),o.setStyle({display:"none"});return}finally{o.setStyle({display:"none"})}})}},{"@xatom/core":"65YBq","../../../utils/formUtils":"gepHz","../../../utils/validationUtils":"gu2z7","../../../utils/recaptchaUtils":"Jsdel","../../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gepHz:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"toggleError",()=>l),o.export(r,"setupValidation",()=>c),o.export(r,"createValidationFunction",()=>u),o.export(r,"createCheckboxValidationFunction",()=>p),o.export(r,"setupCheckboxValidation",()=>d),o.export(r,"validateSelectedSessions",()=>f),o.export(r,"setProfilePicUrl",()=>g),o.export(r,"setupFileUpload",()=>m),o.export(r,"formatPhoneNumber",()=>h);var n=e("@xatom/core"),a=e("@xatom/image"),i=e("../api/apiConfig"),s=e("../auth/authConfig");function l(e,t,r){e.updateTextViaAttrVar({text:r?t:""}),e.setStyle({display:r?"flex":"none"})}function c(e,t,r,o){let n=()=>{let e=r();l(t,e,!!e),o&&""===e&&l(o,"",!1)};e.on("input",n),e.on("blur",n),e.on("change",n)}function u(e,t,r){return()=>t(e.getElement().value)?"":r}function p(e,t){return()=>e.getElement().checked?"":t}function d(e,t,r){let o=p(e,r);c(e,t,o)}function f(e,t,r){let o=e.length>0&&e.some(e=>e.studentIds.length>0);return o?l(t,"",!1):l(t,r,!0),o}function g(e){let t=(0,s.userAuth).getUser();t&&t.profile&&(t.profile.profile_pic=t.profile.profile_pic||{url:""},t.profile.profile_pic.url=e,(0,s.userAuth).setUser(t),localStorage.setItem("auth_user",JSON.stringify(t)))}function m(e,t,r,o){let s=new a.WFImage("#profilePictureImage"),c=new n.WFComponent("#uploadAnimation"),u=new n.WFComponent(".drop-zone"),p=0;return new Promise(n=>{let a=a=>{if(!["image/jpeg","image/jpg"].includes(a.type)&&!/\.(jpg|jpeg)$/i.test(a.name)){l(t,"Only JPEG images are allowed.",!0),e.getElement().value="";return}if(a.size>2097152){l(t,"File size must be less than 2 MB.",!0),e.getElement().value="";return}c.setStyle({display:"flex"}),t.setStyle({display:"none"}),r.setStyle({display:"none"});let d=new FileReader;d.onload=e=>{let t=e.target?.result;s.setImage(t),u.setStyle({display:"none"})},d.readAsDataURL(a);let f=new FormData;f.append("profile_picture",a);let m=localStorage.getItem("current_student");if(m){let e=JSON.parse(m);f.append("student_profile_id",e.id.toString())}let h=(0,i.apiClient).post(o,{data:f});h.onData(o=>{if("success"===o.status){let e=o.url.profile_pic.url;g(e),s.setImage(e),localStorage.setItem("image_upload",e),r.setStyle({display:"flex"}),c.setStyle({display:"none"}),n(e)}else l(t,"Failed to upload profile picture.",!0),c.setStyle({display:"none"}),u.setStyle({display:"none"}),p=0,e.getElement().value=""}),h.onError(r=>{let o="An error occurred during image upload.";r.response&&r.response.data?o=r.response.data.message||o:r.message&&(o=r.message),l(t,o,!0),c.setStyle({display:"none"}),u.setStyle({display:"none"}),p=0,e.getElement().value=""}),h.fetch()};e.on("change",()=>{let t=e.getElement().files?.[0];t&&a(t)});let d=document.body;d.addEventListener("dragenter",e=>{e.preventDefault(),1==++p&&u.setStyle({display:"flex"})}),d.addEventListener("dragleave",()=>{--p<=0&&(u.setStyle({display:"none"}),p=0)}),d.addEventListener("dragover",e=>{e.preventDefault()}),d.addEventListener("drop",e=>{e.preventDefault();let t=e.dataTransfer?.files;t?.length&&a(t[0]),u.setStyle({display:"none"}),p=0})})}let h=e=>{let t=e.replace(/\D/g,"");return t.length<=3?t:t.length<=6?`(${t.slice(0,3)}) ${t.slice(3)}`:t.length<=10?`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6)}`:`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6,10)}`}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../api/apiConfig":"dUmIV","../auth/authConfig":"dHwPR","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,r){var o,n=e("d023971cccd819e3"),a={};Object.defineProperty(a,"WFImage",{get:()=>i,set:void 0,enumerable:!0,configurable:!0});class i extends n.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}o=t.exports,Object.keys(a).forEach(function(e){"default"===e||"__esModule"===e||o.hasOwnProperty(e)||Object.defineProperty(o,e,{enumerable:!0,get:function(){return a[e]}})})},{d023971cccd819e3:"65YBq"}],gu2z7:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");function n(e){return void 0!==e&&""!==e.trim()}function a(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}o.defineInteropFlag(r),o.export(r,"validateNotEmpty",()=>n),o.export(r,"validateEmail",()=>a),o.export(r,"validateEmailOptional",()=>i),o.export(r,"validatePasswordRequirements",()=>s),o.export(r,"validateCheckbox",()=>l),o.export(r,"validatePasswordsMatch",()=>c),o.export(r,"validateSelectField",()=>u),o.export(r,"validatePhoneNumber",()=>p),o.export(r,"validatePhoneNumberOptional",()=>d);let i=e=>""===e.trim()||a(e);function s(e){let t=/[a-z]/.test(e),r=/[A-Z]/.test(e),o=/\d/.test(e),n=/[!@#$%^&*(),.?":{}|<>]/.test(e),a=e.length>=8;return t&&r&&o&&n&&a}function l(e){return e}function c(e,t){return e===t}function u(e){return void 0!==e&&"N/A"!==e}function p(e){return/^\(\d{3}\)\s\d{3}-\d{4}$/.test(e)}let d=e=>""===e.trim()||p(e)},{"@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],Jsdel:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"getRecaptchaToken",()=>a),o.export(r,"validateRecaptchaToken",()=>i),o.export(r,"handleRecaptcha",()=>s);var n=e("../api/apiConfig");async function a(e){return new Promise((t,r)=>{grecaptcha.ready(()=>{grecaptcha.execute("6Lekaa8pAAAAAN6qiq0LSP5Akckql4Blg6K5ToUq",{action:e}).then(e=>{t(e)},r)})})}async function i(e){try{return await (0,n.apiClient).post("/recaptcha/validate",{data:{"g-recaptcha-response":e}}).fetch()}catch(e){throw Error(`ReCAPTCHA validation failed: ${e}`)}}async function s(e){try{let t=await a(e),r=await i(t);return"success"===r.status}catch(e){return console.error("ReCAPTCHA handling failed:",e),e.response&&console.error("Error response:",e.response),!1}}},{"../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=forgotPasswordForm.5a15eefb.js.map
