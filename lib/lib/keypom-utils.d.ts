import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { SignAndSendTransactionParams, Transaction } from "@near-wallet-selector/core/lib/wallet";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { EstimatorParams, ExecuteParams, FTTransferCallParams, NFTTransferCallParams, GenerateKeysParams, GeneratedKeyPairs } from "./types";
export declare const ATTACHED_GAS_FROM_WALLET: number;
export declare const snakeToCamel: (s: any) => any;
export declare const key2str: (v: any) => any;
/**
 * Generate ed25519 KeyPairs that can be used for Keypom linkdrops, or full access keys to claimed accounts. These keys can optionally be derived from some entropy such as a root password and metadata pertaining to each key (user provided password etc.).
 * Entropy is useful for creating an onboarding experience where in order to recover a keypair, the client simply needs to provide the meta entropy (could be a user's password) and the secret root key like a UUID).
 *
 * @param {number} numKeys - The number of keys to generate
 * @param {string=} rootEntropy (OPTIONAL) - A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random.
 * @param {string=} metaEntropy (OPTIONAL) - An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply
 pass in the string itself directly (not within an array).
 *
 * @returns {Promise<GeneratedKeyPairs>} - An object containing an array of KeyPairs, Public Keys and Secret Keys.
 *
 * @example <caption>Generating 10 unique random keypairs with no entropy</caption>
 * // Generate 10 keys with no entropy (all random)
 * let keys = await generateKeys({
 *     numKeys: 10,
 * })
 *
 * let pubKey1 = keys.publicKeys[0];
 * let secretKey1 = keys.secretKeys[0];
 *
 * console.log('1st Public Key: ', pubKey1);
 * console.log('1st Secret Key: ', secretKey1)
 *
 * @example <caption>Generating 1 keypair based on entropy</caption>
 * // Generate 1 key with the given entropy
 * let keys = await generateKeys({
 *     numKeys: 1,
 *     entropy: {
 *         rootKey: "my-global-password",
 *         meta: "user-password-123",
 *     } // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 *
 * let pubKey = keys.publicKeys[0];
 * let secretKey = keys.secretKeys[0];
 *
 * console.log('Public Key: ', pubKey);
 * console.log('Secret Key: ', secretKey)
 *
 * @example <caption>Generating 2 keypairs each with their own entropy</caption>
 * // Generate 2 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 2,
 *     entropy: [
 *         {
 *             rootKey: "my-global-password",
 *             meta: "first-password",
 *             nonce: 1
 *         },
 *         {
 *             rootKey: "my-global-password",
 *             meta: "second-password",
 *             nonce: 2
 *         }
 *     ]
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 */
export declare const generateKeys: ({ numKeys, rootEntropy, metaEntropy }: GenerateKeysParams) => Promise<GeneratedKeyPairs>;
export declare const keypomView: ({ methodName, args }: {
    methodName: any;
    args: any;
}) => Promise<any>;
export declare const hasDeposit: ({ accountId, transactions, }: {
    accountId: any;
    transactions: any;
}) => void;
export declare const execute: ({ transactions, account, wallet, fundingAccount, }: ExecuteParams) => Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>>;
export declare const ftTransferCall: ({ account, contractId, args, returnTransaction, }: FTTransferCallParams) => Promise<void | FinalExecutionOutcome[]> | Transaction;
export declare const nftTransferCall: ({ account, contractId, receiverId, tokenIds, msg, returnTransactions, }: NFTTransferCallParams) => Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]>;
export declare const parseFTAmount: (amt: string, decimals: number) => string;
export declare const transformTransactions: (transactions: SignAndSendTransactionParams[]) => SignAndSendTransactionOptions[];
export declare const getStorageBase: ({ nftData, fcData }: {
    nftData: any;
    fcData: any;
}) => string | null;
export declare const estimateRequiredDeposit: ({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage, keyStorage, fcData, ftData, }: EstimatorParams) => Promise<string>;
