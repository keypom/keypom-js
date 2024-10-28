"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupKeypomTrialSelector = void 0;
const wallet_1 = require("./wallet");
const TrialAccountManager_1 = require("../TrialAccountManager");
const Keypom = async ({ store, logger, keypomWallet }) => {
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
        async switchAccount(id) {
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
            const transactions = params.transactions.map((tx) => {
                return {
                    ...tx,
                    signerId: tx.signerId || keypomWallet.getAccountId(),
                };
            });
            logger.log("Keypom:signAndSendTransactions", params);
            return await keypomWallet.signAndSendTransactions({ transactions });
        },
    };
};
function setupKeypomTrialSelector(params) {
    return async () => {
        const { networkId, contractId } = params;
        // Extract the trial account secret key from the URL parameters
        if (typeof window === undefined) {
            console.warn("window is undefined; aborting setup.");
            return null;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const trialAccountSecretKey = urlParams.get("trialKey");
        if (!trialAccountSecretKey) {
            console.warn("Missing trial account secret key in URL; aborting setup.");
            return null;
        }
        // Initialize TrialAccountManager with network information
        const trialManager = new TrialAccountManager_1.TrialAccountManager({
            trialContractId: "1729530318593-trial-contract.testnet",
            mpcContractId: "v1.signer-prod.testnet",
            networkId: networkId,
        });
        // Fetch account ID using the trial manager and store it in memory
        const trialAccountId = await trialManager.getTrialAccountIdForChain(trialAccountSecretKey, "NEAR");
        // contract ID resetting, same with walletUrl
        const keypomWallet = new wallet_1.KeypomTrialSelector({
            networkId,
            trialAccountSecretKey: trialAccountSecretKey,
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
            init: async (config) => Keypom({
                ...config,
                keypomWallet,
            }),
        };
    };
}
exports.setupKeypomTrialSelector = setupKeypomTrialSelector;
