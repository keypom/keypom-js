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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAction = exports.testTransformTransactions = exports.baseDecode = exports.key2str = exports.ATTACHED_GAS_FROM_WALLET = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var crypto_1 = require("@near-js/crypto");
var bs58_1 = require("bs58");
var transactions_1 = require("@near-js/transactions");
var najTransactions = __importStar(require("near-api-js/lib/transaction"));
var sha256Hash;
// @ts-ignore
if (typeof crypto === "undefined") {
    var nodeCrypto_1 = require("crypto");
    sha256Hash = function (ab) { return nodeCrypto_1.createHash("sha256").update(ab).digest(); };
}
else {
    // @ts-ignore
    sha256Hash = function (ab) { return crypto.subtle.digest("SHA-256", ab); };
}
/// How much Gas each each cross contract call with cost to be converted to a receipt
var GAS_PER_CCC = 5000000000000; // 5 TGas
var RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
var YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
var ACCESS_KEY_STORAGE = new bn_js_1.default("1000000000000000000000");
var key2str = function (v) { return (typeof v === "string" ? v : v.pk); };
exports.key2str = key2str;
var hashBuf = function (str, fromHex) {
    if (fromHex === void 0) { fromHex = false; }
    return sha256Hash(Buffer.from(str, fromHex ? "hex" : "utf8"));
};
var baseDecode = function (value) {
    return new Uint8Array((0, bs58_1.decode)(value));
};
exports.baseDecode = baseDecode;
var testTransformTransactions = function (transactions, account) { return __awaiter(void 0, void 0, void 0, function () {
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
                            return [2 /*return*/, (0, transactions_1.createTransaction)(account.accountId, crypto_1.PublicKey.from(accessKey.publicKey), transaction.receiverId, accessKey.accessKey.nonce + BigInt(index) + BigInt(1), actions, (0, exports.baseDecode)(block.header.hash))];
                    }
                });
            }); }))];
    });
}); };
exports.testTransformTransactions = testTransformTransactions;
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return najTransactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return najTransactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas = _a.gas, deposit = _a.deposit;
            return najTransactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return najTransactions.transfer(new bn_js_1.default(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return najTransactions.stake(new bn_js_1.default(stake), crypto_1.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            return najTransactions.addKey(crypto_1.PublicKey.from(publicKey), 
            // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            getAccessKey(accessKey.permission));
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return najTransactions.deleteKey(crypto_1.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return najTransactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
exports.createAction = createAction;
var getAccessKey = function (permission) {
    if (permission === "FullAccess") {
        return najTransactions.fullAccessKey();
    }
    var receiverId = permission.receiverId, _a = permission.methodNames, methodNames = _a === void 0 ? [] : _a;
    var allowance = permission.allowance
        ? new bn_js_1.default(permission.allowance)
        : undefined;
    return najTransactions.functionCallAccessKey(receiverId, methodNames, allowance);
};
// export const createPooAction = (action: wsAction): Action => {
//     if (action.createAccount) {
//         return actionCreators.createAccount();
//     }
//     if (action.deployContract) {
//         const { code } = action.deployContract;
//         return actionCreators.deployContract(code);
//     }
//     if (action.functionCall) {
//         const { methodName, args, gas, deposit } = action.functionCall;
//         return actionCreators.functionCall(
//             methodName,
//             args,
//             new BN(gas),
//             new BN(deposit)
//         );
//     }
//     if (action.transfer) {
//         const { deposit } = action.transfer;
//         return actionCreators.transfer(new BN(deposit));
//     }
//     if (action.stake) {
//         const { stake, publicKey } = action.stake;
//         return actionCreators.stake(new BN(stake), PublicKey.from(publicKey));
//     }
//     if (action.deleteKey) {
//         const { publicKey } = action.deleteKey;
//         return actionCreators.deleteKey(PublicKey.from(publicKey));
//     }
//     if (action.deleteAccount) {
//         const { beneficiaryId } = action.deleteAccount;
//         return actionCreators.deleteAccount(beneficiaryId);
//     }
//     throw new Error("Unknown action");
// };
