import { InitKeypomParams, CreateDropParams } from "./types";
export declare const initKeypom: ({ network, funder, }: InitKeypomParams) => Promise<any>;
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: void;
    keyPairs: any[];
} | {
    responses: any[];
    keyPairs: any[];
}>;
export declare const addKeys: ({ account, wallet, dropId, publicKeys }: {
    account: any;
    wallet: any;
    dropId: any;
    publicKeys: any;
}) => Promise<any>;
export declare const getDrops: ({ accountId }: {
    accountId: any;
}) => Promise<any>;
export declare const deleteDrops: ({ drops }: {
    drops: any;
}) => Promise<any[]>;
