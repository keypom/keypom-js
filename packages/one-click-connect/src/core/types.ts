import { FinalExecutionOutcome } from "@near-js/types";
import { InstantLinkWallet, NetworkId } from "@near-wallet-selector/core";
import { KeypomWallet } from "./wallet";

export const FAILED_EXECUTION_OUTCOME: FinalExecutionOutcome = {
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

export interface InternalOneClickSpecs {
    moduleId?: string;
    baseUrl?: string;
    delimiter?: string;
    moduleDelimiter?: string;
}

export interface SignInOptions {
    contractId?: string;
    allowance?: string;
    methodNames?: string[];
}

export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet;
}

export interface OneClickParams {
    networkId: NetworkId;
    signInContractId: string;
    url: string;
}

export const isOneClickParams = (params: OneClickParams): boolean =>
    typeof params.networkId === "string" &&
    (params.networkId === "testnet" || params.networkId === "mainnet") &&
    typeof params.signInContractId === "string" &&
    typeof params.url === "string";

export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<bigint>;
    showModal();
};
