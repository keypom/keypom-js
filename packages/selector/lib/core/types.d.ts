import { InstantLinkWallet, NetworkId } from "@near-wallet-selector/core";
import BN from "bn.js";
import { KeypomWallet } from "./wallet";
import { FinalExecutionOutcome } from "@near-js/types";
import { ModalCustomizations } from "../modal/src";
export declare const FAILED_EXECUTION_OUTCOME: FinalExecutionOutcome;
export declare const KEYPOM_MODULE_ID = "keypom";
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
    keypomWallet: KeypomWallet;
}
export interface KeypomParams {
    networkId: NetworkId;
    signInContractId: string;
    trialAccountSpecs?: TrialSignInSpecs;
    instantSignInSpecs?: InstantSignInSpecs;
}
export declare const isTrialSignInSpecs: (obj: any) => obj is TrialSignInSpecs;
export declare const isInstantSignInSpecs: (obj: any) => obj is InstantSignInSpecs;
export declare const isKeypomParams: (obj: any) => obj is KeypomParams;
export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<BN>;
    showModal(): any;
};
