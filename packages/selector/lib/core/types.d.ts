import { InstantLinkWallet, NetworkId } from '@near-wallet-selector/core';
import BN from 'bn.js';
import { KeypomWallet } from './wallet';
import { FinalExecutionOutcome } from '@near-js/types';
import { ModalCustomizations } from '../modal/src';
export declare const FAILED_EXECUTION_OUTCOME: FinalExecutionOutcome;
export declare const KEYPOM_MODULE_ID = "keypom";
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
export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet;
}
export interface KeypomParams {
    networkId: NetworkId;
    signInContractId: string;
    trialAccountSpecs: BaseSignInSpecs;
    instantSignInSpecs: InstantSignInSpecs;
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
    showModal(): any;
};
