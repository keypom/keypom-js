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
import * as Transaction from "@near-js/transactions";
import { transformTransactions } from "../utils/one-click-utils";

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
}: RequestSignTransactionsOptions) => {
    let fakRequiredTxns: any = [];
    let responses: any = [];

    if (secretKey === undefined) {
        console.warn("Secret key not provided");
        console.log("anyone home?")
        // TODO: add access key as part of txn request
        const new_key =  nearAPI.KeyPair.fromRandom("ed25519");
        const pk = new_key.getPublicKey().toString()
        console.log("pk being added to storage: ", pk);
        setLocalStoragePendingKey({
            secretKey: new_key.toString(),
            publicKey: pk,
            accountId
        })

        // redirect to sign transaction
        const currentUrl = new URL(window.location.href);
        console.log("current URL: ", currentUrl)
        let walletBaseUrl: string; 
        switch (walletId) {
            case "my-near-wallet":
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                break;
            case "meteor-wallet":
                // walletBaseUrl = "https://wallet.meteorwallet.app/wallet/";
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                break;
            case "sweat-wallet":
                // walletBaseUrl = "https://wallet.sweat.finance";
                walletBaseUrl = near.connection.networkId == "mainnet" ? "https://app.mynearwallet.com/" : "https://testnet.mynearwallet.com/";
                break;
            default:
                throw new Error(`Unsupported wallet ID: ${walletId}`);
        };

        console.log("wallet base url: ", walletBaseUrl)

        // add button to keypom frontend instead of using guestbook

        const newUrl = new URL('sign', walletBaseUrl);
        console.log("a: ", newUrl.toString())
        console.log("txn to serialize: ", transactions);

        const account = await near.account(accountId);
        console.log("occ signer: ", account.connection.signer);
        const transformed_transactions = await transformTransactions(transactions, account)

        try{
            const txn_schema = Transaction.SCHEMA
            console.log("obj constructor: ", transformed_transactions[0].constructor());
            console.log("schema transaction inside: ", txn_schema);
            console.log("txn: ", transformed_transactions[0])
            console.log("schema at obj constructor: ", txn_schema.get(transformed_transactions[0].constructor()));
            const serialized = serialize(txn_schema, transformed_transactions[0])
            console.log(serialized)
        }catch(e){
            console.log("error NEW 2: ", e)
        }

        //mintbase
        // try{
        //     const serializedTxn = encodeURI(JSON.stringify(transactions[0]))
        //     console.log(serializedTxn)
        // }catch(e){
        //     console.log("error 3: ", e)
        // }


        newUrl.searchParams.set('transactions', transformed_transactions
            .map(transaction => serialize(nearAPI.transactions.SCHEMA, transaction))
            .map(serialized => Buffer.from(serialized).toString('base64'))
            .join(','));
        console.log("b: ", newUrl.toString())
        console.log("b: ", newUrl.toString())
        newUrl.searchParams.set('callbackUrl', currentUrl.href);
        console.log("c: ", newUrl.toString())
        newUrl.searchParams.set('limitedAccessKey', new_key.getPublicKey().toString());
        console.log("redirecting to:", newUrl.toString());
        // window.location.assign(newUrl.toString());
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
