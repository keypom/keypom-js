import { Account, Near } from "near-api-js";
import { FCData } from "./types/fc";
import BN from 'bn.js';
import { getEnv } from "./keypom";
import { Funder } from "./types/general";

export function isValidAccountObj(o: Account | undefined): o is Account {
    if (o) {
        return (o as Account).connection !== undefined && (o as Account).accountId !== undefined;
    }

    return true
}

export function isValidNearObject(o: Near): o is Near {
    return (o as Near).connection !== undefined && (o as Near).config !== undefined && (o as Near).accountCreator !== undefined;
}

export function isValidFunderObject(o: Funder): o is Funder {
    return (o as Funder).accountId !== undefined && (o as Funder).secretKey !== undefined;
}

export const assert = (exp, m) => {
    if (!exp) {
        throw new Error(m);
    }
}

export const assertValidDropConfig = (config: {
    uses_per_key?: number,
    time?: {
        start?: number,
        end?: number,
        throttle?: number,
        interval?: number,
    },
    usage?: {
        permission?: string,
        refund_deposit?: boolean,
        auto_delete_drop?: boolean,
        auto_withdraw?: boolean
    },
    root_account_id?: string,
}) => {
    assert((config?.uses_per_key || 1) != 0, "Cannot have 0 uses per key for a drop config");

    if (config?.usage?.permission) {
        assert(config.usage.permission == "create_account_and_claim" || config.usage.permission == "claim", "Invalid permission type for usage. Must be 'create_account_and_claim' or 'claim'");
    }

    if (config?.time) {
        const currentBlockTimestamp = Date.now() * 1e6;

        assert(
            (config.time.interval != undefined && config.time.start != undefined) == false,
            "If you want to set a claim interval, you must also set a start timestamp"
        );
        assert(
            (config.time.start || currentBlockTimestamp) >= currentBlockTimestamp,
            "The start timestamp must be greater than the current block timestamp"
        );
        assert!(
            (config.time.end || currentBlockTimestamp) >= currentBlockTimestamp,
            "The end timestamp must be greater than the current block timestamp"
        );

        if (config.time.start != undefined && config.time.end != undefined) {
            assert(
                config.time.start < config.time.end,
                "The start timestamp must be less than the end timestamp"
            );
        }
    }
}

export const assertValidFCData = (fcData: FCData | undefined, depositPerUse: string, usesPerKey: number) => {
    if (fcData?.config?.attachedGas) {
        assert(depositPerUse == "0", "Cannot specify gas to attach and have a balance in the linkdrop")
        assert(new BN(fcData.config.attachedGas).lte(new BN("80000000000000")), "Cannot have 0 attached gas");
    }

    if (fcData?.methods) {
        const numMethodData = fcData.methods.length;

        if (usesPerKey == 1) {
            assert(numMethodData == 1, "Cannot have more Method Data than the number of uses per key");
        }
        else if (usesPerKey > 1) {
            assert(numMethodData == usesPerKey, "Number of FCs must match number of uses per key if more than 1 is specified");
        }

        if (usesPerKey > 1 && numMethodData == 1) {
            assert(fcData.methods[0] != undefined, "cannot have a single none function call");
        }
    }
}

export const assertDropIdUnique = async (dropId: string) => {
    const {
		viewAccount, contractId
	} = getEnv()

    try {
        const dropInfo = await viewAccount.viewFunction2({
            contractId,
            methodName: 'get_drop_information',
            args: {
                drop_id: dropId
            }
        })
        assert(!dropInfo, `Drop with ID ${dropId} already exists. Please use a different drop ID.`);
    } catch(_) {}
}