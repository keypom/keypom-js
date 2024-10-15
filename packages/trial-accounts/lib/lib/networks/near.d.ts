import { Account } from "@near-js/accounts";
import { FinalExecutionOutcome } from "@near-js/types";
export declare function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }: {
    signerAccount: Account;
    receiverId: string;
    methodName: string;
    args: any;
    deposit: string;
    gas: string;
}): Promise<FinalExecutionOutcome>;
