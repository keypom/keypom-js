// lib/performAction.ts

import { ActionToPerform, MPCSignature, TrialAccountInfo } from "./types";
import { encodeMethodParams, esimateGasParams } from "./evmUtils";
import { JsonRpcProvider, VoidSigner } from "ethers";
import { checkActionValidity } from "./validityChecker";
import { Near } from "near-api-js";
import { parseNearAmount } from "near-api-js/lib/utils/format";

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
    trialAccountInfo: TrialAccountInfo;
    actionsToPerform: ActionToPerform[];
    evmProviderUrl?: string;
}

/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export async function generateActionArgs(
    params: PerformActionsParams
): Promise<{
    txnDatas: TransactionData[];
    txnArgs: any[];
}> {
    const { near, trialAccountInfo, actionsToPerform, evmProviderUrl } = params;

    const txnDatas: TransactionData[] = [];
    const txnArgs: any[] = [];
    for (const actionToPerform of actionsToPerform) {
        let chainId = actionToPerform.chainId || "NEAR";
        const trialAccountId = trialAccountInfo.accountIdByChainId[chainId];

        if (!trialAccountId) {
            throw new Error(`Trial account not activated for chain ${chainId}`);
        }

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

            txnDatas.push(txnData);
            txnArgs.push({
                contract_id: actionToPerform.targetContractId,
                method_name: actionToPerform.methodName,
                args: serializedArgs,
                gas: actionToPerform.gas,
                deposit: parseNearAmount(actionToPerform.attachedDepositNear!),
                nonce: nonce.toString(),
                block_hash: blockHash,
            });
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

            txnDatas.push(txnData);
            txnArgs.push({
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
            });
        } else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }

    return { txnDatas, txnArgs };
}

// Helper function to extract signature from the transaction result
export function extractSignatureFromResult(result: any): MPCSignature {
    const sigRes = JSON.parse(
        Buffer.from(result.status.SuccessValue, "base64").toString()
    );

    return sigRes;
}
