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
Object.defineProperty(exports, "__esModule", { value: true });
exports.claim = void 0;
var nearAPI = __importStar(require("near-api-js"));
var KeyPair = nearAPI.KeyPair;
var keypom_1 = require("./keypom");
var claim = function (_a) {
    var secretKey = _a.secretKey, accountId = _a.accountId, newAccountId = _a.newAccountId, newPublicKey = _a.newPublicKey;
    var _b = (0, keypom_1.getEnv)(), networkId = _b.networkId, keyStore = _b.keyStore, attachedGas = _b.attachedGas, contractId = _b.contractId, contractAccount = _b.contractAccount, receiverId = _b.receiverId, execute = _b.execute, connection = _b.connection;
    var keyPair = KeyPair.fromString(secretKey);
    keyStore.setKey(networkId, contractId, keyPair);
    console.log(connection.signer.keyStore.keys);
    console.log(contractAccount.connection.signer.keyStore.keys);
    console.log('EEEEEEEEEEEEEEEEEEEEEEEE', networkId, contractId, keyPair);
    var transactions = [{
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
    return execute({ transactions: transactions, account: contractAccount });
};
exports.claim = claim;
