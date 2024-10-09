// performAction.ts

import { sendTransaction } from "./nearUtils";
import { ActionToPerform, Config } from "./types";
import fs from "fs";
import path from "path";
import { parseNearAmount } from "@near-js/utils";
import { KeyPair, KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import { extractLogsFromResult, parseContractLog } from "./logUtils";

interface PerformActionsParams {
  near: Near;
  config: Config;
  trialAccountId: string;
  trialAccountSecretKey: KeyPairString;
  contractAccountId: string;
  actionsToPerform: ActionToPerform[];
}

/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export async function performActions(
  params: PerformActionsParams,
): Promise<{ signatures: string[][]; nonces: string[]; blockHash: string }> {
  const {
    near,
    config,
    trialAccountId,
    trialAccountSecretKey,
    contractAccountId,
    actionsToPerform,
  } = params;

  // Set the trial key in the keyStore
  const keyStore: any = (near.connection.signer as any).keyStore;
  await keyStore.setKey(
    config.networkId,
    contractAccountId,
    KeyPair.fromString(trialAccountSecretKey),
  );
  let signerAccount = await near.account(trialAccountId);

  const signatures: string[][] = [];
  const nonces: string[] = [];
  const contractLogs: any[] = [];

  const provider = signerAccount.connection.provider;
  const block = await provider.block({ finality: "final" });
  const blockHash = block.header.hash;

  const accessKeys = await signerAccount.getAccessKeys();
  const accessKeyForSigning = accessKeys[0];
  let nonce = accessKeyForSigning.access_key.nonce;

  signerAccount = await near.account(contractAccountId);
  for (const actionToPerform of actionsToPerform) {
    const { targetContractId, methodName, args, gas, attachedDepositNear } =
      actionToPerform;
    nonce = BigInt(nonce) + 1n;

    console.log(
      `Performing action: ${methodName} on contract: ${targetContractId}`,
    );

    const serializedArgs = Array.from(Buffer.from(JSON.stringify(args)));

    // Call the perform_action method on the contract
    const result = await sendTransaction({
      signerAccount,
      receiverId: contractAccountId,
      methodName: "perform_action",
      args: {
        chain: "NEAR",
        contract_id: targetContractId,
        method_name: methodName,
        args: serializedArgs,
        gas,
        deposit: parseNearAmount(attachedDepositNear),
        nonce: nonce.toString(),
        block_hash: blockHash,
      },
      deposit: "0",
      gas,
    });

    // Extract logs from the transaction result
    const logs = extractLogsFromResult(result);

    // Find the specific log we're interested in
    const relevantLog = logs.find((log) => log.startsWith("Signer:"));
    if (relevantLog) {
      // Parse the log
      const parsedLog = parseContractLog(relevantLog);
      contractLogs.push(parsedLog);
    } else {
      console.error("Relevant log not found in the transaction result.");
    }

    // Extract the signature from the transaction result
    const sigRes = extractSignatureFromResult(result);
    signatures.push(sigRes);
    nonces.push(nonce.toString());
  }

  // Write the contract logs to a file for later comparison
  const logsFilePath = path.join(config.dataDir, `contract_logs.json`);
  fs.writeFileSync(logsFilePath, JSON.stringify(contractLogs, null, 2));
  console.log(`Contract logs written to ${logsFilePath}`);

  return { signatures, nonces, blockHash };
}

// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result: any): string[] {
  const sigRes = JSON.parse(
    Buffer.from(result.status.SuccessValue, "base64").toString(),
  );

  return sigRes;
}
