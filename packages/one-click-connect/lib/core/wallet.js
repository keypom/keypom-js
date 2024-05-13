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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypomWallet = void 0;
var core_1 = require("@keypom/core");
var accounts_1 = require("@near-js/accounts");
var crypto_1 = require("@near-js/crypto");
var crypto_2 = require("@near-js/crypto");
var keystores_browser_1 = require("@near-js/keystores-browser");
var wallet_account_1 = require("@near-js/wallet-account");
var selector_utils_1 = require("../utils/selector-utils");
var ext_wallets_1 = require("./ext_wallets");
var ONE_CLICK_URL_REGEX = new RegExp("^(.*):accountId(.+):secretKey(.+):walletId(.*)$");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var networkId = _a.networkId, urlPattern = _a.urlPattern;
        var _this = this;
        this.checkValidOneClickParams = function () {
            var _a;
            console.log("CheckValidOneClick");
            var oneClickData = null;
            if (((_a = _this.oneClickConnectSpecs) === null || _a === void 0 ? void 0 : _a.baseUrl) !== undefined) {
                oneClickData = (0, selector_utils_1.parseOneClickSignInFromUrl)(_this.oneClickConnectSpecs);
            }
            if (oneClickData !== null) {
                return oneClickData;
            }
            var localStorageData = (0, selector_utils_1.getLocalStorageKeypomEnv)();
            if (localStorageData !== null) {
                return JSON.parse(localStorageData);
            }
            return null;
        };
        console.log("Initializing OneClick Connect");
        this.keyStore = new keystores_browser_1.BrowserLocalStorageKeyStore();
        this.near = new wallet_account_1.Near(__assign(__assign({}, core_1.networks[networkId]), { deps: { keyStore: this.keyStore } }));
        this.setSpecsFromKeypomParams(urlPattern);
    }
    KeypomWallet.prototype.getContractId = function () {
        return this.contractId || "foo.near";
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
    KeypomWallet.prototype.signInInstantAccount = function (accountId, secretKey, walletId) {
        return __awaiter(this, void 0, void 0, function () {
            var account, allKeys, pk_1, keyInfoView, e_1;
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
                        if (keyInfoView) {
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey, walletId)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.log("e: ", e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, []];
                }
            });
        });
    };
    KeypomWallet.prototype.getLAKContractId = function (accountId, secretKey) {
        return __awaiter(this, void 0, void 0, function () {
            var pk, accessKey, permission, receiver_id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.contractId !== undefined) {
                            return [2 /*return*/, this.contractId];
                        }
                        pk = crypto_1.PublicKey.from((0, core_1.getPubFromSecret)(secretKey));
                        return [4 /*yield*/, this.near.connection.provider.query("access_key/".concat(accountId, "/").concat(pk), "")];
                    case 1:
                        accessKey = _a.sent();
                        permission = accessKey.permission;
                        if (permission.FunctionCall) {
                            receiver_id = permission.FunctionCall.receiver_id;
                            this.contractId = receiver_id;
                            return [2 /*return*/, receiver_id];
                        }
                        this.contractId = "foo.near";
                        return [2 /*return*/, "foo.near"];
                }
            });
        });
    };
    KeypomWallet.prototype.signIn = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var oneClickSignInData, networkId, isModuleSupported, curEnvData, _c, accountId, secretKey, walletId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, core_1.initKeypom)({
                            network: this.near.connection.networkId,
                        })];
                    case 1:
                        _d.sent();
                        oneClickSignInData = ((_a = this.oneClickConnectSpecs) === null || _a === void 0 ? void 0 : _a.baseUrl) !== undefined
                            ? (0, selector_utils_1.parseOneClickSignInFromUrl)(this.oneClickConnectSpecs)
                            : null;
                        if (oneClickSignInData !== null) {
                            networkId = this.near.connection.networkId;
                            isModuleSupported = ((_b = ext_wallets_1.SUPPORTED_EXT_WALLET_DATA[networkId]) === null || _b === void 0 ? void 0 : _b[oneClickSignInData.walletId]) !== undefined;
                            if (!isModuleSupported) {
                                console.warn("Module ID ".concat(oneClickSignInData.walletId, " is not supported on ").concat(networkId, "."));
                                return [2 /*return*/, []];
                            }
                            return [2 /*return*/, this.signInInstantAccount(oneClickSignInData.accountId, oneClickSignInData.secretKey, oneClickSignInData.walletId)];
                        }
                        curEnvData = (0, selector_utils_1.getLocalStorageKeypomEnv)();
                        if (curEnvData !== null) {
                            _c = JSON.parse(curEnvData), accountId = _c.accountId, secretKey = _c.secretKey, walletId = _c.walletId;
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey, walletId)];
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
                            throw new Error("Wallet is already signed out");
                        }
                        this.accountId = this.secretKey = this.walletId = undefined;
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
            var receiverId, actions, res, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertSignedIn();
                        console.log("sign and send txn params: ", params);
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
                        e_2 = _a.sent();
                        /// user cancelled or near network error
                        console.warn(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, res[0]];
                }
            });
        });
    };
    KeypomWallet.prototype.signAndSendTransactions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("sign and send txns params inner: ", params);
                        this.assertSignedIn();
                        transactions = params.transactions;
                        return [4 /*yield*/, (0, ext_wallets_1.extSignAndSendTransactions)({
                                transactions: transactions,
                                walletId: this.walletId,
                                accountId: this.accountId,
                                secretKey: this.secretKey,
                                near: this.near,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
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
                return [2 /*return*/, BigInt(0)];
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
    KeypomWallet.prototype.internalSignIn = function (accountId, secretKey, walletId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dataToWrite, urlStart, accountObj;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("internalSignIn accountId ".concat(accountId, " secretKey ").concat(secretKey, " walletId ").concat(walletId));
                        this.accountId = accountId;
                        this.secretKey = secretKey;
                        this.walletId = walletId;
                        dataToWrite = {
                            accountId: accountId,
                            secretKey: secretKey,
                            walletId: walletId,
                        };
                        (0, selector_utils_1.setLocalStorageKeypomEnv)(dataToWrite);
                        return [4 /*yield*/, this.keyStore.setKey(this.near.connection.networkId, accountId, crypto_2.KeyPair.fromString(secretKey))];
                    case 1:
                        _b.sent();
                        // Assuming the URL pattern follows directly after the domain and possible path
                        // Erase the OneClick Connect URL segment
                        if (window.history && window.history.pushState) {
                            urlStart = window.location.href.split(((_a = this.oneClickConnectSpecs) === null || _a === void 0 ? void 0 : _a.baseUrl) || "#")[0];
                            window.history.pushState({}, "", urlStart);
                        }
                        accountObj = new accounts_1.Account(this.near.connection, accountId);
                        return [2 /*return*/, [accountObj]];
                }
            });
        });
    };
    KeypomWallet.prototype.assertSignedIn = function () {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    };
    KeypomWallet.prototype.setSpecsFromKeypomParams = function (urlPattern) {
        var matches = urlPattern.match(ONE_CLICK_URL_REGEX);
        if (!matches) {
            console.error("Invalid URL pattern. Could not extract necessary parts.");
            return;
        }
        var baseUrl = matches[1];
        var delimiter = matches[2];
        var walletDelimiter = matches[3];
        var restUrl = matches[4]; // Capture any additional URL components after WALLET_ID if necessary
        var oneClickSpecs = {
            urlPattern: urlPattern,
            baseUrl: baseUrl,
            delimiter: delimiter,
            walletDelimiter: walletDelimiter,
            restUrl: restUrl,
        };
        console.log("oneClickSpecs from URL: ", oneClickSpecs);
        this.oneClickConnectSpecs = oneClickSpecs;
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
