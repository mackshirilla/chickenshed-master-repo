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
})({"8xw5q":[function(require,module,exports) {
// src/pages/workshopDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch workshop details from the API, including program and subscription params
parcelHelpers.export(exports, "fetchWorkshopDetails", ()=>fetchWorkshopDetails);
// Function to initialize and render the workshop details and sessions
parcelHelpers.export(exports, "initializeWorkshopDetailsPage", ()=>initializeWorkshopDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _cancelRegistrationDialog = require("../registration/components/cancelRegistrationDialog");
var _listWorkshopFiles = require("./components/listWorkshopFiles");
async function fetchWorkshopDetails(programId, subscriptionId, workshopId // Made optional
) {
    try {
        // Construct request data conditionally
        const requestData = {
            program: programId,
            subscription: subscriptionId
        };
        if (workshopId) requestData.workshop_id = workshopId;
        // Make the API request
        const getWorkshopDetails = (0, _apiConfig.apiClient).get(`/dashboard/registration/workshop/${workshopId || "none"}`, {
            data: requestData
        });
        const response = await getWorkshopDetails.fetch();
        return response;
    } catch (error) {
        // Log the detailed error object for debugging
        console.error("Detailed Error Object:", error);
        // Initialize a default error message
        let errorMessage = "An unexpected error occurred. Please try again.";
        // Extract the specific error message from the API response if available
        if (error?.response?.data?.message) errorMessage = error.response.data.message;
        else if (error.message) // Fallback to the generic error message
        errorMessage = error.message;
        // Display the error message in an alert box
        alert(`Error: ${errorMessage}`);
        // Navigate back to the previous page with a fallback
        window.history.length > 1 ? window.history.back() : window.location.href = "/dashboard/registrations";
        // Log the error for debugging purposes
        console.error("Fetch Workshop Details Error:", error);
        // Optionally, return undefined to indicate failure
        return undefined;
    }
}
async function initializeWorkshopDetailsPage() {
    //initalize files list
    (0, _listWorkshopFiles.initializeDynamicWorkshopFileList)("#filesList");
    // Utility function to parse URL parameters
    const getUrlParams = ()=>{
        const params = new URLSearchParams(window.location.search);
        const workshopId = params.get("workshop");
        const programId = params.get("program");
        const subscriptionId = params.get("subscription");
        return {
            workshopId,
            programId,
            subscriptionId
        };
    };
    const { workshopId, programId, subscriptionId } = getUrlParams();
    if (!programId || !subscriptionId) {
        alert("Invalid access. Program ID or Subscription ID is missing.");
        window.history.back();
        return;
    }
    try {
        // Fetch workshop details with program and subscription params
        const apiResponse = await fetchWorkshopDetails(programId, subscriptionId, workshopId // Optional parameter
        );
        // If fetchWorkshopDetails encounters an error, it handles it and navigates back,
        // so the following code will not execute in that case.
        if (!apiResponse) // In case fetchWorkshopDetails returns undefined due to an error
        return;
        const { workshop, subscription, program, sessions, invoices, caregiver } = apiResponse;
        // Use program details if workshop details are not provided
        const programDetails = program.items.find((p)=>p.id === subscription.program_id);
        // Update workshop and program details on the page
        if (workshop) updateWorkshopDetails(workshop, {
            items: program.items
        }, subscription);
        else if (programDetails) updateWorkshopDetailsFromProgram(programDetails, subscription);
        // Always update program breadcrumb regardless of workshop availability
        if (programDetails) updateProgramBreadcrumb(programDetails);
        updateSubscriptionDetails(subscription);
        // Filter sessions to unique based on session_id
        const uniqueSessions = getUniqueSessions(sessions);
        // Initialize and render the sessions list using fetched data
        initializeDynamicSessionList("#listRegistration", uniqueSessions, subscription, caregiver // Pass the caregiver flag
        );
        // Initialize and render the invoices list using fetched data
        initializePastInvoicesList(".table_body", invoices);
        // Handle Breadcrumbs based on caregiver flag
        handleBreadcrumbs(caregiver, subscription);
        // Handle Caregiver-specific UI adjustments
        if (caregiver) {
            // Remove the Cancel Registration button
            const cancelButton = document.querySelector("#openCancelDialog");
            if (cancelButton) cancelButton.remove();
            // Remove any existing Cancel Registration Dialog if present
            const cancelDialog = document.getElementById("cancelRegistrationDialog");
            if (cancelDialog) cancelDialog.remove();
            // Remove the Payment Details section
            const paymentDetails = document.querySelector(".payment_details_wrap");
            if (paymentDetails) paymentDetails.remove();
        } else // Initialize Cancel Registration Dialog component
        new (0, _cancelRegistrationDialog.CancelRegistrationDialog)({
            containerSelector: ".button_group",
            subscriptionId: subscription.id.toString(),
            onCancelSuccess: ()=>{
                // Redirect to registrations dashboard upon successful cancellation
                window.location.href = "/dashboard/registrations";
            }
        });
        // Trigger the success_trigger element
        triggerSuccessEvent(".success_trigger");
    } catch (error) {
        // Since fetchWorkshopDetails already handles the error, this block can remain empty or be removed.
        // If you prefer, you can log the error here.
        console.error("initializeWorkshopDetailsPage Error:", error);
    }
}
// Function to handle Breadcrumbs based on caregiver flag
function handleBreadcrumbs(caregiver, subscription) {
    const userBreadcrumbList = document.getElementById("userBreadcrumbList");
    const caregiverBreadcrumbList = document.getElementById("caregiverBreadcrumbList");
    if (caregiver) {
        if (userBreadcrumbList) userBreadcrumbList.style.display = "none";
        if (caregiverBreadcrumbList) caregiverBreadcrumbList.style.display = "flex";
        // Fetch caregiver_breadcrumbs from localStorage
        const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
        if (caregiverBreadcrumbs) try {
            const breadcrumbs = JSON.parse(caregiverBreadcrumbs);
            // Update studentBreadcrumb link
            const studentBreadcrumb = document.getElementById("studentBreadcrumb");
            if (studentBreadcrumb) {
                const studentBreadcrumbComponent = new (0, _core.WFComponent)(studentBreadcrumb);
                studentBreadcrumbComponent.setText(breadcrumbs.student_name);
                // Append ?id={student_id} to the href
                const currentHref = studentBreadcrumb.getAttribute("href") || "/dashboard/student/profile";
                const url = new URL(currentHref, window.location.origin);
                url.searchParams.set("id", breadcrumbs.student_id.toString());
                studentBreadcrumbComponent.setAttribute("href", url.toString());
            }
            // Update workshopBreadcrumbCaregiver text
            const workshopBreadcrumbCaregiver = document.getElementById("workshopBreadcrumbCaregiver");
            if (workshopBreadcrumbCaregiver) {
                const workshopBreadcrumbComponent = new (0, _core.WFComponent)(workshopBreadcrumbCaregiver);
                const workshopName = breadcrumbs.workshop_name || breadcrumbs.program_name || "N/A";
                workshopBreadcrumbComponent.setText(workshopName);
            }
        } catch (parseError) {
            console.error("Error parsing caregiver_breadcrumbs from localStorage:", parseError);
        }
        else console.warn("No caregiver_breadcrumbs found in localStorage.");
    } else {
        if (userBreadcrumbList) userBreadcrumbList.style.display = "flex";
        if (caregiverBreadcrumbList) caregiverBreadcrumbList.style.display = "none";
    }
}
// Function to initialize and render the past invoices list using fetched data
async function initializePastInvoicesList(containerSelector, invoices) {
    // Initialize a new instance of WFDynamicList for Invoices
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#invoiceLine"
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
    // Customize the rendering of list items (Invoice Rows)
    list.rowRenderer(({ rowData, rowElement })=>{
        const invoiceRow = new (0, _core.WFComponent)(rowElement);
        // Set the invoice date
        const invoiceDateComponent = invoiceRow.getChildAsComponent("#invoiceDate");
        if (invoiceDateComponent) {
            const invoiceDate = new (0, _core.WFComponent)(invoiceDateComponent.getElement());
            const formattedDate = new Date(rowData.created_at).toLocaleDateString();
            invoiceDate.setText(formattedDate);
        }
        // Set the invoice amount
        const invoiceAmountComponent = invoiceRow.getChildAsComponent("#invoiceAmount");
        if (invoiceAmountComponent) {
            const invoiceAmount = new (0, _core.WFComponent)(invoiceAmountComponent.getElement());
            invoiceAmount.setText(`$${rowData.amount_total}`);
        }
        // Set the receipt link
        const receiptButtonComponent = invoiceRow.getChildAsComponent("#receiptButton");
        if (receiptButtonComponent) {
            const receiptButton = new (0, _core.WFComponent)(receiptButtonComponent.getElement());
            receiptButton.setAttribute("href", rowData.reciept_url);
        }
        // Show the list item
        rowElement.setStyle({
            display: "table-row"
        });
        return rowElement;
    });
    // Load and display invoice data
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        // Set the data to be displayed in the dynamic list
        list.setData(invoices);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error initializing past invoices list:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
    }
}
// Function to update workshop and program details on the page using Workshop details
function updateWorkshopDetails(workshop, programData, subscription) {
    // Update Workshop Image
    const workshopImageElement = document.getElementById("workshopImage");
    if (workshopImageElement) {
        const workshopImage = new (0, _image.WFImage)(workshopImageElement);
        if (workshop.fieldData["main-image"].url) {
            workshopImage.setImage(workshop.fieldData["main-image"].url);
            const imgElement = workshopImage.getElement();
            imgElement.alt = workshop.fieldData["main-image"].alt || "Workshop Image";
        } else {
            workshopImage.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
            const imgElement = workshopImage.getElement();
            imgElement.alt = "Workshop Image";
        }
    }
    // Update Workshop Name
    const workshopNameElement = document.getElementById("workshopName");
    if (workshopNameElement) {
        const workshopName = new (0, _core.WFComponent)(workshopNameElement);
        workshopName.setText(workshop.fieldData.name);
    }
    // Update workshop breadcrumb
    const workshopBreadcrumbElement = document.getElementById("workshopBreadcrumb");
    if (workshopBreadcrumbElement) {
        const workshopBreadcrumb = new (0, _core.WFComponent)(workshopBreadcrumbElement);
        workshopBreadcrumb.setText(workshop.fieldData.name);
    }
    // Update program breadcrumb
    updateProgramBreadcrumbFromItems(programData, subscription);
    // Update Program Name with safe access and debug statements
    const programNameElement = document.getElementById("programName");
    if (programNameElement) {
        const programName = new (0, _core.WFComponent)(programNameElement);
        if (workshop.fieldData && workshop.fieldData.name) programName.setText(workshop.fieldData.name);
        else programName.setText("Program Name Not Available");
    }
    // Update Workshop Short Description
    const workshopShortDescriptionElement = document.getElementById("workshopShortDescription");
    if (workshopShortDescriptionElement) {
        const workshopShortDescription = new (0, _core.WFComponent)(workshopShortDescriptionElement);
        workshopShortDescription.setText(workshop.fieldData["short-description"]);
    }
}
// Function to update workshop and program details using Program details
function updateWorkshopDetailsFromProgram(programDetails, subscription) {
    // Update Program Image
    const programImageElement = document.getElementById("workshopImage");
    if (programImageElement) {
        const programImage = new (0, _image.WFImage)(programImageElement);
        if (programDetails.fieldData["main-image"].url) {
            programImage.setImage(programDetails.fieldData["main-image"].url);
            const imgElement = programImage.getElement();
            imgElement.alt = programDetails.fieldData["main-image"].alt || "Program Image";
        } else {
            programImage.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
            const imgElement = programImage.getElement();
            imgElement.alt = "Program Image";
        }
    }
    // Update Workshop Name with the Program Name
    const workshopNameElement = document.getElementById("workshopName");
    if (workshopNameElement) {
        const workshopName = new (0, _core.WFComponent)(workshopNameElement);
        workshopName.setText(programDetails.fieldData.name);
    }
    // Update Program Name with Program Subheading
    const programNameElement = document.getElementById("programName");
    if (programNameElement) {
        const programName = new (0, _core.WFComponent)(programNameElement);
        programName.setText(programDetails.fieldData.subheading);
    }
    // Update workshop breadcrumb with the Program Name
    const workshopBreadcrumbElement = document.getElementById("workshopBreadcrumb");
    if (workshopBreadcrumbElement) {
        const workshopBreadcrumb = new (0, _core.WFComponent)(workshopBreadcrumbElement);
        workshopBreadcrumb.setText(programDetails.fieldData.name);
    }
}
// Function to update the program breadcrumb element (ensure it's always set)
function updateProgramBreadcrumb(programDetails) {
    const programBreadcrumbElement = document.getElementById("programBreadcrumb");
    if (programBreadcrumbElement) {
        const programBreadcrumb = new (0, _core.WFComponent)(programBreadcrumbElement);
        programBreadcrumb.setText(programDetails.fieldData.name);
        // Update the href attribute to append the program param to the current link
        const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("program", programDetails.id);
        programBreadcrumb.setAttribute("href", url.toString());
    }
}
// Helper function to update program breadcrumb from program items
function updateProgramBreadcrumbFromItems(programData, subscription) {
    const programBreadcrumbElement = document.getElementById("programBreadcrumb");
    if (programBreadcrumbElement) {
        const programBreadcrumb = new (0, _core.WFComponent)(programBreadcrumbElement);
        const matchedProgram = programData.items.find((program)=>program.id === subscription.program_id);
        if (matchedProgram) {
            // Set the breadcrumb text to the program name
            programBreadcrumb.setText(matchedProgram.fieldData.name);
            // Update the href attribute to append the program param to the current link
            const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
            const url = new URL(currentHref, window.location.origin);
            url.searchParams.set("program", matchedProgram.id);
            programBreadcrumb.setAttribute("href", url.toString());
        }
    }
}
// Function to update subscription details on the page
function updateSubscriptionDetails(subscription) {
    // Update Subscription Type
    const subscriptionTypeElement = document.getElementById("subscription_type");
    if (subscriptionTypeElement) {
        const subscriptionType = new (0, _core.WFComponent)(subscriptionTypeElement);
        subscriptionType.setText(subscription.subscription_type);
    }
    // Update Next Invoice Date
    const nextInvoiceDateElement = document.getElementById("nextInvoiceDate");
    if (nextInvoiceDateElement) {
        const nextInvoiceDate = new (0, _core.WFComponent)(nextInvoiceDateElement);
        const nextChargeDateStr = subscription.next_charge_date;
        if (nextChargeDateStr) {
            // Create a new Date object
            const date = new Date(nextChargeDateStr + "T00:00:00Z");
            // Check if the date is valid
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toLocaleDateString("en-US", {
                    timeZone: "UTC"
                });
                nextInvoiceDate.setText(formattedDate);
            } else nextInvoiceDate.setText("Upon Student Approval");
        } else nextInvoiceDate.setText("Upon Student Approval");
    }
    // Update Next Invoice Amount
    const nextInvoiceAmountElement = document.getElementById("nextInvoiceAmount");
    if (nextInvoiceAmountElement) {
        const nextInvoiceAmount = new (0, _core.WFComponent)(nextInvoiceAmountElement);
        const amount = subscription.next_charge_amount;
        if (amount === 0 || amount === null || amount === undefined) {
            // Hide the parent .bento_box.is-dashboard.is-payment-detail element
            const parentElement = nextInvoiceAmountElement.closest(".bento_box.is-dashboard.is-payment-detail");
            if (parentElement instanceof HTMLElement) parentElement.style.display = "none";
        } else nextInvoiceAmount.setText(`$${amount}`);
    }
    // Update FinAid Coupon
    const couponElement = document.getElementById("finAidCoupon");
    if (couponElement) {
        const coupon = new (0, _core.WFComponent)(couponElement);
        if (subscription.coupon && subscription.coupon !== "None") {
            // Remove 'FINAID' from the beginning and add '% discount Applied'
            const couponText = subscription.coupon.replace(/^FINAID/, "").trim() + "% Discount";
            coupon.setText(couponText);
        } else coupon.setText("None");
    }
    // Display or hide finAidDisclaimer based on coupon
    const finAidDisclaimer = document.getElementById("finAidDisclaimer");
    if (finAidDisclaimer) {
        if (subscription.coupon) finAidDisclaimer.style.display = "block";
        else finAidDisclaimer.style.display = "none";
    }
}
// Function to filter unique sessions based on session_id
function getUniqueSessions(sessions) {
    const uniqueMap = {};
    sessions.forEach((session)=>{
        if (!uniqueMap[session.session_id]) uniqueMap[session.session_id] = session;
    });
    return Object.values(uniqueMap);
}
// Function to initialize and render the dynamic sessions list
async function initializeDynamicSessionList(containerSelector, sessions, subscription, caregiver // Add caregiver flag as parameter
) {
    // Initialize a new instance of WFDynamicList for Sessions
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
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
    // Customize the rendering of list items (Session Cards)
    list.rowRenderer(({ rowData, rowElement })=>{
        const sessionCard = new (0, _core.WFComponent)(rowElement);
        // Set the session day
        const sessionDayComponent = sessionCard.getChildAsComponent("#cardSessionDay");
        if (sessionDayComponent) {
            const sessionDay = new (0, _core.WFComponent)(sessionDayComponent.getElement());
            sessionDay.setText(rowData.weekday);
        }
        // Set the session time block
        const sessionTimeBlockComponent = sessionCard.getChildAsComponent("#cardSessionTimeBlock");
        if (sessionTimeBlockComponent) {
            const sessionTimeBlock = new (0, _core.WFComponent)(sessionTimeBlockComponent.getElement());
            sessionTimeBlock.setText(rowData.time_block);
        }
        // Set the session location
        const sessionLocationComponent = sessionCard.getChildAsComponent("#cardSessionLocation");
        if (sessionLocationComponent) {
            const sessionLocation = new (0, _core.WFComponent)(sessionLocationComponent.getElement());
            sessionLocation.setText(rowData.location);
        }
        // Set the link with program, workshop, and subscription parameters
        const sessionCardElement = sessionCard.getElement();
        const currentHref = sessionCardElement.getAttribute("href") || "#";
        // Parse existing URL to avoid malformed URLs
        const url = new URL(currentHref, window.location.origin);
        // Append or set query parameters using subscription and session details
        url.searchParams.set("program", subscription.program_id);
        url.searchParams.set("workshop", subscription.workshop_id);
        url.searchParams.set("session", rowData.session_id);
        url.searchParams.set("subscription", subscription.id.toString());
        // Update the href attribute with the correct parameters
        sessionCardElement.setAttribute("href", url.toString());
        // If the user is a caregiver, update the caregiver_breadcrumbs on session selection
        if (caregiver) sessionCardElement.addEventListener("click", ()=>{
            const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
            if (caregiverBreadcrumbs) try {
                const breadcrumbs = JSON.parse(caregiverBreadcrumbs);
                // Update with session details
                breadcrumbs.session_id = rowData.session_id;
                breadcrumbs.session_weekday = rowData.weekday;
                breadcrumbs.session_time_block = rowData.time_block;
                // Save back to localStorage
                localStorage.setItem("caregiver_breadcrumbs", JSON.stringify(breadcrumbs));
            } catch (e) {
                console.error("Error updating caregiver_breadcrumbs:", e);
            }
            else console.warn("No caregiver_breadcrumbs found in localStorage.");
        });
        // Show the list item
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load and display session data
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        // Set the data to be displayed in the dynamic list
        list.setData(sessions);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error initializing dynamic session list:", error);
        list.setData([]);
        list.changeLoadingStatus(false);
    }
}
// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector) {
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","../registration/components/cancelRegistrationDialog":"lWBXF","./components/listWorkshopFiles":"50Qun","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"lWBXF":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "CancelRegistrationDialog", ()=>CancelRegistrationDialog);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
var _formUtils = require("../../../../utils/formUtils");
var _validationUtils = require("../../../../utils/validationUtils");
class CancelRegistrationDialog {
    constructor(options){
        const { containerSelector, subscriptionId, onCancelSuccess } = options;
        // Initialize WFComponents
        this.container = new (0, _core.WFComponent)(containerSelector);
        this.subscriptionId = subscriptionId;
        this.cancelForm = new (0, _core.WFFormComponent)("#cancelSubscriptionForm");
        this.dialog = new (0, _core.WFComponent)("#inviteCaregiverDialog");
        this.pageMain = new (0, _core.WFComponent)(".page_main"); // Get the main page container
        // Initialize the dialog component
        this.initialize(onCancelSuccess);
    }
    initialize(onCancelSuccess) {
        if (!this.container.getElement()) {
            console.error("Container element not found for CancelRegistrationDialog");
            return;
        }
        // Attach click event to the "Cancel Registration" button
        const openCancelDialogBtn = new (0, _core.WFComponent)("#openCancelDialog");
        if (openCancelDialogBtn.getElement()) openCancelDialogBtn.on("click", ()=>{
            console.log("Open Cancel Registration button clicked");
            this.openDialog();
        });
        else console.error("Open Cancel Registration button not found");
        // Attach click event to close button
        const closeDialogBtn = new (0, _core.WFComponent)("#close-dialog-btn");
        if (closeDialogBtn.getElement()) closeDialogBtn.on("click", ()=>{
            console.log("Close dialog button clicked");
            this.closeDialog();
        });
        else console.error("Close dialog button not found");
        // Setup form submission interception and validation
        this.setupFormSubmission(onCancelSuccess);
        this.setupFormValidation();
    }
    openDialog() {
        if (this.dialog.getElement() && this.pageMain.getElement()) {
            console.log("Opening dialog");
            const dialogElement = this.dialog.getElement();
            dialogElement.showModal(); // Using `showModal()` to make sure it behaves as a dialog
            // Update page_main data-brand attribute to "6" when dialog opens
            console.log("Setting page_main data-brand attribute to 6");
            this.pageMain.setAttribute("data-brand", "6");
        } else console.error("Dialog or page_main element not found");
    }
    closeDialog() {
        if (this.dialog.getElement() && this.pageMain.getElement()) {
            console.log("Closing dialog");
            const dialogElement = this.dialog.getElement();
            dialogElement.close(); // Using `close()` to properly close the dialog
            // Reset page_main data-brand attribute to "2" when dialog closes
            console.log("Resetting page_main data-brand attribute to 2");
            this.pageMain.setAttribute("data-brand", "2");
        } else console.error("Dialog or page_main element not found");
    }
    setupFormSubmission(onCancelSuccess) {
        this.cancelForm.onFormSubmit(async (formData, event)=>{
            event.preventDefault(); // Prevent form default submission
            event.stopPropagation(); // Stop any other event listeners on the form
            console.log("Form submission intercepted");
            const reason = formData.cancelled_because;
            if (!(0, _validationUtils.validateNotEmpty)(reason)) {
                const errorComponent = new (0, _core.WFComponent)("#cancelledReasonError");
                (0, _formUtils.toggleError)(errorComponent, "Reason for cancelling is required.", true);
                return;
            }
            try {
                // Show loading animation
                this.setLoadingState(true);
                // Make DELETE request to API to cancel subscription
                console.log("Submitting cancellation to API for subscription ID:", this.subscriptionId);
                const response = await (0, _apiConfig.apiClient).delete(`/subscriptions/${this.subscriptionId}/cancel`, {
                    data: {
                        reason: reason
                    }
                }).fetch();
                // Extract relevant status from the response data
                if (response && response.status === "Cancelled") {
                    console.log("Cancellation successful");
                    // Clear any previous error messages
                    const errorComponent = new (0, _core.WFComponent)("#cancelledReasonError");
                    (0, _formUtils.toggleError)(errorComponent, "", false); // Explicitly hide error on success
                    // Close dialog and call the success callback
                    this.closeDialog();
                    onCancelSuccess();
                } else // Handle unexpected success response format
                throw new Error(`Unexpected response format or status: ${response.status}`);
            } catch (error) {
                console.error("Error cancelling registration: ", error);
                this.showErrorMessage("Oops! Something went wrong while submitting the form.");
            } finally{
                // Hide loading animation
                this.setLoadingState(false);
            }
        });
    }
    setupFormValidation() {
        const reasonInput = new (0, _core.WFComponent)("#cancelledReason");
        const reasonErrorComponent = new (0, _core.WFComponent)("#cancelledReasonError");
        if (!reasonInput.getElement() || !reasonErrorComponent.getElement()) {
            console.error("Reason input or error component not found for validation");
            return;
        }
        const validateReason = (0, _formUtils.createValidationFunction)(reasonInput, (input)=>(0, _validationUtils.validateNotEmpty)(input), "Reason for cancelling is required.");
        (0, _formUtils.setupValidation)(reasonInput, reasonErrorComponent, validateReason);
    }
    setLoadingState(isLoading) {
        const loadingAnimation = new (0, _core.WFComponent)("#cancelRegistrationRequesting");
        const submitButton = new (0, _core.WFComponent)("#cancelRegistration");
        if (loadingAnimation.getElement() && submitButton.getElement()) {
            if (isLoading) {
                loadingAnimation.setStyle({
                    display: "block"
                });
                submitButton.setAttribute("disabled", "true");
            } else {
                loadingAnimation.setStyle({
                    display: "none"
                });
                submitButton.removeAttribute("disabled");
            }
        } else console.error("Loading animation or submit button not found for setting loading state");
    }
    showErrorMessage(message) {
        const errorElement = new (0, _core.WFComponent)("#submitInviteCaregiverError");
        if (errorElement.getElement()) {
            errorElement.setText(message);
            errorElement.setStyle({
                display: "flex"
            });
        } else console.error("Error element not found for showing error message");
    }
}

},{"@xatom/core":"j9zXV","../../../../api/apiConfig":"2Lx0S","../../../../utils/formUtils":"hvg7i","../../../../utils/validationUtils":"dMBjH","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"hvg7i":[function(require,module,exports) {
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

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../api/apiConfig":"2Lx0S","../auth/authConfig":"gkGgf","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dMBjH":[function(require,module,exports) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"50Qun":[function(require,module,exports) {
// src/pages/listStudentFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files for a specific student
parcelHelpers.export(exports, "fetchWorkshopFiles", ()=>fetchWorkshopFiles);
// Function to initialize and render the dynamic file list for a student
parcelHelpers.export(exports, "initializeDynamicWorkshopFileList", ()=>initializeDynamicWorkshopFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
// Function to get the student_id from URL parameters
function getSubscriptionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("subscription");
}
async function fetchWorkshopFiles(subscriptionId) {
    try {
        const getFiles = (0, _apiConfig.apiClient).get(`/student_files/workshop/${subscriptionId}`);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for student:", error);
        throw error;
    }
}
async function initializeDynamicWorkshopFileList(containerSelector) {
    // Get the student ID from the URL
    const subscriptionId = getSubscriptionIdFromUrl();
    if (!subscriptionId) {
        console.error("No student ID provided in URL");
        return;
    }
    // Initialize a new instance of WFDynamicList for Files
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#fileCard",
        loaderSelector: "#filesloading",
        emptySelector: "#filesEmpty"
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
    // Customize the rendering of list items (File Cards)
    list.rowRenderer(({ rowData, rowElement })=>{
        const fileCard = new (0, _core.WFComponent)(rowElement);
        // Set the fileCard's href to file_url
        fileCard.setAttribute("href", rowData.file_url);
        // Set the fileName to file_name
        const fileName = fileCard.getChildAsComponent("#fileName");
        fileName.setText(rowData.file_name);
        // Show the list item
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load and display file data
    try {
        // Enable the loading state
        list.changeLoadingStatus(true);
        const files = await fetchWorkshopFiles(subscriptionId);
        // Sort files alphabetically by file_name
        files.sort((a, b)=>a.file_name.localeCompare(b.file_name));
        // Set the data to be displayed in the dynamic list
        list.setData(files);
        // Disable the loading state
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading files:", error);
        // If there's an error, set an empty array to trigger the empty state
        list.setData([]);
        // Disable the loading state
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=workshopDetails.dcf5c3cd.js.map
