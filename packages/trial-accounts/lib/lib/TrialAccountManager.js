"use strict";
// lib/TrialAccountManager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialAccountManager = void 0;
const crypto_1 = require("@near-js/crypto");
const types_1 = require("./types");
const createTrial_1 = require("./createTrial");
const addTrialKeys_1 = require("./addTrialKeys");
const activateTrial_1 = require("./activateTrial");
const performAction_1 = require("./performAction");
const broadcastTransaction_1 = require("./broadcastTransaction");
const kdf_1 = require("./mpcUtils/kdf");
/**
 * Class to manage trial accounts and trials.
 * Provides methods to create trials, add trial accounts,
 * activate trial accounts, perform actions, and broadcast transactions.
 */
class TrialAccountManager {
    /**
     * Constructs a new TrialAccountManager.
     * @param params - Parameters for initializing the manager.
     */
    constructor(params) {
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
        return retryAsync(async () => {
            const signerAccount = await this.near.account("foo");
            return await signerAccount.viewFunction({
                contractId,
                methodName,
                args,
            });
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Creates a new trial on the trial contract with retry logic.
     *
     * @param trialData - The trial data containing constraints.
     * @returns A Promise that resolves to the trial ID.
     */
    async createTrial(trialData) {
        return retryAsync(async () => {
            const trialId = await (0, createTrial_1.createTrial)({
                signerAccount: this.signerAccount,
                trialContractId: this.trialContractId,
                trialData,
            });
            this.trialId = trialId;
            return trialId;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Adds trial accounts to the trial contract by generating key pairs with retry logic.
     *
     * @param numberOfKeys - Number of trial accounts to add.
     * @returns A Promise that resolves to an array of TrialKey objects.
     */
    async addTrialAccounts(numberOfKeys) {
        if (this.trialId === null || this.trialId === undefined) {
            throw new Error("trialId is required to add trial accounts");
        }
        return retryAsync(async () => {
            const trialKeys = await (0, addTrialKeys_1.addTrialAccounts)({
                signerAccount: this.signerAccount,
                trialContractId: this.trialContractId,
                mpcContractId: this.mpcContractId,
                trialId: this.trialId,
                numberOfKeys,
            });
            return trialKeys;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Activates a trial account on the trial contract with retry logic.
     *
     * @param newAccountId - The account ID of the new trial account.
     * @returns A Promise that resolves when the account is activated.
     */
    async activateTrialAccounts(newAccountId, chainId) {
        if (this.trialSecretKey === null || this.trialSecretKey === undefined) {
            throw new Error("trialSecretKey is required to activate trial accounts");
        }
        return retryAsync(async () => {
            const trialAccountInfo = await this.getTrialData();
            const trialAccountId = trialAccountInfo[chainId];
            if (trialAccountId) {
                throw new Error("trial account is already activated. accountId: " +
                    trialAccountId);
            }
            await (0, activateTrial_1.activateTrialAccounts)({
                near: this.near,
                trialContractId: this.trialContractId,
                trialAccountIds: [newAccountId],
                trialAccountSecretKeys: [this.trialSecretKey],
                chainIds: [chainId],
            });
            this.trialAccountId = newAccountId;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Performs one or more actions by requesting signatures from the MPC with retry logic.
     *
     * @param actionsToPerform - Array of actions to perform.
     * @returns A Promise that resolves with signatures, nonces, and block hash.
     */
    async performActions(actionsToPerform, evmProviderUrl) {
        if (!this.trialAccountId || !this.trialSecretKey) {
            throw new Error("trialAccountId and trialSecretKey are required to perform actions");
        }
        return retryAsync(async () => {
            const trialAccountInfo = await this.getTrialData();
            if (!this.trialId) {
                throw new Error("trialId is required to perform actions");
            }
            const result = await (0, performAction_1.performActions)({
                near: this.near,
                trialAccountInfo,
                trialAccountId: this.trialAccountId,
                trialAccountSecretKey: this.trialSecretKey,
                trialContractId: this.trialContractId,
                evmProviderUrl,
                actionsToPerform,
            });
            return result;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Broadcasts a signed transaction to the NEAR or EVM network with retry logic.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @returns A Promise that resolves when the transaction is broadcasted.
     */
    async broadcastTransaction(params) {
        return retryAsync(async () => {
            if (!this.trialSecretKey) {
                throw new Error("trialAccountId and trialSecretKey are required to broadcast transaction");
            }
            const trialAccountInfo = await this.getTrialData();
            const chainId = params.actionToPerform.chainId
                ? params.actionToPerform.chainId.toString()
                : "NEAR";
            if (trialAccountInfo.accountIdByChainId[chainId] !==
                params.signerAccountId) {
                throw new Error("Mismatch between trialAccountId and signerAccount. Found: " +
                    trialAccountInfo.accountIdByChainId[chainId] +
                    " Expected: " +
                    params.signerAccountId);
            }
            return await (0, broadcastTransaction_1.broadcastTransaction)({
                nearConnection: this.near,
                signerAccountId: params.signerAccountId,
                actionToPerform: params.actionToPerform,
                signatureResult: params.signatureResult,
                providerUrl: params.providerUrl,
                chainId,
                txnData: params.txnData,
                mpcPublicKey: trialAccountInfo.mpcKey,
            });
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Retrieves the trial account info and converts it to camelCase with retry logic.
     *
     * @returns A Promise that resolves to the trial data in camelCase format.
     */
    async getTrialData() {
        if (!this.trialSecretKey) {
            throw new Error("trialAccountId is required to get trial data");
        }
        return retryAsync(async () => {
            const trialPubKey = crypto_1.KeyPair.fromString(this.trialSecretKey)
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
            const trialAccountInfoCamelCase = (0, types_1.convertKeysToCamelCase)(trialAccountInfoSnakeCase);
            return trialAccountInfoCamelCase;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Retrieves the account ID for the given chain ID
     *
     * @returns A Promise that resolves to the accountId
     */
    async getTrialAccountIdForChain(trialAccountSecretKey, chainId) {
        return retryAsync(async () => {
            const trialPubKey = crypto_1.KeyPair.fromString(trialAccountSecretKey)
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
            const trialAccountInfoCamelCase = (0, types_1.convertKeysToCamelCase)(trialAccountInfoSnakeCase);
            return trialAccountInfoCamelCase.accountIdByChainId[chainId];
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Derives the ETH address from the passed in derivation path.
     * @param trialSecretKey - The secret key for the trial account.
     * @returns The ETH address.
     */
    async deriveEthAddress(trialSecretKey) {
        const path = crypto_1.KeyPair.fromString(trialSecretKey)
            .getPublicKey()
            .toString();
        const rootKey = await this.viewFunction({
            contractId: this.mpcContractId,
            methodName: "public_key",
            args: {},
        });
        // Convert root public key to uncompressed hex point
        const rootUncompressedHexPoint = (0, kdf_1.najPublicKeyStrToUncompressedHexPoint)(rootKey);
        // Derive child public key using root public key, signerId, and path
        const derivedUncompressedHexPoint = (0, kdf_1.deriveChildPublicKey)(rootUncompressedHexPoint, this.trialContractId, path);
        // Convert derived public key to EVM address
        const evmAddressFromDerivedKey = (0, kdf_1.uncompressedHexPointToEvmAddress)(derivedUncompressedHexPoint);
        return evmAddressFromDerivedKey;
    }
    /**
     * Sets the trial account credentials.
     * @param trialAccountId - The trial account ID.
     * @param trialSecretKey - The secret key for the trial account.
     */
    setTrialAccountCredentials(trialAccountId, trialSecretKey) {
        this.trialAccountId = trialAccountId;
        this.trialSecretKey = trialSecretKey;
    }
    /**
     * Sets the trial ID.
     * @param trialId - The trial ID.
     */
    setTrialId(trialId) {
        this.trialId = trialId;
    }
    /**
     * Sets the retry logic configuration.
     * @param maxRetries - The maximum number of retries.
     * @param initialDelayMs - The initial delay between retries (in milliseconds).
     * @param backoffFactor - The backoff factor for exponential backoff.
     */
    setRetryConfig(maxRetries, initialDelayMs, backoffFactor) {
        this.maxRetries = maxRetries;
        this.initialDelayMs = initialDelayMs;
        this.backoffFactor = backoffFactor;
    }
}
exports.TrialAccountManager = TrialAccountManager;
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
async function retryAsync(fn, retries = 3, delay = 1000, factor = 2) {
    let attempt = 0;
    let currentDelay = delay;
    while (attempt < retries) {
        try {
            return await fn();
        }
        catch (error) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            console.warn(`Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`, `Error: ${error.message || error}`);
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= factor; // Exponential backoff
        }
    }
    // This point should never be reached
    throw new Error("Unexpected error in retryAsync");
}
