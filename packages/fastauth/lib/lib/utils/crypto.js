"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveEthAddressFromMpcKey = void 0;
const bs58_1 = __importDefault(require("bs58"));
const ethers_1 = require("ethers");
function deriveEthAddressFromMpcKey(mpcKey) {
    // Remove the curve type prefix
    const [curveType, keyDataBase58] = mpcKey.split(":");
    if (curveType !== "secp256k1") {
        throw new Error("Expected secp256k1 key");
    }
    const keyData = bs58_1.default.decode(keyDataBase58); // Key data
    console.log("Key data length:", keyData.length);
    console.log("Key data (hex):", Buffer.from(keyData).toString("hex"));
    if (keyData.length === 64) {
        // Uncompressed public key without prefix byte
        // Add the '04' prefix to indicate uncompressed key
        const uncompressedPublicKeyHex = "04" + Buffer.from(keyData).toString("hex");
        // Compute the Ethereum address using ethers.js
        const ethAddress = ethers_1.ethers.computeAddress("0x" + uncompressedPublicKeyHex);
        return ethAddress.toLowerCase();
    }
    else {
        throw new Error("Unsupported public key format. Expected 64 bytes of key data.");
    }
}
exports.deriveEthAddressFromMpcKey = deriveEthAddressFromMpcKey;
