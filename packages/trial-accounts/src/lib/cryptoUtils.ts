// cryptoUtils.ts

import { ec as EC } from "elliptic";
import { KeyType } from "@near-js/crypto";
import bs58 from "bs58";
import { sha256 } from "js-sha256";
import { Signature } from "@near-js/transactions";
import { MPCSignature } from "./types";

/**
 * Helper function to retry an async operation with exponential backoff.
 *
 * @param fn - The async function to retry.
 * @param retries - Number of retries.
 * @param delay - Initial delay in milliseconds.
 * @param factor - Multiplicative factor for delay.
 * @returns The result of the async function if successful.
 * @throws The last error encountered if all retries fail.
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  factor: number = 2,
): Promise<T> {
  let attempt = 0;
  let currentDelay = delay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`,
        `Error: ${error.message || error}`,
      );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= factor; // Exponential backoff
    }
  }

  // This point should never be reached
  throw new Error("Unexpected error in retryAsync");
}

/**
 * Recovers the public key from a signature and message hash.
 * @param msgHash - The hash of the message.
 * @param signature - The signature components { r, s }.
 * @param recoveryId - The recovery ID.
 * @returns The recovered EC KeyPair.
 */
export function recoverPublicKeyFromSignature(
  msgHash: Uint8Array,
  signature: MPCSignature,
): EC.KeyPair {
  const ec = new EC("secp256k1");
  let pubKeyRecovered = ec.recoverPubKey(
    msgHash,
    {
      r: Buffer.from(signature.big_r.affine_point.substring(2), "hex"),
      s: Buffer.from(signature.s.scalar, "hex"),
    },
    signature.recovery_id,
    "hex",
  );

  console.log("pubKeyRecovered", pubKeyRecovered.encode("hex"));
  return pubKeyRecovered;
}

/**
 * Compresses an uncompressed public key.
 * @param publicKeyBytes - The uncompressed public key bytes.
 * @returns The compressed public key bytes.
 */
export function compressPublicKey(publicKeyBytes: Buffer): Buffer {
  const ec = new EC("secp256k1");
  const keyPair = ec.keyFromPublic(publicKeyBytes);
  const compressedKey = Buffer.from(
    keyPair.getPublic().encode("array", true), // 'true' for compressed
  );
  return compressedKey;
}

/**
 * Creates a NEAR Signature object from r, s, and recovery ID.
 * @param r - The r component of the signature.
 * @param s - The s component of the signature.
 * @returns A NEAR Signature object.
 */
export function createSignature(r: string, s: string): Signature {
  return new Signature({
    keyType: KeyType.SECP256K1,
    data: Buffer.concat([
      Buffer.from(r.substring(2), "hex"),
      Buffer.from(s, "hex"),
      Buffer.from(r.substring(0, 2), "hex"),
    ]),
  });
}

/**
 * Hashes the serialized transaction using SHA-256.
 * @param serializedTx - The serialized transaction bytes.
 * @returns The SHA-256 hash as a Uint8Array.
 */
export function hashTransaction(serializedTx: Uint8Array): Uint8Array {
  return new Uint8Array(sha256.array(serializedTx));
}

/**
 * Parses the NEAR public key from its string representation.
 * @param mpcPublicKey - The NEAR-formatted public key string.
 * @returns The decoded public key bytes.
 */
export function parsePublicKey(mpcPublicKey: string): Buffer {
  // Remove 'secp256k1:' prefix and decode
  const publicKeyBytes = bs58.decode(mpcPublicKey.replace("secp256k1:", ""));
  return Buffer.from(publicKeyBytes);
}
