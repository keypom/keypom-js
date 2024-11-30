import { WalletSelectorParams } from "@near-wallet-selector/core";
interface FastAuthWalletParams extends WalletSelectorParams {
    localTesting?: boolean;
}
export declare const setupWalletSelector: (params: FastAuthWalletParams) => Promise<import("@near-wallet-selector/core").WalletSelector>;
export {};
