"use strict";
// index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModal = exports.setupWalletSelector = void 0;
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
var setupWalletSelector_1 = require("./lib/setupWalletSelector");
Object.defineProperty(exports, "setupWalletSelector", { enumerable: true, get: function () { return setupWalletSelector_1.setupWalletSelector; } });
var modal_1 = require("./lib/modal");
Object.defineProperty(exports, "setupModal", { enumerable: true, get: function () { return modal_1.setupModal; } });
