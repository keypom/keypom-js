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
exports.deleteDrops = exports.getDrops = exports.getDropSupply = exports.createDrop = void 0;
var nearAPI = __importStar(require("near-api-js"));
var bn_js_1 = __importDefault(require("bn.js"));
var _a = nearAPI.utils.format, parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var KEY_LIMIT = 50;
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, publicKeys = _a.publicKeys, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _b = _a.config, config = _b === void 0 ? {} : _b, _c = _a.ftData, ftData = _c === void 0 ? {} : _c, _d = _a.nftData, nftData = _d === void 0 ? {} : _d, _e = _a.simpleData, simpleData = _e === void 0 ? {} : _e, fcData = _a.fcData, _f = _a.hasBalance, hasBalance = _f === void 0 ? false : _f;
    return __awaiter(void 0, void 0, void 0, function () {
        var _g, near, viewAccount, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccount, finalConfig, requiredDeposit, metadata_1, deposit, transactions, tokenIds, nftTXs, responses;
        var _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    _g = (0, keypom_1.getEnv)(), near = _g.near, viewAccount = _g.viewAccount, gas = _g.gas, attachedGas = _g.attachedGas, contractId = _g.contractId, receiverId = _g.receiverId, getAccount = _g.getAccount, execute = _g.execute, fundingAccount = _g.fundingAccount;
                    account = getAccount({ account: account, wallet: wallet });
                    /// parse args
                    if (depositPerUseNEAR) {
                        depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0';
                    }
                    if (!depositPerUseYocto)
                        depositPerUseYocto = '0';
                    if (!dropId)
                        dropId = Date.now().toString();
                    finalConfig = {
                        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
                        root_account_id: config === null || config === void 0 ? void 0 : config.dropRoot,
                        usage: {
                            auto_delete_drop: ((_h = config === null || config === void 0 ? void 0 : config.usage) === null || _h === void 0 ? void 0 : _h.autoDeleteDrop) || false,
                            auto_withdraw: ((_j = config === null || config === void 0 ? void 0 : config.usage) === null || _j === void 0 ? void 0 : _j.autoWithdraw) || true,
                            permissions: (_k = config === null || config === void 0 ? void 0 : config.usage) === null || _k === void 0 ? void 0 : _k.permissions,
                            refund_deposit: (_l = config === null || config === void 0 ? void 0 : config.usage) === null || _l === void 0 ? void 0 : _l.refundDeposit,
                        },
                        time: config === null || config === void 0 ? void 0 : config.time,
                    };
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: depositPerUseYocto,
                            numKeys: (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length) || 1,
                            usesPerKey: finalConfig.uses_per_key,
                            attachedGas: parseInt(attachedGas),
                            storage: (0, keypom_utils_1.getStorageBase)({ nftData: nftData, fcData: fcData }),
                            ftData: ftData,
                            fcData: fcData,
                        })];
                case 1:
                    requiredDeposit = _m.sent();
                    if (!(ftData === null || ftData === void 0 ? void 0 : ftData.balancePerUse)) return [3 /*break*/, 3];
                    return [4 /*yield*/, viewAccount.viewFunction2({
                            contractId: ftData.contractId,
                            methodName: 'ft_metadata',
                        })];
                case 2:
                    metadata_1 = _m.sent();
                    ftData.balancePerUse = (0, keypom_utils_1.parseFTAmount)(ftData.balancePerUse, metadata_1.decimals);
                    _m.label = 3;
                case 3:
                    deposit = !hasBalance ? requiredDeposit : '0';
                    transactions = [];
                    transactions.push({
                        receiverId: receiverId,
                        signerId: account.accountId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'create_drop',
                                    args: {
                                        drop_id: dropId,
                                        public_keys: publicKeys || [],
                                        deposit_per_use: depositPerUseYocto,
                                        config: finalConfig,
                                        metadata: metadata,
                                        ft: ftData.contractId ? ({
                                            contract_id: ftData.contractId,
                                            sender_id: ftData.senderId,
                                            balance_per_use: ftData.balancePerUse,
                                        }) : undefined,
                                        nft: nftData.contractId ? ({
                                            contract_id: nftData.contractId,
                                            sender_id: nftData.senderId,
                                        }) : undefined,
                                        fc: (fcData === null || fcData === void 0 ? void 0 : fcData.methods) ? ({
                                            methods: fcData.methods.map(function (useMethods) { return useMethods.map(function (method) {
                                                var ret = {};
                                                ret.receiver_id = method.receiverId;
                                                ret.method_name = method.methodName;
                                                ret.args = method.args;
                                                ret.attached_deposit = method.attachedDeposit;
                                                ret.account_id_field = method.accountIdField;
                                                ret.drop_id_field = method.dropIdField;
                                                return ret;
                                            }); })
                                        }) : undefined,
                                        simple: (simpleData === null || simpleData === void 0 ? void 0 : simpleData.lazyRegister) ? ({
                                            lazy_register: simpleData.lazyRegister,
                                        }) : undefined,
                                    },
                                    gas: gas,
                                    deposit: deposit,
                                }
                            }]
                    });
                    if (ftData.contractId && (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length)) {
                        transactions.push((0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contractId,
                            args: {
                                receiver_id: contractId,
                                amount: new bn_js_1.default(ftData.balancePerUse).mul(new bn_js_1.default(publicKeys.length)).toString(),
                                msg: dropId.toString(),
                            },
                            returnTransaction: true
                        }));
                    }
                    tokenIds = nftData === null || nftData === void 0 ? void 0 : nftData.tokenIds;
                    if (!(tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: account,
                            contractId: nftData.contractId,
                            receiverId: contractId,
                            tokenIds: tokenIds,
                            msg: dropId.toString(),
                            returnTransactions: true
                        })];
                case 4:
                    nftTXs = _m.sent();
                    transactions = transactions.concat(nftTXs);
                    _m.label = 5;
                case 5: return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 6:
                    responses = _m.sent();
                    return [2 /*return*/, { responses: responses }];
            }
        });
    });
};
exports.createDrop = createDrop;
var getDropSupply = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_drop_supply_for_owner',
                    args: {
                        account_id: accountId,
                    },
                })];
        });
    });
};
exports.getDropSupply = getDropSupply;
var getDrops = function (_a) {
    var accountId = _a.accountId, start = _a.start, limit = _a.limit, _b = _a.withKeys, withKeys = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var drops;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                        methodName: 'get_drops_for_owner',
                        args: {
                            account_id: accountId,
                            from_index: start ? start.toString() : undefined,
                            limit: limit ? limit : undefined,
                        },
                    })];
                case 1:
                    drops = _c.sent();
                    if (!withKeys) return [3 /*break*/, 3];
                    if (drops.length > 20) {
                        throw new Error("Too many RPC requests in parallel. Use 'limit' arg 20 or less.");
                    }
                    return [4 /*yield*/, Promise.all(drops.map(function (drop, i) { return __awaiter(void 0, void 0, void 0, function () {
                            var drop_id, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        drop_id = drop.drop_id;
                                        _a = drop;
                                        return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                                                methodName: 'get_keys_for_drop',
                                                args: {
                                                    drop_id: drop_id,
                                                    from_index: '0',
                                                    limit: KEY_LIMIT
                                                }
                                            })];
                                    case 1:
                                        _a.keys = _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/, drops];
            }
        });
    });
};
exports.getDrops = getDrops;
var deleteDrops = function (_a) {
    var account = _a.account, wallet = _a.wallet, drops = _a.drops, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? true : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, gas, gas300, receiverId, execute, responses;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), gas = _c.gas, gas300 = _c.gas300, receiverId = _c.receiverId, execute = _c.execute;
                    return [4 /*yield*/, Promise.all(drops.map(function (_a) {
                            var drop_id = _a.drop_id, keys = _a.keys, registered_uses = _a.registered_uses, ft = _a.ft, nft = _a.nft;
                            return __awaiter(void 0, void 0, void 0, function () {
                                var keySupply, updateKeys, responses, _b, _c, _d, deleteKeys, _e, _f, _g;
                                return __generator(this, function (_h) {
                                    switch (_h.label) {
                                        case 0:
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
                                                                                        drop_id: drop_id,
                                                                                    }
                                                                                })];
                                                                            case 1:
                                                                                keySupply = _a.sent();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); })
                                                            ];
                                                            if (!keys) {
                                                                keyPromises.push((function () { return __awaiter(void 0, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0: return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                                                                                    methodName: 'get_keys_for_drop',
                                                                                    args: {
                                                                                        drop_id: drop_id,
                                                                                        from_index: '0',
                                                                                        limit: KEY_LIMIT,
                                                                                    }
                                                                                })];
                                                                            case 1:
                                                                                keys = _a.sent();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); }));
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
                case 1:
                    responses = _d.sent();
                    return [2 /*return*/, responses];
            }
        });
    });
};
exports.deleteDrops = deleteDrops;
