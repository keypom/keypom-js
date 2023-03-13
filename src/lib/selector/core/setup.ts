import { NetworkId, WalletModuleFactory } from "@near-wallet-selector/core";

import { initKeypomWallet } from "./init";
import { KeypomWalletType } from "./types";
import { KeypomWallet } from "./wallet";

declare global {
	interface Window {
		near: any,
	}
}

interface KeypomSetupParams {
	networkId: NetworkId;
	iconUrl?: string;
	deprecated?: boolean;
	desiredUrl?: string;
	keyStore?: any;
	delimiter?: string;
	contractId?: string;
	methodNames?: string[];
}

export function setupKeypom({
	iconUrl = "",
	deprecated = false,
	desiredUrl,
	networkId,
	keyStore,
	delimiter,
	contractId,
	methodNames
}: KeypomSetupParams): WalletModuleFactory<KeypomWalletType> {
	return async () => {
		const keypomWallet = new KeypomWallet({
			networkId,
			desiredUrl,
			keyStore,
			delimiter
		})

		let signInSuccess = true;
		try {
			await keypomWallet.signIn({contractId, methodNames});
		} catch (e) {
			signInSuccess = false;
		}

		// await waitFor(() => !!window.near?.isSignedIn(), { timeout: 300 }).catch(() => false);
		return {
			id: "keypom",
			type: "injected",
			metadata: {
				name: "Keypom Account",
				description: null,
				iconUrl,
				downloadUrl:
					"https://example.com",
				deprecated,
				available: true,
			},
			init: (config) =>
				initKeypomWallet({
					...config,
					keypomWallet
				}),
		};
	};
}
