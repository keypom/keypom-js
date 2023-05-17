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
var accounts_1 = require("@near-js/accounts");
var crypto_1 = require("@near-js/crypto");
var keystores_browser_1 = require("@near-js/keystores-browser");
var wallet_account_1 = require("@near-js/wallet-account");
var bn_js_1 = __importDefault(require("bn.js"));
var src_1 = require("../modal/src");
var modal_types_1 = require("../modal/src/lib/modal.types");
var selector_utils_1 = require("../utils/selector-utils");
var types_1 = require("./types");
var core_1 = require("@keypom/core");
var ext_wallets_1 = require("./ext_wallets");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var signInContractId = _a.signInContractId, networkId = _a.networkId, trialAccountSpecs = _a.trialAccountSpecs, instantSignInSpecs = _a.instantSignInSpecs, modalOptions = _a.modalOptions;
        var _this = this;
        this.showModal = function (modalType) {
            if (modalType === void 0) { modalType = { id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER }; }
            console.log('modalType for show modal: ', modalType);
            _this.modal.show(modalType);
        };
        this.checkValidTrialInfo = function () {
            var instantSignInData = _this.instantSignInSpecs !== undefined ? (0, selector_utils_1.parseInstantSignInUrl)(_this.instantSignInSpecs) : undefined;
            var trialData = _this.trialAccountSpecs !== undefined ? (0, selector_utils_1.parseTrialUrl)(_this.trialAccountSpecs) : undefined;
            return instantSignInData !== undefined || trialData !== undefined || (0, selector_utils_1.getLocalStorageKeypomEnv)() !== null;
        };
        console.log('Keypom constructor called.');
        this.signInContractId = signInContractId;
        this.keyStore = new keystores_browser_1.BrowserLocalStorageKeyStore();
        this.near = new wallet_account_1.Near(__assign(__assign({}, core_1.networks[networkId]), { deps: { keyStore: this.keyStore } }));
        var trialSpecs = undefined;
        if (trialAccountSpecs !== undefined) {
            trialSpecs = __assign(__assign({}, trialAccountSpecs), { isMappingAccount: false });
        }
        this.trialAccountSpecs = trialSpecs;
        this.instantSignInSpecs = instantSignInSpecs;
        this.modal = (0, src_1.setupModal)(modalOptions);
        console.log('finished constructor');
    }
    KeypomWallet.prototype.getContractId = function () {
        return this.signInContractId;
    };
    KeypomWallet.prototype.getAccountId = function () {
        this.assertSignedIn();
        return this.accountId;
    };
    KeypomWallet.prototype.isSignedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accountId !== undefined && this.accountId !== null];
            });
        });
    };
    KeypomWallet.prototype.signInTrialAccount = function (accountId, secretKey) {
        return __awaiter(this, void 0, void 0, function () {
            var isOriginalLink, isUnclaimed, e_1, keyInfo, keyPerms, isAdding, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isOriginalLink = (0, selector_utils_1.updateKeypomContractIfValid)(accountId);
                        console.log('isOriginalLink: ', isOriginalLink);
                        if (!isOriginalLink) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, (0, core_1.isUnclaimedTrialDrop)({ keypomContractId: accountId, secretKey: secretKey })];
                    case 2:
                        isUnclaimed = _a.sent();
                        console.log('isUnclaimed: ', isUnclaimed);
                        if (!(isUnclaimed === true)) return [3 /*break*/, 3];
                        this.modal.show({
                            id: modal_types_1.MODAL_TYPE_IDS.BEGIN_TRIAL,
                            meta: {
                                secretKey: secretKey,
                                redirectUrlBase: this.trialAccountSpecs.baseUrl,
                                delimiter: this.trialAccountSpecs.delimiter,
                            }
                        });
                        return [2 /*return*/, []];
                    case 3:
                        // If the drop is claimed, we should attempt to recover the drop
                        console.log('DROP IS CLAIMED. RECOVERY TODO');
                        return [4 /*yield*/, (0, selector_utils_1.getAccountFromMap)(secretKey)];
                    case 4:
                        accountId = _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        console.log('e checking if drop is from keypom: ', e_1);
                        return [3 /*break*/, 7];
                    case 7:
                        _a.trys.push([7, 11, , 12]);
                        return [4 /*yield*/, (0, core_1.viewAccessKeyData)({ accountId: accountId, secretKey: secretKey })];
                    case 8:
                        keyInfo = _a.sent();
                        console.log('keyInfo trial accounts: ', keyInfo);
                        keyPerms = keyInfo.permission.FunctionCall;
                        if (!(keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute'))) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, selector_utils_1.addUserToMappingContract)(accountId, secretKey)];
                    case 9:
                        isAdding = _a.sent();
                        if (isAdding) {
                            this.trialAccountSpecs.isMappingAccount = true;
                        }
                        return [2 /*return*/, this.internalSignIn(accountId, secretKey, types_1.KEYPOM_MODULE_ID)];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        e_2 = _a.sent();
                        console.log('e: ', e_2);
                        return [3 /*break*/, 12];
                    case 12: 
                    // Invalid local storage info so return nothing
                    return [2 /*return*/, []];
                }
            });
        });
    };
    KeypomWallet.prototype.signInInstantAccount = function (accountId, secretKey, moduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var account, allKeys, pk_1, keyInfoView, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        account = new accounts_1.Account(this.near.connection, accountId);
                        return [4 /*yield*/, account.getAccessKeys()];
                    case 1:
                        allKeys = _a.sent();
                        pk_1 = (0, core_1.getPubFromSecret)(secretKey);
                        keyInfoView = allKeys.find(function (_a) {
                            var public_key = _a.public_key;
                            return public_key === pk_1;
                        });
                        console.log("keyInfoView: ".concat(JSON.stringify(keyInfoView)));
                        if (keyInfoView) {
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey, moduleId)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        console.log('e: ', e_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, []];
                }
            });
        });
    };
    KeypomWallet.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var instantSignInData, trialData, curEnvData, _a, accountId, secretKey, moduleId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, core_1.initKeypom)({
                            network: this.near.connection.networkId
                        })];
                    case 1:
                        _b.sent();
                        instantSignInData = this.instantSignInSpecs !== undefined ? (0, selector_utils_1.parseInstantSignInUrl)(this.instantSignInSpecs) : undefined;
                        console.log('instantSignInData: ', instantSignInData);
                        if (instantSignInData !== undefined) {
                            if (ext_wallets_1.SUPPORTED_EXT_WALLET_DATA[this.near.connection.networkId][instantSignInData.moduleId] === undefined) {
                                console.warn("Module ID ".concat(instantSignInData.moduleId, " is not supported on ").concat(this.near.connection.networkId, "."));
                                return [2 /*return*/, []];
                            }
                            return [2 /*return*/, this.signInInstantAccount(instantSignInData.accountId, instantSignInData.secretKey, instantSignInData.moduleId)];
                        }
                        trialData = this.trialAccountSpecs !== undefined ? (0, selector_utils_1.parseTrialUrl)(this.trialAccountSpecs) : undefined;
                        console.log('trialData: ', trialData);
                        if (trialData !== undefined) {
                            return [2 /*return*/, this.signInTrialAccount(trialData.accountId, trialData.secretKey)];
                        }
                        curEnvData = (0, selector_utils_1.getLocalStorageKeypomEnv)();
                        console.log('trial info invalid. Cur env data: ', curEnvData);
                        // If there is any data in local storage, default to that otherwise return empty array
                        if (curEnvData !== null) {
                            _a = JSON.parse(curEnvData), accountId = _a.accountId, secretKey = _a.secretKey, moduleId = _a.moduleId;
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey, moduleId)];
                        }
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
                        if (this.accountId === undefined || this.accountId === null) {
                            throw new Error('Wallet is already signed out');
                        }
                        this.accountId = this.secretKey = this.moduleId = undefined;
                        return [4 /*yield*/, this.keyStore.removeKey(this.near.connection.networkId, this.accountId)];
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
            var receiverId, actions, res, e_4;
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
                                        signerId: this.accountId,
                                        receiverId: receiverId,
                                        actions: actions,
                                    },
                                ],
                            })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        /// user cancelled or near network error
                        console.warn(e_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, res[0]];
                }
            });
        });
    };
    KeypomWallet.prototype.signAndSendTransactions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, res, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('sign and send txns params inner: ', params);
                        this.assertSignedIn();
                        transactions = params.transactions;
                        res = [];
                        if (!(this.moduleId === types_1.KEYPOM_MODULE_ID)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!this.trialAccountSpecs.isMappingAccount) {
                            (0, selector_utils_1.addUserToMappingContract)(this.accountId, this.secretKey);
                        }
                        return [4 /*yield*/, (0, core_1.trialSignAndSendTxns)({
                                trialAccountId: this.accountId,
                                trialAccountSecretKey: this.secretKey,
                                txns: transactions
                            })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        console.log("e: ".concat(JSON.stringify(e_5)));
                        switch (e_5) {
                            case core_1.TRIAL_ERRORS.EXIT_EXPECTED: {
                                this.modal.show({
                                    id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER,
                                    meta: {
                                        accountId: this.accountId,
                                        secretKey: this.secretKey
                                    }
                                });
                                break;
                            }
                            case core_1.TRIAL_ERRORS.INVALID_ACTION: {
                                this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.ACTION_ERROR });
                                break;
                            }
                            case core_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE: {
                                this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.INSUFFICIENT_BALANCE });
                                break;
                            }
                            default: {
                                console.log('Unidentified error when signing txn: ', e_5);
                                break;
                            }
                        }
                        return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, (0, ext_wallets_1.extSignAndSendTransactions)({
                            transactions: transactions,
                            moduleId: this.moduleId,
                            accountId: this.accountId,
                            secretKey: this.secretKey,
                            near: this.near
                        })];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        console.log('res sign & send txn: ', res);
                        return [2 /*return*/, res];
                }
            });
        });
    };
    KeypomWallet.prototype.verifyOwner = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error('KeypomWallet:verifyOwner is deprecated');
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
                if (this.accountId != undefined && this.accountId != null) {
                    accountObj = new accounts_1.Account(this.near.connection, this.accountId);
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
    KeypomWallet.prototype.internalSignIn = function (accountId, secretKey, moduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var dataToWrite, accountObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("internalSignIn accountId ".concat(accountId, " secretKey ").concat(secretKey, " moduleId ").concat(moduleId));
                        this.accountId = accountId;
                        this.secretKey = secretKey;
                        this.moduleId = moduleId;
                        dataToWrite = {
                            accountId: accountId,
                            secretKey: secretKey,
                            moduleId: moduleId
                        };
                        (0, selector_utils_1.setLocalStorageKeypomEnv)(dataToWrite);
                        return [4 /*yield*/, this.keyStore.setKey(this.near.connection.networkId, accountId, crypto_1.KeyPair.fromString(secretKey))];
                    case 1:
                        _a.sent();
                        accountObj = new accounts_1.Account(this.near.connection, accountId);
                        return [2 /*return*/, [accountObj]];
                }
            });
        });
    };
    KeypomWallet.prototype.assertSignedIn = function () {
        if (!this.accountId) {
            throw new Error('Wallet not signed in');
        }
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
