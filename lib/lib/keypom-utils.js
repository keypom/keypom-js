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
exports.estimateRequiredDeposit = exports.transformTransactions = exports.nftTransferCall = exports.ftTransferCall = exports.execute = exports.genKey = exports.key2str = exports.ATTACHED_GAS_FROM_WALLET = void 0;
var nearAPI = require("near-api-js");
var KeyPair = nearAPI.KeyPair, utils = nearAPI.utils, transactions = nearAPI.transactions, parseNearAmount = nearAPI.utils.format.parseNearAmount;
var BN = require("bn.js").BN;
var generateSeedPhrase = require("near-seed-phrase").generateSeedPhrase;
var crypto = require("crypto");
/// How much Gas each each cross contract call with cost to be converted to a receipt
var GAS_PER_CCC = 5000000000000; // 5 TGas
var RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
var YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
var ACCESS_KEY_STORAGE = new BN("1000000000000000000000");
var key2str = function (v) { return typeof v === 'string' ? v : v.pk; };
exports.key2str = key2str;
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
var execute = function (_a) {
    var transactions = _a.transactions, account = _a.account, wallet = _a.wallet, fundingAccount = _a.fundingAccount;
    return __awaiter(void 0, void 0, void 0, function () {
        var nearAccount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!wallet) return [3 /*break*/, 2];
                    return [4 /*yield*/, wallet.signAndSendTransactions({ transactions: transactions })];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    nearAccount = account || fundingAccount;
                    if (!nearAccount) {
                        throw new Error("Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'");
                    }
                    return [4 /*yield*/, signAndSendTransactions(nearAccount, (0, exports.transformTransactions)(transactions))];
                case 3: return [2 /*return*/, _b.sent()];
            }
        });
    });
};
exports.execute = execute;
var ftTransferCall = function (_a) {
    var account = _a.account, contractId = _a.contractId, args = _a.args, _b = _a.returnTransaction, returnTransaction = _b === void 0 ? false : _b;
    var tx = {
        receiverId: contractId,
        actions: [{
                type: 'FunctionCall',
                params: {
                    methodName: 'ft_transfer_call',
                    args: args,
                    gas: '50000000000000',
                    deposit: '1',
                }
            }]
    };
    if (returnTransaction)
        return tx;
    return (0, exports.execute)({ account: account, transactions: transactions });
};
exports.ftTransferCall = ftTransferCall;
var nftTransferCall = function (_a) {
    var account = _a.account, contractId = _a.contractId, receiverId = _a.receiverId, tokenIds = _a.tokenIds, msg = _a.msg;
    return __awaiter(void 0, void 0, void 0, function () {
        var responses, i, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    responses = [];
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < tokenIds.length)) return [3 /*break*/, 4];
                    _c = (_b = responses).push;
                    return [4 /*yield*/, (0, exports.execute)({
                            account: account,
                            transactions: [{
                                    receiverId: contractId,
                                    actions: [{
                                            type: 'FunctionCall',
                                            params: {
                                                methodName: 'nft_transfer_call',
                                                args: {
                                                    receiver_id: receiverId,
                                                    token_id: tokenIds[i],
                                                    msg: msg
                                                },
                                                gas: '50000000000000',
                                                deposit: '1',
                                            }
                                        }]
                                }]
                        })];
                case 2:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, responses];
            }
        });
    });
};
exports.nftTransferCall = nftTransferCall;
/// sequentially execute all transactions
var signAndSendTransactions = function (account, txs) { return __awaiter(void 0, void 0, void 0, function () {
    var responses, i, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                responses = [];
                i = 0;
                _c.label = 1;
            case 1:
                if (!(i < txs.length)) return [3 /*break*/, 4];
                _b = (_a = responses).push;
                return [4 /*yield*/, account.signAndSendTransaction(txs[i])];
            case 2:
                _b.apply(_a, [_c.sent()]);
                _c.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, responses];
        }
    });
}); };
var transformTransactions = function (transactions) { return transactions.map(function (_a) {
    var receiverId = _a.receiverId, _actions = _a.actions;
    var actions = _actions.map(function (action) {
        return createAction(action);
    });
    return ({
        receiverId: receiverId,
        actions: actions
    });
}); };
exports.transformTransactions = transformTransactions;
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return transactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return transactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas = _a.gas, deposit = _a.deposit;
            return transactions.functionCall(methodName, args, new BN(gas), new BN(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return transactions.transfer(new BN(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return transactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            // return transactions.addKey(
            // 	utils.PublicKey.from(publicKey),
            // 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            // 	getAccessKey(accessKey.permission)
            // );
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return transactions.deleteKey(utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return transactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
// Initiate the connection to the NEAR blockchain.
var estimateRequiredDeposit = function (_a) {
    var near = _a.near, depositPerUse = _a.depositPerUse, numKeys = _a.numKeys, usesPerKey = _a.usesPerKey, attachedGas = _a.attachedGas, _b = _a.storage, storage = _b === void 0 ? parseNearAmount("0.034") : _b, _c = _a.keyStorage, keyStorage = _c === void 0 ? parseNearAmount("0.0065") : _c, fcData = _a.fcData, ftData = _a.ftData;
    return __awaiter(void 0, void 0, void 0, function () {
        var numKeysBN, totalRequiredStorage, actualAllowance, totalAllowance, totalAccessKeyStorage, _d, numNoneFcs, depositRequiredForFcDrops, totalDeposits, totalDepositsForFc, requiredDeposit, extraFtCosts;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    numKeysBN = new BN(numKeys);
                    totalRequiredStorage = new BN(storage).add(new BN(keyStorage).mul(numKeysBN));
                    actualAllowance = estimatePessimisticAllowance(attachedGas);
                    totalAllowance = actualAllowance.mul(numKeysBN);
                    totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
                    _d = getNoneFcsAndDepositRequired(fcData, usesPerKey), numNoneFcs = _d.numNoneFcs, depositRequiredForFcDrops = _d.depositRequiredForFcDrops;
                    totalDeposits = new BN(depositPerUse).mul(new BN(usesPerKey - numNoneFcs)).mul(numKeysBN);
                    totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
                    requiredDeposit = totalRequiredStorage
                        .add(totalAllowance)
                        .add(totalAccessKeyStorage)
                        .add(totalDeposits)
                        .add(totalDepositsForFc);
                    if (!(ftData.contract_id != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFtCosts(near, numKeys, usesPerKey, ftData.contract_id || ftData.contractId)];
                case 1:
                    extraFtCosts = _e.sent();
                    requiredDeposit = requiredDeposit.add(new BN(extraFtCosts));
                    _e.label = 2;
                case 2: return [2 /*return*/, requiredDeposit.toString()];
            }
        });
    });
};
exports.estimateRequiredDeposit = estimateRequiredDeposit;
// Estimate the amount of allowance required for a given attached gas.
var estimatePessimisticAllowance = function (attachedGas) {
    if (typeof attachedGas !== 'number')
        attachedGas = parseInt(attachedGas);
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
                costs = new BN(storageBalanceBounds.min).mul(new BN(numKeys)).mul(new BN(usesPerKey)).add(new BN(storageBalanceBounds.min));
                // console.log('costs: ', costs.toString());
                return [2 /*return*/, costs.toString()];
        }
    });
}); };
