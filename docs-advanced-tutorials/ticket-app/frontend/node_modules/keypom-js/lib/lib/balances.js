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
exports.withdrawBalance = exports.addToBalance = void 0;
var format_1 = require("near-api-js/lib/utils/format");
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
/**
 * Deposit some amount of $NEAR or yoctoNEAR$ into the Keypom contract. This amount can then be used to create drops or add keys without
 * Having to explicitly attach a deposit everytime. It can be thought of like a bank account.
 *
 * @example
 * Add 1 $NEAR to the account balance
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
 * await addToBalance({
 *     amount: "1",
 * )};
 * ```
 * @group User Balance Functions
*/
var addToBalance = function (_a) {
    var account = _a.account, wallet = _a.wallet, amountNear = _a.amountNear, amountYocto = _a.amountYocto, successUrl = _a.successUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, deposit, actions, transactions;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _c.sent();
                    deposit = amountYocto || '0';
                    if (amountNear) {
                        deposit = (0, format_1.parseNearAmount)(amountNear.toString()) || "0";
                    }
                    actions = [];
                    actions.push({
                        type: 'FunctionCall',
                        params: {
                            methodName: 'add_to_balance',
                            args: {},
                            gas: '100000000000000',
                            deposit: deposit,
                        }
                    });
                    transactions = [{
                            receiverId: receiverId,
                            actions: actions,
                        }];
                    return [2 /*return*/, execute({ transactions: transactions, account: account, wallet: wallet, successUrl: successUrl })];
            }
        });
    });
};
exports.addToBalance = addToBalance;
/**
 * Withdraw all the $NEAR from your balance in the Keypom contract.
 *
 * @example
 * Add 1 $NEAR to the account balance and then withdraw it
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
 * await addToBalance({
 *     amount: "1",
 * });
 *
 * await withdrawBalance({});
 * ```
 * @group User Balance Functions
*/
var withdrawBalance = function (_a) {
    var account = _a.account, wallet = _a.wallet;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, receiverId, execute, getAccount, actions, transactions;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), receiverId = _b.receiverId, execute = _b.execute, getAccount = _b.getAccount;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _c.sent();
                    actions = [];
                    actions.push({
                        type: 'FunctionCall',
                        params: {
                            methodName: 'withdraw_from_balance',
                            args: {},
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
exports.withdrawBalance = withdrawBalance;
