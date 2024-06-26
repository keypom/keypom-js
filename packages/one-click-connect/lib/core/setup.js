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
exports.setupOneClickConnect = void 0;
var nearAPI = __importStar(require("near-api-js"));
var selector_utils_1 = require("../utils/selector-utils");
var wallet_1 = require("./wallet");
var Keypom = function (_a) {
    var store = _a.store, logger = _a.logger, keypomWallet = _a.keypomWallet;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            // return the wallet interface for wallet-selector
            return [2 /*return*/, {
                    get networkId() {
                        return keypomWallet.networkId;
                    },
                    getContractId: function () {
                        return keypomWallet.getContractId();
                    },
                    // async getAccount() {
                    // 	return keypomWallet.getAccount();
                    // },
                    showModal: function () {
                        return;
                    },
                    getAccounts: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                logger.log("Keypom:account");
                                return [2 /*return*/, keypomWallet.getAccounts()];
                            });
                        });
                    },
                    switchAccount: function (id) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, keypomWallet.switchAccount(id)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    getAccountId: function () {
                        logger.log("Keypom:getAccountId");
                        return keypomWallet.getAccountId();
                    },
                    isSignedIn: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger.log("Keypom:isSignedIn");
                                        return [4 /*yield*/, keypomWallet.isSignedIn()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    getAvailableBalance: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger.log("Keypom:isSignedIn");
                                        return [4 /*yield*/, keypomWallet.getAvailableBalance()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    verifyOwner: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                throw Error("KeypomWallet:verifyOwner is deprecated");
                            });
                        });
                    },
                    signIn: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger.log("Keypom:signIn");
                                        return [4 /*yield*/, keypomWallet.signIn()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    signOut: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger.log("Keypom:signOut");
                                        return [4 /*yield*/, keypomWallet.signOut()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    signAndSendTransaction: function (params) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, keypomWallet.signAndSendTransaction(params)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                    signAndSendTransactions: function (params) {
                        return __awaiter(this, void 0, void 0, function () {
                            var transactions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        transactions = params.transactions.map(function (tx) {
                                            return __assign(__assign({}, tx), { signerId: tx.signerId || keypomWallet.getAccountId() });
                                        });
                                        logger.log("Keypom:signAndSendTransactions", params);
                                        return [4 /*yield*/, keypomWallet.signAndSendTransactions({ transactions: transactions })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    },
                }];
        });
    });
};
function setupOneClickConnect(params) {
    var _this = this;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        var networkId, contractId, allowance, methodNames, connect, keyStores, networkPreset, keyStore, connectionConfig, nearConnection, signInData, keypomWallet;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    networkId = params.networkId, contractId = params.contractId, allowance = params.allowance, methodNames = params.methodNames;
                    console.log("this is real, here is my allowance: ", allowance);
                    connect = nearAPI.connect, keyStores = nearAPI.keyStores;
                    networkPreset = (0, selector_utils_1.getNetworkPreset)(networkId);
                    keyStore = new keyStores.BrowserLocalStorageKeyStore();
                    connectionConfig = {
                        networkId: networkId,
                        keyStore: keyStore,
                        nodeUrl: networkPreset.nodeUrl,
                        headers: {},
                    };
                    return [4 /*yield*/, connect(connectionConfig)];
                case 1:
                    nearConnection = _a.sent();
                    return [4 /*yield*/, (0, selector_utils_1.tryGetSignInData)({
                            networkId: networkId,
                            nearConnection: nearConnection,
                        })];
                case 2:
                    signInData = _a.sent();
                    console.log("Sign in data: ", signInData);
                    if (signInData === null) {
                        return [2 /*return*/, null];
                    }
                    keypomWallet = new wallet_1.KeypomWallet({
                        networkId: networkId,
                        nearConnection: nearConnection,
                        keyStore: keyStore,
                        accountId: signInData.accountId,
                        secretKey: signInData.secretKey,
                        walletId: signInData.walletId,
                        baseUrl: signInData.baseUrl,
                        walletUrl: signInData.walletUrl,
                        contractId: contractId,
                        methodNames: methodNames,
                        allowance: allowance,
                        chainId: signInData.chainId,
                        addKey: signInData.addKey,
                    });
                    console.log("current keypom wallet: ", keypomWallet);
                    return [4 /*yield*/, keypomWallet.setContractId(contractId)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, {
                            id: "keypom",
                            type: "instant-link",
                            metadata: {
                                name: "Keypom Account",
                                description: null,
                                iconUrl: "",
                                deprecated: false,
                                available: true,
                                contractId: contractId,
                                runOnStartup: true,
                            },
                            init: function (config) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, Keypom(__assign(__assign({}, config), { keypomWallet: keypomWallet }))];
                                });
                            }); },
                        }];
            }
        });
    }); };
}
exports.setupOneClickConnect = setupOneClickConnect;
