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
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ---- API Fetch ----
/**
 * Fetch program details, including subscription context if provided.
 */ parcelHelpers.export(exports, "fetchProgramDetails", ()=>fetchProgramDetails);
// ---- Page Init ----
parcelHelpers.export(exports, "initializeProgramDetailsPage", ()=>initializeProgramDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _listProgramFiles = require("./components/listProgramFiles");
async function fetchProgramDetails(programId, subscriptionId) {
    const params = {
        program: programId
    };
    if (subscriptionId) params.subscription = subscriptionId;
    const getProgramDetails = (0, _apiConfig.apiClient).get(`/dashboard/registration/program/${programId}`, {
        data: params
    });
    const response = await getProgramDetails.fetch();
    return response;
}
async function initializeProgramDetailsPage() {
    await (0, _listProgramFiles.initializeDynamicProgramFileList)("#filesList");
    const params = new URLSearchParams(window.location.search);
    const programId = params.get("program");
    const subscriptionId = params.get("subscription") || undefined;
    if (!programId) return displayError("Invalid access. Program ID is missing.");
    try {
        const { program, workshops } = await fetchProgramDetails(programId, subscriptionId);
        updateProgramDetails(program);
        // Sort items alphabetically by name or by weekday+time
        const sortedItems = [
            ...workshops
        ].sort((a, b)=>{
            if (a.weekday && b.weekday) return `${a.weekday} ${a.time_block}`.localeCompare(`${b.weekday} ${b.time_block}`);
            return a.name.localeCompare(b.name);
        });
        // Elements
        const workshopBox = document.getElementById("program-workshops");
        const sessionBox = document.getElementById("program-sessions");
        // Hide both by default
        if (workshopBox) workshopBox.style.display = "none";
        if (sessionBox) sessionBox.style.display = "none";
        // Determine which to show
        const hasWorkshops = sortedItems.length > 0 && sortedItems[0].weekday === undefined;
        if (hasWorkshops) {
            if (workshopBox) workshopBox.style.display = "flex";
            await initializeDynamicWorkshopList("#program-workshops #listRegistration", sortedItems, program, subscriptionId);
        } else {
            if (sessionBox) sessionBox.style.display = "flex";
            await initializeDynamicSessionList("#program-sessions #listRegistration", sortedItems, program.id, subscriptionId);
        }
        // trigger hidden success element for any downstream listeners
        const trigger = document.querySelector(".success_trigger");
        if (trigger instanceof HTMLElement) trigger.click();
    } catch  {
        displayError("An error occurred while loading the program details.");
    }
}
// ---- DOM Updaters ----
function updateProgramDetails(program) {
    const imgEl = document.getElementById("programImage");
    if (imgEl) {
        const img = new (0, _image.WFImage)(imgEl);
        img.setImage(program.Main_Image || "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
        img.getElement().alt = program.name;
    }
    const mappings = [
        [
            "programName",
            program.name
        ],
        [
            "programBreadcrumb",
            program.name
        ],
        [
            "programSubheading",
            program.Subheading
        ],
        [
            "programShortDescription",
            program.Short_description
        ]
    ];
    mappings.forEach(([id, text])=>{
        const el = document.getElementById(id);
        if (el) new (0, _core.WFComponent)(el).setText(text);
    });
}
function displayError(message) {
    const empty = document.getElementById("listRegistrationEmpty");
    if (empty) {
        empty.innerHTML = `<div>${message}</div>`;
        empty.style.display = "flex";
    }
}
// ---- Dynamic Workshop List ----
async function initializeDynamicWorkshopList(containerSelector, workshops, program, subscriptionId) {
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
    });
    list.loaderRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    list.emptyRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    list.rowRenderer(({ rowData, rowElement })=>{
        const card = new (0, _core.WFComponent)(rowElement);
        // Image
        const imgComp = card.getChildAsComponent("#cardRegistrationImage");
        if (imgComp) {
            const img = new (0, _image.WFImage)(imgComp.getElement());
            img.setImage(rowData.Main_Image || program.Main_Image);
        }
        // Title
        card.getChildAsComponent("#cardProgramName")?.setText(rowData.name);
        card.getChildAsComponent("#cardWorkshopName")?.setText(program.name);
        // Link: program, workshop, subscription
        const anchor = card.getElement();
        const url = new URL("/dashboard/registration/workshop", window.location.origin);
        url.searchParams.set("program", String(program.id));
        url.searchParams.set("workshop", String(rowData.id));
        if (subscriptionId) url.searchParams.set("subscription", subscriptionId);
        anchor.setAttribute("href", url.toString());
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    try {
        list.setData(workshops);
    } catch  {
        list.setData([]);
    }
}
// ---- Dynamic Session List ----
async function initializeDynamicSessionList(containerSelector, sessions, programId, subscriptionId) {
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
    });
    list.loaderRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    list.emptyRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    list.rowRenderer(({ rowData, rowElement })=>{
        const card = new (0, _core.WFComponent)(rowElement);
        card.getChildAsComponent("#cardSessionDay")?.setText(rowData.weekday || "");
        card.getChildAsComponent("#cardSessionTimeBlock")?.setText(rowData.time_block || "");
        card.getChildAsComponent("#cardSessionLocation")?.setText(rowData.location_name || "");
        // Link
        const anchor = card.getElement();
        const url = new URL("/dashboard/registration/session", window.location.origin);
        url.searchParams.set("program", String(programId));
        if (subscriptionId) url.searchParams.set("subscription", subscriptionId);
        url.searchParams.set("session", String(rowData.id));
        anchor.setAttribute("href", url.toString());
        rowElement.setStyle({
            display: "flex"
        });
        return rowElement;
    });
    try {
        list.setData(sessions);
    } catch  {
        list.setData([]);
    }
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","./components/listProgramFiles":"hU0CB","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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
// Function to fetch files for a specific program (+ optional subscription)
parcelHelpers.export(exports, "fetchProgramFiles", ()=>fetchProgramFiles);
// Function to initialize and render the dynamic file list for a program
parcelHelpers.export(exports, "initializeDynamicProgramFileList", ()=>initializeDynamicProgramFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
// Function to get the program_id from URL parameters
function getProgramIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("program");
}
// Function to get the subscription from URL parameters
function getSubscriptionFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("subscription");
}
async function fetchProgramFiles(programId, subscriptionId) {
    try {
        // build path with optional subscription query
        const path = subscriptionId ? `/student_files/program/${programId}?subscription=${encodeURIComponent(subscriptionId)}` : `/student_files/program/${programId}`;
        const getFiles = (0, _apiConfig.apiClient).get(path);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for program:", error);
        throw error;
    }
}
async function initializeDynamicProgramFileList(containerSelector) {
    // Get the program ID from the URL
    const programId = getProgramIdFromUrl();
    if (!programId) {
        console.error("No program ID provided in URL");
        return;
    }
    // Get optional subscription ID
    const subscriptionId = getSubscriptionFromUrl();
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
        fileCard.setAttribute("href", rowData.file_url);
        const fileName = fileCard.getChildAsComponent("#fileName");
        fileName.setText(rowData.file_name);
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load and display file data
    try {
        list.changeLoadingStatus(true);
        const files = await fetchProgramFiles(programId, subscriptionId);
        files.sort((a, b)=>a.file_name.localeCompare(b.file_name));
        list.setData(files);
    } catch (error) {
        console.error("Error loading files:", error);
        list.setData([]);
    } finally{
        list.changeLoadingStatus(false);
    }
}

},{"@xatom/core":"j9zXV","../../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequired346")

//# sourceMappingURL=programDetails.c9f6ac6c.js.map
