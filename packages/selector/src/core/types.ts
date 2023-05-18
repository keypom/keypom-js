import { InstantLinkWallet, NetworkId, Transaction } from '@near-wallet-selector/core';
import BN from 'bn.js';
import { KeypomWallet } from './wallet';
import { FinalExecutionOutcome } from '@near-js/types';
import { ModalCustomizations } from '../modal/src';

export const FAILED_EXECUTION_OUTCOME: FinalExecutionOutcome = {
    status: {
        Failure: {
            error_message: 'Invalid Trial Action',
            error_type: 'keypom-trial-error'
        }
    },
    transaction: {},
    transaction_outcome: {
        id: '',
        outcome: {
            logs: [],
            receipt_ids: [],
            tokens_burnt: '0',
            executor_id: '',
            gas_burnt: 0,
            status: {
                Failure: {
                    error_message: 'Invalid Trial Action',
                    error_type: 'keypom-trial-error'
                }
            },
        }
    },
    receipts_outcome: [{
        id: '',
        outcome: {
            logs: [],
            receipt_ids: [],
            gas_burnt: 0,
            tokens_burnt: '0',
            executor_id: '',
            status: {
                Failure: {
                    error_message: 'Invalid Trial Action',
                    error_type: 'keypom-trial-error'
                }
            },
        }
    }]
};

export const KEYPOM_MODULE_ID = 'keypom';

export interface InternalInstantSignInSpecs extends InstantSignInSpecs {
    moduleId?: string;
}

export interface InstantSignInSpecs extends BaseSignInSpecs {
    moduleDelimiter: string;
}

export interface TrialSignInSpecs extends BaseSignInSpecs {
    isMappingAccount: boolean;
}

export interface BaseSignInSpecs {
    baseUrl: string;
    delimiter: string;
}

export interface SignInOptions {
    contractId?: string;
    allowance?: string;
    methodNames?: string[];
}

// export declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// export interface SignAndSendTransactionsParams {
//     transactions: Array<Optional<Transaction, 'signerId'>>;
// }

export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet
}

export interface KeypomParams {
    networkId: NetworkId;
    signInContractId: string;
    trialAccountSpecs: BaseSignInSpecs,
    instantSignInSpecs: InstantSignInSpecs,
    deprecated?: boolean;
    trialSplitDelim?: string;
    modalOptions: ModalCustomizations;
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