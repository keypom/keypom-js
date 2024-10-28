"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypomTrialSelector = void 0;
const TrialAccountManager_1 = require("../TrialAccountManager");
const types_1 = require("./types");
const key_pair_1 = require("near-api-js/lib/utils/key_pair");
const near_1 = require("../networks/near");
class KeypomTrialSelector {
    constructor({ networkId, trialAccountSecretKey, trialAccountId, }) {
        this.networkId = networkId;
        this.trialAccountSecretKey = trialAccountSecretKey;
        this.trialAccountId = trialAccountId;
        this.trialManager = new TrialAccountManager_1.TrialAccountManager({
            trialContractId: "1729530318593-trial-contract.testnet",
            mpcContractId: "v1.signer-prod.testnet",
            networkId: this.networkId,
        });
    }
    verifyOwner(params) {
        const verifiedOwned = {
            accountId: this.trialAccountId,
            message: "",
            blockId: "",
            publicKey: "",
            signature: "",
            keyType: key_pair_1.KeyType.ED25519,
        };
        return Promise.resolve(verifiedOwned);
    }
    getContractId() {
        return "1729530318593-trial-contract.testnet";
    }
    getAccountId() {
        return this.trialAccountId;
    }
    isSignedIn() {
        return Boolean(this.trialAccountSecretKey);
    }
    async signAndSendTransaction(params) {
        console.log("Sign and send transaction", params);
        const actionToPerform = {
            chain: "NEAR",
            methodName: params.actions[0].params.methodName,
            args: params.actions[0].params.args,
            targetContractId: params.receiverId,
            attachedDepositNear: params.actions[0].params.deposit || "0",
            gas: params.actions[0].params.gas || "30000000000000",
        };
        console.log("Action to perform", actionToPerform);
        const { signatures, txnDatas } = await this.trialManager.performActions({
            trialAccountSecretKey: this.trialAccountSecretKey,
            actionsToPerform: [actionToPerform],
        });
        const result = await this.trialManager.broadcastTransaction({
            trialAccountSecretKey: this.trialAccountSecretKey,
            actionToPerform,
            signatureResult: signatures[0],
            txnData: txnDatas[0],
        });
        console.log("Result", result);
        return (0, near_1.isFinalExecutionOutcome)(result)
            ? result
            : types_1.FAILED_EXECUTION_OUTCOME;
    }
    async signAndSendTransactions(params) {
        console.log("Sign and send transactions", params);
        const transactionResults = [];
        for (const tx of params.transactions) {
            if (tx.actions[0].type !== "FunctionCall") {
                throw new Error("Only function calls are supported");
            }
            const actionToPerform = {
                chain: "NEAR",
                methodName: tx.actions[0].params.methodName,
                args: tx.actions[0].params.args,
                targetContractId: tx.receiverId,
                attachedDepositNear: tx.actions[0].params.deposit || "0",
                gas: tx.actions[0].params.gas || "30000000000000",
            };
            console.log("Action to perform", actionToPerform);
            const { signatures, txnDatas } = await this.trialManager.performActions({
                trialAccountSecretKey: this.trialAccountSecretKey,
                actionsToPerform: [actionToPerform],
            });
            const result = await this.trialManager.broadcastTransaction({
                trialAccountSecretKey: this.trialAccountSecretKey,
                actionToPerform,
                signatureResult: signatures[0],
                txnData: txnDatas[0],
            });
            console.log("Result", result);
            if ((0, near_1.isFinalExecutionOutcome)(result)) {
                transactionResults.push(result);
            }
        }
        return transactionResults;
    }
    async signIn() {
        console.log("Signing in with trial account.");
        return [{ accountId: this.trialAccountId }];
    }
    async signOut() {
        console.log("Signing out trial account.");
        localStorage.removeItem("trialAccountSecretKey");
    }
    async getAvailableBalance() {
        return BigInt(0); // Placeholder for balance; requires API query for accurate info
    }
    async getAccounts() {
        return [{ accountId: this.trialAccountId }];
    }
    async switchAccount(id) {
        console.log("Switching accounts is not supported in this setup.");
    }
}
exports.KeypomTrialSelector = KeypomTrialSelector;
