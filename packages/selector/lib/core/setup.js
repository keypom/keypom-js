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
exports.setupKeypom = void 0;
var modal_types_1 = require("../modal/src/lib/modal.types");
var types_1 = require("./types");
var wallet_1 = require("./wallet");
var Keypom = function (_a) {
    var store = _a.store, logger = _a.logger, keypomWallet = _a.keypomWallet;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            // return the wallet interface for wallet-selector
            return [2 /*return*/, {
                    get networkId() {
                        return keypomWallet.near.connection.networkId;
                    },
                    getContractId: function () {
                        return keypomWallet.getContractId();
                    },
                    // async getAccount() {
                    // 	return keypomWallet.getAccount();
                    // },
                    showModal: function (modalType) {
                        if (modalType === void 0) { modalType = { id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER }; }
                        keypomWallet.showModal(modalType);
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
function setupKeypom(_a) {
    var _this = this;
    var trialAccountSpecs = _a.trialAccountSpecs, instantSignInSpecs = _a.instantSignInSpecs, networkId = _a.networkId, signInContractId = _a.signInContractId;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        var keypomWallet, shouldSignIn;
        var _this = this;
        return __generator(this, function (_a) {
            // Ensure that the passed in arguments are of type KeypomParams
            if (!(0, types_1.isKeypomParams)({
                signInContractId: signInContractId,
                networkId: networkId,
                trialAccountSpecs: trialAccountSpecs,
                instantSignInSpecs: instantSignInSpecs,
            })) {
                console.warn("KeypomWallet: Invalid KeypomParams passed in. Please check the docs for the correct format.");
                return [2 /*return*/, null];
            }
            if (!signInContractId ||
                !networkId ||
                !(instantSignInSpecs || trialAccountSpecs)) {
                console.warn("KeypomWallet: signInContractId, networkId and either instant sign in specs or trial account specs are required to use the KeypomWallet.");
                return [2 /*return*/, null];
            }
            if (trialAccountSpecs &&
                !(trialAccountSpecs.url.includes("ACCOUNT_ID") ||
                    trialAccountSpecs.url.includes("SECRET_KEY"))) {
                console.warn("KeypomWallet: trial account specs must include ACCOUNT_ID and SECRET_KEY in url");
                return [2 /*return*/, null];
            }
            if (instantSignInSpecs &&
                !(instantSignInSpecs.url.includes("ACCOUNT_ID") ||
                    instantSignInSpecs.url.includes("SECRET_KEY"))) {
                console.warn("KeypomWallet: trial account specs must include ACCOUNT_ID");
                return [2 /*return*/, null];
            }
            keypomWallet = new wallet_1.KeypomWallet({
                signInContractId: signInContractId,
                networkId: networkId,
                trialAccountSpecs: trialAccountSpecs,
                instantSignInSpecs: instantSignInSpecs,
            });
            shouldSignIn = keypomWallet.checkValidTrialInfo();
            console.log("shouldSignIn: ", shouldSignIn);
            return [2 /*return*/, {
                    id: types_1.KEYPOM_MODULE_ID,
                    type: "instant-link",
                    metadata: {
                        name: "Keypom Account",
                        description: null,
                        iconUrl: "",
                        deprecated: false,
                        available: true,
                        contractId: signInContractId,
                        runOnStartup: shouldSignIn,
                    },
                    init: function (config) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, Keypom(__assign(__assign({}, config), { keypomWallet: keypomWallet }))];
                        });
                    }); },
                }];
        });
    }); };
}
exports.setupKeypom = setupKeypom;
