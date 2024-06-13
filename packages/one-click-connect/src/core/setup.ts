import * as nearAPI from "near-api-js";
import type {
    Transaction,
    WalletBehaviourFactory,
    WalletModuleFactory,
} from "@near-wallet-selector/core";
import {
    getLocalStorageKeypomLak,
    getNetworkPreset,
    setLocalStorageKeypomLak,
    tryGetSignInData,
} from "../utils/selector-utils";
import { KeypomWalletInstant, isOneClickParams, OneClickParams } from "./types";
import { KeypomWallet } from "./wallet";

interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet;
}

const Keypom: WalletBehaviourFactory<
    KeypomWalletInstant,
    KeypomInitializeOptions
> = async ({ store, logger, keypomWallet }) => {
    // return the wallet interface for wallet-selector
    return {
        get networkId() {
            return keypomWallet.networkId;
        },
        getContractId() {
            return keypomWallet.getContractId();
        },

        // async getAccount() {
        // 	return keypomWallet.getAccount();
        // },

        showModal() {
            return;
        },

        async getAccounts() {
            logger.log("Keypom:account");
            return keypomWallet.getAccounts();
        },

        async switchAccount(id: string) {
            return await keypomWallet.switchAccount(id);
        },

        getAccountId() {
            logger.log("Keypom:getAccountId");
            return keypomWallet.getAccountId();
        },

        async isSignedIn() {
            logger.log("Keypom:isSignedIn");
            return await keypomWallet.isSignedIn();
        },

        async getAvailableBalance() {
            logger.log("Keypom:isSignedIn");
            return await keypomWallet.getAvailableBalance();
        },

        async verifyOwner() {
            throw Error("KeypomWallet:verifyOwner is deprecated");
        },

        async signIn() {
            logger.log("Keypom:signIn");
            return await keypomWallet.signIn();
        },

        async signOut() {
            logger.log("Keypom:signOut");
            return await keypomWallet.signOut();
        },

        async signAndSendTransaction(params) {
            return await keypomWallet.signAndSendTransaction(params);
        },

        async signAndSendTransactions(params) {
            // Convert the params to Array<Transaction>

            const transactions: Transaction[] = params.transactions.map(
                (tx) => {
                    return {
                        ...tx,
                        signerId: tx.signerId || keypomWallet.getAccountId(),
                    };
                }
            );

            logger.log("Keypom:signAndSendTransactions", params);
            return await keypomWallet.signAndSendTransactions({ transactions });
        },
    };
};

export function setupOneClickConnect(
    params: OneClickParams
): WalletModuleFactory<KeypomWalletInstant> {
    return async () => {
        const { networkId, contractId, allowance, methodNames } = params;

        console.log("this is real, here is my allowance: ", allowance);

        // if (!areParamsCorrect(params)) {
        //     return null;
        // }

        const { connect, keyStores } = nearAPI;
        const networkPreset = getNetworkPreset(networkId);
        let keyStore = new keyStores.BrowserLocalStorageKeyStore();
        const connectionConfig = {
            networkId,
            keyStore,
            nodeUrl: networkPreset.nodeUrl,
            headers: {},
        };
        const nearConnection = await connect(connectionConfig);

        // returns { accountId, secretKey?, walletId, baseUrl }
        // should return { accountId, secretKey?, walletId, baseUrl, walletUrl?, chainId, addKey }
        const signInData = await tryGetSignInData({
            networkId,
            nearConnection,
        });
        console.log("Sign in data: ", signInData);

        if (signInData === null) {
            return null;
        }

        // contract ID resetting, same with walletUrl
        const keypomWallet = new KeypomWallet({
            networkId,
            nearConnection,
            keyStore,
            accountId: signInData.accountId,
            secretKey: signInData.secretKey,
            walletId: signInData.walletId,
            baseUrl: signInData.baseUrl,
            walletUrl: signInData.walletUrl,
            contractId,
            methodNames,
            allowance,
            chainId: signInData.chainId,
            addKey: signInData.addKey,
        });

        console.log("current keypom wallet: ", keypomWallet);

        await keypomWallet.setContractId(contractId);

        return {
            id: "keypom",
            type: "instant-link",
            metadata: {
                name: "Keypom Account",
                description: null,
                iconUrl: "",
                deprecated: false,
                available: true,
                contractId,
                runOnStartup: true,
            },
            init: async (config) =>
                Keypom({
                    ...config,
                    keypomWallet,
                }),
        };
    };
}
