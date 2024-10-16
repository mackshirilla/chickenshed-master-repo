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
})({"6diaV":[function(require,module,exports) {
// completeUserProfile/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "completeUserProfile", ()=>completeUserProfile);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _slider = require("@xatom/slider");
var _authConfig = require("../../../../auth/authConfig");
var _formUtils = require("../../../../utils/formUtils");
var _validationUtils = require("../../../../utils/validationUtils");
var _recaptchaUtils = require("../../../../utils/recaptchaUtils"); // Ensure this function is implemented for reCAPTCHA handling
var _apiConfig = require("../../../../api/apiConfig");
var _sidebarIndicator = require("./sidebarIndicator"); // Import sidebar functions
const completeUserProfile = async ()=>{
    // Set first name from userAuth
    const firstNameText = new (0, _core.WFComponent)("#firstNameText");
    firstNameText.setText((0, _authConfig.userAuth).getUser().profile.first_name);
    // Request animation element
    const requestingAnimation = new (0, _core.WFComponent)("#requestingAnimation");
    // Initialize the sidebar indicators
    (0, _sidebarIndicator.initializeSidebarIndicators)();
    // Initialize the form components
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    // Slider element
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    // --- Step 3 Submit Button ---
    const submitStepThree = new (0, _core.WFComponent)("#submitStepThree");
    // --- Step 1 ---
    const fieldsStepOne = [
        {
            input: new (0, _core.WFComponent)("#referralInput"),
            error: new (0, _core.WFComponent)("#referralInputError"),
            validationFn: (0, _validationUtils.validateSelectField),
            message: "This field is required."
        }
    ];
    // Initialize validation for Step 1 fields
    fieldsStepOne.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepOneError"));
    });
    const yMemberCheckbox = new (0, _core.WFComponent)("#isYMemberInput");
    const yInputHiddenWrapper = new (0, _core.WFComponent)("#hiddenyMemberWrapper");
    yMemberCheckbox.on("change", ()=>{
        yInputHiddenWrapper.setStyle({
            display: yMemberCheckbox.getElement()["checked"] ? "block" : "none"
        });
    });
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        let isFormValid = true;
        fieldsStepOne.forEach(({ input, error, validationFn, message })=>{
            const errorMessage = (0, _formUtils.createValidationFunction)(input, validationFn, message)();
            if (errorMessage) {
                (0, _formUtils.toggleError)(error, errorMessage, true);
                isFormValid = false;
            } else (0, _formUtils.toggleError)(error, "", false);
        });
        if (!isFormValid) {
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepOneError"), "Please correct all errors above.", true);
            return;
        }
        slider.goNext();
    });
    // --- Step 2 ---
    const fieldsStepTwo = [
        {
            input: new (0, _core.WFComponent)("#phoneNumberInput"),
            error: new (0, _core.WFComponent)("#phoneNumberInputError"),
            validationFn: (0, _validationUtils.validatePhoneNumber),
            message: "This field is required."
        }
    ];
    (0, _formUtils.setupFileUpload)(new (0, _core.WFComponent)("#profilePictureInput"), new (0, _core.WFComponent)("#profilePictureInputError"), new (0, _core.WFComponent)("#profilePictureInputSuccess"), "/profiles/image-upload" // Replace with your actual endpoint
    );
    const phoneNumberInput = new (0, _core.WFComponent)("#phoneNumberInput");
    phoneNumberInput.on("input", ()=>{
        const inputElement = phoneNumberInput.getElement();
        const cursorPosition = inputElement.selectionStart;
        inputElement.value = formatPhoneNumber(inputElement.value);
        const formattedLength = inputElement.value.length;
        const cleanedLength = inputElement.value.replace(/\D/g, "").length;
        inputElement.setSelectionRange(cursorPosition + (formattedLength - cleanedLength), cursorPosition + (formattedLength - cleanedLength));
    });
    function formatPhoneNumber(value) {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        else if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        else return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    fieldsStepTwo.forEach(({ input, error, validationFn, message })=>{
        (0, _formUtils.setupValidation)(input, error, (0, _formUtils.createValidationFunction)(input, validationFn, message), new (0, _core.WFComponent)("#submitStepTwoError"));
    });
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        let isFormValid = true;
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
        slider.goNext();
    });
    // --- Step 3 ---
    const userProfilePic = new (0, _image.WFImage)("#userProfilePic");
    slider.onSlideChange((activeIndex)=>{
        if (activeIndex === 2) {
            // Step 3 becomes active
            const userProfile = (0, _authConfig.userAuth).getUser().profile;
            const profilePicUrl = userProfile.profile_pic && userProfile.profile_pic.url ? userProfile.profile_pic.url : "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"; // Default fallback image
            userProfilePic.setImage(profilePicUrl);
            // Populate review elements
            new (0, _core.WFComponent)("#userFullName").setText(`${userProfile.first_name} ${userProfile.last_name}`);
            new (0, _core.WFComponent)("#userEmail").setText((0, _authConfig.userAuth).getUser().email);
            new (0, _core.WFComponent)("#userPhone").setText(formStepTwo.getFormData().phone);
            new (0, _core.WFComponent)("#userAddress").setText(formStepTwo.getFormData().address_line_1);
            new (0, _core.WFComponent)("#userAddressLine2").setText(formStepTwo.getFormData().address_line_2);
            new (0, _core.WFComponent)("#userCity").setText(formStepTwo.getFormData().city);
            new (0, _core.WFComponent)("#userState").setText(formStepTwo.getFormData().state);
            new (0, _core.WFComponent)("#userZip").setText(formStepTwo.getFormData().zip);
        }
    });
    formStepThree.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        // Disable the submit button to prevent multiple submissions
        submitStepThree.setAttribute("disabled", "true");
        requestingAnimation.setStyle({
            display: "block"
        });
        console.log("requesting animation displayed");
        const isRecaptchaValid = await (0, _recaptchaUtils.handleRecaptcha)("complete_profile");
        if (!isRecaptchaValid) {
            requestingAnimation.setStyle({
                display: "none"
            }); // Hide animation on error
            submitStepThree.removeAttribute("disabled"); // Re-enable button on error
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepThreeError"), "reCAPTCHA verification failed. Please try again.", true);
            return;
        }
        const completeProfileData = {
            ...formStepOne.getFormData(),
            ...formStepTwo.getFormData()
        };
        try {
            const response = await (0, _apiConfig.apiClient).post("profiles/complete-profile", {
                data: completeProfileData
            }).fetch();
            if (response.status === "success") {
                const { profile } = response;
                new (0, _core.WFComponent)("#profileLinkTemplate").updateTextViaAttrVar({
                    name: `${profile.first_name} ${profile.last_name}`,
                    email: profile.email,
                    phone: profile.phone
                });
                // Set profile picture, or fallback if no URL exists
                const profilePicUrl = profile.profile_pic && profile.profile_pic.url ? profile.profile_pic.url : "path/to/default/image.jpg"; // Default fallback image
                new (0, _image.WFImage)("#profileCardImg").setImage(profilePicUrl);
                requestingAnimation.setStyle({
                    display: "none"
                }); // Hide animation on success
                submitStepThree.removeAttribute("disabled"); // Re-enable button on success
                slider.goNext();
            }
        } catch (error) {
            console.error("Error completing profile", error);
            (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#submitStepThreeError"), "An error occurred. Please try again.", true);
            requestingAnimation.setStyle({
                display: "none"
            }); // Hide animation on error
            submitStepThree.removeAttribute("disabled"); // Re-enable button on error
        }
    });
    // --- Handle Back Button for Step 2 ---
    const backStepTwo = new (0, _core.WFComponent)("#backStepTwo");
    backStepTwo.on("click", ()=>{
        slider.goPrevious();
    });
    // --- Handle Back Button for Step 3 ---
    const backStepThree = new (0, _core.WFComponent)("#backStepThree");
    backStepThree.on("click", ()=>{
        requestingAnimation.setStyle({
            display: "none"
        }); // Hide animations or loading states
        slider.goPrevious();
    });
    // --- Handle Submit Button for Step 4 ---
    const submitStepFour = new (0, _core.WFComponent)("#submitStepFour");
    submitStepFour.on("click", ()=>{
        // Mark step 4 as completed **before** navigating to the next slide
        (0, _sidebarIndicator.markStepAsCompleted)(4);
        console.log("Step 4 is marked as complete");
        // Move to the next slide (step 5), which has no sidebar indicator
        slider.goNext();
    });
    // --- Handle Back Button for Step 4 ---
    const backStepFour = new (0, _core.WFComponent)("#backStepFour");
    backStepFour.on("click", ()=>{
        // Unmark step 4 as completed since the user is going back
        (0, _sidebarIndicator.unmarkStepAsCompleted)(4);
        console.log("Step 4 is unmarked as complete");
        // Move back to the previous slide (step 3)
        slider.goPrevious();
    });
    // --- Slider Change Event for Sidebar Updates ---
    slider.onSlideChange((activeIndex, prevIndex)=>{
        // Set the active step if navigating to a step with a sidebar indicator (steps 1-4)
        if (activeIndex < 4) (0, _sidebarIndicator.setActiveStep)(activeIndex + 1);
        // Mark previous steps as complete if moving forward, up to step 4
        if (prevIndex !== -1 && prevIndex < activeIndex) {
            for(let i = prevIndex + 1; i <= activeIndex; i++)if (i <= 4) (0, _sidebarIndicator.markStepAsCompleted)(i);
        }
        // Unmark all subsequent steps if moving backward, up to step 4
        if (prevIndex !== -1 && prevIndex > activeIndex) {
            for(let i = prevIndex; i > activeIndex; i--)if (i <= 4) (0, _sidebarIndicator.unmarkStepAsCompleted)(i);
        }
    });
    // Ensure the sidebar is correctly updated on initialization
    (0, _sidebarIndicator.setActiveStep)(slider.getActiveSlideIndex() + 1);
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","@xatom/slider":"2zMuG","../../../../auth/authConfig":"gkGgf","../../../../utils/formUtils":"hvg7i","../../../../utils/validationUtils":"dMBjH","../../../../utils/recaptchaUtils":"d0IfT","../../../../api/apiConfig":"2Lx0S","./sidebarIndicator":"7hL6A","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7hL6A":[function(require,module,exports) {
// sidebarIndicators.ts
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
        }
    ];
    // Set sidebar first name from userAuth
    const firstNameText = new (0, _core.WFComponent)("#firstNameText");
    const user = (0, _authConfig.userAuth).getUser();
    if (user && user.profile && user.profile.first_name) firstNameText.setText(user.profile.first_name);
    else firstNameText.setText("Friend");
    steps.forEach((step)=>{
        const stepComponent = new (0, _core.WFComponent)(`#${step.id}`);
        let isCompleted = false; // Track the completed state
        stepComponent.on("click", ()=>{
            if (isCompleted) isCompleted = false;
            else isCompleted = true;
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
        4: "sidebarStepFour"
    };
    return stepMap[stepNumber] || `sidebarStep${stepNumber}`;
};

},{"@xatom/core":"j9zXV","../../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=completeUserProfile.92970a6b.js.map
