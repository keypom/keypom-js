import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { Transaction } from "@near-wallet-selector/core/lib/wallet";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import * as nearAPI from 'near-api-js';
import { Account, Near } from "near-api-js";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { PasswordPerUse } from "./types/drops";
import { FCData } from "./types/fc";
import { FTData } from "./types/ft";
import { GeneratedKeyPairs } from "./types/general";
import { CreateDropProtocolArgs } from "./types/params";
type AnyWallet = BrowserWalletBehaviour | Wallet;
export declare const exportedNearAPI: typeof nearAPI;
export declare const ATTACHED_GAS_FROM_WALLET: number;
export declare const key2str: (v: any) => any;
/**
 * Generate a sha256 hash of a passed in string. If the string is hex encoded, set the fromHex flag to true.
 *
 * @param {string} str - the string you wish to hash. By default, this should be utf8 encoded. If the string is hex encoded, set the fromHex flag to true.
 * @param {boolean} fromHex (OPTIONAL) - A flag that should be set if the string is hex encoded. Defaults to false.
 *
 * @returns {Promise<string>} - The resulting hash
 *
 * @example
 * Generating the required password to pass into `claim` given a base password:
 * ```js
 * 	// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + publicKey + currentUse.toString());
 * ```
 * @group Utility
 */
export declare const hashPassword: (str: string, fromHex?: boolean) => Promise<string>;
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
 * @example
 * Generating 10 unique random keypairs with no entropy:
 * ```js
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
 * ```
 *
 * @example
 * Generating 1 keypair based on entropy:
 * ```js
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
 * ```
 *
 * @example
 * Generating 2 keypairs each with their own entropy:
 * ```js
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
 * ```
 * @group Utility
 */
export declare const generateKeys: ({ numKeys, rootEntropy, metaEntropy }: {
    /** The number of keys to generate. */
    numKeys: number;
    /** A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random. */
    rootEntropy?: string | undefined;
    /** An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply
 pass in the string itself directly (not within an array). */
    metaEntropy?: string | string[] | undefined;
}) => Promise<GeneratedKeyPairs>;
/**
 * Query for a user's current balance on the Keypom contract
 *
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 *
 * @returns {string} The user's current balance
 *
 * @example
 * Query for a user's current balance on the Keypom contract:
 * ```js
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
 * @group User Balance Functions
*/
export declare const getUserBalance: ({ accountId }: {
    accountId: string;
}) => Promise<string>;
export declare const keypomView: ({ methodName, args }: {
    methodName: any;
    args: any;
}) => Promise<any>;
/** @group Utility */
export declare const execute: ({ transactions, account, wallet, fundingAccount, }: {
    transactions: Transaction[];
    account: Account;
    wallet?: Wallet | undefined;
    fundingAccount?: nearAPI.Account | undefined;
}) => Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>>;
/**
 * For FT Drops, keys need to be registered before they can be used. This is done via the `ft_transfer_call` method on the FT contract.
 * This is a convenience method to make that process easier.
 *
 * @example
 * Send FTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * await ftTransferCall({
 *     contractId: "ft.keypom.testnet",
 *     amount: "1",
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
export declare const ftTransferCall: ({ account, wallet, contractId, absoluteAmount, amount, dropId, returnTransaction, }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The fungible token contract ID. */
    contractId: string;
    /** Amount of tokens to transfer but considering the decimal amount (non human-readable).
     *  Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1"
    */
    absoluteAmount?: string | undefined;
    /**
     * Human readable format for the amount of tokens to transfer.
     * Example: transferring one wNEAR should be passed in as "1" and NOT "1000000000000000000000000"
     */
    amount?: string | undefined;
    /** The drop ID to register the keys for. */
    dropId: string;
    /** If true, the transaction will be returned instead of being signed and sent. */
    returnTransaction?: boolean | undefined;
}) => Promise<Promise<void | FinalExecutionOutcome[]> | Transaction>;
/**
 * For NFT Drops, keys need to be registered before they can be used. This is done via the `nft_transfer_call` method on the NFT contract.
 * This is a convenience method to make that process easier.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string} contractId The non-fungible token contract ID.
 * @param {string[]} tokenIds A set of token IDs that should be sent to the Keypom contract in order to register keys.
 * @param {string} dropId The drop ID to register the keys for.
 * @param {boolean=} returnTransaction (OPTIONAL) If true, the transaction will be returned instead of being signed and sent.
 *
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * await nftTransferCall({
 *     contractId: "nft.keypom.testnet",
 *     tokenIds: ["1", "2", "3],
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
export declare const nftTransferCall: ({ account, wallet, contractId, tokenIds, dropId, returnTransactions, }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The non-fungible token contract ID. */
    contractId: string;
    /** A set of token IDs that should be sent to the Keypom contract in order to register keys. */
    tokenIds: string[];
    /** The drop ID to register the keys for. */
    dropId: string;
    /** If true, the transaction will be returned instead of being signed and sent. */
    returnTransactions?: boolean | undefined;
}) => Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]>;
export declare const parseFTAmount: (amt: string, decimals: number) => string;
export declare const transformTransactions: (transactions: Transaction[]) => SignAndSendTransactionOptions[];
/** @group Utility */
export declare const getStorageBase: ({ public_keys, deposit_per_use, drop_id, config, metadata, simple, ft, nft, fc, passwords_per_use }: CreateDropProtocolArgs) => string | null;
/** Initiate the connection to the NEAR blockchain. @group Utility */
export declare const estimateRequiredDeposit: ({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage, keyStorage, fcData, ftData, }: {
    /** The NEAR connection instance used to interact with the chain. This can either the connection that the SDK uses from `getEnv` or a separate connection. */
    near: Near;
    /** How much yoctoNEAR each key will transfer upon use. */
    depositPerUse: string;
    /** How many keys are being added to the drop. */
    numKeys: number;
    /** How many uses each key has. */
    usesPerKey: number;
    /** How much Gas will be attached to each key's use. */
    attachedGas: number;
    /** The estimated storage costs (can be retrieved through `getStorageBase`). */
    storage?: string | null | undefined;
    /** How much storage an individual key uses. */
    keyStorage?: string | null | undefined;
    /** The FC data for the drop that is being created. */
    fcData?: FCData | undefined;
    /** The FT data for the drop that is being created. */
    ftData?: FTData | undefined;
}) => Promise<string>;
/**
 * Generate passwords for a set of public keys. A unique password will be created for each specified use of a public key where the use is NOT zero indexed (i.e 1st use = 1).
 * The passwords will be generated via a double hash of the base password + public key + specific use
 *
 * @param {string[]} publicKeys The public keys that will be used to generate the set of passwords
 * @param {string[]} uses An array of numbers that dictate which uses should be password protected. The 1st use of a key is 1 (NOT zero indexed).
 * @param {string=} basePassword All the passwords will be generated from this base password. It will be double hashed with the public key.
 *
 * @returns {Promise<Array<Array<PasswordPerUse>>>} An array of objects for each key where each object has a password and maps it to its specific key use.
 * @group Utility
 */
export declare function generatePerUsePasswords({ publicKeys, uses, basePassword }: {
    publicKeys: string[];
    uses: number[];
    basePassword: string;
}): Promise<Array<Array<PasswordPerUse>>>;
export declare const snakeToCamel: (str: any) => any;
export declare const toCamel: (o: any) => any;
export {};
