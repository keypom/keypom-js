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
exports.deleteKeys = exports.addKeys = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var nearAPI = __importStar(require("near-api-js"));
var parseNearAmount = nearAPI.utils.format.parseNearAmount;
var views_1 = require("./views");
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var checks_1 = require("./checks");
/**
 * Add keys to a specific drop
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify the drop ID for which you want to add keys to.
 * @param {any} drop (OPTIONAL) If the drop information from getDropInformation is already known to the client, it can be passed in instead of the drop ID to reduce computation.
 * @param {number} numKeys Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed into the function, the keys will be
 * deterministically generated using the drop ID, key nonces, and entropy. Otherwise, each key will be generated randomly.
 * @param {string[]=} publicKeys (OPTIONAL) Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter.
 * @param {string[]=} nftTokenIds (OPTIONAL) If the drop type is an NFT drop, the token IDs can be passed in so that the tokens are automatically sent to the Keypom contract rather
 * than having to do two separate transactions.
 * @param {string=} basePassword (OPTIONAL) For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in.
 * @param {number[]=} passwordProtectedUses (OPTIONAL) For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use.
 * @param {boolean=} useBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example <caption>Create a basic empty simple drop and add 10 keys. Each key is completely random.:</caption>
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
 * @example <caption>Init funder with root entropy, create empty drop and add generate deterministic keys. Compare with manually generated keys</caption>
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
 *
 * @example <caption>Create an empty drop and add manually created keys</caption>
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
*/
var addKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, drop = _a.drop, numKeys = _a.numKeys, publicKeys = _a.publicKeys, nftTokenIds = _a.nftTokenIds, rootEntropy = _a.rootEntropy, basePassword = _a.basePassword, passwordProtectedUses = _a.passwordProtectedUses, _b = _a.useBalance, useBalance = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, near, gas, contractId, receiverId, getAccount, execute, fundingAccountDetails, _d, drop_id, owner_id, registered_uses, required_gas, deposit_per_use, uses_per_key, _e, ftData, _f, nftData, fcData, next_key_id, _g, keys, rootEntropyUsed, nonceDropIdMeta, passwords, camelFTData, camelFCData, requiredDeposit, hasBalance, userBal, transactions, _h, _j, tokenIds, nftTXs, responses;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), near = _c.near, gas = _c.gas, contractId = _c.contractId, receiverId = _c.receiverId, getAccount = _c.getAccount, execute = _c.execute, fundingAccountDetails = _c.fundingAccountDetails;
                    (0, checks_1.assert)(near != undefined, 'Keypom SDK is not initialized. Please call `initKeypom`.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    account = getAccount({ account: account, wallet: wallet });
                    (0, checks_1.assert)(drop || dropId, 'Either a dropId or drop object must be passed in.');
                    (0, checks_1.assert)(numKeys || (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length), "Either pass in publicKeys or set numKeys to a positive non-zero value.");
                    (0, checks_1.assert)(receiverId == "v1-3.keypom.near" || receiverId == "v1-3.keypom.testnet", "Only the latest Keypom contract can be used to call this methods. Please update the contract to: v1-3.keypom.near or v1-3.keypom.testnet");
                    account = getAccount({ account: account, wallet: wallet });
                    _g = drop;
                    if (_g) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 1:
                    _g = (_k.sent());
                    _k.label = 2;
                case 2:
                    _d = _g, drop_id = _d.drop_id, owner_id = _d.owner_id, registered_uses = _d.registered_uses, required_gas = _d.required_gas, deposit_per_use = _d.deposit_per_use, uses_per_key = _d.config.uses_per_key, _e = _d.ft, ftData = _e === void 0 ? {} : _e, _f = _d.nft, nftData = _f === void 0 ? {} : _f, fcData = _d.fc, next_key_id = _d.next_key_id;
                    dropId = drop_id;
                    (0, checks_1.assert)(owner_id === account.accountId, 'You are not the owner of this drop. You cannot add keys to it.');
                    if (!!publicKeys) return [3 /*break*/, 7];
                    rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
                    if (!rootEntropyUsed) return [3 /*break*/, 4];
                    nonceDropIdMeta = Array.from({ length: numKeys }, function (_, i) { return "".concat(drop_id, "_").concat(next_key_id + i); });
                    return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                            numKeys: numKeys,
                            rootEntropy: rootEntropyUsed,
                            metaEntropy: nonceDropIdMeta
                        })];
                case 3:
                    keys = _k.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 5:
                    // No entropy is provided so all keys should be fully random
                    keys = _k.sent();
                    _k.label = 6;
                case 6:
                    publicKeys = keys.publicKeys;
                    _k.label = 7;
                case 7:
                    numKeys = publicKeys.length;
                    if (!basePassword) return [3 /*break*/, 9];
                    (0, checks_1.assert)(numKeys <= 50, "Cannot add 50 keys at once with passwords");
                    return [4 /*yield*/, (0, keypom_utils_1.generatePerUsePasswords)({
                            publicKeys: publicKeys,
                            basePassword: basePassword,
                            uses: passwordProtectedUses || Array.from({ length: uses_per_key }, function (_, i) { return i + 1; })
                        })];
                case 8:
                    // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
                    passwords = _k.sent();
                    _k.label = 9;
                case 9:
                    camelFTData = (0, keypom_utils_1.toCamel)(ftData);
                    camelFCData = (0, keypom_utils_1.toCamel)(fcData);
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: deposit_per_use,
                            numKeys: numKeys,
                            usesPerKey: uses_per_key,
                            attachedGas: required_gas,
                            storage: parseNearAmount('0.2'),
                            fcData: camelFCData,
                            ftData: camelFTData
                        })];
                case 10:
                    requiredDeposit = _k.sent();
                    hasBalance = false;
                    if (!useBalance) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, views_1.getUserBalance)({ accountId: account.accountId })];
                case 11:
                    userBal = _k.sent();
                    (0, checks_1.assert)(userBal >= requiredDeposit, "Insufficient balance on Keypom to create drop. Use attached deposit instead.");
                    hasBalance = true;
                    _k.label = 12;
                case 12:
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
                    if (!ftData.contract_id) return [3 /*break*/, 14];
                    _j = (_h = transactions).push;
                    return [4 /*yield*/, (0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contract_id,
                            absoluteAmount: new bn_js_1.default(ftData.balance_per_use).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(uses_per_key)).toString(),
                            dropId: drop_id,
                            returnTransaction: true
                        })];
                case 13:
                    _j.apply(_h, [_k.sent()]);
                    _k.label = 14;
                case 14:
                    tokenIds = nftTokenIds;
                    if (!(tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 16];
                    if (tokenIds.length > 2) {
                        throw new Error("You can only automatically register 2 NFTs with 'createDrop'. If you need to register more NFTs you can use the method 'nftTransferCall' after you create the drop.");
                    }
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: account,
                            contractId: nftData.contractId,
                            tokenIds: tokenIds,
                            dropId: dropId.toString(),
                            returnTransactions: true
                        })];
                case 15:
                    nftTXs = _k.sent();
                    transactions = transactions.concat(nftTXs);
                    _k.label = 16;
                case 16: return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 17:
                    responses = _k.sent();
                    return [2 /*return*/, { responses: responses, dropId: drop_id, keys: keys }];
            }
        });
    });
};
exports.addKeys = addKeys;
/**
 * Delete a set of keys from a drop and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string[] | string} publicKeys Specify a set of public keys to delete. If deleting a single publicKey, the string can be passed in without wrapping it in an array.
 * @param {string} dropId Which drop ID do the keys belong to?
 * @param {boolean=} withdrawBalance (OPTIONAL) Whether or not to withdraw any remaining balance on the Keypom contract.
 *
 * @example <caption>Create a drop with 5 keys and delete the first one</caption>
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
```
*/
var deleteKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, publicKeys = _a.publicKeys, dropId = _a.dropId, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, receiverId, execute, getAccount, _d, owner_id, drop_id, registered_uses, ft, nft, actions, transactions;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), receiverId = _c.receiverId, execute = _c.execute, getAccount = _c.getAccount;
                    (0, checks_1.assert)(receiverId == "v1-3.keypom.near" || receiverId == "v1-3.keypom.testnet", "Only the latest Keypom contract can be used to call this methods. Please update the contract to: v1-3.keypom.near or v1-3.keypom.testnet");
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 1:
                    _d = _e.sent(), owner_id = _d.owner_id, drop_id = _d.drop_id, registered_uses = _d.registered_uses, ft = _d.ft, nft = _d.nft;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    account = getAccount({ account: account, wallet: wallet });
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
