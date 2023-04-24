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
Object.defineProperty(exports, "__esModule", { value: true });
exports.canExitTrial = exports.trialCallMethod = exports.trialSignAndSendTxns = void 0;
var near_api_js_1 = require("near-api-js");
var keypom_1 = require("../keypom");
var keypom_utils_1 = require("../keypom-utils");
var utils_1 = require("./utils");
/**
 * Execute a transaction that can contain multiple actions using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if any action
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
 *
 * @returns {Promise<FinalExecutionOutcome[]>} The outcomes of the transactions
 *
 * @example
 * Use a Trial Account to min2
 * ```js
 * await initKeypom({
 *        // near,
 *        network: 'testnet',
 *        funder: {
 *            accountId: fundingAccountId,
 *            secretKey: fundingAccountSecretKey,
 *        }
 *    });
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKeys[0],
 *    })
 *
 *    console.log('desiredAccountId: ', desiredAccountId)
 *    console.log(`trialSecretKey: ${JSON.stringify(trialSecretKey)}`)
 *    const txns = [{
 *        receiverId: callableContracts[0],
 *        actions: [
 *            {
 *                type: 'FunctionCall',
 *                params: {
 *                    methodName: 'nft_mint',
 *                    args: {
 *                        token_id: 'tokenId-keypom-1',
 *                        receiver_id: 'foo.testnet',
 *                        metadata: {
 *                            title: 'test1',
 *                            description: 'test1',
 *                            media: 'test1',
 *                        }
 *                    },
 *                    gas: '30000000000000',
 *                    deposit: parseNearAmount('0.1')
 *                },
 *            },
 *            {
 *                type: 'FunctionCall',
 *                params: {
 *                    methodName: 'nft_mint',
 *                    args: {
 *                        token_id: 'tokenId-keypom-2',
 *                        receiver_id: 'foo.testnet',
 *                        metadata: {
 *                            title: 'test2',
 *                            description: 'test2',
 *                            media: 'test2',
 *                        }
 *                    },
 *                    gas: '30000000000000',
 *                    deposit: parseNearAmount('0.1')
 *                },
 *            },
 *        ],
 *    }];
 *
 *    await trialSignAndSendTxns({
 *        trialAccountId: desiredAccountId,
 *        trialAccountSecretKey: trialSecretKey,
 *        txns
 *    })
 * ```
 *
 * @group Trial Accounts
 */
var trialSignAndSendTxns = function (_a) {
    var trialAccountId = _a.trialAccountId, trialAccountSecretKey = _a.trialAccountSecretKey, txns = _a.txns;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, near, keyStore, networkId, exitExpected, _c, methodDataToValidate, executeArgs, totalAttachedYocto, totalGasForTxns, isValidTxn, hasBal, trialKeyPair, pubKey, account, gasToAttach, transformedTransactions, promises;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), near = _b.near, keyStore = _b.keyStore, networkId = _b.networkId;
                    return [4 /*yield*/, (0, exports.canExitTrial)({ trialAccountId: trialAccountId })];
                case 1:
                    exitExpected = _d.sent();
                    if (exitExpected == true) {
                        throw utils_1.TRIAL_ERRORS.EXIT_EXPECTED;
                    }
                    return [4 /*yield*/, (0, utils_1.generateExecuteArgs)({ desiredTxns: txns })];
                case 2:
                    _c = _d.sent(), methodDataToValidate = _c.methodDataToValidate, executeArgs = _c.executeArgs, totalAttachedYocto = _c.totalAttachedYocto, totalGasForTxns = _c.totalGasForTxns;
                    return [4 /*yield*/, (0, utils_1.validateDesiredMethods)({ methodData: methodDataToValidate, trialAccountId: trialAccountId })];
                case 3:
                    isValidTxn = _d.sent();
                    console.log('isValidTxn: ', isValidTxn);
                    if (isValidTxn == false) {
                        throw utils_1.TRIAL_ERRORS.INVALID_ACTION;
                    }
                    return [4 /*yield*/, (0, utils_1.hasEnoughBalance)({ trialAccountId: trialAccountId, totalAttachedYocto: totalAttachedYocto, totalGasForTxns: totalGasForTxns })];
                case 4:
                    hasBal = _d.sent();
                    if (hasBal == false) {
                        throw utils_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE;
                    }
                    trialKeyPair = near_api_js_1.KeyPair.fromString(trialAccountSecretKey);
                    pubKey = trialKeyPair.getPublicKey();
                    return [4 /*yield*/, keyStore.setKey(networkId, trialAccountId, trialKeyPair)];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, near.account(trialAccountId)];
                case 6:
                    account = _d.sent();
                    gasToAttach = (0, utils_1.estimateTrialGas)({ executeArgs: executeArgs });
                    return [4 /*yield*/, (0, keypom_utils_1.createTransactions)({
                            signerId: trialAccountId,
                            signerPk: pubKey,
                            txnInfos: [{
                                    receiverId: account.accountId,
                                    actions: [{
                                            type: 'FunctionCall',
                                            params: {
                                                methodName: 'execute',
                                                args: executeArgs,
                                                gas: gasToAttach,
                                            }
                                        }]
                                }]
                        })];
                case 7:
                    transformedTransactions = _d.sent();
                    console.log("debugging");
                    console.log('transformedTransactions: ', transformedTransactions);
                    promises = transformedTransactions.map(function (tx) { return account.signAndSendTransaction(tx); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 8: return [2 /*return*/, _d.sent()];
            }
        });
    });
};
exports.trialSignAndSendTxns = trialSignAndSendTxns;
/**
 * Execute a method using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if the given method data
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
 *
 * @returns {Promise<FinalExecutionOutcome[]>} The outcome of the transaction
 *
 * @example
 * Using a trial account to mint a new NFT:
 * ```js
 *     await initKeypom({
 *		network: 'testnet',
 *		funder: {
 *			accountId: fundingAccountId,
 *			secretKey: fundingAccountSecretKey,
 *		}
 *	});
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKeys[0],
 *    })
 *
 *    console.log('desiredAccountId: ', desiredAccountId)
 *    console.log(`trialSecretKey: ${JSON.stringify(trialSecretKey)}`)
 *
 *    await trialCallMethod({
 *        trialAccountId: desiredAccountId,
 *        trialAccountSecretKey: trialSecretKey,
 *        contractId: callableContracts[0],
 *        methodName: 'nft_mint',
 *        args: {
 *            token_id: 'asdkasldkjasdlkajsldajsldaskjd',
 *            receiver_id: 'foo.testnet',
 *            metadata: {
 *                title: 'test',
 *                description: 'test',
 *                media: 'test',
 *            }
 *        },
 *        attachedDeposit: parseNearAmount('0.1'),
 *        attachedGas: '30000000000000',
 *    })
 * ```
 * @group Trial Accounts
 */
var trialCallMethod = function (_a) {
    var trialAccountId = _a.trialAccountId, trialAccountSecretKey = _a.trialAccountSecretKey, contractId = _a.contractId, methodName = _a.methodName, args = _a.args, attachedGas = _a.attachedGas, attachedDeposit = _a.attachedDeposit;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, near, keyStore, networkId, exitExpected, txns, _c, methodDataToValidate, executeArgs, totalAttachedYocto, totalGasForTxns, isValidTxn, hasBal, trialKeyPair, pubKey, account, gasToAttach, transformedTransactions, promises;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), near = _b.near, keyStore = _b.keyStore, networkId = _b.networkId;
                    return [4 /*yield*/, (0, exports.canExitTrial)({ trialAccountId: trialAccountId })];
                case 1:
                    exitExpected = _d.sent();
                    if (exitExpected == true) {
                        throw utils_1.TRIAL_ERRORS.EXIT_EXPECTED;
                    }
                    txns = [{
                            receiverId: contractId,
                            actions: [
                                {
                                    type: 'FunctionCall',
                                    params: {
                                        methodName: methodName,
                                        args: args,
                                        gas: attachedGas,
                                        deposit: attachedDeposit
                                    },
                                },
                            ],
                        }];
                    console.log("txns: ".concat(JSON.stringify(txns)));
                    return [4 /*yield*/, (0, utils_1.generateExecuteArgs)({ desiredTxns: txns })];
                case 2:
                    _c = _d.sent(), methodDataToValidate = _c.methodDataToValidate, executeArgs = _c.executeArgs, totalAttachedYocto = _c.totalAttachedYocto, totalGasForTxns = _c.totalGasForTxns;
                    return [4 /*yield*/, (0, utils_1.validateDesiredMethods)({ methodData: methodDataToValidate, trialAccountId: trialAccountId })];
                case 3:
                    isValidTxn = _d.sent();
                    console.log('isValidTxn: ', isValidTxn);
                    if (isValidTxn == false) {
                        throw utils_1.TRIAL_ERRORS.INVALID_ACTION;
                    }
                    return [4 /*yield*/, (0, utils_1.hasEnoughBalance)({ trialAccountId: trialAccountId, totalAttachedYocto: totalAttachedYocto, totalGasForTxns: totalGasForTxns })];
                case 4:
                    hasBal = _d.sent();
                    if (hasBal == false) {
                        throw utils_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE;
                    }
                    trialKeyPair = near_api_js_1.KeyPair.fromString(trialAccountSecretKey);
                    pubKey = trialKeyPair.getPublicKey();
                    return [4 /*yield*/, keyStore.setKey(networkId, trialAccountId, trialKeyPair)];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, near.account(trialAccountId)];
                case 6:
                    account = _d.sent();
                    gasToAttach = (0, utils_1.estimateTrialGas)({ executeArgs: executeArgs });
                    return [4 /*yield*/, (0, keypom_utils_1.createTransactions)({
                            signerId: trialAccountId,
                            signerPk: pubKey,
                            txnInfos: [{
                                    receiverId: account.accountId,
                                    actions: [{
                                            type: 'FunctionCall',
                                            params: {
                                                methodName: 'execute',
                                                args: executeArgs,
                                                gas: gasToAttach,
                                            }
                                        }]
                                }]
                        })];
                case 7:
                    transformedTransactions = _d.sent();
                    console.log("debugging");
                    console.log('transformedTransactions: ', transformedTransactions);
                    promises = transformedTransactions.map(function (tx) { return account.signAndSendTransaction(tx); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 8: return [2 /*return*/, _d.sent()];
            }
        });
    });
};
exports.trialCallMethod = trialCallMethod;
/**
 * Check whether a trial account is able to exit their trial state and become a fully fledged normal account.
 *
 * @example
 * Create a trial account and check whether it can immediately exit
 * ```js
 *     await initKeypom({
 *        // near,
 *        network: 'testnet',
 *        funder: {
 *            accountId: fundingAccountId,
 *            secretKey: fundingAccountSecretKey,
 *        }
 *    });
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKey
 *    })
 *
 *    const canExitTrial = await keypom.canExitTrial({
 *        trialAccountId: desiredAccountId
 *    })
 *    console.log('canExitTrial: ', canExitTrial)
 *	```
 *
 * @group Trial Accounts
*/
var canExitTrial = function (_a) {
    var trialAccountId = _a.trialAccountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var viewCall, keyInfo, rules, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    viewCall = (0, keypom_1.getEnv)().viewCall;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, viewCall({
                            contractId: trialAccountId,
                            methodName: 'get_key_information',
                            args: {}
                        })];
                case 2:
                    keyInfo = _b.sent();
                    console.log("keyInfo: ", keyInfo);
                    return [4 /*yield*/, viewCall({
                            contractId: trialAccountId,
                            methodName: 'get_rules',
                            args: {}
                        })];
                case 3:
                    rules = _b.sent();
                    console.log('rules: ', rules);
                    return [2 /*return*/, keyInfo.trial_data.exit == true];
                case 4:
                    e_1 = _b.sent();
                    console.log('error: ', e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, false];
            }
        });
    });
};
exports.canExitTrial = canExitTrial;
