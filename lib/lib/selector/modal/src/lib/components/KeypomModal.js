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
var handleModalType_1 = require("../handleModalType");
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
        (0, handleModalType_1.renderModalType)(modalType, options, hide)));
};
exports.KeypomModal = KeypomModal;
