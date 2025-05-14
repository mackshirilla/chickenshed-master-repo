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
})({"3GKdy":[function(require,module,exports) {
// src/pages/donationDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDonationDetailsPage", ()=>initializeDonationDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _cancelDonationSubscriptionDialog = require("./components/CancelDonationSubscriptionDialog");
async function initializeDonationDetailsPage() {
    // Hide breadcrumbs if on donation-details path
    if (window.location.pathname === "/donation-details") {
        const breadcrumbs = new (0, _core.WFComponent)(".breadcrumbs_container");
        breadcrumbs.setStyle({
            display: "none"
        });
    }
    const urlParams = new URLSearchParams(window.location.search);
    const donationUuid = urlParams.get("donation");
    if (!donationUuid) {
        console.error("Missing donation UUID");
        return;
    }
    try {
        const request = (0, _apiConfig.apiClient).get(`/dashboard/donations/${donationUuid}`);
        const response = await request.fetch();
        const { donation } = response;
        const campaign = donation.support_campaign;
        const campaignImage = new (0, _image.WFImage)("#campaignImage");
        campaignImage.setImage(campaign.Main_Image);
        campaignImage.getElement().setAttribute("alt", `${campaign.Name} - Campaign Image`);
        const campaignName = new (0, _core.WFComponent)("#campaignName");
        campaignName.setText(campaign.Name);
        const campaignSubheading = new (0, _core.WFComponent)("#campaignSubheading");
        campaignSubheading.setText(campaign.Subheading);
        const campaignBreadcrumb = new (0, _core.WFComponent)("#campaignBreadcrumb");
        const donationDate = new Date(donation.created_at).toLocaleDateString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        });
        campaignBreadcrumb.setText(`${campaign.Name} - ${donationDate}`);
        const campaignShortDescription = new (0, _core.WFComponent)("#campaignShortDescription");
        campaignShortDescription.setText(campaign.Short_Description);
        const anonymousTrue = new (0, _core.WFComponent)("#anonymousTrue");
        const anonymousFalse = new (0, _core.WFComponent)("#anonymousFalse");
        if (donation.keep_anonymous) {
            anonymousTrue.setStyle({
                display: "block"
            });
            anonymousFalse.setStyle({
                display: "none"
            });
        } else {
            anonymousTrue.setStyle({
                display: "none"
            });
            anonymousFalse.setStyle({
                display: "block"
            });
        }
        const donationAmount = new (0, _core.WFComponent)("#invoiceAmount");
        donationAmount.setText(`$${donation.amount.toFixed(2)}`);
        const donationDateComp = new (0, _core.WFComponent)("#invoiceDate");
        donationDateComp.setText(donationDate);
        const inNameOfHeader = new (0, _core.WFComponent)("#inNameOfHeader");
        const inNameOfCell = new (0, _core.WFComponent)("#inNameOfCell");
        if (donation.in_name_of?.trim()) {
            inNameOfHeader.setStyle({
                display: "table-cell"
            });
            inNameOfCell.setStyle({
                display: "table-cell"
            });
            inNameOfCell.setText(donation.in_name_of);
        } else {
            inNameOfHeader.setStyle({
                display: "none"
            });
            inNameOfCell.setStyle({
                display: "none"
            });
        }
        const subscriptionTypeComp = new (0, _core.WFComponent)("#donationType");
        const subType = donation.donation_subscription?.subscription_type;
        subscriptionTypeComp.setText(subType === "month" ? "Monthly" : subType === "year" ? "Annually" : "One-Time");
        const cancelWrap = new (0, _core.WFComponent)("#cancelSubscriptionWrap");
        const cancelledText = new (0, _core.WFComponent)("#subscriptionCancelledText");
        const isOneTime = !subType || subType !== "month" && subType !== "year";
        const isCancelled = donation.donation_subscription?.status === "Cancelled";
        if (isOneTime || isCancelled) cancelWrap.setStyle({
            display: "none"
        });
        else new (0, _cancelDonationSubscriptionDialog.CancelDonationSubscriptionDialog)({
            containerSelector: "#cancelSubscriptionWrap",
            subscriptionId: String(donation.donation_subscription.id),
            onCancelSuccess: ()=>{
                window.location.reload();
            }
        });
        cancelledText.setStyle({
            display: isCancelled ? "block" : "none"
        });
        const trigger = document.querySelector(".success_trigger");
        if (trigger instanceof HTMLElement) trigger.click();
    } catch (error) {
        console.error("Failed to initialize donation details page:", error);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","./components/CancelDonationSubscriptionDialog":"ajqiW"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"ajqiW":[function(require,module,exports) {
// src/modules/dashboard/donations/components/CancelDonationSubscriptionDialog.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// CancelDonationSubscriptionDialog Component
parcelHelpers.export(exports, "CancelDonationSubscriptionDialog", ()=>CancelDonationSubscriptionDialog);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
var _formUtils = require("../../../../utils/formUtils");
var _validationUtils = require("../../../../utils/validationUtils");
class CancelDonationSubscriptionDialog {
    constructor(options){
        const { containerSelector, subscriptionId, onCancelSuccess } = options;
        this.container = new (0, _core.WFComponent)(containerSelector);
        this.subscriptionId = subscriptionId;
        this.cancelForm = new (0, _core.WFFormComponent)("#cancelSubscriptionForm");
        this.dialog = new (0, _core.WFComponent)("#cancelSubscriptionDialog");
        this.pageMain = new (0, _core.WFComponent)(".page_main");
        this.initialize(onCancelSuccess);
    }
    initialize(onCancelSuccess) {
        const openCancelDialogBtn = new (0, _core.WFComponent)("#openCancelSubscription");
        openCancelDialogBtn.on("click", ()=>this.openDialog());
        const closeDialogBtn = new (0, _core.WFComponent)("#close-cancel-dialog-btn");
        closeDialogBtn.on("click", ()=>this.closeDialog());
        this.setupFormSubmission(onCancelSuccess);
        this.setupFormValidation();
    }
    openDialog() {
        const dialogEl = this.dialog.getElement();
        dialogEl?.showModal();
        this.pageMain.setAttribute("data-brand", "6");
    }
    closeDialog() {
        const dialogEl = this.dialog.getElement();
        dialogEl?.close();
        this.pageMain.setAttribute("data-brand", "2");
    }
    setupFormSubmission(onCancelSuccess) {
        this.cancelForm.onFormSubmit(async (formData, event)=>{
            event.preventDefault();
            const reason = formData.removed_because;
            if (!(0, _validationUtils.validateNotEmpty)(reason)) {
                (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitCancelError"), "Reason for cancelling is required.", true);
                return;
            }
            this.setLoadingState(true);
            try {
                const response = await (0, _apiConfig.apiClient).delete(`/donate/subscription/${this.subscriptionId}`, {
                    data: {
                        reason
                    }
                }).fetch();
                if (response?.status === "Cancelled") {
                    (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitCancelError"), "", false);
                    this.closeDialog();
                    onCancelSuccess();
                } else throw new Error(`Unexpected status: ${response?.status}`);
            } catch (error) {
                console.error("Cancel subscription failed:", error);
                this.showErrorMessage("Oops! Something went wrong while submitting the form.");
            } finally{
                this.setLoadingState(false);
            }
        });
    }
    setupFormValidation() {
        const reasonInput = new (0, _core.WFComponent)("#removedReason");
        const reasonError = new (0, _core.WFComponent)("#submitCancelError");
        const validate = (0, _formUtils.createValidationFunction)(reasonInput, (0, _validationUtils.validateNotEmpty), "Reason for cancelling is required.");
        (0, _formUtils.setupValidation)(reasonInput, reasonError, validate);
    }
    setLoadingState(isLoading) {
        const loading = new (0, _core.WFComponent)("#submitCancelLoading");
        const submit = new (0, _core.WFComponent)("#submitCancel");
        loading.setStyle({
            display: isLoading ? "block" : "none"
        });
        isLoading ? submit.setAttribute("disabled", "true") : submit.removeAttribute("disabled");
    }
    showErrorMessage(message) {
        const error = new (0, _core.WFComponent)("#submitUpdateError");
        error.setText(message);
        error.setStyle({
            display: "flex"
        });
    }
    static hideCancelButtonIfOneTime(subscriptionType) {
        const cancelWrap = new (0, _core.WFComponent)("#cancelSubscriptionWrap");
        if (!subscriptionType || subscriptionType === "one-time") cancelWrap.setStyle({
            display: "none"
        });
        else cancelWrap.setStyle({
            display: "flex"
        });
    }
}

},{"@xatom/core":"j9zXV","../../../../api/apiConfig":"2Lx0S","../../../../utils/formUtils":"hvg7i","../../../../utils/validationUtils":"dMBjH","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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
parcelHelpers.export(exports, "validatePhoneNumberOptional", ()=>validatePhoneNumberOptional);
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
const validatePhoneNumberOptional = (value)=>{
    if (value.trim() === "") // Phone number is optional, so empty string is valid
    return true;
    // Validate the phone number format if not empty
    return validatePhoneNumber(value);
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=donationDetails.e5f150c6.js.map
