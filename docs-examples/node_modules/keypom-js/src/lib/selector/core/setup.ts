import { NetworkId, WalletModuleFactory } from "@near-wallet-selector/core";

import icon from "./icon";
import { initKeypomWallet } from "./init";
import { KeypomWalletType } from "./types";
import { KeypomWallet } from "./wallet";

export { icon };

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
}

export function setupKeypom({
	iconUrl = icon,
	deprecated = false,
	desiredUrl,
	networkId
}: KeypomSetupParams): WalletModuleFactory<KeypomWalletType> {
	return async () => {
		const keypomWallet = new KeypomWallet({
			networkId,
			desiredUrl
		})

		let signInSuccess = true;
		try {
			await keypomWallet.signIn();
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
