import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import { Logger } from "@near-wallet-selector/core/lib/services";
import BN from "bn.js";
import { Account, Connection, KeyPair, Near, transactions } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { PublicKey } from "near-api-js/lib/utils";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { KeypomTrialModal, setupModal } from "../modal/src";
import { MODAL_TYPE } from "../modal/src/lib/modal";
import { autoSignIn, createAction, getLocalStorageKeypomEnv, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv, validateTransactions } from "../utils/keypom-lib";
import { genArgs } from "../utils/keypom-v2-utils";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    readonly networkId: string;
    readonly contractId: string;

    private readonly near: Near;
    private readonly keyStore: BrowserLocalStorageKeyStore;
    private readonly desiredUrl: string;
    private readonly delimiter: string;

    private accountId?: string;
    private secretKey?: string;
    
    private publicKey?: PublicKey;
    private readonly modalOptions?: any;
    private modal?: KeypomTrialModal;
    
    public constructor({
        contractId,
        networkId,
        desiredUrl,
        delimiter,
        modalOptions
    }) {
        console.log('Keypom constructor called.');
        this.networkId = networkId
        this.contractId = contractId
        
        this.keyStore = new BrowserLocalStorageKeyStore();
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore: this.keyStore },
        });
        this.desiredUrl = desiredUrl
        this.delimiter = delimiter
        console.log("finished constructor");

        this.modal = undefined
        this.modalOptions = modalOptions
    }
    
    getContractId(): string {
        return this.contractId;
    }

    getAccountId(): string {
        this.assertSignedIn();
        return this.accountId!
    }

    public showModal = () => {
        this.modal?.show()
    }

    public checkValidTrialInfo = () => {
        return this.parseUrl() !== undefined || getLocalStorageKeypomEnv() != null;
    }

    private transformTransactions = (txns) => {
        this.assertSignedIn();

        const account = new Account(this.near.connection, this.accountId!);
        const { networkId, signer, provider } = account.connection;
        
        return Promise.all(
            txns.map(async (transaction, index) => {
                const actions = transaction.actions.map((action) =>
                createAction(action)
                );
                
                console.log('actions: ', actions)
                const block = await provider.block({ finality: "final" });
                console.log('block: ', block)

                const accessKey: any = await provider.query(
                    `access_key/${account.accountId}/${this.publicKey!}`,
                    ""
                );
                console.log('accessKey: ', accessKey)
        
                return transactions.createTransaction(
                    account.accountId,
                    this.publicKey!,
                    transaction.receiverId,
                    accessKey.nonce + index + 1,
                    actions,
                    base_decode(block.header.hash)
                );
            })
        );
    }

    public parseUrl = () => {
        /// TODO validation
        const split = window.location.href.split(this.desiredUrl);
    
        if (split.length != 2) {
            return;
        }
        
        const trialInfo = split[1];
        const 	[trialAccountId, trialSecretKey] = trialInfo.split(this.delimiter)
        console.log('trialAccountId: ', trialAccountId)
        console.log('trialSecretKey: ', trialSecretKey)
    
        if (!trialAccountId || !trialSecretKey) {
            return;
        }

        return {
            trialAccountId,
            trialSecretKey
        }
    }

    private tryInitFromLocalStorage(data) {
        if (data?.accountId && data?.secretKey && data?.keypomContractId) {
            this.accountId = data.accountId;
            this.secretKey = data.secretKey;
            const keyPair = KeyPair.fromString(data.secretKey);
            console.log('Setting keyPair in try init: ', keyPair)
            this.publicKey = keyPair.getPublicKey()

            return true;
        }

        return false;
    }

    private assertSignedIn() {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    }
  
    public async isSignedIn() {
      return this.accountId != undefined && this.accountId != null
    }

    async verifyOwner() {
        throw Error(
          "KeypomWallet:verifyOwner is deprecated"
        );
    }

    public async signOut() {
        if (this.accountId == undefined || this.accountId == null) {
            throw new Error("Wallet is already signed out");
        }

        this.accountId = this.accountId = this.secretKey = this.publicKey = undefined;
        await this.keyStore.removeKey(this.networkId, this.accountId!);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    public async getAvailableBalance(id?: string): Promise<BN> {
      // TODO: get access key allowance
        return new BN(0);
    }
  
    public async getAccounts(): Promise<Account[]> {
        if (this.accountId != undefined && this.accountId != null) {
            const accountObj = new Account(this.near.connection, this.accountId!);
            return [accountObj];
        }

        return []
    }
  
    public async switchAccount(id: string) {
      // TODO:  maybe?
    }
  
    public async signIn(): Promise<Account[]> {
        console.log("IM SIGNING IN")
        // Keep track of whether or not the info coming from the URL is valid (account ID & secret key that exist)
        let isValidTrialInfo = false;
        const parsedData = this.parseUrl();
        console.log('parsedData: ', parsedData)
        
        // URL is valid
        if (parsedData !== undefined) {
            const { trialAccountId, trialSecretKey } = parsedData;
            let keyPair;
            let publicKey;
            
            try {
                const accountObj = new Account(this.near.connection, trialAccountId);
                keyPair = KeyPair.fromString(trialSecretKey);
                publicKey = keyPair.getPublicKey();
                console.log('publicKey: ', publicKey.toString())

                const accountKeys = await accountObj.getAccessKeys();
                console.log('accountKeys: ', accountKeys)
                
                // Check if accountKeys's length is 1 and it has a `public_key` field
                isValidTrialInfo = accountKeys[0].public_key == publicKey.toString()
                console.log('isValidTrialInfo: ', isValidTrialInfo)
            } catch(e) {
                isValidTrialInfo = false;
                console.log('e: ', e)
            }   

             // If the trial info is valid (i.e the account ID & secret key exist)
             if (isValidTrialInfo) {
                 this.accountId = trialAccountId;
                 this.secretKey = trialSecretKey;
                 this.publicKey = publicKey;
                 
                 const dataToWrite = {
                    accountId: this.accountId,
                    secretKey: this.secretKey
                }
                console.log('Trial info valid - setting data', dataToWrite)
                setLocalStorageKeypomEnv(dataToWrite);
             }
        }

        // If anything went wrong (URL invalid or account doesn't exist or secret key doesn't belong)
        // We can check current local storage data
        if (!isValidTrialInfo) {
            const curEnvData = getLocalStorageKeypomEnv();
            console.log('trial info invalid. Cur env data: ', curEnvData)
            
            // If there is any
            if (curEnvData != null) {
                const { accountId, secretKey } = JSON.parse(curEnvData);
                this.accountId = accountId;
                this.secretKey = secretKey;
                
                const keyPair = KeyPair.fromString(secretKey);
                const publicKey = keyPair.getPublicKey();
                this.publicKey = publicKey;
                isValidTrialInfo = true;
                console.log('Valid trial info from cur env data. Setting data')
            }
        }

        if (!isValidTrialInfo) {
            console.log("no valid trial info. returning")
            return []
        }

        console.log("auto signing in!");
        await this.keyStore.setKey(this.networkId, this.accountId!, KeyPair.fromString(this.secretKey!));
        this.modal = setupModal(this.modalOptions);

        const accountObj = new Account(this.near.connection, this.accountId!);
        return [accountObj];
    }
  
    public async signAndSendTransaction(params) {
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
  
    public async signAndSendTransactions(params) {
        console.log('sign and send txns params inner: ', params)
        this.assertSignedIn();
        const { transactions } = params;
        console.log('transactions: ', transactions)
        
        const {wrapped: args, toValidate} = genArgs({ transactions })
        const res = await validateTransactions(toValidate, this.accountId!);
        console.log('res from validate transactions: ', res);

        if (res == false) {
            this.modal?.show(MODAL_TYPE.ERROR);
            return [] as FinalExecutionOutcome[];
        }
        
        console.log('args: ', args)

        const account = await this.near.account(this.accountId!);

        let incomingGas;
        try {
            incomingGas = (args as any).transactions[0].actions[0].params[`|kP|gas`].split(`|kS|`)[0].toString();
        } catch(e) {
            console.log('e: ', e)
            incomingGas = `200000000000000`;
        }

        console.log('incomingGas: ', incomingGas)
        const gasToAttach = new BN('170000000000000').add(new BN(incomingGas)).toString();
        console.log('gasToAttach: ', gasToAttach)

        const transformedTransactions = await this.transformTransactions([{
            receiverId: account.accountId,
            actions: [{
                type: 'FunctionCall',
                params: {
                    methodName: 'execute',
                    args,
                    gas: gasToAttach,
                }
            }]
        }])
        console.log("debugging")
        console.log('transformedTransactions: ', transformedTransactions)

        const promises = transformedTransactions.map((tx) => (account as any).signAndSendTransaction(tx));
        return await Promise.all(promises)as FinalExecutionOutcome[];
    }
}