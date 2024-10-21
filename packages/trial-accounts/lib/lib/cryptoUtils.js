"use strict";
// cryptoUtils.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePublicKey = exports.hashTransaction = exports.createSignature = void 0;
const crypto_1 = require("@near-js/crypto");
const bs58_1 = __importDefault(require("bs58"));
const js_sha256_1 = require("js-sha256");
const transactions_1 = require("@near-js/transactions");
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
