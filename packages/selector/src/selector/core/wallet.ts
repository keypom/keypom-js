import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { BrowserLocalStorageKeyStore } from "@near-js/keystores-browser";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { InstantLinkWalletBehaviour, Transaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { KeypomTrialModal, setupModal } from "../modal/src";
import { MODAL_TYPE_IDS } from "../modal/src/lib/modal.types";
import { KEYPOM_LOCAL_STORAGE_KEY, addUserToMappingContract, getAccountFromMap, getLocalStorageKeypomEnv, setLocalStorageKeypomEnv, updateKeypomContractIfValid } from "../utils/selector-utils";
import { FAILED_EXECUTION_OUTCOME } from "./types";
import { TRIAL_ERRORS, initKeypom, isUnclaimedTrialDrop, networks, trialSignAndSendTxns, viewAccessKeyData } from "@keypom/core";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: string;
    signInContractId: string;
    
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;
    trialBaseUrl: string;
    trialSplitDelim: string;
    
    trialAccountId?: string;
    trialSecretKey?: string;

    isMappingAccount: boolean;

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

        this.isMappingAccount = false;
        
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

    async isSignedIn() {
        return this.trialAccountId != undefined && this.trialAccountId != null
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
            const isOriginalLink = updateKeypomContractIfValid(accountId);
            console.log(`isOriginalLink: `, isOriginalLink)
            
            // If the drop is from keypom, it is either unclaimed or claimed
            if (isOriginalLink) {
                try {
                    const isUnclaimed = await isUnclaimedTrialDrop({keypomContractId: accountId, secretKey});
                    console.log(`isUnclaimed: `, isUnclaimed)
                    
                    // If the drop is unclaimed, we should show the unclaimed drop modal
                    if (isUnclaimed === true) {
                        this.modal.show({
                            id: MODAL_TYPE_IDS.BEGIN_TRIAL,
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
                        accountId = await getAccountFromMap(secretKey);
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

    async signOut() {
        if (this.trialAccountId == undefined || this.trialAccountId == null) {
            throw new Error("Wallet is already signed out");
        }

        this.trialAccountId = this.trialAccountId = this.trialSecretKey = undefined;
        await this.keyStore.removeKey(this.networkId, this.trialAccountId!);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
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
                        signerId: this.trialAccountId!,
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

    async signAndSendTransactions(params: {transactions: Transaction[]}) {
        console.log('sign and send txns params inner: ', params)
        this.assertSignedIn();
        const { transactions } = params;

        try {
            console.log('is mapping txn', this.isMappingAccount)
            if (!this.isMappingAccount) {
                addUserToMappingContract(this.trialAccountId!, this.trialSecretKey!);
            }
            var res = await trialSignAndSendTxns({
                trialAccountId: this.trialAccountId!,
                trialAccountSecretKey: this.trialSecretKey!,
                txns: transactions
            })
        } catch(e) {
            console.log(`e: ${JSON.stringify(e)}`)
            switch (e) {
                case TRIAL_ERRORS.EXIT_EXPECTED: {
                    this.modal.show({
                        id: MODAL_TYPE_IDS.TRIAL_OVER, 
                        meta: {
                            accountId: this.trialAccountId!,
                            secretKey: this.trialSecretKey!
                        }
                    });
                    break;
                }
                case TRIAL_ERRORS.INVALID_ACTION: {
                    this.modal.show({id: MODAL_TYPE_IDS.ACTION_ERROR});
                    break;
                }
                case TRIAL_ERRORS.INSUFFICIENT_BALANCE: {
                    this.modal.show({id: MODAL_TYPE_IDS.INSUFFICIENT_BALANCE});
                    break;
                }
                default: {
                    console.log('Unidentified error when signing txn: ', e)
                    break;
                }
            }
            return [FAILED_EXECUTION_OUTCOME];
        }
        return res
    }

    private parseUrl = () => {
        console.log('this.trialBaseUrl: ', this.trialBaseUrl)
        const split = window.location.href.split(this.trialBaseUrl);
        console.log('split: ', split)

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

    async verifyOwner() {
        throw Error(
            "KeypomWallet:verifyOwner is deprecated"
        );
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

        // Check if the account exists in the mapping contract. If they do, don't do anything. If they
        // Don't, add them to the mapping contract
        const isAdding = await addUserToMappingContract(accountId, secretKey);

        if (isAdding) {
            this.isMappingAccount = true;
        }

        const accountObj = new Account(this.near.connection, this.trialAccountId!);
        return [accountObj];
    }

    private assertSignedIn() {
        if (!this.trialAccountId) {
            throw new Error("Wallet not signed in");
        }
    }
}