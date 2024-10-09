// broadcastTransaction.ts

import { Account } from "@near-js/accounts";
import {
  Action,
  actionCreators,
  createTransaction,
  SignedTransaction,
} from "@near-js/transactions";
import { parseNearAmount } from "@near-js/utils";
import { PublicKey } from "@near-js/crypto";
import bs58 from "bs58";
import fs from "fs";
import path from "path";
import {
  recoverPublicKeyFromSignature,
  compressPublicKey,
  createSignature,
  hashTransaction,
  parsePublicKey,
} from "./cryptoUtils";
import { ActionToPerform, MPCSignature } from "./types";
import { logError, logInfo, logSuccess } from "./logUtils";

interface BroadcastTransactionParams {
  signerAccount: Account;
  actionToPerform: ActionToPerform;
  signatureResult: MPCSignature; // Signature result from the MPC
  nonce: string;
  blockHash: string;
  mpcPublicKey: string; // Add this parameter
  trialAccountPublicKey: string;
}

/**
 * Broadcasts a signed transaction to the NEAR network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */

export async function broadcastTransaction(
  params: BroadcastTransactionParams,
): Promise<void> {
  const {
    signerAccount,
    actionToPerform,
    signatureResult,
    nonce,
    blockHash,
    mpcPublicKey,
    trialAccountPublicKey,
  } = params;

  const { targetContractId, methodName, args, gas, attachedDepositNear } =
    actionToPerform;

  const serializedArgs = new Uint8Array(Buffer.from(JSON.stringify(args)));

  const provider = signerAccount.connection.provider;

  const blockHashBytes = bs58.decode(blockHash);

  const accessKeys = await signerAccount.getAccessKeys();
  const accessKeyForSigning = accessKeys.find(
    (key) => key.public_key === mpcPublicKey,
  );

  if (!accessKeyForSigning) {
    throw new Error(
      `No access key found for signing with MPC public key ${mpcPublicKey}`,
    );
  }

  logSuccess(
    `User has correct MPC access key on their account: ${accessKeyForSigning!.public_key}`,
  );

  const actions: Action[] = [
    actionCreators.functionCall(
      methodName,
      serializedArgs,
      BigInt(gas),
      BigInt(parseNearAmount(attachedDepositNear)!),
    ),
  ];

  // Collect the broadcast logs into an object

  // Create the transaction
  const transaction = createTransaction(
    signerAccount.accountId,
    PublicKey.fromString(mpcPublicKey), // Use MPC public key
    targetContractId,
    nonce,
    actions,
    blockHashBytes,
  );

  // Hash the transaction to get the message to sign
  const serializedTx = transaction.encode();
  const txHash = hashTransaction(serializedTx);

  const broadcastLog = {
    signerAccount: signerAccount.accountId,
    targetContract: targetContractId,
    methodName,
    args: Array.from(serializedArgs),
    gas,
    deposit: attachedDepositNear,
    publicKey: trialAccountPublicKey,
    mpcPublicKey,
    nonce,
    blockHash,
    txHash: Array.from(txHash), // Add TxHash here
    actions: actions.map((action) => {
      if (action.functionCall) {
        return {
          methodName: action.functionCall.methodName,
          args: Array.from(action.functionCall.args),
          gas: action.functionCall.gas.toString(),
          deposit: action.functionCall.deposit.toString(),
        };
      }
      return action;
    }),
  };

  // Write the broadcast log to a file for comparison
  const logsFilePath = path.join("data", `broadcast_logs.json`);
  fs.writeFileSync(logsFilePath, JSON.stringify(broadcastLog, null, 2));

  // Log transaction hash
  logInfo(`=== Transaction Details ===`);
  console.log("Transaction Hash:", Buffer.from(txHash).toString("hex"));

  let r = signatureResult.big_r.affine_point;
  let s = signatureResult.s.scalar;

  const signature = createSignature(r, s);

  const signedTransaction = new SignedTransaction({
    transaction,
    signature,
  });

  // Send the signed transaction
  logInfo(`=== Sending Transaction ===`);
  try {
    const result = await provider.sendTransaction(signedTransaction);
    console.log("Transaction Result:", result);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}
