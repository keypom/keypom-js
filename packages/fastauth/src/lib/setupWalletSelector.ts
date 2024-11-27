// setupWalletSelector.ts

import { setupWalletSelector as baseSetupWalletSelector } from "@near-wallet-selector/core";

import FastAuthWallet from "./FastAuthWallet";

export const setupWalletSelector = async (params) => {
    const { modules = [] } = params;

    const selector = await baseSetupWalletSelector({
        ...params,
        modules: [FastAuthWallet, ...modules],
    });

    return selector;
};
