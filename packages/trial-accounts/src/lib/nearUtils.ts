// utils.ts

import { Account } from "@near-js/accounts";
import { Near } from "@near-js/wallet-account";
import { Config } from "./types";
import fs from "fs";
import { Action, actionCreators } from "@near-js/transactions";
import { parseNearAmount } from "@near-js/utils";
import { KeyPair } from "@near-js/crypto";

/**
 * Initializes a NEAR connection using the provided configuration.
 *
 * @param config - The configuration object containing network ID, key store, etc.
 * @returns A Promise that resolves to a Near instance.
 */
export async function initNear(config: Config): Promise<Near> {
  const nearConfig = {
    networkId: config.networkId,
    nodeUrl: `https://rpc.${config.networkId}.near.org`,
    keyStore: config.keyStore,
  };
  const near = new Near(nearConfig);
  return near;
}

/**
 * Converts an object's keys from camelCase to snake_case recursively.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj && typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

/**
 * Ensures that a directory exists; if not, it creates the directory.
 *
 * @param dirPath - The path to the directory.
 */
export function ensureDirExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Reads a JSON file and parses its content.
 *
 * @param filePath - The path to the JSON file.
 * @returns The parsed JSON data.
 * @throws Will throw an error if the file does not exist.
 */
export function readJSONFile(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Writes an object to a JSON file.
 *
 * @param filePath - The path to the JSON file.
 * @param data - The data to write to the file.
 */
export function writeJSONFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function sendTransaction({
  signerAccount,
  receiverId,
  methodName,
  args,
  deposit,
  gas,
  wasmPath = undefined,
}: {
  signerAccount: Account;
  receiverId: string;
  methodName: string;
  args: any;
  deposit: string;
  gas: string;
  wasmPath?: string;
}) {
  const serializedArgsBuffer = Buffer.from(JSON.stringify(args));
  const serializedArgs = new Uint8Array(serializedArgsBuffer);

  let actions: Action[] = [];

  if (wasmPath) {
    const contractCode = fs.readFileSync(wasmPath);
    actions.push(actionCreators.deployContract(contractCode));
  }

  actions.push(
    actionCreators.functionCall(
      methodName,
      serializedArgs,
      BigInt(gas),
      BigInt(parseNearAmount(deposit)!),
    ),
  );

  const result = await signerAccount.signAndSendTransaction({
    receiverId: receiverId,
    actions,
  });

  return result;
}

export async function createAccountDeployContract({
  signerAccount,
  newAccountId,
  amount,
  near,
  wasmPath,
  methodName,
  args,
  deposit = "0",
  config,
  gas = "300000000000000",
}: {
  signerAccount: Account;
  newAccountId: string;
  amount: string;
  near: Near;
  wasmPath: string;
  methodName: string;
  args: any;
  config: Config;
  deposit?: string;
  gas?: string;
}) {
  console.log("Creating account: ", newAccountId);
  let sk = await createAccount({
    signerAccount,
    newAccountId,
    amount,
    config,
  });
  let keyPair = KeyPair.fromString(sk);
  console.log("Deploying contract: ", newAccountId);
  const accountObj = await near.account(newAccountId);
  await sendTransaction({
    signerAccount: accountObj,
    receiverId: newAccountId,
    methodName,
    args: { ...args, contract_key: keyPair.getPublicKey().toString() },
    deposit,
    gas,
    wasmPath,
  });

  console.log("Deployed.");
  return sk;
}

export async function createAccount({
  signerAccount,
  newAccountId,
  amount,
  config,
}: {
  signerAccount: Account;
  newAccountId: string;
  amount: string;
  config: Config;
}) {
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  await config.keyStore.setKey(config.networkId, newAccountId, keyPair);

  await signerAccount.functionCall({
    contractId: config.networkId === "testnet" ? "testnet" : "near",
    methodName: "create_account",
    args: {
      new_account_id: newAccountId,
      new_public_key: publicKey,
    },
    gas: BigInt("300000000000000"),
    attachedDeposit: BigInt(parseNearAmount(amount)!),
  });
  return keyPair.toString();
}
