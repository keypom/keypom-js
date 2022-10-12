import {
	WalletModuleFactory,
	InjectedWallet,
	Action,
	FunctionCallAction,
	WalletBehaviourFactory,
	waitFor,
} from "@near-wallet-selector/core";
import { nearWalletIcon } from "../assets/icons";

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
			let account;
			try {
				account = await signIn();
				if (!account) return []
			} catch (e: any) {
				if (!/not connected/.test(e.toString())) throw e;
				// console.log(e);
			}
			return [account];
		},

		async signOut() {
			await signOut();
		},

		async verifyOwner({ message }) {
			logger.log("Keypom:verifyOwner", { message });

			verifyOwner({ message, provider });
		},

		async getAccounts() {
			const { accountId } = await getNear();
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

			const transformedTxs = transactions.map(({ receiverId, actions }) => ({
				receiverId,
				actions: transformActions(actions),
			}));

			let res;
			try {
				res = await signAndSendTransactions({
					transactions: transformedTxs,
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
