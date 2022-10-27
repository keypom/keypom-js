export const ATTACHED_GAS_FROM_WALLET: 100000000000000;
export function key2str(v: any): any;
export function genKey(rootKey: any, meta: any, nonce: any): Promise<KeyPair>;
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
import { KeyPair } from "near-api-js/lib/common-index";
