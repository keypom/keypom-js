import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomParams, KeypomWalletInstant } from "./types";
export declare function setupKeypom({ iconUrl, delimiter, deprecated, desiredUrl, networkId, contractId, modalOptions }: KeypomParams): WalletModuleFactory<KeypomWalletInstant>;
