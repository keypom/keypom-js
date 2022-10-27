"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDrops = exports.deleteKeys = exports.claim = exports.getDrops = exports.addKeys = exports.createDrop = exports.initKeypom = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, Account = nearAPI.Account, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, _a = nearAPI.utils.format, parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var near_seed_phrase_1 = require("near-seed-phrase");
var keypom_utils_1 = require("./keypom-utils");
var gas = '300000000000000';
var claimGas = '100000000000000';
var networks = {
    mainnet: {
        networkId: 'mainnet',
        viewAccountId: 'near',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
    },
    testnet: {
        networkId: 'testnet',
        viewAccountId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
    }
};
var contractId = 'v1.keypom.testnet';
var receiverId = contractId;
var near, connection, keyStore, logger, networkId, fundingAccount, contractAccount, viewAccount, fundingKey;
var execute = function (args) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, (0, keypom_utils_1.execute)(__assign(__assign({}, args), { fundingAccount: fundingAccount }))];
}); }); };
var initKeypom = function (_a) {
    var network = _a.network, funder = _a.funder;
    return __awaiter(void 0, void 0, void 0, function () {
        var networkConfig, accountId, secretKey, seedPhrase;
        return __generator(this, function (_b) {
            networkConfig = typeof network === 'string' ? networks[network] : network;
            keyStore = new BrowserLocalStorageKeyStore();
            near = new Near(__assign(__assign({}, networkConfig), { deps: { keyStore: keyStore } }));
            connection = near.connection;
            networkId = networkConfig.networkId;
            if (networkId === 'mainnet') {
                contractId = 'v1.keypom.near';
                receiverId = 'v1.keypom.near';
            }
            viewAccount = new Account(connection, networks[networkId].viewAccountId);
            viewAccount.viewFunction2 = function (_a) {
                var contractId = _a.contractId, methodName = _a.methodName, args = _a.args;
                return viewAccount.viewFunction(contractId, methodName, args);
            };
            contractAccount = new Account(connection, contractId);
            if (funder) {
                accountId = funder.accountId, secretKey = funder.secretKey, seedPhrase = funder.seedPhrase;
                if (seedPhrase) {
                    secretKey = (0, near_seed_phrase_1.parseSeedPhrase)(seedPhrase).secretKey;
                }
                fundingKey = KeyPair.fromString(secretKey);
                keyStore.setKey(networkId, accountId, fundingKey);
                fundingAccount = new Account(connection, accountId);
                fundingAccount.fundingKey = fundingKey;
                return [2 /*return*/, fundingAccount];
            }
            return [2 /*return*/, null];
        });
    });
};
exports.initKeypom = initKeypom;
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, accountRootKey = _a.accountRootKey, dropId = _a.dropId, publicKeys = _a.publicKeys, numKeys = _a.numKeys, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _b = _a.config, config = _b === void 0 ? {} : _b, ftData = _a.ftData, nftData = _a.nftData, fcData = _a.fcData;
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPairs, pubKeys, i, keyPair, finalConfig, requiredDeposit, transactions, responses;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    /// parse args
                    if (depositPerUseNEAR) {
                        depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0';
                    }
                    if (!depositPerUseYocto)
                        depositPerUseYocto = '0';
                    if (!dropId)
                        dropId = Date.now().toString();
                    keyPairs = [], pubKeys = publicKeys || [];
                    if (!numKeys) return [3 /*break*/, 4];
                    pubKeys = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < numKeys)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, keypom_utils_1.genKey)(fundingAccount ? fundingKey.secretKey : accountRootKey, dropId, i)];
                case 2:
                    keyPair = _c.sent();
                    keyPairs.push(keyPair);
                    pubKeys.push(keyPair.getPublicKey().toString());
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    finalConfig = {
                        uses_per_key: config.usesPerKey || 1,
                        delete_on_empty: config.usesPerKey || true,
                        auto_withdraw: config.usesPerKey || true,
                        start_timestamp: config.usesPerKey,
                        throttle_timestamp: config.usesPerKey,
                        on_claim_refund_deposit: config.usesPerKey,
                        claim_permission: config.usesPerKey,
                        drop_root: config.usesPerKey,
                    };
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: depositPerUseYocto,
                            numKeys: numKeys,
                            usesPerKey: finalConfig.uses_per_key,
                            attachedGas: '1',
                            storage: parseNearAmount('0.00866'),
                        })];
                case 5:
                    requiredDeposit = _c.sent();
                    transactions = [{
                            receiverId: receiverId,
                            actions: [{
                                    type: 'FunctionCall',
                                    params: {
                                        methodName: 'create_drop',
                                        args: {
                                            drop_id: dropId,
                                            public_keys: pubKeys,
                                            deposit_per_use: depositPerUseYocto,
                                            config: finalConfig,
                                            metadata: metadata,
                                            ftData: ftData,
                                            nftData: nftData,
                                            fcData: fcData,
                                        },
                                        gas: gas,
                                        deposit: requiredDeposit,
                                    }
                                }]
                        }];
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 6:
                    responses = _c.sent();
                    return [2 /*return*/, { responses: responses, keyPairs: keyPairs }];
            }
        });
    });
};
exports.createDrop = createDrop;
var addKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, publicKeys = _a.publicKeys;
    return __awaiter(void 0, void 0, void 0, function () {
        var requiredDeposit, transactions;
        return __generator(this, function (_b) {
            requiredDeposit = parseNearAmount((0.03 * publicKeys.length).toString());
            transactions = [{
                    receiverId: receiverId,
                    actions: [{
                            type: 'FunctionCall',
                            params: {
                                methodName: 'add_keys',
                                args: {
                                    drop_id: dropId,
                                    public_keys: publicKeys,
                                },
                                gas: gas,
                                deposit: requiredDeposit,
                            }
                        }]
                }];
            return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
        });
    });
};
exports.addKeys = addKeys;
var getDrops = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var drops;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fundingAccount)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, viewAccount.viewFunction2({
                            contractId: contractId,
                            methodName: 'get_drops_for_owner',
                            args: {
                                account_id: accountId,
                            },
                        })];
                case 1:
                    drops = _b.sent();
                    return [4 /*yield*/, Promise.all(drops.map(function (drop, i) { return __awaiter(void 0, void 0, void 0, function () {
                            var drop_id, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        drop_id = drop.drop_id;
                                        _a = drop;
                                        return [4 /*yield*/, viewAccount.viewFunction2({
                                                contractId: contractId,
                                                methodName: 'get_keys_for_drop',
                                                args: {
                                                    drop_id: drop_id
                                                }
                                            })];
                                    case 1:
                                        _a.keys = _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _b.sent();
                    return [2 /*return*/, drops];
            }
        });
    });
};
exports.getDrops = getDrops;
var claim = function (_a) {
    var secretKey = _a.secretKey, accountId = _a.accountId;
    var keyPair = KeyPair.fromString(secretKey);
    keyStore.setKey(networkId, contractId, keyPair);
    var transactions = [{
            receiverId: receiverId,
            actions: [{
                    type: 'FunctionCall',
                    params: {
                        methodName: 'claim',
                        args: {
                            account_id: accountId
                        },
                        gas: claimGas,
                    }
                }]
        }];
    return execute({ transactions: transactions, account: contractAccount });
};
exports.claim = claim;
var deleteKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, drop = _a.drop, keys = _a.keys;
    return __awaiter(void 0, void 0, void 0, function () {
        var drop_id, drop_type, actions, transactions;
        return __generator(this, function (_b) {
            drop_id = drop.drop_id, drop_type = drop.drop_type;
            actions = [];
            if (drop_type.FungibleToken || drop_type.NonFungibleToken) {
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
            actions.push({
                type: 'FunctionCall',
                params: {
                    methodName: 'delete_keys',
                    args: {
                        drop_id: drop_id,
                        public_keys: keys.map(keypom_utils_1.key2str),
                    },
                    gas: '100000000000000',
                }
            }, {
                type: 'FunctionCall',
                params: {
                    methodName: 'withdraw_from_balance',
                    args: {},
                    gas: '100000000000000',
                }
            });
            transactions = [{
                    receiverId: receiverId,
                    actions: actions,
                }];
            return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
        });
    });
};
exports.deleteKeys = deleteKeys;
var deleteDrops = function (_a) {
    var account = _a.account, wallet = _a.wallet, drops = _a.drops;
    return __awaiter(void 0, void 0, void 0, function () {
        var responses;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all(drops.map(function (_a) {
                        var drop_id = _a.drop_id, drop_type = _a.drop_type, keys = _a.keys;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var actions, transactions;
                            return __generator(this, function (_b) {
                                actions = [];
                                if (drop_type.FungibleToken || drop_type.NonFungibleToken) {
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
                                actions.push({
                                    type: 'FunctionCall',
                                    params: {
                                        methodName: 'delete_keys',
                                        args: {
                                            drop_id: drop_id,
                                            public_keys: keys.map(keypom_utils_1.key2str),
                                        },
                                        gas: '100000000000000',
                                    }
                                }, {
                                    type: 'FunctionCall',
                                    params: {
                                        methodName: 'withdraw_from_balance',
                                        args: {},
                                        gas: '100000000000000',
                                    }
                                });
                                transactions = [{
                                        receiverId: receiverId,
                                        actions: actions,
                                    }];
                                return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                            });
                        });
                    }))];
                case 1:
                    responses = _b.sent();
                    return [2 /*return*/, responses];
            }
        });
    });
};
exports.deleteDrops = deleteDrops;
