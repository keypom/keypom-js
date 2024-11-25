// FastAuthWallet.ts

import {
    WalletModuleFactory,
    WalletBehaviourFactory,
    Account,
    SignInParams,
    Wallet,
    VerifyOwnerParams,
    VerifiedOwner,
} from "@near-wallet-selector/core";
import { Options } from "@near-wallet-selector/core/src/lib/options.types";
import { googleLogout } from "@react-oauth/google";
import { sha256 } from "js-sha256";
import { KeyPair, Near } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { KeyPairString } from "near-api-js/lib/utils";
import { NearPayload } from "./models/payload";
import { decodeJwt } from "./utils/authTokens";
import { deriveEthAddressFromMpcKey } from "./utils/crypto";

interface FastAuthState {
    sessionKey: KeyPairString;
    accountId: string;
}

const STORAGE_KEY = "FAST_AUTH_WALLET_STATE";

interface FastAuthSignInParams extends SignInParams {
    idToken: string;
    mpcContractId: string;
    fastAuthContractId: string;
}

const FastAuthWallet: WalletModuleFactory = async (walletOptions) => {
    const { options } = walletOptions;
    console.log("options", options);

    const wallet: WalletBehaviourFactory<Wallet> = async ({
        options,
        store: _store,
        provider,
        emitter,
        logger: _logger,
        storage,
    }) => {
        let state: FastAuthState | null = null;
        let near: Near | null = null;

        const loadState = async (options: Options) => {
            const storedState = await storage.getItem<FastAuthState>(
                STORAGE_KEY
            );
            if (storedState) {
                state = storedState;
            }

            near = new Near({
                networkId: options.network.networkId,
                nodeUrl: "https://rpc.testnet.near.org",
                keyStore: new InMemoryKeyStore(),
            });
        };

        const saveState = async () => {
            if (state) {
                await storage.setItem(STORAGE_KEY, state);
            }
        };

        const clearState = async () => {
            await storage.removeItem(STORAGE_KEY);
            state = null;
        };

        await loadState(options);

        return {
            /** Sign In */
            async signIn(params: FastAuthSignInParams) {
                const {
                    idToken,
                    contractId,
                    methodNames,
                    mpcContractId,
                    fastAuthContractId,
                } = params;

                // Generate a new keypair
                const sessionKeyPair = KeyPair.fromRandom("ed25519");
                const sessionPublicKey = sessionKeyPair
                    .getPublicKey()
                    .toString();

                // Use the idToken and publicKey to authenticate with your backend
                const response = await fetch(
                    "https://fastauth-worker-dev.keypom.workers.dev/add-session-key",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ idToken, sessionPublicKey }),
                    }
                );
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error || "Failed to sign in with FastAuth"
                    );
                }

                // Decode the idToken to get the Google ID
                const decodedToken = decodeJwt(idToken);
                const googleId = decodedToken.sub;
                console.log("googleId", googleId);
                // Hash the Google ID to create the derivation path
                const googleIdHash = sha256(googleId);

                const viewAccount = await near.account("foo");
                const mpcKey = await viewAccount.viewFunction({
                    contractId: mpcContractId,
                    methodName: "derived_public_key",
                    args: {
                        path: googleIdHash,
                        predecessor: fastAuthContractId,
                    },
                });

                const accountId = deriveEthAddressFromMpcKey(mpcKey);

                state = {
                    accountId,
                    sessionKey: sessionKeyPair.toString(),
                };

                await saveState();

                // Emit the signedIn event
                const accounts: Array<Account> = [{ accountId }];
                emitter.emit("signedIn", {
                    contractId: contractId,
                    methodNames: methodNames || [],
                    accounts,
                });

                return accounts;
            },

            /** Sign Out */
            async signOut() {
                await clearState();

                // Revoke the OAuth token
                googleLogout();

                // Emit the signedOut event
                emitter.emit("signedOut", null);
            },

            /** Get Accounts */
            async getAccounts() {
                if (state) {
                    return [{ accountId: state.accountId }];
                }
                return [];
            },

            /** signAndSendTransaction */
            async signAndSendTransaction(
                params: any
            ): Promise<FinalExecutionOutcome> {
                if (!state) {
                    throw new Error("Wallet not signed in");
                }

                const { accountId, sessionKey } = state;
                const sessionKeyPair = KeyPair.fromString(sessionKey);
                const receiverId = params.receiverId || params.signerId;

                if (!params.actions || params.actions.length === 0) {
                    throw new Error("No actions provided");
                }

                // For simplicity, assume there is only one action
                const action = params.actions[0];

                if (action.type !== "FunctionCall") {
                    throw new Error("Only FunctionCall actions are supported");
                }

                // Extract action parameters
                const { methodName, args, gas, deposit } = action.params;

                // Serialize args to bytes
                const argsSerialized = JSON.stringify(args);
                const argsBytes = Buffer.from(argsSerialized);
                const argsArray = Array.from(argsBytes);

                const viewAccount = await near.account("foo");
                const nonce = await viewAccount.viewFunction({
                    contractId: accountId,
                    methodName: "get_nonce",
                    args: {},
                });
                console.log("Nonce: ", nonce);

                const nearPayload: NearPayload = {
                    contract_id: receiverId,
                    method_name: methodName,
                    args: argsArray,
                    gas: gas.toString(),
                    deposit: deposit.toString(),
                    nonce: nonce.toString(),
                };

                // Serialize the payload
                const payloadJson = JSON.stringify(nearPayload);
                const payloadBytes = Buffer.from(payloadJson);

                // Sign the payload using the session key
                const signature = sessionKeyPair.sign(payloadBytes);
                const signatureBase64 = Buffer.from(
                    signature.signature
                ).toString("base64");

                // Relay the signed payload to the Cloudflare worker
                const response = await fetch(
                    "https://fastauth-worker-dev.keypom.workers.dev/sign-txn",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            signature: signatureBase64,
                            payload: nearPayload,
                            sessionKey: sessionKeyPair.toString(),
                        }),
                    }
                );

                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error ||
                            "Failed to sign transaction with FastAuth"
                    );
                }

                console.log("result", result);

                // Return the execution outcome (if applicable)
                return result;
            },

            /** signAndSendTransactions */
            async signAndSendTransactions(
                params: any
            ): Promise<Array<FinalExecutionOutcome>> {
                const results: Array<FinalExecutionOutcome> = [];
                for (const tx of params.transactions) {
                    const result = await this.signAndSendTransaction({
                        ...tx,
                    });
                    results.push(result);
                }
                return results;
            },

            /** verifyOwner */
            async verifyOwner(
                params: VerifyOwnerParams
            ): Promise<VerifiedOwner | void> {
                throw new Error("Method not implemented.");
            },
        };
    };

    return {
        id: "fastauth-wallet",
        type: "instant-link",
        metadata: {
            name: "FastAuth Wallet",
            description: null,
            iconUrl: "https://your-icon-url/fastauth-icon.png",
            downloadUrl: null,
            deprecated: false,
            available: true,
        },
        init: wallet,
    };
};

export default FastAuthWallet;
