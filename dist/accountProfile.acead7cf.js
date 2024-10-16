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
})({"3NLuz":[function(require,module,exports) {
// src/modules/pages/accountDetails/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeAccountDetailsPage", ()=>initializeAccountDetailsPage);
var _getUserDetails = require("./getUserDetails");
var _edituserDialog = require("./edituserDialog");
var _deleteUser = require("./deleteUser");
const initializeAccountDetailsPage = async ()=>{
    // Fetch and display user details
    await (0, _getUserDetails.getUserDetails)();
    // Initialize the edit user dialog
    (0, _edituserDialog.initializeEditUserDialog)();
    // Initialize the delete user functionality
    (0, _deleteUser.initializeDeleteUser)();
    // Add an event listener to remove current_user from localStorage when navigating away
    window.addEventListener("beforeunload", ()=>{
        localStorage.removeItem("current_user");
    });
};

},{"./getUserDetails":"czEWz","./edituserDialog":"rfOi4","./deleteUser":"46Qnk","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"czEWz":[function(require,module,exports) {
// src/modules/pages/accountDetails/getUserDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getUserDetails", ()=>getUserDetails);
var _apiConfig = require("../../../api/apiConfig");
var _core = require("@xatom/core");
var _image = require("@xatom/image");
const getUserDetails = async ()=>{
    // Show loading spinner
    const loadingSpinner = new (0, _core.WFComponent)(".dashboard_loading_wall");
    loadingSpinner.setStyle({
        display: "flex"
    });
    try {
        const response = await (0, _apiConfig.apiClient).get("/dashboard/account").fetch();
        if (response) {
            const user = response; // Replace 'any' with a proper interface for better type safety
            // Hide the loading spinner
            triggerSuccessEvent(".success_trigger");
            // Set user full name
            const userFullName = new (0, _core.WFComponent)("#userFullName");
            userFullName.setText(`${user.first_name} ${user.last_name}`);
            // Set profile picture
            const userProfilePicture = new (0, _image.WFImage)("#userProfilePicture");
            if (user.profile_pic && user.profile_pic.url) userProfilePicture.setImage(user.profile_pic.url);
            else userProfilePicture.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
            // Set email
            const userEmail = new (0, _core.WFComponent)("#userEmail");
            userEmail.setText(user.email || "N/A");
            // Set phone
            const userPhone = new (0, _core.WFComponent)("#userPhone");
            userPhone.setText(user.phone || "N/A");
            // Set address line 1
            const userAddressLineOne = new (0, _core.WFComponent)("#userAddressLineOne");
            userAddressLineOne.setText(user.address_line_1 || "N/A");
            // Set address line 2
            const userAddressLineTwo = new (0, _core.WFComponent)("#userAddressLineTwo");
            userAddressLineTwo.setText(user.address_line_2 || "N/A");
            // Set city
            const userCity = new (0, _core.WFComponent)("#userCity");
            userCity.setText(user.city || "N/A");
            // Set state
            const userState = new (0, _core.WFComponent)("#userState");
            userState.setText(user.state || "N/A");
            // Set zip
            const userZip = new (0, _core.WFComponent)("#userZip");
            userZip.setText(user.zip || "N/A");
            // Set receive texts preference
            const userTextTrue = new (0, _core.WFComponent)("#userTextTrue");
            const userTextFalse = new (0, _core.WFComponent)("#userTextFalse");
            if (user.send_texts) {
                userTextTrue.setStyle({
                    display: "block"
                });
                userTextFalse.setStyle({
                    display: "none"
                });
            } else {
                userTextTrue.setStyle({
                    display: "none"
                });
                userTextFalse.setStyle({
                    display: "block"
                });
            }
            // Set YMCA member status
            const userYTrue = new (0, _core.WFComponent)("#userYTrue");
            const userYFalse = new (0, _core.WFComponent)("#userYFalse");
            if (user.is_y_member) {
                userYTrue.setStyle({
                    display: "block"
                });
                userYFalse.setStyle({
                    display: "none"
                });
            } else {
                userYTrue.setStyle({
                    display: "none"
                });
                userYFalse.setStyle({
                    display: "block"
                });
            }
            // Set YMCA membership number
            const userYMembershipNumber = new (0, _core.WFComponent)("#userYMembershipNumber");
            userYMembershipNumber.setText(user.y_membership_id || "N/A");
            // Save user data for later use (e.g., in edit forms)
            localStorage.setItem("current_user", JSON.stringify(user));
        } else {
            alert("Error: Received null response from the server.");
            console.error("Received null response from the server.");
            // Navigate back to the previous page or handle the error appropriately
            window.history.back();
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        alert(`Error fetching user details: ${error.message || error}`);
        // Navigate back to the previous page or handle the error appropriately
        window.history.back();
    } finally{
        // Hide loading spinner in all cases
        loadingSpinner.setStyle({
            display: "none"
        });
    }
};
const triggerSuccessEvent = (selector)=>{
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
};

},{"../../../api/apiConfig":"2Lx0S","@xatom/core":"j9zXV","@xatom/image":"ly8Ay","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"rfOi4":[function(require,module,exports) {
// src/modules/pages/accountDetails/editUserDialog.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeEditUserDialog", ()=>initializeEditUserDialog);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
var _getUserDetails = require("./getUserDetails");
// Declare variables in the outer scope
let isYMemberInput;
let hiddenYMemberWrapper;
let yMemberIdInput;
let yMemberIdInputError;
const initializeEditUserDialog = ()=>{
    // Retrieve and initialize the "Open Edit Dialog" button
    const openEditDialogButton = new (0, _core.WFComponent)("#openEditUserDialog");
    // Retrieve the edit user dialog element
    const editUserDialogElement = document.getElementById("editUserDialog");
    // Retrieve and initialize the "Close Dialog" button
    const closeDialogButton = new (0, _core.WFComponent)("#close-dialog-btn");
    // Set up the click event listener to open the dialog
    openEditDialogButton.on("click", ()=>{
        populateEditUserForm();
        if (editUserDialogElement) editUserDialogElement.showModal();
    });
    // Set up the click event listener to close the dialog
    closeDialogButton.on("click", ()=>{
        if (editUserDialogElement) editUserDialogElement.close();
    });
    // Initialize the form
    const form = new (0, _core.WFFormComponent)("#editUserForm");
    // Initialize error component for form submission errors
    const formSubmitError = new (0, _core.WFComponent)("#editUserSubmitError");
    // Define validation rules for each field
    const fields = [
        {
            input: new (0, _core.WFComponent)("#firstNameInput"),
            error: new (0, _core.WFComponent)("#firstNameInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "First name is required"
        },
        {
            input: new (0, _core.WFComponent)("#lastNameInput"),
            error: new (0, _core.WFComponent)("#lastNameInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Last name is required"
        },
        {
            input: new (0, _core.WFComponent)("#emailInput"),
            error: new (0, _core.WFComponent)("#emailInputError"),
            validationFn: (0, _validationUtils.validateEmail),
            message: "Invalid email format"
        },
        {
            input: new (0, _core.WFComponent)("#phoneNumberInput"),
            error: new (0, _core.WFComponent)("#phoneNumberInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Phone number must be in the format (xxx) xxx-xxxx"
        }
    ];
    // Setup validation for each field
    fields.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), formSubmitError);
    });
    // Initialize components for Y Member input
    isYMemberInput = new (0, _core.WFComponent)("#isYMemberInput");
    hiddenYMemberWrapper = new (0, _core.WFComponent)("#hiddenyMemberWrapper");
    yMemberIdInput = new (0, _core.WFComponent)("#yMemberIdInput");
    yMemberIdInputError = new (0, _core.WFComponent)("#yMemberIdInputError");
    const toggleYMemberInput = ()=>{
        const isChecked = isYMemberInput.getElement().checked;
        if (isChecked) hiddenYMemberWrapper.removeCssClass("g-hide");
        else {
            hiddenYMemberWrapper.addCssClass("g-hide");
            // Clear the Y Membership Number input
            yMemberIdInput.getElement().value = "";
        }
    };
    // Initialize the visibility on page load
    toggleYMemberInput();
    // Add event listener to the checkbox
    isYMemberInput.on("change", ()=>{
        toggleYMemberInput();
    });
    // Remove validation for yMemberIdInput since it's no longer required
    // Remove the yMemberIdValidation function and related code
    // Handle form submission
    form.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        const requestingAnimation = new (0, _core.WFComponent)("#requestingAnimationEditUser");
        requestingAnimation.setStyle({
            display: "block"
        });
        let isFormValid = true;
        // Validate all fields
        fields.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        // Since Y Membership Number is not required, we don't need to validate it
        // However, we can clear any previous errors
        (0, _formUtils.toggleError)(yMemberIdInputError, "", false);
        if (!isFormValid) {
            (0, _formUtils.toggleError)(formSubmitError, "Please correct all errors above.", true);
            requestingAnimation.setStyle({
                display: "none"
            });
            return;
        } else (0, _formUtils.toggleError)(formSubmitError, "", false);
        // Disable submit button
        const submitButton = new (0, _core.WFComponent)("#editUserSubmitButton");
        submitButton.setAttribute("disabled", "true");
        // Prepare data for API
        const dataToUpdate = {
            ...formData
        };
        try {
            // Send update request to API
            const response = await (0, _apiConfig.apiClient).post(`/profiles/update_profile`, {
                data: dataToUpdate
            }).fetch();
            if (response.status === "success") {
                // Update successful
                // Refresh the user details on the page
                await (0, _getUserDetails.getUserDetails)();
                // Reset the form with updated information
                populateEditUserForm();
                // Close the dialog after successful request and data refresh
                if (editUserDialogElement) editUserDialogElement.close();
            } else throw new Error(response.message || "Update failed");
        } catch (error) {
            console.error("Error updating user profile:", error);
            (0, _formUtils.toggleError)(formSubmitError, error.message || "An error occurred", true);
        } finally{
            // Hide loading animation
            requestingAnimation.setStyle({
                display: "none"
            });
            // Re-enable submit button
            submitButton.removeAttribute("disabled");
        }
    });
    // Set up the file upload for the profile picture
    const profilePictureInput = new (0, _core.WFComponent)("#profilePictureInput");
    const profilePictureInputError = new (0, _core.WFComponent)("#profilePictureInputError");
    const profilePictureInputSuccess = new (0, _core.WFComponent)("#profilePictureInputSuccess");
    (0, _formUtils.setupFileUpload)(profilePictureInput, profilePictureInputError, profilePictureInputSuccess, "/profiles/image-upload");
};
// Function to populate the form with existing user data
const populateEditUserForm = ()=>{
    const userData = localStorage.getItem("current_user");
    if (!userData) {
        console.error("No user data found");
        return;
    }
    let user;
    try {
        user = JSON.parse(userData);
    } catch (parseError) {
        console.error("Error parsing user data from localStorage:", parseError);
        return;
    }
    // Helper function to set input value
    const setInputValue = (selector, value, isCheckbox = false)=>{
        const element = document.querySelector(selector);
        if (element) {
            if (isCheckbox && element instanceof HTMLInputElement) element.checked = Boolean(value);
            else element.value = String(value);
        }
    };
    // Set form fields
    setInputValue("#firstNameInput", user.first_name);
    setInputValue("#lastNameInput", user.last_name);
    setInputValue("#emailInput", user.email);
    setInputValue("#phoneNumberInput", user.phone);
    setInputValue("#sendTextsInput", user.send_texts, true);
    setInputValue("#addressLineOneInput", user.address_line_1);
    setInputValue("#addressLineTwoInput", user.address_line_2);
    setInputValue("#cityInput", user.city);
    setInputValue("#stateInput", user.state);
    setInputValue("#zipInput", user.zip);
    setInputValue("#referralInput", user.referred_by);
    setInputValue("#isYMemberInput", user.is_y_member, true);
    setInputValue("#yMemberIdInput", user.y_membership_id);
    // Set profile picture preview using WFImage
    const profilePictureImage = new (0, _image.WFImage)("#profilePictureImage");
    if (user.profile_pic && user.profile_pic.url) profilePictureImage.setImage(user.profile_pic.url);
    else profilePictureImage.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
    // Update the visibility of the hidden Y Member input
    const isYMemberChecked = isYMemberInput.getElement().checked;
    if (isYMemberChecked) hiddenYMemberWrapper.removeCssClass("g-hide");
    else {
        hiddenYMemberWrapper.addCssClass("g-hide");
        // Clear the Y Membership Number input
        yMemberIdInput.getElement().value = "";
    }
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","./getUserDetails":"czEWz","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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
 */ /**
 * Handles file upload and displays the uploaded image.
 * Only JPEG files less than 2 MB can be uploaded.
 * @param {WFComponent} fileInput - The WFComponent instance for the file input field.
 * @param {WFComponent} fileInputError - The WFComponent instance for displaying error messages.
 * @param {WFComponent} fileInputSuccess - The WFComponent instance for displaying success messages.
 * @param {string} uploadEndpoint - The endpoint to which the file is sent.
 * @returns {Promise<string>} A promise that resolves with the URL of the uploaded image.
 */ parcelHelpers.export(exports, "setupFileUpload", ()=>setupFileUpload);
parcelHelpers.export(exports, "formatPhoneNumber", ()=>formatPhoneNumber);
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
    return new Promise((resolve)=>{
        const handleFile = (file)=>{
            // Validate file type and size
            const validTypes = [
                "image/jpeg",
                "image/jpg"
            ];
            const maxSizeInBytes = 2097152; // 2 MB
            if (!validTypes.includes(file.type) && !/\.(jpg|jpeg)$/i.test(file.name)) {
                const errorMessage = "Only JPEG images are allowed.";
                toggleError(fileInputError, errorMessage, true);
                // Reset file input value
                fileInput.getElement().value = "";
                return;
            }
            if (file.size > maxSizeInBytes) {
                const errorMessage = "File size must be less than 2 MB.";
                toggleError(fileInputError, errorMessage, true);
                // Reset file input value
                fileInput.getElement().value = "";
                return;
            }
            // Show upload animation immediately
            uploadAnimation.setStyle({
                display: "flex"
            });
            // Hide error and success messages
            fileInputError.setStyle({
                display: "none"
            });
            fileInputSuccess.setStyle({
                display: "none"
            });
            const reader = new FileReader();
            // Display preview image as soon as the file is loaded into memory
            reader.onload = (event)=>{
                // Set the preview image for the profile picture
                const result = event.target?.result;
                profilePictureImage.setImage(result);
                // Hide overlay once the image is set
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
            // Send the file to the server
            const postRequest = (0, _apiConfig.apiClient).post(uploadEndpoint, {
                data: formData
            });
            postRequest.onData((response)=>{
                if (response.status === "success") {
                    const imageUrl = response.url.profile_pic.url;
                    // Update the profile picture URL in the user session and local storage
                    setProfilePicUrl(imageUrl);
                    // Update the image for other parts of the UI as well
                    profilePictureImage.setImage(imageUrl);
                    // Store the URL in local storage
                    localStorage.setItem("image_upload", imageUrl);
                    // Show success message and hide upload animation
                    fileInputSuccess.setStyle({
                        display: "flex"
                    });
                    uploadAnimation.setStyle({
                        display: "none"
                    });
                    // Resolve with the uploaded image URL
                    resolve(imageUrl);
                } else {
                    const errorMessage = "Failed to upload profile picture.";
                    toggleError(fileInputError, errorMessage, true);
                    uploadAnimation.setStyle({
                        display: "none"
                    });
                    overlay.setStyle({
                        display: "none"
                    });
                    dragCounter = 0;
                    // Reset file input value
                    fileInput.getElement().value = "";
                }
            });
            postRequest.onError((error)=>{
                let errorMessage = "An error occurred during image upload.";
                if (error.response && error.response.data) errorMessage = error.response.data.message || errorMessage;
                else if (error.message) errorMessage = error.message;
                // Show error message and hide upload animation
                toggleError(fileInputError, errorMessage, true);
                uploadAnimation.setStyle({
                    display: "none"
                });
                overlay.setStyle({
                    display: "none"
                });
                dragCounter = 0;
                // Reset file input value
                fileInput.getElement().value = "";
            });
            // Make the API call
            postRequest.fetch();
        };
        // Event listener for file input changes
        fileInput.on("change", ()=>{
            const file = fileInput.getElement().files?.[0];
            if (file) handleFile(file);
        });
        // Event listeners for drag-and-drop
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
const formatPhoneNumber = (value)=>{
    const cleaned = value.replace(/\D/g, ""); // Remove all non-digit characters
    if (cleaned.length <= 3) return cleaned;
    else if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    else if (cleaned.length <= 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    else // If more than 10 digits, truncate the extra digits
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../api/apiConfig":"2Lx0S","../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dMBjH":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "validateNotEmpty", ()=>validateNotEmpty);
parcelHelpers.export(exports, "validateEmail", ()=>validateEmail);
parcelHelpers.export(exports, "validateEmailOptional", ()=>validateEmailOptional);
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
const validateEmailOptional = (value)=>{
    if (value.trim() === "") // Email is optional, so empty string is valid
    return true;
    // Validate the email format if not empty
    return validateEmail(value);
};
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"46Qnk":[function(require,module,exports) {
// src/modules/pages/accountDetails/deleteUser.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Initializes the delete user functionality.
 */ parcelHelpers.export(exports, "initializeDeleteUser", ()=>initializeDeleteUser);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
function initializeDeleteUser() {
    // Retrieve and initialize the "Open Delete Dialog" button
    const openDeleteDialogBtn = new (0, _core.WFComponent)("#openDeleteDialog");
    // Retrieve the delete user dialog element
    const deleteUserDialogElement = document.getElementById("deleteUserDialog");
    // Retrieve and initialize the "Close Delete Dialog" button
    const closeDeleteDialogBtn = new (0, _core.WFComponent)("#close-delete-dialog-btn");
    // Retrieve and initialize the "Final Delete" button
    const deleteUserFinalBtn = new (0, _core.WFComponent)("#deleteUserFinal");
    // Retrieve and initialize the "Delete User Error" component
    const deleteUserError = new (0, _core.WFComponent)("#deleteUserError");
    // Retrieve and initialize the "Page Main" component
    const pageMain = new (0, _core.WFComponent)(".page_main");
    // Retrieve and initialize the loader animations
    const deleteRequestingAnimation = new (0, _core.WFComponent)("#deleteRequestingAnimation");
    deleteRequestingAnimation.setStyle({
        display: "none"
    });
    /**
   * Shows the delete confirmation dialog and updates the data-brand attribute.
   */ const showDeleteDialog = ()=>{
        if (deleteUserDialogElement && pageMain) {
            deleteUserDialogElement.showModal(); // Display the dialog
            pageMain.setAttribute("data-brand", "6"); // Update data-brand to 6
        }
    };
    /**
   * Hides the delete confirmation dialog and reverts the data-brand attribute.
   */ const hideDeleteDialog = ()=>{
        if (deleteUserDialogElement && pageMain && deleteUserError) {
            deleteUserDialogElement.close(); // Close the dialog
            pageMain.setAttribute("data-brand", "2"); // Revert data-brand to 2
            deleteUserError.setStyle({
                display: "none"
            }); // Hide any previous error messages
        }
    };
    /**
   * Handles the deletion of the user account.
   */ const handleDeleteUser = async ()=>{
        try {
            // Hide previous error messages
            deleteUserError.setStyle({
                display: "none"
            });
            // Show the loader animation and disable the delete button
            deleteRequestingAnimation.setStyle({
                display: "flex"
            });
            deleteUserFinalBtn.setAttribute("disabled", "true");
            // Send the DELETE request to the API
            const response = await (0, _apiConfig.apiClient).delete(`/profiles`).fetch();
            // Hide the loader animation and re-enable the delete button
            deleteRequestingAnimation.setStyle({
                display: "none"
            });
            deleteUserFinalBtn.removeAttribute("disabled");
            if (response && response.status === 200) // Redirect to the homepage or login page
            window.location.href = "/login"; // Adjust the URL as needed
            else // Handle unexpected successful responses
            throw new Error("Unexpected response from the server.");
        } catch (error) {
            console.error("Error deleting user account:", error);
            // Hide the loader animation and re-enable the delete button
            deleteRequestingAnimation.setStyle({
                display: "none"
            });
            deleteUserFinalBtn.removeAttribute("disabled");
            // Display the error message
            deleteUserError.setStyle({
                display: "flex"
            });
            deleteUserError.getChildAsComponent(".error-text").setText(error.response?.data?.message || "An unexpected error occurred while deleting your account.");
        }
    };
    // Event listener to open the delete dialog
    openDeleteDialogBtn.on("click", showDeleteDialog);
    // Event listener to close the delete dialog
    closeDeleteDialogBtn.on("click", hideDeleteDialog);
    // Event listener for the final delete action
    deleteUserFinalBtn.on("click", handleDeleteUser);
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=accountProfile.acead7cf.js.map
