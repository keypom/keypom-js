// addTrialKeys.ts

import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { sendTransaction, writeJSONFile, ensureDirExists } from "./nearUtils";
import { Config, TrialKey } from "./types";
import { getDerivedPublicKeyFromMpc } from "./mpcUtils/kdf";
import path from "path";
import bs58 from "bs58";
import { logSuccess } from "./logUtils";

interface AddTrialAccountsParams {
  signerAccount: Account;
  contractAccountId: string;
  config: Config;
  trialId: number;
  numberOfKeys: number;
  dataDir: string;
}

/**
 * Adds trial accounts to the trial contract by generating key pairs and deriving MPC keys.
 *
 * @param params - The parameters required to add trial accounts.
 * @returns A Promise that resolves to an array of TrialKey objects.
 * @throws Will throw an error if adding trial keys fails.
 */
export async function addTrialAccounts(
  params: AddTrialAccountsParams,
): Promise<TrialKey[]> {
  const {
    signerAccount,
    contractAccountId,
    trialId,
    numberOfKeys,
    dataDir,
    config,
  } = params;

  console.log(`Adding ${numberOfKeys} trial accounts...`);

  const trialKeys: TrialKey[] = [];

  for (let i = 0; i < numberOfKeys; i++) {
    // Generate a new key pair
    const keyPair = KeyPair.fromRandom("ed25519");

    // Derive the MPC public key
    const derivationPath = keyPair.getPublicKey().toString();
    const mpcPublicKeyBuffer = await getDerivedPublicKeyFromMpc(
      contractAccountId,
      derivationPath,
    );
    const calculatedMpcPublicKey =
      convertSecp256k1KeyToPublicKey(mpcPublicKeyBuffer).toString();

    const actualMpcPublicKey = await signerAccount.viewFunction({
      contractId: config.mpcContractId,
      methodName: "derived_public_key",
      args: {
        path: derivationPath,
        predecessor: contractAccountId,
      },
    });

    if (calculatedMpcPublicKey !== actualMpcPublicKey) {
      throw new Error(
        `Calculated MPC public key ${calculatedMpcPublicKey} does not match actual MPC public key ${actualMpcPublicKey}`,
      );
    } else {
      logSuccess(
        `Calculated MPC public key: ${calculatedMpcPublicKey} matches queried key.`,
      );
    }

    const mpcPublicKey = calculatedMpcPublicKey;

    // Generate a trial account ID
    const trialAccountId = `${Date.now().toString()}-trial-${i}.testnet`;

    trialKeys.push({
      trialAccountId,
      derivationPath,
      trialAccountSecretKey: keyPair.toString(),
      trialAccountPublicKey: keyPair.getPublicKey().toString(),
      mpcKey: mpcPublicKey,
    });
  }

  // Prepare data to send to the contract
  const keysWithMpc = trialKeys.map((trialKey) => ({
    public_key: trialKey.trialAccountPublicKey,
    mpc_key: trialKey.mpcKey,
  }));

  // Call the `add_trial_keys` function
  const result = await sendTransaction({
    signerAccount,
    receiverId: contractAccountId,
    methodName: "add_trial_keys",
    args: {
      keys: keysWithMpc,
      trial_id: trialId,
    },
    deposit: "1", // Adjust deposit as needed
    gas: "300000000000000",
  });

  if (result) {
    console.log("Trial keys added successfully.");

    // Ensure the data directory exists
    ensureDirExists(dataDir);

    // Save the trial keys to a file
    const filePath = path.join(dataDir, `trial-${trialId}-keys.json`);
    writeJSONFile(filePath, trialKeys);

    return trialKeys;
  } else {
    throw new Error("Failed to add trial keys");
  }
}

function convertSecp256k1KeyToPublicKey(mpcKeyData: Buffer) {
  // Ensure mpcKeyData is a Buffer
  if (!Buffer.isBuffer(mpcKeyData)) {
    throw new Error("mpcKeyData must be a Buffer");
  }

  // Check that the key is 65 bytes and starts with 0x04
  if (mpcKeyData.length !== 65 || mpcKeyData[0] !== 0x04) {
    throw new Error("Invalid uncompressed secp256k1 public key");
  }

  // Remove the first byte (0x04)
  const keyData = mpcKeyData.slice(1); // 64 bytes

  // Curve type byte: 1 for secp256k1
  const curveTypeByte = Buffer.from([1]);

  // Combine curve type byte and key data
  const publicKeyData = Buffer.concat([curveTypeByte, keyData]);

  // Base58 encode the key data (excluding the curve type byte) for string representation
  const base58EncodedKeyData = bs58.encode(keyData);

  // Construct the string representation
  const publicKeyString = `secp256k1:${base58EncodedKeyData}`;

  // Return the PublicKey object
  return {
    data: publicKeyData,
    toString: () => publicKeyString,
  };
}
