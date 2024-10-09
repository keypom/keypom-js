// lib/TrialAccountManager.ts

import { Account } from "@near-js/accounts";
import { KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import {
    ActionToPerform,
    TrialData,
    TrialKey,
    MPCSignature,
    convertKeysToCamelCase,
    TrialAccountInfo,
} from "./types";
import { createTrial } from "./createTrial";
import { addTrialAccounts } from "./addTrialKeys";
import { activateTrialAccounts } from "./activateTrial";
import { performActions } from "./performAction";
import { broadcastTransaction } from "./broadcastTransaction";
import { checkActionValidity } from "./validityChecker";

/**
 * Class to manage trial accounts and trials.
 * Provides methods to create trials, add trial accounts,
 * activate trial accounts, perform actions, and broadcast transactions.
 */
export class TrialAccountManager {
    private trialContractId: string;
    private trialId?: number;
    private trialAccountId?: string;
    private trialSecretKey?: KeyPairString;
    private signerAccount: Account;
    private near: Near;

    /**
     * Constructs a new TrialAccountManager.
     * @param params - Parameters for initializing the manager.
     * @param params.trialContractId - The account ID of the trial contract.
     * @param params.signerAccount - The Account object used for signing transactions.
     * @param params.near - The NEAR connection instance.
     * @param params.config - The configuration object.
     * @param params.trialId - (Optional) The trial ID.
     * @param params.trialSecretKey - (Optional) The secret key for the trial account.
     * @param params.trialAccountId - (Optional) The account ID of the trial account.
     */
    constructor(params: {
        trialContractId: string;
        signerAccount: Account;
        near: Near;
        trialId?: number;
        trialSecretKey?: KeyPairString;
        trialAccountId?: string;
    }) {
        this.trialContractId = params.trialContractId;
        this.signerAccount = params.signerAccount;
        this.near = params.near;
        this.trialId = params.trialId;
        this.trialSecretKey = params.trialSecretKey;
        this.trialAccountId = params.trialAccountId;
    }

    /**
     * Creates a new trial on the trial contract.
     *
     * @param trialData - The trial data containing constraints.
     * @returns A Promise that resolves to the trial ID.
     * @throws Will throw an error if the trial creation fails.
     */
    async createTrial(trialData: TrialData): Promise<number> {
        const trialId = await createTrial({
            signerAccount: this.signerAccount,
            contractAccountId: this.trialContractId,
            trialData,
        });
        this.trialId = trialId;
        return trialId;
    }

    /**
     * Adds trial accounts to the trial contract by generating key pairs and deriving MPC keys.
     *
     * @param numberOfKeys - Number of trial accounts to add.
     * @returns A Promise that resolves to an array of TrialKey objects.
     * @throws Will throw an error if adding trial keys fails.
     */
    async addTrialAccounts(numberOfKeys: number): Promise<TrialKey[]> {
        if (this.trialId == null) {
            throw new Error("trialId is required to add trial accounts");
        }
        const trialKeys = await addTrialAccounts({
            signerAccount: this.signerAccount,
            contractAccountId: this.trialContractId,
            trialId: this.trialId,
            numberOfKeys,
        });
        return trialKeys;
    }

    /**
     * Activates a trial account on the trial contract.
     *
     * @param newAccountId - The account ID of the new trial account.
     * @returns A Promise that resolves when the account is activated.
     * @throws Will throw an error if activation of the trial account fails.
     */
    async activateTrialAccounts(newAccountId: string): Promise<void> {
        if (this.trialSecretKey == null) {
            throw new Error(
                "trialSecretKey is required to activate trial accounts"
            );
        }
        const trialAccountInfo = await this.getTrialData();
        if (trialAccountInfo.accountId !== null) {
            throw new Error(
                "trial account is already activated. accountId: " +
                    trialAccountInfo.accountId
            );
        }

        await activateTrialAccounts({
            near: this.near,
            contractAccountId: this.trialContractId,
            trialAccountIds: [newAccountId],
            trialAccountSecretKeys: [this.trialSecretKey],
        });
        this.trialAccountId = newAccountId;
    }

    /**
     * Performs one or more actions by requesting signatures from the MPC.
     *
     * @param actionsToPerform - Array of actions to perform.
     * @returns A Promise that resolves with signatures, nonces, and block hash.
     * @throws Will throw an error if trial credentials are missing or actions are invalid.
     */
    async performActions(actionsToPerform: ActionToPerform[]): Promise<{
        signatures: string[][];
        nonces: string[];
        blockHash: string;
    }> {
        if (!this.trialAccountId || !this.trialSecretKey) {
            throw new Error(
                "trialAccountId and trialSecretKey are required to perform actions"
            );
        }

        const trialAccountInfo = await this.getTrialData();

        if (!this.trialId) {
            throw new Error("trialId is required to perform actions");
        }
        // Check validity of actions
        checkActionValidity(actionsToPerform, trialAccountInfo.trialData);

        const result = await performActions({
            near: this.near,
            trialAccountId: this.trialAccountId,
            trialAccountSecretKey: this.trialSecretKey,
            contractAccountId: this.trialContractId,
            actionsToPerform,
        });
        return result;
    }

    /**
     * Broadcasts a signed transaction to the NEAR network.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @param params.actionToPerform - The action to perform.
     * @param params.signatureResult - The signature result from the MPC.
     * @param params.nonce - The nonce for the transaction.
     * @param params.blockHash - The block hash.
     * @returns A Promise that resolves when the transaction is broadcasted.
     * @throws Will throw an error if broadcasting fails or trial credentials are missing.
     */
    async broadcastTransaction(params: {
        actionToPerform: ActionToPerform;
        signatureResult: MPCSignature;
        nonce: string;
        blockHash: string;
    }): Promise<void> {
        if (!this.trialAccountId || !this.trialSecretKey) {
            throw new Error(
                "trialAccountId and trialSecretKey are required to broadcast transaction"
            );
        }

        const signerAccount = await this.near.account(this.trialAccountId);
        const trialAccountInfo: TrialAccountInfo = await this.getTrialData();

        await broadcastTransaction({
            signerAccount,
            actionToPerform: params.actionToPerform,
            signatureResult: params.signatureResult,
            nonce: params.nonce,
            blockHash: params.blockHash,
            mpcPublicKey: trialAccountInfo.mpcKey,
        });
    }

    /**
     * Retrieves the trial account info and converts it to camelCase.
     *
     * @returns A Promise that resolves to the trial data in camelCase format.
     * @throws Will throw an error if trial credentials are missing or retrieval fails.
     */
    async getTrialData(): Promise<TrialAccountInfo> {
        if (!this.trialAccountId) {
            throw new Error("trialAccountId is required to get trial data");
        }

        const signerAccount = await this.near.account(this.trialAccountId);

        // Retrieve trial account info from the contract
        const trialAccountInfoSnakeCase = await signerAccount.viewFunction({
            contractId: this.trialContractId,
            methodName: "get_trial_account_info",
            args: {
                trial_account_id: this.trialAccountId,
            },
        });

        // Convert snake_case data to camelCase
        const trialAccountInfoCamelCase: TrialAccountInfo =
            convertKeysToCamelCase(trialAccountInfoSnakeCase);

        return trialAccountInfoCamelCase;
    }

    /**
     * Sets the trial account credentials.
     * @param trialAccountId - The trial account ID.
     * @param trialSecretKey - The secret key for the trial account.
     */
    setTrialAccountCredentials(
        trialAccountId: string,
        trialSecretKey: KeyPairString
    ): void {
        this.trialAccountId = trialAccountId;
        this.trialSecretKey = trialSecretKey;
    }

    /**
     * Sets the trial ID.
     * @param trialId - The trial ID.
     */
    setTrialId(trialId: number): void {
        this.trialId = trialId;
    }
}
