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
})({"aQGG5":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/addStudentProfile.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "addStudentProfile", ()=>addStudentProfile);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _slider = require("@xatom/slider");
var _formUtils = require("../../../../utils/formUtils");
var _validationUtils = require("../../../../utils/validationUtils");
var _recaptchaUtils = require("../../../../utils/recaptchaUtils"); // Ensure this function is implemented for reCAPTCHA handling
var _apiConfig = require("../../../../api/apiConfig");
// Import sidebar indicator functions
var _sidebarIndicators = require("./sidebarIndicators"); // Adjust the import path as necessary
const addStudentProfile = async ()=>{
    console.log("Initialize Add Student Form");
    // Initialize the sidebar indicators
    (0, _sidebarIndicators.initializeSidebarIndicators)();
    // Initialize the slider
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    // Initialize the form components
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    const caregiverForm = new (0, _core.WFFormComponent)("#inviteCaregiverDialog");
    const formStepFive = new (0, _core.WFFormComponent)("#formStepFive");
    const formStepSix = new (0, _core.WFFormComponent)("#formStepSix");
    const formStepSeven = new (0, _core.WFFormComponent)("#formStepSeven");
    // Initialize the form submit buttons
    const submitStepOne = new (0, _core.WFComponent)("#submitStepOne");
    const submitStepTwo = new (0, _core.WFComponent)("#submitStepTwo");
    const submitStepThree = new (0, _core.WFComponent)("#submitStepThree");
    const submitStepFour = new (0, _core.WFComponent)("#submitStepFour");
    const submitStepFive = new (0, _core.WFComponent)("#submitStepFive");
    const submitStepSix = new (0, _core.WFComponent)("#submitStepSix");
    const submitStepSeven = new (0, _core.WFComponent)("#submitStepSeven");
    const submitStepEight = new (0, _core.WFComponent)("#submitStepEight");
    const submitStepNine = new (0, _core.WFComponent)("#submitStepNine");
    // Requesting animations
    const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
    const caregiverRequestingAnimation = new (0, _core.WFComponent)("#caregiverRequestingAnimation");
    const stepEightRequestingAnimation = new (0, _core.WFComponent)("#stepEightRequestingAnimation");
    // Initialize submit error messages
    const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
    const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
    const submitStepThreeError = new (0, _core.WFComponent)("#submitStepThreeError");
    const submitCaregiverError = new (0, _core.WFComponent)("#submitInviteCaregiverError");
    const submitStepFiveError = new (0, _core.WFComponent)("#submitStepFiveError");
    const submitStepSixError = new (0, _core.WFComponent)("#submitStepSixError");
    const submitStepSevenError = new (0, _core.WFComponent)("#submitStepSevenError");
    const submitStepEightError = new (0, _core.WFComponent)("#submitStepEightError");
    // const submitStepNineError = new WFComponent("#submitStepNineError"); // Uncomment if needed
    // Initialize back buttons
    const backStepTwo = new (0, _core.WFComponent)("#backStepTwo");
    const backStepThree = new (0, _core.WFComponent)("#backStepThree");
    const backStepFour = new (0, _core.WFComponent)("#backStepFour");
    const backStepFive = new (0, _core.WFComponent)("#backStepFive");
    const backStepSix = new (0, _core.WFComponent)("#backStepSix");
    const backStepSeven = new (0, _core.WFComponent)("#backStepSeven");
    const backStepEight = new (0, _core.WFComponent)("#backStepEight");
    const backStepTen = new (0, _core.WFComponent)("#backStepTen");
    // Attach event listeners to back buttons with event.preventDefault()
    const attachBackButtonListeners = ()=>{
        backStepTwo.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Two clicked");
            slider.goPrevious();
            // Unmark Step 2 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(1);
            (0, _sidebarIndicators.unsetActiveStep)(2);
        });
        backStepThree.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Three clicked");
            slider.goPrevious();
            // Unmark Step 3 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(2);
            (0, _sidebarIndicators.unsetActiveStep)(3);
        });
        backStepFour.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Four clicked");
            slider.goPrevious();
            // Unmark Step 4 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(3);
            (0, _sidebarIndicators.unsetActiveStep)(4);
        });
        backStepFive.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Five clicked");
            slider.goPrevious();
            // Unmark Step 5 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(4);
            (0, _sidebarIndicators.unsetActiveStep)(5);
        });
        backStepSix.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Six clicked");
            slider.goPrevious();
            // Unmark Step 6 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(5);
            (0, _sidebarIndicators.unsetActiveStep)(6);
        });
        backStepSeven.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Seven clicked");
            slider.goPrevious();
            // Unmark Step 7 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(6);
            (0, _sidebarIndicators.unsetActiveStep)(7);
        });
        backStepEight.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Eight clicked");
            slider.goPrevious();
            // Unmark Step 8 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(7);
            (0, _sidebarIndicators.unsetActiveStep)(8);
        });
        backStepTen.on("click", (event)=>{
            event.preventDefault();
            console.log("Back button for Step Ten clicked");
            slider.goPrevious();
            // Unmark Step 10 as it's no longer completed
            (0, _sidebarIndicators.unmarkStepAsCompleted)(9);
            (0, _sidebarIndicators.unsetActiveStep)(10);
        });
    };
    // Initialize the slider's slide change handler using imported functions
    slider.onSlideChange((activeIndex, prevIndex)=>{
        console.log(`Slide changed from ${prevIndex} to ${activeIndex}`);
        // Set the active step in the sidebar
        (0, _sidebarIndicators.setActiveStep)(activeIndex + 1);
        if (prevIndex !== -1 && prevIndex < activeIndex) // Moving forward: mark the previous step as completed
        (0, _sidebarIndicators.markStepAsCompleted)(prevIndex + 1);
        if (prevIndex !== -1 && prevIndex > activeIndex) // Moving backward: unmark steps beyond the current
        (0, _sidebarIndicators.unmarkStepAsCompleted)(prevIndex + 1);
    });
    // Set the initial active sidebar step
    (0, _sidebarIndicators.setActiveStep)(slider.getActiveSlideIndex() + 1);
    /// Profile link elements
    const studentProfileLinkTemplate = new (0, _core.WFComponent)("#studentCard");
    const profileCardImg = new (0, _image.WFImage)("#profileCardImg");
    // Step 1
    // Check if current_student exists in local storage
    const existingStudent = localStorage.getItem("current_student");
    if (existingStudent) {
        const student = JSON.parse(existingStudent);
        formStepOne.setFromData({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone: student.phone,
            send_texts: student.send_texts
        });
    }
    // Define fields with associated validation rules and messages
    const fieldsStepOne = [
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
            message: "Please enter a valid email address"
        },
        {
            input: new (0, _core.WFComponent)("#phoneNumberInput"),
            error: new (0, _core.WFComponent)("#phoneNumberInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Please enter a valid phone number"
        }
    ];
    // Auto format phone number input to (xxx) xxx-xxxx
    const phoneNumberInput = new (0, _core.WFComponent)("#phoneNumberInput");
    phoneNumberInput.on("input", ()=>{
        const inputElement = phoneNumberInput.getElement();
        const cursorPosition = inputElement.selectionStart;
        inputElement.value = (0, _formUtils.formatPhoneNumber)(inputElement.value);
        // Adjust the cursor position after formatting
        const formattedLength = inputElement.value.length;
        const cleanedLength = inputElement.value.replace(/\D/g, "").length;
        inputElement.setSelectionRange(cursorPosition + (formattedLength - cleanedLength), cursorPosition + (formattedLength - cleanedLength));
    });
    // Initialize validation for Step One input fields
    fieldsStepOne.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepOneError);
    });
    // Handle Step One form submission
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        stepOneRequestingAnimation.setStyle({
            display: "block"
        }); // Show loading animation
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepOne.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepOneError, "Please correct all errors above.", true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Check if a student profile already exists in local storage
        const existingStudentCheck = localStorage.getItem("current_student");
        if (existingStudentCheck) {
            // Skip creating a new profile and navigate directly to the next step
            (0, _sidebarIndicators.markStepAsCompleted)(1); // Mark Step 1 as completed
            slider.goNext();
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Handle reCAPTCHA verification
        const recaptchaAction = "create_account";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitStepThreeError, "reCAPTCHA verification failed. Please try again.", true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Prepare form data for Step One
        const formStepOneData = formStepOne.getFormData();
        // Post data to a server endpoint
        try {
            const response = await (0, _apiConfig.apiClient).post("/profiles/students/create-student", {
                data: formStepOneData
            }).fetch();
            if (response.status === "success") {
                const { profile } = response;
                // Store student object from response as current_student in local storage
                localStorage.setItem("current_student", JSON.stringify(profile));
                // Mark Step 1 as completed
                (0, _sidebarIndicators.markStepAsCompleted)(1);
                // Navigate to the next step
                slider.goNext();
                stepOneRequestingAnimation.setStyle({
                    display: "none"
                }); // Hide loading animation
            }
        } catch (error) {
            (0, _formUtils.toggleError)(submitStepOneError, error.response?.data?.message || "Failed to create account.", true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
    });
    // Step 2
    // File upload handling
    const profilePictureInput = new (0, _core.WFComponent)("#profilePictureInput");
    const profilePictureInputError = new (0, _core.WFComponent)("#profilePictureInputError");
    const profilePictureInputSuccess = new (0, _core.WFComponent)("#profilePictureInputSuccess");
    (0, _formUtils.setupFileUpload)(profilePictureInput, profilePictureInputError, profilePictureInputSuccess, "/profiles/students/image-upload" // Replace with your actual endpoint
    ).then((imageUrl)=>{
        console.log("Image uploaded successfully: ", imageUrl);
        // Optionally, store the image URL or perform additional actions
        localStorage.setItem("image_upload", imageUrl);
    }).catch((error)=>{
        console.error("Error uploading image: ", error.message);
    });
    // Define fields with associated validation rules and messages for Step Two
    const fieldsStepTwo = [
        {
            input: new (0, _core.WFComponent)("#gradeInput"),
            error: new (0, _core.WFComponent)("#gradeInputError"),
            validationFn: (0, _validationUtils.validateSelectField),
            message: "Grade is required"
        },
        {
            input: new (0, _core.WFComponent)("#schoolInput"),
            error: new (0, _core.WFComponent)("#schoolInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "School is required"
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
            message: "Please select an option"
        }
    ];
    // Initialize validation for Step Two input fields
    fieldsStepTwo.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepTwoError);
    });
    // Handle Step Two form submission
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepTwo.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepTwoError, "Please correct all errors above.", true);
            return;
        }
        // Mark Step 2 as completed
        (0, _sidebarIndicators.markStepAsCompleted)(2);
        // Navigate to the next step
        slider.goNext();
    });
    // Step 3
    // Define fields with associated validation rules and messages for Step Three
    const fieldsStepThree = [
        {
            input: new (0, _core.WFComponent)("#healthInput"),
            error: new (0, _core.WFComponent)("#healthInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Health information is required"
        }
    ];
    // Initialize validation for Step Three input fields
    fieldsStepThree.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepThreeError);
    });
    // Handle Step Three form submission
    formStepThree.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepThree.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepThreeError, "Please correct all errors above.", true);
            return;
        }
        // Mark Step 3 as completed
        (0, _sidebarIndicators.markStepAsCompleted)(3);
        // Navigate to the next step
        slider.goNext();
    });
    // Step 4: Add Caregiver Form
    // Initialize Success trigger
    const onSuccessTrigger = new (0, _core.WFComponent)("#inviteCaregiverSuccessTrigger");
    // Define fields with associated validation rules and messages for Caregiver Form
    const fieldsCaregiver = [
        {
            input: new (0, _core.WFComponent)("#caregiverEmailInput"),
            error: new (0, _core.WFComponent)("#caregiverEmailInputError"),
            validationFn: (0, _validationUtils.validateEmail),
            message: "Please enter a valid email address"
        }
    ];
    // Initialize validation for Caregiver input fields
    fieldsCaregiver.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitCaregiverError);
    });
    // Handle Caregiver form submission
    caregiverForm.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        caregiverRequestingAnimation.setStyle({
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
            (0, _formUtils.toggleError)(submitCaregiverError, "Please correct all errors above.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Handle reCAPTCHA verification
        const recaptchaAction = "complete_caregiver";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitStepThreeError, "reCAPTCHA verification failed. Please try again.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Post data to a server endpoint
        try {
            const response = await (0, _apiConfig.apiClient).post("/caregivers/invite", {
                data: formData
            }).fetch();
            if (response.status === "success") {
                caregiverForm.showSuccessState();
                onSuccessTrigger.getElement().click();
                caregiverRequestingAnimation.setStyle({
                    display: "none"
                }); // Hide loading animation
                // Mark Step 4 as completed
                (0, _sidebarIndicators.markStepAsCompleted)(4);
            }
        } catch (error) {
            (0, _formUtils.toggleError)(submitCaregiverError, error.response?.data?.message || "Failed to invite caregiver.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
    });
    // Initialize reset form button for Caregiver Form
    const resetCaregiverForm = new (0, _core.WFComponent)("#resetCaregiverForm");
    resetCaregiverForm.on("click", ()=>{
        caregiverForm.resetForm();
        caregiverForm.showForm();
        onSuccessTrigger.getElement().click();
    });
    // Continue to Step Five
    submitStepFour.on("click", ()=>{
        // Mark Step 4 as completed before navigating
        (0, _sidebarIndicators.markStepAsCompleted)(4);
        slider.goNext();
    });
    // Step 5
    // Define fields with associated validation rules and messages for Step Five
    const fieldsStepFive = [
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
            validationFn: (0, _validationUtils.validateEmail),
            message: "Please enter a valid email address"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyPhoneInput"),
            error: new (0, _core.WFComponent)("#emergencyPhoneInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Please enter a valid phone number"
        },
        {
            input: new (0, _core.WFComponent)("#emergencyRelationshipInput"),
            error: new (0, _core.WFComponent)("#emergencyRelationshipInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Relationship is required"
        }
    ];
    // Auto format emergency phone number input to (xxx) xxx-xxxx
    const emergencyPhoneNumberInput = new (0, _core.WFComponent)("#emergencyPhoneInput");
    emergencyPhoneNumberInput.on("input", ()=>{
        const inputElement = emergencyPhoneNumberInput.getElement();
        const cursorPosition = inputElement.selectionStart;
        inputElement.value = (0, _formUtils.formatPhoneNumber)(inputElement.value);
        // Adjust the cursor position after formatting
        const formattedLength = inputElement.value.length;
        const cleanedLength = inputElement.value.replace(/\D/g, "").length;
        inputElement.setSelectionRange(cursorPosition + (formattedLength - cleanedLength), cursorPosition + (formattedLength - cleanedLength));
    });
    // Initialize validation for Step Five input fields
    fieldsStepFive.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepFiveError);
    });
    // Handle Step Five form submission
    formStepFive.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepFive.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepFiveError, "Please correct all errors above.", true);
            return;
        }
        // Mark Step 5 as completed
        (0, _sidebarIndicators.markStepAsCompleted)(5);
        // Navigate to the next step
        slider.goNext();
    });
    // Step 6
    // Define fields with associated validation rules and messages for Step Six
    const fieldsStepSix = [
        {
            input: new (0, _core.WFComponent)("#dismissalNamesInput"),
            error: new (0, _core.WFComponent)("#dismissalNamesInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Dismissal names are required"
        }
    ];
    // Initialize validation for Step Six input fields
    fieldsStepSix.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepSixError);
    });
    // Handle Step Six form submission
    formStepSix.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepSix.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepSixError, "Please correct all errors above.", true);
            return;
        }
        // Mark Step 6 as completed
        (0, _sidebarIndicators.markStepAsCompleted)(6);
        // Navigate to the next step
        slider.goNext();
    });
    // Step 7
    // Define fields with associated validation rules and messages for Step Seven
    const fieldsStepSeven = [
        {
            input: new (0, _core.WFComponent)("#familyInvolvedInput"),
            error: new (0, _core.WFComponent)("#familyInvolvedInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Family involvement is required"
        },
        {
            input: new (0, _core.WFComponent)("#photoReleaseInput"),
            error: new (0, _core.WFComponent)("#photoReleaseInputError"),
            validationFn: ()=>true,
            message: ""
        }
    ];
    // Initialize validation for Step Seven input fields
    fieldsStepSeven.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), submitStepSevenError);
    });
    // Handle Step Seven form submission
    formStepSeven.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        let isFormValid = true;
        // Validate all fields before proceeding
        fieldsStepSeven.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            console.log("Validation failed:", formData);
            (0, _formUtils.toggleError)(submitStepSevenError, "Please correct all errors above.", true);
            return;
        }
        // Mark Step 7 as completed
        (0, _sidebarIndicators.markStepAsCompleted)(7);
        // Navigate to the next step
        slider.goNext();
    });
    // Step 8: Review and Save
    // Initialize form review items
    const studentProfilePic = new (0, _image.WFImage)("#studentProfilePic");
    const studentFullName = new (0, _core.WFComponent)("#studentFullName");
    const studentEmail = new (0, _core.WFComponent)("#studentEmail");
    const studentPhone = new (0, _core.WFComponent)("#studentPhone");
    const studentGrade = new (0, _core.WFComponent)("#studentGrade");
    const studentSchool = new (0, _core.WFComponent)("#studentSchool");
    const studentDOB = new (0, _core.WFComponent)("#studentDOB");
    const studentGender = new (0, _core.WFComponent)("#studentGender");
    const studentHealth = new (0, _core.WFComponent)("#studentHealth");
    const studentEmergencyName = new (0, _core.WFComponent)("#studentEmergencyName");
    const studentEmergencyEmail = new (0, _core.WFComponent)("#studentEmergencyEmail");
    const studentEmergencyPhone = new (0, _core.WFComponent)("#studentEmergencyPhone");
    const studentEmergencyRelationship = new (0, _core.WFComponent)("#studentEmergencyRelationship");
    const studentDismissalNames = new (0, _core.WFComponent)("#studentDismissalNames");
    const studentTravelTrue = new (0, _core.WFComponent)("#studentTravelTrue");
    const studentTravelFalse = new (0, _core.WFComponent)("#studentTravelFalse");
    const studentFamily = new (0, _core.WFComponent)("#studentFamily");
    const studentPhotoTrue = new (0, _core.WFComponent)("#studentPhotoTrue");
    const studentPhotoFalse = new (0, _core.WFComponent)("#studentPhotoFalse");
    const getFormData = ()=>{
        const formStepOneData = formStepOne.getFormData();
        const formStepTwoData = formStepTwo.getFormData();
        const formStepThreeData = formStepThree.getFormData();
        const formStepFiveData = formStepFive.getFormData();
        const formStepSixData = formStepSix.getFormData();
        const formStepSevenData = formStepSeven.getFormData();
        // Retrieve the existing student's ID from local storage
        const existingStudent = localStorage.getItem("current_student");
        const studentId = existingStudent ? JSON.parse(existingStudent).id : null;
        const formData = {
            ...formStepOneData,
            ...formStepTwoData,
            ...formStepThreeData,
            ...formStepFiveData,
            ...formStepSixData,
            ...formStepSevenData
        };
        // Add the ID to the form data
        if (studentId) formData.student_id = studentId;
        return formData;
    };
    // Function to set form review items using getFormData as a callback
    const setFormReviewItems = ()=>{
        const data = getFormData();
        if (localStorage.getItem("image_upload")) {
            const image = localStorage.getItem("image_upload");
            studentProfilePic.setImage(image);
        } else studentProfilePic.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
        studentFullName.setText(`${data.first_name} ${data.last_name}`);
        studentEmail.setText(data.email);
        studentPhone.setText(data.phone);
        studentGrade.setText(data.grade);
        studentSchool.setText(data.school);
        studentDOB.setText(data.dob);
        studentGender.setText(data.gender);
        studentHealth.setText(data.health);
        studentEmergencyName.setText(`${data.emergency_first_name} ${data.emergency_last_name}`);
        studentEmergencyEmail.setText(data.emergency_email);
        studentEmergencyPhone.setText(data.emergency_phone);
        studentEmergencyRelationship.setText(data.emergency_relationship);
        studentDismissalNames.setText(data.dismissal_names);
        studentFamily.setText(data.family_involved);
        if (data.independent_travel) {
            studentTravelTrue.setStyle({
                display: "block"
            });
            studentTravelFalse.setStyle({
                display: "none"
            });
        } else {
            studentTravelFalse.setStyle({
                display: "block"
            });
            studentTravelTrue.setStyle({
                display: "none"
            });
        }
        if (data.photo_release) {
            studentPhotoTrue.setStyle({
                display: "block"
            });
            studentPhotoFalse.setStyle({
                display: "none"
            });
        } else {
            studentPhotoFalse.setStyle({
                display: "block"
            });
            studentPhotoTrue.setStyle({
                display: "none"
            });
        }
    };
    // On slide change, set the form review items
    slider.onSlideChange((activeIndex, prevIndex)=>{
        // Only set review items when on Step 8 (index 7)
        if (activeIndex === 7) setFormReviewItems();
        // Handle sidebar step completion
        if (prevIndex !== -1 && prevIndex < activeIndex) // Moving forward: mark the previous step as completed
        (0, _sidebarIndicators.markStepAsCompleted)(prevIndex + 1);
        if (prevIndex !== -1 && prevIndex > activeIndex) // Moving backward: unmark steps beyond the current
        (0, _sidebarIndicators.unmarkStepAsCompleted)(prevIndex + 1);
        // Set active step
        (0, _sidebarIndicators.setActiveStep)(activeIndex + 1);
    });
    // Handle Step Eight form submission (Review and Save)
    submitStepEight.on("click", async (event)=>{
        event.preventDefault(); // Stop the form from submitting normally
        stepEightRequestingAnimation.setStyle({
            display: "block"
        }); // Show loading animation
        // Handle reCAPTCHA verification
        const recaptchaAction = "complete_student";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(submitStepEightError, "reCAPTCHA verification failed. Please try again.", true);
            stepEightRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        const formData = getFormData();
        try {
            const response = await (0, _apiConfig.apiClient).post("/profiles/students/complete-profile", {
                data: formData
            }).fetch();
            // Depending on how apiClient.post().fetch() returns the response,
            // you might need to adjust the following line.
            // For example, if response.body contains the actual data:
            // if (response.body.status === "success") {
            if (response.status === "success") {
                const { profile } = response;
                // Update the profileLinkTemplate with returned data
                studentProfileLinkTemplate.updateTextViaAttrVar({
                    name: `${profile.first_name} ${profile.last_name}`,
                    email: profile.email,
                    phone: profile.phone
                });
                // Safely handle profile_pic
                if (profile.profile_pic && profile.profile_pic.url) profileCardImg.setImage(profile.profile_pic.url);
                else profileCardImg.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg" // Default fallback image
                );
                // Clear current student from local storage
                localStorage.removeItem("current_student");
                localStorage.removeItem("image_upload"); // Clear image upload if stored
                // Hide loading animation
                stepEightRequestingAnimation.setStyle({
                    display: "none"
                });
                // Mark Step 8 as completed
                (0, _sidebarIndicators.markStepAsCompleted)(8);
                // Go to next step
                slider.goNext();
            } else {
                // Handle unexpected success response formats
                (0, _formUtils.toggleError)(submitStepEightError, "Unexpected response from the server.", true);
                stepEightRequestingAnimation.setStyle({
                    display: "none"
                }); // Hide loading animation
            }
        } catch (error) {
            console.error("Error completing profile:", error); // Detailed error logging
            (0, _formUtils.toggleError)(submitStepEightError, error.response?.data?.message || "Failed to complete profile.", true);
            stepEightRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
    });
    // Step 9: Add another student or pick next action
    // Student Profile Card
    // Continue to next step
    submitStepNine.on("click", ()=>{
        slider.goNext();
    });
    // Ensure back buttons are correctly attached
    attachBackButtonListeners();
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","@xatom/slider":"2zMuG","../../../../utils/formUtils":"hvg7i","../../../../utils/validationUtils":"dMBjH","../../../../utils/recaptchaUtils":"d0IfT","../../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","./sidebarIndicators":"1WUka"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"2zMuG":[function(require,module,exports) {
var e = require("1a87f3bc23b90fa3"), s = require("37b5fd8189a9f4c7");
var t, i, r, l, d = {};
t = d, i = "WFSlider", r = ()=>o, Object.defineProperty(t, i, {
    get: r,
    set: l,
    enumerable: !0,
    configurable: !0
});
const n = window.jQuery;
class o extends e.WFComponent {
    _sliderConfig = {};
    _slides = [];
    _defaultSwipeDisabled = !1;
    _index = 0;
    _listeners = new Map;
    constructor(e){
        super(e), this.init();
    }
    init() {
        this._defaultSwipeDisabled = "true" === this.getAttribute("data-disable-swipe"), this._sliderConfig = n(this.getElement()).data()[".wSlider"], this._slides = Array.from(this._sliderConfig.slides).map((s)=>new e.WFComponent(s)), this._mask = new e.WFComponent(this._sliderConfig.mask[0]), this._nav = new e.WFComponent(this._sliderConfig.nav[0]), this._left = new e.WFComponent(this._sliderConfig.left[0]), this._right = new e.WFComponent(this._sliderConfig.right[0]), function(e, s) {
            if (!document.styleSheets) return;
            if (0 == document.getElementsByTagName("head").length) return;
            let t, i;
            if (document.styleSheets.length > 0) {
                for(var r = 0, l = document.styleSheets.length; r < l; r++)if (!document.styleSheets[r].disabled) {
                    var d = document.styleSheets[r].media;
                    if (i = typeof d, "string" === i ? "" !== d && -1 === d.indexOf("screen") || (t = document.styleSheets[r]) : "object" == i && ("" !== d.mediaText && -1 === d.mediaText.indexOf("screen") || (t = document.styleSheets[r])), void 0 !== t) break;
                }
            }
            if (void 0 === t) {
                var n = document.createElement("style");
                for(n.type = "text/css", document.getElementsByTagName("head")[0].appendChild(n), r = 0; r < document.styleSheets.length; r++)document.styleSheets[r].disabled || (t = document.styleSheets[r]);
                i = typeof t.media;
            }
            if ("string" === i) {
                for(r = 0, l = t.rules.length; r < l; r++)if (t.rules[r].selectorText && t.rules[r].selectorText.toLowerCase() == e.toLowerCase()) return void (t.rules[r].style.cssText = s);
                t.addRule(e, s);
            } else if ("object" === i) {
                var o = t.cssRules ? t.cssRules.length : 0;
                for(r = 0; r < o; r++)if (t.cssRules[r].selectorText && t.cssRules[r].selectorText.toLowerCase() == e.toLowerCase()) return void (t.cssRules[r].style.cssText = s);
                t.insertRule(e + "{" + s + "}", o);
            }
        }(".xa-slider-disable", "display:none !important;");
        const s = this;
        Object.defineProperty(s._sliderConfig, "index", {
            set: function(e) {
                s._index = e, s._triggerOnChange();
            },
            get: function() {
                return s._index;
            }
        }), this.refereshSlides();
    }
    reloadWFSlider() {
        window.Webflow.require("slider").destroy(), window.Webflow.require("slider").redraw(), window.Webflow.require("slider").ready();
    }
    refereshSlides() {
        this._mask.getChildAsComponents(".w-slide").forEach((e)=>e.remove()), this._slides.reverse().forEach((e)=>{
            this._mask.getElement().prepend(e.getElement());
        }), this._slides.reverse(), this.reloadWFSlider();
    }
    getActiveSlide() {
        return this._slides[this._index];
    }
    getAllSlides() {
        return [
            ...this._slides
        ];
    }
    getSlideByIndex(e) {
        return this._slides[e];
    }
    getActiveSlideIndex() {
        return this._index;
    }
    getPreviousSlideIndex() {
        return this._sliderConfig.previous;
    }
    goNext() {
        this._sliderConfig.right.click();
    }
    goPrevious() {
        this._sliderConfig.left.click();
    }
    goToIndex(e) {
        e >= 0 && e < this._slides.length && (console.log(e), n(this._sliderConfig.nav.children()[e]).click());
    }
    addSlide(s, t = {}) {
        const i = t.index, r = t.cssClass, l = (0, e.createComponent)("div");
        l.addCssClass("w-slide"), r && l.addCssClass(r), l.appendChild(s);
        const d = "number" != typeof i ? -1 : i, n = this._slides;
        d >= 0 && d <= n.length ? n.splice(i, 0, l) : n.push(l), this._slides = [
            ...n
        ], this.refereshSlides();
    }
    removeSlide(e) {
        const s = [
            ...this._slides
        ];
        e >= 0 && e < s.length && s.splice(e, 1), this._slides = [
            ...s
        ], console.log(this._slides), this.refereshSlides();
    }
    getSlideNav() {
        return this._nav;
    }
    setSlideNavigationState(e) {
        e ? (this._left.removeCssClass("xa-slider-disable"), this._right.removeCssClass("xa-slider-disable"), this._nav.removeCssClass("xa-slider-disable"), this.setAttribute("data-disable-swipe", this._defaultSwipeDisabled ? "true" : "false")) : (this._left.addCssClass("xa-slider-disable"), this._right.addCssClass("xa-slider-disable"), this._nav.addCssClass("xa-slider-disable"), this.setAttribute("data-disable-swipe", "true")), this.reloadWFSlider();
    }
    onSlideChange(e) {
        const t = (0, s.v4)();
        return this._listeners.set(t, e), ()=>{
            this._listeners.delete(t);
        };
    }
    _triggerOnChange() {
        Array.from(this._listeners.values()).forEach((e)=>{
            e(this._index, this._sliderConfig.previous);
        });
    }
    getConfig() {
        return this._sliderConfig;
    }
}
var a, h;
a = module.exports, h = d, Object.keys(h).forEach(function(e) {
    "default" === e || "__esModule" === e || a.hasOwnProperty(e) || Object.defineProperty(a, e, {
        enumerable: !0,
        get: function() {
            return h[e];
        }
    });
});

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}],"hvg7i":[function(require,module,exports) {
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
    return new Promise((resolve, reject)=>{
        const handleFile = (file)=>{
            const reader = new FileReader();
            // Display preview image as soon as the file is loaded into memory
            reader.onload = (event)=>{
                // Hide error and success messages
                fileInputError.setStyle({
                    display: "none"
                });
                fileInputSuccess.setStyle({
                    display: "none"
                });
                // Show upload animation
                uploadAnimation.setStyle({
                    display: "flex"
                });
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
                    }); // Ensure the loading animation is hidden on error
                    reject(new Error(errorMessage));
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
                reject(new Error(errorMessage));
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

},{"../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"1WUka":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/sidebarIndicators.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSidebarIndicators", ()=>initializeSidebarIndicators);
parcelHelpers.export(exports, "setActiveStep", ()=>setActiveStep);
parcelHelpers.export(exports, "unsetActiveStep", ()=>unsetActiveStep);
parcelHelpers.export(exports, "markStepAsCompleted", ()=>markStepAsCompleted);
parcelHelpers.export(exports, "unmarkStepAsCompleted", ()=>unmarkStepAsCompleted);
var _core = require("@xatom/core");
var _authConfig = require("../../../../auth/authConfig");
const initializeSidebarIndicators = ()=>{
    const steps = [
        {
            id: "sidebarStepOne",
            index: 1
        },
        {
            id: "sidebarStepTwo",
            index: 2
        },
        {
            id: "sidebarStepThree",
            index: 3
        },
        {
            id: "sidebarStepFour",
            index: 4
        },
        {
            id: "sidebarStepFive",
            index: 5
        },
        {
            id: "sidebarStepSix",
            index: 6
        },
        {
            id: "sidebarStepSeven",
            index: 7
        },
        {
            id: "sidebarStepEight",
            index: 8
        }
    ];
    // Set sidebar first name from userAuth
    const firstNameText = new (0, _core.WFComponent)("#firstNameText");
    const user = (0, _authConfig.userAuth).getUser();
    if (user && user.profile && user.profile.first_name) firstNameText.setText(user.profile.first_name);
    else firstNameText.setText("Friend");
    // Initialize step components with click listeners
    steps.forEach((step)=>{
        const stepComponent = new (0, _core.WFComponent)(`#${step.id}`);
        let isCompleted = false; // Track the completed state
        stepComponent.on("click", ()=>{
            if (isCompleted) {
                isCompleted = false;
                stepComponent.removeCssClass("is-completed");
            // Optionally, trigger reverse animation here
            } else {
                isCompleted = true;
                stepComponent.addCssClass("is-completed");
            // Optionally, trigger completed animation here
            }
        });
    });
};
const setActiveStep = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.addCssClass("is-active");
};
const unsetActiveStep = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.removeCssClass("is-active");
};
const markStepAsCompleted = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    const step = new (0, _core.WFComponent)(`#${stepId}`);
    step.getElement().click(); // Programmatically trigger the click event to mark as complete
};
const unmarkStepAsCompleted = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    const step = new (0, _core.WFComponent)(`#${stepId}`);
    step.getElement().click(); // Programmatically trigger the click event to unmark as complete
};
// Helper function to get the ID string for a step
const getStepId = (stepNumber)=>{
    const stepMap = {
        1: "sidebarStepOne",
        2: "sidebarStepTwo",
        3: "sidebarStepThree",
        4: "sidebarStepFour",
        5: "sidebarStepFive",
        6: "sidebarStepSix",
        7: "sidebarStepSeven",
        8: "sidebarStepEight"
    };
    return stepMap[stepNumber] || `sidebarStep${stepNumber}`;
};

},{"@xatom/core":"j9zXV","../../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=addStudentProfile.746006c7.js.map
