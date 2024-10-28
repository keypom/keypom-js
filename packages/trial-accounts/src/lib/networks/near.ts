// networks/utils.ts

import { SigningAccount } from "../TrialAccountManager";
import {
    Action as WalletAction,
    FinalExecutionOutcome,
} from "@near-wallet-selector/core";
import {
    Action,
    functionCall,
    FunctionCallPermission,
} from "near-api-js/lib/transaction";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { Account } from "near-api-js";

export async function sendTransaction({
    signerAccount,
    receiverId,
    methodName,
    args,
    deposit,
    gas,
}: {
    signerAccount: SigningAccount;
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
        functionCall(
            methodName,
            serializedArgs,
            BigInt(gas),
            BigInt(parseNearAmount(deposit)!)
        )
    );

    let result: any;
    console.log("Signer account", signerAccount);
    if (isAccount(signerAccount)) {
        console.log("is Account");
        result = await signerAccount.signAndSendTransaction({
            receiverId: receiverId,
            actions,
        });
    } else {
        console.log("Is wallet");
        console.log("actions", actions);
        const transformedActions =
            transformAccountActionsToWalletActions(actions);
        console.log("transformedActions", transformedActions);
        result = await signerAccount.signAndSendTransaction({
            receiverId: receiverId,
            actions: transformedActions,
        });
    }

    return result;
}

function isAccount(account: any): account is Account {
    return account instanceof Account;
}

// Function to transform AccountActions to WalletActions
function transformAccountActionsToWalletActions(
    accountActions: Action[]
): WalletAction[] {
    return accountActions.map((action) => {
        switch (action.enum) {
            case "createAccount":
                return {
                    type: "CreateAccount",
                };
            case "deployContract":
                return {
                    type: "DeployContract",
                    params: {
                        code: action.deployContract!.code,
                    },
                };
            case "functionCall":
                return {
                    type: "FunctionCall",
                    params: {
                        methodName: action.functionCall!.methodName,
                        args: JSON.parse(
                            Buffer.from(action.functionCall!.args).toString(
                                "utf8"
                            )
                        ),
                        gas: action.functionCall!.gas.toString(),
                        deposit: action.functionCall!.deposit.toString(),
                    },
                };
            case "transfer":
                return {
                    type: "Transfer",
                    params: {
                        deposit: action.transfer!.deposit.toString(),
                    },
                };
            case "stake":
                return {
                    type: "Stake",
                    params: {
                        stake: action.stake!.stake.toString(),
                        publicKey: action.stake!.publicKey.toString(),
                    },
                };
            case "addKey":
                return {
                    type: "AddKey",
                    params: {
                        publicKey: action.addKey!.publicKey.toString(),
                        accessKey: {
                            permission:
                                action.addKey!.accessKey.permission instanceof
                                FunctionCallPermission
                                    ? {
                                          receiverId:
                                              action.addKey!.accessKey
                                                  .permission.receiverId,
                                          allowance:
                                              action.addKey!.accessKey.permission.allowance?.toString(),
                                          methodNames:
                                              action.addKey!.accessKey
                                                  .permission.methodNames,
                                      }
                                    : "FullAccess",
                        },
                    },
                };
            case "deleteKey":
                return {
                    type: "DeleteKey",
                    params: {
                        publicKey: action.deleteKey!.publicKey.toString(),
                    },
                };
            case "deleteAccount":
                return {
                    type: "DeleteAccount",
                    params: {
                        beneficiaryId: action.deleteAccount!.beneficiaryId,
                    },
                };
            default:
                throw new Error(`Unsupported action type: ${action.enum}`);
        }
    });
}
