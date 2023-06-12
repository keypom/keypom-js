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
    baseUrl?: string;
    delimiter?: string;
    moduleDelimiter?: string;
}

export interface InternalTrialSignInSpecs extends TrialSignInSpecs {
    isMappingAccount: boolean;
    baseUrl?: string;
    delimiter?: string;
}

export interface InstantSignInSpecs {
    url: string;
}

export interface TrialSignInSpecs {
    url: string;
    modalOptions: ModalCustomizations;
}

export interface SignInOptions {
    contractId?: string;
    allowance?: string;
    methodNames?: string[];
}

export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet
}

export interface KeypomParams {
    networkId: NetworkId;
    signInContractId: string;
    trialAccountSpecs?: TrialSignInSpecs,
    instantSignInSpecs?: InstantSignInSpecs,
}

export const isTrialSignInSpecs = (obj: any): obj is TrialSignInSpecs =>
    typeof obj === 'object' && obj !== null &&
    obj.hasOwnProperty('url') && typeof obj.url === 'string' &&
    obj.hasOwnProperty('modalOptions') && typeof obj.modalOptions === 'object' && obj.modalOptions !== null;

export const isInstantSignInSpecs = (obj: any): obj is InstantSignInSpecs =>
    typeof obj === 'object' && obj !== null &&
    obj.hasOwnProperty('url') && typeof obj.url === 'string';

export const isKeypomParams = (obj: any): obj is KeypomParams =>
    typeof obj === 'object' && obj !== null &&
    obj.hasOwnProperty('networkId') && (obj.networkId === 'testnet' || obj.networkId === 'mainnet') &&
    obj.hasOwnProperty('signInContractId') && typeof obj.signInContractId === 'string' &&
    (obj.hasOwnProperty('trialAccountSpecs') || obj.hasOwnProperty('instantSignInSpecs')) &&
    (!obj.hasOwnProperty('trialAccountSpecs') || isTrialSignInSpecs(obj.trialAccountSpecs)) &&
    (!obj.hasOwnProperty('instantSignInSpecs') || isInstantSignInSpecs(obj.instantSignInSpecs));


export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<BN>;
    showModal();
};