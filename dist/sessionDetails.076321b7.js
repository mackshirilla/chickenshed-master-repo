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
// -------------------- MAIN INITIALIZER --------------------
parcelHelpers.export(exports, "initializeSessionDetails", ()=>initializeSessionDetails);
var _core = require("@xatom/core");
var _apiConfig = require("../../../api/apiConfig");
var _listSessionFiles = require("./components/listSessionFiles");
// -------------------- HELPERS --------------------
function triggerSuccessEvent(selector) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) el.click();
}
function displayError(message) {
    const errEl = document.querySelector("#listStudentProfilesEmpty");
    if (errEl) {
        errEl.innerHTML = `<div>${message}</div>`;
        errEl.setAttribute("style", "display: flex;");
    }
    alert(`Error: ${message}`);
}
// -------------------- API CALL --------------------
async function fetchSessionDetails(workshopId, programId, sessionId, subscriptionId) {
    try {
        const data = {
            workshop_id: workshopId,
            program_id: programId,
            session_id: sessionId
        };
        if (subscriptionId) data.subscription_id = subscriptionId;
        return await (0, _apiConfig.apiClient).get(`/dashboard/registration/session/${sessionId}`, {
            data
        }).fetch();
    } catch (error) {
        const msg = error?.response?.data?.message || error.message || "Unexpected error";
        alert(`Error: ${msg}`);
        if (window.history.length > 1) window.history.back();
        else window.location.href = "/dashboard/registrations";
        return undefined;
    }
}
async function initializeSessionDetails() {
    (0, _listSessionFiles.initializeDynamicSessionFileList)("#filesList");
    const params = new URLSearchParams(window.location.search);
    const workshopId = params.get("workshop") || "none";
    const programId = params.get("program");
    const sessionId = params.get("session");
    const subscriptionId = params.get("subscription") || undefined;
    if (!programId || !sessionId) {
        displayError("Invalid access. Missing parameters.");
        return;
    }
    const data = await fetchSessionDetails(workshopId, programId, sessionId, subscriptionId);
    if (!data) return;
    const { program, workshop, session, students, caregiver } = data;
    const location = session.location_details;
    if (workshop) populateWorkshopDetails(workshop);
    else populateProgramDetailsAsWorkshop(program);
    populateSessionDetails(session, location);
    initializeStudentList(students);
    updateBreadcrumbs(program, workshop, session, subscriptionId, caregiver);
    triggerSuccessEvent(".success_trigger");
}
// -------------------- POPULATE UI --------------------
function populateWorkshopDetails(workshop) {
    new (0, _core.WFComponent)("#workshopName").setText(workshop.Name);
    new (0, _core.WFComponent)("#workshopShortDescription").setText(workshop.Short_description);
}
function populateProgramDetailsAsWorkshop(program) {
    new (0, _core.WFComponent)("#workshopName").setText(program.name);
    new (0, _core.WFComponent)("#workshopShortDescription").setText(program.Short_description);
}
function populateSessionDetails(session, location) {
    new (0, _core.WFComponent)("#sessionWeekday").setText(session.Weekday);
    new (0, _core.WFComponent)("#sessionTime").setText(session.Time_block);
    new (0, _core.WFComponent)("#sessionLocation").setText(location?.Name ?? "");
    const container = document.getElementById("sessionLocationMap");
    if (container && location?.Map_embed) {
        container.style.display = "";
        container.innerHTML = location.Map_embed;
        container.querySelectorAll("figure, iframe, figure > div").forEach((el)=>{
            el.style.cssText = "width:100%;height:100%;margin:0;padding:0;border:0;";
        });
    } else if (container) container.style.display = "none";
}
// -------------------- STUDENTS LIST --------------------
function initializeStudentList(students) {
    const list = new (0, _core.WFDynamicList)("#listStudentProfiles", {
        rowSelector: "#listStudentCard",
        loaderSelector: "#listStudentProfilesloading",
        emptySelector: "#listStudentProfilesEmpty"
    });
    list.rowRenderer(({ rowData, rowElement })=>{
        const comp = new (0, _core.WFComponent)(rowElement);
        new (0, _core.WFComponent)(comp.getChildAsComponent("#studentName").getElement()).setText(rowData.full_name);
        comp.getChildAsComponent("img#listStudentCardImage")?.setAttribute("src", rowData.profile_pic || "https://cdn.prod.website-files.com/placeholder.svg");
        const linkComp = comp.getChildAsComponent("#studentLink");
        if (linkComp) {
            const href = linkComp.getAttribute("href") || "#";
            const url = new URL(href, window.location.origin);
            url.searchParams.set("id", rowData.student_id.toString());
            linkComp.setAttribute("href", url.toString());
        }
        return rowElement;
    });
    list.setData(students);
}
// -------------------- BREADCRUMBS --------------------
function updateBreadcrumbs(program, workshop, session, subscriptionId, caregiver) {
    // Program crumb
    const progEl = document.querySelector("#programBreadcrumb");
    if (progEl) {
        new (0, _core.WFComponent)(progEl).setText(program.name);
        const u = new URL(progEl.href, window.location.origin);
        u.searchParams.set("program", program.id.toString());
        if (subscriptionId) u.searchParams.set("subscription", subscriptionId);
        progEl.href = u.toString();
    }
    // Workshop crumb + chevron
    const workEl = document.querySelector("#workshopBreadcrumb");
    const icon = workEl?.previousElementSibling;
    if (workEl) {
        if (workshop) {
            workEl.style.display = "";
            icon && (icon.style.display = "");
            new (0, _core.WFComponent)(workEl).setText(workshop.Name);
            const u = new URL(workEl.href, window.location.origin);
            u.searchParams.set("program", program.id.toString());
            u.searchParams.set("workshop", workshop.id.toString());
            if (subscriptionId) u.searchParams.set("subscription", subscriptionId);
            workEl.href = u.toString();
        } else {
            workEl.style.display = "none";
            icon && (icon.style.display = "none");
        }
    }
    // Session crumb
    const sessEl = document.querySelector("#sessionBreadcrumb");
    if (sessEl) new (0, _core.WFComponent)(sessEl).setText(`${session.Weekday}, ${session.Time_block}`);
    // If this is a caregiver view, hide all normal breadcrumbs
    const userList = document.querySelector("#userBreadcumbList");
    if (caregiver) userList?.setAttribute("style", "display: none;");
    else userList?.setAttribute("style", "display: flex;");
}

},{"@xatom/core":"j9zXV","../../../api/apiConfig":"2Lx0S","./components/listSessionFiles":"3ophI","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"3ophI":[function(require,module,exports) {
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
