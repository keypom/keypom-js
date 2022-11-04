import { InitKeypomParams, CreateDropParams } from "./types";
export declare const getEnv: () => {
    near: any;
    connection: any;
    keyStore: any;
    logger: any;
    networkId: any;
    fundingAccount: any;
    contractAccount: any;
    viewAccount: any;
    fundingKey: any;
};
export declare const execute: (args: any) => Promise<any>;
export declare const initKeypom: ({ network, funder, }: InitKeypomParams) => Promise<any>;
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: any;
    keyPairs: any[];
}>;
export declare const addKeys: ({ account, wallet, drop, publicKeys, nftTokenIds, }: {
    account: any;
    wallet: any;
    drop: any;
    publicKeys: any;
    nftTokenIds: any;
}) => Promise<any>;
export declare const getDrops: ({ accountId }: {
    accountId: any;
}) => Promise<any>;
export declare const deleteKeys: ({ account, wallet, drop, keys }: {
    account: any;
    wallet: any;
    drop: any;
    keys: any;
}) => Promise<any>;
export declare const deleteDrops: ({ account, wallet, drops, withdrawBalance, }: {
    account: any;
    wallet: any;
    drops: any;
    withdrawBalance?: boolean | undefined;
}) => Promise<any[]>;
export declare const claim: ({ secretKey, accountId, newAccountId, newPublicKey, }: {
    secretKey: any;
    accountId: any;
    newAccountId: any;
    newPublicKey: any;
}) => Promise<any>;
