import {
    FinalExecutionOutcome,
    InstantLinkWalletBehaviour,
    NetworkId,
    Transaction,
    VerifiedOwner,
    VerifyOwnerParams,
} from "@near-wallet-selector/core";
import { TrialAccountManager } from "../TrialAccountManager";
import { ActionToPerform, ChainType } from "../types";
import { KeyPairString } from "near-api-js/lib/utils";
import { isFinalExecutionOutcome } from "../../../deploy/utils/nearUtils";
import { FAILED_EXECUTION_OUTCOME } from "./types";
import { KeyType } from "near-api-js/lib/utils/key_pair";

export class KeypomTrialSelector implements InstantLinkWalletBehaviour {
    networkId: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountId: string;
    trialManager: TrialAccountManager;

    constructor({
        networkId,
        trialAccountSecretKey,
        trialAccountId,
    }: {
        networkId: string;
        trialAccountSecretKey: KeyPairString;
        trialAccountId: string;
    }) {
        this.networkId = networkId;
        this.trialAccountSecretKey = trialAccountSecretKey;
        this.trialAccountId = trialAccountId;

        this.trialManager = new TrialAccountManager({
            trialContractId: "1729530318593-trial-contract.testnet",
            mpcContractId: "v1.signer-prod.testnet",
            networkId: this.networkId as NetworkId,
        });
    }

    verifyOwner(params: VerifyOwnerParams): Promise<void | VerifiedOwner> {
        const verifiedOwned: VerifiedOwner = {
            accountId: this.trialAccountId,
            message: "",
            blockId: "",
            publicKey: "",
            signature: "",
            keyType: KeyType.ED25519,
        };
        return Promise.resolve(verifiedOwned);
    }

    getContractId(): string {
        return "1729530318593-trial-contract.testnet";
    }

    getAccountId(): string {
        return this.trialAccountId;
    }

    isSignedIn(): boolean {
        return Boolean(this.trialAccountSecretKey);
    }

    async signAndSendTransaction(params: any) {
        const actionToPerform: ActionToPerform = {
            chain: "NEAR",
            methodName: params.actions[0].methodName,
            args: params.actions[0].args,
            targetContractId: params.receiverId!,
            attachedDepositNear: params.actions[0].deposit || "0",
            gas: params.actions[0].gas || "30000000000000",
        };

        const { signatures, txnDatas } = await this.trialManager.performActions(
            {
                trialAccountSecretKey: this.trialAccountSecretKey,
                actionsToPerform: [actionToPerform],
            }
        );

        const result = await this.trialManager.broadcastTransaction({
            trialAccountSecretKey: this.trialAccountSecretKey,
            actionToPerform,
            signatureResult: signatures[0],
            txnData: txnDatas[0],
        });

        return isFinalExecutionOutcome(result)
            ? (result as FinalExecutionOutcome)
            : FAILED_EXECUTION_OUTCOME;
    }

    async signAndSendTransactions(params: { transactions: Transaction[] }) {
        const transactionResults: FinalExecutionOutcome[] = [];

        for (const tx of params.transactions) {
            if (tx.actions[0].type !== "FunctionCall") {
                throw new Error("Only function calls are supported");
            }

            const actionToPerform: ActionToPerform = {
                chain: "NEAR" as ChainType,
                methodName: tx.actions[0].params.methodName,
                args: tx.actions[0].params.args,
                targetContractId: tx.receiverId,
                attachedDepositNear: tx.actions[0].params.deposit || "0",
                gas: tx.actions[0].params.gas || "30000000000000",
            };

            const { signatures, txnDatas } =
                await this.trialManager.performActions({
                    trialAccountSecretKey: this.trialAccountSecretKey,
                    actionsToPerform: [actionToPerform],
                });

            const result = await this.trialManager.broadcastTransaction({
                trialAccountSecretKey: this.trialAccountSecretKey,
                actionToPerform,
                signatureResult: signatures[0],
                txnData: txnDatas[0],
            });

            if (isFinalExecutionOutcome(result)) {
                transactionResults.push(result as FinalExecutionOutcome);
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

    async switchAccount(id: string) {
        console.log("Switching accounts is not supported in this setup.");
    }
}
