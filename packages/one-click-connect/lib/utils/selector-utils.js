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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessKey = exports.createAction = exports.transformTransactions = exports.baseDecode = exports.getPubFromSecret = exports.getNetworkPreset = exports.parseOneClickSignInFromUrl = exports.keyHasPermissionForTransaction = exports.tryGetSignInData = exports.setLocalStorageKeypomLak = exports.getLocalStorageKeypomLak = exports.setLocalStoragePendingKey = exports.getLocalStoragePendingKey = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.NO_CONTRACT_ID = exports.KEYPOM_LOCAL_STORAGE_KEY = exports.ONE_CLICK_URL_REGEX = void 0;
var nearAPI = __importStar(require("near-api-js"));
var ext_wallets_1 = require("../core/ext_wallets");
var bn_js_1 = __importDefault(require("bn.js"));
var bs58_1 = require("bs58");
exports.ONE_CLICK_URL_REGEX = new RegExp("^(.*):accountId(.+):secretKey(.+):walletId(.*)$");
exports.KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";
exports.NO_CONTRACT_ID = "no-contract";
var getLocalStorageKeypomEnv = function () {
    var localStorageDataJson = localStorage.getItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"));
    return localStorageDataJson;
};
exports.getLocalStorageKeypomEnv = getLocalStorageKeypomEnv;
var setLocalStorageKeypomEnv = function (jsonData) {
    var dataToWrite = JSON.stringify(jsonData);
    localStorage.setItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"), dataToWrite);
};
exports.setLocalStorageKeypomEnv = setLocalStorageKeypomEnv;
var getLocalStoragePendingKey = function (near) { return __awaiter(void 0, void 0, void 0, function () {
    var localStorageData, localStorageDataJson, accountId, accessKey, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                localStorageData = localStorage.getItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":pendingKey"));
                if (localStorageData === null)
                    return [2 /*return*/, null];
                localStorageDataJson = JSON.parse(localStorageData);
                accountId = localStorageDataJson.accountId;
                if (!(localStorageDataJson.publicKey && localStorageDataJson.secretKey)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, near.connection.provider.query("access_key/".concat(accountId, "/").concat(localStorageDataJson.publicKey), "")];
            case 2:
                accessKey = _a.sent();
                if (accessKey) {
                    return [2 /*return*/, localStorageDataJson.secretKey];
                }
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log("error retrieving access key: ", e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, null];
        }
    });
}); };
exports.getLocalStoragePendingKey = getLocalStoragePendingKey;
var setLocalStoragePendingKey = function (jsonData) {
    var dataToWrite = JSON.stringify(jsonData);
    localStorage.setItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":pendingKey"), dataToWrite);
    console.log("done writing");
};
exports.setLocalStoragePendingKey = setLocalStoragePendingKey;
// allowance, methodNames, walletUrl
var getLocalStorageKeypomLak = function () {
    var localStorageDataJson = localStorage.getItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":LakData"));
    return localStorageDataJson;
};
exports.getLocalStorageKeypomLak = getLocalStorageKeypomLak;
var setLocalStorageKeypomLak = function (jsonData) {
    var dataToWrite = JSON.stringify(jsonData);
    localStorage.setItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":LakData"), dataToWrite);
};
exports.setLocalStorageKeypomLak = setLocalStorageKeypomLak;
var tryGetSignInData = function (_a) {
    var networkId = _a.networkId, nearConnection = _a.nearConnection;
    return __awaiter(void 0, void 0, void 0, function () {
        var connectionSplit, signInData, curEnvData, connectionString, decodedString, connectionData, isModuleSupported, addKeySplit, addKeyParam, addKey, pendingSecretKey;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    connectionSplit = window.location.href.split("?connection=");
                    signInData = null;
                    curEnvData = (0, exports.getLocalStorageKeypomEnv)();
                    console.log("Local storage env data: ", curEnvData);
                    if (curEnvData !== null) {
                        signInData = __assign(__assign({}, JSON.parse(curEnvData)), { baseUrl: connectionSplit[0] });
                    }
                    // Update signInData with connection data if it exists
                    if (connectionSplit.length > 1) {
                        connectionString = connectionSplit[1].split("&addKey=")[0];
                        try {
                            decodedString = Buffer.from(connectionString, "base64").toString("utf-8");
                            connectionData = JSON.parse(decodedString);
                            console.log("parsed connection data: ", connectionData);
                            if (connectionData.accountId === undefined ||
                                connectionData.walletId === undefined) {
                                console.error("Connection data must include accountId and walletId fields");
                                return [2 /*return*/, null];
                            }
                            isModuleSupported = ((_b = ext_wallets_1.SUPPORTED_EXT_WALLET_DATA[networkId]) === null || _b === void 0 ? void 0 : _b[connectionData.walletId]) !== undefined;
                            if (!isModuleSupported) {
                                console.warn("Module ID ".concat(connectionData.wallet, " is not supported on ").concat(networkId, "."));
                                return [2 /*return*/, null];
                            }
                            signInData = {
                                accountId: connectionData.accountId,
                                walletId: connectionData.walletId,
                                walletUrl: connectionData.walletTransactionUrl,
                                chainId: connectionData.chainId,
                                baseUrl: connectionSplit[0],
                                secretKey: connectionData.secretKey,
                                addKey: true,
                            };
                        }
                        catch (e) {
                            console.error("Error parsing connection data: ", e);
                            return [2 /*return*/, null];
                        }
                    }
                    if (!(signInData === null || signInData === void 0 ? void 0 : signInData.accountId) || signInData === null) {
                        console.log("No connection found in local storage or URL. returning null");
                        return [2 /*return*/, null];
                    }
                    addKeySplit = connectionSplit.length > 1
                        ? window.location.href.split("&addKey=")
                        : window.location.href.split("?addKey=");
                    if (addKeySplit.length > 1) {
                        addKeyParam = addKeySplit[1];
                        addKey = addKeyParam !== "false";
                        signInData.addKey = addKey;
                    }
                    return [4 /*yield*/, (0, exports.getLocalStoragePendingKey)(nearConnection)];
                case 1:
                    pendingSecretKey = _c.sent();
                    localStorage.removeItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":pendingKey"));
                    if (pendingSecretKey) {
                        signInData.secretKey = pendingSecretKey;
                    }
                    return [2 /*return*/, signInData];
            }
        });
    });
};
exports.tryGetSignInData = tryGetSignInData;
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
var keyHasPermissionForTransaction = function (accessKey, receiverId, actions) { return __awaiter(void 0, void 0, void 0, function () {
    var permission, _a, allowedReceiverId, allowedMethods, allowed, _i, actions_1, action;
    return __generator(this, function (_b) {
        console.log("accessKey: ", accessKey);
        permission = accessKey.permission;
        if (permission === "FullAccess") {
            return [2 /*return*/, true];
        }
        if (permission.FunctionCall) {
            _a = permission.FunctionCall, allowedReceiverId = _a.receiver_id, allowedMethods = _a.method_names;
            console.log("allowedReceiverId: ", allowedReceiverId);
            if (allowedReceiverId === receiverId) {
                allowed = true;
                for (_i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                    action = actions_1[_i];
                    if (!(action.type === "FunctionCall" &&
                        (!action.params.deposit ||
                            action.params.deposit.toString() === "0") && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 ||
                            allowedMethods.includes(action.params.methodName)))) {
                        console.log("action not allowed: ", action);
                        allowed = false;
                        break;
                    }
                }
                return [2 /*return*/, allowed];
            }
        }
        return [2 /*return*/, false];
    });
}); };
exports.keyHasPermissionForTransaction = keyHasPermissionForTransaction;
var parseOneClickSignInFromUrl = function (_a) {
    var baseUrl = _a.baseUrl, delimiter = _a.delimiter;
    var urlToCheck = window.location.href;
    // Split the URL to get the part after baseUrl (i.e: `#instant-url/`)
    var parts = urlToCheck.split(baseUrl);
    if (parts.length < 2 || !parts[1]) {
        console.error("URL does not contain the expected pattern.");
        return null;
    }
    // Further split to separate accountId, secretKey, and walletId
    var credentials = parts[1].split(delimiter);
    // secret key may be missing --> originall had || credentials.length > 4 there as well
    if (credentials.length !== 2 && credentials.length !== 3) {
        console.error("URL is malformed or does not contain all required parameters (accountId, walletId).");
        return null;
    }
    // set accountId, walletId always, and secretKey if present
    var _b = credentials.length === 2
        ? [credentials[0], undefined, credentials[1]]
        : credentials, accountId = _b[0], secretKey = _b[1], walletId = _b[2];
    // in condition, got rid of || ((credentials.length === 3 && !secretKey))
    if (!accountId || !walletId) {
        console.error("Invalid or incomplete authentication data in URL.");
        return null;
    }
    return {
        accountId: accountId,
        secretKey: credentials.length === 3 ? secretKey : undefined,
        walletId: walletId,
        baseUrl: baseUrl,
    };
};
exports.parseOneClickSignInFromUrl = parseOneClickSignInFromUrl;
var getNetworkPreset = function (networkId) {
    switch (networkId) {
        case "mainnet":
            return {
                networkId: networkId,
                nodeUrl: "https://rpc.mainnet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                explorerUrl: "https://nearblocks.io",
                indexerUrl: "https://api.kitwallet.app",
            };
        case "testnet":
            return {
                networkId: networkId,
                nodeUrl: "https://rpc.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://testnet.nearblocks.io",
                indexerUrl: "https://testnet-api.kitwallet.app",
            };
        default:
            throw Error("Failed to find config for: '".concat(networkId, "'"));
    }
};
exports.getNetworkPreset = getNetworkPreset;
var getPubFromSecret = function (secretKey) {
    var keyPair = nearAPI.KeyPair.fromString(secretKey);
    return keyPair.getPublicKey().toString();
};
exports.getPubFromSecret = getPubFromSecret;
var baseDecode = function (value) {
    return new Uint8Array((0, bs58_1.decode)(value));
};
exports.baseDecode = baseDecode;
// : nearAPI.transactions.Transaction[]
// MUST BE USED WITH KEY FOR TXN
var transformTransactions = function (transactions, account) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, networkId, signer, provider;
    return __generator(this, function (_b) {
        _a = account.connection, networkId = _a.networkId, signer = _a.signer, provider = _a.provider;
        console.log("utils signer: ", signer);
        return [2 /*return*/, Promise.all(transactions.map(function (transaction, index) { return __awaiter(void 0, void 0, void 0, function () {
                var actions, accessKey, block;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions = transaction.actions.map(function (action) {
                                return (0, exports.createAction)(action);
                            });
                            return [4 /*yield*/, account.findAccessKey(transaction.receiverId, actions)];
                        case 1:
                            accessKey = _a.sent();
                            if (!accessKey) {
                                throw new Error("Failed to find matching key for transaction sent to ".concat(transaction.receiverId));
                            }
                            return [4 /*yield*/, provider.block({ finality: "final" })];
                        case 2:
                            block = _a.sent();
                            return [2 /*return*/, nearAPI.transactions.createTransaction(account.accountId, nearAPI.utils.PublicKey.from(accessKey.publicKey), transaction.receiverId, accessKey.accessKey.nonce + BigInt(index) + BigInt(1), actions, (0, exports.baseDecode)(block.header.hash))];
                    }
                });
            }); }))];
    });
}); };
exports.transformTransactions = transformTransactions;
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return nearAPI.transactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return nearAPI.transactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas = _a.gas, deposit = _a.deposit;
            return nearAPI.transactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return nearAPI.transactions.transfer(new bn_js_1.default(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return nearAPI.transactions.stake(new bn_js_1.default(stake), nearAPI.utils.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            return nearAPI.transactions.addKey(nearAPI.utils.PublicKey.from(publicKey), 
            // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            (0, exports.getAccessKey)(accessKey.permission));
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return nearAPI.transactions.deleteKey(nearAPI.utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return nearAPI.transactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
exports.createAction = createAction;
var getAccessKey = function (permission) {
    if (permission === "FullAccess") {
        return nearAPI.transactions.fullAccessKey();
    }
    var receiverId = permission.receiverId, _a = permission.methodNames, methodNames = _a === void 0 ? [] : _a;
    var allowance = permission.allowance
        ? new bn_js_1.default(permission.allowance)
        : undefined;
    return nearAPI.transactions.functionCallAccessKey(receiverId, methodNames, allowance);
};
exports.getAccessKey = getAccessKey;
