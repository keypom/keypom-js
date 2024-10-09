"use strict";
// cryptoUtils.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePublicKey = exports.hashTransaction = exports.createSignature = exports.compressPublicKey = exports.recoverPublicKeyFromSignature = exports.retryAsync = void 0;
const elliptic_1 = require("elliptic");
const crypto_1 = require("@near-js/crypto");
const bs58_1 = __importDefault(require("bs58"));
const js_sha256_1 = require("js-sha256");
const transactions_1 = require("@near-js/transactions");
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
async function retryAsync(fn, retries = 3, delay = 1000, factor = 2) {
    let attempt = 0;
    let currentDelay = delay;
    while (attempt < retries) {
        try {
            return await fn();
        }
        catch (error) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            console.warn(`Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`, `Error: ${error.message || error}`);
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= factor; // Exponential backoff
        }
    }
    // This point should never be reached
    throw new Error("Unexpected error in retryAsync");
}
exports.retryAsync = retryAsync;
/**
 * Recovers the public key from a signature and message hash.
 * @param msgHash - The hash of the message.
 * @param signature - The signature components { r, s }.
 * @param recoveryId - The recovery ID.
 * @returns The recovered EC KeyPair.
 */
function recoverPublicKeyFromSignature(msgHash, signature) {
    const ec = new elliptic_1.ec("secp256k1");
    let pubKeyRecovered = ec.recoverPubKey(msgHash, {
        r: Buffer.from(signature.big_r.affine_point.substring(2), "hex"),
        s: Buffer.from(signature.s.scalar, "hex"),
    }, signature.recovery_id, "hex");
    console.log("pubKeyRecovered", pubKeyRecovered.encode("hex"));
    return pubKeyRecovered;
}
exports.recoverPublicKeyFromSignature = recoverPublicKeyFromSignature;
/**
 * Compresses an uncompressed public key.
 * @param publicKeyBytes - The uncompressed public key bytes.
 * @returns The compressed public key bytes.
 */
function compressPublicKey(publicKeyBytes) {
    const ec = new elliptic_1.ec("secp256k1");
    const keyPair = ec.keyFromPublic(publicKeyBytes);
    const compressedKey = Buffer.from(keyPair.getPublic().encode("array", true));
    return compressedKey;
}
exports.compressPublicKey = compressPublicKey;
/**
 * Creates a NEAR Signature object from r, s, and recovery ID.
 * @param r - The r component of the signature.
 * @param s - The s component of the signature.
 * @returns A NEAR Signature object.
 */
function createSignature(r, s) {
    return new transactions_1.Signature({
        keyType: crypto_1.KeyType.SECP256K1,
        data: Buffer.concat([
            Buffer.from(r.substring(2), "hex"),
            Buffer.from(s, "hex"),
            Buffer.from(r.substring(0, 2), "hex"),
        ]),
    });
}
exports.createSignature = createSignature;
/**
 * Hashes the serialized transaction using SHA-256.
 * @param serializedTx - The serialized transaction bytes.
 * @returns The SHA-256 hash as a Uint8Array.
 */
function hashTransaction(serializedTx) {
    return new Uint8Array(js_sha256_1.sha256.array(serializedTx));
}
exports.hashTransaction = hashTransaction;
/**
 * Parses the NEAR public key from its string representation.
 * @param mpcPublicKey - The NEAR-formatted public key string.
 * @returns The decoded public key bytes.
 */
function parsePublicKey(mpcPublicKey) {
    // Remove 'secp256k1:' prefix and decode
    const publicKeyBytes = bs58_1.default.decode(mpcPublicKey.replace("secp256k1:", ""));
    return Buffer.from(publicKeyBytes);
}
exports.parsePublicKey = parsePublicKey;
