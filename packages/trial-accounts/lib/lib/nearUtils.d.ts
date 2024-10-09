import { Account } from "@near-js/accounts";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { Config } from "./types";
/**
 * Initializes a NEAR connection using the provided configuration.
 *
 * @param config - The configuration object containing network ID, key store, etc.
 * @returns A Promise that resolves to a Near instance.
 */
export declare function initNear(config: Config): Promise<Near>;
/**
 * Converts an object's keys from camelCase to snake_case recursively.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
export declare function toSnakeCase(obj: any): any;
export declare function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }: {
    signerAccount: Account;
    receiverId: string;
    methodName: string;
    args: any;
    deposit: string;
    gas: string;
}): Promise<FinalExecutionOutcome>;
export declare function createAccount({ signerAccount, newAccountId, amount, config, }: {
    signerAccount: Account;
    newAccountId: string;
    amount: string;
    config: Config;
}): Promise<import("@near-js/crypto").KeyPairString>;
