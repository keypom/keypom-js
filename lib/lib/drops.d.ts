import * as nearAPI from "near-api-js";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account } from "near-api-js";
import { FCData } from './types/fc';
import { FTData } from './types/ft';
import { NFTData } from './types/nft';
import { ProtocolReturnedDrop } from './types/protocol';
import { SimpleData } from './types/simple';
import { CreateOrAddReturn } from './types/params';
import { DropConfig } from './types/drops';
type AnyWallet = BrowserWalletBehaviour | Wallet;
export declare const KEY_LIMIT = 50;
/**
 * Creates a new drop based on parameters passed in. This drop can have keys that are manually generated and passed in, or automatically generated. If they're
 * automatically generated, they can be based off a set of entropy. For NFT and FT drops, assets can automatically be sent to Keypom to register keys as part of the payload.
 * The deposit is estimated based on parameters that are passed in and the transaction can be returned instead of signed and sent to the network. This can allow you to get the
 * required deposit from the return value and use that to fund the account's Keypom balance to avoid multiple transactions being signed in the case of a drop with many keys.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Create a basic simple drop containing 10 keys each with 1 $NEAR. Each key is completely random:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Create a drop with 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await createDrop({
 * 	numKeys: 10,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ```
 *
 * @example
 * Init funder with root entropy and generate deterministic keys for a drop. Compare with manually generated keys:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. Root entropy is passed into the funder account so any generated keys
 * // Will be based off that entropy.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1",
 * 		rootEntropy: "my-global-secret-password"
 * 	}
 * });
 *
 * // Create a simple drop with 5 keys. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const { keys: keysFromDrop, dropId } = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 *
 * // Get the public and private keys from the keys generated by the drop
 * const {publicKeys, secretKeys} = keysFromDrop;
 * // Get the public and private keys from the keys that were manually generated
 * const {publicKeys: pubKeysGenerated, secretKeys: secretKeysGenerated} = manualKeys;
 * // These should match!
 * console.log('secretKeys: ', secretKeys)
 * console.log('secretKeysGenerated: ', secretKeysGenerated)
 *
 * // These should match!
 * console.log('publicKeys: ', publicKeys)
 * console.log('pubKeysGenerated: ', pubKeysGenerated)
 * ```
 *
 * @example
 * Use manually generated keys to create a drop:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 * // Create a drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 * ```
 *
 * @example
 * Create a simple drop with 1 key and 1 use per key. This 1 use-key should be password protected based on a base-password:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 *
 * const basePassword = "my-cool-password123";
 * // Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
 * const {keys} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 1,
 * 	basePassword
 * });
 *
 * // Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());
 * ```
 * @group Creating, And Claiming Drops
*/
export declare const createDrop: ({ account, wallet, dropId, numKeys, publicKeys, rootEntropy, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, simpleData, fcData, basePassword, passwordProtectedUses, useBalance, returnTransactions, successUrl }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /**
     * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
    */
    numKeys: number;
    /** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
    publicKeys?: string[] | undefined;
    /** How much $NEAR should be contained in each link. Unit in $NEAR (i.e `1` = 1 $NEAR) */
    depositPerUseNEAR?: Number | undefined;
    /** How much $yoctoNEAR should be contained in each link. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
    depositPerUseYocto?: string | undefined;
    /** Specify a custom drop ID rather than using the incrementing nonce on the contract. */
    dropId?: string | undefined;
    /** Allows specific drop behaviors to be configured such as the number of uses each key / link will have. */
    config?: DropConfig | undefined;
    /** String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON. */
    metadata?: string | undefined;
    /** For creating a simple drop, this contains necessary configurable information about the drop. */
    simpleData?: SimpleData | undefined;
    /** For creating a fungible token drop, this contains necessary configurable information about the drop. */
    ftData?: FTData | undefined;
    /** For creating a non-fungible token drop, this contains necessary configurable information about the drop. */
    nftData?: NFTData | undefined;
    /** For creating a function call drop, this contains necessary configurable information about the drop. */
    fcData?: FCData | undefined;
    /** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
    rootEntropy?: string | undefined;
    /** For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in. */
    basePassword?: string | undefined;
    /** For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use. */
    passwordProtectedUses?: number[] | undefined;
    /** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
    useBalance?: boolean | undefined;
    /** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
    returnTransactions?: boolean | undefined;
    /** When signing with a wallet, a success URl can be included that the user will be redirected to once the transaction has been successfully signed. */
    successUrl?: string | undefined;
}) => Promise<CreateOrAddReturn>;
/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @example
 * Create 5 drops and delete each of them:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // loop to create 5 simple drops each with 5 more keys than the next
 * for(var i = 0; i < 5; i++) {
 * 	// create 10 keys with no entropy (all random)
 * 	const {publicKeys} = await generateKeys({
 * 		numKeys: 5 * (i+1) // First drop will have 5, then 10, then 15 etc..
 * 	});
 *
 * 	// Create the simple
 * 	await createDrop({
 * 		publicKeys,
 * 		depositPerUseNEAR: 1,
 * 	});
 * }
 *
 * let drops = await getDrops({accountId: "benji_demo.testnet"});
 * console.log('drops: ', drops)
 *
 * await deleteDrops({
 * 	drops
 * })
 *
 * 	// Get the number of drops the account has after deletion (should be zero)
 * 	const numDrops = await getDropSupply({
 * 		accountId: "benjiman.testnet"
 * });
 * console.log('numDrops: ', numDrops)
 * ```
 * @group Deleting State
*/
export declare const deleteDrops: ({ account, wallet, drops, dropIds, withdrawBalance, }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** If the set of drop information for the drops you want to delete (from `getDropInformation` or `getDrops`) is already known to the client, it can be passed in instead of the drop IDs to reduce computation. */
    drops?: ProtocolReturnedDrop[] | undefined;
    /** Specify a set of drop IDs to delete. */
    dropIds?: string[] | undefined;
    /** Whether or not to withdraw any remaining balance on the Keypom contract. */
    withdrawBalance?: boolean | undefined;
}) => Promise<(void | nearAPI.providers.FinalExecutionOutcome[])[][]>;
export {};
