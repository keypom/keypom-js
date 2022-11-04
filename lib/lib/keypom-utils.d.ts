export const ATTACHED_GAS_FROM_WALLET: 100000000000000;
export function key2str(v: any): any;
export function genKey(rootKey: any, meta: any, nonce: any): Promise<nearAPI.utils.key_pair.KeyPair>;
export function execute({ transactions, account, wallet, fundingAccount, }: {
    transactions: any;
    account: any;
    wallet: any;
    fundingAccount: any;
}): Promise<any>;
export function ftTransferCall({ account, contractId, args, returnTransaction, }: {
    account: any;
    contractId: any;
    args: any;
    returnTransaction?: boolean | undefined;
}): Promise<any> | {
    receiverId: any;
    actions: {
        type: string;
        params: {
            methodName: string;
            args: any;
            gas: string;
            deposit: string;
        };
    }[];
};
export function nftTransferCall({ account, contractId, receiverId, tokenIds, msg, }: {
    account: any;
    contractId: any;
    receiverId: any;
    tokenIds: any;
    msg: any;
}): Promise<any[]>;
export function transformTransactions(transactions: any): any;
export function estimateRequiredDeposit({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage, keyStorage, fcData, ftData, }: {
    near: any;
    depositPerUse: any;
    numKeys: any;
    usesPerKey: any;
    attachedGas: any;
    storage?: string | null | undefined;
    keyStorage?: string | null | undefined;
    fcData: any;
    ftData: any;
}): Promise<any>;
import nearAPI = require("near-api-js");
