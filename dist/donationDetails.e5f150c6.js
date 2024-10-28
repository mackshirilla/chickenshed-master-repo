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
})({"3GKdy":[function(require,module,exports) {
// src/pages/donationDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch donation details from the API
parcelHelpers.export(exports, "fetchDonationDetails", ()=>fetchDonationDetails);
// Function to initialize and render the donation details page
parcelHelpers.export(exports, "initializeDonationDetailsPage", ()=>initializeDonationDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
async function fetchDonationDetails(donationId) {
    try {
        const getDonation = (0, _apiConfig.apiClient).get(`/dashboard/donations/${donationId}`);
        const response = await getDonation.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching donation details:", error);
        return null;
    }
}
// Function to trigger a success event
const triggerSuccessEvent = (selector)=>{
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
};
async function initializeDonationDetailsPage() {
    // Extract the donation ID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const donationId = parseInt(urlParams.get("donation") || "0", 10);
    if (!donationId) {
        console.error("Invalid donation ID");
        return;
    }
    try {
        // Fetch donation details
        const response = await fetchDonationDetails(donationId);
        if (!response) {
            console.error("Failed to fetch donation details");
            return;
        }
        const { donation, sale, campaign } = response;
        // Set campaign image using WFImage
        const campaignImageComponent = new (0, _image.WFImage)("#campaignImage");
        campaignImageComponent.setImage(campaign.fieldData["main-image"].url);
        campaignImageComponent.getElement().setAttribute("alt", campaign.fieldData["main-image"].alt || `${campaign.fieldData.name} - Campaign Image`);
        // Set campaign name
        const campaignName = new (0, _core.WFComponent)("#campaignName");
        campaignName.setText(campaign.fieldData.name);
        // Set campaign subheading
        const campaignSubheading = new (0, _core.WFComponent)("#campaignSubheading");
        campaignSubheading.setText(campaign.fieldData.subheading);
        // Set the breadcrumb text to include campaign name and donation date
        const campaignBreadcrumb = new (0, _core.WFComponent)("#campaignBreadcrumb");
        const donationDate = new Date(donation.created_at).toLocaleDateString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        });
        campaignBreadcrumb.setText(`${campaign.fieldData.name} - ${donationDate}`);
        // Set campaign description using the short description from the campaign object
        const campaignShortDescription = new (0, _core.WFComponent)("#campaignShortDescription");
        campaignShortDescription.setText(campaign.fieldData["short-description"]);
        // Set the anonymous donation status
        const anonymousTrue = new (0, _core.WFComponent)("#anonymousTrue");
        const anonymousFalse = new (0, _core.WFComponent)("#anonymousFalse");
        if (donation.keep_anonymous) {
            anonymousTrue.setStyle({
                display: "block"
            });
            anonymousFalse.setStyle({
                display: "none"
            });
        } else {
            anonymousTrue.setStyle({
                display: "none"
            });
            anonymousFalse.setStyle({
                display: "block"
            });
        }
        // Set the billing information
        const invoiceDate = new (0, _core.WFComponent)("#invoiceDate");
        const saleDateFormatted = new Date(sale.created_at).toLocaleDateString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        });
        invoiceDate.setText(saleDateFormatted);
        const invoiceAmount = new (0, _core.WFComponent)("#invoiceAmount");
        invoiceAmount.setText(`$${sale.amount_total.toFixed(2)}`);
        const receiptButton = new (0, _core.WFComponent)("#receiptButton");
        receiptButton.getElement().setAttribute("href", sale.reciept_url);
        // Handle "Made In The Name Of" field
        const inNameOfHeader = new (0, _core.WFComponent)("#inNameOfHeader");
        const inNameOfCell = new (0, _core.WFComponent)("#inNameOfCell");
        if (donation.in_name_of && donation.in_name_of.trim() !== "") {
            // If in_name_of has a value, display the header and cell
            inNameOfHeader.setStyle({
                display: "table-cell"
            });
            inNameOfCell.setStyle({
                display: "table-cell"
            });
            inNameOfCell.setText(donation.in_name_of);
        } else {
            // If in_name_of is blank, hide the header and cell
            inNameOfHeader.setStyle({
                display: "none"
            });
            inNameOfCell.setStyle({
                display: "none"
            });
        }
        // Trigger the success event
        triggerSuccessEvent(".success_trigger");
    } catch (error) {
        console.error("Error initializing donation details page:", error);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}]},[], null, "parcelRequired346")

//# sourceMappingURL=donationDetails.e5f150c6.js.map
