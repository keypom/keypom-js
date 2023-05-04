"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialOver = void 0;
var react_1 = __importDefault(require("react"));
var modal_types_1 = require("../modal.types");
var MainBody_1 = require("./MainBody");
var OffboardingWallets_1 = require("./OffboardingWallets");
var TrialOver = function (_a) {
    var _b, _c, _d, _e;
    var wallets = _a.wallets, accountId = _a.accountId, secretKey = _a.secretKey, customizations = _a.customizations, hide = _a.hide;
    return (react_1.default.createElement("div", { className: "nws-modal" },
        react_1.default.createElement("div", { className: "modal-left" },
            react_1.default.createElement(OffboardingWallets_1.OffboardingWallets, { customizations: customizations === null || customizations === void 0 ? void 0 : customizations.offboardingOptions, wallets: wallets, accountId: accountId, secretKey: secretKey })),
        react_1.default.createElement("div", { className: "modal-right" },
            react_1.default.createElement("div", { className: "nws-modal-body" },
                react_1.default.createElement(MainBody_1.MainBody, { title: ((_b = customizations === null || customizations === void 0 ? void 0 : customizations.mainBody) === null || _b === void 0 ? void 0 : _b.title) ||
                        modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.title, body: ((_c = customizations === null || customizations === void 0 ? void 0 : customizations.mainBody) === null || _c === void 0 ? void 0 : _c.body) ||
                        modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.body, imageOne: ((_d = customizations === null || customizations === void 0 ? void 0 : customizations.mainBody) === null || _d === void 0 ? void 0 : _d.imageOne) ||
                        modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.imageOne, imageTwo: ((_e = customizations === null || customizations === void 0 ? void 0 : customizations.mainBody) === null || _e === void 0 ? void 0 : _e.imageTwo) ||
                        modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.imageTwo, button: null, onCloseModal: function () { return hide(); } })))));
};
exports.TrialOver = TrialOver;
