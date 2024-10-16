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
})({"97QTs":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeDonation", ()=>makeDonation);
var _core = require("@xatom/core");
var _campaignList = require("./campaignList");
var _campaignProductList = require("./campaignProductList");
var _donationState = require("./state/donationState");
var _selectedCampaignDisplay = require("./components/selectedCampaignDisplay");
var _slider = require("@xatom/slider");
var _userContactDetails = require("./components/userContactDetails");
var _validationUtils = require("../../utils/validationUtils");
var _apiConfig = require("../../api/apiConfig");
var _sidebarIndicators = require("./components/sidebarIndicators");
var _urlParamNavigator = require("./components/urlParamNavigator");
var _authConfig = require("../../auth/authConfig");
const makeDonation = async ()=>{
    // Clear selected campaign and product on load to ensure a fresh start
    (0, _donationState.clearDonationState)();
    (0, _sidebarIndicators.initializeSidebarIndicators)(); // Initialize sidebar indicators
    (0, _sidebarIndicators.setActiveStep)(1);
    // Initialize the slider component
    const slider = new (0, _slider.WFSlider)(".multi-step_form_slider");
    (0, _urlParamNavigator.initializeStateFromUrlParams)(slider);
    // Initialize campaign list
    await (0, _campaignList.initializeCampaignList)("#selectCampaignList");
    // Initialize user contact details
    (0, _userContactDetails.initializeUserContactDetails)();
    // Handle form submission for campaign selection
    const formStepOne = new (0, _core.WFFormComponent)("#formStepOne");
    formStepOne.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        const selectedCampaign = (0, _donationState.getSelectedCampaign)();
        if (!selectedCampaign || !selectedCampaign.id) {
            console.error("No campaign selected.");
            const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
            submitStepOneError.setText("Please select a campaign.");
            submitStepOneError.setStyle({
                display: "block"
            });
            return;
        }
        console.log("Campaign selected:", selectedCampaign);
        // Show loading animation
        const stepOneRequestingAnimation = new (0, _core.WFComponent)("#stepOneRequestingAnimation");
        stepOneRequestingAnimation.setStyle({
            display: "block"
        });
        try {
            // Initialize product list based on the selected campaign
            await (0, _campaignProductList.initializeDynamicProductList)("#selectProductList", selectedCampaign.id);
            // Update selected campaign display
            (0, _selectedCampaignDisplay.updateSelectedCampaignDisplay)();
            // Hide loading animation
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            // Mark step one as completed and proceed to the next step
            (0, _sidebarIndicators.markStepAsCompleted)(1);
            (0, _sidebarIndicators.setActiveStep)(2);
            slider.goNext();
        } catch (error) {
            console.error("Error loading products:", error);
            // Hide loading animation and show error message
            stepOneRequestingAnimation.setStyle({
                display: "none"
            });
            const submitStepOneError = new (0, _core.WFComponent)("#submitStepOneError");
            submitStepOneError.setText("Error loading products. Please try again.");
            submitStepOneError.setStyle({
                display: "block"
            });
        }
    });
    // Handle step 2 interactions
    const formStepTwo = new (0, _core.WFFormComponent)("#formStepTwo");
    formStepTwo.onFormSubmit(async (formData, event)=>{
        event.preventDefault();
        const selectedProduct = (0, _donationState.getSelectedProduct)();
        if (!selectedProduct || !selectedProduct.id) {
            console.error("No product selected.");
            const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
            submitStepTwoError.setText("Please select a product.");
            submitStepTwoError.setStyle({
                display: "block"
            });
            return;
        }
        // Get user email from authentication state if logged in
        const user = (0, _authConfig.userAuth).getUser();
        const userEmail = user && user.email ? user.email : null;
        // Validate user contact details if emailWrap is displayed
        const emailWrap = document.getElementById("emailWrap");
        let hasErrors = false;
        let email = userEmail;
        if (emailWrap && emailWrap.style.display !== "none") {
            const firstNameInput = document.getElementById("firstNameInput");
            const lastNameInput = document.getElementById("lastNameInput");
            const emailInput = document.getElementById("emailInput");
            const firstNameError = !(0, _validationUtils.validateNotEmpty)(firstNameInput.value);
            const lastNameError = !(0, _validationUtils.validateNotEmpty)(lastNameInput.value);
            const emailError = !(0, _validationUtils.validateEmail)(emailInput.value);
            if (firstNameError || lastNameError || emailError) {
                hasErrors = true;
                console.error("Invalid input in contact details.");
                if (firstNameError) {
                    const firstNameInputError = new (0, _core.WFComponent)("#firstNameInputError");
                    firstNameInputError.setText("First name is required.");
                    firstNameInputError.setStyle({
                        display: "block"
                    });
                }
                if (lastNameError) {
                    const lastNameInputError = new (0, _core.WFComponent)("#lastNameInputError");
                    lastNameInputError.setText("Last name is required.");
                    lastNameInputError.setStyle({
                        display: "block"
                    });
                }
                if (emailError) {
                    const emailInputError = new (0, _core.WFComponent)("#emailInputError");
                    emailInputError.setText("A valid email address is required.");
                    emailInputError.setStyle({
                        display: "block"
                    });
                }
                // Display general error message
                const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
                submitStepTwoError.setText("Please correct the errors above.");
                submitStepTwoError.setStyle({
                    display: "block"
                });
                return;
            }
            // If validation passes and the user is not logged in, save contact details
            if (!userEmail) email = emailInput.value;
            const isAnonymous = document.getElementById("anonymousInput").checked;
            (0, _donationState.saveDonorDetails)({
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: email,
                isAnonymous
            });
        } else {
            // Handle anonymous input and email when the user is logged in
            const isAnonymous = document.getElementById("anonymousInput").checked;
            (0, _donationState.saveDonorDetails)({
                firstName: user ? user.profile.first_name : "",
                lastName: user ? user.profile.last_name : "",
                email: userEmail || "",
                isAnonymous
            });
        }
        if (!hasErrors) {
            console.log("Product selected:", selectedProduct);
            // Show loading animation
            const stepTwoRequestingAnimation = new (0, _core.WFComponent)("#stepTwoRequestingAnimation");
            stepTwoRequestingAnimation.setStyle({
                display: "block"
            });
            // Submit the donation state to the server
            try {
                const donationState = (0, _donationState.loadDonationState)();
                const response = await (0, _apiConfig.apiClient).post("/donate/begin_checkout", {
                    data: donationState
                }).fetch();
                // Hide loading animation
                stepTwoRequestingAnimation.setStyle({
                    display: "none"
                });
                // Navigate to the checkout URL
                window.location.href = response.checkout_url;
            } catch (error) {
                console.error("Error during checkout:", error);
                // Hide loading animation
                stepTwoRequestingAnimation.setStyle({
                    display: "none"
                });
                const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
                submitStepTwoError.setText("An error occurred during checkout. Please try again.");
                submitStepTwoError.setStyle({
                    display: "block"
                });
            }
        }
    });
    // Initialize components for UI interactions
    const backStepTwoButton = new (0, _core.WFComponent)("#backStepTwo");
    backStepTwoButton.on("click", ()=>{
        console.log("Navigating to the previous step.");
        (0, _sidebarIndicators.unmarkStepAsCompleted)(1); // Unmark the second step if going back
        (0, _sidebarIndicators.setActiveStep)(1); // Set the first step as active
        (0, _sidebarIndicators.unsetActiveStep)(2); // Unset the second step as active
        slider.goPrevious();
    });
    const submitStepTwoButton = new (0, _core.WFComponent)("#submitStepTwo");
    submitStepTwoButton.on("click", ()=>{
        console.log("Submitting the second step.");
    });
    // Clear general error when inputs are interacted with
    const clearSubmitStepTwoError = ()=>{
        const submitStepTwoError = new (0, _core.WFComponent)("#submitStepTwoError");
        submitStepTwoError.setText("");
        submitStepTwoError.setStyle({
            display: "none"
        });
    };
    const firstNameInput = document.getElementById("firstNameInput");
    const lastNameInput = document.getElementById("lastNameInput");
    const emailInput = document.getElementById("emailInput");
    if (firstNameInput && lastNameInput && emailInput) {
        firstNameInput.addEventListener("focus", clearSubmitStepTwoError);
        lastNameInput.addEventListener("focus", clearSubmitStepTwoError);
        emailInput.addEventListener("focus", clearSubmitStepTwoError);
    }
};

},{"@xatom/core":"j9zXV","./campaignList":"sFBhR","./campaignProductList":"7c5m4","./state/donationState":"7phrM","./components/selectedCampaignDisplay":"clUaj","@xatom/slider":"2zMuG","./components/userContactDetails":"aHb49","../../utils/validationUtils":"dMBjH","../../api/apiConfig":"2Lx0S","./components/sidebarIndicators":"9VGNO","./components/urlParamNavigator":"dCQX5","../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"sFBhR":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeCampaignList", ()=>initializeCampaignList);
var _core = require("@xatom/core");
var _campaigns = require("../../api/campaigns");
var _donationState = require("./state/donationState");
let selectedCampaignId = null;
// Function to log the current state to localStorage
const logState = ()=>{
    const state = JSON.parse(localStorage.getItem("donationState") || "{}");
    state.selectedCampaignId = selectedCampaignId;
    console.log("Logging state to localStorage:", state);
    localStorage.setItem("donationState", JSON.stringify(state));
};
// Store the initial template state of the container
let initialTemplateState = null;
const initializeCampaignList = async (containerSelector)=>{
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Campaign list container not found.");
        return [];
    }
    // Capture the initial template state if not already captured
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    // Clear the existing list by resetting the container to its initial state
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
    // Placeholder for storing campaigns data
    let campaigns = [];
    list.rowRenderer(({ rowData, rowElement, index })=>{
        const campaignCard = new (0, _core.WFComponent)(rowElement);
        const campaignTitle = campaignCard.getChildAsComponent("#cardCampaignTitle");
        const campaignSubheading = campaignCard.getChildAsComponent("#cardCampaignSubheading");
        const campaignDescription = campaignCard.getChildAsComponent("#cardCampaignDescription");
        const campaignImage = campaignCard.getChildAsComponent("#cardCampaignImage");
        const campaignInput = campaignCard.getChildAsComponent(".input_card_input");
        const campaignLabel = campaignCard.getChildAsComponent("label");
        if (!campaignTitle || !campaignSubheading || !campaignDescription || !campaignInput || !campaignImage || !campaignLabel) {
            console.error("Campaign elements not found.");
            return;
        }
        if (rowData && rowData.fieldData) {
            const inputId = `campaignInput-${index}`;
            campaignInput.setAttribute("id", inputId);
            campaignInput.setAttribute("value", rowData.id);
            campaignLabel.setAttribute("for", inputId); // Ensure label 'for' attribute matches the input 'id'
            campaignTitle.setText(rowData.fieldData.name);
            campaignSubheading.setText(rowData.fieldData.subheading);
            campaignDescription.setText(rowData.fieldData["short-description"]);
            if (rowData.fieldData["main-image"]?.url) campaignImage.setAttribute("src", rowData.fieldData["main-image"].url);
            else console.warn(`Campaign ID ${rowData.id} does not have a main image.`);
            campaignInput.on("change", ()=>{
                selectedCampaignId = campaignInput.getElement().value;
                (0, _donationState.saveSelectedCampaign)({
                    id: rowData.id,
                    name: rowData.fieldData.name,
                    imageUrl: rowData.fieldData["main-image"].url,
                    description: rowData.fieldData["short-description"],
                    subheading: rowData.fieldData.subheading
                });
                logState();
                console.log("Selected Campaign ID:", selectedCampaignId);
            });
            rowElement.setStyle({
                display: "flex"
            });
            campaigns.push(rowData); // Add campaign data to the array
        } else console.error("Incomplete campaign data:", rowData);
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        campaigns = await (0, _campaigns.fetchCampaigns)(); // Fetch and store campaigns
        console.log("Fetched campaigns:", campaigns); // Debug log
        if (campaigns.length > 0) list.setData(campaigns);
        else list.setData([]); // Set empty array to trigger the empty state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading campaigns:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
    }
    return campaigns; // Return the fetched campaigns
};

},{"@xatom/core":"j9zXV","../../api/campaigns":"7BTc1","./state/donationState":"7phrM","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7BTc1":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchCampaigns", ()=>fetchCampaigns);
var _apiConfig = require("./apiConfig");
const fetchCampaigns = async ()=>{
    try {
        const response = await (0, _apiConfig.apiClient).get("/donate/campaigns").fetch();
        return response.campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
    }
};

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7phrM":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadDonationState", ()=>loadDonationState);
parcelHelpers.export(exports, "saveDonationState", ()=>saveDonationState);
parcelHelpers.export(exports, "clearDonationState", ()=>clearDonationState);
parcelHelpers.export(exports, "getSelectedCampaign", ()=>getSelectedCampaign);
parcelHelpers.export(exports, "saveSelectedCampaign", ()=>saveSelectedCampaign);
parcelHelpers.export(exports, "getSelectedProduct", ()=>getSelectedProduct);
parcelHelpers.export(exports, "saveSelectedProduct", ()=>saveSelectedProduct);
parcelHelpers.export(exports, "getDonorDetails", ()=>getDonorDetails);
parcelHelpers.export(exports, "saveDonorDetails", ()=>saveDonorDetails);
const DONATION_STATE_KEY = "donationState";
const loadDonationState = ()=>{
    const savedState = localStorage.getItem(DONATION_STATE_KEY);
    return savedState ? JSON.parse(savedState) : {};
};
const saveDonationState = (state)=>{
    const currentState = loadDonationState();
    const newState = {
        ...currentState,
        ...state
    };
    localStorage.setItem(DONATION_STATE_KEY, JSON.stringify(newState));
};
const clearDonationState = ()=>{
    localStorage.removeItem(DONATION_STATE_KEY);
};
const getSelectedCampaign = ()=>{
    const state = loadDonationState();
    return {
        id: state.selectedCampaignId || null,
        name: state.selectedCampaignName || null,
        imageUrl: state.selectedCampaignImageUrl || null,
        description: state.selectedCampaignDescription || null,
        subheading: state.selectedCampaignSubheading || null
    };
};
const saveSelectedCampaign = (campaign)=>{
    saveDonationState({
        selectedCampaignId: campaign.id,
        selectedCampaignName: campaign.name,
        selectedCampaignImageUrl: campaign.imageUrl,
        selectedCampaignDescription: campaign.description,
        selectedCampaignSubheading: campaign.subheading
    });
};
const getSelectedProduct = ()=>{
    const state = loadDonationState();
    return {
        id: state.selectedProductId || null,
        name: state.selectedProductName || null,
        amount: state.selectedProductAmount || null
    };
};
const saveSelectedProduct = (product)=>{
    saveDonationState({
        selectedProductId: product.id,
        selectedProductName: product.name,
        selectedProductAmount: product.amount
    });
};
const getDonorDetails = ()=>{
    const state = loadDonationState();
    return {
        email: state.email || null,
        firstName: state.firstName || null,
        lastName: state.lastName || null,
        isAnonymous: state.isAnonymous || false
    };
};
const saveDonorDetails = (donor)=>{
    saveDonationState({
        email: donor.email,
        firstName: donor.firstName,
        lastName: donor.lastName,
        isAnonymous: donor.isAnonymous
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7c5m4":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeDynamicProductList", ()=>initializeDynamicProductList);
var _core = require("@xatom/core");
var _campaignProducts = require("../../api/campaignProducts");
var _donationState = require("./state/donationState");
let selectedProductId = null;
// Store the initial template state of the container
let initialTemplateState = null;
const initializeDynamicProductList = async (containerSelector, campaignId)=>{
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error("Product list container not found.");
        return;
    }
    if (!initialTemplateState) initialTemplateState = container.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#cardSelectProduct"
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
        const productCard = new (0, _core.WFComponent)(rowElement);
        const productTitle = productCard.getChildAsComponent("#cardProductTitle");
        const productInput = productCard.getChildAsComponent(".input_card_input");
        if (!productTitle || !productInput) {
            console.error("One or more elements not found in the product card");
            return;
        }
        const inputId = `productInput-${index}`;
        productInput.setAttribute("id", inputId);
        productInput.setAttribute("value", rowData.id);
        const label = productCard.getChildAsComponent("label");
        if (label) label.setAttribute("for", inputId);
        productTitle.setText(rowData.fieldData["product-name"]);
        productInput.on("change", ()=>{
            selectedProductId = productInput.getElement().value;
            (0, _donationState.saveSelectedProduct)({
                id: rowData.id,
                name: rowData.fieldData["product-name"],
                amount: rowData.fieldData.price
            });
            console.log("Selected Product ID:", selectedProductId);
        });
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        const products = await (0, _campaignProducts.fetchProducts)(campaignId);
        console.log("Fetched products:", products);
        if (products.length > 0) list.setData(products);
        else list.setData([]); // Set empty array to trigger the empty state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading products:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
    }
};

},{"@xatom/core":"j9zXV","../../api/campaignProducts":"kf8aM","./state/donationState":"7phrM","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"kf8aM":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchProducts", ()=>fetchProducts);
var _apiConfig = require("./apiConfig");
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

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"clUaj":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateSelectedCampaignDisplay", ()=>updateSelectedCampaignDisplay);
var _core = require("@xatom/core");
var _donationState = require("../state/donationState");
const updateSelectedCampaignDisplay = ()=>{
    const selectedCampaign = (0, _donationState.getSelectedCampaign)();
    if (!selectedCampaign) {
        console.error("No selected campaign found in the state.");
        return;
    }
    const { name, subheading, description, imageUrl } = selectedCampaign;
    // Ensure all necessary elements exist before updating them
    const selectedCampaignTitle = new (0, _core.WFComponent)("#selectedCampaignTitle");
    const selectedCampaignSubtitle = new (0, _core.WFComponent)("#selectedCampaignSubtitle");
    const selectedCampaignDescription = new (0, _core.WFComponent)("#selectedCampaignDescription");
    const selectedImage = new (0, _core.WFComponent)("#selectedImage");
    // Update the campaign details
    selectedCampaignTitle.setText(name || "N/A");
    selectedCampaignSubtitle.setText(subheading || "No subheading available.");
    selectedCampaignDescription.setText(description || "No description available.");
    if (imageUrl) selectedImage.setAttribute("src", imageUrl);
    else selectedImage.setAttribute("src", "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
};

},{"@xatom/core":"j9zXV","../state/donationState":"7phrM","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2zMuG":[function(require,module,exports) {
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

},{"1a87f3bc23b90fa3":"j9zXV","37b5fd8189a9f4c7":"2VHRI"}],"aHb49":[function(require,module,exports) {
// userContactDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeUserContactDetails", ()=>initializeUserContactDetails);
var _core = require("@xatom/core");
var _validationUtils = require("../../../utils/validationUtils");
var _formUtils = require("../../../utils/formUtils");
var _donationState = require("../state/donationState");
var _authConfig = require("../../../auth/authConfig");
const initializeUserContactDetails = ()=>{
    // Elements
    const firstNameInput = new (0, _core.WFComponent)("#firstNameInput");
    const lastNameInput = new (0, _core.WFComponent)("#lastNameInput");
    const emailInput = new (0, _core.WFComponent)("#emailInput");
    const firstNameInputError = new (0, _core.WFComponent)("#firstNameInputError");
    const lastNameInputError = new (0, _core.WFComponent)("#lastNameInputError");
    const emailInputError = new (0, _core.WFComponent)("#emailInputError");
    const emailWrap = new (0, _core.WFComponent)("#emailWrap");
    // Check if user is authenticated and hide email field if so
    const user = (0, _authConfig.userAuth).getUser();
    if (user && user.email) {
        emailWrap.setStyle({
            display: "none"
        });
        (0, _donationState.saveDonationState)({
            email: user.email
        });
    } else {
        emailWrap.setStyle({
            display: "grid"
        });
        // Setup validation for email field
        (0, _formUtils.setupValidation)(emailInput, emailInputError, createValidationFunction(emailInput, (0, _validationUtils.validateEmail), "Invalid email address."));
    }
    // Setup validation for first name and last name fields
    (0, _formUtils.setupValidation)(firstNameInput, firstNameInputError, createValidationFunction(firstNameInput, (0, _validationUtils.validateNotEmpty), "First name is required."));
    (0, _formUtils.setupValidation)(lastNameInput, lastNameInputError, createValidationFunction(lastNameInput, (0, _validationUtils.validateNotEmpty), "Last name is required."));
    // Save input data to state
    firstNameInput.on("input", ()=>{
        const firstName = firstNameInput.getElement().value;
        (0, _donationState.saveDonationState)({
            firstName
        });
    });
    lastNameInput.on("input", ()=>{
        const lastName = lastNameInput.getElement().value;
        (0, _donationState.saveDonationState)({
            lastName
        });
    });
    emailInput.on("input", ()=>{
        const email = emailInput.getElement().value;
        (0, _donationState.saveDonationState)({
            email
        });
    });
};
// Utility function for validation
function createValidationFunction(inputComponent, validationFn, errorMessage) {
    return ()=>{
        const inputElement = inputComponent.getElement();
        const isValid = validationFn(inputElement.value);
        return isValid ? "" : errorMessage;
    };
}

},{"@xatom/core":"j9zXV","../../../utils/validationUtils":"dMBjH","../../../utils/formUtils":"hvg7i","../state/donationState":"7phrM","../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dMBjH":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"9VGNO":[function(require,module,exports) {
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
        3: "sidebarStepThree"
    };
    return stepMap[stepNumber] || `sidebarStep${stepNumber}`;
};

},{"@xatom/core":"j9zXV","../../../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dCQX5":[function(require,module,exports) {
// src/navigation/urlParamNavigator.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeStateFromUrlParams", ()=>initializeStateFromUrlParams);
var _donationState = require("../state/donationState");
var _campaignList = require("../campaignList");
var _campaignProductList = require("../campaignProductList");
var _sidebarIndicators = require("../components/sidebarIndicators");
var _core = require("@xatom/core");
var _selectedCampaignDisplay = require("../components/selectedCampaignDisplay"); // Import updateSelectedCampaignDisplay
var _apiConfig = require("../../../api/apiConfig"); // Import apiClient
// Function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const campaignId = params.get("campaign");
    const cancelId = params.get("cancel"); // Extract 'cancel' parameter
    return {
        campaignId,
        cancelId
    };
};
// Placeholder functions for user feedback
const displayErrorMessage = (message)=>{
// Implement your error display logic here
// Example: Use a toast notification system
// toast.error(message);
};
const displaySuccessMessage = (message)=>{
// Implement your success display logic here
// Example: Use a toast notification system
// toast.success(message);
};
const initializeStateFromUrlParams = async (slider)=>{
    const { campaignId, cancelId } = getUrlParams();
    (0, _sidebarIndicators.initializeSidebarIndicators)(); // Initialize sidebar indicators
    const loadingWall = new (0, _core.WFComponent)(".loading_wall");
    const animationDuration = 500; // Duration in milliseconds matching the CSS transition time
    // Check if any relevant URL parameters are present
    if (campaignId || cancelId) {
        // Show the loading wall
        loadingWall.setStyle({
            display: "flex"
        });
        try {
            // Handle cancellation if 'cancel' parameter is present
            if (cancelId) {
                // Create the DELETE request using apiClient
                const deleteDonation = (0, _apiConfig.apiClient).delete(`/donate/cancel_donation/${cancelId}`);
                // Set up listeners for the DELETE request
                await new Promise((resolve, reject)=>{
                    deleteDonation.onData(()=>{
                        console.log(`Donation ${cancelId} canceled successfully`);
                        // Optional: Remove 'cancel' parameter from the URL to prevent repeated cancellations
                        const params = new URLSearchParams(window.location.search);
                        params.delete("cancel");
                        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
                        window.history.replaceState({}, document.title, newUrl);
                        // Provide user feedback
                        displaySuccessMessage("Your donation has been successfully canceled.");
                        resolve(); // Resolve the promise on successful deletion
                    });
                    deleteDonation.onError((error)=>{
                        console.error(`Failed to cancel donation ${cancelId}:`, error);
                        // Provide user feedback
                        displayErrorMessage("Failed to cancel your donation. Please try again later.");
                        reject(error); // Reject the promise on error
                    });
                    // Initiate the DELETE request
                    deleteDonation.fetch();
                });
            }
            // Proceed with campaign initialization if 'campaignId' is present
            if (campaignId) {
                // Clear any previous donation state
                (0, _donationState.clearDonationState)();
                // Initialize the campaign list
                const campaigns = await (0, _campaignList.initializeCampaignList)("#selectCampaignList");
                // Find and select the campaign based on the URL parameter
                const selectedCampaign = campaigns.find((campaign)=>campaign.id === campaignId);
                if (selectedCampaign) {
                    (0, _donationState.saveSelectedCampaign)({
                        id: selectedCampaign.id,
                        name: selectedCampaign.fieldData.name,
                        imageUrl: selectedCampaign.fieldData["main-image"].url,
                        description: selectedCampaign.fieldData["short-description"],
                        subheading: selectedCampaign.fieldData.subheading
                    });
                    (0, _sidebarIndicators.markStepAsCompleted)(1);
                    (0, _sidebarIndicators.setActiveStep)(2);
                    // Update the UI with the selected campaign details
                    (0, _selectedCampaignDisplay.updateSelectedCampaignDisplay)(); // Call this function to update the display
                    // Select the campaign in the UI
                    const campaignComponent = document.querySelector(`input[value="${campaignId}"]`);
                    if (campaignComponent) {
                        campaignComponent.checked = true;
                        campaignComponent.dispatchEvent(new Event("change"));
                    }
                    // Initialize the product list for the selected campaign
                    await (0, _campaignProductList.initializeDynamicProductList)("#selectProductList", campaignId);
                    slider.goToIndex(1); // Navigate to the next step in the form
                } else {
                    console.error(`Campaign with ID ${campaignId} not found`);
                    displayErrorMessage("Selected campaign not found. Please choose a valid campaign.");
                    slider.goToIndex(0); // Navigate to the campaign selection slide
                }
            }
        } catch (error) {
            console.error("Error initializing state from URL parameters:", error);
            displayErrorMessage("An error occurred while initializing. Please try again.");
            slider.goToIndex(0); // Navigate to the campaign selection slide on error
        } finally{
            // Hide the loading wall after completing all initializations
            loadingWall.addCssClass("hidden");
            setTimeout(()=>loadingWall.setStyle({
                    display: "none"
                }), animationDuration);
        }
    }
};

},{"../state/donationState":"7phrM","../campaignList":"sFBhR","../campaignProductList":"7c5m4","../components/sidebarIndicators":"9VGNO","@xatom/core":"j9zXV","../components/selectedCampaignDisplay":"clUaj","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=makeDonation.c72775dd.js.map
