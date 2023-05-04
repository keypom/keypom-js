import BN from "bn.js";
//import { Account } from "near-api-js";
import { getEnv } from "../keypom";
import { getKeyInformation } from "../views";
import { Account } from "@near-js/accounts";
import { Transaction } from "@near-js/transactions";

// helpers for keypom account contract args
const RECEIVER_HEADER = "|kR|";
const ACTION_HEADER = "|kA|";
const PARAM_START = "|kP|";
const PARAM_STOP = "|kS|";

export const TRIAL_ERRORS = {
    EXIT_EXPECTED: "exit",
    INVALID_ACTION: "invalid_action",
    INSUFFICIENT_BALANCE: "insufficient_balance",
};

export const validateDesiredMethods = async ({
    methodData,
    trialAccountId,
}: {
    methodData: {
        receiverId: string;
        methodName: string;
        deposit: string;
    }[];
    trialAccountId: string;
}) => {
    const { viewCall } = getEnv();

    let validInfo = {};
    try {
        const rules = await viewCall({
            contractId: trialAccountId,
            methodName: "get_rules",
            args: {},
        });
        let contracts = rules.contracts.split(",");
        let amounts = rules.amounts.split(",");
        let methods = rules.methods.split(",");

        for (let i = 0; i < contracts.length; i++) {
            validInfo[contracts[i]] = {
                maxDeposit: amounts[i],
                allowableMethods:
                    methods[i] == "*" ? "*" : methods[i].split(":"),
            };
        }
    } catch (e: any) {
        console.log("error: ", e);
    }
    console.log("validInfo after view calls: ", validInfo);

    // Loop through each transaction in the array
    for (let i = 0; i < methodData.length; i++) {
        const method = methodData[i];
        console.log("method: ", method);

        const validInfoForReceiver = validInfo[method.receiverId];
        console.log("validInfoForReceiver: ", validInfoForReceiver);
        // Check if the contractId is valid
        if (!validInfoForReceiver) {
            console.log(
                "!validInfo[transaction.receiverId]: ",
                !validInfo[method.receiverId]
            );
            return false;
        }

        // Check if the method name is valid
        if (
            validInfoForReceiver.allowableMethods != "*" &&
            !validInfoForReceiver.allowableMethods.includes(method.methodName)
        ) {
            console.log(
                "!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ",
                !validInfo[method.receiverId].allowableMethods.includes(
                    method.methodName
                )
            );
            return false;
        }

        // Check if the deposit is valid
        if (
            validInfoForReceiver.maxDeposit != "*" &&
            new BN(method.deposit).gt(new BN(validInfoForReceiver.maxDeposit))
        ) {
            console.log(
                "new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ",
                new BN(method.deposit).gt(
                    new BN(validInfo[method.receiverId].maxDeposit)
                )
            );
            return false;
        }
    }

    return true;
};

export const wrapTxnParamsForTrial = (params, newParams = {}) => {
    Object.entries(params).forEach(([k, v]) => {
        if (k === "args" && typeof v !== "string") {
            v = JSON.stringify(v);
        }
        if (Array.isArray(v)) v = v.join();
        newParams[PARAM_START + k] = v + PARAM_STOP;
    });
    return newParams;
};

export const generateExecuteArgs = ({
    desiredTxns,
}: {
    /** The transactions to execute */
    desiredTxns: Transaction[];
}) => {
    const methodDataToValidate: any = [];
    let totalGasBN = new BN(0);
    let totalDepositsBN = new BN(0);
    const executeArgs: any = {
        transactions: [],
    };

    desiredTxns.forEach((tx) => {
        const newTx: any = {};
        newTx[RECEIVER_HEADER] =  tx.receiverId;
        newTx.actions = [];
        console.log("newTx: ", newTx);

        tx.actions.forEach((action) => {
            const fcAction = action.functionCall!;

            console.log("action: ", action);
            methodDataToValidate.push({
                receiverId: tx.receiverId,
                methodName: fcAction.methodName,
                deposit: fcAction.deposit,
            });
            totalGasBN = totalGasBN.add(new BN(fcAction.gas));
            totalDepositsBN = totalDepositsBN.add(
                new BN(fcAction.deposit)
            );

            const newAction: any = {};
            console.log("newAction 1: ", newAction);
            newAction[ACTION_HEADER] = action.enum;
            console.log("newAction 2: ", newAction);
            newAction.params = wrapTxnParamsForTrial(fcAction);
            console.log("newAction 3: ", newAction);
            newTx.actions.push(newAction);
        });
        executeArgs.transactions.push(newTx);
    });
    return {
        totalAttachedYocto: totalDepositsBN.toString(),
        totalGasForTxns: totalGasBN.toString(),
        executeArgs,
        methodDataToValidate,
    };
};

export const estimateTrialGas = ({
    executeArgs,
}: {
    executeArgs: {
        transactions: {
            "|kR|": string;
            /** The actions to execute */
            actions: {
                /** The type of action to execute */
                "|kA|": "FunctionCall";
                /** The parameters for the action */
                params: {
                    /** The method name to execute */
                    "|kP|methodName": string;
                    /** The arguments to pass to the method */
                    "|kP|args": string;
                    /** The amount of gas to attach to the transaction */
                    "|kP|gas": string;
                    /** The amount of NEAR to attach to the transaction */
                    "|kP|deposit": string;
                };
            }[];
        }[];
    };
}) => {
    let transactions = executeArgs.transactions;
    let incomingGas = new BN("0");
    let numActions = 0;
    try {
        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];
            console.log("transaction in gas loop: ", transaction);
            for (let j = 0; j < transaction.actions.length; j++) {
                let action = transaction.actions[j];
                console.log("action in gas loop: ", action);
                let gasToAdd = action.params["|kP|gas"]
                    .split(`|kS|`)[0]
                    .toString();
                console.log("gasToAdd: ", gasToAdd);
                incomingGas = incomingGas.add(new BN(gasToAdd));
                numActions += 1;
            }
        }
    } catch (e) {
        numActions = 1;
        console.log("e: ", e);
        incomingGas = new BN(`300000000000000`);
    }

    console.log("incomingGas: ", incomingGas.toString());
    // Take 15 TGas as a base for loading rules as well as 20 TGas for the callback.
    // For each action, add 15 TGas on top of that and then add the final incoming gas on top.
    let gasToAttach = new BN("15000000000000") // Loading rules
        .add(new BN("20000000000000")) // Callback
        .add(new BN("15000000000000").mul(new BN(numActions))) // Actions
        .add(incomingGas)
        .toString(); // Incoming gas

    // check if the gas to attach is over 300 TGas and if it is, clamp it
    if (new BN(gasToAttach).gt(new BN("300000000000000"))) {
        console.log("gas to attach is over 300 TGas. Clamping it");
        gasToAttach = "300000000000000";
    }

    return gasToAttach;
};

export const isUnclaimedTrialDrop = async ({ keypomContractId, secretKey }) => {
    console.log("accountId is valid keypom contract ", keypomContractId);
    const keyInfo = await getKeyInformation({
        secretKey,
    });
    console.log("keyInfo: ", keyInfo);

    if (keyInfo !== null) {
        return true;
    }

    return false;
};

export const hasEnoughBalance = async ({
    trialAccountId,
    totalGasForTxns,
    totalAttachedYocto,
}: {
    trialAccountId: string;
    totalGasForTxns: string;
    totalAttachedYocto: string;
}) => {
    const { near } = getEnv();

    const trialAccountObj = new Account(near!.connection, trialAccountId);
    const accountState = await trialAccountObj.state();

    const storageCostPerByte = new BN("10000000000000000000");
    const totalStorage = new BN(accountState.storage_usage).mul(
        storageCostPerByte
    );
    let availAmount = new BN(accountState.amount).sub(totalStorage);

    const yoctoPerGas = 100000000;
    let gasCost = new BN(totalGasForTxns).mul(new BN(yoctoPerGas));
    let totalCost = gasCost.add(new BN(totalAttachedYocto));

    return availAmount.gte(totalCost);
};
