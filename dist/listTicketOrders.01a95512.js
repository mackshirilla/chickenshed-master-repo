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
})({"6PQNU":[function(require,module,exports) {
// src/modules/dashboard/listTicketOrders.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ——————————————————————————————————————————————————
// FETCH FUNCTION
// ——————————————————————————————————————————————————
parcelHelpers.export(exports, "fetchTicketOrders", ()=>fetchTicketOrders);
// ——————————————————————————————————————————————————
// DYNAMIC LIST INITIALIZER
// ——————————————————————————————————————————————————
parcelHelpers.export(exports, "initializeDynamicTicketOrderList", ()=>initializeDynamicTicketOrderList);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
async function fetchTicketOrders() {
    const req = (0, _apiConfig.apiClient).get("/dashboard/ticket_orders");
    return await req.fetch();
}
async function initializeDynamicTicketOrderList(containerSelector) {
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listTicketsCard",
        loaderSelector: "#listTicketsloading",
        emptySelector: "#listTicketsEmpty"
    });
    list.loaderRenderer((loaderEl)=>{
        loaderEl.setStyle({
            display: "flex"
        });
        return loaderEl;
    });
    list.emptyRenderer((emptyEl)=>{
        emptyEl.setStyle({
            display: "flex"
        });
        return emptyEl;
    });
    // — formatters for New York —
    const fmtDate = (ts)=>new Date(ts).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        });
    const fmtTime = (ts)=>new Date(ts).toLocaleTimeString("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    list.rowRenderer(({ rowData, rowElement })=>{
        const card = new (0, _core.WFComponent)(rowElement);
        // Performance image
        const imgComp = card.getChildAsComponent("#cardPerformanceImage");
        if (imgComp) {
            const img = new (0, _image.WFImage)(imgComp.getElement());
            img.setImage(rowData.performance_details.Main_Image);
        }
        // Production Name
        const prodComp = card.getChildAsComponent("#cardProductionName");
        prodComp?.setText(rowData.production_details.Name);
        // Performance Name
        const perfComp = card.getChildAsComponent("#cardPerformanceName");
        perfComp?.setText(rowData.performance_details.Displayed_Name);
        // Performance Date & Time in NYC
        const dateComp = card.getChildAsComponent("#cardPerformanceDate");
        if (dateComp) {
            const ts = rowData.performance_details.Date_Time;
            dateComp.setText(`${fmtDate(ts)} at ${fmtTime(ts)}`);
        }
        // Quantity = number of ticket_records
        const qtyComp = card.getChildAsComponent("#quantity");
        qtyComp?.setText(String(rowData.ticket_records.length));
        // Build link with order_uuid param only
        const anchor = card.getElement();
        const href = anchor.getAttribute("href") || "/";
        const url = new URL(href, window.location.origin);
        url.searchParams.set("order", rowData.order_uuid);
        anchor.setAttribute("href", url.toString());
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        const orders = await fetchTicketOrders();
        orders.sort((a, b)=>a.performance_details.Date_Time - b.performance_details.Date_Time);
        list.setData(orders);
    } catch (err) {
        console.error("Error loading ticket orders:", err);
        list.setData([]);
    } finally{
        list.changeLoadingStatus(false);
    }
}

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

//# sourceMappingURL=listTicketOrders.01a95512.js.map
