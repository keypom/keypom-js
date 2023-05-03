"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSale = exports.removeFromSaleBlocklist = exports.addToSaleBlocklist = exports.removeFromSaleAllowlist = exports.addToSaleAllowlist = void 0;
// import {
// 	parseNearAmount
// } from "near-api-js/lib/utils/format";
const checks_1 = require("./checks");
const keypom_1 = require("./keypom");
//import { Account } from "near-api-js";
const views_1 = require("./views");
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
const addToSaleAllowlist = ({ account, wallet, dropId, accountIds, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)(dropId && accountIds, "Must pass in a drop ID and a list of account IDs to add to the sale allowlist.");
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const dropInfo = yield (0, views_1.getDropInformation)({ dropId });
    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale allowlist.");
    (0, checks_1.assert)((_a = dropInfo.config) === null || _a === void 0 ? void 0 : _a.sale, "The drop config must have a sale in order to add accounts to the sale allowlist.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "add_to_sale_allowlist",
            args: {
                drop_id: dropId,
                account_ids: accountIds,
            },
            gas: "100000000000000",
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet });
});
exports.addToSaleAllowlist = addToSaleAllowlist;
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
const removeFromSaleAllowlist = ({ account, wallet, dropId, accountIds, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)(dropId && accountIds, "Must pass in a drop ID and a list of account IDs to remove from the sale allowlist.");
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const dropInfo = yield (0, views_1.getDropInformation)({ dropId });
    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale allowlist.");
    (0, checks_1.assert)((_b = dropInfo.config) === null || _b === void 0 ? void 0 : _b.sale, "The drop config must have a sale in order to remove accounts from the sale allowlist.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "remove_from_sale_allowlist",
            args: {
                drop_id: dropId,
                account_ids: accountIds,
            },
            gas: "100000000000000",
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet });
});
exports.removeFromSaleAllowlist = removeFromSaleAllowlist;
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
const addToSaleBlocklist = ({ account, wallet, dropId, accountIds, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)(dropId && accountIds, "Must pass in a drop ID and a list of account IDs to add to the sale blocklist.");
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const dropInfo = yield (0, views_1.getDropInformation)({ dropId });
    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale blocklist.");
    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to add accounts to the sale blocklist.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "add_to_sale_blocklist",
            args: {
                drop_id: dropId,
                account_ids: accountIds,
            },
            gas: "100000000000000",
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet });
});
exports.addToSaleBlocklist = addToSaleBlocklist;
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
const removeFromSaleBlocklist = ({ account, wallet, dropId, accountIds, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)(dropId && accountIds, "Must pass in a drop ID and a list of account IDs to remove from the sale blocklist.");
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const dropInfo = yield (0, views_1.getDropInformation)({ dropId });
    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale blocklist.");
    (0, checks_1.assert)((_d = dropInfo.config) === null || _d === void 0 ? void 0 : _d.sale, "The drop config must have a sale in order to remove accounts from the sale blocklist.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "remove_from_sale_blocklist",
            args: {
                drop_id: dropId,
                account_ids: accountIds,
            },
            gas: "100000000000000",
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet });
});
exports.removeFromSaleBlocklist = removeFromSaleBlocklist;
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
const updateSale = ({ account, wallet, dropId, maxNumKeys, pricePerKeyNEAR, pricePerKeyYocto, autoWithdrawFunds, start, end, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)(dropId &&
        (maxNumKeys ||
            pricePerKeyNEAR ||
            pricePerKeyYocto ||
            autoWithdrawFunds ||
            start ||
            end), "Must pass in a drop ID and at least one of the other sale parameters to update");
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const dropInfo = yield (0, views_1.getDropInformation)({ dropId });
    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can update the sale.");
    (0, checks_1.assert)((_e = dropInfo.config) === null || _e === void 0 ? void 0 : _e.sale, "The drop config must have a sale in order to be updated.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "update_sale",
            args: {
                drop_id: dropId,
                max_num_keys: maxNumKeys,
                price_per_key: pricePerKeyYocto || pricePerKeyNEAR
                    ? parseNearAmount(pricePerKeyNEAR.toString())
                    : undefined,
                auto_withdraw_funds: autoWithdrawFunds,
                start,
                end,
            },
            gas: "100000000000000",
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet });
});
exports.updateSale = updateSale;
