"use strict";
// networks/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("@near-js/utils");
const accounts_1 = require("@near-js/accounts");
async function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }) {
    const serializedArgsBuffer = Buffer.from(JSON.stringify(args));
    const serializedArgs = new Uint8Array(serializedArgsBuffer);
    let actions = [];
    actions.push(transactions_1.actionCreators.functionCall(methodName, serializedArgs, BigInt(gas), BigInt((0, utils_1.parseNearAmount)(deposit))));
    let result;
    if (isAccount(signerAccount)) {
        result = await signerAccount.signAndSendTransaction({
            receiverId: receiverId,
            actions,
        });
    }
    else {
        const transformedActions = transformAccountActionsToWalletActions(actions);
        result = await signerAccount.signAndSendTransaction({
            receiverId: receiverId,
            actions: transformedActions,
        });
    }
    return result;
}
exports.sendTransaction = sendTransaction;
function isAccount(account) {
    return account instanceof accounts_1.Account;
}
// Function to transform AccountActions to WalletActions
function transformAccountActionsToWalletActions(accountActions) {
    return accountActions.map((action) => {
        switch (action.enum) {
            case "CreateAccount":
                return {
                    type: "CreateAccount",
                };
            case "DeployContract":
                return {
                    type: "DeployContract",
                    params: {
                        code: action.deployContract.code,
                    },
                };
            case "FunctionCall":
                return {
                    type: "FunctionCall",
                    params: {
                        methodName: action.functionCall.methodName,
                        args: JSON.parse(Buffer.from(action.functionCall.args).toString("utf8")),
                        gas: action.functionCall.gas.toString(),
                        deposit: action.functionCall.deposit.toString(),
                    },
                };
            case "Transfer":
                return {
                    type: "Transfer",
                    params: {
                        deposit: action.transfer.deposit.toString(),
                    },
                };
            case "Stake":
                return {
                    type: "Stake",
                    params: {
                        stake: action.stake.stake.toString(),
                        publicKey: action.stake.publicKey.toString(),
                    },
                };
            case "AddKey":
                return {
                    type: "AddKey",
                    params: {
                        publicKey: action.addKey.publicKey.toString(),
                        accessKey: {
                            permission: action.addKey.accessKey.permission instanceof
                                transactions_1.FunctionCallPermission
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
            case "DeleteKey":
                return {
                    type: "DeleteKey",
                    params: {
                        publicKey: action.deleteKey.publicKey.toString(),
                    },
                };
            case "DeleteAccount":
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
