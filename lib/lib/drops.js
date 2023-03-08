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
exports.deleteDrops = exports.createDrop = exports.KEY_LIMIT = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var nearAPI = __importStar(require("near-api-js"));
var _a = nearAPI.utils.format, parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var views_1 = require("./views");
exports.KEY_LIMIT = 50;
/**
 * Creates a new drop based on parameters passed in. This drop can have keys that are manually generated and passed in, or automatically generated. If they're
 * automatically generated, they can be based off a set of entropy. For NFT and FT drops, assets can automatically be sent to Keypom to register keys as part of the payload.
 * The deposit is estimated based on parameters that are passed in and the transaction can be returned instead of signed and sent to the network. This can allow you to get the
 * required deposit from the return value and use that to fund the account's Keypom balance to avoid multiple transactions being signed in the case of a drop with many keys.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Create a basic simple drop containing 10 keys each with 1 $NEAR. Each key is completely random:
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
 * // Create a drop with 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await createDrop({
 * 	numKeys: 10,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ```
 *
 * @example
 * Init funder with root entropy and generate deterministic keys for a drop. Compare with manually generated keys:
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
 * // Create a simple drop with 5 keys. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const { keys: keysFromDrop, dropId } = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 *
 * // Get the public and private keys from the keys generated by the drop
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
 * Use manually generated keys to create a drop:
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
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 * // Create a drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 * ```
 *
 * @example
 * Create a simple drop with 1 key and 1 use per key. This 1 use-key should be password protected based on a base-password:
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
 *
 * const basePassword = "my-cool-password123";
 * // Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
 * const {keys} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 1,
 * 	basePassword
 * });
 *
 * // Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());
 * ```
 * @group Creating, And Claiming Drops
*/
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, _b = _a.numKeys, numKeys = _b === void 0 ? 0 : _b, publicKeys = _a.publicKeys, rootEntropy = _a.rootEntropy, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _c = _a.config, config = _c === void 0 ? {} : _c, ftData = _a.ftData, nftData = _a.nftData, _d = _a.simpleData, simpleData = _d === void 0 ? {} : _d, fcData = _a.fcData, basePassword = _a.basePassword, passwordProtectedUses = _a.passwordProtectedUses, _e = _a.useBalance, useBalance = _e === void 0 ? false : _e, _f = _a.returnTransactions, returnTransactions = _f === void 0 ? false : _f, successUrl = _a.successUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var _g, near, viewCall, networkId, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccountDetails, finalConfig, keys, rootEntropyUsed, nonceDropIdMeta, passwords, ftBalancePerUse, metadata_1, createDropArgs, storageCalculated, requiredDeposit, hasBalance, userBal, deposit, transactions, _h, _j, tokenIds, nftTXs, responses;
        var _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
        return __generator(this, function (_7) {
            switch (_7.label) {
                case 0:
                    _g = (0, keypom_1.getEnv)(), near = _g.near, viewCall = _g.viewCall, networkId = _g.networkId, gas = _g.gas, attachedGas = _g.attachedGas, contractId = _g.contractId, receiverId = _g.receiverId, getAccount = _g.getAccount, execute = _g.execute, fundingAccountDetails = _g.fundingAccountDetails;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _7.sent();
                    (0, checks_1.assert)(keypom_1.supportedKeypomContracts[networkId][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract.");
                    /// parse args
                    if (depositPerUseNEAR) {
                        depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0';
                    }
                    if (!depositPerUseYocto)
                        depositPerUseYocto = '0';
                    // Ensure that if the dropID is passed in, it's greater than 1 billion
                    (0, checks_1.assert)(parseInt(dropId || "1000000000") >= 1000000000, 'All custom drop IDs must be greater than 1_000_000_000');
                    if (!dropId)
                        dropId = Date.now().toString();
                    return [4 /*yield*/, (0, checks_1.assertDropIdUnique)(dropId)];
                case 2:
                    _7.sent();
                    finalConfig = {
                        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
                        time: config === null || config === void 0 ? void 0 : config.time,
                        usage: {
                            auto_delete_drop: ((_k = config === null || config === void 0 ? void 0 : config.usage) === null || _k === void 0 ? void 0 : _k.autoDeleteDrop) || false,
                            auto_withdraw: ((_l = config === null || config === void 0 ? void 0 : config.usage) === null || _l === void 0 ? void 0 : _l.autoWithdraw) || true,
                            permissions: (_m = config === null || config === void 0 ? void 0 : config.usage) === null || _m === void 0 ? void 0 : _m.permissions,
                            refund_deposit: (_o = config === null || config === void 0 ? void 0 : config.usage) === null || _o === void 0 ? void 0 : _o.refundDeposit,
                            account_creation_fields: {
                                drop_id_field: (_q = (_p = config === null || config === void 0 ? void 0 : config.usage) === null || _p === void 0 ? void 0 : _p.accountCreationFields) === null || _q === void 0 ? void 0 : _q.dropIdField,
                                funder_id_field: (_s = (_r = config === null || config === void 0 ? void 0 : config.usage) === null || _r === void 0 ? void 0 : _r.accountCreationFields) === null || _s === void 0 ? void 0 : _s.funderIdField,
                                account_id_field: (_u = (_t = config === null || config === void 0 ? void 0 : config.usage) === null || _t === void 0 ? void 0 : _t.accountCreationFields) === null || _u === void 0 ? void 0 : _u.accountIdField,
                                key_id_field: (_w = (_v = config === null || config === void 0 ? void 0 : config.usage) === null || _v === void 0 ? void 0 : _v.accountCreationFields) === null || _w === void 0 ? void 0 : _w.keyIdField
                            }
                        },
                        sale: (config === null || config === void 0 ? void 0 : config.sale) ? {
                            max_num_keys: (_x = config === null || config === void 0 ? void 0 : config.sale) === null || _x === void 0 ? void 0 : _x.maxNumKeys,
                            price_per_key: ((_y = config === null || config === void 0 ? void 0 : config.sale) === null || _y === void 0 ? void 0 : _y.pricePerKeyYocto) || ((_z = config === null || config === void 0 ? void 0 : config.sale) === null || _z === void 0 ? void 0 : _z.pricePerKeyNEAR) ? parseNearAmount((_1 = (_0 = config === null || config === void 0 ? void 0 : config.sale) === null || _0 === void 0 ? void 0 : _0.pricePerKeyNEAR) === null || _1 === void 0 ? void 0 : _1.toString()) : undefined,
                            allowlist: (_2 = config === null || config === void 0 ? void 0 : config.sale) === null || _2 === void 0 ? void 0 : _2.allowlist,
                            blocklist: (_3 = config === null || config === void 0 ? void 0 : config.sale) === null || _3 === void 0 ? void 0 : _3.blocklist,
                            auto_withdraw_funds: (_4 = config === null || config === void 0 ? void 0 : config.sale) === null || _4 === void 0 ? void 0 : _4.autoWithdrawFunds,
                            start: (_5 = config === null || config === void 0 ? void 0 : config.sale) === null || _5 === void 0 ? void 0 : _5.start,
                            end: (_6 = config === null || config === void 0 ? void 0 : config.sale) === null || _6 === void 0 ? void 0 : _6.end
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
                    keys = _7.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 5:
                    // No entropy is provided so all keys should be fully random
                    keys = _7.sent();
                    _7.label = 6;
                case 6:
                    publicKeys = keys.publicKeys;
                    _7.label = 7;
                case 7:
                    numKeys = publicKeys.length;
                    if (!basePassword) return [3 /*break*/, 9];
                    (0, checks_1.assert)(numKeys <= 50, "Cannot add 50 keys at once with passwords");
                    return [4 /*yield*/, (0, keypom_utils_1.generatePerUsePasswords)({
                            publicKeys: publicKeys,
                            basePassword: basePassword,
                            uses: passwordProtectedUses || Array.from({ length: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1 }, function (_, i) { return i + 1; })
                        })];
                case 8:
                    // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
                    passwords = _7.sent();
                    _7.label = 9;
                case 9:
                    if (ftData) {
                        ftBalancePerUse = (ftData === null || ftData === void 0 ? void 0 : ftData.absoluteAmount) || "0";
                        if (ftData.amount) {
                            metadata_1 = viewCall({
                                contractId: ftData.contractId,
                                methodName: 'ft_metadata',
                            });
                            ftBalancePerUse = (0, keypom_utils_1.parseFTAmount)(ftData.amount.toString(), metadata_1.decimals);
                        }
                    }
                    (0, checks_1.assertValidFCData)(fcData, depositPerUseYocto, finalConfig.uses_per_key || 1);
                    createDropArgs = {
                        drop_id: dropId,
                        public_keys: publicKeys || [],
                        deposit_per_use: depositPerUseYocto,
                        config: finalConfig,
                        metadata: metadata,
                        ft: (ftData === null || ftData === void 0 ? void 0 : ftData.contractId) ? ({
                            contract_id: ftData.contractId,
                            sender_id: ftData.senderId,
                            balance_per_use: ftBalancePerUse,
                        }) : undefined,
                        nft: (nftData === null || nftData === void 0 ? void 0 : nftData.contractId) ? ({
                            contract_id: nftData.contractId,
                            sender_id: nftData.senderId,
                        }) : undefined,
                        fc: (fcData === null || fcData === void 0 ? void 0 : fcData.methods) ? ({
                            methods: fcData.methods.map(function (useMethods) {
                                return useMethods ?
                                    useMethods.map(function (method) {
                                        var ret = {
                                            receiver_id: method.receiverId,
                                            method_name: method.methodName,
                                            args: method.args,
                                            attached_deposit: method.attachedDeposit,
                                            attached_gas: method.attachedGas,
                                            account_id_field: method.accountIdField,
                                            drop_id_field: method.dropIdField,
                                            key_id_field: method.keyIdField,
                                            funder_id_field: method.funderIdField,
                                            receiver_to_claimer: method.receiverToClaimer,
                                            user_args_rule: method.userArgsRule
                                        };
                                        return ret;
                                    }) : undefined;
                            })
                        }) : undefined,
                        simple: (simpleData === null || simpleData === void 0 ? void 0 : simpleData.lazyRegister) ? ({
                            lazy_register: simpleData.lazyRegister,
                        }) : undefined,
                        passwords_per_use: passwords
                    };
                    // If there is no ft data, nft data, or fc data, ensure the deposit per use is greater than 0
                    if (createDropArgs.fc === undefined && createDropArgs.ft === undefined && createDropArgs.nft === undefined) {
                        (0, checks_1.assert)(depositPerUseYocto != "0", "Deposit per use must be greater than 0 for simple drops");
                    }
                    storageCalculated = (0, keypom_utils_1.getStorageBase)(createDropArgs);
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: depositPerUseYocto,
                            numKeys: numKeys,
                            usesPerKey: finalConfig.uses_per_key || 1,
                            attachedGas: parseInt(attachedGas),
                            storage: storageCalculated,
                            ftData: ftData,
                            fcData: fcData,
                        })];
                case 10:
                    requiredDeposit = _7.sent();
                    hasBalance = false;
                    if (!useBalance) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, views_1.getUserBalance)({ accountId: account.accountId })];
                case 11:
                    userBal = _7.sent();
                    if (userBal < requiredDeposit) {
                        throw new Error("Insufficient balance on Keypom to create drop. Use attached deposit instead.");
                    }
                    hasBalance = true;
                    _7.label = 12;
                case 12:
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
                    if (!((ftData === null || ftData === void 0 ? void 0 : ftData.contractId) && (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length))) return [3 /*break*/, 14];
                    _j = (_h = transactions).push;
                    return [4 /*yield*/, (0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contractId,
                            absoluteAmount: new bn_js_1.default(ftBalancePerUse).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(finalConfig.uses_per_key)).toString(),
                            dropId: dropId,
                            returnTransaction: true
                        })];
                case 13:
                    _j.apply(_h, [_7.sent()]);
                    _7.label = 14;
                case 14:
                    tokenIds = nftData === null || nftData === void 0 ? void 0 : nftData.tokenIds;
                    if (!(nftData && tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 16];
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
                    nftTXs = _7.sent();
                    transactions = transactions.concat(nftTXs);
                    _7.label = 16;
                case 16:
                    if (returnTransactions) {
                        return [2 /*return*/, { keys: keys, dropId: dropId, transactions: transactions, requiredDeposit: requiredDeposit }];
                    }
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet, successUrl: successUrl })];
                case 17:
                    responses = _7.sent();
                    return [2 /*return*/, { responses: responses, keys: keys, dropId: dropId, requiredDeposit: requiredDeposit }];
            }
        });
    });
};
exports.createDrop = createDrop;
/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @example
 * Create 5 drops and delete each of them:
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
 * // loop to create 5 simple drops each with 5 more keys than the next
 * for(var i = 0; i < 5; i++) {
 * 	// create 10 keys with no entropy (all random)
 * 	const {publicKeys} = await generateKeys({
 * 		numKeys: 5 * (i+1) // First drop will have 5, then 10, then 15 etc..
 * 	});
 *
 * 	// Create the simple
 * 	await createDrop({
 * 		publicKeys,
 * 		depositPerUseNEAR: 1,
 * 	});
 * }
 *
 * let drops = await getDrops({accountId: "benji_demo.testnet"});
 * console.log('drops: ', drops)
 *
 * await deleteDrops({
 * 	drops
 * })
 *
 * 	// Get the number of drops the account has after deletion (should be zero)
 * 	const numDrops = await getDropSupply({
 * 		accountId: "benjiman.testnet"
 * });
 * console.log('numDrops: ', numDrops)
 * ```
 * @group Deleting State
*/
var deleteDrops = function (_a) {
    var account = _a.account, wallet = _a.wallet, drops = _a.drops, dropIds = _a.dropIds, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? true : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, gas300, receiverId, execute, getAccount, networkId, contractId, _d, _e, responses;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), gas300 = _c.gas300, receiverId = _c.receiverId, execute = _c.execute, getAccount = _c.getAccount, networkId = _c.networkId, contractId = _c.contractId;
                    (0, checks_1.assert)(keypom_1.supportedKeypomContracts[networkId][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract.");
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _f.sent();
                    if (!!drops) return [3 /*break*/, 4];
                    if (!dropIds) {
                        throw new Error('Must pass in either drops or dropIds');
                    }
                    ;
                    // For each drop ID in drop IDs, get the drop information	
                    drops = [];
                    _e = (_d = Promise).all;
                    return [4 /*yield*/, (dropIds.map(function (dropId) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!(drops === null || drops === void 0)) return [3 /*break*/, 1];
                                        _a = void 0;
                                        return [3 /*break*/, 3];
                                    case 1:
                                        _c = (_b = drops).push;
                                        return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                                    case 2:
                                        _a = _c.apply(_b, [_d.sent()]);
                                        _d.label = 3;
                                    case 3:
                                        _a;
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2: return [4 /*yield*/, _e.apply(_d, [_f.sent()])];
                case 3:
                    _f.sent();
                    _f.label = 4;
                case 4: return [4 /*yield*/, Promise.all(drops.map(function (_a) {
                        var owner_id = _a.owner_id, drop_id = _a.drop_id, registered_uses = _a.registered_uses, ft = _a.ft, nft = _a.nft;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var keySupply, keys, updateKeys, responses, _b, _c, _d, deleteKeys, _e, _f, _g;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        (0, checks_1.assert)(owner_id == account.accountId, 'Only the owner of the drop can delete drops.');
                                        updateKeys = function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var keyPromises;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        keyPromises = [
                                                            (function () { return __awaiter(void 0, void 0, void 0, function () {
                                                                return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0: return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                                                                                methodName: 'get_key_supply_for_drop',
                                                                                args: {
                                                                                    drop_id: drop_id.toString(),
                                                                                }
                                                                            })];
                                                                        case 1:
                                                                            keySupply = _a.sent();
                                                                            return [2 /*return*/];
                                                                    }
                                                                });
                                                            }); })()
                                                        ];
                                                        keyPromises.push((function () { return __awaiter(void 0, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                                                                            methodName: 'get_keys_for_drop',
                                                                            args: {
                                                                                drop_id: drop_id.toString(),
                                                                                from_index: '0',
                                                                                limit: exports.KEY_LIMIT,
                                                                            }
                                                                        })];
                                                                    case 1:
                                                                        keys = _a.sent();
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); })());
                                                        return [4 /*yield*/, Promise.all(keyPromises)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        return [4 /*yield*/, updateKeys()];
                                    case 1:
                                        _h.sent();
                                        responses = [];
                                        if (!(registered_uses !== 0 && (ft !== undefined || nft !== undefined))) return [3 /*break*/, 3];
                                        _c = (_b = responses.push).apply;
                                        _d = [responses];
                                        return [4 /*yield*/, execute({
                                                account: account,
                                                wallet: wallet,
                                                transactions: [{
                                                        receiverId: receiverId,
                                                        actions: [{
                                                                type: 'FunctionCall',
                                                                params: {
                                                                    methodName: 'refund_assets',
                                                                    args: {
                                                                        drop_id: drop_id,
                                                                    },
                                                                    gas: gas300,
                                                                }
                                                            }],
                                                    }]
                                            })];
                                    case 2:
                                        _c.apply(_b, _d.concat([(_h.sent())]));
                                        _h.label = 3;
                                    case 3:
                                        deleteKeys = function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var _a, _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        _b = (_a = responses.push).apply;
                                                        _c = [responses];
                                                        return [4 /*yield*/, execute({
                                                                account: account,
                                                                wallet: wallet,
                                                                transactions: [{
                                                                        receiverId: receiverId,
                                                                        actions: [{
                                                                                type: 'FunctionCall',
                                                                                params: {
                                                                                    methodName: 'delete_keys',
                                                                                    args: {
                                                                                        drop_id: drop_id,
                                                                                        public_keys: keys.map(keypom_utils_1.key2str),
                                                                                    },
                                                                                    gas: gas300,
                                                                                }
                                                                            }],
                                                                    }]
                                                            })];
                                                    case 1:
                                                        _b.apply(_a, _c.concat([(_d.sent())]));
                                                        if (!(keySupply > ((keys === null || keys === void 0 ? void 0 : keys.length) || 0))) return [3 /*break*/, 4];
                                                        return [4 /*yield*/, updateKeys()];
                                                    case 2:
                                                        _d.sent();
                                                        return [4 /*yield*/, deleteKeys()];
                                                    case 3:
                                                        _d.sent();
                                                        _d.label = 4;
                                                    case 4: return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        return [4 /*yield*/, deleteKeys()];
                                    case 4:
                                        _h.sent();
                                        if (!withdrawBalance) return [3 /*break*/, 6];
                                        _f = (_e = responses.push).apply;
                                        _g = [responses];
                                        return [4 /*yield*/, execute({
                                                account: account,
                                                wallet: wallet,
                                                transactions: [{
                                                        receiverId: receiverId,
                                                        actions: [{
                                                                type: 'FunctionCall',
                                                                params: {
                                                                    methodName: 'withdraw_from_balance',
                                                                    args: {},
                                                                    gas: '50000000000000',
                                                                }
                                                            }],
                                                    }]
                                            })];
                                    case 5:
                                        _f.apply(_e, _g.concat([(_h.sent())]));
                                        _h.label = 6;
                                    case 6: return [2 /*return*/, responses];
                                }
                            });
                        });
                    }))];
                case 5:
                    responses = _f.sent();
                    return [2 /*return*/, responses];
            }
        });
    });
};
exports.deleteDrops = deleteDrops;
// This should be done later. Very small number of drops will have lazy registrations enabled.
// /**
//  * Allows a user to register uses for a simple drop that has lazy registrations enabled. This drop can be over-registered.
//  * 
//  * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
//  * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
//  * @param {string[]=} dropId Specify the drop ID of the drop you want to register uses on
//  * 
//  * @example <caption>Create 5 drops and delete each of them</caption>
//  * ```js
//  * ```
// */
// export const registerUses = async ({
// 	account,
// 	wallet,
// 	dropId,
// 	numUses,
// 	useBalance = false,
// }: RegisterUsesParams) => {
// 	const {
// 		gas300, receiverId, execute, getAccount
// 	} = getEnv()
// 	account = await getAccount({ account, wallet });
// }
