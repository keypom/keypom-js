import * as nearAPI from "near-api-js";
import { Action, Network, NetworkId } from "@near-wallet-selector/core";
import { SUPPORTED_EXT_WALLET_DATA } from "../core/ext_wallets";
import { isOneClickParams, OneClickParams } from "../core/types";
import BN from "bn.js";
import { decode } from "bs58"

import { Transaction as wsTransaction } from "@near-wallet-selector/core";
import { Action as wsAction } from "@near-wallet-selector/core";
import { AddKeyPermission } from "@near-wallet-selector/core";

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
    if (localStorageData === null) return null;
    const localStorageDataJson = JSON.parse(localStorageData);
    const accountId = localStorageDataJson.accountId;

    if (localStorageDataJson.publicKey && localStorageDataJson.secretKey) {
        try {
            const accessKey: any = await near.connection.provider.query(
                `access_key/${accountId}/${localStorageDataJson.publicKey}`,
                ""
            );
            if (accessKey) {
                return localStorageDataJson.secretKey;
            }
        } catch (e) {
            console.log("error retrieving access key: ", e);
        }
    }
    return null;
};

export const setLocalStoragePendingKey = (jsonData) => {
    const dataToWrite = JSON.stringify(jsonData);
    localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:pendingKey`, dataToWrite);
    console.log("done writing");
};

// allowance, methodNames, walletUrl
export const getLocalStorageKeypomLak = () => {
    const localStorageDataJson = localStorage.getItem(
        `${KEYPOM_LOCAL_STORAGE_KEY}:LakData`
    );
    return localStorageDataJson;
};

export const setLocalStorageKeypomLak = (jsonData) => {
    const dataToWrite = JSON.stringify(jsonData);

    localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:LakData`, dataToWrite);
};

// export const areParamsCorrect = (params: OneClickParams) => {
//     const { networkId } = params;

//     // Validate Keypom parameters
//     if (!isOneClickParams(params)) {
//         console.error(
//             "KeypomWallet: Invalid OneClick Params passed in. Please check the docs for the correct format."
//         );
//         return false;
//     }

//     // Additional business logic checks
//     if (!networkId || !urlPattern) {
//         console.error("KeypomWallet: networkId, and url are required.");
//         return false;
//     }

//     if (
//         urlPattern &&
//         !(
//             urlPattern.includes(":accountId") &&
//             urlPattern.includes(":secretKey") &&
//             urlPattern.includes(":walletId")
//         )
//     ) {
//         console.error(
//             "KeypomWallet: Invalid OneClick Params passed in. urlPattern string must contain `:accountId`, `:secretKey`, and `:walletId` placeholders."
//         );
//         return false;
//     }

//     const matches = urlPattern.match(ONE_CLICK_URL_REGEX);
//     if (!matches) {
//         console.error(
//             "KeypomWallet: Invalid OneClick Params passed in. urlPattern is invalid."
//         );
//         return false;
//     }
//     return true;
// };

interface SignInData {
    accountId: string;
    secretKey?: string;
    walletId: string;
    baseUrl: string;
    walletUrl?: string;
    chainId: string;
    addKey: boolean;
}

export const tryGetSignInData = async ({
    networkId,
    nearConnection,
}: {
    networkId: string;
    nearConnection: nearAPI.Near;
}): Promise<SignInData | null> => {
    const connectionSplit = window.location.href.split("?connection=");

    let signInData: SignInData | null = null;
    // There was no connection data so fallback on local storage
    const curEnvData = getLocalStorageKeypomEnv();
    console.log("Local storage env data: ", curEnvData);
    if (curEnvData !== null) {
        signInData = {
            ...JSON.parse(curEnvData),
            baseUrl: connectionSplit[0], // Need to reset baseURL so it doesn't point to outdated data
        };
    }

    // Update signInData with connection data if it exists
    if (connectionSplit.length > 1) {
        let connectionString = connectionSplit[1];
        try {
            // Decode the Base64-encoded JSON string
            const decodedString = Buffer.from(
                connectionString,
                "base64"
            ).toString("utf-8");
            const connectionData = JSON.parse(decodedString);
            console.log("parsed connection data: ", connectionData);

            if (
                connectionData.accountId === undefined ||
                connectionData.walletId === undefined
            ) {
                console.error(
                    "Connection data must include accountId and walletId fields"
                );
                return null;
            }

            // ensure wallet module is supported
            const isModuleSupported =
                SUPPORTED_EXT_WALLET_DATA[networkId]?.[
                    connectionData.walletId
                ] !== undefined;

            if (!isModuleSupported) {
                console.warn(
                    `Module ID ${connectionData.wallet} is not supported on ${networkId}.`
                );
                return null;
            }

            signInData = {
                accountId: connectionData.accountId,
                walletId: connectionData.walletId,
                walletUrl: connectionData.walletTransactionUrl,
                chainId: connectionData.chainId,
                baseUrl: connectionSplit[0],
                secretKey: connectionData.secretKey,
                addKey: true,
            };
        } catch (e) {
            console.error("Error parsing connection data: ", e);
            return null;
        }
    }

    if (!signInData?.accountId || signInData === null) {
        console.log(
            "No connection found in local storage or URL. returning null"
        );
        return null;
    }

    const addKeySplit = window.location.href.split("?addKey=");
    if (addKeySplit.length > 1) {
        const addKeyParam = addKeySplit[1];
        const addKey = addKeyParam !== "false";
        signInData.addKey = addKey;
    }

    const pendingSecretKey = await getLocalStoragePendingKey(nearConnection);
    localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:pendingKey`);
    if (pendingSecretKey) {
        signInData.secretKey = pendingSecretKey;
    }

    return signInData;
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
    let [accountId, secretKey, walletId] =
        credentials.length === 2
            ? [credentials[0], undefined, credentials[1]]
            : credentials;

    // in condition, got rid of || ((credentials.length === 3 && !secretKey))
    if (!accountId || !walletId) {
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

export const baseDecode = (
    value: string
) => {
    return new Uint8Array(decode(value));
}

// : nearAPI.transactions.Transaction[]
// MUST BE USED WITH KEY FOR TXN
export const transformTransactions = async (transactions: wsTransaction[], account: nearAPI.Account) => {
    const { networkId, signer, provider } = account.connection;
    console.log("utils signer: ", signer)

    return Promise.all(
      transactions.map(async (transaction, index) => {
        const actions = transaction.actions.map((action) =>
          createAction(action)
        );
        const accessKey = await account.findAccessKey(
          transaction.receiverId,
          actions,
        );    

        if (!accessKey) {
          throw new Error(
            `Failed to find matching key for transaction sent to ${transaction.receiverId}`
          );
        }

        const block = await provider.block({ finality: "final" });

        return nearAPI.transactions.createTransaction(
          account.accountId,
          nearAPI.utils.PublicKey.from(accessKey.publicKey),
          transaction.receiverId,
          accessKey.accessKey.nonce + BigInt(index) + BigInt(1),
          actions,
          baseDecode(block.header.hash)
        );
      })
    );
    
}

export const createAction = (action: wsAction) => {
  switch (action.type) {
    case "CreateAccount" :
      return nearAPI.transactions.createAccount();
    case "DeployContract": {
      const { code } = action.params;

      return nearAPI.transactions.deployContract(code);
    }
    case "FunctionCall": {
      const { methodName, args, gas, deposit } = action.params;

      return nearAPI.transactions.functionCall(
        methodName,
        args,
        new BN(gas),
        new BN(deposit)
      );
    }
    case "Transfer": {
      const { deposit } = action.params;

      return nearAPI.transactions.transfer(new BN(deposit));
    }
    case "Stake": {
      const { stake, publicKey } = action.params;

      return nearAPI.transactions.stake(new BN(stake), nearAPI.utils.PublicKey.from(publicKey));
    }
    case "AddKey": {
      const { publicKey, accessKey } = action.params;

      return nearAPI.transactions.addKey(
          nearAPI.utils.PublicKey.from(publicKey),
        // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
        getAccessKey(accessKey.permission)
      );
    }
    case "DeleteKey": {
      const { publicKey } = action.params;

      return nearAPI.transactions.deleteKey(nearAPI.utils.PublicKey.from(publicKey));
    }
    case "DeleteAccount": {
      const { beneficiaryId } = action.params

      return nearAPI.transactions.deleteAccount(beneficiaryId);
    }
    default:
      throw new Error("Invalid action type");
  }
};

export const getAccessKey = (permission: AddKeyPermission) => {
  if (permission === "FullAccess") {
    return nearAPI.transactions.fullAccessKey();
  }

  const { receiverId, methodNames = [] } = permission;
  const allowance = permission.allowance
    ? new BN(permission.allowance)
    : undefined;

  return nearAPI.transactions.functionCallAccessKey(receiverId, methodNames, allowance);
};
