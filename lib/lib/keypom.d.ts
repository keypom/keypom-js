import { InitKeypomParams, CreateDropParams } from "./types";
export declare const initKeypom: ({ network, funder, }: InitKeypomParams) => Promise<any>;
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: any;
    keyPairs: any[];
} | undefined>;
export declare const getDrops: ({ accountId }: {
    accountId: any;
}) => Promise<any>;
export declare const deleteDrops: ({ drops }: {
    drops: any;
}) => Promise<any[]>;
