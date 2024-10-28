import { SigningAccount } from "../TrialAccountManager";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
export declare function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }: {
    signerAccount: SigningAccount;
    receiverId: string;
    methodName: string;
    args: any;
    deposit: string;
    gas: string;
}): Promise<FinalExecutionOutcome>;
export declare function isFinalExecutionOutcome(result: any): result is FinalExecutionOutcome;
