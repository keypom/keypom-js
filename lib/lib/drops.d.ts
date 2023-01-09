import { CreateDropParams, GetDropParams } from "./types";
export declare const createDrop: ({ account, wallet, dropId, publicKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, simpleData, fcData, hasBalance, }: CreateDropParams) => Promise<{
    responses: any;
}>;
/**
 * Get the number of active drops for a given account ID. Active refers to ones exist on the contract and haven't been deleted.
 *
 * @param {string} accountId The account to get the number of active drops for.
 *
 * @returns {Promise<number>} The number of active drops for the given account ID.
 *
 * @example <caption>Query for the number of drops owned by an account</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * 	network: "testnet",
 * });
 *
 * // Query for the number of drops owned by the given account
 * const numDrops = await getDropSupply({
 * 	accountId: "benjiman.testnet"
 * })
 *
 * console.log('numDrops: ', numDrops)
 * ```
*/
export declare const getDropSupply: ({ accountId, }: {
    accountId: string;
}) => Promise<any>;
/**
 * Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
 *
 * @param {string} accountId The funding account that the drops belong to.
 * @param {string= | number=} (OPTIONAL) Where to start paginating through drops.
 * @param {number=} (OPTIONAL) How many drops to paginate through.
 * @param {boolean=} (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
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
export declare const getDrops: ({ accountId, start, limit, withKeys, }: GetDropParams) => Promise<any>;
export declare const deleteDrops: ({ account, wallet, drops, withdrawBalance, }: {
    account: any;
    wallet: any;
    drops: any;
    withdrawBalance?: boolean | undefined;
}) => Promise<any[]>;
