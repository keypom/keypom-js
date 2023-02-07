import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account } from "near-api-js";
type AnyWallet = BrowserWalletBehaviour | Wallet;
/**
 * Add a list of account IDs to a drop's sale allowlist. If the allowlist is empty, anyone can purchase keys. The sale object must exist in the drop's config for this to go through.
 *
 * @example
 * ```js
 * const {dropId} = await createDrop({
 * 		numKeys: 0,
 * 		depositPerUseNEAR: 0.1,
 * 		config: {
 * 			sale: {
 * 				maxNumKeys: 2,
 * 				pricePerKeyNEAR: 1
 * 			}
 * 		}
 * 	});
 *
 * 	let canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 * 	t.is(canAddKeys, true);
 *
 * 	await addToSaleAllowlist({dropId, accountIds: ["barfoo.testnet"]});
 * 	canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 * 	t.is(canAddKeys, false);
 *  ```
 * @group Public Sale Functions
 */
export declare const addToSaleAllowlist: ({ account, wallet, dropId, accountIds }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop */
    dropId: string;
    /** A list of account IDs that should be added to the sale allowlist */
    accountIds: string[];
}) => Promise<any>;
/**
 * Remove a list of account IDs from a drop's sale allowlist. If the allowlist is empty, anyone can purchase keys. The sale object must exist in the drop's config for this to go through.
 *
 * @example
 * ```js
 *	const {dropId} = await createDrop({
 *		numKeys: 0,
 *		depositPerUseNEAR: 0.1,
 *		config: {
 *			sale: {
 *				maxNumKeys: 2,
 *				pricePerKeyNEAR: 1,
 *				allowlist: ["foobar.testnet", "barfoo.testnet"]
 *			}
 *		}
 *	});
 *
 *	let canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, true);
 *
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "not_in_allowlist.testnet"});
 *	t.is(canAddKeys, false);
 *
 *	await removeFromSaleAllowlist({dropId, accountIds: ["foobar.testnet"]});
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, false);
 *
 *	await removeFromSaleAllowlist({dropId, accountIds: ["barfoo.testnet"]});
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, true);
 *  ```
 * @group Public Sale Functions
 */
export declare const removeFromSaleAllowlist: ({ account, wallet, dropId, accountIds }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop */
    dropId: string;
    /** A list of account IDs that should be removed from the sale's allowlist */
    accountIds: string[];
}) => Promise<any>;
/**
 * Add a list of account IDs to a drop's sale blocklist. The sale object must exist in the drop's config for this to go through.
 *
 * @example
 * ```js
 *	const {dropId} = await createDrop({
 *		numKeys: 0,
 *		depositPerUseNEAR: 0.1,
 *		config: {
 *			sale: {
 *				maxNumKeys: 2,
 *				pricePerKeyNEAR: 1
 *			}
 *		}
 *	});
 *
 *	let canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, true);
 *
 *	await addToSaleBlocklist({dropId, accountIds: ["foobar.testnet"]});
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, false);
 *  ```
 * @group Public Sale Functions
 */
export declare const addToSaleBlocklist: ({ account, wallet, dropId, accountIds }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop */
    dropId: string;
    /** A list of account IDs that should be added to the sale blocklist */
    accountIds: string[];
}) => Promise<any>;
/**
 * Remove a list of account IDs from a drop's sale blocklist. The sale object must exist in the drop's config for this to go through.
 *
 * @example
 * ```js
 *	const {dropId} = await createDrop({
 *		numKeys: 0,
 *		depositPerUseNEAR: 0.1,
 *		config: {
 *			sale: {
 *				maxNumKeys: 2,
 *				pricePerKeyNEAR: 1,
 *				blocklist: ["foobar.testnet"]
 *			}
 *		}
 *	});
 *
 *	let canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, false);
 *
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "not_in_blocklist.testnet"});
 *	t.is(canAddKeys, true);
 *
 *	await removeFromSaleBlocklist({dropId, accountIds: ["foobar.testnet"]});
 *	canAddKeys = await canUserAddKeys({dropId, accountId: "foobar.testnet"});
 *	t.is(canAddKeys, true);
 *  ```
 * @group Public Sale Functions
 */
export declare const removeFromSaleBlocklist: ({ account, wallet, dropId, accountIds }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop */
    dropId: string;
    /** A list of account IDs that should be removed from the sale's allowlist */
    accountIds: string[];
}) => Promise<any>;
/**
 * Remove a list of account IDs from a drop's sale blocklist. The sale object must exist in the drop's config for this to go through.
 *
 * @example
 * ```js
 *	const {dropId} = await createDrop({
 *		numKeys: 0,
 *		depositPerUseNEAR: 0.1,
 *		config: {
 *			sale: {
 *				maxNumKeys: 2,
 *				pricePerKeyNEAR: 1
 *			}
 *		}
 *	});
 *
 *	await updateSale({
 *		dropId,
 *		pricePerKeyNEAR: 2
 *	})
 *  ```
 *
 * @group Public Sale Functions
 */
export declare const updateSale: ({ account, wallet, dropId, maxNumKeys, pricePerKeyNEAR, pricePerKeyYocto, autoWithdrawFunds, start, end }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** The drop ID for the drop */
    dropId: string;
    /** Maximum number of keys that can be added to this drop. If None, there is no max. */
    maxNumKeys?: number | undefined;
    /**
     * Amount of $NEAR that the user needs to attach (if they are not the funder) on top of costs. This amount will be
     * Automatically sent to the funder's balance. If None, the keys are free to the public.
    */
    pricePerKeyNEAR?: number | undefined;
    pricePerKeyYocto?: string | undefined;
    /**
     * Should the revenue generated be sent to the funder's account balance or
     * automatically withdrawn and sent to their NEAR wallet?
    */
    autoWithdrawFunds?: boolean | undefined;
    /**
     * Minimum block timestamp before the public sale starts. If None, keys can be added immediately
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    start?: number | undefined;
    /**
     * Block timestamp dictating the end of the public sale. If None, keys can be added indefinitely
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    end?: number | undefined;
}) => Promise<any>;
export {};
