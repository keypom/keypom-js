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
        const { urlPattern, networkId } = params;

        // Validate Keypom parameters
        if (!isOneClickParams(params)) {
            console.error(
                "KeypomWallet: Invalid OneClick Params passed in. Please check the docs for the correct format."
            );
            return null;
        }

        // Additional business logic checks
        if (!networkId || !urlPattern) {
            console.warn("KeypomWallet: networkId, and url are required.");
            return null;
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
            return null;
        }

        const keypomWallet = new KeypomWallet({
            networkId,
            urlPattern,
        });

        // CHECK URL / LOCAL STORAGE TO SEE IF A ONE CLICK ACCOUNT SHOULD BE SIGNED IN
        const signInData = keypomWallet.checkValidOneClickParams();
        console.log("signInData: ", signInData);

        let contractId = "foo.near";
        if (signInData !== null) {
            const { secretKey, accountId } = signInData;
            contractId = await keypomWallet.getLAKContractId(
                accountId,
                secretKey
            );
        }

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
                runOnStartup: signInData !== null,
            },
            init: async (config) =>
                Keypom({
                    ...config,
                    keypomWallet,
                }),
        };
    };
}
