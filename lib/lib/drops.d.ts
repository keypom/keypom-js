import { CreateDropParams } from "./types";
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: any;
    keyPairs: any[];
}>;
export declare const getDrops: ({ accountId }: {
    accountId: any;
}) => Promise<any>;
export declare const deleteDrops: ({ account, wallet, drops, withdrawBalance, }: {
    account: any;
    wallet: any;
    drops: any;
    withdrawBalance?: boolean | undefined;
}) => Promise<any[]>;
