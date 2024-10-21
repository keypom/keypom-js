"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeChainId = exports.serializeChainId = exports.Chain = void 0;
/**
 * Enum representing supported blockchains.
 */
var Chain;
(function (Chain) {
    Chain["NEAR"] = "NEAR";
    Chain["Ethereum"] = "Ethereum";
})(Chain = exports.Chain || (exports.Chain = {}));
function serializeChainId(chainId) {
    if (chainId.type === "NEAR") {
        return { type: "NEAR" };
    }
    else if (chainId.type === "EVM") {
        return { type: "EVM", value: chainId.value };
    }
    else {
        throw new Error("Invalid ChainId");
    }
}
exports.serializeChainId = serializeChainId;
function deserializeChainId(data) {
    if (data.type === "NEAR") {
        return { type: "NEAR" };
    }
    else if (data.type === "EVM") {
        return { type: "EVM", value: data.value };
    }
    else {
        throw new Error("Invalid ChainId data");
    }
}
exports.deserializeChainId = deserializeChainId;
