"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingWallets = void 0;
var react_1 = __importDefault(require("react"));
var modal_types_1 = require("../modal.types");
var OffboardingWallets = function (_a) {
    var customizations = _a.customizations, wallets = _a.wallets, accountId = _a.accountId, secretKey = _a.secretKey;
    function renderOptionsList(walletsToRender) {
        return walletsToRender.reduce(function (result, wallet, index) {
            var name = wallet.name, description = wallet.description, iconUrl = wallet.iconUrl, baseRedirectUrl = wallet.baseRedirectUrl, _a = wallet.delimiter, delimiter = _a === void 0 ? "/" : _a;
            result.push(react_1.default.createElement("li", { tabIndex: 0, className: "single-wallet sidebar ".concat(wallet.name), key: wallet.name, onClick: function () {
                    window.open("".concat(baseRedirectUrl).concat(accountId).concat(delimiter).concat(secretKey), "_blank");
                } },
                react_1.default.createElement("div", { className: "icon" },
                    react_1.default.createElement("img", { src: iconUrl, alt: name })),
                react_1.default.createElement("div", { className: "content" },
                    react_1.default.createElement("div", { className: "title" }, name),
                    react_1.default.createElement("div", { className: "description" }, description))));
            return result;
        }, []);
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { className: "modal-left-title" },
            react_1.default.createElement("h2", null, (customizations === null || customizations === void 0 ? void 0 : customizations.title) ||
                modal_types_1.MODAL_DEFAULTS.trialOver.offboardingOptions.title)),
        react_1.default.createElement("div", { className: "wallet-options-wrapper" },
            react_1.default.createElement("div", { className: "options-list" }, renderOptionsList(wallets)))));
};
exports.OffboardingWallets = OffboardingWallets;
