import { InitKeypomParams, CreateDropParams } from "./types";
export declare const initKeypom: ({ network, funder, }: InitKeypomParams) => Promise<any>;
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: any;
    keyPairs: any[];
}>;
export declare const addKeys: ({ account, wallet, drop, publicKeys }: {
    account: any;
    wallet: any;
    drop: any;
    publicKeys: any;
}) => Promise<any>;
export declare const getDrops: ({ accountId }: {
    accountId: any;
}) => Promise<any>;
export declare const claim: ({ secretKey, accountId, }: {
    secretKey: any;
    accountId: any;
}) => Promise<any>;
export declare const createAccountAndClaim: ({ newAccountId, newPublicKey, secretKey, }: {
    newAccountId: any;
    newPublicKey: any;
    secretKey: any;
}) => Promise<any>;
export declare const deleteKeys: ({ account, wallet, drop, keys }: {
    account: any;
    wallet: any;
    drop: any;
    keys: any;
}) => Promise<any>;
export declare const deleteDrops: ({ account, wallet, drops }: {
    account: any;
    wallet: any;
    drops: any;
}) => Promise<any[]>;
