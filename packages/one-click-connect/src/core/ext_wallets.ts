import { convertBasicTransaction, getPubFromSecret } from "@keypom/core";
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
    near: any;
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
        // TODO: add access key as part of txn request
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
                responses.push(await account.signAndSendTransaction(txn));
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
