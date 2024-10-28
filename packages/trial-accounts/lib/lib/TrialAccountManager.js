"use strict";
// lib/TrialAccountManager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialAccountManager = void 0;
const types_1 = require("./types");
const createTrial_1 = require("./createTrial");
const activateTrial_1 = require("./activateTrial");
const addTrialKeys_1 = require("./addTrialKeys");
const performAction_1 = require("./performAction");
const broadcastTransaction_1 = require("./broadcastTransaction");
const kdf_1 = require("./mpcUtils/kdf");
const near_1 = require("./networks/near");
const near_api_js_1 = require("near-api-js");
const key_stores_1 = require("near-api-js/lib/key_stores");
const utils_1 = require("near-api-js/lib/utils");
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
        this.mpcContractId = params.mpcContractId;
        this.maxRetries = params.maxRetries ?? 3; // Default to 3 retries
        this.initialDelayMs = params.initialDelayMs ?? 1000; // Default to 1 second
        this.backoffFactor = params.backoffFactor ?? 2; // Default backoff factor of 2
        const near = new near_api_js_1.Near({
            networkId: params.networkId,
            nodeUrl: "https://rpc.testnet.near.org",
            keyStore: new key_stores_1.InMemoryKeyStore(),
        });
        this.near = near;
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
    async createTrial({ trialData, signingAccount, }) {
        const fnArgs = (0, createTrial_1.getCreateTrialParams)(trialData);
        const result = await retryAsync(async () => {
            return await (0, near_1.sendTransaction)({
                signerAccount: signingAccount,
                receiverId: this.trialContractId,
                methodName: "create_trial",
                args: fnArgs,
                deposit: "1",
                gas: "300000000000000",
            });
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
        const trialId = result.status.SuccessValue
            ? parseInt(Buffer.from(result.status.SuccessValue, "base64").toString(), 10)
            : null;
        if (trialId === null) {
            throw new Error("Failed to create trial");
        }
        return trialId;
    }
    /**
     * Adds trial accounts to the trial contract by generating key pairs with retry logic.
     *
     * @param numberOfKeys - Number of trial accounts to add.
     * @returns A Promise that resolves to an array of TrialKey objects.
     */
    async addTrialAccounts({ trialId, numberOfKeys, signingAccount, }) {
        const trialKeys = await (0, addTrialKeys_1.generateTrialKeys)({
            trialContractId: this.trialContractId,
            mpcContractId: this.mpcContractId,
            numberOfKeys,
            viewFunction: this.viewFunction.bind(this),
        });
        // Prepare data to send to the contract
        const keysWithMpc = trialKeys.map((trialKey) => ({
            public_key: trialKey.trialAccountPublicKey,
            mpc_key: trialKey.mpcKey,
        }));
        const result = await retryAsync(async () => {
            // Call the `add_trial_keys` function
            return await (0, near_1.sendTransaction)({
                signerAccount: signingAccount,
                receiverId: this.trialContractId,
                methodName: "add_trial_keys",
                args: {
                    keys: keysWithMpc,
                    trial_id: trialId,
                },
                deposit: "1",
                gas: "300000000000000",
            });
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
        if (result.status.SuccessValue !== undefined) {
            return trialKeys;
        }
        else {
            throw new Error(`Failed to add trial accounts: ${JSON.stringify(result.status)}`);
        }
    }
    /**
     * Activates a trial account on the trial contract with retry logic.
     *
     * @param newAccountId - The account ID of the new trial account.
     * @returns A Promise that resolves when the account is activated.
     */
    async activateTrialAccounts({ trialAccountSecretKey, newAccountId, chainId, }) {
        const trialAccountInfo = await this.getTrialData(trialAccountSecretKey);
        const trialAccountId = trialAccountInfo[chainId];
        if (trialAccountId) {
            throw new Error("trial account is already activated. accountId: " +
                trialAccountId);
        }
        return retryAsync(async () => {
            await (0, activateTrial_1.activateTrialAccounts)({
                near: this.near,
                trialContractId: this.trialContractId,
                trialAccountIds: [newAccountId],
                trialAccountSecretKeys: [trialAccountSecretKey],
                chainIds: [chainId],
            });
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
    }
    /**
     * Performs one or more actions by requesting signatures from the MPC with retry logic.
     *
     * @param actionsToPerform - Array of actions to perform.
     * @returns A Promise that resolves with signatures, nonces, and block hash.
     */
    async performActions({ trialAccountSecretKey, actionsToPerform, evmProviderUrl, }) {
        const trialAccountInfo = await this.getTrialData(trialAccountSecretKey);
        const { txnArgs, txnDatas } = await (0, performAction_1.generateActionArgs)({
            near: this.near,
            trialAccountInfo,
            evmProviderUrl,
            actionsToPerform,
        });
        // Set the trial key in the keyStore
        const keyStore = this.near.connection.signer.keyStore;
        await keyStore.setKey(this.near.connection.networkId, this.trialContractId, utils_1.KeyPair.fromString(trialAccountSecretKey));
        // set the signer to the trial contract to actually perform the call_*_contract methods using the proxy key
        const signerAccount = await this.near.account(this.trialContractId);
        const signatures = await retryAsync(async () => {
            const signatures = [];
            let iter = 0;
            for (const actionToPerform of actionsToPerform) {
                const args = txnArgs[iter];
                if (actionToPerform.chain === "NEAR") {
                    // Call the perform_action method on the contract
                    const result = await (0, near_1.sendTransaction)({
                        signerAccount,
                        receiverId: this.trialContractId,
                        methodName: "call_near_contract",
                        args,
                        deposit: "0",
                        gas: "300000000000000",
                    });
                    // Extract the signature from the transaction result
                    const sigRes = (0, performAction_1.extractSignatureFromResult)(result);
                    signatures.push(sigRes);
                }
                else if (actionToPerform.chain === "EVM") {
                    // Prepare the arguments as per the contract's expectations
                    const result = await (0, near_1.sendTransaction)({
                        signerAccount,
                        receiverId: this.trialContractId,
                        methodName: "call_evm_contract",
                        args,
                        deposit: "0",
                        gas: "300000000000000",
                    });
                    // Handle the result, extract signatures, etc.
                    const sigRes = (0, performAction_1.extractSignatureFromResult)(result);
                    signatures.push(sigRes);
                }
            }
            iter++;
            return signatures;
        }, this.maxRetries, this.initialDelayMs, this.backoffFactor);
        return { signatures, txnDatas };
    }
    /**
     * Broadcasts a signed transaction to the NEAR or EVM network with retry logic.
     *
     * @param params - The parameters required to broadcast the transaction.
     * @returns A Promise that resolves when the transaction is broadcasted.
     */
    async broadcastTransaction(params) {
        const trialAccountInfo = await this.getTrialData(params.trialAccountSecretKey);
        const chainId = params.actionToPerform.chainId
            ? params.actionToPerform.chainId.toString()
            : "NEAR";
        const trialAccountId = trialAccountInfo.accountIdByChainId[chainId];
        if (!trialAccountId) {
            throw new Error(`No trial account found for chain ${chainId}`);
        }
        return retryAsync(async () => {
            return await (0, broadcastTransaction_1.broadcastTransaction)({
                nearConnection: this.near,
                signerAccountId: trialAccountId,
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
    async getTrialData(trialSecretKey) {
        return retryAsync(async () => {
            const trialPubKey = utils_1.KeyPair.fromString(trialSecretKey)
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
            const trialPubKey = utils_1.KeyPair.fromString(trialAccountSecretKey)
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
        const path = utils_1.KeyPair.fromString(trialSecretKey)
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
