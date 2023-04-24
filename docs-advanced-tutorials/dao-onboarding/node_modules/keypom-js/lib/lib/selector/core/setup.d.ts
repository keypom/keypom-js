import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomParams, KeypomWalletInstant } from "./types";
export declare function setupKeypom({ delimiter, deprecated, desiredUrl, networkId, signInContractId, modalOptions }: KeypomParams): WalletModuleFactory<KeypomWalletInstant>;
