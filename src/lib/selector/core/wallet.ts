import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account, KeyPair, Near } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { initKeypom } from "../../keypom";
import { viewAccessKeyData } from "../../keypom-utils";
import { KeypomTrialModal, setupModal } from "../modal/src";
import { MODAL_TYPE_IDS } from "../modal/src/lib/modal.types";
import { getLocalStorageKeypomEnv, isKeypomDrop, isUnclaimedTrialDrop, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv } from "../utils/keypom-lib";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: string;
    signInContractId: string;
    
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;
    trialBaseUrl: string;
    trialSplitDelim: string;
    
    trialAccountId?: string;
    trialSecretKey?: string;

    modal: KeypomTrialModal;

    public constructor({
        signInContractId,
        networkId,
        trialBaseUrl,
        trialSplitDelim,
        modalOptions
    }) {
        console.log('Keypom constructor called.');
        this.networkId = networkId
        this.signInContractId = signInContractId

        this.keyStore = new BrowserLocalStorageKeyStore();
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore: this.keyStore },
        });
        this.trialBaseUrl = trialBaseUrl
        this.trialSplitDelim = trialSplitDelim
        
        this.modal = setupModal(modalOptions);
        console.log("finished constructor");
    }

    getContractId(): string {
        return this.signInContractId;
    }

    getAccountId(): string {
        this.assertSignedIn();
        return this.trialAccountId!
    }


    public parseUrl = () => {
        const split = window.location.href.split(this.trialSplitDelim);

        if (split.length != 2) {
            return;
        }

        const trialInfo = split[1];
        const [accountId, secretKey] = trialInfo.split(this.trialSplitDelim)

        if (!accountId || !secretKey) {
            return;
        }

        return {
            accountId,
            secretKey
        }
    }

    public showModal = (modalType = {id: MODAL_TYPE_IDS.TRIAL_OVER}) => {
        console.log('modalType for show modal: ', modalType)
        this.modal.show(modalType)
    }

    public checkValidTrialInfo = () => {
        return this.parseUrl() !== undefined || getLocalStorageKeypomEnv() != null;
    }

    async isSignedIn() {
        return this.trialAccountId != undefined && this.trialAccountId != null
    }

    async verifyOwner() {
        throw Error(
            "KeypomWallet:verifyOwner is deprecated"
        );
    }

    async signOut() {
        if (this.trialAccountId == undefined || this.trialAccountId == null) {
            throw new Error("Wallet is already signed out");
        }

        this.trialAccountId = this.trialAccountId = this.trialSecretKey = undefined;
        await this.keyStore.removeKey(this.networkId, this.trialAccountId!);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    async getAvailableBalance(id?: string): Promise<BN> {
        // TODO: get access key allowance
        return new BN(0);
    }

    async getAccounts(): Promise<Account[]> {
        if (this.trialAccountId != undefined && this.trialAccountId != null) {
            const accountObj = new Account(this.near.connection, this.trialAccountId!);
            return [accountObj];
        }

        return []
    }

    async switchAccount(id: string) {
        // TODO:  maybe?
    }

    async signIn(): Promise<Account[]> {
        console.log("IM SIGNING IN")
        
        await initKeypom({
            network: this.networkId
        })

        const parsedData = this.parseUrl();

        // URL is valid (case 1 & 2)
        if (parsedData !== undefined) {
            let { accountId, secretKey } = parsedData;

            // Check if this is an existing keypom drop that is claimable (case 1)
            const isOriginalLink = isKeypomDrop(this.networkId, accountId);
            console.log(`isOriginalLink: `, isOriginalLink)
            
            // If the drop is from keypom, it is either unclaimed or claimed
            if (isOriginalLink) {
                try {
                    const isUnclaimed = await isUnclaimedTrialDrop(this.networkId, accountId, secretKey);
                    console.log(`isUnclaimed: `, isUnclaimed)
                    
                    // If the drop is unclaimed, we should show the unclaimed drop modal
                    if (isUnclaimed === true) {
                        this.modal.show({
                            id: MODAL_TYPE_IDS.CLAIM_TRIAL,
                            meta: {
                                secretKey,
                                redirectUrlBase: this.trialBaseUrl,
                                delimiter: this.trialSplitDelim
                            }
                        });
                        return [];
                    } else {
                        // If the drop is claimed, we should attempt to recover the drop
                        console.log("DROP IS CLAIMED. RECOVERY TODO");
                        accountId = "foobar";
                    }
                } catch(e) {
                    console.log('e checking if drop is from keypom: ', e)
                }
            }
            
            
            // Check if the account ID and secret key are valid and sign in accordingly
            try {
                const keyInfo = await viewAccessKeyData({accountId, secretKey});

                let keyPerms = keyInfo.permission.FunctionCall;
                console.log('keyPerms: ', keyPerms)
                // Check if accountKeys's length is 1 and it has a `public_key` field
                if (keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')) {
                    return this.internalSignIn(accountId, secretKey);
                }
            } catch (e) {
                console.log('e: ', e)
            }
        }

        // The URL is invalid or the trial info is incorrect. We should check local storage:
        const curEnvData = getLocalStorageKeypomEnv();
        console.log('trial info invalid. Cur env data: ', curEnvData)

        // If there is any
        if (curEnvData != null) {
            const { accountId, secretKey } = JSON.parse(curEnvData);
            return this.internalSignIn(accountId, secretKey);
        }

        // Invalid local storage info so return nothing
        return []
    }

    async signAndSendTransaction(params) {
        this.assertSignedIn();
        console.log('sign and send txn params: ', params)
        const { receiverId, actions } = params;

        let res;
        try {
            res = await this.signAndSendTransactions({
                transactions: [
                    {
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

    async signAndSendTransactions(params) {
        console.log('sign and send txns params inner: ', params)
        this.assertSignedIn();
        // const { transactions } = params;
        // console.log('transactions: ', transactions)

        // const promises = transformedTransactions.map((tx) => (account as any).signAndSendTransaction(tx));
        return await Promise.all([]) as FinalExecutionOutcome[];
    }

    private async internalSignIn (accountId, secretKey) {
        console.log("internal sign in: ", accountId, " ", secretKey)
        this.trialAccountId = accountId;
        this.trialSecretKey = secretKey;

        const dataToWrite = {
            accountId,
            secretKey
        }
        setLocalStorageKeypomEnv(dataToWrite);
        await this.keyStore.setKey(this.networkId, accountId, KeyPair.fromString(secretKey));

        const accountObj = new Account(this.near.connection, this.trialAccountId!);
        return [accountObj];
    }

    private assertSignedIn() {
        if (!this.trialAccountId) {
            throw new Error("Wallet not signed in");
        }
    }
}