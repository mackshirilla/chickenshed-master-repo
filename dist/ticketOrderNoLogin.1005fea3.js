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
})({"25rOv":[function(require,module,exports) {
// src/pages/ticketOrderNoLogin.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ——————————————————————————————————————————————————
// FETCH FUNCTION (uses `order` param)
// ——————————————————————————————————————————————————
parcelHelpers.export(exports, "fetchTickets", ()=>fetchTickets);
// ——————————————————————————————————————————————————
// PAGE INITIALIZER
// ——————————————————————————————————————————————————
parcelHelpers.export(exports, "initializeTicketOrderNoLoginPage", ()=>initializeTicketOrderNoLoginPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
async function fetchTickets(orderUuid) {
    try {
        const req = (0, _apiConfig.apiClient).get(`/tickets/get_tickets/${orderUuid}`);
        return await req.fetch();
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return null;
    }
}
async function initializeTicketOrderNoLoginPage() {
    const params = new URLSearchParams(window.location.search);
    const orderUuid = params.get("order");
    if (!orderUuid) {
        console.error("Missing order UUID");
        return;
    }
    const data = await fetchTickets(orderUuid);
    if (!data) {
        console.error("Failed to fetch ticket details");
        return;
    }
    const { tickets, order, performance } = data;
    // Trigger success if needed
    document.querySelector(".success_trigger")?.click();
    // — formatters for NYC —
    const fmtDate = (ts)=>new Date(ts).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        });
    const fmtTime = (ts)=>new Date(ts).toLocaleTimeString("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    // Order header
    new (0, _core.WFComponent)("#productionName").setText(performance.production_details.Name);
    new (0, _core.WFComponent)("#performanceName").setText(performance.Displayed_Name);
    new (0, _core.WFComponent)("#performanceLocation").setText(performance.location_details.Name);
    new (0, _core.WFComponent)("#performanceDate").setText(fmtDate(performance.Date_Time));
    new (0, _core.WFComponent)("#performanceTime").setText(fmtTime(performance.Date_Time));
    // Map embed
    const mapComp = new (0, _core.WFComponent)("#performanceLocationMap");
    mapComp.getElement().innerHTML = performance.location_details.Map_embed;
    const fig = mapComp.getElement().querySelector("figure");
    const div = mapComp.getElement().querySelector("figure > div");
    const ifr = mapComp.getElement().querySelector("iframe");
    if (fig) fig.style.cssText = "width:100%;height:100%;padding:0;margin:0;";
    if (div) div.style.cssText = "width:100%;height:100%;";
    if (ifr) ifr.style.cssText = "width:100%;height:100%;border:0;";
    // Assistance section
    if (order.assistance_required) {
        new (0, _core.WFComponent)("#assistanceRequestedTrue").setStyle({
            display: "block"
        });
        new (0, _core.WFComponent)("#assistanceRequestedFalse").setStyle({
            display: "none"
        });
    } else {
        new (0, _core.WFComponent)("#assistanceRequestedTrue").setStyle({
            display: "none"
        });
        new (0, _core.WFComponent)("#assistanceRequestedFalse").setStyle({
            display: "block"
        });
    }
    new (0, _core.WFComponent)("#assistanceMessage").setText(order.assistance_message || "N/A");
    // Short description
    new (0, _core.WFComponent)("#performanceShortDescription").setText(performance.Short_Description || "");
    // Ticket list
    const list = new (0, _core.WFDynamicList)("#ticketList", {
        rowSelector: "#ticketItem"
    });
    tickets.sort((a, b)=>a.id - b.id);
    list.rowRenderer(({ rowData, rowElement })=>{
        const card = new (0, _core.WFComponent)(rowElement);
        // QR code
        new (0, _image.WFImage)(card.getChildAsComponent(".ticket_qr").getElement()).setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${rowData.id}`);
        // Production & performance
        card.getChildAsComponent("#ticketProductionName").setText(performance.production_details.Name);
        card.getChildAsComponent("#ticketPerformanceName").setText(performance.Displayed_Name);
        // Date & time
        card.getChildAsComponent("#ticketPerformanceDate").setText(`${fmtDate(performance.Date_Time)} at ${fmtTime(performance.Date_Time)}`);
        // Tier & seating
        card.getChildAsComponent("#ticketTicketTier").setText(rowData.ticket_tier[0].Displayed_Name);
        card.getChildAsComponent("#ticketSeatingAssignment").setText(rowData.seating_assignment);
        return rowElement;
    });
    list.setData(tickets);
    // Print tickets
    new (0, _core.WFComponent)("#printTickets").on("click", ()=>{
        const container = document.querySelector("#ticketList");
        if (!container) return;
        const w = window.open("", "_blank", "width=800,height=600");
        if (!w) return;
        const styles = Array.from(document.styleSheets).map((ss)=>ss.href ? `<link rel="stylesheet" href="${ss.href}">` : "").join("\n");
        const headerHTML = `
      <div class="hero-section">
        <h1>${performance.production_details.Name}</h1>
        <p>${fmtDate(performance.Date_Time)} at ${fmtTime(performance.Date_Time)}</p>
      </div>`;
        w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Tickets</title>
          ${styles}
        <style>
          /* Force all text black */
          body, #ticketList, .ticket_wrap, .hero-section, h1, p {
            color: black !important;
          }

          /* existing layout rules */
          body { padding:1rem 3rem; }
          #ticketList { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
          .ticket_wrap { page-break-inside:avoid; }
          .hero-section { text-align:center; margin-bottom:2rem; }
          .hero-section h1 { margin:0; font-size:2rem; }
          .hero-section p { margin:.5rem 0; font-size:1.25rem; }
        </style>
        </head>
        <body>
          ${headerHTML}
          ${container.outerHTML}
        </body>
      </html>
    `);
        w.document.close();
        w.print();
    });
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

//# sourceMappingURL=ticketOrderNoLogin.1005fea3.js.map
