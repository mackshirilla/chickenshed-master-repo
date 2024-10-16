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
})({"207Bq":[function(require,module,exports) {
// src/pages/programDetails.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch program details and subscriptions from the API
parcelHelpers.export(exports, "fetchProgramDetails", ()=>fetchProgramDetails);
// Function to initialize and render the program details and subscriptions
parcelHelpers.export(exports, "initializeProgramDetailsPage", ()=>initializeProgramDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _listProgramFiles = require("./components/listProgramFiles");
async function fetchProgramDetails(programId) {
    try {
        const getProgramDetails = (0, _apiConfig.apiClient).get(`/dashboard/registration/program/${programId}`);
        const response = await getProgramDetails.fetch();
        return response;
    } catch (error) {
        throw error;
    }
}
async function initializeProgramDetailsPage() {
    // Initialize the dynamic program files list
    await (0, _listProgramFiles.initializeDynamicProgramFileList)("#filesList");
    // Utility function to parse URL parameters
    const getUrlParams = ()=>{
        const params = new URLSearchParams(window.location.search);
        const programId = params.get("program");
        return {
            programId
        };
    };
    const { programId } = getUrlParams();
    if (!programId) {
        displayError("Invalid access. Program ID is missing.");
        return;
    }
    try {
        // Fetch program details and subscriptions
        const apiResponse = await fetchProgramDetails(programId);
        const { subscriptions, program } = apiResponse;
        // Update program details on the page
        updateProgramDetails(program);
        // Initialize and render the subscriptions list using fetched data
        await initializeDynamicSubscriptionList("#listRegistration", subscriptions, program);
        // Trigger the success_trigger element
        triggerSuccessEvent(".success_trigger");
    } catch (error) {
        displayError("An error occurred while loading the program details.");
    }
}
// Function to update program details on the page
function updateProgramDetails(program) {
    // Update Program Image
    const programImageElement = document.getElementById("programImage");
    if (programImageElement) {
        const programImage = new (0, _image.WFImage)(programImageElement);
        if (program.response.result.fieldData["main-image"].url) {
            programImage.setImage(program.response.result.fieldData["main-image"].url);
            const imgElement = programImage.getElement();
            imgElement.alt = program.response.result.fieldData["main-image"].alt || "Program Image";
        } else {
            programImage.setImage("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
            const imgElement = programImage.getElement();
            imgElement.alt = "Program Image";
        }
    }
    // Update Program Name
    const programNameElement = document.getElementById("programName");
    if (programNameElement) {
        const programName = new (0, _core.WFComponent)(programNameElement);
        programName.setText(program.response.result.fieldData.name);
    }
    // Update program breadcrumb
    const programBreadcrumbElement = document.getElementById("programBreadcrumb");
    if (programBreadcrumbElement) {
        const programBreadcrumb = new (0, _core.WFComponent)(programBreadcrumbElement);
        programBreadcrumb.setText(program.response.result.fieldData.name);
    }
    // Update Program Subheading
    const programSubheadingElement = document.getElementById("programSubheading");
    if (programSubheadingElement) {
        const programSubheading = new (0, _core.WFComponent)(programSubheadingElement);
        programSubheading.setText(program.response.result.fieldData.subheading);
    }
    // Update Program Short Description
    const programShortDescriptionElement = document.getElementById("programShortDescription");
    if (programShortDescriptionElement) {
        const programShortDescription = new (0, _core.WFComponent)(programShortDescriptionElement);
        programShortDescription.setText(program.response.result.fieldData["short-description"]);
    }
}
// Function to display an error message on the page
function displayError(message) {
    const errorElement = document.getElementById("listRegistrationEmpty");
    if (errorElement) {
        errorElement.innerHTML = `<div>${message}</div>`;
        errorElement.style.display = "flex";
    }
}
// Function to initialize and render the dynamic subscription list
async function initializeDynamicSubscriptionList(containerSelector, subscriptions, program) {
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
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
    list.rowRenderer(({ rowData, rowElement })=>{
        const registrationCard = new (0, _core.WFComponent)(rowElement);
        // Set the program image using image_url or fallback to program image
        const registrationImageComponent = registrationCard.getChildAsComponent("#cardRegistrationImage");
        if (registrationImageComponent) {
            const registrationImage = new (0, _image.WFImage)(registrationImageComponent.getElement());
            if (rowData.image_url) registrationImage.setImage(rowData.image_url);
            else if (program.response.result.fieldData["main-image"].url) registrationImage.setImage(program.response.result.fieldData["main-image"].url);
            else registrationImage.setImage("https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg");
        }
        // Set the program name
        const programNameComponent = registrationCard.getChildAsComponent("#cardProgramName");
        if (programNameComponent) programNameComponent.setText(rowData.program_name);
        // Set the workshop name
        const workshopNameComponent = registrationCard.getChildAsComponent("#cardWorkshopName");
        if (workshopNameComponent) workshopNameComponent.setText(rowData.workshop_name);
        // Set the link with subscription and workshop parameters
        const subscriptionCardElement = registrationCard.getElement();
        const currentHref = subscriptionCardElement.getAttribute("href") || "#";
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("program", rowData.program_id);
        url.searchParams.set("workshop", rowData.workshop_id);
        url.searchParams.set("subscription", rowData.id.toString());
        subscriptionCardElement.setAttribute("href", url.toString());
        // Get the #cardActivePill and #cardDepositPill elements
        const cardActivePill = registrationCard.getChildAsComponent("#cardActivePill");
        const cardDepositPill = registrationCard.getChildAsComponent("#cardDepositPill");
        // Hide both pills by default
        cardActivePill.setStyle({
            display: "none"
        });
        cardDepositPill.setStyle({
            display: "none"
        });
        // Set display based on the status
        if (rowData.status === "Active") cardActivePill.setStyle({
            display: "block"
        });
        else if (rowData.status === "Deposit Paid") cardDepositPill.setStyle({
            display: "block"
        });
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    try {
        list.setData(subscriptions);
    } catch (error) {
        list.setData([]);
    }
}
// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector) {
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU","./components/listProgramFiles":"hU0CB"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"hU0CB":[function(require,module,exports) {
// src/pages/listStudentFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files for a specific student
parcelHelpers.export(exports, "fetchProgramFiles", ()=>fetchProgramFiles);
// Function to initialize and render the dynamic file list for a student
parcelHelpers.export(exports, "initializeDynamicProgramFileList", ()=>initializeDynamicProgramFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
// Function to get the student_id from URL parameters
function getProgramIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("program");
}
async function fetchProgramFiles(programId) {
    try {
        const getFiles = (0, _apiConfig.apiClient).get(`/student_files/program/${programId}`);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for student:", error);
        throw error;
    }
}
async function initializeDynamicProgramFileList(containerSelector) {
    // Get the student ID from the URL
    const programId = getProgramIdFromUrl();
    if (!programId) {
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
        const files = await fetchProgramFiles(programId);
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

//# sourceMappingURL=programDetails.c9f6ac6c.js.map
