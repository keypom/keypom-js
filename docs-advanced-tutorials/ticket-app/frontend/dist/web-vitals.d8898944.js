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
})({"a2e18":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "6878709ed8898944";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, globalThis, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets, assetsToDispose, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome; // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets); // Dispose all old assets.
                let processedAssets = {} /*: {|[string]: boolean|} */ ;
                for(let i = 0; i < assetsToDispose.length; i++){
                    let id = assetsToDispose[i][1];
                    if (!processedAssets[id]) {
                        hmrDispose(assetsToDispose[i][0], id);
                        processedAssets[id] = true;
                    }
                } // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] ✨ Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
             // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDispose(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle, id) {
    // Execute the module.
    bundle(id); // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) {
            assetsToAlsoAccept.forEach(function(a) {
                hmrDispose(a[0], a[1]);
            }); // $FlowFixMe[method-unbinding]
            assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
        }
    });
}

},{}],"8CbZs":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getCLS", ()=>b);
parcelHelpers.export(exports, "getFCP", ()=>L);
parcelHelpers.export(exports, "getFID", ()=>M);
parcelHelpers.export(exports, "getINP", ()=>z);
parcelHelpers.export(exports, "getLCP", ()=>J);
parcelHelpers.export(exports, "getTTFB", ()=>Q);
parcelHelpers.export(exports, "onCLS", ()=>b);
parcelHelpers.export(exports, "onFCP", ()=>L);
parcelHelpers.export(exports, "onFID", ()=>M);
parcelHelpers.export(exports, "onINP", ()=>z);
parcelHelpers.export(exports, "onLCP", ()=>J);
parcelHelpers.export(exports, "onTTFB", ()=>Q);
var e, n, t, r, i, a = -1, o = function(e) {
    addEventListener("pageshow", function(n) {
        n.persisted && (a = n.timeStamp, e(n));
    }, !0);
}, c = function() {
    return window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
}, u = function() {
    var e = c();
    return e && e.activationStart || 0;
}, f = function(e, n) {
    var t = c(), r = "navigate";
    return a >= 0 ? r = "back-forward-cache" : t && (r = document.prerendering || u() > 0 ? "prerender" : document.wasDiscarded ? "restore" : t.type.replace(/_/g, "-")), {
        name: e,
        value: void 0 === n ? -1 : n,
        rating: "good",
        delta: 0,
        entries: [],
        id: "v3-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12),
        navigationType: r
    };
}, s = function(e, n, t) {
    try {
        if (PerformanceObserver.supportedEntryTypes.includes(e)) {
            var r = new PerformanceObserver(function(e) {
                Promise.resolve().then(function() {
                    n(e.getEntries());
                });
            });
            return r.observe(Object.assign({
                type: e,
                buffered: !0
            }, t || {})), r;
        }
    } catch (e) {}
}, d = function(e, n, t, r) {
    var i, a;
    return function(o) {
        n.value >= 0 && (o || r) && ((a = n.value - (i || 0)) || void 0 === i) && (i = n.value, n.delta = a, n.rating = function(e, n) {
            return e > n[1] ? "poor" : e > n[0] ? "needs-improvement" : "good";
        }(n.value, t), e(n));
    };
}, l = function(e) {
    requestAnimationFrame(function() {
        return requestAnimationFrame(function() {
            return e();
        });
    });
}, v = function(e) {
    var n = function(n) {
        "pagehide" !== n.type && "hidden" !== document.visibilityState || e(n);
    };
    addEventListener("visibilitychange", n, !0), addEventListener("pagehide", n, !0);
}, p = function(e) {
    var n = !1;
    return function(t) {
        n || (e(t), n = !0);
    };
}, m = -1, h = function() {
    return "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
}, g = function(e) {
    "hidden" === document.visibilityState && m > -1 && (m = "visibilitychange" === e.type ? e.timeStamp : 0, T());
}, y = function() {
    addEventListener("visibilitychange", g, !0), addEventListener("prerenderingchange", g, !0);
}, T = function() {
    removeEventListener("visibilitychange", g, !0), removeEventListener("prerenderingchange", g, !0);
}, E = function() {
    return m < 0 && (m = h(), y(), o(function() {
        setTimeout(function() {
            m = h(), y();
        }, 0);
    })), {
        get firstHiddenTime () {
            return m;
        }
    };
}, C = function(e) {
    document.prerendering ? addEventListener("prerenderingchange", function() {
        return e();
    }, !0) : e();
}, L = function(e, n) {
    n = n || {}, C(function() {
        var t, r = [
            1800,
            3e3
        ], i = E(), a = f("FCP"), c = s("paint", function(e) {
            e.forEach(function(e) {
                "first-contentful-paint" === e.name && (c.disconnect(), e.startTime < i.firstHiddenTime && (a.value = Math.max(e.startTime - u(), 0), a.entries.push(e), t(!0)));
            });
        });
        c && (t = d(e, a, r, n.reportAllChanges), o(function(i) {
            a = f("FCP"), t = d(e, a, r, n.reportAllChanges), l(function() {
                a.value = performance.now() - i.timeStamp, t(!0);
            });
        }));
    });
}, b = function(e, n) {
    n = n || {}, L(p(function() {
        var t, r = [
            .1,
            .25
        ], i = f("CLS", 0), a = 0, c = [], u = function(e) {
            e.forEach(function(e) {
                if (!e.hadRecentInput) {
                    var n = c[0], t = c[c.length - 1];
                    a && e.startTime - t.startTime < 1e3 && e.startTime - n.startTime < 5e3 ? (a += e.value, c.push(e)) : (a = e.value, c = [
                        e
                    ]);
                }
            }), a > i.value && (i.value = a, i.entries = c, t());
        }, p = s("layout-shift", u);
        p && (t = d(e, i, r, n.reportAllChanges), v(function() {
            u(p.takeRecords()), t(!0);
        }), o(function() {
            a = 0, i = f("CLS", 0), t = d(e, i, r, n.reportAllChanges), l(function() {
                return t();
            });
        }), setTimeout(t, 0));
    }));
}, w = {
    passive: !0,
    capture: !0
}, S = new Date, A = function(r, i) {
    e || (e = i, n = r, t = new Date, F(removeEventListener), I());
}, I = function() {
    if (n >= 0 && n < t - S) {
        var i = {
            entryType: "first-input",
            name: e.type,
            target: e.target,
            cancelable: e.cancelable,
            startTime: e.timeStamp,
            processingStart: e.timeStamp + n
        };
        r.forEach(function(e) {
            e(i);
        }), r = [];
    }
}, P = function(e) {
    if (e.cancelable) {
        var n = (e.timeStamp > 1e12 ? new Date : performance.now()) - e.timeStamp;
        "pointerdown" == e.type ? function(e, n) {
            var t = function() {
                A(e, n), i();
            }, r = function() {
                i();
            }, i = function() {
                removeEventListener("pointerup", t, w), removeEventListener("pointercancel", r, w);
            };
            addEventListener("pointerup", t, w), addEventListener("pointercancel", r, w);
        }(n, e) : A(n, e);
    }
}, F = function(e) {
    [
        "mousedown",
        "keydown",
        "touchstart",
        "pointerdown"
    ].forEach(function(n) {
        return e(n, P, w);
    });
}, M = function(t, i) {
    i = i || {}, C(function() {
        var a, c = [
            100,
            300
        ], u = E(), l = f("FID"), m = function(e) {
            e.startTime < u.firstHiddenTime && (l.value = e.processingStart - e.startTime, l.entries.push(e), a(!0));
        }, h = function(e) {
            e.forEach(m);
        }, g = s("first-input", h);
        a = d(t, l, c, i.reportAllChanges), g && v(p(function() {
            h(g.takeRecords()), g.disconnect();
        })), g && o(function() {
            var o;
            l = f("FID"), a = d(t, l, c, i.reportAllChanges), r = [], n = -1, e = null, F(addEventListener), o = m, r.push(o), I();
        });
    });
}, k = 0, D = 1 / 0, x = 0, B = function(e) {
    e.forEach(function(e) {
        e.interactionId && (D = Math.min(D, e.interactionId), x = Math.max(x, e.interactionId), k = x ? (x - D) / 7 + 1 : 0);
    });
}, R = function() {
    return i ? k : performance.interactionCount || 0;
}, H = function() {
    "interactionCount" in performance || i || (i = s("event", B, {
        type: "event",
        buffered: !0,
        durationThreshold: 0
    }));
}, N = 0, O = function() {
    return R() - N;
}, q = [], j = {}, _ = function(e) {
    var n = q[q.length - 1], t = j[e.interactionId];
    if (t || q.length < 10 || e.duration > n.latency) {
        if (t) t.entries.push(e), t.latency = Math.max(t.latency, e.duration);
        else {
            var r = {
                id: e.interactionId,
                latency: e.duration,
                entries: [
                    e
                ]
            };
            j[r.id] = r, q.push(r);
        }
        q.sort(function(e, n) {
            return n.latency - e.latency;
        }), q.splice(10).forEach(function(e) {
            delete j[e.id];
        });
    }
}, z = function(e, n) {
    n = n || {}, C(function() {
        var t = [
            200,
            500
        ];
        H();
        var r, i = f("INP"), a = function(e) {
            e.forEach(function(e) {
                (e.interactionId && _(e), "first-input" === e.entryType) && !q.some(function(n) {
                    return n.entries.some(function(n) {
                        return e.duration === n.duration && e.startTime === n.startTime;
                    });
                }) && _(e);
            });
            var n, t = (n = Math.min(q.length - 1, Math.floor(O() / 50)), q[n]);
            t && t.latency !== i.value && (i.value = t.latency, i.entries = t.entries, r());
        }, c = s("event", a, {
            durationThreshold: n.durationThreshold || 40
        });
        r = d(e, i, t, n.reportAllChanges), c && (c.observe({
            type: "first-input",
            buffered: !0
        }), v(function() {
            a(c.takeRecords()), i.value < 0 && O() > 0 && (i.value = 0, i.entries = []), r(!0);
        }), o(function() {
            q = [], N = R(), i = f("INP"), r = d(e, i, t, n.reportAllChanges);
        }));
    });
}, G = {}, J = function(e, n) {
    n = n || {}, C(function() {
        var t, r = [
            2500,
            4e3
        ], i = E(), a = f("LCP"), c = function(e) {
            var n = e[e.length - 1];
            if (n) {
                var r = Math.max(n.startTime - u(), 0);
                r < i.firstHiddenTime && (a.value = r, a.entries = [
                    n
                ], t());
            }
        }, m = s("largest-contentful-paint", c);
        if (m) {
            t = d(e, a, r, n.reportAllChanges);
            var h = p(function() {
                G[a.id] || (c(m.takeRecords()), m.disconnect(), G[a.id] = !0, t(!0));
            });
            [
                "keydown",
                "click"
            ].forEach(function(e) {
                addEventListener(e, h, !0);
            }), v(h), o(function(i) {
                a = f("LCP"), t = d(e, a, r, n.reportAllChanges), l(function() {
                    a.value = performance.now() - i.timeStamp, G[a.id] = !0, t(!0);
                });
            });
        }
    });
}, K = function e(n) {
    document.prerendering ? C(function() {
        return e(n);
    }) : "complete" !== document.readyState ? addEventListener("load", function() {
        return e(n);
    }, !0) : setTimeout(n, 0);
}, Q = function(e, n) {
    n = n || {};
    var t = [
        800,
        1800
    ], r = f("TTFB"), i = d(e, r, t, n.reportAllChanges);
    K(function() {
        var a = c();
        if (a) {
            var s = a.responseStart;
            if (s <= 0 || s > performance.now()) return;
            r.value = Math.max(s - u(), 0), r.entries = [
                a
            ], i(!0), o(function() {
                r = f("TTFB", 0), (i = d(e, r, t, n.reportAllChanges))(!0);
            });
        }
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["a2e18"], null, "parcelRequiref931")

//# sourceMappingURL=web-vitals.d8898944.js.map
