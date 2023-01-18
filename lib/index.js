"use strict";
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
exports.getEnv = exports.initKeypom = exports.execute = exports.claim = exports.deleteKeys = exports.addKeys = exports.deleteDrops = exports.createDrop = exports.KeypomContextProvider = exports.useKeypom = exports.nearAPI = exports.hashPassword = exports.nftTransferCall = exports.ftTransferCall = exports.getStorageBase = exports.estimateRequiredDeposit = exports.generateKeys = void 0;
var keypom_utils_1 = require("./lib/keypom-utils");
Object.defineProperty(exports, "generateKeys", { enumerable: true, get: function () { return keypom_utils_1.generateKeys; } });
Object.defineProperty(exports, "estimateRequiredDeposit", { enumerable: true, get: function () { return keypom_utils_1.estimateRequiredDeposit; } });
Object.defineProperty(exports, "getStorageBase", { enumerable: true, get: function () { return keypom_utils_1.getStorageBase; } });
Object.defineProperty(exports, "ftTransferCall", { enumerable: true, get: function () { return keypom_utils_1.ftTransferCall; } });
Object.defineProperty(exports, "nftTransferCall", { enumerable: true, get: function () { return keypom_utils_1.nftTransferCall; } });
Object.defineProperty(exports, "hashPassword", { enumerable: true, get: function () { return keypom_utils_1.hashPassword; } });
Object.defineProperty(exports, "nearAPI", { enumerable: true, get: function () { return keypom_utils_1.exportedNearAPI; } });
var KeypomContext_1 = require("./components/KeypomContext");
Object.defineProperty(exports, "useKeypom", { enumerable: true, get: function () { return KeypomContext_1.useKeypom; } });
Object.defineProperty(exports, "KeypomContextProvider", { enumerable: true, get: function () { return KeypomContext_1.KeypomContextProvider; } });
var drops_1 = require("./lib/drops");
Object.defineProperty(exports, "createDrop", { enumerable: true, get: function () { return drops_1.createDrop; } });
Object.defineProperty(exports, "deleteDrops", { enumerable: true, get: function () { return drops_1.deleteDrops; } });
var keys_1 = require("./lib/keys");
Object.defineProperty(exports, "addKeys", { enumerable: true, get: function () { return keys_1.addKeys; } });
Object.defineProperty(exports, "deleteKeys", { enumerable: true, get: function () { return keys_1.deleteKeys; } });
var claims_1 = require("./lib/claims");
Object.defineProperty(exports, "claim", { enumerable: true, get: function () { return claims_1.claim; } });
var keypom_1 = require("./lib/keypom");
Object.defineProperty(exports, "execute", { enumerable: true, get: function () { return keypom_1.execute; } });
Object.defineProperty(exports, "initKeypom", { enumerable: true, get: function () { return keypom_1.initKeypom; } });
Object.defineProperty(exports, "getEnv", { enumerable: true, get: function () { return keypom_1.getEnv; } });
__exportStar(require("./lib/views"), exports);
__exportStar(require("./lib/types/drops"), exports);
__exportStar(require("./lib/types/fc"), exports);
__exportStar(require("./lib/types/ft"), exports);
__exportStar(require("./lib/types/general"), exports);
__exportStar(require("./lib/types/nft"), exports);
__exportStar(require("./lib/types/params"), exports);
__exportStar(require("./lib/types/simple"), exports);
