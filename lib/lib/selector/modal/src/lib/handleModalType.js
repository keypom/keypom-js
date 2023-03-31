"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderModalType = void 0;
var react_1 = __importDefault(require("react"));
var ClaimTrial_1 = require("./components/ClaimTrial");
var InvalidActions_1 = require("./components/InvalidActions");
var TrialOver_1 = require("./components/TrialOver");
var modal_types_1 = require("./modal.types");
var renderModalType = function (modalType, options, hide) {
    switch (modalType.id) {
        case modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER:
            return (react_1.default.createElement(TrialOver_1.TrialOver, { modulesTitle: options.modulesTitle, modules: options.modules, accountId: options.accountId, secretKey: options.secretKey, mainTitle: options.mainTitle, mainBody: options.mainBody, headerOne: options.headerOne, headerTwo: options.headerTwo, button: options.button, hide: hide }));
        case modal_types_1.MODAL_TYPE_IDS.ERROR:
            return react_1.default.createElement(InvalidActions_1.InvalidActions, { hide: hide });
        case modal_types_1.MODAL_TYPE_IDS.CLAIM_TRIAL:
            return react_1.default.createElement(ClaimTrial_1.ClaimTrial, { hide: hide, secretKey: modalType.meta.secretKey, redirectUrlBase: modalType.meta.redirectUrlBase, delimiter: modalType.meta.delimiter });
        default: return null;
    }
};
exports.renderModalType = renderModalType;
