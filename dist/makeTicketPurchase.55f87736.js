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
})({"4dv3U":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeTicketPurchase", ()=>makeTicketPurchase);
var _core = require("@xatom/core");
var _productionList = require("./productionList");
var _performanceList = require("./performanceList");
var _ticketTiers = require("./ticketTiers");
var _ticketPurchaseState = require("./state/ticketPurchaseState");
var _slider = require("@xatom/slider");
var _sidebarIndicators = require("./components/sidebarIndicators");
var _validationUtils = require("../../utils/validationUtils");
var _formUtils = require("../../utils/formUtils");
var _apiConfig = require("../../api/apiConfig");
var _urlParamNavigator = require("./components/urlParamNavigator");
const makeTicketPurchase = async ()=>{
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    // Initialize state from URL parameters
    await (0, _urlParamNavigator.initializeStateFromUrlParams)(slider);
    // Initialize sidebar indicators
    (0, _sidebarIndicators.initializeTicketSidebarIndicators)();
    // Step 1: Initialize production list
    await (0, _productionList.initializeProductionList)("#selectProductionList");
    // Handle form submission for production selection
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        const selectedProduction = (0, _ticketPurchaseState.getSelectedProduction)();
        const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
        if (!selectedProduction || !selectedProduction.id) {
            console.error("No production selected.");
            const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
            submitStepOneError.setText("Please select a production.");
            submitStepOneError.setStyle({
                display: "block"
            });
            return;
        }
        console.log("Production selected:", selectedProduction);
        const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
        submitStepOneError.setStyle({
            display: "none"
        });
        // Show the loading animation
        stepOneRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Proceed to Step 2: Initialize performance list
            await (0, _performanceList.initializePerformanceList)("#selectPerformanceList");
            // Mark Step 1 as completed and move to Step 2
            (0, _sidebarIndicators.markTicketStepAsCompleted)(1);
            (0, _sidebarIndicators.setActiveTicketStep)(2);
            // Move to the next step
            slider.goNext();
        } catch (error) {
            console.error("Error during step 1 processing:", error);
        } finally{
            // Hide the loading animation
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    // Step 2: Handle form submission for performance selection
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        const selectedPerformance = (0, _ticketPurchaseState.getSelectedPerformance)();
        const stepTwoRequestingAnimation = new (0, _core.WFComponent)("#stepTwoRequestingAnimation");
        if (!selectedPerformance || !selectedPerformance.id) {
            console.error("No performance selected.");
            const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
            submitStepTwoError.setText("Please select a performance.");
            submitStepTwoError.setStyle({
                display: "block"
            });
            return;
        }
        console.log("Performance selected:", selectedPerformance);
        const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
        submitStepTwoError.setStyle({
            display: "none"
        });
        // Show the loading animation
        stepTwoRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Mark Step 2 as completed and move to Step 3
            (0, _sidebarIndicators.markTicketStepAsCompleted)(2);
            (0, _sidebarIndicators.setActiveTicketStep)(3);
            // Initialize ticket tiers (Step 3)
            await (0, _ticketTiers.initializeTicketTiers)("#bundleList", "#ticketTierList");
            // Move to the next step
            slider.goNext();
        } catch (error) {
            console.error("Error during step 2 processing:", error);
        } finally{
            // Hide the loading animation
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    // Step 3: Handle form submission for final checkout
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    const emailWrap = new (0, _core.WFComponent)("#emailWrap");
    const firstNameInput = new (0, _core.WFComponent)("#firstNameInput");
    const lastNameInput = new (0, _core.WFComponent)("#lastNameInput");
    const emailInput = new (0, _core.WFComponent)("#emailInput");
    const customQuestionInput = new (0, _core.WFComponent)("#customQuestionInput");
    const submitStepThreeError = new (0, _core.WFComponent)("#submitStepThreeError");
    const noTicketsError = new (0, _core.WFComponent)("#noTicketsError");
    // Function to clear errors on interaction
    const clearErrorOnInteraction = (inputComponent, errorComponent)=>{
        const clearError = ()=>(0, _formUtils.toggleError)(errorComponent, "", false);
        inputComponent.on("input", clearError);
        inputComponent.on("focus", clearError);
        inputComponent.on("change", clearError);
    };
    formStepThree.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        let formIsValid = true;
        // clear any existing submit errors
        submitStepThreeError.setStyle({
            display: "none"
        });
        // Validate email wrap section if displayed
        if (emailWrap.getElement().style.display !== "none") {
            // Validate First Name
            const firstNameError = new (0, _core.WFComponent)("#firstNameInputError");
            const firstNameValidation = (0, _formUtils.createValidationFunction)(firstNameInput, (0, _validationUtils.validateNotEmpty), "First name is required.");
            const firstNameValidationResult = firstNameValidation();
            (0, _formUtils.toggleError)(firstNameError, firstNameValidationResult, !!firstNameValidationResult);
            formIsValid = formIsValid && !firstNameValidationResult;
            clearErrorOnInteraction(firstNameInput, firstNameError);
            // Validate Last Name
            const lastNameError = new (0, _core.WFComponent)("#lastNameInputError");
            const lastNameValidation = (0, _formUtils.createValidationFunction)(lastNameInput, (0, _validationUtils.validateNotEmpty), "Last name is required.");
            const lastNameValidationResult = lastNameValidation();
            (0, _formUtils.toggleError)(lastNameError, lastNameValidationResult, !!lastNameValidationResult);
            formIsValid = formIsValid && !lastNameValidationResult;
            clearErrorOnInteraction(lastNameInput, lastNameError);
            // Validate Email
            const emailError = new (0, _core.WFComponent)("#emailInputError");
            const emailValidation = (0, _formUtils.createValidationFunction)(emailInput, (0, _validationUtils.validateEmail), "A valid email is required.");
            const emailValidationResult = emailValidation();
            (0, _formUtils.toggleError)(emailError, emailValidationResult, !!emailValidationResult);
            formIsValid = formIsValid && !emailValidationResult;
            clearErrorOnInteraction(emailInput, emailError);
        }
        // Validate Custom Question
        const customQuestionError = new (0, _core.WFComponent)("#customQuestionInputError");
        const customQuestionValidation = (0, _formUtils.createValidationFunction)(customQuestionInput, (0, _validationUtils.validateNotEmpty), "This field is required.");
        const customQuestionValidationResult = customQuestionValidation();
        (0, _formUtils.toggleError)(customQuestionError, customQuestionValidationResult, !!customQuestionValidationResult);
        formIsValid = formIsValid && !customQuestionValidationResult;
        clearErrorOnInteraction(customQuestionInput, customQuestionError);
        // Validate that at least one bundle or ticket is selected
        const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
        const selectedTickets = (0, _ticketPurchaseState.getSelectedTickets)();
        if (selectedBundles.length === 0 && selectedTickets.length === 0) {
            (0, _formUtils.toggleError)(noTicketsError, "Please select at least one bundle or ticket.", true);
            formIsValid = false;
        } else (0, _formUtils.toggleError)(noTicketsError, "", false);
        if (!formIsValid) {
            console.error("Form validation failed.");
            submitStepThreeError.setText("Please correct the highlighted errors.");
            submitStepThreeError.setStyle({
                display: "block"
            });
            return;
        }
        console.log("Final form is valid, proceeding with submission...");
        const stepThreeRequestingAnimation = new (0, _core.WFComponent)("#stepThreeRequestingAnimation");
        stepThreeRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Load the current state
            const ticketPurchaseState = (0, _ticketPurchaseState.loadTicketPurchaseState)();
            // Extract only the required values from the state
            const { selectedBundles, selectedTickets, email, firstName, lastName, customQuestion, assistanceNeeded, assistanceMessage, selectedProductionId, selectedPerformanceId } = ticketPurchaseState;
            // Construct the cancel_url
            const cancelUrl = `${window.location.origin}/purchase-tickets?production=${selectedProductionId}&performance=${selectedPerformanceId}`;
            // Create the payload with only the required values and the cancel_url
            const payload = {
                selectedBundles,
                selectedTickets,
                email,
                firstName,
                lastName,
                customQuestion,
                assistanceNeeded,
                assistanceMessage,
                selectedProductionId,
                selectedPerformanceId,
                cancel_url: cancelUrl
            };
            // Submit the extracted state to the /tickets/begin_checkout endpoint
            const response = await (0, _apiConfig.apiClient).post("/tickets/begin_checkout", {
                data: payload
            }).fetch();
            // Handle the response (e.g., redirect to the payment page or show success message)
            console.log("Checkout response:", response);
            // Mark Step 3 as completed
            (0, _sidebarIndicators.markTicketStepAsCompleted)(3);
            // Redirect or show success (this depends on your application flow)
            window.location.href = response.checkout_url || "/payment";
        } catch (error) {
            console.error("Error during final step processing:", error);
            submitStepThreeError.setText("An error occurred during checkout. Please try again.");
            submitStepThreeError.setStyle({
                display: "block"
            });
        } finally{
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
        }
    });
    // Handle "Go Back" button for Step 3
    const backStepThree = new (0, _core.WFComponent)("#backStepThree");
    backStepThree.on("click", ()=>{
        (0, _ticketPurchaseState.clearSelectedBundles)();
        (0, _ticketPurchaseState.clearSelectedTickets)();
        slider.goPrevious();
        (0, _sidebarIndicators.unsetActiveTicketStep)(3);
        (0, _sidebarIndicators.unmarkTicketStepAsCompleted)(2);
        (0, _sidebarIndicators.setActiveTicketStep)(2);
    });
    // Handle "Go Back" button for Step 2
    const backStepTwo = new (0, _core.WFComponent)("#backStepTwo");
    backStepTwo.on("click", ()=>{
        (0, _ticketPurchaseState.clearSelectedPerformance)();
        slider.goPrevious();
        (0, _sidebarIndicators.unsetActiveTicketStep)(2);
        (0, _sidebarIndicators.unmarkTicketStepAsCompleted)(1);
        (0, _sidebarIndicators.setActiveTicketStep)(1);
    });
    // Initialize sidebar indicators and set the first step as active
    (0, _sidebarIndicators.setActiveTicketStep)(1);
};

},{"@xatom/core":"j9zXV","./productionList":"4B4yP","./performanceList":"dsUEJ","./ticketTiers":"dhBzw","./state/ticketPurchaseState":"7W2vK","@xatom/slider":"2zMuG","./components/sidebarIndicators":"2VBNk","../../utils/validationUtils":"dMBjH","../../utils/formUtils":"hvg7i","../../api/apiConfig":"2Lx0S","./components/urlParamNavigator":"dKoGX","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"4B4yP":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeProductionList", ()=>initializeProductionList);
var _core = require("@xatom/core");
var _productions = require("../../api/productions");
var _ticketPurchaseState = require("./state/ticketPurchaseState");
let selectedProductionId = null;
let initialTemplateState = null;
const initializeProductionList = async (containerSelector)=>{
    // Update return type to Promise<Production[]>
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Production list container not found.");
        return [];
    }
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectProduction",
        loaderSelector: "#productionListLoading",
        emptySelector: "#productionListEmpty"
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
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const productionCard = new (0, _core.WFComponent)(rowElement);
        const productionTitle = productionCard.getChildAsComponent("#cardProductionTitle");
        const productionDescription = productionCard.getChildAsComponent("#cardProductionDescription");
        const productionAges = productionCard.getChildAsComponent("#cardProductionAges");
        const productionImage = productionCard.getChildAsComponent("#cardProductionImage");
        const productionInput = productionCard.getChildAsComponent(".input_card_input");
        const productionLabel = productionCard.getChildAsComponent("label");
        if (!productionTitle || !productionDescription || !productionAges || !productionInput || !productionImage || !productionLabel) {
            console.error("Production elements not found.");
            return;
        }
        if (rowData && rowData.fieldData) {
            const inputId = `productionInput-${index}`;
            productionInput.setAttribute("id", inputId);
            productionInput.setAttribute("value", rowData.id);
            productionLabel.setAttribute("for", inputId);
            productionTitle.setText(rowData.fieldData.name);
            productionDescription.setText(rowData.fieldData["short-description"]);
            productionAges.setText(rowData.fieldData["age-description"]);
            if (rowData.fieldData["main-image"]?.url) {
                productionImage.setAttribute("src", rowData.fieldData["main-image"].url);
                productionImage.setAttribute("alt", rowData.fieldData["main-image"].alt || "Production Image");
            } else console.warn(`Production ID ${rowData.id} does not have a main image.`);
            productionInput.on("change", ()=>{
                selectedProductionId = productionInput.getElement().value;
                (0, _ticketPurchaseState.saveSelectedProduction)({
                    id: rowData.id,
                    name: rowData.fieldData.name,
                    description: rowData.fieldData["short-description"],
                    imageUrl: rowData.fieldData["main-image"].url
                });
                console.log("Selected Production ID:", selectedProductionId);
            });
            rowElement.setStyle({
                display: "flex"
            });
        } else console.error("Incomplete production data:", rowData);
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        const productions = await (0, _productions.fetchProductions)();
        console.log("Fetched productions:", productions);
        if (productions.length > 0) list.setData(productions);
        else list.setData([]); // Trigger the empty state
        list.changeLoadingStatus(false);
        return productions; // Return the list of productions
    } catch (error) {
        console.error("Error loading productions:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
        return []; // Return an empty array in case of error
    }
};

},{"@xatom/core":"j9zXV","../../api/productions":"3RQpX","./state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"3RQpX":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchProductions", ()=>fetchProductions);
var _apiConfig = require("./apiConfig");
const fetchProductions = async ()=>{
    try {
        const response = await (0, _apiConfig.apiClient).get("/tickets/productions").fetch();
        return response.productions;
    } catch (error) {
        console.error("Error fetching productions:", error);
        throw error;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7W2vK":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadTicketPurchaseState", ()=>loadTicketPurchaseState);
parcelHelpers.export(exports, "saveTicketPurchaseState", ()=>saveTicketPurchaseState);
parcelHelpers.export(exports, "clearTicketPurchaseState", ()=>clearTicketPurchaseState);
parcelHelpers.export(exports, "getSelectedProduction", ()=>getSelectedProduction);
parcelHelpers.export(exports, "saveSelectedProduction", ()=>saveSelectedProduction);
parcelHelpers.export(exports, "getSelectedPerformance", ()=>getSelectedPerformance);
parcelHelpers.export(exports, "saveSelectedPerformance", ()=>saveSelectedPerformance);
parcelHelpers.export(exports, "getSelectedBundles", ()=>getSelectedBundles);
parcelHelpers.export(exports, "saveSelectedBundle", ()=>saveSelectedBundle);
parcelHelpers.export(exports, "removeSelectedBundle", ()=>removeSelectedBundle);
parcelHelpers.export(exports, "removeBundleRequiredTicketsIfNeeded", ()=>removeBundleRequiredTicketsIfNeeded);
parcelHelpers.export(exports, "getSelectedTickets", ()=>getSelectedTickets);
parcelHelpers.export(exports, "saveSelectedTicket", ()=>saveSelectedTicket);
parcelHelpers.export(exports, "removeSelectedTicket", ()=>removeSelectedTicket);
parcelHelpers.export(exports, "getCustomQuestion", ()=>getCustomQuestion);
parcelHelpers.export(exports, "saveCustomQuestion", ()=>saveCustomQuestion);
parcelHelpers.export(exports, "getAssistanceNeeded", ()=>getAssistanceNeeded);
parcelHelpers.export(exports, "saveAssistanceNeeded", ()=>saveAssistanceNeeded);
parcelHelpers.export(exports, "getAssistanceMessage", ()=>getAssistanceMessage);
parcelHelpers.export(exports, "saveAssistanceMessage", ()=>saveAssistanceMessage);
parcelHelpers.export(exports, "saveUserDetails", ()=>saveUserDetails);
parcelHelpers.export(exports, "clearSelectedPerformance", ()=>clearSelectedPerformance);
parcelHelpers.export(exports, "clearSelectedBundles", ()=>clearSelectedBundles);
parcelHelpers.export(exports, "clearSelectedTickets", ()=>clearSelectedTickets);
const TICKET_PURCHASE_STATE_KEY = "ticketPurchaseState";
// Utility function to safely convert unknown types to number
const safeNumber = (value)=>typeof value === "number" ? value : 0;
const loadTicketPurchaseState = ()=>{
    const savedState = localStorage.getItem(TICKET_PURCHASE_STATE_KEY);
    return savedState ? JSON.parse(savedState) : {};
};
const saveTicketPurchaseState = (state)=>{
    const currentState = loadTicketPurchaseState();
    const newState = {
        ...currentState,
        ...state
    };
    localStorage.setItem(TICKET_PURCHASE_STATE_KEY, JSON.stringify(newState));
};
const clearTicketPurchaseState = ()=>{
    localStorage.removeItem(TICKET_PURCHASE_STATE_KEY);
};
const getSelectedProduction = ()=>{
    const state = loadTicketPurchaseState();
    return {
        id: state.selectedProductionId || null,
        name: state.selectedProductionName || null,
        description: state.selectedProductionDescription || null,
        imageUrl: state.selectedProductionImageUrl || null
    };
};
const saveSelectedProduction = (production)=>{
    saveTicketPurchaseState({
        selectedProductionId: production.id,
        selectedProductionName: production.name,
        selectedProductionDescription: production.description,
        selectedProductionImageUrl: production.imageUrl
    });
};
const getSelectedPerformance = ()=>{
    const state = loadTicketPurchaseState();
    return {
        id: state.selectedPerformanceId || null,
        name: state.selectedPerformanceName || null,
        dateTime: state.selectedPerformanceDateTime || null,
        imageUrl: state.selectedPerformanceImageUrl || null,
        location: state.selectedPerformanceLocation || null
    };
};
const saveSelectedPerformance = (performance)=>{
    saveTicketPurchaseState({
        selectedPerformanceId: performance.id,
        selectedPerformanceName: performance.name,
        selectedPerformanceDateTime: performance.dateTime,
        selectedPerformanceDescription: performance.description,
        selectedPerformanceImageUrl: performance.imageUrl,
        selectedPerformanceLocation: performance.location
    });
};
const getSelectedBundles = ()=>{
    const state = loadTicketPurchaseState();
    return state.selectedBundles || [];
};
const saveSelectedBundle = (bundleId, quantity)=>{
    const bundles = getSelectedBundles();
    const existingBundle = bundles.find((b)=>b.bundle_id === bundleId);
    if (existingBundle) {
        if (quantity > 0) existingBundle.quantity = quantity;
        else {
            // Remove bundle if quantity is 0
            const index = bundles.indexOf(existingBundle);
            bundles.splice(index, 1);
        }
    } else if (quantity > 0) bundles.push({
        bundle_id: bundleId,
        quantity
    });
    saveTicketPurchaseState({
        selectedBundles: bundles
    });
};
const removeSelectedBundle = (bundleId)=>{
    const bundles = getSelectedBundles();
    const updatedBundles = bundles.filter((b)=>b.bundle_id !== bundleId);
    saveTicketPurchaseState({
        selectedBundles: updatedBundles
    });
    // After removing a bundle, check if any bundle is selected and remove "bundle_required" tickets if none are selected
    removeBundleRequiredTicketsIfNeeded();
};
const removeBundleRequiredTicketsIfNeeded = ()=>{
    const bundles = getSelectedBundles();
    const totalBundlesSelected = bundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
    if (totalBundlesSelected <= 0) {
        const tickets = getSelectedTickets();
        const updatedTickets = tickets.filter((t)=>!t.bundle_required);
        saveTicketPurchaseState({
            selectedTickets: updatedTickets
        });
    }
};
const getSelectedTickets = ()=>{
    const state = loadTicketPurchaseState();
    return state.selectedTickets || [];
};
const saveSelectedTicket = (ticket_tier_id, quantity, bundle_required)=>{
    const tickets = getSelectedTickets();
    const existingTicket = tickets.find((t)=>t.ticket_tier_id === ticket_tier_id);
    if (existingTicket) {
        if (quantity > 0) existingTicket.quantity = quantity;
        else {
            // Remove ticket if quantity is 0
            const index = tickets.indexOf(existingTicket);
            tickets.splice(index, 1);
        }
    } else if (quantity > 0) tickets.push({
        ticket_tier_id,
        quantity,
        bundle_required
    });
    saveTicketPurchaseState({
        selectedTickets: tickets
    });
};
const removeSelectedTicket = (ticket_tier_id)=>{
    const tickets = getSelectedTickets();
    const updatedTickets = tickets.filter((t)=>t.ticket_tier_id !== ticket_tier_id);
    saveTicketPurchaseState({
        selectedTickets: updatedTickets
    });
};
const getCustomQuestion = ()=>{
    const state = loadTicketPurchaseState();
    return state.customQuestion || null;
};
const saveCustomQuestion = (question)=>{
    saveTicketPurchaseState({
        customQuestion: question
    });
};
const getAssistanceNeeded = ()=>{
    const state = loadTicketPurchaseState();
    return state.assistanceNeeded || false; // Default to false if not set
};
const saveAssistanceNeeded = (needed)=>{
    saveTicketPurchaseState({
        assistanceNeeded: needed
    });
};
const getAssistanceMessage = ()=>{
    const state = loadTicketPurchaseState();
    return state.assistanceMessage || ""; // Default to empty string if not set
};
const saveAssistanceMessage = (message)=>{
    saveTicketPurchaseState({
        assistanceMessage: message
    });
};
const saveUserDetails = (details)=>{
    saveTicketPurchaseState(details);
};
const clearSelectedPerformance = ()=>{
    saveTicketPurchaseState({
        selectedPerformanceId: undefined,
        selectedPerformanceName: undefined,
        selectedPerformanceDateTime: undefined,
        selectedPerformanceDescription: undefined,
        selectedPerformanceImageUrl: undefined,
        selectedPerformanceLocation: undefined
    });
};
const clearSelectedBundles = ()=>{
    saveTicketPurchaseState({
        selectedBundles: []
    });
};
const clearSelectedTickets = ()=>{
    saveTicketPurchaseState({
        selectedTickets: []
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dsUEJ":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializePerformanceList", ()=>initializePerformanceList);
var _core = require("@xatom/core");
var _performances = require("../../api/performances");
var _ticketPurchaseState = require("./state/ticketPurchaseState");
var _performanceFilter = require("./components/performanceFilter"); // Import the filtering initialization
let selectedPerformanceId = null;
let initialTemplateState = null;
const initializePerformanceList = async (containerSelector)=>{
    // Update return type to Promise<Performance[]>
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Performance list container not found.");
        return [];
    }
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectPerformance",
        loaderSelector: "#performanceListLoading",
        emptySelector: "#performanceListEmpty"
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
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const performanceCard = new (0, _core.WFComponent)(rowElement);
        const performanceDateWrapper = performanceCard.getChildAsComponent(".production_date_wrapper");
        const performanceDay = performanceDateWrapper?.getChildAsComponent(".u-text-h4");
        const performanceMonth = performanceDateWrapper?.getChildAsComponent(".production_date_month");
        const performanceTime = performanceDateWrapper?.getChildAsComponent(".input_card_description");
        const performanceWeekday = performanceCard.getChildAsComponent("#cardProductionTitle" // Assuming this is the correct selector for the weekday element
        );
        const performanceTitle = performanceCard.getChildAsComponent("#cardPerformanceTitle");
        const performanceProductionTitle = performanceCard.getChildAsComponent("#cardPerformanceProductionTitle");
        const performanceDescription = performanceCard.getChildAsComponent("#cardPerformanceDescription");
        const performanceImage = performanceCard.getChildAsComponent("#cardImage");
        const performanceInput = performanceCard.getChildAsComponent(".input_card_input");
        const performanceLabel = performanceCard.getChildAsComponent("label");
        const performanceLocation = performanceCard.getChildAsComponent("#cardPerformanceLocation" // Assuming this is the correct selector for location
        );
        if (!performanceDay || !performanceMonth || !performanceTime || !performanceWeekday || !performanceTitle || !performanceProductionTitle || !performanceDescription || !performanceInput || !performanceImage || !performanceLabel || !performanceLocation) {
            console.error("Performance elements not found.");
            return;
        }
        if (rowData && rowData.fieldData) {
            const inputId = `performanceInput-${index}`;
            performanceInput.setAttribute("id", inputId);
            performanceInput.setAttribute("value", rowData.id);
            performanceLabel.setAttribute("for", inputId);
            const date = new Date(rowData.fieldData["date-time"]);
            performanceDay.setText(date.toLocaleString("en-US", {
                day: "numeric",
                timeZone: "America/New_York"
            }));
            performanceMonth.setText(date.toLocaleString("en-US", {
                month: "short",
                timeZone: "America/New_York"
            }));
            performanceTime.setText(date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/New_York"
            }));
            performanceWeekday.setText(date.toLocaleString("en-US", {
                weekday: "long",
                timeZone: "America/New_York"
            }));
            performanceTitle.setText(rowData.fieldData["displayed-name"]);
            // Get the selected production name from the state and set it in the card
            const selectedProduction = (0, _ticketPurchaseState.getSelectedProduction)();
            performanceProductionTitle.setText(selectedProduction?.name || "Unknown Production");
            performanceDescription.setText(rowData.fieldData["short-description"]);
            if (rowData.fieldData["main-image"]?.url) {
                performanceImage.setAttribute("src", rowData.fieldData["main-image"].url);
                performanceImage.setAttribute("alt", rowData.fieldData["main-image"].alt || "Performance Image");
            } else console.warn(`Performance ID ${rowData.id} does not have a main image.`);
            performanceLocation.setText(rowData.location_name || "Unknown");
            performanceInput.on("change", ()=>{
                selectedPerformanceId = performanceInput.getElement().value;
                (0, _ticketPurchaseState.saveSelectedPerformance)({
                    id: rowData.id,
                    name: rowData.fieldData["displayed-name"],
                    dateTime: rowData.fieldData["date-time"],
                    description: rowData.fieldData["short-description"],
                    imageUrl: rowData.fieldData["main-image"].url,
                    location: rowData.location_name
                });
                console.log("Selected Performance ID:", selectedPerformanceId);
            });
            rowElement.setStyle({
                display: "flex"
            });
        } else console.error("Incomplete performance data:", rowData);
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        // Get the selected production ID from the state
        const selectedProduction = (0, _ticketPurchaseState.getSelectedProduction)();
        const selectedProductionId = selectedProduction?.id;
        if (!selectedProductionId) {
            console.error("No production selected, cannot fetch performances.");
            list.changeLoadingStatus(false);
            return [];
        }
        // Fetch performances based on the selected production ID
        let performances = await (0, _performances.fetchPerformances)(selectedProductionId);
        // Sort performances by date
        performances = performances.sort((a, b)=>{
            const dateA = new Date(a.fieldData["date-time"]);
            const dateB = new Date(b.fieldData["date-time"]);
            return dateA.getTime() - dateB.getTime();
        });
        console.log("Fetched and sorted performances:", performances);
        if (performances && performances.length > 0) {
            list.setData(performances);
            // Initialize the performance filter after data is set
            (0, _performanceFilter.initializePerformanceFilter)();
        } else list.setData([]); // Trigger the empty state
        list.changeLoadingStatus(false);
        return performances; // Return the list of performances
    } catch (error) {
        console.error("Error loading performances:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
        return []; // Return an empty array in case of error
    }
};

},{"@xatom/core":"j9zXV","../../api/performances":"blMIU","./state/ticketPurchaseState":"7W2vK","./components/performanceFilter":"3V9Of","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"blMIU":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchPerformances", ()=>fetchPerformances);
var _apiConfig = require("./apiConfig");
const fetchPerformances = async (productionId)=>{
    try {
        const response = await (0, _apiConfig.apiClient).post("/tickets/performances", {
            data: {
                production_id: productionId
            }
        }).fetch();
        return response.performances;
    } catch (error) {
        console.error("Error fetching performances:", error);
        throw error;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"3V9Of":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializePerformanceFilter", ()=>initializePerformanceFilter);
const initializePerformanceFilter = ()=>{
    const locationSelectElement = document.getElementById("locationFilter");
    const monthSelectElement = document.getElementById("monthFilter");
    if (locationSelectElement) locationSelectElement.addEventListener("change", ()=>{
        applyFilters();
    });
    if (monthSelectElement) monthSelectElement.addEventListener("change", ()=>{
        applyFilters();
    });
};
const applyFilters = ()=>{
    const locationSelectElement = document.getElementById("locationFilter");
    const monthSelectElement = document.getElementById("monthFilter");
    const selectedLocation = locationSelectElement?.value || "N/A";
    const selectedMonth = monthSelectElement?.value || "N/A";
    filterPerformances(selectedLocation, selectedMonth);
};
const filterPerformances = (location, month)=>{
    const performanceCards = document.querySelectorAll(".input_card_wrap");
    let hasVisibleItems = false;
    performanceCards.forEach((performanceCard)=>{
        const performanceLocationElement = performanceCard.querySelector("#cardPerformanceLocation");
        const performanceLocation = performanceLocationElement?.textContent || "";
        const performanceMonthElement = performanceCard.querySelector(".production_date_month");
        const performanceMonth = performanceMonthElement?.textContent || "";
        const matchesLocation = location === "N/A" || performanceLocation === location;
        const matchesMonth = month === "N/A" || performanceMonth.toUpperCase() === month;
        if (matchesLocation && matchesMonth) {
            performanceCard.style.display = "flex";
            hasVisibleItems = true;
        } else performanceCard.style.display = "none";
    });
    // Handle empty state display
    const emptyStateElement = document.getElementById("filterListEmpty");
    if (emptyStateElement) emptyStateElement.style.display = hasVisibleItems ? "none" : "flex";
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dhBzw":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeTicketTiers", ()=>initializeTicketTiers);
var _ticketTiersAPI = require("../../api/ticketTiersAPI");
var _ticketTierListRender = require("./components/ticketTierListRender");
var _ticketPurchaseState = require("./state/ticketPurchaseState");
var _core = require("@xatom/core");
var _selectedPerformanceUI = require("./components/selectedPerformanceUI");
var _customQuestionUI = require("./components/customQuestionUI");
var _assistanceInputUI = require("./components/assistanceInputUI");
var _userDetailsUI = require("./components/userDetailsUI"); // Import the new component
const initializeTicketTiers = async (bundleContainerSelector, tierContainerSelector)=>{
    const selectedPerformance = (0, _ticketPurchaseState.getSelectedPerformance)();
    if (!selectedPerformance || !selectedPerformance.id) {
        console.error("No performance selected.");
        return;
    }
    try {
        // Fetch ticket tiers data based on the selected performance
        const ticketTierData = await (0, _ticketTiersAPI.fetchTicketTiers)(selectedPerformance.id);
        const { bundles_offered, tickets_offered, performance_details } = ticketTierData;
        // Update the UI with the selected performance details
        (0, _selectedPerformanceUI.updateSelectedPerformanceUI)();
        // Initialize the user details section
        (0, _userDetailsUI.initializeUserDetails)(); // Initialize the user details component
        // Always reset the display style before rendering
        const bundleContainer = new (0, _core.WFComponent)(bundleContainerSelector);
        if (bundleContainer) bundleContainer.setStyle({
            display: "block"
        }); // Reset to default visible style
        const tierContainer = new (0, _core.WFComponent)(tierContainerSelector);
        if (tierContainer) tierContainer.setStyle({
            display: "block"
        }); // Reset to default visible style
        // Flag to check if there are any bundles or tickets
        let hasBundlesOrTickets = false;
        // Render bundles if available
        if (bundles_offered.length > 0) {
            (0, _ticketTierListRender.renderBundles)(bundles_offered, bundleContainerSelector);
            hasBundlesOrTickets = true;
        } else if (bundleContainer) bundleContainer.setStyle({
            display: "none"
        }); // Hide if no bundles offered
        // Render ticket tiers if available
        if (tickets_offered.length > 0) {
            (0, _ticketTierListRender.renderTicketTiers)(tickets_offered, tierContainerSelector);
            hasBundlesOrTickets = true;
        } else if (tierContainer) tierContainer.setStyle({
            display: "none"
        }); // Hide if no tickets offered
        // Show or hide the "no tickets available" message
        const noTicketsAvailableElement = new (0, _core.WFComponent)("#noTicketsAvailable");
        if (noTicketsAvailableElement) {
            if (!hasBundlesOrTickets) noTicketsAvailableElement.setStyle({
                display: "flex"
            });
            else noTicketsAvailableElement.setStyle({
                display: "none"
            });
        }
        // Extract the custom question and update the UI
        const customQuestion = performance_details.fieldData["custom-question"];
        (0, _customQuestionUI.updateCustomQuestion)(customQuestion);
        // Initialize the assistance input logic
        (0, _assistanceInputUI.initializeAssistanceInput)(); // Initialize the assistance input component
    } catch (error) {
        console.error("Error fetching ticket tiers:", error);
    // Handle any errors that occur during the ticket tiers fetching process
    }
};

},{"../../api/ticketTiersAPI":"fZCVW","./components/ticketTierListRender":"jlEiM","./state/ticketPurchaseState":"7W2vK","@xatom/core":"j9zXV","./components/selectedPerformanceUI":"2s5n0","./components/customQuestionUI":"25leL","./components/assistanceInputUI":"fpr7i","./components/userDetailsUI":"63j01","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fZCVW":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchTicketTiers", ()=>fetchTicketTiers);
var _apiConfig = require("./apiConfig");
const fetchTicketTiers = async (selectedPerformanceId)=>{
    try {
        const response = await (0, _apiConfig.apiClient).post("/tickets/ticket_tiers", {
            data: {
                selectedPerformanceId
            }
        }).fetch();
        return response;
    } catch (error) {
        console.error("Error fetching ticket tiers:", error);
        throw error;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"jlEiM":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "renderBundles", ()=>(0, _bundleRenderer.renderBundles));
parcelHelpers.export(exports, "renderTicketTiers", ()=>(0, _ticketTierRenderer.renderTicketTiers));
var _bundleRenderer = require("./bundleRenderer");
var _ticketTierRenderer = require("./ticketTierRenderer");

},{"./bundleRenderer":"aDDUp","./ticketTierRenderer":"kHoQq","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"aDDUp":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "renderBundles", ()=>renderBundles);
var _core = require("@xatom/core");
var _ticketPurchaseState = require("../state/ticketPurchaseState");
var _bundleStateUpdater = require("../state/bundleStateUpdater");
var _ticketTierRenderer = require("./ticketTierRenderer");
var _formUtils = require("../../../utils/formUtils");
let initialBundleTemplate = null; // Store the initial template
const renderBundles = (bundles, containerSelector)=>{
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Bundle list container not found.");
        return;
    }
    // Save the initial template state if not already saved
    if (!initialBundleTemplate) initialBundleTemplate = container.cloneNode(true);
    // Clear the container and restore the initial template
    container.innerHTML = "";
    container.appendChild(initialBundleTemplate.cloneNode(true));
    const clearNoTicketsError = ()=>{
        const noTicketsError = new (0, _core.WFComponent)("#noTicketsError");
        (0, _formUtils.toggleError)(noTicketsError, "", false);
    };
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#bundleCard",
        loaderSelector: "#bundleListLoading",
        emptySelector: "#bundleListEmpty"
    });
    list.loaderRenderer((loaderElement)=>{
        loaderElement.getElement().style.display = "flex";
        return loaderElement;
    });
    list.emptyRenderer((emptyElement)=>{
        emptyElement.getElement().style.display = "flex";
        return emptyElement;
    });
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const bundleCard = new (0, _core.WFComponent)(rowElement);
        const bundleName = bundleCard.getChildAsComponent("#bundleName");
        const bundlePrice = bundleCard.getChildAsComponent("#bundlePrice");
        const bundleSoldOut = bundleCard.getChildAsComponent("#bundleSoldOut");
        const bundleDescription = bundleCard.getChildAsComponent("#bundleDescription");
        const bundleQuantityInput = bundleCard.getChildAsComponent("#bundleQuantityInput");
        const bundleIncrementButton = bundleCard.getChildAsComponent("#bundleQuantityIncrease");
        const bundleDecrementButton = bundleCard.getChildAsComponent("#bundleQuantityDecrease");
        const bundleMaxAlert = bundleCard.getChildAsComponent(".maximum_alert");
        const numberInputWrapper = bundleCard.getChildAsComponent(".number_input_wrapper");
        if (!bundleName || !bundlePrice || !bundleSoldOut || !bundleDescription || !bundleQuantityInput || !bundleIncrementButton || !bundleDecrementButton || !bundleMaxAlert || !numberInputWrapper) {
            console.error("Bundle elements not found.");
            return;
        }
        bundleName.setText(rowData.fieldData["displayed-name"]);
        bundlePrice.setText(`${rowData.price}`);
        bundleDescription.setText(rowData.fieldData["short-description"]);
        bundleQuantityInput.setAttribute("max", String(rowData.quantity));
        bundleQuantityInput.setAttribute("value", "0");
        const updateAlertVisibility = ()=>{
            const currentQuantity = Number(bundleQuantityInput.getElement().value);
            const maxAlertElement = bundleMaxAlert.getElement();
            if (currentQuantity >= rowData.quantity) {
                bundleMaxAlert.setText("You have reached the maximum available quantity.");
                maxAlertElement.style.display = "block";
            } else maxAlertElement.style.display = "none";
        };
        bundleIncrementButton.on("click", ()=>{
            const inputElement = bundleQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            if (currentQuantity < rowData.quantity) {
                currentQuantity++;
                inputElement.value = String(currentQuantity);
                (0, _ticketPurchaseState.saveSelectedBundle)(rowData.id, currentQuantity);
                (0, _bundleStateUpdater.updateTicketTierButtons)(); // Enable ticket tier buttons if needed
                clearNoTicketsError(); // Clear no tickets error
            }
            updateAlertVisibility();
            (0, _ticketTierRenderer.revalidateTicketTierQuantities)(); // Revalidate after increment
        });
        bundleDecrementButton.on("click", ()=>{
            const inputElement = bundleQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            if (currentQuantity > 0) {
                currentQuantity--;
                inputElement.value = String(currentQuantity);
                if (currentQuantity > 0) {
                    (0, _ticketPurchaseState.saveSelectedBundle)(rowData.id, currentQuantity);
                    clearNoTicketsError(); // Clear no tickets error
                } else (0, _ticketPurchaseState.removeSelectedBundle)(rowData.id);
                (0, _bundleStateUpdater.updateTicketTierButtons)(); // Disable ticket tier buttons if needed
            }
            updateAlertVisibility();
            (0, _bundleStateUpdater.resetTicketQuantitiesIfNeeded)(); // Reset ticket quantities if bundles are insufficient
            (0, _ticketTierRenderer.revalidateTicketTierQuantities)(); // Revalidate after decrement
        });
        bundleQuantityInput.on("input", ()=>{
            const inputElement = bundleQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            if (currentQuantity > rowData.quantity) {
                inputElement.value = String(rowData.quantity);
                updateAlertVisibility();
            }
            (0, _ticketTierRenderer.revalidateTicketTierQuantities)(); // Revalidate on manual input
            clearNoTicketsError(); // Clear no tickets error on manual input
        });
        if (rowData.quantity <= 0) {
            bundleSoldOut.getElement().style.display = "block";
            bundlePrice.getElement().style.display = "none";
            numberInputWrapper.addCssClass("is-disabled");
        } else {
            bundleSoldOut.getElement().style.display = "none";
            bundlePrice.getElement().style.display = "block";
            numberInputWrapper.removeCssClass("is-disabled");
        }
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    list.setData(bundles);
};

},{"@xatom/core":"j9zXV","../state/ticketPurchaseState":"7W2vK","../state/bundleStateUpdater":"2gMSo","./ticketTierRenderer":"kHoQq","../../../utils/formUtils":"hvg7i","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2gMSo":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "resetTicketQuantitiesIfNeeded", ()=>resetTicketQuantitiesIfNeeded);
parcelHelpers.export(exports, "updateTicketTierButtons", ()=>updateTicketTierButtons);
var _ticketPurchaseState = require("../state/ticketPurchaseState");
// Utility function to safely convert unknown types to number
const safeNumber = (value)=>typeof value === "number" ? value : 0;
const resetTicketQuantitiesIfNeeded = ()=>{
    const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
    const totalBundlesSelected = selectedBundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
    const selectedTickets = (0, _ticketPurchaseState.getSelectedTickets)();
    selectedTickets.forEach((ticket)=>{
        const ticketElement = document.querySelector(`#ticketTierCard[data-id="${ticket.ticket_tier_id}"] #ticketTierQuantityInput`);
        if (!ticketElement) return;
        if (ticket.bundle_required && totalBundlesSelected <= 0) {
            ticketElement.value = "0";
            (0, _ticketPurchaseState.removeSelectedTicket)(ticket.ticket_tier_id);
        }
    });
    console.log("Updated selectedTickets:", (0, _ticketPurchaseState.getSelectedTickets)());
};
const updateTicketTierButtons = ()=>{
    const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
    const totalBundlesSelected = selectedBundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
    const ticketTierInputs = document.querySelectorAll("#ticketTierQuantityInput");
    const ticketTierIncrementButtons = document.querySelectorAll("#ticketTierQuantityIncrease");
    ticketTierInputs.forEach((input)=>{
        const ticketCard = input.closest("#ticketTierCard");
        const requiresBundle = ticketCard?.getAttribute("data-requires-bundle") === "true";
        if (requiresBundle && totalBundlesSelected <= 0) {
            input.setAttribute("disabled", "true");
            input.value = "0";
        } else input.removeAttribute("disabled");
    });
    ticketTierIncrementButtons.forEach((button)=>{
        const ticketCard = button.closest("#ticketTierCard");
        const requiresBundle = ticketCard?.getAttribute("data-requires-bundle") === "true";
        if (requiresBundle && totalBundlesSelected <= 0) button.setAttribute("disabled", "true");
        else button.removeAttribute("disabled");
    });
    resetTicketQuantitiesIfNeeded();
};

},{"../state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"kHoQq":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "revalidateTicketTierQuantities", ()=>revalidateTicketTierQuantities);
parcelHelpers.export(exports, "renderTicketTiers", ()=>renderTicketTiers);
var _core = require("@xatom/core");
var _ticketPurchaseState = require("../state/ticketPurchaseState");
var _formUtils = require("../../../utils/formUtils");
const safeNumber = (value)=>typeof value === "number" ? value : 0;
const clearNoTicketsError = ()=>{
    const noTicketsError = new (0, _core.WFComponent)("#noTicketsError");
    (0, _formUtils.toggleError)(noTicketsError, "", false);
};
let initialTicketTierTemplate = null;
const revalidateTicketTierQuantities = ()=>{
    const ticketTierCards = document.querySelectorAll("[data-requires-bundle='true']");
    ticketTierCards.forEach((card)=>{
        const ticketTierMaxAlert = new (0, _core.WFComponent)(card.querySelector(".maximum_alert"));
        const ticketTierQuantityInput = new (0, _core.WFComponent)(card.querySelector("#ticketTierQuantityInput"));
        const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
        const totalBundlesSelected = selectedBundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
        if (totalBundlesSelected <= 0) {
            ticketTierQuantityInput.getElement().value = "0";
            ticketTierMaxAlert.setText("This item requires a ticket bundle purchase. Please add a ticket bundle from the options above.");
            ticketTierMaxAlert.getElement().style.display = "block";
        } else ticketTierMaxAlert.getElement().style.display = "none";
    });
};
const renderTicketTiers = (tickets, containerSelector)=>{
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Ticket tier list container not found.");
        return;
    }
    if (!initialTicketTierTemplate) initialTicketTierTemplate = container.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(initialTicketTierTemplate.cloneNode(true));
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#ticketTierCard",
        loaderSelector: "#ticketTierListLoading",
        emptySelector: "#ticketTierListEmpty"
    });
    list.loaderRenderer((loaderElement)=>{
        loaderElement.getElement().style.display = "flex";
        return loaderElement;
    });
    list.emptyRenderer((emptyElement)=>{
        emptyElement.getElement().style.display = "flex";
        return emptyElement;
    });
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const ticketTierCard = new (0, _core.WFComponent)(rowElement);
        if (rowData.fieldData["requires-bundle-purchase"] === true) rowElement.setAttribute("data-requires-bundle", "true");
        else rowElement.setAttribute("data-requires-bundle", "false");
        const ticketTierName = ticketTierCard.getChildAsComponent("#ticketTierName");
        const ticketTierPrice = ticketTierCard.getChildAsComponent("#ticketTierPrice");
        const ticketTierSoldOut = ticketTierCard.getChildAsComponent("#ticketTierSoldOut");
        const ticketTierDescription = ticketTierCard.getChildAsComponent("#ticketTierDescription");
        const ticketTierQuantityInput = ticketTierCard.getChildAsComponent("#ticketTierQuantityInput");
        const ticketTierIncrementButton = ticketTierCard.getChildAsComponent("#ticketTierQuantityIncrease");
        const ticketTierDecrementButton = ticketTierCard.getChildAsComponent("#ticketTierQuantityDecrease");
        const ticketTierMaxAlert = ticketTierCard.getChildAsComponent(".maximum_alert");
        const numberInputWrapper = ticketTierCard.getChildAsComponent(".number_input_wrapper");
        if (!ticketTierName || !ticketTierPrice || !ticketTierSoldOut || !ticketTierDescription || !ticketTierQuantityInput || !ticketTierIncrementButton || !ticketTierDecrementButton || !ticketTierMaxAlert || !numberInputWrapper) {
            console.error("Ticket tier elements not found.");
            return;
        }
        const displayedName = rowData.fieldData["displayed-name"] || "Unknown Ticket Tier";
        const price = rowData.price ? `${rowData.price.toString()}` : "N/A";
        const description = rowData.fieldData["short-description"] || "";
        ticketTierName.setText(displayedName);
        ticketTierPrice.setText(price);
        ticketTierDescription.setText(description);
        ticketTierQuantityInput.setAttribute("max", String(rowData.quantity || 0));
        ticketTierQuantityInput.setAttribute("value", "0");
        const updateAlertVisibility = (message)=>{
            ticketTierMaxAlert.setText(message);
            ticketTierMaxAlert.getElement().style.display = "block";
        };
        ticketTierIncrementButton.on("click", ()=>{
            const inputElement = ticketTierQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            ticketTierMaxAlert.getElement().style.display = "none";
            if (rowData.fieldData["requires-bundle-purchase"]) {
                const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
                const totalBundlesSelected = selectedBundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
                if (totalBundlesSelected <= 0) {
                    updateAlertVisibility("This item requires a ticket bundle purchase. Please add a ticket bundle from the options above.");
                    return;
                }
            }
            if (currentQuantity < rowData.quantity) {
                currentQuantity++;
                inputElement.value = String(currentQuantity);
                (0, _ticketPurchaseState.saveSelectedTicket)(rowData.id, currentQuantity, rowData.fieldData["requires-bundle-purchase"]);
                revalidateTicketTierQuantities();
                clearNoTicketsError();
            } else updateAlertVisibility("You have reached the maximum available quantity.");
        });
        ticketTierDecrementButton.on("click", ()=>{
            const inputElement = ticketTierQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            if (currentQuantity > 0) {
                currentQuantity--;
                inputElement.value = String(currentQuantity);
                if (currentQuantity > 0) {
                    (0, _ticketPurchaseState.saveSelectedTicket)(rowData.id, currentQuantity, rowData.fieldData["requires-bundle-purchase"]);
                    clearNoTicketsError();
                } else (0, _ticketPurchaseState.removeSelectedTicket)(rowData.id);
                revalidateTicketTierQuantities();
            }
        });
        ticketTierQuantityInput.on("input", ()=>{
            const inputElement = ticketTierQuantityInput.getElement();
            let currentQuantity = Number(inputElement.value);
            if (currentQuantity > rowData.quantity) {
                inputElement.value = String(rowData.quantity);
                updateAlertVisibility("You have reached the maximum available quantity.");
            } else if (rowData.fieldData["requires-bundle-purchase"] && currentQuantity > 0) {
                const selectedBundles = (0, _ticketPurchaseState.getSelectedBundles)();
                const totalBundlesSelected = selectedBundles.reduce((sum, bundle)=>sum + safeNumber(bundle.quantity), 0);
                if (totalBundlesSelected <= 0) {
                    inputElement.value = "0";
                    updateAlertVisibility("This item requires a ticket bundle purchase. Please add a ticket bundle from the options above.");
                } else ticketTierMaxAlert.getElement().style.display = "none";
            } else ticketTierMaxAlert.getElement().style.display = "none";
            clearNoTicketsError();
        });
        if (rowData.quantity <= 0) {
            ticketTierSoldOut.getElement().style.display = "block";
            ticketTierPrice.getElement().style.display = "none";
            numberInputWrapper.addCssClass("is-disabled");
        } else {
            ticketTierSoldOut.getElement().style.display = "none";
            ticketTierPrice.getElement().style.display = "block";
            numberInputWrapper.removeCssClass("is-disabled");
        }
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    list.setData(tickets);
};

},{"@xatom/core":"j9zXV","../state/ticketPurchaseState":"7W2vK","../../../utils/formUtils":"hvg7i","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"2s5n0":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateSelectedPerformanceUI", ()=>updateSelectedPerformanceUI);
var _core = require("@xatom/core");
var _ticketPurchaseState = require("../state/ticketPurchaseState");
const updateSelectedPerformanceUI = ()=>{
    const selectedPerformance = (0, _ticketPurchaseState.getSelectedPerformance)();
    const selectedProduction = (0, _ticketPurchaseState.getSelectedProduction)();
    if (!selectedPerformance || !selectedPerformance.id) {
        console.error("No performance selected.");
        return;
    }
    const selectedPerformanceDate = new (0, _core.WFComponent)("#selectedPerformanceDate");
    const selectedPerformanceMonth = new (0, _core.WFComponent)("#selectedPerformanceMonth");
    const selectedWeekday = new (0, _core.WFComponent)("#selectedWeekday");
    const selectedTime = new (0, _core.WFComponent)("#selectedTime");
    const selectedPerformanceTitle = new (0, _core.WFComponent)("#selectedPerformanceTitle");
    const selectedPerformanceProductionTitle = new (0, _core.WFComponent)("#selectedPerformanceProductionTitle");
    const selectedPerformanceDescription = new (0, _core.WFComponent)("#selectedPerformanceDescription");
    const selectedImage = new (0, _core.WFComponent)("#selectedImage");
    const selectedPerformanceLocation = new (0, _core.WFComponent)("#selectedPerformanceLocation");
    const date = new Date(selectedPerformance.dateTime);
    selectedPerformanceDate.setText(date.getDate().toString());
    selectedPerformanceMonth.setText(date.toLocaleString("en-US", {
        month: "short"
    }));
    selectedWeekday.setText(date.toLocaleString("en-US", {
        weekday: "long"
    }));
    selectedTime.setText(date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    }));
    selectedPerformanceTitle.setText(selectedPerformance.name);
    selectedPerformanceProductionTitle.setText(selectedProduction.name);
    selectedPerformanceDescription.setText(selectedProduction.description);
    if (selectedPerformance.imageUrl) {
        selectedImage.setAttribute("src", selectedPerformance.imageUrl);
        selectedImage.setAttribute("alt", selectedPerformance.name);
    }
    // Update the location UI element with the selected performance location
    if (selectedPerformance.location) selectedPerformanceLocation.setText(selectedPerformance.location);
    else selectedPerformanceLocation.setText("Location not specified");
};

},{"@xatom/core":"j9zXV","../state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"25leL":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateCustomQuestion", ()=>updateCustomQuestion);
var _core = require("@xatom/core");
var _ticketPurchaseState = require("../state/ticketPurchaseState"); // Correct function name
const updateCustomQuestion = (questionText)=>{
    const customQuestionLabel = new (0, _core.WFComponent)("label[for='customQuestionInput']");
    const customQuestionInput = new (0, _core.WFComponent)("#customQuestionInput");
    if (customQuestionLabel && customQuestionInput) {
        customQuestionLabel.setText(questionText || "No custom question available.");
        customQuestionInput.on("input", ()=>{
            const answer = customQuestionInput.getElement().value;
            (0, _ticketPurchaseState.saveCustomQuestion)(answer); // Use the correct function name
        });
    }
};

},{"@xatom/core":"j9zXV","../state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fpr7i":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeAssistanceInput", ()=>initializeAssistanceInput);
var _core = require("@xatom/core");
var _ticketPurchaseState = require("../state/ticketPurchaseState");
const initializeAssistanceInput = ()=>{
    const assistanceInput = new (0, _core.WFComponent)("#assistanceInput");
    const hiddenAssistanceWrapper = new (0, _core.WFComponent)("#hiddenAssistanceWrapper");
    const assistanceMessageInput = new (0, _core.WFComponent)("#assistanceMessageInput");
    if (!assistanceInput || !hiddenAssistanceWrapper || !assistanceMessageInput) {
        console.error("Assistance input or hidden wrapper elements not found.");
        return;
    }
    // Initialize state based on current input values
    const isChecked = assistanceInput.getElement().checked;
    (0, _ticketPurchaseState.saveAssistanceNeeded)(isChecked);
    if (isChecked) {
        hiddenAssistanceWrapper.removeCssClass("g-hide");
        const assistanceMessage = assistanceMessageInput.getElement().value;
        (0, _ticketPurchaseState.saveAssistanceMessage)(assistanceMessage);
    } else {
        hiddenAssistanceWrapper.addCssClass("g-hide");
        (0, _ticketPurchaseState.saveAssistanceMessage)(""); // Clear the message in the state if hidden
    }
    assistanceInput.on("change", ()=>{
        const isChecked = assistanceInput.getElement().checked;
        if (isChecked) hiddenAssistanceWrapper.removeCssClass("g-hide");
        else {
            hiddenAssistanceWrapper.addCssClass("g-hide");
            assistanceMessageInput.getElement().value = ""; // Clear the input when hidden
            (0, _ticketPurchaseState.saveAssistanceMessage)(""); // Clear the message in the state if hidden
        }
        (0, _ticketPurchaseState.saveAssistanceNeeded)(isChecked); // Save the checkbox state
    });
    assistanceMessageInput.on("input", ()=>{
        const message = assistanceMessageInput.getElement().value;
        (0, _ticketPurchaseState.saveAssistanceMessage)(message); // Save the message to the state
    });
};

},{"@xatom/core":"j9zXV","../state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"63j01":[function(require,module,exports) {
// src/modules/tickets/components/userDetailsUI.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeUserDetails", ()=>initializeUserDetails);
var _core = require("@xatom/core");
var _authConfig = require("../../../auth/authConfig");
var _ticketPurchaseState = require("../state/ticketPurchaseState"); // Import the save function from state
const initializeUserDetails = ()=>{
    const emailWrap = new (0, _core.WFComponent)("#emailWrap");
    const firstNameInput = new (0, _core.WFComponent)("#firstNameInput");
    const lastNameInput = new (0, _core.WFComponent)("#lastNameInput");
    const emailInput = new (0, _core.WFComponent)("#emailInput");
    // Check if the user is logged in
    const user = (0, _authConfig.authManager).getUserAuth().getUser();
    if (user && user.email) {
        // User is logged in, hide the emailWrap and populate the state
        emailWrap.setStyle({
            display: "none"
        });
        // Save the user details to the state
        (0, _ticketPurchaseState.saveUserDetails)({
            firstName: user.profile?.first_name || "",
            lastName: user.profile?.last_name || "",
            email: user.email
        });
    } else {
        // User is not logged in, show the emailWrap
        emailWrap.setStyle({
            display: "grid"
        });
        // Set up event listeners to save user input to the state
        firstNameInput.on("input", ()=>{
            const firstName = firstNameInput.getElement().value;
            (0, _ticketPurchaseState.saveUserDetails)({
                firstName
            });
        });
        lastNameInput.on("input", ()=>{
            const lastName = lastNameInput.getElement().value;
            (0, _ticketPurchaseState.saveUserDetails)({
                lastName
            });
        });
        emailInput.on("input", ()=>{
            const email = emailInput.getElement().value;
            (0, _ticketPurchaseState.saveUserDetails)({
                email
            });
        });
    }
};

},{"@xatom/core":"j9zXV","../../../auth/authConfig":"gkGgf","../state/ticketPurchaseState":"7W2vK","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2zMuG":[function(require,module,exports) {
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

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}],"2VBNk":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeTicketSidebarIndicators", ()=>initializeTicketSidebarIndicators);
parcelHelpers.export(exports, "setActiveTicketStep", ()=>setActiveTicketStep);
parcelHelpers.export(exports, "unsetActiveTicketStep", ()=>unsetActiveTicketStep);
parcelHelpers.export(exports, "markTicketStepAsCompleted", ()=>markTicketStepAsCompleted);
parcelHelpers.export(exports, "unmarkTicketStepAsCompleted", ()=>unmarkTicketStepAsCompleted);
var _core = require("@xatom/core");
var _authConfig = require("../../../auth/authConfig");
const initializeTicketSidebarIndicators = ()=>{
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
const setActiveTicketStep = (stepNumber)=>{
    const stepId = getTicketStepId(stepNumber);
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.addCssClass("is-active");
};
const unsetActiveTicketStep = (stepNumber)=>{
    const stepId = getTicketStepId(stepNumber);
    const stepComponent = new (0, _core.WFComponent)(`#${stepId}`);
    stepComponent.removeCssClass("is-active");
};
const markTicketStepAsCompleted = (stepNumber)=>{
    const stepId = getTicketStepId(stepNumber);
    const step = new (0, _core.WFComponent)(`#${stepId}`);
    step.getElement().click(); // Programmatically trigger the click event to mark as complete
};
const unmarkTicketStepAsCompleted = (stepNumber)=>{
    const stepId = getTicketStepId(stepNumber);
    const step = new (0, _core.WFComponent)(`#${stepId}`);
    step.getElement().click(); // Programmatically trigger the click event to unmark as complete
};
// Helper function to get the ID string for a step in the ticket form
const getTicketStepId = (stepNumber)=>{
    const stepMap = {
        1: "sidebarStepOne",
        2: "sidebarStepTwo",
        3: "sidebarStepThree",
        4: "sidebarStepFour"
    };
    return stepMap[stepNumber] || `ticketSidebarStep${stepNumber}`;
};

},{"@xatom/core":"j9zXV","../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dMBjH":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dKoGX":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStateFromUrlParams", ()=>initializeStateFromUrlParams);
var _ticketPurchaseState = require("../state/ticketPurchaseState");
var _productionList = require("../productionList");
var _performanceList = require("../performanceList");
var _ticketTiers = require("../ticketTiers");
var _sidebarIndicators = require("../components/sidebarIndicators");
var _core = require("@xatom/core");
var _selectedPerformanceUI = require("../components/selectedPerformanceUI");
var _apiConfig = require("../../../api/apiConfig"); // Import apiClient for API requests
// Function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const productionId = params.get("production");
    const performanceId = params.get("performance");
    const cancelId = params.get("cancel"); // Extract 'cancel' parameter
    return {
        productionId,
        performanceId,
        cancelId
    };
};
const initializeStateFromUrlParams = async (slider)=>{
    const { productionId, performanceId, cancelId } = getUrlParams();
    (0, _sidebarIndicators.initializeTicketSidebarIndicators)(); // Initialize sidebar indicators
    const loadingWall = new (0, _core.WFComponent)(".loading_wall");
    const animationDuration = 500; // Duration in milliseconds matching the CSS transition time
    // Check if any relevant URL parameters are present
    if (productionId || performanceId || cancelId) {
        // Show the loading wall
        loadingWall.setStyle({
            display: "flex"
        });
        try {
            // Handle cancellation if 'cancel' parameter is present
            if (cancelId) {
                // Create the DELETE request using apiClient
                const cancelOrderRequest = (0, _apiConfig.apiClient).delete(`/tickets/cancel_order/${cancelId}`);
                // Set up listeners for the DELETE request
                await new Promise((resolve, reject)=>{
                    cancelOrderRequest.onData(()=>{
                        console.log(`Ticket order ${cancelId} canceled successfully`);
                        // Optional: Remove 'cancel' parameter from the URL to prevent repeated cancellations
                        const params = new URLSearchParams(window.location.search);
                        params.delete("cancel");
                        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
                        window.history.replaceState({}, document.title, newUrl);
                        resolve(); // Resolve the promise on successful cancellation
                    });
                    cancelOrderRequest.onError((error)=>{
                        console.error(`Failed to cancel ticket order ${cancelId}:`, error);
                        // Optional: Display an error message to the user here
                        reject(error); // Reject the promise on error
                    });
                    // Initiate the DELETE request
                    cancelOrderRequest.fetch();
                });
            }
            // Proceed with initializing production and performance based on URL parameters
            if (productionId) {
                // Clear any previous ticket purchase state
                (0, _ticketPurchaseState.clearTicketPurchaseState)();
                // Initialize the production list
                const productions = await (0, _productionList.initializeProductionList)("#selectProductionList");
                // Find and select the production based on the URL parameter
                const selectedProduction = productions.find((production)=>production.id === productionId);
                if (selectedProduction) {
                    (0, _ticketPurchaseState.saveSelectedProduction)({
                        id: selectedProduction.id,
                        name: selectedProduction.fieldData["displayed-name"],
                        description: selectedProduction.fieldData["short-description"],
                        imageUrl: selectedProduction.fieldData["main-image"].url
                    });
                    (0, _sidebarIndicators.markTicketStepAsCompleted)(1);
                    (0, _sidebarIndicators.setActiveTicketStep)(2);
                    // Select the production in the UI
                    const productionComponent = document.querySelector(`input[value="${productionId}"]`);
                    if (productionComponent) {
                        productionComponent.checked = true;
                        productionComponent.dispatchEvent(new Event("change"));
                    }
                    // Initialize the performance list for the selected production
                    const performances = await (0, _performanceList.initializePerformanceList)("#selectPerformanceList");
                    if (performanceId) {
                        const selectedPerformance = performances.find((performance)=>performance.id === performanceId);
                        if (selectedPerformance) {
                            (0, _ticketPurchaseState.saveSelectedPerformance)({
                                id: selectedPerformance.id,
                                name: selectedPerformance.fieldData["displayed-name"],
                                dateTime: selectedPerformance.fieldData["date-time"],
                                description: selectedPerformance.fieldData["short-description"],
                                imageUrl: selectedPerformance.fieldData["main-image"].url,
                                location: selectedPerformance.location_name
                            });
                            (0, _sidebarIndicators.markTicketStepAsCompleted)(2);
                            (0, _sidebarIndicators.setActiveTicketStep)(3);
                            // Update the UI with the selected performance details
                            (0, _selectedPerformanceUI.updateSelectedPerformanceUI)();
                            // Initialize the ticket tiers (Step 3)
                            await (0, _ticketTiers.initializeTicketTiers)("#bundleList", "#ticketTierList");
                            slider.goToIndex(2); // Navigate to the ticket selection step
                        } else {
                            console.error(`Performance with ID ${performanceId} not found`);
                            slider.goToIndex(1); // Navigate to the performance selection step
                        }
                    } else slider.goToIndex(1); // Navigate to the performance selection step
                } else {
                    console.error(`Production with ID ${productionId} not found`);
                    slider.goToIndex(0); // Navigate to the production selection step
                }
            } else // If no productionId, navigate to the first step
            slider.goToIndex(0);
        } catch (error) {
            console.error("Error initializing state from URL parameters:", error);
            slider.goToIndex(0); // Navigate to the production selection step on error
        } finally{
            // Hide the loading wall after completing all initializations
            loadingWall.addCssClass("hidden");
            setTimeout(()=>loadingWall.setStyle({
                    display: "none"
                }), animationDuration);
        }
    }
};

},{"../state/ticketPurchaseState":"7W2vK","../productionList":"4B4yP","../performanceList":"dsUEJ","../ticketTiers":"dhBzw","../components/sidebarIndicators":"2VBNk","@xatom/core":"j9zXV","../components/selectedPerformanceUI":"2s5n0","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=makeTicketPurchase.55f87736.js.map
