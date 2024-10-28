import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomWalletInstant, OneClickParams } from "./types";
export declare function setupKeypomTrialSelector(params: OneClickParams): WalletModuleFactory<KeypomWalletInstant>;
