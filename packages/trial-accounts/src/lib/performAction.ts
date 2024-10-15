// lib/performAction.ts

import { sendTransaction } from "./networks/near";
import { ActionToPerform, MPCSignature } from "./types";
import { parseNearAmount } from "@near-js/utils";
import { KeyPair, KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";

interface PerformActionsParams {
    near: Near;
    trialAccountId: string;
    trialAccountSecretKey: KeyPairString;
    trialContractId: string;
    actionsToPerform: ActionToPerform[];
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
}> {
    const {
        near,
        trialAccountSecretKey,
        trialContractId,
        actionsToPerform,
        trialAccountId,
    } = params;

    // Set the trial key in the keyStore
    const keyStore: any = (near.connection.signer as any).keyStore;
    await keyStore.setKey(
        near.connection.networkId,
        trialContractId,
        KeyPair.fromString(trialAccountSecretKey)
    );

    const signatures: MPCSignature[] = [];
    const nonces: string[] = [];

    // Temporarily set the signer to the trial account to get the access key info
    let signerAccount = await near.account(trialAccountId);
    const provider = signerAccount.connection.provider;
    const block = await provider.block({ finality: "final" });
    const blockHash = block.header.hash;

    const accessKeys = await signerAccount.getAccessKeys();
    const accessKeyForSigning = accessKeys[0];
    let nonce = accessKeyForSigning.access_key.nonce;

    // set the signer back to the trial contract to actually perform the call_*_contract methods using the proxy key
    signerAccount = await near.account(trialContractId);
    for (const actionToPerform of actionsToPerform) {
        nonce = BigInt(nonce) + 1n;

        console.log(
            `Performing action: ${actionToPerform.methodName} on contract: ${actionToPerform.targetContractId}`
        );

        if (actionToPerform.chain === "NEAR") {
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
            signatures.push(sigRes);
            nonces.push(nonce.toString());
        } else if (actionToPerform.chain === "EVM") {
            // Implement logic for EVM actions
            // Prepare the arguments as per the contract's expectations
            const result = await sendTransaction({
                signerAccount,
                receiverId: trialContractId,
                methodName: "call_evm_contract",
                args: {
                    contract_address: actionToPerform.targetContractId,
                    method_name: actionToPerform.methodName,
                    method_params: actionToPerform.args.methodParams,
                    args: actionToPerform.args.args,
                    gas_limit: actionToPerform.gasLimit,
                    value: actionToPerform.value,
                    chain_id: actionToPerform.args.chainId,
                    nonce: nonce.toString(),
                    max_fee_per_gas: actionToPerform.args.maxFeePerGas,
                    max_priority_fee_per_gas:
                        actionToPerform.args.maxPriorityFeePerGas,
                    access_list: actionToPerform.args.accessList,
                },
                deposit: "0",
                gas: "300000000000000",
            });

            // Handle the result, extract signatures, etc.
            const sigRes = extractSignatureFromResult(result);
            signatures.push(sigRes);
            nonces.push(nonce.toString());
        } else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }

    return { signatures, nonces, blockHash };
}

// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result: any): MPCSignature {
    const sigRes = JSON.parse(
        Buffer.from(result.status.SuccessValue, "base64").toString()
    );
    console.log("Signature: ", sigRes);

    return sigRes;
}
