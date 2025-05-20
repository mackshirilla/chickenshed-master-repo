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
})({"4NIcD":[function(require,module,exports) {
// src/modules/pages/studentProfile/listStudents.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchStudentProfiles", ()=>fetchStudentProfiles);
parcelHelpers.export(exports, "initializeDynamicStudentList", ()=>initializeDynamicStudentList);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
async function fetchStudentProfiles() {
    try {
        const getStudents = (0, _apiConfig.apiClient).get("/profiles/student_profiles");
        const response = await getStudents.fetch();
        return response.students;
    } catch (error) {
        console.error("Error fetching student profiles:", error);
        throw error;
    }
}
async function initializeDynamicStudentList(containerSelector) {
    // Initialize a new instance of WFDynamicList
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listStudentCard",
        loaderSelector: "#listStudentProfilesloading",
        emptySelector: "#listStudentProfilesEmpty"
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
    // Customize the rendering of list items
    list.rowRenderer(({ rowData, rowElement })=>{
        const studentCard = new (0, _core.WFComponent)(rowElement);
        // Get the existing href attribute
        const existingHref = studentCard.getAttribute("href") || "#";
        // Create a URL object to manipulate the URL and query parameters
        let updatedHref;
        try {
            // If the existingHref is a relative URL, we need to provide a base URL
            const baseUrl = window.location.origin;
            const url = new URL(existingHref, baseUrl);
            // Set or update the 'id' query parameter
            url.searchParams.set("id", rowData.id.toString());
            // Convert the URL object back to a string, relative to the base URL
            updatedHref = url.pathname + url.search + url.hash;
        } catch (error) {
            // If there's an error parsing the URL, default to adding ?id={student_id} directly
            console.error("Error parsing URL:", error);
            updatedHref = `${existingHref}?id=${rowData.id}`;
        }
        // Set the updated href back to the student card
        studentCard.setAttribute("href", updatedHref);
        // Set up the rest of the card components
        const studentImage = new (0, _image.WFImage)(studentCard.getChildAsComponent("#listStudentCardImage").getElement());
        const studentName = studentCard.getChildAsComponent("#studentName");
        if (rowData.profile_pic && rowData.profile_pic.url) studentImage.setImage(rowData.profile_pic.url);
        else studentImage.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/682bd6f6403a5cb7582db055_Profile_avatar_placeholder_large.png");
        studentName.setText(`${rowData.first_name} ${rowData.last_name}`);
        // Show the list item
        rowElement.setStyle({
            display: "block"
        });
        // Show status pills based on student approval status
        const approvedPill = studentCard.getChildAsComponent("#studentApprovedPill");
        const pendingPill = studentCard.getChildAsComponent("#studentPendingPill");
        const status = rowData.Status?.toUpperCase() || ""; // Note capital 'S'
        if (status === "APPROVED") {
            approvedPill.setStyle({
                display: "block"
            });
            pendingPill.setStyle({
                display: "none"
            });
        } else {
            approvedPill.setStyle({
                display: "none"
            });
            pendingPill.setStyle({
                display: "block"
            });
        }
        return rowElement;
    });
    // Load and display student profiles
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        const students = await fetchStudentProfiles();
        // Sort students alphabetically by last name
        students.sort((a, b)=>a.last_name.localeCompare(b.last_name));
        // Set the data to be displayed in the dynamic list
        list.setData(students);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading student profiles:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"f8tcP":[function(require,module,exports) {
// src/modules/pages/studentProfile/listAdditionalStudents.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchAdditionalStudentProfiles", ()=>fetchAdditionalStudentProfiles);
parcelHelpers.export(exports, "initializeDynamicAdditionalStudentList", ()=>initializeDynamicAdditionalStudentList);
parcelHelpers.export(exports, "reloadAdditionalStudentList", ()=>reloadAdditionalStudentList);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
let additionalStudentList = null;
async function fetchAdditionalStudentProfiles() {
    try {
        const getAdditionalStudents = (0, _apiConfig.apiClient).get("/profiles/additional_students");
        const response = await getAdditionalStudents.fetch();
        return response.additional_students;
    } catch (error) {
        console.error("Error fetching additional student profiles:", error);
        throw error;
    }
}
async function initializeDynamicAdditionalStudentList(containerSelector) {
    // Initialize a new instance of WFDynamicList if not already initialized
    if (!additionalStudentList) {
        additionalStudentList = new (0, _core.WFDynamicList)(containerSelector, {
            rowSelector: "#listAdditionalStudentCard",
            loaderSelector: "#listAdditionalStudentProfilesloading",
            emptySelector: "#listAdditionalStudentProfilesEmpty"
        });
        // Customize the rendering of the loader
        additionalStudentList.loaderRenderer((loaderElement)=>{
            loaderElement.setStyle({
                display: "flex"
            });
            return loaderElement;
        });
        // Customize the rendering of the empty state
        additionalStudentList.emptyRenderer((emptyElement)=>{
            emptyElement.setStyle({
                display: "flex"
            });
            return emptyElement;
        });
        // Customize the rendering of list items
        additionalStudentList.rowRenderer(({ rowData, rowElement })=>{
            const studentCard = new (0, _core.WFComponent)(rowElement);
            // Get the existing href attribute or set a default
            const existingHref = studentCard.getAttribute("href") || "#";
            // Initialize the updatedHref variable
            let updatedHref;
            try {
                // If the existingHref is a relative URL, provide a base URL
                const baseUrl = window.location.origin;
                const url = new URL(existingHref, baseUrl);
                // Set or update the 'id' query parameter with the additional student's ID
                url.searchParams.set("id", rowData.id.toString());
                // Convert the URL object back to a relative URL string
                updatedHref = url.pathname + url.search + url.hash;
            } catch (error) {
                // If there's an error parsing the URL, default to adding ?id={additional_student_id} directly
                console.error("Error parsing URL:", error);
                updatedHref = `${existingHref}?id=${rowData.id}`;
            }
            // Set the updated href back to the student card
            studentCard.setAttribute("href", updatedHref);
            // Update the student image
            const studentImage = new (0, _image.WFImage)(studentCard.getChildAsComponent("#listAdditionalStudentCardImage").getElement());
            if (rowData.profile_pic && rowData.profile_pic.url) studentImage.setImage(rowData.profile_pic.url);
            else studentImage.setImage("https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg");
            // Update the student name
            const studentName = studentCard.getChildAsComponent("#additionalStudentName");
            studentName.setText(`${rowData.first_name} ${rowData.last_name}`);
            // Update the parent name
            const parentName = studentCard.getChildAsComponent("#parentName");
            parentName.setText(rowData.parent_name);
            // Show the list item
            rowElement.setStyle({
                display: "flex"
            });
            return rowElement;
        });
        // Load and display additional student profiles
        try {
            // Enable the loading state
            additionalStudentList.changeLoadingStatus(true);
            const additionalStudents = await fetchAdditionalStudentProfiles();
            // Sort additional students alphabetically by last name
            additionalStudents.sort((a, b)=>a.last_name.localeCompare(b.last_name));
            // Set the data to be displayed in the dynamic list
            additionalStudentList.setData(additionalStudents);
            // Disable the loading state
            additionalStudentList.changeLoadingStatus(false);
        } catch (error) {
            console.error("Error loading additional student profiles:", error);
            // If there's an error, set an empty array to trigger the empty state
            additionalStudentList.setData([]);
            // Disable the loading state
            additionalStudentList.changeLoadingStatus(false);
        }
    }
}
async function reloadAdditionalStudentList() {
    if (!additionalStudentList) {
        console.error("Additional student list is not initialized.");
        return;
    }
    try {
        additionalStudentList.changeLoadingStatus(true);
        const additionalStudents = await fetchAdditionalStudentProfiles();
        // Sort additional students alphabetically by last name
        additionalStudents.sort((a, b)=>a.last_name.localeCompare(b.last_name));
        // Update the data in the dynamic list
        additionalStudentList.setData(additionalStudents);
        additionalStudentList.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error reloading additional student profiles:", error);
        additionalStudentList.setData([]);
        additionalStudentList.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"18rDE":[function(require,module,exports) {
// src/modules/pages/caregivers/listCaregivers.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchCaregiverProfiles", ()=>fetchCaregiverProfiles);
parcelHelpers.export(exports, "initializeDynamicCaregiverList", ()=>initializeDynamicCaregiverList);
// Function to reload the caregiver list
parcelHelpers.export(exports, "reloadCaregiverList", ()=>reloadCaregiverList);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
var _recaptchaUtils = require("../../utils/recaptchaUtils");
var _formUtils = require("../../utils/formUtils");
var _validationUtils = require("../../utils/validationUtils");
var _listAdditionalStudents = require("./listAdditionalStudents");
// Declare dialog forms and reset buttons first
const resendInviteForm = new (0, _core.WFFormComponent)("#resendCaregiverInviteForm");
const deleteCaregiverForm = new (0, _core.WFFormComponent)("#deleteCaregiverForm");
const inviteCaregiverForm = new (0, _core.WFFormComponent)("#inviteCaregiverForm");
const resetCaregiverForm = new (0, _core.WFComponent)("#resetCaregiverForm");
const resetDeleteCaregiverForm = new (0, _core.WFComponent)("#resetDeleteCaregiverForm");
const resetResendInviteForm = new (0, _core.WFComponent)("#resetResendCaregiverInviteForm");
// Declare success triggers
const resendCaregiverInviteSuccessTrigger = new (0, _core.WFComponent)("#resendCaregiverInviteSuccessTrigger");
const deleteCaregiverSuccessTrigger = new (0, _core.WFComponent)("#deleteCaregiverSuccessTrigger");
const inviteCaregiverSuccessTrigger = new (0, _core.WFComponent)("#inviteCaregiverSuccessTrigger");
// Flags to track success state
let isResendInviteSuccess = false;
let isDeleteCaregiverSuccess = false;
let isInviteCaregiverSuccess = false;
// Attach reset button event listeners
resetCaregiverForm.on("click", ()=>{
    console.log("Reset Caregiver Form clicked");
    inviteCaregiverForm.resetForm();
    inviteCaregiverForm.showForm();
    if (isInviteCaregiverSuccess) {
        inviteCaregiverSuccessTrigger.getElement().click();
        isInviteCaregiverSuccess = false;
    }
});
resetDeleteCaregiverForm.on("click", ()=>{
    console.log("Reset Delete Caregiver Form clicked");
    deleteCaregiverForm.resetForm();
    deleteCaregiverForm.showForm();
    if (isDeleteCaregiverSuccess) {
        deleteCaregiverSuccessTrigger.getElement().click();
        isDeleteCaregiverSuccess = false;
    }
});
resetResendInviteForm.on("click", ()=>{
    console.log("Reset Resend Invite Form clicked");
    resendInviteForm.resetForm();
    resendInviteForm.showForm();
    if (isResendInviteSuccess) {
        resendCaregiverInviteSuccessTrigger.getElement().click();
        isResendInviteSuccess = false;
    }
});
async function fetchCaregiverProfiles() {
    try {
        const getCaregivers = (0, _apiConfig.apiClient).get("/caregivers");
        const response = await getCaregivers.fetch();
        console.log("API response:", response); // Log the entire response for debugging
        if (response.caregivers && Array.isArray(response.caregivers)) return response.caregivers;
        else throw new Error("Invalid response structure");
    } catch (error) {
        console.error("Error fetching caregiver profiles:", error);
        throw error;
    }
}
async function initializeDynamicCaregiverList(containerSelector) {
    // Ensure the container exists before initializing the list
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Container not found for selector:", containerSelector);
        return;
    }
    // Initialize a new instance of WFDynamicList
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#caregiverCard",
        loaderSelector: "#caregiversLoading",
        emptySelector: "#caregiversEmpty"
    });
    // Initialize the additional student list
    (0, _listAdditionalStudents.initializeDynamicAdditionalStudentList)("#listAdditionalStudentProfiles");
    let selectedEmail = null;
    let selectedCaregiverId = null;
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
            display: "block"
        });
        return emptyElement;
    });
    // Customize the rendering of list items
    list.rowRenderer(({ rowData, rowElement })=>{
        const caregiverCard = new (0, _core.WFComponent)(rowElement);
        // Element to display name or email
        const caregiverDisplayName = caregiverCard.getChildAsComponent("#caregiverEmail");
        // Conditional display of name or email
        const displayName = rowData.name ? rowData.name : rowData.email;
        caregiverDisplayName.setText(displayName);
        // Status and buttons
        const caregiverStatus = caregiverCard.getChildAsComponent("#caregiverStatus");
        const resendButton = caregiverCard.getChildAsComponent(".resend-invite-btn");
        const deleteButton = caregiverCard.getChildAsComponent(".delete-caregiver-btn");
        caregiverStatus.setText(rowData.status);
        // Hide the resend button if the status is "Active"
        if (rowData.status === "Active") resendButton.setStyle({
            display: "none"
        });
        // Attach event listener to the resend button
        resendButton.on("click", ()=>{
            const dialog = document.getElementById("resendCaregiverInviteDialog");
            if (dialog) {
                selectedEmail = rowData.email; // Store the email for later use
                console.log("Selected email:", selectedEmail);
                dialog.showModal();
                document.body.style.overflow = "hidden"; // Prevent page scroll
                const closeDialog = ()=>{
                    dialog.close();
                    document.body.style.overflow = "auto"; // Restore page scroll
                    resetResendInviteForm.getElement().click();
                };
                // Close dialog when clicking outside of it
                const closeOutsideClick = (event)=>{
                    if (event.target === dialog) closeDialog();
                };
                dialog.addEventListener("click", closeOutsideClick);
                // Close dialog on pressing ESC key
                const closeOnEsc = (event)=>{
                    if (event.key === "Escape" && dialog.open) closeDialog();
                };
                document.addEventListener("keydown", closeOnEsc);
                // Close dialog when clicking the close button
                const closeDialogBtn = dialog.querySelector("#close-dialog-btn");
                if (closeDialogBtn) closeDialogBtn.addEventListener("click", ()=>{
                    closeDialog();
                });
                // Remove event listeners when the dialog is closed
                dialog.addEventListener("close", ()=>{
                    dialog.removeEventListener("click", closeOutsideClick);
                    document.removeEventListener("keydown", closeOnEsc);
                }, {
                    once: true
                });
            } else console.error("Dialog element not found");
        });
        // Attach event listener to the delete button
        const dashboardWrapper = new (0, _core.WFComponent)(".page_main");
        deleteButton.on("click", ()=>{
            dashboardWrapper.setAttribute("data-brand", "6");
            const dialog = document.getElementById("deleteCaregiverDialog");
            if (dialog) {
                selectedCaregiverId = rowData.id; // Store the caregiver ID for later use
                console.log("Selected caregiver ID:", selectedCaregiverId);
                dialog.showModal();
                document.body.style.overflow = "hidden"; // Prevent page scroll
                const closeDialog = ()=>{
                    dialog.close();
                    document.body.style.overflow = "auto"; // Restore page scroll
                    resetDeleteCaregiverForm.getElement().click();
                    dashboardWrapper.setAttribute("data-brand", "2");
                };
                // Close dialog when clicking outside of it
                const closeOutsideClick = (event)=>{
                    if (event.target === dialog) {
                        closeDialog();
                        dashboardWrapper.setAttribute("data-brand", "2");
                    }
                };
                dialog.addEventListener("click", closeOutsideClick);
                // Close dialog on pressing ESC key
                const closeOnEsc = (event)=>{
                    if (event.key === "Escape" && dialog.open) {
                        closeDialog();
                        dashboardWrapper.setAttribute("data-brand", "2");
                    }
                };
                document.addEventListener("keydown", closeOnEsc);
                // Close dialog when clicking the close button
                const closeDialogBtn = dialog.querySelector("#close-dialog-btn");
                if (closeDialogBtn) closeDialogBtn.addEventListener("click", ()=>{
                    closeDialog();
                    dashboardWrapper.setAttribute("data-brand", "2");
                }, {
                    once: true
                });
                // Remove event listeners when the dialog is closed
                dialog.addEventListener("close", ()=>{
                    dialog.removeEventListener("click", closeOutsideClick);
                    document.removeEventListener("keydown", closeOnEsc);
                }, {
                    once: true
                });
            } else console.error("Dialog element not found");
        });
        // Show the list item
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Handle resend invite form submission
    const caregiverRequestingAnimation = new (0, _core.WFComponent)("#caregiverRequestingAnimation");
    const submitCaregiverError = new (0, _core.WFComponent)("#submitCaregiverError");
    const onSuccessTrigger = new (0, _core.WFComponent)("#resendCaregiverInviteSuccessTrigger");
    resendInviteForm.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        caregiverRequestingAnimation.setStyle({
            display: "block"
        }); // Show loading animation
        if (!selectedEmail) {
            console.error("No email selected");
            (0, _formUtils.toggleError)(submitCaregiverError, "No email selected. Please try again.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        console.log("Selected email before sending:", selectedEmail);
        // Handle reCAPTCHA verification
        const recaptchaAction = "resend_caregiver_invite";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitCaregiverError, "reCAPTCHA verification failed. Please try again.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Post data to a server endpoint
        try {
            console.log("Sending request to /caregivers/invite with data:", {
                caregiver_email: selectedEmail
            });
            const response = await (0, _apiConfig.apiClient).post("/caregivers/invite", {
                data: {
                    caregiver_email: selectedEmail
                }
            }).fetch();
            console.log("Invite sent successfully:", response);
            resendInviteForm.showSuccessState(); // Show success state
            isResendInviteSuccess = true;
            onSuccessTrigger.getElement().click(); // Trigger the resend success action
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            // Reload the caregiver list
            await reloadCaregiverList(list);
            // Reload the additional student list
            await (0, _listAdditionalStudents.reloadAdditionalStudentList)();
        } catch (error) {
            console.error("Error sending invite:", error);
            (0, _formUtils.toggleError)(submitCaregiverError, error.response?.data?.message || "Failed to send invite.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
    // Handle delete caregiver form submission
    const caregiverDeletingAnimation = new (0, _core.WFComponent)("#caregiverDeletingAnimation");
    const submitDeleteCaregiverError = new (0, _core.WFComponent)("#submitDeleteCaregiverError");
    const onDeleteSuccessTrigger = new (0, _core.WFComponent)("#deleteCaregiverSuccessTrigger");
    deleteCaregiverForm.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        caregiverDeletingAnimation.setStyle({
            display: "block"
        }); // Show loading animation
        if (!selectedCaregiverId) {
            console.error("No caregiver ID selected");
            (0, _formUtils.toggleError)(submitDeleteCaregiverError, "No caregiver ID selected. Please try again.", true);
            caregiverDeletingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        console.log("Selected caregiver ID before deleting:", selectedCaregiverId);
        // Handle reCAPTCHA verification
        const recaptchaAction = "delete_caregiver";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitDeleteCaregiverError, "reCAPTCHA verification failed. Please try again.", true);
            caregiverDeletingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Delete data from the server endpoint
        try {
            console.log(`Sending delete request to /caregivers/${selectedCaregiverId}`);
            const response = await (0, _apiConfig.apiClient).delete(`/caregivers/${selectedCaregiverId}`).fetch();
            console.log("Caregiver deleted successfully:", response);
            deleteCaregiverForm.showSuccessState(); // Show success state
            isDeleteCaregiverSuccess = true;
            onDeleteSuccessTrigger.getElement().click(); // Trigger the delete success action
            caregiverDeletingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            // Reload the caregiver list
            await reloadCaregiverList(list);
            // Reload the additional student list
            await (0, _listAdditionalStudents.reloadAdditionalStudentList)();
        } catch (error) {
            console.error("Error deleting caregiver:", error);
            (0, _formUtils.toggleError)(submitDeleteCaregiverError, error.response?.data?.message || "Failed to delete caregiver.", true);
            caregiverDeletingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
    // Initialize the form components
    const fieldsCaregiver = [
        {
            input: new (0, _core.WFComponent)("#caregiverEmailInput"),
            error: new (0, _core.WFComponent)("#caregiverEmailInputError"),
            validationFn: (0, _validationUtils.validateEmail),
            message: "Please enter a valid email address"
        }
    ];
    // Handle invite caregiver form submission
    const caregiverInviteAnimation = new (0, _core.WFComponent)("#caregiverRequestingAnimation");
    const submitInviteCaregiverError = new (0, _core.WFComponent)("#submitInviteCaregiverError");
    const inviteSuccessTrigger = new (0, _core.WFComponent)("#inviteCaregiverSuccessTrigger");
    inviteCaregiverForm.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        caregiverInviteAnimation.setStyle({
            display: "block"
        }); // Show loading animation
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsCaregiver.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitInviteCaregiverError, "Please correct all errors above.", true);
            caregiverInviteAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Handle reCAPTCHA verification
        const recaptchaAction = "invite_caregiver";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitInviteCaregiverError, "reCAPTCHA verification failed. Please try again.", true);
            caregiverInviteAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Post data to a server endpoint
        try {
            console.log("Sending request to /caregivers/invite with data:", formData);
            const response = await (0, _apiConfig.apiClient).post("/caregivers/invite", {
                data: formData
            }).fetch();
            if (response.status === "success") {
                inviteCaregiverForm.showSuccessState();
                isInviteCaregiverSuccess = true;
                inviteSuccessTrigger.getElement().click();
                caregiverInviteAnimation.setStyle({
                    display: "none"
                }); // Hide loading animation
                // Reload the caregiver list
                await reloadCaregiverList(list);
                // Reload the additional student list
                await (0, _listAdditionalStudents.reloadAdditionalStudentList)();
            }
        } catch (error) {
            (0, _formUtils.toggleError)(submitInviteCaregiverError, error.response?.data?.message || "Failed to send invite.", true);
            caregiverInviteAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
    // Load and display caregiver profiles
    try {
        await reloadCaregiverList(list);
    } catch (error) {
        console.error("Error loading caregiver profiles:", error);
    }
    // Attach event listener to the invite caregiver button
    const inviteCaregiverButton = document.getElementById("inviteCaregiver");
    if (inviteCaregiverButton) inviteCaregiverButton.addEventListener("click", ()=>{
        const dialog = document.getElementById("inviteCaregiverDialog");
        if (dialog) {
            dialog.showModal();
            document.body.style.overflow = "hidden"; // Prevent page scroll
            const closeDialog = ()=>{
                dialog.close();
                document.body.style.overflow = "auto"; // Restore page scroll
                resetCaregiverForm.getElement().click();
            };
            // Close dialog when clicking outside of it
            const closeOutsideClick = (event)=>{
                if (event.target === dialog) closeDialog();
            };
            dialog.addEventListener("click", closeOutsideClick);
            // Close dialog on pressing ESC key
            const closeOnEsc = (event)=>{
                if (event.key === "Escape" && dialog.open) closeDialog();
            };
            document.addEventListener("keydown", closeOnEsc);
            // Close dialog when clicking the close button
            const closeDialogBtn = dialog.querySelector("#close-dialog-btn");
            if (closeDialogBtn) closeDialogBtn.addEventListener("click", ()=>{
                closeDialog();
            }, {
                once: true
            });
            // Remove event listeners when the dialog is closed
            dialog.addEventListener("close", ()=>{
                dialog.removeEventListener("click", closeOutsideClick);
                document.removeEventListener("keydown", closeOnEsc);
            }, {
                once: true
            });
        } else console.error("Dialog element not found");
    });
    else console.error("Invite caregiver button not found");
}
async function reloadCaregiverList(list) {
    try {
        const caregivers = await fetchCaregiverProfiles();
        console.log("Fetched caregivers:", caregivers); // Log the fetched caregivers for debugging
        // Sort caregivers alphabetically by email
        caregivers.sort((a, b)=>a.email.localeCompare(b.email));
        list.setData(caregivers);
        // Log all resend buttons found in the dynamic list
        const resendButtons = list.getElement().querySelectorAll(".resend-invite-btn");
        console.log("Resend buttons found:", resendButtons);
        // Log all delete buttons found in the dynamic list
        const deleteButtons = list.getElement().querySelectorAll(".delete-caregiver-btn");
        console.log("Delete buttons found:", deleteButtons);
    } catch (error) {
        console.error("Error reloading caregiver profiles:", error);
    }
}

},{"@xatom/core":"j9zXV","../../api/apiConfig":"2Lx0S","../../utils/recaptchaUtils":"d0IfT","../../utils/formUtils":"hvg7i","../../utils/validationUtils":"dMBjH","./listAdditionalStudents":"f8tcP","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=dashboard.d8fc3e73.js.map
