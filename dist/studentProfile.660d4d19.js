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
})({"jwqXb":[function(require,module,exports) {
// src/modules/pages/studentProfile/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStudentProfilePage", ()=>initializeStudentProfilePage);
var _getStudentDetails = require("./getStudentDetails");
var _editStudentDialog = require("./editStudentDialog");
var _editEmergencyDialog = require("./editEmergencyDialog");
var _studentRegistrations = require("./studentRegistrations");
var _deleteStudent = require("./deleteStudent");
var _caregiverView = require("./caregiverView");
var _registrationBreadcrumbs = require("./registrationBreadcrumbs");
var _listStudentFiles = require("./listStudentFiles");
const initializeStudentProfilePage = async ()=>{
    // Get the student ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdParam = urlParams.get("id");
    if (!studentIdParam) {
        console.error("No student ID provided in the URL.");
        return;
    }
    const studentId = parseInt(studentIdParam, 10);
    // Fetch and display student details
    await (0, _getStudentDetails.getStudentDetails)(studentId);
    // Initialize the caregiver view adjustments
    (0, _caregiverView.initializeCaregiverView)();
    // Initialize the edit student dialog
    await (0, _editStudentDialog.initializeEditStudentDialog)(studentId);
    // Initialize the edit emergency contact dialog
    await (0, _editEmergencyDialog.initializeEditEmergencyDialog)(studentId);
    await (0, _listStudentFiles.initializeDynamicStudentFileList)("#filesList"); // Initialize the student files list
    // Initialize the student registrations list
    (0, _studentRegistrations.initializeStudentRegistrations)(studentId);
    // Initialize the delete student functionality
    (0, _deleteStudent.initializeDeleteStudent)(studentId);
    // Initialize registration breadcrumbs
    (0, _registrationBreadcrumbs.initializeRegistrationBreadcrumbs)(); // Initialize the breadcrumbs
    // Add an event listener to remove current_student from localStorage when navigating away
    window.addEventListener("beforeunload", ()=>{
        localStorage.removeItem("current_student");
    });
};

},{"./getStudentDetails":"9XNF0","./editStudentDialog":"12vME","./editEmergencyDialog":"5ZUsd","./studentRegistrations":"jBSrU","./deleteStudent":"djYny","./caregiverView":"13mKP","./registrationBreadcrumbs":"8dIMf","./listStudentFiles":"jV8PV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"9XNF0":[function(require,module,exports) {
// src/modules/pages/studentProfile/getStudentDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getStudentDetails", ()=>getStudentDetails);
var _apiConfig = require("../../../api/apiConfig");
var _core = require("@xatom/core");
var _image = require("@xatom/image");
const getStudentDetails = async (studentId)=>{
    // Show loading spinner
    const loadingSpinner = new (0, _core.WFComponent)(".dashboard_loading_wall");
    console.log("Displaying loading spinner");
    loadingSpinner.setStyle({
        display: "flex"
    });
    try {
        const response = await (0, _apiConfig.apiClient).get(`/dashboard/profiles/student/${studentId}`).fetch();
        if (response) {
            const student = response; // Define an interface for better type safety
            // Hide the loading spinner
            triggerSuccessEvent(".success_trigger");
            // Update the breadcrumb with the student's name
            const studentBreadcrumb = new (0, _core.WFComponent)("#studentBreadcrumb");
            studentBreadcrumb.setText(`${student.first_name} ${student.last_name}`);
            // Set student name
            const studentFullName = new (0, _core.WFComponent)("#studentFullName");
            studentFullName.setText(`${student.first_name} ${student.last_name}`);
            // Set profile picture
            const studentProfilePicture = new (0, _image.WFImage)("#studentProfilePicture");
            if (student.profile_pic && student.profile_pic.url) studentProfilePicture.setImage(student.profile_pic.url);
            else {
                console.log("No profile picture available");
                studentProfilePicture.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
            }
            // Set email
            const studentEmail = new (0, _core.WFComponent)("#studentEmail");
            studentEmail.setText(student.email || "N/A");
            // Set phone
            const studentPhone = new (0, _core.WFComponent)("#studentPhone");
            studentPhone.setText(student.phone || "N/A");
            // Set date of birth
            const studentDob = new (0, _core.WFComponent)("#studentDob");
            studentDob.setText(student.dob || "N/A");
            // Set gender
            const studentGender = new (0, _core.WFComponent)("#studentGender");
            studentGender.setText(student.gender || "N/A");
            // Set school
            const studentSchool = new (0, _core.WFComponent)("#studentSchool");
            studentSchool.setText(student.school || "N/A");
            // Set grade
            const studentGrade = new (0, _core.WFComponent)("#studentGrade");
            studentGrade.setText(student.grade || "N/A");
            // Set ethnicity (if available)
            const studentEthnicity = new (0, _core.WFComponent)("#studentEthnicity");
            studentEthnicity.setText(student.ethnicity || "N/A");
            // Set health information
            const studentHealth = new (0, _core.WFComponent)("#studentHealth");
            studentHealth.setText(student.health || "N/A");
            // Set dismissal names
            const studentDismissal = new (0, _core.WFComponent)("#studentDismissal");
            studentDismissal.setText(student.dismissal_names || "N/A");
            // Set send texts preference
            const studentTextTrue = new (0, _core.WFComponent)("#studentTextTrue");
            const studentTextFalse = new (0, _core.WFComponent)("#studentTextFalse");
            if (student.send_texts) {
                studentTextTrue.setStyle({
                    display: "block"
                });
                studentTextFalse.setStyle({
                    display: "none"
                });
            } else {
                studentTextTrue.setStyle({
                    display: "none"
                });
                studentTextFalse.setStyle({
                    display: "block"
                });
            }
            // Set independent travel
            const studentTravelTrue = new (0, _core.WFComponent)("#studentTravelTrue");
            const studentTravelFalse = new (0, _core.WFComponent)("#studentTravelFalse");
            if (student.independent_travel) {
                studentTravelTrue.setStyle({
                    display: "block"
                });
                studentTravelFalse.setStyle({
                    display: "none"
                });
            } else {
                studentTravelTrue.setStyle({
                    display: "none"
                });
                studentTravelFalse.setStyle({
                    display: "block"
                });
            }
            // Set photo release
            const studentPhotoTrue = new (0, _core.WFComponent)("#studentPhotoTrue");
            const studentPhotoFalse = new (0, _core.WFComponent)("#studentPhotoFalse");
            if (student.photo_release) {
                studentPhotoTrue.setStyle({
                    display: "block"
                });
                studentPhotoFalse.setStyle({
                    display: "none"
                });
            } else {
                studentPhotoTrue.setStyle({
                    display: "none"
                });
                studentPhotoFalse.setStyle({
                    display: "block"
                });
            }
            // Set status pills
            const studentApprovedPill = new (0, _core.WFComponent)("#studentApprovedPill");
            const studentPendingPill = new (0, _core.WFComponent)("#studentPendingPill");
            if (student.Status === "Approved") {
                studentApprovedPill.setStyle({
                    display: "block"
                });
                studentPendingPill.setStyle({
                    display: "none"
                });
            } else {
                studentApprovedPill.setStyle({
                    display: "none"
                });
                studentPendingPill.setStyle({
                    display: "block"
                });
            }
            // Save student data for later use (e.g., in edit forms)
            localStorage.setItem("current_student", JSON.stringify(student));
        } else {
            // If response is null, display an alert and navigate back
            alert("Error: Received null response from the server.");
            console.error("Received null response from the server.");
            // Navigate back to the previous page
            window.history.back();
        }
    } catch (error) {
        console.error("Error fetching student details:", error);
        // Display the error message in an alert box
        alert(`Error fetching student details: ${error.message || error}`);
        // Navigate back to the previous page
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

},{"d023971cccd819e3":"j9zXV"}],"12vME":[function(require,module,exports) {
// src/modules/pages/studentProfile/editStudentDialog.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeEditStudentDialog", ()=>initializeEditStudentDialog);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
var _getStudentDetails = require("./getStudentDetails");
const initializeEditStudentDialog = (studentId)=>{
    // Attempt to retrieve and initialize the "Open Edit Dialog" button
    let openEditDialogButton = null;
    try {
        openEditDialogButton = new (0, _core.WFComponent)("#openEditStudentDialog");
    } catch (error) {
        console.warn("Element #openEditStudentDialog not found. Skipping initialization of edit dialog opener.");
    }
    // Attempt to retrieve the edit student dialog element
    const editStudentDialogElement = document.getElementById("editStudentDialog");
    // Attempt to retrieve and initialize the "Close Dialog" button
    let closeDialogButton = null;
    try {
        closeDialogButton = new (0, _core.WFComponent)("#close-dialog-btn");
    } catch (error) {
        console.warn("Element #close-dialog-btn not found. Skipping initialization of dialog closer.");
    }
    // If the "Open Edit Dialog" button exists, set up the click event listener
    if (openEditDialogButton && editStudentDialogElement) openEditDialogButton.on("click", ()=>{
        populateEditStudentForm();
        editStudentDialogElement.showModal();
    });
    // If the "Close Dialog" button exists and the dialog element is present, set up the click event listener
    if (closeDialogButton && editStudentDialogElement) closeDialogButton.on("click", ()=>{
        editStudentDialogElement.close();
    });
    // Initialize the form if it exists
    let form = null;
    try {
        form = new (0, _core.WFFormComponent)("#editStudentForm");
    } catch (error) {
        console.warn("Element #editStudentForm not found. Skipping form initialization.");
    }
    // Initialize error component for form submission errors if it exists
    let formSubmitError = null;
    try {
        formSubmitError = new (0, _core.WFComponent)("#editStudentSubmitError");
    } catch (error) {
        console.warn("Element #editStudentSubmitError not found. Skipping initialization of form submission error display.");
    }
    // Define validation rules for each field if the form exists
    const fields = form ? [
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
            validationFn: (0, _validationUtils.validateEmailOptional),
            message: "Invalid email format"
        },
        {
            input: new (0, _core.WFComponent)("#phoneNumberInput"),
            error: new (0, _core.WFComponent)("#phoneNumberInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Phone number must be in the format (xxx) xxx-xxxx"
        },
        {
            input: new (0, _core.WFComponent)("#dobInput"),
            error: new (0, _core.WFComponent)("#dobInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Date of birth is required"
        },
        {
            input: new (0, _core.WFComponent)("#genderInput"),
            error: new (0, _core.WFComponent)("#genderInputError"),
            validationFn: (0, _validationUtils.validateSelectField),
            message: "Please select a gender"
        },
        {
            input: new (0, _core.WFComponent)("#schoolInput"),
            error: new (0, _core.WFComponent)("#schoolInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "School is required"
        },
        {
            input: new (0, _core.WFComponent)("#gradeInput"),
            error: new (0, _core.WFComponent)("#gradeInputError"),
            validationFn: (0, _validationUtils.validateSelectField),
            message: "Please select a grade"
        },
        {
            input: new (0, _core.WFComponent)("#healthInput"),
            error: new (0, _core.WFComponent)("#healthInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Health information is required"
        },
        {
            input: new (0, _core.WFComponent)("#dismissalNamesInput"),
            error: new (0, _core.WFComponent)("#dismissalNamesInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Dismissal names are required"
        },
        {
            input: new (0, _core.WFComponent)("#familyInvolvedInput"),
            error: new (0, _core.WFComponent)("#familyInvolvedInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Family involvement information is required"
        }
    ] : [];
    // Setup validation for each field if the form exists
    if (form && formSubmitError) fields.forEach(({ input, error, validationFn, message })=>{
        try {
            (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), formSubmitError);
        } catch (error) {
            console.warn(`Validation setup failed for one of the fields: ${message}. Error:`, error);
        }
    });
    // Setup checkbox components if they exist
    let sendTextsInput = null;
    let independentTravelInput = null;
    let photoReleaseInput = null;
    try {
        sendTextsInput = new (0, _core.WFComponent)("#sendTextsInput");
    } catch (error) {
        console.warn("Element #sendTextsInput not found. Skipping initialization of sendTextsInput.");
    }
    try {
        independentTravelInput = new (0, _core.WFComponent)("#independentTravelInput");
    } catch (error) {
        console.warn("Element #independentTravelInput not found. Skipping initialization of independentTravelInput.");
    }
    try {
        photoReleaseInput = new (0, _core.WFComponent)("#photoReleaseInput");
    } catch (error) {
        console.warn("Element #photoReleaseInput not found. Skipping initialization of photoReleaseInput.");
    }
    // Handle form submission if the form exists
    if (form && formSubmitError) form.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        // Show loading animation inside submit button if it exists
        let requestingAnimation = null;
        try {
            requestingAnimation = new (0, _core.WFComponent)("#requestingAnimation");
            requestingAnimation.setStyle({
                display: "block"
            });
        } catch (error) {
            console.warn("Element #requestingAnimation not found. Skipping loading animation.");
        }
        let isFormValid = true;
        // Validate all fields
        fields.forEach(({ input, error, validationFn, message })=>{
            try {
                const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
                if (errorMessage) {
                    (0, _formUtils.toggleError)(error, errorMessage, true);
                    isFormValid = false;
                } else (0, _formUtils.toggleError)(error, "", false);
            } catch (error) {
                console.warn(`Validation failed for field "${message}". Error:`, error);
                isFormValid = false;
            }
        });
        // No validation required for checkboxes since they are optional
        if (!isFormValid) {
            (0, _formUtils.toggleError)(formSubmitError, "Please correct all errors above.", true);
            // Hide loading animation if it exists
            if (requestingAnimation) requestingAnimation.setStyle({
                display: "none"
            });
            return;
        } else (0, _formUtils.toggleError)(formSubmitError, "", false);
        // Disable submit button if it exists
        let submitButton = null;
        try {
            submitButton = new (0, _core.WFComponent)("#editStudentSubmitButton");
            submitButton.setAttribute("disabled", "true");
        } catch (error) {
            console.warn("Element #editStudentSubmitButton not found. Skipping disabling the submit button.");
        }
        // Prepare data for API
        const dataToUpdate = {
            ...formData
        };
        try {
            // Send update request to API
            const response = await (0, _apiConfig.apiClient).post(`/profiles/students/update_profile/${studentId}`, {
                data: dataToUpdate
            }).fetch();
            if (response.status === "success") {
                // Update successful
                // Refresh the student details on the page
                await (0, _getStudentDetails.getStudentDetails)(studentId);
                // Reset the form with updated information
                populateEditStudentForm();
                // Close the dialog after successful request and data refresh if the dialog exists
                if (editStudentDialogElement) editStudentDialogElement.close();
            } else throw new Error(response.message || "Update failed");
        } catch (error) {
            console.error("Error updating student profile:", error);
            (0, _formUtils.toggleError)(formSubmitError, error.message || "An error occurred", true);
        } finally{
            // Hide loading animation if it exists
            if (requestingAnimation) requestingAnimation.setStyle({
                display: "none"
            });
            // Re-enable submit button if it exists
            if (submitButton) submitButton.removeAttribute("disabled");
        }
    });
    // Set up the file upload for the profile picture if the input exists
    try {
        const profilePictureInput = new (0, _core.WFComponent)("#profilePictureInput");
        const profilePictureInputError = new (0, _core.WFComponent)("#profilePictureInputError");
        const profilePictureInputSuccess = new (0, _core.WFComponent)("#profilePictureInputSuccess");
        (0, _formUtils.setupFileUpload)(profilePictureInput, profilePictureInputError, profilePictureInputSuccess, "/profiles/students/image-upload");
    } catch (error) {
        console.warn("One or more profile picture upload elements not found. Skipping file upload setup.");
    }
};
// Function to populate the form with existing student data
const populateEditStudentForm = ()=>{
    const studentData = localStorage.getItem("current_student");
    if (!studentData) {
        console.error("No student data found");
        return;
    }
    let student;
    try {
        student = JSON.parse(studentData);
    } catch (parseError) {
        console.error("Error parsing student data from localStorage:", parseError);
        return;
    }
    // Log the student data for debugging
    console.log("Populating form with student data:", student);
    // Helper function to set input value if the element exists
    const setInputValue = (selector, value, isCheckbox = false)=>{
        try {
            const element = document.querySelector(selector);
            if (element) {
                if (isCheckbox && element instanceof HTMLInputElement) {
                    element.checked = Boolean(value);
                    console.log(`Set checkbox ${selector} to`, value);
                } else if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
                    element.value = String(value);
                    console.log(`Set value of ${selector} to`, value);
                } else console.warn(`Element ${selector} is not an input, select, or textarea. Skipping setting its value.`);
            } else console.warn(`Element ${selector} not found. Skipping setting its value.`);
        } catch (error) {
            console.warn(`Error setting value for ${selector}:`, error);
        }
    };
    // Set form fields using the helper function
    setInputValue("#firstNameInput", student.first_name);
    setInputValue("#lastNameInput", student.last_name);
    setInputValue("#emailInput", student.email);
    setInputValue("#phoneNumberInput", student.phone);
    setInputValue("#sendTextsInput", student.send_texts, true);
    setInputValue("#dobInput", student.dob);
    setInputValue("#genderInput", student.gender);
    setInputValue("#schoolInput", student.school);
    setInputValue("#gradeInput", student.grade);
    setInputValue("#healthInput", student.health); // Ensure this selector matches an input/select/textarea
    setInputValue("#dismissalNamesInput", student.dismissal_names);
    setInputValue("#independentTravelInput", student.independent_travel, true);
    setInputValue("#familyInvolvedInput", student.family_involved);
    setInputValue("#photoReleaseInput", student.photo_release, true);
    // Set profile picture preview using WFImage if the element exists
    try {
        const profilePictureImage = new (0, _image.WFImage)("#profilePictureImage");
        if (student.profile_pic && student.profile_pic.url) {
            profilePictureImage.setImage(student.profile_pic.url);
            console.log("Set profile picture to:", student.profile_pic.url);
        } else {
            profilePictureImage.setImage("default-image-url");
            console.log("Set profile picture to default-image-url");
        }
    } catch (error) {
        console.warn("Element #profilePictureImage not found. Skipping setting profile picture.");
    }
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","./getStudentDetails":"9XNF0","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"5ZUsd":[function(require,module,exports) {
// src/modules/pages/studentProfile/editEmergencyDialog.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeEditEmergencyDialog", ()=>initializeEditEmergencyDialog);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
var _getStudentDetails = require("./getStudentDetails");
const initializeEditEmergencyDialog = (studentId)=>{
    const openDialogButton = new (0, _core.WFComponent)("#openEmergencyContactDialog");
    const emergencyDialog = document.getElementById("editEmergencyContactDialog");
    const closeDialogButton = new (0, _core.WFComponent)("#close-emergency-dialog-btn");
    // Open the dialog when the button is clicked
    openDialogButton.on("click", async ()=>{
        // Fetch the latest student details before populating the form
        await (0, _getStudentDetails.getStudentDetails)(studentId);
        // Populate the form with the latest emergency contact details
        populateEmergencyContactForm();
        // Update the emergency contact full name on the page
        updateEmergencyContactFullName();
        emergencyDialog.showModal();
    });
    // Close the dialog when the close button is clicked
    closeDialogButton.on("click", ()=>{
        emergencyDialog.close();
    });
    // Initialize the form
    const form = new (0, _core.WFFormComponent)("#editEmergencyContactForm");
    // Initialize error component for form submission errors
    const formSubmitError = new (0, _core.WFComponent)("#editEmergencySubmitError");
    // Define validation rules
    const fields = [
        {
            input: new (0, _core.WFComponent)("#emergencyFirstNameInput"),
            error: new (0, _core.WFComponent)("#emergencyFirstNameInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "First name is required"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyLastNameInput"),
            error: new (0, _core.WFComponent)("#emergencyLastNameInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Last name is required"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyEmailInput"),
            error: new (0, _core.WFComponent)("#emergencyEmailInputError"),
            validationFn: (0, _validationUtils.validateEmailOptional),
            message: "Invalid email format"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyPhoneInput"),
            error: new (0, _core.WFComponent)("#emergencyPhoneInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Phone number must be in the format (xxx) xxx-xxxx"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyRelationshipInput"),
            error: new (0, _core.WFComponent)("#emergencyRelationshipInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Relationship is required"
        }
    ];
    // Setup validation for each field
    fields.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), formSubmitError);
    });
    // Handle form submission
    form.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        let isFormValid = true;
        // Validate all fields
        fields.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            (0, _formUtils.toggleError)(formSubmitError, "Please correct all errors above.", true);
            return;
        } else (0, _formUtils.toggleError)(formSubmitError, "", false);
        // Show loading animation inside submit button
        const requestingAnimation = new (0, _core.WFComponent)("#requestingEmergencyAnimation");
        requestingAnimation.setStyle({
            display: "block"
        });
        // Disable submit button
        const submitButton = new (0, _core.WFComponent)("#editEmergencySubmitButton");
        submitButton.setAttribute("disabled", "true");
        // Prepare data for API
        const dataToUpdate = {
            ...formData
        };
        try {
            // Send update request to API
            const response = await (0, _apiConfig.apiClient).post(`/profiles/students/update_profile/${studentId}`, {
                data: dataToUpdate
            }).fetch();
            if (response.status === "success") {
                // Update successful
                // Refresh the student details on the page
                await (0, _getStudentDetails.getStudentDetails)(studentId);
                // Reset the form with updated information
                populateEmergencyContactForm();
                // Update the emergency contact full name on the page
                updateEmergencyContactFullName();
                // Close the dialog after successful request and data refresh
                emergencyDialog.close();
            } else throw new Error(response.message || "Update failed");
        } catch (error) {
            console.error("Error updating emergency contact:", error);
            (0, _formUtils.toggleError)(formSubmitError, error.message || "An error occurred", true);
        } finally{
            requestingAnimation.setStyle({
                display: "none"
            });
            submitButton.removeAttribute("disabled");
        }
    });
    // Update the emergency contact full name on page load
    updateEmergencyContactFullName();
};
// Function to populate the form with existing emergency contact data
const populateEmergencyContactForm = ()=>{
    const studentData = localStorage.getItem("current_student");
    if (!studentData) {
        console.error("No student data found");
        return;
    }
    const student = JSON.parse(studentData);
    // Set form fields directly from student object
    const emergencyFirstNameInput = new (0, _core.WFComponent)("#emergencyFirstNameInput").getElement();
    emergencyFirstNameInput.value = student.emergency_first_name || "";
    const emergencyLastNameInput = new (0, _core.WFComponent)("#emergencyLastNameInput").getElement();
    emergencyLastNameInput.value = student.emergency_last_name || "";
    const emergencyEmailInput = new (0, _core.WFComponent)("#emergencyEmailInput").getElement();
    emergencyEmailInput.value = student.emergency_email || "";
    const emergencyPhoneInput = new (0, _core.WFComponent)("#emergencyPhoneInput").getElement();
    emergencyPhoneInput.value = student.emergency_phone || "";
    const emergencyRelationshipInput = new (0, _core.WFComponent)("#emergencyRelationshipInput").getElement();
    emergencyRelationshipInput.value = student.emergency_relationship || "";
};
// Function to update the emergency contact full name on the page
const updateEmergencyContactFullName = ()=>{
    const studentData = localStorage.getItem("current_student");
    if (!studentData) {
        console.error("No student data found");
        return;
    }
    const student = JSON.parse(studentData);
    const fullName = `${student.emergency_first_name || ""} ${student.emergency_last_name || ""}`.trim();
    const fullNameComponent = new (0, _core.WFComponent)("#emergencyContactFullName");
    fullNameComponent.setText(fullName);
};

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","./getStudentDetails":"9XNF0","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"jBSrU":[function(require,module,exports) {
// src/modules/pages/studentProfile/studentRegistrations.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Function to fetch registrations for a student.
 * @param studentId - The ID of the student.
 * @returns A promise that resolves to an array of Registration objects.
 */ parcelHelpers.export(exports, "fetchStudentRegistrations", ()=>fetchStudentRegistrations);
/**
 * Function to initialize the dynamic list of registrations.
 * @param studentId - The ID of the student.
 */ parcelHelpers.export(exports, "initializeStudentRegistrations", ()=>initializeStudentRegistrations);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
async function fetchStudentRegistrations(studentId) {
    try {
        const response = await (0, _apiConfig.apiClient).get(`/dashboard/profiles/student/${studentId}/registrations`).fetch();
        if (response) {
            const registrations = response;
            return registrations;
        } else {
            console.error("No registrations found for the student.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching student registrations:", error);
        return [];
    }
}
async function initializeStudentRegistrations(studentId) {
    // Initialize the dynamic list
    const list = new (0, _core.WFDynamicList)("#listRegistration", {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
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
    /**
   * Customize the rendering of each registration card.
   * This includes adding necessary classes and data attributes for breadcrumb tracking.
   */ list.rowRenderer(({ rowData, rowElement })=>{
        const registrationCard = new (0, _core.WFComponent)(rowElement);
        // Retrieve the student's name from localStorage
        const currentStudent = localStorage.getItem("current_student");
        let studentName = "N/A";
        if (currentStudent) try {
            const student = JSON.parse(currentStudent);
            studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "N/A";
        } catch (parseError) {
            console.error("Error parsing current_student from localStorage:", parseError);
        }
        else console.warn("current_student not found in localStorage.");
        // Build the base URL with required parameters
        let href = `/dashboard/registration/subscription/workshop?program=${encodeURIComponent(rowData.program_id)}&subscription=${encodeURIComponent(rowData.subscription_id)}`;
        // Conditionally add the workshop parameter if workshop_id is present and not empty
        if (rowData.workshop_id && rowData.workshop_id.trim() !== "") href += `&workshop=${encodeURIComponent(rowData.workshop_id)}`;
        // Set the href attribute
        registrationCard.setAttribute("href", href);
        // Add the 'registration-link' class for event delegation
        registrationCard.addCssClass("registration-link");
        /**
     * Set data attributes required for breadcrumb tracking.
     * These attributes are essential for the registrationBreadcrumbs.ts module to function correctly.
     */ registrationCard.setAttribute("data-student-id", String(rowData.student_profile_id));
        registrationCard.setAttribute("data-student-name", studentName);
        registrationCard.setAttribute("data-workshop-name", rowData.workshop_name || "");
        registrationCard.setAttribute("data-workshop-id", rowData.workshop_id || "");
        registrationCard.setAttribute("data-program-name", rowData.program_name || "");
        registrationCard.setAttribute("data-program-id", rowData.program_id || "");
        registrationCard.setAttribute("data-subscription-id", String(rowData.subscription_id));
        // Update the program name
        const programName = registrationCard.getChildAsComponent("#cardProgramName");
        if (programName) programName.setText(rowData.program_name || "N/A");
        else console.warn("#cardProgramName not found in registrationCard.");
        // Update the workshop name, if available
        const workshopName = registrationCard.getChildAsComponent("#cardWorkshopName");
        if (workshopName) workshopName.setText(rowData.workshop_name || " ");
        else console.warn("#cardWorkshopName not found in registrationCard.");
        // Update the registration image
        const registrationImageElement = registrationCard.getChildAsComponent("#cardRegistrationImage");
        if (registrationImageElement) {
            const registrationImage = new (0, _image.WFImage)(registrationImageElement.getElement());
            if (rowData.image_url) registrationImage.setImage(rowData.image_url);
            else registrationImage.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
        } else console.warn("#cardRegistrationImage not found in registrationCard.");
        // Update the status pills
        const activePill = registrationCard.getChildAsComponent("#cardActivePill");
        const depositPill = registrationCard.getChildAsComponent("#cardDepositPill");
        if (activePill && depositPill) {
            if (rowData.status === "Active") {
                activePill.setStyle({
                    display: "block"
                });
                depositPill.setStyle({
                    display: "none"
                });
            } else if (rowData.status === "Deposit Paid") {
                activePill.setStyle({
                    display: "none"
                });
                depositPill.setStyle({
                    display: "block"
                });
            } else {
                // Handle other statuses if needed
                activePill.setStyle({
                    display: "none"
                });
                depositPill.setStyle({
                    display: "none"
                });
            }
        } else console.warn("Status pills (#cardActivePill or #cardDepositPill) not found in registrationCard.");
        // Show the registration card
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load and display the student's registrations
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        const registrations = await fetchStudentRegistrations(studentId);
        // Sort registrations by created_at date (optional)
        registrations.sort((a, b)=>b.created_at - a.created_at);
        // Set the data for the dynamic list
        list.setData(registrations);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error initializing student registrations:", error);
        // Set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"djYny":[function(require,module,exports) {
// src/modules/pages/studentProfile/deleteStudent.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Initializes the delete student functionality.
 * @param studentId - The ID of the student to be deleted.
 */ parcelHelpers.export(exports, "initializeDeleteStudent", ()=>initializeDeleteStudent);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _studentRegistrations = require("./studentRegistrations"); // Import the fetch function
function initializeDeleteStudent(studentId) {
    // Attempt to retrieve and initialize the "Open Delete Dialog" button
    let openDeleteDialogBtn = null;
    try {
        openDeleteDialogBtn = new (0, _core.WFComponent)("#openDeleteDialog");
    } catch (error) {
        console.warn("Element #openDeleteDialog not found. Skipping initialization of delete dialog opener.");
    }
    // Attempt to retrieve the delete student dialog element
    const deleteStudentDialogElement = document.getElementById("deleteStudentDialog");
    // Attempt to retrieve and initialize the "Close Delete Dialog" button
    let closeDeleteDialogBtn = null;
    try {
        closeDeleteDialogBtn = new (0, _core.WFComponent)("#close-delete-dialog-btn");
    } catch (error) {
        console.warn("Element #close-delete-dialog-btn not found. Skipping initialization of delete dialog closer.");
    }
    // Attempt to retrieve and initialize the "Final Delete" button
    let deleteStudentFinalBtn = null;
    try {
        deleteStudentFinalBtn = new (0, _core.WFComponent)("#deleteStudentFinal");
    } catch (error) {
        console.warn("Element #deleteStudentFinal not found. Skipping initialization of final delete button.");
    }
    // Attempt to retrieve and initialize the "Delete Student Error" component
    let deleteStudentError = null;
    try {
        deleteStudentError = new (0, _core.WFComponent)("#deleteStudentError");
    } catch (error) {
        console.warn("Element #deleteStudentError not found. Skipping initialization of delete student error display.");
    }
    // Attempt to retrieve and initialize the "Page Main" component
    let pageMain = null;
    try {
        pageMain = new (0, _core.WFComponent)(".page_main");
    } catch (error) {
        console.warn("Element with class .page_main not found. Skipping initialization of page main.");
    }
    // Attempt to retrieve and initialize the loader animations
    let requestingAnimation = null;
    let deleteRequestingAnimation = null;
    try {
        requestingAnimation = new (0, _core.WFComponent)("#requestingAnimation");
        deleteRequestingAnimation = new (0, _core.WFComponent)("#deleteRequestingAnimation");
        // Initially hide the loader animations
        requestingAnimation.setStyle({
            display: "none"
        });
        deleteRequestingAnimation.setStyle({
            display: "none"
        });
    } catch (error) {
        console.warn("Loader animation elements not found. Skipping initialization of loader animations.");
    }
    /**
   * Shows the delete confirmation dialog and updates the data-brand attribute.
   */ const showDeleteDialog = ()=>{
        if (deleteStudentDialogElement && pageMain) {
            deleteStudentDialogElement.showModal(); // Display the dialog
            pageMain.setAttribute("data-brand", "6"); // Update data-brand to 6
        } else console.warn("Cannot show delete dialog because either deleteStudentDialogElement or pageMain is not available.");
    };
    /**
   * Hides the delete confirmation dialog and reverts the data-brand attribute.
   */ const hideDeleteDialog = ()=>{
        if (deleteStudentDialogElement && pageMain && deleteStudentError) {
            deleteStudentDialogElement.close(); // Close the dialog
            pageMain.setAttribute("data-brand", "2"); // Revert data-brand to 2
            deleteStudentError.setStyle({
                display: "none"
            }); // Hide any previous error messages
        } else console.warn("Cannot hide delete dialog because either deleteStudentDialogElement, pageMain, or deleteStudentError is not available.");
    };
    /**
   * Handles the deletion of the student.
   */ const handleDeleteStudent = async ()=>{
        try {
            // Fetch the current registrations for the student
            const registrations = await (0, _studentRegistrations.fetchStudentRegistrations)(studentId);
            // Check if there are any current registrations
            if (registrations.length > 0) {
                alert("You must remove this student from any current registrations before you may delete them.");
                return; // Exit the function early; do not proceed with deletion
            }
            // Hide previous error messages if available
            if (deleteStudentError) deleteStudentError.setStyle({
                display: "none"
            });
            // Show the loader animation and disable the delete button if available
            if (deleteRequestingAnimation && deleteStudentFinalBtn) {
                deleteRequestingAnimation.setStyle({
                    display: "flex"
                });
                deleteStudentFinalBtn.setAttribute("disabled", "true");
            }
            // Send the DELETE request to the API
            const response = await (0, _apiConfig.apiClient).delete(`/profiles/student/${studentId}`).fetch();
            // Hide the loader animation and re-enable the delete button if available
            if (deleteRequestingAnimation && deleteStudentFinalBtn) {
                deleteRequestingAnimation.setStyle({
                    display: "none"
                });
                deleteStudentFinalBtn.removeAttribute("disabled");
            }
            if (response && response.status === 200) {
                // Successfully deleted the student
                // Optionally, display a success message before redirecting
                alert("Student has been successfully deleted.");
                // Redirect to the students list page or another appropriate page
                window.location.href = "/dashboard"; // Adjust the URL as needed
            } else // Handle unexpected successful responses
            throw new Error("Unexpected response from the server.");
        } catch (error) {
            console.error("Error deleting student:", error);
            // Hide the loader animation and re-enable the delete button if available
            if (deleteRequestingAnimation && deleteStudentFinalBtn) {
                deleteRequestingAnimation.setStyle({
                    display: "none"
                });
                deleteStudentFinalBtn.removeAttribute("disabled");
            }
            // Display the error message if the error component exists
            if (deleteStudentError) {
                deleteStudentError.setStyle({
                    display: "flex"
                });
                try {
                    deleteStudentError.getChildAsComponent(".error-text").setText(error.message || "An unexpected error occurred while deleting the student.");
                } catch (childError) {
                    console.warn("Could not set text for .error-text within #deleteStudentError:", childError);
                }
            }
        }
    };
    // Event listener to open the delete dialog if the open button and dialog exist
    if (openDeleteDialogBtn && deleteStudentDialogElement && pageMain) openDeleteDialogBtn.on("click", showDeleteDialog);
    else console.warn("Cannot attach click event to #openDeleteDialog because required elements are missing.");
    // Event listener to close the delete dialog if the close button and dialog exist
    if (closeDeleteDialogBtn && deleteStudentDialogElement && pageMain && deleteStudentError) closeDeleteDialogBtn.on("click", hideDeleteDialog);
    else console.warn("Cannot attach click event to #close-delete-dialog-btn because required elements are missing.");
    // Event listener for the final delete action if the delete button exists
    if (deleteStudentFinalBtn) deleteStudentFinalBtn.on("click", handleDeleteStudent);
    else console.warn("Cannot attach click event to #deleteStudentFinal because the element is missing.");
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","./studentRegistrations":"jBSrU","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"13mKP":[function(require,module,exports) {
// src/modules/pages/studentProfile/caregiverView.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeCaregiverView", ()=>initializeCaregiverView);
var _core = require("@xatom/core");
const initializeCaregiverView = ()=>{
    // Retrieve the current student data from localStorage
    const studentData = localStorage.getItem("current_student");
    if (!studentData) {
        console.error("No student data found in localStorage.");
        return;
    }
    let student;
    try {
        student = JSON.parse(studentData);
    } catch (parseError) {
        console.error("Error parsing student data from localStorage:", parseError);
        return;
    }
    // Check if the current user is a caregiver
    if (student.caregiver === true) {
        // List of DOM selectors to remove for caregivers
        const selectorsToRemove = [
            "#openEditStudentDialog",
            "#openDeleteDialog",
            "#editEmergencySubmitButton",
            "#editStudentDialog",
            "#deleteStudentDialog"
        ];
        // Iterate over each selector and remove the corresponding element from the DOM
        selectorsToRemove.forEach((selector)=>{
            try {
                const component = new (0, _core.WFComponent)(selector);
                component.remove();
                console.log(`Removed element with selector: ${selector}`);
            } catch (error) {
                console.error(`Failed to remove element with selector ${selector}:`, error);
            }
        });
        // Disable the edit emergency contact form to prevent submission
        try {
            const editEmergencyForm = new (0, _core.WFFormComponent)("#editEmergencyContactForm");
            editEmergencyForm.disableForm();
            console.log("Disabled #editEmergencyContactForm to prevent submissions.");
        } catch (error) {
            console.error("Failed to disable #editEmergencyContactForm:", error);
        }
    } else console.log("Current user is not a caregiver. No changes applied.");
};

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"8dIMf":[function(require,module,exports) {
// src/modules/pages/studentProfile/registrationBreadcrumbs.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeRegistrationBreadcrumbs", ()=>initializeRegistrationBreadcrumbs);
const initializeRegistrationBreadcrumbs = ()=>{
    // Define the selector for registration links.
    // Update this selector based on the actual structure of your registration links.
    const registrationLinkSelector = ".registration-link";
    /**
   * Event handler for registration link clicks.
   * @param event - The click event.
   */ const handleRegistrationClick = (event)=>{
        // Prevent the default action if necessary.
        // Uncomment the next line if you want to handle navigation manually.
        // event.preventDefault();
        const target = event.target;
        // Traverse up the DOM to find the registration link element if the click is on a child element.
        const registrationLink = target.closest(registrationLinkSelector);
        if (!registrationLink) {
            console.warn("Clicked element is not a registration link.");
            return;
        }
        // Extract data attributes from the registration link.
        const studentId = parseInt(registrationLink.getAttribute("data-student-id") || "0", 10);
        const studentName = registrationLink.getAttribute("data-student-name") || "";
        const workshopName = registrationLink.getAttribute("data-workshop-name") || "";
        const workshopId = registrationLink.getAttribute("data-workshop-id") || "";
        const programName = registrationLink.getAttribute("data-program-name") || "";
        const programId = registrationLink.getAttribute("data-program-id") || "";
        const subscriptionId = parseInt(registrationLink.getAttribute("data-subscription-id") || "0", 10);
        // Validate the extracted data.
        if (!studentId || !studentName || !programName || !programId || !subscriptionId) {
            console.error("Incomplete registration data. Cannot set caregiver_breadcrumbs.");
            return;
        }
        // Create the caregiver_breadcrumbs object.
        const caregiverBreadcrumbs = {
            student_id: studentId,
            student_name: studentName,
            workshop_name: workshopName,
            workshop_id: workshopId,
            program_name: programName,
            program_id: programId,
            subscription_id: subscriptionId
        };
        // Store the object in localStorage.
        try {
            localStorage.setItem("caregiver_breadcrumbs", JSON.stringify(caregiverBreadcrumbs));
            console.log("caregiver_breadcrumbs set in localStorage:", caregiverBreadcrumbs);
        } catch (error) {
            console.error("Failed to set caregiver_breadcrumbs in localStorage:", error);
        }
    };
    /**
   * Attaches the event listener using event delegation.
   */ const attachEventListener = ()=>{
        // Attach the event listener to a common ancestor.
        // Update the selector based on your DOM structure. Here, we use the document body.
        const commonAncestor = document.body;
        if (!commonAncestor) {
            console.error("Common ancestor for event delegation not found.");
            return;
        }
        commonAncestor.addEventListener("click", handleRegistrationClick);
        console.log("Event listener for registration links attached.");
    };
    // Initialize the event listeners.
    attachEventListener();
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"jV8PV":[function(require,module,exports) {
// src/pages/listStudentFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files for a specific student
parcelHelpers.export(exports, "fetchStudentFiles", ()=>fetchStudentFiles);
// Function to initialize and render the dynamic file list for a student
parcelHelpers.export(exports, "initializeDynamicStudentFileList", ()=>initializeDynamicStudentFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
// Function to get the student_id from URL parameters
function getStudentIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}
async function fetchStudentFiles(studentId) {
    try {
        const getFiles = (0, _apiConfig.apiClient).get(`/student_files/student/${studentId}`);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for student:", error);
        throw error;
    }
}
async function initializeDynamicStudentFileList(containerSelector) {
    // Get the student ID from the URL
    const studentId = getStudentIdFromUrl();
    if (!studentId) {
        console.error("No student ID provided in URL");
        return;
    }
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
        const files = await fetchStudentFiles(studentId);
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

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=studentProfile.660d4d19.js.map
