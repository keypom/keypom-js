// setupWalletSelector.ts

import { setupWalletSelector as baseSetupWalletSelector } from "@near-wallet-selector/core";
import FastAuthWallet from "./FastAuthWallet";
// Import other wallet modules as needed
// import { setupNearWallet } from "@near-wallet-selector/near-wallet";
// import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

export const setupWalletSelector = async (params) => {
    const { modules = [] } = params;

    const fastAuthWallet = FastAuthWallet({ options: params });

    const selector = await baseSetupWalletSelector({
        ...params,
        modules: [fastAuthWallet, ...modules],
    });

    return selector;
};
