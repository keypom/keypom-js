import * as nearAPI from "near-api-js";
import { Transaction as wsTransaction } from "@near-wallet-selector/core";
export declare const SUPPORTED_EXT_WALLET_DATA: {
    testnet: {
        "sweat-wallet": {};
    };
    mainnet: {
        "sweat-wallet": {};
    };
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
    addKey: boolean;
    contractId: string;
    methodNames: string[];
    allowance: string;
}
/**
 * Requests the user to quickly sign for a transaction or batch of transactions by redirecting to the NEAR wallet.
 */
export declare const extSignAndSendTransactions: ({ transactions, walletId, accountId, secretKey, near, walletUrl, addKey, contractId, methodNames, allowance }: RequestSignTransactionsOptions) => Promise<any>;
export {};
