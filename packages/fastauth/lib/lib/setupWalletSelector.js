"use strict";
// setupWalletSelector.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWalletSelector = void 0;
const core_1 = require("@near-wallet-selector/core");
const FastAuthWallet_1 = __importDefault(require("./FastAuthWallet"));
const setupWalletSelector = async (params) => {
    const { modules = [] } = params;
    const selector = await (0, core_1.setupWalletSelector)({
        ...params,
        modules: [FastAuthWallet_1.default, ...modules],
    });
    return selector;
};
exports.setupWalletSelector = setupWalletSelector;
