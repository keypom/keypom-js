import { __awaiter } from "tslib";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { assert, isValidAccountObj } from "./checks";
import { getEnv } from "./keypom";
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
export const addToBalance = ({ account, wallet, amountNear, amountYocto, successUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, execute, getAccount } = getEnv();
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    let deposit = amountYocto || '0';
    if (amountNear) {
        deposit = parseNearAmount(amountNear.toString()) || "0";
    }
    const actions = [];
    actions.push({
        type: 'FunctionCall',
        params: {
            methodName: 'add_to_balance',
            args: {},
            gas: '100000000000000',
            deposit,
        }
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet, successUrl });
});
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
export const withdrawBalance = ({ account, wallet }) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, execute, getAccount } = getEnv();
    assert(isValidAccountObj(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const actions = [];
    actions.push({
        type: 'FunctionCall',
        params: {
            methodName: 'withdraw_from_balance',
            args: {},
            gas: '100000000000000'
        }
    });
    const transactions = [{
            receiverId,
            actions,
        }];
    return execute({ transactions, account, wallet });
});
//# sourceMappingURL=balances.js.map