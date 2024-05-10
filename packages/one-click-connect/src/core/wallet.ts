import { getPubFromSecret, initKeypom, networks } from "@keypom/core";
import { Account } from "@near-js/accounts";
import { PublicKey } from "@near-js/crypto";
import { KeyPair } from "@near-js/crypto";
import { BrowserLocalStorageKeyStore } from "@near-js/keystores-browser";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import {
    InstantLinkWalletBehaviour,
    Transaction,
} from "@near-wallet-selector/core";
import {
    KEYPOM_LOCAL_STORAGE_KEY,
    getLocalStorageKeypomEnv,
    setLocalStorageKeypomEnv,
    parseOneClickSignInFromUrl,
} from "../utils/selector-utils";
import {
    SUPPORTED_EXT_WALLET_DATA,
    extSignAndSendTransactions,
} from "./ext_wallets";
import { InternalOneClickSpecs } from "./types";

const ONE_CLICK_URL_REGEX = new RegExp(
    `^(.*):accountId(.+):secretKey(.+):walletId(.*)$`
);

export class KeypomWallet implements InstantLinkWalletBehaviour {
    accountId?: string;
    secretKey?: string;
    walletId?: string;
    contractId?: string;

    near: Near;
    keyStore: BrowserLocalStorageKeyStore;

    oneClickConnectSpecs?: InternalOneClickSpecs;

    public constructor({
        networkId,
        urlPattern,
    }: {
        networkId: string;
        urlPattern: string;
    }) {
        console.log("Initializing OneClick Connect");

        this.keyStore = new BrowserLocalStorageKeyStore();
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore: this.keyStore },
        });

        this.setSpecsFromKeypomParams(urlPattern);
    }

    getContractId(): string {
        return this.contractId || "foo.near";
    }

    getAccountId(): string {
        this.assertSignedIn();
        return this.accountId!;
    }

    async isSignedIn() {
        return this.accountId !== undefined && this.accountId !== null;
    }

    async signInInstantAccount(
        accountId: string,
        secretKey: string,
        walletId: string
    ): Promise<Account[]> {
        // Check if the account ID and secret key are valid and sign in accordingly
        try {
            const account = new Account(this.near.connection, accountId);
            const allKeys = await account.getAccessKeys();
            const pk = getPubFromSecret(secretKey);

            const keyInfoView = allKeys.find(
                ({ public_key }) => public_key === pk
            );

            if (keyInfoView) {
                return this.internalSignIn(accountId, secretKey, walletId);
            }
        } catch (e) {
            console.log("e: ", e);
        }

        return [];
    }

    async getLAKContractId(
        accountId: string,
        secretKey: string
    ): Promise<string> {
        if (this.contractId !== undefined) {
            return this.contractId;
        }

        const pk = PublicKey.from(getPubFromSecret(secretKey));

        const accessKey: any = await this.near!.connection.provider.query(
            `access_key/${accountId}/${pk}`,
            ""
        );

        const { permission } = accessKey;
        if (permission.FunctionCall) {
            const { receiver_id } = permission.FunctionCall;
            this.contractId = receiver_id;
            return receiver_id;
        }

        this.contractId = "foo.near";
        return "foo.near";
    }

    public checkValidOneClickParams = (): {
        accountId: string;
        secretKey: string;
        walletId: string;
    } | null => {
        console.log("CheckValidOneClick");

        let oneClickData: {
            accountId: string;
            secretKey: string;
            walletId: string;
        } | null = null;
        if (this.oneClickConnectSpecs?.baseUrl !== undefined) {
            oneClickData = parseOneClickSignInFromUrl(
                this.oneClickConnectSpecs
            );
        }

        if (oneClickData !== null) {
            return oneClickData;
        }

        const localStorageData = getLocalStorageKeypomEnv();
        if (localStorageData !== null) {
            return JSON.parse(localStorageData);
        }

        return null;
    };

    async signIn(): Promise<Account[]> {
        await initKeypom({
            network: this.near.connection.networkId,
        });

        // Try to sign in using one click sign-in data from URL
        const oneClickSignInData =
            this.oneClickConnectSpecs?.baseUrl !== undefined
                ? parseOneClickSignInFromUrl(this.oneClickConnectSpecs)
                : null;

        if (oneClickSignInData !== null) {
            const networkId = this.near.connection.networkId!;
            const isModuleSupported =
                SUPPORTED_EXT_WALLET_DATA[networkId]?.[
                    oneClickSignInData.walletId
                ] !== undefined;

            if (!isModuleSupported) {
                console.warn(
                    `Module ID ${oneClickSignInData.walletId} is not supported on ${networkId}.`
                );
                return [];
            }

            return this.signInInstantAccount(
                oneClickSignInData.accountId,
                oneClickSignInData.secretKey,
                oneClickSignInData.walletId
            );
        }

        // Try to sign in using data from local storage if URL does not contain valid one click sign-in data
        const curEnvData = getLocalStorageKeypomEnv();
        if (curEnvData !== null) {
            const { accountId, secretKey, walletId } = JSON.parse(curEnvData);
            return this.internalSignIn(accountId, secretKey, walletId);
        }

        return [];
    }

    async signOut() {
        if (this.accountId === undefined || this.accountId === null) {
            throw new Error("Wallet is already signed out");
        }

        this.accountId = this.secretKey = this.walletId = undefined;
        await this.keyStore.removeKey(
            this.near.connection.networkId,
            this.accountId!
        );
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    async signAndSendTransaction(params) {
        this.assertSignedIn();
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

        return res[0] as FinalExecutionOutcome;
    }

    async signAndSendTransactions(params: { transactions: Transaction[] }) {
        console.log("sign and send txns params inner: ", params);
        this.assertSignedIn();
        const { transactions } = params;

        return await extSignAndSendTransactions({
            transactions,
            walletId: this.walletId!,
            accountId: this.accountId!,
            secretKey: this.secretKey!,
            near: this.near,
        });
    }

    async verifyOwner() {
        throw Error("KeypomWallet:verifyOwner is deprecated");
    }

    async getAvailableBalance(id?: string): Promise<bigint> {
        // TODO: get access key allowance
        return BigInt(0);
    }

    async getAccounts(): Promise<Account[]> {
        if (this.accountId != undefined && this.accountId != null) {
            const accountObj = new Account(
                this.near.connection,
                this.accountId!
            );
            return [accountObj];
        }

        return [];
    }

    async switchAccount(id: string) {
        // TODO:  maybe?
    }

    private async internalSignIn(accountId, secretKey, walletId) {
        console.log(
            `internalSignIn accountId ${accountId} secretKey ${secretKey} walletId ${walletId}`
        );
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.walletId = walletId;

        const dataToWrite = {
            accountId,
            secretKey,
            walletId,
        };
        setLocalStorageKeypomEnv(dataToWrite);
        await this.keyStore.setKey(
            this.near.connection.networkId,
            accountId,
            KeyPair.fromString(secretKey)
        );

        const accountObj = new Account(this.near.connection, accountId);
        return [accountObj];
    }

    private assertSignedIn() {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    }

    private setSpecsFromKeypomParams(urlPattern: string) {
        const matches = urlPattern.match(ONE_CLICK_URL_REGEX);
        if (!matches) {
            console.error(
                "Invalid URL pattern. Could not extract necessary parts."
            );
            return;
        }

        const baseUrl = matches[1];
        const delimiter = matches[2];
        const walletDelimiter = matches[3];
        const restUrl = matches[4]; // Capture any additional URL components after WALLET_ID if necessary

        let oneClickSpecs = {
            urlPattern,
            baseUrl,
            delimiter,
            walletDelimiter,
            restUrl,
        };

        console.log("oneClickSpecs from URL: ", oneClickSpecs);

        this.oneClickConnectSpecs = oneClickSpecs;
    }
}
