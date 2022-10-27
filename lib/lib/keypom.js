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
exports.deleteDrops = exports.deleteKeys = exports.getDrops = exports.addKeys = exports.createDrop = exports.initKeypom = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, Account = nearAPI.Account, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, utils = nearAPI.utils, nearTransactions = nearAPI.transactions, _a = nearAPI.utils, PublicKey = _a.PublicKey, _b = _a.format, parseNearAmount = _b.parseNearAmount, formatNearAmount = _b.formatNearAmount;
var near_seed_phrase_1 = require("near-seed-phrase");
var bn_js_1 = require("bn.js");
var gas = '300000000000000';
var keypom_utils_1 = require("./keypom-utils");
var networks = {
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
    },
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
    }
};
var contractId = 'v1.keypom.testnet';
var receiverId = 'v1.keypom.testnet';
var signAndSendTransactions = function (account, transactions) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, Promise.all(transactions.map(function (tx) { return account.signAndSendTransaction(tx); }))];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
var near, connection, logger, fundingAccount, fundingKey;
var initKeypom = function (_a) {
    var network = _a.network, funder = _a.funder;
    return __awaiter(void 0, void 0, void 0, function () {
        var networkConfig, keyStore, networkId, accountId, secretKey, seedPhrase;
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
            if (funder) {
                accountId = funder.accountId, secretKey = funder.secretKey, seedPhrase = funder.seedPhrase;
                if (seedPhrase) {
                    secretKey = (0, near_seed_phrase_1.parseSeedPhrase)(seedPhrase).secretKey;
                }
                fundingKey = KeyPair.fromString(secretKey);
                keyStore.setKey(networkConfig.networkId, accountId, fundingKey);
                fundingAccount = new Account(connection, accountId);
                fundingAccount.viewFunction2 = function (_a) {
                    var contractId = _a.contractId, methodName = _a.methodName, args = _a.args;
                    return fundingAccount.viewFunction(contractId, methodName, args);
                };
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
        var keyPairs, pubKeys, i, keyPair, finalConfig, requiredDeposit, transactions, responses_1, nearAccount, responses, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
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
                    _e.label = 1;
                case 1:
                    if (!(i < numKeys)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, keypom_utils_1.genKey)(fundingAccount ? fundingKey.secretKey : accountRootKey, dropId, i)];
                case 2:
                    keyPair = _e.sent();
                    keyPairs.push(keyPair);
                    pubKeys.push(keyPair.getPublicKey().toString());
                    _e.label = 3;
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
                    requiredDeposit = _e.sent();
                    transactions = [{
                            receiverId: 'v1.keypom.testnet',
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
                    if (!wallet) return [3 /*break*/, 7];
                    return [4 /*yield*/, wallet.signAndSendTransactions({ transactions: transactions })];
                case 6:
                    responses_1 = _e.sent();
                    return [2 /*return*/, { responses: responses_1, keyPairs: keyPairs }];
                case 7:
                    nearAccount = account || fundingAccount;
                    if (!nearAccount) {
                        throw new Error("Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'");
                    }
                    _c = signAndSendTransactions;
                    _d = [nearAccount];
                    return [4 /*yield*/, transformTransactions(transactions)];
                case 8: return [4 /*yield*/, _c.apply(void 0, _d.concat([_e.sent()]))];
                case 9:
                    responses = _e.sent();
                    return [2 /*return*/, { responses: responses, keyPairs: keyPairs }];
            }
        });
    });
};
exports.createDrop = createDrop;
var addKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, publicKeys = _a.publicKeys;
    return __awaiter(void 0, void 0, void 0, function () {
        var requiredDeposit, transactions, nearAccount, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    requiredDeposit = parseNearAmount((0.03 * publicKeys.length).toString());
                    transactions = [{
                            receiverId: 'v1.keypom.testnet',
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
                    if (!wallet) return [3 /*break*/, 2];
                    return [4 /*yield*/, wallet.signAndSendTransactions({ transactions: transactions })];
                case 1: return [2 /*return*/, _d.sent()];
                case 2:
                    nearAccount = account || fundingAccount;
                    if (!nearAccount) {
                        throw new Error("Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'");
                    }
                    _b = signAndSendTransactions;
                    _c = [nearAccount];
                    return [4 /*yield*/, transformTransactions(transactions)];
                case 3: return [4 /*yield*/, _b.apply(void 0, _c.concat([_d.sent()]))];
                case 4: return [2 /*return*/, _d.sent()];
            }
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
                    return [4 /*yield*/, fundingAccount.viewFunction2({
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
                                        return [4 /*yield*/, fundingAccount.viewFunction2({
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
var deleteKeys = function (_a) {
    var drop = _a.drop, keys = _a.keys;
    return __awaiter(void 0, void 0, void 0, function () {
        var drop_id, drop_type, actions, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
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
                    _b = signAndSendTransactions;
                    _c = [fundingAccount];
                    return [4 /*yield*/, transformTransactions([{
                                receiverId: receiverId,
                                actions: actions
                            }])];
                case 1: return [2 /*return*/, _b.apply(void 0, _c.concat([_d.sent()]))];
            }
        });
    });
};
exports.deleteKeys = deleteKeys;
var deleteDrops = function (_a) {
    var drops = _a.drops;
    return __awaiter(void 0, void 0, void 0, function () {
        var responses;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all(drops.map(function (_a) {
                        var drop_id = _a.drop_id, drop_type = _a.drop_type, keys = _a.keys;
                        return __awaiter(void 0, void 0, void 0, function () {
                            var actions, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
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
                                        _b = signAndSendTransactions;
                                        _c = [fundingAccount];
                                        return [4 /*yield*/, transformTransactions([{
                                                    receiverId: receiverId,
                                                    actions: actions
                                                }])];
                                    case 1: return [2 /*return*/, _b.apply(void 0, _c.concat([_d.sent()]))];
                                }
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
var transformTransactions = function (transactions) { return __awaiter(void 0, void 0, void 0, function () {
    var provider;
    return __generator(this, function (_a) {
        provider = fundingAccount.connection.provider;
        return [2 /*return*/, Promise.all(transactions.map(function (transaction, index) { return __awaiter(void 0, void 0, void 0, function () {
                var actions, block;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions = transaction.actions.map(function (action) {
                                return createAction(action);
                            });
                            return [4 /*yield*/, provider.block({ finality: "final" })];
                        case 1:
                            block = _a.sent();
                            return [2 /*return*/, nearTransactions.createTransaction(fundingAccount.accountId, fundingKey.publicKey, transaction.receiverId, fundingKey.publicKey.nonce + index + 1, actions, utils.serialize.base_decode(block.header.hash))];
                    }
                });
            }); }))];
    });
}); };
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return nearTransactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return nearTransactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas_1 = _a.gas, deposit = _a.deposit;
            return nearTransactions.functionCall(methodName, args, new bn_js_1.BN(gas_1), new bn_js_1.BN(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return nearTransactions.transfer(new bn_js_1.BN(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return nearTransactions.stake(new bn_js_1.BN(stake), utils.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            // return nearTransactions.addKey(
            // 	utils.PublicKey.from(publicKey),
            // 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            // 	getAccessKey(accessKey.permission)
            // );
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return nearTransactions.deleteKey(utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return nearTransactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
