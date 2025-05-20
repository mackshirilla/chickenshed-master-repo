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
})({"efC2o":[function(require,module,exports) {
// src/manageSubscription/index.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "manageSubscriptionPage", ()=>manageSubscriptionPage);
parcelHelpers.export(exports, "renderAll", ()=>renderAll);
var _apiConfig = require("../../api/apiConfig");
var _core = require("@xatom/core");
var _manageSubscriptionState = require("./state/manageSubscriptionState");
var _manageRegistrationTable = require("./components/manageRegistrationTable");
var _manageSubscriptionLineItems = require("./components/manageSubscriptionLineItems");
var _manageSubscriptionSummary = require("./components/manageSubscriptionSummary");
var _manageDepositLineItems = require("./components/manageDepositLineItems");
var _manageAmountDue = require("./components/manageAmountDue");
var _managePendingStudentsAlert = require("./components/managePendingStudentsAlert");
var _manageTrialAlert = require("./components/manageTrialAlert");
var _manageSubscriptionDetails = require("./components/manageSubscriptionDetails");
var _manageSubscriptionCancelDialog = require("./components/manageSubscriptionCancelDialog");
const REG_TABLE_CONFIG = {
    tableBodySelector: "#subscription_items_list",
    templateRowSelector: "#subscription_item",
    emptyStateSelector: "#subscription_empty"
};
async function manageSubscriptionPage() {
    // 1) Fetch & seed state
    const data = await (0, _apiConfig.apiClient).post("/subscriptions/manage-subscription").fetch();
    if (!data || !data.id) {
        window.location.href = "/dashboard";
        return;
    }
    const initialType = data.update_subscription_type || data.subscription_type;
    (0, _manageSubscriptionState.saveState)({
        apiData: data,
        registrationItems: data.registrations,
        updateSubscriptionType: initialType
    });
    // 2) Hide action buttons
    document.querySelector(".update_button_wrap")?.setAttribute("style", "display:none");
    document.getElementById("resetRegistrations")?.setAttribute("style", "display:none");
    // 3) Render registration table + hook removals
    (0, _manageRegistrationTable.initManageRegistrationTable)(data.registrations, REG_TABLE_CONFIG);
    document.getElementById("subscription_items_list")?.addEventListener("click", (e)=>{
        const btn = e.target.closest(".remove_registration_button");
        if (btn) handleRemove(btn);
    });
    // 4) Initial full render
    renderAll();
    // 4a) fire the hidden Lottie trigger now that we have a subscription
    document.querySelector(".success_trigger")?.click();
    // 5) Dialog & form wiring for “Update Subscription”
    const form = new (0, _core.WFFormComponent)("#cancelSubscriptionForm");
    const dialogEl = document.querySelector("#removeStudentDialog");
    const pageMain = new (0, _core.WFComponent)(".page_main");
    const errorComp = new (0, _core.WFComponent)("#submitUpdateError");
    const loaderComp = document.querySelector("#submitUpdateLoading");
    const submitBtn = document.getElementById("submitUpdateBtn");
    document.getElementById("submit_subscription_update")?.addEventListener("click", (e)=>{
        e.preventDefault();
        errorComp.getElement().style.display = "none";
        loaderComp.style.display = "none";
        pageMain.setAttribute("data-brand", "6");
        dialogEl.showModal();
    });
    form.onFormSubmit(async (dataMap, ev)=>{
        ev.preventDefault();
        errorComp.getElement().style.display = "none";
        const reason = dataMap.removed_because.trim();
        if (!reason) {
            errorComp.setText("Please enter a reason for your changes.");
            errorComp.getElement().style.display = "block";
            return;
        }
        loaderComp.style.display = "block";
        try {
            const state = (0, _manageSubscriptionState.loadState)();
            const originalIds = state.apiData.registrations.map((r)=>r.id);
            const keptIds = state.registrationItems.map((r)=>r.id);
            const toCancel = originalIds.filter((id)=>!keptIds.includes(id));
            await (0, _apiConfig.apiClient).post("/subscriptions/update", {
                data: {
                    subscription_id: state.apiData.id,
                    registration_item_ids: toCancel,
                    reason
                }
            }).fetch();
            const fresh = await (0, _apiConfig.apiClient).post("/subscriptions/manage-subscription").fetch();
            (0, _manageSubscriptionState.saveState)({
                apiData: fresh,
                registrationItems: fresh.registrations
            });
            renderAll();
            form.showSuccessState();
            pageMain.setAttribute("data-brand", "4");
        } catch (err) {
            console.error("Update failed:", err);
            form.showErrorState();
        } finally{
            loaderComp.style.display = "none";
            submitBtn.removeAttribute("disabled");
        }
    });
    document.getElementById("close-dialog-btn")?.addEventListener("click", ()=>{
        dialogEl.close();
        pageMain.setAttribute("data-brand", "2");
        form.showForm();
        form.resetForm();
        form.enableForm();
    });
    // Reset registrations
    document.getElementById("resetRegistrations")?.addEventListener("click", ()=>{
        const orig = (0, _manageSubscriptionState.loadState)().apiData.registrations;
        (0, _manageSubscriptionState.saveState)({
            registrationItems: orig
        });
        renderAll();
        document.querySelector(".update_button_wrap")?.setAttribute("style", "display:none");
        document.getElementById("resetRegistrations")?.setAttribute("style", "display:none");
    });
    // 6) Instantiate the cancellation dialog handler
    new (0, _manageSubscriptionCancelDialog.CancelSubscriptionDialog)();
}
function renderAll() {
    const s = (0, _manageSubscriptionState.loadState)();
    const sub = s.apiData;
    const items = s.registrationItems;
    (0, _manageRegistrationTable.initManageRegistrationTable)(items, REG_TABLE_CONFIG);
    (0, _manageSubscriptionLineItems.initManageLineItems)(sub, items, s.updateSubscriptionType, {
        listSelector: "#subscription_line_items_list",
        wrapSelector: "#subscription_line_items_wrap",
        emptySelector: "#subscription_line_items_empty",
        templateSelector: "#subscription_line_item"
    });
    (0, _manageSubscriptionSummary.updateSubscriptionSummary)();
    (0, _manageDepositLineItems.initManageDepositItems)(sub, items, {
        containerSelector: "#deposit_line_items_container",
        listSelector: "#deposit_line_items_list",
        templateRowSelector: "#deposit_item_template",
        totalSelector: "#deposit_total"
    });
    (0, _manageAmountDue.updateAmountDue)();
    (0, _managePendingStudentsAlert.updatePendingStudentsAlert)(sub);
    (0, _manageTrialAlert.updateTrialAlert)(sub);
    (0, _manageSubscriptionDetails.manageSubscriptionDetails)();
}
window.renderAll = renderAll;
function handleRemove(btn) {
    const row = btn.closest("tr");
    if (!row) return;
    const st = (0, _manageSubscriptionState.loadState)();
    if (st.registrationItems.length <= 1) {
        alert("You must keep at least one registration.");
        return;
    }
    row.remove();
    const kept = st.registrationItems.filter((ri)=>!(ri.session_id.toString() === row.getAttribute("data-session-id") && ri.student_profile.id.toString() === row.getAttribute("data-student-id")));
    (0, _manageSubscriptionState.saveState)({
        registrationItems: kept
    });
    renderAll();
    document.querySelector(".update_button_wrap")?.setAttribute("style", "display:block");
    document.getElementById("resetRegistrations")?.setAttribute("style", "display:block");
}

},{"../../api/apiConfig":"2Lx0S","@xatom/core":"j9zXV","./state/manageSubscriptionState":"1J9rJ","./components/manageRegistrationTable":"Ns5lY","./components/manageSubscriptionLineItems":"8Sqiy","./components/manageSubscriptionSummary":"fTJ1C","./components/manageDepositLineItems":"6AIdK","./components/manageAmountDue":"eDIyp","./components/managePendingStudentsAlert":"dHhsn","./components/manageTrialAlert":"lzkyv","./components/manageSubscriptionDetails":"9yQh4","./components/manageSubscriptionCancelDialog":"fcXK8","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"1J9rJ":[function(require,module,exports) {
// src/manageSubscription/state/manageSubscriptionState.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadState", ()=>loadState);
parcelHelpers.export(exports, "saveState", ()=>saveState);
const STORAGE_KEY = "manageSubscriptionState";
let state = loadStateFromStorage() || {
    apiData: undefined,
    registrationItems: [],
    updateSubscriptionType: undefined
};
function loadState() {
    return state;
}
function saveState(newState) {
    state = {
        ...state,
        ...newState
    };
    saveStateToStorage(state);
}
function loadStateFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Error loading manage subscription state:", error);
        return null;
    }
}
function saveStateToStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Error saving manage subscription state:", error);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"Ns5lY":[function(require,module,exports) {
// src/manageSubscription/components/manageRegistrationTable.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Initializes the registration table for managing subscriptions.
 * Clones the template row for each item, populates text fields,
 * sets data-attributes, and handles empty state display.
 */ parcelHelpers.export(exports, "initManageRegistrationTable", ()=>initManageRegistrationTable);
var _core = require("@xatom/core");
function initManageRegistrationTable(items, config) {
    // Grab elements
    const tableBodyComp = new (0, _core.WFComponent)(config.tableBodySelector);
    const tableBodyEl = tableBodyComp.getElement();
    const templateRow = document.querySelector(config.templateRowSelector);
    const emptyRow = document.querySelector(config.emptyStateSelector);
    if (!templateRow) {
        console.error("Template row not found:", config.templateRowSelector);
        return;
    }
    if (!emptyRow) {
        console.error("Empty state row not found:", config.emptyStateSelector);
        return;
    }
    // Remove existing user rows (keep template and empty)
    Array.from(tableBodyEl.querySelectorAll("tr")).forEach((row)=>{
        if (row === templateRow || row === emptyRow) return;
        row.remove();
    });
    // Handle empty state
    if (items.length === 0) {
        emptyRow.style.display = "table-row";
        return;
    }
    emptyRow.style.display = "none";
    // Create a row per item
    items.forEach((item)=>{
        const newRow = templateRow.cloneNode(true);
        newRow.removeAttribute("id");
        newRow.style.display = "table-row";
        // Data attributes
        newRow.setAttribute("data-program-id", String(item.program_id));
        newRow.setAttribute("data-workshop-id", String(item.workshop_id));
        newRow.setAttribute("data-session-id", String(item.session_id));
        newRow.setAttribute("data-student-id", String(item.student_profile?.id || item.student_id));
        // Populate text fields
        const programText = newRow.querySelector("#item_program_name");
        if (programText) programText.textContent = item.program_details.name;
        // Workshop may not exist, show dash if missing
        const workshopText = newRow.querySelector("#item_workshop_name");
        const wsName = item.workshop_details?.Name || "-";
        if (workshopText) workshopText.textContent = wsName;
        // Session name
        const sessionText = newRow.querySelector("#item_session_name");
        if (sessionText) sessionText.textContent = `${item.session_details.Weekday} ${item.session_details.Time_block}`;
        // Student full name
        const studentText = newRow.querySelector("#item_student_name");
        if (studentText) studentText.textContent = `${item.student_profile.first_name} ${item.student_profile.last_name}`;
        // Hide any select elements if present
        Array.from(newRow.querySelectorAll("select")).forEach((sel)=>{
            sel.style.display = "none";
        });
        // Hide confirm/add buttons in management view
        const confirmBtn = newRow.querySelector(".add_registration_button");
        if (confirmBtn) confirmBtn.style.display = "none";
        // Append to table body
        tableBodyEl.appendChild(newRow);
    });
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"8Sqiy":[function(require,module,exports) {
// src/manageSubscription/components/manageSubscriptionLineItems.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Renders subscription line items for the management page.
 * Groups and sums quantities, then displays items or shows empty state.
 */ parcelHelpers.export(exports, "initManageLineItems", ()=>initManageLineItems);
var _core = require("@xatom/core");
function initManageLineItems(apiData, registrationItems, subscriptionType, config) {
    // Determine suffix and price field
    const suffix = subscriptionType === "year" ? "/year" : subscriptionType === "month" ? "/month" : "/semester";
    // Build raw items
    const rawItems = registrationItems.map((item)=>{
        const session = item.session_details;
        const tuition = session.tuition_product;
        const priceStr = subscriptionType === "year" ? tuition.Displayed_annual_price : subscriptionType === "month" ? tuition.Displayed_monthly_price : tuition.Displayed_semester_price;
        // parse "$600 Per Semester" → 600
        const unit = parseFloat((priceStr || "").replace(/[^0-9\.]/g, "")) || 0;
        return {
            productName: session.Name,
            unitPrice: unit,
            quantity: 1,
            total: unit
        };
    });
    // Group by productName
    const groupedMap = new Map();
    rawItems.forEach((item)=>{
        const key = item.productName;
        if (groupedMap.has(key)) {
            const existing = groupedMap.get(key);
            existing.quantity += item.quantity;
            existing.total += item.total;
        } else groupedMap.set(key, {
            ...item
        });
    });
    const finalItems = Array.from(groupedMap.values());
    // Grab DOM elements
    const wrapComp = new (0, _core.WFComponent)(config.wrapSelector);
    const wrapEl = wrapComp.getElement();
    const emptyEl = document.querySelector(config.emptySelector);
    const template = document.querySelector(config.templateSelector);
    const listComp = new (0, _core.WFComponent)(config.listSelector);
    const listEl = listComp.getElement();
    if (!template) {
        console.error("Line-item template not found:", config.templateSelector);
        return;
    }
    // Clear previous items
    Array.from(listEl.children).forEach((child)=>{
        if (child.id !== template.id) listEl.removeChild(child);
    });
    // Handle empty state
    if (finalItems.length === 0) {
        wrapEl.style.display = "none";
        if (emptyEl) emptyEl.style.display = "flex";
        return;
    }
    wrapEl.style.display = "flex";
    if (emptyEl) emptyEl.style.display = "none";
    // Render each line item
    finalItems.forEach((item)=>{
        const row = template.cloneNode(true);
        row.removeAttribute("id");
        row.style.display = "flex";
        // fill fields
        const prod = row.querySelector("#subscription_item_product");
        if (prod) prod.textContent = item.productName;
        const unitEl = row.querySelector("#subscription_item_unit_amount");
        if (unitEl) unitEl.textContent = `$${item.unitPrice.toFixed(2)}`;
        const qtyEl = row.querySelector("#subscription_item_quantity");
        if (qtyEl) qtyEl.textContent = String(item.quantity);
        const totalEl = row.querySelector("#subscription_item_total");
        if (totalEl) totalEl.textContent = `$${item.total.toFixed(2)} ${suffix}`;
        listEl.appendChild(row);
    });
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fTJ1C":[function(require,module,exports) {
// src/manageSubscription/components/manageSubscriptionSummary.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Recalculates and updates the subscription summary:
 * - Aggregates current subscription line-item totals
 * - Applies any discount (financial aid)
 * - Updates the UI elements for the subscription total and original amount, appending the billing period suffix
 */ parcelHelpers.export(exports, "updateSubscriptionSummary", ()=>updateSubscriptionSummary);
var _core = require("@xatom/core");
var _manageSubscriptionState = require("../state/manageSubscriptionState");
function updateSubscriptionSummary() {
    // 1) Aggregate current line items from the DOM
    const lineTotals = Array.from(document.querySelectorAll("#subscription_line_items_list .line_item_total")).map((el)=>{
        const text = (el.textContent || "").replace(/[^0-9.]/g, "");
        return parseFloat(text) || 0;
    });
    const subtotal = lineTotals.reduce((sum, amt)=>sum + amt, 0);
    // 2) Get discount percentage and billing period from state
    const state = (0, _manageSubscriptionState.loadState)();
    const discountPercent = state.apiData?.financial_aid?.selected_discount || 0;
    const periodType = state.updateSubscriptionType || state.apiData?.subscription_type || "month";
    const suffix = periodType === "year" ? "/year" : periodType === "semester" ? "/semester" : "/month";
    // 3) Compute discounted total
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAfterDiscount = subtotal - discountAmount;
    // 4) Update UI elements
    const totalEl = new (0, _core.WFComponent)("#subscription_total");
    const origEl = new (0, _core.WFComponent)("#subscription_original_amount");
    const pillEl = new (0, _core.WFComponent)("#subscription_discount_pill");
    const appliedEl = new (0, _core.WFComponent)("#subscription_discount_applied");
    if (discountPercent > 0) {
        appliedEl.setText(`${discountPercent}%`);
        pillEl.getElement().style.display = "block";
        origEl.setText(`was $${subtotal.toFixed(2)} ${suffix}`);
        origEl.getElement().style.display = "block";
    } else {
        pillEl.getElement().style.display = "none";
        origEl.getElement().style.display = "none";
    }
    // Always update the subscription total display with suffix
    totalEl.setText(`$${totalAfterDiscount.toFixed(2)} ${suffix}`);
}

},{"@xatom/core":"j9zXV","../state/manageSubscriptionState":"1J9rJ","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"6AIdK":[function(require,module,exports) {
// src/manageSubscription/components/manageDepositLineItems.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Renders the deposit line items and total for items already paid.
 * Only shows if status === "Deposit Paid"; otherwise hides them entirely.
 */ parcelHelpers.export(exports, "initManageDepositItems", ()=>initManageDepositItems);
var _core = require("@xatom/core");
function initManageDepositItems(subscription, registrationItems, config) {
    const containerComp = new (0, _core.WFComponent)(config.containerSelector);
    const containerEl = containerComp.getElement();
    const listEl = document.querySelector(config.listSelector);
    const templateRow = document.querySelector(config.templateRowSelector);
    const totalComp = new (0, _core.WFComponent)(config.totalSelector);
    // only show deposit items for Deposit Paid subscriptions
    if (subscription.status !== "Deposit Paid") {
        if (containerEl) containerEl.style.display = "none";
        return;
    }
    if (!containerEl || !listEl || !templateRow) {
        console.error("Deposit items: missing selectors");
        return;
    }
    // Gather deposit lines
    const raw = [];
    registrationItems.forEach((item)=>{
        const dp = item.session_details.deposit_product;
        const priceAmt = dp?.Single_sale_price_amount || 0;
        if (priceAmt > 0) raw.push({
            productName: dp.Product_name || item.session_details.Name,
            unitPrice: priceAmt,
            quantity: 1,
            total: priceAmt
        });
    });
    // Group by productName
    const grouped = new Map();
    raw.forEach((line)=>{
        if (grouped.has(line.productName)) {
            const existing = grouped.get(line.productName);
            existing.quantity += line.quantity;
            existing.total += line.total;
        } else grouped.set(line.productName, {
            ...line
        });
    });
    const depositLines = Array.from(grouped.values());
    // Clear old rows except template
    Array.from(listEl.children).forEach((child)=>{
        if (child === templateRow) return;
        listEl.removeChild(child);
    });
    // No deposits? hide
    const depositTotal = depositLines.reduce((sum, l)=>sum + l.total, 0);
    if (depositTotal <= 0) {
        containerEl.style.display = "none";
        return;
    }
    containerEl.style.display = "flex";
    // Ensure template hidden
    templateRow.style.display = "none";
    // Render each deposit line
    depositLines.forEach((line)=>{
        const row = templateRow.cloneNode(true);
        row.removeAttribute("id");
        row.style.display = "flex";
        const prod = row.querySelector("#deposit_item_product");
        if (prod) prod.textContent = line.productName;
        const unitEl = row.querySelector("#deposit_item_unit_amount");
        if (unitEl) unitEl.textContent = `$${line.unitPrice.toFixed(2)}`;
        const qtyEl = row.querySelector("#deposit_item_quantity");
        if (qtyEl) qtyEl.textContent = String(line.quantity);
        const totalEl = row.querySelector("#deposit_item_total");
        if (totalEl) totalEl.textContent = `$${line.total.toFixed(2)}`;
        listEl.appendChild(row);
    });
    // Set total
    totalComp.setText(`$${depositTotal.toFixed(2)}`);
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"eDIyp":[function(require,module,exports) {
// src/manageSubscription/components/manageAmountDue.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Updates or hides the “Amount Due” container based on payment status,
 * dynamically recalculating from the rendered line items, deposits,
 * and any applied financial aid.
 *
 * - Only shows when status === "Deposit Paid".
 * - Label is always "Amount Due Upon Approval".
 * - amountDue = (sum of current subscription line‑item totals)
 *               − (sum of current deposit totals)
 *               − (financial aid discount on line items).
 */ parcelHelpers.export(exports, "updateAmountDue", ()=>updateAmountDue);
var _core = require("@xatom/core");
var _manageSubscriptionState = require("../state/manageSubscriptionState");
function updateAmountDue() {
    const state = (0, _manageSubscriptionState.loadState)();
    const subscription = state.apiData;
    const container = document.querySelector("#amountDueContainer");
    if (!container) {
        console.error("#amountDueContainer not found");
        return;
    }
    // only show when deposit has been paid
    if (subscription.status !== "Deposit Paid") {
        container.style.display = "none";
        return;
    }
    container.style.display = "flex";
    // set static label
    new (0, _core.WFComponent)("#amountDueLable").setText("Amount Due Upon Approval");
    // 1) sum up all current subscription line‑item totals in the DOM
    const lineSum = Array.from(document.querySelectorAll("#subscription_line_items_list .line_item_total")).reduce((sum, el)=>{
        const num = parseFloat((el.textContent || "").replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
    }, 0);
    // 2) sum up all current deposit totals in the DOM
    const depositSum = Array.from(document.querySelectorAll("#deposit_line_items_list .line_item_total")).reduce((sum, el)=>{
        const num = parseFloat((el.textContent || "").replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
    }, 0);
    // 3) compute financial aid discount
    const discountPercent = state.apiData?.financial_aid?.selected_discount ?? 0;
    const discountAmount = lineSum * discountPercent / 100;
    // 4) compute final due
    const amountDue = Math.max(0, lineSum - depositSum - discountAmount);
    // 5) render amount due
    new (0, _core.WFComponent)("#total_amount_due_next_invoice").setText(`$${amountDue.toFixed(2)}`);
}

},{"@xatom/core":"j9zXV","../state/manageSubscriptionState":"1J9rJ","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dHhsn":[function(require,module,exports) {
// src/manageSubscription/components/managePendingStudentsAlert.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Shows or hides the "order under review" alert box when a
 * subscription is Deposit Paid and student profiles are pending.
 */ parcelHelpers.export(exports, "updatePendingStudentsAlert", ()=>updatePendingStudentsAlert);
var _core = require("@xatom/core");
function updatePendingStudentsAlert(subscription) {
    const alertEl = new (0, _core.WFComponent)("#alertBox").getElement();
    // Debugging
    console.log("[updatePendingStudentsAlert] status=", subscription.status, "pending_students=", subscription.pending_students);
    console.log("[updatePendingStudentsAlert] alertEl=", alertEl);
    if (subscription.status === "Deposit Paid" && subscription.pending_students) // Reveal by removing inline override (or letting CSS handle default)
    alertEl.style.display = "flex";
    else alertEl.style.display = "none";
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"lzkyv":[function(require,module,exports) {
// src/manageSubscription/components/manageTrialAlert.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Toggles the "trial scheduled" alert box and injects dynamic text
 * based on subscription status and trial end date.
 */ parcelHelpers.export(exports, "updateTrialAlert", ()=>updateTrialAlert);
var _core = require("@xatom/core");
function updateTrialAlert(subscription) {
    const trialBoxEl = new (0, _core.WFComponent)("#alertBoxTrial").getElement();
    const dateSpan = new (0, _core.WFComponent)("#subscription_trial_end_date").getElement();
    const now = Date.now();
    const trialEnd = subscription.free_trial_end || 0;
    // Show if trialEnd is in the future or early registration is flagged
    if (trialEnd && trialEnd > now || subscription.early_registration) {
        // Format the trial end date
        const formatted = new Date(trialEnd).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        dateSpan.textContent = formatted;
        // Determine dynamic prefix and verb
        const whenApproved = subscription.status === "Deposit Paid" ? "When approved your" : "Your";
        const beginOrResume = subscription.status === "Deposit Paid" ? "begin" : "resume";
        // Update the alert-title HTML
        const titleEl = trialBoxEl.querySelector(".alert-title");
        titleEl.innerHTML = `${whenApproved} subscription is scheduled to ${beginOrResume} on ` + `<span id="subscription_trial_end_date">${formatted}</span>. ` + `If you've paid a deposit, your initial invoice will commence on the same date.`;
        // Reveal the alert box (removing any inline hide)
        trialBoxEl.style.display = "flex";
    } else // Hide the alert box
    trialBoxEl.style.display = "none";
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"9yQh4":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Renders the basic subscription details section:
 *  - Status (with "Trial" shown as "Scheduled")
 *  - Billing cycle
 *  - Financial Aid Requested (True/hidden)
 *  - Financial Aid Applied (percentage/hidden)
 */ parcelHelpers.export(exports, "manageSubscriptionDetails", ()=>manageSubscriptionDetails);
var _core = require("@xatom/core");
var _manageSubscriptionState = require("../state/manageSubscriptionState");
function manageSubscriptionDetails() {
    const state = (0, _manageSubscriptionState.loadState)();
    const subscription = state.apiData;
    // --- Status ---
    const statusText = subscription.status.toLowerCase() === "trial" ? "Scheduled" : subscription.status;
    new (0, _core.WFComponent)("#status").setText(statusText);
    // --- Billing Cycle ---
    const cycle = state.updateSubscriptionType || subscription.subscription_type;
    new (0, _core.WFComponent)("#subscriptionType").setText(cycle);
    // --- Financial Aid ---
    const finAid = subscription.financial_aid;
    const hasAid = finAid?.selected_discount != null && finAid.selected_discount > 0;
    const reqWrap = document.querySelector("#finAidRequestedWrap");
    const reqEl = new (0, _core.WFComponent)("#finAidRequested");
    const appliedWrap = document.querySelector("#finAidAppliedWrap");
    const appliedEl = new (0, _core.WFComponent)("#finAidApplied");
    if (reqWrap && appliedWrap) {
        if (hasAid) {
            reqEl.setText("True");
            reqWrap.style.display = "flex";
            appliedEl.setText(`${finAid.selected_discount}%`);
            appliedWrap.style.display = "flex";
        } else {
            reqWrap.style.display = "none";
            appliedWrap.style.display = "none";
        }
    } else console.error("manageSubscriptionDetails: missing financial aid selectors");
}

},{"@xatom/core":"j9zXV","../state/manageSubscriptionState":"1J9rJ","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"fcXK8":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Handles the "Cancel Subscription" flow:
 * 1) Opens a dialog asking for a cancellation reason
 * 2) On form submit, sends subscription_id + reason to /subscriptions/cancel
 * 3) Upon success, shows a success message and sets the page_main data-brand to 4
 * 4) On dialog close, resets data-brand to 2
 * Hides the cancel button if the subscription is already cancelled
 */ parcelHelpers.export(exports, "CancelSubscriptionDialog", ()=>CancelSubscriptionDialog);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _manageSubscriptionState = require("../state/manageSubscriptionState");
class CancelSubscriptionDialog {
    constructor(){
        this.dialogComp = new (0, _core.WFComponent)("#cancelSubscriptionDialog");
        this.formComp = new (0, _core.WFFormComponent)("#cancelFullSubscriptionForm");
        this.openBtnComp = new (0, _core.WFComponent)("#openCancelSubscription");
        this.closeBtnComp = new (0, _core.WFComponent)("#close-cancel-dialog-btn");
        this.submitBtnComp = new (0, _core.WFComponent)("#submitCancel");
        this.loadingComp = new (0, _core.WFComponent)("#submitCancelLoading");
        this.reasonError = new (0, _core.WFComponent)("#submitCancelError");
        this.pageMainComp = new (0, _core.WFComponent)(".page_main");
        // Hide cancel button if subscription already cancelled
        const state = (0, _manageSubscriptionState.loadState)();
        if (state.apiData?.status === "Cancelled") this.openBtnComp.getElement().style.display = "none";
        this.attachListeners();
    }
    attachListeners() {
        // Intercept form submit
        this.formComp.onFormSubmit(async (formData, ev)=>{
            ev.preventDefault();
            this.reasonError.getElement().style.display = "none";
            const reason = formData.removed_because.trim();
            if (!reason) {
                this.reasonError.setText("Reason is required.");
                this.reasonError.getElement().style.display = "block";
                return;
            }
            await this.submitCancel(reason);
        });
        // Open dialog
        this.openBtnComp.on("click", (e)=>{
            e.preventDefault();
            this.reasonError.getElement().style.display = "none";
            this.loadingComp.getElement().style.display = "none";
            this.openDialog();
        });
        // Backdrop click → close
        const dlgEl = this.dialogComp.getElement();
        dlgEl.addEventListener("click", (e)=>{
            if (e.target === dlgEl) this.closeDialog();
        });
        // X button
        this.closeBtnComp.on("click", ()=>this.closeDialog());
    }
    openDialog() {
        // switch to cancel-dialog brand
        this.pageMainComp.setAttribute("data-brand", "6");
        this.dialogComp.getElement().showModal();
    }
    closeDialog() {
        this.dialogComp.getElement().close();
        // reset to default
        this.pageMainComp.setAttribute("data-brand", "2");
    }
    async submitCancel(reason) {
        // show loader + disable
        this.loadingComp.getElement().style.display = "block";
        this.submitBtnComp.getElement().setAttribute("disabled", "true");
        try {
            const st = (0, _manageSubscriptionState.loadState)();
            const response = await (0, _apiConfig.apiClient).post("/subscriptions/cancel", {
                data: {
                    subscription_id: st.apiData.id,
                    reason
                }
            }).fetch();
            // filter out cancelled, waitlist, draft, pending statuses
            const visibleRegs = (response.registrations || []).filter((r)=>{
                const s = r.status.toUpperCase();
                return s !== "CANCELLED" && s !== "WAITLIST" && s !== "DRAFT" && s !== "PENDING";
            });
            // update state with filtered registrations
            (0, _manageSubscriptionState.saveState)({
                apiData: response,
                registrationItems: visibleRegs
            });
            window.renderAll();
            // show success and swap to success brand
            this.formComp.showSuccessState();
            this.pageMainComp.setAttribute("data-brand", "4");
        } catch (err) {
            console.error("Cancel failed:", err);
            this.formComp.showErrorState();
        } finally{
            // hide loader + re-enable
            this.loadingComp.getElement().style.display = "none";
            this.submitBtnComp.getElement().removeAttribute("disabled");
        }
    }
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","../state/manageSubscriptionState":"1J9rJ","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=manageSubscription.60488e29.js.map
