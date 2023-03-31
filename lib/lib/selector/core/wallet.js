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
var keypom_1 = require("../../keypom");
var keypom_utils_1 = require("../../keypom-utils");
var src_1 = require("../modal/src");
var modal_types_1 = require("../modal/src/lib/modal.types");
var keypom_lib_1 = require("../utils/keypom-lib");
var types_1 = require("./types");
var KeypomWallet = /** @class */ (function () {
    function KeypomWallet(_a) {
        var signInContractId = _a.signInContractId, networkId = _a.networkId, desiredUrl = _a.desiredUrl, delimiter = _a.delimiter, modalOptions = _a.modalOptions;
        var _this = this;
        this.showModal = function (modalType) {
            if (modalType === void 0) { modalType = { id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER }; }
            console.log('modalType for show modal: ', modalType);
            _this.modal.show(modalType);
        };
        this.checkValidTrialInfo = function () {
            return _this.parseUrl() !== undefined || (0, keypom_lib_1.getLocalStorageKeypomEnv)() != null;
        };
        this.transformTransactions = function (txns) {
            _this.assertSignedIn();
            var account = new near_api_js_1.Account(_this.near.connection, _this.trialAccountId);
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
        this.internalSignIn = function (accountId, secretKey) { return __awaiter(_this, void 0, void 0, function () {
            var keyPair, dataToWrite, accountObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("internal sign in: ", accountId, " ", secretKey);
                        this.trialAccountId = accountId;
                        this.secretKey = secretKey;
                        keyPair = near_api_js_1.KeyPair.fromString(secretKey);
                        this.publicKey = keyPair.getPublicKey();
                        dataToWrite = {
                            accountId: this.trialAccountId,
                            secretKey: this.secretKey
                        };
                        (0, keypom_lib_1.setLocalStorageKeypomEnv)(dataToWrite);
                        return [4 /*yield*/, this.keyStore.setKey(this.networkId, this.trialAccountId, near_api_js_1.KeyPair.fromString(this.secretKey))];
                    case 1:
                        _a.sent();
                        accountObj = new near_api_js_1.Account(this.near.connection, this.trialAccountId);
                        return [2 /*return*/, [accountObj]];
                }
            });
        }); };
        this.canExitTrial = function () { return __awaiter(_this, void 0, void 0, function () {
            var viewCall, keyInfo, rules, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewCall = (0, keypom_1.getEnv)().viewCall;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, viewCall({
                                contractId: this.trialAccountId,
                                methodName: 'get_key_information',
                                args: {}
                            })];
                    case 2:
                        keyInfo = _a.sent();
                        console.log("keyInfo: ", keyInfo);
                        return [4 /*yield*/, viewCall({
                                contractId: this.trialAccountId,
                                methodName: 'get_rules',
                                args: {}
                            })];
                    case 3:
                        rules = _a.sent();
                        console.log('rules: ', rules);
                        return [2 /*return*/, keyInfo.trial_data.exit == true];
                    case 4:
                        e_1 = _a.sent();
                        console.log('error: ', e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, false];
                }
            });
        }); };
        this.validateTransactions = function (toValidate) { return __awaiter(_this, void 0, void 0, function () {
            var viewCall, validInfo, rules, contracts, amounts, methods, i, e_2, i, transaction, validInfoForReceiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewCall = (0, keypom_1.getEnv)().viewCall;
                        console.log('toValidate: ', toValidate);
                        validInfo = {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, viewCall({
                                contractId: this.trialAccountId,
                                methodName: 'get_rules',
                                args: {}
                            })];
                    case 2:
                        rules = _a.sent();
                        contracts = rules.contracts.split(",");
                        amounts = rules.amounts.split(",");
                        methods = rules.methods.split(",");
                        for (i = 0; i < contracts.length; i++) {
                            validInfo[contracts[i]] = {
                                maxDeposit: amounts[i],
                                allowableMethods: methods[i] == "*" ? "*" : methods[i].split(":")
                            };
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.log('error: ', e_2);
                        return [3 /*break*/, 4];
                    case 4:
                        console.log('validInfo after view calls: ', validInfo);
                        // Loop through each transaction in the array
                        for (i = 0; i < toValidate.length; i++) {
                            transaction = toValidate[i];
                            console.log('transaction: ', transaction);
                            validInfoForReceiver = validInfo[transaction.receiverId];
                            console.log('validInfoForReceiver: ', validInfoForReceiver);
                            // Check if the contractId is valid
                            if (!validInfoForReceiver) {
                                console.log('!validInfo[transaction.receiverId]: ', !validInfo[transaction.receiverId]);
                                return [2 /*return*/, false];
                            }
                            // Check if the method name is valid
                            if (validInfoForReceiver.allowableMethods != "*" && !validInfoForReceiver.allowableMethods.includes(transaction.methodName)) {
                                console.log('!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ', !validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName));
                                return [2 /*return*/, false];
                            }
                            // Check if the deposit is valid
                            if (validInfoForReceiver.maxDeposit != "*" && new bn_js_1.default(transaction.deposit).gt(new bn_js_1.default(validInfoForReceiver.maxDeposit))) {
                                console.log('new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ', new bn_js_1.default(transaction.deposit).gt(new bn_js_1.default(validInfo[transaction.receiverId].maxDeposit)));
                                return [2 /*return*/, false];
                            }
                        }
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.parseUrl = function () {
            var split = window.location.href.split(_this.desiredUrl);
            if (split.length != 2) {
                return;
            }
            var trialInfo = split[1];
            var _a = trialInfo.split(_this.delimiter), accountId = _a[0], secretKey = _a[1];
            if (!accountId || !secretKey) {
                return;
            }
            return {
                accountId: accountId,
                secretKey: secretKey
            };
        };
        console.log('Keypom constructor called.');
        this.networkId = networkId;
        this.signInContractId = signInContractId;
        this.keyStore = new browser_local_storage_key_store_1.BrowserLocalStorageKeyStore();
        this.near = new near_api_js_1.Near(__assign(__assign({}, keypom_lib_1.networks[networkId]), { deps: { keyStore: this.keyStore } }));
        this.desiredUrl = desiredUrl;
        this.delimiter = delimiter;
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
    KeypomWallet.prototype.assertSignedIn = function () {
        if (!this.trialAccountId) {
            throw new Error("Wallet not signed in");
        }
    };
    KeypomWallet.prototype.isSignedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trialAccountId != undefined && this.trialAccountId != null];
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
                        if (this.trialAccountId == undefined || this.trialAccountId == null) {
                            throw new Error("Wallet is already signed out");
                        }
                        this.trialAccountId = this.trialAccountId = this.secretKey = this.publicKey = undefined;
                        return [4 /*yield*/, this.keyStore.removeKey(this.networkId, this.trialAccountId)];
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
    KeypomWallet.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parsedData, accountId, secretKey, isOriginalLink, isUnclaimed, e_3, keyInfo, keyPerms, e_4, curEnvData, _a, accountId, secretKey;
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
                        if (!(parsedData !== undefined)) return [3 /*break*/, 8];
                        accountId = parsedData.accountId, secretKey = parsedData.secretKey;
                        isOriginalLink = (0, keypom_lib_1.isKeypomDrop)(this.networkId, accountId);
                        console.log("isOriginalLink: ", isOriginalLink);
                        if (!isOriginalLink) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, keypom_lib_1.isUnclaimedTrialDrop)(this.networkId, accountId, secretKey)];
                    case 3:
                        isUnclaimed = _b.sent();
                        console.log("isUnclaimed: ", isUnclaimed);
                        // If the drop is unclaimed, we should show the unclaimed drop modal
                        if (isUnclaimed === true) {
                            this.modal.show({
                                id: modal_types_1.MODAL_TYPE_IDS.CLAIM_TRIAL,
                                meta: {
                                    secretKey: secretKey,
                                    redirectUrlBase: this.desiredUrl,
                                    delimiter: this.delimiter
                                }
                            });
                            return [2 /*return*/, []];
                        }
                        else {
                            // If the drop is claimed, we should attempt to recover the drop
                            console.log("DROP IS CLAIMED. RECOVERY TODO");
                            accountId = "foobar";
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _b.sent();
                        console.log('e checking if drop is from keypom: ', e_3);
                        return [3 /*break*/, 5];
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, (0, keypom_utils_1.viewAccessKeyData)({ accountId: accountId, secretKey: secretKey })];
                    case 6:
                        keyInfo = _b.sent();
                        keyPerms = keyInfo.permission.FunctionCall;
                        console.log('keyPerms: ', keyPerms);
                        // Check if accountKeys's length is 1 and it has a `public_key` field
                        if (keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')) {
                            return [2 /*return*/, this.internalSignIn(accountId, secretKey)];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        e_4 = _b.sent();
                        console.log('e: ', e_4);
                        return [3 /*break*/, 8];
                    case 8:
                        curEnvData = (0, keypom_lib_1.getLocalStorageKeypomEnv)();
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
    KeypomWallet.prototype.signAndSendTransaction = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var receiverId, actions, res, e_5;
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
                        e_5 = _a.sent();
                        /// user cancelled or near network error
                        console.warn(e_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, res[0]];
                }
            });
        });
    };
    KeypomWallet.prototype.signAndSendTransactions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, shouldExit, _a, args, toValidate, res, account, incomingGas, numActions, i, transaction, j, action, gasToAdd, gasToAttach, transformedTransactions, promises;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('sign and send txns params inner: ', params);
                        this.assertSignedIn();
                        transactions = params.transactions;
                        console.log('transactions: ', transactions);
                        return [4 /*yield*/, this.canExitTrial()];
                    case 1:
                        shouldExit = _b.sent();
                        if (shouldExit == true) {
                            this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER });
                            return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                        }
                        _a = (0, keypom_utils_1.genArgs)({ transactions: transactions }), args = _a.wrapped, toValidate = _a.toValidate;
                        return [4 /*yield*/, this.validateTransactions(toValidate)];
                    case 2:
                        res = _b.sent();
                        console.log('res from validate transactions: ', res);
                        if (res == false) {
                            this.modal.show({ id: modal_types_1.MODAL_TYPE_IDS.ERROR });
                            return [2 /*return*/, [types_1.FAILED_EXECUTION_OUTCOME]];
                        }
                        console.log('args: ', args);
                        return [4 /*yield*/, this.near.account(this.trialAccountId)];
                    case 3:
                        account = _b.sent();
                        incomingGas = new bn_js_1.default("0");
                        numActions = 0;
                        try {
                            for (i = 0; i < args.transactions.length; i++) {
                                transaction = args.transactions[i];
                                console.log('transaction in gas loop: ', transaction);
                                for (j = 0; j < transaction.actions.length; j++) {
                                    action = transaction.actions[j];
                                    console.log('action in gas loop: ', action);
                                    gasToAdd = action.params["|kP|gas"].split("|kS|")[0].toString();
                                    console.log('gasToAdd: ', gasToAdd);
                                    incomingGas = incomingGas.add(new bn_js_1.default(gasToAdd));
                                    numActions += 1;
                                }
                            }
                        }
                        catch (e) {
                            numActions = 1;
                            console.log('e: ', e);
                            incomingGas = new bn_js_1.default("300000000000000");
                        }
                        console.log('incomingGas: ', incomingGas.toString());
                        gasToAttach = new bn_js_1.default('15000000000000') // Loading rules
                            .add(new bn_js_1.default('20000000000000')) // Callback
                            .add(new bn_js_1.default('15000000000000').mul(new bn_js_1.default(numActions))) // Actions
                            .add(incomingGas).toString();
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
                    case 4:
                        transformedTransactions = _b.sent();
                        console.log("debugging");
                        console.log('transformedTransactions: ', transformedTransactions);
                        promises = transformedTransactions.map(function (tx) { return account.signAndSendTransaction(tx); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 5: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return KeypomWallet;
}());
exports.KeypomWallet = KeypomWallet;
