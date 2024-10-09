import { Account } from "@near-js/accounts";
import { KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import { ActionToPerform, TrialData, TrialKey, MPCSignature, TrialAccountInfo } from "./types";
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
export declare function retryAsync<T>(fn: () => Promise<T>, retries?: number, delay?: number, factor?: number): Promise<T>;
/**
 * Class to manage trial accounts and trials.
 * Provides methods to create trials, add trial accounts,
 * activate trial accounts, perform actions, and broadcast transactions.
 */
export declare class TrialAccountManager {
    private trialContractId;
    private trialId?;
    private trialAccountId?;
    private trialSecretKey?;
    private signerAccount;
    private near;
    private maxRetries;
    private initialDelayMs;
    private backoffFactor;
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
    });
    /**
     * Creates a new trial on the trial contract with retry logic.
     *
     * @param trialData - The trial data containing constraints.
     * @returns A Promise that resolves to the trial ID.
     */
    createTrial(trialData: TrialData): Promise<number>;
    /**
     * Adds trial accounts to the trial contract by generating key pairs with retry logic.
     *
     * @param numberOfKeys - Number of trial accounts to add.
     * @returns A Promise that resolves to an array of TrialKey objects.
     */
    addTrialAccounts(numberOfKeys: number): Promise<TrialKey[]>;
    /**
     * Activates a trial account on the trial contract with retry logic.
     *
     * @param newAccountId - The account ID of the new trial account.
     * @returns A Promise that resolves when the account is activated.
     */
    activateTrialAccounts(newAccountId: string): Promise<void>;
    /**
     * Performs one or more actions by requesting signatures from the MPC with retry logic.
     *
     * @param actionsToPerform - Array of actions to perform.
     * @returns A Promise that resolves with signatures, nonces, and block hash.
     */
    performActions(actionsToPerform: ActionToPerform[]): Promise<{
        signatures: string[][];
        nonces: string[];
        blockHash: string;
    }>;
    /**
     * Broadcasts a signed transaction to the NEAR network with retry logic.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @returns A Promise that resolves when the transaction is broadcasted.
     */
    broadcastTransaction(params: {
        actionToPerform: ActionToPerform;
        signatureResult: MPCSignature;
        nonce: string;
        blockHash: string;
    }): Promise<void>;
    /**
     * Retrieves the trial account info and converts it to camelCase with retry logic.
     *
     * @returns A Promise that resolves to the trial data in camelCase format.
     */
    getTrialData(): Promise<TrialAccountInfo>;
    /**
     * Sets the trial account credentials.
     * @param trialAccountId - The trial account ID.
     * @param trialSecretKey - The secret key for the trial account.
     */
    setTrialAccountCredentials(trialAccountId: string, trialSecretKey: KeyPairString): void;
    /**
     * Sets the trial ID.
     * @param trialId - The trial ID.
     */
    setTrialId(trialId: number): void;
    /**
     * Sets the retry logic configuration.
     * @param maxRetries - The maximum number of retries.
     * @param initialDelayMs - The initial delay between retries (in milliseconds).
     * @param backoffFactor - The backoff factor for exponential backoff.
     */
    setRetryConfig(maxRetries: number, initialDelayMs: number, backoffFactor: number): void;
}
