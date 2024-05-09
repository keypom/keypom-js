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
    `(.*)ACCOUNT_ID(.*)SECRET_KEY(.*)MODULE_ID`
);

export class KeypomWallet implements InstantLinkWalletBehaviour {
    accountId?: string;
    secretKey?: string;
    moduleId?: string;
    contractId?: string;

    near: Near;
    keyStore: BrowserLocalStorageKeyStore;

    oneClickConnectSpecs?: InternalOneClickSpecs;

    public constructor({ networkId, url }: { networkId: string; url: string }) {
        console.log("Initializing OneClick Connect");

        this.keyStore = new BrowserLocalStorageKeyStore();
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore: this.keyStore },
        });

        this.setSpecsFromKeypomParams(url);
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
        moduleId: string
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
                return this.internalSignIn(accountId, secretKey, moduleId);
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
        moduleId: string;
    } | null => {
        console.log("CheckValidOneClick");

        let oneClickData: {
            accountId: string;
            secretKey: string;
            moduleId: string;
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
                    oneClickSignInData.moduleId
                ] !== undefined;

            if (!isModuleSupported) {
                console.warn(
                    `Module ID ${oneClickSignInData.moduleId} is not supported on ${networkId}.`
                );
                return [];
            }

            return this.signInInstantAccount(
                oneClickSignInData.accountId,
                oneClickSignInData.secretKey,
                oneClickSignInData.moduleId
            );
        }

        // Try to sign in using data from local storage if URL does not contain valid one click sign-in data
        const curEnvData = getLocalStorageKeypomEnv();
        if (curEnvData !== null) {
            const { accountId, secretKey, moduleId } = JSON.parse(curEnvData);
            return this.internalSignIn(accountId, secretKey, moduleId);
        }

        return [];
    }

    async signOut() {
        if (this.accountId === undefined || this.accountId === null) {
            throw new Error("Wallet is already signed out");
        }

        this.accountId = this.secretKey = this.moduleId = undefined;
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
            moduleId: this.moduleId!,
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

    private async internalSignIn(accountId, secretKey, moduleId) {
        console.log(
            `internalSignIn accountId ${accountId} secretKey ${secretKey} moduleId ${moduleId}`
        );
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.moduleId = moduleId;

        const dataToWrite = {
            accountId,
            secretKey,
            moduleId,
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

    private setSpecsFromKeypomParams(url: string) {
        // Get the base URL and delimiter by splitting the URL using ACCOUNT_ID, SECRET_KEY, and MODULE_ID
        const matches = url.match(ONE_CLICK_URL_REGEX);
        const baseUrl = matches?.[1]!;
        const delimiter = matches?.[2]!;
        const moduleDelimiter = matches?.[3]!;

        let oneClickSpecs = {
            url,
            baseUrl,
            delimiter,
            moduleDelimiter,
        };
        console.log("oneClickSpecs from URL: ", oneClickSpecs);

        this.oneClickConnectSpecs = oneClickSpecs;
    }
}
