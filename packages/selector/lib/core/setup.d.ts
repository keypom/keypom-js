import type { WalletModuleFactory } from '@near-wallet-selector/core';
import { KeypomParams, KeypomWalletInstant } from './types';
export declare function setupKeypom({ deprecated, trialAccountSpecs, instantSignInSpecs, networkId, signInContractId, modalOptions }: KeypomParams): WalletModuleFactory<KeypomWalletInstant>;
