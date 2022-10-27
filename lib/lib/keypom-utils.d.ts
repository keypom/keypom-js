export const ATTACHED_GAS_FROM_WALLET: 100000000000000;
export function key2str(v: any): any;
export function genKey(rootKey: any, meta: any, nonce: any): Promise<nearAPI.utils.key_pair.KeyPair>;
export function execute({ transactions, account, wallet, fundingAccount, }: {
    transactions: any;
    account: any;
    wallet: any;
    fundingAccount: any;
}): Promise<any>;
export function transformTransactions(transactions: any): any;
export function estimateRequiredDeposit({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage, keyStorage, fcData, ftData, }: {
    near: any;
    depositPerUse: any;
    numKeys: any;
    usesPerKey: any;
    attachedGas: any;
    storage?: string | null | undefined;
    keyStorage?: string | null | undefined;
    fcData?: null | undefined;
    ftData?: null | undefined;
}): Promise<any>;
import nearAPI = require("near-api-js");
