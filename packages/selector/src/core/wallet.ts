import { TRIAL_ERRORS, getPubFromSecret, initKeypom, isUnclaimedTrialDrop, networks, trialSignAndSendTxns, viewAccessKeyData } from '@keypom/core';
import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { BrowserLocalStorageKeyStore } from '@near-js/keystores-browser';
import { FinalExecutionOutcome } from '@near-js/types';
import { Near } from '@near-js/wallet-account';
import { InstantLinkWalletBehaviour, Transaction } from '@near-wallet-selector/core';
import BN from 'bn.js';
import { KeypomTrialModal, setupModal } from '../modal/src';
import { MODAL_TYPE_IDS, ModalCustomizations } from '../modal/src/lib/modal.types';
import { KEYPOM_LOCAL_STORAGE_KEY, addUserToMappingContract, getAccountFromMap, getLocalStorageKeypomEnv, parseInstantSignInUrl, parseTrialUrl, setLocalStorageKeypomEnv, updateKeypomContractIfValid } from '../utils/selector-utils';
import { SUPPORTED_EXT_WALLET_DATA, extSignAndSendTransactions } from './ext_wallets';
import { BaseSignInSpecs, FAILED_EXECUTION_OUTCOME, InstantSignInSpecs, InternalInstantSignInSpecs, KEYPOM_MODULE_ID, TrialSignInSpecs } from './types';
export class KeypomWallet implements InstantLinkWalletBehaviour {
    accountId?: string;
    secretKey?: string;
    moduleId?: string;

    signInContractId: string;
    
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;

    trialAccountSpecs?: TrialSignInSpecs;
    instantSignInSpecs?: InternalInstantSignInSpecs;

    modal: KeypomTrialModal;

    public constructor({
        signInContractId,
        networkId,
        trialAccountSpecs,
        instantSignInSpecs,
        modalOptions
    }: {
        signInContractId: string;
        networkId: string;
        trialAccountSpecs?: BaseSignInSpecs;
        instantSignInSpecs?: InstantSignInSpecs;
        modalOptions: ModalCustomizations;
    }) {
        console.log('Initializing Keypom');
        this.signInContractId = signInContractId;

        this.keyStore = new BrowserLocalStorageKeyStore();
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore: this.keyStore },
        });

        let trialSpecs: TrialSignInSpecs | undefined = undefined;
        if (trialAccountSpecs !== undefined) {
            trialSpecs = {
                ...trialAccountSpecs,
                isMappingAccount: false
            }
        }

        this.trialAccountSpecs = trialSpecs;
        this.instantSignInSpecs = instantSignInSpecs;
        
        this.modal = setupModal(modalOptions);
    }

    getContractId(): string {
        return this.signInContractId;
    }

    getAccountId(): string {
        this.assertSignedIn();
        return this.accountId!;
    }

    async isSignedIn() {
        return this.accountId !== undefined && this.accountId !== null;
    }

    async signInTrialAccount(accountId, secretKey): Promise<Account[]> {
        // Check if this is an existing keypom drop that is claimable (case 1)
        const isOriginalLink = updateKeypomContractIfValid(accountId);
        console.log('isOriginalLink: ', isOriginalLink);
        
        // If the drop is from keypom, it is either unclaimed or claimed
        if (isOriginalLink) {
            try {
                const isUnclaimed = await isUnclaimedTrialDrop({keypomContractId: accountId, secretKey});
                console.log('isUnclaimed: ', isUnclaimed);
                
                // If the drop is unclaimed, we should show the unclaimed drop modal
                if (isUnclaimed === true) {
                    this.modal.show({
                        id: MODAL_TYPE_IDS.BEGIN_TRIAL,
                        meta: {
                            secretKey,
                            redirectUrlBase: this.trialAccountSpecs!.baseUrl,
                            delimiter: this.trialAccountSpecs!.delimiter,
                        }
                    });
                    return [];
                } else {
                    // If the drop is claimed, we should attempt to recover the drop
                    console.log('DROP IS CLAIMED. RECOVERY TODO');
                    accountId = await getAccountFromMap(secretKey);
                }
            } catch(e) {
                console.log('e checking if drop is from keypom: ', e);
            }
        }
        
        // Check if the account ID and secret key are valid and sign in accordingly
        try {
            const keyInfo = await viewAccessKeyData({accountId, secretKey});

            const keyPerms = keyInfo.permission.FunctionCall;
            // Check if accountKeys's length is 1 and it has a `public_key` field
            if (keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')) {
                // Check if the account exists in the mapping contract. If they do, don't do anything. If they
                // Don't, add them to the mapping contract
                const isAdding = await addUserToMappingContract(accountId, secretKey);
                
                if (isAdding) {
                    this.trialAccountSpecs!.isMappingAccount = true;
                }
                return this.internalSignIn(accountId, secretKey, KEYPOM_MODULE_ID);
            }
        } catch (e) {
            console.log('e: ', e);
        }

        // Invalid local storage info so return nothing
        return [];
    }

    async signInInstantAccount(accountId, secretKey, moduleId): Promise<Account[]> {
         // Check if the account ID and secret key are valid and sign in accordingly
         try {
            const account = new Account(this.near.connection, accountId);
            const allKeys = await account.getAccessKeys();
            const pk = getPubFromSecret(secretKey);

            const keyInfoView = allKeys.find(({public_key}) => public_key === pk);

            if (keyInfoView) {
                return this.internalSignIn(accountId, secretKey, moduleId);
            }
        } catch (e) {
            console.log('e: ', e);
        }

        return [];
    }

    async signIn(): Promise<Account[]> {        
        await initKeypom({
            network: this.near.connection.networkId
        });

        let instantSignInData = this.instantSignInSpecs !== undefined ? parseInstantSignInUrl(this.instantSignInSpecs) : undefined;
        console.log('instantSignInData: ', instantSignInData)
        if (instantSignInData !== undefined) {
            if (SUPPORTED_EXT_WALLET_DATA[this.near.connection.networkId!][instantSignInData.moduleId] === undefined) {
                console.warn(`Module ID ${instantSignInData.moduleId} is not supported on ${this.near.connection.networkId}.`)
                return [];
            }
            
            return this.signInInstantAccount(instantSignInData.accountId, instantSignInData.secretKey, instantSignInData.moduleId);
        }
        
        let trialData = this.trialAccountSpecs !== undefined ? parseTrialUrl(this.trialAccountSpecs) : undefined;
        if (trialData !== undefined) {
            return this.signInTrialAccount(trialData.accountId, trialData.secretKey);
        }

        // If the URL doesn't match the instant sign in or the trial data, resort to local storage.
        const curEnvData = getLocalStorageKeypomEnv();

        // If there is any data in local storage, default to that otherwise return empty array
        if (curEnvData !== null) {
            const { accountId, secretKey, moduleId } = JSON.parse(curEnvData);
            return this.internalSignIn(accountId, secretKey, moduleId);
        }

        return [];
    }

    async signOut() {
        if (this.accountId === undefined || this.accountId === null) {
            throw new Error('Wallet is already signed out');
        }

        this.accountId = this.secretKey = this.moduleId = undefined;
        await this.keyStore.removeKey(this.near.connection.networkId, this.accountId!);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    async signAndSendTransaction(params) {
        this.assertSignedIn();
        console.log('sign and send txn params: ', params);
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

    async signAndSendTransactions(params: {transactions: Transaction[]}) {
        console.log('sign and send txns params inner: ', params);
        this.assertSignedIn();
        const { transactions } = params;

        let res: FinalExecutionOutcome[] = [];
        if (this.moduleId === KEYPOM_MODULE_ID) {
            try {
                if (!this.trialAccountSpecs!.isMappingAccount) {
                    addUserToMappingContract(this.accountId!, this.secretKey!);
                }
                res = await trialSignAndSendTxns({
                    trialAccountId: this.accountId!,
                    trialAccountSecretKey: this.secretKey!,
                    txns: transactions
                });
            } catch(e) {
                console.log(`e: ${JSON.stringify(e)}`);
                switch (e) {
                    case TRIAL_ERRORS.EXIT_EXPECTED: {
                        this.modal.show({
                            id: MODAL_TYPE_IDS.TRIAL_OVER, 
                            meta: {
                                accountId: this.accountId!,
                                secretKey: this.secretKey!
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
                        console.log('Unidentified error when signing txn: ', e);
                        break;
                    }
                }
                return [FAILED_EXECUTION_OUTCOME];
            }
        } else {
            return await extSignAndSendTransactions({
                transactions,
                moduleId: this.moduleId!,
                accountId: this.accountId!,
                secretKey: this.secretKey!,
                near: this.near
            })
        }
        console.log('res sign & send txn: ', res)
        return res;
    }

    public showModal = (modalType = {id: MODAL_TYPE_IDS.TRIAL_OVER}) => {
        console.log('modalType for show modal: ', modalType);
        this.modal.show(modalType);
    };

    public checkValidTrialInfo = () => {
        let instantSignInData = this.instantSignInSpecs !== undefined ? parseInstantSignInUrl(this.instantSignInSpecs) : undefined;
        let trialData = this.trialAccountSpecs !== undefined ? parseTrialUrl(this.trialAccountSpecs) : undefined;
        
        return instantSignInData !== undefined || trialData !== undefined || getLocalStorageKeypomEnv() !== null;
    };

    async verifyOwner() {
        throw Error(
            'KeypomWallet:verifyOwner is deprecated'
        );
    }

    async getAvailableBalance(id?: string): Promise<BN> {
        // TODO: get access key allowance
        return new BN(0);
    }

    async getAccounts(): Promise<Account[]> {
        if (this.accountId != undefined && this.accountId != null) {
            const accountObj = new Account(this.near.connection, this.accountId!);
            return [accountObj];
        }

        return [];
    }

    async switchAccount(id: string) {
        // TODO:  maybe?
    }

    private async internalSignIn (accountId, secretKey, moduleId) {
        console.log(`internalSignIn accountId ${accountId} secretKey ${secretKey} moduleId ${moduleId}`);
        this.accountId = accountId;
        this.secretKey = secretKey;
        this.moduleId = moduleId

        const dataToWrite = {
            accountId,
            secretKey,
            moduleId
        };
        setLocalStorageKeypomEnv(dataToWrite);
        await this.keyStore.setKey(this.near.connection.networkId, accountId, KeyPair.fromString(secretKey));

        const accountObj = new Account(this.near.connection, accountId);
        return [accountObj];
    }

    private assertSignedIn() {
        if (!this.accountId) {
            throw new Error('Wallet not signed in');
        }
    }
}