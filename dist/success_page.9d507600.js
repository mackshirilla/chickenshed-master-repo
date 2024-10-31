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
})({"dfuG7":[function(require,module,exports) {
// src/success_page/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeSuccessPage", ()=>initializeSuccessPage);
var _registrationSuccess = require("./registration_success");
var _ticketSuccess = require("./ticket_success");
var _donationSuccess = require("./donation_success");
// Utility function to check URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    return {
        isRegistration: params.has("registration"),
        isTicketPurchase: params.has("ticket_purchase"),
        isDonationSuccessful: params.has("donation_successful")
    };
};
// Function to clear localStorage except specified keys
const clearLocalStorageExcept = (exceptions)=>{
    const keysToRemove = [];
    for(let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if (key && !exceptions.includes(key)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key)=>{
        localStorage.removeItem(key);
    });
};
const initializeSuccessPage = ()=>{
    console.log("Initializing success page");
    // Clear localStorage except for auth_config, auth_role, auth_user
    clearLocalStorageExcept([
        "auth_config",
        "auth_role",
        "auth_user"
    ]);
    // Extract URL parameters
    const { isRegistration, isTicketPurchase, isDonationSuccessful } = getUrlParams();
    // Trigger registration success if appropriate parameter is present
    if (isRegistration) {
        console.log("Handling registration success");
        (0, _registrationSuccess.handleRegistrationSuccess)();
    }
    // Trigger ticket success if appropriate parameter is present
    if (isTicketPurchase) {
        console.log("Handling ticket success");
        (0, _ticketSuccess.handleTicketSuccess)();
    }
    // Trigger donation success if appropriate parameter is present
    if (isDonationSuccessful) {
        console.log("Handling donation success");
        (0, _donationSuccess.handleDonationSuccess)();
    } else console.warn("Donation success parameters not found in the URL. Please check your link and try again.");
};

},{"./registration_success":"7ajQx","./ticket_success":"a84l7","./donation_success":"3zhvz","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"7ajQx":[function(require,module,exports) {
// src/success_page/registration_success.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "handleRegistrationSuccess", ()=>handleRegistrationSuccess);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
// Define a RegistrationCard component to manage the registration card DOM
class RegistrationCard {
    constructor(cardId){
        const cardElement = document.getElementById(cardId);
        if (!cardElement) throw new Error(`Element with id '${cardId}' not found.`);
        // Since #registrationCard is the link element, initialize it accordingly
        this.card = new (0, _core.WFComponent)(cardElement);
        // Initialize child elements within the link
        // Assuming that these elements are nested inside the <a id="registrationCard">
        this.image = new (0, _image.WFImage)(this.card.getChildAsComponent("#cardRegistrationImage").getElement());
        this.programName = this.card.getChildAsComponent("#cardProgramName");
        this.workshopName = this.card.getChildAsComponent("#cardWorkshopName");
        this.subscriptionType = this.card.getChildAsComponent("#cardSubscriptionType");
        this.invoiceDate = this.card.getChildAsComponent("#cardInvoiceDate");
        this.activePill = this.card.getChildAsComponent("#cardActivePill");
        this.depositPill = this.card.getChildAsComponent("#cardDepositPill");
        this.successMessage = new (0, _core.WFComponent)("#successMessage"); // Initialize success message
        // Initialize programId to an empty string
        this.programId = "";
        // Log if any essential child elements are missing
        if (!this.programName) console.warn("Element with id 'cardProgramName' not found within the registration card.");
        if (!this.workshopName) console.warn("Element with id 'cardWorkshopName' not found within the registration card.");
        if (!this.subscriptionType) console.warn("Element with id 'cardSubscriptionType' not found within the registration card.");
        if (!this.invoiceDate) console.warn("Element with id 'cardInvoiceDate' not found within the registration card.");
        if (!this.activePill) console.warn("Element with id 'cardActivePill' not found within the registration card.");
        if (!this.depositPill) console.warn("Element with id 'cardDepositPill' not found within the registration card.");
        if (!this.image) console.warn("Element with id 'cardRegistrationImage' not found within the registration card.");
        if (!this.successMessage) console.warn("Element with id 'successMessage' not found on the page.");
    }
    // Method to populate the registration card with data
    populate(data) {
        console.log("Populating registration card with data.");
        // Set Program ID
        this.programId = data.program_id;
        console.log("Program ID set to:", this.programId);
        // Set Program Name
        this.programName.setText(data.program_name);
        console.log("Set programName:", data.program_name);
        // Set Workshop Name
        this.workshopName.setText(data.workshop_name);
        console.log("Set workshopName:", data.workshop_name);
        // Set Subscription Type
        this.subscriptionType.setText(data.subscription_type);
        console.log("Set subscriptionType:", data.subscription_type);
        // Set Next Invoice Date
        const formattedDate = data.next_charge_date ? new Date(data.next_charge_date).toLocaleDateString() : "Upon Student Approval";
        this.invoiceDate.setText(formattedDate);
        console.log("Set invoiceDate:", formattedDate);
        // Determine source for image and success message
        const source = data.workshop ? data.workshop.fieldData : data.program.response.result.fieldData;
        // Set Registration Image
        if (source["main-image"].url) {
            this.image.setImage(source["main-image"].url);
            const imgElement = this.image.getElement();
            imgElement.alt = source["main-image"].alt || "Workshop Image";
            console.log("Set registration image URL and alt text.");
        }
        // Set Success Message
        if (source["success-page-message"]) {
            this.successMessage.setHTML(source["success-page-message"]);
            const successMessageElement = this.successMessage.getElement();
            successMessageElement.style.display = "block";
            console.log("Set and displayed success message.");
        }
        // Determine which status pill to display
        const status = data.status.toLowerCase();
        if (status === "active") {
            this.activePill.setText("Active");
            this.activePill.getElement().style.display = "block";
            this.depositPill.getElement().style.display = "none";
            console.log("Displayed Active pill.");
        } else if (status === "deposit paid") {
            this.depositPill.setText("Deposit Paid");
            this.depositPill.getElement().style.display = "block";
            this.activePill.getElement().style.display = "none";
            console.log("Displayed Deposit Paid pill.");
        } else {
            // Hide both pills if status doesn't match expected values
            this.activePill.getElement().style.display = "none";
            this.depositPill.getElement().style.display = "none";
            console.log("Hid both status pills.");
        }
        // Add the `program` parameter to the registration card link
        this.updateRegistrationLink();
    }
    // Method to update the registration link with the program parameter
    updateRegistrationLink() {
        // Since #registrationCard is the link element, manipulate its href directly
        const registrationLinkElement = this.card.getElement();
        if (!registrationLinkElement) {
            console.warn("registrationCard element is not an anchor element.");
            return;
        }
        const currentHref = registrationLinkElement.getAttribute("href") || "#";
        console.log("Current href before update:", currentHref);
        try {
            const url = new URL(currentHref, window.location.origin);
            url.searchParams.set("program", this.programId);
            registrationLinkElement.setAttribute("href", url.toString());
            console.log("Updated registration link with program parameter:", url.toString());
        } catch (error) {
            console.error("Invalid URL in registrationCard href:", currentHref, error);
        }
    }
    // Method to display the registration card
    show() {
        // Since #registrationCard is a link, ensure it's visible if it's hidden
        this.card.getElement().style.display = "block";
        console.log("Displayed registration card.");
    }
}
// Utility function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const isRegistration = params.has("registration");
    const subscriptionId = params.get("subscription");
    return {
        isRegistration,
        subscriptionId
    };
};
const handleRegistrationSuccess = async ()=>{
    console.log("Handling registration success");
    const { isRegistration, subscriptionId } = getUrlParams();
    if (isRegistration && subscriptionId) try {
        console.log("Fetching registration data...");
        // Make the GET request to fetch registration data
        const request = (0, _apiConfig.apiClient).get(`/success_page/registration/${subscriptionId}`);
        // Wrap the event-based response in a Promise for easier handling
        const registrationData = await new Promise((resolve, reject)=>{
            request.onData((response)=>{
                console.log("Registration data received:", response.data);
                resolve(response.data);
            });
            request.onError((error)=>{
                console.error("API Error:", error);
                reject(error);
            });
            // Initiate the request
            request.fetch();
        });
        // Trigger the success_trigger element (assuming it has an event listener)
        const successTrigger = document.querySelector(".success_trigger");
        if (successTrigger) {
            console.log("Triggering success_trigger element.");
            successTrigger.click();
        }
        // Initialize and populate the registration card
        const registrationCard = new RegistrationCard("registrationCard");
        registrationCard.populate(registrationData);
        registrationCard.show();
    } catch (error) {
        console.error("Error fetching registration data:", error);
        // Optionally, display an error message to the user
        const errorMessageElement = document.getElementById("errorMessage");
        if (errorMessageElement) {
            errorMessageElement.innerHTML = `
          <p>An error occurred while processing your registration.</p>
          <p>Please contact us for assistance.</p>
        `;
            errorMessageElement.style.display = "block";
            console.log("Displayed error message.");
        }
    }
    else console.log("Registration parameters not found in URL.");
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"a84l7":[function(require,module,exports) {
// src/success_page/tickets_success.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "handleTicketSuccess", ()=>handleTicketSuccess);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
// Define a TicketCard component to manage the ticket card DOM
class TicketCard {
    constructor(cardId, orderId){
        const cardElement = document.getElementById(cardId);
        if (!cardElement) throw new Error(`Element with id '${cardId}' not found.`);
        // Initialize card and its child elements
        this.card = new (0, _core.WFComponent)(cardElement);
        this.image = new (0, _image.WFImage)(this.card.getChildAsComponent("#cardPerformanceImage").getElement());
        this.productionName = this.card.getChildAsComponent("#cardProductionName");
        this.performanceName = this.card.getChildAsComponent("#cardPerformanceName");
        this.performanceDate = this.card.getChildAsComponent("#cardPerformanceDate");
        this.quantity = this.card.getChildAsComponent("#quantity");
        // Initialize performanceId and orderId to an empty string
        this.performanceId = "";
        this.orderId = orderId;
        // Log warnings if any essential child elements are missing
        if (!this.productionName) console.warn("Element with id 'cardProductionName' not found within the ticket card.");
        if (!this.quantity) console.warn("Element with id 'quantity' not found within the ticket card.");
        if (!this.performanceName) console.warn("Element with id 'cardPerformanceName' not found within the ticket card.");
        if (!this.performanceDate) console.warn("Element with id 'cardPerformanceDate' not found within the ticket card.");
        if (!this.image) console.warn("Element with id 'cardPerformanceImage' not found within the ticket card.");
    }
    // Method to populate the ticket card with data
    populate(data) {
        console.log("Populating ticket card with data.");
        // Set Performance ID
        this.performanceId = data.performance_id;
        console.log("Performance ID set to:", this.performanceId);
        // Set Production Name
        if (this.productionName) {
            this.productionName.setText(data.production_name);
            console.log("Set productionName:", data.production_name);
        }
        // Set Performance Name
        if (this.performanceName) {
            this.performanceName.setText(data.performance_name);
            console.log("Set performanceName:", data.performance_name);
        }
        // Set Performance Date
        if (this.performanceDate) {
            const formattedDate = new Date(data.performance_date_time).toLocaleString();
            this.performanceDate.setText(formattedDate);
            console.log("Set performanceDate:", formattedDate);
        }
        // Set Ticket Quantity
        if (this.quantity) {
            this.quantity.setText(data.quantity.toString());
            console.log("Set ticket quantity:", data.quantity);
        }
        // Set Performance Image
        if (data.image_url && this.image) {
            this.image.setImage(data.image_url);
            const imgElement = this.image.getElement();
            imgElement.alt = `${data.production_name} - Performance Image`;
            console.log("Set performance image URL and alt text.");
        }
        // Set Success Message
        const successMessageElement = document.querySelector("#successMessage");
        if (successMessageElement && successMessageElement instanceof HTMLElement) {
            successMessageElement.innerHTML = data["success-page-message"];
            successMessageElement.style.display = "block";
            console.log("Set and displayed success message.");
        }
        // Add the `performance` or `uuid` parameter to the ticket order link
        this.updateTicketOrderLink(data.order_uuid);
    }
    // Method to update the ticket order link with the appropriate parameters
    updateTicketOrderLink(orderUuid) {
        // Since #ticketOrderCard is the link element, manipulate its href directly
        const ticketOrderLinkElement = this.card.getElement();
        if (!ticketOrderLinkElement) {
            console.warn("ticketOrderCard element is not an anchor element.");
            return;
        }
        const currentHref = ticketOrderLinkElement.getAttribute("href") || "#";
        console.log("Current href before update:", currentHref);
        try {
            if (localStorage.getItem("auth_config")) {
                // User is authenticated, proceed with adding performance and order parameters
                const url = new URL(currentHref, window.location.origin);
                url.searchParams.set("performance", this.performanceId);
                url.searchParams.set("order", this.orderId);
                ticketOrderLinkElement.setAttribute("href", url.toString());
                console.log("Updated ticket order link with performance and order parameters:", url.toString());
            } else {
                // User is not authenticated, set href to /ticket-order?uuid={order_uuid}
                const newHref = `/ticket-order?uuid=${encodeURIComponent(orderUuid)}`;
                ticketOrderLinkElement.setAttribute("href", newHref);
                console.log("Updated ticket order link to /ticket-order with uuid:", newHref);
            }
        } catch (error) {
            console.error("Error updating ticket order link:", error);
            alert("An error occurred while updating the ticket order link.");
        }
    }
    // Method to display the ticket card
    show() {
        const cardElement = this.card.getElement();
        if (cardElement instanceof HTMLElement) {
            cardElement.style.display = "block";
            console.log("Displayed ticket card.");
        }
    }
}
// Utility function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const isTicketPurchase = params.has("ticket_purchase");
    const orderId = params.get("order");
    return {
        isTicketPurchase,
        orderId
    };
};
const handleTicketSuccess = async ()=>{
    console.log("Handling ticket success");
    const { isTicketPurchase, orderId } = getUrlParams();
    if (isTicketPurchase && orderId) try {
        console.log("Fetching ticket order data...");
        // Make the GET request to fetch ticket order data
        const request = (0, _apiConfig.apiClient).get(`/success_page/tickets/${orderId}`);
        // Wrap the event-based response in a Promise for easier handling
        const ticketData = await new Promise((resolve, reject)=>{
            request.onData((response)=>{
                console.log("Ticket data received:", response.data);
                resolve(response.data);
            });
            request.onError((error)=>{
                console.error("API Error:", error);
                reject(error);
            });
            // Initiate the request
            request.fetch();
        });
        // Trigger the success_trigger element (assuming it has an event listener)
        const successTrigger = document.querySelector(".success_trigger");
        if (successTrigger && successTrigger instanceof HTMLElement) {
            console.log("Triggering success_trigger element.");
            successTrigger.click();
        }
        // Initialize and populate the ticket card
        const ticketCard = new TicketCard("ticketOrderCard", orderId);
        ticketCard.populate(ticketData);
        ticketCard.show();
    } catch (error) {
        console.error("Error fetching ticket data:", error);
        alert("An error occurred while processing your ticket order. Please contact us for assistance.");
    }
    else {
        console.log("Ticket purchase parameters not found in URL.");
        alert("Ticket purchase parameters not found in the URL. Please check your link and try again.");
    }
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"3zhvz":[function(require,module,exports) {
// src/success_page/donation_success.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "handleDonationSuccess", ()=>handleDonationSuccess);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
// Define a DonationCard component to manage the donation card DOM
class DonationCard {
    constructor(cardId){
        const cardElement = document.getElementById(cardId);
        if (!cardElement) throw new Error(`Element with id '${cardId}' not found.`);
        // Initialize card and its child elements
        this.card = new (0, _core.WFComponent)(cardElement);
        this.image = new (0, _image.WFImage)(this.card.getChildAsComponent("#cardCampaignImage").getElement());
        this.campaignName = this.card.getChildAsComponent("#cardCampaignName");
        this.campaignSubtitle = this.card.getChildAsComponent("#cardCampaignSubtitle");
        this.donationAmount = this.card.getChildAsComponent("#cardDonationAmount");
        // Initialize campaignId and donationId to empty values
        this.campaignId = "";
        this.donationId = 0;
        // Log warnings if any essential child elements are missing
        if (!this.campaignName) console.warn("Element with id 'cardCampaignName' not found within the donation card.");
        if (!this.campaignSubtitle) console.warn("Element with id 'cardCampaignSubtitle' not found within the donation card.");
        if (!this.donationAmount) console.warn("Element with id 'cardDonationAmount' not found within the donation card.");
        if (!this.image) console.warn("Element with id 'cardCampaignImage' not found within the donation card.");
    }
    // Method to populate the donation card with data
    populate(data) {
        console.log("Populating donation card with data.");
        // Set Campaign ID
        this.campaignId = data.campaign_id;
        console.log("Campaign ID set to:", this.campaignId);
        // Set Donation ID
        this.donationId = data.id;
        console.log("Donation ID set to:", this.donationId);
        // Set Campaign Name
        if (this.campaignName) {
            this.campaignName.setText(data.campaign_name);
            console.log("Set campaignName:", data.campaign_name);
        }
        // Set Campaign Subtitle (e.g., "Thank You for Donating")
        if (this.campaignSubtitle) {
            const subtitle = data.keep_anonymous ? "Anonymous Donation" : `Thank you, ${data.customer_first_name}!`;
            this.campaignSubtitle.setText(subtitle);
            console.log("Set campaignSubtitle:", subtitle);
        }
        // Set Donation Amount
        if (this.donationAmount) {
            this.donationAmount.setText(`$${data.amount.toFixed(2)}`);
            console.log("Set donationAmount:", `$${data.amount.toFixed(2)}`);
        }
        // Set Campaign Image
        if (data.image_url && this.image) {
            this.image.setImage(data.image_url);
            const imgElement = this.image.getElement();
            imgElement.alt = `${data.campaign_name} - Campaign Image`;
            console.log("Set campaign image URL and alt text.");
        }
        // Set Success Message
        const successMessageElement = document.querySelector("#successMessage");
        if (successMessageElement && successMessageElement instanceof HTMLElement) {
            successMessageElement.innerHTML = data["success-page-message"];
            successMessageElement.style.display = "block";
            console.log("Set and displayed success message.");
        }
        // Add the `campaign` and `donation` parameters to the donation card link
        this.updateDonationCardLink();
    }
    // Method to update the donation card link with the campaign and donation parameters
    updateDonationCardLink() {
        // Since #donationCard is the link element, manipulate its href directly
        const donationCardLinkElement = this.card.getElement();
        if (!donationCardLinkElement) {
            console.warn("donationCard element is not an anchor element.");
            return;
        }
        const currentHref = donationCardLinkElement.getAttribute("href") || "#";
        console.log("Current href before update:", currentHref);
        try {
            if (localStorage.getItem("auth_config")) {
                // User is authenticated, proceed with adding campaign and donation parameters
                const url = new URL(currentHref, window.location.origin);
                url.searchParams.set("campaign", this.campaignId);
                url.searchParams.set("donation", this.donationId.toString());
                donationCardLinkElement.setAttribute("href", url.toString());
                console.log("Updated donation card link with campaign and donation parameters:", url.toString());
            } else {
                // User is not authenticated, disable the link and make it non-interactive
                donationCardLinkElement.setAttribute("href", "#"); // Remove or set to a dummy link
                donationCardLinkElement.style.pointerEvents = "none"; // Disable pointer events
                //donationCardLinkElement.style.opacity = "0.5"; // Visually indicate disabled state
                donationCardLinkElement.style.cursor = "not-allowed"; // Change cursor to indicate non-interactivity
                console.log("Auth_config not found. Donation card link disabled and made non-interactive.");
            }
        } catch (error) {
            console.error("Invalid URL in donationCard href:", currentHref, error);
            alert("An error occurred while updating the donation card link.");
        }
    }
    // Method to display the donation card
    show() {
        const cardElement = this.card.getElement();
        if (cardElement instanceof HTMLElement) {
            cardElement.style.display = "block";
            console.log("Displayed donation card.");
        }
    }
}
// Utility function to parse URL parameters
const getUrlParams = ()=>{
    const params = new URLSearchParams(window.location.search);
    const isDonationSuccessful = params.has("donation_successful");
    const donationId = params.get("donation");
    return {
        isDonationSuccessful,
        donationId
    };
};
const handleDonationSuccess = async ()=>{
    console.log("Handling donation success");
    const { isDonationSuccessful, donationId } = getUrlParams();
    if (isDonationSuccessful && donationId) try {
        console.log("Fetching donation data...");
        // Make the GET request to fetch donation data
        const request = (0, _apiConfig.apiClient).get(`/success_page/donation/${donationId}`);
        // Wrap the event-based response in a Promise for easier handling
        const donationData = await new Promise((resolve, reject)=>{
            request.onData((response)=>{
                console.log("Donation data received:", response.data);
                resolve(response.data);
            });
            request.onError((error)=>{
                console.error("API Error:", error);
                reject(error);
            });
            // Initiate the request
            request.fetch();
        });
        // Trigger the success_trigger element (assuming it has an event listener)
        const successTrigger = document.querySelector(".success_trigger");
        if (successTrigger && successTrigger instanceof HTMLElement) {
            console.log("Triggering success_trigger element.");
            successTrigger.click();
        }
        // Initialize and populate the donation card
        const donationCard = new DonationCard("donationCard");
        donationCard.populate(donationData);
        donationCard.show();
    } catch (error) {
        console.error("Error fetching donation data:", error);
        alert("An error occurred while processing your donation. Please contact us for assistance.");
    }
    else {
        console.log("Donation parameters not found in URL.");
        alert("Donation parameters not found in the URL. Please check your link and try again.");
    }
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=success_page.9d507600.js.map
