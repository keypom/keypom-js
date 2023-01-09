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
var nearAPI = __importStar(require("near-api-js"));
var bn_js_1 = __importDefault(require("bn.js"));
var parseNearAmount = nearAPI.utils.format.parseNearAmount;
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
var drops_1 = require("./drops");
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
 * @param {boolean=} hasBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit.
*/
var addKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, drop = _a.drop, numKeys = _a.numKeys, publicKeys = _a.publicKeys, nftTokenIds = _a.nftTokenIds, rootEntropy = _a.rootEntropy, _b = _a.hasBalance, hasBalance = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, near, gas, contractId, receiverId, getAccount, execute, fundingAccountDetails, _d, drop_id, registered_uses, required_gas, deposit_per_use, uses_per_key, _e, ftData, _f, nftData, next_key_id, _g, keys, rootEntropyUsed, nonceDropIdMeta, requiredDeposit, transactions, responses, nftResponses;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), near = _c.near, gas = _c.gas, contractId = _c.contractId, receiverId = _c.receiverId, getAccount = _c.getAccount, execute = _c.execute, fundingAccountDetails = _c.fundingAccountDetails;
                    if (!near) {
                        throw new Error('Keypom SDK is not initialized. Please call `initKeypom`.');
                    }
                    if (!drop && !dropId) {
                        throw new Error("Either a dropId or drop object must be passed in.");
                    }
                    if (!(publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length) && !numKeys) {
                        throw new Error("Either pass in publicKeys or set numKeys to a positive non-zero value.");
                    }
                    account = getAccount({ account: account, wallet: wallet });
                    _g = drop;
                    if (_g) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, drops_1.getDropInformation)({ dropId: dropId })];
                case 1:
                    _g = (_h.sent());
                    _h.label = 2;
                case 2:
                    _d = _g, drop_id = _d.drop_id, registered_uses = _d.registered_uses, required_gas = _d.required_gas, deposit_per_use = _d.deposit_per_use, uses_per_key = _d.config.uses_per_key, _e = _d.ft, ftData = _e === void 0 ? {} : _e, _f = _d.nft, nftData = _f === void 0 ? {} : _f, next_key_id = _d.next_key_id;
                    if (!!publicKeys) return [3 /*break*/, 7];
                    rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
                    if (!rootEntropyUsed) return [3 /*break*/, 4];
                    nonceDropIdMeta = Array.from({ length: numKeys }, function (_, i) { return "".concat(drop_id, ":").concat(next_key_id + i); });
                    return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                            numKeys: numKeys,
                            rootEntropy: rootEntropyUsed,
                            metaEntropy: nonceDropIdMeta
                        })];
                case 3:
                    keys = _h.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, keypom_utils_1.generateKeys)({
                        numKeys: numKeys,
                    })];
                case 5:
                    // No entropy is provided so all keys should be fully random
                    keys = _h.sent();
                    _h.label = 6;
                case 6:
                    publicKeys = keys.publicKeys;
                    _h.label = 7;
                case 7:
                    numKeys = publicKeys.length;
                    return [4 /*yield*/, (0, keypom_utils_1.estimateRequiredDeposit)({
                            near: near,
                            depositPerUse: deposit_per_use,
                            numKeys: numKeys,
                            usesPerKey: uses_per_key,
                            attachedGas: required_gas,
                            storage: parseNearAmount('0.2'),
                            ftData: ftData,
                        })];
                case 8:
                    requiredDeposit = _h.sent();
                    console.log('requiredDeposit for add keys: ', requiredDeposit);
                    transactions = [];
                    transactions.push({
                        receiverId: receiverId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'add_keys',
                                    args: {
                                        drop_id: drop.drop_id,
                                        public_keys: publicKeys,
                                    },
                                    gas: gas,
                                    deposit: !hasBalance ? requiredDeposit : undefined,
                                }
                            }]
                    });
                    if (ftData.contract_id) {
                        console.log('ftData.balance_per_use: ', ftData.balance_per_use);
                        console.log('numKeys: ', numKeys);
                        console.log('registered_uses: ', registered_uses);
                        console.log('numKeys - registered_uses: ', numKeys - registered_uses);
                        transactions.push((0, keypom_utils_1.ftTransferCall)({
                            account: account,
                            contractId: ftData.contract_id,
                            args: {
                                receiver_id: contractId,
                                amount: new bn_js_1.default(ftData.balance_per_use).mul(new bn_js_1.default(numKeys - registered_uses)).toString(),
                                msg: drop_id.toString(),
                            },
                            returnTransaction: true
                        }));
                    }
                    return [4 /*yield*/, execute({ transactions: transactions, account: account, wallet: wallet })];
                case 9:
                    responses = _h.sent();
                    if (!(nftTokenIds && nftTokenIds.length > 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, keypom_utils_1.nftTransferCall)({
                            account: account,
                            contractId: nftData.contract_id,
                            receiverId: contractId,
                            tokenIds: nftTokenIds,
                            msg: drop_id.toString(),
                        })];
                case 10:
                    nftResponses = _h.sent();
                    responses = responses.concat(nftResponses);
                    _h.label = 11;
                case 11: return [2 /*return*/, responses];
            }
        });
    });
};
exports.addKeys = addKeys;
var deleteKeys = function (_a) {
    var account = _a.account, wallet = _a.wallet, drop = _a.drop, keys = _a.keys, _b = _a.withdrawBalance, withdrawBalance = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, receiverId, execute, drop_id, registered_uses, actions, transactions;
        return __generator(this, function (_d) {
            _c = (0, keypom_1.getEnv)(), receiverId = _c.receiverId, execute = _c.execute;
            drop_id = drop.drop_id, registered_uses = drop.registered_uses;
            if (!keys)
                keys = drop.keys;
            actions = [];
            if ((drop.ft || drop.nft) && registered_uses > 0) {
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
        });
    });
};
exports.deleteKeys = deleteKeys;
