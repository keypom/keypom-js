/// <reference types="node" />
/// <reference types="node" />
import { ec as EC } from "elliptic";
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
export declare function retryAsync<T>(fn: () => Promise<T>, retries?: number, delay?: number, factor?: number): Promise<T>;
/**
 * Recovers the public key from a signature and message hash.
 * @param msgHash - The hash of the message.
 * @param signature - The signature components { r, s }.
 * @param recoveryId - The recovery ID.
 * @returns The recovered EC KeyPair.
 */
export declare function recoverPublicKeyFromSignature(msgHash: Uint8Array, signature: MPCSignature): EC.KeyPair;
/**
 * Compresses an uncompressed public key.
 * @param publicKeyBytes - The uncompressed public key bytes.
 * @returns The compressed public key bytes.
 */
export declare function compressPublicKey(publicKeyBytes: Buffer): Buffer;
/**
 * Creates a NEAR Signature object from r, s, and recovery ID.
 * @param r - The r component of the signature.
 * @param s - The s component of the signature.
 * @returns A NEAR Signature object.
 */
export declare function createSignature(r: string, s: string): Signature;
/**
 * Hashes the serialized transaction using SHA-256.
 * @param serializedTx - The serialized transaction bytes.
 * @returns The SHA-256 hash as a Uint8Array.
 */
export declare function hashTransaction(serializedTx: Uint8Array): Uint8Array;
/**
 * Parses the NEAR public key from its string representation.
 * @param mpcPublicKey - The NEAR-formatted public key string.
 * @returns The decoded public key bytes.
 */
export declare function parsePublicKey(mpcPublicKey: string): Buffer;
