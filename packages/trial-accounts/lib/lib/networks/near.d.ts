import { FinalExecutionOutcome } from "@near-js/types";
import { SigningAccount } from "../TrialAccountManager";
export declare function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }: {
    signerAccount: SigningAccount;
    receiverId: string;
    methodName: string;
    args: any;
    deposit: string;
    gas: string;
}): Promise<FinalExecutionOutcome>;
