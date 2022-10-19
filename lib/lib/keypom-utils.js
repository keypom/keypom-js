"use strict";
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
        while (_) try {
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
exports.estimateRequiredDeposit = exports.genKey = exports.ATTACHED_GAS_FROM_WALLET = void 0;
var BN = require("bn.js").BN;
var _a = require("near-api-js/lib/utils/format"), parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var _b = require("near-api-js"), connect = _b.connect, KeyPair = _b.KeyPair, keyStores = _b.keyStores, utils = _b.utils;
var generateSeedPhrase = require("near-seed-phrase").generateSeedPhrase;
var path = require("path");
var crypto = require("crypto");
var homedir = require("os").homedir();
/// How much Gas each each cross contract call with cost to be converted to a receipt
var GAS_PER_CCC = 5000000000000; // 5 TGas
var RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
var YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
var ACCESS_KEY_STORAGE = new BN("1000000000000000000000");
var hashBuf = function (str) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)); };
var genKey = function (rootKey, meta, nonce) { return __awaiter(void 0, void 0, void 0, function () {
    var hash, secretKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, hashBuf("".concat(rootKey, "_").concat(meta, "_").concat(nonce))];
            case 1:
                hash = _a.sent();
                secretKey = generateSeedPhrase(hash).secretKey;
                return [2 /*return*/, KeyPair.fromString(secretKey)];
        }
    });
}); };
exports.genKey = genKey;
// Initiate the connection to the NEAR blockchain.
var estimateRequiredDeposit = function (_a) {
    var near = _a.near, depositPerUse = _a.depositPerUse, numKeys = _a.numKeys, usesPerKey = _a.usesPerKey, attachedGas = _a.attachedGas, _b = _a.storage, storage = _b === void 0 ? parseNearAmount("0.034") : _b, _c = _a.keyStorage, keyStorage = _c === void 0 ? parseNearAmount("0.0065") : _c, _d = _a.fcData, fcData = _d === void 0 ? null : _d, _e = _a.ftData, ftData = _e === void 0 ? null : _e;
    return __awaiter(void 0, void 0, void 0, function () {
        var numKeysBN, totalRequiredStorage, actualAllowance, totalAllowance, totalAccessKeyStorage, _f, numNoneFcs, depositRequiredForFcDrops, totalDeposits, totalDepositsForFc, requiredDeposit, extraFtCosts;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    numKeysBN = new BN(numKeys);
                    totalRequiredStorage = new BN(storage).add(new BN(keyStorage).mul(numKeysBN));
                    actualAllowance = estimatePessimisticAllowance(attachedGas);
                    totalAllowance = actualAllowance.mul(numKeysBN);
                    totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
                    _f = getNoneFcsAndDepositRequired(fcData, usesPerKey), numNoneFcs = _f.numNoneFcs, depositRequiredForFcDrops = _f.depositRequiredForFcDrops;
                    totalDeposits = new BN(depositPerUse).mul(new BN(usesPerKey - numNoneFcs)).mul(numKeysBN);
                    totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
                    requiredDeposit = totalRequiredStorage
                        .add(totalAllowance)
                        .add(totalAccessKeyStorage)
                        .add(totalDeposits)
                        .add(totalDepositsForFc);
                    if (!(ftData != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFtCosts(near, numKeys, usesPerKey, ftData.contract_id)];
                case 1:
                    extraFtCosts = _g.sent();
                    requiredDeposit = requiredDeposit.add(new BN(extraFtCosts));
                    _g.label = 2;
                case 2: return [2 /*return*/, requiredDeposit.toString()];
            }
        });
    });
};
exports.estimateRequiredDeposit = estimateRequiredDeposit;
// Estimate the amount of allowance required for a given attached gas.
var estimatePessimisticAllowance = function (attachedGas) {
    // Get the number of CCCs you can make with the attached GAS
    var numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    var powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)
    var requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    var requiredAllowance = new BN(requiredGas).mul(new BN(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};
// Estimate the amount of allowance required for a given attached gas.
var getNoneFcsAndDepositRequired = function (fcData, usesPerKey) {
    var depositRequiredForFcDrops = new BN(0);
    var numNoneFcs = 0;
    if (fcData == null) {
        return { numNoneFcs: numNoneFcs, depositRequiredForFcDrops: depositRequiredForFcDrops };
    }
    var numMethodData = fcData.methods.length;
    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        var methodData = fcData.methods[0];
        // Keep track of the total attached deposit across all methods in the method data
        var attachedDeposit = new BN(0);
        for (var i = 0; i < methodData.length; i++) {
            attachedDeposit = attachedDeposit.add(new BN(methodData[i].attachedDeposit));
        }
        depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit).mul(usesPerKey);
        return {
            numNoneFcs: numNoneFcs,
            depositRequiredForFcDrops: depositRequiredForFcDrops,
        };
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (var i = 0; i < numMethodData; i++) {
        var methodData = fcData.methods[i];
        var isNoneFc = methodData == null;
        numNoneFcs += isNoneFc;
        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            var attachedDeposit = new BN(0);
            for (var j = 0; j < methodData.length; j++) {
                attachedDeposit = attachedDeposit.add(new BN(methodData[j].attachedDeposit));
            }
            depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit);
        }
    }
    return {
        numNoneFcs: numNoneFcs,
        depositRequiredForFcDrops: depositRequiredForFcDrops,
    };
};
// Estimate the amount of allowance required for a given attached gas.
var getFtCosts = function (near, numKeys, usesPerKey, ftContract) { return __awaiter(void 0, void 0, void 0, function () {
    var viewAccount, storageBalanceBounds, costs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, near.account("foo")];
            case 1:
                viewAccount = _a.sent();
                return [4 /*yield*/, viewAccount.viewFunction(ftContract, "storage_balance_bounds", {})];
            case 2:
                storageBalanceBounds = _a.sent();
                console.log('storageBalanceBounds: ', storageBalanceBounds);
                costs = new BN(storageBalanceBounds.min).mul(new BN(numKeys)).mul(new BN(usesPerKey)).add(new BN(storageBalanceBounds.min));
                console.log('costs: ', costs.toString());
                return [2 /*return*/, costs.toString()];
        }
    });
}); };
