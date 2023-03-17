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
var serialize_1 = require("near-api-js/lib/utils/serialize");
var src_1 = require("../modal/src");
var modal_1 = require("../modal/src/lib/modal");
var keypom_lib_1 = require("../utils/keypom-lib");
var keypom_v2_utils_1 = require("../utils/keypom-v2-utils");
var types_1 = require("./types");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var contractId = _a.contractId, networkId = _a.networkId, desiredUrl = _a.desiredUrl, delimiter = _a.delimiter, modalOptions = _a.modalOptions;
        var _this = this;
        this.showModal = function () {
            var _a;
            (_a = _this.modal) === null || _a === void 0 ? void 0 : _a.show();
        };
        this.checkValidTrialInfo = function () {
            return _this.parseUrl() !== undefined || (0, keypom_lib_1.getLocalStorageKeypomEnv)() != null;
        };
        this.transformTransactions = function (txns) {
            _this.assertSignedIn();
            var account = new near_api_js_1.Account(_this.near.connection, _this.accountId);
            var _a = account.connection, networkId = _a.networkId, signer = _a.signer, provider = _a.provider;
            return Promise.all(txns.map(function (transaction, index) { return __awaiter(_this, void 0, void 0, function () {
                var actions, block, accessKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions = transaction.actions.map(function (action) {
                                return (0, keypom_lib_1.createAction)(action);
                            });
                            console.log('actions: ', actions);
                            return [4 /*yield*/, provider.block({ finality: "final" })];
                        case 1:
                            block = _a.sent();
                            console.log('block: ', block);
                            return [4 /*yield*/, provider.query("access_key/".concat(account.accountId, "/").concat(this.publicKey), "")];
                        case 2:
                            accessKey = _a.sent();
                            console.log('accessKey: ', accessKey);
                            return [2 /*return*/, near_api_js_1.transactions.createTransaction(account.accountId, this.publicKey, transaction.receiverId, accessKey.nonce + index + 1, actions, (0, serialize_1.base_decode)(block.header.hash))];
                    }
                });
            }); }));
        };
        this.parseUrl = function () {
            /// TODO validation
            var split = window.location.href.split(_this.desiredUrl);
            if (split.length != 2) {
                return;
            }
            var trialInfo = split[1];
            var _a = trialInfo.split(_this.delimiter), trialAccountId = _a[0], trialSecretKey = _a[1];
            console.log('trialAccountId: ', trialAccountId);
            console.log('trialSecretKey: ', trialSecretKey);
            if (!trialAccountId || !trialSecretKey) {
                return;
            }
            return {
                trialAccountId: trialAccountId,
                trialSecretKey: trialSecretKey
            };
        };
        console.log('Keypom constructor called.');
        this.networkId = networkId;
        this.contractId = contractId;
        this.keyStore = new browser_local_storage_key_store_1.BrowserLocalStorageKeyStore();
        this.near = new near_api_js_1.Near(__assign(__assign({}, keypom_lib_1.networks[networkId]), { deps: { keyStore: this.keyStore } }));
        this.desiredUrl = desiredUrl;
        this.delimiter = delimiter;
        console.log("finished constructor");
        this.modal = undefined;
        this.modalOptions = modalOptions;
    }
    KeypomWallet.prototype.getContractId = function () {
        return this.contractId;
    };
    KeypomWallet.prototype.getAccountId = function () {
        this.assertSignedIn();
        return this.accountId;
    };
    KeypomWallet.prototype.tryInitFromLocalStorage = function (data) {
        if ((data === null || data === void 0 ? void 0 : data.accountId) && (data === null || data === void 0 ? void 0 : data.secretKey) && (data === null || data === void 0 ? void 0 : data.keypomContractId)) {
            this.accountId = data.accountId;
            this.secretKey = data.secretKey;
            var keyPair = near_api_js_1.KeyPair.fromString(data.secretKey);
            console.log('Setting keyPair in try init: ', keyPair);
            this.publicKey = keyPair.getPublicKey();
            return true;
        }
        return false;
    };
    KeypomWallet.prototype.assertSignedIn = function () {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    };
    KeypomWallet.prototype.isSignedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accountId != undefined && this.accountId != null];
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
    KeypomWallet.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.accountId == undefined || this.accountId == null) {
                            throw new Error("Wallet is already signed out");
                        }
                        this.accountId = this.accountId = this.secretKey = this.publicKey = undefined;
                        return [4 /*yield*/, this.keyStore.removeKey(this.networkId, this.accountId)];
                    case 1:
                        _a.sent();
                        localStorage.removeItem("".concat(keypom_lib_1.KEYPOM_LOCAL_STORAGE_KEY, ":envData"));
                        return [2 /*return*/];
                }
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
                    accountObj = new near_api_js_1.Account(this.near.connection, this.accountId);
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
    KeypomWallet.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isValidTrialInfo, parsedData, trialAccountId, trialSecretKey, keyPair, publicKey, accountObj_1, accountKeys, e_1, dataToWrite, curEnvData, _a, accountId, secretKey, keyPair, publicKey, accountObj;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("IM SIGNING IN");
                        isValidTrialInfo = false;
                        parsedData = this.parseUrl();
                        console.log('parsedData: ', parsedData);
                        if (!(parsedData !== undefined)) return [3 /*break*/, 5];
                        trialAccountId = parsedData.trialAccountId, trialSecretKey = parsedData.trialSecretKey;
                        keyPair = void 0;
                        publicKey = void 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        accountObj_1 = new near_api_js_1.Account(this.near.connection, trialAccountId);
                        keyPair = near_api_js_1.KeyPair.fromString(trialSecretKey);
                        publicKey = keyPair.getPublicKey();
                        console.log('publicKey: ', publicKey.toString());
                        return [4 /*yield*/, accountObj_1.getAccessKeys()];
                    case 2:
                        accountKeys = _b.sent();
                        console.log('accountKeys: ', accountKeys);
                        // Check if accountKeys's length is 1 and it has a `public_key` field
                        isValidTrialInfo = accountKeys[0].public_key == publicKey.toString();
                        console.log('isValidTrialInfo: ', isValidTrialInfo);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        isValidTrialInfo = false;
                        console.log('e: ', e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        // If the trial info is valid (i.e the account ID & secret key exist)
                        if (isValidTrialInfo) {
                            this.accountId = trialAccountId;
                            this.secretKey = trialSecretKey;
                            this.publicKey = publicKey;
                            dataToWrite = {
                                accountId: this.accountId,
                                secretKey: this.secretKey
                            };
                            console.log('Trial info valid - setting data', dataToWrite);
                            (0, keypom_lib_1.setLocalStorageKeypomEnv)(dataToWrite);
                        }
                        _b.label = 5;
                    case 5:
                        // If anything went wrong (URL invalid or account doesn't exist or secret key doesn't belong)
                        // We can check current local storage data
                        if (!isValidTrialInfo) {
                            curEnvData = (0, keypom_lib_1.getLocalStorageKeypomEnv)();
                            console.log('trial info invalid. Cur env data: ', curEnvData);
                            // If there is any
                            if (curEnvData != null) {
                                _a = JSON.parse(curEnvData), accountId = _a.accountId, secretKey = _a.secretKey;
                                this.accountId = accountId;
                                this.secretKey = secretKey;
                                keyPair = near_api_js_1.KeyPair.fromString(secretKey);
                                publicKey = keyPair.getPublicKey();
                                this.publicKey = publicKey;
                                isValidTrialInfo = true;
                                console.log('Valid trial info from cur env data. Setting data');
                            }
                        }
                        if (!isValidTrialInfo) {
                            console.log("no valid trial info. returning");
                            return [2 /*return*/, []];
                        }
                        console.log("auto signing in!");
                        return [4 /*yield*/, this.keyStore.setKey(this.networkId, this.accountId, near_api_js_1.KeyPair.fromString(this.secretKey))];
                    case 6:
                        _b.sent();
                        this.modal = (0, src_1.setupModal)(this.modalOptions);
                        accountObj = new near_api_js_1.Account(this.near.connection, this.accountId);
                        return [2 /*return*/, [accountObj]];
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
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transactions, _b, args, toValidate, res, account, incomingGas, gasToAttach, transformedTransactions, promises;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('sign and send txns params inner: ', params);
                        this.assertSignedIn();
                        transactions = params.transactions;
                        console.log('transactions: ', transactions);
                        _b = (0, keypom_v2_utils_1.genArgs)({ transactions: transactions }), args = _b.wrapped, toValidate = _b.toValidate;
                        return [4 /*yield*/, (0, keypom_lib_1.validateTransactions)(toValidate, this.accountId)];
                    case 1:
                        res = _c.sent();
                        console.log('res from validate transactions: ', res);
                        if (res == false) {
                            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.show(modal_1.MODAL_TYPE.ERROR);
                            return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                        }
                        console.log('args: ', args);
                        return [4 /*yield*/, this.near.account(this.accountId)];
                    case 2:
                        account = _c.sent();
                        try {
                            incomingGas = args.transactions[0].actions[0].params["|kP|gas"].split("|kS|")[0].toString();
                        }
                        catch (e) {
                            console.log('e: ', e);
                            incomingGas = "200000000000000";
                        }
                        console.log('incomingGas: ', incomingGas);
                        gasToAttach = new bn_js_1.default('35000000000000').add(new bn_js_1.default(incomingGas)).toString();
                        // check if the gas to attach is over 300 TGas and if it is, clamp it
                        if (new bn_js_1.default(gasToAttach).gt(new bn_js_1.default('300000000000000'))) {
                            console.log('gas to attach is over 300 TGas. Clamping it');
                            gasToAttach = '300000000000000';
                        }
                        return [4 /*yield*/, this.transformTransactions([{
                                    receiverId: account.accountId,
                                    actions: [{
                                            type: 'FunctionCall',
                                            params: {
                                                methodName: 'execute',
                                                args: args,
                                                gas: gasToAttach,
                                            }
                                        }]
                                }])];
                    case 3:
                        transformedTransactions = _c.sent();
                        console.log("debugging");
                        console.log('transformedTransactions: ', transformedTransactions);
                        promises = transformedTransactions.map(function (tx) { return account.signAndSendTransaction(tx); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
