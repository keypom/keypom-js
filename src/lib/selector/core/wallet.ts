import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account, KeyPair, Near, providers, transactions } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { PublicKey } from "near-api-js/lib/utils";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { getEnv, initKeypom, officialKeypomContracts, updateKeypomContractId } from "../../keypom";
import { genArgs, getPubFromSecret, viewAccessKeyData } from "../../keypom-utils";
import { getKeyInformation } from "../../views";
import { KeypomTrialModal, setupModal } from "../modal/src";
import { MODAL_TYPE_IDS } from "../modal/src/lib/modal.types";
import { createAction, getLocalStorageKeypomEnv, isKeypomDrop, isUnclaimedTrialDrop, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv } from "../utils/keypom-lib";
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
    private modal: KeypomTrialModal;

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

    public showModal = (modalType = {id: MODAL_TYPE_IDS.TRIAL_OVER}) => {
        console.log('modalType for show modal: ', modalType)
        this.modal.show(modalType)
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

    private internalSignIn = async (accountId, secretKey) => {
        console.log("internal sign in: ", accountId, " ", secretKey)
        this.trialAccountId = accountId;
        this.secretKey = secretKey;

        let keyPair = KeyPair.fromString(secretKey);
        this.publicKey = keyPair.getPublicKey();

        const dataToWrite = {
            accountId: this.trialAccountId,
            secretKey: this.secretKey
        }
        setLocalStorageKeypomEnv(dataToWrite);
        await this.keyStore.setKey(this.networkId, this.trialAccountId!, KeyPair.fromString(this.secretKey!));

        const accountObj = new Account(this.near.connection, this.trialAccountId!);
        return [accountObj];
    }

    private canExitTrial = async () => {
        const {viewCall} = getEnv();

        try {
            const keyInfo = await viewCall({
                contractId: this.trialAccountId!,
                methodName: 'get_key_information',
                args: {}
            })
            console.log(`keyInfo: `, keyInfo)

            const rules = await viewCall({
                contractId: this.trialAccountId!,
                methodName: 'get_rules',
                args: {}
            })
            console.log('rules: ', rules)

            return keyInfo.trial_data.exit == true
        } catch (e: any) {
            console.log('error: ', e)
        }

        return false;
    }

    private validateTransactions = async (toValidate) => {
        const {viewCall} = getEnv();
        console.log('toValidate: ', toValidate)

        let validInfo = {}
        try {
            const rules = await viewCall({
                contractId: this.trialAccountId!,
                methodName: 'get_rules',
                args: {}
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

    public parseUrl = () => {
        const split = window.location.href.split(this.desiredUrl);

        if (split.length != 2) {
            return;
        }

        const trialInfo = split[1];
        const [accountId, secretKey] = trialInfo.split(this.delimiter)

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
                                redirectUrlBase: this.desiredUrl,
                                delimiter: this.delimiter
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
            this.modal.show({id: MODAL_TYPE_IDS.TRIAL_OVER});
            return [FAILED_EXECUTION_OUTCOME];
        }

        const { wrapped: args, toValidate } = genArgs({ transactions })
        const res = await this.validateTransactions(toValidate);
        console.log('res from validate transactions: ', res);

        if (res == false) {
            this.modal.show({id: MODAL_TYPE_IDS.ERROR});
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