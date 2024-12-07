"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_VARIABLES = void 0;
exports.ENV_VARIABLES = {
    local: {
        MPC_CONTRACT_ID: "v1.signer-prod.testnet",
        FASTAUTH_CONTRACT_ID: "1732654372972-fastauth.testnet",
        STORAGE_KEY: "FAST_AUTH_WALLET_STATE",
        WORKER_BASE_URL: "http://localhost:8787",
    },
    testnet: {
        MPC_CONTRACT_ID: "v1.signer-prod.testnet",
        FASTAUTH_CONTRACT_ID: "1732654372972-fastauth.testnet",
        STORAGE_KEY: "FAST_AUTH_WALLET_STATE",
        WORKER_BASE_URL: "https://fastauth-worker-development.keypom.workers.dev",
    },
};
