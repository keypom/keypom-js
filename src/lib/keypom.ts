import {
	WalletModuleFactory,
	InjectedWallet,
	Action,
	FunctionCallAction,
	WalletBehaviourFactory,
	waitFor,
} from "@near-wallet-selector/core";

import { initConnection, getAccount, signIn, signOut, signAndSendTransactions } from './keypom-lib' 
import { nearWalletIcon } from "../assets/icons";

export const networks = {
	mainnet: {
		networkId: 'mainnet',
		nodeUrl: 'https://rpc.mainnet.near.org',
		walletUrl: 'https://wallet.near.org',
		helperUrl: 'https://helper.mainnet.near.org'
	},
	testnet: {
		networkId: 'testnet',
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org'
	}
}

declare global {
	interface Window {
		near: any,
	}
}

export interface KeypomParams {
	iconUrl?: string;
}

const Keypom: WalletBehaviourFactory<InjectedWallet> = async ({
	metadata,
	logger,
	options,
	provider,
}) => {

	initConnection(networks['testnet'])

	const isValidActions = (actions: Array<Action>): actions is Array<FunctionCallAction> => {
		return actions.every((x) => x.type === "FunctionCall");
	};

	const transformActions = (actions: Array<Action>) => {
		const validActions = isValidActions(actions);

		if (!validActions) {
			throw new Error(`Only 'FunctionCall' actions types are supported by ${metadata.name}`);
		}

		return actions.map((x) => x.params);
	};

	// return the wallet interface for wallet-selector
	return {
		async signIn() {
			const account = await signIn();
			return [account];
		},

		async signOut() {
			const res = signOut()
			return res
		},

		async verifyOwner({ message }) {
			logger.log("Keypom:verifyOwner", { message });

			return {
				accountId: 'string',
				message: 'string',
				blockId: 'string',
				publicKey: 'string',
				signature: 'string',
				keyType: 0,
			}
		},

		async getAccounts() {
			const { accountId } = await getAccount();
			return [{ accountId }];
		},

		async signAndSendTransaction({ receiverId, actions }) {
			logger.log("Keypom:signAndSendTransaction", {
				receiverId,
				actions,
			});

			return signAndSendTransactions({
				transactions: [
					{
						receiverId,
						actions: transformActions(actions),
					},
				],
			});
		},

		async signAndSendTransactions({ transactions }) {
			logger.log("Keypom:signAndSendTransactions", { transactions });

			let res;
			try {
				res = await signAndSendTransactions({
					transactions,
				});
			} catch (e) {
				/// user cancelled or near network error
				console.warn(e);
			}

			return res;
		},
	};
};

export function setupKeypom({
	iconUrl = nearWalletIcon,
}: KeypomParams = {}): WalletModuleFactory<InjectedWallet> {
	return async () => {

		return {
			id: "keypom",
			type: "injected",
			metadata: {
				name: "Keypom Account",
				description: null,
				iconUrl,
				downloadUrl:
					"https://example.com",
				deprecated: false,
				available: true,
			},
			init: Keypom,
		};
	};
}
