import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomWalletInstant, OneClickParams } from "./types";
export declare function setupOneClickConnect(params: OneClickParams): WalletModuleFactory<KeypomWalletInstant>;
