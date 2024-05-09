"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extSignAndSendTransactions = exports.SUPPORTED_EXT_WALLET_DATA = void 0;
var core_1 = require("@keypom/core");
var accounts_1 = require("@near-js/accounts");
var crypto_1 = require("@near-js/crypto");
var transactions_1 = require("@near-js/transactions");
var selector_utils_1 = require("../utils/selector-utils");
var types_1 = require("./types");
exports.SUPPORTED_EXT_WALLET_DATA = {
    testnet: {
        "sweat-wallet": {},
    },
    mainnet: {
        "sweat-wallet": {},
    },
};
/**
 * Requests the user to quickly sign for a transaction or batch of transactions by redirecting to the NEAR wallet.
 */
var extSignAndSendTransactions = function (_a) {
    var transactions = _a.transactions, moduleId = _a.moduleId, accountId = _a.accountId, secretKey = _a.secretKey, near = _a.near;
    return __awaiter(void 0, void 0, void 0, function () {
        var fakRequiredTxns, responses, account, i, txn, mappedActions, pk, transaction, accessKey, canExecuteTxn, _b, _c, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fakRequiredTxns = [];
                    responses = [];
                    account = new accounts_1.Account(near.connection, accountId);
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < transactions.length)) return [3 /*break*/, 11];
                    txn = transactions[i];
                    mappedActions = txn.actions.map(function (a) {
                        var fcAction = a;
                        return transactions_1.actionCreators.functionCall(fcAction.params.methodName, (0, transactions_1.stringifyJsonOrBytes)(fcAction.params.args), BigInt(fcAction.params.gas), // Convert string to bigint
                        BigInt(fcAction.params.deposit) // Convert string to bigint
                        );
                    });
                    pk = crypto_1.PublicKey.from((0, core_1.getPubFromSecret)(secretKey));
                    return [4 /*yield*/, (0, core_1.convertBasicTransaction)({
                            txnInfo: {
                                receiverId: txn.receiverId,
                                signerId: txn.signerId,
                                actions: mappedActions,
                            },
                            signerId: accountId,
                            signerPk: pk,
                        })];
                case 2:
                    transaction = _d.sent();
                    return [4 /*yield*/, near.connection.provider.query("access_key/".concat(accountId, "/").concat(pk), "")];
                case 3:
                    accessKey = _d.sent();
                    return [4 /*yield*/, (0, selector_utils_1.keyHasPermissionForTransaction)(accessKey, txn.receiverId, mappedActions)];
                case 4:
                    canExecuteTxn = _d.sent();
                    if (!canExecuteTxn) return [3 /*break*/, 9];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    _c = (_b = responses).push;
                    return [4 /*yield*/, account.signAndSendTransaction(transaction)];
                case 6:
                    _c.apply(_b, [_d.sent()]);
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _d.sent();
                    fakRequiredTxns.push(transaction);
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    fakRequiredTxns.push(transaction);
                    _d.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 1];
                case 11:
                    if (fakRequiredTxns.length > 0) {
                        switch (moduleId) {
                            case "sweat-wallet":
                                console.warn("Sweat wallet does not support FAK signing yet");
                                return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                            default:
                                console.warn("Unsupported wallet module: ", moduleId);
                                return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                        }
                    }
                    return [2 /*return*/, responses];
            }
        });
    });
};
exports.extSignAndSendTransactions = extSignAndSendTransactions;
