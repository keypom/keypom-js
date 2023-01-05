import { CreateDropParams } from "./types";
export declare const createDrop: ({ account, wallet, dropId, publicKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, simpleData, fcData, hasBalance, }: CreateDropParams) => Promise<{
    responses: any;
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
