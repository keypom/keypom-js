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
exports.KeypomWallet = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var near_api_js_1 = require("near-api-js");
var browser_local_storage_key_store_1 = require("near-api-js/lib/key_stores/browser_local_storage_key_store");
var keypom_1 = require("../../keypom");
var keypom_utils_1 = require("../../keypom-utils");
var trial_active_1 = require("../../trial-accounts/trial-active");
var utils_1 = require("../../trial-accounts/utils");
var src_1 = require("../modal/src");
var modal_types_1 = require("../modal/src/lib/modal.types");
var selector_utils_1 = require("../utils/selector-utils");
var types_1 = require("./types");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var signInContractId = _a.signInContractId, networkId = _a.networkId, trialBaseUrl = _a.trialBaseUrl, trialSplitDelim = _a.trialSplitDelim, modalOptions = _a.modalOptions;
        var _this = this;
        this.parseUrl = function () {
            var split = window.location.href.split(_this.trialBaseUrl);
            if (split.length != 2) {
                return;
            }
            var trialInfo = split[1];
            var _a = trialInfo.split(_this.trialSplitDelim), accountId = _a[0], secretKey = _a[1];
            if (!accountId || !secretKey) {
                return;
            }
            return {
                accountId: accountId,
                secretKey: secretKey
            };
        };
        this.showModal = function (modalType) {
            if (modalType === void 0) { modalType = { id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER }; }
            console.log('modalType for show modal: ', modalType);
            _this.modal.show(modalType);
        };
        this.checkValidTrialInfo = function () {
            return _this.parseUrl() !== undefined || (0, selector_utils_1.getLocalStorageKeypomEnv)() != null;
        };
        console.log('Keypom constructor called.');
        this.networkId = networkId;
        this.signInContractId = signInContractId;
        this.keyStore = new browser_local_storage_key_store_1.BrowserLocalStorageKeyStore();
        this.near = new near_api_js_1.Near(__assign(__assign({}, keypom_1.networks[networkId]), { deps: { keyStore: this.keyStore } }));
        this.trialBaseUrl = trialBaseUrl;
        this.trialSplitDelim = trialSplitDelim;
        this.modal = (0, src_1.setupModal)(modalOptions);
        console.log("finished constructor");
    }
    KeypomWallet.prototype.getContractId = function () {
        return this.signInContractId;
    };
    KeypomWallet.prototype.getAccountId = function () {
        this.assertSignedIn();
        return this.trialAccountId;
    };
    KeypomWallet.prototype.isSignedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trialAccountId != undefined && this.trialAccountId != null];
            });
        });
    };
    KeypomWallet.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parsedData, accountId, secretKey, isOriginalLink, isUnclaimed, e_1, keyInfo, keyPerms, e_2, curEnvData, _a, accountId, secretKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("IM SIGNING IN");
                        return [4 /*yield*/, (0, keypom_1.initKeypom)({
                                network: this.networkId
                            })];
                    case 1:
                        _b.sent();
                        parsedData = this.parseUrl();
                        if (!(parsedData !== undefined)) return [3 /*break*/, 11];
                        accountId = parsedData.accountId, secretKey = parsedData.secretKey;
                        isOriginalLink = (0, selector_utils_1.updateKeypomContractIfValid)(accountId);
                        console.log("isOriginalLink: ", isOriginalLink);
                        if (!isOriginalLink) return [3 /*break*/, 8];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, (0, utils_1.isUnclaimedTrialDrop)({ keypomContractId: accountId, secretKey: secretKey })];
                    case 3:
                        isUnclaimed = _b.sent();
                        console.log("isUnclaimed: ", isUnclaimed);
                        if (!(isUnclaimed === true)) return [3 /*break*/, 4];
                        this.modal.show({
                            id: modal_types_1.MODAL_TYPE_IDS.BEGIN_TRIAL,
                            meta: {
                                secretKey: secretKey,
                                redirectUrlBase: this.trialBaseUrl,
                                delimiter: this.trialSplitDelim
                            }
                        });
                        return [2 /*return*/, []];
                    case 4:
                        // If the drop is claimed, we should attempt to recover the drop
                        console.log("DROP IS CLAIMED. RECOVERY TODO");
                        return [4 /*yield*/, (0, selector_utils_1.getAccountFromMap)(secretKey)];
                    case 5:
                        accountId = _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _b.sent();
                        console.log('e checking if drop is from keypom: ', e_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, (0, keypom_utils_1.viewAccessKeyData)({ accountId: accountId, secretKey: secretKey })];
                    case 9:
                        keyInfo = _b.sent();
                        keyPerms = keyInfo.permission.FunctionCall;
                        console.log('keyPerms: ', keyPerms);
                        // Check if accountKeys's length is 1 and it has a `public_key` field
                        if (keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')) {
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey)];
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        e_2 = _b.sent();
                        console.log('e: ', e_2);
                        return [3 /*break*/, 11];
                    case 11:
                        curEnvData = (0, selector_utils_1.getLocalStorageKeypomEnv)();
                        console.log('trial info invalid. Cur env data: ', curEnvData);
                        // If there is any
                        if (curEnvData != null) {
                            _a = JSON.parse(curEnvData), accountId = _a.accountId, secretKey = _a.secretKey;
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey)];
                        }
                        // Invalid local storage info so return nothing
                        return [2 /*return*/, []];
                }
            });
        });
    };
    KeypomWallet.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.trialAccountId == undefined || this.trialAccountId == null) {
                            throw new Error("Wallet is already signed out");
                        }
                        this.trialAccountId = this.trialAccountId = this.trialSecretKey = undefined;
                        return [4 /*yield*/, this.keyStore.removeKey(this.networkId, this.trialAccountId)];
                    case 1:
                        _a.sent();
                        localStorage.removeItem("".concat(selector_utils_1.KEYPOM_LOCAL_STORAGE_KEY, ":envData"));
                        return [2 /*return*/];
                }
            });
        });
    };
    KeypomWallet.prototype.signAndSendTransaction = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var receiverId, actions, res, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertSignedIn();
                        console.log('sign and send txn params: ', params);
                        receiverId = params.receiverId, actions = params.actions;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.signAndSendTransactions({
                                transactions: [
                                    {
                                        receiverId: receiverId,
                                        actions: actions,
                                    },
                                ],
                            })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        /// user cancelled or near network error
                        console.warn(e_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, res[0]];
                }
            });
        });
    };
    KeypomWallet.prototype.signAndSendTransactions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, res, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('sign and send txns params inner: ', params);
                        this.assertSignedIn();
                        transactions = params.transactions;
                        console.log('transactions: ', transactions);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        (0, selector_utils_1.addUserToMappingContract)(this.trialAccountId, this.trialSecretKey);
                        return [4 /*yield*/, (0, trial_active_1.trialSignAndSendTxns)({
                                trialAccountId: this.trialAccountId,
                                trialAccountSecretKey: this.trialSecretKey,
                                txns: transactions
                            })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        console.log("e: ".concat(JSON.stringify(e_4)));
                        switch (e_4) {
                            case utils_1.TRIAL_ERRORS.EXIT_EXPECTED: {
                                this.modal.show({
                                    id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER,
                                    meta: {
                                        accountId: this.trialAccountId,
                                        secretKey: this.trialSecretKey
                                    }
                                });
                                break;
                            }
                            case utils_1.TRIAL_ERRORS.INVALID_ACTION: {
                                this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.ACTION_ERROR });
                                break;
                            }
                            case utils_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE: {
                                this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.INSUFFICIENT_BALANCE });
                                break;
                            }
                            default: {
                                console.log('Unidentified error when signing txn: ', e_4);
                                break;
                            }
                        }
                        return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                    case 4: return [2 /*return*/, res];
                }
            });
        });
    };
    KeypomWallet.prototype.verifyOwner = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error("KeypomWallet:verifyOwner is deprecated");
            });
        });
    };
    KeypomWallet.prototype.getAvailableBalance = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: get access key allowance
                return [2 /*return*/, new bn_js_1.default(0)];
            });
        });
    };
    KeypomWallet.prototype.getAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountObj;
            return __generator(this, function (_a) {
                if (this.trialAccountId != undefined && this.trialAccountId != null) {
                    accountObj = new near_api_js_1.Account(this.near.connection, this.trialAccountId);
                    return [2 /*return*/, [accountObj]];
                }
                return [2 /*return*/, []];
            });
        });
    };
    KeypomWallet.prototype.switchAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    KeypomWallet.prototype.internalSignIn = function (accountId, secretKey) {
        return __awaiter(this, void 0, void 0, function () {
            var dataToWrite, accountObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("internal sign in: ", accountId, " ", secretKey);
                        this.trialAccountId = accountId;
                        this.trialSecretKey = secretKey;
                        dataToWrite = {
                            accountId: accountId,
                            secretKey: secretKey
                        };
                        (0, selector_utils_1.setLocalStorageKeypomEnv)(dataToWrite);
                        return [4 /*yield*/, this.keyStore.setKey(this.networkId, accountId, near_api_js_1.KeyPair.fromString(secretKey))];
                    case 1:
                        _a.sent();
                        // Check if the account exists in the mapping contract. If they do, don't do anything. If they
                        // Don't, add them to the mapping contract
                        (0, selector_utils_1.addUserToMappingContract)(accountId, secretKey);
                        accountObj = new near_api_js_1.Account(this.near.connection, this.trialAccountId);
                        return [2 /*return*/, [accountObj]];
                }
            });
        });
    };
    KeypomWallet.prototype.assertSignedIn = function () {
        if (!this.trialAccountId) {
            throw new Error("Wallet not signed in");
        }
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
