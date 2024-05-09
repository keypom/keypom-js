import { accountMappingContract, getEnv, getPubFromSecret } from "@keypom/core";
import { InternalOneClickSpecs } from "../core/types";
import { Action } from "@near-js/transactions";

export const KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";

export const getLocalStorageKeypomEnv = () => {
    const localStorageDataJson = localStorage.getItem(
        `${KEYPOM_LOCAL_STORAGE_KEY}:envData`
    );
    return localStorageDataJson;
};

export const setLocalStorageKeypomEnv = (jsonData) => {
    const dataToWrite = JSON.stringify(jsonData);

    localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`, dataToWrite);
};

/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
export const keyHasPermissionForTransaction = async (
    accessKey,
    receiverId: string,
    actions: Action[]
): Promise<boolean> => {
    console.log("accessKey: ", accessKey);
    const { permission } = accessKey;
    if (permission === "FullAccess") {
        return true;
    }

    if (permission.FunctionCall) {
        const { receiver_id: allowedReceiverId, method_names: allowedMethods } =
            permission.FunctionCall;
        if (allowedReceiverId === receiverId) {
            let allowed = true;

            for (const action of actions) {
                const { functionCall } = action;
                if (
                    !(
                        functionCall &&
                        (!functionCall.deposit ||
                            functionCall.deposit.toString() === "0") && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 ||
                            allowedMethods.includes(functionCall.methodName))
                    )
                ) {
                    allowed = false;
                    break;
                }
            }

            return allowed;
        }
    }

    return false;
};

export const parseOneClickSignInFromUrl = (
    oneClickSpecs: InternalOneClickSpecs
) => {
    const { baseUrl, delimiter, moduleDelimiter } = oneClickSpecs;

    // remove everything after ?cid= in the URL if it's present
    const split = window.location.href.split("?cid=")[0].split(baseUrl!);

    if (split.length !== 2) {
        return;
    }

    const signInInfo = split[1];

    // Get the account ID, secret key, and module ID based on the two delimiters `delimiter` and `moduleDelimiter`
    const regex = new RegExp(`(.*)${delimiter}(.*)${moduleDelimiter}(.*)`);
    const matches = signInInfo.match(regex);
    const accountId = matches?.[1];
    const secretKey = matches?.[2];
    const moduleId = matches?.[3];

    if (!accountId || !secretKey || !moduleId) {
        return;
    }

    return {
        accountId,
        secretKey,
        moduleId,
    };
};
