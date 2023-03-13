import { SelectorInit } from "./types";

export const initKeypomWallet: SelectorInit = async (config) => {
	const { store, logger, emitter, options, keypomWallet } = config;
	console.log("I AM INITTING KEYPOM?????");

	// return the wallet interface for wallet-selector
	return {
		get networkId() {
			return keypomWallet.networkId;
		},

		// async getAccount() {
		// 	return keypomWallet.getAccount();
		// },

		async getAccounts() {
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
			return await keypomWallet.isSignedIn();
		},

		async getAvailableBalance() {
			logger.log("Keypom:isSignedIn");
			return await keypomWallet.getAvailableBalance();
		},

		async verifyOwner() {
			throw Error(
			  "KeypomWallet:verifyOwner is deprecated"
			);
		  },
		
		async signIn(data) {
			logger.log("Keypom:signIn");
			return await keypomWallet.signIn({contractId: data.contractId, methodNames: data.methodNames});
		},

		async signOut() {
			logger.log("Keypom:signOut");
			return await keypomWallet.signOut();
		},

		async signAndSendTransaction(params) {
			return await keypomWallet.signAndSendTransaction(params);
		},

		async signAndSendTransactions(params) {
			console.log('params top level: ', params)
			return await keypomWallet.signAndSendTransactions(params);
		},
	};
};	
