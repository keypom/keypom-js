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
exports.assertDropIdUnique = exports.assertValidFCData = exports.assertValidDropConfig = exports.assert = exports.isValidFunderObject = exports.isValidNearObject = exports.isValidAccountObj = void 0;
var keypom_1 = require("./keypom");
function isValidAccountObj(o) {
    if (o) {
        return o.connection !== undefined && o.accountId !== undefined;
    }
    return true;
}
exports.isValidAccountObj = isValidAccountObj;
function isValidNearObject(o) {
    return o.connection !== undefined && o.config !== undefined && o.accountCreator !== undefined;
}
exports.isValidNearObject = isValidNearObject;
function isValidFunderObject(o) {
    return o.accountId !== undefined && o.secretKey !== undefined;
}
exports.isValidFunderObject = isValidFunderObject;
var assert = function (exp, m) {
    if (!exp) {
        throw new Error(m);
    }
};
exports.assert = assert;
var assertValidDropConfig = function (config) {
    var _a;
    (0, exports.assert)(((config === null || config === void 0 ? void 0 : config.uses_per_key) || 1) != 0, "Cannot have 0 uses per key for a drop config");
    if ((_a = config === null || config === void 0 ? void 0 : config.usage) === null || _a === void 0 ? void 0 : _a.permissions) {
        (0, exports.assert)(config.usage.permissions == "create_account_and_claim" || config.usage.permissions == "claim", "Invalid permission type for usage. Must be 'create_account_and_claim' or 'claim'");
    }
    if (config === null || config === void 0 ? void 0 : config.time) {
        var currentBlockTimestamp = Date.now() * 1e6;
        (0, exports.assert)((config.time.interval != undefined && config.time.start != undefined) == false, "If you want to set a claim interval, you must also set a start timestamp");
        (0, exports.assert)((config.time.start || currentBlockTimestamp) >= currentBlockTimestamp, "The start timestamp must be greater than the current block timestamp");
        exports.assert((config.time.end || currentBlockTimestamp) >= currentBlockTimestamp, "The end timestamp must be greater than the current block timestamp");
        if (config.time.start != undefined && config.time.end != undefined) {
            (0, exports.assert)(config.time.start < config.time.end, "The start timestamp must be less than the end timestamp");
        }
    }
};
exports.assertValidDropConfig = assertValidDropConfig;
var assertValidFCData = function (fcData, depositPerUse, usesPerKey) {
    var networkId = (0, keypom_1.getEnv)().networkId;
    if (fcData === null || fcData === void 0 ? void 0 : fcData.methods) {
        var numMethodData = fcData.methods.length;
        if (usesPerKey == 1) {
            (0, exports.assert)(numMethodData == 1, "Cannot have more Method Data than the number of uses per key");
        }
        else if (numMethodData > 1) {
            (0, exports.assert)(numMethodData == usesPerKey, "Number of FCs must match number of uses per key if more than 1 is specified");
        }
        if (usesPerKey > 1 && numMethodData == 1) {
            (0, exports.assert)(fcData.methods[0] != undefined, "cannot have a single none function call");
        }
        for (var i = 0; i < numMethodData; i++) {
            var methodsPerUse = fcData.methods[i];
            // Loop through each method in the methods per use
            if (methodsPerUse) {
                for (var j = 0; j < methodsPerUse.length; j++) {
                    var methodData = methodsPerUse[j];
                    if (methodData) {
                        (0, exports.assert)(methodData.methodName != undefined, "Must specify a method name");
                        (0, exports.assert)(methodData.args != undefined, "Must specify arguments for method");
                        (0, exports.assert)(typeof methodData.args == "string", "Arguments must be a string. If you want to pass a JSON object, stringify it first.");
                        (0, exports.assert)(methodData.receiverId != undefined, "Must specify arguments for method");
                        (0, exports.assert)(keypom_1.officialKeypomContracts[networkId][methodData.receiverId] == undefined, "Cannot have a keypom contract as the receiver");
                    }
                }
            }
        }
    }
};
exports.assertValidFCData = assertValidFCData;
var assertDropIdUnique = function (dropId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, viewCall, contractId, dropInfo, _1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = (0, keypom_1.getEnv)(), viewCall = _a.viewCall, contractId = _a.contractId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, viewCall({
                        contractId: contractId,
                        methodName: 'get_drop_information',
                        args: {
                            drop_id: dropId
                        }
                    })];
            case 2:
                dropInfo = _b.sent();
                (0, exports.assert)(!dropInfo, "Drop with ID ".concat(dropId, " already exists. Please use a different drop ID."));
                return [3 /*break*/, 4];
            case 3:
                _1 = _b.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.assertDropIdUnique = assertDropIdUnique;
