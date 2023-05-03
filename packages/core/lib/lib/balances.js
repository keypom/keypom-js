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
exports.withdrawBalance = exports.addToBalance = void 0;
const checks_1 = require("./checks");
const keypom_1 = require("./keypom");
//import { Account } from "near-api-js";
const keypom_utils_1 = require("./keypom-utils");
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
const addToBalance = ({ account, wallet, amountNear, amountYocto, successUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    let deposit = (0, keypom_utils_1.nearArgsToYocto)(amountNear, amountYocto);
    (0, checks_1.assert)(amountYocto != "0", "Amount to add to balance cannot be 0.");
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "add_to_balance",
            args: {},
            gas: "100000000000000",
            deposit,
        },
    });
    const transactions = [
        {
            receiverId,
            actions,
        },
    ];
    return execute({ transactions, account, wallet, successUrl });
});
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
const withdrawBalance = ({ account, wallet, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, execute, getAccount } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const actions = [];
    actions.push({
        type: "FunctionCall",
        params: {
            methodName: "withdraw_from_balance",
            args: {},
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
exports.withdrawBalance = withdrawBalance;
