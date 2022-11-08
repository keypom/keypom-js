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
exports.createDrop = void 0;
var nearAPI = __importStar(require("near-api-js"));
var bn_js_1 = __importDefault(require("bn.js"));
var parseNearAmount = nearAPI.utils.format.parseNearAmount;
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var createDrop = function (_a) {
    var account = _a.account, wallet = _a.wallet, accountRootKey = _a.accountRootKey, dropId = _a.dropId, publicKeys = _a.publicKeys, numKeys = _a.numKeys, depositPerUseNEAR = _a.depositPerUseNEAR, depositPerUseYocto = _a.depositPerUseYocto, metadata = _a.metadata, _b = _a.config, config = _b === void 0 ? {} : _b, _c = _a.ftData, ftData = _c === void 0 ? {} : _c, _d = _a.nftData, nftData = _d === void 0 ? {} : _d, fcData = _a.fcData;
    return __awaiter(void 0, void 0, void 0, function () {
        var _e, near, fundingAccount, fundingKey, gas, attachedGas, contractId, receiverId, getAccount, execute, keyPairs, pubKeys, i, keyPair, finalConfig, requiredDeposit, transactions, responses, tokenIds, nftResponses;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _e = (0, keypom_1.getEnv)(), near = _e.near, fundingAccount = _e.fundingAccount, fundingKey = _e.fundingKey, gas = _e.gas, attachedGas = _e.attachedGas, contractId = _e.contractId, receiverId = _e.receiverId, getAccount = _e.getAccount, execute = _e.execute;
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
                    _f.label = 1;
                case 1:
                    if (!(i < numKeys)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, keypom_utils_1.genKey)(fundingAccount ? fundingKey.secretKey : accountRootKey, dropId, i)];
                case 2:
                    keyPair = _f.sent();
                    keyPairs.push(keyPair);
                    pubKeys.push(keyPair.getPublicKey().toString());
                    _f.label = 3;
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
                            attachedGas: attachedGas,
                            storage: nftData.contractId ? parseNearAmount('0.05') : parseNearAmount('0.01'),
                            ftData: ftData,
                            fcData: fcData,
                        })];
                case 5:
                    requiredDeposit = _f.sent();
                    transactions = [];
                    transactions.push({
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
                                        ft_data: ftData.contractId ? ({
                                            contract_id: ftData.contractId,
                                            sender_id: ftData.senderId,
                                            balance_per_use: ftData.balancePerUse,
                                        }) : undefined,
                                        nft_data: nftData.contractId ? ({
                                            contract_id: nftData.contractId,
                                            sender_id: nftData.senderId,
                                        }) : undefined,
                                        fc_data: null,
                                    },
                                    gas: gas,
                                    deposit: requiredDeposit,
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
                case 6:
                    responses = _f.sent();
                    tokenIds = nftData.tokenIds;
                    if (!(tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: getAccount({ account: account, wallet: wallet }),
                            contractId: nftData.contractId,
                            receiverId: contractId,
                            tokenIds: tokenIds,
                            msg: dropId.toString(),
                        })];
                case 7:
                    nftResponses = _f.sent();
                    responses = responses.concat(nftResponses);
                    _f.label = 8;
                case 8: return [2 /*return*/, { responses: responses, keyPairs: keyPairs }];
            }
        });
    });
};
exports.createDrop = createDrop;