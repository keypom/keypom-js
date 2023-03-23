"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialOver = void 0;
var react_1 = __importDefault(require("react"));
var modal_1 = require("../modal");
var MainBody_1 = require("./MainBody");
var ModuleList_1 = require("./ModuleList");
var TrialOver = function (_a) {
    var modulesTitle = _a.modulesTitle, modules = _a.modules, accountId = _a.accountId, secretKey = _a.secretKey, mainTitle = _a.mainTitle, mainBody = _a.mainBody, headerOne = _a.headerOne, headerTwo = _a.headerTwo, button = _a.button, hide = _a.hide;
    return (react_1.default.createElement("div", { className: "nws-modal" },
        react_1.default.createElement("div", { className: "modal-left" },
            react_1.default.createElement(ModuleList_1.ModuleList, { modulesTitle: modulesTitle, modules: modules, accountId: accountId, secretKey: secretKey })),
        react_1.default.createElement("div", { className: "modal-right" },
            react_1.default.createElement("div", { className: "nws-modal-body" },
                react_1.default.createElement(MainBody_1.MainBody, { title: mainTitle || modal_1.MODAL_DEFAULTS.trialOver.mainBody.title, body: mainBody || modal_1.MODAL_DEFAULTS.trialOver.mainBody.body, headerOne: headerOne || modal_1.MODAL_DEFAULTS.trialOver.mainBody.headerOne, headerTwo: headerTwo || modal_1.MODAL_DEFAULTS.trialOver.mainBody.headerTwo, button: button, onCloseModal: function () {
                        return hide();
                    } })))));
};
exports.TrialOver = TrialOver;
