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
exports.KeypomModal = void 0;
var react_1 = __importStar(require("react"));
var modal_1 = require("../modal");
var MainBody_1 = require("./MainBody");
var TrialOver_1 = require("./TrialOver");
var getThemeClass = function (theme) {
    switch (theme) {
        case "dark":
            return "dark-theme";
        case "light":
            return "light-theme";
        default:
            return "";
    }
};
var renderModalType = function (modalType, options, hide) {
    switch (modalType) {
        case modal_1.MODAL_TYPE.TRIAL_OVER:
            return (react_1.default.createElement(TrialOver_1.TrialOver, { modulesTitle: options.modulesTitle, modules: options.modules, accountId: options.accountId, secretKey: options.secretKey, mainTitle: options.mainTitle, mainBody: options.mainBody, headerOne: options.headerOne, headerTwo: options.headerTwo, button: options.button, hide: hide }));
        case modal_1.MODAL_TYPE.ERROR:
            return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "70%", height: "27%" } },
                react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
                    react_1.default.createElement(MainBody_1.MainBody, { title: modal_1.MODAL_DEFAULTS.error.title, body: modal_1.MODAL_DEFAULTS.error.body, headerOne: null, headerTwo: null, button: options.button, onCloseModal: function () {
                            return hide();
                        } }))));
        default: return null;
    }
};
var KeypomModal = function (_a) {
    var options = _a.options, modalType = _a.modalType, visible = _a.visible, hide = _a.hide;
    (0, react_1.useEffect)(function () {
        var close = function (e) {
            if (e.key === "Escape") {
                hide();
            }
        };
        window.addEventListener("keydown", close);
        return function () { return window.removeEventListener("keydown", close); };
    }, [hide]);
    if (!visible) {
        return null;
    }
    return (react_1.default.createElement("div", { className: "nws-modal-wrapper ".concat(getThemeClass(options === null || options === void 0 ? void 0 : options.theme), " ").concat(visible ? "open" : "") },
        react_1.default.createElement("div", { className: "nws-modal-overlay", onClick: function () {
                hide();
            } }),
        renderModalType(modalType, options, hide)));
};
exports.KeypomModal = KeypomModal;
