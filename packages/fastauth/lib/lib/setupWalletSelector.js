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
    const { modules = [], localTesting } = params;
    // Create a wrapped version of FastAuthWallet that includes localTesting
    const fastAuthModuleFactory = async (walletOptions) => {
        return (0, FastAuthWallet_1.default)({
            ...walletOptions,
            localTesting, // Pass the localTesting flag here
        });
    };
    // Initialize the wallet selector with the wrapped FastAuthWallet
    const selector = await (0, core_1.setupWalletSelector)({
        ...params,
        modules: [fastAuthModuleFactory, ...modules],
    });
    return selector;
};
exports.setupWalletSelector = setupWalletSelector;
