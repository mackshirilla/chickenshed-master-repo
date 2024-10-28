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
})({"N1Kyc":[function(require,module,exports) {
// src/pages/dashboard.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "dashboard", ()=>dashboard);
var _listStudents = require("./listStudents");
var _listAdditionalStudents = require("./listAdditionalStudents");
var _listCaregivers = require("./listCaregivers");
var _listRegistration = require("./listRegistration");
var _listTicketOrders = require("./listTicketOrders");
var _listDonations = require("./listDonations");
var _listCaregiverNotifications = require("./listCaregiverNotifications");
var _listFiles = require("./listFiles");
var _core = require("@xatom/core");
var _authConfig = require("../../auth/authConfig");
const dashboard = async ()=>{
    const firstNameText = new (0, _core.WFComponent)("#firstNameText");
    firstNameText.setText((0, _authConfig.userAuth).getUser().profile.first_name);
    try {
        await (0, _listStudents.initializeDynamicStudentList)("#listStudentProfiles");
        await (0, _listAdditionalStudents.initializeDynamicAdditionalStudentList)("#listAdditionalStudentProfiles");
        await (0, _listFiles.initializeDynamicFileList)("#filesList"); // Corrected selector here
        await (0, _listCaregivers.initializeDynamicCaregiverList)("#caregiversList");
        (0, _listRegistration.initializeDynamicSubscriptionList)("#listRegistration");
        await (0, _listTicketOrders.initializeDynamicTicketOrderList)("#listTickets");
        await (0, _listDonations.initializeDynamicDonationList)("#listDonations");
        (0, _listCaregiverNotifications.initializeCaregiverNotifications)("caregiverNotificationList");
        triggerSuccessEvent(".success_trigger");
    } catch (error) {
    // Handle error if needed
    }
};
const triggerSuccessEvent = (selector)=>{
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
};

},{"./listStudents":"4NIcD","./listAdditionalStudents":"f8tcP","./listCaregivers":"18rDE","./listRegistration":"19ZcK","./listTicketOrders":"6PQNU","./listDonations":"3zTq7","./listCaregiverNotifications":"2fKLd","./listFiles":"1n749","@xatom/core":"j9zXV","../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2fKLd":[function(require,module,exports) {
// src/modules/dashboard/listCaregiverNotifications.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Initializes the caregiver notifications dynamic list.
 * @param containerId - ID of the caregiver notifications container.
 */ parcelHelpers.export(exports, "initializeCaregiverNotifications", ()=>initializeCaregiverNotifications);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
async function initializeCaregiverNotifications(containerId) {
    // Select the caregiver notifications container by ID
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Caregiver notifications container not found:", containerId);
        return;
    }
    // Initially hide the container
    container.style.display = "none";
    // Initialize a new WFDynamicList instance with ID selector for rows
    const list = new (0, _core.WFDynamicList)(`#${containerId}`, {
        rowSelector: "#caregiverNotificationRow"
    });
    /**
   * Array to hold the current caregiver invites.
   */ let caregiverInvites = [];
    /**
   * Customizes the rendering of each caregiver notification row.
   * @param rowData - Data for the current caregiver invite.
   * @param rowElement - The HTML element representing the notification row.
   * @returns The modified rowElement.
   */ list.rowRenderer(({ rowData, rowElement })=>{
        const notificationCard = new (0, _core.WFComponent)(rowElement);
        // Populate the caregiver's name
        const notificationName = notificationCard.getChildAsComponent("#caregiverNotificationName" // ID selector
        );
        notificationName.setText(rowData.user_one_name);
        // Handle the Accept button
        const acceptButton = notificationCard.getChildAsComponent("#acceptCaregiver"); // ID selector
        acceptButton.on("click", async ()=>{
            try {
                console.log(`Accepting caregiver invite with ID: ${rowData.id}`);
                // Show loading animation on Accept button
                const loadingAnimation = notificationCard.getChildAsComponent("#requestingAnimationAccept" // ID selector
                );
                if (loadingAnimation) loadingAnimation.setStyle({
                    display: "block"
                });
                else console.warn("Loading animation element not found: #requestingAnimationAccept");
                // Make API call to accept the invite
                const response = await (0, _apiConfig.apiClient).post(`/caregivers/invites/${rowData.id}/accept`).fetch();
                console.log("API response:", response);
                if (response.status === "success") {
                    console.log("Caregiver invite accepted successfully.");
                    // Instead of updating the list locally, refresh the page
                    console.log("Refreshing the page to reflect changes.");
                    location.reload();
                } else {
                    console.warn("API response unsuccessful:", response);
                    alert(response.message || "Failed to accept caregiver invite.");
                }
            } catch (error) {
                console.error("Error accepting caregiver invite:", error);
                alert("An error occurred while accepting the invite.");
            } finally{
                // Hide loading animation
                const loadingAnimation = notificationCard.getChildAsComponent("#requestingAnimationAccept" // ID selector
                );
                if (loadingAnimation) loadingAnimation.setStyle({
                    display: "none"
                });
                else console.warn("Loading animation element not found: #requestingAnimationAccept");
            }
        });
        // Handle the Decline button
        const declineButton = notificationCard.getChildAsComponent("#declineCaregiver"); // ID selector
        declineButton.on("click", async ()=>{
            try {
                console.log(`Declining caregiver invite with ID: ${rowData.id}`);
                // Show loading animation on Decline button
                const loadingAnimation = notificationCard.getChildAsComponent("#requestingAnimationDecline" // ID selector
                );
                if (loadingAnimation) loadingAnimation.setStyle({
                    display: "block"
                });
                else console.warn("Loading animation element not found: #requestingAnimationDecline");
                // Make API call to decline the invite
                const response = await (0, _apiConfig.apiClient).post(`/caregivers/invites/${rowData.id}/decline`).fetch();
                console.log("API response:", response);
                if (response.status === "success") {
                    console.log("Caregiver invite declined successfully.");
                    // Instead of updating the list locally, refresh the page
                    console.log("Refreshing the page to reflect changes.");
                    location.reload();
                } else {
                    console.warn("API response unsuccessful:", response);
                    alert(response.message || "Failed to decline caregiver invite.");
                }
            } catch (error) {
                console.error("Error declining caregiver invite:", error);
                alert("An error occurred while declining the invite.");
            } finally{
                // Hide loading animation
                const loadingAnimation = notificationCard.getChildAsComponent("#requestingAnimationDecline" // ID selector
                );
                if (loadingAnimation) loadingAnimation.setStyle({
                    display: "none"
                });
                else console.warn("Loading animation element not found: #requestingAnimationDecline");
            }
        });
        return rowElement;
    });
    /**
   * Fetches caregiver invites from the API and populates the dynamic list.
   */ async function loadCaregiverInvites() {
        try {
            console.log("Fetching caregiver invites...");
            const response = await (0, _apiConfig.apiClient).get("/caregivers/invites").fetch();
            console.log("Fetched caregiver invites:", response);
            if (response.caregivers && Array.isArray(response.caregivers)) {
                // Sort caregivers by creation date (newest first)
                caregiverInvites = response.caregivers.sort((a, b)=>b.created_at - a.created_at);
                list.setData(caregiverInvites);
                // Update the container's display based on the fetched invites
                updateContainerDisplay();
            } else {
                console.error("Invalid response structure for caregiver invites:", response);
                // Do not show anything if the list is empty
                caregiverInvites = [];
                list.setData(caregiverInvites);
                // Ensure the container is hidden
                container.style.display = "none";
            }
        } catch (error) {
            console.error("Error fetching caregiver invites:", error);
            // Do not show anything if the list is empty
            caregiverInvites = [];
            list.setData(caregiverInvites);
            // Ensure the container is hidden
            container.style.display = "none";
        }
    }
    /**
   * Updates the container's display property based on the current list.
   */ function updateContainerDisplay() {
        if (caregiverInvites.length > 0) container.style.display = "flex";
        else container.style.display = "none";
    }
    // Load caregiver invites when initializing
    await loadCaregiverInvites();
}

},{"@xatom/core":"j9zXV","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"1n749":[function(require,module,exports) {
// src/pages/listFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files from the API
parcelHelpers.export(exports, "fetchFiles", ()=>fetchFiles);
// Function to initialize and render the dynamic file list
parcelHelpers.export(exports, "initializeDynamicFileList", ()=>initializeDynamicFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
async function fetchFiles() {
    try {
        const getFiles = (0, _apiConfig.apiClient).get("/student_files");
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
}
async function initializeDynamicFileList(containerSelector) {
    // Initialize a new instance of WFDynamicList for Files
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#fileCard",
        loaderSelector: "#filesloading",
        emptySelector: "#filesEmpty"
    });
    // Customize the rendering of the loader
    list.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    // Customize the rendering of the empty state
    list.emptyRenderer((emptyElement)=>{
        emptyElement.setStyle({
            display: "flex"
        });
        return emptyElement;
    });
    // Customize the rendering of list items (File Cards)
    list.rowRenderer(({ rowData, rowElement })=>{
        const fileCard = new (0, _core.WFComponent)(rowElement);
        // Set the fileCard's href to file_url
        fileCard.setAttribute("href", rowData.file_url);
        // Set the fileName to file_name
        const fileName = fileCard.getChildAsComponent("#fileName");
        fileName.setText(rowData.file_name);
        // Show the list item
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load and display file data
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        const files = await fetchFiles();
        // Sort files alphabetically by file_name
        files.sort((a, b)=>a.file_name.localeCompare(b.file_name));
        // Set the data to be displayed in the dynamic list
        list.setData(files);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading files:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

//# sourceMappingURL=dashboard.e3771d7a.js.map
