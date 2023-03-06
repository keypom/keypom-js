import { Account, Near } from "near-api-js";
import { FCData } from "./types/fc";
import BN from 'bn.js';
import { getEnv, officialKeypomContracts } from "./keypom";
import { Funder } from "./types/general";
import { ProtocolReturnedDropConfig } from "./types/protocol";

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

export const assertValidDropConfig = (config?: ProtocolReturnedDropConfig) => {
    assert((config?.uses_per_key || 1) != 0, "Cannot have 0 uses per key for a drop config");

    if (config?.usage?.permissions) {
        assert(config.usage.permissions == "create_account_and_claim" || config.usage.permissions == "claim", "Invalid permission type for usage. Must be 'create_account_and_claim' or 'claim'");
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
    const { networkId } = getEnv();
    if (fcData?.methods) {
        const numMethodData = fcData.methods.length;

        if (usesPerKey == 1) {
            assert(numMethodData == 1, "Cannot have more Method Data than the number of uses per key");
        }
        else if (numMethodData > 1) {
            assert(numMethodData == usesPerKey, "Number of FCs must match number of uses per key if more than 1 is specified");
        }

        if (usesPerKey > 1 && numMethodData == 1) {
            assert(fcData.methods[0] != undefined, "cannot have a single none function call");
        }

        for (let i = 0; i < numMethodData; i++) {
            const methodsPerUse = fcData.methods[i];
            // Loop through each method in the methods per use
            if (methodsPerUse) {
                for (let j = 0; j < methodsPerUse.length; j++) {
                    const methodData = methodsPerUse[j];
                    if (methodData) {
                        assert(methodData.methodName != undefined, "Must specify a method name");
                        assert(methodData.args != undefined, "Must specify arguments for method");
                        assert(typeof methodData.args == "string", "Arguments must be a string. If you want to pass a JSON object, stringify it first.");
                        assert(methodData.receiverId != undefined, "Must specify arguments for method");
                        assert(officialKeypomContracts[networkId!][methodData.receiverId] == undefined, "Cannot have a keypom contract as the receiver");
                    }
                }
            }
        }
    }
}

export const assertDropIdUnique = async (dropId: string) => {
    const {
		viewCall, contractId
	} = getEnv()

    try {
        const dropInfo = await viewCall({
            contractId,
            methodName: 'get_drop_information',
            args: {
                drop_id: dropId
            }
        })
        assert(!dropInfo, `Drop with ID ${dropId} already exists. Please use a different drop ID.`);
    } catch(_) {}
}