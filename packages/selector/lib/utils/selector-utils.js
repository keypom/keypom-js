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
exports.parseInstantSignInUrl = exports.parseTrialUrl = exports.updateKeypomContractIfValid = exports.addUserToMappingContract = exports.parseIPFSDataFromURL = exports.keyHasPermissionForTransaction = exports.getAccountFromMap = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.KEYPOM_LOCAL_STORAGE_KEY = void 0;
var core_1 = require("@keypom/core");
var utils_1 = require("@near-js/utils");
var types_1 = require("../core/types");
exports.KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';
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
var getAccountFromMap = function (secretKey) { return __awaiter(void 0, void 0, void 0, function () {
    var viewCall, pk, accountId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                viewCall = (0, core_1.getEnv)().viewCall;
                pk = (0, core_1.getPubFromSecret)(secretKey);
                return [4 /*yield*/, viewCall({
                        contractId: core_1.accountMappingContract[(0, core_1.getEnv)().networkId],
                        methodName: 'get_account_id',
                        args: { pk: pk }
                    })];
            case 1:
                accountId = _a.sent();
                console.log('accountId found from map: ', accountId);
                return [2 /*return*/, accountId];
        }
    });
}); };
exports.getAccountFromMap = getAccountFromMap;
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
var keyHasPermissionForTransaction = function (accessKey, receiverId, actions) { return __awaiter(void 0, void 0, void 0, function () {
    var permission, _a, allowedReceiverId, allowedMethods, allowed, _i, actions_1, action, functionCall;
    return __generator(this, function (_b) {
        console.log('accessKey: ', accessKey);
        permission = accessKey.permission;
        if (permission === 'FullAccess') {
            return [2 /*return*/, true];
        }
        if (permission.FunctionCall) {
            _a = permission.FunctionCall, allowedReceiverId = _a.receiver_id, allowedMethods = _a.method_names;
            if (allowedReceiverId === receiverId) {
                allowed = true;
                for (_i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                    action = actions_1[_i];
                    functionCall = action.functionCall;
                    if (!(functionCall && (!functionCall.deposit || functionCall.deposit.toString() === '0') && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 || allowedMethods.includes(functionCall.methodName)))) {
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
var parseIPFSDataFromURL = function () { return __awaiter(void 0, void 0, void 0, function () {
    var split, cid, response, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                split = window.location.href.split("?cid=");
                if (!(split.length > 1)) return [3 /*break*/, 3];
                cid = split[1];
                console.log("found CID in URL: ", cid);
                return [4 /*yield*/, fetch("https://cloudflare-ipfs.com/ipfs/".concat(cid))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                console.log('data: ', data);
                if ((0, types_1.isKeypomParams)(data)) {
                    console.log('Successfully parsed Keypom params from URL.');
                    return [2 /*return*/, data];
                }
                console.log('data is not castable to Keypom params: ', data);
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.parseIPFSDataFromURL = parseIPFSDataFromURL;
var addUserToMappingContract = function (accountId, secretKey) { return __awaiter(void 0, void 0, void 0, function () {
    var accountIdFromMapping;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getAccountFromMap)(secretKey)];
            case 1:
                accountIdFromMapping = _a.sent();
                if (accountIdFromMapping !== accountId) {
                    console.log("No Account ID found from mapping contract: ".concat(JSON.stringify(accountIdFromMapping), " Adding now."));
                    (0, core_1.trialCallMethod)({
                        trialAccountId: accountId,
                        trialAccountSecretKey: secretKey,
                        contractId: core_1.accountMappingContract[(0, core_1.getEnv)().networkId],
                        methodName: 'set',
                        args: {},
                        attachedDeposit: (0, utils_1.parseNearAmount)('0.002'),
                        attachedGas: '10000000000000'
                    });
                }
                return [2 /*return*/, accountIdFromMapping !== accountId];
        }
    });
}); };
exports.addUserToMappingContract = addUserToMappingContract;
var isValidKeypomContract = function (keypomContractId) {
    var networkId = (0, core_1.getEnv)().networkId;
    return core_1.supportedKeypomContracts[networkId][keypomContractId] !== undefined;
};
var updateKeypomContractIfValid = function (keypomContractId) {
    if (isValidKeypomContract(keypomContractId) === true) {
        (0, core_1.updateKeypomContractId)({
            keypomContractId: keypomContractId
        });
        return true;
    }
    return false;
};
exports.updateKeypomContractIfValid = updateKeypomContractIfValid;
var parseTrialUrl = function (trialSpecs) {
    var baseUrl = trialSpecs.baseUrl, delimiter = trialSpecs.delimiter;
    console.log("Parse trial URL with base: ".concat(baseUrl, " and delim: ").concat(delimiter));
    // remove everything after ?cid= in the URL if it's present
    var split = window.location.href.split("?cid=")[0].split(baseUrl);
    if (split.length !== 2) {
        return;
    }
    var trialInfo = split[1];
    var _a = trialInfo.split(delimiter), accountId = _a[0], secretKey = _a[1];
    if (!accountId || !secretKey) {
        return;
    }
    return {
        accountId: accountId,
        secretKey: secretKey
    };
};
exports.parseTrialUrl = parseTrialUrl;
var parseInstantSignInUrl = function (instantSignInSpecs) {
    var baseUrl = instantSignInSpecs.baseUrl, delimiter = instantSignInSpecs.delimiter, moduleDelimiter = instantSignInSpecs.moduleDelimiter;
    console.log("Parse instant sign in URL with base: ".concat(baseUrl, " delim: ").concat(delimiter, " and module delim: ").concat(moduleDelimiter));
    // remove everything after ?cid= in the URL if it's present
    var split = window.location.href.split("?cid=")[0].split(baseUrl);
    if (split.length !== 2) {
        return;
    }
    var signInInfo = split[1];
    // Get the account ID, secret key, and module ID based on the two delimiters `delimiter` and `moduleDelimiter`
    var regex = new RegExp("(.*)".concat(delimiter, "(.*)").concat(moduleDelimiter, "(.*)"));
    var matches = signInInfo.match(regex);
    var accountId = matches === null || matches === void 0 ? void 0 : matches[1];
    var secretKey = matches === null || matches === void 0 ? void 0 : matches[2];
    var moduleId = matches === null || matches === void 0 ? void 0 : matches[3];
    if (!accountId || !secretKey || !moduleId) {
        return;
    }
    return {
        accountId: accountId,
        secretKey: secretKey,
        moduleId: moduleId
    };
};
exports.parseInstantSignInUrl = parseInstantSignInUrl;
