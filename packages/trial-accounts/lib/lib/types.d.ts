import { KeyPairString } from "@near-js/crypto";
import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
/**
 * Constraints on the usage of the trial accounts.
 */
export interface UsageConstraints {
    maxContracts?: number;
    maxMethods?: number;
}
/**
 * Limits on the interactions of the trial accounts.
 */
export interface InteractionLimits {
    maxInteractionsPerDay?: number;
    totalInteractions?: number;
}
/**
 * Condition that defines a successful function call.
 */
export interface FunctionSuccessCondition {
    contractId: string;
    methodName: string;
    expectedReturn: string;
}
/**
 * Conditions under which the trial account will exit.
 */
export interface ExitConditions {
    transactionLimit?: number;
    successCondition?: FunctionSuccessCondition;
    timeLimit?: number;
}
/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    targetContractId: string;
    methodName: string;
    args: any;
    attachedDepositNear: string;
    gas: string;
}
/**
 * Data required to create a trial.
 */
export interface TrialData {
    allowedMethods: string[];
    allowedContracts: string[];
    initialDeposit: string;
    maxGas?: number;
    maxDeposit?: string;
    usageConstraints?: UsageConstraints;
    interactionLimits?: InteractionLimits;
    exitConditions?: ExitConditions;
    expirationTime?: number;
    chainId: number;
}
/**
 * Configuration required to initialize the NEAR connection and other parameters.
 */
export interface Config {
    networkId: string;
    signerAccountId: string;
    keyStore: UnencryptedFileSystemKeyStore;
    mpcContractId: string;
    numberOfKeys: number;
    dataDir: string;
}
/**
 * Key data structure containing information about a trial key.
 */
export interface KeyData {
    publicKey: string;
    secretKey: string;
    trialId: number;
    mpcKey: string;
}
/**
 * Represents a trial key along with its associated account ID and MPC key.
 */
export interface TrialKey {
    trialAccountId: string;
    derivationPath: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountPublicKey: string;
    mpcKey: string;
}
/**
 * Result Type of MPC contract signature request.
 * Representing Affine Points on eliptic curve.
 * Example: {
    "big_r": {
      "affine_point": "031F2CE94AF69DF45EC96D146DB2F6D35B8743FA2E21D2450070C5C339A4CD418B"
    },
    "s": { "scalar": "5AE93A7C4138972B3FE8AEA1638190905C6DB5437BDE7274BEBFA41DDAF7E4F6"
    },
    "recovery_id": 0
  }
 */
export interface MPCSignature {
    big_r: {
        affine_point: string;
    };
    s: {
        scalar: string;
    };
    recovery_id: number;
}
export interface TrialDataFile {
    trialId: string;
    trialContractId: string;
    trialKeys: TrialKey[];
}
