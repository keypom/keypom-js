import { KeyInfo } from "./types/drops";
import { ContractSourceMetadata } from "./types/general";
import { GetDropParams } from "./types/params";
import { ProtocolReturnedDrop } from "./types/protocol";
/**
 * Returns the balance associated with given key. This is used by the NEAR wallet to display the amount of the linkdrop
 *
 * @param {string} publicKey The public key that contains a balance
 *
 * @returns {Promise<string>} The amount of yoctoNEAR that is contained within the key
 *
 * @example <caption>Create a 1 $NEAR linkdrop and query for its balance</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of yoctoNEAR contained within the key
 * const keyBalance = await getKeyBalance({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyBalance: ', keyBalance)
 * ```
*/
export declare const getKeyBalance: ({ publicKey, }: {
    publicKey: string;
}) => Promise<string>;
/**
 * Query for the total supply of keys currently on the Keypom contract
 *
 * @returns {Promise<number>} The amount of keys.
 *
 * @example <caption>Query for the key supply on the `v1.keypom.testnet` contract</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the number of keys on the contract
 * const numKeys = await getKeyTotalSupply();
 *
 * console.log('numKeys: ', numKeys)
 * ```
*/
export declare const getKeyTotalSupply: () => Promise<number>;
/**
 * Paginate through all active keys on the contract and return a vector of key info.
 *
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo.
 *
 * @example <caption>Query for first 50 keys on the `v1.keypom.testnet` contract</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the first 50 keys on the contract
 * const keyInfo = await getKeys({
 *   start: 0,
 *   limit: 50
 * });
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
*/
export declare const getKeys: ({ start, limit }: {
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<KeyInfo>>;
/**
 * Returns the KeyInfo corresponding to a specific public key
 *
 * @param {string} publicKey the public key to get information for.
 *
 * @returns {Promise<KeyInfo>} Key information struct for that specific key.
 *
 * @example <caption>Create a drop and query for the key information</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfo = await getKeyInformation({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
*/
export declare const getKeyInformation: ({ publicKey }: {
    publicKey: string;
}) => Promise<KeyInfo>;
/**
 * Returns a vector of KeyInfo corresponding to a set of public keys passed in.
 *
 * @param {string[]} publicKeys Array of public keys to get information about
 *
 * @returns {Promise<Array<KeyInfo>>} Array of Key information structs for the keys passed in
 *
 * @example <caption>Create a drop and query for the key information for all keys created</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfos = await getKeyInformationBatch({
 *     publicKeys: keys.publicKeys
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
*/
export declare const getKeyInformationBatch: ({ publicKeys }: {
    publicKeys: string[];
}) => Promise<Array<KeyInfo>>;
/**
 * Get information about a specific drop given its drop ID.
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @returns {Drop} Drop information which may or may not have a keys field of type `KeyInfo` depending on if withKeys is specified as true.
 *
 * @example <caption>Create a simple drop and retrieve information about it:</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the drop information and also return the key information as well
 * const dropInfo = await getDropInformation({
 *     dropId,
 *     withKeys: true
 * })
 *
 * console.log('dropInfo: ', dropInfo)
 * ```
*/
export declare const getDropInformation: ({ dropId, withKeys }: {
    dropId: string;
    withKeys?: boolean | undefined;
}) => Promise<ProtocolReturnedDrop>;
/**
 * Returns the total supply of active keys for a given drop
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 *
 * @returns {Promise<number>} Number of active keys
 *
 * @example <caption>Create a drop with 5 keys and query for the key supply</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys, dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keySupply = await getKeySupplyForDrop({
 *     dropId
 * })
 *
 * console.log('keySupply: ', keySupply)
 * ```
*/
export declare const getKeySupplyForDrop: ({ dropId }: {
    dropId: string;
}) => Promise<number>;
/**
 * Paginate through all keys in a specific drop, returning an array of KeyInfo.
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo objects returned from pagination
 *
 * @example <caption>Create a drop with 5 keys and return all the key info objects</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keyInfos = await getKeysForDrop({
 *     dropId
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
*/
export declare const getKeysForDrop: ({ dropId, start, limit }: {
    dropId: string;
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<KeyInfo>>;
/**
 * Returns the total supply of active drops for a given account ID
 *
 * @param {string} accountId The account that the drops belong to.
 *
 * @returns {Promise<number>} Amount of drops
 *
 * @example <caption>Create a drop and check how many the owner has</caption>
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with no keys
 * await createDrop({
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of drops owned by the account
 * const dropSupply = await getDropSupplyForOwner({
 *     accountId: "benji_demo.testnet"
 * })
 *
 * console.log('dropSupply: ', dropSupply)
 * ```
*/
export declare const getDropSupplyForOwner: ({ accountId, }: {
    accountId: string;
}) => Promise<number>;
/**
 * Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
 *
 * @param {string} accountId The funding account that the drops belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through drops.
 * @param {number=} limit (OPTIONAL) How many drops to paginate through.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @example <caption>Get drop information for the last 5 drops owned by a given account</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * 	network: "testnet",
 * });
 *
 * // Get the number of drops the account has.
 * const numDrops = await getDropSupply({
 * 	accountId: "benjiman.testnet"
 * });
 *
 * // Query for drop information for the last 5 drops and their respective keys
 * const dropsAndKeys = await getDrops({
 * 	accountId: "benjiman.testnet",
 * 	start: numDrops - 5,
 * 	withKeys: true
 * })
 *
 * console.log('dropsAndKeys: ', dropsAndKeys)
 * ```
*/
export declare const getDrops: ({ accountId, start, limit, withKeys, }: GetDropParams) => Promise<ProtocolReturnedDrop[]>;
/**
 * Return the total supply of token IDs for a given NFT drop,
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 *
 * @returns {Promise<number>} The amount of token IDs on the drop
 *
 * @example <caption>Query for the supply of tokens on a specific drop</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the amount of token IDs on the drop
 * const tokenSupply = await getNftSupplyForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenSupply: ', tokenSupply)
 * ```
*/
export declare const getNftSupplyForDrop: ({ dropId }: {
    dropId: string;
}) => Promise<number>;
/**
 * Paginate through token IDs in an NFT drop to return a vector of token IDs.
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating from.
 * @param {number=} limit (OPTIONAL) How many token IDs to paginate through.
 *
 * @returns {Promise<Array<string>>} Vector of token IDs
 *
 * @example <caption>Query for a list of token IDs on a specific drop</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for a set of token IDs on the drop
 * const tokenList = await getNftTokenIDsForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenList: ', tokenList)
 * ```
*/
export declare const getNftTokenIDsForDrop: ({ dropId, start, limit }: {
    dropId: string;
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<string>>;
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
/**
 * Returns the source metadata for the Keypom contract that the SDK has been initialized on. This includes valuable information
 * such as which specific version the contract is on and link to exactly which GitHub commit is deployed.
 *
 * @returns {ContractSourceMetadata} The contract's source metadata
 *
 * @example <caption>Query for the current Keypom contract's source metadata</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the Keypom contract's source metadata
 * const metadata = await getContractSourceMetadata();
 *
 * console.log('metadata: ', metadata)
 * ```
*/
export declare const getContractSourceMetadata: () => Promise<ContractSourceMetadata>;
