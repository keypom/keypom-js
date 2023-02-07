import { formatNearAmount, parseNearAmount } from "near-api-js/lib/utils/format";
import { assert, isValidAccountObj } from "./checks";
import { getEnv } from "./keypom";

import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account } from "near-api-js";
import { getDropInformation } from "./views";

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
export const addToSaleAllowlist = async ({
	account,
	wallet,
    dropId,
    accountIds
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** The drop ID for the drop */
    dropId: string,
    /** A list of account IDs that should be added to the sale allowlist */
    accountIds: string[]
}) => {
	const {
		receiverId, execute, getAccount
	} = getEnv()

    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale allowlist.');
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
	account = await getAccount({ account, wallet });

    const dropInfo = await getDropInformation({dropId});
    assert(account!.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale allowlist.");
    assert(dropInfo.config?.sale, "The drop config must have a sale in order to add accounts to the sale allowlist.");
    
	const actions: any[] = []
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'add_to_sale_allowlist',
			args: {
                drop_id: dropId,
                account_ids: accountIds
            },
			gas: '100000000000000'
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}

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
export const removeFromSaleAllowlist = async ({
	account,
	wallet,
    dropId,
    accountIds
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** The drop ID for the drop */
    dropId: string,
    /** A list of account IDs that should be removed from the sale's allowlist */
    accountIds: string[]
}) => {
	const {
		receiverId, execute, getAccount
	} = getEnv()

    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale allowlist.');
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
	account = await getAccount({ account, wallet });

    const dropInfo = await getDropInformation({dropId});
    assert(account!.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale allowlist.");
    assert(dropInfo.config?.sale, "The drop config must have a sale in order to remove accounts from the sale allowlist.");
    
	const actions: any[] = []
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'remove_from_sale_allowlist',
			args: {
                drop_id: dropId,
                account_ids: accountIds
            },
			gas: '100000000000000'
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}

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
export const addToSaleBlocklist = async ({
	account,
	wallet,
    dropId,
    accountIds
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** The drop ID for the drop */
    dropId: string,
    /** A list of account IDs that should be added to the sale blocklist */
    accountIds: string[]
}) => {
	const {
		receiverId, execute, getAccount
	} = getEnv()

    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale blocklist.');
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
	account = await getAccount({ account, wallet });

    const dropInfo = await getDropInformation({dropId});
    assert(account!.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale blocklist.");
    assert(dropInfo.config?.sale, "The drop config must have a sale in order to add accounts to the sale blocklist.");
    
	const actions: any[] = []
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'add_to_sale_blocklist',
			args: {
                drop_id: dropId,
                account_ids: accountIds
            },
			gas: '100000000000000'
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}

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
 export const removeFromSaleBlocklist = async ({
	account,
	wallet,
    dropId,
    accountIds
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** The drop ID for the drop */
    dropId: string,
    /** A list of account IDs that should be removed from the sale's allowlist */
    accountIds: string[]
}) => {
	const {
		receiverId, execute, getAccount
	} = getEnv()

    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale blocklist.');
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
	account = await getAccount({ account, wallet });

    const dropInfo = await getDropInformation({dropId});
    assert(account!.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale blocklist.");
    assert(dropInfo.config?.sale, "The drop config must have a sale in order to remove accounts from the sale blocklist.");
    
	const actions: any[] = []
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'remove_from_sale_blocklist',
			args: {
                drop_id: dropId,
                account_ids: accountIds
            },
			gas: '100000000000000'
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}

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
 export const updateSale = async ({
	account,
	wallet,
    dropId,
	maxNumKeys,
	pricePerKeyNEAR,
	pricePerKeyYocto,
	autoWithdrawFunds,
	start,
	end
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** The drop ID for the drop */
    dropId: string,
    /** Maximum number of keys that can be added to this drop. If None, there is no max. */
    maxNumKeys?: number,
    /** 
     * Amount of $NEAR that the user needs to attach (if they are not the funder) on top of costs. This amount will be
     * Automatically sent to the funder's balance. If None, the keys are free to the public.
    */
    pricePerKeyNEAR?: number,
    pricePerKeyYocto?: string,
    /** 
     * Should the revenue generated be sent to the funder's account balance or
     * automatically withdrawn and sent to their NEAR wallet? 
    */
    autoWithdrawFunds?: boolean,
    /**
     * Minimum block timestamp before the public sale starts. If None, keys can be added immediately
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    start?: number,
    /**
     * Block timestamp dictating the end of the public sale. If None, keys can be added indefinitely
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    end?: number,
}) => {
	const {
		receiverId, execute, getAccount
	} = getEnv()

    assert(dropId && (maxNumKeys || pricePerKeyNEAR || pricePerKeyYocto || autoWithdrawFunds || start || end), 'Must pass in a drop ID and at least one of the other sale parameters to update');
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
	account = await getAccount({ account, wallet });

    const dropInfo = await getDropInformation({dropId});
    assert(account!.accountId == dropInfo.owner_id, "Only the owner of the drop can update the sale.");
    assert(dropInfo.config?.sale, "The drop config must have a sale in order to be updated.");
    
	const actions: any[] = []
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'update_sale',
			args: {
                drop_id: dropId,
        		max_num_keys: maxNumKeys,
        		price_per_key: pricePerKeyYocto || pricePerKeyNEAR ? parseNearAmount(pricePerKeyNEAR!.toString()) : undefined,
        		auto_withdraw_funds: autoWithdrawFunds,
        		start,
        		end,
            },
			gas: '100000000000000'
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}