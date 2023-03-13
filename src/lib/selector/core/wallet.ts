import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { Logger } from "@near-wallet-selector/core/lib/services";
import BN from "bn.js";
import { Account, Connection, KeyPair, Near, transactions } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { PublicKey } from "near-api-js/lib/utils";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { autoSignIn, createAction, getLocalStorageKeypomEnv, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv } from "../utils/keypom-lib";
import { genArgs } from "../utils/keypom-v2-utils";
import { KeypomWalletProtocol } from "./types";

export class KeypomWallet implements KeypomWalletProtocol {
    readonly networkId: string;
    private readonly near: Near;
    private readonly connection: Connection;
    private readonly desiredUrl: string;
    private readonly delimiter: string;

    private accountId?: string;
    private secretKey?: string;
    
    private publicKey?: PublicKey;
    private keyPair?: KeyPair;
    
    public constructor({
      networkId = "mainnet",
      desiredUrl = "/keypom-trial#",
      delimiter = "/",
      keyStore = new BrowserLocalStorageKeyStore()
    }) {
        console.log('Keypom constructor called.');

        this.networkId = networkId
        
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore },
        });
        this.connection = this.near.connection
        this.desiredUrl = desiredUrl
        this.delimiter = delimiter
        console.log("finished constructor");
    }

    public transformTransactions = (txns) => {
        this.assertSignedIn();

        const account = new Account(this.connection, this.accountId!);
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

    public tryInitFromLocalStorage(data) {
        if (data?.accountId && data?.secretKey && data?.keypomContractId) {
            this.accountId = data.accountId;
            this.secretKey = data.secretKey;
            const keyPair = KeyPair.fromString(data.secretKey);
            this.keyPair = keyPair
            console.log('Setting keyPair in try init: ', keyPair)
            this.publicKey = keyPair.getPublicKey()

            return true;
        }

        return false;
    }

    public assertSignedIn() {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    }
  
    // public getAccount() {
    //     this.assertSignedIn();
    //     const accountObj = new Account(this.connection, this.accountId!);
    //     return accountObj;
    // }
  
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

        this.accountId = this.accountId = this.keyPair = this.secretKey = this.publicKey = undefined;
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    public async getAvailableBalance(id?: string): Promise<BN> {
      // TODO: get access key allowance
        return new BN(0);
    }
  
    public async getAccounts(): Promise<Account[]> {
        if (this.accountId != undefined && this.accountId != null) {
            const accountObj = new Account(this.connection, this.accountId!);
            return [accountObj];
        }

        return []
    }
  
    public getAccountId() {
        this.assertSignedIn();
        return this.accountId!;
    }
  
    public async switchAccount(id: string) {
      // TODO:  maybe?
    }
  
    public async signIn({ contractId, methodNames }): Promise<Account[]> {
        console.log("IM SIGNING IN")
        console.log('contractId: ', contractId)
        console.log('methodNames: ', methodNames)
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
                const accountObj = new Account(this.connection, trialAccountId);
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
                 this.keyPair = keyPair;
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
                this.keyPair = keyPair;
                this.publicKey = publicKey;
                isValidTrialInfo = true;
                console.log('Valid trial info from cur env data. Setting data')
            }
        }

        if (!isValidTrialInfo) {
            throw new Error("Invalid trial info");
        }

        console.log("auto signing in!");
        // Auto sign in (mess with local storage)
        try {
            console.log("i am about to auto sign in")
            autoSignIn(this.accountId, this.secretKey, contractId, methodNames);
            console.log("auto sign in success!");
        } catch(e) {
            console.log('auto sign in error: ', e);
        }
 
        const accountObj = new Account(this.connection, this.accountId!);
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
        
        const args = genArgs({ transactions })
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
        const gasToAttach = new BN('35000000000000').add(new BN(incomingGas)).toString();
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