import { AddToBalanceParams, WithdrawBalanceParams } from "./types/params";
/**
 * Deposit some amount of $NEAR or yoctoNEAR$ into the Keypom contract. This amount can then be used to create drops or add keys without
 * Having to explicitly attach a deposit everytime. It can be thought of like a bank account.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string} absoluteAmount Amount of tokens to add but considering the decimal amount (non human-readable).
   Example: depositing 1 $NEAR should be passed in as "1000000000000000000000000" and NOT "1"
 * @param {string} amount Human readable format for the amount of tokens to deposit.
   Example: transferring one $NEAR should be passed in as "1" and NOT "1000000000000000000000000"
 *
 * @example <caption>Add 1 $NEAR to the account balance</caption>
 *  * ```js
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
*/
export declare const addToBalance: ({ account, wallet, amount, absoluteAmount }: AddToBalanceParams) => Promise<any>;
/**
 * Withdraw all the $NEAR from your balance in the Keypom contract.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 *
 * @example <caption>Add 1 $NEAR to the account balance and then withdraw it</caption>
 *  * ```js
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
*/
export declare const withdrawBalance: ({ account, wallet }: WithdrawBalanceParams) => Promise<any>;
