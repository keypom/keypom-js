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
 * Helper function to retry an async operation with exponential backoff.
 *
 * @param fn - The async function to retry.
 * @param retries - Number of retries.
 * @param delay - Initial delay in milliseconds.
 * @param factor - Multiplicative factor for delay.
 * @returns The result of the async function if successful.
 * @throws The last error encountered if all retries fail.
 */
export async function retryAsync<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
    factor: number = 2
): Promise<T> {
    let attempt = 0;
    let currentDelay = delay;

    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            console.warn(
                `Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`,
                `Error: ${error.message || error}`
            );
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= factor; // Exponential backoff
        }
    }

    // This point should never be reached
    throw new Error("Unexpected error in retryAsync");
}

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

    private maxRetries: number;
    private initialDelayMs: number;
    private backoffFactor: number;

    /**
     * Constructs a new TrialAccountManager.
     * @param params - Parameters for initializing the manager.
     * @param params.trialContractId - The account ID of the trial contract.
     * @param params.signerAccount - The Account object used for signing transactions.
     * @param params.near - The NEAR connection instance.
     * @param params.trialId - (Optional) The trial ID.
     * @param params.trialSecretKey - (Optional) The secret key for the trial account.
     * @param params.trialAccountId - (Optional) The account ID of the trial account.
     * @param params.maxRetries - Maximum retries for retry logic.
     * @param params.initialDelayMs - Initial delay for retry logic in milliseconds.
     * @param params.backoffFactor - Exponential backoff factor for retries.
     */
    constructor(params: {
        trialContractId: string;
        signerAccount: Account;
        near: Near;
        trialId?: number;
        trialSecretKey?: KeyPairString;
        trialAccountId?: string;
        maxRetries?: number;
        initialDelayMs?: number;
        backoffFactor?: number;
    }) {
        this.trialContractId = params.trialContractId;
        this.signerAccount = params.signerAccount;
        this.near = params.near;
        this.trialId = params.trialId;
        this.trialSecretKey = params.trialSecretKey;
        this.trialAccountId = params.trialAccountId;
        this.maxRetries = params.maxRetries ?? 3; // Default to 3 retries
        this.initialDelayMs = params.initialDelayMs ?? 1000; // Default to 1 second
        this.backoffFactor = params.backoffFactor ?? 2; // Default backoff factor of 2
    }

    /**
     * Creates a new trial on the trial contract with retry logic.
     *
     * @param trialData - The trial data containing constraints.
     * @returns A Promise that resolves to the trial ID.
     */
    async createTrial(trialData: TrialData): Promise<number> {
        return retryAsync(
            async () => {
                const trialId = await createTrial({
                    signerAccount: this.signerAccount,
                    contractAccountId: this.trialContractId,
                    trialData,
                });
                this.trialId = trialId;
                return trialId;
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Adds trial accounts to the trial contract by generating key pairs with retry logic.
     *
     * @param numberOfKeys - Number of trial accounts to add.
     * @returns A Promise that resolves to an array of TrialKey objects.
     */
    async addTrialAccounts(numberOfKeys: number): Promise<TrialKey[]> {
        if (this.trialId === null || this.trialId === undefined) {
            throw new Error("trialId is required to add trial accounts");
        }
        return retryAsync(
            async () => {
                const trialKeys = await addTrialAccounts({
                    signerAccount: this.signerAccount,
                    contractAccountId: this.trialContractId,
                    trialId: this.trialId!,
                    numberOfKeys,
                });
                return trialKeys;
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Activates a trial account on the trial contract with retry logic.
     *
     * @param newAccountId - The account ID of the new trial account.
     * @returns A Promise that resolves when the account is activated.
     */
    async activateTrialAccounts(newAccountId: string): Promise<void> {
        if (this.trialSecretKey === null || this.trialSecretKey === undefined) {
            throw new Error(
                "trialSecretKey is required to activate trial accounts"
            );
        }
        return retryAsync(
            async () => {
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
                    trialAccountSecretKeys: [this.trialSecretKey!],
                });
                this.trialAccountId = newAccountId;
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Performs one or more actions by requesting signatures from the MPC with retry logic.
     *
     * @param actionsToPerform - Array of actions to perform.
     * @returns A Promise that resolves with signatures, nonces, and block hash.
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
        return retryAsync(
            async () => {
                const trialAccountInfo = await this.getTrialData();

                if (!this.trialId) {
                    throw new Error("trialId is required to perform actions");
                }

                // Check validity of actions
                checkActionValidity(
                    actionsToPerform,
                    trialAccountInfo.trialData
                );

                const result = await performActions({
                    near: this.near,
                    trialAccountId: this.trialAccountId!,
                    trialAccountSecretKey: this.trialSecretKey!,
                    contractAccountId: this.trialContractId,
                    actionsToPerform,
                });
                return result;
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Broadcasts a signed transaction to the NEAR network with retry logic.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @returns A Promise that resolves when the transaction is broadcasted.
     */
    async broadcastTransaction(params: {
        actionToPerform: ActionToPerform;
        signatureResult: MPCSignature;
        nonce: string;
        blockHash: string;
    }): Promise<void> {
        return retryAsync(
            async () => {
                if (!this.trialAccountId || !this.trialSecretKey) {
                    throw new Error(
                        "trialAccountId and trialSecretKey are required to broadcast transaction"
                    );
                }

                const signerAccount = await this.near.account(
                    this.trialAccountId
                );
                const trialAccountInfo: TrialAccountInfo =
                    await this.getTrialData();

                await broadcastTransaction({
                    signerAccount,
                    actionToPerform: params.actionToPerform,
                    signatureResult: params.signatureResult,
                    nonce: params.nonce,
                    blockHash: params.blockHash,
                    mpcPublicKey: trialAccountInfo.mpcKey,
                });
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Retrieves the trial account info and converts it to camelCase with retry logic.
     *
     * @returns A Promise that resolves to the trial data in camelCase format.
     */
    async getTrialData(): Promise<TrialAccountInfo> {
        if (!this.trialAccountId) {
            throw new Error("trialAccountId is required to get trial data");
        }
        return retryAsync(
            async () => {
                const signerAccount = await this.near.account(
                    this.trialAccountId!
                );

                // Retrieve trial account info from the contract
                const trialAccountInfoSnakeCase =
                    await signerAccount.viewFunction({
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
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
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

    /**
     * Sets the retry logic configuration.
     * @param maxRetries - The maximum number of retries.
     * @param initialDelayMs - The initial delay between retries (in milliseconds).
     * @param backoffFactor - The backoff factor for exponential backoff.
     */
    setRetryConfig(
        maxRetries: number,
        initialDelayMs: number,
        backoffFactor: number
    ): void {
        this.maxRetries = maxRetries;
        this.initialDelayMs = initialDelayMs;
        this.backoffFactor = backoffFactor;
    }
}
