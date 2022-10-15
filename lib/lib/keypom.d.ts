import { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
export declare const networks: {
    mainnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
    testnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
};
declare global {
    interface Window {
        near: any;
    }
}
export interface KeypomParams {
    iconUrl?: string;
}
export declare function setupKeypom({ iconUrl, }?: KeypomParams): WalletModuleFactory<InjectedWallet>;
