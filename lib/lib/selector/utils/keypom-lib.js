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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKeypomContractIfValid = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.KEYPOM_LOCAL_STORAGE_KEY = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, _a = nearAPI.transactions, addKey = _a.addKey, deleteKey = _a.deleteKey, functionCallAccessKey = _a.functionCallAccessKey, utils = nearAPI.utils, nearTransactions = nearAPI.transactions, _b = nearAPI.utils, PublicKey = _b.PublicKey, _c = _b.format, parseNearAmount = _c.parseNearAmount, formatNearAmount = _c.formatNearAmount;
var keypom_1 = require("../../keypom");
var checks_1 = require("../../checks");
exports.KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';
var getLocalStorageKeypomEnv = function () {
    var localStorageDataJson = localStorage.getItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"));
    return localStorageDataJson;
};
exports.getLocalStorageKeypomEnv = getLocalStorageKeypomEnv;
var setLocalStorageKeypomEnv = function (jsonData) {
    var dataToWrite = JSON.stringify(jsonData);
    console.log('dataToWrite: ', dataToWrite);
    localStorage.setItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"), dataToWrite);
};
exports.setLocalStorageKeypomEnv = setLocalStorageKeypomEnv;
var updateKeypomContractIfValid = function (keypomContractId) {
    if ((0, checks_1.isValidKeypomContract)(keypomContractId) === true) {
        (0, keypom_1.updateKeypomContractId)({
            keypomContractId: keypomContractId
        });
        return true;
    }
    return false;
};
exports.updateKeypomContractIfValid = updateKeypomContractIfValid;
