"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleList = void 0;
var react_1 = __importDefault(require("react"));
var modal_1 = require("../modal");
var ModuleList = function (_a) {
    var _b = _a.modulesTitle, modulesTitle = _b === void 0 ? modal_1.MODAL_DEFAULTS.trialOver.moduleList.modulesTitle : _b, modules = _a.modules, accountId = _a.accountId, secretKey = _a.secretKey;
    function renderOptionsList(modulesToRender) {
        return modulesToRender.reduce(function (result, module, index) {
            var name = module.name, description = module.description, iconUrl = module.iconUrl, baseRedirectUrl = module.baseRedirectUrl, _a = module.delimiter, delimiter = _a === void 0 ? "/" : _a;
            result.push(react_1.default.createElement("li", { tabIndex: 0, className: "single-wallet sidebar ".concat(module.name), key: module.name, onClick: function () {
                    window.open("".concat(baseRedirectUrl).concat(accountId).concat(delimiter).concat(secretKey), '_blank');
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
            react_1.default.createElement("h2", null, modulesTitle)),
        react_1.default.createElement("div", { className: "wallet-options-wrapper" },
            react_1.default.createElement("div", { className: "options-list" }, renderOptionsList(modules)))));
};
exports.ModuleList = ModuleList;
