!function(e,t,r,n,o){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof i[n]&&i[n],s=a.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function l(t,r){if(!s[t]){if(!e[t]){var o="function"==typeof i[n]&&i[n];if(!r&&o)return o(t,!0);if(a)return a(t,!0);if(c&&"string"==typeof t)return c(t);var d=Error("Cannot find module '"+t+"'");throw d.code="MODULE_NOT_FOUND",d}f.resolve=function(r){var n=e[t][1][r];return null!=n?n:r},f.cache={};var u=s[t]=new l.Module(t);e[t][0].call(u.exports,f,u,u.exports,this)}return s[t].exports;function f(e){var t=f.resolve(e);return!1===t?{}:l(t)}}l.isParcelRequire=!0,l.Module=function(e){this.id=e,this.bundle=l,this.exports={}},l.modules=e,l.cache=s,l.parent=a,l.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(l,"root",{get:function(){return i[n]}}),i[n]=l;for(var d=0;d<t.length;d++)l(t[d])}({gXsgU:[function(e,t,r){var n=e("@parcel/transformer-js/src/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"fetchDonations",()=>s),n.export(r,"initializeDynamicDonationList",()=>c);var o=e("@xatom/core"),i=e("@xatom/image"),a=e("../../api/apiConfig");async function s(){try{let e=(0,a.apiClient).get("/dashboard/donations");return await e.fetch()}catch(e){throw console.error("Error fetching donations:",e),e}}async function c(e){let t=new o.WFDynamicList(e,{rowSelector:"#listDonationCard",loaderSelector:"#listDonationloading",emptySelector:"#listDonationEmpty"});t.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),t.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),t.rowRenderer(({rowData:e,rowElement:t})=>{let r=new o.WFComponent(t),n=new i.WFImage(r.getChildAsComponent("#cardCampaignImage").getElement());e.campaign_image_url?n.setImage(e.campaign_image_url):n.setImage("https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"),r.getChildAsComponent("#cardCampaignName").setText(e.campaign_name);let a=r.getChildAsComponent("#cardCampaignSubtitle"),s=e.keep_anonymous?"Anonymous Donation":`Thank you, ${e.customer_first_name}!`;a.setText(s);let c=r.getChildAsComponent("#cardDonationDate"),l=new Date(e.created_at);c.setText(l.toLocaleDateString()),r.getChildAsComponent("#cardDonationAmount").setText(`$${e.amount.toFixed(2)}`);let d=r.getElement().getAttribute("href")||"#",u=d.includes("?")?"&":"?",f=`${d}${u}campaign=${e.campaign_id}&donation=${e.id}`;return r.getElement().setAttribute("href",f),t.setStyle({display:"block"}),t});try{t.changeLoadingStatus(!0);let e=await s();e.sort((e,t)=>t.created_at-e.created_at),t.setData(e),t.changeLoadingStatus(!1)}catch(e){console.error("Error loading donations:",e),t.setData([]),t.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,r){var n,o=e("d023971cccd819e3"),i={};Object.defineProperty(i,"WFImage",{get:()=>a,set:void 0,enumerable:!0,configurable:!0});class a extends o.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}n=t.exports,Object.keys(i).forEach(function(e){"default"===e||"__esModule"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return i[e]}})})},{d023971cccd819e3:"65YBq"}]},[],0,"parcelRequired346");
//# sourceMappingURL=listDonations.45f6d674.js.map
