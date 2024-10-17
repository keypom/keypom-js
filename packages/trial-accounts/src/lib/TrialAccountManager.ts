// lib/TrialAccountManager.ts

import { Account } from "@near-js/accounts";
import { KeyPairString, KeyPair } from "@near-js/crypto";
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
import { addTrialAccounts as addTrialKeys } from "./addTrialKeys";
import { activateTrialAccounts } from "./activateTrial";
import { performActions } from "./performAction";
import { broadcastTransaction } from "./broadcastTransaction";
import {
    deriveChildPublicKey,
    najPublicKeyStrToUncompressedHexPoint,
    uncompressedHexPointToEvmAddress,
} from "./mpcUtils/kdf";
import { checkActionValidity } from "./validityChecker";
import { TransactionResponse } from "ethers";
import { FinalExecutionOutcome } from "@near-js/types";

/**
 * Class to manage trial accounts and trials.
 * Provides methods to create trials, add trial accounts,
 * activate trial accounts, perform actions, and broadcast transactions.
 */
export class TrialAccountManager {
    private trialContractId: string;
    private mpcContractId: string;
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
     */
    constructor(params: {
        trialContractId: string;
        signerAccount: Account;
        near: Near;
        mpcContractId: string;
        trialId?: number;
        trialSecretKey?: KeyPairString;
        trialAccountId?: string;
        maxRetries?: number;
        initialDelayMs?: number;
        backoffFactor?: number;
    }) {
        this.trialContractId = params.trialContractId;
        this.signerAccount = params.signerAccount;
        this.mpcContractId = params.mpcContractId;
        this.near = params.near;
        this.trialId = params.trialId;
        this.trialSecretKey = params.trialSecretKey;
        this.trialAccountId = params.trialAccountId;
        this.maxRetries = params.maxRetries ?? 3; // Default to 3 retries
        this.initialDelayMs = params.initialDelayMs ?? 1000; // Default to 1 second
        this.backoffFactor = params.backoffFactor ?? 2; // Default backoff factor of 2
    }

    /**
     * View function on the trial contract with retry logic.
     *
     * @param contractId - The ID of the contract to view.
     * @param methodName - The name of the method to view.
     * @param args - The arguments to pass to the method.
     *
     * @returns A Promise that resolves to the result of the view function.
     *
     * @throws Will throw an error if the view function fails.
     * @throws Will throw an error if the view function exceeds the maximum number of retries.
     */
    async viewFunction({ contractId, methodName, args }) {
        return retryAsync(
            async () => {
                const signerAccount = await this.near.account("foo");
                return await signerAccount.viewFunction({
                    contractId,
                    methodName,
                    args,
                });
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
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
                    trialContractId: this.trialContractId,
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
                const trialKeys = await addTrialKeys({
                    signerAccount: this.signerAccount,
                    trialContractId: this.trialContractId,
                    mpcContractId: this.mpcContractId,
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
    async activateTrialAccounts(
        newAccountId: string,
        chainId: string
    ): Promise<void> {
        if (this.trialSecretKey === null || this.trialSecretKey === undefined) {
            throw new Error(
                "trialSecretKey is required to activate trial accounts"
            );
        }
        return retryAsync(
            async () => {
                const trialAccountInfo = await this.getTrialData();
                const trialAccountId = trialAccountInfo[chainId];
                if (trialAccountId) {
                    throw new Error(
                        "trial account is already activated. accountId: " +
                            trialAccountId
                    );
                }

                await activateTrialAccounts({
                    near: this.near,
                    trialContractId: this.trialContractId,
                    trialAccountIds: [newAccountId],
                    trialAccountSecretKeys: [this.trialSecretKey!],
                    chainIds: [chainId],
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
    async performActions(
        actionsToPerform: ActionToPerform[],
        evmProviderUrl?: string
    ): Promise<{
        signatures: MPCSignature[];
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
                    trialAccountInfo.trialData,
                    trialAccountInfo.usageStats,
                    Date.now()
                );

                const result = await performActions({
                    near: this.near,
                    trialAccountId: this.trialAccountId!,
                    trialAccountSecretKey: this.trialSecretKey!,
                    trialContractId: this.trialContractId,
                    evmProviderUrl,
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
     * Broadcasts a signed transaction to the NEAR or EVM network with retry logic.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @returns A Promise that resolves when the transaction is broadcasted.
     */
    async broadcastTransaction(params: {
        actionToPerform: ActionToPerform;
        signatureResult: MPCSignature;
        signerAccountId: string;
        providerUrl?: string;
        chainId: string;
        nonce: string;
        blockHash: string;
    }): Promise<TransactionResponse | FinalExecutionOutcome> {
        return retryAsync(
            async () => {
                if (!this.trialSecretKey) {
                    throw new Error(
                        "trialAccountId and trialSecretKey are required to broadcast transaction"
                    );
                }

                const trialAccountInfo: TrialAccountInfo =
                    await this.getTrialData();

                if (
                    trialAccountInfo.accountIdByChainId[params.chainId] !==
                    params.signerAccountId
                ) {
                    throw new Error(
                        "Mismatch between trialAccountId and signerAccount. Found: " +
                            trialAccountInfo.accountIdByChainId[
                                params.chainId
                            ] +
                            " Expected: " +
                            params.signerAccountId
                    );
                }

                return await broadcastTransaction({
                    nearConnection: this.near,
                    signerAccountId: params.signerAccountId,
                    actionToPerform: params.actionToPerform,
                    signatureResult: params.signatureResult,
                    providerUrl: params.providerUrl,
                    chainId: params.chainId,
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
        if (!this.trialSecretKey) {
            throw new Error("trialAccountId is required to get trial data");
        }
        return retryAsync(
            async () => {
                const trialPubKey = KeyPair.fromString(this.trialSecretKey!)
                    .getPublicKey()
                    .toString();

                // Retrieve trial account info from the contract
                const trialAccountInfoSnakeCase = await this.viewFunction({
                    contractId: this.trialContractId,
                    methodName: "get_trial_account_info",
                    args: {
                        public_key: trialPubKey,
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
     * Retrieves the account ID for the given chain ID
     *
     * @returns A Promise that resolves to the accountId
     */
    async getTrialAccountIdForChain(
        trialAccountSecretKey: KeyPairString,
        chainId: string
    ): Promise<string> {
        return retryAsync(
            async () => {
                const trialPubKey = KeyPair.fromString(trialAccountSecretKey)
                    .getPublicKey()
                    .toString();

                // Retrieve trial account info from the contract
                const trialAccountInfoSnakeCase = await this.viewFunction({
                    contractId: this.trialContractId,
                    methodName: "get_trial_account_info",
                    args: {
                        public_key: trialPubKey,
                    },
                });

                // Convert snake_case data to camelCase
                const trialAccountInfoCamelCase: TrialAccountInfo =
                    convertKeysToCamelCase(trialAccountInfoSnakeCase);

                return trialAccountInfoCamelCase.accountIdByChainId[chainId];
            },
            this.maxRetries,
            this.initialDelayMs,
            this.backoffFactor
        );
    }

    /**
     * Derives the ETH address from the passed in derivation path.
     * @param trialSecretKey - The secret key for the trial account.
     * @returns The ETH address.
     */
    async deriveEthAddress(trialSecretKey: KeyPairString): Promise<string> {
        const rootPublicKey = await this.viewFunction({
            contractId: this.mpcContractId,
            methodName: "public_key",
            args: {},
        });

        const trialPubKey = KeyPair.fromString(trialSecretKey)
            .getPublicKey()
            .toString();

        const publicKey = deriveChildPublicKey(
            najPublicKeyStrToUncompressedHexPoint(rootPublicKey),
            this.trialContractId,
            trialPubKey
        );

        return uncompressedHexPointToEvmAddress(publicKey);
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
async function retryAsync<T>(
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
