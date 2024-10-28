import { KeyPairString } from "near-api-js/lib/utils";
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
    derivationPath: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountPublicKey: string;
    mpcKey: string;
}
