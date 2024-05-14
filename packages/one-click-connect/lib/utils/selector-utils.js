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
exports.getPubFromSecret = exports.getNetworkPreset = exports.parseOneClickSignInFromUrl = exports.keyHasPermissionForTransaction = exports.tryGetAccountData = exports.areParamsCorrect = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.NO_CONTRACT_ID = exports.KEYPOM_LOCAL_STORAGE_KEY = exports.ONE_CLICK_URL_REGEX = void 0;
var nearAPI = __importStar(require("near-api-js"));
var ext_wallets_1 = require("../core/ext_wallets");
var types_1 = require("../core/types");
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
var areParamsCorrect = function (params) {
    var urlPattern = params.urlPattern, networkId = params.networkId;
    // Validate Keypom parameters
    if (!(0, types_1.isOneClickParams)(params)) {
        console.error("KeypomWallet: Invalid OneClick Params passed in. Please check the docs for the correct format.");
        return false;
    }
    // Additional business logic checks
    if (!networkId || !urlPattern) {
        console.error("KeypomWallet: networkId, and url are required.");
        return false;
    }
    if (urlPattern &&
        !(urlPattern.includes(":accountId") &&
            urlPattern.includes(":secretKey") &&
            urlPattern.includes(":walletId"))) {
        console.error("KeypomWallet: Invalid OneClick Params passed in. urlPattern string must contain `:accountId`, `:secretKey`, and `:walletId` placeholders.");
        return false;
    }
    var matches = urlPattern.match(exports.ONE_CLICK_URL_REGEX);
    if (!matches) {
        console.error("KeypomWallet: Invalid OneClick Params passed in. urlPattern is invalid.");
        return false;
    }
    return true;
};
exports.areParamsCorrect = areParamsCorrect;
var tryGetAccountData = function (_a) {
    var _b;
    var urlPattern = _a.urlPattern, networkId = _a.networkId;
    var matches = urlPattern.match(exports.ONE_CLICK_URL_REGEX); // Safe since we check the same URL before;
    var baseUrl = matches[1];
    var delimiter = matches[2];
    // Try to sign in using one click sign-in data from URL
    var oneClickSignInData = baseUrl !== undefined
        ? (0, exports.parseOneClickSignInFromUrl)({ baseUrl: baseUrl, delimiter: delimiter })
        : null;
    if (oneClickSignInData !== null) {
        var isModuleSupported = ((_b = ext_wallets_1.SUPPORTED_EXT_WALLET_DATA[networkId]) === null || _b === void 0 ? void 0 : _b[oneClickSignInData.walletId]) !== undefined;
        if (!isModuleSupported) {
            console.warn("Module ID ".concat(oneClickSignInData.walletId, " is not supported on ").concat(networkId, "."));
            return null;
        }
        return oneClickSignInData;
    }
    // Try to sign in using data from local storage if URL does not contain valid one click sign-in data
    var curEnvData = (0, exports.getLocalStorageKeypomEnv)();
    if (curEnvData !== null) {
        return JSON.parse(curEnvData);
    }
    return null;
};
exports.tryGetAccountData = tryGetAccountData;
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
    if (credentials.length !== 3) {
        console.error("URL does not contain all required parameters (accountId, secretKey, walletId).");
        return null;
    }
    var accountId = credentials[0], secretKey = credentials[1], walletId = credentials[2];
    // Ensure none of the parameters are empty
    if (!accountId || !secretKey || !walletId) {
        console.error("Invalid or incomplete authentication data in URL.");
        return null;
    }
    return {
        accountId: accountId,
        secretKey: secretKey,
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