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
})({"84sUJ":[function(require,module,exports) {
// programRegistration.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "programRegistration", ()=>programRegistration);
var _programList = require("../../registration/programList");
var _workshopList = require("../../registration/workshopList");
var _sessionsList = require("../../registration/sessionsList");
var _checkoutPreview = require("../../registration/checkoutPreview"); // New import
var _selectedProgram = require("../../registration/state/selectedProgram");
var _selectedWorkshop = require("../../registration/state/selectedWorkshop");
var _core = require("@xatom/core");
var _slider = require("@xatom/slider");
var _sidebarIndicators = require("../../registration/components/sidebarIndicators");
var _dialogHandler = require("../../registration/components/dialogHandler");
var _urlParamNavigator = require("../../registration/components/urlParamNavigator");
const programRegistration = async ()=>{
    // Initialize the first step of the registration form (Program Selection)
    (0, _sidebarIndicators.initializeSidebarIndicators)();
    (0, _sidebarIndicators.setActiveStep)(1);
    await (0, _programList.initializeProgramList)();
    await (0, _dialogHandler.checkForStudents)();
    // Initialize the slider component
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    setupNavigationHandlers(slider);
    await (0, _urlParamNavigator.initializeStateFromUrlParams)(slider);
};
// Setup event listeners for navigation buttons using the slider
const setupNavigationHandlers = (slider)=>{
    const submitStepOne = new (0, _core.WFComponent)("#submitStepOne");
    const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
    const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
    submitStepOne.on("click", async (event)=>{
        event.preventDefault(); // Prevent default form submission behavior
        // Validate the selected program
        const selectedProgram = (0, _selectedProgram.loadSelectedProgram)();
        if (!selectedProgram.id) {
            submitStepOneError.setText("Please select a program before proceeding.");
            submitStepOneError.setStyle({
                display: "block"
            });
            return;
        }
        // Hide the error message if any
        submitStepOneError.setStyle({
            display: "none"
        });
        // Show the loading animation
        stepOneRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Proceed to the next step: Workshop Selection
            await (0, _workshopList.initializeWorkshopList)(selectedProgram.id);
            // Move to the next slide
            slider.goNext();
            (0, _sidebarIndicators.markStepAsCompleted)(1);
            (0, _sidebarIndicators.setActiveStep)(2);
            (0, _selectedWorkshop.resetSelectedWorkshop)();
        } catch (error) {
            console.error("Error loading workshops:", error);
        } finally{
            // Hide the loading animation
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    const backStepTwo = new (0, _core.WFComponent)("#backStepTwo");
    backStepTwo.on("click", ()=>{
        // Move back to the first step
        slider.goPrevious();
        (0, _sidebarIndicators.unmarkStepAsCompleted)(1);
        (0, _sidebarIndicators.unsetActiveStep)(2);
        (0, _selectedWorkshop.resetSelectedWorkshop)();
    });
    const submitStepTwo = new (0, _core.WFComponent)("#submitStepTwo");
    const stepTwoRequestingAnimation = new (0, _core.WFComponent)("#stepTwoRequestingAnimation");
    const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
    submitStepTwo.on("click", async (event)=>{
        event.preventDefault();
        // Get the selected workshop and program from the state
        const selectedWorkshop = (0, _selectedWorkshop.loadSelectedWorkshop)();
        const selectedProgram = (0, _selectedProgram.loadSelectedProgram)();
        // Check if the workshop list is empty or not
        const workshopListContainer = document.querySelector("#selectWorkshopList");
        const workshopItems = workshopListContainer?.querySelectorAll("#cardSelectWorkshop") || [];
        const isWorkshopListEmpty = workshopItems.length === 0;
        if (!isWorkshopListEmpty && !selectedWorkshop.id) {
            submitStepTwoError.setText("Please select a workshop before proceeding.");
            submitStepTwoError.setStyle({
                display: "block"
            });
            return;
        }
        // Hide the error message if any
        submitStepTwoError.setStyle({
            display: "none"
        });
        // Show the loading animation
        stepTwoRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Initialize the session list
            await (0, _sessionsList.initializeSessionList)(selectedWorkshop.id, selectedProgram.id);
            // Move to the next slide
            slider.goNext();
            (0, _sidebarIndicators.markStepAsCompleted)(2);
            (0, _sidebarIndicators.setActiveStep)(3);
        } catch (error) {
            console.error("Error loading sessions:", error);
        } finally{
            // Hide the loading animation
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    const backStepThree = new (0, _core.WFComponent)("#backStepThree");
    backStepThree.on("click", ()=>{
        // Move back to the workshop selection step
        slider.goPrevious();
        (0, _sidebarIndicators.unmarkStepAsCompleted)(2);
        (0, _sidebarIndicators.unsetActiveStep)(3);
    });
    const submitStepThree = new (0, _core.WFComponent)("#submitStepThree");
    const stepThreeRequestingAnimation = new (0, _core.WFComponent)("#stepThreeRequestingAnimation");
    const submitStepThreeError = new (0, _core.WFComponent)("#submitStepThreeError");
    submitStepThree.on("click", async (event)=>{
        event.preventDefault();
        // Show the loading animation
        stepThreeRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Validate and submit sessions
            const success = await (0, _sessionsList.validateAndSubmitSessions)();
            if (success) {
                // Initialize checkout preview and move to the next slide
                await (0, _checkoutPreview.initializeCheckoutPreview)();
                slider.goNext();
                (0, _sidebarIndicators.markStepAsCompleted)(3);
                (0, _sidebarIndicators.setActiveStep)(4);
            } else {
                submitStepThreeError.setText("Please select sessions and students before proceeding.");
                submitStepThreeError.setStyle({
                    display: "block"
                });
            }
        } catch (error) {
            console.error("Error during session submission:", error);
            submitStepThreeError.setText("An error occurred. Please try again.");
            submitStepThreeError.setStyle({
                display: "block"
            });
        } finally{
            // Hide the loading animation
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    const backStepFour = new (0, _core.WFComponent)("#backStepFour");
    backStepFour.on("click", ()=>{
        // Move back to the session selection step
        slider.goPrevious();
        (0, _sidebarIndicators.unmarkStepAsCompleted)(3);
        (0, _sidebarIndicators.unsetActiveStep)(4);
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","@xatom/core":"j9zXV","@xatom/slider":"2zMuG","../../registration/programList":"bA83c","../../registration/workshopList":"dZi8x","../../registration/sessionsList":"2dV61","../../registration/checkoutPreview":"fXOWt","../../registration/state/selectedProgram":"fu9J6","../../registration/state/selectedWorkshop":"BqVJq","../../registration/components/sidebarIndicators":"8jLLI","../../registration/components/dialogHandler":"cywSa","../../registration/components/urlParamNavigator":"2IiT3"}],"2zMuG":[function(require,module,exports) {
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

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}],"bA83c":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeProgramList", ()=>initializeProgramList);
var _programs = require("../../api/programs");
var _selectedProgram = require("./state/selectedProgram");
var _core = require("@xatom/core");
let initialTemplateState = null;
const initializeProgramList = async ()=>{
    const containerSelector = "#selectProgramList";
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Program list container not found");
        return;
    }
    // Save the initial state of the container template
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    else {
        // Reset container to the initial state
        container.innerHTML = "";
        container.appendChild(initialTemplateState.cloneNode(true));
    }
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectProgram",
        loaderSelector: "#programListLoading",
        emptySelector: "#programListEmpty"
    });
    list.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    list.emptyRenderer((emptyElement)=>{
        emptyElement.setStyle({
            display: "flex"
        });
        return emptyElement;
    });
    try {
        const programs = await (0, _programs.fetchPrograms)();
        list.rowRenderer(({ rowData, rowElement, index })=>{
            const programCard = new (0, _core.WFComponent)(rowElement);
            const programTitle = programCard.getChildAsComponent("#cardProgramTitle");
            const programDescription = programCard.getChildAsComponent("#cardProgramDescription");
            const programAges = programCard.getChildAsComponent("#cardProgramAges");
            const programImage = programCard.getChildAsComponent("#cardProgramImage");
            const programInput = programCard.getChildAsComponent(".input_card_input");
            // Generate a unique ID for each radio button
            const inputId = `programInput-${index}`;
            programInput.setAttribute("id", inputId);
            programInput.setAttribute("name", "program"); // Group radio buttons
            programInput.setAttribute("value", rowData.id);
            // Associate the label with the radio button
            const programLabel = programCard.getChildAsComponent("label");
            programLabel.setAttribute("for", inputId);
            programTitle.setText(rowData.fieldData.name);
            programDescription.setText(rowData.fieldData["short-description"]);
            programAges.setText(rowData.fieldData["age-range"]);
            programImage.setAttribute("src", rowData.fieldData["main-image"].url);
            programInput.on("change", ()=>{
                (0, _selectedProgram.saveSelectedProgram)({
                    id: rowData.id,
                    name: rowData.fieldData.name,
                    imageUrl: rowData.fieldData["main-image"].url,
                    ageRange: rowData.fieldData["age-range"]
                });
            });
            rowElement.setStyle({
                display: "flex"
            });
            return rowElement;
        });
        list.setData(programs);
    } catch (error) {
        console.error("Error loading programs:", error);
        list.setData([]);
    }
};

},{"../../api/programs":"65sQp","./state/selectedProgram":"fu9J6","@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"65sQp":[function(require,module,exports) {
// api/programs.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchPrograms", ()=>fetchPrograms);
parcelHelpers.export(exports, "fetchProgramById", ()=>fetchProgramById);
var _apiConfig = require("./apiConfig");
const fetchPrograms = async ()=>{
    try {
        const response = await (0, _apiConfig.apiClient).get("/registration/programs").fetch();
        return response.programs;
    } catch (error) {
        console.error("Error fetching programs:", error);
        throw error;
    }
};
const fetchProgramById = async (programId)=>{
    try {
        const programs = await fetchPrograms();
        return programs.find((program)=>program.id === programId) || null;
    } catch (error) {
        console.error(`Error fetching program with ID ${programId}:`, error);
        return null;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fu9J6":[function(require,module,exports) {
// state/selectedProgram.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadSelectedProgram", ()=>loadSelectedProgram);
parcelHelpers.export(exports, "saveSelectedProgram", ()=>saveSelectedProgram);
const loadSelectedProgram = ()=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    return {
        id: state.selectedProgramId || null,
        name: state.selectedProgramName || null,
        imageUrl: state.selectedProgramImageUrl || null,
        ageRange: state.selectedProgramAgeRange || null
    };
};
const saveSelectedProgram = (program)=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    state.selectedProgramId = program.id;
    state.selectedProgramName = program.name;
    state.selectedProgramImageUrl = program.imageUrl;
    state.selectedProgramAgeRange = program.ageRange;
    console.log("Saving selected program to state:", state); // Debug log
    localStorage.setItem("registrationState", JSON.stringify(state));
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dZi8x":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeWorkshopList", ()=>initializeWorkshopList);
var _workshops = require("../../api/workshops");
var _selectedWorkshop = require("./state/selectedWorkshop");
var _core = require("@xatom/core");
let initialTemplateState = null;
const initializeWorkshopList = async (programId)=>{
    const containerSelector = "#selectWorkshopList";
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Workshop list container not found");
        return;
    }
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    else {
        container.innerHTML = "";
        container.appendChild(initialTemplateState.cloneNode(true));
    }
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectWorkshop",
        loaderSelector: "#workshopListLoading",
        emptySelector: "#workshopListEmpty"
    });
    list.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    list.emptyRenderer((emptyElement)=>{
        emptyElement.setStyle({
            display: "flex"
        });
        return emptyElement;
    });
    try {
        const workshops = await (0, _workshops.fetchWorkshops)(programId);
        // Ensure workshops is always an array and sort it alphabetically by name
        const workshopArray = (Array.isArray(workshops) ? workshops : []).sort((a, b)=>a.fieldData.name.localeCompare(b.fieldData.name));
        list.rowRenderer(({ rowData, rowElement, index })=>{
            const workshopCard = new (0, _core.WFComponent)(rowElement);
            const workshopTitle = workshopCard.getChildAsComponent("#cardWorkshopTitle");
            const workshopDescription = workshopCard.getChildAsComponent("#cardWorkshopDescription");
            const workshopAges = workshopCard.getChildAsComponent("#cardWorkshopAges");
            const workshopImage = workshopCard.getChildAsComponent("#cardWorkshopImage");
            const workshopInput = workshopCard.getChildAsComponent(".input_card_input");
            const inputId = `workshopInput-${index}`;
            workshopInput.setAttribute("id", inputId);
            workshopInput.setAttribute("name", "workshop");
            workshopInput.setAttribute("value", rowData.id);
            const workshopLabel = workshopCard.getChildAsComponent("label");
            workshopLabel.setAttribute("for", inputId);
            workshopTitle.setText(rowData.fieldData.name);
            workshopDescription.setText(rowData.fieldData["short-description"]);
            workshopAges.setText(rowData.fieldData["age-range"]);
            workshopImage.setAttribute("src", rowData.fieldData["main-image"].url);
            workshopInput.on("change", ()=>{
                (0, _selectedWorkshop.saveSelectedWorkshop)({
                    id: rowData.id,
                    name: rowData.fieldData.name,
                    imageUrl: rowData.fieldData["main-image"].url,
                    ageRange: rowData.fieldData["age-range"]
                });
            });
            rowElement.setStyle({
                display: "flex"
            });
            return rowElement;
        });
        list.setData(workshopArray);
    } catch (error) {
        console.error("Error loading workshops:", error);
        list.setData([]); // Handle case where no workshops are available or an error occurred
    }
};

},{"../../api/workshops":"k278f","./state/selectedWorkshop":"BqVJq","@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"k278f":[function(require,module,exports) {
// api/workshops.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchWorkshops", ()=>fetchWorkshops);
parcelHelpers.export(exports, "fetchWorkshopById", ()=>fetchWorkshopById);
var _apiConfig = require("./apiConfig");
const fetchWorkshops = async (programId)=>{
    try {
        const response = await (0, _apiConfig.apiClient).get(`/registration/workshops?program_id=${programId}`).fetch();
        return response.workshops;
    } catch (error) {
        console.error("Error fetching workshops:", error);
        throw error;
    }
};
const fetchWorkshopById = async (workshopId)=>{
    try {
        // Assuming there's a similar endpoint to fetch a single workshop by ID
        const response = await (0, _apiConfig.apiClient).get(`/registration/workshops/${workshopId}`).fetch();
        return response.workshop || null;
    } catch (error) {
        console.error(`Error fetching workshop with ID ${workshopId}:`, error);
        return null;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"BqVJq":[function(require,module,exports) {
// state/selectedWorkshop.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadSelectedWorkshop", ()=>loadSelectedWorkshop);
parcelHelpers.export(exports, "saveSelectedWorkshop", ()=>saveSelectedWorkshop);
parcelHelpers.export(exports, "resetSelectedWorkshop", ()=>resetSelectedWorkshop);
const loadSelectedWorkshop = ()=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    return {
        id: state.selectedWorkshopId || null,
        name: state.selectedWorkshopName || null,
        imageUrl: state.selectedWorkshopImageUrl || null,
        ageRange: state.selectedWorkshopAgeRange || null
    };
};
const saveSelectedWorkshop = (workshop)=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    state.selectedWorkshopId = workshop.id;
    state.selectedWorkshopName = workshop.name;
    state.selectedWorkshopImageUrl = workshop.imageUrl;
    state.selectedWorkshopAgeRange = workshop.ageRange;
    console.log("Saving selected workshop to state:", state); // Debug log
    localStorage.setItem("registrationState", JSON.stringify(state));
};
const resetSelectedWorkshop = ()=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    delete state.selectedWorkshopId;
    delete state.selectedWorkshopName;
    delete state.selectedWorkshopImageUrl;
    delete state.selectedWorkshopAgeRange;
    console.log("Resetting selected workshop in state:", state); // Debug log
    localStorage.setItem("registrationState", JSON.stringify(state));
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2dV61":[function(require,module,exports) {
// components/sessionsList.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSessionList", ()=>initializeSessionList);
parcelHelpers.export(exports, "validateAndSubmitSessions", ()=>validateAndSubmitSessions);
var _sessions = require("../../api/sessions");
var _updateUi = require("./utils/updateUi");
var _students = require("../../api/students");
var _selectedSessions = require("./state/selectedSessions");
var _registrationState = require("./state/registrationState");
var _core = require("@xatom/core");
let initialTemplateState = null;
let sessionData = [];
const initializeSessionList = async (workshopId, programId)=>{
    const containerSelector = "#selectSessionList";
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Session list container not found");
        return;
    }
    (0, _selectedSessions.resetSelectedSessions)();
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    else {
        container.innerHTML = "";
        container.appendChild(initialTemplateState.cloneNode(true));
    }
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#sessionSelectWrap",
        loaderSelector: "#sessionListLoading",
        emptySelector: "#sessionListEmpty"
    });
    list.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    list.emptyRenderer((emptyElement)=>{
        emptyElement.setStyle({
            display: "flex"
        });
        return emptyElement;
    });
    // Correct usage with destructuring to get 'students'
    let studentProfiles = [];
    try {
        const { students } = await (0, _students.fetchStudentProfiles)(); // Destructure to get 'students'
        studentProfiles = students; // Assign the students array to studentProfiles
    } catch (error) {
        console.error("Error fetching student profiles:", error);
    }
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const sessionCard = new (0, _core.WFComponent)(rowElement);
        const sessionWeekday = sessionCard.getChildAsComponent("#cardSessionWeekday");
        const sessionTime = sessionCard.getChildAsComponent("#cardSessionTime");
        const sessionLocation = sessionCard.getChildAsComponent("#cardSessionLocation");
        const sessionPrice = sessionCard.getChildAsComponent("#cardSessionPrice");
        const sessionInput = sessionCard.getChildAsComponent("#cardSessionInput");
        const studentsList = sessionCard.getChildAsComponent("#selectStudentsList");
        const hiddenFieldWrap = sessionCard.getChildAsComponent(".hidden_form_field-wrap");
        const inputId = `sessionInput-${index}`;
        sessionInput.setAttribute("id", inputId);
        sessionInput.setAttribute("value", rowData.id);
        const label = sessionCard.getChildAsComponent("label");
        label.setAttribute("for", inputId);
        sessionWeekday.setText(rowData.fieldData.weekday);
        sessionTime.setText(rowData.fieldData["time-block"]);
        sessionLocation.setText(rowData.fieldData.location);
        const initialPrice = updateSessionPrice(sessionPrice, rowData);
        studentsList.removeAllChildren();
        studentProfiles.forEach((student)=>{
            const studentId = student.id;
            const uniqueStudentId = `${inputId}-student-${studentId}`;
            const studentPill = new (0, _core.WFComponent)(document.createElement("label"));
            studentPill.addCssClass("pill-item");
            studentPill.setAttribute("for", uniqueStudentId);
            const studentCheckbox = new (0, _core.WFComponent)(document.createElement("input"));
            studentCheckbox.setAttribute("type", "checkbox");
            studentCheckbox.addCssClass("pill-checkbox");
            studentCheckbox.setAttribute("id", uniqueStudentId);
            studentCheckbox.setAttribute("name", "selectedStudents");
            studentCheckbox.setAttribute("value", studentId.toString());
            const studentName = new (0, _core.WFComponent)(document.createElement("span"));
            studentName.addCssClass("pill-label");
            studentName.addCssClass("has-icon");
            studentName.setText(`${student.first_name} ${student.last_name}`);
            const pillIcon = new (0, _core.WFComponent)(document.createElement("div"));
            pillIcon.addCssClass("pill-icon");
            pillIcon.addCssClass("w-embed");
            pillIcon.setHTML(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"></path></svg>`);
            studentPill.appendChild(studentCheckbox);
            studentPill.appendChild(studentName);
            studentPill.appendChild(pillIcon);
            studentsList.appendChild(studentPill);
            studentCheckbox.on("change", ()=>{
                const studentCheckboxElement = studentCheckbox.getElement();
                const studentIdInt = parseInt(studentCheckboxElement.value);
                const sessionChangedEvent = new CustomEvent("sessionChanged", {
                    detail: {
                        sessionId: rowData.id,
                        studentId: studentIdInt,
                        checked: studentCheckboxElement.checked,
                        initialPriceSelection: initialPrice
                    }
                });
                document.dispatchEvent(sessionChangedEvent);
                (0, _selectedSessions.updateSelectedSessions)(rowData.id, studentIdInt, studentCheckboxElement.checked);
            });
        });
        sessionInput.on("change", ()=>{
            const inputElement = sessionInput.getElement();
            if (inputElement.checked) hiddenFieldWrap.setStyle({
                display: "flex"
            });
            else {
                hiddenFieldWrap.setStyle({
                    display: "none"
                });
                const studentCheckboxes = studentsList.getChildAsComponents(".pill-checkbox");
                studentCheckboxes.forEach((checkbox)=>{
                    const studentCheckboxElement = checkbox.getElement();
                    studentCheckboxElement.checked = false;
                    const studentIdInt = parseInt(studentCheckboxElement.value);
                    const sessionChangedEvent = new CustomEvent("sessionChanged", {
                        detail: {
                            sessionId: rowData.id,
                            studentId: studentIdInt,
                            checked: false,
                            initialPriceSelection: initialPrice
                        }
                    });
                    document.dispatchEvent(sessionChangedEvent);
                    (0, _selectedSessions.updateSelectedSessions)(rowData.id, studentIdInt, false);
                });
            }
        });
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        const sessions = await (0, _sessions.fetchSessions)(workshopId, programId);
        if (Array.isArray(sessions) && sessions.length > 0) {
            sessionData = sessions;
            list.setData(sessions);
            // Set default pricing option to 'Annual' if not already set
            let registrationState = (0, _registrationState.loadState)();
            if (!registrationState.selectedPricingOption) {
                registrationState.selectedPricingOption = "Annual";
                (0, _registrationState.saveState)(registrationState);
            }
            updateAllSessionPrices();
        } else list.setData([]);
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading sessions:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
    }
    document.querySelector("#updatePriceAnnual")?.addEventListener("change", ()=>{
        (0, _registrationState.logPricingOption)("Annual");
        updateAllSessionPrices();
    });
    document.querySelector("#updatePriceMonthly")?.addEventListener("change", ()=>{
        (0, _registrationState.logPricingOption)("Monthly");
        updateAllSessionPrices();
    });
    document.querySelector("#updatePriceSemester")?.addEventListener("change", ()=>{
        (0, _registrationState.logPricingOption)("Pay-Per-Semester");
        updateAllSessionPrices();
    });
    document.querySelector("#updatePriceDeposit")?.addEventListener("change", ()=>{
        (0, _registrationState.logPricingOption)("Deposit");
        updateAllSessionPrices();
    });
    initializeFilterSelect();
    (0, _updateUi.updateSelectedItemUI)(); // Ensure selected item UI is updated initially
};
// Update the selected item UI
/*const updateSelectedItemUI = () => {
  const selectedProgram = loadSelectedProgram();
  const selectedWorkshop = loadSelectedWorkshop();

  const selectedProgramTitle = new WFComponent("#selectedProgramTitle");
  const selectedWorkshopTitle = new WFComponent("#selectedWorkshopTitle");
  const selectedAgeRange = new WFComponent("#selectedAgeRange");
  const selectedImage = new WFComponent("#selectedImage");

  if (selectedProgram.id) {
    selectedProgramTitle.setText(selectedProgram.name);

    if (selectedWorkshop.id) {
      selectedWorkshopTitle.setText(selectedWorkshop.name);
      selectedWorkshopTitle.setStyle({ display: "block" });
      selectedAgeRange.setText(selectedWorkshop.ageRange); // Use workshop age range

      // Use the workshop image if available, otherwise use the program image
      const imageUrl = selectedWorkshop.imageUrl || selectedProgram.imageUrl;
      selectedImage.setAttribute("src", imageUrl);
    } else {
      selectedWorkshopTitle.setStyle({ display: "none" });
      selectedAgeRange.setText(selectedProgram.ageRange); // Use program age range if no workshop selected
      selectedImage.setAttribute("src", selectedProgram.imageUrl);
    }
  }
};*/ (0, _updateUi.updateSelectedItemUI)();
const updateSessionPrice = (sessionPrice, rowData)=>{
    const registrationState = JSON.parse(localStorage.getItem("registrationState") || "{}");
    const selectedPricingOption = registrationState.selectedPricingOption || "Annual";
    let price;
    switch(selectedPricingOption){
        case "Annual":
            price = rowData.fieldData["displayed-annual-price"];
            break;
        case "Monthly":
            price = rowData.fieldData["displayed-monthly-price"];
            break;
        case "Pay-Per-Semester":
            price = rowData.fieldData["displayed-one-off-price"];
            break;
        case "Deposit":
            price = rowData.fieldData["displayed-deposit-price"];
            break;
        default:
            price = ""; // Or any default value you choose
    }
    sessionPrice.setText(price);
    return price;
};
const updateAllSessionPrices = ()=>{
    const sessionCards = document.querySelectorAll("#sessionSelectWrap");
    sessionCards.forEach((sessionCard)=>{
        const sessionPriceElement = sessionCard.querySelector("#cardSessionPrice");
        const sessionPrice = new (0, _core.WFComponent)(sessionPriceElement);
        const sessionInputElement = sessionCard.querySelector(".session-input");
        const sessionId = sessionInputElement.value;
        const rowData = sessionData.find((session)=>session.id === sessionId);
        if (sessionPrice && rowData) updateSessionPrice(sessionPrice, rowData);
    });
};
const initializeFilterSelect = ()=>{
    const selectElement = document.getElementById("singleSelectInput");
    if (selectElement) selectElement.addEventListener("change", (event)=>{
        const selectedValue = event.target.value;
        filterSessionsByLocation(selectedValue);
    });
};
const filterSessionsByLocation = (location)=>{
    const sessionCards = document.querySelectorAll("#sessionSelectWrap");
    sessionCards.forEach((sessionCard)=>{
        const sessionLocationElement = sessionCard.querySelector("#cardSessionLocation");
        const sessionLocation = sessionLocationElement?.textContent || "";
        if (location === "N/A" || sessionLocation === location) sessionCard.style.display = "flex";
        else sessionCard.style.display = "none";
    });
};
const validateAndSubmitSessions = ()=>{
    const registrationState = JSON.parse(localStorage.getItem("registrationState") || "{}");
    const submitStepThreeError = new (0, _core.WFComponent)("#submitStepThreeError");
    // Ensure that at least one session is selected
    if (!registrationState.selectedSessions || registrationState.selectedSessions.length === 0) {
        submitStepThreeError.setText("Please select at least one session.");
        submitStepThreeError.setStyle({
            display: "block"
        });
        return false;
    }
    // Ensure each selected session has associated students
    for (const session of registrationState.selectedSessions)if (!session.studentIds || session.studentIds.length === 0) {
        submitStepThreeError.setText("Please select at least one student for each session.");
        submitStepThreeError.setStyle({
            display: "block"
        });
        return false;
    }
    // Hide the error message if validation passes
    submitStepThreeError.setStyle({
        display: "none"
    });
    // If validation passes, save state or submit data to the server
    (0, _registrationState.saveState)(registrationState);
    return true;
};

},{"../../api/sessions":"eZyDd","./utils/updateUi":"gyQJE","../../api/students":"5X7sO","./state/selectedSessions":"4BK60","./state/registrationState":"jIQ60","@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"eZyDd":[function(require,module,exports) {
// api/sessions.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchSessions", ()=>fetchSessions);
var _apiConfig = require("./apiConfig");
const fetchSessions = async (workshopId, programId)=>{
    try {
        const response = await (0, _apiConfig.apiClient).get(`/registration/sessions?workshop_id=${workshopId}&program_id=${programId}`).fetch();
        return response.sessions || [];
    } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"gyQJE":[function(require,module,exports) {
// updateUI.js
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateSelectedItemUI", ()=>updateSelectedItemUI);
var _selectedProgram = require("../state/selectedProgram");
var _selectedWorkshop = require("../state/selectedWorkshop");
var _core = require("@xatom/core");
const updateSelectedItemUI = ()=>{
    const selectedProgram = (0, _selectedProgram.loadSelectedProgram)();
    const selectedWorkshop = (0, _selectedWorkshop.loadSelectedWorkshop)();
    // Original UI elements
    const selectedProgramTitle = new (0, _core.WFComponent)("#selectedProgramTitle");
    const selectedWorkshopTitle = new (0, _core.WFComponent)("#selectedWorkshopTitle");
    const selectedAgeRange = new (0, _core.WFComponent)("#selectedAgeRange");
    const selectedImage = new (0, _core.WFComponent)("#selectedImage");
    // Final UI elements
    const selectedProgramTitleFinal = new (0, _core.WFComponent)("#selectedProgramTitleFinal");
    const selectedWorkshopTitleFinal = new (0, _core.WFComponent)("#selectedWorkshopTitleFinal");
    const selectedAgeRangeFinal = new (0, _core.WFComponent)("#selectedAgeRangeFinal");
    const selectedImageFinal = new (0, _core.WFComponent)("#selectedImageFinal");
    // Function to set UI elements based on the selected data
    const setUIElements = (programTitle, workshopTitle, ageRange, image)=>{
        programTitle.setText(selectedProgram.name);
        if (selectedWorkshop.id) {
            workshopTitle.setText(selectedWorkshop.name);
            workshopTitle.setStyle({
                display: "block"
            });
            ageRange.setText(selectedWorkshop.ageRange);
            const imageUrl = selectedWorkshop.imageUrl || selectedProgram.imageUrl;
            image.setAttribute("src", imageUrl);
        } else {
            workshopTitle.setStyle({
                display: "none"
            });
            ageRange.setText(selectedProgram.ageRange);
            image.setAttribute("src", selectedProgram.imageUrl);
        }
    };
    // Update original UI elements
    if (selectedProgram.id) setUIElements(selectedProgramTitle, selectedWorkshopTitle, selectedAgeRange, selectedImage);
    // Update final UI elements
    if (selectedProgram.id) setUIElements(selectedProgramTitleFinal, selectedWorkshopTitleFinal, selectedAgeRangeFinal, selectedImageFinal);
};

},{"../state/selectedProgram":"fu9J6","../state/selectedWorkshop":"BqVJq","@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"5X7sO":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchStudentProfiles", ()=>fetchStudentProfiles);
var _apiConfig = require("./apiConfig");
var _registrationState = require("../modules/registration/state/registrationState");
const fetchStudentProfiles = async ()=>{
    try {
        const response = await (0, _apiConfig.apiClient).get("/profiles/student_profiles").fetch();
        if (response.students) {
            // Filter students with status "Pending"
            const pendingStudents = response.students.filter((student)=>student.Status === "Pending");
            const pendingStudentNames = pendingStudents.map((student)=>`${student.first_name} ${student.last_name}`);
            // Log names of pending students (for debugging purposes)
            console.log("Pending Students:", pendingStudentNames);
            // Update registrationState with pending students
            (0, _registrationState.saveState)({
                pendingStudents: pendingStudentNames
            });
            // Check if there are no students and indicate that the dialog should be shown
            return {
                students: response.students,
                showDialog: response.students.length === 0
            };
        } else {
            console.error("No students property in response");
            return {
                students: [],
                showDialog: true
            };
        }
    } catch (error) {
        console.error("Error fetching student profiles:", error);
        return {
            students: [],
            showDialog: true
        };
    }
};

},{"./apiConfig":"2Lx0S","../modules/registration/state/registrationState":"jIQ60","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"jIQ60":[function(require,module,exports) {
// state/registrationState.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadState", ()=>loadState);
parcelHelpers.export(exports, "saveState", ()=>saveState);
parcelHelpers.export(exports, "logPricingOption", ()=>logPricingOption);
parcelHelpers.export(exports, "getPendingStudents", ()=>getPendingStudents);
const loadState = ()=>{
    const savedState = localStorage.getItem("registrationState");
    if (savedState) return JSON.parse(savedState);
    return {};
};
const saveState = (state)=>{
    const currentState = loadState();
    const newState = {
        ...currentState,
        ...state
    };
    localStorage.setItem("registrationState", JSON.stringify(newState));
};
const logPricingOption = (pricingOption)=>{
    saveState({
        selectedPricingOption: pricingOption
    });
};
const getPendingStudents = ()=>{
    const state = loadState();
    return state.pendingStudents || [];
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"4BK60":[function(require,module,exports) {
// state/selectedSessions.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadSelectedSession", ()=>loadSelectedSession);
parcelHelpers.export(exports, "saveSelectedSession", ()=>saveSelectedSession);
parcelHelpers.export(exports, "resetSelectedSessions", ()=>resetSelectedSessions);
parcelHelpers.export(exports, "updateSelectedSessions", ()=>updateSelectedSessions);
const loadSelectedSession = ()=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    return state.selectedSession || null;
};
const saveSelectedSession = (session)=>{
    const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
    state.selectedSession = session;
    localStorage.setItem("registrationState", JSON.stringify(state));
};
const resetSelectedSessions = ()=>{
    const registrationState = JSON.parse(localStorage.getItem("registrationState") || "{}");
    registrationState.selectedSessions = [];
    localStorage.setItem("registrationState", JSON.stringify(registrationState));
};
const updateSelectedSessions = (sessionId, studentId, checked)=>{
    const registrationState = JSON.parse(localStorage.getItem("registrationState") || "{}");
    if (!registrationState.selectedSessions) registrationState.selectedSessions = [];
    let session = registrationState.selectedSessions.find((s)=>s.sessionId === sessionId);
    if (checked) {
        if (!session) {
            session = {
                sessionId: sessionId,
                studentIds: [
                    studentId
                ]
            };
            registrationState.selectedSessions.push(session);
        } else if (!session.studentIds.includes(studentId)) session.studentIds.push(studentId);
    } else if (session) {
        session.studentIds = session.studentIds.filter((id)=>id !== studentId);
        if (session.studentIds.length === 0) registrationState.selectedSessions = registrationState.selectedSessions.filter((s)=>s.sessionId !== sessionId);
    }
    localStorage.setItem("registrationState", JSON.stringify(registrationState));
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fXOWt":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeCheckoutPreview", ()=>initializeCheckoutPreview);
var _updateUi = require("./utils/updateUi");
var _apiConfig = require("../../api/apiConfig");
var _registrationState = require("./state/registrationState");
var _alertBox = require("./components/alertBox");
var _primaryPaymentRadios = require("./components/primaryPaymentRadios");
var _secondaryPaymentRadios = require("./components/secondaryPaymentRadios");
var _lineItems = require("./components/lineItems");
var _updateTotalAmount = require("./components/updateTotalAmount");
var _financialAid = require("./components/financialAid"); // Import financial aid initialization
const initializeCheckoutPreview = async ()=>{
    try {
        const registrationState = (0, _registrationState.loadState)();
        const response = await (0, _apiConfig.apiClient).post("/registration/checkout-preview", {
            data: registrationState
        }).fetch();
        console.log("Checkout Preview Data:", response);
        (0, _updateUi.updateSelectedItemUI)();
        (0, _alertBox.initializeAlertBox)();
        const { selectedPricingOption } = response;
        // Extract line items data only
        const lineItemsOnly = {
            annual_line_items: response.annual_line_items,
            monthly_line_items: response.monthly_line_items,
            semester_line_items: response.semester_line_items,
            deposit_line_items: response.deposit_line_items
        };
        // Save the entire response to state for later use
        (0, _registrationState.saveState)({
            checkoutPreview: response,
            selectedPricingOption
        });
        (0, _primaryPaymentRadios.initializePrimaryPaymentRadios)(selectedPricingOption);
        (0, _secondaryPaymentRadios.initializeSecondaryPaymentRadios)(selectedPricingOption);
        (0, _financialAid.initializeFinancialAid)(); // Initialize financial aid components
        const initialLineItems = (0, _lineItems.getLineItemsForSelectedOption)(selectedPricingOption, lineItemsOnly);
        (0, _lineItems.renderLineItems)(initialLineItems);
        (0, _updateTotalAmount.updateTotalAmount)();
    } catch (error) {
        console.error("Error fetching checkout preview data:", error);
    }
};

},{"./utils/updateUi":"gyQJE","../../api/apiConfig":"2Lx0S","./state/registrationState":"jIQ60","./components/alertBox":"kOgMy","./components/primaryPaymentRadios":"40hDJ","./components/secondaryPaymentRadios":"2CoPv","./components/lineItems":"4Hqur","./components/updateTotalAmount":"73URz","./components/financialAid":"8HFcq","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"kOgMy":[function(require,module,exports) {
// components/registration/initializeAlertBox.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeAlertBox", ()=>initializeAlertBox);
var _registrationState = require("../state/registrationState");
const initializeAlertBox = ()=>{
    const alertBox = document.querySelector("#alertBox");
    const alertPendingStudentList = document.querySelector("#alertPendingStudentList");
    if (!alertBox || !alertPendingStudentList) {
        console.error("Alert box elements not found");
        return;
    }
    const pendingStudents = (0, _registrationState.getPendingStudents)();
    if (pendingStudents.length > 0) {
        alertBox.style.display = "flex";
        alertPendingStudentList.innerHTML = pendingStudents.map((student)=>`<li>${student}</li>`).join("");
    } else alertBox.style.display = "none";
};

},{"../state/registrationState":"jIQ60","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"40hDJ":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializePrimaryPaymentRadios", ()=>initializePrimaryPaymentRadios);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _lineItems = require("./lineItems");
var _updateTotalAmount = require("./updateTotalAmount");
const initializePrimaryPaymentRadios = (selectedPricingOption)=>{
    const paymentPlans = [
        {
            key: "Annual",
            id: "annualPlan",
            wrapId: "annualRadioWrap"
        },
        {
            key: "Monthly",
            id: "monthlyPlan",
            wrapId: "monthlyRadioWrap"
        },
        {
            key: "Pay-Per-Semester",
            id: "semesterPlan",
            wrapId: "semesterRadioWrap"
        },
        {
            key: "Deposit",
            id: "deposit",
            wrapId: "depositRadioWrap"
        }
    ];
    paymentPlans.forEach((plan)=>{
        const planElement = new (0, _core.WFComponent)(`#${plan.id}`).getElement();
        const planWrapElement = new (0, _core.WFComponent)(`#${plan.wrapId}`).getElement();
        if (plan.key === selectedPricingOption) {
            planElement.checked = true;
            planWrapElement.classList.remove("is-disabled");
            planElement.disabled = false;
        } else if (selectedPricingOption === "Deposit") {
            if (plan.key !== "Deposit") {
                planWrapElement.classList.add("is-disabled");
                planElement.disabled = true;
            } else {
                planWrapElement.classList.remove("is-disabled");
                planElement.disabled = false;
                planElement.checked = true;
            }
        } else if (plan.key === "Deposit") {
            planWrapElement.classList.add("is-disabled");
            planElement.disabled = true;
        } else {
            planWrapElement.classList.remove("is-disabled");
            planElement.disabled = false;
        }
    });
    paymentPlans.forEach((plan)=>{
        const input = new (0, _core.WFComponent)(`#${plan.id}`).getElement();
        input.addEventListener("change", (event)=>{
            const target = event.target;
            if (target.checked) {
                (0, _registrationState.saveState)({
                    selectedPricingOption: target.value
                });
                const registrationState = (0, _registrationState.loadState)();
                const lineItemsOnly = {
                    annual_line_items: registrationState.checkoutPreview?.annual_line_items ?? [],
                    monthly_line_items: registrationState.checkoutPreview?.monthly_line_items ?? [],
                    semester_line_items: registrationState.checkoutPreview?.semester_line_items ?? [],
                    deposit_line_items: registrationState.checkoutPreview?.deposit_line_items ?? []
                };
                const lineItems = (0, _lineItems.getLineItemsForSelectedOption)(target.value, lineItemsOnly);
                (0, _lineItems.renderLineItems)(lineItems);
                (0, _updateTotalAmount.updateTotalAmount)();
                console.log(`Primary pricing option selected: ${target.value}`);
            }
        });
    });
};

},{"@xatom/core":"j9zXV","../state/registrationState":"jIQ60","./lineItems":"4Hqur","./updateTotalAmount":"73URz","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"4Hqur":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "renderLineItems", ()=>renderLineItems);
parcelHelpers.export(exports, "getLineItemsForSelectedOption", ()=>getLineItemsForSelectedOption);
var _core = require("@xatom/core");
const renderLineItems = (lineItems)=>{
    const lineItemList = new (0, _core.WFComponent)("#lineItemList");
    lineItemList.removeAllChildren(); // Clear previous line items
    lineItems.forEach((item)=>{
        const lineItemRow = document.createElement("tr");
        lineItemRow.className = "table_row";
        const productNameCell = document.createElement("td");
        productNameCell.className = "table_cell";
        productNameCell.textContent = item.product_name;
        lineItemRow.appendChild(productNameCell);
        const unitAmountCell = document.createElement("td");
        unitAmountCell.className = "table_cell";
        unitAmountCell.textContent = `$${item.unit_amount}`;
        lineItemRow.appendChild(unitAmountCell);
        const quantityCell = document.createElement("td");
        quantityCell.className = "table_cell";
        quantityCell.textContent = `${item.quantity}`;
        lineItemRow.appendChild(quantityCell);
        const totalAmountCell = document.createElement("td");
        totalAmountCell.className = "table_cell";
        totalAmountCell.textContent = `$${item.total_amount}`;
        lineItemRow.appendChild(totalAmountCell);
        lineItemList.getElement().appendChild(lineItemRow);
    });
};
const getLineItemsForSelectedOption = (selectedPricingOption, lineItemsData)=>{
    switch(selectedPricingOption){
        case "Annual":
            return lineItemsData.annual_line_items;
        case "Monthly":
            return lineItemsData.monthly_line_items;
        case "Pay-Per-Semester":
            return lineItemsData.semester_line_items;
        case "Deposit":
            return lineItemsData.deposit_line_items;
        default:
            console.warn("Unknown pricing option:", selectedPricingOption);
            return [];
    }
};

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"73URz":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateTotalAmount", ()=>updateTotalAmount);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _formatting = require("../utils/formatting");
const updateTotalAmount = ()=>{
    const state = (0, _registrationState.loadState)();
    const totalAmountElement = new (0, _core.WFComponent)("#primaryTotalAmount");
    const primaryOriginalAmountElement = new (0, _core.WFComponent)("#primaryOriginalAmount");
    const primaryDiscountPill = new (0, _core.WFComponent)("#primaryDiscountPill");
    const primaryDiscountNumber = new (0, _core.WFComponent)("#primaryDiscountNumber");
    let totalAmount;
    let originalAmount;
    let amountType = ""; // To hold the type of amount (e.g., "Per Year")
    switch(state.selectedPricingOption){
        case "Annual":
            originalAmount = state.checkoutPreview?.annual_amount_due;
            amountType = "Per Year";
            break;
        case "Monthly":
            originalAmount = state.checkoutPreview?.monthly_amount_due;
            amountType = "Per Month";
            break;
        case "Pay-Per-Semester":
            originalAmount = state.checkoutPreview?.semester_amount_due;
            amountType = "Per Semester";
            break;
        case "Deposit":
            originalAmount = state.checkoutPreview?.deposit_amount_due;
            amountType = ""; // Deposit might not need a period label
            break;
        default:
            console.warn("Unknown pricing option:", state.selectedPricingOption);
    }
    if (state.selected_discount && state.selectedPricingOption !== "Deposit") {
        const discountValue = parseFloat(state.selected_discount);
        totalAmount = originalAmount ? originalAmount * (1 - discountValue / 100) : 0;
        primaryDiscountPill.setStyle({
            display: "block"
        });
        primaryDiscountNumber.setText(`${discountValue}%`);
        primaryOriginalAmountElement.setText(`was ${(0, _formatting.formatCurrency)(originalAmount)} ${amountType}`);
        primaryOriginalAmountElement.setStyle({
            display: "block"
        });
    } else {
        totalAmount = originalAmount;
        primaryDiscountPill.setStyle({
            display: "none"
        });
        primaryOriginalAmountElement.setStyle({
            display: "none"
        });
    }
    if (totalAmount !== undefined) totalAmountElement.setText(`${(0, _formatting.formatCurrency)(totalAmount)} ${amountType}`);
    else totalAmountElement.setText(`$0.00 ${amountType}`);
};

},{"@xatom/core":"j9zXV","../state/registrationState":"jIQ60","../utils/formatting":"iRhp7","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"iRhp7":[function(require,module,exports) {
// utils/formatting.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "formatCurrency", ()=>formatCurrency);
const formatCurrency = (amount)=>{
    // Convert to a number if the amount is a string
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    // Ensure the conversion worked and format the number
    if (!isNaN(numericAmount)) return numericAmount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });
    return "$0.00"; // Default value in case of error
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2CoPv":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSecondaryPaymentRadios", ()=>initializeSecondaryPaymentRadios);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _updateSecondaryTotalAmount = require("./updateSecondaryTotalAmount"); // Import the new function
const initializeSecondaryPaymentRadios = (selectedPricingOption)=>{
    const hiddenSecondaryPricing = new (0, _core.WFComponent)("#hiddenSecondaryPricing");
    const secondaryAmountWrap = new (0, _core.WFComponent)("#secondaryAmountWrap");
    const state = (0, _registrationState.loadState)();
    if (!state.secondaryPricingOption) (0, _registrationState.saveState)({
        secondaryPricingOption: "Annual"
    });
    if (selectedPricingOption === "Deposit") {
        hiddenSecondaryPricing.setStyle({
            display: "flex"
        });
        secondaryAmountWrap.setStyle({
            display: "flex"
        }); // Show the secondary amount wrap
        const initialSecondaryOption = state.secondaryPricingOption || "Annual";
        const initialRadio = new (0, _core.WFComponent)(`input[name='secondaryPricing'][value='${initialSecondaryOption}']`).getElement();
        initialRadio.checked = true;
        // Update the secondary total amount based on the initial secondary option
        (0, _updateSecondaryTotalAmount.updateSecondaryTotalAmount)(initialSecondaryOption);
    } else {
        hiddenSecondaryPricing.setStyle({
            display: "none"
        });
        secondaryAmountWrap.setStyle({
            display: "none"
        }); // Hide the secondary amount wrap
    }
    document.querySelectorAll("input[name='secondaryPricing']").forEach((input)=>{
        input.addEventListener("change", (event)=>{
            const target = event.target;
            if (target.checked) {
                const secondaryPricingOption = target.value;
                (0, _registrationState.saveState)({
                    secondaryPricingOption
                });
                console.log(`Secondary pricing option selected: ${secondaryPricingOption}`);
                // Update the secondary total amount when a different option is selected
                (0, _updateSecondaryTotalAmount.updateSecondaryTotalAmount)(secondaryPricingOption);
            }
        });
    });
};

},{"@xatom/core":"j9zXV","../state/registrationState":"jIQ60","./updateSecondaryTotalAmount":"gVZQe","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"gVZQe":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateSecondaryTotalAmount", ()=>updateSecondaryTotalAmount);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _formatting = require("../utils/formatting");
const updateSecondaryTotalAmount = (secondaryPricingOption)=>{
    const state = (0, _registrationState.loadState)();
    const totalAmountElement = new (0, _core.WFComponent)("#secondaryTotalAmount");
    const secondaryOriginalAmountElement = new (0, _core.WFComponent)("#secondaryOriginalAmount");
    const secondaryDiscountPill = new (0, _core.WFComponent)("#secondaryDiscountPill");
    const secondaryDiscountNumber = new (0, _core.WFComponent)("#secondaryDiscountNumber");
    let totalAmount;
    let originalAmount;
    let amountType = "";
    switch(secondaryPricingOption){
        case "Annual":
            originalAmount = state.checkoutPreview?.annual_amount_due;
            amountType = "Per Year";
            break;
        case "Monthly":
            originalAmount = state.checkoutPreview?.monthly_amount_due;
            amountType = "Per Month";
            break;
        case "Pay-Per-Semester":
            originalAmount = state.checkoutPreview?.semester_amount_due;
            amountType = "Per Semester";
            break;
        default:
            console.warn("Unknown secondary pricing option:", secondaryPricingOption);
    }
    if (state.selected_discount && state.selectedPricingOption === "Deposit") {
        const discountValue = parseFloat(state.selected_discount);
        totalAmount = originalAmount ? originalAmount * (1 - discountValue / 100) : 0;
        secondaryDiscountPill.setStyle({
            display: "block"
        });
        secondaryDiscountNumber.setText(`${discountValue}%`);
        secondaryOriginalAmountElement.setText(`was ${(0, _formatting.formatCurrency)(originalAmount)} ${amountType}`);
        secondaryOriginalAmountElement.setStyle({
            display: "block"
        });
    } else {
        totalAmount = originalAmount;
        secondaryDiscountPill.setStyle({
            display: "none"
        });
        secondaryOriginalAmountElement.setStyle({
            display: "none"
        });
    }
    if (totalAmount !== undefined) totalAmountElement.setText(`${(0, _formatting.formatCurrency)(totalAmount)} ${amountType}`);
    else totalAmountElement.setText(`$0.00 ${amountType}`);
};

},{"@xatom/core":"j9zXV","../state/registrationState":"jIQ60","../utils/formatting":"iRhp7","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"8HFcq":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeFinancialAid", ()=>initializeFinancialAid);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _updateTotalAmount = require("./updateTotalAmount");
var _updateSecondaryTotalAmount = require("./updateSecondaryTotalAmount");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
const initializeFinancialAid = ()=>{
    const financialAidCheckbox = new (0, _core.WFComponent)("#requestFinAid");
    const financialAidDialog = new (0, _core.WFComponent)("#finaidForm");
    // Show dialog when checkbox is checked
    financialAidCheckbox.on("change", ()=>{
        const checkboxElement = financialAidCheckbox.getElement();
        const state = (0, _registrationState.loadState)(); // Load the state here
        if (checkboxElement.checked) financialAidDialog.getElement().showModal();
        else {
            // Reset financial aid-related state
            (0, _registrationState.saveState)({
                fin_aid_requested: false,
                selected_discount: undefined
            });
            // Update totals to reset to original values
            if (state.selectedPricingOption === "Deposit") (0, _updateSecondaryTotalAmount.updateSecondaryTotalAmount)(state.secondaryPricingOption);
            else (0, _updateTotalAmount.updateTotalAmount)();
        }
    });
    // Close dialog event to uncheck checkbox if no discount is applied
    financialAidDialog.getElement()?.addEventListener("close", ()=>{
        const state = (0, _registrationState.loadState)();
        if (!state.selected_discount) financialAidCheckbox.getElement().checked = false;
    });
    // Form validation
    setupFinancialAidFormValidation();
    // Handle form submission
    const submitButton = new (0, _core.WFComponent)("#submitfinancialAid");
    submitButton.on("click", ()=>{
        if (validateFinancialAidForm()) {
            saveFinancialAidData();
            (0, _registrationState.saveState)({
                fin_aid_requested: true
            });
            showSuccessState();
        }
    });
    // Attach close dialog function to close button and outside click
    attachCloseDialogHandler(financialAidDialog);
    // Format currency in real-time as the user types
    const annualIncomeInput = new (0, _core.WFComponent)("#annualIncome");
    const monthlyExpenseInput = new (0, _core.WFComponent)("#monthlyExpense");
    const formatAndSetInputValue = (component)=>{
        const inputElement = component.getElement();
        let value = inputElement.value.replace(/[^\d.-]/g, ""); // Remove non-numeric characters except for digits, dots, and dashes
        // Save the cursor position before formatting
        let cursorPosition = inputElement.selectionStart || 0;
        // Calculate the number of commas before formatting
        const commaCountBefore = (inputElement.value.slice(0, cursorPosition).match(/,/g) || []).length;
        // Handle the case where the user might enter multiple decimal points
        if (value.includes(".")) {
            const [integerPart, decimalPart] = value.split(".");
            value = `${integerPart}.${decimalPart.slice(0, 2)}`;
        }
        // Format the number
        const formattedValue = formatNumber(value);
        inputElement.value = formattedValue;
        // Calculate the number of commas after formatting
        const commaCountAfter = (inputElement.value.slice(0, cursorPosition).match(/,/g) || []).length;
        // Adjust cursor position based on the difference in comma count
        cursorPosition += commaCountAfter - commaCountBefore;
        // Ensure cursor position does not exceed the input length
        if (cursorPosition > formattedValue.length) cursorPosition = formattedValue.length;
        // Set the cursor position back to the calculated position
        inputElement.setSelectionRange(cursorPosition, cursorPosition);
    };
    const formatNumber = (value)=>{
        const number = parseFloat(value.replace(/,/g, ""));
        if (isNaN(number)) return value;
        return number.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };
    annualIncomeInput.on("input", ()=>formatAndSetInputValue(annualIncomeInput));
    monthlyExpenseInput.on("input", ()=>formatAndSetInputValue(monthlyExpenseInput));
};
// Function to close the financial aid dialog
const closeFinancialAidDialog = (dialog)=>{
    dialog.getElement().close();
};
// Function to attach close dialog handler
const attachCloseDialogHandler = (dialog)=>{
    const closeButton = new (0, _core.WFComponent)("#close-dialog-btn");
    closeButton.on("click", ()=>closeFinancialAidDialog(dialog));
    dialog.getElement()?.addEventListener("click", (event)=>{
        const rect = dialog.getElement().getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeFinancialAidDialog(dialog);
    });
};
// Function to validate the financial aid form
const setupFinancialAidFormValidation = ()=>{
    const relationshipInput = new (0, _core.WFComponent)("#finaidRelationship");
    const relationshipError = new (0, _core.WFComponent)("#finaidRelationshipError");
    const previousParticipantInputs = document.getElementsByName("previous_participant");
    const previousParticipantError = new (0, _core.WFComponent)("#previousParticipantError");
    const annualIncomeInput = new (0, _core.WFComponent)("#annualIncome");
    const annualIncomeError = new (0, _core.WFComponent)("#annualIncomeError");
    const monthlyExpenseInput = new (0, _core.WFComponent)("#monthlyExpense");
    const monthlyExpenseError = new (0, _core.WFComponent)("#monthlyExpenseError");
    (0, _formUtils.setupValidation)(relationshipInput, relationshipError, ()=>(0, _validationUtils.validateSelectField)(getComponentValue(relationshipInput)) ? "" : "Please select a relationship.");
    (0, _formUtils.setupValidation)(annualIncomeInput, annualIncomeError, ()=>(0, _validationUtils.validateNotEmpty)(getComponentValue(annualIncomeInput)) ? "" : "Please enter your annual household income.");
    (0, _formUtils.setupValidation)(monthlyExpenseInput, monthlyExpenseError, ()=>(0, _validationUtils.validateNotEmpty)(getComponentValue(monthlyExpenseInput)) ? "" : "Please enter your monthly expenditure.");
    Array.from(previousParticipantInputs).forEach((input)=>{
        (0, _formUtils.setupValidation)(new (0, _core.WFComponent)(input), previousParticipantError, ()=>{
            const selected = Array.from(previousParticipantInputs).some((radio)=>radio.checked);
            return selected ? "" : "Please select an option.";
        });
    });
};
// Function to validate the financial aid form on submit
const validateFinancialAidForm = ()=>{
    const relationshipInput = new (0, _core.WFComponent)("#finaidRelationship");
    const annualIncomeInput = new (0, _core.WFComponent)("#annualIncome");
    const monthlyExpenseInput = new (0, _core.WFComponent)("#monthlyExpense");
    const previousParticipantInputs = document.getElementsByName("previous_participant");
    const isRelationshipValid = (0, _validationUtils.validateSelectField)(getComponentValue(relationshipInput));
    (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#finaidRelationshipError"), "Please select a relationship.", !isRelationshipValid);
    const isAnnualIncomeValid = (0, _validationUtils.validateNotEmpty)(getComponentValue(annualIncomeInput));
    (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#annualIncomeError"), "Please enter your annual household income.", !isAnnualIncomeValid);
    const isMonthlyExpenseValid = (0, _validationUtils.validateNotEmpty)(getComponentValue(monthlyExpenseInput));
    (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#monthlyExpenseError"), "Please enter your monthly expenditure.", !isMonthlyExpenseValid);
    const isPreviousParticipantValid = Array.from(previousParticipantInputs).some((radio)=>radio.checked);
    (0, _formUtils.toggleError)(new (0, _core.WFComponent)("#previousParticipantError"), "Please select an option.", !isPreviousParticipantValid);
    return isRelationshipValid && isAnnualIncomeValid && isMonthlyExpenseValid && isPreviousParticipantValid;
};
// Function to save financial aid data to state
const saveFinancialAidData = ()=>{
    const relationshipComponent = new (0, _core.WFComponent)("#finaidRelationship");
    const relationshipElement = relationshipComponent.getElement();
    const relationship = relationshipElement.value;
    const annualIncomeComponent = new (0, _core.WFComponent)("#annualIncome");
    const annualIncomeElement = annualIncomeComponent.getElement();
    const annualIncome = annualIncomeElement.value;
    const monthlyExpenseComponent = new (0, _core.WFComponent)("#monthlyExpense");
    const monthlyExpenseElement = monthlyExpenseComponent.getElement();
    const monthlyExpense = monthlyExpenseElement.value;
    const previousParticipantInput = document.querySelector("input[name='previous_participant']:checked");
    const previousParticipant = previousParticipantInput ? previousParticipantInput.value : "";
    (0, _registrationState.saveState)({
        fin_aid_requested: true,
        financialAidData: {
            relationship,
            annualIncome,
            monthlyExpense,
            previousParticipant
        }
    });
    console.log("Financial aid data saved:", {
        relationship,
        annualIncome,
        monthlyExpense,
        previousParticipant
    });
};
// Function to display success state and discount selection
const showSuccessState = ()=>{
    const successMessage = new (0, _core.WFComponent)(".success-message");
    const form = new (0, _core.WFComponent)("#wf-form-Finaid-Form");
    form.setStyle({
        display: "none"
    });
    successMessage.setStyle({
        display: "block"
    });
    const applyDiscountButton = new (0, _core.WFComponent)("#applyDiscount");
    const backFinAidButton = new (0, _core.WFComponent)("#backFinAid");
    const financialAidDialog = new (0, _core.WFComponent)("#finaidForm");
    applyDiscountButton.on("click", ()=>{
        const selectedDiscount = document.querySelector("input[name='discountValue']:checked");
        if (selectedDiscount) {
            const discountValue = selectedDiscount.value;
            const state = (0, _registrationState.loadState)();
            (0, _registrationState.saveState)({
                selected_discount: discountValue
            });
            if (state.selectedPricingOption === "Deposit") // Apply discount to secondary total amount
            (0, _updateSecondaryTotalAmount.updateSecondaryTotalAmount)(state.secondaryPricingOption);
            else // Apply discount to primary total amount
            (0, _updateTotalAmount.updateTotalAmount)();
            console.log(`Discount applied: ${discountValue}%`);
            // Close the dialog
            closeFinancialAidDialog(financialAidDialog);
        } else console.warn("No discount selected.");
    });
    backFinAidButton.on("click", ()=>{
        successMessage.setStyle({
            display: "none"
        });
        form.setStyle({
            display: "flex"
        });
    });
};
// Helper function to get the value of a component
const getComponentValue = (component)=>{
    const element = component.getElement();
    return element.value;
};

},{"@xatom/core":"j9zXV","../state/registrationState":"jIQ60","./updateTotalAmount":"73URz","./updateSecondaryTotalAmount":"gVZQe","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"8jLLI":[function(require,module,exports) {
// sidebarIndicators.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSidebarIndicators", ()=>initializeSidebarIndicators);
parcelHelpers.export(exports, "setActiveStep", ()=>setActiveStep);
parcelHelpers.export(exports, "unsetActiveStep", ()=>unsetActiveStep);
parcelHelpers.export(exports, "markStepAsCompleted", ()=>markStepAsCompleted);
parcelHelpers.export(exports, "unmarkStepAsCompleted", ()=>unmarkStepAsCompleted);
var _core = require("@xatom/core");
var _authConfig = require("../../../auth/authConfig");
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
        4: "sidebarStepFour",
        5: "sidebarStepFive"
    };
    return stepMap[stepNumber] || `sidebarStep${stepNumber}`;
};

},{"@xatom/core":"j9zXV","../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"cywSa":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "displayActionRequiredDialog", ()=>displayActionRequiredDialog);
parcelHelpers.export(exports, "checkForStudents", ()=>checkForStudents);
var _core = require("@xatom/core");
var _students = require("../../../api/students");
const displayActionRequiredDialog = ()=>{
    const actionRequiredDialog = new (0, _core.WFComponent)("#actionRequiredDialog");
    const alertDialogAnimationTrigger = new (0, _core.WFComponent)("#alertDialogAnimationTrigger");
    const pageMainElement = document.querySelector(".page_main");
    // Show the dialog
    actionRequiredDialog.getElement().showModal();
    // Trigger any necessary animations
    alertDialogAnimationTrigger.getElement().click();
    // Set the data-brand attribute of .page_main to 5
    if (pageMainElement) pageMainElement.setAttribute("data-brand", "5");
    // Prevent closing the dialog
    actionRequiredDialog.getElement().addEventListener("cancel", (event)=>{
        event.preventDefault();
    });
    actionRequiredDialog.getElement().addEventListener("close", (event)=>{
        event.preventDefault();
    });
    // Prevent closing the dialog with the escape key
    const preventEscapeClose = (event)=>{
        if (event.key === "Escape") event.preventDefault();
    };
    document.addEventListener("keydown", preventEscapeClose);
};
const checkForStudents = async ()=>{
    try {
        const { students, showDialog } = await (0, _students.fetchStudentProfiles)();
        if (showDialog) displayActionRequiredDialog();
    // Handle students data as needed
    // For example, save to state, display, etc.
    } catch (error) {
        console.error("Error during registration initialization:", error);
    }
};

},{"@xatom/core":"j9zXV","../../../api/students":"5X7sO","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2IiT3":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStateFromUrlParams", ()=>initializeStateFromUrlParams);
var _selectedWorkshop = require("../state/selectedWorkshop");
var _programList = require("../../registration/programList");
var _workshopList = require("../../registration/workshopList");
var _sessionsList = require("../../registration/sessionsList");
var _sidebarIndicators = require("../../registration/components/sidebarIndicators");
var _core = require("@xatom/core"); // Import WFComponent
// Function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const programId = params.get("program");
    const workshopId = params.get("workshop");
    return {
        programId,
        workshopId
    };
};
const initializeStateFromUrlParams = async (slider)=>{
    const { programId, workshopId } = getUrlParams();
    (0, _sidebarIndicators.initializeSidebarIndicators)(); // Initialize sidebar indicators
    const loadingWall = new (0, _core.WFComponent)(".loading_wall");
    const animationDuration = 500; // Duration in milliseconds matching the CSS transition time
    if (programId || workshopId) {
        // Show the loading wall
        loadingWall.setStyle({
            display: "flex"
        });
        try {
            // Initialize the program list
            await (0, _programList.initializeProgramList)();
            if (programId) {
                // Select the program based on the URL parameter
                const programComponent = document.querySelector(`input[value="${programId}"]`);
                if (programComponent) {
                    programComponent.checked = true;
                    programComponent.dispatchEvent(new Event("change"));
                    (0, _sidebarIndicators.markStepAsCompleted)(1);
                    (0, _sidebarIndicators.setActiveStep)(2);
                    // Initialize the workshop list for the selected program
                    await (0, _workshopList.initializeWorkshopList)(programId);
                    if (workshopId && workshopId === "none") {
                        // Skip workshop selection and navigate to session list initialization
                        (0, _selectedWorkshop.resetSelectedWorkshop)();
                        (0, _sidebarIndicators.markStepAsCompleted)(2);
                        (0, _sidebarIndicators.setActiveStep)(3);
                        await (0, _sessionsList.initializeSessionList)(null, programId);
                        slider.goToIndex(2); // Navigate to the session selection slide
                    } else if (workshopId) {
                        // Select the workshop based on the URL parameter
                        const workshopComponent = document.querySelector(`input[value="${workshopId}"]`);
                        if (workshopComponent) {
                            workshopComponent.checked = true;
                            workshopComponent.dispatchEvent(new Event("change"));
                            (0, _sidebarIndicators.markStepAsCompleted)(2);
                            (0, _sidebarIndicators.setActiveStep)(3);
                            // Initialize the session list for the selected workshop
                            await (0, _sessionsList.initializeSessionList)(workshopId, programId);
                            slider.goToIndex(2); // Navigate to the session selection slide
                        } else {
                            console.error(`Workshop with ID ${workshopId} not found`);
                            slider.goToIndex(1); // Navigate to the workshop selection slide
                        }
                    } else {
                        (0, _selectedWorkshop.resetSelectedWorkshop)();
                        slider.goToIndex(1); // Navigate to the workshop selection slide
                    }
                } else {
                    console.error(`Program with ID ${programId} not found`);
                    slider.goToIndex(0); // Navigate to the program selection slide
                }
            } else slider.goToIndex(0); // Navigate to the first slide if no program selected
        } catch (error) {
            console.error("Error initializing state from URL parameters:", error);
            slider.goToIndex(0); // Navigate to the program selection slide on error
        } finally{
            // Hide the loading wall after completing all initializations
            loadingWall.addCssClass("hidden");
            setTimeout(()=>loadingWall.setStyle({
                    display: "none"
                }), animationDuration);
        }
    }
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","../../registration/programList":"bA83c","../../registration/workshopList":"dZi8x","../../registration/sessionsList":"2dV61","../../registration/components/sidebarIndicators":"8jLLI","@xatom/core":"j9zXV","../state/selectedWorkshop":"BqVJq"}]},[], null, "parcelRequired346")

//# sourceMappingURL=programRegistration.ab0c3a6b.js.map
