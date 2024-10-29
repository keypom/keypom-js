"use strict";
// networks/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinalExecutionOutcome = exports.sendTransaction = void 0;
const transaction_1 = require("near-api-js/lib/transaction");
const format_1 = require("near-api-js/lib/utils/format");
const near_api_js_1 = require("near-api-js");
async function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }) {
    const serializedArgsBuffer = Buffer.from(JSON.stringify(args));
    const serializedArgs = new Uint8Array(serializedArgsBuffer);
    let actions = [];
    actions.push((0, transaction_1.functionCall)(methodName, serializedArgs, BigInt(gas), BigInt((0, format_1.parseNearAmount)(deposit))));
    let result;
    console.log("Signer account", signerAccount);
    if (isAccount(signerAccount)) {
        console.log("is Account");
        result = await signerAccount.signAndSendTransaction({
            receiverId: receiverId,
            actions,
        });
    }
    else {
        console.log("actions", actions);
        try {
            const transformedActions = transformAccountActionsToWalletActions(actions);
            console.log("transformedActions", transformedActions);
            result = await signerAccount.signAndSendTransaction({
                receiverId: receiverId,
                actions: transformedActions,
            });
        }
        catch (error) {
            console.log("error", error);
            const transformedActions = transformAccountActionsToWalletActionsLatest(actions);
            console.log("transformedActions", transformedActions);
            result = await signerAccount.signAndSendTransaction({
                receiverId: receiverId,
                actions: transformedActions,
            });
        }
    }
    return result;
}
exports.sendTransaction = sendTransaction;
function isAccount(account) {
    return account instanceof near_api_js_1.Account;
}
// Function to transform AccountActions to WalletActions
function transformAccountActionsToWalletActions(accountActions) {
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
                        code: action.deployContract.code,
                    },
                };
            case "functionCall":
                return {
                    type: "FunctionCall",
                    params: {
                        methodName: action.functionCall.methodName,
                        args: JSON.parse(Buffer.from(action.functionCall.args).toString("utf8")),
                        gas: action.functionCall.gas.toString(),
                        deposit: action.functionCall.deposit.toString(),
                    },
                };
            case "transfer":
                return {
                    type: "Transfer",
                    params: {
                        deposit: action.transfer.deposit.toString(),
                    },
                };
            case "stake":
                return {
                    type: "Stake",
                    params: {
                        stake: action.stake.stake.toString(),
                        publicKey: action.stake.publicKey.toString(),
                    },
                };
            case "addKey":
                return {
                    type: "AddKey",
                    params: {
                        publicKey: action.addKey.publicKey.toString(),
                        accessKey: {
                            permission: action.addKey.accessKey.permission instanceof
                                transaction_1.FunctionCallPermission
                                ? {
                                    receiverId: action.addKey.accessKey
                                        .permission.receiverId,
                                    allowance: action.addKey.accessKey.permission.allowance?.toString(),
                                    methodNames: action.addKey.accessKey
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
                        publicKey: action.deleteKey.publicKey.toString(),
                    },
                };
            case "deleteAccount":
                return {
                    type: "DeleteAccount",
                    params: {
                        beneficiaryId: action.deleteAccount.beneficiaryId,
                    },
                };
            default:
                throw new Error(`Unsupported action type: ${action.enum}`);
        }
    });
}
// Utility to serialize args for function calls
function serializeArgs(args) {
    if (typeof args === "object") {
        return new Uint8Array(Buffer.from(JSON.stringify(args)));
    }
    return args;
}
// Function to transform AccountActions to WalletActions
function transformAccountActionsToWalletActionsLatest(accountActions) {
    return accountActions.map((action) => {
        switch (action.enum) {
            case "createAccount":
                return {
                    type: "createAccount",
                };
            case "deployContract":
                return {
                    type: "deployContract",
                    params: {
                        code: action.deployContract.code,
                    },
                };
            case "functionCall":
                return {
                    type: "functionCall",
                    params: {
                        methodName: action.functionCall.methodName,
                        args: serializeArgs(action.functionCall.args),
                        gas: action.functionCall.gas.toString(),
                        deposit: action.functionCall.deposit.toString(),
                    },
                };
            case "transfer":
                return {
                    type: "transfer",
                    params: {
                        deposit: action.transfer.deposit.toString(),
                    },
                };
            case "stake":
                return {
                    type: "stake",
                    params: {
                        stake: action.stake.stake.toString(),
                        publicKey: action.stake.publicKey.toString(),
                    },
                };
            case "addKey":
                return {
                    type: "addKey",
                    params: {
                        publicKey: action.addKey.publicKey.toString(),
                        accessKey: {
                            permission: action.addKey.accessKey.permission instanceof
                                transaction_1.FunctionCallPermission
                                ? {
                                    receiverId: action.addKey.accessKey
                                        .permission.receiverId,
                                    allowance: action.addKey.accessKey.permission.allowance?.toString(),
                                    methodNames: action.addKey.accessKey
                                        .permission.methodNames,
                                }
                                : "FullAccess",
                        },
                    },
                };
            case "deleteKey":
                return {
                    type: "deleteKey",
                    params: {
                        publicKey: action.deleteKey.publicKey.toString(),
                    },
                };
            case "deleteAccount":
                return {
                    type: "deleteAccount",
                    params: {
                        beneficiaryId: action.deleteAccount.beneficiaryId,
                    },
                };
            default:
                throw new Error(`Unsupported action type: ${action.enum}`);
        }
    });
}
function isFinalExecutionOutcome(result) {
    return (result &&
        typeof result === "object" &&
        "final_execution_status" in result &&
        "status" in result &&
        "transaction" in result &&
        "transaction_outcome" in result &&
        "receipts_outcome" in result);
}
exports.isFinalExecutionOutcome = isFinalExecutionOutcome;
