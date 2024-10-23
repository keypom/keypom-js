export declare const BIGINT_27: bigint;
export type PrefixedHexString = `0x${string}`;
/**
 * Converts a {@link Uint8Array} to a {@link bigint}
 * @param {Uint8Array} bytes the bytes to convert
 * @returns {bigint}
 */
export declare const bytesToBigInt: (bytes: Uint8Array, littleEndian?: boolean) => bigint;
export declare const bytesToHex: (bytes: Uint8Array) => PrefixedHexString;
