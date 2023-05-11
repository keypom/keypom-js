"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientBalance = void 0;
var react_1 = __importDefault(require("react"));
var modal_types_1 = require("../modal.types");
var MainBody_1 = require("./MainBody");
var InsufficientBalance = function (_a) {
    var customizations = _a.customizations, hide = _a.hide;
    return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "70%", height: "27%" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: (customizations === null || customizations === void 0 ? void 0 : customizations.title) || modal_types_1.MODAL_DEFAULTS.insufficientBalance.title, body: (customizations === null || customizations === void 0 ? void 0 : customizations.body) || modal_types_1.MODAL_DEFAULTS.insufficientBalance.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () { return hide(); } }))));
};
exports.InsufficientBalance = InsufficientBalance;
