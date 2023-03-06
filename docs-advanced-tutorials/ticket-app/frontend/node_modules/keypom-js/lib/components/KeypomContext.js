"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeypom = exports.KeypomContextProvider = void 0;
var react_1 = __importStar(require("react"));
var keypom_1 = require("../lib/keypom");
var KeypomContext = react_1.default.createContext(null);
/** @group Keypom SDK Environment */
var KeypomContextProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), env = _b[0], setEnv = _b[1];
    (0, react_1.useEffect)(function () {
        // try to call getEnv of Keypom SDK which will throw if initKeypom isn't called somewhere in client codebase
        var tried = 0;
        var attempts = 10, timeout = 1000;
        var lazyCheck = function () {
            tried++;
            if (tried === attempts) {
                return console.warn("Tried getting Keypom env ".concat(attempts, " times over ").concat(attempts * timeout / 1000, " seconds and it appears Keypom is NOT initialized. Please call initKeypom with your config to initialize."));
            }
            try {
                // will throw if initKeypom has not been called
                setEnv((0, keypom_1.getEnv)());
            }
            catch (e) {
                setTimeout(lazyCheck, timeout);
            }
        };
        lazyCheck();
    }, []);
    return (react_1.default.createElement(KeypomContext.Provider, { value: env }, children));
};
exports.KeypomContextProvider = KeypomContextProvider;
/** @group Keypom SDK Environment */
function useKeypom() {
    var context = (0, react_1.useContext)(KeypomContext);
    if (!context) {
        context = {
            error: 'uninitialized'
        };
    }
    return context;
}
exports.useKeypom = useKeypom;
