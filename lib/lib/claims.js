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
exports.claim = void 0;
var nearAPI = __importStar(require("near-api-js"));
var KeyPair = nearAPI.KeyPair;
var keypom_1 = require("./keypom");
/**
 * Allows a specific Keypom drop to be claimed via the secret key.
 *
 * @param {string} secretKey The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not.
 * @param {string=} accountId (OPTIONAL) The account ID of an existing account that will be used to claim the drop.
 * @param {string=} newAccountId (OPTIONAL) If passed in, a new account ID will be created and the drop will be claimed to that account. This must be an account that does not exist yet.
 * @param {string=} newPublicKey (OPTIONAL) If creating a new account, a public key must be passed in to be used as the full access key for the newly created account.
 *
 * @example <caption>Creating a simple $NEAR drop and claiming to an existing account</caption>
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 1 keys with no entropy (random key)
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 1
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop to the passed in account ID
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	accountId: "benjiman.testnet"
 * })
 * ```
 * @example <caption>Creating a simple $NEAR drop and using it to create a brand new NEAR account</caption>
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 2 keys with no entropy (all random). The first will be used for the drop and the second
 * // will be used as the full access key for the newly created account
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 2
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys: [publicKeys[0]],
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop and create a new account
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	newAccountId: "my-newly-creating-account.testnet",
 * 	newPublicKey: publicKeys[1]
 * })
 * ```
*/
var claim = function (_a) {
    var secretKey = _a.secretKey, accountId = _a.accountId, newAccountId = _a.newAccountId, newPublicKey = _a.newPublicKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute, fundingAccountDetails, keyPair, transactions, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), networkId = _b.networkId, keyStore = _b.keyStore, attachedGas = _b.attachedGas, contractId = _b.contractId, contractAccount = _b.contractAccount, receiverId = _b.receiverId, execute = _b.execute, fundingAccountDetails = _b.fundingAccountDetails;
                    if (!keyStore) {
                        throw new Error('Keypom SDK is not initialized. Please call `initKeypom`.');
                    }
                    keyPair = KeyPair.fromString(secretKey);
                    return [4 /*yield*/, keyStore.setKey(networkId, contractId, keyPair)];
                case 1:
                    _c.sent();
                    if (newAccountId && !newPublicKey) {
                        throw new Error('If creating a new account, a newPublicKey must be passed in.');
                    }
                    if (!newAccountId && !accountId) {
                        throw new Error('Either an accountId or newAccountId must be passed in.');
                    }
                    transactions = [{
                            receiverId: receiverId,
                            actions: [{
                                    type: 'FunctionCall',
                                    params: newAccountId ?
                                        {
                                            methodName: 'create_account_and_claim',
                                            args: {
                                                new_account_id: newAccountId,
                                                new_public_key: newPublicKey,
                                            },
                                            gas: attachedGas,
                                        }
                                        :
                                            {
                                                methodName: 'claim',
                                                args: {
                                                    account_id: accountId
                                                },
                                                gas: attachedGas,
                                            }
                                }]
                        }];
                    return [4 /*yield*/, execute({ transactions: transactions, account: contractAccount })];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result];
            }
        });
    });
};
exports.claim = claim;
