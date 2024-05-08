import type { WalletModuleFactory } from "@near-wallet-selector/core";
import { KeypomParams, KeypomWalletInstant } from "./types";
export declare function setupKeypom({ trialAccountSpecs, instantSignInSpecs, networkId, signInContractId, }: KeypomParams): WalletModuleFactory<KeypomWalletInstant>;
