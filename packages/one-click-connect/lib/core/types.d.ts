import { InstantLinkWallet, NetworkId } from "@near-wallet-selector/core";
import { KeypomWallet } from "./wallet";
export declare const FAILED_EXECUTION_OUTCOME: any;
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
export declare const isOneClickParams: (params: OneClickParams) => boolean;
export type KeypomWalletInstant = InstantLinkWallet & {
    networkId: string;
    getContractId(): string;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<bigint>;
    showModal(): any;
};
