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
})({"8oAjU":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "purchaseTickets", ()=>purchaseTickets);
var _listProductions = require("../../components/purchaseTicketsComponents/listProductions");
var _listPerformances = require("../../components/purchaseTicketsComponents/listPerformances");
var _listTicketTiers = require("../../components/purchaseTicketsComponents/listTicketTiers");
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
var _slider = require("@xatom/slider");
var _authConfig = require("../../../auth/authConfig");
const loadState = ()=>{
    const savedState = localStorage.getItem("ticketPurchaseState");
    if (savedState) return JSON.parse(savedState);
    return {};
};
// Save the ticket purchase state to localStorage
const saveState = (state)=>{
    localStorage.setItem("ticketPurchaseState", JSON.stringify(state));
};
// Set sidebar first name from userAuth
const firstNameText = new (0, _core.WFComponent)("#firstNameText");
const user = (0, _authConfig.userAuth).getUser();
if (user && user.profile && user.profile.first_name) firstNameText.setText(user.profile.first_name);
else firstNameText.setText("Friend");
// Hide email input if user is authenticated
const emailWrap = new (0, _core.WFComponent)("#emailWrap");
const firstNameInput = new (0, _core.WFComponent)("#firstNameInput");
const firstNameInputError = new (0, _core.WFComponent)("#firstNameInputError");
const lastNameInput = new (0, _core.WFComponent)("#lastNameInput");
const lastNameInputError = new (0, _core.WFComponent)("#lastNameInputError");
const emailInput = new (0, _core.WFComponent)("#emailInput");
const emailInputError = new (0, _core.WFComponent)("#emailInputError");
const customQuestionInput = new (0, _core.WFComponent)("#customQuestionInput");
const customQuestionInputError = new (0, _core.WFComponent)("#customQuestionInputError");
const validateNotEmpty = (value)=>value.trim() !== "";
if (user && user.profile && user.email) emailWrap.setStyle({
    display: "none"
});
else {
    (0, _formUtils.setupValidation)(firstNameInput, firstNameInputError, (0, _formUtils.createValidationFunction)(firstNameInput, validateNotEmpty, "First name is required."));
    (0, _formUtils.setupValidation)(lastNameInput, lastNameInputError, (0, _formUtils.createValidationFunction)(lastNameInput, validateNotEmpty, "Last name is required."));
    (0, _formUtils.setupValidation)(emailInput, emailInputError, (0, _formUtils.createValidationFunction)(emailInput, (0, _validationUtils.validateEmail), "Please enter a valid email address."));
}
(0, _formUtils.setupValidation)(customQuestionInput, customQuestionInputError, (0, _formUtils.createValidationFunction)(customQuestionInput, validateNotEmpty, "This field is required."));
const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
// Define sidebar elements
const sidebarStepOne = new (0, _core.WFComponent)("#sidebarStepOne");
const sidebarStepTwo = new (0, _core.WFComponent)("#sidebarStepTwo");
const sidebarStepThree = new (0, _core.WFComponent)("#sidebarStepThree");
const sidebarStepFour = new (0, _core.WFComponent)("#sidebarStepFour");
const sidebarSteps = [
    sidebarStepOne,
    sidebarStepTwo,
    sidebarStepThree,
    sidebarStepFour
];
// Function to update the sidebar active class
const updateSidebar = (currentStepIndex)=>{
    sidebarSteps.forEach((step, index)=>{
        if (index === currentStepIndex) step.addCssClass("is-active");
        else step.removeCssClass("is-active");
    });
};
// Function to trigger the success animation
const triggerSuccessAnimation = (stepIndex)=>{
    const step = sidebarSteps[stepIndex];
    step.getElement().click();
};
const updateCustomQuestionLabel = (customQuestionText)=>{
    const customQuestionLabel = new (0, _core.WFComponent)('label[for="customQuestionInput"]');
    if (customQuestionLabel) customQuestionLabel.setText(customQuestionText);
    else console.error("Custom question label not found");
};
const setupAssistanceCheckbox = ()=>{
    const assistanceCheckbox = new (0, _core.WFComponent)("#assistanceInput");
    const hiddenAssistanceWrapper = new (0, _core.WFComponent)("#hiddenAssistanceWrapper");
    const assistanceMessageInput = new (0, _core.WFComponent)("#assistanceMessageInput");
    if (assistanceCheckbox && hiddenAssistanceWrapper && assistanceMessageInput) assistanceCheckbox.on("change", ()=>{
        if (assistanceCheckbox.getElement().checked) hiddenAssistanceWrapper.setStyle({
            display: "block"
        });
        else {
            hiddenAssistanceWrapper.setStyle({
                display: "none"
            });
            assistanceMessageInput.getElement().value = ""; // Clear the input field
        }
    });
    else console.error("Assistance checkbox or hidden wrapper not found");
};
// Initialize URL navigation
// Initialize URL navigation
const navigateToStepFromURL = async ()=>{
    const params = new URLSearchParams(window.location.search);
    const productionId = params.get("production");
    const performanceId = params.get("performance");
    const loadingWall = new (0, _core.WFComponent)(".loading_wall");
    if (productionId) {
        const state = loadState();
        state.selectedProductionId = productionId;
        loadingWall.setStyle({
            display: "flex"
        });
        // Fetch production title to set selectedProductionTitle in the state
        const productions = await (0, _listProductions.fetchProductions)();
        const selectedProduction = productions.find((production)=>production.id === productionId);
        if (selectedProduction) state.selectedProductionTitle = selectedProduction.fieldData.name;
        saveState(state);
        if (performanceId) {
            state.selectedPerformanceId = performanceId;
            saveState(state);
            // Navigate to the correct step first
            slider.goToIndex(2);
            triggerSuccessAnimation(1);
            // Initialize the lists after navigating to the step
            await (0, _listPerformances.initializeDynamicPerformanceList)("#selectPerformanceList");
            await (0, _listTicketTiers.initializeDynamicTicketList)("#ticketTierList");
            // Set up custom question label and assistance checkbox
            const ticketData = await (0, _listTicketTiers.fetchTicketData)();
            const { selected_performance } = ticketData;
            (0, _listTicketTiers.updateSelectedPerformance)(selected_performance);
            updateCustomQuestionLabel(selected_performance.fieldData["custom-question"]);
            setupAssistanceCheckbox();
            // Fade out the loading wall
            loadingWall.setStyle({
                opacity: "0"
            });
            setTimeout(()=>{
                loadingWall.setStyle({
                    display: "none"
                });
            }, 500); // Duration should match the CSS transition duration
        } else {
            // Navigate to the correct step first
            slider.goToIndex(1);
            // Initialize the lists after navigating to the step
            await (0, _listPerformances.initializeDynamicPerformanceList)("#selectPerformanceList");
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
    }
};
const purchaseTickets = async ()=>{
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    const formStepThree = new (0, _core.WFFormComponent)("#formStepThree");
    const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
    const stepTwoRequestingAnimation = new (0, _core.WFComponent)("#stepTwoRequestingAnimation");
    const stepThreeRequestingAnimation = new (0, _core.WFComponent)("#stepThreeRequestingAnimation");
    const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
    const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
    const submitStepThreeError = new (0, _core.WFComponent)("#submitStepThreeError");
    await (0, _listProductions.initializeDynamicProductionList)("#selectProductionList");
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        stepOneRequestingAnimation.setStyle({
            display: "block"
        });
        const { selectedProductionId } = loadState();
        if (!selectedProductionId) {
            const errorMessage = "Please select a production.";
            (0, _formUtils.toggleError)(submitStepOneError, errorMessage, true);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        console.log("Selected Production ID:", selectedProductionId);
        try {
            await (0, _listPerformances.initializeDynamicPerformanceList)("#selectPerformanceList");
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            slider.goNext(); // Transition to the next step using the slider
            updateSidebar(slider.getActiveSlideIndex());
        } catch (error) {
            console.error("Error fetching performances:", error);
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            (0, _formUtils.toggleError)(submitStepOneError, "Failed to fetch performances. Please try again.", true);
        }
    });
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        stepTwoRequestingAnimation.setStyle({
            display: "block"
        });
        const { selectedPerformanceId } = loadState();
        if (!selectedPerformanceId) {
            const errorMessage = "Please select a performance.";
            (0, _formUtils.toggleError)(submitStepTwoError, errorMessage, true);
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        console.log("Selected Performance ID:", selectedPerformanceId);
        try {
            const ticketData = await (0, _listTicketTiers.fetchTicketData)();
            const { ticket_tiers, selected_performance } = ticketData;
            // Update selected performance details
            (0, _listTicketTiers.updateSelectedPerformance)(selected_performance);
            // Update the custom question label
            updateCustomQuestionLabel(selected_performance.fieldData["custom-question"]);
            // Initialize the assistance checkbox event
            setupAssistanceCheckbox();
            await (0, _listTicketTiers.initializeDynamicTicketList)("#ticketTierList");
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            slider.goNext(); // Transition to the next step
            updateSidebar(slider.getActiveSlideIndex());
        } catch (error) {
            console.error("Error fetching ticket tiers:", error);
            stepTwoRequestingAnimation.setStyle({
                display: "none"
            });
            (0, _formUtils.toggleError)(submitStepTwoError, "Failed to fetch ticket tiers. Please try again.", true);
        }
    });
    formStepThree.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        stepThreeRequestingAnimation.setStyle({
            display: "block"
        });
        const state = loadState();
        const customQuestion = customQuestionInput.getElement().value;
        const isAssistanceChecked = document.querySelector("#assistanceInput")?.checked;
        const assistanceMessage = document.querySelector("#assistanceMessageInput")?.value;
        if (!customQuestion) {
            (0, _formUtils.toggleError)(customQuestionInputError, "This field is required.", true);
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        if (!user && (!firstNameInput.getElement().value || !lastNameInput.getElement().value || !(0, _validationUtils.validateEmail)(emailInput.getElement().value))) {
            if (!firstNameInput.getElement().value) (0, _formUtils.toggleError)(firstNameInputError, "First name is required.", true);
            if (!lastNameInput.getElement().value) (0, _formUtils.toggleError)(lastNameInputError, "Last name is required.", true);
            if (!(0, _validationUtils.validateEmail)(emailInput.getElement().value)) (0, _formUtils.toggleError)(emailInputError, "Please enter a valid email address.", true);
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        const ticketTiers = state.ticketTiers || {};
        const bundles = state.bundles || {};
        const selectedTicketTiers = Object.values(ticketTiers).reduce((a, b)=>a + b, 0);
        const selectedBundles = Object.values(bundles).reduce((a, b)=>a + b, 0);
        if (selectedTicketTiers === 0 && selectedBundles === 0) {
            (0, _formUtils.toggleError)(submitStepThreeError, "Please select at least one ticket tier or bundle.", true);
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
            return;
        }
        state.customQuestion = customQuestion;
        state.isAssistanceChecked = isAssistanceChecked;
        state.assistanceMessage = assistanceMessage;
        if (user && user.profile && user.email) {
            state.email = user.email;
            state.first_name = user.profile.first_name;
            state.last_name = user.profile.last_name;
        } else {
            state.email = emailInput.getElement().value;
            state.first_name = firstNameInput.getElement().value;
            state.last_name = lastNameInput.getElement().value;
        }
        saveState(state);
        try {
            const response = await (0, _apiConfig.apiClient).post("/tickets/begin_checkout", {
                data: state
            }).fetch();
            if (response && response.checkout_url) window.location.href = response.checkout_url; // Redirect to the checkout URL
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
        } catch (error) {
            console.error("Error during checkout:", error);
            stepThreeRequestingAnimation.setStyle({
                display: "none"
            });
            (0, _formUtils.toggleError)(submitStepThreeError, "Failed to proceed to checkout. Please try again.", true);
        }
    });
    const backButtonStepTwo = new (0, _core.WFComponent)("#backStepTwo");
    const backButtonStepThree = new (0, _core.WFComponent)("#backStepThree");
    backButtonStepTwo.on("click", async ()=>{
        const state = loadState();
        state.selectedPerformanceId = null;
        saveState(state);
        slider.goPrevious(); // Navigate back to the previous step using the slider
        updateSidebar(slider.getActiveSlideIndex());
    });
    backButtonStepThree.on("click", async ()=>{
        const state = loadState();
        state.ticketTiers = null; // Adjust the state as needed
        saveState(state);
        slider.goPrevious(); // Navigate back to the previous step using the slider
        updateSidebar(slider.getActiveSlideIndex());
    });
};
// Initialize URL navigation
navigateToStepFromURL();
// Add an event listener to handle slide changes and update the sidebar
slider.onSlideChange((activeIndex, prevIndex)=>{
    updateSidebar(activeIndex);
    // Trigger success animation for the completed step
    if (prevIndex !== -1 && prevIndex < activeIndex) triggerSuccessAnimation(prevIndex);
    // Reset animation if going back to a previous step
    if (prevIndex !== -1 && prevIndex > activeIndex) triggerSuccessAnimation(activeIndex);
});
// Ensure the sidebar is correctly updated on initialization
updateSidebar(slider.getActiveSlideIndex());

},{"../../components/purchaseTicketsComponents/listProductions":"8NbTT","../../components/purchaseTicketsComponents/listPerformances":"i2JLw","../../components/purchaseTicketsComponents/listTicketTiers":"6tK2o","@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","@xatom/slider":"2zMuG","../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"8NbTT":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchProductions", ()=>fetchProductions);
parcelHelpers.export(exports, "initializeDynamicProductionList", ()=>initializeDynamicProductionList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
// Function to log the current state to localStorage
const logState = (title)=>{
    const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
    state.selectedProductionId = selectedProductionId;
    if (title) state.selectedProductionTitle = title;
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("ticketPurchaseState", JSON.stringify(state));
};
let selectedProductionId = null;
async function fetchProductions() {
    try {
        const response = await (0, _apiConfig.apiClient).get("/tickets/productions").fetch();
        return response.productions;
    } catch (error) {
        console.error("Error fetching productions:", error);
        throw error;
    }
}
// Store the initial template state of the container
let initialTemplateState = null;
async function initializeDynamicProductionList(containerSelector) {
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
        const productionCard = new (0, _core.WFComponent)(rowElement);
        const productionTitle = productionCard.getChildAsComponent("#cardProductionTitle");
        const productionDescription = productionCard.getChildAsComponent("#cardProductionDescription");
        const productionAges = productionCard.getChildAsComponent("#cardProductionAges");
        const productionImage = productionCard.getChildAsComponent("#cardProductionImage");
        const productionInput = productionCard.getChildAsComponent(".input_card_input");
        // Generate unique id for input and associate label
        const inputId = `productionInput-${index}`;
        productionInput.setAttribute("id", inputId);
        productionInput.setAttribute("value", rowData.id);
        const label = productionCard.getChildAsComponent("label");
        label.setAttribute("for", inputId);
        // Safely set the text and attribute values
        if (rowData.fieldData && rowData.fieldData.name) productionTitle.setText(rowData.fieldData.name);
        if (rowData.fieldData && rowData.fieldData["short-description"]) productionDescription.setText(rowData.fieldData["short-description"]);
        if (rowData.fieldData && rowData.fieldData["age-description"]) productionAges.setText(rowData.fieldData["age-description"]);
        if (rowData.fieldData && rowData.fieldData["main-image"] && rowData.fieldData["main-image"].url) productionImage.setAttribute("src", rowData.fieldData["main-image"].url);
        if (rowData.fieldData && rowData.fieldData["main-image"] && rowData.fieldData["main-image"].alt) productionImage.setAttribute("alt", rowData.fieldData["main-image"].alt || "Production Image");
        productionInput.on("change", ()=>{
            const productionTitleText = rowData.fieldData.name;
            selectedProductionId = productionInput.getElement().value;
            // Log and store the current state with the title
            logState(productionTitleText);
            // Log the selected production ID
            console.log("Selected Production ID:", selectedProductionId);
        });
        // Show the list item
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    // Load and display productions
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        const productions = await fetchProductions();
        // Sort productions alphabetically by name
        const sortedProductions = productions.sort((a, b)=>a.fieldData.name.localeCompare(b.fieldData.name));
        list.setData(sortedProductions);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading productions:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"i2JLw":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDynamicPerformanceList", ()=>initializeDynamicPerformanceList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
// Function to log the current state to localStorage
const logState = ()=>{
    const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
    state.selectedPerformanceId = selectedPerformanceId;
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("ticketPurchaseState", JSON.stringify(state));
};
let selectedPerformanceId = null;
let performances = [];
// Function to fetch performances from the server
const fetchPerformances = async ()=>{
    try {
        const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
        const response = await (0, _apiConfig.apiClient).get(`/tickets/performances?production_id=${state.selectedProductionId}`).fetch();
        return response.performances;
    } catch (error) {
        console.error("Error fetching performances:", error);
        throw error;
    }
};
// Function to filter performances by location and month
const filterPerformances = (location, month)=>{
    let filteredPerformances = performances;
    if (location && location !== "N/A") filteredPerformances = filteredPerformances.filter((performance)=>performance.location_name === location);
    if (month && month !== "N/A") filteredPerformances = filteredPerformances.filter((performance)=>{
        const performanceDate = new Date(performance.fieldData["date-time"]);
        const performanceMonth = performanceDate.toLocaleString("en-US", {
            month: "short"
        }).toUpperCase();
        return performanceMonth === month;
    });
    return filteredPerformances;
};
// Function to initialize the location and month filters
const initializeFilters = (list)=>{
    const locationFilter = document.getElementById("locationFilter");
    const monthFilter = document.getElementById("monthFilter");
    const applyFilters = ()=>{
        const selectedLocation = locationFilter ? locationFilter.value : "N/A";
        const selectedMonth = monthFilter ? monthFilter.value : "N/A";
        const filteredPerformances = filterPerformances(selectedLocation, selectedMonth);
        list.setData(filteredPerformances);
    };
    if (locationFilter) locationFilter.addEventListener("change", applyFilters);
    if (monthFilter) monthFilter.addEventListener("change", applyFilters);
};
// Store the initial template state of the container
let initialTemplateState = null;
async function initializeDynamicPerformanceList(containerSelector) {
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
    // Retrieve the stored production title from local storage
    const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
    const selectedProductionTitle = state.selectedProductionTitle;
    // Set the production title in the UI if it exists
    if (selectedProductionTitle) {
        const productionTitleElements = document.querySelectorAll("#cardPerformanceProductionTitle");
        productionTitleElements.forEach((titleElement)=>{
            const productionTitleComponent = new (0, _core.WFComponent)(titleElement);
            productionTitleComponent.setText(selectedProductionTitle);
        });
    }
    // Initialize a new instance of WFDynamicList
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectPerformance",
        loaderSelector: "#performanceListLoading",
        emptySelector: "#performanceListEmpty"
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
        const performanceCard = new (0, _core.WFComponent)(rowElement);
        const performanceTitle = performanceCard.getChildAsComponent("#cardPerformanceTitle");
        const productionTitle = performanceCard.getChildAsComponent("#cardPerformanceProductionTitle");
        const performanceDescription = performanceCard.getChildAsComponent("#cardPerformanceDescription");
        const performanceDay = performanceCard.getChildAsComponent("#cardProductionTitle.is-day");
        const performanceTime = performanceCard.getChildAsComponent("#cardProductionDescription.is-time");
        const performanceDateDay = performanceCard.getChildAsComponent(".u-text-h4");
        const performanceDateMonth = performanceCard.getChildAsComponent(".production_date_month");
        const performanceImage = performanceCard.getChildAsComponent("#cardImage");
        const performanceInput = performanceCard.getChildAsComponent(".input_card_input");
        if (!performanceTitle || !productionTitle || !performanceDescription || !performanceDay || !performanceTime || !performanceDateDay || !performanceDateMonth || !performanceImage || !performanceInput) {
            console.error("One or more elements not found in the performance card");
            return;
        }
        // Generate unique id for input and associate label
        const inputId = `performanceInput-${index}`;
        performanceInput.setAttribute("id", inputId);
        performanceInput.setAttribute("value", rowData.id);
        const label = performanceCard.getChildAsComponent("label");
        if (label) label.setAttribute("for", inputId);
        const date = new Date(rowData.fieldData["date-time"]);
        const dayFormatter = new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            timeZone: "America/New_York"
        });
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/New_York"
        });
        const monthFormatter = new Intl.DateTimeFormat("en-US", {
            month: "short",
            timeZone: "America/New_York"
        });
        const dayOfMonthFormatter = new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            timeZone: "America/New_York"
        });
        const day = dayFormatter.format(date);
        const time = timeFormatter.format(date);
        const month = monthFormatter.format(date);
        const dayOfMonth = dayOfMonthFormatter.format(date);
        performanceTitle.setText(rowData.fieldData["displayed-name"]);
        productionTitle.setText(selectedProductionTitle); // Set the production title from state
        if (rowData.fieldData["short-description"]) performanceDescription.setText(rowData.fieldData["short-description"]);
        else performanceDescription.setText("No description available."); // Default text if no description
        performanceDay.setText(day);
        performanceTime.setText(time);
        performanceDateDay.setText(dayOfMonth);
        performanceDateMonth.setText(month);
        performanceImage.setAttribute("src", rowData.fieldData["main-image"].url);
        performanceImage.setAttribute("alt", rowData.fieldData["main-image"].alt || "Performance Image");
        // Handle performance selection
        performanceInput.on("change", ()=>{
            selectedPerformanceId = performanceInput.getElement().value;
            // Log and store the current state
            logState();
            // Log the selected performance ID
            console.log("Selected Performance ID:", selectedPerformanceId);
        });
        // Show the list item
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    // Load and display the performances
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        // Fetch performances for the given production ID
        performances = await fetchPerformances();
        console.log("Fetched and sorted performances:", performances); // Debug log
        if (performances.length > 0) {
            // Sort performances by date-time
            const sortedPerformances = performances.sort((a, b)=>new Date(a.fieldData["date-time"]).getTime() - new Date(b.fieldData["date-time"]).getTime());
            list.setData(sortedPerformances);
        } else list.setData([]); // Set empty array to trigger the empty state
        // Initialize the filters with the loaded performances
        initializeFilters(list);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading performances:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"6tK2o":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDynamicTicketList", ()=>initializeDynamicTicketList);
parcelHelpers.export(exports, "fetchTicketData", ()=>fetchTicketData);
parcelHelpers.export(exports, "updateSelectedPerformance", ()=>updateSelectedPerformance);
var _apiConfig = require("../../../api/apiConfig");
var _core = require("@xatom/core");
// Function to fetch ticket data from the server
const fetchTicketData = async ()=>{
    try {
        const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
        const response = await (0, _apiConfig.apiClient).post("/tickets/ticket_tiers", {
            data: state
        }).fetch();
        return response;
    } catch (error) {
        console.error("Error fetching ticket data:", error);
        throw error;
    }
};
// Function to update selected performance card
const updateSelectedPerformance = (selectedPerformance)=>{
    const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
    const selectedPerformanceTitle = new (0, _core.WFComponent)("#selectedPerformanceTitle");
    const selectedPerformanceProductionTitle = new (0, _core.WFComponent)("#selectedPerformanceProductionTitle");
    const selectedPerformanceDescription = new (0, _core.WFComponent)("#selectedPerformanceDescription");
    const selectedPerformanceDate = new (0, _core.WFComponent)("#selectedPerformanceDate");
    const selectedPerformanceMonth = new (0, _core.WFComponent)("#selectedPerformanceMonth");
    const selectedWeekday = new (0, _core.WFComponent)("#selectedWeekday");
    const selectedTime = new (0, _core.WFComponent)("#selectedTime");
    const selectedImage = new (0, _core.WFComponent)("#selectedImage");
    // Set performance and production titles
    selectedPerformanceTitle.setText(selectedPerformance?.fieldData?.["name"] || "");
    selectedPerformanceProductionTitle.setText(state.selectedProductionTitle || "");
    // Set description
    selectedPerformanceDescription.setText(selectedPerformance?.fieldData?.["short-description"] || "");
    // Set date-time
    const date = new Date(selectedPerformance?.fieldData?.["date-time"]);
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        timeZone: "America/New_York"
    };
    selectedPerformanceDate.setText(date.getUTCDate().toString());
    selectedPerformanceMonth.setText(date.toLocaleString("en-US", {
        month: "short",
        timeZone: "America/New_York"
    }));
    selectedWeekday.setText(date.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "America/New_York"
    }));
    selectedTime.setText(date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "America/New_York"
    }));
    // Set image if available
    if (selectedPerformance?.fieldData?.["main-image"]) selectedImage.setAttribute("src", selectedPerformance.fieldData["main-image"]["url"]);
};
// Function to log the current state to localStorage
const logState = (state)=>{
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("ticketPurchaseState", JSON.stringify(state));
};
// Function to handle quantity changes
const handleQuantityChange = (quantityInput, increase, maxValue, maximumAvailable, rowData, stateKey)=>{
    let currentValue = parseInt(quantityInput.getElement().value) || 0;
    if (increase) {
        if (currentValue < maxValue) {
            currentValue++;
            maximumAvailable.setStyle({
                display: "none"
            });
        } else maximumAvailable.setStyle({
            display: "block"
        });
    } else if (currentValue > 0) {
        currentValue--;
        maximumAvailable.setStyle({
            display: "none"
        });
    }
    quantityInput.getElement().value = currentValue.toString();
    // Update the state in localStorage
    const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
    state[stateKey] = state[stateKey] || [];
    const itemIndex = state[stateKey].findIndex((item)=>item.id === rowData.id);
    if (itemIndex !== -1) state[stateKey][itemIndex].quantity = currentValue;
    else state[stateKey].push({
        id: rowData.id,
        quantity: currentValue
    });
    logState(state);
};
// Store the initial template state of the containers
let initialTemplateStateTicketTier = null;
let initialTemplateStateBundle = null;
async function initializeDynamicTicketList(sectionSelector) {
    // Ensure the sections exist before initializing the lists
    const section = document.querySelector(sectionSelector);
    if (!section) {
        console.error("Section not found for selector:", sectionSelector);
        return;
    }
    const initializeTicketTierList = async ()=>{
        const container = document.querySelector("#ticketTierList");
        if (!container) {
            console.error("#ticketTierList not found");
            return;
        }
        if (!initialTemplateStateTicketTier) initialTemplateStateTicketTier = container.cloneNode(true);
        container.innerHTML = "";
        container.appendChild(initialTemplateStateTicketTier.cloneNode(true));
    };
    const initializeBundleList = async ()=>{
        const container = document.querySelector("#bundleList");
        if (!container) {
            console.error("#bundleList not found");
            return;
        }
        if (!initialTemplateStateBundle) initialTemplateStateBundle = container.cloneNode(true);
        container.innerHTML = "";
        container.appendChild(initialTemplateStateBundle.cloneNode(true));
    };
    await initializeTicketTierList();
    await initializeBundleList();
    // Initialize WFDynamicList for ticket tiers
    const ticketTierList = new (0, _core.WFDynamicList)("#ticketTierList", {
        rowSelector: "#ticketTierCard",
        loaderSelector: "#ticketTierListLoading",
        emptySelector: "#ticketTierListEmpty"
    });
    // Initialize WFDynamicList for bundles
    const bundleList = new (0, _core.WFDynamicList)("#bundleList", {
        rowSelector: "#bundleCard",
        loaderSelector: "#bundleListLoading",
        emptySelector: "#bundleListEmpty"
    });
    // Customize the rendering of the loader for ticket tiers
    ticketTierList.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    // Customize the rendering of the loader for bundles
    bundleList.loaderRenderer((loaderElement)=>{
        loaderElement.setStyle({
            display: "flex"
        });
        return loaderElement;
    });
    // Customize the rendering of list items for ticket tiers
    ticketTierList.rowRenderer(({ rowData, rowElement, index })=>{
        const ticketTierCard = new (0, _core.WFComponent)(rowElement);
        const ticketTierName = ticketTierCard.getChildAsComponent("#ticketTierName");
        const ticketTierDescription = ticketTierCard.getChildAsComponent("#ticketTierDescription");
        const ticketTierPrice = ticketTierCard.getChildAsComponent("#ticketTierPrice");
        const ticketTierSoldOut = ticketTierCard.getChildAsComponent("#ticketTierSoldOut"); // Sold out element
        const numberInputWrapper = ticketTierCard.getChildAsComponent(".number_input_wrapper");
        const maximumAvailable = ticketTierCard.getChildAsComponent("#maximumAvailable");
        const quantityDecreaseButton = ticketTierCard.getChildAsComponent("#ticketTierQuantityDecrease");
        const quantityIncreaseButton = ticketTierCard.getChildAsComponent("#ticketTierQuantityIncrease");
        const quantityInput = ticketTierCard.getChildAsComponent("#ticketTierQuantityInput");
        ticketTierName.setText(`${rowData.fieldData["displayed-name"]}`);
        ticketTierDescription.setText(rowData.fieldData["short-description"]);
        ticketTierPrice.setText(rowData["displayed-price"]);
        const maxValue = parseInt(rowData["quantity-available"]);
        // Logic to display sold-out element
        if (rowData["sold-out"]) {
            ticketTierSoldOut.setStyle({
                display: "block"
            });
            ticketTierPrice.setStyle({
                display: "none"
            });
            numberInputWrapper.addCssClass("is-disabled");
            quantityInput.setAttribute("disabled", "true");
        } else {
            ticketTierSoldOut.setStyle({
                display: "none"
            });
            numberInputWrapper.removeCssClass("is-disabled");
            quantityInput.removeAttribute("disabled");
        }
        // Add event listeners for quantity buttons
        quantityDecreaseButton.on("click", ()=>{
            handleQuantityChange(quantityInput, false, maxValue, maximumAvailable, rowData, "ticketTiers");
        });
        quantityIncreaseButton.on("click", ()=>{
            handleQuantityChange(quantityInput, true, maxValue, maximumAvailable, rowData, "ticketTiers");
        });
        quantityInput.on("input", ()=>{
            let currentValue = parseInt(quantityInput.getElement().value);
            if (currentValue > maxValue) {
                quantityInput.getElement().value = maxValue.toString();
                maximumAvailable.setStyle({
                    display: "block"
                });
            } else maximumAvailable.setStyle({
                display: "none"
            });
            // Update the state in localStorage
            const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
            state["ticketTiers"] = state["ticketTiers"] || [];
            const itemIndex = state["ticketTiers"].findIndex((item)=>item.id === rowData.id);
            if (itemIndex !== -1) state["ticketTiers"][itemIndex].quantity = currentValue;
            else state["ticketTiers"].push({
                id: rowData.id,
                quantity: currentValue
            });
            logState(state);
        });
        return rowElement;
    });
    // Customize the rendering of list items for bundles
    bundleList.rowRenderer(({ rowData, rowElement, index })=>{
        const bundleCard = new (0, _core.WFComponent)(rowElement);
        const bundleName = bundleCard.getChildAsComponent("#bundleName");
        const bundleDescription = bundleCard.getChildAsComponent("#bundleDescription");
        const bundlePrice = bundleCard.getChildAsComponent("#bundlePrice");
        const bundleSoldOut = bundleCard.getChildAsComponent("#bundleSoldOut"); // Sold out element
        const numberInputWrapper = bundleCard.getChildAsComponent(".number_input_wrapper");
        const maximumAvailable = bundleCard.getChildAsComponent("#maximumAvailable");
        const quantityDecreaseButton = bundleCard.getChildAsComponent("#bundleQuantityDecrease");
        const quantityIncreaseButton = bundleCard.getChildAsComponent("#bundleQuantityIncrease");
        const quantityInput = bundleCard.getChildAsComponent("#bundleQuantityInput");
        bundleName.setText(`${rowData.fieldData["displayed-name"]}`);
        bundleDescription.setText(rowData.fieldData["short-description"]);
        bundlePrice.setText(rowData["displayed-price"]);
        const maxValue = parseInt(rowData["quantity-available"]);
        // Logic to display sold-out element
        if (rowData["sold-out"]) {
            bundleSoldOut.setStyle({
                display: "block"
            });
            bundlePrice.setStyle({
                display: "none"
            });
            numberInputWrapper.addCssClass("is-disabled");
            quantityInput.setAttribute("disabled", "true");
        } else {
            bundleSoldOut.setStyle({
                display: "none"
            });
            numberInputWrapper.removeCssClass("is-disabled");
            quantityInput.removeAttribute("disabled");
        }
        // Add event listeners for quantity buttons
        quantityDecreaseButton.on("click", ()=>{
            handleQuantityChange(quantityInput, false, maxValue, maximumAvailable, rowData, "bundles");
        });
        quantityIncreaseButton.on("click", ()=>{
            handleQuantityChange(quantityInput, true, maxValue, maximumAvailable, rowData, "bundles");
        });
        quantityInput.on("input", ()=>{
            let currentValue = parseInt(quantityInput.getElement().value);
            if (currentValue > maxValue) {
                quantityInput.getElement().value = maxValue.toString();
                maximumAvailable.setStyle({
                    display: "block"
                });
            } else maximumAvailable.setStyle({
                display: "none"
            });
            // Update the state in localStorage
            const state = JSON.parse(localStorage.getItem("ticketPurchaseState") || "{}");
            state["bundles"] = state["bundles"] || [];
            const itemIndex = state["bundles"].findIndex((item)=>item.id === rowData.id);
            if (itemIndex !== -1) state["bundles"][itemIndex].quantity = currentValue;
            else state["bundles"].push({
                id: rowData.id,
                quantity: currentValue
            });
            logState(state);
        });
        return rowElement;
    });
    // Load and display ticket tiers and bundles
    try {
        // Enable the loading state
        ticketTierList.changeLoadingStatus(true);
        bundleList.changeLoadingStatus(true);
        const data = await fetchTicketData();
        const { ticket_tiers, bundles, selected_performance } = data;
        // Update selected performance details
        updateSelectedPerformance(selected_performance);
        ticketTierList.setData(ticket_tiers);
        bundleList.setData(bundles);
        // Disable the loading state
        ticketTierList.changeLoadingStatus(false);
        bundleList.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading ticket tiers and bundles:", error);
        // If there's an error, set an empty array to trigger the empty state
        ticketTierList.setData([]);
        bundleList.setData([]);
        // Disable the loading state
        ticketTierList.changeLoadingStatus(false);
        bundleList.changeLoadingStatus(false);
    }
}

},{"../../../api/apiConfig":"2Lx0S","@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2zMuG":[function(require,module,exports) {
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

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}]},[], null, "parcelRequired346")

//# sourceMappingURL=purchaseTickets.003ada1d.js.map
