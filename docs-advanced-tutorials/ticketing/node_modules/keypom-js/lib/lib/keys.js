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
exports.deleteKeys = exports.addKeys = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var nearAPI = __importStar(require("near-api-js"));
var parseNearAmount = nearAPI.utils.format.parseNearAmount;
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var views_1 = require("./views");
/**
 * Add keys that are manually generated and passed in, or automatically generated to an existing drop. If they're
 * automatically generated, they can be based off a set of entropy. For NFT and FT drops, assets can automatically be sent to Keypom to register keys as part of the payload.
 * The deposit is estimated based on parameters that are passed in and the transaction can be returned instead of signed and sent to the network. This can allow you to get the
 * required deposit from the return value and use that to fund the account's Keypom balance to avoid multiple transactions being signed in the case of a drop with many keys.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Create a basic empty simple drop and add 10 keys. Each key is completely random:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Create an empty simple drop with no keys.
 * const {dropId} = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Add 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await addKeys({
 * 	dropId,
 * 	numKeys: 10
 * })
 *
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ```
 *
 * @example
 * Init funder with root entropy, create empty drop and add generate deterministic keys. Compare with manually generated keys:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. Root entropy is passed into the funder account so any generated keys
 * // Will be based off that entropy.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1",
 * 		rootEntropy: "my-global-secret-password"
 * 	}
 * });
 *
 * // Create a simple drop with no keys
 * const { dropId } = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Add 5 keys to the empty simple drop. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const {keys: keysFromDrop} = await addKeys({
 * 	dropId,
 * 	numKeys: 5
 * })
 *
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 *
 * // Get the public and private keys from the keys generated by addKeys
 * const {publicKeys, secretKeys} = keysFromDrop;
 * // Get the public and private keys from the keys that were manually generated
 * const {publicKeys: pubKeysGenerated, secretKeys: secretKeysGenerated} = manualKeys;
 * // These should match!
 * console.log('secretKeys: ', secretKeys)
 * console.log('secretKeysGenerated: ', secretKeysGenerated)
 *
 * // These should match!
 * console.log('publicKeys: ', publicKeys)
 * console.log('pubKeysGenerated: ', pubKeysGenerated)
 * ```
 *
 * @example
 * Create an empty drop and add manually created keys:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Create an empty simple drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * const {dropId} = await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 * // Add keys to the drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await addKeys({
 * 	publicKeys,
 * 	dropId
 * })
 * ```
 * @group Creating, And Claiming Drops
*/
var addKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, drop = _a.drop, numKeys = _a.numKeys, publicKeys = _a.publicKeys, nftTokenIds = _a.nftTokenIds, rootEntropy = _a.rootEntropy, basePassword = _a.basePassword, passwordProtectedUses = _a.passwordProtectedUses, extraDepositNEAR = _a.extraDepositNEAR, extraDepositYocto = _a.extraDepositYocto, _b = _a.useBalance, useBalance = _b === void 0 ? false : _b, _c = _a.returnTransactions, returnTransactions = _c === void 0 ? false : _c;
    return __awaiter(void 0, void 0, void 0, function () {
        var _d, near, gas, contractId, receiverId, getAccount, execute, fundingAccountDetails, networkId, _e, drop_id, owner_id, registered_uses, required_gas, deposit_per_use, config, ftData, nftData, fcData, next_key_id, _f, uses_per_key, canAddKeys, keys, rootEntropyUsed, nonceDropIdMeta, passwords, camelFTData, camelFCData, requiredDeposit, hasBalance, userBal, transactions, _g, _h, tokenIds, nftTXs, responses;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _d = (0, keypom_1.getEnv)(), near = _d.near, gas = _d.gas, contractId = _d.contractId, receiverId = _d.receiverId, getAccount = _d.getAccount, execute = _d.execute, fundingAccountDetails = _d.fundingAccountDetails, networkId = _d.networkId;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    (0, checks_1.assert)(drop || dropId, 'Either a dropId or drop object must be passed in.');
                    (0, checks_1.assert)(numKeys || (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length), "Either pass in publicKeys or set numKeys to a positive non-zero value.");
                    (0, checks_1.assert)(keypom_1.supportedKeypomContracts[networkId][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract");
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _j.sent();
                    _f = drop;
                    if (_f) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    _f = (_j.sent());
                    _j.label = 3;
                case 3:
                    _e = _f, drop_id = _e.drop_id, owner_id = _e.owner_id, registered_uses = _e.registered_uses, required_gas = _e.required_gas, deposit_per_use = _e.deposit_per_use, config = _e.config, ftData = _e.ft, nftData = _e.nft, fcData = _e.fc, next_key_id = _e.next_key_id;
                    dropId = drop_id;
                    uses_per_key = (config === null || config === void 0 ? void 0 : config.uses_per_key) || 1;
                    if (!!contractId.includes("v1-4.keypom")) return [3 /*break*/, 4];
                    (0, checks_1.assert)(owner_id === account.accountId, 'Calling account is not the owner of this drop.');
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, views_1.canUserAddKeys)({ accountId: account.accountId, dropId: dropId })];
                case 5:
                    canAddKeys = _j.sent();
                    (0, checks_1.assert)(canAddKeys == true, 'Calling account does not have permission to add keys to this drop.');
                    _j.label = 6;
                case 6:
                    if (!!publicKeys) return [3 /*break*/, 11];
                    rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
                    if (!rootEntropyUsed) return [3 /*break*/, 8];
                    nonceDropIdMeta = Array.from({ length: numKeys }, function (_, i) { return "".concat(drop_id, "_").concat(next_key_id + i); });
                    return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                            numKeys: numKeys,
                            rootEntropy: rootEntropyUsed,
                            metaEntropy: nonceDropIdMeta
                        })];
                case 7:
                    keys = _j.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 9:
                    // No entropy is provided so all keys should be fully random
                    keys = _j.sent();
                    _j.label = 10;
                case 10:
                    publicKeys = keys.publicKeys;
                    _j.label = 11;
                case 11:
                    numKeys = publicKeys.length;
                    if (!basePassword) return [3 /*break*/, 13];
                    (0, checks_1.assert)(numKeys <= 50, "Cannot add 50 keys at once with passwords");
                    return [4 /*yield*/, (0, keypom_utils_1.generatePerUsePasswords)({
                            publicKeys: publicKeys,
                            basePassword: basePassword,
                            uses: passwordProtectedUses || Array.from({ length: uses_per_key }, function (_, i) { return i + 1; })
                        })];
                case 12:
                    // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
                    passwords = _j.sent();
                    _j.label = 13;
                case 13:
                    camelFTData = (0, keypom_utils_1.toCamel)(ftData);
                    camelFCData = (0, keypom_utils_1.toCamel)(fcData);
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: deposit_per_use,
                            numKeys: numKeys,
                            usesPerKey: uses_per_key,
                            attachedGas: parseInt(required_gas),
                            storage: parseNearAmount('0.2'),
                            fcData: camelFCData,
                            ftData: camelFTData
                        })
                        // If there is any extra deposit needed, add it to the required deposit
                    ];
                case 14:
                    requiredDeposit = _j.sent();
                    // If there is any extra deposit needed, add it to the required deposit
                    extraDepositYocto = extraDepositYocto ? new bn_js_1.default(extraDepositYocto) : new bn_js_1.default("0");
                    if (extraDepositNEAR) {
                        extraDepositYocto = new bn_js_1.default(parseNearAmount(extraDepositNEAR.toString()));
                    }
                    requiredDeposit = new bn_js_1.default(requiredDeposit).add(extraDepositYocto).toString();
                    hasBalance = false;
                    if (!useBalance) return [3 /*break*/, 16];
                    return [4 /*yield*/, (0, views_1.getUserBalance)({ accountId: account.accountId })];
                case 15:
                    userBal = _j.sent();
                    (0, checks_1.assert)(userBal >= requiredDeposit, "Insufficient balance on Keypom to create drop. Use attached deposit instead.");
                    hasBalance = true;
                    _j.label = 16;
                case 16:
                    transactions = [];
                    transactions.push({
                        receiverId: receiverId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'add_keys',
                                    args: {
                                        drop_id: drop_id,
                                        public_keys: publicKeys,
                                        passwords_per_use: passwords
                                    },
                                    gas: gas,
                                    deposit: !hasBalance ? requiredDeposit : undefined,
                                }
                            }]
                    });
                    if (!(ftData === null || ftData === void 0 ? void 0 : ftData.contract_id)) return [3 /*break*/, 18];
                    _h = (_g = transactions).push;
                    return [4 /*yield*/, (0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contract_id,
                            absoluteAmount: new bn_js_1.default(ftData.balance_per_use).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(uses_per_key)).toString(),
                            dropId: drop_id,
                            returnTransaction: true
                        })];
                case 17:
                    _h.apply(_g, [_j.sent()]);
                    _j.label = 18;
                case 18:
                    tokenIds = nftTokenIds;
                    if (!(nftData && tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 20];
                    if (tokenIds.length > 2) {
                        throw new Error("You can only automatically register 2 NFTs with 'createDrop'. If you need to register more NFTs you can use the method 'nftTransferCall' after you create the drop.");
                    }
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: account,
                            contractId: nftData.contract_id,
                            tokenIds: tokenIds,
                            dropId: dropId.toString(),
                            returnTransactions: true
                        })];
                case 19:
                    nftTXs = _j.sent();
                    transactions = transactions.concat(nftTXs);
                    _j.label = 20;
                case 20:
                    if (returnTransactions) {
                        return [2 /*return*/, { keys: keys, dropId: drop_id, transactions: transactions, requiredDeposit: requiredDeposit }];
                    }
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 21:
                    responses = _j.sent();
                    return [2 /*return*/, { responses: responses, dropId: drop_id, keys: keys, requiredDeposit: requiredDeposit }];
            }
        });
    });
};
exports.addKeys = addKeys;
/**
 * Delete a set of keys from a drop and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @example
 * Create a drop with 5 keys and delete the first one:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Create the simple drop with 5 random keys
 * const {keys, dropId} = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * await deleteKeys({
 * 	dropId,
 * 	publicKeys: keys.publicKeys[0] // Can be wrapped in an array as well
 * })
 * ```
 * @group Deleting State
*/
var deleteKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, publicKeys = _a.publicKeys, dropId = _a.dropId, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, receiverId, execute, getAccount, networkId, contractId, _d, owner_id, drop_id, registered_uses, ft, nft, actions, transactions;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), receiverId = _c.receiverId, execute = _c.execute, getAccount = _c.getAccount, networkId = _c.networkId, contractId = _c.contractId;
                    (0, checks_1.assert)(keypom_1.supportedKeypomContracts[networkId][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract");
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 1:
                    _d = _e.sent(), owner_id = _d.owner_id, drop_id = _d.drop_id, registered_uses = _d.registered_uses, ft = _d.ft, nft = _d.nft;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 2:
                    account = _e.sent();
                    (0, checks_1.assert)(owner_id == account.accountId, 'Only the owner of the drop can delete keys.');
                    actions = [];
                    if ((ft || nft) && registered_uses > 0) {
                        actions.push({
                            type: 'FunctionCall',
                            params: {
                                methodName: 'refund_assets',
                                args: {
                                    drop_id: drop_id,
                                },
                                gas: '100000000000000',
                            }
                        });
                    }
                    // If the publicKeys provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
                    if (publicKeys && !Array.isArray(publicKeys)) {
                        publicKeys = [publicKeys];
                    }
                    actions.push({
                        type: 'FunctionCall',
                        params: {
                            methodName: 'delete_keys',
                            args: {
                                drop_id: drop_id,
                                // @ts-ignore - publicKeys is always an array here
                                public_keys: publicKeys.map(keypom_utils_1.key2str),
                            },
                            gas: '100000000000000',
                        }
                    });
                    if (withdrawBalance) {
                        actions.push({
                            type: 'FunctionCall',
                            params: {
                                methodName: 'withdraw_from_balance',
                                args: {},
                                gas: '100000000000000',
                            }
                        });
                    }
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
exports.deleteKeys = deleteKeys;
