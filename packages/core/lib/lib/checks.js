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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertDropIdUnique = exports.assertValidFCData = exports.assertValidDropConfig = exports.assert = exports.isValidFunderObject = exports.isValidNearObject = exports.isValidAccountObj = exports.isSupportedKeypomContract = exports.isValidKeypomContract = void 0;
const keypom_1 = require("./keypom");
function isValidKeypomContract(keypomContractId) {
    const { networkId } = (0, keypom_1.getEnv)();
    return keypom_1.supportedKeypomContracts[networkId][keypomContractId] !== undefined;
}
exports.isValidKeypomContract = isValidKeypomContract;
function isSupportedKeypomContract(keypomContractId) {
    const { networkId } = (0, keypom_1.getEnv)();
    return keypom_1.supportedKeypomContracts[networkId][keypomContractId] === true;
}
exports.isSupportedKeypomContract = isSupportedKeypomContract;
function isValidAccountObj(o) {
    if (o) {
        return (o.connection !== undefined &&
            o.accountId !== undefined);
    }
    return true;
}
exports.isValidAccountObj = isValidAccountObj;
function isValidNearObject(o) {
    return (o.connection !== undefined &&
        o.config !== undefined &&
        o.accountCreator !== undefined);
}
exports.isValidNearObject = isValidNearObject;
function isValidFunderObject(o) {
    return (o.accountId !== undefined &&
        o.secretKey !== undefined);
}
exports.isValidFunderObject = isValidFunderObject;
const assert = (exp, m) => {
    if (!exp) {
        throw new Error(m);
    }
};
exports.assert = assert;
const assertValidDropConfig = (config) => {
    var _a;
    (0, exports.assert)(((config === null || config === void 0 ? void 0 : config.uses_per_key) || 1) != 0, 'Cannot have 0 uses per key for a drop config');
    if ((_a = config === null || config === void 0 ? void 0 : config.usage) === null || _a === void 0 ? void 0 : _a.permissions) {
        (0, exports.assert)(config.usage.permissions == 'create_account_and_claim' ||
            config.usage.permissions == 'claim', 'Invalid permission type for usage. Must be \'create_account_and_claim\' or \'claim\'');
    }
    if (config === null || config === void 0 ? void 0 : config.time) {
        const currentBlockTimestamp = Date.now() * 1e6;
        (0, exports.assert)((config.time.interval != undefined &&
            config.time.start != undefined) == false, 'If you want to set a claim interval, you must also set a start timestamp');
        (0, exports.assert)((config.time.start || currentBlockTimestamp) >=
            currentBlockTimestamp, 'The start timestamp must be greater than the current block timestamp');
        exports.assert((config.time.end || currentBlockTimestamp) >= currentBlockTimestamp, 'The end timestamp must be greater than the current block timestamp');
        if (config.time.start != undefined && config.time.end != undefined) {
            (0, exports.assert)(config.time.start < config.time.end, 'The start timestamp must be less than the end timestamp');
        }
    }
};
exports.assertValidDropConfig = assertValidDropConfig;
const assertValidFCData = (fcData, usesPerKey) => {
    if (fcData === null || fcData === void 0 ? void 0 : fcData.methods) {
        const numMethodData = fcData.methods.length;
        if (usesPerKey == 1) {
            (0, exports.assert)(numMethodData == 1, 'Cannot have more Method Data than the number of uses per key');
        }
        else if (numMethodData > 1) {
            (0, exports.assert)(numMethodData == usesPerKey, 'Number of FCs must match number of uses per key if more than 1 is specified');
        }
        if (usesPerKey > 1 && numMethodData == 1) {
            (0, exports.assert)(fcData.methods[0] != undefined, 'cannot have a single none function call');
        }
        for (let i = 0; i < numMethodData; i++) {
            const methodsPerUse = fcData.methods[i];
            // Loop through each method in the methods per use
            if (methodsPerUse) {
                for (let j = 0; j < methodsPerUse.length; j++) {
                    const methodData = methodsPerUse[j];
                    if (methodData) {
                        (0, exports.assert)(methodData.methodName != undefined, 'Must specify a method name');
                        (0, exports.assert)(methodData.args != undefined, 'Must specify arguments for method');
                        (0, exports.assert)(typeof methodData.args == 'string', 'Arguments must be a string. If you want to pass a JSON object, stringify it first.');
                        (0, exports.assert)(methodData.receiverId != undefined, 'Must specify arguments for method');
                        (0, exports.assert)(isValidKeypomContract(methodData.receiverId) ===
                            false, 'Cannot have a keypom contract as the receiver');
                    }
                }
            }
        }
    }
};
exports.assertValidFCData = assertValidFCData;
const assertDropIdUnique = (dropId) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall, contractId } = (0, keypom_1.getEnv)();
    try {
        const dropInfo = yield viewCall({
            contractId,
            methodName: 'get_drop_information',
            args: {
                drop_id: dropId,
            },
        });
        (0, exports.assert)(!dropInfo, `Drop with ID ${dropId} already exists. Please use a different drop ID.`);
    }
    catch (e) {
        console.log(e);
    }
});
exports.assertDropIdUnique = assertDropIdUnique;
