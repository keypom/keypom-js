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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRequiredDeposit = exports.getStorageBase = exports.transformTransactions = exports.parseFTAmount = exports.nftTransferCall = exports.ftTransferCall = exports.execute = exports.keypomView = exports.getUserBalance = exports.generateKeys = exports.key2str = exports.snakeToCamel = exports.ATTACHED_GAS_FROM_WALLET = void 0;
var near_api_js_1 = require("near-api-js");
var bn_js_1 = __importDefault(require("bn.js"));
var keypom_1 = require("./keypom");
var near_seed_phrase_1 = require("near-seed-phrase");
var nearAPI = __importStar(require("near-api-js"));
var KeyPair = nearAPI.KeyPair, utils = nearAPI.utils, parseNearAmount = nearAPI.utils.format.parseNearAmount;
var sha256Hash;
if (typeof crypto === 'undefined') {
    var nodeCrypto_1 = require('crypto');
    sha256Hash = function (ab) { return nodeCrypto_1.createHash('sha256').update(ab).digest(); };
}
else {
    sha256Hash = function (ab) { return crypto.subtle.digest('SHA-256', ab); };
}
/// How much Gas each each cross contract call with cost to be converted to a receipt
var GAS_PER_CCC = 5000000000000; // 5 TGas
var RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
var YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
var ACCESS_KEY_STORAGE = new bn_js_1.default("1000000000000000000000");
var snakeToCamel = function (s) {
    return s.toLowerCase().replace(/([-_][a-z])/g, function (m) { return m.toUpperCase().replace(/-_/g, ''); });
};
exports.snakeToCamel = snakeToCamel;
var key2str = function (v) { return typeof v === 'string' ? v : v.pk; };
exports.key2str = key2str;
var hashBuf = function (str) { return sha256Hash(new TextEncoder().encode(str)); };
/**
 * Generate ed25519 KeyPairs that can be used for Keypom linkdrops, or full access keys to claimed accounts. These keys can optionally be derived from some entropy such as a root password and metadata pertaining to each key (user provided password etc.).
 * Entropy is useful for creating an onboarding experience where in order to recover a keypair, the client simply needs to provide the meta entropy (could be a user's password) and the secret root key like a UUID).
 *
 * @param {number} numKeys - The number of keys to generate
 * @param {string=} rootEntropy (OPTIONAL) - A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random.
 * @param {string=} metaEntropy (OPTIONAL) - An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply
 pass in the string itself directly (not within an array).
 *
 * @returns {Promise<GeneratedKeyPairs>} - An object containing an array of KeyPairs, Public Keys and Secret Keys.
 *
 * @example <caption>Generating 10 unique random keypairs with no entropy</caption>
 * // Generate 10 keys with no entropy (all random)
 * let keys = await generateKeys({
 *     numKeys: 10,
 * })
 *
 * let pubKey1 = keys.publicKeys[0];
 * let secretKey1 = keys.secretKeys[0];
 *
 * console.log('1st Public Key: ', pubKey1);
 * console.log('1st Secret Key: ', secretKey1)
 *
 * @example <caption>Generating 1 keypair based on entropy</caption>
 * // Generate 1 key with the given entropy
 * let keys = await generateKeys({
 *     numKeys: 1,
 *     entropy: {
 *         rootKey: "my-global-password",
 *         meta: "user-password-123",
 *     } // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 *
 * let pubKey = keys.publicKeys[0];
 * let secretKey = keys.secretKeys[0];
 *
 * console.log('Public Key: ', pubKey);
 * console.log('Secret Key: ', secretKey)
 *
 * @example <caption>Generating 2 keypairs each with their own entropy</caption>
 * // Generate 2 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 2,
 *     entropy: [
 *         {
 *             rootKey: "my-global-password",
 *             meta: "first-password",
 *             nonce: 1
 *         },
 *         {
 *             rootKey: "my-global-password",
 *             meta: "second-password",
 *             nonce: 2
 *         }
 *     ]
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 */
var generateKeys = function (_a) {
    var numKeys = _a.numKeys, rootEntropy = _a.rootEntropy, metaEntropy = _a.metaEntropy;
    return __awaiter(void 0, void 0, void 0, function () {
        var numEntropy, keyPairs, publicKeys, secretKeys, i, stringToHash, hash, _b, secretKey, publicKey, keyPair, keyPair;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // If the metaEntropy provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
                    if (metaEntropy && !Array.isArray(metaEntropy)) {
                        metaEntropy = [metaEntropy];
                    }
                    numEntropy = (metaEntropy === null || metaEntropy === void 0 ? void 0 : metaEntropy.length) || numKeys;
                    if (numEntropy != numKeys) {
                        throw new Error("You must provide the same number of meta entropy values as the number of keys");
                    }
                    keyPairs = [];
                    publicKeys = [];
                    secretKeys = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < numKeys)) return [3 /*break*/, 6];
                    if (!rootEntropy) return [3 /*break*/, 3];
                    stringToHash = metaEntropy ? "".concat(rootEntropy, "_").concat(metaEntropy[i]) : rootEntropy;
                    return [4 /*yield*/, hashBuf(stringToHash)];
                case 2:
                    hash = _c.sent();
                    _b = (0, near_seed_phrase_1.generateSeedPhrase)(hash), secretKey = _b.secretKey, publicKey = _b.publicKey;
                    keyPair = KeyPair.fromString(secretKey);
                    keyPairs.push(keyPair);
                    publicKeys.push(publicKey);
                    secretKeys.push(secretKey);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, KeyPair.fromRandom('ed25519')];
                case 4:
                    keyPair = _c.sent();
                    keyPairs.push(keyPair);
                    publicKeys.push(keyPair.getPublicKey().toString());
                    // @ts-ignore - not sure why it's saying secret key isn't property of keypair
                    secretKeys.push(keyPair.secretKey);
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, {
                        keyPairs: keyPairs,
                        publicKeys: publicKeys,
                        secretKeys: secretKeys
                    }];
            }
        });
    });
};
exports.generateKeys = generateKeys;
/**
 * Query for a user's current balance on the Keypom contract
 *
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 *
 * @returns {string} The user's current balance
 *
 * @example <caption>Query for a user's current balance on the Keypom contract</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the drop information for a specific drop
 * const dropInfo = await getDropInformation({
 * dropId: "1669840629120",
 * withKeys: true
 * })
 *
 * console.log('dropInfo: ', dropInfo)
 * ```
*/
var getUserBalance = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, contractId, viewAccount;
        return __generator(this, function (_c) {
            _b = (0, keypom_1.getEnv)(), contractId = _b.contractId, viewAccount = _b.viewAccount;
            return [2 /*return*/, viewAccount.viewFunction2({ contractId: contractId, methodName: 'get_user_balance', args: { account_id: accountId } })];
        });
    });
};
exports.getUserBalance = getUserBalance;
var keypomView = function (_a) {
    var methodName = _a.methodName, args = _a.args;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, viewAccount, contractId;
        return __generator(this, function (_c) {
            _b = (0, keypom_1.getEnv)(), viewAccount = _b.viewAccount, contractId = _b.contractId;
            if (!viewAccount) {
                throw new Error('initKeypom must be called before view functions can be called.');
            }
            return [2 /*return*/, viewAccount.viewFunction2({
                    contractId: contractId,
                    methodName: methodName,
                    args: args
                })];
        });
    });
};
exports.keypomView = keypomView;
/// TODO WIP: helper to remove the deposit if the user already has enough balance to cover the drop,add_keys
// export const hasDeposit = ({
//     accountId,
//     transactions,
// }) => {
//     const { contractId, viewAccount } = getEnv()
//     const totalDeposit = transactions.reduce((a, c) =>
//         a.add(c.actions.reduce((a, c) => a.add(new BN(c.deposit || '0')), new BN('0')))
//     , new BN('0'))
// 	const userBalance = viewAccount.viewFunction2({ contractId, methodName: 'get_user_balance', args: { account_id: accountId }})
//     if (new BN(userBalance.gt(totalDeposit))) {
//         transactions
//             .filter(({ receiverId }) => contractId === receiverId)
//             .forEach((tx) => tx.actions.forEach((a) => {
//                 if (/create_drop|add_keys/gi.test(a.methodName)) delete a.deposit
//             }))
//     }
// }
var execute = function (_a) {
    var transactions = _a.transactions, account = _a.account, wallet = _a.wallet, fundingAccount = _a.fundingAccount;
    return __awaiter(void 0, void 0, void 0, function () {
        var contractId, needsRedirect_1, responses, _i, transactions_1, tx, _b, _c, nearAccount;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    contractId = (0, keypom_1.getEnv)().contractId;
                    if (!wallet) return [3 /*break*/, 7];
                    needsRedirect_1 = false;
                    transactions.forEach(function (tx) {
                        if (tx.receiverId !== contractId)
                            needsRedirect_1 = true;
                        tx.actions.forEach(function (a) {
                            var deposit = (a === null || a === void 0 ? void 0 : a.params).deposit;
                            if (deposit && deposit !== '0')
                                needsRedirect_1 = true;
                        });
                    });
                    if (!needsRedirect_1) return [3 /*break*/, 2];
                    return [4 /*yield*/, wallet.signAndSendTransactions({ transactions: transactions })
                        // sign txs in serial without redirect
                    ];
                case 1: return [2 /*return*/, _d.sent()
                    // sign txs in serial without redirect
                ];
                case 2:
                    responses = [];
                    _i = 0, transactions_1 = transactions;
                    _d.label = 3;
                case 3:
                    if (!(_i < transactions_1.length)) return [3 /*break*/, 6];
                    tx = transactions_1[_i];
                    _c = (_b = responses).push;
                    return [4 /*yield*/, wallet.signAndSendTransaction({
                            actions: tx.actions
                        })];
                case 4:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, responses];
                case 7:
                    nearAccount = account || fundingAccount;
                    if (!nearAccount) {
                        throw new Error("Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'");
                    }
                    return [4 /*yield*/, signAndSendTransactions(nearAccount, (0, exports.transformTransactions)(transactions))];
                case 8: return [2 /*return*/, _d.sent()];
            }
        });
    });
};
exports.execute = execute;
var ftTransferCall = function (_a) {
    var account = _a.account, contractId = _a.contractId, args = _a.args, _b = _a.returnTransaction, returnTransaction = _b === void 0 ? false : _b;
    var tx = {
        receiverId: contractId,
        signerId: account.accountId,
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
    return (0, exports.execute)({ account: account, transactions: [tx] });
};
exports.ftTransferCall = ftTransferCall;
var nftTransferCall = function (_a) {
    var account = _a.account, contractId = _a.contractId, receiverId = _a.receiverId, tokenIds = _a.tokenIds, msg = _a.msg, _b = _a.returnTransactions, returnTransactions = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var responses, transactions, i, tx, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    responses = [];
                    transactions = [];
                    i = 0;
                    _e.label = 1;
                case 1:
                    if (!(i < tokenIds.length)) return [3 /*break*/, 4];
                    tx = {
                        receiverId: contractId,
                        signerId: account.accountId,
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
                    };
                    transactions.push(tx);
                    if (returnTransactions)
                        return [3 /*break*/, 3];
                    _d = (_c = responses).push;
                    return [4 /*yield*/, (0, exports.execute)({
                            account: account,
                            transactions: transactions,
                        })];
                case 2:
                    _d.apply(_c, [_e.sent()]);
                    _e.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, returnTransactions ? transactions : responses];
            }
        });
    });
};
exports.nftTransferCall = nftTransferCall;
/// https://github.com/near/near-api-js/blob/7f16b10ece3c900aebcedf6ebc660cc9e604a242/packages/near-api-js/src/utils/format.ts#L53
var parseFTAmount = function (amt, decimals) {
    amt = amt.replace(/,/g, '').trim();
    var split = amt.split('.');
    var wholePart = split[0];
    var fracPart = split[1] || '';
    if (split.length > 2 || fracPart.length > decimals) {
        throw new Error("Cannot parse '".concat(amt, "' as NEAR amount"));
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, '0'));
};
exports.parseFTAmount = parseFTAmount;
var trimLeadingZeroes = function (value) {
    value = value.replace(/^0+/, '');
    if (value === '') {
        return '0';
    }
    return value;
};
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
                // @ts-ignore
                // near-api-js marks this method as protected.
                // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
                _b = (_a = responses).push;
                return [4 /*yield*/, account.signAndSendTransaction(txs[i])];
            case 2:
                // @ts-ignore
                // near-api-js marks this method as protected.
                // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
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
    var txnOption = {
        receiverId: receiverId,
        actions: actions
    };
    return (txnOption);
}); };
exports.transformTransactions = transformTransactions;
// reference: https://github.com/near/wallet-selector/blob/d09f69e50df05c8e5f972beab4f336d7cfa08c65/packages/wallet-utils/src/lib/create-action.ts
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return near_api_js_1.transactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return near_api_js_1.transactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas = _a.gas, deposit = _a.deposit;
            return near_api_js_1.transactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return near_api_js_1.transactions.transfer(new bn_js_1.default(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return near_api_js_1.transactions.stake(new bn_js_1.default(stake), utils.PublicKey.from(publicKey));
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
            return near_api_js_1.transactions.deleteKey(utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return near_api_js_1.transactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
var getStorageBase = function (_a) {
    var nftData = _a.nftData, fcData = _a.fcData;
    if (fcData === null || fcData === void 0 ? void 0 : fcData.methods)
        return parseNearAmount('0.015');
    if (nftData.contractId)
        return parseNearAmount('0.05');
    return parseNearAmount('0.01');
};
exports.getStorageBase = getStorageBase;
// Initiate the connection to the NEAR blockchain.
var estimateRequiredDeposit = function (_a) {
    var near = _a.near, depositPerUse = _a.depositPerUse, numKeys = _a.numKeys, usesPerKey = _a.usesPerKey, attachedGas = _a.attachedGas, _b = _a.storage, storage = _b === void 0 ? parseNearAmount("0.034") : _b, _c = _a.keyStorage, keyStorage = _c === void 0 ? parseNearAmount("0.0065") : _c, fcData = _a.fcData, ftData = _a.ftData;
    return __awaiter(void 0, void 0, void 0, function () {
        var numKeysBN, totalRequiredStorage, actualAllowance, totalAllowance, totalAccessKeyStorage, _d, numNoneFcs, depositRequiredForFcDrops, totalDeposits, totalDepositsForFc, requiredDeposit, extraFtCosts;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    numKeysBN = new bn_js_1.default(numKeys.toString());
                    totalRequiredStorage = new bn_js_1.default(storage).add(new bn_js_1.default(keyStorage).mul(numKeysBN));
                    actualAllowance = estimatePessimisticAllowance(attachedGas);
                    totalAllowance = actualAllowance.mul(numKeysBN);
                    totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
                    _d = getNoneFcsAndDepositRequired(fcData, usesPerKey), numNoneFcs = _d.numNoneFcs, depositRequiredForFcDrops = _d.depositRequiredForFcDrops;
                    totalDeposits = new bn_js_1.default(depositPerUse).mul(new bn_js_1.default(usesPerKey - numNoneFcs)).mul(numKeysBN);
                    totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
                    requiredDeposit = totalRequiredStorage
                        .add(totalAllowance)
                        .add(totalAccessKeyStorage)
                        .add(totalDeposits)
                        .add(totalDepositsForFc);
                    if (!((ftData === null || ftData === void 0 ? void 0 : ftData.contractId) != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFtCosts(near, numKeys, usesPerKey, ftData.contractId || ftData.contractId)];
                case 1:
                    extraFtCosts = _e.sent();
                    requiredDeposit = requiredDeposit.add(new bn_js_1.default(extraFtCosts));
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
    var requiredAllowance = new bn_js_1.default(requiredGas).mul(new bn_js_1.default(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};
// Estimate the amount of allowance required for a given attached gas.
var getNoneFcsAndDepositRequired = function (fcData, usesPerKey) {
    var depositRequiredForFcDrops = new bn_js_1.default(0);
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
        var attachedDeposit = new bn_js_1.default(0);
        for (var i = 0; i < methodData.length; i++) {
            attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[i].attachedDeposit));
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
        numNoneFcs += isNoneFc ? 1 : 0;
        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            var attachedDeposit = new bn_js_1.default(0);
            for (var j = 0; j < methodData.length; j++) {
                attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[j].attachedDeposit));
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
    var viewAccount, min, costs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, near.account("foo")];
            case 1:
                viewAccount = _a.sent();
                return [4 /*yield*/, viewAccount.viewFunction(ftContract, "storage_balance_bounds", {})];
            case 2:
                min = (_a.sent()).min;
                costs = new bn_js_1.default(min).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(usesPerKey)).add(new bn_js_1.default(min));
                // console.log('costs: ', costs.toString());
                return [2 /*return*/, costs.toString()];
        }
    });
}); };
