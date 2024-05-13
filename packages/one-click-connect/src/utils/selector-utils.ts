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
        console.log("allowedReceiverId: ", allowedReceiverId);
        if (allowedReceiverId === receiverId) {
            let allowed = true;

            for (const action of actions) {
                const { functionCall } = action;
                console.log("functionCall: ", functionCall);
                if (
                    !(
                        functionCall &&
                        (!functionCall.deposit ||
                            functionCall.deposit.toString() === "0") && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 ||
                            allowedMethods.includes(functionCall.methodName))
                    )
                ) {
                    console.log("action not allowed: ", action);
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
): { accountId: string; secretKey: string; walletId: string } | null => {
    const { baseUrl, delimiter, walletDelimiter } = oneClickSpecs;

    let urlToCheck = window.location.href;
    // Split the URL to get the part after baseUrl (i.e: `#instant-url/`)
    let parts = urlToCheck.split(baseUrl);
    if (parts.length < 2 || !parts[1]) {
        console.error("URL does not contain the expected pattern.");
        return null;
    }

    // Further split to separate accountId, secretKey, and walletId
    const credentials = parts[1].split(delimiter);
    if (credentials.length !== 3) {
        console.error(
            "URL does not contain all required parameters (accountId, secretKey, walletId)."
        );
        return null;
    }
    const [accountId, secretKey, walletId] = credentials;

    // Ensure none of the parameters are empty
    if (!accountId || !secretKey || !walletId) {
        console.error("Invalid or incomplete authentication data in URL.");
        return null;
    }

    return {
        accountId,
        secretKey,
        walletId,
    };
};
