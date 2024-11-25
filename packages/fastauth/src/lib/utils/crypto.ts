import bs58 from "bs58";
import { ethers } from "ethers";

export function deriveEthAddressFromMpcKey(mpcKey: string): string {
    // Remove the curve type prefix
    const [curveType, keyDataBase58] = mpcKey.split(":");
    if (curveType !== "secp256k1") {
        throw new Error("Expected secp256k1 key");
    }
    const keyData = bs58.decode(keyDataBase58); // Key data
    console.log("Key data length:", keyData.length);
    console.log("Key data (hex):", Buffer.from(keyData).toString("hex"));

    if (keyData.length === 64) {
        // Uncompressed public key without prefix byte
        // Add the '04' prefix to indicate uncompressed key
        const uncompressedPublicKeyHex =
            "04" + Buffer.from(keyData).toString("hex");
        // Compute the Ethereum address using ethers.js
        const ethAddress = ethers.computeAddress(
            "0x" + uncompressedPublicKeyHex
        );
        return ethAddress.toLowerCase();
    } else {
        throw new Error(
            "Unsupported public key format. Expected 64 bytes of key data."
        );
    }
}
