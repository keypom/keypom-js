import { AddKeyParams } from "./types";
/**
 * Add keys to a specific drop
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify the drop ID for which you want to add keys to.
 * @param {any} drop (OPTIONAL) If the drop information from getDropInformation is already known to the client, it can be passed in instead of the drop ID to reduce computation.
 * @param {number} numKeys Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed into the function, the keys will be
 * deterministically generated using the drop ID, key nonces, and entropy. Otherwise, each key will be generated randomly.
 * @param {string[]=} publicKeys (OPTIONAL) Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter.
 * @param {string[]=} nftTokenIds (OPTIONAL) If the drop type is an NFT drop, the token IDs can be passed in so that the tokens are automatically sent to the Keypom contract rather
 * than having to do two separate transactions.
 * @param {boolean=} hasBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit.
*/
export declare const addKeys: ({ account, wallet, dropId, drop, numKeys, publicKeys, nftTokenIds, rootEntropy, hasBalance, }: AddKeyParams) => Promise<any>;
export declare const deleteKeys: ({ account, wallet, drop, keys, withdrawBalance, }: {
    account: any;
    wallet: any;
    drop: any;
    keys: any;
    withdrawBalance?: boolean | undefined;
}) => Promise<any>;
