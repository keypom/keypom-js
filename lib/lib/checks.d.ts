import { Account, Near } from "near-api-js";
import { FCData } from "./types/fc";
import { Funder } from "./types/general";
export declare function isValidAccountObj(o: Account | undefined): o is Account;
export declare function isValidNearObject(o: Near): o is Near;
export declare function isValidFunderObject(o: Funder): o is Funder;
export declare const assert: (exp: any, m: any) => void;
export declare const assertValidDropConfig: (config: {
    uses_per_key?: number;
    time?: {
        start?: number;
        end?: number;
        throttle?: number;
        interval?: number;
    };
    usage?: {
        permission?: string;
        refund_deposit?: boolean;
        auto_delete_drop?: boolean;
        auto_withdraw?: boolean;
    };
    root_account_id?: string;
}) => void;
export declare const assertValidFCData: (fcData: FCData | undefined, depositPerUse: string, usesPerKey: number) => void;
export declare const assertDropIdUnique: (dropId: string) => Promise<void>;
