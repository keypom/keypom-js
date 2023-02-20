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
exports.viewMethod = exports.createAction = exports.transformActions = exports.isValidActions = exports.autoSignIn = exports.claimTrialAccount = exports.setLocalStorageKeypomEnv = exports.getLocalStorageKeypomEnv = exports.KEYPOM_LOCAL_STORAGE_KEY = exports.networks = void 0;
var nearAPI = __importStar(require("near-api-js"));
var Near = nearAPI.Near, KeyPair = nearAPI.KeyPair, BrowserLocalStorageKeyStore = nearAPI.keyStores.BrowserLocalStorageKeyStore, _a = nearAPI.transactions, addKey = _a.addKey, deleteKey = _a.deleteKey, functionCallAccessKey = _a.functionCallAccessKey, utils = nearAPI.utils, nearTransactions = nearAPI.transactions, _b = nearAPI.utils, PublicKey = _b.PublicKey, _c = _b.format, parseNearAmount = _c.parseNearAmount, formatNearAmount = _c.formatNearAmount;
var bn_js_1 = require("bn.js");
var gas = '200000000000000';
exports.networks = {
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
exports.KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';
var getLocalStorageKeypomEnv = function () {
    var localStorageDataJson = localStorage.getItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"));
    return localStorageDataJson;
};
exports.getLocalStorageKeypomEnv = getLocalStorageKeypomEnv;
var setLocalStorageKeypomEnv = function (jsonData) {
    var dataToWrite = JSON.stringify(jsonData);
    console.log('dataToWrite: ', dataToWrite);
    localStorage.setItem("".concat(exports.KEYPOM_LOCAL_STORAGE_KEY, ":envData"), dataToWrite);
};
exports.setLocalStorageKeypomEnv = setLocalStorageKeypomEnv;
var onSubmitAccountId = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("waiting 2 seconds");
                // wait 2 seconds
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
            case 1:
                // wait 2 seconds
                _a.sent();
                console.log('accountId Submitted From Form: ', accountId);
                return [2 /*return*/];
        }
    });
}); };
var claimTrialAccount = function (keypomContractId, keyPair, nodeUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var isTrialClaimed, dropInfo, e_1, newAccountId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isTrialClaimed = false;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, exports.viewMethod)({
                        contractId: keypomContractId,
                        methodName: 'get_drop_information',
                        args: {
                            key: keyPair.publicKey.toString()
                        },
                        nodeUrl: nodeUrl
                    })];
            case 2:
                dropInfo = _a.sent();
                console.log('dropInfo: ', dropInfo);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                if (e_1.toString().includes("no drop ID for PK")) {
                    console.log("trial is claimed (error: ".concat(e_1, ")"));
                    isTrialClaimed = true;
                }
                else {
                    console.log("error", e_1);
                }
                return [3 /*break*/, 4];
            case 4:
                newAccountId = "test-1676383642371.linkdrop-beta.keypom.testnet";
                // if(!isTrialClaimed) {
                // 	const desiredAccountId = window.prompt("Enter a desired account ID");
                // 	console.log('desiredAccountId: ', desiredAccountId)
                // 	newAccountId = `${desiredAccountId}.linkdrop-beta.keypom.testnet`
                // } else {
                // 	const desiredAccountId = window.prompt("Enter an existing account", `test-1676383642371`);
                // 	console.log('desiredAccountId: ', desiredAccountId)
                // 	newAccountId = `${desiredAccountId}.linkdrop-beta.keypom.testnet`
                // }
                console.log('isTrialClaimed: ', isTrialClaimed);
                console.log('newAccountId: ', newAccountId);
                return [2 /*return*/, newAccountId];
        }
    });
}); };
exports.claimTrialAccount = claimTrialAccount;
var autoSignIn = function (accountId, secretKey) {
    localStorage.setItem("near-api-js:keystore:".concat(accountId, ":testnet"), "ed25519:".concat(secretKey));
    // Contract
    localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}");
    localStorage.setItem('near-wallet-selector:contract:pending', "{\"contractId\":\"testnet\",\"methodNames\":[]}");
    // Selected Wallet
    localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"");
    localStorage.setItem('near-wallet-selector:selectedWalletId:pending', "\"keypom\"");
    // let recentWallets = localStorage.get('near-wallet-selector:recentlySignedInWallets');
    // console.log('recentWallets: ', recentWallets)
    // if (recentWallets) {
    // 	recentWallets.push(autoAccountId);
    // }
    // localStorage.setItem('near-wallet-selector:recentlySignedInWallets', JSON.stringify(["keypom"]))
    // localStorage.setItem('near-wallet-selector:recentlySignedInWallets:pending', JSON.stringify(["keypom"]))
};
exports.autoSignIn = autoSignIn;
var isValidActions = function (actions) {
    return actions.every(function (x) { return x.type === "FunctionCall"; });
};
exports.isValidActions = isValidActions;
var transformActions = function (actions) {
    var validActions = (0, exports.isValidActions)(actions);
    if (!validActions) {
        throw new Error("Only 'FunctionCall' actions types are supported");
    }
    return actions.map(function (x) { return x.params; });
};
exports.transformActions = transformActions;
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
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return nearTransactions.stake(new bn_js_1.BN(stake), utils.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            // return nearTransactions.addKey(
            //   utils.PublicKey.from(publicKey),
            //   // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            //   getAccessKey(accessKey.permission)
            // );
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return nearTransactions.deleteKey(utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return nearTransactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
exports.createAction = createAction;
// Make a read-only call to retrieve information from the network
var viewMethod = function (_a) {
    var contractId = _a.contractId, methodName = _a.methodName, _b = _a.args, args = _b === void 0 ? {} : _b, nodeUrl = _a.nodeUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var provider, res;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('args: ', args);
                    console.log('methodName: ', methodName);
                    console.log('contractId: ', contractId);
                    console.log('nodeUrl: ', nodeUrl);
                    provider = new nearAPI.providers.JsonRpcProvider({ url: nodeUrl });
                    return [4 /*yield*/, provider.query({
                            request_type: 'call_function',
                            account_id: contractId,
                            method_name: methodName,
                            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
                            finality: 'optimistic',
                        })];
                case 1:
                    res = _c.sent();
                    return [2 /*return*/, JSON.parse(Buffer.from(res.result).toString())];
            }
        });
    });
};
exports.viewMethod = viewMethod;
