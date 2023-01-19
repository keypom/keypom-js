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
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var views_1 = require("./views");
var checks_1 = require("./checks");
exports.KEY_LIMIT = 50;
/**
 * Creates a new drop based on parameters passed in.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify a custom drop ID rather than using the incrementing nonce on the contract.
 * @param {number} numKeys Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed into the function, the keys will be
 * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
 * @param {string[]=} publicKeys (OPTIONAL) Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter.
 * @param {string=} rootEntropy (OPTIONAL) Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in.
 * @param {Number=} depositPerUseNEAR (OPTIONAL) How much $NEAR should be contained in each link. Unit in $NEAR (i.e 1 = 1 $NEAR)
 * @param {string=} depositPerUseYocto (OPTIONAL) How much $yoctoNEAR should be contained in each link. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR)
 * @param {string=} metadata (OPTIONAL) String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON.
 * @param {DropConfig=} config (OPTIONAL) Allows specific drop behaviors to be configured such as the number of uses each key / link will have.
 * @param {FTData=} ftData (OPTIONAL) For creating a fungible token drop, this contains necessary configurable information about the drop.
 * @param {NFTData=} nftData (OPTIONAL) For creating a non-fungible token drop, this contains necessary configurable information about the drop.
 * @param {FCData=} fcData (OPTIONAL) For creating a function call drop, this contains necessary configurable information about the drop.
 * @param {SimpleData=} simpleData (OPTIONAL) For creating a simple drop, this contains necessary configurable information about the drop.
 * @param {string=} basePassword (OPTIONAL) For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in.
 * @param {number[]=} passwordProtectedUses (OPTIONAL) For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use.
 * @param {boolean=} useBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example <caption>Create a basic simple drop containing 10 keys each with 1 $NEAR. Each key is completely random.:</caption>
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
 * @example <caption>Init funder with root entropy and generate deterministic keys for a drop. Compare with manually generated keys</caption>
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
 *
 * @example <caption>Use manually generated keys to create a drop</caption>
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
 *
 * @example <caption>Create a simple drop with 1 key and 1 use per key. This 1 use-key should be password protected based on a base-password</caption>
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
*/
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, _b = _a.numKeys, numKeys = _b === void 0 ? 0 : _b, publicKeys = _a.publicKeys, rootEntropy = _a.rootEntropy, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _c = _a.config, config = _c === void 0 ? {} : _c, _d = _a.ftData, ftData = _d === void 0 ? {} : _d, _e = _a.nftData, nftData = _e === void 0 ? {} : _e, _f = _a.simpleData, simpleData = _f === void 0 ? {} : _f, fcData = _a.fcData, basePassword = _a.basePassword, passwordProtectedUses = _a.passwordProtectedUses, _g = _a.useBalance, useBalance = _g === void 0 ? false : _g;
    return __awaiter(void 0, void 0, void 0, function () {
        var _h, near, viewAccount, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccount, fundingAccountDetails, finalConfig, keys, rootEntropyUsed, nonceDropIdMeta, passwords, ftBalancePerUse, metadata_1, createDropArgs, storageCalculated, requiredDeposit, hasBalance, userBal, deposit, transactions, _j, _k, tokenIds, nftTXs, responses;
        var _l, _m, _o, _p;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    _h = (0, keypom_1.getEnv)(), near = _h.near, viewAccount = _h.viewAccount, gas = _h.gas, attachedGas = _h.attachedGas, contractId = _h.contractId, receiverId = _h.receiverId, getAccount = _h.getAccount, execute = _h.execute, fundingAccount = _h.fundingAccount, fundingAccountDetails = _h.fundingAccountDetails;
                    (0, checks_1.assert)(near != undefined, 'Keypom SDK is not initialized. Please call `initKeypom`.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    account = getAccount({ account: account, wallet: wallet });
                    (0, checks_1.assert)(contractId == "v1-3.keypom.near" || contractId == "v1-3.keypom.testnet", "Only the latest Keypom contract can be used to call this methods. Please update the contract to: v1-3.keypom.near or v1-3.keypom.testnet");
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
                case 1:
                    _q.sent();
                    finalConfig = {
                        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
                        root_account_id: config === null || config === void 0 ? void 0 : config.dropRoot,
                        usage: {
                            auto_delete_drop: ((_l = config === null || config === void 0 ? void 0 : config.usage) === null || _l === void 0 ? void 0 : _l.autoDeleteDrop) || false,
                            auto_withdraw: ((_m = config === null || config === void 0 ? void 0 : config.usage) === null || _m === void 0 ? void 0 : _m.autoWithdraw) || true,
                            permissions: (_o = config === null || config === void 0 ? void 0 : config.usage) === null || _o === void 0 ? void 0 : _o.permissions,
                            refund_deposit: (_p = config === null || config === void 0 ? void 0 : config.usage) === null || _p === void 0 ? void 0 : _p.refundDeposit,
                        },
                        time: config === null || config === void 0 ? void 0 : config.time,
                    };
                    (0, checks_1.assertValidDropConfig)(finalConfig);
                    if (!!publicKeys) return [3 /*break*/, 6];
                    rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
                    if (!rootEntropyUsed) return [3 /*break*/, 3];
                    nonceDropIdMeta = Array.from({ length: numKeys }, function (_, i) { return "".concat(dropId, "_").concat(i); });
                    return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                            numKeys: numKeys,
                            rootEntropy: rootEntropyUsed,
                            metaEntropy: nonceDropIdMeta
                        })];
                case 2:
                    keys = _q.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 4:
                    // No entropy is provided so all keys should be fully random
                    keys = _q.sent();
                    _q.label = 5;
                case 5:
                    publicKeys = keys.publicKeys;
                    _q.label = 6;
                case 6:
                    numKeys = publicKeys.length;
                    if (!basePassword) return [3 /*break*/, 8];
                    (0, checks_1.assert)(numKeys <= 50, "Cannot add 50 keys at once with passwords");
                    return [4 /*yield*/, (0, keypom_utils_1.generatePerUsePasswords)({
                            publicKeys: publicKeys,
                            basePassword: basePassword,
                            uses: passwordProtectedUses || Array.from({ length: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1 }, function (_, i) { return i + 1; })
                        })];
                case 7:
                    // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
                    passwords = _q.sent();
                    _q.label = 8;
                case 8:
                    if (!ftData) return [3 /*break*/, 10];
                    ftBalancePerUse = (ftData === null || ftData === void 0 ? void 0 : ftData.absoluteAmount) || "0";
                    if (!ftData.amount) return [3 /*break*/, 10];
                    return [4 /*yield*/, viewAccount.viewFunction2({
                            contractId: ftData.contractId,
                            methodName: 'ft_metadata',
                        })];
                case 9:
                    metadata_1 = _q.sent();
                    ftBalancePerUse = (0, keypom_utils_1.parseFTAmount)(ftData.amount, metadata_1.decimals);
                    _q.label = 10;
                case 10:
                    (0, checks_1.assertValidFCData)(fcData, depositPerUseYocto, finalConfig.uses_per_key);
                    createDropArgs = {
                        drop_id: dropId,
                        public_keys: publicKeys || [],
                        deposit_per_use: depositPerUseYocto,
                        config: finalConfig,
                        metadata: metadata,
                        ft: ftData.contractId ? ({
                            contract_id: ftData.contractId,
                            sender_id: ftData.senderId,
                            balance_per_use: ftBalancePerUse,
                        }) : undefined,
                        nft: nftData.contractId ? ({
                            contract_id: nftData.contractId,
                            sender_id: nftData.senderId,
                        }) : undefined,
                        fc: (fcData === null || fcData === void 0 ? void 0 : fcData.methods) ? ({
                            methods: fcData.methods.map(function (useMethods) {
                                return useMethods ?
                                    useMethods.map(function (method) {
                                        var ret = {};
                                        ret.receiver_id = method.receiverId;
                                        ret.method_name = method.methodName;
                                        ret.args = method.args;
                                        ret.attached_deposit = method.attachedDeposit;
                                        ret.account_id_field = method.accountIdField;
                                        ret.drop_id_field = method.dropIdField;
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
                            usesPerKey: finalConfig.uses_per_key,
                            attachedGas: parseInt(attachedGas),
                            storage: storageCalculated,
                            ftData: ftData,
                            fcData: fcData,
                        })];
                case 11:
                    requiredDeposit = _q.sent();
                    hasBalance = false;
                    if (!useBalance) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, views_1.getUserBalance)({ accountId: account.accountId })];
                case 12:
                    userBal = _q.sent();
                    if (userBal < requiredDeposit) {
                        throw new Error("Insufficient balance on Keypom to create drop. Use attached deposit instead.");
                    }
                    hasBalance = true;
                    _q.label = 13;
                case 13:
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
                    if (!((ftData === null || ftData === void 0 ? void 0 : ftData.contractId) && (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length))) return [3 /*break*/, 15];
                    _k = (_j = transactions).push;
                    return [4 /*yield*/, (0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contractId,
                            absoluteAmount: new bn_js_1.default(ftBalancePerUse).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(finalConfig.uses_per_key)).toString(),
                            dropId: dropId,
                            returnTransaction: true
                        })];
                case 14:
                    _k.apply(_j, [_q.sent()]);
                    _q.label = 15;
                case 15:
                    tokenIds = nftData === null || nftData === void 0 ? void 0 : nftData.tokenIds;
                    if (!(tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 17];
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
                case 16:
                    nftTXs = _q.sent();
                    transactions = transactions.concat(nftTXs);
                    _q.label = 17;
                case 17: return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 18:
                    responses = _q.sent();
                    return [2 /*return*/, { responses: responses, keys: keys, dropId: dropId }];
            }
        });
    });
};
exports.createDrop = createDrop;
/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string[]=} dropIds (OPTIONAL) Specify a set of drop IDs to delete.
 * @param {any} drops (OPTIONAL) If the set of drop information for the drops you want to delete (from getDropInformation) is already known to the client, it can be passed in instead of the drop IDs to reduce computation.
 * @param {boolean=} withdrawBalance (OPTIONAL) Whether or not to withdraw any remaining balance on the Keypom contract.
 *
 * @example <caption>Create 5 drops and delete each of them</caption>
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
*/
var deleteDrops = function (_a) {
    var account = _a.account, wallet = _a.wallet, drops = _a.drops, dropIds = _a.dropIds, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? true : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, gas300, receiverId, execute, getAccount, responses;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), gas300 = _c.gas300, receiverId = _c.receiverId, execute = _c.execute, getAccount = _c.getAccount;
                    (0, checks_1.assert)(receiverId == "v1-3.keypom.near" || receiverId == "v1-3.keypom.testnet", "Only the latest Keypom contract can be used to call this methods. Please update the contract to: v1-3.keypom.near or v1-3.keypom.testnet");
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    account = getAccount({ account: account, wallet: wallet });
                    if (!!drops) return [3 /*break*/, 2];
                    if (!dropIds) {
                        throw new Error('Must pass in either drops or dropIds');
                    }
                    ;
                    return [4 /*yield*/, Promise.all(dropIds.map(function (dropId) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                (0, views_1.getDropInformation)({ dropId: dropId });
                                return [2 /*return*/];
                            });
                        }); }))];
                case 1:
                    // For each drop ID in drop IDs, get the drop information
                    drops = _d.sent();
                    _d.label = 2;
                case 2: return [4 /*yield*/, Promise.all(drops.map(function (_a) {
                        var owner_id = _a.owner_id, drop_id = _a.drop_id, keys = _a.keys, registered_uses = _a.registered_uses, ft = _a.ft, nft = _a.nft;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var keySupply, updateKeys, responses, _b, _c, _d, deleteKeys, _e, _f, _g;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        (0, checks_1.assert)(owner_id == account.accountId, 'Only the owner of the drop can delete drops.');
                                        keySupply = (keys === null || keys === void 0 ? void 0 : keys.length) || 0;
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
                                                        if (!keys) {
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
                                                        }
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
                                                        if (!(keySupply > keys.length)) return [3 /*break*/, 4];
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
                case 3:
                    responses = _d.sent();
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
// 	account = getAccount({ account, wallet });
// }
