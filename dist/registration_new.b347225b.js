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
})({"iVQMh":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "newProgramRegistration", ()=>newProgramRegistration);
var _startRegistration = require("../../api/startRegistration");
var _dynamicRegistrationTable = require("./components/dynamicRegistrationTable");
var _checkoutLineItems = require("./components/checkoutLineItems");
var _financialAid = require("./components/financialAid");
var _registrationState = require("./state/registrationState");
var _pendingStudentsAlert = require("./components/pendingStudentsAlert");
var _checkoutSubmission = require("./components/checkoutSubmission");
var _loadRegistrationUi = require("./components/loadRegistrationUi");
var _core = require("@xatom/core");
var _actionRequiredDialog = require("./components/actionRequiredDialog");
async function newProgramRegistration() {
    console.log("new registration");
    try {
        const response = await (0, _startRegistration.startRegistration)({});
        console.log("Registration started:", response);
        // Save the API response in state.
        (0, _registrationState.saveState)({
            apiData: response
        });
        // Always initialize the dynamic registration table (this sets up the add button and template row).
        (0, _dynamicRegistrationTable.initDynamicRegistrationTable)(response, {
            tableBodySelector: "#subscription_items_list",
            emptyStateSelector: "#subscription_empty",
            templateRowSelector: "#subscription_item",
            addButtonSelector: "#subscription_items_table tfoot #add_subscription_item",
            isAddOn: false,
            fields: {
                program: {
                    textSelector: "#item_program_name",
                    selectSelector: "#program-select-1"
                },
                workshop: {
                    textSelector: "#item_workshop_name",
                    selectSelector: "#workshop-select-1"
                },
                session: {
                    textSelector: "#item_session_name",
                    selectSelector: "#session-select-1"
                },
                student: {
                    textSelector: "#item_student_name",
                    selectSelector: "#student-select-1"
                }
            }
        });
        // Rehydrate the UI if there are saved registration items.
        const state = (0, _registrationState.loadState)();
        if (state.registrationItems && state.registrationItems.length > 0) (0, _loadRegistrationUi.loadRegistrationUI)();
        // Set subscription type select value from state.
        const subscriptionTypeSelect = document.getElementById("subscription_type");
        if (subscriptionTypeSelect && state.subscriptionType) subscriptionTypeSelect.value = state.subscriptionType;
        (0, _checkoutLineItems.updateCheckoutLineItems)(response);
        (0, _pendingStudentsAlert.updatePendingStudentsAlert)(response);
        // Show action required dialog if no student profiles are returned.
        (0, _actionRequiredDialog.showActionRequiredDialogIfNoStudentProfiles)(response);
        // After initial response is loaded, if the loading animation trigger exists, click it.
        const successTrigger = document.querySelector(".success_trigger");
        if (successTrigger) successTrigger.click();
        // Setup an event to update the checkout button's enabled/disabled state.
        function updateCheckoutButtonState() {
            const confirmedRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
            const checkoutBtn = document.getElementById("submit_registration_checkout");
            if (confirmedRows.length === 0) checkoutBtn.disabled = true;
            else checkoutBtn.disabled = false;
        }
        updateCheckoutButtonState();
        document.addEventListener("registrationChanged", ()=>{
            (0, _checkoutLineItems.updateCheckoutLineItems)(response);
            (0, _pendingStudentsAlert.updatePendingStudentsAlert)(response);
            updateCheckoutButtonState();
        });
        // When subscription type changes, update state and line items.
        if (subscriptionTypeSelect) subscriptionTypeSelect.addEventListener("change", ()=>{
            (0, _registrationState.saveState)({
                subscriptionType: subscriptionTypeSelect.value
            });
            (0, _checkoutLineItems.updateCheckoutLineItems)(response);
        });
        // Setup checkout button behavior.
        const checkoutButton = new (0, _core.WFComponent)("#submit_registration_checkout");
        checkoutButton.on("click", async (e)=>{
            e.preventDefault();
            const btnEl = checkoutButton.getElement();
            if (btnEl.disabled) return;
            btnEl.disabled = true;
            // Show loading animation.
            const loadingAnim = document.getElementById("submit_registration_checkout_animation");
            if (loadingAnim) loadingAnim.style.display = "block";
            try {
                await (0, _checkoutSubmission.submitCheckout)();
            // If submitCheckout() returns successfully and redirects, this code may not run.
            } catch (error) {
                console.error(error);
            } finally{
                // Hide loading animation and re-enable the button if not redirected.
                if (loadingAnim) loadingAnim.style.display = "none";
                btnEl.disabled = false;
            }
        });
    } catch (error) {
        console.error("Error starting registration:", error);
    }
    (0, _financialAid.initializeFinancialAid)();
}

},{"../../api/startRegistration":"jum8m","./components/dynamicRegistrationTable":"e0z23","./components/checkoutLineItems":"heEwZ","./components/financialAid":"3qzYO","./state/registrationState":"2wxDE","./components/pendingStudentsAlert":"5FN4p","./components/checkoutSubmission":"gmPt7","./components/loadRegistrationUi":"662ls","@xatom/core":"j9zXV","./components/actionRequiredDialog":"1aex8","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"jum8m":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "startRegistration", ()=>startRegistration);
var _apiConfig = require("./apiConfig");
async function startRegistration(payload) {
    try {
        const response = await (0, _apiConfig.apiClient).post("/registration/start_registration", payload).fetch();
        if (response.has_active_subscription) // navigate away if they already have an active subscription
        window.location.assign("/dashboard/registration/manage-subscription");
        return response;
    } catch (error) {
        console.error("Error starting registration:", error);
        throw error;
    }
}

},{"./apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"e0z23":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initDynamicRegistrationTable", ()=>initDynamicRegistrationTable);
parcelHelpers.export(exports, "attachRowEventListeners", ()=>attachRowEventListeners);
parcelHelpers.export(exports, "populateProgramOptions", ()=>populateProgramOptions);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
function initDynamicRegistrationTable(data, config) {
    const tableBody = new (0, _core.WFComponent)(config.tableBodySelector);
    const emptyState = new (0, _core.WFComponent)(config.emptyStateSelector);
    const addButton = new (0, _core.WFComponent)(config.addButtonSelector);
    const templateRow = document.querySelector(config.templateRowSelector);
    if (!templateRow) {
        console.error("Template row not found with selector:", config.templateRowSelector);
        return;
    }
    // Ensure the template row is always hidden.
    templateRow.style.display = "none";
    addButton.on("click", ()=>{
        emptyState.getElement().style.display = "none";
        // Clone the template row.
        const newRowElement = templateRow.cloneNode(true);
        // Remove the id from the clone so it doesn’t conflict with the template.
        newRowElement.removeAttribute("id");
        newRowElement.style.display = "table-row";
        const newRow = new (0, _core.WFComponent)(newRowElement);
        resetRow(newRow, config);
        tableBody.appendChild(newRow);
        populateProgramOptions(newRow, data, config);
        attachRowEventListeners(newRow, data, config);
    });
}
function resetRow(row, config) {
    const fieldsToReset = [
        {
            field: "program",
            enable: true
        },
        {
            field: "workshop",
            enable: false
        },
        {
            field: "session",
            enable: false
        },
        {
            field: "student",
            enable: false
        }
    ];
    fieldsToReset.forEach((item)=>{
        const textEl = row.getChildAsComponent(config.fields[item.field].textSelector);
        const selectEl = row.getChildAsComponent(config.fields[item.field].selectSelector);
        textEl.getElement().style.display = "none";
        selectEl.getElement().style.display = "block";
        selectEl.getElement().disabled = !item.enable;
    });
    const confirmButton = row.getChildAsComponent(".add_registration_button");
    confirmButton.getElement().style.display = "block";
    row.removeCssClass("confirmed");
}
function populateProgramOptions(row, data, config) {
    const programSelect = row.getChildAsComponent(config.fields.program.selectSelector);
    programSelect.getElement().disabled = false;
    const programsMap = new Map();
    data.sessions.forEach((session)=>{
        if (session.program.Add_On_Program === config.isAddOn) programsMap.set(session.program.id, session.program.name);
    });
    let optionsHTML = '<option value="">Select Program</option>';
    programsMap.forEach((name, id)=>{
        optionsHTML += `<option value="${id}">${name}</option>`;
    });
    programSelect.setHTML(optionsHTML);
}
function populateWorkshopOptions(row, data, selectedProgramId, config) {
    const workshopSelect = row.getChildAsComponent(config.fields.workshop.selectSelector);
    const filteredSessions = data.sessions.filter((session)=>session.program.id.toString() === selectedProgramId && session.workshop);
    if (filteredSessions.length > 0) {
        workshopSelect.getElement().disabled = false;
        let optionsHTML = '<option value="">Select Workshop</option>';
        const workshopsMap = new Map();
        filteredSessions.forEach((session)=>{
            if (session.workshop) workshopsMap.set(session.workshop.id, session.workshop.Name);
        });
        workshopsMap.forEach((name, id)=>{
            optionsHTML += `<option value="${id}">${name}</option>`;
        });
        workshopSelect.setHTML(optionsHTML);
        workshopSelect.getElement().style.display = "block";
        const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
        workshopText.getElement().style.display = "none";
    } else {
        workshopSelect.getElement().disabled = true;
        workshopSelect.getElement().style.display = "none";
        const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
        workshopText.setText(" - ");
        workshopText.getElement().style.display = "block";
        populateSessionOptions(row, data, selectedProgramId, null, config);
    }
}
function populateSessionOptions(row, data, selectedProgramId, selectedWorkshopId, config) {
    const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
    sessionSelect.getElement().disabled = false;
    let filteredSessions = data.sessions.filter((session)=>session.program.id.toString() === selectedProgramId);
    if (selectedWorkshopId) filteredSessions = filteredSessions.filter((session)=>session.workshop && session.workshop.id.toString() === selectedWorkshopId);
    let optionsHTML = '<option value="">Select Session</option>';
    filteredSessions.forEach((session)=>{
        optionsHTML += `<option value="${session.id}">${session.Name} (${session.Time_block})</option>`;
    });
    sessionSelect.setHTML(optionsHTML);
}
function populateStudentOptions(row, data, config) {
    const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
    studentSelect.getElement().disabled = false;
    let optionsHTML = '<option value="">Select Student</option>';
    const currentSessionId = row.getElement().getAttribute("data-session-id");
    const tableBodyEl = document.querySelector(config.tableBodySelector);
    let usedStudentIds = [];
    if (tableBodyEl && currentSessionId) {
        const confirmedRows = Array.from(tableBodyEl.querySelectorAll("tr.confirmed"));
        confirmedRows.forEach((tr)=>{
            if (tr.getAttribute("data-session-id") === currentSessionId) {
                const studentId = tr.getAttribute("data-student-id");
                if (studentId) usedStudentIds.push(studentId);
            }
        });
    }
    data.student_profiles.forEach((profile)=>{
        if (!usedStudentIds.includes(profile.id.toString())) optionsHTML += `<option value="${profile.id}">${profile.full_name}</option>`;
    });
    studentSelect.setHTML(optionsHTML);
}
function attachRowEventListeners(row, data, config) {
    const programSelect = row.getChildAsComponent(config.fields.program.selectSelector);
    programSelect.on("change", ()=>{
        const selectEl = programSelect.getElement();
        const selectedProgramId = selectEl.value;
        row.getElement().setAttribute("data-program-id", selectedProgramId);
        populateWorkshopOptions(row, data, selectedProgramId, config);
        const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
        sessionSelect.getElement().disabled = false;
    });
    const workshopSelect = row.getChildAsComponent(config.fields.workshop.selectSelector);
    workshopSelect.on("change", ()=>{
        const selectEl = workshopSelect.getElement();
        const selectedWorkshopId = selectEl.value;
        row.getElement().setAttribute("data-workshop-id", selectedWorkshopId);
        const confirmedProgramId = row.getElement().getAttribute("data-program-id") || "";
        populateSessionOptions(row, data, confirmedProgramId, selectedWorkshopId, config);
    });
    const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
    sessionSelect.on("change", ()=>{
        const selectEl = sessionSelect.getElement();
        const selectedSessionId = selectEl.value;
        row.getElement().setAttribute("data-session-id", selectedSessionId);
        const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
        studentSelect.getElement().disabled = false;
        populateStudentOptions(row, data, config);
    });
    const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
    studentSelect.on("change", ()=>{
        const selectEl = studentSelect.getElement();
        row.getElement().setAttribute("data-student-id", selectEl.value);
    });
    const confirmButton = row.getChildAsComponent(".add_registration_button");
    confirmButton.on("click", ()=>{
        const programSelectEl = row.getChildAsComponent(config.fields.program.selectSelector).getElement();
        const sessionSelectEl = row.getChildAsComponent(config.fields.session.selectSelector).getElement();
        const studentSelectEl = row.getChildAsComponent(config.fields.student.selectSelector).getElement();
        if (!programSelectEl.value || !sessionSelectEl.value || !studentSelectEl.value) {
            console.warn("Please select a Program, Session, and Student.");
            return;
        }
        const tableBodyEl = document.querySelector(config.tableBodySelector);
        const currentSessionId = row.getElement().getAttribute("data-session-id");
        if (tableBodyEl && currentSessionId) {
            const duplicate = Array.from(tableBodyEl.querySelectorAll("tr.confirmed")).some((tr)=>{
                return tr.getAttribute("data-session-id") === currentSessionId && tr.getAttribute("data-student-id") === studentSelectEl.value;
            });
            if (duplicate) {
                console.warn("This student is already registered for the selected session.");
                return;
            }
        }
        row.getElement().setAttribute("data-student-id", studentSelectEl.value);
        const programText = row.getChildAsComponent(config.fields.program.textSelector);
        programText.setText(programSelectEl.options[programSelectEl.selectedIndex].text);
        const workshopSelectEl = row.getChildAsComponent(config.fields.workshop.selectSelector).getElement();
        let workshopTextValue = workshopSelectEl.disabled ? " - " : workshopSelectEl.options[workshopSelectEl.selectedIndex].text;
        const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
        workshopText.setText(workshopTextValue);
        const sessionText = row.getChildAsComponent(config.fields.session.textSelector);
        sessionText.setText(sessionSelectEl.options[sessionSelectEl.selectedIndex].text);
        const studentText = row.getChildAsComponent(config.fields.student.textSelector);
        studentText.setText(studentSelectEl.options[studentSelectEl.selectedIndex].text);
        const hideSelectParent = (selectSelector)=>{
            const comp = row.getChildAsComponent(selectSelector);
            const parent = comp.getElement().parentElement;
            if (parent) parent.style.display = "none";
        };
        hideSelectParent(config.fields.program.selectSelector);
        hideSelectParent(config.fields.workshop.selectSelector);
        hideSelectParent(config.fields.session.selectSelector);
        hideSelectParent(config.fields.student.selectSelector);
        confirmButton.getElement().style.display = "none";
        programText.getElement().style.display = "block";
        workshopText.getElement().style.display = "block";
        sessionText.getElement().style.display = "block";
        studentText.getElement().style.display = "block";
        row.addCssClass("confirmed");
        // Update state: add this row's data to registrationItems.
        const currentItems = (0, _registrationState.loadState)().registrationItems || [];
        const newItem = {
            program_id: row.getAttribute("data-program-id"),
            session_id: row.getAttribute("data-session-id"),
            student_id: row.getAttribute("data-student-id"),
            program_name: programSelectEl.options[programSelectEl.selectedIndex].text,
            workshop_name: workshopText.getElement().textContent || "",
            session_name: sessionText.getElement().textContent || "",
            student_name: studentText.getElement().textContent || ""
        };
        (0, _registrationState.saveState)({
            registrationItems: [
                ...currentItems,
                newItem
            ]
        });
        document.dispatchEvent(new CustomEvent("registrationChanged"));
    });
    const deleteButton = row.getChildAsComponent(".remove_registration_button");
    deleteButton.on("click", ()=>{
        row.remove();
        const tableBodyEl = document.querySelector(config.tableBodySelector);
        if (tableBodyEl) {
            const templateRowId = config.templateRowSelector.startsWith("#") ? config.templateRowSelector.slice(1) : config.templateRowSelector;
            const emptyStateId = config.emptyStateSelector.startsWith("#") ? config.emptyStateSelector.slice(1) : config.emptyStateSelector;
            const userRows = Array.from(tableBodyEl.querySelectorAll("tr")).filter((tr)=>{
                return tr.id !== templateRowId && tr.id !== emptyStateId;
            });
            if (userRows.length === 0) {
                const emptyRowEl = document.querySelector(config.emptyStateSelector);
                if (emptyRowEl) emptyRowEl.style.display = "table-row";
            }
        }
        // Remove corresponding item from state.registrationItems.
        const state = (0, _registrationState.loadState)();
        const updatedItems = (state.registrationItems || []).filter((item)=>{
            return !(item.session_id === row.getAttribute("data-session-id") && item.student_id === row.getAttribute("data-student-id"));
        });
        (0, _registrationState.saveState)({
            registrationItems: updatedItems
        });
        document.dispatchEvent(new CustomEvent("registrationChanged"));
    });
}

},{"@xatom/core":"j9zXV","../state/registrationState":"2wxDE","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"2wxDE":[function(require,module,exports) {
// registrationState.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadState", ()=>loadState);
parcelHelpers.export(exports, "saveState", ()=>saveState);
parcelHelpers.export(exports, "resetRegistrationState", ()=>resetRegistrationState);
const STORAGE_KEY = "registrationState";
let state = loadStateFromStorage() || {
    fin_aid_requested: false,
    selected_discount: undefined,
    financialAidData: undefined,
    subscriptionType: "year",
    apiData: undefined,
    originalSubscriptionTotal: 0,
    registrationItems: []
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
function resetRegistrationState() {
    state = {
        fin_aid_requested: false,
        selected_discount: undefined,
        financialAidData: undefined,
        subscriptionType: "year",
        apiData: undefined,
        originalSubscriptionTotal: 0,
        registrationItems: []
    };
    saveStateToStorage(state);
}
function loadStateFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Error loading state from storage:", error);
        return null;
    }
}
function saveStateToStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Error saving state to storage:", error);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"heEwZ":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Updates the checkout line items UI.
 * - Builds and displays subscription line items.
 * - Determines if deposit line items should be displayed:
 *     • Always if pending student profiles exist.
 *     • Otherwise, only for monthly subscriptions if the registration is early.
 * - Updates the overall total and early alert accordingly.
 */ parcelHelpers.export(exports, "updateCheckoutLineItems", ()=>updateCheckoutLineItems);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _updateTotalAmount = require("./updateTotalAmount");
/**
 * Retrieves a session by its ID.
 */ function getSessionById(sessions, sessionId) {
    const session = sessions.find((s)=>s.id.toString() === sessionId);
    console.log(`[DEBUG] getSessionById: Looking for session id ${sessionId}:`, session);
    return session;
}
/**
 * Groups line items by productName.
 */ function groupLineItems(items) {
    const grouped = new Map();
    items.forEach((item)=>{
        const key = item.productName;
        if (grouped.has(key)) {
            const existing = grouped.get(key);
            existing.quantity += item.quantity;
            existing.total += item.total;
            grouped.set(key, existing);
        } else grouped.set(key, {
            ...item
        });
    });
    const finalItems = Array.from(grouped.values());
    console.log("[DEBUG] groupLineItems: Final grouped items:", finalItems);
    return finalItems;
}
/**
 * Updates the deposit line items using the deposit product’s single sale price.
 */ function updateDepositLineItems(apiData, subscriptionType) {
    console.log("[DEBUG] updateDepositLineItems: Starting deposit update...");
    const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
    console.log("[DEBUG] updateDepositLineItems: Found", subscriptionRows.length, "confirmed subscription rows.");
    const depositItems = [];
    subscriptionRows.forEach((row, index)=>{
        const sessionId = row.getAttribute("data-session-id");
        console.log(`[DEBUG] updateDepositLineItems: Processing row ${index + 1}, session id:`, sessionId);
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session || !session.deposit_product) {
            console.log(`[DEBUG] updateDepositLineItems: No session or deposit product found for session id ${sessionId}`);
            return;
        }
        // Use the deposit product’s single sale price.
        const depositPriceStr = session.deposit_product.Displayed_single_sale_price;
        const depositUnitPrice = parseFloat(depositPriceStr.replace(/[^0-9\.]/g, "")) || 0;
        console.log(`[DEBUG] updateDepositLineItems: Deposit price string: "${depositPriceStr}", parsed unit price: ${depositUnitPrice}`);
        depositItems.push({
            productName: session.Name,
            quantity: 1,
            unitPrice: depositUnitPrice,
            total: depositUnitPrice
        });
    });
    console.log("[DEBUG] updateDepositLineItems: Deposit Items Array before grouping:", depositItems);
    const finalDepositItems = groupLineItems(depositItems);
    let depositHTML = "";
    finalDepositItems.forEach((item, index)=>{
        depositHTML += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="deposit_item_product" class="text-weight-bold">${item.productName}</div>
        <div id="deposit_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="deposit_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="deposit_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)}</div>
      </div>
    `;
        console.log(`[DEBUG] updateDepositLineItems: Built deposit line item ${index + 1}:`, item);
    });
    new (0, _core.WFComponent)("#deposit_line_items_list").setHTML(depositHTML);
    const depositTotal = finalDepositItems.reduce((acc, item)=>acc + item.total, 0);
    console.log("[DEBUG] updateDepositLineItems: Calculated deposit total:", depositTotal);
    new (0, _core.WFComponent)("#deposit_total").setText(`$${depositTotal.toFixed(2)}`);
    // Toggle container display based on whether any deposit items exist.
    const depositContainer = new (0, _core.WFComponent)("#deposit_line_items_container");
    const displayStyle = finalDepositItems.length > 0 ? "flex" : "none";
    depositContainer.getElement().style.display = displayStyle;
    console.log("[DEBUG] updateDepositLineItems: Deposit container display set to:", displayStyle);
    return depositTotal;
}
function updateCheckoutLineItems(apiData) {
    console.log("[DEBUG] updateCheckoutLineItems: Running updateCheckoutLineItems...");
    const subscriptionTypeSelect = document.getElementById("subscription_type");
    if (!subscriptionTypeSelect) {
        console.warn("[DEBUG] updateCheckoutLineItems: Subscription type select not found.");
        return;
    }
    const subscriptionType = subscriptionTypeSelect.value; // "year", "month", or "semester"
    console.log("[DEBUG] updateCheckoutLineItems: Subscription type selected:", subscriptionType);
    const suffix = subscriptionType === "year" ? "/year" : subscriptionType === "month" ? "/month" : subscriptionType === "semester" ? "/semester" : "";
    // Process subscription items.
    const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
    console.log("[DEBUG] updateCheckoutLineItems: Found", subscriptionRows.length, "confirmed subscription rows.");
    const subscriptionItems = [];
    subscriptionRows.forEach((row, index)=>{
        const sessionId = row.getAttribute("data-session-id");
        console.log(`[DEBUG] updateCheckoutLineItems: Processing subscription row ${index + 1}, session id:`, sessionId);
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session) return;
        let priceStr = "";
        if (subscriptionType === "year") priceStr = session.tuition_product.Displayed_annual_price;
        else if (subscriptionType === "month") priceStr = session.tuition_product.Displayed_monthly_price;
        else if (subscriptionType === "semester") priceStr = session.tuition_product.Displayed_semester_price;
        console.log(`[DEBUG] updateCheckoutLineItems: Price string for session ${sessionId}:`, priceStr);
        const unitPrice = parseFloat(priceStr.replace(/[^0-9\.]/g, "")) || 0;
        console.log(`[DEBUG] updateCheckoutLineItems: Parsed unit price for session ${sessionId}:`, unitPrice);
        subscriptionItems.push({
            productName: session.Name,
            quantity: 1,
            unitPrice: unitPrice,
            total: unitPrice
        });
    });
    console.log("[DEBUG] updateCheckoutLineItems: Subscription Items Array before grouping:", subscriptionItems);
    const finalSubscriptionItems = groupLineItems(subscriptionItems);
    let subscriptionHTML = "";
    finalSubscriptionItems.forEach((item, index)=>{
        subscriptionHTML += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="subscription_item_product" class="text-weight-bold line_item_product">${item.productName}</div>
        <div id="subscription_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="subscription_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="subscription_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)} ${suffix}</div>
      </div>
    `;
        console.log(`[DEBUG] updateCheckoutLineItems: Built subscription line item ${index + 1}:`, item);
    });
    new (0, _core.WFComponent)("#subscription_line_items_list").setHTML(subscriptionHTML);
    const subscriptionItemsWrapper = new (0, _core.WFComponent)("#subscription_line_items_wrap");
    const subscriptionEmptyState = new (0, _core.WFComponent)("#subscription_line_items_empty");
    if (finalSubscriptionItems.length > 0) {
        subscriptionItemsWrapper.getElement().style.display = "flex";
        subscriptionEmptyState.getElement().style.display = "none";
    } else {
        subscriptionItemsWrapper.getElement().style.display = "none";
        subscriptionEmptyState.getElement().style.display = "block";
    }
    const subscriptionTotal = finalSubscriptionItems.reduce((acc, item)=>acc + item.total, 0);
    console.log("[DEBUG] updateCheckoutLineItems: Subscription Total:", subscriptionTotal);
    (0, _registrationState.saveState)({
        originalSubscriptionTotal: subscriptionTotal
    });
    console.log("[DEBUG] updateCheckoutLineItems: Updated originalSubscriptionTotal:", subscriptionTotal);
    // Determine early registration for monthly subscriptions.
    let earlyRegistration = false;
    let earliestStartDate = null;
    if (subscriptionType === "month") subscriptionRows.forEach((row)=>{
        const sessionId = row.getAttribute("data-session-id");
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session) return;
        const startDate = session.program["1st_Semester_Start_Date"];
        if (startDate && startDate > Date.now()) {
            earlyRegistration = true;
            if (earliestStartDate === null || startDate < earliestStartDate) earliestStartDate = startDate;
        }
    });
    // Check for pending student profiles.
    const pendingStudents = apiData.student_profiles ? apiData.student_profiles.filter((profile)=>profile.Status && profile.Status.toLowerCase() === "pending") : [];
    // Determine if deposit line items should display:
    // • Always if pending students exist.
    // • Otherwise, only if subscriptionType is "month" and earlyRegistration is true.
    let depositShouldDisplay = false;
    if (pendingStudents.length > 0) depositShouldDisplay = true;
    else if (subscriptionType === "month" && earlyRegistration) depositShouldDisplay = true;
    let depositTotal = 0;
    if (depositShouldDisplay) {
        console.log("[DEBUG] updateCheckoutLineItems: Pending students or early registration detected.");
        depositTotal = updateDepositLineItems(apiData, subscriptionType);
        console.log("[DEBUG] updateCheckoutLineItems: Deposit total computed:", depositTotal);
    } else {
        // Hide deposit container if not applicable.
        new (0, _core.WFComponent)("#deposit_line_items_container").getElement().style.display = "none";
        console.log("[DEBUG] updateCheckoutLineItems: Deposit container hidden.");
    }
    // Update overall total amount due.
    (0, _updateTotalAmount.updateTotalAmount)(false, subscriptionType, depositTotal);
    // Update early registration alert.
    updateEarlyAlert(apiData, subscriptionType);
}
/**
 * If the subscription is monthly, checks confirmed rows for the earliest upcoming start date.
 * If found, displays the early alert with that date; otherwise, hides the alert.
 */ function updateEarlyAlert(apiData, subscriptionType) {
    if (subscriptionType !== "month") {
        new (0, _core.WFComponent)("#alertBoxEarly").getElement().style.display = "none";
        return;
    }
    const confirmedRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
    let earliestStartDate = null;
    confirmedRows.forEach((row)=>{
        const sessionId = row.getAttribute("data-session-id");
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session) return;
        const startDate = session.program["1st_Semester_Start_Date"];
        if (startDate && startDate > Date.now()) {
            if (earliestStartDate === null || startDate < earliestStartDate) earliestStartDate = startDate;
        }
    });
    const alertBox = new (0, _core.WFComponent)("#alertBoxEarly");
    const startDateSpan = new (0, _core.WFComponent)("#subscription_start_date");
    if (earliestStartDate) {
        const formattedDate = new Date(earliestStartDate).toLocaleDateString();
        startDateSpan.setText(formattedDate);
        alertBox.getElement().style.display = "block";
        console.log("[DEBUG] updateEarlyAlert: Displaying early alert with start date:", formattedDate);
    } else {
        alertBox.getElement().style.display = "none";
        console.log("[DEBUG] updateEarlyAlert: No upcoming start dates found, hiding early alert.");
    }
}

},{"@xatom/core":"j9zXV","../state/registrationState":"2wxDE","./updateTotalAmount":"dQjmU","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dQjmU":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateTotalAmount", ()=>updateTotalAmount);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
function updateTotalAmount(includeDeposit, subscriptionType, depositTotal = 0) {
    const state = (0, _registrationState.loadState)();
    const originalTotal = state.originalSubscriptionTotal || 0;
    const discount = state.selected_discount ? parseFloat(state.selected_discount) : 0;
    const discountAmount = originalTotal * (discount / 100);
    const discountedSubscriptionTotal = originalTotal - discountAmount;
    // If depositTotal is provided (i.e. pending students exist) then that is the due amount.
    const overallTotal = depositTotal > 0 ? depositTotal : discountedSubscriptionTotal;
    const suffix = subscriptionType ? "/" + subscriptionType : "";
    const discountPill = new (0, _core.WFComponent)("#subscription_discount_pill");
    discountPill.getElement().style.display = discount > 0 ? "block" : "none";
    const discountApplied = new (0, _core.WFComponent)("#subscription_discount_applied");
    discountApplied.setText(discount > 0 ? `${discount}%` : "");
    const originalAmount = new (0, _core.WFComponent)("#subscription_original_amount");
    if (discount > 0) {
        originalAmount.setText(`was $${originalTotal.toFixed(2)} ${suffix}`);
        originalAmount.getElement().style.display = "block";
    } else originalAmount.getElement().style.display = "none";
    const subscriptionTotal = new (0, _core.WFComponent)("#subscription_total");
    subscriptionTotal.setText(`$${discountedSubscriptionTotal.toFixed(2)} ${suffix}`);
    const overallTotalDisplay = new (0, _core.WFComponent)("#total_amount_due");
    overallTotalDisplay.setText(`$${overallTotal.toFixed(2)}`);
}

},{"@xatom/core":"j9zXV","../state/registrationState":"2wxDE","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"3qzYO":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initializeFinancialAid", ()=>initializeFinancialAid);
parcelHelpers.export(exports, "saveFinancialAidData", ()=>saveFinancialAidData);
parcelHelpers.export(exports, "loadFinancialAidData", ()=>loadFinancialAidData);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _formUtils = require("../../../utils/formUtils");
var _validationUtils = require("../../../utils/validationUtils");
const initializeFinancialAid = ()=>{
    // Load any saved financial aid data to pre-populate the form.
    loadFinancialAidData();
    const financialAidCheckbox = new (0, _core.WFComponent)("#requestFinAid");
    const financialAidDialog = new (0, _core.WFComponent)("#finaidForm");
    financialAidCheckbox.on("change", ()=>{
        const checkboxElement = financialAidCheckbox.getElement();
        if (checkboxElement.checked) financialAidDialog.getElement().showModal();
        else {
            (0, _registrationState.saveState)({
                fin_aid_requested: false,
                selected_discount: undefined
            });
            document.dispatchEvent(new CustomEvent("registrationChanged"));
        }
    });
    financialAidDialog.getElement()?.addEventListener("close", ()=>{
        const state = (0, _registrationState.loadState)();
        if (!state.selected_discount) financialAidCheckbox.getElement().checked = false;
    });
    setupFinancialAidFormValidation();
    const submitButton = new (0, _core.WFComponent)("#submitfinancialAid");
    submitButton.on("click", ()=>{
        if (validateFinancialAidForm()) {
            saveFinancialAidData();
            showSuccessState();
        }
    });
    attachCloseDialogHandler(financialAidDialog);
    const annualIncomeInput = new (0, _core.WFComponent)("#annualIncome");
    const monthlyExpenseInput = new (0, _core.WFComponent)("#monthlyExpense");
    const formatAndSetInputValue = (component)=>{
        const inputEl = component.getElement();
        let value = inputEl.value.replace(/[^\d.-]/g, "");
        let cursorPos = inputEl.selectionStart || 0;
        const commaCountBefore = (inputEl.value.slice(0, cursorPos).match(/,/g) || []).length;
        if (value.includes(".")) {
            const [intPart, decPart] = value.split(".");
            value = `${intPart}.${decPart.slice(0, 2)}`;
        }
        const formattedValue = formatNumber(value);
        inputEl.value = formattedValue;
        const commaCountAfter = (formattedValue.slice(0, cursorPos).match(/,/g) || []).length;
        cursorPos += commaCountAfter - commaCountBefore;
        if (cursorPos > formattedValue.length) cursorPos = formattedValue.length;
        inputEl.setSelectionRange(cursorPos, cursorPos);
    };
    const formatNumber = (value)=>{
        const num = parseFloat(value.replace(/,/g, ""));
        if (isNaN(num)) return value;
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };
    annualIncomeInput.on("input", ()=>formatAndSetInputValue(annualIncomeInput));
    monthlyExpenseInput.on("input", ()=>formatAndSetInputValue(monthlyExpenseInput));
};
/**
 * Loads saved financial aid data from state and populates the form fields.
 * The checkbox is set to checked only if fin_aid_requested is true.
 */ function loadFinancialAidData() {
    const state = (0, _registrationState.loadState)();
    const financialAidCheckbox = new (0, _core.WFComponent)("#requestFinAid");
    if (state.fin_aid_requested && state.financialAidData) {
        financialAidCheckbox.getElement().checked = true;
        const relationshipInput = new (0, _core.WFComponent)("#finaidRelationship");
        const annualIncomeInput = new (0, _core.WFComponent)("#annualIncome");
        const monthlyExpenseInput = new (0, _core.WFComponent)("#monthlyExpense");
        const previousParticipantValue = state.financialAidData.previousParticipant;
        const previousParticipantInputs = document.getElementsByName("previous_participant");
        relationshipInput.getElement().value = state.financialAidData.relationship || "";
        annualIncomeInput.getElement().value = state.financialAidData.annualIncome || "";
        monthlyExpenseInput.getElement().value = state.financialAidData.monthlyExpense || "";
        previousParticipantInputs.forEach((radio)=>{
            radio.checked = radio.value === previousParticipantValue;
        });
        console.log("[DEBUG] loadFinancialAidData: Financial aid data loaded from state.");
    } else financialAidCheckbox.getElement().checked = false;
}
/**
 * Sets up field-level validation for the financial aid form.
 */ const setupFinancialAidFormValidation = ()=>{
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
/**
 * Validates the financial aid form.
 */ const validateFinancialAidForm = ()=>{
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
/**
 * Saves the financial aid data to state.
 */ const saveFinancialAidData = ()=>{
    const relationship = new (0, _core.WFComponent)("#finaidRelationship").getElement().value;
    const annualIncome = new (0, _core.WFComponent)("#annualIncome").getElement().value;
    const monthlyExpense = new (0, _core.WFComponent)("#monthlyExpense").getElement().value;
    const previousParticipantInput = document.querySelector("input[name='previous_participant']:checked");
    const previousParticipant = previousParticipantInput ? previousParticipantInput.value : "";
    (0, _registrationState.saveState)({
        fin_aid_requested: true,
        selected_discount: "",
        financialAidData: {
            relationship,
            annualIncome,
            monthlyExpense,
            previousParticipant
        }
    });
    console.log("[DEBUG] saveFinancialAidData: Financial aid data saved:", {
        relationship,
        annualIncome,
        monthlyExpense,
        previousParticipant
    });
};
/**
 * Shows a success state for the financial aid form.
 */ const showSuccessState = ()=>{
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
            (0, _registrationState.saveState)({
                selected_discount: discountValue,
                fin_aid_requested: true
            });
            document.dispatchEvent(new CustomEvent("registrationChanged"));
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
const closeFinancialAidDialog = (dialog)=>{
    dialog.getElement().close();
};
const attachCloseDialogHandler = (dialog)=>{
    const closeButton = new (0, _core.WFComponent)("#close-dialog-btn");
    closeButton.on("click", ()=>closeFinancialAidDialog(dialog));
    dialog.getElement()?.addEventListener("click", (event)=>{
        const rect = dialog.getElement().getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeFinancialAidDialog(dialog);
    });
};
const getComponentValue = (component)=>{
    const element = component.getElement();
    return element.value;
};

},{"@xatom/core":"j9zXV","../state/registrationState":"2wxDE","../../../utils/formUtils":"hvg7i","../../../utils/validationUtils":"dMBjH","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"dMBjH":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"5FN4p":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updatePendingStudentsAlert", ()=>updatePendingStudentsAlert);
var _core = require("@xatom/core");
function updatePendingStudentsAlert(apiData) {
    const alertBox = new (0, _core.WFComponent)("#alertBox");
    const alertPendingStudentList = new (0, _core.WFComponent)("#alertPendingStudentList");
    // Check if student_profiles exists in the API response
    if (apiData.student_profiles && Array.isArray(apiData.student_profiles)) {
        // Filter for pending profiles (case-insensitive)
        const pendingStudents = apiData.student_profiles.filter((profile)=>profile.Status && profile.Status.toLowerCase() === "pending");
        if (pendingStudents.length > 0) {
            // Create a comma-separated list of full names
            const names = pendingStudents.map((profile)=>profile.full_name).join(", ");
            alertPendingStudentList.setText(names);
            alertBox.getElement().style.display = "flex";
            return;
        }
    }
    // If no pending students, hide the alert box.
    alertBox.getElement().style.display = "none";
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"gmPt7":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Gathers all registration data and sends it to the checkout endpoint.
 */ parcelHelpers.export(exports, "submitCheckout", ()=>submitCheckout);
var _core = require("@xatom/core");
var _registrationState = require("../state/registrationState");
var _formUtils = require("../../../utils/formUtils");
var _apiConfig = require("../../../api/apiConfig");
/**
 * Utility: Given an array of sessions and a sessionId (as string),
 * returns the matching session object.
 */ function getSessionById(sessions, sessionId) {
    const session = sessions.find((s)=>s.id.toString() === sessionId);
    console.log(`[DEBUG] checkoutSubmission - getSessionById: Looking for session id ${sessionId}:`, session);
    return session;
}
async function submitCheckout() {
    // 1. Load state (which should include apiData, financial aid info, subscription type, etc.)
    const state = (0, _registrationState.loadState)();
    if (!state.apiData) {
        console.error("No API data found in state.");
        displayCheckoutError("No API data found in state.");
        return;
    }
    const apiData = state.apiData;
    // 2. Build registration items from confirmed subscription rows.
    const confirmedRows = Array.from(document.querySelectorAll("#subscription_items_list tr.confirmed"));
    const registrationItems = confirmedRows.map((row)=>({
            program_id: row.getAttribute("data-program-id"),
            session_id: row.getAttribute("data-session-id"),
            student_id: row.getAttribute("data-student-id")
        }));
    // 3. Build subscription line items.
    const subscriptionLineItemsMap = new Map();
    confirmedRows.forEach((row)=>{
        const sessionId = row.getAttribute("data-session-id");
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session) return;
        let priceId = "";
        if (state.subscriptionType === "year") priceId = session.tuition_product.Annual_price_id;
        else if (state.subscriptionType === "month") priceId = session.tuition_product.Monthly_price_id;
        else if (state.subscriptionType === "semester") priceId = session.tuition_product.Semester_price_id;
        if (!priceId) return;
        const currentQty = subscriptionLineItemsMap.get(priceId) || 0;
        subscriptionLineItemsMap.set(priceId, currentQty + 1);
    });
    const subscriptionLineItems = Array.from(subscriptionLineItemsMap.entries()).map(([price, quantity])=>({
            price,
            quantity
        }));
    console.log("[DEBUG] submitCheckout: Subscription line items", subscriptionLineItems);
    // 4. Determine early registration for monthly subscriptions.
    let earlyRegistration = false;
    let earliestStartDate = null;
    if (state.subscriptionType === "month") confirmedRows.forEach((row)=>{
        const sessionId = row.getAttribute("data-session-id");
        if (!sessionId) return;
        const session = getSessionById(apiData.sessions, sessionId);
        if (!session) return;
        const startDate = session.program["1st_Semester_Start_Date"];
        if (startDate && startDate > Date.now()) {
            earlyRegistration = true;
            if (earliestStartDate === null || startDate < earliestStartDate) earliestStartDate = startDate;
        }
    });
    console.log("[DEBUG] submitCheckout: Early registration =", earlyRegistration, "Earliest start date =", earliestStartDate);
    // 5. Check for pending student profiles.
    const pendingStudents = apiData.student_profiles ? apiData.student_profiles.filter((profile)=>profile.Status && profile.Status.toLowerCase() === "pending") : [];
    console.log("[DEBUG] submitCheckout: Pending students", pendingStudents);
    // 6. Build deposit line items if applicable.
    let depositLineItems = null;
    if (pendingStudents.length > 0 || state.subscriptionType === "month" && earlyRegistration) {
        const depositLineItemsMap = new Map();
        const savedItems = state.registrationItems || [];
        savedItems.forEach((item)=>{
            const sessionId = item.session_id;
            if (!sessionId) return;
            const session = getSessionById(apiData.sessions, sessionId);
            if (!session || !session.deposit_product) return;
            const depositPriceId = session.deposit_product.Single_sale_price_id;
            if (!depositPriceId) return;
            const currentQty = depositLineItemsMap.get(depositPriceId) || 0;
            depositLineItemsMap.set(depositPriceId, currentQty + 1);
        });
        depositLineItems = depositLineItemsMap.size > 0 ? Array.from(depositLineItemsMap.entries()).map(([price, quantity])=>({
                price,
                quantity
            })) : null;
    }
    console.log("[DEBUG] submitCheckout: Deposit line items", depositLineItems);
    // 7. Get the total amount due from the DOM.
    const totalDueText = new (0, _core.WFComponent)("#total_amount_due").getElement().textContent || "";
    const totalDue = parseFloat(totalDueText.replace(/[^0-9\.]/g, "")) || 0;
    // 8. Compute subscription pricing details.
    const subscriptionSubtotal = state.originalSubscriptionTotal || 0; // Amount with no discounts.
    const discountPercent = state.selected_discount ? parseFloat(state.selected_discount) : 0;
    const subscriptionAmountDiscount = subscriptionSubtotal * (discountPercent / 100);
    const subscriptionTotal = subscriptionSubtotal - subscriptionAmountDiscount;
    // 9. Pull financial aid info from state.
    const financialAid = {
        requested: state.fin_aid_requested,
        selected_discount: state.selected_discount,
        data: state.financialAidData
    };
    // 10. Assemble the payload object with new subscription pricing keys.
    const checkoutPayload = {
        registration_items: registrationItems,
        subscription_line_items: subscriptionLineItems,
        deposit_line_items: depositLineItems,
        financial_aid: financialAid,
        subscription_type: state.subscriptionType,
        early_registration: earlyRegistration,
        earliest_start_date: earliestStartDate,
        subscription_subtotal: subscriptionSubtotal,
        subscription_amount_discount: subscriptionAmountDiscount,
        subscription_total: subscriptionTotal,
        total_due: totalDue,
        students_pending: pendingStudents.length > 0,
        base_url: window.location.origin
    };
    console.log("[DEBUG] submitCheckout: Payload", checkoutPayload);
    // 11. Send the payload using your Axios-based apiClient with .fetch() and a wrapped data property.
    try {
        const response = await (0, _apiConfig.apiClient).post("/registration/checkout", {
            data: checkoutPayload
        }).fetch();
        const data = response;
        console.log("[DEBUG] submitCheckout: Response", data);
        if (data.url) {
            hideCheckoutError();
            window.location.href = data.url;
        } else throw new Error("No checkout URL returned");
    } catch (error) {
        console.error("Error submitting checkout", error);
        displayCheckoutError(error.message || "An error occurred during checkout.");
    }
}
/**
 * Displays an error message in the checkout error element using toggleError.
 * @param message The error message to display.
 */ function displayCheckoutError(message) {
    const errorComp = new (0, _core.WFComponent)("#registration_checkout_error");
    (0, _formUtils.toggleError)(errorComp, message, true);
}
/**
 * Hides the checkout error element.
 */ function hideCheckoutError() {
    const errorComp = new (0, _core.WFComponent)("#registration_checkout_error");
    (0, _formUtils.toggleError)(errorComp, "", false);
}

},{"@xatom/core":"j9zXV","../state/registrationState":"2wxDE","../../../utils/formUtils":"hvg7i","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"662ls":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadRegistrationUI", ()=>loadRegistrationUI);
var _registrationState = require("../state/registrationState");
function loadRegistrationUI() {
    const state = (0, _registrationState.loadState)();
    if (!state.registrationItems || state.registrationItems.length === 0) {
        console.log("[DEBUG] loadRegistrationUI: No registration items to load.");
        return;
    }
    const tableBodyEl = document.getElementById("subscription_items_list");
    if (!tableBodyEl) {
        console.error("Table body not found.");
        return;
    }
    // Get the template row.
    const templateRow = document.getElementById("subscription_item");
    if (!templateRow) {
        console.error("Template row not found.");
        return;
    }
    // Ensure the template row remains hidden.
    templateRow.style.display = "none";
    // Remove any confirmed rows that are clones (i.e. that do not have the id "subscription_item").
    const allRows = Array.from(tableBodyEl.getElementsByTagName("tr"));
    allRows.forEach((row)=>{
        if (row.id !== "subscription_item") row.remove();
    });
    // Hide the empty state element.
    const emptyStateEl = document.getElementById("subscription_empty");
    if (emptyStateEl) emptyStateEl.style.display = "none";
    // For each saved registration item, clone the template row and append it.
    state.registrationItems.forEach((item)=>{
        const newRow = templateRow.cloneNode(true);
        // Remove id so it's not the template.
        newRow.removeAttribute("id");
        newRow.classList.add("confirmed");
        newRow.style.display = "table-row";
        // Set data attributes.
        newRow.setAttribute("data-program-id", item.program_id || "");
        newRow.setAttribute("data-session-id", item.session_id || "");
        newRow.setAttribute("data-student-id", item.student_id || "");
        // Populate display text fields.
        const programTextEl = newRow.querySelector("#item_program_name");
        if (programTextEl) {
            programTextEl.textContent = item.program_name || "";
            programTextEl.style.display = "block";
        }
        const workshopTextEl = newRow.querySelector("#item_workshop_name");
        if (workshopTextEl) {
            workshopTextEl.textContent = item.workshop_name || "";
            workshopTextEl.style.display = "block";
        }
        const sessionTextEl = newRow.querySelector("#item_session_name");
        if (sessionTextEl) {
            sessionTextEl.textContent = item.session_name || "";
            sessionTextEl.style.display = "block";
        }
        const studentTextEl = newRow.querySelector("#item_student_name");
        if (studentTextEl) {
            studentTextEl.textContent = item.student_name || "";
            studentTextEl.style.display = "block";
        }
        // Hide select elements and the confirm button.
        const selects = newRow.querySelectorAll("select");
        selects.forEach((sel)=>sel.style.display = "none");
        const confirmButton = newRow.querySelector(".add_registration_button");
        if (confirmButton) confirmButton.style.display = "none";
        // Attach delete event listener.
        const deleteButton = newRow.querySelector(".remove_registration_button");
        if (deleteButton) deleteButton.addEventListener("click", ()=>{
            newRow.remove();
            const currentItems = (0, _registrationState.loadState)().registrationItems || [];
            const updatedItems = currentItems.filter((stateItem)=>{
                return !(stateItem.session_id === newRow.getAttribute("data-session-id") && stateItem.student_id === newRow.getAttribute("data-student-id"));
            });
            (0, _registrationState.saveState)({
                registrationItems: updatedItems
            });
            // If no confirmed rows remain (other than template), show the empty state.
            const remainingRows = Array.from(tableBodyEl.getElementsByTagName("tr")).filter((r)=>r.id === "subscription_item" ? false : true);
            if (remainingRows.length === 0) {
                const emptyEl = document.getElementById("subscription_empty");
                if (emptyEl) emptyEl.style.display = "table-row";
            }
            document.dispatchEvent(new CustomEvent("registrationChanged"));
        });
        tableBodyEl.appendChild(newRow);
    });
    console.log("[DEBUG] loadRegistrationUI: UI reloaded from state.");
}

},{"../state/registrationState":"2wxDE","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"1aex8":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Checks if the API data has any student profiles.
 * If not, displays the Action Required dialog and clicks the trigger element.
 */ parcelHelpers.export(exports, "showActionRequiredDialogIfNoStudentProfiles", ()=>showActionRequiredDialogIfNoStudentProfiles);
var _core = require("@xatom/core");
function showActionRequiredDialogIfNoStudentProfiles(apiData) {
    // Check if student_profiles is missing or empty.
    if (!apiData.student_profiles || apiData.student_profiles.length === 0) {
        const dialogComp = new (0, _core.WFComponent)("#actionRequiredDialog");
        const dialogEl = dialogComp.getElement();
        if (dialogEl instanceof HTMLDialogElement) dialogEl.showModal();
        else dialogEl.style.display = "block";
        // Also trigger the animation click.
        const trigger = document.getElementById("alertDialogAnimationTrigger");
        if (trigger) trigger.click();
    }
}

},{"@xatom/core":"j9zXV","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=registration_new.b347225b.js.map
