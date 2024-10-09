"use strict";
// index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryAsync = exports.initNear = exports.broadcastTransaction = exports.performActions = exports.activateTrialAccounts = exports.addTrialAccounts = exports.createTrial = void 0;
/**
 * Main entry point for the Trial Accounts package.
 *
 * This package provides functions to deploy trial contracts,
 * create trials, add trial accounts, activate trial accounts,
 * perform actions, and broadcast transactions.
 *
 * @packageDocumentation
 */
var createTrial_1 = require("./lib/createTrial");
Object.defineProperty(exports, "createTrial", { enumerable: true, get: function () { return createTrial_1.createTrial; } });
var addTrialKeys_1 = require("./lib/addTrialKeys");
Object.defineProperty(exports, "addTrialAccounts", { enumerable: true, get: function () { return addTrialKeys_1.addTrialAccounts; } });
var activateTrial_1 = require("./lib/activateTrial");
Object.defineProperty(exports, "activateTrialAccounts", { enumerable: true, get: function () { return activateTrial_1.activateTrialAccounts; } });
var performAction_1 = require("./lib/performAction");
Object.defineProperty(exports, "performActions", { enumerable: true, get: function () { return performAction_1.performActions; } });
var broadcastTransaction_1 = require("./lib/broadcastTransaction");
Object.defineProperty(exports, "broadcastTransaction", { enumerable: true, get: function () { return broadcastTransaction_1.broadcastTransaction; } });
var nearUtils_1 = require("./lib/nearUtils");
Object.defineProperty(exports, "initNear", { enumerable: true, get: function () { return nearUtils_1.initNear; } });
var cryptoUtils_1 = require("./lib/cryptoUtils");
Object.defineProperty(exports, "retryAsync", { enumerable: true, get: function () { return cryptoUtils_1.retryAsync; } });
// Export types for user convenience
__exportStar(require("./lib/types"), exports);
