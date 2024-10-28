import * as nearAPI from "near-api-js";
import {
    InstantLinkWalletBehaviour,
    NetworkId,
    Transaction,
} from "@near-wallet-selector/core";
import {
    KEYPOM_LOCAL_STORAGE_KEY,
    setLocalStorageKeypomEnv,
    NO_CONTRACT_ID,
    KeypomWalletAccount,
    getPubFromSecret,
} from "../utils/selector-utils";
import { extSignAndSendTransactions } from "./ext_wallets";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: NetworkId;
    trialAccountSecretKey: KeyPairString;
    keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;
    signedIn: boolean;

    public constructor({
        networkId,
        nearConnection,
        keyStore,
        accountId,
        secretKey,
        walletId,
        baseUrl,
        contractId,
        walletUrl,
        addKey,
        methodNames,
        allowance,
        chainId,
    }: {
        networkId: NetworkId;
        nearConnection: any;
        keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;
        accountId: string;
        secretKey?: string;
        walletId: string;
        baseUrl: string;
        contractId: string;
        walletUrl?: string;
        addKey?: boolean;
        methodNames?: string[];
        allowance?: string;
        chainId?: string;
    }) {
        this.nearConnection = nearConnection;
        this.keyStore = keyStore;
        this.networkId = networkId;
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.walletId = walletId;
        this.baseUrl = baseUrl;
        this.contractId = contractId;
        this.signedIn = false;
        this.walletUrl = walletUrl;
        this.addKey = addKey !== undefined && addKey !== null ? addKey : true;
        this.methodNames = methodNames || ["*"];
        this.allowance = allowance || "1000000000000000000000000";
        this.chainId = chainId || "near";
    }

    getAccountId(): string {
        return this.accountId;
    }

    async isSignedIn() {
        // return this.accountId !== undefined && this.accountId !== null;
        return this.signedIn;
    }

    getContractId(): string {
        return this.contractId;
    }

    getNearConnection(): nearAPI.Near {
        return this.nearConnection;
    }

    async setContractId(contractId?: string): Promise<string> {
        console.log("setContractId", this.secretKey);
        if (this.contractId !== contractId) {
            console.log("contractId already set", this.contractId);
            return this.contractId;
        }

        if (contractId) {
            this.contractId = contractId;
            return this.contractId;
        }

        return NO_CONTRACT_ID;

        // const pk = getPubFromSecret(this.secretKey);
        // console.log("pk", pk);

        // const accessKey: any =
        //     await this.nearConnection.connection.provider.query(
        //         `access_key/${this.accountId}/${pk}`,
        //         ""
        //     );

        // console.log("accessKey", accessKey);

        // const { permission } = accessKey;
        // if (permission.FunctionCall) {
        //     const { receiver_id } = permission.FunctionCall;
        //     this.contractId = receiver_id;
        //     console.log("contractId", this.contractId);
        //     return receiver_id;
        // }

        // this.contractId = NO_CONTRACT_ID;
        // console.log("full access key: contractId", this.contractId);
        // return NO_CONTRACT_ID;
    }

    async signIn(): Promise<KeypomWalletAccount[]> {
        console.log("keypom signIn");

        let returnVal;

        if (this.secretKey !== undefined) {
            try {
                await this.setContractId();
                const account = await this.nearConnection.account(
                    this.accountId
                );
                const allKeys = await account.getAccessKeys();
                const pk = getPubFromSecret(this.secretKey);

                const keyInfoView = allKeys.find(
                    ({ public_key }) => public_key === pk
                );
                console.log("keyInfoView", keyInfoView);

                if (keyInfoView) {
                    return await this.internalSignIn({
                        accountId: this.accountId,
                        walletId: this.walletId,
                        secretKey: this.secretKey,
                        baseUrl: this.baseUrl,
                        walletUrl: this.walletUrl,
                        chainId: this.chainId,
                        contractId: this.contractId,
                        methodNames: this.methodNames,
                        allowance: this.allowance,
                        addKey: this.addKey,
                    });
                }
                console.log(
                    "secret key not found for account. Defaulting to no key."
                );
            } catch (e) {
                console.log("e: ", e);
                return [];
            }
        }
        return await this.internalSignIn({
            accountId: this.accountId,
            walletId: this.walletId,
            baseUrl: this.baseUrl,
            walletUrl: this.walletUrl,
            chainId: this.chainId,
            contractId: this.contractId,
            methodNames: this.methodNames,
            allowance: this.allowance,
            addKey: this.addKey,
        });
    }

    async signOut() {
        if (this.signedIn === false) {
            throw new Error("Wallet is already signed out");
        }

        this.signedIn = false;
        await this.keyStore.removeKey(this.networkId, this.accountId);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    async signAndSendTransaction(params) {
        if (this.signedIn === false) {
            throw new Error("Wallet is not signed in");
        }
        console.log("sign and send txn params: ", params);
        const { receiverId, actions } = params;

        let res;
        try {
            res = await this.signAndSendTransactions({
                transactions: [
                    {
                        signerId: this.accountId!,
                        receiverId,
                        actions,
                    },
                ],
            });
        } catch (e) {
            /// user cancelled or near network error
            console.warn(e);
        }

        return res[0];
    }

    async signAndSendTransactions(params: { transactions: Transaction[] }) {
        console.log("sign and send txns params inner: ", params);
        if (this.signedIn === false) {
            throw new Error("Wallet is not signed in");
        }
        const { transactions } = params;

        console.log("wallet sign and send url: ", this);

        return await extSignAndSendTransactions({
            transactions,
            walletId: this.walletId!,
            accountId: this.accountId!,
            secretKey: this.secretKey!,
            near: this.nearConnection,
            walletUrl: this.walletUrl,
            addKey: this.addKey,
            contractId: this.contractId,
            methodNames: this.methodNames,
            allowance: this.allowance,
        });
    }

    async verifyOwner() {
        throw Error("KeypomWallet:verifyOwner is deprecated");
    }

    async getAvailableBalance(id?: string): Promise<bigint> {
        // TODO: get access key allowance
        return BigInt(0);
    }

    async getAccounts(): Promise<KeypomWalletAccount[]> {
        if (this.signedIn === true) {
            return [
                {
                    accountId: this.accountId,
                    walletId: this.walletId,
                    publicKey:
                        this.secretKey && getPubFromSecret(this.secretKey),
                },
            ];
        }

        return [];
    }

    async switchAccount(id: string) {
        // TODO:  maybe?
    }

    private async internalSignIn({
        accountId,
        secretKey,
        walletId,
        baseUrl,
        walletUrl,
        chainId,
        contractId,
        methodNames,
        allowance,
        addKey,
    }: {
        accountId: string;
        walletId: string;
        chainId: string;
        contractId: string;
        methodNames: string[];
        allowance: string;
        addKey: boolean;
        secretKey?: string;
        baseUrl?: string;
        walletUrl?: string;
    }): Promise<KeypomWalletAccount[]> {
        console.log(
            `internalSignIn accountId ${accountId} secretKey ${secretKey} walletId ${walletId}`
        );

        this.signedIn = true;
        const dataToWrite = {
            accountId,
            secretKey,
            walletId,
            baseUrl,
            walletUrl,
            chainId,
            contractId,
            methodNames,
            allowance,
            addKey,
        };
        setLocalStorageKeypomEnv(dataToWrite);

        if (secretKey) {
            await this.keyStore.setKey(
                this.networkId,
                accountId,
                nearAPI.KeyPair.fromString(secretKey)
            );
        }

        console.log("Data to write: ", dataToWrite);

        // Assuming the URL pattern follows directly after the domain and possible path
        // Erase the OneClick Connect URL segment
        if (window.history && window.history.pushState) {
            console.log("Before pushState:");
            console.log("window.location.href:", window.location.href);
            console.log("window.history.state:", window.history.state);

            // Update the URL to the base URL
            window.history.pushState({}, "", this.baseUrl);

            console.log("After pushState:");
            console.log("window.location.href:", window.location.href);
            console.log("window.history.state:", window.history.state);
        }

        // Clear URL search parameters unconditionally
        // if (window.history && window.history.pushState) {
        //     try {
        //         const currentUrl = new URL(window.location.href);
        //         const baseUrl = currentUrl.origin + currentUrl.pathname;
        //         console.log("Base URL to set:", baseUrl);
        //         window.history.pushState({}, "", baseUrl);
        //         console.log("Window history post-pushState", window.history);
        //     } catch (e) {
        //         console.log("Error updating URL:", e);
        //     }
        // }
        return [
            {
                accountId: this.accountId,
                walletId: this.walletId,
                publicKey: this.secretKey && getPubFromSecret(this.secretKey),
            },
        ];
    }
}
