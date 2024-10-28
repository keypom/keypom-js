/// <reference types="node" />
/// <reference types="node" />
import { Signature } from "near-api-js/lib/transaction";
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
