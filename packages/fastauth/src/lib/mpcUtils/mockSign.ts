import { Hex, Signature, toHex } from "viem";

export function fromPayload(payload: number[]): Hex {
    if (payload.length !== 32) {
        throw new Error(`Payload must have 32 bytes: ${payload}`);
    }
    // Convert number[] back to Uint8Array
    return toHex(new Uint8Array(payload));
}

/**
 * Converts a raw hexadecimal signature into a structured Signature object
 * @param hexSignature The raw hexadecimal signature (e.g., '0x...')
 * @returns A structured Signature object with fields r, s, v, and yParity
 */
export function hexToSignature(hexSignature: Hex): Signature {
    // Strip "0x" prefix if it exists
    const cleanedHex = hexSignature.slice(2);

    // Ensure the signature is 65 bytes (130 hex characters)
    if (cleanedHex.length !== 130) {
        throw new Error(
            `Invalid hex signature length: ${cleanedHex.length}. Expected 130 characters (65 bytes).`
        );
    }

    // Extract the r, s, and v components from the hex signature
    const v = BigInt(`0x${cleanedHex.slice(128, 130)}`); // Last byte (2 hex characters)
    return {
        r: `0x${cleanedHex.slice(0, 64)}`, // First 32 bytes (64 hex characters)
        s: `0x${cleanedHex.slice(64, 128)}`, // Next 32 bytes (64 hex characters),
        v,
        // Determine yParity based on v (27 or 28 maps to 0 or 1)
        yParity: v === 27n ? 0 : v === 28n ? 1 : undefined,
    };
}
