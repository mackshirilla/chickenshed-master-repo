!function(e,t,n,o,r){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof i[o]&&i[o],l=a.cache||{},s="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function d(t,n){if(!l[t]){if(!e[t]){var r="function"==typeof i[o]&&i[o];if(!n&&r)return r(t,!0);if(a)return a(t,!0);if(s&&"string"==typeof t)return s(t);var u=Error("Cannot find module '"+t+"'");throw u.code="MODULE_NOT_FOUND",u}c.resolve=function(n){var o=e[t][1][n];return null!=o?o:n},c.cache={};var p=l[t]=new d.Module(t);e[t][0].call(p.exports,c,p,p.exports,this)}return l[t].exports;function c(e){var t=c.resolve(e);return!1===t?{}:d(t)}}d.isParcelRequire=!0,d.Module=function(e){this.id=e,this.bundle=d,this.exports={}},d.modules=e,d.cache=l,d.parent=a,d.register=function(t,n){e[t]=[function(e,t){t.exports=n},{}]},Object.defineProperty(d,"root",{get:function(){return i[o]}}),i[o]=d;for(var u=0;u<t.length;u++)d(t[u])}({hmkpP:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeStudentProfilePage",()=>c);var r=e("./getStudentDetails"),i=e("./editStudentDialog"),a=e("./editEmergencyDialog"),l=e("./studentRegistrations"),s=e("./deleteStudent"),d=e("./caregiverView"),u=e("./registrationBreadcrumbs"),p=e("./listStudentFiles");let c=async()=>{let e=new URLSearchParams(window.location.search).get("id");if(!e){console.error("No student ID provided in the URL.");return}let t=parseInt(e,10);await (0,r.getStudentDetails)(t),(0,d.initializeCaregiverView)(),await (0,i.initializeEditStudentDialog)(t),await (0,a.initializeEditEmergencyDialog)(t),await (0,p.initializeDynamicStudentFileList)("#filesList"),(0,l.initializeStudentRegistrations)(t),(0,s.initializeDeleteStudent)(t),(0,u.initializeRegistrationBreadcrumbs)(),window.addEventListener("beforeunload",()=>{localStorage.removeItem("current_student")})}},{"./getStudentDetails":"dHqSp","./editStudentDialog":"3iajS","./editEmergencyDialog":"5x0QN","./studentRegistrations":"ldRWJ","./deleteStudent":"cDWYt","./caregiverView":"9Px6R","./registrationBreadcrumbs":"8g6ag","./listStudentFiles":"9uLdx","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],dHqSp:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"getStudentDetails",()=>l);var r=e("../../../api/apiConfig"),i=e("@xatom/core"),a=e("@xatom/image");let l=async e=>{let t=new i.WFComponent(".dashboard_loading_wall");console.log("Displaying loading spinner"),t.setStyle({display:"flex"});try{let t=await (0,r.apiClient).get(`/dashboard/profiles/student/${e}`).fetch();if(t){s(".success_trigger"),new i.WFComponent("#studentBreadcrumb").setText(`${t.first_name} ${t.last_name}`),new i.WFComponent("#studentFullName").setText(`${t.first_name} ${t.last_name}`);let e=new a.WFImage("#studentProfilePicture");t.profile_pic&&t.profile_pic.url?e.setImage(t.profile_pic.url):e.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840cb14_The+Shed+-+97.jpg"),new i.WFComponent("#studentEmail").setText(t.email||"N/A"),new i.WFComponent("#studentPhone").setText(t.phone||"N/A"),new i.WFComponent("#studentDob").setText(t.dob||"N/A"),new i.WFComponent("#studentGender").setText(t.gender||"N/A"),new i.WFComponent("#studentSchool").setText(t.school||"N/A"),new i.WFComponent("#studentGrade").setText(t.grade||"N/A"),new i.WFComponent("#studentEthnicity").setText(t.ethnicity||"N/A"),new i.WFComponent("#studentHealth").setText(t.health||"N/A"),new i.WFComponent("#studentDismissal").setText(t.dismissal_names||"N/A");let n=new i.WFComponent("#studentTextTrue"),o=new i.WFComponent("#studentTextFalse");t.send_texts?(n.setStyle({display:"block"}),o.setStyle({display:"none"})):(n.setStyle({display:"none"}),o.setStyle({display:"block"}));let r=new i.WFComponent("#studentTravelTrue"),l=new i.WFComponent("#studentTravelFalse");t.independent_travel?(r.setStyle({display:"block"}),l.setStyle({display:"none"})):(r.setStyle({display:"none"}),l.setStyle({display:"block"}));let d=new i.WFComponent("#studentPhotoTrue"),u=new i.WFComponent("#studentPhotoFalse");t.photo_release?(d.setStyle({display:"block"}),u.setStyle({display:"none"})):(d.setStyle({display:"none"}),u.setStyle({display:"block"}));let p=new i.WFComponent("#studentApprovedPill"),c=new i.WFComponent("#studentPendingPill");"Approved"===t.Status?(p.setStyle({display:"block"}),c.setStyle({display:"none"})):(p.setStyle({display:"none"}),c.setStyle({display:"block"})),localStorage.setItem("current_student",JSON.stringify(t))}else alert("Error: Received null response from the server."),console.error("Received null response from the server."),window.history.back()}catch(e){console.error("Error fetching student details:",e),alert(`Error fetching student details: ${e.message||e}`),window.history.back()}finally{t.setStyle({display:"none"})}},s=e=>{let t=document.querySelector(e);t instanceof HTMLElement&&t.click()}},{"../../../api/apiConfig":"dUmIV","@xatom/core":"65YBq","@xatom/image":"bavwf","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,n){var o,r=e("d023971cccd819e3"),i={};Object.defineProperty(i,"WFImage",{get:()=>a,set:void 0,enumerable:!0,configurable:!0});class a extends r.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}o=t.exports,Object.keys(i).forEach(function(e){"default"===e||"__esModule"===e||o.hasOwnProperty(e)||Object.defineProperty(o,e,{enumerable:!0,get:function(){return i[e]}})})},{d023971cccd819e3:"65YBq"}],"3iajS":[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeEditStudentDialog",()=>u);var r=e("@xatom/core"),i=e("@xatom/image"),a=e("../../../api/apiConfig"),l=e("../../../utils/formUtils"),s=e("../../../utils/validationUtils"),d=e("./getStudentDetails");let u=e=>{let t=null;try{t=new r.WFComponent("#openEditStudentDialog")}catch(e){console.warn("Element #openEditStudentDialog not found. Skipping initialization of edit dialog opener.")}let n=document.getElementById("editStudentDialog"),o=null;try{o=new r.WFComponent("#close-dialog-btn")}catch(e){console.warn("Element #close-dialog-btn not found. Skipping initialization of dialog closer.")}t&&n&&t.on("click",()=>{p(),n.showModal()}),o&&n&&o.on("click",()=>{n.close()});let i=null;try{i=new r.WFFormComponent("#editStudentForm")}catch(e){console.warn("Element #editStudentForm not found. Skipping form initialization.")}let u=null;try{u=new r.WFComponent("#editStudentSubmitError")}catch(e){console.warn("Element #editStudentSubmitError not found. Skipping initialization of form submission error display.")}let c=i?[{input:new r.WFComponent("#firstNameInput"),error:new r.WFComponent("#firstNameInputError"),validationFn:s.validateNotEmpty,message:"First name is required"},{input:new r.WFComponent("#lastNameInput"),error:new r.WFComponent("#lastNameInputError"),validationFn:s.validateNotEmpty,message:"Last name is required"},{input:new r.WFComponent("#emailInput"),error:new r.WFComponent("#emailInputError"),validationFn:s.validateEmailOptional,message:"Invalid email format"},{input:new r.WFComponent("#phoneNumberInput"),error:new r.WFComponent("#phoneNumberInputError"),validationFn:s.validatePhoneNumber,message:"Phone number must be in the format (xxx) xxx-xxxx"},{input:new r.WFComponent("#dobInput"),error:new r.WFComponent("#dobInputError"),validationFn:s.validateNotEmpty,message:"Date of birth is required"},{input:new r.WFComponent("#genderInput"),error:new r.WFComponent("#genderInputError"),validationFn:s.validateSelectField,message:"Please select a gender"},{input:new r.WFComponent("#schoolInput"),error:new r.WFComponent("#schoolInputError"),validationFn:s.validateNotEmpty,message:"School is required"},{input:new r.WFComponent("#gradeInput"),error:new r.WFComponent("#gradeInputError"),validationFn:s.validateSelectField,message:"Please select a grade"},{input:new r.WFComponent("#healthInput"),error:new r.WFComponent("#healthInputError"),validationFn:s.validateNotEmpty,message:"Health information is required"},{input:new r.WFComponent("#dismissalNamesInput"),error:new r.WFComponent("#dismissalNamesInputError"),validationFn:s.validateNotEmpty,message:"Dismissal names are required"},{input:new r.WFComponent("#familyInvolvedInput"),error:new r.WFComponent("#familyInvolvedInputError"),validationFn:s.validateNotEmpty,message:"Family involvement information is required"}]:[];i&&u&&c.forEach(({input:e,error:t,validationFn:n,message:o})=>{try{(0,l.setupValidation)(e,t,(0,l.createValidationFunction)(e,n,o),u)}catch(e){console.warn(`Validation setup failed for one of the fields: ${o}. Error:`,e)}});try{new r.WFComponent("#sendTextsInput")}catch(e){console.warn("Element #sendTextsInput not found. Skipping initialization of sendTextsInput.")}try{new r.WFComponent("#independentTravelInput")}catch(e){console.warn("Element #independentTravelInput not found. Skipping initialization of independentTravelInput.")}try{new r.WFComponent("#photoReleaseInput")}catch(e){console.warn("Element #photoReleaseInput not found. Skipping initialization of photoReleaseInput.")}i&&u&&i.onFormSubmit(async(t,o)=>{o.preventDefault();let i=null;try{(i=new r.WFComponent("#requestingAnimation")).setStyle({display:"block"})}catch(e){console.warn("Element #requestingAnimation not found. Skipping loading animation.")}let s=!0;if(c.forEach(({input:e,error:t,validationFn:n,message:o})=>{try{let r=(0,l.createValidationFunction)(e,n,o)();r?((0,l.toggleError)(t,r,!0),s=!1):(0,l.toggleError)(t,"",!1)}catch(e){console.warn(`Validation failed for field "${o}". Error:`,e),s=!1}}),s)(0,l.toggleError)(u,"",!1);else{(0,l.toggleError)(u,"Please correct all errors above.",!0),i&&i.setStyle({display:"none"});return}let m=null;try{(m=new r.WFComponent("#editStudentSubmitButton")).setAttribute("disabled","true")}catch(e){console.warn("Element #editStudentSubmitButton not found. Skipping disabling the submit button.")}let g={...t};try{let t=await (0,a.apiClient).post(`/profiles/students/update_profile/${e}`,{data:g}).fetch();if("success"===t.status)await (0,d.getStudentDetails)(e),p(),n&&n.close();else throw Error(t.message||"Update failed")}catch(e){console.error("Error updating student profile:",e),(0,l.toggleError)(u,e.message||"An error occurred",!0)}finally{i&&i.setStyle({display:"none"}),m&&m.removeAttribute("disabled")}});try{let e=new r.WFComponent("#profilePictureInput"),t=new r.WFComponent("#profilePictureInputError"),n=new r.WFComponent("#profilePictureInputSuccess");(0,l.setupFileUpload)(e,t,n,"/profiles/students/image-upload")}catch(e){console.warn("One or more profile picture upload elements not found. Skipping file upload setup.")}},p=()=>{let e;let t=localStorage.getItem("current_student");if(!t){console.error("No student data found");return}try{e=JSON.parse(t)}catch(e){console.error("Error parsing student data from localStorage:",e);return}console.log("Populating form with student data:",e);let n=(e,t,n=!1)=>{try{let o=document.querySelector(e);o?n&&o instanceof HTMLInputElement?(o.checked=!!t,console.log(`Set checkbox ${e} to`,t)):o instanceof HTMLInputElement||o instanceof HTMLSelectElement||o instanceof HTMLTextAreaElement?(o.value=String(t),console.log(`Set value of ${e} to`,t)):console.warn(`Element ${e} is not an input, select, or textarea. Skipping setting its value.`):console.warn(`Element ${e} not found. Skipping setting its value.`)}catch(t){console.warn(`Error setting value for ${e}:`,t)}};n("#firstNameInput",e.first_name),n("#lastNameInput",e.last_name),n("#emailInput",e.email),n("#phoneNumberInput",e.phone),n("#sendTextsInput",e.send_texts,!0),n("#dobInput",e.dob),n("#genderInput",e.gender),n("#schoolInput",e.school),n("#gradeInput",e.grade),n("#healthInput",e.health),n("#dismissalNamesInput",e.dismissal_names),n("#independentTravelInput",e.independent_travel,!0),n("#familyInvolvedInput",e.family_involved),n("#photoReleaseInput",e.photo_release,!0);try{let t=new i.WFImage("#profilePictureImage");e.profile_pic&&e.profile_pic.url?(t.setImage(e.profile_pic.url),console.log("Set profile picture to:",e.profile_pic.url)):(t.setImage("default-image-url"),console.log("Set profile picture to default-image-url"))}catch(e){console.warn("Element #profilePictureImage not found. Skipping setting profile picture.")}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../../api/apiConfig":"dUmIV","../../../utils/formUtils":"gepHz","../../../utils/validationUtils":"gu2z7","./getStudentDetails":"dHqSp","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gepHz:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"toggleError",()=>s),o.export(n,"setupValidation",()=>d),o.export(n,"createValidationFunction",()=>u),o.export(n,"createCheckboxValidationFunction",()=>p),o.export(n,"setupCheckboxValidation",()=>c),o.export(n,"validateSelectedSessions",()=>m),o.export(n,"setProfilePicUrl",()=>g),o.export(n,"setupFileUpload",()=>f),o.export(n,"formatPhoneNumber",()=>h);var r=e("@xatom/core"),i=e("@xatom/image"),a=e("../api/apiConfig"),l=e("../auth/authConfig");function s(e,t,n){e.updateTextViaAttrVar({text:n?t:""}),e.setStyle({display:n?"flex":"none"})}function d(e,t,n,o){let r=()=>{let e=n();s(t,e,!!e),o&&""===e&&s(o,"",!1)};e.on("input",r),e.on("blur",r),e.on("change",r)}function u(e,t,n){return()=>t(e.getElement().value)?"":n}function p(e,t){return()=>e.getElement().checked?"":t}function c(e,t,n){let o=p(e,n);d(e,t,o)}function m(e,t,n){let o=e.length>0&&e.some(e=>e.studentIds.length>0);return o?s(t,"",!1):s(t,n,!0),o}function g(e){let t=(0,l.userAuth).getUser();t&&t.profile&&(t.profile.profile_pic=t.profile.profile_pic||{url:""},t.profile.profile_pic.url=e,(0,l.userAuth).setUser(t),localStorage.setItem("auth_user",JSON.stringify(t)))}function f(e,t,n,o){let l=new i.WFImage("#profilePictureImage"),d=new r.WFComponent("#uploadAnimation"),u=new r.WFComponent(".drop-zone"),p=0;return new Promise(r=>{let i=i=>{if(!["image/jpeg","image/jpg"].includes(i.type)&&!/\.(jpg|jpeg)$/i.test(i.name)){s(t,"Only JPEG images are allowed.",!0),e.getElement().value="";return}if(i.size>2097152){s(t,"File size must be less than 2 MB.",!0),e.getElement().value="";return}d.setStyle({display:"flex"}),t.setStyle({display:"none"}),n.setStyle({display:"none"});let c=new FileReader;c.onload=e=>{let t=e.target?.result;l.setImage(t),u.setStyle({display:"none"})},c.readAsDataURL(i);let m=new FormData;m.append("profile_picture",i);let f=localStorage.getItem("current_student");if(f){let e=JSON.parse(f);m.append("student_profile_id",e.id.toString())}let h=(0,a.apiClient).post(o,{data:m});h.onData(o=>{if("success"===o.status){let e=o.url.profile_pic.url;g(e),l.setImage(e),localStorage.setItem("image_upload",e),n.setStyle({display:"flex"}),d.setStyle({display:"none"}),r(e)}else s(t,"Failed to upload profile picture.",!0),d.setStyle({display:"none"}),u.setStyle({display:"none"}),p=0,e.getElement().value=""}),h.onError(n=>{let o="An error occurred during image upload.";n.response&&n.response.data?o=n.response.data.message||o:n.message&&(o=n.message),s(t,o,!0),d.setStyle({display:"none"}),u.setStyle({display:"none"}),p=0,e.getElement().value=""}),h.fetch()};e.on("change",()=>{let t=e.getElement().files?.[0];t&&i(t)});let c=document.body;c.addEventListener("dragenter",e=>{e.preventDefault(),1==++p&&u.setStyle({display:"flex"})}),c.addEventListener("dragleave",()=>{--p<=0&&(u.setStyle({display:"none"}),p=0)}),c.addEventListener("dragover",e=>{e.preventDefault()}),c.addEventListener("drop",e=>{e.preventDefault();let t=e.dataTransfer?.files;t?.length&&i(t[0]),u.setStyle({display:"none"}),p=0})})}let h=e=>{let t=e.replace(/\D/g,"");return t.length<=3?t:t.length<=6?`(${t.slice(0,3)}) ${t.slice(3)}`:t.length<=10?`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6)}`:`(${t.slice(0,3)}) ${t.slice(3,6)}-${t.slice(6,10)}`}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../api/apiConfig":"dUmIV","../auth/authConfig":"dHwPR","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],gu2z7:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");function r(e){return void 0!==e&&""!==e.trim()}function i(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}o.defineInteropFlag(n),o.export(n,"validateNotEmpty",()=>r),o.export(n,"validateEmail",()=>i),o.export(n,"validateEmailOptional",()=>a),o.export(n,"validatePasswordRequirements",()=>l),o.export(n,"validateCheckbox",()=>s),o.export(n,"validatePasswordsMatch",()=>d),o.export(n,"validateSelectField",()=>u),o.export(n,"validatePhoneNumber",()=>p);let a=e=>""===e.trim()||i(e);function l(e){let t=/[a-z]/.test(e),n=/[A-Z]/.test(e),o=/\d/.test(e),r=/[!@#$%^&*(),.?":{}|<>]/.test(e),i=e.length>=8;return t&&n&&o&&r&&i}function s(e){return e}function d(e,t){return e===t}function u(e){return void 0!==e&&"N/A"!==e}function p(e){return/^\(\d{3}\)\s\d{3}-\d{4}$/.test(e)}},{"@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"5x0QN":[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeEditEmergencyDialog",()=>d);var r=e("@xatom/core"),i=e("../../../api/apiConfig"),a=e("../../../utils/formUtils"),l=e("../../../utils/validationUtils"),s=e("./getStudentDetails");let d=e=>{let t=new r.WFComponent("#openEmergencyContactDialog"),n=document.getElementById("editEmergencyContactDialog"),o=new r.WFComponent("#close-emergency-dialog-btn");t.on("click",async()=>{await (0,s.getStudentDetails)(e),u(),p(),n.showModal()}),o.on("click",()=>{n.close()});let d=new r.WFFormComponent("#editEmergencyContactForm"),c=new r.WFComponent("#editEmergencySubmitError"),m=[{input:new r.WFComponent("#emergencyFirstNameInput"),error:new r.WFComponent("#emergencyFirstNameInputError"),validationFn:l.validateNotEmpty,message:"First name is required"},{input:new r.WFComponent("#emergencyLastNameInput"),error:new r.WFComponent("#emergencyLastNameInputError"),validationFn:l.validateNotEmpty,message:"Last name is required"},{input:new r.WFComponent("#emergencyEmailInput"),error:new r.WFComponent("#emergencyEmailInputError"),validationFn:l.validateEmailOptional,message:"Invalid email format"},{input:new r.WFComponent("#emergencyPhoneInput"),error:new r.WFComponent("#emergencyPhoneInputError"),validationFn:l.validatePhoneNumber,message:"Phone number must be in the format (xxx) xxx-xxxx"},{input:new r.WFComponent("#emergencyRelationshipInput"),error:new r.WFComponent("#emergencyRelationshipInputError"),validationFn:l.validateNotEmpty,message:"Relationship is required"}];m.forEach(({input:e,error:t,validationFn:n,message:o})=>{(0,a.setupValidation)(e,t,(0,a.createValidationFunction)(e,n,o),c)}),d.onFormSubmit(async(t,o)=>{o.preventDefault();let l=!0;if(m.forEach(({input:e,error:t,validationFn:n,message:o})=>{let r=(0,a.createValidationFunction)(e,n,o)();r?((0,a.toggleError)(t,r,!0),l=!1):(0,a.toggleError)(t,"",!1)}),l)(0,a.toggleError)(c,"",!1);else{(0,a.toggleError)(c,"Please correct all errors above.",!0);return}let d=new r.WFComponent("#requestingEmergencyAnimation");d.setStyle({display:"block"});let g=new r.WFComponent("#editEmergencySubmitButton");g.setAttribute("disabled","true");let f={...t};try{let t=await (0,i.apiClient).post(`/profiles/students/update_profile/${e}`,{data:f}).fetch();if("success"===t.status)await (0,s.getStudentDetails)(e),u(),p(),n.close();else throw Error(t.message||"Update failed")}catch(e){console.error("Error updating emergency contact:",e),(0,a.toggleError)(c,e.message||"An error occurred",!0)}finally{d.setStyle({display:"none"}),g.removeAttribute("disabled")}}),p()},u=()=>{let e=localStorage.getItem("current_student");if(!e){console.error("No student data found");return}let t=JSON.parse(e);new(0,r.WFComponent)("#emergencyFirstNameInput").getElement().value=t.emergency_first_name||"",new(0,r.WFComponent)("#emergencyLastNameInput").getElement().value=t.emergency_last_name||"",new(0,r.WFComponent)("#emergencyEmailInput").getElement().value=t.emergency_email||"",new(0,r.WFComponent)("#emergencyPhoneInput").getElement().value=t.emergency_phone||"",new(0,r.WFComponent)("#emergencyRelationshipInput").getElement().value=t.emergency_relationship||""},p=()=>{let e=localStorage.getItem("current_student");if(!e){console.error("No student data found");return}let t=JSON.parse(e),n=`${t.emergency_first_name||""} ${t.emergency_last_name||""}`.trim();new r.WFComponent("#emergencyContactFullName").setText(n)}},{"@xatom/core":"65YBq","../../../api/apiConfig":"dUmIV","../../../utils/formUtils":"gepHz","../../../utils/validationUtils":"gu2z7","./getStudentDetails":"dHqSp","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],ldRWJ:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"fetchStudentRegistrations",()=>l),o.export(n,"initializeStudentRegistrations",()=>s);var r=e("@xatom/core"),i=e("@xatom/image"),a=e("../../../api/apiConfig");async function l(e){try{let t=await (0,a.apiClient).get(`/dashboard/profiles/student/${e}/registrations`).fetch();if(t)return t;return console.error("No registrations found for the student."),[]}catch(e){return console.error("Error fetching student registrations:",e),[]}}async function s(e){let t=new r.WFDynamicList("#listRegistration",{rowSelector:"#listRegistrationCard",loaderSelector:"#listRegistrationloading",emptySelector:"#listRegistrationEmpty"});t.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),t.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),t.rowRenderer(({rowData:e,rowElement:t})=>{let n=new r.WFComponent(t),o=localStorage.getItem("current_student"),a="N/A";if(o)try{let e=JSON.parse(o);a=`${e.first_name||""} ${e.last_name||""}`.trim()||"N/A"}catch(e){console.error("Error parsing current_student from localStorage:",e)}else console.warn("current_student not found in localStorage.");let l=`/dashboard/registration/subscription/workshop?program=${encodeURIComponent(e.program_id)}&subscription=${encodeURIComponent(e.subscription_id)}`;e.workshop_id&&""!==e.workshop_id.trim()&&(l+=`&workshop=${encodeURIComponent(e.workshop_id)}`),n.setAttribute("href",l),n.addCssClass("registration-link"),n.setAttribute("data-student-id",String(e.student_profile_id)),n.setAttribute("data-student-name",a),n.setAttribute("data-workshop-name",e.workshop_name||""),n.setAttribute("data-workshop-id",e.workshop_id||""),n.setAttribute("data-program-name",e.program_name||""),n.setAttribute("data-program-id",e.program_id||""),n.setAttribute("data-subscription-id",String(e.subscription_id));let s=n.getChildAsComponent("#cardProgramName");s?s.setText(e.program_name||"N/A"):console.warn("#cardProgramName not found in registrationCard.");let d=n.getChildAsComponent("#cardWorkshopName");d?d.setText(e.workshop_name||" "):console.warn("#cardWorkshopName not found in registrationCard.");let u=n.getChildAsComponent("#cardRegistrationImage");if(u){let t=new i.WFImage(u.getElement());e.image_url?t.setImage(e.image_url):t.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg")}else console.warn("#cardRegistrationImage not found in registrationCard.");let p=n.getChildAsComponent("#cardActivePill"),c=n.getChildAsComponent("#cardDepositPill");return p&&c?"Active"===e.status?(p.setStyle({display:"block"}),c.setStyle({display:"none"})):"Deposit Paid"===e.status?(p.setStyle({display:"none"}),c.setStyle({display:"block"})):(p.setStyle({display:"none"}),c.setStyle({display:"none"})):console.warn("Status pills (#cardActivePill or #cardDepositPill) not found in registrationCard."),t.setStyle({display:"block"}),t});try{t.changeLoadingStatus(!0);let n=await l(e);n.sort((e,t)=>t.created_at-e.created_at),t.setData(n),t.changeLoadingStatus(!1)}catch(e){console.error("Error initializing student registrations:",e),t.setData([]),t.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],cDWYt:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeDeleteStudent",()=>l);var r=e("@xatom/core"),i=e("../../../api/apiConfig"),a=e("./studentRegistrations");function l(e){let t=null;try{t=new r.WFComponent("#openDeleteDialog")}catch(e){console.warn("Element #openDeleteDialog not found. Skipping initialization of delete dialog opener.")}let n=document.getElementById("deleteStudentDialog"),o=null;try{o=new r.WFComponent("#close-delete-dialog-btn")}catch(e){console.warn("Element #close-delete-dialog-btn not found. Skipping initialization of delete dialog closer.")}let l=null;try{l=new r.WFComponent("#deleteStudentFinal")}catch(e){console.warn("Element #deleteStudentFinal not found. Skipping initialization of final delete button.")}let s=null;try{s=new r.WFComponent("#deleteStudentError")}catch(e){console.warn("Element #deleteStudentError not found. Skipping initialization of delete student error display.")}let d=null;try{d=new r.WFComponent(".page_main")}catch(e){console.warn("Element with class .page_main not found. Skipping initialization of page main.")}let u=null,p=null;try{u=new r.WFComponent("#requestingAnimation"),p=new r.WFComponent("#deleteRequestingAnimation"),u.setStyle({display:"none"}),p.setStyle({display:"none"})}catch(e){console.warn("Loader animation elements not found. Skipping initialization of loader animations.")}let c=async()=>{try{if((await (0,a.fetchStudentRegistrations)(e)).length>0){alert("You must remove this student from any current registrations before you may delete them.");return}s&&s.setStyle({display:"none"}),p&&l&&(p.setStyle({display:"flex"}),l.setAttribute("disabled","true"));let t=await (0,i.apiClient).delete(`/profiles/student/${e}`).fetch();if(p&&l&&(p.setStyle({display:"none"}),l.removeAttribute("disabled")),t&&200===t.status)alert("Student has been successfully deleted."),window.location.href="/dashboard";else throw Error("Unexpected response from the server.")}catch(e){if(console.error("Error deleting student:",e),p&&l&&(p.setStyle({display:"none"}),l.removeAttribute("disabled")),s){s.setStyle({display:"flex"});try{s.getChildAsComponent(".error-text").setText(e.message||"An unexpected error occurred while deleting the student.")}catch(e){console.warn("Could not set text for .error-text within #deleteStudentError:",e)}}}};t&&n&&d?t.on("click",()=>{n&&d?(n.showModal(),d.setAttribute("data-brand","6")):console.warn("Cannot show delete dialog because either deleteStudentDialogElement or pageMain is not available.")}):console.warn("Cannot attach click event to #openDeleteDialog because required elements are missing."),o&&n&&d&&s?o.on("click",()=>{n&&d&&s?(n.close(),d.setAttribute("data-brand","2"),s.setStyle({display:"none"})):console.warn("Cannot hide delete dialog because either deleteStudentDialogElement, pageMain, or deleteStudentError is not available.")}):console.warn("Cannot attach click event to #close-delete-dialog-btn because required elements are missing."),l?l.on("click",c):console.warn("Cannot attach click event to #deleteStudentFinal because the element is missing.")}},{"@xatom/core":"65YBq","../../../api/apiConfig":"dUmIV","./studentRegistrations":"ldRWJ","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"9Px6R":[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeCaregiverView",()=>i);var r=e("@xatom/core");let i=()=>{let e;let t=localStorage.getItem("current_student");if(!t){console.error("No student data found in localStorage.");return}try{e=JSON.parse(t)}catch(e){console.error("Error parsing student data from localStorage:",e);return}if(!0===e.caregiver){["#openEditStudentDialog","#openDeleteDialog","#editEmergencySubmitButton","#editStudentDialog","#deleteStudentDialog"].forEach(e=>{try{new r.WFComponent(e).remove(),console.log(`Removed element with selector: ${e}`)}catch(t){console.error(`Failed to remove element with selector ${e}:`,t)}});try{new r.WFFormComponent("#editEmergencyContactForm").disableForm(),console.log("Disabled #editEmergencyContactForm to prevent submissions.")}catch(e){console.error("Failed to disable #editEmergencyContactForm:",e)}}else console.log("Current user is not a caregiver. No changes applied.")}},{"@xatom/core":"65YBq","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"8g6ag":[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"initializeRegistrationBreadcrumbs",()=>r);let r=()=>{let e=e=>{let t=e.target.closest(".registration-link");if(!t){console.warn("Clicked element is not a registration link.");return}let n=parseInt(t.getAttribute("data-student-id")||"0",10),o=t.getAttribute("data-student-name")||"",r=t.getAttribute("data-workshop-name")||"",i=t.getAttribute("data-workshop-id")||"",a=t.getAttribute("data-program-name")||"",l=t.getAttribute("data-program-id")||"",s=parseInt(t.getAttribute("data-subscription-id")||"0",10);if(!n||!o||!a||!l||!s){console.error("Incomplete registration data. Cannot set caregiver_breadcrumbs.");return}let d={student_id:n,student_name:o,workshop_name:r,workshop_id:i,program_name:a,program_id:l,subscription_id:s};try{localStorage.setItem("caregiver_breadcrumbs",JSON.stringify(d)),console.log("caregiver_breadcrumbs set in localStorage:",d)}catch(e){console.error("Failed to set caregiver_breadcrumbs in localStorage:",e)}};(()=>{let t=document.body;if(!t){console.error("Common ancestor for event delegation not found.");return}t.addEventListener("click",e),console.log("Event listener for registration links attached.")})()}},{"@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"9uLdx":[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(n),o.export(n,"fetchStudentFiles",()=>a),o.export(n,"initializeDynamicStudentFileList",()=>l);var r=e("@xatom/core"),i=e("../../../api/apiConfig");async function a(e){try{let t=(0,i.apiClient).get(`/student_files/student/${e}`);return await t.fetch()}catch(e){throw console.error("Error fetching files for student:",e),e}}async function l(e){let t=new URLSearchParams(window.location.search).get("id");if(!t){console.error("No student ID provided in URL");return}let n=new r.WFDynamicList(e,{rowSelector:"#fileCard",loaderSelector:"#filesloading",emptySelector:"#filesEmpty"});n.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),n.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),n.rowRenderer(({rowData:e,rowElement:t})=>{let n=new r.WFComponent(t);return n.setAttribute("href",e.file_url),n.getChildAsComponent("#fileName").setText(e.file_name),t.setStyle({display:"block"}),t});try{n.changeLoadingStatus(!0);let e=await a(t);e.sort((e,t)=>e.file_name.localeCompare(t.file_name)),n.setData(e),n.changeLoadingStatus(!1)}catch(e){console.error("Error loading files:",e),n.setData([]),n.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","../../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}]},[],0,"parcelRequired346");
//# sourceMappingURL=studentProfile.62a7da56.js.map
