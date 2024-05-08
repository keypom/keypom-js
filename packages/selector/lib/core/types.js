"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKeypomParams = exports.isInstantSignInSpecs = exports.isTrialSignInSpecs = exports.KEYPOM_MODULE_ID = exports.FAILED_EXECUTION_OUTCOME = void 0;
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
exports.KEYPOM_MODULE_ID = "keypom";
var isTrialSignInSpecs = function (obj) {
    return typeof obj === "object" &&
        obj !== null &&
        typeof obj.url === "string" &&
        obj.modalOptions &&
        typeof obj.modalOptions === "object";
};
exports.isTrialSignInSpecs = isTrialSignInSpecs;
var isInstantSignInSpecs = function (obj) {
    return typeof obj === "object" && obj !== null && typeof obj.url === "string";
};
exports.isInstantSignInSpecs = isInstantSignInSpecs;
var isKeypomParams = function (params) {
    return typeof params.networkId === "string" &&
        (params.networkId === "testnet" || params.networkId === "mainnet") &&
        typeof params.signInContractId === "string" &&
        ((0, exports.isTrialSignInSpecs)(params.trialAccountSpecs) ||
            (0, exports.isInstantSignInSpecs)(params.instantSignInSpecs));
};
exports.isKeypomParams = isKeypomParams;
