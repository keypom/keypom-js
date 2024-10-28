"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uncompressedHexPointToEvmAddress = exports.deriveChildPublicKey = exports.najPublicKeyStrToUncompressedHexPoint = void 0;
const js_sha3_1 = require("js-sha3");
const elliptic_1 = require("elliptic");
const ethers_1 = require("ethers");
const serialize_1 = require("near-api-js/lib/utils/serialize");
function najPublicKeyStrToUncompressedHexPoint(najPublicKeyStr) {
    const decodedKey = (0, serialize_1.base_decode)(najPublicKeyStr.split(":")[1]);
    return "04" + Buffer.from(decodedKey).toString("hex");
}
exports.najPublicKeyStrToUncompressedHexPoint = najPublicKeyStrToUncompressedHexPoint;
function deriveChildPublicKey(parentUncompressedPublicKeyHex, signerId, path = "") {
    const ec = new elliptic_1.ec("secp256k1");
    const scalarHex = (0, js_sha3_1.sha3_256)(`near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`);
    const x = parentUncompressedPublicKeyHex.substring(2, 66);
    const y = parentUncompressedPublicKeyHex.substring(66);
    // Create a point object from X and Y coordinates
    const oldPublicKeyPoint = ec.curve.point(x, y);
    // Multiply the scalar by the generator point G
    const scalarTimesG = ec.g.mul(scalarHex);
    // Add the result to the old public key point
    const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);
    const newX = newPublicKeyPoint.getX().toString("hex").padStart(64, "0");
    const newY = newPublicKeyPoint.getY().toString("hex").padStart(64, "0");
    return "04" + newX + newY;
}
exports.deriveChildPublicKey = deriveChildPublicKey;
function uncompressedHexPointToEvmAddress(uncompressedHexPoint) {
    const addressHash = (0, ethers_1.keccak256)(`0x${uncompressedHexPoint.slice(2)}`);
    // Ethereum address is last 20 bytes of hash (40 characters), prefixed with 0x
    return "0x" + addressHash.substring(addressHash.length - 40);
}
exports.uncompressedHexPointToEvmAddress = uncompressedHexPointToEvmAddress;
