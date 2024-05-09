import type {
    Transaction,
    WalletBehaviourFactory,
    WalletModuleFactory,
} from "@near-wallet-selector/core";
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
            return keypomWallet.near.connection.networkId;
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
        const { url, networkId, signInContractId } = params;

        // Validate Keypom parameters
        if (!isOneClickParams(params)) {
            console.error(
                "KeypomWallet: Invalid OneClick Params passed in. Please check the docs for the correct format."
            );
            return null;
        }

        // Additional business logic checks
        if (!signInContractId || !networkId || !url) {
            console.warn(
                "KeypomWallet: signInContractId, networkId, and url are required."
            );
            return null;
        }

        if (
            url &&
            !(
                url.includes("ACCOUNT_ID") ||
                url.includes("SECRET_KEY") ||
                url.includes("WALLET_ID")
            )
        ) {
            console.error(
                "KeypomWallet: Invalid OneClick Params passed in. Url string must contain `ACCOUNT_ID`, `SECRET_KEY`, and `WALLET_ID`"
            );
            return null;
        }

        const keypomWallet = new KeypomWallet({
            signInContractId,
            networkId,
            url,
        });

        // CHECK URL / LOCAL STORAGE TO SEE IF A ONE CLICK ACCOUNT SHOULD BE SIGNED IN
        const shouldSignIn = keypomWallet.checkValidOneClickParams();
        console.log("shouldSignIn: ", shouldSignIn);

        return {
            id: "keypom",
            type: "instant-link",
            metadata: {
                name: "Keypom Account",
                description: null,
                iconUrl: "",
                deprecated: false,
                available: true,
                contractId: signInContractId,
                runOnStartup: shouldSignIn,
            },
            init: async (config) =>
                Keypom({
                    ...config,
                    keypomWallet,
                }),
        };
    };
}
