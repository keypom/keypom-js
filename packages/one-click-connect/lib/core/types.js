"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkPreset = exports.isOneClickParams = exports.FAILED_EXECUTION_OUTCOME = void 0;
exports.FAILED_EXECUTION_OUTCOME = {
    final_execution_status: "NONE",
    status: {
        Failure: {
            error_message: "Invalid Trial Action",
            error_type: "keypom-trial-error",
        },
    },
    transaction: {},
    transaction_outcome: {
        id: "",
        outcome: {
            logs: [],
            receipt_ids: [],
            tokens_burnt: "0",
            executor_id: "",
            gas_burnt: 0,
            status: {
                Failure: {
                    error_message: "Invalid Trial Action",
                    error_type: "keypom-trial-error",
                },
            },
        },
    },
    receipts_outcome: [
        {
            id: "",
            outcome: {
                logs: [],
                receipt_ids: [],
                gas_burnt: 0,
                tokens_burnt: "0",
                executor_id: "",
                status: {
                    Failure: {
                        error_message: "Invalid Trial Action",
                        error_type: "keypom-trial-error",
                    },
                },
            },
        },
    ],
};
var isOneClickParams = function (params) {
    return typeof params.networkId === "string" &&
        (params.networkId === "testnet" || params.networkId === "mainnet");
};
exports.isOneClickParams = isOneClickParams;
var getNetworkPreset = function (networkId) {
    switch (networkId) {
        case "mainnet":
            return {
                networkId: networkId,
                nodeUrl: "https://rpc.mainnet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                explorerUrl: "https://nearblocks.io",
                indexerUrl: "https://api.kitwallet.app",
            };
        case "testnet":
            return {
                networkId: networkId,
                nodeUrl: "https://rpc.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://testnet.nearblocks.io",
                indexerUrl: "https://testnet-api.kitwallet.app",
            };
        default:
            throw Error("Failed to find config for: '".concat(networkId, "'"));
    }
};
exports.getNetworkPreset = getNetworkPreset;
