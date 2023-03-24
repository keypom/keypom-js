import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account, KeyPair, Near, providers, transactions } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { PublicKey } from "near-api-js/lib/utils";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { initKeypom, officialKeypomContracts, updateKeypomContractId } from "../../keypom";
import { genArgs, getPubFromSecret } from "../../keypom-utils";
import { getKeyInformation } from "../../views";
import { KeypomTrialModal, setupModal } from "../modal/src";
import { MODAL_TYPE_IDS } from "../modal/src/lib/modal.types";
import { createAction, getLocalStorageKeypomEnv, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv } from "../utils/keypom-lib";
import { FAILED_EXECUTION_OUTCOME } from "./types";

export class KeypomWallet implements InstantLinkWalletBehaviour {
    readonly networkId: string;
    readonly signInContractId: string;
    
    private readonly near: Near;
    private readonly keyStore: BrowserLocalStorageKeyStore;
    private readonly desiredUrl: string;
    private readonly delimiter: string;
    
    private trialAccountId?: string;
    private secretKey?: string;

    private publicKey?: PublicKey;
    private readonly modalOptions?: any;
    private modal?: KeypomTrialModal;

    public constructor({
        signInContractId,
        networkId,
        desiredUrl,
        delimiter,
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
        this.desiredUrl = desiredUrl
        this.delimiter = delimiter
        console.log("finished constructor");

        this.modal = undefined
        this.modalOptions = modalOptions
    }

    getContractId(): string {
        return this.signInContractId;
    }

    getAccountId(): string {
        this.assertSignedIn();
        return this.trialAccountId!
    }

    public showModal = (modalType = {id: MODAL_TYPE_IDS.TRIAL_OVER}) => {
        console.log('modalType for show modal: ', modalType)
        this.modal?.show(modalType)
    }

    public checkValidTrialInfo = () => {
        return this.parseUrl() !== undefined || getLocalStorageKeypomEnv() != null;
    }

    private transformTransactions = (txns) => {
        this.assertSignedIn();

        const account = new Account(this.near.connection, this.trialAccountId!);
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

    private canExitTrial = async () => {
        try {
            const keyInfo = await this.viewMethod({
                contractId: this.trialAccountId!,
                methodName: 'get_key_information',
                args: {},
            })
            console.log('keyInfo: ', keyInfo)

            const floor = await this.viewMethod({
                contractId: this.trialAccountId!,
                methodName: 'get_floor',
                args: {},
            })
            console.log('floor: ', floor)

            const rules = await this.viewMethod({
                contractId: this.trialAccountId!,
                methodName: 'get_rules',
                args: {},
            })
            console.log('rules: ', rules)

            return keyInfo.trial_data.exit == true
        } catch (e: any) {
            console.log('error: ', e)
        }

        return false;
    }

    private validateTransactions = async (toValidate) => {
        console.log('toValidate: ', toValidate)

        let validInfo = {}
        try {
            const rules = await this.viewMethod({
                contractId: this.trialAccountId!,
                methodName: 'get_rules',
                args: {},
            })
            let contracts = rules.contracts.split(",");
            let amounts = rules.amounts.split(",");
            let methods = rules.methods.split(",");

            for (let i = 0; i < contracts.length; i++) {
                validInfo[contracts[i]] = {
                    maxDeposit: amounts[i],
                    allowableMethods: methods[i] == "*" ? "*" : methods[i].split(":")
                }
            }
        } catch (e: any) {
            console.log('error: ', e)
        }
        console.log('validInfo after view calls: ', validInfo)

        // Loop through each transaction in the array
        for (let i = 0; i < toValidate.length; i++) {
            const transaction = toValidate[i];
            console.log('transaction: ', transaction)

            const validInfoForReceiver = validInfo[transaction.receiverId];
            console.log('validInfoForReceiver: ', validInfoForReceiver)
            // Check if the contractId is valid
            if (!validInfoForReceiver) {
                console.log('!validInfo[transaction.receiverId]: ', !validInfo[transaction.receiverId])
                return false;
            }

            // Check if the method name is valid
            if (validInfoForReceiver.allowableMethods != "*" && !validInfoForReceiver.allowableMethods.includes(transaction.methodName)) {
                console.log('!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ', !validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName))
                return false;
            }

            // Check if the deposit is valid
            if (validInfoForReceiver.maxDeposit != "*" && new BN(transaction.deposit).gt(new BN(validInfoForReceiver.maxDeposit))) {
                console.log('new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ', new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)))
                return false;
            }
        }

        return true;
    }

    // Make a read-only call to retrieve information from the network
    private viewMethod = async ({ contractId, methodName, args = {} }) => {
        const provider = this.near.connection.provider;

        let res: any = await provider.query({
            request_type: 'call_function',
            account_id: contractId,
            method_name: methodName,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
            finality: 'optimistic',
        });

        return JSON.parse(Buffer.from(res.result).toString());
    }

    // Make a read-only call to retrieve information about a given access key
    private viewAccessKeyData = async ({accountId, publicKey, secretKey}:{
        accountId: string,
        secretKey?: string,
        publicKey?: string
    }) => {
        const provider = this.near.connection.provider;

        if (secretKey) {
            publicKey = getPubFromSecret(secretKey)
        }

        let res: any = await provider.query({
            request_type: "view_access_key",
            finality: "final",
            account_id: accountId,
            public_key: publicKey!,
        });
        console.log('res from view access key data: ', res)
        
        return res;
    }

    public parseUrl = () => {
        const split = window.location.href.split(this.desiredUrl);

        if (split.length != 2) {
            return;
        }

        const trialInfo = split[1];
        const [accountId, secretKey] = trialInfo.split(this.delimiter)
        console.log('accountId: ', accountId)
        console.log('secretKey: ', secretKey)

        if (!accountId || !secretKey) {
            return;
        }

        return {
            accountId,
            secretKey
        }
    }

    private assertSignedIn() {
        if (!this.trialAccountId) {
            throw new Error("Wallet not signed in");
        }
    }

    public async isSignedIn() {
        return this.trialAccountId != undefined && this.trialAccountId != null
    }

    async verifyOwner() {
        throw Error(
            "KeypomWallet:verifyOwner is deprecated"
        );
    }

    public async signOut() {
        if (this.trialAccountId == undefined || this.trialAccountId == null) {
            throw new Error("Wallet is already signed out");
        }

        this.trialAccountId = this.trialAccountId = this.secretKey = this.publicKey = undefined;
        await this.keyStore.removeKey(this.networkId, this.trialAccountId!);
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    public async getAvailableBalance(id?: string): Promise<BN> {
        // TODO: get access key allowance
        return new BN(0);
    }

    public async getAccounts(): Promise<Account[]> {
        if (this.trialAccountId != undefined && this.trialAccountId != null) {
            const accountObj = new Account(this.near.connection, this.trialAccountId!);
            return [accountObj];
        }

        return []
    }

    public async switchAccount(id: string) {
        // TODO:  maybe?
    }

    public async signIn(): Promise<Account[]> {
        console.log("IM SIGNING IN")
        
        await initKeypom({
            network: this.networkId
        })
        this.modal = setupModal(this.modalOptions);

        //this.modal?.show('claim-trial')

        // Keep track of whether or not the info coming from the URL is valid (account ID & secret key that exist)
        let isValidTrialInfo = false;
        const parsedData = this.parseUrl();
        console.log('parsedData: ', parsedData)

        // URL is valid
        if (parsedData !== undefined) {
            const { accountId, secretKey } = parsedData;

            // Check if this is an existing keypom drop that is claimable:
            try {
                if (officialKeypomContracts[this.networkId][accountId] === true) {
                    console.log('accountId is valid keypom contract ', accountId)
                    await updateKeypomContractId({
                        keypomContractId: accountId
                    })
    
                    const keyInfo = await getKeyInformation({
                        secretKey
                    })
                    console.log('keyInfo: ', keyInfo)
    
                    if (keyInfo !== null) {
                        this.modal?.show({
                            id: MODAL_TYPE_IDS.CLAIM_TRIAL,
                            meta: {
                                secretKey,
                                redirectUrlBase: this.desiredUrl,
                                delimiter: this.delimiter
                            }
                        });
                        return [];
                    }
                }
            } catch(e) {
                console.log('e checking if drop is from keypom: ', e)
            }
            
            try {
                const keyInfo = await this.viewAccessKeyData({accountId, secretKey});
                console.log('keyInfo: ', keyInfo)

                let keyPerms = keyInfo.permission.FunctionCall;
                console.log('keyPerms: ', keyPerms)
                // Check if accountKeys's length is 1 and it has a `public_key` field
                isValidTrialInfo = keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')
                console.log('isValidTrialInfo: ', isValidTrialInfo)
            } catch (e) {
                isValidTrialInfo = false;
                console.log('e: ', e)
            }

            // If the trial info is valid (i.e the account ID & secret key exist)
            if (isValidTrialInfo) {
                this.trialAccountId = accountId;
                this.secretKey = secretKey;

                let keyPair = KeyPair.fromString(secretKey);
                this.publicKey = keyPair.getPublicKey();

                const dataToWrite = {
                    accountId: this.trialAccountId,
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
                this.trialAccountId = accountId;
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
        await this.keyStore.setKey(this.networkId, this.trialAccountId!, KeyPair.fromString(this.secretKey!));

        const accountObj = new Account(this.near.connection, this.trialAccountId!);
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

        const shouldExit = await this.canExitTrial();
        if (shouldExit == true) {
            this.modal?.show({id: MODAL_TYPE_IDS.TRIAL_OVER});
            return [FAILED_EXECUTION_OUTCOME];
        }

        const { wrapped: args, toValidate } = genArgs({ transactions })
        const res = await this.validateTransactions(toValidate);
        console.log('res from validate transactions: ', res);

        if (res == false) {
            this.modal?.show({id: MODAL_TYPE_IDS.ERROR});
            return [FAILED_EXECUTION_OUTCOME];
        }

        console.log('args: ', args)

        const account = await this.near.account(this.trialAccountId!);

        let incomingGas = new BN("0");
        let numActions = 0;
        try {
            for (let i = 0; i < (args as any).transactions.length; i++) {
                let transaction = (args as any).transactions[i];
                console.log('transaction in gas loop: ', transaction)
                for (let j = 0; j < transaction.actions.length; j++) {
                    let action = transaction.actions[j];
                    console.log('action in gas loop: ', action)
                    let gasToAdd = action.params[`|kP|gas`].split(`|kS|`)[0].toString();
                    console.log('gasToAdd: ', gasToAdd)
                    incomingGas = incomingGas.add(new BN(gasToAdd));
                    numActions += 1
                }
            }
        } catch (e) {
            numActions = 1;
            console.log('e: ', e)
            incomingGas = new BN(`300000000000000`);
        }

        console.log('incomingGas: ', incomingGas.toString())
        // Take 15 TGas as a base for loading rules as well as 20 TGas for the callback.
        // For each action, add 15 TGas on top of that and then add the final incoming gas on top.
        let gasToAttach = new BN('15000000000000') // Loading rules
            .add(new BN('20000000000000')) // Callback
            .add(new BN('15000000000000').mul(new BN(numActions))) // Actions
            .add(incomingGas).toString(); // Incoming gas

        // check if the gas to attach is over 300 TGas and if it is, clamp it
        if (new BN(gasToAttach).gt(new BN('300000000000000'))) {
            console.log('gas to attach is over 300 TGas. Clamping it')
            gasToAttach = '300000000000000';
        }

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
        return await Promise.all(promises) as FinalExecutionOutcome[];
    }
}