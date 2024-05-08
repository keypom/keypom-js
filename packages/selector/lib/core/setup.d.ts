import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomParams, KeypomWalletInstant } from "./types";
export declare function setupKeypom(params: KeypomParams): WalletModuleFactory<KeypomWalletInstant> | null;
