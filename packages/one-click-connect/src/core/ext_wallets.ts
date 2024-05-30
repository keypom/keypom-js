import * as nearAPI from "near-api-js";
import { Transaction as wsTransaction } from "@near-wallet-selector/core";
import { serialize } from "borsh";
import {
    getPubFromSecret,
    keyHasPermissionForTransaction,
    setLocalStoragePendingKey,
} from "../utils/selector-utils";
import { FAILED_EXECUTION_OUTCOME } from "./types";
import { createAction } from "@near-wallet-selector/wallet-utils";
// import * as Transaction from "@near-js/transactions";
// import { transformTransactions } from "../utils/one-click-utils";

export const SUPPORTED_EXT_WALLET_DATA = {
    testnet: {
        "sweat-wallet": {},
    },
    mainnet: {
        "sweat-wallet": {},
    },
};

/**
 * Information to send NEAR wallet for signing transactions and redirecting the browser back to the calling application
 */
interface RequestSignTransactionsOptions {
    /** list of transactions to sign */
    transactions: wsTransaction[];

    walletId: string;
    accountId: string;
    secretKey: string;
    near: nearAPI.Near;
    walletUrl?: string;
    addKey: boolean
    contractId: string;
    methodNames: string[];
    allowance: string
}

/**
 * Requests the user to quickly sign for a transaction or batch of transactions by redirecting to the NEAR wallet.
 */
export const extSignAndSendTransactions = async ({
    transactions,
    walletId,
    accountId,
    secretKey,
    near,
    walletUrl,
    addKey,
    contractId,
    methodNames,
    allowance
}: RequestSignTransactionsOptions) => {
    let fakRequiredTxns: any = [];
    let responses: any = [];

    // user needs access key to be added
    if (secretKey === undefined) {
        console.warn("Secret key not provided");
        console.log("anyone home?")
        // TODO: add access key as part of txn request

        //keypair for testing
//         ed25519:4qi41RNMrCJ8oLdJFk7zdnBYxPezgHEjt6cytD4hFcV2x8z6mwfD6DvSdgCe1NKeXihsBjEQvvAa4GNQdkEi64yM
//         ed25519:7kfBxjQ7P2UQXYSzRkcAAxwDMLAjG6CYhauicas893eF
        let pk;
        if(addKey){
            // const new_key =  nearAPI.KeyPair.fromRandom("ed25519");
            const new_key = nearAPI.KeyPair.fromString("ed25519:4qi41RNMrCJ8oLdJFk7zdnBYxPezgHEjt6cytD4hFcV2x8z6mwfD6DvSdgCe1NKeXihsBjEQvvAa4GNQdkEi64yM");
            pk = new_key.getPublicKey().toString()
            console.log("pk being added to storage: ", pk);
            setLocalStoragePendingKey({
                secretKey: new_key.toString(),
                publicKey: pk,
                accountId
            })
        }

        // redirect to sign transaction
        const currentUrl = new URL(window.location.href);
        console.log("current URL: ", currentUrl)
        let walletBaseUrl: string; 
        let redirectUrl: string = "";
        switch (walletId) {
            case "sweat-wallet":
                if(walletUrl == undefined){
                    console.error("Sweat URL must be provided in initialization")
                }else{
                    const instructions = {
                        transactions,
                        redirectUrl: window.location.href,
                        limited_access_key: addKey ? {
                            public_key: pk,
                            contractId,
                            methodNames,
                            allowance
                        } : {}
                    }
    
                    const base64Instructions = Buffer.from(JSON.stringify(instructions)).toString('base64')
    
                    const newUrl = new URL(walletUrl);
                    newUrl.searchParams.set('instructions', base64Instructions);
                    console.log("SWEAT newUrl: ", newUrl.toString())
                }
                break;
            case "my-near-wallet":
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                const newUrl = new URL('sign', walletBaseUrl);
                const account = await near.account(accountId);

                try{
                    // const transformed_transactions = await transformTransactions(transactions, account)
                    // const txn_schema = Transaction.SCHEMA
                    // const serialized = serialize(txn_schema, transformed_transactions[0])
                    // newUrl.searchParams.set('transactions', transformed_transactions
                    //     .map(transaction => serialize(txn_schema, transaction))
                    //     .map(serialized => Buffer.from(serialized).toString('base64'))
                    //     .join(','));
                    // newUrl.searchParams.set('callbackUrl', currentUrl.href);
                    // //newUrl.searchParams.set('limitedAccessKey', new_key.getPublicKey().toString());
                    // console.log("redirecting to:", newUrl.toString());
                    redirectUrl = "foo"
                    // redirectUrl = newUrl.toString();
                }catch(e){
                    console.log("error NEW 2: ", e)
                }
                break;
            case "meteor-wallet":
                // walletBaseUrl = "https://wallet.meteorwallet.app/wallet/";
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                break;
            case "mintbase-wallet":
                // walletBaseUrl = "https://wallet.sweat.finance";
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                try{
                    const serializedTxn = encodeURI(JSON.stringify(transactions))

                    // mintbase specific stuff
                    // const newUrl = new URL(`${metadata.walletUrl}/sign-transaction`);
                    // newUrl.searchParams.set('transactions_data', urlParam);
                    // newUrl.searchParams.set('callback_url', cbUrl);
                    // window.location.assign(newUrl.toString());
                    console.log(serializedTxn)
                }catch(e){
                    console.log("error 3: ", e)
                }
                break;
            default:
                throw new Error(`Unsupported wallet ID: ${walletId}`);
        };

        console.log("redirect url: ", redirectUrl)

        if(redirectUrl !== "") window.location.assign(redirectUrl);
        return [];
    }

    const account = await near.account(accountId);
    const pk = getPubFromSecret(secretKey);
    for (let i = 0; i < transactions.length; i++) {
        let txn = transactions[i];

        const accessKey: any = await near.connection.provider.query(
            `access_key/${accountId}/${pk}`,
            ""
        );

        const canExecuteTxn = await keyHasPermissionForTransaction(
            accessKey,
            txn.receiverId,
            txn.actions
        );
        console.log("canExecuteTxn", canExecuteTxn);

        if (canExecuteTxn) {
            try {
                console.log("Signing transaction", txn);
                const response = await account.signAndSendTransaction({
                    receiverId: txn.receiverId,
                    actions: txn.actions.map((action) =>
                        createAction(action)
                    ) as any,
                });

                responses.push(response);
            } catch (e: any) {
                console.error("Error signing transaction", e);
                fakRequiredTxns.push(txn);
            }
        } else {
            fakRequiredTxns.push(txn);
        }
    }
    console.log("fakRequiredTxns", fakRequiredTxns);

    if (fakRequiredTxns.length > 0) {
        switch (walletId) {
            case "sweat-wallet":
                console.warn("Sweat wallet does not support FAK signing yet");
                return [FAILED_EXECUTION_OUTCOME];
            default:
                console.warn("Unsupported wallet ID: ", walletId);
                return [FAILED_EXECUTION_OUTCOME];
        }
    }

    return responses;
};
