import { InstantLinkWallet, NetworkId, Transaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { BeginTrialCustomizations, InsufficientBalanceCustomizations, InvalidActionCustomizations, OffboardingWallet, TrialOverCustomizations } from "../modal/src/lib/modal.types";
import { KeypomWallet } from "./wallet";

export const FAILED_EXECUTION_OUTCOME: FinalExecutionOutcome = {
    status: {
        Failure: {
            error_message: "Invalid Trial Action",
            error_type: "keypom-trial-error"
        }
    },
    transaction: {},
    transaction_outcome: {
        id: "",
        outcome: {
            logs: [],
            receipt_ids: [],
            tokens_burnt: '0',
            executor_id: '',
            gas_burnt: 0,
            status: {
                Failure: {
                    error_message: "Invalid Trial Action",
                    error_type: "keypom-trial-error"
                }
            },
        }
    },
    receipts_outcome: [{
        id: "",
        outcome: {
            logs: [],
            receipt_ids: [],
            gas_burnt: 0,
            tokens_burnt: '0',
            executor_id: '',
            status: {
                Failure: {
                    error_message: "Invalid Trial Action",
                    error_type: "keypom-trial-error"
                }
            },
        }
    }]
}

export interface SignInOptions {
    contractId?: string;
    allowance?: string;
    methodNames?: string[];
}

export declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface SignAndSendTransactionsParams {
    transactions: Array<Optional<Transaction, "signerId">>;
}

export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet
}

export interface KeypomParams {
    networkId: NetworkId;
    signInContractId: string;
    trialBaseUrl: string;
    iconUrl?: string;
    deprecated?: boolean;
    trialSplitDelim?: string;
    modalOptions?: {
        wallets: OffboardingWallet[];
        beginTrial?: BeginTrialCustomizations,
        trialOver?: TrialOverCustomizations,
        invalidAction?: InvalidActionCustomizations,
        insufficientBalance?: InsufficientBalanceCustomizations,
    };
}

export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<BN>;
    showModal();
};