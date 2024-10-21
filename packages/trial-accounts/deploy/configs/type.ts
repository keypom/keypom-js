import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";

/**
 * Configuration required to initialize the NEAR connection and other parameters.
 */
export interface Config {
    trialContractId: string;
    networkId: string;
    signerAccountId: string;
    keyStore: UnencryptedFileSystemKeyStore;
    mpcContractId: string;
    numberOfKeys: number;
    dataDir: string;
}
