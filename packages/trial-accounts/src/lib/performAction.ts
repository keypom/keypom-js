// lib/performAction.ts

import { sendTransaction } from "./networks/near";
import { ActionToPerform, MPCSignature, TrialAccountInfo } from "./types";
import { encodeMethodParams, esimateGasParams } from "./evmUtils";
import { parseNearAmount } from "@near-js/utils";
import { KeyPair, KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import { JsonRpcProvider, VoidSigner } from "ethers";
import { extractLogsFromResult, parseContractLog } from "./logUtils";
import { checkActionValidity } from "./validityChecker";

export interface TransactionData {
    nonce: string;

    // For ETH
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasLimit?: string;

    // For NEAR
    blockHash?: string;
}

interface PerformActionsParams {
    near: Near;
    trialAccountId: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountInfo: TrialAccountInfo;
    trialContractId: string;
    actionsToPerform: ActionToPerform[];
    evmProviderUrl?: string;
}

/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export async function performActions(params: PerformActionsParams): Promise<{
    signatures: MPCSignature[];
    txnDatas: TransactionData[];
    contractLogs: string[];
}> {
    const {
        near,
        trialAccountSecretKey,
        trialContractId,
        trialAccountInfo,
        actionsToPerform,
        trialAccountId,
        evmProviderUrl,
    } = params;

    // Set the trial key in the keyStore
    const keyStore: any = (near.connection.signer as any).keyStore;
    await keyStore.setKey(
        near.connection.networkId,
        trialContractId,
        KeyPair.fromString(trialAccountSecretKey)
    );
    // set the signer to the trial contract to actually perform the call_*_contract methods using the proxy key
    const signerAccount = await near.account(trialContractId);

    const signatures: MPCSignature[] = [];
    const txnDatas: TransactionData[] = [];
    const contractLogs: string[] = [];

    for (const actionToPerform of actionsToPerform) {
        if (actionToPerform.chain === "NEAR") {
            // Get the trial user's near account access key info to get the nonce
            let trialUserNearAccount = await near.account(trialAccountId);
            const accessKeys = await trialUserNearAccount.getAccessKeys();
            const accessKeyForSigning = accessKeys[0];

            // Transaction Data
            let nonce = accessKeyForSigning.access_key.nonce;
            const provider = trialUserNearAccount.connection.provider;
            const block = await provider.block({ finality: "final" });
            const blockHash = block.header.hash;

            nonce = BigInt(nonce) + 1n;
            const serializedArgs = Array.from(
                Buffer.from(JSON.stringify(actionToPerform.args))
            );

            const txnData: TransactionData = {
                nonce: nonce.toString(),
                blockHash,
            };
            // Check validity of actions
            checkActionValidity(
                [actionToPerform],
                [txnData],
                trialAccountInfo.trialData,
                trialAccountInfo.usageStats,
                Date.now()
            );

            // Call the perform_action method on the contract
            const result = await sendTransaction({
                signerAccount,
                receiverId: trialContractId,
                methodName: "call_near_contract",
                args: {
                    contract_id: actionToPerform.targetContractId,
                    method_name: actionToPerform.methodName,
                    args: serializedArgs,
                    gas: actionToPerform.gas,
                    deposit: parseNearAmount(
                        actionToPerform.attachedDepositNear!
                    ),
                    nonce: nonce.toString(),
                    block_hash: blockHash,
                },
                deposit: "0",
                gas: "300000000000000",
            });

            // Extract the signature from the transaction result
            const sigRes = extractSignatureFromResult(result);
            console.log("Signature: ", sigRes);
            signatures.push(sigRes);

            txnDatas.push(txnData);
        } else if (actionToPerform.chain === "EVM") {
            if (!actionToPerform.chainId) {
                throw new Error("chainId is not defined for EVM actions");
            }
            if (!evmProviderUrl) {
                throw new Error(
                    "evmProvider needs to be passed in for EVM actions"
                );
            }
            if (!actionToPerform.abi) {
                throw new Error("ABI is required for EVM actions");
            }

            try {
                // Use the utility function to encode method parameters
                const { methodParams, args } = encodeMethodParams(
                    actionToPerform.methodName,
                    actionToPerform.args!,
                    actionToPerform.abi
                );

                // Initialize provider
                const provider = new JsonRpcProvider(
                    evmProviderUrl,
                    actionToPerform.chainId
                );

                // Get the nonce
                const signer = new VoidSigner(trialAccountId, provider);
                const { nonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
                    await esimateGasParams(provider, signer, actionToPerform);

                // Check validity of actions
                const txnData: TransactionData = {
                    nonce: nonce.toString(),
                    gasLimit: gasLimit.toString(),
                    maxFeePerGas: maxFeePerGas.toString(),
                    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                };
                checkActionValidity(
                    [actionToPerform],
                    [txnData],
                    trialAccountInfo.trialData,
                    trialAccountInfo.usageStats,
                    Date.now()
                );

                // Prepare the arguments as per the contract's expectations
                const result = await sendTransaction({
                    signerAccount,
                    receiverId: trialContractId,
                    methodName: "call_evm_contract",
                    args: {
                        contract_address: actionToPerform.targetContractId,
                        method_name: actionToPerform.methodName,
                        method_params: methodParams,
                        args: args,
                        gas_limit: txnData.gasLimit,
                        value: actionToPerform.value,
                        chain_id: actionToPerform.chainId,
                        nonce: txnData.nonce,
                        max_fee_per_gas: txnData.maxFeePerGas,
                        max_priority_fee_per_gas: txnData.maxPriorityFeePerGas,
                        access_list: actionToPerform.accessList,
                    },
                    deposit: "0",
                    gas: "300000000000000",
                });

                // Handle the result, extract signatures, etc.
                const sigRes = extractSignatureFromResult(result);
                signatures.push(sigRes);

                txnDatas.push(txnData);

                const logs = extractLogsFromResult(result);
                // Find the specific log we're interested in
                const relevantLog = logs.find((log) =>
                    log.includes("LOG_STR_CHAIN_ID")
                );
                if (relevantLog) {
                    // Parse the log
                    const parsedLog = parseContractLog(relevantLog);
                    contractLogs.push(parsedLog);
                } else {
                    console.error(
                        "Relevant log not found in the transaction result."
                    );
                }
            } catch (e) {
                throw new Error(`Error while performing action: ${e}`);
            }
        } else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }

    return { signatures, txnDatas, contractLogs };
}

// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result: any): MPCSignature {
    const sigRes = JSON.parse(
        Buffer.from(result.status.SuccessValue, "base64").toString()
    );

    return sigRes;
}
