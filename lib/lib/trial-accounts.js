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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimTrialAccountDrop = exports.createTrialAccountDrop = exports.KEY_LIMIT = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var nearAPI = __importStar(require("near-api-js"));
var _a = nearAPI.utils.format, parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var near_api_js_1 = require("near-api-js");
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var views_1 = require("./views");
var keypom_v2_utils_1 = require("./selector/utils/keypom-v2-utils");
exports.KEY_LIMIT = 50;
/**
 * Creates a new trial account drop which can be used to instantly sign users into decentralized applications that support the Keypom wallet selector plugin.
 *
 * The trial account is locked into certain behaviors depending on what is passed into `createTrialAccountDrop`. These behaviors include callable contracts, methods on
 * those contracts, the maximum amount of $NEAR that can be spent on each contract as well as an exit condition. Once the trial account has run out of funds, the only way to
 * retain any assets from the trial or continue using the account ID, is to repay the specific account ID for the amount of $NEAR specified.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Creating a trial account with any callable methods, an amount of 0.5 $NEAR and 5 keys.
 * ```js
 * const {keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} = await createTrialAccountDrop({
 *     contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *     trialFundsNEAR: 0.5,
 *     callableContracts: ['dev-1676298343226-57701595703433'],
 *     callableMethods: ['*'],
 *     amounts: ['0.5'],
 *     numKeys: 5,
 *     config: {
 *         dropRoot: "linkdrop-beta.keypom.testnet"
 *     }
 * })
 *
 * const newAccountId = `${Date.now().toString()}.linkdrop-beta.keypom.testnet`
 * await claimTrialAccountDrop({
 *     secretKey: trialSecretKeys[0],
 *     desiredAccountId: newAccountId,
 * })
 *
 * console.log(`
 *
 * ${JSON.stringify({
 *     account_id: newAccountId,
 *     public_key: trialPublicKeys[0],
 *     private_key: trialSecretKeys[0]
 * })}
 *
 * `)
 *
 * console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKeys[0]}`)
 *
 * ```
 * @group Creating, And Claiming Drops
*/
var createTrialAccountDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, contractBytes = _a.contractBytes, trialFundsNEAR = _a.trialFundsNEAR, trialFundsYocto = _a.trialFundsYocto, callableContracts = _a.callableContracts, amounts = _a.amounts, callableMethods = _a.callableMethods, repayAmountNEAR = _a.repayAmountNEAR, repayAmountYocto = _a.repayAmountYocto, repayTo = _a.repayTo, dropId = _a.dropId, _b = _a.config, config = _b === void 0 ? {} : _b, _c = _a.numKeys, numKeys = _c === void 0 ? 0 : _c, publicKeys = _a.publicKeys, rootEntropy = _a.rootEntropy, metadata = _a.metadata, _d = _a.useBalance, useBalance = _d === void 0 ? false : _d, _e = _a.returnTransactions, returnTransactions = _e === void 0 ? false : _e, successUrl = _a.successUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var _f, near, viewCall, networkId, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccountDetails, finalConfig, keys, rootEntropyUsed, nonceDropIdMeta, attachedDeposit, rootReceiverId, createDropArgs, fcData, storageCalculated, requiredDeposit, hasBalance, userBal, deposit, transactions, responses;
        var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        return __generator(this, function (_x) {
            switch (_x.label) {
                case 0:
                    _f = (0, keypom_1.getEnv)(), near = _f.near, viewCall = _f.viewCall, networkId = _f.networkId, gas = _f.gas, attachedGas = _f.attachedGas, contractId = _f.contractId, receiverId = _f.receiverId, getAccount = _f.getAccount, execute = _f.execute, fundingAccountDetails = _f.fundingAccountDetails;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _x.sent();
                    (0, checks_1.assert)(keypom_1.supportedKeypomContracts[networkId][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract.");
                    // Ensure that if the dropID is passed in, it's greater than 1 billion
                    (0, checks_1.assert)(parseInt(dropId || "1000000000") >= 1000000000, 'All custom drop IDs must be greater than 1_000_000_000');
                    if (!dropId)
                        dropId = Date.now().toString();
                    return [4 /*yield*/, (0, checks_1.assertDropIdUnique)(dropId)];
                case 2:
                    _x.sent();
                    finalConfig = {
                        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
                        time: config === null || config === void 0 ? void 0 : config.time,
                        usage: {
                            auto_delete_drop: ((_g = config === null || config === void 0 ? void 0 : config.usage) === null || _g === void 0 ? void 0 : _g.autoDeleteDrop) || false,
                            auto_withdraw: ((_h = config === null || config === void 0 ? void 0 : config.usage) === null || _h === void 0 ? void 0 : _h.autoWithdraw) || true,
                            permissions: (_j = config === null || config === void 0 ? void 0 : config.usage) === null || _j === void 0 ? void 0 : _j.permissions,
                            refund_deposit: (_k = config === null || config === void 0 ? void 0 : config.usage) === null || _k === void 0 ? void 0 : _k.refundDeposit,
                        },
                        sale: (config === null || config === void 0 ? void 0 : config.sale) ? {
                            max_num_keys: (_l = config === null || config === void 0 ? void 0 : config.sale) === null || _l === void 0 ? void 0 : _l.maxNumKeys,
                            price_per_key: ((_m = config === null || config === void 0 ? void 0 : config.sale) === null || _m === void 0 ? void 0 : _m.pricePerKeyYocto) || ((_o = config === null || config === void 0 ? void 0 : config.sale) === null || _o === void 0 ? void 0 : _o.pricePerKeyNEAR) ? parseNearAmount((_q = (_p = config === null || config === void 0 ? void 0 : config.sale) === null || _p === void 0 ? void 0 : _p.pricePerKeyNEAR) === null || _q === void 0 ? void 0 : _q.toString()) : undefined,
                            allowlist: (_r = config === null || config === void 0 ? void 0 : config.sale) === null || _r === void 0 ? void 0 : _r.allowlist,
                            blocklist: (_s = config === null || config === void 0 ? void 0 : config.sale) === null || _s === void 0 ? void 0 : _s.blocklist,
                            auto_withdraw_funds: (_t = config === null || config === void 0 ? void 0 : config.sale) === null || _t === void 0 ? void 0 : _t.autoWithdrawFunds,
                            start: (_u = config === null || config === void 0 ? void 0 : config.sale) === null || _u === void 0 ? void 0 : _u.start,
                            end: (_v = config === null || config === void 0 ? void 0 : config.sale) === null || _v === void 0 ? void 0 : _v.end
                        } : undefined,
                        root_account_id: config === null || config === void 0 ? void 0 : config.dropRoot,
                    };
                    (0, checks_1.assertValidDropConfig)(finalConfig);
                    if (!!publicKeys) return [3 /*break*/, 7];
                    rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
                    if (!rootEntropyUsed) return [3 /*break*/, 4];
                    nonceDropIdMeta = Array.from({ length: numKeys }, function (_, i) { return "".concat(dropId, "_").concat(i); });
                    return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                            numKeys: numKeys,
                            rootEntropy: rootEntropyUsed,
                            metaEntropy: nonceDropIdMeta
                        })];
                case 3:
                    keys = _x.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 5:
                    // No entropy is provided so all keys should be fully random
                    keys = _x.sent();
                    _x.label = 6;
                case 6:
                    publicKeys = keys.publicKeys;
                    _x.label = 7;
                case 7:
                    numKeys = publicKeys.length;
                    /// parse args
                    if (trialFundsNEAR) {
                        trialFundsYocto = parseNearAmount(trialFundsNEAR.toString()) || '0';
                    }
                    if (!trialFundsYocto)
                        trialFundsYocto = '0';
                    if (repayAmountNEAR) {
                        repayAmountYocto = parseNearAmount(repayAmountNEAR.toString()) || '0';
                    }
                    if (!repayAmountYocto)
                        repayAmountYocto = '0';
                    attachedDeposit = new bn_js_1.default(trialFundsYocto).add(new bn_js_1.default(parseNearAmount("0.3"))).toString();
                    rootReceiverId = (_w = finalConfig.root_account_id) !== null && _w !== void 0 ? _w : (networkId == "testnet" ? "testnet" : "mainnet");
                    createDropArgs = {
                        drop_id: dropId,
                        public_keys: publicKeys || [],
                        deposit_per_use: '0',
                        config: finalConfig,
                        metadata: metadata,
                        fc: {
                            methods: [[
                                    {
                                        receiver_id: rootReceiverId,
                                        method_name: 'create_account_advanced',
                                        //@ts-ignore
                                        attached_deposit: attachedDeposit,
                                        args: JSON.stringify({
                                            new_account_id: "INSERT_NEW_ACCOUNT",
                                            options: {
                                                contract_bytes: contractBytes,
                                                limited_access_keys: [{
                                                        public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                                        allowance: trialFundsYocto,
                                                        receiver_id: "INSERT_NEW_ACCOUNT",
                                                        method_names: 'execute',
                                                    }],
                                            }
                                        }),
                                        user_args_rule: "UserPreferred"
                                    },
                                    {
                                        receiver_id: "",
                                        method_name: 'setup',
                                        //@ts-ignore
                                        attached_deposit: '0',
                                        args: JSON.stringify((0, keypom_v2_utils_1.wrapParams)({
                                            contracts: callableContracts,
                                            amounts: amounts,
                                            methods: callableMethods,
                                            funder: repayTo || account.accountId,
                                            repay: repayAmountYocto,
                                        })),
                                        //user_args_rule: "UserPreferred",
                                        receiver_to_claimer: true
                                    }
                                ]]
                        }
                    };
                    fcData = {
                        methods: [[{
                                    receiverId: rootReceiverId,
                                    methodName: 'create_account_advanced',
                                    //@ts-ignore
                                    attachedDeposit: attachedDeposit,
                                    args: JSON.stringify({
                                        new_account_id: "INSERT_NEW_ACCOUNT",
                                        options: {
                                            contract_bytes: contractBytes,
                                            limited_access_keys: [{
                                                    public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                                    allowance: trialFundsYocto,
                                                    receiver_id: "INSERT_NEW_ACCOUNT",
                                                    method_names: 'execute',
                                                }],
                                        }
                                    }),
                                    userArgsRule: "UserPreferred"
                                },
                                {
                                    receiverId: "",
                                    methodName: 'setup',
                                    //@ts-ignore
                                    attachedDeposit: '0',
                                    args: JSON.stringify((0, keypom_v2_utils_1.wrapParams)({
                                        contracts: callableContracts,
                                        amounts: amounts,
                                        methods: callableMethods,
                                        funder: repayTo || account.accountId,
                                        repay: repayAmountYocto,
                                    })),
                                    userArgsRule: "UserPreferred",
                                    receiverToClaimer: true
                                }
                            ]],
                    };
                    storageCalculated = (0, keypom_utils_1.getStorageBase)(createDropArgs);
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: '0',
                            numKeys: numKeys,
                            usesPerKey: finalConfig.uses_per_key || 1,
                            attachedGas: parseInt(attachedGas),
                            storage: storageCalculated,
                            fcData: fcData,
                        })];
                case 8:
                    requiredDeposit = _x.sent();
                    hasBalance = false;
                    if (!useBalance) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, views_1.getUserBalance)({ accountId: account.accountId })];
                case 9:
                    userBal = _x.sent();
                    if (userBal < requiredDeposit) {
                        throw new Error("Insufficient balance on Keypom to create drop. Use attached deposit instead.");
                    }
                    hasBalance = true;
                    _x.label = 10;
                case 10:
                    deposit = !hasBalance ? requiredDeposit : '0';
                    transactions = [];
                    transactions.push({
                        receiverId: receiverId,
                        signerId: account.accountId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'create_drop',
                                    args: createDropArgs,
                                    gas: gas,
                                    deposit: deposit,
                                }
                            }]
                    });
                    if (returnTransactions) {
                        return [2 /*return*/, { keys: keys, dropId: dropId, transactions: transactions, requiredDeposit: requiredDeposit }];
                    }
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet, successUrl: successUrl })];
                case 11:
                    responses = _x.sent();
                    return [2 /*return*/, { responses: responses, keys: keys, dropId: dropId, requiredDeposit: requiredDeposit }];
            }
        });
    });
};
exports.createTrialAccountDrop = createTrialAccountDrop;
/**
 * Claim a Keypom trial account drop which will create a new account, deploy and initialize the trial account contract, and setup the account with initial conditions as specified in the drop.
 *
 * @example
 * Creating a trial account with any callable methods, an amount of 0.5 $NEAR and 5 keys.
 * ```js
 * const {keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} = await createTrialAccountDrop({
 *     contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *     trialFundsNEAR: 0.5,
 *     callableContracts: ['dev-1676298343226-57701595703433'],
 *     callableMethods: ['*'],
 *     amounts: ['0.5'],
 *     numKeys: 5,
 *     config: {
 *         dropRoot: "linkdrop-beta.keypom.testnet"
 *     }
 * })
 *
 * const newAccountId = `${Date.now().toString()}.linkdrop-beta.keypom.testnet`
 * await claimTrialAccountDrop({
 *     secretKey: trialSecretKeys[0],
 *     desiredAccountId: newAccountId,
 * })
 *
 * console.log(`
 *
 * ${JSON.stringify({
 *     account_id: newAccountId,
 *     public_key: trialPublicKeys[0],
 *     private_key: trialSecretKeys[0]
 * })}
 *
 * `)
 *
 * console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKeys[0]}`)
 *
 * ```
 * @group Creating, And Claiming Drops
*/
var claimTrialAccountDrop = function (_a) {
    var secretKey = _a.secretKey, desiredAccountId = _a.desiredAccountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute, fundingAccountDetails, near, keyPair, pubKey, dropInfo, userFcArgs, transactions, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), networkId = _b.networkId, keyStore = _b.keyStore, attachedGas = _b.attachedGas, contractId = _b.contractId, contractAccount = _b.contractAccount, receiverId = _b.receiverId, execute = _b.execute, fundingAccountDetails = _b.fundingAccountDetails, near = _b.near;
                    keyPair = near_api_js_1.KeyPair.fromString(secretKey);
                    pubKey = keyPair.getPublicKey().toString();
                    return [4 /*yield*/, keyStore.setKey(networkId, contractId, keyPair)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ secretKey: secretKey })];
                case 2:
                    dropInfo = _c.sent();
                    (0, checks_1.assert)(dropInfo.fc !== undefined, "drop must be a trial account drop");
                    userFcArgs = {
                        "INSERT_NEW_ACCOUNT": desiredAccountId,
                        "INSERT_TRIAL_PUBLIC_KEY": pubKey
                    };
                    transactions = [{
                            receiverId: receiverId,
                            actions: [{
                                    type: 'FunctionCall',
                                    params: {
                                        methodName: 'claim',
                                        args: {
                                            account_id: desiredAccountId,
                                            fc_args: [JSON.stringify(userFcArgs), null]
                                        },
                                        gas: attachedGas,
                                    }
                                }]
                        }];
                    return [4 /*yield*/, execute({ transactions: transactions, account: contractAccount })];
                case 3:
                    result = _c.sent();
                    return [2 /*return*/, result];
            }
        });
    });
};
exports.claimTrialAccountDrop = claimTrialAccountDrop;
