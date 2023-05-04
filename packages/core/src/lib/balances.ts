import { assert, isValidAccountObj } from "./checks";
import { getEnv } from "./keypom";

import {
    BrowserWalletBehaviour,
    Wallet,
} from "@near-wallet-selector/core/lib/wallet/wallet.types";
//import { Account } from "near-api-js";
import { nearArgsToYocto } from "./keypom-utils";
import { Account } from "@near-js/accounts";
import { Action, stringifyJsonOrBytes } from "@near-js/transactions";

type AnyWallet = BrowserWalletBehaviour | Wallet;

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
export const addToBalance = async ({
    account,
    wallet,
    amountNear,
    amountYocto,
    successUrl,
}: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet;
    /**
     * Amount of tokens to add but considering the decimal amount (non human-readable).
     * @example
     * Transferring one $NEAR should be passed in as "1000000000000000000000000" and NOT "1"
     */
    amountYocto?: string;
    /**
     * Human readable format for the amount of tokens to add.
     * @example
     * Example: transferring one $NEAR should be passed in as "1" and NOT "1000000000000000000000000"
     */
    amountNear?: string;
    /** When signing with a wallet, a success URl can be included that the user will be redirected to once the transaction has been successfully signed. */
    successUrl?: string;
}) => {
    const { receiverId, execute, getAccount } = getEnv();

    assert(
        isValidAccountObj(account),
        "Passed in account is not a valid account object."
    );
    account = await getAccount({ account, wallet });

    let deposit = nearArgsToYocto(amountNear, amountYocto);
    assert(amountYocto != "0", "Amount to add to balance cannot be 0.");

    const actions: Action[] = [];
    actions.push({
        enum: "FunctionCall",
        functionCall: {
            methodName: "add_to_balance",
            args: stringifyJsonOrBytes({}),
            gas: "100000000000000",
            deposit,
        },
    });

    const transactions: any[] = [
        {
            receiverId,
            actions,
        },
    ];

    return execute({ transactions, account, wallet, successUrl });
};

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
export const withdrawBalance = async ({
    account,
    wallet,
}: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet;
}) => {
    const { receiverId, execute, getAccount } = getEnv();

    assert(
        isValidAccountObj(account),
        "Passed in account is not a valid account object."
    );
    account = await getAccount({ account, wallet });

    const actions: Action[] = [];
    actions.push({
        enum: "FunctionCall",
        functionCall: {
            methodName: "withdraw_from_balance",
            args: stringifyJsonOrBytes({}),
            gas: "100000000000000",
            deposit: '0'
        },
    });

    const transactions: any[] = [
        {
            receiverId,
            actions,
        },
    ];

    return execute({ transactions, account, wallet });
};
