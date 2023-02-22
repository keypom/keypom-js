import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { Transaction } from "@near-wallet-selector/core/lib/wallet";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import * as nearAPI from 'near-api-js';
import { Account, Near } from "near-api-js";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { PasswordPerUse } from "./types/drops";
import { FCData } from "./types/fc";
import { FTData, FungibleTokenMetadata } from "./types/ft";
import { GeneratedKeyPairs } from "./types/general";
import { NonFungibleTokenMetadata, ProtocolReturnedNonFungibleTokenObject } from "./types/nft";
import { CreateDropProtocolArgs } from "./types/params";
type AnyWallet = BrowserWalletBehaviour | Wallet;
export declare const exportedNearAPI: typeof nearAPI;
export declare const ATTACHED_GAS_FROM_WALLET: number;
export declare const key2str: (v: any) => any;
/**
 * Get the public key from a given secret key.
 *
 * @param {string} secretKey - The secret key you wish to get the public key from
 *
 * @returns {Promise<string>} - The public key
 *
 * @example
 * ```js
 * const pubKey = await getPubFromSecret("ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1");
 * console.log(pubKey);
 * ```
 * @group Utility
 */
export declare const getPubFromSecret: (secretKey: string) => Promise<string>;
/**
 * Check whether or not a given account ID exists on the network.
 *
 * @param {string} accountId - The account ID you wish to check
 *
 * @returns {Promise<boolean>} - A boolean indicating whether or not the account exists
 *
 * @example
 * ```js
 * const accountExists = await accountExists("benji.near");
 * console.log(accountExists); // true
 * ```
 * @group Utility
 */
export declare const accountExists: (accountId: any) => Promise<boolean>;
/**
 * Get the NFT Object (metadata, owner, approval IDs etc.) for a given token ID on a given contract.
 *
 * @param {string} contractId - The contract ID of the NFT contract
 * @param {string} tokenId - The token ID of the NFT you wish to get the metadata for
 *
 * @returns {Promise<ProtocolReturnedNonFungibleTokenObject>} - The NFT Object
 *
 * @example
 * ```js
 * const nft = await getNFTMetadata({
 *     contractId: "nft.keypom.testnet",
 *     tokenId: "1"
 * });
 * console.log(nft);
 * ```
 * @group Utility
 */
export declare const getNFTMetadata: ({ contractId, tokenId }: {
    contractId: string;
    tokenId: string;
}) => Promise<ProtocolReturnedNonFungibleTokenObject>;
/**
 * Get the FT Metadata for a given fungible token contract. This is used to display important information such as the icon for the token, decimal format etc.
 *
 * @param {string} contractId - The contract ID of the FT contract
 *
 * @returns {Promise<FungibleTokenMetadata>} - The FT Metadata
 *
 * @example
 * ```js
 * const ft = await getFTMetadata({
 *    contractId: "ft.keypom.testnet"
 * });
 * console.log(ft);
 * ```
 * @group Utility
 */
export declare const getFTMetadata: ({ contractId }: {
    contractId: string;
}) => Promise<FungibleTokenMetadata>;
/**
 * Creates a new NFT series on the official Keypom Series contracts. This is for lazy minting NFTs as part of an FC drop.
 *
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 *	await initKeypom({
 *		// near,
 *		network: 'testnet',
 *		funder: {
 *			accountId,
 *			secretKey,
 *		}
 *	})
 *
 *	const {keys, dropId} = await createDrop({
 *		numKeys: 1,
 *		config: {
 *			usesPerKey: 100
 *		},
 *		metadata: "My Cool Drop Title!",
 *		depositPerUseNEAR: 0.5,
 *		fcData: {
 *			methods: [[
 *				{
 *					receiverId: `nft-v2.keypom.testnet`,
 *					methodName: "nft_mint",
 *					args: "",
 *					dropIdField: "mint_id",
 *					accountIdField: "receiver_id",
 *					attachedDeposit: parseNearAmount("0.1")
 *				}
 *			]]
 *		}
 *	})
 *
 *	const res = await createNFTSeries({
 *		dropId,
 *		metadata: {
 *			title: "Moon NFT!",
 *			description: "A cool NFT for the best dog in the world.",
 *			media: "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
 *			copies: 500
 *		}
 *	});
 *	console.log('res: ', res)
 *
 *	const URLs = formatLinkdropUrl({
 *		baseUrl: "localhost:3000/claim",
 *		secretKeys: keys.secretKeys
 *	})
 *	console.log('URLs: ', URLs)
 * ```
 * @group Utility
*/
export declare const createNFTSeries: ({ account, wallet, dropId, metadata, royalty }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop that should have a series associated with it. */
    dropId: string;
    /** The metadata that all minted NFTs will have. */
    metadata: NonFungibleTokenMetadata;
    /** Any royalties associated with the series (as per official NEP-199 standard: https://github.com/near/NEPs/blob/master/neps/nep-0199.md) */
    royalty?: Map<string, number> | undefined;
}) => Promise<void | FinalExecutionOutcome[]>;
/**
 * Constructs a valid linkdrop URL for a given claim page or custom URL. To view the list of supported claim pages, see the exported `supportedLinkdropClaimPages` variable.
 *
 * @param {string | string[]} secretKeys - Either a single secret key or an array of secret keys that should be embedded in the linkdrop URLs.
 * @param {string=} claimPage - A valid reference to the claim page. See the exported `supportedLinkdropClaimPages` variable for a list of supported claim pages. If not provided, a custom base URL must be provided.
 * @param {string=} networkId - The network ID you wish to linkdrop on. If not provided, the current network that the SDK is connected to will be used.
 * @param {string=} contractId - The contract ID where the secret key belongs to. If not provided, the current contract ID that the SDK is connected to will be used.
 * @param {string=} customURL - A custom URL containing a `SECRET_KEY` string and `CONTRACT_ID` string for where to insert the secret key and contract ID. For example, a base URL of `foo.com/CONTRACT_ID#SECRET_KEY` with a contract `v2.keypom.near` and secret key `5CBLiJK21EQoB...` would result in `foo.com/v2.keypom.near#5CBLiJK21EQoB...`.
 *
 * @returns {string[]} - An array of the linkdrop URLs
 *
 * @example
 * Use the keypom claim page:
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     claimPage: "keypom",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with ONLY the secret key
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with both the secret key and contract ID
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo/CONTRACT_ID",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @group Utility
 */
export declare const formatLinkdropUrl: ({ claimPage, networkId, contractId, secretKeys, customURL }: {
    claimPage?: string | undefined;
    networkId?: string | undefined;
    contractId?: string | undefined;
    secretKeys: string[] | string;
    customURL?: string | undefined;
}) => string[];
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
 * @param {number=} autoMetaNonceStart (OPTIONAL) - Specify a starting index whereby the meta entropy will automatically increment by 1 for each key generated. This is to avoid having to pass in an array of meta entropy that simply increments by 1 each time.
 * This is very useful as auto key generation uses the drop ID, base password and key nonce. The drop ID and base password would be a constant and make up the root entropy and then the key nonce increments by 1 for each key generated.
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
 * let {publicKeys, secretKeys} = await generateKeys({
 *     numKeys: 1,
 *     rootEntropy: "my-global-password",
 *     metaEntropy: "user-password-123" // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 *
 * let pubKey = publicKeys[0];
 * let secretKey = secretKeys[0];
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
 *     rootEntropy: "my-global-password",
 *     metaEntropy: [
 *        `first-password:0`,
 *        `second-password:1`
 *    ]
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 *  * @example
 * Generate 50 keys exactly how the auto key generation would in createDrop and addKeys:
 * ```js
 * const dropId = '1676913490360';
 * const basePassword = "my-password";
 * // Generate 50 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 50,
 *     rootEntropy: `${basePassword}-${dropId}`,
 *     autoMetaNonceStart: 0
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 * @group Utility
 */
export declare const generateKeys: ({ numKeys, rootEntropy, metaEntropy, autoMetaNonceStart }: {
    /** The number of keys to generate. */
    numKeys: number;
    /** A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random. */
    rootEntropy?: string | undefined;
    /** An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply
 pass in the string itself directly (not within an array). */
    metaEntropy?: string | string[] | undefined;
    autoMetaNonceStart?: number | undefined;
}) => Promise<GeneratedKeyPairs>;
export declare const keypomView: ({ methodName, args }: {
    methodName: any;
    args: any;
}) => Promise<any>;
/** @group Utility */
export declare const execute: ({ transactions, account, wallet, fundingAccount, successUrl, }: {
    transactions: Transaction[];
    account: Account;
    wallet?: Wallet | undefined;
    fundingAccount?: nearAPI.Account | undefined;
    successUrl?: string | undefined;
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
