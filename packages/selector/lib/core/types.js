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
        obj.hasOwnProperty("url") &&
        typeof obj.url === "string" &&
        obj.hasOwnProperty("modalOptions") &&
        typeof obj.modalOptions === "object" &&
        obj.modalOptions !== null;
};
exports.isTrialSignInSpecs = isTrialSignInSpecs;
var isInstantSignInSpecs = function (obj) {
    return typeof obj === "object" &&
        obj !== null &&
        obj.hasOwnProperty("url") &&
        typeof obj.url === "string";
};
exports.isInstantSignInSpecs = isInstantSignInSpecs;
var isKeypomParams = function (obj) {
    return typeof obj === "object" &&
        obj !== null &&
        obj.hasOwnProperty("networkId") &&
        (obj.networkId === "testnet" || obj.networkId === "mainnet") &&
        obj.hasOwnProperty("signInContractId") &&
        typeof obj.signInContractId === "string" &&
        (obj.hasOwnProperty("trialAccountSpecs") ||
            obj.hasOwnProperty("instantSignInSpecs")) &&
        (!obj.hasOwnProperty("trialAccountSpecs") ||
            (0, exports.isTrialSignInSpecs)(obj.trialAccountSpecs)) &&
        (!obj.hasOwnProperty("instantSignInSpecs") ||
            (0, exports.isInstantSignInSpecs)(obj.instantSignInSpecs));
};
exports.isKeypomParams = isKeypomParams;
