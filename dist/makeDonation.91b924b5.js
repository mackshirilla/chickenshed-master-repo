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
})({"3LD3q":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeDonation", ()=>makeDonation);
var _listCampaigns = require("../../donate/listCampaigns");
var _listCampaignProducts = require("../../donate/listCampaignProducts");
var _core = require("@xatom/core");
var _slider = require("@xatom/slider");
var _authConfig = require("../../../auth/authConfig");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
var _apiConfig = require("../../../api/apiConfig"); // Assuming you have an apiClient to handle requests
// Load the donation state from localStorage
const loadState = ()=>{
    const savedState = localStorage.getItem("donationState");
    if (savedState) return JSON.parse(savedState);
    return {};
};
// Save the donation state to localStorage
const saveState = (state)=>{
    localStorage.setItem("donationState", JSON.stringify(state));
};
// Set sidebar first name from userAuth
const firstNameText = new (0, _core.WFComponent)("#firstNameText");
const user = (0, _authConfig.userAuth).getUser();
if (user && user.profile && user.profile.first_name) firstNameText.setText(user.profile.first_name);
else firstNameText.setText("friend");
// Hide email input if user is authenticated
const emailWrap = new (0, _core.WFComponent)("#emailWrap");
const firstNameInput = new (0, _core.WFComponent)("#firstNameInput");
const firstNameInputError = new (0, _core.WFComponent)("#firstNameInputError");
const lastNameInput = new (0, _core.WFComponent)("#lastNameInput");
const lastNameInputError = new (0, _core.WFComponent)("#lastNameInputError");
const emailInput = new (0, _core.WFComponent)("#emailInput");
const emailInputError = new (0, _core.WFComponent)("#emailInputError");
const validateNotEmpty = (value)=>value.trim() !== "";
if (user && user.profile && user.email) emailWrap.setStyle({
    display: "none"
});
else {
    (0, _formUtils.setupValidation)(firstNameInput, firstNameInputError, (0, _formUtils.createValidationFunction)(firstNameInput, validateNotEmpty, "First name is required."));
    (0, _formUtils.setupValidation)(lastNameInput, lastNameInputError, (0, _formUtils.createValidationFunction)(lastNameInput, validateNotEmpty, "Last name is required."));
    (0, _formUtils.setupValidation)(emailInput, emailInputError, (0, _formUtils.createValidationFunction)(emailInput, (0, _validationUtils.validateEmail), "Please enter a valid email address."));
}
const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
// Initialize sidebar components
const sidebarStepOne = new (0, _core.WFComponent)("#sidebarStepOne");
const sidebarStepTwo = new (0, _core.WFComponent)("#sidebarStepTwo");
const sidebarSteps = [
    sidebarStepOne,
    sidebarStepTwo
];
const updateSidebar = (currentStepIndex)=>{
    console.log(`Updating sidebar to step ${currentStepIndex}`);
    sidebarSteps.forEach((step, index)=>{
        if (!step) return; // Skip if the step is not defined
        if (index === currentStepIndex) step.addCssClass("is-active");
        else step.removeCssClass("is-active");
    });
};
const triggerSuccessAnimation = (stepIndex)=>{
    console.log(`Triggering success animation for step ${stepIndex}`);
    if (sidebarSteps[stepIndex]) sidebarSteps[stepIndex].getElement().click();
    else console.warn(`No sidebar step defined for step index ${stepIndex}`);
};
slider.onSlideChange((activeIndex, prevIndex)=>{
    console.log(`Slide changed from ${prevIndex} to ${activeIndex}`);
    updateSidebar(activeIndex);
    if (prevIndex !== -1 && prevIndex < activeIndex) triggerSuccessAnimation(prevIndex);
    if (prevIndex !== -1 && prevIndex > activeIndex) triggerSuccessAnimation(activeIndex);
});
updateSidebar(slider.getActiveSlideIndex());
let isCampaignListInitialized = false;
// Function to navigate to a specific step based on URL parameters
const navigateToStepFromURL = async ()=>{
    const params = new URLSearchParams(window.location.search);
    const campaignId = params.get("campaign");
    const checkoutCanceled = params.has("checkoutcanceled");
    const loadingWall = new (0, _core.WFComponent)(".loading_wall");
    if (checkoutCanceled) {
        loadingWall.setStyle({
            display: "flex"
        });
        const checkoutSessionId = localStorage.getItem("checkoutSessionId");
        if (checkoutSessionId) try {
            await (0, _apiConfig.apiClient).post("/donate/cancel_checkout_session", {
                data: {
                    checkoutSessionId
                }
            }).fetch();
            localStorage.removeItem("checkoutSessionId");
        } catch (error) {
            console.error("Error canceling checkout session:", error);
        }
    }
    if (campaignId) {
        const state = loadState();
        state.selectedCampaignId = campaignId;
        saveState(state);
        loadingWall.setStyle({
            display: "flex"
        });
        try {
            // Initialize the product list for the provided campaign ID
            await (0, _listCampaignProducts.initializeDynamicProductList)("#selectProductList", campaignId);
            // Set the slider to slide 2
            slider.goToIndex(1);
            updateSidebar(1);
            // Fade out the loading wall
            loadingWall.setStyle({
                opacity: "0"
            });
            setTimeout(()=>{
                loadingWall.setStyle({
                    display: "none"
                });
            }, 500); // Duration should match the CSS transition duration
        } catch (error) {
            console.error("Error initializing product list for campaign:", error);
        }
    } else {
        // Initialize the campaign list if no campaignId is provided
        await (0, _listCampaigns.initializeDynamicCampaignList)("#selectCampaignList");
        isCampaignListInitialized = true;
        // Fade out the loading wall
        loadingWall.setStyle({
            opacity: "0"
        });
        setTimeout(()=>{
            loadingWall.setStyle({
                display: "none"
            });
        }, 500); // Duration should match the CSS transition duration
    }
};
const makeDonation = async ()=>{
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
    const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
    await navigateToStepFromURL();
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        stepOneRequestingAnimation.setStyle({
            display: "block"
        });
        const { selectedCampaignId } = loadState();
        if (!selectedCampaignId) {
            const errorMessage = "Please select a campaign.";
            (0, _formUtils.toggleError)(submitStepOneError, errorMessage, true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        console.log("Selected Campaign ID:", selectedCampaignId);
        try {
            // Initialize the product list for the selected campaign
            await (0, _listCampaignProducts.initializeDynamicProductList)("#selectProductList", selectedCampaignId);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            slider.goNext(); // Transition to the next step using the slider
        } catch (error) {
            console.error("Error during campaign selection:", error);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            (0, _formUtils.toggleError)(submitStepOneError, "Failed to load products for the selected campaign. Please try again.", true);
        }
    });
    const stepTwoRequestingAnimation = new (0, _core.WFComponent)("#stepTwoRequestingAnimation");
    const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        stepTwoRequestingAnimation.setStyle({
            display: "block"
        });
        const { selectedProductId } = loadState();
        const { is_anonymous, first_name, last_name, email } = formData;
        if (!selectedProductId) {
            const errorMessage = "Please select a product.";
            (0, _formUtils.toggleError)(submitStepTwoError, errorMessage, true);
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        if (!user && (!first_name || !last_name || !(0, _validationUtils.validateEmail)(email))) {
            const errorMessage = "Please fill in all required fields.";
            if (!first_name) (0, _formUtils.toggleError)(firstNameInputError, "First name is required.", true);
            if (!last_name) (0, _formUtils.toggleError)(lastNameInputError, "Last name is required.", true);
            if (!(0, _validationUtils.validateEmail)(email)) (0, _formUtils.toggleError)(emailInputError, "Please enter a valid email address.", true);
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        console.log("Selected Product ID:", selectedProductId);
        try {
            const state = loadState();
            state.selectedProductId = selectedProductId;
            state.is_anonymous = is_anonymous;
            state.is_user = !!user; // Add is_user to the state
            if (user && user.profile && user.email) {
                state.email = user.email;
                state.first_name = user.profile.first_name;
                state.last_name = user.profile.last_name;
            } else {
                state.email = email;
                state.first_name = first_name;
                state.last_name = last_name;
            }
            saveState(state);
            // Send a POST request with the state to /donate/begin_checkout
            const response = await (0, _apiConfig.apiClient).post("/donate/begin_checkout", {
                data: state
            }).fetch();
            if (response && response.checkout_url) {
                const checkoutUrl = new URL(response.checkout_url);
                const checkoutSessionId = checkoutUrl.pathname.split("/pay/")[1];
                localStorage.setItem("checkoutSessionId", checkoutSessionId); // Save the session ID to localStorage
                window.location.href = response.checkout_url; // Redirect to the Stripe checkout URL
            }
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
        } catch (error) {
            console.error("Error during product selection:", error);
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            (0, _formUtils.toggleError)(submitStepTwoError, "Failed to select product. Please try again.", true);
        }
    });
    // Handle the "Go Back" button click
    const backStepTwoButton = document.getElementById("backStepTwo");
    if (backStepTwoButton) backStepTwoButton.addEventListener("click", async ()=>{
        slider.goToIndex(0); // Navigate back to step one
        updateSidebar(0);
        if (!isCampaignListInitialized) {
            await (0, _listCampaigns.initializeDynamicCampaignList)("#selectCampaignList");
            isCampaignListInitialized = true;
        }
    });
};

},{"@xatom/core":"j9zXV","@xatom/slider":"2zMuG","../../../auth/authConfig":"gkGgf","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","../../donate/listCampaigns":"gNLCh","../../donate/listCampaignProducts":"b2bGW"}],"2zMuG":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"gNLCh":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDynamicCampaignList", ()=>initializeDynamicCampaignList);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
// Function to log the current state to localStorage
const logState = ()=>{
    const state = JSON.parse(localStorage.getItem("donationState") || "{}");
    state.selectedCampaignId = selectedCampaignId;
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("donationState", JSON.stringify(state));
};
let selectedCampaignId = null;
// Function to fetch campaigns from the server
const fetchCampaigns = async ()=>{
    try {
        const response = await (0, _apiConfig.apiClient).get("/donate/campaigns").fetch();
        return response.campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
    }
};
// Store the initial template state of the container
let initialTemplateState = null;
async function initializeDynamicCampaignList(containerSelector) {
    // Ensure the container exists before initializing the list
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Container not found for selector:", containerSelector);
        return;
    }
    // Capture the initial template state if not already captured
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    // Clear the existing list by resetting the container to its initial state
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
    // Initialize a new instance of WFDynamicList
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectProduction",
        loaderSelector: "#productionListLoading",
        emptySelector: "#productionListEmpty"
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
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const campaignCard = new (0, _core.WFComponent)(rowElement);
        const campaignTitle = campaignCard.getChildAsComponent("#cardCampaignTitle");
        const campaignSubheading = campaignCard.getChildAsComponent("#cardCampaignSubheading");
        const campaignDescription = campaignCard.getChildAsComponent("#cardCampaignDescription");
        const campaignInput = campaignCard.getChildAsComponent(".input_card_input");
        if (!campaignTitle || !campaignSubheading || !campaignDescription || !campaignInput) {
            console.error("One or more elements not found in the campaign card");
            return;
        }
        // Generate unique id for input and associate label
        const inputId = `campaignInput-${index}`;
        campaignInput.setAttribute("id", inputId);
        campaignInput.setAttribute("value", rowData.id);
        const label = campaignCard.getChildAsComponent("label");
        if (label) label.setAttribute("for", inputId);
        campaignTitle.setText(rowData.fieldData.name);
        campaignSubheading.setText(rowData.fieldData.subheading);
        campaignDescription.setText(rowData.fieldData["short-description"]);
        // Handle campaign selection
        campaignInput.on("change", ()=>{
            selectedCampaignId = campaignInput.getElement().value;
            // Log and store the current state
            logState();
            // Log the selected campaign ID
            console.log("Selected Campaign ID:", selectedCampaignId);
        });
        // Show the list item
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    // Load and display the campaigns
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        // Fetch campaigns
        const campaigns = await fetchCampaigns();
        console.log("Fetched campaigns:", campaigns); // Debug log
        if (campaigns.length > 0) list.setData(campaigns);
        else list.setData([]); // Set empty array to trigger the empty state
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading campaigns:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","../../api/apiConfig":"2Lx0S"}],"b2bGW":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDynamicProductList", ()=>initializeDynamicProductList);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
// Function to log the current state to localStorage
const logState = ()=>{
    const state = JSON.parse(localStorage.getItem("donationState") || "{}");
    state.selectedProductId = selectedProductId;
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("donationState", JSON.stringify(state));
};
let selectedProductId = null;
// Function to fetch products from the server based on the selected campaign ID
const fetchProducts = async (campaignId)=>{
    try {
        const response = await (0, _apiConfig.apiClient).post("/donate/campaign/products", {
            data: {
                campaign_id: campaignId
            }
        }).fetch();
        return response.products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};
// Store the initial template state of the container
let initialTemplateState = null;
async function initializeDynamicProductList(containerSelector, campaignId) {
    // Ensure the container exists before initializing the list
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Container not found for selector:", containerSelector);
        return;
    }
    // Capture the initial template state if not already captured
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    // Clear the existing list by resetting the container to its initial state
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
    // Initialize a new instance of WFDynamicList
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectProduct"
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
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const productCard = new (0, _core.WFComponent)(rowElement);
        const productTitle = productCard.getChildAsComponent("#cardProductTitle");
        const productInput = productCard.getChildAsComponent(".input_card_input");
        if (!productTitle || !productInput) {
            console.error("One or more elements not found in the product card");
            return;
        }
        // Generate unique id for input and associate label
        const inputId = `productInput-${index}`;
        productInput.setAttribute("id", inputId);
        productInput.setAttribute("value", rowData.id);
        const label = productCard.getChildAsComponent("label");
        if (label) label.setAttribute("for", inputId);
        productTitle.setText(rowData.fieldData["product-name"]);
        // Handle product selection
        productInput.on("change", ()=>{
            selectedProductId = productInput.getElement().value;
            // Log and store the current state
            logState();
            // Log the selected product ID
            console.log("Selected Product ID:", selectedProductId);
        });
        // Show the list item
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    // Load and display the products
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        // Fetch products
        const products = await fetchProducts(campaignId);
        console.log("Fetched products:", products); // Debug log
        if (products.length > 0) list.setData(products);
        else list.setData([]); // Set empty array to trigger the empty state
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading products:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","../../api/apiConfig":"2Lx0S"}]},[], null, "parcelRequired346")

//# sourceMappingURL=makeDonation.91b924b5.js.map
