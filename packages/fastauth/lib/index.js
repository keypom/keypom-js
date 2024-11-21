"use strict";
// index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastAuthProvider = exports.setupModal = exports.setupWalletSelector = void 0;
/**
 * Main entry point for the Trial Accounts package.
 *
 * This package provides functions to deploy trial contracts,
 * create trials, add trial accounts, activate trial accounts,
 * perform actions, and broadcast transactions.
 *
 * @packageDocumentation
 */
// index.ts
var core_1 = require("@near-wallet-selector/core");
Object.defineProperty(exports, "setupWalletSelector", { enumerable: true, get: function () { return core_1.setupWalletSelector; } });
var modal_1 = require("./lib/modal");
Object.defineProperty(exports, "setupModal", { enumerable: true, get: function () { return modal_1.setupModal; } });
var FastAuthProvider_1 = require("./lib/FastAuthProvider");
Object.defineProperty(exports, "FastAuthProvider", { enumerable: true, get: function () { return __importDefault(FastAuthProvider_1).default; } });
