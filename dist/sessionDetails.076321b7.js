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
})({"lymH8":[function(require,module,exports) {
// src/pages/sessionDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Main function to initialize session details
parcelHelpers.export(exports, "initializeSessionDetails", ()=>initializeSessionDetails);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _removeStudent = require("./components/removeStudent");
var _listSessionFiles = require("./components/listSessionFiles");
// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector) {
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
}
// Function to fetch session details from the API
async function fetchSessionDetails(workshopId, programId, sessionId, subscriptionId) {
    try {
        // Make the API request
        const getSessionDetailsRequest = (0, _apiConfig.apiClient).get(`/dashboard/registration/session/${sessionId}`, {
            data: {
                workshop_id: workshopId,
                program_id: programId,
                session_id: sessionId,
                subscription: subscriptionId
            }
        });
        const response = await getSessionDetailsRequest.fetch();
        return response;
    } catch (error) {
        // Extract and display the error message
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error?.response?.data?.message) errorMessage = error.response.data.message;
        else if (error.message) errorMessage = error.message;
        // Display the error message in an alert box
        alert(`Error: ${errorMessage}`);
        // Navigate back to the previous page with a fallback
        window.history.length > 1 ? window.history.back() : window.location.href = "/dashboard/registrations";
        // Log the error for debugging purposes
        console.error("Fetch Session Details Error:", error);
        // Return undefined to indicate failure
        return undefined;
    }
}
async function initializeSessionDetails() {
    // initialize files
    (0, _listSessionFiles.initializeDynamicSessionFileList)("#filesList");
    const params = new URLSearchParams(window.location.search);
    const workshopId = params.get("workshop") || "none"; // Use "none" if workshopId is not provided
    const programId = params.get("program");
    const sessionId = params.get("session");
    const subscriptionId = params.get("subscription");
    if (!programId || !sessionId || !subscriptionId) {
        displayError("Invalid access. Program ID, Session ID, or Subscription ID is missing.");
        return;
    }
    // Fetch session details with program and subscription params
    const sessionDetails = await fetchSessionDetails(workshopId, programId, sessionId, subscriptionId);
    // If fetchSessionDetails encounters an error, it handles it and navigates back,
    // so the following code will not execute in that case.
    if (!sessionDetails) // In case fetchSessionDetails returns undefined due to an error
    return;
    const { workshop, subscription, program, students, location, session, caregiver } = sessionDetails;
    if (sessionDetails && location && students && session) {
        // Populate UI Elements
        if (workshop) populateWorkshopDetails(workshop);
        else populateProgramDetailsAsWorkshop(program);
        populateSessionDetails(session, location);
        initializeStudentList(students);
        updateBreadcrumbs(program, workshop, session, subscriptionId, workshopId, caregiver);
        // Initialize RemoveStudentDialog with relevant data
        initializeRemoveStudentDialog(subscription.id, sessionId, students, caregiver);
        // Trigger the success_trigger element
        triggerSuccessEvent(".success_trigger");
    } else displayError("Failed to fetch session details. Incomplete data.");
}
// Function to populate workshop details (if workshop is available)
function populateWorkshopDetails(workshop) {
    const workshopName = new (0, _core.WFComponent)("#workshopName"); // Changed to class selector
    workshopName.setText(workshop.fieldData.name);
    const workshopShortDescription = new (0, _core.WFComponent)("#workshopShortDescription"); // Changed to class selector
    workshopShortDescription.setText(workshop.fieldData["short-description"]);
}
// Function to populate program details as workshop details (fallback if workshop is unavailable)
function populateProgramDetailsAsWorkshop(program) {
    const workshopName = new (0, _core.WFComponent)("#workshopName"); // Changed to class selector
    workshopName.setText(program.fieldData.name);
    const workshopShortDescription = new (0, _core.WFComponent)("#workshopShortDescription"); // Changed to class selector
    workshopShortDescription.setText(program.fieldData["short-description"]);
}
// Function to populate session details, including location and time
function populateSessionDetails(session, location) {
    const sessionWeekday = new (0, _core.WFComponent)("#sessionWeekday"); // Changed to class selector
    sessionWeekday.setText(session.fieldData.weekday);
    const sessionTime = new (0, _core.WFComponent)("#sessionTime"); // Changed to class selector
    sessionTime.setText(session.fieldData["time-block"]);
    const sessionLocation = new (0, _core.WFComponent)("#sessionLocation"); // Changed to class selector
    sessionLocation.setText(location.fieldData.name);
    const sessionLocationMap = new (0, _core.WFComponent)("#sessionLocationMap"); // Changed to class selector
    sessionLocationMap.setHTML(location.fieldData["map-embed"]);
    // Apply styling to make sure the map and its container fill properly
    const figureElement = document.querySelector("#sessionLocationMap figure" // Changed to class selector
    );
    const iframeElement = document.querySelector("#sessionLocationMap iframe" // Changed to class selector
    );
    const firstChildDiv = document.querySelector("#sessionLocationMap figure > div" // Changed to class selector
    );
    if (figureElement) {
        figureElement.style.width = "100%";
        figureElement.style.height = "100%";
        figureElement.style.padding = "0";
        figureElement.style.margin = "0";
    }
    if (firstChildDiv) firstChildDiv.style.height = "100%";
    if (iframeElement) {
        iframeElement.style.width = "100%";
        iframeElement.style.height = "100%";
        iframeElement.style.border = "0";
    }
}
// Function to initialize student list
function initializeStudentList(students) {
    const list = new (0, _core.WFDynamicList)("#listStudentProfiles", {
        // Changed selector to class
        rowSelector: "#listStudentCard",
        loaderSelector: "#listStudentProfilesloading",
        emptySelector: "#listStudentProfilesEmpty"
    });
    list.rowRenderer(({ rowData, rowElement })=>{
        const studentCard = new (0, _core.WFComponent)(rowElement);
        const studentNameComponent = studentCard.getChildAsComponent("#studentName"); // Changed to class selector
        const studentImageComponent = studentCard.getChildAsComponent("#listStudentCardImage" // Changed to class selector
        );
        const studentLinkComponent = studentCard.getChildAsComponent("#studentLink"); // Changed to class selector
        const removeButtonComponent = studentCard.getChildAsComponent(".remove_button"); // Select by class
        studentNameComponent?.setText(rowData.student_name);
        studentImageComponent?.setAttribute("src", rowData.image_url);
        // Append ?id={student_id} to the link
        const studentId = rowData.student_profile_id;
        const existingHref = studentLinkComponent?.getAttribute("href") || "#";
        const url = new URL(existingHref, window.location.origin);
        url.searchParams.set("id", studentId.toString());
        studentLinkComponent?.setAttribute("href", url.toString());
        // **Set data attributes on remove button**
        removeButtonComponent?.setAttribute("data-student-id", studentId.toString());
        removeButtonComponent?.setAttribute("data-subscription-item-id", rowData.id.toString());
        // **Set data-student-id on the row element for easy removal later**
        rowElement.setAttribute("data-student-id", studentId.toString());
        return rowElement;
    });
    // Set data to be displayed in the list
    list.setData(students);
}
// Function to update breadcrumbs with program, workshop, and session details
function updateBreadcrumbs(program, workshop, session, subscriptionId, workshopId, caregiver) {
    // Update program breadcrumb
    const programBreadcrumbElement = document.querySelector("#programBreadcrumb"); // Changed to class selector
    if (programBreadcrumbElement) {
        const programBreadcrumb = new (0, _core.WFComponent)(programBreadcrumbElement);
        programBreadcrumb.setText(program.fieldData.name);
        // Update href attribute with program parameter
        const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("program", program.id);
        programBreadcrumb.setAttribute("href", url.toString());
    }
    // Update workshop breadcrumb if workshop exists, otherwise fallback to program name
    const workshopBreadcrumbElement = document.querySelector("#workshopBreadcrumb"); // Changed to class selector
    if (workshopBreadcrumbElement) {
        const workshopBreadcrumb = new (0, _core.WFComponent)(workshopBreadcrumbElement);
        if (workshop) workshopBreadcrumb.setText(workshop.fieldData.name);
        else workshopBreadcrumb.setText(program.fieldData.name);
        // Update href attribute with program, subscription, and optionally workshop parameters
        const currentHref = workshopBreadcrumbElement.getAttribute("href") || "#";
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("program", program.id);
        url.searchParams.set("subscription", subscriptionId);
        if (workshop && workshopId !== "none") url.searchParams.set("workshop", workshopId);
        workshopBreadcrumb.setAttribute("href", url.toString());
    }
    // Update session breadcrumb
    const sessionBreadcrumbElement = document.querySelector("#sessionBreadcrumb"); // Changed to class selector
    if (sessionBreadcrumbElement) {
        const sessionBreadcrumb = new (0, _core.WFComponent)(sessionBreadcrumbElement);
        // Set the text to the combination of the session weekday and time block
        const sessionText = `${session.fieldData.weekday}, ${session.fieldData["time-block"]}`;
        sessionBreadcrumb.setText(sessionText);
    }
    // Handle Breadcrumbs based on caregiver flag
    handleBreadcrumbs(caregiver, program, workshop, session, subscriptionId, workshopId);
}
// Function to handle Breadcrumbs based on caregiver flag
function handleBreadcrumbs(caregiver, program, workshop, session, subscriptionId, workshopId) {
    if (caregiver) {
        // Remove all .remove_button_wrap elements from the DOM
        const removeButtons = document.querySelectorAll(".remove_button_wrap");
        removeButtons.forEach((btn)=>btn.remove());
        // Hide userBreadcrumbList and show caregiverBreadcrumbList
        const userBreadcrumbList = document.querySelector("#userBreadcumbList"); // Changed to class selector
        const caregiverBreadcrumbList = document.querySelector("#caregiverBreadcrumbList" // Changed to class selector
        );
        if (userBreadcrumbList) userBreadcrumbList.setAttribute("style", "display: none;");
        if (caregiverBreadcrumbList) caregiverBreadcrumbList.setAttribute("style", "display: flex;");
        // Fetch caregiver_breadcrumbs from localStorage
        const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
        if (caregiverBreadcrumbs) try {
            const breadcrumbs = JSON.parse(caregiverBreadcrumbs);
            // Update studentBreadcrumb link
            const studentBreadcrumb = document.querySelector("#studentBreadcrumb"); // Changed to class selector
            if (studentBreadcrumb) {
                const studentBreadcrumbComponent = new (0, _core.WFComponent)(studentBreadcrumb);
                studentBreadcrumbComponent.setText(breadcrumbs.student_name);
                // Update href with ?id={student_id}
                const currentHref = studentBreadcrumb.getAttribute("href") || "/dashboard/student/profile";
                const url = new URL(currentHref, window.location.origin);
                url.searchParams.set("id", breadcrumbs.student_id.toString());
                studentBreadcrumbComponent.setAttribute("href", url.toString());
            }
            // Update caregiverWorkshopBreadcrumb text
            const caregiverWorkshopBreadcrumb = document.querySelector("#caregiverWorkshopBreadcrumb" // Changed to class selector
            );
            if (caregiverWorkshopBreadcrumb) {
                const workshopBreadcrumbComponent = new (0, _core.WFComponent)(caregiverWorkshopBreadcrumb);
                // Use workshop_name if present, otherwise use program_name
                const workshopName = breadcrumbs.workshop_name ? breadcrumbs.workshop_name : breadcrumbs.program_name;
                workshopBreadcrumbComponent.setText(workshopName);
                // Update href with program, subscription, and optionally workshop parameters
                const currentHref = caregiverWorkshopBreadcrumb.getAttribute("href") || "#";
                const url = new URL(currentHref, window.location.origin);
                url.searchParams.set("program", breadcrumbs.program_id);
                url.searchParams.set("subscription", breadcrumbs.subscription_id.toString());
                if (breadcrumbs.workshop_id && breadcrumbs.workshop_id !== "none") url.searchParams.set("workshop", breadcrumbs.workshop_id);
                caregiverWorkshopBreadcrumb.setAttribute("href", url.toString());
            }
            // Update caregiverSessionBreadcrumb with session details
            const caregiverSessionBreadcrumb = document.querySelector("#caregiverSessionBreadcrumb" // Changed to class selector
            );
            if (caregiverSessionBreadcrumb) {
                const sessionBreadcrumbComponent = new (0, _core.WFComponent)(caregiverSessionBreadcrumb);
                const sessionText = `${breadcrumbs.session_weekday}, ${breadcrumbs.session_time_block}`;
                sessionBreadcrumbComponent.setText(sessionText);
            }
        } catch (parseError) {
            console.error("Error parsing caregiver_breadcrumbs from localStorage:", parseError);
            alert("Failed to load caregiver breadcrumbs. Please try again.");
        }
        else {
            console.warn("No caregiver_breadcrumbs found in localStorage.");
            alert("Caregiver breadcrumbs data is missing.");
        }
    } else {
        // If not a caregiver, ensure userBreadcrumbList is visible and caregiverBreadcrumbList is hidden
        const userBreadcrumbList = document.querySelector("#userBreadcumbList"); // Changed to class selector
        const caregiverBreadcrumbList = document.querySelector("#caregiverBreadcrumbList" // Changed to class selector
        );
        if (userBreadcrumbList) userBreadcrumbList.setAttribute("style", "display: flex;");
        if (caregiverBreadcrumbList) caregiverBreadcrumbList.setAttribute("style", "display: none;");
    }
}
// Function to initialize RemoveStudentDialog
function initializeRemoveStudentDialog(subscriptionId, sessionId, students, caregiver) {
    if (caregiver) // If caregiver, you might want to handle dialogs differently or disable certain actions
    // For now, we'll assume caregivers don't need the RemoveStudentDialog
    return;
    // Create a new instance of RemoveStudentDialog
    new (0, _removeStudent.RemoveStudentDialog)({
        subscriptionId,
        sessionId,
        students: students.map((student)=>({
                id: student.id,
                student_profile_id: student.student_profile_id,
                student_name: student.student_name
            }))
    });
}
// Function to display an error message on the page and in an alert box
function displayError(message) {
    const errorElement = document.querySelector("#listRegistrationEmpty"); // Changed to class selector
    if (errorElement) {
        errorElement.innerHTML = `<div>${message}</div>`;
        errorElement.setAttribute("style", "display: flex;");
    }
    // Also display the error in an alert box
    alert(`Error: ${message}`);
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
        const invoiceDateComponent = invoiceRow.getChildAsComponent("#invoiceDate"); // Changed to class selector
        if (invoiceDateComponent) {
            const invoiceDate = new (0, _core.WFComponent)(invoiceDateComponent.getElement());
            const formattedDate = new Date(rowData.created_at).toLocaleDateString();
            invoiceDate.setText(formattedDate);
        }
        // Set the invoice amount
        const invoiceAmountComponent = invoiceRow.getChildAsComponent("#invoiceAmount"); // Changed to class selector
        if (invoiceAmountComponent) {
            const invoiceAmount = new (0, _core.WFComponent)(invoiceAmountComponent.getElement());
            invoiceAmount.setText(`$${rowData.amount_total}`);
        }
        // Set the receipt link
        const receiptButtonComponent = invoiceRow.getChildAsComponent("#receiptButton"); // Changed to class selector
        if (receiptButtonComponent) {
            const receiptButton = new (0, _core.WFComponent)(receiptButtonComponent.getElement());
            receiptButton.setAttribute("href", rowData.reciept_url);
        }
        // Show the list item
        rowElement.setAttribute("style", "display: table-row;");
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
        alert("Failed to load past invoices. Please try again.");
        list.setData([]);
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","./components/removeStudent":"9XFOy","./components/listSessionFiles":"3ophI","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"9XFOy":[function(require,module,exports) {
// src/pages/removeStudent.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "RemoveStudentDialog", ()=>RemoveStudentDialog);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
var _validationUtils = require("../../../../utils/validationUtils");
var _formUtils = require("../../../../utils/formUtils");
class RemoveStudentDialog {
    constructor(options){
        const { subscriptionId, sessionId, students } = options;
        this.subscriptionId = subscriptionId;
        this.sessionId = sessionId;
        this.students = students;
        this.dialog = new (0, _core.WFComponent)("#removeStudentDialog"); // Changed to class selector
        this.removeForm = new (0, _core.WFFormComponent)("#cancelSubscriptionForm"); // Changed to class selector
        this.pageMain = new (0, _core.WFComponent)(".page_main");
        this.initialize();
    }
    initialize() {
        // Attach event listeners to the remove buttons
        const removeButtons = document.querySelectorAll(".remove_button"); // Updated selector to class
        if (removeButtons.length === 0) {
            console.error("Remove buttons not found");
            return;
        }
        removeButtons.forEach((button)=>{
            button.addEventListener("click", (event)=>{
                const target = event.currentTarget;
                // Extract data attributes
                const studentProfileId = target.getAttribute("data-student-id");
                const subscriptionItemId = target.getAttribute("data-subscription-item-id");
                console.log("Clicked remove button:", {
                    studentProfileId,
                    subscriptionItemId
                });
                if (!studentProfileId || !subscriptionItemId) {
                    console.error("Missing data attributes on remove button", {
                        studentProfileId,
                        subscriptionItemId
                    });
                    alert("Unable to remove student. Missing necessary data.");
                    return;
                }
                // Find the student using the `student_profile_id`
                const student = this.students.find((s)=>s.student_profile_id.toString() === studentProfileId);
                if (student) {
                    this.studentId = student.student_profile_id.toString();
                    this.subscriptionItemId = student.id; // This is the `subscription_item_id` we need
                    this.openDialog(student.student_name);
                } else {
                    console.error("Student not found in provided student list", {
                        studentProfileId,
                        students: this.students
                    });
                    alert("Student not found. Please try again.");
                }
            });
        });
        // Setup close button listener
        const closeButton = new (0, _core.WFComponent)("#close-dialog-btn"); // Changed to class selector
        if (closeButton.getElement()) closeButton.on("click", ()=>{
            this.closeDialog();
        });
        else console.error("Close dialog button not found");
        // Setup form submission handling
        this.setupFormSubmission();
        this.setupFormValidation();
    }
    openDialog(studentName) {
        if (this.dialog.getElement() && this.pageMain.getElement()) {
            console.log("Opening remove student dialog");
            const studentNameElement = new (0, _core.WFComponent)("#removeStudentName"); // Changed to class selector
            studentNameElement.setText(studentName);
            // Update page_main data-brand attribute
            if (this.pageMain.getElement()) this.pageMain.setAttribute("data-brand", "6");
            else console.error("page_main element not found");
            const dialogElement = this.dialog.getElement();
            if (dialogElement) dialogElement.showModal(); // Using `showModal()` to ensure it behaves as a modal
            else console.error("Dialog element not found");
        } else console.error("Dialog or page_main element not found");
    }
    closeDialog() {
        if (this.dialog.getElement() && this.pageMain.getElement()) {
            console.log("Closing remove student dialog");
            // Reset page_main data-brand attribute
            if (this.pageMain.getElement()) this.pageMain.setAttribute("data-brand", "2");
            else console.error("page_main element not found");
            const dialogElement = this.dialog.getElement();
            if (dialogElement) dialogElement.close(); // Using `close()` to properly close the dialog
            else console.error("Dialog element not found");
        } else console.error("Dialog or page_main element not found");
    }
    setupFormSubmission() {
        this.removeForm.onFormSubmit(async (formData, event)=>{
            event.preventDefault(); // Prevent form default submission
            event.stopPropagation(); // Stop any other event listeners on the form
            console.log("Remove student form submission intercepted");
            const reason = formData.removed_because;
            if (!(0, _validationUtils.validateNotEmpty)(reason)) {
                const errorComponent = new (0, _core.WFComponent)("#removedReasonError"); // Changed to class selector
                (0, _formUtils.toggleError)(errorComponent, "Reason for removing the student is required.", true);
                return;
            }
            try {
                // Show loading animation
                this.setLoadingState(true);
                if (!this.studentId || !this.subscriptionItemId) throw new Error("No student ID or subscription item ID found for removal.");
                // Make DELETE request to API to remove student
                console.log("Submitting removal to API for student ID:", this.studentId, "with subscription item ID:", this.subscriptionItemId);
                const response = await (0, _apiConfig.apiClient).delete(`/subscriptions/${this.subscriptionId}/session/${this.sessionId}/student/${this.studentId}`, {
                    data: {
                        reason: reason,
                        subscription_item_id: this.subscriptionItemId
                    }
                }).fetch();
                if (response) {
                    console.log("Student removed successfully");
                    // Clear any previous error messages
                    const errorComponent = new (0, _core.WFComponent)("#removedReasonError"); // Changed to class selector
                    (0, _formUtils.toggleError)(errorComponent, "", false); // Explicitly hide error on success
                    // Close dialog and remove student from UI
                    this.closeDialog();
                    this.removeStudentFromUI(this.studentId);
                } else throw new Error("Unexpected response received from student removal API.");
            } catch (error) {
                console.error("Error removing student: ", error);
                this.showErrorMessage("Oops! Something went wrong while submitting the form.");
            } finally{
                // Hide loading animation
                this.setLoadingState(false);
            }
        });
    }
    setupFormValidation() {
        const reasonInput = new (0, _core.WFComponent)("#removedReason"); // Changed to class selector
        const reasonErrorComponent = new (0, _core.WFComponent)("#removedReasonError"); // Changed to class selector
        if (!reasonInput.getElement() || !reasonErrorComponent.getElement()) {
            console.error("Reason input or error component not found for validation");
            return;
        }
        const validateReason = (0, _formUtils.createValidationFunction)(reasonInput, (input)=>(0, _validationUtils.validateNotEmpty)(input), "Reason for removing the student is required.");
        (0, _formUtils.setupValidation)(reasonInput, reasonErrorComponent, validateReason);
    }
    setLoadingState(isLoading) {
        const loadingAnimation = new (0, _core.WFComponent)("#removeStudentRequesting"); // Changed to class selector
        const submitButton = new (0, _core.WFComponent)("#removeStudentSubmit"); // Changed to class selector
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
    removeStudentFromUI(studentId) {
        const studentRow = document.querySelector(`#listStudentCard[data-student-id="${studentId}"]`);
        if (studentRow) {
            studentRow.remove();
            console.log(`Removed student row with data-student-id="${studentId}" from UI.`);
        } else console.error(`Student row with data-student-id="${studentId}" not found in DOM.`);
    }
    showErrorMessage(message) {
        const errorElement = new (0, _core.WFComponent)("#submitInviteCaregiverError"); // Changed to class selector
        if (errorElement.getElement()) {
            errorElement.setText(message);
            errorElement.setStyle({
                display: "flex"
            });
        } else console.error("Error element not found for showing error message");
    }
}

},{"@xatom/core":"j9zXV","../../../../api/apiConfig":"2Lx0S","../../../../utils/validationUtils":"dMBjH","../../../../utils/formUtils":"hvg7i","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"dMBjH":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"3ophI":[function(require,module,exports) {
// src/pages/listStudentFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files for a specific student
parcelHelpers.export(exports, "fetchSessionFiles", ()=>fetchSessionFiles);
// Function to initialize and render the dynamic file list for a student
parcelHelpers.export(exports, "initializeDynamicSessionFileList", ()=>initializeDynamicSessionFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
// Function to get the student_id from URL parameters
function getSessionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("session");
}
async function fetchSessionFiles(sessionId) {
    try {
        const getFiles = (0, _apiConfig.apiClient).get(`/student_files/session/${sessionId}`);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for student:", error);
        throw error;
    }
}
async function initializeDynamicSessionFileList(containerSelector) {
    // Get the student ID from the URL
    const sessionId = getSessionIdFromUrl();
    if (!sessionId) {
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
        const files = await fetchSessionFiles(sessionId);
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

//# sourceMappingURL=sessionDetails.076321b7.js.map
