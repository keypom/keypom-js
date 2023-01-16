"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidFCData = exports.assertValidDropConfig = exports.assert = exports.isValidAccountObj = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
function isValidAccountObj(o) {
    if (o) {
        return o.connection !== undefined;
    }
    return true;
}
exports.isValidAccountObj = isValidAccountObj;
var assert = function (exp, m) {
    if (!exp) {
        throw new Error(m);
    }
};
exports.assert = assert;
var assertValidDropConfig = function (config) {
    var _a;
    (0, exports.assert)(((config === null || config === void 0 ? void 0 : config.uses_per_key) || 1) != 0, "Cannot have 0 uses per key for a drop config");
    if ((_a = config === null || config === void 0 ? void 0 : config.usage) === null || _a === void 0 ? void 0 : _a.permission) {
        (0, exports.assert)(config.usage.permission == "create_account_and_claim" || config.usage.permission == "claim", "Invalid permission type for usage. Must be 'create_account_and_claim' or 'claim'");
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
    var _a;
    if ((_a = fcData === null || fcData === void 0 ? void 0 : fcData.config) === null || _a === void 0 ? void 0 : _a.attachedGas) {
        (0, exports.assert)(depositPerUse == "0", "Cannot specify gas to attach and have a balance in the linkdrop");
        (0, exports.assert)(new bn_js_1.default(fcData.config.attachedGas).lte(new bn_js_1.default("80000000000000")), "Cannot have 0 attached gas");
    }
    if (fcData === null || fcData === void 0 ? void 0 : fcData.methods) {
        var numMethodData = fcData.methods.length;
        if (usesPerKey == 1) {
            (0, exports.assert)(numMethodData == 1, "Cannot have more Method Data than the number of uses per key");
        }
        else if (usesPerKey > 1) {
            (0, exports.assert)(numMethodData == usesPerKey, "Number of FCs must match number of uses per key if more than 1 is specified");
        }
        if (usesPerKey > 1 && numMethodData == 1) {
            (0, exports.assert)(fcData.methods[0] != undefined, "cannot have a single none function call");
        }
    }
};
exports.assertValidFCData = assertValidFCData;
