// utils.ts

import { Account } from "@near-js/accounts";
import { FinalExecutionOutcome } from "@near-js/types";
import { Action, actionCreators } from "@near-js/transactions";
import { parseNearAmount } from "@near-js/utils";

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
