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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasEnoughBalance = exports.isUnclaimedTrialDrop = exports.estimateTrialGas = exports.generateExecuteArgs = exports.wrapTxnParamsForTrial = exports.validateDesiredMethods = exports.TRIAL_ERRORS = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const keypom_1 = require("../keypom");
const views_1 = require("../views");
const accounts_1 = require("@near-js/accounts");
// helpers for keypom account contract args
const RECEIVER_HEADER = "|kR|";
const ACTION_HEADER = "|kA|";
const PARAM_START = "|kP|";
const PARAM_STOP = "|kS|";
exports.TRIAL_ERRORS = {
    EXIT_EXPECTED: "exit",
    INVALID_ACTION: "invalid_action",
    INSUFFICIENT_BALANCE: "insufficient_balance",
};
const validateDesiredMethods = ({ methodData, trialAccountId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall } = (0, keypom_1.getEnv)();
    let validInfo = {};
    try {
        const rules = yield viewCall({
            contractId: trialAccountId,
            methodName: "get_rules",
            args: {},
        });
        let contracts = rules.contracts.split(",");
        let amounts = rules.amounts.split(",");
        let methods = rules.methods.split(",");
        for (let i = 0; i < contracts.length; i++) {
            validInfo[contracts[i]] = {
                maxDeposit: amounts[i],
                allowableMethods: methods[i] == "*" ? "*" : methods[i].split(":"),
            };
        }
    }
    catch (e) {
        console.log("error: ", e);
    }
    console.log("validInfo after view calls: ", validInfo);
    // Loop through each transaction in the array
    for (let i = 0; i < methodData.length; i++) {
        const method = methodData[i];
        console.log("method: ", method);
        const validInfoForReceiver = validInfo[method.receiverId];
        console.log("validInfoForReceiver: ", validInfoForReceiver);
        // Check if the contractId is valid
        if (!validInfoForReceiver) {
            console.log("!validInfo[transaction.receiverId]: ", !validInfo[method.receiverId]);
            return false;
        }
        // Check if the method name is valid
        if (validInfoForReceiver.allowableMethods != "*" &&
            !validInfoForReceiver.allowableMethods.includes(method.methodName)) {
            console.log("!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ", !validInfo[method.receiverId].allowableMethods.includes(method.methodName));
            return false;
        }
        // Check if the deposit is valid
        if (validInfoForReceiver.maxDeposit != "*" &&
            new bn_js_1.default(method.deposit).gt(new bn_js_1.default(validInfoForReceiver.maxDeposit))) {
            console.log("new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ", new bn_js_1.default(method.deposit).gt(new bn_js_1.default(validInfo[method.receiverId].maxDeposit)));
            return false;
        }
    }
    return true;
});
exports.validateDesiredMethods = validateDesiredMethods;
const wrapTxnParamsForTrial = (params, newParams = {}) => {
    Object.entries(params).forEach(([k, v]) => {
        if (k === "args" && typeof v !== "string") {
            v = JSON.stringify(v);
        }
        if (Array.isArray(v))
            v = v.join();
        newParams[PARAM_START + k] = v + PARAM_STOP;
    });
    return newParams;
};
exports.wrapTxnParamsForTrial = wrapTxnParamsForTrial;
const generateExecuteArgs = ({ desiredTxns, }) => {
    const methodDataToValidate = [];
    let totalGasBN = new bn_js_1.default(0);
    let totalDepositsBN = new bn_js_1.default(0);
    const executeArgs = {
        transactions: [],
    };
    desiredTxns.forEach((tx) => {
        const newTx = {};
        newTx[RECEIVER_HEADER] = tx.receiverId;
        newTx.actions = [];
        console.log("newTx: ", newTx);
        tx.actions.forEach((action) => {
            console.log("action: ", action);
            if (action.type !== "FunctionCall") {
                throw new Error("Only FunctionCall actions are supported");
            }
            methodDataToValidate.push({
                receiverId: tx.receiverId,
                methodName: action.params.methodName,
                deposit: action.params.deposit,
            });
            totalGasBN = totalGasBN.add(new bn_js_1.default(action.params.gas));
            totalDepositsBN = totalDepositsBN.add(new bn_js_1.default(action.params.deposit));
            const newAction = {};
            console.log("newAction 1: ", newAction);
            newAction[ACTION_HEADER] = action.type;
            console.log("newAction 2: ", newAction);
            newAction.params = (0, exports.wrapTxnParamsForTrial)(action.params);
            console.log("newAction 3: ", newAction);
            newTx.actions.push(newAction);
        });
        executeArgs.transactions.push(newTx);
    });
    return {
        totalAttachedYocto: totalDepositsBN.toString(),
        totalGasForTxns: totalGasBN.toString(),
        executeArgs,
        methodDataToValidate,
    };
};
exports.generateExecuteArgs = generateExecuteArgs;
const estimateTrialGas = ({ executeArgs, }) => {
    let transactions = executeArgs.transactions;
    let incomingGas = new bn_js_1.default("0");
    let numActions = 0;
    try {
        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];
            console.log("transaction in gas loop: ", transaction);
            for (let j = 0; j < transaction.actions.length; j++) {
                let action = transaction.actions[j];
                console.log("action in gas loop: ", action);
                let gasToAdd = action.params["|kP|gas"]
                    .split(`|kS|`)[0]
                    .toString();
                console.log("gasToAdd: ", gasToAdd);
                incomingGas = incomingGas.add(new bn_js_1.default(gasToAdd));
                numActions += 1;
            }
        }
    }
    catch (e) {
        numActions = 1;
        console.log("e: ", e);
        incomingGas = new bn_js_1.default(`300000000000000`);
    }
    console.log("incomingGas: ", incomingGas.toString());
    // Take 15 TGas as a base for loading rules as well as 20 TGas for the callback.
    // For each action, add 15 TGas on top of that and then add the final incoming gas on top.
    let gasToAttach = new bn_js_1.default("15000000000000") // Loading rules
        .add(new bn_js_1.default("20000000000000")) // Callback
        .add(new bn_js_1.default("15000000000000").mul(new bn_js_1.default(numActions))) // Actions
        .add(incomingGas)
        .toString(); // Incoming gas
    // check if the gas to attach is over 300 TGas and if it is, clamp it
    if (new bn_js_1.default(gasToAttach).gt(new bn_js_1.default("300000000000000"))) {
        console.log("gas to attach is over 300 TGas. Clamping it");
        gasToAttach = "300000000000000";
    }
    return gasToAttach;
};
exports.estimateTrialGas = estimateTrialGas;
const isUnclaimedTrialDrop = ({ keypomContractId, secretKey }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("accountId is valid keypom contract ", keypomContractId);
    const keyInfo = yield (0, views_1.getKeyInformation)({
        secretKey,
    });
    console.log("keyInfo: ", keyInfo);
    if (keyInfo !== null) {
        return true;
    }
    return false;
});
exports.isUnclaimedTrialDrop = isUnclaimedTrialDrop;
const hasEnoughBalance = ({ trialAccountId, totalGasForTxns, totalAttachedYocto, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { near } = (0, keypom_1.getEnv)();
    const trialAccountObj = new accounts_1.Account(near.connection, trialAccountId);
    const accountState = yield trialAccountObj.state();
    const storageCostPerByte = new bn_js_1.default("10000000000000000000");
    const totalStorage = new bn_js_1.default(accountState.storage_usage).mul(storageCostPerByte);
    let availAmount = new bn_js_1.default(accountState.amount).sub(totalStorage);
    const yoctoPerGas = 100000000;
    let gasCost = new bn_js_1.default(totalGasForTxns).mul(new bn_js_1.default(yoctoPerGas));
    let totalCost = gasCost.add(new bn_js_1.default(totalAttachedYocto));
    return availAmount.gte(totalCost);
});
exports.hasEnoughBalance = hasEnoughBalance;
