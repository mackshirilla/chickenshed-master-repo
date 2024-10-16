!function(e,t,r,o,i){var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},s="function"==typeof n[o]&&n[o],a=s.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function l(t,r){if(!a[t]){if(!e[t]){var i="function"==typeof n[o]&&n[o];if(!r&&i)return i(t,!0);if(s)return s(t,!0);if(c&&"string"==typeof t)return c(t);var u=Error("Cannot find module '"+t+"'");throw u.code="MODULE_NOT_FOUND",u}f.resolve=function(r){var o=e[t][1][r];return null!=o?o:r},f.cache={};var d=a[t]=new l.Module(t);e[t][0].call(d.exports,f,d,d.exports,this)}return a[t].exports;function f(e){var t=f.resolve(e);return!1===t?{}:l(t)}}l.isParcelRequire=!0,l.Module=function(e){this.id=e,this.bundle=l,this.exports={}},l.modules=e,l.cache=a,l.parent=s,l.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(l,"root",{get:function(){return n[o]}}),n[o]=l;for(var u=0;u<t.length;u++)l(t[u])}({fmeF7:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"fetchSubscriptions",()=>a),o.export(r,"initializeDynamicSubscriptionList",()=>c);var i=e("@xatom/core"),n=e("@xatom/image"),s=e("../../api/apiConfig");async function a(){try{let e=(0,s.apiClient).get("/subscriptions");return(await e.fetch()).subscriptions}catch(e){throw console.error("Error fetching subscriptions:",e),e}}async function c(e){let t=new i.WFDynamicList(e,{rowSelector:"#listRegistrationCard",loaderSelector:"#listRegistrationloading",emptySelector:"#listRegistrationEmpty"});t.loaderRenderer(e=>(e.setStyle({display:"flex"}),e)),t.emptyRenderer(e=>(e.setStyle({display:"flex"}),e)),t.rowRenderer(({rowData:e,rowElement:t})=>{let r=new i.WFComponent(t),o=new n.WFImage(r.getChildAsComponent("#cardRegistrationImage").getElement());e.image_url?o.setImage(e.image_url):o.setImage("https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"),r.getChildAsComponent("#cardProgramName").setText(e.program_name);let s=r.getElement().getAttribute("href")||"#",a=s.includes("?")?"&":"?",c=`${s}${a}program=${e.program_id}`;return r.getElement().setAttribute("href",c),t.setStyle({display:"block"}),t});try{t.changeLoadingStatus(!0);let e=await a(),r=new Map;e.forEach(e=>{r.has(e.program_id)||r.set(e.program_id,e)});let o=Array.from(r.values());o.sort((e,t)=>e.program_name.localeCompare(t.program_name)),t.setData(o),t.changeLoadingStatus(!1)}catch(e){console.error("Error loading subscriptions:",e),t.setData([]),t.changeLoadingStatus(!1)}}},{"@xatom/core":"65YBq","@xatom/image":"bavwf","../../api/apiConfig":"dUmIV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],bavwf:[function(e,t,r){var o,i=e("d023971cccd819e3"),n={};Object.defineProperty(n,"WFImage",{get:()=>s,set:void 0,enumerable:!0,configurable:!0});class s extends i.WFComponent{constructor(e){super(e)}getImageConfig(){return this._config}getSrc(){return this.getAttribute("src")}getSizes(){return this.getAttribute("sizes")}getSrcSet(){return this.getAttribute("srcset")}getLoading(){return this.getAttribute("loading")}onLoad(e){return this.on("load",e),()=>{this.off("load",e)}}onLoadError(e){return this.on("error",e),()=>{this.off("error",e)}}setImage(e){if("string"==typeof e)this.setAttribute("src",e),this.removeAttribute("srcset"),this.removeAttribute("sizes");else{if(this.setAttribute("src",e.src),"object"==typeof e&&e.srcSet&&e.srcSet.length&&e.sizes&&e.sizes.length){let t=e.srcSet.map(e=>`${e.url} ${e.size}`).join(", ");this.setAttribute("srcset",t)}else this.removeAttribute("srcset"),this.removeAttribute("sizes");e.loading&&this.setAttribute("loading",e.loading)}}}o=t.exports,Object.keys(n).forEach(function(e){"default"===e||"__esModule"===e||o.hasOwnProperty(e)||Object.defineProperty(o,e,{enumerable:!0,get:function(){return n[e]}})})},{d023971cccd819e3:"65YBq"}]},[],0,"parcelRequired346");
//# sourceMappingURL=listRegistration.c36f4b3b.js.map
