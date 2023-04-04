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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKeypomContractIfValid = exports.addUserToMappingContract = exports.getAccountFromMap = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.KEYPOM_LOCAL_STORAGE_KEY = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, _a = nearAPI.transactions, addKey = _a.addKey, deleteKey = _a.deleteKey, functionCallAccessKey = _a.functionCallAccessKey, utils = nearAPI.utils, nearTransactions = nearAPI.transactions, _b = nearAPI.utils, PublicKey = _b.PublicKey, _c = _b.format, parseNearAmount = _c.parseNearAmount, formatNearAmount = _c.formatNearAmount;
var keypom_1 = require("../../keypom");
var checks_1 = require("../../checks");
var trial_active_1 = require("../../trial-accounts/trial-active");
var keypom_utils_1 = require("../../keypom-utils");
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
var getAccountFromMap = function (secretKey) { return __awaiter(void 0, void 0, void 0, function () {
    var viewCall, pk, accountId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                viewCall = (0, keypom_1.getEnv)().viewCall;
                pk = (0, keypom_utils_1.getPubFromSecret)(secretKey);
                return [4 /*yield*/, viewCall({
                        contractId: keypom_1.accountMappingContract[(0, keypom_1.getEnv)().networkId],
                        methodName: 'get_account_id',
                        args: { pk: pk }
                    })];
            case 1:
                accountId = _a.sent();
                console.log('accountId found from map: ', accountId);
                return [2 /*return*/, accountId];
        }
    });
}); };
exports.getAccountFromMap = getAccountFromMap;
var addUserToMappingContract = function (accountId, secretKey) { return __awaiter(void 0, void 0, void 0, function () {
    var accountIdFromMapping;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getAccountFromMap)(secretKey)];
            case 1:
                accountIdFromMapping = _a.sent();
                if (accountIdFromMapping !== accountId) {
                    console.log("No Account ID found from mapping contract: ".concat(JSON.stringify(accountIdFromMapping), " Adding now."));
                    (0, trial_active_1.trialCallMethod)({
                        trialAccountId: accountId,
                        trialAccountSecretKey: secretKey,
                        contractId: keypom_1.accountMappingContract[(0, keypom_1.getEnv)().networkId],
                        methodName: 'set',
                        args: {},
                        attachedDeposit: parseNearAmount('0.002'),
                        attachedGas: '10000000000000'
                    });
                }
                return [2 /*return*/];
        }
    });
}); };
exports.addUserToMappingContract = addUserToMappingContract;
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
