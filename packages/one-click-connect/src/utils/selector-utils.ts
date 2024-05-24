import * as nearAPI from "near-api-js";
import { Action, Network, NetworkId } from "@near-wallet-selector/core";
import { SUPPORTED_EXT_WALLET_DATA } from "../core/ext_wallets";
import { isOneClickParams, OneClickParams } from "../core/types";

export const ONE_CLICK_URL_REGEX = new RegExp(
    `^(.*):accountId(.+):secretKey(.+):walletId(.*)$`
);
export const KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";
export const NO_CONTRACT_ID = "no-contract";

export interface KeypomWalletAccount {
    accountId: string;
    walletId: string;
    publicKey?: string;
}

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

export const getLocalStoragePendingKey = async (near: nearAPI.Near) => {
    const localStorageData = localStorage.getItem(
        `${KEYPOM_LOCAL_STORAGE_KEY}:pendingKey`
    );
    if(localStorageData === null) return null
    const localStorageDataJson = JSON.parse(localStorageData);
    const accountId = localStorageDataJson.accountId;

    if(localStorageDataJson.publicKey && localStorageDataJson.secretKey){
        try{
            const accessKey: any = await near.connection.provider.query(
                `access_key/${accountId}/${localStorageDataJson.publicKey}`,
                ""
            );
            if(accessKey){
                return localStorageDataJson.secretKey;
            }
        }catch(e){
            console.log("error: ", e)
        }   
    }
    return null;
};


export const setLocalStoragePendingKey = (jsonData) => {
    const dataToWrite = JSON.stringify(jsonData);
    localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:pendingKey`, dataToWrite);
    console.log("done writing")
}

export const areParamsCorrect = (params: OneClickParams) => {
    const { urlPattern, networkId } = params;

    // Validate Keypom parameters
    if (!isOneClickParams(params)) {
        console.error(
            "KeypomWallet: Invalid OneClick Params passed in. Please check the docs for the correct format."
        );
        return false;
    }

    // Additional business logic checks
    if (!networkId || !urlPattern) {
        console.error("KeypomWallet: networkId, and url are required.");
        return false;
    }

    if (
        urlPattern &&
        !(
            urlPattern.includes(":accountId") &&
            urlPattern.includes(":secretKey") &&
            urlPattern.includes(":walletId")
        )
    ) {
        console.error(
            "KeypomWallet: Invalid OneClick Params passed in. urlPattern string must contain `:accountId`, `:secretKey`, and `:walletId` placeholders."
        );
        return false;
    }

    const matches = urlPattern.match(ONE_CLICK_URL_REGEX);
    if (!matches) {
        console.error(
            "KeypomWallet: Invalid OneClick Params passed in. urlPattern is invalid."
        );
        return false;
    }
    return true;
};

export const tryGetAccountData = ({
    urlPattern,
    networkId,
    nearConnection,
}: {
    urlPattern: string;
    networkId: string;
    nearConnection: nearAPI.Near;
}): {
    accountId: string;
    secretKey?: string;
    walletId: string;
    baseUrl: string;
} | null => {
    const matches = urlPattern.match(ONE_CLICK_URL_REGEX)!; // Safe since we check the same URL before;

    const baseUrl = matches[1];
    const delimiter = matches[2];

    // Try to sign in using one click sign-in data from URL
    const oneClickSignInData =
        baseUrl !== undefined
            ? parseOneClickSignInFromUrl({ baseUrl, delimiter })
            : null;

    if (oneClickSignInData !== null) {
        const isModuleSupported =
            SUPPORTED_EXT_WALLET_DATA[networkId]?.[
                oneClickSignInData.walletId
            ] !== undefined;

        if (!isModuleSupported) {
            console.warn(
                `Module ID ${oneClickSignInData.walletId} is not supported on ${networkId}.`
            );
            return null;
        }

        return oneClickSignInData;
    }

     // Try to sign in using data from local storage if URL does not contain valid one click sign-in data
     const curEnvData = getLocalStorageKeypomEnv();
     const secretKey = getLocalStoragePendingKey(nearConnection);

     localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:pendingKey`)

     if (curEnvData !== null) {
         let parsedJson = JSON.parse(curEnvData);
         if (secretKey !== null) {
             parsedJson.secretKey = secretKey;
         }
         return parsedJson;
     }

    return null;
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
                if (
                    !(
                        action.type === "FunctionCall" &&
                        (!action.params.deposit ||
                            action.params.deposit.toString() === "0") && // TODO: Should support charging amount smaller than allowance?
                        (allowedMethods.length === 0 ||
                            allowedMethods.includes(action.params.methodName))
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

export const parseOneClickSignInFromUrl = ({
    baseUrl,
    delimiter,
}: {
    baseUrl: string;
    delimiter: string;
}): {
    accountId: string;
    secretKey?: string;
    walletId: string;
    baseUrl: string;
} | null => {
    let urlToCheck = window.location.href;
    // Split the URL to get the part after baseUrl (i.e: `#instant-url/`)
    let parts = urlToCheck.split(baseUrl);
    if (parts.length < 2 || !parts[1]) {
        console.error("URL does not contain the expected pattern.");
        return null;
    }

    // Further split to separate accountId, secretKey, and walletId
    const credentials = parts[1].split(delimiter);
    // secret key may be missing --> originall had || credentials.length > 4 there as well
    if (credentials.length !== 2 && credentials.length !== 3) {
        console.error(
            "URL is malformed or does not contain all required parameters (accountId, walletId)."
        );
        return null;
    }
    // set accountId, walletId always, and secretKey if present
    let [accountId, secretKey, walletId] = credentials.length === 2 
    ? [credentials[0], undefined, credentials[1]] 
    : credentials;

    // in condition, got rid of || ((credentials.length === 3 && !secretKey))
    if (!accountId || !walletId ) {
        console.error("Invalid or incomplete authentication data in URL.");
        return null;
    }
    
    return {
        accountId,
        secretKey: credentials.length === 3 ? secretKey : undefined,
        walletId,
        baseUrl,
    };
};

export const getNetworkPreset = (networkId: NetworkId): Network => {
    switch (networkId) {
        case "mainnet":
            return {
                networkId,
                nodeUrl: "https://rpc.mainnet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                explorerUrl: "https://nearblocks.io",
                indexerUrl: "https://api.kitwallet.app",
            };
        case "testnet":
            return {
                networkId,
                nodeUrl: "https://rpc.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://testnet.nearblocks.io",
                indexerUrl: "https://testnet-api.kitwallet.app",
            };
        default:
            throw Error(`Failed to find config for: '${networkId}'`);
    }
};

export const getPubFromSecret = (secretKey: string): string => {
    const keyPair = nearAPI.KeyPair.fromString(secretKey);
    return keyPair.getPublicKey().toString();
};
