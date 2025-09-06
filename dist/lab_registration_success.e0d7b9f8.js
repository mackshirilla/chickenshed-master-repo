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
})({"jQ15w":[function(require,module,exports) {
// src/success_page/lab_registration_success.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ---------- Master: always renders a (grouped-by-workshop) list ----------
parcelHelpers.export(exports, "handleLabRegistrationSuccess", ()=>handleLabRegistrationSuccess);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
// ---------- Helpers ----------
const getSessionIdFromUrl = ()=>{
    const params = new URLSearchParams(window.location.search);
    // Your success URLs use ?order={CHECKOUT_SESSION_ID}; fall back to ?session_id
    return params.get("order") || params.get("session_id");
};
const chooseImage = (item)=>item.workshop_details?.Main_Image || item.program_details?.Main_Image || null;
/** Group items by workshop (workshop_id or workshop_details.id).
 *  For each group, pick a representative row (earliest Start_Date if available).
 */ const groupByWorkshop = (items)=>{
    const groups = new Map();
    for (const it of items){
        const key = it.workshop_id ?? it.workshop_details?.id ?? // very defensive fallback (unlikely needed)
        Math.abs((it.workshop_name || "").toLowerCase().split("").reduce((a, c)=>a + c.charCodeAt(0), 0));
        const arr = groups.get(key) ?? [];
        arr.push(it);
        groups.set(key, arr);
    }
    // choose one representative per workshop (earliest session start if available)
    const reps = [];
    for (const arr of groups.values()){
        const best = arr.slice().sort((a, b)=>{
            const da = a.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
            const db = b.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
            return da - db;
        })[0];
        reps.push(best);
    }
    // order cards by earliest start date (then name)
    reps.sort((a, b)=>{
        const da = a.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
        const db = b.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
        if (da !== db) return da - db;
        return (a.workshop_name || "").localeCompare(b.workshop_name || "");
    });
    return reps;
};
/** Add a stable hook class and strip id so cloned rows don't duplicate IDs. */ const hookAndStrip = (root, idOrClass, hookClass)=>{
    // Accept either an element with that id, or one already using our hookClass
    const el = root.querySelector(`#${idOrClass}, .${hookClass}`);
    if (!el) return null;
    if (!el.classList.contains(hookClass)) el.classList.add(hookClass);
    if (el.id === idOrClass) el.removeAttribute("id");
    return el;
};
async function handleLabRegistrationSuccess() {
    const urlSessionId = getSessionIdFromUrl();
    if (!urlSessionId) {
        console.error("Missing order/session_id param in URL");
        return;
    }
    const req = (0, _apiConfig.apiClient).get(`/success_page/lab_registration/${encodeURIComponent(urlSessionId)}`);
    try {
        const { data } = await new Promise((resolve, reject)=>{
            req.onData((res)=>resolve(res));
            req.onError(reject);
            req.fetch();
        });
        const rawItems = Array.isArray(data) ? data : [];
        if (!rawItems.length) console.warn("No lab registrations returned.");
        // 1) Group by workshop
        const grouped = groupByWorkshop(rawItems);
        // 2) Build the dynamic list using your Webflow structure
        const list = new (0, _core.WFDynamicList)("#labList", {
            rowSelector: "#labRegistrationCard"
        });
        list.rowRenderer(({ rowData, rowElement })=>{
            const rowRoot = rowElement.getElement();
            rowRoot.classList.add("js-labRegistrationCard");
            if (rowRoot.id === "labRegistrationCard") rowRoot.removeAttribute("id");
            const imgEl = hookAndStrip(rowRoot, "labCardImage", "js-labCardImage");
            const progEl = hookAndStrip(rowRoot, "labCardProgram", "js-labCardProgram");
            const workEl = hookAndStrip(rowRoot, "labCardWorkshop", "js-labCardWorkshop");
            // Image
            if (imgEl instanceof HTMLImageElement) {
                const wfImg = new (0, _image.WFImage)(imgEl);
                const src = chooseImage(rowData);
                if (src) wfImg.setImage(src);
                wfImg.getElement().alt = `${rowData.program_name} \u{2014} ${rowData.workshop_name}`;
            }
            if (progEl) new (0, _core.WFComponent)(progEl).setText(rowData.program_name || "");
            if (workEl) new (0, _core.WFComponent)(workEl).setText(rowData.workshop_name || "");
            // Preserve ?order param, plus append program + subscription=none
            try {
                const anchor = rowRoot;
                const href = anchor.getAttribute("href") || "#";
                const u = new URL(href, window.location.origin);
                u.searchParams.set("order", rowData.checkout_session_id || urlSessionId);
                u.searchParams.set("program", String(rowData.program_details?.id ?? ""));
                u.searchParams.set("subscription", "none");
                anchor.setAttribute("href", u.toString());
            } catch  {
            /* noop */ }
            rowRoot.style.display = "block";
            return rowElement;
        });
        list.setData(grouped);
        const container = document.getElementById("labList");
        if (container) container.style.display = "block";
        document.querySelector(".success_trigger")?.click();
    } catch (err) {
        console.error("Error loading lab registration list:", err);
    }
}
// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", handleLabRegistrationSuccess);

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

//# sourceMappingURL=lab_registration_success.e0d7b9f8.js.map
