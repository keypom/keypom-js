import * as nearAPI from "near-api-js";
import {
    InstantLinkWalletBehaviour,
    NetworkId,
    Transaction,
} from "@near-wallet-selector/core";
import {
    KEYPOM_LOCAL_STORAGE_KEY,
    getLocalStorageKeypomEnv,
    setLocalStorageKeypomEnv,
    parseOneClickSignInFromUrl,
    getNetworkPreset,
    NO_CONTRACT_ID,
    KeypomWalletAccount,
    getPubFromSecret,
} from "../utils/selector-utils";
import {
    SUPPORTED_EXT_WALLET_DATA,
    extSignAndSendTransactions,
} from "./ext_wallets";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: NetworkId;
    accountId: string;
    walletId: string;
    baseUrl: string;

    nearConnection: nearAPI.Near;
    keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;

    // Initialized in signIn
    contractId?: string;
    secretKey?: string;

    signedIn: boolean;

    public constructor({
        networkId,
        nearConnection,
        keyStore,
        accountId,
        secretKey,
        walletId,
        baseUrl,
    }: {
        networkId: NetworkId;
        nearConnection: any;
        keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;
        accountId: string;
        walletId: string;
        baseUrl: string;
        secretKey?: string;
    }) {
        this.nearConnection = nearConnection;
        this.keyStore = keyStore;
        this.networkId = networkId;
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.walletId = walletId;
        this.baseUrl = baseUrl;
        this.signedIn = false;
    }

    getAccountId(): string {
        return this.accountId;
    }

    async isSignedIn() {
        return this.signedIn
    }

    getContractId(): string {
        return this.contractId || NO_CONTRACT_ID;
    }

    async setContractId(): Promise<string> {
        console.log("setContractId", this.secretKey);
        if (this.contractId !== undefined) {
            console.log("contractId already set", this.contractId);
            return this.contractId;
        }

        if (this.secretKey === undefined) {
            console.log("secretKey not set");
            return NO_CONTRACT_ID;
        }

        const pk = getPubFromSecret(this.secretKey);
        console.log("pk", pk);

        const accessKey: any =
            await this.nearConnection.connection.provider.query(
                `access_key/${this.accountId}/${pk}`,
                ""
            );

        console.log("accessKey", accessKey);

        const { permission } = accessKey;
        if (permission.FunctionCall) {
            const { receiver_id } = permission.FunctionCall;
            this.contractId = receiver_id;
            console.log("contractId", this.contractId);
            return receiver_id;
        }

        this.contractId = NO_CONTRACT_ID;
        console.log("full access key: contractId", this.contractId);
        return NO_CONTRACT_ID;
    }

    async signIn(): Promise<KeypomWalletAccount[]> {
        console.log("keypom signIn");

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
                    return this.internalSignIn(
                        this.accountId,
                        this.walletId,
                        this.secretKey
                    );
                }
            } catch (e) {
                console.log("e: ", e);
            }
        }else{
            // handles case of no secretKey
            return this.internalSignIn(
                this.accountId,
                this.walletId,
                this.secretKey
            );
        }

        return [];
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

        return await extSignAndSendTransactions({
            transactions,
            walletId: this.walletId!,
            accountId: this.accountId!,
            secretKey: this.secretKey!,
            near: this.nearConnection,
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

    private async internalSignIn(
        accountId: string,
        walletId: string,
        secretKey?: string
    ): Promise<KeypomWalletAccount[]> {
        console.log(
            `internalSignIn accountId ${accountId} secretKey ${secretKey} walletId ${walletId}`
        );

        this.signedIn = true;
        const dataToWrite = {
            accountId,
            secretKey,
            walletId,
        };
        setLocalStorageKeypomEnv(dataToWrite);

        if (secretKey) {
            await this.keyStore.setKey(
                this.networkId,
                accountId,
                nearAPI.KeyPair.fromString(secretKey)
            );
        }

        // Assuming the URL pattern follows directly after the domain and possible path
        // Erase the OneClick Connect URL segment
        if (window.history && window.history.pushState) {
            const urlStart = window.location.href.split(this.baseUrl)[0]; // This will remove everything after the base URL
            window.history.pushState({}, "", urlStart);
        }
        return [
            {
                accountId: this.accountId,
                walletId: this.walletId,
                publicKey: this.secretKey && getPubFromSecret(this.secretKey),
            },
        ];
    }
}
