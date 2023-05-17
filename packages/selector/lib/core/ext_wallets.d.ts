import { Near } from '@near-js/wallet-account';
import { FinalExecutionOutcome, Transaction as wsTransaction } from '@near-wallet-selector/core';
export declare const SUPPORTED_EXT_WALLET_DATA: {
    testnet: {
        "near-wallet": {
            baseUrl: string;
        };
        "my-near-wallet": {
            baseUrl: string;
        };
        "sweat-wallet": {};
    };
    mainnet: {
        "near-wallet": {
            baseUrl: string;
        };
        "my-near-wallet": {
            baseUrl: string;
        };
        "sweat-wallet": {};
    };
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
export declare const extSignAndSendTransactions: ({ transactions, moduleId, accountId, secretKey, near }: RequestSignTransactionsOptions) => Promise<FinalExecutionOutcome[]>;
export {};
