import { InstantLinkWallet, NetworkId } from "@near-wallet-selector/core";
import { KeypomWallet } from "./wallet";

export const FAILED_EXECUTION_OUTCOME: any = {
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
    urlPattern: string;
}

export const isOneClickParams = (params: OneClickParams): boolean =>
    typeof params.networkId === "string" &&
    (params.networkId === "testnet" || params.networkId === "mainnet") &&
    typeof params.urlPattern === "string";

export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<bigint>;
    showModal();
};

export type AddKeyPermission =
  | "FullAccess"
  | {
      receiverId: string;
      allowance?: string;
      methodNames?: Array<string>;
    };
