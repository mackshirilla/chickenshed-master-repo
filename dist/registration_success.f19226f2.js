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
})({"7ajQx":[function(require,module,exports) {
// src/success_page/registration_success_index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "handleRegistrationSuccessIndex", ()=>handleRegistrationSuccessIndex);
var _core = require("@xatom/core");
var _apiConfig = require("../../api/apiConfig");
// Utility functions for formatting values
const capitalize = (str)=>str.charAt(0).toUpperCase() + str.slice(1);
const formatBoolean = (val)=>capitalize(val.toString());
const formatCurrency = (val)=>new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(val);
// Trigger the hidden success animation/trigger element (Webflow interaction)
const triggerSuccess = ()=>{
    const triggerEl = document.querySelector(".success_trigger");
    if (triggerEl) triggerEl.click();
};
// Set of field IDs that should display as currency
const currencyFields = new Set([
    "subtotal",
    "depositPaid",
    "AmountDiscount",
    "subscriptionTotal",
    "dueUponApproval"
]);
// Update a field component with given value or hide it
const updateField = (component, rawValue)=>{
    const el = component.getElement();
    // Reset display
    el.style.display = "";
    // Hide if null, empty, false, or zero-number
    if (rawValue == null || rawValue === "" || rawValue === false || typeof rawValue === "number" && rawValue === 0) {
        el.style.display = "none";
        return;
    }
    let display;
    if (typeof rawValue === "boolean") display = formatBoolean(rawValue);
    else if (typeof rawValue === "string") display = capitalize(rawValue);
    else display = currencyFields.has(el.id) ? formatCurrency(rawValue) : rawValue.toString();
    // Preserve label and bold the value
    const label = el.textContent?.split(":")[0] || "";
    el.innerHTML = `${label}: <strong>${display}</strong>`;
};
const handleRegistrationSuccessIndex = async ()=>{
    try {
        const request = (0, _apiConfig.apiClient).get("/success_page/registration");
        request.onData((res)=>{
            const data = res.data;
            const dueUponApproval = data.subscription_total - data.deposit_amount;
            const aidPercent = data.subscription_subtotal > 0 && data.subscription_amount_discount > 0 ? `${Math.round(data.subscription_amount_discount / data.subscription_subtotal * 100)}%` : null;
            const isActive = (data.status || "").toUpperCase() === "ACTIVE";
            // Handle hiding of dueUponApproval element entirely if active
            const dueEl = document.getElementById("dueUponApproval");
            if (dueEl) dueEl.style.display = isActive ? "none" : "";
            // Map xatom components to their data keys
            const fields = [
                {
                    id: "status",
                    value: data.status
                },
                {
                    id: "billingCycle",
                    value: data.subscription_type
                },
                {
                    id: "pendingStudents",
                    value: data.pending_students
                },
                {
                    id: "financialAidRequested",
                    value: data.current_finaid_id > 0
                },
                {
                    id: "financialAidApplied",
                    value: aidPercent
                },
                {
                    id: "subtotal",
                    value: data.subscription_subtotal
                },
                {
                    id: "depositPaid",
                    value: data.deposit_amount
                },
                {
                    id: "AmountDiscount",
                    value: data.subscription_amount_discount
                },
                {
                    id: "subscriptionTotal",
                    value: data.subscription_total
                },
                {
                    id: "dueUponApproval",
                    value: dueUponApproval
                }
            ];
            fields.forEach(({ id, value })=>{
                // Skip updating dueUponApproval if it's hidden
                if (id === "dueUponApproval" && isActive) return;
                const el = document.getElementById(id);
                if (!el) return;
                updateField(new (0, _core.WFComponent)(el), value);
            });
            // After populating all fields, trigger Webflow interaction
            triggerSuccess();
        });
        request.onError((err)=>console.error("API Error:", err));
        request.fetch();
    } catch (err) {
        console.error("Error loading registration success data:", err);
    }
};
// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", ()=>{
    handleRegistrationSuccessIndex();
});

},{"@xatom/core":"j9zXV","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=registration_success.f19226f2.js.map
