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
})({"8duNh":[function(require,module,exports) {
// src/pages/ticketOrder.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Function to fetch ticket details from the API
parcelHelpers.export(exports, "fetchTickets", ()=>fetchTickets);
// Function to initialize and render the ticket order page
parcelHelpers.export(exports, "initializeTicketOrderPage", ()=>initializeTicketOrderPage);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../../api/apiConfig");
async function fetchTickets(orderId) {
    try {
        const getTickets = (0, _apiConfig.apiClient).get(`/dashboard/get_tickets/${orderId}`);
        const response = await getTickets.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return null;
    }
}
async function initializeTicketOrderPage() {
    // Extract the order ID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = parseInt(urlParams.get("order")?.replace("?", "") || "0", 10);
    if (!orderId) {
        console.error("Invalid order ID");
        return;
    }
    try {
        // Fetch ticket details
        const response = await fetchTickets(orderId);
        if (!response) {
            console.error("Failed to fetch ticket details");
            return;
        }
        triggerSuccessEvent(".success_trigger");
        const { tickets, order, sale, performance } = response;
        // Set the production and performance details
        const productionName = new (0, _core.WFComponent)("#productionName");
        productionName.setText(order.production_name);
        const performanceName = new (0, _core.WFComponent)("#performanceName");
        performanceName.setText(order.performance_name);
        const performanceLocation = new (0, _core.WFComponent)("#performanceLocation");
        performanceLocation.setText(order.location);
        // Set the performance time and date separately
        const performanceDate = new (0, _core.WFComponent)("#performanceDate");
        const date = new Date(order.performance_date_time);
        performanceDate.setText(date.toLocaleDateString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        }));
        const performanceTime = new (0, _core.WFComponent)("#performanceTime");
        performanceTime.setText(date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }));
        // Set the performance name, date, and time to the breadcrumb
        const ticketOrderBreadcrumb = document.querySelector("#ticketOrderBreadcrumb");
        if (ticketOrderBreadcrumb) {
            const breadcrumbComponent = new (0, _core.WFComponent)("#ticketOrderBreadcrumb");
            // Set the text to include performance name and date/time
            breadcrumbComponent.setText(`${order.performance_name} - ${date.toLocaleDateString([], {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit"
            })} at ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })}`);
        }
        // Set the location map
        const performanceLocationMap = new (0, _core.WFComponent)("#performanceLocationMap");
        performanceLocationMap.getElement().innerHTML = performance.location.response.result.fieldData["map-embed"];
        // Apply styling to make sure the map and its container fill properly
        const figureElement = document.querySelector("#performanceLocationMap figure");
        const iframeElement = document.querySelector("#performanceLocationMap iframe");
        const firstChildDiv = document.querySelector("#performanceLocationMap figure > div");
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
        // Set the description
        const performanceShortDescription = new (0, _core.WFComponent)("#performanceShortDescription");
        performanceShortDescription.setText(performance.performance.response.result.fieldData["short-description"] || "Description not available.");
        // Set assistance requested status
        const assistanceRequestedTrue = new (0, _core.WFComponent)("#assistanceRequestedTrue");
        const assistanceRequestedFalse = new (0, _core.WFComponent)("#assistanceRequestedFalse");
        if (order.assistance_required) {
            assistanceRequestedTrue.setStyle({
                display: "block"
            });
            assistanceRequestedFalse.setStyle({
                display: "none"
            });
        } else {
            assistanceRequestedTrue.setStyle({
                display: "none"
            });
            assistanceRequestedFalse.setStyle({
                display: "block"
            });
        }
        const assistanceMessage = new (0, _core.WFComponent)("#assistanceMessage");
        assistanceMessage.setText(order.assistance_message || "N/A");
        // Set the billing information
        const invoiceDate = new (0, _core.WFComponent)("#invoiceDate");
        const saleDateFormatted = new Date(sale.created_at);
        invoiceDate.setText(saleDateFormatted.toLocaleDateString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit"
        }));
        const invoiceAmount = new (0, _core.WFComponent)("#invoiceAmount");
        invoiceAmount.setText(`$${sale.amount_total}`);
        const receiptButton = new (0, _core.WFComponent)("#receiptButton");
        receiptButton.getElement().setAttribute("href", sale.reciept_url);
        // Initialize and render the list of tickets
        const ticketList = new (0, _core.WFDynamicList)("#ticketList", {
            rowSelector: "#ticketItem"
        });
        // Sort tickets by ID
        tickets.sort((a, b)=>a.id - b.id);
        // Customize the rendering of list items (Ticket Cards)
        ticketList.rowRenderer(({ rowData, rowElement })=>{
            const ticketCard = new (0, _core.WFComponent)(rowElement);
            // Set the QR code image
            const qrCodeImage = new (0, _image.WFImage)(ticketCard.getChildAsComponent(".ticket_qr").getElement());
            qrCodeImage.setImage(rowData.qr_code.url);
            // Set the production name
            const ticketProductionName = ticketCard.getChildAsComponent("#ticketProductionName");
            ticketProductionName.setText(rowData.production_name);
            // Set the performance name
            const ticketPerformanceName = ticketCard.getChildAsComponent("#ticketPerformanceName");
            ticketPerformanceName.setText(rowData.performance_name);
            // Set the performance date
            const ticketPerformanceDate = ticketCard.getChildAsComponent("#ticketPerformanceDate");
            const ticketDate = new Date(rowData.performance_date_time);
            ticketPerformanceDate.setText(`${ticketDate.toLocaleDateString([], {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit"
            })} at ${ticketDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })}`);
            // Set the ticket tier
            const ticketTier = ticketCard.getChildAsComponent("#ticketTicketTier");
            ticketTier.setText(rowData.ticket_tier_name);
            // Set the seating assignment
            const seatingAssignment = ticketCard.getChildAsComponent("#ticketSeatingAssignment");
            seatingAssignment.setText(rowData.seating_assignment);
            return rowElement;
        });
        // Set the tickets data to the dynamic list
        ticketList.setData(tickets);
        // Add event listener for printing tickets
        const printTicketsButton = new (0, _core.WFComponent)("#printTickets");
        printTicketsButton.on("click", ()=>{
            const ticketListElement = document.querySelector("#ticketList");
            if (ticketListElement) {
                // Open a new window with specified size for printing
                const printWindow = window.open("", "_blank", "width=800,height=600");
                if (printWindow) {
                    // Get all stylesheets from the current document
                    const styleSheets = Array.from(document.styleSheets).map((styleSheet)=>{
                        try {
                            return styleSheet.href ? `<link rel="stylesheet" href="${styleSheet.href}">` : "";
                        } catch (e) {
                            console.error("Error accessing stylesheet:", e);
                            return "";
                        }
                    }).join("");
                    // Extract production name, performance name, and performance date/time for hero section
                    const productionName = document.querySelector("#productionName")?.innerText || "Production Name";
                    const performanceName = document.querySelector("#performanceName")?.innerText || "Performance Name";
                    const performanceDate = document.querySelector("#performanceDate")?.innerText || "Performance Date";
                    const performanceTime = document.querySelector("#performanceTime")?.innerText || "Performance Time";
                    // Create a printable HTML with styles included
                    printWindow.document.write(`
        <html>
          <head>
            <title>Print Tickets</title>
            ${styleSheets}
            <style>
              /* Additional print-specific styling to handle layout and formatting */
              body {
                background-color: var(--theme--background);
                font-family: var(--text-main--font-family);
                color: #121331;
                font-size: var(--text-main--font-size);
                line-height: var(--text-main--line-height);
                letter-spacing: var(--text-main--letter-spacing);
                overscroll-behavior: none;
                font-weight: var(--text--font-weight);
                text-transform: var(--text--text-transform);
                padding: 1rem 3rem; 
              }
              
              #ticketList {
                display: grid; /* Set display to grid */
                grid-template-columns: repeat(3, 1fr); /* Create 2 columns */
                gap: 20px; /* Add some spacing between the grid items */
                color: black; /* Set color to black for ticket list */
              }

              .ticket_wrap {
                page-break-inside: avoid; /* Avoid breaking ticket content across pages */
              }

              * {
                box-sizing: border-box;
              }

              .hero-section {
                text-align: center;
                margin-bottom: 2rem;
              }

              .hero-section h1 {
                margin: 0;
                font-size: 2rem;
                font-weight: bold;
              }

              .hero-section p {
                margin: 0.5rem 0;
                font-size: 1.25rem;
              }
            </style>
          </head>
          <body>
            <div class="hero-section">
              <h1>${productionName}</h1>
              <p><strong>${performanceName}</strong></p>
              <p>${performanceDate} at ${performanceTime}</p>
            </div>
            ${ticketListElement.outerHTML}
          </body>
        </html>
      `);
                    printWindow.document.close();
                    printWindow.print();
                }
            }
        });
    } catch (error) {
        console.error("Error initializing ticket order page:", error);
    }
}
const triggerSuccessEvent = (selector)=>{
    const successTrigger = document.querySelector(selector);
    if (successTrigger instanceof HTMLElement) successTrigger.click();
};

},{"@xatom/core":"j9zXV","@xatom/image":"ly8Ay","../../../api/apiConfig":"2Lx0S","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}],"ly8Ay":[function(require,module,exports) {
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

//# sourceMappingURL=ticketOrderDetails.01cc206a.js.map