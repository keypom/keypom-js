import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomParams, KeypomWalletInstant } from "./types";
export declare function setupKeypom({ trialSplitDelim, deprecated, trialBaseUrl, networkId, signInContractId, modalOptions }: KeypomParams): WalletModuleFactory<KeypomWalletInstant>;
