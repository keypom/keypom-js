"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderModalType = void 0;
var react_1 = __importDefault(require("react"));
var BeginTrial_1 = require("./components/BeginTrial");
var InsufficientBalance_1 = require("./components/InsufficientBalance");
var InvalidActions_1 = require("./components/InvalidActions");
var TrialOver_1 = require("./components/TrialOver");
var modal_types_1 = require("./modal.types");
var renderModalType = function (modalType, options, hide) {
    switch (modalType.id) {
        case modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER:
            return (react_1.default.createElement(TrialOver_1.TrialOver, { accountId: modalType.meta.accountId, secretKey: modalType.meta.secretKey, wallets: options.wallets, customizations: options.trialOver, hide: hide }));
        case modal_types_1.MODAL_TYPE_IDS.ACTION_ERROR:
            return (react_1.default.createElement(InvalidActions_1.InvalidActions, { hide: hide, customizations: options.invalidAction }));
        case modal_types_1.MODAL_TYPE_IDS.INSUFFICIENT_BALANCE:
            return (react_1.default.createElement(InsufficientBalance_1.InsufficientBalance, { hide: hide, customizations: options.insufficientBalance }));
        case modal_types_1.MODAL_TYPE_IDS.BEGIN_TRIAL:
            return (react_1.default.createElement(BeginTrial_1.BeginTrial, { hide: hide, secretKey: modalType.meta.secretKey, redirectUrlBase: modalType.meta.redirectUrlBase, delimiter: modalType.meta.delimiter, customizations: options.beginTrial }));
        default:
            return null;
    }
};
exports.renderModalType = renderModalType;
