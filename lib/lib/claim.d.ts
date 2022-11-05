import { CreateDropParams } from "./types";
export declare const createDrop: ({ account, wallet, accountRootKey, dropId, publicKeys, numKeys, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, fcData, }: CreateDropParams) => Promise<{
    responses: any;
    keyPairs: any[];
}>;
