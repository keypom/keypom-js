import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { SignAndSendTransactionParams, Transaction } from "@near-wallet-selector/core/lib/wallet";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { GeneratedKeyPairs } from "./types/general";
import { EstimatorParams, ExecuteParams, FTTransferCallParams, GenerateKeysParams, NFTTransferCallParams } from "./types/params";
export declare const ATTACHED_GAS_FROM_WALLET: number;
export declare const snakeToCamel: (s: any) => any;
export declare const key2str: (v: any) => any;
/**
 * Generate a sha256 hash of a passed in string. If the string is hex encoded, set the fromHex flag to true.
 *
 * @param {string} str - the string you wish to hash. By default, this should be utf8 encoded. If the string is hex encoded, set the fromHex flag to true.
 * @param {boolean} fromHex (OPTIONAL) - A flag that should be set if the string is hex encoded. Defaults to false.
 *
 * @returns {Promise<string>} - The resulting hash
 *
 * @example <caption>Generating the required password to pass into `claim` given a base password</caption>
 * ```js
 * 	// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hash(basePassword + publicKey + currentUse.toString());
 * ```
 */
export declare const hash: (str: string, fromHex?: boolean) => Promise<string>;
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
/**
 * Query for a user's current balance on the Keypom contract
 *
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 *
 * @returns {string} The user's current balance
 *
 * @example <caption>Query for a user's current balance on the Keypom contract</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the drop information for a specific drop
 * const dropInfo = await getDropInformation({
 * dropId: "1669840629120",
 * withKeys: true
 * })
 *
 * console.log('dropInfo: ', dropInfo)
 * ```
*/
export declare const getUserBalance: ({ accountId }: {
    accountId: string;
}) => Promise<string>;
export declare const keypomView: ({ methodName, args }: {
    methodName: any;
    args: any;
}) => Promise<any>;
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
/**
 * Generate passwords for a set of public keys. A unique password will be created for each specified use of a public key where the use is NOT zero indexed (i.e 1st use = 1).
 * The passwords will be generated via a double hash of the base password + public key + specific use
 *
 * @param {string[]} publicKeys The public keys that will be used to generate the set of passwords
 * @param {string[]} uses An array of numbers that dictate which uses should be password protected. The 1st use of a key is 1 (NOT zero indexed).
 * @param {string=} basePassword All the passwords will be generated from this base password. It will be double hashed with the public key.
 *
 * @returns {Promise<Array<Array<{ pw: string; key_use: number }>>>} An array of objects for each key where each object has a password and maps it to its specific key use.
 */
export declare function generatePerUsePasswords({ publicKeys, uses, basePassword }: {
    publicKeys: string[];
    uses: number[];
    basePassword: string;
}): Promise<Array<Array<{
    pw: string;
    key_use: number;
}>>>;
