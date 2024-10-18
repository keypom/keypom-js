// lib/performAction.ts

import { sendTransaction } from "./networks/near";
import { ActionToPerform, MPCSignature } from "./types";
import { encodeMethodParams } from "./evmUtils";
import { parseNearAmount } from "@near-js/utils";
import { KeyPair, KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import { JsonRpcProvider, VoidSigner } from "ethers";
import { extractLogsFromResult, parseContractLog } from "./logUtils";

interface PerformActionsParams {
    near: Near;
    trialAccountId: string;
    trialAccountSecretKey: KeyPairString;
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
    nonces: string[];
    blockHash: string;
    contractLogs: string[];
}> {
    const {
        near,
        trialAccountSecretKey,
        trialContractId,
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

    const provider = signerAccount.connection.provider;
    const block = await provider.block({ finality: "final" });
    const blockHash = block.header.hash;

    const signatures: MPCSignature[] = [];
    const nonces: string[] = [];
    const contractLogs: string[] = [];
    for (const actionToPerform of actionsToPerform) {
        if (actionToPerform.chain === "NEAR") {
            // Get the trial user's near account access key info to get the nonce
            let trialUserNearAccount = await near.account(trialAccountId);
            const accessKeys = await trialUserNearAccount.getAccessKeys();
            const accessKeyForSigning = accessKeys[0];
            let nonce = accessKeyForSigning.access_key.nonce;

            nonce = BigInt(nonce) + 1n;
            const serializedArgs = Array.from(
                Buffer.from(JSON.stringify(actionToPerform.args))
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

            signatures.push(sigRes);
            nonces.push(nonce.toString());
        } else if (actionToPerform.chain === "EVM") {
            if (!actionToPerform.chainId) {
                throw new Error("chainId is not defined for EVM actions");
            }
            if (!evmProviderUrl) {
                throw new Error(
                    "evmProvider needs to be passed in for EVM actions"
                );
            }
            // Initialize provider
            const provider = new JsonRpcProvider(
                evmProviderUrl,
                actionToPerform.chainId
            );
            const signer = new VoidSigner(trialAccountId, provider);
            const nonce = (await signer.getNonce()) + 1;

            if (!actionToPerform.abi) {
                throw new Error("ABI is required for EVM actions");
            }

            // Use the utility function to encode method parameters
            const { methodParams, args } = encodeMethodParams(
                actionToPerform.methodName,
                actionToPerform.args!,
                actionToPerform.abi
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
                    gas_limit: actionToPerform.gasLimit,
                    value: actionToPerform.value,
                    chain_id: actionToPerform.chainId,
                    nonce: nonce.toString(),
                    max_fee_per_gas: actionToPerform.maxFeePerGas,
                    max_priority_fee_per_gas:
                        actionToPerform.maxPriorityFeePerGas,
                    access_list: actionToPerform.accessList,
                },
                deposit: "0",
                gas: "300000000000000",
            });

            // Handle the result, extract signatures, etc.
            const sigRes = extractSignatureFromResult(result);
            signatures.push(sigRes);
            nonces.push(nonce.toString());

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
        } else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }

    return { signatures, nonces, blockHash, contractLogs };
}

// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result: any): MPCSignature {
    const sigRes = JSON.parse(
        Buffer.from(result.status.SuccessValue, "base64").toString()
    );

    return sigRes;
}
