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
exports.KeypomWallet = void 0;
var nearAPI = __importStar(require("near-api-js"));
var selector_utils_1 = require("../utils/selector-utils");
var ext_wallets_1 = require("./ext_wallets");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var networkId = _a.networkId, accountId = _a.accountId, secretKey = _a.secretKey, walletId = _a.walletId, baseUrl = _a.baseUrl;
        this.networkId = networkId;
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.walletId = walletId;
        this.baseUrl = baseUrl;
        this.signedIn = false;
    }
    KeypomWallet.prototype.getAccountId = function () {
        return this.accountId;
    };
    KeypomWallet.prototype.isSignedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accountId !== undefined && this.accountId !== null];
            });
        });
    };
    KeypomWallet.prototype.getContractId = function () {
        return this.contractId || selector_utils_1.NO_CONTRACT_ID;
    };
    KeypomWallet.prototype.setContractId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pk, accessKey, permission, receiver_id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.contractId !== undefined) {
                            return [2 /*return*/, this.contractId];
                        }
                        if (this.secretKey === undefined) {
                            return [2 /*return*/, selector_utils_1.NO_CONTRACT_ID];
                        }
                        pk = (0, selector_utils_1.getPubFromSecret)(this.secretKey);
                        return [4 /*yield*/, this.nearConnection.connection.provider.query("access_key/".concat(this.accountId, "/").concat(pk), "")];
                    case 1:
                        accessKey = _a.sent();
                        permission = accessKey.permission;
                        if (permission.FunctionCall) {
                            receiver_id = permission.FunctionCall.receiver_id;
                            this.contractId = receiver_id;
                            return [2 /*return*/, receiver_id];
                        }
                        this.contractId = selector_utils_1.NO_CONTRACT_ID;
                        return [2 /*return*/, selector_utils_1.NO_CONTRACT_ID];
                }
            });
        });
    };
    KeypomWallet.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connect, keyStores, networkPreset, connectionConfig, nearConnection, account, allKeys, pk_1, keyInfoView, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connect = nearAPI.connect, keyStores = nearAPI.keyStores;
                        networkPreset = (0, selector_utils_1.getNetworkPreset)(this.networkId);
                        connectionConfig = {
                            networkId: this.networkId,
                            keyStore: new keyStores.BrowserLocalStorageKeyStore(),
                            nodeUrl: networkPreset.nodeUrl,
                            headers: {},
                        };
                        return [4 /*yield*/, connect(connectionConfig)];
                    case 1:
                        nearConnection = _a.sent();
                        this.nearConnection = nearConnection;
                        if (!(this.secretKey !== undefined)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.setContractId()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, nearConnection.account(this.accountId)];
                    case 4:
                        account = _a.sent();
                        return [4 /*yield*/, account.getAccessKeys()];
                    case 5:
                        allKeys = _a.sent();
                        pk_1 = (0, selector_utils_1.getPubFromSecret)(this.secretKey);
                        keyInfoView = allKeys.find(function (_a) {
                            var public_key = _a.public_key;
                            return public_key === pk_1;
                        });
                        if (keyInfoView) {
                            return [2 /*return*/, this.internalSignIn(this.accountId, this.walletId, this.secretKey)];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        console.log("e: ", e_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, []];
                }
            });
        });
    };
    KeypomWallet.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.signedIn === false) {
                            throw new Error("Wallet is already signed out");
                        }
                        this.signedIn = false;
                        return [4 /*yield*/, this.nearConnection.keyStore.removeKey(this.networkId, this.accountId)];
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
                        if (this.signedIn === false) {
                            throw new Error("Wallet is not signed in");
                        }
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
                        if (this.signedIn === false) {
                            throw new Error("Wallet is not signed in");
                        }
                        transactions = params.transactions;
                        return [4 /*yield*/, (0, ext_wallets_1.extSignAndSendTransactions)({
                                transactions: transactions,
                                walletId: this.walletId,
                                accountId: this.accountId,
                                secretKey: this.secretKey,
                                near: this.nearConnection,
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
            return __generator(this, function (_a) {
                if (this.signedIn === true) {
                    return [2 /*return*/, [
                            {
                                accountId: this.accountId,
                                walletId: this.walletId,
                                publicKey: this.secretKey && (0, selector_utils_1.getPubFromSecret)(this.secretKey),
                            },
                        ]];
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
    KeypomWallet.prototype.internalSignIn = function (accountId, walletId, secretKey) {
        return __awaiter(this, void 0, void 0, function () {
            var dataToWrite, urlStart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("internalSignIn accountId ".concat(accountId, " secretKey ").concat(secretKey, " walletId ").concat(walletId));
                        this.signedIn = true;
                        dataToWrite = {
                            accountId: accountId,
                            secretKey: secretKey,
                            walletId: walletId,
                        };
                        (0, selector_utils_1.setLocalStorageKeypomEnv)(dataToWrite);
                        if (!secretKey) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.nearConnection.keyStore.setKey(this.networkId, accountId, nearAPI.KeyPair.fromString(secretKey))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Assuming the URL pattern follows directly after the domain and possible path
                        // Erase the OneClick Connect URL segment
                        if (window.history && window.history.pushState) {
                            urlStart = window.location.href.split(this.baseUrl)[0];
                            window.history.pushState({}, "", urlStart);
                        }
                        return [2 /*return*/, [
                                {
                                    accountId: this.accountId,
                                    walletId: this.walletId,
                                    publicKey: this.secretKey && (0, selector_utils_1.getPubFromSecret)(this.secretKey),
                                },
                            ]];
                }
            });
        });
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
