"use strict";
// FastAuthWallet.ts
Object.defineProperty(exports, "__esModule", { value: true });
const google_1 = require("@react-oauth/google");
const js_sha256_1 = require("js-sha256");
const near_api_js_1 = require("near-api-js");
const key_stores_1 = require("near-api-js/lib/key_stores");
const constants_1 = require("./constants");
const crypto_1 = require("./utils/crypto");
const FastAuthWallet = async (walletOptions) => {
    const { options, localTesting } = walletOptions;
    const envNetwork = localTesting ? "local" : options.network.networkId;
    const env = constants_1.ENV_VARIABLES[envNetwork];
    console.log("options", options);
    console.log("localTesting", localTesting);
    console.log("WALLET ENV:", env);
    const { STORAGE_KEY, WORKER_BASE_URL } = env;
    const wallet = async ({ options, store: _store, provider, emitter, logger: _logger, storage, }) => {
        let state = null;
        let near = null;
        const loadState = async (options) => {
            const storedState = await storage.getItem(STORAGE_KEY);
            if (storedState) {
                state = storedState;
            }
            near = new near_api_js_1.Near({
                networkId: options.network.networkId,
                nodeUrl: options.network.nodeUrl,
                keyStore: new key_stores_1.InMemoryKeyStore(),
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
            async signIn(params) {
                const { userIdHash, sessionKeyPair, contractId, methodNames, mpcContractId, fastAuthContractId, } = params;
                console.log("Params: ", params);
                // Fetch the mpcKey from the mpcContract
                const viewAccount = await near.account("foo");
                const mpcKey = await viewAccount.viewFunction({
                    contractId: mpcContractId,
                    methodName: "derived_public_key",
                    args: {
                        path: userIdHash,
                        predecessor: fastAuthContractId,
                    },
                });
                const accountId = (0, crypto_1.deriveEthAddressFromMpcKey)(mpcKey);
                state = {
                    accountId,
                    sessionKey: sessionKeyPair.toString(),
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
                // Revoke the OAuth token
                (0, google_1.googleLogout)();
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
                const { accountId, sessionKey } = state;
                const sessionKeyPair = near_api_js_1.KeyPair.fromString(sessionKey);
                const receiverId = params.receiverId || params.signerId;
                if (!params.actions || params.actions.length === 0) {
                    throw new Error("No actions provided");
                }
                const action = params.actions[0];
                let nearPayload;
                if (action.type === "FunctionCall") {
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
                    nearPayload = {
                        action: {
                            FunctionCall: {
                                contract_id: receiverId,
                                method_name: methodName,
                                args: argsArray,
                                gas: gas.toString(),
                                deposit: deposit.toString(),
                            },
                        },
                        nonce: nonce.toString(),
                    };
                }
                else if (action.type === "Transfer") {
                    const { deposit } = action.params;
                    const viewAccount = await near.account("foo");
                    const nonce = await viewAccount.viewFunction({
                        contractId: accountId,
                        methodName: "get_nonce",
                        args: {},
                    });
                    console.log("Nonce: ", nonce);
                    nearPayload = {
                        action: {
                            Transfer: {
                                receiver_id: receiverId,
                                amount: deposit.toString(),
                            },
                        },
                        nonce: nonce.toString(),
                    };
                }
                else {
                    throw new Error("Unsupported action type");
                }
                // Serialize the payload
                const payloadJson = JSON.stringify(nearPayload);
                const payloadBytes = Buffer.from(payloadJson);
                // Sign the payload using the session key
                const signature = sessionKeyPair.sign(payloadBytes);
                const signatureBase64 = Buffer.from(signature.signature).toString("base64");
                // Relay the signed payload to the Cloudflare worker
                const response = await fetch(`${WORKER_BASE_URL}/sign-txn`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        signature: signatureBase64,
                        payload: nearPayload,
                        sessionKey: sessionKeyPair.toString(),
                        appId: (0, js_sha256_1.sha256)(window.location.origin),
                    }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.error ||
                        "Failed to sign transaction with FastAuth");
                }
                console.log("result", result);
                // Return the execution outcome (if applicable)
                return result;
            },
            /** signAndSendTransactions */
            async signAndSendTransactions(params) {
                const results = [];
                for (const tx of params.transactions) {
                    const result = await this.signAndSendTransaction({
                        ...tx,
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
exports.default = FastAuthWallet;
