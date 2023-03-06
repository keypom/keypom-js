"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkPreset = exports.resolveWalletUrl = void 0;
const envConfig_1 = require("../envConfig");
const resolveWalletUrl = (network, walletUrl) => {
    if (walletUrl) {
        return walletUrl;
    }
    const base = envConfig_1.envConfig.wallet_base_url;
    switch (network) {
        case "mainnet":
            return `${base}/connect/mainnet`;
        case "testnet":
            return `${base}/connect/testnet`;
        case "betanet":
            return `${base}/connect/betanet`;
        default:
            throw new Error("Invalid wallet URL");
    }
};
exports.resolveWalletUrl = resolveWalletUrl;
const getNetworkPreset = (networkId) => {
    switch (networkId) {
        case "mainnet":
            return {
                networkId,
                nodeUrl: "https://rpc.mainnet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                explorerUrl: "https://explorer.near.org",
            };
        case "testnet":
            return {
                networkId,
                nodeUrl: "https://rpc.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://explorer.testnet.near.org",
            };
        case "betanet":
            return {
                networkId,
                nodeUrl: "https://rpc.betanet.near.org",
                helperUrl: "https://helper.betanet.near.org",
                explorerUrl: "https://explorer.betanet.near.org",
            };
        default:
            throw Error(`Failed to find config for: '${networkId}'`);
    }
};
exports.getNetworkPreset = getNetworkPreset;
//# sourceMappingURL=MeteorSdkUtils.js.map