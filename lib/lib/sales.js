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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSale = exports.removeFromSaleBlocklist = exports.addToSaleBlocklist = exports.removeFromSaleAllowlist = exports.addToSaleAllowlist = void 0;
var format_1 = require("near-api-js/lib/utils/format");
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
var views_1 = require("./views");
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
var addToSaleAllowlist = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, accountIds = _a.accountIds;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, dropInfo, actions, transactions;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale allowlist.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    dropInfo = _d.sent();
                    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale allowlist.");
                    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to add accounts to the sale allowlist.");
                    actions = [];
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
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
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
var removeFromSaleAllowlist = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, accountIds = _a.accountIds;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, dropInfo, actions, transactions;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale allowlist.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    dropInfo = _d.sent();
                    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale allowlist.");
                    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to remove accounts from the sale allowlist.");
                    actions = [];
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
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
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
var addToSaleBlocklist = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, accountIds = _a.accountIds;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, dropInfo, actions, transactions;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to add to the sale blocklist.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    dropInfo = _d.sent();
                    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can add accounts to the sale blocklist.");
                    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to add accounts to the sale blocklist.");
                    actions = [];
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
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
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
var removeFromSaleBlocklist = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, accountIds = _a.accountIds;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, dropInfo, actions, transactions;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)(dropId && accountIds, 'Must pass in a drop ID and a list of account IDs to remove from the sale blocklist.');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    dropInfo = _d.sent();
                    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can remove accounts from the sale blocklist.");
                    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to remove accounts from the sale blocklist.");
                    actions = [];
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
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
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
var updateSale = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, maxNumKeys = _a.maxNumKeys, pricePerKeyNEAR = _a.pricePerKeyNEAR, pricePerKeyYocto = _a.pricePerKeyYocto, autoWithdrawFunds = _a.autoWithdrawFunds, start = _a.start, end = _a.end;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, dropInfo, actions, transactions;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)(dropId && (maxNumKeys || pricePerKeyNEAR || pricePerKeyYocto || autoWithdrawFunds || start || end), 'Must pass in a drop ID and at least one of the other sale parameters to update');
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    return [4 /*yield*/, (0, views_1.getDropInformation)({ dropId: dropId })];
                case 2:
                    dropInfo = _d.sent();
                    (0, checks_1.assert)(account.accountId == dropInfo.owner_id, "Only the owner of the drop can update the sale.");
                    (0, checks_1.assert)((_c = dropInfo.config) === null || _c === void 0 ? void 0 : _c.sale, "The drop config must have a sale in order to be updated.");
                    actions = [];
                    actions.push({
                        type: 'FunctionCall',
                        params: {
                            methodName: 'update_sale',
                            args: {
                                drop_id: dropId,
                                max_num_keys: maxNumKeys,
                                price_per_key: pricePerKeyYocto || pricePerKeyNEAR ? (0, format_1.parseNearAmount)(pricePerKeyNEAR.toString()) : undefined,
                                auto_withdraw_funds: autoWithdrawFunds,
                                start: start,
                                end: end,
                            },
                            gas: '100000000000000'
                        }
                    });
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet })];
            }
        });
    });
};
exports.updateSale = updateSale;
