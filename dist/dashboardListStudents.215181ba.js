// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"24NmN":[function(require,module,exports) {
// src/pages/list-student-profiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "listStudentProfilesPage", ()=>listStudentProfilesPage);
var _listStudents = require("../dashboard/listStudents");
var _listAdditionalStudents = require("../dashboard/listAdditionalStudents");
var _listCaregivers = require("../dashboard/listCaregivers");
var _listCaregivingFor = require("../dashboard/listCaregivingFor");
const listStudentProfilesPage = async ()=>{
    console.log("List Student Profiles Page loaded");
    try {
        console.log("Initializing student list");
        await (0, _listStudents.initializeDynamicStudentList)("#listStudentProfiles");
        await (0, _listAdditionalStudents.initializeDynamicAdditionalStudentList)("#listAdditionalStudentProfiles");
        await (0, _listCaregivers.initializeDynamicCaregiverList)("#caregiversList");
        await (0, _listCaregivingFor.initializeDynamicCaregivingForList)("#caregivingForList");
        console.log("Dynamic student lists initialized successfully");
    } catch (error) {
        console.error("Error initializing dynamic student lists:", error);
    }
};

},{"../dashboard/listStudents":"4NIcD","../dashboard/listAdditionalStudents":"f8tcP","../dashboard/listCaregivers":"18rDE","../dashboard/listCaregivingFor":"h2FUJ","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "toggleError", ()=>toggleError);
parcelHelpers.export(exports, "setupValidation", ()=>setupValidation);
parcelHelpers.export(exports, "createValidationFunction", ()=>createValidationFunction);
parcelHelpers.export(exports, "createCheckboxValidationFunction", ()=>createCheckboxValidationFunction);
parcelHelpers.export(exports, "setupCheckboxValidation", ()=>setupCheckboxValidation);
parcelHelpers.export(exports, "validateSelectedSessions", ()=>validateSelectedSessions);
/**
 * Updates the user's profile picture URL in the authentication system.
 * @param {string} imageUrl - The URL of the uploaded image.
 */ parcelHelpers.export(exports, "setProfilePicUrl", ()=>setProfilePicUrl);
/**
 * Handles file upload and displays the uploaded image.
 * @param {WFComponent} fileInput - The WFComponent instance for the file input field.
 * @param {WFComponent} fileInputError - The WFComponent instance for displaying error messages.
 * @param {WFComponent} fileInputSuccess - The WFComponent instance for displaying success messages.
 * @param {string} uploadEndpoint - The endpoint to which the file is sent.
 * @returns {Promise<string>} A promise that resolves with the URL of the uploaded image.
 */ parcelHelpers.export(exports, "setupFileUpload", ()=>setupFileUpload);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../api/apiConfig");
var _authConfig = require("../auth/authConfig");
function toggleError(errorMessageComponent, message, show) {
    errorMessageComponent.updateTextViaAttrVar({
        text: show ? message : ""
    });
    errorMessageComponent.setStyle({
        display: show ? "flex" : "none"
    });
}
function setupValidation(inputComponent, errorComponent, validate, requestErrorComponent // Optional component to clear on input change
) {
    const validateAndUpdate = ()=>{
        const errorMessage = validate();
        toggleError(errorComponent, errorMessage, !!errorMessage);
        if (requestErrorComponent && errorMessage === "") // Clear request error message when the user is correcting the input
        toggleError(requestErrorComponent, "", false);
    };
    // Attach event listeners for real-time validation
    inputComponent.on("input", validateAndUpdate);
    inputComponent.on("blur", validateAndUpdate);
    inputComponent.on("change", validateAndUpdate);
}
function createValidationFunction(inputComponent, validationFn, errorMessage) {
    return ()=>{
        const inputElement = inputComponent.getElement();
        const isValid = validationFn(inputElement.value);
        return isValid ? "" : errorMessage;
    };
}
function createCheckboxValidationFunction(checkboxComponent, errorMessage) {
    return ()=>{
        const checkbox = checkboxComponent.getElement();
        return checkbox.checked ? "" : errorMessage;
    };
}
function setupCheckboxValidation(checkboxComponent, checkboxErrorComponent, errorMessage) {
    const validate = createCheckboxValidationFunction(checkboxComponent, errorMessage);
    setupValidation(checkboxComponent, checkboxErrorComponent, validate);
}
function validateSelectedSessions(selectedSessions, errorMessageComponent, errorMessage) {
    const isValid = selectedSessions.length > 0 && selectedSessions.some((session)=>session.studentIds.length > 0);
    if (!isValid) toggleError(errorMessageComponent, errorMessage, true);
    else toggleError(errorMessageComponent, "", false);
    return isValid;
}
function setProfilePicUrl(imageUrl) {
    const user = (0, _authConfig.userAuth).getUser();
    if (user && user.profile) {
        // Ensure the profile_picture object exists
        user.profile.profile_pic = user.profile.profile_pic || {
            url: ""
        };
        // Set the profile picture URL
        user.profile.profile_pic.url = imageUrl;
        (0, _authConfig.userAuth).setUser(user);
        localStorage.setItem("auth_user", JSON.stringify(user));
    }
}
function setupFileUpload(fileInput, fileInputError, fileInputSuccess, uploadEndpoint) {
    const profilePictureImage = new (0, _image.WFImage)("#profilePictureImage");
    const uploadAnimation = new (0, _core.WFComponent)("#uploadAnimation");
    const overlay = new (0, _core.WFComponent)(".drop-zone");
    let dragCounter = 0;
    return new Promise((resolve, reject)=>{
        const handleFile = (file)=>{
            const reader = new FileReader();
            reader.onload = (event)=>{
                fileInputError.setStyle({
                    display: "none"
                });
                fileInputSuccess.setStyle({
                    display: "none"
                });
                uploadAnimation.setStyle({
                    display: "flex"
                });
                const result = event.target?.result;
                profilePictureImage.setImage(result);
                overlay.setStyle({
                    display: "none"
                });
            };
            reader.readAsDataURL(file);
            const formData = new FormData();
            formData.append("profile_picture", file);
            const existingStudent = localStorage.getItem("current_student");
            if (existingStudent) {
                const student = JSON.parse(existingStudent);
                formData.append("student_profile_id", student.id.toString());
            }
            const postRequest = (0, _apiConfig.apiClient).post(uploadEndpoint, {
                data: formData
            });
            postRequest.onData((response)=>{
                if (response.status === "success") {
                    const imageUrl = response.url.profile_pic.url;
                    setProfilePicUrl(imageUrl);
                    // Store the URL in local storage
                    localStorage.setItem("image_upload", imageUrl);
                    fileInputSuccess.setStyle({
                        display: "flex"
                    });
                    uploadAnimation.setStyle({
                        display: "none"
                    });
                    resolve(imageUrl);
                } else {
                    const errorMessage = "Failed to upload profile picture.";
                    toggleError(fileInputError, errorMessage, true);
                    reject(new Error(errorMessage));
                }
            });
            postRequest.onError((error)=>{
                let errorMessage = "An error occurred during image upload.";
                if (error.response && error.response.data) errorMessage = error.response.data.message || errorMessage;
                else if (error.message) errorMessage = error.message;
                toggleError(fileInputError, errorMessage, true);
                reject(new Error(errorMessage));
            });
            postRequest.fetch();
        };
        fileInput.on("change", ()=>{
            const file = fileInput.getElement().files?.[0];
            if (file) handleFile(file);
        });
        const dragZoneElement = document.body;
        dragZoneElement.addEventListener("dragenter", (event)=>{
            event.preventDefault();
            dragCounter++;
            if (dragCounter === 1) overlay.setStyle({
                display: "flex"
            });
        });
        dragZoneElement.addEventListener("dragleave", ()=>{
            dragCounter--;
            if (dragCounter <= 0) {
                overlay.setStyle({
                    display: "none"
                });
                dragCounter = 0;
            }
        });
        dragZoneElement.addEventListener("dragover", (event)=>{
            event.preventDefault();
        });
        dragZoneElement.addEventListener("drop", (event)=>{
            event.preventDefault();
            const files = event.dataTransfer?.files;
            if (files?.length) handleFile(files[0]);
            overlay.setStyle({
                display: "none"
            });
            dragCounter = 0;
        });
    });
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../api/apiConfig":"2Lx0S","../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
var t = require("d023971cccd819e3");
var e, r, s, i, o, n, u = {};
e = u, r = "WFImage", s = ()=>c, Object.defineProperty(e, r, {
    get: s,
    set: i,
    enumerable: !0,
    configurable: !0
});
class c extends t.WFComponent {
    constructor(t){
        super(t);
    }
    getImageConfig() {
        return this._config;
    }
    getSrc() {
        return this.getAttribute("src");
    }
    getSizes() {
        return this.getAttribute("sizes");
    }
    getSrcSet() {
        return this.getAttribute("srcset");
    }
    getLoading() {
        return this.getAttribute("loading");
    }
    onLoad(t) {
        return this.on("load", t), ()=>{
            this.off("load", t);
        };
    }
    onLoadError(t) {
        return this.on("error", t), ()=>{
            this.off("error", t);
        };
    }
    setImage(t) {
        if ("string" == typeof t) this.setAttribute("src", t), this.removeAttribute("srcset"), this.removeAttribute("sizes");
        else {
            if (this.setAttribute("src", t.src), "object" == typeof t && t.srcSet && t.srcSet.length && t.sizes && t.sizes.length) {
                const e = t.srcSet.map((t)=>`${t.url} ${t.size}`).join(", ");
                this.setAttribute("srcset", e);
            } else this.removeAttribute("srcset"), this.removeAttribute("sizes");
            t.loading && this.setAttribute("loading", t.loading);
        }
    }
}
o = module.exports, n = u, Object.keys(n).forEach(function(t) {
    "default" === t || "__esModule" === t || o.hasOwnProperty(t) || Object.defineProperty(o, t, {
        enumerable: !0,
        get: function() {
            return n[t];
        }
    });
});

},{"d023971cccd819e3":"j9zXV"}],"dMBjH":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "validateNotEmpty", ()=>validateNotEmpty);
parcelHelpers.export(exports, "validateEmail", ()=>validateEmail);
parcelHelpers.export(exports, "validatePasswordRequirements", ()=>validatePasswordRequirements);
parcelHelpers.export(exports, "validateCheckbox", ()=>validateCheckbox);
parcelHelpers.export(exports, "validatePasswordsMatch", ()=>validatePasswordsMatch);
parcelHelpers.export(exports, "validateSelectField", ()=>validateSelectField);
parcelHelpers.export(exports, "validatePhoneNumber", ()=>validatePhoneNumber);
function validateNotEmpty(input) {
    return input !== undefined && input.trim() !== "";
}
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}
function validatePasswordRequirements(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasValidLength = password.length >= 8;
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar && hasValidLength;
}
function validateCheckbox(checked) {
    return checked;
}
function validatePasswordsMatch(originalPassword, confirmPassword) {
    return originalPassword === confirmPassword;
}
function validateSelectField(input) {
    return input !== undefined && input !== "N/A";
}
function validatePhoneNumber(input) {
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(input);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"d0IfT":[function(require,module,exports) {
//../../utils/recaptchaUtils.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Asynchronously obtains a reCAPTCHA token for a specified action.
 * @param {string} action - The action name for which the reCAPTCHA token is requested.
 * @returns {Promise<string>} A promise that resolves with the reCAPTCHA token.
 */ parcelHelpers.export(exports, "getRecaptchaToken", ()=>getRecaptchaToken);
/**
 * Validates a reCAPTCHA token with the backend server.
 * @param {string} token - The reCAPTCHA token to validate.
 * @returns {Promise<any>} A promise that resolves with the validation response from the server.
 */ parcelHelpers.export(exports, "validateRecaptchaToken", ()=>validateRecaptchaToken);
/**
 * Handles the full reCAPTCHA verification flow from obtaining the token to validating it.
 * @param {string} action - The action name for which the reCAPTCHA should be processed.
 * @returns {Promise<boolean>} A promise that resolves with true if the reCAPTCHA verification is successful.
 */ parcelHelpers.export(exports, "handleRecaptcha", ()=>handleRecaptcha);
var _apiConfig = require("../api/apiConfig");
async function getRecaptchaToken(action) {
    return new Promise((resolve, reject)=>{
        // Ensure grecaptcha is ready and execute the token request.
        grecaptcha.ready(()=>{
            grecaptcha.execute("6Lekaa8pAAAAAN6qiq0LSP5Akckql4Blg6K5ToUq", {
                action: action
            }).then((token)=>{
                resolve(token); // Resolve with the obtained token.
            }, reject); // Reject the promise if there is an error.
        });
    });
}
async function validateRecaptchaToken(token) {
    try {
        // Send the reCAPTCHA token to the server for validation.
        const response = await (0, _apiConfig.apiClient).post("/recaptcha/validate", {
            data: {
                "g-recaptcha-response": token
            }
        }).fetch();
        // Return the server's response directly assuming it's already in JSON format.
        return response; // Assume response is the direct JSON body.
    } catch (error) {
        throw new Error(`ReCAPTCHA validation failed: ${error}`);
    }
}
async function handleRecaptcha(action) {
    try {
        const token = await getRecaptchaToken(action);
        const validationResponse = await validateRecaptchaToken(token);
        return validationResponse.status === "success";
    } catch (error) {
        console.error("ReCAPTCHA handling failed:", error);
        // If error has a response, log it for more context
        if (error.response) console.error("Error response:", error.response);
        return false;
    }
}

},{"../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=dashboardListStudents.215181ba.js.map
