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
})({"3zTq7":[function(require,module,exports) {
// src/pages/listDonations.ts
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchDonations", ()=>fetchDonations);
parcelHelpers.export(exports, "initializeDynamicDonationList", ()=>initializeDynamicDonationList);
var _core = require("@xatom/core");
var _image = require("@xatom/image");
var _apiConfig = require("../../api/apiConfig");
async function fetchDonations() {
    try {
        const getDonations = (0, _apiConfig.apiClient).get("/dashboard/donations");
        const response = await getDonations.fetch();
        return response;
    } catch (error) {
        console.error("Error fetching donations:", error);
        throw error;
    }
}
async function initializeDynamicDonationList(containerSelector) {
    const list = new (0, _core.WFDynamicList)(containerSelector, {
        rowSelector: "#listDonationCard",
        loaderSelector: "#listDonationloading",
        emptySelector: "#listDonationEmpty"
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
        const donationCard = new (0, _core.WFComponent)(rowElement);
        const campaignImage = new (0, _image.WFImage)(donationCard.getChildAsComponent("#cardCampaignImage").getElement());
        if (rowData.support_campaign?.Main_Image) campaignImage.setImage(rowData.support_campaign.Main_Image);
        else campaignImage.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg");
        const campaignName = donationCard.getChildAsComponent("#cardCampaignName");
        campaignName.setText(rowData.campaign_name);
        const campaignSubtitle = donationCard.getChildAsComponent("#cardCampaignSubtitle");
        campaignSubtitle.setText(rowData.support_campaign?.Subheading || "");
        const donationDate = donationCard.getChildAsComponent("#cardDonationDate");
        const date = new Date(rowData.created_at);
        donationDate.setText(date.toLocaleDateString());
        const donationAmount = donationCard.getChildAsComponent("#cardDonationAmount");
        donationAmount.setText(`$${rowData.amount.toFixed(2)}`);
        const currentHref = donationCard.getElement().getAttribute("href") || "#";
        const separator = currentHref.includes("?") ? "&" : "?";
        const newHref = `${currentHref}${separator}donation=${rowData.uuid}`;
        donationCard.getElement().setAttribute("href", newHref);
        rowElement.setStyle({
            display: "block"
        });
        return rowElement;
    });
    try {
        list.changeLoadingStatus(true);
        const donations = await fetchDonations();
        donations.sort((a, b)=>b.created_at - a.created_at);
        list.setData(donations);
        list.changeLoadingStatus(false);
    } catch (error) {
        console.error("Error loading donations:", error);
        list.setData([]);
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

//# sourceMappingURL=listDonations.d068a80f.js.map
