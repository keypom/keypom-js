import { getPubFromSecret, convertBasicTransaction } from '@keypom/core';
import { Account } from '@near-js/accounts';
import { PublicKey } from '@near-js/crypto';
import { SCHEMA, actionCreators, stringifyJsonOrBytes, Transaction } from '@near-js/transactions';
import { Near } from '@near-js/wallet-account';
import { FinalExecutionOutcome, FunctionCallAction, Transaction as wsTransaction } from '@near-wallet-selector/core';
import { baseDecode, serialize } from 'borsh';
import { keyHasPermissionForTransaction } from '../utils/selector-utils';

export const SUPPORTED_EXT_WALLET_DATA = {
    "testnet": {
        "near-wallet": {
            baseUrl: "https://wallet.testnet.near.org",
        },
        "my-near-wallet": {
            baseUrl: "https://testnet.mynearwallet.com",
        },
        "sweat-wallet": {
        }
    },
    "mainnet": {
        "near-wallet": {
            baseUrl: "https://wallet.near.org",
        },
        "my-near-wallet": {
            baseUrl: "https://app.mynearwallet.com",
        },
        "sweat-wallet": {
        }
    }
};

/**
 * Information to send NEAR wallet for signing transactions and redirecting the browser back to the calling application
 */
interface RequestSignTransactionsOptions {
    /** list of transactions to sign */
    transactions: wsTransaction[];

    moduleId: string;
    accountId: string;
    secretKey: string;
    near: Near;
}

/**
 * Requests the user to quickly sign for a transaction or batch of transactions by redirecting to the NEAR wallet.
 */
export const extSignAndSendTransactions = async ({ transactions, moduleId, accountId, secretKey, near }: RequestSignTransactionsOptions) => {
    let fakRequiredTxns: Transaction[] = [];
    let responses: FinalExecutionOutcome[] = [];

    const account = new Account(near.connection, accountId!);
    for (let i = 0; i < transactions.length; i++) {
        let txn = transactions[i];

        let mappedActions = txn.actions.map((a) => {
            const fcAction = a as FunctionCallAction
            return actionCreators.functionCall(
                fcAction.params.methodName,
                stringifyJsonOrBytes(fcAction.params.args),
                fcAction.params.gas,
                fcAction.params.deposit,
            )
        })

        const pk = PublicKey.from(getPubFromSecret(secretKey));

       const transaction = await convertBasicTransaction({
            txnInfo: {
                receiverId: txn.receiverId,
                signerId: txn.signerId,
                actions: mappedActions
            },
            signerId: accountId,
            signerPk: pk,
        })

        const accessKey: any = await near.connection.provider.query(
            `access_key/${accountId}/${pk}`,
            ''
        );

        const canExecuteTxn = await keyHasPermissionForTransaction(accessKey, txn.receiverId, mappedActions);

        if (canExecuteTxn) {
            try {
                responses.push(await account.signAndSendTransaction(transaction));
            } catch (e: any) {
                fakRequiredTxns.push(transaction);
            }
        } else {
            fakRequiredTxns.push(transaction);
        }
    }

    if(fakRequiredTxns.length > 0) {
        const currentUrl = new URL(window.location.href);
        const baseUrl = SUPPORTED_EXT_WALLET_DATA[near.connection.networkId][moduleId].baseUrl;
        const newUrl = new URL('sign', baseUrl);
    
        newUrl.searchParams.set('transactions', fakRequiredTxns
            .map(transaction => serialize(SCHEMA, transaction))
            .map(serialized => Buffer.from(serialized).toString('base64'))
            .join(','));
        newUrl.searchParams.set('callbackUrl', currentUrl.href);
    
        window.location.assign(newUrl.toString());
    }

    return responses;
}