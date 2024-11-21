"use strict";
// FastAuthWallet.ts
Object.defineProperty(exports, "__esModule", { value: true });
const near_api_js_1 = require("near-api-js");
const near_api_js_2 = require("near-api-js");
const transaction_1 = require("near-api-js/lib/transaction");
const STORAGE_KEY = "FAST_AUTH_WALLET_STATE";
const FastAuthWallet = async (walletOptions) => {
    const { options } = walletOptions;
    console.log("options", options);
    const wallet = async ({ options: _options, store: _store, provider, emitter, logger: _logger, storage, }) => {
        let state = null;
        const loadState = async () => {
            const storedState = await storage.getItem(STORAGE_KEY);
            if (storedState) {
                state = storedState;
            }
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
        await loadState();
        const mapAction = (action) => {
            switch (action.type) {
                case "FunctionCall":
                    return near_api_js_2.transactions.functionCall(action.params.methodName, action.params.args, BigInt(action.params.gas), BigInt(action.params.deposit));
                // Handle other action types as needed
                default:
                    throw new Error(`Unsupported action type: ${action.type}`);
            }
        };
        return {
            /** Sign In */
            async signIn(params) {
                const { idToken, contractId, methodNames } = params;
                // Generate a new keypair
                const keyPair = near_api_js_1.KeyPair.fromRandom("ed25519");
                const publicKey = keyPair.getPublicKey().toString();
                // Use the idToken and publicKey to authenticate with your backend
                const response = await fetch("https://fastauth-worker-dev.keypom.workers.dev/add-session-key", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ idToken, publicKey }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Failed to sign in with FastAuth");
                }
                const accountId = result.accountId || "benjiman.testnet"; // Replace with actual accountId
                state = {
                    accountId,
                    keyPair,
                };
                await saveState();
                // Emit the signedIn event
                const accounts = [{ accountId }];
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
            async signAndSendTransaction(params) {
                if (!state) {
                    throw new Error("Wallet not signed in");
                }
                const { accountId } = state;
                const signerId = params.signerId || accountId;
                const receiverId = params.receiverId || params.signerId || accountId;
                const actions = params.actions.map((action) => mapAction(action));
                const publicKey = state.keyPair.getPublicKey();
                const accessKey = await provider.viewAccessKey({
                    accountId: signerId,
                    publicKey: publicKey.toString(),
                });
                const block = await provider.block({ finality: "final" });
                const nonce = accessKey.nonce + BigInt(1);
                const transaction = near_api_js_2.transactions.createTransaction(signerId, publicKey, receiverId, nonce, actions, near_api_js_2.utils.serialize.base_decode(block.header.hash));
                const serializedTx = near_api_js_2.utils.serialize.serialize(transaction_1.SCHEMA.SignedTransaction, transaction);
                const signature = state.keyPair.sign(serializedTx);
                const signedTransaction = new near_api_js_2.transactions.SignedTransaction({
                    transaction,
                    signature: new near_api_js_2.transactions.Signature({
                        keyType: transaction.publicKey.keyType,
                        data: signature.signature,
                    }),
                });
                // Send the transaction
                return await provider.sendTransaction(signedTransaction);
            },
            /** signAndSendTransactions */
            async signAndSendTransactions(params) {
                const results = [];
                for (const tx of params.transactions) {
                    const result = await this.signAndSendTransaction({
                        ...tx,
                        signerId: tx.signerId || state?.accountId,
                    });
                    results.push(result);
                }
                return results;
            },
            /** verifyOwner */
            async verifyOwner(params) {
                throw new Error("Method not implemented.");
            },
        };
    };
    return {
        id: "fastauth-wallet",
        type: "injected",
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
exports.default = FastAuthWallet;
