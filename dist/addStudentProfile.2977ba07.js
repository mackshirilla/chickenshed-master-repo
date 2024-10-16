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
})({"cUnhi":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "addStudentProfile", ()=>addStudentProfile);
var _core = require("@xatom/core");
var _sidebar = require("./sidebar");
var _slider = require("./slider");
var _step1 = require("./steps/step1");
var _step2 = require("./steps/step2");
var _step3 = require("./steps/step3");
var _step4 = require("./steps/step4");
var _step5 = require("./steps/step5");
var _step6 = require("./steps/step6");
var _step7 = require("./steps/step7");
var _step8 = require("./steps/step8");
var _step9 = require("./steps/step9");
var _step10 = require("./steps/step10");
const addStudentProfile = async ()=>{
    console.log("Initialize Add Student Form");
    // Initialize the sidebar indicators
    (0, _sidebar.initializeSidebarIndicators)();
    // Initialize the slider
    const slider = (0, _slider.initializeSlider)();
    // Initialize form components for all steps
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    const formStepFive = new (0, _core.WFFormComponent)("#formStepFive");
    const formStepSix = new (0, _core.WFFormComponent)("#formStepSix");
    const formStepSeven = new (0, _core.WFFormComponent)("#formStepSeven");
    // Function to collect form data from each step
    const getFormData = ()=>{
        const formStepOneData = formStepOne.getFormData();
        const formStepTwoData = formStepTwo.getFormData();
        const formStepThreeData = formStepThree.getFormData();
        const formStepFiveData = formStepFive.getFormData();
        const formStepSixData = formStepSix.getFormData();
        const formStepSevenData = formStepSeven.getFormData();
        // Retrieve the existing student's ID from local storage, if any
        const existingStudent = localStorage.getItem("current_student");
        const studentId = existingStudent ? JSON.parse(existingStudent).id : null;
        // Consolidate all form data
        const formData = {
            ...formStepOneData,
            ...formStepTwoData,
            ...formStepThreeData,
            ...formStepFiveData,
            ...formStepSixData,
            ...formStepSevenData
        };
        // Add the student ID to the form data if available
        if (studentId) formData.student_id = studentId;
        return formData;
    };
    // Initialize all steps
    (0, _step1.initializeStepOne)(slider);
    (0, _step2.initializeStepTwo)(slider);
    (0, _step3.initializeStepThree)(slider);
    (0, _step4.initializeStepFour)(slider);
    (0, _step5.initializeStepFive)(slider);
    (0, _step6.initializeStepSix)(slider);
    (0, _step7.initializeStepSeven)(slider);
    (0, _step8.initializeStepEight)(slider, getFormData); // Pass both slider and getFormData to Step Eight
    (0, _step9.initializeStepNine)(slider);
    (0, _step10.initializeStepTen)(slider);
};

},{"@xatom/core":"j9zXV","./sidebar":"5kv9Q","./slider":"bvRdC","./steps/step1":"3quYC","./steps/step2":"w1u6l","./steps/step3":"dVeAX","./steps/step4":"7FrZU","./steps/step5":"2ThRE","./steps/step6":"cFObv","./steps/step7":"9pOFk","./steps/step8":"QRaT7","./steps/step9":"ds3uH","./steps/step10":"53Ksu","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"5kv9Q":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/sidebar.ts
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
    if (!stepId) {
        console.warn(`No sidebar step defined for step number ${stepNumber}`);
        return;
    }
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.addCssClass("is-active");
};
const unsetActiveStep = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    if (!stepId) {
        console.warn(`No sidebar step defined for step number ${stepNumber}`);
        return;
    }
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.removeCssClass("is-active");
};
const markStepAsCompleted = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    if (!stepId) {
        console.warn(`No sidebar step defined for step number ${stepNumber}`);
        return;
    }
    const step = new (0, _core.WFComponent)(`#${stepId}`);
    step.getElement().click(); // Programmatically trigger the click event to mark as complete
};
const unmarkStepAsCompleted = (stepNumber)=>{
    const stepId = getStepId(stepNumber);
    if (!stepId) {
        console.warn(`No sidebar step defined for step number ${stepNumber}`);
        return;
    }
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
    return stepMap[stepNumber] || null;
};

},{"@xatom/core":"j9zXV","../../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"bvRdC":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/slider.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSlider", ()=>initializeSlider);
var _slider = require("@xatom/slider");
var _sidebar = require("./sidebar");
const initializeSlider = ()=>{
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    // Initialize the slider's slide change handler using imported functions
    slider.onSlideChange((activeIndex, prevIndex)=>{
        console.log(`Slide changed from ${prevIndex} to ${activeIndex}`);
        // Set the active step in the sidebar
        (0, _sidebar.setActiveStep)(activeIndex + 1);
        if (prevIndex !== -1 && prevIndex < activeIndex) // Moving forward: mark the previous step as completed
        (0, _sidebar.markStepAsCompleted)(prevIndex + 1);
        if (prevIndex !== -1 && prevIndex > activeIndex) // Moving backward: unmark steps beyond the current
        (0, _sidebar.unmarkStepAsCompleted)(prevIndex + 1);
    });
    // Set the initial active sidebar step
    (0, _sidebar.setActiveStep)(slider.getActiveSlideIndex() + 1);
    return slider;
};

},{"@xatom/slider":"2zMuG","./sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2zMuG":[function(require,module,exports) {
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

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}],"3quYC":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepOne.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepOne", ()=>initializeStepOne);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _recaptchaUtils = require("../../../../../utils/recaptchaUtils");
var _apiConfig = require("../../../../../api/apiConfig");
var _authConfig = require("../../../../../auth/authConfig");
const initializeStepOne = (slider)=>{
    console.log("Initialize Add Student Form");
    // Set sidebar first name from userAuth
    const firstNameText = new (0, _core.WFComponent)("#firstNameText");
    firstNameText.setText((0, _authConfig.userAuth).getUser().profile.first_name);
    // Step 1 Form Initialization
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
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
    // Define the fields with associated validation rules and error messages
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
            validationFn: (0, _validationUtils.validateEmailOptional),
            message: "Please enter a valid email address"
        },
        {
            input: new (0, _core.WFComponent)("#phoneNumberInput"),
            error: new (0, _core.WFComponent)("#phoneNumberInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "Please enter a valid phone number"
        }
    ];
    // Auto-format phone number input to (xxx) xxx-xxxx
    const phoneNumberInput = new (0, _core.WFComponent)("#phoneNumberInput");
    phoneNumberInput.on("input", ()=>{
        const inputElement = phoneNumberInput.getElement();
        const cursorPosition = inputElement.selectionStart;
        inputElement.value = formatPhoneNumber(inputElement.value);
        const formattedLength = inputElement.value.length;
        const cleanedLength = inputElement.value.replace(/\D/g, "").length;
        inputElement.setSelectionRange(cursorPosition + (formattedLength - cleanedLength), cursorPosition + (formattedLength - cleanedLength));
    });
    // Initialize validation for each field
    fieldsStepOne.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepOneError"));
    });
    // Handle form submission for Step 1
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
        const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepOneError"), "Please correct all errors above.", true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Check if a student profile already exists in local storage
        if (existingStudent) {
            const student = JSON.parse(existingStudent);
            // Skip creating a new profile and navigate directly to the next step
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepOneError"), "reCAPTCHA verification failed. Please try again.", true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Post data to a server endpoint
        try {
            const response = await (0, _apiConfig.apiClient).post("/profiles/students/create-student", {
                data: formData
            }).fetch();
            if (response.status === "success") {
                const { profile } = response;
                localStorage.setItem("current_student", JSON.stringify(profile));
                slider.goNext(); // Proceed to next step
            }
        } catch (error) {
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepOneError"), error.response?.data?.message || "Failed to create account.", true);
        } finally{
            stepOneRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
};
// Helper function to format phone number
function formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";
    if (cleaned.length <= 3) formatted = cleaned;
    else if (cleaned.length <= 6) formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    else formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    return formatted;
}

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../../../../../utils/recaptchaUtils":"d0IfT","../../../../../api/apiConfig":"2Lx0S","../../../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"w1u6l":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepTwo.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepTwo", ()=>initializeStepTwo);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _sidebar = require("../sidebar");
const initializeStepTwo = (slider)=>{
    console.log("Initialize Step Two Form");
    // Step 2 Form Initialization
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    // File Upload Setup for Profile Picture
    const profilePictureInput = new (0, _core.WFComponent)("#profilePictureInput");
    const profilePictureInputError = new (0, _core.WFComponent)("#profilePictureInputError");
    const profilePictureInputSuccess = new (0, _core.WFComponent)("#profilePictureInputSuccess");
    (0, _formUtils.setupFileUpload)(profilePictureInput, profilePictureInputError, profilePictureInputSuccess, "/profiles/students/image-upload" // Replace with your actual endpoint
    ).then((imageUrl)=>{
        console.log("Image uploaded successfully: ", imageUrl);
        // Indicate success but no need to update form input as per your setup.
        profilePictureInputSuccess.setText("Image uploaded successfully!");
    }).catch((error)=>{
        console.error("Error uploading image: ", error.message);
    });
    // Define the fields with associated validation rules and error messages
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
    // Initialize validation for each field
    fieldsStepTwo.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepTwoError"));
    });
    // Handle form submission for Step 2
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepTwoError"), "Please correct all errors above.", true);
            return;
        }
        // Proceed to the next step
        slider.goNext();
    });
    // Handle back button for Step 2
    const backStepButton = new (0, _core.WFComponent)("#backStepTwo");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(2);
        (0, _sidebar.unmarkStepAsCompleted)(1);
        (0, _sidebar.unmarkStepAsCompleted)(2);
    });
};

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dVeAX":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepThree.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepThree", ()=>initializeStepThree);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _sidebar = require("../sidebar");
const initializeStepThree = (slider)=>{
    console.log("Initialize Step Three Form");
    // Step 3 Form Initialization
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    // Define the fields with associated validation rules and error messages
    const fieldsStepThree = [
        {
            input: new (0, _core.WFComponent)("#healthInput"),
            error: new (0, _core.WFComponent)("#healthInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Health information is required"
        }
    ];
    // Initialize validation for each field
    fieldsStepThree.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepThreeError"));
    });
    // Handle form submission for Step 3
    formStepThree.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepThreeError"), "Please correct all errors above.", true);
            return;
        }
        // Proceed to the next step
        slider.goNext();
    });
    // Handle back button for Step 3
    const backStepButton = new (0, _core.WFComponent)("#backStepThree");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(3);
        (0, _sidebar.unmarkStepAsCompleted)(2);
        (0, _sidebar.unmarkStepAsCompleted)(3);
    });
};

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7FrZU":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepFour.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepFour", ()=>initializeStepFour);
var _core = require("@xatom/core");
var _caregiverDialog = require("../caregiverDialog");
var _sidebar = require("../sidebar");
const initializeStepFour = (slider)=>{
    console.log("Initialize Step Four Form - Invite Caregiver");
    // Initialize Caregiver Dialog/Form
    (0, _caregiverDialog.initializeCaregiverDialog)(slider);
    // Handle Step 4 submission (Continue to Step 5)
    const submitStepFour = new (0, _core.WFComponent)("#submitStepFour");
    submitStepFour.on("click", ()=>{
        slider.goNext();
    });
    // Handle back button for Step 4
    const backStepButton = new (0, _core.WFComponent)("#backStepFour");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(4);
        (0, _sidebar.unmarkStepAsCompleted)(3);
        (0, _sidebar.unmarkStepAsCompleted)(4);
    });
};

},{"@xatom/core":"j9zXV","../caregiverDialog":"bPXQO","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"bPXQO":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/caregiverDialog.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeCaregiverDialog", ()=>initializeCaregiverDialog);
var _core = require("@xatom/core");
var _formUtils = require("../../../../utils/formUtils");
var _validationUtils = require("../../../../utils/validationUtils");
var _recaptchaUtils = require("../../../../utils/recaptchaUtils");
var _apiConfig = require("../../../../api/apiConfig");
const initializeCaregiverDialog = (slider)=>{
    console.log("Initialize Invite Caregiver Form");
    // Caregiver Form Initialization
    const caregiverForm = new (0, _core.WFFormComponent)("#inviteCaregiverDialog");
    // Define the fields with associated validation rules and error messages
    const fieldsCaregiver = [
        {
            input: new (0, _core.WFComponent)("#caregiverEmailInput"),
            error: new (0, _core.WFComponent)("#caregiverEmailInputError"),
            validationFn: (0, _validationUtils.validateEmail),
            message: "Please enter a valid email address"
        }
    ];
    // Initialize validation for each field
    fieldsCaregiver.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitInviteCaregiverError"));
    });
    // Handle form submission for Caregiver Form
    caregiverForm.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
        const caregiverRequestingAnimation = new (0, _core.WFComponent)("#caregiverRequestingAnimation");
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitInviteCaregiverError"), "Please correct all errors above.", true);
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
            return;
        }
        // Handle reCAPTCHA verification
        const recaptchaAction = "complete_caregiver";
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)(recaptchaAction);
        if (!isRecaptchaValid) {
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitInviteCaregiverError"), "reCAPTCHA verification failed. Please try again.", true);
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
                const onSuccessTrigger = new (0, _core.WFComponent)("#inviteCaregiverSuccessTrigger");
                caregiverForm.showSuccessState();
                onSuccessTrigger.getElement().click();
            }
        } catch (error) {
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitInviteCaregiverError"), error.response?.data?.message || "Failed to create account.", true);
        } finally{
            caregiverRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
    // Initialize reset form button
    const resetCaregiverForm = new (0, _core.WFComponent)("#resetCaregiverForm");
    resetCaregiverForm.on("click", ()=>{
        caregiverForm.resetForm();
        caregiverForm.showForm();
        const onSuccessTrigger = new (0, _core.WFComponent)("#inviteCaregiverSuccessTrigger");
        onSuccessTrigger.getElement().click();
    });
};

},{"@xatom/core":"j9zXV","../../../../utils/formUtils":"hvg7i","../../../../utils/validationUtils":"dMBjH","../../../../utils/recaptchaUtils":"d0IfT","../../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2ThRE":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepFive.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepFive", ()=>initializeStepFive);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _sidebar = require("../sidebar");
const initializeStepFive = (slider)=>{
    console.log("Initialize Step Five Form - Emergency Contact");
    // Step 5 Form Initialization
    const formStepFive = new (0, _core.WFFormComponent)("#formStepFive");
    // Define the fields with associated validation rules and error messages
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
    // Auto-format phone number input to (xxx) xxx-xxxx
    const emergencyPhoneNumberInput = new (0, _core.WFComponent)("#emergencyPhoneInput");
    emergencyPhoneNumberInput.on("input", ()=>{
        const inputElement = emergencyPhoneNumberInput.getElement();
        const cursorPosition = inputElement.selectionStart;
        inputElement.value = formatPhoneNumber(inputElement.value);
        const formattedLength = inputElement.value.length;
        const cleanedLength = inputElement.value.replace(/\D/g, "").length;
        inputElement.setSelectionRange(cursorPosition + (formattedLength - cleanedLength), cursorPosition + (formattedLength - cleanedLength));
    });
    // Initialize validation for each field
    fieldsStepFive.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepFiveError"));
    });
    // Handle form submission for Step 5
    formStepFive.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepFiveError"), "Please correct all errors above.", true);
            return;
        }
        // Proceed to the next step
        slider.goNext();
    });
    // Handle back button for Step 5
    const backStepButton = new (0, _core.WFComponent)("#backStepFive");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(5);
        (0, _sidebar.unmarkStepAsCompleted)(4);
        (0, _sidebar.unmarkStepAsCompleted)(5);
    });
};
// Helper function to format phone number
function formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";
    if (cleaned.length <= 3) formatted = cleaned;
    else if (cleaned.length <= 6) formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    else formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    return formatted;
}

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"cFObv":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepSix.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepSix", ()=>initializeStepSix);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _sidebar = require("../sidebar");
const initializeStepSix = (slider)=>{
    console.log("Initialize Step Six Form - Dismissal Permissions");
    // Step 6 Form Initialization
    const formStepSix = new (0, _core.WFFormComponent)("#formStepSix");
    // Define fields with associated validation rules and error messages
    const fieldsStepSix = [
        {
            input: new (0, _core.WFComponent)("#dismissalNamesInput"),
            error: new (0, _core.WFComponent)("#dismissalNamesInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Dismissal names are required"
        }
    ];
    // Initialize validation for each field
    fieldsStepSix.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepSixError"));
    });
    // Handle form submission for Step 6
    formStepSix.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepSixError"), "Please correct all errors above.", true);
            return;
        }
        // Proceed to the next step
        slider.goNext();
    });
    // Handle back button for Step 6
    const backStepButton = new (0, _core.WFComponent)("#backStepSix");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(6);
        (0, _sidebar.unmarkStepAsCompleted)(5);
        (0, _sidebar.unmarkStepAsCompleted)(6);
    });
};

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"9pOFk":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/stepSeven.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepSeven", ()=>initializeStepSeven);
var _core = require("@xatom/core");
var _formUtils = require("../../../../../utils/formUtils");
var _validationUtils = require("../../../../../utils/validationUtils");
var _sidebar = require("../sidebar");
const initializeStepSeven = (slider)=>{
    console.log("Initialize Step Seven Form - Family Involvement & Photo Release");
    // Step 7 Form Initialization
    const formStepSeven = new (0, _core.WFFormComponent)("#formStepSeven");
    // Define fields with associated validation rules and error messages
    const fieldsStepSeven = [
        {
            input: new (0, _core.WFComponent)("#familyInvolvedInput"),
            error: new (0, _core.WFComponent)("#familyInvolvedInputError"),
            validationFn: (0, _validationUtils.validateNotEmpty),
            message: "Family involvement is required"
        }
    ];
    // Initialize validation for each field
    fieldsStepSeven.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepSevenError"));
    });
    // Handle form submission for Step 7
    formStepSeven.onFormSubmit(async (formData, event)=>{
        event.preventDefault(); // Stop default form submission
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
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepSevenError"), "Please correct all errors above.", true);
            return;
        }
        // Proceed to the next step
        slider.goNext();
    });
    // Handle back button for Step 7
    const backStepButton = new (0, _core.WFComponent)("#backStepSeven");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(7);
        (0, _sidebar.unmarkStepAsCompleted)(6);
        (0, _sidebar.unmarkStepAsCompleted)(7);
    });
};

},{"@xatom/core":"j9zXV","../../../../../utils/formUtils":"hvg7i","../../../../../utils/validationUtils":"dMBjH","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"QRaT7":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/steps/step8.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepEight", ()=>initializeStepEight);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _recaptchaUtils = require("../../../../../utils/recaptchaUtils");
var _apiConfig = require("../../../../../api/apiConfig");
var _formUtils = require("../../../../../utils/formUtils");
var _sidebar = require("../sidebar");
const initializeStepEight = (slider, getFormData)=>{
    console.log("Initialize Step Eight");
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
    // New components for displaying if the student opted for text messages
    const studentTextTrue = new (0, _core.WFComponent)("#studentTextTrue");
    const studentTextFalse = new (0, _core.WFComponent)("#studentTextFalse");
    // Function to set form review items from collected data
    const setFormReviewItems = ()=>{
        const data = getFormData();
        // Set student profile picture if available
        if (localStorage.getItem("image_upload")) {
            const image = localStorage.getItem("image_upload");
            studentProfilePic.setImage(image);
        }
        // Set form review items with the appropriate data
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
        // Set independent travel info
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
        // Set photo release info
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
        // Set text message opt-in info
        if (data.send_texts) {
            studentTextTrue.setStyle({
                display: "block"
            });
            studentTextFalse.setStyle({
                display: "none"
            });
        } else {
            studentTextFalse.setStyle({
                display: "block"
            });
            studentTextTrue.setStyle({
                display: "none"
            });
        }
    };
    // Set review items when slide changes to step 8
    slider.onSlideChange(setFormReviewItems);
    // Handle Step Eight form submission (Review and Save)
    const submitStepEight = new (0, _core.WFComponent)("#submitStepEight");
    const stepEightRequestingAnimation = new (0, _core.WFComponent)("#stepEightRequestingAnimation");
    const submitStepEightError = new (0, _core.WFComponent)("#submitStepEightError");
    submitStepEight.on("click", async (event)=>{
        event.preventDefault(); // Prevent normal form submission
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
            if (response.status === "success") {
                const { profile } = response;
                // Update the profile link template with the returned data
                const studentProfileLinkTemplate = new (0, _core.WFComponent)("#studentCard");
                studentProfileLinkTemplate.updateTextViaAttrVar({
                    name: `${profile.first_name} ${profile.last_name}`,
                    email: profile.email,
                    phone: profile.phone
                });
                // **Updated code to append ?id={student_id} to the #studentCard link**
                // Get the student card element and update its href attribute
                const studentCardElement = studentProfileLinkTemplate.getElement();
                const currentHref = studentCardElement.getAttribute("href") || "";
                const newHref = `${currentHref}?id=${profile.id}`;
                studentCardElement.setAttribute("href", newHref);
                // Update the profile card image with the profile picture if available
                const profileCardImg = new (0, _image.WFImage)("#profileCardImg");
                if (profile.profile_pic && profile.profile_pic.url) profileCardImg.setImage(profile.profile_pic.url);
                else // Set a default placeholder image if profile_pic is not available
                profileCardImg.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
                // Clear current student and uploaded image from local storage
                localStorage.removeItem("current_student");
                localStorage.removeItem("image_upload");
                // Hide loading animation
                stepEightRequestingAnimation.setStyle({
                    display: "none"
                });
                // Navigate to the next step
                slider.goNext();
            } else {
                // Handle cases where response.status is not "success"
                (0, _formUtils.toggleError)(submitStepEightError, response.message || "Failed to complete profile.", true);
                stepEightRequestingAnimation.setStyle({
                    display: "none"
                }); // Hide loading animation
            }
        } catch (error) {
            console.error("Error completing profile:", error);
            (0, _formUtils.toggleError)(submitStepEightError, error.response?.data?.message || "Failed to complete profile.", true);
            stepEightRequestingAnimation.setStyle({
                display: "none"
            }); // Hide loading animation
        }
    });
    // Handle back button for Step 8
    const backStepButton = new (0, _core.WFComponent)("#backStepEight");
    backStepButton.on("click", ()=>{
        slider.goPrevious();
        (0, _sidebar.unsetActiveStep)(8);
        (0, _sidebar.unmarkStepAsCompleted)(7);
        (0, _sidebar.unmarkStepAsCompleted)(8);
    });
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../../../utils/recaptchaUtils":"d0IfT","../../../../../api/apiConfig":"2Lx0S","../../../../../utils/formUtils":"hvg7i","../sidebar":"5kv9Q","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ds3uH":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/steps/step9.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepNine", ()=>initializeStepNine);
var _core = require("@xatom/core");
const initializeStepNine = (slider)=>{
    // Initialize the form components for Step 9
    const submitStepNine = new (0, _core.WFComponent)("#submitStepNine");
    const backStepEight = new (0, _core.WFComponent)("#backStepEight");
    // Event listener for submitting step nine
    submitStepNine.on("click", async (event)=>{
        event.preventDefault(); // Prevent the default behavior
        try {
            // Placeholder for any step 9 submission logic
            console.log("Step 9: Submit action or add another student");
            // Proceed to the next slide without triggering any sidebar changes
            slider.goNext();
        } catch (error) {
            console.error("Error during Step 9 submission: ", error);
        }
    });
    // Event listener for going back to Step 8
    backStepEight.on("click", ()=>{
        // Simply go back to the previous step without affecting sidebar steps
        slider.goPrevious();
    });
};

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"53Ksu":[function(require,module,exports) {
// src/modules/forms/profiles/addStudentProfile/steps/step10.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStepTen", ()=>initializeStepTen);
var _core = require("@xatom/core");
const initializeStepTen = (slider)=>{
    // Initialize the back button for Step 10
    const backStepTen = new (0, _core.WFComponent)("#backStepTen");
    // Event listener for going back to Step 9
    backStepTen.on("click", ()=>{
        slider.goPrevious();
    });
};

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=addStudentProfile.2977ba07.js.map
