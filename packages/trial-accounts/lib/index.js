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
exports.TrialAccountManager = void 0;
/**
 * Main entry point for the Trial Accounts package.
 *
 * This package provides functions to deploy trial contracts,
 * create trials, add trial accounts, activate trial accounts,
 * perform actions, and broadcast transactions.
 *
 * @packageDocumentation
 */
var TrialAccountManager_1 = require("./lib/TrialAccountManager");
Object.defineProperty(exports, "TrialAccountManager", { enumerable: true, get: function () { return TrialAccountManager_1.TrialAccountManager; } });
// Export types for user convenience
__exportStar(require("./lib/types"), exports);
