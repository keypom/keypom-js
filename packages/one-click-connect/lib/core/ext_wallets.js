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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extSignAndSendTransactions = exports.SUPPORTED_EXT_WALLET_DATA = void 0;
var nearAPI = __importStar(require("near-api-js"));
var borsh_1 = require("borsh");
var selector_utils_1 = require("../utils/selector-utils");
var types_1 = require("./types");
var wallet_utils_1 = require("@near-wallet-selector/wallet-utils");
var Transaction = __importStar(require("@near-js/transactions"));
var one_click_utils_1 = require("../utils/one-click-utils");
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
    var transactions = _a.transactions, walletId = _a.walletId, accountId = _a.accountId, secretKey = _a.secretKey, near = _a.near;
    return __awaiter(void 0, void 0, void 0, function () {
        var fakRequiredTxns, responses, new_key, pk_1, currentUrl, walletBaseUrl, newUrl, account_1, transformed_transactions, txn_schema, serialized, account, pk, i, txn, accessKey, canExecuteTxn, response, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fakRequiredTxns = [];
                    responses = [];
                    if (!(secretKey === undefined)) return [3 /*break*/, 3];
                    console.warn("Secret key not provided");
                    console.log("anyone home?");
                    new_key = nearAPI.KeyPair.fromRandom("ed25519");
                    pk_1 = new_key.getPublicKey().toString();
                    console.log("pk being added to storage: ", pk_1);
                    (0, selector_utils_1.setLocalStoragePendingKey)({
                        secretKey: new_key.toString(),
                        publicKey: pk_1,
                        accountId: accountId
                    });
                    currentUrl = new URL(window.location.href);
                    console.log("current URL: ", currentUrl);
                    walletBaseUrl = void 0;
                    switch (walletId) {
                        case "my-near-wallet":
                            walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                            break;
                        case "meteor-wallet":
                            // walletBaseUrl = "https://wallet.meteorwallet.app/wallet/";
                            walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                            break;
                        case "sweat-wallet":
                            // walletBaseUrl = "https://wallet.sweat.finance";
                            walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                            break;
                        default:
                            throw new Error("Unsupported wallet ID: ".concat(walletId));
                    }
                    ;
                    console.log("wallet base url: ", walletBaseUrl);
                    newUrl = new URL('sign', walletBaseUrl);
                    console.log("a: ", newUrl.toString());
                    console.log("txn to serialize: ", transactions);
                    return [4 /*yield*/, near.account(accountId)];
                case 1:
                    account_1 = _b.sent();
                    console.log("occ signer: ", account_1.connection.signer);
                    return [4 /*yield*/, (0, one_click_utils_1.testTransformTransactions)(transactions, account_1)];
                case 2:
                    transformed_transactions = _b.sent();
                    try {
                        txn_schema = Transaction.SCHEMA;
                        console.log("obj constructor: ", transformed_transactions[0].constructor());
                        console.log("schema transaction inside: ", txn_schema);
                        console.log("txn: ", transformed_transactions[0]);
                        console.log("schema at obj constructor: ", txn_schema.get(transformed_transactions[0].constructor()));
                        serialized = (0, borsh_1.serialize)(txn_schema, transformed_transactions[0]);
                        console.log(serialized);
                    }
                    catch (e) {
                        console.log("error NEW 2: ", e);
                    }
                    // console.log("schema: ", nearAPI.transactions.SCHEMA)
                    // console.log("schema keys: ", nearAPI.transactions.SCHEMA.keys())
                    // console.log("schema transaction key 2: ", nearAPI.transactions.SCHEMA[2])
                    // console.log("schema transaction: ", nearAPI.transactions.SCHEMA.Transaction)
                    // console.log("schema transaction 2: ", nearAPI.transactions.SCHEMA['Transaction'])
                    // console.log("schema transaction 3: ", nearAPI.transactions.SCHEMA.get(Transaction))
                    // serialize(nearAPI.transactions.SCHEMA.Transaction, transactions[0])
                    // try{
                    //     const serializedTxn = encodeURI(JSON.stringify(transactions[0]))
                    //     console.log(serializedTxn)
                    // }catch(e){
                    //     console.log("error 3: ", e)
                    // }
                    // newUrl.searchParams.set('transactions', transactions
                    //     .map(transaction => serialize(nearAPI.transactions.SCHEMA, transaction))
                    //     .map(serialized => Buffer.from(serialized).toString('base64'))
                    //     .join(','));
                    // console.log("b: ", newUrl.toString())
                    // newUrl.searchParams.set('transactions', transactions
                    //     .map(transaction => encodeURI(JSON.stringify(transaction)))
                    //     .join(','));
                    console.log("b: ", newUrl.toString());
                    newUrl.searchParams.set('callbackUrl', currentUrl.href);
                    console.log("c: ", newUrl.toString());
                    newUrl.searchParams.set('limitedAccessKey', new_key.getPublicKey().toString());
                    console.log("redirecting to:", newUrl.toString());
                    // window.location.assign(newUrl.toString());
                    return [2 /*return*/, []];
                case 3: return [4 /*yield*/, near.account(accountId)];
                case 4:
                    account = _b.sent();
                    pk = (0, selector_utils_1.getPubFromSecret)(secretKey);
                    i = 0;
                    _b.label = 5;
                case 5:
                    if (!(i < transactions.length)) return [3 /*break*/, 14];
                    txn = transactions[i];
                    return [4 /*yield*/, near.connection.provider.query("access_key/".concat(accountId, "/").concat(pk), "")];
                case 6:
                    accessKey = _b.sent();
                    return [4 /*yield*/, (0, selector_utils_1.keyHasPermissionForTransaction)(accessKey, txn.receiverId, txn.actions)];
                case 7:
                    canExecuteTxn = _b.sent();
                    console.log("canExecuteTxn", canExecuteTxn);
                    if (!canExecuteTxn) return [3 /*break*/, 12];
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    console.log("Signing transaction", txn);
                    return [4 /*yield*/, account.signAndSendTransaction({
                            receiverId: txn.receiverId,
                            actions: txn.actions.map(function (action) {
                                return (0, wallet_utils_1.createAction)(action);
                            }),
                        })];
                case 9:
                    response = _b.sent();
                    responses.push(response);
                    return [3 /*break*/, 11];
                case 10:
                    e_1 = _b.sent();
                    console.error("Error signing transaction", e_1);
                    fakRequiredTxns.push(txn);
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    fakRequiredTxns.push(txn);
                    _b.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 5];
                case 14:
                    console.log("fakRequiredTxns", fakRequiredTxns);
                    if (fakRequiredTxns.length > 0) {
                        switch (walletId) {
                            case "sweat-wallet":
                                console.warn("Sweat wallet does not support FAK signing yet");
                                return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                            default:
                                console.warn("Unsupported wallet ID: ", walletId);
                                return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                        }
                    }
                    return [2 /*return*/, responses];
            }
        });
    });
};
exports.extSignAndSendTransactions = extSignAndSendTransactions;
