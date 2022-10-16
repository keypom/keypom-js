import { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
declare global {
    interface Window {
        near: any;
    }
}
export interface KeypomParams {
    iconUrl?: string;
}
export declare function setupKeypom({ iconUrl, }?: KeypomParams): WalletModuleFactory<InjectedWallet>;
