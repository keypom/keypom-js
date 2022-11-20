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
exports.deleteDrops = exports.getDrops = exports.createDrop = void 0;
var nearAPI = __importStar(require("near-api-js"));
var bn_js_1 = __importDefault(require("bn.js"));
var _a = nearAPI.utils.format, parseNearAmount = _a.parseNearAmount, formatNearAmount = _a.formatNearAmount;
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, accountRootKey = _a.accountRootKey, dropId = _a.dropId, publicKeys = _a.publicKeys, numKeys = _a.numKeys, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _b = _a.config, config = _b === void 0 ? {} : _b, _c = _a.ftData, ftData = _c === void 0 ? {} : _c, _d = _a.nftData, nftData = _d === void 0 ? {} : _d, fcData = _a.fcData, _e = _a.hasBalance, hasBalance = _e === void 0 ? false : _e;
    return __awaiter(void 0, void 0, void 0, function () {
        var _f, near, fundingAccount, fundingKey, gas, attachedGas, contractId, receiverId, getAccount, execute, finalConfig, requiredDeposit, transactions, responses, tokenIds, nftResponses;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _f = (0, keypom_1.getEnv)(), near = _f.near, fundingAccount = _f.fundingAccount, fundingKey = _f.fundingKey, gas = _f.gas, attachedGas = _f.attachedGas, contractId = _f.contractId, receiverId = _f.receiverId, getAccount = _f.getAccount, execute = _f.execute;
                    /// parse args
                    if (depositPerUseNEAR) {
                        depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0';
                    }
                    if (!depositPerUseYocto)
                        depositPerUseYocto = '0';
                    if (!dropId)
                        dropId = Date.now().toString();
                    finalConfig = {
                        uses_per_key: config.usesPerKey || 1,
                        delete_on_empty: config.deleteOnEmpty || true,
                        auto_withdraw: config.autoWithdraw || true,
                        start_timestamp: config.startTimestamp,
                        throttle_timestamp: config.throttleTimestamp,
                        on_claim_refund_deposit: config.onClaimRefundDeposit,
                        claim_permission: config.claimPermission,
                        drop_root: config.dropRoot,
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
                    requiredDeposit = _g.sent();
                    transactions = [];
                    transactions.push({
                        receiverId: receiverId,
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
                                    },
                                    gas: gas,
                                    deposit: !hasBalance ? requiredDeposit : undefined,
                                }
                            }]
                    });
                    if (ftData.contractId && numKeys) {
                        transactions.push((0, keypom_utils_1.ftTransferCall)({
                            account: getAccount({ account: account, wallet: wallet }),
                            contractId: ftData.contractId,
                            args: {
                                receiver_id: contractId,
                                amount: new bn_js_1.default(ftData.balancePerUse).mul(new bn_js_1.default(numKeys)).toString(),
                                msg: dropId.toString(),
                            },
                            returnTransaction: true
                        }));
                    }
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 2:
                    responses = _g.sent();
                    tokenIds = nftData.tokenIds;
                    if (!(tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: getAccount({ account: account, wallet: wallet }),
                            contractId: nftData.contractId,
                            receiverId: contractId,
                            tokenIds: tokenIds,
                            msg: dropId.toString(),
                        })];
                case 3:
                    nftResponses = _g.sent();
                    responses = responses.concat(nftResponses);
                    _g.label = 4;
                case 4: return [2 /*return*/, { responses: responses }];
            }
        });
    });
};
exports.createDrop = createDrop;
var getDrops = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, fundingAccount, viewAccount, contractId, drops;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), fundingAccount = _b.fundingAccount, viewAccount = _b.viewAccount, contractId = _b.contractId;
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
                    drops = _c.sent();
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
                    _c.sent();
                    return [2 /*return*/, drops];
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
                            var drop_id = _a.drop_id, drop_type = _a.drop_type, keys = _a.keys, registered_uses = _a.registered_uses;
                            return __awaiter(void 0, void 0, void 0, function () {
                                var responses, _b, _c, _d, actions, transactions, _e, _f, _g;
                                return __generator(this, function (_h) {
                                    switch (_h.label) {
                                        case 0:
                                            responses = [];
                                            if (!(registered_uses !== 0 && (drop_type.FungibleToken || drop_type.NonFungibleToken))) return [3 /*break*/, 2];
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
                                        case 1:
                                            _c.apply(_b, _d.concat([(_h.sent())]));
                                            _h.label = 2;
                                        case 2:
                                            actions = [];
                                            actions.push({
                                                type: 'FunctionCall',
                                                params: {
                                                    methodName: 'delete_keys',
                                                    args: {
                                                        drop_id: drop_id,
                                                        public_keys: keys.map(keypom_utils_1.key2str),
                                                    },
                                                    gas: gas,
                                                }
                                            });
                                            if (withdrawBalance) {
                                                actions.push({
                                                    type: 'FunctionCall',
                                                    params: {
                                                        methodName: 'withdraw_from_balance',
                                                        args: {},
                                                        gas: '50000000000000',
                                                    }
                                                });
                                            }
                                            transactions = [{
                                                    receiverId: receiverId,
                                                    actions: actions,
                                                }];
                                            _f = (_e = responses.push).apply;
                                            _g = [responses];
                                            return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                                        case 3:
                                            _f.apply(_e, _g.concat([(_h.sent())]));
                                            return [2 /*return*/, responses];
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
