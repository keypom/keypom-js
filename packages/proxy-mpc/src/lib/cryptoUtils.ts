// cryptoUtils.ts

import bs58 from "bs58";
import { sha256 } from "js-sha256";
import { Signature } from "near-api-js/lib/transaction";
import { KeyType } from "near-api-js/lib/utils/key_pair";

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
