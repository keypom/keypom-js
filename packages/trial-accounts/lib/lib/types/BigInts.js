"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToHex = exports.bytesToBigInt = exports.BIGINT_27 = void 0;
exports.BIGINT_27 = BigInt(27);
const BIGINT_0 = BigInt(0);
/**
 * Converts a {@link Uint8Array} to a {@link bigint}
 * @param {Uint8Array} bytes the bytes to convert
 * @returns {bigint}
 */
const bytesToBigInt = (bytes, littleEndian = false) => {
    if (littleEndian) {
        bytes.reverse();
    }
    const hex = (0, exports.bytesToHex)(bytes);
    if (hex === "0x") {
        return BIGINT_0;
    }
    if (hex.length === 4) {
        // If the byte length is 1 (this is faster than checking `bytes.length === 1`)
        return BIGINT_CACHE[bytes[0]];
    }
    if (hex.length === 6) {
        return BIGINT_CACHE[bytes[0] * 256 + bytes[1]];
    }
    return BigInt(hex);
};
exports.bytesToBigInt = bytesToBigInt;
/****************  Borrowed from @chainsafe/ssz */
// Caching this info costs about ~1000 bytes and speeds up toHexString() by x6
const hexByByte = Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
const bytesToHex = (bytes) => {
    let hex = `0x`;
    if (bytes === undefined || bytes.length === 0)
        return hex;
    for (const byte of bytes) {
        hex = `${hex}${hexByByte[byte]}`;
    }
    return hex;
};
exports.bytesToHex = bytesToHex;
// BigInt cache for the numbers 0 - 256*256-1 (two-byte bytes)
const BIGINT_CACHE = [];
for (let i = 0; i <= 256 * 256 - 1; i++) {
    BIGINT_CACHE[i] = BigInt(i);
}
