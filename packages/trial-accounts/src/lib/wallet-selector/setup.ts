import type {
    NetworkId,
    Transaction,
    WalletBehaviourFactory,
    WalletModuleFactory,
} from "@near-wallet-selector/core";
import { KeypomTrialSelector } from "./wallet";
import { KeypomWalletInstant, OneClickParams } from "./types";
import { TrialAccountManager } from "../TrialAccountManager";
import { KeyPairString } from "near-api-js/lib/utils";

interface KeypomInitializeOptions {
    keypomWallet: KeypomTrialSelector;
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

        getAccounts() {
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
            return keypomWallet.isSignedIn();
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
        const { networkId, contractId } = params;

        // Extract the trial account secret key from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const trialAccountSecretKey = urlParams.get("trialKey");

        if (!trialAccountSecretKey) {
            console.warn(
                "Missing trial account secret key in URL; aborting setup."
            );
            return null;
        }

        // Initialize TrialAccountManager with network information
        const trialManager = new TrialAccountManager({
            trialContractId: "1729530318593-trial-contract.testnet",
            mpcContractId: "v1.signer-prod.testnet",
            networkId: networkId as NetworkId,
        });

        // Fetch account ID using the trial manager and store it in memory
        const trialAccountId = await trialManager.getTrialAccountIdForChain(
            trialAccountSecretKey as KeyPairString,
            "NEAR"
        );
        // contract ID resetting, same with walletUrl
        const keypomWallet = new KeypomTrialSelector({
            networkId,
            trialAccountSecretKey: trialAccountSecretKey as KeyPairString,
            trialAccountId,
        });

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
