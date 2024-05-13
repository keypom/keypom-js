import { convertBasicTransaction, getPubFromSecret } from "@keypom/core";
import { Account } from "@near-js/accounts";
import { PublicKey } from "@near-js/crypto";
import {
    Transaction,
    actionCreators,
    stringifyJsonOrBytes,
} from "@near-js/transactions";
import { Near } from "@near-js/wallet-account";
import {
    FinalExecutionOutcome,
    FunctionCallAction,
    Transaction as wsTransaction,
} from "@near-wallet-selector/core";
import { keyHasPermissionForTransaction } from "../utils/selector-utils";
import { FAILED_EXECUTION_OUTCOME } from "./types";

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
    near: Near;
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
    let fakRequiredTxns: Transaction[] = [];
    let responses: FinalExecutionOutcome[] = [];

    const account = new Account(near.connection, accountId!);
    for (let i = 0; i < transactions.length; i++) {
        let txn = transactions[i];

        let mappedActions = txn.actions.map((a) => {
            const fcAction = a as FunctionCallAction;
            return actionCreators.functionCall(
                fcAction.params.methodName,
                stringifyJsonOrBytes(fcAction.params.args),
                BigInt(fcAction.params.gas), // Convert string to bigint
                BigInt(fcAction.params.deposit) // Convert string to bigint
            );
        });

        const pk = PublicKey.from(getPubFromSecret(secretKey));

        const transaction = await convertBasicTransaction({
            txnInfo: {
                receiverId: txn.receiverId,
                signerId: txn.signerId,
                actions: mappedActions,
            },
            signerId: accountId,
            signerPk: pk,
        });

        const accessKey: any = await near.connection.provider.query(
            `access_key/${accountId}/${pk}`,
            ""
        );

        const canExecuteTxn = await keyHasPermissionForTransaction(
            accessKey,
            txn.receiverId,
            mappedActions
        );
        console.log("canExecuteTxn", canExecuteTxn);

        if (canExecuteTxn) {
            try {
                console.log("Signing transaction", transaction);
                responses.push(
                    await account.signAndSendTransaction(transaction)
                );
            } catch (e: any) {
                console.error("Error signing transaction", e);
                fakRequiredTxns.push(transaction);
            }
        } else {
            fakRequiredTxns.push(transaction);
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
