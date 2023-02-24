import { __awaiter } from "tslib";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { assert, isValidAccountObj } from "./checks";
import { getEnv } from "./keypom";
import { getDropInformation } from "./views";
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
export const addToSaleAllowlist = ({ account, wallet, dropId, accountIds }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { receiverId, execute, getAccount } = getEnv();
    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale allowlist.');
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const dropInfo = yield getDropInformation({ dropId });
    assert(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale allowlist.");
    assert((_a = dropInfo.config) === null || _a === void 0 ? void 0 : _a.sale, "The drop config must have a sale in order to add accounts to the sale allowlist.");
    const actions = [];
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
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
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
export const removeFromSaleAllowlist = ({ account, wallet, dropId, accountIds }) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { receiverId, execute, getAccount } = getEnv();
    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale allowlist.');
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const dropInfo = yield getDropInformation({ dropId });
    assert(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale allowlist.");
    assert((_b = dropInfo.config) === null || _b === void 0 ? void 0 : _b.sale, "The drop config must have a sale in order to remove accounts from the sale allowlist.");
    const actions = [];
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
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
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
export const addToSaleBlocklist = ({ account, wallet, dropId, accountIds }) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { receiverId, execute, getAccount } = getEnv();
    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale blocklist.');
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const dropInfo = yield getDropInformation({ dropId });
    assert(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale blocklist.");
    assert((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to add accounts to the sale blocklist.");
    const actions = [];
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
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
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
export const removeFromSaleBlocklist = ({ account, wallet, dropId, accountIds }) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { receiverId, execute, getAccount } = getEnv();
    assert(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale blocklist.');
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const dropInfo = yield getDropInformation({ dropId });
    assert(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale blocklist.");
    assert((_d = dropInfo.config) === null || _d === void 0 ? void 0 : _d.sale, "The drop config must have a sale in order to remove accounts from the sale blocklist.");
    const actions = [];
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
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
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
export const updateSale = ({ account, wallet, dropId, maxNumKeys, pricePerKeyNEAR, pricePerKeyYocto, autoWithdrawFunds, start, end }) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { receiverId, execute, getAccount } = getEnv();
    assert(dropId && (maxNumKeys || pricePerKeyNEAR || pricePerKeyYocto || autoWithdrawFunds || start || end), 'Must pass in a drop ID and at least one of the other sale parameters to update');
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const dropInfo = yield getDropInformation({ dropId });
    assert(account.accountId == dropInfo.owner_id, "Only the owner of the drop can update the sale.");
    assert((_e = dropInfo.config) === null || _e === void 0 ? void 0 : _e.sale, "The drop config must have a sale in order to be updated.");
    const actions = [];
    actions.push({
        type: 'FunctionCall',
        params: {
            methodName: 'update_sale',
            args: {
                drop_id: dropId,
                max_num_keys: maxNumKeys,
                price_per_key: pricePerKeyYocto || pricePerKeyNEAR ? parseNearAmount(pricePerKeyNEAR.toString()) : undefined,
                auto_withdraw_funds: autoWithdrawFunds,
                start,
                end,
            },
            gas: '100000000000000'
        }
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
//# sourceMappingURL=sales.js.map