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
        while (_) try {
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
exports.signAndSendTransactions = exports.signOut = exports.signIn = exports.getAccount = exports.initConnection = exports.autoSignIn = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, Account = nearAPI.Account, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, _a = nearAPI.transactions, addKey = _a.addKey, deleteKey = _a.deleteKey, functionCallAccessKey = _a.functionCallAccessKey, utils = nearAPI.utils, nearTransactions = nearAPI.transactions, _b = nearAPI.utils, PublicKey = _b.PublicKey, _c = _b.format, parseNearAmount = _c.parseNearAmount, formatNearAmount = _c.formatNearAmount;
var bn_js_1 = require("bn.js");
var gas = '200000000000000';
var networks = {
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
    },
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
    }
};
var near, connection, logger, account, accountId, networkId, keyPair, publicKey;
var autoSignIn = function () { return __awaiter(void 0, void 0, void 0, function () {
    var secretKey;
    return __generator(this, function (_a) {
        secretKey = window.location.href.split('#/keypom/')[1];
        keyPair = KeyPair.fromString(secretKey);
        publicKey = PublicKey.fromString(keyPair.publicKey.toString());
        accountId = publicKey.data.toString('hex');
        localStorage.setItem("near-api-js:keystore:".concat(accountId, ":testnet"), "ed25519:".concat(secretKey));
        localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}");
        localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"");
        return [2 /*return*/];
    });
}); };
exports.autoSignIn = autoSignIn;
var initConnection = function (network, logFn) {
    networkId = network.networkId;
    var network = networks[networkId];
    var keyStore = new BrowserLocalStorageKeyStore();
    keyStore.setKey(networkId, accountId, keyPair);
    near = new Near(__assign(__assign({}, network), { deps: { keyStore: keyStore } }));
    connection = near.connection;
    account = new Account(connection, accountId);
};
exports.initConnection = initConnection;
var getAccount = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, ({ accountId: accountId })];
}); }); };
exports.getAccount = getAccount;
var signIn = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, account];
}); }); };
exports.signIn = signIn;
var signOut = function () { };
exports.signOut = signOut;
var signAndSendTransactions = function (_a) {
    var transactions = _a.transactions;
    return __awaiter(void 0, void 0, void 0, function () {
        var transformedTransactions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!account) {
                        throw new Error("Wallet not signed in");
                    }
                    return [4 /*yield*/, transformTransactions(transactions)];
                case 1:
                    transformedTransactions = _b.sent();
                    return [4 /*yield*/, account.sendMoney(accountId, parseNearAmount('0.42'))];
                case 2: return [2 /*return*/, [_b.sent()]];
            }
        });
    });
};
exports.signAndSendTransactions = signAndSendTransactions;
var transformTransactions = function (transactions) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, networkId, signer, provider;
    return __generator(this, function (_b) {
        _a = account.connection, networkId = _a.networkId, signer = _a.signer, provider = _a.provider;
        return [2 /*return*/, Promise.all(transactions.map(function (transaction, index) { return __awaiter(void 0, void 0, void 0, function () {
                var actions, block;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions = transaction.actions.map(function (action) {
                                return createAction(action);
                            });
                            return [4 /*yield*/, provider.block({ finality: "final" })];
                        case 1:
                            block = _a.sent();
                            return [2 /*return*/, nearTransactions.createTransaction(account.accountId, publicKey, transaction.receiverId, publicKey.nonce + index + 1, actions, utils.serialize.base_decode(block.header.hash))];
                    }
                });
            }); }))];
    });
}); };
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return nearTransactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return nearTransactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas_1 = _a.gas, deposit = _a.deposit;
            return nearTransactions.functionCall(methodName, args, new bn_js_1.BN(gas_1), new bn_js_1.BN(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return nearTransactions.transfer(new bn_js_1.BN(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey_1 = _b.publicKey;
            return nearTransactions.stake(new bn_js_1.BN(stake), utils.PublicKey.from(publicKey_1));
        }
        case "AddKey": {
            var _c = action.params, publicKey_2 = _c.publicKey, accessKey = _c.accessKey;
            return nearTransactions.addKey(utils.PublicKey.from(publicKey_2), 
            // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            getAccessKey(accessKey.permission));
        }
        case "DeleteKey": {
            var publicKey_3 = action.params.publicKey;
            return nearTransactions.deleteKey(utils.PublicKey.from(publicKey_3));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return nearTransactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
