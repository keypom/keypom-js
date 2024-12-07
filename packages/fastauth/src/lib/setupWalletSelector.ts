// setupWalletSelector.ts

import {
    setupWalletSelector as baseSetupWalletSelector,
    WalletModuleFactory,
    WalletSelectorParams,
} from "@near-wallet-selector/core";

import FastAuthWallet from "./FastAuthWallet";

interface FastAuthWalletParams extends WalletSelectorParams {
    localTesting?: boolean;
}

export const setupWalletSelector = async (params: FastAuthWalletParams) => {
    const { modules = [], localTesting } = params;

    // Create a wrapped version of FastAuthWallet that includes localTesting
    const fastAuthModuleFactory: WalletModuleFactory = async (
        walletOptions
    ) => {
        return FastAuthWallet({
            ...walletOptions,
            localTesting, // Pass the localTesting flag here
        });
    };

    // Initialize the wallet selector with the wrapped FastAuthWallet
    const selector = await baseSetupWalletSelector({
        ...params,
        modules: [fastAuthModuleFactory, ...modules],
    });

    return selector;
};
