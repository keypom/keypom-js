"use strict";
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
exports.parseOneClickSignInFromUrl = exports.keyHasPermissionForTransaction = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.KEYPOM_LOCAL_STORAGE_KEY = void 0;
exports.KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";
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
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
var keyHasPermissionForTransaction = function (accessKey, receiverId, actions) { return __awaiter(void 0, void 0, void 0, function () {
    var permission, _a, allowedReceiverId, allowedMethods, allowed, _i, actions_1, action, functionCall;
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
                    functionCall = action.functionCall;
                    console.log("functionCall: ", functionCall);
                    if (!(functionCall &&
                        (!functionCall.deposit ||
                            functionCall.deposit.toString() === "0") && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 ||
                            allowedMethods.includes(functionCall.methodName)))) {
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
var parseOneClickSignInFromUrl = function (oneClickSpecs) {
    var baseUrl = oneClickSpecs.baseUrl, delimiter = oneClickSpecs.delimiter, walletDelimiter = oneClickSpecs.walletDelimiter;
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
    };
};
exports.parseOneClickSignInFromUrl = parseOneClickSignInFromUrl;
