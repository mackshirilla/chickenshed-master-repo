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
// -------------------- API FETCH -------------------- //
parcelHelpers.export(exports, "fetchWorkshopDetails", ()=>fetchWorkshopDetails);
// -------------------- PAGE INIT -------------------- //
parcelHelpers.export(exports, "initializeWorkshopDetailsPage", ()=>initializeWorkshopDetailsPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
var _listWorkshopFiles = require("./components/listWorkshopFiles");
async function fetchWorkshopDetails(programId, workshopId, subscriptionId) {
    try {
        const params = {
            program: programId
        };
        if (workshopId) params.workshop_id = workshopId;
        if (subscriptionId) params.subscription_id = subscriptionId;
        return await (0, _apiConfig.apiClient).get(`/dashboard/registration/workshop/${workshopId || "none"}`, {
            data: params
        }).fetch();
    } catch (error) {
        console.error("Fetch Workshop Details Error:", error);
        alert(error?.response?.data?.message || error.message || "Unexpected error");
        window.history.back();
        return undefined;
    }
}
async function initializeWorkshopDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const programId = params.get("program");
    const workshopId = params.get("workshop") || undefined;
    const subscriptionId = params.get("subscription") || undefined;
    if (!programId) {
        alert("Invalid access. Missing program parameter.");
        window.history.back();
        return;
    }
    (0, _listWorkshopFiles.initializeDynamicWorkshopFileList)("#filesList");
    const apiResponse = await fetchWorkshopDetails(programId, workshopId, subscriptionId);
    if (!apiResponse) return;
    const { workshop, subscription, program, sessions, caregiver } = apiResponse;
    // Update details
    if (workshop) updateWorkshopDetails(workshop, program);
    else updateWorkshopDetailsFallback(program);
    updateProgramBreadcrumb(program);
    // Sessions
    const uniqueSessions = getUniqueSessions(sessions);
    initializeDynamicSessionList("#listRegistration", uniqueSessions, subscription);
    // Caregiver breadcrumbs
    handleBreadcrumbs(caregiver, subscription);
    triggerSuccessEvent(".success_trigger");
}
// -------------------- UPDATERS -------------------- //
function updateWorkshopDetails(workshop, program) {
    const imgEl = document.getElementById("workshopImage");
    if (imgEl) {
        const img = new (0, _image.WFImage)(imgEl);
        img.setImage(workshop.Main_Image || program.Main_Image);
        img.getElement().alt = workshop.Name;
    }
    [
        [
            "workshopName",
            workshop.Name
        ],
        [
            "workshopBreadcrumb",
            workshop.Name
        ],
        [
            "programName",
            program.name
        ],
        [
            "workshopShortDescription",
            workshop.Short_description
        ]
    ].forEach(([id, text])=>{
        const el = document.getElementById(id);
        if (el) new (0, _core.WFComponent)(el).setText(text);
    });
}
function updateWorkshopDetailsFallback(program) {
    const imgEl = document.getElementById("workshopImage");
    if (imgEl) new (0, _image.WFImage)(imgEl).setImage(program.Main_Image);
    const nameEl = document.getElementById("workshopName");
    if (nameEl) new (0, _core.WFComponent)(nameEl).setText(program.name);
    const progEl = document.getElementById("programName");
    if (progEl) new (0, _core.WFComponent)(progEl).setText(program.Subheading || program.name);
    const bcEl = document.getElementById("workshopBreadcrumb");
    if (bcEl) new (0, _core.WFComponent)(bcEl).setText(program.name);
    const descEl = document.getElementById("workshopShortDescription");
    if (descEl) new (0, _core.WFComponent)(descEl).setText(program.Short_description);
}
function updateProgramBreadcrumb(program) {
    const el = document.getElementById("programBreadcrumb");
    if (!el) return;
    const comp = new (0, _core.WFComponent)(el);
    comp.setText(program.name);
    const url = new URL(el.getAttribute("href") || "#", window.location.origin);
    url.searchParams.set("program", program.id.toString());
    comp.setAttribute("href", url.toString());
}
// -------------------- SESSIONS LIST -------------------- //
function getUniqueSessions(sessions) {
    const map = {};
    sessions.forEach((s)=>{
        if (!map[s.session]) map[s.session] = s;
    });
    return Object.values(map);
}
async function initializeDynamicSessionList(container, sessions, subscription) {
    const list = new (0, _core.WFDynamicList)(container, {
        rowSelector: "#listRegistrationCard",
        loaderSelector: "#listRegistrationloading",
        emptySelector: "#listRegistrationEmpty"
    });
    list.loaderRenderer((loader)=>{
        loader.setStyle({
            display: "flex"
        });
        return loader;
    });
    list.emptyRenderer((empty)=>{
        empty.setStyle({
            display: "flex"
        });
        return empty;
    });
    list.rowRenderer(({ rowData, rowElement })=>{
        const card = new (0, _core.WFComponent)(rowElement);
        const sd = rowData.session_details;
        card.getChildAsComponent("#cardSessionDay").setText(sd?.Weekday || `Session #${rowData.session}`);
        card.getChildAsComponent("#cardSessionTimeBlock").setText(sd?.Time_block || "N/A");
        card.getChildAsComponent("#cardSessionLocation").setText(sd?.location_details?.Name || "N/A");
        const anchor = card.getElement();
        const url = new URL("/dashboard/registration/session", window.location.origin);
        // include program, workshop & subscription IDs
        url.searchParams.set("program", subscription.program.toString());
        url.searchParams.set("workshop", subscription.workshop.toString());
        url.searchParams.set("subscription", subscription.id.toString());
        url.searchParams.set("session", rowData.session.toString());
        anchor.setAttribute("href", url.toString());
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    list.changeLoadingStatus(true);
    list.setData(sessions);
    list.changeLoadingStatus(false);
}
function handleBreadcrumbs(caregiver, subscription) {
    const userList = document.getElementById("userBreadcrumbList");
    const careList = document.getElementById("caregiverBreadcrumbList");
    if (caregiver) {
        userList?.setAttribute("style", "display:none");
        careList?.setAttribute("style", "display:flex");
        const bc = localStorage.getItem("caregiver_breadcrumbs");
        if (bc) try {
            const obj = JSON.parse(bc);
            const stud = document.getElementById("studentBreadcrumb");
            if (stud) {
                const comp = new (0, _core.WFComponent)(stud);
                comp.setText(obj.student_name);
                const url = new URL(stud.getAttribute("href") || "/dashboard/student/profile", window.location.origin);
                url.searchParams.set("id", obj.student_id.toString());
                comp.setAttribute("href", url.toString());
            }
            const wbc = document.getElementById("workshopBreadcrumbCaregiver");
            if (wbc) new (0, _core.WFComponent)(wbc).setText(obj.workshop_name || obj.program_name);
        } catch  {}
    } else {
        userList?.setAttribute("style", "display:flex");
        careList?.setAttribute("style", "display:none");
    }
}
// -------------------- SUCCESS TRIGGER -------------------- //
function triggerSuccessEvent(selector) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) el.click();
}

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","./components/listWorkshopFiles":"50Qun","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

},{"d023971cccd819e3":"j9zXV"}],"50Qun":[function(require,module,exports) {
// src/pages/listStudentFiles.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch files for a specific workshop (+ optional subscription)
parcelHelpers.export(exports, "fetchWorkshopFiles", ()=>fetchWorkshopFiles);
// Function to initialize and render the dynamic file list for a workshop
parcelHelpers.export(exports, "initializeDynamicWorkshopFileList", ()=>initializeDynamicWorkshopFileList);
var _core = require("@xatom/core");
var _apiConfig = require("../../../../api/apiConfig");
// Function to get the workshop_id from URL parameters
function getWorkshopIdFromUrl() {
    return new URLSearchParams(window.location.search).get("workshop");
}
// Function to get the subscription from URL parameters
function getSubscriptionFromUrl() {
    return new URLSearchParams(window.location.search).get("subscription");
}
async function fetchWorkshopFiles(workshopId, subscriptionId) {
    try {
        const path = subscriptionId ? `/student_files/workshop/${workshopId}?subscription=${encodeURIComponent(subscriptionId)}` : `/student_files/workshop/${workshopId}`;
        const getFiles = (0, _apiConfig.apiClient).get(path);
        const response = await getFiles.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching files for workshop:", error);
        throw error;
    }
}
async function initializeDynamicWorkshopFileList(containerSelector) {
    // Get the workshop ID from the URL
    const workshopId = getWorkshopIdFromUrl();
    if (!workshopId) {
        console.error("No workshop ID provided in URL");
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
    // Customize loader
    list.loaderRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    // Customize empty state
    list.emptyRenderer((el)=>{
        el.setStyle({
            display: "flex"
        });
        return el;
    });
    // Customize each row
    list.rowRenderer(({ rowData, rowElement })=>{
        const fileCard = new (0, _core.WFComponent)(rowElement);
        fileCard.setAttribute("href", rowData.file_url);
        fileCard.getChildAsComponent("#fileName").setText(rowData.file_name);
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    // Load & render
    try {
        list.changeLoadingStatus(true);
        const files = await fetchWorkshopFiles(workshopId, subscriptionId);
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

//# sourceMappingURL=workshopDetails.dcf5c3cd.js.map
