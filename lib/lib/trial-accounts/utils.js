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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnclaimedTrialDrop = exports.estimateTrialGas = exports.generateExecuteArgs = exports.wrapTxnParamsForTrial = exports.validateDesiredMethods = exports.TRIAL_ERRORS = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var keypom_1 = require("../keypom");
var views_1 = require("../views");
// helpers for keypom account contract args
var RECEIVER_HEADER = '|kR|';
var ACTION_HEADER = '|kA|';
var PARAM_START = '|kP|';
var PARAM_STOP = '|kS|';
exports.TRIAL_ERRORS = {
    EXIT_EXPECTED: 'exit',
    INVALID_ACTION: 'invalid_action'
};
var validateDesiredMethods = function (_a) {
    var methodData = _a.methodData, trialAccountId = _a.trialAccountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var viewCall, validInfo, rules, contracts, amounts, methods, i, e_1, i, method, validInfoForReceiver;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    viewCall = (0, keypom_1.getEnv)().viewCall;
                    validInfo = {};
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, viewCall({
                            contractId: trialAccountId,
                            methodName: 'get_rules',
                            args: {}
                        })];
                case 2:
                    rules = _b.sent();
                    contracts = rules.contracts.split(",");
                    amounts = rules.amounts.split(",");
                    methods = rules.methods.split(",");
                    for (i = 0; i < contracts.length; i++) {
                        validInfo[contracts[i]] = {
                            maxDeposit: amounts[i],
                            allowableMethods: methods[i] == "*" ? "*" : methods[i].split(":")
                        };
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    console.log('error: ', e_1);
                    return [3 /*break*/, 4];
                case 4:
                    console.log('validInfo after view calls: ', validInfo);
                    // Loop through each transaction in the array
                    for (i = 0; i < methodData.length; i++) {
                        method = methodData[i];
                        console.log('method: ', method);
                        validInfoForReceiver = validInfo[method.receiverId];
                        console.log('validInfoForReceiver: ', validInfoForReceiver);
                        // Check if the contractId is valid
                        if (!validInfoForReceiver) {
                            console.log('!validInfo[transaction.receiverId]: ', !validInfo[method.receiverId]);
                            return [2 /*return*/, false];
                        }
                        // Check if the method name is valid
                        if (validInfoForReceiver.allowableMethods != "*" && !validInfoForReceiver.allowableMethods.includes(method.methodName)) {
                            console.log('!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ', !validInfo[method.receiverId].allowableMethods.includes(method.methodName));
                            return [2 /*return*/, false];
                        }
                        // Check if the deposit is valid
                        if (validInfoForReceiver.maxDeposit != "*" && new bn_js_1.default(method.deposit).gt(new bn_js_1.default(validInfoForReceiver.maxDeposit))) {
                            console.log('new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ', new bn_js_1.default(method.deposit).gt(new bn_js_1.default(validInfo[method.receiverId].maxDeposit)));
                            return [2 /*return*/, false];
                        }
                    }
                    return [2 /*return*/, true];
            }
        });
    });
};
exports.validateDesiredMethods = validateDesiredMethods;
var wrapTxnParamsForTrial = function (params, newParams) {
    if (newParams === void 0) { newParams = {}; }
    Object.entries(params).forEach(function (_a) {
        var k = _a[0], v = _a[1];
        if (k === 'args' && typeof v !== 'string') {
            v = JSON.stringify(v);
        }
        if (Array.isArray(v))
            v = v.join();
        newParams[PARAM_START + k] = v + PARAM_STOP;
    });
    return newParams;
};
exports.wrapTxnParamsForTrial = wrapTxnParamsForTrial;
var generateExecuteArgs = function (_a) {
    var desiredTxns = _a.desiredTxns;
    var methodDataToValidate = [];
    var executeArgs = {
        transactions: []
    };
    desiredTxns.forEach(function (tx) {
        var newTx = {};
        newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId;
        newTx.actions = [];
        console.log('newTx: ', newTx);
        tx.actions.forEach(function (action) {
            console.log('action: ', action);
            methodDataToValidate.push({
                receiverId: tx.contractId || tx.receiverId,
                methodName: action.params.methodName,
                deposit: action.params.deposit
            });
            var newAction = {};
            console.log('newAction 1: ', newAction);
            newAction[ACTION_HEADER] = action.type;
            console.log('newAction 2: ', newAction);
            newAction.params = (0, exports.wrapTxnParamsForTrial)(action.params);
            console.log('newAction 3: ', newAction);
            newTx.actions.push(newAction);
        });
        executeArgs.transactions.push(newTx);
    });
    return {
        executeArgs: executeArgs,
        methodDataToValidate: methodDataToValidate
    };
};
exports.generateExecuteArgs = generateExecuteArgs;
var estimateTrialGas = function (_a) {
    var executeArgs = _a.executeArgs;
    var transactions = executeArgs.transactions;
    var incomingGas = new bn_js_1.default("0");
    var numActions = 0;
    try {
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            console.log('transaction in gas loop: ', transaction);
            for (var j = 0; j < transaction.actions.length; j++) {
                var action = transaction.actions[j];
                console.log('action in gas loop: ', action);
                var gasToAdd = action.params['|kP|gas'].split("|kS|")[0].toString();
                console.log('gasToAdd: ', gasToAdd);
                incomingGas = incomingGas.add(new bn_js_1.default(gasToAdd));
                numActions += 1;
            }
        }
    }
    catch (e) {
        numActions = 1;
        console.log('e: ', e);
        incomingGas = new bn_js_1.default("300000000000000");
    }
    console.log('incomingGas: ', incomingGas.toString());
    // Take 15 TGas as a base for loading rules as well as 20 TGas for the callback.
    // For each action, add 15 TGas on top of that and then add the final incoming gas on top.
    var gasToAttach = new bn_js_1.default('15000000000000') // Loading rules
        .add(new bn_js_1.default('20000000000000')) // Callback
        .add(new bn_js_1.default('15000000000000').mul(new bn_js_1.default(numActions))) // Actions
        .add(incomingGas).toString(); // Incoming gas
    // check if the gas to attach is over 300 TGas and if it is, clamp it
    if (new bn_js_1.default(gasToAttach).gt(new bn_js_1.default('300000000000000'))) {
        console.log('gas to attach is over 300 TGas. Clamping it');
        gasToAttach = '300000000000000';
    }
    return gasToAttach;
};
exports.estimateTrialGas = estimateTrialGas;
var isUnclaimedTrialDrop = function (_a) {
    var keypomContractId = _a.keypomContractId, secretKey = _a.secretKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var keyInfo;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('accountId is valid keypom contract ', keypomContractId);
                    return [4 /*yield*/, (0, views_1.getKeyInformation)({
                            secretKey: secretKey
                        })];
                case 1:
                    keyInfo = _b.sent();
                    console.log('keyInfo: ', keyInfo);
                    if (keyInfo !== null) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
};
exports.isUnclaimedTrialDrop = isUnclaimedTrialDrop;
