// utils.ts

import { Account } from "@near-js/accounts";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { Config } from "./types";
import { Action, actionCreators } from "@near-js/transactions";
import { parseNearAmount } from "@near-js/utils";

/**
 * Initializes a NEAR connection using the provided configuration.
 *
 * @param config - The configuration object containing network ID, key store, etc.
 * @returns A Promise that resolves to a Near instance.
 */
export async function initNear(config: Config): Promise<Near> {
    const nearConfig = {
        networkId: config.networkId,
        nodeUrl: `https://rpc.${config.networkId}.near.org`,
        keyStore: config.keyStore,
    };
    const near = new Near(nearConfig);
    return near;
}

/**
 * Converts an object's keys from camelCase to snake_case recursively.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
export function toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((item) => toSnakeCase(item));
    } else if (obj && typeof obj === "object" && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

export async function sendTransaction({
    signerAccount,
    receiverId,
    methodName,
    args,
    deposit,
    gas,
}: {
    signerAccount: Account;
    receiverId: string;
    methodName: string;
    args: any;
    deposit: string;
    gas: string;
}): Promise<FinalExecutionOutcome> {
    const serializedArgsBuffer = Buffer.from(JSON.stringify(args));
    const serializedArgs = new Uint8Array(serializedArgsBuffer);

    let actions: Action[] = [];

    actions.push(
        actionCreators.functionCall(
            methodName,
            serializedArgs,
            BigInt(gas),
            BigInt(parseNearAmount(deposit)!)
        )
    );

    const result = await signerAccount.signAndSendTransaction({
        receiverId: receiverId,
        actions,
    });

    return result;
}
