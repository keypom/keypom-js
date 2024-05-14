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
    near: any;
}
/**
 * Requests the user to quickly sign for a transaction or batch of transactions by redirecting to the NEAR wallet.
 */
export declare const extSignAndSendTransactions: ({ transactions, walletId, accountId, secretKey, near, }: RequestSignTransactionsOptions) => Promise<any>;
export {};
